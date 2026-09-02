import { useState, useEffect, useRef, useContext } from 'react';
import { motion } from 'motion/react';
import { ArrowUp, ArrowUpLeft } from 'lucide-react';
import { useScroll } from '../../providers/ScrollProvider';
import { useLocation, useNavigate } from 'react-router-dom';
import { ScrollerContext } from '../../layouts/ProjectBrutalistLayout';
import { useReducedMotionPreference } from '../../providers/MotionPreferenceProvider';
import { instantTransition } from '../../lib/reduced-motion';
import './BackToTop.css';

const BackToTop = () => {
  const { isDesktop, leftScrollRef, rightScrollRef, activeTab } = useScroll();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const scrollerContext = useContext(ScrollerContext);
  const prefersReducedMotion = useReducedMotionPreference();
  const [isVisible, setIsVisible] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollPosRef = useRef(0);

  const isProjectPage = pathname.startsWith('/projects/');

  useEffect(() => {
    if (isDesktop) {
      setIsVisible(false);
      return;
    }

    let container: HTMLElement | null = null;
    if (isProjectPage) {
      container = scrollerContext?.ref.current || null;
    } else {
      if (isDesktop) return;
      container = activeTab === 'work' ? rightScrollRef.current : leftScrollRef.current;
    }

    if (!container) {
      if (isProjectPage) {
        setIsVisible(true);
        setIsAtTop(true);
      }
      return;
    }

    const checkScroll = () => {
      const scrollPos = (isProjectPage && scrollerContext?.lenis)
        ? scrollerContext.lenis.scroll
        : container!.scrollTop;

      const prevPos = lastScrollPosRef.current;
      lastScrollPosRef.current = scrollPos;

      setIsAtTop(scrollPos <= 50);

      if (isProjectPage) {
        setIsVisible(true);
      } else if (scrollPos < 100) {
        setIsVisible(false);
      } else if (scrollPos > prevPos) {
        setIsVisible(true);
      } else if (scrollPos < prevPos) {
        setIsVisible(false);
      }
    };

    if (isProjectPage && scrollerContext?.lenis) {
      scrollerContext.lenis.on('scroll', checkScroll);
      checkScroll();
      return () => { scrollerContext.lenis?.off('scroll', checkScroll); };
    } else {
      container.addEventListener('scroll', checkScroll, { passive: true });
      checkScroll();
      return () => { container!.removeEventListener('scroll', checkScroll); };
    }
  }, [isDesktop, pathname, activeTab, leftScrollRef, rightScrollRef, scrollerContext, isProjectPage]);

  if (isDesktop) return null;

  const rightClass = 'right-2';
  const isBackMode = isAtTop && isProjectPage;

  const handleClick = () => {
    if (isBackMode) {
      navigate('/');
    } else if (isProjectPage && scrollerContext?.lenis) {
      scrollerContext.lenis.scrollTo(0);
    } else if (isProjectPage && scrollerContext?.ref.current) {
      scrollerContext.ref.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const container = activeTab === 'work' ? rightScrollRef.current : leftScrollRef.current;
      container?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] ${rightClass} w-[34px] h-[34px] glass-nav flex items-center justify-center z-nav-floating`}
      style={{ borderRadius: 'var(--radius-sm)', pointerEvents: isVisible ? 'auto' : 'none' }}
      initial={prefersReducedMotion ? { opacity: isVisible ? 1 : 0, scale: 1 } : { opacity: 0, scale: 0.8 }}
      animate={prefersReducedMotion ? { opacity: isVisible ? 1 : 0, scale: 1 } : { opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
      transition={prefersReducedMotion ? instantTransition : { duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
        <motion.button
          onClick={handleClick}
          className="flex items-center justify-center rounded-[4px] h-full aspect-square text-[var(--glass-nav-text-inactive)] hover:text-[var(--glass-nav-text)] transition-colors duration-200 select-none flex-shrink-0"
          whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
          aria-label={isBackMode ? 'Back to home' : 'Back to top'}
        >
          <motion.span
            key={isBackMode ? 'left' : 'up'}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: isBackMode ? -10 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? instantTransition : { duration: 0.2 }}
            className="flex items-center justify-center w-full h-full"
          >
            {isBackMode ? (
              <ArrowUpLeft size={18} strokeWidth={2} />
            ) : (
              <ArrowUp size={18} strokeWidth={2} />
            )}
          </motion.span>
        </motion.button>
    </motion.div>
  );
};

export default BackToTop;
