import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface ScrollContextType {
  isDesktop: boolean;
  isTablet: boolean;
  activeTab: 'about' | 'work' | 'credits' | 'project';
  setActiveTab: (tab: 'about' | 'work' | 'credits' | 'project') => void;
  leftScrollRef: React.RefObject<HTMLDivElement | null>;
  rightScrollRef: React.RefObject<HTMLDivElement | null>;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

const DEFAULT_RESPONSIVE_STATE = {
  isDesktop: false,
  isTablet: false,
};

// Three-tier responsive: Desktop >=1024px, Tablet 768-1023px, Mobile <768px
const getResponsiveState = () => {
  if (typeof window === 'undefined') return DEFAULT_RESPONSIVE_STATE;

  const width = window.innerWidth;
  return {
    isDesktop: width >= 1024,
    isTablet: width >= 768 && width < 1024,
  };
};

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'work' | 'credits' | 'project'>('about');
  const [responsiveState, setResponsiveState] = useState(getResponsiveState);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  // FIX 16: Removed global Lenis instance from ScrollProvider.
  // PortfolioLayout manages its own column-level Lenis instances via useSmoothScroll.
  // Having a global Lenis here conflicted with the per-column instances,
  // causing scroll corruption and initialization race conditions on route changes.

  // Three-tier responsive resize handler
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let resizeRaf: number | null = null;

    const handleResize = () => {
      if (resizeRaf !== null) return;

      resizeRaf = window.requestAnimationFrame(() => {
        resizeRaf = null;
        const nextState = getResponsiveState();
        setResponsiveState((currentState) => (
          currentState.isDesktop === nextState.isDesktop && currentState.isTablet === nextState.isTablet
            ? currentState
            : nextState
        ));
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeRaf !== null) {
        window.cancelAnimationFrame(resizeRaf);
      }
    };
  }, []);

  return (
    <ScrollContext.Provider value={{
      isDesktop: responsiveState.isDesktop,
      isTablet: responsiveState.isTablet,
      activeTab,
      setActiveTab,
      leftScrollRef,
      rightScrollRef
    }}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return context;
};
