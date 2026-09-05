import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useLayoutEffect, useRef } from 'react';
import { useLanguage } from '../../providers/LanguageProvider';
import { useTheme } from '../../hooks/theme/useTheme';
import { RollingText } from './RollingText';
import { useNavHover } from '../../providers/NavHoverContext';
import { useOptionalProjectTransition } from '../../providers/ProjectTransitionProvider';
import { projectsRegistry } from '../../content/projects';
import { ProjectDetailsGrid, type ProjectDetailColumn } from '../projects/ProjectDetailsGrid';
import './SiteHeader.css';

const PROJECT_IMAGES: Record<string, string[]> = {
  bugonia: projectsRegistry.find(p => p.id === 'bugonia')?.images || [],
  newsquest: projectsRegistry.find(p => p.id === 'newsquest')?.images || [],
};

interface SiteHeaderProps {
  transitionPhase?: 'idle' | 'opening' | 'project' | 'closing';
  projectActive?: boolean;
  projectInfo?: {
    name: string;
    description: string;
    links: { label: string; href: string }[];
    details?: ProjectDetailColumn[];
  };
  onBackToGallery?: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({ projectActive, projectInfo, onBackToGallery, transitionPhase }) => {
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { locale, setLocale, t } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();
  const { setNavHoveredProject, setNavProjectImages } = useNavHover();
  const transition = useOptionalProjectTransition();

  const isProjectPage = projectActive ?? location.pathname.startsWith('/projects/');
  const isContactPage = location.pathname === '/contact';

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const update = () => document.documentElement.style.setProperty('--mobile-header-height', `${header.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, [isProjectPage, projectInfo?.name]);

  const handleGoContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate('/contact');
  };

  const handleGoHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isProjectPage || !onBackToGallery) return;
    e.preventDefault();
    onBackToGallery();
  };

  const handleProjectHover = (projectId: string) => {
    setNavHoveredProject(projectId);
    setNavProjectImages(PROJECT_IMAGES[projectId] || []);
  };

  const handleProjectLeave = () => {
    setNavHoveredProject(null);
    setNavProjectImages([]);
  };

  const handleProjectClick = (event: React.MouseEvent<HTMLButtonElement>, projectId: string) => {
    event.preventDefault();
    if (!transition || transition.phase !== 'idle') return;
    const imageSrc = PROJECT_IMAGES[projectId]?.[0];
    if (!imageSrc) return;
    setNavHoveredProject(null);
    setNavProjectImages([]);
    transition.startProjectTransition({ slug: projectId, imageSrc, sourceElement: event.currentTarget });
  };

  return (
    <header ref={headerRef} className="site-header" data-transition-phase={transitionPhase}>
      <div className={`site-header-inner${isProjectPage ? ' is-project' : ''}`}>
        {/* LEFT: Bio */}
        <div className="site-header-col site-header-col--info">
          <div className="site-header-info-name">
            <p className="site-header-bio">
              <Link to="/" onClick={handleGoHome} className="site-header-name">Antonio Salvatore Calò</Link> {t('header.bio')} <strong>Bugonia</strong>, a Ticket First website concept, and <strong>Newsquest</strong>, a mobile news aggregator.
            </p>
            <div className="site-header-contact">
              <span className="site-header-contact-label">{t('header.contact')}</span>
              <a href="mailto:antonio.salvatore.calo@gmail.com" className="site-header-contact-email">
                antonio.salvatore.calo@gmail.com
              </a>
            </div>
            <div className="site-header-ctas">
              <a href="/media/CV e Portfolio/CV_antonio_salvatore_calo_.pdf" download className="site-header-cta-mini">
                <RollingText text={t('header.download-cv')} />
              </a>
              <a href="/media/CV e Portfolio/Portfolio_Antonio_Salvatore_Calo_.pdf" download className="site-header-cta-mini">
                <RollingText text={t('header.download-portfolio')} />
              </a>
              <a href="/contact" onClick={handleGoContact} className={`site-header-cta-mini site-header-cta-mobile${isContactPage ? ' is-active' : ''}`} aria-current={isContactPage ? 'page' : undefined}>
                <RollingText text={t('header.menu-cta.contact')} />
              </a>
              {onBackToGallery && (
                <button onClick={onBackToGallery} className="site-header-cta-mini" data-transition-control>
                  <RollingText text={t('header.back')} />
                </button>
              )}
              <div className="site-header-mobile-switches">
                <button type="button" onClick={(e) => { e.preventDefault(); setLocale(locale === 'EN' ? 'IT' : 'EN'); }} aria-label={`Language: ${locale}`} aria-pressed={locale === 'IT'} className="site-header-switch-btn">[ {locale} ]</button>
                <button type="button" onClick={(e) => { e.preventDefault(); toggleTheme(); }} aria-label={`Theme: ${theme}`} aria-pressed={theme === 'dark'} className="site-header-switch-btn">[ {theme === 'light' ? 'LI' : 'DR'} ]</button>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: Project title + accordions (only on project pages) */}
        {isProjectPage && projectInfo && projectInfo.details && projectInfo.details.length > 0 && (
          <div className="site-header-col site-header-col--project" data-transition-control>
            <div className="site-header-project-title">{projectInfo.name}</div>
            <ProjectDetailsGrid columns={projectInfo.details} />
          </div>
        )}

        {/* RIGHT: Nav actions */}
        <div key={isProjectPage ? 'project' : 'home'} className="site-header-col site-header-col--nav" data-transition-control>
          {isProjectPage ? (
            <>
              <a href="/contact" onClick={handleGoContact} className={`site-header-cta site-header-project-cta${isContactPage ? ' is-active' : ''}`} aria-current={isContactPage ? 'page' : undefined}>{t('header.menu-cta.contact')}</a>
              <div className="site-header-switches">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setLocale(locale === 'EN' ? 'IT' : 'EN'); }}
                  aria-label={`Language: ${locale}. Click to switch.`}
                  aria-pressed={locale === 'IT'}
                  className="site-header-switch-btn"
                >[ {locale} ]</button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); toggleTheme(); }}
                  aria-label={`Theme: ${theme === 'light' ? 'Light' : 'Dark'}. Click to switch.`}
                  aria-pressed={theme === 'dark'}
                  className="site-header-switch-btn"
                >[ {theme === 'light' ? 'LI' : 'DR'} ]</button>
              </div>
            </>
          ) : (
            <div className="site-header-nav-row">
              <div className="site-header-nav-group">
                <div className="site-header-nav-item">
                  <span className="site-header-nav-label">{t('header.select-work')}</span>
                  <div className="site-header-nav-values">
                    <button type="button" aria-label={`${locale === 'IT' ? 'Apri il progetto' : 'Open'} Bugonia`} onClick={(event) => handleProjectClick(event, 'bugonia')} onMouseEnter={() => handleProjectHover('bugonia')} onMouseLeave={handleProjectLeave}>Bugonia</button>
                    <button type="button" aria-label={`${locale === 'IT' ? 'Apri il progetto' : 'Open'} Newsquest`} onClick={(event) => handleProjectClick(event, 'newsquest')} onMouseEnter={() => handleProjectHover('newsquest')} onMouseLeave={handleProjectLeave}>Newsquest</button>
                  </div>
                </div>
                <div className="site-header-nav-item">
                  <span className="site-header-nav-label">{t('header.services')}</span>
                  <div className="site-header-nav-values">
                    <span>UI/UX</span>
                    <span>Web Design</span>
                    <span>Motion</span>
                  </div>
                </div>
                <div className="site-header-nav-item">
                  <span className="site-header-nav-label">{t('header.recognition')}</span>
                  <div className="site-header-nav-values">
                    <span>Faber Meeting 2026</span>
                  </div>
                </div>
              </div>
              <div className="site-header-nav-actions">
                <a href="/contact" onClick={handleGoContact} className={`site-header-cta site-header-home-cta${isContactPage ? ' is-active' : ''}`} aria-current={isContactPage ? 'page' : undefined}>{t('header.menu-cta.contact')}</a>
                <div className="site-header-switches">
                  <button type="button" onClick={(e) => { e.preventDefault(); setLocale(locale === 'EN' ? 'IT' : 'EN'); }} aria-label={`Language: ${locale}`} aria-pressed={locale === 'IT'} className="site-header-switch-btn">[ {locale} ]</button>
                  <button type="button" onClick={(e) => { e.preventDefault(); toggleTheme(); }} aria-label={`Theme: ${theme}`} aria-pressed={theme === 'dark'} className="site-header-switch-btn">[ {theme === 'light' ? 'LI' : 'DR'} ]</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
