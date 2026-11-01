# Chat-Ergebnisnachricht

## Ziel
Ergebnis ausschließlich per API in den Chat senden.

## Verhalten
Bei Overlay-Ende Text erzeugen/loggen und nicht-blockierend per Helix senden. Normalfall: Die Umfrage "<Titel>" wurde beendet und hier sind eure Ergebnisse. Den längsten Spargel hat "<Option>" mit <X> Prozent der Stimmen, gefolgt von "<Option>" mit <Y> Prozent der Stimmen. Gleichstand: Die Umfrage "<Titel>" wurde beendet und wir haben einen Gleichstand! "<Option>" mit <X> Prozent der Stimmen sowie "<Option>" mit <Y> Prozent der Stimmen liegen gleichauf. Weitere gleichauf liegende Optionen werden mit „ sowie “ verbunden. Bei 0 Stimmen werden alle Optionen genannt.

## Nicht-Ziele
Zusätzliches Textfeld im Widget; Chat-Befehle; Tiebreaker.

## Akzeptanzkriterien
- Normalfall nennt Sieger und vorhandenen Zweitplatzierten mit gerundeten Prozentwerten.
- Gleichstand nennt alle Optionen mit Höchststimmenzahl.
- Auch 0:0 wird als Gleichstand ausgegeben.
- Ohne Token/ID wird kein Versand versucht.
- HTTP-Fehler und is_sent=false werden geloggt.
- Versand erfolgt unverändert bei Overlay-Ende, nicht erst mit Siegesanimation.

## Berührte Dateien/Funktionen
`SpargelPoll.html`: generateResultChatMessage, sendChatMessage, triggerPollEnded.

## Status
umgesetzt. Akzeptanzkriterien sind Prüfanforderungen, kein Nachweis einer hier durchgeführten Laufzeitprüfung.
