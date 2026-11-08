import {
  Nation,
  ReformDefinition,
  TechDefinition,
} from "../types/game";

export const TECH_TREE: TechDefinition[] = [
  // MILITARY (2026 Modern Era)
  {
    id: 'mil_1',
    name: 'Müşterek Ağ Merkezli Harp',
    branch: 'MILITARY',
    tier: 1,
    cost: 120,
    description: 'Uydu destekli komuta zinciri muharebe gücünü artırır ve Nesil II Ordu Modernizasyonunu açar.',
    effectLabel: '+%12 Muharebe Gücü · Nesil II Ordu Donanımı Açılır',
  },
  {
    id: 'mil_2',
    name: 'SİHA & Otonom Sürü Doktrini',
    branch: 'MILITARY',
    tier: 2,
    cost: 260,
    prerequisite: 'mil_1',
    description: 'SİHA ve otonom birlik doktrini muharebe gücünü artırır ve Nesil III Ordu Modernizasyonunu açar.',
    effectLabel: '+%18 Muharebe Gücü · Nesil III Ordu Açılır',
  },
  {
    id: 'mil_3',
    name: 'Hipersonik Caydırıcılık',
    branch: 'MILITARY',
    tier: 3,
    cost: 480,
    prerequisite: 'mil_2',
    description: 'Hipersonik caydırıcılık muharebe gücünü artırır ve Nesil IV Ordu Modernizasyonunu açar.',
    effectLabel: '+%25 Muharebe Gücü · Nesil IV Ordu Açılır',
  },
  {
    id: 'mil_4',
    name: 'Entegre Gök Kubbe Savunması',
    branch: 'MILITARY',
    tier: 4,
    cost: 750,
    prerequisite: 'mil_3',
    description: 'Ülke sınırları içindeki tüm bölgelerde savunma direncini maksimuma çıkarır ve Nesil V Zirve Ordusunu açar.',
    effectLabel: '+%30 Ulusal Savunma · Nesil V Zirve Ordu Açılır',
  },

  // ECONOMY
  {
    id: 'eco_1',
    name: 'Dijital Vergi ve Merkez Bankası',
    branch: 'ECONOMY',
    tier: 1,
    cost: 110,
    description: 'Dijital tahsilat vergi gelirini artırır; enflasyon mevcut vergi ve ekonomi kurallarıyla hesaplanır.',
    effectLabel: '+%15 Vergi Geliri',
  },
  {
    id: 'eco_2',
    name: 'Endüstri 5.0 Robotik Fabrikalar',
    branch: 'ECONOMY',
    tier: 2,
    cost: 240,
    prerequisite: 'eco_1',
    description: 'Sanayi komplekslerinin üretim kapasitesini katlar.',
    effectLabel: '+%25 Üretim Geliri',
  },
  {
    id: 'eco_3',
    name: 'Küresel Enerji ve Koridor Tekeli',
    branch: 'ECONOMY',
    tier: 3,
    cost: 440,
    prerequisite: 'eco_2',
    description: 'Ulusal iç pazar ticaret gelirini artırır.',
    effectLabel: '+%30 İç Pazar Ticareti',
  },
  {
    id: 'eco_4',
    name: 'Dijital Tahsilat ve Vergi Denetim Ağı',
    branch: 'ECONOMY',
    tier: 4,
    cost: 700,
    prerequisite: 'eco_3',
    description: 'Merkezî tahsilat ve vergi denetimiyle vergi gelirini artırır.',
    effectLabel: '+%20 Vergi Geliri',
  },

  // ADMINISTRATION
  {
    id: 'adm_1',
    name: 'Bölgesel İdari Entegrasyon',
    branch: 'ADMINISTRATION',
    tier: 1,
    cost: 100,
    description: 'Çekirdek dışı eyaletlerdeki pozitif haftalık huzursuzluk artışını azaltır.',
    effectLabel: '-%30 Çekirdek Dışı Huzursuzluk Artışı',
  },
  {
    id: 'adm_2',
    name: 'Stratejik Diplomasi Teşkilatı',
    branch: 'ADMINISTRATION',
    tier: 2,
    cost: 220,
    prerequisite: 'adm_1',
    description: 'Savaş sonrası ve kabine kararlarıyla kazanılan agresif genişlemeyi azaltır.',
    effectLabel: '-%25 Agresif Genişleme Kazanımı',
  },
  {
    id: 'adm_3',
    name: 'Ulusal Seferberlik Yasası',
    branch: 'ADMINISTRATION',
    tier: 3,
    cost: 420,
    prerequisite: 'adm_2',
    description: 'Ülke genelindeki insan gücü (Manpower) havuzunu ve yenilenme hızını büyütür.',
    effectLabel: '+%35 İnsan Gücü Yenilenmesi',
  },
  {
    id: 'adm_4',
    name: 'İmparatorluk Federasyon Anayasası',
    branch: 'ADMINISTRATION',
    tier: 4,
    cost: 680,
    prerequisite: 'adm_3',
    description: 'Çok uluslu imparatorluklarda tam istikrar ve vasal gelir artışı sağlar.',
    effectLabel: '+%50 Vasal Haraç Geliri',
  },

  // SCIENCE
  {
    id: 'sci_1',
    name: 'Ulusal Süperbilgisayar Ağı',
    branch: 'SCIENCE',
    tier: 1,
    cost: 130,
    description: 'Üniversite ve araştırma merkezlerinin bilimsel çıktısını artırır.',
    effectLabel: '+%20 Araştırma Hızı',
  },
  {
    id: 'sci_2',
    name: 'Yarı İletken Çip Bağımsızlığı',
    branch: 'SCIENCE',
    tier: 2,
    cost: 280,
    prerequisite: 'sci_1',
    description: 'Üretim gelirini artırır ve yabancı ticaret ambargolarının ekonomi üzerindeki etkisini azaltır.',
    effectLabel: 'Ambargo Etkisi -%50 & +%15 Üretim',
  },
  {
    id: 'sci_3',
    name: 'Kuantum Şifreleme & Harita İstihbaratı',
    branch: 'SCIENCE',
    tier: 3,
    cost: 500,
    prerequisite: 'sci_2',
    description: 'Araştırma hızını artırır ve haritadaki tüm bölgeleri görünür kılar.',
    effectLabel: '+%25 Araştırma · Tüm Harita Görünür',
  },
  {
    id: 'sci_4',
    name: 'Üretim Mühendisliği ve Otomasyon',
    branch: 'SCIENCE',
    tier: 4,
    cost: 820,
    prerequisite: 'sci_3',
    description: 'Mühendislik ve otomasyon yatırımları ulusal üretim gelirini artırır.',
    effectLabel: '+%35 Üretim Geliri',
  },
];

export const TECH_TREE_1440: TechDefinition[] = [
  // MILITARY (1440 Historical Era)
  {
    id: 'mil_1',
    name: 'Kapıkulu & Daimi Ocak Nizâmı',
    branch: 'MILITARY',
    tier: 1,
    cost: 160,
    description:
      'Merkezi hazineden maaşlı daimi piyade ocakları ve eyalet sipahi alayları kurar; muharebe gücünü artırır ve Nesil II modernizasyonunu açar.',
    effectLabel: '+%12 Muharebe Gücü · Nesil II (Yeniçeri & Sipahi) Açılır',
  },
  {
    id: 'mil_2',
    name: 'Barutlu Arkebüz & Tabur Cengi',
    branch: 'MILITARY',
    tier: 2,
    cost: 320,
    prerequisite: 'mil_1',
    description:
      'Fitilli tüfekli saflar ve tabur düzeni muharebe gücünü artırır; Nesil III Orduyu açar.',
    effectLabel: '+%18 Muharebe Gücü · Nesil III (Tüfekli Ocak) Açılır',
  },
  {
    id: 'mil_3',
    name: 'Şahi Darbzen & Ağır Kuşatma Dökümhanesi',
    branch: 'MILITARY',
    tier: 3,
    cost: 540,
    prerequisite: 'mil_2',
    description:
      'Şahi topçusu ve kuşatma doktrini muharebe gücünü artırır; Nesil IV Orduyu açar.',
    effectLabel: '+%25 Muharebe Gücü · Nesil IV (Şahi Topçusu) Açılır',
  },
  {
    id: 'mil_4',
    name: 'Nizâm-ı Cedîd & Süngülü Tümen Reformu',
    branch: 'MILITARY',
    tier: 4,
    cost: 840,
    prerequisite: 'mil_3',
    description:
      'Modern talimli nizamiye alayları ve seri ateşli sahra bataryalarıyla imparatorluk sınırlarını korur; Nesil V Zirve Orduyu açar.',
    effectLabel: '+%30 Ulusal Savunma · Nesil V (Nizâm-ı Cedîd) Açılır',
  },

  // ECONOMY (1440 Historical Era)
  {
    id: 'eco_1',
    name: 'Tahrir Defteri & Gümüş Akçe Darphanesi',
    branch: 'ECONOMY',
    tier: 1,
    cost: 140,
    description:
      'Tüm sancakların arazi ve vergi gelirlerini kayıt altına alarak vergi kaçağını ve sikke tağşişini önler.',
    effectLabel: '+%15 Vergi Geliri',
  },
  {
    id: 'eco_2',
    name: 'Bedesten, Lonca & Dokuma İmalathaneleri',
    branch: 'ECONOMY',
    tier: 2,
    cost: 290,
    prerequisite: 'eco_1',
    description:
      'Şehirlerdeki Ahi loncalarını, ipek ve demir işliklerini büyüterek zanaat üretimini katlar.',
    effectLabel: '+%25 Üretim Geliri',
  },
  {
    id: 'eco_3',
    name: 'İpek ve Baharat Yolu Gümrük Tekeli',
    branch: 'ECONOMY',
    tier: 3,
    cost: 500,
    prerequisite: 'eco_2',
    description:
      'Ulusal iç pazar ticaret gelirini artırır.',
    effectLabel: '+%30 İç Pazar Ticareti',
  },
  {
    id: 'eco_4',
    name: 'Hazine-i Hassa & Vakıf Finans Ağı',
    branch: 'ECONOMY',
    tier: 4,
    cost: 780,
    prerequisite: 'eco_3',
    description:
      'Merkezî hazine tahsilat ve vergi denetimiyle vergi gelirini artırır.',
    effectLabel: '+%20 Vergi Geliri',
  },

  // ADMINISTRATION (1440 Historical Era)
  {
    id: 'adm_1',
    name: 'İstimalet & İskân Siyaseti',
    branch: 'ADMINISTRATION',
    tier: 1,
    cost: 145,
    description:
      'Çekirdek dışı sancaklardaki pozitif haftalık huzursuzluk artışını azaltır.',
    effectLabel: '-%30 Çekirdek Dışı Huzursuzluk Artışı',
  },
  {
    id: 'adm_2',
    name: 'Divan-ı Hümayun & Sefaret Teşkilatı',
    branch: 'ADMINISTRATION',
    tier: 2,
    cost: 280,
    prerequisite: 'adm_1',
    description:
      'Diplomatik teşkilat, savaş sonrası ve kabine kararlarıyla kazanılan agresif genişlemeyi azaltır.',
    effectLabel: '-%25 Agresif Genişleme Kazanımı',
  },
  {
    id: 'adm_3',
    name: 'Tımar & İltizam Seferberlik Nizâmı',
    branch: 'ADMINISTRATION',
    tier: 3,
    cost: 480,
    prerequisite: 'adm_2',
    description:
      'Sancaklardaki asker yükümlülüğünü genişleterek sefer öncesi insan gücü havuzunu büyütür.',
    effectLabel: '+%35 İnsan Gücü Yenilenmesi',
  },
  {
    id: 'adm_4',
    name: 'Kanunnâme-i Âl-i Osman (Cihanşümul İdare)',
    branch: 'ADMINISTRATION',
    tier: 4,
    cost: 750,
    prerequisite: 'adm_3',
    description:
      'Çok uluslu imparatorluk mülkünde sarsılmaz kanun düzeni ve yüksek tâbi devlet haracı sağlar.',
    effectLabel: '+%50 Vasal Haraç Geliri',
  },

  // SCIENCE (1440 Historical Era)
  {
    id: 'sci_1',
    name: 'Sahn-ı Seman Medreseleri',
    branch: 'SCIENCE',
    tier: 1,
    cost: 155,
    description:
      'Büyük ilim merkezleri ve medreseler kurarak matematik, tıp ve mühendislik bilimini hızlandırır.',
    effectLabel: '+%20 Araştırma Hızı',
  },
  {
    id: 'sci_2',
    name: 'Tophane-i Âmire & Çelik Metalurjisi',
    branch: 'SCIENCE',
    tier: 2,
    cost: 310,
    prerequisite: 'sci_1',
    description:
      'Üretim gelirini artırır ve yabancı ticaret ambargolarının ekonomi üzerindeki etkisini azaltır.',
    effectLabel: 'Ambargo Etkisi -%50 & +%15 Üretim',
  },
  {
    id: 'sci_3',
    name: 'Rasathane & Haritacılık (Pîrî Reis Ekolü)',
    branch: 'SCIENCE',
    tier: 3,
    cost: 530,
    prerequisite: 'sci_2',
    description:
      'Haritacılık ve rasathaneler araştırma hızını artırır; haritadaki tüm bölgeleri görünür kılar.',
    effectLabel: '+%25 Araştırma · Tüm Harita Görünür',
  },
  {
    id: 'sci_4',
    name: 'Mühendishâne-i Berrî-i Hümâyun',
    branch: 'SCIENCE',
    tier: 4,
    cost: 860,
    prerequisite: 'sci_3',
    description:
      'İmparatorluk mühendislik akademisiyle hem sivil üretimi hem askeri teknolojiyi çağın zirvesine çıkarır.',
    effectLabel: '+%35 Üretim Geliri',
  },
];

export interface ArmyGenerationMetadata {
  tier: number; // 0..4
  generationLabel: string;
  eraTitle: string;
  infantryName: string;
  infantryShort: string;
  armorName: string;
  armorShort: string;
  airArtilleryName: string;
  airArtilleryShort: string;
  combatBonusPct: number; // Bonus granted once existing armies are modernized to this tier
}

export const ARMY_GENERATIONS_1440: ArmyGenerationMetadata[] = [
  {
    tier: 0,
    generationLabel: 'Nesil I',
    eraTitle: 'Beylik & Erken Dönem Ordusu',
    infantryName: 'Yaya Azap Birliği',
    infantryShort: 'Azap Piyadesi',
    armorName: 'Akıncı Atlısı',
    armorShort: 'Akıncı Süvari',
    airArtilleryName: 'Kuşatma Mancınığı',
    airArtilleryShort: 'Mancınık',
    combatBonusPct: 0,
  },
  {
    tier: 1,
    generationLabel: 'Nesil II',
    eraTitle: 'Kapıkulu & Tımar Nizâmı',
    infantryName: 'Yeniçeri Ocağı',
    infantryShort: 'Yeniçeri',
    armorName: 'Tımarlı Sipahi',
    armorShort: 'Sipahi',
    airArtilleryName: 'Darbzen Topu',
    airArtilleryShort: 'Darbzen Top',
    combatBonusPct: 12,
  },
  {
    tier: 2,
    generationLabel: 'Nesil III',
    eraTitle: 'Barutlu Tüfek & Tabur Cengi',
    infantryName: 'Tüfekli Kapıkulu',
    infantryShort: 'Tüfekli Ocak',
    armorName: 'Zırhlı Cebeli Sipahi',
    armorShort: 'Zırhlı Sipahi',
    airArtilleryName: 'Kolunburna Bataryası',
    airArtilleryShort: 'Kolunburna',
    combatBonusPct: 24,
  },
  {
    tier: 3,
    generationLabel: 'Nesil IV',
    eraTitle: 'Şahi Kuşatma İmparatorluğu',
    infantryName: 'Seçkin Solak & Yeniçeri',
    infantryShort: 'Seçkin Ocak',
    armorName: 'Ağır Kapıkulu Süvarisi',
    armorShort: 'Kapıkulu Atlı',
    airArtilleryName: 'Şahi Kuşatma Topu',
    airArtilleryShort: 'Şahi Topu',
    combatBonusPct: 38,
  },
  {
    tier: 4,
    generationLabel: 'Nesil V',
    eraTitle: 'Nizâm-ı Cedîd Modern Ordusu',
    infantryName: 'Nizâm-ı Cedîd Tümeni',
    infantryShort: 'Nizamiye',
    armorName: 'Mızraklı Süvari Alayı',
    armorShort: 'Mızraklı Alay',
    airArtilleryName: 'Seri Sahra Topçusu',
    airArtilleryShort: 'Sahra Topu',
    combatBonusPct: 55,
  },
];

export const ARMY_GENERATIONS_2026: ArmyGenerationMetadata[] = [
  {
    tier: 0,
    generationLabel: 'Nesil I',
    eraTitle: 'Standart Konvansiyonel Ordu',
    infantryName: 'Motorize Piyade',
    infantryShort: 'Piyade',
    armorName: 'Zırhlı Tugay',
    armorShort: 'Zırhlı',
    airArtilleryName: 'Taktik İHA Bataryası',
    airArtilleryShort: 'Taktik İHA',
    combatBonusPct: 0,
  },
  {
    tier: 1,
    generationLabel: 'Nesil II',
    eraTitle: 'Ağ Merkezli Müşterek Ordu',
    infantryName: 'Ağ Merkezli Piyade',
    infantryShort: 'Ağ Piyadesi',
    armorName: 'Reaktif Zırhlı Tugay',
    armorShort: 'Reaktif Zırhlı',
    airArtilleryName: 'Taarruzi SİHA Filosu',
    airArtilleryShort: 'SİHA Filosu',
    combatBonusPct: 12,
  },
  {
    tier: 2,
    generationLabel: 'Nesil III',
    eraTitle: 'Otonom Sürü & Komando Doktrini',
    infantryName: 'Seçkin Komando Tugayı',
    infantryShort: 'Komando',
    armorName: 'Ana Muharebe Tankı',
    armorShort: 'Modern Tank',
    airArtilleryName: 'Otonom Sürü SİHA',
    airArtilleryShort: 'Sürü SİHA',
    combatBonusPct: 24,
  },
  {
    tier: 3,
    generationLabel: 'Nesil IV',
    eraTitle: 'Hipersonik & Dijital Kolordu',
    infantryName: 'Dijital Komando Tümeni',
    infantryShort: 'Dijital Tümen',
    armorName: 'Aktif Korumalı Tank',
    armorShort: 'AKT Zırhlı',
    airArtilleryName: 'Hipersonik Hava Gücü',
    airArtilleryShort: 'Hipersonik',
    combatBonusPct: 38,
  },
  {
    tier: 4,
    generationLabel: 'Nesil V',
    eraTitle: 'Gök Kubbe & Gelecek Ordusu',
    infantryName: 'Yeni Nesil Muharip Güç',
    infantryShort: 'Elit Muharip',
    armorName: 'Otonom Zırhlı Tümen',
    armorShort: 'Otonom Tank',
    airArtilleryName: 'Gök Kubbe Hava Filosu',
    airArtilleryShort: 'Gök Kubbe',
    combatBonusPct: 55,
  },
];

export function getTechTreeForMode(gameMode?: string): TechDefinition[] {
  return gameMode === 'EMPIRES_1440' ? TECH_TREE_1440 : TECH_TREE;
}

export function getNationUnlockedMilTier(nation?: Pick<Nation, 'unlockedTechs'> | null): number {
  if (!nation?.unlockedTechs) return 0;
  if (nation.unlockedTechs.includes('mil_4')) return 4;
  if (nation.unlockedTechs.includes('mil_3')) return 3;
  if (nation.unlockedTechs.includes('mil_2')) return 2;
  if (nation.unlockedTechs.includes('mil_1')) return 1;
  return 0;
}

export function getNationModernizedTier(
  nation?: Pick<Nation, 'unlockedTechs' | 'modernizedArmyTier'> | null
): number {
  if (!nation) return 0;
  const unlocked = getNationUnlockedMilTier(nation);
  return Math.min(unlocked, Math.max(0, nation.modernizedArmyTier ?? 0));
}

export function getArmyGenerationInfo(
  gameMode?: string,
  tier: number = 0
): ArmyGenerationMetadata {
  const list =
    gameMode === 'EMPIRES_1440' ? ARMY_GENERATIONS_1440 : ARMY_GENERATIONS_2026;
  const clamped = Math.max(0, Math.min(list.length - 1, tier));
  return list[clamped];
}

export function calculateArmyModernizationCost(
  nation: Pick<Nation, 'unlockedTechs' | 'modernizedArmyTier'>,
  totalTroops: number
): number {
  const unlocked = getNationUnlockedMilTier(nation);
  const current = getNationModernizedTier(nation);
  const tierDiff = Math.max(1, unlocked - current);
  // Scales smoothly with standing army size and number of tech generations jumped
  const baseCost = 320 * tierDiff;
  const perThousandCost = Math.round((totalTroops / 1000) * 3.8 * tierDiff);
  return Math.min(4800, Math.max(350, baseCost + perThousandCost));
}

export const REFORMS_1440: ReformDefinition[] = [
  {
    id: 'ref_central_bank',
    name: 'Sikke Tashihi & Darphane-i Âmire Nizâmı',
    category: 'Maliye',
    costGold: 1150,
    costResearch: 120,
    description: 'Her oyun günü enflasyon değişimini 0,025 puan azaltır.',
    effectLabel: 'Günlük enflasyon değişimi −0,025 puan',
  },
  {
    id: 'ref_professional_army',
    name: 'Kapıkulu & Tımar Kanunnâmesi',
    category: 'Askeriye',
    costGold: 1450,
    costResearch: 140,
    description: 'Sefer ve ulufe düzenini ıslah ederek orduların vuruş gücünü artırır, bakım yükünü azaltır.',
    effectLabel: '+%15 Ordu Gücü & -%10 Ordu Bakımı',
  },
  {
    id: 'ref_free_trade_zones',
    name: 'Kervansaray & Serbest İskele İmtiyazları',
    category: 'Ticaret',
    costGold: 1250,
    costResearch: 130,
    description: 'Vergi gelirini ve yurt içi pazar ticaretini artırır.',
    effectLabel: '+%20 Vergi Geliri · +%20 İç Pazar Ticareti',
  },
  {
    id: 'ref_national_defense_industry',
    name: 'Tophane & Tersane-i Âmire Hamlesi',
    category: 'Savunma',
    costGold: 1650,
    costResearch: 160,
    description: 'Yerli savunma sanayii asker toplama maliyetini azaltır.',
    effectLabel: '-%20 Asker Toplama Maliyeti',
  },
  {
    id: 'ref_welfare_state',
    name: 'Külliye, İmarethane ve Medrese Vakıfları',
    category: 'Toplum',
    costGold: 1200,
    costResearch: 125,
    description: 'Yürürlüğe girdiğinde ulusal istikrarı 12 puan artırır ve günlük araştırmaya 5 puan ekler.',
    effectLabel: '+12 Ulusal İstikrar & +5 Araştırma/Gün',
  },
  {
    id: 'ref_imperial_diplomacy',
    name: 'Ahidnâme & Cihan Sulhu Diplomasisi',
    category: 'Diplomasi',
    costGold: 1100,
    costResearch: 115,
    description: 'Yürürlüğe girdiğinde agresif genişlemeyi 15 puan azaltır ve diğer ülkelerle ilişkiyi en çok 15 puan artırır.',
    effectLabel: 'Bir kez −15 AE · Diğer ülkelerle +15 ilişki',
  },
];

export function getReformsForMode(gameMode?: string): ReformDefinition[] {
  return gameMode === 'EMPIRES_1440' ? REFORMS_1440 : REFORMS;
}

export const REFORMS: ReformDefinition[] = [
  {
    id: 'ref_central_bank',
    name: 'Bağımsız Para Politikası Kurulu',
    category: 'Ekonomi',
    costGold: 1150,
    costResearch: 120,
    description: 'Her oyun günü enflasyon değişimini 0,025 puan azaltır.',
    effectLabel: 'Günlük enflasyon değişimi −0,025 puan',
  },
  {
    id: 'ref_professional_army',
    name: 'Profesyonel Özel Kuvvetler Doktrini',
    category: 'Askeriye',
    costGold: 1450,
    costResearch: 140,
    description: 'Orduların muharebe etkinliğini artırır ve bakım giderlerini optimize eder.',
    effectLabel: '+%15 Ordu Gücü & -%10 Ordu Bakımı',
  },
  {
    id: 'ref_free_trade_zones',
    name: 'Özel Ekonomik Serbest Bölgeler',
    category: 'Ticaret',
    costGold: 1250,
    costResearch: 130,
    description: 'Vergi gelirini ve yurt içi pazar ticaretini artırır.',
    effectLabel: '+%20 Vergi Geliri · +%20 İç Pazar Ticareti',
  },
  {
    id: 'ref_national_defense_industry',
    name: 'Milli Savunma Sanayii Hamlesi',
    category: 'Savunma',
    costGold: 1650,
    costResearch: 160,
    description: 'Asker toplama maliyetini %20 azaltır.',
    effectLabel: '-%20 Asker Toplama Maliyeti',
  },
  {
    id: 'ref_welfare_state',
    name: 'Sosyal Refah ve Eğitim Reformu',
    category: 'Toplum',
    costGold: 1200,
    costResearch: 125,
    description: 'Yürürlüğe girdiğinde ulusal istikrarı 12 puan artırır ve günlük araştırmaya 5 puan ekler.',
    effectLabel: '+12 Ulusal İstikrar & +5 Araştırma/Gün',
  },
  {
    id: 'ref_imperial_diplomacy',
    name: 'Küresel Barış ve Arabuluculuk Misyonu',
    category: 'Diplomasi',
    costGold: 1100,
    costResearch: 115,
    description: 'Yürürlüğe girdiğinde agresif genişlemeyi 15 puan azaltır ve diğer ülkelerle ilişkiyi en çok 15 puan artırır.',
    effectLabel: 'Bir kez −15 AE · Diğer ülkelerle +15 ilişki',
  },
];
