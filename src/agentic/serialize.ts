import type { ProjectDetail, ProjectDomain, SiteSettings } from '@/cms/domain';
import { getCanonicalOrigin } from '@/seo/routeSeo';

function inlineText(value: string): string {
  return value
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function markdownText(value: string): string {
  return inlineText(value).replace(/([\\`*_[\]<>])/g, '\\$1');
}

function publicUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function detailSections(details: ProjectDetail[] | undefined): string[] {
  if (!details?.length) return [];
  const sections: string[] = [];
  const textDetails = details.filter((detail) => detail.text);
  if (textDetails.length) {
    sections.push(
      '## Details',
      '',
      ...textDetails.flatMap((detail) => [
        `### ${markdownText(detail.label)}`,
        '',
        markdownText(detail.text ?? ''),
        '',
      ]),
    );
  }
  const credits = details.flatMap((detail) => detail.credits ?? []);
  if (credits.length) {
    sections.push(
      '## Credits',
      '',
      ...credits.map(
        (credit) =>
          `- **${markdownText(credit.label)}:** ${credit.values.map(markdownText).join(', ')}`,
      ),
      '',
    );
  }
  const links = details.flatMap((detail) => detail.cta ?? []);
  const validLinks = links.flatMap((link) => {
    const href = publicUrl(link.href);
    return href ? [`- [${markdownText(link.label)}](<${href}>)`] : [];
  });
  if (validLinks.length) sections.push('## Links', '', ...validLinks, '');
  return sections;
}

export function generateProjectMarkdown(project: ProjectDomain, settings: SiteSettings): string {
  const origin = getCanonicalOrigin(settings);
  const canonical = `${origin}/projects/${encodeURIComponent(project.slug)}`;
  const media = [
    ...new Set(project.media.map((item) => inlineText(item.alt || item.label)).filter(Boolean)),
  ]
    .slice(0, 6)
    .map((description) => `- ${markdownText(description)}`);
  return [
    `# ${markdownText(project.title)}`,
    '',
    `> ${markdownText(project.description)}`,
    '',
    `Canonical: ${canonical}`,
    '',
    '## Overview',
    '',
    markdownText(project.description),
    '',
    ...(project.category
      ? ['## Services / Categories', '', `- ${markdownText(project.category)}`, '']
      : []),
    ...detailSections(project.details),
    ...(media.length ? ['## Media', '', ...media, ''] : []),
  ].join('\n');
}

export function generateLlmsTxt(projects: ProjectDomain[], settings: SiteSettings): string {
  const origin = getCanonicalOrigin(settings);
  return [
    `# ${inlineText(settings.displayName)}`,
    '',
    `> ${inlineText(settings.bio)}`,
    '',
    '## Portfolio',
    '',
    `- [Home](${origin}/)`,
    ...projects.map(
      (project) =>
        `- [${inlineText(project.title)}](${origin}/projects/${encodeURIComponent(project.slug)}) — ${inlineText(project.description)}`,
    ),
    '',
    '## Contact',
    '',
    `- [Contact](${origin}/contact)`,
    '',
  ].join('\n');
}
