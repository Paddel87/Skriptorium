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

Siehe Abschnitt „Ausgangsmessung“ unten (wird mit den Läufen gefüllt).
