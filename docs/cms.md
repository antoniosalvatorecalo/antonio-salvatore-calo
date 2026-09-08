# CMS workflow

Both the frontend and the sibling `../studio-antonio-salvatore-calo/` project are Sanity-backed. The Studio owns schemas; the frontend owns GROQ queries and consumes generated types.

Public frontend reads use the Sanity CDN. New content can appear in the gallery, filters, navigation, routes, sitemap, and SEO without frontend changes when its project document is valid.

After schema or GROQ changes, from the Studio run:

```bash
npm run typecheck
npm run schema:extract
npm run typegen
npm run build
```

Never hand-edit `src/cms/sanity.types.ts`. Import scripts and any publication action mutate remote content; they are not validation commands.
