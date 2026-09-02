'use client';

import { useRef, useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { LetterSwapForward } from './letter-swap';
import { CONTACT } from '../../content/contact';
import { orchestrator, SectionId } from '@/animations/orchestrator';
import { useReducedMotionPreference } from '@/providers/MotionPreferenceProvider';
import { useLanguage } from '../../providers/LanguageProvider';
import './AboutContact.css';

const SECTION_ID: SectionId = 'contact';

interface AboutContactProps {
  enabled?: boolean;
}

export const AboutContact = ({ enabled = true }: AboutContactProps) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleStep, setVisibleStep] = useState(0);
  const prefersReducedMotion = useReducedMotionPreference();

  useEffect(() => {
    if (!enabled) return;

    const timers: number[] = [];
    const revealLines = () => {
      if (prefersReducedMotion) {
        setVisibleStep(4 + CONTACT.socials.length);
        orchestrator.markComplete(SECTION_ID);
        return;
      }

      [1, 2, 3].forEach((step, index) => {
        timers.push(window.setTimeout(() => setVisibleStep(step), index * 180));
      });

      CONTACT.socials.forEach((_, index) => {
        timers.push(window.setTimeout(() => setVisibleStep(4 + index), 560 + index * 90));
      });

      timers.push(window.setTimeout(() => setVisibleStep(4 + CONTACT.socials.length), 560 + CONTACT.socials.length * 90));
      timers.push(window.setTimeout(() => orchestrator.markComplete(SECTION_ID), 1200));
    };

    // Register playFn - triggered when contact becomes visible (after services completes)
    orchestrator.registerPlayFn(SECTION_ID, () => {
      revealLines();
    });

    // Check if already visible (for instant/fast navigation)
    const status = orchestrator.getStatus(SECTION_ID);
    if (status === 'visible' || status === 'playing' || status === 'done') {
      revealLines();
    }

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      orchestrator.deregisterPlayFn(SECTION_ID);
    };
  }, [enabled, prefersReducedMotion]);

  return (
    <div className="contact-container [container-type:inline-size]" data-section="contact" ref={containerRef}>
      <div className="contact-inner">
        <div className="contact-role-block">
          <div className={`contact-overflow-wrap contact-step-line ${visibleStep >= 1 ? 'is-visible' : ''}`}>
            <span className="contact-label-text">{t('contact.role')}</span>
          </div>
          <div className={`contact-overflow-wrap contact-step-line ${visibleStep >= 2 ? 'is-visible' : ''}`}>
            <span className="contact-label-text contact-role-spacing">{t('contact.location')}</span>
          </div>
          <div className={`contact-email-wrap contact-step-line ${visibleStep >= 3 ? 'is-visible' : ''}`}>
            <a href={CONTACT.emailHref} className="contact-email hover-underline">
              <span className="letter-swap-container">
                <LetterSwapForward label={CONTACT.email} staggerDuration={0.015} transition={{ type: 'spring', duration: 0.5 }} />
              </span>
            </a>
          </div>
          <div className="contact-links-list" role="list">
            {CONTACT.socials.map((social, index) => (
              <div key={social.label} className={`contact-social-wrap contact-step-line ${visibleStep >= 4 + index ? 'is-visible' : ''}`} role="listitem">
                <a href={social.href} target="_blank" rel="noopener noreferrer" className="contact-social-link">
                  <span className="hover-underline">
                    <LetterSwapForward label={social.label} staggerDuration={0.015} transition={{ type: 'spring', duration: 0.5 }} />
                  </span>
                  <span className="nav-pill-arrow-mask" aria-hidden="true">
                    <ArrowUpRight className="nav-pill-arrow-icon" />
                  </span>
                </a>
              </div>
            ))}
            <div className={`contact-social-wrap contact-step-line ${visibleStep >= 4 + CONTACT.socials.length ? 'is-visible' : ''}`} role="listitem">
              <a href={CONTACT.phoneHref} className="contact-social-link">
                <span className="hover-underline">
                  <LetterSwapForward label={CONTACT.phone} staggerDuration={0.015} transition={{ type: 'spring', duration: 0.5 }} />
                </span>
                <span className="nav-pill-arrow-mask" aria-hidden="true">
                  <ArrowUpRight className="nav-pill-arrow-icon" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
