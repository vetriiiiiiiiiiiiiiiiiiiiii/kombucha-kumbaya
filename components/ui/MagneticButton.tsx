'use client';

import { useRef, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';
import { useFinePointer, useReducedMotion } from '@/hooks/useEnvironment';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'solid' | 'ghost' | 'quiet';
  className?: string;
  cursor?: string;
  /** magnetic pull radius in px */
  strength?: number;
  arrow?: boolean;
}

/**
 * The house button. Three things happen on hover, all subtle: the button leans
 * toward the pointer, fermented colour floods it from the bottom, and the arrow
 * steps forward. On touch or reduced motion it is simply a button.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  variant = 'solid',
  className,
  cursor,
  strength = 26,
  arrow = true,
}: Props) {
  const root = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const flood = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  const magnetic = fine && !reduced;

  const onMove = (e: React.PointerEvent) => {
    if (!magnetic || !root.current || !inner.current) return;
    const r = root.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    gsap.to(root.current, { x: x * strength, y: y * strength * 0.5, duration: 0.6, ease: 'power3.out' });
    gsap.to(inner.current, { x: x * strength * 0.35, duration: 0.6, ease: 'power3.out' });
  };

  const onEnter = () => {
    if (reduced) return;
    gsap.to(flood.current, { yPercent: 0, duration: 0.55, ease: 'power3.out' });
    gsap.to(arrowRef.current, { x: 6, duration: 0.45, ease: 'power3.out' });
  };

  const onLeave = () => {
    gsap.to([root.current, inner.current], { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    if (reduced) return;
    gsap.to(flood.current, { yPercent: 101, duration: 0.45, ease: 'power3.in' });
    gsap.to(arrowRef.current, { x: 0, duration: 0.45, ease: 'power3.out' });
  };

  const base =
    'group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-7 py-4 label transition-colors duration-500 will-change-transform';

  const skin =
    variant === 'solid'
      ? 'bg-bone text-ink hover:text-bone'
      : variant === 'ghost'
        ? 'border border-hairline text-bone hover:text-ink'
        : 'text-muted hover:text-bone px-0 py-2';

  const floodSkin = variant === 'solid' ? 'bg-tea' : variant === 'ghost' ? 'bg-honey' : 'bg-transparent';

  const content = (
    <>
      {variant !== 'quiet' ? (
        <span
          ref={flood}
          aria-hidden
          className={cn('absolute inset-0 translate-y-full rounded-full', floodSkin)}
          style={{ transform: 'translateY(101%)' }}
        />
      ) : null}
      <span ref={inner} className="relative z-10 inline-flex items-center gap-3 whitespace-nowrap">
        {children}
        {arrow ? (
          <span ref={arrowRef} aria-hidden className="inline-block text-[1.05em] leading-none">
            &#8594;
          </span>
        ) : null}
      </span>
    </>
  );

  const shared = {
    ref: root,
    className: cn(base, skin, className),
    onPointerMove: onMove,
    onPointerEnter: onEnter,
    onPointerLeave: onLeave,
    onClick,
    'data-cursor': cursor,
  };

  return href ? (
    <a {...shared} href={href}>
      {content}
    </a>
  ) : (
    <button {...shared} type="button">
      {content}
    </button>
  );
}
