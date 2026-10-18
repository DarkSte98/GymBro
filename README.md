# GymBro v16 — Foundation Rebuild

Questa build introduce una base più strutturata per i prossimi interventi, partendo dalla versione v15.

## Modifiche in questa build

### Catalogo esercizi
- La scelta dell'attrezzatura resta nel profilo/onboarding; nel catalogo non c'è più un secondo filtro attrezzatura.
- Aggiunto filtro muscolare con figura anatomica SVG interattiva e viste anteriore/posteriore.
- Le zone muscolari e i chip selezionabili filtrano il catalogo; il filtro può essere azzerato.
- Il numero dei risultati si aggiorna in base alla selezione.

### Riordino
- Il trascinamento riorganizza la lista mentre l'utente sposta l'elemento.
- Scorrimento automatico vicino ai bordi della finestra o del contenitore scrollabile.
- Il trascinamento usa una chiave stabile per ritrovare l'elemento dopo il rendering.
- La selezione dell'attrezzatura viene salvata dal profilo e usata per filtrare il catalogo.

### Story Studio
- Migliorata la transizione dei pannelli inferiori e dello sfondo scuro.
- Restano disponibili i blocchi di adesivi, il trascinamento e il pinch-to-resize del prototipo precedente.

## Pubblicazione su GitHub Pages
Sostituire tutti e 7 i file nella root del repository: `index.html`, `styles.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `icon.svg`, `README.md`. Attendere il deploy e ricaricare la pagina. Il service worker usa la cache `gymbro-v16-foundation-rebuild`.

## Verifiche e limiti
- Verificato `node --check app.js` senza errori di sintassi.
- L'archivio ZIP è stato validato dopo la creazione.
- Non è stato completato un test interattivo end-to-end su Safari/iPhone in questa sessione. I gesti multi-touch, lo scroll automatico e il flusso Web Share vanno ancora verificati sul dispositivo.
- Questa build è una base di sviluppo, non una replica completa o certificata di LYFTA. Il catalogo degli esercizi è ancora un set iniziale e i contenuti anatomici sono una figura schematica, non una tavola medica dettagliata.
