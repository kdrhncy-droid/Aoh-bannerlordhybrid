import { geoCentroid } from 'd3-geo';
import { feature, neighbors } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import worldData from 'world-atlas/countries-110m.json';
import {
  buildSeedForFeature,
  GAME_MODES,
} from '../data/world2026Data';
import {
  DiplomaticRelation,
  GameModeId,
  Nation,
  Territory,
} from '../types/game';
import {
  COUNTRY_PROVINCE_SEEDS,
  sanitizeGeoGeometry,
  subdivideCountryGeometry,
} from './polygonSubdivider';
import { determineProvinceTerrain } from './pashaAndFiefEngine';
import { transformBundleTo1440Scenario } from './scenario1440Builder';
import { STRATEGIC_STRAITS } from './straitsAndTradeEngine';

export interface GeoCountryFeature {
  type: 'Feature';
  id: string;
  properties: {
    name: string;
  };
  geometry: Geometry;
}

export interface InitialWorldBundle {
  features: GeoCountryFeature[];
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  relations: Record<string, DiplomaticRelation>;
}

export function relationKey(a: string, b: string): string {
  return a < b ? `${a}_${b}` : `${b}_${a}`;
}

export function initializeWorld2026(modeId: GameModeId): InitialWorldBundle {
  const mode = GAME_MODES.find((m) => m.id === modeId) || GAME_MODES[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topology = worldData as any;
  const geoCollection = feature(
    topology,
    topology.objects.countries
  ) as unknown as FeatureCollection<Geometry, { name: string }>;

  const rawGeometries = topology.objects.countries.geometries || [];
  const topoNeighbors: number[][] = neighbors(rawGeometries);

  const countryFeatures: GeoCountryFeature[] = [];
  const indexMap: number[] = [];

  geoCollection.features.forEach((feat, rawIdx) => {
    const rawName = feat.properties?.name || '';
    if (rawName === 'Antarctica' || String(feat.id) === '010') {
      return;
    }
    const idStr = String(feat.id || `90${rawIdx}`).padStart(3, '0');
    countryFeatures.push({
      type: 'Feature',
      id: idStr,
      properties: { name: rawName },
      geometry: sanitizeGeoGeometry(feat.geometry),
    });
    indexMap.push(rawIdx);
  });

  const rawIdxToCountryId: Record<number, string> = {};
  countryFeatures.forEach((cf, idx) => {
    rawIdxToCountryId[indexMap[idx]] = cf.id;
  });

  const nations: Record<string, Nation> = {};
  const territories: Record<string, Territory> = {};
  const provinceFeatures: GeoCountryFeature[] = [];
  const countryToProvinces: Record<string, string[]> = {};

  countryFeatures.forEach((cf, idx) => {
    const seed = buildSeedForFeature(cf.id, cf.properties.name, idx);
    const isMajorPower = seed.baseGdp >= 180;
    const totalCountryGarrison = Math.round(
      seed.garrison * (modeId === 'SANDBOX_EMPIRE' ? 1.5 : 1)
    );

    nations[cf.id] = {
      id: cf.id,
      name: seed.name,
      flagCode: seed.flagCode,
      color: seed.color,
      capitalTerritoryId: cf.id,
      ideology: seed.ideology,
      treasury: Math.round(seed.treasury * mode.startingGoldMultiplier),
      manpower: Math.round(
        seed.manpower * (modeId === 'SANDBOX_EMPIRE' ? 2.5 : 1)
      ),
      stability: 78,
      inflation: 4.2,
      researchPoints:
        modeId === 'SANDBOX_EMPIRE' ? 500 : isMajorPower ? 65 : 30,
      taxRate: 25,
      budget: {
        military: 30,
        economy: 30,
        research: 20,
        welfare: 20,
      },
      aggressiveExpansion: mode.startingTension,
      unlockedTechs: isMajorPower ? ['eco_1'] : [],
      modernizedArmyTier: 0,
      enactedReforms: [],
      recruitedGeneralIds:
        cf.id === '792'
          ? ['cmd_mete', 'cmd_selim']
          : [],
      activeGeneralId: cf.id === '792' ? 'cmd_mete' : null,
      clanInfluence: modeId === 'SANDBOX_EMPIRE' ? 350 : isMajorPower ? 140 : 90,
      bannerCalledLordIds: [],
      formedEmpireId: null,
      vassalOf: null,
      isEliminated: false,
    };

    const subSeeds = COUNTRY_PROVINCE_SEEDS[cf.id];
    if (subSeeds && subSeeds.length > 1) {
      const pieces = subdivideCountryGeometry(cf.geometry, subSeeds);
      countryToProvinces[cf.id] = [];

      pieces.forEach((piece) => {
        const provId = piece.seed.isCapital
          ? cf.id
          : `${cf.id}_${piece.seed.suffixId}`;
        countryToProvinces[cf.id].push(provId);

        const provFeature: GeoCountryFeature = {
          type: 'Feature',
          id: provId,
          properties: { name: piece.seed.name },
          geometry: piece.geometry,
        };
        provinceFeatures.push(provFeature);

        const share = piece.seed.gdpShare || 1 / pieces.length;
        const provGarrison = Math.max(
          3000,
          Math.round(totalCountryGarrison * share)
        );
        const armorCount = Math.round(
          provGarrison * (isMajorPower ? 0.22 : 0.15)
        );
        const airDroneCount = Math.round(
          provGarrison * (isMajorPower ? 0.1 : 0.05)
        );
        const infantryCount = Math.max(
          1000,
          provGarrison - armorCount - airDroneCount
        );

        const computedCentroid = geoCentroid(provFeature) as [number, number];
        const validCentroid: [number, number] =
          Number.isFinite(computedCentroid[0]) &&
          Number.isFinite(computedCentroid[1])
            ? computedCentroid
            : [piece.seed.lon, piece.seed.lat];

        const provGdp = Math.max(25, Math.round(seed.baseGdp * share * 1.15));
        const terrain = determineProvinceTerrain(
          provId,
          piece.seed.name,
          validCentroid[0],
          validCentroid[1],
          piece.seed.isCapital,
          provGdp
        );

        territories[provId] = {
          id: provId,
          name: piece.seed.name,
          ownerId: cf.id,
          coreOwnerId: cf.id,
          isCapital: Boolean(piece.seed.isCapital),
          terrain,
          fiefLordId: null,
          castleWallHp: 100,
          population: Math.round(seed.population * share),
          baseGdp: provGdp,
          resource: piece.seed.resource || seed.resource,
          buildings: {
            factory: piece.seed.isCapital && isMajorPower ? 2 : 1,
            barracks: piece.seed.isCapital ? 2 : 1,
            fortress: 1,
            university: piece.seed.isCapital && isMajorPower ? 1 : 0,
            tradeHub: piece.seed.isCapital ? 1 : 0,
            supplyDepot: 1,
          },
          garrison: infantryCount + armorCount + airDroneCount,
          units: {
            infantry: infantryCount,
            armor: armorCount,
            airDrone: airDroneCount,
          },
          unrest: 3,
          isOccupied: false,
          centroid: validCentroid,
          neighbors: [],
        };
      });
    } else {
      // Single-province country
      countryToProvinces[cf.id] = [cf.id];
      provinceFeatures.push(cf);

      const centroid = geoCentroid(cf) as [number, number];
      const validCentroid: [number, number] = Number.isFinite(centroid[0])
        ? centroid
        : [0, 0];
      const armorCount = Math.round(
        totalCountryGarrison * (isMajorPower ? 0.22 : 0.15)
      );
      const airDroneCount = Math.round(
        totalCountryGarrison * (isMajorPower ? 0.1 : 0.05)
      );
      const infantryCount = Math.max(
        1000,
        totalCountryGarrison - armorCount - airDroneCount
      );

      const terrain = determineProvinceTerrain(
        cf.id,
        seed.name,
        validCentroid[0],
        validCentroid[1],
        true,
        seed.baseGdp
      );

      territories[cf.id] = {
        id: cf.id,
        name: seed.name,
        ownerId: cf.id,
        coreOwnerId: cf.id,
        isCapital: true,
        terrain,
        fiefLordId: null,
        castleWallHp: 100,
        population: seed.population,
        baseGdp: seed.baseGdp,
        resource: seed.resource,
        buildings: {
          factory: isMajorPower ? 2 : 1,
          barracks: isMajorPower ? 2 : 1,
          fortress: 1,
          university: isMajorPower ? 1 : 0,
          tradeHub: isMajorPower ? 1 : 0,
          supplyDepot: 1,
        },
        garrison: infantryCount + armorCount + airDroneCount,
        units: {
          infantry: infantryCount,
          armor: armorCount,
          airDrone: airDroneCount,
        },
        unrest: 4,
        isOccupied: false,
        centroid: validCentroid,
        neighbors: [],
      };
    }
  });

  const linkProvinces = (idA: string, idB: string) => {
    if (!idA || !idB || idA === idB) return;
    if (!territories[idA] || !territories[idB]) return;
    if (!territories[idA].neighbors.includes(idB)) {
      territories[idA].neighbors.push(idB);
    }
    if (!territories[idB].neighbors.includes(idA)) {
      territories[idB].neighbors.push(idA);
    }
  };

  // 1. Connect sister provinces inside each multi-province country
  Object.values(countryToProvinces).forEach((provList) => {
    if (provList.length <= 1) return;
    provList.forEach((pA) => {
      const cA = territories[pA].centroid;
      const sortedSisters = provList
        .filter((pB) => pB !== pA)
        .map((pB) => {
          const cB = territories[pB].centroid;
          return {
            pB,
            distSq: (cA[0] - cB[0]) ** 2 + (cA[1] - cB[1]) ** 2,
          };
        })
        .sort((a, b) => a.distSq - b.distSq)
        .slice(0, Math.min(3, provList.length - 1));

      sortedSisters.forEach((s) => linkProvinces(pA, s.pB));
    });
  });

  // 2. Connect neighboring countries' closest border provinces
  countryFeatures.forEach((cf, idx) => {
    const rawIdx = indexMap[idx];
    const neighborCountryIds = (topoNeighbors[rawIdx] || [])
      .map((nRaw) => rawIdxToCountryId[nRaw])
      .filter((id): id is string => Boolean(id && id !== cf.id));

    const provsA = countryToProvinces[cf.id] || [cf.id];

    neighborCountryIds.forEach((otherCountryId) => {
      const provsB = countryToProvinces[otherCountryId] || [otherCountryId];
      // Find the 2 closest pairs of provinces between Country A and Country B
      const pairs: { a: string; b: string; distSq: number }[] = [];
      provsA.forEach((pA) => {
        const cA = territories[pA].centroid;
        provsB.forEach((pB) => {
          const cB = territories[pB].centroid;
          pairs.push({
            a: pA,
            b: pB,
            distSq: (cA[0] - cB[0]) ** 2 + (cA[1] - cB[1]) ** 2,
          });
        });
      });
      pairs.sort((x, y) => x.distSq - y.distSq);
      pairs.slice(0, 2).forEach((pair) => linkProvinces(pair.a, pair.b));
    });
  });

  // 3. Explicit Strategic World Straits + Maritime fallback so every province has >=2 neighbors
  STRATEGIC_STRAITS.forEach((st) => {
    st.crossingEdges.forEach(([a, b]) => linkProvinces(a, b));
  });

  const allProvIds = Object.keys(territories);
  allProvIds.forEach((pId) => {
    if (territories[pId].neighbors.length < 2) {
      const cA = territories[pId].centroid;
      allProvIds
        .filter((otherId) => otherId !== pId)
        .map((otherId) => {
          const cB = territories[otherId].centroid;
          return {
            otherId,
            distSq: (cA[0] - cB[0]) ** 2 + (cA[1] - cB[1]) ** 2,
          };
        })
        .sort((a, b) => a.distSq - b.distSq)
        .slice(0, 3)
        .forEach((item) => linkProvinces(pId, item.otherId));
    }
  });

  // Initialize key diplomatic relations
  const relations: Record<string, DiplomaticRelation> = {};
  const setPresetRelation = (
    a: string,
    b: string,
    partial: Partial<DiplomaticRelation>
  ) => {
    if (!nations[a] || !nations[b]) return;
    const key = relationKey(a, b);
    relations[key] = {
      nationA: a < b ? a : b,
      nationB: a < b ? b : a,
      score: partial.score ?? 0,
      isAllied: partial.isAllied ?? false,
      allianceType:
        partial.allianceType ?? (partial.isAllied ? 'DEFENSIVE' : null),
      hasNonAggression: partial.hasNonAggression ?? false,
      hasTradeAgreement: partial.hasTradeAgreement ?? false,
      hasEmbargo: partial.hasEmbargo ?? false,
      hasMilitaryAccess: partial.hasMilitaryAccess ?? false,
      truceUntilTick: 0,
    };
  };

  setPresetRelation('792', '031', {
    score: 90,
    isAllied: true,
    allianceType: 'OFFENSIVE',
    hasTradeAgreement: true,
    hasMilitaryAccess: true,
  });
  setPresetRelation('840', '826', {
    score: 85,
    isAllied: true,
    allianceType: 'DEFENSIVE',
    hasTradeAgreement: true,
  });
  setPresetRelation('276', '250', {
    score: 80,
    isAllied: true,
    allianceType: 'DEFENSIVE',
    hasTradeAgreement: true,
  });
  setPresetRelation('643', '156', {
    score: 70,
    hasNonAggression: true,
    hasTradeAgreement: true,
  });

  const baseBundle: InitialWorldBundle = {
    features: provinceFeatures,
    nations,
    territories,
    relations,
  };

  if (modeId === 'EMPIRES_1440') {
    return transformBundleTo1440Scenario(baseBundle);
  }

  return baseBundle;
}
