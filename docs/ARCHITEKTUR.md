# Architektur
## Referenz und Struktur
Referenzdatei: `SpargelPoll.html`. Eine HTML-Datei mit Inline-CSS, DOM und klassischem Script am Body-Ende; direkter Aufruf `init()`. Kein Framework, Paketmanager oder Build im Widget. Logo, `SPITZE_IMG` und `MITTE_IMG` sind drei eingebettete Base64-PNGs.

800×600 px, transparenter Body, dunkler Widget-Hintergrund und grüner Rahmen. DOM: `widgetContainer`, `statusIndicator`, Header mit Logo/`pollQuestion`/`timerContainer`, Hauptbereich mit `winnerAnnouncement`, `pollArea`, Gras und `labelsArea`, darüber `pollEndedOverlay`.

## Funktionsbereiche
| Bereich | Funktionen | Aufgabe |
|---|---|---|
| Start/Auth | `init`, `fetchAccessToken`, `applyTokenResponse`, `isConfigured`, `getUserId`, `scheduleInitRetry` | Token und IDs vom Auth-Server übernehmen, Konfiguration prüfen, ggf. Benutzer-ID bestimmen, Polling starten; bei nicht erreichbarem Auth-Server Start später wiederholen |
| Token-Erneuerung | `requestNewToken`, `refreshAccessToken`, `twitchFetchWithRefresh` | Bei HTTP 401/403 neuen Token holen und den Twitch-Aufruf einmal wiederholen |
| Poll-Daten | `checkForActivePoll`, `handlePollFromAPI`, `updatePollFromAPI`, `getPollEndsAt` | API-Status übernehmen, aktive Poll aufbauen/aktualisieren, Endzeit bestimmen |
| Timer | `startTimer`, `stopTimer`, `updateTimer` | Restsekunden anzeigen, Intervall 100 ms |
| Ergebnis | `calculatePercentages`, `findWinner`, `triggerPollEnded` | Prozent, Gewinner-/Gleichstand-Erkennung und Endsequenz |
| Darstellung | `renderPoll`, `updatePollValues` | Initialer Neuaufbau bzw. differenzielle Updates |
| Sieger | `showWinnerAnnouncement`, `hideWinnerAnnouncement`, `triggerWinnerDecoration`, `resetWinnerDecoration` | Banner und Strahlenkranz |
| Sound | `getSharedAudioContext`, `unlockAudioOnInteraction`, `playResultSound`, `triggerResultSound` | Wiederverwendeter Context, Freigabe, Synthese, Einmal-Guard |
| Chat | `generateResultChatMessage`, `sendChatMessage` | Ergebnistext und Helix-Versand |
| Sichtbarkeit | `showWidget`, `hideWhenNoPoll`, `showNoPoll`, `updateStatus` | Widget-/Leerzustand und Statuspunkt |

## Datenhaltung
Nur flüchtiger JS-Zustand: `currentPoll`, `currentPollId`, `timerInterval`, `pollCheckInterval`, `pollEndTime`, `pollEndedInProgress`, `resultSoundPlayed`, `sharedAudioCtx`, `tokenRefreshPromise`, `lastTokenRefreshAttempt`, `initRetryCount`, `initRetryTimer`. Kein Widget-Dateispeicher oder persistenter Poll-Verlauf.
Poll-Modell: `{id, question, options: [{id, name, votes}], ended}`; Prozentfelder werden berechnet.

## Datenfluss und Zeitverhalten
- `init` loggt die Version (`WIDGET_VERSION`), holt Token, Client-ID und Broadcaster-ID einmal über `fetchAccessToken` (mit `cache: 'no-store'`), führt die erste Poll-Abfrage aus und setzt ein Idle-Intervall.
- `applyTokenResponse` übernimmt `access_token` immer, `client_id` und `broadcaster_id` nur, wenn in `CONFIG` kein Wert manuell eingetragen ist. Leere Werte und alte Platzhalter (`DEINE_…`) zählen als nicht eingetragen.
- Fehlt danach die Client-ID (alter Auth-Server ohne `client_id`), bricht der Start mit „Konfiguration fehlt!“ ab. Fehlt nur die Broadcaster-ID, wird sie über `GET /helix/users` aus dem Token ermittelt.
- Schlägt der Token-Abruf fehl, zeigt das Widget „Auth-Server nicht erreichbar!“ und plant über `scheduleInitRetry` einen neuen `init`-Versuch nach 10 s, 30 s und danach alle 60 s. Nach erfolgreichem Start wird der Zähler zurückgesetzt und „Warte auf Abstimmung...“ angezeigt.
- Poll-Abfrage und Chat-Versand laufen über `twitchFetchWithRefresh`: Bei HTTP 401/403 wird über `refreshAccessToken` ein neuer Token vom Auth-Server geholt und der Aufruf genau einmal wiederholt. Parallele Erneuerungen teilen sich einen Request; zwischen zwei Erneuerungen liegen mindestens 30 s. Hat ein paralleler Aufruf den Token schon erneuert, wird nur wiederholt. `getUserId` nutzt diesen Weg nicht.
- `checkForActivePoll` verwendet den ersten zurückgegebenen Poll. Neue aktive ID: `handlePollFromAPI`, initiales Rendering, Timer, aktives Intervall. Bekannte aktive Poll: `updatePollFromAPI` → `updatePollValues`.
- Endstatus `COMPLETED`, `TERMINATED`, `ARCHIVED` einer angezeigten Poll startet `triggerPollEnded`; `pollEndedInProgress` verhindert Wiederholung.
- Endsequenz: Polling/Timer stoppen → Endwerte übernehmen → Ende-Overlay 3000 ms.
- Bei Overlay-Ende: Sound-Flag zurücksetzen, Text erzeugen/loggen und asynchron senden (nicht awaited), danach `renderPoll(currentPoll, true)`.
- Initialer Aufbau: Option um `index*200` ms versetzt; Mittelteile je 75 ms, Opacity-Transition 0,12 s.
- Sieger-/Gleichstand-Timeout je Option: `numSections*75+300` ms nach Optionsaufbau. Im Siegerfall Strahlenkranz und Banner, im Gleichstand Banner; dort auch `triggerResultSound`.
- Separater Ausblendpfad: nach `10*75+300` ms plus `RESULT_DISPLAY_DURATION` wird zurückgesetzt und Idle-Polling gestartet. Dieser feste Delay ist nicht identisch mit jedem optionsabhängigen Siegesanimationszeitpunkt.

## Ergebnisberechnung
Prozent = `Math.round(votes/totalVotes*100)`, bei Gesamtzahl 0 jeweils 0. Rundungswerte müssen sich nicht zu 100 summieren.
`findWinner` liefert nur bei eindeutigem Maximum über 0 einen Gewinner; sonst `null`. Alle Optionen mit 0 Stimmen gelten als Gleichstand.
Segmente = `Math.max(0, Math.round(percentage/10))`. Updates fügen nur zusätzliche Segmente hinzu oder entfernen überzählige.

## Sound und Chat
Sound: zwei kurze Dreieck-Töne C5/E5 und ein gehaltener Sägezahn-Dreiklang C5–E5–G5. `resultSoundPlayed` verhindert Mehrfachauslösung. `click`, `keydown`, `touchstart`, `pointerdown` versuchen, den AudioContext fortzusetzen. Es gibt kein Audio-Dateiasset.

Chat: Normalfall nennt Sieger und, wenn vorhanden, Zweitplatzierten, sortiert nach Stimmen. Gleichstand nennt alle Optionen mit Höchststimmenzahl, verbunden mit „ sowie “. Textmuster siehe Spec. Versand als Broadcaster; kein zusätzliches Chat-Ausgabefeld im Widget. Nicht erfolgreiche HTTP-Antworten und `is_sent=false` werden geloggt, zusätzlich mit dem Nachrichtentext zum manuellen Posten. Abgesehen von der einmaligen Wiederholung nach Token-Erneuerung (401/403) gibt es kein Retry.

## Schnittstellen
| Ziel | Aufruf | Daten |
|---|---|---|
| Lokaler Auth-Server | `GET http://localhost:3000/token` | JSON-Felder `access_token`, `client_id`, `broadcaster_id` |
| Twitch | `GET https://api.twitch.tv/helix/users` | Benutzer-ID, nur bei passendem Konfigurationsplatzhalter |
| Twitch | `GET https://api.twitch.tv/helix/polls?broadcaster_id=…` | Polls/Status/Choices/Stimmen |
| Twitch | `POST https://api.twitch.tv/helix/chat/messages` | `broadcaster_id`, `sender_id` (beide Broadcaster-ID), `message` |
Twitch-Header: `Authorization: Bearer <ACCESS_TOKEN>`, `Client-Id: <CLIENT_ID>`; Chat zusätzlich JSON-Content-Type. Benötigte Scopes: `channel:read:polls` (oder `channel:manage:polls`) und `user:write:chat`.

## Auth-Server
Separates Projekt mit eigenem Repository, läuft lokal auf Port 3000. Das Widget nutzt davon nur `GET /token`:
- Erfolg: `200` mit `{ "access_token": "…", "broadcaster_id": "…", "client_id": "…" }` und `Cache-Control: no-store`. Ältere Server-Stände liefern keine `client_id`.
- Zugriffsschutz: `/token` antwortet nur auf Aufrufe vom selben Rechner über `localhost` oder `127.0.0.1`. Browser-Anfragen werden nur von erlaubten Herkünften angenommen, standardmäßig `http://absolute` (OBS-Browser-Source mit „Lokale Datei“) und `null` (Datei per `file://`). Andere Herkünfte erhalten `403`.
- Keine gespeicherten Tokens oder Refresh fehlgeschlagen: `401` mit `{ "error": "…", "hint": "…" }`.
- Der Server erneuert den Twitch-Token selbst, sobald dieser weniger als 5 Minuten gültig ist. Vorher liefert er den gespeicherten Token unverändert. Fordert das Widget nach einem 401 einen neuen Token an, bekommt es deshalb unter Umständen denselben Token zurück (siehe `OFFEN.md`).

## Konfiguration
| Konstante | Wert | Bedeutung |
|---|---|---|
| `CLIENT_ID` | `''` | Twitch-App; wird vom Auth-Server gesetzt, manueller Eintrag hat Vorrang |
| `ACCESS_TOKEN` | `''` | zur Laufzeit vom Auth-Server gesetzt |
| `BROADCASTER_ID` | `''` | Kanal und Chat-Absender; wird vom Auth-Server gesetzt, manueller Eintrag hat Vorrang |
| `TOKEN_ENDPOINT` | `http://localhost:3000/token` | Tokenquelle |
| `AUTO_HIDE` | `true` | ohne Poll ausblenden |
| `ENDED_OVERLAY_DURATION` | `3000` | Overlay-Dauer in ms |
| `RESULT_DISPLAY_DURATION` | `7000` | Ergebnisdauer im festen Ausblendpfad in ms |
| `POLL_CHECK_INTERVAL_ACTIVE` | `2000` | aktives Abfrageintervall in ms |
| `POLL_CHECK_INTERVAL_IDLE` | `5000` | Idle-Abfrageintervall in ms |
| `AUTH_RETRY.START_DELAYS_MS` | `[10000, 30000, 60000]` | Wartezeiten der Start-Wiederholungen; der letzte Wert wiederholt sich |
| `AUTH_RETRY.REFRESH_COOLDOWN_MS` | `30000` | Mindestabstand zwischen zwei Token-Erneuerungen |
Seit 0.8.2 stehen im HTML keine IDs mehr; sie kommen vom Auth-Server. Echte IDs gehören nie ins Repository.

`WIDGET_VERSION` (Konstante nach `CONFIG`) wird beim Start geloggt, um prüfen zu können, welche Version OBS geladen hat. Bei jeder neuen Version anpassen.

## Abhängigkeiten und andere Systeme
Browser/OBS, `fetch`, Web Audio API, Twitch Helix und separater lokaler Auth-Server. Kein TTF-/TTS-Modul im Widget. `vc-init` ist eine Body-Klasse ohne passende eigene CSS-/JS-Verwendung im untersuchten Widget; ihre Herkunft ist unbekannt.
