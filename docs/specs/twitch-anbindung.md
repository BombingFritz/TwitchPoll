# Twitch-Anbindung und Auth

## Ziel
Polls aus Twitch übernehmen.

## Verhalten
Token von lokalem /token, REST-Abfragen im aktiven/Idle-Intervall, Statusverarbeitung über Poll-ID.

## Nicht-Ziele
Auth-Server implementieren; EventSub/IRC.

## Akzeptanzkriterien
- Eine neue aktive Poll startet Darstellung und Timer.
- Eine bekannte aktive Poll aktualisiert die vorhandene Darstellung.
- Ein Endstatus einer angezeigten Poll startet genau eine Endsequenz.
- Bei nicht erreichbarer Tokenquelle wird der Fehler geloggt und der Start abgebrochen.

## Berührte Dateien/Funktionen
`SpargelPoll.html`: init, fetchAccessToken, getUserId, checkForActivePoll, handlePollFromAPI, updatePollFromAPI.

## Status
umgesetzt. Akzeptanzkriterien sind Prüfanforderungen, kein Nachweis einer hier durchgeführten Laufzeitprüfung.
