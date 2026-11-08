import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Maximize2, Minimize2, Smartphone, WifiOff, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { sound } from '../utils/soundEngine';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, isOnline, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const guideDialogRef = useAccessibleDialog(showGuideModal, () =>
    setShowGuideModal(false)
  );

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    sound.playClick();
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore if blocked by iframe permissions
    }
  };

  const handleInstallClick = async () => {
    sound.playClick();
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      {!isOnline && (
        <div
          title="Çevrimdışı Mod (Önbellek Aktif)"
          className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap"
        >
          <WifiOff className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Çevrimdışı</span>
        </div>
      )}

      {/* Fullscreen Toggle Button for Android & Desktop */}
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran Oynanış (Android/PC)'}
        className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 transition-colors shrink-0"
      >
        {isFullscreen ? (
          <Minimize2 className="w-4 h-4 text-amber-400" />
        ) : (
          <Maximize2 className="w-4 h-4 text-amber-400" />
        )}
        {!compact && <span className="hidden sm:inline">Tam Ekran</span>}
      </button>

      {/* Install PWA Button (hidden once running in installed standalone mode) */}
      {!isInstalled && (
        <button
          onClick={handleInstallClick}
          title="Android / Cihaza Uygulama Olarak Yükle"
          className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] px-2 sm:px-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className={compact ? 'hidden xl:inline' : ''}>
            {isIOS ? 'iOS Kurulum' : 'Uygulamayı İndir'}
          </span>
        </button>
      )}

      {/* Render modal via Portal to document.body so header backdrop-filter never clips fixed positioning */}
      {showGuideModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div
              ref={guideDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="pwa-guide-title"
              aria-describedby="pwa-guide-description"
              tabIndex={-1}
              className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <h3 id="pwa-guide-title" className="font-display text-base font-bold text-white">
                    Android & Mobil Uygulama Kurulumu
                  </h3>
                </div>
                <button
                  onClick={() => setShowGuideModal(false)}
                  aria-label="Kurulum yönergesini kapat"
                  className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div id="pwa-guide-description" className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
                <p>
                  <strong>Imperium 2026</strong>, PWA (Progressive Web App) teknolojisiyle telefonunuza tam ekran bir mobil oyun olarak kurulabilir ve internetsiz oynanabilir:
                </p>
                {isIOS ? (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
                    <div>1. Safari alt çubuğundaki <strong>Paylaş (Share)</strong> simgesine dokunun.</div>
                    <div>2. Aşağı kaydırıp <strong>Ana Ekrana Ekle (Add to Home Screen)</strong> seçeneğine basın.</div>
                  </div>
                ) : (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
                    <div>1. Oyunu doğrudan kendi sekmesinde açın (sağ üstteki yeni sekme ikonu).</div>
                    <div>2. Android Chrome menüsünden (<strong>⋮</strong>) <strong>Uygulamayı Yükle</strong> veya <strong>Ana ekrana ekle</strong> seçeneğine dokunun.</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Anladım
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
