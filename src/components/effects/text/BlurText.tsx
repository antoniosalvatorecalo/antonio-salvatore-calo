import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { gsap } from '@/lib/gsap-setup';
import { useScroll } from '@/providers/ScrollProvider';
import './BlurText.css';

interface BlurTextProps {
  text: string;
  emphasizedIndices?: number[];
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * BlurText Component
 * Animates text word-by-word with blur and opacity based on scroll position.
 * Normalized to use global GSAP setup and forwardRef.
 */
const BlurText = forwardRef<HTMLParagraphElement, BlurTextProps>(({
  text,
  emphasizedIndices = [],
  scrollContainerRef: propScrollRef,
  className = ''
}, ref) => {
  const localRef = useRef<HTMLParagraphElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);
  const { leftScrollRef } = useScroll();

  const targetScrollRef = propScrollRef || leftScrollRef;

  const scrollerRef = useRef<HTMLElement | Window | null>(null);

  useImperativeHandle(ref, () => localRef.current!);

  const segments = text.split(/(\n)/);
  const words = segments.flatMap(segment => segment === '\n' ? [] : segment.split(/\s+/)).filter(Boolean);

  useEffect(() => {
    scrollerRef.current = targetScrollRef.current;
  }, [targetScrollRef]);

  useEffect(() => {
    const container = localRef.current;
    const wordEls = wordsRef.current.filter(Boolean);

    if (!container || wordEls.length === 0) return;

    const scrollerEl = scrollerRef.current;

    gsap.set(wordEls, {
      opacity: 0,
      filter: 'blur(6px)',
      y: 8,
    });

    const animateWords = {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      ease: 'power2.out',
      stagger: { each: 0.04, from: 'start' as const },
      duration: 0.9,
    };

    let tl: gsap.core.Timeline;

    if (!scrollerEl) {
      tl = gsap.timeline({ delay: 0.55 });
      tl.to(wordEls, animateWords);
    } else {
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          scroller: scrollerEl,
          start: 'top 80%',
          toggleActions: 'play none none none',
          invalidateOnRefresh: true,
        },
      });
      tl.to(wordEls, animateWords);
    }

    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
    };
  }, []);

  const renderContent = () => {
    const elements: React.ReactElement[] = [];
    let wordIndex = 0;
    for (const segment of segments) {
      if (segment === '\n') {
        elements.push(<span key={`br-${elements.length}`} className="basis-full h-0" />);
      } else {
        const segWords = segment.split(/\s+/).filter(Boolean);
        for (const word of segWords) {
          elements.push(
            <span
              key={`word-${wordIndex}-${word}`}
              ref={(el) => {
                if (el) wordsRef.current[wordIndex] = el;
              }}
              className={`inline-block whitespace-nowrap will-change-[opacity,filter,transform] ${emphasizedIndices.includes(wordIndex) ? 'font-medium' : ''}`}
            >
              {word}
            </span>
          );
          wordIndex++;
          if (wordIndex < words.length) {
            elements.push(<span key={`space-${wordIndex}`}> </span>);
          }
        }
      }
    }
    return elements;
  };

  return (
    <p
      ref={localRef}
      className={`flex flex-wrap gap-x-[0.25em] gap-y-[0.15em] ${className}`}
    >
      {renderContent()}
    </p>
  );
});

BlurText.displayName = 'BlurText';

export default BlurText;