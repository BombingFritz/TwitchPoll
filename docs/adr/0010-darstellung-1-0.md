# ADR 0010: Darstellung 1.0: bereinigte Grafiken, stufenlose Stange, Ergebnis-Banner

## Status
Angenommen (1.0.0, 16.11.2026). Vom Nutzer entschieden: Grafiken einmalig bereinigen, stufenlose Stange statt 10-%-Stücken, Ergebnis-Banner statt Vollbild-Overlay, bF-Logo groß neben der Frage, Gras mit Textur, aus dem die Stangen wachsen. Entwurf in `demo.html` neben dem alten Stand verglichen und abgenommen.
Von Claude festgelegt, nicht einzeln zur Wahl gestellt: Maße (Stange 84 px breit, 46–300 px hoch), Zeiten (`END_SETTLE_MS` 1,4 s, `RESULT_DISPLAY_DURATION` 8 s), Bannertexte, Farben und Schriften nach SpargelWette, Halme als eigene SVG-Zeichnung im CSS.

## Kontext
Die Animation wirkte unruhig: Die Stange wuchs in Stücken von je 10 Prozent (ein ganzes Bild je Stück), am Ende wurde alles abgerissen und neu aufgebaut, das schwarze Overlay erschien schlagartig. Die Spargelgrafiken hatten einen hellen Saum (deckende helle Randpixel aus dem Freistellen vor weißem Grund), der beim Verkleinern sichtbar wurde. Rahmen, Schrift und Timer wirkten altbacken; Rahmen rechts abgeschnitten. Die Regel „PNGs bytegleich“ stammte daher, dass die Grafiken in früheren Entwicklungen oft neu generiert wurden (Nutzer).

## Entscheidung
- Spitze und Mittelstück einmalig bereinigen: hellen Saum entfernen, Mittelstück auf einen nahtlos wiederholbaren Bereich zuschneiden. Logo unverändert. Danach gilt wieder: Grafiken bleiben unverändert, Prüfsummen in `ARCHITEKTUR.md`.
- Stange stufenlos: Höhe nach Prozent, weicher Übergang mit leichtem Nachfedern. Ersetzt „ein Mittelteil je 10 Prozent“ (Spec `visualisierung.md`); die Stücke waren der früher schwierigen Animation geschuldet (Nutzer).
- Endsequenz ohne Neuaufbau: Stangen gleiten auf den Endstand, dann Ergebnis-Banner über der Frage, Sieger hervorgehoben, übrige abgedunkelt. Ersetzt das 3-s-Vollbild-Overlay (Spec `ergebnisanzeige.md`).
- Kopf und Gestaltung nach SpargelWette: dünner Rahmen, Statusschild mit Restzeit statt schwebendem Timer, Kennung „Abstimmung“.
- Gras in zwei Ebenen: Wiese hinter der Beschriftung, Halmsaum vor den Stangenfüßen.

## Verworfene Alternativen
- Stücke behalten und nur weicher einblenden: blieb ungenau (36 % und 44 % gleich lang).
- Overlay behalten, nur sanfter: verdeckt die Stangen genau im entscheidenden Moment.
- Grafiken nur per CSS entschärfen: Der Saum steckt in deckenden Pixeln, CSS kann ihn nicht entfernen.
- Langer Grasverlauf ohne Kante: Die Stangen schienen zu schweben (Rückmeldung des Nutzers).

## Konsequenzen
- OBS-Pfad und Quellgröße 800 × 600 bleiben; Server-Anbindung, Takt, Ergebnislogik, Ton und Chat unverändert.
- Specs `visualisierung`, `ergebnisanzeige`, `countdown`, `sichtbarkeit` angepasst; `ENDED_OVERLAY_DURATION` entfällt.
- Die Testreihe zählt Endsequenzen unabhängig von der Darstellung.
