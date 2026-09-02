'use client';

import React, { useRef, useState } from "react";
import { AnimationOptions, motion, stagger, useAnimate } from "motion/react";
import { debounce } from "lodash";
import "./letter-swap.css";

interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  reverse?: boolean;
  transition?: AnimationOptions;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | number;
  className?: string;
  onClick?: () => void;
  externalHovered?: boolean;
}

export function LetterSwapForward({
  label,
  reverse = true,
  transition = {
    type: "spring",
    duration: 0.7,
  },
  staggerDuration = 0.03,
  staggerFrom = "first",
  className,
  onClick,
  externalHovered,
  ...props
}: TextProps) {
  const [scope, animate] = useAnimate();
  const isHoveredRef = useRef(false);
  const isAnimatingRef = useRef(false);

  const mergeTransition = (baseTransition: AnimationOptions) => ({
    ...baseTransition,
    delay: stagger(staggerDuration, { from: staggerFrom }),
  });

  const reverseAnimation = () => {
    return Promise.all([
      animate(".letter", { y: 0 }, mergeTransition(transition)),
      animate(".letter-secondary", { y: reverse ? "-110%" : "110%" }, mergeTransition(transition)),
    ]);
  };

  const hoverStart = () => {
    if (isAnimatingRef.current) return;
    isHoveredRef.current = true;
    isAnimatingRef.current = true;

    animate(".letter", { y: reverse ? "100%" : "-100%" }, mergeTransition(transition))
      .then(() => {
        isAnimatingRef.current = false;
        if (!isHoveredRef.current) {
          reverseAnimation();
        }
      });

    animate(".letter-secondary", { y: "0%" }, mergeTransition(transition));
  };

  const hoverEnd = () => {
    isHoveredRef.current = false;
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    reverseAnimation();
    // Wait for the longest animation duration to reset isAnimatingRef
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, (transition as any).duration * 1000 || 700);
  };

  // When externalHovered is provided, drive animation from parent hover state.
  // Skip hoverEnd on initial mount (externalHovered=false) — calling it sets
  // isAnimatingRef=true for 700ms and blocks the first hoverStart.
  const hasBeenHoveredRef = useRef(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (externalHovered === undefined) return;
    if (externalHovered) {
      hasBeenHoveredRef.current = true;
      hoverStart();
    } else {
      if (hasBeenHoveredRef.current) hoverEnd();
    }
  }, [externalHovered]);

  return (
    <span
      className={`flex flex-nowrap items-center relative w-auto ${className ?? ''}`}
      style={{ width: 'auto', maxWidth: 'none' }}
      onMouseEnter={externalHovered !== undefined ? undefined : hoverStart}
      onMouseLeave={externalHovered !== undefined ? undefined : hoverEnd}
      onClick={onClick}
      ref={scope}
      role="text"
      aria-label={label}
      {...props}
    >
      <span className="sr-only">{label}</span>
      {label.split("").map((letter: string, i: number) => {
        const isSpace = letter === " ";
        return (
          <span
            className={`letter-char-wrap whitespace-pre relative flex flex-nowrap pb-[0.15em] w-auto overflow-hidden${isSpace ? ' letter-space' : ''}`}
            key={i}
            aria-hidden="true"
          >
            <motion.span className="relative letter font-[400]" data-char={letter} style={{ top: 0 }} />
            <motion.span
              className="absolute letter-secondary font-[500]"
              data-char={letter}
              style={{ y: reverse ? "-110%" : "110%" }}
            />
          </span>
        );
      })}
    </span>
  );
}

// ─── LetterSwapBlock — multi-line, single animation scope ──────────────────────
// All lines share ONE useAnimate scope: the stagger flows as one continuous
// wave across every letter in every line simultaneously.

interface LetterSwapBlockProps {
  lines: string[];
  externalHovered?: boolean;
  staggerDuration?: number;
  transition?: AnimationOptions;
  className?: string;
}

export function LetterSwapBlock({
  lines,
  externalHovered,
  staggerDuration = 0.025,
  transition = { type: 'spring', duration: 0.7 },
  className = '',
}: LetterSwapBlockProps) {
  const [scope, animate] = useAnimate();
  const isAnimatingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const hasBeenHoveredRef = useRef(false);
  const accessibleLabel = lines.join(' ');

  const mergeT = (t: AnimationOptions) => ({
    ...t,
    delay: stagger(staggerDuration, { from: 'first' }),
  });

  const hoverStart = () => {
    if (isAnimatingRef.current) return;
    isHoveredRef.current = true;
    isAnimatingRef.current = true;
    animate('.letter', { y: '100%' }, mergeT(transition));
    animate('.letter-secondary', { y: '0%' }, mergeT(transition)).then(() => {
      isAnimatingRef.current = false;
      if (!isHoveredRef.current) {
        isAnimatingRef.current = true;
        animate('.letter', { y: 0 }, mergeT(transition));
        animate('.letter-secondary', { y: '-110%' }, mergeT(transition)).then(() => {
          isAnimatingRef.current = false;
        });
      }
    });
  };

  const hoverEnd = () => {
    isHoveredRef.current = false;
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    animate('.letter', { y: 0 }, mergeT(transition));
    animate('.letter-secondary', { y: '-110%' }, mergeT(transition)).then(() => {
      isAnimatingRef.current = false;
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (externalHovered === undefined) return;
    if (externalHovered) {
      hasBeenHoveredRef.current = true;
      hoverStart();
    } else {
      if (hasBeenHoveredRef.current) hoverEnd();
    }
  }, [externalHovered]);

  return (
    <div
      ref={scope}
      className={`flex flex-col items-start ${className}`}
      onMouseEnter={externalHovered !== undefined ? undefined : hoverStart}
      onMouseLeave={externalHovered !== undefined ? undefined : hoverEnd}
      role="text"
      aria-label={accessibleLabel}
    >
      <span className="sr-only">{accessibleLabel}</span>
      {lines.map((line, li) => (
        <span key={li} className="flex items-center justify-start overflow-hidden" aria-hidden="true">
          {line.split('').map((char, ci) => {
            const isSpace = char === ' ';

            return (
              <span
                key={ci}
                className={`letter-char-wrap relative inline-block overflow-hidden whitespace-pre${isSpace ? ' letter-space' : ''}`}
                style={{
                  width: isSpace ? '0.34em' : 'auto',
                  marginRight: '0.02em',
                  paddingLeft: ['k', 's', 'p'].includes(char.toLowerCase()) ? '0.01em' : '0',
                  paddingRight: ['k', 's', 'p'].includes(char.toLowerCase()) ? '0.01em' : '0',
                }}
                aria-hidden="true"
              >
                <motion.span className="relative letter font-[400] block" data-char={char} style={{ lineHeight: '1.1' }} />
                <motion.span className="absolute letter-secondary font-[500] block inset-0" data-char={char} style={{ y: '-110%', lineHeight: '1.1' }} />
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
}

// @ts-ignore

export function LetterSwapPingPong({
  label,
  reverse = true,
  transition = {
    type: "spring",
    duration: 0.7,
  },
  staggerDuration = 0.03,
  staggerFrom = "first",
  className,
  onClick,
  ...props
}: TextProps) {
  const [scope, animate] = useAnimate();
  const [isHovered, setIsHovered] = useState(false);

  const mergeTransition = (baseTransition: AnimationOptions) => ({
    ...baseTransition,
    delay: stagger(staggerDuration, {
      from: staggerFrom,
    }),
  });

  const hoverStart = debounce(
    () => {
      if (isHovered) return;
      setIsHovered(true);

      animate(
        ".letter",
        {
          y: reverse ? "100%" : "-100%",
        },
        mergeTransition(transition)
      );

      animate(
        ".letter-secondary",
        {
          y: "0%",
        },
        mergeTransition(transition)
      );
    },
    100,
    { leading: true, trailing: true }
  );

  const hoverEnd = debounce(
    () => {
      setIsHovered(false);

      animate(
        ".letter",
        {
          y: 0,
        },
        mergeTransition(transition)
      );

      animate(
        ".letter-secondary",
        {
          y: reverse ? "-110%" : "110%",
        },
        mergeTransition(transition)
      );
    },
    100,
    { leading: true, trailing: true }
  );

      return (
    // @ts-ignore
    <motion.span
      className={`flex justify-center items-center relative overflow-hidden ${className}`}
      onHoverStart={hoverStart}
      onHoverEnd={hoverEnd}
      onClick={onClick}
      ref={scope}
      role="text"
      aria-label={label}
      {...props}
    >
      <span className="sr-only">{label}</span>
      {label.split("").map((letter: string, i: number) => {
        return (
          <span
            className="letter-char-wrap whitespace-pre relative flex flex-nowrap pb-[0.15em] w-auto overflow-hidden"
            key={i}
            aria-hidden="true"
          >
            <motion.span className="relative letter font-[400]" data-char={letter} style={{ top: 0 }} />
            <motion.span
              className="absolute letter-secondary font-[500]"
              data-char={letter}
              style={{ y: reverse ? "-110%" : "110%" }}
            />
          </span>
        );
      })}
    </motion.span>
  );
}
