'use client';

import type { ReactNode } from 'react';
import { ExperienceProvider } from '@/components/system/ExperienceProvider';
import { SmoothScroll } from '@/components/system/SmoothScroll';
import { Loader } from '@/components/system/Loader';
import { Cursor } from '@/components/ui/Cursor';
import { Grain } from '@/components/ui/Grain';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ExperienceProvider>
      <SmoothScroll>
        <Loader />
        <Cursor />
        <Grain />
        {children}
      </SmoothScroll>
    </ExperienceProvider>
  );
}
