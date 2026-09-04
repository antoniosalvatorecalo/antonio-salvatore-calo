export const TRANSITION_DURATION = {
  GRID_EXIT: 0.5,
  CAROUSEL_ENTER: 0.6,
  ABOUT_FADE: 0.4,
} as const;

export const TRANSITION_EASE = {
  GRID_EXIT: 'power3.inOut',
  CAROUSEL_ENTER: 'power3.out',
  CAROUSEL_EXIT: 'power3.in',
} as const;
