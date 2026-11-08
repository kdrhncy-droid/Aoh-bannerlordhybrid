import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatGameDate,
  getOrCreateRelation,
  isAtWar,
  resolveWarParticipants,
} from './simulationEngine';
import {
  assimilateTerritoryDomain,
  executeArmyMoveDomain,
  formEmpireDomain,
  startMissionaryDomain,
  startResearchDomain,
  upgradeBuildingDomain,
} from './empireAndArmyActions';
import { ActiveWar, DiplomaticRelation, Nation, Territory } from '../types/game';
import { resolveTerritoryFillColor } from '../map/mapPolygonRenderer';
import { RELIGIONS, CULTURES } from '../data/religionAndCultureData';

test('formatGameDate formats 1440 and 2026 dates and optional hours accurately', () => {
  assert.equal(formatGameDate(0, 'EMPIRES_1440'), '1 Oca 1440');
  assert.equal(formatGameDate(10, 'EMPIRES_1440'), '11 Oca 1440');
  assert.equal(formatGameDate(0, 'WORLD_2026'), '1 Oca 2026');
  assert.equal(formatGameDate(0, 'EMPIRES_1440', 8), '1 Oca 1440 · 08:00');
  assert.equal(formatGameDate(2, 'EMPIRES_1440', 19), '3 Oca 1440 · 19:00');
});

test('getOrCreateRelation returns sorted nation pair defaults when relation missing', () => {
  const rel = getOrCreateRelation({}, 'TUR', 'GRC');
  assert.equal(rel.nationA, 'GRC');
  assert.equal(rel.nationB, 'TUR');
  assert.equal(rel.score, 0);
  assert.equal(rel.isAllied, false);
});

test('resolveWarParticipants calls offensive allies for attacker and defensive/vassals for defender', () => {
  const nations: Record<string, Nation> = {
    A: { id: 'A', isEliminated: false } as Nation,
    B: { id: 'B', isEliminated: false } as Nation,
    C: { id: 'C', isEliminated: false } as Nation,
    D: { id: 'D', isEliminated: false, vassalOf: 'B' } as Nation,
  };
  const relations: Record<string, DiplomaticRelation> = {
    'A--C': {
      nationA: 'A',
      nationB: 'C',
      score: 80,
      isAllied: true,
      allianceType: 'OFFENSIVE',
      hasNonAggression: true,
      hasTradeAgreement: true,
      hasEmbargo: false,
      hasMilitaryAccess: true,
      truceUntilTick: 0,
    },
  };

  const res = resolveWarParticipants('A', 'B', relations, nations);
  assert.deepEqual(res.attackers.sort(), ['A', 'C']);
  assert.deepEqual(res.defenders.sort(), ['B', 'D']);
});

test('isAtWar identifies active war between two nations regardless of side order', () => {
  const wars: ActiveWar[] = [
    {
      id: 'w1',
      name: 'Test War',
      attackerId: 'TUR',
      defenderId: 'GRC',
      attackers: ['TUR'],
      defenders: ['GRC'],
      startedTick: 1,
      attackerWarScore: 0,
      casualtiesAttacker: 0,
      casualtiesDefender: 0,
    },
  ];
  assert.ok(isAtWar(wars, 'TUR', 'GRC'));
  assert.ok(isAtWar(wars, 'GRC', 'TUR'));
  assert.equal(isAtWar(wars, 'TUR', 'FRA'), undefined);
});

test('executeArmyMoveDomain blocks unauthorized entry into neutral foreign province and returns pendingWarMove', () => {
  const nations: Record<string, Nation> = {
    '792': {
      id: '792',
      name: 'Osmanlı',
      treasury: 1000,
      unlockedTechs: [],
      enactedReforms: [],
    } as unknown as Nation,
    '300': {
      id: '300',
      name: 'Bizans',
      treasury: 500,
      unlockedTechs: [],
      enactedReforms: [],
    } as unknown as Nation,
  };
  const territories: Record<string, Territory> = {
    '792': {
      id: '792',
      name: 'Edirne',
      ownerId: '792',
      garrison: 12000,
      units: { infantry: 8000, armor: 3000, airDrone: 1000 },
      neighbors: ['300'],
      centroid: [26, 41],
    } as unknown as Territory,
    '300': {
      id: '300',
      name: 'Konstantinopolis',
      ownerId: '300',
      garrison: 6000,
      units: { infantry: 5000, armor: 1000, airDrone: 0 },
      neighbors: ['792'],
      centroid: [28, 41],
    } as unknown as Territory,
  };

  // Without war or military access, moving into neutral territory must return pendingWarMove
  const blockedRes = executeArmyMoveDomain({
    fromId: '792',
    toId: '300',
    playerNationId: '792',
    nations,
    territories,
    relations: {},
    wars: [],
    movements: [],
    newsEvents: [],
    moveRatio: 0.5,
    tick: 1,
    gameMode: 'EMPIRES_1440',
    speed: 1,
    forceDeclareWar: false,
  });
  assert.equal(blockedRes.movements, undefined);
  assert.deepEqual(blockedRes.pendingWarMove, {
    fromId: '792',
    toId: '300',
    targetNationId: '300',
  });

  // Confirming war declaration (forceDeclareWar = true) declares war and starts the march
  const confirmedRes = executeArmyMoveDomain({
    fromId: '792',
    toId: '300',
    playerNationId: '792',
    nations,
    territories,
    relations: {},
    wars: [],
    movements: [],
    newsEvents: [],
    moveRatio: 0.5,
    tick: 1,
    gameMode: 'EMPIRES_1440',
    speed: 1,
    forceDeclareWar: true,
  });
  assert.equal(confirmedRes.wars?.length, 1);
  assert.ok((confirmedRes.movements?.length || 0) >= 1);
});

test('formEmpireDomain prevents instant day-1 Turan formation until province, tech, city, and gold requirements are met', () => {
  const playerNation: Nation = {
    id: '792',
    name: 'Osmanlı Cihan Devleti',
    treasury: 1400,
    stability: 80,
    unlockedTechs: [],
  } as unknown as Nation;

  const territories: Record<string, Territory> = {
    '792': { id: '792', name: 'Edirne', ownerId: '792' } as Territory,
  };

  const earlyAttempt = formEmpireDomain({
    empireId: 'emp_turan',
    playerNationId: '792',
    nations: { '792': playerNation },
    territories,
    newsEvents: [],
    tick: 1,
    gameMode: 'EMPIRES_1440',
  });
  assert.equal(earlyAttempt.nations, undefined);
  assert.ok(earlyAttempt.toastMessage?.includes('25 eyalet gerekli'));
});

import {
  executeDiplomaticActionDomain,
  resolvePeaceDealDomain,
  resolveTacticalBattleOutcomeDomain,
} from './diplomacyAndWarActions';

test('declaring war on a neighboring nation immediately triggers enemy AI mobilization and counter-attack', () => {
  const nations: Record<string, Nation> = {
    '792': {
      id: '792',
      name: 'Osmanlı Cihan Devleti',
      treasury: 1200,
      manpower: 20000,
      isEliminated: false,
      unlockedTechs: [],
      enactedReforms: [],
    } as unknown as Nation,
    '348': {
      id: '348',
      name: 'Macaristan Krallığı',
      treasury: 900,
      manpower: 18000,
      isEliminated: false,
      unlockedTechs: [],
      enactedReforms: [],
    } as unknown as Nation,
  };
  const territories: Record<string, Territory> = {
    '792_sof': {
      id: '792_sof',
      name: 'Sofya',
      ownerId: '792',
      coreOwnerId: '792',
      garrison: 12000,
      units: { infantry: 9000, armor: 2000, airDrone: 1000 },
      neighbors: ['348'],
      centroid: [23, 42],
    } as unknown as Territory,
    '348': {
      id: '348',
      name: 'Budin',
      ownerId: '348',
      coreOwnerId: '348',
      garrison: 16000,
      units: { infantry: 11000, armor: 3500, airDrone: 1500 },
      neighbors: ['792_sof'],
      centroid: [19, 47],
    } as unknown as Territory,
  };

  const warPatch = executeDiplomaticActionDomain({
    targetNationId: '348',
    action: 'DECLARE_WAR',
    playerNationId: '792',
    totalPlayerGarrison: 12000,
    tick: 2,
    gameMode: 'EMPIRES_1440',
    nations,
    territories,
    relations: {},
    wars: [],
    movements: [],
    newsEvents: [],
  });

  assert.equal(warPatch.wars?.length, 1);
  // Enemy AI (348 Hungary) must immediately launch a counter-attack movement against 792_sof!
  const enemyCounterMove = warPatch.movements?.find(
    (m) => m.ownerId === '348' && m.toTerritoryId === '792_sof' && m.isAttack
  );
  assert.ok(
    enemyCounterMove,
    'Enemy nation 348 should launch an active counter-attack upon war declaration'
  );
});

test('resolvePeaceDealDomain blocks Day-1 zero-warscore peace exploits and allows peace once warscore is earned', () => {
  const nations: Record<string, Nation> = {
    '792': { id: '792', name: 'Osmanlı', treasury: 1000 } as Nation,
    '300': { id: '300', name: 'Bizans', treasury: 800 } as Nation,
  };
  const territories: Record<string, Territory> = {
    '792': { id: '792', name: 'Edirne', ownerId: '792', coreOwnerId: '792' } as Territory,
    '300': { id: '300', name: 'İstanbul', ownerId: '300', coreOwnerId: '300' } as Territory,
  };
  const warZeroScore: ActiveWar = {
    id: 'w_zero',
    name: 'Osmanlı - Bizans Savaşı',
    attackerId: '792',
    defenderId: '300',
    attackers: ['792'],
    defenders: ['300'],
    startedTick: 1,
    attackerWarScore: 0,
    casualtiesAttacker: 0,
    casualtiesDefender: 0,
  };

  // At 0% warscore and 0 occupied provinces, VASSALIZE, REPARATIONS, and ANNEX_OCCUPIED must be rejected
  const blockedVassal = resolvePeaceDealDomain({
    warId: 'w_zero',
    dealType: 'VASSALIZE',
    playerNationId: '792',
    tick: 2,
    gameMode: 'EMPIRES_1440',
    nations,
    territories,
    relations: {},
    wars: [warZeroScore],
    newsEvents: [],
  });
  assert.equal(blockedVassal.wars, undefined);
  assert.ok(blockedVassal.toast?.includes('+%50'));

  const blockedAnnex = resolvePeaceDealDomain({
    warId: 'w_zero',
    dealType: 'ANNEX_OCCUPIED',
    playerNationId: '792',
    tick: 2,
    gameMode: 'EMPIRES_1440',
    nations,
    territories,
    relations: {},
    wars: [warZeroScore],
    newsEvents: [],
  });
  assert.equal(blockedAnnex.wars, undefined);
  assert.ok(blockedAnnex.toast?.includes('+%25'));

  // At +56% warscore, VASSALIZE succeeds
  const wonWar: ActiveWar = { ...warZeroScore, attackerWarScore: 56 };
  const acceptedVassal = resolvePeaceDealDomain({
    warId: 'w_zero',
    dealType: 'VASSALIZE',
    playerNationId: '792',
    tick: 10,
    gameMode: 'EMPIRES_1440',
    nations,
    territories,
    relations: {},
    wars: [wonWar],
    newsEvents: [],
  });
  assert.equal(acceptedVassal.wars?.length, 0);
  assert.equal(acceptedVassal.nations?.['300']?.vassalOf, '792');
});

test('resolveTacticalBattleOutcomeDomain returns surviving attacker troops to adjacent friendly territory on defeat', () => {
  const nations: Record<string, Nation> = {
    '792': { id: '792', name: 'Osmanlı', capitalTerritoryId: '792', researchPoints: 50 } as Nation,
    '300': { id: '300', name: 'Bizans', capitalTerritoryId: '300', researchPoints: 50 } as Nation,
  };
  const territories: Record<string, Territory> = {
    '792': {
      id: '792',
      name: 'Edirne',
      ownerId: '792',
      garrison: 5000,
      units: { infantry: 3500, armor: 1000, airDrone: 500 },
      neighbors: ['300'],
    } as unknown as Territory,
    '300': {
      id: '300',
      name: 'İstanbul',
      ownerId: '300',
      garrison: 18000,
      units: { infantry: 14000, armor: 3000, airDrone: 1000 },
      neighbors: ['792'],
    } as unknown as Territory,
  };

  const patch = resolveTacticalBattleOutcomeDomain({
    finalBattle: {
      battleId: 'b_test',
      territoryId: '300',
      territoryName: 'İstanbul',
      terrain: 'METROPOL',
      castleWallHp: 80,
      attackerNationId: '792',
      defenderNationId: '300',
      attackerTroops: 4000,
      defenderTroops: 14000,
      attackerMaxTroops: 8000,
      defenderMaxTroops: 18000,
      attackerMorale: 10,
      defenderMorale: 75,
      attackerUnits: { infantry: 3000, armor: 1000, airDrone: 0 },
      defenderUnits: { infantry: 11000, armor: 2000, airDrone: 1000 },
      attackerCommanderId: null,
      defenderCommanderId: null,
      selectedPlayerTactic: 'BALANCED_LINE',
      selectedAiTactic: 'IRON_PORCUPINE',
      round: 3,
      maxRounds: 5,
      combatLog: [],
      status: 'DEFEAT',
      outcome: {
        winnerId: '300',
        loserId: '792',
        attackerSurvivingTroops: 4000,
        defenderSurvivingTroops: 14000,
        attackerTotalLosses: 4000,
        defenderTotalLosses: 4000,
        territoryConquered: false,
        earnedResearch: 20,
        earnedInfluence: 15,
      },
    },
    playerNationId: '792',
    tick: 5,
    gameMode: 'EMPIRES_1440',
    nations,
    territories,
    wars: [],
    newsEvents: [],
  });

  // Edirne ('792') had 5000 garrison + 4000 retreating survivors = 9000!
  assert.equal(patch.territories?.['792']?.garrison, 9000);
});

import { computeGameTick } from './tickEngine';
import { DEFAULT_GAME_SETTINGS } from './gameSettings';

test('computeGameTick preserves territories/nations references during hourly army movement and simulates battles directly on the map (AoH3 style)', () => {
  const nations: Record<string, Nation> = {
    '792': {
      id: '792',
      name: 'Osmanlı',
      capitalTerritoryId: '792',
      treasury: 1000,
      manpower: 15000,
      stability: 80,
      inflation: 2,
      researchPoints: 40,
      taxRate: 25,
      budget: { military: 40, economy: 30, research: 15, welfare: 15 },
      aggressiveExpansion: 0,
      unlockedTechs: [],
      enactedReforms: [],
      recruitedGeneralIds: [],
      activeGeneralId: null,
      isEliminated: false,
    } as unknown as Nation,
    '300': {
      id: '300',
      name: 'Bizans',
      capitalTerritoryId: '300',
      treasury: 500,
      manpower: 5000,
      stability: 70,
      inflation: 2,
      researchPoints: 20,
      taxRate: 25,
      budget: { military: 40, economy: 30, research: 15, welfare: 15 },
      aggressiveExpansion: 0,
      unlockedTechs: [],
      enactedReforms: [],
      recruitedGeneralIds: [],
      activeGeneralId: null,
      isEliminated: false,
    } as unknown as Nation,
  };

  const territories: Record<string, Territory> = {
    '792': {
      id: '792',
      name: 'Edirne',
      ownerId: '792',
      coreOwnerId: '792',
      garrison: 10000,
      units: { infantry: 8000, armor: 2000, airDrone: 0 },
      buildings: { factory: 1, barracks: 1, fortress: 1, university: 0, tradeHub: 1, supplyDepot: 1 },
      neighbors: ['300'],
      centroid: [26, 41],
    } as unknown as Territory,
    '300': {
      id: '300',
      name: 'İstanbul',
      ownerId: '300',
      coreOwnerId: '300',
      garrison: 3000,
      units: { infantry: 3000, armor: 0, airDrone: 0 },
      buildings: { factory: 1, barracks: 1, fortress: 0, university: 0, tradeHub: 1, supplyDepot: 0 },
      neighbors: ['792'],
      centroid: [28, 41],
    } as unknown as Territory,
  };

  // Step 1: Hourly tick while army is mid-march (progress: 40 -> 44) must preserve exact object references for territories & nations
  const marchStep = computeGameTick({
    tick: 1,
    hour: 8,
    hoursStep: 2,
    speed: 2,
    gameMode: 'EMPIRES_1440',
    playerNationId: '792',
    nations,
    territories,
    relations: {},
    wars: [
      {
        id: 'w1',
        name: 'Osmanlı - Bizans Savaşı',
        attackerId: '792',
        defenderId: '300',
        attackers: ['792'],
        defenders: ['300'],
        startedTick: 1,
        attackerWarScore: 0,
        casualtiesAttacker: 0,
        casualtiesDefender: 0,
      },
    ],
    battles: [],
    movements: [
      {
        id: 'mv1',
        ownerId: '792',
        fromTerritoryId: '792',
        toTerritoryId: '300',
        troops: 14000,
        units: { infantry: 10000, armor: 3000, airDrone: 1000 },
        progress: 40,
        isAttack: true,
      },
    ],
    newsEvents: [],
    settings: DEFAULT_GAME_SETTINGS,
  });

  assert.equal(marchStep.territories, territories, 'territories reference must stay identical during pure movement step');
  assert.equal(marchStep.nations, nations, 'nations reference must stay identical during pure movement step');

  // Step 2: When army arrives (progress: 98 -> 100), it starts an on-map battle without triggering blocking modal
  const arrivalStep = computeGameTick({
    tick: 1,
    hour: 10,
    hoursStep: 2,
    speed: 2,
    gameMode: 'EMPIRES_1440',
    playerNationId: '792',
    nations,
    territories,
    relations: {},
    wars: marchStep.wars,
    battles: [],
    movements: [{ ...marchStep.movements[0], progress: 98 }],
    newsEvents: [],
    settings: DEFAULT_GAME_SETTINGS,
  });

  assert.equal(arrivalStep.triggeredTacticalBattle, null, 'Should not open blocking modal on battle start');
  assert.equal(arrivalStep.shouldPause, false, 'Should not pause game on battle start');
  assert.equal(arrivalStep.battles.length, 1, 'Should create an active on-map battle');

  // Step 3: Advancing subsequent hourly combat rounds resolves the on-map battle and conquers the province
  let curState = arrivalStep;
  for (let i = 0; i < 6 && curState.battles.length > 0; i++) {
    curState = computeGameTick({
      tick: curState.nextTick,
      hour: curState.nextHour,
      hoursStep: 2,
      speed: 2,
      gameMode: 'EMPIRES_1440',
      playerNationId: '792',
      nations: curState.nations,
      territories: curState.territories,
      relations: curState.relations,
      wars: curState.wars,
      battles: curState.battles,
      movements: curState.movements,
      newsEvents: curState.newsEvents,
      settings: DEFAULT_GAME_SETTINGS,
    });
  }

  assert.equal(curState.battles.length, 0, 'On-map battle should conclude after combat rounds');
  assert.equal(curState.territories['300'].ownerId, '792', 'Superior army should conquer province on the map');
});

import { initializeWorld2026 } from './worldBuilder';
import { COUNTRY_PROVINCE_SEEDS } from './polygonSubdivider';
import { extractYouTubeVideoId, MUSIC_TRACKS } from './musicEngine';

test('expanded province seeds and 1440 scenario cover 100% of world landmasses with 14+ Ottoman sancaks and Mehter/YouTube support', () => {
  assert.equal(
    COUNTRY_PROVINCE_SEEDS['792'].length,
    14,
    'Ottoman/Turkey (792) should have 14 historical sancak subdivisions'
  );

  const world2026 = initializeWorld2026('STANDARD_2026');
  const world1440 = initializeWorld2026('EMPIRES_1440');

  assert.ok(
    world2026.features.length >= 280,
    `Expected >= 280 provinces in 2026 world, got ${world2026.features.length}`
  );
  assert.equal(
    world1440.features.length,
    world2026.features.length,
    '1440 scenario must preserve 100% of world landmass polygons with zero missing gaps'
  );
  assert.ok(
    world1440.nations['300'],
    '1440 scenario should include Byzantium & Morea (300)'
  );
  assert.ok(
    world1440.nations['031'],
    '1440 scenario should include Karakoyunlu & Akkoyunlu (031)'
  );

  const ottomanProvinces1440 = Object.values(world1440.territories).filter(
    (t) => t.ownerId === '792'
  );
  assert.ok(
    ottomanProvinces1440.length >= 19,
    `Expected Ottoman 1440 to start with >= 19 provinces, got ${ottomanProvinces1440.length}`
  );

  // Verify Ottoman Mehter tracks and YouTube Video ID extractor
  assert.ok(
    MUSIC_TRACKS.some((t) => t.id === 'TR_MEHTER_CEDDIN' && t.isMehter),
    'Should include Ceddin Deden Mehter track'
  );
  assert.ok(
    MUSIC_TRACKS.some((t) => t.id === 'TR_MEHTER_HUCUM' && t.isMehter),
    'Should include Mehter Hücum Marşı track'
  );
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/watch?v=M9mB9ce2t2k'),
    'M9mB9ce2t2k'
  );
  assert.equal(
    extractYouTubeVideoId('https://youtu.be/rU_aE2T0bU0'),
    'rU_aE2T0bU0'
  );
});

test('computeGameTick simulates AoH3 real-time sieges and frontline/backline morale dynamics', () => {
  const nations: Record<string, Nation> = {
    '792': {
      id: '792',
      name: 'Osmanlı Devleti',
      color: '#DC2626',
      flagCode: 'TUR',
      capitalTerritoryId: '792',
      ideology: 'MONARCHY',
      treasury: 1000,
      manpower: 50000,
      stability: 80,
      inflation: 5,
      researchPoints: 50,
      taxRate: 35,
      budget: { military: 35, economy: 25, research: 20, welfare: 20 },
      aggressiveExpansion: 10,
      unlockedTechs: [],
      enactedReforms: [],
      recruitedGeneralIds: [],
      activeGeneralId: null,
      isEliminated: false,
    },
    '300': {
      id: '300',
      name: 'Bizans İmparatorluğu',
      color: '#7C3AED',
      flagCode: 'BYZ',
      capitalTerritoryId: '300',
      ideology: 'MONARCHY',
      treasury: 500,
      manpower: 20000,
      stability: 60,
      inflation: 8,
      researchPoints: 30,
      taxRate: 30,
      budget: { military: 35, economy: 25, research: 20, welfare: 20 },
      aggressiveExpansion: 0,
      unlockedTechs: [],
      enactedReforms: [],
      recruitedGeneralIds: [],
      activeGeneralId: null,
      isEliminated: false,
    },
  };

  const territories: Record<string, Territory> = {
    '792': {
      id: '792',
      name: 'Edirne Sancağı',
      ownerId: '792',
      coreOwnerId: '792',
      population: 400,
      baseGdp: 20,
      resource: 'DEMIR_CELIK',
      buildings: { factory: 1, barracks: 1, fortress: 0, university: 0, tradeHub: 0, supplyDepot: 0 },
      garrison: 8000,
      units: { infantry: 5000, armor: 2000, airDrone: 1000 },
      unrest: 5,
      isOccupied: false,
      centroid: [26.5, 41.6],
      neighbors: ['300'],
    },
    '300': {
      id: '300',
      name: 'Konstantiniyye',
      ownerId: '300',
      coreOwnerId: '300',
      isCapital: true,
      population: 600,
      baseGdp: 35,
      resource: 'TICARET_BOGAZI',
      buildings: { factory: 1, barracks: 1, fortress: 2, university: 1, tradeHub: 1, supplyDepot: 0 },
      garrison: 0,
      units: { infantry: 0, armor: 0, airDrone: 0 },
      unrest: 10,
      castleWallHp: 90,
      isOccupied: false,
      centroid: [28.9, 41.0],
      neighbors: ['792'],
      siege: {
        territoryId: '300',
        attackerId: '792',
        defenderId: '300',
        attackerTroops: 12000,
        attackerUnits: { infantry: 8000, armor: 2000, airDrone: 2000 },
        progress: 96,
        wallIntegrity: 45,
        startedTick: 1,
      },
    },
  };

  const wars: ActiveWar[] = [
    {
      id: 'war_1',
      name: 'Bizans Kuşatma Savaşı',
      attackerId: '792',
      defenderId: '300',
      attackers: ['792'],
      defenders: ['300'],
      startedTick: 1,
      attackerWarScore: 15,
      casualtiesAttacker: 500,
      casualtiesDefender: 1200,
    },
  ];

  // Tick 1: Advance siege
  const out1 = computeGameTick({
    tick: 1,
    hour: 8,
    hoursStep: 24,
    speed: 1,
    gameMode: 'EMPIRES_1440',
    playerNationId: '792',
    nations,
    territories,
    relations: {},
    wars,
    battles: [],
    movements: [],
    newsEvents: [],
    settings: {
      aiAggressiveness: 'NORMAL',
      autoSaveIntervalDays: 90,
      fogOfWarEnabled: false,
      showZoomControls: true,
      crisisFrequencyDays: 90,
      mapLabelDensity: 'BALANCED',
      uiScale: 'STANDARD',
    },
  });

  const siegedTerr = out1.territories['300'];
  assert.ok(siegedTerr);
  // Siege was at 88% and daily step is >12%, so it should reach 100% and fall to Ottoman Empire!
  assert.equal(siegedTerr.isOccupied, true);
  assert.equal(siegedTerr.occupiedById, '792');
  assert.equal(siegedTerr.siege, null);
  assert.ok(siegedTerr.garrison >= 800, 'Besieging troops garrison the conquered fortress');
});

test('timed technology research, construction queue, and gradual assimilation advance daily under computeGameTick', () => {
  const nations: Record<string, Nation> = {
    '792': {
      id: '792',
      name: 'Osmanlı İmparatorluğu',
      flagCode: 'TUR',
      color: '#c22222',
      capitalTerritoryId: '792',
      ideology: 'MONARCHY',
      treasury: 1000,
      manpower: 10000,
      stability: 85,
      inflation: 2.0,
      researchPoints: 20,
      taxRate: 30,
      budget: { military: 40, economy: 30, research: 25, welfare: 5 },
      aggressiveExpansion: 0,
      unlockedTechs: [],
      enactedReforms: [],
      recruitedGeneralIds: [],
      activeGeneralId: null,
      isEliminated: false,
    } as Nation,
  };

  const territories: Record<string, Territory> = {
    '792': {
      id: '792',
      name: 'Edirne',
      ownerId: '792',
      coreOwnerId: '792',
      terrain: 'OVA',
      population: 400,
      baseGdp: 20,
      resource: 'TAHIL',
      buildings: { factory: 0, barracks: 0, fortress: 0, university: 1, tradeHub: 0, supplyDepot: 0 },
      garrison: 5000,
      units: { infantry: 5000, armor: 0, airDrone: 0 },
      unrest: 0,
      isOccupied: false,
      centroid: [26.5, 41.6],
      neighbors: [],
    },
    '300': {
      id: '300',
      name: 'Konstantiniyye',
      ownerId: '792',
      coreOwnerId: '300', // Conquered foreign city
      terrain: 'DAGLIK',
      population: 300,
      baseGdp: 35,
      resource: 'TICARET_BOGAZI',
      buildings: { factory: 0, barracks: 0, fortress: 1, university: 0, tradeHub: 1, supplyDepot: 0 },
      garrison: 2000,
      units: { infantry: 2000, armor: 0, airDrone: 0 },
      unrest: 25,
      isOccupied: false,
      centroid: [28.9, 41.0],
      neighbors: [],
    },
  };

  // 1. Start timed research for tier-1 military tech
  const patch1 = startResearchDomain({
    techId: 'mil_1',
    nations,
    playerNationId: '792',
    gameMode: 'EMPIRES_1440',
    tick: 0,
  });
  assert.ok(patch1.nations?.['792']?.activeResearch);
  assert.equal(patch1.nations['792'].activeResearch?.techId, 'mil_1');
  assert.equal(patch1.nations['792'].activeResearch?.progress, 0);

  // 2. Queue building construction in Edirne
  const patch2 = upgradeBuildingDomain({
    territoryId: '792',
    building: 'barracks',
    territories,
    nations: patch1.nations || nations,
    playerNationId: '792',
  });
  assert.ok(patch2.territories?.['792']?.constructionQueue?.length);
  assert.equal(patch2.territories['792'].constructionQueue![0].building, 'barracks');

  // 3. Start assimilation in Konstantiniyye
  const patch3 = assimilateTerritoryDomain({
    territoryId: '300',
    territories: patch2.territories || territories,
    nations: patch2.nations || patch1.nations || nations,
    playerNationId: '792',
  });
  assert.equal(patch3.territories?.['300']?.isAssimilating, true);

  const mergedNations = { ...nations, ...patch3.nations };
  const mergedTerritories = { ...territories, ...patch3.territories };

  // Set research near completion to test 1-day unlock
  mergedNations['792'].activeResearch!.progress = mergedNations['792'].activeResearch!.totalCost - 1;
  // Set construction queue near completion
  mergedTerritories['792'].constructionQueue![0].progressDays =
    mergedTerritories['792'].constructionQueue![0].totalDays - 1;
  // Set assimilation near completion
  mergedTerritories['300'].assimilation = 99.5;

  // Run computeGameTick for a full 24-hour day
  const tickResult = computeGameTick({
    tick: 1,
    hour: 8,
    hoursStep: 24,
    speed: 1,
    gameMode: 'EMPIRES_1440',
    playerNationId: '792',
    nations: mergedNations,
    territories: mergedTerritories,
    relations: {},
    wars: [],
    battles: [],
    movements: [],
    newsEvents: [],
    settings: {
      aiAggressiveness: 'NORMAL',
      autoSaveIntervalDays: 90,
      fogOfWarEnabled: false,
      showZoomControls: true,
      crisisFrequencyDays: 90,
      mapLabelDensity: 'BALANCED',
      uiScale: 'STANDARD',
    },
  });

  const updatedNation = tickResult.nations['792'];
  const updatedEdirne = tickResult.territories['792'];
  const updatedKonstantiniyye = tickResult.territories['300'];

  // Verification 1: Research completed and unlocked!
  assert.equal(updatedNation.activeResearch, null);
  assert.ok(updatedNation.unlockedTechs.includes('mil_1'), 'mil_1 tech should be unlocked');

  // Verification 2: Barracks construction completed and level incremented!
  assert.equal(updatedEdirne.buildings.barracks, 1);
  assert.equal(updatedEdirne.constructionQueue?.length, 0);

  // Verification 3: Konstantiniyye reached 100% assimilation and became permanent Core!
  assert.equal(updatedKonstantiniyye.assimilation, 100);
  assert.equal(updatedKonstantiniyye.isAssimilating, false);
  assert.equal(updatedKonstantiniyye.coreOwnerId, '792');
});

test('startMissionaryDomain initiates conversion and computeGameTick completes it with unrest reduction and AoH3 map modes return distinct theme colors', () => {
  const nations: Record<string, Nation> = {
    '792': {
      id: '792',
      name: 'Osmanlı İmparatorluğu',
      capitalTerritoryId: '792',
      stateReligion: 'ISLAM_SUNNI',
      primaryCulture: 'TURKIC_OGHUZ',
      treasury: 500,
      manpower: 10000,
      stability: 80,
      inflation: 2,
      researchPoints: 50,
      taxRate: 25,
      budget: { military: 40, economy: 30, research: 15, welfare: 15 },
      aggressiveExpansion: 0,
      unlockedTechs: [],
      enactedReforms: [],
      recruitedGeneralIds: [],
      activeGeneralId: null,
      isEliminated: false,
      color: '#059669',
    } as unknown as Nation,
  };

  const territories: Record<string, Territory> = {
    '300': {
      id: '300',
      name: 'Konstantiniyye',
      ownerId: '792',
      coreOwnerId: '300',
      religion: 'CHRISTIAN_ORTHODOX',
      culture: 'GREEK_BYZANTINE',
      garrison: 5000,
      unrest: 25,
      population: 120,
      baseGdp: 180,
      resource: 'TICARET_BOGAZI',
      buildings: { factory: 1, barracks: 1, fortress: 2, university: 1, tradeHub: 2, supplyDepot: 1 },
      neighbors: ['792'],
      centroid: [28.9, 41.0],
      assimilation: 60,
    } as unknown as Territory,
  };

  // 1. Verify Map Mode colors before conversion
  const relColorBefore = resolveTerritoryFillColor({
    territory: territories['300'],
    mapMode: 'RELIGION',
    nations,
    territories,
    relations: {},
    wars: [],
    playerNationId: '792',
    selectedTerritoryId: '300',
  });
  assert.equal(relColorBefore, RELIGIONS.CHRISTIAN_ORTHODOX.color);

  const culColor = resolveTerritoryFillColor({
    territory: territories['300'],
    mapMode: 'CULTURE',
    nations,
    territories,
    relations: {},
    wars: [],
    playerNationId: '792',
    selectedTerritoryId: '300',
  });
  assert.equal(culColor, CULTURES.GREEK_BYZANTINE.color);

  const assimColorBefore = resolveTerritoryFillColor({
    territory: territories['300'],
    mapMode: 'ASSIMILATION',
    nations,
    territories,
    relations: {},
    wars: [],
    playerNationId: '792',
    selectedTerritoryId: '300',
  });
  assert.equal(assimColorBefore, '#EF4444'); // Not yet 100% Core or active

  // 2. Start Missionary Domain
  const patch = startMissionaryDomain({
    territoryId: '300',
    targetReligion: 'ISLAM_SUNNI',
    territories,
    nations,
    playerNationId: '792',
  });

  assert.ok(patch.territories?.['300']?.missionary, 'Missionary should be active');
  assert.equal(patch.territories['300'].missionary!.targetReligion, 'ISLAM_SUNNI');
  assert.equal(patch.nations?.['792']?.treasury, 380); // 500 - 120 gold

  const mergedTerritories = { ...territories, ...patch.territories };
  // Set missionary to 1 day before completion
  mergedTerritories['300'].missionary!.progressDays =
    mergedTerritories['300'].missionary!.totalDays - 1;

  // 3. Advance a day via computeGameTick
  const tickResult = computeGameTick({
    tick: 1,
    hour: 8,
    hoursStep: 24,
    speed: 1,
    gameMode: 'EMPIRES_1440',
    playerNationId: '792',
    nations: { ...nations, ...patch.nations },
    territories: mergedTerritories,
    relations: {},
    wars: [],
    battles: [],
    movements: [],
    newsEvents: [],
    settings: {
      aiAggressiveness: 'NORMAL',
      autoSaveIntervalDays: 90,
      fogOfWarEnabled: false,
      showZoomControls: true,
      crisisFrequencyDays: 90,
      mapLabelDensity: 'BALANCED',
      uiScale: 'STANDARD',
    },
  });

  const convertedTerritory = tickResult.territories['300'];
  assert.equal(convertedTerritory.religion, 'ISLAM_SUNNI');
  assert.equal(convertedTerritory.missionary, null);
  assert.equal(convertedTerritory.unrest, 17); // 25 - 8 = 17 unrest

  // 4. Verify Map Mode color now reflects Sunni Islam
  const relColorAfter = resolveTerritoryFillColor({
    territory: convertedTerritory,
    mapMode: 'RELIGION',
    nations,
    territories: tickResult.territories,
    relations: {},
    wars: [],
    playerNationId: '792',
    selectedTerritoryId: '300',
  });
  assert.equal(relColorAfter, RELIGIONS.ISLAM_SUNNI.color);
});





