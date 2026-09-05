import { useState, useCallback } from 'react';
import { GalleryGrid } from './ProjectGrid';
import { useFilter } from '@/providers/FilterContext';
import { projectsRegistry } from '@/content/projects';
import { ProjectPreview } from '@/components/projects/ProjectPreview';
import { ProjectPreviewCarousel } from '@/components/projects/ProjectPreviewCarousel';
import { useNavHover } from '@/providers/NavHoverContext';
import type { ProjectData } from '@/content/projects';
import { useProjectTransition } from '@/providers/ProjectTransitionProvider';
import './ProjectIndex.css';

const PROJECT_SLUG_MAP: Record<string, string> = {
  bugonia: 'bugonia',
  'bugonia-2': 'bugonia',
  'bugonia-3': 'bugonia',
  'bugonia-4': 'bugonia',
  'bugonia-5': 'bugonia',
  'bugonia-6': 'bugonia',
  newsquest: 'newsquest',
  'newsquest-2': 'newsquest',
  'newsquest-3': 'newsquest',
  'newsquest-4': 'newsquest',
  'newsquest-5': 'newsquest',
  'newsquest-6': 'newsquest',
};

function filterProjects(projects: ProjectData[], key: string): ProjectData[] {
  if (key === 'all') return projects;
  if (key === 'identity') return [];
  if (key === 'motion') return projects.filter(p => p.category === 'Web Design' || p.tags?.some(t => t.toLowerCase() === 'motion'));
  if (key === 'research') return projects.filter(p => p.tags?.some(t => t.toLowerCase() === 'research'));
  if (key === 'web') return projects.filter(p => p.category === 'Web Design');
  return projects;
}

interface ProjectIndexProps {
  interactive?: boolean;
  mediaActive?: boolean;
}

export const ProjectIndex: React.FC<ProjectIndexProps> = ({ interactive = true, mediaActive = true }) => {
  const { active: activeFilter } = useFilter();
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const { navProjectImages } = useNavHover();
  const { startProjectTransition } = useProjectTransition();

  const filteredProjects = filterProjects(projectsRegistry, activeFilter);

  const handleProjectClick = useCallback((projectId: string, imageSrc: string, sourceElement: HTMLElement) => {
    if (!interactive) return;
    const slug = PROJECT_SLUG_MAP[projectId] ?? projectId;
    setHoveredImage(null);
    startProjectTransition({ slug, imageSrc, sourceElement });
  }, [interactive, startProjectTransition]);

  const handleMouseEnter = useCallback((_projectId: string, imageSrc: string) => {
    if (!interactive) return;
    setHoveredImage(imageSrc);
  }, [interactive]);

  const handleMouseLeave = useCallback(() => {
    setHoveredImage(null);
  }, []);

  return (
    <>
      <section id="visual-index" className="project-index">
        <GalleryGrid
          projects={filteredProjects}
          interactive={interactive}
          mediaActive={mediaActive}
          onProjectClick={handleProjectClick}
          onProjectHover={{ onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave }}
        />
      </section>

      <ProjectPreview imageUrl={interactive ? hoveredImage : null} />
      {interactive && navProjectImages.length > 0 && (
        <ProjectPreviewCarousel images={navProjectImages} />
      )}
    </>
  );
};

export default ProjectIndex;
