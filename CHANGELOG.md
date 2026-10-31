# Changelog

Tutte le modifiche rilevanti del sito, dalla più recente. Formato ispirato a
[Keep a Changelog](https://keepachangelog.com/it/1.1.0/). Ogni voce nasce nello stesso commit della
modifica, sotto "Non rilasciato"; al deploy la sezione prende la data.

Categorie: **Aggiunto**, **Modificato**, **Corretto**, **Rimosso**, **SEO**, **Documentazione**.

## [Non rilasciato]

### Corretto

- Anteprima in hover più larga (16:9, 320 px), il formato della maggior parte degli assets: le foto
  orizzontali non vengono più tagliate ai lati; quelle quadrate o verticali (es. Bugonia menu) si
  vedono intere e centrate su fondo scuro.
- Link dei progetti su mobile (es. "Discover the process"): ogni link resta su una riga; se non
  c'è spazio scende intero alla riga successiva.
- Anteprima in hover della gallery: tutte le foto e i video usano lo stesso riquadro delle
  miniature (61:40, 280 px), quindi le immagini verticali (es. Bugonia shop) non coprono più la
  gallery. Rimosse le eccezioni dedicate a singole immagini di Bugonia.
- Header mobile (home e progetto): `[ EN ]` resta sempre sulla stessa riga di Email me,
  Download CV e Download Portfolio, con stessa dimensione, peso e colore; il testo scala con la
  larghezza dello schermo (verificato da 320 a 394 px, EN e IT).
- Link d'azione mobile uniformati su tutto il sito (home, contatti, Bugonia, Newsquest): `< Back`
  e i link dei progetti (es. "View prototype") hanno ora stessa dimensione, peso e spaziatura dei
  link dell'header.

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

- Il selettore lingua dell'header è un unico componente `LanguageSwitch` (prima tre copie).
- Fine riga LF imposte da `.gitattributes`; Prettier applicato a tutto il repository.
- Le verifiche Playwright usano un helper comune (`scripts/verify/lib/browser.mjs`) per avviare
  il browser e salvare gli output in `.artifacts/test-results/`.
- Script di verifica spostati in `scripts/verify/`; `verify:task2`/`verify:task3` diventano
  `verify:cms`; aggiunto `verify:project-media`.
- Hook git versionati in `.githooks/` e attivati da `npm install`.
- Artefatti di test spostati da `stages/04_testing/` a `.artifacts/` (ignorata da git).

### Aggiunto

- Vercel Web Analytics (senza cookie) e Speed Insights per misurare visite e Core Web Vitals reali.
- CI GitHub Actions: typecheck, lint, formato, build e controllo dei messaggi di commit.
- Template di issue (bug, attività) e di pull request in italiano; Dependabot mensile.

### Rimosso

- Componenti mai utilizzati `CountUp` e `ProjectTransitionPreview`, la funzione duplicata
  `api/sitemap.ts` e la verifica `gallery-entrance`, che controllava proprio quel componente.
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
