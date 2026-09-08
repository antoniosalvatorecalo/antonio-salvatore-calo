# Performance

Production targets are LCP under 2.5s, CLS below 0.1, and INP below 200ms. These are targets, not local validation gates.

Sanity images request `auto=format`, responsive widths, dimensions, and LQIP placeholders. Gallery images are lazy except initial visible content. Vimeo iframes are limited to active project media, with Sanity posters preventing third-party thumbnail dependence. Public catalog reads use the Sanity CDN and sitemap reads are cached at the edge.

Runtime SPA metadata improves browser navigation, but crawlers without JavaScript still receive the static fallback. Measure CWV in deployed production tooling; if unavailable, report implementation changes and that measurement gap.
