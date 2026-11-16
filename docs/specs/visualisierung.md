# Spargel-Visualisierung und Wachstum

## Ziel
Stimmen als ruhig animierte Spargelstangen anzeigen, die aus dem Gras wachsen.

## Verhalten
Seit 1.0 (ADR 0010): Je Option eine Spalte aus Stange, Prozent, Stimmen und Name. Die Stangenhöhe folgt stufenlos dem gerundeten Prozentwert (0 %: nur die Spitze schaut aus dem Gras, 100 %: 300 px) und gleitet bei Änderungen weich mit leichtem Nachfedern, nach oben wie nach unten. Prozentzahlen zählen zum neuen Wert. Bei neuer Abstimmung erscheinen die Spalten nacheinander und die Stangen wachsen von 0; danach werden nur noch Werte gesetzt. Die Stange besteht aus der Spitze und dem nahtlos wiederholten Mittelstück. Ein Halmsaum liegt vor den Stangenfüßen.

## Nicht-Ziele
Stücke je 10 Prozent (bis 0.9.5); historische Bounce-/Layout-Experimente.

## Akzeptanzkriterien
- Die Stangenhöhe entspricht dem Prozentwert; 100 % passt vollständig in das Feld.
- Stimmenupdates bauen keine Spalte neu auf; Optionspositionen bleiben stabil.
- Alle Stangen stehen auf derselben Bodenlinie, auch bei ein- und zweizeiligen Namen.
- Namen haben höchstens zwei Zeilen, dann „…“; Namen werden als Text gesetzt, nicht als HTML.
- Spitze und Mittelstück ohne hellen Saum, Mittelstück ohne sichtbare Naht.

## Berührte Dateien/Funktionen
`SpargelPoll.html`: renderPoll, buildPoll, sameOptions, updatePollValues, stalkHeight, countTo, calculatePercentages.

## Status
umgesetzt in 1.0.0. Geprüft im Headless-Browser (Test und Screenshots der Demo-Beispiele); in OBS offen.
