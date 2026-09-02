import type { ProjectDetailContent } from './bugoniaDetail';

export const PROTOTYPE_HREF =
  'https://www.figma.com/proto/W9CYdNqMKCU1m6DBj1wu1y/Project-Work-%E2%80%93%C2%A0Figma-Gruppo-3?node-id=10520-4293&p=f&viewport=313%2C-353%2C0.07&t=93K7xeCN8e3p2VtH-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=10520%3A4293&show-proto-sidebar=1&page-id=104%3A746';

export const newsquestDetail: ProjectDetailContent = {
  projectName: 'Newsquest',
  heroLinesDesktop: ['Newsquest', 'Mobile News', 'Aggregator'],
  heroLinesMobile: ['Newsquest Mobile News Aggregator'],
  shortDescription:
    'A mobile news aggregator designed to restore trust in journalism among young readers. Built as the Master\'s capstone at Talent Garden Rome, the product surfaces verified sources with AI glossaries, immersive swipe-based storytelling, and a dark editorial interface. Research spanned field interviews, journey mapping, and affinity mapping before reaching high-fidelity prototyping.',
  metadata: {
    year: '2025',
    industry: 'Media / Journalism',
    location: 'Rome, IT',
    deliverables: ['Product Design', 'UX Research', 'Mobile UI Design'],
    recognition: ['Capstone Project — Talent Garden'],
    credits: [
      { label: 'Institute', values: ['Talent Garden', 'Master in UI Design (Rome)'] },
      { label: 'Project', values: ['Capstone Project', 'Media & Journalism'] },
      { label: 'Team', values: ['A. Salvatore Calò, A. Solano', 'R. Tana, A. Caparesi, E. Zurbakis'] },
      { label: 'Tech Stack', values: ['Figma'] },
      { label: 'Mentorship', values: ['Gaia Zuccaro', 'Pietro Gregorini'] },
      { label: 'Recognition', values: ['Capstone Project', 'Talent Garden'] }
    ],
    links: [{ label: 'View Prototype', href: PROTOTYPE_HREF }]
  },
  projectLinks: [{ label: 'Prototype', href: PROTOTYPE_HREF }],
  media: {
    thumb: '/media/newsquest/Thumbnail.webp',
    image1: '/media/newsquest/1.webp',
    image2: '/media/newsquest/2.webp',
    image3: '/media/newsquest/3.webp',
    image4: '/media/newsquest/4.webp',
    image5: '/media/newsquest/5.webp'
  },
  sections: [
    {
      title: 'Context',
      paragraph: "Capstone project from the Master's in UI Design at Talent Garden Rome. It spans field research, user interviews, journey mapping, affinity mapping, and full high-fidelity prototyping.",
      imageUrl: '/media/newsquest/Thumbnail.webp'
    },
    {
      title: 'Brief',
      paragraph: 'A mobile news aggregator built to restore trust in journalism. Curates verified sources into interactive formats that help young adults consume news critically and stay genuinely engaged.',
      imageUrl: '/media/newsquest/1.webp'
    },
    {
      title: 'The Problem',
      paragraph: "Young users face overload from fragmented, unverified content. Lack of context weakens critical thinking. Social media fills the gap without journalism's rigour. Disengagement follows.",
      imageUrl: '/media/newsquest/2.webp'
    },
    {
      title: 'Core Solutions',
      paragraph: 'Trust Layer surfaces verified sources with AI glossaries and live context. Immersive Formats serve one story at a time through modular text, video explainers, and interactive timelines.',
      imageUrl: '/media/newsquest/3.webp'
    },
    {
      title: 'Visual Design',
      paragraph: 'Dark interface reduces eye strain and foregrounds multimedia. Neon green signals verified content and guides primary actions. Editorial structure keeps full reader control at every step.',
      imageUrl: '/media/newsquest/4.webp'
    },
    {
      title: 'Prototype',
      paragraph: 'Navigate the full Newsquest experience in Figma. Explore trust layers, swipe-based storytelling, verified source indicators, and the immersive dark editorial interface in high fidelity.',
      cta: { label: 'View Prototype', href: PROTOTYPE_HREF },
      imageUrl: '/media/newsquest/5.webp'
    }
  ]
};
