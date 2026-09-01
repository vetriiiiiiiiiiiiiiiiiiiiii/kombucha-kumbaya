'use client';

import { cn } from '@/lib/utils';

interface Props {
  index: string;
  label: string;
  note?: string;
  className?: string;
  tone?: 'light' | 'dark';
}

/**
 * The thin editorial header that runs above sections: index, section name and
 * an optional aside. It is the connective tissue that makes the site read as
 * one document instead of a stack of blocks.
 */
export function SectionMeta({ index, label, note, className, tone = 'light' }: Props) {
  return (
    <div
      className={cn(
        'flex w-full items-baseline justify-between gap-6 border-t pt-4',
        tone === 'light' ? 'border-hairline' : 'border-ink/20',
        className
      )}
    >
      <div className="flex items-baseline gap-5">
        <span className={cn('label-sm', tone === 'light' ? 'text-honey' : 'text-tea')}>{index}</span>
        <span className={cn('label', tone === 'light' ? 'text-bone/80' : 'text-ink/80')}>{label}</span>
      </div>
      {note ? (
        <span
          className={cn(
            'label-sm hidden max-w-[42ch] text-right md:block',
            tone === 'light' ? 'text-muted/70' : 'text-ink/45'
          )}
        >
          {note}
        </span>
      ) : null}
    </div>
  );
}
