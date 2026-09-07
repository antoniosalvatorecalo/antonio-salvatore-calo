# CMS

## Content ownership

```text
Bugonia   → Sanity source of truth
Newsquest → Sanity source of truth
```

Bugonia and Newsquest are fetched exclusively from Sanity and have no local runtime fallback. Existing production documents must not be reimported, duplicated, modified or deleted during Studio maintenance.

## Data flow

1. `src/cms/client.ts` creates the public Sanity client with API-CDN caching disabled.
2. `src/cms/queries.ts` defines the GROQ query for all project documents.
3. `src/cms/sanity.types.ts` supplies generated schema and query types.
4. `src/cms/normalize.ts` converts Sanity data into `ProjectDomain` records.
5. `ProjectCatalogProvider` exposes the normalized catalog and lookup state to the router and UI.

The shared `ProjectMedia` model carries a stable key, `image` or `vimeo` type, source, accessible label and alt text, optional dimensions, and an optional thumbnail source. Sanity image references are resolved during normalization.

## Studio, schemas and TypeGen

The sibling `../studio-antonio-salvatore-calo/` application owns Studio configuration, schemas and controlled import tooling. The Vite frontend queries Content Lake directly and does not depend on the Studio at runtime.

TypeGen is owned by the standalone Studio. It extracts `schema.json`, reads queries under `../antonio-salvatore-calo/src/cms/`, and regenerates the single authoritative frontend `src/cms/sanity.types.ts`.

```bash
cd ../studio-antonio-salvatore-calo
npm run typecheck
npm run schema:extract
npm run typegen
npm run build
```

The `import:bugonia` and `import:newsquest` commands write remote content and are never validation commands.

## Configuration and environment

The current public read client uses versioned constants in `src/cms/client.ts`:

- project ID: `dw4juo8a`
- dataset: `production`
- API version: `2026-09-06`

No frontend environment variable is currently required for Sanity reads. Studio and the controlled import use the authenticated Sanity CLI session; no token belongs in the repository or in a client-exposed `VITE_` variable.

## Media risk

Vimeo thumbnails currently fall back to `vumbnail.com`. This is a temporary external dependency; a Sanity-managed poster or Vimeo oEmbed/API should replace it before that service becomes production-critical.
