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
    bgStart: '#060B11',
    bgMid: '#0B1522',
    bgEnd: '#04070A',
    accent1: '#0F766E', // Emerald / Teal
    accent2: '#14B8A6',
    glow: '#2DD4BF',
    ringColor: 'rgba(45, 212, 191, 0.25)',
    gridColor: 'rgba(255, 255, 255, 0.04)',
    style: 'vault',
  },
  {
    name: 'Deep Aurora',
    bgStart: '#080816',
    bgMid: '#120F2E',
    bgEnd: '#06060F',
    accent1: '#6366F1', // Indigo / Violet
    accent2: '#A855F7',
    glow: '#818CF8',
    ringColor: 'rgba(168, 85, 247, 0.22)',
    gridColor: 'rgba(255, 255, 255, 0.04)',
    style: 'aurora',
  },
  {
    name: 'Cyber Cobalt',
    bgStart: '#040B17',
    bgMid: '#081A32',
    bgEnd: '#02060D',
    accent1: '#2563EB', // Sapphire / Cyan
    accent2: '#06B6D4',
    glow: '#38BDF8',
    ringColor: 'rgba(56, 189, 248, 0.25)',
    gridColor: 'rgba(255, 255, 255, 0.04)',
    style: 'matrix',
  },
  {
    name: 'Solar Horizon',
    bgStart: '#120A05',
    bgMid: '#24140B',
    bgEnd: '#0A0603',
    accent1: '#D97706', // Amber / Gold
    accent2: '#F59E0B',
    glow: '#FBBF24',
    ringColor: 'rgba(245, 158, 11, 0.22)',
    gridColor: 'rgba(255, 255, 255, 0.04)',
    style: 'solar',
  },
  {
    name: 'Nordic Emerald',
    bgStart: '#040E0A',
    bgMid: '#081F17',
    bgEnd: '#020705',
    accent1: '#059669', // Forest / Jade
    accent2: '#10B981',
    glow: '#34D399',
    ringColor: 'rgba(52, 211, 153, 0.25)',
    gridColor: 'rgba(255, 255, 255, 0.04)',
    style: 'geodesic',
  },
  {
    name: 'Celestial Cosmos',
    bgStart: '#0A0A14',
    bgMid: '#14142B',
    bgEnd: '#06060D',
    accent1: '#8B5CF6', // Purple / Cyan
    accent2: '#06B6D4',
    glow: '#C084FC',
    ringColor: 'rgba(192, 132, 252, 0.22)',
    gridColor: 'rgba(255, 255, 255, 0.04)',
    style: 'constellation',
  },
  {
    name: 'Titanium Waves',
    bgStart: '#0B1118',
    bgMid: '#162230',
    bgEnd: '#070C12',
    accent1: '#0EA5E9', // Sky / Steel
    accent2: '#38BDF8',
    glow: '#7DD3FC',
    ringColor: 'rgba(125, 211, 252, 0.25)',
    gridColor: 'rgba(255, 255, 255, 0.04)',
    style: 'kinetic',
  },
];

/**
 * Generate SVG picture code for a specific day
 * @param {string} dateStr e.g. "2026-10-12"
 * @param {object} [options]
 * @returns {string} SVG XML markup
 */
export function generateDailySvg(dateStr, options = {}) {
  const safeDate = String(dateStr || new Date().toISOString().slice(0, 10)).trim();
  const rng = createRng(safeDate);
  const width = options.width || 1440;
  const height = options.height || 900;

  // Day hash
  let dateSum = 0;
  for (let i = 0; i < safeDate.length; i++) {
    dateSum = (dateSum * 31 + safeDate.charCodeAt(i)) >>> 0;
  }
  const themeIndex = dateSum % DAILY_THEMES.length;
  const theme = DAILY_THEMES[themeIndex];
  const uid = `day_${safeDate.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const cx = width / 2;
  const cy = height / 2;

  // 1. Light orbs
  const orbCount = 3 + Math.floor(rng() * 3);
  let orbsSvg = '';
  for (let i = 0; i < orbCount; i++) {
    const ox = width * (0.15 + rng() * 0.7);
    const oy = height * (0.2 + rng() * 0.6);
    const r = 180 + rng() * 220;
    const orbColor = i % 2 === 0 ? theme.accent1 : theme.accent2;
    const opacity = (0.12 + rng() * 0.18).toFixed(2);
    orbsSvg += `    <circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="${r.toFixed(1)}" fill="${orbColor}" opacity="${opacity}" filter="url(#${uid}-blur)" />\n`;
  }

  // 2. Concentric cryptographic security rings
  const ringCount = 5 + Math.floor(rng() * 4);
  let ringsSvg = '';
  const baseRadius = 140;
  for (let i = 0; i < ringCount; i++) {
    const rad = baseRadius + i * (35 + rng() * 30);
    const strokeW = (0.5 + rng() * 1.5).toFixed(1);
    const dashA = Math.floor(10 + rng() * 40);
    const dashB = Math.floor(5 + rng() * 25);
    const dashC = Math.floor(2 + rng() * 15);
    const dashArray = i % 3 === 0 ? `${dashA} ${dashB}` : i % 3 === 1 ? `${dashA} ${dashB} ${dashC} ${dashB}` : 'none';
    const ringOpacity = (0.15 + rng() * 0.25).toFixed(2);
    const rot = Math.floor(rng() * 360);

    ringsSvg += `    <circle cx="${cx}" cy="${cy}" r="${rad.toFixed(1)}" fill="none" stroke="${theme.glow}" stroke-width="${strokeW}" stroke-dasharray="${dashArray}" opacity="${ringOpacity}" transform="rotate(${rot} ${cx} ${cy})" />\n`;

    // Radial tick markers on alternate rings
    if (i % 2 === 1) {
      const ticks = 12 + Math.floor(rng() * 16);
      for (let t = 0; t < ticks; t++) {
        const angle = (t / ticks) * Math.PI * 2 + (rot * Math.PI) / 180;
        const x1 = cx + Math.cos(angle) * (rad - 4);
        const y1 = cy + Math.sin(angle) * (rad - 4);
        const x2 = cx + Math.cos(angle) * (rad + 4);
        const y2 = cy + Math.sin(angle) * (rad + 4);
        ringsSvg += `    <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${theme.glow}" stroke-width="1" opacity="${(parseFloat(ringOpacity) * 0.8).toFixed(2)}" />\n`;
      }
    }
  }

  // 3. Flowing harmonic bezier waves
  let wavesSvg = '';
  const waveCount = 3 + Math.floor(rng() * 2);
  for (let w = 0; w < waveCount; w++) {
    const startY = height * (0.35 + rng() * 0.4);
    const cp1x = width * (0.2 + rng() * 0.2);
    const cp1y = startY + (rng() - 0.5) * 300;
    const cp2x = width * (0.6 + rng() * 0.2);
    const cp2y = startY + (rng() - 0.5) * 300;
    const endY = height * (0.35 + rng() * 0.4);
    const strokeWidth = (1.5 + rng() * 1.5).toFixed(1);
    const waveOpacity = (0.15 + rng() * 0.25).toFixed(2);
    const strokeCol = w % 2 === 0 ? theme.accent2 : theme.glow;

    wavesSvg += `    <path d="M -50 ${startY.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${width + 50} ${endY.toFixed(1)}" fill="none" stroke="${strokeCol}" stroke-width="${strokeWidth}" opacity="${waveOpacity}" />\n`;
  }

  // 4. Constellation / Security nodes
  const nodeCount = 14 + Math.floor(rng() * 10);
  const nodes = [];
  for (let n = 0; n < nodeCount; n++) {
    nodes.push({
      x: width * (0.1 + rng() * 0.8),
      y: height * (0.15 + rng() * 0.7),
      size: 1.5 + rng() * 3,
    });
  }

  let nodesSvg = '';
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        const lineOp = ((1 - dist / 180) * 0.25).toFixed(2);
        nodesSvg += `    <line x1="${nodes[i].x.toFixed(1)}" y1="${nodes[i].y.toFixed(1)}" x2="${nodes[j].x.toFixed(1)}" y2="${nodes[j].y.toFixed(1)}" stroke="${theme.accent2}" stroke-width="0.75" opacity="${lineOp}" />\n`;
      }
    }
  }

  for (const node of nodes) {
    nodesSvg += `    <circle cx="${node.x.toFixed(1)}" cy="${node.y.toFixed(1)}" r="${node.size.toFixed(1)}" fill="${theme.glow}" opacity="0.65" />\n`;
    nodesSvg += `    <circle cx="${node.x.toFixed(1)}" cy="${node.y.toFixed(1)}" r="${(node.size * 2).toFixed(1)}" fill="none" stroke="${theme.glow}" stroke-width="0.5" opacity="0.25" />\n`;
  }

  // 5. Technical crosshairs & coordinate markers
  const crosshairs = [
    { x: 100, y: 80 },
    { x: width - 100, y: 80 },
    { x: 100, y: height - 80 },
    { x: width - 100, y: height - 80 },
  ];
  let techSvg = '';
  for (const ch of crosshairs) {
    techSvg += `    <g opacity="0.3" stroke="${theme.glow}" stroke-width="1">
      <line x1="${ch.x - 12}" y1="${ch.y}" x2="${ch.x + 12}" y2="${ch.y}" />
      <line x1="${ch.x}" y1="${ch.y - 12}" x2="${ch.x}" y2="${ch.y + 12}" />
      <circle cx="${ch.x}" cy="${ch.y}" r="6" fill="none" stroke-width="0.5" />
    </g>\n`;
  }

  const hashHex = (dateSum >>> 0).toString(16).toUpperCase().padStart(8, '0');

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

    <!-- Micro Grid Pattern -->
    <pattern id="${uid}-grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="${theme.gridColor}" stroke-width="0.75" />
      <circle cx="0" cy="0" r="1" fill="${theme.glow}" opacity="0.15" />
    </pattern>
  </defs>

  <!-- Background Layer -->
  <rect width="100%" height="100%" fill="url(#${uid}-bg)" />

  <!-- Ambient Light Orbs -->
  <g id="${uid}-orbs">
${orbsSvg}  </g>

  <!-- Radial Core Glow -->
  <rect width="100%" height="100%" fill="url(#${uid}-radial)" />

  <!-- Technical Grid Overlay -->
  <rect width="100%" height="100%" fill="url(#${uid}-grid)" />

  <!-- Harmonic Contour Waves -->
  <g id="${uid}-waves">
${wavesSvg}  </g>

  <!-- Concentric Security Dial Rings -->
  <g id="${uid}-rings">
${ringsSvg}  </g>

  <!-- Constellation Nodes & Connectors -->
  <g id="${uid}-nodes">
${nodesSvg}  </g>

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
