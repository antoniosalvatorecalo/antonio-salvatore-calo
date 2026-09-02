import { bugoniaDetail } from './projectDetails/bugoniaDetail';
import { newsquestDetail } from './projectDetails/newsquestDetail';

export interface WorkProjectExtras {
  shortDescription: string;
  credits: { label: string; values: string[] }[];
  links: { label: string; href: string }[];
  projectRoute: string;
}

export const workProjectExtrasRegistry: Record<string, WorkProjectExtras> = {
  bugonia: {
    shortDescription:
      'An expressive ticket-buying site for Yorgos Lanthimos\' Bugonia, built as a Master\'s bonus track at Talent Garden Rome. The challenge was converting curious visitors into LA premiere ticket buyers without breaking the film\'s distinctive visual identity — a sticky quick-buy layer keeps the CTA persistent across every scroll state, while editorial typography and a dark cinematic aesthetic carry the mood.',
    credits: bugoniaDetail.metadata.credits,
    links: bugoniaDetail.metadata.links,
    projectRoute: '/projects/bugonia',
  },
  newsquest: {
    shortDescription:
      'A mobile news aggregator designed to restore trust in journalism among young readers. Built as the Master\'s capstone at Talent Garden Rome, the product surfaces verified sources with AI glossaries, immersive swipe-based storytelling, and a dark editorial interface. Research spanned field interviews, journey mapping, and affinity mapping before reaching high-fidelity prototyping.',
    credits: newsquestDetail.metadata.credits,
    links: newsquestDetail.metadata.links,
    projectRoute: '/projects/newsquest',
  },
};