import React from 'react';
import {
  Pause,
  Play,
  FastForward,
  Coins,
  Users,
  Shield,
  FlaskConical,
  Save,
  Menu,
  Newspaper,
  Scale,
} from 'lucide-react';
import {
  BottomDrawerTab,
  GameModeId,
  Nation,
  SpeedLevel,
} from '../../types/game';
import { IDEOLOGIES } from '../../data/world2026Data';
import {
  formatGameDate,
  NationEconomyBreakdown,
} from '../../engine/simulationEngine';
import { music } from '../../engine/musicEngine';
import { NationFlagCanvasBadge } from '../../map/nationFlagRenderer';
import { sound } from '../../utils/soundEngine';

interface TopHudBarProps {
  playerNation: Nation;
  playerEconomy: NationEconomyBreakdown;
  activeTab: BottomDrawerTab;
  tick: number;
  hour?: number;
  speed: SpeedLevel;
  gameMode: GameModeId;
  newsCount: number;
  isMusicPlaying: boolean;
  onSetActiveTab: (tab: BottomDrawerTab) => void;
  onSetSpeed: (speed: SpeedLevel) => void;
  onTogglePause: () => void;
  onOpenSystemModal: () => void;
  onOpenNewsDrawer: () => void;
}

const SPEED_STEPS: ReadonlyArray<{ level: SpeedLevel; label: string }> = [
  { level: 1, label: '1x' },
  { level: 2, label: '2x' },
  { level: 4, label: '4x' },
  { level: 5, label: '5x' },
];

export const TopHudBar: React.FC<TopHudBarProps> = ({
  playerNation,
  playerEconomy,
  activeTab,
  tick,
  hour = 8,
  speed,
  gameMode,
  newsCount,
  isMusicPlaying,
  onSetActiveTab,
  onSetSpeed,
  onTogglePause,
  onOpenSystemModal,
  onOpenNewsDrawer,
}) => {
  const cleanNationName = playerNation.name.replace(/\s*\(1440\)\s*$/, '');
  const dateLabel = formatGameDate(tick, gameMode);
  const hourLabel = `${String(hour % 24).padStart(2, '0')}:00`;
  const hourlyRateLabel =
    speed === 0
      ? 'DURAKLATILDI'
      : speed === 1
      ? 'HIZ: 1x (+1 Saat)'
      : speed === 2
      ? 'HIZ: 2x (+2 Saat)'
      : speed === 4
      ? 'HIZ: 4x (+3 Saat)'
      : 'HIZ: 5x (+6 Saat)';

  const cycleSpeed = () => {
    sound.playClick();
    const nextSpeed: Record<SpeedLevel, SpeedLevel> = {
      0: 1,
      1: 2,
      2: 4,
      4: 5,
      5: 1,
    };
    onSetSpeed(nextSpeed[speed]);
  };

  return (
    <header className="hud-header px-2.5 py-1.5 sm:py-0 sm:h-14 sm:px-4 bg-[#070b14]/98 border-b border-amber-500/35 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 z-30 shrink-0">
      {/* Row 1 on Portrait / Left+Right Wrapper on Mobile */}
      <div className="flex items-center justify-between gap-2 w-full sm:w-auto sm:justify-start min-w-0">
        {/* Left: Menu + AoH3 Top-Left Imperial Flag Shield & Nation Hub */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button
            onClick={() => {
              sound.playClick();
              onSetSpeed(0);
              onOpenSystemModal();
            }}
            title="Sistem Menüsü, UI Ölçeği & Kayıt Merkezi"
            className="min-w-[36px] min-h-[36px] sm:min-h-[38px] px-2 rounded-xl bg-[#0c1324] hover:bg-slate-800 border border-amber-500/35 flex items-center justify-center gap-1.5 text-slate-200 shrink-0"
          >
            <Menu className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden lg:inline text-xs font-semibold">Menü</span>
          </button>

          {/* AoH3 Top-Left Civilization Flag Shield Button */}
          <button
            onClick={() => {
              sound.playClick();
              onSetActiveTab(
                activeTab === 'GOVERNMENT' ? 'NONE' : 'GOVERNMENT'
              );
            }}
            title="Devlet Divanı, İdeoloji ve Teknoloji Ağacını Aç (AoH3 Bayrak Menüsü)"
            className="flex items-center gap-2 text-left min-w-0 px-1.5 py-0.5 rounded-xl hover:bg-amber-500/10 transition-colors"
          >
            <div className="relative shrink-0">
              <NationFlagCanvasBadge
                nationId={playerNation.id}
                flagCode={playerNation.flagCode}
                color={playerNation.color}
                width={38}
                height={28}
              />
              <span className="absolute -bottom-1 -right-1 px-1 rounded bg-slate-950 border border-amber-400/60 text-[8px] font-mono-num text-amber-300">
                %{Math.round(playerNation.stability)}
              </span>
            </div>
            <div className="min-w-0">
              <div className="font-display text-xs sm:text-sm font-bold text-amber-100 truncate max-w-[135px] md:max-w-[185px]">
                {cleanNationName}
              </div>
              <div className="text-[10px] text-amber-400 sm:text-slate-400 truncate leading-tight font-mono-num sm:font-sans">
                <span className="sm:hidden font-semibold">
                  {dateLabel} · 🕒 {hourLabel}
                </span>
                <span className="hidden sm:inline text-amber-300/90">
                  {IDEOLOGIES[playerNation.ideology]?.name ?? 'Monarşi'} · Divan
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Portrait-Only Compact Time & News Controls */}
        <div className="flex sm:hidden items-center gap-1 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onOpenNewsDrawer();
            }}
            title="Dünya Haberleri & Divan"
            className="min-w-[34px] min-h-[34px] px-1.5 rounded-xl bg-[#0c1324] border border-amber-500/30 flex items-center justify-center gap-1 text-[11px] font-mono-num font-bold text-amber-300"
          >
            <Newspaper className="w-3.5 h-3.5 text-amber-400" />
            <span>{newsCount}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onTogglePause();
            }}
            className={`min-w-[34px] min-h-[34px] rounded-xl flex items-center justify-center border transition-colors ${
              speed === 0
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-[#0c1324] text-slate-200 border-amber-500/30'
            }`}
          >
            {speed === 0 ? (
              <Play className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Pause className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={cycleSpeed}
            className="min-w-[38px] min-h-[34px] px-1.5 rounded-xl bg-[#0c1324] border border-amber-500/30 flex items-center justify-center gap-0.5 text-[11px] font-mono-num font-bold text-amber-400"
          >
            <FastForward className="w-3 h-3 shrink-0" />
            <span>{speed === 0 ? '1x' : `${speed}x`}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              music.toggle();
            }}
            className={`min-w-[32px] min-h-[34px] rounded-xl border flex items-center justify-center text-xs font-bold ${
              isMusicPlaying
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-[#0c1324] text-slate-400 border-slate-800'
            }`}
          >
            ♫
          </button>
        </div>
      </div>

      {/* Center / Row 2 on Portrait: AoH3 Top Resource Strip */}
      <div className="flex items-center justify-between sm:justify-center gap-1 sm:gap-1.5 w-full sm:w-auto min-w-0">
        <button
          onClick={() =>
            onSetActiveTab(activeTab === 'ECONOMY' ? 'NONE' : 'ECONOMY')
          }
          title="Hazine ve Günlük Net Gelir"
          className="flex items-center justify-center gap-1 px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#0c1324] border border-amber-500/35 hover:border-amber-400 shrink-0"
        >
          <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
          <span className="font-mono-num text-[11px] sm:text-xs font-bold text-white whitespace-nowrap">
            {playerNation.treasury.toLocaleString('tr-TR')}
          </span>
          <span
            className={`font-mono-num text-[10px] font-semibold whitespace-nowrap ${
              playerEconomy.netDailyGold >= 0
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
          >
            ({playerEconomy.netDailyGold >= 0
              ? `+${playerEconomy.netDailyGold}`
              : playerEconomy.netDailyGold})
          </span>
        </button>

        <button
          onClick={() =>
            onSetActiveTab(activeTab === 'MILITARY' ? 'NONE' : 'MILITARY')
          }
          title="İnsan Gücü (Yedek Asker Havuzu)"
          className="flex items-center justify-center gap-1 px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#0c1324] border border-emerald-500/30 hover:border-emerald-400 shrink-0"
        >
          <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
          <span className="font-mono-num text-[11px] sm:text-xs font-bold text-white whitespace-nowrap">
            {(playerNation.manpower / 1000).toFixed(0)}B
          </span>
        </button>

        <button
          onClick={() =>
            onSetActiveTab(activeTab === 'MILITARY' ? 'NONE' : 'MILITARY')
          }
          title="Toplam Silah Altındaki Ordu"
          className="flex sm:hidden lg:flex items-center justify-center gap-1 px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#0c1324] border border-rose-500/30 hover:border-rose-400 shrink-0"
        >
          <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 shrink-0" />
          <span className="font-mono-num text-[11px] sm:text-xs font-bold text-white whitespace-nowrap">
            {(playerEconomy.totalGarrison / 1000).toFixed(0)}B
          </span>
        </button>

        {playerNation.activeResearch ? (
          <button
            onClick={() => {
              sound.playClick();
              onSetActiveTab(activeTab === 'GOVERNMENT' ? 'NONE' : 'GOVERNMENT');
            }}
            title="Aktif Teknoloji Araştırması"
            className="relative flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#0c1324] border border-sky-500/50 hover:border-sky-400 shrink-0 shadow-sm"
          >
            <FlaskConical className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400 shrink-0 animate-pulse" />
            <span className="font-mono-num text-[11px] sm:text-xs font-bold text-sky-200 whitespace-nowrap">
              %{Math.min(100, Math.round((playerNation.activeResearch.progress / playerNation.activeResearch.totalCost) * 100))}
            </span>
            <span className="hidden md:inline font-mono-num text-[10px] text-amber-300 whitespace-nowrap">
              ({Math.max(1, Math.ceil((playerNation.activeResearch.totalCost - playerNation.activeResearch.progress) / Math.max(0.4, playerEconomy.dailyResearch)))}g)
            </span>
            <div className="absolute bottom-0 left-1 right-1 h-[2px] bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400 transition-all"
                style={{
                  width: `${Math.min(100, Math.round((playerNation.activeResearch.progress / playerNation.activeResearch.totalCost) * 100))}%`,
                }}
              />
            </div>
          </button>
        ) : (
          <button
            onClick={() => {
              sound.playClick();
              onSetActiveTab(activeTab === 'GOVERNMENT' ? 'NONE' : 'GOVERNMENT');
            }}
            title="Teknoloji Araştırması Başlat (Bilim Boşta!)"
            className="flex items-center justify-center gap-1 px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-amber-950/40 border border-amber-500/50 hover:border-amber-400 shrink-0 animate-pulse"
          >
            <FlaskConical className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono-num text-[10px] sm:text-[11px] font-extrabold text-amber-200 whitespace-nowrap">
              +Araştır
            </span>
          </button>
        )}

        <button
          onClick={() =>
            onSetActiveTab(activeTab === 'GOVERNMENT' ? 'NONE' : 'GOVERNMENT')
          }
          title="İmparatorluk İstikrarı"
          className="hidden md:flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl bg-[#0c1324] border border-amber-500/25 hover:border-amber-400 shrink-0"
        >
          <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-mono-num text-xs font-bold text-white whitespace-nowrap">
            %{Math.round(playerNation.stability)}
          </span>
        </button>
      </div>

      {/* Landscape / Desktop Right: AoH3 Clock & 5-Pip Speed Gauge */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <div className="text-right mr-0.5">
          <div className="font-mono-num text-[11px] sm:text-xs font-bold text-amber-400 leading-tight whitespace-nowrap flex items-center justify-end gap-1">
            <span>{dateLabel}</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40 text-[10px]">
              🕒 {hourLabel}
            </span>
          </div>
          {/* AoH3 Speed Pips */}
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <span className="text-[9px] text-slate-400 whitespace-nowrap">
              {hourlyRateLabel}
            </span>
            <div className="hidden lg:flex items-center gap-0.5 ml-1">
              {SPEED_STEPS.map((st) => {
                const active = speed >= st.level && speed > 0;
                return (
                  <button
                    key={st.level}
                    onClick={() => {
                      sound.playClick();
                      onSetSpeed(st.level);
                    }}
                    title={`Hız: ${st.label}`}
                    className={`w-3.5 h-2 rounded-xs transition-colors ${
                      active
                        ? 'bg-amber-400'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onTogglePause();
          }}
          title="Duraklat / Devam Et (Boşluk)"
          className={`min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center border transition-colors shrink-0 ${
            speed === 0
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
              : 'bg-[#0c1324] text-slate-200 border-amber-500/35 hover:bg-slate-800'
          }`}
        >
          {speed === 0 ? (
            <Play className="w-4 h-4 fill-current" />
          ) : (
            <Pause className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={cycleSpeed}
          title="Zaman Hızını Değiştir"
          className="min-w-[40px] min-h-[36px] px-2 rounded-xl bg-[#0c1324] hover:bg-slate-800 border border-amber-500/35 flex items-center justify-center gap-1 text-xs font-mono-num font-bold text-amber-400 shrink-0"
        >
          <FastForward className="w-3.5 h-3.5 shrink-0" />
          <span>{speed === 0 ? '1x' : `${speed}x`}</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            music.toggle();
          }}
          title="Ulusal Marş & Müzik Kutusu"
          className={`min-w-[34px] min-h-[36px] px-2 rounded-xl border flex items-center justify-center gap-1 text-xs font-bold transition-colors shrink-0 ${
            isMusicPlaying
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-[#0c1324] text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <span>♫</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenNewsDrawer();
          }}
          title="Canlı Dünya Haber Akışı & Divan"
          className="min-w-[36px] min-h-[36px] px-2 rounded-xl bg-[#0c1324] hover:bg-slate-800 border border-amber-500/30 flex items-center justify-center gap-1 text-xs font-semibold text-amber-300 shrink-0"
        >
          <Newspaper className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden lg:inline font-mono-num">{newsCount}</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onSetSpeed(0);
            onOpenSystemModal();
          }}
          title="Kayıt Merkezi & Yedekleme"
          className="hidden xl:flex min-w-[40px] min-h-[38px] px-2.5 rounded-xl bg-[#0c1324] hover:bg-slate-800 border border-emerald-500/35 items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 shrink-0"
        >
          <Save className="w-4 h-4 text-emerald-400" />
          <span>Kaydet</span>
        </button>
      </div>
    </header>
  );
};
