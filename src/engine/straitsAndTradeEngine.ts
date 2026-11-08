import {
  ActiveWar,
  DiplomaticRelation,
  GameModeId,
  Nation,
  Territory,
} from '../types/game';
import { getOrCreateRelation, isAtWar } from './simulationEngine';

export interface StrategicStraitDef {
  id: string;
  name: string;
  eraNote1440: string;
  eraNote2026: string;
  shoreIds: string[];
  crossingEdges: [string, string][];
  baseDailyToll: number;
  anchorCoord: [number, number]; // [lon, lat]
}

export interface TradeCorridorDef {
  id: string;
  name1440: string;
  name2026: string;
  hubIds: string[];
  linkedStraitIds: string[];
  baseDailyValue: number;
  color: string;
}

export const STRATEGIC_STRAITS: StrategicStraitDef[] = [
  {
    id: 'strait_bosporus',
    name: 'İstanbul & Çanakkale Boğazları',
    eraNote1440: 'Karadeniz – Akdeniz İpek & Kürk Kilidi',
    eraNote2026: 'Karadeniz – Akdeniz Enerji & Tahıl Koridoru',
    shoreIds: ['792_IST', '792_BUR'],
    crossingEdges: [
      ['792_IST', '792_BUR'],
      ['792_IST', '100_VAR'],
      ['792_IST', '804_ODS'],
      ['792_BUR', '300_SKG'],
    ],
    baseDailyToll: 82,
    anchorCoord: [29.02, 41.04],
  },
  {
    id: 'strait_gibraltar',
    name: 'Cebelitarık Boğazı',
    eraNote1440: 'Endülüs – Mağrip & Atlantik Kapısı',
    eraNote2026: 'Akdeniz – Atlantik Küresel Deniz Kilidi',
    shoreIds: ['724_SEV', '504'],
    crossingEdges: [['724_SEV', '504']],
    baseDailyToll: 64,
    anchorCoord: [-5.6, 35.96],
  },
  {
    id: 'strait_suez_redsea',
    name: 'Süveyş & Kızıldeniz Geçidi',
    eraNote1440: 'Memlük Baharat & Hicaz Deniz Yolu',
    eraNote2026: 'Süveyş Kanalı & Kızıldeniz Konteyner Hattı',
    shoreIds: ['818_SUZ', '682_JED'],
    crossingEdges: [['818_SUZ', '682_JED']],
    baseDailyToll: 78,
    anchorCoord: [34.2, 27.6],
  },
  {
    id: 'strait_hormuz',
    name: 'Hürmüz & Basra Boğazı',
    eraNote1440: 'Basra – Hint İpek ve İnci Geçidi',
    eraNote2026: 'Küresel Petrol ve LNG Enerji Boğazı',
    shoreIds: ['364_ISF', '682_DMM'],
    crossingEdges: [['364_ISF', '682_DMM']],
    baseDailyToll: 72,
    anchorCoord: [56.25, 26.55],
  },
  {
    id: 'strait_sicily_otranto',
    name: 'Sicilya & Otranto Boğazı',
    eraNote1440: 'Venedik – Tunus Orta Akdeniz Kilidi',
    eraNote2026: 'Orta Akdeniz Deniz Ticaret Kavşağı',
    shoreIds: ['380_NAP', '788', '300'],
    crossingEdges: [
      ['380_NAP', '788'],
      ['380_NAP', '300'],
    ],
    baseDailyToll: 56,
    anchorCoord: [12.1, 37.4],
  },
  {
    id: 'strait_danish_sund',
    name: 'Danimarka Sund & Baltık Boğazı',
    eraNote1440: 'Kalmar Sund Gümrüğü & Hansa Kilidi',
    eraNote2026: 'Baltık – Kuzey Denizi Deniz Geçidi',
    shoreIds: ['208', '752_GOT', '276_HAM'],
    crossingEdges: [
      ['208', '752_GOT'],
      ['208', '276_HAM'],
    ],
    baseDailyToll: 54,
    anchorCoord: [12.62, 55.95],
  },
  {
    id: 'strait_english_channel',
    name: 'Manş Denizi (Dover Geçidi)',
    eraNote1440: 'İngiltere – Fransa Yün & Donanma Boğazı',
    eraNote2026: 'Kuzey Avrupa Finans & Lojistik Koridoru',
    shoreIds: ['826', '250'],
    crossingEdges: [['826', '250']],
    baseDailyToll: 60,
    anchorCoord: [1.35, 50.95],
  },
  {
    id: 'strait_korea_tsushima',
    name: 'Kore & Tsuşima Boğazı',
    eraNote1440: 'Joseon – Ashikaga Doğu Denizi Geçidi',
    eraNote2026: 'Kuzeydoğu Asya Yarı İletken Deniz Hattı',
    shoreIds: ['410_PUS', '392_OSA'],
    crossingEdges: [
      ['410_PUS', '392_OSA'],
      ['410', '392_OSA'],
    ],
    baseDailyToll: 58,
    anchorCoord: [129.8, 34.4],
  },
  {
    id: 'strait_malacca',
    name: 'Malakka Boğazı',
    eraNote1440: 'Güney Deniz Baharat Kapısı',
    eraNote2026: 'Hint – Pasifik Süper Tanker Boğazı',
    shoreIds: ['360_MES', '458', '702'],
    crossingEdges: [
      ['360_MES', '458'],
      ['360_MES', '356_CCU'],
    ],
    baseDailyToll: 80,
    anchorCoord: [100.8, 2.8],
  },
];

export const TRADE_CORRIDORS: TradeCorridorDef[] = [
  {
    id: 'corridor_silk_road',
    name1440: '🐪 Büyük İpek Yolu (Semerkant – Kostantiniyye – Venedik)',
    name2026: '🚄 Avrasya Orta Koridoru (Pekin – İstanbul – Avrupa)',
    hubIds: [
      '156',
      '156_URC',
      '860',
      '364',
      '364_TBZ',
      '792_ERZ',
      '792',
      '792_IST',
      '380_MIL',
    ],
    linkedStraitIds: ['strait_bosporus'],
    baseDailyValue: 165,
    color: '#F59E0B',
  },
  {
    id: 'corridor_spice_redsea',
    name1440: '⛵ Baharat & Kızıldeniz Yolu (Hindistan – Cidde – Kahire – İtalya)',
    name2026: '🚢 Hint – Süveyş – Akdeniz Enerji ve Konteyner Hattı',
    hubIds: [
      '356_CCU',
      '356_BOM',
      '682_DMM',
      '364_ISF',
      '682_JED',
      '818_SUZ',
      '818',
      '380_NAP',
      '250_MRS',
    ],
    linkedStraitIds: [
      'strait_hormuz',
      'strait_suez_redsea',
      'strait_sicily_otranto',
    ],
    baseDailyValue: 175,
    color: '#38BDF8',
  },
  {
    id: 'corridor_blacksea_steppe',
    name1440: '🌾 Karadeniz & Deşt-i Kıpçak Kürk-Tahıl Hattı',
    name2026: '⚓ Karadeniz Tahıl ve Kuzey Enerji Koridoru',
    hubIds: ['643', '643_KRR', '804_ODS', '100_VAR', '792_IST', '300'],
    linkedStraitIds: ['strait_bosporus'],
    baseDailyValue: 120,
    color: '#34D399',
  },
  {
    id: 'corridor_western_med',
    name1440: '🧭 Batı Akdeniz & Sahra Altın Kervanı',
    name2026: '🌊 Batı Akdeniz – Atlantik Ticaret Hattı',
    hubIds: ['504_RAK', '504', '012', '788', '724_SEV', '724_BCN', '250_MRS'],
    linkedStraitIds: ['strait_gibraltar', 'strait_sicily_otranto'],
    baseDailyValue: 115,
    color: '#FBBF24',
  },
  {
    id: 'corridor_hanseatic_north',
    name1440: '⚓ Hansa Birliği & Baltık Deniz Ticareti',
    name2026: '🏦 Kuzey Denizi & Baltık Sanayi-Finans Hattı',
    hubIds: ['643_LED', '616_GDN', '752', '208', '276_HAM', '528', '826'],
    linkedStraitIds: ['strait_danish_sund', 'strait_english_channel'],
    baseDailyValue: 135,
    color: '#A78BFA',
  },
  {
    id: 'corridor_east_asia_sea',
    name1440: '🏮 Doğu Çin Denizi & Gümüş-İpek Donanma Hattı',
    name2026: '⚡ Pasifik Yarı İletken & Teknoloji Deniz Hattı',
    hubIds: ['392', '392_OSA', '410_PUS', '156_SHA', '156_CAN', '360_MES'],
    linkedStraitIds: ['strait_korea_tsushima', 'strait_malacca'],
    baseDailyValue: 145,
    color: '#FB7185',
  },
];

export interface StraitLiveStatus {
  def: StrategicStraitDef;
  activeShoreIds: string[];
  shoreOwners: { territoryId: string; territoryName: string; ownerId: string }[];
  dominantOwnerId: string | null;
  hasFullMonopoly: boolean;
  isContestedByWar: boolean;
  totalDailyToll: number;
  ownerTollShares: Record<string, number>;
}

export function evaluateActiveStraits(
  territories: Record<string, Territory>,
  wars: ActiveWar[]
): StraitLiveStatus[] {
  const results: StraitLiveStatus[] = [];

  for (const def of STRATEGIC_STRAITS) {
    const activeShoreIds = def.shoreIds.filter((id) => Boolean(territories[id]));
    if (activeShoreIds.length === 0) continue;

    const shoreOwners = activeShoreIds.map((id) => ({
      territoryId: id,
      territoryName: territories[id].name.replace(/^★\s*/, ''),
      ownerId: territories[id].ownerId,
    }));

    const countsByOwner: Record<string, number> = {};
    let totalPortBonus = 0;
    for (const s of shoreOwners) {
      countsByOwner[s.ownerId] = (countsByOwner[s.ownerId] || 0) + 1;
      const terr = territories[s.territoryId];
      totalPortBonus += (terr.buildings?.tradeHub || 0) * 0.14;
      if (terr.isOccupied) totalPortBonus -= 0.15;
    }

    const uniqueOwners = Object.keys(countsByOwner);
    const hasFullMonopoly = uniqueOwners.length === 1;
    let dominantOwnerId: string | null = null;
    let maxCount = 0;
    for (const [oId, cnt] of Object.entries(countsByOwner)) {
      if (cnt > maxCount) {
        maxCount = cnt;
        dominantOwnerId = oId;
      }
    }

    let isContestedByWar = false;
    for (let i = 0; i < uniqueOwners.length; i++) {
      for (let j = i + 1; j < uniqueOwners.length; j++) {
        if (isAtWar(wars, uniqueOwners[i], uniqueOwners[j])) {
          isContestedByWar = true;
        }
      }
    }

    const monopolyMult = hasFullMonopoly ? 1.25 : 1.0;
    const warDisruptionMult = isContestedByWar ? 0.72 : 1.0;
    const totalDailyToll = Math.max(
      18,
      Math.round(
        def.baseDailyToll *
          (1 + Math.max(0, totalPortBonus)) *
          monopolyMult *
          warDisruptionMult
      )
    );

    const ownerTollShares: Record<string, number> = {};
    for (const [oId, cnt] of Object.entries(countsByOwner)) {
      const shareRatio = cnt / activeShoreIds.length;
      ownerTollShares[oId] = Math.round(totalDailyToll * shareRatio);
    }

    results.push({
      def,
      activeShoreIds,
      shoreOwners,
      dominantOwnerId,
      hasFullMonopoly,
      isContestedByWar,
      totalDailyToll,
      ownerTollShares,
    });
  }

  return results;
}

export interface NationTradeAndStraitsSummary {
  straitTollIncome: number;
  caravanTradeIncome: number;
  seizedBlockadeIncome: number;
  blockadePenaltyLoss: number;
  controlledStraits: {
    straitId: string;
    name: string;
    dailyToll: number;
    hasFullMonopoly: boolean;
    isContested: boolean;
  }[];
  activeCorridors: {
    corridorId: string;
    name: string;
    ownedHubCount: number;
    totalHubCount: number;
    dailyIncome: number;
    isBlockadedByEnemy: boolean;
  }[];
}

export function calculateNationTradeAndStraits(params: {
  nationId: string;
  gameMode?: GameModeId;
  territories: Record<string, Territory>;
  nations: Record<string, Nation>;
  relations: Record<string, DiplomaticRelation>;
  wars: ActiveWar[];
}): NationTradeAndStraitsSummary {
  const {
    nationId,
    gameMode = 'EMPIRES_1440',
    territories,
    relations,
    wars,
  } = params;

  const is1440 = gameMode === 'EMPIRES_1440';
  const straits = evaluateActiveStraits(territories, wars);
  const straitMap = new Map(straits.map((s) => [s.def.id, s]));

  let straitTollIncome = 0;
  let seizedBlockadeIncome = 0;
  const controlledStraits: NationTradeAndStraitsSummary['controlledStraits'] =
    [];

  for (const st of straits) {
    const myShare = st.ownerTollShares[nationId] || 0;
    if (myShare > 0) {
      straitTollIncome += myShare;
      controlledStraits.push({
        straitId: st.def.id,
        name: st.def.name,
        dailyToll: myShare,
        hasFullMonopoly: st.hasFullMonopoly && st.dominantOwnerId === nationId,
        isContested: st.isContestedByWar,
      });

      // If this nation controls a strait and is at war / embargoing enemies, seize contraband tolls!
      const enemyCount = wars.filter(
        (w) => w.attackers.includes(nationId) || w.defenders.includes(nationId)
      ).length;
      if (enemyCount > 0) {
        seizedBlockadeIncome += Math.round(myShare * 0.28 * Math.min(2, enemyCount));
      }
    }
  }

  let caravanTradeIncome = 0;
  let blockadePenaltyLoss = 0;
  const activeCorridors: NationTradeAndStraitsSummary['activeCorridors'] = [];

  for (const corr of TRADE_CORRIDORS) {
    const existingHubs = corr.hubIds.filter((hId) => Boolean(territories[hId]));
    if (existingHubs.length < 2) continue;

    let totalRouteWeight = 0;
    let myRouteWeight = 0;
    let myOwnedHubs = 0;
    let guardProtectionBonus = 0;

    for (const hId of existingHubs) {
      const t = territories[hId];
      const hubWeight =
        12 +
        (t.baseGdp || 25) * 0.35 +
        (t.buildings?.tradeHub || 0) * 16 +
        (t.resource === 'TICARET_BOGAZI' || t.resource === 'FINANS_MERKEZI'
          ? 14
          : 0);
      totalRouteWeight += hubWeight;
      if (t.ownerId === nationId) {
        myOwnedHubs += 1;
        myRouteWeight += hubWeight;
        guardProtectionBonus +=
          (t.buildings?.fortress || 0) * 0.08 +
          (t.buildings?.supplyDepot || 0) * 0.08;
      }
    }

    if (myOwnedHubs === 0 || totalRouteWeight <= 0) continue;

    // Check if an enemy or embargoing rival controls a chokepoint strait on this corridor
    let isBlockadedByEnemy = false;
    for (const stId of corr.linkedStraitIds) {
      const st = straitMap.get(stId);
      if (!st) continue;
      for (const shore of st.shoreOwners) {
        if (shore.ownerId === nationId) continue;
        const atWarWithController = Boolean(
          isAtWar(wars, nationId, shore.ownerId)
        );
        const rel = getOrCreateRelation(relations, nationId, shore.ownerId);
        if (atWarWithController || rel.hasEmbargo) {
          isBlockadedByEnemy = true;
          break;
        }
      }
      if (isBlockadedByEnemy) break;
    }

    const rawShareGold = Math.round(
      corr.baseDailyValue * (myRouteWeight / totalRouteWeight)
    );
    let finalGold = rawShareGold;

    if (isBlockadedByEnemy) {
      const mitigation = Math.min(0.55, guardProtectionBonus);
      const lossRatio = 0.42 * (1 - mitigation);
      const lost = Math.max(4, Math.round(rawShareGold * lossRatio));
      blockadePenaltyLoss += lost;
      finalGold = Math.max(4, rawShareGold - lost);
    }

    caravanTradeIncome += finalGold;
    activeCorridors.push({
      corridorId: corr.id,
      name: is1440 ? corr.name1440 : corr.name2026,
      ownedHubCount: myOwnedHubs,
      totalHubCount: existingHubs.length,
      dailyIncome: finalGold,
      isBlockadedByEnemy,
    });
  }

  return {
    straitTollIncome,
    caravanTradeIncome,
    seizedBlockadeIncome,
    blockadePenaltyLoss,
    controlledStraits,
    activeCorridors,
  };
}

export function getProvinceStraitBadge(
  territoryId: string,
  territories: Record<string, Territory>,
  wars: ActiveWar[]
): {
  straitName: string;
  dailyTollShare: number;
  hasFullMonopoly: boolean;
  isContested: boolean;
} | null {
  const straits = evaluateActiveStraits(territories, wars);
  for (const st of straits) {
    if (st.activeShoreIds.includes(territoryId)) {
      const ownerId = territories[territoryId]?.ownerId;
      const share = ownerId ? st.ownerTollShares[ownerId] || 0 : 0;
      return {
        straitName: st.def.name,
        dailyTollShare: share,
        hasFullMonopoly: st.hasFullMonopoly,
        isContested: st.isContestedByWar,
      };
    }
  }
  return null;
}

export function getProvinceCorridorNames(
  territoryId: string,
  gameMode: string = 'EMPIRES_1440'
): string[] {
  const is1440 = gameMode === 'EMPIRES_1440';
  return TRADE_CORRIDORS.filter((c) => c.hubIds.includes(territoryId)).map(
    (c) => (is1440 ? c.name1440 : c.name2026)
  );
}

export function findStraitForCrossingEdge(
  fromId: string,
  toId: string
): StrategicStraitDef | null {
  for (const st of STRATEGIC_STRAITS) {
    for (const [a, b] of st.crossingEdges) {
      if ((a === fromId && b === toId) || (a === toId && b === fromId)) {
        return st;
      }
    }
  }
  return null;
}

/**
 * Evaluates whether a maritime strait crossing (`fromId -> toId`) is blocked by an enemy naval/strait fortress.
 * - Direct amphibious assault onto `toId` from a player/mover-owned shore (`fromId`) is allowed (with coastal defense bonus in combat),
 *   EXCEPT when a hostile third-party strait controller holds the strait chokepoint.
 * - Transit across a strait where neither shore is owned by the mover is blocked if ANY strait shore controller is at war with mover and has >=3,500 garrison.
 */
export function checkStraitMilitaryBlockade(params: {
  fromId: string;
  toId: string;
  moverNationId: string;
  territories: Record<string, Territory>;
  wars: ActiveWar[];
}): { blocked: boolean; reason?: string } {
  const { fromId, toId, moverNationId, territories, wars } = params;
  const strait = findStraitForCrossingEdge(fromId, toId);
  if (!strait) return { blocked: false };

  const fromTerr = territories[fromId];
  const toTerr = territories[toId];
  if (!fromTerr || !toTerr) return { blocked: false };

  const moverOwnsLaunchShore = fromTerr.ownerId === moverNationId;

  for (const shoreId of strait.shoreIds) {
    const shoreTerr = territories[shoreId];
    if (!shoreTerr) continue;
    if (shoreTerr.ownerId === moverNationId) continue;

    const hostileToShoreOwner = Boolean(
      isAtWar(wars, moverNationId, shoreTerr.ownerId)
    );
    if (!hostileToShoreOwner) continue;

    const shoreFortified = (shoreTerr.garrison || 0) >= 3500;
    if (!shoreFortified) continue;

    // Allow direct assault from mover's own shore onto the opposing shore,
    // but block transit through neutral/allied shores or past third-party hostile chokepoints!
    const isDirectShoreAssault =
      moverOwnsLaunchShore && shoreId === toId;
    if (!isDirectShoreAssault) {
      return {
        blocked: true,
        reason: `⚓ Boğaz Ablukası (${strait.name}): Düşman sahil tahkimatı deniz geçişini kapatıyor!`,
      };
    }
  }

  return { blocked: false };
}

export const TRADE_RAID_INFLUENCE_COST = 20;
export const TRADE_RAID_MANPOWER_COST = 1200;

/**
 * Active Wartime Action: Raid Enemy Caravans & Maritime Convoys (`🏴‍☠️ Kervan & Konvoy Akını`)
 */
export function executeWartimeTradeRaidDomain(params: {
  playerNationId: string;
  gameMode: GameModeId;
  tick: number;
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  wars: ActiveWar[];
}): {
  ok: boolean;
  nations: Record<string, Nation>;
  territories: Record<string, Territory>;
  plunderedGold: number;
  targetNationName?: string;
  corridorName?: string;
  toastMessage: string;
} {
  const { playerNationId, gameMode, nations, territories, wars } = params;
  const player = nations[playerNationId];
  if (!player) {
    return {
      ok: false,
      nations,
      territories,
      plunderedGold: 0,
      toastMessage: 'Devlet verisi bulunamadı.',
    };
  }

  const activePlayerWars = wars.filter(
    (w) =>
      w.attackers.includes(playerNationId) ||
      w.defenders.includes(playerNationId)
  );
  if (activePlayerWars.length === 0) {
    return {
      ok: false,
      nations,
      territories,
      plunderedGold: 0,
      toastMessage:
        'Ticaret kervanlarına / konvoylarına baskın düzenlemek için aktif bir savaşta olmalısınız.',
    };
  }

  const currentInf = player.clanInfluence ?? 120;
  if (currentInf < TRADE_RAID_INFLUENCE_COST) {
    return {
      ok: false,
      nations,
      territories,
      plunderedGold: 0,
      toastMessage: `Kervan akını için en az ${TRADE_RAID_INFLUENCE_COST} ⚜ Nüfuz gerekiyor.`,
    };
  }
  if (player.manpower < TRADE_RAID_MANPOWER_COST) {
    return {
      ok: false,
      nations,
      territories,
      plunderedGold: 0,
      toastMessage: `Akıncı / Deniz müfrezesi için en az ${TRADE_RAID_MANPOWER_COST} İnsan Gücü gerekiyor.`,
    };
  }

  // Find enemy nations in active wars
  const enemyIds = new Set<string>();
  for (const w of activePlayerWars) {
    const opposing = w.attackers.includes(playerNationId)
      ? w.defenders
      : w.attackers;
    opposing.forEach((id) => {
      if (id !== playerNationId && nations[id] && !nations[id].isEliminated) {
        enemyIds.add(id);
      }
    });
  }

  // Pick richest enemy province on a trade corridor (or richest enemy border/coastal province)
  const is1440 = gameMode === 'EMPIRES_1440';
  let targetTerr: Territory | null = null;
  let matchedCorridorName = is1440
    ? 'Büyük Ticaret Kervan Yolu'
    : 'Açık Deniz Ticaret Koridoru';

  for (const corr of TRADE_CORRIDORS) {
    for (const hId of corr.hubIds) {
      const t = territories[hId];
      if (t && enemyIds.has(t.ownerId)) {
        if (!targetTerr || t.baseGdp > targetTerr.baseGdp) {
          targetTerr = t;
          matchedCorridorName = is1440 ? corr.name1440 : corr.name2026;
        }
      }
    }
  }

  if (!targetTerr) {
    const fallbackEnemyProvs = Object.values(territories)
      .filter((t) => enemyIds.has(t.ownerId))
      .sort((a, b) => b.baseGdp - a.baseGdp);
    targetTerr = fallbackEnemyProvs[0] || null;
  }

  if (!targetTerr) {
    return {
      ok: false,
      nations,
      territories,
      plunderedGold: 0,
      toastMessage: 'Hedef alınabilecek düşman ticaret merkezi bulunamadı.',
    };
  }

  const enemyNation = nations[targetTerr.ownerId];
  // Controlling straits boosts raid yield!
  const straits = evaluateActiveStraits(territories, wars);
  const myControlledStraitCount = straits.filter(
    (s) => (s.ownerTollShares[playerNationId] || 0) > 0
  ).length;

  const rawPlunder =
    260 +
    Math.round(targetTerr.baseGdp * 2.8) +
    myControlledStraitCount * 65;
  const enemyGuardMitigation = Math.min(
    0.45,
    (targetTerr.buildings?.fortress || 0) * 0.1
  );
  const plunderedGold = Math.min(
    680,
    Math.max(180, Math.round(rawPlunder * (1 - enemyGuardMitigation)))
  );
  const drainedFromEnemy = Math.min(enemyNation.treasury, Math.round(plunderedGold * 0.75));

  const nextNations: Record<string, Nation> = {
    ...nations,
    [playerNationId]: {
      ...player,
      treasury: player.treasury + plunderedGold,
      clanInfluence: Math.max(0, currentInf - TRADE_RAID_INFLUENCE_COST),
      manpower: Math.max(0, player.manpower - TRADE_RAID_MANPOWER_COST),
    },
    [enemyNation.id]: {
      ...enemyNation,
      treasury: Math.max(0, enemyNation.treasury - drainedFromEnemy),
      stability: Math.max(15, enemyNation.stability - 3),
    },
  };

  const nextTerritories: Record<string, Territory> = {
    ...territories,
    [targetTerr.id]: {
      ...targetTerr,
      unrest: Math.min(100, targetTerr.unrest + 10),
    },
  };

  return {
    ok: true,
    nations: nextNations,
    territories: nextTerritories,
    plunderedGold,
    targetNationName: enemyNation.name,
    corridorName: matchedCorridorName,
    toastMessage: `🏴‍☠️ Ticaret Akını Başarılı! ${enemyNation.name} hattından +${plunderedGold} Altın ganimet ele geçirildi!`,
  };
}
