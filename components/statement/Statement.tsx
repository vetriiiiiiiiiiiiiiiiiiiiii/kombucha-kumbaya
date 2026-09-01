'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/hooks/useEnvironment';
import { AnimatedText } from '@/components/ui/AnimatedText';

const LINES = ['NOT SODA.', 'NOT A SUPPLEMENT.', 'SOMETHING ALIVE.'];

/**
 * The quiet after the hero. Three statements, one at a time, with real pauses
 * between them — the scroll distance IS the pacing. Nothing else on screen.
 */
export function Statement() {
  const section = useRef<HTMLElement>(null);
  const lines = useRef<HTMLSpanElement[]>([]);
  const rule = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (!section.current || reduced) return;

    const ctx = gsap.context(() => {
      const [first, ...rest] = lines.current;

      // The first line lands on entry rather than on scrub, so the section
      // never opens on an empty black screen while the hero is leaving.
      gsap.fromTo(
        first,
        { opacity: 0, yPercent: 40, filter: 'blur(12px)' },
        {
          opacity: 1,
          yPercent: 0,
          filter: 'blur(0px)',
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: section.current, start: 'top 72%', once: true },
        }
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      });

      const OUT = { opacity: 0, yPercent: -32, filter: 'blur(10px)', duration: 0.6, ease: 'power3.in' };
      const IN_FROM = { opacity: 0, yPercent: 40, filter: 'blur(12px)' };
      const IN_TO = { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' };

      // Exits carry immediateRender:false — otherwise their from-state would be
      // stamped on at build time and cancel the entry reveal above.
      tl.fromTo(first, { opacity: 1, yPercent: 0 }, { ...OUT, immediateRender: false }, 0.95);

      rest.forEach((line, i) => {
        const at = 1.35 + i * 1.55;
        tl.fromTo(line, IN_FROM, IN_TO, at);
        if (i < rest.length - 1) {
          tl.fromTo(line, { opacity: 1, yPercent: 0 }, { ...OUT, immediateRender: false }, at + 1.0);
        }
      });

      tl.fromTo(rule.current, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power2.out' }, 0.3);
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={section}
      id="story"
      className={reduced ? 'relative bg-void py-[12svh]' : 'relative h-[330svh] bg-void'}
      aria-label="What is Kumbayah"
    >
      <div className={reduced ? 'relative' : 'sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden'}>
        <div className="gutter">
          <span className="label-sm mb-10 block text-honey/80">01 / WHAT IS KUMBAYAH</span>

          {/* Without motion the three lines cannot share one absolute slot, so
              they fall back to stacked normal flow and the box grows with them. */}
          <div className={reduced ? 'relative' : 'relative h-[34svh] md:h-[30svh]'}>
            {LINES.map((line, i) => (
              <span
                key={line}
                ref={(el) => {
                  if (el) lines.current[i] = el;
                }}
                className="display-tight absolute inset-x-0 top-0 text-[clamp(2.5rem,9.5vw,9rem)] text-bone"
                style={reduced ? { position: 'relative', marginBottom: '0.1em' } : undefined}
              >
                {line}
              </span>
            ))}
          </div>

          <span
            ref={rule}
            className="mt-4 block h-px w-full origin-left bg-hairline"
            style={reduced ? { transform: 'none' } : undefined}
          />
        </div>
      </div>

      {/* the answer, held back until the statements are done */}
      <div className={reduced ? 'relative w-full pt-12' : 'absolute bottom-0 left-0 w-full pb-[18svh]'}>
        <div className="gutter">
          <div className="ml-auto max-w-[46ch]">
            <AnimatedText
              text="Kombucha made through real fermentation, patience and flavour."
              as="p"
              mode="words"
              className="body-lg text-scoby"
            />
            <p className="serif-note mt-6 text-[1.5rem] leading-tight text-muted">
              Thirty days. One culture. No shortcuts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
