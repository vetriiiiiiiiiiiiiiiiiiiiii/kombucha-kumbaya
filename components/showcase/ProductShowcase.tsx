'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/hooks/useEnvironment';
import { SectionMeta } from '@/components/ui/SectionMeta';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { getProduct } from '@/data/products';

const HERO_PRODUCT = getProduct('nannari');

/** Notes placed around the bottle, in fractions of the stage. */
const NOTES = [
  { text: 'Cooling root', x: '12%', y: '22%', align: 'text-left' },
  { text: 'Earthy sweetness', x: '68%', y: '34%', align: 'text-left' },
  { text: 'Soft spice', x: '16%', y: '68%', align: 'text-left' },
  { text: 'Second ferment, day 20', x: '62%', y: '76%', align: 'text-left' },
];

/**
 * One bottle, one long take. The product enters, turns, and the flavour notes
 * arrive around it as the visitor descends. No cards, no grid — this section is
 * the closest the site gets to a film frame.
 */
export function ProductShowcase() {
  const section = useRef<HTMLElement>(null);
  const bottle = useRef<HTMLImageElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLImageElement>(null);
  const notes = useRef<HTMLSpanElement[]>([]);
  const title = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (!section.current || reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.7,
        },
      });

      tl.fromTo(
        bottle.current,
        { yPercent: 26, rotate: -7, scale: 0.86 },
        { yPercent: -8, rotate: 5, scale: 1.04, ease: 'none' },
        0
      )
        .fromTo(glow.current, { scale: 0.7, opacity: 0.35 }, { scale: 1.25, opacity: 0.9, ease: 'none' }, 0)
        .fromTo(backdrop.current, { yPercent: -8, scale: 1.15 }, { yPercent: 8, scale: 1.25, ease: 'none' }, 0)
        .fromTo(title.current, { yPercent: 18, opacity: 0.15 }, { yPercent: -14, opacity: 1, ease: 'none' }, 0);

      // notes arrive one at a time, then hold
      notes.current.forEach((note, i) => {
        tl.fromTo(
          note,
          { opacity: 0, y: 22, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' },
          0.35 + i * 0.16
        );
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={section}
      className={reduced ? 'relative bg-void' : 'relative h-[260svh] bg-void'}
      aria-label={`${HERO_PRODUCT.name} in detail`}
    >
      <div className={reduced ? 'relative h-[100svh] overflow-hidden' : 'sticky top-0 h-[100svh] overflow-hidden'}>
        {/* macro backdrop */}
        <img
          ref={backdrop}
          src={HERO_PRODUCT.media.macro}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/35 to-void" />

        <div
          ref={glow}
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${HERO_PRODUCT.colour.accent}4D 0%, transparent 68%)`,
          }}
        />

        {/* the type sits behind the glass */}
        <h2
          ref={title}
          className="display-tight absolute inset-x-0 top-[22svh] text-center text-[clamp(3rem,17vw,16rem)] leading-[0.8] text-bone/10"
        >
          {HERO_PRODUCT.flavour.toUpperCase()}
        </h2>

        <div className="absolute inset-0 flex items-center justify-center">
          <img
            ref={bottle}
            src={HERO_PRODUCT.media.bottle}
            alt={HERO_PRODUCT.name}
            loading="lazy"
            decoding="async"
            className="h-[62svh] w-auto drop-shadow-[0_50px_90px_rgba(0,0,0,0.75)] will-change-transform"
          />
        </div>

        {/* flavour notes around the bottle */}
        <div className="pointer-events-none absolute inset-0 hidden md:block">
          {NOTES.map((note, i) => (
            <span
              key={note.text}
              ref={(el) => {
                if (el) notes.current[i] = el;
              }}
              className="label absolute flex items-center gap-3 text-bone/80"
              style={{ left: note.x, top: note.y }}
            >
              <span className="block h-px w-8 bg-honey/70" />
              {note.text}
            </span>
          ))}
        </div>

        {/* reading matter */}
        <div className="absolute inset-x-0 bottom-0 gutter pb-[7svh]">
          <SectionMeta
            index="05"
            label="IN DETAIL"
            note={`${HERO_PRODUCT.size} / ${HERO_PRODUCT.serve}`}
          />
          <div className="mt-6 flex flex-wrap items-end justify-between gap-8">
            <p className="serif-note max-w-[30ch] text-[clamp(1.2rem,2vw,1.9rem)] leading-tight text-scoby">
              {HERO_PRODUCT.tagline}
            </p>
            <MagneticButton href="#shop" variant="ghost" cursor="SHOP">
              TRY IT.
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
