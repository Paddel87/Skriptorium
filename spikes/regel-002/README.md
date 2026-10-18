# Probeschreiben nach Regel-002

Werkzeug aus Schritt 5.24 (ADR-047): Jede Variante einer Änderung an Rahmen, Vorgaben oder Kontext der KI läuft **mindestens dreimal an beiden Testgeschichten**; berichtet werden Mittelwert und Spannweite. Als Wirkung gilt nur, was sich in beiden Geschichten zeigt und außerhalb der Spannweite des Vorher-Zustands liegt (`docs/decisions.md`, Regel-002).

## Die zwei Testgeschichten

| | Salzmark | Glimmergrund |
|---|---|---|
| Geschichte | „Das Salz der Toten“ | „Kein Stein glimmt umsonst“ |
| Quelle | `spikes/modell-eignungstest/testwelt/salzmark` | `spikes/modell-eignungstest/testwelt/glimmergrund` (5.24) |
| Welt und Ton | düstere Low Fantasy, Inseln am Meer; karg, kalt | Bergbaustadt um 1890; warm, ironisch, dialogreich |
| Erzählweise | Ich-Erzählerin, Präteritum | dritte Person, Präteritum, nah an Konstanze Wendt |
| Kapitellänge | ca. 1.800 Wörter | ca. 3.000 Wörter |
| Schreibstelle | Kapitel 1 nach „Also holten wir Pell.“ | Kapitel 3 nach „Das Schloss an der Sperre war so neu, dass es noch nach Fett roch.“ |
| Anweisungen | `spikes/vorgriff-zeitlinie/probe.py` | `…/kein-stein-glimmt-umsonst/anweisungen.md` |

Beide Geschichten gelten als fertig geplant: Die Gesamtzusammenfassung reicht bis zum Ende, spätere Kapitel liegen vor. Sieben Anweisungen je Kette, die fünfte leer („Weiter“). Glimmergrund enthält zusätzlich zwölf Kanon-Proben (ungewöhnliche, prüfbare Details) für 5.26 – Tabelle in `…/glimmergrund/README.md`.

## Ablauf

```bash
VARIANTE=vorher LAENGE=mittel LAEUFE=3 uv run python spikes/regel-002/lauf.py
# Änderung einspielen (Branch auschecken), dann:
VARIANTE=nachher LAENGE=mittel LAEUFE=3 uv run python spikes/regel-002/lauf.py
uv run python spikes/regel-002/auswertung.py vorher nachher
```

- `MODELL` (Standard `x-ai/grok-4.6`), `LAENGE` (`kurz`, `mittel`, `lang`), `LAEUFE` (Standard 3), `GESCHICHTEN` (Standard `salzmark,glimmergrund`).
- Jede Kette läuft in einem frischen Datenverzeichnis über `prepare_request` wie die Oberfläche; Vorschläge werden übernommen und angehängt. Ergebnisse unter `ergebnisse/<VARIANTE>/<geschichte>/lauf-<n>/`: `start.txt`, `01.txt` … `07.txt` mit Metadaten, `kapitel.txt`.
- Schlüssel aus `OPENROUTER_API_KEY`. Kosten je Kette bei grok-4.6 etwa 0,2–0,4 $.

## Kennzahlen (`auswertung.py`)

| Kennzahl | Bedeutung |
|---|---|
| wörtlich % | Anteil der 4-Wort-Folgen eines Vorschlags, die schon im Kapitel davor standen (Mittel über die Kette) |
| 6er doppelt | 6-Wort-Folgen, die in mehr als einem Vorschlag der Kette vorkommen |
| Warte-Enden | Vorschläge, deren letzter Satz mit Warten, Schweigen oder Blick endet (Wortliste, Anhaltspunkt) |
| Motivfolge | längste Folge aufeinanderfolgender Vorschläge mit demselben Ortsmotiv (Wortlisten je Geschichte) |
| Wörter | Wörter je Vorschlag (Mittel) |
| Kosten $ | Kosten der Kette laut Anbieter |

Vorgriff auf spätere Ereignisse und die Umsetzung der Anweisungen zur geführten Figur bleiben Bewertung von Hand an den Texten.

## Ergebnisse

### Ausgangsmessung (2026-10-09, Schritt 5.24)

Stand von `main` `6065f4b` (Rahmen nach 5.8, 5.15, 5.22), Modell `x-ai/grok-4.6`, Längen „mittel“ und „lang“, je 3 Ketten je Geschichte – 12 Ketten, 84 Vorschläge, alle mit `finish_reason: stop`, keine Fehler. Kosten zusammen 3,06 $ (mittel 1,47 $, lang 1,60 $). Ergebnisse in `ergebnisse/ausgang-mittel/` und `ergebnisse/ausgang-lang/`, Tabellen je Variante in `auswertung.md`.

**Gezählt (`auswertung.py`), Mittel (Spannweite):**

| Kennzahl | Salzmark mittel | Salzmark lang | Glimmergrund mittel | Glimmergrund lang |
|---|---|---|---|---|
| wörtlich % | 1,58 (0,73–2,73) | 0,91 (0,75–1,22) | 0,14 (0,00–0,31) | 0,20 (0,05–0,35) |
| 6er doppelt | 1,67 (0–3) | 0,67 (0–1) | 1,00 (0–3) | 0,00 (0–0) |
| Warte-Enden | 0,00 (0–0) | 0,33 (0–1) | 0,00 (0–0) | 0,00 (0–0) |
| Motivfolge | 2,00 (1–3) | 3,67 (3–5) | 1,67 (1–2) | 2,00 (1–3) |
| Wörter je Vorschlag | 115 (109–124) | 313 (251–373) | 124 (95–146) | 214 (192–233) |
| Kosten je Kette $ | 0,15 (0,14–0,15) | 0,17 (0,16–0,18) | 0,34 (0,31–0,37) | 0,36 (0,33–0,39) |

**Von Hand bewertet** (je Geschichte eine getrennte Instanz, Sonnet; Zitate stichprobenartig gegen die Texte geprüft), Mittel (Spannweite) je Kette:

| Kennzahl | Salzmark mittel | Salzmark lang | Glimmergrund mittel | Glimmergrund lang |
|---|---|---|---|---|
| Geführte Figur über die Anweisung hinaus | 0,00 (0–0) | 1,00 (0–3) | 0,67 (0–1) | 0,67 (0–1) |
| Vorgriffe auf spätere Kapitel | 1,33 (1–2) | 1,33 (0–4) | 1,00 (1–1) | 1,00 (1–1) |
| Ende an einer Übergabestelle (von 7) | 3,33 (3–4) | 2,33 (2–3) | 7,00 (7–7) | 5,33 (5–6) |

Die Zeile „Übergabestelle“ ist **zwischen den Geschichten nicht vergleichbar**: Für die Salzmark zählte nur ein Ende, das Ilka zum Handeln oder Antworten zwingt; für Glimmergrund jedes Ende ohne Abbruch mitten im Satz. Für spätere Vergleiche gilt je Geschichte die hier verwendete Auslegung.

**Befunde:**

1. **Länge schwankt innerhalb der Kette stark.** „mittel“ (150–300 Wörter) wird meist unterschritten (Salzmark 4 von 21, Glimmergrund 7 von 21 Vorschlägen im Band); bei „lang“ gibt es Vorschläge mit 24–46 Wörtern. Kurz sind vor allem Schritte, deren Anweisung fast nur aus Worten der geführten Figur besteht (Salzmark 2, Glimmergrund 1 und 7) – dort endet die KI zulässig nach der vorgegebenen Äußerung.
2. **„Weiter“ (Schritt 5) erzählt bei „lang“ zu viel:** Salzmark lang-1 576, lang-3 529 Wörter mit neuen Handlungsankern; Glimmergrund lang-1 und lang-3 je ca. 380 Wörter neue Wirtshausszene. Bei „mittel“ seltener und kürzer.
3. **Vorgriffe an festen Stellen:** Salzmark – jemand vermutet, das Buch sei „längst woanders“ oder bei den Schwestern (Schritte 5–7); Glimmergrund – Lenka sagt in Schritt 4, der Zettel stamme nicht von ihr (Kapitel 4) in 4 von 6 Ketten.
4. **Geführte Figur über die Anweisung hinaus nur dort, wo die Anweisung den Inhalt offenlässt:** Glimmergrund Schritt 4 (Antwort an Lenka ohne Inhalt → „Ich komme.“ in 4 von 6 Ketten), Salzmark Schritt 7 („Wir streiten.“ → drei erfundene Repliken in lang-3). Sonst werden die Vorgaben zur geführten Figur in allen Ketten ausgeschrieben.
5. **„lang“ bricht in Glimmergrund öfter mitten im Satz ab** (5 von 21 Vorschlägen, „mittel“ 0 von 21) und hat in beiden Geschichten mehr Widersprüche innerhalb der Kette (z. B. „drei Silberschalen“ für fünf Nächte, „vierzehn Lampen“, obwohl zwölf geborgen wurden).
6. **Wiederholung ist gering:** wörtlich höchstens 2,7 %, 6er doppelt höchstens 3 je Kette, Warte-Enden fast null.
7. **Kanon-Abweichungen** (Grundlage für 5.26): Schlüssel zum Schloss in 5 von 6 Glimmergrund-Ketten anders als in Kapitel 3; Lenkas Zettel in gerader Schrift (lang-1); „Metzger Ulm“ statt Bäcker (lang-2); „Planwagen mit Kennzeichen“ (mittel-3). Eingehalten in allen Ketten: kein Kaffee für Wendt, keine Sieben, kein Pfeifen, „Brack“ ohne Vornamen, Salm nennt keine Farbe.

Die Streuung zwischen den drei Läufen ist bei den Handzählungen so groß wie der Unterschied zwischen „mittel“ und „lang“ (Ausnahme: Wortzahl, Übergabe in Glimmergrund). Eine Änderung gilt nach Regel-002 erst als wirksam, wenn sie in beiden Geschichten außerhalb dieser Spannweiten liegt.

### Probe zu 8.11 Verweise zwischen Kanon-Einträgen (2026-10-13, ADR-088)

Cloud-Session, Modell `x-ai/grok-4.6`, Länge „mittel“. Vorher: Stand `9acc5bf` (vor 8.11) in einem Worktree, nachher: `main` `5c6a14f`. Alle Vorschläge `finish_reason: stop`, keine Fehler. Kosten zusammen 3,91 $ (Teil 1: 1,57 $ + 1,46 $; Teil 2: 0,43 $ + 0,44 $).

**Teil 1 – Rahmensatz „Gilt nur in: …“ in jeder Anfrage** (`lauf.py`, je 3 Ketten an beiden Geschichten; `ergebnisse/8.11-vorher/`, `ergebnisse/8.11-nachher/`). Mittel (Spannweite):

| Kennzahl | Salzmark vorher | Salzmark nachher | Glimmergrund vorher | Glimmergrund nachher |
|---|---|---|---|---|
| wörtlich % | 0,29 (0,08–0,50) | 0,71 (0,61–0,77) | 0,05 (0,00–0,08) | 0,41 (0,00–0,97) |
| 6er doppelt | 0,00 (0–0) | 0,33 (0–1) | 0,00 (0–0) | 0,33 (0–1) |
| Warte-Enden | 0,00 (0–0) | 0,00 (0–0) | 0,00 (0–0) | 0,33 (0–1) |
| Motivfolge | 1,33 (1–2) | 2,00 (1–4) | 1,33 (1–2) | 2,00 (2–2) |
| Wörter je Vorschlag | 128 (112–154) | 125 (115–138) | 118 (115–120) | 122 (113–132) |
| Kosten je Kette $ | 0,14 (0,14–0,15) | 0,15 (0,14–0,16) | 0,38 (0,38–0,38) | 0,33 (0,32–0,36) |

- **Nach dem Wortlaut von Regel-002 ein Befund:** „wörtlich %“ liegt nachher in beiden Geschichten im Mittel über der Spannweite von vorher (Salzmark 0,71 gegen höchstens 0,50; Glimmergrund 0,41 gegen höchstens 0,08). Alle übrigen Kennzahlen überschneiden sich mit vorher.
- **Einordnung (Deutung, nicht belegt):** Die Werte sind klein (unter 1 % der 4-Wort-Folgen) und liegen innerhalb der Ausgangsmessung aus 5.24 (Salzmark mittel 0,73–2,73, Glimmergrund 0,00–0,31 – Glimmergrund nachher knapp darüber); der Vorher-Lauf war diesmal ungewöhnlich niedrig. Der neue Satz betrifft Regeln, nicht Wiederholung. Ob es Zufall ist, klären nur weitere Läufe.

**Teil 2 – Wirkung der Verweise** (`verweise.py`, Salzmark, je 3 Ketten; `ergebnisse/8.11-verweise-vorher/`, `…-nachher/`). Zusatz nur im Lauf: Pell Sund verweist auf `@Zum Nassen Grab` und `@Gunda Hollt`, Vogtshaus auf `@Siegelring des Vogts`; Regel „Schnurgebot“ mit „Gilt nur in: @Tolm“ (rote Wollschnur am Handgelenk nach Dunkelheit). Die erste Anweisung nennt `@Pell Sund`; die Szene spielt in Kerrow.

- **Herangezogen:** Bei vollem Budget ist die ganze Testwelt in beiden Varianten in der Anfrage; nachher stehen die verwiesenen Einträge (Zum Nassen Grab, Gunda Hollt) als erste der Auffüllung, vorher in Kategorie-Reihenfolge (alle 3 Ketten, `bausteine` in `01.json`). Bei knappem Budget (`BUDGET=6000`, ohne KI, `bausteine-budget-6000.json`): nachher ist „Zum Nassen Grab“ dabei, vorher nicht – die beabsichtigte Wirkung.
- **Ortsgebundene Regel:** In keinem der 42 Vorschläge kommen Wollschnur oder Handgelenk-Schnur vor – weder vorher noch nachher. Die Regel wurde außerhalb von Tolm nicht angewendet; ein Unterschied durch den neuen Rahmensatz ist damit nicht nachweisbar (das Modell hielt sie schon ohne ihn ein). „Tolm“ kommt nur als Ziel der Nachricht an Marr vor (Schritt 7, Anweisung).
- **Widersprüche:** Stichprobe zu Pell (Alter, Lesen, Schlafplatz): keine Abweichung („Pell ist zwölf.“). Eine vollständige Bewertung von Hand durch eine getrennte Instanz wie in 5.24 ist **nicht** erfolgt.

**Nachlauf zu Teil 1 (Wahl des Eigentümers „3 weitere Läufe je Seite“):** je 3 weitere Ketten (`ergebnisse/8.11-vorher-2/`, `…/8.11-nachher-2/`, 1,46 $ + 1,45 $). Ausgewertet über alle 6 Ketten je Seite (die Läufe beider Ordner in einen gemeinsamen Ordner je Seite kopiert, `lauf-4` bis `lauf-6` für den Nachlauf), Mittel (Spannweite):

| Kennzahl | Salzmark vorher | Salzmark nachher | Glimmergrund vorher | Glimmergrund nachher |
|---|---|---|---|---|
| wörtlich % | 0,40 (0,08–0,91) | 0,70 (0,61–0,77) | 0,10 (0,00–0,23) | 0,20 (0,00–0,97) |
| 6er doppelt | 0,67 (0–4) | 0,50 (0–2) | 0,00 (0–0) | 0,17 (0–1) |
| Warte-Enden | 0,00 (0–0) | 0,00 (0–0) | 0,00 (0–0) | 0,17 (0–1) |
| Motivfolge | 1,50 (1–2) | 2,17 (1–4) | 1,50 (1–2) | 1,67 (1–2) |
| Wörter je Vorschlag | 123 (106–154) | 125 (110–138) | 118 (115–121) | 124 (100–144) |

**Ergebnis:** Keine Kennzahl liegt nachher in beiden Geschichten außerhalb der Spannweite von vorher – nach Regel-002 keine Wirkung des neuen Rahmensatzes; der Befund „wörtlich %“ aus drei Läufen war Streuung. Gesamtkosten der Probe 6,82 $.

*Korrigiert 2026-10-18:* Die erste Fassung lautete „Alle Mittelwerte von nachher liegen in der Spannweite von vorher“. Nachgerechnet mit `auswertung.py` über dieselben 6 Ketten je Seite (Tabelle oben bestätigt) liegen vier Mittelwerte außerhalb, jeweils nur in einer Geschichte: Salzmark Motivfolge 2,17 (vorher 1–2); Glimmergrund 6er doppelt 0,17 (vorher 0–0), Warte-Enden 0,17 (vorher 0–0) und Wörter 124 (vorher 115–121). Motivfolge, 6er doppelt und Wörter liegen innerhalb der Ausgangsmessung 5.24. Das eine Warte-Ende (`8.11-nachher/glimmergrund/lauf-2`, Schritt 2) ist ein Treffer der Wortliste in wörtlicher Rede („Berta schweigt, und die Klappe zu – …“), kein Ende mit Warten oder Schweigen. Am Ergebnis nach Regel-002 ändert das nichts.

### Probe zu 9.3 Gegliederte Einträge je Art (2026-10-19, ADR-092)

Cloud-Session, Modell `x-ai/grok-4.6`, Länge „mittel“, je 3 Ketten an beiden Geschichten. Vorher: `2ac204b` (`main` vor 9.3) in einem Worktree, nachher: `40a02eb` (`src/`, `ui/`, `tests/` gleich `1371264`, Branch `feat/9.3-gegliederte-eintraege`). Geändert ist nur die Form der Anfrage: Die Abschnitte eines Eintrags stehen eine Ebene unter seinem Namen (die Eintragsüberschrift `# Name` wird `### Name`), leere Abschnitte fallen weg. 84 Vorschläge, alle `finish_reason: stop`, keine Fehler. Kosten 1,50 $ (vorher) + 1,44 $ (nachher) = 2,94 $. Ergebnisse in `ergebnisse/vorher-9.3/` und `ergebnisse/nachher-9.3/` (je `auswertung.md`), verblindete Bewertung in `ergebnisse/9.3-bewertung/`.

**Gezählt (`auswertung.py`), Mittel (Spannweite):**

| Kennzahl | Salzmark vorher | Salzmark nachher | Glimmergrund vorher | Glimmergrund nachher |
|---|---|---|---|---|
| wörtlich % | 0,64 (0,44–0,76) | 0,40 (0,16–0,71) | 0,15 (0,00–0,39) | 0,71 (0,14–1,05) |
| 6er doppelt | 0,33 (0–1) | 0,00 (0–0) | 0,00 (0–0) | 1,00 (0–3) |
| Warte-Enden | 0,00 (0–0) | 0,00 (0–0) | 0,00 (0–0) | 0,00 (0–0) |
| Motivfolge | 1,00 (1–1) | 2,00 (1–3) | 1,33 (1–2) | 1,33 (1–2) |
| Wörter je Vorschlag | 105 (102–107) | 113 (94–140) | 126 (110–142) | 132 (129–137) |
| Kosten je Kette $ | 0,15 (0,15–0,16) | 0,14 (0,13–0,16) | 0,35 (0,32–0,38) | 0,33 (0,32–0,37) |

- **Außerhalb der Vorher-Spannweite in beiden Geschichten:** nur „wörtlich %“, und zwar **gegenläufig** – Salzmark niedriger (0,40 gegen mindestens 0,44), Glimmergrund höher (0,71 gegen höchstens 0,39). Eine gleichgerichtete Wirkung zeigt sich damit nicht; nach Regel-002 keine Wirkung und keine Verschlechterung. Glimmergrund 0,71 liegt über der Ausgangsmessung 5.24 (0,00–0,31) und über allen bisherigen Mittelwerten dieser Geschichte (8.11 nachher 0,41); Einzelwerte bis 1,05 % – klein, aber zu beobachten.
- **Nur in einer Geschichte außerhalb:** Salzmark Motivfolge 2,00 (vorher 1–1), Wörter 113 (vorher 102–107), Kosten 0,14 (vorher 0,15–0,16); Glimmergrund 6er doppelt 1,00 (vorher 0–0). Motivfolge, Wörter und 6er doppelt liegen innerhalb der Ausgangsmessung 5.24 (Salzmark 1–3 bzw. 109–124; Glimmergrund 0–3).

**Widersprüche zum Kanon** (je Geschichte eine getrennte Instanz, Sonnet, verblindet: Ketten K1–K6 in zufälliger Reihenfolge, Zuordnung in `mapping.json`; die beiden eindeutigen Funde von der bauenden KI am Text und am Kanon nachgeprüft):

| | Salzmark vorher | Salzmark nachher | Glimmergrund vorher | Glimmergrund nachher |
|---|---|---|---|---|
| eindeutig je Kette | 0,00 (0–0) | 0,33 (0–1) | 0,00 (0–0) | 0,33 (0–1) |
| knapp je Kette (nur Salzmark erhoben) | 0,33 (0–1) | 0,67 (0–1) | – | – |
| Kanon-Proben widersprochen (12 je Kette) | – | – | 0 | 0 |

- Salzmark nachher `lauf-2`, Schritt 5: Gunda sagt am Abend „nicht ‚Heddas Kind‘“ – Name einer Toten nach Sonnenuntergang (`kultur/totensitte.md`); ob die Szene schon nach Sonnenuntergang spielt, sagt der Text nicht ausdrücklich („Am dritten Abend“, „bevor die Mitternachtsglocke schlägt“).
- Glimmergrund nachher `lauf-3`, Schritt 6: Salm nennt Wendt „mein Teuerster“, laut `figuren/benedikt-salm.md` nur gegenüber Männern („gnädige Frau“ gegenüber Damen).
- Knapp (Salzmark): Asch „stottert nur, wenn’s ihn was kostet“ (nachher `lauf-3`), Säcke „von der Bucht“ (vorher `lauf-3`), Marr habe „das Buch versprochen“ (nachher `lauf-2`).
- Kaffee: In drei Glimmergrund-Ketten (vorher `lauf-1`, nachher `lauf-1` und `lauf-3`) bringt Frau Farnow „Kaffee für alle“; Wendt trinkt nicht, die Szene endet vorher – als „nicht berührt“ gewertet, kein Verstoß.

**Ergebnis:** Gezählt keine Wirkung nach Regel-002. Bei den Widersprüchen liegt nachher in beiden Geschichten je **ein** eindeutiger Widerspruch in drei Ketten, vorher keiner – nach dem Wortlaut von Regel-002 („in beiden Geschichten außerhalb der Spannweite von vorher“) ein **Befund**. Einordnung (Deutung, nicht belegt): Die Rate von nachher (2 in 6 Ketten) entspricht der für grok-4.6 in 5.26 gemessenen (3 eindeutige in 12 Ketten); vorher lag diesmal bei 0. Beide Funde betreffen Einzelheiten, die vorher wie nachher im Wortlaut in der Anfrage stehen (ohne KI nachgebaut für die Schritte 1, 5 und 6 vom Kettenanfang: „Nach Sonnenuntergang wird kein Toter …“ und „mein Teuerster“ / „gnädige Frau“ in beiden Ständen enthalten; geschätzt 9.303 → 9.326 bzw. 28.733 → 28.749 Token); die Änderung verschiebt nur Überschriften-Ebenen. Ob es Streuung ist, klären nur weitere Läufe (vgl. den Befund „wörtlich %“ zu 8.11, der sich im Nachlauf als Streuung erwies).
