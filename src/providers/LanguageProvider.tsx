import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Locale } from '../i18n/translations';
import { t as translate } from '../i18n/translations';
import { htmlLang, localeFromPath, localizePath } from '../i18n/localePath';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
  /** Turns an English path (`/projects/x`) into the current locale's URL. */
  localize: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** The URL is the source of truth: `/it…` is Italian, everything else English. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const locale = localeFromPath(location.pathname);

  useEffect(() => {
    document.documentElement.lang = htmlLang(locale);
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      const url = location.pathname + location.search + location.hash;
      // Replace keeps Back/Forward on the same page in either language; state keeps the project selection.
      navigate(localizePath(url, next), { replace: true, state: location.state });
    },
    [locale, location, navigate],
  );

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'EN' ? 'IT' : 'EN');
  }, [locale, setLocale]);

  const translateKey = useCallback((key: string) => translate(key, locale), [locale]);
  const localize = useCallback((path: string) => localizePath(path, locale), [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t: translateKey, localize }),
    [locale, setLocale, toggleLocale, translateKey, localize],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
