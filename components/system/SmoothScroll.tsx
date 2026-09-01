'use client';

import Lenis from 'lenis';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/useEnvironment';

const LenisContext = createContext<Lenis | null>(null);

/** Access the scroll instance — used by the nav, the loader and section links. */
export const useSmoothScroll = () => useContext(LenisContext);

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const reduced = useReducedMotion();
  const raf = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    // Reduced motion gets native scrolling. ScrollTrigger still works, it just
    // reads the real scroll position instead of an interpolated one.
    if (reduced) {
      ScrollTrigger.refresh();
      return;
    }

    const instance = new Lenis({
      duration: 1.15,
      lerp: 0.085,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      smoothWheel: true,
      syncTouch: false,
    });

    instance.on('scroll', ScrollTrigger.update);

    raf.current = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf.current);
    gsap.ticker.lagSmoothing(0);

    setLenis(instance);

    return () => {
      if (raf.current) gsap.ticker.remove(raf.current);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
