# Changelog

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach [Semantic Versioning](https://semver.org/lang/de/).
Frühere Dateistände vor 0.8.0 (u. a. „v7“, „v8“, „StablePolln_v7f“) sind nicht mehr zuverlässig zuordenbar und erhalten keine nachträglichen Versionsnummern.

## [0.8.1] - 2026-11-01

Entspricht der lokal als `polling-soundChat3.html` geführten Datei, mit Platzhaltern statt echter IDs. Noch nicht im Live-Stream erprobt.

### Added
- Automatischer Neustart, wenn der Auth-Server beim Start nicht erreichbar ist (nach 10 s, 30 s, danach alle 60 s).
- Bei HTTP 401/403 von Twitch holt das Widget einen neuen Token und wiederholt Poll-Abfrage bzw. Chat-Versand einmal (höchstens eine Erneuerung je 30 s).
- Schlägt der Chat-Versand fehl, steht der Nachrichtentext zum manuellen Posten in der Konsole.
- ADR 0007 zur Token-Erneuerung; Plan für 0.8.2 in `docs/OFFEN.md`.

## [0.8.0] - 2026-11-01

Erste sauber versionierte Fassung. Entspricht der zuvor lokal als `polling-soundChat2.html` geführten, im Stream erprobten Datei; Client-ID und Broadcaster-ID sind durch Platzhalter ersetzt.

### Added
- Ergebnis-Sound („Tadaaa“) per Web Audio mit gemeinsamem AudioContext und Einmal-Trigger je Umfrage-Ende.
- Ergebnistext für Sieger/Gleichstand und Versand in den Chat per Helix-API.
- Dokumentation: Architektur, ADRs, Feature-Specs, Bugs, offene Punkte, Regeln für KI-Assistenten.

### Changed
- Dateiname vereinheitlicht: `SpargelPoll.html` (ohne Versionsnummer).
- Poll-Daten per REST-Polling statt EventSub/WebSocket (historisch).
- Spargelstangen werden segmentweise aufgebaut und bei Stimmenänderungen nur differenziell aktualisiert.

### Fixed (historisch berichtet)
- Countdown wird aus `started_at` + `duration` berechnet.
- Siegesanimation startet erst nach dem Wachstum; Strahlenkranz sitzt am Sieger.
- Gleichstand wird eindeutig erkannt (kein „erster Treffer“ als Sieger).
- Unruhige/springende Animation durch zu häufige Neuaufbauten.

### Removed
- EventSub-/WebSocket-Anbindung im Widget.
