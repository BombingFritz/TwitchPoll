# Offene Punkte

## Technisch prüfen
1. **Länge der Chat-Nachricht:** Bei sehr langen Umfragetiteln oder Optionsnamen kann die Ergebnisnachricht das Twitch-Limit überschreiten. Im Widget gibt es keine Längenbegrenzung. Keine automatische Textänderung ohne Auftrag.
2. **Body-Klasse `vc-init`:** Herkunft unbekannt, im Widget ohne eigene CSS-/JS-Verwendung. Vermutlich ein Überbleibsel einer Browser-Erweiterung beim Speichern der Seite (ebenso `data-lt-installed` am `<html>`-Tag). Kein Änderungsauftrag; eine Entfernung wäre separat zu prüfen.

## Bekannte Implementierungsdetails
- `init()` lädt den Token zweimal (einmal im Inline-Block, einmal über `fetchAccessToken()`). Kein bestätigter Laufzeitfehler.
- Der feste Ausblend-Delay und die optionsabhängigen Animations-Delays sind unterschiedlich. Das bestehende Timing ist akzeptiert; keine ungefragte Änderung.
- Der Chat-Versand loggt Fehler und `is_sent=false`, wiederholt aber nicht automatisch.

## Geklärt
- Benötigte Scopes sind im Auth-Server vorhanden.
- Web Audio reicht als Sound; Versandzeitpunkt und Nullstimmen-Gleichstand sind bestätigt.
- Die bestehende Architektur bleibt; frühere Alternativen werden nicht rekonstruiert.
- Die aktuelle Animation ist fehlerfrei; historische Probleme stehen nur in `BUGS.md`.
- Alte Versionen sind nicht mehr zuordenbar: akzeptierte historische Lücke.

## Abgrenzung
TTF („Text To Fritz“, früherer TTS-Entwurf) gehört nicht zum Poll-Widget und wird hier nicht als Feature geführt.
