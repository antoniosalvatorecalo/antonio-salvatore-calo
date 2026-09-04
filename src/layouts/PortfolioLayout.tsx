import { useEffect } from 'react';
import { ProjectIndex } from '../components/home/ProjectIndex';
import { SiteHeader } from '../components/ui/SiteHeader';
import { gsap } from '../lib/gsap-setup';
import { FilterProvider } from '../providers/FilterContext';
import { NavHoverProvider } from '../providers/NavHoverContext';

interface PortfolioLayoutProps {
  deferInitialEffects?: boolean;
}

export const PortfolioLayout = ({
  deferInitialEffects = false,
}: PortfolioLayoutProps) => {
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
      <NavHoverProvider>
        <SiteHeader />
        <main
          className="portfolio-layout min-h-screen w-full bg-[var(--bg-primary)] font-sans transition-colors duration-300"
          data-scroll-root
        >
          <ProjectIndex />
        </main>
      </NavHoverProvider>
    </FilterProvider>
  );
};

export default PortfolioLayout;