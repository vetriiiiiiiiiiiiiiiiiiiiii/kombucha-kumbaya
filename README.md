# KUMBAYAH — *Let Life Bubble*

A digital experience **concept** for Kumbayah Kombucha, designed and built by
**Lumio Digital**. This is a pitch prototype, not a live commercial site: no
checkout, no analytics, no tracking, and every photograph on the page is an
art-directed placeholder waiting for the real shoot.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

---

## The idea

Kombucha is a living thing that takes thirty days to make. The site is built
around that one fact: it opens on a bottle you can move, spends its second act
on the fermentation itself, and closes by putting the bottle back into the dark.

Colour is rationed. The page is a warm near-black; fruit tones only appear where
a flavour is actually present. Motion is rationed the same way — the site is
mostly still, so that the four or five moments that do move land properly.

**Pacing** (see `app/page.tsx`):

| | Section | Register |
|---|---|---|
| 00 | Loader → Hero | impact |
| 01 | Not soda / not a supplement / something alive | quiet |
| 02 | 30 days of patience | immersion |
| 03–05 | The range → quiz → one bottle in close-up | product |
| 06–08 | The people → culture → the return loop | story |
| 09–10 | Find Kumbayah → journal | utility |
| 11 | Bring some booch home | conversion |
| — | Take a little life with you | quiet |

---

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · GSAP +
ScrollTrigger · Lenis · three.js via React Three Fiber.

- **Tailwind v4** — the whole design system is tokens in `@theme` at the top of
  `app/globals.css`. Colour, type and easing all change from there.
- **GSAP** is registered exactly once, in `lib/gsap.ts`.
- **Lenis** drives smooth scrolling and feeds `ScrollTrigger.update`; it is
  switched off entirely under `prefers-reduced-motion`.
- **three.js** is loaded only by the hero, only on desktop, and only after the
  loader hands over — it is not in the initial bundle.

---

## Structure

```
app/            layout (fonts, metadata), page (the running order), globals.css
components/
  system/       Providers, Loader, SmoothScroll, ExperienceProvider
  ui/           Cursor, MagneticButton, AnimatedText, Figure, BubbleCanvas, …
  navigation/   Nav
  hero/         Hero, BottleScene (R3F canvas), Bottle (geometry + materials)
  statement/ fermentation/ products/ flavour-quiz/ showcase/
  people/ culture/ sustainability/ location/ journal/ commerce/ outro/ footer/
data/           ALL copy and content — no strings live in components
types/          the content model
hooks/          environment queries (reduced motion, pointer, breakpoint)
lib/            gsap registration, small helpers
scripts/        placeholder asset generator
public/assets/  generated placeholders (product / editorial / texture)
```

### Content is data

Every section reads from `/data`. Each file maps one-to-one onto a CMS
collection (`types/index.ts` is effectively the schema):

| File | Collection |
|---|---|
| `products.ts` | Products / flavours |
| `fermentation.ts` | The thirty-day stages |
| `quiz.ts` | Quiz questions, answers, and the weights that pick a bottle |
| `people.ts` | Team frames + founder story |
| `culture.ts` | Culture collage |
| `locations.ts` | Cities and stockists |
| `journal.ts` | Journal posts |
| `packs.ts` | D2C packs |
| `testimonials.ts`, `campaigns.ts`, `sustainability.ts`, `site.ts` | supporting |

The quiz recommendation is a weighted tally held in `data/quiz.ts` — retuning
which answers point at which bottle is a content edit, not a code change.

---

## Replacing the placeholder imagery

**Nothing on this site is a synthetic photograph.** Placeholders are generated
SVG compositions carrying crop marks and a caption so they can never be mistaken
for finished art direction. Portraits in particular are deliberately abstract:
the brief calls for real documentary photography of the real team.

```bash
node scripts/generate-assets.mjs   # regenerate placeholders
```

To drop in real work:

1. Export to `public/assets/…` — `product/` (bottles, packs, macro liquid),
   `editorial/` (people, culture, journal), `texture/` (fermentation stages).
2. Point the `media` path in the relevant `/data` file at the new file.

That is the whole process — no component changes. Crops the layouts expect:

| Slot | Ratio |
|---|---|
| Bottle cut-outs | 2:5 portrait, transparent background |
| Macro liquid | 4:5 |
| People (rail) | 4:5, or 3:4 for `scale: 'lg'` |
| Culture | 3:4 `tall`, 16:10 `wide`, 1:1 `square` |
| Journal | 3:2 lead, 16:9 wide, 4:5 column |

Prefer AVIF/WebP for real photography; the `Figure` component already lazy-loads
and decodes asynchronously.

---

## Motion, and turning it off

`prefers-reduced-motion: reduce` is a first-class path, not an afterthought:

- Lenis is not instantiated; native scrolling is used.
- The loader hands over almost immediately.
- Every GSAP timeline is skipped, and the custom cursor is not rendered.
- **The tall scroll runways collapse.** Sections that exist only to give a
  scrubbed timeline room (hero, statement, fermentation, showcase, people,
  cycle, outro) shrink to their content, and pinned stages become static. The
  reduced-motion site is a well-typeset editorial page, not a long empty one.

## Performance notes

- three.js/drei sit in a lazy chunk behind `next/dynamic`; the hero mounts the
  canvas only on desktop, with a fine pointer, with motion allowed.
- The WebGL loop stops (`frameloop="never"`) once the hero leaves the viewport.
- No HDRI or model files are fetched: the bottle is lathed from a profile array
  and lit by `Lightformer` cards; the label is drawn to a canvas at runtime.
- Bubble fields are 2D canvas, not shaders, and pause via `IntersectionObserver`.
- One shared grain plate for the whole document rather than per-section noise.
- Animation is confined to transform and opacity.

## Accessibility

Semantic sections with labels; the readable string of every split-text headline
lives on `aria-label` while the fragments are `aria-hidden`; the map plate,
quiz, filters and pack selector are all real buttons with keyboard support and
pressed state; focus is visible in the brand palette; the custom cursor never
replaces a real one on touch.

---

## Known scope of the prototype

- Checkout is represented, not implemented — the crate is local state.
- The India plate is an **interpretive drawing**, labelled as such on the page;
  it is not a survey map, and the stockists are realistic but fictional.
- Journal posts have no article routes.
- Flavour copy describes **taste only**. No ingredient lists, nutritional or
  health claims appear anywhere, by design.

---

Concept by **Lumio Digital** — strategy × design × technology × motion.
