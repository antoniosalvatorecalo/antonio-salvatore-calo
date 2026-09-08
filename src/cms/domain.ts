export type CmsLocale = 'EN' | 'IT';

export interface ProjectMedia {
  key: string;
  type: 'image' | 'vimeo';
  src: string;
  thumbnailSrc?: string;
  alt: string;
  label: string;
  width?: number;
  height?: number;
  lqip?: string;
}

export interface ProjectCreditGroup {
  label: string;
  values: string[];
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface ProjectDetail {
  label: string;
  text?: string;
  credits?: ProjectCreditGroup[];
  cta?: ProjectLink[];
}

export interface ProjectDomain {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  media: ProjectMedia[];
  details?: ProjectDetail[];
  seo?: SeoContent;
}

export interface SeoContent {
  title?: string;
  description?: string;
  canonicalPath?: string;
  openGraphImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}

export interface SiteSettings {
  displayName: string;
  bio: string;
  recognition: string[];
  publicContacts: {kind: 'email' | 'phone' | 'location'; value: string; href?: string}[];
  socials: ProjectLink[];
  downloads: {kind: 'cv' | 'portfolio'; label: string; href: string}[];
  canonicalBaseUrl?: string;
  branding?: {favicon?: string; themeColor?: string};
  seo: SeoContent;
}
