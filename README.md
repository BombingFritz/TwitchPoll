# SpargelPoll

SpargelPoll zeigt Twitch-Umfragen in einer OBS-Browser-Source als Spargelstangen, die aus dem Gras wachsen. Am Ende klappt ein Ergebnis-Banner auf, der Sieger wird hervorgehoben, ein kurzes „Tadaaa“ ertönt und der Server schreibt eine Ergebnisnachricht in den Twitch-Chat.

Das Widget ist eine einzelne HTML-Datei (`SpargelPoll.html`) mit eingebettetem CSS, JavaScript und drei PNG-Grafiken. Es gibt keinen Build-Schritt und keine Laufzeit-Abhängigkeiten; Playwright braucht nur der Test.

> Früherer Projektname: StablePolln.

## Features

- Holt den Stand der Umfrage beim Server (alle 5 s ohne Umfrage, alle 2 s während einer Umfrage); Twitch fragt nur der Server.
- Eine Spargelstange pro Antwortoption, stufenlos so lang wie ihr Anteil; Stimmenänderungen gleiten weich nach, Prozentzahlen zählen mit.
- Statusschild mit Restzeit („Läuft 0:42“), pulsiert in den letzten 15 s, rot in den letzten 10 s.
- Endsequenz ohne Neuaufbau: Ergebnis-Banner über der Frage, Sieger mit Schein und Strahlenkranz, übrige abgedunkelt; bei Gleichstand ein grünes Banner.
- Ergebnis-Sound per Web Audio API, genau einmal je Umfrage-Ende.
- Ergebnisnachricht im Chat („Den längsten Spargel hat …“ bzw. Gleichstand), gesendet vom Server beim Ende der Umfrage.
- Blendet sich ohne aktive Umfrage automatisch aus.

## Demo und Design-Vergleich

`demo.html` im Browser öffnen: Das echte Widget läuft mit erfundenen Abstimmungen, ohne Auth-Server, ohne Twitch und ohne Chat. Beispiele: zwei Optionen mit Führungswechsel, vier Optionen, fünf mit langen Namen, Gleichstand, 0:0, 100 % und Abbruch, einzeln oder reihum. Dazu Anzeige wie im Stream oder dauerhaft, verschiedene Hintergründe und eine Zeitleiste.

Für Design-Entwürfe eine Kopie von `SpargelPoll.html` anlegen und ändern, z. B. `entwuerfe/SpargelPoll-b.html`, und den Pfad in `demo.html` unter „Entwurf zum Vergleich“ eintragen. Beide Fassungen laufen dann nebeneinander mit derselben Abstimmung.

Direkt im Widget: `SpargelPoll.html?demo=1` (reihum) oder `?demo=zwei|vier|fuenf|gleich|null|hundert|abbruch`, mit `&always=1` dauerhaft sichtbar. Damit lässt sich die Quelle in OBS auch ohne echte Abstimmung platzieren; danach die Parameter wieder entfernen.

## Voraussetzungen

- OBS (Browser-Source) oder ein aktueller Browser.
- Der lokale Auth-Server [Twitch Companion JS server](https://github.com/BombingFritz/Twitch-Companion-JS-server), Stand ab `main` `ebbb62b` (14.11.2026, noch in keinem Release): `GET /token` sowie `GET /api/twitch/poll/current` und die Ergebniszeile der Abstimmung (Schalter `results poll`).
- Mit einem älteren Server (ab dem Stand mit `client_id` in `/token`) läuft das Widget auch: Es fragt die Umfrage dann selbst bei Twitch ab. Die Ergebnisnachricht sendet es nur, wenn `WIDGET_CHAT_MESSAGE: true` gesetzt ist. Dafür braucht der Token die Scopes `channel:read:polls` (oder `channel:manage:polls`) und `user:write:chat`.

## Einrichtung

1. Auth-Server starten.
2. In OBS eine Browser-Source anlegen, **„Lokale Datei“ nicht anhaken**, sondern als URL den Dateipfad mit `file:///` eintragen, z. B.
   `file:///C:/Pfad/zu/SpargelPoll/SpargelPoll.html` (Leerzeichen als `%20`). Breite 800, Höhe 600.
   Im HTML muss nichts eingetragen werden: Token und IDs kommen vom Auth-Server.
   Hintergrund: Neuere OBS-Versionen sperren Anfragen von Seiten, die über „Lokale Datei“ geladen werden (`http://absolute/…`), an `localhost`. Das Widget erreicht den Auth-Server dann nicht (siehe `docs/BUGS.md`).
3. Beim Test im normalen Browser einmal in die Seite klicken, damit der Browser Audio freigibt.
4. In der Server-Konsole erscheint beim ersten Abruf `[Token] Ausgabe an Widget-Herkunft: …`. Daran sieht man, dass das Widget den Server erreicht.
5. Ergebnisnachricht: Sobald diese Version in OBS läuft, am Server `results poll on` (Konsole) bzw. in der Webkonsole unter „Einstellungen“ → „Ergebniszeilen im Chat“ einschalten. Das Widget sendet selbst nicht; so kommt die Zeile nicht doppelt.

## Test

`npm install`, danach `npm test` (entspricht `node test/widget-test.js`): prüft den Ablauf im Headless-Chromium gegen nachgebildeten Server und Twitch, mit künstlicher Uhr. Ergebnis: `0 FAIL`. Echter Server, OBS und Chat sind damit nicht geprüft.

Optional: In `CONFIG` lassen sich `CLIENT_ID`, `BROADCASTER_ID` und `TOKEN_ENDPOINT` manuell setzen; manuelle IDs haben Vorrang vor denen des Servers. Eine solche Kopie als `SpargelPoll.local.html` speichern, diese Endung ist per `.gitignore` von Commits ausgeschlossen. Echte IDs gehören nie ins Repository.

## Versionierung

- Versionen werden als Git-Tags `vMAJOR.MINOR.PATCH` vergeben und im [CHANGELOG](CHANGELOG.md) beschrieben.
- Der Dateiname bleibt immer `SpargelPoll.html`. Keine Versionsnummern im Dateinamen, damit der OBS-Pfad gleich bleibt.
- Ältere Stände sind über die Tags erreichbar. Frühere Dateien vor 0.8.0 sind nicht mehr sauber zuordenbar; der alte Animationstest liegt im Branch `archiv/animationstest-2026-04`.

## Dokumentation

- [Architektur](docs/ARCHITEKTUR.md)
- [Architekturentscheidungen (ADRs)](docs/adr/)
- [Feature-Specs](docs/specs/)
- [Bekannte Bugs und historische Probleme](docs/BUGS.md)
- [Offene Punkte](docs/OFFEN.md)
- [Regeln für KI-Assistenten](AGENTS.md)

## Lizenz

[MIT](LICENSE)
