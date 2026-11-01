# Twitch-Anbindung und Auth

## Ziel
Polls aus Twitch übernehmen.

## Verhalten
Token, Client-ID und Broadcaster-ID von lokalem /token (ein Abruf je Start, nicht zwischengespeichert), REST-Abfragen im aktiven/Idle-Intervall, Statusverarbeitung über Poll-ID. Ist der Auth-Server beim Start nicht erreichbar, wird der Start nach 10 s, 30 s und danach alle 60 s wiederholt. Antwortet Twitch mit 401/403, holt das Widget einen neuen Token und wiederholt den Aufruf einmal.

## Nicht-Ziele
Auth-Server implementieren; EventSub/IRC.

## Akzeptanzkriterien
- Ohne manuell eingetragene IDs übernimmt das Widget `client_id` und `broadcaster_id` aus `/token`; manuell eingetragene IDs haben Vorrang.
- Liefert der Auth-Server keine `client_id` und ist keine eingetragen, erscheint „Konfiguration fehlt!“ mit erklärender Konsolenmeldung.
- Beim Start wird `/token` genau einmal abgefragt.
- Eine neue aktive Poll startet Darstellung und Timer.
- Eine bekannte aktive Poll aktualisiert die vorhandene Darstellung.
- Ein Endstatus einer angezeigten Poll startet genau eine Endsequenz.
- Bei nicht erreichbarer Tokenquelle wird der Fehler geloggt, „Auth-Server nicht erreichbar!“ angezeigt und der Start automatisch wiederholt (10 s, 30 s, dann alle 60 s).
- Nach erfolgreichem Wiederholungsstart erscheint „Warte auf Abstimmung...“ und das Polling läuft normal.
- Bei 401/403 von Poll-Abfrage oder Chat-Versand wird der Token höchstens einmal je 30 s erneuert und der Aufruf genau einmal wiederholt.

## Berührte Dateien/Funktionen
`SpargelPoll.html`: init, fetchAccessToken, applyTokenResponse, isConfigured, getUserId, scheduleInitRetry, requestNewToken, refreshAccessToken, twitchFetchWithRefresh, checkForActivePoll, handlePollFromAPI, updatePollFromAPI.

## Status
umgesetzt. Akzeptanzkriterien sind Prüfanforderungen, kein Nachweis einer hier durchgeführten Laufzeitprüfung.
