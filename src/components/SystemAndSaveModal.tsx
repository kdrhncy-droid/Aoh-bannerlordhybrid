import React, { useRef, useState } from 'react';
import {
  X,
  Save,
  Upload,
  Download,
  Trash2,
  Play,
  Volume2,
  VolumeX,
  Newspaper,
  Globe,
  Coins,
  Calendar,
  CheckCircle2,
  Settings,
  Eye,
  EyeOff,
  Compass,
  Crown,
} from 'lucide-react';
import {
  deleteSaveSlot,
  exportSaveRecordToJson,
  importSaveRecordFromJson,
  listAllSaveSlots,
  loadGameFromSlot,
  SAVE_SLOT_DEFINITIONS,
  SaveSlotId,
  SaveSlotMetadata,
  SaveSlotRecord,
} from '../engine/saveManager';
import {
  AI_AGGRESSIVENESS_OPTIONS,
  AUTO_SAVE_OPTIONS,
  CRISIS_FREQUENCY_OPTIONS,
  GameSettings,
  MAP_LABEL_DENSITY_OPTIONS,
  UI_SCALE_OPTIONS,
} from '../engine/gameSettings';
import { music, MUSIC_TRACKS } from '../engine/musicEngine';
import { PWAInstallButton } from './PWAInstallButton';
import { sound } from '../utils/soundEngine';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';

interface SystemAndSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (partial: Partial<GameSettings>) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  newsCount: number;
  onOpenNewsDrawer: () => void;
  onReturnToTitleMenu: () => void;
  onSaveToSlot: (slotId: SaveSlotId) => SaveSlotMetadata | null;
  onLoadRecord: (record: SaveSlotRecord) => void;
  onShowToast: (msg: string) => void;
}

export const SystemAndSaveModal: React.FC<SystemAndSaveModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  soundEnabled,
  onToggleSound,
  newsCount,
  onOpenNewsDrawer,
  onReturnToTitleMenu,
  onSaveToSlot,
  onLoadRecord,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mp3InputRef = useRef<HTMLInputElement | null>(null);
  const [modalTab, setModalTab] = useState<'SETTINGS' | 'SAVES'>('SETTINGS');
  const [, setMusicTick] = useState(0);
  const [slots, setSlots] = useState<Record<SaveSlotId, SaveSlotMetadata | null>>(
    () => listAllSaveSlots()
  );
  const dialogRef = useAccessibleDialog(isOpen, onClose);

  if (!isOpen) return null;

  const refreshSlots = () => {
    setSlots(listAllSaveSlots());
  };

  const handleSaveClick = (slotId: SaveSlotId) => {
    sound.playTreaty();
    const meta = onSaveToSlot(slotId);
    refreshSlots();
    if (meta) {
      onShowToast(`${meta.label} başarıyla kaydedildi.`);
    }
  };

  const handleLoadClick = (slotId: SaveSlotId) => {
    const rec = loadGameFromSlot(slotId);
    if (!rec) {
      onShowToast('Bu kayıt yuvası boş.');
      return;
    }
    sound.playWarHorn();
    onLoadRecord(rec);
    onClose();
  };

  const handleExportClick = (slotId: SaveSlotId) => {
    const rec = loadGameFromSlot(slotId);
    if (!rec) {
      onShowToast('İndirilecek kayıt bulunamadı.');
      return;
    }
    sound.playClick();
    exportSaveRecordToJson(rec);
    onShowToast(`${rec.metadata.nationName} kaydı (.json) cihazınıza indirildi.`);
  };

  const handleDeleteClick = (slotId: SaveSlotId) => {
    sound.playClick();
    deleteSaveSlot(slotId);
    refreshSlots();
    onShowToast('Kayıt yuvası temizlendi.');
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const imported = importSaveRecordFromJson(text, 'SLOT_1');
      if (imported) {
        sound.playTreaty();
        refreshSlots();
        onLoadRecord(imported);
        onShowToast(
          `${imported.metadata.nationName} yedeği Kayıt Yuvası 1'e yüklendi ve açıldı!`
        );
        onClose();
      } else {
        onShowToast('Geçersiz veya bozuk kayıt dosyası (.json).');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-settings-title"
        tabIndex={-1}
        className="w-full max-w-2xl max-h-[90dvh] bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Modal Header with Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="system-settings-title" className="font-display text-lg font-bold text-white">
                Sistem Ayarları & Kayıt Merkezi
              </h2>
              <p className="text-xs text-slate-400">
                Oto-kayıt sıklığı, HUD görünümü, zorluk ve çoklu kayıt yuvaları
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Sistem menüsünü kapat"
              className="sm:hidden min-w-[42px] min-h-[42px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 flex-1 sm:flex-initial">
              <button
                onClick={() => {
                  sound.playClick();
                  setModalTab('SETTINGS');
                }}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  modalTab === 'SETTINGS'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Oyun Ayarları</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  refreshSlots();
                  setModalTab('SAVES');
                }}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  modalTab === 'SAVES'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Kayıt Merkezi</span>
              </button>
            </div>

            <button
              onClick={onClose}
              aria-label="Sistem menüsünü kapat"
              className="hidden sm:flex min-w-[42px] min-h-[42px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 items-center justify-center text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Quick System Controls Bar */}
          <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="text-xs font-semibold text-slate-400">
              Hızlı Komuta & Ekran Araçları
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenNewsDrawer();
                }}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center gap-2 text-xs font-semibold text-amber-300"
              >
                <Newspaper className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Haberler ({newsCount})</span>
              </button>

              <button
                onClick={onToggleSound}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center gap-2 text-xs font-semibold text-slate-200"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Efekt sesleri: Açık</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Efekt sesleri: Kapalı</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl px-2 min-h-[44px]">
                <PWAInstallButton compact />
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onReturnToTitleMenu();
                }}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 border border-rose-500/40 flex items-center justify-center gap-2 text-xs font-semibold text-rose-200"
              >
                <Globe className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">Senaryo Menüsü</span>
              </button>
            </div>
          </section>

          {/* Mehterhane-i Hümayun, YouTube Orijinal Osmanlı Marşları & MP3 Kutusu */}
          <section className="bg-slate-950/80 border border-amber-500/35 rounded-2xl p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-amber-300">
                  ♫ Mehterhane-i Hümayun & YouTube Orijinal Osmanlı Marşları ({music.activeTrackTitle})
                </div>
                <p className="text-[11px] text-slate-400">
                  Ceddin Deden, Hücum Marşı, Genç Osman, Yelkenler Biçilecek, Estergon Kalesi — Dahili Mehterhane, YouTube Orijinal Kayıt veya MP3
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    music.toggle();
                    setMusicTick((t) => t + 1);
                  }}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    music.isPlaying
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {music.isPlaying ? '■ Durdur' : '▶ Marşı Çal'}
                </button>
                <button
                  onClick={() => {
                    music.setYouTubeMode(!music.isYouTubeMode);
                    setMusicTick((t) => t + 1);
                  }}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                    music.isYouTubeMode
                      ? 'bg-rose-600 border-rose-400 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 border-amber-500/40 text-amber-300'
                  }`}
                >
                  {music.isYouTubeMode ? '📺 YouTube: Açık' : '📺 YouTube Orijinal Modu'}
                </button>
                <button
                  onClick={() => mp3InputRef.current?.click()}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200"
                >
                  MP3 Seç
                </button>
                <input
                  ref={mp3InputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      music.loadCustomMp3File(f);
                      setMusicTick((t) => t + 1);
                      onShowToast(`${f.name} marş olarak yüklendi ve çalıyor!`);
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {MUSIC_TRACKS.map((trk) => {
                const isSelected = music.activeTrackId === trk.id;
                return (
                  <button
                    key={trk.id}
                    onClick={() => {
                      music.setTrack(trk.id);
                      if (!music.isPlaying) {
                        music.play();
                      }
                      setMusicTick((t) => t + 1);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white truncate">
                        {trk.title}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 shrink-0">
                        {trk.eraTag}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {trk.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {modalTab === 'SETTINGS' && (
            <div className="space-y-4">
              {/* 1. Customizable Auto-Save Interval (Off, 30, 90, 180, 300, 365 Days) */}
              <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    01. Otomatik Kayıt (Auto-Save) Sıklığı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Oyunun hangi aralıklarla otomatik kayıt alacağını seçin (örn. 30 gün, 300 gün veya tamamen kapalı).
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AUTO_SAVE_OPTIONS.map((opt) => {
                    const isSelected =
                      settings.autoSaveIntervalDays === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          sound.playClick();
                          onUpdateSettings({ autoSaveIntervalDays: opt.value });
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-amber-400">
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {opt.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 2. HUD & Map Visibility Toggles (Zoom Controls & Fog of War) */}
              <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    02. Harita HUD Butonları ve Savaş Sisi (Fog of War)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mobil ekranda sağ alttaki yakınlaştırma butonlarını gizleyebilir veya Savaş Sisini kapatabilirsiniz.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Bottom-Right Zoom & Center HUD Toggle */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      onUpdateSettings({
                        showZoomControls: !settings.showZoomControls,
                      });
                    }}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all ${
                      settings.showZoomControls
                        ? 'bg-emerald-500/15 border-emerald-500/60 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-amber-400" />
                        <span>Sağ Alt Yakınlaştırma HUD</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {settings.showZoomControls
                          ? 'Açık: Sağ altta + / - ve Odaklama tuşları görünür'
                          : 'Gizli: İki parmakla yakınlaştırma ile tam ekran harita'}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 ${
                        settings.showZoomControls
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {settings.showZoomControls ? 'Açık' : 'Gizli'}
                    </span>
                  </button>

                  {/* Fog of War Toggle */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      onUpdateSettings({
                        fogOfWarEnabled: !settings.fogOfWarEnabled,
                      });
                    }}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all ${
                      settings.fogOfWarEnabled
                        ? 'bg-sky-500/15 border-sky-500/60 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {settings.fogOfWarEnabled ? (
                          <Eye className="w-4 h-4 text-sky-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-amber-400" />
                        )}
                        <span>Savaş Sisi (İstihbarat Sınırı)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {settings.fogOfWarEnabled
                          ? 'Gerçekçi: Sadece komşu ve müttefik orduları görünür'
                          : 'Kapalı: Dünyadaki tüm ülkelerin orduları görünür'}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 ${
                        settings.fogOfWarEnabled
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {settings.fogOfWarEnabled ? 'Açık' : 'Kapalı'}
                    </span>
                  </button>
                </div>

                {/* AoH3 UI Scale Selector */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div>
                    <h3 className="text-xs font-bold text-white">Harita etiket yoğunluğu</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Başkent ve eyalet adlarının hangi yakınlaştırmada görüneceğini seçin.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {MAP_LABEL_DENSITY_OPTIONS.map((option) => {
                      const selected = settings.mapLabelDensity === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => {
                            sound.playClick();
                            onUpdateSettings({ mapLabelDensity: option.value });
                          }}
                          className={`min-h-[44px] p-2.5 rounded-xl border text-left transition-colors ${
                            selected
                              ? 'bg-amber-500/20 border-amber-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="block text-xs font-bold">{option.label}</span>
                          <span className="block text-[11px] text-slate-400 mt-0.5">{option.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="text-xs font-bold text-amber-300">
                    Age of History 3 Mobil & Ekran UI Ölçeği (0 / 1 / 2):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {UI_SCALE_OPTIONS.map((opt) => {
                      const active = (settings.uiScale || 'STANDARD') === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            sound.playClick();
                            onUpdateSettings({ uiScale: opt.value });
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            active
                              ? 'bg-amber-500/20 border-amber-400 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold text-amber-400">
                            {opt.label}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {opt.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* 3. AI Aggressiveness & Crisis Frequency */}
              <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    03. Yapay Zeka (AI) Saldırganlığı & Kriz Sıklığı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Yapay zeka devletlerinin savaş açma sıklığını ve kabine kriz olaylarını özelleştirin.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AI_AGGRESSIVENESS_OPTIONS.map((opt) => {
                    const isSelected = settings.aiAggressiveness === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          sound.playClick();
                          onUpdateSettings({ aiAggressiveness: opt.value });
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {opt.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <div className="text-xs font-semibold text-slate-300 mb-2">
                    Kabine Kriz ve Fırsat Olayları Sıklığı:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CRISIS_FREQUENCY_OPTIONS.map((opt) => {
                      const isSelected =
                        settings.crisisFrequencyDays === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            sound.playClick();
                            onUpdateSettings({ crisisFrequencyDays: opt.value });
                          }}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          )}

          {modalTab === 'SAVES' && (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-slate-300">
                    Kayıt Yuvaları ve JSON Yedekleme
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Otomatik kayıt sıklığı şu an:{' '}
                    <strong className="text-amber-400">
                      {settings.autoSaveIntervalDays === 0
                        ? 'Kapalı'
                        : `Her ${settings.autoSaveIntervalDays} Günde Bir`}
                    </strong>
                    .
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 text-xs font-semibold flex items-center gap-2 shrink-0"
                >
                  <Upload className="w-4 h-4 shrink-0" />
                  <span>.JSON Yedek Yükle</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {SAVE_SLOT_DEFINITIONS.map((def) => {
                  const meta = slots[def.id];
                  const isAuto = def.id === 'AUTOSAVE';

                  return (
                    <div
                      key={def.id}
                      className={`rounded-2xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        meta
                          ? 'bg-slate-950/90 border-slate-800'
                          : 'bg-slate-950/40 border-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        {meta ? (
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-xs text-white shrink-0 shadow"
                            style={{ backgroundColor: meta.nationColor }}
                          >
                            {meta.flagCode}
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                            <Save className="w-4 h-4" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-amber-400">
                              {def.title}
                            </span>
                            {meta && (
                              <span className="text-xs font-semibold text-white truncate">
                                · {meta.nationName}
                              </span>
                            )}
                          </div>

                          {meta ? (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300 mt-1">
                              <span className="flex items-center gap-1 font-mono-num">
                                <Calendar className="w-3 h-3 text-sky-400" />
                                {meta.gameDateStr}
                              </span>
                              <span className="flex items-center gap-1 font-mono-num">
                                <Coins className="w-3 h-3 text-amber-400" />
                                {meta.treasury.toLocaleString('tr-TR')} Altın
                              </span>
                              <span className="font-mono-num text-emerald-400">
                                {meta.territoryCount} Eyalet
                              </span>
                              <span className="text-slate-500">
                                Son Kayıt: {meta.savedAtDisplay}
                              </span>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {def.subtitle} — Henüz kayıt yok
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Slot Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                        {!isAuto && (
                          <button
                            onClick={() => handleSaveClick(def.id)}
                            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Kaydet</span>
                          </button>
                        )}

                        {meta && (
                          <>
                            <button
                              onClick={() => handleLoadClick(def.id)}
                              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Yükle</span>
                            </button>

                            <button
                              onClick={() => handleExportClick(def.id)}
                              title="JSON Yedeği İndir"
                              className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-300"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteClick(def.id)}
                              title="Kaydı Sil"
                              className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 flex items-center justify-center text-slate-400 hover:text-rose-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
