export type PerfInteraction = 'idle' | 'pan' | 'zoom';

export interface PerformanceTelemetrySnapshot {
  sessionId: string;
  capturedAt: string;
  device: {
    userAgent: string;
    platform: string;
    hardwareConcurrency: number | null;
    deviceMemoryGb: number | null;
    devicePixelRatio: number;
    viewport: { width: number; height: number; orientation: string };
  };
  map: {
    interaction: PerfInteraction;
    sampleMs: number;
    frames: number;
    measuredFps: number;
    droppedFrameRatio: number;
  };
  simulation: {
    samples: number;
    averageTickMs: number | null;
    p95TickMs: number | null;
    maxTickMs: number | null;
  };
}

const STORAGE_KEY = 'imperium-performance-telemetry-v1';
const MAX_RECORDS = 20;

const percentile = (values: number[], p: number) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)];
};

const readRecords = (): PerformanceTelemetrySnapshot[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PerformanceTelemetrySnapshot[]) : [];
  } catch {
    return [];
  }
};

export class PerformanceTelemetry {
  private readonly sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  private readonly tickSamples: number[] = [];
  private lastTickAt: number | null = null;
  private interaction: PerfInteraction = 'idle';
  private rafId: number | null = null;
  private frameCount = 0;
  private droppedFrames = 0;
  private sampleStartedAt = 0;
  private lastFrameAt = 0;
  private sampleMs = 0;
  private lastPersistAt = 0;

  start() {
    if (typeof window === 'undefined' || this.rafId !== null) return;
    this.sampleStartedAt = performance.now();
    this.lastFrameAt = this.sampleStartedAt;
    const frame = (now: number) => {
      const delta = now - this.lastFrameAt;
      this.lastFrameAt = now;
      this.frameCount += 1;
      if (delta > 34) this.droppedFrames += 1;
      this.sampleMs = now - this.sampleStartedAt;
      if (this.sampleMs >= 5000) {
        this.persist();
        this.sampleStartedAt = now;
        this.frameCount = 0;
        this.droppedFrames = 0;
      }
      this.rafId = window.requestAnimationFrame(frame);
    };
    this.rafId = window.requestAnimationFrame(frame);
  }

  stop() {
    if (this.rafId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  setInteraction(interaction: PerfInteraction) {
    this.interaction = interaction;
  }

  recordSimulationTick() {
    const now = performance.now();
    if (this.lastTickAt !== null) this.tickSamples.push(now - this.lastTickAt);
    this.lastTickAt = now;
    if (this.tickSamples.length > 120) this.tickSamples.shift();
  }

  snapshot(): PerformanceTelemetrySnapshot {
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
    const durationSeconds = Math.max(this.sampleMs / 1000, 0.001);
    const measuredFps = this.frameCount / durationSeconds;
    return {
      sessionId: this.sessionId,
      capturedAt: new Date().toISOString(),
      device: {
        userAgent: nav?.userAgent || 'unknown',
        platform: nav?.platform || 'unknown',
        hardwareConcurrency: nav?.hardwareConcurrency || null,
        deviceMemoryGb: (nav as Navigator & { deviceMemory?: number }).deviceMemory || null,
        devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
        viewport: {
          width: screenWidth,
          height: screenHeight,
          orientation: screenWidth >= screenHeight ? 'landscape' : 'portrait',
        },
      },
      map: {
        interaction: this.interaction,
        sampleMs: Math.round(this.sampleMs),
        frames: this.frameCount,
        measuredFps: Math.round(measuredFps * 10) / 10,
        droppedFrameRatio: this.frameCount
          ? Math.round((this.droppedFrames / this.frameCount) * 1000) / 1000
          : 0,
      },
      simulation: {
        samples: this.tickSamples.length,
        averageTickMs: this.tickSamples.length
          ? Math.round((this.tickSamples.reduce((a, b) => a + b, 0) / this.tickSamples.length) * 10) / 10
          : null,
        p95TickMs: percentile(this.tickSamples, 0.95),
        maxTickMs: this.tickSamples.length ? Math.max(...this.tickSamples) : null,
      },
    };
  }

  persist() {
    if (typeof window === 'undefined' || this.sampleMs < 1000) return;
    const now = Date.now();
    if (now - this.lastPersistAt < 1000) return;
    this.lastPersistAt = now;
    const records = [...readRecords(), this.snapshot()].slice(-MAX_RECORDS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // Performance logging must never affect gameplay.
    }
  }
}

export const performanceTelemetry = new PerformanceTelemetry();
