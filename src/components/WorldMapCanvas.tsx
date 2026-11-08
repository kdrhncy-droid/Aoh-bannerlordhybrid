import React, { useCallback, useEffect, useRef, useState } from 'react';
import { geoNaturalEarth1 } from 'd3-geo';
import { Compass, Crosshair, ZoomIn, ZoomOut } from 'lucide-react';
import { computeVisibleTerritoryIds } from '../engine/fogOfWarEngine';
import { GeoCountryFeature } from '../engine/worldBuilder';
import { renderMapLabelsAndBattles } from '../map/mapLabelsAndUnitsRenderer';
import {
  renderArmyMovementsLayer,
  renderOceanAndPolygons,
} from '../map/mapPolygonRenderer';
import {
  buildMapGeometryCache,
  getBaseProjectionScale,
  hitTestTerritoryAtPoint,
  MapGeometryCache,
  queryVisibleFeatures,
} from '../map/spatialIndex';
import { useMapGestures } from '../map/useMapGestures';
import {
  ActiveBattle,
  ActiveWar,
  ArmyMovement,
  DiplomaticRelation,
  MapMode,
  Nation,
  Territory,
} from '../types/game';

interface WorldMapCanvasProps {
  features: GeoCountryFeature[];
  territories: Record<string, Territory>;
  nations: Record<string, Nation>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  battles: ActiveBattle[];
  movements: ArmyMovement[];
  playerNationId: string;
  selectedTerritoryId: string | null;
  armyOrderSourceId: string | null;
  mapMode: MapMode;
  fogOfWarEnabled?: boolean;
  showZoomControls?: boolean;
  onSelectTerritory: (territoryId: string | null) => void;
  onExecuteArmyMove: (fromId: string, toId: string) => void;
  onCancelArmyOrder: () => void;
}

export const WorldMapCanvas: React.FC<WorldMapCanvasProps> = ({
  features,
  territories,
  nations,
  relations,
  wars,
  battles,
  movements,
  playerNationId,
  selectedTerritoryId,
  armyOrderSourceId,
  mapMode,
  fogOfWarEnabled = true,
  showZoomControls = true,
  onSelectTerritory,
  onExecuteArmyMove,
  onCancelArmyOrder,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const geometryCacheRef = useRef<MapGeometryCache | null>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseCacheDepsRef = useRef<{
    dimsKey: string;
    k: number;
    x: number;
    y: number;
    territories: Record<string, Territory>;
    nations: Record<string, Nation>;
    relations: Record<string, DiplomaticRelation>;
    wars: ActiveWar[];
    mapMode: MapMode;
    playerNationId: string;
    selectedTerritoryId: string | null;
    armyOrderSourceId: string | null;
    fogOfWarEnabled: boolean;
  } | null>(null);
  const lastCenteredKeyRef = useRef<string>('');
  const [viewportRevision, setViewportRevision] = useState(0);

  // Latest click context ref so gesture callback never goes stale across renders
  const clickContextRef = useRef({
    features,
    territories,
    armyOrderSourceId,
    onExecuteArmyMove,
    onSelectTerritory,
    transform: { k: 1.85, x: 0, y: 0 },
  });

  const handleCanvasTap = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const cache = geometryCacheRef.current;
    if (!canvas || !container || !cache) return;

    const ctxState = clickContextRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const width = container.clientWidth || 1024;
    const height = container.clientHeight || 640;
    const { k, x, y } = ctxState.transform;

    const mapX = (clickX - x) / k;
    const mapY = (clickY - y) / k;

    const baseScale = getBaseProjectionScale(width, height);
    const projection = geoNaturalEarth1()
      .scale(baseScale)
      .translate([width / 2, height / 2]);

    const coords = projection.invert?.([mapX, mapY]) as [number, number] | null;
    if (!coords) return;

    // O(log N) RBush hit-test for province polygon — instant AoH3 response!
    const hitId = hitTestTerritoryAtPoint({
      cache,
      features: ctxState.features,
      territories: ctxState.territories,
      projection,
      mapX,
      mapY,
      coords,
      zoomK: k,
    });

    if (hitId) {
      if (ctxState.armyOrderSourceId && ctxState.armyOrderSourceId !== hitId) {
        ctxState.onExecuteArmyMove(ctxState.armyOrderSourceId, hitId);
        return;
      }
      ctxState.onSelectTerritory(hitId);
    } else {
      ctxState.onSelectTerritory(null);
    }
  }, []);

  const { transform, centerOnTerritory, reprojectOnResize, zoomBy, handlers } =
    useMapGestures({
      canvasRef,
      containerRef,
      territories,
      onTapClientPoint: handleCanvasTap,
    });

  clickContextRef.current = {
    features,
    territories,
    armyOrderSourceId,
    onExecuteArmyMove,
    onSelectTerritory,
    transform,
  };

  // Preserve exact geographic center when user rotates phone between Portrait and Landscape!
  const prevSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    prevSizeRef.current = { w: el.clientWidth, h: el.clientHeight };
    const ro = new ResizeObserver(() => {
      const nw = el.clientWidth;
      const nh = el.clientHeight;
      const { w: pw, h: ph } = prevSizeRef.current;
      if (pw > 0 && ph > 0 && (pw !== nw || ph !== nh)) {
        reprojectOnResize(pw, ph, nw, nh);
      }
      prevSizeRef.current = { w: nw, h: nh };
      setViewportRevision((v) => v + 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [reprojectOnResize]);

  // Center on capital once when campaign starts or nation changes
  useEffect(() => {
    const key = `${playerNationId}_${features.length}`;
    if (
      playerNationId &&
      territories[playerNationId] &&
      lastCenteredKeyRef.current !== key
    ) {
      lastCenteredKeyRef.current = key;
      centerOnTerritory(playerNationId, 2.2);
    }
  }, [playerNationId, features.length, territories, centerOnTerritory]);

  // Main 2D Canvas Render Pass (with Offscreen Base Polygon Layer Caching for 60 FPS Army Movements!)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 1024;
    const height = container.clientHeight || 640;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelW = Math.round(width * dpr);
    const pixelH = Math.round(height * dpr);

    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseScale = getBaseProjectionScale(width, height);
    const projection = geoNaturalEarth1()
      .scale(baseScale)
      .translate([width / 2, height / 2]);

    const dimsKey = `${width}x${height}_${features.length}`;
    if (
      !geometryCacheRef.current ||
      geometryCacheRef.current.dimsKey !== dimsKey
    ) {
      geometryCacheRef.current = buildMapGeometryCache(
        dimsKey,
        features,
        projection
      );
    }

    const cache = geometryCacheRef.current;
    const visibleFeatures = queryVisibleFeatures(
      cache,
      width,
      height,
      transform
    );
    const visibleTerritoryIds = computeVisibleTerritoryIds(
      territories,
      nations,
      relations,
      movements,
      battles,
      playerNationId
    );

    if (!baseCanvasRef.current) {
      baseCanvasRef.current = document.createElement('canvas');
    }
    const baseCanvas = baseCanvasRef.current;
    if (baseCanvas.width !== pixelW || baseCanvas.height !== pixelH) {
      baseCanvas.width = pixelW;
      baseCanvas.height = pixelH;
      baseCacheDepsRef.current = null;
    }

    const prevDeps = baseCacheDepsRef.current;
    const canReuseBaseCanvas =
      prevDeps !== null &&
      mapMode !== 'ECONOMIC' &&
      prevDeps.dimsKey === dimsKey &&
      prevDeps.k === transform.k &&
      prevDeps.x === transform.x &&
      prevDeps.y === transform.y &&
      prevDeps.territories === territories &&
      prevDeps.nations === nations &&
      prevDeps.relations === relations &&
      prevDeps.wars === wars &&
      prevDeps.mapMode === mapMode &&
      prevDeps.playerNationId === playerNationId &&
      prevDeps.selectedTerritoryId === selectedTerritoryId &&
      prevDeps.armyOrderSourceId === armyOrderSourceId &&
      prevDeps.fogOfWarEnabled === fogOfWarEnabled;

    if (!canReuseBaseCanvas) {
      const baseCtx = baseCanvas.getContext('2d');
      if (baseCtx) {
        baseCtx.save();
        baseCtx.setTransform(1, 0, 0, 1, 0, 0);
        baseCtx.clearRect(0, 0, pixelW, pixelH);
        baseCtx.scale(dpr, dpr);

        renderOceanAndPolygons({
          ctx: baseCtx,
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
        });

        baseCtx.restore();
        baseCacheDepsRef.current = {
          dimsKey,
          k: transform.k,
          x: transform.x,
          y: transform.y,
          territories,
          nations,
          relations,
          wars,
          mapMode,
          playerNationId,
          selectedTerritoryId,
          armyOrderSourceId,
          fogOfWarEnabled,
        };
      }
    }

    // 1. Blit cached base polygon layer in <0.1ms
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(baseCanvas, 0, 0);
    ctx.scale(dpr, dpr);

    // 2. Draw dynamic marching armies layer
    renderArmyMovementsLayer({
      ctx,
      transform,
      territories,
      nations,
      movements,
      projection,
      playerNationId,
      fogOfWarEnabled,
      visibleTerritoryIds,
    });

    // 3. Draw dynamic province labels, army shields, and AoH3 live on-map battle widgets
    renderMapLabelsAndBattles({
      ctx,
      width,
      height,
      transform,
      visibleFeatures,
      territories,
      nations,
      relations,
      wars,
      battles,
      projection,
      mapMode,
      playerNationId,
      selectedTerritoryId,
      armyOrderSourceId,
      fogOfWarEnabled,
      visibleTerritoryIds,
    });

    ctx.restore();
  }, [
    armyOrderSourceId,
    battles,
    features,
    fogOfWarEnabled,
    mapMode,
    movements,
    nations,
    playerNationId,
    relations,
    selectedTerritoryId,
    territories,
    transform,
    viewportRevision,
    wars,
  ]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#071B34]">
      <canvas
        ref={canvasRef}
        {...handlers}
        className="w-full h-full cursor-grab active:cursor-grabbing block touch-none"
      />

      {armyOrderSourceId && territories[armyOrderSourceId] && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-950/95 border border-amber-500/50 text-amber-100 shadow-xl max-w-[94vw]">
          <Crosshair className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-medium truncate">
            <strong>{territories[armyOrderSourceId].name}</strong> ordusu için hedef eyalete dokunun (Akıllı rota aktif)
          </span>
          <button
            onClick={onCancelArmyOrder}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700 whitespace-nowrap shrink-0"
          >
            İptal
          </button>
        </div>
      )}

      {showZoomControls && (
        <div className="hud-zoom-dock absolute right-3 bottom-6 z-20 flex flex-col gap-1.5 bg-slate-900/95 p-1.5 rounded-2xl border border-slate-800 shadow-lg">
          <button
            onClick={() => zoomBy(1.35)}
            title="Yakınlaştır"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-200 hover:bg-slate-800 active:scale-95 transition-transform"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => zoomBy(0.74)}
            title="Uzaklaştır"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-200 hover:bg-slate-800 active:scale-95 transition-transform"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => centerOnTerritory(playerNationId, 2.4)}
            title="Başkente Odakla"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-amber-400 hover:bg-slate-800 active:scale-95 transition-transform"
          >
            <Compass className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
