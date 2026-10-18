# GymBro v14 — Social Studio

Prototipo web GymBro con flusso di condivisione riprogettato per mobile.

## Flusso di condivisione
- Selettore iniziale dei modelli per Storie, anteprima e scelta di una foto personale.
- Editor verticale a tutto schermo con foto di sfondo e blocchi di testo/statistiche bianchi senza pannelli opachi.
- Barra strumenti in basso e pannelli a comparsa per modelli, adesivi preimpostati, statistiche e testo.
- Adesivi/blocchi selezionabili, spostabili direttamente sull'anteprima e ridimensionabili con gesto a due dita.
- Menu finale per condivisione nativa, salvataggio immagine e condivisione verso Instagram quando il browser lo supporta.
- Riordino degli esercizi con trascinamento e scorrimento automatico vicino ai bordi dello schermo.

## Pubblicazione su GitHub Pages
Sostituire tutti e 7 i file nella root del repository: `index.html`, `styles.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `icon.svg`, `README.md`. Attendere il deploy. Il service worker usa la cache `gymbro-v14-social-studio`.

## Limiti da verificare su dispositivo
Il comportamento dei gesti multi-touch e del foglio di condivisione dipende dal browser e dal sistema operativo. Il prototipo non può aprire direttamente la schermata di composizione di Instagram Stories su tutti i dispositivi: dove l'API Web Share non supporta file, salva l'immagine per selezionarla in Instagram.
