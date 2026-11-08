import React, { useState, useEffect, useRef } from 'react';
import {
  Swords,
  Shield,
  Award,
  Zap,
  Target,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Flag,
  Crosshair,
  Volume2,
  CheckCircle2,
  Skull,
} from 'lucide-react';
import { Nation, Territory } from '../types/game';
import {
  TacticalBattleState,
  TacticalFormationCard,
  TacticalFormationId,
} from '../types/tacticalBattle';
import {
  TACTICAL_FORMATION_CARDS,
  autoResolveTacticalBattle,
  resolveTacticalRound,
} from '../engine/tacticalBattleEngine';
import { COMMANDERS } from '../data/world2026Data';
import { TERRAIN_INFO } from '../engine/pashaAndFiefEngine';
import { sound } from '../utils/soundEngine';

interface TacticalBattleModalProps {
  battleState: TacticalBattleState;
  playerNationId: string;
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  onCloseAndApplyOutcome: (finalBattle: TacticalBattleState) => void;
}

export function TacticalBattleModal({
  battleState: initialBattleState,
  playerNationId,
  nations,
  territories,
  onCloseAndApplyOutcome,
}: TacticalBattleModalProps) {
  const [battle, setBattle] = useState<TacticalBattleState>(initialBattleState);
  const [selectedTactic, setSelectedTactic] = useState<TacticalFormationId>(
    initialBattleState.selectedPlayerTactic || 'HILAL_TURAN'
  );
  const [isAnimatingRound, setIsAnimatingRound] = useState<boolean>(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const isPlayerAttacker = battle.attackerNationId === playerNationId;
  const attackerNation = nations[battle.attackerNationId];
  const defenderNation = nations[battle.defenderNationId];

  // Scroll to bottom of combat log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battle.combatLog.length]);

  if (!attackerNation || !defenderNation) {
    return null;
  }

  const terrainMeta = TERRAIN_INFO[battle.terrain || 'OVA'] || TERRAIN_INFO.OVA;
  const attCmd = battle.attackerCommanderId
    ? COMMANDERS.find((c) => c.id === battle.attackerCommanderId)
    : null;
  const defCmd = battle.defenderCommanderId
    ? COMMANDERS.find((c) => c.id === battle.defenderCommanderId)
    : null;

  const handleExecuteRound = () => {
    if (battle.status === 'VICTORY' || battle.status === 'DEFEAT' || isAnimatingRound) {
      return;
    }
    sound.playWarHorn();
    setIsAnimatingRound(true);

    setTimeout(() => {
      const nextBattle = resolveTacticalRound(
        battle,
        selectedTactic,
        isPlayerAttacker,
        attackerNation,
        defenderNation
      );
      setBattle(nextBattle);
      setIsAnimatingRound(false);

      if (nextBattle.status === 'VICTORY') {
        sound.playVictory();
      } else if (nextBattle.status === 'DEFEAT') {
        sound.playDefeat();
      } else {
        sound.playMarch();
      }
    }, 450);
  };

  const handleAutoResolve = () => {
    if (battle.status === 'VICTORY' || battle.status === 'DEFEAT') return;
    sound.playWarHorn();
    const finalState = autoResolveTacticalBattle(
      battle,
      isPlayerAttacker,
      attackerNation,
      defenderNation
    );
    setBattle(finalState);
    if (finalState.status === 'VICTORY') {
      sound.playVictory();
    } else {
      sound.playDefeat();
    }
  };

  const isFinished = battle.status === 'VICTORY' || battle.status === 'DEFEAT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/92 animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base sm:text-lg text-white">
                  {battle.territoryName} Muharebesi
                </h2>
                <span
                  className="px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${terrainMeta?.color}25`,
                    color: terrainMeta?.color,
                    borderColor: `${terrainMeta?.color}50`,
                  }}
                >
                  {terrainMeta?.name}
                </span>
                <span className="text-xs text-slate-400 font-mono-num font-semibold">
                  Raund: {battle.round} / {battle.maxRounds}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isPlayerAttacker
                  ? 'Taarruz Harekâtı Yönetimi · Karargâh Emirleri'
                  : 'Savunma ve Tahkimat İdaresi · Şehir Muhafazası'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isFinished && (
              <button
                onClick={handleAutoResolve}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-300 transition-colors"
              >
                Otomatik Hesapla
              </button>
            )}
            {isFinished && (
              <button
                onClick={() => onCloseAndApplyOutcome(battle)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <span>Muharebe Raporunu Kapat</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Commander & Army Clash Bar */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 p-3 sm:p-4 bg-slate-950/50 border-b border-slate-800 shrink-0">
          {/* Attacker Box */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
              isPlayerAttacker
                ? 'bg-blue-950/30 border-blue-500/50'
                : 'bg-rose-950/20 border-rose-500/40'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm text-white shrink-0 shadow"
                style={{ backgroundColor: attackerNation?.color || '#3b82f6' }}
              >
                {attackerNation?.flagCode}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  <span>{attackerNation?.name}</span>
                  {isPlayerAttacker && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 font-semibold">
                      Ordumuz
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {attCmd ? `Paşa: ${attCmd.name}` : 'Kurmay Karargahı'}
                </div>
                <div className="text-sm font-mono-num font-bold text-amber-300">
                  {battle.attackerTroops.toLocaleString('tr-TR')} Asker
                </div>
              </div>
            </div>

            <div className="w-24 sm:w-32 shrink-0 space-y-1">
              <div className="flex justify-between text-[10.5px]">
                <span className="text-slate-400">Moral</span>
                <span className="font-mono-num font-bold text-emerald-400">
                  %{battle.attackerMorale}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${Math.max(0, battle.attackerMorale)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Defender Box */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
              !isPlayerAttacker
                ? 'bg-blue-950/30 border-blue-500/50'
                : 'bg-rose-950/20 border-rose-500/40'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm text-white shrink-0 shadow"
                style={{ backgroundColor: defenderNation?.color || '#ef4444' }}
              >
                {defenderNation?.flagCode}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  <span>{defenderNation?.name}</span>
                  {!isPlayerAttacker && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 font-semibold">
                      Ordumuz
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {defCmd ? `Paşa: ${defCmd.name}` : 'Müstahkem Garnizon'}
                </div>
                <div className="text-sm font-mono-num font-bold text-amber-300">
                  {battle.defenderTroops.toLocaleString('tr-TR')} Asker
                </div>
              </div>
            </div>

            <div className="w-24 sm:w-32 shrink-0 space-y-1">
              <div className="flex justify-between text-[10.5px]">
                <span className="text-slate-400">Moral</span>
                <span className="font-mono-num font-bold text-emerald-400">
                  %{battle.defenderMorale}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${Math.max(0, battle.defenderMorale)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Tactical Battlefield & Combat Logs */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 sm:p-4 overflow-y-auto min-h-[220px]">
          {/* 2D Battlefield Visualization */}
          <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
            {/* Visual background terrain texture simulation */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2 relative z-10">
              <div className="flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-amber-400" />
                <span>2D Taktik Harp Meydanı</span>
              </div>
              {battle.castleWallHp > 0 && (
                <span className="text-[11px] text-indigo-300 font-mono-num">
                  🏰 Kale Suru: %{battle.castleWallHp}
                </span>
              )}
            </div>

            {/* Battlefield Animated Clash Arena */}
            <div className="flex-1 flex flex-col justify-center items-center py-4 relative z-10">
              {/* Opposing armies lines */}
              <div className="w-full flex items-center justify-between px-6 sm:px-12">
                {/* Attacker Battalions */}
                <div
                  className={`flex flex-col items-center gap-1 transition-transform duration-300 ${
                    isAnimatingRound ? 'translate-x-4 scale-105' : ''
                  }`}
                >
                  <div className="px-3 py-1 rounded-lg bg-blue-600/80 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/20">
                    <Flag className="w-3.5 h-3.5" />
                    <span>Taarruz Cephesi</span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]" title="Piyade">
                      🪖
                    </span>
                    <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]" title="Zırhlı Tugay">
                      🛡️
                    </span>
                    <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]" title="SİHA Birliği">
                      ✈️
                    </span>
                  </div>
                </div>

                {/* Center Clash Icon & Animation */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full bg-slate-900 border-2 border-amber-500/60 flex items-center justify-center shadow-lg ${
                      isAnimatingRound
                        ? 'scale-125 border-rose-500 shadow-rose-500/40 animate-pulse'
                        : ''
                    }`}
                  >
                    <Swords
                      className={`w-6 h-6 ${
                        isAnimatingRound ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-amber-300 font-mono-num mt-1 font-bold">
                    {isAnimatingRound ? 'ÇARPIŞMA SÜRÜYOR...' : 'CEPHE HATTI'}
                  </span>
                </div>

                {/* Defender Battalions */}
                <div
                  className={`flex flex-col items-center gap-1 transition-transform duration-300 ${
                    isAnimatingRound ? '-translate-x-4 scale-105' : ''
                  }`}
                >
                  <div className="px-3 py-1 rounded-lg bg-rose-600/80 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/20">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Savunma Hattı</span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]" title="Müstahkem Siper">
                      🧱
                    </span>
                    <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]" title="Piyade Alayı">
                      🪖
                    </span>
                    <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]" title="Ağır Topçu">
                      🎯
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Victory / Defeat Overlay Banner */}
            {isFinished && (
              <div
                className={`p-3 rounded-xl border mt-2 flex items-center justify-between ${
                  battle.status === 'VICTORY'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-500 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {battle.status === 'VICTORY' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Skull className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide">
                      {battle.status === 'VICTORY'
                        ? 'MUZAFFERİYET! MEYDAN ZAFERİ KAZANILDI'
                        : 'TAARRUZ PÜSKÜRTÜLDÜ / BOZGUN'}
                    </div>
                    <div className="text-[11px] opacity-90">
                      {battle.outcome?.territoryConquered
                        ? `${battle.territoryName} tamamen fethedildi ve bayrağımız çekildi!`
                        : 'Kalan birlikler düzenli ricat ile mevzilerine çekildi.'}
                    </div>
                  </div>
                </div>

                {battle.outcome && (
                  <div className="text-right font-mono-num text-xs font-bold text-amber-300">
                    +{battle.outcome.earnedResearch} 🔬 Harp Bilimi · +
                    {battle.outcome.earnedInfluence} ⚜ Nüfuz
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Combat Log Terminal */}
          <div className="lg:col-span-6 bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span>Harp Günlüğü & Taktik Rapor</span>
              <span className="text-[10px] text-slate-500 font-mono-num">
                Canlı Muharebe Kaydı
              </span>
            </div>
            <div className="flex-1 max-h-[170px] overflow-y-auto space-y-1.5 font-mono text-[11px] pr-1">
              {battle.combatLog.map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    log.includes('ZAFER')
                      ? 'text-emerald-400 font-bold'
                      : log.includes('BOZGUN')
                      ? 'text-rose-400 font-bold'
                      : log.includes('RAUND')
                      ? 'text-amber-300 font-bold border-t border-slate-800/80 pt-1'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        {/* Bottom Section: Tactical Formation Card Deck & Action Button */}
        {!isFinished && (
          <div className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Bir Sonraki Raund İçin Doktrin / Taktik Seçimi</span>
              </span>
              <span className="text-[11px] text-amber-300">
                Seçili Doktrin: {TACTICAL_FORMATION_CARDS[selectedTactic]?.name}
              </span>
            </div>

            {/* Tactical Cards Carousel / Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {Object.values(TACTICAL_FORMATION_CARDS).map((card) => {
                const isSelected = selectedTactic === card.id;
                return (
                  <button
                    key={card.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedTactic(card.id);
                    }}
                    className={`p-2 sm:p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/20 scale-[1.02]'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-[11.5px] font-bold truncate">
                        {card.name}
                      </div>
                      <div className="text-[10px] font-semibold text-amber-400 mt-0.5">
                        {card.badge}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      {card.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Round Action Button */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400 hidden sm:block">
                {TACTICAL_FORMATION_CARDS[selectedTactic]?.historyNote}
              </div>
              <button
                disabled={isAnimatingRound}
                onClick={handleExecuteRound}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition-all shrink-0 disabled:opacity-50"
              >
                <Swords className="w-4 h-4" />
                <span>
                  {isAnimatingRound
                    ? 'Muharebe Hesaplanıyor...'
                    : `Taktiği Uygula & Raund ${battle.round}'i Oyna`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
