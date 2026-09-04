import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../providers/LanguageProvider';
import { useItalyTime } from '../../hooks/useItalyTime';
import { useTheme } from '../../hooks/theme/useTheme';
import { RollingText } from './RollingText';
import { useNavHover } from '../../providers/NavHoverContext';
import { projectsRegistry } from '../../content/projects';
import './SiteHeader.css';

const SERVICES = ['UI/UX', 'Web Design', 'Motion'] as const;
const AWARDS = ['Faber Meeting 2026'] as const;

const PROJECT_IMAGES: Record<string, string[]> = {
  bugonia: projectsRegistry.find(p => p.id === 'bugonia')?.images || [],
  newsquest: projectsRegistry.find(p => p.id === 'newsquest')?.images || [],
};

interface SiteHeaderProps {
  projectInfo?: {
    name: string;
    description: string;
    links: { label: string; href: string }[];
  };
  onBackToGallery?: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({ projectInfo, onBackToGallery }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const italyTime = useItalyTime();
  const { locale, setLocale } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();
  const { setNavHoveredProject, setNavProjectImages } = useNavHover();

  const isProjectPage = location.pathname.startsWith('/projects/');
  const isContactPage = location.pathname === '/contact';

  const handleGoContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate('/contact');
  };

  const handleProjectHover = (projectId: string) => {
    setNavHoveredProject(projectId);
    setNavProjectImages(PROJECT_IMAGES[projectId] || []);
  };

  const handleProjectLeave = () => {
    setNavHoveredProject(null);
    setNavProjectImages([]);
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* COL 1: INFO */}
        <div className="site-header-col site-header-col--info">
          <div className="site-header-info-name">
            <p className="site-header-bio">
              <Link to="/" className="site-header-name">Antonio Salvatore Calò</Link> is a Web & UI Designer and Frontend Developer based in Benevento, Italy. His practice sits between editorial design and software — building cinematic interfaces, typography systems, and interactive case studies across print, motion, and the browser. Recent projects include <strong>Bugonia</strong>, a Ticket First website concept, and <strong>Newsquest</strong>, a mobile news aggregator.
            </p>
            <div className="site-header-contact">
              <span className="site-header-contact-label">Contact:</span>
              <a href="mailto:antonio.salvatore.calo@gmail.com" className="site-header-contact-email">
                antonio.salvatore.calo@gmail.com
              </a>
            </div>
            <div className="site-header-ctas">
              <a href="/cv.pdf" download className="site-header-cta-mini">
                <RollingText text="Download CV" />
              </a>
              <a href="/portfolio-cartaceo.pdf" download className="site-header-cta-mini">
                <RollingText text="Download Portfolio" />
              </a>
              {onBackToGallery && (
                <button onClick={onBackToGallery} className="site-header-cta-mini">
                  <RollingText text="< Back" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* COL 2: PROJECT INFO (only on project pages) */}
        {isProjectPage && projectInfo && (
          <div className="site-header-col site-header-col--project">
            <span className="site-header-eyebrow">Project</span>
            <div className="site-header-project-name">{projectInfo.name}</div>
            <p className="site-header-project-desc">{projectInfo.description}</p>
            {projectInfo.links.length > 0 && (
              <ul className="site-header-project-links">
                {projectInfo.links.map((link, i) => (
                  <li key={i}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* COL 3: NAV ITEMS + CTA */}
        {!isProjectPage && (
          <div className="site-header-nav-row">
            <div className="site-header-nav-group">
              <div className="site-header-nav-item">
                <span className="site-header-nav-label">Select Work</span>
                <div className="site-header-nav-values">
                  <span
                    onMouseEnter={() => handleProjectHover('bugonia')}
                    onMouseLeave={handleProjectLeave}
                  >
                    Bugonia
                  </span>
                  <span
                    onMouseEnter={() => handleProjectHover('newsquest')}
                    onMouseLeave={handleProjectLeave}
                  >
                    Newsquest
                  </span>
                </div>
              </div>

              <div className="site-header-nav-item">
                <span className="site-header-nav-label">Services</span>
                <div className="site-header-nav-values">
                  <span>UI/UX</span>
                  <span>Web Design</span>
                  <span>Motion</span>
                </div>
              </div>

              <div className="site-header-nav-item">
                <span className="site-header-nav-label">Recognition</span>
                <div className="site-header-nav-values">
                  <span>Faber Meeting 2026</span>
                </div>
              </div>
            </div>

            <div className="site-header-nav-actions">
              <a
                href="/contact"
                onClick={handleGoContact}
                className={`site-header-cta${isContactPage ? ' is-active' : ''}`}
                aria-current={isContactPage ? 'page' : undefined}
              >
                Start a project
              </a>

              <div className="site-header-switches">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setLocale(locale === 'EN' ? 'IT' : 'EN'); }}
                  aria-label={`Language: ${locale === 'EN' ? 'English' : 'Italiano'}. Click to switch.`}
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
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default SiteHeader;
