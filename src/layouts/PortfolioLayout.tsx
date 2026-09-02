import { useEffect, type FC } from 'react';
import { useScroll } from '../providers/ScrollProvider';
import { useSmoothScroll } from '../hooks/animation/useSmoothScroll';
import { ScrollTrigger } from '../lib/gsap-setup';
import { refreshAllLenises } from '../lib/lenis-manager';
import { projectsRegistry } from '../content/projects';
import { AnimationProvider } from '../animations/AnimationProvider';
import { Footer } from '../components/ui/Footer';
import { ArtworkCarousel, projectsToCarouselProjects } from '../components/ui/ArtworkCarousel';
import '@/layouts/PortfolioLayout.css';

interface PortfolioContentProps {
  deferInitialEffects: boolean;
  rightScrollRef: React.RefObject<HTMLDivElement | null>;
}

const PortfolioContent: FC<PortfolioContentProps> = ({
  deferInitialEffects,
  rightScrollRef,
}) => {
  const effectsEnabled = !deferInitialEffects;

  const bugoniaProject = projectsRegistry.find((project) => project.id === 'bugonia') ?? projectsRegistry[0];
  const newsquestProject = projectsRegistry.find((project) => project.id === 'newsquest') ?? projectsRegistry[1];

  return (
    <AnimationProvider enabled={effectsEnabled}>
      <div className="portfolio-layout h-screen flex flex-col bg-[var(--bg-primary)] font-sans transition-colors duration-300" data-scroll-root>

        <div className="flex-1 min-h-0 overflow-hidden">
          <div
            ref={rightScrollRef as React.RefObject<HTMLDivElement>}
            className="overflow-y-auto overflow-x-hidden hide-scrollbar h-full w-full right-scroll-container"
            data-scroll-content
          >
            <div className="artwork-carousel-fullpage">
              <ArtworkCarousel
                projects={projectsToCarouselProjects([bugoniaProject, newsquestProject])}
                scrollerRef={rightScrollRef}
              />
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </AnimationProvider>
  );
};

export const PortfolioLayout = ({
  deferInitialEffects = false,
}: {
  deferInitialEffects?: boolean;
}) => {
  const { rightScrollRef } = useScroll();
  const effectsEnabled = !deferInitialEffects;
  useSmoothScroll(rightScrollRef, { enabled: effectsEnabled });

  useEffect(() => {
    if (!effectsEnabled) return;
    // Immediate refresh
    requestAnimationFrame(() => {
      refreshAllLenises();
      ScrollTrigger.refresh();
    });
    // Delayed refresh to catch footer font/layout shift
    const timer = setTimeout(() => {
      refreshAllLenises();
      ScrollTrigger.refresh();
    }, 250);
    return () => clearTimeout(timer);
  }, [effectsEnabled]);

  return (
    <PortfolioContent
      deferInitialEffects={deferInitialEffects}
      rightScrollRef={rightScrollRef}
    />
  );
};