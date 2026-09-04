import { lazy, Suspense } from 'react';

const PortfolioLayout = lazy(() =>
  import('./layouts/PortfolioLayout').then(m => ({ default: m.PortfolioLayout }))
);

export default function App() {
  return (
    <Suspense fallback={null}>
      <PortfolioLayout />
    </Suspense>
  );
}
