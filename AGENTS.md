# Regeln für KI-Assistenten

- Vor Änderungen `docs/ARCHITEKTUR.md`, `docs/adr/`, `docs/BUGS.md` und `docs/OFFEN.md` lesen.
- Bei Konflikt mit einem ADR erst nachfragen.
- Referenz ist immer `SpargelPoll.html` im aktuellen Stand von `main`.
- Versionen nur über `CHANGELOG.md` und Git-Tags (`vX.Y.Z`), nie über den Dateinamen.
- Im Repository nur Platzhalter für Client-ID, Broadcaster-ID und Tokens; keine Secrets ausgeben.
- Bestehende Struktur erhalten: eine HTML-Datei, Inline-CSS/JS, drei eingebettete PNGs.
- Nur beauftragte, gezielte Änderungen; kein Neuaufbau der Datei aus Suchsnippets.
- Timer, Layout, API-Anbindung und Animation ohne Auftrag unverändert lassen.
- Poll-Daten per REST; keine ungefragte EventSub-/IRC-/Stechen-Erweiterung.
- Visuelles und textliches Ergebnis nutzen `findWinner()` und `calculatePercentages()`.
- Null Stimmen für alle Optionen gelten als Gleichstand.
- Sound per Web Audio, einmal je Poll-Ende.
- Ergebnisnachricht ausschließlich per Helix-API; Versandzeitpunkt (Overlay-Ende) bleibt.

## Pflichtchecks vor Auslieferung

- Script extrahieren und mit einem echten JS-Parser prüfen (`node --check`); Klammerzählen reicht nicht.
- Vollständigkeit: HTML-Body, Script, alle Funktionsdefinitionen und `init();` vorhanden.
- Diff zur tatsächlichen Ausgangsdatei prüfen; unerwartete Änderungen ausschließen.
- Alle drei eingebetteten PNGs bytegleich erhalten; Hashes vergleichen.
- Keine echten IDs/Tokens im Diff.
- Updates dürfen keinen unnötigen Neuaufbau der Optionen auslösen.
- In OBS/Browser testen: 2–5 Optionen, wechselnde Stimmen, 100 %, eindeutiger Sieger.
- Gleichstand mit Stimmen und 0:0: kein Sieger-Styling, Sound nur einmal.
- Countdown, Overlay, Auto-Hide und Folge-Umfrage regressionsprüfen.
- Audio nach Interaktion sowie Chat-Erfolg/-Fehler prüfen; echte Chat-Tests vorher abstimmen.
- `CHANGELOG.md` und betroffene Docs im selben Commit aktualisieren.
- Lieferung als vollständige Dateien, nicht als Fragmente.
- Tests, Nutzerbestätigungen und Vermutungen klar unterscheiden; „behoben“ nur mit Nachweis.
