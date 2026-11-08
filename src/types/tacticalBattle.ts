import { TerrainType, UnitComposition } from './game';

export type TacticalFormationId =
  | 'HILAL_TURAN'
  | 'FLANK_PENETRATION'
  | 'ARTILLERY_PREP'
  | 'IRON_PORCUPINE'
  | 'ALL_OUT_CHARGE'
  | 'BALANCED_LINE';

export interface TacticalFormationCard {
  id: TacticalFormationId;
  name: string;
  badge: string;
  attackBonusPct: number;
  defenseBonusPct: number;
  moraleDamagePct: number;
  casualtyReductionPct: number;
  description: string;
  historyNote: string;
}

export interface TacticalBattleState {
  battleId: string;
  territoryId: string;
  territoryName: string;
  terrain: TerrainType;
  castleWallHp: number;
  attackerNationId: string;
  defenderNationId: string;
  attackerTroops: number;
  defenderTroops: number;
  attackerMaxTroops: number;
  defenderMaxTroops: number;
  attackerMorale: number; // 0 to 100
  defenderMorale: number; // 0 to 100
  attackerUnits: UnitComposition;
  defenderUnits: UnitComposition;
  attackerCommanderId: string | null;
  defenderCommanderId: string | null;
  selectedPlayerTactic: TacticalFormationId;
  selectedAiTactic: TacticalFormationId;
  round: number;
  maxRounds: number;
  combatLog: string[];
  status: 'PREPARATION' | 'ENGAGING' | 'VICTORY' | 'DEFEAT';
  // Result payload when battle ends
  outcome?: {
    winnerId: string;
    loserId: string;
    attackerSurvivingTroops: number;
    defenderSurvivingTroops: number;
    attackerTotalLosses: number;
    defenderTotalLosses: number;
    territoryConquered: boolean;
    earnedResearch: number;
    earnedInfluence: number;
  };
}
