/**
 * GSAP Integration Layer
 * Connects GSAP timelines to the orchestrator's late-binding playFn system.
 * Provides execution layer that wraps GSAP and integrates with the state machine.
 */

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-setup';
import { orchestrator, SectionId, SectionState } from './orchestrator';

/** Options for creating an orchestrated timeline */
export interface CreateOptions {
  /** Start in paused state (default: true) */
  paused?: boolean;
  /** Callback when timeline completes */
  onComplete?: () => void;
  /** Callback when timeline starts playing */
  onStart?: () => void;
  /** Callback when timeline is paused */
  onPause?: () => void;
  /** Timeline label for debugging */
  label?: string;
}

/** Wrapper around a GSAP timeline with orchestrator integration */
export interface TimelineWrapper {
  timeline: gsap.core.Timeline;
  ctx: gsap.Context;
  play: () => void;
  pause: () => void;
  kill: () => void;
}

/** Main interface for orchestrated timeline management */
export interface OrchestratedTimeline {
  create: (sectionId: SectionId, options?: CreateOptions) => TimelineWrapper;
  cleanup: (sectionId: SectionId) => void;
}

/**
 * Register a GSAP timeline with the orchestrator.
 * Handles late-binding: if section is already visible, plays immediately.
 * If not yet visible, registers playFn for later trigger.
 */
export function registerTimeline(
  sectionId: SectionId,
  tl: gsap.core.Timeline,
  ctx: gsap.Context
): () => void {
  // Register playFn with orchestrator (late-binding)
  orchestrator.registerPlayFn(sectionId, () => {
    // Only execute if status is 'visible' (idempotent in orchestrator)
    // The orchestrator already gates this, but we double-check for safety
    if (orchestrator.getStatus(sectionId) === 'visible') {
      tl.restart(); // restart ensures replayability on back-navigation
    }
  });

  // Set up onComplete to trigger orchestrator's markComplete
  tl.eventCallback('onComplete', () => {
    orchestrator.markComplete(sectionId);
  });

  // Set up onStart to update status if needed
  tl.eventCallback('onStart', () => {
    // Status is already 'playing' from orchestrator, but we ensure sync
  });

  // Return cleanup function
  return () => {
    orchestrator.deregisterPlayFn(sectionId);
    ctx.revert();
  };
}

/**
 * Create and register a timeline in one call.
 * Uses gsap.context for proper cleanup in React.
 * 
 * @param sectionId - Section identifier for orchestrator
 * @param scope - DOM element or React ref to scope the animation
 * @param buildTimeline - Function to build the timeline with GSAP tweens
 * @param options - Configuration options
 * @returns TimelineWrapper with timeline, context, and control methods
 */
export function createOrchestratedTimeline(
  sectionId: SectionId,
  scope: HTMLElement | null,
  buildTimeline: (tl: gsap.core.Timeline) => void,
  options: CreateOptions = {}
): TimelineWrapper {
  if (!scope) {
    throw new Error('[GSAP] createOrchestratedTimeline: scope is null or undefined');
  }

  // Create timeline first, then use gsap.context for cleanup
  const timeline = gsap.timeline({
    paused: options.paused ?? true,
    onComplete: options.onComplete,
    onStart: options.onStart,
    onPause: options.onPause,
    label: options.label,
  });

  buildTimeline(timeline);

  // Use gsap.context for proper cleanup within scope
  const ctx = gsap.context(() => {
    // Empty - timeline already built, context just handles cleanup
  }, scope);

  // Register with orchestrator
  const cleanup = registerTimeline(sectionId, timeline, ctx);

  // Play method triggers orchestrator visibility (which handles gating)
  const play = () => {
    orchestrator.markVisible(sectionId);
  };

  // Pause method
  const pause = () => {
    timeline.pause();
  };

  // Kill method for full cleanup
  const kill = () => {
    cleanup();
    ctx.revert();
    timeline.kill();
  };

  return {
    timeline,
    ctx,
    play,
    pause,
    kill,
  };
}

/**
 * React hook for orchestrated animations.
 * Automatically handles registration and cleanup.
 * 
 * @param sectionId - Section identifier for orchestrator
 * @param scope - React ref to the DOM element
 * @param buildTimeline - Function to build the timeline with GSAP tweens
 * @returns Current section status
 */
export function useOrchestratedAnimation(
  sectionId: SectionId,
  scope: React.RefObject<HTMLElement | null>,
  buildTimeline: (tl: gsap.core.Timeline) => void
): SectionState {
  const wrapperRef = useRef<TimelineWrapper | null>(null);
  const [status, setStatus] = useState<SectionState>('idle');

  // Update status when orchestrator state changes
  useEffect(() => {
    const currentStatus = orchestrator.getStatus(sectionId);
    setStatus(currentStatus);

    // Optional: listen for changes (can add more sophisticated reactivity)
    const interval = setInterval(() => {
      const newStatus = orchestrator.getStatus(sectionId);
      if (newStatus !== status) {
        setStatus(newStatus);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [sectionId]);

  // Create timeline on mount or when dependencies change
  useEffect(() => {
    const scopeEl = scope.current;
    if (!scopeEl) return;

    // Clean up any existing wrapper
    if (wrapperRef.current) {
      wrapperRef.current.kill();
    }

    // Create new orchestrated timeline
    wrapperRef.current = createOrchestratedTimeline(
      sectionId,
      scopeEl,
      buildTimeline
    );

    // Cleanup on unmount or dependency change
    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.kill();
        wrapperRef.current = null;
      }
    };
  }, [sectionId, scope, buildTimeline.toString()]); // toString for function equality

  return status;
}

/**
 * Hook for sections that use ScrollTrigger-based visibility.
 * Marks section as visible when ScrollTrigger fires.
 * 
 * @param sectionId - Section identifier
 * @param triggerRef - Ref to the trigger element
 * @param options - ScrollTrigger options
 */
export function useScrollTriggerVisibility(
  sectionId: SectionId,
  triggerRef: React.RefObject<HTMLElement | null>,
  options: {
    start?: string;
    end?: string;
    onEnter?: () => void;
    onLeave?: () => void;
  } = {}
): void {
  const triggerRef_safe = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    // Create ScrollTrigger to detect visibility
    const st = ScrollTrigger.create({
      trigger: el,
      start: options.start ?? 'top 80%',
      end: options.end ?? 'bottom 20%',
      onEnter: () => {
        orchestrator.markVisible(sectionId);
        options.onEnter?.();
      },
      onLeave: options.onLeave,
      once: false, // Allow re-triggering for replay
    });

    triggerRef_safe.current = st;

    return () => {
      st.kill();
      triggerRef_safe.current = null;
    };
  }, [sectionId, triggerRef, options.start, options.end]);
}

/**
 * Check if a section can currently play.
 * Useful for conditional logic in animations.
 */
export function canSectionPlay(sectionId: SectionId): boolean {
  return orchestrator.getStatus(sectionId) === 'visible';
}

/**
 * Get the current status of a section.
 */
export function getSectionStatus(sectionId: SectionId): SectionState {
  return orchestrator.getStatus(sectionId);
}

/**
 * Reset all orchestrator state.
 * Call this on route changes to reset the animation sequence.
 */
export function resetOrchestrator(): void {
  orchestrator.reset();
}

/**
 * Create a deferred timeline that only starts when orchestrator allows.
 * Useful for complex animations that need to coordinate with scroll.
 */
export function createDeferredTimeline(
  sectionId: SectionId,
  scope: HTMLElement | null,
  buildTimeline: (tl: gsap.core.Timeline) => void,
  options: CreateOptions = {}
): TimelineWrapper {
  const wrapper = createOrchestratedTimeline(sectionId, scope, buildTimeline, {
    ...options,
    paused: true, // Always start paused, wait for orchestrator
  });

  return wrapper;
}

/**
 * Animation builder helper for common patterns.
 * Provides a fluent API for building timelines.
 */
export function createTimelineBuilder(tl: gsap.core.Timeline) {
  return {
    tl,

    /** Add a simple tween */
    fadeIn(
      target: gsap.TweenTarget,
      duration: number = 0.6,
      options: gsap.TweenVars = {}
    ) {
      tl.to(target, { opacity: 1, duration, ...options });
      return this;
    },

    /** Add a fade out tween */
    fadeOut(
      target: gsap.TweenTarget,
      duration: number = 0.4,
      options: gsap.TweenVars = {}
    ) {
      tl.to(target, { opacity: 0, duration, ...options });
      return this;
    },

    /** Add a slide from direction */
    slideIn(
      target: gsap.TweenTarget,
      direction: 'left' | 'right' | 'top' | 'bottom',
      distance: number = 100,
      duration: number = 0.8,
      options: gsap.TweenVars = {}
    ) {
      const fromValues: gsap.TweenVars = {};
      switch (direction) {
        case 'left':
          fromValues.x = -distance;
          break;
        case 'right':
          fromValues.x = distance;
          break;
        case 'top':
          fromValues.y = -distance;
          break;
        case 'bottom':
          fromValues.y = distance;
          break;
      }

      tl.fromTo(target, { ...fromValues, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration, ...options });
      return this;
    },

    /** Add a staggered children animation */
    staggerChildren(
      parent: gsap.TweenTarget,
      stagger: number = 0.1,
      options: gsap.TweenVars = {}
    ) {
      tl.to(parent, {
        children: { ...options, stagger },
        opacity: 1,
        x: 0,
        y: 0,
      });
      return this;
    },

    /** Add a label for seeking */
    addLabel(label: string, position: string | number = '+=0') {
      tl.addLabel(label, position);
      return this;
    },

    /** Add an onComplete callback safely */
    onComplete(fn: () => void) {
      const existing = tl.eventCallback('onComplete');
      tl.eventCallback('onComplete', () => {
        existing?.();
        fn();
      });
      return this;
    },
  };
}
