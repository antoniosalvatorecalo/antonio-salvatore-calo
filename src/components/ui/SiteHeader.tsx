import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { gsap } from '../../lib/gsap-setup';
import { useTheme } from '../../hooks/theme/useTheme';
import { ThemeIconButton } from './ThemeToggle';
import { LetterSwapBlock } from './letter-swap';
import { useLanguage } from '../../providers/LanguageProvider';
import { useScroll } from '../../providers/ScrollProvider';
import { ScrollerContext } from '../../layouts/ProjectBrutalistLayout';
import { useItalyTime } from '../../hooks/useItalyTime';
import './SiteHeader.css';

export interface ProjectNavLink {
  label: string;
  href: string;
}

interface SiteHeaderProps {
  projectLinks?: ProjectNavLink[];
}

const MENU_REVEAL_SELECTOR = '[data-menu-item]';

export const SiteHeader = (_props: SiteHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const italyTime = useItalyTime();
  const { locale, toggleLocale, t } = useLanguage();
  const { theme, toggle } = useTheme();
  const { isDesktop, setActiveTab } = useScroll();
  const scrollerContext = useContext(ScrollerContext);
  const isHome = location.pathname === '/';
  const usesHomeTabs = isHome && !isDesktop;
  const isProjectPage = location.pathname.startsWith('/projects/');
  const [isAtTop, setIsAtTop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const expandedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProjectPage) return;
    const lenis = scrollerContext?.lenis;
    if (!lenis) {
      setIsAtTop(true);
      return;
    }
    const checkScroll = () => setIsAtTop(lenis.scroll <= 50);
    lenis.on('scroll', checkScroll);
    checkScroll();
    return () => lenis.off('scroll', checkScroll);
  }, [isProjectPage, scrollerContext]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const container = expandedRef.current;
    if (!container) return;
    const items = container.querySelectorAll<HTMLElement>(MENU_REVEAL_SELECTOR);
    if (!items.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, y: 12, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.05,
          clearProps: 'willChange',
        },
      );
    }, container);
    return () => { ctx.revert(); };
  }, [menuOpen]);

  const handleBackClick = () => {
    if (isAtTop || !isProjectPage) {
      navigate('/');
    } else {
      scrollerContext?.lenis?.scrollTo(0);
    }
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleMenuNavigate = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleNavClick = (path: string) => {
    if (path === '/') {
      if (!isDesktop) setActiveTab('work');
      navigate('/');
      return;
    }

    if (path === '/about') {
      if (usesHomeTabs) {
        setActiveTab('about');
        return;
      }

      navigate('/about');
      return;
    }

    navigate(path);
  };

  const services = [
    t('services.ui-design'),
    t('services.ux-design'),
    t('services.web-design'),
    t('services.systems'),
    t('services.prototypes'),
    t('services.motion'),
  ];

  const timeZoneLabel = `${italyTime} CET`;

  return (
    <header className={`site-header${menuOpen ? ' is-menu-open' : ''}`}>
      <div className="site-header-inner">
        {isProjectPage ? (
          <button
            onClick={handleBackClick}
            className="site-header-back-btn"
            aria-label={isAtTop ? t('aria.back-home') : t('aria.back-top')}
          >
            <motion.svg
              animate={{ rotate: isAtTop ? 180 : 270 }}
              transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </motion.svg>
          </button>
        ) : (
          <div className="site-header-col site-header-col--name">
            <Link
              to="/"
              className="site-header-name site-header-name--link"
              onClick={() => { if (menuOpen) setMenuOpen(false); }}
              aria-label={t('aria.back-home')}
            >
              {t('hero.full-name')}
            </Link>
          </div>
        )}

        <div className="site-header-col site-header-col--time">
          {isProjectPage ? (
            <span className="site-header-time">{italyTime}</span>
          ) : (
            <span className="site-header-time">{timeZoneLabel}</span>
          )}
        </div>

        <div className="site-header-col site-header-col--services">
          <span className="site-header-eyebrow">{t('services.label')}</span>
          <ul className="site-header-list">
            {services.map((service) => (
              <li key={service} className="site-header-list-item">{service}</li>
            ))}
          </ul>
        </div>

        <div className="site-header-col site-header-col--awards">
          <span className="site-header-eyebrow">{t('header.menu-section.awards')}</span>
          <ul className="site-header-list">
            <li className="site-header-list-item">
              <a
                href="/about"
                className="site-header-link"
                onClick={(e) => { e.preventDefault(); handleNavClick('/about'); }}
              >
                <span className="site-header-link-text">{t('awards.faber-meeting-2026')}</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="site-header-col site-header-col--profile">
          <span className="site-header-eyebrow">{t('header.menu-section.profile')}</span>
          <ul className="site-header-list">
            <li className="site-header-list-item">
              <a
                href="/about"
                className="site-header-link"
                onClick={(e) => { e.preventDefault(); handleNavClick('/about'); }}
              >
                <span className="site-header-link-text">{t('header.menu-cta.profile')}</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="site-header-col site-header-col--contact">
          <span className="site-header-eyebrow">{t('nav.contact')}</span>
          <ul className="site-header-list">
            <li className="site-header-list-item">
              <a
                href="/contact"
                className="site-header-link"
                onClick={(e) => { e.preventDefault(); handleNavClick('/contact'); }}
              >
                <span className="site-header-link-text">{t('header.menu-cta.contact')}</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="site-header-col site-header-col--prefs">
          <div className="site-header-prefs-group">
            <button
              onClick={toggleLocale}
              className="site-header-lang-toggle"
              aria-label={t('aria.toggle-language')}
            >
              [ {locale} ]
            </button>
            <button
              onClick={toggle}
              className="site-header-theme-toggle"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              [ {theme === 'light' ? 'LI' : 'DR'} ]
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleMenu}
          className="site-header-menu-toggle"
          aria-label={menuOpen ? t('header.menu-toggle.close') : t('header.menu-toggle.open')}
          aria-expanded={menuOpen}
          aria-controls="site-header-expanded-panel"
        >
          {menuOpen ? <X className="site-header-menu-icon" /> : <Menu className="site-header-menu-icon" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            id="site-header-expanded-panel"
            ref={expandedRef}
            className="site-header-expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="site-header-expanded-grid">
              <div className="site-header-expanded-main">
                <button
                  type="button"
                  className="site-header-name-btn"
                  onClick={toggleMenu}
                  aria-label={t('header.menu-toggle.close')}
                >
                  <LetterSwapBlock
                    lines={[t('hero.full-name')]}
                    className="header-full-name"
                    staggerDuration={0.018}
                    transition={{ type: 'spring', duration: 0.7 }}
                  />
                </button>
                <div className="site-header-meta">
                  <span className="site-header-meta-time">{timeZoneLabel}</span>
                  <span className="site-header-meta-dot" aria-hidden="true">·</span>
                  <span className="site-header-meta-availability">{t('header.availability')}</span>
                </div>
              </div>

              <div className="site-header-expanded-right">
                <div className="site-header-expanded-sections">
                  <div className="header-menu-item" data-menu-item>
                    <span className="header-menu-eyebrow">{t('header.menu-section.recognition')}</span>
                    <p className="header-menu-desc">{t('meta.recognition')}</p>
                  </div>

                  <div className="header-menu-item" data-menu-item>
                    <span className="header-menu-eyebrow">{t('header.menu-section.awards')}</span>
                    <p className="header-menu-award-title">{t('awards.faber-meeting-2026')}</p>
                    <p className="header-menu-desc">{t('awards.faber-meeting-desc')}</p>
                  </div>

                  <div className="header-menu-item" data-menu-item>
                    <span className="header-menu-eyebrow">{t('header.menu-section.about')}</span>
                    <Link
                      to="/about"
                      className="header-menu-link"
                      onClick={(e) => { e.preventDefault(); handleMenuNavigate('/about'); }}
                    >
                      <span className="header-menu-link-text">{t('header.menu-cta.about')}</span>
                      <ArrowUpRight className="header-menu-link-icon" aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="header-menu-item" data-menu-item>
                    <span className="header-menu-eyebrow">{t('header.menu-section.profile')}</span>
                    <Link
                      to="/about"
                      className="header-menu-link"
                      onClick={(e) => { e.preventDefault(); handleMenuNavigate('/about'); }}
                    >
                      <span className="header-menu-link-text">{t('header.menu-cta.profile')}</span>
                      <ArrowUpRight className="header-menu-link-icon" aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="header-menu-item" data-menu-item>
                    <span className="header-menu-eyebrow">{t('header.menu-section.contact')}</span>
                    <Link
                      to="/contact"
                      className="header-menu-link"
                      onClick={(e) => { e.preventDefault(); handleMenuNavigate('/contact'); }}
                    >
                      <span className="header-menu-link-text">{t('header.menu-cta.contact')}</span>
                      <ArrowUpRight className="header-menu-link-icon" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                <div className="site-header-expanded-switches" data-menu-item>
                  <div className="header-menu-switch-row">
                    <span className="header-menu-eyebrow">Theme</span>
                    <ThemeIconButton onClick={toggle} theme={theme} className="site-header-theme-btn" />
                  </div>
                  <div className="header-menu-switch-row">
                    <span className="header-menu-eyebrow">Language</span>
                    <button
                      onClick={toggleLocale}
                      className="site-header-lang-toggle"
                    >
                      [ {locale} ]
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};