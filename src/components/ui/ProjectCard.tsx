import { useRef, forwardRef, useImperativeHandle } from 'react';

import { motion, useScroll, useVelocity, useSpring, useTransform } from 'motion/react';

import ProjectGallery from './ProjectGallery';
import './ProjectCard.css';

interface ProjectCardProps {
  id: string;
  images: string[];
  aspect?: string;
  isStatic?: boolean;
  isDesktop?: boolean;
  isPriorityImage?: boolean;
  onProjectClick?: () => void;
}

/**
 * ProjectCard Component
 * Shows a project image gallery with drag/swipe and vertical filmstrip preview.
 */
export const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(({
  id, images, aspect = 'aspect-[16/9]', isStatic = false, isDesktop = true, isPriorityImage = false, onProjectClick
}, ref) => {
  const localRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => localRef.current!);

  // Scroll-driven transforms for visual effect
  const { scrollYProgress } = useScroll({ target: localRef, offset: ["start end", "end start"] });
  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const skewYTransform = useTransform(smoothVelocity, [-1, 1], [-2, 2]);
  const microScaleTransform = useTransform(smoothVelocity, [-2, 0, 2], [1.02, 1, 0.98]);
  const microRotateTransform = useTransform(smoothVelocity, [-1, 1], [0.5, -0.5]);
   const skewY = isStatic ? 0 : skewYTransform;
   const microScale = isStatic ? 1 : microScaleTransform;
   const microRotate = isStatic ? 0 : microRotateTransform;

  // Gallery images
  const shouldPrioritizeImage = isDesktop && isPriorityImage;

  return (
    <motion.div
      ref={localRef}
      style={{ skewY, scale: microScale, rotate: microRotate, willChange: 'transform' }}
      className="flex flex-col gap-2 mb-6 md:mb-4 group"
    >

      {/* Image gallery — draggable + vertical filmstrip */}
      <div
        className={`project-img-mask relative w-full ${aspect} overflow-hidden rounded-[4px]`}
      >
        <ProjectGallery
          images={images}
          projectId={id}
          isPriorityImage={shouldPrioritizeImage}
          aspect={aspect}
          onClick={onProjectClick}
        />
        <div className="project-img-reveal-matte pointer-events-none absolute inset-y-0 -left-[18%] z-10 w-[42%]" />
      </div>

    </motion.div>
  );
});

ProjectCard.displayName = 'ProjectCard';
