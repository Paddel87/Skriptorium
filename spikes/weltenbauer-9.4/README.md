# Weltenbauer schreibt Beziehungen (Schritt 9.4)

Probe zu ADR-093: Schreibt der Weltenbauer mit dem neuen Rahmen Beziehungen als Listenzeile mit genau einem `@Name` im Abschnitt „Beziehungen“, auf beiden Seiten, und lässt er eine vorhandene Figur unangetastet, deren Text nicht in der Anfrage steht?

## Zweck

Drei Aufträge in der Salzmark (`spikes/modell-eignungstest/testwelt/salzmark`), geladen und gestellt mit den Helfern aus `spikes/weltenbauer-9.3/probe.py`:

| Auftrag | Wortlaut (gekürzt) | erwartet |
|---|---|---|
| paar | Ehepaar aus `@Kerrow`, Netzflickerin und Träger | zwei Figuren, jede mit Beziehung zur anderen |
| lehrling | Lehrling, dem `@Tomas Rehl` das Rudern beibringt; Beziehung auch bei Tomas | neue Figur und Tomas überarbeitet (sein Text steht in der Anfrage), beide Seiten, nichts von Tomas verloren |
| freundin | alte Freundin von Ilka Varn (ohne `@`) | neue Figur mit Beziehung zu Ilka; Ilka nicht überarbeitet (ihr Text fehlt in der Anfrage), Gegenseite im Gespräch genannt |

Geprüft werden (a) jede Listenzeile unter „Beziehungen“ nennt genau ein `@Name` (Regel wie `ui/src/relations.ts`), (b) beide Seiten innerhalb des Blocks, (c) Umgang mit der vorhandenen Figur, (d) `parse_markdown` lässt jeden Eintrag ganz.

## Ablauf

```bash
TROCKEN=1 uv run python spikes/weltenbauer-9.4/probe.py   # nur Anfragen bauen
uv run python spikes/weltenbauer-9.4/probe.py             # scharf, grok-4.6, ohne Websuche
PRUEFEN=1 uv run python spikes/weltenbauer-9.4/probe.py   # gespeicherte Antworten neu prüfen
```

Ergebnisse unter `ergebnisse/` wie in 9.3: Rohantwort `<auftrag>.txt`, Kennzahlen `<auftrag>.json`, Systemteil der Anfrage `<auftrag>-anfrage.txt`, Tabelle `pruefung.md`.

## Ergebnis (2026-10-19, Cloud-Session, `x-ai/grok-4.6`)

Kosten 0,037 $ für drei Anfragen (ca. 3.300–3.500 Token Eingabe je Anfrage), alle mit `stop`.

| Auftrag | Figuren | (a) | (b) | (c) | (d) |
|---|---|---|---|---|---|
| paar | Mara Kess, Bren Kess | ja | ja – „verheiratet mit @Bren Kess“ / „verheiratet mit @Mara Kess“ | – | ganz |
| lehrling | Bram Kell, Tomas Rehl | ja | ja – „lernt Rudern von @Tomas Rehl“ / „bringt @Bram Kell das Rudern bei“ | Tomas überarbeitet, 1.300 → 1.192 Zeichen | ganz |
| freundin | Mara Pell | ja | ja | Ilka nicht im Block; im Gespräch: „Im Eintrag von Ilka Varn fehlt noch die Zeile zur Freundschaft (z. B. `- alte Freundin aus Tolm: @Mara Pell`). Der volle Text von Ilka steht hier nicht, deshalb nicht von mir nachgetragen.“ | ganz |

**Von Hand – Tomas Rehl:** Alle Angaben des Bestands sind erhalten (Alter, Aussehen mit Hinken und Narbe, Herkunft Tolm, Salzkrieg 397, Entlassung, Tagelöhner, Armbrust, Bruder Jorin 406, kein Alkohol mit seinem Satz, Pfeifen, Totensitte, Sprache, „Varn“, Kerbe). Die Länge sinkt, weil die Liste mit fettgedruckten Bezeichnungen in Abschnitte umgeschrieben ist. „409 entlassen“ statt „vor drei Jahren“ stammt aus der Zeitlinie (409, Handlung 412). Die drei alten Beziehungen stehen jetzt je als Zeile mit `@Name` (Ilka Varn, Anselm Drach, Jorin Rehl); dazu die neue zu Bram Kell. Die Import-Vorschau zeigt die Überarbeitung wie jede andere zur Bestätigung.

**Bewertung:** Der Weltenbauer hält die Schreibweise aus ADR-093 in allen drei Fällen ein, schreibt beide Seiten und überarbeitet eine vorhandene Figur nur, wenn ihr Text in der Anfrage steht. Ein Lauf je Fall – eine Stichprobe, kein Mittel über Wiederholungen; Regel-002 gilt hier nicht (die Anfrage beim Schreiben ist unverändert).
