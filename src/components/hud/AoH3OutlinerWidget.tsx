import React, { useState, useMemo } from 'react';
import {
  Swords,
  Shield,
  Navigation,
  ChevronRight,
  ChevronLeft,
  Handshake,
  Crosshair,
} from 'lucide-react';
import {
  ActiveBattle,
  ActiveWar,
  ArmyMovement,
  BottomDrawerTab,
  Nation,
  Territory,
} from '../../types/game';
import { sound } from '../../utils/soundEngine';

interface AoH3OutlinerWidgetProps {
  playerNationId: string;
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  wars: ActiveWar[];
  battles?: ActiveBattle[];
  movements: ArmyMovement[];
  selectedTerritoryId: string | null;
  onSelectTerritory: (id: string) => void;
  onSetActiveTab: (tab: BottomDrawerTab) => void;
  onStartArmyOrder: (id: string) => void;
}

export const AoH3OutlinerWidget: React.FC<AoH3OutlinerWidgetProps> = ({
  playerNationId,
  nations,
  territories,
  wars,
  battles = [],
  movements,
  selectedTerritoryId,
  onSelectTerritory,
  onSetActiveTab,
  onStartArmyOrder,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const playerWars = useMemo(
    () =>
      wars.filter(
        (w) =>
          w.attackerId === playerNationId ||
          w.defenderId === playerNationId ||
          w.attackers.includes(playerNationId) ||
          w.defenders.includes(playerNationId)
      ),
    [wars, playerNationId]
  );

  const relevantBattles = useMemo(
    () =>
      battles.filter(
        (b) =>
          b.attackerId === playerNationId || b.defenderId === playerNationId
      ),
    [battles, playerNationId]
  );

  const relevantMovements = useMemo(
    () =>
      movements.filter((m) => {
        if (m.ownerId === playerNationId) return true;
        const targetOwner = territories[m.toTerritoryId]?.ownerId;
        return targetOwner === playerNationId;
      }),
    [movements, playerNationId, territories]
  );

  const topGarrisons = useMemo(
    () =>
      Object.values(territories)
        .filter((t) => t.ownerId === playerNationId && t.garrison >= 1000)
        .sort((a, b) => b.garrison - a.garrison)
        .slice(0, 5),
    [territories, playerNationId]
  );

  const totalAlerts =
    playerWars.length + relevantMovements.length + relevantBattles.length;

  return (
    <aside className="hud-outliner absolute top-14 right-2.5 z-20 flex flex-col items-end pointer-events-none">
      {/* Compact Toggle Button (AoH3 Right Outliner Tab) */}
      <button
        onClick={() => {
          sound.playClick();
          setIsOpen((prev) => !prev);
        }}
        className={`pointer-events-auto min-h-[36px] px-2.5 py-1.5 rounded-xl border shadow-xl flex items-center gap-1.5 text-xs font-bold transition-all ${
          relevantBattles.length > 0
            ? 'bg-amber-500 text-slate-950 border-amber-300'
            : playerWars.length > 0
            ? 'bg-rose-950/95 border-rose-500/70 text-rose-200 hover:bg-rose-900'
            : isOpen
            ? 'bg-amber-500 text-slate-950 border-amber-400'
            : 'bg-[#090e1a]/95 border-amber-500/40 text-amber-300 hover:border-amber-400'
        }`}
        title="Age of History 3 Sefer & Ordu Takip Çubuğu (Outliner)"
      >
        <Swords className="w-3.5 h-3.5 shrink-0" />
        <span className="whitespace-nowrap">
          {relevantBattles.length > 0
            ? `Muharebe (${relevantBattles.length})`
            : playerWars.length > 0
            ? `Savaş (${playerWars.length})`
            : 'Ordu & Cephe'}
        </span>
        {relevantMovements.length > 0 && (
          <span className="px-1.5 py-0.2 rounded bg-amber-500/25 border border-amber-400/50 text-[10px] font-mono-num text-amber-200">
            {relevantMovements.length} Sefer
          </span>
        )}
        {isOpen ? (
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
        )}
      </button>

      {/* Expanded AoH3 Outliner Panel */}
      {isOpen && (
        <div className="pointer-events-auto mt-1.5 w-64 sm:w-72 max-h-[58vh] overflow-y-auto rounded-2xl bg-[#090e1a]/96 border border-amber-500/45 shadow-2xl p-2.5 space-y-2.5 text-xs">
          {/* Section 0: Live On-Map Battles */}
          {relevantBattles.length > 0 && (
            <div>
              <div className="px-1 pb-1 border-b border-slate-800 text-[10px] font-bold text-amber-300">
                ⚔️ SÜREN HARİTA MUHAREBELERİ ({relevantBattles.length})
              </div>
              <div className="space-y-1.5 mt-1.5">
                {relevantBattles.map((btl) => {
                  const terrName =
                    territories[btl.territoryId]?.name.replace(/^★\s*/, '') ||
                    btl.territoryId;
                  const total = Math.max(
                    1,
                    btl.attackerTroops + btl.defenderTroops
                  );
                  const attPct = Math.round((btl.attackerTroops / total) * 100);
                  return (
                    <button
                      key={btl.id}
                      onClick={() => {
                        sound.playSelectTerritory();
                        onSelectTerritory(btl.territoryId);
                      }}
                      className="w-full p-2 rounded-xl bg-amber-950/50 border border-amber-500/60 text-left"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-200">
                        <span className="truncate">⚔️ {terrName}</span>
                        <span className="font-mono-num text-[10px]">
                          {(btl.attackerTroops / 1000).toFixed(1)}B vs{' '}
                          {(btl.defenderTroops / 1000).toFixed(1)}B
                        </span>
                      </div>
                      <div className="mt-1 w-full h-1.5 rounded-full bg-blue-600 overflow-hidden">
                        <div
                          className="h-full bg-rose-500"
                          style={{ width: `${attPct}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* Section 1: Active Wars */}
          <div>
            <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800 text-[10px] font-bold text-amber-400">
              <span>AKTİF SAVAŞLAR ({playerWars.length})</span>
              {totalAlerts > 0 && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onSetActiveTab('DIPLOMACY');
                  }}
                  className="text-emerald-400 hover:underline"
                >
                  Barış Masası →
                </button>
              )}
            </div>
            {playerWars.length === 0 ? (
              <div className="py-1.5 px-1 text-[11px] text-slate-400">
                Devletimiz şu an barış içinde.
              </div>
            ) : (
              <div className="space-y-1.5 mt-1.5">
                {playerWars.map((war) => {
                  const isAttacker =
                    war.attackerId === playerNationId ||
                    war.attackers.includes(playerNationId);
                  const enemyId = isAttacker ? war.defenderId : war.attackerId;
                  const enemy = nations[enemyId];
                  if (!enemy) return null;
                  const playerScore = isAttacker
                    ? war.attackerWarScore
                    : -war.attackerWarScore;
                  return (
                    <div
                      key={war.id}
                      className="p-2 rounded-xl bg-slate-950/90 border border-rose-500/40 flex items-center justify-between gap-2"
                    >
                      <button
                        onClick={() => {
                          sound.playSelectTerritory();
                          const capId = enemy.capitalTerritoryId || enemy.id;
                          if (territories[capId]) {
                            onSelectTerritory(capId);
                          }
                        }}
                        className="flex items-center gap-2 min-w-0 text-left flex-1"
                      >
                        <span
                          className="w-6 h-6 rounded-md flex items-center justify-center font-display font-bold text-[10px] text-white shrink-0"
                          style={{ backgroundColor: enemy.color }}
                        >
                          {enemy.flagCode}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate text-[11px]">
                            {enemy.name.replace(/\s*\(1440\)\s*$/, '')}
                          </div>
                          <div
                            className={`text-[10px] font-mono-num font-bold ${
                              playerScore >= 0
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
                            Skor: {playerScore >= 0 ? `+${playerScore}%` : `${playerScore}%`}
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          sound.playClick();
                          onSetActiveTab('DIPLOMACY');
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 shrink-0"
                      >
                        <Handshake className="w-3 h-3" />
                        <span>Barış</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Moving Armies */}
          {relevantMovements.length > 0 && (
            <div>
              <div className="px-1 pb-1 border-b border-slate-800 text-[10px] font-bold text-sky-400">
                HAREKET HALİNDEKİ ORDULAR ({relevantMovements.length})
              </div>
              <div className="space-y-1.5 mt-1.5">
                {relevantMovements.map((mv) => {
                  const isOwn = mv.ownerId === playerNationId;
                  const fromName =
                    territories[mv.fromTerritoryId]?.name.replace(/^★\s*/, '') ||
                    mv.fromTerritoryId;
                  const toName =
                    territories[mv.toTerritoryId]?.name.replace(/^★\s*/, '') ||
                    mv.toTerritoryId;
                  return (
                    <button
                      key={mv.id}
                      onClick={() => {
                        sound.playSelectTerritory();
                        onSelectTerritory(mv.toTerritoryId);
                      }}
                      className={`w-full p-2 rounded-xl border text-left transition-colors ${
                        isOwn
                          ? 'bg-slate-950/90 border-sky-500/40 hover:border-sky-400'
                          : 'bg-rose-950/50 border-rose-500/60 hover:border-rose-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[10px] font-bold flex items-center gap-1 truncate ${
                            isOwn ? 'text-sky-300' : 'text-rose-300'
                          }`}
                        >
                          <Navigation className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {fromName} → {toName}
                          </span>
                        </span>
                        <span className="font-mono-num text-[10px] font-bold text-amber-300 shrink-0">
                          {(mv.troops / 1000).toFixed(1)}B
                        </span>
                      </div>
                      <div className="mt-1 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${
                            isOwn ? 'bg-sky-400' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, mv.progress)}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Top Garrisons / Quick Army Jump */}
          <div>
            <div className="px-1 pb-1 border-b border-slate-800 text-[10px] font-bold text-emerald-400">
              HAZIR ORDULARIMIZ ({topGarrisons.length})
            </div>
            <div className="space-y-1 mt-1.5">
              {topGarrisons.map((terr) => {
                const isSelected = terr.id === selectedTerritoryId;
                return (
                  <div
                    key={terr.id}
                    className={`p-1.5 rounded-xl border flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60'
                        : 'bg-slate-950/80 border-slate-800/90'
                    }`}
                  >
                    <button
                      onClick={() => {
                        sound.playSelectTerritory();
                        onSelectTerritory(terr.id);
                      }}
                      className="flex items-center gap-1.5 min-w-0 text-left flex-1"
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-white truncate">
                          {terr.name.replace(/^★\s*/, '')}
                        </div>
                        <div className="text-[10px] font-mono-num text-emerald-300">
                          {(terr.garrison / 1000).toFixed(1)}B Asker
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        onSelectTerritory(terr.id);
                        onStartArmyOrder(terr.id);
                      }}
                      title="Bu Eyaletten Sefer Emri Başlat"
                      className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 shrink-0"
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>Sefer</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
