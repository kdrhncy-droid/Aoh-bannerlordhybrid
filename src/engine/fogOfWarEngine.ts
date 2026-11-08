import {
  ActiveBattle,
  ArmyMovement,
  DiplomaticRelation,
  Nation,
  Territory,
} from '../types/game';
import { PRESET_COUNTRIES_2026 } from '../data/world2026Data';
import { relationKey } from './worldBuilder';

export interface MapLODConfig {
  /** Zoom < 2.6: Foreign countries show their Country Name (e.g. "İran", "Almanya") instead of city/province names */
  showAllProvinceNames: boolean;
  /** Zoom >= 1.95: Show player's own province names and border army badges */
  showTacticalDetails: boolean;
  /** Zoom >= 1.55: Show medium/minor country names in addition to major powers */
  showMinorCountryNames: boolean;
}

/**
 * Age of History 3 style 3-Tier Zoom Level-of-Detail (LOD):
 * - Tier 1 (k < 1.95): Strategic World View — ONLY Country Names (no city names, no ★ capitals, no army badges).
 * - Tier 2 (1.95 <= k < 2.6): Regional View — Player's own provinces & visible border armies appear; foreign countries still show Country Names only.
 * - Tier 3 (k >= 2.6): Close Tactical View — Individual province & capital city names + visible army badges appear.
 */
export function getMapLODConfig(zoomK: number): MapLODConfig {
  return {
    showMinorCountryNames: zoomK >= 1.55,
    showTacticalDetails: zoomK >= 1.95,
    showAllProvinceNames: zoomK >= 2.6,
  };
}

export function isImportantCountry(nationId: string): boolean {
  return Boolean(PRESET_COUNTRIES_2026[nationId]);
}

export interface ScreenBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Checks whether a candidate screen-space bounding box overlaps with any already-placed label box.
 * Prevents any text or garrison badge overlap on small mobile viewports!
 */
export function hasScreenBoxOverlap(
  box: ScreenBox,
  placedBoxes: ScreenBox[],
  padding = 4
): boolean {
  const minX = box.minX - padding;
  const minY = box.minY - padding;
  const maxX = box.maxX + padding;
  const maxY = box.maxY + padding;

  for (let i = 0; i < placedBoxes.length; i++) {
    const b = placedBoxes[i];
    if (minX < b.maxX && maxX > b.minX && minY < b.maxY && maxY > b.minY) {
      return true;
    }
  }
  return false;
}

/**
 * Computes the set of Territory IDs where the player has active military intelligence (Line of Sight / Fog of War).
 */
export function computeVisibleTerritoryIds(
  territories: Record<string, Territory>,
  nations: Record<string, Nation>,
  relations: Record<string, DiplomaticRelation>,
  movements: ArmyMovement[],
  battles: ActiveBattle[],
  playerNationId: string
): Set<string> {
  const visible = new Set<string>();
  const playerNation = nations[playerNationId];

  // If player unlocked Quantum & Satellite Intelligence (sci_3), all territories are visible
  if (playerNation?.unlockedTechs?.includes('sci_3')) {
    Object.keys(territories).forEach((id) => visible.add(id));
    return visible;
  }

  // Step 1: Collect friendly territories (player + allies + vassals)
  const friendlyTerritories: Territory[] = [];

  Object.values(territories).forEach((t) => {
    if (t.ownerId === playerNationId) {
      visible.add(t.id);
      friendlyTerritories.push(t);
      return;
    }

    const owner = nations[t.ownerId];
    const rel = relations[relationKey(playerNationId, t.ownerId)];
    if (
      rel?.isAllied ||
      rel?.hasMilitaryAccess ||
      owner?.vassalOf === playerNationId
    ) {
      visible.add(t.id);
      friendlyTerritories.push(t);
    }
  });

  // Step 2: Add 1-hop border neighbors of all friendly territories (Border Recon)
  friendlyTerritories.forEach((ft) => {
    ft.neighbors.forEach((neighborId) => {
      visible.add(neighborId);
    });
  });

  // Step 3: Add territories where player armies are marching or fighting
  movements.forEach((mv) => {
    if (mv.ownerId === playerNationId) {
      visible.add(mv.fromTerritoryId);
      visible.add(mv.toTerritoryId);
    }
  });

  battles.forEach((b) => {
    if (
      b.attackerId === playerNationId ||
      b.defenderId === playerNationId
    ) {
      visible.add(b.territoryId);
    }
  });

  return visible;
}
