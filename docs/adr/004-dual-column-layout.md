# ADR-004: Dual-Column Layout Architecture

**Status**: Accepted | **Date**: 2026-06-03 | **Owner**: Engineering

## Context

Portfolio need two distinct regions: personal branding (About) and project showcase (Work). Traditional single-column scroll forces linear prioritization. Dual-column allows simultaneous browsing — scan About while reading Work.

## Decision

Two primary layouts, both dual-column:

### PortfolioLayout (Home — `/`)
| Column | Width | Content | Scroll |
|--------|-------|---------|--------|
| Left | 30% | AboutHero, Bio, Principles, Services, Contact | Lenis |
| Right | 70% | ProjectCards (staggered) | Lenis |

### ProjectBrutalistLayout (Project — `/projects/:id`)
| Column | Width | Content | Scroll |
|--------|-------|---------|--------|
| Left | 20% | Hero text, ScrollingProjectText, metadata | GSAP-synced (not scrollable) |
| Right | 80% | Media stacks, section content | Lenis (desktop) / native (mobile) |

**Desktop**: Both columns visible simultaneously. Left column navigation frames right column content.

**Mobile/tablet (<1024px)**: Tab-switching — one column visible at a time. `activeTab` state toggles which column renders.

**Disabled hover resize**: Infrastructure for left-column expand (20%→45% on hover) exists but commented out. z-index management preserved for re-enablement.

## Tradeoffs

| Pro | Con |
|-----|-----|
| Parallel content browsing — scan identity + portfolio simultaneously | Complex responsive behavior — tab switching on mobile |
| Left column frames context for right column content | Must refresh both Lenis instances after content changes |
| Independent scroll per column = faster navigation | Column hover resize disabled but infrastructure kept |
| Clean 30/70 and 20/80 splits | `ScrollerContext` needed to share refs between parent and children |

## Consequences

1. `PortfolioLayout` renders both columns always (desktop) or one at a time (mobile)
2. `ProjectBrutalistLayout` renders completely different DOM per breakpoint — mobile uses `ProjectSection` vertical list
3. `ScrollerContext` passes right-column ref + Lenis to children (ScrollingProjectText, ProjectSection, CentralNavMenu)
4. Left-column mouse wheel forwarded to right Lenis via `handleSidebarWheel`
5. Mobile tab switch triggers `refreshAllLenises()` + `ScrollTrigger.refresh()`
6. Left column: light theme, right column: dark theme — visual separation
