import React, { useState } from "react";
import {
  Shield,
  Coins,
  Hammer,
  Swords,
  Handshake,
  AlertTriangle,
  ArrowRight,
  Crown,
  Ban,
  Check,
} from "lucide-react";
import { CommandDrawersProps } from "./drawerTypes";
import { ProvinceForeignDiplomacyPanel } from "./ProvinceForeignDiplomacyPanel";
import {
  BUILDINGS,
  COMMANDERS,
  IDEOLOGIES,
  RESOURCE_INFO,
  calculateArmyModernizationCost,
  getArmyGenerationInfo,
  getNationModernizedTier,
  getNationUnlockedMilTier,
} from "../../data/world2026Data";
import {
  CULTURES,
  RELIGIONS,
  resolveTerritoryCulture,
  resolveTerritoryReligion,
} from "../../data/religionAndCultureData";
import { getOrCreateRelation, isAtWar } from "../../engine/simulationEngine";
import { computeVisibleTerritoryIds } from "../../engine/fogOfWarEngine";
import {
  BESTOW_FAVOR_GOLD_COST,
  calculateAdministrativeStrain,
  getLordArchetype,
  getLordLoyaltySummary,
  getLordRetinueTroops,
  TERRAIN_INFO,
} from "../../engine/pashaAndFiefEngine";
import {
  getProvinceCorridorNames,
  getProvinceStraitBadge,
} from "../../engine/straitsAndTradeEngine";
import { sound } from "../../utils/soundEngine";
import {
  BuildingIllustrationSvg,
  CommanderPortraitSvg,
  TerrainPanoramaSvg,
  UnitTypeIllustrationSvg,
} from "../illustrations/AoH3Illustrations";

export const ProvinceDrawer: React.FC<CommandDrawersProps> = ({
  onClose,
  playerNation,
  playerEconomy,
  selectedTerritory,
  territories,
  nations,
  relations,
  wars,
  moveRatio,
  onSetMoveRatio,
  onStartArmyOrderMode,
  onExecuteArmyMove,
  onRecruitUnit,
  onUpgradeBuilding,
  onAssimilateTerritory,
  onStartMissionary,
  onDiplomaticAction,
  onPeaceDeal,
  onSelectTerritory,
  onModernizeNationalArmy,
  onAssignFiefLord,
  onBestowFavorOnLord,
  onSiegeBombardment,
  gameMode = "EMPIRES_1440",
  fogOfWarEnabled = true,
}) => {
  const [provinceSubTab, setProvinceSubTab] = useState<"ARMY" | "ECONOMY" | "FIEF">("ARMY");

  if (!selectedTerritory) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/70 rounded-2xl border border-slate-800">
        Harita üzerinden incelemek veya yönetmek istediğiniz eyalete dokunun.
      </div>
    );
  }

  const selectedOwner = nations[selectedTerritory.ownerId];
  if (!selectedOwner) return null;

  const unlockedMilTier = getNationUnlockedMilTier(playerNation);
  const modernizedTier = getNationModernizedTier(playerNation);
  const activeArmyGen = getArmyGenerationInfo(gameMode, modernizedTier);
  const hasPendingArmyUpgrade = unlockedMilTier > modernizedTier;
  const modernizationCost = calculateArmyModernizationCost(
    playerNation,
    playerEconomy.totalGarrison
  );
  const visibleTerritoryIds = computeVisibleTerritoryIds(
    territories,
    nations,
    relations,
    [],
    [],
    playerNation.id
  );
  const isSelectedPlayerOwned = selectedTerritory.ownerId === playerNation.id;
  const hasSelectedIntel = !fogOfWarEnabled || visibleTerritoryIds.has(selectedTerritory.id);

  const provRel = resolveTerritoryReligion(selectedTerritory, selectedOwner);
  const provCul = resolveTerritoryCulture(selectedTerritory, selectedOwner);
  const relDef = RELIGIONS[provRel];
  const culDef = CULTURES[provCul];
  const playerStateRel = playerNation.stateReligion || 'ISLAM_SUNNI';
  const isDifferentReligion = provRel !== playerStateRel;

  return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 5 Cols: Territory & Army Command */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden space-y-3">
                  {/* AoH3-Style Illustrated Terrain Panorama Header */}
                  <div className="relative h-24 w-full overflow-hidden border-b border-slate-800">
                    <TerrainPanoramaSvg
                      terrain={selectedTerritory.terrain || "OVA"}
                      fortLevel={selectedTerritory.buildings.fortress}
                      isCapital={selectedTerritory.isCapital}
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent p-3 flex items-end justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-xs text-white shadow-lg border border-white/20"
                          style={{ backgroundColor: selectedOwner.color }}
                        >
                          {selectedOwner.flagCode}
                        </span>
                        <div>
                          <div className="text-sm sm:text-base font-bold text-white drop-shadow">
                            {selectedTerritory.isCapital ? '★ ' : ''}
                            {selectedTerritory.name.replace(/^★\s*/, '')}
                          </div>
                          <div className="text-[11px] text-amber-200/95 flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span>
                              {selectedOwner.name} ·{' '}
                              {IDEOLOGIES[selectedOwner.ideology]?.name ?? 'Monarşi'}
                            </span>
                            <span className="text-slate-500">·</span>
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white shadow-sm flex items-center gap-1"
                              style={{ backgroundColor: `${relDef?.color || '#059669'}dd` }}
                              title={`${relDef?.name}: ${relDef?.description}`}
                            >
                              <span>{relDef?.symbol}</span>
                              <span>{relDef?.name}</span>
                            </span>
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white shadow-sm"
                              style={{ backgroundColor: `${culDef?.color || '#DC2626'}dd` }}
                              title={`${culDef?.name}: ${culDef?.description}`}
                            >
                              🏹 {culDef?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${
                          isSelectedPlayerOwned
                            ? 'bg-emerald-950/90 border-emerald-400/60 text-emerald-300'
                            : isAtWar(wars, playerNation.id, selectedOwner.id)
                            ? 'bg-rose-950/90 border-rose-400/60 text-rose-200'
                            : 'bg-slate-900/90 border-slate-700 text-slate-300'
                        }`}
                      >
                        {isSelectedPlayerOwned
                          ? '🛡 SİZİN EYALETİNİZ'
                          : isAtWar(wars, playerNation.id, selectedOwner.id)
                          ? '⚔️ DÜŞMAN TOPRAĞI'
                          : '🏳 YABANCI EYALET'}
                      </span>
                    </div>
                  </div>

                  <div className="px-4 pb-4 space-y-3">
                  {/* Territory Metrics & Unit Composition (Respects Fog of War) */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5">
                      <div className="text-[11px] text-slate-400">
                        {isSelectedPlayerOwned ? 'Sizin Garnizonunuz' : 'Bölge Garnizonu'}
                      </div>
                      <div
                        className={`font-mono-num text-sm font-bold mt-0.5 ${
                          isSelectedPlayerOwned ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {hasSelectedIntel
                          ? `${selectedTerritory.garrison.toLocaleString('tr-TR')} Asker`
                          : '? (Savaş Sisi)'}
                      </div>
                    </div>
                    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5">
                      <div className="text-[11px] text-slate-400">
                        Stratejik Kaynak
                      </div>
                      <div className="text-xs font-bold text-amber-400 mt-0.5 truncate">
                        {RESOURCE_INFO[selectedTerritory.resource]?.name ?? selectedTerritory.resource}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Unit Breakdown Bar */}
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    {hasSelectedIntel ? (
                      <>
                        <div>
                          <span className="text-slate-400">{activeArmyGen.infantryShort}: </span>
                          <strong className="font-mono-num text-slate-200">
                            {((selectedTerritory.units?.infantry || 0) / 1000).toFixed(1)}B
                          </strong>
                        </div>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <div>
                          <span className="text-slate-400">{activeArmyGen.armorShort}: </span>
                          <strong className="font-mono-num text-amber-400">
                            {((selectedTerritory.units?.armor || 0) / 1000).toFixed(1)}B
                          </strong>
                        </div>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <div>
                          <span className="text-slate-400">{activeArmyGen.airArtilleryShort}: </span>
                          <strong className="font-mono-num text-sky-400">
                            {((selectedTerritory.units?.airDrone || 0) / 1000).toFixed(1)}B
                          </strong>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-400 text-[11px]">
                        İstihbarat Yok: Sınır komşusu olmayan yabancı eyaletlerin birlik dağılımı gizlidir.
                      </div>
                    )}
                  </div>

                  {/* Terrain & Castle Wall Integrity Bar (AoH3 + Bannerlord Siege Info) */}
                  {(() => {
                    const tMeta =
                      TERRAIN_INFO[selectedTerritory.terrain || 'OVA'];
                    const wallHp = selectedTerritory.castleWallHp ?? 100;
                    const fiefLord = selectedTerritory.fiefLordId
                      ? COMMANDERS.find(
                          (c) => c.id === selectedTerritory.fiefLordId
                        )
                      : null;
                    return (
                      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-slate-400">Arazi: </span>
                            <strong
                              style={{ color: tMeta.color }}
                              className="font-semibold"
                            >
                              {tMeta.name}
                            </strong>
                          </div>
                          <div className="font-mono-num text-amber-300">
                            ♜ Kale Suru: %{wallHp}
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                          <span>{tMeta.summary}</span>
                          {fiefLord && (
                            <span className="text-purple-300 font-semibold">
                              ⚜ Tımar: {fiefLord.name}
                            </span>
                          )}
                        </div>
                        {(() => {
                          const stBadge = getProvinceStraitBadge(
                            selectedTerritory.id,
                            territories,
                            wars
                          );
                          const corridors = getProvinceCorridorNames(
                            selectedTerritory.id,
                            gameMode
                          );
                          if (!stBadge && corridors.length === 0) return null;
                          return (
                            <div className="pt-1.5 border-t border-slate-800/80 space-y-1 text-[11px]">
                              {stBadge && (
                                <div className="flex items-center justify-between text-amber-300 font-semibold">
                                  <span>⚓ {stBadge.straitName}</span>
                                  <span className="font-mono-num">
                                    +{stBadge.dailyTollShare}G/gün Gümrük
                                  </span>
                                </div>
                              )}
                              {corridors.length > 0 && (
                                <div className="text-sky-300 truncate">
                                  {corridors[0]}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}

                  {/* Province Core & Unrest Status Bar */}
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Statü: </span>
                      <strong
                        className={
                          selectedTerritory.coreOwnerId === selectedTerritory.ownerId
                            ? 'text-emerald-400'
                            : 'text-orange-400'
                        }
                      >
                        {selectedTerritory.isCapital ? '★ Başkent · ' : ''}
                        {selectedTerritory.coreOwnerId === selectedTerritory.ownerId
                          ? 'Öz Vatan Toprağı (Core)'
                          : 'Yeni Fethedilen Bölge (Asimilasyon Gerekli)'}
                      </strong>
                    </div>
                    <div className="font-mono-num text-slate-300">
                      Huzursuzluk: %{selectedTerritory.unrest}
                    </div>
                  </div>

                  {/* Compact Mobile 3-Tab Switcher (AoH3-style contextual sections) */}
                  {isSelectedPlayerOwned && (
                    <div
                      role="tablist"
                      aria-label="Eyalet yönetim bölümleri"
                      className="sticky top-0 z-10 grid grid-cols-3 gap-1.5 bg-slate-950/95 backdrop-blur-md p-1 rounded-xl border border-slate-800 lg:hidden"
                    >
                      <button
                        role="tab"
                        aria-selected={provinceSubTab === 'ARMY'}
                        onClick={() => setProvinceSubTab('ARMY')}
                        className={`min-h-[48px] rounded-lg text-xs font-bold transition-colors flex flex-col items-center justify-center gap-0.5 ${
                          provinceSubTab === 'ARMY'
                            ? 'bg-amber-500 text-slate-950'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <span className="text-sm leading-none">⚔️</span>
                        <span>Ordu</span>
                        <span className="text-[9px] font-medium opacity-70">Sefer & birlik</span>
                      </button>
                      <button
                        role="tab"
                        aria-selected={provinceSubTab === 'ECONOMY'}
                        onClick={() => setProvinceSubTab('ECONOMY')}
                        className={`min-h-[48px] rounded-lg text-xs font-bold transition-colors flex flex-col items-center justify-center gap-0.5 ${
                          provinceSubTab === 'ECONOMY'
                            ? 'bg-amber-500 text-slate-950'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <span className="text-sm leading-none">🏛️</span>
                        <span>Ekonomi</span>
                        <span className="text-[9px] font-medium opacity-70">Bina & gelir</span>
                      </button>
                      <button
                        role="tab"
                        aria-selected={provinceSubTab === 'FIEF'}
                        onClick={() => setProvinceSubTab('FIEF')}
                        className={`min-h-[48px] rounded-lg text-xs font-bold transition-colors flex flex-col items-center justify-center gap-0.5 ${
                          provinceSubTab === 'FIEF'
                            ? 'bg-purple-500 text-white'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <span className="text-sm leading-none">⚜️</span>
                        <span>Yönetim</span>
                        <span className="text-[9px] font-medium opacity-70">Tımar & vali</span>
                      </button>
                    </div>
                  )}

                  {/* Assimilate Non-Core Province Card (AoH3 Style) */}
                  {isSelectedPlayerOwned &&
                    (selectedTerritory.coreOwnerId !== playerNation.id ||
                      selectedTerritory.isAssimilating ||
                      selectedTerritory.unrest > 10) && (
                      <div
                        className={
                          provinceSubTab === 'ECONOMY'
                            ? 'block'
                            : 'hidden lg:block'
                        }
                      >
                        {selectedTerritory.isAssimilating ? (
                          <div className="w-full p-3 rounded-xl bg-orange-950/40 border border-orange-500/50 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-orange-200">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                                Asimilasyon & Core Entegrasyonu Devam Ediyor
                              </span>
                              <span className="font-mono-num text-amber-300">
                                %{Math.round(selectedTerritory.assimilation ?? 30)} (
                                {Math.max(
                                  1,
                                  Math.ceil(
                                    (100 - (selectedTerritory.assimilation ?? 30)) /
                                      1.25
                                  )
                                )}{' '}
                                Gün Kaldı)
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.max(
                                    5,
                                    selectedTerritory.assimilation ?? 30
                                  )}%`,
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Günlük +%1.25 entegrasyon ilerlemesi sağlanıyor. %100 olunca eyalet Öz Vatan olacak ve isyan riski sıfırlanacak.
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              onAssimilateTerritory(selectedTerritory.id)
                            }
                            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-200 text-xs font-bold flex items-center justify-between transition-colors shadow-sm"
                          >
                            <span className="text-left">
                              {selectedTerritory.coreOwnerId !== playerNation.id
                                ? '🤝 Eyaleti Asimile Et (Öz Vatan / Core Yap)'
                                : '🛡️ Bölgesel Asayiş ve Entegrasyon Paketi'}
                            </span>
                            <span className="font-mono-num text-orange-300 shrink-0 ml-2">
                              180 Altın · ~60 Gün
                            </span>
                          </button>
                        )}
                      </div>
                    )}

                  {/* Dini Tebliğ ve Misyoner Gönderimi (AoH3 Din Sistemi) */}
                  {isSelectedPlayerOwned &&
                    (isDifferentReligion || selectedTerritory.missionary) && (
                      <div
                        className={
                          provinceSubTab === 'ECONOMY'
                            ? 'block'
                            : 'hidden lg:block'
                        }
                      >
                        {selectedTerritory.missionary ? (
                          <div className="w-full p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                ☪ Dini Tebliğ & İrşad Faaliyeti Sürüyor
                              </span>
                              <span className="font-mono-num text-emerald-300">
                                %{Math.round(
                                  (selectedTerritory.missionary.progressDays /
                                    selectedTerritory.missionary.totalDays) *
                                    100
                                )}{' '}
                                ({selectedTerritory.missionary.totalDays -
                                  selectedTerritory.missionary.progressDays}{' '}
                                Gün Kaldı)
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.max(
                                    5,
                                    Math.round(
                                      (selectedTerritory.missionary.progressDays /
                                        selectedTerritory.missionary.totalDays) *
                                        100
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Ulema ve tebliğ heyeti ahalinin{' '}
                              <strong className="text-emerald-300">
                                {RELIGIONS[selectedTerritory.missionary.targetReligion]?.name}
                              </strong>{' '}
                              inancına geçişini sağlıyor. Tamamlandığında isyan riski ve huzursuzluk kalıcı olarak düşecek.
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              onStartMissionary &&
                              onStartMissionary(selectedTerritory.id)
                            }
                            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center justify-between transition-colors shadow-sm"
                          >
                            <span className="text-left flex items-center gap-1.5">
                              <span>☪</span>
                              <span>
                                Tebliğ Heyeti Gönder (
                                {RELIGIONS[playerStateRel]?.name || 'Devlet Dini'}
                                )
                              </span>
                            </span>
                            <span className="font-mono-num text-emerald-300 shrink-0 ml-2">
                              120 Altın · 60 Gün
                            </span>
                          </button>
                        )}
                      </div>
                    )}

                  {/* Player Owned: Tech-Synced Unit Recruitment & Army Movement */}
                  {isSelectedPlayerOwned && (
                    <div
                      className={`pt-2 space-y-3 border-t border-slate-800 ${
                        provinceSubTab === 'ARMY' ? 'block' : 'hidden lg:block'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-200">
                          Seferberlik ({activeArmyGen.generationLabel}: {activeArmyGen.eraTitle})
                        </span>
                        {hasPendingArmyUpgrade && (
                          <button
                            onClick={onModernizeNationalArmy}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold animate-pulse"
                          >
                            ⚡ Orduyu Güncelle ({modernizationCost}G)
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() =>
                            onRecruitUnit(
                              selectedTerritory.id,
                              'infantry',
                              5000,
                              250
                            )
                          }
                          className="min-h-[68px] p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex flex-col items-center justify-center gap-1 text-center transition-colors"
                        >
                          <UnitTypeIllustrationSvg
                            unitType="infantry"
                            modeId={gameMode}
                            className="w-8 h-8"
                          />
                          <span>+5B {activeArmyGen.infantryShort}</span>
                          <span className="font-mono-num text-[10px] text-emerald-400/90">
                            250 Altın
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            onRecruitUnit(
                              selectedTerritory.id,
                              'armor',
                              2500,
                              420
                            )
                          }
                          className="min-h-[68px] p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 text-center transition-colors"
                        >
                          <UnitTypeIllustrationSvg
                            unitType="armor"
                            modeId={gameMode}
                            className="w-8 h-8"
                          />
                          <span>+2.5B {activeArmyGen.armorShort}</span>
                          <span className="font-mono-num text-[10px] text-amber-400">
                            420 Altın
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            onRecruitUnit(
                              selectedTerritory.id,
                              'airDrone',
                              1000,
                              500
                            )
                          }
                          className="min-h-[68px] p-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 text-center transition-colors"
                        >
                          <UnitTypeIllustrationSvg
                            unitType="airDrone"
                            modeId={gameMode}
                            className="w-8 h-8"
                          />
                          <span>+1B {activeArmyGen.airArtilleryShort}</span>
                          <span className="font-mono-num text-[10px] text-sky-400">
                            500 Altın
                          </span>
                        </button>
                      </div>

                      {/* Army Dispatch Controls */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-slate-300 font-medium">
                            Gönderilecek: <strong>%{Math.round(moveRatio * 100)}</strong> (
                            {Math.round(
                              Math.max(0, selectedTerritory.garrison - 500) * moveRatio
                            ).toLocaleString('tr-TR')}{' '}
                            Asker)
                          </span>
                          <div className="flex gap-1">
                            {[0.25, 0.5, 0.75, 1].map((r) => (
                              <button
                                key={r}
                                onClick={() => onSetMoveRatio(r)}
                                className={`px-2 py-0.5 rounded text-[11px] font-mono-num ${
                                  moveRatio === r
                                    ? 'bg-amber-500 text-slate-950 font-bold'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                %{r * 100}
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Kaynak eyalette en az 500 asker savunmada kalır.
                        </p>

                        <button
                          onClick={() => {
                            sound.playClick();
                            onStartArmyOrderMode(selectedTerritory.id);
                            onClose();
                          }}
                          className="w-full min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                          <Swords className="w-4 h-4" />
                          🧭 Haritadan Hedef Seç & Ordu Yürüt (Akıllı Rota)
                        </button>

                        {/* Quick Neighbor Target Buttons */}
                        <div className="pt-1">
                          <div className="text-[11px] text-slate-400 mb-1.5">
                            Komşu Bölgelere Hızlı Yürüyüş Emri:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedTerritory.neighbors.map((nId) => {
                              const nTerr = territories[nId];
                              if (!nTerr) return null;
                              const isOwn = nTerr.ownerId === playerNation.id;
                              const atWar = isAtWar(
                                wars,
                                playerNation.id,
                                nTerr.ownerId
                              );
                              return (
                                <button
                                  key={nId}
                                  onClick={() =>
                                    onExecuteArmyMove(selectedTerritory.id, nId)
                                  }
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors ${
                                    isOwn
                                      ? 'bg-sky-950/60 border-sky-500/40 text-sky-200 hover:bg-sky-900/60'
                                      : atWar
                                      ? 'bg-rose-950/70 border-rose-500/50 text-rose-200 hover:bg-rose-900/70'
                                      : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                                  }`}
                                >
                                  <span>{nTerr.name}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </div>

              {/* Right 7 Cols: Fief Lord Assignment + Buildings (if owned) OR Siege + Foreign Diplomacy (if foreign) */}
              <div className="lg:col-span-7 space-y-4">
                {isSelectedPlayerOwned ? (
                  <>
                    {/* Bannerlord Fief (Tımar) Granting Card: Give City to a Clan Lord / Pasha! */}
                    <div
                      className={`bg-slate-950/80 border border-purple-500/40 rounded-2xl p-4 space-y-2.5 ${
                        provinceSubTab === 'FIEF' ? 'block' : 'hidden lg:block'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-purple-200 flex items-center gap-2">
                            <Crown className="w-4 h-4 text-purple-400" />
                            Tımar (Fief) Yönetimi — Şehri Paşaya / Lorda Ver
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Tımar verilen Lord, kendi bütçesiyle bu şehre{' '}
                            <strong className="text-emerald-400">
                              her hafta +1.400 asker
                            </strong>{' '}
                            koyar, kaleyi onarır ve isyanı önler.
                          </p>
                        </div>
                      </div>

                      {(() => {
                        const playerOwnedTerrs = Object.values(territories).filter(
                          (t) => t.ownerId === playerNation.id
                        );
                        const adminStrain = calculateAdministrativeStrain(playerOwnedTerrs);

                        return (
                          <div className="space-y-2">
                            {adminStrain.excessCount > 0 ? (
                              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200">
                                <strong>⚠️ İdari Kapasite Uyarısı:</strong> Doğrudan yönettiğiniz has toprak ({adminStrain.directOwnedCount}/{adminStrain.capacityLimit} limit). Fazla {adminStrain.excessCount} sahipsiz eyalet bürokrasi aşırı yüküne (-%{adminStrain.penaltyPct} Vergi Verimliliği) yol açıyor. Fazla şehirleri Lordlarınıza Tımar vererek hem bu yükten kurtulun hem de Lordların otonom yatırımlarından faydalanın!
                              </div>
                            ) : (
                              <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300">
                                <strong>🏛️ İdari Denge:</strong> Has Topraklar ({adminStrain.directOwnedCount}/{adminStrain.capacityLimit}) · Lord Tımarları ({adminStrain.fiefAssignedCount}) · Sıfır Bürokratik Kayıp.
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {COMMANDERS.filter((c) =>
                                playerNation.recruitedGeneralIds?.includes(c.id)
                              ).map((lord) => {
                                const isCurrentHolder =
                                  selectedTerritory.fiefLordId === lord.id;
                                const archetypeInfo = getLordArchetype(lord.id);
                                const loyaltyInfo = getLordLoyaltySummary(
                                  playerNation,
                                  lord.id,
                                  territories
                                );
                                const canBestow =
                                  Boolean(onBestowFavorOnLord) &&
                                  playerNation.treasury >=
                                    BESTOW_FAVOR_GOLD_COST &&
                                  loyaltyInfo.loyalty < 100;

                                return (
                                  <div
                                    key={lord.id}
                                    className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between gap-2 ${
                                      isCurrentHolder
                                        ? 'bg-purple-950/70 border-purple-400 text-white shadow-md shadow-purple-500/20'
                                        : loyaltyInfo.tone === 'ROSE'
                                        ? 'bg-rose-950/35 border-rose-500/60 text-slate-200'
                                        : 'bg-slate-900 border-slate-700 text-slate-200'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <CommanderPortraitSvg
                                        specialty="OFFENSE"
                                        loyalty={loyaltyInfo.loyalty}
                                        className="w-10 h-10 shrink-0"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-1">
                                          <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                                            <span className="truncate">⚜ {lord.name}</span>
                                            {isCurrentHolder && (
                                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/40 text-purple-200 shrink-0">
                                                Vali
                                              </span>
                                            )}
                                          </div>
                                          <span
                                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono-num font-bold shrink-0 ${
                                              loyaltyInfo.tone === 'ROSE'
                                                ? 'bg-rose-500/25 text-rose-300'
                                                : loyaltyInfo.tone === 'AMBER'
                                                ? 'bg-amber-500/20 text-amber-300'
                                                : 'bg-emerald-500/20 text-emerald-300'
                                            }`}
                                          >
                                            ♥ %{loyaltyInfo.loyalty}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5 text-[10px] text-amber-300">
                                          <span>{archetypeInfo.badge}</span>
                                          <span className="text-slate-400">
                                            {loyaltyInfo.fiefCount} Tımar
                                          </span>
                                        </div>
                                        <p className="text-[10.5px] text-slate-400 mt-1 line-clamp-1">
                                          {loyaltyInfo.warningReason ||
                                            archetypeInfo.description}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 pt-0.5">
                                      <button
                                        onClick={() =>
                                          onAssignFiefLord(
                                            selectedTerritory.id,
                                            isCurrentHolder ? null : lord.id
                                          )
                                        }
                                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors ${
                                          isCurrentHolder
                                            ? 'bg-rose-900/60 hover:bg-rose-800/70 text-rose-200 border border-rose-500/40'
                                            : 'bg-purple-600 hover:bg-purple-500 text-white'
                                        }`}
                                      >
                                        {isCurrentHolder
                                          ? 'Azlet (-22 ♥)'
                                          : 'Tımar Ver (+12 ♥)'}
                                      </button>
                                      {onBestowFavorOnLord && (
                                        <button
                                          onClick={() =>
                                            onBestowFavorOnLord(lord.id)
                                          }
                                          disabled={!canBestow}
                                          title={`Hil'at & İhsan Ver (${BESTOW_FAVOR_GOLD_COST} Altın -> +18 Sadakat)`}
                                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors ${
                                            canBestow
                                              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40'
                                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                          }`}
                                        >
                                          🎁 İhsan
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div
                      className={`bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 ${
                        provinceSubTab === 'ECONOMY'
                          ? 'block'
                          : 'hidden lg:block'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Hammer className="w-4 h-4 text-amber-400" />
                            Binalar & Altyapı
                          </h3>
                          <p className="hidden sm:block text-xs text-slate-400">
                            Binalar bölgenin ekonomik gelirini, savunmasını ve araştırma kapasitesini kalıcı olarak büyütür.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {BUILDINGS.map((b) => {
                          const currentLvl = selectedTerritory.buildings[b.id] || 0;
                          const isMax = currentLvl >= b.maxLevel;
                          const cost = Math.round(
                            b.baseCost * Math.pow(1.35, currentLvl)
                          );
                          const queuedItem = selectedTerritory.constructionQueue?.find(
                            (q) => q.building === b.id
                          );
                          const canAfford =
                            playerNation.treasury >= cost && !isMax && !queuedItem;
                          const estDays = Math.max(14, 18 + currentLvl * 14);

                          return (
                            <div
                              key={b.id}
                              className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between gap-2"
                            >
                              <div className="flex items-start gap-2.5">
                                <BuildingIllustrationSvg
                                  buildingKey={b.id}
                                  className="w-10 h-10 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-bold text-white truncate">
                                      {b.name}
                                    </span>
                                    <span className="font-mono-num text-[11px] text-amber-400 font-semibold shrink-0">
                                      Sv.{currentLvl}/{b.maxLevel}
                                    </span>
                                  </div>
                                  <p className="text-[10.5px] leading-snug text-slate-400 mt-0.5">
                                    {b.description}
                                  </p>
                                  <div className="text-[10.5px] leading-snug text-emerald-400 mt-0.5 font-medium">
                                    {b.effectSummary}
                                  </div>

                                  {queuedItem && (
                                    <div className="mt-2 space-y-1">
                                      <div className="flex items-center justify-between text-[10px] font-mono-num text-amber-300">
                                        <span>İnşa Sürüyor (Sv. {queuedItem.targetLevel})</span>
                                        <span>{queuedItem.totalDays - queuedItem.progressDays} Gün Kaldı</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                        <div
                                          className="h-full bg-amber-400 rounded-full transition-all"
                                          style={{
                                            width: `${Math.max(
                                              5,
                                              Math.round(
                                                (queuedItem.progressDays /
                                                  queuedItem.totalDays) *
                                                  100
                                              )
                                            )}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 text-[10px] font-mono-num text-slate-400">
                                <span>{queuedItem ? 'İnşa sırası' : isMax ? 'Tamamlandı' : 'Sonraki seviye'}</span>
                                <span className="text-amber-300">
                                  {!queuedItem && !isMax ? `${cost}G · ${estDays}g` : queuedItem ? `${queuedItem.totalDays - queuedItem.progressDays}g kaldı` : '—'}
                                </span>
                              </div>

                              <button
                                disabled={!canAfford}
                                onClick={() =>
                                  onUpgradeBuilding(selectedTerritory.id, b.id)
                                }
                                className={`w-full min-h-[42px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                                  queuedItem
                                    ? 'bg-amber-950/50 text-amber-300 border border-amber-500/40 cursor-default'
                                    : isMax
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : canAfford
                                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                                    : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                {queuedItem ? (
                                  <>
                                    <Hammer className="w-3.5 h-3.5 animate-spin" /> İnşa ediliyor
                                  </>
                                ) : isMax ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" /> Maksimum Seviye
                                  </>
                                ) : (
                                  <>
                                    <Hammer className="w-3.5 h-3.5" /> Yükselt
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Foreign Nation Siege & Diplomatic Command Box */
                  <ProvinceForeignDiplomacyPanel
                    playerNation={playerNation}
                    selectedTerritory={selectedTerritory}
                    selectedOwner={selectedOwner}
                    territories={territories}
                    nations={nations}
                    relations={relations}
                    wars={wars}
                    gameMode={gameMode}
                    onDiplomaticAction={onDiplomaticAction}
                    onPeaceDeal={onPeaceDeal}
                    onSelectTerritory={onSelectTerritory}
                    onSiegeBombardment={onSiegeBombardment}
                    onClose={onClose}
                  />
                )}
              </div>
            </div>
  );
};
