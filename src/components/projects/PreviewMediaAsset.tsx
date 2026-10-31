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

/** Luminance spread (std. deviation, 0–255) under which an edge counts as flat… */
const FLAT_EDGE = 4;
/** …and above which it counts as detailed (content cut by the photo's border). */
const DETAILED_EDGE = 12;

interface EdgeBackdrop {
  /** CSS background-image continuing the photo's edge colours into the bands. */
  image: string;
  /** Side the photo leans on: a detailed edge stays against the frame instead of being stretched. */
  align: 'left' | 'center' | 'right';
}

/** Edge backdrops by image URL: null means the pixels could not be read. */
const backdropCache = new Map<string, EdgeBackdrop | null>();
const backdropRequests = new Map<string, Promise<EdgeBackdrop | null>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function getEdgeSpread(pixels: Uint8ClampedArray, column: number): number {
  const luminance: number[] = [];
  for (let row = 0; row < EDGE_SAMPLES; row++) {
    const [red = 0, green = 0, blue = 0] = pixels.subarray((row * 2 + column) * 4);
    luminance.push(0.299 * red + 0.587 * green + 0.114 * blue);
  }
  const mean = luminance.reduce((sum, value) => sum + value, 0) / EDGE_SAMPLES;
  const variance = luminance.reduce((sum, value) => sum + (value - mean) ** 2, 0) / EDGE_SAMPLES;
  return Math.sqrt(variance);
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
 * bands, so there is no visible seam. When one edge is detailed and the other flat,
 * the photo leans on the detailed side so only the flat edge is stretched.
 * Resolves to null if the pixels can't be read (e.g. the CDN refuses CORS): the
 * band then stays dark and the photo centred.
 */
function loadEdgeBackdrop(media: ProjectMedia, src: string): Promise<EdgeBackdrop | null> {
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
      const pixels = context.getImageData(0, 0, 2, EDGE_SAMPLES).data;
      const left = getEdgeSpread(pixels, 0);
      const right = getEdgeSpread(pixels, 1);
      const align: EdgeBackdrop['align'] =
        right > DETAILED_EDGE && left < FLAT_EDGE
          ? 'right'
          : left > DETAILED_EDGE && right < FLAT_EDGE
            ? 'left'
            : 'center';
      return { image: `url(${canvas.toDataURL()})`, align };
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
      style={backdrop ? { backgroundImage: backdrop.image } : undefined}
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
          src={imageSrc}
          alt=""
          className="project-preview-image"
          style={backdrop ? { objectPosition: `${backdrop.align} center` } : undefined}
        />
      )}
    </div>
  );
}
