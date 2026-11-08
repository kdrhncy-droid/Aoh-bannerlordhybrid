import { create } from 'zustand';
import {
  ActiveBattle,
  ActiveWar,
  ArmyMovement,
  BottomDrawerTab,
  BuildingType,
  CrisisEventDefinition,
  CrisisEventOption,
  DiplomaticRelation,
  GameModeId,
  GameScreenState,
  IdeologyId,
  MapMode,
  Nation,
  PendingWarMoveRequest,
  SpeedLevel,
  Territory,
  UnitType,
  WorldNewsEvent,
} from '../types/game';
import { TacticalBattleState } from '../types/tacticalBattle';
import {
  DiplomaticActionType,
  PeaceDealType,
} from '../components/drawers/drawerTypes';
import {
  COMMANDERS,
  getCommandersForMode,
} from '../data/world2026Data';
import {
  GeoCountryFeature,
  initializeWorld2026,
} from '../engine/worldBuilder';
import { formatGameDate } from '../engine/simulationEngine';
import {
  bestowFavorOnLordDomain,
  DEFAULT_LORD_LOYALTY,
  getLordRetinueTroops,
  withUpdatedLordLoyalty,
} from '../engine/pashaAndFiefEngine';
import {
  getMostRecentSaveRecord,
  hydrateSavedPayload,
  saveGameToSlot,
  SaveSlotId,
  SaveSlotMetadata,
  SaveSlotRecord,
} from '../engine/saveManager';
import {
  GameSettings,
  loadGameSettings,
  saveGameSettings,
} from '../engine/gameSettings';
import {
  computeGameTick,
  pickEligibleCrisisEvent,
  scaleUnits,
} from '../engine/tickEngine';
import { executeWartimeTradeRaidDomain } from '../engine/straitsAndTradeEngine';
import {
  assimilateTerritoryDomain,
  boostResearchDomain,
  cancelResearchDomain,
  changeIdeologyDomain,
  enactReformDomain,
  executeArmyMoveDomain,
  formEmpireDomain,
  modernizeNationalArmyDomain,
  recruitOrAssignGeneralDomain,
  recruitUnitDomain,
  resolveCrisisDomain,
  siegeBombardmentDomain,
  startMissionaryDomain,
  startResearchDomain,
  unlockTechDomain,
  upgradeBuildingDomain,
} from '../engine/empireAndArmyActions';
import {
  executeDiplomaticActionDomain,
  resolvePeaceDealDomain,
  resolveTacticalBattleOutcomeDomain,
} from '../engine/diplomacyAndWarActions';
import { music } from '../engine/musicEngine';
import { sound } from '../utils/soundEngine';

export interface GameStoreState {
  screenState: GameScreenState;
  gameMode: GameModeId;
  playerNationId: string;
  features: GeoCountryFeature[];
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  battles: ActiveBattle[];
  movements: ArmyMovement[];
  newsEvents: WorldNewsEvent[];
  tick: number;
  hour: number;
  speed: SpeedLevel;

  mapMode: MapMode;
  activeTab: BottomDrawerTab;
  selectedTerritoryId: string | null;
  armyOrderSourceId: string | null;
  pendingWarMove: PendingWarMoveRequest | null;
  moveRatio: number;
  soundEnabled: boolean;
  settings: GameSettings;
  toastMessage: string | null;
  activeCrisis: CrisisEventDefinition | null;
  activeTacticalBattle: TacticalBattleState | null;
  activeBattleOverviewTerritoryId: string | null;
  showNewsDrawer: boolean;
  showSystemModal: boolean;

  setScreenState: (screen: GameScreenState) => void;
  setSpeed: (speed: SpeedLevel) => void;
  togglePause: () => void;
  setMapMode: (mode: MapMode) => void;
  setActiveTab: (tab: BottomDrawerTab) => void;
  setSelectedTerritoryId: (id: string | null) => void;
  setArmyOrderSourceId: (id: string | null) => void;
  setPendingWarMove: (req: PendingWarMoveRequest | null) => void;
  confirmPendingWarMove: () => void;
  setMoveRatio: (ratio: number) => void;
  toggleSound: () => void;
  updateSettings: (partial: Partial<GameSettings>) => void;
  showToast: (msg: string | null) => void;
  setShowNewsDrawer: (open: boolean) => void;
  setShowSystemModal: (open: boolean) => void;
  setActiveBattleOverviewTerritoryId: (id: string | null) => void;
  applyTacticalOrder: (
    territoryId: string,
    tactic: 'TURAN' | 'BOMBARD' | 'RETREAT'
  ) => void;

  selectScenarioMode: (nextMode: GameModeId) => void;
  selectPlayerNation: (nationId: string) => void;
  startNewGame: () => void;
  saveToSlot: (slotId: SaveSlotId) => SaveSlotMetadata | null;
  loadRecord: (record: SaveSlotRecord) => void;
  loadMostRecentSave: () => void;
  advanceGameTick: () => void;

  selectTerritory: (territoryId: string) => void;
  selectTerritoryOnMap: (territoryId: string | null) => void;
  resolveCrisis: (option: CrisisEventOption) => void;
  triggerManualCabinetDecision: () => void;
  recruitUnit: (
    territoryId: string,
    unitType: UnitType,
    amount: number,
    baseGoldCost: number
  ) => void;
  recruitOrAssignGeneral: (generalId: string) => void;
  upgradeBuilding: (territoryId: string, building: BuildingType) => void;
  assimilateTerritory: (territoryId: string) => void;
  startMissionary: (territoryId: string) => void;
  formEmpire: (empireId: string) => void;
  executeArmyMove: (fromId: string, toId: string) => void;
  modernizeNationalArmy: () => void;
  assignFiefLord: (territoryId: string, lordId: string | null) => void;
  bestowFavorOnLord: (lordId: string) => void;
  toggleCallLordToBanner: (lordId: string) => void;
  raidEnemyTradeRoutes: () => void;
  siegeBombardment: (
    territoryId: string,
    method: 'ARTILLERY' | 'DRONE_RAID'
  ) => void;
  updateTaxRate: (newRate: number) => void;
  updateBudget: (key: keyof Nation['budget'], value: number) => void;
  centralBankIntervention: () => void;
  issueWarBonds: () => void;
  changeIdeology: (newIdeology: IdeologyId) => void;
  startResearch: (techId: string) => void;
  cancelResearch: () => void;
  boostResearch: () => void;
  unlockTech: (techId: string) => void;
  enactReform: (reformId: string) => void;
  diplomaticAction: (
    targetNationId: string,
    action: DiplomaticActionType
  ) => void;
  applyBattleOutcome: (finalBattle: TacticalBattleState) => void;
  peaceDeal: (warId: string, dealType: PeaceDealType) => void;
}

const initialBundle = initializeWorld2026('EMPIRES_1440');

export const useGameStore = create<GameStoreState>((set, get) => ({
  screenState: 'TITLE_MENU',
  gameMode: 'EMPIRES_1440',
  playerNationId: '792',
  features: initialBundle.features,
  nations: initialBundle.nations,
  territories: initialBundle.territories,
  relations: initialBundle.relations,
  wars: [],
  battles: [],
  movements: [],
  newsEvents: [],
  tick: 0,
  hour: 8,
  speed: 0,

  mapMode: 'POLITICAL',
  activeTab: 'NONE',
  selectedTerritoryId: '792',
  armyOrderSourceId: null,
  pendingWarMove: null,
  moveRatio: 0.5,
  soundEnabled: true,
  settings: loadGameSettings(),
  toastMessage: null,
  activeCrisis: null,
  activeTacticalBattle: null,
  activeBattleOverviewTerritoryId: null,
  showNewsDrawer: false,
  showSystemModal: false,

  setScreenState: (screenState) => set({ screenState }),
  setSpeed: (speed) => set({ speed }),
  togglePause: () =>
    set((s) => ({ speed: (s.speed === 0 ? 1 : 0) as SpeedLevel })),
  setMapMode: (mapMode) => set({ mapMode }),
  setActiveTab: (activeTab) =>
    set((s) => {
      if (activeTab === 'TERRITORY' && !s.selectedTerritoryId) {
        const capId =
          s.nations[s.playerNationId]?.capitalTerritoryId || s.playerNationId;
        return { activeTab, selectedTerritoryId: capId };
      }
      return { activeTab };
    }),
  setSelectedTerritoryId: (selectedTerritoryId) =>
    set({ selectedTerritoryId }),
  setArmyOrderSourceId: (armyOrderSourceId) => set({ armyOrderSourceId }),
  setPendingWarMove: (pendingWarMove) => set({ pendingWarMove }),
  confirmPendingWarMove: () =>
    set((s) => {
      if (!s.pendingWarMove) return {};
      const patch = executeArmyMoveDomain({
        ...s,
        fromId: s.pendingWarMove.fromId,
        toId: s.pendingWarMove.toId,
        forceDeclareWar: true,
      });
      return {
        ...patch,
        pendingWarMove: null,
        ...(patch.movements && s.speed === 0 ? { speed: 1 as SpeedLevel } : {}),
      };
    }),
  setMoveRatio: (moveRatio) => set({ moveRatio }),
  toggleSound: () =>
    set((s) => {
      const next = !s.soundEnabled;
      sound.enabled = next;
      return { soundEnabled: next };
    }),
  updateSettings: (partial) =>
    set((s) => {
      const next = { ...s.settings, ...partial };
      saveGameSettings(next);
      return { settings: next };
    }),
  showToast: (toastMessage) => set({ toastMessage }),
  setShowNewsDrawer: (showNewsDrawer) => set({ showNewsDrawer }),
  setShowSystemModal: (showSystemModal) => set({ showSystemModal }),
  setActiveBattleOverviewTerritoryId: (activeBattleOverviewTerritoryId) =>
    set({ activeBattleOverviewTerritoryId }),
  applyTacticalOrder: (territoryId, tactic) =>
    set((s) => {
      const btlIdx = s.battles.findIndex((b) => b.territoryId === territoryId);
      const terr = s.territories[territoryId];
      if (btlIdx === -1 && (!terr || !terr.siege)) return {};

      if (btlIdx === -1 && tactic === 'BOMBARD' && terr?.siege) {
        if (terr.siege.attackerId !== s.playerNationId) {
          return { toastMessage: 'Sur bombardımanı yalnız kuşatmacı tarafından emredilebilir.' };
        }
        const wallBefore = Math.max(
          0,
          Math.min(100, terr.castleWallHp ?? terr.siege.wallIntegrity ?? 100)
        );
        if (wallBefore <= 0) {
          return { toastMessage: `${terr.name} surları zaten yıkılmış durumda.` };
        }
        const wallAfter = Math.max(0, wallBefore - 20);
        return {
          territories: {
            ...s.territories,
            [territoryId]: {
              ...terr,
              castleWallHp: wallAfter,
              siege: { ...terr.siege, wallIntegrity: wallAfter },
            },
          },
          toastMessage: `${terr.name} surları bombardımanla %${wallBefore} → %${wallAfter} düştü.`,
        };
      }

      if (btlIdx === -1 || !terr) return {};

      const btl = s.battles[btlIdx];
      const isAttacker = btl.attackerId === s.playerNationId;
      const isDefender = btl.defenderId === s.playerNationId;
      if (!isAttacker && !isDefender) {
        return { toastMessage: 'Bu muharebede taraf olmadığınız için komut veremezsiniz.' };
      }

      const normalizeBattleUnits = (
        units: ActiveBattle['attackerUnits'],
        troopCount: number
      ) => {
        if (troopCount <= 0) return { infantry: 0, armor: 0, airDrone: 0 };
        const unitTotal = units.infantry + units.armor + units.airDrone;
        return unitTotal > 0
          ? scaleUnits(units, troopCount / unitTotal)
          : { infantry: troopCount, armor: 0, airDrone: 0 };
      };

      if (tactic === 'RETREAT') {
        const survivingTroops = isAttacker ? btl.attackerTroops : btl.defenderTroops;
        const survivingUnits = normalizeBattleUnits(
          isAttacker ? btl.attackerUnits : btl.defenderUnits,
          survivingTroops
        );
        const candidateIds = Array.from(
          new Set([
            ...(isAttacker && btl.fromTerritoryId ? [btl.fromTerritoryId] : []),
            ...terr.neighbors,
          ])
        ).filter((id) => id !== territoryId);
        const fallbackTerr = candidateIds
          .map((id) => s.territories[id])
          .find((candidate) => candidate?.ownerId === s.playerNationId);
        if (survivingTroops > 0 && !fallbackTerr) {
          return {
            toastMessage: 'Dost eyalete güvenli geri çekilme yolu yok; muharebe devam ediyor.',
          };
        }

        const updatedBattles = s.battles.filter((_, idx) => idx !== btlIdx);
        const updatedTerritories: Record<string, Territory> = { ...s.territories };
        if (fallbackTerr && survivingTroops > 0) {
          const stationedUnits = fallbackTerr.units || {
            infantry: fallbackTerr.garrison,
            armor: 0,
            airDrone: 0,
          };
          updatedTerritories[fallbackTerr.id] = {
            ...fallbackTerr,
            garrison: fallbackTerr.garrison + survivingTroops,
            units: {
              infantry: stationedUnits.infantry + survivingUnits.infantry,
              armor: stationedUnits.armor + survivingUnits.armor,
              airDrone: stationedUnits.airDrone + survivingUnits.airDrone,
            },
          };
        }

        let updatedNations = s.nations;
        if (!isAttacker) {
          const attackerSurvivors = Math.max(0, btl.attackerTroops);
          const occupyingUnits = normalizeBattleUnits(
            btl.attackerUnits,
            attackerSurvivors
          );
          updatedTerritories[territoryId] = {
            ...terr,
            ownerId: attackerSurvivors > 0 ? btl.attackerId : terr.ownerId,
            isOccupied: attackerSurvivors > 0,
            occupiedById: attackerSurvivors > 0 ? btl.attackerId : undefined,
            isCapital: attackerSurvivors > 0 ? false : terr.isCapital,
            garrison: attackerSurvivors,
            units: occupyingUnits,
          };

          const playerNation = s.nations[s.playerNationId];
          if (attackerSurvivors > 0 && playerNation?.capitalTerritoryId === territoryId) {
            const remainingTerritories = Object.values(s.territories).filter(
              (candidate) =>
                candidate.id !== territoryId && candidate.ownerId === s.playerNationId
            );
            updatedNations = {
              ...s.nations,
              [s.playerNationId]: remainingTerritories.length > 0
                ? { ...playerNation, capitalTerritoryId: remainingTerritories[0].id }
                : { ...playerNation, isEliminated: true },
            };
            if (remainingTerritories.length > 0) {
              const nextCapital = remainingTerritories[0];
              updatedTerritories[nextCapital.id] = {
                ...updatedTerritories[nextCapital.id],
                isCapital: true,
              };
            }
          }
        }

        const outcomeDecided = isAttacker || btl.attackerTroops > 0;
        const updatedWars = s.wars.map((war) => {
          const involvesBoth =
            (war.attackers.includes(btl.attackerId) &&
              war.defenders.includes(btl.defenderId)) ||
            (war.attackers.includes(btl.defenderId) &&
              war.defenders.includes(btl.attackerId));
          if (!involvesBoth) return war;
          const attackerSide = war.attackers.includes(btl.attackerId);
          const attackerWon = !isAttacker;
          const scoreDelta = outcomeDecided
            ? attackerWon === attackerSide
              ? 28
              : -28
            : 0;
          const attackerLosses = Math.max(
            0,
            (btl.attackerInitialTroops ?? btl.attackerTroops) - btl.attackerTroops
          );
          const defenderLosses = Math.max(
            0,
            (btl.defenderInitialTroops ?? btl.defenderTroops) - btl.defenderTroops
          );
          return {
            ...war,
            attackerWarScore: Math.max(
              -100,
              Math.min(100, (war.attackerWarScore ?? 0) + scoreDelta)
            ),
            casualtiesAttacker:
              (war.casualtiesAttacker ?? 0) +
              (attackerSide ? attackerLosses : defenderLosses),
            casualtiesDefender:
              (war.casualtiesDefender ?? 0) +
              (attackerSide ? defenderLosses : attackerLosses),
          };
        });

        const destinationText = fallbackTerr
          ? `${fallbackTerr.name} eyaletine`
          : 'dost topraklara';
        const toastMessage = isAttacker
          ? `Ordumuz ${terr.name} muharebesinden ${destinationText} ${survivingTroops.toLocaleString('tr-TR')} askerle çekildi.`
          : btl.attackerTroops > 0
          ? `Savunma hattı terk edildi; ${terr.name} eyaleti ${s.nations[btl.attackerId]?.name || 'düşman'} tarafından işgal edildi. ${survivingTroops.toLocaleString('tr-TR')} savunmacı ${destinationText} çekildi.`
          : `Savunma birlikleri ${destinationText} çekildi; düşman kuvveti kalmadı.`;

        return {
          battles: updatedBattles,
          wars: updatedWars,
          nations: updatedNations,
          territories: updatedTerritories,
          activeBattleOverviewTerritoryId: null,
          toastMessage,
        };
      }

      if (tactic === 'TURAN') {
        const alreadyUsed = isAttacker
          ? Boolean(btl.attackerTuranUsed)
          : Boolean(btl.defenderTuranUsed);
        if (alreadyUsed) {
          return { toastMessage: 'Hilal & Turan taktiği bu muharebede zaten kullanıldı.' };
        }
        const updatedBattles = [...s.battles];
        updatedBattles[btlIdx] = {
          ...btl,
          attackerTuranUsed: isAttacker ? true : btl.attackerTuranUsed,
          defenderTuranUsed: isDefender ? true : btl.defenderTuranUsed,
          attackerTuranPowerBonus: isAttacker ? 18 : btl.attackerTuranPowerBonus,
          defenderTuranPowerBonus: isDefender ? 18 : btl.defenderTuranPowerBonus,
        };
        return {
          battles: updatedBattles,
          toastMessage: 'Hilal & Turan taktiği hazır: bir sonraki muharebe raundunda +%18 güç sağlar.',
        };
      }

      if (tactic === 'BOMBARD') {
        const enemyTroops = isAttacker ? btl.defenderTroops : btl.attackerTroops;
        const hit = Math.max(
          0,
          Math.min(Math.max(0, enemyTroops - 200), Math.round(enemyTroops * 0.15))
        );
        const remainingTroops = Math.max(0, enemyTroops - hit);
        const enemyUnits = isAttacker ? btl.defenderUnits : btl.attackerUnits;
        const remainingUnits = scaleUnits(
          enemyUnits,
          remainingTroops / Math.max(1, enemyTroops)
        );
        const updatedBattles = [...s.battles];
        updatedBattles[btlIdx] = {
          ...btl,
          attackerTroops: isAttacker ? btl.attackerTroops : remainingTroops,
          attackerUnits: isAttacker ? btl.attackerUnits : remainingUnits,
          defenderTroops: isAttacker ? remainingTroops : btl.defenderTroops,
          defenderUnits: isAttacker ? remainingUnits : btl.defenderUnits,
        };
        return {
          battles: updatedBattles,
          toastMessage:
            hit > 0
              ? `Topçu ateşi düşman kuvvetlerine ${hit.toLocaleString('tr-TR')} asker kayıp verdirdi.`
              : 'Düşman kuvveti 200 asker tabanında; bombardıman ek kayıp vermedi.',
        };
      }

      return {};
    }),

  selectScenarioMode: (nextMode) => {
    const bundle = initializeWorld2026(nextMode);
    const { playerNationId } = get();
    const nextNationId = bundle.nations[playerNationId]
      ? playerNationId
      : '792';
    set({
      gameMode: nextMode,
      features: bundle.features,
      nations: bundle.nations,
      territories: bundle.territories,
      relations: bundle.relations,
      playerNationId: nextNationId,
      selectedTerritoryId: nextNationId,
    });
  },

  selectPlayerNation: (nationId) =>
    set({ playerNationId: nationId, selectedTerritoryId: nationId }),

  startNewGame: () => {
    const { gameMode, playerNationId, soundEnabled } = get();
    const bundle = initializeWorld2026(gameMode);
    const validPlayerId = bundle.nations[playerNationId]
      ? playerNationId
      : '792';
    const starterCmds = getCommandersForMode(gameMode)
      .slice(0, 2)
      .map((c) => c.id);
    const currentPlayerNation = bundle.nations[validPlayerId];
    const finalGeneralIds =
      currentPlayerNation.recruitedGeneralIds &&
      currentPlayerNation.recruitedGeneralIds.length > 0
        ? currentPlayerNation.recruitedGeneralIds
        : starterCmds;
    const starterLoyalties: Record<string, number> = {};
    finalGeneralIds.forEach((gId) => {
      starterLoyalties[gId] = DEFAULT_LORD_LOYALTY + 4;
    });

    const nextNations: Record<string, Nation> = {
      ...bundle.nations,
      [validPlayerId]: {
        ...currentPlayerNation,
        recruitedGeneralIds: finalGeneralIds,
        activeGeneralId:
          currentPlayerNation.activeGeneralId || finalGeneralIds[0] || null,
        lordLoyalties: starterLoyalties,
      },
    };

    if (soundEnabled && !music.isPlaying) {
      music.setTrack(
        gameMode === 'EMPIRES_1440' ? 'TR_MEHTER_CEDDIN' : 'TR_OLUR_MU_BOYLE'
      );
      music.play();
    }

    set({
      features: bundle.features,
      nations: nextNations,
      territories: bundle.territories,
      relations: bundle.relations,
      playerNationId: validPlayerId,
      wars: [],
      battles: [],
      movements: [],
      tick: 0,
      hour: 8,
      speed: 1,
      selectedTerritoryId: null,
      armyOrderSourceId: null,
      pendingWarMove: null,
      activeTab: 'NONE',
      activeCrisis: null,
      activeTacticalBattle: null,
      screenState: 'PLAYING',
      newsEvents: [
        {
          id: 'init_1',
          tick: 0,
          dateStr: formatGameDate(0, gameMode, 8),
          title: `${nextNations[validPlayerId]?.name} Yönetimi Başladı`,
          description:
            gameMode === 'EMPIRES_1440'
              ? '1440 İmparatorluklar Çağı senaryosu aktif (16 Büyük İmparatorluk, Teknolojiye Dayalı Ordu Modernizasyonu ve Tımar Paşaları).'
              : 'Çoklu eyalet strateji haritası, Teknolojiye Dayalı Ordu Modernizasyonu ve Sancak Komutanları aktif.',
          type: 'ECONOMY',
        },
      ],
    });
  },

  saveToSlot: (slotId) => {
    const s = get();
    return saveGameToSlot(slotId, {
      gameMode: s.gameMode,
      playerNationId: s.playerNationId,
      nations: s.nations,
      territories: s.territories,
      relations: s.relations,
      wars: s.wars,
      battles: s.battles,
      movements: s.movements,
      newsEvents: s.newsEvents,
      tick: s.tick,
      hour: s.hour,
    });
  },

  loadRecord: (record) => {
    const targetMode = record.payload.gameMode || 'EMPIRES_1440';
    const modeBundle = initializeWorld2026(targetMode);
    const hydrated = hydrateSavedPayload(
      record.payload,
      modeBundle.nations,
      modeBundle.territories
    );
    set({
      features: modeBundle.features,
      gameMode: hydrated.gameMode,
      playerNationId: hydrated.playerNationId,
      nations: hydrated.nations,
      territories: hydrated.territories,
      relations: hydrated.relations,
      wars: hydrated.wars,
      battles: hydrated.battles,
      movements: hydrated.movements,
      newsEvents: hydrated.newsEvents,
      tick: hydrated.tick,
      hour: hydrated.hour ?? 8,
      selectedTerritoryId: hydrated.playerNationId,
      armyOrderSourceId: null,
      pendingWarMove: null,
      activeTab: 'NONE',
      speed: 0,
      screenState: 'PLAYING',
      toastMessage: `${record.metadata.nationName} (${record.metadata.gameDateStr}) kaydı yüklendi.`,
    });
  },

  loadMostRecentSave: () => {
    const latest = getMostRecentSaveRecord();
    if (!latest) {
      set({ toastMessage: 'Kayıtlı sefer bulunamadı.' });
      return;
    }
    get().loadRecord(latest);
  },

  advanceGameTick: () => {
    const s = get();
    if (
      s.screenState !== 'PLAYING' ||
      s.speed === 0 ||
      s.activeCrisis ||
      s.activeTacticalBattle ||
      s.pendingWarMove
    ) {
      return;
    }

    const hoursStep =
      s.speed === 1 ? 1 : s.speed === 2 ? 2 : s.speed === 4 ? 3 : 6;

    const out = computeGameTick({
      tick: s.tick,
      hour: s.hour,
      hoursStep,
      speed: s.speed,
      gameMode: s.gameMode,
      playerNationId: s.playerNationId,
      nations: s.nations,
      territories: s.territories,
      relations: s.relations,
      wars: s.wars,
      battles: s.battles,
      movements: s.movements,
      newsEvents: s.newsEvents,
      settings: s.settings,
    });

    for (const cue of out.sounds) {
      if (cue === 'SELECT_TERRITORY') sound.playSelectTerritory();
      else if (cue === 'MARCH') sound.playMarch();
      else if (cue === 'TREATY') sound.playTreaty();
      else if (cue === 'WAR_HORN') sound.playWarHorn();
    }

    set({
      tick: out.nextTick,
      hour: out.nextHour,
      nations: out.nations,
      territories: out.territories,
      relations: out.relations,
      wars: out.wars,
      battles: out.battles,
      movements: out.movements,
      newsEvents: out.newsEvents,
      ...(out.shouldPause ? { speed: 0 as SpeedLevel } : {}),
      ...(out.triggeredTacticalBattle
        ? { activeTacticalBattle: out.triggeredTacticalBattle }
        : {}),
      ...(out.triggeredCrisis ? { activeCrisis: out.triggeredCrisis } : {}),
      ...(out.toasts.length > 0
        ? { toastMessage: out.toasts[out.toasts.length - 1] }
        : {}),
    });
  },

  selectTerritory: (territoryId) => {
    sound.playSelectTerritory();
    set({ selectedTerritoryId: territoryId, activeTab: 'TERRITORY' });
  },

  selectTerritoryOnMap: (territoryId) => {
    if (!territoryId) {
      set({
        selectedTerritoryId: null,
        armyOrderSourceId: null,
        activeTab: 'NONE',
      });
      return;
    }
    sound.playSelectTerritory();
    set({
      selectedTerritoryId: territoryId,
      activeTab: 'NONE',
    });
  },

  resolveCrisis: (option) => set((s) => resolveCrisisDomain({ ...s, option })),

  triggerManualCabinetDecision: () =>
    set((s) => ({
      activeCrisis: pickEligibleCrisisEvent(s.gameMode),
      speed: 0,
    })),

  recruitUnit: (territoryId, unitType, amount, baseGoldCost) =>
    set((s) =>
      recruitUnitDomain({
        territoryId,
        unitType,
        amount,
        baseGoldCost,
        territories: s.territories,
        nations: s.nations,
        playerNationId: s.playerNationId,
      })
    ),

  recruitOrAssignGeneral: (generalId) =>
    set((s) =>
      recruitOrAssignGeneralDomain({
        generalId,
        nations: s.nations,
        playerNationId: s.playerNationId,
      })
    ),

  upgradeBuilding: (territoryId, building) =>
    set((s) =>
      upgradeBuildingDomain({
        territoryId,
        building,
        territories: s.territories,
        nations: s.nations,
        playerNationId: s.playerNationId,
      })
    ),

  assimilateTerritory: (territoryId) =>
    set((s) =>
      assimilateTerritoryDomain({
        territoryId,
        territories: s.territories,
        nations: s.nations,
        playerNationId: s.playerNationId,
      })
    ),

  startMissionary: (territoryId) =>
    set((s) =>
      startMissionaryDomain({
        territoryId,
        territories: s.territories,
        nations: s.nations,
        playerNationId: s.playerNationId,
      })
    ),

  formEmpire: (empireId) =>
    set((s) =>
      formEmpireDomain({
        empireId,
        nations: s.nations,
        territories: s.territories,
        playerNationId: s.playerNationId,
        tick: s.tick,
        gameMode: s.gameMode,
        newsEvents: s.newsEvents,
      })
    ),

  executeArmyMove: (fromId, toId) =>
    set((s) => {
      const patch = executeArmyMoveDomain({ ...s, fromId, toId });
      return {
        ...patch,
        ...(patch.movements && s.speed === 0 ? { speed: 1 as SpeedLevel } : {}),
      };
    }),

  modernizeNationalArmy: () => set((s) => modernizeNationalArmyDomain(s)),

  assignFiefLord: (territoryId, lordId) => {
    const { territories, nations, playerNationId } = get();
    const t = territories[territoryId];
    const p = nations[playerNationId];
    if (!t || !p || t.ownerId !== playerNationId) return;

    const prevLordId = t.fiefLordId || null;
    if (prevLordId === lordId) return;

    sound.playTreaty();
    let updatedPlayerNation = p;
    if (prevLordId) {
      updatedPlayerNation = withUpdatedLordLoyalty(
        updatedPlayerNation,
        prevLordId,
        -22
      );
    }

    if (!lordId) {
      const prevCmd = prevLordId
        ? COMMANDERS.find((c) => c.id === prevLordId)
        : null;
      set({
        nations: {
          ...nations,
          [playerNationId]: updatedPlayerNation,
        },
        territories: {
          ...territories,
          [territoryId]: { ...t, fiefLordId: undefined },
        },
        toastMessage: prevCmd
          ? `${t.name} doğrudan merkeze bağlandı (${prevCmd.name} Sadakati -22 düştü!).`
          : `${t.name} doğrudan Merkez Hükümet yönetimine alındı.`,
      });
      return;
    }

    updatedPlayerNation = withUpdatedLordLoyalty(
      updatedPlayerNation,
      lordId,
      12
    );
    const lord = COMMANDERS.find((c) => c.id === lordId);
    set({
      nations: {
        ...nations,
        [playerNationId]: updatedPlayerNation,
      },
      territories: {
        ...territories,
        [territoryId]: {
          ...t,
          fiefLordId: lordId,
          garrison: t.garrison + 1500,
          units: {
            ...t.units,
            infantry: (t.units?.infantry || t.garrison) + 1500,
          },
        },
      },
      toastMessage: `${t.name} Tımarı ${lord?.name} komutasına verildi! (+12 Sadakat, +1.500 Muhafız yerleşti)`,
    });
  },

  bestowFavorOnLord: (lordId) =>
    set((s) =>
      bestowFavorOnLordDomain({
        lordId,
        nations: s.nations,
        playerNationId: s.playerNationId,
      })
    ),

  toggleCallLordToBanner: (lordId) => {
    const { nations, territories, playerNationId } = get();
    const p = nations[playerNationId];
    const lord = COMMANDERS.find((c) => c.id === lordId);
    if (!p || !lord) return;

    const currentCalled = p.bannerCalledLordIds || [];
    if (currentCalled.includes(lordId)) {
      sound.playClick();
      set({
        nations: {
          ...nations,
          [playerNationId]: {
            ...p,
            bannerCalledLordIds: currentCalled.filter((id) => id !== lordId),
          },
        },
        toastMessage: `${lord.name} sancak ordugahından kendi tımarına döndü.`,
      });
      return;
    }

    if ((p.clanInfluence ?? 0) < 35) {
      set({
        toastMessage: 'Lordu Sancağa çağırmak için 35 ⚜ Klan Nüfuzu gerekli.',
      });
      return;
    }

    sound.playWarHorn();
    const retinue = getLordRetinueTroops(lordId, territories);
    set({
      nations: {
        ...nations,
        [playerNationId]: {
          ...p,
          clanInfluence: Math.max(0, (p.clanInfluence || 0) - 35),
          bannerCalledLordIds: [...currentCalled, lordId],
        },
      },
      toastMessage: `${lord.name} (+${retinue.toLocaleString('tr-TR')} Muhafız) Sancak Ordugahına katıldı! Taarruzlarınızda sizinle yürüyecek.`,
    });
  },

  siegeBombardment: (territoryId, method) =>
    set((s) =>
      siegeBombardmentDomain({
        territoryId,
        method,
        territories: s.territories,
        nations: s.nations,
        playerNationId: s.playerNationId,
        gameMode: s.gameMode,
      })
    ),

  raidEnemyTradeRoutes: () => {
    const s = get();
    const res = executeWartimeTradeRaidDomain({
      playerNationId: s.playerNationId,
      gameMode: s.gameMode,
      tick: s.tick,
      nations: s.nations,
      territories: s.territories,
      wars: s.wars,
    });
    if (!res.ok) {
      sound.playClick();
      set({ toastMessage: res.toastMessage });
      return;
    }
    sound.playMarch();
    const nextNews: WorldNewsEvent[] = [
      {
        id: `raid_${s.tick}_${Math.random().toString(36).slice(2, 7)}`,
        tick: s.tick,
        dateStr: formatGameDate(s.tick, s.gameMode),
        title: `🏴‍☠️ Ticaret Hattı Baskını (+${res.plunderedGold} Altın)`,
        description: `Akıncı ve donanma müfrezelerimiz ${res.targetNationName} kontrolündeki (${res.corridorName}) hattını vurarak +${res.plunderedGold} Altın ganimet ele geçirdi!`,
        type: 'WAR',
      },
      ...s.newsEvents.slice(0, 39),
    ];
    set({
      nations: res.nations,
      territories: res.territories,
      newsEvents: nextNews,
      toastMessage: res.toastMessage,
    });
  },

  updateTaxRate: (newRate) =>
    set((s) => ({
      nations: {
        ...s.nations,
        [s.playerNationId]: {
          ...s.nations[s.playerNationId],
          taxRate: newRate,
        },
      },
    })),

  updateBudget: (key, value) =>
    set((s) => ({
      nations: {
        ...s.nations,
        [s.playerNationId]: {
          ...s.nations[s.playerNationId],
          budget: {
            ...s.nations[s.playerNationId].budget,
            [key]: value,
          },
        },
      },
    })),

  centralBankIntervention: () => {
    const { nations, playerNationId } = get();
    const p = nations[playerNationId];
    if (!p) return;
    if (p.inflation < 3.5) {
      set({
        toastMessage:
          'Enflasyon zaten kontrol altında (%3.5 altı)! Ek müdahaleye gerek yok.',
      });
      return;
    }
    if (p.treasury < 800) {
      set({ toastMessage: 'Enflasyon müdahalesi için 800 Altın gerekli.' });
      return;
    }
    sound.playTreaty();
    set({
      nations: {
        ...nations,
        [playerNationId]: {
          ...p,
          treasury: p.treasury - 800,
          inflation: Math.max(0.5, Number((p.inflation - 2.5).toFixed(2))),
          stability: Math.min(100, p.stability + 2),
        },
      },
      toastMessage:
        'Para Reformu & Sikke Tashihi uygulandı: Enflasyon -%2.5 düşürüldü (+2 İstikrar).',
    });
  },

  issueWarBonds: () => {
    const { nations, playerNationId } = get();
    const p = nations[playerNationId];
    if (!p) return;
    if (p.inflation >= 24) {
      set({
        toastMessage:
          'Yüksek enflasyon (%24+) nedeniyle yeni borç tahvili ihraç edilemez! Önce enflasyonu düşürün.',
      });
      return;
    }
    if (p.stability < 35) {
      set({
        toastMessage:
          'Düşük devlet istikrarı (%35 altı) nedeniyle borçlanma yapılamaz!',
      });
      return;
    }
    sound.playBuild();
    set({
      nations: {
        ...nations,
        [playerNationId]: {
          ...p,
          treasury: p.treasury + 850,
          inflation: Math.min(60, Number((p.inflation + 4.5).toFixed(2))),
          stability: Math.max(0, p.stability - 6),
        },
      },
      toastMessage:
        'Sefer Akçesi / Tahvil ihraç edildi: +850 Altın hazineye eklendi (+%4.5 Enflasyon, -6 İstikrar).',
    });
  },

  changeIdeology: (newIdeology) =>
    set((s) =>
      changeIdeologyDomain({
        newIdeology,
        nations: s.nations,
        playerNationId: s.playerNationId,
      })
    ),

  startResearch: (techId) =>
    set((s) =>
      startResearchDomain({
        techId,
        nations: s.nations,
        playerNationId: s.playerNationId,
        gameMode: s.gameMode,
        tick: s.tick,
      })
    ),

  cancelResearch: () =>
    set((s) =>
      cancelResearchDomain({
        nations: s.nations,
        playerNationId: s.playerNationId,
      })
    ),

  boostResearch: () =>
    set((s) =>
      boostResearchDomain({
        nations: s.nations,
        playerNationId: s.playerNationId,
      })
    ),

  unlockTech: (techId) =>
    set((s) =>
      unlockTechDomain({
        techId,
        nations: s.nations,
        playerNationId: s.playerNationId,
        gameMode: s.gameMode,
        tick: s.tick,
      })
    ),

  enactReform: (reformId) =>
    set((s) =>
      enactReformDomain({
        reformId,
        nations: s.nations,
        relations: s.relations,
        playerNationId: s.playerNationId,
        gameMode: s.gameMode,
      })
    ),

  diplomaticAction: (targetNationId, action) => {
    const s = get();
    const totalPlayerGarrison = Object.values(s.territories)
      .filter((t) => t.ownerId === s.playerNationId)
      .reduce((sum, t) => sum + t.garrison, 0);

    const patch = executeDiplomaticActionDomain({
      targetNationId,
      action,
      playerNationId: s.playerNationId,
      totalPlayerGarrison,
      tick: s.tick,
      gameMode: s.gameMode,
      nations: s.nations,
      territories: s.territories,
      relations: s.relations,
      wars: s.wars,
      movements: s.movements,
      newsEvents: s.newsEvents,
    });

    set({
      ...(patch.nations ? { nations: patch.nations } : {}),
      ...(patch.territories ? { territories: patch.territories } : {}),
      ...(patch.relations ? { relations: patch.relations } : {}),
      ...(patch.wars ? { wars: patch.wars } : {}),
      ...(patch.movements ? { movements: patch.movements } : {}),
      ...(patch.newsEvents ? { newsEvents: patch.newsEvents } : {}),
      ...(patch.toast ? { toastMessage: patch.toast } : {}),
    });
  },

  applyBattleOutcome: (finalBattle) => {
    const s = get();
    const patch = resolveTacticalBattleOutcomeDomain({
      finalBattle,
      playerNationId: s.playerNationId,
      tick: s.tick,
      gameMode: s.gameMode,
      nations: s.nations,
      territories: s.territories,
      wars: s.wars,
      newsEvents: s.newsEvents,
    });

    set({
      activeTacticalBattle: null,
      ...(patch.nations ? { nations: patch.nations } : {}),
      ...(patch.territories ? { territories: patch.territories } : {}),
      ...(patch.wars ? { wars: patch.wars } : {}),
      ...(patch.newsEvents ? { newsEvents: patch.newsEvents } : {}),
      ...(patch.toast ? { toastMessage: patch.toast } : {}),
    });
  },

  peaceDeal: (warId, dealType) => {
    const s = get();
    const patch = resolvePeaceDealDomain({
      warId,
      dealType,
      playerNationId: s.playerNationId,
      tick: s.tick,
      gameMode: s.gameMode,
      nations: s.nations,
      territories: s.territories,
      relations: s.relations,
      wars: s.wars,
      newsEvents: s.newsEvents,
    });

    set({
      ...(patch.nations ? { nations: patch.nations } : {}),
      ...(patch.territories ? { territories: patch.territories } : {}),
      ...(patch.relations ? { relations: patch.relations } : {}),
      ...(patch.wars ? { wars: patch.wars } : {}),
      ...(patch.newsEvents ? { newsEvents: patch.newsEvents } : {}),
      ...(patch.toast ? { toastMessage: patch.toast } : {}),
    });
  },
}));

if (import.meta.env?.DEV && typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__GAME_STORE__ = useGameStore;
}
