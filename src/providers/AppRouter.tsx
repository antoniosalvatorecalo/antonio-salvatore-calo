import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PortfolioLayout } from '../layouts/PortfolioLayout';
import { LanguageProvider } from './LanguageProvider';
import { ProjectTransitionProvider } from './ProjectTransitionProvider';
import { NavHoverProvider } from './NavHoverContext';
import { ProjectCatalogGate, ProjectCatalogProvider } from '@/cms/ProjectCatalogProvider';
import { SeoManager } from '@/cms/SeoManager';

const ContactPage = React.lazy(() => import('../pages/contact/ContactPage'));

const FALLBACK = <div style={{padding: 40, color: 'var(--text-primary)'}}>Loading…</div>;

const PortfolioRouteLayout = () => (
  <ProjectTransitionProvider>
    <PortfolioLayout />
  </ProjectTransitionProvider>
);

const AnimatedRoutes: React.FC = () => {
  return (
    <LanguageProvider>
      <ProjectCatalogProvider>
        <ProjectCatalogGate>
          <SeoManager />
          <Routes>
            <Route element={<PortfolioRouteLayout />}>
              <Route index element={null} />
              <Route path="projects/:slug" element={null} />
            </Route>
            <Route path="/contact" element={<Suspense fallback={FALLBACK}><ContactPage /></Suspense>} />
          </Routes>
        </ProjectCatalogGate>
      </ProjectCatalogProvider>
    </LanguageProvider>
  );
};

export const router = (
  <BrowserRouter>
    <NavHoverProvider>
      <AnimatedRoutes />
    </NavHoverProvider>
  </BrowserRouter>
);
