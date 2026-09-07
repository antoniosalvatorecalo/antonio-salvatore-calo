'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import './RollingText.css';

interface RollingTextProps {
  text: string;
  className?: string;
  trigger?: boolean;
  delay?: number;
}

/**
 * RollingText — vertical character scroll animation
 * Each char rolls down from above, staggered 30ms
 * Used for "Web & UI Designer" and "Based in Benevento, Italy"
 */
export const RollingText = ({ text, className, trigger = true, delay = 0 }: RollingTextProps) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  // Only run animation on trigger: false → true transition (not re-renders)
  const prevTriggerRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Guard: skip if not first trigger or container already built
    if (!trigger || prevTriggerRef.current) return;
    prevTriggerRef.current = true;

    // Build char spans
    const chars = text.split('').map((char) => {
      const span = document.createElement('span');
      span.className = 'rolling-char';
      span.style.display = 'inline-block';
      span.style.overflow = 'hidden';
      span.style.verticalAlign = 'bottom';
      span.textContent = char === ' ' ? '\u00A0' : char;
      return span;
    });

    container.innerHTML = '';
    chars.forEach((c) => container.appendChild(c));

    // Animate each char
    const charEls = container.querySelectorAll<HTMLElement>('.rolling-char');
    charEls.forEach((char) => {
      char.style.transform = 'translateY(-100%)';
      char.style.opacity = '0';
    });

    const animationFrame = requestAnimationFrame(() => {
      charEls.forEach((char, i) => {
        char.style.transition = `transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * 0.03}s, opacity 0.4s ease ${delay + i * 0.03}s`;
        char.style.transform = 'translateY(0)';
        char.style.opacity = '1';
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [text, trigger]);

  return (
    <span ref={containerRef} className={cn('rolling-text-container inline-block', className)} aria-label={text}>
      {text}
    </span>
  );
};
