import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SiteHeader } from '../ui/SiteHeader';
import './SingleProjectView.css';

interface ProjectData {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  images: string[];
  links: { label: string; href: string }[];
}

interface SingleProjectViewProps {
  project: ProjectData;
  onClose: () => void;
}

function getImageName(path: string): string {
  const filename = path.split('/').pop() || '';
  const name = filename.replace(/\.(webp|jpg|jpeg|png)$/i, '');
  return name;
}

export function SingleProjectView({ project, onClose }: SingleProjectViewProps) {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const allImages = [project.coverImage, ...project.images.filter(img => img !== project.coverImage)];

  const handleBack = () => {
    onClose();
    navigate('/');
  };

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  }, [allImages.length]);

  useEffect(() => {
    if (lightboxOpen) return;

    const interval = setInterval(() => {
      if (isHovered) {
        handleNextImage();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [handleNextImage, lightboxOpen, isHovered]);

  const handleLightboxClose = () => {
    setLightboxOpen(false);
  };

  const handleImageClick = () => {
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="single-project-view is-active">
        <SiteHeader 
          projectInfo={{
            name: project.title,
            description: project.description,
            links: project.links,
          }}
          onBackToGallery={handleBack}
        />

        <div className="single-project-content">
          <div className="single-project-carousel">
            <div 
              className="single-project-image-container"
              onClick={handleImageClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <img
                src={allImages[currentImageIndex]}
                alt=""
                className="single-project-image"
              />
            </div>
            <div className="single-project-name">
              [{getImageName(allImages[currentImageIndex])}]
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && (
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
          <img
            src={allImages[currentImageIndex]}
            alt=""
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default SingleProjectView;
