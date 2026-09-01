'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useSmoothScroll } from '@/components/system/SmoothScroll';
import { useExperience } from '@/components/system/ExperienceProvider';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/hooks/useEnvironment';
import { navigation, site } from '@/data/site';
import { cn } from '@/lib/utils';

/**
 * Minimal fixed navigation. Three states, all earned:
 *  · at the top it is weightless — no rule, no background
 *  · once past the hero it condenses and picks up a hairline and a blur
 *  · scrolling down hides it; scrolling up brings it straight back
 */
export function Nav() {
  const lenis = useSmoothScroll();
  const { ready } = useExperience();
  const reduced = useReducedMotion();

  const bar = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  const [condensed, setCondensed] = useState(false);
  const [open, setOpen] = useState(false);

  /* entrance */
  useIsomorphicLayoutEffect(() => {
    if (!ready || !bar.current) return;
    if (reduced) {
      gsap.set(bar.current, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bar.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.35 }
      );
    }, bar);
    return () => ctx.revert();
  }, [ready, reduced]);

  /* condense + hide-on-descend */
  useEffect(() => {
    let last = window.scrollY;
    let hidden = false;

    const onScroll = () => {
      const y = window.scrollY;
      const past = y > window.innerHeight * 0.85;
      setCondensed(past);

      if (!bar.current || open) return;
      const goingDown = y > last && y - last > 4;
      const goingUp = last - y > 6;

      if (goingDown && past && !hidden) {
        hidden = true;
        gsap.to(bar.current, { yPercent: -130, duration: 0.5, ease: 'power3.inOut' });
      } else if (goingUp && hidden) {
        hidden = false;
        gsap.to(bar.current, { yPercent: 0, duration: 0.5, ease: 'power3.out' });
      }
      last = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  /* full-screen menu on small screens */
  useIsomorphicLayoutEffect(() => {
    if (!menu.current) return;
    const items = menu.current.querySelectorAll('[data-menu-item]');

    if (open) {
      lenis?.stop();
      gsap.set(menu.current, { display: 'flex' });
      gsap.fromTo(
        menu.current,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'power4.inOut' }
      );
      gsap.fromTo(
        items,
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.06, delay: 0.16, ease: 'power4.out' }
      );
    } else {
      lenis?.start();
      gsap.to(menu.current, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.55,
        ease: 'power4.inOut',
        onComplete: () => gsap.set(menu.current, { display: 'none' }),
      });
    }
  }, [open]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    const target = document.querySelector(href);
    if (!target) return;
    if (lenis) lenis.scrollTo(target as HTMLElement, { offset: 0, duration: 1.6 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <>
      <header
        ref={bar}
        className="fixed inset-x-0 top-0 z-[80] opacity-0"
        style={{ opacity: ready ? undefined : 0 }}
      >
        <div
          ref={inner}
          className={cn(
            'flex items-center justify-between gutter transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
            condensed
              ? 'border-b border-hairline bg-void/72 py-3 backdrop-blur-md'
              : 'border-b border-transparent py-6'
          )}
        >
          <a
            href="#top"
            onClick={go('#top')}
            data-cursor="TOP"
            className="display text-[1.15rem] tracking-[-0.02em] text-bone transition-opacity hover:opacity-70 md:text-[1.35rem]"
          >
            {site.brand}
          </a>

          <nav className="hidden items-center gap-9 md:flex" aria-label="Sections">
            {navigation.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={go(item.href)}
                className="label group relative text-muted transition-colors duration-300 hover:text-bone"
              >
                {item.label}
                <span className="absolute -bottom-2 left-0 h-px w-0 bg-honey transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="#shop"
              onClick={go('#shop')}
              data-cursor="SHOP"
              className="label hidden rounded-full border border-hairline px-5 py-2.5 text-bone transition-colors duration-500 hover:border-honey hover:text-honey md:block"
            >
              SHOP
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="label flex items-center gap-2 text-bone md:hidden"
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? 'CLOSE' : 'MENU'}
              <span className="flex h-3 w-4 flex-col justify-between">
                <span
                  className={cn(
                    'block h-px w-full bg-bone transition-transform duration-300',
                    open && 'translate-y-[5.5px] rotate-45'
                  )}
                />
                <span className={cn('block h-px w-full bg-bone transition-opacity', open && 'opacity-0')} />
                <span
                  className={cn(
                    'block h-px w-full bg-bone transition-transform duration-300',
                    open && '-translate-y-[5.5px] -rotate-45'
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      <div
        ref={menu}
        className="fixed inset-0 z-[79] hidden flex-col justify-center bg-ink gutter"
        style={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      >
        <nav className="flex flex-col gap-2" aria-label="Menu">
          {[...navigation, { id: 'shop', label: 'SHOP', href: '#shop' }].map((item, i) => (
            <span key={item.id} className="block overflow-hidden">
              <a
                data-menu-item
                href={item.href}
                onClick={go(item.href)}
                className="display block text-[15vw] leading-[0.95] text-bone"
              >
                <span className="label-sm mr-4 align-super text-honey">0{i + 1}</span>
                {item.label}
              </a>
            </span>
          ))}
        </nav>

        <div className="mt-14 flex items-end justify-between">
          <span className="label-sm text-muted">{site.home}</span>
          <span className="label-sm text-muted">{site.est}</span>
        </div>
      </div>
    </>
  );
}
