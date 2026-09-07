# Antonio Salvatore Calò — Portfolio

An interactive portfolio built with React and TypeScript around a persistent scene. The project index and detail view are connected by a continuous 3D transition, with project content supplied by Sanity.

**Live website:** production URL pending.

## Visual preview

A repository-level preview is not yet available. The intended asset is `docs/assets/portfolio-preview.webp` at approximately 1600×900; a second short clip may document the Index → Project transition.

## Highlights

- Persistent routing architecture shared by index and project routes
- Continuous 3D Index → Project → Index transition
- Typed `ProjectMedia` contract for CMS content
- Bugonia and Newsquest sourced exclusively from Sanity
- Reduced-motion support, keyboard interaction and focus restoration
- Vercel contact endpoint with SMTP delivery and `mailto:` fallback

## Tech Stack

React 19 · TypeScript · Vite · React Router · GSAP · Motion · Sanity · Tailwind CSS · Vercel Functions

## Architecture

```text
main
└─ MotionPreferenceProvider
   └─ Router + Language + ProjectCatalog
      ├─ ProjectTransitionProvider
      │  └─ PortfolioLayout
      │     ├─ SiteHeader
      │     └─ PortfolioScene
      │        ├─ ProjectIndex
      │        └─ SingleProjectView
      └─ ContactPage
         └─ /api/contact
```

The portfolio layout stays mounted while route state and scene state move between index and project views. See [Architecture](docs/architecture.md).

## Project Data & CMS

```text
Bugonia   → Sanity
Newsquest → Sanity
```

Both sources are normalized into the same project domain model before rendering. See [CMS](docs/cms.md).

## Routes

| Route | Purpose |
|---|---|
| `/` | Interactive project index |
| `/projects/:slug` | Persistent project view |
| `/contact` | Contact builder |
| `/api/contact` | Server-side contact endpoint |

## Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

The standalone sibling Sanity Studio and TypeGen commands are listed in [Development](docs/development.md).

## Project Structure

```text
api/          contact function
docs/         technical reference
public/       fonts and project media
src/
├─ cms/       client, GROQ, generated types and normalization
├─ components/
├─ content/   frontend presentation metadata
├─ motion/    scene transition choreography
├─ providers/ application and transition state
└─ main.tsx   application bootstrap
```

## Performance & Accessibility

Media dimensions reserve layout space; non-priority images use lazy loading and asynchronous decoding. Transition input is locked while the scene is moving, project media readiness is bounded, and reduced-motion users receive canonical scene endpoints without the 3D timeline. Semantic controls, visible focus and focus restoration support keyboard navigation.

## Status

The frontend, project catalog, standalone sibling Studio and contact endpoint are active. A production URL, social preview and repository license policy remain to be defined.
