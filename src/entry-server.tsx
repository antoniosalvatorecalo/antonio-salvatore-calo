import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';

import { AppShell } from './AppShell';
import ContactPage from './pages/contact/ContactPage';
import { AppRoutes } from './providers/AppRouter';
import type { SiteSnapshot } from './cms/snapshot';

export function render(url: string, snapshot: SiteSnapshot): string {
  return renderToString(
    <AppShell>
      <StaticRouter location={url}>
        <AppRoutes initialSnapshot={snapshot} contactElement={<ContactPage />} />
      </StaticRouter>
    </AppShell>,
  );
}
