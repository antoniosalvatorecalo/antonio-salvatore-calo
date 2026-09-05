import { Navigate, useLocation, useParams } from 'react-router-dom';
import { SingleProjectView } from '@/components/projects/SingleProjectView';
import { projectsRegistry } from '@/content/projects';
import { workProjectExtrasRegistry } from '@/content/workProjectExtras';

export default function ProjectSliderPage() {
  const { slug } = useParams();
  const location = useLocation();
  const project = projectsRegistry.find((item) => item.id === slug);

  if (!project || !slug) return <Navigate to="/" replace />;

  const extras = workProjectExtrasRegistry[slug];
  const selectedImage = typeof (location.state as { selectedImage?: unknown } | null)?.selectedImage === 'string'
    ? (location.state as { selectedImage: string }).selectedImage
    : undefined;

  return (
    <SingleProjectView
      initialImage={selectedImage}
      project={{
        slug,
        title: project.title,
        description: extras?.shortDescription ?? project.tagline,
        coverImage: project.images[0],
        images: project.images,
        links: extras?.links ?? [],
      }}
    />
  );
}
