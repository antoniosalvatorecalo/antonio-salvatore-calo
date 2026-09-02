# Documentation Index

> Central entry point for all project documentation.
> Owner: Antonio Salvatore (Salvo) — Web & UI Designer

---

## 📋 Navigation

| Area | Path | Owner | Description |
|------|------|-------|-------------|
| **Product** | [`docs/product/`](./product/) | Product | Vision, purpose, brand, users, design principles |
| **Design** | [`docs/design/`](./design/) | Design | Design system, color tokens, typography, components |
| **Engineering** | [`docs/engineering/`](./engineering/) | Engineering | Architecture, routing, layouts, animation, scrolling, state, navigation, theming, content, responsive, performance, deployment, agent orchestration |
| **Onboarding** | [`docs/onboarding/`](./onboarding/) | All | Setup guide, coding standards, naming conventions, commit rules, PR workflow, deployment, quality gates |
| **QA** | [`docs/qa/`](./qa/) | Testing | Testing strategy, tools, workflows, validation |
| **Agents** | [`docs/AGENTS.md`](./AGENTS.md) | All | Entry point for AI agents — commands, critical rules, impact-check protocol |
| **README** | [`README.md`](../README.md) | All | Project overview, architecture philosophy, technology stack |

---

## Ownership Map

| Discipline | Maintainer | Review Cadence |
|------------|-----------|----------------|
| Product docs | Product team | Per milestone |
| Design docs | Design team | Per design system change |
| Engineering docs | Engineering team | Per architecture change |
| QA docs | Testing team | Per test suite update |
| Onboarding docs | Engineering team | Per workflow/setup change |
| docs/AGENTS.md | All teams | Per workflow change |

---

## Cross-Links

- Product principles influence **Design** token decisions → see [`docs/design/`](./design/)
- Design components are implemented per **Engineering** rules → see [`docs/engineering/rules.md`](./engineering/rules.md)
- Engineering architecture must satisfy **Product** requirements → see [`docs/product/`](./product/)
- **QA** validates against all three → see [`docs/qa/`](./qa/)
- AI agents start at [`docs/AGENTS.md`](./AGENTS.md) before consulting any `/docs/` area

---

## File Conventions

- **INDEX.md** files are entry points to their section — read these first
- **README.md** files contain the primary content for each discipline
- Cross-links use relative paths from the referencing file's location
- Code references (e.g. `src/...`) remain absolute from project root
