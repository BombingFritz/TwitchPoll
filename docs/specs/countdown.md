# Countdown

## Ziel
Restzeit im Statusschild anzeigen.

## Verhalten
getPollEndsAt nutzt ends_at (vom Server: `endsAt`), falls vorhanden, sonst started_at plus duration (nur noch im Helix-Rückfall). Seit 1.0 (ADR 0010) im Statusschild oben rechts als „Läuft m:ss“, Aktualisierung alle 250 ms; in den letzten 15 s pulsiert das Schild, in den letzten 10 s ist es rot. Bei Poll-Ende zeigt es „Beendet“, ohne Abstimmung ist es ausgeblendet.

## Nicht-Ziele
Eigene Sekundenanzeige außerhalb des Schilds.

## Akzeptanzkriterien
- Bei aktiver Poll ist der Timer sichtbar.
- Ein Start während laufender Poll zeigt die Restzeit.
- Nach Poll-Ende zeigt das Schild „Beendet“; ohne Abstimmung ist es ausgeblendet.
- Letzte 15 s pulsierend, letzte 10 s rot.

## Berührte Dateien/Funktionen
`SpargelPoll.html`: getPollEndsAt, setChip, startTimer, stopTimer, updateTimer.

## Status
umgesetzt. Akzeptanzkriterien sind Prüfanforderungen, kein Nachweis einer hier durchgeführten Laufzeitprüfung.
