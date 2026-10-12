/**
 * Daily SVG Generator
 * Pure JavaScript module that deterministically generates a unique,
 * high-resolution SVG artwork for each day, seeded by the date string.
 *
 * Runs seamlessly in both Node.js (CLI scripts) and browser environments.
 */

export function createRng(seedStr) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export const DAILY_THEMES = [
  {
    name: 'Quantum Vault',
    bgStart: '#060B11', bgMid: '#0B1522', bgEnd: '#04070A',
    accent1: '#0F766E', accent2: '#14B8A6', glow: '#2DD4BF',
    ringColor: 'rgba(45, 212, 191, 0.25)', gridColor: 'rgba(255, 255, 255, 0.04)',
    style: 'vault',
  },
  {
    name: 'Deep Aurora',
    bgStart: '#080816', bgMid: '#120F2E', bgEnd: '#06060F',
    accent1: '#6366F1', accent2: '#A855F7', glow: '#818CF8',
    ringColor: 'rgba(168, 85, 247, 0.22)', gridColor: 'rgba(255, 255, 255, 0.04)',
    style: 'aurora',
  },
  {
    name: 'Cyber Cobalt',
    bgStart: '#040B17', bgMid: '#081A32', bgEnd: '#02060D',
    accent1: '#2563EB', accent2: '#06B6D4', glow: '#38BDF8',
    ringColor: 'rgba(56, 189, 248, 0.25)', gridColor: 'rgba(255, 255, 255, 0.04)',
    style: 'matrix',
  },
  {
    name: 'Solar Horizon',
    bgStart: '#120A05', bgMid: '#24140B', bgEnd: '#0A0603',
    accent1: '#D97706', accent2: '#F59E0B', glow: '#FBBF24',
    ringColor: 'rgba(245, 158, 11, 0.22)', gridColor: 'rgba(255, 255, 255, 0.04)',
    style: 'solar',
  },
  {
    name: 'Nordic Emerald',
    bgStart: '#040E0A', bgMid: '#081F17', bgEnd: '#020705',
    accent1: '#059669', accent2: '#10B981', glow: '#34D399',
    ringColor: 'rgba(52, 211, 153, 0.25)', gridColor: 'rgba(255, 255, 255, 0.04)',
    style: 'geodesic',
  },
  {
    name: 'Celestial Cosmos',
    bgStart: '#0A0A14', bgMid: '#14142B', bgEnd: '#06060D',
    accent1: '#8B5CF6', accent2: '#06B6D4', glow: '#C084FC',
    ringColor: 'rgba(192, 132, 252, 0.22)', gridColor: 'rgba(255, 255, 255, 0.04)',
    style: 'constellation',
  },
  {
    name: 'Titanium Waves',
    bgStart: '#0B1118', bgMid: '#162230', bgEnd: '#070C12',
    accent1: '#0EA5E9', accent2: '#38BDF8', glow: '#7DD3FC',
    ringColor: 'rgba(125, 211, 252, 0.25)', gridColor: 'rgba(255, 255, 255, 0.04)',
    style: 'kinetic',
  },
];

export function generateDailySvg(dateStr, options = {}) {
  const safeDate = String(dateStr || new Date().toISOString().slice(0, 10)).trim();
  const rng = createRng(safeDate);
  const width = options.width || 1440;
  const height = options.height || 900;

  let dateSum = 0;
  for (let i = 0; i < safeDate.length; i++) {
    dateSum = (dateSum * 31 + safeDate.charCodeAt(i)) >>> 0;
  }
  const themeIndex = dateSum % DAILY_THEMES.length;
  const theme = DAILY_THEMES[themeIndex];
  const uid = `day_${safeDate.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const cx = width / 2;
  const cy = height / 2;
  const hashHex = (dateSum >>> 0).toString(16).toUpperCase().padStart(8, '0');

  // ─── SHARED: 3–5 Ambient Light Orbs with Opacity Breathing ──────────
  const orbCount = 3 + Math.floor(rng() * 3);
  let orbsSvg = '';
  for (let i = 0; i < orbCount; i++) {
    const ox = width * (0.15 + rng() * 0.7);
    const oy = height * (0.2 + rng() * 0.6);
    const r = 180 + rng() * 220;
    const orbColor = i % 2 === 0 ? theme.accent1 : theme.accent2;
    const baseOp = 0.12 + rng() * 0.18;
    const minOp = (baseOp * 0.7).toFixed(3);
    const maxOp = (baseOp * 1.3).toFixed(3);
    const dur = (6 + rng() * 6).toFixed(1);
    orbsSvg += `    <circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="${r.toFixed(1)}" fill="${orbColor}" opacity="${baseOp.toFixed(3)}" filter="url(#${uid}-blur)">\n`;
    orbsSvg += `      <animate attributeName="opacity" values="${baseOp.toFixed(3)};${maxOp};${minOp};${baseOp.toFixed(3)}" dur="${dur}s" repeatCount="indefinite" />\n`;
    orbsSvg += `    </circle>\n`;
  }

  // ─── SHARED: 4 Corner Crosshairs ──────────────────────────────────
  const crosshairs = [
    { x: 100, y: 80 }, { x: width - 100, y: 80 },
    { x: 100, y: height - 80 }, { x: width - 100, y: height - 80 },
  ];
  let techSvg = '';
  for (const ch of crosshairs) {
    techSvg += `    <g opacity="0.3" stroke="${theme.glow}" stroke-width="1">
      <line x1="${ch.x - 12}" y1="${ch.y}" x2="${ch.x + 12}" y2="${ch.y}" />
      <line x1="${ch.x}" y1="${ch.y - 12}" x2="${ch.x}" y2="${ch.y + 12}" />
      <circle cx="${ch.x}" cy="${ch.y}" r="6" fill="none" stroke-width="0.5" />
    </g>\n`;
  }

  // Defs and style-specific elements
  let styleDefs = '';
  let styleContent = '';

  switch (theme.style) {
    // ═══════════════════════════════════════════════════════════════════
    // STYLE: "vault" (Quantum Vault theme)
    // ═══════════════════════════════════════════════════════════════════
    case 'vault': {
      // Dense fine grid (24x24 cell size)
      styleDefs += `    <pattern id="${uid}-grid-vault" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="${theme.gridColor}" stroke-width="0.5" />
      <circle cx="0" cy="0" r="0.75" fill="${theme.glow}" opacity="0.12" />
    </pattern>\n`;

      styleContent += `  <rect width="100%" height="100%" fill="url(#${uid}-grid-vault)" />\n`;

      // 6–9 concentric dashed rings centered at (cx, cy), radius 100–480px
      const ringCount = 6 + Math.floor(rng() * 4);
      const baseRadius = 110;
      let ringsSvg = '';
      for (let i = 0; i < ringCount; i++) {
        const rad = baseRadius + i * (38 + rng() * 22);
        const strokeW = (0.75 + rng() * 1.5).toFixed(1);
        const dashPattern = i % 3 === 0 ? '24 16' : i % 3 === 1 ? '12 8 3 8' : '36 18';
        const ringOpacity = (0.16 + rng() * 0.22).toFixed(2);
        const isOdd = i % 2 === 1;
        const dur = isOdd ? (45 + rng() * 45).toFixed(1) : (30 + rng() * 40).toFixed(1);
        const fromRot = isOdd ? `0 ${cx} ${cy}` : `360 ${cx} ${cy}`;
        const toRot = isOdd ? `360 ${cx} ${cy}` : `0 ${cx} ${cy}`;

        ringsSvg += `    <g>\n`;
        ringsSvg += `      <circle cx="${cx}" cy="${cy}" r="${rad.toFixed(1)}" fill="none" stroke="${theme.glow}" stroke-width="${strokeW}" stroke-dasharray="${dashPattern}" opacity="${ringOpacity}">\n`;
        ringsSvg += `        <animateTransform attributeName="transform" type="rotate" from="${fromRot}" to="${toRot}" dur="${dur}s" repeatCount="indefinite" />\n`;
        ringsSvg += `      </circle>\n`;

        // Every other ring has 12–24 radial tick marks with opacity pulse
        if (i % 2 === 0) {
          const ticks = 12 + Math.floor(rng() * 13);
          const tickDur = (2.5 + rng() * 1.5).toFixed(1);
          ringsSvg += `      <g opacity="0.3">\n`;
          ringsSvg += `        <animate attributeName="opacity" values="0.15;0.45;0.15" dur="${tickDur}s" repeatCount="indefinite" />\n`;
          ringsSvg += `        <animateTransform attributeName="transform" type="rotate" from="${fromRot}" to="${toRot}" dur="${dur}s" repeatCount="indefinite" />\n`;
          for (let t = 0; t < ticks; t++) {
            const angle = (t / ticks) * Math.PI * 2;
            const x1 = cx + Math.cos(angle) * (rad - 5);
            const y1 = cy + Math.sin(angle) * (rad - 5);
            const x2 = cx + Math.cos(angle) * (rad + 5);
            const y2 = cy + Math.sin(angle) * (rad + 5);
            ringsSvg += `        <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${theme.glow}" stroke-width="1" />\n`;
          }
          ringsSvg += `      </g>\n`;
        }
        ringsSvg += `    </g>\n`;
      }

      // Central hexagon (vault door face) at radius ~80px, stroke only, slow clockwise rot dur="120s"
      const hexPoints = [];
      const hexR = 80;
      for (let s = 0; s < 6; s++) {
        const a = (s * Math.PI) / 3;
        hexPoints.push(`${(cx + hexR * Math.cos(a)).toFixed(1)},${(cy + hexR * Math.sin(a)).toFixed(1)}`);
      }
      const hexPoly = `    <polygon points="${hexPoints.join(' ')}" fill="none" stroke="${theme.glow}" stroke-width="1.75" opacity="0.45">
      <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="120s" repeatCount="indefinite" />
    </polygon>\n`;

      styleContent += `  <g id="${uid}-vault-rings">\n${ringsSvg}  </g>\n`;
      styleContent += `  <g id="${uid}-vault-door">\n${hexPoly}  </g>\n`;
      break;
    }

    // ═══════════════════════════════════════════════════════════════════
    // STYLE: "aurora" (Deep Aurora theme)
    // ═══════════════════════════════════════════════════════════════════
    case 'aurora': {
      // Soft horizontal band at top-center for aurora sky glow
      styleDefs += `    <radialGradient id="${uid}-aurora-band" cx="50%" cy="0%" rx="50%" ry="100%">
      <stop offset="0%" stop-color="${theme.accent2}" stop-opacity="0.3" />
      <stop offset="50%" stop-color="${theme.accent1}" stop-opacity="0.12" />
      <stop offset="100%" stop-color="${theme.bgStart}" stop-opacity="0" />
    </radialGradient>\n`;

      styleContent += `  <ellipse cx="${cx}" cy="0" rx="600" ry="200" fill="url(#${uid}-aurora-band)" opacity="0.12" />\n`;

      // 6–10 tall vertical bezier curtains running top to bottom
      const curtainCount = 6 + Math.floor(rng() * 5);
      let curtainsSvg = '';
      for (let c = 0; c < curtainCount; c++) {
        const startX = width * (0.2 + (c / curtainCount) * 0.6 + (rng() - 0.5) * 0.08);
        const endX = startX + (rng() - 0.5) * 180;
        const cp1x = startX + (rng() - 0.5) * 240;
        const cp1y = height * (0.25 + rng() * 0.2);
        const cp2x = endX + (rng() - 0.5) * 240;
        const cp2y = height * (0.6 + rng() * 0.2);

        const col = c % 3 === 0 ? theme.accent1 : c % 3 === 1 ? theme.accent2 : theme.glow;
        const sw = Math.floor(60 + rng() * 80);
        const op = (0.06 + rng() * 0.12).toFixed(3);
        const maxOp = (parseFloat(op) * 1.8).toFixed(3);
        const swayDist = ((rng() > 0.5 ? 1 : -1) * (15 + rng() * 15)).toFixed(1);
        const swayDur = (8 + rng() * 8).toFixed(1);
        const opDur = (5 + rng() * 9).toFixed(1);

        curtainsSvg += `    <path d="M ${startX.toFixed(1)} -50 C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${endX.toFixed(1)} ${(height + 50).toFixed(1)}" fill="none" stroke="${col}" stroke-width="${sw}" opacity="${op}">
      <animateTransform attributeName="transform" type="translate" values="0,0; ${swayDist},0; 0,0" dur="${swayDur}s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="${op};${maxOp};${op}" dur="${opDur}s" repeatCount="indefinite" />
    </path>\n`;
      }
      styleContent += `  <g id="${uid}-aurora-curtains">\n${curtainsSvg}  </g>\n`;

      // 50–70 fine star dots scattered across upper 60% of canvas (30% twinkle)
      const starCount = 50 + Math.floor(rng() * 21);
      let starsSvg = '';
      for (let s = 0; s < starCount; s++) {
        const sx = width * (0.05 + rng() * 0.9);
        const sy = height * (0.05 + rng() * 0.55);
        const sr = (0.6 + rng() * 1.2).toFixed(1);
        const sop = (0.25 + rng() * 0.5).toFixed(2);
        const twinkle = rng() < 0.3;

        starsSvg += `    <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${sr}" fill="${theme.glow}" opacity="${sop}">\n`;
        if (twinkle) {
          const minStarOp = (parseFloat(sop) * 0.2).toFixed(2);
          const starDur = (2 + rng() * 3).toFixed(1);
          starsSvg += `      <animate attributeName="opacity" values="${sop};${minStarOp};${sop}" dur="${starDur}s" repeatCount="indefinite" />\n`;
        }
        starsSvg += `    </circle>\n`;
      }
      styleContent += `  <g id="${uid}-aurora-stars">\n${starsSvg}  </g>\n`;
      break;
    }

    // ═══════════════════════════════════════════════════════════════════
    // STYLE: "matrix" (Cyber Cobalt theme)
    // ═══════════════════════════════════════════════════════════════════
    case 'matrix': {
      // Monospace characters in columns every 22px; cap total chars at 300
      const charSet = '01アイウ01ABCDEF10';
      const colStep = 22;
      const totalCols = Math.floor((width - 44) / colStep);
      // Select 36 columns evenly/seeded so total chars stay well below 300 cap (36 * 7 = ~252)
      const selectedColIndices = [];
      for (let i = 0; i < totalCols; i++) {
        if (i % 2 === 0 || rng() > 0.4) {
          selectedColIndices.push(i);
        }
      }
      // Shuffle & cap selected columns
      const colsToUse = selectedColIndices.slice(0, 36);

      let charsSvg = '';
      for (const colIdx of colsToUse) {
        const colX = 22 + colIdx * colStep;
        const charsInCol = 6 + Math.floor(rng() * 3); // 6-8 chars
        for (let c = 0; c < charsInCol; c++) {
          const charY = height * (0.08 + rng() * 0.84);
          const ch = charSet[Math.floor(rng() * charSet.length)];
          const baseOp = 0.08 + rng() * 0.22;
          const opA = baseOp.toFixed(2);
          const opB = (baseOp * 0.3).toFixed(2);
          const opC = Math.min(0.9, baseOp * 2.2).toFixed(2);
          const dur = (1.5 + rng() * 2.5).toFixed(1);
          const begin = (rng() * 3).toFixed(1);

          charsSvg += `    <text x="${colX}" y="${charY.toFixed(1)}" font-family="monospace" font-size="11" fill="${theme.glow}" opacity="${opA}">
      ${ch}
      <animate attributeName="opacity" values="${opA};${opB};${opA};${opC};${opA}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite" />
    </text>\n`;
        }
      }
      styleContent += `  <g id="${uid}-matrix-rain">\n${charsSvg}  </g>\n`;

      // 4–6 full-width horizontal scanlines with slow downward drift
      const scanCount = 4 + Math.floor(rng() * 3);
      let scanSvg = '';
      for (let s = 0; s < scanCount; s++) {
        const sy = (height * rng()).toFixed(1);
        const sDur = (8 + rng() * 12).toFixed(1);
        scanSvg += `    <rect x="0" y="${sy}" width="${width}" height="1.5" fill="${theme.glow}" opacity="0.05">
      <animateTransform attributeName="transform" type="translate" from="0,0" to="0,${height}" dur="${sDur}s" repeatCount="indefinite" />
    </rect>\n`;
      }
      styleContent += `  <g id="${uid}-matrix-scanlines">\n${scanSvg}  </g>\n`;
      break;
    }

    // ═══════════════════════════════════════════════════════════════════
    // STYLE: "solar" (Solar Horizon theme)
    // ═══════════════════════════════════════════════════════════════════
    case 'solar': {
      // NO grid pattern rect used for solar!

      // Central starburst: 28–36 lines radiating from (cx, cy)
      const rayCount = 28 + Math.floor(rng() * 9);
      let raysSvg = '';
      for (let r = 0; r < rayCount; r++) {
        const angle = (r / rayCount) * Math.PI * 2;
        const len = 180 + rng() * 420;
        const sw = (0.5 + rng() * 2.0).toFixed(1);
        const op = (0.1 + rng() * 0.18).toFixed(2);
        const col = r % 3 === 0 ? theme.accent1 : r % 3 === 1 ? theme.accent2 : theme.glow;
        const x2 = cx + Math.cos(angle) * len;
        const y2 = cy + Math.sin(angle) * len;
        raysSvg += `      <line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="${sw}" opacity="${op}" />\n`;
      }

      styleContent += `  <g id="${uid}-solar-burst">\n`;
      styleContent += `    <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="200s" repeatCount="indefinite" />\n`;
      styleContent += `${raysSvg}  </g>\n`;

      // 3 concentric ellipses around center with orbital tilt and scale breathing
      let ellipsesSvg = '';
      for (let e = 0; e < 3; e++) {
        const rxVal = 200 + e * 110 + rng() * 30;
        const ryVal = rxVal * (0.55 + rng() * 0.45);
        const op = (0.12 + rng() * 0.1).toFixed(2);
        const dur = (6 + rng() * 4).toFixed(1);

        ellipsesSvg += `    <g transform="translate(${cx} ${cy})">\n`;
        ellipsesSvg += `      <g>\n`;
        ellipsesSvg += `        <animateTransform attributeName="transform" type="scale" values="1;1.04;1" additive="sum" dur="${dur}s" repeatCount="indefinite" />\n`;
        ellipsesSvg += `        <ellipse cx="0" cy="0" rx="${rxVal.toFixed(1)}" ry="${ryVal.toFixed(1)}" fill="none" stroke="${theme.glow}" stroke-width="1.5" opacity="${op}" />\n`;
        ellipsesSvg += `      </g>\n`;
        ellipsesSvg += `    </g>\n`;
      }
      styleContent += `  <g id="${uid}-solar-orbits">\n${ellipsesSvg}  </g>\n`;

      // 4–6 solar flare bezier arcs sweeping outward
      const flareCount = 4 + Math.floor(rng() * 3);
      let flaresSvg = '';
      for (let f = 0; f < flareCount; f++) {
        const quadrantAngle = (f / flareCount) * Math.PI * 2 + (rng() - 0.5) * 0.5;
        const startRad = 70 + rng() * 50;
        const sx = cx + Math.cos(quadrantAngle) * startRad;
        const sy = cy + Math.sin(quadrantAngle) * startRad;
        const endRad = 500 + rng() * 300;
        const ex = cx + Math.cos(quadrantAngle + 0.8) * endRad;
        const ey = cy + Math.sin(quadrantAngle + 0.8) * endRad;
        const cpx = cx + Math.cos(quadrantAngle + 0.4) * (endRad * 0.7);
        const cpy = cy + Math.sin(quadrantAngle + 0.4) * (endRad * 0.7);

        const dur = (4 + rng() * 5).toFixed(1);
        flaresSvg += `    <path d="M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" stroke="${theme.accent2}" stroke-width="1.5" opacity="0.12">
      <animate attributeName="opacity" values="0.08;0.25;0.08" dur="${dur}s" repeatCount="indefinite" />
    </path>\n`;
      }
      styleContent += `  <g id="${uid}-solar-flares">\n${flaresSvg}  </g>\n`;
      break;
    }

    // ═══════════════════════════════════════════════════════════════════
    // STYLE: "geodesic" (Nordic Emerald theme)
    // ═══════════════════════════════════════════════════════════════════
    case 'geodesic': {
      // Hexagonal grid pattern
      styleDefs += `    <pattern id="${uid}-hex-grid" width="60" height="103.92" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 60 17.32 L 60 51.96 L 30 69.28 L 0 51.96 L 0 17.32 Z M 30 69.28 L 60 86.6 L 60 121.24 L 30 138.56 L 0 121.24 L 0 86.6 Z" fill="none" stroke="${theme.gridColor}" stroke-width="0.75" />
      <circle cx="30" cy="0" r="1" fill="${theme.glow}" opacity="0.15" />
    </pattern>\n`;

      styleContent += `  <rect width="100%" height="100%" fill="url(#${uid}-hex-grid)">
    <animate attributeName="x" values="0;60;0" dur="30s" repeatCount="indefinite" />
  </rect>\n`;

      // 22–30 seed-based points across canvas
      const ptCount = 22 + Math.floor(rng() * 9);
      const points = [];
      for (let p = 0; p < ptCount; p++) {
        points.push({
          x: width * (0.05 + rng() * 0.9),
          y: height * (0.08 + rng() * 0.84),
        });
      }

      // Connect nearby triplets within 260px pairwise
      let trisSvg = '';
      let triIndex = 0;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const d1 = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
          if (d1 >= 260) continue;
          for (let k = j + 1; k < points.length; k++) {
            const d2 = Math.hypot(points[j].x - points[k].x, points[j].y - points[k].y);
            const d3 = Math.hypot(points[i].x - points[k].x, points[i].y - points[k].y);
            if (d2 < 260 && d3 < 260) {
              triIndex++;
              const hasFill = triIndex % 5 === 0;
              const fillAttr = hasFill ? theme.accent1 : 'none';
              const fillOp = hasFill ? '0.03' : '0';
              const baseOp = (0.08 + rng() * 0.1).toFixed(3);
              const maxOp = (parseFloat(baseOp) * 2).toFixed(3);
              const dur = (4 + rng() * 6).toFixed(1);

              trisSvg += `    <polygon points="${points[i].x.toFixed(1)},${points[i].y.toFixed(1)} ${points[j].x.toFixed(1)},${points[j].y.toFixed(1)} ${points[k].x.toFixed(1)},${points[k].y.toFixed(1)}" fill="${fillAttr}" fill-opacity="${fillOp}" stroke="${theme.accent1}" stroke-width="0.8" opacity="${baseOp}">
      <animate attributeName="opacity" values="${baseOp};${maxOp};${baseOp}" dur="${dur}s" repeatCount="indefinite" />
    </polygon>\n`;
            }
          }
        }
      }

      styleContent += `  <g id="${uid}-geodesic-mesh">\n`;
      styleContent += `    <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="2 ${cx} ${cy}" dur="180s" repeatCount="indefinite" />\n`;
      styleContent += `${trisSvg}  </g>\n`;
      break;
    }

    // ═══════════════════════════════════════════════════════════════════
    // STYLE: "constellation" (Celestial Cosmos theme)
    // ═══════════════════════════════════════════════════════════════════
    case 'constellation': {
      // 100–130 primary star dots across full canvas (40% twinkle)
      const starCount = 100 + Math.floor(rng() * 31);
      let starsSvg = '';
      for (let s = 0; s < starCount; s++) {
        const sx = (width * rng()).toFixed(1);
        const sy = (height * rng()).toFixed(1);
        const sr = (0.5 + rng() * 1.7).toFixed(1);
        const baseOp = 0.2 + rng() * 0.45;
        const twinkle = rng() < 0.4;
        const opA = baseOp.toFixed(2);
        const opB = (baseOp * 0.15).toFixed(2);
        const opC = (baseOp * 0.6).toFixed(2);
        const dur = (2 + rng() * 5).toFixed(1);

        starsSvg += `    <circle cx="${sx}" cy="${sy}" r="${sr}" fill="${theme.glow}" opacity="${opA}">\n`;
        if (twinkle) {
          starsSvg += `      <animate attributeName="opacity" values="${opA};${opB};${opA};${opC};${opA}" dur="${dur}s" repeatCount="indefinite" />\n`;
        }
        starsSvg += `    </circle>\n`;
      }

      // Secondary faint layer: 180–200 micro-dots for Milky Way density
      const microCount = 180 + Math.floor(rng() * 21);
      let microSvg = '';
      for (let m = 0; m < microCount; m++) {
        const mx = (width * rng()).toFixed(1);
        const my = (height * rng()).toFixed(1);
        const mr = (0.3 + rng() * 0.2).toFixed(1);
        microSvg += `    <circle cx="${mx}" cy="${my}" r="${mr}" fill="${theme.accent1}" opacity="0.15" />\n`;
      }
      styleContent += `  <g id="${uid}-stars-faint">\n${microSvg}  </g>\n`;
      styleContent += `  <g id="${uid}-stars-bright">\n${starsSvg}  </g>\n`;

      // 28–38 primary constellation nodes (r=1.5–4)
      const nodeCount = 28 + Math.floor(rng() * 11);
      const cNodes = [];
      for (let n = 0; n < nodeCount; n++) {
        cNodes.push({
          x: width * (0.08 + rng() * 0.84),
          y: height * (0.1 + rng() * 0.8),
          r: 1.5 + rng() * 2.5,
        });
      }

      // Connect pairs within 240px
      let linesSvg = '';
      for (let i = 0; i < cNodes.length; i++) {
        for (let j = i + 1; j < cNodes.length; j++) {
          const dist = Math.hypot(cNodes[i].x - cNodes[j].x, cNodes[i].y - cNodes[j].y);
          if (dist < 240) {
            const lineOp = ((1 - dist / 240) * 0.18 + 0.02).toFixed(2);
            linesSvg += `    <line x1="${cNodes[i].x.toFixed(1)}" y1="${cNodes[i].y.toFixed(1)}" x2="${cNodes[j].x.toFixed(1)}" y2="${cNodes[j].y.toFixed(1)}" stroke="${theme.glow}" stroke-width="0.75" opacity="${lineOp}" />\n`;
          }
        }
      }
      styleContent += `  <g id="${uid}-constellation-lines">\n${linesSvg}  </g>\n`;

      // Draw primary nodes with slow pulse r value
      let nodeDotsSvg = '';
      for (const node of cNodes) {
        const rVal = node.r.toFixed(1);
        const rMax = (node.r * 1.6).toFixed(1);
        const pulseDur = (3 + rng() * 5).toFixed(1);
        nodeDotsSvg += `    <circle cx="${node.x.toFixed(1)}" cy="${node.y.toFixed(1)}" r="${rVal}" fill="${theme.glow}" opacity="0.7">
      <animate attributeName="r" values="${rVal};${rMax};${rVal}" dur="${pulseDur}s" repeatCount="indefinite" />
    </circle>\n`;
      }
      styleContent += `  <g id="${uid}-constellation-nodes">\n${nodeDotsSvg}  </g>\n`;

      // 3–5 cluster label texts
      const labelCount = 3 + Math.floor(rng() * 3);
      let labelsSvg = '';
      for (let l = 0; l < labelCount; l++) {
        const anchorNode = cNodes[Math.floor(rng() * cNodes.length)];
        const hexTag = Math.floor(rng() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
        labelsSvg += `    <text x="${(anchorNode.x + 10).toFixed(1)}" y="${(anchorNode.y + 12).toFixed(1)}" font-family="monospace" font-size="9" fill="${theme.glow}" opacity="0.25">SYS-${hexTag}</text>\n`;
      }
      styleContent += `  <g id="${uid}-cluster-labels">\n${labelsSvg}  </g>\n`;

      // Scanning line across the canvas
      styleContent += `  <line x1="0" y1="0" x2="0" y2="${height}" stroke="${theme.glow}" stroke-width="1" opacity="0.12">
    <animate attributeName="x1" from="0" to="${width}" dur="12s" repeatCount="indefinite" />
    <animate attributeName="x2" from="0" to="${width}" dur="12s" repeatCount="indefinite" />
  </line>\n`;
      break;
    }

    // ═══════════════════════════════════════════════════════════════════
    // STYLE: "kinetic" (Titanium Waves theme)
    // ═══════════════════════════════════════════════════════════════════
    case 'kinetic': {
      // Diagonal hatch pattern (45° lines at 30px spacing)
      styleDefs += `    <pattern id="${uid}-diag-grid" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="30" stroke="${theme.gridColor}" stroke-width="0.75" />
    </pattern>\n`;

      styleContent += `  <rect width="100%" height="100%" fill="url(#${uid}-diag-grid)">
    <animate attributeName="x" values="0;30;0" dur="8s" repeatCount="indefinite" />
  </rect>\n`;

      // 22–30 motion streak lines at 30°–55° angles with per-streak linearGradient
      const streakCount = 22 + Math.floor(rng() * 9);
      let streaksDefs = '';
      let streaksSvg = '';

      for (let s = 0; s < streakCount; s++) {
        const deg = 30 + rng() * 25;
        const rad = (deg * Math.PI) / 180;
        const strokeW = (1 + rng() * 2).toFixed(1);
        const op = (0.15 + rng() * 0.2).toFixed(2);
        const len = 80 + rng() * 160;
        const dur = (6 + rng() * 8).toFixed(1);

        const xPos = width * rng();
        const yPos = height * rng();
        const x1 = xPos - Math.cos(rad) * (len / 2);
        const y1 = yPos - Math.sin(rad) * (len / 2);
        const x2 = xPos + Math.cos(rad) * (len / 2);
        const y2 = yPos + Math.sin(rad) * (len / 2);

        streaksDefs += `    <linearGradient id="${uid}-streak-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.glow}" stop-opacity="0" />
      <stop offset="50%" stop-color="${theme.glow}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="${theme.glow}" stop-opacity="0" />
    </linearGradient>\n`;

        const fromY = (-200 * Math.tan(rad)).toFixed(1);
        const toY = ((width + 200) * Math.tan(rad)).toFixed(1);

        streaksSvg += `    <g>
      <animateTransform attributeName="transform" type="translate" from="-200,${fromY}" to="${width + 200},${toY}" dur="${dur}s" repeatCount="indefinite" />
      <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="url(#${uid}-streak-${s})" stroke-width="${strokeW}" opacity="${op}" />
    </g>\n`;
      }

      styleDefs += streaksDefs;
      styleContent += `  <g id="${uid}-kinetic-streaks">\n${streaksSvg}  </g>\n`;

      // 8–12 sharp angular polygons (triangles and parallelograms) rotating around centroid
      const polyCount = 8 + Math.floor(rng() * 5);
      let polysSvg = '';
      for (let p = 0; p < polyCount; p++) {
        const pcx = width * (0.1 + rng() * 0.8);
        const pcy = height * (0.15 + rng() * 0.7);
        const polySize = 30 + rng() * 50;
        const isTriangle = rng() > 0.5;
        let pointsStr;

        if (isTriangle) {
          const a1 = rng() * Math.PI * 2;
          const a2 = a1 + 2.1 + rng() * 0.5;
          const a3 = a2 + 2.1 + rng() * 0.5;
          pointsStr = `${(pcx + Math.cos(a1) * polySize).toFixed(1)},${(pcy + Math.sin(a1) * polySize).toFixed(1)} ${(pcx + Math.cos(a2) * polySize).toFixed(1)},${(pcy + Math.sin(a2) * polySize).toFixed(1)} ${(pcx + Math.cos(a3) * polySize).toFixed(1)},${(pcy + Math.sin(a3) * polySize).toFixed(1)}`;
        } else {
          const w = polySize;
          const h = polySize * 0.6;
          const skew = 20;
          pointsStr = `${(pcx - w).toFixed(1)},${(pcy - h).toFixed(1)} ${(pcx + w - skew).toFixed(1)},${(pcy - h).toFixed(1)} ${(pcx + w).toFixed(1)},${(pcy + h).toFixed(1)} ${(pcx - w + skew).toFixed(1)},${(pcy + h).toFixed(1)}`;
        }

        const rotDur = (20 + rng() * 30).toFixed(1);
        const rotSign = rng() > 0.5 ? 360 : -360;
        const polyOp = (0.08 + rng() * 0.1).toFixed(2);

        polysSvg += `    <g>
      <animateTransform attributeName="transform" type="rotate" from="0 ${pcx.toFixed(1)} ${pcy.toFixed(1)}" to="${rotSign} ${pcx.toFixed(1)} ${pcy.toFixed(1)}" dur="${rotDur}s" repeatCount="indefinite" />
      <polygon points="${pointsStr}" stroke="${theme.accent1}" stroke-width="1" fill="none" opacity="${polyOp}" />
    </g>\n`;
      }
      styleContent += `  <g id="${uid}-kinetic-polygons">\n${polysSvg}  </g>\n`;
      break;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
  <defs>
    <!-- Background Linear Gradient -->
    <linearGradient id="${uid}-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bgStart}" />
      <stop offset="50%" stop-color="${theme.bgMid}" />
      <stop offset="100%" stop-color="${theme.bgEnd}" />
    </linearGradient>

    <!-- Radial Glow Gradient -->
    <radialGradient id="${uid}-radial" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${theme.glow}" stop-opacity="0.18" />
      <stop offset="40%" stop-color="${theme.accent1}" stop-opacity="0.08" />
      <stop offset="100%" stop-color="${theme.bgStart}" stop-opacity="0" />
    </radialGradient>

    <!-- Gaussian Blur Filter for ambient lighting -->
    <filter id="${uid}-blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="90" />
    </filter>
${styleDefs}  </defs>

  <!-- Background Base Layer -->
  <rect width="100%" height="100%" fill="url(#${uid}-bg)" />

  <!-- Ambient Light Orbs with Opacity Breathing -->
  <g id="${uid}-orbs">
${orbsSvg}  </g>

  <!-- Radial Core Glow -->
  <rect width="100%" height="100%" fill="url(#${uid}-radial)" />

  <!-- Style-Specific Procedural Artwork -->
${styleContent}
  <!-- Crosshairs -->
  <g id="${uid}-crosshairs">
${techSvg}  </g>

  <!-- Monospace Daily Security Watermark -->
  <g font-family="monospace" font-size="10" fill="${theme.glow}" opacity="0.4" letter-spacing="2">
    <text x="32" y="${height - 24}">DAILY SECURITY VECTOR // ${safeDate} // SEED: 0x${hashHex}</text>
    <text x="${width - 32}" y="${height - 24}" text-anchor="end">THEME: ${theme.name.toUpperCase()} // SYS-LOCK</text>
  </g>
</svg>`;
}
