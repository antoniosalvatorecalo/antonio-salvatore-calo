# Piano operativo: handoff del preloader

## Obiettivo

Sincronizzare l'uscita dell'intro con uno staircase wipe bianco, mantenendo la Home pronta sotto l'overlay e bloccandone header/gallery fino alla copertura completa.

## Interventi

1. Mantenere la Home montata quando il catalogo è pronto, ma non impostare `introComplete` né inviare `portfolio:intro-complete` all'avvio del wipe.
2. Usare un preloader nero dal primo paint, con tipografia editoriale ridotta e reveal deterministici; tenere progress a 92% durante l'attesa CMS e completarlo appena possibile.
3. Animare 16 colonne bianche dal basso verso l'alto (0,42 s per colonna, 0,03 s di stagger, `power4.inOut`), mantenere la copertura per 55 ms, quindi impostare `introComplete`, inviare l'evento una volta e rimuovere l'intro al frame successivo.
4. Sostituire i contatori indipendenti con slot numerici a larghezza fissa: data stabile, orologio aggiornato ogni secondo e movimento limitato alle cifre cambiate.
5. Con reduced motion, mostrare subito il contenuto e completare senza wipe o digit roll. Verificare stato/evento, console, build e layout a 1471×645, 1440×900 e 390×844.

## Verifica e vincoli

- Durante il wipe: overlay montato, strip con trasformazioni sfalsate, `introComplete` assente ed evento non ancora inviato.
- Dopo copertura e hold: dataset impostato, evento inviato una sola volta e overlay rimosso in un frame successivo.
- Usare la stessa superficie `var(--bg-primary)` per wipe e Home. Non modificare project transition, geometria header, CMS, routing o SEO; nessuna nuova dipendenza.
- Su mobile nascondere l'indicatore del scrollbar della gallery che appare sul bordo durante l'handoff, mantenendo lo scroll attivo.
- Preservare tutte le modifiche locali non pertinenti.
