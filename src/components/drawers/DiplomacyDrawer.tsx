import React, { useState } from "react";
import { Crown, Handshake, Swords, Shield, AlertTriangle } from "lucide-react";
import { CommandDrawersProps } from "./drawerTypes";
import { IDEOLOGIES } from "../../data/world2026Data";
import { getOrCreateRelation, isAtWar } from "../../engine/simulationEngine";
import {
  getNationNotableLords,
  getNationRulerName,
} from "../../engine/pashaAndFiefEngine";

export const DiplomacyDrawer: React.FC<CommandDrawersProps> = ({
  onClose,
  playerNation,
  territories,
  nations,
  relations,
  wars,
  movements,
  onDiplomaticAction,
  onPeaceDeal,
  onSelectTerritory,
  gameMode = "EMPIRES_1440",
}) => {
  const [diploFilter, setDiploFilter] = useState<"ALL" | "WARS" | "NEIGHBORS">("ALL");
  const [diploViewMode, setDiploViewMode] = useState<"REALMS_CONCISE" | "DIPLOMACY_DETAILED">("REALMS_CONCISE");

  return (
            <div className="space-y-4">
              {/* Top View Toggle: Concise Realm Intelligence (Android First) vs Detailed Diplomatic Treaties */}
              <div className="flex items-center gap-2 p-1 bg-slate-950/90 rounded-xl border border-slate-800">
                <button
                  onClick={() => setDiploViewMode('REALMS_CONCISE')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[44px] ${
                    diploViewMode === 'REALMS_CONCISE'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  <span>👑 Krallıklar & Hükümdarlar (Sade Özet)</span>
                </button>
                <button
                  onClick={() => setDiploViewMode('DIPLOMACY_DETAILED')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[44px] ${
                    diploViewMode === 'DIPLOMACY_DETAILED'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Handshake className="w-4 h-4" />
                  <span>📜 Diplomasi & Pakt Masası</span>
                </button>
              </div>

              {/* SADE VE ÖZ KRALLIKLAR VE HÜKÜMDARLAR EKRANI (Android Mobile Ergonomisi) */}
              {diploViewMode === 'REALMS_CONCISE' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950/70 border border-amber-500/30 rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
                    <span className="text-base shrink-0">🏰</span>
                    <p className="leading-relaxed">
                      {gameMode === 'EMPIRES_1440' ? (
                        <>
                          <strong>Divan-ı Hümayun & Hanedanlar:</strong> Her devlet kendi hükümdarı, serdarları ve sancakbeyleri tarafından yönetilir; paktlar, savaşlar ve iç isyanlar dünya dengesini belirler.
                        </>
                      ) : (
                        <>
                          <strong>Küresel Liderler & Kurmay Heyetleri:</strong> Her devlet kendi lideri, kurmay generalleri ve eyalet valileri tarafından yönetilir; ittifak blokları, ekonomik yaptırımlar ve koalisyon savaşları küresel dengeyi belirler.
                        </>
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                    {/* First show player's realm at the very top, then other nations */}
                    {[playerNation, ...Object.values(nations).filter((n) => n.id !== playerNation.id && !n.isEliminated)].map((realm) => {
                      const isPlayer = realm.id === playerNation.id;
                      const rulerTitle = getNationRulerName(realm.id, gameMode);
                      const ownedProvs = Object.values(territories).filter((t) => t.ownerId === realm.id);
                      const totalGarrison = ownedProvs.reduce((sum, t) => sum + (t.garrison || 0), 0);
                      const marchingTroops = movements
                        .filter((mv) => mv.ownerId === realm.id)
                        .reduce((sum, mv) => sum + mv.troops, 0);
                      const totalArmy = totalGarrison + marchingTroops;
                      const notableLords = getNationNotableLords(realm, ownedProvs, gameMode);

                      const rel = isPlayer ? null : getOrCreateRelation(relations, playerNation.id, realm.id);
                      const war = isPlayer ? null : isAtWar(wars, playerNation.id, realm.id);

                      return (
                        <div
                          key={realm.id}
                          className={`relative overflow-hidden rounded-2xl p-4 space-y-3 border transition-all ${
                            isPlayer
                              ? 'bg-amber-950/20 border-amber-500/60 shadow-lg ring-1 ring-amber-500/30'
                              : war
                              ? 'bg-rose-950/25 border-rose-500/50 shadow-md'
                              : rel?.allianceType
                              ? 'bg-emerald-950/20 border-emerald-500/50'
                              : 'bg-slate-950/85 border-slate-800'
                          }`}
                          style={{
                            borderColor: isPlayer
                              ? `${realm.color}aa`
                              : war
                              ? 'rgba(224, 123, 123, 0.55)'
                              : rel?.allianceType
                              ? 'rgba(103, 201, 155, 0.5)'
                              : undefined,
                          }}
                        >
                          <span
                            className="absolute inset-y-0 left-0 w-1"
                            style={{ backgroundColor: realm.color }}
                            aria-hidden="true"
                          />
                          {/* Card Header: Flag, Name & Ruler */}
                          <div className="flex items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm text-white shrink-0 shadow-md"
                                style={{ backgroundColor: realm.color }}
                              >
                                {realm.flagCode}
                              </span>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                                  <span>{realm.name}</span>
                                  {isPlayer && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-black">
                                      DEVLETİNİZ
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs font-semibold text-amber-300 truncate">
                                  👑 {rulerTitle}
                                </div>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div>
                              {isPlayer ? (
                                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                                  Hükümdarsınız
                                </span>
                              ) : war ? (
                                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/20 border border-rose-500/50 text-rose-300 animate-pulse">
                                  ⚔️ Savaşta (%{war.attackerWarScore})
                                </span>
                              ) : rel?.allianceType === 'OFFENSIVE' ? (
                                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/20 border border-emerald-500/50 text-emerald-300">
                                  ⚔️ Saldırı Paktı
                                </span>
                              ) : rel?.allianceType === 'DEFENSIVE' ? (
                                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-500/20 border border-sky-500/50 text-sky-300">
                                  🛡️ Savunma Paktı
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-900 border border-slate-700 text-slate-300">
                                  🕊️ Barış ({rel?.score && rel.score > 0 ? `+${rel.score}` : rel?.score || 0})
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 3 Clear, Big Stat Metrics */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800">
                              <div className="text-[10px] text-slate-400 font-medium">Toplam Ordu</div>
                              <div className="text-xs sm:text-sm font-bold text-amber-300 font-mono-num">
                                {(totalArmy / 1000).toFixed(1)}B
                              </div>
                            </div>
                            <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800">
                              <div className="text-[10px] text-slate-400 font-medium">Eyalet/Sancak</div>
                              <div className="text-xs sm:text-sm font-bold text-white font-mono-num">
                                {ownedProvs.length}
                              </div>
                            </div>
                            <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800">
                              <div className="text-[10px] text-slate-400 font-medium">Paşa & Bey</div>
                              <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono-num">
                                {notableLords.length}
                              </div>
                            </div>
                          </div>

                          {/* Notable Pashas & Commanders List */}
                          <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80 space-y-1.5">
                            <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Swords className="w-3.5 h-3.5 text-amber-400" />
                                <span>Divan Paşaları & Komutanlar:</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono-num">
                                {notableLords.length} İsim
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                              {notableLords.length > 0 ? (
                                notableLords.map((lordName) => (
                                  <span
                                    key={lordName}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 border border-slate-700 text-slate-200"
                                  >
                                    ⚜ {lordName}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-500 italic">
                                  Merkez garnizon idaresi.
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Concise Action Buttons (Thumb-friendly >=44px) */}
                          <div className="flex items-center gap-2 pt-1">
                            {!isPlayer && (
                              <>
                                {war ? (
                                  <button
                                    onClick={() => setDiploViewMode('DIPLOMACY_DETAILED')}
                                    className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                                  >
                                    <span>🕊️ Barış Masasına Git</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => onDiplomaticAction(realm.id, 'DECLARE_WAR')}
                                    className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                                  >
                                    <span>⚔️ Savaş İlan Et</span>
                                  </button>
                                )}

                                <button
                                  onClick={() =>
                                    onDiplomaticAction(
                                      realm.id,
                                      rel?.allianceType === 'OFFENSIVE'
                                        ? 'OFFENSIVE_PACT'
                                        : 'DEFENSIVE_PACT'
                                    )
                                  }
                                  className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold transition-transform active:scale-95 flex items-center justify-center gap-1"
                                >
                                  <span>{rel?.allianceType ? '🤝 Paktı Gör' : '🛡️ Pakt Öner'}</span>
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => {
                                const capId = realm.capitalTerritoryId || ownedProvs[0]?.id;
                                if (capId) {
                                  onSelectTerritory(capId);
                                  onClose();
                                }
                              }}
                              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700 shrink-0 transition-transform active:scale-95 flex items-center gap-1"
                              title="Haritada Odaklan"
                            >
                              <span>📍 Harita</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DETAYLI ANTLAŞMA VE SAVAŞ MASASI */}
              {diploViewMode === 'DIPLOMACY_DETAILED' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-500/30 bg-sky-950/25 px-3 py-2.5 text-xs">
                    <span className="text-sky-200 font-semibold">
                      Diplomasi Puanı: <strong className="font-mono-num text-white">{(playerNation.diplomacyPoints ?? 100).toFixed(0)} / 100</strong>
                    </span>
                    <span className="text-slate-400">Günlük +1 · Savaş ilanı: ilişki ≤ -30 · maliyet: 10 DP</span>
                  </div>
                  {/* Active Wars & Peace Table */}
                  {wars.length > 0 && (
                <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-4 space-y-3">
                  <h3 className="text-sm font-bold text-rose-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Aktif Savaşlar ve Barış Antlaşması Masası
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {wars.map((w) => {
                      const att = nations[w.attackerId];
                      const def = nations[w.defenderId];
                      const isPlayerInvolved =
                        w.attackers.includes(playerNation.id) ||
                        w.defenders.includes(playerNation.id);
                      const isPlayerAttackerSide = w.attackers.includes(
                        playerNation.id
                      );
                      const playerWarScore = isPlayerAttackerSide
                        ? w.attackerWarScore
                        : -w.attackerWarScore;
                      return (
                        <div
                          key={w.id}
                          className="bg-slate-950/90 border border-rose-500/30 rounded-xl p-3.5 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">
                              {att?.name} vs {def?.name}
                            </span>
                            <span
                              className={`font-mono-num text-xs font-bold ${
                                playerWarScore >= 20
                                  ? 'text-emerald-400'
                                  : playerWarScore <= -20
                                  ? 'text-rose-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              Savaş Skoru: {playerWarScore > 0 ? `+${playerWarScore}` : playerWarScore}%
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Kayıplar: Saldırgan{' '}
                            {(w.casualtiesAttacker / 1000).toFixed(1)}B ·
                            Savunan {(w.casualtiesDefender / 1000).toFixed(1)}B
                          </div>
                          {isPlayerInvolved && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              <button
                                onClick={() =>
                                  onPeaceDeal(w.id, 'ANNEX_OCCUPIED')
                                }
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                                title="En az 1 işgal edilen eyalet veya +%25 Savaş Skoru gerekir"
                              >
                                Toprak İlhak Et (≥%25 / İşgal)
                              </button>
                              <button
                                onClick={() => onPeaceDeal(w.id, 'VASSALIZE')}
                                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                                title="En az +%50 Savaş Skoru gerekir"
                              >
                                Vasallaştır (≥%50 Skor)
                              </button>
                              <button
                                onClick={() => onPeaceDeal(w.id, 'REPARATIONS')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                                title="En az +%20 Savaş Skoru gerekir"
                              >
                                Savaş Tazminatı (≥%20 Skor)
                              </button>
                              <button
                                onClick={() => onPeaceDeal(w.id, 'WHITE_PEACE')}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                              >
                                Beyaz Barış
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filter & Aggressive Expansion Warning */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(['ALL', 'NEIGHBORS', 'WARS'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setDiploFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        diploFilter === f
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-950 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {f === 'ALL'
                        ? 'Büyük Güçler & Ülkeler'
                        : f === 'NEIGHBORS'
                        ? 'Sınır Komşularımız'
                        : 'Gerginlik & Ambargolar'}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-300">
                  Agresif Genişleme (Koalisyon Tehlikesi):{' '}
                  <strong
                    className={`font-mono-num ${
                      playerNation.aggressiveExpansion >= 50
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    %{playerNation.aggressiveExpansion.toFixed(0)} / 100
                  </strong>
                </div>
              </div>

              {/* Diplomatic Roster Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {(() => {
                  const neighborNationIds = new Set<string>();
                  Object.values(territories).forEach((t) => {
                    if (t && t.ownerId === playerNation.id) {
                      t.neighbors.forEach((nbId) => {
                        const nbOwner = territories[nbId]?.ownerId;
                        if (nbOwner && nbOwner !== playerNation.id) {
                          neighborNationIds.add(nbOwner);
                        }
                      });
                    }
                  });

                  return Object.values(nations)
                    .filter((n) => n.id !== playerNation.id && !n.isEliminated)
                    .filter((n) => {
                      if (diploFilter === 'NEIGHBORS') {
                        return neighborNationIds.has(n.id);
                      }
                      if (diploFilter === 'WARS') {
                        const rel = getOrCreateRelation(
                          relations,
                          playerNation.id,
                          n.id
                        );
                        return (
                          Boolean(isAtWar(wars, playerNation.id, n.id)) ||
                          rel.hasEmbargo ||
                          rel.score < -15
                        );
                      }
                      return true;
                    })
                    .slice(0, 36);
                })().map((other) => {
                    const rel = getOrCreateRelation(
                      relations,
                      playerNation.id,
                      other.id
                    );
                    const war = isAtWar(wars, playerNation.id, other.id);

                    return (
                      <div
                        key={other.id}
                        className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-xs text-white shrink-0"
                            style={{ backgroundColor: other.color }}
                          >
                            {other.flagCode}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">
                              {other.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              İlişki:{' '}
                              <span
                                className={`font-mono-num font-semibold ${
                                  rel.score >= 20
                                    ? 'text-emerald-400'
                                    : rel.score <= -20
                                    ? 'text-rose-400'
                                    : 'text-slate-300'
                                }`}
                              >
                                {rel.score > 0 ? `+${rel.score}` : rel.score}
                              </span>{' '}
                              · {IDEOLOGIES[other.ideology].name}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() =>
                              onDiplomaticAction(other.id, 'IMPROVE')
                            }
                            title="İlişki Geliştir"
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-emerald-400"
                          >
                            +İlişki
                          </button>
                          <button
                            onClick={() =>
                              onDiplomaticAction(
                                other.id,
                                rel.allianceType === 'OFFENSIVE'
                                  ? 'OFFENSIVE_PACT'
                                  : rel.allianceType === 'DEFENSIVE'
                                  ? 'DEFENSIVE_PACT'
                                  : 'DEFENSIVE_PACT'
                              )
                            }
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 ${
                              rel.allianceType === 'OFFENSIVE'
                                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                                : rel.allianceType === 'DEFENSIVE'
                                ? 'bg-sky-600/30 border-sky-500 text-sky-200'
                                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                            }`}
                          >
                            {rel.allianceType === 'OFFENSIVE'
                              ? '⚔️ Saldırı'
                              : rel.allianceType === 'DEFENSIVE'
                              ? '🛡️ Savunma'
                              : '+Pakt'}
                          </button>
                          {!war && (
                            <button
                              onClick={() =>
                                onDiplomaticAction(other.id, 'DECLARE_WAR')
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-[11px] font-bold text-rose-300 hover:text-white transition-colors"
                            >
                              Savaş
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
  );
};
