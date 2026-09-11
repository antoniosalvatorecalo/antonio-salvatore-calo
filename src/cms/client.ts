import { createClient } from '@sanity/client';

export const SANITY_PROJECT_ID = 'dw4juo8a';
export const SANITY_DATASET = 'production';
export const SANITY_API_VERSION = '2026-09-06';

export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  useCdn: true,
});
