import { useEffect } from 'react';
import { SiteHeader } from '../components/ui/SiteHeader';
import { PortfolioScene } from '../components/home/PortfolioScene';
import { gsap } from '../lib/gsap-setup';
import { useProjectTransition } from '../providers/ProjectTransitionProvider';
import { useProjectCatalog } from '@/cms/ProjectCatalogProvider';

interface PortfolioLayoutProps {
  deferInitialEffects?: boolean;
}

export const PortfolioLayout = ({ deferInitialEffects = false }: PortfolioLayoutProps) => {
  const { phase, visibleSlug, returnToGallery, homeRevealReady } = useProjectTransition();
  const { getProject } = useProjectCatalog();
  const visibleProject = visibleSlug ? getProject(visibleSlug) : null;
  const projectHeaderVisible =
    Boolean(visibleProject) && phase !== 'opening' && !(phase === 'closing' && homeRevealReady);
  useEffect(() => {
    if (deferInitialEffects) return;
    const raf = requestAnimationFrame(() => {
      gsap.ticker.lagSmoothing(500, 33);
    });
    return () => cancelAnimationFrame(raf);
  }, [deferInitialEffects]);

  return (
    <>
      <SiteHeader
        transitionPhase={phase}
        projectActive={Boolean(visibleProject) && !(phase === 'closing' && homeRevealReady)}
        projectHeaderVisible={projectHeaderVisible}
        projectInfo={
          visibleProject
            ? {
                name: visibleProject.title,
                details: visibleProject.details ?? [],
              }
            : undefined
        }
        onBackToGallery={visibleProject ? returnToGallery : undefined}
      />
      <PortfolioScene />
    </>
  );
};
