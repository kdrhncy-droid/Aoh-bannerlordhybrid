import React, { useState, useMemo } from 'react';
import {
  Shield,
  Coins,
  Users,
  Globe,
  Play,
  RotateCcw,
  Search,
  MapPin,
  LayoutGrid,
  Sliders,
} from 'lucide-react';
import {
  GAME_MODES,
  IDEOLOGIES,
  PRESET_COUNTRIES_2026,
  RESOURCE_INFO,
} from '../data/world2026Data';
import { GameModeId, Nation, Territory } from '../types/game';
import {
  AI_AGGRESSIVENESS_OPTIONS,
  AUTO_SAVE_OPTIONS,
  GameSettings,
  MAP_LABEL_DENSITY_OPTIONS,
  UI_SCALE_OPTIONS,
} from '../engine/gameSettings';
import { NationFlagCanvasBadge } from '../map/nationFlagRenderer';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { sound } from '../utils/soundEngine';
import { PWAInstallButton } from './PWAInstallButton';
import { TerrainPanoramaSvg } from './illustrations/AoH3Illustrations';

interface TitleMenuModalProps {
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  selectedMode: GameModeId;
  selectedNationId: string;
  hasSavedGame: boolean;
  settings: GameSettings;
  onUpdateSettings: (partial: Partial<GameSettings>) => void;
  onSelectMode: (mode: GameModeId) => void;
  onSelectNation: (nationId: string) => void;
  onStartNewGame: () => void;
  onLoadSavedGame: () => void;
}

export const TitleMenuModal: React.FC<TitleMenuModalProps> = ({
  nations,
  territories,
  selectedMode,
  selectedNationId,
  hasSavedGame,
  settings,
  onUpdateSettings,
  onSelectMode,
  onSelectNation,
  onStartNewGame,
  onLoadSavedGame,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'MAJOR' | 'ALL'>('MAJOR');
  const [mapPickerMode, setMapPickerMode] = useState(false);

  // Compute aggregate empire stats (provinces, total garrison, total GDP) per nation
  const nationStatsMap = useMemo(() => {
    const stats: Record<
      string,
      { provinces: number; totalGarrison: number; totalGdp: number }
    > = {};
    for (const nId of Object.keys(nations)) {
      stats[nId] = { provinces: 0, totalGarrison: 0, totalGdp: 0 };
    }
    for (const terr of Object.values(territories)) {
      if (!stats[terr.ownerId]) {
        stats[terr.ownerId] = { provinces: 0, totalGarrison: 0, totalGdp: 0 };
      }
      stats[terr.ownerId].provinces += 1;
      stats[terr.ownerId].totalGarrison += terr.garrison;
      stats[terr.ownerId].totalGdp += terr.baseGdp;
    }
    return stats;
  }, [nations, territories]);

  const nationList = useMemo(() => {
    const list = Object.values(nations).sort((a, b) => {
      const gdpA = nationStatsMap[a.id]?.totalGdp || 0;
      const gdpB = nationStatsMap[b.id]?.totalGdp || 0;
      return gdpB - gdpA;
    });

    return list.filter((n) => {
      if (
        filterTab === 'MAJOR' &&
        selectedMode !== 'EMPIRES_1440' &&
        !PRESET_COUNTRIES_2026[n.id]
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        return n.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      }
      return true;
    });
  }, [nations, nationStatsMap, filterTab, searchQuery, selectedMode]);

  const activeNation = nations[selectedNationId];
  const activeCapId = activeNation?.capitalTerritoryId || selectedNationId;
  const activeTerritory =
    territories[activeCapId] || territories[selectedNationId];
  const activeStats = nationStatsMap[selectedNationId] || {
    provinces: 1,
    totalGarrison: activeTerritory?.garrison || 15000,
    totalGdp: activeTerritory?.baseGdp || 80,
  };
  const activeIdeology = activeNation ? IDEOLOGIES[activeNation.ideology] : null;
  const activeResource = activeTerritory
    ? RESOURCE_INFO[activeTerritory.resource]
    : null;
  const dialogRef = useAccessibleDialog(
    !mapPickerMode,
    () => undefined,
    { closeOnEscape: false }
  );

  return (
    <div
      ref={dialogRef}
      role={mapPickerMode ? undefined : 'dialog'}
      aria-modal={mapPickerMode ? undefined : 'true'}
      aria-labelledby={mapPickerMode ? undefined : 'title-menu-heading'}
      tabIndex={mapPickerMode ? undefined : -1}
      className={`fixed inset-0 z-40 flex flex-col text-slate-100 ${
        mapPickerMode
          ? 'pointer-events-none bg-transparent'
          : 'bg-[#060B16]/85 overflow-y-auto'
      }`}
    >
      {/* Top Bar following 3-Zone Contract */}
      <header className="title-menu-header pointer-events-auto flex items-center justify-between gap-8 px-3 sm:px-6 py-3 border-b border-amber-500/40 bg-[#070b14]/96 shadow-xl shrink-0">
        {/* Zone 1: Single text element wordmark */}
        <span className="title-menu-brand font-display text-sm sm:text-lg md:text-xl font-bold tracking-wider text-amber-400 whitespace-nowrap shrink-0">
          IMPERIUM: AGE OF HISTORY
        </span>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => {
              sound.playClick();
              setMapPickerMode(false);
              setFilterTab('MAJOR');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              !mapPickerMode && filterTab === 'MAJOR'
                ? 'text-amber-400 underline underline-offset-4'
                : ''
            }`}
          >
            Büyük Güçler
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setMapPickerMode(false);
              setFilterTab('ALL');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              !mapPickerMode && filterTab === 'ALL'
                ? 'text-amber-400 underline underline-offset-4'
                : ''
            }`}
          >
            Tüm Medeniyetler
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setMapPickerMode((prev) => !prev);
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              mapPickerMode
                ? 'text-amber-400 underline underline-offset-4'
                : ''
            }`}
          >
            Haritadan Seç
          </button>
          {hasSavedGame && (
            <button
              onClick={() => {
                sound.playClick();
                onLoadSavedGame();
              }}
              className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 text-emerald-300"
            >
              Kayıttan Devam Et
            </button>
          )}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="title-menu-primary flex items-center gap-2 shrink-0">
          <button
            data-start="true"
            onClick={() => {
              sound.playWarHorn();
              onStartNewGame();
            }}
            className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 min-h-[40px] sm:min-h-[44px] shadow-lg shadow-amber-500/25"
          >
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            <span>Seferi Başlat</span>
          </button>
        </div>
      </header>

      {/* Sub-Toolbar for Mobile / Quick Mode Switch (Below Header) */}
      <div className="title-menu-subtoolbar pointer-events-auto flex items-center justify-between gap-2 px-3 sm:px-6 py-2 bg-[#090e1a]/92 border-b border-slate-800/80 shrink-0">
        <div className="title-menu-subtoolbar-nav flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playClick();
              setMapPickerMode(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              !mapPickerMode
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>AoH3 Senaryo & Liste</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMapPickerMode(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              mapPickerMode
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-900 text-amber-300 border border-amber-500/40 hover:bg-amber-500/15'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Haritadan Dokunarak Seç</span>
          </button>
        </div>

        <div className="title-menu-subtoolbar-actions flex items-center gap-2">
          <PWAInstallButton compact />
          {hasSavedGame && (
            <button
              onClick={() => {
                sound.playClick();
                onLoadSavedGame();
              }}
              className="md:hidden px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-slate-900 rounded-xl border border-emerald-500/40 flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Devam Et</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode A: Interactive AoH3 Live Map Country Picker Overlay */}
      {mapPickerMode ? (
        <div className="flex-1 flex flex-col justify-between p-3 sm:p-5 pointer-events-none">
          {/* Top-Left AoH3 Floating Scenario Pill */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 bg-[#090e1a]/95 border border-amber-500/45 rounded-2xl p-2 w-fit shadow-2xl">
            {GAME_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  sound.playClick();
                  onSelectMode(mode.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  selectedMode === mode.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300 hover:text-white'
                }`}
              >
                {mode.name}
              </button>
            ))}
          </div>

          {/* Bottom AoH3 Selected Civilization Card Over Live Map */}
          {activeNation && activeTerritory && (
            <div className="pointer-events-auto max-w-xl w-full mx-auto bg-[#090e1a]/96 border-2 border-amber-500/60 rounded-2xl p-3.5 sm:p-4 shadow-2xl space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <NationFlagCanvasBadge
                    nationId={activeNation.id}
                    flagCode={activeNation.flagCode}
                    color={activeNation.color}
                    width={46}
                    height={32}
                  />
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-amber-400">
                      Haritadan Seçilen Medeniyet ({activeStats.provinces} Eyalet)
                    </div>
                    <h2 className="font-display text-base sm:text-lg font-bold text-white truncate">
                      {activeNation.name}
                    </h2>
                  </div>
                </div>

                <button
                  data-start="true"
                  onClick={() => {
                    sound.playWarHorn();
                    onStartNewGame();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Oyna</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Hazine</div>
                  <div className="font-mono-num text-xs sm:text-sm font-bold text-amber-400">
                    {activeNation.treasury.toLocaleString('tr-TR')}G
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Toplam Ordu</div>
                  <div className="font-mono-num text-xs sm:text-sm font-bold text-rose-400">
                    {(activeStats.totalGarrison / 1000).toFixed(1)}B
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Ekonomi (GSYİH)</div>
                  <div className="font-mono-num text-xs sm:text-sm font-bold text-sky-400">
                    {activeStats.totalGdp}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Mode B: Full AoH3 Two-Column Campaign & Civilization Command Screen */
        <main className="pointer-events-auto flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Column: AoH3 Scenario, UI Scale & Selected Nation Dossier (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Scenario, AI Difficulty & AoH3 UI Scale Selector */}
            <section className="bg-[#090e1a]/95 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-2xl">
              <div>
                <h1 id="title-menu-heading" className="font-display text-lg sm:text-xl font-bold text-amber-100">
                  01. Senaryo ve AoH3 Arayüz Ayarları
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tarihi çağı, yapay zeka saldırganlığını ve mobil HUD ölçeğini seçin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GAME_MODES.map((mode) => {
                  const isSelected = selectedMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        sound.playClick();
                        onSelectMode(mode.id);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[78px] ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                          : 'bg-slate-950/70 border-slate-800/90 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">
                          {mode.name}
                        </div>
                        <div className="text-[11px] text-amber-400 mt-0.5">
                          {mode.subtitle}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                        {mode.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* AoH3 UI Scale Selector (0 / 1 / 2) for Mobile & Desktop Ergonomics */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>AoH3 Mobil / Ekran UI Ölçeği:</span>
                  </span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onUpdateSettings({
                        fogOfWarEnabled: !settings.fogOfWarEnabled,
                      });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                      settings.fogOfWarEnabled
                        ? 'bg-sky-500/15 border-sky-500/50 text-sky-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Savaş Sisi: {settings.fogOfWarEnabled ? 'Açık' : 'Kapalı'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {UI_SCALE_OPTIONS.map((opt) => {
                    const active = (settings.uiScale || 'STANDARD') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          sound.playClick();
                          onUpdateSettings({ uiScale: opt.value });
                        }}
                        title={opt.desc}
                        className={`px-2 py-1.5 rounded-xl border text-[11px] font-bold transition-colors ${
                          active
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-300">Harita etiket yoğunluğu:</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {MAP_LABEL_DENSITY_OPTIONS.map((option) => {
                      const active = settings.mapLabelDensity === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={active}
                          title={option.desc}
                          onClick={() => {
                            sound.playClick();
                            onUpdateSettings({ mapLabelDensity: option.value });
                          }}
                          className={`min-h-[40px] px-1.5 py-1 rounded-lg border text-[10px] font-bold transition-colors ${
                            active
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AI Aggressiveness */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-semibold text-slate-400">
                    AI Saldırganlığı:
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {AI_AGGRESSIVENESS_OPTIONS.map((opt) => {
                      const isActive = settings.aiAggressiveness === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            sound.playClick();
                            onUpdateSettings({ aiAggressiveness: opt.value });
                          }}
                          className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-colors ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {opt.label.split(' ')[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Auto-Save Selector at Game Start */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Oto-Kayıt:
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {AUTO_SAVE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          sound.playClick();
                          onUpdateSettings({ autoSaveIntervalDays: opt.value });
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                          settings.autoSaveIntervalDays === opt.value
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Selected Nation AoH3 Dossier with Illustrated Landscape Banner */}
            {activeNation && activeTerritory && (
              <section className="bg-[#090e1a]/95 border border-amber-500/40 rounded-2xl overflow-hidden flex-1 flex flex-col justify-between shadow-2xl">
                <div>
                  {/* AoH3 Illustrated Capital Panorama Header */}
                  <div className="relative h-24 w-full border-b border-amber-500/30">
                    <TerrainPanoramaSvg
                      terrain={activeTerritory.terrain || 'METROPOL'}
                      fortLevel={activeTerritory.buildings.fortress}
                      isCapital
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090e1a] via-[#090e1a]/35 to-transparent" />
                    <div className="absolute bottom-2 left-4 right-4 flex items-end justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <NationFlagCanvasBadge
                          nationId={activeNation.id}
                          flagCode={activeNation.flagCode}
                          color={activeNation.color}
                          width={46}
                          height={32}
                        />
                        <div>
                          <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                            {activeNation.name}
                          </h2>
                          <div className="flex items-center gap-2 text-xs text-amber-300">
                            <span>{activeIdeology?.name}</span>
                            <span aria-hidden="true">·</span>
                            <span>{activeStats.provinces} Eyalet</span>
                            <span aria-hidden="true">·</span>
                            <span>{activeResource?.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeIdeology?.description}
                    </p>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span>Başlangıç Hazinesi</span>
                        </div>
                        <div className="font-mono-num text-base font-bold text-amber-400 mt-0.5">
                          {activeNation.treasury.toLocaleString('tr-TR')} Altın
                        </div>
                      </div>

                      <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Shield className="w-3.5 h-3.5 text-rose-400" />
                          <span>Toplam İmparatorluk Ordusu</span>
                        </div>
                        <div className="font-mono-num text-base font-bold text-rose-400 mt-0.5">
                          {activeStats.totalGarrison.toLocaleString('tr-TR')} Asker
                        </div>
                      </div>

                      <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                          <span>İnsan Gücü Rezervi</span>
                        </div>
                        <div className="font-mono-num text-base font-bold text-emerald-400 mt-0.5">
                          {activeNation.manpower.toLocaleString('tr-TR')}
                        </div>
                      </div>

                      <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Globe className="w-3.5 h-3.5 text-sky-400" />
                          <span>Toplam Ekonomi</span>
                        </div>
                        <div className="font-mono-num text-base font-bold text-sky-400 mt-0.5">
                          {activeStats.totalGdp} GSYİH
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    data-start="true"
                    onClick={() => {
                      sound.playWarHorn();
                      onStartNewGame();
                    }}
                    className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-transform"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {activeNation.name} İle Seferi Başlat
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* Right Column: AoH3 Country Picker Roster (7 cols) */}
          <section className="lg:col-span-7 bg-[#090e1a]/95 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 max-h-[75vh] lg:max-h-none shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-amber-100">
                  02. Medeniyet / İmparatorluk Seçimi
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Listeden veya üstteki &ldquo;Haritadan Dokunarak Seç&rdquo; moduyla doğrudan dünya haritasından seçin.
                </p>
              </div>

              {/* Filter Segmented Control */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start">
                <button
                  onClick={() => {
                    sound.playClick();
                    setFilterTab('MAJOR');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    filterTab === 'MAJOR'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Öne Çıkan Güçler
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setFilterTab('ALL');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    filterTab === 'ALL'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tüm Ülkeler ({Object.keys(nations).length})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Medeniyet veya ülke ara (örn. Osmanlı, Bizans, Macaristan, Türkiye)..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Country List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto pr-1 flex-1 max-h-[440px]">
              {nationList.map((nation) => {
                const nStats = nationStatsMap[nation.id] || {
                  provinces: 1,
                  totalGarrison: 15000,
                  totalGdp: 70,
                };
                const isSelected = nation.id === selectedNationId;
                const ideo = IDEOLOGIES[nation.ideology];
                return (
                  <button
                    key={nation.id}
                    onClick={() => {
                      sound.playSelectTerritory();
                      onSelectNation(nation.id);
                    }}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-all min-h-[64px] ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                        : 'bg-slate-950/70 border-slate-800/80 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <NationFlagCanvasBadge
                        nationId={nation.id}
                        flagCode={nation.flagCode}
                        color={nation.color}
                        width={38}
                        height={26}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">
                          {nation.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {ideo.name} · {nStats.provinces} Eyalet
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono-num text-xs font-semibold text-amber-400">
                        {nStats.totalGdp} GSYİH
                      </div>
                      <div className="font-mono-num text-[11px] text-emerald-400">
                        {(nStats.totalGarrison / 1000).toFixed(1)}B Asker
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      )}
    </div>
  );
};
