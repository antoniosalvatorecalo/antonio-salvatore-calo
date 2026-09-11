import gsap from 'gsap';

let hasInitialized = false;

/**
 * Centralized GSAP Setup
 * Configure GSAP core once. Optional plugins are initialized by their feature modules.
 */
export function initGSAP() {
  if (hasInitialized) return;

  hasInitialized = true;

  // Optional: Global GSAP defaults
  gsap.config({
    nullTargetWarn: false,
    units: { left: 'px', top: 'px', rotation: 'deg' },
  });
}

export { gsap };
