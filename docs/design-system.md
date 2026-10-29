# Design system

> **Leggi quando:** tocchi stili, layout, componenti visivi o animazioni.
> Descrive l'implementazione attuale: la fonte di verità è `src/` (soprattutto `src/index.css`).

## Direzione visiva

Portfolio editoriale guidato dalla tipografia: palette monocromatica, media in primo piano,
geometrie quadrate, etichette compatte, transizioni cinematografiche. Superficie primaria bianca
con superfici inverse scure; **non esiste** un tema dark CSS separato.

## Fondamenta

### Colori (`src/index.css`)

| Token                  | Valore                  | Uso                         |
| ---------------------- | ----------------------- | --------------------------- |
| `--bg-primary`         | `#FFFFFF`               | superficie pagina           |
| `--bg-secondary`       | `#F0F0F0`               | superfici secondarie/attive |
| `--bg-tertiary`        | `#E8E8E8`               | superficie terziaria        |
| `--bg-inverse`         | `#141414`               | superficie scura            |
| `--bg-inverse-subtle`  | `#1F1F1F`               | superficie scura attenuata  |
| `--text-primary`       | `#0A0A0A`               | testo principale            |
| `--text-secondary`     | `#3D3D3D`               | testo secondario            |
| `--text-muted`         | `#6B6B6B`               | etichette                   |
| `--text-inverse`       | `#F5F5F5`               | testo su scuro              |
| `--text-inverse-muted` | `#A0A0A0`               | testo attenuato su scuro    |
| `--cta-color`          | `#0A0A0A`               | link CTA                    |
| `--border-subtle`      | `#E2E2E2`               | separatori                  |
| `--border-default`     | `#C8C8C8`               | bordi                       |
| `--border-strong`      | `#0A0A0A`               | bordi attivi/focus          |
| `--border-inverse`     | `rgba(245,245,245,0.1)` | separatori su scuro         |

Altri valori: `.plain-overlay` `rgba(0,0,0,0.6)`; outline di focus `rgba(10,10,10,0.55)`.

### Tipografia

- Famiglia: **TT Interphases Pro** (WOFF2 locali in `public/fonts/`, pesi 300–900), fallback
  `ui-sans-serif, system-ui, sans-serif`. ⚠️ I file sono la versione _Trial_: verificare la licenza.
- Scala fluida: `--text-display-xl`, `--text-display`, `--text-h1` … `--text-h6` (valori `clamp()`
  in `index.css`). Testo fisso: base `1rem`, small `.813rem`, extra-small `.688rem`.
- Etichette UI: `.7rem`, peso 500, tracking `.12em`, colore muted. Valori UI: `.8125rem`, line-height 1.4.

### Spaziature, forme, livelli

- Spaziatura base: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128px` (`--space-1` … `--space-32`).
- Sezioni fluide: `--section-xs` … `--section-lg`. Padding pagina con `clamp()`.
- Raggi: quadrato di default (`0`), `2px`, `4px`, pill `9999px`; `50%` per controlli circolari.
- z-index: dropdown 20, shell progetto 60, navigazione 100, skip link 999.

## Responsive

| Breakpoint   | Comportamento                                                        |
| ------------ | -------------------------------------------------------------------- |
| `< 768px`    | Colonna singola, navigazione mobile, swipe; overflow pagina nascosto |
| `768–1023px` | Tablet: resta a colonna singola, spaziature intermedie               |
| `≥ 1024px`   | Layout desktop a due colonne                                         |
| `≥ 1280px`   | Header e gap più ampi                                                |

Altezza header: 96px mobile, 110px a 768, 130px a 1024, 140px a 1280.
Gallery: griglia a 16 colonne desktop, 10 su tablet/mobile; gap 8px desktop, 4px mobile.
Dettagli progetto: orizzontali su desktop, accordion verticale a `≤ 767px`.

## Componenti principali

- **Guscio:** `PortfolioLayout`, `SiteHeader`, `AppRouter`. Header con varianti info, progetto,
  navigazione, lingua, CTA, contatti, mobile; chip interattivi min 44px; focus visibile.
- **Home:** `ProjectIndex`, `ProjectGrid`, `FilterBar`, `PortfolioScene` (variabili
  `--scene-angle`, `--scene-depth`). Immagini Sanity e video Vimeo.
- **Progetto:** `SingleProjectView`, `ProjectPreviewCarousel`, `ProjectDetailsGrid`, `ProjectAbout`,
  `PreviewMediaAsset`, lightbox. I video hanno sempre un poster di fallback.
- **Contatti:** `ContactPage`, `ContactFormExperience`, `AnimatedContactPanel`: form a frase
  progressiva con contatore di step.
- **Interazioni:** sottolineature, opacità, rotazione frecce, piccole traslazioni; niente ombre o
  effetti decorativi pesanti. Focus: outline 2px con offset 2px.

## Motion

- GSAP registra `ScrollTrigger` una sola volta (`src/lib/gsap-setup.ts`).
- La scena ruota da `0deg` (Home) a `-90deg` (Progetto), `power2.inOut`, 1,8 s per 90°.
- GSAP per la geometria della scena; `motion/react` per la presenza dei componenti; CSS per
  micro-animazioni (blink cursore 1 s, reveal gallery 620 ms con stagger).
- `prefers-reduced-motion` e `html[data-motion="reduced"]` riducono le animazioni a `0.01ms`:
  route, focus e stato finale devono restare identici.

## Da fare / da evitare

**Sì:** riusa le variabili CSS e i breakpoint esistenti; mantieni geometria dell'header e angolo
della scena; media protagonisti, controlli minimali; focus e reduced motion sempre funzionanti.

**No:** colori, font, ombre, gradienti o raggi non presenti nei token; dare per scontato un dark
mode; trasformare il tablet in layout desktop; togliere i poster Vimeo o il blocco input durante
le transizioni; introdurre Lenis (non è usato).

## Note di audit

`src/index.css` contiene regole ripetute di compatibilità e blocchi media vuoti (tablet e reduced
motion) accanto alle regole globali attive: vanno trattati come fatti di implementazione finché
non vengono puliti di proposito (vedi `BACKLOG.md`).
