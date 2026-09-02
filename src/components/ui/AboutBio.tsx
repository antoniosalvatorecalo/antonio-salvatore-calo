'use client';

import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from '@/lib/gsap-setup';
import { orchestrator, SectionId } from '@/animations/orchestrator';
import { useReducedMotionPreference } from '@/providers/MotionPreferenceProvider';
import { useLanguage } from '../../providers/LanguageProvider';
import './AboutBio.css';

const SECTION_ID: SectionId = 'bio';

interface AboutBioProps {
  enabled?: boolean;
}

export const AboutBio = ({ enabled = true }: AboutBioProps) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);
  const prefersReducedMotion = useReducedMotionPreference();

  useLayoutEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const labelEl = container.querySelector('.bio-label') as HTMLElement;
    const wordEls = wordsRef.current.filter(Boolean);
    if (!labelEl || !wordEls.length) return;
    const textBlock = container.querySelector('.bio-text-block') as HTMLElement;

    if (prefersReducedMotion) {
      gsap.set([labelEl, textBlock, ...wordEls].filter(Boolean), {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        clearProps: 'willChange',
      });
      orchestrator.markComplete(SECTION_ID);
      return;
    }

    const ctx = gsap.context(() => {
// Set initial state - blur + opacity
       gsap.set(labelEl, { opacity: 0, y: 12, filter: 'blur(8px)' });
       gsap.set(wordEls, { opacity: 0, y: 8, filter: 'blur(6px)' });
       if (textBlock) {
         gsap.set(textBlock, { opacity: 0, filter: 'blur(8px)' });
       }

       const tl = gsap.timeline({
         paused: true,
         onComplete: () => orchestrator.markComplete(SECTION_ID),
       });

       // Reveal label first
       tl.to(labelEl, { 
         opacity: 1, 
         y: 0, 
         filter: 'blur(0px)', 
         duration: 0.45, 
         ease: 'power3.out' 
       }, 0);

       // Reveal paragraph block
       if (textBlock) {
         tl.to(textBlock, { opacity: 1, filter: 'blur(0px)', duration: 0.45, ease: 'power3.out' }, 0);
       }

      // Reveal words in cascade with blur
      tl.to(wordEls, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.58,
        ease: 'power3.out',
        stagger: 0.035,
      }, 0.12);
      
      orchestrator.registerPlayFn(SECTION_ID, () => tl.play());
    }, containerRef);

    return () => {
      orchestrator.deregisterPlayFn(SECTION_ID);
      ctx.revert();
    };
  }, [enabled, prefersReducedMotion]);

  const BIO_TEXT = t('about.bio');
  const words = BIO_TEXT.split(/\s+/).filter(Boolean);

  return (
    <div className="bio-container" data-section="bio" ref={containerRef}>
      <div className="bio-label-wrap">
        <span className="bio-label">{t('about.label')}</span>
      </div>
      <div className="bio-text-block">
        <p className="bio-text">
          {words.map((word, i) => (
            <React.Fragment key={i}>
              <span
                ref={(el) => {
                  if (el) wordsRef.current[i] = el;
                }}
                className="bio-word blur-word"
              >
                {word}
              </span>
              {i < words.length - 1 && ' '}
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
};
