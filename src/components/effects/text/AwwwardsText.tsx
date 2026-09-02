import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { gsap } from '@/lib/gsap-setup';
import SplitType from 'split-type';
import { useScroll } from '@/providers/ScrollProvider';
import './AwwwardsText.css';

interface AwwwardsTextProps {
  text?: string;
  html?: string;
  className?: string;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * AwwwardsText component for high-impact typography with masked line reveal.
 * Optimized for performance and stability with custom scroll containers.
 * Refactored to use GSAP ScrollTrigger for consistent lifecycle management.
 */
const AwwwardsText = forwardRef<HTMLDivElement, AwwwardsTextProps>(({
  text = '',
  html = '',
  className = '',
  scrollContainerRef: propScrollRef
}, ref) => {
  const textRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitInstance = useRef<SplitType | null>(null);
  const ctx = useRef<gsap.Context | null>(null);
  const { leftScrollRef } = useScroll();

  // Use provided ref or default to leftScrollRef (About section)
  const targetScrollRef = propScrollRef || leftScrollRef;

  useImperativeHandle(ref, () => containerRef.current!);

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;

    const setupSplitAndAnimate = async () => {
      // 1. Wait for fonts so line calculations are accurate
      await document.fonts.ready;

      if (!textRef.current || !containerRef.current) return;

      // 2. Teardown previous instances
      if (ctx.current) ctx.current.revert();
      if (splitInstance.current) splitInstance.current.revert();

      // Clear any manual masks injected in previous runs
      containerRef.current.querySelectorAll('.line-mask').forEach((el: Element) => {
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
        }
      });

      // 3. Setup GSAP context for automated cleanup
      ctx.current = gsap.context(() => {
        // Initialize Split-Type
        splitInstance.current = new SplitType(textRef.current!, {
          types: 'lines,words',
          tagName: 'span',
        });

        const lines = splitInstance.current.lines;
        if (!lines || lines.length === 0) return;

        // Wrap each line in a mask for the 'from below' reveal effect
        lines.forEach((line: Element) => {
          const mask = document.createElement('div');
          mask.className = 'line-mask';
          mask.style.overflow = 'hidden';
          mask.style.display = 'block';
          line.parentNode?.insertBefore(mask, line);
          mask.appendChild(line);
        });

        // Define the animation timeline with ScrollTrigger
        gsap.from(lines, {
          yPercent: 110,
          rotationX: -15,
          opacity: 0,
          stagger: 0.1,
          duration: 1.4,
          ease: 'power4.out',
          transformOrigin: '50% 50% -40px',
          clearProps: 'all',
          scrollTrigger: {
            trigger: containerRef.current,
            scroller: targetScrollRef.current ?? window,
            start: 'top 95%', // Trigger slightly before it enters fully
            toggleActions: 'play none none none', // Play once
          },
        });
      }, containerRef);
    };

    setupSplitAndAnimate();

    // Re-split on resize to maintain correct line breaks
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setupSplitAndAnimate, 300);
    });

    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => {
      clearTimeout(resizeTimer);
      if (resizeObserver) resizeObserver.disconnect();
      if (ctx.current) ctx.current.revert();
      if (splitInstance.current) splitInstance.current.revert();
    };
  }, [text, html, targetScrollRef]);

  return (
    <div ref={containerRef} className={`w-full awwwards-text-container ${className}`}>
      <h2
        ref={textRef}
        className="m-0 break-words font-normal leading-[1.15] tracking-[-0.02em] [text-wrap:balance] [hyphens:auto]"
        {...(html
          ? { dangerouslySetInnerHTML: { __html: html } }
          : { children: text }
        )}
      />
    </div>
  );
});

AwwwardsText.displayName = 'AwwwardsText';

export default AwwwardsText;