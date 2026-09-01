'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

/** useLayoutEffect that does not warn during SSR. */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function useMediaQuery(query: string, fallback = false) {
  const [matches, setMatches] = useState(fallback);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** True when the visitor has asked the OS to calm things down. */
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/** True on a real pointer — gates the custom cursor and hover-only motion. */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)');

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px)');

/**
 * The single decision every heavy visual asks: do we run the full experience?
 * Desktop + fine pointer + motion allowed. Everything else gets the calm build.
 */
export function useImmersive() {
  const desktop = useIsDesktop();
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && desktop && fine && !reduced;
}
