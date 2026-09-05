import { useLayoutEffect } from 'react';

const SCROLL_KEYS = new Set([' ', 'Enter', 'Tab', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']);

export function useTransitionInputLock(active: boolean) {
  useLayoutEffect(() => {
    if (!active) return;
    document.documentElement.dataset.projectTransition = 'active';

    const blockPointer = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const blockScroll = (event: Event) => event.preventDefault();
    const blockKeyboard = (event: KeyboardEvent) => {
      if (!event.metaKey && !event.ctrlKey && !event.altKey && SCROLL_KEYS.has(event.key)) blockPointer(event);
    };

    window.addEventListener('pointerdown', blockPointer, true);
    window.addEventListener('click', blockPointer, true);
    window.addEventListener('wheel', blockScroll, { capture: true, passive: false });
    window.addEventListener('touchmove', blockScroll, { capture: true, passive: false });
    window.addEventListener('keydown', blockKeyboard, true);

    return () => {
      delete document.documentElement.dataset.projectTransition;
      window.removeEventListener('pointerdown', blockPointer, true);
      window.removeEventListener('click', blockPointer, true);
      window.removeEventListener('wheel', blockScroll, true);
      window.removeEventListener('touchmove', blockScroll, true);
      window.removeEventListener('keydown', blockKeyboard, true);
    };
  }, [active]);
}
