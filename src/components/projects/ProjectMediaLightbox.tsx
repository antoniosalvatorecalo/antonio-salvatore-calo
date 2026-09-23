import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { ProjectMedia } from '@/cms/domain';
import { ProjectLightboxAsset } from './ProjectLightboxAsset';

interface Props {
  media: ProjectMedia;
  label: string;
  title: string;
  source: HTMLImageElement | null;
  reducedMotion: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

function getImageBounds(image: HTMLImageElement | null) {
  if (!image) return null;
  const rect = image.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0 || rect.right <= 0 || rect.left >= window.innerWidth)
    return null;
  const ratio = image.naturalWidth / image.naturalHeight || rect.width / rect.height;
  const width = Math.min(rect.width, rect.height * ratio);
  // Gallery images use object-fit: contain and object-position: center top.
  return { x: rect.left + (rect.width - width) / 2, y: rect.top, width, height: width / ratio };
}

export function ProjectMediaLightbox({
  media,
  label,
  title,
  source,
  reducedMotion,
  onClose,
  onPrevious,
  onNext,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [origin] = useState(() => getImageBounds(source));
  const [closing, setClosing] = useState(false);
  const [returnBounds, setReturnBounds] = useState(origin);
  const [hasNavigated, setHasNavigated] = useState(false);
  const sourceRef = useRef(source);
  const previous = useCallback(() => {
    setHasNavigated(true);
    onPrevious();
  }, [onPrevious]);
  const next = useCallback(() => {
    setHasNavigated(true);
    onNext();
  }, [onNext]);
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const ratio =
    (media.width && media.height ? media.width / media.height : 0) ||
    (source?.naturalWidth && source.naturalHeight
      ? source.naturalWidth / source.naturalHeight
      : 0) ||
    16 / 9;
  const gutter = viewport.width < 768 ? 24 : 80;
  const width = Math.min(viewport.width - gutter * 2, (viewport.height - 144) * ratio);
  const height = width / ratio;
  const target = {
    x: (viewport.width - width) / 2,
    y: (viewport.height - height) / 2 - 12,
    scale: 1,
    opacity: 1,
  };
  const thumbnail = (bounds: ReturnType<typeof getImageBounds>) =>
    bounds && !reducedMotion
      ? { x: bounds.x, y: bounds.y, scale: bounds.width / width, opacity: 1 }
      : { ...target, opacity: 0 };
  const close = useCallback(() => {
    if (reducedMotion) {
      onClose();
      return;
    }
    setReturnBounds(getImageBounds(source));
    setClosing(true);
  }, [onClose, reducedMotion, source]);

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      document.body.style.overflow = previousOverflow;
      const focusTarget = sourceRef.current?.closest('button') ?? previousFocus;
      if (focusTarget?.isConnected) focusTarget.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    sourceRef.current = source;
    const previousVisibility = source?.style.visibility;
    if (source) source.style.visibility = 'hidden';
    return () => {
      if (source) source.style.visibility = previousVisibility ?? '';
    };
  }, [source]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (closing) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previous();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      }
      if (event.key === 'Tab') {
        const elements =
          dialogRef.current?.querySelectorAll<HTMLElement>('button, a[href], iframe');
        const first = elements?.[0];
        const last = elements?.[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [close, closing, next, previous]);

  return (
    // Backdrop clicks supplement the close button and Escape key.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={dialogRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} media viewer`}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <motion.div
        className="lightbox-backdrop"
        initial={{ opacity: reducedMotion ? 1 : 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.24 }}
      />
      <button ref={closeRef} className="lightbox-close" aria-label="Close lightbox" onClick={close}>
        [close x]
      </button>
      <button
        className="lightbox-prev"
        aria-label="Previous image"
        disabled={closing}
        onClick={previous}
      >
        &lt;
      </button>
      <button className="lightbox-next" aria-label="Next image" disabled={closing} onClick={next}>
        &gt;
      </button>
      <AnimatePresence initial={true}>
        <motion.div
          key={media.key}
          className="lightbox-content"
          data-media-key={media.key}
          style={{ width, height, transformOrigin: '0 0' }}
          initial={
            reducedMotion ? target : hasNavigated ? { ...target, opacity: 0 } : thumbnail(origin)
          }
          exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.12 } }}
          animate={closing ? thumbnail(returnBounds) : target}
          transition={{
            duration: reducedMotion ? 0 : closing ? 0.26 : hasNavigated ? 0.16 : 0.34,
            ease: [0.22, 1, 0.36, 1],
          }}
          onAnimationComplete={() => {
            if (closing) onClose();
          }}
        >
          <ProjectLightboxAsset media={media} source={source} width={width} closing={closing} />
          <motion.div
            className="lightbox-name"
            initial={{ opacity: 0 }}
            animate={{ opacity: closing ? 0 : 1 }}
            transition={{
              duration: reducedMotion ? 0 : 0.16,
              delay: closing || reducedMotion || hasNavigated ? 0 : 0.18,
            }}
          >
            [{label}]
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
