import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from '../../lib/gsap-setup';
import { useReducedMotionPreference } from '../../providers/MotionPreferenceProvider';
import './Editorial.css';

type GridItem = {
  src: string;
  projectId: string;
  span: number;
  aspect: string;
};

const items: GridItem[] = [
  { src: '/media/bugonia/Thumbnail.webp',   projectId: 'bugonia',   span: 2, aspect: '4/3'  },
  { src: '/media/newsquest/Thumbnail.webp', projectId: 'newsquest', span: 1, aspect: '3/4'  },
  { src: '/media/bugonia/1.webp',           projectId: 'bugonia',   span: 1, aspect: '3/4'  },
  { src: '/media/newsquest/1.webp',         projectId: 'newsquest', span: 2, aspect: '4/3'  },
  { src: '/media/newsquest/2.webp',         projectId: 'newsquest', span: 3, aspect: '21/9' },
  { src: '/media/bugonia/2.webp',           projectId: 'bugonia',   span: 1, aspect: '1/1'  },
  { src: '/media/newsquest/3.webp',         projectId: 'newsquest', span: 1, aspect: '1/1'  },
  { src: '/media/bugonia/3.webp',           projectId: 'bugonia',   span: 1, aspect: '1/1'  },
  { src: '/media/bugonia/4.webp',           projectId: 'bugonia',   span: 2, aspect: '16/9' },
  { src: '/media/newsquest/4.webp',         projectId: 'newsquest', span: 1, aspect: '3/4'  },
  { src: '/media/newsquest/5.webp',         projectId: 'newsquest', span: 1, aspect: '3/4'  },
  { src: '/media/bugonia/5.webp',           projectId: 'bugonia',   span: 2, aspect: '16/9' },
];

const labels: Record<string, string> = {
  bugonia:   'BUGONIA',
  newsquest: 'NEWSQUEST',
};

export default function Editorial({ isActive }: { isActive: boolean }) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotionPreference();

  useEffect(() => {
    if (!isActive) return;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set('.editorial-cell', { clipPath: 'inset(0% 0 0 0)', opacity: 1 });
        return;
      }

      // Wow entry: clip-path wipe from bottom
      gsap.fromTo(
        '.editorial-cell',
        {
          clipPath: 'inset(100% 0 0 0)',
          opacity: 0,
        },
        {
          clipPath: 'inset(0% 0 0 0)',
          opacity: 1,
          duration: 0.8,
          ease: 'power4.out',
          stagger: { amount: 0.6, from: 'start' },
          clearProps: 'clipPath,opacity,transform',
        }
      );

      // GSAP hover: image scale on each cell
      const cells = containerRef.current
        ? Array.from(containerRef.current.querySelectorAll<HTMLElement>('.editorial-cell'))
        : [];

      cells.forEach((cell) => {
        const img = cell.querySelector<HTMLElement>('.editorial-cell-img');
        if (!img) return;

        const onEnter = () => {
          gsap.to(img, {
            scale: 1.08,
            duration: 0.55,
            ease: 'power3.out',
            overwrite: true,
          });
        };
        const onLeave = () => {
          gsap.to(img, {
            scale: 1,
            duration: 0.45,
            ease: 'power3.out',
            overwrite: true,
          });
        };

        cell.addEventListener('mouseenter', onEnter);
        cell.addEventListener('mouseleave', onLeave);

        (cell as HTMLElement & { _editorialCleanup?: () => void })._editorialCleanup = () => {
          cell.removeEventListener('mouseenter', onEnter);
          cell.removeEventListener('mouseleave', onLeave);
        };
      });
    }, containerRef);

    return () => {
      if (containerRef.current) {
        containerRef.current
          .querySelectorAll<HTMLElement & { _editorialCleanup?: () => void }>('.editorial-cell')
          .forEach((cell) => cell._editorialCleanup?.());
      }
      ctx.revert();
    };
  }, [isActive, prefersReducedMotion]);

  return (
    <div ref={containerRef} className="editorial-grid-wrap">
      <div className="editorial-grid">
        {items.map((item, i) => (
          <div
            key={i}
            className="editorial-cell group"
            style={{ gridColumn: `span ${item.span}` }}
            onClick={() => navigate(`/projects/${item.projectId}`)}
            onMouseEnter={() => setHovered(item.projectId)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="editorial-cell-img-wrap" style={{ aspectRatio: item.aspect }}>
              <img
                src={item.src}
                alt=""
                className={`editorial-cell-img${hovered !== null && hovered !== item.projectId ? ' is-dimmed' : ''}`}
                loading="lazy"
                draggable={false}
              />
            </div>
            <p className="editorial-cell-label">{labels[item.projectId]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
