import { useEffect, useRef, type AnimationEvent, type CSSProperties, type ReactNode } from 'react';
import './GalleryMediaReveal.css';

interface GalleryMediaRevealProps {
  children: ReactNode;
  index: number;
  revealOnMount?: boolean;
  className?: string;
  onRevealPresence?: () => void;
}

const HOME_FILTER_REVEAL_THRESHOLD = 0.15;

export function getGalleryMediaRevealDelay(index: number) {
  return Math.min(index, 12) * 0.055 + Math.max(index - 12, 0) * 0.012;
}

export function GalleryMediaReveal({
  children,
  index,
  revealOnMount = true,
  className,
  onRevealPresence,
}: GalleryMediaRevealProps) {
  const frameRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const handleAnimationStart = (event: AnimationEvent<HTMLSpanElement>) => {
    if (!onRevealPresence || event.animationName !== 'gallery-media-reveal') return;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    const element = event.currentTarget;
    const animation = element.getAnimations()[0];
    if (!animation) return;

    const checkProgress = () => {
      frameRef.current = null;
      if (!element.isConnected) return;
      const progress = animation.effect?.getComputedTiming().progress;
      if (
        (typeof progress === 'number' && progress >= HOME_FILTER_REVEAL_THRESHOLD) ||
        animation.playState === 'finished'
      ) {
        onRevealPresence();
        return;
      }
      frameRef.current = requestAnimationFrame(checkProgress);
    };
    frameRef.current = requestAnimationFrame(checkProgress);
  };

  return (
    <span
      className={['gallery-media-reveal', className].filter(Boolean).join(' ')}
      data-reveal-on-mount={revealOnMount}
      onAnimationStart={handleAnimationStart}
      style={{ '--gallery-reveal-delay': `${getGalleryMediaRevealDelay(index)}s` } as CSSProperties}
    >
      {children}
    </span>
  );
}
