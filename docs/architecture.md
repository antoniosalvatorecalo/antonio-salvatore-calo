# Architecture

## Application bootstrap

`src/main.tsx` initializes GSAP once, mounts React in strict mode and wraps the application router with `MotionPreferenceProvider`.

```text
MotionPreferenceProvider
└─ BrowserRouter + NavHoverProvider
   └─ LanguageProvider + ProjectCatalogProvider
      ├─ ProjectCatalogGate
      │  └─ ProjectTransitionProvider
      │     └─ PortfolioLayout
      │        ├─ SiteHeader
      │        └─ PortfolioScene
      └─ ContactPage
```

`ProjectCatalogGate` waits for the Sanity-backed catalog containing Bugonia and Newsquest.

The sibling `../studio-antonio-salvatore-calo/` application edits the existing `dw4juo8a/production` Content Lake. The Vite frontend queries Content Lake directly through `src/cms/`; the Studio is not a frontend runtime dependency.

## Router and persistent layout

`AppRouter` defines `/`, `/projects/:slug` and `/contact`. The index and project routes share `PortfolioLayout`; their route elements are intentionally empty because `PortfolioScene` renders both visual states. `ContactPage` is lazy-loaded outside that persistent layout.

`PortfolioScene` keeps two planes mounted in one scene:

- the index plane contains `ProjectIndex` and its media grid;
- the project plane contains `SingleProjectView` for the current visible project.

Keeping both planes in the same layout preserves geometry and visual continuity during navigation.

## Transition lifecycle

`ProjectTransitionProvider` is the authority for four phases:

| Phase | State |
|---|---|
| `idle` | Index is visible and interactive. |
| `opening` | Selected index media drives the 3D transition. |
| `project` | Project plane is canonical and the project URL is committed. |
| `closing` | Project plane returns to the retained index origin. |

The provider tracks one internal slug and exposes it through two roles:

- `selectedSlug` identifies the project selected for the transition;
- `visibleSlug` keeps that project rendered through opening, project and closing;
- `routeSlug` is derived from `/projects/:slug` by `getRouteSlug()` and accepted only when the catalog contains the project.

Opening begins before navigation is committed. At the visual endpoint, the provider navigates to `/projects/:slug` and stores the selected media in router state. Closing restores scroll and focus, then uses browser history when the current entry belongs to the opened project. Browser Back and Forward remain authoritative, including during an active closing timeline.

```ts
type ProjectTransitionRequest = {
  slug: string;
  mediaKey: string;
  imageSrc: string;
  sourceElement: HTMLElement;
};
```

The request preserves the selected media identity and source element so geometry, scroll position and keyboard focus can be restored accurately. Missing or slow project media falls back to its placeholder without bypassing the opening lifecycle.

## Animation responsibilities

GSAP owns scene geometry, 3D open/close timelines and ScrollTrigger-backed entrances. Registration is centralized in `src/lib/gsap-setup.ts`; transition work is scoped with `gsap.context()` and reverted on cleanup.

Motion owns component-level presence and interaction animation, including contact UI and text interactions. It does not control the scene transition.

`MotionPreferenceProvider` reflects the operating-system preference in Motion and `data-motion`. When reduced motion is enabled, the provider settles directly to the canonical index or project endpoint while preserving routing, state and focus behavior.

## Contact route

`/contact` renders `ContactPage` and `ContactBuilder`. Submissions post to `/api/contact`, where the Vercel function validates input and either sends through configured SMTP or returns a `mailto:` fallback.
