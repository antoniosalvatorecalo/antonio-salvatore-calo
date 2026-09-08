import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {useProjectCatalog, useSiteSettings} from './ProjectCatalogProvider';

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content?: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!content) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function SeoManager() {
  const {pathname} = useLocation();
  const {getProject} = useProjectCatalog();
  const settings = useSiteSettings();
  const slug = pathname.match(/^\/projects\/([^/]+)\/?$/)?.[1];
  const project = slug ? getProject(decodeURIComponent(slug)) : null;

  useEffect(() => {
    const seo = project?.seo;
    const title = seo?.title ?? project?.title ?? settings.seo.title;
    const description = seo?.description ?? project?.description ?? settings.seo.description;
    const canonicalPath = seo?.canonicalPath ?? (project ? `/projects/${project.slug}` : pathname || '/');
    const base = settings.canonicalBaseUrl || window.location.origin;
    const canonical = new URL(canonicalPath, base).href;
    const image = seo?.openGraphImage ?? project?.media[0]?.thumbnailSrc ?? project?.media[0]?.src ?? settings.seo.openGraphImage;
    const absoluteImage = image ? new URL(image, base).href : undefined;
    const twitterCard = seo?.twitterCard ?? settings.seo.twitterCard ?? 'summary_large_image';

    document.title = title ?? '';
    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:type"]', 'property', 'og:type', project ? 'article' : 'website');
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:image"]', 'property', 'og:image', absoluteImage);
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', twitterCard);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', absoluteImage);
    const favicon = settings.branding?.favicon;
    const faviconLink = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon && faviconLink) faviconLink.href = favicon;
    let themeColor = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (settings.branding?.themeColor) {
      if (!themeColor) {
        themeColor = document.createElement('meta');
        themeColor.name = 'theme-color';
        document.head.appendChild(themeColor);
      }
      themeColor.content = settings.branding.themeColor;
    }
  }, [pathname, project, settings]);

  return null;
}
