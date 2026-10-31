import { useEffect, useState } from 'react';
import type { ProjectMedia } from '@/cms/domain';
import { getVimeoEmbedUrl, getVimeoThumbnailUrl, isVimeoUrl } from '@/lib/vimeo';

export function getPreviewMediaName(media: ProjectMedia): string {
  if (media.label) return media.label;
  if (media.type === 'vimeo' || isVimeoUrl(media.src)) {
    const id = media.src.match(/vimeo\.com\/(?:video\/|manage\/videos\/)?(\d+)/i)?.[1];
    return id ? `vimeo-${id}` : 'vimeo-video';
  }
  const filename = media.src.split('/').pop() || '';
  return filename.replace(/\.(webp|jpg|jpeg|png|gif)$/i, '');
}

/** Assets narrower than this ratio (square, portrait) are shown whole instead of cropped. */
const CONTAIN_BELOW_RATIO = 1.4;

export function PreviewMediaAsset({
  media,
  staticPreview = false,
}: {
  media: ProjectMedia;
  staticPreview?: boolean;
}) {
  const isVideo = media.type === 'vimeo' || isVimeoUrl(media.src);
  const posterSrc = media.thumbnailSrc || (isVideo ? getVimeoThumbnailUrl(media.src) : '');
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);
  useEffect(() => {
    setIsVideoLoaded(false);
    setNaturalRatio(null);
  }, [media.key, media.src]);

  const ratio = media.width && media.height ? media.width / media.height : naturalRatio;
  const contained = !isVideo && ratio !== null && ratio < CONTAIN_BELOW_RATIO;

  return (
    <div
      className={`project-preview-media${isVideo && !staticPreview ? ' is-video' : ''}${contained ? ' is-contained' : ''}`}
    >
      {isVideo && posterSrc && !staticPreview && (
        <img
          src={posterSrc}
          alt=""
          aria-hidden="true"
          className="project-preview-image project-preview-poster"
        />
      )}
      {isVideo && !staticPreview ? (
        <div className="project-preview-video-frame">
          <iframe
            key={media.key}
            className="project-preview-video"
            src={getVimeoEmbedUrl(media.src)}
            title={getPreviewMediaName(media)}
            allow="autoplay; fullscreen; picture-in-picture"
            tabIndex={-1}
            onLoad={() => setIsVideoLoaded(true)}
            style={{ opacity: posterSrc ? (isVideoLoaded ? 1 : 0) : 1 }}
          />
        </div>
      ) : (
        <img
          src={isVideo ? posterSrc : media.src}
          alt=""
          className="project-preview-image"
          onLoad={(event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget;
            if (naturalWidth && naturalHeight) setNaturalRatio(naturalWidth / naturalHeight);
          }}
        />
      )}
    </div>
  );
}
