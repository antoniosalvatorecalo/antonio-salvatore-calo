import { Easing, Transition } from "motion/react";

export const EASE_PREMIUM: Easing = [0.16, 1, 0.3, 1];
export const EASE_CINEMATIC: Easing = [0.85, 0, 0.15, 1];

export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30
};

export const SPRING_CURSOR: Transition = {
  type: "spring",
  stiffness: 150,
  damping: 15
};

export const MOTION_MICRO = {
  duration: 0.22,
  ease: 'power3.out',
} as const;

export const MOTION_SECTION = {
  duration: 0.62,
  ease: 'power4.out',
} as const;

export const MOTION_PAGE = {
  duration: 0.46,
  ease: 'power4.inOut',
} as const;
