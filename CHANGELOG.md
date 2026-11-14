# Changelog

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach [Semantic Versioning](https://semver.org/lang/de/).
Frühere Dateistände vor 0.8.0 (u. a. „v7“, „v8“, „StablePolln_v7f“) sind nicht mehr zuverlässig zuordenbar und erhalten keine nachträglichen Versionsnummern.

## [Unreleased]

## [0.9.0] - 2026-11-14

Umstellung auf die Server-Endpunkte (Server-Grundsatz „nur der Server fragt Twitch“, dort ADR 0023, Issue #50; hier ADR 0009, Issue #3). Braucht Server-`main` ab `ebbb62b`. Geprüft mit `npm test` (48 Prüfungen, 0 FAIL) gegen nachgebildeten Server und Twitch; nicht gegen den echten Server, nicht in OBS.

**Wichtig:** Nach dem Update am Server `results poll on` einschalten, sonst erscheint keine Ergebnisnachricht im Chat.

### Changed
- Den Stand der Abstimmung holt das Widget beim Server (`GET /api/twitch/poll/current`) statt bei Twitch (`GET /helix/polls`). Takt, Darstellung, Timer, Overlay, Sound und Animation unverändert.
- Die Ergebnisnachricht sendet der Server beim Ende der Abstimmung, nicht mehr das Widget bei Overlay-Ende (vom Nutzer bestätigt). Das Widget schreibt den Text nur noch ins Browser-Log.
- Statuspunkt zeigt den Erfolg der letzten Abfrage (grün/rot) statt nur den erfolgreichen Start.

### Added
- Rückfall für ältere Server: Kennt der Server die Adresse nicht (404), fragt das Widget bis zum Neuladen selbst bei Twitch.
- `WIDGET_CHAT_MESSAGE` (Vorgabe `false`): Widget sendet die Ergebnisnachricht selbst, nur für Server ohne Ergebniszeilen.
- Ohne gültigen Stand (Server kurz weg, `WAITING` nach Server-Neustart) bleibt die angezeigte Abstimmung stehen; ohne Ende blendet das Widget 30 s nach Ablauf der Zeit aus (`STALE_GRACE_MS`).
- Ablauftest `test/widget-test.js` (Playwright) und `package.json` mit `npm test`.

### Dokumentiert
- ADR 0009 löst ADR 0002 und 0005 ab; `AGENTS.md`, Specs `twitch-anbindung`, `chat-nachricht`, `countdown`, `sichtbarkeit` und Abschnitt „Integration mit dem Server“ angepasst.

### Dokumentiert
- Arbeitsregeln für die Zusammenarbeit mit dem Server: Schreibgrenze (Server-Repository nur lesen, Bedarf als Issue), Umgang mit Serverbedarf und Blockern, Freigabe zur Integration (`AGENTS.md`). `CLAUDE.md` bindet `AGENTS.md` ein.
- Abschnitt „Integration mit dem Server“ in `docs/ARCHITEKTUR.md` mit Verträgen, geprüftem Serverstand, Legacy-Ausnahmen und Teststatus.
- Vorlagen für Pull Requests und Integrations-Issues unter `.github/`.
- Live-Test von 0.8.2 im Stream bestätigt; Versionsplan 0.9, 0.9.5, 1.0 in `docs/OFFEN.md`.

## [0.8.2] - 2026-11-01

Braucht den Auth-Server-Stand mit `client_id` in `/token` (Twitch Companion JS server, Zugriffsschutz laut dessen ADR 0013). Im Headless-Browser gegen einen Test-Server und eine simulierte Twitch-API geprüft, in OBS per `file:///`-URL getestet; noch nicht im Live-Stream erprobt.

**Wichtig:** In OBS nicht mehr „Lokale Datei“ verwenden, sondern die URL `file:///…/SpargelPoll.html`. Neuere OBS-Versionen sperren sonst den Zugriff auf den Auth-Server (siehe `docs/BUGS.md`).

### Changed
- Client-ID und Broadcaster-ID kommen vom Auth-Server (`/token`). In `CONFIG` stehen keine IDs mehr; manuell eingetragene IDs haben weiterhin Vorrang.

### Fixed
- Beim Start wird der Token nur noch einmal und ohne Browser-Cache abgerufen (`cache: 'no-store'`). Vorher gab es einen zweiten Abruf ohne diesen Schutz.

### Added
- `WIDGET_VERSION`: Das Widget loggt beim Start seine Version, um zu prüfen, welche Datei OBS geladen hat.
- Klare Konsolenmeldung, wenn der Auth-Server keine `client_id` liefert.

### Security
- Gegenstück im Auth-Server: `/token` nur noch für lokale Aufrufe und erlaubte Browser-Herkünfte, Antworten mit `Cache-Control: no-store`.

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
