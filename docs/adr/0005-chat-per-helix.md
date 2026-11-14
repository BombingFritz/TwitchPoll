# ADR: Chat-Ausgabe per Helix-API

## Status
Angenommen; Nutzer bestätigt. Abgelöst durch [ADR 0009](0009-abstimmung-und-ergebniszeile-ueber-den-server.md) (0.9.0): Der Server sendet die Zeile beim Ende der Abstimmung; der Helix-Versand des Widgets bleibt nur als abschaltbarer Rückfall.

## Kontext
Ergebnistext soll im Kanal-Chat erscheinen.

## Entscheidung
Ausschließlich API-Versand; Zeitpunkt bei Overlay-Ende unverändert lassen.

## Verworfene Alternativen
Zusätzliches Chat-Ausgabe-UI im Widget nicht erforderlich.

## Konsequenzen
Benötigte Scopes laut Nutzer vorhanden; Fehler im Versand werden geloggt.
