# Endsequenz und Siegesanimation

## Ziel
Ergebnis und Gewinner/Gleichstand hervorheben, ohne die Stangen zu verdecken.

## Verhalten
Seit 1.0 (ADR 0010): Bei Ende der Abstimmung zeigt das Statusschild „Beendet“ und die Stangen gleiten auf den Endstand; nichts wird neu aufgebaut. Nach 1,4 s klappt das Ergebnis-Banner über die Frage:
- eindeutiger Sieger: Kennung „Ergebnis“ (gold), Text „»Name« gewinnt mit X %“; die Siegerspalte bekommt goldene Zahl und Name, Schein und einen langsam drehenden Strahlenkranz; die übrigen werden abgedunkelt
- Gleichstand: Kennung „Gleichstand“ (grün), Text „»A« und »B« liegen gleichauf“ (mehr als zwei: „»A«, »B« und »C« …“); nicht gleichauf liegende werden abgedunkelt
- 0:0: „Gleichstand“, Text „Niemand hat abgestimmt“
Lange Texte verkleinern die Schrift bis 24 px, danach „…“. Zugleich einmal der Ton (Spec `ergebnis-sound.md`). Nach 8 s blendet das Widget aus und ist bereit für die nächste Abstimmung.

## Nicht-Ziele
Stechen; Vollbild-Overlay (bis 0.9.5).

## Akzeptanzkriterien
- Ein eindeutiger Sieger erhält Banner „Ergebnis“, Hervorhebung und Strahlenkranz; der Kranz sitzt mittig auf dem Spargelkopf.
- Bei Gleichstand und Nullstimmen erhält keine Option Sieger-Styling.
- Die Stangen bleiben während der ganzen Endsequenz sichtbar; kein Neuaufbau.
- Wiederholter Endaufruf während der Sequenz wird ignoriert; `ARCHIVED` danach löst nichts aus.
- Nach der Sequenz ist die nächste Poll darstellbar.

## Berührte Dateien/Funktionen
`SpargelPoll.html`: triggerPollEnded, showResult, resetResult, showWinnerAnnouncement, findWinner, renderPoll.

## Status
umgesetzt in 1.0.0. Geprüft im Headless-Browser; in OBS und im Stream offen.
