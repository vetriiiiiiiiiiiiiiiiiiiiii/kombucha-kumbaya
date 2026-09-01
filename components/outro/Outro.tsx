'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/hooks/useEnvironment';
import { BubbleCanvas } from '@/components/ui/BubbleCanvas';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { getProduct } from '@/data/products';

const CLOSER = getProduct('original');

/**
 * The last frame. The bottle sinks back into the dark it arrived from, the
 * fizz keeps going without it, and one line is left on screen.
 */
export function Outro() {
  const section = useRef<HTMLElement>(null);
  const bottle = useRef<HTMLImageElement>(null);
  const line = useRef<HTMLHeadingElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const fizz = useRef(0.5);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (!section.current || reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
          onUpdate: (self) => {
            fizz.current = 0.5 + self.progress * 2.2;
          },
        },
      });

      tl.fromTo(
        bottle.current,
        { yPercent: 8, opacity: 0.9, filter: 'blur(0px)' },
        { yPercent: -14, opacity: 0, filter: 'blur(14px)', ease: 'power1.in' },
        0
      );

      // The headline and buttons live inside the sticky stage, so they hold
      // still against the viewport and cannot be used as their own trigger.
      // They ride this section's timeline instead, arriving early and staying.
      tl.fromTo(
        line.current,
        { opacity: 0, yPercent: 24 },
        { opacity: 1, yPercent: 0, duration: 0.28, ease: 'power3.out' },
        0.02
      ).fromTo(
        actions.current,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.24, ease: 'power3.out' },
        0.14
      );
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={section} className={reduced ? 'relative h-[100svh] bg-void' : 'relative h-[210svh] bg-void'} data-chapter="TAKE A LITTLE LIFE"
      aria-label="Take a little life with you">
      <div className={reduced ? 'relative flex h-[100svh] flex-col items-center justify-center overflow-hidden' : 'sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden'}>
        <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_58%,rgba(192,118,42,0.14)_0%,transparent_70%)]" />

        <BubbleCanvas
          className="absolute inset-0 h-full w-full"
          density={30}
          speed={1.05}
          intensityRef={fizz}
          seed={47}
        />

        <img
          ref={bottle}
          src={CLOSER.media.bottle}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute h-[58svh] w-auto drop-shadow-[0_40px_90px_rgba(0,0,0,0.8)]"
        />

        <div className="relative z-10 flex flex-col items-center gutter">
          <h2
            ref={line}
            className="display-tight max-w-[15ch] text-center text-[clamp(2.2rem,7.5vw,7rem)] text-bone"
          >
            TAKE A LITTLE LIFE WITH YOU.
          </h2>

          <div ref={actions} className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton href="#shop" variant="solid" cursor="SHOP">
              SHOP KUMBAYAH
            </MagneticButton>
            <MagneticButton href="#find" variant="ghost" cursor="FIND" arrow={false}>
              FIND KUMBAYAH
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
