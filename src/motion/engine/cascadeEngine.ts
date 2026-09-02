import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-setup';
import { cascadePresets } from '@/motion/presets/presets';
import type { CascadeOptions } from '@/motion/constants/types';

const DEFAULT_SCROLLER = '.left-scroll-container';

/** Splits element text into word spans */
function buildBlurWords(el: HTMLElement): HTMLElement[] {
  const raw = (el.innerText || '').trim();
  if (!raw) return [];

  el.innerHTML = '';
  const words = raw.split(/\s+/).filter(Boolean);

  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'blur-word';
    span.style.display = 'inline';
    span.textContent = word;
    el.appendChild(span);
    if (i < words.length - 1) {
      el.appendChild(document.createTextNode(' '));
    }
  });

  return Array.from(el.querySelectorAll<HTMLElement>('.blur-word'));
}

export function useCascadeEngine(
  ref: React.RefObject<HTMLElement | null>,
  options: CascadeOptions = {}
) {
  const {
    preset = 'default',
    staggerBase = 0.05,
    depthFactor = 0.03,
    once = true,
    scroller: explicitScroller,
  } = options;

  const triggeredRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (triggeredRef.current) return;
    triggeredRef.current = true;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollerEl = explicitScroller
      ?? (document.querySelector(DEFAULT_SCROLLER) as HTMLElement | null)
      ?? undefined;

    const cfg = cascadePresets[preset];

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        const sections = el.querySelectorAll<HTMLElement>('[data-cascade="item"]');
        const blurTexts = el.querySelectorAll<HTMLElement>('[data-blur-text]');
        gsap.set(sections, { opacity: 1, y: 0 });
        gsap.set(blurTexts, { opacity: 1 });
        blurTexts.forEach((bt) => {
          bt.innerHTML = bt.innerText || '';
        });
        return;
      }

      const sections = Array.from(
        el.querySelectorAll<HTMLElement>('[data-cascade="item"]')
      );

      if (!sections.length) return;

      sections.sort(
        (a, b) =>
          Number(a.dataset.cascadeDepth ?? 0) -
          Number(b.dataset.cascadeDepth ?? 0)
      );

      // Build blur-word spans first
      const blurTextEls = Array.from(
        el.querySelectorAll<HTMLElement>('[data-blur-text]')
      );

      const blurWordsByItem: Map<HTMLElement, HTMLElement[]> = new Map();

      blurTextEls.forEach((bt) => {
        const parent = bt.closest<HTMLElement>('[data-cascade="item"]');
        if (!parent) return;

        const spans = buildBlurWords(bt);
        spans.forEach((s) => {
          s.style.opacity = '0';
          s.style.filter = `blur(${cfg.blur}px)`;
        });

        const existing = blurWordsByItem.get(parent) ?? [];
        existing.push(...spans);
        blurWordsByItem.set(parent, existing);
      });

      // Hidden state
      gsap.set(sections, {
        opacity: 0,
        y: cfg.y,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          scroller: scrollerEl,
          start: 'top 80%',
          once,
          invalidateOnRefresh: true,
        },
      });

      // Reveal cascade items
      sections.forEach((s, i) => {
        const depth = Number(s.dataset.cascadeDepth ?? 0);
        const pos = i * staggerBase + depth * depthFactor;

        tl.to(
          s,
          {
            opacity: 1,
            y: 0,
            duration: cfg.duration,
            ease: cfg.ease,
          },
          pos
        );

        // Word blur cascade inside this item — fires after item reveal
        const itemWords = blurWordsByItem.get(s) ?? [];
        if (itemWords.length) {
          tl.to(
            itemWords,
            {
              opacity: 1,
              filter: 'blur(0px)',
              duration: 0.65,
              ease: 'power2.out',
            },
            `${pos}+=0.15`
          );
        }
      });
    }, el);

    return () => ctx.revert();
  }, [ref, preset, staggerBase, depthFactor, once, explicitScroller]);
}
