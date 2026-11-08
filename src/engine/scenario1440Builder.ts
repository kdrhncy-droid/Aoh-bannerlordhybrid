import { DiplomaticRelation, IdeologyId, Nation, Territory } from '../types/game';
import { STRATEGIC_STRAITS } from './straitsAndTradeEngine';
import { GeoCountryFeature, InitialWorldBundle, relationKey } from './worldBuilder';

interface Empire1440Def {
  id: string;
  name: string;
  flagCode: string;
  color: string;
  ideology: IdeologyId;
  capitalName: string;
  treasury: number;
  manpower: number;
  absorbedCountryIds: string[];
  provinceRenames?: Record<string, string>;
}

// 24 Major Historical Empires & Kingdoms of the 1440 World
// Covers every continent with zero missing land gaps and 335+ rich provinces
export const EMPIRES_1440_DEFS: Empire1440Def[] = [
  {
    id: '792',
    name: 'Osmanlı Devleti (1440)',
    flagCode: 'OSM',
    color: '#E11D48',
    ideology: 'MONARCHY',
    capitalName: '★ Payitaht Edirne & Rumeli',
    treasury: 3200,
    manpower: 165000,
    absorbedCountryIds: ['792', '100', '807', '008'],
    provinceRenames: {
      '792': '★ Ankara & Bozok Sancağı',
      '792_EDR': 'Payitaht Edirne & Doğu Trakya',
      '792_IST': 'Kostantiniyye Boğazı & Çatalca',
      '792_BUR': 'Hüdavendigar & Bursa Sancağı',
      '792_IZM': 'Aydın & Saruhan Sancağı (İzmir)',
      '792_KUT': 'Germiyan & Kütahya Sancağı',
      '792_ANT': 'Teke & Hamideli Sancağı (Antalya)',
      '792_KNY': 'Karaman & Konya Sancağı',
      '792_KYS': 'Rum Eyaleti (Sivas & Amasya)',
      '792_KST': 'Candaroğulları (Kastamonu & Sinop)',
      '792_ADA': 'Ramazanoğulları (Çukurova & Adana)',
      '792_TRB': 'Canik & Trabzon Sancağı',
      '792_ERZ': 'Erzurum & Kars Serhaddi',
      '792_DYB': 'Diyarbekir & Ruha (Urfa) Sancağı',
      '100': 'Sofya & Rumeli Beylerbeyliği',
      '100_PDV': 'Filibe & Meriç Sancağı',
      '100_VAR': 'Varna & Silistre Kalesi',
      '807': 'Üsküp & Manastır Sancağı',
      '008': 'Arnavutluk & Avlonya Sancağı',
    },
  },
  {
    id: '300',
    name: 'Bizans & Mora Despotluğu',
    flagCode: 'BİZ',
    color: '#9333EA',
    ideology: 'MONARCHY',
    capitalName: '★ Mora & Mistra',
    treasury: 1950,
    manpower: 75000,
    absorbedCountryIds: ['300'],
    provinceRenames: {
      '300': '★ Mora & Atina Dükalığı',
      '300_SKG': 'Selanik & Teselya',
      '300_CRT': 'Girit & Ege Adaları',
    },
  },
  {
    id: '818',
    name: 'Memlük Sultanlığı',
    flagCode: 'MEM',
    color: '#D97706',
    ideology: 'MONARCHY',
    capitalName: '★ Kahire (Memlük)',
    treasury: 2800,
    manpower: 140000,
    absorbedCountryIds: ['818', '760', '400', '376', '275', '422', '682', '434', '887', '729'],
    provinceRenames: {
      '818': '★ Kahire & Nil Deltası',
      '818_ALY': 'İskenderiye & Dimyat Limanı',
      '818_SUZ': 'Süveyş & Sina Geçidi',
      '818_ASW': 'Yukarı Mısır & Asvan',
      '760': 'Şam Beylerbeyliği',
      '760_ALP': 'Halep & Antep Kalesi',
      '760_LTK': 'Trablusşam & Lazkiye Kıyısı',
      '760_DEZ': 'Rakka & Fırat Boyu',
      '400': 'Kerek & Ürdün Sancağı',
      '376': 'Kudüs-ü Şerif Sancağı',
      '682': 'Necd & Yemame',
      '682_JED': 'Hicaz & Mekke-i Mükerreme',
      '682_MED': 'Medine-i Münevvere & Tebük',
      '682_DMM': 'Lahsa & Bahreyn Kıyısı',
      '434': 'Trablusgarp Eyaleti',
      '434_BEN': 'Bingazi & Berka',
      '887': 'Sana & Yemen İmamlığı',
      '887_ADE': 'Aden & Babülmendep Limanı',
    },
  },
  {
    id: '031',
    name: 'Karakoyunlu & Akkoyunlu',
    flagCode: 'AKK',
    color: '#0EA5E9',
    ideology: 'MONARCHY',
    capitalName: '★ Tebriz & Bakü',
    treasury: 2350,
    manpower: 118000,
    absorbedCountryIds: ['031', '368', '051', '268'],
    provinceRenames: {
      '031': '★ Şirvan & Bakü Kalesi',
      '031_GNJ': 'Gence & Arran Beyliği',
      '031_SKX': 'Karabağ & Nahçıvan',
      '368': 'Bağdat & Irak-ı Arap',
      '368_BSR': 'Basra & Şattülarap',
      '368_EBL': 'Musul & Diyar-ı ربيعة',
      '368_KIK': 'Kerkük & Şehrizor',
      '268': 'Tiflis & Gürcistan Krallığı',
      '268_BUS': 'Batum & Çoruh Boyu',
    },
  },
  {
    id: '364',
    name: 'Timur İmparatorluğu',
    flagCode: 'TİM',
    color: '#0D9488',
    ideology: 'MONARCHY',
    capitalName: '★ Semerkant & Herat',
    treasury: 2950,
    manpower: 160000,
    absorbedCountryIds: ['364', '860', '795', '004', '512', '784', '414', '634'],
    provinceRenames: {
      '364': '★ Rey & Tahran',
      '364_ISF': 'İsfahan & Irak-ı Acem',
      '364_TBZ': 'Tebriz & Güney Azerbaycan',
      '364_AWZ': 'Huzistan & Hürmüz Boğazı',
      '364_SYZ': 'Şiraz & Fars Eyaleti',
      '364_MHD': 'Horasan & Meşhed',
      '860': 'Taşkent & Fergana Vadisi',
      '860_SKD': 'Semerkant & Buhara (Maveraünnehir)',
      '860_UGC': 'Hive & Harezmşah Yurdu',
      '795': 'Merv & Aşkabat',
      '795_KRW': 'Hazar & Mangışlak Kıyısı',
      '004': 'Kabil & Gazne',
      '004_HEA': 'Herat & Horasan Başkenti',
      '004_KDH': 'Kandahar & Sistan',
    },
  },
  {
    id: '643',
    name: 'Altın Orda & Moskova',
    flagCode: 'ORD',
    color: '#DC2626',
    ideology: 'MONARCHY',
    capitalName: '★ Moskova & Saray',
    treasury: 2650,
    manpower: 175000,
    absorbedCountryIds: ['643', '804', '398', '417', '762'],
    provinceRenames: {
      '643': '★ Moskova Büyük Knezi',
      '643_LED': 'Novgorod Cumhuriyeti',
      '643_KRR': 'Kırım & Kuban Hanlığı',
      '643_ASF': 'Astrahan & Saray-Batu',
      '643_KZN': 'Kazan & İdil-Bulgar Hanlığı',
      '643_SVX': 'Perm & Ural Yurdu',
      '643_OVB': 'Sibir Hanlığı (Tümen)',
      '804': 'Kiev & Dinyeper Kalesi',
      '804_LVV': 'Podolya & Galiçya',
      '804_ODS': 'Özi & Kefe Karadeniz Kıyısı',
      '804_HRK': 'Deşt-i Kıpçak & Don Boyu',
      '398': 'Ak Orda & Bozkır Hanlığı',
      '398_ALA': 'Yedisu & Çağatay Sınırı',
      '398_SCO': 'Nogay Orda & Yayık',
      '398_CIT': 'Yesi (Türkistan) & Seyhun',
    },
  },
  {
    id: '348',
    name: 'Macaristan & Eflak Krallığı',
    flagCode: 'MAC',
    color: '#16A34A',
    ideology: 'MONARCHY',
    capitalName: '★ Budin (Macaristan)',
    treasury: 2450,
    manpower: 125000,
    absorbedCountryIds: ['348', '642', '688', '070', '191', '703', '499'],
    provinceRenames: {
      '348': '★ Budin & Peşte Kalesi',
      '348_DEB': 'Debrecen & Tisa Ovası',
      '348_PEC': 'Peçuy & Mohaç Ovası',
      '642': 'Eflak Voyvodalığı (Târgoviște)',
      '642_CLJ': 'Erdel (Transilvanya) Voyvodalığı',
      '642_CND': 'Dobruca & Tuna Deltası',
      '688': 'Belgrad & Semendire Kalesi',
      '688_NIS': 'Niş & Sırbistan Despotluğu',
      '070': 'Bosna Krallığı (Bobovac)',
      '070_OMO': 'Hersek Dükalığı (Mostar)',
      '191': 'Zagreb & Hırvatistan Banlığı',
      '191_SPU': 'Dalmaçya & Ragusa (Dubrovnik)',
      '703': 'Yukarı Macaristan (Estergon & Kaşau)',
    },
  },
  {
    id: '276',
    name: 'Kutsal Roma İmparatorluğu',
    flagCode: 'KRI',
    color: '#F59E0B',
    ideology: 'MONARCHY',
    capitalName: '★ Viyana & Frankfurt',
    treasury: 3400,
    manpower: 165000,
    absorbedCountryIds: ['276', '040', '203', '756', '528', '056', '442'],
    provinceRenames: {
      '276': '★ Brandenburg Elektörlüğü (Berlin)',
      '276_MUC': 'Bavyera Dükalığı (Münih)',
      '276_FRA': 'Ren Palatinası & Frankfurt',
      '276_HAM': 'Hansa Birliği (Hamburg & Lübeck)',
      '276_DRS': 'Saksonya Elektörlüğü (Dresden)',
      '040': 'Avusturya Arşidüklüğü (Viyana)',
      '040_GRZ': 'Steiermark Dükalığı (Graz)',
      '040_INN': 'Tirol Kontluğu (Innsbruck)',
      '203': 'Bohemya Krallığı (Prag)',
      '203_BRQ': 'Moravya Margravlığı (Brno)',
      '756': 'İsviçre Konfederasyonu',
      '528': 'Felemenk & Hollanda Kontluğu',
      '056': 'Flandre & Brabant Dükalığı',
    },
  },
  {
    id: '380',
    name: 'Venedik & İtalya Devletleri',
    flagCode: 'VEN',
    color: '#0284C7',
    ideology: 'DEMOCRACY',
    capitalName: '★ Venedik & Roma',
    treasury: 3100,
    manpower: 120000,
    absorbedCountryIds: ['380', '705', '196'],
    provinceRenames: {
      '380': '★ Roma & Papalık Devleti',
      '380_MIL': 'Milano Dükalığı & Ceneviz',
      '380_VCE': 'Venedik Cumhuriyeti (Serenissima)',
      '380_NAP': 'Napoli & Sicilya Krallığı',
      '705': 'İstria & Karniyola',
      '196': 'Kıbrıs Krallığı & Venedik Limanı',
    },
  },
  {
    id: '616',
    name: 'Lehistan-Litvanya Birliği',
    flagCode: 'LEH',
    color: '#DB2777',
    ideology: 'MONARCHY',
    capitalName: '★ Krakow & Vilnius',
    treasury: 2550,
    manpower: 140000,
    absorbedCountryIds: ['616', '440', '112', '428', '233', '498'],
    provinceRenames: {
      '616': '★ Varşova & Mazovya Dükalığı',
      '616_KRK': 'Krakow & Küçük Polonya',
      '616_GDN': 'Gdansk & Töton Şövalyeleri Prusyası',
      '440': 'Vilnius & Litvanya Büyük Dükalığı',
      '440_KUN': 'Samogitya & Kaunas',
      '112': 'Minsk & Rutenya',
      '112_BQT': 'Brest & Polotsk Knezi',
      '428': 'Livonya Tarikatı (Riga)',
      '233': 'Reval (Estonya) Kalesi',
      '498': 'Boğdan Voyvodalığı (Suceava)',
    },
  },
  {
    id: '250',
    name: 'Fransa Krallığı',
    flagCode: 'FRA',
    color: '#2563EB',
    ideology: 'MONARCHY',
    capitalName: '★ Paris (Fransa)',
    treasury: 3000,
    manpower: 155000,
    absorbedCountryIds: ['250'],
    provinceRenames: {
      '250': '★ Paris & Île-de-France',
      '250_LYO': 'Burgunya Dükalığı & Lyon',
      '250_MRS': 'Provence Kontluğu & Marsilya',
      '250_BDX': 'Akitanya & Guyenne (Bordeaux)',
      '250_NTE': 'Normandiya & Bretonya Dükalığı',
    },
  },
  {
    id: '826',
    name: 'İngiltere Krallığı',
    flagCode: 'İNG',
    color: '#BE123C',
    ideology: 'MONARCHY',
    capitalName: '★ Londra (İngiltere)',
    treasury: 2900,
    manpower: 130000,
    absorbedCountryIds: ['826', '372', '352'],
    provinceRenames: {
      '826': '★ Londra & Wessex',
      '826_MAN': 'York & Lancaster (Kuzey İngiltere)',
      '826_CWL': 'Galler Prensliği (Cardiff)',
      '826_EDI': 'İskoçya Krallığı (Edinburgh)',
      '372': 'İrlanda Lordluğu (Dublin)',
    },
  },
  {
    id: '724',
    name: 'Kastilya, Aragon & Portekiz',
    flagCode: 'KAS',
    color: '#EA580C',
    ideology: 'MONARCHY',
    capitalName: '★ Toledo & Lizbon',
    treasury: 2800,
    manpower: 135000,
    absorbedCountryIds: ['724', '620'],
    provinceRenames: {
      '724': '★ Toledo & Kastilya Krallığı',
      '724_BCN': 'Aragon Tacı & Barselona',
      '724_SEV': 'Gırnata (Endülüs) & Sevilla',
      '724_BIO': 'Leon, Galiçya & Navarra',
      '620': 'Lizbon & Portekiz Krallığı',
      '620_OPO': 'Porto & Algarve Kıyısı',
    },
  },
  {
    id: '012',
    name: 'Mağrip & Fas Sultanlığı',
    flagCode: 'MAĞ',
    color: '#059669',
    ideology: 'MONARCHY',
    capitalName: '★ Fas & Tilimsan',
    treasury: 2200,
    manpower: 110000,
    absorbedCountryIds: ['012', '504', '788', '732', '478'],
    provinceRenames: {
      '012': '★ Cezayir & Bicâye',
      '012_ORN': 'Tilimsan (Zeyyânî) Sultanlığı',
      '012_HME': 'Büyük Sahra Vahaları',
      '504': 'Rabat & Atlas Kıyısı',
      '504_FEZ': 'Merînî Fes & Tanca Boğazı',
      '504_RAK': 'Marakeş & Sus Vadisi',
      '788': 'Hafsî Tunus Sultanlığı',
      '788_SFA': 'Kayrevan & Cerbe Adası',
    },
  },
  {
    id: '752',
    name: 'Kalmar Birliği (İskandinavya)',
    flagCode: 'KAL',
    color: '#0284C7',
    ideology: 'MONARCHY',
    capitalName: '★ Kopenhag & Stockholm',
    treasury: 2250,
    manpower: 105000,
    absorbedCountryIds: ['752', '578', '208', '246', '304'],
    provinceRenames: {
      '752': '★ Stockholm & Svealand',
      '752_GOT': 'Göteborg & Skåne',
      '752_KIR': 'Kuzey Laponya',
      '578': 'Oslo & Norveç Krallığı',
      '578_BGO': 'Bergen & Batı Fiyortları',
      '578_TOS': 'Halogaland & Kuzey Kıyısı',
      '208': 'Danimarka Krallığı (Kopenhag)',
      '246': 'Åbo (Turku) & Güney Finlandiya',
      '246_OUL': 'Karelya & Kuzey Finlandiya',
    },
  },
  {
    id: '231',
    name: 'Habeşistan & Adal Sultanlığı',
    flagCode: 'HAB',
    color: '#CA8A04',
    ideology: 'MONARCHY',
    capitalName: '★ Debre Berhan (Habeşistan)',
    treasury: 1900,
    manpower: 98000,
    absorbedCountryIds: ['231', '706', '232', '262', '404', '800', '728'],
    provinceRenames: {
      '231': '★ Habeşistan İmparatorluğu (Amhara)',
      '231_DIR': 'Adal Sultanlığı (Zeyla & Harar)',
      '706': 'Mogadişu & Somali Kıyısı',
      '404': 'Mombasa & Svahili Kıyısı',
    },
  },
  {
    id: '566',
    name: 'Mali & Songhay İmparatorluğu',
    flagCode: 'MAL',
    color: '#EAB308',
    ideology: 'MONARCHY',
    capitalName: '★ Timbuktu & Gao',
    treasury: 2400,
    manpower: 115000,
    absorbedCountryIds: [
      '566', '466', '562', '686', '288', '384', '324', '148', '120', '204', '768', '694', '430', '270', '624', '854',
    ],
    provinceRenames: {
      '566': '★ Hausa Krallıkları (Kano & Zaria)',
      '566_LOS': 'Benin İmparatorluğu & Gine Kıyısı',
      '466': 'Timbuktu & Mali İmparatorluğu',
      '562': 'Gao & Songhay Sultanlığı',
      '148': 'Kanem-Bornu Sultanlığı',
    },
  },
  {
    id: '710',
    name: 'Kilva & Büyük Zimbabve',
    flagCode: 'ZİM',
    color: '#15803D',
    ideology: 'MONARCHY',
    capitalName: '★ Büyük Zimbabve & Kilva',
    treasury: 1850,
    manpower: 92000,
    absorbedCountryIds: [
      '710', '716', '508', '834', '450', '024', '180', '178', '266', '894', '454', '516', '072',
    ],
    provinceRenames: {
      '710': '★ Mapungubve & Transvaal',
      '710_CPT': 'Ümit Burnu Kıyısı',
      '716': 'Büyük Zimbabve & Mutapa Krallığı',
      '834': 'Kilva Sultanlığı & Zengibar',
      '180': 'Kongo Krallığı',
      '450': 'Merina & Madagaskar',
    },
  },
  {
    id: '356',
    name: 'Delhi & Behmenî Sultanlığı',
    flagCode: 'DEL',
    color: '#10B981',
    ideology: 'MONARCHY',
    capitalName: '★ Delhi (Hindistan)',
    treasury: 3100,
    manpower: 185000,
    absorbedCountryIds: ['356', '586', '050', '144', '524'],
    provinceRenames: {
      '356': '★ Delhi Sultanlığı',
      '356_BOM': 'Gücerat & Behmenî Sultanlığı',
      '356_HYD': 'Golkonda & Dekkan Yaylası',
      '356_CCU': 'Bengal Sultanlığı (Gaur)',
      '356_BLR': 'Vijayanagara İmparatorluğu',
      '586': 'Multan & Lahor (Pencap)',
      '586_KHI': 'Sind (Semmâ) Sultanlığı',
      '586_PEW': 'Kâbil-Peşaver Geçidi',
      '050': 'Doğu Bengal & Çittagong',
      '144': 'Kotte Krallığı (Seylan)',
    },
  },
  {
    id: '360',
    name: 'Majapahit & Malakka Sultanlığı',
    flagCode: 'MAJ',
    color: '#F97316',
    ideology: 'MONARCHY',
    capitalName: '★ Cava & Malakka Boğazı',
    treasury: 2300,
    manpower: 120000,
    absorbedCountryIds: ['360', '458', '764', '704', '104', '116', '418', '608', '036', '554', '598'],
    provinceRenames: {
      '360': '★ Majapahit İmparatorluğu (Cava)',
      '360_MES': 'Açe & Sumatra (Malakka Boğazı)',
      '360_BPN': 'Brunei & Borneo Adası',
      '458': 'Malakka Sultanlığı',
      '764': 'Ayutthaya Krallığı (Siyam)',
      '704': 'Dai Viet (Vietnam) Krallığı',
      '104': 'Ava & Pegu (Birmanya)',
    },
  },
  {
    id: '156',
    name: 'Ming Hanedanı (Çin)',
    flagCode: 'MİN',
    color: '#EF4444',
    ideology: 'MONARCHY',
    capitalName: '★ Pekin (Ming)',
    treasury: 3800,
    manpower: 220000,
    absorbedCountryIds: ['156', '496', '410', '408', '158'],
    provinceRenames: {
      '156': '★ Pekin (Yasak Şehir)',
      '156_SHA': 'Nanjing & Doğu Denizi',
      '156_CAN': 'Kanton & Güney Çin',
      '156_SHE': 'Liaodong & Mançurya (Cürçenler)',
      '156_CTU': 'Siçuan & İç Çin',
      '156_URC': 'Yarkent & Kaşgar (Doğu Türkistan)',
      '496': 'Kuzey Yuan & Oyrat Hanlığı',
      '496_Kov': 'Karakurum & Altay Bozkırı',
      '410': 'Joseon Krallığı (Hanseong / Seul)',
      '410_PUS': 'Busan & Kore Boğazı',
    },
  },
  {
    id: '392',
    name: 'Ashikaga Şogunluğu (Japonya)',
    flagCode: 'ŞOG',
    color: '#F43F5E',
    ideology: 'MILITARY_JUNTA',
    capitalName: '★ Kyoto (Şogunluk)',
    treasury: 2600,
    manpower: 130000,
    absorbedCountryIds: ['392'],
    provinceRenames: {
      '392': '★ Kamakura & Kanto',
      '392_OSA': 'Kyoto (Başkent) & Kansai Daimyoları',
      '392_SPK': 'Ezo (Hokkaido) & Kuzey',
    },
  },
  {
    id: '484',
    name: 'Aztek & Maya Konfederasyonu',
    flagCode: 'AZT',
    color: '#14B8A6',
    ideology: 'MONARCHY',
    capitalName: '★ Tenochtitlan (Aztek)',
    treasury: 2150,
    manpower: 115000,
    absorbedCountryIds: ['484', '840', '124', '320', '340', '558', '188', '591', '192', '214', '332'],
    provinceRenames: {
      '484': '★ Tenochtitlan (Üçlü İttifak)',
      '484_MTY': 'Chichimeca & Kuzey Yaylası',
      '484_GDL': 'Maya Şehir Devletleri (Yucatan)',
      '840': 'İrokua (Haudenosaunee) Konfederasyonu',
      '840_CHI': 'Büyük Göller & Algonkin Yurdu',
      '840_ATL': 'Mississippi & Çeroki Konfederasyonu',
      '840_HOU': 'Büyük Ovalar & Komançi Yurdu',
      '840_LAX': 'Pasifik Kıyısı & Pueblo Yurdu',
    },
  },
  {
    id: '076',
    name: 'İnka İmparatorluğu (Tawantinsuyu)',
    flagCode: 'İNK',
    color: '#8B5CF6',
    ideology: 'MONARCHY',
    capitalName: '★ Cusco (İnka)',
    treasury: 2250,
    manpower: 120000,
    absorbedCountryIds: ['076', '604', '068', '152', '032', '170', '862', '218', '600', '858'],
    provinceRenames: {
      '604': '★ Cusco (Tawantinsuyu Başkenti)',
      '068': 'Qullasuyu (Titicaca & Yüksek Andlar)',
      '218': 'Quito & Kuzey Andlar',
      '152': 'Güney Andlar & Mapuçe Yurdu',
      '076': 'Merkez Yaylalar & Tupi Yurdu',
      '076_GRU': 'Atlantik Kıyısı & Guarani Yurdu',
      '076_MAO': 'Amazon Havzası',
      '032': 'Pampa & Güney Ovaları',
    },
  },
];

export function transformBundleTo1440Scenario(
  baseBundle: InitialWorldBundle
): InitialWorldBundle {
  // Map every absorbed country ID to its 1440 Empire owner ID
  const countryToEmpireId: Record<string, string> = {};
  const empireDefMap: Record<string, Empire1440Def> = {};

  EMPIRES_1440_DEFS.forEach((emp) => {
    empireDefMap[emp.id] = emp;
    emp.absorbedCountryIds.forEach((cId) => {
      countryToEmpireId[cId] = emp.id;
    });
  });

  const nations: Record<string, Nation> = {};
  const territories: Record<string, Territory> = {};
  const features: GeoCountryFeature[] = [];

  // 1. Create the 24 Historical Empires
  EMPIRES_1440_DEFS.forEach((emp) => {
    const baseN = baseBundle.nations[emp.id];
    const isOttoman = emp.id === '792';
    nations[emp.id] = {
      ...(baseN || {
        id: emp.id,
        capitalTerritoryId: emp.id,
        stability: 82,
        inflation: 2.5,
        researchPoints: 135,
        taxRate: 25,
        budget: { military: 35, economy: 30, research: 15, welfare: 20 },
        aggressiveExpansion: 15,
        unlockedTechs: ['eco_1'],
        modernizedArmyTier: 0,
        enactedReforms: [],
        recruitedGeneralIds: [],
        activeGeneralId: null,
        clanInfluence: 160,
        bannerCalledLordIds: [],
        formedEmpireId: null,
        vassalOf: null,
        isEliminated: false,
      }),
      id: emp.id,
      name: emp.name,
      flagCode: emp.flagCode,
      color: emp.color,
      ideology: emp.ideology,
      capitalTerritoryId: emp.id,
      treasury: Math.round(emp.treasury * 0.45),
      manpower: emp.manpower,
      researchPoints: isOttoman ? 65 : 50,
      unlockedTechs: ['eco_1'],
      modernizedArmyTier: 0,
      recruitedGeneralIds: isOttoman ? ['cmd_candarli'] : [],
      activeGeneralId: isOttoman ? 'cmd_candarli' : null,
      clanInfluence: 110,
      bannerCalledLordIds: [],
    };
  });

  // Precompute empire capital coordinates so any unmapped country joins its closest regional 1440 empire (zero missing land holes!)
  const empireAnchorCoords: { id: string; lon: number; lat: number }[] =
    EMPIRES_1440_DEFS.map((emp) => {
      const capT = baseBundle.territories[emp.id];
      return {
        id: emp.id,
        lon: capT?.centroid[0] ?? 30,
        lat: capT?.centroid[1] ?? 40,
      };
    });

  // 2. Reassign all world provinces to the 24 Historical Empires so 100% of world landmasses are rendered!
  baseBundle.features.forEach((feat) => {
    const baseCountryId = feat.id.split('_')[0];
    const baseT = baseBundle.territories[feat.id];
    if (!baseT) return;

    let targetEmpireId = countryToEmpireId[baseCountryId];
    if (!targetEmpireId) {
      // Find closest regional 1440 empire by centroid so no land polygon is ever dropped
      let bestId = '792';
      let bestDist = Infinity;
      for (const anc of empireAnchorCoords) {
        const d =
          (baseT.centroid[0] - anc.lon) ** 2 +
          (baseT.centroid[1] - anc.lat) ** 2;
        if (d < bestDist) {
          bestDist = d;
          bestId = anc.id;
        }
      }
      targetEmpireId = bestId;
    }

    const empDef = empireDefMap[targetEmpireId];
    const renames = empDef?.provinceRenames || {};
    const customName =
      renames[feat.id] ||
      renames[feat.id.toLowerCase()] ||
      renames[feat.id.toUpperCase()] ||
      baseT.name;
    const isEmpireCapital = feat.id === targetEmpireId;

    features.push({
      ...feat,
      properties: {
        ...feat.properties,
        name: customName,
      },
    });

    territories[feat.id] = {
      ...baseT,
      name: customName,
      ownerId: targetEmpireId,
      coreOwnerId: targetEmpireId,
      isCapital: isEmpireCapital,
      unrest: 4,
    };
  });

  // 3. Clean up neighbor links and ensure every province has >=2 neighbors
  const validProvIds = Object.keys(territories);
  const validSet = new Set(validProvIds);

  validProvIds.forEach((pId) => {
    territories[pId].neighbors = territories[pId].neighbors.filter((nId) =>
      validSet.has(nId)
    );
  });

  const link1440 = (a: string, b: string) => {
    if (!a || !b || a === b || !territories[a] || !territories[b]) return;
    if (!territories[a].neighbors.includes(b)) {
      territories[a].neighbors.push(b);
    }
    if (!territories[b].neighbors.includes(a)) {
      territories[b].neighbors.push(a);
    }
  };

  // Connect key 1440 historical straits & borders (Balkans, Bosphorus, Gibraltar, Suez, Hormuz, Danish Sund, Tsushima, Channel)
  link1440('792_EDR', '792_IST');
  link1440('792_EDR', '100');
  link1440('792_EDR', '300_SKG');
  link1440('792_IST', '792_BUR');
  link1440('792_IZM', '300_CRT');
  link1440('792', '300');
  link1440('792', '100');
  link1440('100', '642');
  link1440('100', '688');
  link1440('688', '348');
  link1440('348', '040');
  link1440('792_ADA', '760_ALP');
  link1440('792_DYB', '368_EBL');
  link1440('792_ERZ', '031_GNJ');
  link1440('792_ERZ', '364_TBZ');
  STRATEGIC_STRAITS.forEach((st) => {
    st.crossingEdges.forEach(([a, b]) => link1440(a, b));
  });

  validProvIds.forEach((pId) => {
    if (territories[pId].neighbors.length < 2) {
      const cA = territories[pId].centroid;
      validProvIds
        .filter((otherId) => otherId !== pId)
        .map((otherId) => {
          const cB = territories[otherId].centroid;
          return {
            otherId,
            distSq: (cA[0] - cB[0]) ** 2 + (cA[1] - cB[1]) ** 2,
          };
        })
        .sort((a, b) => a.distSq - b.distSq)
        .slice(0, 3)
        .forEach((item) => link1440(pId, item.otherId));
    }
  });

  // 4. Historical 1440 Diplomatic Relations
  const relations: Record<string, DiplomaticRelation> = {};
  const setRel = (
    a: string,
    b: string,
    partial: Partial<DiplomaticRelation>
  ) => {
    if (!nations[a] || !nations[b]) return;
    const key = relationKey(a, b);
    relations[key] = {
      nationA: a < b ? a : b,
      nationB: a < b ? b : a,
      score: partial.score ?? 0,
      isAllied: partial.isAllied ?? false,
      allianceType:
        partial.allianceType ?? (partial.isAllied ? 'OFFENSIVE' : null),
      hasNonAggression: partial.hasNonAggression ?? false,
      hasTradeAgreement: partial.hasTradeAgreement ?? false,
      hasEmbargo: partial.hasEmbargo ?? false,
      hasMilitaryAccess: partial.hasMilitaryAccess ?? false,
      truceUntilTick: 0,
    };
  };

  // Ottoman - Byzantium, Hungary & Venice rivalry (1440-1453 Varna & Constantinople era)
  setRel('792', '300', { score: -70 });
  setRel('792', '348', { score: -55 });
  setRel('792', '380', { score: -40 });
  // Hungary - Poland personal union / alliance
  setRel('348', '616', {
    score: 85,
    isAllied: true,
    allianceType: 'OFFENSIVE',
    hasMilitaryAccess: true,
  });
  // France - England Hundred Years' War tension
  setRel('250', '826', { score: -65 });
  // Ottoman - Mamluk & Karakoyunlu/Timurid balance
  setRel('792', '818', { score: 25, hasTradeAgreement: true });
  setRel('792', '031', { score: 35, hasTradeAgreement: true });
  setRel('792', '364', { score: -20 });

  return {
    features,
    nations,
    territories,
    relations,
  };
}
