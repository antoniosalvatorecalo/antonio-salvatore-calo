import React, { useMemo, useRef } from 'react';
import { useScroll } from '../../providers/ScrollProvider';
import { useEntranceReveal } from '../../hooks/animation/useEntranceReveal';
import { useLanguage } from '../../providers/LanguageProvider';
import { getProjectImageDimensions } from '../../content/projectImageMetadata';
import { ArrowUpRight } from 'lucide-react';
import { LetterSwapForward } from './letter-swap';

interface ProjectSectionProps {
  title: string;
  paragraph: string;
  cta?: { label: string; href: string };
  imageUrl?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  className?: string;
  scrollerRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * ProjectSection Component
 *
 * Renders a project section with guaranteed sequential reveal:
 * 1. Image (fade in, scale)
 * 2. Title (slide up, no blur)
 * 3. Paragraph (blur reveal per word)
 * 4. CTA (fade up, last)
 *
 * Animation triggers on scroll into view for mobile.
 * Tablet: Same as mobile - scroll-linked animations for single-column layout.
 * Desktop: Horizontal layout with blur reveal animations.
 */
export const ProjectSection: React.FC<ProjectSectionProps> = ({
  title,
  paragraph,
  cta,
  imageUrl,
  priority = false,
  width,
  height,
  className = '',
  scrollerRef,
}) => {
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const { isDesktop } = useScroll();
  const { t } = useLanguage();

  // Map English section titles to translation keys
  const sectionTitleKeys: Record<string, string> = {
    'Context': 'section.context',
    'Brief': 'section.brief',
    'The Problem': 'section.problem',
    'Core Solutions': 'section.solutions',
    'Full Case Study': 'section.case-study',
    'Live Website': 'section.live-website',
    'Visual Design': 'section.visual-design',
    'Prototype': 'section.prototype',
  };
  const translatedTitle = sectionTitleKeys[title] ? t(sectionTitleKeys[title]) : title;

  // Map English CTA labels to translation keys
  const ctaLabelKeys: Record<string, string> = {
    'Discover the Process': 'cta.discover-process',
    'Open Live Website': 'cta.open-live',
    'View Prototype': 'cta.view-prototype',
  };
  const translatedCtaLabel = cta?.label ? (ctaLabelKeys[cta.label] ? t(ctaLabelKeys[cta.label]) : cta.label) : undefined;

  // Split paragraph into words for staggered blur animation
  const words = paragraph.split(/\s+/).filter(Boolean);
  const shouldBreakAfter = (word: string, index: number) => word.endsWith('.') && index < words.length - 1;
  const imageDimensions = getProjectImageDimensions(imageUrl);
  const imageWidth = width ?? imageDimensions?.width;
  const imageHeight = height ?? imageDimensions?.height;
  const imageLoading: 'eager' | 'lazy' = priority ? 'eager' : 'lazy';

  const desktopPhases = useMemo(
    () => [
      {
        selector: '[data-section-reveal="title"]',
        y: 30,
        blur: 0,
        duration: 0.5,
        ease: 'power3.out',
        at: 0,
      },
      {
        selector: '[data-section-reveal="paragraph"]',
        y: 15,
        blur: 6,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.03,
        at: '-=0.35',
      },
      {
        selector: '[data-section-reveal="cta"]',
        y: 15,
        blur: 0,
        duration: 0.4,
        ease: 'power3.out',
        at: '-=0.45',
      },
    ],
    []
  );

  const mobilePhases = useMemo(
    () => [
      {
        selector: '[data-mobile-reveal="image"]',
        y: 28,
        blur: 0,
        duration: 0.68,
        ease: 'power3.out',
        at: 0,
      },
      {
        selector: '[data-mobile-reveal="title"]',
        y: 14,
        blur: 0,
        duration: 0.42,
        ease: 'power3.out',
        at: '>-0.16',
      },
      {
        selector: '[data-mobile-reveal="paragraph"]',
        y: 10,
        blur: 0,
        duration: 0.58,
        ease: 'power3.out',
        stagger: 0.012,
        at: '>-0.12',
      },
      {
        selector: '[data-mobile-reveal="cta"]',
        y: 12,
        blur: 0,
        duration: 0.36,
        ease: 'power3.out',
        at: '>-0.12',
      },
    ],
    []
  );

  useEntranceReveal(desktopContainerRef, {
    disabled: !isDesktop,
    start: 'top 85%',
    once: true,
    phases: desktopPhases,
  });

  useEntranceReveal(mobileContainerRef, {
    disabled: isDesktop,
    scrollerRef,
    start: 'top 90%',
    once: true,
    phases: mobilePhases,
  });

  // Mobile vertical layout: image → title → description → CTA
  if (!isDesktop) {
    return (
      <div ref={mobileContainerRef} className={`flex flex-col w-full ${className}`}>
        {/* Image - small side padding on tablet, full width on mobile */}
        {imageUrl && (
          <div className="w-full px-2 sm:px-3">
            <div data-mobile-reveal="image" className="aspect-[16/9] w-full bg-[var(--bg-tertiary)] overflow-hidden rounded-[4px]">
              <img
                src={imageUrl}
                alt={translatedTitle}
                width={imageWidth}
                height={imageHeight}
                loading={imageLoading}
                fetchPriority={priority ? 'high' : undefined}
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Title */}
        <div className="px-3 lg:px-4 pt-3 pb-1">
          <span data-mobile-reveal="title" className="project-type-section-title">
            {translatedTitle}
          </span>
        </div>

        {/* Description - split into words for blur reveal */}
        <div className="px-3 lg:px-4 pt-0 pb-5">
          <p className="project-type-body--mobile flex flex-wrap gap-x-[0.3em] gap-y-[0.12em]">
            {words.map((word, i) => (
              <React.Fragment key={`${i}-${word}`}>
                <span
                  data-mobile-reveal="paragraph"
                  className="inline-block will-change-[opacity,transform]"
                >
                  {word}
                </span>
                {shouldBreakAfter(word, i) && <span className="basis-full h-[0.22em]" aria-hidden="true" />}
              </React.Fragment>
            ))}
          </p>
        </div>

        {/* CTA */}
        {cta && (
          <div data-mobile-reveal="cta" className="px-3 md:px-4 pb-6">
            <a
              href={cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="project-type-cta"
            >
              <span className="project-type-cta-text">
                <LetterSwapForward
                  label={translatedCtaLabel ?? cta.label}
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
  }

  // Desktop horizontal layout with blur reveal animations
  return (
    <div ref={desktopContainerRef} className={`flex flex-col gap-4 ${className}`}>
      {/* TITLE - appears first, no blur, slide up */}
      <span
        data-section-reveal="title"
        className="project-type-section-title"
      >
        {translatedTitle}
      </span>

      {/* PARAGRAPH - appears after title, with blur reveal per word */}
      <p className="project-type-body flex flex-wrap gap-x-[0.25em] gap-y-[0.15em]">
        {words.map((word, i) => (
          <React.Fragment key={`${i}-${word}`}>
            <span
              data-section-reveal="paragraph"
              className="inline-block will-change-[opacity,filter,transform]"
            >
              {word}
            </span>
            {shouldBreakAfter(word, i) && <span className="basis-full h-[0.22em]" aria-hidden="true" />}
          </React.Fragment>
        ))}
      </p>

      {/* CTA - appears last, after paragraph */}
      {cta && (
        <div data-section-reveal="cta" className="mt-2">
          <a
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="project-type-cta"
          >
            <span className="project-type-cta-text">
                <LetterSwapForward
                  label={translatedCtaLabel ?? cta.label}
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

export default ProjectSection;
