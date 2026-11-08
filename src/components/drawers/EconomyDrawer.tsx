import React from 'react';
import { Anchor, Compass, Swords } from 'lucide-react';
import { CommandDrawersProps } from './drawerTypes';
import {
  evaluateActiveStraits,
  TRADE_RAID_INFLUENCE_COST,
  TRADE_RAID_MANPOWER_COST,
} from '../../engine/straitsAndTradeEngine';

export const EconomyDrawer: React.FC<CommandDrawersProps> = ({
  playerNation,
  playerEconomy,
  territories,
  nations,
  wars,
  onUpdateTaxRate,
  onUpdateBudget,
  onCentralBankIntervention,
  onIssueWarBonds,
  onRaidEnemyTradeRoutes,
  onSelectTerritory,
  gameMode = 'EMPIRES_1440',
}) => {
  const is1440 = gameMode === 'EMPIRES_1440';
  const tradeDetails = playerEconomy.tradeDetails;
  const domesticTrade = Math.max(
    0,
    playerEconomy.tradeIncome -
      playerEconomy.straitTollIncome -
      playerEconomy.caravanTradeIncome -
      playerEconomy.seizedBlockadeIncome
  );
  const allWorldStraits = evaluateActiveStraits(territories, wars);
  const isPlayerInWar = wars.some(
    (w) =>
      w.attackers.includes(playerNation.id) ||
      w.defenders.includes(playerNation.id)
  );
  const canRaidTrade =
    isPlayerInWar &&
    Boolean(onRaidEnemyTradeRoutes) &&
    (playerNation.clanInfluence ?? 120) >= TRADE_RAID_INFLUENCE_COST &&
    playerNation.manpower >= TRADE_RAID_MANPOWER_COST;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Income & Expense Breakdown (6 cols) */}
      <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-white">
          Günlük Hazine Gelir ve Gider Bilançosu
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-800/80">
            <span className="text-slate-300">
              Vergi Gelirleri (%{playerNation.taxRate} Oran)
            </span>
            <span className="font-mono-num font-semibold text-emerald-400">
              +{playerEconomy.taxIncome} Altın
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/80">
            <span className="text-slate-300">
              Sanayi & Stratejik Kaynak Üretimi
            </span>
            <span className="font-mono-num font-semibold text-emerald-400">
              +{playerEconomy.productionIncome} Altın
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/80">
            <span className="text-slate-300">
              İç Pazar & Ticaret Antlaşmaları
            </span>
            <span className="font-mono-num font-semibold text-emerald-400">
              +{domesticTrade} Altın
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/80">
            <span className="text-amber-200 flex items-center gap-1.5">
              <span>⚓ Stratejik Boğaz Gümrükleri</span>
              {playerEconomy.seizedBlockadeIncome > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                  +{playerEconomy.seizedBlockadeIncome} Abluka
                </span>
              )}
            </span>
            <span className="font-mono-num font-semibold text-amber-300">
              +{playerEconomy.straitTollIncome + playerEconomy.seizedBlockadeIncome} Altın
            </span>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 py-1.5 border-b border-slate-800/80">
            <div className="min-w-0">
              <span className="text-sky-200">
                {is1440
                  ? '🐪 İpek & Baharat Kervan Geliri (Net)'
                  : '🚢 Deniz & Lojistik Geliri (Net)'}
              </span>
              {playerEconomy.blockadePenaltyLoss > 0 && (
                <p className="mt-0.5 text-[10px] leading-tight text-rose-300">
                  Abluka kesintisi −{playerEconomy.blockadePenaltyLoss} Altın; net gelire zaten yansıtıldı.
                </p>
              )}
            </div>
            <span className="font-mono-num font-semibold text-sky-300">
              +{playerEconomy.caravanTradeIncome} Altın
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/80">
            <span className="text-slate-300">Vasal Devletlerden Haraç Geliri</span>
            <span className="font-mono-num font-semibold text-emerald-400">
              +{playerEconomy.vassalIncome} Altın
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/80">
            <span className="text-slate-300">Üst Devlete Haraç Ödemesi</span>
            <span className="font-mono-num font-semibold text-rose-400">
              -{playerEconomy.vassalTributeOut} Altın
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/80">
            <span className="text-slate-300">
              Ordu Bakım Gideri (
              {playerEconomy.totalGarrison.toLocaleString('tr-TR')} Asker)
            </span>
            <span className="font-mono-num font-semibold text-rose-400">
              -{playerEconomy.militaryUpkeep} Altın
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/80">
            <span className="text-slate-300">
              Enflasyon Erimesi (%{playerNation.inflation.toFixed(1)})
            </span>
            <span className="font-mono-num font-semibold text-rose-400">
              -{playerEconomy.inflationPenalty} Altın
            </span>
          </div>

          <div className="flex justify-between pt-2 text-sm font-bold">
            <span className="text-white">Günlük Net Bütçe Dengesi</span>
            <span
              className={`font-mono-num ${
                playerEconomy.netDailyGold >= 0
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {playerEconomy.netDailyGold >= 0
                ? `+${playerEconomy.netDailyGold}`
                : playerEconomy.netDailyGold}{' '}
              Altın / Gün
            </span>
          </div>
        </div>

        {/* Monetary Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={onCentralBankIntervention}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-200 text-xs font-semibold flex flex-col items-center justify-center transition-colors"
          >
            <span>
              {is1440
                ? 'Sikke Tashihi & Narh Fermanı'
                : 'Enflasyonla Mücadele Paketi'}
            </span>
            <span className="text-[10px] text-sky-400">
              800 Altın → -%2.5 Enflasyon & +2 İstikrar
            </span>
          </button>
          <button
            onClick={onIssueWarBonds}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold flex flex-col items-center justify-center transition-colors"
          >
            <span>
              {is1440
                ? 'İltizam & Sefer Akçesi Çıkar'
                : 'Devlet Tahvili İhraç Et'}
            </span>
            <span className="text-[10px] text-amber-400">
              +850 Altın Anında (+%4.5 Enflasyon · -6 İstikrar)
            </span>
          </button>
        </div>
      </div>

      {/* Tax & Budget Sliders (6 cols) */}
      <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-4">
        <h3 className="text-sm font-bold text-white">
          Vergi Oranı ve Ulusal Bütçe Kaydırıcıları
        </h3>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">
              Ulusal Vergi Oranı (Yüksek vergi istikrarı zorlar)
            </span>
            <span className="font-mono-num font-bold text-amber-400">
              %{playerNation.taxRate}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={60}
            value={playerNation.taxRate}
            onChange={(e) => onUpdateTaxRate(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {(
          [
            {
              key: 'military',
              label: 'Askeri Harcamalar (Ordu Taarruz Gücü)',
              color: 'text-rose-400',
            },
            {
              key: 'economy',
              label: 'Sanayi Teşvikleri (Üretim Çıktısı)',
              color: 'text-emerald-400',
            },
            {
              key: 'research',
              label: 'Bilim & Teknoloji Fonu (Araştırma Hızı)',
              color: 'text-sky-400',
            },
            {
              key: 'welfare',
              label: 'Sosyal Refah (İstikrar & İsyan Önleme)',
              color: 'text-purple-400',
            },
          ] as const
        ).map((item) => (
          <div key={item.key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">{item.label}</span>
              <span className={`font-mono-num font-bold ${item.color}`}>
                %{playerNation.budget[item.key]}
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              value={playerNation.budget[item.key]}
              onChange={(e) => onUpdateBudget(item.key, Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        ))}
      </div>

      {/* Stage 3: Strategic Straits, Blockades & Trade Corridors Command Center (Full 12 cols) */}
      <div className="lg:col-span-12 bg-slate-950/85 border border-amber-500/35 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Anchor className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Stratejik Boğaz Hakimiyeti, Deniz Ablukası ve Ticaret Koridorları
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Boğaz kıyılarını tutan devlet gümrük geliri toplar ve savaşta düşman ordularının deniz geçişini ve ticaretini ablukaya alır. Harita üstünden <strong>Ekonomi</strong> modunu açarak kervan akışını canlı izleyebilirsiniz.
            </p>
          </div>

          {onRaidEnemyTradeRoutes && (
            <button
              disabled={!canRaidTrade}
              onClick={onRaidEnemyTradeRoutes}
              className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center shrink-0 border transition-colors ${
                canRaidTrade
                  ? 'bg-rose-600/25 hover:bg-rose-600/40 border-rose-500/60 text-rose-100 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-rose-400" />
                <span>
                  {is1440
                    ? '🏴‍☠️ Düşman Kervanlarına Akın Düzenle'
                    : '🏴‍☠️ Düşman Ticaret Konvoyunu Vur'}
                </span>
              </span>
              <span className="text-[10px] font-mono-num opacity-85">
                {isPlayerInWar
                  ? `${TRADE_RAID_INFLUENCE_COST} ⚜ Nüfuz · ${TRADE_RAID_MANPOWER_COST} Asker → +180..680G Ganimet`
                  : 'Sadece aktif savaş sırasında kullanılabilir'}
              </span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* World Strategic Straits Radar */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>⚓ Dünya Boğazları ve Gümrük Kontrolü</span>
              <span className="font-mono-num text-amber-300">
                Hakimiyetiniz: {tradeDetails.controlledStraits.length} Boğaz
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {allWorldStraits.map((st) => {
                const myShare = st.ownerTollShares[playerNation.id] || 0;
                const domNation = st.dominantOwnerId
                  ? nations[st.dominantOwnerId]
                  : null;
                const firstShoreId = st.activeShoreIds[0];

                return (
                  <div
                    key={st.def.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 text-xs ${
                      myShare > 0
                        ? 'bg-amber-950/25 border-amber-500/50'
                        : st.isContestedByWar
                        ? 'bg-rose-950/25 border-rose-500/40'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white truncate">
                        ⚓ {st.def.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        Hakim:{' '}
                        <strong className="text-slate-200">
                          {domNation
                            ? domNation.name.replace(/\s*\(1440\)\s*$/, '')
                            : 'Paylaşımlı'}
                        </strong>
                        {myShare > 0 && st.hasFullMonopoly && (
                          <span className="text-emerald-400 font-semibold">
                            {' '}
                            · Tam Hakimiyet
                          </span>
                        )}
                        {st.isContestedByWar && (
                          <span className="text-rose-400 font-semibold">
                            {' '}
                            · Ablukada
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono-num mt-0.5 flex items-center gap-2">
                        <span className="text-amber-300">
                          Gümrük: +{st.totalDailyToll}G/gün
                        </span>
                        {myShare > 0 && (
                          <span className="text-emerald-400 font-bold">
                            (Payınız: +{myShare}G)
                          </span>
                        )}
                      </div>
                    </div>

                    {firstShoreId && (
                      <button
                        onClick={() => onSelectTerritory(firstShoreId)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 shrink-0"
                      >
                        Kıyıya Git
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Trade Caravans & Maritime Corridors */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  {is1440
                    ? 'Aktif Kervan ve Deniz Ticaret Hatlarınız'
                    : 'Aktif Küresel Ticaret ve Enerji Hatlarınız'}
                </span>
              </span>
              <span className="font-mono-num text-sky-300">
                +{playerEconomy.caravanTradeIncome} Altın/gün
              </span>
            </div>

            {tradeDetails.activeCorridors.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                Henüz büyük küresel kervan/deniz kavşaklarından birine sahip değilsiniz. Önemli liman veya boğaz şehirlerini fethederek küresel ticaret ağından pay alabilirsiniz.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {tradeDetails.activeCorridors.map((corr) => (
                  <div
                    key={corr.corridorId}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                      corr.isBlockadedByEnemy
                        ? 'bg-rose-950/25 border-rose-500/50'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">
                        {corr.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>
                          Kavşak Kontrolü:{' '}
                          <strong className="font-mono-num text-slate-200">
                            {corr.ownedHubCount}/{corr.totalHubCount}
                          </strong>
                        </span>
                        {corr.isBlockadedByEnemy ? (
                          <span className="text-rose-300 font-semibold">
                            ⚠️ Düşman Boğaz Ablukası Altında!
                          </span>
                        ) : (
                          <span className="text-emerald-400">
                            ✓ Açık Güzergâh
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="font-mono-num font-bold text-sky-300 shrink-0">
                      +{corr.dailyIncome}G/gün
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
