'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useExperience } from '@/components/system/ExperienceProvider';
import { useImmersive, useIsomorphicLayoutEffect, useReducedMotion } from '@/hooks/useEnvironment';
import { BubbleCanvas } from '@/components/ui/BubbleCanvas';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { getProduct } from '@/data/products';
import { site } from '@/data/site';

const BottleScene = dynamic(() => import('@/components/hero/BottleScene'), { ssr: false });

const HOUSE = getProduct('mango');

/**
 * The hero runs on a tall section with a sticky stage inside it rather than a
 * ScrollTrigger pin: sticky costs no layout shift and survives resize.
 *
 * Entrance and scroll never touch the same element. Each headline, aside and
 * rail is a wrapper (scroll-driven) around an inner node (entrance-driven), so
 * the two timelines cannot fight over one transform.
 */
export function Hero() {
  const { ready } = useExperience();
  const immersive = useImmersive();
  const reduced = useReducedMotion();

  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  // entrance targets
  const lineA = useRef<HTMLSpanElement>(null);
  const lineB = useRef<HTMLSpanElement>(null);
  const aside = useRef<HTMLDivElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const well = useRef<HTMLDivElement>(null);
  const footerRow = useRef<HTMLDivElement>(null);

  // scroll targets
  const lineAWrap = useRef<HTMLDivElement>(null);
  const lineBWrap = useRef<HTMLDivElement>(null);
  const copyWrap = useRef<HTMLDivElement>(null);
  const wellWrap = useRef<HTMLDivElement>(null);
  const railWrap = useRef<HTMLDivElement>(null);

  const progress = useRef(0);
  const fizz = useRef(0.35);
  const [visible, setVisible] = useState(true);

  /* ---- entrance: fires the moment the loader hands over ---- */
  useIsomorphicLayoutEffect(() => {
    if (!ready || !stage.current) return;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([lineA.current, lineB.current, aside.current, actions.current, footerRow.current, well.current], {
          opacity: 1,
          yPercent: 0,
          y: 0,
        });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.fromTo(
        [lineA.current, lineB.current],
        { yPercent: 108, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.5, stagger: 0.14 },
        0
      )
        .fromTo(well.current, { opacity: 0, scale: 0.82 }, { opacity: 1, scale: 1, duration: 2.2 }, 0)
        .fromTo(aside.current, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1.1 }, 0.55)
        .fromTo(actions.current, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1.1 }, 0.68)
        .fromTo(footerRow.current, { opacity: 0 }, { opacity: 1, duration: 1.1 }, 0.85)
        .to(fizz, { current: 1, duration: 2.4, ease: 'power2.out' }, 0);
    }, stage);

    return () => ctx.revert();
  }, [ready, reduced]);

  /* ---- scroll: the hero dissolves as the visitor descends ---- */
  useIsomorphicLayoutEffect(() => {
    if (!section.current || reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => {
            progress.current = self.progress;
            fizz.current = 0.6 + self.progress * 1.9;
          },
        },
      });

      tl.to(lineAWrap.current, { yPercent: -46, xPercent: -5, ease: 'none' }, 0)
        .to(lineBWrap.current, { yPercent: 42, xPercent: 5, ease: 'none' }, 0)
        .to(copyWrap.current, { opacity: 0, y: -50, ease: 'power2.in' }, 0)
        .to(wellWrap.current, { scale: 1.5, opacity: 0.3, ease: 'none' }, 0)
        .to(railWrap.current, { opacity: 0, ease: 'none' }, 0);
      // The stage is deliberately NOT faded out here: it stays lit until the
      // sticky container scrolls away under its own weight. Fading it left a
      // dead black frame while the hero still occupied most of the screen.
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  /* ---- stop rendering WebGL once the hero is off screen ---- */
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      rootMargin: '10% 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={section}
      id="top"
      data-chapter="LET LIFE BUBBLE"
      className={reduced ? 'relative h-[100svh]' : 'relative h-[190svh] md:h-[220svh]'}
      aria-label="Kumbayah — let life bubble"
    >
      <div ref={stage} className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* --- ground --- */}
        <div className="absolute inset-0 bg-void" />
        <div ref={wellWrap} className="absolute inset-0">
          <div
            ref={well}
            className="absolute left-1/2 top-1/2 h-[130vmin] w-[130vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
            style={{
              background:
                'radial-gradient(circle at 50% 52%, rgba(240,160,40,0.26) 0%, rgba(160,86,20,0.13) 34%, rgba(8,6,4,0) 70%)',
              filter: 'blur(18px)',
            }}
          />
        </div>

        {/* --- product --- */}
        <div className="absolute inset-0">
          {ready && immersive ? (
            <BottleScene
              accent={HOUSE.colour.accent}
              deep={HOUSE.colour.deep}
              flavour={HOUSE.flavour}
              progress={progress}
              paused={!visible}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={HOUSE.media.bottle}
                alt="Kumbayah bottle"
                className="h-[42svh] w-auto max-w-none -translate-y-[3svh] drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)] sm:h-[52svh] md:h-[58svh] md:translate-y-0"
                style={reduced ? undefined : { animation: 'kb-drift 7s ease-in-out infinite alternate' }}
              />
            </div>
          )}
        </div>

        <BubbleCanvas
          className="absolute inset-0 h-full w-full"
          density={20}
          speed={0.9}
          intensityRef={fizz}
          seed={5}
        />

        {/* --- typography: the product sits inside the line ---
            On phones the two lines stack at the top and the copy owns the
            bottom; splitting them top-and-bottom only works once there is
            enough height to keep the buttons clear of the second line. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-start gutter pt-[13svh] md:justify-between md:pb-[10svh] md:pt-[17svh]">
          <div ref={lineAWrap} className="will-change-transform">
            <span className="block overflow-hidden pb-[0.04em]">
              <span
                ref={lineA}
                className="display-tight block text-[clamp(3.4rem,15.5vw,15rem)] text-bone"
              >
                LET LIFE
              </span>
            </span>
          </div>

          <div ref={lineBWrap} className="flex justify-end will-change-transform">
            <span className="block overflow-hidden pb-[0.04em]">
              <span
                ref={lineB}
                className="display-tight block text-[clamp(3.4rem,15.5vw,15rem)] text-bone"
                style={{ textShadow: '0 24px 90px rgba(0,0,0,0.6)' }}
              >
                BUBBLE.
              </span>
            </span>
          </div>
        </div>

        {/* --- supporting copy + actions --- */}
        <div
          ref={copyWrap}
          className="absolute bottom-[12svh] left-[clamp(1.25rem,4vw,4.5rem)] md:bottom-[15svh]"
        >
          <div ref={aside} className="mb-7 max-w-[15rem] opacity-0">
            <p className="serif-note text-[clamp(1.15rem,1.6vw,1.6rem)] leading-[1.25] text-scoby">
              Real tea.
              <br />
              Real fermentation.
              <br />
              Real flavour.
            </p>
          </div>

          <div ref={actions} className="flex flex-wrap items-center gap-3 opacity-0">
            <MagneticButton href="#story" variant="solid" cursor="DISCOVER">
              DISCOVER KUMBAYAH
            </MagneticButton>
            <MagneticButton href="#shop" variant="ghost" cursor="SHOP" arrow={false}>
              SHOP THE BOOCH
            </MagneticButton>
          </div>
        </div>

        {/* --- footer rail --- */}
        <div ref={railWrap} className="pointer-events-none absolute inset-x-0 bottom-0">
          <div
            ref={footerRow}
            className="flex items-end justify-between gutter pb-6 opacity-0"
          >
            <span className="label-sm text-muted/70">
              {site.est} / {site.home}
            </span>
            <span className="label-sm hidden items-center gap-3 text-muted/70 md:flex">
              SCROLL
              <span className="block h-8 w-px bg-gradient-to-b from-honey/80 to-transparent" />
            </span>
            <span className="label-sm text-muted/70">BATCH 030</span>
          </div>
        </div>
      </div>
    </section>
  );
}
