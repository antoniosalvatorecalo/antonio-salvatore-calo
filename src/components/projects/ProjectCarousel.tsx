import { useRef, useState, useCallback } from 'react';
import { isVimeoUrl } from '@/lib/vimeo';
import './ProjectCarousel.css';

interface ProjectCarouselProps {
  images: string[];
  onImageClick?: (index: number) => void;
}

export function ProjectCarousel({ images, onImageClick }: ProjectCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    containerRef.current.style.cursor = 'grabbing';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  }, []);

  const handleImageClick = useCallback((index: number) => {
    if (!isDragging && onImageClick) {
      onImageClick(index);
    }
  }, [isDragging, onImageClick]);

  return (
    <div
      ref={containerRef}
      className="carousel-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {images.map((src, i) => (
        <div
          key={i}
          className="carousel-item"
          onClick={() => handleImageClick(i)}
        >
          {isVimeoUrl(src) ? (
            <div
              className="carousel-video-placeholder"
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
            </div>
          ) : (
            <img src={src} alt="" draggable={false} />
          )}
        </div>
      ))}
    </div>
  );
}

export default ProjectCarousel;
