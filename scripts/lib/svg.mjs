/**
 * KUMBAYAH — a small vocabulary for drawing with SVG.
 *
 * These are the primitives every generated image is composed from: light,
 * liquid, glass, grain and depth. Keeping them here means an image is written
 * as a short composition rather than three hundred lines of markup.
 *
 * Everything is deterministic — the same seed always draws the same picture,
 * so regenerating assets never produces a spurious diff.
 */

/** Park–Miller PRNG. Deterministic, and good enough for scattering circles. */
export function rng(seed = 1) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const next = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  next.range = (a, b) => a + next() * (b - a);
  next.int = (a, b) => Math.floor(next.range(a, b + 1));
  next.pick = (arr) => arr[Math.floor(next() * arr.length)];
  return next;
}

export const round = (n) => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------ colour */

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const rgba = (hex, a) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${round(a)})`;
};

/** Blend two hex colours. t=0 gives a, t=1 gives b. */
export function mix(a, b, t) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const c = (x, y) => Math.round(x + (y - x) * t);
  return `#${[c(r1, r2), c(g1, g2), c(b1, b2)]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`;
}

/* ------------------------------------------------------------------ filters */

/**
 * Film grain. Applied as its own overlay rect rather than to the artwork, so it
 * never has to re-filter the whole composition.
 */
export const grainFilter = (id, { freq = 0.8, slope = 0.24, octaves = 3, seed = 1 } = {}) => `
  <filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="${seed}"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="${slope}"/></feComponentTransfer>
    <feComposite operator="in" in2="SourceGraphic"/>
  </filter>`;

export const blurFilter = (id, std) => `
  <filter id="${id}" x="-35%" y="-35%" width="170%" height="170%">
    <feGaussianBlur stdDeviation="${std}"/>
  </filter>`;

/** Pushes whatever it is applied to around with noise — liquid, smoke, cloth. */
export const warpFilter = (
  id,
  { freq = '0.006 0.011', octaves = 4, scale = 160, blur = 6, seed = 3 } = {}
) => `
  <filter id="${id}" x="-25%" y="-25%" width="150%" height="150%">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="${seed}" result="t"/>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/>
    ${blur ? `<feGaussianBlur stdDeviation="${blur}"/>` : ''}
  </filter>`;

/**
 * Caustics — the webbing of light that moves across liquid. Turbulence pushed
 * through a steep transfer curve so only the bright ridges survive, then blurred
 * and screened back over the image.
 */
export const causticFilter = (id, { freq = 0.009, octaves = 2, seed = 5, blur = 2.5 } = {}) => `
  <filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="${seed}" result="n"/>
    <feColorMatrix in="n" type="matrix"
      values="0 0 0 0 1  0 0 0 0 0.82  0 0 0 0 0.55  1.6 0 0 0 -0.62"/>
    <feGaussianBlur stdDeviation="${blur}"/>
  </filter>`;

/* --------------------------------------------------------------- materials */

/** Vignette + a slight lift in one corner, so the frame reads as lit. */
export const vignette = (w, h, id, { strength = 0.72, cx = 50, cy = 46 } = {}) => `
  <radialGradient id="${id}" cx="${cx}%" cy="${cy}%" r="72%">
    <stop offset="45%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity="${strength}"/>
  </radialGradient>`;

export const grainOverlay = (w, h, id, opacity = 0.5) =>
  `<rect width="${w}" height="${h}" filter="url(#${id})" opacity="${opacity}" style="mix-blend-mode:overlay"/>`;

/* --------------------------------------------------------------- elements */

/**
 * A field of bubbles at three depths. The far tier is large and soft, the near
 * tier small and crisp — which is what actually sells a macro photograph.
 */
export function bokehField({
  w,
  h,
  prefix,
  colour = '#F5D9A8',
  count = 26,
  seed = 4,
  region = [0, 0, 1, 1],
  maxR = 0.16,
}) {
  const r = rng(seed);
  const [rx, ry, rw, rh] = region;
  const tiers = [
    { blur: `${prefix}-bk-far`, alpha: 0.16, scale: 1, ring: 0.35 },
    { blur: `${prefix}-bk-mid`, alpha: 0.3, scale: 0.55, ring: 0.6 },
    { blur: null, alpha: 0.5, scale: 0.28, ring: 1 },
  ];

  const parts = tiers.map((tier, ti) => {
    const n = Math.round(count / (ti + 1.2));
    const circles = Array.from({ length: n }, () => {
      const cx = round((rx + r() * rw) * w);
      const cy = round((ry + r() * rh) * h);
      const rad = round(Math.min(w, h) * maxR * tier.scale * r.range(0.25, 1));
      const a = round(tier.alpha * r.range(0.45, 1));
      return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="url(#${prefix}-bubble)" opacity="${a}"/>
        <circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${colour}" stroke-opacity="${round(a * tier.ring)}" stroke-width="${round(Math.max(rad * 0.06, 0.7))}"/>`;
    }).join('\n      ');
    return tier.blur
      ? `<g filter="url(#${tier.blur})">${circles}</g>`
      : `<g>${circles}</g>`;
  });

  return parts.join('\n    ');
}

/** The radial gradient a bubble is filled with: dark centre, bright meniscus. */
export const bubbleGradient = (prefix, colour) => `
  <radialGradient id="${prefix}-bubble" cx="38%" cy="34%" r="68%">
    <stop offset="0%" stop-color="${colour}" stop-opacity="0.18"/>
    <stop offset="62%" stop-color="${colour}" stop-opacity="0.05"/>
    <stop offset="88%" stop-color="${colour}" stop-opacity="0.42"/>
    <stop offset="100%" stop-color="${colour}" stop-opacity="0.08"/>
  </radialGradient>`;

/** A shaft of light falling through the frame. */
export function lightShaft({ x, w, h, width = 90, tilt = 10, colour = '#FFE3B0', opacity = 0.18, prefix, i = 0 }) {
  const bottomX = x + tilt;
  return `
  <linearGradient id="${prefix}-shaft-${i}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${colour}" stop-opacity="${opacity}"/>
    <stop offset="55%" stop-color="${colour}" stop-opacity="${round(opacity * 0.45)}"/>
    <stop offset="100%" stop-color="${colour}" stop-opacity="0"/>
  </linearGradient>
  <path d="M${x - width / 2} 0 L${x + width / 2} 0 L${bottomX + width * 1.15} ${h} L${bottomX - width * 1.15} ${h} Z"
        fill="url(#${prefix}-shaft-${i})"/>`;
}

/** Dust or steam caught in the light. */
export function motes({ w, h, count = 60, seed = 9, colour = '#FFE9C9', maxR = 2.6 }) {
  const r = rng(seed);
  return Array.from({ length: count }, () => {
    const cx = round(r() * w);
    const cy = round(r() * h);
    const rad = round(r.range(0.5, maxR));
    return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${colour}" opacity="${round(r.range(0.08, 0.45))}"/>`;
  }).join('');
}

/** The Kumbayah bottle silhouette, in the shared 400x1000 profile space. */
export const BOTTLE_PATH =
  'M148 96 L148 208 C148 246 104 268 104 330 L104 902 C104 936 122 952 156 952 ' +
  'L244 952 C278 952 296 936 296 902 L296 330 C296 268 252 246 252 208 L252 96 Z';

/** One bottle placed in a scene: silhouette, rim light, cap. */
export function bottleSilhouette({ x, y, scale = 1, fill, rim = '#FFE3B0', rimOpacity = 0.5, opacity = 1 }) {
  return `
  <g transform="translate(${round(x)} ${round(y)}) scale(${round(scale)})" opacity="${round(opacity)}">
    <rect x="140" y="52" width="120" height="54" rx="8" fill="${fill}"/>
    <path d="${BOTTLE_PATH}" fill="${fill}"/>
    <path d="${BOTTLE_PATH}" fill="none" stroke="${rim}" stroke-opacity="${rimOpacity}" stroke-width="7"/>
  </g>`;
}

/** Condensation on cold glass. */
export function condensation({ w, h, count = 90, seed = 21, colour = '#FFFFFF' }) {
  const r = rng(seed);
  return Array.from({ length: count }, () => {
    const cx = round(r() * w);
    const cy = round(r() * h);
    const rad = round(r.range(1, 6));
    const a = round(r.range(0.06, 0.3));
    return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${colour}" opacity="${a}"/>
      <circle cx="${round(cx - rad * 0.3)}" cy="${round(cy - rad * 0.32)}" r="${round(rad * 0.34)}" fill="${colour}" opacity="${round(a * 2)}"/>`;
  }).join('');
}

/** Concentric rings — records, ripples, the mouth of a vessel. */
export function rings({ cx, cy, from, to, count, colour, opacity = 0.3, width = 1, seed = 3 }) {
  const r = rng(seed);
  return Array.from({ length: count }, (_, i) => {
    const rad = from + ((to - from) * i) / (count - 1);
    return `<circle cx="${cx}" cy="${cy}" r="${round(rad)}" fill="none" stroke="${colour}" stroke-opacity="${round(opacity * r.range(0.5, 1))}" stroke-width="${round(width * r.range(0.6, 1.4))}"/>`;
  }).join('');
}

/* ------------------------------------------------------- lit objects ----
 * A flat near-black fill reads as a hole punched in the picture, not as a
 * thing sitting in a room. Everything below is shaded: a gradient body, a lit
 * rim, a specular streak and a cast shadow. That is the whole difference
 * between "silhouette" and "photograph".
 * ----------------------------------------------------------------------- */

/** Gradients shared by every vessel and mini-bottle in one file. */
export const objectDefs = (p, accent, deep) => `
  <linearGradient id="${p}-obj" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${mix(deep, '#000000', 0.55)}"/>
    <stop offset="16%" stop-color="${mix(deep, '#FFFFFF', 0.16)}"/>
    <stop offset="46%" stop-color="${mix(deep, '#000000', 0.2)}"/>
    <stop offset="82%" stop-color="${mix(deep, '#FFFFFF', 0.07)}"/>
    <stop offset="100%" stop-color="${mix(deep, '#000000', 0.62)}"/>
  </linearGradient>
  <linearGradient id="${p}-fill" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${mix(accent, '#FFFFFF', 0.4)}"/>
    <stop offset="35%" stop-color="${accent}"/>
    <stop offset="100%" stop-color="${mix(accent, deep, 0.7)}"/>
  </linearGradient>`;

/**
 * A tumbler on a surface: liquid, meniscus, rim light, specular, shadow.
 * Used wherever a scene needs people without depicting them.
 */
export function glassVessel({ p, x, y, w, h, light, fillLevel = 0.55, opacity = 1, blurId = null }) {
  const taper = w * 0.08;
  const body = `M${round(x - w / 2)} ${round(y - h)}
    L${round(x + w / 2)} ${round(y - h)}
    L${round(x + w / 2 - taper)} ${round(y)}
    L${round(x - w / 2 + taper)} ${round(y)} Z`;
  const ly = y - h * fillLevel;
  const lw = w - (taper * 2 * (1 - fillLevel));
  const liquid = `M${round(x - lw / 2)} ${round(ly)}
    L${round(x + lw / 2)} ${round(ly)}
    L${round(x + w / 2 - taper)} ${round(y)}
    L${round(x - w / 2 + taper)} ${round(y)} Z`;

  const g = `
    <ellipse cx="${round(x)}" cy="${round(y + h * 0.04)}" rx="${round(w * 0.66)}" ry="${round(h * 0.07)}" fill="#000" opacity="0.6"/>
    <path d="${body}" fill="url(#${p}-obj)"/>
    <path d="${liquid}" fill="url(#${p}-fill)" opacity="0.9"/>
    <ellipse cx="${round(x)}" cy="${round(ly)}" rx="${round(lw / 2)}" ry="${round(w * 0.09)}" fill="${light}" opacity="0.5"/>
    <ellipse cx="${round(x)}" cy="${round(y - h)}" rx="${round(w / 2)}" ry="${round(w * 0.1)}" fill="none" stroke="${light}" stroke-opacity="0.75" stroke-width="${round(Math.max(w * 0.022, 1))}"/>
    <rect x="${round(x - w * 0.36)}" y="${round(y - h * 0.92)}" width="${round(w * 0.07)}" height="${round(h * 0.82)}" rx="${round(w * 0.035)}" fill="#FFF" opacity="0.3"/>
    <path d="${body}" fill="none" stroke="${light}" stroke-opacity="0.35" stroke-width="${round(Math.max(w * 0.014, 0.8))}"/>`;

  const wrapped = `<g opacity="${round(opacity)}">${g}</g>`;
  return blurId ? `<g filter="url(#${blurId})">${wrapped}</g>` : wrapped;
}

/** The bottle, shaded, at any size. Liquid follows the body, so no clip path. */
export function miniBottle({ p, x, y, scale = 1, light, opacity = 1, label = true, blurId = null }) {
  const LIQUID =
    'M104 392 L104 902 C104 936 122 952 156 952 L244 952 C278 952 296 936 296 902 L296 392 Z';

  const g = `
  <g transform="translate(${round(x)} ${round(y)}) scale(${round(scale)})" opacity="${round(opacity)}">
    <ellipse cx="200" cy="968" rx="132" ry="17" fill="#000" opacity="0.62"/>
    <path d="${BOTTLE_PATH}" fill="url(#${p}-obj)"/>
    <path d="${LIQUID}" fill="url(#${p}-fill)" opacity="0.92"/>
    <ellipse cx="200" cy="392" rx="96" ry="12" fill="${light}" opacity="0.45"/>
    <rect x="140" y="52" width="120" height="54" rx="8" fill="url(#${p}-obj)"/>
    <rect x="140" y="52" width="120" height="12" rx="6" fill="${light}" opacity="0.3"/>
    ${
      label
        ? `<rect x="104" y="556" width="192" height="196" fill="#EFE7D7" opacity="0.93"/>
           <text x="200" y="628" text-anchor="middle" font-family="Georgia, serif" font-size="30" letter-spacing="1.4" fill="#171109">KUMBAYAH</text>
           <line x1="136" y1="652" x2="264" y2="652" stroke="#171109" stroke-opacity="0.3" stroke-width="2"/>`
        : ''
    }
    <rect x="126" y="336" width="16" height="576" rx="8" fill="#FFF" opacity="0.26"/>
    <path d="${BOTTLE_PATH}" fill="none" stroke="${light}" stroke-opacity="0.6" stroke-width="6"/>
  </g>`;

  return blurId ? `<g filter="url(#${blurId})">${g}</g>` : g;
}

/** A plate or cup seen from directly above. */
export function plate({ p, x, y, r, light, accent, opacity = 1 }) {
  return `
  <g opacity="${round(opacity)}">
    <ellipse cx="${round(x + r * 0.06)}" cy="${round(y + r * 0.08)}" rx="${round(r)}" ry="${round(r)}" fill="#000" opacity="0.5"/>
    <circle cx="${round(x)}" cy="${round(y)}" r="${round(r)}" fill="url(#${p}-obj)"/>
    <circle cx="${round(x)}" cy="${round(y)}" r="${round(r)}" fill="none" stroke="${light}" stroke-opacity="0.6" stroke-width="${round(Math.max(r * 0.035, 1))}"/>
    <circle cx="${round(x)}" cy="${round(y)}" r="${round(r * 0.66)}" fill="${accent}" opacity="0.4"/>
    <circle cx="${round(x)}" cy="${round(y)}" r="${round(r * 0.66)}" fill="none" stroke="${light}" stroke-opacity="0.3"/>
    <path d="M${round(x - r * 0.6)} ${round(y - r * 0.5)} A ${round(r * 0.8)} ${round(r * 0.8)} 0 0 1 ${round(x + r * 0.1)} ${round(y - r * 0.75)}"
          fill="none" stroke="#FFF" stroke-opacity="0.32" stroke-width="${round(Math.max(r * 0.05, 1))}"/>
  </g>`;
}

/** Wrap a finished composition. */
export const svg = (w, h, body, label = '') => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"${
  label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'
}>
${body}
</svg>`.trim();
