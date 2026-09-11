import { useLayoutEffect, useRef } from 'react';
import { ProjectIndex } from './ProjectIndex';
import { SingleProjectView } from '@/components/projects/SingleProjectView';
import { useProjectTransition } from '@/providers/ProjectTransitionProvider';
import { useProjectCatalog } from '@/cms/ProjectCatalogProvider';
import './PortfolioScene.css';

export function PortfolioScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const rollRef = useRef<HTMLDivElement>(null);
  const rotorRef = useRef<HTMLDivElement>(null);
  const indexPlaneRef = useRef<HTMLDivElement>(null);
  const projectPlaneRef = useRef<HTMLDivElement>(null);
  const {
    phase,
    selectedMediaKey,
    shouldRenderProject,
    visibleSlug,
    galleryInteractive,
    galleryMediaActive,
    registerScenePlanes,
  } = useProjectTransition();
  const { getProject } = useProjectCatalog();
  const project = visibleSlug ? getProject(visibleSlug) : null;

  useLayoutEffect(() => {
    const indexPlane = indexPlaneRef.current;
    const scene = sceneRef.current;
    const roll = rollRef.current;
    const rotor = rotorRef.current;
    if (!indexPlane || !scene || !roll || !rotor) return;
    registerScenePlanes({ scene, roll, rotor, indexPlane, projectPlane: projectPlaneRef.current });
    return () => registerScenePlanes(null);
  }, [registerScenePlanes, shouldRenderProject]);

  useLayoutEffect(() => {
    if (indexPlaneRef.current) indexPlaneRef.current.inert = !galleryInteractive;
    if (projectPlaneRef.current) projectPlaneRef.current.inert = phase !== 'project';
  }, [galleryInteractive, phase, shouldRenderProject]);

  return (
    <main
      ref={sceneRef}
      className="portfolio-scene"
      data-transition-phase={phase}
      aria-busy={phase === 'opening' || phase === 'closing'}
      data-scroll-root
    >
      <div ref={rollRef} className="scene-roll">
        <div className="scene-depth">
          <div ref={rotorRef} className="scene-rotor">
            <div
              ref={indexPlaneRef}
              className="scene-plane scene-plane--index"
              aria-hidden={!galleryInteractive}
            >
              <ProjectIndex interactive={galleryInteractive} mediaActive={galleryMediaActive} />
            </div>
            {shouldRenderProject && project && (
              <div
                ref={projectPlaneRef}
                className="scene-plane scene-plane--project"
                aria-hidden={phase !== 'project'}
              >
                <div className="scene-project-content">
                  <SingleProjectView
                    key={project.slug}
                    project={project}
                    initialMediaKey={selectedMediaKey}
                    interactive={phase === 'project'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
