# Architektur
## Referenz und Struktur
Referenzdatei: `SpargelPoll.html`. Eine HTML-Datei mit Inline-CSS, DOM und klassischem Script am Body-Ende; direkter Aufruf `init()`. Kein Framework, Paketmanager oder Build im Widget. Logo, `SPITZE_IMG` und `MITTE_IMG` sind drei eingebettete Base64-PNGs.

800×600 px, transparenter Body, dunkler Widget-Hintergrund und grüner Rahmen. DOM: `widgetContainer`, `statusIndicator`, Header mit Logo/`pollQuestion`/`timerContainer`, Hauptbereich mit `winnerAnnouncement`, `pollArea`, Gras und `labelsArea`, darüber `pollEndedOverlay`.

## Funktionsbereiche
| Bereich | Funktionen | Aufgabe |
|---|---|---|
| Start/Auth | `init`, `fetchAccessToken`, `getUserId` | Token laden, Konfiguration prüfen, ggf. Benutzer-ID bestimmen, Polling starten |
| Poll-Daten | `checkForActivePoll`, `handlePollFromAPI`, `updatePollFromAPI`, `getPollEndsAt` | API-Status übernehmen, aktive Poll aufbauen/aktualisieren, Endzeit bestimmen |
| Timer | `startTimer`, `stopTimer`, `updateTimer` | Restsekunden anzeigen, Intervall 100 ms |
| Ergebnis | `calculatePercentages`, `findWinner`, `triggerPollEnded` | Prozent, Gewinner-/Gleichstand-Erkennung und Endsequenz |
| Darstellung | `renderPoll`, `updatePollValues` | Initialer Neuaufbau bzw. differenzielle Updates |
| Sieger | `showWinnerAnnouncement`, `hideWinnerAnnouncement`, `triggerWinnerDecoration`, `resetWinnerDecoration` | Banner und Strahlenkranz |
| Sound | `getSharedAudioContext`, `unlockAudioOnInteraction`, `playResultSound`, `triggerResultSound` | Wiederverwendeter Context, Freigabe, Synthese, Einmal-Guard |
| Chat | `generateResultChatMessage`, `sendChatMessage` | Ergebnistext und Helix-Versand |
| Sichtbarkeit | `showWidget`, `hideWhenNoPoll`, `showNoPoll`, `updateStatus` | Widget-/Leerzustand und Statuspunkt |

## Datenhaltung
Nur flüchtiger JS-Zustand: `currentPoll`, `currentPollId`, `timerInterval`, `pollCheckInterval`, `pollEndTime`, `pollEndedInProgress`, `resultSoundPlayed`, `sharedAudioCtx`. Kein Widget-Dateispeicher oder persistenter Poll-Verlauf.
Poll-Modell: `{id, question, options: [{id, name, votes}], ended}`; Prozentfelder werden berechnet.

## Datenfluss und Zeitverhalten
- `init` lädt den Token im Inline-Block und erneut über `fetchAccessToken`, führt die erste Poll-Abfrage aus und setzt ein Idle-Intervall.
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

Chat: Normalfall nennt Sieger und, wenn vorhanden, Zweitplatzierten, sortiert nach Stimmen. Gleichstand nennt alle Optionen mit Höchststimmenzahl, verbunden mit „ sowie “. Textmuster siehe Spec. Versand als Broadcaster; kein zusätzliches Chat-Ausgabefeld im Widget. Nicht erfolgreiche HTTP-Antworten und `is_sent=false` werden geloggt; kein Retry im Code.

## Schnittstellen
| Ziel | Aufruf | Daten |
|---|---|---|
| Lokaler Auth-Server | `GET http://localhost:3000/token` | JSON-Feld `access_token` |
| Twitch | `GET https://api.twitch.tv/helix/users` | Benutzer-ID, nur bei passendem Konfigurationsplatzhalter |
| Twitch | `GET https://api.twitch.tv/helix/polls?broadcaster_id=…` | Polls/Status/Choices/Stimmen |
| Twitch | `POST https://api.twitch.tv/helix/chat/messages` | `broadcaster_id`, `sender_id` (beide Broadcaster-ID), `message` |
Twitch-Header: `Authorization: Bearer <ACCESS_TOKEN>`, `Client-Id: <CLIENT_ID>`; Chat zusätzlich JSON-Content-Type. Benötigte Scopes: `channel:read:polls` (oder `channel:manage:polls`) und `user:write:chat`.

## Auth-Server
Separates Projekt mit eigenem Repository, läuft lokal auf Port 3000. Das Widget nutzt davon nur `GET /token`:
- Erfolg: `200` mit `{ "access_token": "…", "broadcaster_id": "…" }`. Das Widget liest derzeit nur `access_token`.
- Keine gespeicherten Tokens oder Refresh fehlgeschlagen: `401` mit `{ "error": "…", "hint": "…" }`.
- Der Server erneuert den Twitch-Token selbst, sobald dieser weniger als 5 Minuten gültig ist. Vorher liefert er den gespeicherten Token unverändert.

## Konfiguration
| Konstante | Wert | Bedeutung |
|---|---|---|
| `CLIENT_ID` | `DEINE_CLIENT_ID_HIER` | Twitch-App |
| `ACCESS_TOKEN` | `''` | zur Laufzeit vom Auth-Server gesetzt |
| `BROADCASTER_ID` | `DEINE_BROADCASTER_ID_HIER` | Kanal und Chat-Absender |
| `TOKEN_ENDPOINT` | `http://localhost:3000/token` | Tokenquelle |
| `AUTO_HIDE` | `true` | ohne Poll ausblenden |
| `ENDED_OVERLAY_DURATION` | `3000` | Overlay-Dauer in ms |
| `RESULT_DISPLAY_DURATION` | `7000` | Ergebnisdauer im festen Ausblendpfad in ms |
| `POLL_CHECK_INTERVAL_ACTIVE` | `2000` | aktives Abfrageintervall in ms |
| `POLL_CHECK_INTERVAL_IDLE` | `5000` | Idle-Abfrageintervall in ms |
Im Repository stehen nur Platzhalter. Bleibt `BROADCASTER_ID` auf `DEINE_BROADCASTER_ID_HIER`, ermittelt das Widget die ID über `GET /helix/users` aus dem Token. Steht `CLIENT_ID` noch auf `DEINE_CLIENT_ID_HIER`, bricht der Start mit „Konfiguration fehlt!“ ab.

## Abhängigkeiten und andere Systeme
Browser/OBS, `fetch`, Web Audio API, Twitch Helix und separater lokaler Auth-Server. Kein TTF-/TTS-Modul im Widget. `vc-init` ist eine Body-Klasse ohne passende eigene CSS-/JS-Verwendung im untersuchten Widget; ihre Herkunft ist unbekannt.
