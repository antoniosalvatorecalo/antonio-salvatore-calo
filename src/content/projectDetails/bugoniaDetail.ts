import { BUGONIA_SITE_URL } from '../../../config/site';

export interface ProjectCreditEntry {
  label: string;
  values: string[];
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface ProjectSectionContent {
  title: string;
  paragraph: string;
  cta?: ProjectLink;
  imageUrl: string;
}

export interface ProjectDetailContent {
  projectName: string;
  heroLinesDesktop: string[];
  heroLinesMobile: string[];
  shortDescription: string;
  metadata: {
    year: string;
    industry: string;
    location: string;
    deliverables: string[];
    recognition: string[];
    credits: ProjectCreditEntry[];
    links: ProjectLink[];
  };
  projectLinks: ProjectLink[];
  media: {
    thumb: string;
    image1: string;
    image2: string;
    image3: string;
    image4: string;
    image5: string;
  };
  sections: ProjectSectionContent[];
}

export const bugoniaDetail: ProjectDetailContent = {
  projectName: 'Bugonia',
  heroLinesDesktop: ['Bugonia', 'Ticket First', 'Website Concept'],
  heroLinesMobile: ['Bugonia Ticket First Website Concept'],
  shortDescription:
    'An expressive ticket-buying site for Yorgos Lanthimos\' Bugonia, built as a Master\'s bonus track at Talent Garden Rome. The challenge was converting curious visitors into LA premiere ticket buyers without breaking the film\'s distinctive visual identity — a sticky quick-buy layer keeps the CTA persistent across every scroll state, while editorial typography and a dark cinematic aesthetic carry the mood.',
  metadata: {
    year: '2025',
    industry: 'Entertainment / Film',
    location: 'Rome, IT',
    deliverables: ['Art Direction', 'Web Design', 'UI/UX', 'Prototyping'],
    recognition: ['Winner — Faber Meeting 2026, Web App & Social category'],
    credits: [
      { label: 'Institute', values: ['Talent Garden', 'Master in UI Design (Rome)'] },
      { label: 'Project', values: ['Master Bonus Track', 'Entertainment / Film'] },
      { label: 'Team', values: ['A. Salvatore Calò', 'A. Solano'] },
      { label: 'Tech Stack', values: ['Figma, Antigravity', 'GitHub & Vercel'] },
      { label: 'Mentorship', values: ['Mirko Santangelo', 'Creative Director @ Paper Tiger'] },
      { label: 'Recognition', values: ['Winner — Faber Meeting 2026', 'Web App & Social category'] }
    ],
    links: [
      { label: 'Discover the process', href: 'https://www.behance.net/gallery/244625121/Bugonia-Ticket-First-Website-Concept' },
      { label: 'Open Live Website', href: BUGONIA_SITE_URL }
    ]
  },
  projectLinks: [
    { label: 'Process', href: 'https://www.behance.net/gallery/244625121/Bugonia-Ticket-First-Website-Concept' },
    { label: 'Live', href: BUGONIA_SITE_URL }
  ],
  media: {
    thumb: '/media/bugonia/Thumbnail.webp',
    image1: '/media/bugonia/1.webp',
    image2: '/media/bugonia/2.webp',
    image3: '/media/bugonia/3.webp',
    image4: '/media/bugonia/4.webp',
    image5: '/media/bugonia/5.webp'
  },
  sections: [
    {
      title: 'Context',
      paragraph: "Bonus track project developed under Mirko Santangelo, Creative Director of Paper Tiger Studio. Part of the Master's program in User Interface Design at Talent Garden in Rome.",
      imageUrl: '/media/bugonia/Thumbnail.webp'
    },
    {
      title: 'Brief',
      paragraph: "Expressive website for desktop and mobile. It presents the film with depth, converts visitors into ticket buyers for the LA premiere, and reflects Bugonia's distinct visual identity.",
      imageUrl: '/media/bugonia/1.webp'
    },
    {
      title: 'The Problem',
      paragraph: 'Film sites optimize for browsing, not converting. Ticket CTAs hide mid-scroll or disappear entirely. Competing content delays the main action. Mobile flows remain unclear and broken.',
      imageUrl: '/media/bugonia/2.webp'
    },
    {
      title: 'Core Solutions',
      paragraph: 'Sticky Quick-Buy Layer makes the ticket CTA persistent across all scroll states. Search, profile, and merch stay accessible in the nav without distracting from the primary conversion path.',
      imageUrl: '/media/bugonia/3.webp'
    },
    {
      title: 'Full Case Study',
      paragraph: 'Explore the complete design process, from research and competitive analysis to interaction decisions, detailed documentation, and high-fidelity visuals. All published on Behance.',
      cta: { label: 'Discover the Process', href: 'https://www.behance.net/gallery/244625121/Bugonia-Ticket-First-Website-Concept' },
      imageUrl: '/media/bugonia/4.webp'
    },
    {
      title: 'Live Website',
      paragraph: 'Step into the Bugonia universe. The dark aesthetic, the Conversion Navigation, and the sticky quick-buy layer come together in a fully deployed and interactive production build.',
      cta: { label: 'Open Live Website', href: BUGONIA_SITE_URL },
      imageUrl: '/media/bugonia/5.webp'
    }
  ]
};
