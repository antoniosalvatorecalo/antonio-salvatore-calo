# Git: commit in italiano e come annullare

> **Leggi quando:** stai per fare un commit o devi annullare una modifica.
> Le regole sono verificate in automatico dall'hook `.githooks/commit-msg`
> (logica in `scripts/git-hooks/commit-msg-check.mjs`), quindi valgono per persone e agenti AI.

## Formato del messaggio

```text
<tipo>(<ambito>): <descrizione in italiano, all'imperativo>

<corpo facoltativo: perché la modifica, cosa può rompersi, come verificarla>

<trailer facoltativi, es. Co-Authored-By: …>
```

- Titolo **massimo 72 caratteri**, senza punto finale. L'ambito è facoltativo.
- Descrizione all'imperativo: _aggiungi, correggi, rimuovi, aggiorna, sposta, semplifica…_
- Una riga vuota tra titolo e corpo.
- I tipi restano le parole chiave standard ("Conventional Commits"), così funzionano con gli
  strumenti esistenti; tutto il resto è in italiano.

| Tipo         | Quando                                         | Esempio                                                   |
| ------------ | ---------------------------------------------- | --------------------------------------------------------- |
| `feat`       | nuova funzionalità visibile                    | `feat(contatti): aggiungi scelta del budget nel form`     |
| `fix`        | correzione di un bug                           | `fix(header): ripristina il focus dopo la transizione`    |
| `seo`        | meta, dati strutturati, sitemap                | `seo: aggiungi H1 e dati strutturati locali`              |
| `content`    | testi, immagini, PDF                           | `content: aggiorna il CV scaricabile`                     |
| `docs`       | documentazione                                 | `docs: riscrivi la guida in italiano`                     |
| `style`      | solo formattazione, nessun cambio logico       | `style: applica prettier ai file di scripts`              |
| `refactor`   | ristrutturazione senza cambio di comportamento | `refactor(cms): estrai la normalizzazione dei media`      |
| `perf`       | prestazioni                                    | `perf(gallery): carica in lazy le immagini fuori schermo` |
| `test`       | verifiche e test                               | `test: aggiungi verifica della pagina contatti`           |
| `build`/`ci` | build, dipendenze, pipeline                    | `build: aggiorna vite alla 6.3`                           |
| `chore`      | manutenzione varia                             | `chore: rimuovi cartella .kilo inutilizzata`              |
| `revert`     | annullamento (generato da `npm run annulla`)   | `revert: annulla il commit 83e3b8a`                       |

L'hook rifiuta: formato sbagliato, titolo troppo lungo, punto finale, descrizione che inizia con
un verbo inglese (_add, fix, update…_), testo prevalentemente inglese. Il testo tra virgolette o
backtick non viene analizzato, quindi nomi di file o titoli citati in inglese sono ammessi.

## Un commit = una cosa annullabile

- Separa le modifiche per argomento (es. SEO in un commit, documentazione in un altro): così ogni
  commit si può annullare senza toccare il resto.
- Nello stesso commit aggiorna `CHANGELOG.md` (sezione "Non rilasciato") e `BACKLOG.md`.
- Non usare mai `git commit --no-verify`, `git commit --amend` su commit già pubblicati,
  `git push --force` o `git reset --hard` su lavoro condiviso.

## Annullare una modifica

Il comando crea un **nuovo commit** che annulla le modifiche: la storia non viene riscritta e
l'annullamento stesso si può annullare.

```bash
git log --oneline -15                 # trova l'hash
npm run annulla -- --anteprima <hash> # mostra cosa verrebbe annullato
npm run annulla -- <hash>             # annulla un singolo commit
npm run annulla -- --dal <hash>       # annulla tutti i commit DOPO <hash> (lui escluso)
npm run annulla -- HEAD               # annulla l'ultimo commit (anche un annullamento)
```

Requisiti: nessuna modifica in sospeso (altrimenti `git stash`). In caso di conflitto lo script
si ferma: risolvi i file e lancia `git revert --continue`, oppure `git revert --abort`.
I merge vanno annullati a mano con `git revert -m 1 <hash>`.

**Modifiche non ancora committate:** `git restore <file>` le scarta (irreversibile: controlla
prima con `git diff <file>`).

## Hook installati

| Hook         | Cosa fa                                                                            |
| ------------ | ---------------------------------------------------------------------------------- |
| `pre-commit` | Blocca build, `node_modules`, `.env`, log, file temporanei, artefatti AI e di test |
| `commit-msg` | Applica le regole di questo documento                                              |

Si attivano con `npm install` (script `prepare` → `git config core.hooksPath .githooks`).
Per riattivarli: `npm run hooks:install`.
