import {defineQuery} from 'groq';

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project"] | order(order asc){
    _id,
    title,
    slug,
    order,
    client,
    year,
    service,
    description,
    details,
    credits[]{_key, label, values},
    links[]{_key, label, href},
    seo{
      title,
      description,
      canonicalPath,
      "openGraphImage": openGraphImage.asset->url,
      twitterCard
    },
    gallery[]{
      _key,
      _type,
      alt,
      label,
      url,
      image{
        crop,
        hotspot,
        asset->{_id, url, metadata{dimensions}}
      },
      poster{
        crop,
        hotspot,
        asset->{_id, url, metadata{dimensions}}
      }
    }
  }
`);

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    displayName,
    bio,
    services,
    recognition,
    publicContacts[]{_key, kind, label, value, href},
    socials[]{_key, label, href},
    downloads[]{_key, kind, label, href},
    canonicalBaseUrl,
    seo{
      title,
      description,
      canonicalPath,
      "openGraphImage": openGraphImage.asset->url,
      twitterCard
    }
  }
`);
