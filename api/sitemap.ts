import type {VercelRequest, VercelResponse} from '@vercel/node';
import {createClient} from '@sanity/client';

const client = createClient({projectId: 'dw4juo8a', dataset: 'production', apiVersion: '2026-09-06', useCdn: true});
const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({'<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'}[character]!));

export default async function sitemap(_request: VercelRequest, response: VercelResponse) {
  try {
    const [projects, settings] = await Promise.all([
      client.fetch<Array<{slug?: {current?: string}}>>('*[_type == "project" && defined(slug.current)] | order(order asc){slug}'),
      client.fetch<{canonicalBaseUrl?: string} | null>('*[_type == "siteSettings" && _id == "siteSettings"][0]{canonicalBaseUrl}'),
    ]);
    const origin = settings?.canonicalBaseUrl ?? 'https://antonio-salvatore-calo.vercel.app';
    const urls = ['/', '/contact', ...projects.flatMap((project) => project.slug?.current ? [`/projects/${project.slug.current}`] : [])];
    const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((path) => `<url><loc>${escapeXml(`${origin}${path}`)}</loc></url>`).join('')}</urlset>`;
    response.setHeader('Content-Type', 'application/xml; charset=utf-8');
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    response.status(200).send(body);
  } catch {
    response.status(503).send('Sitemap temporarily unavailable');
  }
}
