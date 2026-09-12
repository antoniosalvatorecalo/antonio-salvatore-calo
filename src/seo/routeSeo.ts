import type { ProjectDomain, SiteSettings } from '@/cms/domain';
import type { SiteSnapshot } from '@/cms/snapshot';

export interface RouteSeo {
  title: string;
  description: string;
  canonical: string;
  type: 'website' | 'article';
  image?: string;
  twitterCard: 'summary' | 'summary_large_image';
  project?: ProjectDomain;
}

const productionOrigin = 'https://antonio-salvatore-calo.vercel.app';

function routePath(pathname: string): string {
  const path = pathname.split('?')[0]?.split('#')[0] ?? '/';
  if (path === '/') return '/';
  return `/${path.replace(/^\/+|\/+$/g, '')}`;
}

function absoluteUrl(pathOrUrl: string, origin: string): string {
  return new URL(pathOrUrl, origin).href;
}

export function getCanonicalOrigin(settings: SiteSettings): string {
  const configured = settings.canonicalBaseUrl?.trim();
  return (configured ? configured : productionOrigin).replace(/\/+$/, '');
}

function projectImage(project: ProjectDomain): string | undefined {
  const media = project.media.find(
    (item) => item.type === 'image' && (item.thumbnailSrc || item.src),
  );
  return media?.thumbnailSrc ?? media?.src;
}

export function deriveRouteSeo(
  pathname: string,
  snapshot: Pick<SiteSnapshot, 'siteSettings' | 'projects'>,
): RouteSeo {
  const path = routePath(pathname);
  const settings = snapshot.siteSettings;
  const slug = path.match(/^\/projects\/([^/]+)$/)?.[1];
  const project = slug
    ? snapshot.projects.find((item) => item.slug === decodeURIComponent(slug))
    : undefined;
  const origin = getCanonicalOrigin(settings);
  if (project) {
    const title =
      project.seo?.title && project.seo.title !== settings.seo.title
        ? project.seo.title
        : project.title;
    const description =
      project.seo?.description && project.seo.description !== settings.seo.description
        ? project.seo.description
        : project.description;
    const image = project.seo?.openGraphImage ?? projectImage(project);
    return {
      title,
      description,
      canonical: absoluteUrl(`/projects/${project.slug}`, origin),
      type: 'article',
      image: image ? absoluteUrl(image, origin) : undefined,
      twitterCard: 'summary_large_image',
      project,
    };
  }
  const isContact = path === '/contact';
  return {
    title: isContact
      ? `${settings.displayName} — Contact`
      : (settings.seo.title ?? settings.displayName),
    description: isContact ? settings.bio : (settings.seo.description ?? settings.bio),
    canonical: absoluteUrl(isContact ? '/contact' : '/', origin),
    type: 'website',
    image: settings.seo.openGraphImage
      ? absoluteUrl(settings.seo.openGraphImage, origin)
      : undefined,
    twitterCard: 'summary_large_image',
  };
}

export function routeStructuredData(
  seo: RouteSeo,
  settings: SiteSettings,
): Record<string, unknown>[] {
  const origin = getCanonicalOrigin(settings);
  const personId = `${origin}/#person`;
  const person = {
    '@type': 'Person',
    '@id': personId,
    name: settings.displayName,
    url: `${origin}/`,
    description: settings.bio,
    sameAs: settings.socials.map((social) => social.href),
  };
  if (!seo.project) {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        name: settings.displayName,
        url: `${origin}/`,
        description: settings.seo.description,
        publisher: { '@id': personId },
      },
      { '@context': 'https://schema.org', ...person },
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
      ...(seo.image ? { image: seo.image } : {}),
      creator: { '@id': personId },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
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
