import { useState, useEffect, useCallback, useMemo } from 'react';
import { isVimeoUrl, getVimeoEmbedUrl, getVimeoThumbnailUrl } from '@/lib/vimeo';
import { getProjectImageDimensions } from '@/content/projectImageMetadata';
import './SingleProjectView.css';

export interface SliderProjectData {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  images: string[];
  links: { label: string; href: string }[];
}

interface SingleProjectViewProps {
  project: SliderProjectData;
  initialImage?: string;
  interactive?: boolean;
}

function getImageName(path: string): string {
  if (isVimeoUrl(path)) {
    const match = path.match(/vimeo\.com\/(\d+)/);
    return match ? `vimeo-${match[1]}` : 'vimeo-video';
  }
  const filename = path.split('/').pop() || '';
  const name = filename.replace(/\.(webp|jpg|jpeg|png)$/i, '');
  return name;
}

export function SingleProjectView({ project, initialImage, interactive = true }: SingleProjectViewProps) {
  const allImages = useMemo(
    () => [project.coverImage, ...project.images.filter((image) => image !== project.coverImage)],
    [project.coverImage, project.images],
  );
  const initialImageIndex = initialImage ? Math.max(0, allImages.indexOf(initialImage)) : 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [loadedVideo, setLoadedVideo] = useState<string | null>(null);
  const [hasEnteredProject, setHasEnteredProject] = useState(interactive);
  const currentImage = allImages[currentImageIndex];
  const dimensions = getProjectImageDimensions(currentImage);

  useEffect(() => {
    if (interactive) setHasEnteredProject(true);
    else setIsHovered(false);
  }, [interactive]);

  useEffect(() => {
    setCurrentImageIndex(initialImageIndex);
    setLightboxOpen(false);
  }, [initialImageIndex, project.slug]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  }, [allImages.length]);

  useEffect(() => {
    if (lightboxOpen || !interactive) return;

    const interval = setInterval(() => {
      if (isHovered) {
        handleNextImage();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [handleNextImage, interactive, lightboxOpen, isHovered]);

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
              onClick={handleImageClick}
              onMouseEnter={() => interactive && setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isVimeoUrl(currentImage) ? (
                <div className="single-project-video">
                  <img
                    src={getVimeoThumbnailUrl(currentImage)}
                    alt={project.title}
                    data-transition-media
                    className="single-project-image"
                    width={1280}
                    height={720}
                  />
                  {(interactive || hasEnteredProject) && (
                    <iframe
                      src={getVimeoEmbedUrl(currentImage)}
                      title={`${project.title} — video`}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      onLoad={() => setLoadedVideo(currentImage)}
                      style={{ opacity: loadedVideo === currentImage ? 1 : 0 }}
                    />
                  )}
                </div>
              ) : (
                <img
                  src={currentImage}
                  alt={project.title}
                  data-transition-media
                  width={dimensions?.width}
                  height={dimensions?.height}
                  decoding="async"
                  onError={() => setFailedImage(currentImage)}
                  className="single-project-image"
                />
              )}
              {failedImage === currentImage && <p role="status">Image unavailable.</p>}
            </div>
            <div className="single-project-name">
              [{getImageName(allImages[currentImageIndex])}]
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && interactive && (
        <div className="lightbox" onClick={handleLightboxClose}>
          <button className="lightbox-close" aria-label="Close lightbox">[close x]</button>
          <button
            className="lightbox-prev"
            aria-label="Previous image"
            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1)); }}
          >
            &lt;
          </button>
          <button
            className="lightbox-next"
            aria-label="Next image"
            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0)); }}
          >
            &gt;
          </button>
          {isVimeoUrl(allImages[currentImageIndex]) ? (
            <iframe
              src={getVimeoEmbedUrl(allImages[currentImageIndex])}
              title="Vimeo video"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              frameBorder="0"
              style={{ width: '100%', height: '100%' }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={allImages[currentImageIndex]}
              alt=""
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
