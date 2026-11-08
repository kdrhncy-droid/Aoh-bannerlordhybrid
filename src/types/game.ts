export type GameScreenState = 'TITLE_MENU' | 'PLAYING' | 'VICTORY_SUMMARY';

export type GameModeId =
  | 'EMPIRES_1440'
  | 'STANDARD_2026'
  | 'GLOBAL_COALITION_CRISIS'
  | 'ECONOMIC_HEGEMONY'
  | 'SANDBOX_EMPIRE';

export type MapMode =
  | 'POLITICAL'
  | 'RELIGION'
  | 'CULTURE'
  | 'ASSIMILATION'
  | 'TERRAIN'
  | 'DIPLOMATIC'
  | 'ECONOMIC'
  | 'IDEOLOGY'
  | 'MILITARY';

export type TerrainType = 'OVA' | 'DAGLIK' | 'ORMAN' | 'COL' | 'METROPOL';

export type SpeedLevel = 0 | 1 | 2 | 4 | 5;

export type IdeologyId =
  | 'DEMOCRACY'
  | 'AUTHORITARIAN'
  | 'MONARCHY'
  | 'SOCIALIST'
  | 'MILITARY_JUNTA'
  | 'TECHNO_CORPORATISM';

export type ResourceType =
  | 'PETROL'
  | 'DOGALGAZ'
  | 'YARI_ILETKEN'
  | 'DEMIR_CELIK'
  | 'TAHIL'
  | 'TICARET_BOGAZI'
  | 'NADIR_TOPRAK'
  | 'FINANS_MERKEZI';

export type BuildingType =
  | 'factory'
  | 'barracks'
  | 'fortress'
  | 'university'
  | 'tradeHub'
  | 'supplyDepot';

export type UnitType = 'infantry' | 'armor' | 'airDrone';

export interface UnitComposition {
  infantry: number;
  armor: number;
  airDrone: number;
}

export interface Commander {
  id: string;
  name: string;
  title: string;
  specialty: string;
  costGold: number;
  attackBonus: number; // %
  defenseBonus: number; // %
  casualtyReduction: number; // %
}

export interface BuildingDefinition {
  id: BuildingType;
  name: string;
  description: string;
  baseCost: number;
  maxLevel: number;
  effectSummary: string;
}

export interface IdeologyDefinition {
  id: IdeologyId;
  name: string;
  description: string;
  color: string;
  taxBonus: number; // %
  militaryAttackBonus: number; // %
  manpowerGrowthBonus: number; // %
  researchBonus: number; // %
  unrestReduction: number;
  diplomacyModifier: number;
}

export type TechBranch = 'MILITARY' | 'ECONOMY' | 'ADMINISTRATION' | 'SCIENCE';

export interface TechDefinition {
  id: string;
  name: string;
  branch: TechBranch;
  tier: number;
  cost: number;
  prerequisite?: string;
  description: string;
  effectLabel: string;
}

export interface ReformDefinition {
  id: string;
  name: string;
  category: string;
  costGold: number;
  costResearch: number;
  description: string;
  effectLabel: string;
}

export interface FormableEmpireDefinition {
  id: string;
  name: string;
  newFlagCode: string;
  newColor: string;
  requiredProvinces: number;
  requiredTerritoryIds?: string[];
  requiredTerritoryNames?: string[];
  requiredTechCount?: number;
  goldCost?: number;
  allowedNationIds?: string[];
  description: string;
  bonusSummary: string;
  treasuryReward: number;
  manpowerReward: number;
  stabilityReward: number;
}

export interface PendingWarMoveRequest {
  fromId: string;
  toId: string;
  targetNationId: string;
}

export interface TerritoryBuildings {
  factory: number;
  barracks: number;
  fortress: number;
  university: number;
  tradeHub: number;
  supplyDepot: number;
}

export interface Territory {
  id: string;
  name: string;
  ownerId: string;
  coreOwnerId: string;
  isCapital?: boolean;
  terrain?: TerrainType;
  fiefLordId?: string | null;
  castleWallHp?: number; // 0-100
  population: number; // in thousands
  baseGdp: number; // daily base economic output
  resource: ResourceType;
  buildings: TerritoryBuildings;
  garrison: number; // total stationed troops in this territory
  units: UnitComposition;
  unrest: number; // 0-100
  isOccupied: boolean;
  occupiedById?: string;
  centroid: [number, number]; // [lon, lat]
  neighbors: string[]; // adjacent territory IDs
  siege?: ActiveSiege | null;
  assimilation?: number; // 0 to 100% (Core status)
  isAssimilating?: boolean; // active assimilation ongoing
  constructionQueue?: QueuedBuildingConstruction[]; // ongoing building construction projects
  religion?: ReligionId;
  culture?: CultureId;
  missionary?: ActiveMissionaryConversion | null;
}

export type ReligionId =
  | 'ISLAM_SUNNI'
  | 'ISLAM_SHIA'
  | 'CHRISTIAN_ORTHODOX'
  | 'CHRISTIAN_CATHOLIC'
  | 'TENGERISM_STEPPE'
  | 'BUDDHISM_EAST'
  | 'HINDUISM_VEDIC'
  | 'INDIGENOUS_AMERICAN';

export interface ReligionDefinition {
  id: ReligionId;
  name: string;
  symbol: string;
  color: string;
  description: string;
  moralBonus: number;
  stabilityBonus: number;
}

export type CultureId =
  | 'TURKIC_OGHUZ'
  | 'GREEK_BYZANTINE'
  | 'ARABIC_LEVANT'
  | 'PERSIAN_IRANIC'
  | 'SLAVIC_EAST_SOUTH'
  | 'GERMANIC_CENTRAL'
  | 'ROMANCE_LATIN'
  | 'MONGOL_STEPPE'
  | 'SINIC_HAN'
  | 'JAPANESE_YAMATO'
  | 'AMERINDIAN';

export interface CultureDefinition {
  id: CultureId;
  name: string;
  color: string;
  description: string;
}

export interface ActiveMissionaryConversion {
  targetReligion: ReligionId;
  progressDays: number;
  totalDays: number;
}

export interface ActiveResearchProject {
  techId: string;
  progress: number; // accumulated research points
  totalCost: number; // required research points
  startedTick: number;
}

export interface QueuedBuildingConstruction {
  id: string;
  building: keyof TerritoryBuildings;
  targetLevel: number;
  progressDays: number;
  totalDays: number;
  goldCost: number;
}

export interface ActiveSiege {
  territoryId: string;
  attackerId: string;
  defenderId: string;
  attackerTroops: number;
  attackerUnits?: UnitComposition;
  progress: number; // 0 to 100%
  wallIntegrity: number; // 0 to 100
  startedTick: number;
}

export interface BudgetAllocation {
  military: number; // 0-100
  economy: number; // 0-100
  research: number; // 0-100
  welfare: number; // 0-100
}

export interface Nation {
  id: string;
  name: string;
  flagCode: string;
  color: string;
  capitalTerritoryId: string;
  ideology: IdeologyId;
  treasury: number;
  diplomacyPoints?: number; // 0-100; replenishes daily and fuels diplomatic actions
  manpower: number;
  stability: number; // 0-100
  inflation: number; // 0-100%
  researchPoints: number;
  activeResearch?: ActiveResearchProject | null;
  researchProgressByTech?: Record<string, number>;
  stateReligion?: ReligionId;
  primaryCulture?: CultureId;
  taxRate: number; // 10 - 60%
  budget: BudgetAllocation;
  aggressiveExpansion: number; // 0-100 (triggers coalitions > 50)
  unlockedTechs: string[];
  enactedReforms: string[];
  recruitedGeneralIds: string[];
  activeGeneralId: string | null;
  clanInfluence?: number; // Bannerlord-style Clan Influence (⚜)
  modernizedArmyTier?: number; // 0..4 National Army Modernization Tier synced with Military Tech Tree
  lordLoyalties?: Record<string, number>; // 0..100 Loyalty score per recruited Pasha / Clan Lord
  armyXp?: number; // Legacy field kept optional for old save compatibility
  bannerCalledLordIds?: string[]; // Lords currently summoned to the Ruler's Banner Army
  formedEmpireId?: string | null;
  vassalOf?: string | null;
  isEliminated: boolean;
}

export type AllianceType = 'DEFENSIVE' | 'OFFENSIVE';

export interface DiplomaticRelation {
  nationA: string;
  nationB: string;
  score: number; // -100 to +100
  isAllied: boolean; // Backwards compatible: true if has offensive or defensive pact
  allianceType?: AllianceType | null; // 'DEFENSIVE' (Savunma Paktı) | 'OFFENSIVE' (Saldırı Paktı)
  hasNonAggression: boolean;
  hasTradeAgreement: boolean;
  hasEmbargo: boolean;
  embargoingNationIds?: string[];
  hasMilitaryAccess: boolean;
  truceUntilTick: number;
}

export interface ActiveWar {
  id: string;
  name: string;
  attackerId: string;
  defenderId: string;
  attackers: string[];
  defenders: string[];
  startedTick: number;
  attackerWarScore: number; // -100 to +100
  casualtiesAttacker: number;
  casualtiesDefender: number;
}

export interface ActiveBattle {
  id: string;
  territoryId: string;
  fromTerritoryId?: string;
  attackerId: string;
  defenderId: string;
  attackerTroops: number;
  attackerInitialTroops?: number;
  attackerUnits: UnitComposition;
  defenderTroops: number;
  defenderInitialTroops?: number;
  defenderUnits: UnitComposition;
  round: number;
  combatWidth?: number; // Savaş Genişliği
  attackerMorale?: number; // 0 to 100%
  defenderMorale?: number; // 0 to 100%
  attackerTuranPowerBonus?: number; // One-round combat power bonus in percentage points
  defenderTuranPowerBonus?: number;
  attackerTuranUsed?: boolean;
  defenderTuranUsed?: boolean;
  attackerFrontline?: number;
  attackerBackline?: number;
  defenderFrontline?: number;
  defenderBackline?: number;
  attackerCommanderName?: string;
  defenderCommanderName?: string;
}

export interface ArmyMovement {
  id: string;
  ownerId: string;
  fromTerritoryId: string;
  toTerritoryId: string;
  routeQueue?: string[]; // Remaining multi-hop A* territory IDs after reaching toTerritoryId
  finalDestinationId?: string;
  troops: number;
  units: UnitComposition;
  progress: number; // 0 to 100
  isAttack: boolean;
}

export interface WorldNewsEvent {
  id: string;
  tick: number;
  dateStr: string;
  title: string;
  description: string;
  type: 'WAR' | 'PEACE' | 'COALITION' | 'ECONOMY' | 'REFORM';
}

export interface CrisisOptionEffect {
  treasuryDelta?: number;
  manpowerDelta?: number;
  stabilityDelta?: number;
  inflationDelta?: number;
  researchDelta?: number;
  aeDelta?: number;
  garrisonBonus?: number;
}

export interface CrisisEventOption {
  id: string;
  label: string;
  effectSummary: string;
  effects: CrisisOptionEffect;
}

export interface CrisisEventDefinition {
  id: string;
  title: string;
  category: 'JEOPOLITIK' | 'EKONOMI' | 'ASKERI' | 'TEKNOLOJI';
  description: string;
  options: CrisisEventOption[];
}

export type BottomDrawerTab =
  | 'NONE'
  | 'TERRITORY'
  | 'ECONOMY'
  | 'DIPLOMACY'
  | 'GOVERNMENT'
  | 'MILITARY';
