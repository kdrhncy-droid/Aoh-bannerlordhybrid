import {
  ActiveWar,
  DiplomaticRelation,
  Nation,
  Territory,
} from '../types/game';
import { getOrCreateRelation, isAtWar } from './simulationEngine';
import { checkStraitMilitaryBlockade } from './straitsAndTradeEngine';

export interface PathfindingResult {
  reachable: boolean;
  /** Ordered list of territory IDs AFTER fromId, ending at toId (e.g. [step1, step2, ..., toId]) */
  hops: string[];
  blockedReason?: string;
}

function geoDistApprox(a: [number, number], b: [number, number]): number {
  let dLon = Math.abs(a[0] - b[0]);
  if (dLon > 180) dLon = 360 - dLon;
  const dLat = a[1] - b[1];
  return Math.hypot(dLon, dLat);
}

/**
 * Checks whether `moverNationId` can legally enter `terr` during a multi-province march.
 * - Friendly / Allied / Vassal / Military Access provinces: traversable & can continue further.
 * - Hostile (at war) provinces, OR explicit target `toId` when initiating war: enterable as a terminal attack step (Zone of Control stops further pass-through until conquered).
 */
export function classifyTerritoryTraversal(params: {
  terr: Territory;
  toId: string;
  moverNationId: string;
  nations: Record<string, Nation>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  allowTargetWarDeclaration?: boolean;
}): 'FRIENDLY_PASS' | 'HOSTILE_STOP' | 'BLOCKED' {
  const {
    terr,
    toId,
    moverNationId,
    nations,
    relations,
    wars,
    allowTargetWarDeclaration = true,
  } = params;

  if (terr.ownerId === moverNationId) {
    return 'FRIENDLY_PASS';
  }

  const owner = nations[terr.ownerId];
  const mover = nations[moverNationId];
  if (
    owner?.vassalOf === moverNationId ||
    mover?.vassalOf === terr.ownerId
  ) {
    return 'FRIENDLY_PASS';
  }

  if (isAtWar(wars, moverNationId, terr.ownerId)) {
    return 'HOSTILE_STOP';
  }

  const rel = getOrCreateRelation(relations, moverNationId, terr.ownerId);
  if (rel.isAllied || rel.hasMilitaryAccess) {
    return 'FRIENDLY_PASS';
  }

  if (allowTargetWarDeclaration && terr.id === toId) {
    return 'HOSTILE_STOP';
  }

  return 'BLOCKED';
}

function terrainCostMultiplier(terrain?: Territory['terrain']): number {
  switch (terrain) {
    case 'DAGLIK':
      return 1.45;
    case 'COL':
      return 1.3;
    case 'ORMAN':
      return 1.2;
    default:
      return 1.0;
  }
}

/**
 * Pure A* shortest-path route planner across the Territory neighbor graph.
 * Eliminates the single-neighbor march limitation while enforcing Military Access & Zone of Control.
 */
export function findArmyRouteAStar(params: {
  fromId: string;
  toId: string;
  moverNationId: string;
  territories: Record<string, Territory>;
  nations: Record<string, Nation>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  allowTargetWarDeclaration?: boolean;
}): PathfindingResult {
  const {
    fromId,
    toId,
    moverNationId,
    territories,
    nations,
    relations,
    wars,
    allowTargetWarDeclaration = true,
  } = params;

  if (fromId === toId) {
    return { reachable: false, hops: [], blockedReason: 'Aynı eyalet seçildi.' };
  }

  const start = territories[fromId];
  const goal = territories[toId];
  if (!start || !goal) {
    return { reachable: false, hops: [], blockedReason: 'Bölge bulunamadı.' };
  }

  // Direct neighbor fast-path (still enforces Strait Naval Blockade!)
  if (start.neighbors.includes(toId)) {
    const straitCheck = checkStraitMilitaryBlockade({
      fromId,
      toId,
      moverNationId,
      territories,
      wars,
    });
    if (straitCheck.blocked) {
      return {
        reachable: false,
        hops: [],
        blockedReason: straitCheck.reason,
      };
    }
    return { reachable: true, hops: [toId] };
  }

  let lastStraitBlockReason: string | undefined;

  const openSet = new Set<string>([fromId]);
  const cameFrom: Record<string, string> = {};
  const gScore: Record<string, number> = { [fromId]: 0 };
  const fScore: Record<string, number> = {
    [fromId]: geoDistApprox(start.centroid, goal.centroid),
  };

  let visitedCount = 0;
  const MAX_VISITED = 600;

  while (openSet.size > 0 && visitedCount < MAX_VISITED) {
    visitedCount++;

    let currentId: string | null = null;
    let bestF = Infinity;
    for (const id of openSet) {
      const f = fScore[id] ?? Infinity;
      if (f < bestF) {
        bestF = f;
        currentId = id;
      }
    }

    if (!currentId) break;
    if (currentId === toId) {
      const hops: string[] = [];
      let cur = toId;
      while (cur !== fromId) {
        hops.push(cur);
        cur = cameFrom[cur];
        if (!cur) break;
      }
      hops.reverse();
      return { reachable: true, hops };
    }

    openSet.delete(currentId);
    const curTerr = territories[currentId];
    if (!curTerr) continue;

    // Zone of Control (ZoC): If currentId is a hostile enemy territory (and not the start),
    // the army must conquer it before marching past it into deeper enemy provinces.
    if (currentId !== fromId) {
      const curClass = classifyTerritoryTraversal({
        terr: curTerr,
        toId,
        moverNationId,
        nations,
        relations,
        wars,
        allowTargetWarDeclaration,
      });
      if (curClass === 'HOSTILE_STOP') {
        continue;
      }
    }

    for (const nbId of curTerr.neighbors) {
      const nbTerr = territories[nbId];
      if (!nbTerr) continue;

      const access = classifyTerritoryTraversal({
        terr: nbTerr,
        toId,
        moverNationId,
        nations,
        relations,
        wars,
        allowTargetWarDeclaration,
      });

      if (access === 'BLOCKED') continue;
      // Cannot use an intermediate hostile province as a transit corridor unless it IS the destination
      if (access === 'HOSTILE_STOP' && nbId !== toId) continue;

      const straitCheck = checkStraitMilitaryBlockade({
        fromId: currentId,
        toId: nbId,
        moverNationId,
        territories,
        wars,
      });
      if (straitCheck.blocked) {
        lastStraitBlockReason = straitCheck.reason;
        continue;
      }

      const stepDist = Math.max(
        1,
        geoDistApprox(curTerr.centroid, nbTerr.centroid) *
          terrainCostMultiplier(nbTerr.terrain)
      );
      const tentativeG = (gScore[currentId] ?? Infinity) + stepDist;

      if (tentativeG < (gScore[nbId] ?? Infinity)) {
        cameFrom[nbId] = currentId;
        gScore[nbId] = tentativeG;
        fScore[nbId] =
          tentativeG + geoDistApprox(nbTerr.centroid, goal.centroid);
        openSet.add(nbId);
      }
    }
  }

  return {
    reachable: false,
    hops: [],
    blockedReason:
      lastStraitBlockReason ||
      'Hedefe ulaşılabilir kara/deniz koridoru yok! (Aradaki tarafsız ülkelerden Askeri Geçiş İzni alın veya sınır kalelerini önce fethedin.)',
  };
}
