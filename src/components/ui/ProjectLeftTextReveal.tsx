import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap-setup';
import { useReducedMotionPreference } from '../../providers/MotionPreferenceProvider';
import { ArrowUpRight } from 'lucide-react';
import { LetterSwapForward } from './letter-swap';

interface Props {
  title: string;
  paragraph: string;
  cta?: { label: string; href: string };
}

export const ProjectLeftTextReveal: React.FC<Props> = ({ title, paragraph, cta }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotionPreference();

  const words = paragraph.split(/\s+/).filter(Boolean);
  const shouldBreakAfter = (word: string, index: number) => word.endsWith('.') && index < words.length - 1;

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const container = containerRef.current;
    if (!container) return;

    if (prefersReducedMotion) {
      gsap.set(container.querySelectorAll('[data-reveal]'), {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        clearProps: 'willChange',
      });
      return;
    }

    const ctx = gsap.context(() => {
      const titleEl = container.querySelector<HTMLElement>('[data-reveal="title"]');
      const paragraphEl = container.querySelector<HTMLElement>('[data-reveal="paragraph"]');
      const wordEls = Array.from(container.querySelectorAll<HTMLElement>('[data-reveal="word"]'));
      const ctaEl = container.querySelector<HTMLElement>('[data-reveal="cta"]');

      const tl = gsap.timeline();

      if (titleEl) {
        gsap.set(titleEl, { opacity: 0, y: 12, filter: 'blur(10px)', willChange: 'opacity, transform, filter' });
        tl.to(titleEl, {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.55, ease: 'power3.out',
          clearProps: 'transform,filter,willChange',
        }, 0);
      }

      if (paragraphEl) {
        gsap.set(paragraphEl, { filter: 'blur(10px)', willChange: 'filter' });
        tl.to(paragraphEl, {
          filter: 'blur(0px)',
          duration: 0.65,
          ease: 'power2.out',
        }, '-=0.45');
      }

      if (wordEls.length) {
        gsap.set(wordEls, { opacity: 0, y: 14, filter: 'blur(8px)', willChange: 'opacity, transform, filter' });
        tl.to(wordEls, {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.62, ease: 'power3.out',
          stagger: 0.026,
          clearProps: 'transform,filter,willChange',
        }, '-=0.35');
      }

      if (ctaEl) {
        gsap.set(ctaEl, { opacity: 0, y: 10, willChange: 'opacity, transform' });
        tl.to(ctaEl, {
          opacity: 1, y: 0,
          duration: 0.4, ease: 'power3.out',
          clearProps: 'transform,willChange',
        }, '-=0.45');
      }

      tl.set(
        [titleEl, paragraphEl, ...wordEls, ctaEl].filter(Boolean),
        { clearProps: 'transform,filter,willChange' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <span
        data-reveal="title"
        className="project-type-section-title"
      >
        {title}
      </span>

      <p
        data-reveal="paragraph"
        className="project-type-body flex flex-wrap gap-x-[0.25em] gap-y-[0.15em]"
      >
        {words.map((word, i) => (
          <span key={`${i}-${word}`} className="contents">
            <span data-reveal="word" className="inline-block shrink-0 will-change-[opacity,transform]">
              {word}
            </span>
            {shouldBreakAfter(word, i) && <span className="basis-full h-[0.22em]" aria-hidden="true" />}
          </span>
        ))}
      </p>

      {cta && (
        <div data-reveal="cta" className="mt-2">
          <a
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="project-type-cta"
          >
            <span className="project-type-cta-text">
              <LetterSwapForward
                label={cta.label}
                staggerDuration={0.018}
                transition={{ type: 'spring', duration: 0.58 }}
              />
            </span>
            <span className="nav-pill-arrow-mask" aria-hidden="true">
              <ArrowUpRight className="nav-pill-arrow-icon" />
            </span>
          </a>
        </div>
      )}
    </div>
  );
};

export default ProjectLeftTextReveal;
