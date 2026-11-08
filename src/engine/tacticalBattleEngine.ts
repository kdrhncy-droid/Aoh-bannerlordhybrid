import {
  COMMANDERS,
  getArmyGenerationInfo,
  getNationModernizedTier,
} from '../data/world2026Data';
import { Nation, Territory, UnitComposition } from '../types/game';
import {
  TacticalBattleState,
  TacticalFormationCard,
  TacticalFormationId,
} from '../types/tacticalBattle';
import { TERRAIN_INFO } from './pashaAndFiefEngine';

export const TACTICAL_FORMATION_CARDS: Record<
  TacticalFormationId,
  TacticalFormationCard
> = {
  HILAL_TURAN: {
    id: 'HILAL_TURAN',
    name: '🏹 Hilal / Turan Taktiği (Kurt Kapanı)',
    badge: 'Kuşatma & Kanat Kapanı',
    attackBonusPct: 28,
    defenseBonusPct: -5,
    moraleDamagePct: 24,
    casualtyReductionPct: 15,
    description:
      'Merkez kuvvetler sahte ricat (geri çekilme) yapar; içeri sızan düşman iki kanattan süvari ve vurucu birliklerle çembere alınır.',
    historyNote: 'Malazgirt ve Mohaç meydan muharebelerinde düşman ordularını imha eden efsanevi Türk savaş doktrini.',
  },
  FLANK_PENETRATION: {
    id: 'FLANK_PENETRATION',
    name: '⚡ Kanat Yarma & Yıldırım Hücumu',
    badge: 'Yarma Taarruzu +%24',
    attackBonusPct: 24,
    defenseBonusPct: 0,
    moraleDamagePct: 18,
    casualtyReductionPct: 8,
    description:
      'Merkez cephe sabit tutulurken, en vurucu atlı/zırhlı birliklerle düşmanın zayıf kanadına yıldırım darbesi indirilir.',
    historyNote: 'Hızlı manevra birliklerinin derinlemesine cephe delme ve kuşatma taktiği.',
  },
  ARTILLERY_PREP: {
    id: 'ARTILLERY_PREP',
    name: '💣 Ağır Topçu & Menzil Baraj Ateşi',
    badge: 'Tahkimat Yıkımı +%35',
    attackBonusPct: 18,
    defenseBonusPct: 10,
    moraleDamagePct: 20,
    casualtyReductionPct: 25,
    description:
      'Piyade hücumundan önce ağır bataryalar ve yoğun menzil salvosuyla düşman surları ve karargâhı dövülür.',
    historyNote: 'Konstantiniyye kuşatmasından modern harekâtlara uzanan ateş üstünlüğü doktrini.',
  },
  IRON_PORCUPINE: {
    id: 'IRON_PORCUPINE',
    name: '🛡️ Tabur Cengi & Tahkimat Savunması',
    badge: 'Savunma Direnci +%35',
    attackBonusPct: -10,
    defenseBonusPct: 35,
    moraleDamagePct: 8,
    casualtyReductionPct: 35,
    description:
      'Sayıca üstün düşmana karşı hendek, siper ve kalkan/araba tahkimatıyla geçit vermez savunma hattı kurulur.',
    historyNote: 'Çanakkale, Plevne ve klasik tabur cengi savunmalarında düşmanı durduran aşılmaz çember.',
  },
  ALL_OUT_CHARGE: {
    id: 'ALL_OUT_CHARGE',
    name: '⚔️ Topyekûn Hücum Emri',
    badge: 'Taarruz +%35 · Yüksek Risk',
    attackBonusPct: 35,
    defenseBonusPct: -15,
    moraleDamagePct: 30,
    casualtyReductionPct: -10,
    description:
      'Tüm hat boyunca mehter/borazan eşliğinde topyekûn taarruz. Düşman moralini çökertebilir veya yüksek kayıp verebilir.',
    historyNote: 'Düşman hatlarını tek hamlede süpüren kesin sonuçlu genel taarruz emri.',
  },
  BALANCED_LINE: {
    id: 'BALANCED_LINE',
    name: '⚖️ Nizami Dengeli Cephe Hattı',
    badge: 'Dengeli Doktrin',
    attackBonusPct: 10,
    defenseBonusPct: 10,
    moraleDamagePct: 10,
    casualtyReductionPct: 10,
    description:
      'Piyade, süvari/zırhlı ve topçu/hava unsurlarının standart nizami düzende dengeli ilerlemesi.',
    historyNote: 'Büyük ölçekli imparatorluk ordularının standart kurmay harekât planı.',
  },
};

export function selectAiTactic(
  aiNation: Nation,
  isDefender: boolean,
  round: number,
  aiMorale: number
): TacticalFormationId {
  if (aiMorale < 35) {
    return isDefender ? 'IRON_PORCUPINE' : 'ALL_OUT_CHARGE';
  }
  if (isDefender) {
    return round % 2 === 0 ? 'IRON_PORCUPINE' : 'ARTILLERY_PREP';
  }
  const tactics: TacticalFormationId[] = [
    'HILAL_TURAN',
    'FLANK_PENETRATION',
    'ARTILLERY_PREP',
    'ALL_OUT_CHARGE',
  ];
  return tactics[(round + (aiNation.name.length || 0)) % tactics.length];
}

export function createTacticalBattle(params: {
  battleId: string;
  territory: Territory;
  attackerNation: Nation;
  defenderNation: Nation;
  attackerTroops: number;
  attackerUnits?: UnitComposition;
}): TacticalBattleState {
  const {
    battleId,
    territory,
    attackerNation,
    defenderNation,
    attackerTroops,
    attackerUnits,
  } = params;

  const attUnits: UnitComposition = attackerUnits || {
    infantry: Math.round(attackerTroops * 0.7),
    armor: Math.round(attackerTroops * 0.2),
    airDrone: Math.round(attackerTroops * 0.1),
  };

  const defUnits: UnitComposition = territory.units || {
    infantry: Math.round(territory.garrison * 0.75),
    armor: Math.round(territory.garrison * 0.2),
    airDrone: Math.round(territory.garrison * 0.05),
  };

  const terrain = territory.terrain || 'OVA';
  const initialLog: string[] = [
    `⚔️ ${territory.name} Meydan Muharebesi başladı!`,
    `🌍 Arazi: ${TERRAIN_INFO[terrain]?.name || 'Ova'} (Savunma Bonusu: +%${TERRAIN_INFO[terrain]?.defenseBonusPct || 0})`,
    `🚩 Taarruz Eden: ${attackerNation.name} (${attackerTroops.toLocaleString('tr-TR')} Asker)`,
    `🛡️ Savunan Garnizon: ${defenderNation.name} (${territory.garrison.toLocaleString('tr-TR')} Asker, Sur: %${territory.castleWallHp ?? 100})`,
  ];

  return {
    battleId,
    territoryId: territory.id,
    territoryName: territory.name,
    terrain,
    castleWallHp: territory.castleWallHp ?? 100,
    attackerNationId: attackerNation.id,
    defenderNationId: defenderNation.id,
    attackerTroops,
    defenderTroops: territory.garrison,
    attackerMaxTroops: attackerTroops,
    defenderMaxTroops: Math.max(1000, territory.garrison),
    attackerMorale: 100,
    defenderMorale: 100,
    attackerUnits: attUnits,
    defenderUnits: defUnits,
    attackerCommanderId: attackerNation.activeGeneralId || null,
    defenderCommanderId: defenderNation.activeGeneralId || null,
    selectedPlayerTactic: 'HILAL_TURAN',
    selectedAiTactic: 'BALANCED_LINE',
    round: 1,
    maxRounds: 5,
    combatLog: initialLog,
    status: 'PREPARATION',
  };
}

export function resolveTacticalRound(
  currentState: TacticalBattleState,
  playerTacticId: TacticalFormationId,
  isPlayerAttacker: boolean,
  attackerNation: Nation,
  defenderNation: Nation
): TacticalBattleState {
  if (currentState.status === 'VICTORY' || currentState.status === 'DEFEAT') {
    return currentState;
  }

  const roundNum = currentState.round;
  const attTacticId = isPlayerAttacker
    ? playerTacticId
    : selectAiTactic(
        attackerNation,
        false,
        roundNum,
        currentState.attackerMorale
      );
  const defTacticId = isPlayerAttacker
    ? selectAiTactic(
        defenderNation,
        true,
        roundNum,
        currentState.defenderMorale
      )
    : playerTacticId;

  const attCard = TACTICAL_FORMATION_CARDS[attTacticId];
  const defCard = TACTICAL_FORMATION_CARDS[defTacticId];

  // Commanders
  const attCmd = currentState.attackerCommanderId
    ? COMMANDERS.find((c) => c.id === currentState.attackerCommanderId)
    : null;
  const defCmd = currentState.defenderCommanderId
    ? COMMANDERS.find((c) => c.id === currentState.defenderCommanderId)
    : null;

  // Terrain & Wall multipliers
  const terrainMeta = TERRAIN_INFO[currentState.terrain || 'OVA'];
  const terrainDefBonus = (terrainMeta?.defenseBonusPct || 0) / 100;
  const wallDefBonus = (currentState.castleWallHp / 100) * 0.25;

  // Attacker Power Calculation
  const attArmorShare =
    currentState.attackerUnits.armor / Math.max(1, currentState.attackerTroops);
  const attDroneShare =
    currentState.attackerUnits.airDrone /
    Math.max(1, currentState.attackerTroops);
  const attCmdBonus = (attCmd?.attackBonus || 0) / 100;
  const attTacticBonus = attCard.attackBonusPct / 100;

  const attModernBonus =
    getArmyGenerationInfo(undefined, getNationModernizedTier(attackerNation))
      .combatBonusPct / 100;
  const attPowerMultiplier =
    1.0 +
    attTacticBonus +
    attCmdBonus +
    attModernBonus +
    attArmorShare * 0.25 +
    attDroneShare * 0.4;
  const attEffectivePower = currentState.attackerTroops * attPowerMultiplier;

  // Defender Power Calculation
  const defArmorShare =
    currentState.defenderUnits.armor / Math.max(1, currentState.defenderTroops);
  const defDroneShare =
    currentState.defenderUnits.airDrone /
    Math.max(1, currentState.defenderTroops);
  const defCmdBonus = (defCmd?.defenseBonus || 0) / 100;
  const defTacticBonus = defCard.defenseBonusPct / 100;
  const defModernBonus =
    getArmyGenerationInfo(undefined, getNationModernizedTier(defenderNation))
      .combatBonusPct / 100;

  const defPowerMultiplier =
    1.0 +
    defTacticBonus +
    defCmdBonus +
    defModernBonus +
    terrainDefBonus +
    wallDefBonus +
    defArmorShare * 0.2 +
    defDroneShare * 0.35;
  const defEffectivePower = currentState.defenderTroops * defPowerMultiplier;

  // Casualty Calculations per round
  const attCasualtyMitigation =
    Math.max(0, attCard.casualtyReductionPct / 100) +
    (attCmd?.casualtyReduction || 0) / 100;
  const defCasualtyMitigation =
    Math.max(0, defCard.casualtyReductionPct / 100) +
    (defCmd?.casualtyReduction || 0) / 100;

  const rawAttLoss = Math.round(
    (defEffectivePower / (attEffectivePower + 1000)) *
      currentState.attackerTroops *
      0.18 *
      (1 - Math.min(0.5, attCasualtyMitigation))
  );
  const rawDefLoss = Math.round(
    (attEffectivePower / (defEffectivePower + 1000)) *
      currentState.defenderTroops *
      0.22 *
      (1 - Math.min(0.5, defCasualtyMitigation))
  );

  const nextAttTroops = Math.max(0, currentState.attackerTroops - rawAttLoss);
  const nextDefTroops = Math.max(0, currentState.defenderTroops - rawDefLoss);

  // Morale Damage
  const attMoraleLoss = Math.round(
    (rawAttLoss / Math.max(1, currentState.attackerMaxTroops)) * 80 +
      defCard.moraleDamagePct * 0.4
  );
  const defMoraleLoss = Math.round(
    (rawDefLoss / Math.max(1, currentState.defenderMaxTroops)) * 85 +
      attCard.moraleDamagePct * 0.45
  );

  const nextAttMorale = Math.max(0, currentState.attackerMorale - attMoraleLoss);
  const nextDefMorale = Math.max(0, currentState.defenderMorale - defMoraleLoss);

  // Wall Damage from battle clash & drones
  const wallDamage =
    attTacticId === 'ARTILLERY_PREP'
      ? 20
      : Math.round(attDroneShare * 15 + 6);
  const nextWall = Math.max(0, currentState.castleWallHp - wallDamage);

  // Build narrative combat log
  const newLogs: string[] = [
    `▶ RAUND ${roundNum}: Taarruz Doktrini: [${attCard.name}] ⚡ Savunma Doktrini: [${defCard.name}]`,
    `💥 Çarpışma: ${attackerNation.name} -${rawAttLoss.toLocaleString('tr-TR')} asker kaybetti · ${defenderNation.name} -${rawDefLoss.toLocaleString('tr-TR')} asker kaybetti.`,
  ];

  if (attTacticId === 'HILAL_TURAN' && defTacticId !== 'IRON_PORCUPINE') {
    newLogs.push('🏹 Kurt Kapanı Başarılı: Düşman kanatları yarılarak derinlemesine kuşatıldı! Savunan saflarda panik (-Moral).');
  } else if (defTacticId === 'IRON_PORCUPINE' && attTacticId === 'ALL_OUT_CHARGE') {
    newLogs.push('🛡️ Kirpi Siperleri Direndi: Düşmanın süngü hücumu makineli tüfek ve tanksavar barajına çarptı!');
  } else if (attTacticId === 'ARTILLERY_PREP') {
    newLogs.push(`🎯 SİHA & Topçu Barajı: Düşman kale surları dövüldü (-%${wallDamage} Sur Dayanıklılığı).`);
  }

  // Check victory / defeat conditions
  let nextStatus: TacticalBattleState['status'] = 'ENGAGING';
  let outcome: TacticalBattleState['outcome'] = undefined;

  const attackerBroken = nextAttTroops <= 500 || nextAttMorale <= 12;
  const defenderBroken = nextDefTroops <= 300 || nextDefMorale <= 10;

  if (defenderBroken && !attackerBroken) {
    nextStatus = isPlayerAttacker ? 'VICTORY' : 'DEFEAT';
    newLogs.push(`🏆 ZAFER: ${defenderNation.name} safları tamamen yarıldı ve dağıldı! ${currentState.territoryName} fethedildi!`);
    outcome = {
      winnerId: currentState.attackerNationId,
      loserId: currentState.defenderNationId,
      attackerSurvivingTroops: nextAttTroops,
      defenderSurvivingTroops: nextDefTroops,
      attackerTotalLosses: currentState.attackerMaxTroops - nextAttTroops,
      defenderTotalLosses: currentState.defenderMaxTroops - nextDefTroops,
      territoryConquered: true,
      earnedResearch: 35,
      earnedInfluence: 25,
    };
  } else if (attackerBroken && !defenderBroken) {
    nextStatus = isPlayerAttacker ? 'DEFEAT' : 'VICTORY';
    newLogs.push(`🛑 BOZGUN: ${attackerNation.name} taarruzu püskürtüldü! Kalan birlikler düzensiz geri çekiliyor.`);
    outcome = {
      winnerId: currentState.defenderNationId,
      loserId: currentState.attackerNationId,
      attackerSurvivingTroops: nextAttTroops,
      defenderSurvivingTroops: nextDefTroops,
      attackerTotalLosses: currentState.attackerMaxTroops - nextAttTroops,
      defenderTotalLosses: currentState.defenderMaxTroops - nextDefTroops,
      territoryConquered: false,
      earnedResearch: 24,
      earnedInfluence: 15,
    };
  } else if (roundNum >= currentState.maxRounds) {
    // Decision on rounds limit: whoever has higher remaining troops/morale ratio wins
    const attRatio = (nextAttTroops / currentState.attackerMaxTroops) * 0.6 + (nextAttMorale / 100) * 0.4;
    const defRatio = (nextDefTroops / currentState.defenderMaxTroops) * 0.6 + (nextDefMorale / 100) * 0.4;

    if (attRatio > defRatio) {
      nextStatus = isPlayerAttacker ? 'VICTORY' : 'DEFEAT';
      newLogs.push(`🏆 Çetin muharebe sonunda ${attackerNation.name} cepheyi yardı ve şehri ele geçirdi!`);
      outcome = {
        winnerId: currentState.attackerNationId,
        loserId: currentState.defenderNationId,
        attackerSurvivingTroops: nextAttTroops,
        defenderSurvivingTroops: nextDefTroops,
        attackerTotalLosses: currentState.attackerMaxTroops - nextAttTroops,
        defenderTotalLosses: currentState.defenderMaxTroops - nextDefTroops,
        territoryConquered: true,
        earnedResearch: 28,
        earnedInfluence: 20,
      };
    } else {
      nextStatus = isPlayerAttacker ? 'DEFEAT' : 'VICTORY';
      newLogs.push(`🛑 Savunan garnizon 5 çetin raunt boyunca mevzilerini korumayı başardı.`);
      outcome = {
        winnerId: currentState.defenderNationId,
        loserId: currentState.attackerNationId,
        attackerSurvivingTroops: nextAttTroops,
        defenderSurvivingTroops: nextDefTroops,
        attackerTotalLosses: currentState.attackerMaxTroops - nextAttTroops,
        defenderTotalLosses: currentState.defenderMaxTroops - nextDefTroops,
        territoryConquered: false,
        earnedResearch: 24,
        earnedInfluence: 15,
      };
    }
  }

  return {
    ...currentState,
    attackerTroops: nextAttTroops,
    defenderTroops: nextDefTroops,
    attackerMorale: nextAttMorale,
    defenderMorale: nextDefMorale,
    castleWallHp: nextWall,
    selectedPlayerTactic: playerTacticId,
    selectedAiTactic: isPlayerAttacker ? defTacticId : attTacticId,
    round: roundNum + (nextStatus === 'ENGAGING' ? 1 : 0),
    combatLog: [...currentState.combatLog, ...newLogs],
    status: nextStatus,
    outcome,
  };
}

export function autoResolveTacticalBattle(
  battle: TacticalBattleState,
  isPlayerAttacker: boolean,
  attackerNation: Nation,
  defenderNation: Nation
): TacticalBattleState {
  let current = { ...battle };
  const preferredTactic: TacticalFormationId = isPlayerAttacker
    ? current.selectedPlayerTactic || 'HILAL_TURAN'
    : 'IRON_PORCUPINE';

  while (
    current.status !== 'VICTORY' &&
    current.status !== 'DEFEAT' &&
    current.round <= current.maxRounds
  ) {
    current = resolveTacticalRound(
      current,
      preferredTactic,
      isPlayerAttacker,
      attackerNation,
      defenderNation
    );
  }
  return current;
}
