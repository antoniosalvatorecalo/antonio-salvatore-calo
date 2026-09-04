import { bugoniaDetail } from '@/content/projectDetails/bugoniaDetail';
import { newsquestDetail } from '@/content/projectDetails/newsquestDetail';
import type { ProjectDetailContent } from '@/content/projectDetails/bugoniaDetail';

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: string;
  coverImage: string;
  images: string[];
  detail: ProjectDetailContent;
}

const projectDetails: Record<string, ProjectDetailContent> = {
  bugonia: bugoniaDetail,
  newsquest: newsquestDetail,
};

function buildProject(slug: string, detail: ProjectDetailContent): Project {
  const images = [
    detail.media.thumb,
    detail.media.image1,
    detail.media.image2,
    detail.media.image3,
    detail.media.image4,
    detail.media.image5,
  ].filter(Boolean);

  return {
    id: slug,
    slug,
    title: detail.projectName,
    category: detail.metadata.industry,
    year: detail.metadata.year,
    coverImage: detail.media.thumb,
    images,
    detail,
  };
}

const _projects: Project[] = [
  buildProject('bugonia', bugoniaDetail),
  buildProject('newsquest', newsquestDetail),
];

interface UseProjectsReturn {
  projects: Project[];
  getProject: (slug: string) => Project | undefined;
}

export function useProjects(): UseProjectsReturn {
  return {
    projects: _projects,
    getProject: (slug: string) => _projects.find((p) => p.slug === slug),
  };
}
