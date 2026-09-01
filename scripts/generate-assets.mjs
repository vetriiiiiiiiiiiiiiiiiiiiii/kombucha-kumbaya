/**
 * KUMBAYAH — placeholder asset generator
 *
 * Writes art-directed SVG placeholders into /public/assets. Every file is a
 * stand-in for a real photograph or product render at the SAME PATH — drop a
 * .webp/.avif in with the matching name and update the path in /data.
 *
 *   node scripts/generate-assets.mjs
 *
 * Nothing here pretends to be a photograph: placeholders carry crop marks and
 * a mono caption so they are never mistaken for finished art direction.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (p) => {
  const full = join(root, 'public', 'assets', p);
  mkdirSync(dirname(full), { recursive: true });
  return full;
};
const write = (p, svg) => {
  writeFileSync(out(p), svg.trim());
  console.log('  -', p);
};

/* ---------------------------------------------------------------- grain -- */

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

/* --------------------------------------------------------------- bottle -- */

const bottlePath =
  'M148 96 L148 208 C148 246 104 268 104 330 L104 902 C104 936 122 952 156 952 L244 952 C278 952 296 936 296 902 L296 330 C296 268 252 246 252 208 L252 96 Z';

function bottle({ id, accent, deep, flavour }) {
  const ridges = Array.from(
    { length: 11 },
    (_, i) => `<line x1="${146 + i * 11}" y1="56" x2="${146 + i * 11}" y2="100"/>`
  ).join('\n      ');

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 1000" width="400" height="1000" role="img" aria-label="Kumbayah ${flavour} bottle placeholder">
  <defs>
    <linearGradient id="glass-${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.55"/>
      <stop offset="0.18" stop-color="#fff" stop-opacity="0.14"/>
      <stop offset="0.42" stop-color="#fff" stop-opacity="0.03"/>
      <stop offset="0.78" stop-color="#000" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.62"/>
    </linearGradient>
    <linearGradient id="liq-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.95"/>
      <stop offset="0.55" stop-color="${accent}" stop-opacity="0.78"/>
      <stop offset="1" stop-color="${deep}" stop-opacity="0.98"/>
    </linearGradient>
    <radialGradient id="glow-${id}" cx="0.5" cy="0.62" r="0.62">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.42"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="body-${id}"><path d="${bottlePath}"/></clipPath>
    <filter id="soft-${id}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
    <filter id="grain-${id}">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.10"/></feComponentTransfer>
      <feComposite operator="in" in2="SourceGraphic"/>
    </filter>
  </defs>

  <ellipse cx="200" cy="640" rx="190" ry="330" fill="url(#glow-${id})"/>

  <g clip-path="url(#body-${id})">
    <rect x="0" y="0" width="400" height="1000" fill="#100c07"/>
    <path d="M104 372 C140 358 168 384 200 380 C236 376 262 356 296 370 L296 1000 L104 1000 Z" fill="url(#liq-${id})"/>
    <g fill="#fff" opacity="0.5">
      <circle cx="150" cy="520" r="5"/><circle cx="182" cy="612" r="3"/>
      <circle cx="238" cy="480" r="4"/><circle cx="256" cy="700" r="6"/>
      <circle cx="134" cy="760" r="3.5"/><circle cx="204" cy="840" r="4.5"/>
      <circle cx="176" cy="452" r="2.5"/><circle cx="262" cy="580" r="2.5"/>
      <circle cx="216" cy="672" r="2"/><circle cx="146" cy="880" r="2.5"/>
    </g>
    <rect x="0" y="0" width="400" height="1000" fill="url(#glass-${id})"/>
    <rect x="128" y="340" width="14" height="580" rx="7" fill="#fff" opacity="0.20" filter="url(#soft-${id})"/>
    <rect x="272" y="360" width="7" height="520" rx="4" fill="#fff" opacity="0.12" filter="url(#soft-${id})"/>
    <g>
      <rect x="104" y="560" width="192" height="196" fill="#F3EDE1" opacity="0.94"/>
      <rect x="104" y="560" width="192" height="196" fill="none" stroke="${deep}" stroke-opacity="0.25"/>
      <text x="200" y="612" text-anchor="middle" font-family="Georgia, serif" font-size="27" letter-spacing="1.5" fill="#171109">KUMBAYAH</text>
      <line x1="132" y1="628" x2="268" y2="628" stroke="#171109" stroke-opacity="0.35"/>
      <text x="200" y="672" text-anchor="middle" font-family="Menlo, monospace" font-size="17" letter-spacing="3" fill="${deep}">${flavour.toUpperCase()}</text>
      <text x="200" y="712" text-anchor="middle" font-family="Menlo, monospace" font-size="10" letter-spacing="4" fill="#171109" fill-opacity="0.6">FERMENTED 30 DAYS</text>
      <text x="200" y="736" text-anchor="middle" font-family="Menlo, monospace" font-size="10" letter-spacing="4" fill="#171109" fill-opacity="0.6">330 ML</text>
    </g>
    <rect x="0" y="0" width="400" height="1000" filter="url(#grain-${id})" opacity="0.5"/>
  </g>

  <g>
    <rect x="140" y="52" width="120" height="52" rx="6" fill="${deep}"/>
    <rect x="140" y="52" width="120" height="52" rx="6" fill="url(#glass-${id})"/>
    <g stroke="#000" stroke-opacity="0.35">
      ${ridges}
    </g>
    <rect x="140" y="98" width="120" height="10" rx="3" fill="${accent}" opacity="0.55"/>
  </g>

  <path d="${bottlePath}" fill="none" stroke="#fff" stroke-opacity="0.18" stroke-width="1.5"/>
</svg>`;
}

const flavours = [
  { id: 'original', flavour: 'Original', accent: '#CE8C3A', deep: '#2A1A0B' },
  { id: 'mango', flavour: 'Mango', accent: '#F0A028', deep: '#3A2205' },
  { id: 'lychee', flavour: 'Lychee', accent: '#E9A8B6', deep: '#331520' },
  { id: 'berry', flavour: 'Berry', accent: '#A32F51', deep: '#2B0D18' },
  { id: 'nannari', flavour: 'Nannari', accent: '#B2643C', deep: '#2B160B' },
  { id: 'ginger-lime', flavour: 'Ginger Lime', accent: '#A9BE55', deep: '#1E2409' },
];

for (const f of flavours) write(`product/bottle-${f.id}.svg`, bottle(f));

/* ---------------------------------------------------------------- macro -- */

function macro({ id, accent, deep, seed = 3 }) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1500" width="1200" height="1500">
  <defs>
    <filter id="warp-${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="4" seed="${seed}" result="t"/>
      <feDisplacementMap in="SourceGraphic" in2="t" scale="220" xChannelSelector="R" yChannelSelector="G"/>
      <feGaussianBlur stdDeviation="10"/>
    </filter>
    <filter id="g-${id}">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="${seed}"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.16"/></feComponentTransfer>
      <feComposite operator="in" in2="SourceGraphic"/>
    </filter>
    <radialGradient id="b1-${id}" cx="0.4" cy="0.35" r="0.5">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b2-${id}" cx="0.7" cy="0.72" r="0.55">
      <stop offset="0" stop-color="${deep}" stop-opacity="1"/>
      <stop offset="1" stop-color="${deep}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="1500" fill="#0A0705"/>
  <g filter="url(#warp-${id})">
    <rect width="1200" height="1500" fill="url(#b2-${id})"/>
    <ellipse cx="480" cy="520" rx="420" ry="420" fill="url(#b1-${id})"/>
    <ellipse cx="820" cy="1040" rx="360" ry="300" fill="${accent}" opacity="0.35"/>
    <ellipse cx="300" cy="1180" rx="260" ry="220" fill="${deep}" opacity="0.9"/>
  </g>
  <g opacity="0.5" fill="none" stroke="#fff" stroke-opacity="0.16">
    <circle cx="392" cy="640" r="46"/><circle cx="700" cy="430" r="22"/>
    <circle cx="880" cy="760" r="64"/><circle cx="520" cy="980" r="30"/>
    <circle cx="240" cy="380" r="16"/><circle cx="960" cy="1180" r="38"/>
  </g>
  <rect width="1200" height="1500" filter="url(#g-${id})" opacity="0.75"/>
  <rect width="1200" height="1500" fill="url(#b2-${id})" opacity="0.35"/>
</svg>`;
}

flavours.forEach((f, i) => write(`product/macro-${f.id}.svg`, macro({ ...f, seed: i + 2 })));

/* ------------------------------------------------------ ferment stages --- */

const stages = [
  { id: 'tea', accent: '#C9A96A', deep: '#1A1207', freq: '0.004' },
  { id: 'culture', accent: '#D7C08D', deep: '#1E1509', freq: '0.008' },
  { id: 'fermentation', accent: '#C0762A', deep: '#241505', freq: '0.014' },
  { id: 'flavour', accent: '#F0A028', deep: '#2E1A05', freq: '0.022' },
  { id: 'fizz', accent: '#E2A03F', deep: '#120C05', freq: '0.03' },
];

stages.forEach((s, i) => {
  write(
    `texture/stage-${s.id}.svg`,
    `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 1400" width="1400" height="1400">
  <defs>
    <filter id="f-${s.id}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="${s.freq}" numOctaves="5" seed="${i * 7 + 1}" result="t"/>
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.06  0 0 0 0 0.02  1 0 0 0 0"/>
    </filter>
    <radialGradient id="r-${s.id}" cx="0.5" cy="0.5" r="0.62">
      <stop offset="0" stop-color="${s.accent}" stop-opacity="0.7"/>
      <stop offset="0.7" stop-color="${s.deep}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#070504" stop-opacity="1"/>
    </radialGradient>
  </defs>
  <rect width="1400" height="1400" fill="#070504"/>
  <rect width="1400" height="1400" fill="url(#r-${s.id})"/>
  <rect width="1400" height="1400" filter="url(#f-${s.id})" opacity="0.55" style="mix-blend-mode:overlay"/>
</svg>`
  );
});

/* ------------------------------------------------------------ editorial -- */

function editorial({ id, label, ratio, w, h, accent, deep = '#1A1108', seed }) {
  const m = 26;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label} placeholder">
  <defs>
    <linearGradient id="bg-${id}" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="${deep}"/>
      <stop offset="0.55" stop-color="#0C0906"/>
      <stop offset="1" stop-color="#070504"/>
    </linearGradient>
    <radialGradient id="bloom-${id}" cx="0.34" cy="0.3" r="0.6">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="warp-${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.005 0.009" numOctaves="4" seed="${seed}" result="t"/>
      <feDisplacementMap in="SourceGraphic" in2="t" scale="160" xChannelSelector="R" yChannelSelector="G"/>
      <feGaussianBlur stdDeviation="6"/>
    </filter>
    <filter id="gr-${id}">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="${seed}"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.2"/></feComponentTransfer>
      <feComposite operator="in" in2="SourceGraphic"/>
    </filter>
  </defs>

  <rect width="${w}" height="${h}" fill="url(#bg-${id})"/>
  <g filter="url(#warp-${id})" opacity="0.9">
    <rect width="${w}" height="${h}" fill="url(#bloom-${id})"/>
    <ellipse cx="${w * 0.68}" cy="${h * 0.74}" rx="${w * 0.36}" ry="${h * 0.26}" fill="${accent}" opacity="0.16"/>
  </g>

  <g stroke="#F3EDE1" stroke-opacity="0.5" stroke-width="1">
    <path d="M${m} ${m + 34} L${m} ${m} L${m + 34} ${m}"/>
    <path d="M${w - m - 34} ${m} L${w - m} ${m} L${w - m} ${m + 34}"/>
    <path d="M${m} ${h - m - 34} L${m} ${h - m} L${m + 34} ${h - m}"/>
    <path d="M${w - m - 34} ${h - m} L${w - m} ${h - m} L${w - m} ${h - m - 34}"/>
  </g>
  <g stroke="#F3EDE1" stroke-opacity="0.14">
    <line x1="${w / 2}" y1="${h / 2 - 18}" x2="${w / 2}" y2="${h / 2 + 18}"/>
    <line x1="${w / 2 - 18}" y1="${h / 2}" x2="${w / 2 + 18}" y2="${h / 2}"/>
  </g>

  <text x="${m + 8}" y="${h - m - 42}" font-family="Menlo, monospace" font-size="19" letter-spacing="5" fill="#F3EDE1" fill-opacity="0.82">${label.toUpperCase()}</text>
  <text x="${m + 8}" y="${h - m - 16}" font-family="Menlo, monospace" font-size="14" letter-spacing="3.5" fill="#F3EDE1" fill-opacity="0.4">PLACEHOLDER / ${ratio} / REPLACE WITH PHOTOGRAPHY</text>

  <rect width="${w}" height="${h}" filter="url(#gr-${id})" opacity="0.8"/>
</svg>`;
}

const editorials = [
  ['editorial/people-brew.svg', 'Brew room', '3:4', 1000, 1330, '#C0762A'],
  ['editorial/people-bottling.svg', 'Bottling line', '4:5', 1000, 1250, '#CE8C3A'],
  ['editorial/people-ferment.svg', 'Second ferment', '4:5', 1000, 1250, '#F0A028'],
  ['editorial/people-quality.svg', 'Quality bench', '4:5', 1000, 1250, '#B2643C'],
  ['editorial/people-team.svg', 'The team', '3:4', 1000, 1330, '#D7C08D'],
  ['editorial/people-founder.svg', 'The founder', '4:5', 1000, 1250, '#C9A96A'],
  ['editorial/culture-music.svg', 'Music', '3:4', 900, 1200, '#A32F51'],
  ['editorial/culture-music-2.svg', 'Tape night', '1:1', 1000, 1000, '#E9A8B6'],
  ['editorial/culture-food.svg', 'Food', '16:10', 1400, 875, '#F0A028'],
  ['editorial/culture-cafe.svg', 'Cafes', '1:1', 1000, 1000, '#CE8C3A'],
  ['editorial/culture-art.svg', 'Art', '3:4', 900, 1200, '#A9BE55'],
  ['editorial/culture-community.svg', 'Community', '16:10', 1400, 875, '#B2643C'],
  ['editorial/journal-time.svg', 'Why fermentation takes time', '3:2', 1500, 1000, '#C0762A'],
  ['editorial/journal-craft.svg', 'The art of making kombucha', '4:5', 1000, 1250, '#CE8C3A'],
  ['editorial/journal-food.svg', 'Booch and food', '16:9', 1600, 900, '#F0A028'],
  ['editorial/journal-bottle.svg', 'Behind the bottle', '4:5', 1000, 1250, '#E9A8B6'],
  ['editorial/journal-culture.svg', 'Kumbayah culture', '4:5', 1000, 1250, '#A9BE55'],
];

editorials.forEach(([path, label, ratio, w, h, accent], i) =>
  write(path, editorial({ id: `e${i}`, label, ratio, w, h, accent, seed: i + 3 }))
);

/* ---------------------------------------------------------------- packs -- */

function pack({ id, count, accent, deep }) {
  const bottles = Array.from({ length: count }, (_, i) => {
    const x = 100 + i * (500 / Math.max(count, 1));
    const s = 0.42 - (i % 2) * 0.02;
    const y = 200 + (i % 2) * 16;
    return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${1 - (i % 3) * 0.08}">
      <rect x="140" y="60" width="120" height="48" rx="6" fill="${deep}"/>
      <path d="${bottlePath}" fill="url(#pl-${id})" stroke="#fff" stroke-opacity="0.2" stroke-width="2"/>
      <rect x="104" y="560" width="192" height="180" fill="#F3EDE1" opacity="0.9"/>
      <text x="200" y="640" text-anchor="middle" font-family="Georgia, serif" font-size="26" letter-spacing="1" fill="#171109">KUMBAYAH</text>
    </g>`;
  }).join('\n  ');

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <linearGradient id="pl-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.85"/>
      <stop offset="1" stop-color="${deep}"/>
    </linearGradient>
    <radialGradient id="pg-${id}" cx="0.5" cy="0.6" r="0.6">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.28"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="pgr-${id}">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.14"/></feComponentTransfer>
      <feComposite operator="in" in2="SourceGraphic"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="#0A0705"/>
  <ellipse cx="400" cy="520" rx="330" ry="260" fill="url(#pg-${id})"/>
  ${bottles}
  <ellipse cx="400" cy="694" rx="300" ry="26" fill="#000" opacity="0.55"/>
  <rect width="800" height="800" filter="url(#pgr-${id})" opacity="0.7"/>
</svg>`;
}

write('product/pack-single.svg', pack({ id: 'p1', count: 1, accent: '#CE8C3A', deep: '#2A1A0B' }));
write('product/pack-multi.svg', pack({ id: 'p2', count: 4, accent: '#F0A028', deep: '#3A2205' }));
write('product/pack-mixed.svg', pack({ id: 'p3', count: 5, accent: '#A32F51', deep: '#2B0D18' }));
write('product/pack-gift.svg', pack({ id: 'p4', count: 3, accent: '#B2643C', deep: '#2B160B' }));

console.log('\nPlaceholder assets written to /public/assets\n');
