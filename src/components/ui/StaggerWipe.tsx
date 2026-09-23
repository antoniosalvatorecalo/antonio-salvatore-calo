import { useLayoutEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';

import { gsap } from '@/lib/gsap-setup';

import './StaggerWipe.css';

interface StaggerWipeProps {
  active: boolean;
  columns?: number;
  color?: string;
  onComplete?: () => void;
}

const MIN_COLUMNS = 6;
const MAX_COLUMNS = 24;
const COVER_DURATION = 0.42;
const STAGGER_DELAY = 0.03;
const FULL_COVER_HOLD = 0.055;

export function StaggerWipe({
  active,
  columns = 16,
  color = 'var(--bg-primary)',
  onComplete,
}: StaggerWipeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stripRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const safeColumns = Math.max(MIN_COLUMNS, Math.min(MAX_COLUMNS, Math.round(columns)));
  const strips = useMemo(() => Array.from({ length: safeColumns }), [safeColumns]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const elements = stripRefs.current.filter((element): element is HTMLSpanElement =>
      Boolean(element),
    );
    if (!root || elements.length === 0 || !active) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete?.();
      return;
    }

    const context = gsap.context(() => {
      gsap.set(elements, { scaleY: 0, transformOrigin: 'center bottom', force3D: true });
      const timeline = gsap.timeline({ onComplete });
      timeline.to(elements, {
        scaleY: 1,
        duration: COVER_DURATION,
        ease: 'power4.inOut',
        stagger: { each: STAGGER_DELAY, from: 'start' },
        force3D: true,
      });
      timeline.to({}, { duration: FULL_COVER_HOLD });
    }, root);

    return () => context.revert();
  }, [active, onComplete, safeColumns]);

  return (
    <div
      ref={rootRef}
      className="stagger-wipe"
      data-active={active ? 'true' : 'false'}
      aria-hidden="true"
      style={
        {
          '--stagger-wipe-columns': safeColumns,
          '--stagger-wipe-color': color,
        } as CSSProperties
      }
    >
      {strips.map((_, index) => (
        <span
          key={index}
          ref={(element) => {
            stripRefs.current[index] = element;
          }}
          className="stagger-wipe__strip"
        />
      ))}
    </div>
  );
}
