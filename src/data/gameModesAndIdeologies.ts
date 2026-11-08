import {
  BuildingDefinition,
  FormableEmpireDefinition,
  GameModeId,
  IdeologyDefinition,
  IdeologyId,
  ResourceType,
} from "../types/game";

export const GAME_MODES: {
  id: GameModeId;
  name: string;
  subtitle: string;
  description: string;
  startingGoldMultiplier: number;
  startingTension: number;
}[] = [
  {
    id: 'EMPIRES_1440',
    name: '1440: İmparatorluklar Çağı',
    subtitle: 'Odaklı 16 Büyük Krallık (Yüksek Performans)',
    description:
      '1440 yılı Avrasya ve Akdeniz coğrafyasında sadece 16 büyük imparatorluk (Osmanlı, Memlük, Timur, Kutsal Roma, Fransa vb.). Kolay yönetim ve hızlı test odaklı.',
    startingGoldMultiplier: 1.25,
    startingTension: 20,
  },
  {
    id: 'STANDARD_2026',
    name: 'Modern Dünya (2026)',
    subtitle: 'Tüm Dünya Ülkeleri (Saklanan Tam Harita)',
    description:
      '2026 yılı tüm dünya ülkeleri, modern ekonomiler ve küresel sınırlarla tam dünya haritası senaryosu.',
    startingGoldMultiplier: 1.0,
    startingTension: 15,
  },
  {
    id: 'GLOBAL_COALITION_CRISIS',
    name: 'Küresel Koalisyon Savaşı',
    subtitle: 'Yüksek Askeri Gerilim & Bloklaşma',
    description:
      'Dünya güçleri arasında diplomatik ilişkiler gergin başlar. Koalisyonlar ve sınır savaşları her an patlak verebilir.',
    startingGoldMultiplier: 1.35,
    startingTension: 55,
  },
  {
    id: 'ECONOMIC_HEGEMONY',
    name: 'Ekonomik Süper Güç',
    subtitle: 'Ticaret Savaşları & Ambargo Odaklı',
    description:
      'Enflasyon, üretim binaları ve ticaret anlaşmalarının belirleyici olduğu ekonomik hegemonya mücadelesi.',
    startingGoldMultiplier: 1.5,
    startingTension: 10,
  },
  {
    id: 'SANDBOX_EMPIRE',
    name: 'Sandbox İmparatorluk',
    subtitle: 'Serbest Kaynak & Hızlı Genişleme',
    description:
      'Yüksek hazine, insan gücü ve araştırma puanı ile kendi alternatif dünya haritanızı hızla şekillendirin.',
    startingGoldMultiplier: 4.0,
    startingTension: 5,
  },
];

export const IDEOLOGIES: Record<IdeologyId, IdeologyDefinition> = {
  DEMOCRACY: {
    id: 'DEMOCRACY',
    name: 'Cumhuriyet & Demokrasi',
    description: 'Yüksek ticaret geliri, bilimsel araştırma hızı ve güçlü diplomatik ittifak kapasitesi sunar.',
    color: '#3B82F6',
    taxBonus: 12,
    militaryAttackBonus: 0,
    manpowerGrowthBonus: 0,
    researchBonus: 20,
    unrestReduction: 25,
    diplomacyModifier: 20,
  },
  AUTHORITARIAN: {
    id: 'AUTHORITARIAN',
    name: 'Otoriter Başkanlık',
    description: 'Merkezi devlet kontrolü, hızlı seferberlik, yüksek vergi tahsilatı ve iç güvenlik sağlar.',
    color: '#F59E0B',
    taxBonus: 18,
    militaryAttackBonus: 12,
    manpowerGrowthBonus: 15,
    researchBonus: 5,
    unrestReduction: 15,
    diplomacyModifier: -5,
  },
  MONARCHY: {
    id: 'MONARCHY',
    name: 'Mutlak / Meşruti Monarşi',
    description: 'Köklü devlet geleneği, yüksek ulusal istikrar ve zengin hazine birikimi sağlar.',
    color: '#A855F7',
    taxBonus: 22,
    militaryAttackBonus: 8,
    manpowerGrowthBonus: 10,
    researchBonus: 0,
    unrestReduction: 30,
    diplomacyModifier: 10,
  },
  SOCIALIST: {
    id: 'SOCIALIST',
    name: 'Sosyalist Halk Cumhuriyeti',
    description: 'Fabrika üretiminde yüksek verim, devasa insan gücü rezervi ve düşük bina inşa maliyeti.',
    color: '#EF4444',
    taxBonus: 10,
    militaryAttackBonus: 10,
    manpowerGrowthBonus: 30,
    researchBonus: 10,
    unrestReduction: 10,
    diplomacyModifier: -10,
  },
  MILITARY_JUNTA: {
    id: 'MILITARY_JUNTA',
    name: 'Askeri Konsey / Cunta',
    description: 'Üstün ordu taarruz gücü, düşük asker bakım maliyeti ve hızlı fetih kapasitesi.',
    color: '#10B981',
    taxBonus: 0,
    militaryAttackBonus: 28,
    manpowerGrowthBonus: 25,
    researchBonus: -10,
    unrestReduction: 5,
    diplomacyModifier: -20,
  },
  TECHNO_CORPORATISM: {
    id: 'TECHNO_CORPORATISM',
    name: 'Tekno-Korporatizm',
    description: 'Yarı iletken, otomasyon ve ileri araştırmada %35 bonus, yüksek GSYİH büyümesi.',
    color: '#06B6D4',
    taxBonus: 25,
    militaryAttackBonus: 15,
    manpowerGrowthBonus: -5,
    researchBonus: 35,
    unrestReduction: 10,
    diplomacyModifier: 15,
  },
};

export const BUILDINGS: BuildingDefinition[] = [
  {
    id: 'factory',
    name: 'Sanayi Kompleksi',
    description: 'Eyaletin üretim tabanını büyütür; bu artış vergi, üretim ve iç pazar gelirlerine yansır.',
    baseCost: 450,
    maxLevel: 5,
    effectSummary: '+%25 Eyalet GDP çarpanı / Seviye',
  },
  {
    id: 'barracks',
    name: 'Modern Kışla & Karargah',
    description: 'Ulusal günlük insan gücü havuzuna katkı sağlar.',
    baseCost: 400,
    maxLevel: 5,
    effectSummary: '+350 İnsan Gücü Tabanı / Seviye',
  },
  {
    id: 'fortress',
    name: 'Hava Savunma & Tahkimat',
    description: 'Sur bütünlüğüne bağlı olarak savunma gücünü artırır ve kuşatmayı yavaşlatır.',
    baseCost: 500,
    maxLevel: 5,
    effectSummary: 'Sur dayanıklılığı ve kuşatma direnci artar',
  },
  {
    id: 'university',
    name: 'Araştırma & Teknoloji Üssü',
    description: 'Teknoloji ağacı ve ulusal reformlar için günlük araştırma puanı üretir.',
    baseCost: 550,
    maxLevel: 5,
    effectSummary: '+4,5 Günlük Araştırma Puanı / Seviye',
  },
  {
    id: 'tradeHub',
    name: 'Uluslararası Lojistik Limanı',
    description: 'Ulusal ticaret geliri çarpanını ve bulunduğu eyaletin uluslararası ticaret koridoru ağırlığını artırır; bütün liman seviyeleri günlük enflasyon azalımına katkı verir.',
    baseCost: 480,
    maxLevel: 5,
    effectSummary: '+%20 Ticaret Geliri Çarpanı / Seviye · Koridor merkeziyse +16 Ağırlık/Seviye · −0,02 Enflasyon Puanı/Gün/Seviye (en çok −0,20/gün)',
  },
  {
    id: 'supplyDepot',
    name: 'İkmal ve Refah Merkezi',
    description: 'Huzursuzluğu günlük ve haftalık güncellemede azaltır; nüfusun günlük büyümesine kademeli katkı sağlar.',
    baseCost: 350,
    maxLevel: 5,
    effectSummary: '−0,12 Huzursuzluk Puanı/Gün · −1,2 Puan/Haftalık Güncelleme · +%0,008 Nüfus/Gün/Seviye',
  },
];


export const RESOURCE_INFO: Record<
  ResourceType,
  { name: string; color: string; bonusText: string; gdpMultiplier: number }
> = {
  PETROL: {
    name: 'Petrol Rezervi',
    color: '#F59E0B',
    bonusText: '+%30 İhracat Geliri & Zırhlı İkmal',
    gdpMultiplier: 1.3,
  },
  DOGALGAZ: {
    name: 'Doğalgaz Havzası',
    color: '#38BDF8',
    bonusText: '+%25 Enerji Geliri & Diplomatik Koz',
    gdpMultiplier: 1.25,
  },
  YARI_ILETKEN: {
    name: 'Yarı İletken & Çip',
    color: '#A855F7',
    bonusText: '+%35 Teknoloji & Yüksek Sanayi',
    gdpMultiplier: 1.35,
  },
  DEMIR_CELIK: {
    name: 'Demir & Çelik Madeni',
    color: '#94A3B8',
    bonusText: '-%15 Bina ve Ordu Donatım Maliyeti',
    gdpMultiplier: 1.15,
  },
  TAHIL: {
    name: 'Verimli Tahıl Ovası',
    color: '#84CC16',
    bonusText: '+%25 İnsan Gücü Artışı & İstikrar',
    gdpMultiplier: 1.1,
  },
  TICARET_BOGAZI: {
    name: 'Stratejik Ticaret Boğazı',
    color: '#10B981',
    bonusText: '+%30 Ticaret Geliri & Deniz Kontrolü',
    gdpMultiplier: 1.3,
  },
  NADIR_TOPRAK: {
    name: 'Nadir Toprak Elementi',
    color: '#EC4899',
    bonusText: '+%25 Araştırma & Savunma Sanayii',
    gdpMultiplier: 1.25,
  },
  FINANS_MERKEZI: {
    name: 'Küresel Finans Merkezi',
    color: '#FBBF24',
    bonusText: '+%35 Vergi Geliri & Düşük Enflasyon',
    gdpMultiplier: 1.35,
  },
};


export const FORMABLE_EMPIRES: FormableEmpireDefinition[] = [
  {
    id: 'emp_turan',
    name: 'Büyük Turan Hakanlığı',
    newFlagCode: 'TRN',
    newColor: '#06B6D4',
    requiredProvinces: 25,
    requiredTerritoryIds: ['792', '364_TBZ', '860', '398'],
    requiredTerritoryNames: [
      'Payitaht Boğazlar',
      'Tebriz & Azerbaycan',
      'Semerkant & Buhara',
      'Saray & Deşt-i Kıpçak',
    ],
    requiredTechCount: 4,
    goldCost: 2200,
    allowedNationIds: ['792', '031', '398', '860', '364'],
    description:
      'Anadolu, Kafkasya, İran ve Türkistan bozkırlarını tek sancak altında birleştirerek Avrasya ticaret ve askeri koridorlarına hükmedin.',
    bonusSummary:
      'Ödül: +3.200 Altın · +55.000 İnsangücü · +15 İstikrar (Şart: 25 Eyalet, Tebriz, Semerkant, Saray, 4 Teknoloji, 2.200 Altın)',
    treasuryReward: 3200,
    manpowerReward: 55000,
    stabilityReward: 15,
  },
  {
    id: 'emp_eastern_med',
    name: 'Kayser-i Rum & Doğu Akdeniz İmparatorluğu',
    newFlagCode: 'IMP',
    newColor: '#BE123C',
    requiredProvinces: 24,
    requiredTerritoryIds: ['792', '818', '380'],
    requiredTerritoryNames: [
      'Kostantiniyye & Boğazlar',
      'Kahire & Nil Deltası',
      'Roma & İtalya',
    ],
    requiredTechCount: 4,
    goldCost: 2000,
    allowedNationIds: ['792', '300', '818', '380'],
    description:
      'Üç kıtanın kesişim noktasındaki boğazları, Kahire ve Roma başkentlerini tek bir imparatorluk çatısı altında toplayın.',
    bonusSummary:
      'Ödül: +3.500 Altın · +65.000 İnsangücü · +20 İstikrar (Şart: 24 Eyalet, Boğazlar, Kahire, Roma, 4 Teknoloji, 2.000 Altın)',
    treasuryReward: 3500,
    manpowerReward: 65000,
    stabilityReward: 20,
  },
  {
    id: 'emp_euro_fed',
    name: 'Birleşik Avrupa İmparatorluğu',
    newFlagCode: 'EUF',
    newColor: '#1D4ED8',
    requiredProvinces: 18,
    requiredTerritoryIds: ['276', '250', '380'],
    requiredTerritoryNames: ['Brandenburg/Berlin', 'Paris', 'Roma'],
    requiredTechCount: 3,
    goldCost: 1800,
    allowedNationIds: ['276', '250', '380', '724', '616', '826'],
    description:
      'Avrupa kıtasının sanayi, finans ve askeri gücünü tek bir imparatorluk sancağı altında birleştirin.',
    bonusSummary:
      'Ödül: +3.000 Altın · +45.000 İnsangücü · +15 İstikrar (Şart: 18 Eyalet, Berlin, Paris, Roma, 3 Teknoloji, 1.800 Altın)',
    treasuryReward: 3000,
    manpowerReward: 45000,
    stabilityReward: 15,
  },
  {
    id: 'emp_global_hegemon',
    name: 'Nizam-ı Alem & Cihan İmparatorluğu',
    newFlagCode: 'HEG',
    newColor: '#D97706',
    requiredProvinces: 34,
    requiredTechCount: 6,
    goldCost: 3500,
    description:
      'Kıtalararası eyalet ağınızı 34 bölgeye genişleterek dünyanın tartışmasız tek kutuplu cihan devleti olduğunuzu ilan edin.',
    bonusSummary:
      'Ödül: +5.500 Altın · +90.000 İnsangücü · +25 İstikrar (Şart: 34 Eyalet, 6 Teknoloji, 3.500 Altın)',
    treasuryReward: 5500,
    manpowerReward: 90000,
    stabilityReward: 25,
  },
];
