/**
 * LenisManager
 * Singleton service — 100% outside React lifecycle.
 * React renders UI only.
 * GSAP animates DOM only.
 * Lenis controls scroll only.
 *
 * StrictMode-safe via module-level singleton Map.
 * Multiple components can call init/getInstance — only first init wins.
 */

import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap-setup';
import { logMotionDev } from './motion-dev-diagnostics';

interface LenisBinding {
  instance: Lenis;
  rafCallback: (time: number) => void;
  offScroll: (() => void) | null;
}

// Global singleton Map — keyed by wrapper element
const lenisInstances = new Map<HTMLElement, LenisBinding>();

export function initLenis(wrapper: HTMLElement, content: HTMLElement): Lenis {
  // If already initialized on this wrapper, return existing
  const existing = lenisInstances.get(wrapper);
  if (existing) {
    logMotionDev('lenis-manager', 'init-reused-existing-instance', { activeInstances: lenisInstances.size });
    return existing.instance;
  }

  const lenisInstance = new Lenis({
    wrapper,
    content,
    duration: 1.2,
    lerp: 0.1,
    smoothWheel: true,
    infinite: false,
  });

  // RAF loop bound to GSAP ticker
  const rafCallback = (time: number) => {
    lenisInstance.raf(time * 1000);
  };
  gsap.ticker.add(rafCallback);

  // Lenis scroll -> ScrollTrigger update
  const offScroll = lenisInstance.on('scroll', () => {
    ScrollTrigger.update();
  });

  lenisInstances.set(wrapper, {
    instance: lenisInstance,
    rafCallback,
    offScroll: typeof offScroll === 'function' ? offScroll : null,
  });

  logMotionDev('lenis-manager', 'init-created-instance', { activeInstances: lenisInstances.size });
  return lenisInstance;
}

export function getLenisInstance(wrapper: HTMLElement): Lenis | undefined {
  return lenisInstances.get(wrapper)?.instance;
}

/**
 * Refresh all active Lenis instances — call after layout shifts, route transitions,
 * or when column visibility changes (e.g., mobile tab switch).
 */
export function refreshAllLenises(): void {
  lenisInstances.forEach((binding) => {
    binding.instance.resize();
  });
  logMotionDev('lenis-manager', 'refresh-all-instances', { activeInstances: lenisInstances.size });
}

export function destroyLenis(wrapper: HTMLElement): void {
  const binding = lenisInstances.get(wrapper);
  if (!binding) {
    logMotionDev('lenis-manager', 'destroy-noop-missing-instance', { activeInstances: lenisInstances.size });
    return;
  }

  gsap.ticker.remove(binding.rafCallback);
  binding.offScroll?.();
  binding.instance.destroy();
  lenisInstances.delete(wrapper);
  logMotionDev('lenis-manager', 'destroyed-instance', { activeInstances: lenisInstances.size });
}
