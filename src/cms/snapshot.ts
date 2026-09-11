import type { ProjectDomain, SiteSettings } from './domain';
import { sanityClient } from './client';
import {
  normalizeProject,
  normalizeSiteSettings,
  type CmsProjectResult,
  type CmsSiteSettingsResult,
} from './normalize';
import { PROJECTS_QUERY, SITE_SETTINGS_QUERY } from './queries';

export interface SiteSnapshot {
  siteSettings: SiteSettings;
  projects: ProjectDomain[];
  generatedAt: string;
  rawContent: {
    projects: CmsProjectResult[];
    siteSettings: CmsSiteSettingsResult;
  };
}

export interface CmsSnapshotContent {
  projects: CmsProjectResult[];
  siteSettings: CmsSiteSettingsResult | null;
}

export function normalizeSnapshot(
  content: CmsSnapshotContent,
  generatedAt = new Date().toISOString(),
): SiteSnapshot {
  if (!content.siteSettings) throw new Error('CMS siteSettings singleton is missing.');
  const projects: ProjectDomain[] = [];
  const seenSlugs = new Set<string>();
  for (const rawProject of content.projects) {
    try {
      const project = normalizeProject(rawProject, 'EN');
      if (seenSlugs.has(project.slug)) throw new Error(`Duplicate CMS slug: ${project.slug}`);
      seenSlugs.add(project.slug);
      projects.push(project);
    } catch (error) {
      throw new Error(
        `Cannot build snapshot for project: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }
  return {
    projects,
    siteSettings: normalizeSiteSettings(content.siteSettings, 'EN'),
    generatedAt,
    rawContent: { projects: content.projects, siteSettings: content.siteSettings },
  };
}

export async function loadSiteSnapshot(): Promise<SiteSnapshot> {
  const [projects, siteSettings] = await Promise.all([
    sanityClient.fetch<CmsProjectResult[]>(PROJECTS_QUERY),
    sanityClient.fetch<CmsSiteSettingsResult | null>(SITE_SETTINGS_QUERY),
  ]);
  return normalizeSnapshot({ projects, siteSettings });
}
