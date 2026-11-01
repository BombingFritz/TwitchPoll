# Offene Punkte

## Nach 0.8.2 zu prüfen
1. **Live-Test in OBS:** Startet das Widget nach einem OBS-Neustart zuverlässig? In der Server-Konsole muss `[Token] Ausgabe an Widget-Herkunft: http://absolute` (oder `null`) erscheinen.
2. **OBS-Pfad:** Browser-Source einmalig auf `SpargelPoll.html` umstellen. Seit 0.8.2 ist dafür keine Kopie mit echten IDs mehr nötig.
3. **Herkunft `null` einschränken:** Zeigt der Live-Test, dass OBS nur `http://absolute` sendet, kann `null` aus den erlaubten Herkünften des Servers entfernt werden. `null` senden auch Seiten in abgeschotteten iframes; das ist der verbleibende kleine Angriffsweg.
4. **„Local Network Access“ in neueren Chromium-Versionen:** Aktuelle Chromium-Versionen sperren Anfragen von unsicheren Seiten wie `http://absolute` an `localhost`, bevor sie den Server erreichen. Im Test mit Chromium 153 trat genau das auf. OBS nutzt eine ältere Chromium-Version (CEF); ein künftiges OBS-Update könnte diese Sperre mitbringen. Dann käme `/token` nicht mehr an, und das Widget bliebe bei „Auth-Server nicht erreichbar!“. Robuste Lösung: Widgets vom Auth-Server selbst ausliefern (`http://localhost:3000/…`), dann gilt die Sperre nicht. Diagnose: OBS mit `--remote-debugging-port=9222` starten und die Konsole der Browser-Source unter `http://localhost:9222` öffnen.
5. **Token-Erneuerung bei 401:** Der Server erneuert den Token nur kurz vor Ablauf. Meldet das Widget einen 401, bekommt es deshalb unter Umständen denselben Token zurück (Server-Repository).

## Erledigt in 0.8.2
- IDs vom Auth-Server: `/token` liefert `client_id` und `broadcaster_id`, im HTML stehen keine IDs mehr.
- Cache-Schutz: nur noch ein Token-Abruf beim Start (mit `cache: 'no-store'`), Server sendet `Cache-Control: no-store`.
- Sicherheitslücke `/token`: Der Server gibt den Token nur noch lokal und nur an erlaubte Browser-Herkünfte heraus (Details im Server-Repository, ADR 0013).

## Technisch prüfen
1. **Länge der Chat-Nachricht:** Bei sehr langen Umfragetiteln oder Optionsnamen kann die Ergebnisnachricht das Twitch-Limit überschreiten. Im Widget gibt es keine Längenbegrenzung. Keine automatische Textänderung ohne Auftrag.
2. **Body-Klasse `vc-init`:** Herkunft unbekannt, im Widget ohne eigene CSS-/JS-Verwendung. Vermutlich ein Überbleibsel einer Browser-Erweiterung beim Speichern der Seite (ebenso `data-lt-installed` am `<html>`-Tag). Kein Änderungsauftrag; eine Entfernung wäre separat zu prüfen.

## Bekannte Implementierungsdetails
- Der feste Ausblend-Delay und die optionsabhängigen Animations-Delays sind unterschiedlich. Das bestehende Timing ist akzeptiert; keine ungefragte Änderung.
- Der Chat-Versand loggt Fehler, `is_sent=false` und den Nachrichtentext zum manuellen Posten. Wiederholt wird nur einmal nach Token-Erneuerung (401/403).
- 0.8.1 und 0.8.2 sind noch nicht im Live-Stream erprobt.

## Geklärt
- Benötigte Scopes sind im Auth-Server vorhanden.
- Web Audio reicht als Sound; Versandzeitpunkt und Nullstimmen-Gleichstand sind bestätigt.
- Die bestehende Architektur bleibt; frühere Alternativen werden nicht rekonstruiert.
- Die aktuelle Animation ist fehlerfrei; historische Probleme stehen nur in `BUGS.md`.
- Alte Versionen sind nicht mehr zuordenbar: akzeptierte historische Lücke.

## Abgrenzung
TTF („Text To Fritz“, früherer TTS-Entwurf) gehört nicht zum Poll-Widget und wird hier nicht als Feature geführt.
