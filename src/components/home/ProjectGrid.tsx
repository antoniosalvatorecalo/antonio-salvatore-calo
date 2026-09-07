import type { ProjectDomain } from '@/cms/domain';
import { isVimeoUrl, getVimeoThumbnailUrl } from '@/lib/vimeo';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotionPreference } from '@/providers/MotionPreferenceProvider';

export interface GalleryGridHoverHandlers {
  onMouseEnter?: (projectId: string, imageSrc: string) => void;
  onMouseLeave?: () => void;
}

export interface GalleryGridProps {
  projects: ProjectDomain[];
  filters?: React.ReactNode;
  filterKey?: string;
  interactive?: boolean;
  mediaActive?: boolean;
  onProjectClick?: (projectId: string, mediaKey: string, imageSrc: string, sourceElement: HTMLElement) => void;
  onProjectHover?: GalleryGridHoverHandlers;
}

export function GalleryGrid({ projects, filters, filterKey = 'all', interactive = true, mediaActive = true, onProjectClick, onProjectHover }: GalleryGridProps) {
  const reducedMotion = useReducedMotionPreference();
  // Deduplicate images - keep only unique image sources
  const seenSrcs = new Set<string>();
  const items = projects.flatMap((project) =>
    project.media
      .filter((media) => {
        if (seenSrcs.has(media.src)) return false;
        seenSrcs.add(media.src);
        return true;
      })
      .map((media) => ({
        ...media,
        projectId: project.slug,
      })),
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, projectId: string, mediaKey: string, imageSrc: string) => {
    if (interactive && onProjectClick) {
      e.preventDefault();
      e.stopPropagation();
      onProjectClick(projectId, mediaKey, imageSrc, e.currentTarget);
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
      {filters}
      <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={filterKey}
        className="gallery-grid"
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
        transition={{ duration: reducedMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        {items.slice(0, 64).map((item, i) => (
          <motion.button
            key={`${item.projectId}-${item.key}`}
            className="gallery-grid-item"
            aria-label={`Open ${item.projectId}, image ${i + 1}`}
            disabled={!interactive}
            onClick={(e) => handleClick(e, item.projectId, item.key, item.src)}
            onMouseEnter={() => handleMouseEnter(item.projectId, item.src)}
            onMouseLeave={handleMouseLeave}
            data-project-id={item.projectId}
            data-project-transition-key={`${item.projectId}-${item.key}`}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.52, delay: reducedMotion ? 0 : Math.min(i, 12) * 0.045, ease: [0.22, 1, 0.36, 1] }}
          >
            {item.type === 'vimeo' || isVimeoUrl(item.src) ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  aspectRatio: '61 / 40',
                  backgroundImage: `url(${item.thumbnailSrc ?? getVimeoThumbnailUrl(item.src)})`,
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
                alt={item.alt}
                width={item.width}
                height={item.height}
                loading={mediaActive && i < 4 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={mediaActive && i === 0 ? 'high' : 'auto'}
              />
            )}
          </motion.button>
        ))}
      </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default GalleryGrid;
