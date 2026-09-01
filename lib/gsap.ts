'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Single registration point for GSAP. Importing plugins in more than one place
 * causes double registration and duplicated ScrollTriggers under Fast Refresh.
 */
if (typeof window !== 'undefined') {
  // registerPlugin is idempotent, so repeat imports under Fast Refresh are safe.
  gsap.registerPlugin(ScrollTrigger);

  // Everything is driven by Lenis, so ScrollTrigger should not also listen for
  // resize-thrash on mobile browser chrome show/hide.
  ScrollTrigger.config({ ignoreMobileResize: true });

  gsap.defaults({ ease: 'power3.out', duration: 1 });
}

export { gsap, ScrollTrigger };

/** House easing — used anywhere GSAP is not doing the work. */
export const EASE = {
  soft: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const;
