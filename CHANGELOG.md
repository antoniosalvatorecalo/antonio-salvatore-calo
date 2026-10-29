# Changelog

Tutte le modifiche rilevanti del sito, dalla più recente. Formato ispirato a
[Keep a Changelog](https://keepachangelog.com/it/1.1.0/). Ogni voce nasce nello stesso commit della
modifica, sotto "Non rilasciato"; al deploy la sezione prende la data.

Categorie: **Aggiunto**, **Modificato**, **Corretto**, **Rimosso**, **SEO**, **Documentazione**.

## [Non rilasciato]

### SEO

- H1 invisibile (`sr-only`) in Home e Contatti, con versione italiana.
- Dati strutturati: `Person` con professione, competenze, città e email; nuovo
  `ProfessionalService` con area servita Benevento, Campania, Italia.
- Title e description dedicati per la pagina Contatti.

### Documentazione

- Documentazione riscritta in italiano: `AGENTS.md` (mappa per agenti AI e sviluppatori),
  `CLAUDE.md`, `README.md` e `docs/` per argomento. Aggiunti `CHANGELOG.md` e `BACKLOG.md`.
- Regole di commit in italiano verificate dall'hook `commit-msg`; comando `npm run annulla`
  per annullare commit senza riscrivere la storia.

### Modificato

- Script di verifica spostati in `scripts/verify/`; `verify:task2`/`verify:task3` diventano
  `verify:cms`; aggiunti `verify:project-media` e `verify:gallery-entrance`.
- Hook git versionati in `.githooks/` e attivati da `npm install`.
- Artefatti di test spostati da `stages/04_testing/` a `.artifacts/` (ignorata da git).

### Rimosso

- Cartella locale `.kilo/`, `tasks/` (piano archiviato in `docs/archivio/`), installer hook
  duplicati (`install.sh`, `install.ps1`, `pre-commit` shell).

## 2026-10-27

- **Corretto:** visibilità dell'header su iOS e transizioni delle pagine progetto su mobile.
- **Modificato:** CV scaricabile aggiornato.

## 2026-10-21

- **Corretto:** scroll della gallery progetto su mobile; layout e transizioni della gallery
  stabilizzati (nessun flash del testo durante l'apertura del progetto).
- **Aggiunto:** coreografia condivisa dei filtri Home/Progetto (`FilterDisclosureOptions`).

## 2026-09-23

- **Aggiunto:** intro/preloader con percentuale; entrata sequenziale della gallery.
- **Modificato:** transizioni del portfolio e gallery dei progetti rifinite.

## 2026-09-12

- **SEO:** dominio personalizzato impostato come origine canonica; redirect dal dominio Vercel.
- **Aggiunto:** form contatti localizzato EN/IT; navigazione desktop localizzata.
- **Corretto:** contenuto prerenderizzato preservato se il CMS non risponde; dimensioni dei CTA
  mobile; impaginazione del form contatti.

## 2026-09-11

- **Aggiunto:** UX del form di richiesta progetto migliorata.
- **Corretto:** dettagli progetto su mobile, gallery responsive, favicon.

## 2026-09-07 – 2026-09-09

- **SEO:** metadati di indicizzazione per la produzione (prerender, sitemap, JSON-LD).
- **Corretto:** lightbox della gallery, anteprime Vimeo, snapping della gallery mobile.
- **Modificato:** architettura del form contatti (popover, layout compatto).

## 2026-09-02 – 2026-09-05

- **Aggiunto:** prima versione del portfolio (React + Sanity) e deploy su Vercel.
- **Modificato:** navigazione responsive, localizzazione, pulizia e refactor del codice.
