import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'motion/react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const getInitialReducedMotion = () => (
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(REDUCED_MOTION_QUERY).matches
    : false
);

const MotionPreferenceContext = createContext(false);

export const MotionPreferenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reducedMotion, setReducedMotion] = useState(getInitialReducedMotion);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'full';
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    setReducedMotion(query.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  const value = useMemo(() => reducedMotion, [reducedMotion]);

  return (
    <MotionPreferenceContext.Provider value={value}>
      <MotionConfig reducedMotion={reducedMotion ? 'always' : 'never'}>
        {children}
      </MotionConfig>
    </MotionPreferenceContext.Provider>
  );
};

export const useReducedMotionPreference = () => useContext(MotionPreferenceContext);
