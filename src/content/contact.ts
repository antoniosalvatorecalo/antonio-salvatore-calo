/**
 * Shared contact information — single source of truth.
 * Used by AboutContact (home page) and ProjectBrutalistLayout (project pages).
 */
export const CONTACT = {
  location: 'Benevento, Italy',
  email: 'antonio.salvatore.calo@gmail.com',
  emailHref: 'mailto:antonio.salvatore.calo@gmail.com',
  phone: '+39 3335050401',
  phoneHref: 'tel:+393335050401',
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/antonio-salvatore-cal%C3%B2-/' },
    { label: 'Instagram', href: 'https://www.instagram.com/therealtoree/' },
    { label: 'Behance', href: 'https://www.behance.net/gallery/244625121/Bugonia-Ticket-First-Website-Concept' },
  ],
} as const;

export const CONTACT_FOOTER_CTA_HTML = `<span style="color:#0A0A0A">Good projects</span> <span style="color:#0A0A0A">start with the</span> <span style="color:#0A0A0A">right\u00a0conversation.</span> <span style="color:#0A0A0A">If you think this could be one of them,</span> <span style="color:#0A0A0A">I'm available.</span>`;

export const CONTACT_FOOTER_CTA_HTML_DARK = `<span style="color:#F5F5F5">Good projects</span> <span style="color:#A0A0A0">start with the</span> <span style="color:#F5F5F5">right\u00a0conversation.</span> <span style="color:#A0A0A0">If you think this could be one of them,</span> <span style="color:#F5F5F5">I'm available.</span>`;
