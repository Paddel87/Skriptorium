# Wirkungsprobe zu 5.6 – atmosphärische Schreibweise

Frage: Wirkt ein Block „Schreibweise“ (Genre, Tonalität, Atmosphäre, Tempo, Stil, Deutlichkeit) spürbar auf den Text, ohne die Kanon-Treue zu senken? Grundlage für die Form von 5.6 (FR-026), bevor Datenmodell und Oberfläche gebaut werden.

## Aufbau

- Ketten wie in `spikes/regel-002/` (Regel-002): beide Testgeschichten, sieben Anweisungen, je 3 Wiederholungen, grok-4.6, Länge „mittel“.
- Der Block steht direkt hinter der Figuren-Schreibweise (Vorschlag für 5.6) und tritt ausdrücklich hinter Kanon und Figuren-Schreibweise zurück. Produktcode unverändert: `lauf.py` hängt den Block für die Probe an `_writing_mode` an.
- Vergleich ohne Schreibweise: Ausgangsmessung aus 5.24 (`ausgang-mittel`, gleicher Stand von `context`).

| Variante | Genre | Tonalität | Atmosphäre | Tempo | Stil | Deutlichkeit |
|---|---|---|---|---|---|---|
| A | Dark Romance | sinnlich, melancholisch | intim, schwül | langsam | poetisch, bildhaft | angedeutet |
| B | Thriller | kalt, nüchtern | angespannt, gefährlich | atemlos | knapp, dialogreich | angedeutet |

Listenwerte vom Eigentümer übernommen (2026-10-10), siehe `docs/fahrplan.md` 5.6.

## Ablauf (Cloud-Session, gültiger `OPENROUTER_API_KEY`)

```bash
SCHREIBWEISE=A VARIANTE=schreibweise-a LAENGE=mittel LAEUFE=3 uv run python spikes/schreibweise-5.6/lauf.py
SCHREIBWEISE=B VARIANTE=schreibweise-b LAENGE=mittel LAEUFE=3 uv run python spikes/schreibweise-5.6/lauf.py
uv run python spikes/regel-002/auswertung.py schreibweise-a schreibweise-b
uv run python spikes/schreibweise-5.6/stil.py ausgang-mittel schreibweise-a schreibweise-b
```

Kosten etwa 0,25 $ je Kette, zusammen ca. 3 $ (12 Ketten).

## Auswertung

- **Wirkung (Stil-Kennzahlen, `stil.py`):** Satzlänge (B kürzer, A länger als ohne), Anteil wörtlicher Rede (B höher), Wörter. Als Wirkung gilt nach Regel-002 nur, was sich in beiden Geschichten zeigt und außerhalb der Spannweite von `ausgang-mittel` liegt.
- **Unterscheidbarkeit von Hand:** Je Geschichte Vorschläge aus A und B nebeneinander – erkennt man die Schreibweise ohne Etikett?
- **Kanon-Treue:** Glimmergrund-Kanon-Proben (Kaffee, Pfeifen, Sieben, Gelb, Spiegelschrift, Farnows Uhr, Hohe Berta, Brack) in A und B gegenüber `ausgang-mittel` – Verstöße zählen wie in 5.26.
- **Sperren:** `finish_reason` und leere Antworten je Variante (Deutlichkeit „angedeutet“).

## Ausgangswerte ohne Schreibweise (`ausgang-mittel`, aus 5.24)

| Geschichte | Satzlänge | wörtliche Rede % | Wörter |
|---|---|---|---|
| Glimmergrund | 10,2 (8,9–11,8) | 46,6 (44,2–49,7) | 123,7 (94,9–146,0) |
| Salzmark | 8,7 (8,3–9,1) | 59,7 (58,5–61,9) | 115,2 (108,9–123,6) |

## Ergebnisse

Noch offen – Lauf in einer Cloud-Session.
