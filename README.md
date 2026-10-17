# GymBro Test v6 — Versione unificata

Prototipo PWA mobile-first per GitHub Pages. Tema nero/antracite e verde lime.

## Funzioni
- Schede e sessioni con timer generale e timer recupero.
- Modifica del peso e delle ripetizioni nella prima serie propagata alle altre serie; le serie successive restano modificabili singolarmente.
- Archivio esercizi con filtri per gruppo muscolare.
- Salvataggio locale nel browser (`gymbro_test_v1`).
- Riepilogo allenamento e condivisione testuale.
- Social Studio: crea una grafica verticale 9:16 in PNG con statistiche GymBro, foto opzionale, stile con sfondo lime o foto in primo piano.
- Audio di recupero con comando di prova; la riproduzione reale va comunque verificata su Safari iOS.
- Condivisione dell'immagine tramite Web Share API quando supportata; fallback per salvare il PNG e caricarlo manualmente su Instagram o altri social.

## Pubblicazione
Caricare tutti i 7 file nella root del repository GitHub e abilitare GitHub Pages su `main` / `/(root)`.

## Limiti del prototipo
Non c'è backend/account cloud. Instagram non offre un pulsante universale per pubblicare direttamente una Storia da una normale pagina web: la disponibilità dipende dal menu di condivisione del dispositivo e dalle app installate. Se non compare, salva il PNG e caricalo da Instagram.
