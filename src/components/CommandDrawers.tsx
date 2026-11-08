import React, { useState } from 'react';
import {
  X,
  Shield,
  Coins,
  Swords,
  Handshake,
  Landmark,
} from 'lucide-react';
import { CommandDrawersProps } from './drawers/drawerTypes';
import { ProvinceDrawer } from './drawers/ProvinceDrawer';
import { EconomyDrawer } from './drawers/EconomyDrawer';
import { DiplomacyDrawer } from './drawers/DiplomacyDrawer';
import { GovernmentTechDrawer } from './drawers/GovernmentTechDrawer';
import { MilitaryDrawer } from './drawers/MilitaryDrawer';
import { sound } from '../utils/soundEngine';

export type { CommandDrawersProps } from './drawers/drawerTypes';

export const CommandDrawers: React.FC<CommandDrawersProps> = (props) => {
  const { activeTab, onClose, selectedTerritory } = props;
  const [drawerSizeMode, setDrawerSizeMode] = useState<'FULL' | 'COMPACT' | 'MINIMIZED'>('FULL');

  if (activeTab === 'NONE') return null;

  const cycleSizeMode = () => {
    sound.playClick();
    setDrawerSizeMode((prev) =>
      prev === 'FULL' ? 'COMPACT' : prev === 'COMPACT' ? 'MINIMIZED' : 'FULL'
    );
  };

  return (
    <div className="hud-drawer-wrapper fixed inset-x-0 bottom-16 z-30 mx-auto max-w-6xl px-2 sm:px-4 pointer-events-none">
      <div
        className={`hud-drawer-card pointer-events-auto bg-slate-900/98 border border-slate-700/90 rounded-t-3xl sm:rounded-2xl shadow-2xl ${
          drawerSizeMode === 'MINIMIZED'
            ? 'max-h-[48px]'
            : drawerSizeMode === 'COMPACT'
            ? 'max-h-[42vh] landscape:max-h-[48vh]'
            : 'max-h-[76vh] landscape:max-h-[78vh]'
        } flex flex-col overflow-hidden transition-all`}
      >
        {/* Top Grab Handle & Header (Responsive across Portrait & Landscape) */}
        <div className="hud-drawer-header flex items-center justify-between px-3.5 sm:px-5 py-2 sm:py-2.5 border-b border-slate-800 shrink-0 gap-2">
          <div className="hud-drawer-header-title flex items-center gap-2 min-w-0">
            {activeTab === 'TERRITORY' && (
              <>
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                <h2 className="font-display text-xs sm:text-base font-bold text-white truncate">
                  {selectedTerritory
                    ? `${selectedTerritory.isCapital ? '★ ' : ''}${selectedTerritory.name.replace(/^★\s*/, '')}`
                    : 'Eyalet Komuta Merkezi'}
                </h2>
              </>
            )}
            {activeTab === 'ECONOMY' && (
              <>
                <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                <h2 className="font-display text-xs sm:text-base font-bold text-white truncate">
                  İmparatorluk Hazinesi, Vergi ve Bütçe
                </h2>
              </>
            )}
            {activeTab === 'DIPLOMACY' && (
              <>
                <Handshake className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                <h2 className="font-display text-xs sm:text-base font-bold text-white truncate">
                  Diplomasi, Koalisyonlar ve Barış Masası
                </h2>
              </>
            )}
            {activeTab === 'GOVERNMENT' && (
              <>
                <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 shrink-0" />
                <h2 className="font-display text-xs sm:text-base font-bold text-white truncate">
                  İdeoloji, Reformlar ve Teknoloji Ağacı
                </h2>
              </>
            )}
            {activeTab === 'MILITARY' && (
              <>
                <Swords className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 shrink-0" />
                <h2 className="font-display text-xs sm:text-base font-bold text-white truncate">
                  Genelkurmay, Paşalar ve Güç Sıralaması
                </h2>
              </>
            )}
          </div>

          <div className="hud-drawer-header-controls flex items-center gap-1.5 shrink-0">
            <button
              onClick={cycleSizeMode}
              className="px-2.5 min-h-[34px] sm:min-h-[36px] rounded-xl text-[11px] font-semibold bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors"
              title="Panel Boyutunu Değiştir (Tam / Yarım / Haritayı Gör)"
            >
              {drawerSizeMode === 'FULL'
                ? '▼ Yarım Panel'
                : drawerSizeMode === 'COMPACT'
                ? '▼ Haritayı Gör'
                : '▲ Paneli Aç'}
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="min-w-[34px] min-h-[34px] sm:min-w-[36px] sm:min-h-[36px] rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        {drawerSizeMode !== 'MINIMIZED' && (
          <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-4">
            {activeTab === 'TERRITORY' && <ProvinceDrawer {...props} />}
            {activeTab === 'ECONOMY' && <EconomyDrawer {...props} />}
            {activeTab === 'DIPLOMACY' && <DiplomacyDrawer {...props} />}
            {activeTab === 'GOVERNMENT' && <GovernmentTechDrawer {...props} />}
            {activeTab === 'MILITARY' && <MilitaryDrawer {...props} />}
          </div>
        )}
      </div>
    </div>
  );
};
