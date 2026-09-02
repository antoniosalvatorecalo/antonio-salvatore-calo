/**
 * AnimationProvider — ScrollTrigger Integration
 *
 * Only creates ScrollTrigger instances and calls markVisible.
 * No pre-warm, no already-visible logic, no queue.
 * The cascade is driven by:
 *   1. ScrollTrigger.onEnter → markVisible
 *   2. markComplete → _advance → next=visible → registerPlayFn late-binding
 *
 * Execution order guarantee:
 *   AnimationProvider.useLayoutEffect runs FIRST → creates ScrollTriggers
 *   Children's useLayoutEffect runs AFTER → registerPlayFn calls
 *   ScrollTrigger fires when user scrolls → markVisible triggers play
 */

import { useLayoutEffect, type ReactNode } from 'react';
import { ScrollTrigger } from '@/lib/gsap-setup';
import { useScroll } from '@/providers/ScrollProvider';
import { orchestrator, SECTIONS } from './orchestrator';

interface AnimationProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

export function AnimationProvider({ children, enabled = true }: AnimationProviderProps) {
  const { leftScrollRef, activeTab, isDesktop } = useScroll();

  useLayoutEffect(() => {
    if (!enabled) return;

    const scroller = leftScrollRef.current;
    if (!scroller) return;

    orchestrator.reset();

    const triggers: ScrollTrigger[] = [];

    // Create ScrollTrigger for every standard section
    // Hero is 'instant' — just mark visible directly, no ST needed
    SECTIONS.filter((id) => id !== 'hero').forEach((id) => {
      const el = document.querySelector(`[data-section="${id}"]`);
      if (!el) return;

      const isContact = id === 'contact';
      const st = ScrollTrigger.create({
        trigger: el,
        scroller,
        start: isContact ? 'top 95%' : 'top 90%',
        once: true,
        invalidateOnRefresh: true,
        onEnter: () => {
          orchestrator.markVisible(id);
        },
      });

      triggers.push(st);
    });

    // Hero is instant — always mark done so bio can start when its ST fires
    // If no hero element exists (e.g. home without photo), cascade still works
    orchestrator.markVisible('hero');

    ScrollTrigger.refresh();

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [leftScrollRef, enabled, activeTab, isDesktop]);

  return <>{children}</>;
}
