import {
  ActiveBattle,
  ActiveResearchProject,
  ActiveWar,
  ArmyMovement,
  CrisisEventDefinition,
  DiplomaticRelation,
  GameModeId,
  Nation,
  QueuedBuildingConstruction,
  SpeedLevel,
  Territory,
  UnitComposition,
  WorldNewsEvent,
} from '../types/game';
import { TacticalBattleState } from '../types/tacticalBattle';
import {
  BUILDINGS,
  COMMANDERS,
  CRISIS_EVENTS,
  getNationModernizedTier,
  getTechTreeForMode,
} from '../data/world2026Data';
import { RELIGIONS } from '../data/religionAndCultureData';
import {
  calculateNationEconomy,
  formatGameDate,
  isAtWar,
} from './simulationEngine';
import {
  evaluateMultiProvinceAiTurn,
  evaluateWartimeAiOperations,
  evaluateWeeklyUnrestAndRebellions,
} from './aiAndRebellionEngine';
import {
  evaluateWeeklyLordLoyaltyAndRebellions,
  processWeeklyBannerlordUpdates,
} from './pashaAndFiefEngine';
import { classifyTerritoryTraversal } from './pathfindingEngine';
import {
  checkStraitMilitaryBlockade,
  evaluateActiveStraits,
} from './straitsAndTradeEngine';
import { GameSettings } from './gameSettings';

export function scaleUnits(
  units: UnitComposition,
  ratio: number
): UnitComposition {
  const safeRatio = Math.max(0, Math.min(1, ratio));
  return {
    infantry: Math.max(0, Math.round((units?.infantry || 0) * safeRatio)),
    armor: Math.max(0, Math.round((units?.armor || 0) * safeRatio)),
    airDrone: Math.max(0, Math.round((units?.airDrone || 0) * safeRatio)),
  };
}

function computeUnitWeightedPower(
  units: UnitComposition | undefined,
  totalTroops: number,
  nation: Nation | undefined
): number {
  const inf = units?.infantry ?? totalTroops;
  const arm = units?.armor ?? 0;
  const air = units?.airDrone ?? 0;
  const sumUnits = inf + arm + air;
  const baseWeighted =
    sumUnits > 0
      ? inf * 1.0 + arm * 1.45 + air * 1.65
      : Math.max(100, totalTroops);
  const scaleFactor = sumUnits > 0 ? totalTroops / sumUnits : 1;
  const tierBonus = 1 + getNationModernizedTier(nation) * 0.12;
  return Math.max(100, baseWeighted * scaleFactor * tierBonus);
}

export type TickSoundCue =
  | 'SELECT_TERRITORY'
  | 'MARCH'
  | 'TREATY'
  | 'WAR_HORN';

export interface GameTickInput {
  tick: number;
  hour?: number;
  hoursStep?: number;
  speed: SpeedLevel;
  gameMode: GameModeId;
  playerNationId: string;
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  battles: ActiveBattle[];
  movements: ArmyMovement[];
  newsEvents: WorldNewsEvent[];
  settings: GameSettings;
}

export interface GameTickOutput {
  nextTick: number;
  nextHour: number;
  dayWrapped: boolean;
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  battles: ActiveBattle[];
  movements: ArmyMovement[];
  newsEvents: WorldNewsEvent[];
  triggeredTacticalBattle: TacticalBattleState | null;
  triggeredCrisis: CrisisEventDefinition | null;
  shouldPause: boolean;
  toasts: string[];
  sounds: TickSoundCue[];
}

export function pickEligibleCrisisEvent(
  gameMode: GameModeId
): CrisisEventDefinition {
  const is1440 = gameMode === 'EMPIRES_1440';
  const eligibleEvents = CRISIS_EVENTS.filter((ev) => {
    if (is1440) {
      return (
        ev.id.startsWith('crisis_yeniceri') ||
        ev.id.startsWith('crisis_silk_road') ||
        ev.id.startsWith('crisis_sahi') ||
        ev.id.startsWith('crisis_timar') ||
        ev.id === 'crisis_military_mobilization' ||
        ev.id === 'crisis_inflation_wave'
      );
    }
    return (
      !ev.id.startsWith('crisis_yeniceri') &&
      !ev.id.startsWith('crisis_sahi') &&
      !ev.id.startsWith('crisis_timar')
    );
  });
  const pool = eligibleEvents.length > 0 ? eligibleEvents : CRISIS_EVENTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Pure, single-pass atomic tick engine supporting both hourly steps (1..6 hours) and full-day ticks (24 hours).
 * - Preserves reference equality for `nations` and `territories` on hourly ticks when no territory/nation mutates,
 *   preventing unnecessary React re-renders and canvas polygon rebuilds (eliminating FPS drops during AI army movements).
 * - Simulates all battles directly on the World Map in real time (Age of History 3 style) without freezing gameplay.
 */
export function computeGameTick(input: GameTickInput): GameTickOutput {
  const isSubDayMode =
    typeof input.hoursStep === 'number' && input.hoursStep < 24;
  const hoursStep = input.hoursStep ?? 24;
  const prevHour = input.hour ?? 8;
  const totalHours = prevHour + hoursStep;
  const dayWrapped = !isSubDayMode || totalHours >= 24;
  const nextHour = isSubDayMode ? ((totalHours % 24) + 24) % 24 : prevHour;
  const nextTick = dayWrapped ? input.tick + 1 : input.tick;

  const { gameMode, playerNationId, relations, settings } = input;

  // Lazy copy-on-write references so pure movement ticks don't invalidate territories/nations references!
  let nationsCloned = false;
  let territoriesCloned = false;
  let nextNations: Record<string, Nation> = input.nations;
  let nextTerritories: Record<string, Territory> = input.territories;
  let nextRelations: Record<string, DiplomaticRelation> = input.relations;
  let nextWars: ActiveWar[] = input.wars;
  let nextMovements: ArmyMovement[] = [];
  let nextNewsEvents: WorldNewsEvent[] = input.newsEvents;
  let nextBattles: ActiveBattle[] = [...input.battles];

  const writeNation = (id: string, nat: Nation) => {
    if (!nationsCloned) {
      nextNations = { ...nextNations };
      nationsCloned = true;
    }
    nextNations[id] = nat;
  };

  const writeTerritory = (id: string, terr: Territory) => {
    if (!territoriesCloned) {
      nextTerritories = { ...nextTerritories };
      territoriesCloned = true;
    }
    nextTerritories[id] = terr;
  };

  const toasts: string[] = [];
  const sounds: TickSoundCue[] = [];
  const triggeredTacticalBattle: TacticalBattleState | null = null;
  let triggeredCrisis: CrisisEventDefinition | null = null;
  let shouldPause = false;

  const appendNews = (
    title: string,
    description: string,
    type: WorldNewsEvent['type']
  ) => {
    nextNewsEvents = [
      {
        id: `news_${nextTick}_${Math.random().toString(36).slice(2, 8)}`,
        tick: nextTick,
        dateStr: formatGameDate(nextTick, gameMode),
        title,
        description,
        type,
      },
      ...nextNewsEvents.slice(0, 39),
    ];
  };

  // 1. Advance Army Movements (including multi-hop A* routeQueue) & Start / Reinforce On-Map Battles (AoH3 Style)
  if (input.movements.length > 0) {
    const arrived: ArmyMovement[] = [];
    const progressStep = isSubDayMode
      ? Math.max(4, Math.round((48 * hoursStep) / 24))
      : 25;

    for (const mv of input.movements) {
      const nextProg = mv.progress + progressStep;
      if (nextProg >= 100) {
        arrived.push({ ...mv, progress: 100 });
      } else {
        nextMovements.push({ ...mv, progress: nextProg });
      }
    }

    for (const mv of arrived) {
      const target = nextTerritories[mv.toTerritoryId];
      if (!target) continue;

      const hasMoreHops = Boolean(mv.routeQueue && mv.routeQueue.length > 0);
      const targetAccess = classifyTerritoryTraversal({
        terr: target,
        toId: mv.finalDestinationId || mv.toTerritoryId,
        moverNationId: mv.ownerId,
        nations: nextNations,
        relations,
        wars: nextWars,
        allowTargetWarDeclaration: false,
      });

      // Multi-Hop Transit: If passing through a friendly/allied corridor toward a further destination, march on to next hop!
      if (hasMoreHops && targetAccess === 'FRIENDLY_PASS') {
        const [nextHopId, ...restQueue] = mv.routeQueue!;
        const nextHopTerr = nextTerritories[nextHopId];
        const straitCheck = checkStraitMilitaryBlockade({
          fromId: mv.toTerritoryId,
          toId: nextHopId,
          moverNationId: mv.ownerId,
          territories: nextTerritories,
          wars: nextWars,
        });
        if (straitCheck.blocked) {
          if (mv.ownerId === playerNationId && straitCheck.reason) {
            toasts.push(straitCheck.reason);
          }
          if (target.ownerId === mv.ownerId) {
            writeTerritory(target.id, {
              ...target,
              garrison: target.garrison + mv.troops,
              units: {
                infantry: target.units.infantry + mv.units.infantry,
                armor: target.units.armor + mv.units.armor,
                airDrone: target.units.airDrone + mv.units.airDrone,
              },
            });
          }
          continue;
        }
        if (nextHopTerr) {
          nextMovements.push({
            ...mv,
            fromTerritoryId: mv.toTerritoryId,
            toTerritoryId: nextHopId,
            routeQueue: restQueue,
            progress: 12,
            isAttack:
              nextHopTerr.ownerId !== mv.ownerId &&
              Boolean(isAtWar(nextWars, mv.ownerId, nextHopTerr.ownerId)),
          });
          continue;
        }
      }

      // Check if there is already an active battle on target territory
      const existingBattleIdx = nextBattles.findIndex(
        (b) => b.territoryId === mv.toTerritoryId
      );

      // Final arrival in own territory -> Friendly reinforcement (or reinforce ongoing defense battle!)
      if (target.ownerId === mv.ownerId) {
        writeTerritory(mv.toTerritoryId, {
          ...target,
          garrison: target.garrison + mv.troops,
          units: {
            infantry:
              (target.units?.infantry || 0) +
              (mv.units?.infantry || mv.troops),
            armor: (target.units?.armor || 0) + (mv.units?.armor || 0),
            airDrone:
              (target.units?.airDrone || 0) + (mv.units?.airDrone || 0),
          },
        });
        if (existingBattleIdx !== -1) {
          const btl = nextBattles[existingBattleIdx];
          nextBattles[existingBattleIdx] = {
            ...btl,
            defenderTroops: btl.defenderTroops + mv.troops,
            defenderInitialTroops:
              (btl.defenderInitialTroops || btl.defenderTroops) + mv.troops,
            defenderUnits: {
              infantry:
                (btl.defenderUnits?.infantry || 0) +
                (mv.units?.infantry || mv.troops),
              armor: (btl.defenderUnits?.armor || 0) + (mv.units?.armor || 0),
              airDrone:
                (btl.defenderUnits?.airDrone || 0) + (mv.units?.airDrone || 0),
            },
          };
        }
        continue;
      }

      // Arrived in allied / military-access territory at end of route -> station peacefully
      if (targetAccess === 'FRIENDLY_PASS') {
        continue;
      }

      // Hostile arrival -> If territory has garrison, start/reinforce battle; otherwise start siege or occupy!
      if (existingBattleIdx !== -1) {
        const btl = nextBattles[existingBattleIdx];
        const newAttTroops = btl.attackerTroops + mv.troops;
        const newAttUnits = {
          infantry:
            (btl.attackerUnits?.infantry || 0) +
            (mv.units?.infantry || mv.troops),
          armor: (btl.attackerUnits?.armor || 0) + (mv.units?.armor || 0),
          airDrone:
            (btl.attackerUnits?.airDrone || 0) + (mv.units?.airDrone || 0),
        };
        nextBattles[existingBattleIdx] = {
          ...btl,
          attackerTroops: newAttTroops,
          attackerInitialTroops:
            (btl.attackerInitialTroops || btl.attackerTroops) + mv.troops,
          attackerUnits: newAttUnits,
          attackerFrontline: newAttUnits.infantry + newAttUnits.armor,
          attackerBackline: newAttUnits.airDrone,
        };
      } else if (target.garrison > 350) {
        // Active defending garrison -> Start AoH3 On-Map Battle
        const attNation = nextNations[mv.ownerId];
        const defNation = nextNations[target.ownerId];
        const attCmd = attNation?.activeGeneralId
          ? COMMANDERS.find((c) => c.id === attNation.activeGeneralId)
          : null;
        const defCmd = defNation?.activeGeneralId
          ? COMMANDERS.find((c) => c.id === defNation.activeGeneralId)
          : null;

        const terrWidth =
          target.terrain === 'DAGLIK'
            ? 12000
            : target.terrain === 'METROPOL'
            ? 18000
            : target.terrain === 'ORMAN'
            ? 20000
            : target.terrain === 'COL'
            ? 25000
            : 35000;

        const attU = mv.units || { infantry: mv.troops, armor: 0, airDrone: 0 };
        const defU = target.units || {
          infantry: target.garrison,
          armor: 0,
          airDrone: 0,
        };

        nextBattles.push({
          id: `btl_${nextTick}_${mv.toTerritoryId}`,
          territoryId: mv.toTerritoryId,
          fromTerritoryId: mv.fromTerritoryId,
          attackerId: mv.ownerId,
          defenderId: target.ownerId,
          attackerTroops: mv.troops,
          attackerInitialTroops: mv.troops,
          attackerUnits: attU,
          attackerFrontline: attU.infantry + attU.armor,
          attackerBackline: attU.airDrone,
          defenderTroops: target.garrison,
          defenderInitialTroops: target.garrison,
          defenderUnits: defU,
          defenderFrontline: defU.infantry + defU.armor,
          defenderBackline: defU.airDrone,
          round: 0,
          combatWidth: terrWidth,
          attackerMorale: 100,
          defenderMorale: 100,
          attackerCommanderName: attCmd?.name,
          defenderCommanderName: defCmd?.name,
        });
      } else if (
        (target.buildings.fortress || 0) > 0 &&
        (target.castleWallHp ?? 100) > 15
      ) {
        // Fortress present without standing garrison -> Start AoH3 Siege
        writeTerritory(target.id, {
          ...target,
          siege: {
            territoryId: target.id,
            attackerId: mv.ownerId,
            defenderId: target.ownerId,
            attackerTroops: mv.troops,
            attackerUnits: mv.units,
            progress: 0,
            wallIntegrity: target.castleWallHp ?? 100,
            startedTick: nextTick,
          },
        });
        if (mv.ownerId === playerNationId) {
          toasts.push(`♜ ${target.name} kuşatması başladı!`);
          sounds.push('MARCH');
        }
      } else {
        // Ungarrisoned territory with no fortress -> Swift occupation
        writeTerritory(target.id, {
          ...target,
          ownerId: mv.ownerId,
          isCapital: false,
          garrison: mv.troops,
          units: mv.units || { infantry: mv.troops, armor: 0, airDrone: 0 },
          unrest: Math.min(80, target.unrest + 18),
          isOccupied: true,
          occupiedById: mv.ownerId,
        });
      }
    }
  }

  // 1A. AoH3 Real-Time On-Map Battle Simulation (Frontline vs Backline, Combat Width, and Morale)
  if (nextBattles.length > 0) {
    const ongoingBattles: ActiveBattle[] = [];
    const roundsToSimulate = isSubDayMode ? 1 : 4;

    for (const btl of nextBattles) {
      const target = nextTerritories[btl.territoryId];
      const attackerNation = nextNations[btl.attackerId];
      const defenderNation = nextNations[btl.defenderId];

      if (!target || !attackerNation || !defenderNation) continue;

      let attTroops = btl.attackerTroops;
      let defTroops = btl.defenderTroops;
      let attUnits = btl.attackerUnits;
      let defUnits = btl.defenderUnits;
      let attMorale = btl.attackerMorale ?? 100;
      let defMorale = btl.defenderMorale ?? 100;
      let attTuranPowerBonus = btl.attackerTuranPowerBonus ?? 0;
      let defTuranPowerBonus = btl.defenderTuranPowerBonus ?? 0;
      let round = btl.round;
      let wallHp = target.castleWallHp ?? 100;

      const cWidth = btl.combatWidth || 25000;
      const terrainDefMult =
        target.terrain === 'DAGLIK'
          ? 1.25
          : target.terrain === 'METROPOL'
          ? 1.18
          : target.terrain === 'ORMAN'
          ? 1.14
          : target.terrain === 'COL'
          ? 1.05
          : 1.0;

      for (let r = 0; r < roundsToSimulate; r++) {
        if (
          attTroops <= 350 ||
          defTroops <= 350 ||
          attMorale <= 12 ||
          defMorale <= 12 ||
          round >= 5
        ) {
          break;
        }
        round += 1;

        // Frontline engagements capped by combat width
        const attEngagedFront = Math.min(
          cWidth,
          attUnits.infantry + attUnits.armor
        );
        const defEngagedFront = Math.min(
          cWidth,
          defUnits.infantry + defUnits.armor
        );
        const attBacklineArtillery = attUnits.airDrone;
        const defBacklineArtillery = defUnits.airDrone;

        const fortBonus =
          1 + (target.buildings.fortress || 0) * 0.08 * (wallHp / 100);

        // Power calculation with frontline and ranged backline bombardment
        const attPower =
          (attEngagedFront * 1.05 + attBacklineArtillery * 1.6) *
          (1 + getNationModernizedTier(attackerNation) * 0.12) *
          (attMorale / 100) *
          (1 + attTuranPowerBonus / 100);

        const defPower =
          (defEngagedFront * 1.05 + defBacklineArtillery * 1.6) *
          (1 + getNationModernizedTier(defenderNation) * 0.12) *
          terrainDefMult *
          fortBonus *
          (defMorale / 100) *
          (1 + defTuranPowerBonus / 100);

        const totalPower = Math.max(1, attPower + defPower);
        const attAdvantage = attPower / totalPower;
        const defAdvantage = defPower / totalPower;

        // Casualties inflicted this round
        const defLoss = Math.max(
          160,
          Math.round(defTroops * (0.13 + attAdvantage * 0.22))
        );
        const attLoss = Math.max(
          160,
          Math.round(attTroops * (0.13 + defAdvantage * 0.22))
        );

        const nextAtt = Math.max(0, attTroops - attLoss);
        const nextDef = Math.max(0, defTroops - defLoss);

        // Morale shock
        attMorale = Math.max(0, attMorale - (attLoss / Math.max(1, attTroops)) * 85);
        defMorale = Math.max(0, defMorale - (defLoss / Math.max(1, defTroops)) * 85);

        attUnits = scaleUnits(attUnits, nextAtt / Math.max(1, attTroops));
        defUnits = scaleUnits(defUnits, nextDef / Math.max(1, defTroops));
        attTroops = nextAtt;
        defTroops = nextDef;
        attTuranPowerBonus = 0;
        defTuranPowerBonus = 0;

        const siegeHit = Math.round(
          6 + ((attUnits.airDrone || 0) > 0 ? 9 : 0)
        );
        wallHp = Math.max(0, wallHp - siegeHit);
      }

      const attPowerFinal = computeUnitWeightedPower(
        attUnits,
        attTroops,
        attackerNation
      );
      const defPowerFinal =
        computeUnitWeightedPower(defUnits, defTroops, defenderNation) *
        terrainDefMult;

      const battleFinished =
        attTroops <= 400 ||
        defTroops <= 400 ||
        attMorale <= 15 ||
        defMorale <= 15 ||
        round >= 5;

      if (!battleFinished) {
        writeTerritory(target.id, {
          ...target,
          garrison: Math.max(400, defTroops),
          units: defUnits,
          castleWallHp: wallHp,
        });
        ongoingBattles.push({
          ...btl,
          attackerTroops: attTroops,
          attackerUnits: attUnits,
          attackerFrontline: attUnits.infantry + attUnits.armor,
          attackerBackline: attUnits.airDrone,
          defenderTroops: defTroops,
          defenderUnits: defUnits,
          defenderFrontline: defUnits.infantry + defUnits.armor,
          defenderBackline: defUnits.airDrone,
          attackerMorale: Math.round(attMorale),
          defenderMorale: Math.round(defMorale),
          attackerTuranPowerBonus: attTuranPowerBonus,
          defenderTuranPowerBonus: defTuranPowerBonus,
          round,
        });
        continue;
      }

      // Battle concluded on the map!
      const attackerWon =
        defTroops <= 400 ||
        defMorale <= 15 ||
        (attTroops > 400 && attPowerFinal > defPowerFinal * 1.08);

      const attInitial = btl.attackerInitialTroops || btl.attackerTroops;
      const defInitial = btl.defenderInitialTroops || btl.defenderTroops;
      const attLosses = Math.max(0, attInitial - attTroops);
      const defLosses = Math.max(0, defInitial - defTroops);

      if (attackerWon) {
        const previousOwnerId = target.ownerId;
        const survivors = Math.max(900, attTroops);

        writeTerritory(target.id, {
          ...target,
          ownerId: btl.attackerId,
          isCapital: false,
          garrison: survivors,
          units: scaleUnits(attUnits, survivors / Math.max(1, attTroops)),
          unrest: Math.min(80, target.unrest + 24),
          isOccupied: true,
          occupiedById: btl.attackerId,
          castleWallHp: wallHp,
        });

        // Check if previousOwner lost its capital or all territories
        const remainingPrevProvs = Object.values(nextTerritories).filter(
          (t) => t && t.ownerId === previousOwnerId
        );
        const prevNation = nextNations[previousOwnerId];
        if (prevNation) {
          if (remainingPrevProvs.length === 0) {
            writeNation(previousOwnerId, {
              ...prevNation,
              isEliminated: true,
            });
          } else if (prevNation.capitalTerritoryId === target.id) {
            const newCap = remainingPrevProvs[0];
            writeNation(previousOwnerId, {
              ...prevNation,
              capitalTerritoryId: newCap.id,
            });
            writeTerritory(newCap.id, {
              ...newCap,
              isCapital: true,
            });
          }
        }

        // Reward attacker research/influence if player
        if (btl.attackerId === playerNationId) {
          const pNat = nextNations[playerNationId];
          if (pNat) {
            writeNation(playerNationId, {
              ...pNat,
              researchPoints: Number((pNat.researchPoints + 18).toFixed(1)),
              clanInfluence: (pNat.clanInfluence ?? 120) + 15,
            });
          }
          sounds.push('WAR_HORN');
          toasts.push(
            `⚔️ FETİH ZAFERİ: ${target.name} ordumuz tarafından ele geçirildi!`
          );
          appendNews(
            `⚔️ ${target.name} Fethedildi!`,
            `${attackerNation.name} ordusu ${target.name} muharebesinde ${defenderNation.name} garnizonunu mağlup ederek şehri fethetti.`,
            'WAR'
          );
        } else if (previousOwnerId === playerNationId) {
          sounds.push('WAR_HORN');
          toasts.push(
            `⚠️ EYALET DÜŞTÜ: ${target.name} eyaletimiz ${attackerNation.name} ordusu tarafından işgal edildi!`
          );
          appendNews(
            `⚠️ ${target.name} İşgal Edildi`,
            `${attackerNation.name} ordusu ${target.name} savunmasını aşarak eyaleti kontrol altına aldı.`,
            'WAR'
          );
        }

        nextWars = nextWars.map((w) => {
          const involvesBoth =
            (w.attackers.includes(btl.attackerId) &&
              w.defenders.includes(previousOwnerId)) ||
            (w.attackers.includes(previousOwnerId) &&
              w.defenders.includes(btl.attackerId));
          if (!involvesBoth) return w;
          const isAttackerSide = w.attackers.includes(btl.attackerId);
          return {
            ...w,
            attackerWarScore: Math.max(
              -100,
              Math.min(
                100,
                w.attackerWarScore + (isAttackerSide ? 28 : -28)
              )
            ),
            casualtiesAttacker:
              w.casualtiesAttacker + (isAttackerSide ? attLosses : defLosses),
            casualtiesDefender:
              w.casualtiesDefender + (isAttackerSide ? defLosses : attLosses),
          };
        });
      } else {
        // Defender repulsed the attack!
        const defSurvivors = Math.max(800, defTroops);
        writeTerritory(target.id, {
          ...target,
          garrison: defSurvivors,
          units: scaleUnits(defUnits, defSurvivors / Math.max(1, defTroops)),
          castleWallHp: wallHp,
        });

        // Retreat surviving attackers (>= 500) back to origin or adjacent friendly territory
        if (attTroops >= 500) {
          const originTerr = btl.fromTerritoryId
            ? nextTerritories[btl.fromTerritoryId]
            : undefined;
          const fallbackTerr =
            originTerr && originTerr.ownerId === btl.attackerId
              ? originTerr
              : target.neighbors
                  .map((nId) => nextTerritories[nId])
                  .find((t) => t && t.ownerId === btl.attackerId);

          if (fallbackTerr) {
            writeTerritory(fallbackTerr.id, {
              ...fallbackTerr,
              garrison: fallbackTerr.garrison + attTroops,
              units: {
                infantry:
                  (fallbackTerr.units?.infantry || 0) +
                  (attUnits.infantry || 0),
                armor: (fallbackTerr.units?.armor || 0) + (attUnits.armor || 0),
                airDrone:
                  (fallbackTerr.units?.airDrone || 0) +
                  (attUnits.airDrone || 0),
              },
            });
          }
        }

        if (btl.defenderId === playerNationId) {
          toasts.push(
            `🛡️ SAVUNMA ZAFERİ: ${target.name} önlerindeki ${attackerNation.name} ordusu püskürtüldü!`
          );
        } else if (btl.attackerId === playerNationId) {
          toasts.push(
            `⚠️ TAARRUZ PÜSKÜRTÜLDÜ: ${target.name} önlerindeki ordumuz ağır direnişle karşılaşıp geri çekildi.`
          );
        }

        nextWars = nextWars.map((w) => {
          const involvesBoth =
            (w.attackers.includes(btl.attackerId) &&
              w.defenders.includes(btl.defenderId)) ||
            (w.attackers.includes(btl.defenderId) &&
              w.defenders.includes(btl.attackerId));
          if (!involvesBoth) return w;
          const isAttackerSide = w.attackers.includes(btl.attackerId);
          return {
            ...w,
            attackerWarScore: Math.max(
              -100,
              Math.min(
                100,
                w.attackerWarScore + (isAttackerSide ? -15 : 15)
              )
            ),
            casualtiesAttacker:
              w.casualtiesAttacker + (isAttackerSide ? attLosses : defLosses),
            casualtiesDefender:
              w.casualtiesDefender + (isAttackerSide ? defLosses : attLosses),
          };
        });
      }
    }

    nextBattles = ongoingBattles;
  }

  // 1B. AoH3 Real-Time Siege Progress Simulation
  Object.values(nextTerritories).forEach((terr) => {
    if (!terr || !terr.siege) return;
    const siege = terr.siege;
    const attackerNation = nextNations[siege.attackerId];
    const defenderNation = nextNations[siege.defenderId];
    if (!attackerNation || !defenderNation) {
      writeTerritory(terr.id, { ...terr, siege: null });
      return;
    }

    const siegePower = (siege.attackerTroops / 1000) * 0.45;
    const artilleryRatio =
      (siege.attackerUnits?.airDrone || 0) / Math.max(1, siege.attackerTroops);
    const artilleryBonus = artilleryRatio * 16;
    const fortressResistance = 1 + (terr.buildings.fortress || 0) * 0.85;

    const baseDailyAdvance =
      (7.5 + siegePower + artilleryBonus) / fortressResistance;
    const stepAdvance = isSubDayMode
      ? Math.max(1.2, (baseDailyAdvance * hoursStep) / 24)
      : Math.max(3.5, baseDailyAdvance);

    const nextProgress = Math.min(100, siege.progress + stepAdvance);
    const nextWall = Math.max(0, siege.wallIntegrity - stepAdvance * 0.7);

    if (nextProgress >= 100 || nextWall <= 5) {
      // Siege WON! Fortress capitulates to besieger
      const previousOwnerId = terr.ownerId;
      const survivors = Math.max(800, siege.attackerTroops);

      writeTerritory(terr.id, {
        ...terr,
        ownerId: siege.attackerId,
        isCapital: false,
        garrison: survivors,
        units: siege.attackerUnits || {
          infantry: survivors,
          armor: 0,
          airDrone: 0,
        },
        unrest: Math.min(80, terr.unrest + 22),
        isOccupied: true,
        occupiedById: siege.attackerId,
        castleWallHp: 15,
        siege: null,
      });

      if (siege.attackerId === playerNationId) {
        toasts.push(
          `♜ KUŞATMA ZAFERİ: ${terr.name} kalesi ve surları düştü, eyalet fethedildi!`
        );
        sounds.push('WAR_HORN');
        appendNews(
          `♜ ${terr.name} Kalesi Düştü!`,
          `${attackerNation.name} ordusu ${terr.name} kuşatmasını başarıyla tamamlayarak şehri teslim aldı.`,
          'WAR'
        );
      } else if (previousOwnerId === playerNationId) {
        toasts.push(
          `⚠️ KALE DÜŞTÜ: ${terr.name} kalesi düşman kuşatmasına dayanamayarak teslim oldu!`
        );
        sounds.push('WAR_HORN');
        appendNews(
          `⚠️ ${terr.name} Kalesi Teslim Oldu`,
          `${attackerNation.name} ordusu ${terr.name} surlarını aşarak eyaleti ele geçirdi.`,
          'WAR'
        );
      }

      nextWars = nextWars.map((w) => {
        const involvesBoth =
          (w.attackers.includes(siege.attackerId) &&
            w.defenders.includes(previousOwnerId)) ||
          (w.attackers.includes(previousOwnerId) &&
            w.defenders.includes(siege.attackerId));
        if (!involvesBoth) return w;
        const isAttackerSide = w.attackers.includes(siege.attackerId);
        return {
          ...w,
          attackerWarScore: Math.max(
            -100,
            Math.min(100, w.attackerWarScore + (isAttackerSide ? 25 : -25))
          ),
        };
      });
    } else {
      writeTerritory(terr.id, {
        ...terr,
        castleWallHp: Math.round(nextWall),
        siege: {
          ...siege,
          progress: Number(nextProgress.toFixed(1)),
          wallIntegrity: Math.round(nextWall),
        },
      });
    }
  });

  // 1B. Mid-Day Wartime Tactical AI Check (14:00) so enemy nations react swiftly during active wars
  const crossedMidDay = !dayWrapped && prevHour < 14 && nextHour >= 14;
  if ((dayWrapped || crossedMidDay) && nextWars.length > 0) {
    const wartimeAi = evaluateWartimeAiOperations({
      nextTick,
      playerNationId,
      nations: nextNations,
      territories: nextTerritories,
      relations: nextRelations,
      wars: nextWars,
      movements: nextMovements,
      aiAggressiveness: settings.aiAggressiveness,
      maxActionsPerPass: dayWrapped ? 3 : 2,
    });

    if (wartimeAi) {
      nextNations = wartimeAi.updatedNations;
      nationsCloned = true;
      nextTerritories = wartimeAi.updatedTerritories;
      territoriesCloned = true;
      if (wartimeAi.newMovements.length > 0) {
        nextMovements = [...nextMovements, ...wartimeAi.newMovements];
      }
      for (const item of wartimeAi.newsItems) {
        appendNews(item.title, item.description, item.type);
      }
      if (wartimeAi.playerAlerts.length > 0) {
        sounds.push('WAR_HORN');
        toasts.push(...wartimeAi.playerAlerts);
      }
    }
  }

  // 2. Daily Economy Update & Weekly AI Treasury/Manpower Growth (triggers when a full 24-hour day completes)
  if (dayWrapped) {
    const pNation = nextNations[playerNationId];
    if (pNation) {
      const econ = calculateNationEconomy(
        pNation,
        nextTerritories,
        nextNations,
        relations,
        nextMovements,
        nextWars,
        gameMode
      );

      let infDelta =
        (pNation.taxRate > 38 ? 0.03 : -0.01) - econ.inflationRelief;
      if (pNation.enactedReforms.includes('ref_central_bank')) {
        infDelta -= 0.025;
      }

      let activeProj: ActiveResearchProject | null = pNation.activeResearch
        ? { ...pNation.activeResearch }
        : null;
      let unlockedTechs = [...pNation.unlockedTechs];
      const researchProgressByTech = { ...(pNation.researchProgressByTech ?? {}) };

      if (activeProj) {
        const dailyInvest = Math.max(0.4, econ.dailyResearch);
        activeProj.progress = Number(
          (activeProj.progress + dailyInvest).toFixed(2)
        );
        researchProgressByTech[activeProj.techId] = activeProj.progress;
        if (activeProj.progress >= activeProj.totalCost) {
          const techDef = getTechTreeForMode(gameMode).find(
            (t) => t.id === activeProj!.techId
          );
          const techName = techDef?.name || activeProj.techId;
          unlockedTechs.push(activeProj.techId);
          delete researchProgressByTech[activeProj.techId];
          activeProj = null;
          sounds.push('TREATY');
          toasts.push(
            techDef?.branch === 'MILITARY'
              ? `🔬 Araştırma Tamamlandı: ${techName}! Yeni askeri birlikler ve ordu güncellemesi açıldı.`
              : `🔬 Araştırma Tamamlandı: ${techName}!`
          );
        }
      }

      writeNation(playerNationId, {
        ...pNation,
        treasury: Math.max(0, pNation.treasury + econ.netDailyGold),
        diplomacyPoints: Math.min(100, (pNation.diplomacyPoints ?? 100) + 1),
        manpower: pNation.manpower + econ.dailyManpower,
        researchPoints: Number(
          (pNation.researchPoints + econ.dailyResearch).toFixed(1)
        ),
        activeResearch: activeProj,
        researchProgressByTech,
        unlockedTechs,
        inflation: Math.max(
          0.5,
          Math.min(65, Number((pNation.inflation + infDelta).toFixed(2)))
        ),
        aggressiveExpansion: Math.max(
          0,
          Number((pNation.aggressiveExpansion - 0.05).toFixed(2))
        ),
      });

      // 2A-1. Daily Construction Queues, Gradual Assimilation & Missionary Conversion
      for (const t of Object.values(nextTerritories)) {
        if (!t) continue;
        let tModified = false;
        let nextQueue = t.constructionQueue;
        let nextBuildings = t.buildings;
        let nextAssim = t.assimilation;
        let nextIsAssimilating = t.isAssimilating;
        let nextCoreOwner = t.coreOwnerId;
        let nextUnrest = t.unrest;
        let nextReligion = t.religion;
        let nextMissionary = t.missionary;
        const buildings = t.buildings || {
          factory: 0,
          barracks: 0,
          fortress: 0,
          university: 0,
          tradeHub: 0,
          supplyDepot: 0,
        };

        // Province population is a living economic input. Previously it was
        // initialized once and never changed, so manpower and GDP could not
        // organically grow during a campaign. Keep growth modest and let
        // unrest and supply depots visibly affect the result.
        const unrestGrowthFactor = Math.max(0.25, 1 - (t.unrest || 0) / 140);
        const dailyPopulationGrowth =
          (t.population || 0) *
          (0.00035 * unrestGrowthFactor + (buildings.supplyDepot || 0) * 0.00008);
        const nextPopulation = Number(
          Math.max(0, (t.population || 0) + dailyPopulationGrowth).toFixed(2)
        );
        if (nextPopulation !== (t.population || 0)) {
          tModified = true;
        }

        // Supply depots now provide their declared daily local order effect;
        // this is intentionally separate from assimilation and missionary
        // effects, which are campaign actions with their own progress bars.
        if ((buildings.supplyDepot || 0) > 0) {
          nextUnrest = Math.max(
            0,
            Number((nextUnrest - buildings.supplyDepot * 0.12).toFixed(2))
          );
          tModified = true;
        }

        if (t.constructionQueue && t.constructionQueue.length > 0) {
          const remainingQueue: QueuedBuildingConstruction[] = [];
          for (const item of t.constructionQueue) {
            const nextDays = item.progressDays + 1;
            if (nextDays >= item.totalDays) {
              nextBuildings = {
                ...nextBuildings,
                [item.building]: item.targetLevel,
              };
              tModified = true;
              if (t.ownerId === playerNationId) {
                sounds.push('TREATY');
                const bDef = BUILDINGS.find((b) => b.id === item.building);
                toasts.push(
                  `🏛️ ${t.name}: ${bDef?.name || item.building} (Sv. ${item.targetLevel}) inşası tamamlandı!`
                );
              }
            } else {
              remainingQueue.push({ ...item, progressDays: nextDays });
            }
          }
          if (remainingQueue.length !== t.constructionQueue.length || tModified) {
            nextQueue = remainingQueue;
            tModified = true;
          }
        }

        if (t.isAssimilating) {
          const currentVal = t.assimilation ?? 30;
          const updatedAssim = Math.min(100, Number((currentVal + 1.25).toFixed(2)));
          nextUnrest = Math.max(0, Number((t.unrest - 0.35).toFixed(2)));
          if (updatedAssim >= 100) {
            nextAssim = 100;
            nextIsAssimilating = false;
            nextCoreOwner = t.ownerId;
            nextUnrest = Math.max(0, nextUnrest - 10);
            tModified = true;
            if (t.ownerId === playerNationId) {
              sounds.push('TREATY');
              toasts.push(`🌟 ${t.name} eyaleti tamamen asimile edildi ve Öz Vatan (Core) oldu!`);
            }
          } else {
            nextAssim = updatedAssim;
            tModified = true;
          }
        }

        if (t.missionary) {
          const nextDays = t.missionary.progressDays + 1;
          if (nextDays >= t.missionary.totalDays) {
            nextReligion = t.missionary.targetReligion;
            nextMissionary = null;
            nextUnrest = Math.max(0, Number((nextUnrest - 8).toFixed(2)));
            tModified = true;
            if (t.ownerId === playerNationId) {
              sounds.push('TREATY');
              const relDef = RELIGIONS[t.missionary.targetReligion];
              toasts.push(
                `☪ ${t.name} ahalisi başarıyla ${relDef?.name || 'Devlet Dini'} inancına geçti!`
              );
            }
          } else {
            nextMissionary = { ...t.missionary, progressDays: nextDays };
            tModified = true;
          }
        }

        if (tModified) {
          writeTerritory(t.id, {
            ...t,
            population: nextPopulation,
            buildings: nextBuildings,
            constructionQueue: nextQueue,
            assimilation: nextAssim,
            isAssimilating: nextIsAssimilating,
            coreOwnerId: nextCoreOwner,
            unrest: nextUnrest,
            religion: nextReligion,
            missionary: nextMissionary,
          });
        }
      }
    }

    if (nextTick % 7 === 0) {
      const allTerrsList = Object.values(nextTerritories);
      const liveStraits = evaluateActiveStraits(nextTerritories, nextWars);
      // Group province counts and GDP by ownerId in a single O(N) pass instead of O(N^2) filter!
      const aiGdpByOwner: Record<string, number> = {};
      const aiCountByOwner: Record<string, number> = {};
      for (const t of allTerrsList) {
        if (!t) continue;
        aiCountByOwner[t.ownerId] = (aiCountByOwner[t.ownerId] || 0) + 1;
        aiGdpByOwner[t.ownerId] =
          (aiGdpByOwner[t.ownerId] || 0) +
          t.baseGdp * (1 + t.buildings.factory * 0.25);
      }

      for (const nId of Object.keys(nextNations)) {
        if (nId === playerNationId) continue;
        const ai = nextNations[nId];
        if (!ai || ai.isEliminated) continue;
        const provCount = aiCountByOwner[nId] || 0;
        const totalAiGdp = aiGdpByOwner[nId] || 0;
        const weeklyStraitTolls = liveStraits.reduce(
          (sum, st) => sum + (st.ownerTollShares[nId] || 0) * 4,
          0
        );
        const dailyGain = Math.max(60, totalAiGdp * 1.15) + weeklyStraitTolls;
        const weeklyAiResearch = 18 + provCount * 3.5;

        let aiActiveProj: ActiveResearchProject | null = ai.activeResearch
          ? { ...ai.activeResearch }
          : null;
        let aiUnlocked = [...(ai.unlockedTechs || [])];
        const aiResearchProgressByTech = { ...(ai.researchProgressByTech ?? {}) };
        if (aiActiveProj) {
          aiActiveProj.progress = Number(
            (aiActiveProj.progress + weeklyAiResearch).toFixed(2)
          );
          aiResearchProgressByTech[aiActiveProj.techId] = aiActiveProj.progress;
          if (aiActiveProj.progress >= aiActiveProj.totalCost) {
            aiUnlocked.push(aiActiveProj.techId);
            delete aiResearchProgressByTech[aiActiveProj.techId];
            aiActiveProj = null;
          }
        } else {
          const nextAiTech = getTechTreeForMode(gameMode).find(
            (t) =>
              !aiUnlocked.includes(t.id) &&
              (!t.prerequisite || aiUnlocked.includes(t.prerequisite))
          );
          if (nextAiTech) {
            aiActiveProj = {
              techId: nextAiTech.id,
              progress: 0,
              totalCost: nextAiTech.cost,
              startedTick: nextTick,
            };
            aiResearchProgressByTech[nextAiTech.id] = 0;
          }
        }

        writeNation(nId, {
          ...ai,
          treasury: ai.treasury + Math.round(dailyGain),
          manpower: ai.manpower + 900 + provCount * 450,
          researchPoints: Number(
            ((ai.researchPoints || 0) + weeklyAiResearch).toFixed(1)
          ),
          activeResearch: aiActiveProj,
          researchProgressByTech: aiResearchProgressByTech,
          unlockedTechs: aiUnlocked,
          aggressiveExpansion: Math.max(0, ai.aggressiveExpansion - 0.35),
        });
      }

      // 2B. Weekly Unrest Drift, Rebellions & Bannerlord Fief Updates
      const rebResult = evaluateWeeklyUnrestAndRebellions(
        nextTerritories,
        nextNations
      );
      const bannerlordRes = processWeeklyBannerlordUpdates(
        nextNations,
        rebResult.updatedTerritories,
        nextTick
      );

      nextTerritories = bannerlordRes.updatedTerritories;
      territoriesCloned = true;
      nextNations = bannerlordRes.updatedNations;
      nationsCloned = true;

      bannerlordRes.investmentEvents?.forEach((inv) => {
        if (inv.nationId === playerNationId) {
          sounds.push('TREATY');
          appendNews(
            `🔔 ${inv.lordName} Şehir Yatırımı`,
            `${inv.lordName}, ${inv.territoryName} eyaletinde ${inv.buildingName} (Sv.${inv.level}) inşa etti! İmparatorluk Kazancı: ${inv.incomeBoostLabel}.`,
            'ECONOMY'
          );
          toasts.push(
            `🔔 ${inv.lordName}, ${inv.territoryName} şehrinde ${inv.buildingName} geliştirdi! (${inv.incomeBoostLabel})`
          );
        }
      });

      rebResult.rebellionEvents.forEach((ev) => {
        const ownerName = nextNations[ev.ownerId]?.name || 'Devlet';
        const restoredName =
          nextNations[ev.restoredOwnerId]?.name || 'Bağımsız Güçler';
        if (ev.crushed) {
          appendNews(
            `${ev.territoryName} İsyanı Bastırıldı`,
            `${ownerName} garnizonu ${ev.territoryName} bölgesindeki ayaklanmayı bastırdı.`,
            'WAR'
          );
          if (ev.ownerId === playerNationId) {
            toasts.push(
              `${ev.territoryName} eyaletinde çıkan isyan garnizonumuz tarafından bastırıldı (-2.500 Asker).`
            );
          }
        } else {
          appendNews(
            `İSYAN: ${ev.territoryName} Ayrıldı!`,
            `Asimile edilmeyen ${ev.territoryName} eyaleti ayaklanarak ${restoredName} kontrolüne geçti!`,
            'WAR'
          );
          if (
            ev.ownerId === playerNationId ||
            ev.restoredOwnerId === playerNationId
          ) {
            sounds.push('WAR_HORN');
            toasts.push(
              `İSYAN! ${ev.territoryName} yüksek huzursuzluk nedeniyle ayaklandı ve ${restoredName} egemenliğine geçti!`
            );
          }
        }
      });

      // 2C. Weekly Pasha / Clan Lord Loyalty Drift & Civil War / Secession Check!
      const loyaltyRes = evaluateWeeklyLordLoyaltyAndRebellions({
        nations: nextNations,
        territories: nextTerritories,
        wars: nextWars,
        weekTick: nextTick,
      });
      nextNations = loyaltyRes.updatedNations;
      nationsCloned = true;
      nextTerritories = loyaltyRes.updatedTerritories;
      territoriesCloned = true;
      nextWars = loyaltyRes.updatedWars;

      loyaltyRes.rebellions.forEach((reb) => {
        const provList = reb.rebelTerritoryNames.join(', ');
        appendNews(
          `🔥 PAŞA İSYANI: ${reb.lordName} Sancak Çekti!`,
          `Sadakati tükenen ${reb.lordName}, elindeki tımarlarla (${provList}) ayaklanarak ${reb.joinedNationName} safına geçti!`,
          'WAR'
        );
        if (reb.nationId === playerNationId) {
          sounds.push('WAR_HORN');
          toasts.push(
            `🔥 PAŞA İSYANI! ${reb.lordName} düşük sadakat yüzünden tımarlarıyla (${provList}) ayaklandı!`
          );
        }
      });
    }

    // 3. Multi-Province Strategic AI Decisions (Every 3 days)
    if (nextTick % 3 === 0) {
      const aiRes = evaluateMultiProvinceAiTurn({
        nextTick,
        gameMode,
        playerNationId,
        nations: nextNations,
        territories: nextTerritories,
        relations: nextRelations,
        wars: nextWars,
        movements: nextMovements,
        aiAggressiveness: settings.aiAggressiveness,
      });

      if (aiRes) {
        if (aiRes.updatedNations) {
          nextNations = aiRes.updatedNations;
          nationsCloned = true;
        }
        if (aiRes.updatedTerritories) {
          nextTerritories = aiRes.updatedTerritories;
          territoriesCloned = true;
        }
        if (aiRes.updatedWars) {
          nextWars = aiRes.updatedWars;
        }
        if (aiRes.updatedRelations) {
          nextRelations = aiRes.updatedRelations;
        }
        if (aiRes.newMovement) {
          nextMovements = [...nextMovements, aiRes.newMovement];
        }
        if (aiRes.newWar) {
          nextWars = [...nextWars, aiRes.newWar];
        }
        if (aiRes.newsItem) {
          appendNews(
            aiRes.newsItem.title,
            aiRes.newsItem.description,
            aiRes.newsItem.type
          );
        }
        if (aiRes.playerAlert) {
          sounds.push('WAR_HORN');
          toasts.push(aiRes.playerAlert);
        }
      }
    }

    // 4. Periodic Interactive Cabinet Crisis / Opportunity Event
    const latestPlayer = nextNations[playerNationId];
    const hasChallenges =
      latestPlayer &&
      (latestPlayer.treasury < 2500 ||
        latestPlayer.inflation > 12 ||
        nextWars.length > 0 ||
        latestPlayer.stability < 80);

    if (
      settings.crisisFrequencyDays > 0 &&
      nextTick > 0 &&
      nextTick % settings.crisisFrequencyDays === 0 &&
      (hasChallenges || Math.random() < 0.4)
    ) {
      triggeredCrisis = pickEligibleCrisisEvent(gameMode);
      shouldPause = true;
      sounds.push('SELECT_TERRITORY');
    }
  }

  return {
    nextTick,
    nextHour,
    dayWrapped,
    nations: nextNations,
    territories: nextTerritories,
    relations: nextRelations,
    wars: nextWars,
    battles: nextBattles,
    movements: nextMovements,
    newsEvents: nextNewsEvents,
    triggeredTacticalBattle,
    triggeredCrisis,
    shouldPause,
    toasts,
    sounds,
  };
}
