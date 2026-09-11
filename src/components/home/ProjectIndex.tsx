import { useState, useCallback } from 'react';
import { GalleryGrid } from './ProjectGrid';
import { FilterBar } from './FilterBar';
import { ProjectPreview } from '@/components/projects/ProjectPreview';
import { ProjectPreviewCarousel } from '@/components/projects/ProjectPreviewCarousel';
import { useNavHover } from '@/providers/NavHoverContext';
import type { ProjectDomain, ProjectMedia } from '@/cms/domain';
import { useProjectCatalog } from '@/cms/ProjectCatalogProvider';
import { useProjectTransition } from '@/providers/ProjectTransitionProvider';
import { useFilter } from '@/providers/FilterContext';
import './ProjectIndex.css';

function filterProjectsByService(
  projects: ProjectDomain[],
  service: string | null,
): ProjectDomain[] {
  if (!service || service === 'all') return projects;
  return projects.filter((p) => p.category === service);
}

interface ProjectIndexProps {
  interactive?: boolean;
  mediaActive?: boolean;
}

export const ProjectIndex: React.FC<ProjectIndexProps> = ({
  interactive = true,
  mediaActive = true,
}) => {
  const { active: activeFilter } = useFilter();
  const [hoveredMedia, setHoveredMedia] = useState<ProjectMedia | null>(null);
  const { navProjectMedia } = useNavHover();
  const { startProjectTransition } = useProjectTransition();
  const { projects } = useProjectCatalog();

  const filteredProjects = filterProjectsByService(
    projects,
    activeFilter === 'all' ? null : activeFilter,
  );

  const handleProjectClick = useCallback(
    (projectId: string, mediaKey: string, imageSrc: string, sourceElement: HTMLElement) => {
      if (!interactive) return;
      setHoveredMedia(null);
      startProjectTransition({ slug: projectId, mediaKey, imageSrc, sourceElement });
    },
    [interactive, startProjectTransition],
  );

  const handleMouseEnter = useCallback(
    (_projectId: string, media: ProjectMedia) => {
      if (!interactive) return;
      setHoveredMedia(media);
    },
    [interactive],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredMedia(null);
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

      <ProjectPreview media={interactive ? hoveredMedia : null} />
      {interactive && navProjectMedia.length > 0 && (
        <ProjectPreviewCarousel media={navProjectMedia} />
      )}
    </>
  );
};
