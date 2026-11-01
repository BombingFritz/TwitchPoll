# ADR: Token-Erneuerung und Start-Wiederholung im Widget

## Status
Angenommen (0.8.1)

## Kontext
War der Auth-Server beim Laden der Browser-Source nicht erreichbar, blieb das Widget bis zum manuellen Neuladen bei „Auth-Server nicht erreichbar!“ stehen. Ein ungültig gewordener Token führte zu dauerhaften 401-Fehlern bei Poll-Abfrage und Chat-Versand.

## Entscheidung
- Start-Wiederholung mit wachsenden Abständen: 10 s, 30 s, danach alle 60 s.
- Bei HTTP 401/403 von Twitch: neuen Token vom Auth-Server holen und den Aufruf genau einmal wiederholen.
- Höchstens eine Token-Erneuerung je 30 s; parallele Erneuerungen teilen sich einen Request.

## Verworfene Alternativen
Nicht dokumentiert.

## Konsequenzen
Das Widget erholt sich ohne manuelles Neuladen der Browser-Source. Die Erneuerung hilft nur, wenn der Auth-Server tatsächlich einen anderen, gültigen Token liefert; fehlende Scopes (403) behebt sie nicht.
