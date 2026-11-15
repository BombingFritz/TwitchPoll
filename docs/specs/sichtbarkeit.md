# Auto-Hide und Status

## Ziel
Widget ohne Poll verbergen und Startstatus anzeigen.

## Verhalten
AUTO_HIDE steuert Ein-/Ausblenden; Leerzustand und Statuspunkt werden über UI-Hilfsfunktionen gesetzt. Statuspunkt ist kein verlässlicher Chat-Zustellnachweis. Seit 0.9.0 zeigt er den Erfolg der letzten Abfrage beim Server: grün nach gültiger Antwort, rot bei Fehler oder ungültiger Antwort.

## Nicht-Ziele
Neue Statusüberwachung ergänzen.

## Akzeptanzkriterien
- Bei AUTO_HIDE=true blendet das Widget ohne aktive Poll aus.
- Bei AUTO_HIDE=false (auch `?demo=…&always=1`) ist das Widget dauerhaft sichtbar, ohne Abstimmung mit „Keine aktive Abstimmung“.
- Bei aktiver Poll wird das Widget sichtbar.
- Ein Chat-Fehler beendet die visuelle Endsequenz nicht.

## Berührte Dateien/Funktionen
`SpargelPoll.html`: showWidget, hideWhenNoPoll, showNoPoll, updateStatus.

## Status
umgesetzt. Akzeptanzkriterien sind Prüfanforderungen, kein Nachweis einer hier durchgeführten Laufzeitprüfung.
