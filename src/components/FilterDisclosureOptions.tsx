import { AnimatePresence, motion, type Variants } from 'motion/react';
import { TEXT_MOTION } from '@/motion/TextRevealMotion';
import { useReducedMotionPreference } from '@/providers/MotionPreferenceProvider';

export interface FilterDisclosureOption {
  value: string;
  label: string;
  count: number;
  disabled?: boolean;
}

const FILTER_MOTION_EASE = [0.22, 1, 0.36, 1] as const;

const createPanelVariants = (reducedMotion: boolean): Variants => ({
  hidden: { width: 0, opacity: 0, x: -8, clipPath: 'inset(-20px 100% -20px 0)' },
  visible: {
    width: 'auto',
    opacity: 1,
    x: 0,
    clipPath: 'inset(-20px 0% -20px 0)',
    transition: { duration: reducedMotion ? 0 : 0.28, ease: FILTER_MOTION_EASE },
  },
  exit: {
    width: 0,
    opacity: 0,
    x: -8,
    clipPath: 'inset(-20px 100% -20px 0)',
    transition: {
      when: 'afterChildren',
      duration: reducedMotion ? 0 : 0.28,
      ease: FILTER_MOTION_EASE,
    },
  },
});

const createOptionsVariants = (reducedMotion: boolean, mobile: boolean): Variants => ({
  hidden: {},
  visible: {
    transition: {
      delayChildren: reducedMotion ? 0 : 0.02,
      staggerChildren: reducedMotion ? 0 : TEXT_MOTION.stagger * (mobile ? 0.8 : 1),
      staggerDirection: 1,
    },
  },
  exit: {
    transition: {
      staggerChildren: reducedMotion ? 0 : TEXT_MOTION.stagger * 0.6,
      staggerDirection: 1,
    },
  },
});

const createOptionVariants = (reducedMotion: boolean, mobile: boolean): Variants => ({
  hidden: { opacity: 0, y: mobile ? 10 : 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: reducedMotion ? 0 : TEXT_MOTION.enterDuration,
      ease: FILTER_MOTION_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: mobile ? -8 : -12,
    transition: {
      duration: reducedMotion ? 0 : TEXT_MOTION.exitDuration,
      ease: FILTER_MOTION_EASE,
    },
  },
});

interface FilterDisclosureOptionsProps {
  open: boolean;
  panelId: string;
  groupLabel: string;
  options: FilterDisclosureOption[];
  activeValue: string;
  onSelect: (value: string) => void;
}

export function FilterDisclosureOptions({
  open,
  panelId,
  groupLabel,
  options,
  activeValue,
  onSelect,
}: FilterDisclosureOptionsProps) {
  const reducedMotion = useReducedMotionPreference();
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  const panelVariants = createPanelVariants(reducedMotion);
  const optionsVariants = createOptionsVariants(reducedMotion, mobile);
  const optionVariants = createOptionVariants(reducedMotion, mobile);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          id={panelId}
          className="filter-bar-panel"
          variants={panelVariants}
          initial={reducedMotion ? false : 'hidden'}
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="filter-bar-options"
            role="group"
            aria-label={groupLabel}
            variants={optionsVariants}
          >
            {options.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                className={`filter-bar-item${activeValue === option.value ? ' is-active' : ''}`}
                aria-pressed={activeValue === option.value}
                disabled={option.disabled}
                onClick={() => onSelect(option.value)}
                variants={optionVariants}
              >
                {option.label} <span className="filter-bar-count">[{option.count}]</span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
