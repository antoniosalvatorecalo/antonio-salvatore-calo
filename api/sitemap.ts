import type { VercelRequest, VercelResponse } from '@vercel/node';
import { loadSiteSnapshot } from '../src/cms/snapshot';
import { getCanonicalOrigin } from '../src/seo/routeSeo';

const escapeXml = (value: string) =>
  value.replace(
    /[<>&'"]/g,
    (character) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] ??
      character,
  );

export default async function sitemap(_request: VercelRequest, response: VercelResponse) {
  try {
    const snapshot = await loadSiteSnapshot();
    const origin = getCanonicalOrigin(snapshot.siteSettings);
    const paths = [
      '/',
      '/contact',
      ...snapshot.projects.map((project) => `/projects/${project.slug}`),
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((route) => `<url><loc>${escapeXml(`${origin}${route}`)}</loc><lastmod>${snapshot.generatedAt}</lastmod></url>`).join('')}</urlset>`;
    response.setHeader('Content-Type', 'application/xml; charset=utf-8');
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    response.status(200).send(body);
  } catch {
    response.status(503).send('Sitemap temporarily unavailable');
  }
}
