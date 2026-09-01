'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useExperience } from '@/components/system/ExperienceProvider';
import { useSmoothScroll } from '@/components/system/SmoothScroll';
import { useReducedMotion } from '@/hooks/useEnvironment';
import { BubbleCanvas } from '@/components/ui/BubbleCanvas';

const WORD = 'KUMBAYAH'.split('');

/**
 * The trailing surface under the loader panel. At rest it is a flat sliver;
 * on exit it swells into a wave so the panel leaves like liquid draining up.
 */
const WAVE_REST =
  'M0,0 L1440,0 L1440,8 C1200,8 960,8 720,8 C480,8 240,8 0,8 Z';
const WAVE_PULL =
  'M0,0 L1440,0 L1440,54 C1200,118 960,14 720,72 C480,120 240,18 0,68 Z';

export function Loader() {
  const { reveal } = useExperience();
  const lenis = useSmoothScroll();
  const reduced = useReducedMotion();

  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const letters = useRef<HTMLSpanElement[]>([]);
  const fill = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const sub = useRef<HTMLParagraphElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const wave = useRef<SVGPathElement>(null);
  const intensity = useRef(0.15);

  const [done, setDone] = useState(false);

  /**
   * The scroll instance arrives a tick after mount and is replaced once more
   * under StrictMode. It is held in a ref rather than read as a dependency:
   * as a dependency it would restart the whole sequence every time it changed,
   * and the loader would never reach its own onComplete.
   */
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
    if (!done) lenis?.stop();
  }, [lenis, done]);

  useEffect(() => {
    // Hold the page still underneath the loader.
    document.body.style.overflow = 'hidden';
    lenisRef.current?.stop();

    // A deep link is a deliberate request for a section — do not stamp it out.
    const hash = window.location.hash;
    if (!hash) window.scrollTo(0, 0);

    const finish = () => {
      document.body.style.overflow = '';
      lenisRef.current?.start();
      reveal();
      ScrollTrigger.refresh();
      setDone(true);

      if (hash) {
        const target = document.querySelector(hash);
        if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
        ScrollTrigger.refresh();
      }
    };

    if (reduced) {
      const t = window.setTimeout(finish, 300);
      return () => window.clearTimeout(t);
    }

    const ctx = gsap.context(() => {
      const progress = { v: 0 };

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: finish,
      });

      // 1 — a bubble, then another, then the field wakes up
      tl.to(intensity, { current: 1, duration: 2.1, ease: 'power2.in' }, 0);

      // 2 — the word forms, letter by letter, out of the dark
      tl.fromTo(
        letters.current,
        { yPercent: 118, opacity: 0, filter: 'blur(14px)' },
        {
          yPercent: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.15,
          stagger: { each: 0.055, from: 'center' },
        },
        0.15
      );

      // 3 — the wordmark fills with liquid: this IS the progress indicator
      tl.to(
        progress,
        {
          v: 88,
          duration: 1.5,
          ease: 'power1.inOut',
          onUpdate: () => {
            const v = progress.v;
            if (fill.current) fill.current.style.clipPath = `inset(${100 - v}% 0% 0% 0%)`;
            if (counter.current) counter.current.textContent = String(Math.round(v)).padStart(3, '0');
          },
        },
        0.35
      );

      tl.fromTo(
        [sub.current, meta.current],
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 },
        0.75
      );

      // 4 — top off to 100 once fonts have actually landed
      tl.to(
        progress,
        {
          v: 100,
          duration: 0.55,
          ease: 'power2.out',
          onUpdate: () => {
            const v = progress.v;
            if (fill.current) fill.current.style.clipPath = `inset(${100 - v}% 0% 0% 0%)`;
            if (counter.current) counter.current.textContent = String(Math.round(v)).padStart(3, '0');
          },
        },
        '>-0.05'
      );

      // 5 — the liquid reveal
      tl.to([sub.current, meta.current, counter.current], { opacity: 0, duration: 0.35 }, '-=0.15');
      tl.to(
        letters.current,
        { yPercent: -108, opacity: 0, duration: 0.75, stagger: { each: 0.03, from: 'edges' }, ease: 'power3.in' },
        '-=0.1'
      );
      tl.to(wave.current, { attr: { d: WAVE_PULL }, duration: 0.5, ease: 'sine.inOut' }, '-=0.6');
      tl.to(
        panel.current,
        { yPercent: -104, duration: 1.05, ease: 'power3.inOut' },
        '-=0.35'
      );
      tl.to(root.current, { autoAlpha: 0, duration: 0.01 });
    }, root);

    // Safety net: if a frame is dropped hard enough that the timeline stalls,
    // the page still gets handed over rather than sitting behind the loader.
    const bail = window.setTimeout(finish, 6000);

    return () => {
      window.clearTimeout(bail);
      ctx.revert();
    };
  }, [reduced, reveal]);

  if (done) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[100]" aria-label="Loading Kumbayah" role="status">
      <div ref={panel} className="absolute inset-0 bg-void">
        <BubbleCanvas
          className="absolute inset-0 h-full w-full"
          density={34}
          speed={1.1}
          intensityRef={intensity}
          seed={11}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <div className="relative">
            <h1 className="display-tight relative flex text-[clamp(2.6rem,11vw,10rem)] text-bone/12">
              {WORD.map((c, i) => (
                <span key={i} className="overflow-hidden">
                  <span
                    ref={(el) => {
                      if (el) letters.current[i] = el;
                    }}
                    className="inline-block"
                  >
                    {c}
                  </span>
                </span>
              ))}
            </h1>

            {/* the fill layer — clipped upward as the brew progresses */}
            <div
              ref={fill}
              aria-hidden
              className="pointer-events-none absolute inset-0 flex"
              style={{ clipPath: 'inset(100% 0% 0% 0%)' }}
            >
              <span
                className="display-tight flex text-[clamp(2.6rem,11vw,10rem)]"
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, #E2A03F 0%, #C0762A 55%, #8A4E17 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {WORD.join('')}
              </span>
            </div>
          </div>

          <p ref={sub} className="label mt-8 text-muted">
            FERMENTED WITH PATIENCE.
          </p>
        </div>

        <div
          ref={meta}
          className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gutter pb-7"
        >
          <span className="label-sm text-muted/70">LUMIO DIGITAL / CONCEPT</span>
          <span className="label-sm text-muted/70 hidden sm:block">BATCH NO. 030</span>
        </div>

        <span
          ref={counter}
          className="label absolute bottom-7 right-[clamp(1.25rem,4vw,4.5rem)] text-honey tabular-nums"
        >
          000
        </span>

        {/* liquid surface that trails the panel as it drains upward */}
        <svg
          className="absolute left-0 top-full h-[14vh] w-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path ref={wave} d={WAVE_REST} fill="#080604" />
        </svg>
      </div>
    </div>
  );
}
