'use client';

import { useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/hooks/useEnvironment';
import { SectionMeta } from '@/components/ui/SectionMeta';
import { AnimatedText } from '@/components/ui/AnimatedText';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { packs } from '@/data/packs';
import { cn } from '@/lib/utils';

/**
 * BRING SOME BOOCH HOME.
 *
 * The commerce moment, represented rather than implemented: selecting a pack
 * updates the summary and the CTA, and the crate is a local count. Wiring this
 * to a real basket is a matter of swapping the two handlers below.
 */
export function D2C() {
  const section = useRef<HTMLElement>(null);
  const [chosen, setChosen] = useState(packs.find((p) => p.featured)?.id ?? packs[0].id);
  const [crate, setCrate] = useState(0);
  const reduced = useReducedMotion();

  const pack = packs.find((p) => p.id === chosen) ?? packs[0];

  useIsomorphicLayoutEffect(() => {
    if (!section.current || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-pack]',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: section.current, start: 'top 72%', once: true },
        }
      );
    }, section);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={section} id="shop"
      data-chapter="BRING SOME BOOCH HOME" className="relative bg-ink py-[13svh]" aria-label="Shop Kumbayah">
      <div className="gutter">
        <SectionMeta index="11" label="D2C" note="Concept prototype — checkout is represented, not live." />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
          <AnimatedText
            text="BRING SOME BOOCH HOME."
            as="h2"
            mode="chars"
            className="display-tight max-w-[13ch] text-[clamp(2.2rem,7vw,6.5rem)] text-bone"
          />
          <p className="serif-note max-w-[24ch] text-[1.25rem] leading-tight text-muted">
            Delivered cold in returnable glass. Crates come back on the next run.
          </p>
        </div>

        <div className="mt-16 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {packs.map((p) => {
            const on = p.id === chosen;
            return (
              <button
                key={p.id}
                type="button"
                data-pack
                data-cursor="SELECT"
                onClick={() => setChosen(p.id)}
                aria-pressed={on}
                className={cn(
                  'group relative flex flex-col justify-between p-7 text-left transition-colors duration-500',
                  on ? 'bg-soil' : 'bg-ink hover:bg-soil/60'
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="display block text-[1.4rem] text-bone">{p.name}</span>
                    <span className="label-sm mt-2 block text-muted/60">{p.count}</span>
                  </div>
                  {p.featured ? (
                    <span className="label-sm rounded-full border border-honey/40 px-3 py-1.5 text-honey">
                      POPULAR
                    </span>
                  ) : null}
                </div>

                <div className="my-7 flex h-[13rem] items-center justify-center">
                  <img
                    src={p.media}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      'h-full w-auto transition-transform duration-[1.1s] ease-[cubic-bezier(0.16,1,0.3,1)]',
                      on ? 'scale-[1.04]' : 'group-hover:scale-[1.03]'
                    )}
                  />
                </div>

                <div>
                  <p className="min-h-[3.2rem] text-[0.88rem] leading-relaxed text-muted">
                    {p.description}
                  </p>
                  <div className="mt-5 flex items-baseline justify-between border-t border-hairline pt-4">
                    <span className="display text-[1.3rem] text-bone">{p.price}</span>
                    <span
                      className={cn(
                        'label-sm transition-colors',
                        on ? 'text-honey' : 'text-muted/50'
                      )}
                    >
                      {on ? 'SELECTED' : 'SELECT'}
                    </span>
                  </div>
                </div>

                <span
                  aria-hidden
                  className={cn(
                    'absolute inset-x-0 top-0 h-px bg-honey transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    on ? 'w-full' : 'w-0'
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* the crate */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-8 border-t border-hairline pt-10">
          <div>
            <span className="label-sm block text-muted/60">YOUR CRATE</span>
            <p className="mt-3 max-w-[40ch] text-[1.05rem] text-bone">
              {pack.name} — {pack.count}
              <span className="text-muted"> / {pack.contents.join(' · ')}</span>
            </p>
            {crate > 0 ? (
              <p className="label mt-4 text-honey">
                {crate} {crate === 1 ? 'PACK' : 'PACKS'} IN CRATE
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="display text-[clamp(1.6rem,3vw,2.4rem)] text-bone">{pack.price}</span>
            <MagneticButton onClick={() => setCrate((c) => c + 1)} variant="solid" cursor="ADD">
              SHOP KUMBAYAH
            </MagneticButton>
            {crate > 0 ? (
              <MagneticButton onClick={() => setCrate(0)} variant="quiet" arrow={false}>
                EMPTY CRATE
              </MagneticButton>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
