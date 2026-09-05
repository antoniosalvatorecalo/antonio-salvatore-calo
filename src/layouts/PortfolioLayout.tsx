import { useEffect } from 'react';
import { SiteHeader } from '../components/ui/SiteHeader';
import { PortfolioScene } from '../components/home/PortfolioScene';
import { getProjectViewData } from '../components/projects/projectViewData';
import { gsap } from '../lib/gsap-setup';
import { FilterProvider } from '../providers/FilterContext';
import { useProjectTransition } from '../providers/ProjectTransitionProvider';

interface PortfolioLayoutProps {
  deferInitialEffects?: boolean;
}

export const PortfolioLayout = ({
  deferInitialEffects = false,
}: PortfolioLayoutProps) => {
  const { phase, visibleSlug, returnToGallery } = useProjectTransition();
  const visibleProject = visibleSlug ? getProjectViewData(visibleSlug) : null;
  useEffect(() => {
    if (deferInitialEffects) return;
    const raf = requestAnimationFrame(() => {
      try {
        gsap.ticker.lagSmoothing(500, 33);
      } catch {}
    });
    return () => cancelAnimationFrame(raf);
  }, [deferInitialEffects]);

  return (
    <FilterProvider>
      <SiteHeader
        transitionPhase={phase}
        projectActive={Boolean(visibleProject) && phase !== 'opening'}
        projectInfo={visibleProject ? {
          name: visibleProject.title,
          description: visibleProject.description,
          links: visibleProject.links,
          details: visibleProject.details,
        } : undefined}
        onBackToGallery={visibleProject && phase !== 'opening' ? returnToGallery : undefined}
      />
      <PortfolioScene />
    </FilterProvider>
  );
};

export default PortfolioLayout;
