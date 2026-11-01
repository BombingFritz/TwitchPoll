# ADR: Chat-Ausgabe per Helix-API

## Status
Angenommen; Nutzer bestätigt

## Kontext
Ergebnistext soll im Kanal-Chat erscheinen.

## Entscheidung
Ausschließlich API-Versand; Zeitpunkt bei Overlay-Ende unverändert lassen.

## Verworfene Alternativen
Zusätzliches Chat-Ausgabe-UI im Widget nicht erforderlich.

## Konsequenzen
Benötigte Scopes laut Nutzer vorhanden; Fehler im Versand werden geloggt.
