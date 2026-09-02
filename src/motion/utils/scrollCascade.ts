/**
 * scrollCascade — per-section scroll animation
 *
 * Architecture:
 * - Reads scroller from DOM directly (fixes ref capture bug)
 * - gsap.context() scoping with revert cleanup
 * - Timeline per section, scrollTrigger on timeline
 * - once: true, no repeat
 */
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-setup';

export const INITIAL = {
  label:     { y: '110%', clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
  paragraph: { y: 12, filter: 'blur(6px)', scale: 0.97, opacity: 0 },
  item:      { x: -20, clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 },
  cta:       { x: -20, clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 },
};

export const FINAL = {
  label:     { y: 0, clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 },
  paragraph: { y: 0, filter: 'blur(0px)', scale: 1, opacity: 1 },
  item:      { x: 0, clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 },
  cta:       { x: 0, clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 },
};

interface ScrollCascadeOptions {
  staggerLabels?: number;
  staggerParagraphs?: number;
  staggerItems?: number;
}

export function useScrollCascade<T extends HTMLElement = HTMLDivElement>(
  containerRef: React.RefObject<T | null>,
  options: ScrollCascadeOptions = {}
) {
  const {
    staggerLabels = 0.06,
    staggerParagraphs = 0.04,
    staggerItems = 0.06,
  } = options;

  const triggeredRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (triggeredRef.current) return;
    triggeredRef.current = true;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const getEls = (sel: string) =>
      Array.from(container.querySelectorAll<HTMLElement>(sel))
        .filter(el => !el.classList.contains('entry-reveal-done'));

    const labels = getEls('[data-reveal="label"], [data-reveal="title"]');
    const paragraphs = getEls('[data-reveal="paragraph"]');
    const items = getEls('[data-reveal="item"], [data-reveal="cta"]');

    if (!labels.length && !paragraphs.length && !items.length) return;

    if (prefersReducedMotion) {
      const all = [...labels, ...paragraphs, ...items];
      gsap.set(all, FINAL.label as any);
      all.forEach(el => el.classList.add('entry-reveal-done'));
      return;
    }

    // Set initial hidden state
    if (labels.length) gsap.set(labels, INITIAL.label as any);
    if (paragraphs.length) gsap.set(paragraphs, INITIAL.paragraph as any);
    if (items.length) gsap.set(items, INITIAL.item as any);

    // Find Lenis scroller from DOM at animation time (not from prop)
    const findScroller = () =>
      (document.querySelector('.left-scroll-container') as HTMLElement | null) ?? undefined;

    // Small delay so Lenis has time to initialize
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            scroller: findScroller(),
            start: 'top 85%',
            end: 'bottom 15%',
            once: true,
            invalidateOnRefresh: true,
          },
        });

        if (labels.length) {
          tl.to(labels, {
            ...FINAL.label as object,
            ease: 'power3.out',
            duration: 0.35,
            stagger: staggerLabels,
            onComplete: () => labels.forEach(el => el.classList.add('entry-reveal-done')),
          });
        }

        if (paragraphs.length) {
          tl.to(
            paragraphs,
            {
              ...FINAL.paragraph as object,
              ease: 'power2.out',
              duration: 0.5,
              stagger: staggerParagraphs,
              onComplete: () => paragraphs.forEach(el => el.classList.add('entry-reveal-done')),
            },
            labels.length ? '-=0.2' : 0
          );
        }

        if (items.length) {
          const itemStagger = items.length <= 4 ? staggerItems + 0.02 : staggerItems;
          tl.to(
            items,
            {
              ...FINAL.item as object,
              ease: 'expo.out',
              duration: 0.35,
              stagger: itemStagger,
              onComplete: () => items.forEach(el => el.classList.add('entry-reveal-done')),
            },
            labels.length || paragraphs.length ? '-=0.25' : 0
          );
        }
      }, container);

      return () => ctx.revert();
    }, 50);

    return () => {
      clearTimeout(timer);
      triggeredRef.current = false;
    };
  }, [containerRef, staggerLabels, staggerParagraphs, staggerItems]);
}
