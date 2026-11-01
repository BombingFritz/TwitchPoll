# ADR: Client-ID und Broadcaster-ID vom Auth-Server

## Status
Angenommen (0.8.2); ursprünglich so gedacht, vom Nutzer bestätigt

## Kontext
Bis 0.8.1 standen Client-ID und Broadcaster-ID fest im HTML. Dadurch brauchte jede Installation eine eigene Kopie mit echten IDs, und im öffentlichen Repository durften nur Platzhalter stehen. Der Auth-Server kennt beide Werte ohnehin.

## Entscheidung
`/token` liefert `access_token`, `client_id` und `broadcaster_id`. Das Widget übernimmt die IDs, sofern in `CONFIG` keine manuell eingetragen sind. Manuelle Werte haben Vorrang.

## Verworfene Alternativen
IDs weiter im HTML pflegen.

## Konsequenzen
`SpargelPoll.html` aus dem Repository läuft ohne Anpassung. Ein Auth-Server ohne `client_id` in `/token` führt zu „Konfiguration fehlt!“, solange keine Client-ID manuell eingetragen ist. Die Client-ID ist kein Secret; das Client-Secret verlässt den Server nie.
