import { gsap } from '@/lib/gsap-setup';

export const TEXT_MOTION = {
  enterDuration: 0.68,
  exitDuration: 0.42,
  stagger: 0.05,
  routeOverlap: 0.14,
  enterEase: 'power4.out',
  exitEase: 'power3.inOut',
  enterOpacity: 0.72,
} as const;

const TARGET_SELECTOR = '[data-motion-text]';

export function getTextMotionTargets(...roots: Array<ParentNode | null | undefined>) {
  return roots
    .flatMap((root) =>
      root ? Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTOR)) : [],
    )
    .filter((target, index, targets) => targets.indexOf(target) === index)
    .sort((a, b) => Number(a.dataset.motionOrder ?? 0) - Number(b.dataset.motionOrder ?? 0));
}

export function setTextMotionVisible(targets: HTMLElement[]) {
  gsap.set(targets, {
    clipPath: 'inset(0 0 0% 0)',
    y: 0,
    opacity: 1,
    clearProps: 'willChange',
  });
}

export function setTextMotionHidden(targets: HTMLElement[], mobile: boolean) {
  gsap.set(targets, {
    clipPath: 'inset(0 0 100% 0)',
    y: mobile ? 10 : 18,
    opacity: TEXT_MOTION.enterOpacity,
    willChange: 'clip-path, transform, opacity',
  });
}

export function createTextEnterTimeline(
  targets: HTMLElement[],
  { delay = 0, mobile = false, reducedMotion = false } = {},
) {
  const timeline = gsap.timeline({ delay });
  if (!targets.length || reducedMotion) {
    setTextMotionVisible(targets);
    return timeline;
  }

  setTextMotionHidden(targets, mobile);
  return timeline.to(targets, {
    clipPath: 'inset(0 0 0% 0)',
    y: 0,
    opacity: 1,
    duration: TEXT_MOTION.enterDuration,
    ease: TEXT_MOTION.enterEase,
    stagger: mobile ? TEXT_MOTION.stagger * 0.8 : TEXT_MOTION.stagger,
    clearProps: 'willChange',
  });
}

export function createTextExitTimeline(
  targets: HTMLElement[],
  { mobile = false, reducedMotion = false } = {},
) {
  const timeline = gsap.timeline();
  if (!targets.length || reducedMotion) {
    gsap.set(targets, { opacity: 0 });
    return timeline;
  }

  return timeline.to(targets, {
    clipPath: 'inset(0 0 100% 0)',
    y: mobile ? -8 : -12,
    opacity: TEXT_MOTION.enterOpacity,
    duration: TEXT_MOTION.exitDuration,
    ease: TEXT_MOTION.exitEase,
    stagger: TEXT_MOTION.stagger * 0.6,
    willChange: 'clip-path, transform, opacity',
  });
}
