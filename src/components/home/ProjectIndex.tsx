import { useState, useCallback } from 'react';
import { GalleryGrid } from './ProjectGrid';
import { FilterBar } from './FilterBar';
import { ProjectPreview } from '@/components/projects/ProjectPreview';
import { ProjectPreviewCarousel } from '@/components/projects/ProjectPreviewCarousel';
import { useNavHover } from '@/providers/NavHoverContext';
import type { ProjectDomain } from '@/cms/domain';
import { useProjectCatalog } from '@/cms/ProjectCatalogProvider';
import { useProjectTransition } from '@/providers/ProjectTransitionProvider';
import { useFilter } from '@/providers/FilterContext';
import './ProjectIndex.css';

function filterProjectsByService(projects: ProjectDomain[], service: string | null): ProjectDomain[] {
  if (!service || service === 'all') return projects;
  return projects.filter(p => p.category === service);
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
  const { projects } = useProjectCatalog();

  const filteredProjects = filterProjectsByService(projects, activeFilter === 'all' ? null : activeFilter);

  const handleProjectClick = useCallback((projectId: string, mediaKey: string, imageSrc: string, sourceElement: HTMLElement) => {
    if (!interactive) return;
    setHoveredImage(null);
    startProjectTransition({ slug: projectId, mediaKey, imageSrc, sourceElement });
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
          filters={<FilterBar />}
          filterKey={activeFilter}
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
