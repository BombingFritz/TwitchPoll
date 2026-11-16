# Offene Punkte

## Versionsplan (Nutzer, 14.11.2026)
0.8.2 ist der letzte stabile, veröffentlichte Stand; ein eigenes Release „1.0“ dafür entfällt.

1. **0.9 – Anbindung an den Server:** umgesetzt in 0.9.0 (ADR 0009, Issue #3); reale Abnahme offen (siehe Issue #3).
   - **Später:** Das Widget holt beim Start weiter den Token über `/token`, braucht ihn aber nur noch für die Legacy-Wege. Ob es im Normalbetrieb ohne Token auskommen soll, hängt mit dem Widget-Schlüssel im Server zusammen (Server-Issue #57) [UNGEKLÄRT].
   - **Ziel im Zuge dieser Anbindung (später):** ein Debug-Modus für ausführlichere Tests, der sich über die Einstellungen des Servers (Webkonsole) an- und abschalten lässt. Vorbild: Debug-Modus des Wett-Widgets (`BombingFritz/TwitchPredictionWidget`, dort ADR 0004) und Testmodus der Intro-Topics im Server. Schnittstelle zum Server [UNGEKLÄRT].
2. **0.9.5 – Vorschau-Werkzeug:** umgesetzt in 0.9.5: `demo.html` und Demo-Modus `?demo=…` (Spec `demo.md`), mit Vergleich eines Entwurfs.
3. **1.0 – Design-Update:** umgesetzt in 1.0.0 (ADR 0010); Erprobung im Stream offen.

## Beobachtungen für das Design-Update (Claude, 14.11.2026) – erledigt in 1.0.0, siehe BUGS.md
Noch nicht in OBS geprüft; Impact fehlte im Testsystem.
- Rechter Rand abgeschnitten: `body` hat den Standardabstand von 8 px, der Rahmen von 8 px liegt außerhalb der 800 px; Rahmen und Statuspunkt rechts fehlen teilweise.
- Beschriftung „Sekunden“ (`timer-label`) hat keinen eigenen Stil und ist schwarz auf dunklem Grund.
- Timer ist absolut positioniert und kann lange Fragen überdecken.
- Die längste Stange reicht bis ins Gras, kürzere enden darüber.
- Antwortnamen und Frage gehen ungeschützt in `innerHTML`; Zeichen wie `<` stören die Anzeige.
- ~~Kein Demo-Modus und kein automatischer Test~~: Test seit 0.9.0, Demo seit 0.9.5.

## Nach 0.8.2 zu prüfen
1. **Live-Test im Stream:** erledigt. 0.8.2 lief im Stream mit echter Abstimmung, Endsequenz und Chat-Nachricht und hat funktioniert (Nutzer, 14.11.2026; Datum des Streams nicht festgehalten).
2. **Andere Widgets (geprüft 01.11.2026):** Coinflip war ebenfalls betroffen und ist auf `file:///`-URL umgestellt. Enigma ist nicht betroffen: Es fragt nichts bei `localhost` an, und die Sperre greift nur bei solchen Anfragen, nicht beim Laden der Datei.
3. **Option für später: Widgets vom Auth-Server ausliefern** (`http://localhost:3000/widgets/…`). Bewusst noch nicht umgesetzt. Abwägung:
   - Vorteile: Seite und Server haben dieselbe Herkunft, damit greift keine Chromium-Sperre und CORS ist für Widgets unnötig. Die Herkünfte `null` und `http://absolute` könnten aus der Erlaubt-Liste entfallen. Der Server kann Caching der HTML-Dateien verhindern, sodass OBS immer die aktuelle Version lädt. Einheitliche Adressen für alle Widgets, später direkt aus dem Git-Klon.
   - Nachteile: Ohne laufenden Server lädt OBS die Seite gar nicht, und die Start-Wiederholung im Widget hilft dann nicht. Nach einem Serverabsturz müssten die Quellen in OBS neu geladen werden. Der Server bekommt eine weitere Aufgabe (Dateien ausliefern, Widget-Ordner per `.env`, der nie der Server-Ordner sein darf). Jede Browser-Source muss umgestellt werden. Widgets und Server werden enger gekoppelt.
   - Auslöser zum Umsetzen: Ein OBS-Update sperrt auch `file://`, oder die Restlücke durch die Herkunft `null` soll geschlossen werden.
4. **`file:///`-URL als Dauerlösung:** Funktioniert ohne Strukturänderung und das Widget verbindet sich nach einem Server-Neustart selbst wieder. Nachteile: Der Server muss die Herkunft `null` erlauben, die auch abgeschottete iframes fremder Seiten senden (kleine Restlücke). Chromium schränkt `file://` schrittweise ein, ein OBS-Update kann das wieder brechen. Der Pfad wird von Hand eingetragen (keine Dateiauswahl, Leerzeichen als `%20`).
5. **Diagnose bei Startproblemen:** Kommt in der Server-Konsole keine `/token`-Anfrage an, liegt es am Browser, nicht am Server. Genaue Fehlermeldung: OBS mit `--remote-debugging-port=9222` starten und die Konsole der Browser-Source unter `http://localhost:9222` öffnen (bei der Sperre: „more-private address space `loopback`“).
6. **Token-Erneuerung bei 401:** überholt durch Server-ADR 0024 (Server erneuert 10 min vor Ablauf, `/token` mit `expires_at`); siehe ARCHITEKTUR, Abschnitt „Auth-Server“.

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
- 0.8.2 läuft in OBS (per `file:///`-URL) und ist im Stream erprobt (Nutzer, 14.11.2026).

## Geklärt
- Benötigte Scopes sind im Auth-Server vorhanden.
- Web Audio reicht als Sound; Versandzeitpunkt und Nullstimmen-Gleichstand sind bestätigt.
- Die bestehende Architektur bleibt; frühere Alternativen werden nicht rekonstruiert.
- Die aktuelle Animation ist fehlerfrei; historische Probleme stehen nur in `BUGS.md`.
- Alte Versionen sind nicht mehr zuordenbar: akzeptierte historische Lücke.

## Abgrenzung
TTF („Text To Fritz“, früherer TTS-Entwurf) gehört nicht zum Poll-Widget und wird hier nicht als Feature geführt.
