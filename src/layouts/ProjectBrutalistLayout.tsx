import { useCallback, useEffect, useRef, useState, createContext, type ReactNode, type RefObject, Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useScroll } from "../providers/ScrollProvider";
import { useSwipeNavigation } from "../hooks/navigation/useSwipeNavigation";
import { motion } from "motion/react";
import { gsap, ScrollTrigger } from "../lib/gsap-setup";
import Lenis from "lenis";
import { initLenis, destroyLenis } from "../lib/lenis-manager";
import { EASE_PREMIUM } from "@/motion/constants";
import { ScrollingProjectText } from "../components/ui/ScrollingProjectText";
import { ProjectCreditsSection } from "../components/ui/ProjectCreditsSection";
import { ProjectSection } from "../components/ui/ProjectSection";
import { getProjectImageDimensions } from "../content/projectImageMetadata";
import { useReducedMotionPreference } from "../providers/MotionPreferenceProvider";
import { useLanguage } from '../providers/LanguageProvider';
import { instantTransition } from "../lib/reduced-motion";
import './ProjectBrutalistLayout.css';

// ─── Skip-to-Content Link (WCAG 2.4.1) ────────────────────────────────────────
const SkipToContent = ({ targetId }: { targetId: string }) => {
  const { t } = useLanguage();
  return (
  <a
    href={`#${targetId}`}
    className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-1/2 focus:-translate-x-1/2 focus:z-skip-link focus:bg-black focus:text-white focus:px-5 focus:py-3 focus:rounded-[4px] focus:[font-size:var(--text-sm)] focus:font-[500] focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
  >
    {t('skip.content')}
  </a>
  );
};

export interface ScrollerContextType {
  ref: React.RefObject<HTMLDivElement | null>;
  lenis: Lenis | null;
}
export const ScrollerContext = createContext<ScrollerContextType | null>(null);

// ─── Shared UI Elements ──────────────────────────────────────────────────────

export const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="project-type-section-title mb-4">
    {children}
  </p>
);

export const HeroText = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h1
    className={`font-[600] leading-[0.88] [font-size:var(--text-display-xl)] text-(--text-primary) ${className}`}
  >
    {children}
  </h1>
);

export const IntroHeadline = ({ children }: { children: ReactNode }) => (
  <h2
    data-split
    className="[font-size:var(--text-h2)] tracking-[-0.025em] font-[500] leading-[1.1] text-(--text-primary)"
  >
    {children}
  </h2>
);

export const BodyTextSmall = ({ children }: { children: ReactNode }) => (
  <p className="project-type-body--mobile w-full">
    {children}
  </p>
);

export const BodyText = ({ children }: { children: ReactNode }) => (
  <p className="[font-size:var(--text-h4)] leading-[1.6] text-(--text-secondary) font-[400] max-w-[720px]">
    {children}
  </p>
);

export const SectionDivider = () => (
  <div className="w-full h-px bg-[var(--border-default)] my-16 md:my-24" />
);

interface MediaBlockProps {
  aspect?: string;
  className?: string;
  src?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

export const MediaBlock = ({
  aspect = 'aspect-[5/4]',
  className = '',
  src,
  priority = false,
  width,
  height,
}: MediaBlockProps) => {
  const { t } = useLanguage();
  const imageDimensions = getProjectImageDimensions(src);
  const imageWidth = width ?? imageDimensions?.width;
  const imageHeight = height ?? imageDimensions?.height;
  const imageLoading: 'eager' | 'lazy' = priority ? 'eager' : 'lazy';

  return (
    <div className={`w-full max-w-[min(calc(100%-2rem),80rem)] mx-auto ${aspect} overflow-hidden rounded-[4px] bg-[var(--bg-tertiary)] ${className} relative transition-colors duration-300`}>
      {src && (
        <img
          src={src}
          alt={t('media.alt')}
          width={imageWidth}
          height={imageHeight}
          loading={imageLoading}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          className="w-full h-full object-cover"
        />
      )}
      {!src && <div className="media-placeholder absolute inset-0"></div>}
    </div>
  );
};

// ─── Modular Layout Blocks ───────────────────────────────────────────────────

export const LayoutFullMedia = ({ aspect = "aspect-[16/9]", src }: { aspect?: string, src?: string }) => (
  <div className="w-full my-4 md:my-6">
    <MediaBlock aspect={aspect} src={src} className="w-full" />
  </div>
);

export const LayoutCenteredOutro = ({ text, mediaAspect = "aspect-[16/9]", src }: { text: React.ReactNode, mediaAspect?: string, src?: string }) => (
  <div className="w-full pt-12 pb-6 md:pt-20 md:pb-8 flex flex-col gap-6 md:gap-8">
    <h3 data-section-reveal="title" className="[font-size:var(--text-h2)] tracking-[-0.025em] font-[500] leading-[1.2] text-(--text-primary) max-w-[640px]">
      {text}
    </h3>
    <MediaBlock aspect={mediaAspect} src={src} className="w-full" />
  </div>
);

export const LayoutIntroTextSplit = ({
  headline,
  col1,
  col2
}: {
  headline: ReactNode,
  col1: ReactNode,
  col2: ReactNode
}) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 pt-10 pb-8 md:pt-16 md:pb-12">
    <div className="md:col-span-6 lg:col-span-5 pr-0 md:pr-8">
      <IntroHeadline>{headline}</IntroHeadline>
    </div>
    <div className="md:col-span-6 lg:col-span-7 flex flex-col sm:flex-row gap-6 md:gap-10 mt-6 md:mt-1">
      <div className="flex-1" data-fade>
        <BodyTextSmall>{col1}</BodyTextSmall>
      </div>
      <div className="flex-1" data-fade>
        <BodyTextSmall>{col2}</BodyTextSmall>
      </div>
    </div>
  </div>
);

export const LayoutSplitTextMediaStack = ({
  title,
  col1,
  col2,
  mediaAspects = ["aspect-[3/2]", "aspect-[3/2]"],
  mediaSrcs = [],
  priorityFirstMedia = false,
  paddingTop,
  paddingBottom
}: {
  title?: React.ReactNode,
  col1?: React.ReactNode,
  col2?: React.ReactNode,
  mediaAspects?: string[],
  mediaSrcs?: string[],
  priorityFirstMedia?: boolean,
  paddingTop?: number,
  paddingBottom?: number
}) => {
  const customPadding = {
    paddingTop: paddingTop !== undefined ? `${paddingTop}px` : undefined,
    paddingBottom: paddingBottom !== undefined ? `${paddingBottom}px` : undefined,
  };

  // If no text content, show just the image
  if (!col1 && !col2) {
    return (
    <div
      data-project-stack
      className="layout-split-stack flex flex-col gap-6 md:gap-8 py-8 md:py-12 px-0"
      style={customPadding}
    >
        {/* Single Media Only */}
        <div data-media-col>
          <MediaBlock aspect={mediaAspects[0]} src={mediaSrcs[0]} priority={priorityFirstMedia} className="w-full media-stack-item-0" />
        </div>
      </div>
    );
  }

  // If only one column has content, show text first then image
  if ((col1 && !col2) || (!col1 && col2)) {
    const content = col1 || col2;
    return (
      <div
        data-project-stack
        className="layout-split-stack flex flex-col gap-6 md:gap-8 py-8 md:py-12 px-3 md:px-6"
        style={customPadding}
      >
        {/* Single Text Block - First */}
        <div className="flex flex-col gap-4 md:gap-4 order-first">
          <div data-section-reveal="title">{title}</div>
          <div data-section-reveal="paragraph"><BodyTextSmall>{content}</BodyTextSmall></div>
        </div>

        {/* Single Media - Last */}
        <div data-media-col className="order-last">
          <MediaBlock aspect={mediaAspects[0]} src={mediaSrcs[0]} priority={priorityFirstMedia} className="w-full media-stack-item-0" />
        </div>
      </div>
    );
  }

  // Original two-column layout for when both col1 and col2 exist
  return (
      <div
        data-project-stack
        className="layout-split-stack flex flex-col gap-6 md:gap-8 py-8 md:py-12 px-3 md:px-6"
        style={customPadding}
      >
      {/* Text Section - First */}
      <div className="flex flex-col gap-4 md:gap-4 order-first">
        <div data-section-reveal="title">{title}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {col1 && (
            <div data-section-reveal="paragraph">
              <BodyTextSmall>{col1}</BodyTextSmall>
            </div>
          )}
          {col2 && (
            <div data-section-reveal="paragraph">
              <BodyTextSmall>{col2}</BodyTextSmall>
            </div>
          )}
        </div>
      </div>

      {/* Media Section - Last */}
      <div className="flex flex-col gap-6 md:gap-10" data-media-col order-last>
        {mediaSrcs.length > 0 ? (
          mediaAspects.map((aspect, i) =>
            mediaSrcs[i] ? (
              <Fragment key={i}>
                <MediaBlock aspect={aspect} src={mediaSrcs[i]} priority={priorityFirstMedia && i === 0} className={`w-full media-stack-item-${i}`} />
              </Fragment>
            ) : null
          )
        ) : (
          <MediaBlock aspect={mediaAspects[0]} className="w-full media-stack-item-0" />
        )}
      </div>
    </div>
  );
};

// ─── Main Layout ─────────────────────────────────────────────────────────────

interface ProjectBrutalistLayoutProps {
  projectName?: string;
  metadata: {
    year: string;
    industry: string;
    location: string;
    deliverables: string[];
    recognition?: string[];
    credits?: { label: string; values: string[] }[];
    links?: { label: string; href: string }[];
  };
  liveUrl?: string;
  heroContent: ReactNode;
  children: ReactNode;
  ctaText?: string;
  leftColumnSections?: { title: string; paragraph: string; cta?: { label: string; href: string }; customContent?: React.ReactNode; imageUrl?: string }[];
  leftColumnImageRefs?: RefObject<HTMLElement | null>[];
  initialTab?: 'project' | 'credits';
}

const ProjectBrutalistLayout: React.FC<ProjectBrutalistLayoutProps> = ({
  projectName: _projectName,
  metadata,
  heroContent,
  children,
  leftColumnSections,
  leftColumnImageRefs,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
const { isDesktop, isTablet: _isTablet, activeTab, setActiveTab } = useScroll();
  const prefersReducedMotion = useReducedMotionPreference();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const isMountedRef = useRef(true);
  const routeTab: 'project' | 'credits' = location.pathname.endsWith('/credits') ? 'credits' : 'project';
  const projectBasePath = location.pathname.replace(/\/credits$/, '');
  const handleSidebarWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!isDesktop || !lenisInstance) return;
    event.preventDefault();
    lenisInstance.scrollTo(lenisInstance.targetScroll + event.deltaY, { programmatic: false });
  };

// Route is the source of truth on mount and browser back/forward.
useEffect(() => {
  setActiveTab(routeTab);
}, [routeTab, setActiveTab]);

const selectProjectTab = useCallback((tab: 'project' | 'credits') => {
setActiveTab(tab);
const targetPath = tab === 'credits' ? `${projectBasePath}/credits` : projectBasePath;
if (location.pathname !== targetPath) {
navigate(targetPath);
}
}, [location.pathname, navigate, projectBasePath, setActiveTab]);

// Refresh ScrollTrigger when returning to project tab so mobile sections re-calculate
useEffect(() => {
  if (!isDesktop && activeTab === 'project') {
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }
}, [activeTab, isDesktop]);

useSwipeNavigation(containerRef, {
enabled: !isDesktop,
threshold: 72,
onSwipeLeft: () => {
if (activeTab === 'project') selectProjectTab('credits');
},
onSwipeRight: () => {
if (activeTab === 'credits') selectProjectTab('project');
else if (activeTab === 'project') navigate('/');
},
});

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    isMountedRef.current = true;
    container.scrollTop = 0;

    // ── Lenis via centralized manager (handles ticker + singleton + scroll→ST binding) ──
    // Only initialized on desktop — mobile uses native scroll on a separate element.
    if (isDesktop) {
      const content = container.querySelector('.scroll-content-inner') as HTMLElement;
      if (content) {
        try {
          const lenis = initLenis(container, content);
          if (isMountedRef.current) {
            setLenisInstance(lenis);
          }
        } catch (e) {
          console.error('[ProjectBrutalistLayout] Lenis init failed:', e);
        }
      }
    }

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        container.querySelectorAll<HTMLElement>('[data-split], [data-fade], [data-cta], .media-stack-item-0, .media-stack-item-1, [data-section-reveal="paragraph"]').forEach((el) => {
          gsap.set(el, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            clearProps: 'willChange',
          });
          el.classList.add('reveal-complete');
        });
        return;
      }

    // ── GSAP context — text splitting + scoped ScrollTrigger animations ──

      // ── [data-split] Word-split + blur reveal ──
      container.querySelectorAll('[data-split]').forEach((el) => {
        // Guard — prevent re-splitting on resize re-init if element persisted
        if (el.querySelector('.split-word')) return;

        const text = el.textContent || '';
        const words = text.trim().split(/\s+/);

        const fragment = document.createDocumentFragment();
        words.forEach((w) => {
          const outerSpan = document.createElement('span');
          outerSpan.className = 'inline-block overflow-hidden';
          const innerSpan = document.createElement('span');
          innerSpan.className = 'split-word inline-block';
          innerSpan.textContent = w;
          outerSpan.appendChild(innerSpan);
          fragment.appendChild(outerSpan);
        });

        el.textContent = '';
        el.appendChild(fragment);

        const splitWords = el.querySelectorAll('.split-word');
        gsap.set(splitWords, { opacity: 0, filter: 'blur(10px)', y: 40 });
        gsap.to(splitWords, {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          stagger: 0.03,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            scroller: container,
            start: 'top 70%',
            once: true,
            invalidateOnRefresh: true,
          },
        });
      });

      // ── [data-section-reveal="title"] Title fade-up reveal ──
      container.querySelectorAll<HTMLElement>('[data-section-reveal="title"]:not(.reveal-complete)').forEach((el) => {
        gsap.set(el, { opacity: 0, y: 24, filter: 'blur(6px)' });
        gsap.to(el, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            scroller: container,
            start: 'top 80%',
            once: true,
            invalidateOnRefresh: true,
          },
        });
        el.classList.add('reveal-complete');
      });

      // ── [data-fade] Simple blur reveal (via from()) ──
      container.querySelectorAll('[data-fade]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          filter: 'blur(10px)',
          y: 15,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            scroller: container,
            start: 'top 85%',
            once: true,
            invalidateOnRefresh: true,
          },
        });
      });

      // ── [data-section-reveal="paragraph"] Paragraph blur stagger reveal ──
      container.querySelectorAll<HTMLElement>('[data-section-reveal="paragraph"]:not(.reveal-complete)').forEach((el) => {
        gsap.set(el, { opacity: 0, filter: 'blur(10px)', y: 15 });
        gsap.to(el, {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 1.2,
          ease: 'power2.out',
          stagger: 0.04,
          delay: 0.4,
          scrollTrigger: {
            trigger: el,
            scroller: container,
            start: 'top 70%',
            once: true,
            invalidateOnRefresh: true,
          },
          onComplete: () => el.classList.add('reveal-complete'),
        });
      });

      // ── [data-cta] CTA fade-up with delay (via from()) ──
      container.querySelectorAll('[data-cta]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          delay: 0.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            scroller: container,
            start: 'top 85%',
            once: true,
            invalidateOnRefresh: true,
          },
        });
      });

      // ── .media-stack-item Media image reveals (via from()) ──
      container.querySelectorAll('.layout-split-stack').forEach((stack) => {
        const elements = stack.querySelectorAll('.media-stack-item-0, .media-stack-item-1');
        if (!elements.length) return;

        gsap.set(elements, { willChange: 'opacity, transform' });
        gsap.from(elements, {
          opacity: 0,
          y: 24,
          scale: 0.985,
          duration: 0.72,
          ease: 'power3.out',
          stagger: 0.08,
          clearProps: 'transform,willChange',
          scrollTrigger: {
            trigger: stack,
            scroller: container,
            start: 'top 88%',
            once: true,
            invalidateOnRefresh: true,
          },
        });
      });
    }, container);

    // Refresh ScrollTrigger so it recalculates positions with Lenis' scroll dimensions
    ScrollTrigger.refresh();

    return () => {
      isMountedRef.current = false;
      ctx.revert();

      if (isDesktop && container) {
        destroyLenis(container);
        // Scoped cleanup — safety net after ctx.revert()
        ScrollTrigger.getAll().forEach(st => {
          if (st.vars.scroller === container) st.kill();
        });
        ScrollTrigger.refresh();
      }

      setLenisInstance(null);
    };
  }, [isDesktop, prefersReducedMotion]);

  return (
    <ScrollerContext.Provider value={{ 
      ref: isDesktop ? scrollRef : mobileScrollRef, 
      lenis: isDesktop ? lenisInstance : null 
    }}>

      <motion.div
        ref={containerRef}
        className="fixed inset-0 z-project-shell bg-[var(--bg-primary)] flex flex-col text-[var(--text-primary)] font-sans transition-colors duration-300"
        data-scroll-root
        animate={{ y: 0 }}
        transition={prefersReducedMotion ? instantTransition : { duration: 0.8, ease: EASE_PREMIUM }}
      >
{/* Skip to Content Link (WCAG 2.4.1) */}
<SkipToContent targetId="page-content" />

{/* 2-Column Layout - full width, no padding on container */}
      <div className="flex-1 w-full h-full flex flex-col lg:flex-row lg:px-4 lg:gap-4">
      {/* Left Column - Credits/Metadata */}
      <div
        onWheel={handleSidebarWheel}
        className={`h-full ${!isDesktop && activeTab !== 'credits' ? 'hidden' : 'flex'} flex-col relative overflow-hidden w-full lg:w-[calc(20%_-_0.5rem)] min-w-0 min-h-0 project-left-col`}
      >
          <div className="grid w-full h-full gap-2" style={{ gridTemplateRows: isDesktop || activeTab === 'credits' ? 'auto 1fr' : 'auto' }}>
            {/* Hero Text */}
            <div id="page-content" className="pt-4 pb-4 px-4 lg:px-0">
              <div className="pb-0 lg:pb-16 lg:min-h-[calc(3.2*var(--text-display-xl))]">
                {heroContent}
              </div>
            </div>

            {/* Project Description / Dynamic Sections */}
            {(isDesktop || activeTab === 'credits') && (
            <div className="px-3 lg:px-0 overflow-y-auto hide-scrollbar lg:flex lg:items-center">
{!isDesktop && activeTab === 'credits' ? (
// Mobile Credits View
<div className="pt-4">
               <ProjectCreditsSection credits={metadata.credits || []} />
</div>
) : isDesktop && leftColumnSections && leftColumnImageRefs && leftColumnImageRefs.length > 0 ? (
                <ScrollingProjectText
                  sections={leftColumnSections}
                  imageRefs={leftColumnImageRefs}
                />
              ) : isDesktop ? (
                <div className="flex flex-col gap-8">
                  {/* Fallback static metadata display when no scrolling sections */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                    <div className="flex flex-col gap-2">
                      <span className="project-type-section-title">{t('meta.year')}</span>
                      <span className="project-type-metadata-value">{metadata.year}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="project-type-section-title">{t('meta.industry')}</span>
                      <span className="project-type-metadata-value">{metadata.industry}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="project-type-section-title">{t('meta.location')}</span>
                      <span className="project-type-metadata-value">{metadata.location}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="project-type-section-title">{t('meta.deliverables')}</span>
                      <div className="flex flex-col gap-1">
                        {metadata.deliverables.map((d, i) => (
                          <span key={i} className="project-type-metadata-value project-type-metadata-list-value">{d}</span>
                        ))}
                      </div>
                    </div>
                    {metadata.recognition && (
                      <div className="flex flex-col gap-2">
                        <span className="project-type-section-title">{t('meta.recognition')}</span>
                        <div className="flex flex-col gap-1">
                          {metadata.recognition.map((r, i) => (
                            <span key={i} className="project-type-metadata-value project-type-metadata-list-value">{r}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            )}

          </div>
        </div>

{/* Right Column - Content */}
      <div className={`h-full ${!isDesktop && activeTab !== 'project' ? 'hidden' : 'block'} relative overflow-hidden w-full lg:w-[calc(80%_-_0.5rem)] min-w-0 project-right-col`}>
{!isDesktop ? (
// Mobile vertical scroll layout
<div ref={mobileScrollRef} className="overflow-y-auto overflow-x-hidden hide-scrollbar absolute inset-0 pt-0" data-scroll-content>
<div className="scroll-content-inner flex flex-col pb-20 w-full scroll-content" style={{ minHeight: 'min-content', paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
          {heroContent && (
            <div className="px-3 pt-3 pb-3">
              {heroContent}
            </div>
          )}
          {/* Mobile Sections - vertical image → title → description blocks */}
          {leftColumnSections?.filter((section) => !section.customContent).map((section, i) => (
            <ProjectSection
              key={i}
              title={section.title}
              paragraph={section.paragraph}
              cta={section.cta}
              imageUrl={section.imageUrl}
              priority={activeTab === 'project' && i === 0}
              scrollerRef={mobileScrollRef}
              className=""
            />
          ))}

           {/* Credits at end of project column on mobile */}
            {activeTab === 'project' && (
              <div className="project-mobile-credits px-4 pt-6 pb-6">
                <ProjectCreditsSection credits={metadata.credits || []} scrollerRef={mobileScrollRef} />
              </div>
            )}

          {/* Desktop children (LayoutSplitTextMediaStack with images) - NOT rendered on mobile/tablet
              Images are already shown via leftColumnSections → ProjectSection on mobile/tablet */}
              </div>
            </div>
          ) : (
            // Desktop horizontal layout
            <div ref={scrollRef} className="overflow-y-auto overflow-x-hidden hide-scrollbar absolute inset-0 pt-0" data-scroll-content>
              <div className="scroll-content-inner flex flex-col pb-20 md:pb-0 w-full scroll-content lg:px-0" style={{ minHeight: 'min-content' }}>
                {/* Page Content Stream */}
                <div className="w-full flex flex-col">
                  {children}
                </div>
              </div>
            </div>
          )}
        </div>
        </div>


      </motion.div>
    </ScrollerContext.Provider>
  );
};

export default ProjectBrutalistLayout;


