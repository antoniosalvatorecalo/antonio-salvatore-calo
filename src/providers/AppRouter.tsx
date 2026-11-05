import { Suspense, type ReactNode } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { PortfolioLayout } from '../layouts/PortfolioLayout';
import { LanguageProvider } from './LanguageProvider';
import { ProjectTransitionProvider } from './ProjectTransitionProvider';
import { FilterProvider } from './FilterContext';
import {
  ProjectCatalogGate,
  ProjectCatalogProvider,
  useProjectCatalog,
} from '@/cms/ProjectCatalogProvider';
import { SeoManager } from '@/cms/SeoManager';
import type { SiteSnapshot } from '@/cms/snapshot';
import { stripLocale } from '@/i18n/localePath';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';

const FALLBACK = <div style={{ padding: 40, color: 'var(--text-primary)' }}>Loading…</div>;

const PortfolioRouteLayout = () => {
  const { pathname } = useLocation();
  const { projects } = useProjectCatalog();
  const slug = stripLocale(pathname).match(/^\/projects\/([^/]+)\/?$/)?.[1];
  if (slug && !projects.some((project) => project.slug === decodeURIComponent(slug)))
    return <NotFoundPage />;
  return (
    <FilterProvider>
      <ProjectTransitionProvider>
        <PortfolioLayout />
      </ProjectTransitionProvider>
    </FilterProvider>
  );
};

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
          {/* `it?` keeps one route per page for both languages, so the layout stays mounted on switch. */}
          <Routes>
            <Route path="/it?" element={<PortfolioRouteLayout />}>
              <Route index element={null} />
              <Route path="projects/:slug" element={null} />
            </Route>
            <Route
              path="/it?/contact"
              element={<Suspense fallback={FALLBACK}>{contactElement}</Suspense>}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ProjectCatalogGate>
      </ProjectCatalogProvider>
    </LanguageProvider>
  );
}
