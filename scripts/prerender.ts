import fs from 'node:fs/promises';
import path from 'node:path';

import { generateLlmsTxt, generateProjectMarkdown } from '../src/agentic/serialize';
import { loadSiteSnapshot } from '../src/cms/snapshot';
import {
  deriveRouteSeo,
  getCanonicalOrigin,
  routeStructuredData,
  safeJson,
} from '../src/seo/routeSeo';

const distDir = path.resolve('dist');

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ??
      character,
  );
}

function outputPath(route: string): string {
  if (route === '/') return path.join(distDir, 'index.html');
  return path.join(distDir, route.replace(/^\//, ''), 'index.html');
}

function escapeXml(value: string): string {
  return value.replace(
    /[<>&'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&apos;', '"': '&quot;' })[character] ??
      character,
  );
}

async function main(): Promise<void> {
  const { render } = await import('../.ssr/entry-server.js');
  const template = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');
  const snapshot = await loadSiteSnapshot();
  const routes = [
    '/',
    '/contact',
    ...snapshot.projects.map((project) => `/projects/${project.slug}`),
  ];
  const snapshotScript = `<script id="__SITE_SNAPSHOT__" type="application/json">${safeJson(snapshot)}</script>`;

  for (const route of routes) {
    const markup = render(route, snapshot);
    const seo = deriveRouteSeo(route, snapshot);
    const markdownAlternate = seo.project
      ? `<link rel="alternate" type="text/markdown" href="/projects/${encodeURIComponent(seo.project.slug)}.md" />`
      : null;
    const metadata = [
      `<title>${escapeHtml(seo.title)}</title>`,
      `<meta name="description" content="${escapeHtml(seo.description)}" />`,
      `<link rel="canonical" href="${seo.canonical}" />`,
      `<meta property="og:type" content="${seo.type}" />`,
      `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
      `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
      `<meta property="og:url" content="${seo.canonical}" />`,
      ...(seo.image ? [`<meta property="og:image" content="${seo.image}" />`] : []),
      `<meta name="twitter:card" content="${seo.twitterCard}" />`,
      `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
      `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
      ...(seo.image ? [`<meta name="twitter:image" content="${seo.image}" />`] : []),
      ...(markdownAlternate ? [markdownAlternate] : []),
      `<script type="application/ld+json" data-route-jsonld>${safeJson(routeStructuredData(seo, snapshot.siteSettings))}</script>`,
    ].join('\n    ');
    const html = template
      .replace(/\s*<title>[\s\S]*?<\/title>/i, '')
      .replace(
        /\s*<meta\s+(?:name="description"|property="og:[^"]+"|name="twitter:[^"]+")[^>]*>/gi,
        '',
      )
      .replace(/\s*<link\s+rel="canonical"[^>]*>/i, '')
      .replace('</head>', `    ${metadata}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${markup}</div>`)
      .replace('</body>', `${snapshotScript}</body>`);
    const target = outputPath(route);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, html, 'utf8');
  }
  const origin = getCanonicalOrigin(snapshot.siteSettings);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${escapeXml(`${origin}${route}`)}</loc><lastmod>${snapshot.generatedAt}</lastmod></url>`).join('')}</urlset>`;
  await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');
  await fs.writeFile(
    path.join(distDir, 'llms.txt'),
    generateLlmsTxt(snapshot.projects, snapshot.siteSettings),
    'utf8',
  );
  await Promise.all(
    snapshot.projects.map((project) =>
      fs.writeFile(
        path.join(distDir, 'projects', `${project.slug}.md`),
        generateProjectMarkdown(project, snapshot.siteSettings),
        'utf8',
      ),
    ),
  );
  console.warn(`Prerendered ${routes.length} routes: ${routes.join(', ')}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'unknown error';
  console.error(`Prerender failed: ${message}`);
  process.exitCode = 1;
});
