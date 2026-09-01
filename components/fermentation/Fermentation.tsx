'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useIsDesktop, useReducedMotion } from '@/hooks/useEnvironment';
import { BubbleCanvas } from '@/components/ui/BubbleCanvas';
import { AnimatedText } from '@/components/ui/AnimatedText';
import { SectionMeta } from '@/components/ui/SectionMeta';
import { fermentStages } from '@/data/fermentation';

/**
 * THIRTY DAYS OF PATIENCE — the signature sequence.
 *
 * On desktop the section pins and the timeline runs sideways while the brew
 * itself changes: the ground darkens toward each stage colour, the fizz builds,
 * and a bottle fills from the bottom across the whole passage. On smaller
 * screens the same content reads as a plain vertical timeline, because a
 * horizontal rail on a phone is a fight, not an experience.
 */
export function Fermentation() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const ground = useRef<HTMLDivElement>(null);
  const brew = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const ticks = useRef<HTMLSpanElement[]>([]);
  const fizz = useRef(0.25);

  const desktop = useIsDesktop();
  const reduced = useReducedMotion();
  const horizontal = desktop && !reduced;

  useIsomorphicLayoutEffect(() => {
    if (!section.current || !track.current || !horizontal) return;

    const ctx = gsap.context(() => {
      /** How far the rail must travel, in pixels, to reach the last panel. */
      const distance = () =>
        Math.max((track.current?.scrollWidth ?? 0) - window.innerWidth, 0);

      /**
       * The section is made exactly as tall as the rail is wide, so one pixel
       * of scroll moves the timeline one pixel sideways. A fixed svh height
       * cannot do this: the ratio between a viewport width and a viewport
       * height changes with every aspect ratio.
       */
      const sizeSection = () => {
        if (section.current) {
          section.current.style.height = `${distance() + window.innerHeight}px`;
        }
      };
      sizeSection();

      // One unit per stage, so the rail and the colour changes share a length.
      const units = fermentStages.length;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.7,
          invalidateOnRefresh: true,
          onRefreshInit: sizeSection,
          onUpdate: (self) => {
            const p = self.progress;
            fizz.current = 0.3 + p * 2.6;

            // the brew fills as the days pass
            if (brew.current) {
              brew.current.style.clipPath = `inset(${(1 - p) * 100}% 0% 0% 0%)`;
            }

            // day readout, driven by the same progress
            if (readout.current) {
              const day = Math.min(30, Math.max(1, Math.round(p * 30)));
              readout.current.textContent = `DAY ${String(day).padStart(2, '0')}`;
            }

            const active = Math.min(
              fermentStages.length - 1,
              Math.floor(p * fermentStages.length)
            );
            ticks.current.forEach((t, i) => {
              if (t) t.style.opacity = i <= active ? '1' : '0.22';
            });
          },
        },
      });

      // Spans the whole timeline. Given a plain duration of 1 it would finish
      // in the first fifth of the section and leave the rest scrolling empty.
      tl.fromTo(
        track.current,
        { x: 0 },
        { x: () => -distance(), ease: 'none', duration: units, invalidateOnRefresh: true },
        0
      );

      // the ground takes on the colour of whichever day is on screen
      fermentStages.forEach((stage, i) => {
        tl.to(
          ground.current,
          { backgroundColor: stage.colour.deep, ease: 'none', duration: 1 },
          i
        );
      });
    }, section);

    return () => {
      ctx.revert();
      // The height is written directly, so it has to be taken back directly —
      // otherwise it survives a switch to the vertical layout.
      if (section.current) section.current.style.height = '';
    };
  }, [horizontal]);

  return (
    <section
      ref={section}
      id="ferment"
      // Height is measured from the rail once mounted; this is the pre-hydration fallback.
      className={horizontal ? 'relative h-[520svh]' : 'relative'}
      aria-label="Thirty days of patience"
    >
      <div
        className={
          horizontal
            ? 'sticky top-0 h-[100svh] overflow-hidden'
            : 'relative overflow-hidden py-24'
        }
      >
        {/* ground */}
        <div ref={ground} className="absolute inset-0 bg-void transition-colors" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_50%,transparent_35%,rgba(0,0,0,0.7)_100%)]" />

        {/* the bottle filling across the whole passage */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-[74svh] w-auto opacity-[0.22]">
            <img
              src="/assets/product/bottle-original.svg"
              alt=""
              aria-hidden
              className="h-full w-auto opacity-25 blur-[1px]"
            />
            <div
              ref={brew}
              className="absolute inset-0"
              style={{ clipPath: 'inset(100% 0% 0% 0%)' }}
            >
              <img
                src="/assets/product/bottle-original.svg"
                alt=""
                aria-hidden
                className="h-full w-auto"
              />
            </div>
          </div>
        </div>

        <BubbleCanvas
          className="absolute inset-0 h-full w-full"
          density={22}
          speed={1}
          intensityRef={fizz}
          colour="226, 160, 63"
          seed={19}
        />

        {/* header */}
        <div className="relative z-10 gutter pt-[13svh] lg:pt-[11svh]">
          <SectionMeta
            index="02"
            label="FERMENTATION"
            note="Nothing here is accelerated. The clock is the recipe."
          />
          <h2 className="display-tight mt-8 max-w-[16ch] text-[clamp(2.4rem,7vw,6.5rem)] text-bone">
            30 DAYS OF
            <br />
            PATIENCE.
          </h2>
        </div>

        {/* the timeline */}
        <div
          className={
            horizontal
              ? 'absolute inset-x-0 bottom-[16svh] top-[46svh]'
              : 'relative mt-16'
          }
        >
          <div
            ref={track}
            className={
              horizontal
                ? 'flex h-full w-max will-change-transform'
                : 'flex flex-col gap-16'
            }
          >
            {fermentStages.map((stage, i) => (
              <article
                key={stage.id}
                className={
                  horizontal
                    ? 'flex h-full w-screen shrink-0 items-start gutter'
                    : 'gutter'
                }
              >
                <div className="flex w-full max-w-[46rem] flex-col gap-6 md:flex-row md:items-start md:gap-12">
                  <div className="shrink-0">
                    <span
                      className="display-tight block text-[clamp(3rem,8vw,7rem)] leading-none"
                      style={{ color: stage.colour.accent }}
                    >
                      {stage.day.replace('DAY ', '')}
                    </span>
                    <span className="label mt-2 block text-muted">{stage.day}</span>
                  </div>

                  <div className="max-w-[34ch]">
                    <h3 className="display text-[clamp(1.6rem,3vw,2.6rem)] text-bone">
                      {stage.title}
                    </h3>
                    <p className="serif-note mt-3 text-[1.35rem] leading-tight text-scoby">
                      {stage.caption}
                    </p>
                    <p className="mt-5 text-[0.95rem] leading-relaxed text-muted">{stage.body}</p>
                  </div>
                </div>

                <div className="ml-auto hidden h-[42svh] w-[26vw] shrink-0 overflow-hidden lg:block">
                  <img
                    src={stage.media}
                    alt={`${stage.title} — fermentation texture`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover opacity-70 mix-blend-screen"
                  />
                </div>
              </article>
            ))}

            {/* the closing statement rides the same rail */}
            <article
              className={
                horizontal
                  ? 'flex h-full w-screen shrink-0 items-center justify-center gutter'
                  : 'gutter pt-6'
              }
            >
              <h3 className="display-tight max-w-[14ch] text-center text-[clamp(2.2rem,7vw,6rem)] text-honey">
                PATIENCE MAKES THE FIZZ.
              </h3>
            </article>
          </div>
        </div>

        {/* progress rail */}
        {horizontal ? (
          <div className="absolute inset-x-0 bottom-[7svh] z-10 gutter">
            <div className="flex items-center justify-between">
              <span ref={readout} className="label text-honey">
                DAY 01
              </span>
              <div className="flex flex-1 items-center gap-2 px-8">
                {fermentStages.map((stage, i) => (
                  <span
                    key={stage.id}
                    ref={(el) => {
                      if (el) ticks.current[i] = el;
                    }}
                    className="h-px flex-1 origin-left bg-bone transition-opacity duration-300"
                    style={{ opacity: i === 0 ? 1 : 0.22 }}
                  />
                ))}
              </div>
              <span className="label text-muted">DAY 30</span>
            </div>
          </div>
        ) : null}
      </div>

      {!horizontal ? (
        <div className="gutter pb-24 pt-16">
          <AnimatedText
            text="PATIENCE MAKES THE FIZZ."
            as="h3"
            mode="words"
            className="display-tight max-w-[12ch] text-[clamp(2rem,9vw,4rem)] text-honey"
          />
        </div>
      ) : null}
    </section>
  );
}
