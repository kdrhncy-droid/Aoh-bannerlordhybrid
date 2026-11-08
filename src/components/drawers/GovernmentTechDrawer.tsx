import React, { useState } from "react";
import { Check, Crown, FlaskConical } from "lucide-react";
import { TechBranch } from "../../types/game";
import { CommandDrawersProps } from "./drawerTypes";
import { ArmyModernizationCard } from "./ArmyModernizationCard";
import {
  FORMABLE_EMPIRES,
  IDEOLOGIES,
  getReformsForMode,
  getTechTreeForMode,
} from "../../data/world2026Data";

const IDEOLOGY_GLYPHS: Record<string, string> = {
  DEMOCRACY: '⚖',
  AUTHORITARIAN: '◈',
  MONARCHY: '♛',
  SOCIALIST: '★',
  MILITARY_JUNTA: '⚔',
  TECHNO_CORPORATISM: '✦',
};

const REFORM_GLYPHS = ['◉', '⚔', '⚓', '⚒', '✦', '⚖'];
const TECH_BRANCH_META: Record<string, { glyph: string; color: string }> = {
  MILITARY: { glyph: '⚔', color: '#e07b7b' },
  ECONOMY: { glyph: '◉', color: '#e0ad52' },
  ADMINISTRATION: { glyph: '♜', color: '#67c99b' },
  SCIENCE: { glyph: '✦', color: '#62b7d7' },
};

export const GovernmentTechDrawer: React.FC<CommandDrawersProps> = ({
  playerNation,
  playerEconomy,
  territories,
  onChangeIdeology,
  onEnactReform,
  onFormEmpire,
  onUnlockTech,
  onStartResearch,
  onCancelResearch,
  onBoostResearch,
  onUpdateBudget,
  onModernizeNationalArmy,
  gameMode = "EMPIRES_1440",
}) => {
  const [techBranchFilter, setTechBranchFilter] = useState<TechBranch>("MILITARY");
  const activeTechTree = getTechTreeForMode(gameMode);
  const activeReforms = getReformsForMode(gameMode);

  // Active Research Project Calculations
  const activeProj = playerNation.activeResearch;
  const activeTech = activeProj
    ? activeTechTree.find((t) => t.id === activeProj.techId)
    : null;
  const activePct = activeProj
    ? Math.min(100, Math.round((activeProj.progress / activeProj.totalCost) * 100))
    : 0;
  const activeRemainingRP = activeProj
    ? Math.max(0, activeProj.totalCost - activeProj.progress)
    : 0;
  const activeEstDays = activeProj
    ? Math.max(1, Math.ceil(activeRemainingRP / Math.max(0.4, playerEconomy.dailyResearch)))
    : 0;

  const handleStartResearch = (techId: string) => {
    if (onStartResearch) {
      onStartResearch(techId);
    } else {
      onUnlockTech(techId);
    }
  };

  return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 5 Cols: Ideology & Reforms */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h3 className="text-sm font-bold text-white">
                    Devlet İdeolojisi ve Rejim Seçimi
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.values(IDEOLOGIES).map((ideo) => {
                      const isCurrent = playerNation.ideology === ideo.id;
                      return (
                        <button
                          key={ideo.id}
                          onClick={() => onChangeIdeology(ideo.id)}
                          aria-pressed={isCurrent}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                            isCurrent
                              ? 'bg-slate-900 border-2 text-white shadow-lg'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-600'
                          }`}
                          style={{ borderColor: isCurrent ? ideo.color : undefined }}
                        >
                          <span
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-display shrink-0 border border-white/15 shadow-inner"
                            style={{ backgroundColor: `${ideo.color}33`, color: ideo.color }}
                            aria-hidden="true"
                          >
                            {IDEOLOGY_GLYPHS[ideo.id] ?? '◆'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate">
                              {ideo.name}
                            </div>
                            <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                              {ideo.description}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                Vergi {ideo.taxBonus >= 0 ? `+${ideo.taxBonus}` : ideo.taxBonus}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                                Ordu {ideo.militaryAttackBonus >= 0 ? `+${ideo.militaryAttackBonus}` : ideo.militaryAttackBonus}
                              </span>
                              {isCurrent && <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-500/15 text-emerald-300">AKTİF</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* National Reforms */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h3 className="text-sm font-bold text-white">
                    Ulusal Reformlar ve Kanunlar
                  </h3>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {activeReforms.map((ref, reformIndex) => {
                      const enacted = playerNation.enactedReforms.includes(
                        ref.id
                      );
                      const canAfford =
                        !enacted &&
                        playerNation.treasury >= ref.costGold &&
                        playerNation.researchPoints >= ref.costResearch;
                      return (
                        <div
                          key={ref.id}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 flex items-center justify-center text-base shrink-0">
                              {REFORM_GLYPHS[reformIndex % REFORM_GLYPHS.length]}
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">
                                {ref.name}
                              </div>
                              <div className="text-[10px] text-emerald-400 line-clamp-1">
                                {ref.effectLabel}
                              </div>
                            </div>
                          </div>
                          <button
                            disabled={!canAfford}
                            onClick={() => onEnactReform(ref.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 ${
                              enacted
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {enacted
                              ? 'Yürürlükte'
                              : `${ref.costGold}G · ${ref.costResearch} RP`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Formable Empires (Büyük İmparatorluk İlanı) */}
                <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      Tarihi İmparatorluk İlanı (Formable Nations)
                    </h3>
                    <span className="font-mono-num text-xs text-slate-400">
                      Mevcut: {playerEconomy.territoryCount} Eyalet · {playerNation.unlockedTechs.length} Tek.
                    </span>
                  </div>
                  <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                    {FORMABLE_EMPIRES.filter(
                      (emp) =>
                        !emp.allowedNationIds ||
                        emp.allowedNationIds.includes(playerNation.id)
                    ).map((emp) => {
                      const alreadyFormed =
                        playerNation.formedEmpireId === emp.id;
                      const reqTechs = emp.requiredTechCount ?? 0;
                      const reqGold = emp.goldCost ?? 0;
                      const reqIds = emp.requiredTerritoryIds ?? [];
                      const reqNames = emp.requiredTerritoryNames ?? [];
                      const hasProvinces =
                        playerEconomy.territoryCount >= emp.requiredProvinces;
                      const hasTechs =
                        playerNation.unlockedTechs.length >= reqTechs;
                      const hasGold = playerNation.treasury >= reqGold;
                      const missingCityIndices = reqIds
                        .map((tid, idx) =>
                          territories[tid]?.ownerId === playerNation.id ? -1 : idx
                        )
                        .filter((idx) => idx >= 0);
                      const hasAllKeyCities = missingCityIndices.length === 0;

                      const canForm =
                        !alreadyFormed &&
                        hasProvinces &&
                        hasTechs &&
                        hasGold &&
                        hasAllKeyCities;

                      return (
                        <div
                          key={emp.id}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-white">
                                {emp.name}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {emp.description}
                              </p>
                              <div className="text-[11px] text-amber-400 font-semibold mt-1">
                                {emp.bonusSummary}
                              </div>
                            </div>
                            <button
                              disabled={!canForm}
                              onClick={() => onFormEmpire(emp.id)}
                              className={`px-3 py-2 rounded-lg text-xs font-bold shrink-0 ${
                                alreadyFormed
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                  : canForm
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                                  : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              {alreadyFormed
                                ? '✓ İlan Edildi'
                                : canForm
                                ? '👑 İmparatorluğu İlan Et!'
                                : 'Şartlar Eksik'}
                            </button>
                          </div>

                          {/* Visual Strategic Requirements Checklist */}
                          {!alreadyFormed && (
                            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5 text-[10px] font-mono-num">
                              <span
                                className={`px-2 py-0.5 rounded border ${
                                  hasProvinces
                                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-950 border-slate-800 text-slate-400'
                                }`}
                              >
                                {hasProvinces ? '✓' : '✗'} {playerEconomy.territoryCount}/{emp.requiredProvinces} Eyalet
                              </span>

                              {reqTechs > 0 && (
                                <span
                                  className={`px-2 py-0.5 rounded border ${
                                    hasTechs
                                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                                      : 'bg-slate-950 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  {hasTechs ? '✓' : '✗'} {playerNation.unlockedTechs.length}/{reqTechs} Teknoloji
                                </span>
                              )}

                              {reqGold > 0 && (
                                <span
                                  className={`px-2 py-0.5 rounded border ${
                                    hasGold
                                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                                      : 'bg-slate-950 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  {hasGold ? '✓' : '✗'} {reqGold} Altın
                                </span>
                              )}

                              {reqIds.map((tid, idx) => {
                                const isOwned =
                                  territories[tid]?.ownerId === playerNation.id;
                                const cityName =
                                  reqNames[idx] || territories[tid]?.name || tid;
                                return (
                                  <span
                                    key={tid}
                                    className={`px-2 py-0.5 rounded border ${
                                      isOwned
                                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                                    }`}
                                  >
                                    {isOwned ? '✓' : '✗'} ★ {cityName}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right 7 Cols: AoH3 Timed Technology & Research Center */}
              <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-4">
                {/* AoH3 Active Research Spotlight Panel */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-950/50 via-slate-900 to-indigo-950/40 border border-sky-500/40 shadow-lg space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-300">
                        <FlaskConical className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {activeTech ? (
                            <span className="text-sky-300">
                              Aktif Araştırma: {activeTech.name}
                            </span>
                          ) : (
                            <span className="text-slate-300">
                              Aktif Araştırma Projesi Yok
                            </span>
                          )}
                        </h3>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>
                            Günlük Bilim:{' '}
                            <strong className="text-sky-400">
                              +{playerEconomy.dailyResearch} Puan/Gün
                            </strong>
                          </span>
                          <span>·</span>
                          <span>
                            Birikmiş Havuz:{' '}
                            <strong className="text-amber-300">
                              {playerNation.researchPoints.toFixed(0)} Puan
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Research Budget Quick Selector (AoH3 Style) */}
                    {onUpdateBudget && (
                      <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800 text-[11px]">
                        <span className="text-slate-400 text-[10px]">
                          Araştırma Bütçesi:
                        </span>
                        {[15, 30, 50].map((bVal) => (
                          <button
                            key={bVal}
                            onClick={() => onUpdateBudget('research', bVal)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                              (playerNation.budget?.research || 15) === bVal
                                ? 'bg-sky-500 text-slate-950'
                                : 'bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            %{bVal}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {activeProj && activeTech ? (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-sky-200">
                          {activeTech.effectLabel}
                        </span>
                        <span className="font-mono-num text-amber-300">
                          ⏳ ~{activeEstDays} Gün Kaldı (%{activePct})
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-indigo-400 transition-all duration-300 rounded-full"
                          style={{ width: `${Math.max(3, activePct)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-mono-num font-extrabold text-white drop-shadow">
                          {activeProj.progress.toFixed(1)} / {activeProj.totalCost} RP
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <p className="text-[11px] text-slate-400">
                          Teknoloji tamamlandığında yeni birimler ve idari bonuslar otomatik açılır.
                        </p>
                        <div className="flex items-center gap-2">
                          {onBoostResearch && playerNation.researchPoints >= 5 && (
                            <button
                              onClick={onBoostResearch}
                              title="Birikmiş araştırma puanını bu projeye aktararak günleri kısalt"
                              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-md"
                            >
                              ⚡ Hızlandır (+Puan Harca)
                            </button>
                          )}
                          {onCancelResearch && (
                            <button
                              onClick={onCancelResearch}
                              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                            >
                              Durdur
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-dashed border-sky-500/30 text-xs text-sky-200/80 flex items-center justify-between gap-2">
                      <span>
                        Aşağıdaki teknoloji ağacından bir teknoloji seçip{' '}
                        <strong>"Araştırmaya Başla"</strong> butonuna dokunun.
                      </span>
                    </div>
                  )}
                </div>

                {/* 4 Branch Filters */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto w-full sm:w-auto">
                    {(
                      [
                        { id: 'MILITARY', label: '⚔️ Askeri' },
                        { id: 'ECONOMY', label: '💰 Ekonomi' },
                        { id: 'ADMINISTRATION', label: '🏛️ İdare' },
                        { id: 'SCIENCE', label: '🔭 Bilim' },
                      ] as const
                    ).map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setTechBranchFilter(b.id)}
                        className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex-1 sm:flex-initial ${
                          techBranchFilter === b.id
                            ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* National Army Modernization Panel synced with Military Tech Tree */}
                {techBranchFilter === 'MILITARY' && (
                  <ArmyModernizationCard
                    playerNation={playerNation}
                    totalGarrison={playerEconomy.totalGarrison}
                    gameMode={gameMode}
                    onModernizeNationalArmy={onModernizeNationalArmy}
                  />
                )}

                {/* Technologies List */}
                <div className="space-y-3">
                  {activeTechTree
                    .filter((t) => t.branch === techBranchFilter)
                    .map((tech) => {
                      const isUnlocked = playerNation.unlockedTechs.includes(
                        tech.id
                      );
                      const isActivelyResearching =
                        activeProj?.techId === tech.id;
                      const prereqMet =
                        !tech.prerequisite ||
                        playerNation.unlockedTechs.includes(tech.prerequisite);
                      const prereqDef = tech.prerequisite
                        ? activeTechTree.find((t) => t.id === tech.prerequisite)
                        : null;

                      const estDaysForThis = Math.max(
                        1,
                        Math.ceil(
                          tech.cost / Math.max(0.4, playerEconomy.dailyResearch)
                        )
                      );

                      return (
                        <div
                          key={tech.id}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isUnlocked
                              ? 'bg-sky-950/20 border-sky-500/40'
                              : isActivelyResearching
                              ? 'bg-sky-950/50 border-sky-400 ring-2 ring-sky-500/30'
                              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold border shrink-0"
                                style={{
                                  color: TECH_BRANCH_META[tech.branch]?.color || '#62b7d7',
                                  borderColor: `${TECH_BRANCH_META[tech.branch]?.color || '#62b7d7'}66`,
                                  backgroundColor: `${TECH_BRANCH_META[tech.branch]?.color || '#62b7d7'}18`,
                                }}
                              >
                                {TECH_BRANCH_META[tech.branch]?.glyph || '◆'}
                              </span>
                              <span className="font-mono-num text-[10px] text-sky-400 font-bold px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-500/30">
                                Kademe {tech.tier}
                              </span>
                              <span className="text-sm font-bold text-white">
                                {tech.name}
                              </span>
                              {isActivelyResearching && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500 text-slate-950 animate-pulse">
                                  Araştırılıyor
                                </span>
                              )}
                            </div>
                            <p className="hidden sm:block text-xs text-slate-400 mt-1 line-clamp-1">
                              {tech.description}
                            </p>
                            <div className="inline-flex max-w-full text-[10px] font-semibold text-emerald-300 mt-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 truncate">
                              {tech.effectLabel}
                            </div>

                            {isActivelyResearching && (
                              <div className="mt-2 w-full max-w-xs h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                <div
                                  className="h-full bg-sky-400 transition-all rounded-full"
                                  style={{
                                    width: `${Math.max(4, activePct)}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2">
                            <div className="font-mono-num text-[11px] text-slate-400">
                              Maliyet:{' '}
                              <strong className="text-amber-300">
                                {tech.cost} RP
                              </strong>
                              {!isUnlocked && (
                                <span className="block text-[10px] text-sky-400">
                                  Tahmini ~{estDaysForThis} Gün
                                </span>
                              )}
                            </div>

                            <button
                              disabled={
                                isUnlocked ||
                                !prereqMet ||
                                isActivelyResearching
                              }
                              onClick={() => handleStartResearch(tech.id)}
                              className={`min-h-[44px] min-w-[130px] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                                isUnlocked
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 cursor-default'
                                  : isActivelyResearching
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 cursor-default'
                                  : prereqMet
                                  ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {isUnlocked ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Araştırıldı
                                </>
                              ) : isActivelyResearching ? (
                                `%${activePct} (${activeEstDays}g)`
                              ) : !prereqMet ? (
                                `Kilitli (${
                                  prereqDef?.name || 'Önceki Kademe'
                                })`
                              ) : (
                                'Araştırmaya Başla'
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
  );
};
