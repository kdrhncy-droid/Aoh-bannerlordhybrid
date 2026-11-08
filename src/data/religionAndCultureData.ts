import {
  CultureDefinition,
  CultureId,
  GameModeId,
  Nation,
  ReligionDefinition,
  ReligionId,
  Territory,
} from '../types/game';

export const RELIGIONS: Record<ReligionId, ReligionDefinition> = {
  ISLAM_SUNNI: {
    id: 'ISLAM_SUNNI',
    name: 'Sünni İslam',
    symbol: '☪',
    color: '#059669', // Emerald
    description: 'Şeriat, ulema nizâmı ve hilafet otoritesi. Yüksek askeri moral ve ordu disiplini sağlar.',
    moralBonus: 10,
    stabilityBonus: 8,
  },
  ISLAM_SHIA: {
    id: 'ISLAM_SHIA',
    name: 'Şii İslam',
    symbol: '☪',
    color: '#0D9488', // Teal
    description: 'Ehl-i Beyt bağlılığı ve fedai ruhu. Savunma harplerinde ve kuşatma direncinde üstündür.',
    moralBonus: 12,
    stabilityBonus: 6,
  },
  CHRISTIAN_ORTHODOX: {
    id: 'CHRISTIAN_ORTHODOX',
    name: 'Doğu Ortodoksluk',
    symbol: '☦',
    color: '#D97706', // Amber Gold
    description: 'Patrikhane otoritesi ve imparatorluk litürjisi. Yüksek ulusal birlik ve düşük isyan riski sağlar.',
    moralBonus: 8,
    stabilityBonus: 10,
  },
  CHRISTIAN_CATHOLIC: {
    id: 'CHRISTIAN_CATHOLIC',
    name: 'Roma Katolikliği',
    symbol: '✝',
    color: '#4F46E5', // Royal Indigo
    description: 'Papalık ruhbanı ve haçlı seferi seferberliği. Diplomatik pakt ve koalisyon kurmada güçlüdür.',
    moralBonus: 10,
    stabilityBonus: 8,
  },
  TENGERISM_STEPPE: {
    id: 'TENGERISM_STEPPE',
    name: 'Tengricilik & Bozkır',
    symbol: '🐺',
    color: '#0284C7', // Sky Blue
    description: 'Kök Tengri inancı ve bozkır töresi. Akıncı süvarilere üstün manevra ve taarruz gücü verir.',
    moralBonus: 15,
    stabilityBonus: 4,
  },
  BUDDHISM_EAST: {
    id: 'BUDDHISM_EAST',
    name: 'Doğu Budizmi & Konfüçyüs',
    symbol: '☸',
    color: '#EA580C', // Saffron
    description: 'Dharma ahlakı ve bürokratik liyakat. Yüksek vergi verimliliği ve bilimsel araştırma sağlar.',
    moralBonus: 6,
    stabilityBonus: 14,
  },
  HINDUISM_VEDIC: {
    id: 'HINDUISM_VEDIC',
    name: 'Vedik Hinduizm',
    symbol: '🕉️',
    color: '#E11D48', // Crimson Rose
    description: 'Vedalar ve kast nizâmı. Tarımsal üretim ve insan gücü nüfus artışında etkilidir.',
    moralBonus: 8,
    stabilityBonus: 8,
  },
  INDIGENOUS_AMERICAN: {
    id: 'INDIGENOUS_AMERICAN',
    name: 'Güneş İnancı (Mezoamerika & İnka)',
    symbol: '🦅',
    color: '#9333EA', // Purple
    description: 'İntihrist ve Güneş Tanrısı tapınımı. Savaşçı tarikatlarına tavizsiz cesaret kazandırır.',
    moralBonus: 14,
    stabilityBonus: 6,
  },
};

export const CULTURES: Record<CultureId, CultureDefinition> = {
  TURKIC_OGHUZ: {
    id: 'TURKIC_OGHUZ',
    name: 'Oğuz Türkü (Türkmen)',
    color: '#DC2626', // Red
    description: 'Anadolu, Azerbaycan ve Horasan Türkmen boyları. Süvari ve fetih geleneği.',
  },
  GREEK_BYZANTINE: {
    id: 'GREEK_BYZANTINE',
    name: 'Bizans Grek',
    color: '#A855F7', // Violet
    description: 'Mora, Ege, Karadeniz ve Konstantinopolis halkı. Ticaret ve denizcilik.',
  },
  ARABIC_LEVANT: {
    id: 'ARABIC_LEVANT',
    name: 'Arap (Levant & Mısır)',
    color: '#10B981', // Emerald
    description: 'Hicaz, Şam, Kahire ve Nil Deltası ahalisi. Kervan ticareti ve ilim merkezleri.',
  },
  PERSIAN_IRANIC: {
    id: 'PERSIAN_IRANIC',
    name: 'Fars & Tacik',
    color: '#F59E0B', // Amber
    description: 'İran platosu, Horasan ve Maveraünnehir şehirleri. Minyatür, şiir ve bürokrasi.',
  },
  SLAVIC_EAST_SOUTH: {
    id: 'SLAVIC_EAST_SOUTH',
    name: 'Slav (Balkan & Rus)',
    color: '#3B82F6', // Blue
    description: 'Balkanlar, Ukrayna ve Rus knezlikleri. Dayanıklı piyadeler ve tahıl üretimi.',
  },
  GERMANIC_CENTRAL: {
    id: 'GERMANIC_CENTRAL',
    name: 'Germen & Sakson',
    color: '#64748B', // Slate
    description: 'Kutsal Roma ve Ren şehirleri. Zırhlı şövalyeler ve metalürji ustalığı.',
  },
  ROMANCE_LATIN: {
    id: 'ROMANCE_LATIN',
    name: 'Latin & Frank',
    color: '#6366F1', // Indigo
    description: 'Fransa, İtalya ve İberya şehir devletleri. Bankacılık ve deniz filoları.',
  },
  MONGOL_STEPPE: {
    id: 'MONGOL_STEPPE',
    name: 'Moğol & Bozkır',
    color: '#06B6D4', // Cyan
    description: 'Deşt-i Kıpçak ve Altay göçebeleri. Atlı okçular ve kervan yolları denetimi.',
  },
  SINIC_HAN: {
    id: 'SINIC_HAN',
    name: 'Han Çinlisi',
    color: '#E11D48', // Rose Red
    description: 'Sarı Nehir ve Yangtze havzası. Yüksek nüfus, porselen ve ipek üretimi.',
  },
  JAPANESE_YAMATO: {
    id: 'JAPANESE_YAMATO',
    name: 'Yamato (Japon)',
    color: '#BE185D', // Dark Rose
    description: 'Şogunluklar ve samuray klanları. Bushido onuru ve kılıç zanaati.',
  },
  AMERINDIAN: {
    id: 'AMERINDIAN',
    name: 'Yerli Amerika',
    color: '#7C3AED', // Deep Violet
    description: 'Tenochtitlan, Maya ormanları ve And Dağları sakinleri. Astronomi ve taş işçiliği.',
  },
};

export function resolveTerritoryReligion(
  t: Territory,
  owner?: Nation
): ReligionId {
  if (t.religion) return t.religion;
  const oId = t.ownerId;
  const lon = t.centroid[0];
  const lat = t.centroid[1];

  // Specific nations
  if (oId === '792') {
    // Ottoman Empire: Balkan provinces start predominantly Orthodox Christian; Anatolia starts Sunni Islam
    if (lon < 26.8 && lat > 39.5) return 'CHRISTIAN_ORTHODOX';
    return 'ISLAM_SUNNI';
  }
  if (oId === '300') return 'CHRISTIAN_ORTHODOX'; // Byzantium
  if (oId === '818') return 'ISLAM_SUNNI'; // Mamluk
  if (oId === '364') return 'ISLAM_SHIA'; // Karakoyunlu / Akkoyunlu
  if (oId === '860') return 'ISLAM_SUNNI'; // Timurid
  if (oId === '643') return 'ISLAM_SUNNI'; // Golden Horde
  if (oId === '348' || oId === '276' || oId === '250' || oId === '724' || oId === '826' || oId === '616' || oId === '380') {
    return 'CHRISTIAN_CATHOLIC';
  }
  if (oId === '642' || oId === '688' || oId === '804') return 'CHRISTIAN_ORTHODOX';
  if (oId === '156' || oId === '392') return 'BUDDHISM_EAST';
  if (oId === '356') return 'HINDUISM_VEDIC';
  if (oId === '484' || oId === '604') return 'INDIGENOUS_AMERICAN';

  // Geographic regional fallback
  if (lon >= 20 && lon <= 65 && lat >= 10 && lat <= 42) return 'ISLAM_SUNNI';
  if (lon >= -15 && lon <= 45 && lat >= 35 && lat <= 70) return 'CHRISTIAN_CATHOLIC';
  if (lon >= 20 && lon <= 60 && lat >= 43 && lat <= 65) return 'CHRISTIAN_ORTHODOX';
  if (lon >= 65 && lon <= 145 && lat >= 15 && lat <= 55) return 'BUDDHISM_EAST';
  if (lon <= -30) return 'INDIGENOUS_AMERICAN';

  return owner?.stateReligion || 'ISLAM_SUNNI';
}

export function resolveTerritoryCulture(
  t: Territory,
  owner?: Nation
): CultureId {
  if (t.culture) return t.culture;
  const oId = t.ownerId;
  const lon = t.centroid[0];
  const lat = t.centroid[1];

  if (oId === '792') {
    if (lon < 26.5 && lat > 40.5) return 'SLAVIC_EAST_SOUTH';
    if (lon < 28.5 && lat < 39.5) return 'GREEK_BYZANTINE';
    return 'TURKIC_OGHUZ';
  }
  if (oId === '300') return 'GREEK_BYZANTINE';
  if (oId === '818' || oId === '504') return 'ARABIC_LEVANT';
  if (oId === '364') return 'TURKIC_OGHUZ';
  if (oId === '860') return 'PERSIAN_IRANIC';
  if (oId === '643') return 'MONGOL_STEPPE';
  if (oId === '276') return 'GERMANIC_CENTRAL';
  if (oId === '250' || oId === '724' || oId === '380') return 'ROMANCE_LATIN';
  if (oId === '348' || oId === '616' || oId === '642') return 'SLAVIC_EAST_SOUTH';
  if (oId === '156') return 'SINIC_HAN';
  if (oId === '392') return 'JAPANESE_YAMATO';
  if (oId === '484' || oId === '604') return 'AMERINDIAN';

  // Regional coords
  if (lon >= 26 && lon <= 48 && lat >= 36 && lat <= 42) return 'TURKIC_OGHUZ';
  if (lon >= 30 && lon <= 55 && lat >= 12 && lat <= 35) return 'ARABIC_LEVANT';
  if (lon >= 48 && lon <= 68 && lat >= 25 && lat <= 40) return 'PERSIAN_IRANIC';
  if (lon <= -30) return 'AMERINDIAN';

  return owner?.primaryCulture || 'TURKIC_OGHUZ';
}
