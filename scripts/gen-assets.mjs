import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../assets');

// ── Soccer ball helper ────────────────────────────────────────────────────────
// Generates a pentagon path centered at (cx,cy), circumradius r, first vertex at rotationDeg
function pent(cx, cy, r, rotDeg) {
  const pts = Array.from({ length: 5 }, (_, k) => {
    const a = (rotDeg + k * 72) * (Math.PI / 180);
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  });
  return `M ${pts.join(' L ')} Z`;
}

// Classic Telstar-style ball: 1 center pentagon + 5 ring pentagons, clipped to circle
// cx,cy = ball center; R = ball radius
function soccerBall(cx, cy, R) {
  const pr = R * 0.285;       // pentagon circumradius (~43 for R=150)
  const dist = R * 0.725;     // center-to-ring distance
  const clipId = `ballClip_${cx}`;

  // Ring placement angles & each pentagon's own rotation
  const placements = [
    { angle: -54, rot: 126 },
    { angle:  18, rot: 198 },
    { angle:  90, rot: -90 },
    { angle: 162, rot: 342 },
    { angle: 234, rot:  54 },
  ];

  const centerPath = pent(cx, cy, pr, -90);

  const ringPaths = placements.map(({ angle, rot }) => {
    const rad = angle * (Math.PI / 180);
    return pent(cx + dist * Math.cos(rad), cy + dist * Math.sin(rad), pr, rot);
  });

  return `
  <defs>
    <clipPath id="${clipId}">
      <circle cx="${cx}" cy="${cy}" r="${R}"/>
    </clipPath>
  </defs>
  <!-- Ball base -->
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="#F7F7F7" stroke="#111" stroke-width="${R * 0.022}"/>
  <!-- Patches clipped to ball -->
  <g clip-path="url(#${clipId})" fill="#111111" stroke="#111" stroke-width="${R * 0.012}" stroke-linejoin="round">
    <path d="${centerPath}"/>
    ${ringPaths.map(p => `<path d="${p}"/>`).join('\n    ')}
  </g>
  <!-- Ball rim for depth -->
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#111" stroke-width="${R * 0.022}"/>`;
}

// ── Icon SVG (1024×1024) ──────────────────────────────────────────────────────
const iconSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0B1E4A"/>
      <stop offset="100%" stop-color="#1540A0"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#D8E8FF"/>
    </linearGradient>
    <filter id="cardShadow" x="-15%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="14" stdDeviation="22" flood-color="#000" flood-opacity="0.55"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#bg)"/>

  <!-- Subtle rings -->
  <circle cx="512" cy="512" r="420" fill="none" stroke="#FFF" stroke-width="1" opacity="0.05"/>
  <circle cx="512" cy="512" r="510" fill="none" stroke="#FFF" stroke-width="1" opacity="0.04"/>

  <!-- Card shadow (tilted back card) -->
  <g transform="translate(258,178) rotate(-6,254,330)" opacity="0.45">
    <rect width="508" height="664" rx="30" fill="#0A1840"/>
  </g>

  <!-- Main card -->
  <g transform="translate(258,178)" filter="url(#cardShadow)">
    <rect width="508" height="664" rx="30" fill="url(#cardGrad)"/>

    <!-- Top bar -->
    <rect width="508" height="86" rx="30" fill="#1B4FD8"/>
    <rect y="58" width="508" height="28" fill="#1B4FD8"/>
    <text x="254" y="55" text-anchor="middle"
          font-family="Arial Black, Arial Bold, sans-serif"
          font-size="32" font-weight="900" fill="#FFF" letter-spacing="5">ÁLBUM</text>

    <!-- Soccer ball (center 254,344 relative to card = absolute 512,522) -->
    ${soccerBall(254, 352, 144).replace(/url\(#ballClip_254\)/g, 'url(#ballClip_254)')}

    <!-- 2026 badge -->
    <rect x="84" y="542" width="340" height="66" rx="14" fill="#1B4FD8"/>
    <text x="254" y="587" text-anchor="middle"
          font-family="Arial Black, Arial Bold, sans-serif"
          font-size="36" font-weight="900" fill="#FFF" letter-spacing="3">2026</text>
  </g>

  <!-- Stars above card -->
  <text x="322" y="172" font-size="48" fill="#FBBF24">★</text>
  <text x="414" y="158" font-size="48" fill="#F59E0B">★</text>
  <text x="488" y="152" font-size="48" fill="#FBBF24">★</text>
  <text x="562" y="158" font-size="48" fill="#FBBF24">★</text>
  <text x="648" y="172" font-size="48" fill="#FBBF24">★</text>
</svg>`;

// ── Adaptive icon foreground (1024×1024, transparent bg) ─────────────────────
const adaptiveSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#D0E2FF"/>
    </linearGradient>
    <filter id="sh">
      <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Back card tilt -->
  <g transform="translate(178,142) rotate(-5,332,370)" opacity="0.35">
    <rect width="668" height="740" rx="40" fill="#0D2060"/>
  </g>

  <!-- Main card -->
  <g transform="translate(178,142)" filter="url(#sh)">
    <rect width="668" height="740" rx="40" fill="url(#cg)"/>

    <!-- Top bar -->
    <rect width="668" height="108" rx="40" fill="#1B4FD8"/>
    <rect y="72" width="668" height="36" fill="#1B4FD8"/>
    <text x="334" y="70" text-anchor="middle"
          font-family="Arial Black, Arial Bold, sans-serif"
          font-size="42" font-weight="900" fill="#FFF" letter-spacing="5">ÁLBUM</text>

    <!-- Ball centered on card -->
    ${soccerBall(334, 420, 180)}

    <!-- 2026 badge -->
    <rect x="104" y="642" width="460" height="76" rx="16" fill="#1B4FD8"/>
    <text x="334" y="695" text-anchor="middle"
          font-family="Arial Black, Arial Bold, sans-serif"
          font-size="44" font-weight="900" fill="#FFF" letter-spacing="3">2026</text>
  </g>

  <!-- Stars -->
  <text x="308" y="136" font-size="58" fill="#FBBF24">★</text>
  <text x="400" y="118" font-size="58" fill="#F59E0B">★</text>
  <text x="483" y="112" font-size="58" fill="#FBBF24">★</text>
  <text x="566" y="118" font-size="58" fill="#FBBF24">★</text>
  <text x="652" y="136" font-size="58" fill="#FBBF24">★</text>
</svg>`;

// ── Splash (1284×2778) ────────────────────────────────────────────────────────
const splashSvg = `<svg width="1284" height="2778" viewBox="0 0 1284 2778" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#070C18"/>
      <stop offset="50%" stop-color="#0D1530"/>
      <stop offset="100%" stop-color="#070C18"/>
    </linearGradient>
    <linearGradient id="scg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#C8DCFF"/>
    </linearGradient>
    <filter id="ssh" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="24" stdDeviation="36" flood-color="#000" flood-opacity="0.65"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1284" height="2778" fill="url(#sbg)"/>

  <!-- Glow blob -->
  <ellipse cx="642" cy="1280" rx="460" ry="380" fill="#1B4FD8" opacity="0.06"/>

  <!-- Decorative rings -->
  <circle cx="642" cy="1389" r="600" fill="none" stroke="#FFF" stroke-width="1" opacity="0.04"/>
  <circle cx="642" cy="1389" r="750" fill="none" stroke="#FFF" stroke-width="1" opacity="0.03"/>

  <!-- Back card -->
  <g transform="translate(172,760) rotate(-4,470,560)" opacity="0.45">
    <rect width="940" height="1080" rx="56" fill="#0A1840"/>
  </g>

  <!-- Main card -->
  <g transform="translate(172,760)" filter="url(#ssh)">
    <rect width="940" height="1080" rx="56" fill="url(#scg)"/>

    <!-- Top bar -->
    <rect width="940" height="136" rx="56" fill="#1B4FD8"/>
    <rect y="92" width="940" height="44" fill="#1B4FD8"/>
    <text x="470" y="88" text-anchor="middle"
          font-family="Arial Black, Arial Bold, sans-serif"
          font-size="58" font-weight="900" fill="#FFF" letter-spacing="7">ÁLBUM</text>

    <!-- Big ball -->
    ${soccerBall(470, 570, 230)}

    <!-- 2026 badge -->
    <rect x="130" y="886" width="680" height="106" rx="22" fill="#1B4FD8"/>
    <text x="470" y="955" text-anchor="middle"
          font-family="Arial Black, Arial Bold, sans-serif"
          font-size="62" font-weight="900" fill="#FFF" letter-spacing="5">2026</text>
  </g>

  <!-- Stars -->
  <text x="362" y="752" font-size="78" fill="#FBBF24">★</text>
  <text x="488" y="726" font-size="78" fill="#F59E0B">★</text>
  <text x="603" y="718" font-size="78" fill="#FBBF24">★</text>
  <text x="718" y="726" font-size="78" fill="#FBBF24">★</text>
  <text x="834" y="752" font-size="78" fill="#FBBF24">★</text>

  <!-- App name -->
  <text x="642" y="1986" text-anchor="middle"
        font-family="Arial Black, Arial Bold, sans-serif"
        font-size="72" font-weight="900" fill="#FFFFFF" letter-spacing="2">FiguCopa</text>
  <text x="642" y="2062" text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="38" fill="#475569" letter-spacing="6">2026</text>
</svg>`;

// ── Render ────────────────────────────────────────────────────────────────────
async function gen(svg, filename, w, h) {
  await sharp(Buffer.from(svg)).resize(w, h).png().toFile(`${OUT}/${filename}`);
  console.log(`✓ ${filename} (${w}×${h})`);
}

await gen(iconSvg,     'icon.png',          1024, 1024);
await gen(adaptiveSvg, 'adaptive-icon.png', 1024, 1024);
await gen(splashSvg,   'splash.png',        1284, 2778);
console.log('\nDone!');
