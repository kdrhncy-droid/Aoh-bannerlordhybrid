import {
  ActiveWar,
  ArmyMovement,
  DiplomaticRelation,
  GameModeId,
  Nation,
  Territory,
  WorldNewsEvent,
} from '../types/game';
import { TacticalBattleState } from '../types/tacticalBattle';
import {
  DiplomaticActionType,
  PeaceDealType,
} from '../components/drawers/drawerTypes';
import { relationKey } from './worldBuilder';
import { getEmbargoingNationIds } from './embargoUtils';
import {
  formatGameDate,
  getOrCreateRelation,
  isAtWar,
  resolveWarParticipants,
} from './simulationEngine';
import { evaluateWartimeAiOperations } from './aiAndRebellionEngine';
import { autoResolveTacticalBattle } from './tacticalBattleEngine';
import { withUpdatedLordLoyalty } from './pashaAndFiefEngine';
import { adjustAggressiveExpansionGain } from './technologyEffects';
import { sound } from '../utils/soundEngine';

export interface DomainActionPatch {
  nations?: Record<string, Nation>;
  territories?: Record<string, Territory>;
  relations?: Record<string, DiplomaticRelation>;
  wars?: ActiveWar[];
  movements?: ArmyMovement[];
  newsEvents?: WorldNewsEvent[];
  toast?: string;
}

const DIPLOMACY_POINT_COSTS: Partial<Record<DiplomaticActionType, number>> = {
  IMPROVE: 5,
  INSULT: 10,
  NON_AGGRESSION: 20,
  MILITARY_ACCESS: 10,
  TRADE: 10,
  DEFENSIVE_PACT: 30,
  OFFENSIVE_PACT: 50,
  EMBARGO: 15,
  DECLARE_WAR: 10,
};

function spendDiplomacyPoints(
  nation: Nation,
  cost: number
): { nation: Nation } | { error: string } {
  const current = nation.diplomacyPoints ?? 100;
  if (current < cost) {
    return {
      error: `Yetersiz diplomasi puanı: ${cost} gerekli, mevcut ${current.toFixed(0)}.`,
    };
  }
  return { nation: { ...nation, diplomacyPoints: current - cost } };
}

function prependNews(
  newsEvents: WorldNewsEvent[],
  tick: number,
  gameMode: GameModeId,
  title: string,
  description: string,
  type: WorldNewsEvent['type']
): WorldNewsEvent[] {
  return [
    {
      id: `news_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      tick,
      dateStr: formatGameDate(tick, gameMode),
      title,
      description,
      type,
    },
    ...newsEvents.slice(0, 39),
  ];
}

export function executeDiplomaticActionDomain(params: {
  targetNationId: string;
  action: DiplomaticActionType;
  playerNationId: string;
  totalPlayerGarrison: number;
  tick: number;
  gameMode: GameModeId;
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  movements?: ArmyMovement[];
  newsEvents: WorldNewsEvent[];
}): DomainActionPatch {
  const {
    targetNationId,
    action,
    playerNationId,
    totalPlayerGarrison,
    tick,
    gameMode,
    nations,
    territories,
    relations,
    wars,
    movements = [],
    newsEvents,
  } = params;

  const playerNation = nations[playerNationId];
  const target = nations[targetNationId];
  if (!playerNation || !target) return {};

  const key = relationKey(playerNationId, targetNationId);
  const currentRel = getOrCreateRelation(relations, playerNationId, targetNationId);

  if (action === 'IMPROVE') {
    const spent = spendDiplomacyPoints(
      playerNation,
      DIPLOMACY_POINT_COSTS.IMPROVE || 0
    );
    if ('error' in spent) return { toast: spent.error };
    sound.playTreaty();
    return {
      nations: {
        ...nations,
        [playerNationId]: spent.nation,
      },
      relations: {
        ...relations,
        [key]: {
          ...currentRel,
          score: Math.min(100, currentRel.score + 20),
        },
      },
      toast: `${target.name} ile diplomatik ilişkiler +20 gelişti (-${DIPLOMACY_POINT_COSTS.IMPROVE} DP).`,
    };
  }

  if (action === 'INSULT') {
    const spent = spendDiplomacyPoints(
      playerNation,
      DIPLOMACY_POINT_COSTS.INSULT || 0
    );
    if ('error' in spent) return { toast: spent.error };
    sound.playClick();
    return {
      nations: { ...nations, [playerNationId]: spent.nation },
      relations: {
        ...relations,
        [key]: {
          ...currentRel,
          isAllied: false,
          hasNonAggression: false,
          score: Math.max(-100, currentRel.score - 25),
        },
      },
      newsEvents: prependNews(
        newsEvents,
        tick,
        gameMode,
        `Diplomatik Gerilim: ${playerNation.name} - ${target.name}`,
        `${playerNation.name} Dışişleri Bakanlığı, ${target.name} hükümetine sert bir diplomatik nota verdi.`,
        'WAR'
      ),
      toast: `${target.name} hükümetine diplomatik nota verildi (-25 İlişki).`,
    };
  }

  if (action === 'NON_AGGRESSION') {
    if (!currentRel.hasNonAggression && currentRel.score < -10) {
      return {
        toast: `${target.name} ile Saldırmazlık Paktı için ilişkinin en az -10 olması gerekir.`,
      };
    }
    const spent = currentRel.hasNonAggression
      ? { nation: playerNation }
      : spendDiplomacyPoints(playerNation, DIPLOMACY_POINT_COSTS.NON_AGGRESSION || 0);
    if ('error' in spent) return { toast: spent.error };
    sound.playTreaty();
    return {
      nations: { ...nations, [playerNationId]: spent.nation },
      relations: {
        ...relations,
        [key]: {
          ...currentRel,
          hasNonAggression: !currentRel.hasNonAggression,
          score: Math.min(100, currentRel.score + 10),
        },
      },
      toast: currentRel.hasNonAggression
        ? `${target.name} ile Saldırmazlık Paktı sona erdirildi.`
        : `${target.name} ile Karşılıklı Saldırmazlık Paktı imzalandı!`,
    };
  }

  if (action === 'MILITARY_ACCESS') {
    if (!currentRel.hasMilitaryAccess && currentRel.score < 5) {
      return {
        toast: `${target.name} askeri geçiş izni için en az +5 ilişki puanı talep ediyor.`,
      };
    }
    const spent = currentRel.hasMilitaryAccess
      ? { nation: playerNation }
      : spendDiplomacyPoints(playerNation, DIPLOMACY_POINT_COSTS.MILITARY_ACCESS || 0);
    if ('error' in spent) return { toast: spent.error };
    sound.playTreaty();
    return {
      nations: { ...nations, [playerNationId]: spent.nation },
      relations: {
        ...relations,
        [key]: {
          ...currentRel,
          hasMilitaryAccess: !currentRel.hasMilitaryAccess,
          score: currentRel.hasMilitaryAccess
            ? currentRel.score
            : Math.min(100, currentRel.score + 8),
        },
      },
      toast: currentRel.hasMilitaryAccess
        ? `${target.name} ile askeri geçiş anlaşması iptal edildi.`
        : `${target.name} topraklarından Askeri Geçiş İzni alındı!`,
    };
  }

  if (action === 'TRADE') {
    if (isAtWar(wars, playerNationId, targetNationId)) {
      return { toast: 'Savaş halindeki bir devletle ticaret anlaşması imzalanamaz!' };
    }
    if (!currentRel.hasTradeAgreement && currentRel.score < 5) {
      return {
        toast: `${target.name} ile Serbest Ticaret Anlaşması için en az +5 ilişki puanı gerekir (Mevcut: ${currentRel.score}).`,
      };
    }
    const spent = currentRel.hasTradeAgreement
      ? { nation: playerNation }
      : spendDiplomacyPoints(playerNation, DIPLOMACY_POINT_COSTS.TRADE || 0);
    if ('error' in spent) return { toast: spent.error };
    sound.playTreaty();
    return {
      nations: { ...nations, [playerNationId]: spent.nation },
      relations: {
        ...relations,
        [key]: {
          ...currentRel,
          hasTradeAgreement: !currentRel.hasTradeAgreement,
          hasEmbargo: false,
          embargoingNationIds: [],
          score: Math.min(100, currentRel.score + 10),
        },
      },
      toast: currentRel.hasTradeAgreement
        ? `${target.name} ile ticaret anlaşması feshedildi.`
        : `${target.name} ile Serbest Ticaret Anlaşması imzalandı!`,
    };
  }

  if (
    action === 'DEFENSIVE_PACT' ||
    (action === 'ALLIANCE' && currentRel.allianceType === 'DEFENSIVE')
  ) {
    const isCurrentlyDefensive = currentRel.allianceType === 'DEFENSIVE';
    if (isCurrentlyDefensive) {
      sound.playClick();
      return {
        relations: {
          ...relations,
          [key]: {
            ...currentRel,
            isAllied: false,
            allianceType: null,
          },
        },
        newsEvents: prependNews(
          newsEvents,
          tick,
          gameMode,
          `${playerNation.name} - ${target.name} Savunma Paktı Sona Erdi`,
          `${playerNation.name} ve ${target.name} arasındaki Karşılıklı Savunma Paktı feshedildi.`,
          'PEACE'
        ),
        toast: `${target.name} ile Karşılıklı Savunma Paktı feshedildi.`,
      };
    }

    if (currentRel.score < 25) {
      return {
        toast: `${target.name} ile Savunma Paktı imzalamak için en az +25 ilişki puanı gerekir (Mevcut: ${currentRel.score}).`,
      };
    }

    const spent = spendDiplomacyPoints(
      playerNation,
      DIPLOMACY_POINT_COSTS.DEFENSIVE_PACT || 0
    );
    if ('error' in spent) return { toast: spent.error };

    sound.playTreaty();
    return {
      nations: { ...nations, [playerNationId]: spent.nation },
      relations: {
        ...relations,
        [key]: {
          ...currentRel,
          isAllied: true,
          allianceType: 'DEFENSIVE',
          hasMilitaryAccess: true,
          score: Math.min(100, currentRel.score + 15),
        },
      },
      newsEvents: prependNews(
        newsEvents,
        tick,
        gameMode,
        `🛡️ ${playerNation.name} - ${target.name} Savunma Paktı`,
        `${playerNation.name} ve ${target.name} Karşılıklı Savunma Paktı imzaladı. Üyelerden biri saldırıya uğradığında diğeri otomatik olarak savunma savaşına katılacak.`,
        'PEACE'
      ),
      toast: `🛡️ ${target.name} ile Karşılıklı Savunma Paktı imzalandı! Sadece savunma savaşlarında tetiklenir.`,
    };
  }

  if (
    action === 'OFFENSIVE_PACT' ||
    (action === 'ALLIANCE' && currentRel.allianceType !== 'DEFENSIVE')
  ) {
    const isCurrentlyOffensive = currentRel.allianceType === 'OFFENSIVE';
    if (isCurrentlyOffensive) {
      sound.playClick();
      return {
        relations: {
          ...relations,
          [key]: {
            ...currentRel,
            isAllied: false,
            allianceType: null,
          },
        },
        newsEvents: prependNews(
          newsEvents,
          tick,
          gameMode,
          `${playerNation.name} - ${target.name} Saldırı Paktı Sona Erdi`,
          `${playerNation.name} ve ${target.name} arasındaki Saldırı ve Askeri Koalisyon Paktı feshedildi.`,
          'PEACE'
        ),
        toast: `${target.name} ile Saldırı ve Koalisyon Paktı feshedildi.`,
      };
    }

    if (currentRel.score < 45) {
      return {
        toast: `${target.name} ile Saldırı Paktı için en az +45 ilişki puanı ve yüksek güven gerekir (Mevcut: ${currentRel.score}).`,
      };
    }

    const spent = spendDiplomacyPoints(
      playerNation,
      DIPLOMACY_POINT_COSTS.OFFENSIVE_PACT || 0
    );
    if ('error' in spent) return { toast: spent.error };

    sound.playTreaty();
    return {
      nations: { ...nations, [playerNationId]: spent.nation },
      relations: {
        ...relations,
        [key]: {
          ...currentRel,
          isAllied: true,
          allianceType: 'OFFENSIVE',
          hasMilitaryAccess: true,
          score: Math.min(100, currentRel.score + 25),
        },
      },
      newsEvents: prependNews(
        newsEvents,
        tick,
        gameMode,
        `⚔️ ${playerNation.name} - ${target.name} Saldırı & Koalisyon Paktı`,
        `${playerNation.name} ve ${target.name} Saldırı ve Tam Askeri İttifak Paktı imzaladı! Ortak hedefe savaş açıldığında ve savunmada birlikte taarruz edilecek.`,
        'PEACE'
      ),
      toast: `⚔️ ${target.name} ile Saldırı Paktı imzalandı! Ortak savaş ilanlarına katılacaktır.`,
    };
  }

  if (action === 'EMBARGO') {
    const embargoingNationIds = getEmbargoingNationIds(currentRel);
    const alreadyEmbargoing = embargoingNationIds.includes(playerNationId);
    const nextEmbargoingNationIds = alreadyEmbargoing
      ? embargoingNationIds.filter((nationId) => nationId !== playerNationId)
      : [...embargoingNationIds, playerNationId];
    const spent = alreadyEmbargoing
      ? { nation: playerNation }
      : spendDiplomacyPoints(playerNation, DIPLOMACY_POINT_COSTS.EMBARGO || 0);
    if ('error' in spent) return { toast: spent.error };
    sound.playClick();
    return {
      nations: { ...nations, [playerNationId]: spent.nation },
      relations: {
        ...relations,
        [key]: {
          ...currentRel,
          hasEmbargo: nextEmbargoingNationIds.length > 0,
          embargoingNationIds: nextEmbargoingNationIds,
          hasTradeAgreement: false,
          score: Math.max(-100, currentRel.score - 20),
        },
      },
      toast: alreadyEmbargoing
        ? `${target.name} üzerindeki ticaret ambargosu kaldırıldı.`
        : `${target.name} ekonomisine Ticaret Ambargosu uygulandı!`,
    };
  }

  if (action === 'ULTIMATUM_VASSAL') {
    const targetArmy = Object.values(territories)
      .filter((t) => t.ownerId === targetNationId)
      .reduce((s, t) => s + t.garrison, 0);

    if (totalPlayerGarrison >= targetArmy * 1.8) {
      sound.playTreaty();
      return {
        nations: {
          ...nations,
          [targetNationId]: {
            ...target,
            vassalOf: playerNationId,
          },
        },
        newsEvents: prependNews(
          newsEvents,
          tick,
          gameMode,
          `${target.name} Egemenliğimize Girdi`,
          `${target.name} hükümeti askeri ültimatomu kabul ederek ${playerNation.name} vasalı oldu.`,
          'PEACE'
        ),
        toast: `${target.name} askeri gücümüz karşısında ültimatomu kabul etti ve Vasal Devlet oldu!`,
      };
    } else {
      sound.playWarHorn();
      return {
        toast: `${target.name} ültimatomu reddetti! (Kabul etmesi için ordumuzun 1.8 kat büyük olması gerekir)`,
      };
    }
  }

  if (action === 'ANNEX_VASSAL') {
    if (target.vassalOf !== playerNationId) return {};
    if (playerNation.treasury < 600) {
      return {
        toast: 'Vasal entegrasyonu ve tam ilhak için 600 Altın gerekli.',
      };
    }
    sound.playWarHorn();
    const nextTerrs = { ...territories };
    Object.values(nextTerrs).forEach((t) => {
      if (t.ownerId === targetNationId) {
        nextTerrs[t.id] = {
          ...t,
          ownerId: playerNationId,
          coreOwnerId: playerNationId,
          unrest: 10,
          isOccupied: false,
        };
      }
    });

    return {
      territories: nextTerrs,
      nations: {
        ...nations,
        [playerNationId]: {
          ...playerNation,
          treasury: playerNation.treasury - 600,
        },
        [targetNationId]: {
          ...target,
          isEliminated: true,
          vassalOf: null,
        },
      },
      newsEvents: prependNews(
        newsEvents,
        tick,
        gameMode,
        `${target.name} Tamamen İlhak Edildi`,
        `Vasal statüsündeki ${target.name}, tüm eyaletleriyle birlikte doğrudan ${playerNation.name} sınırlarına katıldı.`,
        'PEACE'
      ),
      toast: `${target.name} tüm eyaletleriyle birlikte doğrudan imparatorluğa ilhak edildi!`,
    };
  }

  if (action === 'DECLARE_WAR') {
    if (isAtWar(wars, playerNationId, targetNationId)) return {};
    if (currentRel.score > -30) {
      return {
        toast: `${target.name} devletine savaş ilanı için ilişki puanı -30 veya daha düşük olmalı (Mevcut: ${currentRel.score}).`,
      };
    }
    const spent = spendDiplomacyPoints(
      playerNation,
      DIPLOMACY_POINT_COSTS.DECLARE_WAR || 0
    );
    if ('error' in spent) return { toast: spent.error };
    sound.playWarHorn();
    const resolution = resolveWarParticipants(
      playerNationId,
      targetNationId,
      relations,
      nations
    );

    const defAllyNames = resolution.defensiveAlliesCalled
      .map((id) => nations[id]?.name)
      .filter(Boolean);
    const attAllyNames = resolution.offensiveAlliesCalled
      .map((id) => nations[id]?.name)
      .filter(Boolean);

    const newWar: ActiveWar = {
      id: `war_${Date.now()}`,
      name: `${playerNation.name} - ${target.name} Savaşı`,
      attackerId: playerNationId,
      defenderId: targetNationId,
      attackers: resolution.attackers,
      defenders: resolution.defenders,
      startedTick: tick,
      attackerWarScore: 0,
      casualtiesAttacker: 0,
      casualtiesDefender: 0,
    };

    const nextWars = [...wars, newWar];
    const nextRelations: Record<string, DiplomaticRelation> = {
      ...relations,
      [key]: {
        ...currentRel,
        isAllied: false,
        allianceType: null,
        hasTradeAgreement: false,
        hasNonAggression: false,
        hasMilitaryAccess: false,
        score: -85,
      },
    };

    // Trigger immediate AI war mobilization & counter-attack response so the enemy reacts right away!
    const aiCounter = evaluateWartimeAiOperations({
      nextTick: tick,
      playerNationId,
      nations,
      territories,
      relations: nextRelations,
      wars: nextWars,
      movements,
      aiAggressiveness: 'AGGRESSIVE',
      maxActionsPerPass: 2,
    });

    let warDesc = `${playerNation.name}, ${target.name} devletine resmen savaş ilan etti.`;
    if (attAllyNames.length > 0) {
      warDesc += ` Saldırı Paktı müttefikleriniz (${attAllyNames.join(', ')}) ortak taarruza katıldı.`;
    }
    if (defAllyNames.length > 0) {
      warDesc += ` Hedefin Savunma Paktı ortakları (${defAllyNames.join(', ')}) savunmaya katıldı!`;
    }

    let updatedNews = prependNews(
      newsEvents,
      tick,
      gameMode,
      newWar.name,
      warDesc,
      'WAR'
    );
    if (aiCounter?.newsItems.length) {
      for (const item of aiCounter.newsItems) {
        updatedNews = prependNews(
          updatedNews,
          tick,
          gameMode,
          item.title,
          item.description,
          item.type
        );
      }
    }

    const counterAlert = aiCounter?.playerAlerts[0];
    const baseToast =
      defAllyNames.length > 0
        ? `${target.name} hedefine savaş ilan edildi! Savunma Paktı ortakları (${defAllyNames.join(', ')}) hedefin yanında savaşa girdi!`
        : attAllyNames.length > 0
        ? `${target.name} hedefine savaş ilan edildi! Saldırı Paktı müttefikleriniz (${attAllyNames.join(', ')}) taarruza katıldı.`
        : `${target.name} devletine resmen savaş ilan edildi!`;
    const nextNations = {
      ...(aiCounter?.updatedNations || nations),
      [playerNationId]: spent.nation,
    };

    return {
      nations: nextNations,
      ...(aiCounter?.updatedTerritories
        ? { territories: aiCounter.updatedTerritories }
        : {}),
      ...(aiCounter?.newMovements?.length
        ? { movements: [...movements, ...aiCounter.newMovements] }
        : {}),
      wars: nextWars,
      relations: nextRelations,
      newsEvents: updatedNews,
      toast: counterAlert ? `${baseToast} ${counterAlert}` : baseToast,
    };
  }

  return {};
}

export function resolveTacticalBattleOutcomeDomain(params: {
  finalBattle: TacticalBattleState;
  playerNationId: string;
  tick: number;
  gameMode: GameModeId;
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  wars: ActiveWar[];
  newsEvents: WorldNewsEvent[];
}): DomainActionPatch {
  const {
    finalBattle,
    playerNationId,
    tick,
    gameMode,
    nations,
    territories,
    wars,
    newsEvents,
  } = params;

  let outcome = finalBattle.outcome;
  if (!outcome) {
    const auto = autoResolveTacticalBattle(
      finalBattle,
      finalBattle.attackerNationId === playerNationId,
      nations[finalBattle.attackerNationId],
      nations[finalBattle.defenderNationId]
    );
    outcome = auto.outcome;
  }
  if (!outcome) return {};

  const winnerId = outcome.winnerId;
  const isAttackerWinner = outcome.territoryConquered;

  const nextTerrs = { ...territories };
  const nextNations = { ...nations };
  const cur = nextTerrs[finalBattle.territoryId];

  if (cur) {
    if (isAttackerWinner) {
      const previousOwnerId = cur.ownerId;
      nextTerrs[finalBattle.territoryId] = {
        ...cur,
        ownerId: finalBattle.attackerNationId,
        isCapital: false,
        garrison: Math.max(1000, outcome.attackerSurvivingTroops),
        units: {
          infantry: Math.round(outcome.attackerSurvivingTroops * 0.7),
          armor: Math.round(outcome.attackerSurvivingTroops * 0.2),
          airDrone: Math.round(outcome.attackerSurvivingTroops * 0.1),
        },
        unrest: Math.min(80, cur.unrest + 25),
        isOccupied: true,
        occupiedById: finalBattle.attackerNationId,
        castleWallHp: finalBattle.castleWallHp,
      };

      // Check if defender lost its capital or its last territory
      const remainingDefProvs = Object.values(nextTerrs).filter(
        (t) => t && t.ownerId === previousOwnerId
      );
      const prevDefNation = nextNations[previousOwnerId];
      if (prevDefNation) {
        if (remainingDefProvs.length === 0) {
          nextNations[previousOwnerId] = {
            ...prevDefNation,
            isEliminated: true,
          };
        } else if (prevDefNation.capitalTerritoryId === finalBattle.territoryId) {
          const newCap = remainingDefProvs[0];
          nextNations[previousOwnerId] = {
            ...prevDefNation,
            capitalTerritoryId: newCap.id,
          };
          nextTerrs[newCap.id] = {
            ...newCap,
            isCapital: true,
          };
        }
      }
    } else {
      nextTerrs[finalBattle.territoryId] = {
        ...cur,
        garrison: Math.max(800, outcome.defenderSurvivingTroops),
        castleWallHp: finalBattle.castleWallHp,
      };

      // Return surviving attacker troops to an adjacent friendly territory (or capital) instead of vanishing
      const retreatTroops = Math.max(0, outcome.attackerSurvivingTroops);
      if (retreatTroops >= 500) {
        const friendlyNeighborId = cur.neighbors.find(
          (nbId) => nextTerrs[nbId]?.ownerId === finalBattle.attackerNationId
        );
        const attackerCapId =
          nextNations[finalBattle.attackerNationId]?.capitalTerritoryId;
        const fallbackFriendlyId = Object.values(nextTerrs).find(
          (t) => t && t.ownerId === finalBattle.attackerNationId
        )?.id;
        const retreatTargetId =
          friendlyNeighborId ||
          (attackerCapId &&
          nextTerrs[attackerCapId]?.ownerId === finalBattle.attackerNationId
            ? attackerCapId
            : fallbackFriendlyId);

        if (retreatTargetId && nextTerrs[retreatTargetId]) {
          const rt = nextTerrs[retreatTargetId];
          nextTerrs[retreatTargetId] = {
            ...rt,
            garrison: rt.garrison + retreatTroops,
            units: {
              infantry:
                (rt.units?.infantry || 0) + Math.round(retreatTroops * 0.7),
              armor: (rt.units?.armor || 0) + Math.round(retreatTroops * 0.2),
              airDrone:
                (rt.units?.airDrone || 0) + Math.round(retreatTroops * 0.1),
            },
          };
        }
      }
    }
  }

  const defenderFullyEliminated = Boolean(
    isAttackerWinner && nextNations[finalBattle.defenderNationId]?.isEliminated
  );

  const nextWars = wars.map((w) => {
    const involvesBoth =
      (w.attackers.includes(finalBattle.attackerNationId) &&
        w.defenders.includes(finalBattle.defenderNationId)) ||
      (w.attackers.includes(finalBattle.defenderNationId) &&
        w.defenders.includes(finalBattle.attackerNationId));
    if (!involvesBoth) return w;
    const isAttackerSide = w.attackers.includes(finalBattle.attackerNationId);
    const baseDelta = defenderFullyEliminated ? 100 : isAttackerWinner ? 28 : -28;
    const scoreDelta = baseDelta * (isAttackerSide ? 1 : -1);

    return {
      ...w,
      attackerWarScore: Math.max(
        -100,
        Math.min(100, w.attackerWarScore + scoreDelta)
      ),
      casualtiesAttacker: w.casualtiesAttacker + outcome!.attackerTotalLosses,
      casualtiesDefender: w.casualtiesDefender + outcome!.defenderTotalLosses,
    };
  });

  if (nextNations[winnerId]) {
    let wNat: Nation = {
      ...nextNations[winnerId],
      researchPoints: Number(
        (nextNations[winnerId].researchPoints + outcome.earnedResearch).toFixed(1)
      ),
      clanInfluence: Math.min(
        999,
        (nextNations[winnerId].clanInfluence ?? 120) + outcome.earnedInfluence
      ),
      aggressiveExpansion: isAttackerWinner
        ? Math.min(
            100,
            nextNations[winnerId].aggressiveExpansion +
              adjustAggressiveExpansionGain(nextNations[winnerId], 6)
          )
        : nextNations[winnerId].aggressiveExpansion,
    };
    if (wNat.activeGeneralId) {
      wNat = withUpdatedLordLoyalty(wNat, wNat.activeGeneralId, 6);
    }
    nextNations[winnerId] = wNat;
  }

  const loserId = outcome.loserId;
  if (nextNations[loserId]?.activeGeneralId) {
    nextNations[loserId] = withUpdatedLordLoyalty(
      nextNations[loserId],
      nextNations[loserId].activeGeneralId!,
      -4
    );
  }

  const winnerNation = nextNations[winnerId];
  let nextNews = newsEvents;
  let toast: string;

  if (winnerId === playerNationId) {
    sound.playVictory();
    nextNews = prependNews(
      newsEvents,
      tick,
      gameMode,
      `🏆 ${finalBattle.territoryName} Meydan Muharebesi Zaferi!`,
      `${winnerNation?.name} orduları ${finalBattle.territoryName} mevkiinde düşmanı hezimete uğrattı (+${outcome.earnedResearch} 🔬 Harp Bilimi, +${outcome.earnedInfluence} ⚜ Nüfuz).`,
      'WAR'
    );
    toast = `🏆 Zafer! ${finalBattle.territoryName} Muharebesi kazanıldı (+${outcome.earnedResearch} 🔬 Bilim, +${outcome.earnedInfluence} ⚜ Nüfuz)!`;
  } else {
    sound.playDefeat();
    nextNews = prependNews(
      newsEvents,
      tick,
      gameMode,
      `🛑 ${finalBattle.territoryName} Cephesinde Ricat`,
      `${finalBattle.territoryName} mevkiindeki muharebe kaybedildi, kalan birlikler sınır hattına çekildi.`,
      'WAR'
    );
    toast = `🛑 ${finalBattle.territoryName} Muharebesi kaybedildi, sağ kalan birlikler sınır eyaletimize çekildi.`;
  }

  return {
    territories: nextTerrs,
    wars: nextWars,
    nations: nextNations,
    newsEvents: nextNews,
    toast,
  };
}

export function resolvePeaceDealDomain(params: {
  warId: string;
  dealType: PeaceDealType;
  playerNationId: string;
  tick: number;
  gameMode: GameModeId;
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  newsEvents: WorldNewsEvent[];
}): DomainActionPatch {
  const {
    warId,
    dealType,
    playerNationId,
    tick,
    gameMode,
    nations,
    territories,
    relations,
    wars,
    newsEvents,
  } = params;

  const war = wars.find((w) => w.id === warId);
  const playerNation = nations[playerNationId];
  if (!war || !playerNation) return {};

  const isPlayerAttackerSide = war.attackers.includes(playerNationId);
  const enemyId = isPlayerAttackerSide ? war.defenderId : war.attackerId;
  const enemy = nations[enemyId];
  const key = relationKey(playerNationId, enemyId);

  // Effective war score from the player's perspective (-100 to +100)
  const playerWarScore = isPlayerAttackerSide
    ? war.attackerWarScore
    : -war.attackerWarScore;

  // Count enemy territories currently occupied by the player
  const occupiedProvs = Object.values(territories).filter(
    (t) =>
      t &&
      t.ownerId === playerNationId &&
      t.isOccupied &&
      (t.coreOwnerId === enemyId ||
        war.attackers.includes(t.coreOwnerId) ||
        war.defenders.includes(t.coreOwnerId))
  );

  // Enforce realistic AoH3 War Score thresholds before accepting peace demands!
  if (dealType === 'ANNEX_OCCUPIED') {
    if (occupiedProvs.length === 0 && playerWarScore < 25) {
      sound.playClick();
      return {
        toast: `🛑 ${enemy?.name || 'Düşman'} toprak vermeyi reddediyor! İlhak için önce cephede eyalet fethetmeli veya Savaş Skorunu en az +%25 yapmalısınız (Mevcut: %${playerWarScore}).`,
      };
    }
  } else if (dealType === 'VASSALIZE') {
    if (playerWarScore < 50 && !enemy?.isEliminated) {
      sound.playClick();
      return {
        toast: `🛑 ${enemy?.name || 'Düşman'} bağımsızlığından vazgeçmiyor! Vasallaştırmak için Savaş Skorunun en az +%50 olması gerekir (Mevcut: %${playerWarScore}).`,
      };
    }
  } else if (dealType === 'REPARATIONS') {
    if (playerWarScore < 20) {
      sound.playClick();
      return {
        toast: `🛑 ${enemy?.name || 'Düşman'} savaş tazminatı ödemeyi reddediyor! En az +%20 Savaş Skoru gerekli (Mevcut: %${playerWarScore}).`,
      };
    }
  } else if (dealType === 'WHITE_PEACE') {
    if (playerWarScore < -35 && playerNation.treasury < 350) {
      sound.playClick();
      return {
        toast: `🛑 Savaşta ağır yenilgi durumundasınız (%${playerWarScore})! Ateşkes için hazinede en az 350 Altın bulunmalıdır.`,
      };
    }
  }

  sound.playTreaty();

  const nextNations = { ...nations };
  const nextTerritories = { ...territories };
  let nextNews = newsEvents;
  let toast = `${enemy?.name} ile Beyaz Barış imzalandı.`;

  if (dealType === 'ANNEX_OCCUPIED') {
    const extraProvincesAllowed =
      playerWarScore >= 75 ? 2 : playerWarScore >= 45 ? 1 : 0;

    Object.values(nextTerritories).forEach((t) => {
      if (t.ownerId === playerNationId && t.isOccupied) {
        nextTerritories[t.id] = {
          ...t,
          isOccupied: false,
          occupiedById: undefined,
        };
      }
    });

    const remainingEnemyTerrs = Object.values(nextTerritories).filter(
      (t) => t.ownerId === enemyId
    );
    remainingEnemyTerrs.slice(0, extraProvincesAllowed).forEach((t) => {
      nextTerritories[t.id] = {
        ...t,
        ownerId: playerNationId,
        isCapital: false,
        isOccupied: false,
        unrest: Math.min(75, t.unrest + 20),
      };
    });

    const stillOwned = Object.values(nextTerritories).filter(
      (t) => t.ownerId === enemyId
    );
    if (stillOwned.length === 0 && nextNations[enemyId]) {
      nextNations[enemyId] = {
        ...nextNations[enemyId],
        isEliminated: true,
      };
    } else if (
      stillOwned.length > 0 &&
      nextNations[enemyId] &&
      nextTerritories[nextNations[enemyId].capitalTerritoryId]?.ownerId !== enemyId
    ) {
      const newCap = stillOwned[0];
      nextNations[enemyId] = {
        ...nextNations[enemyId],
        capitalTerritoryId: newCap.id,
      };
      nextTerritories[newCap.id] = {
        ...newCap,
        isCapital: true,
      };
    }

    nextNews = prependNews(
      newsEvents,
      tick,
      gameMode,
      `${war.name} Sona Erdi`,
      `${playerNation.name} ve ${enemy?.name} arasında imzalanan barış antlaşmasıyla işgal edilen eyaletler resmen ilhak edildi.`,
      'PEACE'
    );
    toast = `${enemy?.name} ile Barış Antlaşması imzalandı: İşgal edilen eyaletler imparatorluğa katıldı!`;
  } else if (dealType === 'VASSALIZE') {
    if (nextNations[enemyId]) {
      nextNations[enemyId] = {
        ...nextNations[enemyId],
        vassalOf: playerNationId,
      };
    }
    nextNews = prependNews(
      newsEvents,
      tick,
      gameMode,
      `${enemy?.name} Vasallaştırıldı`,
      `${enemy?.name}, barış antlaşması şartları gereği ${playerNation.name} himayesine girdi.`,
      'PEACE'
    );
    toast = `${enemy?.name} barış antlaşmasıyla Vasal Devlet statüsüne alındı!`;
  } else if (dealType === 'REPARATIONS') {
    const indemnity = Math.min(
      1100,
      Math.max(400, Math.round((enemy?.treasury || 700) * 0.45))
    );
    nextNations[playerNationId] = {
      ...playerNation,
      treasury: playerNation.treasury + indemnity,
    };
    if (nextNations[enemyId]) {
      nextNations[enemyId] = {
        ...nextNations[enemyId],
        treasury: Math.max(0, nextNations[enemyId].treasury - indemnity),
      };
    }
    toast = `${enemy?.name} devletinden +${indemnity} Altın savaş tazminatı tahsil edildi!`;
  } else if (dealType === 'WHITE_PEACE' && playerWarScore < -35) {
    nextNations[playerNationId] = {
      ...playerNation,
      treasury: Math.max(0, playerNation.treasury - 350),
    };
    toast = `${enemy?.name} ile 350 Altın tazminat ödenerek ateşkes imzalandı.`;
  }

  const curRel = getOrCreateRelation(relations, playerNationId, enemyId);
  const nextRelations = {
    ...relations,
    [key]: {
      ...curRel,
      truceUntilTick: tick + 90,
    },
  };

  return {
    nations: nextNations,
    territories: nextTerritories,
    relations: nextRelations,
    wars: wars.filter((w) => w.id !== warId),
    newsEvents: nextNews,
    toast,
  };
}
