import React from 'react';
import {
  Globe,
  TrendingUp,
  Handshake,
  Landmark,
  Swords,
} from 'lucide-react';
import { BottomDrawerTab } from '../../types/game';
import { sound } from '../../utils/soundEngine';

interface BottomNavBarProps {
  activeTab: BottomDrawerTab;
  activeWarCount: number;
  onSetActiveTab: (tab: BottomDrawerTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  activeWarCount,
  onSetActiveTab,
}) => {
  const tabs = [
    { id: 'TERRITORY' as const, label: 'Eyalet', icon: Globe },
    { id: 'ECONOMY' as const, label: 'Ekonomi', icon: TrendingUp },
    {
      id: 'DIPLOMACY' as const,
      label: `Diplomasi${activeWarCount > 0 ? ` (${activeWarCount})` : ''}`,
      icon: Handshake,
    },
    { id: 'GOVERNMENT' as const, label: 'Yönetim', icon: Landmark },
    { id: 'MILITARY' as const, label: 'Ordugâh', icon: Swords },
  ];

  return (
    <nav aria-label="Ana aksiyon şeridi" className="hud-bottom-nav h-16 pb-safe bg-slate-950/98 border-t border-slate-800/90 grid grid-cols-5 items-center z-30 shrink-0 px-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              sound.playClick();
              onSetActiveTab(isActive ? 'NONE' : tab.id);
            }}
            className={`hud-bottom-nav-btn min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-colors ${
              isActive
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-pressed={isActive}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-semibold tracking-tight mt-1 whitespace-nowrap truncate max-w-[90%]">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
