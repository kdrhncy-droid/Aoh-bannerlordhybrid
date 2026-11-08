import React from 'react';
import {
  AlertTriangle,
  Newspaper,
  CheckCircle2,
  Swords,
  Handshake,
  ShieldAlert,
  TrendingUp,
  X,
  Sparkles,
} from 'lucide-react';
import {
  CrisisEventDefinition,
  CrisisEventOption,
  WorldNewsEvent,
} from '../types/game';
import { sound } from '../utils/soundEngine';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';

interface CrisisAndNewsModalProps {
  activeCrisis: CrisisEventDefinition | null;
  onResolveCrisis: (option: CrisisEventOption) => void;
  showNewsDrawer: boolean;
  onCloseNewsDrawer: () => void;
  newsEvents: WorldNewsEvent[];
  onTriggerManualCabinetDecision: () => void;
}

export const CrisisAndNewsModal: React.FC<CrisisAndNewsModalProps> = ({
  activeCrisis,
  onResolveCrisis,
  showNewsDrawer,
  onCloseNewsDrawer,
  newsEvents,
  onTriggerManualCabinetDecision,
}) => {
  const crisisDialogRef = useAccessibleDialog(
    Boolean(activeCrisis),
    () => undefined,
    { closeOnEscape: false }
  );
  const accessibleNewsOpen = showNewsDrawer && !activeCrisis;
  const newsDialogRef = useAccessibleDialog(
    accessibleNewsOpen,
    onCloseNewsDrawer
  );

  return (
    <>
      {/* 1. Interactive Crisis / Opportunity Decision Modal */}
      {activeCrisis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div
            ref={crisisDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="crisis-dialog-title"
            aria-describedby="crisis-dialog-description"
            tabIndex={-1}
            className="w-full max-w-lg rounded-2xl bg-slate-900 border border-amber-500/50 p-5 sm:p-6 shadow-2xl text-slate-100 space-y-4"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-amber-400">
                    Ulusal Kabine Gündemi · {activeCrisis.category}
                  </div>
                  <h3 id="crisis-dialog-title" className="font-display text-base sm:text-lg font-bold text-white">
                    {activeCrisis.title}
                  </h3>
                </div>
              </div>
            </div>

            <p id="crisis-dialog-description" className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeCrisis.description}
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="text-xs font-semibold text-slate-400">
                Stratejik Kararınızı Seçin:
              </div>
              {activeCrisis.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    sound.playTreaty();
                    onResolveCrisis(opt);
                  }}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-950/90 hover:bg-slate-800/90 border border-slate-700 hover:border-amber-500/70 transition-all flex items-center justify-between gap-3 group"
                >
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      {opt.label}
                    </div>
                    <div className="font-mono-num text-[11px] text-emerald-400 mt-1">
                      {opt.effectSummary}
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-slate-500 group-hover:text-amber-400 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Live World News Feed Drawer */}
      {accessibleNewsOpen && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/50 backdrop-blur-xs">
          <div
            ref={newsDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="news-dialog-title"
            tabIndex={-1}
            className="w-full max-w-md h-full bg-slate-950/95 border-l border-slate-800 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Newspaper className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 id="news-dialog-title" className="font-display text-base font-bold text-white">
                    Canlı Dünya Haber Ajansı
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Küresel savaşlar, koalisyonlar ve diplomatik gelişmeler
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onCloseNewsDrawer();
                }}
                aria-label="Haberler panelini kapat"
                className="min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-800/80 bg-slate-900/50">
              <button
                onClick={() => {
                  sound.playClick();
                  onCloseNewsDrawer();
                  onTriggerManualCabinetDecision();
                }}
                className="w-full min-h-[44px] rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Kabineyi Topla & Stratejik Karar Al
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {newsEvents.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500">
                  Henüz küresel bir haber kaydı bulunmuyor.
                </div>
              ) : (
                newsEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 font-bold text-amber-400">
                        {ev.type === 'WAR' && (
                          <Swords className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        {ev.type === 'PEACE' && (
                          <Handshake className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {ev.type === 'COALITION' && (
                          <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                        )}
                        {ev.type === 'ECONOMY' && (
                          <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                        )}
                        <span>{ev.title}</span>
                      </span>
                      <span className="font-mono-num text-slate-400">
                        {ev.dateStr}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
