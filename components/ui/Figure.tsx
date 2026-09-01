'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/hooks/useEnvironment';
import { cn } from '@/lib/utils';

interface Props {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** css aspect-ratio, e.g. "4 / 5" */
  ratio?: string;
  /** parallax travel in percent of height; 0 disables */
  parallax?: number;
  caption?: string;
  index?: string;
  priority?: boolean;
  cursor?: string;
  hoverScale?: boolean;
}

/**
 * Every image in the site goes through here: mask reveal on entry, optional
 * parallax drift, hover scale, and a mono caption slot. Images are plain <img>
 * with lazy loading — the placeholders are SVG, and real photography can be
 * swapped in at the same paths without touching this component.
 */
export function Figure({
  src,
  alt,
  className,
  imgClassName,
  ratio = '4 / 5',
  parallax = 0,
  caption,
  index,
  priority = false,
  cursor,
  hoverScale = true,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const mask = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (reduced || !root.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        mask.current,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.5,
          ease: 'power4.out',
          scrollTrigger: { trigger: root.current, start: 'top 88%', once: true },
        }
      );
      gsap.fromTo(
        img.current,
        { scale: 1.22 },
        {
          scale: 1,
          duration: 1.8,
          ease: 'power4.out',
          scrollTrigger: { trigger: root.current, start: 'top 88%', once: true },
        }
      );

      if (parallax) {
        gsap.fromTo(
          img.current,
          { yPercent: -parallax / 2 },
          {
            yPercent: parallax / 2,
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }
    }, root);

    return () => ctx.revert();
  }, [parallax, reduced]);

  return (
    <figure ref={root} className={cn('relative', className)} data-cursor={cursor}>
      <div
        ref={mask}
        className="relative overflow-hidden bg-soil"
        style={{ aspectRatio: ratio }}
      >
        <img
          ref={img}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'h-full w-full object-cover will-change-transform',
            hoverScale && 'transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]',
            imgClassName
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/55 via-transparent to-transparent" />
      </div>

      {(caption || index) && (
        <figcaption className="mt-4 flex items-baseline justify-between gap-6">
          {caption ? <span className="label text-muted">{caption}</span> : <span />}
          {index ? <span className="label-sm text-muted/60">{index}</span> : null}
        </figcaption>
      )}
    </figure>
  );
}
