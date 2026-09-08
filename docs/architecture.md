# Architecture

`main.tsx` mounts the router under motion preference handling. `AppRouter` wraps the Sanity catalog, language state, SEO manager, and persistent project transition layout.

`PortfolioLayout` keeps `SiteHeader` and `PortfolioScene` mounted for `/` and `/projects/:slug`. `PortfolioScene` retains index and project planes and `ProjectTransitionProvider` owns `idle`, `opening`, `project`, and `closing`; do not replace this with route-level remounting.

The catalog is fetched from Sanity and normalized per document. Invalid projects are skipped so valid routes, gallery items, filters, and navigation remain usable. `siteSettings` is required for the catalog gate.

The browser client updates canonical, social metadata, favicon, and theme color at runtime. `/sitemap.xml` is a Vercel function that queries public project slugs.
