// Polyphonic Web Audio Ottoman Mehterhane Synthesizer, YouTube Original Ottoman March Player & Custom MP3 Engine

export type MusicTrackId =
  | 'TR_MEHTER_CEDDIN'
  | 'TR_MEHTER_HUCUM'
  | 'TR_MEHTER_GENC_OSMAN'
  | 'TR_MEHTER_YELKENLER'
  | 'TR_MEHTER_ESTERGON'
  | 'TR_MECIYIYE_MARSI'
  | 'TR_OLUR_MU_BOYLE'
  | 'GLOBAL_STRATEGY_SYMPHONY'
  | 'CUSTOM_MP3';

export interface MusicTrackDefinition {
  id: MusicTrackId;
  title: string;
  subtitle: string;
  bpm: number;
  eraTag: string;
  youtubeVideoId: string;
  isMehter?: boolean;
}

export const MUSIC_TRACKS: MusicTrackDefinition[] = [
  {
    id: 'TR_MEHTER_CEDDIN',
    title: 'Ceddin Deden, Neslin Baban',
    subtitle: 'Orijinal Osmanlı Mehter Marşı (Zurna, Kös & Çevgan)',
    bpm: 112,
    eraTag: 'Mehterhane-i Hümayun',
    youtubeVideoId: 'M9mB9ce2t2k',
    isMehter: true,
  },
  {
    id: 'TR_MEHTER_HUCUM',
    title: 'Tarihi Mehter Hücum Marşı',
    subtitle: 'Devlet-i Aliyye Meydan Muharebesi & Taarruz Marşı',
    bpm: 124,
    eraTag: 'Sefer-i Hümayun',
    youtubeVideoId: 'rU_aE2T0bU0',
    isMehter: true,
  },
  {
    id: 'TR_MEHTER_GENC_OSMAN',
    title: 'Genç Osman Marşı',
    subtitle: 'Bıyığında Tarak Durmaz, Allah Allah Deyip Geçer Genç Osman',
    bpm: 118,
    eraTag: 'Bağdat Seferi (1638)',
    youtubeVideoId: '5sK8a8eA7r0',
    isMehter: true,
  },
  {
    id: 'TR_MEHTER_YELKENLER',
    title: 'Yelkenler Biçilecek (Fetih Marşı)',
    subtitle: 'Fatih\'in İstanbul\'u Fethi & Donanma-yı Hümayun Marşı',
    bpm: 114,
    eraTag: 'Fetih 1453',
    youtubeVideoId: 'O0iI8C2zN7A',
    isMehter: true,
  },
  {
    id: 'TR_MEHTER_ESTERGON',
    title: 'Estergon Kalesi',
    subtitle: 'Estergon Kalesi Su Başı Durak — Tarihi Serhat & Kuşatma Marşı',
    bpm: 102,
    eraTag: 'Rumeli Serhaddi',
    youtubeVideoId: 'q7s4F2T7rE0',
    isMehter: true,
  },
  {
    id: 'TR_MECIYIYE_MARSI',
    title: 'Mecidiye Marşı (1844)',
    subtitle: 'Osmanlı İmparatorluğu Resmi Saltanat & Bando Marşı',
    bpm: 116,
    eraTag: 'Mızıka-yı Hümayun',
    youtubeVideoId: 'w_k4J7Y8P0A',
    isMehter: false,
  },
  {
    id: 'TR_OLUR_MU_BOYLE',
    title: 'Olur mu Böyle Olur mu',
    subtitle: 'Kardeş Kardeşi Vurur mu (Marş Versiyonu)',
    bpm: 116,
    eraTag: 'Ulusal Marş',
    youtubeVideoId: 'k7m9N2x4L1Q',
    isMehter: false,
  },
  {
    id: 'GLOBAL_STRATEGY_SYMPHONY',
    title: 'Imperium Strateji Senfonisi',
    subtitle: 'Evrensel Komuta Odası & Diplomasi Teması',
    bpm: 104,
    eraTag: 'Senfoni',
    youtubeVideoId: 'M9mB9ce2t2k',
    isMehter: false,
  },
];

export function extractYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

// Standard equal-tempered note frequencies (Hz)
const N: Record<string, number> = {
  REST: 0,
  G3: 196.0,
  A3: 220.0,
  Bb3: 233.08,
  B3: 246.94,
  C4: 261.63,
  Cs4: 277.18,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  Fs4: 369.99,
  G4: 392.0,
  Gs4: 415.3,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  Cs5: 554.37,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
};

interface NoteStep {
  note: string;
  beats: number;
  bass?: string;
  drum?: 'KICK' | 'SNARE' | 'BOTH' | 'CEVGAN';
}

// 1. Ceddin Deden, Neslin Baban (Authentic Hüseyni / Rast Mehter Transcription)
const MEHTER_CEDDIN_SCORE: NoteStep[] = [
  // "Ced-din de-den, nes-lin ba-ban!"
  { note: 'A4', beats: 1, bass: 'A3', drum: 'CEVGAN' },
  { note: 'B4', beats: 0.5, bass: 'A3', drum: 'SNARE' },
  { note: 'C5', beats: 0.5, bass: 'A3' },
  { note: 'D5', beats: 1, bass: 'D4', drum: 'KICK' },
  { note: 'C5', beats: 1, bass: 'C4', drum: 'SNARE' },
  { note: 'B4', beats: 1, bass: 'E4', drum: 'KICK' },
  { note: 'A4', beats: 1, bass: 'A3', drum: 'SNARE' },
  { note: 'Gs4', beats: 1, bass: 'E4', drum: 'KICK' },
  { note: 'A4', beats: 1, bass: 'A3', drum: 'CEVGAN' },

  // "Hep kah-ra-man Türk mil-le-ti!"
  { note: 'E5', beats: 1.5, bass: 'C4', drum: 'CEVGAN' },
  { note: 'D5', beats: 0.5, bass: 'B3', drum: 'SNARE' },
  { note: 'C5', beats: 1, bass: 'A3', drum: 'KICK' },
  { note: 'B4', beats: 1, bass: 'E4', drum: 'SNARE' },
  { note: 'C5', beats: 1, bass: 'A3', drum: 'KICK' },
  { note: 'A4', beats: 1, bass: 'C4', drum: 'SNARE' },
  { note: 'B4', beats: 1, bass: 'E4', drum: 'KICK' },
  { note: 'A4', beats: 1, bass: 'A3', drum: 'CEVGAN' },

  // "Or-du-la-rın, pek çok za-man / Ver-di dün-ya-ya şan!"
  { note: 'C5', beats: 1, bass: 'A3', drum: 'KICK' },
  { note: 'D5', beats: 1, bass: 'D4', drum: 'SNARE' },
  { note: 'E5', beats: 1, bass: 'C4', drum: 'CEVGAN' },
  { note: 'F5', beats: 1, bass: 'D4', drum: 'SNARE' },
  { note: 'E5', beats: 1, bass: 'C4', drum: 'KICK' },
  { note: 'D5', beats: 1, bass: 'B3', drum: 'SNARE' },
  { note: 'C5', beats: 1, bass: 'A3', drum: 'KICK' },
  { note: 'B4', beats: 1, bass: 'E4', drum: 'SNARE' },
  { note: 'A4', beats: 1.5, bass: 'A3', drum: 'CEVGAN' },
  { note: 'REST', beats: 0.5, drum: 'SNARE' },
];

// 2. Tarihi Mehter Hücum Marşı (High-energy Charge Rhythm with Kös & Çevgan crashes)
const MEHTER_HUCUM_SCORE: NoteStep[] = [
  { note: 'A4', beats: 0.75, bass: 'A3', drum: 'CEVGAN' },
  { note: 'A4', beats: 0.25, bass: 'A3', drum: 'SNARE' },
  { note: 'D5', beats: 1, bass: 'D4', drum: 'KICK' },
  { note: 'D5', beats: 0.75, bass: 'D4', drum: 'CEVGAN' },
  { note: 'E5', beats: 0.25, bass: 'C4', drum: 'SNARE' },
  { note: 'F5', beats: 1, bass: 'D4', drum: 'KICK' },
  { note: 'E5', beats: 0.5, bass: 'C4', drum: 'SNARE' },
  { note: 'D5', beats: 0.5, bass: 'B3', drum: 'KICK' },
  { note: 'Cs5', beats: 1, bass: 'A3', drum: 'CEVGAN' },
  { note: 'D5', beats: 1, bass: 'D4', drum: 'BOTH' },

  { note: 'E5', beats: 1, bass: 'A3', drum: 'CEVGAN' },
  { note: 'F5', beats: 0.5, bass: 'D4', drum: 'SNARE' },
  { note: 'G5', beats: 0.5, bass: 'C4', drum: 'KICK' },
  { note: 'F5', beats: 1, bass: 'D4', drum: 'SNARE' },
  { note: 'E5', beats: 1, bass: 'A3', drum: 'KICK' },
  { note: 'D5', beats: 1, bass: 'Bb3', drum: 'SNARE' },
  { note: 'Cs5', beats: 1, bass: 'A3', drum: 'KICK' },
  { note: 'D5', beats: 1.5, bass: 'D4', drum: 'CEVGAN' },
  { note: 'REST', beats: 0.5, drum: 'SNARE' },
];

// 3. Genç Osman Marşı
const MEHTER_GENC_OSMAN_SCORE: NoteStep[] = [
  { note: 'D4', beats: 0.5, bass: 'D4', drum: 'KICK' },
  { note: 'G4', beats: 1, bass: 'G3', drum: 'CEVGAN' },
  { note: 'G4', beats: 0.5, bass: 'G3', drum: 'SNARE' },
  { note: 'A4', beats: 1, bass: 'D4', drum: 'KICK' },
  { note: 'Bb4', beats: 1, bass: 'G3', drum: 'SNARE' },
  { note: 'C5', beats: 1, bass: 'C4', drum: 'CEVGAN' },
  { note: 'Bb4', beats: 0.5, bass: 'G3', drum: 'SNARE' },
  { note: 'A4', beats: 0.5, bass: 'D4' },
  { note: 'G4', beats: 1.5, bass: 'G3', drum: 'BOTH' },
  { note: 'REST', beats: 0.5, drum: 'SNARE' },

  { note: 'D5', beats: 1, bass: 'G3', drum: 'CEVGAN' },
  { note: 'C5', beats: 1, bass: 'C4', drum: 'SNARE' },
  { note: 'Bb4', beats: 1, bass: 'G3', drum: 'KICK' },
  { note: 'A4', beats: 1, bass: 'D4', drum: 'SNARE' },
  { note: 'Bb4', beats: 1, bass: 'G3', drum: 'KICK' },
  { note: 'A4', beats: 1, bass: 'D4', drum: 'SNARE' },
  { note: 'Fs4', beats: 1, bass: 'D4', drum: 'KICK' },
  { note: 'G4', beats: 1.5, bass: 'G3', drum: 'CEVGAN' },
  { note: 'REST', beats: 0.5, drum: 'SNARE' },
];

// 4. Yelkenler Biçilecek (Fetih Marşı)
const MEHTER_YELKENLER_SCORE: NoteStep[] = [
  { note: 'E4', beats: 1, bass: 'A3', drum: 'CEVGAN' },
  { note: 'A4', beats: 1, bass: 'A3', drum: 'SNARE' },
  { note: 'B4', beats: 1, bass: 'E4', drum: 'KICK' },
  { note: 'C5', beats: 1, bass: 'A3', drum: 'SNARE' },
  { note: 'D5', beats: 1.5, bass: 'D4', drum: 'CEVGAN' },
  { note: 'C5', beats: 0.5, bass: 'C4', drum: 'SNARE' },
  { note: 'B4', beats: 1, bass: 'E4', drum: 'KICK' },
  { note: 'A4', beats: 1, bass: 'A3', drum: 'BOTH' },

  { note: 'E5', beats: 1, bass: 'C4', drum: 'CEVGAN' },
  { note: 'E5', beats: 1, bass: 'C4', drum: 'SNARE' },
  { note: 'D5', beats: 1, bass: 'B3', drum: 'KICK' },
  { note: 'C5', beats: 1, bass: 'A3', drum: 'SNARE' },
  { note: 'B4', beats: 1, bass: 'E4', drum: 'KICK' },
  { note: 'C5', beats: 1, bass: 'A3', drum: 'SNARE' },
  { note: 'Gs4', beats: 1, bass: 'E4', drum: 'KICK' },
  { note: 'A4', beats: 1.5, bass: 'A3', drum: 'CEVGAN' },
  { note: 'REST', beats: 0.5, drum: 'SNARE' },
];

// 5. Estergon Kalesi
const MEHTER_ESTERGON_SCORE: NoteStep[] = [
  { note: 'A4', beats: 1.5, bass: 'D4', drum: 'CEVGAN' },
  { note: 'Bb4', beats: 0.5, bass: 'D4', drum: 'SNARE' },
  { note: 'A4', beats: 1, bass: 'D4', drum: 'KICK' },
  { note: 'G4', beats: 1, bass: 'G3', drum: 'SNARE' },
  { note: 'F4', beats: 1, bass: 'D4', drum: 'KICK' },
  { note: 'E4', beats: 1, bass: 'A3', drum: 'SNARE' },
  { note: 'D4', beats: 1.5, bass: 'D4', drum: 'CEVGAN' },
  { note: 'REST', beats: 0.5, drum: 'SNARE' },

  { note: 'G4', beats: 1, bass: 'G3', drum: 'KICK' },
  { note: 'A4', beats: 1, bass: 'D4', drum: 'SNARE' },
  { note: 'Bb4', beats: 1, bass: 'G3', drum: 'CEVGAN' },
  { note: 'G4', beats: 1, bass: 'C4', drum: 'SNARE' },
  { note: 'F4', beats: 1, bass: 'D4', drum: 'KICK' },
  { note: 'E4', beats: 1, bass: 'A3', drum: 'SNARE' },
  { note: 'D4', beats: 2, bass: 'D4', drum: 'CEVGAN' },
];

// 6. Mecidiye Marşı (1844 Imperial Ottoman Anthem)
const MECIDIYE_SCORE: NoteStep[] = [
  { note: 'C5', beats: 1, bass: 'C4', drum: 'KICK' },
  { note: 'G4', beats: 0.5, bass: 'C4', drum: 'SNARE' },
  { note: 'G4', beats: 0.5, bass: 'C4' },
  { note: 'A4', beats: 1, bass: 'F4', drum: 'KICK' },
  { note: 'B4', beats: 1, bass: 'G3', drum: 'SNARE' },
  { note: 'C5', beats: 1.5, bass: 'C4', drum: 'CEVGAN' },
  { note: 'D5', beats: 0.5, bass: 'B3', drum: 'SNARE' },
  { note: 'E5', beats: 1, bass: 'C4', drum: 'KICK' },
  { note: 'D5', beats: 1, bass: 'G3', drum: 'SNARE' },
  { note: 'C5', beats: 1.5, bass: 'C4', drum: 'BOTH' },
  { note: 'REST', beats: 0.5, drum: 'SNARE' },
];

// 7. Olur mu böyle olur mu / Kardeş kardeşi vurur mu
const OLUR_MU_BOYLE_SCORE: NoteStep[] = [
  { note: 'E4', beats: 1, bass: 'A3', drum: 'KICK' },
  { note: 'A4', beats: 1, bass: 'A3', drum: 'SNARE' },
  { note: 'A4', beats: 1, bass: 'C4', drum: 'KICK' },
  { note: 'B4', beats: 1, bass: 'B3', drum: 'SNARE' },
  { note: 'C5', beats: 1.5, bass: 'A3', drum: 'KICK' },
  { note: 'B4', beats: 0.5, bass: 'A3', drum: 'SNARE' },
  { note: 'A4', beats: 1, bass: 'C4', drum: 'KICK' },
  { note: 'B4', beats: 1, bass: 'E4', drum: 'SNARE' },

  { note: 'C5', beats: 1, bass: 'A3', drum: 'KICK' },
  { note: 'D5', beats: 1, bass: 'D4', drum: 'SNARE' },
  { note: 'E5', beats: 1.5, bass: 'C4', drum: 'KICK' },
  { note: 'D5', beats: 0.5, bass: 'B3', drum: 'SNARE' },
  { note: 'C5', beats: 1, bass: 'A3', drum: 'KICK' },
  { note: 'B4', beats: 1, bass: 'E4', drum: 'SNARE' },
  { note: 'A4', beats: 1.5, bass: 'A3', drum: 'BOTH' },
  { note: 'REST', beats: 0.5, drum: 'SNARE' },
];

// 8. Imperium Strategy Symphony
const STRATEGY_SYMPHONY_SCORE: NoteStep[] = [
  { note: 'D4', beats: 1.5, bass: 'A3', drum: 'KICK' },
  { note: 'F4', beats: 0.5, bass: 'A3' },
  { note: 'A4', beats: 2, bass: 'D4', drum: 'SNARE' },
  { note: 'G4', beats: 1.5, bass: 'C4', drum: 'KICK' },
  { note: 'F4', beats: 0.5, bass: 'C4' },
  { note: 'E4', beats: 2, bass: 'A3', drum: 'SNARE' },
  { note: 'D4', beats: 1.5, bass: 'A3', drum: 'KICK' },
  { note: 'A4', beats: 0.5, bass: 'D4' },
  { note: 'Bb4', beats: 1, bass: 'D4', drum: 'SNARE' },
  { note: 'A4', beats: 1, bass: 'C4', drum: 'KICK' },
  { note: 'G4', beats: 1, bass: 'B3', drum: 'SNARE' },
  { note: 'E4', beats: 1, bass: 'A3', drum: 'KICK' },
  { note: 'D4', beats: 2, bass: 'A3', drum: 'BOTH' },
];

class NationalMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlayingState: boolean = false;
  private currentTrack: MusicTrackId = 'TR_MEHTER_CEDDIN';
  private customTrackName: string = 'Özel Marş (MP3)';
  private customAudioEl: HTMLAudioElement | null = null;
  private customObjectUrl: string | null = null;
  private youtubeModeEnabled: boolean = false;
  private customYouTubeVideoId: string | null = null;
  private stepIndex: number = 0;
  private timerId: number | null = null;
  private listeners: Set<() => void> = new Set();

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public get isPlaying(): boolean {
    return this.isPlayingState;
  }

  public get activeTrackId(): MusicTrackId {
    return this.currentTrack;
  }

  public get isYouTubeMode(): boolean {
    return this.youtubeModeEnabled;
  }

  public get activeYouTubeVideoId(): string {
    if (this.customYouTubeVideoId) {
      return this.customYouTubeVideoId;
    }
    const found = MUSIC_TRACKS.find((t) => t.id === this.currentTrack);
    return found?.youtubeVideoId || 'M9mB9ce2t2k';
  }

  public get activeTrackTitle(): string {
    if (this.currentTrack === 'CUSTOM_MP3') {
      return this.customTrackName;
    }
    return (
      MUSIC_TRACKS.find((t) => t.id === this.currentTrack)?.title ||
      'Ceddin Deden, Neslin Baban'
    );
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public selectDefaultTrackForNation(nationId: string) {
    if (this.currentTrack === 'CUSTOM_MP3') return;
    if (nationId === '792' || nationId === '031') {
      this.currentTrack = 'TR_MEHTER_CEDDIN';
    }
    this.notify();
  }

  public setYouTubeMode(enabled: boolean, customUrlOrId?: string) {
    if (customUrlOrId !== undefined) {
      const parsed = extractYouTubeVideoId(customUrlOrId);
      if (parsed) {
        this.customYouTubeVideoId = parsed;
      }
    }
    this.youtubeModeEnabled = enabled;
    if (enabled) {
      // Stop internal WebAudio loop while YouTube iframe plays
      if (this.timerId !== null) {
        window.clearTimeout(this.timerId);
        this.timerId = null;
      }
      if (this.customAudioEl) {
        this.customAudioEl.pause();
      }
      this.isPlayingState = true;
    } else if (this.isPlayingState) {
      this.initContext();
      this.scheduleNextNote();
    }
    this.notify();
  }

  public loadCustomMp3File(file: File) {
    this.stop();
    this.youtubeModeEnabled = false;
    if (this.customObjectUrl) {
      URL.revokeObjectURL(this.customObjectUrl);
    }
    this.customObjectUrl = URL.createObjectURL(file);
    this.customTrackName = file.name.replace(/\.[^/.]+$/, '');
    this.customAudioEl = new Audio(this.customObjectUrl);
    this.customAudioEl.loop = true;
    this.customAudioEl.volume = 0.65;
    this.currentTrack = 'CUSTOM_MP3';
    this.play();
  }

  public setTrack(trackId: MusicTrackId) {
    const wasPlaying = this.isPlayingState;
    this.stop();
    this.currentTrack = trackId;
    this.customYouTubeVideoId = null;
    this.stepIndex = 0;
    if (wasPlaying) {
      this.play();
    } else {
      this.notify();
    }
  }

  public nextTrack() {
    const idx = MUSIC_TRACKS.findIndex((t) => t.id === this.currentTrack);
    const next = MUSIC_TRACKS[(idx + 1) % MUSIC_TRACKS.length];
    this.setTrack(next.id);
    if (!this.isPlayingState) {
      this.play();
    }
  }

  public toggle() {
    if (this.isPlayingState) {
      this.stop();
    } else {
      this.play();
    }
  }

  public play() {
    if (this.isPlayingState) return;
    this.isPlayingState = true;

    if (this.youtubeModeEnabled) {
      this.notify();
      return;
    }

    if (this.currentTrack === 'CUSTOM_MP3' && this.customAudioEl) {
      this.customAudioEl.play().catch(() => {
        this.isPlayingState = false;
        this.notify();
      });
      this.notify();
      return;
    }

    this.initContext();
    this.stepIndex = 0;
    this.scheduleNextNote();
    this.notify();
  }

  public stop() {
    this.isPlayingState = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.customAudioEl) {
      this.customAudioEl.pause();
    }
    this.notify();
  }

  private getScore(): { score: NoteStep[]; bpm: number; isMehter: boolean } {
    switch (this.currentTrack) {
      case 'TR_MEHTER_CEDDIN':
        return { score: MEHTER_CEDDIN_SCORE, bpm: 112, isMehter: true };
      case 'TR_MEHTER_HUCUM':
        return { score: MEHTER_HUCUM_SCORE, bpm: 124, isMehter: true };
      case 'TR_MEHTER_GENC_OSMAN':
        return { score: MEHTER_GENC_OSMAN_SCORE, bpm: 118, isMehter: true };
      case 'TR_MEHTER_YELKENLER':
        return { score: MEHTER_YELKENLER_SCORE, bpm: 114, isMehter: true };
      case 'TR_MEHTER_ESTERGON':
        return { score: MEHTER_ESTERGON_SCORE, bpm: 102, isMehter: true };
      case 'TR_MECIYIYE_MARSI':
        return { score: MECIDIYE_SCORE, bpm: 116, isMehter: false };
      case 'GLOBAL_STRATEGY_SYMPHONY':
        return { score: STRATEGY_SYMPHONY_SCORE, bpm: 104, isMehter: false };
      case 'TR_OLUR_MU_BOYLE':
      default:
        return { score: OLUR_MU_BOYLE_SCORE, bpm: 116, isMehter: false };
    }
  }

  private scheduleNextNote() {
    if (!this.isPlayingState || this.youtubeModeEnabled || !this.ctx) return;

    const { score, bpm, isMehter } = this.getScore();
    const step = score[this.stepIndex % score.length];
    this.stepIndex = (this.stepIndex + 1) % score.length;

    const beatDurationSec = 60 / bpm;
    const stepDurationSec = step.beats * beatDurationSec;
    const now = this.ctx.currentTime;

    // 1. Lead Mehter Zurna / Brass Voice (with nasal reed formant filter for Mehter tracks)
    const freq = N[step.note] || 0;
    if (freq > 0) {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = isMehter ? 'sawtooth' : 'triangle';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * (isMehter ? 1.0045 : 1.003), now);

      filter.type = isMehter ? 'bandpass' : 'lowpass';
      filter.frequency.setValueAtTime(isMehter ? 1320 : 1450, now);
      if (isMehter) {
        filter.Q.setValueAtTime(1.4, now);
      }

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(isMehter ? 0.11 : 0.09, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + Math.max(0.08, stepDurationSec * 0.92)
      );

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + stepDurationSec);
      osc2.stop(now + stepDurationSec);
    }

    // 2. Boru / Bass Harmony Voice
    const bassFreq = step.bass ? N[step.bass] || 0 : 0;
    if (bassFreq > 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(bassFreq * 0.5, now);

      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.linearRampToValueAtTime(0.08, now + 0.02);
      bassGain.gain.exponentialRampToValueAtTime(
        0.001,
        now + Math.max(0.08, stepDurationSec * 0.85)
      );

      bassOsc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + stepDurationSec);
    }

    // 3. Imperial Kös (Deep Kettle Drum), Nakkaare & Çevgan (Zil / Cymbal)
    if (
      step.drum === 'KICK' ||
      step.drum === 'BOTH' ||
      step.drum === 'CEVGAN'
    ) {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(125, now);
      kickOsc.frequency.exponentialRampToValueAtTime(36, now + 0.16);

      kickGain.gain.setValueAtTime(0.13, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

      kickOsc.connect(kickGain);
      kickGain.connect(this.ctx.destination);
      kickOsc.start(now);
      kickOsc.stop(now + 0.18);
    }

    if (step.drum === 'SNARE' || step.drum === 'BOTH') {
      const snareOsc = this.ctx.createOscillator();
      const snareGain = this.ctx.createGain();
      snareOsc.type = 'triangle';
      snareOsc.frequency.setValueAtTime(250, now);
      snareOsc.frequency.exponentialRampToValueAtTime(92, now + 0.065);

      snareGain.gain.setValueAtTime(0.05, now);
      snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      snareOsc.connect(snareGain);
      snareGain.connect(this.ctx.destination);
      snareOsc.start(now);
      snareOsc.stop(now + 0.08);
    }

    if (step.drum === 'CEVGAN') {
      // Metallic Mehter Zil / Çevgan Cymbal Shimmer
      const zilOsc = this.ctx.createOscillator();
      const zilFilter = this.ctx.createBiquadFilter();
      const zilGain = this.ctx.createGain();
      zilOsc.type = 'square';
      zilOsc.frequency.setValueAtTime(3150, now);
      zilFilter.type = 'highpass';
      zilFilter.frequency.setValueAtTime(2400, now);

      zilGain.gain.setValueAtTime(0.025, now);
      zilGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.14);

      zilOsc.connect(zilFilter);
      zilFilter.connect(zilGain);
      zilGain.connect(this.ctx.destination);
      zilOsc.start(now);
      zilOsc.stop(now + 0.15);
    }

    this.timerId = window.setTimeout(() => {
      this.scheduleNextNote();
    }, stepDurationSec * 1000);
  }
}

export const music = new NationalMusicEngine();
