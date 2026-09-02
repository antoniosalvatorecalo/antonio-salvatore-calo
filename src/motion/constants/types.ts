export type CascadePreset = 'default' | 'soft' | 'sharp';

export interface CascadeOptions {
  /** Visual personality of the cascade */
  preset?: CascadePreset;
  /** Base stagger between consecutive items (seconds) */
  staggerBase?: number;
  /** Extra stagger per depth level (seconds) */
  depthFactor?: number;
  /** Play once or loop */
  once?: boolean;
  /** Optional explicit scroller element (defaults to .left-scroll-container) */
  scroller?: HTMLElement | null;
}