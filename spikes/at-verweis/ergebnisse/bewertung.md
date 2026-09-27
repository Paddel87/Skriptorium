# Blinde Bewertung – Abnahme 3.5

Getrennte Instanz (Claude Sonnet 5), 2026-09-27. Erhielt nur die fünf Texte unter neutralen Namen (T1–T5) und die vier Einzelheiten D1–D4 aus Kaels Eintrag, nicht die Anweisungen und nicht, welcher Text mit `@` entstand.

Zuordnung (erst nach der Bewertung aufgelöst): T1 = a3-anlegen, T2 = k1-preis-ohne-at, T3 = a1-ueberfahrt, T4 = a4-erster-blick, T5 = a2-preis.

| Text | D1 | D2 | D3 | D4 | Widersprüche |
|---|---|---|---|---|---|
| T1 | ja „Am linken Handgelenk saß das Band aus rotem Seegras" | ja „der kleine Finger fehlte" | ja „Kael nahm das Salz... Münzen lagen keine da" | ja „Dann pfiff er drei tiefe Töne" | keine |
| T2 | nein | nein | ja „Münzen kennt der Fluss nicht. Brot und Salz schon." | nein | keine |
| T3 | ja „Am linken Handgelenk saß das rote Seegrasband" | ja „Der kleine Finger fehlte" | ja „Sie hielt ihm Münzen hin. Er schüttelte den Kopf. „Salz"" | ja „Beim Anlegen pfiff er drei tiefe Töne" | keine |
| T4 | ja „Am linken Handgelenk trug er ein Band aus rotem Seegras" | ja „fehlte der kleine Finger" | ja „„Salz", sagte er. „Eine Handvoll. Keine Münzen."" | ja „Drei tiefe Töne pfiff er, kurz hintereinander" | keine |
| T5 | ja „Am linken Handgelenk trug er ein Band aus rotem Seegras" | ja „ihr fehlte der kleine Finger" | ja „„Eine Handvoll Salz", sagte er. „Nicht mehr. Münzen nehme ich nicht."" | nein | keine |

Summe (laut Instanz): 5 Texte verwenden mindestens eine Einzelheit eindeutig.

**Nachprüfung durch die bauende KI:** T2 (Kontrolle ohne `@`) nennt „ein Laib Brot, oder Salz" als Fährlohn – nicht „nur Salz", und ohne Kaels Eintrag im Kontext (Protokoll `k1-preis-ohne-at.json`: `kael_im_kontext` leer). Wahrscheinliche Quelle: die Anwohnerinnen der Testwelt handeln mit Salzfisch. Die drei körperlichen Einzelheiten D1, D2, D4 fehlen in T2 (Textsuche: 0 Treffer).
