import React, { useEffect, useRef } from 'react';

function drawFivePointStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  color: string
) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawCrescentAndStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  fgColor: string,
  bgColor: string
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx - r * 0.12, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = fgColor;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx + r * 0.16, cy, r * 0.78, 0, Math.PI * 2);
  ctx.fillStyle = bgColor;
  ctx.fill();

  drawFivePointStar(
    ctx,
    cx + r * 0.62,
    cy,
    r * 0.42,
    r * 0.18,
    fgColor
  );
  ctx.restore();
}

/**
 * Draws an authentic graphical flag for any nation or 1440 historical empire on a 2D Canvas.
 */
export function drawNationFlagOnCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  nationId: string,
  flagCode: string,
  baseColor: string
): void {
  const code = (flagCode || '').toUpperCase();
  const baseId = (nationId || '').split('_')[0];

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const cx = x + w / 2;
  const cy = y + h / 2;
  const minDim = Math.min(w, h);

  // 1. OSMANLI DEVLETİ / TÜRKİYE (792, OSM, TR)
  if (baseId === '792' || code === 'OSM' || code === 'TR') {
    const bg = '#C8102E';
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);

    if (code === 'OSM') {
      // Top & bottom imperial gold borders for 1440 Ottoman Sancak
      ctx.fillStyle = '#FBBF24';
      ctx.fillRect(x, y, w, Math.max(1.2, h * 0.11));
      ctx.fillRect(x, y + h - Math.max(1.2, h * 0.11), w, Math.max(1.2, h * 0.11));
    }
    drawCrescentAndStar(ctx, cx - w * 0.04, cy, minDim * 0.31, '#FFFFFF', bg);
  }
  // 2. BİZANS / YUNANİSTAN (300, BİZ, GR)
  else if (code === 'BİZ') {
    ctx.fillStyle = '#7E22CE';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(cx - w * 0.08, y, w * 0.16, h);
    ctx.fillRect(x, cy - h * 0.1, w, h * 0.2);
    // 4 golden corner B rings
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = Math.max(1, minDim * 0.08);
    const dx = w * 0.26;
    const dy = h * 0.26;
    [
      [cx - dx, cy - dy],
      [cx + dx, cy - dy],
      [cx - dx, cy + dy],
      [cx + dx, cy + dy],
    ].forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, minDim * 0.11, 0, Math.PI * 2);
      ctx.stroke();
    });
  } else if (baseId === '300' || code === 'GR') {
    ctx.fillStyle = '#0D5EAF';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y + h * 0.22, w, h * 0.14);
    ctx.fillRect(x, y + h * 0.5, w, h * 0.14);
    ctx.fillRect(x, y + h * 0.78, w, h * 0.14);
    ctx.fillStyle = '#0D5EAF';
    ctx.fillRect(x, y, w * 0.45, h * 0.55);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + w * 0.18, y, w * 0.09, h * 0.55);
    ctx.fillRect(x, y + h * 0.22, w * 0.45, h * 0.12);
  }
  // 3. AZERBAYCAN / KARAKOYUNLU & AKKOYUNLU (031, AZ, AKK)
  else if (baseId === '031' || code === 'AZ' || code === 'AKK') {
    if (code === 'AKK') {
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(x, y, w, h);
      drawCrescentAndStar(ctx, cx, cy, minDim * 0.3, '#FDE047', '#0284C7');
    } else {
      ctx.fillStyle = '#00B5E2';
      ctx.fillRect(x, y, w, h / 3);
      ctx.fillStyle = '#EF3340';
      ctx.fillRect(x, y + h / 3, w, h / 3);
      ctx.fillStyle = '#509E2F';
      ctx.fillRect(x, y + (2 * h) / 3, w, h / 3);
      drawCrescentAndStar(ctx, cx, cy, minDim * 0.22, '#FFFFFF', '#EF3340');
    }
  }
  // 4. MEMLÜK SULTANLIĞI / MISIR (818, MEM, EG)
  else if (code === 'MEM') {
    ctx.fillStyle = '#D97706';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(x, y + h * 0.18, w, h * 0.12);
    drawCrescentAndStar(ctx, cx, cy + h * 0.06, minDim * 0.28, '#FFFFFF', '#D97706');
  } else if (baseId === '818' || code === 'EG' || baseId === '368' || baseId === '760') {
    ctx.fillStyle = '#CE1126';
    ctx.fillRect(x, y, w, h / 3);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y + h / 3, w, h / 3);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y + (2 * h) / 3, w, h / 3);
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.arc(cx, cy, minDim * 0.13, 0, Math.PI * 2);
    ctx.fill();
  }
  // 5. TİMUR İMPARATORLUĞU / İRAN (364, TİM, IR)
  else if (code === 'TİM') {
    ctx.fillStyle = '#0F766E';
    ctx.fillRect(x, y, w, h);
    // 3 Golden Timurid Çintemani circles
    ctx.fillStyle = '#FACC15';
    const r = minDim * 0.13;
    [
      [cx, cy - h * 0.18],
      [cx - w * 0.16, cy + h * 0.16],
      [cx + w * 0.16, cy + h * 0.16],
    ].forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (baseId === '364' || code === 'IR') {
    ctx.fillStyle = '#239F40';
    ctx.fillRect(x, y, w, h / 3);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y + h / 3, w, h / 3);
    ctx.fillStyle = '#DA0000';
    ctx.fillRect(x, y + (2 * h) / 3, w, h / 3);
    ctx.fillStyle = '#DA0000';
    ctx.beginPath();
    ctx.arc(cx, cy, minDim * 0.13, 0, Math.PI * 2);
    ctx.fill();
  }
  // 6. ALTIN ORDA / RUSYA (643, ORD, RU)
  else if (code === 'ORD') {
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(x, y, w, h);
    drawCrescentAndStar(ctx, cx, cy, minDim * 0.29, '#FACC15', '#B91C1C');
  } else if (baseId === '643' || code === 'RU') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, w, h / 3);
    ctx.fillStyle = '#0039A6';
    ctx.fillRect(x, y + h / 3, w, h / 3);
    ctx.fillStyle = '#D52B1E';
    ctx.fillRect(x, y + (2 * h) / 3, w, h / 3);
  }
  // 7. KUTSAL ROMA / ALMANYA (276, KRI, DE)
  else if (code === 'KRI') {
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x, y, w, h);
    // Black Imperial Eagle silhouette
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(cx, cy, minDim * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - w * 0.28, cy - h * 0.08, w * 0.56, h * 0.16);
  } else if (baseId === '276' || code === 'DE') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, w, h / 3);
    ctx.fillStyle = '#DD0000';
    ctx.fillRect(x, y + h / 3, w, h / 3);
    ctx.fillStyle = '#FFCE00';
    ctx.fillRect(x, y + (2 * h) / 3, w, h / 3);
  }
  // 8. MACARİSTAN / BULGARİSTAN (348, MAC, HU, 100, BG)
  else if (baseId === '348' || code === 'MAC' || code === 'HU') {
    ctx.fillStyle = '#CD2A3E';
    ctx.fillRect(x, y, w, h / 3);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y + h / 3, w, h / 3);
    ctx.fillStyle = '#436F4D';
    ctx.fillRect(x, y + (2 * h) / 3, w, h / 3);
    if (code === 'MAC') {
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(cx - 1, y + h * 0.22, 2, h * 0.56);
    }
  } else if (baseId === '100' || code === 'BG') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, w, h / 3);
    ctx.fillStyle = '#00966E';
    ctx.fillRect(x, y + h / 3, w, h / 3);
    ctx.fillStyle = '#D62612';
    ctx.fillRect(x, y + (2 * h) / 3, w, h / 3);
  }
  // 9. FRANSA (250, FRA, FR)
  else if (code === 'FRA') {
    ctx.fillStyle = '#1D4ED8';
    ctx.fillRect(x, y, w, h);
    // Golden royal lilies
    drawFivePointStar(ctx, cx - w * 0.2, cy - h * 0.14, minDim * 0.16, minDim * 0.07, '#FACC15');
    drawFivePointStar(ctx, cx + w * 0.2, cy - h * 0.14, minDim * 0.16, minDim * 0.07, '#FACC15');
    drawFivePointStar(ctx, cx, cy + h * 0.18, minDim * 0.16, minDim * 0.07, '#FACC15');
  } else if (baseId === '250' || code === 'FR') {
    ctx.fillStyle = '#002654';
    ctx.fillRect(x, y, w / 3, h);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + w / 3, y, w / 3, h);
    ctx.fillStyle = '#ED2939';
    ctx.fillRect(x + (2 * w) / 3, y, w / 3, h);
  }
  // 10. VENEDİK / İTALYA (380, VEN, IT)
  else if (code === 'VEN') {
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = Math.max(1, minDim * 0.1);
    ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(cx - w * 0.18, cy - h * 0.14, w * 0.36, h * 0.28);
  } else if (baseId === '380' || code === 'IT') {
    ctx.fillStyle = '#009246';
    ctx.fillRect(x, y, w / 3, h);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + w / 3, y, w / 3, h);
    ctx.fillStyle = '#CE2B37';
    ctx.fillRect(x + (2 * w) / 3, y, w / 3, h);
  }
  // 11. İNGİLTERE / BİRLEŞİK KRALLIK (826, İNG, GB)
  else if (baseId === '826' || code === 'İNG' || code === 'GB') {
    if (code === 'İNG') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y, w, h);
    } else {
      ctx.fillStyle = '#012169';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.max(1.5, minDim * 0.16);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + h);
      ctx.moveTo(x + w, y);
      ctx.lineTo(x, y + h);
      ctx.stroke();
    }
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cx - w * 0.13, y, w * 0.26, h);
    ctx.fillRect(x, cy - h * 0.16, w, h * 0.32);
    ctx.fillStyle = '#C8102E';
    ctx.fillRect(cx - w * 0.08, y, w * 0.16, h);
    ctx.fillRect(x, cy - h * 0.1, w, h * 0.2);
  }
  // 12. İSPANYA / KASTİLYA (724, KAS, ES)
  else if (baseId === '724' || code === 'KAS' || code === 'ES') {
    ctx.fillStyle = '#AA151B';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#F1BF00';
    ctx.fillRect(x, y + h * 0.25, w, h * 0.5);
    ctx.fillStyle = '#AA151B';
    ctx.fillRect(x + w * 0.22, cy - h * 0.12, w * 0.14, h * 0.24);
  }
  // 13. LEHİSTAN-LİTVANYA / POLONYA (616, LEH, PL)
  else if (baseId === '616' || code === 'LEH' || code === 'PL') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, w, h / 2);
    ctx.fillStyle = '#DC143C';
    ctx.fillRect(x, y + h / 2, w, h / 2);
    if (code === 'LEH') {
      ctx.fillStyle = '#DC143C';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx, cy, minDim * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // 14. UKRAYNA (804, UA)
  else if (baseId === '804' || code === 'UA') {
    ctx.fillStyle = '#0057B7';
    ctx.fillRect(x, y, w, h / 2);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x, y + h / 2, w, h / 2);
  }
  // 15. İSKANDİNAVYA / KALMAR BİRLİĞİ (752, 578, 208, 246, KAL, SE, NO)
  else if (
    baseId === '752' ||
    baseId === '578' ||
    baseId === '208' ||
    baseId === '246' ||
    code === 'KAL' ||
    code === 'SE' ||
    code === 'NO'
  ) {
    const bg =
      code === 'KAL'
        ? '#FACC15'
        : baseId === '578' || code === 'NO' || baseId === '208'
        ? '#BA0C2F'
        : baseId === '246'
        ? '#FFFFFF'
        : '#006AA7';
    const cross =
      code === 'KAL'
        ? '#DC2626'
        : baseId === '578' || code === 'NO' || baseId === '246'
        ? '#00205B'
        : baseId === '208'
        ? '#FFFFFF'
        : '#FECC02';
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = cross;
    ctx.fillRect(x + w * 0.28, y, w * 0.14, h);
    ctx.fillRect(x, cy - h * 0.1, w, h * 0.2);
  }
  // 16. ABD (840, US)
  else if (baseId === '840' || code === 'US') {
    ctx.fillStyle = '#B22234';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#FFFFFF';
    for (let i = 1; i < 6; i += 2) {
      ctx.fillRect(x, y + (i * h) / 6, w, h / 6);
    }
    ctx.fillStyle = '#3C3B6E';
    ctx.fillRect(x, y, w * 0.48, h * 0.55);
    drawFivePointStar(ctx, x + w * 0.24, y + h * 0.27, minDim * 0.16, minDim * 0.07, '#FFFFFF');
  }
  // 17. ÇİN / MİNG HANEDANI (156, MİN, CN)
  else if (baseId === '156' || code === 'MİN' || code === 'CN') {
    ctx.fillStyle = '#DE2910';
    ctx.fillRect(x, y, w, h);
    if (code === 'MİN') {
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(cx, cy, minDim * 0.25, 0, Math.PI * 2);
      ctx.fill();
    } else {
      drawFivePointStar(ctx, x + w * 0.28, y + h * 0.34, minDim * 0.22, minDim * 0.09, '#FFDE00');
    }
  }
  // 18. JAPONYA / ŞOGUNLUK (392, ŞOG, JP)
  else if (baseId === '392' || code === 'ŞOG' || code === 'JP') {
    ctx.fillStyle = code === 'ŞOG' ? '#FEF3C7' : '#FFFFFF';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#BC002D';
    ctx.beginPath();
    ctx.arc(cx, cy, minDim * 0.27, 0, Math.PI * 2);
    ctx.fill();
  }
  // 19. HİNDİSTAN / DELHİ SULTANLIĞI (356, DEL, IN)
  else if (baseId === '356' || code === 'DEL' || code === 'IN') {
    if (code === 'DEL') {
      ctx.fillStyle = '#047857';
      ctx.fillRect(x, y, w, h);
      drawCrescentAndStar(ctx, cx, cy, minDim * 0.28, '#FACC15', '#047857');
    } else {
      ctx.fillStyle = '#FF9933';
      ctx.fillRect(x, y, w, h / 3);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y + h / 3, w, h / 3);
      ctx.fillStyle = '#138808';
      ctx.fillRect(x, y + (2 * h) / 3, w, h / 3);
      ctx.fillStyle = '#000080';
      ctx.beginPath();
      ctx.arc(cx, cy, minDim * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // 20. İSLAM HANLIKLARI & SULTANLIKLARI (682, 586, 012, 504, 788, 434, SA, PK, MAĞ)
  else if (
    baseId === '682' ||
    baseId === '586' ||
    baseId === '012' ||
    baseId === '504' ||
    baseId === '788' ||
    baseId === '434' ||
    code === 'SA' ||
    code === 'PK' ||
    code === 'MAĞ'
  ) {
    const bg = baseId === '504' || baseId === '788' ? '#C1272D' : '#006C35';
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
    drawCrescentAndStar(ctx, cx, cy, minDim * 0.28, '#FFFFFF', bg);
  }
  // 21. BREZİLYA (076, BR, İNK)
  else if (baseId === '076' || code === 'BR' || code === 'İNK') {
    if (code === 'İNK') {
      ctx.fillStyle = '#7C3AED';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(cx, cy, minDim * 0.27, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#009739';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#FEDD00';
      ctx.beginPath();
      ctx.moveTo(cx, y + h * 0.12);
      ctx.lineTo(x + w * 0.88, cy);
      ctx.lineTo(cx, y + h * 0.88);
      ctx.lineTo(x + w * 0.12, cy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#012169';
      ctx.beginPath();
      ctx.arc(cx, cy, minDim * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // 22. UNIVERSAL HERALDIC FLAG GENERATOR FOR ALL REMAINING COUNTRIES
  else {
    const hash =
      (code.charCodeAt(0) || 65) * 17 + (code.charCodeAt(1) || 70) * 31;
    const style = hash % 4;
    ctx.fillStyle = baseColor || '#3B82F6';
    ctx.fillRect(x, y, w, h);

    if (style === 0) {
      // Horizontal tricolor with white center band
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y + h * 0.33, w, h * 0.34);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(x, y + h * 0.67, w, h * 0.33);
    } else if (style === 1) {
      // Vertical bicolor + golden star
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(x, y, w * 0.38, h);
      drawFivePointStar(ctx, x + w * 0.68, cy, minDim * 0.22, minDim * 0.09, '#FACC15');
    } else if (style === 2) {
      // Heraldic cross banner
      ctx.fillStyle = '#FDE047';
      ctx.fillRect(cx - w * 0.09, y, w * 0.18, h);
      ctx.fillRect(x, cy - h * 0.11, w, h * 0.22);
    } else {
      // Diagonal sash + central shield disc
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.max(1.5, minDim * 0.18);
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w, y);
      ctx.stroke();
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(cx, cy, minDim * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Subtle fabric sheen & border frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x + 0.4, y + 0.4, w - 0.8, h - 0.8);
  ctx.restore();
}

/**
 * Draws an Age of History 3-style miniature soldier figure + waving national flag standard on the map!
 */
export function drawAoH3SoldierUnitOnCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  opts: {
    nationId: string;
    flagCode: string;
    nationColor: string;
    isPlayer: boolean;
    isEnemy: boolean;
    isMarching?: boolean;
    isFighting?: boolean;
    facingLeft?: boolean;
    animPhase?: number;
  }
): void {
  const {
    nationId,
    flagCode,
    nationColor,
    isPlayer,
    isEnemy,
    isMarching = false,
    isFighting = false,
    facingLeft = false,
    animPhase = 0,
  } = opts;

  const baseId = (nationId || '').split('_')[0];
  const isEasternOrOttoman =
    baseId === '792' ||
    baseId === '818' ||
    baseId === '364' ||
    baseId === '031' ||
    baseId === '682' ||
    baseId === '643' ||
    flagCode === 'OSM' ||
    flagCode === 'MEM' ||
    flagCode === 'TİM';

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // 1. Tactical Ground Pedestal & Shadow
  ctx.beginPath();
  ctx.ellipse(0, 1.5, 9.5, 3.6, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(2, 6, 23, 0.72)';
  ctx.fill();
  ctx.lineWidth = 1.1;
  ctx.strokeStyle = isPlayer
    ? '#34D399'
    : isEnemy
    ? '#FB7185'
    : '#FBBF24';
  ctx.stroke();

  // 2. Tall Vertical Sancak / Flagpole + Graphical Nation Flag Waving Above Soldier!
  const poleX = facingLeft ? 6.5 : -6.5;
  ctx.strokeStyle = '#FDE047';
  ctx.lineWidth = 1.35;
  ctx.beginPath();
  ctx.moveTo(poleX, 1);
  ctx.lineTo(poleX, -21.5);
  ctx.stroke();

  // Golden Finial (Alem) at top of flagpole
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(poleX, -22.5, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Graphical Waving Flag attached to pole
  const flagW = 13.5;
  const flagH = 8.8;
  const flagX = facingLeft ? poleX - flagW - 0.5 : poleX + 0.8;
  const flagY = -21.2 + (isMarching || isFighting ? Math.sin(animPhase * Math.PI * 2) * 0.7 : 0);
  drawNationFlagOnCanvas(
    ctx,
    flagX,
    flagY,
    flagW,
    flagH,
    nationId,
    flagCode,
    nationColor
  );

  // 3. Soldier Miniature Figure (Flipped horizontally if facingLeft)
  ctx.save();
  if (facingLeft) {
    ctx.scale(-1, 1);
  }

  const stride = isMarching ? Math.sin(animPhase * Math.PI * 2) * 2.2 : 0;

  // Boots / Legs
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-1.8, -3.5);
  ctx.lineTo(-2.3 - stride, 1);
  ctx.moveTo(1.8, -3.5);
  ctx.lineTo(2.3 + stride, 1);
  ctx.stroke();

  // Armored Tunic / Kaftan Body in Nation Color
  ctx.fillStyle = nationColor || '#E11D48';
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.roundRect(-4.2, -11.5, 8.4, 8.2, 2.2);
  ctx.fill();
  ctx.stroke();

  // Golden Sash / Cuirass Chest Belt
  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-3.5, -10.5);
  ctx.lineTo(3.5, -5.0);
  ctx.stroke();

  // Head & Face
  ctx.fillStyle = '#FDE68A';
  ctx.beginPath();
  ctx.arc(0, -14.2, 2.9, 0, Math.PI * 2);
  ctx.fill();

  // Historical Helmet / Yeniçeri Bork / Knight Plume
  if (isEasternOrOttoman) {
    // Janissary White-Gold Bork or Spiked Turban Helmet
    ctx.fillStyle = baseId === '792' ? '#F8FAFC' : '#FBBF24';
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(-3.1, -15.2);
    ctx.lineTo(-2.2, -20.2);
    ctx.lineTo(2.6, -18.8);
    ctx.lineTo(3.1, -15.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Golden Spoon & Red Plume (Sorguç)
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(0, -20.5, 1.4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // European Steel Bascinet / Morion Helmet with Plume
    ctx.fillStyle = '#94A3B8';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(0, -15.2, 3.3, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = nationColor;
    ctx.beginPath();
    ctx.arc(-1, -19.2, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Round / Kite Shield on Left Arm
  ctx.fillStyle = isPlayer ? '#065F46' : isEnemy ? '#881337' : '#1E293B';
  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(-4.2, -7.8, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sword / Kilij Scimitar in Right Hand
  const swordSwing = isFighting ? Math.sin(animPhase * Math.PI * 4) * 0.45 : 0;
  ctx.save();
  ctx.translate(4.2, -8.5);
  ctx.rotate(-0.35 + swordSwing);
  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 1.65;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(3.5, -4.5, 6.2, -8.8);
  ctx.stroke();
  // Golden Hilt
  ctx.fillStyle = '#FBBF24';
  ctx.fillRect(-1.4, -1.2, 2.8, 1.6);
  ctx.restore();

  ctx.restore();
  ctx.restore();
}

/**
 * Reusable React Badge component that renders the nation's graphical flag on a crisp HTML5 Canvas.
 */
export const NationFlagCanvasBadge: React.FC<{
  nationId: string;
  flagCode: string;
  color: string;
  width?: number;
  height?: number;
  className?: string;
}> = ({
  nationId,
  flagCode,
  color,
  width = 36,
  height = 26,
  className = '',
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.scale(dpr, dpr);
    drawNationFlagOnCanvas(ctx, 0, 0, width, height, nationId, flagCode, color);
    ctx.restore();
  }, [nationId, flagCode, color, width, height]);

  return React.createElement('canvas', {
    ref,
    style: { width: `${width}px`, height: `${height}px` },
    className: `rounded-md border border-amber-400/70 shadow-sm shrink-0 ${className}`,
  });
};
