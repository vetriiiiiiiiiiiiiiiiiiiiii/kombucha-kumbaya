'use client';

import { useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/hooks/useEnvironment';
import { SectionMeta } from '@/components/ui/SectionMeta';
import { AnimatedText } from '@/components/ui/AnimatedText';
import { cycleSteps } from '@/data/sustainability';

const R = 210;
const CIRCUM = 2 * Math.PI * R;

/**
 * NOTHING GOES TO WASTE — the returnable-bottle loop.
 *
 * Drawn as one continuous circle rather than a chain of boxes: the line draws
 * itself as the visitor scrolls, the bottle travels around it, and the eight
 * stops sit on the ring. Deliberately not an infographic dashboard — no icons,
 * no percentages, no cards.
 */
export function Cycle() {
  const section = useRef<HTMLElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const traveller = useRef<SVGGElement>(null);
  const [active, setActive] = useState(0);
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
          onUpdate: (self) => {
            setActive(Math.min(cycleSteps.length - 1, Math.floor(self.progress * cycleSteps.length)));
          },
        },
      });

      tl.fromTo(
        ring.current,
        { strokeDashoffset: CIRCUM },
        { strokeDashoffset: 0, ease: 'none' },
        0
      ).fromTo(
        traveller.current,
        { rotate: 0 },
        // svgOrigin, not transformOrigin: the marker must orbit the centre of
        // the ring, not spin on its own axis.
        { rotate: 360, ease: 'none', svgOrigin: '260 260' },
        0
      );
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={section}
      id="cycle"
      className={reduced ? 'relative bg-void py-[10svh]' : 'relative bg-void md:h-[280svh]'}
      aria-label="Nothing goes to waste"
    >
      <div className={reduced ? 'relative' : 'md:sticky md:top-0 md:flex md:h-[100svh] md:flex-col md:justify-center'}>
        <div className="gutter pt-[10svh] md:pt-0">
          <SectionMeta index="08" label="SUSTAINABILITY" note="Glass goes out. Glass comes back." />
        </div>

        <div className="mt-10 grid items-center gap-12 gutter md:mt-12 md:grid-cols-[1fr_1.1fr]">
          <div>
            <AnimatedText
              text="NOTHING GOES TO WASTE."
              as="h2"
              mode="words"
              triggerRef={section}
              start="top 72%"
              className="display-tight max-w-[11ch] text-[clamp(2.2rem,6.5vw,5.5rem)] text-bone"
            />

            <ol className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5">
              {cycleSteps.map((step, i) => (
                <li
                  key={step.id}
                  className="flex items-baseline gap-4 transition-opacity duration-500"
                  style={{ opacity: i === active ? 1 : 0.32 }}
                >
                  <span
                    className="label-sm"
                    style={{ color: i === active ? '#E2A03F' : undefined }}
                  >
                    {step.index}
                  </span>
                  <span>
                    <span className="display block text-[1.15rem] text-bone">{step.title}</span>
                    <span className="mt-1 block text-[0.8rem] leading-snug text-muted">
                      {step.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* the loop */}
          <div className="relative mx-auto w-full max-w-[34rem]">
            <svg viewBox="0 0 520 520" className="w-full" role="img" aria-label="The return loop">
              <defs>
                <radialGradient id="cycle-well" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#C0762A" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#C0762A" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx="260" cy="260" r="250" fill="url(#cycle-well)" />

              {/* the track */}
              <circle
                cx="260"
                cy="260"
                r={R}
                fill="none"
                stroke="#3A2C1C"
                strokeWidth="1"
                strokeDasharray="2 6"
              />

              {/* the line, drawn by scroll */}
              <circle
                ref={ring}
                cx="260"
                cy="260"
                r={R}
                fill="none"
                stroke="#E2A03F"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={CIRCUM}
                strokeDashoffset={reduced ? 0 : CIRCUM}
                transform="rotate(-90 260 260)"
              />

              {/* the eight stops */}
              {cycleSteps.map((step, i) => {
                const angle = (i / cycleSteps.length) * Math.PI * 2 - Math.PI / 2;
                const x = 260 + Math.cos(angle) * R;
                const y = 260 + Math.sin(angle) * R;
                const lx = 260 + Math.cos(angle) * (R + 34);
                const ly = 260 + Math.sin(angle) * (R + 34);
                const on = i <= active;
                return (
                  <g key={step.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r={on ? 5 : 3}
                      fill={on ? '#E2A03F' : '#3A2C1C'}
                      style={{ transition: 'all 0.5s ease' }}
                    />
                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="label-sm"
                      fill={on ? '#F3EDE1' : '#6B5B45'}
                      style={{ fontSize: 11, letterSpacing: '0.18em', transition: 'fill 0.5s ease' }}
                    >
                      {step.title}
                    </text>
                  </g>
                );
              })}

              {/* the bottle going round */}
              <g ref={traveller}>
                <g transform={`translate(260 ${260 - R})`}>
                  <circle r="13" fill="#0E0B07" stroke="#E2A03F" strokeWidth="1" />
                  <rect x="-3.5" y="-7" width="7" height="14" rx="2" fill="#E2A03F" />
                </g>
              </g>

              <text
                x="260"
                y="256"
                textAnchor="middle"
                fill="#F3EDE1"
                style={{ fontSize: 13, letterSpacing: '0.24em' }}
              >
                {cycleSteps[active].title}
              </text>
              <text
                x="260"
                y="280"
                textAnchor="middle"
                fill="#9C8E79"
                style={{ fontSize: 10, letterSpacing: '0.2em' }}
              >
                STEP {cycleSteps[active].index} / 08
              </text>
            </svg>
          </div>
        </div>

        <div className="gutter pb-[10svh] pt-10 md:pb-0">
          <p className="serif-note max-w-[42ch] text-[1.25rem] leading-tight text-muted">
            A bottle that comes back is worth more than a bottle that gets
            recycled. That is the whole argument, and the whole system.
          </p>
        </div>
      </div>
    </section>
  );
}
