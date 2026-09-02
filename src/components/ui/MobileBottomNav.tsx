import React from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useScroll } from '../../providers/ScrollProvider';
import { ThemeIconButton } from './ThemeToggle';
import { useTheme } from '@/hooks/theme/useTheme';
import type { ProjectNavLink } from './CentralNavMenu';
import { useReducedMotionPreference } from '../../providers/MotionPreferenceProvider';
import { useLanguage } from '../../providers/LanguageProvider';
import './MobileBottomNav.css';

/**
 * MobileBottomNav – Fixed bottom navigation for mobile view.
 * Shows three items: Work, Info, Contact, or project links if provided.
 * Work & Info simply toggle the active tab (right/left column) and stay on home.
 * Contact navigates to the /contact page.
 */
interface MobileBottomNavProps {
  projectLinks?: ProjectNavLink[];
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ projectLinks }) => {
  const { isDesktop, setActiveTab, activeTab } = useScroll();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  const prefersReducedMotion = useReducedMotionPreference();
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

  if (isDesktop) return null; // Only render on mobile/tablet.

  const handleClick = (item: 'Work' | 'Info' | 'Contact' | 'Project') => {
    if (item === 'Work') {
      setActiveTab('work');
      navigate('/'); // Ensure we are on the home view.
    } else if (item === 'Info') {
      setActiveTab('about');
      navigate('/');
    } else if (item === 'Contact') {
      navigate('/contact');
    } else if (item === 'Project') {
      // Already on project page, perhaps navigate to home
      navigate('/');
    }
  };

  const isProjectPage = pathname.startsWith('/projects/');

  if (projectLinks && projectLinks.length > 0) {
    // Show project links for project pages
    return (
      <nav className="mobile-nav-container glass-nav">
        {projectLinks.map((link) => (
          <motion.button
            key={link.label}
            onClick={() => window.open(link.href, '_blank', 'noopener,noreferrer')}
            className="mobile-nav-btn mobile-nav-btn--inactive"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
          >
            {tl(link.label)}
          </motion.button>
        ))}
        <div className="mobile-nav-divider" />
        <ThemeIconButton onClick={toggle} theme={theme} />
      </nav>
    );
  }

  const items = isProjectPage
    ? ([
        { id: 'Work', label: t('nav.work') },
        { id: 'Project', label: 'Project' },
        { id: 'Contact', label: t('nav.contact') },
      ] as const)
    : ([
        { id: 'Work', label: t('nav.work') },
        { id: 'Info', label: t('nav.about') },
        { id: 'Contact', label: t('nav.contact') },
      ] as const);

  return (
    <nav className="mobile-nav-container glass-nav">
      {items.map(({ id, label }) => {
        const isActive =
          (id === 'Contact' && pathname === '/contact') ||
          (id === 'Project' && pathname.startsWith('/projects/')) ||
          (id === 'Work' && pathname === '/' && activeTab === 'work') ||
          (id === 'Info' && pathname === '/' && activeTab === 'about');
        return (
          <motion.button
            key={id}
            onClick={() => handleClick(id)}
            className={`mobile-nav-btn ${isActive ? 'mobile-nav-btn--active' : 'mobile-nav-btn--inactive'}`}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
          >
            {label}
          </motion.button>
        );
      })}
      <div className="mobile-nav-divider" />
      <ThemeIconButton onClick={toggle} theme={theme} />
    </nav>
  );
};

export default MobileBottomNav;
