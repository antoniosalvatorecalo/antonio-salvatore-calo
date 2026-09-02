import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap-setup';
import { useReducedMotionPreference } from '@/providers/MotionPreferenceProvider';
import './AnimatedSectionHeader.css';

interface AnimatedSectionHeaderProps {
  title: string;
  light?: boolean;
  cascadeDelay?: number;
}

export const AnimatedSectionHeader: React.FC<AnimatedSectionHeaderProps> = ({
  title,
  light = false,
  cascadeDelay = 0
}) => {
  const titleRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const titleEl = titleRef.current;
    if (!titleEl) return;

    if (prefersReducedMotion) {
      titleEl.style.filter = 'none';
      return;
    }

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const duration = isMobile ? 0.45 : 0.6;

    // Only blur — motion.div AnimatePresence wrapper handles opacity + y reveal
    titleEl.style.filter = 'blur(8px)';
    titleEl.style.willChange = 'filter';

    const ctx = gsap.context(() => {
      gsap.to(titleEl, {
        filter: 'blur(0px)',
        duration,
        delay: 0.35 + cascadeDelay / 1000,
        ease: 'power2.out',
        onComplete: () => {
          titleEl.style.willChange = 'auto';
        },
      });
    });

    return () => {
      titleEl.style.willChange = 'auto';
      ctx.revert();
    };
  }, [cascadeDelay, prefersReducedMotion]);

  return (
    <div className="flex items-center mb-8">
      <span
        ref={titleRef}
        className={`${light ? 'text-(--text-inverse)' : 'text-(--text-muted)'} [font-size:var(--text-base)] uppercase tracking-wider font-[500]`}
      >
        {title}
      </span>
    </div>
  );
};
