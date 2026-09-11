import type { MouseEvent } from 'react';

export function shouldEnhanceNavigation(event: MouseEvent<HTMLElement>): boolean {
  return event.button === 0 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
}
