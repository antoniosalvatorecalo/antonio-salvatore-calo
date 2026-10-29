# Convenzioni di codice

> **Leggi quando:** scrivi o rifattorizzi codice. Il codice e i commenti restano in **inglese**;
> documentazione, commit e testi per l'utente in **italiano**.

## Moduli e nomi

- `PascalCase` per componenti e tipi, `camelCase` per valori e funzioni, `useQualcosa` per gli
  hook, `UPPER_SNAKE_CASE` solo per vere costanti.
- Export con nome; export default solo per route lazy o API che lo richiedono.
- Ordine import: React → librerie → moduli `@/` → relativi → stili.
- `@/` tra feature diverse; percorsi relativi dentro lo stesso modulo.
- Direzione delle dipendenze: UI → provider/hook → dominio/lib → adapter CMS. I tipi Sanity
  generati restano dentro `src/cms/`.

## React e TypeScript

- Componenti piccoli e semantici; valori derivati invece di stato duplicato.
- Gli effetti sincronizzano sistemi esterni: dipendenze dichiarate e pulizia sempre (listener,
  observer, contesti GSAP, timer, richieste).
- Niente memoizzazione speculativa né nuovi context senza uno stato condiviso reale.
- Vietati `any`, `@ts-ignore` e `!` non giustificati. Preferisci `unknown`, type guard, tipi di dominio.
- Gestisci gli errori async nel punto recuperabile più vicino; non esporre segreti o errori grezzi.

## CSS e accessibilità

- Token e reset globali in `src/index.css`; regole di componente nel `.css` accanto al componente.
- Rimuovi selettori solo dopo aver verificato riferimenti e comportamento a runtime.
- Anima `transform` e `opacity`; `will-change` solo durante l'animazione.
- HTML semantico prima di tutto: la navigazione è un link, le azioni sono bottoni, il focus è
  visibile, tastiera e reduced motion funzionano, gli attributi ARIA riflettono lo stato reale.
- Testi nuovi per l'utente: chiave in `src/i18n/translations.ts` con EN e IT.

## Controlli di qualità

`npm run typecheck`, `npm run lint`, `npm run build` e la verifica pertinente in `scripts/verify/`
prima di passare alla fase successiva di un refactor.
