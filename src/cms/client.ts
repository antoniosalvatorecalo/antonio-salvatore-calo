import { createClient } from '@sanity/client';

export const SANITY_PROJECT_ID = 'dw4juo8a';
export const SANITY_DATASET = 'production';
export const SANITY_API_VERSION = '2026-09-06';

export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  // The site hydrates from a prerendered snapshot, then refreshes in the browser.
  // Bypass Sanity's CDN here so CMS edits become visible without waiting for CDN cache expiry.
  useCdn: false,
});
