# Antonio Salvatore Calò — Portfolio

[![CI](https://github.com/antoniosalvatorecalo/antonio-salvatore-calo/actions/workflows/ci.yml/badge.svg)](https://github.com/antoniosalvatorecalo/antonio-salvatore-calo/actions/workflows/ci.yml)

Portfolio interattivo di un Digital Designer & Frontend Developer di Benevento.
Sito: <https://antoniosalvatorecalo.com>

**Stack:** React 19 · Vite · TypeScript · Tailwind v4 · GSAP/Motion · Sanity CMS · Vercel.

## Avvio rapido

```bash
npm install        # installa anche gli hook git (commit in italiano)
npm run dev        # http://localhost:3000
npm run build      # build + prerender di tutte le pagine
```

Prima di ogni commit: `npm run typecheck && npm run lint && npm run build`.

## Come è organizzato il repository

```text
src/            codice dell'app (vedi mappa in AGENTS.md)
api/            funzioni serverless Vercel (form contatti)
public/         file statici (font, favicon, CV e portfolio PDF)
scripts/        prerender, verifiche (verify/), hook git (git-hooks/), utilità git (git/)
docs/           documentazione tematica (sotto)
.githooks/      hook git versionati (attivati da npm install)
.github/        CI, template di issue e PR, Dependabot
AGENTS.md       regole e mappa per agenti AI — utile anche a chi sviluppa
CHANGELOG.md    cosa è cambiato, per data
BACKLOG.md      attività da fare, in corso e completate
```

## Documentazione

| Documento                                                | Argomento                                   |
| -------------------------------------------------------- | ------------------------------------------- |
| [AGENTS.md](AGENTS.md)                                   | Mappa del codice, regole, quale doc leggere |
| [docs/architettura.md](docs/architettura.md)             | Flusso dati, route, transizioni             |
| [docs/cms.md](docs/cms.md)                               | Sanity: modello contenuti e workflow        |
| [docs/design-system.md](docs/design-system.md)           | Token, layout, componenti, motion           |
| [docs/convenzioni-codice.md](docs/convenzioni-codice.md) | Stile di codice React/TS/CSS                |
| [docs/sviluppo.md](docs/sviluppo.md)                     | Setup, comandi, verifiche, rilascio         |
| [docs/seo.md](docs/seo.md)                               | Meta, sitemap, dati strutturati, dominio    |
| [docs/git-e-commit.md](docs/git-e-commit.md)             | Regole commit e come annullare modifiche    |

Lo Studio Sanity (schemi e TypeGen) è nel repository gemello `../studio-antonio-salvatore-calo/`.
