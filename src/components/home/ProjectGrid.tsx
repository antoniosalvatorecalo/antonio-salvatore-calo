import type { ProjectDomain } from '@/cms/domain';
import type { ProjectMedia } from '@/cms/domain';
import { getVimeoEmbedUrl, getVimeoThumbnailUrl, isVimeoUrl } from '@/lib/vimeo';
import { AnimatePresence, motion } from 'motion/react';
import {useEffect, useRef, useState} from 'react';
import {getSanityImageSources} from '@/cms/image';
import { useReducedMotionPreference } from '@/providers/MotionPreferenceProvider';

export interface GalleryGridHoverHandlers {
  onMouseEnter?: (projectId: string, media: ProjectMedia) => void;
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

interface GalleryVideoProps {
  media: ProjectMedia;
  active: boolean;
  reducedMotion: boolean;
}

function GalleryVideo({ media, active, reducedMotion }: GalleryVideoProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const posterSrc = media.thumbnailSrc || getVimeoThumbnailUrl(media.src);

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !active || reducedMotion) {
      setIsVisible(false);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.25),
      { root: null, rootMargin: '0px', threshold: [0, 0.25] },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      setIsVisible(false);
    };
  }, [active, reducedMotion]);

  return (
    <div
      ref={videoRef}
      className="gallery-grid-video-placeholder"
      style={{
        backgroundImage: posterSrc ? `url(${posterSrc})` : undefined,
      }}
    >
      {posterSrc && (
        <img
          src={posterSrc}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
      )}
      {isVisible && (
        <div className="gallery-grid-video-frame">
          <iframe
            key={media.src}
            title={`${media.alt} preview`}
            src={getVimeoEmbedUrl(media.src)}
            allow="autoplay; fullscreen; picture-in-picture"
            aria-hidden="true"
            tabIndex={-1}
            onLoad={() => setIsLoaded(true)}
            style={{ opacity: posterSrc ? (isLoaded ? 1 : 0) : 1 }}
          />
        </div>
      )}
    </div>
  );
}

export function GalleryGrid({ projects, filters, filterKey = 'all', interactive = true, mediaActive = true, onProjectClick, onProjectHover }: GalleryGridProps) {
  const reducedMotion = useReducedMotionPreference();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({top: 0, left: 0, behavior: 'auto'});
  }, [filterKey]);
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

  const handleMouseEnter = (projectId: string, media: ProjectMedia) => {
    if (interactive) onProjectHover?.onMouseEnter?.(projectId, media);
  };

  const handleMouseLeave = () => {
    if (interactive) onProjectHover?.onMouseLeave?.();
  };

  return (
    <div ref={scrollRef} className="gallery-grid-wrap" data-project-transition-grid data-media-active={mediaActive} aria-hidden={!interactive}>
      <div className="gallery-grid-stage">
        {filters}
        <div className="gallery-grid-animation-slot">
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
                  onMouseEnter={() => handleMouseEnter(item.projectId, item)}
                  onMouseLeave={handleMouseLeave}
                  data-project-id={item.projectId}
                  data-project-transition-key={`${item.projectId}-${item.key}`}
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.52, delay: reducedMotion ? 0 : Math.min(i, 12) * 0.045, ease: [0.22, 1, 0.36, 1] }}
                >
                  {item.type === 'vimeo' || isVimeoUrl(item.src) ? (
                    <GalleryVideo
                      media={item}
                      active={mediaActive && interactive}
                      reducedMotion={reducedMotion}
                    />
                  ) : (
                    <img
                      src={item.src}
                      {...getSanityImageSources(item.src, item.width)}
                      alt={item.alt}
                      width={item.width}
                      height={item.height}
                      loading={mediaActive && i < 4 ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={mediaActive && i === 0 ? 'high' : 'auto'}
                      style={item.lqip ? {backgroundImage: `url(${item.lqip})`, backgroundSize: 'cover'} : undefined}
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default GalleryGrid;
