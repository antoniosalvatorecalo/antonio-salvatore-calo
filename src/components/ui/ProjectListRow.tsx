import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from '../../lib/gsap-setup';
import type { ProjectData } from '../../content/projects';
import { workProjectExtrasRegistry } from '../../content/workProjectExtras';
import { LetterSwapBlock } from './letter-swap';
import { useReducedMotionPreference } from '../../providers/MotionPreferenceProvider';
import './ProjectListRow.css';

const IMAGE_W = 180;
const GAP = 8;

interface Props {
  project: ProjectData;
  onViewProject: () => void;
}

export const ProjectListRow = ({ project, onViewProject }: Props) => {
  const thumbnails = project.images.slice(0, 3);
  const loopImages = [...thumbnails, ...thumbnails];
  const LOOP_WIDTH = (IMAGE_W + GAP) * thumbnails.length;
  const extras = workProjectExtrasRegistry[project.id];

  const rowRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotionPreference();

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (prefersReducedMotion) return;
    tweenRef.current?.kill();
    gsap.set(stripRef.current, { x: 0 });
    tweenRef.current = gsap.to(stripRef.current, {
      x: -LOOP_WIDTH,
      duration: 3,
      ease: 'none',
      repeat: -1,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    tweenRef.current?.kill();
    tweenRef.current = null;
    gsap.set(stripRef.current, { x: 0 });
  };

  useEffect(() => {
    return () => {
      tweenRef.current?.kill();
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (prefersReducedMotion) {
      gsap.set(panel, { height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 });
      return;
    }
    if (isExpanded) {
      gsap.fromTo(
        panel,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.45, ease: 'power3.out' }
      );
    } else {
      gsap.to(panel, { height: 0, opacity: 0, duration: 0.3, ease: 'power3.in' });
    }
  }, [isExpanded, prefersReducedMotion]);

  const toggleExpanded = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsExpanded((v) => !v);
  };

  return (
    <div ref={rowRef} className="project-list-row-wrap">
      <div
        onClick={onViewProject}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="project-list-row flex items-center py-8 px-2 gap-6 cursor-pointer transition-colors duration-200 w-full"
      >
        {/* Text column: title + tags stacked */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <LetterSwapBlock
            lines={project.titleLines ?? [project.title]}
            externalHovered={isHovered && !prefersReducedMotion}
            className="project-list-title work-list-title-swap text-(--text-primary)"
          />

          <div className="project-list-tags flex flex-row flex-wrap gap-2">
            {(project.tags ?? [project.category]).map((tag) => (
              <span
                key={tag}
                className="backdrop-blur-sm bg-white/10 border border-white/20 text-xs px-2 py-0.5 rounded text-(--text-muted) uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Carousel + plus trigger */}
        <div
          className="shrink-0 overflow-hidden flex"
          style={{ width: IMAGE_W * thumbnails.length + GAP * (thumbnails.length - 1) + IMAGE_W + GAP, gap: GAP }}
        >
          <div className="shrink-0 overflow-hidden" style={{ width: IMAGE_W * thumbnails.length + GAP * (thumbnails.length - 1) }}>
            <div ref={stripRef} className="flex" style={{ gap: GAP }}>
              {loopImages.map((src, i) => (
                <div
                  key={i}
                  className="shrink-0 overflow-hidden project-list-thumb-cell"
                  style={{ width: IMAGE_W, height: IMAGE_W }}
                >
                  <img
                    src={src}
                    alt=""
                    className={`project-list-thumb w-full h-full object-cover ${!prefersReducedMotion && !isHovered ? 'project-list-thumb-blur' : ''}`}
                    style={{ transform: 'scale(1.15)' }}
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>

          {extras && (
            <button
              type="button"
              onClick={toggleExpanded}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Hide project credits' : 'Show project credits'}
              className={`project-list-plus-trigger shrink-0 flex items-center justify-center text-(--text-primary) ${isExpanded ? 'is-active' : ''}`}
              style={{ width: IMAGE_W, height: IMAGE_W }}
            >
              <span className="project-list-plus-icon" aria-hidden="true">
                {isExpanded ? '×' : '+'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable credits + CTA panel */}
      {extras && (
        <div
          ref={panelRef}
          className="project-list-credits-panel"
          style={{ height: 0, opacity: 0, overflow: 'hidden' }}
          aria-hidden={!isExpanded}
        >
          <div className="project-list-credits-inner">
            <div className="project-list-credits-grid">
              {extras.credits.map((c, i) => (
                <div key={i} className="project-list-credit-item">
                  <span className="project-list-credit-label">{c.label}</span>
                  <div className="project-list-credit-values">
                    {c.values.map((v, j) => (
                      <span key={j} className="project-list-credit-value">{v}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="project-list-cta-row">
              <Link
                to={extras.projectRoute}
                className="project-list-cta-primary"
                onClick={(e) => e.stopPropagation()}
              >
                Open project page
                <span aria-hidden="true" className="project-list-cta-arrow">→</span>
              </Link>
              {extras.links.map((l, i) => (
                <a
                  key={i}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="project-list-cta-secondary"
                  onClick={(e) => e.stopPropagation()}
                >
                  {l.label}
                  <span aria-hidden="true" className="project-list-cta-arrow">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};