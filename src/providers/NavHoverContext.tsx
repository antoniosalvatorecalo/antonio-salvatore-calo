import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ProjectMedia } from '@/cms/domain';

interface NavHoverContextValue {
  navHoveredProject: string | null;
  setNavHoveredProject: (project: string | null) => void;
  navProjectMedia: ProjectMedia[];
  setNavProjectMedia: (media: ProjectMedia[]) => void;
}

const NavHoverContext = createContext<NavHoverContextValue | null>(null);

export function NavHoverProvider({ children }: { children: ReactNode }) {
  const [navHoveredProject, setNavHoveredProject] = useState<string | null>(null);
  const [navProjectMedia, setNavProjectMedia] = useState<ProjectMedia[]>([]);

  return (
    <NavHoverContext.Provider value={{ navHoveredProject, setNavHoveredProject, navProjectMedia, setNavProjectMedia }}>
      {children}
    </NavHoverContext.Provider>
  );
}

export function useNavHover() {
  const context = useContext(NavHoverContext);
  if (!context) {
    throw new Error('useNavHover must be used within NavHoverProvider');
  }
  return context;
}
