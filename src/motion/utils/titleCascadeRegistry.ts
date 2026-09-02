/**
 * Global Title Animation Cascade Registry
 * 
 * Defines the exact cascade timing for all section titles across the page.
 * Follows scroll hierarchy from top to bottom.
 * 
 * Animation pattern (per CONTEXT.md specification):
 * - opacity: 0 → 1
 * - translateY: 18px → 0px (desktop), 12px → 0px (mobile)
 * - duration: 0.6s (desktop), 0.45s (mobile)
 * - easing: cubic-bezier(0.22, 1, 0.36, 1)
 * - stagger: 80ms (desktop), 50ms (mobile)
 * 
 * Cascade order (top-to-bottom):
 * 1. About → 0ms
 * 2. Principles → +80ms
 * 3. Visual Clarity → +160ms
 * 4. Strategic Thinking → +240ms
 * 5. User-Centric → +320ms
 * 6. Services → +400ms
 * 7. Design → +480ms
 * 8. Capabilities → +560ms
 * 9. Contact → +640ms
 */

export const TITLE_CASCADE_TIMING = {
  about: 0,
  principles: 80,
  visualClarity: 160,
  strategicThinking: 240,
  userCentric: 320,
  services: 400,
  design: 480,
  capabilities: 560,
  contact: 640,
} as const;

export type TitleKey = keyof typeof TITLE_CASCADE_TIMING;

/**
 * Get the cascade delay for a specific section title
 * @param key - The section title identifier
 * @returns Delay in milliseconds
 */
export function getCascadeDelay(key: TitleKey): number {
  return TITLE_CASCADE_TIMING[key];
}