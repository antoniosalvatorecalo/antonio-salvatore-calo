import { useRef, useState, useEffect, useLayoutEffect, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useEntranceReveal } from '../../hooks/animation/useEntranceReveal';
import { gsap } from '../../lib/gsap-setup';
import { useReducedMotionPreference } from '../../providers/MotionPreferenceProvider';
import { LetterSwapForward } from './letter-swap';
import type { ProjectData } from '../../content/projects';
import { workProjectExtrasRegistry } from '../../content/workProjectExtras';
import './ArtworkCarousel.css';

export interface ArtworkCarouselProject {
  id: string;
  title: string;
  shortTitle?: string;
  images: string[];
}

export interface ArtworkCarouselProps {
  projects: ArtworkCarouselProject[];
  scrollerRef?: RefObject<HTMLDivElement | null>;
}

export function filterArtworkImages(images: string[]): string[] {
  return images.filter((src) => !/Thumbnail\.(webp|jpg|jpeg|png)$/i.test(src));
}

export function ArtworkCarousel({
  projects,
  scrollerRef,
}: ArtworkCarouselProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEntranceReveal(sectionRef, {
    selector: '[data-artwork-card]',
    scrollerRef,
    start: 'top 88%',
    once: true,
    y: 32,
    blur: 10,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.06,
  });

  return (
    <section
      ref={sectionRef}
      className="artwork-carousel-row"
    >
      {projects.map((project) => (
        <ArtworkGroup
          key={project.id}
          project={project}
        />
      ))}
    </section>
  );
}

function ArtworkGroup({ project }: { project: ArtworkCarouselProject }) {
  const extras = workProjectExtrasRegistry[project.id];
  // Show the complete set of project photos — no filtering.
  const artworkImages = project.images;
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const prefersReducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (prefersReducedMotion) {
      gsap.set(panel, { height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 });
      return;
    }
    if (isExpanded) {
      gsap.fromTo(
        panel,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.45, ease: 'power3.out' }
      );
    } else {
      gsap.to(panel, { height: 0, opacity: 0, duration: 0.3, ease: 'power3.in' });
    }
  }, [isExpanded, prefersReducedMotion]);

  const toggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsExpanded((v) => !v);
  };

  // ── Linear draggable strip (no wrap-around) ─────────────────────────
  // The strip contains only the real images. Dragging forward stops at
  // the last image; dragging backward stops at the first. Snap index
  // range is [0, realCount - 1].
  const extendedImages = artworkImages;
  const realCount = artworkImages.length;
  const [stripIndex, setStripIndex] = useState(0);

  // Keep strip position in sync with stripIndex (after resize).
  // When on the last image, position so the last card's right edge
  // aligns with the track's right edge (no empty space after it).
  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const track = trackRef.current;
    if (!track) return;
    const card = strip.querySelector<HTMLElement>('[data-artwork-card]');
    if (!card) return;
    const gap = 6;
    const cardWidth = card.offsetWidth + gap;
    const maxIdx = Math.max(0, realCount - 1);
    let targetX: number;
    if (stripIndex === maxIdx) {
      const stripWidth = realCount * cardWidth - gap;
      const trackWidth = track.offsetWidth;
      targetX = stripWidth > trackWidth ? -(stripWidth - trackWidth) : 0;
    } else {
      targetX = -stripIndex * cardWidth;
    }
    gsap.set(strip, { x: targetX });
  }, [stripIndex, realCount]);

  useEffect(() => {
    const track = trackRef.current;
    const strip = stripRef.current;
    if (!track || !strip) return;
    const cards = strip.querySelectorAll<HTMLElement>('[data-artwork-card]');
    if (cards.length === 0) return;

    let startX = 0;
    let currentX = 0; // visual translateX of strip
    let pointerStartX = 0;
    let lastPointerX = 0;
    let lastMoveTime = 0;
    let velocityX = 0; // pixels per ms
    let dragging = false;
    let pointerId: number | null = null;
    let visualIndex = stripIndex; // mirrors stripIndex but for local math

    const getCardWidth = () => {
      const first = cards[0];
      if (!first) return 0;
      // Card width + horizontal gap (matches CSS gap: 6px)
      return first.offsetWidth + 6;
    };

    // Total strip width minus the trailing gap after the last card.
    const getStripWidth = () => realCount * getCardWidth() - 6;

    // Minimum strip X: when on the last card, align the strip's right
    // edge with the track's right edge (so the last image stops precisely
    // at the right side of the viewport, no empty space after it).
    // If the strip is narrower than the track, min X is 0 (no scroll needed).
    const getMinX = () => {
      const trackWidth = track.offsetWidth;
      const stripWidth = getStripWidth();
      return stripWidth > trackWidth ? -(stripWidth - trackWidth) : 0;
    };

    const measureCurrentX = () => -visualIndex * getCardWidth();

    const snapTo = (targetVisualIndex: number, animate = true) => {
      const cw = getCardWidth();
      // Clamp to valid range: stop precisely at first / last image
      const maxIdx = Math.max(0, realCount - 1);
      const clampedIdx = Math.max(0, Math.min(maxIdx, targetVisualIndex));
      let targetX: number;
      if (clampedIdx === maxIdx) {
        // Last image: align its right edge with the track's right edge
        const minX = getMinX();
        targetX = minX; // already negative or 0
      } else {
        targetX = -clampedIdx * cw;
      }
      currentX = targetX;
      visualIndex = clampedIdx;
      if (animate && !prefersReducedMotion) {
        gsap.to(strip, {
          x: targetX,
          duration: 0.55,
          ease: 'power3.out',
          onComplete: () => {
            if (visualIndex !== stripIndex) {
              setStripIndex(visualIndex);
            }
          },
        });
      } else {
        gsap.set(strip, { x: targetX });
        if (visualIndex !== stripIndex) {
          setStripIndex(visualIndex);
        }
      }
      setActiveSlide(clampedIdx);
      // Animate the "focus" state on each card (offset + scale + opacity)
      applyFocusState(clampedIdx, animate);
    };

    const applyFocusState = (activeIdx: number, animate: boolean) => {
      const reduced = prefersReducedMotion;
      cards.forEach((card, i) => {
        const distance = Math.abs(i - activeIdx);
        // 0 = active (lifted, scaled up), 1 = neighbour, 2+ = far (recede)
        const lift = distance === 0 ? -10 : 0;
        const scale = distance === 0 ? 1.04 : 0.94;
        const opacity = distance === 0 ? 1 : distance === 1 ? 0.85 : 0.7;
        if (animate && !reduced) {
          gsap.to(card, {
            y: lift,
            scale,
            opacity,
            duration: 0.5,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        } else {
          gsap.set(card, { y: lift, scale, opacity });
        }
      });
    };

    const onDown = (e: PointerEvent) => {
      // Only react to primary pointer / left button
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      pointerId = e.pointerId;
      pointerStartX = e.clientX;
      lastPointerX = e.clientX;
      lastMoveTime = performance.now();
      velocityX = 0;
      startX = e.clientX - measureCurrentX();
      try {
        track.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      gsap.killTweensOf(strip);
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      // Clamp drag position so the strip can't move past the first or last image.
      // Lower bound: getMinX() — last image flush right with no empty space after it
      // Upper bound: x = 0 (first image flush left)
      const minX = getMinX();
      const rawX = e.clientX - startX;
      currentX = Math.max(minX, Math.min(0, rawX));
      // Track velocity for flick-to-skip behavior
      const now = performance.now();
      const dt = now - lastMoveTime;
      if (dt > 0) {
        velocityX = (e.clientX - lastPointerX) / dt; // px / ms
      }
      lastPointerX = e.clientX;
      lastMoveTime = now;
      gsap.set(strip, { x: currentX });
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      if (pointerId !== null) {
        try {
          track.releasePointerCapture(pointerId);
        } catch {
          /* ignore */
        }
        pointerId = null;
      }
      const cw = getCardWidth();
      if (cw <= 0) return;

      // Total drag distance from start
      const totalDrag = currentX - (-visualIndex * cw);

      // Snap to nearest card by default
      let idx = Math.round(-currentX / cw);

      // If the user dragged at least ~10px in either direction, guarantee
      // they advance at least one card — otherwise tiny drags feel broken.
      const dragAdvanceThreshold = 10;
      if (Math.abs(totalDrag) > dragAdvanceThreshold) {
        const dir = totalDrag < 0 ? 1 : -1; // drag left → forward
        if (Math.sign(idx - visualIndex) !== dir) {
          idx = visualIndex + dir;
        }
      }

      // Velocity-based skip: a fast flick advances an extra card.
      const flickThreshold = 0.4;
      if (Math.abs(velocityX) > flickThreshold) {
        const dir = velocityX < 0 ? 1 : -1; // moving left → advance forward
        idx += dir;
      }

      // Clamp to valid range — stop precisely at first and last image.
      snapTo(idx, true);
      velocityX = 0;
    };

    const onResize = () => {
      // Re-snap to the current visualIndex so minX/maxX are recomputed
      // against the new track width. This keeps the last image flush
      // right with no empty space after it on any viewport.
      snapTo(visualIndex, false);
    };

    track.addEventListener('pointerdown', onDown);
    track.addEventListener('pointermove', onMove);
    track.addEventListener('pointerup', onUp);
    track.addEventListener('pointercancel', onUp);
    window.addEventListener('resize', onResize);

    // Apply initial focus state AFTER the entrance reveal has had a chance
    // to play (it tweens y/opacity/filter on the same cards). Running on
    // the next frame lets the entrance tween own the first paint.
    let initialFocusApplied = false;
    const applyInitialFocus = () => {
      if (initialFocusApplied) return;
      initialFocusApplied = true;
      applyFocusState(0, true);
    };
    const initialFocusTimer = window.setTimeout(applyInitialFocus, 900);
    // Also apply on first user interaction, in case entrance hasn't finished.
    const onFirstInteract = () => {
      window.clearTimeout(initialFocusTimer);
      applyInitialFocus();
      track.removeEventListener('pointerdown', onFirstInteract);
    };
    track.addEventListener('pointerdown', onFirstInteract, { once: true });

    return () => {
      track.removeEventListener('pointerdown', onDown);
      track.removeEventListener('pointermove', onMove);
      track.removeEventListener('pointerup', onUp);
      track.removeEventListener('pointercancel', onUp);
      track.removeEventListener('pointerdown', onFirstInteract);
      window.removeEventListener('resize', onResize);
      window.clearTimeout(initialFocusTimer);
      gsap.killTweensOf(strip);
      // Reset card transforms so re-mounts don't keep stale focus state
      cards.forEach((card) => gsap.set(card, { clearProps: 'y,scale,opacity' }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realCount, prefersReducedMotion]);

  return (
    <div
      className="artwork-carousel-group"
      data-artwork-group={project.id}
    >
      <div className="artwork-carousel-header">
        <div className="artwork-carousel-title-wrap">
          <h3 className="artwork-carousel-group-title">
            <span className="artwork-carousel-title-clip">
              <LetterSwapForward
                label={project.shortTitle ?? project.title}
                className="artwork-carousel-group-title-swap"
                staggerDuration={0.02}
              />
            </span>
          </h3>
          <span className="artwork-carousel-meta">
            <span className="artwork-carousel-meta-category">{project.category}</span>
            <span className="artwork-carousel-meta-year">[{project.year}]</span>
          </span>
        </div>
        {extras && (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Hide project credits' : 'Show project credits'}
            className={`artwork-carousel-plus ${isExpanded ? 'is-active' : ''}`}
          >
            <span className="artwork-carousel-plus-icon" aria-hidden="true">
              {isExpanded ? '×' : '+'}
            </span>
          </button>
        )}
      </div>

      {extras && (
        <div
          ref={panelRef}
          className="artwork-carousel-credits-panel"
          style={{ height: 0, opacity: 0, overflow: 'hidden' }}
          aria-hidden={!isExpanded}
        >
          <div className="artwork-carousel-credits-inner">
            <div className="artwork-carousel-credits-columns">
              <div className="artwork-carousel-credits-intro">
                <p className="artwork-carousel-credits-description">{extras.shortDescription}</p>
                <div className="artwork-carousel-cta-row">
                  <Link
                    to={extras.projectRoute}
                    className="artwork-carousel-cta-link group"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="relative hover-underline">
                      <LetterSwapForward
                        label="Open project page"
                        className="artwork-carousel-cta-label"
                        staggerDuration={0.025}
                      />
                    </span>
                    <span className="nav-pill-arrow-mask" aria-hidden="true">
                      <ArrowUpRight className="nav-pill-arrow-icon" />
                    </span>
                  </Link>
                  {extras.links.map((l, i) => (
                    <a
                      key={i}
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="artwork-carousel-cta-link group"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="relative hover-underline">
                        <LetterSwapForward
                          label={l.label}
                          className="artwork-carousel-cta-label"
                          staggerDuration={0.025}
                        />
                      </span>
                      <span className="nav-pill-arrow-mask" aria-hidden="true">
                        <ArrowUpRight className="nav-pill-arrow-icon" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
              <div className="artwork-carousel-credits-list">
                {extras.credits.map((c, i) => (
                  <div key={i} className="artwork-carousel-credit-item">
                    <span className="artwork-carousel-credit-label">{c.label}</span>
                    <div className="artwork-carousel-credit-values">
                      {c.values.map((v, j) => (
                        <span key={j} className="artwork-carousel-credit-value">{v}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="artwork-carousel-track"
        ref={trackRef}
        role="region"
        aria-label={`${project.title} artwork`}
      >
        <div
          className="artwork-carousel-strip"
          ref={stripRef}
        >
          {extendedImages.map((src, i) => {
            // No clones — every rendered card is a real image.
            // Counter shows just the sequence number (1-based) below
            // the photo, right-aligned.
            return (
              <figure
                key={`${src}-${i}`}
                className="artwork-card artwork-card-carousel"
                data-artwork-card
              >
                <div className="artwork-card-media">
                  <img
                    src={src}
                    alt={`${project.title} ${i + 1}`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable={false}
                    className="artwork-card-img"
                  />
                </div>
                <span className="artwork-card-counter">{String(i + 1).padStart(2, '0')}</span>
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function projectsToCarouselProjects(projects: ProjectData[]): ArtworkCarouselProject[] {
  return projects.map((p) => ({
    id: p.id,
    title: p.title,
    shortTitle: p.titleLines?.[0],
    images: p.images,
  }));
}

export default ArtworkCarousel;