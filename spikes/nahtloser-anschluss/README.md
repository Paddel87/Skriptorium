# Probeschreiben Schritt 5.8 – Nahtloser Anschluss

Datum: 2026-10-08. Zweck: Akzeptanzkriterium von 5.8 prüfen – Fortsetzungen ohne Einleitung (Ort, Lage, Figuren neu eingeführt) und ohne Schlusssatz in der Mehrzahl der Läufe, Kanon-Treue und Figuren-Schreibweise nicht schlechter als vorher.

## Aufbau

- Testwelt „Die Salzmark“, Geschichte „Das Salz der Toten“ wie in 3.2/3.3; laufendes Kapitel „Die Grotte“ im Stand nach dem Probeschreiben 3.3 (`spikes/probeschreiben/ergebnisse/kapitel-4.txt`), abgeschnitten nach Absatz 22 (a: Dialogpause am Gitter, Äbtissin verlangt den Eid), 43 (b: „Von oben kam ein Geräusch.“) und 70 (c: Streit um das Buch).
- Anfrage über `prepare_request` mit leerer Anweisung („Setze das Manuskript an seinem Ende fort.“), Ilka vom Autor geführt; grok-4.6 und qwen3.8-max-0902, je 2 Läufe pro Stelle.
- `vorher`: Rahmen von `main` (`be92228`); `nachher`: Satz im Rahmen plus Abschnitt „Anschluss“ vor der Anweisung mit den letzten 30 Wörtern (Commit dieses Schritts). Aufruf: `VARIANTE=vorher|nachher uv run python spikes/nahtloser-anschluss/probe.py 2`.
- Bewertung: getrennte Instanz (Claude Sonnet, Unteragent), verblindet – 24 Texte in zufälliger Reihenfolge als T01–T24 ohne Variante und Modell, dazu Kanon und Kapitel; Zuordnung in `ergebnisse/schluessel.json`, Befunde mit Zitaten in `ergebnisse/bewertung.json`.

## Ergebnis

| | Einleitung | Schlusssatz | Kanon eindeutig / fraglich | Verstöße Figuren-Schreibweise |
|---|---|---|---|---|
| vorher (12) | 4 | 4 | 3 / 8 | 5 |
| nachher (12) | 3 | 5 | 5 / 9 | 1 |
| davon grok-4.6 vorher / nachher (je 6) | 2 / 1 | 1 / 3 | 0 / 1 eindeutig | 0 / 0 |
| davon qwen3.8-max vorher / nachher (je 6) | 2 / 2 | 3 / 2 | 3 / 4 eindeutig | 5 / 1 |
| Stelle a vorher / nachher (je 4) | 4 / 3 | 3 / 3 | | |
| Stelle b vorher / nachher (je 4) | 0 / 0 | 0 / 0 | | |
| Stelle c vorher / nachher (je 4) | 0 / 0 | 1 / 2 | | |

- **Formal erfüllt, aber schon vorher:** Die Mehrzahl der Läufe hat keine Einleitung (vorher 8/12, nachher 9/12) und keinen Schlusssatz (vorher 8/12, nachher 7/12). Die Testwelt reproduziert den Befund des Eigentümers („jede Fortsetzung“) nur an Stelle a, einer Dialogpause ohne neues Ereignis; dort ändert der neue Rahmen fast nichts (Einleitung 4 → 3).
- **Wirkung nicht belegt:** Unterschiede von 1–2 Texten bei n = 12 liegen im Rauschen. Einzig sichtbar: Stelle b – vorher wiederholte grok-4.6 einmal den letzten Satz wörtlich, nachher setzen alle vier Texte mit dem Folgesatz an.
- **Kanon-Treue:** eindeutige Widersprüche 3 → 5, alle bis auf einen bei qwen (u. a. Namensfehler „Mati“ vorher, „Mia“ nachher, Duzen Drach/Sera, Lampe ausgeblasen); nicht belastbar unterscheidbar, aber auch nicht als „nicht schlechter“ belegt.
- **Schlusssatz und Figuren-Schreibweise widersprechen sich teilweise:** Mehrere als Schlusssatz gezählte Enden („Die Äbtissin wartete.“) sind genau das Ende, das die Erinnerung zur Figuren-Schreibweise verlangt („Ende, sobald die Figur handeln oder antworten müsste“).
- **Kosten:** vorher 0,330 $, nachher 0,352 $; der Abschnitt „Anschluss“ kostet ca. 130–170 Token je Anfrage. Zeiten: grok-4.6 13–23 s, qwen3.8-max 41–122 s bis zum Ende. Je ein Anbieter-Fehler (502 im Strom) und eine Zeitüberschreitung beim ersten Textstück, wiederholt.

## Grenzen

Eine Testwelt, ein Kapitel, drei Stellen, 24 Texte; Bewertung durch eine Instanz. Die echten Texte des Eigentümers, an denen der Befund entstand, lagen nicht vor.
