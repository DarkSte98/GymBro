# GymBro Test

Prototipo mobile-first per GitHub Pages. Identità visiva nero/antracite e verde lime.

## Pubblicazione su GitHub Pages
1. Crea un repository chiamato `gymbro-test`.
2. Carica tutti i file nella root del repository.
3. In Settings → Pages scegli Deploy from a branch, branch `main`, folder `/(root)`.
4. Apri `https://TUO-USERNAME.github.io/gymbro-test/`.

## Aggiornamento v3 test
- Archivio con filtri per gruppi muscolari più dettagliati.
- Il peso o le ripetizioni modificati nella prima serie aggiornano le altre serie come valori predefiniti. Le serie successive restano modificabili singolarmente.
- Pulsante “Attiva e prova il suono” nella sessione per sbloccare/verificare l’audio su Safari iOS. Il comportamento audio deve essere confermato sul dispositivo reale.
- Cache del service worker aggiornata per richiedere i nuovi file.

## Stato del prototipo
- Funzioni demo e salvataggio locale via localStorage.
- Non contiene ancora account reali o database cloud.
- I video originali non sono ancora incorporati.
- Il timer del browser può essere limitato da iOS in background; il prototipo è destinato ai test in primo piano.
