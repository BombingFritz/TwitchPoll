# ADR: Gemeinsame Ergebnislogik

## Status
Angenommen; Nullstimmen-Regel bestätigt

## Kontext
Chat und visuelles Ergebnis sollen dieselbe Gewinner-/Gleichstand-Erkennung nutzen.

## Entscheidung
findWinner und calculatePercentages gemeinsam verwenden; 0 Stimmen bei allen Optionen als Gleichstand.

## Verworfene Alternativen
Keine weiteren Alternativen dokumentiert.

## Konsequenzen
Visuelles Ergebnis und Chat folgen derselben Stimmenlogik.
