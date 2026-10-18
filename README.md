# GymBro — Rebuild v17

Questa build avvia una ricostruzione progressiva dell'esperienza GymBro. Include un onboarding in tre passaggi per configurare attrezzatura, obiettivo e profilo una sola volta, oltre a transizioni più curate e invalidazione della cache.

## File
- `index.html` — struttura e viste
- `styles.css` — stile responsive, componenti e onboarding
- `app.js` — stato, catalogo, schede, sessione, social studio e onboarding
- `sw.js` — cache versione v17
- `manifest.webmanifest`, `icon.svg` — PWA

## Nota di verifica
La sintassi JavaScript va controllata con `node --check app.js`. Questa build non è ancora una replica completa di LYFTA e non è stata verificata su un iPhone fisico; non va considerata pronta per il rilascio senza test interattivi.
