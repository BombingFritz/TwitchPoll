# Chat-Ergebnisnachricht

## Ziel
Ergebnis der Abstimmung als Zeile in den Chat. Seit 0.9.0 sendet der Server (ADR 0009); dieser Text ist die Vorlage, die der Server wörtlich übernommen hat.

## Verhalten
Der Server sendet beim Ende der Abstimmung (`COMPLETED`, `TERMINATED` oder `ARCHIVED`), einmal je Abstimmung, wenn sein Schalter `results poll on` gesetzt ist (Server-Spec `wetten-abstimmungen.md`, Schritt 3). Das Widget erzeugt den Text bei Overlay-Ende und schreibt ihn ins Browser-Log; nur mit `WIDGET_CHAT_MESSAGE: true` (Legacy-Rückfall für Server ohne Ergebniszeilen) sendet es ihn selbst, nicht-blockierend per Helix. Nie beide Wege gleichzeitig. Normalfall: Die Umfrage "<Titel>" wurde beendet und hier sind eure Ergebnisse. Den längsten Spargel hat "<Option>" mit <X> Prozent der Stimmen, gefolgt von "<Option>" mit <Y> Prozent der Stimmen. Gleichstand: Die Umfrage "<Titel>" wurde beendet und wir haben einen Gleichstand! "<Option>" mit <X> Prozent der Stimmen sowie "<Option>" mit <Y> Prozent der Stimmen liegen gleichauf. Weitere gleichauf liegende Optionen werden mit „ sowie “ verbunden. Bei 0 Stimmen werden alle Optionen genannt.

## Nicht-Ziele
Zusätzliches Textfeld im Widget; Chat-Befehle; Tiebreaker.

## Akzeptanzkriterien
- Normalfall nennt Sieger und vorhandenen Zweitplatzierten mit gerundeten Prozentwerten.
- Gleichstand nennt alle Optionen mit Höchststimmenzahl.
- Auch 0:0 wird als Gleichstand ausgegeben.
- Ohne Token/ID wird kein Versand versucht.
- HTTP-Fehler und is_sent=false werden geloggt, jeweils mit dem Nachrichtentext zum manuellen Posten.
- Bei 401/403 wird nach Token-Erneuerung genau einmal erneut gesendet.
- Vorgabe: Das Widget sendet nicht; der Text steht im Browser-Log.
- Mit `WIDGET_CHAT_MESSAGE: true`: Versand bei Overlay-Ende, genau einmal je Abstimmung, auch wenn danach `ARCHIVED` folgt.
- Ein Textunterschied zwischen Widget und Server ist ein Fehler (Vergleich: Browser-Log des Widgets, Server-Log).

## Berührte Dateien/Funktionen
`SpargelPoll.html`: generateResultChatMessage, sendChatMessage, triggerPollEnded. Server: `lib/result-messages.js` (anderes Repository).

## Status
umgesetzt. Akzeptanzkriterien sind Prüfanforderungen, kein Nachweis einer hier durchgeführten Laufzeitprüfung.
