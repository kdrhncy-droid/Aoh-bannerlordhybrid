import { GeoProjection } from 'd3-geo';
import {
  ActiveBattle,
  ActiveWar,
  DiplomaticRelation,
  MapMode,
  Nation,
  Territory,
} from '../types/game';
import { getOrCreateRelation, isAtWar } from '../engine/simulationEngine';
import type { MapLabelDensityOption } from '../engine/gameSettings';
import { TERRAIN_INFO } from '../engine/pashaAndFiefEngine';
import { GeoCountryFeature } from '../engine/worldBuilder';
import {
  drawAoH3SoldierUnitOnCanvas,
  drawNationFlagOnCanvas,
} from './nationFlagRenderer';

export interface PlacedBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface RenderLabelsParams {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  transform: { x: number; y: number; k: number };
  visibleFeatures: GeoCountryFeature[];
  territories: Record<string, Territory>;
  nations: Record<string, Nation>;
  relations?: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  battles: ActiveBattle[];
  projection: GeoProjection;
  mapMode: MapMode;
  mapLabelDensity?: MapLabelDensityOption;
  playerNationId: string;
  selectedTerritoryId: string | null;
  armyOrderSourceId?: string | null;
  fogOfWarEnabled: boolean;
  visibleTerritoryIds: Set<string>;
}

function formatTroopBadgeNumber(garrison: number, zoomK: number): string {
  if (garrison >= 1000) {
    const inThousands = garrison / 1000;
    if (zoomK >= 2.2 || inThousands < 10) {
      return `${inThousands.toFixed(1)}B`;
    }
    return `${Math.round(inThousands)}B`;
  }
  return `${Math.max(0, Math.round(garrison))}`;
}

export function getMapLabelThresholds(
  density: MapLabelDensityOption,
  isMobileViewport: boolean
): { capitalNameMinZoom: number; provinceNameMinZoom: number } {
  if (density === 'COMPACT') {
    return isMobileViewport
      ? { capitalNameMinZoom: 2.0, provinceNameMinZoom: 2.65 }
      : { capitalNameMinZoom: 1.8, provinceNameMinZoom: 2.45 };
  }
  if (density === 'DETAILED') {
    return isMobileViewport
      ? { capitalNameMinZoom: 1.45, provinceNameMinZoom: 1.9 }
      : { capitalNameMinZoom: 1.3, provinceNameMinZoom: 1.7 };
  }
  return isMobileViewport
    ? { capitalNameMinZoom: 1.75, provinceNameMinZoom: 2.25 }
    : { capitalNameMinZoom: 1.55, provinceNameMinZoom: 2.05 };
}

export function renderMapLabelsAndBattles(params: RenderLabelsParams): void {
  const {
    ctx,
    width,
    height,
    transform,
    visibleFeatures,
    territories,
    nations,
    relations = {},
    wars,
    battles,
    projection,
    mapMode,
    playerNationId,
    selectedTerritoryId,
    fogOfWarEnabled,
    visibleTerritoryIds,
    mapLabelDensity = 'BALANCED',
  } = params;

  const isMobileViewport = width < 768 || height < 540;
  const labelThresholds = getMapLabelThresholds(
    mapLabelDensity,
    isMobileViewport
  );
  const placedBoxes: PlacedBox[] = [];
  const collides = (box: PlacedBox) =>
    placedBoxes.some(
      (b) =>
        box.x1 < b.x2 && box.x2 > b.x1 && box.y1 < b.y2 && box.y2 > b.y1
    );

  // Track provinces with active battles so stationary shield doesn't overlap the live battle widget
  const battleTerritorySet = new Set(battles.map((b) => b.territoryId));

  const visibleTerritories: Territory[] = [];
  for (const feat of visibleFeatures) {
    const t = territories[feat.id];
    if (t) visibleTerritories.push(t);
  }

  // Sort priority: Selected -> Player Owned -> At War Enemy -> Capitals -> Largest Garrison
  const sortedForLabels = [...visibleTerritories].sort((a, b) => {
    if (a.id === selectedTerritoryId) return -1;
    if (b.id === selectedTerritoryId) return 1;
    const aPlayer = a.ownerId === playerNationId;
    const bPlayer = b.ownerId === playerNationId;
    if (aPlayer && !bPlayer) return -1;
    if (!aPlayer && bPlayer) return 1;
    const aEnemy = Boolean(isAtWar(wars, playerNationId, a.ownerId));
    const bEnemy = Boolean(isAtWar(wars, playerNationId, b.ownerId));
    if (aEnemy && !bEnemy) return -1;
    if (!aEnemy && bEnemy) return 1;
    if (a.isCapital && !b.isCapital) return -1;
    if (!a.isCapital && b.isCapital) return 1;
    return (b.garrison || 0) - (a.garrison || 0);
  });

  // 0. AoH3 Grand Strategy Country Realm Names (Rendered at overview / normal zoom < 2.05)
  if (transform.k < 2.05) {
    const nationClusters: Record<
      string,
      { pts: [number, number][]; count: number }
    > = {};
    for (const t of visibleTerritories) {
      if (!t.ownerId) continue;
      const pt = projection(t.centroid);
      if (!pt) continue;
      const sx = pt[0] * transform.k + transform.x;
      const sy = pt[1] * transform.k + transform.y;
      if (sx < -100 || sx > width + 100 || sy < -100 || sy > height + 100)
        continue;
      if (!nationClusters[t.ownerId]) {
        nationClusters[t.ownerId] = { pts: [], count: 0 };
      }
      nationClusters[t.ownerId].pts.push([sx, sy]);
      nationClusters[t.ownerId].count += 1;
    }

    Object.entries(nationClusters).forEach(([nationId, cluster]) => {
      const nat = nations[nationId];
      if (!nat || cluster.pts.length === 0) return;

      let sumX = 0;
      let sumY = 0;
      for (const [x, y] of cluster.pts) {
        sumX += x;
        sumY += y;
      }
      const cx = sumX / cluster.pts.length;
      const cy = sumY / cluster.pts.length;

      // Clean nation name: remove "(1440)" and format spaced uppercase
      const rawName = nat.name
        .replace(/\s*\(1440\)\s*$/, '')
        .replace(/\s*\(2026\)\s*$/, '');
      const spacedName = rawName
        .toUpperCase()
        .split('')
        .join(' ')
        .replace(/\s{3,}/g, '   ');

      const isPlayer = nationId === playerNationId;
      const isAtWarWithPlayer = Boolean(
        isAtWar(wars, playerNationId, nationId)
      );

      const baseSize = Math.min(
        22,
        Math.max(
          10.5,
          8.0 + Math.sqrt(cluster.count) * 3.6 + transform.k * 2.0
        )
      );

      ctx.save();
      ctx.font = `700 ${baseSize.toFixed(1)}px "Cinzel", "Georgia", "Times New Roman", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Deep dark border for ultra readability over any political terrain
      ctx.lineWidth = 4.2;
      ctx.strokeStyle = 'rgba(4, 10, 22, 0.95)';
      ctx.strokeText(spacedName, cx, cy);

      // Grand strategy warm ivory/gold typography
      ctx.fillStyle = isPlayer
        ? 'rgba(254, 240, 138, 0.95)'
        : isAtWarWithPlayer
        ? 'rgba(254, 202, 202, 0.92)'
        : 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(spacedName, cx, cy);
      ctx.restore();
    });
  }

  for (const t of sortedForLabels) {
    const pt = projection(t.centroid);
    if (!pt) continue;
    const sx = pt[0] * transform.k + transform.x;
    const sy = pt[1] * transform.k + transform.y;

    if (sx < -60 || sx > width + 60 || sy < -60 || sy > height + 60) {
      continue;
    }

    const isSelected = t.id === selectedTerritoryId;
    const isPlayerTerritory = t.ownerId === playerNationId;
    const isEnemy =
      !isPlayerTerritory && Boolean(isAtWar(wars, playerNationId, t.ownerId));
    const rel = !isPlayerTerritory
      ? getOrCreateRelation(relations, playerNationId, t.ownerId)
      : null;
    const owner = nations[t.ownerId];
    const isAlliedOrVassal =
      !isPlayerTerritory &&
      (Boolean(rel?.isAllied) ||
        owner?.vassalOf === playerNationId ||
        nations[playerNationId]?.vassalOf === t.ownerId);

    const isCapital = Boolean(t.isCapital || t.id === t.ownerId);
    const hasIntel = !fogOfWarEnabled || visibleTerritoryIds.has(t.id);

    // 1. Province / Sancak Name Label (Only when zoomed in or when explicitly selected, avoiding map clutter)
    const wantsName =
      isSelected ||
      (isCapital && transform.k >= labelThresholds.capitalNameMinZoom) ||
      transform.k >= labelThresholds.provinceNameMinZoom;

    let namePlaced = false;
    if (wantsName && !battleTerritorySet.has(t.id)) {
      const cleanName = t.name.replace(/^★\s*/, '');
      const rawLabel =
        isCapital && transform.k < 2.0 && owner
          ? `★ ${cleanName}`
          : isCapital
          ? `★ ${cleanName}`
          : cleanName;
      const labelText =
        rawLabel.length > 20 ? `${rawLabel.slice(0, 19)}…` : rawLabel;

      const fontSize = isSelected
        ? 11.5
        : isCapital
        ? Math.min(11.5, Math.max(8.5, 7.8 + transform.k * 0.7))
        : Math.min(10, Math.max(8, 7 + transform.k * 0.55));
      const estW = labelText.length * (fontSize * 0.56) + 10;
      const estH = fontSize + 4;
      const labelY = sy - 12;

      const nameBox: PlacedBox = {
        x1: sx - estW / 2,
        y1: labelY - estH / 2,
        x2: sx + estW / 2,
        y2: labelY + estH / 2,
      };

      if (isSelected || !collides(nameBox)) {
        placedBoxes.push(nameBox);
        namePlaced = true;

        ctx.font = `${isCapital || isSelected ? '700' : '600'} ${fontSize.toFixed(1)}px Inter, sans-serif`;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.94)';
        ctx.strokeText(labelText, sx, labelY);
        ctx.fillStyle = isSelected
          ? '#FDE68A'
          : isPlayerTerritory
          ? '#A7F3D0'
          : isEnemy
          ? '#FECDD3'
          : isCapital
          ? '#F8FAFC'
          : '#CBD5E1';
        ctx.fillText(labelText, sx, labelY);
      }
    }

    // 1B. AoH3 Real-Time Siege Widget on Map (if territory is under siege)
    if (t.siege && !battleTerritorySet.has(t.id)) {
      const siege = t.siege;
      const siegeAttacker = nations[siege.attackerId];
      const siegeBadgeY = namePlaced ? sy + 8 : sy;
      const siegeW = 86;
      const siegeH = 21;
      const sBox: PlacedBox = {
        x1: sx - siegeW / 2 - 2,
        y1: siegeBadgeY - siegeH / 2 - 2,
        x2: sx + siegeW / 2 + 2,
        y2: siegeBadgeY + siegeH / 2 + 2,
      };

      if (isSelected || !collides(sBox)) {
        placedBoxes.push(sBox);
        const bx = sx - siegeW / 2;
        const by = siegeBadgeY - siegeH / 2;

        ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.beginPath();
        ctx.roundRect(bx - 2, by - 2, siegeW + 4, siegeH + 4, 6);
        ctx.fill();

        ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(bx, by, siegeW, siegeH, 4.5);
        ctx.fill();
        ctx.stroke();

        drawNationFlagOnCanvas(
          ctx,
          bx + 1.5,
          by + 1.5,
          22,
          siegeH - 3,
          siege.attackerId,
          (siegeAttacker?.flagCode || 'ORD').slice(0, 3),
          siegeAttacker?.color || '#DC2626'
        );

        ctx.font = '700 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FEF08A';
        ctx.fillText(
          `♜ %${Math.round(siege.progress)}`,
          bx + 23 + (siegeW - 23) / 2,
          siegeBadgeY - 1
        );

        const progW = ((siegeW - 25) * Math.min(100, siege.progress)) / 100;
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(bx + 23, by + siegeH - 3, progW, 2);
      }
    }

    // 2. AoH3-Style Army Counter Shield with Graphical National Flag & Soldier Unit Miniature
    const garrison = t.garrison || 0;
    const wantsArmyShield =
      !battleTerritorySet.has(t.id) &&
      !t.siege &&
      (isSelected ||
        (hasIntel &&
          garrison >= 500 &&
          (mapMode === 'MILITARY' ||
            (isPlayerTerritory && transform.k >= 1.0) ||
            (isEnemy && transform.k >= 1.0) ||
            (isAlliedOrVassal &&
              (isCapital || garrison >= 5000) &&
              transform.k >= 1.15) ||
            (isCapital && transform.k >= 1.2) ||
            (garrison >= 6000 && transform.k >= 1.35) ||
            transform.k >= (isMobileViewport ? 1.85 : 1.65))));

    if (wantsArmyShield && (garrison > 0 || isSelected)) {
      const badgeY = namePlaced ? sy + 9 : sy + 2;
      const troopStr = hasIntel
        ? formatTroopBadgeNumber(garrison, transform.k)
        : '?';
      const flagCode = (owner?.flagCode || '??').slice(0, 3);
      const roleIcon = isPlayerTerritory
        ? '🛡'
        : isEnemy
        ? '⚔'
        : isAlliedOrVassal
        ? '🤝'
        : '';

      const mainText = roleIcon ? `${roleIcon} ${troopStr}` : troopStr;
      const isCompactZoom = transform.k < 1.55 && !isSelected;
      const badgeH = isCompactZoom ? 16 : 19;
      const flagBoxW = isCompactZoom ? 22 : 26;
      const numBoxW = Math.max(
        isCompactZoom ? 30 : 36,
        mainText.length * (isCompactZoom ? 5.5 : 6.2) + 8
      );
      const badgeW = flagBoxW + numBoxW;

      // Determine whether to show the AoH3 3D/Miniature Soldier + Flag Standard above the counter
      const wantsSoldierVisual =
        hasIntel &&
        garrison >= 1000 &&
        (isSelected ||
          mapMode === 'MILITARY' ||
          ((isPlayerTerritory || isEnemy) &&
            (isCapital || garrison >= 9000 || transform.k >= 1.35)) ||
          (isCapital && transform.k >= 1.45) ||
          transform.k >= 1.75);

      const topReserve = namePlaced ? 1 : wantsSoldierVisual ? 14 : 2;
      const badgeBox: PlacedBox = {
        x1: sx - badgeW / 2 - 2,
        y1: badgeY - badgeH / 2 - topReserve,
        x2: sx + badgeW / 2 + 2,
        y2: badgeY + badgeH / 2 + 2,
      };

      const allowForcePlace = isSelected;

      if (allowForcePlace || !collides(badgeBox)) {
        placedBoxes.push(badgeBox);

        const bx = sx - badgeW / 2;
        const by = badgeY - badgeH / 2;

        // 2a. Draw AoH3 Miniature Soldier Figure + Waving National Flag Standard above/beside plate!
        if (wantsSoldierVisual) {
          const soldierScale = isSelected
            ? 0.92
            : isCompactZoom
            ? 0.72
            : 0.84;
          const soldierX = namePlaced ? bx - 8 : sx;
          const soldierY = namePlaced ? badgeY + 4 : by - 1.5;
          drawAoH3SoldierUnitOnCanvas(ctx, soldierX, soldierY, soldierScale, {
            nationId: t.ownerId,
            flagCode,
            nationColor: owner?.color || '#475569',
            isPlayer: isPlayerTerritory,
            isEnemy,
          });
        }

        // 2b. Outer tactical halo for Player and Enemy armies
        if (isPlayerTerritory || isEnemy || isSelected) {
          ctx.fillStyle = isSelected
            ? 'rgba(250, 204, 21, 0.34)'
            : isPlayerTerritory
            ? 'rgba(16, 185, 129, 0.28)'
            : 'rgba(244, 63, 94, 0.36)';
          ctx.beginPath();
          ctx.roundRect(bx - 2.5, by - 2.5, badgeW + 5, badgeH + 5, 6);
          ctx.fill();
        }

        // 2c. Main AoH3 Shield Plate Body
        ctx.fillStyle = isPlayerTerritory
          ? 'rgba(6, 78, 59, 0.97)' // Emerald Royal Shield for Player
          : isEnemy
          ? 'rgba(127, 29, 29, 0.97)' // Crimson War Shield for Enemy
          : isAlliedOrVassal
          ? 'rgba(12, 74, 110, 0.96)' // Cobalt Shield for Ally/Vassal
          : 'rgba(15, 23, 42, 0.95)'; // Obsidian Slate for Neutral

        ctx.strokeStyle = isSelected
          ? '#FACC15'
          : isPlayerTerritory
          ? '#FBBF24' // Gold trim on Player armies
          : isEnemy
          ? '#FB7185' // Bright rose trim on Enemy armies
          : isAlliedOrVassal
          ? '#38BDF8'
          : 'rgba(148, 163, 184, 0.78)';
        ctx.lineWidth = isSelected || isPlayerTerritory || isEnemy ? 1.65 : 1.15;

        ctx.beginPath();
        ctx.roundRect(bx, by, badgeW, badgeH, 4.5);
        ctx.fill();
        ctx.stroke();

        // 2d. Left Graphical Nation Flag inside Shield (Real AoH3 Flag instead of plain text!)
        drawNationFlagOnCanvas(
          ctx,
          bx + 1.5,
          by + 1.5,
          flagBoxW - 2,
          badgeH - 3,
          t.ownerId,
          flagCode,
          owner?.color || '#475569'
        );

        // Subtle gold vertical divider between flag and troop count
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx + flagBoxW, by + 1.5);
        ctx.lineTo(bx + flagBoxW, by + badgeH - 1.5);
        ctx.stroke();

        // 2e. Right Troop Count Text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `700 ${isCompactZoom ? '9px' : '10px'} "JetBrains Mono", monospace`;
        ctx.fillStyle = !hasIntel
          ? '#94A3B8'
          : isPlayerTerritory
          ? '#FEF08A'
          : isEnemy
          ? '#FFE4E6'
          : '#F8FAFC';
        ctx.fillText(
          mainText,
          bx + flagBoxW + numBoxW / 2,
          badgeY - (hasIntel ? 1.2 : 0)
        );

        // 2f. Bottom 2px Unit Composition Bar (Green = Infantry, Amber = Cavalry/Armor, Sky = Siege/Air)
        if (hasIntel && t.units && garrison > 0) {
          const totalU = Math.max(
            1,
            (t.units.infantry || 0) +
              (t.units.armor || 0) +
              (t.units.airDrone || 0)
          );
          const infW = ((t.units.infantry || 0) / totalU) * (numBoxW - 4);
          const armW = ((t.units.armor || 0) / totalU) * (numBoxW - 4);
          const airW = Math.max(0, numBoxW - 4 - infW - armW);
          const barX = bx + flagBoxW + 2;
          const barY = by + badgeH - 3.2;

          ctx.fillStyle = '#34D399';
          ctx.fillRect(barX, barY, infW, 2);
          ctx.fillStyle = '#FBBF24';
          ctx.fillRect(barX + infW, barY, armW, 2);
          ctx.fillStyle = '#38BDF8';
          ctx.fillRect(barX + infW + armW, barY, airW, 2);
        }

        // Terrain / Fief Lord Micro-Indicator only in TERRAIN mode or when selected/fief-assigned
        if (
          (mapMode === 'TERRAIN' || isSelected || Boolean(t.fiefLordId)) &&
          transform.k >= 2.2
        ) {
          const tMeta = TERRAIN_INFO[t.terrain || 'OVA'] || TERRAIN_INFO.OVA;
          const wallHp = t.castleWallHp ?? 100;
          const subTag = `${tMeta.name}${wallHp < 100 ? ` ♜%${wallHp}` : ''}${t.fiefLordId ? ' ⚜' : ''}`;
          ctx.font = '600 8px Inter, sans-serif';
          ctx.fillStyle = t.fiefLordId ? '#E9D5FF' : '#CBD5E1';
          ctx.strokeStyle = 'rgba(2, 6, 23, 0.9)';
          ctx.lineWidth = 2.2;
          ctx.strokeText(subTag, sx, badgeY + badgeH / 2 + 7);
          ctx.fillText(subTag, sx, badgeY + badgeH / 2 + 7);
        }
      }
    }
  }

  // 3. AoH3 Live On-Map Battle Simulation Widget (Clashing Soldiers + Graphical Flags + Tug-of-War Bar)
  const animPhase = (Date.now() % 1000) / 1000;
  for (const btl of battles) {
    const t = territories[btl.territoryId];
    if (!t) continue;
    const pt = projection(t.centroid);
    if (!pt) continue;
    const sx = pt[0] * transform.k + transform.x;
    const sy = pt[1] * transform.k + transform.y;

    const attNation = nations[btl.attackerId];
    const defNation = nations[btl.defenderId];
    const attFlag = (attNation?.flagCode || 'SLD').slice(0, 3);
    const defFlag = (defNation?.flagCode || 'SVN').slice(0, 3);
    const attStr = formatTroopBadgeNumber(btl.attackerTroops, 2.5);
    const defStr = formatTroopBadgeNumber(btl.defenderTroops, 2.5);

    const totalTroops = Math.max(1, btl.attackerTroops + btl.defenderTroops);
    const attRatio = Math.max(
      0.12,
      Math.min(0.88, btl.attackerTroops / totalTroops)
    );

    const pillW = 124;
    const pillH = 24;
    const bx = sx - pillW / 2;
    const by = sy - 10 - pillH / 2;

    // 3a. Two Opposing AoH3 Soldiers Clashing Swords Above the Battle Bar!
    drawAoH3SoldierUnitOnCanvas(ctx, sx - 18, by - 2, 0.85, {
      nationId: btl.attackerId,
      flagCode: attFlag,
      nationColor: attNation?.color || '#DC2626',
      isPlayer: btl.attackerId === playerNationId,
      isEnemy: btl.attackerId !== playerNationId,
      isFighting: true,
      facingLeft: false,
      animPhase,
    });
    drawAoH3SoldierUnitOnCanvas(ctx, sx + 18, by - 2, 0.85, {
      nationId: btl.defenderId,
      flagCode: defFlag,
      nationColor: defNation?.color || '#2563EB',
      isPlayer: btl.defenderId === playerNationId,
      isEnemy: btl.defenderId !== playerNationId,
      isFighting: true,
      facingLeft: true,
      animPhase,
    });

    // 3b. Outer combat pulse halo
    ctx.fillStyle = 'rgba(245, 158, 11, 0.38)';
    ctx.beginPath();
    ctx.roundRect(bx - 3, by - 3, pillW + 6, pillH + 6, 7);
    ctx.fill();

    // 3c. Main dark battle frame
    ctx.fillStyle = 'rgba(9, 14, 26, 0.97)';
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(bx, by, pillW, pillH, 5);
    ctx.fill();
    ctx.stroke();

    // 3d. Left Attacker Graphical Flag & Right Defender Graphical Flag
    drawNationFlagOnCanvas(
      ctx,
      bx + 1.5,
      by + 1.5,
      21,
      pillH - 7,
      btl.attackerId,
      attFlag,
      attNation?.color || '#DC2626'
    );
    drawNationFlagOnCanvas(
      ctx,
      bx + pillW - 22.5,
      by + 1.5,
      21,
      pillH - 7,
      btl.defenderId,
      defFlag,
      defNation?.color || '#2563EB'
    );

    // 3e. Attacker Troops vs Crossed Swords vs Defender Troops
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 8.5px "JetBrains Mono", monospace';
    ctx.fillStyle =
      btl.attackerId === playerNationId ? '#A7F3D0' : '#FECDD3';
    ctx.fillText(attStr, bx + 40, by + 9.5);

    ctx.font = '700 9.5px Inter, sans-serif';
    ctx.fillStyle = '#FBBF24';
    ctx.fillText('⚔', sx, by + 9.5);

    ctx.font = '700 8.5px "JetBrains Mono", monospace';
    ctx.fillStyle =
      btl.defenderId === playerNationId ? '#A7F3D0' : '#E2E8F0';
    ctx.fillText(defStr, bx + pillW - 40, by + 9.5);

    // 3f. Bottom Tug-of-War Balance Bar
    const barY = by + pillH - 4.5;
    const barW = pillW - 4;
    const attBarW = Math.round(barW * attRatio);

    ctx.fillStyle =
      btl.attackerId === playerNationId ? '#10B981' : '#EF4444';
    ctx.fillRect(bx + 2, barY, attBarW, 3);

    ctx.fillStyle =
      btl.defenderId === playerNationId ? '#10B981' : '#3B82F6';
    ctx.fillRect(bx + 2 + attBarW, barY, barW - attBarW, 3);
  }
}
