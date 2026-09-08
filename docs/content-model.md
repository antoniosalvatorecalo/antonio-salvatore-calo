# Content model

`project` requires localized EN/IT title and description, unique slug, display order, canonical service, and a gallery with at least one accessible labeled item. Services are controlled Studio values; legacy values remain readable until manually migrated.

Projects use localized Context, Challenge, Solution, credits, links, media, and optional SEO overrides. Image and Vimeo media require EN/IT alt and label; Vimeo also requires a valid URL and Sanity poster.

Create a new project in Studio, assign an unused order and slug, select a canonical category, supply gallery and SEO media, then publish. No slug-specific frontend work is permitted. Duplicate orders are reported by the frontend/Studio workflow and must be resolved manually.

`siteSettings` is a singleton containing global copy, contacts, downloads, canonical origin, SEO, and optional branding favicon/theme color.
