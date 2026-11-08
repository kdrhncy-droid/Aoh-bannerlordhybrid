import { GeoProjection } from 'd3-geo';
import { IDEOLOGIES } from '../data/world2026Data';
import {
  CULTURES,
  RELIGIONS,
  resolveTerritoryCulture,
  resolveTerritoryReligion,
} from '../data/religionAndCultureData';
import { TERRAIN_INFO } from '../engine/pashaAndFiefEngine';
import { isAtWar } from '../engine/simulationEngine';
import {
  evaluateActiveStraits,
  TRADE_CORRIDORS,
} from '../engine/straitsAndTradeEngine';
import { GeoCountryFeature, relationKey } from '../engine/worldBuilder';
import {
  ActiveWar,
  ArmyMovement,
  DiplomaticRelation,
  MapMode,
  Nation,
  Territory,
} from '../types/game';
import { MapGeometryCache } from './spatialIndex';
import {
  drawAoH3SoldierUnitOnCanvas,
  drawNationFlagOnCanvas,
} from './nationFlagRenderer';

export function resolveTerritoryFillColor(params: {
  territory: Territory;
  mapMode: MapMode;
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  playerNationId: string;
  selectedTerritoryId: string | null;
}): string {
  const {
    territory: t,
    mapMode,
    nations,
    territories,
    relations,
    wars,
    playerNationId,
    selectedTerritoryId,
  } = params;

  const owner = nations[t.ownerId];
  if (!owner) return '#334155';

  if (mapMode === 'POLITICAL') return owner.color;
  if (mapMode === 'TERRAIN') {
    return TERRAIN_INFO[t.terrain || 'OVA']?.color || '#4ADE80';
  }

  if (mapMode === 'DIPLOMATIC') {
    const refId = selectedTerritoryId
      ? territories[selectedTerritoryId]?.ownerId || playerNationId
      : playerNationId;

    if (t.ownerId === refId) return '#2563EB';
    if (isAtWar(wars, refId, t.ownerId)) return '#DC2626';
    const rel = relations[relationKey(refId, t.ownerId)];
    if (rel?.allianceType === 'OFFENSIVE') return '#10B981';
    if (rel?.allianceType === 'DEFENSIVE') return '#0284C7';
    if (rel?.isAllied) return '#10B981';
    if (rel?.hasTradeAgreement || (rel?.score ?? 0) >= 35) return '#34D399';
    if (rel?.hasEmbargo || (rel?.score ?? 0) <= -35) return '#F97316';
    return '#475569';
  }

  if (mapMode === 'ECONOMIC') {
    const effectiveGdp = t.baseGdp * (1 + t.buildings.factory * 0.25);
    if (effectiveGdp >= 320) return '#10B981';
    if (effectiveGdp >= 220) return '#22C55E';
    if (effectiveGdp >= 150) return '#84CC16';
    if (effectiveGdp >= 100) return '#EAB308';
    return '#64748B';
  }

  if (mapMode === 'IDEOLOGY') {
    return IDEOLOGIES[owner.ideology]?.color || '#64748B';
  }

  if (mapMode === 'MILITARY') {
    if (t.garrison >= 80000) return '#991B1B';
    if (t.garrison >= 45000) return '#DC2626';
    if (t.garrison >= 25000) return '#F97316';
    if (t.garrison >= 12000) return '#F59E0B';
    return '#475569';
  }

  if (mapMode === 'RELIGION') {
    const relId = resolveTerritoryReligion(t, owner);
    return RELIGIONS[relId]?.color || '#059669';
  }

  if (mapMode === 'CULTURE') {
    const culId = resolveTerritoryCulture(t, owner);
    return CULTURES[culId]?.color || '#DC2626';
  }

  if (mapMode === 'ASSIMILATION') {
    const isCore = t.coreOwnerId === t.ownerId || (t.assimilation ?? 100) >= 100;
    if (isCore) return '#10B981'; // 100% Core & Entegre
    if (t.isAssimilating) return '#F59E0B'; // Asimilasyon devam ediyor
    return '#EF4444'; // Gayri-Milli / İsyan Riski
  }

  return owner.color;
}

export function renderOceanAndPolygons(params: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  transform: { k: number; x: number; y: number };
  cache: MapGeometryCache;
  visibleFeatures: GeoCountryFeature[];
  territories: Record<string, Territory>;
  nations: Record<string, Nation>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  movements: ArmyMovement[];
  projection: GeoProjection;
  mapMode: MapMode;
  playerNationId: string;
  selectedTerritoryId: string | null;
  armyOrderSourceId: string | null;
  fogOfWarEnabled: boolean;
  visibleTerritoryIds: Set<string>;
}): void {
  const {
    ctx,
    width,
    height,
    transform,
    cache,
    visibleFeatures,
    territories,
    nations,
    relations,
    wars,
    movements,
    projection,
    mapMode,
    playerNationId,
    selectedTerritoryId,
    armyOrderSourceId,
    fogOfWarEnabled,
    visibleTerritoryIds,
  } = params;

  // 1. Sapphire & Deep Azure Ocean Background (Screen Space)
  const oceanGrad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    30,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.85
  );
  oceanGrad.addColorStop(0, '#14497D');
  oceanGrad.addColorStop(0.55, '#0D335B');
  oceanGrad.addColorStop(1, '#071B34');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Enter World Space
  ctx.save();
  ctx.translate(transform.x, transform.y);
  ctx.scale(transform.k, transform.k);

  // 1B. Projected Globe Basin & Graticule Grid
  if (cache.spherePath) {
    const globeWaterGrad = ctx.createLinearGradient(0, 0, 0, height);
    globeWaterGrad.addColorStop(0, '#0E3966');
    globeWaterGrad.addColorStop(0.5, '#154D85');
    globeWaterGrad.addColorStop(1, '#0C3159');
    ctx.fillStyle = globeWaterGrad;
    ctx.fill(cache.spherePath);

    ctx.lineWidth = 1.4 / transform.k;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.stroke(cache.spherePath);
  }

  if (cache.graticulePath) {
    ctx.lineWidth = 0.55 / transform.k;
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.08)';
    ctx.stroke(cache.graticulePath);
  }

  const sourceOrderTerritory = armyOrderSourceId
    ? territories[armyOrderSourceId]
    : null;

  const zoomBorderScale = Math.min(
    1.85,
    1.0 + Math.log2(Math.max(1, transform.k)) * 0.3
  );

  // 2. Render RBush-culled visible province polygons (Streamlined single-pass border for 60 FPS)
  visibleFeatures.forEach((feat) => {
    const t = territories[feat.id];
    const path2d = cache.paths[feat.id];
    if (!t || !path2d) return;

    const isSelected = selectedTerritoryId === t.id;
    const isPlayerOwned = t.ownerId === playerNationId;
    const hasIntel = !fogOfWarEnabled || visibleTerritoryIds.has(t.id);
    const isEnemyTerritory =
      t.ownerId !== playerNationId &&
      Boolean(isAtWar(wars, playerNationId, t.ownerId));
    const isValidMoveTarget = Boolean(
      sourceOrderTerritory && sourceOrderTerritory.neighbors.includes(t.id)
    );

    ctx.fillStyle = resolveTerritoryFillColor({
      territory: t,
      mapMode,
      nations,
      territories,
      relations,
      wars,
      playerNationId,
      selectedTerritoryId,
    });
    ctx.globalAlpha = isSelected
      ? 0.98
      : isPlayerOwned
      ? 0.94
      : hasIntel
      ? 0.86
      : 0.7;
    ctx.fill(path2d);

    // AoH3 Diagonal Occupation Stripes across occupied territories
    if (t.isOccupied && t.occupiedById && t.occupiedById !== t.ownerId) {
      const occupant = nations[t.occupiedById];
      const occColor = occupant?.color || '#DC2626';
      ctx.save();
      ctx.clip(path2d);
      ctx.strokeStyle = occColor;
      const pt = projection(t.centroid);
      const cx = pt ? pt[0] : 0;
      const cy = pt ? pt[1] : 0;
      const span = 140;
      const step = 13 / transform.k;
      ctx.beginPath();
      for (let x = cx - span * 1.5; x < cx + span * 1.5; x += step) {
        ctx.moveTo(x, cy - span);
        ctx.lineTo(x + span, cy + span);
      }
      ctx.stroke();
      ctx.restore();
    }

    if (isSelected) {
      ctx.fillStyle = 'rgba(253, 224, 71, 0.22)';
      ctx.fill(path2d);
    } else if (isEnemyTerritory) {
      ctx.fillStyle = 'rgba(220, 38, 38, 0.18)';
      ctx.fill(path2d);
    }

    if (isValidMoveTarget) {
      ctx.fillStyle =
        t.ownerId === playerNationId
          ? 'rgba(56, 189, 248, 0.48)'
          : isEnemyTerritory
          ? 'rgba(239, 68, 68, 0.58)'
          : 'rgba(245, 158, 11, 0.45)';
      ctx.fill(path2d);
    }

    ctx.globalAlpha = 1;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Differentiate external international borders from internal province borders (AoH3 style)
    const hasForeignNeighbor = t.neighbors.some((nId) => {
      const n = territories[nId];
      return n && n.ownerId !== t.ownerId;
    });

    const isExternalBorder =
      hasForeignNeighbor || isEnemyTerritory || isValidMoveTarget;

    ctx.lineWidth =
      ((isValidMoveTarget
        ? 1.6
        : isEnemyTerritory
        ? 1.45
        : isExternalBorder
        ? 1.25
        : 0.65) *
        zoomBorderScale) /
      transform.k;

    ctx.strokeStyle = isValidMoveTarget
      ? '#38BDF8'
      : isEnemyTerritory
      ? '#F87171'
      : isExternalBorder
      ? isPlayerOwned
        ? 'rgba(254, 243, 199, 0.6)'
        : 'rgba(2, 6, 23, 0.95)'
      : isPlayerOwned
      ? 'rgba(254, 243, 199, 0.25)'
      : 'rgba(15, 23, 42, 0.55)';
    ctx.stroke(path2d);
  });

  // 2b. Dedicated Top-Pass for Selected Province so neighbors never paint over its golden ring!
  if (selectedTerritoryId && cache.paths[selectedTerritoryId]) {
    const selPath = cache.paths[selectedTerritoryId];
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = (3.2 * zoomBorderScale) / transform.k;
    ctx.strokeStyle = 'rgba(4, 10, 22, 0.96)';
    ctx.stroke(selPath);
    ctx.lineWidth = (2.15 * zoomBorderScale) / transform.k;
    ctx.strokeStyle = '#FBBF24';
    ctx.stroke(selPath);
    ctx.restore();
  }

  // 2c. Strategic Straits (⚓) & Silk Road / Maritime Trade Corridors
  if (mapMode === 'ECONOMIC' || transform.k >= 2.15) {
    const activeStraits = evaluateActiveStraits(territories, wars);

    if (mapMode === 'ECONOMIC') {
      const caravanPhase = (Date.now() / 3400) % 1;
      TRADE_CORRIDORS.forEach((corr, cIdx) => {
        const pts: [number, number][] = [];
        for (const hId of corr.hubIds) {
          const hTerr = territories[hId];
          if (!hTerr) continue;
          const pt = projection(hTerr.centroid);
          if (pt) pts.push(pt);
        }
        if (pts.length < 2) return;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([5 / transform.k, 4 / transform.k]);
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          if (Math.abs(pts[i][0] - pts[i - 1][0]) > width * 0.45) {
            ctx.moveTo(pts[i][0], pts[i][1]);
          } else {
            ctx.lineTo(pts[i][0], pts[i][1]);
          }
        }
        ctx.lineWidth = 2.1 / transform.k;
        ctx.strokeStyle = corr.color;
        ctx.globalAlpha = 0.78;
        ctx.stroke();
        ctx.setLineDash([]);

        for (let i = 0; i < pts.length - 1; i++) {
          if (Math.abs(pts[i + 1][0] - pts[i][0]) > width * 0.45) continue;
          const segPhase = (caravanPhase + i * 0.27 + cIdx * 0.13) % 1;
          const cx = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * segPhase;
          const cy = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * segPhase;
          ctx.globalAlpha = 0.95;
          ctx.beginPath();
          ctx.arc(cx, cy, 3.1 / transform.k, 0, Math.PI * 2);
          ctx.fillStyle = '#FEF08A';
          ctx.fill();
          ctx.lineWidth = 1.0 / transform.k;
          ctx.strokeStyle = '#0F172A';
          ctx.stroke();
        }
        ctx.restore();
      });
    }

    // Draw Anchor Medallions on Active Straits
    activeStraits.forEach((st) => {
      const anchorPt = projection(st.def.anchorCoord);
      if (!anchorPt) return;

      const playerControls = (st.ownerTollShares[playerNationId] || 0) > 0;
      const radius = (mapMode === 'ECONOMIC' ? 8.5 : 6.8) / transform.k;

      ctx.save();
      ctx.beginPath();
      ctx.arc(anchorPt[0], anchorPt[1], radius, 0, Math.PI * 2);
      ctx.fillStyle = st.isContestedByWar
        ? 'rgba(127, 29, 29, 0.92)'
        : playerControls
        ? 'rgba(6, 78, 59, 0.92)'
        : 'rgba(15, 23, 42, 0.88)';
      ctx.fill();
      ctx.lineWidth = 1.4 / transform.k;
      ctx.strokeStyle = st.isContestedByWar
        ? '#F87171'
        : playerControls
        ? '#FBBF24'
        : '#38BDF8';
      ctx.stroke();

      ctx.font = `700 ${(mapMode === 'ECONOMIC' ? 9.5 : 8.0) / transform.k}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = playerControls ? '#FDE68A' : '#E0F2FE';
      ctx.fillText('⚓', anchorPt[0], anchorPt[1]);
      ctx.restore();
    });
  }

  // 3. Neighbor target link lines in Army Order Mode
  if (sourceOrderTerritory) {
    const pFrom = projection(sourceOrderTerritory.centroid);
    if (pFrom) {
      sourceOrderTerritory.neighbors.forEach((nId) => {
        const nTerr = territories[nId];
        if (!nTerr) return;
        const pTo = projection(nTerr.centroid);
        if (!pTo) return;

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4 / transform.k, 4 / transform.k]);
        ctx.moveTo(pFrom[0], pFrom[1]);
        ctx.lineTo(pTo[0], pTo[1]);
        ctx.lineWidth = 1.7 / transform.k;
        ctx.strokeStyle =
          nTerr.ownerId === playerNationId ? '#38BDF8' : '#F59E0B';
        ctx.stroke();
        ctx.restore();
      });
    }
  }

  // Exit World Space back to crisp Screen Space
  ctx.restore();
}

/**
 * Lightweight Dynamic Layer for Active Army Movements.
 * Runs in <0.2ms on top of the cached base polygon canvas so AI & Player army movements run at locked 60 FPS!
 */
export function renderArmyMovementsLayer(params: {
  ctx: CanvasRenderingContext2D;
  transform: { k: number; x: number; y: number };
  territories: Record<string, Territory>;
  nations: Record<string, Nation>;
  movements: ArmyMovement[];
  projection: GeoProjection;
  playerNationId: string;
  fogOfWarEnabled: boolean;
  visibleTerritoryIds: Set<string>;
}): void {
  const {
    ctx,
    transform,
    territories,
    nations,
    movements,
    projection,
    playerNationId,
    fogOfWarEnabled,
    visibleTerritoryIds,
  } = params;

  if (movements.length === 0) return;

  ctx.save();
  ctx.translate(transform.x, transform.y);
  ctx.scale(transform.k, transform.k);

  movements.forEach((mv) => {
    if (
      fogOfWarEnabled &&
      mv.ownerId !== playerNationId &&
      !visibleTerritoryIds.has(mv.fromTerritoryId) &&
      !visibleTerritoryIds.has(mv.toTerritoryId)
    ) {
      return;
    }

    const fromT = territories[mv.fromTerritoryId];
    const toT = territories[mv.toTerritoryId];
    if (!fromT || !toT) return;

    const p1 = projection(fromT.centroid);
    const p2 = projection(toT.centroid);
    if (!p1 || !p2) return;

    const curX = p1[0] + (p2[0] - p1[0]) * (mv.progress / 100);
    const curY = p1[1] + (p2[1] - p1[1]) * (mv.progress / 100);
    const isPlayerArmy = mv.ownerId === playerNationId;
    const mvOwner = nations[mv.ownerId];

    // Draw remaining multi-hop A* routeQueue trajectory ahead of current leg!
    if (mv.routeQueue && mv.routeQueue.length > 0) {
      ctx.save();
      ctx.setLineDash([4 / transform.k, 3 / transform.k]);
      ctx.beginPath();
      ctx.moveTo(p2[0], p2[1]);
      let prevPt: [number, number] | null = p2;
      for (const hopId of mv.routeQueue) {
        const hopT = territories[hopId];
        const hopPt = hopT ? projection(hopT.centroid) : null;
        if (hopPt && prevPt) {
          ctx.lineTo(hopPt[0], hopPt[1]);
          prevPt = hopPt;
        }
      }
      ctx.lineWidth = 2.0 / transform.k;
      ctx.strokeStyle = mv.isAttack
        ? 'rgba(248, 113, 113, 0.9)'
        : isPlayerArmy
        ? 'rgba(52, 211, 153, 0.9)'
        : 'rgba(56, 189, 248, 0.85)';
      ctx.stroke();
      ctx.restore();
    }

    // Main marching vector line
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineWidth = 2.8 / transform.k;
    ctx.strokeStyle = mv.isAttack
      ? '#EF4444'
      : isPlayerArmy
      ? '#10B981'
      : '#38BDF8';
    ctx.stroke();

    // Directional Arrowhead at target end of current leg
    const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
    const headLen = 7.5 / transform.k;
    const midX = p1[0] + (p2[0] - p1[0]) * 0.72;
    const midY = p1[1] + (p2[1] - p1[1]) * 0.72;
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(
      midX - headLen * Math.cos(angle - Math.PI / 6),
      midY - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      midX - headLen * Math.cos(angle + Math.PI / 6),
      midY - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = mv.isAttack
      ? '#F87171'
      : isPlayerArmy
      ? '#34D399'
      : '#38BDF8';
    ctx.fill();

    // AoH3-Style Floating Marching Soldier Figure + Flag & Counter Pill at (curX, curY)
    ctx.save();
    ctx.translate(curX, curY);
    ctx.scale(1 / transform.k, 1 / transform.k);

    const troopLabel = `${mv.isAttack ? '⚔' : '🛡'} ${(mv.troops / 1000).toFixed(1)}B`;
    const flagStr = (mvOwner?.flagCode || 'ORD').slice(0, 3);
    const pillW = 68;
    const pillH = 20;

    // 1. Animated Marching AoH3 Soldier + Waving National Flag Standard Above Counter
    drawAoH3SoldierUnitOnCanvas(ctx, 0, -pillH / 2 - 2, 0.88, {
      nationId: mv.ownerId,
      flagCode: flagStr,
      nationColor: mvOwner?.color || '#E11D48',
      isPlayer: isPlayerArmy,
      isEnemy: mv.isAttack && !isPlayerArmy,
      isMarching: true,
      facingLeft: p2[0] < p1[0],
      animPhase: (mv.progress % 20) / 20,
    });

    // 2. Outer glow
    ctx.fillStyle = mv.isAttack
      ? 'rgba(239, 68, 68, 0.38)'
      : isPlayerArmy
      ? 'rgba(16, 185, 129, 0.38)'
      : 'rgba(56, 189, 248, 0.3)';
    ctx.beginPath();
    ctx.roundRect(-pillW / 2 - 2, -pillH / 2 - 2, pillW + 4, pillH + 4, 6);
    ctx.fill();

    // 3. Pill background
    ctx.fillStyle = mv.isAttack
      ? 'rgba(127, 29, 29, 0.97)'
      : isPlayerArmy
      ? 'rgba(6, 78, 59, 0.97)'
      : 'rgba(15, 23, 42, 0.96)';
    ctx.strokeStyle = mv.isAttack
      ? '#FCA5A5'
      : isPlayerArmy
      ? '#FBBF24'
      : '#38BDF8';
    ctx.lineWidth = 1.65;
    ctx.beginPath();
    ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, 4.5);
    ctx.fill();
    ctx.stroke();

    // 4. Graphical National Flag on Left of Marching Pill
    drawNationFlagOnCanvas(
      ctx,
      -pillW / 2 + 1.5,
      -pillH / 2 + 1.5,
      23,
      pillH - 3,
      mv.ownerId,
      flagStr,
      mvOwner?.color || '#E11D48'
    );

    // 5. Troop count on right
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = isPlayerArmy ? '#FEF08A' : '#FFFFFF';
    ctx.fillText(troopLabel, 11.5, -1);

    // 6. Live Progress bar at bottom of moving army pill
    const progW = Math.max(2, ((pillW - 27) * Math.min(100, mv.progress)) / 100);
    ctx.fillStyle = mv.isAttack ? '#FB7185' : '#34D399';
    ctx.fillRect(-pillW / 2 + 25, pillH / 2 - 3, progW, 2);

    ctx.restore();
  });

  ctx.restore();
}
