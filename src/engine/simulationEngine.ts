import {
  COMMANDERS,
  IDEOLOGIES,
  RESOURCE_INFO,
  getArmyGenerationInfo,
  getNationModernizedTier,
} from '../data/world2026Data';
import {
  ActiveWar,
  ArmyMovement,
  DiplomaticRelation,
  GameModeId,
  Nation,
  Territory,
  ResourceType,
  UnitComposition,
} from '../types/game';
import { relationKey } from './worldBuilder';
import { isNationEmbargoed } from './embargoUtils';
import { TERRAIN_INFO } from './pashaAndFiefEngine';
import {
  calculateNationTradeAndStraits,
  NationTradeAndStraitsSummary,
} from './straitsAndTradeEngine';

export interface NationEconomyBreakdown {
  territoryCount: number;
  totalPopulation: number;
  totalGarrison: number;
  totalUnits: UnitComposition;
  taxIncome: number;
  productionIncome: number;
  tradeIncome: number;
  straitTollIncome: number;
  caravanTradeIncome: number;
  seizedBlockadeIncome: number;
  blockadePenaltyLoss: number;
  tradeDetails: NationTradeAndStraitsSummary;
  vassalIncome: number;
  vassalTributeOut: number;
  militaryUpkeep: number;
  inflationPenalty: number;
  inflationRelief: number;
  netDailyGold: number;
  dailyResearch: number;
  dailyManpower: number;
}

type ResourceEconomicEffect = {
  taxPct?: number;
  productionPct?: number;
  tradePct?: number;
  researchFlat?: number;
  manpowerPct?: number;
  militaryUpkeepReductionPct?: number;
};

// AOH3-style resource identity: owning the leading source of a resource gives
// one national specialization bonus. GDP output remains territory-local below.
const RESOURCE_ECONOMIC_EFFECTS: Partial<
  Record<ResourceType, ResourceEconomicEffect>
> = {
  PETROL: { productionPct: 8 },
  DOGALGAZ: { productionPct: 6, tradePct: 4 },
  YARI_ILETKEN: { researchFlat: 2.5 },
  DEMIR_CELIK: { militaryUpkeepReductionPct: 5 },
  TAHIL: { manpowerPct: 8 },
  TICARET_BOGAZI: { tradePct: 12 },
  NADIR_TOPRAK: { productionPct: 4, researchFlat: 1.5 },
  FINANS_MERKEZI: { taxPct: 12 },
};

export function getOrCreateRelation(
  relations: Record<string, DiplomaticRelation>,
  a: string,
  b: string
): DiplomaticRelation {
  const key = relationKey(a, b);
  if (relations[key]) {
    return relations[key];
  }
  return {
    nationA: a < b ? a : b,
    nationB: a < b ? b : a,
    score: 0,
    isAllied: false,
    allianceType: null,
    hasNonAggression: false,
    hasTradeAgreement: false,
    hasEmbargo: false,
    embargoingNationIds: [],
    hasMilitaryAccess: false,
    truceUntilTick: 0,
  };
}

export interface WarParticipantsResolution {
  attackers: string[];
  defenders: string[];
  offensiveAlliesCalled: string[];
  defensiveAlliesCalled: string[];
}

/**
 * Resolves war coalition participants based on Defensive and Offensive Pacts:
 * - Attacker side: ONLY nations with an OFFENSIVE pact ('OFFENSIVE') join the attack.
 *   Defensive pact allies DO NOT participate in offensive wars.
 * - Defender side: Defender is attacked, so BOTH 'DEFENSIVE' and 'OFFENSIVE' pacts
 *   trigger to defend their ally against foreign aggression!
 */
export function resolveWarParticipants(
  attackerId: string,
  defenderId: string,
  relations: Record<string, DiplomaticRelation>,
  nations: Record<string, Nation>
): WarParticipantsResolution {
  const attackers = new Set<string>([attackerId]);
  const defenders = new Set<string>([defenderId]);
  const offensiveAlliesCalled: string[] = [];
  const defensiveAlliesCalled: string[] = [];

  // Attacker side: ONLY Offensive Pact allies join the attack
  Object.values(relations).forEach((rel) => {
    const isAttackerPartner =
      rel.nationA === attackerId || rel.nationB === attackerId;
    if (!isAttackerPartner) return;

    const partnerId = rel.nationA === attackerId ? rel.nationB : rel.nationA;
    if (partnerId === defenderId) return;
    const partnerNation = nations[partnerId];
    if (!partnerNation || partnerNation.isEliminated) return;

    if (rel.allianceType === 'OFFENSIVE') {
      attackers.add(partnerId);
      offensiveAlliesCalled.push(partnerId);
    }
  });

  // Defender side: Target is attacked -> Both Defensive Pacts and Offensive Pacts trigger to defend!
  Object.values(relations).forEach((rel) => {
    const isDefenderPartner =
      rel.nationA === defenderId || rel.nationB === defenderId;
    if (!isDefenderPartner) return;

    const partnerId = rel.nationA === defenderId ? rel.nationB : rel.nationA;
    if (attackers.has(partnerId)) return;
    const partnerNation = nations[partnerId];
    if (!partnerNation || partnerNation.isEliminated) return;

    if (
      rel.allianceType === 'DEFENSIVE' ||
      rel.allianceType === 'OFFENSIVE' ||
      (rel.isAllied && !rel.allianceType)
    ) {
      defenders.add(partnerId);
      defensiveAlliesCalled.push(partnerId);
    }
  });

  // Vassals of defender automatically defend
  Object.values(nations).forEach((n) => {
    if (n.vassalOf === defenderId && !n.isEliminated && !attackers.has(n.id)) {
      defenders.add(n.id);
      defensiveAlliesCalled.push(n.id);
    }
  });

  return {
    attackers: Array.from(attackers),
    defenders: Array.from(defenders),
    offensiveAlliesCalled,
    defensiveAlliesCalled,
  };
}

export function isAtWar(
  wars: ActiveWar[],
  nationA: string,
  nationB: string
): ActiveWar | undefined {
  return wars.find(
    (w) =>
      (w.attackers.includes(nationA) && w.defenders.includes(nationB)) ||
      (w.attackers.includes(nationB) && w.defenders.includes(nationA))
  );
}

export function getWarScoreForNation(
  war: ActiveWar,
  nationId: string
): number | null {
  if (war.attackers?.includes(nationId) || war.attackerId === nationId) {
    return war.attackerWarScore;
  }
  if (war.defenders?.includes(nationId) || war.defenderId === nationId) {
    return -war.attackerWarScore;
  }
  return null;
}

export function calculateNationEconomy(
  nation: Nation,
  territories: Record<string, Territory>,
  nations: Record<string, Nation>,
  relations: Record<string, DiplomaticRelation>,
  activeMovements: ArmyMovement[],
  wars: ActiveWar[] = [],
  gameMode: GameModeId = 'EMPIRES_1440'
): NationEconomyBreakdown {
  const ownedTerritories = Object.values(territories).filter(
    (t) => t && t.ownerId === nation.id
  );

  const ideology = IDEOLOGIES[nation.ideology] || IDEOLOGIES.MONARCHY;
  let totalPopulation = 0;
  let totalGarrison = 0;
  const totalUnits: UnitComposition = { infantry: 0, armor: 0, airDrone: 0 };
  let baseProduction = 0;
  let universityOutput = 0;
  let barracksManpower = 0;
  let tradeHubBonus = 0;
  let tradeHubLevels = 0;
  const resourceEffects = {
    taxPct: 0,
    productionPct: 0,
    tradePct: 0,
    researchFlat: 0,
    manpowerPct: 0,
    militaryUpkeepReductionPct: 0,
  };
  const claimedResourceBonuses = new Set<ResourceType>();

  ownedTerritories.forEach((t) => {
    totalPopulation += t.population || 0;
    totalGarrison += t.garrison || 0;
    if (t.units) {
      totalUnits.infantry += t.units.infantry || 0;
      totalUnits.armor += t.units.armor || 0;
      totalUnits.airDrone += t.units.airDrone || 0;
    }

    const resMult = RESOURCE_INFO[t.resource]?.gdpMultiplier || 1.0;
    const bld = t.buildings || {
      factory: 0,
      barracks: 0,
      fortress: 0,
      university: 0,
      tradeHub: 0,
      supplyDepot: 0,
    };
    const factoryMult = 1 + (bld.factory || 0) * 0.25;
    const unrestPenalty = Math.max(0.35, 1 - (t.unrest || 0) * 0.006);

    baseProduction += (t.baseGdp || 40) * resMult * factoryMult * unrestPenalty;
    universityOutput += (bld.university || 0) * 4.5;
    barracksManpower += (bld.barracks || 0) * 350;
    tradeHubBonus += (bld.tradeHub || 0) * 0.2;
    tradeHubLevels += bld.tradeHub || 0;

    const resourceEffect = RESOURCE_ECONOMIC_EFFECTS[t.resource];
    if (resourceEffect && !claimedResourceBonuses.has(t.resource)) {
      claimedResourceBonuses.add(t.resource);
      resourceEffects.taxPct += resourceEffect.taxPct || 0;
      resourceEffects.productionPct += resourceEffect.productionPct || 0;
      resourceEffects.tradePct += resourceEffect.tradePct || 0;
      resourceEffects.researchFlat += resourceEffect.researchFlat || 0;
      resourceEffects.manpowerPct += resourceEffect.manpowerPct || 0;
      resourceEffects.militaryUpkeepReductionPct +=
        resourceEffect.militaryUpkeepReductionPct || 0;
    }
  });

  // Progressive empire scale: 1-3 province countries retain 100%, large 10-20 province empires scale smoothly so economy stays strategic
  const empireScale =
    ownedTerritories.length <= 3
      ? 1.0
      : Math.max(0.32, 2.35 / Math.pow(ownedTerritories.length, 0.62));
  baseProduction = baseProduction * empireScale;

  const movingTroops = activeMovements
    .filter((m) => m && m.ownerId === nation.id)
    .reduce((sum, m) => sum + (m.troops || 0), 0);

  const totalTroops = totalGarrison + movingTroops;

  const unlockedTechs = nation.unlockedTechs || [];
  const enactedReforms = nation.enactedReforms || [];
  const budget = nation.budget || {
    military: 35,
    economy: 30,
    research: 15,
    welfare: 20,
  };

  const taxRateFactor = (nation.taxRate || 25) / 25;
  let taxTechMult = 1 + ideology.taxBonus / 100;
  taxTechMult += resourceEffects.taxPct / 100;
  if (unlockedTechs.includes('eco_1')) taxTechMult += 0.15;
  if (unlockedTechs.includes('eco_4')) taxTechMult += 0.2;
  if (enactedReforms.includes('ref_free_trade_zones')) taxTechMult += 0.2;

  const taxIncome = Math.round(
    baseProduction * 0.55 * taxRateFactor * taxTechMult
  );

  let prodMult = 1 + ((budget.economy || 25) - 25) * 0.008;
  prodMult += resourceEffects.productionPct / 100;
  if (unlockedTechs.includes('eco_2')) prodMult += 0.25;
  if (unlockedTechs.includes('sci_2')) prodMult += 0.15;
  if (unlockedTechs.includes('sci_4')) prodMult += 0.35;

  const productionIncome = Math.round(baseProduction * 0.48 * prodMult);

  let tradeAgreementCount = 0;
  let embargoCount = 0;
  Object.values(relations).forEach((rel) => {
    if (!rel) return;
    if (rel.nationA === nation.id || rel.nationB === nation.id) {
      if (rel.hasTradeAgreement) tradeAgreementCount++;
      if (isNationEmbargoed(rel, nation.id)) embargoCount++;
    }
  });

  let tradeMult =
    1 + tradeHubBonus + tradeAgreementCount * 0.14 + resourceEffects.tradePct / 100;
  if (unlockedTechs.includes('eco_3')) tradeMult += 0.3;
  if (enactedReforms.includes('ref_free_trade_zones')) tradeMult += 0.2;

  const embargoResistance = unlockedTechs.includes('sci_2') ? 0.5 : 1.0;
  const embargoFactor = Math.max(
    0.35,
    1 - embargoCount * 0.18 * embargoResistance
  );

  const baseDomesticTrade = Math.round(
    baseProduction * 0.2 * tradeMult * embargoFactor
  );
  const tradeDetails = calculateNationTradeAndStraits({
    nationId: nation.id,
    gameMode,
    territories,
    nations,
    relations,
    wars,
  });
  const straitTollIncome = Math.round(
    tradeDetails.straitTollIncome * (ownedTerritories.length > 6 ? 0.65 : 1)
  );
  const caravanTradeIncome = Math.round(
    tradeDetails.caravanTradeIncome * (ownedTerritories.length > 6 ? 0.65 : 1)
  );
  const seizedBlockadeIncome = tradeDetails.seizedBlockadeIncome;
  const blockadePenaltyLoss = tradeDetails.blockadePenaltyLoss;

  const tradeIncome =
    baseDomesticTrade +
    straitTollIncome +
    caravanTradeIncome +
    seizedBlockadeIncome;

  let vassalIncome = 0;
  Object.values(nations).forEach((other) => {
    if (other && other.vassalOf === nation.id && !other.isEliminated) {
      vassalIncome += 55;
    }
  });
  if (unlockedTechs.includes('adm_4')) {
    vassalIncome = Math.round(vassalIncome * 1.5);
  }

  const vassalTributeOut = nation.vassalOf ? Math.round(taxIncome * 0.25) : 0;

  let upkeepPerThousand = 1.65 * (0.75 + (budget.military || 35) / 100);
  upkeepPerThousand *=
    1 - Math.min(0.3, resourceEffects.militaryUpkeepReductionPct / 100);
  if (enactedReforms.includes('ref_professional_army')) {
    upkeepPerThousand *= 0.9;
  }
  if (nation.ideology === 'MILITARY_JUNTA') {
    upkeepPerThousand *= 0.82;
  }
  const militaryUpkeep = Math.round((totalTroops / 1000) * upkeepPerThousand);

  const grossIncome = taxIncome + productionIncome + tradeIncome + vassalIncome;
  const incomeAfterTribute = grossIncome - vassalTributeOut;
  const inflationPenalty = Math.round(
    incomeAfterTribute * Math.min(0.65, (nation.inflation || 0) / 120)
  );

  const netDailyGold = incomeAfterTribute - militaryUpkeep - inflationPenalty;

  let researchBase =
    2.5 +
    Math.min(7.5, ownedTerritories.length * 0.55) +
    universityOutput +
    (budget.research || 15) * 0.11 +
    resourceEffects.researchFlat;
  if (enactedReforms.includes('ref_welfare_state')) researchBase += 5;
  let researchMult = 1 + ideology.researchBonus / 100;
  if (unlockedTechs.includes('sci_1')) researchMult += 0.2;
  if (unlockedTechs.includes('sci_3')) researchMult += 0.25;
  const dailyResearch = Number((researchBase * researchMult).toFixed(1));

  const manpowerBase =
    180 + Math.round(totalPopulation * 0.0022 * empireScale) + barracksManpower;
  let manpowerMult =
    1 + ideology.manpowerGrowthBonus / 100 + resourceEffects.manpowerPct / 100;
  if (unlockedTechs.includes('adm_3')) manpowerMult += 0.35;
  const dailyManpower = Math.round(manpowerBase * manpowerMult);

  return {
    territoryCount: ownedTerritories.length,
    totalPopulation,
    totalGarrison: totalTroops,
    totalUnits,
    taxIncome,
    productionIncome,
    tradeIncome,
    straitTollIncome,
    caravanTradeIncome,
    seizedBlockadeIncome,
    blockadePenaltyLoss,
    tradeDetails,
    vassalIncome,
    vassalTributeOut,
    militaryUpkeep,
    inflationPenalty,
    inflationRelief: Math.min(0.2, tradeHubLevels * 0.02),
    netDailyGold,
    dailyResearch,
    dailyManpower,
  };
}

export function computeCombatStrength(
  nation: Nation,
  territory: Territory,
  isDefender: boolean,
  unitComp?: UnitComposition
): number {
  const ideology = IDEOLOGIES[nation?.ideology] || IDEOLOGIES.MONARCHY;
  let mult = 1 + ideology.militaryAttackBonus / 100;

  // Budget effect
  mult += ((nation?.budget?.military ?? 25) - 25) * 0.006;

  // Tech bonuses
  const unlockedTechs = nation?.unlockedTechs || [];
  const enactedReforms = nation?.enactedReforms || [];
  if (unlockedTechs.includes('mil_1')) mult += 0.12;
  if (unlockedTechs.includes('mil_2')) mult += 0.18;
  if (unlockedTechs.includes('mil_3')) mult += 0.25;
  if (enactedReforms.includes('ref_professional_army')) mult += 0.15;

  // National Army Modernization Generation Bonus (applied once standing armies are modernized to unlocked tech!)
  const modernizedTier = getNationModernizedTier(nation);
  if (modernizedTier > 0) {
    mult += getArmyGenerationInfo(undefined, modernizedTier).combatBonusPct / 100;
  }

  // Active Commander (General) bonus
  if (nation?.activeGeneralId) {
    const cmd = COMMANDERS.find((c) => c.id === nation.activeGeneralId);
    if (cmd) {
      mult += (isDefender ? cmd.defenseBonus : cmd.attackBonus) / 100;
    }
  }

  // Bannerlord Summoned Lords (Sancak Ordusu) Attack Bonus
  if (!isDefender && nation?.bannerCalledLordIds?.length) {
    mult += nation.bannerCalledLordIds.length * 0.12;
  }

  const terrainMeta =
    TERRAIN_INFO[territory?.terrain || 'OVA'] || TERRAIN_INFO.OVA;

  // Unit composition bonuses (Armor & Air/Drone + Terrain Armor synergy)
  const comp = unitComp || territory?.units;
  if (comp) {
    const total = Math.max(
      1,
      (comp.infantry || 0) + (comp.armor || 0) + (comp.airDrone || 0)
    );
    const armorShare = (comp.armor || 0) / total;
    const airShare = (comp.airDrone || 0) / total;
    const terrainArmorMod = !isDefender
      ? terrainMeta.armorAttackBonusPct / 100
      : 0;
    mult +=
      armorShare * (0.4 + terrainArmorMod) + airShare * 0.35;
  }

  if (isDefender) {
    // Terrain defense bonus (e.g. Dağlık +30%, Metropol +22%, Orman +16%)
    mult += terrainMeta.defenseBonusPct / 100;

    // Castle Wall HP scales fortress effectiveness during sieges
    const wallIntegrity = (territory?.castleWallHp ?? 100) / 100;
    mult += (territory?.buildings?.fortress || 0) * 0.24 * wallIntegrity;

    // Fief Lord (Tımar Beyi / Paşa) personal defense bonus
    if (territory?.fiefLordId) {
      mult += 0.15;
    }

    if (unlockedTechs.includes('mil_4')) mult += 0.3;
  }

  return Math.max(0.5, mult);
}

export function formatGameDate(
  tick: number,
  modeId?: string,
  hour?: number
): string {
  const startYear = modeId === 'EMPIRES_1440' ? 1440 : 2026;
  const safeTick = Number.isFinite(tick) ? Math.max(0, Math.floor(tick)) : 0;
  const start = new Date(Date.UTC(startYear, 0, 1));
  start.setUTCDate(start.getUTCDate() + safeTick);
  const months = [
    'Oca',
    'Şub',
    'Mar',
    'Nis',
    'May',
    'Haz',
    'Tem',
    'Ağu',
    'Eyl',
    'Eki',
    'Kas',
    'Ara',
  ];
  const baseDate = `${start.getUTCDate()} ${months[start.getUTCMonth()]} ${start.getUTCFullYear()}`;
  if (typeof hour === 'number' && Number.isFinite(hour)) {
    const clampedHour = ((Math.floor(hour) % 24) + 24) % 24;
    const hh = String(clampedHour).padStart(2, '0');
    return `${baseDate} · ${hh}:00`;
  }
  return baseDate;
}
