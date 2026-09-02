import { useEffect, useRef } from 'react';
import SplitType from 'split-type';
import { gsap, ScrollTrigger } from '../../lib/gsap-setup';

interface UseTextRevealOptions {
  trigger?: Element | null;
  start?: string;
  end?: string;
}

export const useTextReveal = (containerRef: React.RefObject<HTMLElement>, options: UseTextRevealOptions = {}) => {
  const splitRef = useRef<SplitType | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initialize SplitType for text reveals
    const split = new SplitType(container, {
      types: 'lines,words',
      lineClass: 'split-line',
      wordClass: 'split-word',
    });

    splitRef.current = split;

    // Create GSAP context
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(split.lines, {
        clipPath: 'inset(100% 0% 0% 0%)',
        opacity: 0,
      });

      // Create ScrollTrigger for reveal
      ScrollTrigger.create({
        trigger: options.trigger || container,
        start: options.start || 'top 80%',
        end: options.end || 'bottom 20%',
        onEnter: () => {
          gsap.to(split.lines, {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            duration: 0.6,
            ease: 'expo.out',
            stagger: 0.1,
          });
        },
      });
    }, container);

    ctxRef.current = ctx;

    return () => {
      if (splitRef.current) {
        splitRef.current.revert();
      }
      if (ctxRef.current) {
        ctxRef.current.revert();
      }
    };
  }, [containerRef, options.trigger, options.start, options.end]);

  return { split: splitRef.current, ctx: ctxRef.current };
};
