import { geoArea } from 'd3-geo';
import type { Feature, Geometry, Polygon, Position } from 'geojson';
import { ResourceType } from '../types/game';

export interface ProvinceSubSeed {
  suffixId: string;
  name: string;
  lon: number;
  lat: number;
  isCapital?: boolean;
  gdpShare: number;
  resource?: ResourceType;
}

// Curated authentic sub-provinces for major and regional countries (Expanded to ~335+ provinces worldwide)
export const COUNTRY_PROVINCE_SEEDS: Record<string, ProvinceSubSeed[]> = {
  // Türkiye / Osmanlı Coğrafyası (14 Tarihsel Sancak & Eyalet)
  '792': [
    { suffixId: 'ANK', name: 'Ankara & Bozok Sancağı', lon: 32.85, lat: 39.92, isCapital: true, gdpShare: 0.11, resource: 'DEMIR_CELIK' },
    { suffixId: 'IST', name: 'Kostantiniyye & Boğazlar', lon: 28.97, lat: 41.02, gdpShare: 0.15, resource: 'TICARET_BOGAZI' },
    { suffixId: 'EDR', name: 'Edirne & Doğu Trakya', lon: 26.55, lat: 41.67, gdpShare: 0.09, resource: 'TAHIL' },
    { suffixId: 'BUR', name: 'Hüdavendigar & Bursa', lon: 29.06, lat: 40.18, gdpShare: 0.09, resource: 'FINANS_MERKEZI' },
    { suffixId: 'IZM', name: 'Aydın & Saruhan (İzmir)', lon: 27.14, lat: 38.42, gdpShare: 0.09, resource: 'TICARET_BOGAZI' },
    { suffixId: 'KUT', name: 'Germiyan & Kütahya', lon: 29.98, lat: 39.42, gdpShare: 0.06, resource: 'DEMIR_CELIK' },
    { suffixId: 'ANT', name: 'Teke & Antalya Sancağı', lon: 30.70, lat: 36.88, gdpShare: 0.06, resource: 'TAHIL' },
    { suffixId: 'KNY', name: 'Karaman & Konya', lon: 32.48, lat: 37.87, gdpShare: 0.06, resource: 'TAHIL' },
    { suffixId: 'KYS', name: 'Rum & Sivas-Kayseri', lon: 36.15, lat: 39.20, gdpShare: 0.06, resource: 'DEMIR_CELIK' },
    { suffixId: 'KST', name: 'Candar & Kastamonu-Sinop', lon: 34.20, lat: 41.55, gdpShare: 0.05, resource: 'TICARET_BOGAZI' },
    { suffixId: 'ADA', name: 'Çukurova & Adana', lon: 35.32, lat: 37.00, gdpShare: 0.05, resource: 'TAHIL' },
    { suffixId: 'TRB', name: 'Canik & Trabzon (Karadeniz)', lon: 39.71, lat: 41.00, gdpShare: 0.05, resource: 'DOGALGAZ' },
    { suffixId: 'ERZ', name: 'Erzurum & Kars Sancağı', lon: 41.60, lat: 40.10, gdpShare: 0.04, resource: 'DEMIR_CELIK' },
    { suffixId: 'DYB', name: 'Diyarbekir & Urfa (El-Cezire)', lon: 40.23, lat: 37.91, gdpShare: 0.04, resource: 'PETROL' },
  ],
  // Yunanistan (3 Bölge)
  '300': [
    { suffixId: 'ATH', name: 'Atina & Mora', lon: 23.72, lat: 37.98, isCapital: true, gdpShare: 0.48, resource: 'TICARET_BOGAZI' },
    { suffixId: 'SKG', name: 'Selanik & Batı Trakya', lon: 22.94, lat: 40.64, gdpShare: 0.32, resource: 'TAHIL' },
    { suffixId: 'CRT', name: 'Girit & Ege Adaları', lon: 25.14, lat: 35.33, gdpShare: 0.20, resource: 'TICARET_BOGAZI' },
  ],
  // Bulgaristan (3 Bölge)
  '100': [
    { suffixId: 'SOF', name: 'Sofya & Batı Rumeli', lon: 23.32, lat: 42.69, isCapital: true, gdpShare: 0.44, resource: 'DEMIR_CELIK' },
    { suffixId: 'PDV', name: 'Filibe & Meriç Vadisi', lon: 24.74, lat: 42.14, gdpShare: 0.30, resource: 'TAHIL' },
    { suffixId: 'VAR', name: 'Varna & Deliorman', lon: 27.91, lat: 43.21, gdpShare: 0.26, resource: 'TICARET_BOGAZI' },
  ],
  // Sırbistan (2 Bölge)
  '688': [
    { suffixId: 'BEG', name: 'Belgrad & Tuna Boyu', lon: 20.46, lat: 44.81, isCapital: true, gdpShare: 0.58, resource: 'DEMIR_CELIK' },
    { suffixId: 'NIS', name: 'Niş & Morava Vadisi', lon: 21.89, lat: 43.32, gdpShare: 0.42, resource: 'TAHIL' },
  ],
  // Bosna-Hersek (2 Bölge)
  '070': [
    { suffixId: 'SJJ', name: 'Saraybosna & Bosna Sancağı', lon: 18.41, lat: 43.85, isCapital: true, gdpShare: 0.60, resource: 'DEMIR_CELIK' },
    { suffixId: 'OMO', name: 'Mostar & Hersek Sancağı', lon: 17.80, lat: 43.34, gdpShare: 0.40, resource: 'TAHIL' },
  ],
  // Hırvatistan (2 Bölge)
  '191': [
    { suffixId: 'ZAG', name: 'Zagreb & Slavonya', lon: 15.98, lat: 45.81, isCapital: true, gdpShare: 0.58, resource: 'TAHIL' },
    { suffixId: 'SPU', name: 'Split & Dalmaçya Kıyısı', lon: 16.44, lat: 43.50, gdpShare: 0.42, resource: 'TICARET_BOGAZI' },
  ],
  // Romanya (3 Bölge)
  '642': [
    { suffixId: 'BUH', name: 'Bükreş & Eflak', lon: 26.10, lat: 44.42, isCapital: true, gdpShare: 0.44, resource: 'FINANS_MERKEZI' },
    { suffixId: 'CLJ', name: 'Kaloşvar & Erdel (Transilvanya)', lon: 23.60, lat: 46.77, gdpShare: 0.32, resource: 'DEMIR_CELIK' },
    { suffixId: 'CND', name: 'Köstence & Dobruca', lon: 28.63, lat: 44.17, gdpShare: 0.24, resource: 'PETROL' },
  ],
  // Macaristan (3 Bölge)
  '348': [
    { suffixId: 'BUD', name: 'Budin & Peşte', lon: 19.04, lat: 47.49, isCapital: true, gdpShare: 0.46, resource: 'FINANS_MERKEZI' },
    { suffixId: 'DEB', name: 'Debrecen & Tisa Ovası', lon: 21.62, lat: 47.53, gdpShare: 0.30, resource: 'TAHIL' },
    { suffixId: 'PEC', name: 'Peçuy (Pécs) & Güney Tuna', lon: 18.23, lat: 46.07, gdpShare: 0.24, resource: 'DEMIR_CELIK' },
  ],
  // Avusturya (3 Bölge)
  '040': [
    { suffixId: 'VIE', name: 'Viyana & Aşağı Avusturya', lon: 16.37, lat: 48.20, isCapital: true, gdpShare: 0.48, resource: 'FINANS_MERKEZI' },
    { suffixId: 'GRZ', name: 'Graz & Steiermark', lon: 15.43, lat: 47.07, gdpShare: 0.28, resource: 'DEMIR_CELIK' },
    { suffixId: 'INN', name: 'Innsbruck & Tirol Alpleri', lon: 11.40, lat: 47.26, gdpShare: 0.24, resource: 'YARI_ILETKEN' },
  ],
  // Çekya / Bohemya (2 Bölge)
  '203': [
    { suffixId: 'PRG', name: 'Prag & Bohemya', lon: 14.43, lat: 50.07, isCapital: true, gdpShare: 0.60, resource: 'DEMIR_CELIK' },
    { suffixId: 'BRQ', name: 'Brno & Moravya', lon: 16.60, lat: 49.19, gdpShare: 0.40, resource: 'YARI_ILETKEN' },
  ],
  // Suriye (4 Bölge)
  '760': [
    { suffixId: 'DAM', name: 'Şam & Güney Suriye', lon: 36.29, lat: 33.51, isCapital: true, gdpShare: 0.34, resource: 'TAHIL' },
    { suffixId: 'ALP', name: 'Halep & Kuzey الشام', lon: 37.16, lat: 36.20, gdpShare: 0.30, resource: 'TAHIL' },
    { suffixId: 'LTK', name: 'Lazkiye & Akdeniz Kıyısı', lon: 35.78, lat: 35.53, gdpShare: 0.18, resource: 'TICARET_BOGAZI' },
    { suffixId: 'DEZ', name: 'Deyrizor & Fırat Havzası', lon: 40.14, lat: 35.33, gdpShare: 0.18, resource: 'PETROL' },
  ],
  // Irak (4 Bölge)
  '368': [
    { suffixId: 'BGW', name: 'Bağdat & Mezopotamya', lon: 44.36, lat: 33.31, isCapital: true, gdpShare: 0.36, resource: 'PETROL' },
    { suffixId: 'BSR', name: 'Basra & Şattülarap', lon: 47.78, lat: 30.50, gdpShare: 0.28, resource: 'PETROL' },
    { suffixId: 'EBL', name: 'Musul & Ninova', lon: 43.13, lat: 36.34, gdpShare: 0.20, resource: 'DOGALGAZ' },
    { suffixId: 'KIK', name: 'Kerkük & Şehrizor', lon: 44.39, lat: 35.46, gdpShare: 0.16, resource: 'PETROL' },
  ],
  // Gürcistan (2 Bölge)
  '268': [
    { suffixId: 'TBS', name: 'Tiflis & Kartli-Kaheti', lon: 44.78, lat: 41.71, isCapital: true, gdpShare: 0.62, resource: 'DEMIR_CELIK' },
    { suffixId: 'BUS', name: 'Batum & Acara Kıyısı', lon: 41.63, lat: 41.64, gdpShare: 0.38, resource: 'TICARET_BOGAZI' },
  ],
  // Azerbaycan (3 Bölge)
  '031': [
    { suffixId: 'BAK', name: 'Bakü & Şirvan (Hazar)', lon: 49.86, lat: 40.40, isCapital: true, gdpShare: 0.50, resource: 'PETROL' },
    { suffixId: 'GNJ', name: 'Gence & Arran', lon: 46.36, lat: 40.68, gdpShare: 0.28, resource: 'DOGALGAZ' },
    { suffixId: 'SKX', name: 'Şuşa & Karabağ', lon: 46.75, lat: 39.76, gdpShare: 0.22, resource: 'DEMIR_CELIK' },
  ],
  // İran (6 Bölge)
  '364': [
    { suffixId: 'THR', name: 'Tahran & Rey', lon: 51.38, lat: 35.68, isCapital: true, gdpShare: 0.24, resource: 'FINANS_MERKEZI' },
    { suffixId: 'TBZ', name: 'Tebriz & Güney Azerbaycan', lon: 46.29, lat: 38.08, gdpShare: 0.18, resource: 'DOGALGAZ' },
    { suffixId: 'ISF', name: 'İsfahan & Merkez İran', lon: 51.67, lat: 32.65, gdpShare: 0.18, resource: 'DEMIR_CELIK' },
    { suffixId: 'AWZ', name: 'Ahvaz & Huzistan (Hürmüz)', lon: 48.67, lat: 31.32, gdpShare: 0.16, resource: 'PETROL' },
    { suffixId: 'SYZ', name: 'Şiraz & Fars Eyaleti', lon: 52.53, lat: 29.59, gdpShare: 0.12, resource: 'TICARET_BOGAZI' },
    { suffixId: 'MHD', name: 'Meşhed & Horasan', lon: 59.60, lat: 36.29, gdpShare: 0.12, resource: 'DEMIR_CELIK' },
  ],
  // Almanya (5 Bölge)
  '276': [
    { suffixId: 'BER', name: 'Berlin & Brandenburg', lon: 13.40, lat: 52.52, isCapital: true, gdpShare: 0.22, resource: 'YARI_ILETKEN' },
    { suffixId: 'MUC', name: 'Münih & Bavyera', lon: 11.58, lat: 48.13, gdpShare: 0.24, resource: 'YARI_ILETKEN' },
    { suffixId: 'FRA', name: 'Frankfurt & Ren-Vestfalya', lon: 7.50, lat: 50.90, gdpShare: 0.24, resource: 'FINANS_MERKEZI' },
    { suffixId: 'HAM', name: 'Hamburg & Aşağı Saksonya', lon: 9.99, lat: 53.55, gdpShare: 0.16, resource: 'TICARET_BOGAZI' },
    { suffixId: 'DRS', name: 'Dresden & Saksonya', lon: 13.73, lat: 51.05, gdpShare: 0.14, resource: 'DEMIR_CELIK' },
  ],
  // Fransa (5 Bölge)
  '250': [
    { suffixId: 'PAR', name: 'Paris & Île-de-France', lon: 2.35, lat: 48.85, isCapital: true, gdpShare: 0.30, resource: 'FINANS_MERKEZI' },
    { suffixId: 'LYO', name: 'Lyon & Burgunya', lon: 4.83, lat: 45.76, gdpShare: 0.20, resource: 'YARI_ILETKEN' },
    { suffixId: 'MRS', name: 'Marsilya & Provence', lon: 5.36, lat: 43.29, gdpShare: 0.18, resource: 'TICARET_BOGAZI' },
    { suffixId: 'BDX', name: 'Bordeaux & Akitanya', lon: -0.57, lat: 44.83, gdpShare: 0.16, resource: 'TAHIL' },
    { suffixId: 'NTE', name: 'Normandiya & Bretonya', lon: -1.55, lat: 47.90, gdpShare: 0.16, resource: 'TICARET_BOGAZI' },
  ],
  // Birleşik Krallık (4 Bölge)
  '826': [
    { suffixId: 'LON', name: 'Londra & Güney İngiltere', lon: -0.12, lat: 51.50, isCapital: true, gdpShare: 0.40, resource: 'FINANS_MERKEZI' },
    { suffixId: 'MAN', name: 'Manchester & York (Kuzey)', lon: -2.24, lat: 53.48, gdpShare: 0.26, resource: 'DEMIR_CELIK' },
    { suffixId: 'CWL', name: 'Cardiff & Galler', lon: -3.18, lat: 51.48, gdpShare: 0.14, resource: 'DEMIR_CELIK' },
    { suffixId: 'EDI', name: 'Edinburgh & İskoçya', lon: -3.18, lat: 56.50, gdpShare: 0.20, resource: 'PETROL' },
  ],
  // İtalya (4 Bölge)
  '380': [
    { suffixId: 'ROM', name: 'Roma & Lazio', lon: 12.49, lat: 41.90, isCapital: true, gdpShare: 0.28, resource: 'FINANS_MERKEZI' },
    { suffixId: 'MIL', name: 'Milano & Lombardiya', lon: 9.19, lat: 45.46, gdpShare: 0.30, resource: 'YARI_ILETKEN' },
    { suffixId: 'VCE', name: 'Venedik & Veneto', lon: 12.31, lat: 45.44, gdpShare: 0.22, resource: 'TICARET_BOGAZI' },
    { suffixId: 'NAP', name: 'Napoli & Sicilya', lon: 14.26, lat: 39.80, gdpShare: 0.20, resource: 'TICARET_BOGAZI' },
  ],
  // İspanya (4 Bölge)
  '724': [
    { suffixId: 'MAD', name: 'Madrid & Kastilya', lon: -3.70, lat: 40.41, isCapital: true, gdpShare: 0.32, resource: 'FINANS_MERKEZI' },
    { suffixId: 'BCN', name: 'Barselona & Aragon-Katalonya', lon: 2.17, lat: 41.38, gdpShare: 0.28, resource: 'TICARET_BOGAZI' },
    { suffixId: 'SEV', name: 'Sevilla & Endülüs (Granada)', lon: -5.98, lat: 37.38, gdpShare: 0.22, resource: 'TAHIL' },
    { suffixId: 'BIO', name: 'Bilbao & Galiçya-Asturias', lon: -5.80, lat: 43.00, gdpShare: 0.18, resource: 'DEMIR_CELIK' },
  ],
  // Portekiz (2 Bölge)
  '620': [
    { suffixId: 'LIS', name: 'Lizbon & Tejo Kıyısı', lon: -9.13, lat: 38.72, isCapital: true, gdpShare: 0.60, resource: 'TICARET_BOGAZI' },
    { suffixId: 'OPO', name: 'Porto & Kuzey Portekiz', lon: -8.62, lat: 41.15, gdpShare: 0.40, resource: 'FINANS_MERKEZI' },
  ],
  // Ukrayna (4 Bölge)
  '804': [
    { suffixId: 'KYV', name: 'Kiev & Dinyeper', lon: 30.52, lat: 50.45, isCapital: true, gdpShare: 0.32, resource: 'TAHIL' },
    { suffixId: 'LVV', name: 'Lviv & Galiçya-Podolya', lon: 24.03, lat: 49.84, gdpShare: 0.22, resource: 'TAHIL' },
    { suffixId: 'ODS', name: 'Odessa & Özi-Kefe Kıyısı', lon: 30.72, lat: 46.48, gdpShare: 0.24, resource: 'TICARET_BOGAZI' },
    { suffixId: 'HRK', name: 'Harkiv & Donbas Bozkırı', lon: 36.23, lat: 49.00, gdpShare: 0.22, resource: 'DEMIR_CELIK' },
  ],
  // Polonya (3 Bölge)
  '616': [
    { suffixId: 'WAW', name: 'Varşova & Mazovya', lon: 21.01, lat: 52.23, isCapital: true, gdpShare: 0.42, resource: 'FINANS_MERKEZI' },
    { suffixId: 'KRK', name: 'Krakow & Silezya', lon: 19.94, lat: 50.06, gdpShare: 0.32, resource: 'DEMIR_CELIK' },
    { suffixId: 'GDN', name: 'Gdansk & Baltık Prusyası', lon: 18.64, lat: 54.35, gdpShare: 0.26, resource: 'TICARET_BOGAZI' },
  ],
  // Belarus (2 Bölge)
  '112': [
    { suffixId: 'MSQ', name: 'Minsk & Beyaz Rusya', lon: 27.56, lat: 53.90, isCapital: true, gdpShare: 0.58, resource: 'TAHIL' },
    { suffixId: 'BQT', name: 'Brest & Polotsk', lon: 23.68, lat: 52.09, gdpShare: 0.42, resource: 'DEMIR_CELIK' },
  ],
  // Litvanya (2 Bölge)
  '440': [
    { suffixId: 'VNO', name: 'Vilnius & Doğu Litvanya', lon: 25.27, lat: 54.68, isCapital: true, gdpShare: 0.58, resource: 'TAHIL' },
    { suffixId: 'KUN', name: 'Kaunas & Samogitya', lon: 23.90, lat: 54.89, gdpShare: 0.42, resource: 'TICARET_BOGAZI' },
  ],
  // İsveç (3 Bölge)
  '752': [
    { suffixId: 'STO', name: 'Stokholm & Svealand', lon: 18.06, lat: 59.32, isCapital: true, gdpShare: 0.45, resource: 'YARI_ILETKEN' },
    { suffixId: 'GOT', name: 'Göteborg & Götaland', lon: 11.97, lat: 57.70, gdpShare: 0.33, resource: 'TICARET_BOGAZI' },
    { suffixId: 'KIR', name: 'Kiruna & Kuzey Laponya', lon: 20.22, lat: 67.85, gdpShare: 0.22, resource: 'DEMIR_CELIK' },
  ],
  // Norveç (3 Bölge)
  '578': [
    { suffixId: 'OSL', name: 'Oslo & Güney Norveç', lon: 10.75, lat: 59.91, isCapital: true, gdpShare: 0.46, resource: 'FINANS_MERKEZI' },
    { suffixId: 'BGO', name: 'Bergen & Kuzey Denizi', lon: 5.32, lat: 60.39, gdpShare: 0.34, resource: 'DOGALGAZ' },
    { suffixId: 'TOS', name: 'Tromsø & Arktik Kıyısı', lon: 18.95, lat: 69.64, gdpShare: 0.20, resource: 'PETROL' },
  ],
  // Finlandiya (2 Bölge)
  '246': [
    { suffixId: 'HEL', name: 'Helsinki & Güney Finlandiya', lon: 24.93, lat: 60.16, isCapital: true, gdpShare: 0.64, resource: 'YARI_ILETKEN' },
    { suffixId: 'OUL', name: 'Oulu & Karelya-Laponya', lon: 25.46, lat: 65.01, gdpShare: 0.36, resource: 'DEMIR_CELIK' },
  ],
  // Rusya (7 Bölge)
  '643': [
    { suffixId: 'MOW', name: 'Moskova & Merkez Rusya', lon: 37.61, lat: 55.75, isCapital: true, gdpShare: 0.25, resource: 'FINANS_MERKEZI' },
    { suffixId: 'LED', name: 'St. Petersburg & Novgorod', lon: 30.33, lat: 59.93, gdpShare: 0.15, resource: 'TICARET_BOGAZI' },
    { suffixId: 'KRR', name: 'Krasnodar & Kırım-Kuban', lon: 39.00, lat: 45.03, gdpShare: 0.13, resource: 'TAHIL' },
    { suffixId: 'ASF', name: 'Astrahan & İdil Deltası', lon: 48.03, lat: 46.34, gdpShare: 0.11, resource: 'PETROL' },
    { suffixId: 'KZN', name: 'Kazan & İdil-Bulgar', lon: 49.10, lat: 55.79, gdpShare: 0.12, resource: 'DOGALGAZ' },
    { suffixId: 'SVX', name: 'Yekaterinburg & Ural', lon: 60.60, lat: 56.83, gdpShare: 0.12, resource: 'DEMIR_CELIK' },
    { suffixId: 'OVB', name: 'Novosibirsk & Sibirya', lon: 92.00, lat: 57.50, gdpShare: 0.12, resource: 'DOGALGAZ' },
  ],
  // Kazakistan (4 Bölge)
  '398': [
    { suffixId: 'NQZ', name: 'Astana & Deşt-i Kıpçak', lon: 71.44, lat: 51.16, isCapital: true, gdpShare: 0.32, resource: 'DEMIR_CELIK' },
    { suffixId: 'ALA', name: 'Almatı & Yedisu', lon: 76.88, lat: 43.23, gdpShare: 0.28, resource: 'FINANS_MERKEZI' },
    { suffixId: 'SCO', name: 'Aktau & Mangışlak (Hazar)', lon: 51.19, lat: 43.65, gdpShare: 0.22, resource: 'PETROL' },
    { suffixId: 'CIT', name: 'Çimkent & Türkistan (Yesi)', lon: 68.50, lat: 42.90, gdpShare: 0.18, resource: 'TAHIL' },
  ],
  // Özbekistan / Maveraünnehir (3 Bölge)
  '860': [
    { suffixId: 'TAS', name: 'Taşkent & Fergana Vadisi', lon: 69.24, lat: 41.29, isCapital: true, gdpShare: 0.42, resource: 'TAHIL' },
    { suffixId: 'SKD', name: 'Semerkant & Buhara', lon: 66.95, lat: 39.65, gdpShare: 0.36, resource: 'FINANS_MERKEZI' },
    { suffixId: 'UGC', name: 'Hive & Harezm', lon: 60.63, lat: 41.55, gdpShare: 0.22, resource: 'DOGALGAZ' },
  ],
  // Türkmenistan (2 Bölge)
  '795': [
    { suffixId: 'ASB', name: 'Aşkabat & Merv', lon: 58.38, lat: 37.96, isCapital: true, gdpShare: 0.58, resource: 'DOGALGAZ' },
    { suffixId: 'KRW', name: 'Türkmenbaşı & Balkan (Hazar)', lon: 53.00, lat: 40.02, gdpShare: 0.42, resource: 'PETROL' },
  ],
  // Afganistan (3 Bölge)
  '004': [
    { suffixId: 'KBL', name: 'Kabil & Hindukuş', lon: 69.17, lat: 34.52, isCapital: true, gdpShare: 0.42, resource: 'NADIR_TOPRAK' },
    { suffixId: 'HEA', name: 'Herat & Batı Horasan', lon: 62.20, lat: 34.35, gdpShare: 0.32, resource: 'TAHIL' },
    { suffixId: 'KDH', name: 'Kandahar & Hilmend', lon: 65.73, lat: 31.62, gdpShare: 0.26, resource: 'DEMIR_CELIK' },
  ],
  // ABD (5 Bölge)
  '840': [
    { suffixId: 'WAS', name: 'Washington & Doğu Kıyısı', lon: -77.03, lat: 38.90, isCapital: true, gdpShare: 0.25, resource: 'FINANS_MERKEZI' },
    { suffixId: 'CHI', name: 'Şikago & Büyük Göller', lon: -87.62, lat: 41.87, gdpShare: 0.18, resource: 'TAHIL' },
    { suffixId: 'ATL', name: 'Atlanta & Güneydoğu', lon: -83.50, lat: 33.00, gdpShare: 0.15, resource: 'DEMIR_CELIK' },
    { suffixId: 'HOU', name: 'Teksas & Orta Güney', lon: -98.50, lat: 31.50, gdpShare: 0.18, resource: 'PETROL' },
    { suffixId: 'LAX', name: 'Kaliforniya & Pasifik', lon: -119.50, lat: 36.70, gdpShare: 0.24, resource: 'YARI_ILETKEN' },
  ],
  // Kanada (3 Bölge)
  '124': [
    { suffixId: 'YOW', name: 'Ottawa & Ontario', lon: -75.69, lat: 45.42, isCapital: true, gdpShare: 0.44, resource: 'FINANS_MERKEZI' },
    { suffixId: 'YVR', name: 'Vancouver & Batı Kanada', lon: -123.12, lat: 49.28, gdpShare: 0.30, resource: 'PETROL' },
    { suffixId: 'YUL', name: 'Montreal & Quebec', lon: -71.20, lat: 46.81, gdpShare: 0.26, resource: 'DEMIR_CELIK' },
  ],
  // Meksika (3 Bölge)
  '484': [
    { suffixId: 'MEX', name: 'Meksiko & Tenochtitlan', lon: -99.13, lat: 19.43, isCapital: true, gdpShare: 0.44, resource: 'FINANS_MERKEZI' },
    { suffixId: 'MTY', name: 'Monterrey & Kuzey Meksika', lon: -100.31, lat: 25.68, gdpShare: 0.32, resource: 'DEMIR_CELIK' },
    { suffixId: 'GDL', name: 'Guadalajara & Yucatan', lon: -103.34, lat: 20.65, gdpShare: 0.24, resource: 'PETROL' },
  ],
  // Çin (6 Bölge)
  '156': [
    { suffixId: 'BJS', name: 'Pekin & Kuzey Çin', lon: 116.40, lat: 39.90, isCapital: true, gdpShare: 0.22, resource: 'DEMIR_CELIK' },
    { suffixId: 'SHA', name: 'Nanjing & Şanghay Kıyısı', lon: 121.47, lat: 31.23, gdpShare: 0.24, resource: 'YARI_ILETKEN' },
    { suffixId: 'CAN', name: 'Kanton (Guangzhou) & Güney', lon: 113.26, lat: 23.12, gdpShare: 0.20, resource: 'TICARET_BOGAZI' },
    { suffixId: 'SHE', name: 'Mançurya & Şenyang', lon: 123.43, lat: 43.80, gdpShare: 0.12, resource: 'DEMIR_CELIK' },
    { suffixId: 'CTU', name: 'Siçuan & İç Çin', lon: 104.06, lat: 30.67, gdpShare: 0.12, resource: 'NADIR_TOPRAK' },
    { suffixId: 'URC', name: 'Doğu Türkistan & Kaşgar', lon: 85.61, lat: 41.50, gdpShare: 0.10, resource: 'PETROL' },
  ],
  // Moğolistan (2 Bölge)
  '496': [
    { suffixId: 'ULN', name: 'Ulanbator & Halha Bozkırı', lon: 106.90, lat: 47.88, isCapital: true, gdpShare: 0.58, resource: 'DEMIR_CELIK' },
    { suffixId: 'Kov', name: 'Karakurum & Altaylar', lon: 95.50, lat: 47.50, gdpShare: 0.42, resource: 'NADIR_TOPRAK' },
  ],
  // Mısır (4 Bölge)
  '818': [
    { suffixId: 'CAI', name: 'Kahire & Nil Deltası', lon: 31.23, lat: 30.04, isCapital: true, gdpShare: 0.38, resource: 'TAHIL' },
    { suffixId: 'ALY', name: 'İskenderiye & Batı Kıyısı', lon: 29.91, lat: 31.20, gdpShare: 0.24, resource: 'TICARET_BOGAZI' },
    { suffixId: 'SUZ', name: 'Süveyş & Sina Yarımadası', lon: 33.20, lat: 29.50, gdpShare: 0.20, resource: 'TICARET_BOGAZI' },
    { suffixId: 'ASW', name: 'Luksor & Yukarı Mısır', lon: 31.50, lat: 25.00, gdpShare: 0.18, resource: 'PETROL' },
  ],
  // Libya (2 Bölge)
  '434': [
    { suffixId: 'TIP', name: 'Trablus & Trablusgarp', lon: 13.19, lat: 32.88, isCapital: true, gdpShare: 0.56, resource: 'PETROL' },
    { suffixId: 'BEN', name: 'Bingazi & Sirenayka', lon: 20.06, lat: 32.11, gdpShare: 0.44, resource: 'PETROL' },
  ],
  // Tunus (2 Bölge)
  '788': [
    { suffixId: 'TUN', name: 'Tunus & Kartaca Kıyısı', lon: 10.18, lat: 36.80, isCapital: true, gdpShare: 0.60, resource: 'TICARET_BOGAZI' },
    { suffixId: 'SFA', name: 'Kayrevan & Safaks', lon: 10.10, lat: 34.74, gdpShare: 0.40, resource: 'PETROL' },
  ],
  // Cezayir (3 Bölge)
  '012': [
    { suffixId: 'ALG', name: 'Cezayir & Kabîliye', lon: 3.05, lat: 36.75, isCapital: true, gdpShare: 0.46, resource: 'DOGALGAZ' },
    { suffixId: 'ORN', name: 'Oran & Tilimsan', lon: -0.63, lat: 35.69, gdpShare: 0.32, resource: 'TICARET_BOGAZI' },
    { suffixId: 'HME', name: 'Güney Cezayir & Sahra', lon: 4.00, lat: 29.00, gdpShare: 0.22, resource: 'PETROL' },
  ],
  // Fas (3 Bölge)
  '504': [
    { suffixId: 'RBA', name: 'Rabat & Kazablanka', lon: -6.84, lat: 34.02, isCapital: true, gdpShare: 0.44, resource: 'TICARET_BOGAZI' },
    { suffixId: 'FEZ', name: 'Fes & Tanca (Cebelitarık)', lon: -5.00, lat: 35.10, gdpShare: 0.28, resource: 'TICARET_BOGAZI' },
    { suffixId: 'RAK', name: 'Marakeş & Atlas Dağları', lon: -7.98, lat: 31.62, gdpShare: 0.28, resource: 'NADIR_TOPRAK' },
  ],
  // Suudi Arabistan (4 Bölge)
  '682': [
    { suffixId: 'RUH', name: 'Riyad & Necd', lon: 46.71, lat: 24.71, isCapital: true, gdpShare: 0.32, resource: 'PETROL' },
    { suffixId: 'JED', name: 'Mekke & Cidde (Hicaz)', lon: 39.19, lat: 21.48, gdpShare: 0.24, resource: 'TICARET_BOGAZI' },
    { suffixId: 'MED', name: 'Medine & Tebük', lon: 38.50, lat: 25.50, gdpShare: 0.18, resource: 'TAHIL' },
    { suffixId: 'DMM', name: 'Dammam & El-Ahsa (Körfez)', lon: 50.10, lat: 26.42, gdpShare: 0.26, resource: 'PETROL' },
  ],
  // Yemen (2 Bölge)
  '887': [
    { suffixId: 'SAH', name: 'Sana & Dağlık Yemen', lon: 44.20, lat: 15.35, isCapital: true, gdpShare: 0.54, resource: 'TAHIL' },
    { suffixId: 'ADE', name: 'Aden & Babülmendep Boğazı', lon: 45.03, lat: 12.78, gdpShare: 0.46, resource: 'TICARET_BOGAZI' },
  ],
  // Etiyopya / Habeşistan (2 Bölge)
  '231': [
    { suffixId: 'ADD', name: 'Addis Ababa & Habeş Yaylası', lon: 38.74, lat: 9.03, isCapital: true, gdpShare: 0.62, resource: 'TAHIL' },
    { suffixId: 'DIR', name: 'Harar & Ogaden', lon: 42.12, lat: 9.31, gdpShare: 0.38, resource: 'DEMIR_CELIK' },
  ],
  // Nijerya (2 Bölge)
  '566': [
    { suffixId: 'ABV', name: 'Abuja & Kuzey Hausa', lon: 7.49, lat: 9.07, isCapital: true, gdpShare: 0.48, resource: 'TAHIL' },
    { suffixId: 'LOS', name: 'Lagos & Nijer Deltası', lon: 3.37, lat: 6.52, gdpShare: 0.52, resource: 'PETROL' },
  ],
  // Güney Afrika (2 Bölge)
  '710': [
    { suffixId: 'JNB', name: 'Pretoria & Transvaal', lon: 28.04, lat: -26.20, isCapital: true, gdpShare: 0.58, resource: 'NADIR_TOPRAK' },
    { suffixId: 'CPT', name: 'Cape Town & Ümit Burnu', lon: 18.42, lat: -33.92, gdpShare: 0.42, resource: 'TICARET_BOGAZI' },
  ],
  // Pakistan (3 Bölge)
  '586': [
    { suffixId: 'ISB', name: 'İslamabad & Lahor (Pencap)', lon: 73.04, lat: 33.68, isCapital: true, gdpShare: 0.44, resource: 'TAHIL' },
    { suffixId: 'KHI', name: 'Karaçi & Sind Kıyısı', lon: 67.00, lat: 24.86, gdpShare: 0.36, resource: 'TICARET_BOGAZI' },
    { suffixId: 'PEW', name: 'Peşaver & Belucistan', lon: 71.52, lat: 34.01, gdpShare: 0.20, resource: 'DEMIR_CELIK' },
  ],
  // Hindistan (5 Bölge)
  '356': [
    { suffixId: 'DEL', name: 'Yeni Delhi & Kuzey Hindistan', lon: 77.20, lat: 28.61, isCapital: true, gdpShare: 0.26, resource: 'TAHIL' },
    { suffixId: 'BOM', name: 'Mumbai & Gücerat-Dekkan', lon: 72.87, lat: 19.07, gdpShare: 0.26, resource: 'FINANS_MERKEZI' },
    { suffixId: 'HYD', name: 'Haydarabad & Orta Hindistan', lon: 78.48, lat: 17.38, gdpShare: 0.16, resource: 'DEMIR_CELIK' },
    { suffixId: 'BLR', name: 'Bangalore & Güney (Vijayanagara)', lon: 77.59, lat: 12.97, gdpShare: 0.16, resource: 'YARI_ILETKEN' },
    { suffixId: 'CCU', name: 'Kalküta & Bengal Havzası', lon: 88.36, lat: 22.57, gdpShare: 0.16, resource: 'TICARET_BOGAZI' },
  ],
  // Endonezya (3 Bölge)
  '360': [
    { suffixId: 'JKT', name: 'Cakarta & Cava Adası', lon: 106.84, lat: -6.20, isCapital: true, gdpShare: 0.48, resource: 'FINANS_MERKEZI' },
    { suffixId: 'MES', name: 'Medan & Sumatra (Malakka)', lon: 98.67, lat: 3.59, gdpShare: 0.28, resource: 'PETROL' },
    { suffixId: 'BPN', name: 'Kalimantan & Doğu Adaları', lon: 116.83, lat: -1.26, gdpShare: 0.24, resource: 'NADIR_TOPRAK' },
  ],
  // Güney Kore (2 Bölge)
  '410': [
    { suffixId: 'SEL', name: 'Seul & Gyeonggi', lon: 126.97, lat: 37.56, isCapital: true, gdpShare: 0.62, resource: 'YARI_ILETKEN' },
    { suffixId: 'PUS', name: 'Busan & Güneydoğu', lon: 129.07, lat: 35.17, gdpShare: 0.38, resource: 'TICARET_BOGAZI' },
  ],
  // Japonya (3 Bölge)
  '392': [
    { suffixId: 'TYO', name: 'Tokyo & Kanto', lon: 139.69, lat: 35.68, isCapital: true, gdpShare: 0.46, resource: 'YARI_ILETKEN' },
    { suffixId: 'OSA', name: 'Kyoto-Osaka & Kansai', lon: 135.50, lat: 34.69, gdpShare: 0.32, resource: 'FINANS_MERKEZI' },
    { suffixId: 'SPK', name: 'Sapporo & Kuzey Japonya', lon: 141.35, lat: 42.00, gdpShare: 0.22, resource: 'TICARET_BOGAZI' },
  ],
  // Brezilya (3 Bölge)
  '076': [
    { suffixId: 'BSB', name: 'Brasilia & Merkez Yayla', lon: -47.88, lat: -15.79, isCapital: true, gdpShare: 0.30, resource: 'TAHIL' },
    { suffixId: 'GRU', name: 'Sao Paulo & Rio Kıyısı', lon: -46.63, lat: -23.55, gdpShare: 0.45, resource: 'FINANS_MERKEZI' },
    { suffixId: 'MAO', name: 'Manaus & Amazon Havzası', lon: -60.02, lat: -4.00, gdpShare: 0.25, resource: 'NADIR_TOPRAK' },
  ],
  // Arjantin (3 Bölge)
  '032': [
    { suffixId: 'BUE', name: 'Buenos Aires & Pampa', lon: -58.38, lat: -34.60, isCapital: true, gdpShare: 0.50, resource: 'TAHIL' },
    { suffixId: 'COR', name: 'Córdoba & Kuzey Andlar', lon: -64.18, lat: -31.42, gdpShare: 0.28, resource: 'DEMIR_CELIK' },
    { suffixId: 'USH', name: 'Patagonya & Güney Kıyısı', lon: -68.50, lat: -45.80, gdpShare: 0.22, resource: 'DOGALGAZ' },
  ],
  // Avustralya (3 Bölge)
  '036': [
    { suffixId: 'SYD', name: 'Kanberra & Yeni Güney Galler', lon: 149.13, lat: -35.28, isCapital: true, gdpShare: 0.44, resource: 'FINANS_MERKEZI' },
    { suffixId: 'MEL', name: 'Melbourne & Victoria', lon: 144.96, lat: -37.81, gdpShare: 0.30, resource: 'TICARET_BOGAZI' },
    { suffixId: 'PER', name: 'Perth & Batı Avustralya', lon: 115.86, lat: -31.95, gdpShare: 0.26, resource: 'NADIR_TOPRAK' },
  ],
};

// Clamps ±180° antimeridian wrap vertices (such as Russia's Chukotka tip at -175° lon or Fiji)
// into the ring's primary hemisphere so the ring is NEVER dropped and NEVER streaks across the globe!
function clampAntimeridianRing(ring: Position[]): Position[] {
  if (ring.length < 4) return ring;

  let hasJump = false;
  let eastCount = 0;
  let westCount = 0;

  for (let i = 0; i < ring.length; i++) {
    const lon = ring[i][0];
    if (lon >= 0) eastCount++;
    else westCount++;
    if (i < ring.length - 1 && Math.abs(ring[i][0] - ring[i + 1][0]) > 140) {
      hasJump = true;
    }
  }

  if (!hasJump) return ring;

  const isMostlyEast = eastCount >= westCount;
  return ring.map((pt) => {
    const lon = pt[0];
    const lat = pt[1];
    if (isMostlyEast && lon < -90) {
      return [179.92, lat];
    }
    if (!isMostlyEast && lon > 90) {
      return [-179.92, lat];
    }
    return [lon, lat];
  });
}

// Ensures a closed GeoJSON ring has valid spherical winding order for d3-geo
// so that d3-geo NEVER interprets the interior of a country/province as the exterior ocean,
// while preserving 100% of countries (including Russia, USA, and Fiji)!
function normalizeSphericalRing(rawRing: Position[]): Position[] | null {
  if (rawRing.length < 4) return null;

  const clamped = clampAntimeridianRing(rawRing);

  // Deduplicate consecutive identical points
  const candidate: Position[] = [];
  for (let i = 0; i < clamped.length; i++) {
    const pt = clamped[i];
    const prev = candidate[candidate.length - 1];
    if (
      !prev ||
      Math.abs(pt[0] - prev[0]) > 1e-6 ||
      Math.abs(pt[1] - prev[1]) > 1e-6
    ) {
      candidate.push([pt[0], pt[1]]);
    }
  }

  if (candidate.length < 3) return null;

  // Ensure closed ring
  const first = candidate[0];
  const last = candidate[candidate.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    candidate.push([first[0], first[1]]);
  }

  if (candidate.length < 4) return null;

  const testFeature: Feature<Polygon> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [candidate],
    },
  };

  let area = geoArea(testFeature);
  if (!Number.isFinite(area)) return null;

  // A hemisphere is 2*PI (~6.28) steradians. If area > PI, the ring is wound backwards
  // on the sphere, which makes d3-geo fill the entire ocean instead of the land polygon!
  if (area > Math.PI) {
    candidate.reverse();
    testFeature.geometry.coordinates = [candidate];
    area = geoArea(testFeature);
  }

  if (!Number.isFinite(area) || area <= 1e-9 || area > 1.8) {
    return null;
  }

  return candidate;
}

// Sanitize any Polygon or MultiPolygon so no ring can ever invert to fill the ocean
export function sanitizeGeoGeometry(geometry: Geometry): Geometry {
  if (geometry.type === 'Polygon') {
    const outer = geometry.coordinates[0]
      ? normalizeSphericalRing(geometry.coordinates[0])
      : null;
    if (outer) {
      return { type: 'Polygon', coordinates: [outer] };
    }
    return geometry;
  }

  if (geometry.type === 'MultiPolygon') {
    const validPolygons: Position[][][] = [];
    geometry.coordinates.forEach((poly) => {
      if (!poly[0]) return;
      const outer = normalizeSphericalRing(poly[0]);
      if (outer) {
        validPolygons.push([outer]);
      }
    });
    if (validPolygons.length === 1) {
      return { type: 'Polygon', coordinates: validPolygons[0] };
    }
    if (validPolygons.length > 1) {
      return { type: 'MultiPolygon', coordinates: validPolygons };
    }
  }

  return geometry;
}

// Sutherland-Hodgman Half-Plane Clipping for a closed GeoJSON ring:
// Keeps points where a * lon + b * lat <= c
function clipRingWithHalfPlane(
  ring: Position[],
  a: number,
  b: number,
  c: number
): Position[] {
  if (ring.length < 3) return [];
  const pts =
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1]
      ? ring.slice(0, -1)
      : ring;

  const out: Position[] = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const P = pts[i];
    const Q = pts[(i + 1) % n];
    const valP = a * P[0] + b * P[1] - c;
    const valQ = a * Q[0] + b * Q[1] - c;

    const inP = valP <= 1e-9;
    const inQ = valQ <= 1e-9;

    if (inQ) {
      if (!inP) {
        const t = -valP / (valQ - valP);
        out.push([P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]);
      }
      out.push(Q);
    } else if (inP) {
      const t = -valP / (valQ - valP);
      out.push([P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]);
    }
  }

  if (out.length < 3) return [];
  out.push([out[0][0], out[0][1]]);
  return out;
}

export function subdivideCountryGeometry(
  geometry: Geometry,
  seeds: ProvinceSubSeed[]
): { seed: ProvinceSubSeed; geometry: Geometry }[] {
  const safeBaseGeometry = sanitizeGeoGeometry(geometry);

  // Extract outer polygon rings from Polygon or MultiPolygon
  const outerRings: Position[][] = [];
  if (safeBaseGeometry.type === 'Polygon') {
    if (safeBaseGeometry.coordinates[0]) {
      outerRings.push(safeBaseGeometry.coordinates[0]);
    }
  } else if (safeBaseGeometry.type === 'MultiPolygon') {
    safeBaseGeometry.coordinates.forEach((poly) => {
      if (poly[0]) outerRings.push(poly[0]);
    });
  }

  // Filter out tiny opposite-hemisphere island rings when subdividing (e.g., Russia's -175° Wrangel Island when main continent is clamped to +19°..+179.92°)
  const avgSeedLon =
    seeds.reduce((acc, s) => acc + s.lon, 0) / Math.max(1, seeds.length);
  const filteredOuterRings = outerRings.filter((ring) => {
    const sampleLon = ring[0]?.[0] ?? 0;
    return Math.abs(sampleLon - avgSeedLon) < 155;
  });

  const activeOuterRings =
    filteredOuterRings.length > 0 ? filteredOuterRings : outerRings;

  if (activeOuterRings.length === 0 || seeds.length <= 1) {
    return seeds.map((s) => ({ seed: s, geometry: safeBaseGeometry }));
  }

  return seeds.map((seedI, i) => {
    let currentRings = activeOuterRings.map((r) => [...r]);

    seeds.forEach((seedJ, j) => {
      if (i === j) return;
      const a = 2 * (seedJ.lon - seedI.lon);
      const b = 2 * (seedJ.lat - seedI.lat);
      const c =
        seedJ.lon * seedJ.lon +
        seedJ.lat * seedJ.lat -
        (seedI.lon * seedI.lon + seedI.lat * seedI.lat);

      const nextRings: Position[][] = [];
      currentRings.forEach((ring) => {
        const clipped = clipRingWithHalfPlane(ring, a, b, c);
        if (clipped.length >= 4) {
          nextRings.push(clipped);
        }
      });
      currentRings = nextRings;
    });

    // Normalize spherical winding order on every clipped ring so d3-geo never inverts the polygon to fill the ocean
    const normalizedRings = currentRings
      .map((r) => normalizeSphericalRing(r))
      .filter((r): r is Position[] => Boolean(r));

    const clippedGeom: Geometry =
      normalizedRings.length === 1
        ? { type: 'Polygon', coordinates: [normalizedRings[0]] }
        : {
            type: 'MultiPolygon',
            coordinates: normalizedRings.map((r) => [r]),
          };

    return {
      seed: seedI,
      geometry: normalizedRings.length > 0 ? clippedGeom : safeBaseGeometry,
    };
  });
}
