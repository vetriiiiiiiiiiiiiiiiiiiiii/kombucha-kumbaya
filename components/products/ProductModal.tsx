'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useSmoothScroll } from '@/components/system/SmoothScroll';
import { useReducedMotion } from '@/hooks/useEnvironment';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { TasteProfileMeter } from '@/components/products/TasteProfile';
import type { Product } from '@/types';

/**
 * The bottle, opened. Deliberately not a card grid modal: macro liquid on one
 * side, the reading matter on the other, and a way out at every corner.
 */
export function ProductModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const lenis = useSmoothScroll();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!product) return;
    lenis?.stop();
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    if (!reduced && root.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.35 });
        gsap.fromTo(
          panel.current,
          { yPercent: 6, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power4.out', delay: 0.06 }
        );
        gsap.fromTo(
          panel.current?.querySelectorAll('[data-stagger]') ?? [],
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'power3.out', delay: 0.22 }
        );
      }, root);
      return () => {
        window.removeEventListener('keydown', onKey);
        lenis?.start();
        document.body.style.overflow = '';
        ctx.revert();
      };
    }

    return () => {
      window.removeEventListener('keydown', onKey);
      lenis?.start();
      document.body.style.overflow = '';
    };
  }, [product, lenis, onClose, reduced]);

  if (!product) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[85] flex items-end justify-center bg-void/88 backdrop-blur-sm md:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        className="relative max-h-[92svh] w-full overflow-y-auto border-t border-hairline bg-ink md:max-h-[86svh] md:w-[min(1100px,92vw)] md:border"
      >
        <button
          type="button"
          onClick={onClose}
          data-cursor="CLOSE"
          className="label absolute right-5 top-5 z-10 text-muted transition-colors hover:text-bone"
        >
          CLOSE
        </button>

        <div className="grid md:grid-cols-[0.85fr_1fr]">
          {/* macro */}
          <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[520px]">
            <img
              src={product.media.macro}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
            />
            <img
              src={product.media.bottle}
              alt={product.name}
              className="absolute left-1/2 top-1/2 h-[78%] w-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)]"
            />
          </div>

          {/* reading matter */}
          <div className="flex flex-col gap-7 p-7 md:p-12">
            <div data-stagger>
              <span className="label" style={{ color: product.colour.accent }}>
                {product.badge ?? 'KUMBAYAH'}
              </span>
              <h3 className="display mt-4 text-[clamp(2rem,4.4vw,3.4rem)] text-bone">
                {product.flavour}
              </h3>
              <p className="serif-note mt-2 text-[1.4rem] leading-tight text-scoby">
                {product.tagline}
              </p>
            </div>

            <p data-stagger className="max-w-[46ch] text-[0.98rem] leading-relaxed text-muted">
              {product.description}
            </p>

            <div data-stagger className="grid grid-cols-2 gap-6 border-y border-hairline py-6">
              <div>
                <span className="label-sm block text-muted/60">FLAVOUR NOTES</span>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {product.notes.map((n) => (
                    <li key={n} className="text-[0.92rem] text-bone/85">
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-5">
                <div>
                  <span className="label-sm block text-muted/60">SIZE</span>
                  <span className="mt-2 block text-[0.92rem] text-bone/85">{product.size}</span>
                </div>
                <div>
                  <span className="label-sm block text-muted/60">SERVE</span>
                  <span className="mt-2 block text-[0.92rem] text-bone/85">{product.serve}</span>
                </div>
              </div>
            </div>

            <div data-stagger>
              <span className="label-sm mb-4 block text-muted/60">TASTE PROFILE</span>
              <TasteProfileMeter profile={product.profile} accent={product.colour.accent} />
            </div>

            <div data-stagger className="flex flex-wrap items-center gap-3 pt-1">
              <MagneticButton href="#shop" variant="solid" cursor="SHOP" onClick={onClose}>
                ADD TO CRATE
              </MagneticButton>
              <span className="label text-muted/60">CONCEPT ONLY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
