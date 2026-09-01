'use client';

import { cities } from '@/data/locations';
import { cn } from '@/lib/utils';

/**
 * An interpretive plate of India — drawn, not surveyed, and labelled as such.
 * A tile-server embed would drag in a third-party map style and break the art
 * direction; this is a single path we control, in the palette of the site.
 */
const INDIA =
  'M30 4 C34 8 40 10 44 14 C52 20 58 26 64 30 C70 33 76 34 82 33 C86 36 90 40 92 45 ' +
  'C88 48 84 47 80 45 C78 50 76 54 72 56 C70 52 68 50 64 52 C62 56 60 58 58 62 ' +
  'C54 70 50 78 46 86 C42 94 38 100 35 106 C32 102 29 96 27 90 C24 82 22 74 20 66 ' +
  'C18 60 16 54 12 50 C8 47 6 44 9 41 C13 40 16 42 19 40 C20 34 22 28 24 22 ' +
  'C25 16 26 9 30 4 Z';

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export function IndiaPlate({ selected, onSelect }: Props) {
  return (
    <svg
      viewBox="-6 -6 112 124"
      className="w-full"
      role="img"
      aria-label="Where to find Kumbayah across India"
    >
      <defs>
        <linearGradient id="plate-fill" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#1B1309" />
          <stop offset="60%" stopColor="#120D07" />
          <stop offset="100%" stopColor="#0B0805" />
        </linearGradient>
        <radialGradient id="plate-glow" cx="42%" cy="72%" r="42%">
          <stop offset="0%" stopColor="#C0762A" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#C0762A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* registration grid, like a printed plate */}
      <g stroke="#3A2C1C" strokeWidth="0.15" opacity="0.5">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`v${i}`} x1={i * 12.5} y1={-6} x2={i * 12.5} y2={118} />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`h${i}`} x1={-6} y1={i * 13} x2={106} y2={i * 13} />
        ))}
      </g>

      <ellipse cx="42" cy="86" rx="46" ry="40" fill="url(#plate-glow)" />

      <path d={INDIA} fill="url(#plate-fill)" stroke="#6B5B45" strokeWidth="0.45" strokeLinejoin="round" />
      <path d={INDIA} fill="none" stroke="#E2A03F" strokeWidth="0.2" opacity="0.35" transform="translate(0.6 0.6)" />

      {cities.map((city) => {
        const on = city.id === selected;
        const live = city.status === 'LIVE';
        return (
          <g
            key={city.id}
            role="button"
            tabIndex={0}
            aria-label={`${city.name}, ${city.state}`}
            aria-pressed={on}
            onClick={() => onSelect(city.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(city.id);
              }
            }}
            className="cursor-pointer outline-none"
            data-cursor={on ? undefined : 'SELECT'}
          >
            {/* generous hit area, invisible */}
            <circle cx={city.x} cy={city.y} r="4.5" fill="transparent" />

            {on ? (
              <circle
                cx={city.x}
                cy={city.y}
                r="2.6"
                fill="none"
                stroke="#E2A03F"
                strokeWidth="0.3"
                style={{ animation: 'kb-pulse 2.4s ease-in-out infinite', transformOrigin: `${city.x}px ${city.y}px` }}
              />
            ) : null}

            <circle
              cx={city.x}
              cy={city.y}
              r={on ? 1.5 : 0.95}
              fill={live ? (on ? '#E2A03F' : '#C0762A') : '#6B5B45'}
              className="transition-all duration-500"
            />

            <text
              x={city.x + 3}
              y={city.y + 1}
              fill={on ? '#F3EDE1' : live ? '#9C8E79' : '#6B5B45'}
              style={{
                fontSize: on ? 3.1 : 2.6,
                letterSpacing: '0.14em',
                transition: 'all 0.4s ease',
              }}
              className={cn('select-none', on && 'font-medium')}
            >
              {city.name}
            </text>
          </g>
        );
      })}

      <text x="-4" y="116" fill="#6B5B45" style={{ fontSize: 2.4, letterSpacing: '0.22em' }}>
        PLATE 01 — INTERPRETIVE. NOT TO SCALE.
      </text>
    </svg>
  );
}
