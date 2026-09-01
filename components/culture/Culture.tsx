'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/hooks/useEnvironment';
import { SectionMeta } from '@/components/ui/SectionMeta';
import { Marquee } from '@/components/ui/Marquee';
import { cultureItems } from '@/data/culture';
import { testimonials } from '@/data/testimonials';
import { cn } from '@/lib/utils';

/** Collage geometry — deliberately uneven, so no two frames line up. */
const SPAN: Record<string, string> = {
  tall: 'w-[70vw] sm:w-[22rem] aspect-[3/4] mt-0',
  wide: 'w-[86vw] sm:w-[34rem] aspect-[16/10] mt-[8vh]',
  square: 'w-[62vw] sm:w-[19rem] aspect-square mt-[18vh]',
};

/**
 * CULTURE — the brand outside the bottle.
 *
 * An editorial collage on a horizontal rail: frames sit at different heights,
 * type overlaps image, and nothing is boxed in a card. The categories run as a
 * ticker underneath so the section reads as a scene rather than a gallery.
 */
export function Culture() {
  const section = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (!section.current || reduced) return;

    const ctx = gsap.context(() => {
      // Each frame drifts at its own rate — depth without a parallax library.
      gsap.utils.toArray<HTMLElement>('[data-drift]').forEach((el, i) => {
        gsap.fromTo(
          el,
          { yPercent: 6 + (i % 3) * 4 },
          {
            yPercent: -6 - (i % 3) * 4,
            ease: 'none',
            scrollTrigger: {
              trigger: section.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={section} id="culture" className="relative bg-ink py-[13svh]" aria-label="Culture">
      <div className="gutter">
        <SectionMeta index="07" label="CULTURE" note="Music, food, cafés, art, community." />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <h2 className="display-tight max-w-[14ch] text-[clamp(2.4rem,7.5vw,7rem)] text-bone">
            A DRINK IS
            <br />
            NEVER JUST
            <br />
            A DRINK.
          </h2>
          <p className="serif-note max-w-[26ch] text-[1.3rem] leading-tight text-muted">
            Kumbayah turns up wherever people gather — on a table, on a counter,
            beside a record player.
          </p>
        </div>
      </div>

      {/* the collage */}
      <div
        ref={rail}
        className="no-bar mt-16 flex items-start gap-8 overflow-x-auto px-[clamp(1.25rem,4vw,4.5rem)] pb-14 sm:gap-14"
      >
        {cultureItems.map((item, i) => (
          <figure
            key={item.id}
            data-drift
            data-cursor="LOOK"
            className={cn('group relative shrink-0', SPAN[item.span])}
          >
            <div className="relative h-full w-full overflow-hidden bg-soil">
              <img
                src={item.media}
                alt={`${item.category} — ${item.title}`}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent" />
            </div>

            {/* type overlapping the frame, not sitting under it */}
            <figcaption className="absolute -bottom-6 left-0 right-0 flex items-end justify-between gap-4 px-1">
              <span className="display text-[clamp(1.1rem,1.7vw,1.5rem)] leading-none text-bone drop-shadow-[0_4px_18px_rgba(0,0,0,0.9)]">
                {item.category}
              </span>
              <span className="label-sm text-muted/70">
                {item.place} / {item.year}
              </span>
            </figcaption>

            <p className="absolute -top-7 left-0 max-w-[24ch] text-[0.85rem] text-muted">
              {String(i + 1).padStart(2, '0')} — {item.title}
            </p>
          </figure>
        ))}
      </div>

      <div className="label border-y border-hairline py-5 text-muted/70">
        <Marquee
          items={['MUSIC', 'FOOD', 'CAFÉS', 'ART', 'COMMUNITY', 'LET LIFE BUBBLE']}
          duration={42}
        />
      </div>

      {/* voices */}
      <div className="gutter pt-14">
        <div className="grid gap-10 md:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote key={t.id} className="border-t border-hairline pt-6">
              <p className="serif-note text-[1.45rem] leading-tight text-scoby">“{t.quote}”</p>
              <footer className="label-sm mt-5 text-muted/60">
                {t.author} / {t.context}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
