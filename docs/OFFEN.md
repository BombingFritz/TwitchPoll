# Offene Punkte

## Geplant für 0.8.2
Betrifft Widget und Auth-Server (separates Repository).

1. **IDs vom Auth-Server:** `/token` liefert zusätzlich die `client_id` (die `broadcaster_id` liefert er schon). Das Widget übernimmt beide, sodass im HTML keine IDs mehr eingetragen werden müssen. So war es ursprünglich gedacht.
2. **Cache-Problem beim OBS-Start:** Nach einem OBS-Update blieb das Widget ohne gültigen Token hängen (siehe `BUGS.md`). Geplant:
   - Widget: doppelten Token-Abruf in `init()` zusammenführen; jeder Token-Abruf mit `cache: 'no-store'`.
   - Server: `/token` mit `Cache-Control: no-store` ausliefern.
3. **Sicherheitslücke `/token`:** Der Auth-Server erlaubt CORS-Anfragen von jeder Herkunft. Damit kann jede Webseite, die auf dem Streaming-PC im Browser geöffnet ist, den Access-Token unter `localhost:3000/token` auslesen. Lösungsweg noch offen, Optionen:
   - Widget vom Auth-Server ausliefern lassen (gleiche Herkunft, CORS für `/token` kann entfallen).
   - CORS auf erlaubte Herkünfte beschränken. Achtung: lokal geöffnete Dateien senden die Herkunft `null`.
   - Server zusätzlich nur an `127.0.0.1` binden.
4. **OBS-Pfad:** Browser-Source einmalig auf `SpargelPoll.html` umstellen. Ab 0.8.2 ist dafür keine lokale Kopie mit echten IDs mehr nötig.

Server-seitig ebenfalls zu prüfen: Der Server erneuert den Token nur kurz vor Ablauf. Meldet das Widget einen 401, bekommt es deshalb unter Umständen denselben Token zurück.

## Technisch prüfen
1. **Länge der Chat-Nachricht:** Bei sehr langen Umfragetiteln oder Optionsnamen kann die Ergebnisnachricht das Twitch-Limit überschreiten. Im Widget gibt es keine Längenbegrenzung. Keine automatische Textänderung ohne Auftrag.
2. **Body-Klasse `vc-init`:** Herkunft unbekannt, im Widget ohne eigene CSS-/JS-Verwendung. Vermutlich ein Überbleibsel einer Browser-Erweiterung beim Speichern der Seite (ebenso `data-lt-installed` am `<html>`-Tag). Kein Änderungsauftrag; eine Entfernung wäre separat zu prüfen.

## Bekannte Implementierungsdetails
- `init()` lädt den Token zweimal (einmal im Inline-Block ohne `cache: 'no-store'`, einmal über `fetchAccessToken()`). Wird in 0.8.2 zusammengeführt.
- Der feste Ausblend-Delay und die optionsabhängigen Animations-Delays sind unterschiedlich. Das bestehende Timing ist akzeptiert; keine ungefragte Änderung.
- Der Chat-Versand loggt Fehler, `is_sent=false` und den Nachrichtentext zum manuellen Posten. Wiederholt wird nur einmal nach Token-Erneuerung (401/403).
- 0.8.1 ist noch nicht im Live-Stream erprobt.

## Geklärt
- Benötigte Scopes sind im Auth-Server vorhanden.
- Web Audio reicht als Sound; Versandzeitpunkt und Nullstimmen-Gleichstand sind bestätigt.
- Die bestehende Architektur bleibt; frühere Alternativen werden nicht rekonstruiert.
- Die aktuelle Animation ist fehlerfrei; historische Probleme stehen nur in `BUGS.md`.
- Alte Versionen sind nicht mehr zuordenbar: akzeptierte historische Lücke.

## Abgrenzung
TTF („Text To Fritz“, früherer TTS-Entwurf) gehört nicht zum Poll-Widget und wird hier nicht als Feature geführt.
