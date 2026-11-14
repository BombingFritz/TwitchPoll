# Twitch-Anbindung und Auth

## Ziel
Polls aus Twitch übernehmen.

## Verhalten
Token, Client-ID und Broadcaster-ID von lokalem /token (ein Abruf je Start, nicht zwischengespeichert). Stand der Abstimmung per REST vom Server (`GET /api/twitch/poll/current`, ADR 0009) im aktiven/Idle-Intervall, Statusverarbeitung über Poll-ID. Kennt der Server die Adresse nicht (404), fragt das Widget bis zum Neuladen selbst `GET /helix/polls` (Legacy-Rückfall). Ist der Auth-Server beim Start nicht erreichbar, wird der Start nach 10 s, 30 s und danach alle 60 s wiederholt. Antwortet Twitch auf einem Legacy-Weg mit 401/403, holt das Widget einen neuen Token und wiederholt den Aufruf einmal.

## Nicht-Ziele
Auth-Server implementieren; EventSub/IRC; Twitch im Normalbetrieb selbst fragen.

## Akzeptanzkriterien
- Ohne manuell eingetragene IDs übernimmt das Widget `client_id` und `broadcaster_id` aus `/token`; manuell eingetragene IDs haben Vorrang.
- Liefert der Auth-Server keine `client_id` und ist keine eingetragen, erscheint „Konfiguration fehlt!“ mit erklärender Konsolenmeldung.
- Beim Start wird `/token` genau einmal abgefragt.
- Im Normalbetrieb geht keine Anfrage an `api.twitch.tv/helix/polls`; abgefragt wird `/api/twitch/poll/current`.
- `WAITING` ohne angezeigte Abstimmung: ausgeblendet. `WAITING` oder Fehler während einer Abstimmung: letzter Stand bleibt; ohne Ende blendet das Widget 30 s nach Ablauf der Zeit aus, ohne Endsequenz.
- Unbekannte Zusatzfelder stören nicht; eine Antwort ohne `pollId` oder `choices` gilt als ungültig, der letzte Stand bleibt.
- 404 vom Server: Rückfall auf `GET /helix/polls`, einmal geloggt.
- Eine neue aktive Poll startet Darstellung und Timer (Ende aus `endsAt`).
- Eine bekannte aktive Poll aktualisiert die vorhandene Darstellung.
- Ein Endstatus einer angezeigten Poll startet genau eine Endsequenz; `ARCHIVED` nach `COMPLETED` startet keine zweite.
- Bei nicht erreichbarer Tokenquelle wird der Fehler geloggt, „Auth-Server nicht erreichbar!“ angezeigt und der Start automatisch wiederholt (10 s, 30 s, dann alle 60 s).
- Nach erfolgreichem Wiederholungsstart erscheint „Warte auf Abstimmung...“ und das Polling läuft normal.
- Bei 401/403 auf einem Legacy-Weg (Helix-Abfrage, Chat-Versand) wird der Token höchstens einmal je 30 s erneuert und der Aufruf genau einmal wiederholt.

## Berührte Dateien/Funktionen
`SpargelPoll.html`: init, fetchAccessToken, applyTokenResponse, isConfigured, getUserId, scheduleInitRetry, requestNewToken, refreshAccessToken, twitchFetchWithRefresh, checkForActivePoll, fetchCurrentPoll, fromServerPoll, toCurrentPoll, keepOrGiveUp, handlePollFromAPI, updatePollFromAPI. Test: `test/widget-test.js`.

## Status
umgesetzt. Akzeptanzkriterien sind Prüfanforderungen, kein Nachweis einer hier durchgeführten Laufzeitprüfung.
