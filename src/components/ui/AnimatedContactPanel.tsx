import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface AnimatedContactPanelProps {
  open: boolean;
  children: ReactNode;
}

const EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DURATION = 0.32;

export const AnimatedContactPanel = ({ open, children }: AnimatedContactPanelProps) => {
  return (
    <motion.div
      className="contact-panel-wrapper"
      initial={{ opacity: 0, y: -6 }}
      animate={{
        opacity: open ? 1 : 0,
        y: open ? 0 : -6,
      }}
      transition={{
        duration: DURATION,
        ease: EASING,
      }}
      aria-hidden={!open}
      style={{
        visibility: open ? 'visible' : 'hidden',
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      {children}
    </motion.div>
  );
};
