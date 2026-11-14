# ADR: REST-Polling statt EventSub

## Status
Angenommen; historisch berichtet und im Code vorhanden. Abgelöst durch [ADR 0009](0009-abstimmung-und-ergebniszeile-ueber-den-server.md) (0.9.0): REST bleibt, aber gegen den Server statt Helix.

## Kontext
Frühere EventSub-Reconnects erzeugten laut Vorgeschichte zusätzliche Subscriptions, HTTP 429 und ausbleibende Endevents.

## Entscheidung
Poll-Status per REST abfragen; kein EventSub im aktuellen Widget.

## Verworfene Alternativen
Frühere WebSocket-/EventSub-Anbindung.

## Konsequenzen
Abfragebasierte Erkennung mit Intervallverzögerung; keine EventSub-Subscriptions.
