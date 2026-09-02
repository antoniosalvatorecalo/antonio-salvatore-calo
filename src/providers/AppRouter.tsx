import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from '../App';
import { LanguageProvider } from './LanguageProvider';

const BugoniaPage = React.lazy(() => import('../pages/projects/bugonia/ProjectPage'));
const NewsquestPage = React.lazy(() => import('../pages/projects/newsquest/ProjectPage'));
const ContactPage = React.lazy(() => import('../pages/contact/ContactPage'));
const AboutPage = React.lazy(() => import('../pages/about/AboutPage'));

const FALLBACK = <div style={{padding: 40, color: 'var(--text-primary)'}}>Loading…</div>;

const AnimatedRoutes: React.FC = () => {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<Suspense fallback={FALLBACK}><AboutPage /></Suspense>} />
        <Route path="/projects/bugonia" element={<Suspense fallback={FALLBACK}><BugoniaPage /></Suspense>} />
        <Route path="/projects/newsquest" element={<Suspense fallback={FALLBACK}><NewsquestPage /></Suspense>} />
        <Route path="/projects/bugonia/credits" element={<Suspense fallback={FALLBACK}><BugoniaPage /></Suspense>} />
        <Route path="/projects/newsquest/credits" element={<Suspense fallback={FALLBACK}><NewsquestPage /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={FALLBACK}><ContactPage /></Suspense>} />
      </Routes>
    </LanguageProvider>
  );
};

export const router = (
  <BrowserRouter>
    <AnimatedRoutes />
  </BrowserRouter>
);
