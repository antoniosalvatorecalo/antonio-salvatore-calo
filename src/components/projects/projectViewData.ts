import { projectsRegistry } from '@/content/projects';
import { workProjectExtrasRegistry } from '@/content/workProjectExtras';
import type { ProjectDetailColumn } from './ProjectDetailsGrid';
import type { SliderProjectData } from './SingleProjectView';

/**
 * Build the 4-cell accordion row from a project's `workProjectExtras` entry.
 * Returns undefined when the project has no extras, so the row can be hidden.
 *
 * Order of cells:
 *   1. contesto      — contesto
 *   2. sfida         — sfida
 *   3. soluzione     — soluzione
 *   4. credits       — credits (structured list)
 */
function buildDetails(slug: string): ProjectDetailColumn[] | undefined {
  const extras = workProjectExtrasRegistry[slug];
  if (!extras) return undefined;

  const columns: ProjectDetailColumn[] = [];

  if (extras.contesto) {
    columns.push({ label: 'contesto', text: extras.contesto });
  }
  if (extras.sfida) {
    columns.push({ label: 'sfida', text: extras.sfida });
  }
  if (extras.soluzione) {
    columns.push({ label: 'soluzione', text: extras.soluzione });
  }
  if (extras.credits && extras.credits.length > 0) {
    columns.push({
      label: 'credits',
      credits: extras.credits,
      cta: extras.links.length > 0 ? extras.links : undefined,
    });
  }

  return columns.length > 0 ? columns : undefined;
}

export interface ProjectViewData {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  images: string[];
  links: { label: string; href: string }[];
  /** Five-cell accordion row for the project header. */
  details?: ProjectDetailColumn[];
}

export const getProjectViewData = (slug: string): ProjectViewData | null => {
  const project = projectsRegistry.find((item) => item.id === slug);
  if (!project) return null;
  const extras = workProjectExtrasRegistry[slug];
  return {
    slug,
    title: project.title,
    description: extras?.shortDescription ?? project.tagline,
    coverImage: project.images[0],
    images: project.images,
    links: extras?.links ?? [],
    details: buildDetails(slug),
  };
};

/**
 * Type guard / cast used by components that need the project shape consumed
 * by SingleProjectView (which only knows about the legacy fields).
 */
export function asSliderProjectData(data: ProjectViewData): SliderProjectData {
  return {
    slug: data.slug,
    title: data.title,
    description: data.description,
    coverImage: data.coverImage,
    images: data.images,
    links: data.links,
  };
}