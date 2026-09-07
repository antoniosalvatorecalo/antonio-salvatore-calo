import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { router } from './providers/AppRouter';
import { MotionPreferenceProvider } from './providers/MotionPreferenceProvider';
import { initGSAP } from './lib/gsap-setup';
import './index.css';

initGSAP();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionPreferenceProvider>
      {router}
    </MotionPreferenceProvider>
  </StrictMode>
);
