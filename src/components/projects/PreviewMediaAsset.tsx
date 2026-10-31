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

/** Edge backdrops by image URL: null means the pixels could not be read. */
const backdropCache = new Map<string, string | null>();
const backdropRequests = new Map<string, Promise<string | null>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function getImageSize(media: ProjectMedia, src: string): [number, number] | null {
  if (media.width && media.height && src === media.src) return [media.width, media.height];
  const match = src.match(/-(\d+)x(\d+)\.[a-z]+(?:\?|$)/i);
  return match ? [Number(match[1]), Number(match[2])] : null;
}

/**
 * Draws the photo's 1px left and right edge columns, scaled to EDGE_SAMPLES rows,
 * side by side. On the Sanity CDN the columns are cropped server side (two tiny
 * requests); elsewhere the full image is read.
 */
async function drawEdgeColumns(
  context: CanvasRenderingContext2D,
  media: ProjectMedia,
  src: string,
): Promise<void> {
  const size = getImageSize(media, src);
  if (src.includes('cdn.sanity.io') && size) {
    const [width, height] = size;
    const crop = (x: number) =>
      `${src}${src.includes('?') ? '&' : '?'}rect=${x},0,1,${height}&w=1&h=${EDGE_SAMPLES}&fit=scale&fm=png`;
    const [left, right] = await Promise.all([loadImage(crop(0)), loadImage(crop(width - 1))]);
    context.drawImage(left, 0, 0, 1, EDGE_SAMPLES);
    context.drawImage(right, 1, 0, 1, EDGE_SAMPLES);
    return;
  }
  const image = await loadImage(src);
  const { naturalWidth: width, naturalHeight: height } = image;
  context.drawImage(image, 0, 0, 1, height, 0, 0, 1, EDGE_SAMPLES);
  context.drawImage(image, width - 1, 0, 1, height, 1, 0, 1, EDGE_SAMPLES);
}

/**
 * Builds a 2px-wide image from the photo's left and right edges. Stretched behind
 * the contained asset it continues the photo's own edge colours into the empty
 * bands, so there is no visible seam. Resolves to null if the pixels can't be read
 * (e.g. the CDN refuses CORS): the band then stays dark.
 */
function loadEdgeBackdrop(media: ProjectMedia, src: string): Promise<string | null> {
  const pending = backdropRequests.get(src);
  if (pending) return pending;
  const request = (async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 2;
      canvas.height = EDGE_SAMPLES;
      const context = canvas.getContext('2d');
      if (!context) return null;
      await drawEdgeColumns(context, media, src);
      return `url(${canvas.toDataURL()})`;
    } catch {
      return null;
    }
  })().then((backdrop) => {
    backdropCache.set(src, backdrop);
    return backdrop;
  });
  backdropRequests.set(src, request);
  return request;
}

function getBackdropSource(media: ProjectMedia): string {
  const isVideo = media.type === 'vimeo' || isVimeoUrl(media.src);
  return isVideo ? '' : media.src;
}

/** Computes the edge backdrops ahead of hover, so previews open with them already set. */
export function preloadPreviewBackdrops(media: ProjectMedia[]) {
  for (const item of media) {
    const src = getBackdropSource(item);
    if (src && !backdropCache.has(src)) void loadEdgeBackdrop(item, src);
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
  const [, setBackdropVersion] = useState(0);
  const imageSrc = isVideo ? posterSrc : media.src;
  const backdropSrc = getBackdropSource(media);
  const backdrop = backdropCache.get(backdropSrc) ?? null;
  useEffect(() => setIsVideoLoaded(false), [media.key, media.src]);

  // Read from separate CORS requests, so the visible image never depends on the
  // CDN's CORS settings. Usually already cached by preloadPreviewBackdrops.
  useEffect(() => {
    if (!backdropSrc || backdropCache.has(backdropSrc)) return undefined;
    let cancelled = false;
    void loadEdgeBackdrop(media, backdropSrc).then(() => {
      if (!cancelled) setBackdropVersion((version) => version + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [backdropSrc, media]);

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
