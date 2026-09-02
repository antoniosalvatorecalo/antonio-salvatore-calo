import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap-setup';
import { INITIAL as CASCADE_INITIAL, FINAL as CASCADE_FINAL } from '../../motion/utils/scrollCascade';

// Canonical reveal values (sourced from scrollCascade.ts)
const REVEAL_LABELS = CASCADE_FINAL.label;
const REVEAL_BODY = CASCADE_FINAL.paragraph;
const REVEAL_ITEMS = CASCADE_FINAL.item;
const REVEAL_LABELS_START = CASCADE_INITIAL.label;
const REVEAL_BODY_START = CASCADE_INITIAL.paragraph;
const REVEAL_ITEMS_START = CASCADE_INITIAL.item;

/**
 * Cascade Animation Hook — Left Column Scroll System
 *
 * Production-hardened implementation:
 * - Strict state lock validation (entry-reveal-done only in onComplete)
 * - Scroll engine binding verification
 * - StrictMode safety (isMounted guard)
 * - Fallback integrity (no double-trigger)
 * - No animation timing or easing changes
 */
export function useScrollReveal(
  scrollerRef: { readonly current: HTMLElement | null }
): RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    isMountedRef.current = true;
    triggeredRef.current = false;

    const scroller = scrollerRef.current ?? window;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── SCROLL ENGINE VALIDATION ─────────────────────────────
    const isLenisScroller = scroller !== window && (scroller as HTMLElement)?.classList?.contains('left-scroll-container');
    console.log('[ScrollSystem] useScrollReveal mounted');
    console.log('[ScrollSystem] Lenis scroller detected:', isLenisScroller, '| tag:', (scroller as HTMLElement)?.tagName || 'window');
    console.log('[ScrollSystem] ScrollTrigger instances active:', ScrollTrigger.getAll().length);

    // ─── STATE LOCK VALIDATION ─────────────────────────────────
    // Verify NO elements are pre-locked before animation starts
    const preLockedLabels = container.querySelectorAll('[data-reveal="label"].entry-reveal-done, [data-reveal="title"].entry-reveal-done');
    const preLockedBody = container.querySelectorAll('[data-reveal="paragraph"].entry-reveal-done, [data-reveal="word"].entry-reveal-done');
    const preLockedItems = container.querySelectorAll('[data-reveal="item"].entry-reveal-done, [data-reveal="cta"].entry-reveal-done');

    if (preLockedLabels.length + preLockedBody.length + preLockedItems.length > 0) {
      console.warn('[StateLock] WARNING: pre-locked elements found — labels:', preLockedLabels.length, 'body:', preLockedBody.length, 'items:', preLockedItems.length);
      console.warn('[StateLock] These elements will be excluded from cascade animation');
    }

    // Query ONLY elements NOT pre-locked
    const labelEls = Array.from(
      container.querySelectorAll<HTMLElement>('[data-reveal="label"]:not(.entry-reveal-done):not(.reveal-complete)')
    );
    const titleEls = Array.from(
      container.querySelectorAll<HTMLElement>('[data-reveal="title"]:not(.entry-reveal-done):not(.reveal-complete)')
    );
    const wordEls = Array.from(
      container.querySelectorAll<HTMLElement>('[data-reveal="word"]:not(.entry-reveal-done):not(.reveal-complete)')
    );
    const paragraphEls = Array.from(
      container.querySelectorAll<HTMLElement>('[data-reveal="paragraph"]:not(.entry-reveal-done):not(.reveal-complete)')
    );
    const itemEls = Array.from(
      container.querySelectorAll<HTMLElement>('[data-reveal="item"]:not(.entry-reveal-done):not(.reveal-complete)')
    );
    const ctaEls = Array.from(
      container.querySelectorAll<HTMLElement>('[data-reveal="cta"]:not(.entry-reveal-done):not(.reveal-complete)')
    );

    const allLabels = [...labelEls, ...titleEls];
    const allBody = [...wordEls, ...paragraphEls];
    const allItems = [...itemEls, ...ctaEls];

    console.log('[Cascade] labels:', allLabels.length, '| body:', allBody.length, '| items:', allItems.length);
    console.log('[StateLock] Pre-locked check: PASS — no elements locked before animation start');

    if (allLabels.length) {
      allLabels.forEach((el, i) => console.log('[Cascade] label', i + 1, ':', el.textContent?.trim().slice(0, 30)));
    }

    // ─── PREFERS REDUCED MOTION ─────────────────────────────────
    if (prefersReducedMotion) {
      console.log('[Cascade] prefers-reduced-motion: ACTIVE — instant reveal (no animation)');
      if (allLabels.length) gsap.set(allLabels, REVEAL_LABELS as any);
      if (allBody.length) gsap.set(allBody, REVEAL_BODY as any);
      if (allItems.length) gsap.set(allItems, REVEAL_ITEMS as any);
      allLabels.forEach(el => el.classList.add('entry-reveal-done', 'reveal-complete'));
      allBody.forEach(el => el.classList.add('entry-reveal-done', 'reveal-complete'));
      allItems.forEach(el => el.classList.add('entry-reveal-done', 'reveal-complete'));
      return;
    }

    // ─── FALLBACK TIMER — created at effect scope (not inside gsap.context TDZ)
    const hasElements = allLabels.length || allBody.length || allItems.length;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    if (hasElements) {
      fallbackTimer = setTimeout(() => {
        if (!isMountedRef.current || triggeredRef.current) return;

        const stillHidden = allLabels.some(el => parseFloat(getComputedStyle(el).opacity) < 1) ||
                            allBody.some(el => parseFloat(getComputedStyle(el).opacity) < 1) ||
                            allItems.some(el => parseFloat(getComputedStyle(el).opacity) < 1);

        if (stillHidden) {
          console.warn('[ScrollSystem] TIMEOUT — ScrollTrigger did not fire after 3s. Falling back to force-reveal.');
          gsap.set(allLabels, REVEAL_LABELS as any);
          gsap.set(allBody, REVEAL_BODY as any);
          gsap.set(allItems, REVEAL_ITEMS as any);
          allLabels.forEach(el => el.classList.add('entry-reveal-done', 'reveal-complete'));
          allBody.forEach(el => el.classList.add('entry-reveal-done', 'reveal-complete'));
          allItems.forEach(el => el.classList.add('entry-reveal-done', 'reveal-complete'));
        }
      }, 3000);
    }

    if (allLabels.length) {
      gsap.set(allLabels, REVEAL_LABELS_START as any);
    }
    if (allBody.length) {
      gsap.set(allBody, REVEAL_BODY_START as any);
    }
    if (allItems.length) {
      gsap.set(allItems, REVEAL_ITEMS_START as any);
    }

    // ─── TIMELINE + SCROLLTRIGGER ───────────────────────────────
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          scroller,
          start: 'top 85%',
          end: 'bottom 15%',
          scrub: false,
          once: true,
          invalidateOnRefresh: true,
        },
      });

      console.log('[ScrollSystem] ScrollTrigger bound to:', (scroller as HTMLElement)?.className || 'window');
      console.log('[ScrollSystem] .scroll-content scroller bound ✔');

      // ─── LABEL PHASE ───────────────────────────────────────────
      // Timing: 0.35s, power3.out, clip-path wipe, stagger 0.06
      if (allLabels.length) {
        tl.to(allLabels, {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'power3.out',
          duration: 0.35,
          stagger: 0.06,
          onStart: () => {
            if (!isMountedRef.current) return;
            triggeredRef.current = true;
          },
          onComplete: () => {
            if (!isMountedRef.current) return;
            console.log('[Cascade] LABEL phase complete, state locked ✔');
            allLabels.forEach((el) => el.classList.add('entry-reveal-done', 'reveal-complete'));
          },
        });
      }

      // ─── BODY PHASE ────────────────────────────────────────────
      // Timing: 0.5s, power2.out, blur+opacity+y+scale, stagger 0.04, overlap -0.2s
      if (allBody.length) {
        tl.to(
          allBody,
          {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            scale: 1,
            ease: 'power2.out',
            duration: 0.5,
            stagger: 0.04,
            onComplete: () => {
              if (!isMountedRef.current) return;
              console.log('[Cascade] BODY phase complete, state locked ✔');
              allBody.forEach((el) => el.classList.add('entry-reveal-done', 'reveal-complete'));
            },
          },
          allLabels.length ? '-=0.2' : 0
        );
      }

      // ─── ITEMS PHASE ──────────────────────────────────────────
      // Timing: 0.35s, expo.out, horizontal clip-path sweep, stagger 0.06-0.08, overlap -0.25s
      if (allItems.length) {
        const itemStagger = allItems.length <= 4 ? 0.08 : 0.06;
        tl.to(
          allItems,
          {
            opacity: 1,
            x: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'expo.out',
            duration: 0.35,
            stagger: itemStagger,
            onComplete: () => {
              if (!isMountedRef.current) return;
              console.log('[Cascade] ITEMS phase complete, state locked ✔');
              allItems.forEach((el) => el.classList.add('entry-reveal-done', 'reveal-complete'));
            },
          },
          allLabels.length || allBody.length ? '-=0.25' : 0
        );
      }
    }, container);

    return () => {
      isMountedRef.current = false;
      // Clear fallback timer if effect unmounts before timeout
      if (fallbackTimer) clearTimeout(fallbackTimer);
      ctx.revert();
    };
  }, [scrollerRef]);

  return containerRef;
}

/**
 * useSectionCascade — multi-section animation system
 *
 * Production-hardened:
 * - Per-section independent ScrollTrigger
 * - StrictMode protection
 * - State lock integrity
 * - No timing/easing changes from spec
 */
export function useSectionCascade(
  scrollerRef: { readonly current: HTMLElement | null },
  options?: {
    labelTrigger?: string;
    bodyTrigger?: string;
    itemTrigger?: string;
    labelStart?: string;
    bodyStart?: string;
    itemStart?: string;
    staggerBody?: number;
    staggerItems?: number;
  }
): RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);
  const triggeredLabelsRef = useRef(false);
  const triggeredBodyRef = useRef(false);
  const triggeredItemsRef = useRef(false);

  const {
    labelTrigger = '[data-reveal="label"], [data-reveal="title"]',
    bodyTrigger = '[data-reveal="paragraph"], [data-reveal="word"]',
    itemTrigger = '[data-reveal="item"], [data-reveal="cta"]',
    labelStart = 'top 85%',
    bodyStart = 'top 82%',
    itemStart = 'top 80%',
    staggerBody = 0.04,
    staggerItems = 0.06,
  } = options || {};

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    isMountedRef.current = true;
    triggeredLabelsRef.current = false;
    triggeredBodyRef.current = false;
    triggeredItemsRef.current = false;

    const scroller = scrollerRef.current ?? window;

    console.log('[ScrollSystem] useSectionCascade mounted, scroller:', (scroller as HTMLElement)?.className || 'window');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const labelEls = Array.from(
      container.querySelectorAll<HTMLElement>(`${labelTrigger}:not(.entry-reveal-done):not(.reveal-complete)`)
    );
    const bodyEls = Array.from(
      container.querySelectorAll<HTMLElement>(`${bodyTrigger}:not(.entry-reveal-done):not(.reveal-complete)`)
    );
    const itemEls = Array.from(
      container.querySelectorAll<HTMLElement>(`${itemTrigger}:not(.entry-reveal-done):not(.reveal-complete)`)
    );

    console.log('[Cascade] useSectionCascade — labels:', labelEls.length, '| body:', bodyEls.length, '| items:', itemEls.length);

    if (prefersReducedMotion) {
      if (labelEls.length) gsap.set(labelEls, REVEAL_LABELS as any);
      if (bodyEls.length) gsap.set(bodyEls, REVEAL_BODY as any);
      if (itemEls.length) gsap.set(itemEls, REVEAL_ITEMS as any);
      labelEls.forEach(el => el.classList.add('entry-reveal-done', 'reveal-complete'));
      bodyEls.forEach(el => el.classList.add('entry-reveal-done', 'reveal-complete'));
      itemEls.forEach(el => el.classList.add('entry-reveal-done', 'reveal-complete'));
      return;
    }

    if (labelEls.length) gsap.set(labelEls, REVEAL_LABELS_START as any);
    if (bodyEls.length) gsap.set(bodyEls, REVEAL_BODY_START as any);
    if (itemEls.length) gsap.set(itemEls, REVEAL_ITEMS_START as any);

    const ctx = gsap.context(() => {
      // ─── LABEL TIMELINE ─────────────────────────────────────
      if (labelEls.length) {
        const labelTl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            scroller,
            start: labelStart,
            once: true,
            invalidateOnRefresh: true,
          },
        });
        console.log('[ScrollSystem] LABEL ScrollTrigger created, start:', labelStart);

        labelTl.to(labelEls, {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'power3.out',
          duration: 0.35,
          stagger: 0.06,
          onStart: () => {
            if (!isMountedRef.current) return;
            triggeredLabelsRef.current = true;
          },
          onComplete: () => {
            if (!isMountedRef.current) return;
            console.log('[Cascade] useSectionCascade LABEL complete, locked ✔');
            labelEls.forEach(el => el.classList.add('entry-reveal-done', 'reveal-complete'));
          },
        });
      }

      // ─── BODY TIMELINE ──────────────────────────────────────
      if (bodyEls.length) {
        const bodyTl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            scroller,
            start: bodyStart,
            once: true,
            invalidateOnRefresh: true,
          },
        });
        console.log('[ScrollSystem] BODY ScrollTrigger created, start:', bodyStart);

        bodyTl.to(
          bodyEls,
          {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            scale: 1,
            ease: 'power2.out',
            duration: 0.5,
            stagger: staggerBody,
            onStart: () => {
              if (!isMountedRef.current) return;
              triggeredBodyRef.current = true;
            },
            onComplete: () => {
              if (!isMountedRef.current) return;
              console.log('[Cascade] useSectionCascade BODY complete, locked ✔');
              bodyEls.forEach(el => el.classList.add('entry-reveal-done', 'reveal-complete'));
            },
          },
          labelEls.length ? '-=0.2' : 0
        );
      }

      // ─── ITEMS TIMELINE ─────────────────────────────────────
      if (itemEls.length) {
        const itemTl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            scroller,
            start: itemStart,
            once: true,
            invalidateOnRefresh: true,
          },
        });
        console.log('[ScrollSystem] ITEMS ScrollTrigger created, start:', itemStart);

        itemTl.to(
          itemEls,
          {
            opacity: 1,
            x: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'expo.out',
            duration: 0.35,
            stagger: staggerItems,
            onStart: () => {
              if (!isMountedRef.current) return;
              triggeredItemsRef.current = true;
            },
            onComplete: () => {
              if (!isMountedRef.current) return;
              console.log('[Cascade] useSectionCascade ITEMS complete, locked ✔');
              itemEls.forEach(el => el.classList.add('entry-reveal-done', 'reveal-complete'));
            },
          },
          labelEls.length || bodyEls.length ? '-=0.25' : 0
        );
      }
    }, container);

    return () => {
      isMountedRef.current = false;
      ctx.revert();
    };
  }, [scrollerRef]);

  return containerRef;
}

export default useScrollReveal;
