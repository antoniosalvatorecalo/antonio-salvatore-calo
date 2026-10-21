/** Shared result-switch motion used by the Home and project media galleries. */
export const GALLERY_FILTER_PRESENCE_MODE = 'wait' as const;

const GALLERY_FILTER_EASE = [0.22, 1, 0.36, 1] as const;

export function getGalleryFilterMotion(reducedMotion: boolean) {
  return {
    initial: reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: reducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 },
    transition: {
      duration: reducedMotion ? 0 : 0.38,
      ease: GALLERY_FILTER_EASE,
    },
  };
}
