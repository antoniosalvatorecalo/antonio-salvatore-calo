import { useState, useEffect } from 'react';
import { isVimeoUrl } from '@/lib/vimeo';
import './ProjectPreview.css';

interface ProjectPreviewProps {
  imageUrl: string | null;
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

export function ProjectPreview({ imageUrl }: ProjectPreviewProps) {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (imageUrl) {
      setCurrentImage(imageUrl);
      setIsVisible(true);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setCurrentImage(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [imageUrl]);

  if (!currentImage) {
    return null;
  }

  return (
    <div className={`project-preview ${isVisible ? 'is-visible' : ''}`}>
      <div className="project-preview-inner">
        {isVimeoUrl(currentImage) ? (
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
              {getImageName(currentImage)}
            </div>
          </div>
        ) : (
          <img src={currentImage} alt="" className="project-preview-image" />
        )}
        <div className="project-preview-name">
          [{getImageName(currentImage)}]
        </div>
      </div>
    </div>
  );
}

export default ProjectPreview;
