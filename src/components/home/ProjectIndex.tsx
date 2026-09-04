import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GalleryGrid } from './ProjectGrid';
import { useFilter } from '@/providers/FilterContext';
import { projectsRegistry } from '@/content/projects';
import { useProjects } from '@/hooks/projects';
import { ProjectPreview } from '@/components/projects/ProjectPreview';
import { ProjectPreviewCarousel } from '@/components/projects/ProjectPreviewCarousel';
import { SingleProjectView } from '@/components/projects/SingleProjectView';
import { useNavHover } from '@/providers/NavHoverContext';
import type { ProjectData } from '@/content/projects';
import type { Project } from '@/hooks/projects';
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

export const ProjectIndex: React.FC = () => {
  const { active: activeFilter } = useFilter();
  const { projects, getProject } = useProjects();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const { navProjectImages } = useNavHover();

  const filteredProjects = filterProjects(projectsRegistry, activeFilter);

  const openProjectView = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsViewOpen(true);
    setHoveredImage(null);
  }, []);

  const closeProjectView = useCallback(() => {
    setIsViewOpen(false);
    setSelectedProject(null);
    setHoveredImage(null);
  }, []);

  const handleProjectClick = useCallback((projectId: string) => {
    const slug = PROJECT_SLUG_MAP[projectId] ?? projectId;
    const project = getProject(slug);
    if (project) {
      openProjectView(project);
    }
  }, [getProject, openProjectView]);

  const handleMouseEnter = useCallback((_projectId: string, imageSrc: string) => {
    setHoveredImage(imageSrc);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredImage(null);
  }, []);

  return (
    <>
      <section id="visual-index" className="project-index">
        <GalleryGrid
          projects={filteredProjects}
          onProjectClick={handleProjectClick}
          onProjectHover={{ onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave }}
        />
      </section>

      {isViewOpen && selectedProject && (
        <SingleProjectView
          project={{
            slug: selectedProject.slug,
            title: selectedProject.title,
            description: selectedProject.detail.shortDescription,
            coverImage: selectedProject.coverImage,
            images: selectedProject.images,
            links: selectedProject.detail.projectLinks,
          }}
          onClose={closeProjectView}
        />
      )}

      <ProjectPreview imageUrl={hoveredImage} />
      {navProjectImages.length > 0 && (
        <ProjectPreviewCarousel images={navProjectImages} />
      )}
    </>
  );
};

export default ProjectIndex;
