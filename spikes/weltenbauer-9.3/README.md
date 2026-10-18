# Weltenbauer mit echter KI-Antwort (Schritt 9.3)

Probe zu ADR-092: Liefert der Weltenbauer mit dem neuen Rahmen Einträge, die je Art in die festen Abschnitte gegliedert sind – und lässt die Import-Vorschau jeden Eintrag ganz? Gehört zu den Akzeptanzkriterien von 9.3 („der Weltenbauer liefert gegliederte Einträge, Probe mit echter KI-Antwort“).

## Zweck

Je ein Auftrag für eine neue Figur, einen Ort, einen Gegenstand und eine Kultur in der Salzmark (`spikes/modell-eignungstest/testwelt/salzmark`, 29 Einträge, ohne Zusätze anderer Spikes). Geprüft wird je Antwort:

| | Prüfung | wie |
|---|---|---|
| (a) | Jeder Eintrag gliedert sich in die Abschnitte seiner Art in der Reihenfolge von `SECTIONS` (`src/skriptorium/canon/sections.py`), Ebene 3 unter dem Namen | Werkzeug; vermerkt auch Abschnitte auf Ebene 2, zu tiefe Überschriften und ob die Ebenen-Korrektur der Oberfläche (`ui/src/kanonBlock.ts`) nötig war |
| (b) | Leere Abschnitte fehlen statt Füllwerk | Werkzeug: leere Abschnitte, Füllwerk („unbekannt“, „nichts bekannt“ …), Abschnitte unter 5 Wörtern zum Nachsehen; fehlende Abschnitte nur aufgezählt (Weglassen ist erwünscht) |
| (c) | Kein Widerspruch zum Kanon, Erfundenes als Vorschlag erkennbar | von Hand, gegen die abgelegte Anfrage (`<auftrag>-anfrage.txt`) und die Testwelt |
| (d) | `parse_markdown` (`canon/importers/markdown.py`) ergibt genau die vorgeschlagenen Einträge mit richtiger Art, nichts zerfällt | Werkzeug: Namen und Arten Block ↔ Import, jeder Abschnitt im Text seines Eintrags, keine Einleitung, nichts „nicht übernommen“ |

## Ablauf

```bash
# Anfragen bauen, ohne die KI aufzurufen (kostenlos):
TROCKEN=1 uv run python spikes/weltenbauer-9.3/probe.py
# Scharf: vier Anfragen an grok-4.6, Antworten und Prüfung nach ergebnisse/:
uv run python spikes/weltenbauer-9.3/probe.py
# Gespeicherte Antworten erneut prüfen:
PRUEFEN=1 uv run python spikes/weltenbauer-9.3/probe.py
```

- Jede Anfrage läuft über `prepare_worldbuilder` wie `POST /api/worlds/{id}/worldbuilder`, Modell `x-ai/grok-4.6` (Voreinstellung, `MODELL` ändert es), ohne Websuche, ein Gesprächszug.
- Die Aufträge nennen vorhandene Einträge mit `@` (`@Kerrow`, `@Tomas Rehl`, `@Totensitte`), wie der Autor es in der Oberfläche tut; die Verweise werden nach der gemeinsamen Namensregel (`canon/names.py`) aufgelöst. Ohne `@` sieht der Weltenbauer von den übrigen Einträgen nur die Namen – ein Widerspruch zum Kanon wäre dann kaum prüfbar. So geht außerdem die neue Gliederung der Verweise in der Anfrage (`render`, ADR-092) mit.
- Ergebnisse unter `ergebnisse/`: `<auftrag>.md` (Rohantwort), `<auftrag>.json` (Verweise, Token, Kosten, `finish_reason`, Dauer), `<auftrag>-anfrage.txt` (Systemteil der Anfrage), `pruefung.md` (Tabelle und Einzelheiten).
- Schlüssel aus `OPENROUTER_API_KEY`, nur im scharfen Lauf.

### Vorbereitung und Selbsttest (2026-10-19, ohne KI)

- Trockenlauf auf `1371264`: alle vier Anfragen bauen ohne Fehler; geschätzt 3.133 (Figur), 3.594 (Ort), 3.143 (Gegenstand), 3.330 (Kultur) Token; Verweise wie oben.
- Prüflogik mit sechs selbst geschriebenen Antworten im Scratchpad geprüft (nicht im Repo, keine Ergebnisse): korrekt gegliedert; eine Ebene zu tief (Korrektur der Oberfläche greift); falsche Reihenfolge mit leerem Abschnitt und Füllwerk „Unbekannt.“; unbekannter Abschnitt und fester Abschnitt auf Ebene 2; Eintrag nur mit eigenen Abschnitten, der in der Import-Vorschau in zwei Einträge zerfällt; Antwort ohne Block. Jeder Fall wurde in der richtigen Spalte gemeldet.

## Ergebnis

**Noch nicht gelaufen.** Der zweite Versuch (Cloud-Session vom 2026-10-19) lief in einer Umgebung ohne `OPENROUTER_API_KEY` (Logbuch). Der scharfe Lauf steht aus.
