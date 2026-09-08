import { useEffect, useMemo, useState } from 'react';
import type { ProjectMedia } from '@/cms/domain';
import { getPreviewMediaName, PreviewMediaAsset } from './PreviewMediaAsset';
import { useReducedMotionPreference } from '@/providers/MotionPreferenceProvider';
import './ProjectPreview.css';

interface ProjectPreviewCarouselProps {
  media: ProjectMedia[];
}

export function ProjectPreviewCarousel({ media }: ProjectPreviewCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const reducedMotion = useReducedMotionPreference();
  const mediaSignature = useMemo(() => media.map((item) => item.key).join('|'), [media]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [mediaSignature]);

  useEffect(() => {
    if (reducedMotion || media.length < 2) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % media.length);
    }, 850);

    return () => window.clearInterval(interval);
  }, [media.length, mediaSignature, reducedMotion]);

  const currentMedia = media[currentIndex % media.length];

  if (!currentMedia) return null;

  return (
    <div className="project-preview is-visible">
      <div className="project-preview-inner">
        <PreviewMediaAsset key={currentMedia.key} media={currentMedia} staticPreview />
        <div className="project-preview-name">
          [{getPreviewMediaName(currentMedia)}]
        </div>
      </div>
    </div>
  );
}

export default ProjectPreviewCarousel;
