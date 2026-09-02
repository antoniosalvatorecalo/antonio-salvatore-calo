import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '../../../lib/gsap-setup';
import { useReducedMotionPreference } from '@/providers/MotionPreferenceProvider';
import { usePressedState } from '@/hooks/usePressedState';
import { LetterSwapBlock } from '../../../components/ui/letter-swap';
import type { ProjectData } from '@/content/projects';
import './GridProjectsView.css';

interface Props {
  projects: ProjectData[];
  onNavigate: (id: string) => void;
}

function GridCard({ project, onNavigate }: { project: ProjectData; onNavigate: (id: string) => void }) {
  const { isPressed, isPressedRef, onTouchStart, onTouchEnd, onTouchMove } = usePressedState();

  const handleClick = () => {
    if (isPressedRef.current) {
      isPressedRef.current = false;
      return;
    }
    onNavigate(project.id);
  };

  return (
    <div
      className={`grid-card flex flex-col gap-2 cursor-pointer${isPressed ? ' is-pressed' : ''}`}
      onClick={handleClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
    >
      <div className={`grid-card-img-container ${project.id === 'bugonia' ? 'grid-card-img-container--wide' : ''}`}>
        <img
          src={project.images[0]}
          alt={project.title}
          className="grid-card-img"
          loading="lazy"
          draggable={false}
        />
      </div>

      {project.images.length > 1 && (
        <div className="grid-card-filmstrip">
          {project.images.slice(0, 6).map((src, i) => (
            <div key={i} className="grid-card-filmstrip-thumb">
              <img
                src={src}
                alt=""
                width={60}
                height={40}
                loading="lazy"
                draggable={false}
                className="grid-card-filmstrip-img"
              />
            </div>
          ))}
        </div>
      )}

      <div className="grid-card-caption">
        <LetterSwapBlock
          lines={[project.titleLines?.[0] ?? project.title]}
          externalHovered={isPressed}
          className="grid-card-title"
        />
        <span className="grid-card-tags">
          {(project.tags ?? [project.category]).join(', ')}
        </span>
      </div>
    </div>
  );
}

export function GridProjectsView({ projects, onNavigate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = Array.from(container.querySelectorAll<HTMLElement>('.grid-card'));
    if (!cards.length) return;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        cards.forEach((card) => {
          gsap.set(card, { opacity: 1, y: 0, filter: 'blur(0px)', clearProps: 'willChange' });
          card.querySelectorAll<HTMLElement>('.grid-card-img-container, .grid-card-filmstrip, .grid-card-caption')
            .forEach((el) => gsap.set(el, { opacity: 1, y: 0, filter: 'blur(0px)', clearProps: 'willChange' }));
          card.classList.add('entrance-reveal-complete');
        });
        return;
      }

      cards.forEach((card) => {
        const imgContainer = card.querySelector<HTMLElement>('.grid-card-img-container');
        const caption = card.querySelector<HTMLElement>('.grid-card-caption');
        const filmstrip = card.querySelector<HTMLElement>('.grid-card-filmstrip');

        gsap.set(card, {
          opacity: 0,
          y: 24,
          filter: 'blur(6px)',
          willChange: 'opacity, transform, filter',
        });
        if (imgContainer) {
          gsap.set(imgContainer, { scale: 1.08, filter: 'blur(4px)', willChange: 'transform, filter' });
        }
        if (caption) {
          gsap.set(caption, { opacity: 0, y: 12, filter: 'blur(4px)', willChange: 'opacity, transform, filter' });
        }
        if (filmstrip) {
          gsap.set(filmstrip, { opacity: 0, y: 8, filter: 'blur(3px)', willChange: 'opacity, transform, filter' });
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            once: true,
            invalidateOnRefresh: true,
          },
          onComplete: () => {
            card.classList.add('entrance-reveal-complete');
            gsap.set([card, imgContainer, caption, filmstrip].filter(Boolean), { clearProps: 'willChange' });
          },
        });

        tl.to(card, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' }, 0)
          .to(imgContainer, { scale: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' }, 0.08)
          .to(caption, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' }, 0.18)
          .to(filmstrip, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.45, ease: 'power3.out' }, 0.26);
      });
    }, container);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="grid-projects-view"
      style={{ gridTemplateColumns: '2fr 1fr' }}
    >
      {projects.map((project) => (
        <GridCard key={project.id} project={project} onNavigate={onNavigate} />
      ))}
    </div>
  );
}
