/**
 * useSmoothScroll
 * Per-column Lenis integration.
 *
 * Production-hardened:
 * - Singleton LenisManager — no double init
 * - MutationObserver for .scroll-content DOM readiness (no race)
 * - StrictMode-safe: initializedRef guard prevents double execution
 * - cleanup via gsap.ticker.remove (registered in useEffect)
 * - RAF loop lives entirely inside useEffect — no module-level side effects
 *
 * Architectural rules enforced:
 * - NO hook called inside GSAP callbacks
 * - NO hook called inside MutationObserver callbacks
 * - NO hook called in Lenis init (which is module-level)
 * - All hook invocations happen ONLY during component render / useEffect
 */

import { useEffect, useRef } from 'react';
import { initLenis, destroyLenis } from '../../lib/lenis-manager';
import { ScrollTrigger } from '../../lib/gsap-setup';
import { logMotionDev } from '../../lib/motion-dev-diagnostics';

const SCROLL_CONTENT_SELECTOR = '.scroll-content';
const INIT_TIMEOUT_MS = 1500;

interface SmoothScrollOptions {
  enabled?: boolean;
}

export function useSmoothScroll(
  wrapperRef: React.RefObject<HTMLElement | null>,
  { enabled = true }: SmoothScrollOptions = {},
) {
  const initializedRef = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const initTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initCleanupRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (initializedRef.current) {
      logMotionDev('useSmoothScroll', 'init-skipped-already-initialized');
      return;
    }

    isMountedRef.current = true;
    let resolved = false;

    const doInit = (content: HTMLElement) => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      try {
        initLenis(wrapper, content);
        logMotionDev('useSmoothScroll', 'lenis-init-success');
      } catch (err) {
        console.error('[ScrollSystem] Lenis init FAILED:', err);
        wrapper.classList.add('lenis-fallback');
        initializedRef.current = false;
        logMotionDev('useSmoothScroll', 'lenis-init-failed');
        return;
      }

      ScrollTrigger.refresh();

      const refreshTimer = setTimeout(() => {
        if (!isMountedRef.current) return;
        ScrollTrigger.refresh();
      }, 200);

      initCleanupRef.current = () => {
        clearTimeout(refreshTimer);
        destroyLenis(wrapper);
        initializedRef.current = false;
        logMotionDev('useSmoothScroll', 'lenis-destroyed');
      };
    };

    // Find .scroll-content — the actual scrollable element
    const content = wrapper.querySelector(SCROLL_CONTENT_SELECTOR) as HTMLElement | null;

    if (content) {
      // .scroll-content already exists — init immediately
      doInit(content);
    } else {
      // .scroll-content not found yet — use MutationObserver to wait
      console.warn('[ScrollSystem] .scroll-content NOT found, waiting for DOM...');
      logMotionDev('useSmoothScroll', 'waiting-for-scroll-content');

      const timeout = setTimeout(() => {
        if (resolved || !isMountedRef.current) return;
        resolved = true;
        console.warn('[ScrollSystem] .scroll-content timeout — native scroll fallback');
        wrapper.classList.add('lenis-fallback');
        wrapper.dispatchEvent(new CustomEvent('lenis-init-failed'));
        logMotionDev('useSmoothScroll', 'scroll-content-timeout');
      }, INIT_TIMEOUT_MS);

      initTimeoutRef.current = timeout;

      const observer = new MutationObserver((mutations, obs) => {
        for (const m of mutations) {
          for (const added of m.addedNodes) {
            if (added.nodeType !== Node.ELEMENT_NODE) continue;
            const el = added as HTMLElement;
            if (el.matches(SCROLL_CONTENT_SELECTOR) || el.querySelector(SCROLL_CONTENT_SELECTOR)) {
              resolved = true;
              obs.disconnect();
              clearTimeout(timeout);
              const scrollContent = el.matches(SCROLL_CONTENT_SELECTOR)
                ? el
                : (el.querySelector(SCROLL_CONTENT_SELECTOR) as HTMLElement);
              if (scrollContent) doInit(scrollContent);
              return;
            }
          }
        }
      });

      observer.observe(wrapper, { childList: true, subtree: false });
      observerRef.current = observer;
    }

    return () => {
      isMountedRef.current = false;

      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }

      if (initCleanupRef.current) {
        initCleanupRef.current();
        initCleanupRef.current = null;
      } else {
        initializedRef.current = false;
      }

      logMotionDev('useSmoothScroll', 'effect-cleanup-complete');
    };
  }, [wrapperRef, enabled]);
}

export default useSmoothScroll;
