import type { ProjectData } from '@/content/projects';

export interface GalleryGridHoverHandlers {
  onMouseEnter?: (projectId: string, imageSrc: string) => void;
  onMouseLeave?: () => void;
}

export interface GalleryGridProps {
  projects: ProjectData[];
  onProjectClick?: (projectId: string, imageSrc: string) => void;
  onProjectHover?: GalleryGridHoverHandlers;
}

const PROJECT_ROUTE: Record<string, string> = {
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

export function GalleryGrid({ projects, onProjectClick, onProjectHover }: GalleryGridProps) {
  // Deduplicate images - keep only unique image sources
  const seenSrcs = new Set<string>();
  const items = projects.flatMap((project) =>
    project.images
      .filter((src) => {
        if (seenSrcs.has(src)) return false;
        seenSrcs.add(src);
        return true;
      })
      .map((src) => ({
        src,
        projectId: PROJECT_ROUTE[project.id] ?? project.id,
      })),
  );

  const handleClick = (e: React.MouseEvent, projectId: string, imageSrc: string) => {
    if (onProjectClick) {
      e.preventDefault();
      e.stopPropagation();
      onProjectClick(projectId, imageSrc);
    }
  };

  const handleMouseEnter = (projectId: string, imageSrc: string) => {
    onProjectHover?.onMouseEnter?.(projectId, imageSrc);
  };

  const handleMouseLeave = () => {
    onProjectHover?.onMouseLeave?.();
  };

  return (
    <div className="gallery-grid-wrap">
      <div className="gallery-grid">
        {items.slice(0, 64).map((item, i) => (
          <button
            key={`${item.projectId}-${i}`}
            className="gallery-grid-item"
            onClick={(e) => handleClick(e, item.projectId, item.src)}
            onMouseEnter={() => handleMouseEnter(item.projectId, item.src)}
            onMouseLeave={handleMouseLeave}
            data-project-id={item.projectId}
          >
            <img
              src={item.src}
              alt=""
              loading={i < 16 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default GalleryGrid;
