import React from 'react';
import { BuildingType, GameModeId, TerrainType } from '../../types/game';

/**
 * AoH3-Style Illustrated Terrain Panorama Banner
 * Displays a rich hand-crafted vector landscape scene for OVA, DAGLIK, ORMAN, COL, METROPOL
 * with fortified walls, sun/sky, and settlement silhouettes.
 */
export const TerrainPanoramaSvg: React.FC<{
  terrain: TerrainType;
  fortLevel?: number;
  isCapital?: boolean;
  className?: string;
}> = ({ terrain, fortLevel = 1, isCapital = false, className = 'w-full h-24' }) => {
  switch (terrain) {
    case 'DAGLIK':
      return (
        <svg viewBox="0 0 320 96" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="sky-dag" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="60%" stopColor="#334155" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="mtn-front" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          <rect width="320" height="96" fill="url(#sky-dag)" />
          <circle cx="265" cy="24" r="14" fill="#fbbf24" fillOpacity="0.22" />
          <circle cx="265" cy="24" r="9" fill="#fde68a" fillOpacity="0.45" />
          {/* Distant peaks */}
          <polygon points="0,84 48,26 98,84" fill="#334155" />
          <polygon points="48,26 36,42 60,42" fill="#e2e8f0" fillOpacity="0.65" />
          <polygon points="180,84 238,18 298,84" fill="#334155" />
          <polygon points="238,18 223,38 253,38" fill="#f1f5f9" fillOpacity="0.7" />
          {/* Main peaks */}
          <polygon points="65,92 138,14 212,92" fill="url(#mtn-front)" />
          <polygon points="138,14 118,38 132,34 142,42 158,36" fill="#f8fafc" fillOpacity="0.85" />
          {/* Fortress on ridge */}
          {fortLevel > 0 && (
            <g transform="translate(122, 46)">
              <rect x="0" y="10" width="32" height="18" fill="#94a3b8" stroke="#1e293b" strokeWidth="1" />
              <rect x="-4" y="4" width="10" height="24" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1" />
              <rect x="26" y="4" width="10" height="24" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1" />
              <polygon points="-5,4 1,-3 7,4" fill="#b91c1c" />
              <polygon points="25,4 31,-3 37,4" fill="#b91c1c" />
            </g>
          )}
          {isCapital && (
            <g transform="translate(45, 56)">
              <path d="M8,20 L8,10 Q16,0 24,10 L24,20 Z" fill="#f59e0b" fillOpacity="0.85" />
              <rect x="4" y="4" width="2" height="16" fill="#fde68a" />
              <rect x="26" y="4" width="2" height="16" fill="#fde68a" />
            </g>
          )}
          <rect x="0" y="82" width="320" height="14" fill="#0f172a" />
        </svg>
      );

    case 'ORMAN':
      return (
        <svg viewBox="0 0 320 96" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="sky-orman" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#062e22" />
              <stop offset="65%" stopColor="#064e3b" />
              <stop offset="100%" stopColor="#065f46" />
            </linearGradient>
          </defs>
          <rect width="320" height="96" fill="url(#sky-orman)" />
          <circle cx="270" cy="22" r="12" fill="#fde68a" fillOpacity="0.3" />
          {/* Rolling hills */}
          <path d="M0,74 Q80,45 170,68 T320,62 L320,96 L0,96 Z" fill="#047857" fillOpacity="0.55" />
          <path d="M0,82 Q120,58 240,78 T320,74 L320,96 L0,96 Z" fill="#065f46" />
          {/* Pine & broad trees */}
          {[22, 46, 72, 104, 196, 224, 252, 284].map((x, idx) => (
            <g key={x} transform={`translate(${x}, ${42 + (idx % 2) * 6})`}>
              <rect x="7" y="24" width="4" height="10" fill="#451a03" />
              <polygon points="9,0 0,16 18,16" fill="#10b981" />
              <polygon points="9,8 -2,26 20,26" fill="#059669" />
            </g>
          ))}
          {/* Timber watchtower / keep */}
          {fortLevel > 0 && (
            <g transform="translate(142, 42)">
              <rect x="4" y="14" width="28" height="22" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
              <polygon points="0,14 18,2 36,14" fill="#b45309" />
              <rect x="14" y="22" width="8" height="14" fill="#292524" />
            </g>
          )}
          <rect x="0" y="84" width="320" height="12" fill="#052e16" />
        </svg>
      );

    case 'COL':
      return (
        <svg viewBox="0 0 320 96" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="sky-col" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="55%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <rect width="320" height="96" fill="url(#sky-col)" />
          <circle cx="250" cy="28" r="18" fill="#fde047" fillOpacity="0.35" />
          <circle cx="250" cy="28" r="11" fill="#fef08a" fillOpacity="0.7" />
          {/* Sand dunes */}
          <path d="M0,72 Q90,46 185,68 T320,58 L320,96 L0,96 Z" fill="#b45309" />
          <path d="M0,80 Q135,58 245,76 T320,72 L320,96 L0,96 Z" fill="#92400e" />
          {/* Desert citadel */}
          <g transform="translate(128, 44)">
            <rect x="0" y="12" width="54" height="22" fill="#fcd34d" fillOpacity="0.75" stroke="#78350f" strokeWidth="1" />
            <path d="M16,12 Q27,-2 38,12 Z" fill="#fbbf24" />
            <rect x="-6" y="6" width="10" height="28" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
            <rect x="50" y="6" width="10" height="28" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          </g>
          <rect x="0" y="84" width="320" height="12" fill="#451a03" />
        </svg>
      );

    case 'METROPOL':
      return (
        <svg viewBox="0 0 320 96" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="sky-metro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="60%" stopColor="#311042" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>
          <rect width="320" height="96" fill="url(#sky-metro)" />
          <circle cx="64" cy="24" r="14" fill="#fbbf24" fillOpacity="0.3" />
          {/* Grand Imperial Skyline / Domes & Minarets */}
          <path d="M0,80 L320,80 L320,96 L0,96 Z" fill="#0f172a" />
          {/* Grand Mosque / Cathedral Dome */}
          <g transform="translate(115, 26)">
            <path d="M18,36 Q45,4 72,36 Z" fill="#f59e0b" stroke="#fde68a" strokeWidth="1" />
            <rect x="14" y="36" width="62" height="22" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            {/* Minarets / Towers */}
            <rect x="4" y="8" width="5" height="50" fill="#e2e8f0" />
            <polygon points="3,8 6.5,0 10,8" fill="#f59e0b" />
            <rect x="81" y="8" width="5" height="50" fill="#e2e8f0" />
            <polygon points="80,8 83.5,0 87,8" fill="#f59e0b" />
          </g>
          {/* City Walls */}
          <g transform="translate(0, 66)">
            <rect x="0" y="6" width="320" height="14" fill="#64748b" />
            {[10, 34, 58, 82, 106, 206, 230, 254, 278, 302].map((bx) => (
              <rect key={bx} x={bx} y="1" width="12" height="6" fill="#94a3b8" />
            ))}
          </g>
        </svg>
      );

    case 'OVA':
    default:
      return (
        <svg viewBox="0 0 320 96" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="sky-ova" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f2942" />
              <stop offset="55%" stopColor="#1e3a5f" />
              <stop offset="100%" stopColor="#065f46" />
            </linearGradient>
          </defs>
          <rect width="320" height="96" fill="url(#sky-ova)" />
          <circle cx="262" cy="24" r="14" fill="#fde68a" fillOpacity="0.35" />
          {/* Fertile rolling plains & river */}
          <path d="M0,66 Q95,48 190,64 T320,58 L320,96 L0,96 Z" fill="#15803d" fillOpacity="0.65" />
          <path d="M0,76 Q140,62 250,76 T320,72 L320,96 L0,96 Z" fill="#166534" />
          {/* River */}
          <path d="M160,64 Q140,76 175,86 T145,96" fill="none" stroke="#38bdf8" strokeWidth="5" strokeOpacity="0.7" />
          {/* Castle & Village on the plain */}
          {fortLevel > 0 && (
            <g transform="translate(92, 42)">
              <rect x="0" y="10" width="36" height="18" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
              <rect x="-5" y="4" width="10" height="24" fill="#e2e8f0" stroke="#334155" strokeWidth="1" />
              <rect x="31" y="4" width="10" height="24" fill="#e2e8f0" stroke="#334155" strokeWidth="1" />
              <polygon points="-6,4 0,-3 6,4" fill="#dc2626" />
              <polygon points="30,4 36,-3 42,4" fill="#dc2626" />
            </g>
          )}
          <rect x="0" y="84" width="320" height="12" fill="#052e16" />
        </svg>
      );
  }
};

/**
 * AoH3-Style Unit Illustration Card Artwork
 * Adapts to 1440 (Yeniçeri / Sipahi / Şahi Topu) vs 2026 (Piyade / Tank / SİHA)
 */
export const UnitTypeIllustrationSvg: React.FC<{
  unitType: 'infantry' | 'armor' | 'airDrone';
  modeId?: GameModeId;
  className?: string;
}> = ({ unitType, modeId = 'EMPIRES_1440', className = 'w-12 h-12' }) => {
  const isHistorical = modeId === 'EMPIRES_1440';

  if (unitType === 'infantry') {
    return (
      <svg viewBox="0 0 64 64" className={className}>
        <rect width="64" height="64" rx="10" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="22" fill="#047857" fillOpacity="0.45" />
        {/* Crossed Swords & Shield */}
        <path d="M16,48 L46,16 M18,16 L48,48" stroke="#e2e8f0" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M14,44 L22,50 M42,50 L50,44" stroke="#fbbf24" strokeWidth="2.8" strokeLinecap="round" />
        {/* Shield in center */}
        <path
          d="M32,16 L44,21 L44,33 C44,42 32,49 32,49 C32,49 20,42 20,33 L20,21 Z"
          fill={isHistorical ? '#991b1b' : '#065f46'}
          stroke="#fbbf24"
          strokeWidth="2"
        />
        {/* Crescent or Star emblem on shield */}
        <circle cx="32" cy="31" r="5" fill="none" stroke="#fde68a" strokeWidth="2" />
      </svg>
    );
  }

  if (unitType === 'armor') {
    return (
      <svg viewBox="0 0 64 64" className={className}>
        <rect width="64" height="64" rx="10" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="22" fill="#78350f" fillOpacity="0.45" />
        {isHistorical ? (
          /* Historical Sipahi Cavalry Helmet & Lance */
          <g>
            <path d="M14,50 L50,14" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="50,14 42,16 48,22" fill="#ef4444" />
            {/* Spangenhelm / Turban Helmet */}
            <path d="M20,38 Q32,14 44,38 Z" fill="#cbd5e1" stroke="#fbbf24" strokeWidth="2" />
            <line x1="32" y1="14" x2="32" y2="42" stroke="#fbbf24" strokeWidth="2" />
            <path d="M22,38 L42,38 L40,46 L24,46 Z" fill="#94a3b8" />
          </g>
        ) : (
          /* Modern Heavy Armor Tank */
          <g>
            <rect x="12" y="34" width="40" height="12" rx="5" fill="#94a3b8" stroke="#fbbf24" strokeWidth="1.5" />
            <rect x="20" y="24" width="20" height="10" rx="3" fill="#cbd5e1" stroke="#fbbf24" strokeWidth="1.5" />
            <line x1="40" y1="28" x2="54" y2="28" stroke="#fde68a" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
    );
  }

  // airDrone / Siege Cannon
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <rect width="64" height="64" rx="10" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="22" fill="#312e81" fillOpacity="0.45" />
      {isHistorical ? (
        /* Historical Imperial Bombard / Şahi Cannon */
        <g>
          <path d="M16,38 L46,20 L50,27 L22,45 Z" fill="#d97706" stroke="#fde68a" strokeWidth="1.8" />
          <circle cx="24" cy="44" r="8" fill="#78350f" stroke="#fbbf24" strokeWidth="2" />
          <circle cx="24" cy="44" r="2.5" fill="#fde68a" />
          <circle cx="51" cy="18" r="3.5" fill="#ef4444" />
        </g>
      ) : (
        /* Modern Jet / UCAV */
        <g>
          <polygon points="32,12 48,44 32,38 16,44" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
};

/**
 * AoH3-Style Architectural Building Illustration
 */
export const BuildingIllustrationSvg: React.FC<{
  buildingKey: BuildingType;
  className?: string;
}> = ({ buildingKey, className = 'w-11 h-11' }) => {
  switch (buildingKey) {
    case 'factory':
      return (
        <svg viewBox="0 0 56 56" className={className}>
          <rect width="56" height="56" rx="10" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" />
          <rect x="10" y="28" width="36" height="18" fill="#b45309" stroke="#fde68a" strokeWidth="1" />
          <polygon points="10,28 19,20 28,28 37,20 46,28" fill="#d97706" />
          <rect x="36" y="12" width="6" height="16" fill="#78350f" stroke="#fde68a" strokeWidth="1" />
          <circle cx="22" cy="37" r="5" fill="#fde68a" fillOpacity="0.85" />
        </svg>
      );
    case 'barracks':
      return (
        <svg viewBox="0 0 56 56" className={className}>
          <rect width="56" height="56" rx="10" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
          <polygon points="28,12 46,30 10,30" fill="#dc2626" stroke="#fca5a5" strokeWidth="1.2" />
          <rect x="14" y="30" width="28" height="16" fill="#991b1b" stroke="#fca5a5" strokeWidth="1" />
          <polygon points="28,30 22,46 34,46" fill="#450a0a" />
          <line x1="28" y1="6" x2="28" y2="12" stroke="#fde68a" strokeWidth="2" />
        </svg>
      );
    case 'fortress':
      return (
        <svg viewBox="0 0 56 56" className={className}>
          <rect width="56" height="56" rx="10" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="14" y="22" width="28" height="24" fill="#64748b" stroke="#e2e8f0" strokeWidth="1.2" />
          <rect x="10" y="14" width="10" height="32" fill="#94a3b8" stroke="#e2e8f0" strokeWidth="1" />
          <rect x="36" y="14" width="10" height="32" fill="#94a3b8" stroke="#e2e8f0" strokeWidth="1" />
          <path d="M24,46 L24,34 Q28,30 32,34 L32,46 Z" fill="#0f172a" />
        </svg>
      );
    case 'university':
      return (
        <svg viewBox="0 0 56 56" className={className}>
          <rect width="56" height="56" rx="10" fill="#172554" stroke="#60a5fa" strokeWidth="1.5" />
          <path d="M16,28 Q28,10 40,28 Z" fill="#3b82f6" stroke="#bfdbfe" strokeWidth="1.2" />
          <rect x="14" y="28" width="28" height="16" fill="#1e40af" stroke="#bfdbfe" strokeWidth="1" />
          <line x1="20" y1="28" x2="20" y2="44" stroke="#bfdbfe" strokeWidth="2" />
          <line x1="28" y1="28" x2="28" y2="44" stroke="#bfdbfe" strokeWidth="2" />
          <line x1="36" y1="28" x2="36" y2="44" stroke="#bfdbfe" strokeWidth="2" />
        </svg>
      );
    case 'tradeHub':
      return (
        <svg viewBox="0 0 56 56" className={className}>
          <rect width="56" height="56" rx="10" fill="#422006" stroke="#eab308" strokeWidth="1.5" />
          <path d="M10,26 L28,14 L46,26 Z" fill="#eab308" stroke="#fef08a" strokeWidth="1.2" />
          <rect x="14" y="26" width="28" height="18" fill="#a16207" stroke="#fef08a" strokeWidth="1" />
          <circle cx="28" cy="35" r="5" fill="#fde047" />
        </svg>
      );
    case 'supplyDepot':
    default:
      return (
        <svg viewBox="0 0 56 56" className={className}>
          <rect width="56" height="56" rx="10" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" />
          <rect x="12" y="22" width="32" height="22" rx="3" fill="#047857" stroke="#a7f3d0" strokeWidth="1.2" />
          <line x1="12" y1="32" x2="44" y2="32" stroke="#a7f3d0" strokeWidth="1.5" />
          <line x1="28" y1="22" x2="28" y2="44" stroke="#a7f3d0" strokeWidth="1.5" />
        </svg>
      );
  }
};

/**
 * AoH3-Style Illustrated Commander / Pasha / Clan Lord Crest Portrait
 */
export const CommanderPortraitSvg: React.FC<{
  specialty: 'OFFENSE' | 'DEFENSE' | 'LOGISTICS' | 'ARMOR';
  loyalty?: number;
  className?: string;
}> = ({ specialty, loyalty = 85, className = 'w-11 h-11' }) => {
  const bgMap = {
    OFFENSE: { fill: '#450a0a', stroke: '#f87171', helm: '#fbbf24' },
    DEFENSE: { fill: '#1e293b', stroke: '#94a3b8', helm: '#e2e8f0' },
    LOGISTICS: { fill: '#064e3b', stroke: '#34d399', helm: '#fde68a' },
    ARMOR: { fill: '#451a03', stroke: '#fbbf24', helm: '#f59e0b' },
  };
  const theme = bgMap[specialty] || bgMap.OFFENSE;

  return (
    <svg viewBox="0 0 56 56" className={className}>
      <rect width="56" height="56" rx="12" fill={theme.fill} stroke={theme.stroke} strokeWidth="1.8" />
      {/* Imperial Cloak / Shoulders */}
      <path d="M10,52 Q28,36 46,52 Z" fill={theme.stroke} fillOpacity="0.45" />
      {/* Helmet / Turban Silhouette */}
      <path d="M18,26 Q28,10 38,26 Z" fill={theme.helm} />
      <circle cx="28" cy="14" r="2.5" fill="#ef4444" />
      {/* Face Visor */}
      <rect x="21" y="25" width="14" height="11" rx="4" fill="#cbd5e1" />
      <line x1="28" y1="24" x2="28" y2="36" stroke="#475569" strokeWidth="1.8" />
      {/* Loyalty Indicator Gem */}
      <circle
        cx="46"
        cy="10"
        r="4.5"
        fill={loyalty < 45 ? '#ef4444' : loyalty < 70 ? '#f59e0b' : '#10b981'}
        stroke="#0f172a"
        strokeWidth="1.2"
      />
    </svg>
  );
};
