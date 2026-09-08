import { useEffect } from 'react';
import { SiteHeader } from '../components/ui/SiteHeader';
import { PortfolioScene } from '../components/home/PortfolioScene';
import { gsap } from '../lib/gsap-setup';
import { FilterProvider } from '../providers/FilterContext';
import { useProjectTransition } from '../providers/ProjectTransitionProvider';
import { useProjectCatalog } from '@/cms/ProjectCatalogProvider';

interface PortfolioLayoutProps {
  deferInitialEffects?: boolean;
}

export const PortfolioLayout = ({
  deferInitialEffects = false,
}: PortfolioLayoutProps) => {
  const { phase, visibleSlug, returnToGallery } = useProjectTransition();
  const { getProject } = useProjectCatalog();
  const visibleProject = visibleSlug ? getProject(visibleSlug) : null;
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
          details: visibleProject.details ?? [],
        } : undefined}
        onBackToGallery={visibleProject && phase !== 'opening' ? returnToGallery : undefined}
      />
      <PortfolioScene />
    </FilterProvider>
  );
};

export default PortfolioLayout;
