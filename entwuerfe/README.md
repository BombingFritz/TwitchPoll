# Entwürfe

Design-Entwürfe zum Vergleich mit dem aktuellen `SpargelPoll.html`. Ansehen: `demo.html` öffnen und unter „Entwurf zum Vergleich“ den Pfad eintragen, z. B. `entwuerfe/SpargelPoll-1.0.html`. Ein Entwurf ist kein Release; OBS bindet weiter `SpargelPoll.html` ein.

Prüfen mit derselben Testreihe: `WIDGET=entwuerfe/SpargelPoll-1.0.html npm test`.

## SpargelPoll-1.0.html (Entwurf, 16.11.2026)
Vom Nutzer am 16.11.2026 freigegeben: Grafiken einmalig bereinigen, stufenlose Stange statt 10-%-Stücken, Ergebnis-Banner statt Vollbild-Overlay, bF-Logo groß neben der Frage.

- **Grafiken:** heller Saum (helle deckende Randpixel aus dem Freistellen vor weißem Grund) aus Spitze und Mittelstück entfernt; das Mittelstück ist auf einen nahtlos wiederholbaren Bereich (112 × 79 px) zugeschnitten. Das Logo ist unverändert.
- **Gras** (Rückmeldung des Nutzers, 16.11.2026: Stangen schwebten über dem langen Verlauf): zwei Ebenen, dahinter eine Wiese mit Halmtextur ab der Bodenlinie, davor ein Saum aus Halmen auf der Bodenlinie, der die Stangenfüße verdeckt. Halme als SVG im CSS (eigene Zeichnung, keine Bilddatei); der Saum liegt zweimal versetzt übereinander, damit sich das Muster nicht sichtbar wiederholt.
- **Stange:** Höhe stufenlos nach Prozent (0 %: nur die Spitze schaut aus dem Gras, 100 %: 300 px), weicher Übergang mit leichtem Nachfedern, auch beim Schrumpfen. Prozentzahlen zählen hoch.
- **Spalten:** Stange, Prozent, Stimmen und Name je Option in einer Spalte; Namen höchstens zwei Zeilen; feste Bodenlinie.
- **Endsequenz:** kein Neuaufbau; Stangen wachsen auf den Endstand, nach 1,4 s klappt das Ergebnis-Banner über die Frage („Ergebnis“ gold bzw. „Gleichstand“ grün), Sieger mit Schein und drehendem Strahlenkranz, übrige abgedunkelt, Ton einmal. Nach 8 s ausblenden.
- **Kopf:** dünnerer Rahmen (5 px), durchscheinender Hintergrund, grüne Kennung „Abstimmung“, Frage höchstens zwei Zeilen, Statusschild „Läuft m:ss“ (pulsiert ab 15 s, rot ab 10 s, am Ende „Beendet“) statt des schwebenden Timers.
- **Sonst:** Rahmen nicht mehr abgeschnitten, keine Emojis, Namen per `textContent` statt `innerHTML`, „1 Stimme“ statt „1 Stimmen“, Überbleibsel `vc-init` und `data-lt-installed` entfernt.
- Unverändert: Quelle 800 × 600, Server-Anbindung, Takt, Ergebnislogik, Ton, Chat.
