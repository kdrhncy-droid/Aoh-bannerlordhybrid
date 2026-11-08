import React, { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Landmark,
  Swords,
  UserPlus,
  X,
} from 'lucide-react';
import { computeVisibleTerritoryIds } from '../../engine/fogOfWarEngine';
import { TERRAIN_INFO } from '../../engine/pashaAndFiefEngine';
import { getOrCreateRelation, isAtWar } from '../../engine/simulationEngine';
import { getProvinceStraitBadge } from '../../engine/straitsAndTradeEngine';
import {
  ActiveBattle,
  ActiveWar,
  DiplomaticRelation,
  Nation,
  Territory,
} from '../../types/game';
import { NationFlagCanvasBadge } from '../../map/nationFlagRenderer';
import { sound } from '../../utils/soundEngine';
import { TerrainPanoramaSvg } from '../illustrations/AoH3Illustrations';

interface SelectedProvinceBarProps {
  territory: Territory;
  playerNationId: string;
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  battles?: ActiveBattle[];
  fogOfWarEnabled: boolean;
  armyOrderSourceId: string | null;
  moveRatio: number;
  onSetMoveRatio: (ratio: number) => void;
  onStartArmyOrder: (territoryId: string | null) => void;
  onQuickRecruitInfantry: (territoryId: string) => void;
  onSelectTerritory: (territoryId: string) => void;
  onOpenFullDrawer: () => void;
  onOpenDiplomacyDrawer: () => void;
  onOpenBattleOverview?: () => void;
  onClear: () => void;
}

export const SelectedProvinceBar: React.FC<SelectedProvinceBarProps> = ({
  territory,
  playerNationId,
  nations,
  territories,
  relations,
  wars,
  battles = [],
  fogOfWarEnabled,
  armyOrderSourceId,
  moveRatio,
  onSetMoveRatio,
  onStartArmyOrder,
  onQuickRecruitInfantry,
  onSelectTerritory,
  onOpenFullDrawer,
  onOpenDiplomacyDrawer,
  onOpenBattleOverview,
  onClear,
}) => {
  const owner = nations[territory.ownerId];
  if (!owner) return null;

  const isPlayerOwned = territory.ownerId === playerNationId;
  const visibleIds = computeVisibleTerritoryIds(
    territories,
    nations,
    relations,
    [],
    [],
    playerNationId
  );
  const hasIntel =
    isPlayerOwned || !fogOfWarEnabled || visibleIds.has(territory.id);
  const atWar =
    !isPlayerOwned && Boolean(isAtWar(wars, playerNationId, owner.id));
  const rel = !isPlayerOwned
    ? getOrCreateRelation(relations, playerNationId, owner.id)
    : null;
  const isAllied = Boolean(rel?.isAllied || rel?.allianceType);

  // Owned provinces list for 1-tap mobile cycling (< / >)
  const ownedTerritoryIds = useMemo(
    () =>
      Object.values(territories)
        .filter((t) => t.ownerId === playerNationId)
        .sort((a, b) => b.garrison - a.garrison)
        .map((t) => t.id),
    [territories, playerNationId]
  );

  const cycleOwnedProvince = (dir: -1 | 1) => {
    if (ownedTerritoryIds.length === 0) return;
    sound.playSelectTerritory();
    const idx = ownedTerritoryIds.indexOf(territory.id);
    if (idx === -1) {
      onSelectTerritory(ownedTerritoryIds[0]);
      return;
    }
    const nextIdx =
      (idx + dir + ownedTerritoryIds.length) % ownedTerritoryIds.length;
    onSelectTerritory(ownedTerritoryIds[nextIdx]);
  };

  const cleanName = territory.name.replace(/^★\s*/, '');
  const cleanOwnerName = owner.name.replace(/\s*\(1440\)\s*$/, '');
  const titleText = territory.isCapital ? `★ ${cleanName}` : cleanName;
  const terrainMeta =
    TERRAIN_INFO[territory.terrain || 'OVA'] || TERRAIN_INFO.OVA;
  const straitBadge = getProvinceStraitBadge(territory.id, territories, wars);
  const isOrderActive = armyOrderSourceId === territory.id;

  const infK = (
    (territory.units?.infantry ?? territory.garrison) / 1000
  ).toFixed(1);
  const armK = ((territory.units?.armor ?? 0) / 1000).toFixed(1);
  const airK = ((territory.units?.airDrone ?? 0) / 1000).toFixed(1);

  return (
    <div className="hud-province-quickbar absolute bottom-2.5 left-2.5 right-14 sm:right-auto sm:w-[620px] z-20 rounded-2xl bg-[#090e1a]/96 border border-amber-500/50 shadow-2xl px-3 py-2 flex flex-col gap-2">
      {/* Optional AoH3 Army Split Ratio Bar when ordering a march */}
      {isOrderActive && (
        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-sky-950/90 border border-sky-400/50 text-[11px]">
          <span className="font-bold text-sky-200 truncate">
            🎯 Haritadan hedef eyalete dokunun · Sefer Oranı:
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {[0.25, 0.5, 0.75, 1].map((r) => (
              <button
                key={r}
                onClick={() => {
                  sound.playClick();
                  onSetMoveRatio(r);
                }}
                className={`px-2 py-0.5 rounded-lg font-mono-num text-[10px] font-bold transition-colors ${
                  Math.abs(moveRatio - r) < 0.05
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-900 text-sky-200 hover:bg-slate-800'
                }`}
              >
                %{Math.round(r * 100)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {/* Top Row (Portrait) / Left Block (Landscape): Illustrated Terrain Badge + Province Title + Army Breakdown */}
        <div className="flex items-center justify-between gap-2 min-w-0 sm:flex-1">
          {/* Mobile 1-Tap Province Cycle Left */}
          {ownedTerritoryIds.length > 1 && (
            <button
              onClick={() => cycleOwnedProvince(-1)}
              title="Önceki Eyaletimiz / Ordumuz"
              className="w-7 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onOpenFullDrawer();
            }}
            className="flex items-center gap-2.5 min-w-0 text-left flex-1"
          >
            {/* AoH3 Mini Illustrated Terrain + Flag Crest */}
            <div className="relative w-12 h-10 rounded-xl overflow-hidden border border-amber-500/40 shrink-0 shadow">
              <TerrainPanoramaSvg
                terrain={territory.terrain || 'OVA'}
                fortLevel={territory.buildings.fortress}
                isCapital={territory.isCapital}
                className="w-full h-full"
              />
              <div className="absolute bottom-0.5 right-0.5">
                <NationFlagCanvasBadge
                  nationId={owner.id}
                  flagCode={owner.flagCode}
                  color={owner.color}
                  width={22}
                  height={14}
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs sm:text-sm font-bold text-white truncate">
                  {titleText}
                </span>
                {straitBadge ? (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/40 shrink-0">
                    ⚓ +{straitBadge.dailyTollShare}G
                  </span>
                ) : isPlayerOwned ? (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shrink-0">
                    🛡 BİZİM EYALET
                  </span>
                ) : atWar ? (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-rose-500/30 text-rose-200 border border-rose-500/60 shrink-0">
                    ⚔️ DÜŞMAN
                  </span>
                ) : isAllied ? (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-sky-500/25 text-sky-200 border border-sky-500/50 shrink-0">
                    🤝 MÜTTEFİK
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                    TARAFSIZ
                  </span>
                )}
                {territory.isAssimilating && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-orange-500/20 text-orange-300 border border-orange-500/50 shrink-0">
                    🌍 Asimile %{Math.round(territory.assimilation ?? 30)}
                  </span>
                )}
                {territory.constructionQueue && territory.constructionQueue.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/50 shrink-0">
                    🔨 İnşa ({territory.constructionQueue[0].totalDays - territory.constructionQueue[0].progressDays}g)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-300 truncate mt-0.5 font-mono-num">
                <span className="text-slate-400 truncate max-w-[100px] font-sans">
                  {cleanOwnerName}
                </span>
                <span className="text-slate-600">·</span>
                <span
                  className={`font-bold shrink-0 ${
                    isPlayerOwned
                      ? 'text-emerald-300'
                      : atWar
                      ? 'text-rose-300'
                      : 'text-amber-300'
                  }`}
                >
                  {hasIntel
                    ? `${(territory.garrison / 1000).toFixed(1)}B (${infK}P/${armK}Z/${airK}T)`
                    : '? İstihbarat'}
                </span>
                <span className="hidden md:inline text-slate-600">·</span>
                <span className="hidden md:inline text-emerald-300 truncate max-w-[85px] font-sans">
                  {terrainMeta.name}
                </span>
              </div>
            </div>
          </button>

          {/* Mobile 1-Tap Province Cycle Right */}
          {ownedTerritoryIds.length > 1 && (
            <button
              onClick={() => cycleOwnedProvince(1)}
              title="Sonraki Eyaletimiz / Ordumuz"
              className="w-7 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Mobile-Only Close Button on Top Right */}
          <button
            onClick={() => {
              sound.playClick();
              onClear();
            }}
            title="Seçimi Kaldır"
            className="sm:hidden w-7 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Row (Portrait) / Right Block (Landscape): AoH3 1-Tap Mobile Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {(battles.some((b) => b.territoryId === territory.id) ||
            Boolean(territory.siege)) &&
            onOpenBattleOverview && (
              <button
                onClick={() => {
                  sound.playWarHorn();
                  onOpenBattleOverview();
                }}
                className="flex-1 sm:flex-initial min-h-[36px] px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-lg shadow-red-950/60 animate-pulse transition-all"
              >
                <Swords className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {territory.siege ? '♜ Kuşatma' : '⚔️ Muharebe'}
                </span>
              </button>
            )}

          {isPlayerOwned && territory.garrison >= 300 && (
            <button
              onClick={() => {
                sound.playClick();
                onStartArmyOrder(isOrderActive ? null : territory.id);
              }}
              className={`flex-1 sm:flex-initial min-h-[36px] px-2.5 sm:px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors ${
                isOrderActive
                  ? 'bg-sky-500 text-slate-950 animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <Swords className="w-3.5 h-3.5 shrink-0" />
              <span>{isOrderActive ? 'Hedef Seç' : 'Sefer'}</span>
            </button>
          )}

          {isPlayerOwned && (
            <button
              onClick={() => {
                sound.playClick();
                onQuickRecruitInfantry(territory.id);
              }}
              title="AoH3 Hızlı Asker Topla: +1.000 Piyade (150 Altın)"
              className="flex-1 sm:flex-initial min-h-[36px] px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span>+1B Asker</span>
            </button>
          )}

          {!isPlayerOwned && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenDiplomacyDrawer();
              }}
              className="flex-1 sm:flex-initial min-h-[36px] px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <Swords className="w-3.5 h-3.5 shrink-0" />
              <span>Diplomasi</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onOpenFullDrawer();
            }}
            className="flex-1 sm:flex-initial min-h-[36px] px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            {isPlayerOwned ? (
              <>
                <Landmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>İnşa & Eyalet</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>İncele</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onClear();
            }}
            title="Seçimi Kaldır"
            className="hidden sm:flex w-8 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
