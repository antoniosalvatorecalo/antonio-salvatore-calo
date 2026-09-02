import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useScroll } from '../../providers/ScrollProvider';
import { useLanguage } from '../../providers/LanguageProvider';
import { gsap } from '../../lib/gsap-setup';
import { useEntranceReveal } from '../../hooks/animation/useEntranceReveal';
import { useReducedMotionPreference } from '../../providers/MotionPreferenceProvider';
import { instantTransition } from '../../lib/reduced-motion';

interface CreditItem {
  label: string;
  values: string[];
}

interface ProjectCreditsSectionProps {
  credits: CreditItem[];
  className?: string;
  hideTitle?: boolean;
  scrollerRef?: React.RefObject<HTMLDivElement | null>;
}

const CREDIT_GRID_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.3 } },
};

const CREDIT_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/**
 * ProjectCreditsSection Component
 *
 * Renders the Credits section with grid layout and project links.
 * Uses Framer Motion for staggered entrance animations.
 * Grid columns: Desktop (>1024px) = 2 columns, Mobile/Tablet (<1024px) = 2 columns, <=360px = 1 column.
 */
export const ProjectCreditsSection: React.FC<ProjectCreditsSectionProps> = ({
  credits,
  className = '',
  hideTitle = false,
  scrollerRef,
}) => {
  // Grid: Desktop gets 2 columns, Tablet/Mobile get 2, <=360px falls back to 1
  const { isDesktop } = useScroll();
  const prefersReducedMotion = useReducedMotionPreference();
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  // Map English credit labels to translation keys
  const creditLabelMap: Record<string, string> = {
    'Institute': 'credit.institute',
    'Project': 'credit.project',
    'Team': 'credit.team',
    'Tech Stack': 'credit.tech-stack',
    'Mentorship': 'credit.mentorship',
    'Recognition': 'credit.recognition',
    'Role': 'credit.role',
    'Collaborations': 'credit.collaborations',
  };
  const hasScrollerRef = Boolean(scrollerRef);

  // Canonical mobile path with explicit scroller
  useEntranceReveal(containerRef, {
    disabled: isDesktop || !hasScrollerRef,
    scrollerRef,
    start: 'top 82%',
    once: true,
    phases: [
      {
        selector: '[data-mobile-credit-item]',
        y: 18,
        blur: 0,
        duration: 0.46,
        ease: 'power3.out',
        stagger: 0.045,
        at: 0,
      },
    ],
  });

  // Fallback mobile path without scrollerRef: IntersectionObserver + local timeline
  useEffect(() => {
    if (isDesktop || hasScrollerRef || !containerRef.current) return;

    const container = containerRef.current;
    const creditItems = container.querySelectorAll<HTMLElement>('[data-mobile-credit-item]');
    if (!creditItems.length) return;

    if (prefersReducedMotion) {
      gsap.set(creditItems, { opacity: 1, y: 0, clearProps: 'willChange' });
      return;
    }

    gsap.set(creditItems, { opacity: 0, y: 18, willChange: 'opacity, transform' });

    const tlEnter = gsap.timeline({ paused: true });
    tlEnter.fromTo(
      creditItems,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        ease: 'power3.out',
        duration: 0.46,
        stagger: 0.045,
        clearProps: 'willChange',
      }
    );

    const stateRef = { played: false, unmounted: false };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (stateRef.unmounted || stateRef.played) return;
        if (entry.isIntersecting) {
          stateRef.played = true;
          observer.disconnect();
          tlEnter.play(0);
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(container);

    return () => {
      stateRef.unmounted = true;
      observer.disconnect();
      tlEnter.kill();
      if (!stateRef.played) {
        gsap.set(creditItems, { clearProps: 'willChange' });
      }
    };
  }, [isDesktop, hasScrollerRef, prefersReducedMotion]);

  return (
    <div ref={containerRef} className={`flex flex-col gap-4 pb-6 ${className}`}>
      {/* Section Title */}
      {!hideTitle && (
        <span className="project-type-section-title">
          {t('meta.credits')}
        </span>
      )}

      {/* Credits List */}
      <motion.div
        className="grid grid-cols-2 max-[360px]:grid-cols-1 lg:grid-cols-2 gap-4"
        initial={isDesktop && !prefersReducedMotion ? 'hidden' : false}
        animate={isDesktop && !prefersReducedMotion ? 'visible' : undefined}
        variants={isDesktop && !prefersReducedMotion ? CREDIT_GRID_VARIANTS : undefined}
        transition={prefersReducedMotion ? instantTransition : undefined}
      >
        {credits.map((item, i) => (
          <motion.div
            key={i}
            data-mobile-credit-item
            className="flex flex-col gap-1"
            variants={isDesktop && !prefersReducedMotion ? CREDIT_ITEM_VARIANTS : undefined}
            transition={prefersReducedMotion ? instantTransition : undefined}
          >
            <span className="project-type-credits-label">
              {t(creditLabelMap[item.label] || item.label)}
            </span>
            <div className="flex flex-col gap-1">
              {item.values.map((v, j) => (
                <span
                  key={j}
                  className="project-type-credits-value"
                >
                  {v}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ProjectCreditsSection;
