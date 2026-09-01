'use client';

import { useCallback, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useFinePointer, useIsomorphicLayoutEffect, useReducedMotion } from '@/hooks/useEnvironment';
import { SectionMeta } from '@/components/ui/SectionMeta';
import { AnimatedText } from '@/components/ui/AnimatedText';
import { TasteProfileMeter } from '@/components/products/TasteProfile';
import { ProductModal } from '@/components/products/ProductModal';
import { products } from '@/data/products';
import type { Product } from '@/types';

/**
 * FIND YOUR BOOCH — the range as objects in a room rather than a product grid.
 *
 * The rail is a real horizontal scroller (drag, wheel, trackpad, arrow keys,
 * touch), not a hijacked vertical one: the visitor stays in control, and the
 * page never fights the browser about which direction it is going.
 */
export function FlavourWorld() {
  const section = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Product | null>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  /* --- drag to pan --- */
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    if (!fine || !rail.current) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: rail.current.scrollLeft,
      moved: 0,
    };
    rail.current.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active || !rail.current) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.abs(dx);
    rail.current.scrollLeft = drag.current.startScroll - dx;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!rail.current) return;
    drag.current.active = false;
    if (rail.current.hasPointerCapture(e.pointerId)) rail.current.releasePointerCapture(e.pointerId);
  };

  /** A drag should never be mistaken for a click on a bottle. */
  const openIfNotDragging = useCallback((product: Product) => {
    if (drag.current.moved > 8) return;
    setOpen(product);
  }, []);

  const nudge = (dir: 1 | -1) => {
    if (!rail.current) return;
    const card = rail.current.querySelector('[data-card]') as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 : 420;
    rail.current.scrollBy({ left: dir * step, behavior: reduced ? 'auto' : 'smooth' });
  };

  /* --- entrance: bottles rise as the rail comes into frame --- */
  useIsomorphicLayoutEffect(() => {
    if (!section.current || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-bottle]',
        { yPercent: 14, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: rail.current, start: 'top 80%', once: true },
        }
      );
    }, section);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={section} id="booch"
      data-chapter="THE RANGE" className="relative bg-void py-[14svh]" aria-label="Find your booch">
      <div className="gutter">
        <SectionMeta
          index="03"
          label="THE RANGE"
          note="Six bottles. Drag, or use the arrows."
        />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
          <AnimatedText
            text="FIND YOUR BOOCH."
            as="h2"
            mode="chars"
            className="display-tight max-w-[12ch] text-[clamp(2.4rem,7.5vw,7rem)] text-bone"
          />

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={() => nudge(-1)}
              aria-label="Previous flavour"
              className="label flex h-12 w-12 items-center justify-center rounded-full border border-hairline text-bone transition-colors hover:border-honey hover:text-honey"
            >
              &#8592;
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              aria-label="Next flavour"
              className="label flex h-12 w-12 items-center justify-center rounded-full border border-hairline text-bone transition-colors hover:border-honey hover:text-honey"
            >
              &#8594;
            </button>
          </div>
        </div>
      </div>

      <div
        ref={rail}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="no-bar mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-[clamp(1.25rem,4vw,4.5rem)] pb-4"
        style={{ cursor: fine ? 'grab' : undefined, touchAction: 'pan-x pan-y' }}
        tabIndex={0}
        aria-label="Flavour rail"
      >
        {products.map((product, i) => (
          <FlavourCard
            key={product.id}
            product={product}
            index={i}
            onOpen={openIfNotDragging}
            tilt={fine && !reduced}
          />
        ))}

        {/* a full stop at the end of the rail */}
        <div className="flex w-[70vw] shrink-0 snap-end items-center justify-center px-10 md:w-[28rem]">
          <p className="serif-note max-w-[18ch] text-center text-[1.6rem] leading-tight text-muted">
            Not sure yet? Let the quiz decide for you.
          </p>
        </div>
      </div>

      <ProductModal product={open} onClose={() => setOpen(null)} />
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function FlavourCard({
  product,
  index,
  onOpen,
  tilt,
}: {
  product: Product;
  index: number;
  onOpen: (p: Product) => void;
  tilt: boolean;
}) {
  const card = useRef<HTMLDivElement>(null);
  const bottle = useRef<HTMLImageElement>(null);
  const [hover, setHover] = useState(false);

  const onMove = (e: React.PointerEvent) => {
    if (!tilt || !card.current || !bottle.current) return;
    const r = card.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    gsap.to(bottle.current, {
      rotateY: x * 13,
      rotateX: -y * 8,
      x: x * 10,
      duration: 0.8,
      ease: 'power3.out',
      transformPerspective: 900,
    });
  };

  const reset = () => {
    setHover(false);
    if (bottle.current) {
      gsap.to(bottle.current, { rotateY: 0, rotateX: 0, x: 0, duration: 1.1, ease: 'power3.out' });
    }
  };

  return (
    <article
      ref={card}
      data-card
      onPointerMove={onMove}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={reset}
      onClick={() => onOpen(product)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(product);
        }
      }}
      role="button"
      tabIndex={0}
      data-cursor="EXPLORE"
      className="group relative flex w-[78vw] shrink-0 snap-center flex-col justify-between overflow-hidden border border-hairline/70 p-7 transition-colors duration-700 sm:w-[24rem] md:w-[26rem]"
      style={{
        background: hover
          ? `linear-gradient(180deg, ${product.colour.deep} 0%, #0B0805 78%)`
          : 'linear-gradient(180deg, #100C08 0%, #0A0705 78%)',
        minHeight: '32rem',
      }}
      aria-label={`${product.name} — open details`}
    >
      {/* well */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: `radial-gradient(60% 50% at 50% 78%, ${product.colour.accent}38 0%, transparent 70%)`,
        }}
      />

      <header className="relative flex items-start justify-between">
        <div>
          <span className="label-sm text-muted/60">
            {String(index + 1).padStart(2, '0')} / {product.size}
          </span>
          <h3
            className="display mt-3 text-[clamp(1.6rem,2.6vw,2.2rem)] leading-none"
            style={{ color: hover ? product.colour.accent : '#F3EDE1' }}
          >
            {product.flavour}
          </h3>
        </div>
        {product.badge ? (
          <span className="label-sm rounded-full border border-hairline px-3 py-1.5 text-muted/70">
            {product.badge}
          </span>
        ) : null}
      </header>

      <div className="relative my-6 flex h-[15rem] items-center justify-center">
        <img
          ref={bottle}
          data-bottle
          src={product.media.bottle}
          alt={product.name}
          loading={index < 2 ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          className="h-full w-auto drop-shadow-[0_26px_46px_rgba(0,0,0,0.6)] will-change-transform"
        />
      </div>

      <footer className="relative">
        <p className="serif-note mb-5 text-[1.15rem] leading-tight text-scoby/90">
          {product.tagline}
        </p>
        <TasteProfileMeter
          profile={product.profile}
          accent={product.colour.accent}
          active={hover}
        />
        <span className="label mt-6 flex items-center gap-2 text-bone/70 transition-colors group-hover:text-bone">
          EXPLORE
          <span className="transition-transform duration-500 group-hover:translate-x-1">
            &#8594;
          </span>
        </span>
      </footer>
    </article>
  );
}
