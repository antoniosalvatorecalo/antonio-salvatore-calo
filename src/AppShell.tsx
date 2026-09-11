import type { ReactNode } from 'react';
import { MotionPreferenceProvider } from './providers/MotionPreferenceProvider';
import { NavHoverProvider } from './providers/NavHoverContext';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <MotionPreferenceProvider>
      <NavHoverProvider>{children}</NavHoverProvider>
    </MotionPreferenceProvider>
  );
}
