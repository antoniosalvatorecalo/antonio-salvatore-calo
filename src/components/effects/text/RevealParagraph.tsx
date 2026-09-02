import React from 'react';
import './RevealParagraph.css';

interface RevealParagraphProps {
  text: string;
  className?: string;
  emphasizedIndices?: number[];
  /** Optional stagger delay per word (in seconds) */
  staggerDelay?: number;
}

/**
 * RevealParagraph Component
 *
 * Renders paragraph text with individual word spans for blur reveal animation.
 * Each word gets data-reveal="word" for GSAP animation control.
 *
 * Animation sequence:
 * 1. Container triggers via useScrollReveal hook
 * 2. Words animate with blur(6px) → blur(0px) + opacity 0 → 1
 * 3. Sequential timing after Title, before CTA
 */
export const RevealParagraph: React.FC<RevealParagraphProps> = ({
  text,
  className = '',
  emphasizedIndices = [],
}) => {
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <p className={`flex flex-wrap gap-x-[0.25em] gap-y-[0.15em] ${className}`}>
      {words.map((word, index) => (
        <span
          key={`${index}-${word}`}
          data-reveal="paragraph"
          className={`
            inline-block whitespace-nowrap
            will-change-[opacity,filter,transform]
            ${emphasizedIndices.includes(index) ? 'font-medium' : ''}
          `}
        >
          {word}
        </span>
      ))}
    </p>
  );
};

export default RevealParagraph;