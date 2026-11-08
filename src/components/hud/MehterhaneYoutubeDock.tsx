import React, { useEffect, useState } from 'react';
import { SkipForward, Youtube, X, Music, Volume2, VolumeX } from 'lucide-react';
import {
  extractYouTubeVideoId,
  music,
  MUSIC_TRACKS,
} from '../../engine/musicEngine';
import { sound } from '../../utils/soundEngine';

export const MehterhaneYoutubeDock: React.FC = () => {
  const [, setTick] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [customYtInput, setCustomYtInput] = useState('');

  useEffect(() => {
    return music.subscribe(() => setTick((t) => t + 1));
  }, []);

  const isPlaying = music.isPlaying;
  const isYtMode = music.isYouTubeMode;
  const videoId = music.activeYouTubeVideoId;

  if (!isPlaying && !isExpanded) {
    return null;
  }

  return (
    <div className="fixed bottom-16 right-3 z-30 flex flex-col items-end gap-1.5 pointer-events-none">
      {/* Persistent YouTube IFrame when YouTube Mode is active */}
      {isPlaying && isYtMode && videoId && (
        <div
          className={`pointer-events-auto overflow-hidden rounded-2xl border border-amber-500/60 bg-slate-950 shadow-2xl transition-all ${
            isExpanded ? 'w-72 h-40' : 'w-44 h-24 opacity-95'
          }`}
        >
          <iframe
            key={videoId}
            width="100%"
            height="100%"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&rel=0`}
            title="Osmanlı Mehterhane YouTube Orijinal Marş Çalar"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-full h-full border-0"
          />
        </div>
      )}

      {/* Expanded Quick Mehterhane Selector */}
      {isExpanded && (
        <div className="pointer-events-auto w-72 sm:w-80 rounded-2xl bg-[#090e1a]/98 border border-amber-500/50 shadow-2xl p-3 space-y-2.5 text-xs text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 font-display font-bold text-amber-300">
              <Music className="w-4 h-4 text-amber-400" />
              <span>Mehterhane-i Hümayun & YouTube</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode Switch: Built-in Mehter Synth vs YouTube Original */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                sound.playClick();
                music.setYouTubeMode(false);
              }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors ${
                !isYtMode
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎺 Mehter Sentezleyici
            </button>
            <button
              onClick={() => {
                sound.playClick();
                music.setYouTubeMode(true);
              }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors ${
                isYtMode
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>YouTube Orijinal</span>
            </button>
          </div>

          {/* Custom YouTube URL Input */}
          {isYtMode && (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={customYtInput}
                onChange={(e) => setCustomYtInput(e.target.value)}
                placeholder="YouTube marş linki veya Video ID yapıştır..."
                className="flex-1 h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => {
                  const id = extractYouTubeVideoId(customYtInput);
                  if (id) {
                    music.setYouTubeMode(true, id);
                    setCustomYtInput('');
                  }
                }}
                className="h-8 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shrink-0"
              >
                Aç
              </button>
            </div>
          )}

          {/* Track List */}
          <div className="max-h-44 overflow-y-auto space-y-1 pr-0.5">
            {MUSIC_TRACKS.map((trk) => {
              const active = music.activeTrackId === trk.id;
              return (
                <button
                  key={trk.id}
                  onClick={() => {
                    music.setTrack(trk.id);
                    if (!music.isPlaying) music.play();
                  }}
                  className={`w-full p-2 rounded-xl border text-left transition-colors ${
                    active
                      ? 'bg-amber-500/20 border-amber-400 text-white'
                      : 'bg-slate-950/80 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[11px] truncate">
                      {trk.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
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
        </div>
      )}

      {/* Compact Floating Mehter Pill */}
      <div className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#090e1a]/95 border border-amber-500/45 shadow-xl text-xs">
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-left max-w-[165px]"
          title="Mehterhane & YouTube Marş Seçiciyi Aç"
        >
          <span className="text-amber-400 font-bold">♫</span>
          <span className="text-[11px] font-semibold text-amber-100 truncate">
            {music.activeTrackTitle}
          </span>
        </button>

        <button
          onClick={() => music.nextTrack()}
          title="Sonraki Osmanlı Marşı"
          className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-amber-300"
        >
          <SkipForward className="w-3 h-3" />
        </button>

        <button
          onClick={() => music.toggle()}
          title={isPlaying ? 'Marşı Durdur' : 'Marşı Çal'}
          className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-emerald-400"
        >
          {isPlaying ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>
      </div>
    </div>
  );
};
