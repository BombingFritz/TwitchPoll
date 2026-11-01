# Countdown

## Ziel
Restzeit anzeigen.

## Verhalten
getPollEndsAt nutzt ends_at, falls vorhanden, sonst started_at plus duration. Timer aktualisiert alle 100 ms und stoppt bei Poll-Ende.

## Nicht-Ziele
Unbeauftragten kritischen Puls-Timer ergänzen.

## Akzeptanzkriterien
- Bei aktiver Poll ist der Timer sichtbar.
- Ein Start während laufender Poll zeigt die Restzeit.
- Nach Poll-Ende ist der Timer ausgeblendet.

## Berührte Dateien/Funktionen
`SpargelPoll.html`: getPollEndsAt, startTimer, stopTimer, updateTimer.

## Status
umgesetzt. Akzeptanzkriterien sind Prüfanforderungen, kein Nachweis einer hier durchgeführten Laufzeitprüfung.
