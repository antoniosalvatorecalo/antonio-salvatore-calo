import type { ProjectData } from '@/content/projects';
import { isVimeoUrl, getVimeoThumbnailUrl } from '@/lib/vimeo';

export interface GalleryGridHoverHandlers {
  onMouseEnter?: (projectId: string, imageSrc: string) => void;
  onMouseLeave?: () => void;
}

export interface GalleryGridProps {
  projects: ProjectData[];
  interactive?: boolean;
  mediaActive?: boolean;
  onProjectClick?: (projectId: string, imageSrc: string, sourceElement: HTMLElement) => void;
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

export function GalleryGrid({ projects, interactive = true, mediaActive = true, onProjectClick, onProjectHover }: GalleryGridProps) {
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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, projectId: string, imageSrc: string) => {
    if (interactive && onProjectClick) {
      e.preventDefault();
      e.stopPropagation();
      onProjectClick(projectId, imageSrc, e.currentTarget);
    }
  };

  const handleMouseEnter = (projectId: string, imageSrc: string) => {
    if (interactive) onProjectHover?.onMouseEnter?.(projectId, imageSrc);
  };

  const handleMouseLeave = () => {
    if (interactive) onProjectHover?.onMouseLeave?.();
  };

  return (
    <div className="gallery-grid-wrap" data-project-transition-grid data-media-active={mediaActive} aria-hidden={!interactive}>
      <div className="gallery-grid">
        {items.slice(0, 64).map((item, i) => (
          <button
            key={`${item.projectId}-${i}`}
            className="gallery-grid-item"
            aria-label={`Open ${item.projectId}, image ${i + 1}`}
            disabled={!interactive}
            onClick={(e) => handleClick(e, item.projectId, item.src)}
            onMouseEnter={() => handleMouseEnter(item.projectId, item.src)}
            onMouseLeave={handleMouseLeave}
            data-project-id={item.projectId}
            data-project-transition-key={`${item.projectId}-${i}`}
          >
            {isVimeoUrl(item.src) ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  aspectRatio: '61 / 40',
                  backgroundImage: `url(${getVimeoThumbnailUrl(item.src)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      color: '#fff',
                      fontSize: '48px',
                      lineHeight: 1,
                    }}
                  >
                    ▶
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={item.src}
                alt=""
                loading={mediaActive && i < 16 ? 'eager' : 'lazy'}
                decoding="async"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default GalleryGrid;
