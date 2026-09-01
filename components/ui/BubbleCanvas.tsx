'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useEnvironment';
import { seeded } from '@/lib/utils';

interface Bubble {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  phase: number;
  alpha: number;
}

interface Props {
  /** bubbles per million device-independent pixels */
  density?: number;
  speed?: number;
  colour?: string;
  className?: string;
  /** 0 = still, 1 = full rise. Animatable from the outside via a ref. */
  intensityRef?: React.MutableRefObject<number>;
  seed?: number;
  maxRadius?: number;
}

/**
 * A rising bubble field on 2D canvas — used for the loader, the fermentation
 * chamber and the closing frame. Deliberately not WebGL: a few hundred arcs are
 * cheaper than a shader pipeline and hold 60fps on low-end phones.
 */
export function BubbleCanvas({
  density = 26,
  speed = 1,
  colour = '226, 160, 63',
  className,
  intensityRef,
  seed = 7,
  maxRadius = 5,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let bubbles: Bubble[] = [];
    let frame = 0;
    let running = true;
    const rand = seeded(seed);

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round((width * height * density) / 1_000_000);
      bubbles = Array.from({ length: count }, () => ({
        x: rand() * width,
        y: rand() * height,
        r: 0.6 + rand() * maxRadius,
        speed: 0.15 + rand() * 0.7,
        drift: 0.2 + rand() * 0.9,
        phase: rand() * Math.PI * 2,
        alpha: 0.12 + rand() * 0.5,
      }));
    };

    const draw = (t: number) => {
      const intensity = intensityRef?.current ?? 1;
      ctx.clearRect(0, 0, width, height);

      for (const b of bubbles) {
        b.y -= b.speed * speed * intensity;
        b.phase += 0.01 * b.drift;
        if (b.y + b.r < 0) {
          b.y = height + b.r;
          b.x = rand() * width;
        }
        const x = b.x + Math.sin(b.phase + t * 0.0004) * b.drift * 9;

        ctx.beginPath();
        ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colour}, ${b.alpha * 0.34 * intensity})`;
        ctx.fill();

        // meniscus highlight — what makes them read as bubbles, not dots
        ctx.beginPath();
        ctx.arc(x, b.y, b.r, Math.PI * 0.9, Math.PI * 1.75);
        ctx.strokeStyle = `rgba(${colour}, ${b.alpha * intensity})`;
        ctx.lineWidth = Math.max(b.r * 0.22, 0.5);
        ctx.stroke();
      }

      if (running) frame = requestAnimationFrame(draw);
    };

    const still = () => {
      ctx.clearRect(0, 0, width, height);
      for (const b of bubbles) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colour}, ${b.alpha * 0.3})`;
        ctx.fill();
      }
    };

    build();

    if (reduced) {
      still();
    } else {
      frame = requestAnimationFrame(draw);
    }

    const onResize = () => {
      build();
      if (reduced) still();
    };
    window.addEventListener('resize', onResize);

    // Stop drawing when the field scrolls away.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (reduced) return;
        if (entry.isIntersecting && !running) {
          running = true;
          frame = requestAnimationFrame(draw);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(frame);
        }
      },
      { rootMargin: '120px' }
    );
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      io.disconnect();
    };
  }, [colour, density, intensityRef, maxRadius, reduced, seed, speed]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
