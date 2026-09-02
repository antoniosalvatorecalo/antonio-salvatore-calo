'use client';

import { useRef, useEffect, Fragment } from 'react';
import { gsap } from '@/lib/gsap-setup';
import { orchestrator, type SectionId } from '../../animations/orchestrator';
import { useReducedMotionPreference } from '@/providers/MotionPreferenceProvider';
import { useLanguage } from '../../providers/LanguageProvider';
import { usePressedState } from '@/hooks/usePressedState';
import { Palette, Search, Monitor, Boxes, Play, Activity } from 'lucide-react';
import './AboutSection.css';

const SERVICE_ICONS = {
  ui: <Palette size={36} strokeWidth={1.5} />,
  ux: <Search size={36} strokeWidth={1.5} />,
  web: <Monitor size={36} strokeWidth={1.5} />,
  systems: <Boxes size={36} strokeWidth={1.5} />,
  prototypes: <Play size={36} strokeWidth={1.5} />,
  motion: <Activity size={36} strokeWidth={1.5} />,
};

/* ═══════════════════════════════════════════════════════════════════════════════
   Service Card
   ═══════════════════════════════════════════════════════════════════════════════ */

function ServiceCard({
  label,
  description,
  icon,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTlRef = useRef<gsap.core.Timeline | null>(null);
  const prefersReducedMotion = useReducedMotionPreference();
  const { isPressed, isPressedRef, onTouchStart, onTouchEnd, onTouchMove } = usePressedState();

  // Hover animation timeline (desktop mouseenter + mobile long-press)
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const iconEl = card.querySelector('[data-svc-icon]') as HTMLElement;
    const labelEl = card.querySelector('[data-svc-label]') as HTMLElement;
    const descEl = card.querySelector('[data-svc-desc]') as HTMLElement;
    if (!labelEl || !descEl) return;

    const ctx = gsap.context(() => {
      gsap.set(descEl, { yPercent: 115, opacity: 0 });

      const hoverTl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
        .to(iconEl ?? [], { y: -4, duration: 0.36 }, 0)
        .to(labelEl, { y: () => -(descEl.offsetHeight + 12), duration: 0.42 }, 0)
        .to(descEl, { yPercent: 0, opacity: 1, duration: 0.5 }, 0.04);

      hoverTlRef.current = hoverTl;

      const onEnter = () => { if (!prefersReducedMotion) hoverTl.play(); };
      const onLeave = () => { hoverTl.reverse(); };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);
      card.addEventListener('focusin', onEnter);
      card.addEventListener('focusout', onLeave);

      return () => {
        card.removeEventListener('mouseenter', onEnter);
        card.removeEventListener('mouseleave', onLeave);
        card.removeEventListener('focusin', onEnter);
        card.removeEventListener('focusout', onLeave);
        hoverTl.kill();
        hoverTlRef.current = null;
      };
    }, card);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Long press → play/reverse hover timeline
  useEffect(() => {
    const tl = hoverTlRef.current;
    if (!tl) return;
    if (isPressed && !prefersReducedMotion) {
      tl.play();
    } else if (!isPressed) {
      tl.reverse();
    }
  }, [isPressed, prefersReducedMotion]);

  const handleClick = () => {
    if (isPressedRef.current) {
      isPressedRef.current = false;
      return;
    }
  };

  return (
    <div
      ref={cardRef}
      className="about-service-card"
      onClick={handleClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
    >
      <div data-svc-icon className="about-service-icon">{icon}</div>
      <div className="about-service-bottom">
        <span data-svc-label className="about-service-label">{label}</span>
      </div>
      <div className="about-service-desc-mask">
        <p data-svc-desc className="about-service-desc">{description}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   AboutSection — Main 2-Column Layout
   ═══════════════════════════════════════════════════════════════════════════════ */

const SECTION_ID: SectionId = 'about';

interface AboutSectionProps {
  enabled?: boolean;
}

export const AboutSection = ({ enabled = true }: AboutSectionProps) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotionPreference();

  const BIO_TEXT = t('about.bio');
  const PRINCIPLES = [
    { title: t('principles.vc-title'), desc: t('principles.vc-desc') },
    { title: t('principles.st-title'), desc: t('principles.st-desc') },
    { title: t('principles.uc-title'), desc: t('principles.uc-desc') },
  ];
  const SERVICES = [
    { key: 'ui', label: t('services.ui-design'), description: t('services.ui-desc'), icon: SERVICE_ICONS.ui },
    { key: 'ux', label: t('services.ux-design'), description: t('services.ux-desc'), icon: SERVICE_ICONS.ux },
    { key: 'web', label: t('services.web-design'), description: t('services.web-desc'), icon: SERVICE_ICONS.web },
    { key: 'systems', label: t('services.systems'), description: t('services.systems-desc'), icon: SERVICE_ICONS.systems },
    { key: 'prototypes', label: t('services.prototypes'), description: t('services.prototypes-desc'), icon: SERVICE_ICONS.prototypes },
    { key: 'motion', label: t('services.motion'), description: t('services.motion-desc'), icon: SERVICE_ICONS.motion },
  ];

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const photo = container.querySelector<HTMLElement>('.about-photo');
    const photoWrap = container.querySelector<HTMLElement>('.about-photo-wrap');
    const bioLabel = container.querySelector<HTMLElement>('.about-bio-label');
    const bioWords = container.querySelectorAll<HTMLElement>('[data-reveal="bio-word"]');
    const principlesLabel = container.querySelector<HTMLElement>('.about-principles-label');
    const principleItems = container.querySelectorAll<HTMLElement>('.about-principle-item');
    const servicesLabel = container.querySelector<HTMLElement>('.about-services-label');
    const serviceCards = container.querySelectorAll<HTMLElement>('.about-service-card');

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        const allPrincipleEls = Array.from(principleItems).flatMap(item =>
          [item.querySelector('[data-reveal="principle-title"]'), ...Array.from(item.querySelectorAll('[data-reveal="principle-word"]'))]
        ).filter(Boolean);
        gsap.set(
          [photoWrap, photo, bioLabel, principlesLabel, servicesLabel, ...Array.from(serviceCards), ...Array.from(bioWords), ...allPrincipleEls].filter(Boolean),
          { opacity: 1, y: 0, filter: 'blur(0px)', clearProps: 'willChange' }
        );
        orchestrator.markComplete(SECTION_ID);
        return;
      }

      // ── Initial states — tutto dal basso, uniforme ──
      gsap.set(photoWrap, { opacity: 0, y: 48, filter: 'blur(12px)' });
      gsap.set([bioLabel, principlesLabel, servicesLabel], { opacity: 0, y: 48, scale: 0.94, filter: 'blur(8px)' });
      gsap.set(bioWords, { opacity: 0, y: 20, filter: 'blur(8px)', willChange: 'opacity, transform, filter' });
      // Services cards — riga inferiore più drammatica
      Array.from(serviceCards).forEach((card, i) => {
        const isBottomRow = i >= 3;
        gsap.set(card, {
          opacity: 0,
          y: isBottomRow ? 110 : 36,
          filter: isBottomRow ? 'blur(14px)' : 'blur(6px)',
        });
      });

      // Principle items — set per-block titles + desc words
      Array.from(principleItems).forEach((item) => {
        const title = item.querySelector('[data-reveal="principle-title"]');
        const words = item.querySelectorAll('[data-reveal="principle-word"]');
        if (title) gsap.set(title, { opacity: 0, y: 32, filter: 'blur(8px)', willChange: 'opacity, transform, filter' });
        gsap.set(words, { opacity: 0, y: 20, filter: 'blur(8px)', willChange: 'opacity, transform, filter' });
      });

      const tl = gsap.timeline({
        paused: false,
        onComplete: () => orchestrator.markComplete(SECTION_ID),
      });

      // Photo reveal
      tl.to(photoWrap, {
        opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.65, ease: 'power3.out',
      }, 0);

      // Bio label → words blur reveal (staggered)
      tl.to(bioLabel, {
        opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.55, ease: 'back.out(1.2)',
      }, 0.2);
      tl.to(bioWords, {
        opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.45, ease: 'power3.out', stagger: 0.02,
        clearProps: 'filter,willChange',
      }, 0.28);

      // Principles label
      tl.to(principlesLabel, {
        opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.55, ease: 'back.out(1.2)',
      }, 0.38);

      // Ogni blocco principio: titolo → desc parole (sequenziale)
      let blockTime = 0.44;
      Array.from(principleItems).forEach((item) => {
        const title = item.querySelector('[data-reveal="principle-title"]');
        const words = item.querySelectorAll('[data-reveal="principle-word"]');
        if (title) {
          tl.to(title, {
            opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4, ease: 'back.out(1.2)',
            clearProps: 'filter,willChange',
          }, blockTime);
        }
        tl.to(words, {
          opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4, ease: 'power3.out', stagger: 0.018,
          clearProps: 'filter,willChange',
        }, blockTime + 0.15);
        blockTime += 0.3;
      });

      // Services label + cards — ATTENDE principio word blur COMPLETO
      tl.to(servicesLabel, {
        opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.55, ease: 'back.out(1.2)',
      }, '>');
      tl.to(serviceCards, {
        opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', stagger: { each: 0.09, from: 'end' },
      }, '>');

      // Play immediately — standalone page, no cascade needed
      orchestrator.markVisible(SECTION_ID);
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [enabled, prefersReducedMotion]);

  return (
    <div ref={containerRef} className="about-section-root" data-section="about">
      {/* ── Left Column: Photo + Bio ── */}
      <div className="about-col-left">
        <div className="about-photo-wrap">
          <img
            src="/media/antonio-salvatore-calo.webp"
            alt="Antonio Salvatore Calo"
            width={2048}
            height={2048}
            loading="eager"
            decoding="async"
            className="about-photo"
          />
        </div>
        <div className="about-bio-wrap">
          <span className="about-bio-label">{t('about.label')}</span>
          <p className="about-bio-text">
            {BIO_TEXT.split(/\s+/).filter(Boolean).map((word, i) => (
              <Fragment key={i}>
                <span data-reveal="bio-word" className="inline-block will-change-[opacity,filter,transform]">{word}</span>
                {i < BIO_TEXT.split(/\s+/).filter(Boolean).length - 1 && ' '}
              </Fragment>
            ))}
          </p>
        </div>
      </div>

      {/* ── Right Column: Principles + Services ── */}
      <div className="about-col-right">
        {/* Principles */}
        <div className="about-principles-wrap">
          <span className="about-principles-label">{t('principles.label')}</span>
          <div className="about-principles-list">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="about-principle-item">
                <span data-reveal="principle-title" className="about-principle-title">{p.title}</span>
                <span className="about-principle-desc">
                  {p.desc.split(/\s+/).filter(Boolean).map((word, i, arr) => (
                    <Fragment key={i}>
                      <span data-reveal="principle-word" className="inline-block will-change-[opacity,filter,transform]">{word}</span>
                      {i < arr.length - 1 && ' '}
                    </Fragment>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="about-services-wrap">
          <span className="about-services-label">{t('services.label')}</span>
          <div className="about-services-grid">
            {SERVICES.map((s) => (
              <ServiceCard key={s.key} label={s.label} description={s.description} icon={s.icon} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
