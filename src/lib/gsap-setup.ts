import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let hasInitialized = false;

/**
 * Centralized GSAP Setup
 * Register all plugins here to ensure consistency and prevent redundant registrations.
 * 
 * FIX 5: GSAP Context Attachment Timing Fix
 * Observers attach after layout stabilization to prevent initial render jitter.
 */
export function initGSAP() {
    if (hasInitialized) return;

    gsap.registerPlugin(ScrollTrigger);
    hasInitialized = true;

    // Optional: Global GSAP defaults
    gsap.config({
        nullTargetWarn: false,
        units: { left: "px", top: "px", rotation: "deg" },
    });

    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

    const refreshScrollTrigger = () => {
        ScrollTrigger.refresh();
    };

    // FIX 5: Defer observer initialization until after layout stabilization
    // Use requestAnimationFrame to ensure DOM is painted
    requestAnimationFrame(() => {
        // ScrollTrigger is now safe to use
        refreshScrollTrigger();
    });

    // Fallback: If page is already loaded, refresh immediately
    if (document.readyState === 'complete') {
        refreshScrollTrigger();
    } else {
        // Wait for load event to ensure all resources are ready
        window.addEventListener('load', refreshScrollTrigger, { once: true });
    }
}

export { gsap, ScrollTrigger };
