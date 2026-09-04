import { useState, useRef, useCallback, useEffect, type FC } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';
import { useReducedMotionPreference } from '../../providers/MotionPreferenceProvider';
import { getProjectImageDimensions } from '../../content/projectImageMetadata';
import './ProjectGallery.css';

interface ProjectGalleryProps {
  images: string[];
  projectId: string;
  isPriorityImage?: boolean;
  aspect?: string;
  onClick?: () => void;
}

const GAP = 6; // must match CSS gap value

  const ProjectGallery: FC<ProjectGalleryProps> = ({
  images,
  projectId,
  isPriorityImage = false,
  aspect = 'aspect-[16/9]',
  onClick,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotionPreference();
  const dragX = useMotionValue(0);
  const containerWidthRef = useRef(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const pointerStartRef = useRef({ x: 0, y: 0 });

  const thumbnailDimensions = getProjectImageDimensions(images[0]);

  // Track container width on resize and force re-render for dragConstraints
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth;
      containerWidthRef.current = w;
      setContainerWidth(w);
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Snap to slide position when activeIndex or containerWidth changes
  useEffect(() => {
    const w = containerWidthRef.current;
    if (!w) return;

    const targetX = -activeIndex * (w + GAP);
    if (prefersReducedMotion) {
      dragX.set(targetX);
    } else {
      animate(dragX, targetX, {
        type: 'spring',
        stiffness: 340,
        damping: 34,
        mass: 0.85,
      });
    }
  }, [activeIndex, containerWidth, prefersReducedMotion, dragX]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const w = containerWidthRef.current;
      if (!w) return;

      const currentOffset = dragX.get();
      let targetIndex = Math.round(-currentOffset / (w + GAP));

      // Fast flick → force adjacent slide in that direction
      if (Math.abs(info.velocity.x) > 250) {
        if (info.velocity.x < -50 && activeIndex < images.length - 1) {
          targetIndex = activeIndex + 1;
        } else if (info.velocity.x > 50 && activeIndex > 0) {
          targetIndex = activeIndex - 1;
        }
      }

      // Big drag past threshold → move adjacent
      if (info.offset.x < -w * 0.15 && activeIndex < images.length - 1) {
        targetIndex = activeIndex + 1;
      } else if (info.offset.x > w * 0.15 && activeIndex > 0) {
        targetIndex = activeIndex - 1;
      }

      // Clamp
      targetIndex = Math.max(0, Math.min(images.length - 1, targetIndex));

      if (targetIndex !== activeIndex) {
        setActiveIndex(targetIndex);
      } else {
        // Snap back to current
        animate(dragX, -targetIndex * (w + GAP), {
          type: 'spring',
          stiffness: 400,
          damping: 36,
          mass: 0.8,
        });
      }
    },
    [activeIndex, images.length, dragX],
  );

  const goToImage = useCallback((index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className={`project-gallery relative w-full ${aspect} overflow-hidden rounded-[4px] select-none bg-[var(--bg-primary)]`}
      data-active-index={activeIndex + 1}
      style={{ touchAction: 'pan-y' }}
    >
      {/* ── Horizontal track with all images ── */}
      <motion.div
        className="project-gallery-track"
        drag={prefersReducedMotion ? false : 'x'}
        dragConstraints={{
          left: containerWidth > 0 ? -(images.length - 1) * (containerWidth + GAP) : 0,
          right: 0,
        }}
        dragElastic={0.06}
        onDragEnd={handleDragEnd}
        style={{ x: dragX }}
        whileTap={{ cursor: 'grabbing' }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="project-gallery-slide"
            onPointerDown={(e) => {
              pointerStartRef.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={(e) => {
              const dx = Math.abs(e.clientX - pointerStartRef.current.x);
              const dy = Math.abs(e.clientY - pointerStartRef.current.y);
              if (dx < 8 && dy < 8) {
                onClick?.();
              }
            }}
          >
            <img
              src={src}
              alt={`${projectId} image ${i + 1}`}
              width={thumbnailDimensions?.width}
              height={thumbnailDimensions?.height}
              loading={isPriorityImage && i === 0 ? 'eager' : 'lazy'}
              fetchPriority={isPriorityImage && i === 0 ? 'high' : undefined}
              decoding="async"
              draggable={false}
              className="project-gallery-img"
              style={{
                objectPosition: projectId === 'bugonia'
                  ? i === 0 ? 'center 52%' : 'center 35%'
                  : 'center center',
              }}
            />
          </div>
        ))}
      </motion.div>



      {/* ── Filmstrip gallery (horizontal, bottom-center) ── */}
      {images.length > 1 && (
        <div className="project-gallery-filmstrip">
          <div className="project-gallery-filmstrip-inner">
            {images.map((src, i) => (
              <button
                key={i}
                className={`project-gallery-filmstrip-thumb ${i === activeIndex ? 'is-active' : ''}`}
                onClick={() => goToImage(i)}
                aria-label={`View image ${i + 1}`}
                type="button"
              >
                <img
                  src={src}
                  alt=""
                  width={64}
                  height={44}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="project-gallery-filmstrip-img"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectGallery;
