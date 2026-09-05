import { BUGONIA_SITE_URL } from '../../config/site';

export interface WorkProjectExtras {
  shortDescription: string;
  contesto: string;
  sfida: string;
  soluzione: string;
  credits: { label: string; values: string[] }[];
  links: { label: string; href: string }[];
  projectRoute: string;
}

export const workProjectExtrasRegistry: Record<string, WorkProjectExtras> = {
  bugonia: {
    shortDescription:
      'Ticket-first: prenotazione centrale, identità visiva del film preservata.',
    contesto:
      'Il ticketing cinematografico è spesso marginale o esternalizzato.',
    sfida:
      'Centrare la conversione senza spezzare l\'immersione narrativa.',
    soluzione:
      'Navigazione persistente. Get Tickets sempre visibile. Flusso a step.',
    credits: [
      { label: 'Ringraziamenti speciali', values: ['Talent Garden', 'Mirko Santangelo'] },
      { label: 'Sviluppo', values: ['Antonio Salvatore Calò', 'Allen Solano'] },
    ],
    links: [
      { label: 'Scopri il processo', href: 'https://www.behance.net/gallery/244625121/Bugonia-Ticket-First-Website-Concept' },
      { label: 'Apri il sito', href: BUGONIA_SITE_URL },
    ],
    projectRoute: '/projects/bugonia',
  },
  newsquest: {
    shortDescription:
      'Aggregatore mobile: fonti verificate, formati immersivi, fiducia nel giornalismo.',
    contesto:
      'Contenuti frammentati, social senza rigore, pensiero critico indebolito.',
    sfida:
      'Restituire fiducia senza rinunciare a profondità e velocità.',
    soluzione:
      'Trust Layer con AI. Una storia alla volta, swipe-based.',
    credits: [
      { label: 'Ringraziamenti speciali', values: ['Talent Garden', 'Gaia Zuccaro', 'Pietro Gregorini'] },
      { label: 'Sviluppo', values: ['Antonio Salvatore Calò', 'Allen Solano', 'R. Tana', 'A. Caparesi', 'E. Zurbakis'] },
    ],
    links: [{ label: 'Vedi il prototipo', href: 'https://www.figma.com/proto/W9CYdNqMKCU1m6DBj1wu1y/Project-Work-%E2%80%93%C2%A0Figma-Gruppo-3?node-id=10520-4293&p=f&viewport=313%2C-353%2C0.07&t=93K7xeCN8e3p2VtH-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=10520%3A4293&show-proto-sidebar=1&page-id=104%3A746' }],
    projectRoute: '/projects/newsquest',
  },
};