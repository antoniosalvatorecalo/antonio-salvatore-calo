import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap-setup';
import { LetterSwapBlock } from './letter-swap';
import { useReducedMotionPreference } from '../../providers/MotionPreferenceProvider';
import './AboutHero.css';

export const AboutHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const photoWrap = container.querySelector<HTMLElement>('.hero-photo-wrap');
    const photo = container.querySelector<HTMLElement>('.hero-photo');
    const titleBlock = container.querySelector<HTMLElement>('.hero-title-block');
    const titleInner = container.querySelector<HTMLElement>('.hero-title-inner');
    const titleText = container.querySelector<HTMLElement>('.hero-title-text');

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([photoWrap, photo, titleBlock, titleInner, titleText], {
          opacity: 1,
          y: 0,
          x: 0,
          z: 0,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          filter: 'blur(0px)',
          clipPath: 'inset(0% 0% 0% 0%)',
        });
        return;
      }

      gsap.set(container, {
        perspective: 1200,
        transformStyle: 'preserve-3d',
      });
      gsap.set(photoWrap, {
        opacity: 0,
        y: 64,
        z: -120,
        rotateX: 8,
        scale: 0.94,
        filter: 'blur(18px) saturate(0.82) contrast(1.12)',
        clipPath: 'inset(22% 0% 18% 0%)',
        transformOrigin: '50% 70%',
        willChange: 'opacity, transform, filter, clip-path',
      });
      gsap.set(photo, {
        y: -30,
        scale: 1.16,
        filter: 'contrast(1.16) saturate(1.08)',
        transformOrigin: '50% 50%',
        willChange: 'transform, filter',
      });
      gsap.set(titleBlock, {
        opacity: 0,
        y: 42,
        z: -80,
        rotateX: 6,
        filter: 'blur(12px)',
        clipPath: 'inset(0% 0% 100% 0%)',
        transformOrigin: '0% 60%',
        willChange: 'opacity, transform, filter, clip-path',
      });
      gsap.set(titleInner, {
        x: -18,
        scale: 0.985,
        willChange: 'transform',
      });

      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          gsap.set([photoWrap, photo, titleBlock, titleInner], { clearProps: 'willChange' });
        },
      });

      tl.to(photoWrap, {
        opacity: 1,
        y: 0,
        z: 0,
        rotateX: 0,
        scale: 1,
        filter: 'blur(0px) saturate(1) contrast(1)',
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.18,
      }, 0)
        .to(photo, {
          y: 0,
          scale: 1,
          filter: 'contrast(1) saturate(1)',
          duration: 1.35,
        }, 0.04)
        .to(titleBlock, {
          opacity: 1,
          y: 0,
          z: 0,
          rotateX: 0,
          filter: 'blur(0px)',
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.0,
        }, 0.22)
        .to(titleInner, {
          x: 0,
          scale: 1,
          duration: 1.05,
        }, 0.22);
    }, container);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <div className="hero-container @container" data-section="hero" ref={containerRef}>
      <div className="hero-photo-wrap">
        <img
          src="/media/antonio-salvatore-calo.webp"
          alt="Antonio Salvatore Calo"
          width={2048}
          height={2048}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="hero-photo"
        />
      </div>

      <div className="hero-title-block">
        <div className="hero-title-inner">
          <LetterSwapBlock
            lines={['Antonio Salvatore Calò.']}
            className="hero-title-text"
            staggerDuration={0.03}
          />
        </div>
      </div>
    </div>
  );
};
