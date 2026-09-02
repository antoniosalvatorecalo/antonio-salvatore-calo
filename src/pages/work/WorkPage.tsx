import { useRef, useEffect, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { gsap, ScrollTrigger } from '../../lib/gsap-setup';
import { usePressedState } from '@/hooks/usePressedState';
import { type ProjectData } from '@/content/projects';
import { projectWorkRegistry } from '@/content/projectWorkData';
import { ProjectListRow } from '../../components/ui/ProjectListRow';
import ProjectGallery from '../../components/ui/ProjectGallery';
import { WorkViewSwitcher, type WorkView } from '../../components/ui/WorkViewSwitcher';
import { GridProjectsView } from './views/GridProjectsView';
import { LetterSwapBlock } from '../../components/ui/letter-swap';
import { useReducedMotionPreference } from '../../providers/MotionPreferenceProvider';
import { instantTransition } from '../../lib/reduced-motion';
import './WorkPage.css';

// ─── List View ────────────────────────────────────────────────────────────────

const MobileGalleryCard: FC<{ project: ProjectData; onNavigate: (id: string) => void }> = ({ project, onNavigate }) => {
  const { isPressed, isPressedRef, onTouchStart, onTouchEnd, onTouchMove } = usePressedState();

  const handleClick = () => {
    if (isPressedRef.current) {
      isPressedRef.current = false;
      return;
    }
    onNavigate(project.id);
  };

  return (
    <div
      className="mobile-gallery-card"
      onClick={handleClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
    >
      <div className="mobile-gallery-card-media">
        <ProjectGallery
          images={project.images}
          projectId={project.id}
          aspect={project.aspect}
          onClick={() => onNavigate(project.id)}
        />
      </div>
      <div className="mobile-gallery-card-meta">
        <LetterSwapBlock
          lines={project.titleLines ?? [project.title]}
          externalHovered={isPressed}
          className="mobile-gallery-card-title"
        />
        <span className="mobile-gallery-card-tags">
          {(project.tags ?? [project.category]).join(', ')}
        </span>
      </div>
    </div>
  );
};

function ListViewContainer({ onNavigate }: { onNavigate: (id: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotionPreference();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Cascade entrance per item (desktop row / mobile card)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const selector = isMobile ? '.mobile-gallery-card' : '.project-list-row-wrap';
    const items = Array.from(container.querySelectorAll<HTMLElement>(selector));
    if (!items.length) return;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        items.forEach((item) => {
          gsap.set(item, { opacity: 1, y: 0, filter: 'blur(0px)', clearProps: 'willChange' });
          item.classList.add('entrance-reveal-complete');
        });
        return;
      }

      items.forEach((item) => {
        let title: HTMLElement | null = null;
        let tags: HTMLElement | null = null;
        let media: HTMLElement | null = null;

        if (isMobile) {
          title = item.querySelector<HTMLElement>('.mobile-gallery-card-title');
          tags = item.querySelector<HTMLElement>('.mobile-gallery-card-tags');
          media = item.querySelector<HTMLElement>('.mobile-gallery-card-media');
        } else {
          title = item.querySelector<HTMLElement>('.project-list-title');
          tags = item.querySelector<HTMLElement>('.project-list-tags');
          media = item.querySelector<HTMLElement>('.project-list-row > .shrink-0');
        }

        gsap.set(item, {
          opacity: 0,
          y: isMobile ? 28 : 18,
          filter: `blur(${isMobile ? 6 : 4}px)`,
          willChange: 'opacity, transform, filter',
        });
        if (media) {
          gsap.set(media, {
            opacity: 0,
            y: isMobile ? 16 : 8,
            filter: `blur(${isMobile ? 5 : 2}px)`,
            willChange: 'opacity, transform, filter',
          });
        }
        if (title) {
          gsap.set(title, {
            opacity: 0,
            y: isMobile ? 14 : 12,
            filter: `blur(${isMobile ? 4 : 3}px)`,
            willChange: 'opacity, transform, filter',
          });
        }
        if (tags) {
          gsap.set(tags, {
            opacity: 0,
            y: isMobile ? 10 : 8,
            filter: `blur(${isMobile ? 3 : 2}px)`,
            willChange: 'opacity, transform, filter',
          });
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            once: true,
            invalidateOnRefresh: true,
          },
          onComplete: () => {
            item.classList.add('entrance-reveal-complete');
            gsap.set([item, media, title, tags].filter(Boolean), { clearProps: 'willChange' });
          },
        });

        if (isMobile) {
          tl.to(item, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' }, 0)
            .to(media, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' }, 0.08)
            .to(title, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.48, ease: 'power3.out' }, 0.18)
            .to(tags, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4, ease: 'power3.out' }, 0.26);
        } else {
          tl.to(item, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.58, ease: 'power3.out' }, 0)
            .to(title, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' }, 0.1)
            .to(tags, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.42, ease: 'power3.out' }, 0.18)
            .to(media, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.45, ease: 'power3.out' }, 0.24);
        }
      });
    }, container);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [prefersReducedMotion, isMobile]);

  // Hover underline reveal per row — desktop only
  useEffect(() => {
    if (isMobile) return;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return;

      const rows = containerRef.current
        ? Array.from(containerRef.current.querySelectorAll<HTMLElement>('.project-list-row-wrap'))
        : [];

      rows.forEach((row) => {
        const line = row.querySelector<HTMLElement>('.list-title-underline');
        if (!line) return;

        const onEnter = () => {
          gsap.to(line, {
            scaleX: 1,
            duration: 0.4,
            ease: 'power3.out',
            transformOrigin: 'left center',
            overwrite: true,
          });
        };
        const onLeave = () => {
          gsap.to(line, {
            scaleX: 0,
            duration: 0.3,
            ease: 'power3.in',
            transformOrigin: 'right center',
            overwrite: true,
          });
        };

        row.addEventListener('mouseenter', onEnter);
        row.addEventListener('mouseleave', onLeave);

        (row as HTMLElement & { _cleanupHover?: () => void })._cleanupHover = () => {
          row.removeEventListener('mouseenter', onEnter);
          row.removeEventListener('mouseleave', onLeave);
        };
      });
    }, containerRef);

    return () => {
      if (containerRef.current) {
        containerRef.current
          .querySelectorAll<HTMLElement & { _cleanupHover?: () => void }>('.project-list-row-wrap')
          .forEach((row) => row._cleanupHover?.());
      }
      ctx.revert();
    };
  }, [prefersReducedMotion, isMobile]);

  return (
    <div ref={containerRef} className="list-view-container">
      {isMobile ? (
        <div className="mobile-gallery-list">
          {projectWorkRegistry.map((project) => (
            <MobileGalleryCard key={project.id} project={project} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        projectWorkRegistry.map((project) => (
          <div key={project.id} className="project-list-row-wrap relative">
            <ProjectListRow
              project={project}
              onViewProject={() => onNavigate(project.id)}
            />
            <span
              className="list-title-underline"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'var(--text-primary)',
                transform: 'scaleX(0)',
                transformOrigin: 'left center',
                pointerEvents: 'none',
              }}
            />
          </div>
        ))
      )}
    </div>
  );
}

// ─── Featured View ─────────────────────────────────────────────────────────────

function FeaturedCard({
  project,
  onNavigate,
}: {
  project: ProjectData;
  onNavigate: (id: string) => void;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const prefersReducedMotion = useReducedMotionPreference();
  const images = project.images;

  useEffect(() => {
    const container = carouselRef.current;
    const strip = stripRef.current;
    if (!container || !strip) return;

    let startX = 0;
    let currentX = 0;
    let dragging = false;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX - currentX;
      container.setPointerCapture(e.pointerId);
      gsap.killTweensOf(strip);
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      currentX = e.clientX - startX;
      const maxX = -(images.length - 1) * container.offsetWidth;
      const clamped = Math.max(maxX, Math.min(0, currentX));
      gsap.set(strip, { x: clamped });
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      const w = container.offsetWidth;
      const idx = Math.round(-currentX / w);
      const snapped = Math.max(0, Math.min(images.length - 1, idx));
      currentX = -snapped * w;
      gsap.to(strip, { x: currentX, duration: prefersReducedMotion ? 0 : 0.5, ease: 'power3.out' });
      setActiveSlide(snapped);
    };

    container.addEventListener('pointerdown', onDown);
    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerup', onUp);
    container.addEventListener('pointercancel', onUp);

    return () => {
      container.removeEventListener('pointerdown', onDown);
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerup', onUp);
      container.removeEventListener('pointercancel', onUp);
      gsap.killTweensOf(strip);
    };
  }, [images.length, prefersReducedMotion]);

  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const { isPressed: isTitlePressed, isPressedRef, onTouchStart: onTitleTouchStart, onTouchEnd: onTitleTouchEnd, onTouchMove: onTitleTouchMove } = usePressedState();

  const handleCardClick = () => {
    if (isPressedRef.current) {
      isPressedRef.current = false;
      return;
    }
    onNavigate(project.id);
  };

  return (
    <div
      className="featured-card-v2"
      onClick={handleCardClick}
    >
      {/* Left column */}
      <div className="featured-card-left">
        <div
          onMouseEnter={() => setIsTitleHovered(true)}
          onMouseLeave={() => setIsTitleHovered(false)}
          onTouchStart={onTitleTouchStart}
          onTouchEnd={onTitleTouchEnd}
          onTouchMove={onTitleTouchMove}
          style={{ cursor: 'pointer' }}
        >
          <LetterSwapBlock
            lines={project.titleLines ?? [project.title]}
            externalHovered={(isTitleHovered || isTitlePressed) && !prefersReducedMotion}
            className="featured-title-v2"
          />
        </div>
        <div className="featured-card-bottom">
          <span className="featured-context-label">{project.contextLabel ?? 'Context'}</span>
          <p className="featured-desc">{project.descriptionCol1}</p>
        </div>
      </div>

      {/* Right column — draggable carousel */}
      <div
        ref={carouselRef}
        className="featured-card-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={stripRef}
          className="featured-drag-strip"
          style={{ width: `${images.length * 100}%` }}
        >
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${project.title} — image ${i + 1}`}
              className="featured-drag-img"
              style={{ width: `${100 / images.length}%`, height: '100%' }}
              loading={i === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />
          ))}
        </div>
        {images.length > 1 && (
          <div className="featured-dots">
            {images.map((_, i) => (
              <span
                key={i}
                className={`featured-dot${i === activeSlide ? ' active' : ''}`}
              />
            ))}
          </div>
        )}
        {images.length > 1 && (
          <div className="featured-card-filmstrip">
            {images.map((src, i) => (
              <div
                key={i}
                className={`featured-card-filmstrip-thumb${i === activeSlide ? ' is-active' : ''}`}
              >
                <img
                  src={src}
                  alt=""
                  width={48}
                  height={32}
                  loading="lazy"
                  draggable={false}
                  className="featured-card-filmstrip-img"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturedProjectsView({ onNavigate }: { onNavigate: (id: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotionPreference();

  // Cascade entrance per card
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = Array.from(container.querySelectorAll<HTMLElement>('.featured-card-v2'));
    if (!cards.length) return;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        cards.forEach((card) => {
          gsap.set(card, { opacity: 1, y: 0, filter: 'blur(0px)', clearProps: 'willChange' });
          card.querySelectorAll<HTMLElement>('.featured-title-v2, .featured-card-bottom, .featured-card-right')
            .forEach((el) => gsap.set(el, { opacity: 1, y: 0, filter: 'blur(0px)', clearProps: 'willChange' }));
          gsap.set('.featured-card-right', { clipPath: 'inset(0 0% 0 0)' });
          card.classList.add('entrance-reveal-complete');
        });
        return;
      }

      cards.forEach((card) => {
        const title = card.querySelector<HTMLElement>('.featured-title-v2');
        const bottom = card.querySelector<HTMLElement>('.featured-card-bottom');
        const right = card.querySelector<HTMLElement>('.featured-card-right');

        gsap.set(card, { opacity: 0, y: 20, filter: 'blur(5px)', willChange: 'opacity, transform, filter' });
        gsap.set(title, { opacity: 0, y: 14, filter: 'blur(4px)', willChange: 'opacity, transform, filter' });
        gsap.set(bottom, { opacity: 0, y: 10, filter: 'blur(3px)', willChange: 'opacity, transform, filter' });
        gsap.set(right, { clipPath: 'inset(0 100% 0 0)', willChange: 'clip-path' });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            once: true,
            invalidateOnRefresh: true,
          },
          onComplete: () => {
            card.classList.add('entrance-reveal-complete');
            gsap.set([card, title, bottom, right].filter(Boolean), { clearProps: 'willChange' });
          },
        });

        tl.to(card, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' }, 0)
          .to(title, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' }, 0.08)
          .to(bottom, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.48, ease: 'power3.out' }, 0.18)
          .to(right, { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power4.out' }, 0.1);
      });
    }, container);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <div ref={containerRef} className="featured-view-container">
      {projectWorkRegistry.map((project) => (
        <FeaturedCard key={project.id} project={project} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

// ─── WorkPage ──────────────────────────────────────────────────────────────────

function WorkPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<WorkView>('list');
  const prefersReducedMotion = useReducedMotionPreference();
  const viewMotion = {
    initial: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 },
    transition: prefersReducedMotion ? instantTransition : { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <div className="work-page-main pt-[calc(var(--header-height)+var(--header-content-gap))]">
      <WorkViewSwitcher view={view} onChange={setView} />

      <div className="work-page-nav-container top-0 bottom-0">
        <div className="overflow-hidden h-full">
          <AnimatePresence mode="wait">
            {view === 'list' && (
              <motion.div
                key="list"
                {...viewMotion}
                style={{ height: '100%' }}
              >
                <ListViewContainer onNavigate={(id) => navigate(`/projects/${id}`)} />
              </motion.div>
            )}

            {view === 'featured' && (
              <motion.div
                key="featured"
                {...viewMotion}
                style={{ height: '100%' }}
              >
                <FeaturedProjectsView onNavigate={(id) => navigate(`/projects/${id}`)} />
              </motion.div>
            )}

            {view === 'grid' && (
              <motion.div
                key="grid"
                {...viewMotion}
                style={{ height: '100%' }}
              >
                <GridProjectsView
                  projects={projectWorkRegistry}
                  onNavigate={(id) => navigate(`/projects/${id}`)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default WorkPage;
