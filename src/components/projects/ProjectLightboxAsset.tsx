import { useEffect, useRef, useState } from 'react';
import { useIsPresent } from 'motion/react';
import type { ProjectMedia } from '@/cms/domain';
import { getSanityImageSources } from '@/cms/image';
import { getVimeoEmbedUrl, getVimeoThumbnailUrl } from '@/lib/vimeo';

interface Props {
  media: ProjectMedia;
  source: HTMLImageElement | null;
  width: number;
  closing: boolean;
}

// Keyed by the viewer's media stage: loading state resets without remounting
// the dialog, replaying the opening zoom, or disturbing keyboard focus.
export function ProjectLightboxAsset({ media, source, width, closing }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);
  const isPresent = useIsPresent();
  const isVideo = media.type === 'vimeo';
  const preview =
    source?.currentSrc ||
    media.thumbnailSrc ||
    (isVideo ? getVimeoThumbnailUrl(media.src) : media.src);

  useEffect(() => {
    if (loaded || failed) return;
    const timeout = window.setTimeout(() => setSlow(true), 10000);
    return () => window.clearTimeout(timeout);
  }, [loaded, failed]);

  useEffect(() => {
    if (!isVideo) return;
    const ready = (event: MessageEvent) => {
      if (
        event.origin !== 'https://player.vimeo.com' ||
        event.source !== iframeRef.current?.contentWindow
      )
        return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.event === 'ready' || data?.method === 'ping') {
          setLoaded(true);
          iframeRef.current?.contentWindow?.postMessage(
            { method: 'addEventListener', value: 'error' },
            'https://player.vimeo.com',
          );
        }
        if (data?.event === 'error') setFailed(true);
      } catch {
        /* Ignore unrelated player messages. */
      }
    };
    window.addEventListener('message', ready);
    return () => window.removeEventListener('message', ready);
  }, [isVideo]);

  return (
    <div className="lightbox-media" aria-busy={!loaded && !failed}>
      <img src={preview} alt="" aria-hidden="true" className="lightbox-preview" />
      {isVideo ? (
        !closing &&
        isPresent && (
          <iframe
            ref={iframeRef}
            src={getVimeoEmbedUrl(media.src)}
            title="Vimeo video"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="lightbox-video"
            style={{ opacity: loaded && !failed ? 1 : 0 }}
            onLoad={() =>
              iframeRef.current?.contentWindow?.postMessage(
                { method: 'ping' },
                'https://player.vimeo.com',
              )
            }
            onError={() => setFailed(true)}
          />
        )
      ) : (
        <img
          src={media.src}
          {...getSanityImageSources(media.src, media.width, `${Math.ceil(width)}px`)}
          alt={media.alt}
          className="lightbox-image"
          decoding="async"
          fetchPriority="high"
          style={{ opacity: loaded && !failed ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {(failed || (slow && !loaded)) && (
        <div className="lightbox-load-status" role="status">
          {failed ? 'Media unavailable.' : 'Still loading…'}{' '}
          <a href={media.src} target="_blank" rel="noreferrer">
            Open original ↗
          </a>
        </div>
      )}
    </div>
  );
}
