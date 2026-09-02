import { MagneticButton } from '@/components/effects/interaction/MagneticButton';
import { useLanguage } from '../../providers/LanguageProvider';
import { useScroll } from '../../providers/ScrollProvider';
import { ThemeIconButton } from './ThemeToggle';
import { useTheme } from '@/hooks/theme/useTheme';
import type { ProjectNavLink } from './CentralNavMenu';
import './ProjectMobileNav.css';

/**
 * ProjectMobileNav Component
 * Floating tab navigation for mobile AND tablet viewports on project pages.
 * Uses MagneticButton for interactive feedback.
 * Per three-tier responsive: visible on mobile (<768px) and tablet (768-1024px),
 * hidden on desktop (>1024px).
 */
export const ProjectMobileNav: React.FC<{
  projectLinks?: ProjectNavLink[];
  onSelectProjectTab?: (tab: 'project' | 'credits') => void;
}> = ({
  projectLinks = [],
  onSelectProjectTab,
}) => {
  // Hidden on desktop (>1024px), visible on mobile AND tablet
  const { t } = useLanguage();
  const linkLabelKey: Record<string, string> = {
    'Process': 'cta.process',
    'Live': 'cta.live',
    'Prototype': 'cta.prototype',
    'Discover the process': 'cta.discover-process',
    'Open Live Website': 'cta.open-live',
    'View Prototype': 'cta.view-prototype',
  };
  const tl = (label: string) => t(linkLabelKey[label] || label);
  const { activeTab, setActiveTab, isDesktop, isTablet: _isTablet } = useScroll();
  const { theme, toggle } = useTheme();

  if (isDesktop) return null;

  return (
    <div className="mobile-project-nav glass-nav">
      <MagneticButton
        onClick={() => onSelectProjectTab ? onSelectProjectTab('project') : setActiveTab('project')}
        isActive={activeTab === 'project'}
      >
        {t('nav.project')}
      </MagneticButton>

      {/* Extra project links (PROCESS, LIVE, …) with arrow */}
      {projectLinks.map((link) => (
        <button
          key={link.label}
          onClick={() => window.open(link.href, '_blank', 'noopener,noreferrer')}
          className="nav-link-btn"
        >
          <span>{tl(link.label)}</span>
          <svg
            className="nav-link-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      ))}
      <div className="nav-inner-divider" />
      <ThemeIconButton onClick={toggle} theme={theme} />
    </div>
  );
};
