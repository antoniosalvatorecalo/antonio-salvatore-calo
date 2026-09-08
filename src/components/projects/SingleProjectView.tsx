import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { isVimeoUrl, getVimeoEmbedUrl, getVimeoThumbnailUrl } from '@/lib/vimeo';
import type { ProjectDomain, ProjectMedia } from '@/cms/domain';
import {getSanityImageSources} from '@/cms/image';
import './SingleProjectView.css';

export type SliderProjectData = Pick<ProjectDomain, 'slug' | 'title' | 'media'>;

interface SingleProjectViewProps {
  project: SliderProjectData;
  initialMediaKey?: string;
  interactive?: boolean;
}

function getImageName(media: ProjectMedia): string {
  if (media.label) return media.label;
  if (isVimeoUrl(media.src)) {
    const match = media.src.match(/vimeo\.com\/(\d+)/);
    return match ? `vimeo-${match[1]}` : 'vimeo-video';
  }
  const filename = media.src.split('/').pop() || '';
  const name = filename.replace(/\.(webp|jpg|jpeg|png)$/i, '');
  return name;
}

export function SingleProjectView({ project, initialMediaKey, interactive = true }: SingleProjectViewProps) {
  const allMedia = useMemo(
    () => project.media.filter((media) => {
      const label = media.label.trim().toLowerCase();
      return label !== 'merchandaising' && label !== 'bugonia-home-desktop-mobile';
    }),
    [project.media],
  );
  const initialMediaIndex = initialMediaKey
    ? Math.max(0, allMedia.findIndex((media) => media.key === initialMediaKey))
    : 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(initialMediaIndex);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const galleryViewportRef = useRef<HTMLDivElement>(null);
  const mediaCardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pointerStartXRef = useRef(0);
  const scrollStartLeftRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const clickSuppressTimeoutRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const currentMedia = allMedia[currentImageIndex];

  useEffect(() => () => {
    if (clickSuppressTimeoutRef.current !== null) {
      window.clearTimeout(clickSuppressTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    setCurrentImageIndex(initialMediaIndex);
    setLightboxOpen(false);
  }, [initialMediaIndex, project.slug]);

  useEffect(() => {
    const viewport = galleryViewportRef.current;
    if (!viewport) return;

    const frame = window.requestAnimationFrame(() => {
      mediaCardRefs.current[initialMediaIndex]?.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'start',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [initialMediaIndex, project.slug]);

  const scrollByCard = useCallback((direction: 'next' | 'previous') => {
    const viewport = galleryViewportRef.current;
    const firstCard = mediaCardRefs.current[0];
    if (!viewport || !firstCard) return;

    const cardStyle = window.getComputedStyle(firstCard.parentElement ?? firstCard);
    const gap = Number.parseFloat(cardStyle.columnGap || cardStyle.gap) || 20;
    const distance = firstCard.getBoundingClientRect().width + gap;
    viewport.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: 'smooth',
    });
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const viewport = galleryViewportRef.current;
    if (!viewport || viewport.scrollWidth <= viewport.clientWidth) return;

    pointerStartXRef.current = event.clientX;
    scrollStartLeftRef.current = viewport.scrollLeft;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    setIsDragging(true);
    viewport.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const viewport = galleryViewportRef.current;
    if (!viewport) return;

    const distance = event.clientX - pointerStartXRef.current;
    if (Math.abs(distance) > 6) hasDraggedRef.current = true;
    event.preventDefault();
    viewport.scrollLeft = scrollStartLeftRef.current - distance;
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const viewport = galleryViewportRef.current;
    isDraggingRef.current = false;
    setIsDragging(false);
    if (hasDraggedRef.current) {
      suppressClickRef.current = true;
      if (clickSuppressTimeoutRef.current !== null) {
        window.clearTimeout(clickSuppressTimeoutRef.current);
      }
      clickSuppressTimeoutRef.current = window.setTimeout(() => {
        suppressClickRef.current = false;
        clickSuppressTimeoutRef.current = null;
      }, 80);
    }
    if (viewport?.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const viewport = galleryViewportRef.current;
    if (!viewport) return;

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    if (viewport.scrollWidth <= viewport.clientWidth) return;

    viewport.scrollBy({left: delta, behavior: 'auto'});
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowLeft' && allMedia.length > 1) {
        event.preventDefault();
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1));
      }
      if (event.key === 'ArrowRight' && allMedia.length > 1) {
        event.preventDefault();
        setCurrentImageIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allMedia.length, lightboxOpen]);

  const handleLightboxClose = () => {
    setLightboxOpen(false);
  };

  const handleMediaClick = (index: number) => {
    if (!interactive) return;
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  if (!currentMedia) return null;

  return (
    <>
      <div
        className={`single-project-view${interactive ? ' is-project-ready' : ' is-transitioning'}`}
        data-project-transition-shell
        data-project-content-visible={interactive}
      >
        <div className="single-project-content">
          <div className="project-media-gallery" data-project-transition-target={project.slug}>
            <div
              ref={galleryViewportRef}
              className={`project-media-gallery-viewport${isDragging ? ' is-dragging' : ''}`}
              tabIndex={interactive ? 0 : -1}
              role="region"
              aria-label={`${project.title} project gallery`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onLostPointerCapture={handlePointerEnd}
              onWheel={handleWheel}
              onKeyDown={(event) => {
                if (!interactive || allMedia.length < 2) return;
                if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  scrollByCard('previous');
                }
                if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  scrollByCard('next');
                }
              }}
            >
              <div className="project-media-gallery-track">
                {allMedia.map((media, index) => {
                  const isVideo = media.type === 'vimeo';
                  const previewSrc = isVideo
                    ? media.thumbnailSrc || getVimeoThumbnailUrl(media.src)
                    : media.src;
                  const dimensions = media.width && media.height
                    ? {width: media.width, height: media.height}
                    : undefined;
                  const mediaAspectRatio = dimensions
                    ? `${dimensions.width} / ${dimensions.height}`
                    : isVideo
                      ? '16 / 9'
                      : '61 / 40';

                  return (
                    <button
                      type="button"
                      key={media.key}
                      ref={(element) => { mediaCardRefs.current[index] = element; }}
                      className="project-media-card"
                      data-media-label={getImageName(media).toLowerCase()}
                      draggable={false}
                      aria-label={`Open ${media.alt}`}
                      onDragStart={(event) => event.preventDefault()}
                      onClick={() => {
                        if (suppressClickRef.current) return;
                        handleMediaClick(index);
                      }}
                      style={{animationDelay: `${Math.min(index, 8) * 45}ms`}}
                    >
                      <span className="project-media-card-frame" style={{aspectRatio: mediaAspectRatio}}>
                        {previewSrc ? (
                          <img
                            src={previewSrc}
                            {...(!isVideo ? getSanityImageSources(previewSrc, dimensions?.width) : {})}
                            alt={media.alt}
                            className="project-media-card-image"
                            draggable={false}
                            width={dimensions?.width ?? (isVideo ? 1280 : undefined)}
                            height={dimensions?.height ?? (isVideo ? 720 : undefined)}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            fetchPriority={index === 0 ? 'high' : 'auto'}
                            onDragStart={(event) => event.preventDefault()}
                          />
                        ) : (
                          <span className="project-media-card-fallback">Video preview unavailable</span>
                        )}
                      </span>
                      <span className="project-media-card-name">[{getImageName(media)}]</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && interactive && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${project.title} media viewer`} onClick={handleLightboxClose}>
          <button autoFocus className="lightbox-close" aria-label="Close lightbox">[close x]</button>
          <button
            className="lightbox-prev"
            aria-label="Previous image"
            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1)); }}
          >
            &lt;
          </button>
          <button
            className="lightbox-next"
            aria-label="Next image"
            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0)); }}
          >
            &gt;
          </button>
          <div className="lightbox-content" key={currentMedia.key} onClick={(e) => e.stopPropagation()}>
            {currentMedia.type === 'vimeo' ? (
              <iframe
                src={getVimeoEmbedUrl(currentMedia.src)}
                title="Vimeo video"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                frameBorder="0"
                className="lightbox-video"
              />
            ) : (
              <img
                src={currentMedia.src}
                alt={currentMedia.alt}
                className="lightbox-image"
              />
            )}
            <div className="lightbox-name">[{getImageName(currentMedia)}]</div>
          </div>
        </div>
      )}
    </>
  );
}

export default SingleProjectView;
