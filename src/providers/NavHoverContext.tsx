import { createContext, useContext, useState, type ReactNode } from 'react';

interface NavHoverContextValue {
  navHoveredProject: string | null;
  setNavHoveredProject: (project: string | null) => void;
  navProjectImages: string[];
  setNavProjectImages: (images: string[]) => void;
}

const NavHoverContext = createContext<NavHoverContextValue | null>(null);

export function NavHoverProvider({ children }: { children: ReactNode }) {
  const [navHoveredProject, setNavHoveredProject] = useState<string | null>(null);
  const [navProjectImages, setNavProjectImages] = useState<string[]>([]);

  return (
    <NavHoverContext.Provider value={{ navHoveredProject, setNavHoveredProject, navProjectImages, setNavProjectImages }}>
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
