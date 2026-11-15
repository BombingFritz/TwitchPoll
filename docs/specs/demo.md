# Demo-Modus und Vergleichsseite

## Ziel
Design und Ablauf ohne Auth-Server, Twitch und echte Abstimmung ansehen und Design-Entwürfe nebeneinander mit dem aktuellen Stand vergleichen (Versionsplan 0.9.5, Nutzer 14./15.11.2026).

## Verhalten
- **Widget:** `SpargelPoll.html?demo=<Beispiel>` liefert synthetische Abstimmungen in der Form von `GET /api/twitch/poll/current` (`demoPoll`). Kein Token-Abruf, keine Anfrage an Server oder Twitch, keine Chat-Nachricht. Alles Übrige (Abfrage-Takt, Darstellung, Endsequenz, Ton) läuft wie im Betrieb.
- **Beispiele:** `zwei` (Führungswechsel), `vier` (klarer Favorit), `fuenf` (lange Namen und lange Frage), `gleich` (Gleichstand mit Stimmen), `null` (0:0), `hundert` (100 %), `abbruch` (TERMINATED nach 27 s); jeder andere Wert (z. B. `1`) geht die Beispiele reihum durch.
- **Ablauf je Runde (90 s):** Start bei 3 s, Laufzeit 45 s, Ende `COMPLETED` (bzw. `TERMINATED`), 10 s später `ARCHIVED`, danach Pause. Die Stimmen folgen festen Stützpunkten, jede Runde ist gleich.
- **`?always=1`:** schaltet `AUTO_HIDE` aus; das Widget bleibt sichtbar, auch zum Einrichten in OBS.
- **`demo.html`:** bindet das Widget per iframe in einer Bühne im Format der OBS-Quelle (800 × 600, skaliert) ein. Auswahl von Beispiel, Anzeige (wie im Stream oder immer sichtbar) und Hintergrund (Spielszene, hell, Transparenz-Raster, Grün), Zeitleiste der Runde. Ein Entwurf (Pfad relativ zu `demo.html`, z. B. eine geänderte Kopie von `SpargelPoll.html`) läuft auf Wunsch mit denselben Parametern daneben. Die Auswahl merkt sich der Browser (`localStorage`, nur Komfort).

## Nicht-Ziele
- Zeitraffer oder Pause in der Demo.
- Anzeige eines „DEMO“-Hinweises im Bild (stört beim Vergleich von Entwürfen; der Modus steht in der URL und im Browser-Log).
- Ablage von Entwürfen im Repository ohne Auftrag.

## Akzeptanzkriterien
- Im Demo-Modus geht keine Anfrage an `localhost:3000` oder Twitch, und es wird nichts gesendet.
- Jedes Beispiel zeigt Start, Wachstum, Endsequenz und Ausblenden; `ARCHIVED` löst keine zweite Endsequenz aus, der Ton kommt einmal.
- `null` und `gleich` zeigen das Gleichstand-Banner ohne Sieger-Styling.
- `?always=1` hält das Widget sichtbar.
- `demo.html` lädt ohne Skriptfehler und ohne Anfragen nach außen; ohne Entwurf zeigt sie ein Widget.

## Berührte Dateien/Funktionen
`SpargelPoll.html`: `DEMO`, `DEMO_SCENARIOS`, `demoPoll`, `demoVotes`, `init`, `fetchCurrentPoll`, `sendChatMessage`. `demo.html`. Test: `test/widget-test.js` (Teile 11–13).

## Status
umgesetzt in 0.9.5. Geprüft im Headless-Browser; in OBS nicht geprüft.
