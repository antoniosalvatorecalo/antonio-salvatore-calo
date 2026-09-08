import {defineQuery} from 'groq';

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project"] | order(order asc){
    _id,
    title,
    slug,
    order,
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
        asset->{_id, url, metadata{dimensions, lqip}}
      },
      poster{
        crop,
        hotspot,
        asset->{_id, url, metadata{dimensions, lqip}}
      }
    }
  }
`);

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    displayName,
    bio,
    recognition,
    publicContacts[]{_key, kind, value, href},
    socials[]{_key, label, href},
    downloads[]{_key, kind, label, href},
    canonicalBaseUrl,
    branding{themeColor, favicon{asset->{url}}},
    seo{
      title,
      description,
      canonicalPath,
      "openGraphImage": openGraphImage.asset->url,
      twitterCard
    }
  }
`);
