import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:4173';
const homeHtml = await fs.readFile('dist/index.html', 'utf8');
const snapshotMatch = homeHtml.match(
  /<script id="__SITE_SNAPSHOT__" type="application\/json">([\s\S]*?)<\/script>/,
);
if (!snapshotMatch?.[1]) throw new Error('Embedded SiteSnapshot is missing.');
const snapshot = JSON.parse(snapshotMatch[1]);
const routes = [
  '/',
  '/contact',
  ...snapshot.projects.map((project) => `/projects/${project.slug}`),
];

for (const route of routes) {
  const file = route === '/' ? 'dist/index.html' : `dist${route}/index.html`;
  const html = await fs.readFile(file, 'utf8');
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
}
const sitemap = await fs.readFile('dist/sitemap.xml', 'utf8');
if ((sitemap.match(/<loc>/g) ?? []).length !== routes.length)
  throw new Error('Sitemap route count mismatch.');
if (sitemap.includes('localhost') || sitemap.includes('/it/'))
  throw new Error('Invalid sitemap origin/routes.');

const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {}),
});
const page = await browser.newPage();
let cmsRequests = 0;
const consoleErrors = [];
page.on('request', (request) => {
  if (request.url().includes('sanity.io/data/query/')) cmsRequests += 1;
});
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
for (const route of routes) {
  await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle' });
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
