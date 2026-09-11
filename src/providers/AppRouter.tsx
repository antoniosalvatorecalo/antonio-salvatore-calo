import { Suspense, type ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PortfolioLayout } from '../layouts/PortfolioLayout';
import { LanguageProvider } from './LanguageProvider';
import { ProjectTransitionProvider } from './ProjectTransitionProvider';
import { ProjectCatalogGate, ProjectCatalogProvider } from '@/cms/ProjectCatalogProvider';
import { SeoManager } from '@/cms/SeoManager';
import type { SiteSnapshot } from '@/cms/snapshot';

const FALLBACK = <div style={{ padding: 40, color: 'var(--text-primary)' }}>Loading…</div>;

const PortfolioRouteLayout = () => (
  <ProjectTransitionProvider>
    <PortfolioLayout />
  </ProjectTransitionProvider>
);

export interface AppRoutesProps {
  initialSnapshot?: SiteSnapshot;
  contactElement: ReactNode;
}

export function AppRoutes({ initialSnapshot, contactElement }: AppRoutesProps) {
  return (
    <LanguageProvider>
      <ProjectCatalogProvider initialSnapshot={initialSnapshot}>
        <ProjectCatalogGate>
          <SeoManager />
          <Routes>
            <Route element={<PortfolioRouteLayout />}>
              <Route index element={null} />
              <Route path="projects/:slug" element={null} />
            </Route>
            <Route
              path="/contact"
              element={<Suspense fallback={FALLBACK}>{contactElement}</Suspense>}
            />
          </Routes>
        </ProjectCatalogGate>
      </ProjectCatalogProvider>
    </LanguageProvider>
  );
}
