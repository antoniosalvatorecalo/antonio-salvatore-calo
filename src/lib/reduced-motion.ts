import type { TargetAndTransition, Transition } from 'motion/react';
import { gsap } from './gsap-setup';

export const instantTransition: Transition = { duration: 0 };

export const finalMotionProps = (finalState: TargetAndTransition) => ({
  initial: finalState,
  animate: finalState,
  exit: finalState,
  transition: instantTransition,
});

export const runOrSetFinal = <T extends gsap.TweenTarget>(
  reducedMotion: boolean,
  targets: T,
  finalState: gsap.TweenVars,
  animate: () => void,
) => {
  if (reducedMotion) {
    gsap.set(targets, { ...finalState, duration: 0 });
    return;
  }

  animate();
};
