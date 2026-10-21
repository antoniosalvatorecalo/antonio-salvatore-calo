# Piano operativo: eliminare il flash nell’apertura dei progetti

## Causa verificata prima della patch

In `opening`, `visibleSlug` è già valorizzato: `PortfolioScene` monta il piano Project e `PortfolioLayout` passa `projectActive=true` a `SiteHeader`. L’header renderizza titolo, dettagli e `ProjectDetailsGrid`; il relativo `useLayoutEffect` include questi target e li anima in uscita. La timeline GSAP applica clip e opacità al primo tick, quindi il testo nasce visibile prima che il tween lo nasconda. A `project`, lo stesso target viene inizializzato nuovamente per l’entrata. È confermato il ciclo visibile → nascosto → visibile.

Il piano Project ha contenuti separati: `.project-media-gallery-header` è già `visibility:hidden` durante `opening`; le immagini della gallery restano coperte e si rivelano tramite `--scene-progress`. Il flash misurato appartiene all’header Project: nei campioni finali di `opening` il suo heading era ormai clip-path-hidden con opacità 0.72.

## Baseline geometrica (server Vite locale, prima della patch)

Misure raccolte su Bugonia e Newsquest a 1440×900 e 390×844. La riga `opening → project` confronta l’ultimo frame osservato in `opening` con il primo frame di `project`; coordinate viewport arrotondate al centesimo.

| Viewport / progetto | Header / var   | Ultimo opening: angolo, progress; top viewport / card | Primo project: top viewport / card | Delta top viewport / card |
| ------------------- | -------------- | ----------------------------------------------------- | ---------------------------------- | ------------------------- |
| 1440×900 Bugonia    | 264.83 / 269px | -89.9792°, .999769; 375.10 / 375.14                   | 375.61 / 375.61                    | +0.51 / +0.47px           |
| 1440×900 Newsquest  | 287.77 / 292px | -89.9752°, .999725; 375.00 / 375.04                   | 375.61 / 375.61                    | +0.61 / +0.57px           |
| 390×844 Bugonia     | 539.75 / 540px | -90°, 1; 631.27 / 637.27                              | 631.27 / 637.27                    | 0 / 0px                   |
| 390×844 Newsquest   | 557.94 / 558px | -89.9881°, .999868; 631.19 / 637.21                   | 631.27 / 637.27                    | +0.08 / +0.06px           |

La geometria destinazione è già stabile all’handoff: mantenere il progetto selezionato e il DOM del suo header montati in `opening`, nascondendo solo visivamente la colonna Project e separando i target motion per fase. I valori `--site-header-height` e `--project-gallery-header-height` sono misurati dalla modifica locale già presente in `SiteHeader.tsx`; non sostituirla. Nessun cambio a dimensioni, easing o progressione della scena è previsto.

## Sequenza

- Attuale: idle (Home) → opening (piano e header Project montati; target Project visibili fino all’avvio dell’exit) → project (gli stessi target entrano) → closing (exit Project) → Home reveal.
- Desiderata: idle (Home) → opening (layout/media/geometria Project pronti; testo Project nascosto al primo paint; Home e superficie Home eseguono exit) → project (singolo enter di header Project e controlli) → closing → Home reveal.

## File e verifiche

- `src/layouts/PortfolioLayout.tsx`, `src/components/ui/SiteHeader.tsx`, `src/components/ui/SiteHeader.css`: separare layout destinazione e visibilità/testo; non includere target Project nell’exit Home.
- `tasks/plan.md`: documentazione della causa e baseline, scritta prima delle modifiche applicative.
- `scripts/verify-project-transition.mjs`: test Playwright con screenshot opening early/middle/near-endpoint, primo frame Project e stato assestato; metriche frame-per-frame, apertura/chiusura, Back/Forward, route diretta, reduced motion; Bugonia/Newsquest su desktop e mobile.
- Accettazione: zero testo Project esposto durante opening; singolo enter al handoff; delta geometrico coerente con la baseline (nessun salto aggiuntivo); console pulita; verifiche e build esistenti verdi.

## Esito dopo la patch

La verifica Playwright dedicata è passata per entrambe le route e dimensioni. Durante `opening` header Project e controlli gallery sono risultati non esposti; al primo frame Project il testo dell’header era ancora clip-hidden e poi è entrato una volta. L’header ha mantenuto la stessa altezza al handoff. Scarto massimo registrato: 0,24px per top gallery/card su desktop e 0,10px su mobile. Sono state salvate 20 schermate, incluse le cinque fasi per ogni route/dimensione, in `stages/04_testing/test-results/project-transition/`.

Build e prerender hanno completato quattro route; typecheck, lint mirato, formattazione mirata, verifica choreography, preloader e agentic sono passati. Le verifiche repo-wide hanno limiti preesistenti: `npm run check` si ferma su ESLint dentro `.kilo/worktrees/north-scarecrow`; il controllo Prettier repo-wide segnala 17 file fuori da questa patch; il budget globale supera le soglie configurate. `verify:prerender` segnala errori CORS nelle query browser a Sanity e `verify:task2` non è completato perché l’ambiente non consente la connessione al CMS.

## Vincoli e stato locale

Preservare durata/ease 3D, ingresso media, media selezionato, filtri, scroll restoration, navigazione, reduced motion e layout mobile. Integrare senza sovrascriverli gli edit preesistenti in `SiteHeader.tsx` e `SingleProjectView.css`, che definiscono la misurazione header/gallery e la posizione media su mobile.

## Choreography dei filtri media Home (riferimento per le Project Pages)

Reverse engineering verificato in `FilterBar.tsx`, `ProjectGrid.tsx` e `ProjectIndex.css` prima della patch alle Project Pages:

1. Il click aggiorna il filtro attivo nel context; `ProjectIndex` deriva i risultati e passa il filtro come `filterKey` a `GalleryGrid`. `FilterBar` non chiude il pannello quando si seleziona una voce.
2. `GalleryGrid` azzera lo scroll della gallery e usa `AnimatePresence` in modalità `wait`. Il wrapper keyed dal filtro applica la transizione condivisa del contenitore: opacity 0 / y 10 → opacity 1 / y 0; exit opacity 0 / y -6; 0,38s con easing `[0.22, 1, 0.36, 1]`. In reduced motion non c’è durata né traslazione.
3. Le card mantengono key stabili e non hanno varianti di movimento individuali (`initial={false}`). Il reveal avviene nel wrapper di ciascun media (`.gallery-media-reveal`): maschera clip-path dall’alto verso il basso (`inset(0 0 100% 0)` → `inset(0)`), durata 620ms, easing `cubic-bezier(0.22, 1, 0.36, 1)`, con delay `min(i, 12) × 55ms + max(i − 12, 0) × 12ms`.
4. In reduced motion il wrapper media è subito visibile, senza clip residuo, animazione o stagger. La Home non mostra caption media equivalenti ai filename Project, quindi le caption non fanno parte del reveal condiviso.

Nelle Project Pages il cambio filtro riusa entrambi i livelli della choreography (contenitore sequenziale e reveal media), ma resta distinto dall’entrance della route: `useProjectGalleryEntrance`, curtain e progressione scena non fanno parte del cambio filtro.

## Task 2 — Filter Choreography (analisi prima della patch)

### CURRENT STATE

- `selectedFilter` è posseduto da `FilterProvider` in `src/providers/FilterContext.tsx`; `ProjectIndex` usa il valore per derivare il dataset e `FilterBar` per label e stato attivo.
- `filterOpen` Home è locale a `FilterBar`; il filtro Project possiede il proprio `isMediaFilterOpen` in `SingleProjectView`.
- `PortfolioScene` mantiene montato il piano Home durante le transizioni. `ProjectTransitionProvider` gestisce `opening/project/closing`, ma `FilterProvider` è annidato in `PortfolioLayout`, quindi il transition provider non può resettare direttamente il context. Lo stato locale `FilterBar` non viene smontato.
- `SiteHeader` usa `TextRevealMotion` e include il summary Home con `data-motion-text` nella propria timeline. La gallery usa invece `GalleryMediaReveal.css` dopo l’intro, con reveal CSS da 620ms e delay per item. Sono pipeline separate.
- Le opzioni Home non hanno motion individuale; il panel anima solo larghezza, opacità e spostamento orizzontale. Le opzioni Project sono condizionali e statiche. La gallery usa `galleryFilterMotion.ts` e il wrapper CSS dei media.

### ROOT CAUSE

1. Il summary Filter Home appartiene alla timeline header e può entrare prima che il reveal CSS della gallery abbia prodotto presenza visiva.
2. Le opzioni non hanno varianti di opacity/translateY né stagger, quindi appaiono statiche quando il panel si apre.
3. `ProjectIndex` resta montato nel piano Home e `FilterProvider` persiste; l’apertura locale del summary persiste anch’essa. UI Back e browser Back riportano la scena a Home senza un reset esplicito al boundary.

### TARGET CHOREOGRAPHY

- **INTRO → HOME:** header/shell → gallery avvia il reveal → prima foto acquisisce presenza visiva → Filter entra → Home assestata. Baseline iniziale: ~15% di progresso effettivo del reveal della prima foto, da calibrare visivamente.
- **PROJECT → HOME:** all’inizio della chiusura, mentre il piano Home è nascosto, azzerare selezione e panel e rendere il Filter in attesa del reveal. Quando il piano si avvicina, gallery `All` rivela → Filter `+` entra → Home assestata.
- **FILTER CLOSED → OPEN:** il trigger cambia a `−`; il panel si espande mentre le opzioni salgono dal basso in ordine visivo e con stagger condiviso.
- **FILTER OPEN → CLOSED:** opzioni escono in ordine visivo con il timing di exit testuale; il panel collassa solo dopo l’exit.
- **CATEGORY CHANGE:** aggiornare solo selezione/count/dataset/gallery; le opzioni già aperte restano stabili. La pagina Project mantiene il panel aperto.

### IMPLEMENTATION

- Estrarre una primitive/utility condivisa per disclosure panel e opzioni Home/Project, usando i timing `TEXT_MOTION` e rispettando reduced motion.
- Coordinare l’entrata Home con il progresso del primo `.gallery-media-reveal`, senza timer autonomi; escludere il summary Home dalla timeline header, lasciando invariata la timeline del Filter Project.
- Rendere `selectedFilter` e `filterOpen` accessibili al boundary Project → Home con il minimo cambiamento architetturale necessario. Resettarli sul Back UI e sulla navigazione browser verso Home, prima del reveal del piano; non usare remount globale.
- Verificare desktop 1280×900 e mobile 390×844, UI Back, browser Back/Forward, Bugonia, Newsquest e `prefers-reduced-motion: reduce`, oltre a typecheck/build/lint e console.

## Esito implementazione e verifica

- Estratto `FilterDisclosureOptions` condiviso; Home e Project animano ogni opzione con opacity e traslazione verticale, stagger ordinato e exit completato prima della chiusura del panel. Distanze e stagger mobile seguono i valori responsive di `TEXT_MOTION`.
- Il summary Home è escluso dalla timeline del header e parte quando il progresso animato della prima foto supera la baseline del 15%. A 1280×900 il Filter ha iniziato il reveal 20,8ms dopo che la prima foto aveva raggiunto la soglia; il confronto visivo non ha richiesto calibrazioni ulteriori.
- Il context del filtro è stato collocato sopra il transition provider entro la route portfolio. UI Back e browser Back azzerano `selectedFilter` e `filterOpen` all’avvio della chiusura. Campionando i frame in cui il reveal Home è attivo, la gallery conteneva già 23 media, la label era `All [2]` e il pannello era chiuso. Back/Forward ripetuti hanno mantenuto lo stato default.
- A 390×844 gli elementi restano nei limiti verticali del pannello durante il translate; le opzioni mantengono lo scroll touch orizzontale senza overflow della pagina. Newsquest espone `Videos [0]` disabilitato. Reduced motion mostra summary e opzioni con opacity 1 e transform `none`.
- Verifiche passate: `npm run typecheck`, `npx eslint src scripts/verify-project-media.mjs --max-warnings=0`, `npm run build`, `npm run verify:project-transition` e `node scripts/verify-project-media.mjs`.
- La suite `verify-project-media.mjs` è stata allineata al lifecycle corrente: l’ingresso Project tramite rotazione non deve rilanciare il reveal per-card; il cambio filtro Project invece deve attivare il reveal media condiviso e lasciare il panel aperto.
- Nessun errore runtime rilevato. Il solo warning browser osservato è quello informativo di Motion durante l’emulazione di reduced motion; la build segnala inoltre il chunking già esistente di `ContactFormExperience.tsx` importato sia staticamente sia dinamicamente.
