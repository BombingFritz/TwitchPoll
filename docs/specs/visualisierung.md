# Spargel-Visualisierung und Wachstum

## Ziel
Stimmen als ruhig animierte Spargelstangen anzeigen.

## Verhalten
Ein Segment je gerundeten 10 Prozent; gestaffeltes initiales Wachstum, differenzielle Updates. Aktuelle Animation laut Nutzer fehlerfrei.

## Nicht-Ziele
Historische Bounce-/Layout-Experimente wieder einbauen.

## Akzeptanzkriterien
- 100 Prozent erzeugen zehn Mittelteile.
- Stimmenupdates ersetzen nicht unnötig alle Stangen.
- Optionspositionen bleiben bei Updates stabil.
- Logo, Spitze und Mittelteile bleiben intakt.

## Berührte Dateien/Funktionen
`SpargelPoll.html`: renderPoll, updatePollValues, calculatePercentages.

## Status
umgesetzt. Akzeptanzkriterien sind Prüfanforderungen, kein Nachweis einer hier durchgeführten Laufzeitprüfung.
