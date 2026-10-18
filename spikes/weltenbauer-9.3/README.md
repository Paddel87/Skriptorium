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
- Ergebnisse unter `ergebnisse/`: `<auftrag>.txt` (Rohantwort; `.txt`, weil markdownlint jede `.md`-Datei prüft), `<auftrag>.json` (Verweise, Token, Kosten, `finish_reason`, Dauer), `<auftrag>-anfrage.txt` (Systemteil der Anfrage), `pruefung.md` (Tabelle und Einzelheiten).
- Schlüssel aus `OPENROUTER_API_KEY`, nur im scharfen Lauf.

### Vorbereitung und Selbsttest (2026-10-19, ohne KI)

- Trockenlauf auf `1371264`: alle vier Anfragen bauen ohne Fehler; geschätzt 3.133 (Figur), 3.594 (Ort), 3.143 (Gegenstand), 3.330 (Kultur) Token; Verweise wie oben.
- Prüflogik mit sechs selbst geschriebenen Antworten im Scratchpad geprüft (nicht im Repo, keine Ergebnisse): korrekt gegliedert; eine Ebene zu tief (Korrektur der Oberfläche greift); falsche Reihenfolge mit leerem Abschnitt und Füllwerk „Unbekannt.“; unbekannter Abschnitt und fester Abschnitt auf Ebene 2; Eintrag nur mit eigenen Abschnitten, der in der Import-Vorschau in zwei Einträge zerfällt; Antwort ohne Block. Jeder Fall wurde in der richtigen Spalte gemeldet.

## Ergebnis

Scharfer Lauf am 2026-10-19 (Cloud-Session, dritter Versuch) auf `40a02eb` (`src/` gleich `1371264`, Branch `feat/9.3-gegliederte-eintraege`), Modell `x-ai/grok-4.6`, je ein Aufruf ohne Wiederholung, alle vier mit `finish_reason: stop`, keine Fehler. Kosten zusammen **0,045 $** (0,010–0,012 $ je Auftrag), 16–26 s je Antwort, 2.883–3.291 Token Eingabe (Schätzung des Werkzeugs 3.133–3.594). Rohantworten, Anfragen und `pruefung.md` in `ergebnisse/`.

| Auftrag | Eintrag (Art) | (a) Abschnitte, Reihenfolge, Ebene 3 | (b) leer / Füllwerk | (c) Kanon (von Hand) | (d) Import |
|---|---|---|---|---|---|
| Figur | Brida Holm (figur) | Aussehen, Wesen, Fähigkeiten, Geschichte, Beziehungen – alle fünf, in Reihenfolge | keine | 1 knappe Spannung | ganz |
| Ort | Zollhaus (ort) | Lage, Aussehen, Bewohner, Geschichte – alle vier | keine | 1 knapper Widerspruch | ganz |
| Gegenstand | Das Wachtglas (gegenstand) | Aussehen, Zweck, Verwendung, Auswirkung – alle vier | keine | keiner | ganz |
| Kultur | Fischer vom Nordkai (kultur) | Gesellschaft, Glaube und Bräuche, Geschichte – alle drei | keine | keiner | ganz |

- **(a), (b), (d) maschinell:** In allen vier Antworten steht genau ein ```` ```kanon ````-Block mit Gruppe auf Ebene 1, Eintrag auf Ebene 2 und den festen Abschnitten seiner Art auf Ebene 3 in der Reihenfolge von `SECTIONS`; keine Ebenen-Korrektur nötig, kein unbekannter, leerer oder zu kurzer Abschnitt, kein Füllwerk. Die Import-Vorschau (`parse_markdown`) ergibt je genau den einen Eintrag mit richtiger Art; nichts zerfällt, keine Einleitung, nichts „nicht übernommen“. Kein Abschnitt fehlt – die KI hat bei neuen Einträgen jeden Abschnitt gefüllt (Weglassen leerer Abschnitte wurde damit nicht beansprucht).
- **(c) von Hand** (gegen `<auftrag>-anfrage.txt` und die Testwelt unter `spikes/modell-eignungstest/testwelt/salzmark`):
  - **Ort:** Der Auftrag enthielt eine Falle („dort arbeitet @Tomas Rehl“) – die KI hat sie erkannt: Rehl ist laut Kanon ehemaliger Zöllner, entlassen vor drei Jahren; die Antwort sagt „409 n. d. F. entlassen“ (412 − 3) und führt ihn als früheren Dienstmann ohne Schlüssel. Lage (Oberstadt auf dem Felsrücken, beim Vogtshaus und den Häusern der Salzherren), keine Pferde, Sanduhren und Tranlampen stimmen. **Knapper Widerspruch:** „Am Eingang ein eiserner Haken für den @Siegelring des Vogts, wenn der Zöllner siegelt“ – laut Kanon trägt Drach den Ring stets an der linken Hand, jedes Schreiben des Vogts trägt seinen Abdruck (`gegenstaende/siegelring.md`, `figuren/anselm-drach.md`). Der Text beider Einträge war **nicht** in der Anfrage (nur ihre Namen, sie waren nicht mit `@` genannt) – der Widerspruch entsteht aus fehlendem Wissen, nicht aus der neuen Gliederung.
  - **Figur:** Totensitte, Gegend (Grauhang, Nordkai), Ton stimmen; neue Namen sind in der Einleitung als neu ausgewiesen. **Knappe Spannung:** „Sie meidet den Südhafen und das Hafenbecken“, obwohl ihr Boot am Nordkai liegt, der laut `orte/kerrow.md` zum Südhafen gehört („Südhafen mit Hafenbecken und Nordkai“). Lesbar als „meidet den übrigen Hafen“ – kein eindeutiger Widerspruch.
  - **Gegenstand:** Sanduhr statt Federwerk und Glocken stimmen mit den Grundzügen der Welt. Erfunden und nicht im Kanon: Hafenwache, Hafenmeisterhaus am Nordkai, Glockenschläge vom Zollhaus – kein Widerspruch, die Einleitung bietet Namen und Herkunft ausdrücklich zur Wahl.
  - **Kultur:** Totensitte vollständig richtig wiedergegeben (kein Totenname nach Sonnenuntergang, Umschreibung, Meer und Totenbuch, Gruß „Salz auf dich“ mit dem Daumen, Weiß als Trauerfarbe); Doppelmond „ungeeignet zum Auslaufen“ passt zu „ungünstig für Eide und Reisen“ (`regeln/monde.md`); Hundekarren stimmt. Kein Widerspruch. Kleinigkeit: „vom @Kerrow-Nordkai“ – ein `@` mitten im Fließtext eines Vorschlags.
  - **Erfundenes als Vorschlag erkennbar:** Jede Antwort leitet den Block als Vorschlag ein, nennt Neues als neu oder bietet Varianten an (Ort und Gegenstand je drei, Figur zwei). Im Block selbst ist Erfundenes nicht markiert – wie im Rahmen vorgesehen; der ganze Block ist der Vorschlag, den der Autor übernimmt oder verwirft.

**Ergebnis:** Für das Akzeptanzkriterium „der Weltenbauer liefert gegliederte Einträge“ in allen vier Arten erfüllt – Gliederung je Art in Reihenfolge, Ebene 3, kein Füllwerk, Import ganz. Zwei knappe Abweichungen vom Kanon (Ort, Figur), beide ohne erkennbaren Bezug zur neuen Gliederung (Deutung: die nötigen Kanon-Texte fehlten in der Anfrage bzw. die Lage ist mehrdeutig). Einschränkung: je Art **eine** Antwort eines Modells, kein wiederholter Lauf; Zeitlinie und Regel nicht geprüft.
