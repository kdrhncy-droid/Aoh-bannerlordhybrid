import { del, get, set } from 'idb-keyval';
import {
  ActiveBattle,
  ActiveWar,
  ArmyMovement,
  DiplomaticRelation,
  GameModeId,
  Nation,
  Territory,
  WorldNewsEvent,
} from '../types/game';
import { formatGameDate } from './simulationEngine';

export type SaveSlotId = 'AUTOSAVE' | 'SLOT_1' | 'SLOT_2' | 'SLOT_3';

export const SAVE_SCHEMA_VERSION = 5;
const STORAGE_PREFIX = 'IMPERIUM_2026_SAVE_V4_';
const META_INDEX_KEY = 'IMPERIUM_2026_SAVE_META_INDEX_V5';
const LEGACY_STORAGE_KEY = 'IMPERIUM_2026_SAVE_V3';

export interface SaveGamePayload {
  gameMode: GameModeId;
  playerNationId: string;
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
  battles: ActiveBattle[];
  movements: ArmyMovement[];
  newsEvents: WorldNewsEvent[];
  tick: number;
  hour?: number;
}

export interface SaveSlotMetadata {
  slotId: SaveSlotId;
  label: string;
  schemaVersion: number;
  savedAtIso: string;
  savedAtDisplay: string;
  playerNationId: string;
  nationName: string;
  flagCode: string;
  nationColor: string;
  gameMode: GameModeId;
  tick: number;
  gameDateStr: string;
  treasury: number;
  manpower: number;
  territoryCount: number;
}

export interface SaveSlotRecord {
  metadata: SaveSlotMetadata;
  payload: SaveGamePayload;
}

export const SAVE_SLOT_DEFINITIONS: { id: SaveSlotId; title: string; subtitle: string }[] = [
  {
    id: 'AUTOSAVE',
    title: 'Otomatik Kayıt (Auto-Save)',
    subtitle: 'Belirlenen aralıklarla otomatik güncellenir',
  },
  {
    id: 'SLOT_1',
    title: 'Kayıt Yuvası 1',
    subtitle: 'Birincil manuel sefer kaydı',
  },
  {
    id: 'SLOT_2',
    title: 'Kayıt Yuvası 2',
    subtitle: 'Alternatif strateji / ikinci ülke kaydı',
  },
  {
    id: 'SLOT_3',
    title: 'Kayıt Yuvası 3',
    subtitle: 'Yedek sefer veya savaş öncesi kayıt',
  },
];

// Fast in-memory cache backed by IndexedDB (idb-keyval) so UI reads are synchronous & storage is virtually unlimited on Android PWA
const slotRecordCache: Partial<Record<SaveSlotId, SaveSlotRecord>> = {};

function getSlotStorageKey(slotId: SaveSlotId): string {
  return `${STORAGE_PREFIX}${slotId}`;
}

function readMetaIndex(): Partial<Record<SaveSlotId, SaveSlotMetadata>> {
  try {
    const raw = localStorage.getItem(META_INDEX_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeMetaIndex(index: Partial<Record<SaveSlotId, SaveSlotMetadata>>): void {
  try {
    localStorage.setItem(META_INDEX_KEY, JSON.stringify(index));
  } catch {
    // ignore
  }
}

export function buildSaveMetadata(
  slotId: SaveSlotId,
  payload: SaveGamePayload
): SaveSlotMetadata {
  const playerNation =
    payload.nations[payload.playerNationId] || Object.values(payload.nations)[0];
  const territoryCount = Object.values(payload.territories).filter(
    (t) => t.ownerId === payload.playerNationId
  ).length;
  const now = new Date();
  const slotDef = SAVE_SLOT_DEFINITIONS.find((s) => s.id === slotId);

  return {
    slotId,
    label: slotDef?.title || slotId,
    schemaVersion: SAVE_SCHEMA_VERSION,
    savedAtIso: now.toISOString(),
    savedAtDisplay: now.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    playerNationId: payload.playerNationId,
    nationName: playerNation?.name || 'Bilinmeyen İmparatorluk',
    flagCode: playerNation?.flagCode || 'TR',
    nationColor: playerNation?.color || '#E11D48',
    gameMode: payload.gameMode || 'EMPIRES_1440',
    tick: payload.tick || 0,
    gameDateStr: formatGameDate(payload.tick || 0, payload.gameMode),
    treasury: playerNation?.treasury || 0,
    manpower: playerNation?.manpower || 0,
    territoryCount,
  };
}

// Warm up IndexedDB cache and automatically migrate any legacy localStorage saves into IndexedDB
export async function initSaveStorage(): Promise<void> {
  if (typeof window === 'undefined') return;
  const metaIdx = readMetaIndex();
  let indexUpdated = false;

  for (const def of SAVE_SLOT_DEFINITIONS) {
    const key = getSlotStorageKey(def.id);
    try {
      const idbRec = await get<SaveSlotRecord>(key);
      if (idbRec?.payload?.nations) {
        slotRecordCache[def.id] = idbRec;
        if (!metaIdx[def.id]) {
          metaIdx[def.id] = idbRec.metadata;
          indexUpdated = true;
        }
        continue;
      }
    } catch {
      // Fallback to localStorage below if IndexedDB unavailable
    }

    // Migrate from localStorage if present
    try {
      const legacyRaw = localStorage.getItem(key);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw) as SaveSlotRecord;
        if (parsed?.payload?.nations) {
          slotRecordCache[def.id] = parsed;
          metaIdx[def.id] = parsed.metadata;
          indexUpdated = true;
          await set(key, parsed).catch(() => {});
          // Free heavy localStorage quota once safely stored in IndexedDB
          localStorage.removeItem(key);
        }
      }
    } catch {
      // ignore
    }
  }

  if (indexUpdated) {
    writeMetaIndex(metaIdx);
  }
}

// Trigger non-blocking IndexedDB warm-up immediately when module loads in browser
if (typeof window !== 'undefined') {
  initSaveStorage().catch(() => {});
}

// Safely merges a saved payload with the current world baseline so new cities/provinces or corrupted fields never break older saves
export function hydrateSavedPayload(
  rawPayload: SaveGamePayload,
  baselineNations: Record<string, Nation>,
  baselineTerritories: Record<string, Territory>
): SaveGamePayload {
  const mergedNations: Record<string, Nation> = { ...baselineNations };
  Object.entries(rawPayload.nations || {}).forEach(([nId, savedN]) => {
    if (!savedN) return;
    const baseN = baselineNations[nId];
    if (!baseN && Object.keys(baselineNations).length > 0) {
      // Do not import nations from a different scenario that don't belong to this scenario's baseline
      return;
    }
    const merged = baseN ? { ...baseN, ...savedN } : savedN;
    const researchProgressByTech: Record<string, number> = {};
    const savedResearchProgress = merged.researchProgressByTech;
    if (savedResearchProgress && typeof savedResearchProgress === 'object' && !Array.isArray(savedResearchProgress)) {
      Object.entries(savedResearchProgress).forEach(([techId, progress]) => {
        if (Number.isFinite(progress) && progress >= 0) {
          researchProgressByTech[techId] = progress;
        }
      });
    }
    const activeResearch = merged.activeResearch;
    if (
      activeResearch &&
      typeof activeResearch.techId === 'string' &&
      Number.isFinite(activeResearch.progress)
    ) {
      researchProgressByTech[activeResearch.techId] = Math.max(0, activeResearch.progress);
    }
    mergedNations[nId] = {
      ...merged,
      treasury: Number.isFinite(merged.treasury) ? merged.treasury : 1200,
      manpower: Number.isFinite(merged.manpower) ? merged.manpower : 50000,
      stability: Number.isFinite(merged.stability) ? merged.stability : 75,
      inflation: Number.isFinite(merged.inflation) ? merged.inflation : 2.5,
      researchPoints: Number.isFinite(merged.researchPoints)
        ? merged.researchPoints
        : 60,
      researchProgressByTech,
      taxRate: Number.isFinite(merged.taxRate) ? merged.taxRate : 25,
      unlockedTechs: Array.isArray(merged.unlockedTechs)
        ? merged.unlockedTechs
        : ['eco_1'],
      enactedReforms: Array.isArray(merged.enactedReforms)
        ? merged.enactedReforms
        : [],
      recruitedGeneralIds: Array.isArray(merged.recruitedGeneralIds)
        ? merged.recruitedGeneralIds
        : [],
      bannerCalledLordIds: Array.isArray(merged.bannerCalledLordIds)
        ? merged.bannerCalledLordIds
        : [],
    };
  });

  const fallbackNationId =
    mergedNations[rawPayload.playerNationId]?.id ||
    Object.keys(mergedNations)[0] ||
    '792';

  const mergedTerritories: Record<string, Territory> = {
    ...baselineTerritories,
  };
  Object.entries(rawPayload.territories || {}).forEach(([tId, savedT]) => {
    if (!savedT) return;
    const baseT = baselineTerritories[tId];
    if (!baseT && Object.keys(baselineTerritories).length > 0) {
      return;
    }
    const rawOwner = savedT.ownerId;
    const safeOwnerId = mergedNations[rawOwner]
      ? rawOwner
      : baseT?.ownerId && mergedNations[baseT.ownerId]
      ? baseT.ownerId
      : fallbackNationId;
    const rawCore = savedT.coreOwnerId;
    const safeCoreId = mergedNations[rawCore] ? rawCore : safeOwnerId;

    if (baseT) {
      mergedTerritories[tId] = {
        ...baseT,
        ...savedT,
        ownerId: safeOwnerId,
        coreOwnerId: safeCoreId,
        garrison: Number.isFinite(savedT.garrison)
          ? Math.max(0, savedT.garrison)
          : baseT.garrison,
        unrest: Number.isFinite(savedT.unrest)
          ? Math.max(0, Math.min(100, savedT.unrest))
          : 5,
        buildings: {
          ...baseT.buildings,
          ...(savedT.buildings || {}),
        },
        units: {
          ...baseT.units,
          ...(savedT.units || {}),
        },
        centroid: baseT.centroid,
        neighbors: baseT.neighbors,
      };
    } else {
      mergedTerritories[tId] = {
        ...savedT,
        ownerId: safeOwnerId,
        coreOwnerId: safeCoreId,
      };
    }
  });

  Object.keys(mergedTerritories).forEach((tId) => {
    const t = mergedTerritories[tId];
    if (!rawPayload.territories?.[tId] && tId.includes('_')) {
      const parentCountryId = tId.split('_')[0];
      const savedParent = rawPayload.territories?.[parentCountryId];
      if (savedParent && mergedNations[savedParent.ownerId]) {
        mergedTerritories[tId] = {
          ...t,
          ownerId: savedParent.ownerId,
        };
      }
    }
    if (!mergedNations[mergedTerritories[tId].ownerId]) {
      mergedTerritories[tId] = {
        ...mergedTerritories[tId],
        ownerId: fallbackNationId,
      };
    }
  });

  return {
    gameMode: rawPayload.gameMode || 'EMPIRES_1440',
    playerNationId: fallbackNationId,
    nations: mergedNations,
    territories: mergedTerritories,
    relations: rawPayload.relations || {},
    wars: (rawPayload.wars || []).filter(
      (w) => w && mergedNations[w.attackerId] && mergedNations[w.defenderId]
    ),
    battles: rawPayload.battles || [],
    movements: (rawPayload.movements || []).filter(
      (mv) =>
        mv &&
        mergedNations[mv.ownerId] &&
        mergedTerritories[mv.fromTerritoryId] &&
        mergedTerritories[mv.toTerritoryId]
    ),
    newsEvents: rawPayload.newsEvents || [],
    tick: Number.isFinite(rawPayload.tick) ? rawPayload.tick : 0,
    hour: Number.isFinite(rawPayload.hour) ? rawPayload.hour : 8,
  };
}

export function saveGameToSlot(
  slotId: SaveSlotId,
  payload: SaveGamePayload
): SaveSlotMetadata | null {
  try {
    const metadata = buildSaveMetadata(slotId, payload);
    const record: SaveSlotRecord = { metadata, payload };
    slotRecordCache[slotId] = record;

    // Persist tiny metadata index synchronously, full payload asynchronously in IndexedDB
    const metaIdx = readMetaIndex();
    metaIdx[slotId] = metadata;
    writeMetaIndex(metaIdx);

    set(getSlotStorageKey(slotId), record).catch(() => {
      // Fallback if private-browsing blocks IndexedDB
      try {
        localStorage.setItem(getSlotStorageKey(slotId), JSON.stringify(record));
      } catch {
        // ignore
      }
    });

    return metadata;
  } catch {
    return null;
  }
}

export function loadGameFromSlot(slotId: SaveSlotId): SaveSlotRecord | null {
  if (slotRecordCache[slotId]?.payload?.nations) {
    return slotRecordCache[slotId]!;
  }

  try {
    const raw = localStorage.getItem(getSlotStorageKey(slotId));
    if (!raw) {
      if (slotId === 'SLOT_1') {
        const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyRaw) {
          const legacyPayload = JSON.parse(legacyRaw) as SaveGamePayload;
          if (legacyPayload?.nations && legacyPayload?.territories) {
            const meta = buildSaveMetadata('SLOT_1', legacyPayload);
            const rec = { metadata: meta, payload: legacyPayload };
            slotRecordCache.SLOT_1 = rec;
            return rec;
          }
        }
      }
      return null;
    }
    const parsed = JSON.parse(raw) as SaveSlotRecord;
    if (!parsed?.payload?.nations) return null;
    slotRecordCache[slotId] = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export function deleteSaveSlot(slotId: SaveSlotId): void {
  delete slotRecordCache[slotId];
  try {
    const metaIdx = readMetaIndex();
    delete metaIdx[slotId];
    writeMetaIndex(metaIdx);
    localStorage.removeItem(getSlotStorageKey(slotId));
    if (slotId === 'SLOT_1') {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    del(getSlotStorageKey(slotId)).catch(() => {});
  } catch {
    // ignore
  }
}

export function listAllSaveSlots(): Record<SaveSlotId, SaveSlotMetadata | null> {
  const metaIdx = readMetaIndex();
  const result: Record<SaveSlotId, SaveSlotMetadata | null> = {
    AUTOSAVE: null,
    SLOT_1: null,
    SLOT_2: null,
    SLOT_3: null,
  };

  SAVE_SLOT_DEFINITIONS.forEach((def) => {
    const cached = slotRecordCache[def.id];
    if (cached) {
      result[def.id] = cached.metadata;
    } else if (metaIdx[def.id]) {
      result[def.id] = metaIdx[def.id]!;
    } else {
      const rec = loadGameFromSlot(def.id);
      if (rec) result[def.id] = rec.metadata;
    }
  });

  return result;
}

export function getMostRecentSaveRecord(): SaveSlotRecord | null {
  const candidates: SaveSlotRecord[] = [];
  SAVE_SLOT_DEFINITIONS.forEach((def) => {
    const rec = loadGameFromSlot(def.id);
    if (rec) candidates.push(rec);
  });
  if (candidates.length === 0) return null;
  candidates.sort((a, b) =>
    (b.metadata.savedAtIso || '').localeCompare(a.metadata.savedAtIso || '')
  );
  return candidates[0];
}

export function exportSaveRecordToJson(record: SaveSlotRecord): void {
  const jsonStr = JSON.stringify(record, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const safeName = (record.metadata.flagCode || 'IMP').toLowerCase();
  const a = document.createElement('a');
  a.href = url;
  a.download = `imperium2026_${safeName}_gun${record.metadata.tick}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importSaveRecordFromJson(
  jsonText: string,
  targetSlotId: SaveSlotId = 'SLOT_1'
): SaveSlotRecord | null {
  try {
    const parsed = JSON.parse(jsonText);
    const payload: SaveGamePayload | null =
      parsed?.payload?.nations
        ? parsed.payload
        : parsed?.nations && parsed?.territories
        ? (parsed as SaveGamePayload)
        : null;

    if (!payload) return null;

    const metadata = buildSaveMetadata(targetSlotId, payload);
    const record: SaveSlotRecord = { metadata, payload };
    slotRecordCache[targetSlotId] = record;

    const metaIdx = readMetaIndex();
    metaIdx[targetSlotId] = metadata;
    writeMetaIndex(metaIdx);
    set(getSlotStorageKey(targetSlotId), record).catch(() => {});

    return record;
  } catch {
    return null;
  }
}
