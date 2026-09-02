import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../../hooks/theme/useTheme';
import { ThemeIconButton } from './ThemeToggle';
import { LetterSwapForward } from './letter-swap';
import { ScrollerContext } from '../../layouts/ProjectBrutalistLayout';
import { useLanguage } from '../../providers/LanguageProvider';
import type { ProjectNavLink } from './CentralNavMenu';
import './ProjectHeader.css';

interface ProjectHeaderProps {
  projectLinks?: ProjectNavLink[];
}

export const ProjectHeader = ({ projectLinks }: ProjectHeaderProps) => {
  const navigate = useNavigate();
  const { locale, toggleLocale, t } = useLanguage();
  const { theme, toggle } = useTheme();
  const scrollerContext = useContext(ScrollerContext);
  const [isAtTop, setIsAtTop] = useState(true);

  // Map English link labels to translation keys
  const linkLabelKey: Record<string, string> = {
    'Process': 'cta.process',
    'Live': 'cta.live',
    'Prototype': 'cta.prototype',
    'Discover the process': 'cta.discover-process',
    'Open Live Website': 'cta.open-live',
    'View Prototype': 'cta.view-prototype',
  };
  const translateLabel = (label: string) => t(linkLabelKey[label] || label);

  useEffect(() => {
    const lenis = scrollerContext?.lenis;
    if (!lenis) return;

    const checkScroll = () => {
      setIsAtTop(lenis.scroll <= 50);
    };

    lenis.on('scroll', checkScroll);
    checkScroll();

    return () => {
      lenis.off('scroll', checkScroll);
    };
  }, [scrollerContext]);

  const handleBackClick = () => {
    if (isAtTop) {
      navigate('/');
    } else {
      scrollerContext?.lenis?.scrollTo(0);
    }
  };

  const arrowRotation = isAtTop ? 225 : 315; // 225=left, 315=up

  return (
    <header className="project-header">
      <div className="project-header-inner">
        <div className="project-header-left">
          <button
            onClick={handleBackClick}
            className="project-header-back"
            aria-label={isAtTop ? t('aria.back-home') : t('aria.back-top')}
          >
            <motion.span
              className="project-header-back-icon-wrap"
              animate={{ rotate: arrowRotation }}
              transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            >
              <ArrowUpRight className="project-header-back-icon" />
            </motion.span>
          </button>
        </div>

        <nav className="project-header-nav">
          <div className="project-nav-pill">
            {projectLinks?.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
                className="project-nav-pill-item"
              >
                <span className="nav-pill-text-wrap">
                  <LetterSwapForward
                    label={translateLabel(label)}
                    className="nav-pill-text nav-pill-letter-swap"
                    staggerDuration={0.018}
                    transition={{ type: 'spring', duration: 0.58 }}
                  />
                </span>
                <span className="nav-pill-arrow-mask" aria-hidden="true">
                  <ArrowUpRight className="nav-pill-arrow-icon" />
                </span>
              </button>
            ))}
          </div>
        </nav>

        <div className="project-header-right">
          <button
            onClick={toggleLocale}
            className="project-header-lang-toggle"
          >
            [ {locale} ]
          </button>
          <ThemeIconButton onClick={toggle} theme={theme} className="project-header-theme-btn" />
        </div>
      </div>
    </header>
  );
};
