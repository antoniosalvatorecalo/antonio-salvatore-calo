import { useState, useEffect, useCallback } from 'react';
import { isVimeoUrl } from '@/lib/vimeo';
import './ProjectPreview.css';

interface ProjectPreviewCarouselProps {
  images: string[];
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
        {isVimeoUrl(images[currentIndex]) ? (
          <div
            className="project-preview-video-placeholder"
            style={{
              background: '#1a1a1a',
              color: '#fff',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '48px', lineHeight: 1 }}>▶</div>
            <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
              {getImageName(images[currentIndex])}
            </div>
          </div>
        ) : (
          <img
            src={images[currentIndex]}
            alt=""
            className="project-preview-image"
          />
        )}
        <div className="project-preview-name">
          [{getImageName(images[currentIndex])}]
        </div>
      </div>
    </div>
  );
}

export default ProjectPreviewCarousel;
