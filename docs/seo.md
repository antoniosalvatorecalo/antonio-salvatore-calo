# SEO e indicizzazione

> **Leggi quando:** tocchi meta tag, canonical, sitemap, dati strutturati, dominio o testi
> pensati per la ricerca. Le attività SEO ancora aperte sono in `BACKLOG.md`.

## Dove vive cosa

| Elemento                                                                               | File                                                   |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Title, description, canonical, OG/Twitter                                              | `src/seo/routeSeo.ts` → `deriveRouteSeo`               |
| JSON-LD (`Person`, `ProfessionalService`, `WebSite`, `CreativeWork`, `BreadcrumbList`) | `src/seo/routeSeo.ts` → `routeStructuredData`          |
| Inserimento nell'HTML statico                                                          | `scripts/prerender.ts`                                 |
| Aggiornamento in navigazione SPA                                                       | `src/cms/SeoManager.tsx`                               |
| H1 di Home e Contatti (invisibile, `sr-only`)                                          | `src/components/ui/SiteHeader.tsx` + chiavi `seo.h1.*` |
| `robots.txt`                                                                           | `public/robots.txt`                                    |
| `sitemap.xml`, `llms.txt`                                                              | generati da `scripts/prerender.ts`                     |
| Testi SEO per progetto/sito                                                            | Sanity (campi `seo` di `project` e `siteSettings`)     |

## Regole

- **Dominio canonico: `https://antoniosalvatorecalo.com` (senza www).** Canonical, sitemap,
  `robots.txt` e JSON-LD devono usare sempre lo stesso host. Su Vercel il dominio senza www deve
  essere il principale e `www` deve reindirizzare (308) verso di lui.
- Una sola `<h1>` per pagina. Nelle pagine progetto è il titolo nell'header.
- Città e area servita (Benevento, Campania, Italia) sono in `routeSeo.ts`: se cambiano, si
  aggiornano lì e nei testi `seo.h1.*` di `src/i18n/translations.ts`.
- Title ≤ 60 caratteri circa, description 120–160. Ogni progetto deve avere `seo.title` e
  `seo.description` propri nel CMS, e un `alt` descrittivo per ogni immagine.
- I file `.md` dei progetti sono per gli agenti/LLM e hanno `X-Robots-Tag: noindex` (`vercel.json`).
- Lingua: oggi l'HTML prerenderizzato è solo in inglese (`lang="en"`); l'italiano è solo lato
  client. La versione `/it/` con `hreflang` è in `BACKLOG.md`.

## Verifica rapida dopo una modifica

```bash
npm run build
grep -o '<title>[^<]*</title>' dist/index.html dist/contact/index.html
npm run verify:agentic
```

Poi, sul sito pubblicato: [Rich Results Test](https://search.google.com/test/rich-results) e
Google Search Console → Controllo URL.
