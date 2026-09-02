'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap-setup';
import { orchestrator, SectionId } from '@/animations/orchestrator';
import { useReducedMotionPreference } from '@/providers/MotionPreferenceProvider';
import { useLanguage } from '../../providers/LanguageProvider';
import './AboutServices.css';

const SECTION_ID: SectionId = 'services';

function ServiceCard({ label, description, icon }: { label: string; description: string; icon: React.ReactNode }) {
  return (
    <div
      data-service-card 
      className="service-card" 
    >
      <div data-service-icon className="service-icon">{icon}</div>
      <div className="service-card-bottom">
        <span data-service-label className="service-label">{label}</span>
      </div>
      <div className="service-desc-mask">
        <p data-service-desc className="service-desc">{description}</p>
      </div>
    </div>
  );
}

interface AboutServicesProps {
  enabled?: boolean;
}

export const AboutServices = ({ enabled = true }: AboutServicesProps) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotionPreference();

  const SERVICES = [
    { label: t('services.ui-design'), description: t('services.ui-desc'), icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="16"/><line x1="2" y1="8" x2="22" y2="8"/><rect x="4" y="11" width="6" height="5"/></svg> },
    { label: t('services.ux-design'), description: t('services.ux-desc'), icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2.5"/><line x1="12" y1="7.5" x2="12" y2="12"/><line x1="12" y1="12" x2="7" y2="17"/></svg> },
    { label: t('services.web-design'), description: t('services.web-desc'), icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="1"/></svg> },
    { label: t('services.systems'), description: t('services.systems-desc'), icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="2"/><circle cx="4" cy="20" r="2"/><circle cx="20" cy="20" r="2"/></svg> },
    { label: t('services.prototypes'), description: t('services.prototypes-desc'), icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="8" height="14" rx="1"/><rect x="14" y="5" width="8" height="14" rx="1"/></svg> },
    { label: t('services.motion'), description: t('services.motion-desc'), icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="8" x2="16" y2="8"/><line x1="5" y1="12" x2="16" y2="12"/></svg> },
  ];

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const label = container.querySelector('[data-reveal="label"]');
      const cards = container.querySelectorAll<HTMLElement>('[data-service-card]');

      if (prefersReducedMotion) {
        gsap.set([label, ...Array.from(cards)].filter(Boolean), {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          clearProps: 'willChange',
        });
        orchestrator.markComplete(SECTION_ID);
        return;
      }

      // Initial blur state
      gsap.set(label, { opacity: 0, y: -12, filter: 'blur(8px)' });
      gsap.set(cards, { opacity: 0, y: 24, filter: 'blur(6px)' });

      cards.forEach((card) => {
        const iconEl = card.querySelector<HTMLElement>('[data-service-icon]');
        const labelEl = card.querySelector<HTMLElement>('[data-service-label]');
        const descEl = card.querySelector<HTMLElement>('[data-service-desc]');
        if (!labelEl || !descEl) return;

        gsap.set(descEl, { yPercent: 115, opacity: 0 });

        const hoverTl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
          .to(iconEl ?? [], { y: -4, duration: 0.36 }, 0)
          .to(labelEl, { y: () => -(descEl.offsetHeight + 12), duration: 0.42 }, 0)
          .to(descEl, { yPercent: 0, opacity: 1, duration: 0.5 }, 0.04);

        const hoverStart = () => hoverTl.play();
        const hoverEnd = () => hoverTl.reverse();
        card.addEventListener('mouseenter', hoverStart);
        card.addEventListener('mouseleave', hoverEnd);
        card.addEventListener('focusin', hoverStart);
        card.addEventListener('focusout', hoverEnd);
        cleanups.push(() => {
          card.removeEventListener('mouseenter', hoverStart);
          card.removeEventListener('mouseleave', hoverEnd);
          card.removeEventListener('focusin', hoverStart);
          card.removeEventListener('focusout', hoverEnd);
          hoverTl.kill();
        });
      });

      const tl = gsap.timeline({ 
        paused: true, 
        onComplete: () => orchestrator.markComplete(SECTION_ID) 
      });

      // Reveal label first
      tl.to(label, { 
        opacity: 1, 
        y: 0, 
        filter: 'blur(0px)', 
        duration: 0.75, 
        ease: 'power3.out' 
      }, 0);

      // Reveal cards in cascade with blur
      tl.to(cards, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.13
      }, 0.22);

      orchestrator.registerPlayFn(SECTION_ID, () => tl.play());
    }, containerRef);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      orchestrator.deregisterPlayFn(SECTION_ID);
      ctx.revert();
    };
  }, [enabled, prefersReducedMotion]);

  return (
    <div ref={containerRef} data-section="services" className="services-container">
      <div className="services-label-wrap"><span data-reveal="label" className="services-label">{t('services.label')}</span></div>
      <div className="services-grid">
        {SERVICES.map((s) => <ServiceCard key={s.label} {...s} />)}
      </div>
    </div>
  );
};
