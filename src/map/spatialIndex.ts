import { geoContains, geoGraticule10, GeoProjection, geoPath } from 'd3-geo';
import RBush from 'rbush';
import { Territory } from '../types/game';
import { GeoCountryFeature } from '../engine/worldBuilder';

export interface SpatialFeatureItem {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  id: string;
  feature: GeoCountryFeature;
}

export interface MapGeometryCache {
  dimsKey: string;
  paths: Record<string, Path2D>;
  spherePath: Path2D | null;
  graticulePath: Path2D | null;
  spatialTree: RBush<SpatialFeatureItem>;
}

export function getBaseProjectionScale(width: number, height: number): number {
  return Math.max(150, Math.min(width / 4.2, height / 2.35));
}

export function buildMapGeometryCache(
  dimsKey: string,
  features: GeoCountryFeature[],
  projection: GeoProjection
): MapGeometryCache {
  const svgPathGen = geoPath(projection);
  const paths: Record<string, Path2D> = {};
  const spatialTree = new RBush<SpatialFeatureItem>();
  const bulkItems: SpatialFeatureItem[] = [];

  features.forEach((feat) => {
    const dStr = svgPathGen(feat);
    if (!dStr) return;
    paths[feat.id] = new Path2D(dStr);

    const bounds = svgPathGen.bounds(feat);
    if (
      bounds &&
      Number.isFinite(bounds[0][0]) &&
      Number.isFinite(bounds[0][1]) &&
      Number.isFinite(bounds[1][0]) &&
      Number.isFinite(bounds[1][1])
    ) {
      bulkItems.push({
        minX: bounds[0][0],
        minY: bounds[0][1],
        maxX: bounds[1][0],
        maxY: bounds[1][1],
        id: feat.id,
        feature: feat,
      });
    }
  });

  spatialTree.load(bulkItems);

  const sphereStr = svgPathGen({ type: 'Sphere' });
  const gratStr = svgPathGen(geoGraticule10());

  return {
    dimsKey,
    paths,
    spherePath: sphereStr ? new Path2D(sphereStr) : null,
    graticulePath: gratStr ? new Path2D(gratStr) : null,
    spatialTree,
  };
}

export function queryVisibleFeatures(
  cache: MapGeometryCache,
  width: number,
  height: number,
  transform: { k: number; x: number; y: number }
): GeoCountryFeature[] {
  const pad = 40 / transform.k;
  const viewMinX = -transform.x / transform.k - pad;
  const viewMinY = -transform.y / transform.k - pad;
  const viewMaxX = (width - transform.x) / transform.k + pad;
  const viewMaxY = (height - transform.y) / transform.k + pad;

  return cache.spatialTree
    .search({
      minX: viewMinX,
      minY: viewMinY,
      maxX: viewMaxX,
      maxY: viewMaxY,
    })
    .map((item) => item.feature);
}

export function hitTestTerritoryAtPoint(params: {
  cache: MapGeometryCache;
  features: GeoCountryFeature[];
  territories: Record<string, Territory>;
  projection: GeoProjection;
  mapX: number;
  mapY: number;
  coords: [number, number];
  zoomK: number;
}): string | null {
  const { cache, territories, projection, mapX, mapY, coords, zoomK } = params;

  // 1. O(log N) RBush spatial query for candidate polygons containing [mapX, mapY]
  const candidates = cache.spatialTree.search({
    minX: mapX - 2,
    minY: mapY - 2,
    maxX: mapX + 2,
    maxY: mapY + 2,
  });

  for (const item of candidates) {
    if (geoContains(item.feature, coords)) {
      return item.id;
    }
  }

  // 2. Fallback: nearest island/small-province centroid within tap radius using RBush box
  const searchRadius = 38 / zoomK;
  const nearby = cache.spatialTree.search({
    minX: mapX - searchRadius,
    minY: mapY - searchRadius,
    maxX: mapX + searchRadius,
    maxY: mapY + searchRadius,
  });

  let bestId: string | null = null;
  let bestDist = searchRadius;

  nearby.forEach((item) => {
    const t = territories[item.id];
    if (!t) return;
    const pt = projection(t.centroid);
    if (!pt) return;
    const d = Math.hypot(pt[0] - mapX, pt[1] - mapY);
    if (d < bestDist) {
      bestDist = d;
      bestId = item.id;
    }
  });

  return bestId;
}
