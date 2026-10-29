# AGENTS.md — istruzioni per agenti AI (e per chi mantiene il codice)

> Questo è il **primo e unico file da leggere sempre**. Tutto il resto si legge solo se il
> compito lo richiede (vedi "Quale documento leggere"). Lingua di lavoro: **italiano**.

## Il progetto in 5 righe

Portfolio di Antonio Salvatore Calò (designer, Benevento). React 19 + Vite + TypeScript +
Tailwind v4, contenuti da **Sanity CMS**, deploy su **Vercel** (`antoniosalvatorecalo.com`).
Le pagine sono prerenderizzate in build (`scripts/prerender.ts`) per SEO. Il cuore dell'esperienza
è una scena 3D persistente con transizioni Home ↔ Progetto (GSAP + Motion).
Lo Studio Sanity vive in un repo separato: `../studio-antonio-salvatore-calo/`.

## Mappa del codice (dove mettere le mani)

| Cartella / file                    | Cosa contiene                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `src/main.tsx`, `entry-server.tsx` | Avvio client / render server per il prerender                                 |
| `src/providers/`                   | Router, lingua EN/IT, filtri, stato transizioni, motion preference            |
| `src/layouts/PortfolioLayout.tsx`  | Guscio persistente: `SiteHeader` + `PortfolioScene`                           |
| `src/components/home/`             | Gallery, filtri, indice progetti, scena                                       |
| `src/components/projects/`         | Pagina progetto: gallery, lightbox, dettagli, anteprime                       |
| `src/components/ui/`               | Header, form contatti, intro, link animati                                    |
| `src/pages/contact/`               | Pagina `/contact`                                                             |
| `src/cms/`                         | Client Sanity, query GROQ, normalizzazione, tipi (`sanity.types.ts` generato) |
| `src/seo/routeSeo.ts`              | Title, description, canonical, JSON-LD per ogni route                         |
| `src/i18n/translations.ts`         | Testi UI EN/IT                                                                |
| `src/motion/`, `src/lib/gsap-*`    | Timeline e setup animazioni                                                   |
| `src/index.css`                    | Token di design globali                                                       |
| `api/`                             | Funzioni Vercel (`contact.ts` invio email)                                    |
| `scripts/prerender.ts`             | Genera HTML statico, `sitemap.xml`, `llms.txt`, `.md` dei progetti            |
| `scripts/verify/`                  | Verifiche (Playwright, budget, prerender)                                     |
| `scripts/git-hooks/`, `.githooks/` | Hook git: blocco file vietati + messaggi commit in italiano                   |
| `scripts/git/annulla.mjs`          | Annulla commit in sicurezza (`npm run annulla`)                               |
| `.github/`                         | CI (`workflows/ci.yml`), template issue/PR, Dependabot                        |

## Quale documento leggere (solo se serve)

| Se devi…                                        | Leggi                        |
| ----------------------------------------------- | ---------------------------- |
| capire il flusso dati, le route, le transizioni | `docs/architettura.md`       |
| toccare contenuti, query GROQ o schemi Sanity   | `docs/cms.md`                |
| toccare stile, layout, animazioni               | `docs/design-system.md`      |
| scrivere/rifattorizzare codice                  | `docs/convenzioni-codice.md` |
| avviare, testare, rilasciare                    | `docs/sviluppo.md`           |
| toccare meta tag, sitemap, dati strutturati     | `docs/seo.md`                |
| fare un commit o annullare una modifica         | `docs/git-e-commit.md`       |
| sapere cosa è stato fatto / cosa resta da fare  | `CHANGELOG.md`, `BACKLOG.md` |

## Risparmio di contesto (token)

- **Non leggere**: `package-lock.json`, `dist/`, `.ssr/`, `node_modules/`, `.artifacts/`,
  `public/media/` (PDF), `src/cms/sanity.types.ts` (solo per cercare un tipo specifico).
  `docs/archivio/` è storico: aprilo solo se il compito cita quella vicenda.
- Cerca prima con grep/glob mirati, poi leggi solo le righe utili. File grandi da leggere a
  porzioni: `src/index.css`, `SiteHeader.tsx`, `SingleProjectView.tsx`.
- Non riepilogare documenti nel codice o in altri documenti: collega il file.

## Regole non negoziabili

1. **Non rompere l'esperienza**: mantieni `PortfolioLayout` e `PortfolioScene` persistenti, le fasi
   di transizione (`idle`, `opening`, `project`, `closing`), focus, tastiera e reduced motion.
2. **Niente condizioni per singolo progetto** nel frontend: ordine, filtri e route derivano dal CMS.
3. **Mai modificare a mano** `src/cms/sanity.types.ts` (si rigenera dallo Studio).
4. **Mai** eseguire import/reset Sanity o deploy senza richiesta esplicita.
5. Non cancellare asset senza aver controllato codice, CMS, metadati e download.
6. Ogni modifica visibile o di comportamento: aggiorna `CHANGELOG.md` (sezione "Non rilasciato")
   e sposta la voce in `BACKLOG.md` nello stesso commit.

## Commit (obbligatorio, verificato dall'hook `commit-msg`)

- Formato: `<tipo>(<ambito>): <descrizione in italiano, imperativo>` — max 72 caratteri.
  Esempio: `fix(seo): allinea canonical al dominio principale`.
- Un commit = una modifica logica, così si può annullare da sola. Chiedi conferma prima di
  committare. Mai `--no-verify`, `--amend` su commit pubblicati o `push --force`.
- Per annullare: `npm run annulla -- <hash>` (crea un nuovo commit, non riscrive la storia).
- Dettagli: `docs/git-e-commit.md`.

## Verifica minima prima di dire "fatto"

`npm run typecheck && npm run lint && npm run build` — più la verifica `scripts/verify/` pertinente.
Se una verifica non può girare (es. browser Playwright mancanti), dillo esplicitamente.

## Issue e triage

Issue su GitHub (`antoniosalvatorecalo/antonio-salvatore-calo`) via `gh`. Etichette:
`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`.
