# Agent constraints

- Preserve the persistent `PortfolioLayout`, shared `PortfolioScene`, transition phases, delayed URL commit, history, focus restoration, keyboard access, and reduced-motion behavior.
- Both current projects are Sanity-backed: frontend is this repository; Studio is sibling `../studio-antonio-salvatore-calo/`. The Studio is not `sanity/` inside this repository.
- Keep GROQ/schema/TypeGen aligned. Never hand-edit generated types or run import/reset commands as validation.
- Do not introduce project-specific frontend conditions. Catalog ordering, visibility, filters, and routes derive from CMS fields.
- Do not delete assets until source, CMS, metadata, download, and runtime references have been checked. Do not deploy without explicit authorization.
