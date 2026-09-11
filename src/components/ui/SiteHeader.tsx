import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatedLink } from './AnimatedLink';

import { useProjectCatalog, useSiteSettings } from '@/cms/ProjectCatalogProvider';
import { shouldEnhanceNavigation } from '@/lib/navigation';
import { useLanguage } from '@/providers/LanguageProvider';
import { useNavHover } from '@/providers/NavHoverContext';
import { useOptionalProjectTransition } from '@/providers/ProjectTransitionProvider';

import { ProjectDetailsGrid, type ProjectDetailColumn } from '../projects/ProjectDetailsGrid';
import { AnimatedContactPanel } from './AnimatedContactPanel';

import './SiteHeader.css';

const FABER_MEETING_URL = 'https://www.fabermeeting.it/';
const PUBLIC_EMAIL_HREF = 'mailto:antonio.salvatore.calo@gmail.com';

const ContactFormExperience = lazy(() =>
  import('./ContactFormExperience').then((module) => ({ default: module.ContactFormExperience })),
);

interface SiteHeaderProps {
  transitionPhase?: 'idle' | 'opening' | 'project' | 'closing';
  projectActive?: boolean;
  projectInfo?: {
    name: string;
    details: ProjectDetailColumn[];
  };
  onBackToGallery?: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  projectActive,
  projectInfo,
  onBackToGallery,
  transitionPhase,
}) => {
  const headerRef = useRef<HTMLElement>(null);
  const startProjectButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const { locale, setLocale, t } = useLanguage();
  const { setNavHoveredProject, setNavProjectMedia } = useNavHover();
  const transition = useOptionalProjectTransition();
  const { getProject, projects } = useProjectCatalog();
  const siteSettings = useSiteSettings();

  const [contactOpen, setContactOpen] = useState(false);

  const isProjectPage = projectActive ?? location.pathname.startsWith('/projects/');
  useEffect(() => {
    setContactOpen(false);
  }, [isProjectPage]);

  // Escape key handler to close contact panel
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && contactOpen) {
        setContactOpen(false);
        startProjectButtonRef.current?.focus();
      }
    },
    [contactOpen],
  );

  useLayoutEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const update = () =>
      document.documentElement.style.setProperty(
        '--site-header-height',
        `${header.offsetHeight}px`,
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, [isProjectPage, projectInfo?.name]);

  const handleGoHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isProjectPage || !onBackToGallery || !shouldEnhanceNavigation(e)) return;
    e.preventDefault();
    onBackToGallery();
  };

  const handleProjectHover = (projectId: string) => {
    const project = getProject(projectId);
    setNavHoveredProject(projectId);
    setNavProjectMedia(project?.media ?? []);
  };

  const handleProjectLeave = () => {
    setNavHoveredProject(null);
    setNavProjectMedia([]);
  };

  const handleProjectClick = (event: React.MouseEvent<HTMLAnchorElement>, projectId: string) => {
    if (!shouldEnhanceNavigation(event)) return;
    event.preventDefault();
    if (!transition || transition.phase !== 'idle') return;
    const media = getProject(projectId)?.media[0];
    if (!media) return;
    setNavHoveredProject(null);
    setNavProjectMedia([]);
    transition.startProjectTransition({
      slug: projectId,
      mediaKey: media.key,
      imageSrc: media.src,
      sourceElement: event.currentTarget,
    });
  };

  return (
    <header
      ref={headerRef}
      className={`site-header${isProjectPage ? ' is-project' : ''}`}
      data-transition-phase={transitionPhase}
    >
      <div className={`site-header-inner${isProjectPage ? ' is-project' : ''}`}>
        {/* LEFT: Bio */}
        <div className="site-header-col site-header-col--info">
          <div className="site-header-info-name">
            <p className="site-header-bio">
              <AnimatedLink
                to="/"
                onClick={handleGoHome}
                className="site-header-name"
                label={siteSettings.displayName}
              />{' '}
              {siteSettings.bio}
            </p>
            <div className="site-header-ctas">
              <AnimatedLink
                href={PUBLIC_EMAIL_HREF}
                className="site-header-cta-mini"
                label="Email Me"
              />
              {siteSettings.downloads.map((download) => (
                <AnimatedLink
                  key={download.kind}
                  href={download.href}
                  download
                  className="site-header-cta-mini"
                  label={download.label}
                />
              ))}
              {onBackToGallery && (
                <button
                  onClick={onBackToGallery}
                  className="site-header-cta-mini"
                  data-transition-control
                >
                  {t('header.back')}
                </button>
              )}
              <div className="site-header-mobile-switches">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setLocale(locale === 'EN' ? 'IT' : 'EN');
                  }}
                  aria-label={`Language: ${locale}`}
                  aria-pressed={locale === 'IT'}
                  className="site-header-switch-btn"
                >
                  [ {locale} ]
                </button>
              </div>
            </div>
          </div>
        </div>

        {isProjectPage && projectInfo && (
          <div className="site-header-col site-header-col--project" data-transition-control>
            <div className="site-header-project-heading">
              <h1 className="site-header-project-title">{projectInfo.name}</h1>
              <div className="site-header-project-language">
                <div className="site-header-switches">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setLocale(locale === 'EN' ? 'IT' : 'EN');
                    }}
                    aria-label={`Language: ${locale}`}
                    aria-pressed={locale === 'IT'}
                    className="site-header-switch-btn"
                  >
                    [ {locale} ]
                  </button>
                </div>
              </div>
            </div>
            <ProjectDetailsGrid columns={projectInfo.details} />
          </div>
        )}

        {/* Home-only navigation */}
        {!isProjectPage && (
          <div className="site-header-col site-header-col--nav" data-transition-control>
            <div className="site-header-nav-row">
              <div className="site-header-nav-group">
                <div className="site-header-nav-item site-header-nav-item--select-work">
                  <span className="site-header-nav-label">{t('header.select-work')}</span>
                  <div className="site-header-nav-values">
                    {projects.map((project) => (
                      <AnimatedLink
                        key={project.slug}
                        to={`/projects/${project.slug}`}
                        label={project.title}
                        aria-label={`${locale === 'IT' ? 'Apri il progetto' : 'Open'} ${project.title}`}
                        onClick={(event) => handleProjectClick(event, project.slug)}
                        onMouseEnter={() => handleProjectHover(project.slug)}
                        onFocus={() => handleProjectHover(project.slug)}
                        onMouseLeave={handleProjectLeave}
                      />
                    ))}
                  </div>
                </div>
                <div className="site-header-nav-item">
                  <span className="site-header-nav-label">{t('header.recognition')}</span>
                  <div className="site-header-nav-values">
                    {siteSettings.recognition.map((item) => {
                      const isFaberMeeting = item.toLowerCase().includes('faber meeting');
                      return isFaberMeeting ? (
                        <AnimatedLink
                          key={item}
                          href={FABER_MEETING_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          label={item}
                        />
                      ) : (
                        <span key={item}>{item}</span>
                      );
                    })}
                  </div>
                </div>
                {siteSettings.socials.length > 0 && (
                  <div className="site-header-nav-item">
                    <span className="site-header-nav-label">Social</span>
                    <div className="site-header-nav-values">
                      {siteSettings.socials.map((social) => (
                        <AnimatedLink
                          key={social.href}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="site-header-social-link"
                          label={social.label}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {!isProjectPage && (
                  <div className="site-header-nav-item site-header-nav-item--cta">
                    <button
                      ref={startProjectButtonRef}
                      type="button"
                      className={`site-header-start-project${contactOpen ? ' is-active' : ''}`}
                      onClick={() => setContactOpen((open) => !open)}
                      aria-expanded={contactOpen}
                      aria-controls="header-contact-popover"
                    >
                      <span>{t('header.menu-cta.contact')}</span>
                      <span className="site-header-start-project-indicator" aria-hidden="true" />
                    </button>

                    <AnimatedContactPanel open={contactOpen}>
                      <div id="header-contact-popover" className="site-header-contact-form">
                        {contactOpen && (
                          <Suspense fallback={null}>
                            <ContactFormExperience compact />
                          </Suspense>
                        )}
                      </div>
                    </AnimatedContactPanel>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LANGUAGE: Dedicated column */}
        {!isProjectPage && (
          <div className="site-header-col site-header-col--language" data-transition-control>
            <div className="site-header-switches">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setLocale(locale === 'EN' ? 'IT' : 'EN');
                }}
                aria-label={`Language: ${locale}`}
                aria-pressed={locale === 'IT'}
                className="site-header-switch-btn"
              >
                [ {locale} ]
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
