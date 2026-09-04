import { useState, useEffect, useCallback } from 'react';
import './ProjectPreview.css';

interface ProjectPreviewCarouselProps {
  images: string[];
}

function getImageName(path: string): string {
  const filename = path.split('/').pop() || '';
  const name = filename.replace(/\.(webp|jpg|jpeg|png)$/i, '');
  return name;
}

export function ProjectPreviewCarousel({ images }: ProjectPreviewCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const advanceImage = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    if (images.length === 0) return;

    setIsVisible(true);
    setCurrentIndex(0);

    const interval = setInterval(advanceImage, 1500);
    return () => clearInterval(interval);
  }, [images, advanceImage]);

  if (images.length === 0) return null;

  return (
    <div className={`project-preview ${isVisible ? 'is-visible' : ''}`}>
      <div className="project-preview-inner">
        <img
          src={images[currentIndex]}
          alt=""
          className="project-preview-image"
        />
        <div className="project-preview-name">
          [{getImageName(images[currentIndex])}]
        </div>
      </div>
    </div>
  );
}

export default ProjectPreviewCarousel;
