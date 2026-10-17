# GymBro Test v7 — Serie e Social Studio

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


## Correzioni v7
- Il pulsante principale del riepilogo apre direttamente il generatore di grafica 9:16; la condivisione del solo testo è separata.
- Il salvataggio delle impostazioni dell'esercizio applica peso e ripetizioni a tutte le serie mantenendo lo stato completato delle serie già svolte.
- La modifica di peso o ripetizioni nella prima serie propaga il valore alle altre; le serie successive possono essere modificate singolarmente.
- Service worker con nuova versione cache: `gymbro-v7-social-series`.


## v8 — Social Studio a adesivi
- Foto scelta come sfondo senza pannello scuro globale.
- Adesivi di titolo, durata, volume, serie e ripetizioni sovrapposti alla foto.
- Trascina gli adesivi per posizionarli; usa il punto lime nell'angolo per ridimensionarli.
- Selettore adesivo, stili traslucido/lime e ripristino posizione.
- Cache service worker aggiornata a `gymbro-v8-sticker-editor`.

## v9 — Riordino esercizi
- Nella modifica della scheda e durante l'allenamento gli esercizi possono essere riordinati con le frecce ↑/↓.
- Il simbolo ⠿ a sinistra di ogni esercizio permette di trascinarlo nella posizione desiderata, anche su dispositivi touch compatibili.
- Riordinare durante una sessione aggiorna anche l'ordine della scheda salvata.
- Cache del service worker aggiornata a `gymbro-v9-exercise-reorder`.


## v10 — adesivi trasparenti
- La foto caricata resta sfondo indipendente, senza pannelli opachi o filtro globale.
- Titolo e statistiche sono elementi di solo testo, trascinabili individualmente.
- Il punto verde ridimensiona solo l'elemento selezionato.
- I bordi di selezione e le maniglie di modifica non vengono inclusi nel PNG esportato.
