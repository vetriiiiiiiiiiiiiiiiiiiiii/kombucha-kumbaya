'use client';

import type { TasteProfile as Profile } from '@/types';
import { cn } from '@/lib/utils';

const KEYS: Array<[keyof Profile, string]> = [
  ['sweet', 'SWEET'],
  ['tart', 'TART'],
  ['fizz', 'FIZZ'],
  ['depth', 'DEPTH'],
];

/**
 * Four hairlines instead of a chart. Enough to compare two bottles at a glance,
 * quiet enough to sit next to the product without competing with it.
 */
export function TasteProfileMeter({
  profile,
  accent,
  className,
  active = true,
}: {
  profile: Profile;
  accent: string;
  className?: string;
  active?: boolean;
}) {
  return (
    <dl className={cn('flex flex-col gap-2.5', className)}>
      {KEYS.map(([key, label]) => (
        <div key={key} className="flex items-center gap-4">
          <dt className="label-sm w-14 shrink-0 text-muted/70">{label}</dt>
          <dd className="relative h-px flex-1 bg-hairline">
            <span
              className="absolute inset-y-0 left-0 block origin-left transition-[width] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                width: active ? `${profile[key]}%` : '0%',
                background: accent,
                boxShadow: `0 0 12px ${accent}66`,
              }}
            />
          </dd>
          <span className="label-sm w-7 shrink-0 text-right text-muted/50 tabular-nums">
            {profile[key]}
          </span>
        </div>
      ))}
    </dl>
  );
}
