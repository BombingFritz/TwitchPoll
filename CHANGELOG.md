# Changelog

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach [Semantic Versioning](https://semver.org/lang/de/).
Frühere Dateistände vor 0.8.0 (u. a. „v7“, „v8“, „StablePolln_v7f“) sind nicht mehr zuverlässig zuordenbar und erhalten keine nachträglichen Versionsnummern.

## [Unreleased]

## [1.0.0] - 2026-11-16

Design-Update (ADR 0010). Als Entwurf in `demo.html` neben 0.9.5 verglichen und vom Nutzer abgenommen. Geprüft mit `npm test` (73 Prüfungen, 0 FAIL) und Screenshots aller Demo-Beispiele im Headless-Chromium; nicht in OBS, nicht im Stream. OBS-Pfad und Quellgröße 800 × 600 bleiben gleich, Server-Anbindung, Ergebnislogik, Ton und Chat unverändert.

### Changed
- Spargelstangen wachsen stufenlos nach Prozent statt in Stücken je 10 Prozent und gleiten bei Änderungen weich nach, mit leichtem Nachfedern; Prozentzahlen zählen mit.
- Je Option eine Spalte mit Stange, Prozent, Stimmen und Name auf einer gemeinsamen Bodenlinie; Namen höchstens zwei Zeilen.
- Endsequenz ohne Neuaufbau: Die Stangen bleiben stehen, nach 1,4 s klappt ein Ergebnis-Banner über die Frage (gold „Ergebnis“, grün „Gleichstand“); Sieger mit Schein und drehendem Strahlenkranz, übrige abgedunkelt. Statt 3 s Vollbild-Overlay. Anzeige danach 8 s.
- Gestaltung nach SpargelWette: dünnerer Rahmen mit runden Ecken, durchscheinender Hintergrund, Kennung „Abstimmung“, Frage höchstens zwei Zeilen, Ein- und Ausblenden mit Gleiten.
- Statusschild „Läuft m:ss“ oben rechts statt des schwebenden Timers; pulsiert in den letzten 15 s, rot in den letzten 10 s, am Ende „Beendet“.
- Gras in zwei Ebenen: Wiese mit Textur hinter der Beschriftung, Halmsaum vor den Stangenfüßen; die Stangen wachsen aus dem Gras.
- „1 Stimme“ statt „1 Stimmen“. Keine Emojis mehr im Bild.
- Einstellung `ENDED_OVERLAY_DURATION` entfällt; neu `END_SETTLE_MS` (1400). `RESULT_DISPLAY_DURATION` 8000 statt 7000.

### Fixed
- Heller Saum um die Spargelstangen: Spitze und Mittelstück einmalig bereinigt, Mittelstück nahtlos wiederholbar; Logo unverändert (Prüfsummen in `docs/ARCHITEKTUR.md`).
- Rahmen rechts abgeschnitten, längste Stange ragte ins Gras, „Sekunden“ unlesbar, Timer über langen Fragen.
- Antwortnamen werden als Text gesetzt statt als HTML.

### Removed
- Überbleibsel `vc-init` und `data-lt-installed` im HTML.

### Dokumentiert
- ADR 0010; Specs `visualisierung`, `ergebnisanzeige`, `countdown`, `sichtbarkeit`; `AGENTS.md` (Grafiken einmalig bereinigt, danach wieder unverändert); ARCHITEKTUR, BUGS, OFFEN, README, `demo.html`.
- Testreihe zählt Endsequenzen unabhängig von der Darstellung und prüft per `WIDGET=<Pfad>` auch Entwürfe; neue Prüfungen für Banner, Hervorhebung, Endsequenz ohne Neuaufbau und Statusschild.

## [0.9.5] - 2026-11-15

Vorschau-Werkzeug für das Design-Update (Versionsplan in `docs/OFFEN.md`). Geprüft mit `npm test` (64 Prüfungen, 0 FAIL) und Screenshots von `demo.html` im Headless-Chromium; nicht in OBS.

### Added
- Demo-Modus im Widget: `SpargelPoll.html?demo=1` (reihum) oder `?demo=zwei|vier|fuenf|gleich|null|hundert|abbruch`, dazu `&always=1`. Synthetische Abstimmungen ohne Auth-Server, ohne Twitch und ohne Chat (Spec `demo.md`).
- `demo.html`: Vorführ- und Vergleichsseite mit Beispielen, Anzeige wie im Stream oder dauerhaft, Hintergründen (Spielszene, hell, Transparenz, Grün), Zeitleiste und einem Entwurf zum Vergleich nebeneinander.

### Fixed
- Mit `AUTO_HIDE: false` blieb das Widget unsichtbar; jetzt ist es dauerhaft sichtbar.

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
