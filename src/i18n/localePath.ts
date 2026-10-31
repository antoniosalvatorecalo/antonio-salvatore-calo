import type { Locale } from './translations';

/** English lives at the root, Italian under `/it`. Paths elsewhere are always the English form. */
export const LOCALES: Locale[] = ['EN', 'IT'];
const IT_PREFIX = '/it';
const IT_PREFIX_PATTERN = /^\/it(?=[/?#]|$)/;

export function localeFromPath(pathname: string): Locale {
  return IT_PREFIX_PATTERN.test(pathname) ? 'IT' : 'EN';
}

/** Removes the locale prefix: `/it/projects/x` → `/projects/x`, `/it` → `/`. Keeps search and hash. */
export function stripLocale(url: string): string {
  const stripped = url.replace(IT_PREFIX_PATTERN, '');
  return stripped.startsWith('/') ? stripped : `/${stripped}`;
}

/** Adds the locale prefix to an English path: (`/contact`, IT) → `/it/contact`. */
export function localizePath(path: string, locale: Locale): string {
  const base = stripLocale(path);
  if (locale === 'EN') return base;
  return base === '/' || /^\/[?#]/.test(base)
    ? `${IT_PREFIX}${base.slice(1)}`
    : `${IT_PREFIX}${base}`;
}

export const htmlLang = (locale: Locale) => locale.toLowerCase() as 'en' | 'it';
export const ogLocale = (locale: Locale) => (locale === 'IT' ? 'it_IT' : 'en_US');
