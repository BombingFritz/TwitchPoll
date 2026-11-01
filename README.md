# SpargelPoll

SpargelPoll zeigt Twitch-Umfragen in einer OBS-Browser-Source als wachsende Spargelstangen. Am Ende der Umfrage ertönt ein kurzes „Tadaaa“, der Sieger wird hervorgehoben und eine Ergebnisnachricht landet automatisch im Twitch-Chat.

Das Widget ist eine einzelne HTML-Datei (`SpargelPoll.html`) mit eingebettetem CSS, JavaScript und drei PNG-Grafiken. Es gibt keinen Build-Schritt und keine Abhängigkeiten.

> Früherer Projektname: StablePolln.

## Features

- Erkennt aktive Twitch-Umfragen per REST-Abfrage (alle 5 s ohne Umfrage, alle 2 s während einer Umfrage).
- Eine Spargelstange pro Antwortoption, ein Spargel-Segment je 10 Prozent; Stimmenänderungen wachsen ruhig nach, statt neu aufgebaut zu werden.
- Countdown bis zum Ende der Umfrage.
- Endsequenz: „Umfrage beendet“-Overlay, Siegerbanner mit Strahlenkranz bzw. Gleichstand-Banner.
- Ergebnis-Sound per Web Audio API, genau einmal je Umfrage-Ende.
- Ergebnisnachricht per Twitch-API in den Chat („Den längsten Spargel hat …“ bzw. Gleichstand).
- Blendet sich ohne aktive Umfrage automatisch aus.

## Voraussetzungen

- OBS (Browser-Source) oder ein aktueller Browser.
- Der lokale Auth-Server [Twitch Companion JS server](https://github.com/BombingFritz/Twitch-Companion-JS-server). Er liefert unter `GET http://localhost:3000/token` Access-Token, Client-ID und Broadcaster-ID. Das Widget braucht dafür einen Server-Stand, der `client_id` mitliefert.
- Der Token des Auth-Servers braucht mindestens die Scopes `channel:read:polls` (oder `channel:manage:polls`) und `user:write:chat`.

## Einrichtung

1. Auth-Server starten.
2. In OBS eine Browser-Source anlegen, **„Lokale Datei“ nicht anhaken**, sondern als URL den Dateipfad mit `file:///` eintragen, z. B.
   `file:///C:/Pfad/zu/SpargelPoll/SpargelPoll.html` (Leerzeichen als `%20`). Breite 800, Höhe 600.
   Im HTML muss nichts eingetragen werden: Token und IDs kommen vom Auth-Server.
   Hintergrund: Neuere OBS-Versionen sperren Anfragen von Seiten, die über „Lokale Datei“ geladen werden (`http://absolute/…`), an `localhost`. Das Widget erreicht den Auth-Server dann nicht (siehe `docs/BUGS.md`).
3. Beim Test im normalen Browser einmal in die Seite klicken, damit der Browser Audio freigibt.
4. In der Server-Konsole erscheint beim ersten Abruf `[Token] Ausgabe an Widget-Herkunft: …`. Daran sieht man, dass das Widget den Server erreicht.

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
