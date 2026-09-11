import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { isVimeoUrl, getVimeoEmbedUrl, getVimeoThumbnailUrl } from '@/lib/vimeo';
import type { ProjectDomain, ProjectMedia } from '@/cms/domain';
import { getSanityImageSources } from '@/cms/image';
import { useLanguage } from '@/providers/LanguageProvider';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotionPreference } from '@/providers/MotionPreferenceProvider';
import './SingleProjectView.css';
import '../home/FilterBar.css';

type SliderProjectData = Pick<ProjectDomain, 'slug' | 'title' | 'media'>;

interface SingleProjectViewProps {
  project: SliderProjectData;
  initialMediaKey?: string;
  interactive?: boolean;
}

type MediaFilter = 'all' | 'image' | 'vimeo';

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

export function SingleProjectView({
  project,
  initialMediaKey,
  interactive = true,
}: SingleProjectViewProps) {
  const allMedia = useMemo(() => project.media, [project.media]);
  const { locale } = useLanguage();
  const reducedMotion = useReducedMotionPreference();
  const initialMediaIndex = initialMediaKey
    ? Math.max(
        0,
        allMedia.findIndex((media) => media.key === initialMediaKey),
      )
    : 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(initialMediaIndex);
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [isMediaFilterOpen, setIsMediaFilterOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isAtGalleryEnd, setIsAtGalleryEnd] = useState(false);
  const galleryViewportRef = useRef<HTMLDivElement>(null);
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);
  const mediaCardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activePointerIdRef = useRef<number | null>(null);
  const pointerStartXRef = useRef(0);
  const scrollStartLeftRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const filteredMedia = useMemo(
    () =>
      mediaFilter === 'all' ? allMedia : allMedia.filter((media) => media.type === mediaFilter),
    [allMedia, mediaFilter],
  );
  const safeCurrentImageIndex = Math.min(currentImageIndex, Math.max(filteredMedia.length - 1, 0));
  const currentMedia = filteredMedia[safeCurrentImageIndex];

  const mediaFilterOptions: Array<{ value: MediaFilter; label: string }> = [
    { value: 'all', label: locale === 'IT' ? 'Tutti' : 'All' },
    { value: 'image', label: locale === 'IT' ? 'Foto' : 'Photos' },
    { value: 'vimeo', label: locale === 'IT' ? 'Video' : 'Videos' },
  ];
  const activeMediaFilterLabel =
    mediaFilterOptions.find((option) => option.value === mediaFilter)?.label ??
    mediaFilterOptions[0]?.label ??
    '';
  const activeMediaFilterCount =
    mediaFilter === 'all'
      ? allMedia.length
      : allMedia.filter((media) => media.type === mediaFilter).length;

  useEffect(() => {
    setCurrentImageIndex(initialMediaIndex);
    setMediaFilter('all');
    setIsMediaFilterOpen(false);
    setLightboxOpen(false);
    setIsAtGalleryEnd(false);
  }, [initialMediaIndex, project.slug]);

  useEffect(() => {
    const viewport = galleryViewportRef.current;
    if (!viewport) return;

    const updateGalleryPosition = () => {
      const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
      setIsAtGalleryEnd(maxScrollLeft > 0 && viewport.scrollLeft >= maxScrollLeft - 4);
    };

    updateGalleryPosition();
    viewport.addEventListener('scroll', updateGalleryPosition, { passive: true });
    window.addEventListener('resize', updateGalleryPosition);
    return () => {
      viewport.removeEventListener('scroll', updateGalleryPosition);
      window.removeEventListener('resize', updateGalleryPosition);
    };
  }, [filteredMedia.length, mediaFilter, project.slug]);

  useEffect(() => {
    const viewport = galleryViewportRef.current;
    if (!viewport) return;

    const frame = window.requestAnimationFrame(() => {
      mediaCardRefs.current[safeCurrentImageIndex]?.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'start',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [safeCurrentImageIndex, filteredMedia.length, project.slug]);

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
    activePointerIdRef.current = event.pointerId;
    isDraggingRef.current = false;
    hasDraggedRef.current = false;
    suppressClickRef.current = false;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return;
    const viewport = galleryViewportRef.current;
    if (!viewport) return;

    const distance = event.clientX - pointerStartXRef.current;
    if (!isDraggingRef.current) {
      if (Math.abs(distance) <= 6) return;
      isDraggingRef.current = true;
      hasDraggedRef.current = true;
      setIsDragging(true);
      viewport.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    viewport.scrollLeft = scrollStartLeftRef.current - distance;
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return;
    const viewport = galleryViewportRef.current;
    const didDrag = hasDraggedRef.current;
    activePointerIdRef.current = null;
    isDraggingRef.current = false;
    hasDraggedRef.current = false;
    setIsDragging(false);
    suppressClickRef.current = didDrag;
    if (viewport?.hasPointerCapture(event.pointerId))
      viewport.releasePointerCapture(event.pointerId);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const viewport = galleryViewportRef.current;
    if (!viewport) return;

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    if (viewport.scrollWidth <= viewport.clientWidth) return;

    viewport.scrollBy({ left: delta, behavior: 'auto' });
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lightboxCloseRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowLeft' && filteredMedia.length > 1) {
        event.preventDefault();
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : filteredMedia.length - 1));
      }
      if (event.key === 'ArrowRight' && filteredMedia.length > 1) {
        event.preventDefault();
        setCurrentImageIndex((prev) => (prev < filteredMedia.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [filteredMedia.length, lightboxOpen]);

  const handleLightboxClose = () => {
    setLightboxOpen(false);
  };

  const handleMediaFilterChange = (nextFilter: MediaFilter) => {
    galleryViewportRef.current?.scrollTo({ left: 0, behavior: 'auto' });
    mediaCardRefs.current = [];
    setCurrentImageIndex(0);
    setLightboxOpen(false);
    setMediaFilter(nextFilter);
    setIsMediaFilterOpen(false);
    setIsAtGalleryEnd(false);
  };

  const handleGalleryBack = () => {
    galleryViewportRef.current?.scrollTo({ left: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
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
        data-motion-project-surface
      >
        <div className="single-project-content">
          <div className="project-media-gallery" data-project-transition-target={project.slug}>
            <div className="project-media-gallery-header" data-motion-text data-motion-order="8">
              <nav
                className="filter-bar project-media-filter"
                aria-label={locale === 'IT' ? 'Filtra media progetto' : 'Filter project media'}
              >
                <div className="filter-bar-summary">
                  <button
                    type="button"
                    className="filter-bar-toggle"
                    aria-expanded={isMediaFilterOpen}
                    aria-controls="project-media-filter-options"
                    onClick={() => setIsMediaFilterOpen((open) => !open)}
                  >
                    <span>{locale === 'IT' ? 'Filtri' : 'Filter'}</span>
                    <span className="filter-bar-symbol" aria-hidden="true">
                      {isMediaFilterOpen ? '−' : '+'}
                    </span>
                  </button>
                  {!isMediaFilterOpen && (
                    <span className="filter-bar-current" aria-live="polite">
                      {activeMediaFilterLabel}{' '}
                      <span className="filter-bar-count">[{activeMediaFilterCount}]</span>
                    </span>
                  )}
                </div>
                {isMediaFilterOpen && (
                  <div id="project-media-filter-options" className="filter-bar-panel">
                    <div
                      className="filter-bar-options"
                      role="group"
                      aria-label={locale === 'IT' ? 'Filtra per tipo' : 'Filter by type'}
                    >
                      {mediaFilterOptions.map((option) => {
                        const count =
                          option.value === 'all'
                            ? allMedia.length
                            : allMedia.filter((media) => media.type === option.value).length;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={`filter-bar-item${mediaFilter === option.value ? ' is-active' : ''}`}
                            aria-pressed={mediaFilter === option.value}
                            disabled={count === 0}
                            onClick={() => {
                              handleMediaFilterChange(option.value);
                            }}
                          >
                            {option.label} <span className="filter-bar-count">[{count}]</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </nav>
              {isAtGalleryEnd ? (
                <button
                  type="button"
                  className="project-media-scroll-hint"
                  onClick={handleGalleryBack}
                >
                  {locale === 'IT' ? 'Indietro ↑' : 'Back ↑'}
                </button>
              ) : (
                <span className="project-media-scroll-hint">
                  {locale === 'IT' ? 'Scorri per esplorare →' : 'Scroll to explore →'}
                </span>
              )}
            </div>
            {/* The scrollable drag region also provides equivalent keyboard controls. */}
            {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
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
                if (!interactive || filteredMedia.length < 2) return;
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
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={mediaFilter}
                  className="project-media-gallery-track"
                  initial={
                    reducedMotion
                      ? { opacity: 1 }
                      : { opacity: 0.72, y: 14, clipPath: 'inset(0 0 100% 0)' }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    clipPath: 'inset(0 0 0% 0)',
                    pointerEvents: 'auto',
                  }}
                  exit={
                    reducedMotion
                      ? { opacity: 1, pointerEvents: 'none' }
                      : {
                          opacity: 0.72,
                          y: -10,
                          clipPath: 'inset(0 0 100% 0)',
                          pointerEvents: 'none',
                        }
                  }
                  transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: 'left top' }}
                >
                  {filteredMedia.map((media, index) => {
                    const isVideo = media.type === 'vimeo';
                    const previewSrc = isVideo
                      ? media.thumbnailSrc || getVimeoThumbnailUrl(media.src)
                      : media.src;
                    const dimensions =
                      media.width && media.height
                        ? { width: media.width, height: media.height }
                        : undefined;
                    const mediaAspectRatio = dimensions
                      ? `${dimensions.width} / ${dimensions.height}`
                      : isVideo
                        ? '16 / 9'
                        : '61 / 40';

                    return (
                      <motion.button
                        type="button"
                        key={media.key}
                        ref={(element) => {
                          mediaCardRefs.current[index] = element;
                        }}
                        className="project-media-card"
                        data-media-label={getImageName(media).toLowerCase()}
                        draggable={false}
                        aria-label={`Open ${media.alt}`}
                        onDragStart={(event) => event.preventDefault()}
                        onClick={() => {
                          if (suppressClickRef.current) {
                            suppressClickRef.current = false;
                            return;
                          }
                          handleMediaClick(index);
                        }}
                        initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: reducedMotion ? 0 : 0.44,
                          delay: reducedMotion ? 0 : Math.min(index, 8) * 0.035,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <span
                          className="project-media-card-frame"
                          style={{ aspectRatio: mediaAspectRatio }}
                        >
                          {previewSrc ? (
                            <img
                              src={previewSrc}
                              {...(!isVideo
                                ? getSanityImageSources(previewSrc, dimensions?.width)
                                : {})}
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
                            <span className="project-media-card-fallback">
                              Video preview unavailable
                            </span>
                          )}
                        </span>
                        <span className="project-media-card-name">[{getImageName(media)}]</span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
            {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
          </div>
        </div>
      </div>

      {lightboxOpen &&
        interactive &&
        createPortal(
          // The dialog backdrop click is supplementary to its native close button and Escape handler.
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
          <div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} media viewer`}
            onClick={(event) => {
              if (event.target === event.currentTarget) handleLightboxClose();
            }}
          >
            <button
              ref={lightboxCloseRef}
              className="lightbox-close"
              aria-label="Close lightbox"
              onClick={(event) => {
                event.stopPropagation();
                handleLightboxClose();
              }}
            >
              [close x]
            </button>
            <button
              className="lightbox-prev"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : filteredMedia.length - 1));
              }}
            >
              &lt;
            </button>
            <button
              className="lightbox-next"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev < filteredMedia.length - 1 ? prev + 1 : 0));
              }}
            >
              &gt;
            </button>
            <div className="lightbox-content" key={currentMedia.key}>
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
                <img src={currentMedia.src} alt={currentMedia.alt} className="lightbox-image" />
              )}
              <div className="lightbox-name">[{getImageName(currentMedia)}]</div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
