import { Commander, CrisisEventDefinition } from "../types/game";

export const COMMANDERS: Commander[] = [
  // 1440 Historical Ottoman Commanders & Lords
  {
    id: 'cmd_candarli',
    name: 'Çandarlı Halil Paşa',
    title: 'Veziriazam & Divan Başveziri',
    specialty: 'İktisat & Tımar İdaresi',
    costGold: 550,
    attackBonus: 14,
    defenseBonus: 22,
    casualtyReduction: 20,
  },
  {
    id: 'cmd_zaganos',
    name: 'Zağanos Paşa',
    title: 'Rumeli Beylerbeyi & Kuşatma Kurmayı',
    specialty: 'Şahi Darbzen Kuşatma Topu & Taarruz',
    costGold: 680,
    attackBonus: 26,
    defenseBonus: 12,
    casualtyReduction: 15,
  },
  {
    id: 'cmd_turahan',
    name: 'Turahan Bey',
    title: 'Akıncılar Ocağı Başbuğu',
    specialty: 'Tımarlı Sipahi & Kanat Yarma',
    costGold: 600,
    attackBonus: 24,
    defenseBonus: 10,
    casualtyReduction: 14,
  },
  {
    id: 'cmd_sehabeddin',
    name: 'Şahabeddin Paşa',
    title: 'Yeniçeri Ağası & Kapıkulu Komutanı',
    specialty: 'Yeniçeri & Sur Tahkimatı',
    costGold: 620,
    attackBonus: 18,
    defenseBonus: 24,
    casualtyReduction: 18,
  },
  {
    id: 'cmd_baltaoglu',
    name: 'Baltaoğlu Süleyman Bey',
    title: 'Kaptan-ı Derya',
    specialty: 'Kadırga Donanması & Boğazlar',
    costGold: 580,
    attackBonus: 20,
    defenseBonus: 16,
    casualtyReduction: 16,
  },
  // Modern Commanders (2026 Senaryoları İçin)
  {
    id: 'cmd_mete',
    name: 'Mareşal Mete Korkmaz',
    title: 'Zırhlı Yarma ve Yıldırım Harekatı Uzmanı',
    specialty: 'Zırhlı Tugay & Taarruz Doktrini',
    costGold: 650,
    attackBonus: 22,
    defenseBonus: 8,
    casualtyReduction: 12,
  },
  {
    id: 'cmd_selim',
    name: 'Orgeneral Selim Aksoy',
    title: 'SİHA Sürü ve Hava-Kara Entegrasyonu Komutanı',
    specialty: 'Otonom Sürü & Nokta İmha',
    costGold: 750,
    attackBonus: 18,
    defenseBonus: 14,
    casualtyReduction: 24,
  },
  {
    id: 'cmd_elena',
    name: 'Mareşal Elena Rostova',
    title: 'Derin Savunma ve Tahkimat Kurmayı',
    specialty: 'Kuşatma Kırma & Siper Harbi',
    costGold: 600,
    attackBonus: 8,
    defenseBonus: 28,
    casualtyReduction: 18,
  },
  {
    id: 'cmd_kenji',
    name: 'Amiral Kenji Sato',
    title: 'Amfibi Çıkarma ve Lojistik Koridor Komutanı',
    specialty: 'Boğaz Kontrolü & İkmal Hatları',
    costGold: 700,
    attackBonus: 16,
    defenseBonus: 18,
    casualtyReduction: 15,
  },
  {
    id: 'cmd_viktor',
    name: 'General Viktor Vance',
    title: 'Ağ Merkezli Müşterek Kuvvetler Komutanı',
    specialty: 'Büyük Koalisyon Muharebeleri',
    costGold: 850,
    attackBonus: 25,
    defenseBonus: 15,
    casualtyReduction: 16,
  },
];

const HISTORICAL_1440_COMMANDER_IDS = new Set([
  'cmd_candarli',
  'cmd_zaganos',
  'cmd_turahan',
  'cmd_sehabeddin',
  'cmd_baltaoglu',
]);

export function getCommandersForMode(gameMode?: string): Commander[] {
  if (gameMode === 'EMPIRES_1440') {
    return COMMANDERS.filter((c) => HISTORICAL_1440_COMMANDER_IDS.has(c.id));
  }
  return COMMANDERS.filter((c) => !HISTORICAL_1440_COMMANDER_IDS.has(c.id));
}

export const CRISIS_EVENTS: CrisisEventDefinition[] = [
  {
    id: 'crisis_energy_corridor',
    title: 'Uluslararası Enerji Koridoru Anlaşmazlığı',
    category: 'JEOPOLITIK',
    description:
      'Bölgesel boru hatları ve sıvılaştırılmış doğalgaz (LNG) geçiş tarifeleri üzerinde büyük güçler arasında kriz patlak verdi. Kabineniz acil karar bekliyor.',
    options: [
      {
        id: 'opt_1',
        label: 'Boğaz ve Boru Hattı Geçiş Vergilerini Artır',
        effectSummary: '+950 Altın · +8 Agresif Genişleme',
        effects: { treasuryDelta: 950, aeDelta: 8 },
      },
      {
        id: 'opt_2',
        label: 'Ortak Enerji Konsorsiyumu Kur',
        effectSummary: '+450 Altın · +45 Araştırma Puanı · -6 Agresif Genişleme',
        effects: { treasuryDelta: 450, researchDelta: 45, aeDelta: -6 },
      },
      {
        id: 'opt_3',
        label: 'Stratejik Rezervleri İç Pazara Sübvanse Et',
        effectSummary: '-300 Altın · -%2.0 Enflasyon · +8 İstikrar',
        effects: { treasuryDelta: -300, inflationDelta: -2.0, stabilityDelta: 8 },
      },
    ],
  },
  {
    id: 'crisis_chip_breakthrough',
    title: 'Milli Yarı İletken ve SİHA Çipi Atılımı',
    category: 'TEKNOLOJI',
    description:
      'Üniversite ve savunma sanayii mühendislerimiz yeni nesil 2nm askeri işlemci tasarımını tamamladı. Seri üretim için kaynak tahsisi gerekiyor.',
    options: [
      {
        id: 'opt_1',
        label: 'Seri Üretim Tesisi İçin Hazine Fonu Ayır',
        effectSummary: '-550 Altın · +95 Araştırma Puanı · +5 İstikrar',
        effects: { treasuryDelta: -550, researchDelta: 95, stabilityDelta: 5 },
      },
      {
        id: 'opt_2',
        label: 'Teknolojiyi Dost Ülkelere Lisansla',
        effectSummary: '+850 Altın · +30 Araştırma Puanı',
        effects: { treasuryDelta: 850, researchDelta: 30 },
      },
    ],
  },
  {
    id: 'crisis_military_mobilization',
    title: 'Sınır Ötesi Güvenlik ve Seferberlik Çağrısı',
    category: 'ASKERI',
    description:
      'Sınırlarımızdaki askeri hareketlilik üzerine Genelkurmay Başkanlığı gönüllü rezerv birliklerin silah altına alınmasını ve zırhlı tugayların takviye edilmesini öneriyor.',
    options: [
      {
        id: 'opt_1',
        label: 'Tam Seferberlik ve Başkent Garnizon Takviyesi',
        effectSummary: '-400 Altın · +18.000 İnsan Gücü · +8.000 Başkent Garnizonu',
        effects: { treasuryDelta: -400, manpowerDelta: 18000, garrisonBonus: 8000 },
      },
      {
        id: 'opt_2',
        label: 'Diplomatik İtidal ve Sınır Ticaretini Koruma',
        effectSummary: '+500 Altın · -8 Agresif Genişleme · +4 İstikrar',
        effects: { treasuryDelta: 500, aeDelta: -8, stabilityDelta: 4 },
      },
    ],
  },
  {
    id: 'crisis_inflation_wave',
    title: 'Küresel Tedarik Zinciri ve Enflasyon Baskısı',
    category: 'EKONOMI',
    description:
      'Küresel emtia fiyatlarındaki dalgalanma iç piyasada maliyetleri artırdı. Ekonomi Bakanlığı iki farklı müdahale planı sundu.',
    options: [
      {
        id: 'opt_1',
        label: 'Sıkı Para Politikası ve Faiz Müdahalesi',
        effectSummary: '-450 Altın · -%3.2 Enflasyon · +6 İstikrar',
        effects: { treasuryDelta: -450, inflationDelta: -3.2, stabilityDelta: 6 },
      },
      {
        id: 'opt_2',
        label: 'İhracat Odaklı Büyüme ve Likidite Genişlemesi',
        effectSummary: '+1.100 Altın · +%1.8 Enflasyon',
        effects: { treasuryDelta: 1100, inflationDelta: 1.8 },
      },
    ],
  },
  {
    id: 'crisis_sovereign_summit',
    title: 'Küresel Güvenlik ve Ticaret Zirvesi',
    category: 'JEOPOLITIK',
    description:
      'Başkentimizde düzenlenen uluslararası zirvede hem ticaret koridorları hem de savunma işbirliği anlaşmaları masada.',
    options: [
      {
        id: 'opt_1',
        label: 'Küresel Yatırım ve Ticaret Fonunu İmzala',
        effectSummary: '+800 Altın · -%1.5 Enflasyon · -10 Agresif Genişleme',
        effects: { treasuryDelta: 800, inflationDelta: -1.5, aeDelta: -10 },
      },
      {
        id: 'opt_2',
        label: 'Askeri Teknoloji ve İstihbarat Paylaşımı Yap',
        effectSummary: '+70 Araştırma Puanı · +12.000 İnsan Gücü',
        effects: { researchDelta: 70, manpowerDelta: 12000 },
      },
    ],
  },
  // 1440 Historical Ottoman & Imperial Crises
  {
    id: 'crisis_yeniceri_kazan',
    title: 'Yeniçeri Ocağı Bahşiş ve Sefer Talebi',
    category: 'ASKERI',
    description:
      'Payitahtta toplanan Kapıkulu ve Yeniçeriler, sefer öncesi ulufe ve cülus bahşişinin artırılmasını talep ediyor. Divan-ı Hümayun karar bekliyor.',
    options: [
      {
        id: 'opt_1',
        label: 'Hazineden Cömert Cülus Bahşişi Dağıt',
        effectSummary: '-450 Altın · +%20 Ordu Morali & +14.000 Yeniçeri Sadakati',
        effects: { treasuryDelta: -450, manpowerDelta: 14000, stabilityDelta: 6 },
      },
      {
        id: 'opt_2',
        label: 'Ocak Disiplinini Sıkılaştır ve Reddet',
        effectSummary: '+0 Altın · -8 İstikrar · +15 Klan Nüfuzu',
        effects: { stabilityDelta: -8, aeDelta: -4 },
      },
    ],
  },
  {
    id: 'crisis_silk_road_caravan',
    title: 'İpek Yolu Kervanı ve Boğazlar Gümrüğü',
    category: 'EKONOMI',
    description:
      'Tebriz ve Semerkant üzerinden gelen zengin baharat ve ipek kervanları Anadolu boğazlarına ulaştı. Venedik ve Ceneviz elçileri imtiyaz istiyor.',
    options: [
      {
        id: 'opt_1',
        label: 'Yüksek Gümrük ve Boğaz Geçiş Akçesi Al',
        effectSummary: '+1.100 Altın · +%1.2 Enflasyon',
        effects: { treasuryDelta: 1100, inflationDelta: 1.2 },
      },
      {
        id: 'opt_2',
        label: 'Tüccarlara Ahidname Vererek Ticareti Genişlet',
        effectSummary: '+550 Altın · +40 Araştırma · -12 Agresif Genişleme',
        effects: { treasuryDelta: 550, researchDelta: 40, aeDelta: -12 },
      },
    ],
  },
  {
    id: 'crisis_sahi_casting',
    title: 'Şahi Darbzen Kuşatma Topu Dökümü',
    category: 'TEKNOLOJI',
    description:
      'Edirne Tophane dökümhanesinde çalışan ustalar, aşılmaz kale surlarını yerle bir edecek devasa tunç Şahi topları dökmeyi teklif ediyor.',
    options: [
      {
        id: 'opt_1',
        label: 'Tüm Bakır ve Bronz Kaynaklarını Tophaneye Tahsis Et',
        effectSummary: '-600 Altın · +85 Araştırma · Kale Kuşatması +%45',
        effects: { treasuryDelta: -600, researchDelta: 85, garrisonBonus: 4000 },
      },
      {
        id: 'opt_2',
        label: 'Hafif Süvari ve Sipahi Teşkilatına Öncelik Ver',
        effectSummary: '-200 Altın · +16.000 İnsan Gücü',
        effects: { treasuryDelta: -200, manpowerDelta: 16000 },
      },
    ],
  },
  {
    id: 'crisis_timar_tahriri',
    title: 'Genel Sancak ve Tımar Tahriri',
    category: 'JEOPOLITIK',
    description:
      'Anadolu ve Rumeli sancaklarındaki sipahilerin tımar tahrir defterleri güncelleniyor. Köy ve kasabalardaki vergilerin adil dağılımı tartışılıyor.',
    options: [
      {
        id: 'opt_1',
        label: 'Adil Tahrir Uygula ve Köylüye Vergi Kolaylığı Sağla',
        effectSummary: '-150 Altın · -%25 Eyalet Huzursuzluğu · +10 İstikrar',
        effects: { treasuryDelta: -150, stabilityDelta: 10 },
      },
      {
        id: 'opt_2',
        label: 'Sancakbeyleri ve Paşalara Yeni Tımarlar Bağışla',
        effectSummary: '+750 Altın · +%35 Lord Sadakati & Sancak Ordusu',
        effects: { treasuryDelta: 750, manpowerDelta: 10000 },
      },
    ],
  },
];

