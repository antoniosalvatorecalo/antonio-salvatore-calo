# Architettura

> **Leggi quando:** tocchi route, caricamento dati, transizioni Home ↔ Progetto o il prerender.

## Flusso di una pagina

1. **Build** — `npm run build` compila client e bundle SSR, poi `scripts/prerender.ts`:
   scarica lo snapshot da Sanity (`loadSiteSnapshot`), renderizza ogni route in HTML statico
   (`/`, `/contact`, `/projects/<slug>`), inserisce meta/JSON-LD e uno `<script id="__SITE_SNAPSHOT__">`.
   Genera anche `sitemap.xml`, `llms.txt` e un `.md` per progetto (per agenti/LLM, `noindex`).
2. **Browser** — `src/main.tsx` legge lo snapshot incorporato e fa **hydrate** (niente fetch
   iniziale). Senza snapshot (es. `npm run dev`) fa render client e carica da Sanity.
3. **Aggiornamento** — `ProjectCatalogProvider` riallinea i dati dal CDN Sanity; se il fetch
   fallisce mantiene il contenuto prerenderizzato.

## Albero dei provider

`main.tsx` → `AppShell` (motion preference) → `BrowserRouter` → `AppRoutes`
(`src/providers/AppRouter.tsx`): `LanguageProvider` → `ProjectCatalogProvider` → `ProjectCatalogGate`
→ `SeoManager` + route.

| Route             | Elemento                                                        |
| ----------------- | --------------------------------------------------------------- |
| `/`               | `PortfolioLayout` (header + scena) con piano Home               |
| `/projects/:slug` | **stesso** `PortfolioLayout`: la scena ruota sul piano Progetto |
| `/contact`        | `ContactPage` (lazy)                                            |

## Transizioni (punto delicato)

`PortfolioLayout` mantiene montati `SiteHeader` e `PortfolioScene` per `/` e `/projects/:slug`.
`ProjectTransitionProvider` gestisce le fasi `idle → opening → project → closing`; l'URL si
aggiorna a transizione avviata. **Non** sostituire con un remount per route: si perdono
animazioni, scroll e focus. Durante le transizioni i due piani sono reciprocamente `inert`.
`FilterProvider` sta sopra il transition provider, così il ritorno alla Home azzera i filtri.

## Dati e validazione

Le query GROQ sono in `src/cms/queries.ts`; `src/cms/normalize.ts` converte ogni documento nel
dominio (`src/cms/domain.ts`). Un progetto non valido viene **scartato** senza rompere gli altri.
`siteSettings` è obbligatorio: senza, il gate mostra l'errore.

## SEO a runtime

`src/cms/SeoManager.tsx` aggiorna title, canonical, OG/Twitter e JSON-LD a ogni cambio route,
usando la stessa funzione del prerender (`src/seo/routeSeo.ts`). Dettagli: `docs/seo.md`.

## Funzioni serverless (`api/`)

- `api/contact.ts` — invia il form via SMTP; senza variabili SMTP restituisce un fallback `mailto:`.

La sitemap pubblica (`/sitemap.xml`) è un file statico generato dal prerender: si aggiorna a ogni
deploy.
