import React, { useRef, useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useScroll } from '../../providers/ScrollProvider';
import { ScrollerContext } from '../../layouts/ProjectBrutalistLayout';
import { useTheme } from '@/hooks/theme/useTheme';
import { ThemeIconButton } from './ThemeToggle';
import { LetterSwapForward } from './letter-swap';
import { useReducedMotionPreference } from '../../providers/MotionPreferenceProvider';
import { instantTransition } from '../../lib/reduced-motion';
import { useLanguage } from '../../providers/LanguageProvider';
import './CentralNavMenu.css';

type NavItem = 'Work' | 'About' | 'Contact' | null;

export interface ProjectNavLink {
  label: string;
  href: string;
}

const NavTab = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotionPreference();

  const updatePos = (cx: number, cy: number) => {
    if (prefersReducedMotion || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    setPos({ x: (cx - (left + width / 2)) * 0.2, y: (cy - (top + height / 2)) * 0.2 });
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={e => updatePos(e.clientX, e.clientY)}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      onTouchMove={e => { const t = e.touches[0]; if (t) updatePos(t.clientX, t.clientY); }}
      onTouchEnd={() => setPos({ x: 0, y: 0 })}
      animate={prefersReducedMotion ? { x: 0, y: 0 } : { x: pos.x, y: pos.y }}
      transition={prefersReducedMotion ? instantTransition : { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      aria-pressed={isActive}
      className={`central-nav-btn shrink-0 h-full rounded-[4px] px-4 flex items-center justify-center gap-1.5 [font-size:var(--text-sm)] tracking-[0.08em] transition-all duration-200 select-none ${
        isActive
          ? 'font-[500] text-[var(--glass-nav-text)]'
          : 'font-[400] text-[var(--glass-nav-text-inactive)] hover:text-[var(--glass-nav-text)]'
      }`}
    >
      <span className="nav-pill-text-wrap">
        <LetterSwapForward
          label={label}
          staggerDuration={0.018}
          transition={{ type: 'spring', duration: 0.58 }}
        />
      </span>
      <span className="nav-pill-arrow-mask" aria-hidden="true">
        <ArrowUpRight className="nav-pill-arrow-icon" />
      </span>
    </motion.button>
  );
};

const ProjectLinkTab = ({ label, href }: ProjectNavLink) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotionPreference();
  const { t } = useLanguage();
  const linkLabelKey: Record<string, string> = {
    'Process': 'cta.process',
    'Live': 'cta.live',
    'Prototype': 'cta.prototype',
    'Discover the process': 'cta.discover-process',
    'Open Live Website': 'cta.open-live',
    'View Prototype': 'cta.view-prototype',
  };
  const tl = (label: string) => t(linkLabelKey[label] || label);

  const updatePos = (cx: number, cy: number) => {
    if (prefersReducedMotion || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    setPos({ x: (cx - (left + width / 2)) * 0.2, y: (cy - (top + height / 2)) * 0.2 });
  };

  return (
    <motion.button
      ref={ref}
      onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
      onMouseMove={e => updatePos(e.clientX, e.clientY)}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      onTouchMove={e => { const t = e.touches[0]; if (t) updatePos(t.clientX, t.clientY); }}
      onTouchEnd={() => setPos({ x: 0, y: 0 })}
      animate={prefersReducedMotion ? { x: 0, y: 0 } : { x: pos.x, y: pos.y }}
      transition={prefersReducedMotion ? instantTransition : { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className="central-nav-btn flex-1 h-full rounded-[4px] inline-flex items-center justify-center gap-1.5 [font-size:var(--text-sm)] text-[var(--glass-nav-text-inactive)] tracking-[0.08em] font-[400] hover:text-[var(--glass-nav-text)] transition-all duration-200 select-none px-3"
    >
      <span className="nav-pill-text-wrap">
        <LetterSwapForward
          label={tl(label)}
          staggerDuration={0.018}
          transition={{ type: 'spring', duration: 0.58 }}
        />
      </span>
      <span className="nav-pill-arrow-mask" aria-hidden="true">
        <ArrowUpRight className="nav-pill-arrow-icon" />
      </span>
    </motion.button>
  );
};

interface CentralNavMenuProps {
  projectLinks?: ProjectNavLink[];
}

const CentralNavMenu: React.FC<CentralNavMenuProps> = ({ projectLinks }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  const { isDesktop, rightScrollRef } = useScroll();
  const prefersReducedMotion = useReducedMotionPreference();
const topClass = 'bottom-6';

const activeFromRoute = (): NavItem => {
  if (pathname === '/') return null;
  if (pathname.startsWith('/work')) return 'Work';
  if (pathname.startsWith('/about')) return 'About';
  if (pathname.startsWith('/contact')) return 'Contact';
  return 'Work';
};

  const [active, setActive] = useState<NavItem>(activeFromRoute);

  useEffect(() => {
    setActive(activeFromRoute());
  }, [pathname, isDesktop]);

  const handleClick = (item: NavItem) => {
    setActive(item);
    if (item === 'Work') navigate('/work');
    if (item === 'About') navigate('/about');
    if (item === 'Contact') navigate('/contact');
  };

  // Back arrow behavior (Home or Scroll-to-Top)
  const scrollerContext = useContext(ScrollerContext);
  const [arrowScrolled, setArrowScrolled] = useState(false);

  useEffect(() => {
    const container = rightScrollRef.current || scrollerContext?.ref.current;
    if (!container) return;

    const threshold = 60;

    if (scrollerContext?.lenis) {
      const onLenisScroll = ({ scroll }: { scroll: number }) => {
        setArrowScrolled(scroll > threshold);
      };
      scrollerContext.lenis.on('scroll', onLenisScroll);
      setArrowScrolled(scrollerContext.lenis.scroll > threshold);
      return () => scrollerContext.lenis?.off('scroll', onLenisScroll);
    } 
    
    const onNativeScroll = () => {
      setArrowScrolled(container.scrollTop > threshold);
    };
    container.addEventListener('scroll', onNativeScroll);
    onNativeScroll();
    return () => container.removeEventListener('scroll', onNativeScroll);
    
  }, [rightScrollRef, scrollerContext?.lenis, pathname]);

  const handleArrowClick = () => {
    if (!arrowScrolled) {
      navigate('/');
    } else {
      if (scrollerContext?.lenis) {
        scrollerContext.lenis.scrollTo(0);
        // Ensure arrow resets after scroll-to-top
        setArrowScrolled(false);
      } else {
        const container = rightScrollRef.current || scrollerContext?.ref.current;
        if (container) {
          container.scrollTo({ top: 0, behavior: 'smooth' });
          // Reset arrow state after native scroll
          setArrowScrolled(false);
        }
      }
    }
  };

  const isProjectMode = !!projectLinks;
  const items = ['Work', 'About', 'Contact'] as const;

    const navStyle: React.CSSProperties = {
      borderRadius: 'var(--radius-sm)',
      // Let the nav stretch to full available width (minus side padding) for consistency.
      width: isProjectMode ? undefined : undefined,
      maxWidth: 'calc(100vw - 32px)',
    };
    // Position the nav differently on mobile vs desktop.
    const navPositionClass = isDesktop ? 'left-1/2 -translate-x-1/2' : 'left-4';

  return (
    <nav
      className={`fixed ${topClass} ${navPositionClass} h-[34px] glass-nav flex items-center gap-1 p-0.5 z-nav`}
      style={navStyle}
    >
      <AnimatePresence>
        {pathname !== '/' && (
          <motion.button
            key="home"
            initial={prefersReducedMotion ? { opacity: 1, x: 0, width: 'auto', paddingLeft: 12, paddingRight: 12 } : { opacity: 0, x: -6, width: 0, paddingLeft: 0, paddingRight: 0 }}
            animate={{ opacity: 1, x: 0, width: 'auto', paddingLeft: 12, paddingRight: 12 }}
            exit={prefersReducedMotion ? { opacity: 1, x: 0, width: 'auto', paddingLeft: 12, paddingRight: 12 } : { opacity: 0, x: -6, width: 0, paddingLeft: 0, paddingRight: 0 }}
            transition={prefersReducedMotion ? instantTransition : { duration: 0.25, ease: 'easeOut' }}
            onClick={handleArrowClick}
            className="shrink-0 h-full rounded-[4px] text-[var(--glass-nav-text-inactive)] hover:text-[var(--glass-nav-text)] transition-all duration-200 group flex items-center justify-center overflow-hidden"
          >
<motion.svg
                initial={false}
                animate={{
                  rotate: arrowScrolled ? 270 : 180
                }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.5,
                  ease: [0.65, 0, 0.35, 1] // Custom smooth ease-in-out
                }}
                className="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </motion.svg>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pathname !== '/' && (
          <motion.div
            key="divider"
            initial={prefersReducedMotion ? { opacity: 1, width: 1 } : { opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 1 }}
            exit={prefersReducedMotion ? { opacity: 1, width: 1 } : { opacity: 0, width: 0 }}
            transition={prefersReducedMotion ? instantTransition : { duration: 0.25, ease: 'easeOut' }}
            className="h-4 shrink-0"
          />
        )}
      </AnimatePresence>

      {isProjectMode
        ? projectLinks.map(link => (
            <ProjectLinkTab key={link.label} label={link.label} href={link.href} />
          ))
        : items.map(item => (
            <NavTab
              key={item}
              label={item}
              isActive={active === item}
              onClick={() => handleClick(item)}
            />
          ))
      }

      <div className="h-4 w-px shrink-0" />
      <ThemeIconButton onClick={toggle} theme={theme} />
    </nav>
  );
};

export default CentralNavMenu;
