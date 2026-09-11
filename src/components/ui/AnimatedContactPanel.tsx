import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { createTextEnterTimeline } from '@/motion/TextRevealMotion';
import { useReducedMotionPreference } from '@/providers/MotionPreferenceProvider';

interface AnimatedContactPanelProps {
  open: boolean;
  children: ReactNode;
}

export const AnimatedContactPanel = ({ open, children }: AnimatedContactPanelProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionPreference();
  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const timeline = createTextEnterTimeline([ref.current], {
      mobile: window.matchMedia('(max-width: 767px)').matches,
      reducedMotion,
    });
    return () => {
      timeline.kill();
    };
  }, [open, reducedMotion]);
  return (
    <div
      ref={ref}
      className="contact-panel-wrapper"
      aria-hidden={!open}
      style={{
        display: open ? undefined : 'none',
        visibility: open ? 'visible' : 'hidden',
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      {children}
    </div>
  );
};
