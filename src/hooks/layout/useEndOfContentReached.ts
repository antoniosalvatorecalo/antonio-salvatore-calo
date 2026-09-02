import { useEffect, useState } from 'react';

/**
 * useEndOfContentReached
 *
 * Returns `true` once the user has scrolled to (or near) the bottom of any
 * scrollable region inside the document. Works with:
 *   - native window scroll (when html/body are scrollable)
 *   - native scrollable containers (overflow-y: auto / scroll)
 *   - Lenis-driven containers — same DOM contract (scrollTop + scrollHeight)
 *
 * Detection strategy:
 *   - On mount, find all candidates (`window` + every element matching
 *     `[data-footer-sentinel]` and every `overflow-y-auto/scroll` descendant
 *     of `[data-scroll-root]`).
 *   - Subscribe to the `scroll` event on each candidate and re-check on every
 *     resize.
 *   - A region is considered "at end" when
 *     `scrollTop + clientHeight >= scrollHeight - threshold`.
 *
 * The flag is `false` on mount so the footer stays hidden until the user has
 * actually interacted with the page (matching the requested behaviour).
 */
export function useEndOfContentReached(threshold = 96): boolean {
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const compute = () => {
      const win = window as Window & typeof globalThis;

      // 1) Window-level scroll (used by pages without nested scrollers).
      const docEl = document.documentElement;
      const body = document.body;
      const windowScrollable =
        docEl.scrollHeight > win.innerHeight + 1 ||
        body.scrollHeight > win.innerHeight + 1;

      if (windowScrollable) {
        const scrolled =
          win.scrollY ||
          docEl.scrollTop ||
          body.scrollTop ||
          0;
        const total =
          docEl.scrollHeight ||
          body.scrollHeight ||
          0;
        if (scrolled + win.innerHeight >= total - threshold) {
          setAtEnd(true);
          return;
        }
      }

      // 2) Nested scrollable containers — anything with overflow-y auto/scroll.
      const candidates: HTMLElement[] = [];
      const rootAttr = '[data-scroll-root]';
      const roots = document.querySelectorAll<HTMLElement>(rootAttr);
      roots.forEach((root) => {
        root
          .querySelectorAll<HTMLElement>(
            '.overflow-y-auto, .overflow-y-scroll, [data-scroll-content], .scroll-content, .right-scroll-container',
          )
          .forEach((el) => candidates.push(el));
      });

      // Also scan for sentinels — explicit end-of-page markers pages can opt into.
      const sentinels = document.querySelectorAll<HTMLElement>(
        '[data-footer-sentinel]',
      );

      for (const el of candidates) {
        const { scrollTop, scrollHeight, clientHeight } = el;
        if (scrollHeight <= clientHeight + 1) continue;
        if (scrollTop + clientHeight >= scrollHeight - threshold) {
          setAtEnd(true);
          return;
        }
      }

      for (const sentinel of sentinels) {
        const rect = sentinel.getBoundingClientRect();
        const viewH = window.innerHeight;
        if (rect.top <= viewH - threshold) {
          setAtEnd(true);
          return;
        }
      }

      setAtEnd(false);
    };

    // Run once after layout settles (cover lazy children + Lenis init).
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(compute);
    });

    const onScroll = () => compute();
    const onResize = () => compute();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // Listen on every candidate too (capture phase — bubbles don't always
    // bubble from Lenis-injected scroll handlers).
    const candidates = document.querySelectorAll<HTMLElement>(
      '[data-scroll-root] .overflow-y-auto, [data-scroll-root] .overflow-y-scroll, [data-scroll-content], .scroll-content, .right-scroll-container',
    );
    candidates.forEach((el) => {
      el.addEventListener('scroll', onScroll, { passive: true });
    });

    // Re-check after a short delay (font load, ScrollTrigger.refresh, etc.)
    const timer = setTimeout(compute, 400);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      candidates.forEach((el) => {
        el.removeEventListener('scroll', onScroll);
      });
    };
  }, [threshold]);

  return atEnd;
}

export default useEndOfContentReached;