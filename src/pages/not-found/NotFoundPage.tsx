import { Link } from 'react-router-dom';
import { useLanguage } from '@/providers/LanguageProvider';

/** Unknown URLs and project slugs. `SeoManager` marks the page `noindex`. */
export function NotFoundPage() {
  const { t, localize } = useLanguage();
  return (
    <main className="min-h-dvh flex flex-col items-start justify-center gap-4 px-4 md:px-8 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <h1 className="text-2xl md:text-4xl">404 — {t('notfound.title')}</h1>
      <p>{t('notfound.text')}</p>
      <Link to={localize('/')} className="underline underline-offset-4">
        {t('notfound.back')}
      </Link>
    </main>
  );
}
