import { COMMANDERS } from '../data/world2026Data';
import { ActiveWar, Nation, TerrainType, Territory } from '../types/game';
import { sound } from '../utils/soundEngine';

// ==========================================
// 1. GEOGRAPHY & PROVINCE TERRAIN METADATA
// ==========================================

export interface TerrainMetadata {
  id: TerrainType;
  name: string;
  color: string;
  defenseBonusPct: number;
  armorAttackBonusPct: number;
  summary: string;
}

export const TERRAIN_INFO: Record<TerrainType, TerrainMetadata> = {
  OVA: {
    id: 'OVA',
    name: 'Geniş Ova & Bozkır',
    color: '#4ADE80',
    defenseBonusPct: 0,
    armorAttackBonusPct: 18,
    summary: 'Zırhlı / Süvari Taarruzu +%18 · Yüksek Tarım & Nüfus',
  },
  DAGLIK: {
    id: 'DAGLIK',
    name: 'Sarp Dağlık Geçit',
    color: '#78716C',
    defenseBonusPct: 30,
    armorAttackBonusPct: -10,
    summary: 'Savunma +%30 · Kuşatması Zor Doğal Tahkimat',
  },
  ORMAN: {
    id: 'ORMAN',
    name: 'Sık Ormanlık Havza',
    color: '#15803D',
    defenseBonusPct: 16,
    armorAttackBonusPct: -5,
    summary: 'Piyade Savunması +%16 · Pusu Avantajı',
  },
  COL: {
    id: 'COL',
    name: 'Kurak Çöl & Plato',
    color: '#FBBF24',
    defenseBonusPct: 8,
    armorAttackBonusPct: 10,
    summary: 'Savunma +%8 · Açık Manevra +%10',
  },
  METROPOL: {
    id: 'METROPOL',
    name: 'Büyük Metropol & Liman',
    color: '#38BDF8',
    defenseBonusPct: 22,
    armorAttackBonusPct: 0,
    summary: 'Şehir Savunması +%22 · Yüksek Ticaret & Vergi',
  },
};

export function determineProvinceTerrain(
  id: string,
  name: string,
  lon: number,
  lat: number,
  isCapital?: boolean,
  baseGdp?: number
): TerrainType {
  const lower = name.toLowerCase();
  if (
    lower.includes('istanbul') ||
    lower.includes('tokyo') ||
    lower.includes('new york') ||
    lower.includes('londra') ||
    lower.includes('paris') ||
    lower.includes('şanghay') ||
    (isCapital && (baseGdp || 0) >= 180)
  ) {
    return 'METROPOL';
  }

  if (
    lower.includes('erzurum') ||
    lower.includes('trabzon') ||
    lower.includes('kafkas') ||
    lower.includes('tibet') ||
    lower.includes('isviçre') ||
    lower.includes('afgan') ||
    lower.includes('iran') ||
    lower.includes('and') ||
    lower.includes('alp')
  ) {
    return 'DAGLIK';
  }

  if (
    (lat >= 14 && lat <= 33 && lon >= -15 && lon <= 58) ||
    (lat <= -18 && lat >= -30 && lon >= 115 && lon <= 145)
  ) {
    return 'COL';
  }

  if (
    (lat >= 52 && lon >= 10) ||
    (lat >= -12 && lat <= 8 && (lon <= -45 || (lon >= 10 && lon <= 30)))
  ) {
    return 'ORMAN';
  }

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 100;
  }
  if (hash < 28) return 'DAGLIK';
  if (hash < 54) return 'ORMAN';
  return 'OVA';
}

// ==========================================
// 2. HISTORICAL RULERS & REALM NOTABLE LORDS
// ==========================================

export function getNationRulerName(
  nationId: string,
  gameMode: string = 'EMPIRES_1440'
): string {
  if (gameMode === 'EMPIRES_1440') {
    switch (nationId) {
      case '792':
        return 'Sultan II. Murad Han';
      case '300':
        return 'İmparator XI. Konstantinos Paleologos';
      case '818':
        return 'Sultan Seyfeddin Çakmak';
      case '348':
        return 'Kral I. Ulászló & János Hunyadi';
      case '364':
        return 'Sultan Şahruh Mirza';
      case '643':
        return 'Büyük Knez II. Vasili & Seyid Han';
      case '380':
        return 'Dük Francesco Foscari (Venedik)';
      case '276':
        return 'İmparator III. Friedrich (Habsburg)';
      case '616':
        return 'Kral III. Władysław & Kazimir';
      case '250':
        return 'Kral VII. Charles (Valois)';
      case '826':
        return 'Kral VI. Henry (Lancaster)';
      case '724':
        return 'Kral II. Juan (Kastilya & Leon)';
      case '012':
        return 'Sultan Ebu Said Osman (Mağrip)';
      case '752':
        return 'Kral Bavyeralı Christopher (Kalmar)';
      case '356':
        return 'Sultan Muhammed Şah (Delhi)';
      case '156':
        return 'İmparator Zhengtong (Büyük Ming)';
      case '392':
        return 'Şogun Ashikaga Yoshinori';
      default:
        return 'Hükümdar';
    }
  }
  return 'Başkomutan';
}

const HISTORICAL_AI_LORDS: Record<string, string[]> = {
  '792': ['Çandarlı Halil Paşa', 'Zağanos Paşa', 'Turahan Bey'],
  '300': [
    'Megas Doux Loukas Notaras',
    'Giovanni Giustiniani',
    'Teofilo Paleologo',
  ],
  '818': ['Emir Seyfeddin İnal (Atabey)', 'Emir Canbulat', 'Emir Hoşkadem'],
  '348': ['János Hunyadi (Naib & Komutan)', 'Mihály Szilágyi', 'Pál Kinizsi'],
  '364': ['Uluğ Bey (Semerkant Valisi)', 'Abdüllatif Mirza', 'Babür Mirza'],
  '643': ['Knez Dmitri Şemyaka', 'Daniil Holmski', 'Seyid Ahmed Han'],
  '380': ['Amiral Luigi Loredan', 'Komutan Alvise Diedo', 'Francesco Sforza'],
  '276': [
    'Albrecht von Brandenburg',
    'Friedrich von Sachsen',
    'Kont Ulrich von Cilli',
  ],
  '616': ['Zbigniew Oleśnicki', 'Jan Tarnowski', 'Jonas Goštautas'],
  '250': ['Arthur de Richemont', 'Jean de Dunois', 'Kont Jean Bureau'],
  '826': [
    'Richard Plantagenet (York)',
    'Edmund Beaufort (Somerset)',
    'John Talbot',
  ],
  '724': ['Don Álvaro de Luna', 'İnfante Enrique', 'Rodrigo Manrique'],
  '012': ['Emir Abdülhak el-Merînî', 'Abu Faris Abdülaziz'],
  '752': ['Karl Knutsson Bonde', 'Sten Sture'],
  '356': ['Behlül Han Lûdî', 'Mahmud Şah Şarkî'],
  '156': ['General Yu Qian', 'Mareşal Zhang Fu', 'Amiral Wang Jinghong'],
  '392': ['Hosokawa Katsumoto', 'Yamana Sōzen'],
};

/**
 * Returns the notable Pashas / Commanders serving a realm for the Diplomacy / Realm overview screen.
 */
export function getNationNotableLords(
  nation: Nation,
  ownedTerritories: Territory[],
  gameMode: string = 'EMPIRES_1440'
): string[] {
  if (nation.recruitedGeneralIds && nation.recruitedGeneralIds.length > 0) {
    return nation.recruitedGeneralIds
      .map((id) => COMMANDERS.find((c) => c.id === id)?.name)
      .filter((name): name is string => Boolean(name));
  }

  if (gameMode === 'EMPIRES_1440' && HISTORICAL_AI_LORDS[nation.id]) {
    return HISTORICAL_AI_LORDS[nation.id];
  }

  const titleSuffix = gameMode === 'EMPIRES_1440' ? 'Sancakbeyi' : 'Valisi';
  return ownedTerritories.slice(0, 3).map((t) => {
    const cleanProv = t.name.replace(/★|&.*$|\(.*\)/g, '').trim();
    return `${cleanProv} ${titleSuffix}`;
  });
}

// ==========================================
// 3. PASHA ARCHETYPES, RETINUE & ADMIN STRAIN
// ==========================================

export function getLordRetinueTroops(
  lordId: string,
  territories: Record<string, Territory>
): number {
  const fiefCount = Object.values(territories).filter(
    (t) => t.fiefLordId === lordId
  ).length;
  const cmd = COMMANDERS.find((c) => c.id === lordId);
  const baseRetinue = cmd ? 4000 : 3000;
  return baseRetinue + fiefCount * 2500;
}

export type LordArchetype = 'IKTISATCI' | 'ALIM' | 'MARESAL';

export interface LordInvestmentEvent {
  lordId: string;
  lordName: string;
  nationId: string;
  territoryId: string;
  territoryName: string;
  buildingType: 'factory' | 'university' | 'barracks' | 'fortress' | 'tradeHub';
  buildingName: string;
  level: number;
  incomeBoostLabel: string;
}

export function getLordArchetype(lordId: string): {
  archetype: LordArchetype;
  label: string;
  badge: string;
  description: string;
} {
  const cmd = COMMANDERS.find((c) => c.id === lordId);
  const spec = (cmd?.specialty || '').toLowerCase();
  const name = (cmd?.name || '').toLowerCase();

  if (
    spec.includes('teknoloji') ||
    spec.includes('hava') ||
    spec.includes('ar-ge') ||
    name.includes('selçuk')
  ) {
    return {
      archetype: 'ALIM',
      label: 'Alim & Teknokrat',
      badge: '🔬 Bilim & Ar-Ge',
      description:
        'Tımarında üniversite ve medrese/laboratuvar kurarak bilim üretir.',
    };
  }

  if (
    spec.includes('kuşatma') ||
    spec.includes('piyade') ||
    spec.includes('savunma') ||
    name.includes('osman') ||
    name.includes('fahrettin')
  ) {
    return {
      archetype: 'MARESAL',
      label: 'Gazi Mareşal',
      badge: '⚔️ Askeri & Sur',
      description:
        'Tımarında kışla ve kale surlarını tahkim eder, düzenli garnizon yetiştirir.',
    };
  }

  return {
    archetype: 'IKTISATCI',
    label: 'İktisatçı & Tüccar',
    badge: '💰 Sanayi & Ticaret',
    description:
      'Tımarında fabrika ve ticaret limanları inşa ederek devletin altın gelirini büyütür.',
  };
}

export const DIRECT_DOMAIN_LIMIT = 5;

export function calculateAdministrativeStrain(ownedTerritories: Territory[]): {
  directOwnedCount: number;
  fiefAssignedCount: number;
  capacityLimit: number;
  excessCount: number;
  penaltyPct: number;
} {
  const directOwnedCount = ownedTerritories.filter((t) => !t.fiefLordId).length;
  const fiefAssignedCount = ownedTerritories.filter((t) =>
    Boolean(t.fiefLordId)
  ).length;
  const excessCount = Math.max(0, directOwnedCount - DIRECT_DOMAIN_LIMIT);
  const penaltyPct = Math.min(40, excessCount * 4);

  return {
    directOwnedCount,
    fiefAssignedCount,
    capacityLimit: DIRECT_DOMAIN_LIMIT,
    excessCount,
    penaltyPct,
  };
}

export function processWeeklyBannerlordUpdates(
  nations: Record<string, Nation>,
  territories: Record<string, Territory>,
  weekTick: number = 0
): {
  updatedNations: Record<string, Nation>;
  updatedTerritories: Record<string, Territory>;
  investmentEvents: LordInvestmentEvent[];
} {
  const nextNations: Record<string, Nation> = { ...nations };
  const nextTerritories: Record<string, Territory> = { ...territories };
  const investmentEvents: LordInvestmentEvent[] = [];

  Object.values(nextTerritories).forEach((t) => {
    const curWall = t.castleWallHp ?? 100;
    const nextWall = Math.min(100, curWall + 8);

    if (t.fiefLordId) {
      const lordBonusTroops = 1400;
      const cmd = COMMANDERS.find((c) => c.id === t.fiefLordId);
      const lordName = cmd ? `${cmd.name} (${cmd.title})` : 'Tımar Paşası';
      const lordArchetype = getLordArchetype(t.fiefLordId);

      const updatedBuildings = { ...t.buildings };
      let investedEvent: LordInvestmentEvent | null = null;

      const shouldInvestThisWeek = (weekTick + t.name.length) % 21 === 0;

      if (shouldInvestThisWeek) {
        if (lordArchetype.archetype === 'IKTISATCI') {
          if (updatedBuildings.factory < 5) {
            updatedBuildings.factory += 1;
            investedEvent = {
              lordId: t.fiefLordId,
              lordName,
              nationId: t.ownerId,
              territoryId: t.id,
              territoryName: t.name,
              buildingType: 'factory',
              buildingName: 'Endüstri / İmalat Merkezi',
              level: updatedBuildings.factory,
              incomeBoostLabel: `+${Math.round(t.baseGdp * 0.25)} Altın/Gün`,
            };
          } else if (updatedBuildings.tradeHub < 3) {
            updatedBuildings.tradeHub += 1;
            investedEvent = {
              lordId: t.fiefLordId,
              lordName,
              nationId: t.ownerId,
              territoryId: t.id,
              territoryName: t.name,
              buildingType: 'tradeHub',
              buildingName: 'Ticaret Merkezi',
              level: updatedBuildings.tradeHub,
              incomeBoostLabel: '+%15 Ticaret Geliri',
            };
          }
        } else if (lordArchetype.archetype === 'ALIM') {
          if (updatedBuildings.university < 4) {
            updatedBuildings.university += 1;
            investedEvent = {
              lordId: t.fiefLordId,
              lordName,
              nationId: t.ownerId,
              territoryId: t.id,
              territoryName: t.name,
              buildingType: 'university',
              buildingName: 'İlim & Araştırma Merkezi',
              level: updatedBuildings.university,
              incomeBoostLabel: '+4.5 Bilim/Gün',
            };
          }
        } else if (lordArchetype.archetype === 'MARESAL') {
          if (updatedBuildings.barracks < 5) {
            updatedBuildings.barracks += 1;
            investedEvent = {
              lordId: t.fiefLordId,
              lordName,
              nationId: t.ownerId,
              territoryId: t.id,
              territoryName: t.name,
              buildingType: 'barracks',
              buildingName: 'Askeri Kışla',
              level: updatedBuildings.barracks,
              incomeBoostLabel: '+Garnizon Eğitim Hızı',
            };
          } else if (updatedBuildings.fortress < 4) {
            updatedBuildings.fortress += 1;
            investedEvent = {
              lordId: t.fiefLordId,
              lordName,
              nationId: t.ownerId,
              territoryId: t.id,
              territoryName: t.name,
              buildingType: 'fortress',
              buildingName: 'Sınır Tahkimatı & Kale',
              level: updatedBuildings.fortress,
              incomeBoostLabel: '+Kuşatma Direnci',
            };
          }
        }

        if (investedEvent) {
          investmentEvents.push(investedEvent);
        }
      }

      nextTerritories[t.id] = {
        ...t,
        buildings: updatedBuildings,
        castleWallHp: nextWall,
        garrison: t.garrison + lordBonusTroops,
        units: {
          infantry: (t.units?.infantry || t.garrison) + 1000,
          armor: (t.units?.armor || 0) + 300,
          airDrone: (t.units?.airDrone || 0) + 100,
        },
        unrest: Math.max(0, t.unrest - 5),
      };
    } else if (nextWall !== curWall) {
      nextTerritories[t.id] = {
        ...t,
        castleWallHp: nextWall,
      };
    }
  });

  Object.keys(nextNations).forEach((nId) => {
    const n = nextNations[nId];
    if (!n || n.isEliminated) return;

    const ownedProvs = Object.values(nextTerritories).filter(
      (t) => t.ownerId === nId
    );
    const fiefProvs = ownedProvs.filter((t) => Boolean(t.fiefLordId)).length;

    const influenceGain =
      6 + (n.recruitedGeneralIds?.length || 0) * 3 + fiefProvs * 4;

    nextNations[nId] = {
      ...n,
      clanInfluence: Math.min(999, (n.clanInfluence ?? 120) + influenceGain),
    };
  });

  return {
    updatedNations: nextNations,
    updatedTerritories: nextTerritories,
    investmentEvents,
  };
}

// ==========================================
// 4. PASHA LOYALTY (0-100), FAVORS & REBELLION
// ==========================================

export const DEFAULT_LORD_LOYALTY = 78;
export const BESTOW_FAVOR_GOLD_COST = 180;
export const BESTOW_FAVOR_LOYALTY_GAIN = 18;
export const REBELLION_LOYALTY_THRESHOLD = 25;

export interface LordLoyaltySummary {
  lordId: string;
  loyalty: number;
  fiefCount: number;
  weeklyDrift: number;
  statusLabel: string;
  tone: 'EMERALD' | 'SKY' | 'AMBER' | 'ROSE';
  warningReason: string | null;
}

export interface PashaRebellionEvent {
  nationId: string;
  lordId: string;
  lordName: string;
  rebelTerritoryNames: string[];
  joinedNationId: string;
  joinedNationName: string;
}

export function getLordLoyalty(nation: Nation, lordId: string): number {
  const raw = nation.lordLoyalties?.[lordId];
  if (typeof raw === 'number' && !Number.isNaN(raw)) {
    return Math.max(0, Math.min(100, Math.round(raw)));
  }
  return DEFAULT_LORD_LOYALTY;
}

export function getLordLoyaltySummary(
  nation: Nation,
  lordId: string,
  territories: Record<string, Territory>
): LordLoyaltySummary {
  const loyalty = getLordLoyalty(nation, lordId);
  const fiefCount = Object.values(territories).filter(
    (t) => t.ownerId === nation.id && t.fiefLordId === lordId
  ).length;

  let weeklyDrift = 0;
  let warningReason: string | null = null;

  if (fiefCount === 0) {
    weeklyDrift -= 1.5;
    warningReason = 'Tımarsız Paşa (-1.5/hf)';
  } else if (fiefCount <= 2) {
    weeklyDrift += 1.5;
  } else {
    const ambitionPenalty = (fiefCount - 2) * 3;
    weeklyDrift -= ambitionPenalty;
    warningReason = `Aşırı Tımar Gücü & Kibir (-${ambitionPenalty}/hf)`;
  }

  if (nation.taxRate > 42) {
    weeklyDrift -= 2;
    warningReason = warningReason || 'Ağır Vergi Yükü (-2/hf)';
  } else if (nation.taxRate <= 26) {
    weeklyDrift += 1;
  }

  if (nation.bannerCalledLordIds?.includes(lordId)) {
    weeklyDrift -= 1;
  }

  if (nation.stability >= 80) {
    weeklyDrift += 0.5;
  } else if (nation.stability < 45) {
    weeklyDrift -= 1.5;
    warningReason = warningReason || 'Düşük Devlet İstikrarı (-1.5/hf)';
  }

  let statusLabel = 'Sadık Sancakbeyi';
  let tone: LordLoyaltySummary['tone'] = 'EMERALD';

  if (loyalty < REBELLION_LOYALTY_THRESHOLD) {
    statusLabel = 'İsyan Eşiğinde!';
    tone = 'ROSE';
  } else if (loyalty < 50) {
    statusLabel = 'Huzursuz';
    tone = 'AMBER';
  } else if (loyalty < 75) {
    statusLabel = 'Dengeli';
    tone = 'SKY';
  }

  return {
    lordId,
    loyalty,
    fiefCount,
    weeklyDrift: Number(weeklyDrift.toFixed(1)),
    statusLabel,
    tone,
    warningReason,
  };
}

export function withUpdatedLordLoyalty(
  nation: Nation,
  lordId: string,
  delta: number
): Nation {
  const cur = getLordLoyalty(nation, lordId);
  const nextVal = Math.max(0, Math.min(100, Math.round(cur + delta)));
  return {
    ...nation,
    lordLoyalties: {
      ...(nation.lordLoyalties || {}),
      [lordId]: nextVal,
    },
  };
}

export function bestowFavorOnLordDomain(params: {
  lordId: string;
  nations: Record<string, Nation>;
  playerNationId: string;
}): {
  nations?: Record<string, Nation>;
  toastMessage?: string;
} {
  const { lordId, nations, playerNationId } = params;
  const p = nations[playerNationId];
  const cmd = COMMANDERS.find((c) => c.id === lordId);
  if (!p || !cmd) return {};

  if (p.treasury < BESTOW_FAVOR_GOLD_COST) {
    return {
      toastMessage: `Paşaya Hil'at & İhsan bağışı için ${BESTOW_FAVOR_GOLD_COST} Altın gerekli.`,
    };
  }

  const curLoyalty = getLordLoyalty(p, lordId);
  if (curLoyalty >= 100) {
    return {
      toastMessage: `${cmd.name} zaten sarsılmaz bir sadakatle (%100) bağlı!`,
    };
  }

  sound.playTreaty();
  const boosted = withUpdatedLordLoyalty(p, lordId, BESTOW_FAVOR_LOYALTY_GAIN);
  return {
    nations: {
      ...nations,
      [playerNationId]: {
        ...boosted,
        treasury: p.treasury - BESTOW_FAVOR_GOLD_COST,
        clanInfluence: Math.min(999, (p.clanInfluence ?? 120) + 5),
      },
    },
    toastMessage: `🎁 ${cmd.name} adına Hil'at ve İhsan takdim edildi (+${BESTOW_FAVOR_LOYALTY_GAIN} Sadakat, +5 ⚜ Nüfuz)!`,
  };
}

export function evaluateWeeklyLordLoyaltyAndRebellions(params: {
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  wars: ActiveWar[];
  weekTick: number;
}): {
  updatedNations: Record<string, Nation>;
  updatedTerritories: Record<string, Territory>;
  updatedWars: ActiveWar[];
  rebellions: PashaRebellionEvent[];
} {
  const nextNations: Record<string, Nation> = { ...params.nations };
  const nextTerritories: Record<string, Territory> = { ...params.territories };
  const nextWars: ActiveWar[] = [...params.wars];
  const rebellions: PashaRebellionEvent[] = [];

  for (const nId of Object.keys(nextNations)) {
    const nation = nextNations[nId];
    if (!nation || nation.isEliminated) continue;
    const recruited = nation.recruitedGeneralIds || [];
    if (recruited.length === 0) continue;

    const nextLoyalties: Record<string, number> = {
      ...(nation.lordLoyalties || {}),
    };
    let nextRecruited = [...recruited];
    let nextCalled = [...(nation.bannerCalledLordIds || [])];
    let nextActiveGen = nation.activeGeneralId;

    for (const lordId of recruited) {
      const summary = getLordLoyaltySummary(nation, lordId, nextTerritories);
      const updatedScore = Math.max(
        0,
        Math.min(100, Math.round(summary.loyalty + summary.weeklyDrift))
      );
      nextLoyalties[lordId] = updatedScore;

      const weekIndex = Math.floor(params.weekTick / 7);
      if (
        updatedScore < REBELLION_LOYALTY_THRESHOLD &&
        summary.fiefCount > 0 &&
        (updatedScore <= 10 || (weekIndex + lordId.length) % 2 === 0)
      ) {
        const lordFiefs = Object.values(nextTerritories).filter(
          (t) => t.ownerId === nId && t.fiefLordId === lordId
        );
        if (lordFiefs.length === 0) continue;

        let defectorTargetNationId: string | null = null;
        for (const fief of lordFiefs) {
          if (
            fief.coreOwnerId &&
            fief.coreOwnerId !== nId &&
            nextNations[fief.coreOwnerId]
          ) {
            defectorTargetNationId = fief.coreOwnerId;
            break;
          }
          for (const nbId of fief.neighbors) {
            const nbOwner = nextTerritories[nbId]?.ownerId;
            if (
              nbOwner &&
              nbOwner !== nId &&
              nextNations[nbOwner] &&
              !nextNations[nbOwner].isEliminated
            ) {
              defectorTargetNationId = nbOwner;
              break;
            }
          }
          if (defectorTargetNationId) break;
        }

        if (!defectorTargetNationId) {
          const rival = Object.values(nextNations).find(
            (other) => other.id !== nId && !other.isEliminated
          );
          defectorTargetNationId = rival?.id || null;
        }
        if (!defectorTargetNationId) continue;

        const targetNation = nextNations[defectorTargetNationId];
        if (targetNation?.isEliminated) {
          nextNations[defectorTargetNationId] = {
            ...targetNation,
            isEliminated: false,
          };
        }

        const rebelProvinceNames: string[] = [];
        for (const fief of lordFiefs) {
          const totalOwnedNow = Object.values(nextTerritories).filter(
            (t) => t.ownerId === nId
          ).length;
          if (totalOwnedNow <= 1) break;

          rebelProvinceNames.push(fief.name);
          nextTerritories[fief.id] = {
            ...fief,
            ownerId: defectorTargetNationId,
            fiefLordId: undefined,
            isOccupied: false,
            unrest: 35,
            garrison: fief.garrison + 3500,
          };
        }

        if (rebelProvinceNames.length > 0) {
          const cmd = COMMANDERS.find((c) => c.id === lordId);
          const lordName = cmd ? cmd.name : 'Asi Sancakbeyi';

          nextRecruited = nextRecruited.filter((id) => id !== lordId);
          nextCalled = nextCalled.filter((id) => id !== lordId);
          if (nextActiveGen === lordId) {
            nextActiveGen = nextRecruited[0] || null;
          }
          delete nextLoyalties[lordId];

          const alreadyAtWar = nextWars.some(
            (w) =>
              (w.attackers.includes(nId) &&
                w.defenders.includes(defectorTargetNationId!)) ||
              (w.attackers.includes(defectorTargetNationId!) &&
                w.defenders.includes(nId))
          );
          if (!alreadyAtWar) {
            nextWars.push({
              id: `war_rebel_${params.weekTick}_${lordId}`,
              name: `${lordName} Paşa İsyanı (${nation.name})`,
              attackerId: defectorTargetNationId,
              defenderId: nId,
              attackers: [defectorTargetNationId],
              defenders: [nId],
              startedTick: params.weekTick,
              attackerWarScore: 10,
              casualtiesAttacker: 0,
              casualtiesDefender: 0,
            });
          }

          rebellions.push({
            nationId: nId,
            lordId,
            lordName,
            rebelTerritoryNames: rebelProvinceNames,
            joinedNationId: defectorTargetNationId,
            joinedNationName:
              nextNations[defectorTargetNationId]?.name || 'Asi Beylik',
          });
        }
      }
    }

    nextNations[nId] = {
      ...nation,
      lordLoyalties: nextLoyalties,
      recruitedGeneralIds: nextRecruited,
      bannerCalledLordIds: nextCalled,
      activeGeneralId: nextActiveGen,
    };
  }

  return {
    updatedNations: nextNations,
    updatedTerritories: nextTerritories,
    updatedWars: nextWars,
    rebellions,
  };
}
