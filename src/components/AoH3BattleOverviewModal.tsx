import React from 'react';
import {
  Swords,
  Shield,
  X,
  Zap,
  Target,
  Flame,
  Castle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ActiveBattle, ActiveSiege, Nation, Territory } from '../types/game';
import { NationFlagCanvasBadge } from '../map/nationFlagRenderer';
import { TERRAIN_INFO } from '../engine/pashaAndFiefEngine';
import { sound } from '../utils/soundEngine';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';

interface AoH3BattleOverviewModalProps {
  battle?: ActiveBattle | null;
  siege?: ActiveSiege | null;
  territory: Territory;
  playerNationId: string;
  nations: Record<string, Nation>;
  onClose: () => void;
  onApplyTacticalOrder?: (tactic: 'TURAN' | 'BOMBARD' | 'RETREAT') => void;
}

export const AoH3BattleOverviewModal: React.FC<AoH3BattleOverviewModalProps> = ({
  battle,
  siege,
  territory,
  playerNationId,
  nations,
  onClose,
  onApplyTacticalOrder,
}) => {
  const dialogRef = useAccessibleDialog(Boolean(battle || siege), onClose);
  if (!battle && !siege) return null;

  const attackerId = battle ? battle.attackerId : siege!.attackerId;
  const defenderId = battle ? battle.defenderId : siege!.defenderId;
  const attackerNation = nations[attackerId];
  const defenderNation = nations[defenderId];
  if (!attackerNation || !defenderNation) return null;

  const isPlayerAttacker = attackerId === playerNationId;
  const isPlayerDefender = defenderId === playerNationId;
  const isPlayerInvolved = isPlayerAttacker || isPlayerDefender;
  const canBombardSiegeWalls =
    !battle && Boolean(siege && siege.attackerId === playerNationId);
  const hasTacticalOrders = Boolean(
    (battle && isPlayerInvolved) || canBombardSiegeWalls
  );
  const turanAlreadyUsed = Boolean(
    battle && (isPlayerAttacker ? battle.attackerTuranUsed : battle.defenderTuranUsed)
  );
  const enemyTroopsForPlayer = battle
    ? isPlayerAttacker
      ? battle.defenderTroops
      : battle.attackerTroops
    : 0;
  const bombardmentBelowFloor = Boolean(battle && enemyTroopsForPlayer <= 200);

  const terrainMeta = TERRAIN_INFO[territory.terrain || 'OVA'] || TERRAIN_INFO.OVA;
  const combatWidth = battle?.combatWidth || 25000;

  const attTroops = battle ? battle.attackerTroops : siege!.attackerTroops;
  const defTroops = battle ? battle.defenderTroops : territory.garrison;
  const totalTroops = Math.max(1, attTroops + defTroops);
  const attRatio = Math.max(0.08, Math.min(0.92, attTroops / totalTroops));

  const attMorale = battle ? (battle.attackerMorale ?? 100) : 100;
  const defMorale = battle ? (battle.defenderMorale ?? 100) : 100;

  const attFront = battle
    ? (battle.attackerFrontline ?? Math.round(attTroops * 0.8))
    : Math.round(attTroops * 0.75);
  const attBack = battle
    ? (battle.attackerBackline ?? Math.round(attTroops * 0.2))
    : Math.round(attTroops * 0.25);

  const defFront = battle
    ? (battle.defenderFrontline ?? Math.round(defTroops * 0.85))
    : Math.round(defTroops * 0.85);
  const defBack = battle
    ? (battle.defenderBackline ?? Math.round(defTroops * 0.15))
    : Math.round(defTroops * 0.15);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="battle-overview-title"
        tabIndex={-1}
        className="relative w-full max-w-3xl bg-slate-950/95 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-amber-950/50 to-slate-900 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              {battle ? <Swords className="w-5 h-5 animate-pulse" /> : <Castle className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="battle-overview-title" className="text-base sm:text-lg font-bold font-serif text-amber-200 uppercase tracking-wide">
                  {battle
                    ? `${territory.name} Muharebesi (AoH3 Canlı Meydan)`
                    : `${territory.name} Kuşatması & Sur Direnişi`}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {battle ? `Tur ${battle.round || 1}` : `%${Math.round(siege?.progress || 0)} Kuşatma`}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{terrainMeta.name}</span>
                <span>•</span>
                <span>Savaş Genişliği: {(combatWidth / 1000).toFixed(0)}B Asker</span>
                <span>•</span>
                <span>Sur Sağlığı: %{territory.castleWallHp ?? 100}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Muharebe veya kuşatma özetini kapat"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tug of War Dynamic Balance Bar */}
        <div className="w-full bg-slate-900 h-2.5 relative flex overflow-hidden">
          <div
            className="h-full transition-all duration-300 bg-gradient-to-r from-red-600 to-rose-500"
            style={{ width: `${attRatio * 100}%` }}
          />
          <div
            className="h-full transition-all duration-300 bg-gradient-to-r from-sky-500 to-blue-600"
            style={{ width: `${(1 - attRatio) * 100}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-1 bg-amber-300 shadow-[0_0_8px_#FBBF24]"
            style={{ left: `${attRatio * 100}%` }}
          />
        </div>

        {/* Content Body: Two Armies Facing Each Other */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attacker Panel */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                isPlayerAttacker
                  ? 'bg-emerald-950/25 border-emerald-500/40 shadow-emerald-950/50'
                  : 'bg-red-950/25 border-red-500/40 shadow-red-950/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <NationFlagCanvasBadge
                    nationId={attackerId}
                    flagCode={attackerNation.flagCode}
                    color={attackerNation.color}
                    width={28}
                    height={19}
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      {attackerNation.name}
                      {isPlayerAttacker && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          BİZİM ORDU
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Saldıran Taraf • {battle?.attackerCommanderName || 'Hükümdar Sancağı'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold font-mono text-amber-300">
                    {(attTroops / 1000).toFixed(1)}B
                  </div>
                  <div className="text-[10px] text-slate-400">Aktif Muharip</div>
                </div>
              </div>

              {/* Morale Bar */}
              <div className="space-y-1 mb-3.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> Ordu Morali
                  </span>
                  <span className="font-bold font-mono text-amber-300">%{attMorale}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.max(5, attMorale)}%` }}
                  />
                </div>
              </div>

              {/* AoH3 Tactical Lines: Frontline & Backline */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                  <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">
                    🛡️ Ön Hat (Piyade/Süvari)
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-100">
                    {(attFront / 1000).toFixed(1)}B
                  </div>
                  <div className="text-[10px] text-slate-400">Göğüs Göğüse Çarpışma</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                  <div className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider mb-0.5">
                    🏹 Arka Hat (Topçu/Şahi)
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-100">
                    {(attBack / 1000).toFixed(1)}B
                  </div>
                  <div className="text-[10px] text-slate-400">Menzilli Bombardıman</div>
                </div>
              </div>
            </div>

            {/* Defender Panel */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                isPlayerDefender
                  ? 'bg-emerald-950/25 border-emerald-500/40 shadow-emerald-950/50'
                  : 'bg-blue-950/25 border-blue-500/40 shadow-blue-950/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <NationFlagCanvasBadge
                    nationId={defenderId}
                    flagCode={defenderNation.flagCode}
                    color={defenderNation.color}
                    width={28}
                    height={19}
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      {defenderNation.name}
                      {isPlayerDefender && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          BİZİM EYALET
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Savunan Taraf • {battle?.defenderCommanderName || 'Müstahkem Garnizon'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold font-mono text-amber-300">
                    {(defTroops / 1000).toFixed(1)}B
                  </div>
                  <div className="text-[10px] text-slate-400">Savunan Kuvvet</div>
                </div>
              </div>

              {/* Morale Bar */}
              <div className="space-y-1 mb-3.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> Savunma Azmi
                  </span>
                  <span className="font-bold font-mono text-amber-300">%{defMorale}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-sky-400 transition-all duration-300"
                    style={{ width: `${Math.max(5, defMorale)}%` }}
                  />
                </div>
              </div>

              {/* AoH3 Tactical Lines: Frontline & Backline */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                  <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">
                    🛡️ Ön Hat (Garnizon)
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-100">
                    {(defFront / 1000).toFixed(1)}B
                  </div>
                  <div className="text-[10px] text-slate-400">Siper ve Barikatlar</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                  <div className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider mb-0.5">
                    ♜ Sur & Savunma Kuleleri
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-100">
                    %{territory.castleWallHp ?? 100}
                  </div>
                  <div className="text-[10px] text-slate-400">Fortress Savunması</div>
                </div>
              </div>
            </div>
          </div>

          {/* Siege Status Banner if territory has active siege */}
          {siege && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Castle className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-amber-200">
                    Kuşatma Çemberi: %{Math.round(siege.progress)} Tamamlandı
                  </div>
                  <div className="text-xs text-slate-300">
                    Surlar zayıflıyor. Kuşatma %100'e ulaştığında kale teslim olacak ve eyalet işgal edilecek.
                  </div>
                </div>
              </div>
              <div className="w-24 text-right">
                <span className="text-xs font-mono font-bold text-amber-300">
                  {(siege.attackerTroops / 1000).toFixed(1)}B Kuşatmacı
                </span>
              </div>
            </div>
          )}

          {/* Tactical Command Action Buttons (Available for Player) */}
          {hasTacticalOrders && onApplyTacticalOrder && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-300 font-medium">
                Komutan Müdahalesi:
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {battle && (
                  <>
                    <button
                      disabled={turanAlreadyUsed}
                      onClick={() => {
                        sound.playWarHorn();
                        onApplyTacticalOrder('TURAN');
                      }}
                      className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      {turanAlreadyUsed
                        ? 'Hilal & Turan (Kullanıldı)'
                        : 'Hilal & Turan Taktiği (+%18 güç)'}
                    </button>
                  </>
                )}
                {(battle || canBombardSiegeWalls) && (
                  <button
                    onClick={() => {
                      sound.playWarHorn();
                      onApplyTacticalOrder('BOMBARD');
                    }}
                    disabled={
                      bombardmentBelowFloor ||
                      (!battle &&
                        (territory.castleWallHp ?? siege?.wallIntegrity ?? 100) <= 0)
                    }
                    title={
                      bombardmentBelowFloor
                        ? 'Hedef kuvvet 200 askerin altında; ilave kayıp oluşturulamaz.'
                        : battle
                        ? 'Düşman askerlerine topçu ateşi uygular; surlara hasar vermez.'
                        : 'Kuşatma surlarının dayanıklılığını azaltır.'
                    }
                    className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed border border-sky-500/40 text-sky-300 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Target className="w-3.5 h-3.5" />
                    {battle
                      ? bombardmentBelowFloor
                        ? 'Bombardıman eşiği (200)'
                        : 'Düşman Kuvvetlerini Bombala'
                      : 'Surları Bombala (−20)'}
                  </button>
                )}
                {battle && (
                  <button
                    onClick={() => {
                      sound.playMarch();
                      onApplyTacticalOrder('RETREAT');
                    }}
                    className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    Düzenli Geri Çekil
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900/80 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Haritaya Dön
          </button>
        </div>
      </div>
    </div>
  );
};
