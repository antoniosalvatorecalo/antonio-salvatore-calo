# Sviluppo, verifiche e rilascio

> **Leggi quando:** prepari l'ambiente, lanci verifiche o prepari un rilascio.

## Setup

```bash
npm install                              # dipendenze + hook git (.githooks/)
cd ../studio-antonio-salvatore-calo && npm install   # solo se lavori sullo Studio
```

Se gli hook non risultano attivi: `npm run hooks:install`.

Variabili d'ambiente: copia `.env.example` in `.env.local` **solo** per provare l'invio email del
form (`CONTACT_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). Senza SMTP,
`/api/contact` risponde con un fallback `mailto:`.

## Comandi

| Comando                     | Cosa fa                                                         |
| --------------------------- | --------------------------------------------------------------- |
| `npm run dev`               | Server Vite su `http://localhost:3000`                          |
| `npm run build`             | Build client + SSR + prerender (richiede accesso a Sanity)      |
| `npm run preview`           | Serve la build locale                                           |
| `npm run typecheck`         | TypeScript senza emettere file                                  |
| `npm run lint`              | ESLint (zero warning ammessi)                                   |
| `npm run format`            | Prettier su tutto il repo                                       |
| `npm run check`             | typecheck + lint + format + build + budget                      |
| `npm run budget:check`      | Confronta il peso JS/CSS iniziale con `performance-budget.json` |
| `npm run hooks:check`       | Cerca file vietati nell'albero di lavoro                        |
| `npm run annulla -- <hash>` | Annulla un commit (vedi `docs/git-e-commit.md`)                 |

## Verifiche (`scripts/verify/`)

| Comando                             | Controlla                                                 | Richiede                       |
| ----------------------------------- | --------------------------------------------------------- | ------------------------------ |
| `npm run verify:prerender`          | HTML prerenderizzato, sitemap, idratazione                | build + `preview` + Playwright |
| `npm run verify:agentic`            | `llms.txt` e `.md` dei progetti                           | build                          |
| `npm run verify:preloader`          | Intro/preloader                                           | build + `preview` + Playwright |
| `npm run verify:project-transition` | Transizione Home ↔ Progetto (screenshot in `.artifacts/`) | dev server + Playwright        |
| `npm run verify:project-media`      | Gallery e filtri della pagina progetto                    | dev server + Playwright        |
| `npm run verify:cms`                | Catalogo e label dei media da Sanity                      | dev server + rete              |

`dev` = `npm run dev` (porta 3000), `preview` = `npm run preview` (porta 4173, su `localhost`). Un altro indirizzo
si passa con `TEST_BASE_URL`. Browser Playwright mancanti: `npx playwright install chromium`.
Gli output (screenshot, report) vanno in `.artifacts/test-results/<verifica>/`, ignorata da git.
Avvio del browser e cartelle di output sono centralizzati in `scripts/verify/lib/browser.mjs`:
usa la variabile `PLAYWRIGHT_EXECUTABLE_PATH` per forzare un browser specifico.

Le verifiche che caricano la build in `preview` interrogano Sanity dal browser: l'origine
`http://localhost:4173` deve essere tra le CORS origins del progetto Sanity, altrimenti falliscono
solo per gli errori CORS in console.

## Performance

Obiettivi in produzione: LCP < 2,5 s, CLS < 0,1, INP < 200 ms (misurati sul sito pubblicato, non
in locale). Le immagini Sanity usano `auto=format`, larghezze responsive e placeholder LQIP; i
media fuori schermo sono lazy; gli iframe Vimeo esistono solo per il media attivo, con poster.

## Checklist di rilascio

- [ ] `npm run check` verde (o eccezioni note scritte nel commit).
- [ ] Verifiche browser pertinenti; controllo desktop, tablet, mobile; Back/Forward; EN/IT;
      tastiera; reduced motion.
- [ ] Se cambiano schemi: typecheck, schema:extract, typegen e build dello Studio.
- [ ] Nuovi progetti: metadati, sitemap, `alt` delle immagini.
- [ ] `CHANGELOG.md` aggiornato. Nessun segreto nei file; nessuna mutazione del CMS.
- [ ] Deploy solo su autorizzazione esplicita.
