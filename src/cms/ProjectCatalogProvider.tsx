import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { sanityClient } from './client';
import type { ProjectDomain, SiteSettings } from './domain';
import {
  normalizeProject,
  normalizeSiteSettings,
  type CmsProjectResult,
  type CmsSiteSettingsResult,
} from './normalize';
import { PROJECTS_QUERY, SITE_SETTINGS_QUERY } from './queries';
import type { SiteSnapshot } from './snapshot';
import { EntranceIntro } from '@/components/ui/EntranceIntro';

type CatalogStatus = 'loading' | 'ready' | 'error';

interface ProjectCatalogContextValue {
  projects: ProjectDomain[];
  catalogStatus: CatalogStatus;
  catalogError: Error | null;
  getProject: (slug: string) => ProjectDomain | null;
  retryCatalog: () => void;
  siteSettings: SiteSettings | null;
}

const ProjectCatalogContext = createContext<ProjectCatalogContextValue | null>(null);
interface CmsContent {
  projects: CmsProjectResult[];
  siteSettings: CmsSiteSettingsResult | null;
}
let contentRequest: Promise<CmsContent> | null = null;

function fetchContent() {
  contentRequest ??= Promise.all([
    sanityClient.fetch<CmsProjectResult[]>(PROJECTS_QUERY),
    sanityClient.fetch<CmsSiteSettingsResult | null>(SITE_SETTINGS_QUERY),
  ]).then(([projects, siteSettings]) => ({ projects, siteSettings }));
  return contentRequest;
}

export function ProjectCatalogProvider({
  children,
  initialSnapshot,
}: {
  children: ReactNode;
  initialSnapshot?: SiteSnapshot;
}) {
  const { locale } = useLanguage();
  const [rawContent, setRawContent] = useState<CmsContent | null>(
    initialSnapshot?.rawContent ?? null,
  );
  const [requestError, setRequestError] = useState<Error | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    if (initialSnapshot && requestVersion === 0) return;
    let active = true;
    setRequestError(null);
    void fetchContent().then(
      (content) => {
        if (active) setRawContent(content);
      },
      (error: unknown) => {
        if (!active) return;
        const nextError =
          error instanceof Error ? error : new Error('Unknown Sanity request error.');
        if (import.meta.env.DEV) console.error('[Sanity][Projects]', nextError);
        setRequestError(nextError);
      },
    );
    return () => {
      active = false;
    };
  }, [initialSnapshot, requestVersion]);

  const normalized = useMemo(() => {
    if (!rawContent) {
      return initialSnapshot
        ? {
            projects: initialSnapshot.projects,
            siteSettings: initialSnapshot.siteSettings,
            error: requestError,
          }
        : { projects: [], siteSettings: null, error: requestError };
    }
    try {
      if (!rawContent.siteSettings) throw new Error('CMS siteSettings singleton is missing.');
      const normalizedProjects: ProjectDomain[] = [];
      const seenSlugs = new Set<string>();
      const seenOrders = new Set<number>();
      for (const rawProject of rawContent.projects) {
        try {
          const project = normalizeProject(rawProject, locale);
          if (seenSlugs.has(project.slug)) throw new Error(`Duplicate CMS slug: ${project.slug}`);
          if (rawProject.order != null && seenOrders.has(rawProject.order))
            console.warn(`[Sanity] Duplicate display order: ${rawProject.order}`);
          seenSlugs.add(project.slug);
          if (rawProject.order != null) seenOrders.add(rawProject.order);
          normalizedProjects.push(project);
        } catch (error) {
          console.warn('[Sanity] Skipping malformed project.', error);
        }
      }
      return {
        projects: normalizedProjects,
        siteSettings: normalizeSiteSettings(rawContent.siteSettings, locale),
        error: requestError,
      };
    } catch (error) {
      const nextError =
        error instanceof Error ? error : new Error('Unknown CMS normalization error.');
      if (import.meta.env.DEV) console.error('[Sanity][Projects]', nextError);
      return { projects: [], siteSettings: null, error: nextError };
    }
  }, [initialSnapshot, locale, rawContent, requestError]);

  const projects = normalized.projects;
  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.slug, project])),
    [projects],
  );
  const getProject = useCallback((slug: string) => projectMap.get(slug) ?? null, [projectMap]);
  const retryCatalog = useCallback(() => {
    contentRequest = null;
    setRawContent(null);
    setRequestError(null);
    setRequestVersion((version) => version + 1);
  }, []);
  const catalogStatus: CatalogStatus = normalized.error
    ? 'error'
    : rawContent || initialSnapshot
      ? 'ready'
      : 'loading';

  const value = useMemo<ProjectCatalogContextValue>(
    () => ({
      projects,
      catalogStatus,
      catalogError: normalized.error,
      getProject,
      retryCatalog,
      siteSettings: normalized.siteSettings,
    }),
    [catalogStatus, getProject, normalized.error, normalized.siteSettings, projects, retryCatalog],
  );

  return <ProjectCatalogContext.Provider value={value}>{children}</ProjectCatalogContext.Provider>;
}

export function ProjectCatalogGate({ children }: { children: ReactNode }) {
  const { catalogStatus, catalogError, retryCatalog } = useProjectCatalog();
  const intro = <EntranceIntro ready={catalogStatus === 'ready'} error={catalogStatus === 'error'} />;

  if (catalogStatus === 'loading') {
    return <>{intro}<div aria-busy="true" aria-label="Loading project content" /></>;
  }
  if (catalogStatus === 'error') {
    return (<>
      {intro}
      <div role="alert">
        <p>Project content is temporarily unavailable.</p>
        {import.meta.env.DEV && catalogError && <pre>{catalogError.message}</pre>}
        <button type="button" onClick={retryCatalog}>
          Retry
        </button>
      </div></>);
  }

  return <>{intro}{children}</>;
}

export function useProjectCatalog(): ProjectCatalogContextValue {
  const context = useContext(ProjectCatalogContext);
  if (!context) throw new Error('useProjectCatalog must be used within ProjectCatalogProvider.');
  return context;
}

export function useSiteSettings(): SiteSettings {
  const { siteSettings } = useProjectCatalog();
  if (!siteSettings) throw new Error('useSiteSettings requires ProjectCatalogGate.');
  return siteSettings;
}
