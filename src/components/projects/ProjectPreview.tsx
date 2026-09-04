import { useState, useEffect } from 'react';
import './ProjectPreview.css';

interface ProjectPreviewProps {
  imageUrl: string | null;
}

function getImageName(path: string): string {
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
        <img src={currentImage} alt="" className="project-preview-image" />
        <div className="project-preview-name">
          [{getImageName(currentImage)}]
        </div>
      </div>
    </div>
  );
}

export default ProjectPreview;
