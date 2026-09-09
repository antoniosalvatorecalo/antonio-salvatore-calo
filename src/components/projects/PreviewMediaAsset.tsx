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

export function PreviewMediaAsset({ media, staticPreview = false }: { media: ProjectMedia; staticPreview?: boolean }) {
  const isVideo = media.type === 'vimeo' || isVimeoUrl(media.src);
  const posterSrc = media.thumbnailSrc || (isVideo ? getVimeoThumbnailUrl(media.src) : '');
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const previewName = getPreviewMediaName(media);
  const normalizedName = previewName.trim().toLowerCase();
  const specialPreview = normalizedName === 'bugonia-menu'
    ? { image: ' project-preview-image--bugonia-menu', media: ' project-preview-media--bugonia-menu' }
    : normalizedName === 'bugonia-home-desktop-mobile'
      ? { image: ' project-preview-image--bugonia-home', media: ' project-preview-media--bugonia-home' }
      : normalizedName === 'merchandaising'
        ? { image: ' project-preview-image--bugonia-merchandising', media: ' project-preview-media--bugonia-merchandising' }
        : { image: '', media: '' };
  const imageClassName = `project-preview-image${staticPreview ? ' project-preview-image--static' : ''}${specialPreview.image}`;
  const mediaAspectRatio = media.width && media.height && !specialPreview.media
    ? `${media.width} / ${media.height}`
    : undefined;

  useEffect(() => setIsVideoLoaded(false), [media.key, media.src]);

  return (
    <div
      className={`project-preview-media${isVideo && !staticPreview ? ' is-video' : ''}${specialPreview.media}`}
      style={mediaAspectRatio ? { aspectRatio: mediaAspectRatio } : undefined}
    >
      {isVideo && posterSrc && !staticPreview && (
        <img src={posterSrc} alt="" aria-hidden="true" className="project-preview-image project-preview-poster" />
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
        <img src={isVideo ? posterSrc : media.src} alt="" className={imageClassName} />
      )}
    </div>
  );
}
