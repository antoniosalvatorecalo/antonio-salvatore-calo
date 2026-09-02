'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap-setup';
import { orchestrator, SectionId } from '@/animations/orchestrator';
import { useLanguage } from '../../providers/LanguageProvider';
import './AboutPrinciples.css';

const SECTION_ID: SectionId = 'principles';

interface AboutPrinciplesProps {
  enabled?: boolean;
}

export const AboutPrinciples = ({ enabled = true }: AboutPrinciplesProps) => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  const PRINCIPLES = [
    { title: t('principles.vc-title'), desc: t('principles.vc-desc-short') },
    { title: t('principles.st-title'), desc: t('principles.st-desc-short') },
    { title: t('principles.uc-title'), desc: t('principles.uc-desc-short') },
  ];

  useEffect(() => {
    if (!enabled) return;

    const container = ref.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const label = container.querySelector<HTMLElement>('[data-reveal="label"]');
      const blocks = container.querySelectorAll<HTMLElement>('[data-principle-block]');

      // Set initial state — label + titles
      if (label) gsap.set(label, { y: -16, opacity: 0 });

      const allWordsByBlock: HTMLElement[][] = [];

      blocks.forEach((block) => {
        const title = block.querySelector<HTMLElement>('[data-principle-title]');
        const desc = block.querySelector<HTMLElement>('[data-principle-desc]');

        if (title) gsap.set(title, { y: -22, opacity: 0 });

        if (desc) {
          // Split desc into word spans for per-word blur reveal
          const raw = (desc.textContent || '').trim();
          desc.innerHTML = '';
          const words: HTMLElement[] = [];
          raw.split(/\s+/).filter(Boolean).forEach((word, i, arr) => {
            const span = document.createElement('span');
            span.className = 'blur-word';
            span.textContent = word;
            desc.appendChild(span);
            if (i < arr.length - 1) desc.appendChild(document.createTextNode(' '));
            words.push(span);
          });
          gsap.set(words, { opacity: 0, filter: 'blur(10px)' });
          allWordsByBlock.push(words);
        } else {
          allWordsByBlock.push([]);
        }
      });

      const tl = gsap.timeline({
        paused: true,
        onComplete: () => orchestrator.markComplete(SECTION_ID),
      });

      if (label) {
        tl.to(label, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' }, 0);
      }

      blocks.forEach((block, i) => {
        const title = block.querySelector<HTMLElement>('[data-principle-title]');
        const words = allWordsByBlock[i];
        const blockStart = 0.2 + i * 0.38;

        if (title) {
          tl.to(title, { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out' }, blockStart);
        }

        if (words.length) {
          tl.to(
            words,
            {
              opacity: 1,
              filter: 'blur(0px)',
              duration: 0.62,
              ease: 'power2.out',
              stagger: 0.055,
            },
            blockStart + 0.18
          );
        }
      });

      orchestrator.registerPlayFn(SECTION_ID, () => tl.play());
    }, ref);

    return () => {
      orchestrator.deregisterPlayFn(SECTION_ID);
      ctx.revert();
    };
  }, [enabled]);

  return (
    <div className="principles-container" data-section="principles" ref={ref}>
      <div className="principles-label-wrap">
        <span data-reveal="label" className="principles-label">{t('principles.label')}</span>
      </div>
      <div className="principles-list">
        {PRINCIPLES.map((p) => (
          <div key={p.title} data-principle-block className="principle-block">
            <div className="principle-title-wrap">
              <h2 data-principle-title className="principle-title">{p.title}</h2>
            </div>
            <p data-principle-desc className="principle-desc">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
