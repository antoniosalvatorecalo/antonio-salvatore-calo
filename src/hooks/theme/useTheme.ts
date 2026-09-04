import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const getStoredOrSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';

  try {
    const stored = window.localStorage.getItem('me-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}

  return 'dark';
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getStoredOrSystemTheme);

  useEffect(() => {
    setTheme(getStoredOrSystemTheme());
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
    }
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem('me-theme', theme); } catch {}
    }
  }, [theme]);

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return { theme, toggle };
}
