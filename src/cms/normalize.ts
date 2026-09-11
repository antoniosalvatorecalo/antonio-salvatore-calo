import type { PROJECTS_QUERY_RESULT, SITE_SETTINGS_QUERY_RESULT } from './sanity.types';
import type {
  CmsLocale,
  ProjectDetail,
  ProjectDomain,
  ProjectMedia,
  SeoContent,
  SiteSettings,
} from './domain';

type LocalizedValue = { en?: string | null; it?: string | null } | null | undefined;

export type CmsProjectResult = PROJECTS_QUERY_RESULT[number];
export type CmsSiteSettingsResult = NonNullable<SITE_SETTINGS_QUERY_RESULT>;
type RawSeo = NonNullable<CmsProjectResult['seo']>;

const localeKey = (locale: CmsLocale) => locale.toLowerCase() as 'en' | 'it';

function localized(value: LocalizedValue, locale: CmsLocale, field: string): string {
  const selected = value?.[localeKey(locale)] ?? value?.en ?? value?.it;
  if (!selected) throw new Error(`CMS is missing ${field} for ${locale}.`);
  return selected;
}

function normalizeSeo(value: RawSeo | null | undefined, locale: CmsLocale): SeoContent | undefined {
  if (!value) return undefined;
  return {
    title: value.title ? localized(value.title, locale, 'seo.title') : undefined,
    description: value.description
      ? localized(value.description, locale, 'seo.description')
      : undefined,
    canonicalPath: value.canonicalPath ?? undefined,
    openGraphImage: value.openGraphImage ?? undefined,
    twitterCard: value.twitterCard ?? undefined,
  };
}

function normalizeCmsDetails(
  project: CmsProjectResult,
  locale: CmsLocale,
): ProjectDetail[] | undefined {
  const labels =
    locale === 'IT'
      ? {
          context: 'contesto',
          challenge: 'sfida',
          solution: 'soluzione',
          credits: 'credits',
          links: 'link',
        }
      : {
          context: 'context',
          challenge: 'challenge',
          solution: 'solution',
          credits: 'credits',
          links: 'links',
        };
  const details: ProjectDetail[] = [];

  if (project.details?.about) {
    details.push({
      label: locale === 'IT' ? 'about' : 'about',
      text: localized(project.details.about, locale, 'details.about'),
    });
  } else if (project.details?.context) {
    details.push({
      label: labels.context,
      text: localized(project.details.context, locale, 'details.context'),
    });
  }
  if (project.details?.challenge) {
    details.push({
      label: labels.challenge,
      text: localized(project.details.challenge, locale, 'details.challenge'),
    });
  }
  if (project.details?.solution) {
    details.push({
      label: labels.solution,
      text: localized(project.details.solution, locale, 'details.solution'),
    });
  }
  if (project.credits?.length) {
    details.push({
      label: labels.credits,
      credits: project.credits.map((group, index) => ({
        label: localized(group.label, locale, `credits[${index}].label`),
        values: group.values?.filter(Boolean) ?? [],
      })),
    });
  }
  if (project.links?.length) {
    details.push({
      label: labels.links,
      cta: project.links
        .map((link, index) => ({
          label: localized(link.label, locale, `links[${index}].label`),
          href: link.href ?? '',
        }))
        .filter((link) => link.href),
    });
  }

  return details.length ? details : undefined;
}

export function normalizeProject(project: CmsProjectResult, locale: CmsLocale): ProjectDomain {
  const slug = project.slug?.current;
  if (!slug) throw new Error(`CMS project ${project._id} has no slug.`);
  if (!project.gallery?.length) throw new Error(`CMS project ${slug} has an empty gallery.`);

  const media: ProjectMedia[] = project.gallery.map((item, index) => {
    const key = item._key;
    if (!key) throw new Error(`CMS project ${slug} gallery[${index}] is missing _key.`);

    if (item._type === 'imageMedia') {
      const src = item.image?.asset?.url;
      if (!src) throw new Error(`CMS project ${slug} image ${key} is missing its asset URL.`);
      return {
        key,
        type: 'image',
        src,
        alt: localized(item.alt, locale, `gallery.${key}.alt`),
        label: localized(item.label ?? item.alt, locale, `gallery.${key}.label`),
        width: item.image?.asset?.metadata?.dimensions?.width,
        height: item.image?.asset?.metadata?.dimensions?.height,
        lqip: item.image?.asset?.metadata?.lqip ?? undefined,
      };
    }

    const src = item.url;
    if (!src) throw new Error(`CMS project ${slug} Vimeo media ${key} is missing its URL.`);
    return {
      key,
      type: 'vimeo',
      src,
      thumbnailSrc: item.poster?.asset?.url ?? undefined,
      alt: localized(item.alt, locale, `gallery.${key}.alt`),
      label: localized(item.label ?? item.alt, locale, `gallery.${key}.label`),
      width: item.poster?.asset?.metadata?.dimensions?.width,
      height: item.poster?.asset?.metadata?.dimensions?.height,
      lqip: item.poster?.asset?.metadata?.lqip ?? undefined,
    };
  });

  return {
    id: slug,
    slug,
    title: localized(project.title, locale, 'title'),
    category: project.service ?? '',
    description: localized(project.description, locale, 'description'),
    media,
    details: normalizeCmsDetails(project, locale),
    seo: normalizeSeo(project.seo, locale),
  };
}

export function normalizeSiteSettings(
  settings: CmsSiteSettingsResult,
  locale: CmsLocale,
): SiteSettings {
  const publicContacts =
    settings.publicContacts?.map((item, index) => {
      if (!['email', 'phone', 'location'].includes(item.kind ?? '') || !item.value) {
        throw new Error(`CMS siteSettings.publicContacts[${index}] is invalid.`);
      }
      return {
        kind: item.kind as 'email' | 'phone' | 'location',
        value: item.value,
        href: item.href ?? undefined,
      };
    }) ?? [];

  const seo = normalizeSeo(settings.seo, locale);
  if (!seo?.title || !seo.description) throw new Error('CMS siteSettings.seo is incomplete.');

  return {
    displayName: localized(settings.displayName, locale, 'displayName'),
    bio: localized(settings.bio, locale, 'bio'),
    recognition:
      settings.recognition?.map((item, index) =>
        localized(item, locale, `recognition[${index}]`),
      ) ?? [],
    publicContacts,
    socials: settings.socials?.flatMap((item, index) =>
      item.href
        ? [{ label: localized(item.label, locale, `socials[${index}].label`), href: item.href }]
        : [],
    ) ?? [
      { label: 'LinkedIn', href: 'https://linkedin.com/in/antonio-salvatore-calò' },
      { label: 'Instagram', href: 'https://instagram.com/antonio.salvatore.calo' },
      { label: 'Behance', href: 'https://behance.net/antoniosalvatorecalo' },
      { label: 'GitHub', href: 'https://github.com/antoniosalvatorecalo' },
    ],
    downloads:
      settings.downloads?.flatMap((item, index) => {
        if (!item.href || (item.kind !== 'cv' && item.kind !== 'portfolio')) return [];
        return [
          {
            kind: item.kind,
            label: localized(item.label, locale, `downloads[${index}].label`),
            href: item.href,
          },
        ];
      }) ?? [],
    canonicalBaseUrl: settings.canonicalBaseUrl ?? undefined,
    branding: settings.branding
      ? {
          favicon: settings.branding.favicon?.asset?.url ?? undefined,
          themeColor: settings.branding.themeColor ?? undefined,
        }
      : undefined,
    seo,
  };
}
