import { useState, useEffect, useCallback, useMemo } from 'react';
import { isVimeoUrl, getVimeoEmbedUrl, getVimeoThumbnailUrl } from '@/lib/vimeo';
import type { ProjectDomain, ProjectMedia } from '@/cms/domain';
import './SingleProjectView.css';

export type SliderProjectData = Pick<ProjectDomain, 'slug' | 'title' | 'description' | 'media' | 'links'>;

interface SingleProjectViewProps {
  project: SliderProjectData;
  initialMediaKey?: string;
  interactive?: boolean;
}

function getImageName(media: ProjectMedia): string {
  if (media.label) return media.label;
  if (isVimeoUrl(media.src)) {
    const match = media.src.match(/vimeo\.com\/(\d+)/);
    return match ? `vimeo-${match[1]}` : 'vimeo-video';
  }
  const filename = media.src.split('/').pop() || '';
  const name = filename.replace(/\.(webp|jpg|jpeg|png)$/i, '');
  return name;
}

export function SingleProjectView({ project, initialMediaKey, interactive = true }: SingleProjectViewProps) {
  const allMedia = useMemo(() => project.media, [project.media]);
  const initialMediaIndex = initialMediaKey
    ? Math.max(0, allMedia.findIndex((media) => media.key === initialMediaKey))
    : 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(initialMediaIndex);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [loadedVideo, setLoadedVideo] = useState<string | null>(null);
  const [hasEnteredProject, setHasEnteredProject] = useState(interactive);
  const currentMedia = allMedia[currentImageIndex];
  const dimensions = currentMedia?.width && currentMedia.height
    ? {width: currentMedia.width, height: currentMedia.height}
    : undefined;

  useEffect(() => {
    if (interactive) setHasEnteredProject(true);
    else setIsHovered(false);
  }, [interactive]);

  useEffect(() => {
    setCurrentImageIndex(initialMediaIndex);
    setLightboxOpen(false);
  }, [initialMediaIndex, project.slug]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0));
  }, [allMedia.length]);

  useEffect(() => {
    if (lightboxOpen || !interactive) return;

    const interval = setInterval(() => {
      if (isHovered) {
        handleNextImage();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [handleNextImage, interactive, lightboxOpen, isHovered]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  const handleLightboxClose = () => {
    setLightboxOpen(false);
  };

  const handleImageClick = () => {
    if (interactive) setLightboxOpen(true);
  };

  return (
    <>
      <div className="single-project-view" data-project-transition-shell>
        <div className="single-project-content">
          <div className="single-project-carousel">
            <div 
              className="single-project-image-container"
              data-project-transition-target={project.slug}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : -1}
              aria-label={interactive ? `Open ${currentMedia.alt}` : undefined}
              onClick={handleImageClick}
              onKeyDown={(event) => {
                if (interactive && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  setLightboxOpen(true);
                }
              }}
              onMouseEnter={() => interactive && setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {currentMedia.type === 'vimeo' ? (
                <div className="single-project-video">
                  <img
                    src={currentMedia.thumbnailSrc ?? getVimeoThumbnailUrl(currentMedia.src)}
                    alt={currentMedia.alt}
                    data-transition-media
                    className="single-project-image"
                    width={1280}
                    height={720}
                  />
                  {(interactive || hasEnteredProject) && (
                    <iframe
                      title={`${project.title} — video`}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      src={getVimeoEmbedUrl(currentMedia.src)}
                      onLoad={() => setLoadedVideo(currentMedia.key)}
                      style={{ opacity: loadedVideo === currentMedia.key ? 1 : 0 }}
                    />
                  )}
                </div>
              ) : (
                <img
                  src={currentMedia.src}
                  alt={currentMedia.alt}
                  data-transition-media
                  width={dimensions?.width}
                  height={dimensions?.height}
                  decoding="async"
                  onError={() => setFailedImage(currentMedia.key)}
                  className="single-project-image"
                />
              )}
              {failedImage === currentMedia.key && <p role="status">Image unavailable.</p>}
            </div>
            <div className="single-project-name">
              [{getImageName(currentMedia)}]
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && interactive && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${project.title} media viewer`} onClick={handleLightboxClose}>
          <button autoFocus className="lightbox-close" aria-label="Close lightbox">[close x]</button>
          <button
            className="lightbox-prev"
            aria-label="Previous image"
            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1)); }}
          >
            &lt;
          </button>
          <button
            className="lightbox-next"
            aria-label="Next image"
            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0)); }}
          >
            &gt;
          </button>
          {currentMedia.type === 'vimeo' ? (
            <iframe
              src={getVimeoEmbedUrl(currentMedia.src)}
              title="Vimeo video"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              frameBorder="0"
              style={{ width: '100%', height: '100%' }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={currentMedia.src}
              alt={currentMedia.alt}
              className="lightbox-image"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </>
  );
}

export default SingleProjectView;
