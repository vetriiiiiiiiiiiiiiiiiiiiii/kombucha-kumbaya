'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useFinePointer, useReducedMotion } from '@/hooks/useEnvironment';

/**
 * The same silhouette as the product bottles, drawn in the generator and on the
 * shelf — so the pointer is a Kumbayah bottle rather than a novelty shape.
 */
const BODY =
  'M148 96 L148 208 C148 246 104 268 104 330 L104 902 C104 936 122 952 156 952 ' +
  'L244 952 C278 952 296 936 296 902 L296 330 C296 268 252 246 252 208 L252 96 Z';

/**
 * Desktop cursor: a small bottle that leans into the direction it is travelling,
 * with a ring that lags behind it and takes on a word over anything interactive.
 * Any element can label it with data-cursor="EXPLORE". Never rendered on touch.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const bottle = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const labelEl = useRef<HTMLSpanElement>(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!fine || reduced) return;

    const bottleEl = bottle.current;
    const ringEl = ring.current;
    if (!bottleEl || !ringEl) return;

    document.documentElement.style.cursor = 'none';

    // Centring lives in GSAP, not CSS — otherwise quickTo would overwrite it.
    gsap.set([bottleEl, ringEl], { xPercent: -50, yPercent: -50 });

    const bx = gsap.quickTo(bottleEl, 'x', { duration: 0.1, ease: 'power3' });
    const by = gsap.quickTo(bottleEl, 'y', { duration: 0.1, ease: 'power3' });
    const rx = gsap.quickTo(ringEl, 'x', { duration: 0.34, ease: 'power3' });
    const ry = gsap.quickTo(ringEl, 'y', { duration: 0.34, ease: 'power3' });
    const tilt = gsap.quickTo(bottleEl, 'rotation', { duration: 0.5, ease: 'power2' });

    let visible = false;
    let lastX = 0;
    let lastT = 0;
    let hovering = false;

    /**
     * show/hide are symmetric on purpose. An earlier version faded the cursor
     * out on pointerleave without clearing the flag, so the guard in onMove
     * could never restore it — one trip outside the window (a second monitor,
     * the tab bar, devtools) or one setPointerCapture from the flavour rail
     * hid the cursor permanently. With the native cursor also set to none,
     * that left no pointer at all. Any pointer movement now heals it.
     */
    // Fading is done with a CSS transition on a directly written style rather
    // than a tween: whether the visitor can see their own cursor must not
    // depend on an animation ticker still running.
    for (const el of [bottleEl, ringEl]) {
      el.style.transition = 'opacity 0.28s ease';
    }

    const setOpacity = (v: string) => {
      bottleEl.style.opacity = v;
      ringEl.style.opacity = v;
    };

    const show = () => {
      if (visible) return;
      visible = true;
      setOpacity('1');
    };

    const hide = () => {
      if (!visible) return;
      visible = false;
      setOpacity('0');
    };

    const onMove = (e: PointerEvent) => {
      show();

      bx(e.clientX);
      by(e.clientY);
      rx(e.clientX);
      ry(e.clientY);

      // Lean into the direction of travel — a carried bottle, not a spinning
      // icon. Held steady while hovering, where the pour angle takes over.
      const now = performance.now();
      const dt = Math.max(now - lastT, 1);
      const vx = ((e.clientX - lastX) / dt) * 16;
      lastX = e.clientX;
      lastT = now;
      if (!hovering) tilt(gsap.utils.clamp(-16, 16, vx * 1.1));
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement)?.closest?.('[data-cursor]') as HTMLElement | null;
      const next = target?.dataset.cursor ?? '';
      hovering = Boolean(next);
      setLabel(next);

      gsap.to(ringEl, {
        width: next ? 104 : 46,
        height: next ? 104 : 46,
        borderColor: next ? 'rgba(226,160,63,0.9)' : 'rgba(243,237,225,0.28)',
        backgroundColor: next ? 'rgba(226,160,63,0.08)' : 'rgba(243,237,225,0)',
        duration: 0.45,
        ease: 'power3.out',
      });

      // Over something interactive the bottle tips as if to pour, and lifts so
      // the word sits underneath it.
      gsap.to(bottleEl, {
        rotation: next ? -32 : 0,
        scale: next ? 0.82 : 1,
        yPercent: next ? -78 : -50,
        duration: 0.5,
        ease: 'power3.out',
      });

      if (labelEl.current) {
        gsap.to(labelEl.current, {
          opacity: next ? 1 : 0,
          y: next ? 0 : 6,
          duration: 0.35,
          delay: next ? 0.08 : 0,
        });
      }
    };

    const onDown = () => gsap.to(ringEl, { scale: 0.84, duration: 0.2 });
    const onUp = () => gsap.to(ringEl, { scale: 1, duration: 0.35 });

    // Only a genuine exit from the document counts as leaving. A pointerout
    // with a relatedTarget is just the pointer crossing between elements.
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) hide();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointerout', onOut, { passive: true });
    document.documentElement.addEventListener('pointerenter', show);
    window.addEventListener('blur', hide);

    return () => {
      document.documentElement.style.cursor = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointerout', onOut);
      document.documentElement.removeEventListener('pointerenter', show);
      window.removeEventListener('blur', hide);
    };
  }, [fine, reduced]);

  if (!fine || reduced) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] hidden lg:block" aria-hidden>
      <div
        ref={ring}
        className="absolute left-0 top-0 flex h-[46px] w-[46px] items-end justify-center rounded-full border pb-3 opacity-0"
        style={{ borderColor: 'rgba(243,237,225,0.28)' }}
      >
        <span ref={labelEl} className="label-sm whitespace-nowrap text-honey opacity-0">
          {label}
        </span>
      </div>

      <div ref={bottle} className="absolute left-0 top-0 opacity-0 will-change-transform">
        <svg
          width="14"
          height="35"
          viewBox="0 0 400 1000"
          fill="none"
          className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
        >
          <defs>
            <clipPath id="kb-cursor-body">
              <path d={BODY} />
            </clipPath>
          </defs>

          {/* A dark edge sits under the bone one so the bottle stays legible
              against the light primary buttons as well as the dark page. */}
          <path d={BODY} stroke="rgba(8,6,4,0.7)" strokeWidth="76" strokeLinejoin="round" />
          <rect x="128" y="32" width="144" height="82" rx="14" fill="rgba(8,6,4,0.7)" />

          {/* liquid, sitting at the fill line */}
          <g clipPath="url(#kb-cursor-body)">
            <rect x="0" y="440" width="400" height="600" fill="#E2A03F" />
          </g>

          <path d={BODY} fill="rgba(243,237,225,0.12)" stroke="#F3EDE1" strokeWidth="30" />
          <rect x="136" y="40" width="128" height="66" rx="10" fill="#F3EDE1" />
        </svg>
      </div>
    </div>
  );
}
