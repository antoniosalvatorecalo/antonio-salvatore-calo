# Backlog

Attività del progetto. Regole:

- Una riga per attività, con priorità: **P1** bloccante · **P2** importante · **P3** quando c'è tempo.
- Quando inizi, sposta in "In corso". Quando finisci, sposta in "Completato" con data e hash del
  commit, e aggiungi la voce in `CHANGELOG.md`.
- Attività fuori dal codice (Vercel, Google, ecc.) sono marcate **[manuale]**.

## In corso

_(vuoto)_

## Da fare

### GitHub

- **P1 [manuale]** Fare il push dei commit locali su `main` (avvia anche il deploy Vercel).
- **P2 [manuale]** Installare GitHub CLI (`winget install GitHub.cli`) e fare `gh auth login`.
- **P2 [manuale]** Repo: aggiungere i topic (portfolio, react, vite, typescript, sanity,
  web-design, benevento), disattivare Wiki e Projects se non usati, scegliere una licenza.
- **P2 [manuale]** Chiudere la issue #1 (scroll mobile e gallery): risolta dai commit
  `5a3fefb`, `efc492d`, `ff595a4`, dopo una verifica su un telefono reale.
- **P2 [manuale]** Creare le etichette `needs-triage`, `needs-info`, `ready-for-human` usate dai template.
- **P3** README del profilo GitHub (repo `antoniosalvatorecalo/antoniosalvatorecalo`) con link al
  sito, servizi e città; impostare la location "Benevento, Italy" e "Available for hire".

### SEO e visibilità

- **P1 [manuale]** Vercel → Domains: rendere `antoniosalvatorecalo.com` (senza www) il dominio
  principale e reindirizzare `www`. Oggi è al contrario e contraddice canonical e sitemap.
- **P1 [manuale]** Google Search Console: verifica del dominio via DNS, invio di `sitemap.xml`,
  richiesta di indicizzazione delle pagine. Anche Bing Webmaster Tools.
- **P1 [manuale]** Profilo dell'Attività su Google ("Web designer", area servita Benevento).
- **P2** Versione italiana prerenderizzata (`/it/…`) con `hreflang` e `lang="it"`.
- **P2** Analytics rispettosi della privacy (Vercel Analytics o Plausible) + aggiornare la CSP.
- **P2** Pagine "Servizi" e "Chi sono" con testi orientati ai clienti.
- **P2** Nuovi casi studio (obiettivo 5–6), con `seo.title`, `seo.description` e `alt` nel CMS.
- **P3** Articoli per clienti locali (costi, tipologie di sito, come scegliere un designer).

### Tecnico

- **P1 [manuale]** Verificare/acquistare la licenza di TT Interphases Pro (in uso la versione _Trial_).
- **P2** `npm run budget:check` risultava oltre soglia: misurare e aggiornare budget o bundle.
- **P3** `ContactFormExperience` importato sia staticamente sia dinamicamente (avviso di build).
- **P3** Pulire regole duplicate e blocchi media vuoti in `src/index.css`.
- **P2 [manuale]** Sanity → API → CORS origins: aggiungere `http://localhost:4173` e
  `http://localhost:3000` per far passare `verify:prerender` e `verify:preloader`.

## Completato

- 2026-10-29 — CI GitHub (qualità + messaggi di commit), template di issue/PR, Dependabot.
- 2026-10-29 — Selettore lingua dell'header unificato in `LanguageSwitch`.
- 2026-10-29 — Pulizia: artefatti, log Playwright, cache, worktree Kilo orfani; rimossi codice
  morto (`CountUp`, `ProjectTransitionPreview`, `api/sitemap.ts`) e verifica obsoleta.
- 2026-10-29 — Verifiche unificate su `scripts/verify/lib/browser.mjs`.
- 2026-10-29 — Fine riga LF e Prettier su tutto il repository.
- 2026-10-29 — Riorganizzazione repository, documentazione in italiano, regole di commit e
  comando `annulla`.
- 2026-10-29 — SEO on-page: H1, dati strutturati locali, meta della pagina Contatti.
- 2026-10-21 — Coreografia filtri Home/Progetto e reset dei filtri al ritorno in Home
  (analisi in `docs/archivio/2026-10-transizioni-e-filtri.md`).
- 2026-10-21 — Eliminato il flash del testo nell'apertura dei progetti.
- 2026-09-23 — Intro cinematico con percentuale ed entrata sequenziale della gallery.
- 2026-09-12 — Dominio personalizzato come origine canonica; form contatti localizzato.
- 2026-09-07 — Prerender, sitemap e dati strutturati per l'indicizzazione.
