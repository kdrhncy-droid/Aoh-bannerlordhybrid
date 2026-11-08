import React, { useState } from 'react';
import {
  Hammer,
  ShieldPlus,
  UserPlus,
  MousePointerClick,
  Info,
  Layers3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MapMode } from '../../types/game';
import { sound } from '../../utils/soundEngine';
import { CULTURES, RELIGIONS } from '../../data/religionAndCultureData';

export type MapMacroMode =
  | 'NONE'
  | 'RECRUIT_INFANTRY'
  | 'BUILD_ECONOMY'
  | 'BUILD_FORT';

interface MapModePillBarProps {
  mapMode: MapMode;
  macroMode?: MapMacroMode;
  toastMessage: string | null;
  onSetMapMode: (mode: MapMode) => void;
  onSetMacroMode?: (mode: MapMacroMode) => void;
}

const MAP_MODES: ReadonlyArray<{ id: MapMode; label: string; glyph: string; tone: string }> = [
  { id: 'POLITICAL', label: 'Siyasi', glyph: '◈', tone: 'text-amber-300' },
  { id: 'RELIGION', label: 'Din', glyph: '☪', tone: 'text-emerald-300' },
  { id: 'CULTURE', label: 'Kültür', glyph: '🏹', tone: 'text-violet-300' },
  { id: 'ASSIMILATION', label: 'Asimilasyon', glyph: '✦', tone: 'text-orange-300' },
  { id: 'TERRAIN', label: 'Arazi', glyph: '⌁', tone: 'text-lime-300' },
  { id: 'DIPLOMATIC', label: 'Diplomasi', glyph: '⚖', tone: 'text-sky-300' },
  { id: 'ECONOMIC', label: 'Ekonomi', glyph: '◉', tone: 'text-yellow-300' },
  { id: 'IDEOLOGY', label: 'İdeoloji', glyph: '◆', tone: 'text-fuchsia-300' },
  { id: 'MILITARY', label: 'Askeri', glyph: '⚔', tone: 'text-rose-300' },
];

export const MapModePillBar: React.FC<MapModePillBarProps> = ({
  mapMode,
  macroMode = 'NONE',
  toastMessage,
  onSetMapMode,
  onSetMacroMode,
}) => {
  const [legendOpen, setLegendOpen] = useState(true);
  const [mapModesOpen, setMapModesOpen] = useState(false);
  const [macroOpen, setMacroOpen] = useState(false);

  const hasLegend =
    mapMode === 'RELIGION' ||
    mapMode === 'CULTURE' ||
    mapMode === 'ASSIMILATION';

  return (
    <>
      <div className="hud-mapmode-bar absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5 max-w-[calc(100vw-130px)] sm:max-w-[calc(100vw-220px)] pointer-events-none">
        {/* Row 1: AoH3 Map Lenses */}
        <div className="hud-mapmode-shell hud-surface pointer-events-auto rounded-xl border border-amber-500/35 shadow-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setMapModesOpen((open) => !open)}
            className="w-full flex items-center justify-between gap-3 px-2.5 py-1 border-b border-slate-800/90 hover:bg-slate-800/40 transition-colors"
            aria-expanded={mapModesOpen}
            aria-label="Harita katmanlarını aç veya kapat"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-300">
              <Layers3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Katmanlar</span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                  {MAP_MODES.find((m) => m.id === mapMode)?.glyph} {MAP_MODES.find((m) => m.id === mapMode)?.label}
              </span>
              {mapModesOpen ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
            </div>
          </button>
          {mapModesOpen && <div className="flex flex-nowrap items-center gap-1 p-1 overflow-x-auto no-scrollbar">
          {MAP_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                sound.playClick();
                onSetMapMode(m.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 border border-transparent ${
                mapMode === m.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm border-amber-300'
                  : `text-slate-300 hover:text-white hover:bg-slate-800/80 ${m.tone}`
              }`}
            >
              <span aria-hidden="true" className="text-sm leading-none">{m.glyph}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>}
        </div>

        {/* Row 2: AoH3 Mobile Macro-Builder & 1-Tap Map Recruitment Mode */}
        {onSetMacroMode && (
          <div className="hud-macro-bar hud-surface pointer-events-auto rounded-xl border border-slate-800/90 shadow-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setMacroOpen((open) => !open)}
              className="w-full flex items-center gap-1.5 px-2.5 py-1 border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-300 hover:bg-slate-800/40 transition-colors"
              aria-expanded={macroOpen}
              aria-label="Hızlı işlemleri aç veya kapat"
            >
              <MousePointerClick className="w-3.5 h-3.5 text-sky-300" />
              <span>Hızlı işlemler</span>
              <span className="ml-auto text-[9px] normal-case tracking-normal text-slate-500">
                {macroMode === 'NONE' ? 'Haritada eyalete dokun' : 'Aktif işlem seçildi'}
              </span>
              {macroOpen || macroMode !== 'NONE' ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
            </button>
            {(macroOpen || macroMode !== 'NONE') && <div className="flex flex-nowrap items-center gap-1 p-1 max-w-full overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                sound.playClick();
                onSetMacroMode('NONE');
              }}
              title="Normal Eyalet Seçim Modu"
              className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors ${
                macroMode === 'NONE'
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MousePointerClick className="w-3 h-3 shrink-0" />
              <span>Seçim</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onSetMacroMode(
                  macroMode === 'RECRUIT_INFANTRY' ? 'NONE' : 'RECRUIT_INFANTRY'
                );
              }}
              title="AoH3 Hızlı Askerlik: Haritada kendi eyaletinize dokunarak anında +1.000 Piyade (150 Altın) toplayın"
              className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors ${
                macroMode === 'RECRUIT_INFANTRY'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-emerald-300/90 hover:bg-emerald-500/15'
              }`}
            >
              <UserPlus className="w-3 h-3 shrink-0" />
              <span>Dokun: +1B Asker</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onSetMacroMode(
                  macroMode === 'BUILD_ECONOMY' ? 'NONE' : 'BUILD_ECONOMY'
                );
              }}
              title="AoH3 Makro İnşaat: Haritada kendi eyaletinize dokunarak anında Ekonomi/Atölye inşa edin"
              className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors ${
                macroMode === 'BUILD_ECONOMY'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-amber-300/90 hover:bg-amber-500/15'
              }`}
            >
              <Hammer className="w-3 h-3 shrink-0" />
              <span>Dokun: Ekonomi Kur</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onSetMacroMode(
                  macroMode === 'BUILD_FORT' ? 'NONE' : 'BUILD_FORT'
                );
              }}
              title="AoH3 Makro Tahkimat: Haritada kendi eyaletinize dokunarak anında Kale/Hisar yükseltin"
              className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors ${
                macroMode === 'BUILD_FORT'
                  ? 'bg-sky-500 text-slate-950 shadow'
                  : 'text-sky-300/90 hover:bg-sky-500/15'
              }`}
            >
              <ShieldPlus className="w-3 h-3 shrink-0" />
              <span>Dokun: Kale Kur</span>
            </button>
            </div>}
          </div>
        )}
      </div>

      {/* Floating AoH3 Map Legend Card for Religion / Culture / Assimilation */}
      {hasLegend && (
        <div className="absolute bottom-20 left-2.5 z-20 pointer-events-auto max-w-[260px] sm:max-w-[290px] bg-[#090e1a]/95 rounded-xl border border-amber-500/35 shadow-2xl backdrop-blur-md overflow-hidden text-slate-200">
          <button
            type="button"
            onClick={() => setLegendOpen(!legendOpen)}
            aria-expanded={legendOpen}
            aria-controls="map-mode-legend-content"
            className="w-full min-h-[44px] flex items-center justify-between px-2.5 py-1.5 bg-slate-900/80 cursor-pointer select-none border-b border-slate-800 text-left"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Info aria-hidden="true" className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {mapMode === 'RELIGION' && 'Din Haritası Lejantı'}
                {mapMode === 'CULTURE' && 'Kültür Haritası Lejantı'}
                {mapMode === 'ASSIMILATION' && 'Asimilasyon (Core) Lejantı'}
              </span>
            </div>
            <span aria-hidden="true" className="text-slate-400 hover:text-white p-0.5">
              {legendOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </span>
          </button>

          {legendOpen && (
            <div id="map-mode-legend-content" className="p-2 flex flex-col gap-1.5 max-h-[175px] sm:max-h-[210px] overflow-y-auto no-scrollbar text-[11px]">
              {mapMode === 'RELIGION' &&
                Object.values(RELIGIONS).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start gap-1.5 p-1 rounded bg-slate-800/40 border border-slate-700/40"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 shadow-sm flex items-center justify-center text-[9px] text-white font-bold"
                      style={{ backgroundColor: r.color }}
                    >
                      {r.symbol}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 truncate">
                          {r.name}
                        </span>
                        <span className="text-[9px] text-emerald-300 font-mono">
                          +{r.moralBonus}% M / +{r.stabilityBonus}% S
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 leading-tight">
                        {r.description}
                      </p>
                    </div>
                  </div>
                ))}

              {mapMode === 'CULTURE' &&
                Object.values(CULTURES).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start gap-1.5 p-1 rounded bg-slate-800/40 border border-slate-700/40"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-sm shrink-0 mt-0.5 shadow-sm"
                      style={{ backgroundColor: c.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-slate-100 block truncate">
                        {c.name}
                      </span>
                      <p className="text-[10px] text-slate-400 line-clamp-1 leading-tight">
                        {c.description}
                      </p>
                    </div>
                  </div>
                ))}

              {mapMode === 'ASSIMILATION' && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 p-1.5 rounded bg-emerald-950/40 border border-emerald-500/40">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0 shadow" />
                    <div>
                      <span className="font-bold text-emerald-300 block">
                        Öz Vatan (%100 Core)
                      </span>
                      <span className="text-[10px] text-slate-300">
                        Milli vatan toprağı. Tam vergi ve ordu toplama.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded bg-amber-950/40 border border-amber-500/40">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0 shadow animate-pulse" />
                    <div>
                      <span className="font-bold text-amber-300 block">
                        Asimilasyon Sürecinde
                      </span>
                      <span className="text-[10px] text-slate-300">
                        Gün gün idari entegrasyon devam ediyor.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded bg-red-950/40 border border-red-500/40">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-500 shrink-0 shadow" />
                    <div>
                      <span className="font-bold text-red-300 block">
                        Yabancı / Entegre Değil
                      </span>
                      <span className="text-[10px] text-slate-300">
                        Yüksek isyan riski ve düşük vergi. Eyalet panelinden
                        Asimile Et seçin.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={toastMessage
          ? 'hud-toast-banner absolute top-20 left-1/2 z-30 px-3.5 py-2 rounded-xl bg-[#090e1a]/96 border border-amber-500/60 text-xs font-semibold text-amber-200 shadow-2xl max-w-[92vw] max-h-[30vh] overflow-y-auto whitespace-normal break-words [overflow-wrap:anywhere] text-center leading-relaxed pointer-events-none'
          : 'sr-only'}
      >
        {toastMessage ?? ''}
      </div>
    </>
  );
};
