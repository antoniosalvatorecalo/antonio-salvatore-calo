import type { ProjectDomain, SiteSettings } from '@/cms/domain';
import type { SiteSnapshot } from '@/cms/snapshot';
import { htmlLang, localeFromPath, localizePath, LOCALES, stripLocale } from '@/i18n/localePath';
import type { Locale } from '@/i18n/translations';

export interface RouteSeo {
  title: string;
  description: string;
  canonical: string;
  type: 'website' | 'article';
  image?: { src: string; alt: string; width?: number; height?: number };
  twitterCard: 'summary' | 'summary_large_image';
  /** Unknown URL: `noindex`, no canonical or `hreflang`. */
  notFound: boolean;
  project?: ProjectDomain;
  locale: Locale;
  /** Same page in every language, for `hreflang` (`x-default` is English). */
  alternates: { hreflang: 'en' | 'it' | 'x-default'; href: string }[];
}

const productionOrigin = 'https://antoniosalvatorecalo.com';

const jobTitle = 'Digital Designer & Frontend Developer';
const knowsAbout = [
  'Web Design',
  'UI Design',
  'UX Design',
  'Frontend Development',
  'Art Direction',
  'Editorial Design',
  'Prototyping',
];
const address = {
  '@type': 'PostalAddress',
  addressLocality: 'Benevento',
  addressRegion: 'Campania',
  addressCountry: 'IT',
};
const areaServed = [
  { '@type': 'City', name: 'Benevento' },
  { '@type': 'AdministrativeArea', name: 'Campania' },
  { '@type': 'Country', name: 'Italy' },
];

const CONTACT_SEO: Record<
  Locale,
  { title: (name: string) => string; description: (name: string) => string }
> = {
  EN: {
    title: (name) => `Contact — ${name}, Designer in Benevento`,
    description: (name) =>
      `Contact ${name}, ${jobTitle} in Benevento, Italy: web design, UI/UX and frontend projects in Campania and remotely.`,
  },
  IT: {
    title: (name) => `Contatti — ${name}, Designer a Benevento`,
    description: (name) =>
      `Contatta ${name}, ${jobTitle} a Benevento: web design, UI/UX e frontend in Campania, in tutta Italia e da remoto.`,
  },
};

const NOT_FOUND_SEO: Record<Locale, { title: string; description: string }> = {
  EN: { title: 'Page not found', description: 'This page does not exist or has been moved.' },
  IT: { title: 'Pagina non trovata', description: 'Questa pagina non esiste o è stata spostata.' },
};

const MAX_DESCRIPTION_LENGTH = 160;

/** Search engines cut descriptions around 160 characters: cut at a word, not mid-word. */
export function clampDescription(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= MAX_DESCRIPTION_LENGTH) return clean;
  const cut = clean.slice(0, MAX_DESCRIPTION_LENGTH - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.—-]+$/, '')}…`;
}

const MAX_TITLE_LENGTH = 60;

/** Adds the brand when it fits: a cut-off title loses it anyway in search results. */
function withName(title: string, name: string): string {
  const branded = `${title} — ${name}`;
  return title.includes(name) || branded.length > MAX_TITLE_LENGTH ? title : branded;
}

function routePath(pathname: string): string {
  const path = stripLocale(pathname.split('?')[0]?.split('#')[0] ?? '/');
  if (path === '/') return '/';
  return `/${path.replace(/^\/+|\/+$/g, '')}`;
}

function alternatesFor(path: string, origin: string): RouteSeo['alternates'] {
  const links = LOCALES.map((locale) => ({
    hreflang: htmlLang(locale),
    href: absoluteUrl(localizePath(path, locale), origin),
  }));
  return [...links, { hreflang: 'x-default', href: absoluteUrl(path, origin) }];
}

function absoluteUrl(pathOrUrl: string, origin: string): string {
  return new URL(pathOrUrl, origin).href;
}

export function getCanonicalOrigin(settings: SiteSettings): string {
  const configured = settings.canonicalBaseUrl?.trim();
  return (configured ? configured : productionOrigin).replace(/\/+$/, '');
}

/** First image, else the poster of the first video (a Vimeo `src` is not an image). */
function projectImage(project: ProjectDomain): RouteSeo['image'] {
  const media =
    project.media.find((item) => item.type === 'image') ??
    project.media.find((item) => item.thumbnailSrc);
  const src = media?.type === 'image' ? media.src : media?.thumbnailSrc;
  if (!media || !src) return undefined;
  return { src, alt: media.alt, width: media.width, height: media.height };
}

export function deriveRouteSeo(
  pathname: string,
  snapshot: Pick<SiteSnapshot, 'siteSettings' | 'projects'>,
): RouteSeo {
  const path = routePath(pathname);
  const locale = localeFromPath(pathname);
  const settings = snapshot.siteSettings;
  const slug = path.match(/^\/projects\/([^/]+)$/)?.[1];
  const project = slug
    ? snapshot.projects.find((item) => item.slug === decodeURIComponent(slug))
    : undefined;
  const origin = getCanonicalOrigin(settings);
  const siteImage = settings.seo.openGraphImage;
  const absoluteImage = (image: RouteSeo['image']) =>
    image ? { ...image, src: absoluteUrl(image.src, origin) } : undefined;
  if (project) {
    const title = withName(
      project.seo?.title && project.seo.title !== settings.seo.title
        ? project.seo.title
        : project.title,
      settings.displayName,
    );
    const description =
      project.seo?.description && project.seo.description !== settings.seo.description
        ? project.seo.description
        : project.description;
    const image = absoluteImage(
      project.seo?.openGraphImage
        ? { src: project.seo.openGraphImage, alt: project.title }
        : (projectImage(project) ?? (siteImage ? { src: siteImage, alt: title } : undefined)),
    );
    return {
      title,
      description: clampDescription(description),
      canonical: absoluteUrl(localizePath(`/projects/${project.slug}`, locale), origin),
      type: 'article',
      image,
      twitterCard: image ? 'summary_large_image' : 'summary',
      notFound: false,
      project,
      locale,
      alternates: alternatesFor(`/projects/${project.slug}`, origin),
    };
  }
  const isContact = path === '/contact';
  const notFound = !isContact && path !== '/';
  const pagePath = isContact ? '/contact' : '/';
  const contact = CONTACT_SEO[locale];
  const title = notFound
    ? withName(NOT_FOUND_SEO[locale].title, settings.displayName)
    : isContact
      ? contact.title(settings.displayName)
      : (settings.seo.title ?? settings.displayName);
  const image = absoluteImage(siteImage ? { src: siteImage, alt: title } : undefined);
  return {
    title,
    description: clampDescription(
      notFound
        ? NOT_FOUND_SEO[locale].description
        : isContact
          ? contact.description(settings.displayName)
          : (settings.seo.description ?? settings.bio),
    ),
    canonical: absoluteUrl(localizePath(pagePath, locale), origin),
    type: 'website',
    image,
    twitterCard: image ? 'summary_large_image' : 'summary',
    notFound,
    locale,
    alternates: alternatesFor(pagePath, origin),
  };
}

export function routeStructuredData(
  seo: RouteSeo,
  settings: SiteSettings,
): Record<string, unknown>[] {
  const origin = getCanonicalOrigin(settings);
  const inLanguage = htmlLang(seo.locale);
  const homeUrl = absoluteUrl(localizePath('/', seo.locale), origin);
  const personId = `${origin}/#person`;
  const email = settings.publicContacts.find((contact) => contact.kind === 'email')?.value;
  const person = {
    '@type': 'Person',
    '@id': personId,
    name: settings.displayName,
    url: `${origin}/`,
    description: settings.bio,
    jobTitle,
    knowsAbout,
    address,
    ...(email ? { email } : {}),
    sameAs: settings.socials.map((social) => social.href),
  };
  if (!seo.project) {
    const service = {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': `${origin}/#service`,
      name: `${settings.displayName} — ${jobTitle}`,
      url: `${origin}/`,
      description: settings.seo.description ?? settings.bio,
      ...(seo.image ? { image: seo.image.src } : {}),
      ...(email ? { email } : {}),
      address,
      areaServed,
      founder: { '@id': personId },
      knowsAbout,
    };
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        name: settings.displayName,
        url: homeUrl,
        inLanguage,
        description: settings.seo.description,
        publisher: { '@id': personId },
      },
      { '@context': 'https://schema.org', ...person },
      service,
    ];
  }
  const projectId = `${seo.canonical}#creativework`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      '@id': projectId,
      name: seo.project.title,
      description: seo.project.description,
      url: seo.canonical,
      inLanguage,
      ...(seo.image ? { image: seo.image.src } : {}),
      creator: { '@id': personId },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: homeUrl },
        { '@type': 'ListItem', position: 2, name: seo.project.title, item: seo.canonical },
      ],
    },
    { '@context': 'https://schema.org', ...person },
  ];
}

export function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}
