import { useEffect, useRef } from 'react';
import * as React from 'react';

export interface ScrollStaggerConfig {
  /** Initial translateY value in pixels for deep elements (desktop: 18, mobile: 12) */
  translateY?: number;
  /** Medium translateY value for labels (default: 12px) */
  translateYMedium?: number;
  /** Shallow translateY value for list items/values (default: 8px) */
  translateYShallow?: number;
  /** Animation duration in seconds (desktop: 0.6, mobile: 0.45) */
  duration?: number;
  /** Default stagger delay between elements in ms (desktop: 80, mobile: 50) */
  stagger?: number;
  /** IntersectionObserver threshold */
  threshold?: number;
  /** IntersectionObserver rootMargin */
  rootMargin?: string;
  /** Whether to animate only once */
  once?: boolean;
}

/**
 * useScrollStagger - Hook for scroll-triggered stagger animations
 * 
 * Applies opacity + translateY animations to child elements when they enter the viewport.
 * Respects prefers-reduced-motion for accessibility.
 * 
 * Supports data attributes:
 * - data-stagger-container: Marks the container for observation
 * - data-stagger: Marks elements for deep animation (translateY 18px)
 * - data-stagger-shallow: Marks elements for shallow animation (translateY 8px)
 * - data-stagger-delay: Custom delay in ms for specific elements
 * 
 * @param config - Animation configuration
 * @returns Ref to attach to the container element
 */
export function useScrollStagger(config: ScrollStaggerConfig = {}): React.RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    translateY = 18,
    translateYMedium = 12,
    translateYShallow = 8,
    duration = 0.6,
    stagger = 80,
    threshold = 0.15,
    rootMargin = '0px 0px -15% 0px',
    once = true,
  } = config;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect mobile for adjusted values
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const effectiveTranslateY = isMobile ? 12 : translateY;
    const effectiveDuration = isMobile ? 0.45 : duration;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const deepElements = container.querySelectorAll('[data-stagger]');
    const mediumElements = container.querySelectorAll('[data-stagger-medium]');
    const shallowElements = container.querySelectorAll('[data-stagger-shallow]');
    const allAnimated = [...deepElements, ...mediumElements, ...shallowElements];

    if (prefersReducedMotion) {
      // Instantly show all elements, no animation
      allAnimated.forEach((element) => {
        (element as HTMLElement).style.opacity = '1';
        (element as HTMLElement).style.transform = 'none';
      });
      return;
    }

    // Set initial state for deep elements (section titles)
    deepElements.forEach((element: Element) => {
      const el = element as HTMLElement;
      el.style.opacity = '0';
      el.style.transform = `translateY(${effectiveTranslateY}px)`;
      el.style.transition = `opacity ${effectiveDuration}s cubic-bezier(0.22, 1, 0.36, 1), transform ${effectiveDuration}s cubic-bezier(0.22, 1, 0.36, 1)`;
      el.style.willChange = 'opacity, transform';
    });

    // Set initial state for medium elements (labels)
    mediumElements.forEach((element: Element) => {
      const el = element as HTMLElement;
      el.style.opacity = '0';
      el.style.transform = `translateY(${translateYMedium}px)`;
      el.style.transition = `opacity ${effectiveDuration}s cubic-bezier(0.22, 1, 0.36, 1), transform ${effectiveDuration}s cubic-bezier(0.22, 1, 0.36, 1)`;
      el.style.willChange = 'opacity, transform';
    });

    // Set initial state for shallow elements (values/content)
    shallowElements.forEach((element: Element) => {
      const el = element as HTMLElement;
      el.style.opacity = '0';
      el.style.transform = `translateY(${translateYShallow}px)`;
      el.style.transition = `opacity ${effectiveDuration}s cubic-bezier(0.22, 1, 0.36, 1), transform ${effectiveDuration}s cubic-bezier(0.22, 1, 0.36, 1)`;
      el.style.willChange = 'opacity, transform';
    });

    // Create IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate all children with their respective delays
            allAnimated.forEach((element) => {
              const el = element as HTMLElement;
              const customDelay = el.getAttribute('data-stagger-delay');
              const delay = customDelay ? parseInt(customDelay, 10) : 0;

              setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
              }, delay);
            });

            // Unobserve if once is true
            if (once) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [translateY, translateYShallow, duration, stagger, threshold, rootMargin, once]);

  return containerRef;
}
