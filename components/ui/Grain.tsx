'use client';

import { useReducedMotion } from '@/hooks/useEnvironment';

/**
 * A single fixed grain plate over the whole document. One element, one
 * composited animation — cheaper and more consistent than per-section noise.
 */
export function Grain() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div
      className="grain-layer"
      style={{ animation: 'kb-grain 3.6s steps(1) infinite' }}
      aria-hidden
    />
  );
}
