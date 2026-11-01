# Endsequenz und Siegesanimation

## Ziel
Ergebnis und Gewinner/Gleichstand hervorheben.

## Verhalten
3 s Ende-Overlay, dann Endwerte mit Wachstum, Banner und ggf. Strahlenkranz; anschließend Rückkehr zum Idle-Zustand.

## Nicht-Ziele
Stechen.

## Akzeptanzkriterien
- Ein eindeutiger Sieger erhält Siegerbanner und Strahlenkranz.
- Bei Gleichstand und Nullstimmen erhält keine Option Sieger-Styling.
- Wiederholter Endaufruf während der Sequenz wird ignoriert.
- Nach der Sequenz ist die nächste Poll darstellbar.

## Berührte Dateien/Funktionen
`SpargelPoll.html`: triggerPollEnded, renderPoll, findWinner, showWinnerAnnouncement, triggerWinnerDecoration.

## Status
umgesetzt. Akzeptanzkriterien sind Prüfanforderungen, kein Nachweis einer hier durchgeführten Laufzeitprüfung.
