import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useReducedMotionPreference } from '../../providers/MotionPreferenceProvider';
import { useLanguage } from '../../providers/LanguageProvider';
import { instantTransition } from '../../lib/reduced-motion';
import './WorkViewSwitcher.css';

export type WorkView = 'featured' | 'list' | 'grid';

const VIEW_LABEL_KEY: Record<WorkView, string> = {
  featured: 'view.featured',
  list: 'view.list',
  grid: 'view.grid',
};

// Heroicons v2 solid — MIT License — heroicons.com
const ICONS: Record<WorkView, string> = {
  featured: 'M1.5 7.125C1.5 6.08947 2.33947 5.25 3.375 5.25H9.375C10.4105 5.25 11.25 6.08947 11.25 7.125V10.875C11.25 11.9105 10.4105 12.75 9.375 12.75H3.375C2.33947 12.75 1.5 11.9105 1.5 10.875V7.125ZM13.5 8.625C13.5 7.58947 14.3395 6.75 15.375 6.75H20.625C21.6605 6.75 22.5 7.58947 22.5 8.625V16.875C22.5 17.9105 21.6605 18.75 20.625 18.75H15.375C14.3395 18.75 13.5 17.9105 13.5 16.875V8.625ZM3 16.125C3 15.0895 3.83947 14.25 4.875 14.25H10.125C11.1605 14.25 12 15.0895 12 16.125V18.375C12 19.4105 11.1605 20.25 10.125 20.25H4.875C3.83947 20.25 3 19.4105 3 18.375V16.125Z',
  list: 'M3 6.75C3 6.33579 3.33579 6 3.75 6H20.25C20.6642 6 21 6.33579 21 6.75C21 7.16421 20.6642 7.5 20.25 7.5H3.75C3.33579 7.5 3 7.16421 3 6.75ZM3 12C3 11.5858 3.33579 11.25 3.75 11.25H20.25C20.6642 11.25 21 11.5858 21 12C21 12.4142 20.6642 12.75 20.25 12.75H3.75C3.33579 12.75 3 12.4142 3 12ZM3 17.25C3 16.8358 3.33579 16.5 3.75 16.5H20.25C20.6642 16.5 21 16.8358 21 17.25C21 17.6642 20.6642 18 20.25 18H3.75C3.33579 18 3 17.6642 3 17.25Z',
  grid: 'M3 6C3 4.34315 4.34315 3 6 3H8.25C9.90685 3 11.25 4.34315 11.25 6V8.25C11.25 9.90685 9.90685 11.25 8.25 11.25H6C4.34315 11.25 3 9.90685 3 8.25V6ZM12.75 6C12.75 4.34315 14.0931 3 15.75 3H18C19.6569 3 21 4.34315 21 6V8.25C21 9.90685 19.6569 11.25 18 11.25H15.75C14.0931 11.25 12.75 9.90685 12.75 8.25V6ZM3 15.75C3 14.0931 4.34315 12.75 6 12.75H8.25C9.90685 12.75 11.25 14.0931 11.25 15.75V18C11.25 19.6569 9.90685 21 8.25 21H6C4.34315 21 3 19.6569 3 18V15.75ZM12.75 15.75C12.75 14.0931 14.0931 12.75 15.75 12.75H18C19.6569 12.75 21 14.0931 21 15.75V18C21 19.6569 19.6569 21 18 21H15.75C14.0931 21 12.75 19.6569 12.75 18V15.75Z',
};

const VIEWS: WorkView[] = ['featured', 'list', 'grid'];

function SwitcherTab({
  value,
  isActive,
  onClick,
}: {
  value: WorkView;
  isActive: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotionPreference();
  const { t } = useLanguage();
  const label = t(VIEW_LABEL_KEY[value]);

  const updatePos = (cx: number, cy: number) => {
    if (prefersReducedMotion || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    setPos({
      x: (cx - (left + width / 2)) * 0.2,
      y: (cy - (top + height / 2)) * 0.2,
    });
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={e => updatePos(e.clientX, e.clientY)}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      onTouchMove={e => {
        const t = e.touches[0];
        if (t) updatePos(t.clientX, t.clientY);
      }}
      onTouchEnd={() => setPos({ x: 0, y: 0 })}
      animate={prefersReducedMotion ? { x: 0, y: 0 } : { x: pos.x, y: pos.y }}
      transition={prefersReducedMotion ? instantTransition : { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      aria-pressed={isActive}
      aria-label={label}
      title={label}
      className={`shrink-0 h-full aspect-square rounded-[4px] flex items-center justify-center transition-all duration-200 select-none ${
        isActive
          ? 'text-[var(--glass-nav-text)]'
          : 'text-[var(--glass-nav-text-inactive)] hover:text-[var(--glass-nav-text)]'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path d={ICONS[value]} />
      </svg>
    </motion.button>
  );
}

interface WorkViewSwitcherProps {
  view: WorkView;
  onChange: (v: WorkView) => void;
}

export function WorkViewSwitcher({ view, onChange }: WorkViewSwitcherProps) {
  const { t } = useLanguage();
  return (
    <nav
      className="absolute bottom-6 right-4 h-[34px] glass-nav flex items-center gap-0.5 p-0.5 z-view-switcher"
      style={{ borderRadius: 'var(--radius-sm)' }}
      aria-label={t('view.switcher-label')}
    >
      {VIEWS.map(v => (
        <SwitcherTab
          key={v}
          value={v}
          isActive={view === v}
          onClick={() => onChange(v)}
        />
      ))}
    </nav>
  );
}
