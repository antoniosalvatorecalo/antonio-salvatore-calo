import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/theme/useTheme';
import { useScroll } from '../../providers/ScrollProvider';
import { useReducedMotionPreference } from '../../providers/MotionPreferenceProvider';
import { instantTransition } from '../../lib/reduced-motion';
import './ThemeToggle.css';

const SunIcon = () => <Sun size={14} />;
const MoonIcon = () => <Moon size={14} />;

export const ThemeIconButton = ({
  onClick,
  theme,
  className = '',
}: {
  onClick: () => void;
  theme: 'light' | 'dark';
  className?: string;
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
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className={`flex items-center justify-center rounded-[4px] h-full aspect-square text-[var(--glass-nav-text-inactive)] hover:text-[var(--glass-nav-text)] transition-colors duration-200 select-none flex-shrink-0 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'light' ? (
          <motion.span
            key="sun"
            initial={prefersReducedMotion ? { opacity: 1, rotate: 0 } : { opacity: 0, rotate: -20 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={prefersReducedMotion ? { opacity: 1, rotate: 0 } : { opacity: 0, rotate: 20 }}
            transition={prefersReducedMotion ? instantTransition : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center"
          >
            <SunIcon />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={prefersReducedMotion ? { opacity: 1, rotate: 0 } : { opacity: 0, rotate: 20 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={prefersReducedMotion ? { opacity: 1, rotate: 0 } : { opacity: 0, rotate: -20 }}
            transition={prefersReducedMotion ? instantTransition : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center"
          >
            <MoonIcon />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  const { isDesktop } = useScroll();
  // const { pathname } = useLocation(); // unused, toggle now has fixed positioning

  // const rightClass removed – position handled by rightClass logic

  const rightClass = 'right-12';




const containerClass = isDesktop
    ? `fixed top-6 ${rightClass} w-[34px] h-[34px] glass-nav flex items-center justify-center z-nav`
    : `fixed bottom-4 ${rightClass} w-[34px] h-[34px] glass-nav flex items-center justify-center z-nav-floating`;

  const containerStyle: React.CSSProperties = {
    borderRadius: 'var(--radius-sm)',
  };

  return (
    <div
      className={containerClass}
      style={containerStyle}
    >
      <ThemeIconButton onClick={toggle} theme={theme} />
    </div>
  );
};
