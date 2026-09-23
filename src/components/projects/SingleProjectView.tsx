import { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { isVimeoUrl, getVimeoThumbnailUrl } from '@/lib/vimeo';
import type { ProjectDomain, ProjectMedia } from '@/cms/domain';
import { getSanityImageSources } from '@/cms/image';
import { useLanguage } from '@/providers/LanguageProvider';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotionPreference } from '@/providers/MotionPreferenceProvider';
import {
  MEDIA_MOTION_CONSTANTS,
  getMediaMotionConfig,
  getMediaMotionTarget,
  getMediaViewportMetrics,
  getMotionAlpha,
  type MediaMotionRect,
  type MediaMotionTarget,
} from './projectMediaMotion';
import { ProjectMediaLightbox } from './ProjectMediaLightbox';
import { useProjectGalleryEntrance } from './useProjectGalleryEntrance';
import './SingleProjectView.css';
import '../home/FilterBar.css';

type SliderProjectData = Pick<ProjectDomain, 'slug' | 'title' | 'media'>;

interface SingleProjectViewProps {
  project: SliderProjectData;
  initialMediaKey?: string;
  interactive?: boolean;
  transitionPhase?: 'idle' | 'opening' | 'project' | 'closing';
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

function getOffsetLeftWithin(element: HTMLElement, ancestor: HTMLElement) {
  let offsetLeft = 0;
  let current: HTMLElement | null = element;

  while (current && current !== ancestor) {
    offsetLeft += current.offsetLeft;
    const offsetParent = current.offsetParent as HTMLElement | null;
    if (!offsetParent) return null;
    current = offsetParent;
    if (current !== ancestor) offsetLeft -= current.scrollLeft;
  }

  return current === ancestor ? offsetLeft : null;
}

function getHorizontalSnapTarget(
  viewport: HTMLElement,
  track: HTMLElement,
  card: HTMLElement,
  cards: HTMLElement[],
) {
  const viewportStyle = getComputedStyle(viewport);
  const length = (value: string) => Number.parseFloat(value) || 0;
  const trackStyle = getComputedStyle(track);
  const trackLeft = getOffsetLeftWithin(track, viewport);
  const cardIndex = cards.indexOf(card);
  if (trackLeft === null || cardIndex < 0) return null;

  const borderBoxWidth = (style: CSSStyleDeclaration) => {
    const width = length(style.width);
    if (style.boxSizing === 'border-box') return width;
    return (
      width +
      length(style.paddingInlineStart) +
      length(style.paddingInlineEnd) +
      length(style.borderInlineStartWidth) +
      length(style.borderInlineEndWidth)
    );
  };
  const gap = length(trackStyle.columnGap);
  let cardBorderStart =
    trackLeft +
    length(trackStyle.borderInlineStartWidth) +
    length(trackStyle.paddingInlineStart);

  for (const precedingCard of cards.slice(0, cardIndex)) {
    const precedingStyle = getComputedStyle(precedingCard);
    cardBorderStart +=
      length(precedingStyle.marginInlineStart) +
      borderBoxWidth(precedingStyle) +
      length(precedingStyle.marginInlineEnd) +
      gap;
  }

  const cardStyle = getComputedStyle(card);
  cardBorderStart += length(cardStyle.marginInlineStart);
  const roundedOffsetLeft = getOffsetLeftWithin(card, viewport);
  if (roundedOffsetLeft === null) return null;
  const fractionalLayoutDelta = cardBorderStart - roundedOffsetLeft;
  const exactCardBorderStart = roundedOffsetLeft + fractionalLayoutDelta;
  const cardBorderEnd = exactCardBorderStart + borderBoxWidth(cardStyle);

  const snapAlign = cardStyle.scrollSnapAlign.trim().split(/\s+/);
  const inlineAlignment = snapAlign[1] ?? snapAlign[0];
  const snapAreaStart = exactCardBorderStart - length(cardStyle.scrollMarginInlineStart);
  const snapAreaEnd = cardBorderEnd + length(cardStyle.scrollMarginInlineEnd);
  const snapportStart = length(viewportStyle.scrollPaddingInlineStart);
  const snapportEnd = viewport.clientWidth - length(viewportStyle.scrollPaddingInlineEnd);

  // offsetLeft is integer-rounded by the browser. Rebuild the fractional border
  // box start from the same track padding, item widths, margins, and flex gap so
  // the JS position matches CSS snap's snap area without a later browser nudge.
  const cardStart = snapAreaStart;
  const cardEnd = snapAreaEnd;
  let target: number;
  if (inlineAlignment === 'end') {
    target = cardEnd - snapportEnd;
  } else if (inlineAlignment === 'center') {
    target = (cardStart + cardEnd - snapportStart - snapportEnd) / 2;
  } else if (inlineAlignment === 'start') {
    target = cardStart - snapportStart;
  } else {
    return null;
  }

  return Math.min(Math.max(target, 0), Math.max(0, viewport.scrollWidth - viewport.clientWidth));
}

export function SingleProjectView({
  project,
  initialMediaKey,
  interactive = true,
  transitionPhase = 'project',
}: SingleProjectViewProps) {
  const allMedia = useMemo(() => project.media, [project.media]);
  const { locale } = useLanguage();
  const reducedMotion = useReducedMotionPreference();
  const [enteredThroughRotation] = useState(() => transitionPhase === 'opening');
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
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const mediaCardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const mediaInnerRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const visualMotionValuesRef = useRef<Array<MediaMotionTarget | undefined>>([]);
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
  const transitionMediaIndex = mediaFilter === 'all' ? initialMediaIndex : 0;
  const transitionMediaStart = Math.min(
    transitionMediaIndex,
    Math.max(0, filteredMedia.length - 3),
  );
  const transitionMediaEnd = Math.min(filteredMedia.length, transitionMediaStart + 3);

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
    const track = galleryTrackRef.current;
    if (!viewport || !track) return;

    const innerElements = mediaInnerRefs.current.slice(0, filteredMedia.length);
    const cachedMetrics: Array<{
      offsetLeft: number;
      width: number;
      offsetParent: Element | null;
    }> = [];
    const writtenValues: Array<MediaMotionTarget | undefined> = [];
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    let metricsValid = false;
    let useCachedOffsets = false;
    let rafId: number | null = null;
    let lastTime = 0;
    let forceImmediateSync = true;
    let previousScrollLeft = viewport.scrollLeft;
    let velocity = 0;

    const setMotionValue = (
      inner: HTMLSpanElement,
      property: '--media-motion-x' | '--media-motion-scale' | '--media-motion-opacity',
      value: string,
    ) => {
      inner.style.setProperty(property, value);
    };

    const writeMotionValues = (index: number, inner: HTMLSpanElement, next: MediaMotionTarget) => {
      const cached = writtenValues[index];
      const restoringNeutral =
        next.x === 0 &&
        next.scale === 1 &&
        next.opacity === 1 &&
        (cached?.x !== 0 || cached?.scale !== 1 || cached?.opacity !== 1);
      const previous = restoringNeutral ? undefined : cached;
      if (!previous || Math.abs(previous.x - next.x) >= MEDIA_MOTION_CONSTANTS.xEpsilon) {
        setMotionValue(inner, '--media-motion-x', `${next.x.toFixed(3)}px`);
      }
      if (
        !previous ||
        Math.abs(previous.scale - next.scale) >= MEDIA_MOTION_CONSTANTS.scaleEpsilon
      ) {
        setMotionValue(inner, '--media-motion-scale', next.scale.toFixed(5));
      }
      if (
        !previous ||
        Math.abs(previous.opacity - next.opacity) >= MEDIA_MOTION_CONSTANTS.opacityEpsilon
      ) {
        setMotionValue(inner, '--media-motion-opacity', next.opacity.toFixed(5));
      }
      // Keep the actual written values so sub-epsilon steps accumulate.
      writtenValues[index] = {
        x:
          !previous || Math.abs(previous.x - next.x) >= MEDIA_MOTION_CONSTANTS.xEpsilon
            ? next.x
            : previous.x,
        scale:
          !previous || Math.abs(previous.scale - next.scale) >= MEDIA_MOTION_CONSTANTS.scaleEpsilon
            ? next.scale
            : previous.scale,
        opacity:
          !previous ||
          Math.abs(previous.opacity - next.opacity) >= MEDIA_MOTION_CONSTANTS.opacityEpsilon
            ? next.opacity
            : previous.opacity,
      };
    };

    const setNeutralMotion = () => {
      innerElements.forEach((inner, index) => {
        if (!inner) return;
        const neutral = { x: 0, scale: 1, opacity: 1 };
        visualMotionValuesRef.current[index] = neutral;
        writeMotionValues(index, inner, neutral);
      });
    };

    if (reducedMotion) {
      setNeutralMotion();
      return;
    }

    const invalidateMetrics = () => {
      metricsValid = false;
      queueGalleryMotionUpdate();
    };

    const refreshMetrics = () => {
      const cards = mediaCardRefs.current.slice(0, filteredMedia.length);
      if (cards.length !== filteredMedia.length || cards.some((card) => !card)) return false;

      cachedMetrics.length = 0;
      const parents = cards.map((card) => card?.offsetParent ?? null);
      const commonOffsetParent = parents[0];
      const stableOffsetParent =
        commonOffsetParent === track &&
        parents.every((parent) => parent === commonOffsetParent) &&
        window.getComputedStyle(track).transform === 'none';
      cards.forEach((card) => {
        if (!card) return;
        cachedMetrics.push({
          offsetLeft: card.offsetLeft,
          width: card.offsetWidth,
          offsetParent: card.offsetParent,
        });
      });
      useCachedOffsets = stableOffsetParent && cachedMetrics.every((metric) => metric.width > 0);
      metricsValid = true;
      return true;
    };

    const getCardRect = (index: number, coordinateParentRect: DOMRect): MediaMotionRect | null => {
      const card = mediaCardRefs.current[index];
      if (!card) return null;
      const metric = cachedMetrics[index];
      if (useCachedOffsets && metric) {
        const left = coordinateParentRect.left + metric.offsetLeft;
        return { left, right: left + metric.width, top: 0, bottom: 0 };
      }
      const rect = card.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
    };

    const updateGalleryMotion = (time: number) => {
      rafId = null;
      if (document.visibilityState === 'hidden') return;

      const viewportRect = viewport.getBoundingClientRect();
      if (viewport.clientWidth <= 0 || viewportRect.width <= 0) return;
      if (!metricsValid && !refreshMetrics()) return;

      const coordinateParent = useCachedOffsets ? cachedMetrics[0]?.offsetParent : null;
      const coordinateParentRect =
        coordinateParent?.getBoundingClientRect() ?? track.getBoundingClientRect();
      const deltaTime = lastTime === 0 ? 1000 / 60 : Math.min(time - lastTime, 64);
      lastTime = time;
      const scrollDelta = viewport.scrollLeft - previousScrollLeft;
      previousScrollLeft = viewport.scrollLeft;
      const measuredVelocity = forceImmediateSync
        ? 0
        : Math.max(-4500, Math.min(4500, (scrollDelta * 1000) / Math.max(deltaTime, 1)));
      const velocityAlpha =
        1 - Math.exp((-MEDIA_MOTION_CONSTANTS.velocityLambda * deltaTime) / 1000);
      velocity = forceImmediateSync ? 0 : velocity + (measuredVelocity - velocity) * velocityAlpha;
      if (Math.abs(velocity) < MEDIA_MOTION_CONSTANTS.velocityEpsilon && scrollDelta === 0)
        velocity = 0;
      const config = getMediaMotionConfig(mobileQuery.matches);
      const alpha = forceImmediateSync ? 1 : getMotionAlpha(deltaTime);
      let allSettled = velocity === 0;

      innerElements.forEach((inner, index) => {
        if (!inner) return;
        const cardRect = getCardRect(index, coordinateParentRect);
        if (!cardRect) return;
        const metrics = getMediaViewportMetrics(cardRect, {
          left: viewportRect.left,
          right: viewportRect.right,
          top: viewportRect.top,
          bottom: viewportRect.bottom,
        });
        const target = getMediaMotionTarget(metrics, config, velocity);
        const current = visualMotionValuesRef.current[index] ?? target;
        const next = forceImmediateSync
          ? target
          : {
              x: current.x + (target.x - current.x) * alpha,
              scale: current.scale + (target.scale - current.scale) * alpha,
              opacity: current.opacity + (target.opacity - current.opacity) * alpha,
            };
        const settled = {
          x: Math.abs(next.x - target.x) < MEDIA_MOTION_CONSTANTS.xEpsilon,
          scale: Math.abs(next.scale - target.scale) < MEDIA_MOTION_CONSTANTS.scaleEpsilon,
          opacity: Math.abs(next.opacity - target.opacity) < MEDIA_MOTION_CONSTANTS.opacityEpsilon,
        };
        const snapped = settled.x && settled.scale && settled.opacity ? target : next;
        visualMotionValuesRef.current[index] = snapped;
        writeMotionValues(index, inner, snapped);
        if (!settled.x || !settled.scale || !settled.opacity) allSettled = false;
      });

      forceImmediateSync = false;
      if (!allSettled) queueGalleryMotionUpdate();
      else lastTime = 0;
    };

    function queueGalleryMotionUpdate() {
      if (rafId !== null || document.visibilityState === 'hidden') return;
      rafId = window.requestAnimationFrame(updateGalleryMotion);
    }

    const handleScroll = () => queueGalleryMotionUpdate();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        rafId = null;
        lastTime = 0;
        return;
      }
      forceImmediateSync = true;
      invalidateMetrics();
    };

    const resizeObserver = new ResizeObserver(invalidateMetrics);
    resizeObserver.observe(viewport);
    resizeObserver.observe(track);
    viewport.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    queueGalleryMotionUpdate();

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      viewport.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
      visualMotionValuesRef.current = [];
    };
  }, [filteredMedia, project.slug, reducedMotion]);

  useLayoutEffect(() => {
    const viewport = galleryViewportRef.current;
    const track = galleryTrackRef.current;
    if (!viewport || !track) return;

    const card = mediaCardRefs.current[mediaFilter === 'all' ? initialMediaIndex : 0];
    if (card) {
      const cards = mediaCardRefs.current
        .slice(0, filteredMedia.length)
        .filter((item): item is HTMLButtonElement => Boolean(item));
      const target = getHorizontalSnapTarget(viewport, track, card, cards);
      if (target !== null) viewport.scrollTo({ left: target, behavior: 'instant' });
    }
  }, [initialMediaIndex, mediaFilter, filteredMedia.length, project.slug]);

  const galleryEntrance = useProjectGalleryEntrance(
    galleryViewportRef,
    mediaCardRefs,
    transitionPhase,
    reducedMotion,
    mediaFilter,
    transitionPhase === 'project',
    enteredThroughRotation,
  );

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

  useEffect(() => {
    const cancelPointerDrag = () => {
      const viewport = galleryViewportRef.current;
      const pointerId = activePointerIdRef.current;
      if (pointerId !== null && viewport?.hasPointerCapture(pointerId)) {
        viewport.releasePointerCapture(pointerId);
      }
      activePointerIdRef.current = null;
      isDraggingRef.current = false;
      hasDraggedRef.current = false;
      suppressClickRef.current = false;
      setIsDragging(false);
    };

    window.addEventListener('blur', cancelPointerDrag);
    return () => window.removeEventListener('blur', cancelPointerDrag);
  }, []);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const viewport = galleryViewportRef.current;
    if (!viewport) return;

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    if (viewport.scrollWidth <= viewport.clientWidth) return;

    viewport.scrollBy({ left: delta, behavior: 'auto' });
  };

  const handleMediaFilterChange = (nextFilter: MediaFilter) => {
    galleryViewportRef.current?.scrollTo({ left: 0, behavior: 'auto' });
    mediaCardRefs.current = [];
    mediaInnerRefs.current = [];
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
        data-project-transition-phase={transitionPhase}
        data-gallery-entrance={galleryEntrance}
        data-entered-through-rotation={enteredThroughRotation}
        data-project-content-visible={interactive}
        data-motion-project-surface
      >
        <div className="single-project-content">
          <div className="project-media-gallery" data-project-transition-target={project.slug}>
            <div className="project-media-gallery-header">
              <nav
                className="filter-bar project-media-filter"
                data-motion-text
                data-motion-order="-1"
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
                  data-motion-text
                  data-motion-order="8"
                  onClick={handleGalleryBack}
                >
                  {locale === 'IT' ? 'Indietro ←' : 'Back ←'}
                </button>
              ) : (
                <span className="project-media-scroll-hint" data-motion-text data-motion-order="8">
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
                  ref={galleryTrackRef}
                  key={mediaFilter}
                  className="project-media-gallery-track"
                  initial={false}
                  animate={{
                    opacity: 1,
                    clipPath: 'inset(0 0 0% 0)',
                    pointerEvents: 'auto',
                  }}
                  exit={
                    reducedMotion
                      ? { opacity: 1, pointerEvents: 'none' }
                      : {
                          opacity: 0.72,
                          clipPath: 'inset(0 0 100% 0)',
                          pointerEvents: 'none',
                        }
                  }
                  transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  {filteredMedia.map((media, index) => {
                    const isVideo = media.type === 'vimeo';
                    const isTransitionMedia =
                      enteredThroughRotation &&
                      index >= transitionMediaStart &&
                      index < transitionMediaEnd;
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
                      <button
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
                      >
                        <span className="project-media-card-depth">
                          <span
                            ref={(element) => {
                              mediaInnerRefs.current[index] = element;
                            }}
                            className="project-media-card-inner"
                          >
                            <span
                              className="project-media-card-frame"
                              style={{ aspectRatio: mediaAspectRatio }}
                            >
                              {previewSrc ? (
                                <img
                                  src={previewSrc}
                                  {...getSanityImageSources(previewSrc, dimensions?.width)}
                                  alt={media.alt}
                                  className="project-media-card-image"
                                  draggable={false}
                                  width={dimensions?.width ?? (isVideo ? 1280 : undefined)}
                                  height={dimensions?.height ?? (isVideo ? 720 : undefined)}
                                  data-transition-media={isTransitionMedia ? '' : undefined}
                                  loading={
                                    isTransitionMedia || index === initialMediaIndex
                                      ? 'eager'
                                      : 'lazy'
                                  }
                                  decoding="async"
                                  fetchPriority={index === transitionMediaIndex ? 'high' : 'auto'}
                                  onDragStart={(event) => event.preventDefault()}
                                />
                              ) : (
                                <span className="project-media-card-fallback">
                                  Video preview unavailable
                                </span>
                              )}
                            </span>
                            <span className="project-media-card-name">[{getImageName(media)}]</span>
                          </span>
                        </span>
                      </button>
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
          <ProjectMediaLightbox
            media={currentMedia}
            label={getImageName(currentMedia)}
            title={project.title}
            source={mediaCardRefs.current[safeCurrentImageIndex]?.querySelector('img') ?? null}
            reducedMotion={reducedMotion}
            onClose={() => setLightboxOpen(false)}
            onPrevious={() =>
              setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : filteredMedia.length - 1))
            }
            onNext={() =>
              setCurrentImageIndex((prev) => (prev < filteredMedia.length - 1 ? prev + 1 : 0))
            }
          />,
          document.body,
        )}
    </>
  );
}
