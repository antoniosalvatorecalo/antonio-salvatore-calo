# Backlog

Attività del progetto. Regole:

- Una riga per attività, con priorità: **P1** bloccante · **P2** importante · **P3** quando c'è tempo.
- Quando inizi, sposta in "In corso". Quando finisci, sposta in "Completato" con data e hash del
  commit, e aggiungi la voce in `CHANGELOG.md`.
- Attività fuori dal codice (Vercel, Google, ecc.) sono marcate **[manuale]**.

## In corso

- **P2 [manuale]** Verificare su iPhone Safari l’intro con “Riduci movimento” attivo: ora anche
  testi e filtri entrano a fine intro (non ancora in produzione). Playwright con preferenza attiva
  superato.

## Da fare

### GitHub

- **P3** README del profilo GitHub (repo `antoniosalvatorecalo/antoniosalvatorecalo`) con link al
  sito, servizi e città. "Available for hire" (opzionale) richiede `gh auth refresh -s user`.

### SEO e visibilità

- **P1 [manuale]** Profilo dell'Attività su Google: video di verifica inviato il 2026-10-31, esito
  atteso entro ~2026-11-05. Dopo la verifica: orari, 3–5 recensioni.
- **P2** Pagine "Servizi" e "Chi sono" con testi orientati ai clienti.
- **P2** Nuovi casi studio (obiettivo 5–6), con `seo.title`, `seo.description` e `alt` nel CMS.
- **P3** Articoli per clienti locali (costi, tipologie di sito, come scegliere un designer).

### Tecnico

- **P1 [manuale]** Verificare/acquistare la licenza di TT Interphases Pro (in uso la versione _Trial_).
- **P2** `npm run budget:check` risultava oltre soglia: misurare e aggiornare budget o bundle.
- **P3** `ContactFormExperience` importato sia staticamente sia dinamicamente (avviso di build).
- **P3** Pulire regole duplicate e blocchi media vuoti in `src/index.css`.
- **P2** Errore React #418 (idratazione) su `/contact` e sulle pagine progetto, presente già prima
  della nuova intro: l'HTML prerenderizzato non coincide con il primo render nel browser.
  `verify:preloader` lo ignora solo sulla pagina interna.
- **P3** `verify:cms` cerca su Bugonia un testo che nel CMS non c'è più ("Cinema ticketing is
  often marginal…"): aggiornare l'asserzione al contenuto attuale.

## Completato

- 2026-11-07 — Intro della Home attiva anche con “Riduci movimento” attivo; commit `50c8522`,
  deploy Vercel riuscito e smoke test Chromium mobile superato.
- 2026-11-07 — Anteprime hover: video 3:2 a tutto riquadro e riga sotto il nome rimossa
  (CHANGELOG). Audit: non 16:9 i video Bugonia "Home-Mobile" e "Booking-Form"; le foto Newsquest
  (3:2) restano intere con le bande verdi dei bordi (nere solo su origini fuori dal CORS Sanity).
  In produzione dal 2026-11-07 (`2682e05`, deploy Vercel riuscito, CSS live verificato).
- 2026-11-07 — Nuova intro della home (pila di foto, contatore, placement nella griglia) al posto
  del preloader, con campo CMS `introOrder` (CHANGELOG). Valori scritti nel dataset production:
  Newsquest "Visual 3", "Visual 2", "Visual 1", poi Bugonia "Quote", "Shop-Mobile", "Home-Mobile",
  "Home Scroll", "Cover" (1–8).
- 2026-11-05 — Audit SEO del codice: JSON-LD localizzato, alt delle immagini OG, fallback
  immagine, title/description, `lastmod` reale, pagina 404 `noindex`, `trailingSlash` (CHANGELOG).

- 2026-11-05 — Vercel Web Analytics attivato nel pannello (piano Hobby, storico 30 giorni): prima
  le visite non venivano registrate. Speed Insights già attivo (RES 89).
- 2026-11-05 — Search Console: Controllo URL con esito "indicizzata" per tutte le 8 pagine
  (EN e IT: home, contatti, Bugonia, Newsquest); sitemap letta il 2026-11-04 con 8 URL.
  Il report Pagine (fermo al 2026-10-23) mostra ancora `www` come canonico: si aggiornerà da solo.

- 2026-10-31 — Versione italiana prerenderizzata su `/it` con `hreflang`, `lang="it"` e sitemap
  bilingue.
- 2026-10-31 — Google Business: proprietà di "L' Essenza" (cliente) trasferita a Simona Neagu,
  rimosso l'accesso dall'account personale.
- 2026-10-31 — Sanity CORS: aggiunto `http://localhost:4173` (`localhost:3000` era già presente).
- 2026-10-31 — GitHub: location del profilo impostata su "Benevento, Italy".
- 2026-10-31 — Anteprime hover: assets interi e centrati, sfondo adattato ai bordi della foto.
- 2026-10-31 — Anteprime in hover 16:9: niente tagli ai lati, assets verticali interi e centrati.
- 2026-10-31 — Link dei progetti su mobile senza a capo (es. "Discover the process").
- 2026-10-31 — Anteprime in hover della gallery uniformate (stesso riquadro per tutte le foto).
- 2026-10-31 — Header mobile: switch lingua allineato; link d'azione mobile uniformati
  su tutte le pagine (home, contatti, Bugonia, Newsquest).
- 2026-10-29 — Bing Webmaster Tools: sito importato da Search Console, sitemap inviata.
- 2026-10-29 — SEO title/description di `siteSettings` aggiornati in Sanity (EN e IT) e online.
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
