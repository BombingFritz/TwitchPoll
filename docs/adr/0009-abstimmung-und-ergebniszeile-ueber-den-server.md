# ADR 0009: Abstimmung und Ergebniszeile über den Server

## Status
Angenommen (0.9.0, 14.11.2026). Löst [ADR 0002](0002-rest-polling.md) und [ADR 0005](0005-chat-per-helix.md) ab.
Vom Nutzer beauftragt: Abfrage über `GET /api/twitch/poll/current`, Ergebniszeile vom Server, eigener Versand des Widgets als Vorgabe aus, Rückfall auf Helix bei 404. Vom Nutzer bestätigt (14.11.2026): Der Server sendet die Zeile beim Ende der Abstimmung, also einige Sekunden vor der Siegeranzeige im Bild.
Von Claude festgelegt, nicht einzeln zur Wahl gestellt: Rückfall gilt bis zum Neuladen; ohne gültigen Stand bleibt die angezeigte Abstimmung bis 30 s nach Ablauf ihrer Zeit stehen (`STALE_GRACE_MS`), danach ausblenden ohne Endsequenz; Statuspunkt zeigt den Erfolg der letzten Abfrage; Name `WIDGET_CHAT_MESSAGE`.

## Kontext
Bis 0.8.2 fragte das Widget die Abstimmung mit dem Token des Servers selbst bei Twitch ab (alle 2 bzw. 5 s) und sendete die Ergebniszeile selbst. Der Server hat den Grundsatz „nur der Server fragt Twitch“ (dort ADR 0023, Issue #50) und bietet inzwischen den letzten Stand der Abstimmung aus EventSub an (Server-PR #66) sowie die Ergebniszeile mit einem Schalter (Server-PR #68). Vertrag: Server-Spec `docs/specs/wetten-abstimmungen.md`, Schritte 2 und 3.

## Entscheidung
- `checkForActivePoll` fragt im bisherigen Takt `GET /api/twitch/poll/current`. Der Stand wird an einer Stelle in die bisherige interne Form gebracht (`fromServerPoll`, `toCurrentPoll`); Darstellung, Timer, Overlay, Sound und Animation bleiben unverändert.
- `ARCHIVED` nach `COMPLETED` ist dieselbe Abstimmung und löst keine zweite Endsequenz aus.
- `WAITING` oder ein Fehler, während eine Abstimmung angezeigt wird (z. B. kurz nach einem Server-Neustart), lässt den letzten Stand stehen.
- 404 heißt „älterer Server“: Rückfall auf `GET /helix/polls` bis zum Neuladen (Legacy-Ausnahme). Andere Fehler: letzter Stand bleibt.
- Die Ergebniszeile sendet der Server (`results poll on`). Das Widget erzeugt den Text weiter und schreibt ihn ins Browser-Log; senden würde es nur mit `WIDGET_CHAT_MESSAGE: true`, gedacht für Server ohne Ergebniszeilen.

## Verworfene Alternativen
- Beide senden lassen: doppelte Zeile im Chat.
- Zeile weiter vom Widget bei Overlay-Ende: widerspricht dem Server-Grundsatz; `!privat`, Drosselung und Datenkatalog gelten nur zentral.
- Rückfall auf Helix bei jedem Fehler: würde bei einem kurz nicht erreichbaren Server Twitch-Anfragen am Server vorbei erzeugen.

## Konsequenzen
- Im Normalbetrieb fragt das Widget Twitch nicht mehr; die Zahl der Twitch-Anfragen hängt nicht mehr von der Zahl der Widgets ab.
- Nach dem Update in OBS schaltet der Nutzer am Server `results poll on`. Bis dahin erscheint keine Zeile im Chat; der Text steht im Server-Log.
- Die Zeile kommt im Chat beim Ende der Abstimmung, vor der Siegeranzeige.
- Den Token holt das Widget weiter beim Start; gebraucht wird er nur noch für die Legacy-Wege.
- Wird der Server während einer laufenden Abstimmung neu gestartet und endet die Abstimmung in dieser Zeit, sendet der Server laut seiner Spec keine Zeile (er hat sie nicht offen gesehen); das Widget zeigt die Endsequenz trotzdem.
