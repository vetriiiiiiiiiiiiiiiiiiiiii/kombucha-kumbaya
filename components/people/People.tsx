'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/hooks/useEnvironment';
import { SectionMeta } from '@/components/ui/SectionMeta';
import { AnimatedText } from '@/components/ui/AnimatedText';
import { Figure } from '@/components/ui/Figure';
import { people, founderStory } from '@/data/people';

const HEIGHTS: Record<string, string> = {
  sm: 'h-[42vh] w-[62vw] sm:w-[20rem]',
  md: 'h-[52vh] w-[74vw] sm:w-[26rem]',
  lg: 'h-[64vh] w-[86vw] sm:w-[34rem]',
};

/**
 * MADE BY PEOPLE — a documentary rail.
 *
 * Every frame here is a placeholder awaiting real photography of the actual
 * team; no synthetic portraits are used anywhere. The crops are already set
 * (4:5 for the rail, 3:4 for the wide frames), so swapping in real files is a
 * change of path in /data/people.ts and nothing else.
 */
export function People() {
  const section = useRef<HTMLElement>(null);
  const runway = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (!runway.current || !rail.current || reduced) return;

    const ctx = gsap.context(() => {
      // The rail drifts sideways as the section passes — a slow pan, not a pin.
      const overflow = rail.current!.scrollWidth - window.innerWidth;
      if (overflow <= 0) return;

      gsap.fromTo(
        rail.current,
        { x: 0 },
        {
          x: -overflow,
          ease: 'none',
          scrollTrigger: {
            trigger: runway.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={section} className="relative bg-void" data-chapter="MADE BY PEOPLE"
      aria-label="The people">
      {/* The runway gives the rail room to pan; the founder story lives outside
          it so it can never overlap the pinned stage. */}
      <div ref={runway} className={reduced ? 'relative' : 'relative md:h-[300svh]'}>
        <div className={reduced ? 'relative' : 'md:sticky md:top-0 md:h-[100svh] md:overflow-hidden'}>
        <div className="gutter pt-[12svh]">
          <SectionMeta
            index="06"
            label="THE PEOPLE"
            note="Generated artwork stands in for the documentary shoot."
          />
          <AnimatedText
            text="MADE BY PEOPLE."
            as="h2"
            mode="chars"
            triggerRef={runway}
            start="top 72%"
            className="display-tight mt-8 max-w-[13ch] text-[clamp(2.4rem,7.5vw,7rem)] text-bone"
          />
        </div>

        <div
          ref={rail}
          className={
            // The desktop rail is panned by scroll, so it may overflow visibly.
            // With motion off nothing pans it, and it has to stay scrollable or
            // the later frames become unreachable.
            'no-bar mt-12 flex items-end gap-6 overflow-x-auto px-[clamp(1.25rem,4vw,4.5rem)] pb-10' +
            (reduced ? '' : ' md:overflow-visible md:pb-0')
          }
        >
          {people.map((person, i) => (
            <div key={person.id} className={`group shrink-0 ${HEIGHTS[person.scale]}`}>
              <Figure
                src={person.media}
                alt={`${person.name} — ${person.role}`}
                ratio={person.scale === 'lg' ? '3 / 4' : '4 / 5'}
                className="h-full"
                imgClassName="h-full"
                cursor="LOOK"
                index={String(i + 1).padStart(2, '0')}
                caption={person.name}
              />
              <p className="mt-1 max-w-[26ch] text-[0.85rem] text-muted">{person.role}</p>
              {person.quote ? (
                <p className="serif-note mt-3 max-w-[24ch] text-[1.15rem] leading-tight text-scoby/80">
                  “{person.quote}”
                </p>
              ) : null}
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* founder story — the quiet beat after the rail */}
      <div className="gutter py-[12svh]">
        <div className="grid gap-10 border-t border-hairline pt-10 md:grid-cols-[1fr_1.2fr]">
          <span className="label text-honey">{founderStory.kicker}</span>
          <div>
            <AnimatedText
              text={founderStory.headline}
              as="h3"
              mode="words"
              className="serif-note max-w-[22ch] text-[clamp(1.6rem,3.4vw,3rem)] leading-[1.1] text-bone"
            />
            <p className="mt-8 max-w-[54ch] text-[0.98rem] leading-relaxed text-muted">
              {founderStory.body}
            </p>
            <span className="label-sm mt-8 block text-muted/60">{founderStory.signature}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
