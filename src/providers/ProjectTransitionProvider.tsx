import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap } from '@/lib/gsap-setup';
import { waitForProjectMedia } from '@/lib/project-media-ready';
import { useProjectCatalog } from '@/cms/ProjectCatalogProvider';
import { useReducedMotionPreference } from './MotionPreferenceProvider';
import {
  createCloseTimeline,
  createOpenTimeline,
  setHomePlaneState,
  setProjectPlaneState,
  updateSceneGeometry,
  type ScenePlanes,
} from '@/motion/ProjectTransitionMotion';
import { useTransitionInputLock } from '@/hooks/useTransitionInputLock';

type ProjectTransitionPhase = 'idle' | 'opening' | 'project' | 'closing';

interface ProjectTransitionRequest {
  slug: string;
  mediaKey: string;
  imageSrc: string;
  sourceElement: HTMLElement;
}

interface TransitionOrigin {
  url: string;
  slug: string;
  galleryScrollTop: number;
  windowScrollY: number;
  sourceElement: HTMLElement;
}

interface TransitionState {
  phase: ProjectTransitionPhase;
  slug: string | null;
  mediaKey: string | undefined;
  imageSrc: string | undefined;
}

interface ProjectTransitionContextValue {
  phase: ProjectTransitionPhase;
  selectedSlug: string | null;
  selectedMediaKey: string | undefined;
  visibleSlug: string | null;
  shouldRenderProject: boolean;
  galleryInteractive: boolean;
  galleryMediaActive: boolean;
  registerScenePlanes: (planes: ScenePlanes | null) => void;
  startProjectTransition: (request: ProjectTransitionRequest) => void;
  returnToGallery: () => void;
}

const ProjectTransitionContext = createContext<ProjectTransitionContextValue | null>(null);
const HOME: TransitionState = {
  phase: 'idle',
  slug: null,
  mediaKey: undefined,
  imageSrc: undefined,
};
const getRouteSelection = (state: unknown) => {
  if (!state || typeof state !== 'object') return { mediaKey: undefined, imageSrc: undefined };
  return {
    mediaKey:
      'selectedMediaKey' in state && typeof state.selectedMediaKey === 'string'
        ? state.selectedMediaKey
        : undefined,
    imageSrc:
      'selectedImageSrc' in state && typeof state.selectedImageSrc === 'string'
        ? state.selectedImageSrc
        : undefined,
  };
};

export const ProjectTransitionProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const reducedMotion = useReducedMotionPreference();
  const { getProject } = useProjectCatalog();
  const getRouteSlug = useCallback(
    (pathname: string) => {
      const slug = pathname.match(/^\/projects\/([^/]+)$/)?.[1];
      return slug && getProject(slug) ? slug : null;
    },
    [getProject],
  );
  const [state, setState] = useState<TransitionState>(() => {
    const slug = getRouteSlug(location.pathname);
    return slug ? { phase: 'project', slug, ...getRouteSelection(location.state) } : HOME;
  });
  const stateRef = useRef(state);
  const locationRef = useRef(location);
  const lastLocationKeyRef = useRef(location.key);
  const originRef = useRef<TransitionOrigin | null>(null);
  const projectHistoryKeyRef = useRef<string | null>(null);
  const internalNavigationRef = useRef<string | null>(null);
  const closeSourceRef = useRef<'ui' | 'pop'>('ui');
  const restoreFrameRef = useRef<number | null>(null);
  const [planes, setPlanes] = useState<ScenePlanes | null>(null);

  const commit = useCallback((next: TransitionState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const transitioning = state.phase === 'opening' || state.phase === 'closing';
  useTransitionInputLock(transitioning);

  const restoreGallery = useCallback(() => {
    const origin = originRef.current;
    if (!origin) return;
    const grid = origin.sourceElement.closest<HTMLElement>('[data-project-transition-grid]');
    if (grid) grid.scrollTop = origin.galleryScrollTop;
    window.scrollTo({ top: origin.windowScrollY, behavior: 'instant' });
    if (restoreFrameRef.current !== null) cancelAnimationFrame(restoreFrameRef.current);
    restoreFrameRef.current = requestAnimationFrame(() => {
      restoreFrameRef.current = null;
      if (stateRef.current.phase === 'idle' && origin.sourceElement.isConnected) {
        origin.sourceElement.focus({ preventScroll: true });
      }
    });
  }, []);

  const finishOpen = useCallback(() => {
    const current = stateRef.current;
    if (current.phase !== 'opening' || !current.slug) return;
    const path = `/projects/${current.slug}`;
    internalNavigationRef.current = path;
    commit({ ...current, phase: 'project' });
    navigate(path, {
      state: {
        selectedMediaKey: current.mediaKey,
        selectedImageSrc: current.imageSrc,
      },
    });
  }, [commit, navigate]);

  const finishClose = useCallback(() => {
    if (stateRef.current.phase !== 'closing') return;
    const currentLocation = locationRef.current;
    commit(HOME);
    restoreGallery();
    if (closeSourceRef.current === 'pop') return;
    const origin = originRef.current;
    const destination = origin?.url ?? '/';
    internalNavigationRef.current = destination;
    if (
      origin &&
      projectHistoryKeyRef.current === currentLocation.key &&
      currentLocation.pathname === `/projects/${origin.slug}`
    ) {
      navigate(-1);
    } else {
      navigate(destination);
    }
  }, [commit, navigate, restoreGallery]);

  const startProjectTransition = useCallback(
    (request: ProjectTransitionRequest) => {
      const project = getProject(request.slug);
      if (stateRef.current.phase !== 'idle' || !project) return;
      if (!project.media.some((media) => media.key === request.mediaKey)) return;
      const grid = request.sourceElement.closest<HTMLElement>('[data-project-transition-grid]');
      const currentLocation = locationRef.current;
      originRef.current = {
        url: currentLocation.pathname + currentLocation.search + currentLocation.hash,
        slug: request.slug,
        galleryScrollTop: grid?.scrollTop ?? 0,
        windowScrollY: window.scrollY,
        sourceElement: request.sourceElement,
      };
      projectHistoryKeyRef.current = null;
      commit({
        phase: 'opening',
        slug: request.slug,
        mediaKey: request.mediaKey,
        imageSrc: request.imageSrc,
      });
    },
    [commit, getProject],
  );

  const returnToGallery = useCallback(() => {
    if (stateRef.current.phase !== 'project') return;
    closeSourceRef.current = 'ui';
    commit({ ...stateRef.current, phase: 'closing' });
  }, [commit]);

  // Browser navigation is authoritative, including Forward during a closing tween.
  // Internal navigation only changes the URL after the visual endpoint is reached.
  useLayoutEffect(() => {
    locationRef.current = location;
    if (lastLocationKeyRef.current === location.key) return;
    lastLocationKeyRef.current = location.key;
    const url = location.pathname + location.search + location.hash;
    if (internalNavigationRef.current === url) {
      internalNavigationRef.current = null;
      if (stateRef.current.phase === 'project') projectHistoryKeyRef.current = location.key;
      return;
    }
    internalNavigationRef.current = null;
    const slug = getRouteSlug(location.pathname);
    const current = stateRef.current;
    if (slug) {
      projectHistoryKeyRef.current = location.key;
      commit({ phase: 'project', slug, ...getRouteSelection(location.state) });
    } else if (current.phase === 'project' || current.phase === 'closing') {
      closeSourceRef.current = 'pop';
      if (current.phase !== 'closing') commit({ ...current, phase: 'closing' });
    } else if (current.phase === 'opening') {
      commit(HOME);
      restoreGallery();
    }
  }, [commit, getRouteSlug, location, restoreGallery]);

  useLayoutEffect(() => {
    if (!planes) return;
    const controller = new AbortController();
    const context = gsap.context(() => {}, planes.scene);
    let timeline: gsap.core.Timeline | undefined;
    let settled = false;
    let width = planes.scene.clientWidth;
    let height = planes.scene.clientHeight;
    const isOpening = state.phase === 'opening';
    const isClosing = state.phase === 'closing';
    if (isClosing) restoreGallery();

    const settle = () => {
      if (settled || controller.signal.aborted) return;
      settled = true;
      controller.abort();
      timeline?.kill();
      // Canonical endpoints also handle resize and live reduced-motion changes.
      if (isOpening || state.phase === 'project') setProjectPlaneState(planes);
      else setHomePlaneState(planes);
      if (isOpening) finishOpen();
      else if (isClosing) finishClose();
    };

    if (!isOpening && !isClosing) {
      context.add(() => {
        if (state.phase === 'project') setProjectPlaneState(planes);
        else setHomePlaneState(planes);
      });
    } else if (reducedMotion) {
      settle();
    } else {
      const animate = () => {
        if (controller.signal.aborted) return;
        context.add(() => {
          timeline = isOpening
            ? createOpenTimeline(planes, false, settle)
            : createCloseTimeline(planes, false, settle);
        });
      };
      if (isOpening && planes.projectPlane) {
        void waitForProjectMedia(planes.projectPlane, controller.signal).then(() => {
          if (controller.signal.aborted) return;
          // Failed/slow media uses its placeholder, but never skips the opening.
          animate();
        });
      } else if (isClosing) {
        animate();
      }
    }

    const observer = new ResizeObserver(() => {
      const nextWidth = planes.scene.clientWidth;
      const nextHeight = planes.scene.clientHeight;
      if (nextWidth === width && nextHeight === height) return;
      width = nextWidth;
      height = nextHeight;
      updateSceneGeometry(planes);
      if (isOpening || isClosing) settle();
    });
    observer.observe(planes.scene);

    return () => {
      controller.abort();
      observer.disconnect();
      // Revert scoped tweens without resetting the current angle when reversing.
      const angle = planes.scene.style.getPropertyValue('--scene-angle');
      context.revert();
      planes.scene.style.setProperty('--scene-angle', angle);
    };
  }, [planes, state.phase, state.slug, reducedMotion, finishOpen, finishClose, restoreGallery]);

  useLayoutEffect(
    () => () => {
      if (restoreFrameRef.current !== null) cancelAnimationFrame(restoreFrameRef.current);
    },
    [],
  );

  const scene = planes?.scene;
  useLayoutEffect(
    () => () => {
      scene?.style.removeProperty('--scene-angle');
      scene?.style.removeProperty('--scene-depth');
    },
    [scene],
  );

  const registerScenePlanes = useCallback((next: ScenePlanes | null) => setPlanes(next), []);
  const value = useMemo<ProjectTransitionContextValue>(
    () => ({
      phase: state.phase,
      selectedSlug: state.slug,
      selectedMediaKey: state.mediaKey,
      visibleSlug: state.slug,
      shouldRenderProject: Boolean(state.slug),
      galleryInteractive: state.phase === 'idle',
      galleryMediaActive: state.phase !== 'project',
      registerScenePlanes,
      startProjectTransition,
      returnToGallery,
    }),
    [state, registerScenePlanes, startProjectTransition, returnToGallery],
  );

  return (
    <ProjectTransitionContext.Provider value={value}>{children}</ProjectTransitionContext.Provider>
  );
};

export const useProjectTransition = () => {
  const context = useContext(ProjectTransitionContext);
  if (!context)
    throw new Error('useProjectTransition must be used within ProjectTransitionProvider');
  return context;
};

export const useOptionalProjectTransition = () => useContext(ProjectTransitionContext);
