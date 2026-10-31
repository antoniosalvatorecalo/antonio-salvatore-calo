import fs from 'node:fs/promises';
import { launchChromium } from './lib/browser.mjs';

const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:4173';
const homeHtml = await fs.readFile('dist/index.html', 'utf8');
const snapshotMatch = homeHtml.match(
  /<script id="__SITE_SNAPSHOT__" type="application\/json">([\s\S]*?)<\/script>/,
);
if (!snapshotMatch?.[1]) throw new Error('Embedded SiteSnapshot is missing.');
const snapshot = JSON.parse(snapshotMatch[1]);
const pages = ['/', '/contact', ...snapshot.projects.map((project) => `/projects/${project.slug}`)];
// English at the root, Italian under /it.
const routes = [...pages, ...pages.map((page) => (page === '/' ? '/it' : `/it${page}`))];
// `vite preview` serves folder pages only with a trailing slash; Vercel serves both.
const pageUrl = (route) => `${baseURL}${route === '/' ? '/' : `${route}/`}`;

for (const route of routes) {
  const file = route === '/' ? 'dist/index.html' : `dist${route}/index.html`;
  const html = await fs.readFile(file, 'utf8');
  const lang = route === '/it' || route.startsWith('/it/') ? 'it' : 'en';
  if (!html.includes(`<html lang="${lang}">`))
    throw new Error(`Expected lang="${lang}" in ${file}`);
  if ((html.match(/<link rel="alternate" hreflang="(en|it|x-default)"/g) ?? []).length !== 3)
    throw new Error(`Expected en/it/x-default hreflang links in ${file}`);
  if (!html.includes('__SITE_SNAPSHOT__') || !html.includes('id="root"')) {
    throw new Error(`Missing snapshot/root in ${file}`);
  }
  for (const pattern of [
    /<title>[^<]+<\/title>/i,
    /<meta name="description"[^>]+>/i,
    /<link rel="canonical"[^>]+>/i,
  ]) {
    if ((html.match(pattern) ?? []).length !== 1) throw new Error(`Invalid metadata in ${file}`);
  }
  const jsonLd = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
  ];
  if (!jsonLd.length) throw new Error(`Missing JSON-LD in ${file}`);
  for (const match of jsonLd) JSON.parse(match[1]);
  if (html.includes('localhost') || html.includes('vercel.app-git-'))
    throw new Error(`Invalid canonical origin in ${file}`);
  for (const required of [
    'entrance-intro__identity',
    'entrance-intro__line-mask',
    'entrance-intro__line-inner',
    'entrance-intro__metadata',
    'Digital Frontend Developer',
  ]) {
    if (!html.includes(required))
      throw new Error(`Missing preloader marker ${required} in ${file}`);
  }
  for (const legacy of ['entrance-intro__voices', 'entrance-intro__percentage', 'voice-cycle']) {
    if (html.includes(legacy))
      throw new Error(`Legacy preloader marker ${legacy} remains in ${file}`);
  }
}
const sitemap = await fs.readFile('dist/sitemap.xml', 'utf8');
if ((sitemap.match(/<loc>/g) ?? []).length !== routes.length)
  throw new Error('Sitemap route count mismatch.');
if (sitemap.includes('localhost')) throw new Error('Invalid sitemap origin.');
if ((sitemap.match(/<xhtml:link rel="alternate"/g) ?? []).length !== routes.length * 3)
  throw new Error('Sitemap hreflang alternates mismatch.');

const browser = await launchChromium();
const page = await browser.newPage();
let cmsRequests = 0;
const consoleErrors = [];
page.on('request', (request) => {
  if (request.url().includes('sanity.io/data/query/')) cmsRequests += 1;
});
page.on('console', (message) => {
  // Vercel Analytics scripts (/_vercel/*) exist only on Vercel, not in `vite preview`.
  if (message.type() === 'error' && !message.location().url.includes('/_vercel/'))
    consoleErrors.push(message.text());
});
for (const route of routes) {
  await page.goto(pageUrl(route), { waitUntil: 'networkidle' });
  if (!(await page.locator('#root').innerText()).trim())
    throw new Error(`Empty hydrated root: ${route}`);
}
await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' });
const homeCanonical = await page.locator('link[rel="canonical"]').getAttribute('href');
const homeTitle = await page.title();
const firstProject = snapshot.projects[0];
if (!firstProject) throw new Error('Snapshot contains no project routes.');
await page.locator(`[data-project-id="${firstProject.slug}"]`).first().click();
await page.waitForURL(`${baseURL}/projects/${firstProject.slug}`);
await page.waitForFunction(
  (canonical) =>
    document.querySelector('link[rel="canonical"]')?.getAttribute('href') !== canonical,
  homeCanonical,
);
if ((await page.locator('link[rel="canonical"]').getAttribute('href')) === homeCanonical)
  throw new Error('Project canonical did not update.');
if ((await page.title()) === homeTitle) throw new Error('Project title did not update.');
await page.goBack();
await page.waitForURL(`${baseURL}/`);
if ((await page.locator('link[rel="canonical"]').getAttribute('href')) !== homeCanonical)
  throw new Error('Home canonical did not restore.');
await browser.close();
if (cmsRequests !== 0)
  throw new Error(`Duplicate Sanity requests during hydration: ${cmsRequests}`);
if (consoleErrors.length) throw new Error(`Browser console errors: ${consoleErrors.join(' | ')}`);
console.warn(
  `Prerender verification passed: ${routes.length} routes, no duplicate Sanity fetches.`,
);
