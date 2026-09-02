import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap-setup';

/**
 * useSectionReveal Hook
 *
 * Triggers GSAP animation on mount for project sections.
 * Guarantees sequential reveal: Title → Paragraph → CTA
 *
 * Animation sequence:
 * 1. Title: y: 30 → 0, opacity 0 → 1, duration 0.5s, NO blur
 * 2. Paragraph: blur 6px → 0, opacity 0 → 1, y: 15 → 0, duration 0.8s, stagger 0.03s per word
 * 3. CTA: y: 15 → 0, opacity 0 → 1, duration 0.4s
 *
 * Timing: Title at 0s → Paragraph at 0.15s (overlap) → CTA at 0.35s (overlap)
 */
export function useSectionReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const titleEl = container.querySelector<HTMLElement>('[data-section-reveal="title"]');
    const paragraphEls = container.querySelectorAll<HTMLElement>('[data-section-reveal="paragraph"]');
    const ctaEl = container.querySelector<HTMLElement>('[data-section-reveal="cta"]');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Content visible immediately - no animation
      return;
    }

    // Use requestAnimationFrame to ensure DOM is fully ready
    requestAnimationFrame(() => {
      const ctx = gsap.context(() => {
        // Initial states - hide elements
        if (titleEl) gsap.set(titleEl, { y: 30, opacity: 0 });
        if (paragraphEls.length) gsap.set(paragraphEls, { opacity: 0, filter: 'blur(6px)', y: 15 });
        if (ctaEl) gsap.set(ctaEl, { y: 15, opacity: 0 });

        // Create timeline with ScrollTrigger
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
            once: true,
            invalidateOnRefresh: true,
          },
        });

        // 1. TITLE (no blur, slide up) - appears first
        if (titleEl) {
          tl.to(titleEl, {
            y: 0,
            opacity: 1,
            ease: 'power3.out',
            duration: 0.5,
          });
        }

        // 2. PARAGRAPH (blur reveal, staggered words) - appears after title
        if (paragraphEls.length) {
          tl.to(
            paragraphEls,
            {
              opacity: 1,
              filter: 'blur(0px)',
              y: 0,
              ease: 'power2.out',
              duration: 0.8,
              stagger: 0.03,
            },
            titleEl ? '-=0.35' : 0 // Start 0.35s after title begins (overlap)
          );
        }

        // 3. CTA (last) - appears after paragraph starts
        if (ctaEl) {
          tl.to(
            ctaEl,
            {
              y: 0,
              opacity: 1,
              ease: 'power3.out',
              duration: 0.4,
            },
            paragraphEls.length ? '-=0.45' : titleEl ? '-=0.2' : 0 // Start with overlap
          );
        }
      }, container);

      return () => ctx.revert();
    });
  }, []); // Run once on mount

  return containerRef;
}

export default useSectionReveal;
