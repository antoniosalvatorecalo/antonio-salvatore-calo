import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Locale } from '../i18n/translations';
import { t as translate } from '../i18n/translations';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('EN');

  useEffect(() => {
    document.documentElement.lang = locale.toLowerCase();
  }, [locale]);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'EN' ? 'IT' : 'EN'));
  }, []);

  const translateKey = useCallback((key: string) => translate(key, locale), [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t: translateKey }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
