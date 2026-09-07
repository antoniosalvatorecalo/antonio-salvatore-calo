import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {useLanguage} from '@/providers/LanguageProvider';
import {sanityClient} from './client';
import type {ProjectDomain, SiteSettings} from './domain';
import {normalizeProject, normalizeSiteSettings, type CmsProjectResult, type CmsSiteSettingsResult} from './normalize';
import {PROJECTS_QUERY, SITE_SETTINGS_QUERY} from './queries';

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
interface CmsContent {projects: CmsProjectResult[]; siteSettings: CmsSiteSettingsResult | null}
let contentRequest: Promise<CmsContent> | null = null;

function fetchContent() {
  contentRequest ??= Promise.all([
    sanityClient.fetch<CmsProjectResult[]>(PROJECTS_QUERY),
    sanityClient.fetch<CmsSiteSettingsResult | null>(SITE_SETTINGS_QUERY),
  ]).then(([projects, siteSettings]) => ({projects, siteSettings}));
  return contentRequest;
}

export function ProjectCatalogProvider({children}: {children: ReactNode}) {
  const {locale} = useLanguage();
  const [rawContent, setRawContent] = useState<CmsContent | null>(null);
  const [requestError, setRequestError] = useState<Error | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setRequestError(null);
    void fetchContent().then(
      (content) => {
        if (active) setRawContent(content);
      },
      (error: unknown) => {
        if (!active) return;
        const nextError = error instanceof Error ? error : new Error('Unknown Sanity request error.');
        if (import.meta.env.DEV) console.error('[Sanity][Projects]', nextError);
        setRequestError(nextError);
      },
    );
    return () => {
      active = false;
    };
  }, [requestVersion]);

  const normalized = useMemo(() => {
    if (!rawContent) return {projects: [], siteSettings: null, error: requestError};
    try {
      if (!rawContent.siteSettings) throw new Error('CMS siteSettings singleton is missing.');
      return {
        projects: rawContent.projects.map((project) => normalizeProject(project, locale)),
        siteSettings: normalizeSiteSettings(rawContent.siteSettings, locale),
        error: requestError,
      };
    } catch (error) {
      const nextError = error instanceof Error ? error : new Error('Unknown CMS normalization error.');
      if (import.meta.env.DEV) console.error('[Sanity][Projects]', nextError);
      return {projects: [], siteSettings: null, error: nextError};
    }
  }, [locale, rawContent, requestError]);

  const projects = normalized.projects;
  const projectMap = useMemo(() => new Map(projects.map((project) => [project.slug, project])), [projects]);
  const getProject = useCallback((slug: string) => projectMap.get(slug) ?? null, [projectMap]);
  const retryCatalog = useCallback(() => {
    contentRequest = null;
    setRawContent(null);
    setRequestError(null);
    setRequestVersion((version) => version + 1);
  }, []);
  const catalogStatus: CatalogStatus = normalized.error
    ? 'error'
    : rawContent
      ? 'ready'
      : 'loading';

  const value = useMemo<ProjectCatalogContextValue>(() => ({
    projects,
    catalogStatus,
    catalogError: normalized.error,
    getProject,
    retryCatalog,
    siteSettings: normalized.siteSettings,
  }), [catalogStatus, getProject, normalized.error, normalized.siteSettings, projects, retryCatalog]);

  return <ProjectCatalogContext.Provider value={value}>{children}</ProjectCatalogContext.Provider>;
}

export function ProjectCatalogGate({children}: {children: ReactNode}) {
  const {catalogStatus, catalogError, retryCatalog} = useProjectCatalog();

  if (catalogStatus === 'loading') {
    return <div aria-busy="true" aria-label="Loading project content" />;
  }
  if (catalogStatus === 'error') {
    return (
      <div role="alert">
        <p>Project content is temporarily unavailable.</p>
        {import.meta.env.DEV && catalogError && <pre>{catalogError.message}</pre>}
        <button type="button" onClick={retryCatalog}>Retry</button>
      </div>
    );
  }

  return children;
}

export function useProjectCatalog(): ProjectCatalogContextValue {
  const context = useContext(ProjectCatalogContext);
  if (!context) throw new Error('useProjectCatalog must be used within ProjectCatalogProvider.');
  return context;
}

export function useSiteSettings(): SiteSettings {
  const {siteSettings} = useProjectCatalog();
  if (!siteSettings) throw new Error('useSiteSettings requires ProjectCatalogGate.');
  return siteSettings;
}
