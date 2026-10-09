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
