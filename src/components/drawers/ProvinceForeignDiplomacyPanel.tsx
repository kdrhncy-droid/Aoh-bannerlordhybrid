import React from "react";
import { Swords, Handshake, Crown, Ban, AlertTriangle, Coins, Shield, ArrowRight } from "lucide-react";
import { ActiveWar, DiplomaticRelation, Nation, Territory } from "../../types/game";
import { DiplomaticActionType, PeaceDealType } from "./drawerTypes";
import { getOrCreateRelation, isAtWar } from "../../engine/simulationEngine";
import { sound } from "../../utils/soundEngine";

interface ProvinceForeignDiplomacyPanelProps {
  playerNation: Nation;
  selectedTerritory: Territory;
  selectedOwner: Nation;
  territories: Record<string, Territory>;
  nations: Record<string, Nation>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  gameMode: string;
  onDiplomaticAction: (targetNationId: string, action: DiplomaticActionType) => void;
  onPeaceDeal: (warId: string, dealType: PeaceDealType) => void;
  onSelectTerritory: (territoryId: string) => void;
  onSiegeBombardment: (territoryId: string, method: "ARTILLERY" | "DRONE_RAID") => void;
  onClose: () => void;
}

export const ProvinceForeignDiplomacyPanel: React.FC<ProvinceForeignDiplomacyPanelProps> = ({
  playerNation,
  selectedTerritory,
  selectedOwner,
  territories,
  nations,
  relations,
  wars,
  gameMode,
  onDiplomaticAction,
  onPeaceDeal,
  onSelectTerritory,
  onSiegeBombardment,
  onClose,
}) => {
  return (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-4">
                    {(() => {
                      const rel = getOrCreateRelation(
                        relations,
                        playerNation.id,
                        selectedOwner.id
                      );
                      const activeWar = isAtWar(
                        wars,
                        playerNation.id,
                        selectedOwner.id
                      );

                      return (
                        <>
                          {/* Bannerlord Castle Siege Bombardment Panel when at War! */}
                          {activeWar && (
                            <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3.5 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-rose-200">
                                  ♜ {selectedTerritory.name} Kalesi Kuşatma Harekatı
                                </span>
                                <span className="font-mono-num text-xs font-bold text-amber-300">
                                  Sur Dayanıklılığı: %
                                  {selectedTerritory.castleWallHp ?? 100}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300">
                                {gameMode === 'EMPIRES_1440'
                                  ? 'Ordularınız hücuma geçmeden önce kuşatma bataryaları veya lağımcı ocaklarıyla kale surlarını yıkabilirsiniz.'
                                  : 'Ordularınız hücuma geçmeden önce topçu bataryaları veya taarruz filolarıyla kale surlarını yıkabilirsiniz.'}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <button
                                  onClick={() =>
                                    onSiegeBombardment(
                                      selectedTerritory.id,
                                      'ARTILLERY'
                                    )
                                  }
                                  className="min-h-[42px] px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-left transition-colors"
                                >
                                  <div className="text-xs font-bold text-amber-200">
                                    {gameMode === 'EMPIRES_1440'
                                      ? 'Darbzen Topçu Ateşi'
                                      : 'Topçu Bombardımanı'}
                                  </div>
                                  <div className="font-mono-num text-[10px] text-amber-400">
                                    180 Altın · Sur -%35 & Garnizon -%10
                                  </div>
                                </button>
                                <button
                                  onClick={() =>
                                    onSiegeBombardment(
                                      selectedTerritory.id,
                                      'DRONE_RAID'
                                    )
                                  }
                                  className="min-h-[42px] px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/50 text-left transition-colors"
                                >
                                  <div className="text-xs font-bold text-sky-200">
                                    {gameMode === 'EMPIRES_1440'
                                      ? 'Şahi Topu & Lağımcı Hücumu'
                                      : 'SİHA & Nokta Kuşatma Baskını'}
                                  </div>
                                  <div className="font-mono-num text-[10px] text-sky-400">
                                    220 Altın · 20 ⚜ Nüfuz · Sur -%45 & Garnizon -%18
                                  </div>
                                </button>
                              </div>
                            </div>
                          )}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                            <div>
                              <h3 className="text-base font-bold text-white">
                                {selectedOwner.name} İle Diplomatik İlişkiler
                              </h3>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                <span>
                                  İlişki Puanı:{' '}
                                  <strong
                                    className={`font-mono-num ${
                                      rel.score >= 25
                                        ? 'text-emerald-400'
                                        : rel.score <= -25
                                        ? 'text-rose-400'
                                        : 'text-amber-400'
                                    }`}
                                  >
                                    {rel.score > 0
                                      ? `+${rel.score}`
                                      : rel.score}
                                  </strong>
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>
                                  Hazine:{' '}
                                  {selectedOwner.treasury.toLocaleString(
                                    'tr-TR'
                                  )}{' '}
                                  Altın
                                </span>
                              </div>
                            </div>

                            {activeWar ? (
                              <span className="text-xs font-bold text-rose-400">
                                SAVAŞ DURUMUNDA (Skor: %
                                {activeWar.attackerWarScore})
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">
                                {rel.allianceType === 'OFFENSIVE'
                                  ? '⚔️ Saldırı Paktı Müttefiki'
                                  : rel.allianceType === 'DEFENSIVE'
                                  ? '🛡️ Savunma Paktı Ortağı'
                                  : rel.isAllied
                                  ? 'Resmi Müttefik'
                                  : rel.hasTradeAgreement
                                  ? 'Ticaret Ortağı'
                                  : rel.hasEmbargo
                                  ? 'Ambargo Altında'
                                  : 'Tarafsız İlişki'}
                              </span>
                            )}
                          </div>

                          {/* Diplomatic Action Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button
                              onClick={() =>
                                onDiplomaticAction(selectedOwner.id, 'IMPROVE')
                              }
                              className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between transition-colors"
                            >
                              <div>
                                <div className="text-xs font-bold text-white">
                                  Diplomatik Heyet Gönder
                                </div>
                                <div className="text-[11px] text-emerald-400">
                                  +20 İlişki Puanı (150 Altın)
                                </div>
                              </div>
                              <Handshake className="w-4 h-4 text-emerald-400 shrink-0" />
                            </button>

                            <button
                              onClick={() =>
                                onDiplomaticAction(selectedOwner.id, 'INSULT')
                              }
                              className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between transition-colors"
                            >
                              <div>
                                <div className="text-xs font-bold text-white">
                                  Diplomatik Nota & Kınama
                                </div>
                                <div className="text-[11px] text-rose-400">
                                  -25 İlişki · Savaş Gerekçesi Hazırlar
                                </div>
                              </div>
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                            </button>

                            <button
                              onClick={() =>
                                onDiplomaticAction(selectedOwner.id, 'TRADE')
                              }
                              className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between transition-colors"
                            >
                              <div>
                                <div className="text-xs font-bold text-white">
                                  {rel.hasTradeAgreement
                                    ? 'Ticaret Anlaşması Aktif'
                                    : 'Ticaret Anlaşması Teklif Et'}
                                </div>
                                <div className="text-[11px] text-amber-400">
                                  +%14 Karşılıklı Ticaret Geliri
                                </div>
                              </div>
                              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                            </button>

                            <button
                              onClick={() =>
                                onDiplomaticAction(
                                  selectedOwner.id,
                                  'NON_AGGRESSION'
                                )
                              }
                              className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between transition-colors"
                            >
                              <div>
                                <div className="text-xs font-bold text-white">
                                  {rel.hasNonAggression
                                    ? 'Saldırmazlık Paktı Aktif'
                                    : 'Saldırmazlık Paktı İmzala'}
                                </div>
                                <div className="text-[11px] text-teal-400">
                                  Karşılıklı sınır güvenliği garantisi
                                </div>
                              </div>
                              <Shield className="w-4 h-4 text-teal-400 shrink-0" />
                            </button>

                            <button
                              onClick={() =>
                                onDiplomaticAction(
                                  selectedOwner.id,
                                  'MILITARY_ACCESS'
                                )
                              }
                              className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between transition-colors"
                            >
                              <div>
                                <div className="text-xs font-bold text-white">
                                  {rel.hasMilitaryAccess
                                    ? 'Askeri Geçiş İzni Aktif'
                                    : 'Askeri Geçiş İzni İste'}
                                </div>
                                <div className="text-[11px] text-indigo-400">
                                  +10 İlişki & Lojistik Koridor
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0" />
                            </button>

                            {/* 1. Savunma Paktı (Defensive Pact) */}
                            <button
                              onClick={() =>
                                onDiplomaticAction(selectedOwner.id, 'DEFENSIVE_PACT')
                              }
                              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                                rel.allianceType === 'DEFENSIVE'
                                  ? 'bg-sky-950/70 border-sky-400 text-sky-100 shadow-lg shadow-sky-500/20'
                                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                              }`}
                            >
                              <div>
                                <div className="text-xs font-bold flex items-center gap-1.5">
                                  <span>
                                    {rel.allianceType === 'DEFENSIVE'
                                      ? '🛡️ Savunma Paktı Aktif'
                                      : '🛡️ Savunma Paktı Teklifi'}
                                  </span>
                                  {rel.allianceType === 'DEFENSIVE' && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/30 text-sky-200 font-semibold">
                                      Aktif
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-sky-400">
                                  {rel.allianceType === 'DEFENSIVE'
                                    ? 'Sadece saldırıya uğrandığında savunulur (Feshetmek için tıkla)'
                                    : 'Sadece saldırıya uğrandığında tetiklenir (+25 İlişki)'}
                                </div>
                              </div>
                              <Shield
                                className={`w-4 h-4 shrink-0 ${
                                  rel.allianceType === 'DEFENSIVE'
                                    ? 'text-sky-300 animate-pulse'
                                    : 'text-sky-400'
                                }`}
                              />
                            </button>

                            {/* 2. Saldırı Paktı & Askeri Koalisyon (Offensive Pact) */}
                            <button
                              onClick={() =>
                                onDiplomaticAction(selectedOwner.id, 'OFFENSIVE_PACT')
                              }
                              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                                rel.allianceType === 'OFFENSIVE'
                                  ? 'bg-emerald-950/70 border-emerald-400 text-emerald-100 shadow-lg shadow-emerald-500/20'
                                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                              }`}
                            >
                              <div>
                                <div className="text-xs font-bold flex items-center gap-1.5">
                                  <span>
                                    {rel.allianceType === 'OFFENSIVE'
                                      ? '⚔️ Saldırı Paktı Aktif'
                                      : '⚔️ Saldırı Paktı & Koalisyon'}
                                  </span>
                                  {rel.allianceType === 'OFFENSIVE' && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200 font-semibold">
                                      Aktif
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-emerald-400">
                                  {rel.allianceType === 'OFFENSIVE'
                                    ? 'Ortak taarruz & savunma yürürlükte (Feshetmek için tıkla)'
                                    : 'Ortak hedefe savaşta birlikte taarruz edilir (+45 İlişki)'}
                                </div>
                              </div>
                              <Swords
                                className={`w-4 h-4 shrink-0 ${
                                  rel.allianceType === 'OFFENSIVE'
                                    ? 'text-emerald-300 animate-pulse'
                                    : 'text-emerald-400'
                                }`}
                              />
                            </button>

                            <button
                              onClick={() =>
                                onDiplomaticAction(selectedOwner.id, 'EMBARGO')
                              }
                              className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between transition-colors"
                            >
                              <div>
                                <div className="text-xs font-bold text-white">
                                  {rel.hasEmbargo
                                    ? 'Ambargoyu Kaldır'
                                    : 'Ticaret Ambargosu Uygula'}
                                </div>
                                <div className="text-[11px] text-orange-400">
                                  Hedefin ticaret gelirini %18 düşürür
                                </div>
                              </div>
                              <Ban className="w-4 h-4 text-orange-400 shrink-0" />
                            </button>

                            {selectedOwner.vassalOf === playerNation.id ? (
                              <button
                                onClick={() =>
                                  onDiplomaticAction(
                                    selectedOwner.id,
                                    'ANNEX_VASSAL'
                                  )
                                }
                                className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-left flex items-center justify-between transition-colors"
                              >
                                <div>
                                  <div className="text-xs font-bold text-amber-200">
                                    Vasal Devleti Tamamen İlhak Et
                                  </div>
                                  <div className="text-[11px] text-amber-400">
                                    600 Altın · Tüm eyaletler doğrudan bağlanır
                                  </div>
                                </div>
                                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  onDiplomaticAction(
                                    selectedOwner.id,
                                    'ULTIMATUM_VASSAL'
                                  )
                                }
                                className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-left flex items-center justify-between transition-colors"
                              >
                                <div>
                                  <div className="text-xs font-bold text-purple-200">
                                    Vasallık Ültimatomu Gönder
                                  </div>
                                  <div className="text-[11px] text-purple-300">
                                    Ordunuz 1.8 kat güçlü ise boyun eğer
                                  </div>
                                </div>
                                <Crown className="w-4 h-4 text-purple-400 shrink-0" />
                              </button>
                            )}

                            {/* Coalition Tactical Intel Before Declaring War */}
                            {!activeWar && (() => {
                              const targetDefenders = Object.values(relations)
                                .filter(
                                  (r) =>
                                    (r.nationA === selectedOwner.id ||
                                      r.nationB === selectedOwner.id) &&
                                    (r.allianceType === 'DEFENSIVE' ||
                                      r.allianceType === 'OFFENSIVE' ||
                                      (r.isAllied && !r.allianceType))
                                )
                                .map((r) =>
                                  r.nationA === selectedOwner.id
                                    ? r.nationB
                                    : r.nationA
                                )
                                .filter(
                                  (id) =>
                                    id !== playerNation.id &&
                                    id !== selectedOwner.id &&
                                    nations[id] &&
                                    !nations[id].isEliminated
                                );

                              const playerAttackers = Object.values(relations)
                                .filter(
                                  (r) =>
                                    (r.nationA === playerNation.id ||
                                      r.nationB === playerNation.id) &&
                                    r.allianceType === 'OFFENSIVE'
                                )
                                .map((r) =>
                                  r.nationA === playerNation.id
                                    ? r.nationB
                                    : r.nationA
                                )
                                .filter(
                                  (id) =>
                                    id !== selectedOwner.id &&
                                    nations[id] &&
                                    !nations[id].isEliminated
                                );

                              if (
                                targetDefenders.length === 0 &&
                                playerAttackers.length === 0
                              ) {
                                return null;
                              }

                              return (
                                <div className="col-span-1 sm:col-span-2 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] space-y-1.5">
                                  {playerAttackers.length > 0 && (
                                    <div className="text-emerald-300 flex items-center gap-1.5">
                                      <Swords className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                                      <span>
                                        <strong>Saldırı Paktı Ortaklarınız:</strong>{' '}
                                        {playerAttackers
                                          .map((id) => nations[id]?.name)
                                          .join(', ')}{' '}
                                        (Sizinle taarruza katılacak)
                                      </span>
                                    </div>
                                  )}
                                  {targetDefenders.length > 0 && (
                                    <div className="text-amber-300 flex items-center gap-1.5">
                                      <Shield className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                                      <span>
                                        <strong>Hedefin Savunma Paktı:</strong>{' '}
                                        {targetDefenders
                                          .map((id) => nations[id]?.name)
                                          .join(', ')}{' '}
                                        (Saldırı anında savunmaya katılacak!)
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {!activeWar ? (
                              <>
                                <button
                                  onClick={() =>
                                    onDiplomaticAction(
                                      selectedOwner.id,
                                      'DECLARE_WAR'
                                    )
                                  }
                                  className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-left flex items-center justify-between transition-colors shadow-lg shadow-rose-600/20"
                                >
                                  <div>
                                    <div className="text-xs font-bold">
                                      ⚔️ Resmi Savaş İlan Et
                                    </div>
                                    <div className="text-[11px] text-rose-100">
                                      Sınır eyaletlerine askeri sefer ve kuşatma başlat
                                    </div>
                                  </div>
                                  <Swords className="w-4 h-4 text-white shrink-0" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() =>
                                  onPeaceDeal(activeWar.id, 'ANNEX_OCCUPIED')
                                }
                                className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-left flex items-center justify-between transition-colors"
                              >
                                <div>
                                  <div className="text-xs font-bold">
                                    İşgal Edilen Bölgeleri İlhak Et & Barış
                                  </div>
                                  <div className="text-[11px] text-slate-800">
                                    Savaşı lehinize sonlandırın
                                  </div>
                                </div>
                                <Handshake className="w-4 h-4 text-slate-950 shrink-0" />
                              </button>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
  );
};
