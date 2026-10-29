# CMS (Sanity)

> **Leggi quando:** aggiungi/modifichi contenuti, query GROQ, schemi o tipi generati.

## Chi possiede cosa

| Repository                                   | Responsabilità                                                |
| -------------------------------------------- | ------------------------------------------------------------- |
| `../studio-antonio-salvatore-calo/` (Studio) | Schemi, TypeGen, interfaccia editoriale                       |
| questo repo (frontend)                       | Query GROQ (`src/cms/queries.ts`), normalizzazione, rendering |

Il file `src/cms/sanity.types.ts` è **generato** dallo Studio: non modificarlo a mano.
Le letture pubbliche usano il CDN Sanity e non richiedono variabili d'ambiente.

## Modello dei contenuti

**`project`** — titolo e descrizione EN/IT, slug unico, ordine di visualizzazione, servizio
(categoria canonica), gallery con almeno un elemento. Sezioni localizzate: Contesto, Problema,
Soluzione, crediti, link, media, override SEO opzionali (title, description, immagine OG).
Media immagine e Vimeo richiedono `alt` e `label` EN/IT; Vimeo richiede URL valido e poster.

**`siteSettings`** (singleton) — nome, bio, contatti pubblici, social, download (CV/portfolio),
origine canonica, SEO globale, favicon e theme color opzionali.

## Aggiungere un progetto

1. Nello Studio crea il progetto con slug e ordine non usati e categoria canonica.
2. Compila gallery (con `alt` descrittivi: contano per SEO e accessibilità) e campi SEO.
3. Pubblica, poi rifai il deploy: gallery, filtri, route, sitemap e meta si aggiornano **senza
   modifiche al frontend**. Non aggiungere codice specifico per uno slug.

## Dopo modifiche a schemi o query

Dallo Studio:

```bash
npm run typecheck
npm run schema:extract
npm run typegen      # aggiorna anche src/cms/sanity.types.ts del frontend
npm run build
```

Gli script di import del dataset **modificano dati remoti**: non sono verifiche, non usarli senza
richiesta esplicita.
