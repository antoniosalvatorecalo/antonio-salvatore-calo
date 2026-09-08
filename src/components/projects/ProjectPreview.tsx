import { useState, useEffect } from 'react';
import type { ProjectMedia } from '@/cms/domain';
import { getPreviewMediaName, PreviewMediaAsset } from './PreviewMediaAsset';
import './ProjectPreview.css';

interface ProjectPreviewProps {
  media: ProjectMedia | null;
}

export function ProjectPreview({ media }: ProjectPreviewProps) {
  const [currentMedia, setCurrentMedia] = useState<ProjectMedia | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (media) {
      setCurrentMedia(media);
      setIsVisible(true);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setCurrentMedia(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [media]);

  if (!currentMedia) {
    return null;
  }

  return (
    <div className={`project-preview ${isVisible ? 'is-visible' : ''}`}>
      <div className="project-preview-inner">
        <PreviewMediaAsset media={currentMedia} />
        <div className="project-preview-name">
          [{getPreviewMediaName(currentMedia)}]
        </div>
      </div>
    </div>
  );
}

export default ProjectPreview;
