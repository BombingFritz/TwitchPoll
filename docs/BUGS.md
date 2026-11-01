# Bugs und historische Probleme
Historische Angaben stammen aus Diskussion/Zusammenfassungen, nicht aus einer hier durchgeführten Reproduktion. Alte Dateinamen sind nicht zuverlässig zuordenbar.

| Symptom | Ursache | Fix | Regel zur Vermeidung |
|---|---|---|---|
| Nach OBS-Update erscheint das Widget in OBS nicht mehr (kein Token), im normalen Browser funktioniert es | **Bestätigt (01.11.2026):** Die neuere Chromium-Version in OBS sperrt Anfragen von Seiten, die über „Lokale Datei“ geladen werden (Herkunft `http://absolute`), an `localhost` („Local Network Access“). Die Anfrage an `/token` erreicht den Server gar nicht; die Server-Konsole zeigt keinen Abruf. Zusätzlich in 0.8.0: kein Neustart nach Token-Fehler, zweiter Token-Abruf ohne Cache-Schutz. | Browser-Source ohne „Lokale Datei“, stattdessen URL `file:///…/SpargelPoll.html` (Herkunft `null`, keine Sperre). Dazu 0.8.1 Start-Wiederholung und 0.8.2 Cache-Schutz. | Widgets nicht als „Lokale Datei“ einbinden. Bei fehlendem Token zuerst in der Server-Konsole prüfen, ob die Anfrage überhaupt ankommt (`[Token] Ausgabe an Widget-Herkunft: …`). | Token-Abrufe immer mit `cache: 'no-store'`; Token-Antworten nicht cachebar ausliefern; Start mit verzögert startendem Server testen. |
| Unruhiger Aufbau, springende/falsch positionierte Bildelemente | Laut Nutzer zu häufige Neuaufbauversuche bei jedem „tic“ und ungeeignete Bildänderungen | Heute anders aufgebaut; aktuelle Animation laut Nutzer fehlerfrei. Code verwendet differenzielle Updates. | Stabilität bei Stimmenupdates testen; keine unnötigen Neuaufbauten. |
| Siegeranimation begann vor Wachstum | Historisch zu früher Trigger | Delay nach Segmentwachstum | Wachstum und Sieger-Trigger gemeinsam prüfen. |
| Späte Progress-Events zerstörten Endzustand | Historische EventSub-Race-Condition | Endzustands-Guard; später REST-Polling | Endzustand nicht überschreiben; Folgepoll testen. |
| Fehlende Endanimation/HTTP 429 | Laut Vorgeschichte wiederholte EventSub-Subscriptions | REST-Polling | Keine ungefragte EventSub-Rückkehr. |
| Funktionen nach Refactoring fehlten | Zu viel Code beim WebSocket-Entfernen gelöscht | Funktionen wiederhergestellt | Funktionsdefinitionen, Aufrufe und Syntax prüfen. |
| Countdown fehlte | ends_at erwartet; API lieferte started_at/duration | getPollEndsAt | API-Felder und laufende Poll beim Start testen. |
| Strahlenkranz zu tief | Dekoration relativ zum falschen Container | In spargel-stack verschoben, top:-30px | Position am Sieger prüfen. |
| Falscher Sieger bei Gleichstand | Erster Treffer statt eindeutiger Höchstwert | findWinner liefert null | Gleichstand und Nullstimmen prüfen. |
| Stummer Sound in Zwischenversion | WAV enthielt nur leeren Header | Aktueller Code synthetisiert Web Audio; Nutzer bestätigt Lösung | Hörbarkeit prüfen; keine leeren Assets. |
| AudioContext blockiert | Autoplay-Richtlinie | Gemeinsamer Context und resume bei Interaktion | Browser-/OBS-Audio prüfen; Einmal-Flag garantiert keine Hörbarkeit. |
| Mehrere Sound-Trigger im Gleichstand möglich | Mehrere Options-Timeouts | resultSoundPlayed-Guard | Sound pro Poll-Ende zählen. |
| Defekte PNGs/unvollständige HTML-Ausgabe | Gekürzte Base64-Strings, Aufbau aus unvollständigen Snippets | Frühere Teildateien verworfen; aktuelle Datei enthält drei PNGs | Hashvergleich, Vollständigkeit und Diff prüfen. |
| Transition beim Regex-Edit entfernt | Zu breiter Löschbereich | Historische Korrektur nicht belegt | Gezielte Edits und Diff statt pauschalem Löschen. |
| Download fehlte trotz Fertigmeldung | Technische Ursache nicht gesichert | Download funktioniert inzwischen laut Nutzer | Artefakt erzeugen und Archiv lesen, bevor Lieferung melden. |
| Syntaxfehler in früheren Entwürfen | Template-/Generierungsfehler | Historische Textersetzungen bzw. Segmenterzeugung | Echter JS-Parser; Klammerzählen reicht nicht. |

TTF-Entwurfsprobleme betreffen ein anderes, nicht vorliegendes Servermodul und sind keine aktuellen Widget-Bugs.
