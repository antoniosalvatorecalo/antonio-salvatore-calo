import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { AppRoutes } from './providers/AppRouter';
import { Suspense, lazy } from 'react';
import { initGSAP } from './lib/gsap-setup';
import type { SiteSnapshot } from './cms/snapshot';
import './index.css';

initGSAP();

const ContactPage = lazy(() => import('./pages/contact/ContactPage'));
const snapshotElement = document.getElementById('__SITE_SNAPSHOT__');
let initialSnapshot: SiteSnapshot | undefined;
if (snapshotElement?.textContent) {
  try {
    initialSnapshot = JSON.parse(snapshotElement.textContent) as SiteSnapshot;
  } catch (error) {
    console.error('Invalid prerender snapshot.', error);
  }
}

const app = (
  <StrictMode>
    <AppShell>
      <BrowserRouter>
        <AppRoutes
          initialSnapshot={initialSnapshot}
          contactElement={
            <Suspense
              fallback={<div style={{ padding: 40, color: 'var(--text-primary)' }}>Loading…</div>}
            >
              <ContactPage />
            </Suspense>
          }
        />
      </BrowserRouter>
    </AppShell>
  </StrictMode>
);

const root = document.getElementById('root');
if (!root) throw new Error('Application root element is missing.');
if (initialSnapshot) hydrateRoot(root, app);
else createRoot(root).render(app);
