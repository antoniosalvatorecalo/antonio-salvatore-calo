# Intro cinematico portfolio

- [ ] Task 1 — Esporre lo stato di caricamento del catalogo al guscio applicativo.
  - Acceptance: `loading`, `ready`, `error` disponibili senza duplicare fetch.
  - Verification: typecheck; catalogo pronto e fallback error verificati.
  - Dependencies: None.
- [ ] Task 2 — Implementare overlay intro con progress 0–100 e composizione tipografica.
  - Acceptance: fondo nero con gerarchia obbligatoria dal basso verso l’alto: barra centrale del primo video, voci/testi professionali, percentuale numerica 0–100 sopra le voci.
  - Verification: build; controllo desktop/mobile.
  - Dependencies: Task 1.
- [ ] Task 3 — Aggiungere motion, uscita e reduced-motion.
  - Acceptance: barra e testi animati; alla fine l'overlay e la home eseguono il reveal con la transizione del primo video; reduced motion istantaneo.
  - Verification: lint, typecheck, build.
  - Dependencies: Task 2.
- [ ] Task 4 — Avviare l'entrata sequenziale della gallery dopo il preloader.
  - Acceptance: nessun elemento entra sotto il preloader; dopo il reveal gli elementi entrano uno alla volta con stagger.
  - Verification: typecheck, build, controllo manuale della home.
  - Dependencies: Task 3.

## Checkpoint

- [ ] Intro funzionante senza bloccare routing o transizioni progetto.
