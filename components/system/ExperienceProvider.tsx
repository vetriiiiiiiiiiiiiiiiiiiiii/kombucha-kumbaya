'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface ExperienceState {
  /** true once the loading sequence has handed the page over */
  ready: boolean;
  reveal: () => void;
}

const ExperienceContext = createContext<ExperienceState>({ ready: false, reveal: () => {} });

/** Hero and nav wait on this so nothing animates behind the loader. */
export const useExperience = () => useContext(ExperienceContext);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const reveal = useCallback(() => setReady(true), []);
  const value = useMemo(() => ({ ready, reveal }), [ready, reveal]);

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}
