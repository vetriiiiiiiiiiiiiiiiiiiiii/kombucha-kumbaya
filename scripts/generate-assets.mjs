/**
 * KUMBAYAH — image generator
 *
 * Draws every visual on the site: bottle renders, macro liquid, fermentation
 * textures, editorial scenes and pack shots. Output is generative artwork, not
 * imitation photography — abstractions of light, glass and liquid that hold the
 * art direction until the real shoot happens.
 *
 *   node scripts/generate-assets.mjs
 *
 * Nothing here depicts a person. The frames in the People section are rooms,
 * vessels and light; portraits are for a camera, not for a script.
 *
 * Deterministic: same seeds, same files, no spurious diffs.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  rng,
  round,
  rgba,
  mix,
  grainFilter,
  blurFilter,
  warpFilter,
  causticFilter,
  vignette,
  grainOverlay,
  bokehField,
  bubbleGradient,
  lightShaft,
  motes,
  bottleSilhouette,
  condensation,
  rings,
  objectDefs,
  glassVessel,
  miniBottle,
  plate,
  svg,
  BOTTLE_PATH,
} from './lib/svg.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const write = (p, content) => {
  const full = join(root, 'public', 'assets', p);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content.trim());
  const kb = (Buffer.byteLength(content) / 1024).toFixed(0);
  console.log(`  - ${p}  ${kb}kb`);
};

const VOID = '#070504';
const INK = '#0C0906';

const FLAVOURS = [
  { id: 'original', name: 'Original', accent: '#CE8C3A', deep: '#2A1A0B', seed: 11 },
  { id: 'mango', name: 'Mango', accent: '#F0A028', deep: '#3A2205', seed: 23 },
  { id: 'lychee', name: 'Lychee', accent: '#E9A8B6', deep: '#331520', seed: 37 },
  { id: 'berry', name: 'Berry', accent: '#A32F51', deep: '#2B0D18', seed: 41 },
  { id: 'nannari', name: 'Nannari', accent: '#B2643C', deep: '#2B160B', seed: 53 },
  { id: 'ginger-lime', name: 'Ginger Lime', accent: '#A9BE55', deep: '#1E2409', seed: 67 },
];

/* ========================================================== BOTTLE RENDERS */

function bottleRender({ id, name, accent, deep, seed }) {
  const p = `b-${id}`;
  const W = 460;
  const H = 1120;

  return svg(
    W,
    H,
    `
  <defs>
    ${bubbleGradient(p, '#FFF3DC')}
    ${blurFilter(`${p}-soft`, 16)}
    ${blurFilter(`${p}-bk-far`, 9)}
    ${blurFilter(`${p}-bk-mid`, 3.4)}
    ${grainFilter(`${p}-grain`, { slope: 0.13, seed })}

    <linearGradient id="${p}-glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000" stop-opacity="0.62"/>
      <stop offset="9%" stop-color="#FFF" stop-opacity="0.10"/>
      <stop offset="20%" stop-color="#FFF" stop-opacity="0.22"/>
      <stop offset="38%" stop-color="#FFF" stop-opacity="0.03"/>
      <stop offset="62%" stop-color="#000" stop-opacity="0.18"/>
      <stop offset="84%" stop-color="#FFF" stop-opacity="0.13"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.68"/>
    </linearGradient>

    <linearGradient id="${p}-liquid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${mix(accent, '#FFFFFF', 0.32)}"/>
      <stop offset="26%" stop-color="${accent}"/>
      <stop offset="72%" stop-color="${mix(accent, deep, 0.55)}"/>
      <stop offset="100%" stop-color="${deep}"/>
    </linearGradient>

    <radialGradient id="${p}-halo" cx="50%" cy="58%" r="56%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.5"/>
      <stop offset="60%" stop-color="${accent}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="${p}-cap" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${mix(deep, '#000000', 0.4)}"/>
      <stop offset="26%" stop-color="${mix(deep, '#FFFFFF', 0.34)}"/>
      <stop offset="55%" stop-color="${deep}"/>
      <stop offset="100%" stop-color="${mix(deep, '#000000', 0.5)}"/>
    </linearGradient>

    <clipPath id="${p}-body"><path d="${BOTTLE_PATH}"/></clipPath>
  </defs>

  <g transform="translate(30 40)">
    <ellipse cx="200" cy="640" rx="215" ry="360" fill="url(#${p}-halo)"/>

    <g clip-path="url(#${p}-body)">
      <rect x="0" y="0" width="400" height="1000" fill="${INK}"/>

      <!-- liquid, with a meniscus that is not quite level -->
      <path d="M104 366 C142 350 170 380 200 376 C238 371 262 352 296 364 L296 1000 L104 1000 Z"
            fill="url(#${p}-liquid)"/>
      <ellipse cx="200" cy="370" rx="98" ry="13" fill="${mix(accent, '#FFFFFF', 0.55)}" opacity="0.45"/>

      <!-- backlight through the liquid -->
      <ellipse cx="200" cy="700" rx="70" ry="240" fill="${mix(accent, '#FFFFFF', 0.6)}" opacity="0.22" filter="url(#${p}-soft)"/>

      <!-- fizz -->
      ${bokehField({ w: 400, h: 1000, prefix: p, colour: '#FFF3DC', count: 30, seed: seed + 3, region: [0.1, 0.38, 0.8, 0.6], maxR: 0.05 })}

      <!-- glass shading over everything inside -->
      <rect width="400" height="1000" fill="url(#${p}-glass)"/>

      <!-- specular -->
      <rect x="122" y="330" width="17" height="580" rx="9" fill="#FFF" opacity="0.30" filter="url(#${p}-soft)"/>
      <rect x="150" y="352" width="5" height="520" rx="3" fill="#FFF" opacity="0.35"/>
      <rect x="272" y="360" width="9" height="500" rx="5" fill="#FFF" opacity="0.14" filter="url(#${p}-soft)"/>

      <!-- label -->
      <g>
        <rect x="104" y="556" width="192" height="206" fill="#EFE7D7"/>
        <rect x="104" y="556" width="192" height="206" fill="url(#${p}-glass)" opacity="0.5"/>
        <text x="200" y="612" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="27" letter-spacing="1.4" fill="#171109">KUMBAYAH</text>
        <line x1="134" y1="630" x2="266" y2="630" stroke="#171109" stroke-opacity="0.32"/>
        <text x="200" y="672" text-anchor="middle" font-family="Menlo, monospace" font-size="16" letter-spacing="3" fill="${mix(deep, '#000000', 0.2)}">${name.toUpperCase()}</text>
        <text x="200" y="712" text-anchor="middle" font-family="Menlo, monospace" font-size="9.5" letter-spacing="3.6" fill="#171109" fill-opacity="0.55">FERMENTED 30 DAYS</text>
        <text x="200" y="736" text-anchor="middle" font-family="Menlo, monospace" font-size="9.5" letter-spacing="3.6" fill="#171109" fill-opacity="0.55">330 ML</text>
      </g>

      <!-- cold glass -->
      <g opacity="0.5">${condensation({ w: 400, h: 1000, count: 70, seed: seed + 9 })}</g>
      <rect width="400" height="1000" filter="url(#${p}-grain)" opacity="0.5"/>
    </g>

    <!-- crown cap -->
    <g>
      <rect x="140" y="50" width="120" height="56" rx="7" fill="url(#${p}-cap)"/>
      <g stroke="#000" stroke-opacity="0.32" stroke-width="1.2">
        ${Array.from({ length: 13 }, (_, i) => `<line x1="${144 + i * 9.6}" y1="54" x2="${144 + i * 9.6}" y2="102"/>`).join('')}
      </g>
      <rect x="140" y="50" width="120" height="12" rx="6" fill="#FFF" opacity="0.18"/>
      <rect x="138" y="99" width="124" height="11" rx="5" fill="${accent}" opacity="0.6"/>
    </g>

    <path d="${BOTTLE_PATH}" fill="none" stroke="#FFF" stroke-opacity="0.22" stroke-width="1.6"/>

    <!-- it sits on something -->
    <ellipse cx="200" cy="962" rx="150" ry="20" fill="#000" opacity="0.55" filter="url(#${p}-soft)"/>
    <ellipse cx="200" cy="958" rx="96" ry="10" fill="${accent}" opacity="0.3" filter="url(#${p}-soft)"/>
  </g>`,
    `Kumbayah ${name}`
  );
}

/* ============================================================ MACRO LIQUID */

/**
 * Caustics drawn as explicit curves. The filter-based version alone reads as
 * haze; actual strokes give the image edges to hold on to.
 */
function causticStreaks({ w, h, colour, seed, count = 14 }) {
  const r = rng(seed);
  return Array.from({ length: count }, () => {
    const x = r.range(-w * 0.1, w * 1.1);
    const y = r.range(-h * 0.05, h * 1.05);
    const len = r.range(w * 0.12, w * 0.5);
    const bow = r.range(-h * 0.14, h * 0.14);
    return `<path d="M${round(x)} ${round(y)} Q${round(x + len / 2)} ${round(y + bow)} ${round(x + len)} ${round(y + bow * 0.3)}"
      fill="none" stroke="${colour}" stroke-opacity="${round(r.range(0.08, 0.42))}"
      stroke-width="${round(r.range(1, 7))}" stroke-linecap="round"/>`;
  }).join('');
}

/** Bubbles with a hard meniscus — the detail that reads as "photographed". */
function crispBubbles({ w, h, colour, seed, count = 30 }) {
  const r = rng(seed);
  return Array.from({ length: count }, () => {
    const cx = round(r.range(0, w));
    const cy = round(r.range(0, h));
    const rad = round(r.range(Math.min(w, h) * 0.008, Math.min(w, h) * 0.055));
    const a = round(r.range(0.25, 0.85));
    return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${colour}" stroke-opacity="${a}" stroke-width="${round(Math.max(rad * 0.13, 1))}"/>
      <circle cx="${round(cx - rad * 0.3)}" cy="${round(cy - rad * 0.34)}" r="${round(rad * 0.2)}" fill="#FFFFFF" opacity="${round(a * 0.8)}"/>
      <path d="M${round(cx - rad * 0.72)} ${round(cy + rad * 0.36)} A ${rad} ${rad} 0 0 0 ${round(cx + rad * 0.36)} ${round(cy + rad * 0.72)}"
        fill="none" stroke="${colour}" stroke-opacity="${round(a * 0.5)}" stroke-width="${round(Math.max(rad * 0.09, 0.6))}"/>`;
  }).join('');
}

function macroLiquid({ id, name, accent, deep, seed }) {
  const p = `m-${id}`;
  const W = 1200;
  const H = 1500;
  const light = mix(accent, '#FFFFFF', 0.45);

  return svg(
    W,
    H,
    `
  <defs>
    ${bubbleGradient(p, light)}
    ${blurFilter(`${p}-bk-far`, 26)}
    ${blurFilter(`${p}-bk-mid`, 8)}
    ${blurFilter(`${p}-soft`, 40)}
    ${warpFilter(`${p}-warp`, { scale: 120, blur: 2, seed })}
    ${causticFilter(`${p}-caustic`, { freq: 0.0075, seed: seed + 2, blur: 3 })}
    ${grainFilter(`${p}-grain`, { slope: 0.2, seed: seed + 5 })}
    ${vignette(W, H, `${p}-vig`, { strength: 0.8, cy: 42 })}

    <linearGradient id="${p}-base" x1="0.15" y1="0" x2="0.85" y2="1">
      <stop offset="0%" stop-color="${mix(accent, deep, 0.35)}"/>
      <stop offset="48%" stop-color="${deep}"/>
      <stop offset="100%" stop-color="${VOID}"/>
    </linearGradient>
    <radialGradient id="${p}-core" cx="40%" cy="34%" r="52%">
      <stop offset="0%" stop-color="${light}" stop-opacity="0.9"/>
      <stop offset="42%" stop-color="${accent}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#${p}-base)"/>

  <!-- backlight behind the glass -->
  <ellipse cx="${W * 0.44}" cy="${H * 0.34}" rx="${W * 0.4}" ry="${H * 0.3}" fill="url(#${p}-core)" opacity="0.85"/>

  <!-- the liquid body. Only lightly warped: heavy blur turned this into smoke. -->
  <g filter="url(#${p}-warp)" opacity="0.75">
    <ellipse cx="${W * 0.74}" cy="${H * 0.74}" rx="${W * 0.36}" ry="${H * 0.26}" fill="${deep}"/>
    <ellipse cx="${W * 0.18}" cy="${H * 0.84}" rx="${W * 0.32}" ry="${H * 0.22}" fill="${VOID}"/>
  </g>

  <!-- caustic webbing, drawn rather than filtered so it survives as structure -->
  <g style="mix-blend-mode:screen" opacity="0.55">
    ${causticStreaks({ w: W, h: H, colour: light, seed: seed + 7, count: 16 })}
  </g>
  <g style="mix-blend-mode:screen" opacity="0.3">
    <rect width="${W}" height="${H}" filter="url(#${p}-caustic)"/>
  </g>

  <!-- the fizz itself: crisp rings at the front, soft orbs behind -->
  ${bokehField({ w: W, h: H, prefix: p, colour: light, count: 46, seed: seed + 1, maxR: 0.1 })}
  ${crispBubbles({ w: W, h: H, colour: light, seed: seed + 11, count: 34 })}

  <!-- a hard break of light across the top -->
  <ellipse cx="${W * 0.32}" cy="${H * 0.16}" rx="${W * 0.24}" ry="${H * 0.07}" fill="${light}" opacity="0.3" filter="url(#${p}-soft)"/>

  <rect width="${W}" height="${H}" fill="url(#${p}-vig)"/>
  ${grainOverlay(W, H, `${p}-grain`, 0.6)}`,
    `${name} kombucha, macro`
  );
}

/* ================================================== FERMENTATION TEXTURES */

function fermentTexture({ id, accent, deep, seed, turbulence, bubbles }) {
  const p = `f-${id}`;
  const S = 1400;
  const light = mix(accent, '#FFFFFF', 0.4);
  const r = rng(seed);

  // The culture: irregular concentric marbling across the surface.
  const marbling = Array.from({ length: 22 }, (_, i) => {
    const rad = 90 + i * 26 * r.range(0.85, 1.15);
    return `<circle cx="${round(700 + r.range(-30, 30))}" cy="${round(700 + r.range(-30, 30))}" r="${round(rad)}"
      fill="none" stroke="${i % 3 === 0 ? light : accent}" stroke-opacity="${round(r.range(0.06, 0.26))}"
      stroke-width="${round(r.range(1, 9))}"/>`;
  }).join('');

  return svg(
    S,
    S,
    `
  <defs>
    ${bubbleGradient(p, light)}
    ${blurFilter(`${p}-bk-far`, 22)}
    ${blurFilter(`${p}-bk-mid`, 7)}
    ${warpFilter(`${p}-warp`, { freq: `${turbulence} ${turbulence * 1.6}`, scale: 210, blur: 4, seed })}
    ${causticFilter(`${p}-caustic`, { freq: turbulence * 1.4, seed: seed + 4, blur: 2 })}
    ${grainFilter(`${p}-grain`, { slope: 0.22, seed: seed + 8 })}
    ${vignette(S, S, `${p}-vig`, { strength: 0.85 })}
    <radialGradient id="${p}-well" cx="50%" cy="48%" r="62%">
      <stop offset="0%" stop-color="${light}" stop-opacity="0.55"/>
      <stop offset="38%" stop-color="${accent}" stop-opacity="0.42"/>
      <stop offset="78%" stop-color="${deep}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${VOID}"/>
    </radialGradient>
  </defs>

  <rect width="${S}" height="${S}" fill="${VOID}"/>
  <rect width="${S}" height="${S}" fill="url(#${p}-well)"/>

  <g filter="url(#${p}-warp)" opacity="0.85">${marbling}</g>

  <g style="mix-blend-mode:screen" opacity="0.42">
    <rect width="${S}" height="${S}" filter="url(#${p}-caustic)"/>
  </g>

  ${bokehField({ w: S, h: S, prefix: p, colour: light, count: bubbles, seed: seed + 6, maxR: 0.1 })}

  <rect width="${S}" height="${S}" fill="url(#${p}-vig)"/>
  ${grainOverlay(S, S, `${p}-grain`, 0.6)}`
  );
}

/* ========================================================= EDITORIAL SCENES
 * Rooms, vessels and light. No people are depicted anywhere.
 * ======================================================================== */

/** Steel tanks under high windows — the brew room. */
function sceneBrewRoom({ prefix: p, w: W, h: H, accent, seed }) {
  const r = rng(seed);
  const light = mix(accent, '#FFFFFF', 0.5);
  const tanks = Array.from({ length: 5 }, (_, i) => {
    const tw = W * r.range(0.13, 0.2);
    const x = W * (0.06 + i * 0.2);
    const th = H * r.range(0.42, 0.6);
    const y = H - th - H * 0.12;
    return `
    <g>
      <rect x="${round(x)}" y="${round(y)}" width="${round(tw)}" height="${round(th)}" rx="${round(tw * 0.12)}" fill="#15100A"/>
      <rect x="${round(x)}" y="${round(y)}" width="${round(tw * 0.16)}" height="${round(th)}" rx="${round(tw * 0.08)}" fill="${light}" opacity="0.16"/>
      <rect x="${round(x + tw * 0.8)}" y="${round(y)}" width="${round(tw * 0.07)}" height="${round(th)}" fill="${light}" opacity="0.08"/>
      <ellipse cx="${round(x + tw / 2)}" cy="${round(y)}" rx="${round(tw / 2)}" ry="${round(tw * 0.1)}" fill="#1D160D"/>
      <ellipse cx="${round(x + tw / 2)}" cy="${round(y)}" rx="${round(tw / 2)}" ry="${round(tw * 0.1)}" fill="none" stroke="${light}" stroke-opacity="0.3"/>
    </g>`;
  }).join('');

  return `
  <rect width="${W}" height="${H}" fill="${VOID}"/>
  <rect width="${W}" height="${H}" fill="url(#${p}-room)"/>
  ${lightShaft({ x: W * 0.22, w: W, h: H, width: W * 0.11, tilt: W * 0.07, prefix: p, i: 0, opacity: 0.2 })}
  ${lightShaft({ x: W * 0.56, w: W, h: H, width: W * 0.14, tilt: W * 0.09, prefix: p, i: 1, opacity: 0.15 })}
  ${lightShaft({ x: W * 0.86, w: W, h: H, width: W * 0.09, tilt: W * 0.05, prefix: p, i: 2, opacity: 0.1 })}
  ${tanks}
  <rect y="${round(H * 0.88)}" width="${W}" height="${round(H * 0.12)}" fill="#0A0705"/>
  <rect y="${round(H * 0.88)}" width="${W}" height="${round(H * 0.12)}" fill="${light}" opacity="0.05"/>
  <g filter="url(#${p}-bk-mid)">${motes({ w: W, h: H * 0.8, count: 70, seed: seed + 2, colour: light })}</g>`;
}

/** A line of backlit bottles, shallow depth of field. */
function sceneBottlingLine({ prefix: p, w: W, h: H, accent, seed }) {
  const light = mix(accent, '#FFFFFF', 0.4);
  const scale = (H * 0.5) / 1000;
  const row = Array.from({ length: 7 }, (_, i) =>
    miniBottle({
      p,
      x: W * 0.02 + i * W * 0.16 - 200 * scale,
      y: H * 0.3,
      scale,
      light,
      label: i % 2 === 0,
    })
  ).join('');

  const far = Array.from({ length: 5 }, (_, i) =>
    miniBottle({
      p,
      x: W * 0.1 + i * W * 0.21 - 200 * scale * 0.7,
      y: H * 0.16,
      scale: scale * 0.7,
      light,
      opacity: 0.7,
      label: false,
    })
  ).join('');

  return `
  <rect width="${W}" height="${H}" fill="${VOID}"/>
  <rect width="${W}" height="${H}" fill="url(#${p}-room)"/>
  <ellipse cx="${W * 0.5}" cy="${H * 0.42}" rx="${W * 0.5}" ry="${H * 0.3}" fill="${accent}" opacity="0.2" filter="url(#${p}-soft)"/>
  <g filter="url(#${p}-bk-mid)" opacity="0.7">${far}</g>
  ${row}
  <rect y="${round(H * 0.8)}" width="${W}" height="${round(H * 0.2)}" fill="#080604" opacity="0.9"/>
  <g filter="url(#${p}-bk-far)">${motes({ w: W, h: H, count: 40, seed: seed + 3, colour: light, maxR: 5 })}</g>`;
}

/** The culture itself, seen from directly above. */
function sceneCultureDisc({ prefix: p, w: W, h: H, accent, seed }) {
  const light = mix(accent, '#FFFFFF', 0.5);
  const cx = W / 2;
  const cy = H / 2;
  const rad = Math.min(W, H) * 0.4;
  return `
  <rect width="${W}" height="${H}" fill="${VOID}"/>
  <rect width="${W}" height="${H}" fill="url(#${p}-room)"/>
  <circle cx="${cx}" cy="${cy}" r="${round(rad * 1.12)}" fill="#130E08"/>
  <g filter="url(#${p}-warp)">
    <circle cx="${cx}" cy="${cy}" r="${round(rad)}" fill="${accent}" opacity="0.5"/>
    ${rings({ cx, cy, from: rad * 0.12, to: rad, count: 16, colour: light, opacity: 0.3, width: 4, seed })}
  </g>
  <circle cx="${cx}" cy="${cy}" r="${round(rad * 1.12)}" fill="none" stroke="${light}" stroke-opacity="0.35" stroke-width="2"/>
  ${bokehField({ w: W, h: H, prefix: p, colour: light, count: 26, seed: seed + 4, region: [0.22, 0.22, 0.56, 0.56], maxR: 0.06 })}
  <g style="mix-blend-mode:screen" opacity="0.35"><rect width="${W}" height="${H}" filter="url(#${p}-caustic)"/></g>`;
}

/** One bottle in a hard beam — the quality bench. */
function sceneSpotlit({ prefix: p, w: W, h: H, accent, seed, jar = false }) {
  const light = mix(accent, '#FFFFFF', 0.45);
  const scale = (H * 0.52) / 1000;
  return `
  <rect width="${W}" height="${H}" fill="${VOID}"/>
  ${lightShaft({ x: W * 0.5, w: W, h: H, width: W * 0.3, tilt: 0, prefix: p, i: 0, opacity: 0.22, colour: light })}
  <ellipse cx="${W * 0.5}" cy="${H * 0.55}" rx="${W * 0.3}" ry="${H * 0.22}" fill="${accent}" opacity="0.18" filter="url(#${p}-soft)"/>
  ${
    jar
      ? `<g transform="translate(${round(W * 0.5 - W * 0.16)} ${round(H * 0.34)})">
           <rect width="${round(W * 0.32)}" height="${round(H * 0.34)}" rx="${round(W * 0.04)}" fill="#120D08" stroke="${light}" stroke-opacity="0.5" stroke-width="2"/>
           <rect x="${round(W * 0.02)}" y="${round(H * 0.12)}" width="${round(W * 0.28)}" height="${round(H * 0.2)}" rx="${round(W * 0.03)}" fill="${accent}" opacity="0.55"/>
           <ellipse cx="${round(W * 0.16)}" cy="${round(H * 0.12)}" rx="${round(W * 0.14)}" ry="${round(H * 0.016)}" fill="${light}" opacity="0.4"/>
         </g>`
      : miniBottle({ p, x: W * 0.5 - 200 * scale, y: H * 0.22, scale, light })
  }
  <ellipse cx="${W * 0.5}" cy="${H * 0.79}" rx="${W * 0.26}" ry="${H * 0.02}" fill="#000" opacity="0.7" filter="url(#${p}-bk-mid)"/>
  <g filter="url(#${p}-bk-far)">${motes({ w: W, h: H, count: 34, seed: seed + 5, colour: light, maxR: 4 })}</g>`;
}

/**
 * A counter in a dark room — glasses caught in warm light. This is how the
 * site shows cafés, music nights and gatherings: by the glassware people leave
 * behind, rather than by inventing faces for them.
 */
function sceneWarmRoom({ prefix: p, w: W, h: H, accent, seed, count = 9 }) {
  const r = rng(seed);
  const light = mix(accent, '#FFFFFF', 0.45);
  const unit = Math.min(W, H);
  const counterY = H * 0.74;

  // Back row sits higher and blurred; front row is crisp. That is the depth.
  const back = Array.from({ length: Math.max(2, Math.round(count * 0.4)) }, (_, i) => {
    const x = W * (0.12 + (i + r.range(-0.05, 0.05)) * (0.76 / Math.max(count * 0.4, 1)));
    const w = unit * r.range(0.055, 0.075);
    return glassVessel({
      p,
      x,
      y: counterY - H * 0.1,
      w,
      h: w * r.range(1.5, 2.3),
      light,
      fillLevel: r.range(0.4, 0.7),
      opacity: 0.7,
      blurId: `${p}-bk-mid`,
    });
  }).join('');

  const front = Array.from({ length: count }, (_, i) => {
    const x = W * (0.08 + (i + r.range(-0.12, 0.12)) * (0.84 / Math.max(count - 1, 1)));
    const w = unit * r.range(0.07, 0.11);
    return glassVessel({
      p,
      x,
      y: counterY + r.range(-H * 0.02, H * 0.02),
      w,
      h: w * r.range(1.5, 2.4),
      light,
      fillLevel: r.range(0.35, 0.78),
    });
  }).join('');

  return `
  <rect width="${W}" height="${H}" fill="${VOID}"/>
  <rect width="${W}" height="${H}" fill="url(#${p}-room)"/>
  <ellipse cx="${W * 0.5}" cy="${H * 0.34}" rx="${W * 0.46}" ry="${H * 0.3}" fill="${accent}" opacity="0.32" filter="url(#${p}-soft)"/>
  ${lightShaft({ x: W * 0.34, w: W, h: H, width: W * 0.2, tilt: W * 0.04, prefix: p, i: 0, opacity: 0.16, colour: light })}
  ${lightShaft({ x: W * 0.74, w: W, h: H, width: W * 0.12, tilt: -W * 0.03, prefix: p, i: 1, opacity: 0.1, colour: light })}
  ${back}
  <rect y="${round(counterY)}" width="${W}" height="${round(H - counterY)}" fill="#0A0705"/>
  <rect y="${round(counterY)}" width="${W}" height="${round(H * 0.012)}" fill="${light}" opacity="0.22"/>
  ${front}
  <g filter="url(#${p}-bk-mid)">${motes({ w: W, h: counterY, count: 46, seed: seed + 7, colour: light })}</g>`;
}

/** Grooves — a record, or the rings of a long ferment. */
function sceneGrooves({ prefix: p, w: W, h: H, accent, seed }) {
  const light = mix(accent, '#FFFFFF', 0.5);
  const cx = W / 2;
  const cy = H / 2;
  const rad = Math.min(W, H) * 0.44;
  return `
  <rect width="${W}" height="${H}" fill="${VOID}"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${W * 0.6}" ry="${H * 0.5}" fill="${accent}" opacity="0.14" filter="url(#${p}-soft)"/>
  <circle cx="${cx}" cy="${cy}" r="${round(rad)}" fill="#0B0806"/>
  ${rings({ cx, cy, from: rad * 0.2, to: rad * 0.98, count: 42, colour: light, opacity: 0.22, width: 1.4, seed })}
  <circle cx="${cx}" cy="${cy}" r="${round(rad * 0.16)}" fill="${accent}" opacity="0.8"/>
  <circle cx="${cx}" cy="${cy}" r="${round(rad * 0.04)}" fill="${VOID}"/>
  <path d="M${cx - rad} ${cy - rad * 0.5} A${rad} ${rad} 0 0 1 ${cx + rad * 0.6} ${cy - rad * 0.8}"
        fill="none" stroke="${light}" stroke-opacity="0.3" stroke-width="2"/>
  <g filter="url(#${p}-bk-mid)">${motes({ w: W, h: H, count: 30, seed: seed + 2, colour: light })}</g>`;
}

/** A table seen from above — plates, glasses, a shared meal. */
function sceneTable({ prefix: p, w: W, h: H, accent, seed }) {
  const r = rng(seed);
  const light = mix(accent, '#FFFFFF', 0.42);
  // Plates and cups, lit from one side, with the bottle standing among them.
  const items = Array.from({ length: 9 }, () =>
    plate({
      p,
      x: r.range(W * 0.08, W * 0.9),
      y: r.range(H * 0.16, H * 0.86),
      r: r.range(Math.min(W, H) * 0.055, Math.min(W, H) * 0.15),
      light,
      accent,
      opacity: r.range(0.75, 1),
    })
  ).join('');

  const scale = (H * 0.42) / 1000;
  return `
  <rect width="${W}" height="${H}" fill="${VOID}"/>
  <rect width="${W}" height="${H}" fill="url(#${p}-room)"/>
  <ellipse cx="${W * 0.4}" cy="${H * 0.4}" rx="${W * 0.46}" ry="${H * 0.46}" fill="${accent}" opacity="0.22" filter="url(#${p}-soft)"/>
  ${items}
  ${miniBottle({ p, x: W * 0.7, y: H * 0.16, scale, light, label: false })}
  <g filter="url(#${p}-bk-far)">${motes({ w: W, h: H, count: 30, seed: seed + 4, colour: light })}</g>`;
}

/** Brush strokes — the painted label series. */
function sceneStrokes({ prefix: p, w: W, h: H, accent, seed }) {
  const r = rng(seed);
  const light = mix(accent, '#FFFFFF', 0.4);
  const strokes = Array.from({ length: 9 }, (_, i) => {
    const y = H * (0.1 + i * 0.09) + r.range(-20, 20);
    const x1 = W * r.range(0.04, 0.24);
    const x2 = W * r.range(0.62, 0.97);
    const width = r.range(6, 46);
    return `<path d="M${round(x1)} ${round(y)} C${round(W * 0.4)} ${round(y + r.range(-60, 60))}, ${round(W * 0.6)} ${round(y + r.range(-60, 60))}, ${round(x2)} ${round(y)}"
      fill="none" stroke="${i % 3 === 0 ? light : accent}" stroke-opacity="${round(r.range(0.2, 0.7))}"
      stroke-width="${round(width)}" stroke-linecap="round"/>`;
  }).join('');

  return `
  <rect width="${W}" height="${H}" fill="${VOID}"/>
  <rect width="${W}" height="${H}" fill="url(#${p}-room)"/>
  <g filter="url(#${p}-warp)">${strokes}</g>
  <g opacity="0.5">${strokes}</g>
  <g filter="url(#${p}-bk-mid)">${motes({ w: W, h: H, count: 26, seed: seed + 6, colour: light })}</g>`;
}

/** A long exposure — time, drawn as an arc of marks. */
function sceneExposure({ prefix: p, w: W, h: H, accent, seed }) {
  const light = mix(accent, '#FFFFFF', 0.5);
  const cx = W * 0.5;
  const cy = H * 1.05;
  const rad = Math.min(W, H) * 0.86;
  const r = rng(seed);

  // Thirty marks along the arc — one per day, brightening as the brew matures.
  const marks = Array.from({ length: 30 }, (_, i) => {
    const t = i / 29;
    const a = Math.PI * (1.06 + t * 0.88);
    const major = i % 5 === 0;
    const len = major ? 62 : 26;
    const x1 = cx + Math.cos(a) * rad;
    const y1 = cy + Math.sin(a) * rad;
    const x2 = cx + Math.cos(a) * (rad + len);
    const y2 = cy + Math.sin(a) * (rad + len);
    const glow = 0.18 + t * 0.72;
    const lx = cx + Math.cos(a) * (rad + len + 30);
    const ly = cy + Math.sin(a) * (rad + len + 30);
    return `<line x1="${round(x1)}" y1="${round(y1)}" x2="${round(x2)}" y2="${round(y2)}"
        stroke="${major ? light : accent}" stroke-opacity="${round(major ? glow : glow * 0.6)}" stroke-width="${major ? 4 : 2}" stroke-linecap="round"/>
      ${
        major
          ? `<text x="${round(lx)}" y="${round(ly)}" text-anchor="middle" dominant-baseline="middle"
              font-family="Menlo, monospace" font-size="${round(Math.min(W, H) * 0.026)}" letter-spacing="2"
              fill="${light}" fill-opacity="${round(glow)}">${String(i).padStart(2, '0')}</text>`
          : ''
      }`;
  }).join('');

  // The trail itself: the exposure, burning brighter toward day thirty.
  const trail = Array.from({ length: 5 }, (_, i) => {
    const w = 26 - i * 5;
    return `<path d="M${round(cx + Math.cos(Math.PI * 1.06) * rad)} ${round(cy + Math.sin(Math.PI * 1.06) * rad)}
      A ${round(rad)} ${round(rad)} 0 0 1 ${round(cx + Math.cos(Math.PI * 1.94) * rad)} ${round(cy + Math.sin(Math.PI * 1.94) * rad)}"
      fill="none" stroke="url(#${p}-trail)" stroke-opacity="${round(0.16 + i * 0.13)}" stroke-width="${w}" stroke-linecap="round"/>`;
  }).join('');

  return `
  <defs>
    <linearGradient id="${p}-trail" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.1"/>
      <stop offset="55%" stop-color="${accent}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${light}" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${VOID}"/>
  <rect width="${W}" height="${H}" fill="url(#${p}-room)"/>
  <ellipse cx="${round(cx + rad * 0.72)}" cy="${round(H * 0.62)}" rx="${W * 0.34}" ry="${H * 0.34}" fill="${accent}" opacity="0.28" filter="url(#${p}-soft)"/>
  <g filter="url(#${p}-bk-mid)" opacity="0.6">${trail}</g>
  ${trail}
  ${marks}
  ${bokehField({ w: W, h: H, prefix: p, colour: light, count: 26, seed: seed + 3, region: [0, 0, 1, 0.62], maxR: 0.09 })}
  <g filter="url(#${p}-bk-far)">${motes({ w: W, h: H * 0.8, count: 40, seed: seed + 9, colour: light })}</g>`;
}

/** A technical drawing of the bottle — for the design journal entry. */
function sceneTechnical({ prefix: p, w: W, h: H, accent, seed }) {
  const light = mix(accent, '#FFFFFF', 0.55);
  const scale = (H * 0.66) / 1000;
  const bx = W * 0.5 - 200 * scale;
  const by = H * 0.17;
  const callouts = [
    [0.3, 0.26],
    [0.72, 0.4],
    [0.28, 0.62],
    [0.74, 0.75],
  ]
    .map(([x, y]) => {
      const px = W * x;
      const py = H * y;
      const toX = W * 0.5 + (x < 0.5 ? -40 : 40);
      return `<line x1="${round(px)}" y1="${round(py)}" x2="${round(toX)}" y2="${round(py)}" stroke="${light}" stroke-opacity="0.5" stroke-width="1"/>
        <circle cx="${round(px)}" cy="${round(py)}" r="3.5" fill="${light}" opacity="0.85"/>`;
    })
    .join('');

  return `
  <rect width="${W}" height="${H}" fill="${VOID}"/>
  <rect width="${W}" height="${H}" fill="url(#${p}-room)"/>
  <g stroke="${light}" stroke-opacity="0.09" stroke-width="1">
    ${Array.from({ length: 14 }, (_, i) => `<line x1="0" y1="${round((H / 14) * i)}" x2="${W}" y2="${round((H / 14) * i)}"/>`).join('')}
    ${Array.from({ length: 10 }, (_, i) => `<line x1="${round((W / 10) * i)}" y1="0" x2="${round((W / 10) * i)}" y2="${H}"/>`).join('')}
  </g>
  <g transform="translate(${round(bx)} ${round(by)}) scale(${round(scale)})">
    <path d="${BOTTLE_PATH}" fill="${accent}" fill-opacity="0.08" stroke="${light}" stroke-opacity="0.8" stroke-width="4"/>
    <rect x="140" y="52" width="120" height="54" rx="8" fill="none" stroke="${light}" stroke-opacity="0.8" stroke-width="4"/>
    <rect x="104" y="556" width="192" height="206" fill="none" stroke="${light}" stroke-opacity="0.45" stroke-width="3" stroke-dasharray="14 10"/>
    <line x1="200" y1="96" x2="200" y2="952" stroke="${light}" stroke-opacity="0.25" stroke-width="2" stroke-dasharray="18 14"/>
  </g>
  ${callouts}`;
}

/* ---------------------------------------------------- editorial assembler */

function editorial({ file, label, w, h, accent, seed, scene, extra = {} }) {
  const p = `e${seed}`;
  const body = scene({ prefix: p, w, h, accent, seed, ...extra });

  return write(
    file,
    svg(
      w,
      h,
      `
  <defs>
    ${bubbleGradient(p, mix(accent, '#FFFFFF', 0.5))}
    ${blurFilter(`${p}-bk-far`, Math.max(w, h) * 0.02)}
    ${blurFilter(`${p}-bk-mid`, Math.max(w, h) * 0.006)}
    ${blurFilter(`${p}-soft`, Math.max(w, h) * 0.05)}
    ${warpFilter(`${p}-warp`, { scale: 120, blur: 4, seed })}
    ${causticFilter(`${p}-caustic`, { freq: 0.01, seed: seed + 1, blur: 2 })}
    ${grainFilter(`${p}-grain`, { slope: 0.22, seed: seed + 3 })}
    ${vignette(w, h, `${p}-vig`, { strength: 0.78 })}
    ${objectDefs(p, accent, mix(accent, VOID, 0.6))}
    <linearGradient id="${p}-room" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="${mix(accent, VOID, 0.82)}"/>
      <stop offset="55%" stop-color="${INK}"/>
      <stop offset="100%" stop-color="${VOID}"/>
    </linearGradient>
  </defs>
  ${body}
  <rect width="${w}" height="${h}" fill="url(#${p}-vig)"/>
  ${grainOverlay(w, h, `${p}-grain`, 0.6)}`,
      label
    )
  );
}

/* ==================================================================== PACKS */

function packShot({ id, count, accent, deep, seed }) {
  const p = `p-${id}`;
  const S = 900;
  const light = mix(accent, '#FFFFFF', 0.4);
  const scale = 0.44;
  const spread = Math.min(count, 6);

  const bottles = Array.from({ length: spread }, (_, i) => {
    const centred = i - (spread - 1) / 2;
    const x = S / 2 + centred * (S * 0.115) - 200 * scale;
    const depth = Math.abs(centred) / Math.max(spread, 1);
    return miniBottle({
      p,
      x,
      y: S * 0.2 + depth * 14,
      scale: scale * (1 - depth * 0.06),
      light,
      opacity: 1 - depth * 0.1,
    });
  }).join('');

  return svg(
    S,
    S,
    `
  <defs>
    ${blurFilter(`${p}-soft`, 30)}
    ${blurFilter(`${p}-bk-mid`, 7)}
    ${grainFilter(`${p}-grain`, { slope: 0.16, seed })}
    ${vignette(S, S, `${p}-vig`, { strength: 0.7, cy: 52 })}
    <radialGradient id="${p}-halo" cx="50%" cy="58%" r="55%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    ${objectDefs(p, accent, deep)}
    <linearGradient id="${p}-ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${deep}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${VOID}"/>
    </linearGradient>
  </defs>

  <rect width="${S}" height="${S}" fill="${VOID}"/>
  <ellipse cx="${S / 2}" cy="${S * 0.55}" rx="${S * 0.44}" ry="${S * 0.36}" fill="url(#${p}-halo)"/>
  <rect y="${S * 0.72}" width="${S}" height="${S * 0.28}" fill="url(#${p}-ground)"/>
  ${bottles}
  <ellipse cx="${S / 2}" cy="${S * 0.735}" rx="${S * 0.34}" ry="${S * 0.028}" fill="#000" opacity="0.7" filter="url(#${p}-bk-mid)"/>
  <g filter="url(#${p}-bk-mid)" opacity="0.7">${motes({ w: S, h: S, count: 26, seed: seed + 2, colour: light })}</g>
  <rect width="${S}" height="${S}" fill="url(#${p}-vig)"/>
  ${grainOverlay(S, S, `${p}-grain`, 0.5)}`
  );
}

/* =================================================================== BUILD */

console.log('\nKumbayah — generating imagery\n');

write(
  'texture/grain.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260">
  <filter id="n" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect width="260" height="260" filter="url(#n)" opacity="0.9"/>
</svg>`
);

for (const f of FLAVOURS) {
  write(`product/bottle-${f.id}.svg`, bottleRender(f));
  write(`product/macro-${f.id}.svg`, macroLiquid(f));
}

const STAGES = [
  { id: 'tea', accent: '#C9A96A', deep: '#1A1207', seed: 71, turbulence: 0.004, bubbles: 8 },
  { id: 'culture', accent: '#D7C08D', deep: '#1E1509', seed: 83, turbulence: 0.007, bubbles: 16 },
  { id: 'fermentation', accent: '#C0762A', deep: '#241505', seed: 97, turbulence: 0.012, bubbles: 30 },
  { id: 'flavour', accent: '#F0A028', deep: '#2E1A05', seed: 109, turbulence: 0.018, bubbles: 44 },
  { id: 'fizz', accent: '#E2A03F', deep: '#120C05', seed: 127, turbulence: 0.026, bubbles: 62 },
];
for (const s of STAGES) write(`texture/stage-${s.id}.svg`, fermentTexture(s));

const EDITORIAL = [
  ['editorial/people-brew.svg', 'The brew room', 1000, 1330, '#C0762A', 131, sceneBrewRoom],
  ['editorial/people-bottling.svg', 'The bottling line', 1000, 1250, '#CE8C3A', 137, sceneBottlingLine],
  ['editorial/people-ferment.svg', 'The second ferment', 1000, 1250, '#F0A028', 139, sceneCultureDisc],
  ['editorial/people-quality.svg', 'The quality bench', 1000, 1250, '#B2643C', 149, sceneSpotlit],
  ['editorial/people-team.svg', 'The brew room floor', 1000, 1330, '#D7C08D', 151, sceneWarmRoom, { count: 12 }],
  ['editorial/people-founder.svg', 'The first jar', 1000, 1250, '#C9A96A', 157, sceneSpotlit, { jar: true }],
  ['editorial/culture-music.svg', 'Music', 900, 1200, '#A32F51', 163, sceneWarmRoom, { count: 7 }],
  ['editorial/culture-music-2.svg', 'Tape night', 1000, 1000, '#E9A8B6', 167, sceneGrooves],
  ['editorial/culture-food.svg', 'Food', 1400, 875, '#F0A028', 173, sceneTable],
  ['editorial/culture-cafe.svg', 'Cafes', 1000, 1000, '#CE8C3A', 179, sceneWarmRoom, { count: 10 }],
  ['editorial/culture-art.svg', 'Art', 900, 1200, '#A9BE55', 181, sceneStrokes],
  ['editorial/culture-community.svg', 'Community', 1400, 875, '#B2643C', 191, sceneWarmRoom, { count: 14 }],
  ['editorial/journal-time.svg', 'Why fermentation takes time', 1500, 1000, '#C0762A', 193, sceneExposure],
  ['editorial/journal-craft.svg', 'The art of making kombucha', 1000, 1250, '#CE8C3A', 197, sceneCultureDisc],
  ['editorial/journal-food.svg', 'Booch and food', 1600, 900, '#F0A028', 199, sceneTable],
  ['editorial/journal-bottle.svg', 'Behind the bottle', 1000, 1250, '#E9A8B6', 211, sceneTechnical],
  ['editorial/journal-culture.svg', 'Kumbayah culture', 1000, 1250, '#A9BE55', 223, sceneWarmRoom, { count: 11 }],
];

for (const [file, label, w, h, accent, seed, scene, extra] of EDITORIAL) {
  editorial({ file, label, w, h, accent, seed, scene, extra });
}

write('product/pack-single.svg', packShot({ id: 'p1', count: 1, accent: '#CE8C3A', deep: '#2A1A0B', seed: 227 }));
write('product/pack-multi.svg', packShot({ id: 'p2', count: 5, accent: '#F0A028', deep: '#3A2205', seed: 229 }));
write('product/pack-mixed.svg', packShot({ id: 'p3', count: 6, accent: '#A32F51', deep: '#2B0D18', seed: 233 }));
write('product/pack-gift.svg', packShot({ id: 'p4', count: 4, accent: '#B2643C', deep: '#2B160B', seed: 239 }));

console.log('\nDone.\n');
