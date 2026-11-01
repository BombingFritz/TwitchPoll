# Ergebnis-Sound

## Ziel
Tadaaa mit Beginn der Siegesanzeige.

## Verhalten
Web-Audio-Synthese im Sieger-/Gleichstand-Timeout; gemeinsamer Context und Einmal-Flag. Nutzer bestätigt Web Audio als ausreichend.

## Nicht-Ziele
Echte Audiodatei; Sound-Engine ausweiten.

## Akzeptanzkriterien
- Sieger und Gleichstand lösen den Sound höchstens einmal je Poll-Ende aus.
- Sound-Trigger und Siegesanzeige liegen im selben Callback.
- Nach Nutzerinteraktion wird ein suspendierter Context fortgesetzt.

## Berührte Dateien/Funktionen
`SpargelPoll.html`: getSharedAudioContext, unlockAudioOnInteraction, playResultSound, triggerResultSound.

## Status
umgesetzt. Akzeptanzkriterien sind Prüfanforderungen, kein Nachweis einer hier durchgeführten Laufzeitprüfung.
