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
- Eine Twitch-App (Client-ID) und ein lokaler Auth-Server, der unter `GET http://localhost:3000/token` ein JSON mit `access_token` liefert. Der Server ist ein separates Projekt und nicht Teil dieses Repositorys.
- Der Token des Auth-Servers braucht mindestens die Scopes `channel:read:polls` (oder `channel:manage:polls`) und `user:write:chat`.

## Einrichtung

1. `SpargelPoll.html` kopieren, z. B. als `SpargelPoll.local.html` (diese Endung ist per `.gitignore` von Commits ausgeschlossen).
2. In der Kopie im Block `CONFIG` die `CLIENT_ID` eintragen.
   `BROADCASTER_ID` kann auf dem Platzhalter bleiben: Das Widget ermittelt die ID dann selbst über den Token.
   Bei Bedarf `TOKEN_ENDPOINT` anpassen. `ACCESS_TOKEN` bleibt leer.
3. Auth-Server starten.
4. In OBS eine Browser-Source anlegen: „Lokale Datei“, Breite 800, Höhe 600.
5. Beim Test im normalen Browser einmal in die Seite klicken, damit der Browser Audio freigibt.

Echte IDs gehören nie ins Repository, nur Platzhalter.

## Versionierung

- Versionen werden als Git-Tags `vMAJOR.MINOR.PATCH` vergeben und im [CHANGELOG](CHANGELOG.md) beschrieben.
- Der Dateiname bleibt immer `SpargelPoll.html`. Keine Versionsnummern im Dateinamen, damit der OBS-Pfad gleich bleibt.
- Ältere Stände sind über die Tags erreichbar. Frühere Dateien vor 0.8.0 sind nicht mehr sauber zuordenbar; der alte Animationstest liegt unter dem Tag `archiv/animationstest-2026-04`.

## Dokumentation

- [Architektur](docs/ARCHITEKTUR.md)
- [Architekturentscheidungen (ADRs)](docs/adr/)
- [Feature-Specs](docs/specs/)
- [Bekannte Bugs und historische Probleme](docs/BUGS.md)
- [Offene Punkte](docs/OFFEN.md)
- [Regeln für KI-Assistenten](AGENTS.md)

## Lizenz

[MIT](LICENSE)
