import React from 'react';
import { Nation } from '../../types/game';
import {
  calculateArmyModernizationCost,
  getArmyGenerationInfo,
  getNationModernizedTier,
  getNationUnlockedMilTier,
} from '../../data/world2026Data';

interface ArmyModernizationCardProps {
  playerNation: Nation;
  totalGarrison: number;
  gameMode: string;
  onModernizeNationalArmy: () => void;
}

export const ArmyModernizationCard: React.FC<ArmyModernizationCardProps> = ({
  playerNation,
  totalGarrison,
  gameMode,
  onModernizeNationalArmy,
}) => {
  const unlockedMilTier = getNationUnlockedMilTier(playerNation);
  const modernizedTier = getNationModernizedTier(playerNation);
  const activeArmyGen = getArmyGenerationInfo(gameMode, modernizedTier);
  const targetArmyGen = getArmyGenerationInfo(gameMode, unlockedMilTier);
  const hasPendingArmyUpgrade = unlockedMilTier > modernizedTier;
  const modernizationCost = calculateArmyModernizationCost(
    playerNation,
    totalGarrison
  );
  const canAffordModernization =
    hasPendingArmyUpgrade && playerNation.treasury >= modernizationCost;

  return (
    <div
      className={`rounded-2xl p-3.5 border space-y-2.5 ${
        hasPendingArmyUpgrade
          ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-sky-950/50 border-amber-400/60 shadow-lg shadow-amber-500/10'
          : 'bg-slate-900/90 border-slate-800'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 font-mono-num text-[11px] font-bold text-amber-300">
              {activeArmyGen.generationLabel}
            </span>
            <span className="text-xs font-bold text-white">
              {activeArmyGen.eraTitle}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Aktif Birlikler:{' '}
            <strong className="text-emerald-300">
              {activeArmyGen.infantryShort}
            </strong>{' '}
            ·{' '}
            <strong className="text-amber-300">
              {activeArmyGen.armorShort}
            </strong>{' '}
            ·{' '}
            <strong className="text-sky-300">
              {activeArmyGen.airArtilleryShort}
            </strong>
          </div>
        </div>
        <span className="font-mono-num text-xs font-bold text-emerald-400">
          {activeArmyGen.combatBonusPct > 0
            ? `+%${activeArmyGen.combatBonusPct} Modernizasyon Gücü`
            : 'Temel Teçhizat'}
        </span>
      </div>

      {hasPendingArmyUpgrade ? (
        <button
          disabled={!canAffordModernization}
          onClick={onModernizeNationalArmy}
          className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2 transition-all ${
            canAffordModernization
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
          }`}
        >
          <span className="text-center sm:text-left">
            ⚡ Orduları {targetArmyGen.generationLabel} ({targetArmyGen.eraTitle}) Seviyesine Güncelle
          </span>
          <span className="font-mono-num shrink-0 opacity-90">
            {modernizationCost} Altın · +%{targetArmyGen.combatBonusPct} Güç
          </span>
        </button>
      ) : (
        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5">
          <span>
            {unlockedMilTier < 4
              ? 'Yeni nesil silah ve birlikleri açmak için Askeri Teknoloji Ağacında ilerleyin.'
              : 'Tüm ordularınız çağın zirve teknolojisiyle tam donatıldı!'}
          </span>
          <span className="font-mono-num text-sky-400 font-semibold shrink-0 ml-2">
            Teknoloji: {unlockedMilTier}/4
          </span>
        </div>
      )}
    </div>
  );
};
