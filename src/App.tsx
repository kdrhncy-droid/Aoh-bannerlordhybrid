/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Compass, ShieldAlert, Swords, X } from 'lucide-react';
import { useGameStore } from './store/useGameStore';
import { calculateNationEconomy } from './engine/simulationEngine';
import {
  getMostRecentSaveRecord,
  initSaveStorage,
} from './engine/saveManager';
import { music } from './engine/musicEngine';
import { TopHudBar } from './components/hud/TopHudBar';
import { MapMacroMode, MapModePillBar } from './components/hud/MapModePillBar';
import { SelectedProvinceBar } from './components/hud/SelectedProvinceBar';
import { BottomNavBar } from './components/hud/BottomNavBar';
import { AoH3OutlinerWidget } from './components/hud/AoH3OutlinerWidget';
import { MehterhaneYoutubeDock } from './components/hud/MehterhaneYoutubeDock';
import { performanceTelemetry } from './utils/performanceTelemetry';
import { useAccessibleDialog } from './hooks/useAccessibleDialog';

const LazyTitleMenuModal = lazy(() =>
  import('./components/TitleMenuModal').then((module) => ({
    default: module.TitleMenuModal,
  }))
);
const LazyWorldMapCanvas = lazy(() =>
  import('./components/WorldMapCanvas').then((module) => ({
    default: module.WorldMapCanvas,
  }))
);
const LazyCommandDrawers = lazy(() =>
  import('./components/CommandDrawers').then((module) => ({
    default: module.CommandDrawers,
  }))
);
const LazyCrisisAndNewsModal = lazy(() =>
  import('./components/CrisisAndNewsModal').then((module) => ({
    default: module.CrisisAndNewsModal,
  }))
);
const LazySystemAndSaveModal = lazy(() =>
  import('./components/SystemAndSaveModal').then((module) => ({
    default: module.SystemAndSaveModal,
  }))
);
const LazyTacticalBattleModal = lazy(() =>
  import('./components/TacticalBattleModal').then((module) => ({
    default: module.TacticalBattleModal,
  }))
);
const LazyAoH3BattleOverviewModal = lazy(() =>
  import('./components/AoH3BattleOverviewModal').then((module) => ({
    default: module.AoH3BattleOverviewModal,
  }))
);

function DialogLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 text-sm font-semibold text-amber-200"
    >
      Oyun arayüzü yükleniyor…
    </div>
  );
}

class GameErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      errorMsg: error instanceof Error ? error.message : 'Bilinmeyen çalışma zamanı hatası',
    };
  }

  handleRecover = () => {
    try {
      const st = useGameStore.getState();
      st.setSpeed(0);
      st.setActiveTab('NONE');
      st.setPendingWarMove(null);
    } catch {
      // ignore
    }
    this.setState({ hasError: false, errorMsg: '' });
  };

  handleResetToMenu = () => {
    try {
      const st = useGameStore.getState();
      st.setSpeed(0);
      st.startNewGame();
      st.setScreenState('TITLE_MENU');
    } catch {
      // ignore
    }
    this.setState({ hasError: false, errorMsg: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-[100dvh] bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/50 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0" />
              <div>
                <h2 className="font-display font-bold text-base text-white">
                  Oyun Oturumu Koruma Kalkanı
                </h2>
                <p className="text-xs text-slate-400">
                  Sefer sırasında beklenmeyen bir veri uyuşmazlığı yakalandı ve otomatik duraklatıldı.
                </p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-rose-300 break-words">
              {this.state.errorMsg}
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={this.handleRecover}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Seferi Onar ve Devam Et
              </button>
              <button
                onClick={this.handleResetToMenu}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs cursor-pointer"
              >
                Ana Menüye Dön
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function GameAppInner() {
  const store = useGameStore();
  const {
    screenState,
    gameMode,
    playerNationId,
    features,
    nations,
    territories,
    relations,
    wars,
    battles,
    movements,
    newsEvents,
    tick,
    hour,
    speed,
    mapMode,
    activeTab,
    selectedTerritoryId,
    armyOrderSourceId,
    moveRatio,
    soundEnabled,
    settings,
    toastMessage,
    activeCrisis,
    activeTacticalBattle,
    activeBattleOverviewTerritoryId,
    pendingWarMove,
    showNewsDrawer,
    showSystemModal,
  } = store;

  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(
    music.isPlaying
  );
  const [idbReadyVersion, setIdbReadyVersion] = useState<number>(0);
  const [macroMode, setMacroMode] = useState<MapMacroMode>('NONE');

  // Warm up IndexedDB (idb-keyval) save payloads & migrate legacy localStorage slots once on boot
  useEffect(() => {
    initSaveStorage().then(() => {
      setIdbReadyVersion((v) => v + 1);
    });
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      useGameStore.getState().startNewGame();
    }
  }, []);

  // Sync game state machine to document.body.dataset.state
  useEffect(() => {
    if (screenState === 'TITLE_MENU') {
      document.body.dataset.state = 'title';
    } else if (speed === 0) {
      document.body.dataset.state = 'paused';
    } else {
      document.body.dataset.state = 'playing';
    }
  }, [screenState, speed]);

  useEffect(() => {
    return music.subscribe(() => {
      setIsMusicPlaying(music.isPlaying);
    });
  }, []);

  // Auto-dismiss floating toast banner
  useEffect(() => {
    if (!toastMessage) return;
    const durationMs = Math.min(12_000, Math.max(4_000, toastMessage.length * 45));
    const t = setTimeout(() => store.showToast(null), durationMs);
    return () => clearTimeout(t);
  }, [toastMessage, store.showToast]);

  // Automatic Save to IndexedDB at user-configured interval (only once when day tick changes)
  useEffect(() => {
    if (
      screenState === 'PLAYING' &&
      settings.autoSaveIntervalDays > 0 &&
      tick > 0 &&
      tick % settings.autoSaveIntervalDays === 0
    ) {
      store.saveToSlot('AUTOSAVE');
    }
  }, [screenState, tick, settings.autoSaveIntervalDays, store.saveToSlot]);

  // Spacebar shortcut to toggle pause/play
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (screenState !== 'PLAYING') return;
      if (e.code !== 'Space') return;
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (
        target?.isContentEditable ||
        target?.closest(
          'input, textarea, select, button, a[href], [role="button"], [role="link"], [role="checkbox"], [role="switch"], [contenteditable="true"]'
        )
      ) return;
      e.preventDefault();
      store.togglePause();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screenState, store.togglePause]);

  // Atomic Real-Time with Pause Simulation Loop (advances by hours every step!)
  useEffect(() => {
    if (
      screenState !== 'PLAYING' ||
      speed === 0 ||
      activeCrisis ||
      activeTacticalBattle ||
      pendingWarMove
    ) {
      return;
    }

    const intervalMs =
      speed === 1 ? 650 : speed === 2 ? 420 : speed === 4 ? 260 : 150;

    const timer = setInterval(() => {
      performanceTelemetry.recordSimulationTick();
      useGameStore.getState().advanceGameTick();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [screenState, speed, activeCrisis, activeTacticalBattle, pendingWarMove]);

  const hasSavedGame = useMemo(() => {
    return Boolean(getMostRecentSaveRecord());
  }, [screenState, showSystemModal, idbReadyVersion]);

  const playerNation = nations[playerNationId] || Object.values(nations)[0];

  const playerEconomy = useMemo(
    () =>
      calculateNationEconomy(
        playerNation,
        territories,
        nations,
        relations,
        movements,
        wars,
        gameMode
      ),
    [playerNation, territories, nations, relations, movements, wars, gameMode]
  );

  const selectedTerritory = selectedTerritoryId
    ? territories[selectedTerritoryId] || null
    : null;

  const pendingTargetNation = pendingWarMove
    ? nations[pendingWarMove.targetNationId]
    : null;
  const pendingFromTerritory = pendingWarMove
    ? territories[pendingWarMove.fromId]
    : null;
  const pendingToTerritory = pendingWarMove
    ? territories[pendingWarMove.toId]
    : null;
  const warConfirmationOpen = Boolean(
    pendingWarMove && pendingTargetNation && pendingFromTerritory && pendingToTerritory
  );
  const warConfirmationRef = useAccessibleDialog(warConfirmationOpen, () =>
    store.setPendingWarMove(null)
  );

  const handleMapSelectTerritory = (terrId: string | null) => {
    if (!terrId) {
      store.selectTerritoryOnMap(null);
      return;
    }
    const terr = territories[terrId];
    if (screenState === 'TITLE_MENU') {
      if (terr && nations[terr.ownerId]) {
        store.selectPlayerNation(terr.ownerId);
        store.selectTerritory(terrId);
      }
      return;
    }
    if (macroMode !== 'NONE' && terr) {
      store.selectTerritoryOnMap(terrId);
      if (terr.ownerId !== playerNationId) {
        store.showToast('Makro işlem yalnızca kendi eyaletlerimizde kullanılabilir.');
        return;
      }
      if (macroMode === 'RECRUIT_INFANTRY') {
        store.recruitUnit(terrId, 'infantry', 1000, 150);
      } else if (macroMode === 'BUILD_ECONOMY') {
        store.upgradeBuilding(terrId, 'factory');
      } else if (macroMode === 'BUILD_FORT') {
        store.upgradeBuilding(terrId, 'fortress');
      }
      return;
    }
    if (battles.some((b) => b.territoryId === terrId) || Boolean(terr?.siege)) {
      store.setActiveBattleOverviewTerritoryId(terrId);
    }
    store.selectTerritoryOnMap(terrId);
  };

  return (
    <div
      data-ui-scale={settings.uiScale || 'STANDARD'}
      className="relative w-screen h-[100dvh] overflow-hidden bg-[#060B16] select-none flex flex-col"
    >
      {screenState === 'TITLE_MENU' && (
        <Suspense fallback={<DialogLoadingFallback />}>
          <LazyTitleMenuModal
            nations={nations}
            territories={territories}
            selectedMode={gameMode}
            selectedNationId={playerNationId}
            hasSavedGame={hasSavedGame}
            settings={settings}
            onUpdateSettings={store.updateSettings}
            onSelectMode={store.selectScenarioMode}
            onSelectNation={store.selectPlayerNation}
            onStartNewGame={store.startNewGame}
            onLoadSavedGame={store.loadMostRecentSave}
          />
        </Suspense>
      )}

      {(activeCrisis || showNewsDrawer) && (
        <Suspense fallback={<DialogLoadingFallback />}>
          <LazyCrisisAndNewsModal
            activeCrisis={activeCrisis}
            onResolveCrisis={store.resolveCrisis}
            showNewsDrawer={showNewsDrawer}
            onCloseNewsDrawer={() => store.setShowNewsDrawer(false)}
            newsEvents={newsEvents}
            onTriggerManualCabinetDecision={store.triggerManualCabinetDecision}
          />
        </Suspense>
      )}

      {showSystemModal && (
        <Suspense fallback={<DialogLoadingFallback />}>
          <LazySystemAndSaveModal
            isOpen={showSystemModal}
            onClose={() => store.setShowSystemModal(false)}
            settings={settings}
            onUpdateSettings={store.updateSettings}
            soundEnabled={soundEnabled}
            onToggleSound={store.toggleSound}
            newsCount={newsEvents.length}
            onOpenNewsDrawer={() => store.setShowNewsDrawer(true)}
            onReturnToTitleMenu={() => {
              store.setSpeed(0);
              store.setScreenState('TITLE_MENU');
            }}
            onSaveToSlot={store.saveToSlot}
            onLoadRecord={store.loadRecord}
            onShowToast={store.showToast}
          />
        </Suspense>
      )}

      {activeTacticalBattle && (
        <Suspense fallback={<DialogLoadingFallback />}>
          <LazyTacticalBattleModal
            battleState={activeTacticalBattle}
            playerNationId={playerNationId}
            nations={nations}
            territories={territories}
            onCloseAndApplyOutcome={store.applyBattleOutcome}
          />
        </Suspense>
      )}

      {/* AoH3-Style Border Violation & War Declaration Confirmation Modal */}
      {pendingWarMove && pendingTargetNation && pendingFromTerritory && pendingToTerritory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/88">
          <div
            ref={warConfirmationRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="war-confirmation-title"
            aria-describedby="war-confirmation-description"
            tabIndex={-1}
            className="w-full max-w-md bg-slate-900 border-2 border-rose-500/70 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
          >
            <div className="px-4 py-3 bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 border-b border-rose-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center shadow">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 id="war-confirmation-title" className="font-display font-bold text-sm sm:text-base text-white">
                    Sınır İhlali & Savaş İlanı Onayı
                  </h3>
                  <p className="text-[11px] text-rose-300">
                    Age of History 3 Diplomasi Kuralı: Tarafsız Ülke Toprağı
                  </p>
                </div>
              </div>
              <button
                onClick={() => store.setPendingWarMove(null)}
                aria-label="Savaş ilanı onayını kapat"
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/90 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-xs text-white"
                    style={{ backgroundColor: pendingTargetNation.color }}
                  >
                    {pendingTargetNation.flagCode}
                  </span>
                  <div>
                    <div className="font-bold text-white text-sm">
                      {pendingTargetNation.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Hedef Eyalet: <strong className="text-amber-300">{pendingToTerritory.name}</strong> ({(pendingToTerritory.garrison / 1000).toFixed(1)}B Garnizon)
                    </div>
                  </div>
                </div>
              </div>

              <p id="war-confirmation-description" className="text-slate-300 leading-relaxed">
                <strong>{pendingFromTerritory.name}</strong> eyaletindeki ordunuzu{' '}
                <strong>{pendingTargetNation.name}</strong> egemenliğindeki{' '}
                <strong>{pendingToTerritory.name}</strong> toprağına yürütmek üzeresiniz. Aranızda resmi bir savaş veya askeri geçiş antlaşması bulunmuyor.
              </p>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => store.confirmPendingWarMove()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 cursor-pointer"
                >
                  <Swords className="w-4 h-4" />
                  <span>⚔️ Resmen Savaş İlan Et ve Taarruza Geç!</span>
                </button>

                <button
                  onClick={() => {
                    store.diplomaticAction(
                      pendingWarMove.targetNationId,
                      'MILITARY_ACCESS'
                    );
                    store.setPendingWarMove(null);
                  }}
                  className="w-full py-2 px-4 rounded-xl bg-sky-600/25 hover:bg-sky-600/35 border border-sky-500/40 text-sky-200 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span>🧭 Savaşmadan Askeri Geçiş İzni İste (120 Altın)</span>
                </button>

                <button
                  onClick={() => store.setPendingWarMove(null)}
                  className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
                >
                  Sefer Emrini İptal Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TopHudBar
        playerNation={playerNation}
        playerEconomy={playerEconomy}
        activeTab={activeTab}
        tick={tick}
        hour={hour}
        speed={speed}
        gameMode={gameMode}
        newsCount={newsEvents.length}
        isMusicPlaying={isMusicPlaying}
        onSetActiveTab={store.setActiveTab}
        onSetSpeed={store.setSpeed}
        onTogglePause={store.togglePause}
        onOpenSystemModal={() => store.setShowSystemModal(true)}
        onOpenNewsDrawer={() => store.setShowNewsDrawer(true)}
      />

      <div className="relative flex-1 w-full overflow-hidden">
        <Suspense
          fallback={
            <div
              role="status"
              aria-live="polite"
              className="absolute inset-0 flex items-center justify-center text-sm text-slate-400"
            >
              Harita yükleniyor…
            </div>
          }
        >
          <LazyWorldMapCanvas
            features={features}
            territories={territories}
            nations={nations}
            relations={relations}
            wars={wars}
            battles={battles}
            movements={movements}
            playerNationId={playerNationId}
            selectedTerritoryId={selectedTerritoryId}
            armyOrderSourceId={armyOrderSourceId}
            mapMode={mapMode}
            mapLabelDensity={settings.mapLabelDensity}
            fogOfWarEnabled={settings.fogOfWarEnabled}
            showZoomControls={settings.showZoomControls}
            onSelectTerritory={handleMapSelectTerritory}
            onExecuteArmyMove={store.executeArmyMove}
            onCancelArmyOrder={() => store.setArmyOrderSourceId(null)}
          />
        </Suspense>

        <MapModePillBar
          mapMode={mapMode}
          macroMode={macroMode}
          toastMessage={toastMessage}
          onSetMapMode={store.setMapMode}
          onSetMacroMode={setMacroMode}
        />

        {screenState === 'PLAYING' && (
          <AoH3OutlinerWidget
            playerNationId={playerNationId}
            nations={nations}
            territories={territories}
            wars={wars}
            battles={battles}
            movements={movements}
            selectedTerritoryId={selectedTerritoryId}
            onSelectTerritory={store.selectTerritory}
            onSetActiveTab={store.setActiveTab}
            onStartArmyOrder={store.setArmyOrderSourceId}
          />
        )}

        {selectedTerritory && activeTab === 'NONE' && (
          <SelectedProvinceBar
            territory={selectedTerritory}
            playerNationId={playerNationId}
            nations={nations}
            territories={territories}
            relations={relations}
            wars={wars}
            battles={battles}
            fogOfWarEnabled={settings.fogOfWarEnabled}
            armyOrderSourceId={armyOrderSourceId}
            moveRatio={moveRatio}
            onSetMoveRatio={store.setMoveRatio}
            onStartArmyOrder={store.setArmyOrderSourceId}
            onQuickRecruitInfantry={(tId) =>
              store.recruitUnit(tId, 'infantry', 1000, 150)
            }
            onSelectTerritory={store.selectTerritory}
            onOpenFullDrawer={() => store.setActiveTab('TERRITORY')}
            onOpenDiplomacyDrawer={() => store.setActiveTab('DIPLOMACY')}
            onOpenBattleOverview={() =>
              store.setActiveBattleOverviewTerritoryId(selectedTerritory.id)
            }
            onClear={() => store.selectTerritoryOnMap(null)}
          />
        )}

        {activeBattleOverviewTerritoryId &&
          territories[activeBattleOverviewTerritoryId] && (
            <LazyAoH3BattleOverviewModal
              battle={battles.find(
                (b) => b.territoryId === activeBattleOverviewTerritoryId
              )}
              siege={territories[activeBattleOverviewTerritoryId]?.siege}
              territory={territories[activeBattleOverviewTerritoryId]}
              playerNationId={playerNationId}
              nations={nations}
              onClose={() => store.setActiveBattleOverviewTerritoryId(null)}
              onApplyTacticalOrder={(tactic) =>
                store.applyTacticalOrder(activeBattleOverviewTerritoryId, tactic)
              }
            />
          )}

        {activeTab !== 'NONE' && (
          <Suspense fallback={<DialogLoadingFallback />}>
            <LazyCommandDrawers
              activeTab={activeTab}
              onClose={() => store.setActiveTab('NONE')}
              playerNation={playerNation}
              playerEconomy={playerEconomy}
              selectedTerritory={selectedTerritory}
              territories={territories}
              nations={nations}
              relations={relations}
              wars={wars}
              movements={movements}
              moveRatio={moveRatio}
              onSetMoveRatio={store.setMoveRatio}
              onStartArmyOrderMode={store.setArmyOrderSourceId}
              onExecuteArmyMove={store.executeArmyMove}
              onRecruitUnit={store.recruitUnit}
              onRecruitOrAssignGeneral={store.recruitOrAssignGeneral}
              onUpgradeBuilding={store.upgradeBuilding}
              onAssimilateTerritory={store.assimilateTerritory}
              onStartMissionary={store.startMissionary}
              onFormEmpire={store.formEmpire}
              onUpdateTaxRate={store.updateTaxRate}
              onUpdateBudget={store.updateBudget}
              onCentralBankIntervention={store.centralBankIntervention}
              onIssueWarBonds={store.issueWarBonds}
              onChangeIdeology={store.changeIdeology}
              onStartResearch={store.startResearch}
              onCancelResearch={store.cancelResearch}
              onBoostResearch={store.boostResearch}
              onUnlockTech={store.unlockTech}
              onEnactReform={store.enactReform}
              onDiplomaticAction={store.diplomaticAction}
              onPeaceDeal={store.peaceDeal}
              onSelectTerritory={store.selectTerritory}
              fogOfWarEnabled={settings.fogOfWarEnabled}
              onModernizeNationalArmy={store.modernizeNationalArmy}
              onAssignFiefLord={store.assignFiefLord}
              onBestowFavorOnLord={store.bestowFavorOnLord}
              onToggleCallLordToBanner={store.toggleCallLordToBanner}
              onRaidEnemyTradeRoutes={store.raidEnemyTradeRoutes}
              onSiegeBombardment={store.siegeBombardment}
              gameMode={gameMode}
            />
          </Suspense>
        )}
      </div>

      <MehterhaneYoutubeDock />

      <BottomNavBar
        activeTab={activeTab}
        activeWarCount={wars.length}
        onSetActiveTab={store.setActiveTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <GameErrorBoundary>
      <GameAppInner />
    </GameErrorBoundary>
  );
}
