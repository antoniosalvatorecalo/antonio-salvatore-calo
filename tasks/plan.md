# Implementation Plan: Intro cinematico portfolio

## Overview

Creare un intro full-screen per l'ingresso nel portfolio ispirato ai due video già presenti: fondo nero e barra di caricamento centrale dal primo riferimento; dal secondo, layering di voci/testi professionali. L'intro deve terminare quando il catalogo è pronto, con fallback sicuro in caso di errore e comportamento istantaneo con reduced motion.

## Architecture Decisions

- Overlay React globale montato in `AppShell`, così copre anche il caricamento iniziale senza alterare `PortfolioLayout` e le transizioni progetto.
- Gerarchia visiva fissa, dal basso verso l'alto: barra di loading centrale; gruppo di voci/testi professionali; valore numerico `0–100` sopra il gruppo testuale.
- La transizione dall'intro alla home replica il primo video: stessa chiusura della schermata nera, stesso comportamento della barra e stesso reveal della home; non un fade generico indipendente dal riferimento.
- Dopo la chiusura del preloader, ogni elemento della gallery entra singolarmente con stagger sequenziale, usando l'animazione già esistente ma sincronizzata sull'evento di completamento dell'intro.
- Stato di avanzamento deterministico guidato da caricamento catalogo + timer visivo; il completamento reale sblocca l'uscita, mentre il testo resta accessibile e non dipende dai video come runtime asset.
- Testi bilingue tramite `LanguageProvider`; voci sovrapposte in livelli con opacità/blur leggeri e `aria-live` solo sul valore percentuale.
- `prefers-reduced-motion` elimina interpolazioni e riduce l'intro a una transizione minima.

## Task List

### Phase 1: Foundation
- [ ] Task 1: Esporre lo stato di caricamento del catalogo al guscio applicativo.
- [ ] Task 2: Implementare overlay intro con progress 0–100 e composizione tipografica.

### Checkpoint: Foundation
- [ ] Typecheck e lint passano
- [ ] Catalogo pronto/error non lascia l'interfaccia bloccata

### Phase 2: Motion and polish
- [ ] Task 3: Aggiungere CSS cinematico, layering voci, barra e uscita ispirata al primo video.
- [ ] Task 4: Integrare reduced-motion, focus/accessibilità e verifica browser.
- [ ] Task 5: Sincronizzare l'ingresso sequenziale della gallery dopo il preloader.

### Checkpoint: Complete
- [ ] Build riuscita
- [ ] Intro visivamente coerente con i due riferimenti
- [ ] Nessuna regressione delle transizioni esistenti

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Catalogo remoto lento o in errore | High | Progress minimo garantito e uscita su stato error dopo breve attesa |
| Intro riappare durante navigazione client-side | Medium | Stato montato una sola volta nel root shell |
| Testi troppo densi su mobile | Medium | Clamp tipografici, overflow controllato e layout responsive |

## Open Questions

- Nessuna: uso testi professionali neutrali e bilingue già coerenti con il portfolio.
