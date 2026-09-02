import { lazy, Suspense } from 'react';
import { SiteHeader } from './components/ui/SiteHeader';

const PortfolioLayout = lazy(() =>
  import('./layouts/PortfolioLayout').then(m => ({ default: m.PortfolioLayout }))
);

export default function App() {
  return (
    <Suspense fallback={null}>
      <SiteHeader />
      <PortfolioLayout />
    </Suspense>
  );
}
