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

/** Rows sampled along each side edge when building the backdrop. */
const EDGE_SAMPLES = 32;

/**
 * Builds a 2px-wide image from the left and right edges of `img`. Stretched behind
 * the contained asset it continues the photo's own edge colours into the empty
 * bands, so there is no visible seam. Returns null if the pixels can't be read.
 */
function getEdgeBackdrop(img: HTMLImageElement): string | null {
  const { naturalWidth: width, naturalHeight: height } = img;
  if (!width || !height) return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = EDGE_SAMPLES;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.drawImage(img, 0, 0, 1, height, 0, 0, 1, EDGE_SAMPLES);
    context.drawImage(img, width - 1, 0, 1, height, 1, 0, 1, EDGE_SAMPLES);
    return `url(${canvas.toDataURL()})`;
  } catch {
    return null;
  }
}

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
  const [backdrop, setBackdrop] = useState<string | null>(null);
  const imageSrc = isVideo ? posterSrc : media.src;
  useEffect(() => {
    setIsVideoLoaded(false);
    setBackdrop(null);
  }, [media.key, media.src]);

  // The edge colours are read from a separate CORS request, so the visible image
  // never depends on the CDN's CORS settings: if it is refused, the band stays dark.
  useEffect(() => {
    if (isVideo || !imageSrc) return undefined;
    let cancelled = false;
    const probe = new Image();
    probe.crossOrigin = 'anonymous';
    probe.onload = () => {
      if (!cancelled) setBackdrop(getEdgeBackdrop(probe));
    };
    probe.src = imageSrc;
    return () => {
      cancelled = true;
      probe.onload = null;
    };
  }, [imageSrc, isVideo]);

  return (
    <div
      className={`project-preview-media${isVideo && !staticPreview ? ' is-video' : ''}`}
      style={backdrop ? { backgroundImage: backdrop } : undefined}
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
        <img src={imageSrc} alt="" className="project-preview-image" />
      )}
    </div>
  );
}
