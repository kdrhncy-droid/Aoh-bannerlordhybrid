import {
  PRESET_COUNTRIES_2026,
  getNationModernizedTier,
  getNationUnlockedMilTier,
  getTechTreeForMode,
} from '../data/world2026Data';
import {
  ActiveWar,
  ArmyMovement,
  BuildingType,
  DiplomaticRelation,
  GameModeId,
  Nation,
  Territory,
  UnitComposition,
  WorldNewsEvent,
} from '../types/game';
import { AiAggressivenessLevel } from './gameSettings';
import { findArmyRouteAStar } from './pathfindingEngine';
import { STRATEGIC_STRAITS } from './straitsAndTradeEngine';
import {
  getOrCreateRelation,
  isAtWar,
  resolveWarParticipants,
} from './simulationEngine';
import { relationKey } from './worldBuilder';

function scaleUnitComp(units: UnitComposition, ratio: number): UnitComposition {
  return {
    infantry: Math.max(0, Math.round(units.infantry * ratio)),
    armor: Math.max(0, Math.round(units.armor * ratio)),
    airDrone: Math.max(0, Math.round(units.airDrone * ratio)),
  };
}

function computeRealmTotalTroops(
  nationId: string,
  territories: Record<string, Territory>,
  movements: ArmyMovement[]
): number {
  let total = 0;
  for (const t of Object.values(territories)) {
    if (t.ownerId === nationId) {
      total += t.garrison || 0;
    }
  }
  for (const mv of movements) {
    if (mv.ownerId === nationId) {
      total += mv.troops || 0;
    }
  }
  return total;
}

export interface AiTurnResult {
  updatedTerritories?: Record<string, Territory>;
  updatedNations?: Record<string, Nation>;
  updatedWars?: ActiveWar[];
  updatedRelations?: Record<string, DiplomaticRelation>;
  newMovement?: ArmyMovement;
  newWar?: ActiveWar;
  newsItem?: {
    title: string;
    description: string;
    type: WorldNewsEvent['type'];
  };
  playerAlert?: string;
}

export interface WartimeAiBatchResult {
  updatedTerritories: Record<string, Territory>;
  updatedNations: Record<string, Nation>;
  newMovements: ArmyMovement[];
  newsItems: {
    title: string;
    description: string;
    type: WorldNewsEvent['type'];
  }[];
  playerAlerts: string[];
}

/**
 * Evaluates active wartime operations for AI nations currently in a war.
 * Runs daily (and on war declaration / mid-day) so enemy countries actively mobilize reserves,
 * reinforce frontline provinces, and launch counter-attacks against the player and AI foes.
 */
export function evaluateWartimeAiOperations(params: {
  nextTick: number;
  playerNationId: string;
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  movements: ArmyMovement[];
  aiAggressiveness: AiAggressivenessLevel;
  maxActionsPerPass?: number;
}): WartimeAiBatchResult | null {
  const {
    nextTick,
    playerNationId,
    nations,
    territories,
    relations,
    wars,
    movements,
    aiAggressiveness,
    maxActionsPerPass = 3,
  } = params;

  if (wars.length === 0) return null;

  // Collect all non-eliminated AI nations currently involved in at least one active war
  const warAiSet = new Set<string>();
  for (const w of wars) {
    for (const id of [...w.attackers, ...w.defenders, w.attackerId, w.defenderId]) {
      if (id && id !== playerNationId && nations[id] && !nations[id].isEliminated) {
        warAiSet.add(id);
      }
    }
  }
  if (warAiSet.size === 0) return null;

  // Prioritize AI nations that are at war with the player so player wars feel immediately responsive
  const warAiIds = Array.from(warAiSet).sort((a, b) => {
    const aVsPlayer = isAtWar(wars, a, playerNationId) ? 0 : 1;
    const bVsPlayer = isAtWar(wars, b, playerNationId) ? 0 : 1;
    if (aVsPlayer !== bVsPlayer) return aVsPlayer - bVsPlayer;
    return ((nextTick + a.charCodeAt(0)) % 7) - ((nextTick + b.charCodeAt(0)) % 7);
  });

  let nextNations: Record<string, Nation> = { ...nations };
  let nextTerritories: Record<string, Territory> = { ...territories };
  const newMovements: ArmyMovement[] = [];
  const newsItems: WartimeAiBatchResult['newsItems'] = [];
  const playerAlerts: string[] = [];
  let actionsCount = 0;

  for (const actorId of warAiIds) {
    if (actionsCount >= maxActionsPerPass) break;

    let actorNation = nextNations[actorId];
    if (!actorNation || actorNation.isEliminated) continue;

    // Avoid spamming if this AI already has 2+ armies marching simultaneously
    const existingAiMoves =
      movements.filter((m) => m.ownerId === actorId).length +
      newMovements.filter((m) => m.ownerId === actorId).length;
    if (existingAiMoves >= 2) continue;

    const ownedProvs = Object.values(nextTerritories).filter(
      (t) => t && t.ownerId === actorId
    );
    if (ownedProvs.length === 0) continue;

    // Identify frontline provinces (directly bordering a war enemy)
    const frontlineProvs = ownedProvs.filter((p) =>
      p.neighbors.some((nbId) => {
        const nb = nextTerritories[nbId];
        return Boolean(nb && nb.ownerId !== actorId && isAtWar(wars, actorId, nb.ownerId));
      })
    );

    // Step 1: Emergency Wartime Levy / Mobilization on Frontline
    if (
      frontlineProvs.length > 0 &&
      actorNation.treasury >= 220 &&
      actorNation.manpower >= 2500
    ) {
      const bolsterTarget = [...frontlineProvs].sort(
        (a, b) => b.garrison - a.garrison
      )[0];
      if (bolsterTarget && bolsterTarget.garrison < 28000) {
        const levyTroops = Math.min(
          actorNation.manpower,
          aiAggressiveness === 'CHAOS' || aiAggressiveness === 'AGGRESSIVE'
            ? 6500
            : 4500
        );
        if (levyTroops >= 1500) {
          actorNation = {
            ...actorNation,
            treasury: Math.max(0, actorNation.treasury - 200),
            manpower: Math.max(0, actorNation.manpower - levyTroops),
          };
          nextNations[actorId] = actorNation;
          const updatedTarget: Territory = {
            ...bolsterTarget,
            garrison: bolsterTarget.garrison + levyTroops,
            units: {
              infantry:
                (bolsterTarget.units?.infantry || bolsterTarget.garrison) +
                Math.round(levyTroops * 0.68),
              armor:
                (bolsterTarget.units?.armor || 0) +
                Math.round(levyTroops * 0.22),
              airDrone:
                (bolsterTarget.units?.airDrone || 0) +
                Math.round(levyTroops * 0.1),
            },
          };
          nextTerritories[bolsterTarget.id] = updatedTarget;
        }
      }
    }

    // Refresh ownedProvs after potential levy
    const refreshedOwned = ownedProvs.map((p) => nextTerritories[p.id]);

    // Step 2: Direct Border Counter-Attack / Offensive Sortie
    let launchedSortie = false;
    const sortieCandidates = refreshedOwned
      .filter((p) => p && p.garrison >= 6000)
      .sort((a, b) => b.garrison - a.garrison);

    for (const srcProv of sortieCandidates) {
      // Don't launch duplicate attack from the same province if one is already marching
      const alreadyMarchingFromHere =
        movements.some(
          (m) => m.ownerId === actorId && m.fromTerritoryId === srcProv.id
        ) ||
        newMovements.some(
          (m) => m.ownerId === actorId && m.fromTerritoryId === srcProv.id
        );
      if (alreadyMarchingFromHere) continue;

      const enemyNeighbors = srcProv.neighbors
        .map((nId) => nextTerritories[nId])
        .filter(
          (nTerr): nTerr is Territory =>
            Boolean(nTerr) &&
            nTerr.ownerId !== actorId &&
            Boolean(isAtWar(wars, actorId, nTerr.ownerId))
        )
        .sort((a, b) => {
          // Prioritize attacking player provinces or weakly garrisoned enemy provinces
          const aIsPlayer = a.ownerId === playerNationId ? -2500 : 0;
          const bIsPlayer = b.ownerId === playerNationId ? -2500 : 0;
          return a.garrison + aIsPlayer - (b.garrison + bIsPlayer);
        });

      if (enemyNeighbors.length === 0) continue;

      const sendRatio = srcProv.garrison >= 16000 ? 0.72 : 0.66;
      const dispatchable = Math.round(srcProv.garrison * sendRatio);
      if (dispatchable < 3500) continue;

      const viableTarget = enemyNeighbors.find((enemyTerr) => {
        const minRequiredRatio =
          aiAggressiveness === 'PASSIVE'
            ? 0.82
            : aiAggressiveness === 'NORMAL'
            ? 0.58
            : 0.45;
        // Attack if dispatchable meets ratio OR if AI has a sizable assault force (>= 11,500)
        return (
          dispatchable >= Math.max(2200, enemyTerr.garrison * minRequiredRatio) ||
          dispatchable >= 11500
        );
      });

      if (viableTarget) {
        const sendUnits = scaleUnitComp(srcProv.units, sendRatio);
        nextTerritories[srcProv.id] = {
          ...srcProv,
          garrison: Math.max(1000, srcProv.garrison - dispatchable),
          units: scaleUnitComp(srcProv.units, 1 - sendRatio),
        };

        newMovements.push({
          id: `ai_war_mv_${nextTick}_${srcProv.id}_${viableTarget.id}`,
          ownerId: actorId,
          fromTerritoryId: srcProv.id,
          toTerritoryId: viableTarget.id,
          finalDestinationId: viableTarget.id,
          troops: dispatchable,
          units: sendUnits,
          progress: 16,
          isAttack: true,
        });

        if (viableTarget.ownerId === playerNationId) {
          playerAlerts.push(
            `⚔️ DÜŞMAN TAARRUZU: ${actorNation.name} ordusu (${dispatchable.toLocaleString('tr-TR')} asker) ${srcProv.name} üzerinden ${viableTarget.name} eyaletimize saldırıya geçti!`
          );
          newsItems.push({
            title: `⚔️ ${actorNation.name} Karşı Taarruzu: ${viableTarget.name}`,
            description: `${actorNation.name} komutanlığı ${srcProv.name} cephesinden ${viableTarget.name} eyaletimize ${dispatchable.toLocaleString('tr-TR')} kişilik orduyla taarruz başlattı!`,
            type: 'WAR',
          });
        }

        actionsCount++;
        launchedSortie = true;
        break;
      }
    }

    if (launchedSortie) continue;

    // Step 3: Multi-Hop Frontline Reinforcement or Expeditionary March (when strongest army is not on the immediate border)
    const rearStrongProvs = refreshedOwned
      .filter(
        (p) =>
          p.garrison >= 9000 &&
          !p.neighbors.some((nbId) => {
            const nb = nextTerritories[nbId];
            return Boolean(nb && nb.ownerId !== actorId && isAtWar(wars, actorId, nb.ownerId));
          })
      )
      .sort((a, b) => b.garrison - a.garrison);

    if (rearStrongProvs.length > 0) {
      const srcRear = rearStrongProvs[0];
      // Either reinforce a frontline province or march directly toward an enemy territory
      const enemyTerritories = Object.values(nextTerritories).filter(
        (t) => t && t.ownerId !== actorId && isAtWar(wars, actorId, t.ownerId)
      );
      const targetDest =
        frontlineProvs.sort((a, b) => a.garrison - b.garrison)[0] ||
        enemyTerritories[0];

      if (targetDest && targetDest.id !== srcRear.id) {
        const route = findArmyRouteAStar({
          fromId: srcRear.id,
          toId: targetDest.id,
          moverNationId: actorId,
          territories: nextTerritories,
          nations: nextNations,
          relations,
          wars,
          allowTargetWarDeclaration: true,
        });

        if (route.reachable && route.hops.length > 0) {
          const firstHopId = route.hops[0];
          const firstHopTerr = nextTerritories[firstHopId];
          const moveRatio = 0.6;
          const moveTroops = Math.round(srcRear.garrison * moveRatio);

          nextTerritories[srcRear.id] = {
            ...srcRear,
            garrison: Math.max(1000, srcRear.garrison - moveTroops),
            units: scaleUnitComp(srcRear.units, 1 - moveRatio),
          };

          const isFirstHopAttack = Boolean(
            firstHopTerr &&
              firstHopTerr.ownerId !== actorId &&
              isAtWar(wars, actorId, firstHopTerr.ownerId)
          );

          newMovements.push({
            id: `ai_war_march_${nextTick}_${srcRear.id}`,
            ownerId: actorId,
            fromTerritoryId: srcRear.id,
            toTerritoryId: firstHopId,
            finalDestinationId: targetDest.id,
            routeQueue: route.hops.slice(1),
            troops: moveTroops,
            units: scaleUnitComp(srcRear.units, moveRatio),
            progress: 18,
            isAttack: isFirstHopAttack,
          });

          if (isFirstHopAttack && firstHopTerr?.ownerId === playerNationId) {
            playerAlerts.push(
              `⚔️ DÜŞMAN TAARRUZU: ${actorNation.name} ordusu (${moveTroops.toLocaleString('tr-TR')} asker) ${firstHopTerr.name} eyaletimize yürüyor!`
            );
          }

          actionsCount++;
        }
      }
    }
  }

  if (
    actionsCount === 0 &&
    newMovements.length === 0 &&
    playerAlerts.length === 0
  ) {
    return null;
  }

  return {
    updatedTerritories: nextTerritories,
    updatedNations: nextNations,
    newMovements,
    newsItems,
    playerAlerts,
  };
}

export function evaluateMultiProvinceAiTurn(params: {
  nextTick: number;
  gameMode?: GameModeId;
  playerNationId: string;
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  movements?: ArmyMovement[];
  aiAggressiveness: AiAggressivenessLevel;
}): AiTurnResult | null {
  const {
    nextTick,
    gameMode = 'EMPIRES_1440',
    playerNationId,
    nations,
    territories,
    relations,
    wars,
    movements = [],
    aiAggressiveness,
  } = params;

  // Include all active neighbors of the player, all nations in wars, all multi-province realms, and major presets
  const playerNeighborNationIds = new Set<string>();
  Object.values(territories).forEach((t) => {
    if (t && t.ownerId === playerNationId) {
      t.neighbors.forEach((nbId) => {
        const nbOwner = territories[nbId]?.ownerId;
        if (nbOwner && nbOwner !== playerNationId) {
          playerNeighborNationIds.add(nbOwner);
        }
      });
    }
  });

  const majorAiIds = Object.keys(nations).filter((id) => {
    if (id === playerNationId) return false;
    const nat = nations[id];
    if (!nat || nat.isEliminated) return false;
    if (playerNeighborNationIds.has(id)) return true;
    if (wars.some((w) => w.attackers.includes(id) || w.defenders.includes(id))) {
      return true;
    }
    if (PRESET_COUNTRIES_2026[id]) return true;
    return (nat.treasury || 0) >= 600;
  });
  if (majorAiIds.length === 0) return null;

  const stepIndex = Math.max(0, Math.floor(nextTick / 3));
  const actorId = majorAiIds[stepIndex % majorAiIds.length];
  let actorNation = nations[actorId];
  if (!actorNation) return null;

  const ownedProvinces = Object.values(territories).filter(
    (t) => t.ownerId === actorId
  );
  if (ownedProvinces.length === 0) return null;

  let updatedNations: Record<string, Nation> | undefined;
  let updatedTerritories: Record<string, Territory> | undefined;

  // 0. Evaluate AI-vs-AI Peace Settlements so wars conclude logically instead of freezing forever
  const aiOnlyWar = wars.find((w) => {
    const involvesActor =
      w.attackerId === actorId ||
      w.defenderId === actorId ||
      w.attackers.includes(actorId) ||
      w.defenders.includes(actorId);
    if (!involvesActor) return false;
    const involvesPlayer =
      w.attackerId === playerNationId ||
      w.defenderId === playerNationId ||
      w.attackers.includes(playerNationId) ||
      w.defenders.includes(playerNationId);
    return !involvesPlayer;
  });

  if (aiOnlyWar) {
    const warDuration = nextTick - aiOnlyWar.startedTick;
    const absScore = Math.abs(aiOnlyWar.attackerWarScore);
    const isDecisive = warDuration >= 60 && absScore >= 45;
    const isExhaustedStalemate = warDuration >= 160 && absScore < 28;

    if (isDecisive || isExhaustedStalemate) {
      const nextWars = wars.filter((w) => w.id !== aiOnlyWar.id);
      const nextRelations: Record<string, DiplomaticRelation> = { ...relations };
      const truceKey = relationKey(aiOnlyWar.attackerId, aiOnlyWar.defenderId);
      const existingRel = getOrCreateRelation(
        relations,
        aiOnlyWar.attackerId,
        aiOnlyWar.defenderId
      );
      nextRelations[truceKey] = {
        ...existingRel,
        truceUntilTick: nextTick + 140,
      };

      const attNation = nations[aiOnlyWar.attackerId];
      const defNation = nations[aiOnlyWar.defenderId];

      if (isDecisive && attNation && defNation) {
        const winner =
          aiOnlyWar.attackerWarScore >= 0 ? attNation : defNation;
        const loser =
          aiOnlyWar.attackerWarScore >= 0 ? defNation : attNation;
        const indemnity = Math.min(
          Math.max(120, Math.round(loser.treasury * 0.35)),
          650
        );

        const nextNats: Record<string, Nation> = {
          ...(updatedNations || nations),
          [winner.id]: {
            ...winner,
            treasury: winner.treasury + indemnity,
            stability: Math.min(100, winner.stability + 4),
          },
          [loser.id]: {
            ...loser,
            treasury: Math.max(0, loser.treasury - indemnity),
            aggressiveExpansion: Math.max(0, loser.aggressiveExpansion - 8),
          },
        };

        return {
          updatedNations: nextNats,
          updatedWars: nextWars,
          updatedRelations: nextRelations,
          newsItem: {
            title: `📜 Barış Antlaşması: ${winner.name} Zaferi`,
            description: `${winner.name} ile ${loser.name} arasındaki savaş sona erdi; ${loser.name} ${indemnity} Altın savaş tazminatı ödeyerek ateşkes imzaladı.`,
            type: 'PEACE',
          },
        };
      }

      if (attNation && defNation) {
        return {
          updatedWars: nextWars,
          updatedRelations: nextRelations,
          newsItem: {
            title: `🕊️ Statüko Barışı: ${attNation.name} - ${defNation.name}`,
            description: `Uzun süren yıpratma harbinin ardından ${attNation.name} ve ${defNation.name} sınırları koruyarak ateşkes imzaladı.`,
            type: 'PEACE',
          },
        };
      }
    }
  }

  // 1. Era-Accurate AI Technology Progression & National Army Modernization
  const activeTechTree = getTechTreeForMode(gameMode);
  const availableTechs = activeTechTree.filter(
    (tech) =>
      !actorNation.unlockedTechs.includes(tech.id) &&
      (!tech.prerequisite ||
        actorNation.unlockedTechs.includes(tech.prerequisite)) &&
      actorNation.researchPoints >= tech.cost
  );

  // Prioritize military & economic techs when affordable
  const nextAiTech = availableTechs.sort((a, b) => {
    const prio = (branch: string) =>
      branch === 'MILITARY' ? 0 : branch === 'ECONOMY' ? 1 : 2;
    return prio(a.branch) - prio(b.branch) || a.cost - b.cost;
  })[0];

  if (nextAiTech) {
    actorNation = {
      ...actorNation,
      researchPoints: Math.max(0, actorNation.researchPoints - nextAiTech.cost),
      unlockedTechs: [...actorNation.unlockedTechs, nextAiTech.id],
    };
    updatedNations = {
      ...nations,
      [actorId]: actorNation,
    };
  }

  const aiUnlockedMil = getNationUnlockedMilTier(actorNation);
  const aiModernizedMil = getNationModernizedTier(actorNation);
  if (aiUnlockedMil > aiModernizedMil && actorNation.treasury >= 650) {
    actorNation = {
      ...actorNation,
      treasury: actorNation.treasury - 420,
      modernizedArmyTier: aiUnlockedMil,
    };
    updatedNations = {
      ...(updatedNations || nations),
      [actorId]: actorNation,
    };
  }

  // 2. Smart Internal Governance: Assimilate Unruly Provinces, Reinforce Borders, or Upgrade Economy
  const actorInAnyWar = wars.some(
    (w) => w.attackers.includes(actorId) || w.defenders.includes(actorId)
  );
  const highUnrestProv = ownedProvinces
    .filter((p) => p.unrest >= 55 || p.coreOwnerId !== actorId)
    .sort((a, b) => b.unrest - a.unrest)[0];

  if (highUnrestProv && highUnrestProv.unrest >= 55 && actorNation.treasury >= 550) {
    actorNation = {
      ...actorNation,
      treasury: actorNation.treasury - 350,
    };
    updatedNations = {
      ...(updatedNations || nations),
      [actorId]: actorNation,
    };
    updatedTerritories = {
      ...territories,
      [highUnrestProv.id]: {
        ...highUnrestProv,
        coreOwnerId: actorId,
        unrest: Math.max(5, highUnrestProv.unrest - 26),
      },
    };
  } else {
    const borderProvinces = ownedProvinces.filter((p) =>
      p.neighbors.some((nId) => territories[nId]?.ownerId !== actorId)
    );
    const weakestBorder = borderProvinces.sort(
      (a, b) => a.garrison - b.garrison
    )[0];

    const needsGarrison =
      actorInAnyWar ||
      !weakestBorder ||
      weakestBorder.garrison < 26000;

    if (
      needsGarrison &&
      actorNation.treasury >= 900 &&
      actorNation.manpower >= 6000
    ) {
      const targetProv = weakestBorder || ownedProvinces[0];
      if (targetProv) {
        const addTroops = aiAggressiveness === 'CHAOS' ? 9000 : 6000;
        actorNation = {
          ...actorNation,
          treasury: actorNation.treasury - 450,
          manpower: Math.max(0, actorNation.manpower - addTroops),
        };
        updatedNations = {
          ...(updatedNations || nations),
          [actorId]: actorNation,
        };
        updatedTerritories = {
          ...territories,
          [targetProv.id]: {
            ...targetProv,
            garrison: targetProv.garrison + addTroops,
            units: {
              infantry:
                (targetProv.units?.infantry || targetProv.garrison) +
                Math.round(addTroops * 0.68),
              armor:
                (targetProv.units?.armor || 0) + Math.round(addTroops * 0.22),
              airDrone:
                (targetProv.units?.airDrone || 0) + Math.round(addTroops * 0.1),
            },
          },
        };
      }
    } else if (!actorInAnyWar && actorNation.treasury >= 1150) {
      // Peacetime Economic, Strait & Scientific Infrastructure Upgrade!
      const straitShoreSet = new Set(
        STRATEGIC_STRAITS.flatMap((s) => s.shoreIds)
      );
      const econTarget =
        ownedProvinces.find(
          (p) =>
            straitShoreSet.has(p.id) &&
            ((p.buildings.tradeHub || 0) < 3 || (p.buildings.fortress || 0) < 3)
        ) ||
        ownedProvinces.find((p) => p.isCapital) ||
        ownedProvinces.sort((a, b) => b.baseGdp - a.baseGdp)[0];

      if (econTarget) {
        const isStraitProv = straitShoreSet.has(econTarget.id);
        const candidateBuildings: BuildingType[] = isStraitProv
          ? ['tradeHub', 'fortress', 'factory', 'barracks', 'university']
          : ['factory', 'tradeHub', 'university', 'barracks', 'fortress'];
        const chosenBuilding = candidateBuildings.find(
          (bKey) => (econTarget.buildings[bKey] || 0) < 5
        );
        if (chosenBuilding) {
          const currentLvl = econTarget.buildings[chosenBuilding] || 0;
          const upgradeCost = 420 + currentLvl * 220;
          if (actorNation.treasury >= upgradeCost + 350) {
            actorNation = {
              ...actorNation,
              treasury: actorNation.treasury - upgradeCost,
            };
            updatedNations = {
              ...(updatedNations || nations),
              [actorId]: actorNation,
            };
            updatedTerritories = {
              ...territories,
              [econTarget.id]: {
                ...econTarget,
                baseGdp:
                  chosenBuilding === 'factory' || chosenBuilding === 'tradeHub'
                    ? econTarget.baseGdp + 6
                    : econTarget.baseGdp,
                buildings: {
                  ...econTarget.buildings,
                  [chosenBuilding]: currentLvl + 1,
                },
              },
            };
          }
        }
      }
    }
  }

  const activeTerrs = updatedTerritories || territories;

  // 3. Tactical War Offensives — Only attack when dispatched army can realistically win!
  for (const prov of ownedProvinces) {
    const currentProv = activeTerrs[prov.id];
    if (!currentProv || currentProv.garrison < 12000) continue;

    const enemyCandidates = currentProv.neighbors
      .map((nId) => activeTerrs[nId])
      .filter(
        (nTerr): nTerr is Territory =>
          Boolean(nTerr) &&
          nTerr.ownerId !== actorId &&
          Boolean(isAtWar(wars, actorId, nTerr.ownerId))
      )
      .sort((a, b) => a.garrison - b.garrison);

    const viableTarget = enemyCandidates.find((enemyTerr) => {
      const dispatchable = Math.round(currentProv.garrison * 0.62);
      const terrainPenalty =
        enemyTerr.terrain === 'DAGLIK' || (enemyTerr.buildings.fortress || 0) >= 2
          ? 1.08
          : 0.88;
      return dispatchable >= Math.max(2500, enemyTerr.garrison * terrainPenalty);
    });

    if (viableTarget) {
      const sendRatio = 0.62;
      const sendTroops = Math.round(currentProv.garrison * sendRatio);
      const sendUnits = scaleUnitComp(currentProv.units, sendRatio);
      return {
        updatedNations,
        updatedTerritories: {
          ...activeTerrs,
          [currentProv.id]: {
            ...currentProv,
            garrison: currentProv.garrison - sendTroops,
            units: scaleUnitComp(currentProv.units, 1 - sendRatio),
          },
        },
        newMovement: {
          id: `ai_mv_${nextTick}_${currentProv.id}`,
          ownerId: actorId,
          fromTerritoryId: currentProv.id,
          toTerritoryId: viableTarget.id,
          troops: sendTroops,
          units: sendUnits,
          progress: 12,
          isAttack: true,
        },
      };
    }
  }

  // 4. Multi-Province A* Reserve Redeployment from safe interior provinces to frontline borders
  if (ownedProvinces.length > 1) {
    const interiorRichProv = ownedProvinces.find(
      (p) =>
        (activeTerrs[p.id]?.garrison || 0) >= 20000 &&
        p.neighbors.every((nId) => activeTerrs[nId]?.ownerId === actorId)
    );
    const frontlineTargets = ownedProvinces
      .filter((p) =>
        p.neighbors.some((nId) => {
          const nb = activeTerrs[nId];
          if (!nb || nb.ownerId === actorId) return false;
          return actorInAnyWar
            ? Boolean(isAtWar(wars, actorId, nb.ownerId))
            : true;
        })
      )
      .sort((a, b) => a.garrison - b.garrison);

    if (interiorRichProv && frontlineTargets.length > 0) {
      const destFront = frontlineTargets[0];
      const route = findArmyRouteAStar({
        fromId: interiorRichProv.id,
        toId: destFront.id,
        moverNationId: actorId,
        territories: activeTerrs,
        nations: updatedNations || nations,
        relations,
        wars,
      });

      if (route.reachable && route.hops.length >= 1) {
        const srcCurr = activeTerrs[interiorRichProv.id];
        const moveTroops = Math.round(srcCurr.garrison * 0.48);
        return {
          updatedNations,
          updatedTerritories: {
            ...activeTerrs,
            [srcCurr.id]: {
              ...srcCurr,
              garrison: srcCurr.garrison - moveTroops,
              units: scaleUnitComp(srcCurr.units, 0.52),
            },
          },
          newMovement: {
            id: `ai_redeploy_${nextTick}_${srcCurr.id}`,
            ownerId: actorId,
            fromTerritoryId: interiorRichProv.id,
            toTerritoryId: route.hops[0],
            finalDestinationId: destFront.id,
            routeQueue: route.hops.slice(1),
            troops: moveTroops,
            units: scaleUnitComp(srcCurr.units, 0.48),
            progress: 20,
            isAttack: false,
          },
        };
      }
    }
  }

  // 5. Strategic Coalition-Aware War Evaluation (Never declare suicidal wars against stronger empires!)
  const maxAllowedGlobalWars =
    aiAggressiveness === 'PASSIVE'
      ? 1
      : aiAggressiveness === 'NORMAL'
      ? 3
      : aiAggressiveness === 'AGGRESSIVE'
      ? 5
      : 8;

  const localRatioThreshold =
    aiAggressiveness === 'PASSIVE'
      ? 1.9
      : aiAggressiveness === 'NORMAL'
      ? 1.35
      : aiAggressiveness === 'AGGRESSIVE'
      ? 1.15
      : 1.0;

  const coalitionRatioThreshold =
    aiAggressiveness === 'PASSIVE'
      ? 1.55
      : aiAggressiveness === 'NORMAL'
      ? 1.12
      : aiAggressiveness === 'AGGRESSIVE'
      ? 0.92
      : 0.78;

  if (!actorInAnyWar && wars.length < maxAllowedGlobalWars) {
    for (const prov of ownedProvinces) {
      const currProv = activeTerrs[prov.id];
      if (!currProv || currProv.garrison < 22000) continue;

      const candidateTargetId = currProv.neighbors.find((nId) => {
        const nTerr = activeTerrs[nId];
        if (!nTerr || nTerr.ownerId === actorId) return false;
        const targetOwner = nations[nTerr.ownerId];
        if (
          !targetOwner ||
          targetOwner.isEliminated ||
          targetOwner.vassalOf === actorId ||
          actorNation.vassalOf === targetOwner.id
        ) {
          return false;
        }
        if (isAtWar(wars, actorId, targetOwner.id)) return false;

        const rel = getOrCreateRelation(relations, actorId, targetOwner.id);
        if (
          rel.isAllied ||
          rel.hasNonAggression ||
          rel.truceUntilTick > nextTick ||
          rel.score > 25
        ) {
          return false;
        }

        // Compare full coalition military strength so small minors don't suicide into superpowers!
        const simParticipants = resolveWarParticipants(
          actorId,
          targetOwner.id,
          relations,
          nations
        );
        const attackerCoalitionTroops = simParticipants.attackers.reduce(
          (sum, id) => sum + computeRealmTotalTroops(id, activeTerrs, movements),
          0
        );
        const defenderCoalitionTroops = simParticipants.defenders.reduce(
          (sum, id) => sum + computeRealmTotalTroops(id, activeTerrs, movements),
          0
        );

        const targetDistractedWars = wars.filter(
          (w) =>
            w.attackers.includes(targetOwner.id) ||
            w.defenders.includes(targetOwner.id)
        ).length;
        const distractionDiscount = Math.max(
          0.65,
          1 - targetDistractedWars * 0.16
        );

        const isHighAeCoalition =
          targetOwner.aggressiveExpansion >= 55 &&
          attackerCoalitionTroops >= defenderCoalitionTroops * 0.75;
        const hasEmpireAdvantage =
          attackerCoalitionTroops >=
          defenderCoalitionTroops * coalitionRatioThreshold * distractionDiscount;
        const hasBorderAdvantage =
          currProv.garrison >= nTerr.garrison * localRatioThreshold;

        return isHighAeCoalition || (hasEmpireAdvantage && hasBorderAdvantage);
      });

      if (candidateTargetId) {
        const targetTerr = activeTerrs[candidateTargetId];
        const targetOwner = nations[targetTerr.ownerId];
        if (targetOwner) {
          const isCoalition = targetOwner.aggressiveExpansion >= 55;
          const resolution = resolveWarParticipants(
            actorId,
            targetOwner.id,
            relations,
            nations
          );

          const defAllyNames = resolution.defensiveAlliesCalled
            .map((id) => nations[id]?.name)
            .filter(Boolean);
          const attAllyNames = resolution.offensiveAlliesCalled
            .map((id) => nations[id]?.name)
            .filter(Boolean);

          let allyDesc = '';
          if (defAllyNames.length > 0) {
            allyDesc += ` Savunma paktı uyarınca (${defAllyNames.join(', ')}) savunmaya katıldı.`;
          }
          if (attAllyNames.length > 0) {
            allyDesc += ` Saldırı paktı müttefikleri (${attAllyNames.join(', ')}) taarruza katıldı.`;
          }

          const newWar: ActiveWar = {
            id: `ai_war_${nextTick}_${actorId}`,
            name: isCoalition
              ? `${actorNation.name} Koalisyon Müdahalesi (${targetOwner.name})`
              : `${actorNation.name} - ${targetOwner.name} Savaşı`,
            attackerId: actorId,
            defenderId: targetOwner.id,
            attackers: resolution.attackers,
            defenders: resolution.defenders,
            startedTick: nextTick,
            attackerWarScore: 0,
            casualtiesAttacker: 0,
            casualtiesDefender: 0,
          };

          let alertMessage: string | undefined;
          if (targetOwner.id === playerNationId) {
            alertMessage = `DİKKAT: ${actorNation.name} devletimize savaş ilan etti!`;
          } else if (resolution.defenders.includes(playerNationId)) {
            alertMessage = `🛡️ SAVUNMA PAKTI TETİKLENDİ: Müttefikiniz ${targetOwner.name} saldırıya uğradı! Pakt gereği ${actorNation.name} ile savunma savaşına dahil edildiniz.`;
          } else if (resolution.attackers.includes(playerNationId)) {
            alertMessage = `⚔️ SALDIRI PAKTI DEVREDE: Saldırı paktı ortağınız ${actorNation.name}, ${targetOwner.name} hedefine taarruz başlattı.`;
          }

          return {
            updatedNations,
            updatedTerritories,
            newWar,
            newsItem: {
              title: newWar.name,
              description:
                (isCoalition
                  ? `${actorNation.name}, aşırı genişleyen ${targetOwner.name} devletine karşı Koalisyon Savaşı başlattı!`
                  : `${actorNation.name}, sınır komşusu ${targetOwner.name} devletine (${targetTerr.name} cephesinden) savaş ilan etti.`) +
                allyDesc,
              type: isCoalition ? 'COALITION' : 'WAR',
            },
            playerAlert: alertMessage,
          };
        }
      }
    }
  }

  if (updatedNations || updatedTerritories) {
    return { updatedNations, updatedTerritories };
  }

  return null;
}

export interface RebellionCheckResult {
  updatedTerritories: Record<string, Territory>;
  rebellionEvents: {
    territoryName: string;
    ownerId: string;
    restoredOwnerId: string;
    crushed: boolean;
  }[];
}

// Evaluates weekly unrest drift and triggers authentic rebellions in unassimilated territories with unrest >= 85%
export function evaluateWeeklyUnrestAndRebellions(
  territories: Record<string, Territory>,
  nations: Record<string, Nation>
): RebellionCheckResult {
  const nextTerrs: Record<string, Territory> = { ...territories };
  const rebellionEvents: RebellionCheckResult['rebellionEvents'] = [];

  Object.values(nextTerrs).forEach((t) => {
    const owner = nations[t.ownerId];
    if (!owner) return;

    const isCore = t.coreOwnerId === t.ownerId;
    const welfareRelief = Math.max(0, (owner.budget.welfare - 20) * 0.08);
    const depotRelief = t.buildings.supplyDepot * 1.2;
    const taxPressure = Math.max(0, (owner.taxRate - 30) * 0.15);

    let nextUnrest = t.unrest;
    if (!isCore) {
      const nonCoreDrift = 4.2 + taxPressure - depotRelief - welfareRelief;
      nextUnrest = Math.max(5, Math.min(100, Math.round(t.unrest + nonCoreDrift)));
    } else {
      const coreDrift = taxPressure - depotRelief - welfareRelief - 2.0;
      nextUnrest = Math.max(0, Math.min(100, Math.round(t.unrest + coreDrift)));
    }

    if (!isCore && nextUnrest >= 85) {
      if (t.garrison >= 15000) {
        const loss = 2500;
        const survivingRatio = Math.max(0.5, (t.garrison - loss) / t.garrison);
        nextTerrs[t.id] = {
          ...t,
          garrison: Math.max(2000, t.garrison - loss),
          units: scaleUnitComp(t.units, survivingRatio),
          unrest: 48,
        };
        rebellionEvents.push({
          territoryName: t.name,
          ownerId: t.ownerId,
          restoredOwnerId: t.coreOwnerId,
          crushed: true,
        });
      } else {
        const restoredId = nations[t.coreOwnerId] ? t.coreOwnerId : t.ownerId;
        nextTerrs[t.id] = {
          ...t,
          ownerId: restoredId,
          isOccupied: false,
          occupiedById: undefined,
          garrison: 12000,
          units: { infantry: 9500, armor: 2000, airDrone: 500 },
          unrest: 12,
        };
        rebellionEvents.push({
          territoryName: t.name,
          ownerId: t.ownerId,
          restoredOwnerId: restoredId,
          crushed: false,
        });
      }
    } else if (nextUnrest !== t.unrest) {
      nextTerrs[t.id] = {
        ...t,
        unrest: nextUnrest,
      };
    }
  });

  return {
    updatedTerritories: nextTerrs,
    rebellionEvents,
  };
}
