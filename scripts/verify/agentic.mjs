import fs from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve('dist');
const homeHtml = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');
const snapshotMatch = homeHtml.match(
  /<script id="__SITE_SNAPSHOT__" type="application\/json">([\s\S]*?)<\/script>/,
);
if (!snapshotMatch?.[1]) throw new Error('Embedded SiteSnapshot is missing.');
const snapshot = JSON.parse(snapshotMatch[1]);
const canonicalMatch = homeHtml.match(/<link rel="canonical" href="([^"]+)"/);
if (!canonicalMatch?.[1]) throw new Error('Home canonical is missing.');
const origin = new URL(canonicalMatch[1]).origin;
const projects = snapshot.projects;
if (
  !origin.startsWith('https://') ||
  origin.includes('localhost') ||
  origin.includes('vercel.app-git-')
) {
  throw new Error(`Invalid canonical origin: ${origin}`);
}

const forbidden =
  /(SANITY_TOKEN|API[_-]?KEY|Bearer\s|rawContent|data:image|localhost|vercel\.app-git-)/i;
const llms = await fs.readFile(path.join(distDir, 'llms.txt'), 'utf8');
if (!llms.trim() || forbidden.test(llms))
  throw new Error('llms.txt is empty or exposes forbidden data.');
for (const target of [`${origin}/`, `${origin}/contact`]) {
  if (!llms.includes(target)) throw new Error(`llms.txt misses ${target}`);
}

const expectedFiles = new Set();
for (const project of projects) {
  const canonical = `${origin}/projects/${encodeURIComponent(project.slug)}`;
  if (llms.split(canonical).length - 1 !== 1) {
    throw new Error(`llms.txt must contain project once: ${project.slug}`);
  }
  const markdownName = `${project.slug}.md`;
  expectedFiles.add(markdownName);
  const markdownPath = path.join(distDir, 'projects', markdownName);
  const markdown = await fs.readFile(markdownPath, 'utf8');
  if (!markdown.includes(`# ${project.title}`) || !markdown.includes(project.description)) {
    throw new Error(`Markdown content mismatch: ${project.slug}`);
  }
  if (!markdown.includes(`Canonical: ${canonical}`) || forbidden.test(markdown)) {
    throw new Error(`Markdown canonical/security mismatch: ${project.slug}`);
  }
  for (const match of markdown.matchAll(/\[[^\]]+\]\(<([^>]+)>\)/g)) {
    const url = new URL(match[1]);
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
      throw new Error(`Invalid Markdown link protocol: ${url.protocol}`);
    }
  }
  const html = await fs.readFile(
    path.join(distDir, 'projects', project.slug, 'index.html'),
    'utf8',
  );
  const alternate = `<link rel="alternate" type="text/markdown" href="/projects/${encodeURIComponent(project.slug)}.md" />`;
  if (html.split(alternate).length - 1 !== 1) {
    throw new Error(`Markdown alternate mismatch: ${project.slug}`);
  }
  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (canonicalMatch?.[1] !== canonical)
    throw new Error(`HTML canonical mismatch: ${project.slug}`);
}

const actualFiles = (await fs.readdir(path.join(distDir, 'projects'))).filter((name) =>
  name.endsWith('.md'),
);
if (
  actualFiles.length !== expectedFiles.size ||
  actualFiles.some((name) => !expectedFiles.has(name))
) {
  throw new Error('Unknown or missing generated Markdown project.');
}
const sitemap = await fs.readFile(path.join(distDir, 'sitemap.xml'), 'utf8');
if (sitemap.includes('.md')) throw new Error('Markdown files must not appear in sitemap.xml.');
console.warn(`Agentic verification passed: llms.txt and ${projects.length} Markdown projects.`);
