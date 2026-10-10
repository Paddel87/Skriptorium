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

## Ergebnisse (2026-10-10)

12 Ketten (A und B je 3 an beiden Geschichten), grok-4.6, „mittel“, Stand `a91e534` – `context` seit der Ausgangsmessung 5.24 unverändert, also gleicher Aufbau nach Regel-002. 84 Vorschläge, alle `stop`, keine leere Antwort, keine Sperre. Kosten 2,91 $. Ergebnisse unter `spikes/regel-002/ergebnisse/schreibweise-a/` und `…/schreibweise-b/`.

**Stil-Kennzahlen (`stil.py`), Mittel (Spannweite):**

| Kennzahl | ohne Schreibweise | A Dark Romance | B Thriller |
|---|---|---|---|
| Satzlänge Glimmergrund | 10,2 (8,9–11,8) | 11,8 (10,2–12,7) | 8,2 (7,0–9,1) |
| Satzlänge Salzmark | 8,7 (8,3–9,1) | 9,2 (8,9–9,7) | 7,2 (7,0–7,4) |
| wörtl. Rede % Glimmergrund | 46,6 (44,2–49,7) | 44,2 (43,8–44,6) | 40,9 (33,3–48,9) |
| wörtl. Rede % Salzmark | 59,7 (58,5–61,9) | 59,3 (58,1–61,4) | 63,9 (61,2–66,3) |
| Wörter Glimmergrund | 123,7 (94,9–146,0) | 120,3 (117,3–122,4) | 96,1 (76,4–108,3) |
| Wörter Salzmark | 115,2 (108,9–123,6) | 128,4 (115,4–143,1) | 106,7 (88,1–142,6) |

Kennzahlen aus `auswertung.py`: wörtliche Wiederholung in allen Varianten höchstens 2,7 %, Warte-Enden höchstens 1 je Kette – wie ohne Schreibweise.

**Verblindete Bewertung** (getrennte Instanz, Sonnet; je Geschichte neun Ketten aus N/A/B gemischt unter K1–K9, Schlüssel `blind-schluessel.json`, erst danach aufgedeckt):

- **Zuordnung: 18 von 18 richtig** (Glimmergrund 9/9, Salzmark 9/9), obwohl die Bewerterin ihre Sicherheit meist „niedrig“ oder „mittel“ nannte. A erkennbar an Bildlichkeit („als müsse sie den Satz erst salzen“), B an Verknappung („Silberschalen. Fünf.“).
- **Kanon-Proben Glimmergrund:** 0 Verstöße in allen neun Ketten, je 5–7 Proben sichtbar eingehalten; einziger Grenzfall (Kaffeetasse vor Wendt hingestellt, nicht getrunken) in einer Kette ohne Schreibweise.
- **Geführte Figur über die Anweisung hinaus:** Glimmergrund N 1/1/2, A 0/1/0, B 0/1/1 (meist der Inhalt der Antwort an Lenka, die Anweisung lässt ihn offen); Salzmark N 0/0/0, A 0/2/0, B 0/0/5 – der Ausreißer ist Schritt 7 („Wir streiten.“), dasselbe Muster wie in 5.24 ohne Schreibweise.

**Befund:**

1. **Die Schreibweise wirkt erkennbar.** Blind 18 von 18 zugeordnet. Messbar: B kürzt die Sätze in beiden Geschichten (Mittel unter der Spannweite ohne Schreibweise; in Glimmergrund berühren sich die Spannweiten knapp). A verlängert sie nur leicht, innerhalb der Streuung – A wirkt eher über Bilder als über Satzlänge, das misst `stil.py` nicht.
2. **Kanon-Treue nicht schlechter:** 0 Verstöße mit und ohne Schreibweise.
3. **Keine Sperren** bei „angedeutet“.
4. **Platz im Prompt bestätigt:** direkt hinter der Figuren-Schreibweise, mit Vorrang für Kanon und geführte Figuren – so in der Probe aufgebaut.
