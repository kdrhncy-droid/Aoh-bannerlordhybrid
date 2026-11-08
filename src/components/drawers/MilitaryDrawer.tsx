import React, { useState } from "react";
import { Award, Swords, Crown, TrendingUp } from "lucide-react";
import { CommandDrawersProps } from "./drawerTypes";
import { ArmyModernizationCard } from "./ArmyModernizationCard";
import {
  IDEOLOGIES,
  getArmyGenerationInfo,
  getCommandersForMode,
  getNationModernizedTier,
} from "../../data/world2026Data";
import {
  BESTOW_FAVOR_GOLD_COST,
  getLordArchetype,
  getLordLoyaltySummary,
  getLordRetinueTroops,
} from "../../engine/pashaAndFiefEngine";
import {
  CommanderPortraitSvg,
  UnitTypeIllustrationSvg,
} from "../illustrations/AoH3Illustrations";

export const MilitaryDrawer: React.FC<CommandDrawersProps> = ({
  playerNation,
  playerEconomy,
  territories,
  nations,
  onRecruitUnit,
  onRecruitOrAssignGeneral,
  onBestowFavorOnLord,
  onToggleCallLordToBanner,
  onModernizeNationalArmy,
  onSelectTerritory,
  gameMode = "EMPIRES_1440",
}) => {
  const [rankingSortBy, setRankingSortBy] = useState<"SCORE" | "GDP" | "ARMY" | "PROVINCES">("SCORE");
  const eraCommanders = getCommandersForMode(gameMode);
  const modernizedTier = getNationModernizedTier(playerNation);
  const activeArmyGen = getArmyGenerationInfo(gameMode, modernizedTier);

  return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 6 Cols: Army Modernization, Generals & National Unit Composition */}
              <div className="lg:col-span-6 space-y-4">
                <ArmyModernizationCard
                  playerNation={playerNation}
                  totalGarrison={playerEconomy.totalGarrison}
                  gameMode={gameMode}
                  onModernizeNationalArmy={onModernizeNationalArmy}
                />

                {/* AoH3 Visual National Army Composition Strip */}
                <div className="grid grid-cols-3 gap-2.5 bg-slate-950/90 border border-slate-800 rounded-2xl p-3">
                  <div className="flex items-center gap-2 bg-slate-900/90 border border-emerald-500/30 rounded-xl p-2">
                    <UnitTypeIllustrationSvg
                      unitType="infantry"
                      modeId={gameMode}
                      className="w-9 h-9 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 truncate">
                        {activeArmyGen.infantryShort}
                      </div>
                      <div className="font-mono-num text-xs font-bold text-emerald-300">
                        {(playerEconomy.totalUnits.infantry / 1000).toFixed(1)}B
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 rounded-xl p-2">
                    <UnitTypeIllustrationSvg
                      unitType="armor"
                      modeId={gameMode}
                      className="w-9 h-9 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 truncate">
                        {activeArmyGen.armorShort}
                      </div>
                      <div className="font-mono-num text-xs font-bold text-amber-300">
                        {(playerEconomy.totalUnits.armor / 1000).toFixed(1)}B
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/90 border border-sky-500/30 rounded-xl p-2">
                    <UnitTypeIllustrationSvg
                      unitType="airDrone"
                      modeId={gameMode}
                      className="w-9 h-9 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 truncate">
                        {activeArmyGen.airArtilleryShort}
                      </div>
                      <div className="font-mono-num text-xs font-bold text-sky-300">
                        {(playerEconomy.totalUnits.airDrone / 1000).toFixed(1)}B
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generals / Bannerlord Clan Lords & Sancak Ordusu */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      {gameMode === 'EMPIRES_1440'
                        ? 'Paşalar, Sancak Beyleri ve Sefer Çağrısı'
                        : 'Klan Lordları, Komutanlar ve Sancak Çağrısı'}
                    </h3>
                    <div className="flex items-center gap-2 font-mono-num text-xs">
                      <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold">
                        ⚜ {playerNation.clanInfluence ?? 120} Nüfuz
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                        {activeArmyGen.generationLabel}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Nüfuz (⚜) harcayarak Lordları <strong>Sancağa Çağırın</strong>; kuşatma ve taarruz seferlerinize kendi şahsi muhafız ordularıyla katılırlar!
                  </p>

                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                    {eraCommanders.map((cmd) => {
                      const isRecruited =
                        playerNation.recruitedGeneralIds?.includes(cmd.id);
                      const isActive = playerNation.activeGeneralId === cmd.id;
                      const isCalledToBanner =
                        playerNation.bannerCalledLordIds?.includes(cmd.id);
                      const canAfford = playerNation.treasury >= cmd.costGold;
                      const loyaltyInfo = isRecruited
                        ? getLordLoyaltySummary(playerNation, cmd.id, territories)
                        : null;
                      const fiefCount = loyaltyInfo
                        ? loyaltyInfo.fiefCount
                        : Object.values(territories).filter(
                            (t) =>
                              t.ownerId === playerNation.id &&
                              t.fiefLordId === cmd.id
                          ).length;
                      const retinueSize = getLordRetinueTroops(
                        cmd.id,
                        territories
                      );
                      const canBestow =
                        isRecruited &&
                        Boolean(onBestowFavorOnLord) &&
                        playerNation.treasury >= BESTOW_FAVOR_GOLD_COST &&
                        (loyaltyInfo?.loyalty ?? 100) < 100;

                      return (
                        <div
                          key={cmd.id}
                          className={`p-3 rounded-xl border flex flex-col gap-2.5 ${
                            loyaltyInfo && loyaltyInfo.tone === 'ROSE'
                              ? 'bg-rose-950/35 border-rose-500/70'
                              : isActive
                              ? 'bg-amber-500/15 border-amber-500'
                              : isCalledToBanner
                              ? 'bg-purple-950/30 border-purple-500/50'
                              : 'bg-slate-900 border-slate-800'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <CommanderPortraitSvg
                                specialty={
                                  cmd.attackBonus >= cmd.defenseBonus
                                    ? 'OFFENSE'
                                    : 'DEFENSE'
                                }
                                loyalty={loyaltyInfo?.loyalty ?? 85}
                                className="w-10 h-10 shrink-0"
                              />
                              <div>
                                <div className="text-xs font-bold text-white flex flex-wrap items-center gap-1.5">
                                  <span>{cmd.name}</span>
                                  {fiefCount > 0 && (
                                    <span className="text-[10px] font-semibold text-purple-300">
                                      ({fiefCount} Tımar)
                                    </span>
                                  )}
                                  {loyaltyInfo && (
                                    <span
                                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono-num font-bold ${
                                        loyaltyInfo.tone === 'ROSE'
                                          ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50'
                                          : loyaltyInfo.tone === 'AMBER'
                                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                          : loyaltyInfo.tone === 'SKY'
                                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      }`}
                                    >
                                      ♥ %{loyaltyInfo.loyalty} {loyaltyInfo.statusLabel}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {cmd.title} · Şahsi Sancak Birliği:{' '}
                                  <strong className="font-mono-num text-amber-300">
                                    +{(retinueSize / 1000).toFixed(1)}B Asker
                                  </strong>
                                </div>
                                <div className="font-mono-num text-[11px] text-emerald-400 mt-0.5">
                                  Taarruz +%{cmd.attackBonus} · Savunma +%
                                  {cmd.defenseBonus} · Kayıp -%{cmd.casualtyReduction}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                              {isRecruited && onBestowFavorOnLord && (
                                <button
                                  onClick={() => onBestowFavorOnLord(cmd.id)}
                                  disabled={!canBestow}
                                  title={`Paşaya Hil'at & İhsan takdim et (${BESTOW_FAVOR_GOLD_COST} Altın -> +18 Sadakat)`}
                                  className={`px-2.5 py-1.5 min-h-[36px] rounded-lg text-[11px] font-bold transition-colors ${
                                    canBestow
                                      ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40'
                                      : 'bg-slate-800/70 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                                  }`}
                                >
                                  🎁 İhsan ({BESTOW_FAVOR_GOLD_COST}A)
                                </button>
                              )}
                              {isRecruited && (
                                <button
                                  onClick={() => onToggleCallLordToBanner(cmd.id)}
                                  className={`px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs font-bold transition-colors ${
                                    isCalledToBanner
                                      ? 'bg-purple-600 text-white border border-purple-400'
                                      : 'bg-purple-950/60 hover:bg-purple-900/70 text-purple-200 border border-purple-500/40'
                                  }`}
                                >
                                  {isCalledToBanner
                                    ? '⚜ Sancakta'
                                    : 'Sancağa Çağır (35 ⚜)'}
                                </button>
                              )}
                              <button
                                onClick={() => onRecruitOrAssignGeneral(cmd.id)}
                                disabled={!isRecruited && !canAfford}
                                className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold shrink-0 transition-colors ${
                                  isActive
                                    ? 'bg-amber-500 text-slate-950'
                                    : isRecruited
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                                    : canAfford
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                {isActive
                                  ? 'Başkomutan'
                                  : isRecruited
                                  ? 'Serdar Ata'
                                  : `Atama (${cmd.costGold} Altın)`}
                              </button>
                            </div>
                          </div>

                          {/* Loyalty Progress Bar & Warning Reason */}
                          {loyaltyInfo && (
                            <div className="space-y-1">
                              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    loyaltyInfo.tone === 'ROSE'
                                      ? 'bg-rose-500'
                                      : loyaltyInfo.tone === 'AMBER'
                                      ? 'bg-amber-400'
                                      : loyaltyInfo.tone === 'SKY'
                                      ? 'bg-sky-400'
                                      : 'bg-emerald-400'
                                  }`}
                                  style={{ width: `${loyaltyInfo.loyalty}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>
                                  {loyaltyInfo.warningReason
                                    ? `⚠️ ${loyaltyInfo.warningReason}`
                                    : '✓ Tımar idaresinden hoşnut (%25 altında isyan riski doğar)'}
                                </span>
                                <span className="font-mono-num">
                                  Haftalık: {loyaltyInfo.weeklyDrift >= 0 ? `+${loyaltyInfo.weeklyDrift}` : loyaltyInfo.weeklyDrift}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Owned Territories & Garrisons */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">
                      Eyalet Garnizonları ({playerEconomy.territoryCount} Bölge)
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono-num">
                      {activeArmyGen.infantryShort}: {(playerEconomy.totalUnits.infantry / 1000).toFixed(0)}B ·{' '}
                      {activeArmyGen.armorShort}: {(playerEconomy.totalUnits.armor / 1000).toFixed(0)}B ·{' '}
                      {activeArmyGen.airArtilleryShort}: {(playerEconomy.totalUnits.airDrone / 1000).toFixed(0)}B
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {Object.values(territories)
                      .filter((t) => t.ownerId === playerNation.id)
                      .map((t) => (
                        <div
                          key={t.id}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-xs font-bold text-white">
                              {t.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Garnizon:{' '}
                              <strong className="font-mono-num text-rose-400">
                                {t.garrison.toLocaleString('tr-TR')}
                              </strong>{' '}
                              · {activeArmyGen.armorShort}: {((t.units?.armor || 0) / 1000).toFixed(1)}B
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                onRecruitUnit(t.id, 'infantry', 5000, 250)
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold"
                            >
                              +5B {activeArmyGen.infantryShort}
                            </button>
                            <button
                              onClick={() => onSelectTerritory(t.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                            >
                              Yönet
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Right 6 Cols: Filterable Global Superpower Leaderboard */}
              <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                {(() => {
                  const rankedList = Object.values(nations)
                    .filter((n) => !n.isEliminated)
                    .map((n) => {
                      const owned = Object.values(territories).filter(
                        (t) => t.ownerId === n.id
                      );
                      const army = owned.reduce((s, t) => s + t.garrison, 0);
                      const gdp = owned.reduce(
                        (s, t) =>
                          s + t.baseGdp * (1 + t.buildings.factory * 0.25),
                        0
                      );
                      const score = Math.round(
                        gdp * 2 + army / 250 + n.unlockedTechs.length * 80
                      );
                      return {
                        nation: n,
                        ownedCount: owned.length,
                        army,
                        gdp,
                        score,
                      };
                    })
                    .sort((a, b) => {
                      if (rankingSortBy === 'GDP') return b.gdp - a.gdp;
                      if (rankingSortBy === 'ARMY') return b.army - a.army;
                      if (rankingSortBy === 'PROVINCES')
                        return b.ownedCount - a.ownedCount || b.score - a.score;
                      return b.score - a.score;
                    });

                  const playerRankIndex = rankedList.findIndex(
                    (r) => r.nation.id === playerNation.id
                  );

                  return (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-amber-400" />
                          2026 Küresel Süper Güç Sıralaması
                        </h3>
                        {playerRankIndex >= 0 && (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 font-mono-num text-xs font-bold text-amber-300">
                            Dünya Sıranız: #{playerRankIndex + 1}
                          </span>
                        )}
                      </div>

                      {/* 4-Way Sort Filter */}
                      <div className="grid grid-cols-4 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                        {(
                          [
                            { id: 'SCORE', label: 'Toplam Güç' },
                            { id: 'GDP', label: 'Ekonomi' },
                            { id: 'ARMY', label: 'Ordu' },
                            { id: 'PROVINCES', label: 'Toprak' },
                          ] as const
                        ).map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setRankingSortBy(tab.id)}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors ${
                              rankingSortBy === tab.id
                                ? 'bg-amber-500 text-slate-950'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                        {rankedList.slice(0, 35).map((entry, idx) => (
                          <button
                            key={entry.nation.id}
                            onClick={() =>
                              onSelectTerritory(entry.nation.capitalTerritoryId)
                            }
                            className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-colors ${
                              entry.nation.id === playerNation.id
                                ? 'bg-amber-500/15 border-amber-500/60'
                                : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-mono-num text-xs font-bold text-slate-400 w-6 shrink-0">
                                #{idx + 1}
                              </span>
                              <span
                                className="w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-[11px] text-white shrink-0"
                                style={{ backgroundColor: entry.nation.color }}
                              >
                                {entry.nation.flagCode}
                              </span>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">
                                  {entry.nation.name}
                                  {entry.nation.vassalOf && (
                                    <span className="ml-1.5 text-[10px] text-purple-400 font-normal">
                                      (Vasal)
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {entry.ownedCount} Eyalet ·{' '}
                                  {(entry.army / 1000).toFixed(0)}B Ordu
                                </div>
                              </div>
                            </div>

                            <div className="text-right font-mono-num shrink-0">
                              <div className="text-xs font-bold text-amber-400">
                                {entry.score} Puan
                              </div>
                              <div className="text-[10px] text-emerald-400">
                                {Math.round(entry.gdp)} GSYİH
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
  );
};
