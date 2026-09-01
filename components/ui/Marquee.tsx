'use client';

import { cn } from '@/lib/utils';

interface Props {
  items: string[];
  className?: string;
  /** seconds for one full pass */
  duration?: number;
  reverse?: boolean;
  separator?: string;
}

/**
 * CSS-only ticker. No JS loop, no ScrollTrigger — it costs one composited
 * transform and keeps running while the main thread is busy elsewhere.
 */
export function Marquee({
  items,
  className,
  duration = 38,
  reverse = false,
  separator = '·',
}: Props) {
  const run = [...items, ...items];

  return (
    <div className={cn('relative flex overflow-hidden select-none', className)} aria-hidden>
      <div
        className="flex shrink-0 items-center gap-8 pr-8 will-change-transform"
        style={{
          animation: `kb-marquee ${duration}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {run.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-8">
            <span>{item}</span>
            <span className="text-honey/60">{separator}</span>
          </span>
        ))}
      </div>
      <div
        className="flex shrink-0 items-center gap-8 pr-8 will-change-transform"
        style={{
          animation: `kb-marquee ${duration}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {run.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-8">
            <span>{item}</span>
            <span className="text-honey/60">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
