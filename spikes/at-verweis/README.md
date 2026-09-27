# Abnahme Schritt 3.5 – `@`-Verweis mit echten KI-Läufen

Datum: 2026-09-27. Zweck: Akzeptanzkriterium FR-013 prüfen – `@Kael` in einer Anweisung → der KI-Text nutzt Wissen, das nur im Eintrag „Kael" steht; Einträge anderer Welten erscheinen nicht.

## Aufbau

- Testwelt „Flusslande" (`abnahme.py`): Figur „Kael" mit vier Einzelheiten, die nur in ihrem Eintrag stehen (D1 rotes Seegras-Band am linken Handgelenk, D2 fehlender kleiner Finger rechts, D3 Fährlohn nur Salz, D4 drei tiefe Pfiffe beim Anlegen); dazu 700 kleine Figuren „Anwohnerin NNN", die das Token-Budget so füllen, dass Kael **ohne** `@` nicht mehr hineinpasst. Das Protokoll des `ContextBuilder` bestätigt je Lauf, ob Kael im Kontext stand.
- Anfragen durch denselben Ablauf wie der Schreib-Endpunkt (`api.flows.prepare_request`), grok-4.7, ohne Server. Menü und Erkennung von `@Name` in der Oberfläche sind durch Komponenten- und End-to-End-Tests abgedeckt; der Verweis auf einen Eintrag einer anderen Welt wird vor dem Anbieter-Aufruf mit 422 abgelehnt (`tests/api/test_writing.py`).
- 4 Läufe mit `@Kael` (Überfahrt, Preis, Anlegen, erster Blick), 1 Kontrolllauf „Preis" ohne `@`. Anweisungen nennen keine der Einzelheiten. Kosten 0,217 $ (je Lauf ca. 26.600 Token Eingabe).

## Ergebnis

Blinde Bewertung durch eine getrennte Instanz (Claude Sonnet 5), Einzelheiten in `ergebnisse/bewertung.md`.

| Lauf | Kael im Kontext | D1 | D2 | D3 | D4 |
|---|---|---|---|---|---|
| a1-ueberfahrt | als Verweis | ja | ja | ja | ja |
| a2-preis | als Verweis | ja | ja | ja | nein (kein Anlegen in der Szene) |
| a3-anlegen | als Verweis | ja | ja | ja | ja |
| a4-erster-blick | als Verweis | ja | ja | ja | ja |
| k1-preis-ohne-at | nein | nein | nein | teilweise („Brot oder Salz", keine Münzen) | nein |

**FR-013 erfüllt:** Alle vier Texte mit `@Kael` nutzen Wissen aus Kaels Eintrag (15 von 16 möglichen Einzelheiten), ohne Widerspruch. Der Kontrolllauf ohne `@` enthält keine der drei körperlichen Einzelheiten.

## Grenzen

Ein Modell (grok-4.7), fünf Läufe, eine Figur. Die Testwelt ist künstlich (700 fast gleiche Einträge), damit der Unterschied zwischen mit und ohne `@` messbar wird; in einer kleinen Welt steht Kael auch ohne `@` über die Auffüllung im Kontext. Der Kontrolllauf trifft D3 teilweise, vermutlich über den Salzfisch-Handel der Anwohnerinnen. Gast-Einträge anderer Welten im `@`-Menü („ausdrücklich verbundene Einträge") gehören zu Schritt 3.7.
