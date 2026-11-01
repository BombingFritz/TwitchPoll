# Auto-Hide und Status

## Ziel
Widget ohne Poll verbergen und Startstatus anzeigen.

## Verhalten
AUTO_HIDE steuert Ein-/Ausblenden; Leerzustand und Statuspunkt werden über UI-Hilfsfunktionen gesetzt. Statuspunkt ist kein verlässlicher Chat-Zustellnachweis.

## Nicht-Ziele
Neue Statusüberwachung ergänzen.

## Akzeptanzkriterien
- Bei AUTO_HIDE=true blendet das Widget ohne aktive Poll aus.
- Bei aktiver Poll wird das Widget sichtbar.
- Ein Chat-Fehler beendet die visuelle Endsequenz nicht.

## Berührte Dateien/Funktionen
`SpargelPoll.html`: showWidget, hideWhenNoPoll, showNoPoll, updateStatus.

## Status
umgesetzt. Akzeptanzkriterien sind Prüfanforderungen, kein Nachweis einer hier durchgeführten Laufzeitprüfung.
