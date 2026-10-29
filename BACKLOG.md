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

- **P3** README del profilo GitHub (repo `antoniosalvatorecalo/antoniosalvatorecalo`) con link al
  sito, servizi e città; impostare la location "Benevento, Italy" e "Available for hire".

### SEO e visibilità

- **P2** Tra una settimana (~2026-11-05): ricontrollare in Search Console indicizzazione (obiettivo 4/4
  pagine), stato della sitemap e canonico scelto da Google (deve essere senza www).
- **P3 [manuale]** Bing Webmaster Tools: importare la proprietà da Search Console.
- **P1 [manuale]** Profilo dell'Attività su Google: completare la **verifica** ("Esegui la verifica", di solito
  video dal telefono). Finché non è verificato non è visibile. Poi: orari, 3–5 recensioni.
- **P2** Versione italiana prerenderizzata (`/it/…`) con `hreflang` e `lang="it"`.
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

- 2026-10-29 — Profilo dell'Attività su Google creato: Web designer, 5 aree servite (Benevento,
  provincia, Avellino, Caserta, Napoli), telefono, sito, 6 servizi, descrizione, foto. In attesa di verifica.
- 2026-10-29 — Google Search Console: dominio verificato (TXT su Namecheap), sitemap inviata,
  indicizzazione richiesta per Home, Contatti, Bugonia e Newsquest.
- 2026-10-29 — Dominio: `antoniosalvatorecalo.com` è il principale, `www` reindirizza con 308
  (allineato a canonical e sitemap).
- 2026-10-29 — PR Dependabot unite (#2, #3, #7: GitHub Actions v7 e 21 aggiornamenti minori);
  #4–#6 chiuse da Dependabot dopo l'esclusione degli aggiornamenti major.
- 2026-10-29 — Vercel Web Analytics e Speed Insights nel codice; Vercel CLI installata e collegata.
- 2026-10-29 — GitHub: descrizione, homepage e topic del repo; Wiki e Projects disattivati;
  etichette di triage e `seo` create; issue #1 chiusa citando i commit di fix; GitHub CLI installata.
- 2026-10-29 — Licenza "tutti i diritti riservati" (`LICENSE`, `UNLICENSED` in package.json).
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
