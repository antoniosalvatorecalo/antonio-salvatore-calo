import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap-setup';
import { useReducedMotionPreference } from '../../providers/MotionPreferenceProvider';

export interface EntranceRevealPhase {
  selector: string;
  y?: number;
  blur?: number;
  duration?: number;
  ease?: string;
  stagger?: number | gsap.TweenVars['stagger'];
  at?: number | string;
}

export interface EntranceRevealOptions {
  selector?: string;
  triggerRef?: RefObject<HTMLElement | null>;
  scrollerRef?: RefObject<HTMLElement | null>;
  delay?: number;
  stagger?: number;
  duration?: number;
  ease?: string;
  y?: number;
  blur?: number;
  threshold?: number;
  start?: string;
  once?: boolean;
  disabled?: boolean;
  phases?: EntranceRevealPhase[];
}

const COMPLETE_CLASS = 'entrance-reveal-complete';

function getRevealTargets(container: HTMLElement, selector: string): HTMLElement[] {
  const descendants = Array.from(container.querySelectorAll<HTMLElement>(selector));
  const targets = container.matches(selector) ? [container, ...descendants] : descendants;

  return targets.filter(
    (el) =>
      !el.dataset.entranceSkip &&
      !el.classList.contains(COMPLETE_CLASS) &&
      !el.classList.contains('entry-reveal-done') &&
      !el.classList.contains('reveal-complete')
  );
}

export function useEntranceReveal<T extends HTMLElement = HTMLDivElement>(
  containerRef: RefObject<T | null>,
  {
    selector = '[data-entrance-item]',
    triggerRef,
    scrollerRef,
    delay = 0,
    stagger = 0.08,
    duration = 0.72,
    ease = 'power3.out',
    y = 18,
    blur = 10,
    threshold = 0.15,
    start,
    once = true,
    disabled = false,
    phases,
  }: EntranceRevealOptions = {}
) {
  const prefersReducedMotion = useReducedMotionPreference();

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const startPosition = start ?? `top ${Math.round((1 - threshold) * 100)}%`;
    const finalState = { opacity: 1, y: 0, filter: 'blur(0px)', clearProps: 'willChange' };

    let ctx: gsap.Context | null = null;
    let ownedTimeline: gsap.core.Timeline | null = null;
    let ownedScrollTrigger: ScrollTrigger | null = null;
    const setupDelay = scrollerRef ? 50 : 0;

    const usePhases = Array.isArray(phases) && phases.length > 0;

    if (usePhases) {
      const resolvedPhases = phases
        .map((phase) => ({
          ...phase,
          targets: getRevealTargets(container, phase.selector),
        }))
        .filter((phase) => phase.targets.length > 0);

      if (!resolvedPhases.length) return;

      const uniqueTargets = Array.from(
        new Set(resolvedPhases.flatMap((phase) => phase.targets))
      );

      if (prefersReducedMotion) {
        gsap.set(uniqueTargets, { ...finalState, duration: 0 });
        uniqueTargets.forEach((el) => el.classList.add(COMPLETE_CLASS));
        return;
      }

      const setupTimer = window.setTimeout(() => {
        ctx = gsap.context(() => {
          ownedTimeline = gsap.timeline({
            delay,
            scrollTrigger: {
              trigger: triggerRef?.current ?? container,
              scroller: scrollerRef?.current ?? undefined,
              start: startPosition,
              once,
              invalidateOnRefresh: true,
            },
          });
          ownedScrollTrigger = ownedTimeline.scrollTrigger ?? null;

          resolvedPhases.forEach((phase, index) => {
            const phaseY = phase.y ?? y;
            const phaseBlur = phase.blur ?? blur;
            const phaseDuration = phase.duration ?? duration;
            const phaseEase = phase.ease ?? ease;
            const phaseStagger = phase.stagger ?? stagger;
            const phasePosition = phase.at ?? (index === 0 ? 0 : '>');

            gsap.set(phase.targets, {
              opacity: 0,
              y: phaseY,
              filter: phaseBlur > 0 ? `blur(${phaseBlur}px)` : 'blur(0px)',
              willChange: 'opacity, transform, filter',
            });

            ownedTimeline?.to(
              phase.targets,
              {
                ...finalState,
                duration: phaseDuration,
                ease: phaseEase,
                stagger: phaseStagger,
              },
              phasePosition
            );
          });

          ownedTimeline?.eventCallback('onComplete', () => {
            uniqueTargets.forEach((el) => el.classList.add(COMPLETE_CLASS));
          });
        }, container);
        ScrollTrigger.refresh();
      }, setupDelay);

      return () => {
        window.clearTimeout(setupTimer);
        ownedTimeline?.kill();
        ownedTimeline = null;
        ownedScrollTrigger?.kill();
        ownedScrollTrigger = null;
        ctx?.revert();
        ctx = null;
      };
    }

    const targets = getRevealTargets(container, selector);
    if (!targets.length) return;

    if (prefersReducedMotion) {
      gsap.set(targets, { ...finalState, duration: 0 });
      targets.forEach((el) => el.classList.add(COMPLETE_CLASS));
      return;
    }

    const setupTimer = window.setTimeout(() => {
      ctx = gsap.context(() => {
        gsap.set(targets, {
          opacity: 0,
          y,
          filter: blur > 0 ? `blur(${blur}px)` : 'blur(0px)',
          willChange: 'opacity, transform, filter',
        });

        const tween = gsap.to(targets, {
          ...finalState,
          delay,
          duration,
          ease,
          stagger,
          scrollTrigger: {
            trigger: triggerRef?.current ?? container,
            scroller: scrollerRef?.current ?? undefined,
            start: startPosition,
            once,
            invalidateOnRefresh: true,
          },
          onComplete: () => {
            targets.forEach((el) => el.classList.add(COMPLETE_CLASS));
          },
        });
        ownedScrollTrigger = tween.scrollTrigger ?? null;
      }, container);
      ScrollTrigger.refresh();
    }, setupDelay);

    return () => {
      window.clearTimeout(setupTimer);
      ownedScrollTrigger?.kill();
      ownedScrollTrigger = null;
      ctx?.revert();
      ctx = null;
    };
  }, [
    containerRef,
    selector,
    triggerRef,
    scrollerRef,
    delay,
    stagger,
    duration,
    ease,
    y,
    blur,
    threshold,
    start,
    once,
    disabled,
    phases,
    prefersReducedMotion,
  ]);
}

export default useEntranceReveal;
