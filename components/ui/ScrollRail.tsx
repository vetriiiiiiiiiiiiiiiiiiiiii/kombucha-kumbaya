'use client';

import { useEffect, useRef, useState } from 'react';
import { useExperience } from '@/components/system/ExperienceProvider';
import { useFinePointer, useReducedMotion } from '@/hooks/useEnvironment';

/**
 * A fixed rail on the right edge: how far through the story you are, and which
 * chapter you are in. Written against real scroll position rather than a GSAP
 * timeline so it keeps working even when the ticker is throttled.
 */
export function ScrollRail() {
  const { ready } = useExperience();
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  const fill = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const [chapter, setChapter] = useState('');

  useEffect(() => {
    if (!ready) return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('main section')
    ).map((el) => ({
      el,
      name:
        el.dataset.chapter ??
        el.getAttribute('aria-label') ??
        el.id ??
        '',
    }));

    let frame = 0;

    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;

      if (fill.current) fill.current.style.transform = `scaleY(${p})`;
      if (pct.current) pct.current.textContent = String(Math.round(p * 100)).padStart(2, '0');

      // whichever section owns the middle of the screen
      const mid = window.scrollY + window.innerHeight / 2;
      let current = sections[0];
      for (const s of sections) {
        if (s.el.offsetTop <= mid) current = s;
      }
      if (current) setChapter(current.name);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ready]);

  if (!fine || reduced || !ready) return null;

  return (
    <div
      className="pointer-events-none fixed right-[clamp(1.25rem,2vw,2.2rem)] top-1/2 z-[70] hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex"
      aria-hidden
    >
      <span className="label-sm tabular-nums text-muted/60">
        <span ref={pct}>00</span>
      </span>

      <span className="relative block h-[38svh] w-px bg-hairline">
        <span
          ref={fill}
          className="absolute inset-x-0 top-0 block h-full origin-top bg-gradient-to-b from-honey to-amber"
          style={{ transform: 'scaleY(0)' }}
        />
      </span>

      {/* the chapter, set sideways along the rail */}
      <span
        className="label-sm whitespace-nowrap text-muted/70"
        style={{ writingMode: 'vertical-rl' }}
      >
        {chapter}
      </span>
    </div>
  );
}
