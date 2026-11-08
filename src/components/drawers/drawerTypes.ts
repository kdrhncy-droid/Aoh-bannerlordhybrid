import {
  ActiveWar,
  ArmyMovement,
  BottomDrawerTab,
  BuildingType,
  DiplomaticRelation,
  GameModeId,
  IdeologyId,
  Nation,
  Territory,
  UnitType,
} from '../../types/game';
import { NationEconomyBreakdown } from '../../engine/simulationEngine';

export type DiplomaticActionType =
  | 'IMPROVE'
  | 'INSULT'
  | 'ALLIANCE'
  | 'DEFENSIVE_PACT'
  | 'OFFENSIVE_PACT'
  | 'NON_AGGRESSION'
  | 'MILITARY_ACCESS'
  | 'TRADE'
  | 'EMBARGO'
  | 'ULTIMATUM_VASSAL'
  | 'ANNEX_VASSAL'
  | 'DECLARE_WAR';

export type PeaceDealType =
  | 'ANNEX_OCCUPIED'
  | 'VASSALIZE'
  | 'REPARATIONS'
  | 'WHITE_PEACE';

export interface CommandDrawersProps {
  activeTab: BottomDrawerTab;
  onClose: () => void;
  playerNation: Nation;
  playerEconomy: NationEconomyBreakdown;
  selectedTerritory: Territory | null;
  territories: Record<string, Territory>;
  nations: Record<string, Nation>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  movements: ArmyMovement[];
  moveRatio: number;
  onSetMoveRatio: (ratio: number) => void;
  onStartArmyOrderMode: (sourceTerritoryId: string) => void;
  onExecuteArmyMove: (fromId: string, toId: string) => void;
  onRecruitUnit: (
    territoryId: string,
    unitType: UnitType,
    amount: number,
    goldCost: number
  ) => void;
  onRecruitOrAssignGeneral: (generalId: string) => void;
  onUpgradeBuilding: (territoryId: string, building: BuildingType) => void;
  onAssimilateTerritory: (territoryId: string) => void;
  onStartMissionary?: (territoryId: string) => void;
  onFormEmpire: (empireId: string) => void;
  onUpdateTaxRate: (newRate: number) => void;
  onUpdateBudget: (key: keyof Nation['budget'], value: number) => void;
  onCentralBankIntervention: () => void;
  onIssueWarBonds: () => void;
  onChangeIdeology: (newIdeology: IdeologyId) => void;
  onStartResearch?: (techId: string) => void;
  onCancelResearch?: () => void;
  onBoostResearch?: () => void;
  onUnlockTech: (techId: string) => void;
  onEnactReform: (reformId: string) => void;
  onDiplomaticAction: (
    targetNationId: string,
    action: DiplomaticActionType
  ) => void;
  onPeaceDeal: (warId: string, dealType: PeaceDealType) => void;
  onSelectTerritory: (territoryId: string) => void;
  onModernizeNationalArmy: () => void;
  onAssignFiefLord: (territoryId: string, lordId: string | null) => void;
  onBestowFavorOnLord?: (lordId: string) => void;
  onToggleCallLordToBanner: (lordId: string) => void;
  onRaidEnemyTradeRoutes?: () => void;
  onSiegeBombardment: (
    territoryId: string,
    method: 'ARTILLERY' | 'DRONE_RAID'
  ) => void;
  gameMode?: GameModeId;
  fogOfWarEnabled?: boolean;
}
