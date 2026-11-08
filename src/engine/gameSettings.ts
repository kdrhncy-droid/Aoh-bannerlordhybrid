export type AutoSaveIntervalOption = 0 | 30 | 90 | 180 | 300 | 365;
export type AiAggressivenessLevel = 'PASSIVE' | 'NORMAL' | 'AGGRESSIVE' | 'CHAOS';
export type CrisisFrequencyOption = 0 | 32 | 60 | 90;
export type MapLabelDensityOption = 'COMPACT' | 'BALANCED' | 'DETAILED';
export type UiScaleOption = 'COMPACT' | 'STANDARD' | 'LARGE';

export const MAP_LABEL_DENSITY_OPTIONS: {
  value: MapLabelDensityOption;
  label: string;
  desc: string;
}[] = [
  {
    value: 'COMPACT',
    label: 'Kompakt',
    desc: 'Eyalet adları daha yakından görünür; haritada daha az metin kalır.',
  },
  {
    value: 'BALANCED',
    label: 'Dengeli',
    desc: 'Ülke, başkent ve eyalet adları önerilen yakınlaştırmada görünür.',
  },
  {
    value: 'DETAILED',
    label: 'Ayrıntılı',
    desc: 'Başkent ve eyalet adları daha uzaktan görünür.',
  },
];

export interface GameSettings {
  autoSaveIntervalDays: AutoSaveIntervalOption;
  fogOfWarEnabled: boolean;
  showZoomControls: boolean;
  aiAggressiveness: AiAggressivenessLevel;
  crisisFrequencyDays: CrisisFrequencyOption;
  mapLabelDensity: MapLabelDensityOption;
  uiScale: UiScaleOption;
}

const SETTINGS_STORAGE_KEY = 'IMPERIUM_2026_SETTINGS_V1';

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  autoSaveIntervalDays: 90,
  fogOfWarEnabled: true,
  showZoomControls: true,
  aiAggressiveness: 'NORMAL',
  crisisFrequencyDays: 90,
  mapLabelDensity: 'BALANCED',
  uiScale: 'STANDARD',
};

export const UI_SCALE_OPTIONS: {
  value: UiScaleOption;
  label: string;
  desc: string;
}[] = [
  { value: 'COMPACT', label: 'Ölçek 0 (Kompakt)', desc: 'Küçük mobil ekranlar ve geniş harita görüşü için kompakt HUD' },
  { value: 'STANDARD', label: 'Ölçek 1 (Standart)', desc: 'Dengeli Age of History 3 arayüz boyutu' },
  { value: 'LARGE', label: 'Ölçek 2 (Büyük)', desc: 'Dokunmatik kolaylığı için büyütülmüş butonlar ve yazılar' },
];

export const AUTO_SAVE_OPTIONS: {
  value: AutoSaveIntervalOption;
  label: string;
  desc: string;
}[] = [
  { value: 0, label: 'Kapalı', desc: 'Sadece manuel kayıt alınır' },
  { value: 30, label: '30 Gün', desc: 'Her oyun ayında bir otomatik kayıt' },
  { value: 90, label: '90 Gün', desc: 'Her 3 ayda bir otomatik kayıt (Önerilen)' },
  { value: 180, label: '180 Gün', desc: 'Her 6 ayda bir otomatik kayıt' },
  { value: 300, label: '300 Gün', desc: 'Her 300 günde bir seyrek otomatik kayıt' },
  { value: 365, label: '365 Gün', desc: 'Yılda bir kez otomatik kayıt' },
];

export const AI_AGGRESSIVENESS_OPTIONS: {
  value: AiAggressivenessLevel;
  label: string;
  desc: string;
}[] = [
  {
    value: 'PASSIVE',
    label: 'Barışçıl (Pasif)',
    desc: 'Yapay zeka nadiren savaş açar, ekonomi ve savunmaya odaklanır.',
  },
  {
    value: 'NORMAL',
    label: 'Dengeli (Normal)',
    desc: 'Gerçekçi diplomasi, fırsatçı sınır savaşları ve koalisyon dengesi.',
  },
  {
    value: 'AGGRESSIVE',
    label: 'Saldırgan (Zor)',
    desc: 'Büyük güçler hızla ordularını büyütür ve zayıf komşularını fetheder.',
  },
  {
    value: 'CHAOS',
    label: 'Kıyamet (Kaos)',
    desc: 'Sürekli küresel savaşlar, sert koalisyonlar ve yüksek AI seferberliği.',
  },
];

export const CRISIS_FREQUENCY_OPTIONS: {
  value: CrisisFrequencyOption;
  label: string;
}[] = [
  { value: 32, label: 'Normal (32 Günde Bir)' },
  { value: 60, label: 'Orta (60 Günde Bir)' },
  { value: 90, label: 'Seyrek (90 Günde Bir)' },
  { value: 0, label: 'Kapalı (Sadece Manuel)' },
];

export function loadGameSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_GAME_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    return {
      ...DEFAULT_GAME_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_GAME_SETTINGS;
  }
}

export function saveGameSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
}
