import { useEffect, useRef } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  enabled?: boolean;
}

type SwipeAxis = 'undecided' | 'x' | 'y';

const AXIS_LOCK_DISTANCE = 12;
const Y_AXIS_DOMINANCE = 1.15;
const X_AXIS_DOMINANCE = 1.25;

export const useSwipeNavigation = (
  containerRef: React.RefObject<HTMLElement | null>,
  { onSwipeLeft, onSwipeRight, threshold = 50, enabled = true }: SwipeHandlers,
) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const axis = useRef<SwipeAxis>('undecided');

  useEffect(() => {
    if (!enabled) return;
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      axis.current = 'undecided';
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (axis.current !== 'undecided') return;

      const deltaX = e.touches[0].clientX - startX.current;
      const deltaY = e.touches[0].clientY - startY.current;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (Math.max(absX, absY) < AXIS_LOCK_DISTANCE) return;

      if (absY > absX * Y_AXIS_DOMINANCE) {
        axis.current = 'y';
      } else if (absX > absY * X_AXIS_DOMINANCE) {
        axis.current = 'x';
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - startX.current;
      const deltaY = e.changedTouches[0].clientY - startY.current;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (axis.current === 'undecided') {
        axis.current = absX > absY * X_AXIS_DOMINANCE ? 'x' : 'y';
      }

      if (axis.current !== 'x' || absX < threshold) {
        axis.current = 'undecided';
        return;
      }

      if (deltaX < 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }

      axis.current = 'undecided';
    };

    const handleTouchCancel = () => {
      axis.current = 'undecided';
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [enabled, onSwipeLeft, onSwipeRight, threshold, containerRef]);
};
