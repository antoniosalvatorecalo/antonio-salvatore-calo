import type { ProjectData } from './projects';

export const bugoniaProjectWorkData: ProjectData = {
  id: 'bugonia',
  title: 'Bugonia Ticket First Website Concept',
  client: 'Bugonia Ticket First Website Concept',
  tagline: '',
  category: 'Web Design',
  year: '2025',
  titleLines: ['Bugonia Ticket First Website Concept'],
  contextLabel: 'Context',
  descriptionCol1: "Ticket-first website concept for the independent film Bugonia. Built to convert, not just present. A persistent Quick-Buy layer keeps ticket access immediate across all scroll states, while expressive typography and a dark editorial atmosphere reflect the film's distinct visual identity. Developed as a Master bonus track at Talent Garden Rome under the mentorship of Paper Tiger Studio.",
  descriptionCol2: 'The website combines expressive typography, dynamic animations, and a seamless ticket booking flow that feels as engaging as the film itself.',
  images: [
    '/media/bugonia/Thumbnail.webp',
    '/media/bugonia/1.webp',
    '/media/bugonia/2.webp',
    '/media/bugonia/3.webp',
    '/media/bugonia/4.webp',
    '/media/bugonia/5.webp'
  ],
  tags: ['WEB DESIGN', 'ART DIRECTION', 'MOTION', 'TYPOGRAPHY']
};

export const newsquestProjectWorkData: ProjectData = {
  id: 'newsquest',
  title: 'Newsquest Mobile News Aggregator',
  client: 'Newsquest Mobile News Aggregator',
  tagline: '',
  category: 'UI/UX Design',
  year: '2025',
  titleLines: ['Newsquest Mobile News Aggregator'],
  contextLabel: 'Context',
  descriptionCol1: "A mobile news aggregator built to rebuild trust in journalism. Newsquest surfaces verified sources with AI-powered glossaries and live context, one story at a time. Dark editorial interface, neon-green credibility signals, and swipe-based discovery designed for young adults who demand both depth and speed. Capstone project at Talent Garden Rome, spanning field research, user interviews, journey mapping, and full high-fidelity prototyping.",
  descriptionCol2: 'The app features an intuitive swipe-based interface for content discovery, integrated fact-checking indicators, and customizable news feeds that adapt to user preferences.',
  images: [
    '/media/newsquest/Thumbnail.webp',
    '/media/newsquest/1.webp',
    '/media/newsquest/2.webp',
    '/media/newsquest/3.webp',
    '/media/newsquest/5.webp'
  ],
  aspect: 'aspect-[3/2]',
  tags: ['UI/UX DESIGN', 'MOBILE', 'PRODUCT DESIGN', 'RESEARCH']
};

export const projectWorkRegistry: ProjectData[] = [bugoniaProjectWorkData, newsquestProjectWorkData];
