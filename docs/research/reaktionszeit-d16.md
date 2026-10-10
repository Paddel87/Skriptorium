# Reaktionszeit grok-4.7 an echten Schreib-Anfragen (D.16)

Erkundung auf die Vorlage E2 aus 5.26 (ADR-051: „erst wissen“). Stand 2026-10-10. Werkzeug und Rohdaten: `spikes/reaktionszeit/d16.py`, `spikes/reaktionszeit/ergebnisse/d16-*.jsonl`.

## Kurzfassung

1. **Abhilfen über die Denk-Einstellung scheiden aus.** Denken abschalten lehnt der Anbieter ab („Reasoning is mandatory for this endpoint“). Ein Deckel von 1.024 Denk-Token wirkt umgekehrt: grok-4.7 denkt damit 2- bis 3-mal so lange (10.500–15.000 Denk-Token, 162–244 s bis zum ersten Textstück).
2. **Die Vorgaben aus 5.8–5.22 verlängern das Denken, erklären es aber nicht allein.** Ohne Anschluss-Hinweis und Vorgaben sinkt die Zeit bis zum ersten Textstück im Mittel um ca. 30–40 % (Salzmark 110 → 67 s, Glimmergrund 58 → 41 s); die Spannweiten berühren oder überlappen sich – nach Regel-002 kein belegter Effekt. Auch ohne Vorgaben bleibt grok-4.7 bei bis zu 88 s, an der Grenze der Wartezeit (90 s).
3. **Der Anbieter schwankt stark.** Dieselbe Art Anfrage brauchte in 5.26 bis 370 s (Mittel 113–131 s je Vorschlag), hier höchstens 157 s. Alle Anfragen liefen bei xAI; eine andere Anbieter-Führung gibt es für grok-4.7 nicht.
4. **Die Größe des Kontexts ist nicht die Ursache.** Glimmergrund (ca. 86.000 Zeichen) ist schneller als die Salzmark (ca. 28.000 Zeichen); die Gegenprobe aus 5.26 (25.000 Token, einfache Anweisung) lag bei 4 s. Das lange Denken entsteht an der Schreibaufgabe selbst.
5. **grok-4.6 ist unauffällig:** 12–28 s bis zum ersten Textstück, 550–1.200 Denk-Token – im Ziel aus ADR-035 (meist unter 10 s verfehlt, Höchstwert 20 s an der Salzmark knapp überschritten; die Ziele galten für die Anfrage aus D.6 ohne die Vorgaben späterer Schritte).

Ursache also **beides**: die Schreibaufgabe mit ihren Vorgaben lässt grok-4.7 lange vordenken, der Anbieter schwankt zusätzlich stark. Über die Einstellungen des Skriptoriums ist das nicht zuverlässig unter 90 s zu bringen.

## Aufbau

Echte Schreib-Anfrage an der Schreibstelle beider Testgeschichten (Regel-002), Anweisung 2 aus 5.26 mit `@`, Länge „mittel“, einzeln statt in Ketten, je Variante 3 Anfragen je Geschichte, Varianten parallel (5.26: Parallelität ist nicht die Ursache). Direkt bei OpenRouter wie D.6, Wartezeit 600 s, gemessen beim Aufrufer.

## Ergebnisse

Zeit bis zum ersten Textstück und Denk-Token je Anfrage, Mittel (Spannweite):

| Variante | Geschichte | erstes Textstück s | Denk-Token | über 90 s |
|---|---|---|---|---|
| grok-4.6, voll | Salzmark | 23 (19–28) | 1.027 (930–1.208) | 0/3 |
| grok-4.6, voll | Glimmergrund | 15 (12–18) | 646 (553–802) | 0/3 |
| grok-4.7, voll | Salzmark | 110 (71–157) | 5.529 (3.915–7.266) | 2/3 |
| grok-4.7, voll | Glimmergrund | 58 (44–74) | 4.406 (3.186–5.592) | 0/3 |
| grok-4.7, ohne Vorgaben | Salzmark | 67 (54–88) | 4.736 (3.615–5.674) | 0/3 |
| grok-4.7, ohne Vorgaben | Glimmergrund | 41 (37–44) | 3.385 (3.137–3.522) | 0/3 |
| grok-4.7, Deckel 1.024 | Salzmark | 223 (188–244) | 12.896 (10.606–15.032) | 3/3 |
| grok-4.7, Deckel 1.024 | Glimmergrund | 182 (162–194) | 11.958 (10.530–14.103) | 3/3 |
| grok-4.7, Denken aus | beide | – (abgelehnt, HTTP-Fehler im Strom) | – | – |

Der Text selbst folgt nach dem ersten Textstück in 1–15 s. Kosten der Messreihe 1,27 $.

## Folgerung

Abhilfe ist eine Entscheidung des Eigentümers (Vorlage in Logbuch und ADR). Die Optionen: grok-4.7 aus der Auswahl nehmen, bis der Anbieter schneller ist (Landeplatz 5.12, Modell-Auswahl vom Anbieter); die Wartezeit für grok-4.7 verlängern; die Vorgaben für grok-4.7 kürzen; nichts ändern.
