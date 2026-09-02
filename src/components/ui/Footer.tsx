import { ArrowUpRight } from 'lucide-react';
import { CONTACT } from '@/content/contact';
import { LetterSwapForward } from './letter-swap';
import { useLanguage } from '../../providers/LanguageProvider';
import './Footer.css';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-col site-footer-col--left">
          <p className="site-footer-role">{t('contact.role')}</p>
          <p className="site-footer-location">{t('contact.location')}</p>
          <a href={CONTACT.emailHref} className="site-footer-email group">
            <span className="relative hover-underline">
              <LetterSwapForward
                label={CONTACT.email}
                className="site-footer-email-text"
                reverse={false}
              />
            </span>
          </a>
        </div>
        <div className="site-footer-col site-footer-col--right">
          <div className="site-footer-socials">
            {CONTACT.socials.map((social) => (
              <a key={social.label} href={social.href} className="site-footer-link group">
                <span className="relative hover-underline">
                  <LetterSwapForward
                    label={social.label}
                    className="site-footer-link-text"
                    reverse={false}
                  />
                </span>
                <span className="nav-pill-arrow-mask" aria-hidden="true">
                  <ArrowUpRight className="nav-pill-arrow-icon" />
                </span>
              </a>
            ))}
          </div>
          <a href={CONTACT.phoneHref} className="site-footer-link site-footer-phone group">
            <span className="relative hover-underline">
              <LetterSwapForward
                label={CONTACT.phone}
                className="site-footer-link-text"
                reverse={false}
              />
            </span>
            <span className="nav-pill-arrow-mask" aria-hidden="true">
              <ArrowUpRight className="nav-pill-arrow-icon" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
};