import type { ProjectDomain } from '@/cms/domain';
import { getSanityImageSources } from '@/cms/image';
import { getVimeoThumbnailUrl } from '@/lib/vimeo';

/** Visible on the rotating face only; the destination gallery keeps its own curtain. */
export function ProjectTransitionPreview({
  project,
  selectedMediaKey,
}: {
  project: ProjectDomain;
  selectedMediaKey?: string;
}) {
  const selected = Math.max(
    0,
    project.media.findIndex((media) => media.key === selectedMediaKey),
  );
  const start = Math.min(selected, Math.max(0, project.media.length - 3));
  return (
    <div className="project-transition-preview" aria-hidden="true" data-transition-preview>
      {project.media.slice(start, start + 3).map((media) => {
        const src =
          media.type === 'vimeo'
            ? media.thumbnailSrc || getVimeoThumbnailUrl(media.src)
            : media.src;
        return src ? (
          <div className="project-transition-preview-card" key={media.key}>
            <img
              src={src}
              {...getSanityImageSources(src, media.width, '33vw')}
              width={media.width}
              height={media.height}
              alt=""
              decoding="async"
              draggable={false}
            />
          </div>
        ) : null;
      })}
    </div>
  );
}
