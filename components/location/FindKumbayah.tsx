'use client';

import { useMemo, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/hooks/useEnvironment';
import { SectionMeta } from '@/components/ui/SectionMeta';
import { AnimatedText } from '@/components/ui/AnimatedText';
import { IndiaPlate } from '@/components/location/IndiaPlate';
import { cities } from '@/data/locations';
import { cn } from '@/lib/utils';

const FILTERS = ['ALL', 'CAFÉ', 'RESTAURANT', 'RETAIL'] as const;
type Filter = (typeof FILTERS)[number];

/**
 * FIND KUMBAYAH — city first, then the room.
 *
 * Selecting a city on the plate swaps the list beside it. Everything is local
 * state over /data/locations.ts, so a CMS collection can replace the file
 * without touching the interaction.
 */
export function FindKumbayah() {
  const [selected, setSelected] = useState(cities[0].id);
  const [filter, setFilter] = useState<Filter>('ALL');
  const list = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();

  const city = useMemo(
    () => cities.find((c) => c.id === selected) ?? cities[0],
    [selected]
  );

  const venues = useMemo(
    () => (filter === 'ALL' ? city.venues : city.venues.filter((v) => v.type === filter)),
    [city, filter]
  );

  /* the list re-deals itself whenever the city or filter changes */
  useIsomorphicLayoutEffect(() => {
    if (!list.current || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        list.current!.children,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out' }
      );
    }, list);
    return () => ctx.revert();
  }, [selected, filter, reduced]);

  const liveCount = cities.filter((c) => c.status === 'LIVE').length;

  return (
    <section id="find"
      data-chapter="FIND KUMBAYAH" className="relative bg-ink py-[13svh]" aria-label="Find Kumbayah">
      <div className="gutter">
        <SectionMeta
          index="09"
          label="STOCKISTS"
          note="Placeholder locations for the prototype."
        />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <AnimatedText
            text="FIND YOUR BOOCH."
            as="h2"
            mode="chars"
            className="display-tight max-w-[12ch] text-[clamp(2.4rem,7.5vw,7rem)] text-bone"
          />
          <p className="label text-muted/70">
            {liveCount} CITIES LIVE / {cities.length - liveCount} OPENING
          </p>
        </div>

        <div className="mt-14 grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          {/* the plate */}
          <div className="relative mx-auto w-full max-w-[30rem] lg:max-w-none">
            <IndiaPlate selected={selected} onSelect={setSelected} />
          </div>

          {/* the city */}
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between border-b border-hairline pb-5">
              <div>
                <h3 className="display text-[clamp(1.8rem,3.6vw,3rem)] text-bone">{city.name}</h3>
                <span className="label-sm mt-2 block text-muted/60">{city.state}</span>
              </div>
              <span
                className={cn(
                  'label rounded-full border px-4 py-2',
                  city.status === 'LIVE'
                    ? 'border-honey/50 text-honey'
                    : 'border-hairline text-muted/60'
                )}
              >
                {city.status === 'LIVE' ? `${city.count} PLACES` : 'OPENING SOON'}
              </span>
            </div>

            {/* filters */}
            <div className="mt-6 flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    'label rounded-full border px-4 py-2 transition-colors duration-400',
                    filter === f
                      ? 'border-bone bg-bone text-ink'
                      : 'border-hairline text-muted hover:border-honey hover:text-honey'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* venues */}
            <ul ref={list} className="mt-8 flex flex-col">
              {venues.map((v) => (
                <li
                  key={v.id}
                  className="group flex items-baseline justify-between gap-6 border-b border-hairline/60 py-5 transition-colors hover:border-honey/50"
                >
                  <div>
                    <span className="block text-[1.05rem] text-bone transition-colors group-hover:text-honey">
                      {v.name}
                    </span>
                    <span className="label-sm mt-1.5 block text-muted/60">{v.area}</span>
                  </div>
                  <span className="label-sm shrink-0 text-muted/50">{v.type}</span>
                </li>
              ))}
              {venues.length === 0 ? (
                <li className="py-8 text-[0.95rem] text-muted">
                  Nothing of that kind here yet — try another filter.
                </li>
              ) : null}
            </ul>

            <p className="mt-10 max-w-[44ch] text-[0.9rem] leading-relaxed text-muted/70">
              Stocking Kumbayah? The full trade list, delivery days and crate
              returns live in the partner portal.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
