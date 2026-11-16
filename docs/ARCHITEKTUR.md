# Architektur
## Referenz und Struktur
Referenzdatei: `SpargelPoll.html`. Eine HTML-Datei mit Inline-CSS, DOM und klassischem Script am Body-Ende; direkter Aufruf `init()`. Kein Framework, Paketmanager oder Build im Widget. Ablauftest `test/widget-test.js` (Playwright, nur zum Testen; `package.json` mit `npm test`). `demo.html` (seit 0.9.5) bindet das Widget im Demo-Modus per iframe ein, mit Zeitleiste, Hintergründen und Vergleich mit einem Entwurf; ihre Zeitleiste muss zu `DEMO_*` im Widget passen. Logo, `SPITZE_IMG` und `MITTE_IMG` sind drei eingebettete Base64-PNGs. Seit 1.0 sind Spitze und Mittelstück einmalig bereinigt (ADR 0010): ohne hellen Saum, Mittelstück auf 112 × 79 px zugeschnitten und nahtlos senkrecht wiederholbar. Stand: Spitze `53e05dc9…bf66` (12.127 Bytes), Mittelstück `103a740d…6bed` (5.920 Bytes), Logo `99beb4d2…0d8d` (201.097 Bytes); SHA-256 der dekodierten PNGs.

800×600 px, transparenter Body, durchscheinend dunkler Widget-Hintergrund, grüner Rahmen 5 px mit runden Ecken (Gestaltung angelehnt an SpargelWette). DOM: `widgetContainer` mit `statusIndicator`; Kopf mit Logo, Kennung „Abstimmung“, `pollQuestion` (höchstens zwei Zeilen), Statusschild `statusChip` (`chipLabel`, `timer`) und Ergebnis-Banner `winnerAnnouncement` (`bannerLabel`, `bannerText`), das sich über den Kopf legt; Hauptbereich mit Wiese `grass-area` (hinten), `pollArea` mit je Option einer Spalte `.poll-option` (`.stalk-zone` mit `.winner-tip-deco` und `.stalk` aus `.body` und `.tip`, darunter `.label-group` mit Prozent, Stimmen und Name) und Halmsaum `grass-front` (vor den Stangenfüßen). Die Halme sind SVG im CSS, keine Bilddatei.

## Funktionsbereiche
| Bereich | Funktionen | Aufgabe |
|---|---|---|
| Start/Auth | `init`, `fetchAccessToken`, `applyTokenResponse`, `isConfigured`, `getUserId`, `scheduleInitRetry` | Token und IDs vom Auth-Server übernehmen, Konfiguration prüfen, ggf. Benutzer-ID bestimmen, Polling starten; bei nicht erreichbarem Auth-Server Start später wiederholen |
| Token-Erneuerung | `requestNewToken`, `refreshAccessToken`, `twitchFetchWithRefresh` | Bei HTTP 401/403 neuen Token holen und den Twitch-Aufruf einmal wiederholen |
| Poll-Daten | `checkForActivePoll`, `fetchCurrentPoll`, `fromServerPoll`, `toCurrentPoll`, `keepOrGiveUp`, `warnPollOnce`, `handlePollFromAPI`, `updatePollFromAPI`, `getPollEndsAt` | Stand vom Server holen (Rückfall Helix bei 404), in interne Form bringen, aktive Poll aufbauen/aktualisieren, Endzeit bestimmen; ohne gültigen Stand letzten Stand halten |
| Statusschild | `setChip`, `startTimer`, `stopTimer`, `updateTimer` | „Läuft m:ss“ (Intervall 250 ms), pulsiert ab 15 s, rot ab 10 s; am Ende „Beendet“ |
| Ergebnis | `calculatePercentages`, `findWinner`, `triggerPollEnded` | Prozent, Gewinner-/Gleichstand-Erkennung und Endsequenz |
| Darstellung | `renderPoll`, `buildPoll`, `sameOptions`, `updatePollValues`, `stalkHeight`, `countTo`, `optionKey`, `pollColumns`, `columnFor` | Spalten bei neuer Abstimmung aufbauen, sonst nur Werte setzen: Stangenhöhe über `--h`, Prozent zählen hoch |
| Ergebnis | `showResult`, `resetResult`, `showWinnerAnnouncement`, `hideWinnerAnnouncement` | Ergebnis-Banner (Schrift passt sich langen Namen an), Sieger mit Schein und Strahlenkranz, übrige abgedunkelt |
| Sound | `getSharedAudioContext`, `unlockAudioOnInteraction`, `playResultSound`, `triggerResultSound` | Wiederverwendeter Context, Freigabe, Synthese, Einmal-Guard |
| Chat | `generateResultChatMessage`, `sendChatMessage` | Ergebnistext loggen; Helix-Versand nur mit `WIDGET_CHAT_MESSAGE` (Legacy-Rückfall, ADR 0009) |
| Sichtbarkeit | `showWidget`, `hideWhenNoPoll`, `showNoPoll`, `updateStatus` | Widget-/Leerzustand und Statuspunkt |
| Demo (0.9.5) | `demoPoll`, `demoVotes`, `DEMO_SCENARIOS` | synthetische Abstimmungen in der Form des Server-Endpunkts für `?demo=…` |

## Datenhaltung
Nur flüchtiger JS-Zustand: `currentPoll`, `currentPollId`, `timerInterval`, `pollCheckInterval`, `pollEndTime`, `pollEndedInProgress`, `resultSoundPlayed`, `sharedAudioCtx`, `tokenRefreshPromise`, `lastTokenRefreshAttempt`, `initRetryCount`, `initRetryTimer`, `pollSource` (`server` oder nach 404 `helix`), `lastPollWarning`. Kein Widget-Dateispeicher oder persistenter Poll-Verlauf.
Poll-Modell: `{id, question, options: [{id, name, votes}], ended}`; Prozentfelder werden berechnet.

## Datenfluss und Zeitverhalten
- Demo-Modus (`?demo=1` wechselnd, `?demo=zwei|vier|fuenf|gleich|null|hundert|abbruch` fest, dazu `?always=1`): `init` überspringt Token und Server, `fetchCurrentPoll` liefert `demoPoll()`, `sendChatMessage` sendet nie. Runde von 90 s: Start bei 3 s, Laufzeit 45 s (Abbruch nach 27 s), `ARCHIVED` 10 s nach dem Ende. Es geht keine Anfrage an Server oder Twitch.
- Ist `AUTO_HIDE` aus (auch über `?always=1` im Demo-Modus), ist das Widget von Anfang an dauerhaft sichtbar.
- `init` loggt die Version (`WIDGET_VERSION`), holt Token, Client-ID und Broadcaster-ID einmal über `fetchAccessToken` (mit `cache: 'no-store'`), führt die erste Poll-Abfrage aus und setzt ein Idle-Intervall.
- `applyTokenResponse` übernimmt `access_token` immer, `client_id` und `broadcaster_id` nur, wenn in `CONFIG` kein Wert manuell eingetragen ist. Leere Werte und alte Platzhalter (`DEINE_…`) zählen als nicht eingetragen.
- Fehlt danach die Client-ID (alter Auth-Server ohne `client_id`), bricht der Start mit „Konfiguration fehlt!“ ab. Fehlt nur die Broadcaster-ID, wird sie über `GET /helix/users` aus dem Token ermittelt.
- Schlägt der Token-Abruf fehl, zeigt das Widget „Auth-Server nicht erreichbar!“ und plant über `scheduleInitRetry` einen neuen `init`-Versuch nach 10 s, 30 s und danach alle 60 s. Nach erfolgreichem Start wird der Zähler zurückgesetzt und „Warte auf Abstimmung...“ angezeigt.
- Poll-Abfrage und Chat-Versand laufen über `twitchFetchWithRefresh`: Bei HTTP 401/403 wird über `refreshAccessToken` ein neuer Token vom Auth-Server geholt und der Aufruf genau einmal wiederholt. Parallele Erneuerungen teilen sich einen Request; zwischen zwei Erneuerungen liegen mindestens 30 s. Hat ein paralleler Aufruf den Token schon erneuert, wird nur wiederholt. `getUserId` nutzt diesen Weg nicht.
- `checkForActivePoll` holt über `fetchCurrentPoll` den Stand vom Server (`GET /api/twitch/poll/current`, `cache: 'no-store'`, ADR 0009). `fromServerPoll` bringt ihn in die interne Form (wie Helix: `id`, `title`, `status`, `choices[{id, title, votes}]`, `ends_at`); unbekannte Felder werden ignoriert, ohne `pollId` oder `choices` ist der Stand ungültig. `toCurrentPoll` ist die einzige Abbildung auf `currentPoll`.
- Antwortet der Server mit 404 (älterer Stand), setzt das Widget `pollSource = 'helix'` und fragt bis zum Neuladen selbst `GET /helix/polls` (Legacy-Rückfall, erster Poll der Antwort).
- Neue aktive ID: `handlePollFromAPI`, initiales Rendering, Timer, aktives Intervall. Bekannte aktive Poll: `updatePollFromAPI` → `updatePollValues`.
- Endstatus `COMPLETED`, `TERMINATED`, `ARCHIVED` einer angezeigten Poll startet `triggerPollEnded`; `pollEndedInProgress` verhindert Wiederholung. Ein `ARCHIVED` nach `COMPLETED` derselben Abstimmung trifft entweder die laufende Endsequenz oder ein leeres Widget und löst nichts aus.
- Kein gültiger Stand (Netzwerkfehler, HTTP-Fehler außer 404, ungültige Antwort) oder `WAITING`, während eine Abstimmung angezeigt wird: Der letzte Stand bleibt, die Warnung erscheint einmal, der Statuspunkt wird rot. `keepOrGiveUp` blendet erst aus, wenn die Zeit der Abstimmung seit `STALE_GRACE_MS` abgelaufen ist, ohne Endsequenz. Ohne angezeigte Abstimmung führt `WAITING` zum Ausblenden. Nach jeder erfolgreichen Abfrage ist der Statuspunkt grün.
- Endsequenz (seit 1.0, ADR 0010): Polling stoppen, Schild „Beendet“, Endwerte übernehmen. Die Spalten bleiben stehen; die Stangen gleiten auf den Endstand.
- Nach `END_SETTLE_MS` (1,4 s): `showResult` mit Ergebnis-Banner, Sieger (`.winner`) bzw. Gleichstand, übrige abgedunkelt (`.dim`), dazu `triggerResultSound`. Zugleich Text erzeugen und loggen. Gesendet wird die Zeile vom Server beim Ende der Abstimmung; das Widget sendet nur mit `WIDGET_CHAT_MESSAGE: true`, dann asynchron (nicht awaited) per Helix.
- Nach `RESULT_DISPLAY_DURATION` (8 s) ausblenden und Idle-Polling starten; den Inhalt setzt `showNoPoll` erst nach dem Ausblenden zurück (500 ms), außer es läuft schon die nächste Abstimmung.
- Initialer Aufbau: Spalten um `index*120` ms versetzt einblenden (Gleiten von unten); die Stangen wachsen von 0 auf ihren Wert.
- Stangenhöhe = `STALK_MIN` (46 px, nur die Spitze schaut aus dem Gras) + Anteil × (`STALK_MAX` 300 px − `STALK_MIN`), als CSS-Variable `--h` mit Übergang 0,9 s und leichtem Nachfedern, auch beim Schrumpfen. Prozentzahlen zählen in 0,6 s zum neuen Wert.
- Ein- und Ausblenden des Widgets: Deckkraft und Gleiten von unten (0,45 s).

## Ergebnisberechnung
Prozent = `Math.round(votes/totalVotes*100)`, bei Gesamtzahl 0 jeweils 0. Rundungswerte müssen sich nicht zu 100 summieren.
`findWinner` liefert nur bei eindeutigem Maximum über 0 einen Gewinner; sonst `null`. Alle Optionen mit 0 Stimmen gelten als Gleichstand.
Bis 0.9.5 bestand die Stange aus einem Mittelteil je gerundeten 10 Prozent; seit 1.0 ist die Höhe stufenlos (siehe oben).

## Sound und Chat
Sound: zwei kurze Dreieck-Töne C5/E5 und ein gehaltener Sägezahn-Dreiklang C5–E5–G5. `resultSoundPlayed` verhindert Mehrfachauslösung. `click`, `keydown`, `touchstart`, `pointerdown` versuchen, den AudioContext fortzusetzen. Es gibt kein Audio-Dateiasset.

Chat: Normalfall nennt Sieger und, wenn vorhanden, Zweitplatzierten, sortiert nach Stimmen. Gleichstand nennt alle Optionen mit Höchststimmenzahl, verbunden mit „ sowie “. Textmuster siehe Spec. Versand als Broadcaster; kein zusätzliches Chat-Ausgabefeld im Widget. Nicht erfolgreiche HTTP-Antworten und `is_sent=false` werden geloggt, zusätzlich mit dem Nachrichtentext zum manuellen Posten. Abgesehen von der einmaligen Wiederholung nach Token-Erneuerung (401/403) gibt es kein Retry.

## Schnittstellen
| Ziel | Aufruf | Daten |
|---|---|---|
| Lokaler Auth-Server | `GET http://localhost:3000/token` | JSON-Felder `access_token`, `client_id`, `broadcaster_id` (Stand der Anbindung: Abschnitt „Integration mit dem Server“) |
| Lokaler Auth-Server | `GET http://localhost:3000/api/twitch/poll/current` | `{status: 'WAITING'}` oder `pollId`, `title`, `status`, `choices[{id, title, votes, …}]`, `endsAt`, `startedAt`, `duration`, weitere Felder (Server-Spec) |
| Twitch (Legacy) | `GET https://api.twitch.tv/helix/users` | Benutzer-ID, nur bei passendem Konfigurationsplatzhalter |
| Twitch (Legacy) | `GET https://api.twitch.tv/helix/polls?broadcaster_id=…` | nur nach 404 vom Server |
| Twitch (Legacy) | `POST https://api.twitch.tv/helix/chat/messages` | nur mit `WIDGET_CHAT_MESSAGE: true`; `broadcaster_id`, `sender_id` (beide Broadcaster-ID), `message` |
Twitch-Header: `Authorization: Bearer <ACCESS_TOKEN>`, `Client-Id: <CLIENT_ID>`; Chat zusätzlich JSON-Content-Type. Scopes nur für die Legacy-Wege: `channel:read:polls` (oder `channel:manage:polls`) und `user:write:chat`.

## Auth-Server
Separates Projekt mit eigenem Repository, läuft lokal auf Port 3000. Das Widget nutzt `GET /token` und `GET /api/twitch/poll/current` (Abschnitt „Integration mit dem Server“). Zu `/token`:
- Erfolg: `200` mit `{ "access_token": "…", "broadcaster_id": "…", "client_id": "…" }` und `Cache-Control: no-store`. Ältere Server-Stände liefern keine `client_id`.
- Zugriffsschutz: `/token` antwortet nur auf Aufrufe vom selben Rechner über `localhost` oder `127.0.0.1`. Browser-Anfragen werden nur von erlaubten Herkünften angenommen, standardmäßig `http://absolute` (OBS-Browser-Source mit „Lokale Datei“) und `null` (Datei per `file://`). Andere Herkünfte erhalten `403`.
- Einbindung in OBS: als URL `file:///…/SpargelPoll.html`, nicht als „Lokale Datei“. Neuere OBS-Versionen sperren Anfragen von `http://absolute` an `localhost`, bevor sie den Server erreichen.
- Keine gespeicherten Tokens oder Refresh fehlgeschlagen: `401` mit `{ "error": "…", "hint": "…" }`.
- Token-Erneuerung: Seit Server-ADR 0024 (auf Server-`main`) erneuert der Server den Token von sich aus 10 min vor Ablauf und liefert in `/token` zusätzlich `expires_at`; das Widget nutzt `expires_at` nicht. Früher erneuerte der Server erst kurz vor Ablauf, ein Widget bekam nach einem 401 dann unter Umständen denselben Token zurück.

## Integration mit dem Server
Server: [`BombingFritz/Twitch-Companion-JS-server`](https://github.com/BombingFritz/Twitch-Companion-JS-server), eigenes Repository mit eigener Lizenz. Dieses Repository ändert dort nichts; Bedarf geht als Issue an den Server (siehe `AGENTS.md`).

| Punkt | Stand |
|---|---|
| Verträge | `/token`: Server-ADR 0013 und 0024, Endpunkttabelle in dessen `docs/ARCHITEKTUR.md`. Abstimmung und Ergebniszeile: Server-Spec [`docs/specs/wetten-abstimmungen.md`](https://github.com/BombingFritz/Twitch-Companion-JS-server/blob/main/docs/specs/wetten-abstimmungen.md), Schritte 2 und 3 |
| Zuletzt geprüfter Serverstand | `main` bei `ebbb62b` (14.11.2026), Code und Doku gelesen, nicht ausgeführt. Kein Server-Release enthält die neuen Endpunkte (letzte Version 1.1.5) |
| Genutzt (0.9.0) | `GET /token` (`access_token`, `client_id`, `broadcaster_id`; nur noch für Start und Legacy-Wege nötig); `GET /api/twitch/poll/current` im bisherigen Takt (ADR 0009). Ergebniszeile sendet der Server (Schalter `results poll on\|off`, Vorgabe aus; einschalten, sobald 0.9.0 in OBS läuft) |
| Legacy-Ausnahmen (direkt an Twitch, Übergang nach Server-Issue [#50](https://github.com/BombingFritz/Twitch-Companion-JS-server/issues/50)) | `GET /helix/polls` nur nach 404 vom Server (älterer Stand), bis zum Neuladen; `POST /helix/chat/messages` nur mit `WIDGET_CHAT_MESSAGE: true` (Vorgabe aus); `GET /helix/users` nur ohne `broadcaster_id` |
| Laufender Server des Nutzers | `main` ab `ebbb62b` laut Nutzer (14.11.2026), nicht selbst geprüft |
| Integrations-Teststatus | 0.9.0: `test/widget-test.js` gegen nachgebildeten Server und Twitch (Headless-Chromium; Stand 1.0.1: 74 Prüfungen inklusive Demo und Darstellung, 0 FAIL). Nicht gegen den echten Server, nicht in OBS, nicht im Stream. `/token` mit 0.8.2 im Stream erprobt (Nutzer, 14.11.2026) |

## Konfiguration
| Konstante | Wert | Bedeutung |
|---|---|---|
| `CLIENT_ID` | `''` | Twitch-App; wird vom Auth-Server gesetzt, manueller Eintrag hat Vorrang |
| `ACCESS_TOKEN` | `''` | zur Laufzeit vom Auth-Server gesetzt |
| `BROADCASTER_ID` | `''` | Kanal und Chat-Absender; wird vom Auth-Server gesetzt, manueller Eintrag hat Vorrang |
| `TOKEN_ENDPOINT` | `http://localhost:3000/token` | Tokenquelle |
| `POLL_ENDPOINT` | `http://localhost:3000/api/twitch/poll/current` | Stand der Abstimmung vom Server (ADR 0009) |
| `WIDGET_CHAT_MESSAGE` | `false` | `true`: Widget sendet die Ergebniszeile selbst per Helix; nur für Server ohne Ergebniszeilen, nie zusammen mit `results poll on` |
| `STALE_GRACE_MS` | `30000` | ohne gültigen Stand so lange nach Ablauf der Zeit warten, dann ohne Endsequenz ausblenden |
| `AUTO_HIDE` | `true` | ohne Poll ausblenden; `false` = dauerhaft sichtbar (vor 0.9.5 blieb das Widget dann unsichtbar) |
| `END_SETTLE_MS` | `1400` | so lange wächst der Endstand, bevor Banner, Sieger und Ton kommen (seit 1.0; ersetzt `ENDED_OVERLAY_DURATION`) |
| `RESULT_DISPLAY_DURATION` | `8000` | so lange steht das Ergebnis, dann blendet das Widget aus |
| `POLL_CHECK_INTERVAL_ACTIVE` | `2000` | aktives Abfrageintervall in ms |
| `POLL_CHECK_INTERVAL_IDLE` | `5000` | Idle-Abfrageintervall in ms |
| `AUTH_RETRY.START_DELAYS_MS` | `[10000, 30000, 60000]` | Wartezeiten der Start-Wiederholungen; der letzte Wert wiederholt sich |
| `AUTH_RETRY.REFRESH_COOLDOWN_MS` | `30000` | Mindestabstand zwischen zwei Token-Erneuerungen |
Seit 0.8.2 stehen im HTML keine IDs mehr; sie kommen vom Auth-Server. Echte IDs gehören nie ins Repository.

`WIDGET_VERSION` (Konstante nach `CONFIG`) wird beim Start geloggt, um prüfen zu können, welche Version OBS geladen hat. Bei jeder neuen Version anpassen.

## Abhängigkeiten und andere Systeme
Browser/OBS, `fetch`, Web Audio API, separater lokaler Auth-Server, Twitch Helix nur noch für die Legacy-Wege. Kein TTF-/TTS-Modul im Widget. `vc-init` ist eine Body-Klasse ohne passende eigene CSS-/JS-Verwendung im untersuchten Widget; ihre Herkunft ist unbekannt.
