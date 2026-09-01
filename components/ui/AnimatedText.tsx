'use client';

import { useRef, type ElementType, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/hooks/useEnvironment';
import { cn } from '@/lib/utils';

type Mode = 'chars' | 'words' | 'lines';

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  mode?: Mode;
  delay?: number;
  stagger?: number;
  /** ScrollTrigger start; pass null to play immediately on mount */
  start?: string | null;
  /**
   * Element to trigger on. Required when the text sits inside a sticky or
   * pinned container: a sticky element holds still against the viewport, so its
   * own position is not a dependable cue. Pass the enclosing scroll section.
   */
  triggerRef?: React.RefObject<HTMLElement | null>;
  /** run once the loader has handed over */
  play?: boolean;
  children?: ReactNode;
}

/**
 * Split-text reveal. Written by hand rather than pulled from a plugin so the
 * markup stays accessible: the readable string lives on aria-label and every
 * fragment is hidden from the accessibility tree.
 */
export function AnimatedText({
  text,
  as: El = 'span',
  className,
  mode = 'chars',
  delay = 0,
  stagger,
  start = 'top 85%',
  play = true,
  triggerRef,
}: Props) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    // Reduced motion: the text is already in place, so simply never move it.
    if (!root.current || !play || reduced) return;
    const targets = root.current.querySelectorAll<HTMLElement>('[data-piece]');
    if (!targets.length) return;

    const each = stagger ?? (mode === 'chars' ? 0.022 : mode === 'words' ? 0.05 : 0.09);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { yPercent: 112, opacity: 0, rotate: mode === 'chars' ? 2 : 0 },
        {
          yPercent: 0,
          opacity: 1,
          rotate: 0,
          duration: 1.05,
          delay,
          ease: 'power4.out',
          stagger: { each, from: 'start' },
          scrollTrigger: start
            ? { trigger: triggerRef?.current ?? root.current, start, once: true }
            : undefined,
        }
      );
    }, root);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [mode, delay, stagger, start, play, text, reduced, triggerRef]);

  const words = text.split(' ');

  // Polymorphic tag with a forwarded ref: TS cannot narrow an ElementType down
  // to "accepts a ref", so it is asserted once here rather than at every use.
  const Tag = El as unknown as React.ComponentType<{
    ref: React.Ref<HTMLElement>;
    className?: string;
    'aria-label'?: string;
    children?: ReactNode;
  }>;

  return (
    <Tag ref={root} className={cn('block', className)} aria-label={text}>
      {mode === 'words' || mode === 'lines'
        ? words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden>
              <span data-piece className="inline-block will-change-transform">
                {w}
              </span>
              {i < words.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
            </span>
          ))
        : words.map((w, i) => (
            <span key={i} className="inline-block whitespace-nowrap" aria-hidden>
              {w.split('').map((c, j) => (
                <span key={j} className="inline-block overflow-hidden align-bottom">
                  <span data-piece className="inline-block will-change-transform">
                    {c}
                  </span>
                </span>
              ))}
              {i < words.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
            </span>
          ))}
    </Tag>
  );
}
