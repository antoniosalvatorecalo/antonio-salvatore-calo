import type { CascadePreset } from '@/motion/constants/types';

export interface CascadePresetConfig {
  y: number;
  blur: number;
  duration: number;
  ease: string;
}

export const cascadePresets: Record<CascadePreset, CascadePresetConfig> = {
  default: {
    y: 24,
    blur: 10,
    duration: 0.9,
    ease: 'power4.out',
  },
  soft: {
    y: 16,
    blur: 6,
    duration: 1.1,
    ease: 'power3.out',
  },
  sharp: {
    y: 32,
    blur: 14,
    duration: 0.7,
    ease: 'power4.inOut',
  },
};