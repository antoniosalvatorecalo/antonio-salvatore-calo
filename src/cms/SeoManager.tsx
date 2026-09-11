import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { deriveRouteSeo, routeStructuredData, safeJson } from '@/seo/routeSeo';
import { useProjectCatalog, useSiteSettings } from './ProjectCatalogProvider';

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
  const { pathname } = useLocation();
  const { projects } = useProjectCatalog();
  const settings = useSiteSettings();

  useEffect(() => {
    const seo = deriveRouteSeo(pathname, { projects, siteSettings: settings });
    document.title = seo.title;
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = seo.canonical;
    setMeta('meta[name="description"]', 'name', 'description', seo.description);
    setMeta('meta[property="og:type"]', 'property', 'og:type', seo.type);
    setMeta('meta[property="og:url"]', 'property', 'og:url', seo.canonical);
    setMeta('meta[property="og:title"]', 'property', 'og:title', seo.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', seo.description);
    setMeta('meta[property="og:image"]', 'property', 'og:image', seo.image);
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', seo.twitterCard);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', seo.title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', seo.description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', seo.image);
    const favicon = settings.branding?.favicon;
    const faviconLink = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon && faviconLink) faviconLink.href = favicon;
    if (settings.branding?.themeColor) {
      setMeta('meta[name="theme-color"]', 'name', 'theme-color', settings.branding.themeColor);
    }
    let script = document.head.querySelector<HTMLScriptElement>('script[data-route-jsonld]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.routeJsonld = 'true';
      document.head.appendChild(script);
    }
    script.textContent = safeJson(routeStructuredData(seo, settings));
  }, [pathname, projects, settings]);

  return null;
}
