# Reaktionszeit bis zum ersten Textstück – Schritt D.6

Datum: 2026-09-28, ca. 16:40–17:05 UTC. Zweck: Ursache der Ausreißer aus 3.3 (ADR-022) klären – grok-4.7 einmal 77 s, grok-4.6 über dem Ziel von 10 s.

## Aufbau

- Kontext wie die Oberfläche: Testwelt „Die Salzmark“ (`spikes/kontext-abnahme/abnahme.py`), `ContextBuilder`, Kapitel 4, eine Fortsetzungs-Anweisung; ca. 60.000 Zeichen (rund 17.000 Token Eingabe).
- `messung.py` ruft OpenRouter direkt auf (nicht über `ai_gateway`), damit Reasoning-Einstellung und Anbieter-Führung je Variante wählbar und die Denk-Token getrennt sichtbar sind. Übrige Parameter wie im Betrieb: `max_tokens` 8000, Temperatur 0,8.
- Ausgeführt im Skriptorium-Container auf dem VPS (Schlüssel dort in der Umgebung, Skript per Standardeingabe, nichts geschrieben) – auf ausdrücklichen Wunsch des Eigentümers; gemessen damit vom späteren Betriebsstandort aus.
- Ergebnisse: `ergebnisse/messung.jsonl` (nur Zeiten und Zählwerte, keine Texte). Kosten gesamt 0,705 $.

## Ergebnisse

Zeiten in Sekunden ab Absenden, gemessen beim Aufrufer. Antwortkopf in allen Läufen nach 0,03–1,5 s, erstes Denk-Stück meist nach 1–4 s.

| Variante | Einstellung | Läufe | erstes Textstück Median (min–max) | Denk-Token Median |
|---|---|---|---|---|
| prod-47 | grok-4.7, `effort: low` (wie `ai_gateway`) | 8 | 16,4 (4,3–29,0) | 1.242 |
| prod-46 | grok-4.6, `effort: low` | 6 | 6,4 (4,6–11,4) | 306 |
| cap1024-47 | grok-4.7, `reasoning.max_tokens: 1024` | 6 | 90,4 (54,3–149,3) | 5.274 |
| aus-47 | grok-4.7, `enabled: false` | 4 | – HTTP 400 „Reasoning is mandatory … cannot be disabled“ | – |
| latenz-47 | grok-4.7, `effort: low`, `provider.sort: latency` | 4 | 39,3 (28,7–67,6) | 2.047 |

## Befunde

1. **Ursache ist die Länge des Vorab-Denkens.** Die Zeit bis zum ersten Textstück wächst fast linear mit den Denk-Token (Median 16 ms je Denk-Token; z. B. 291 → 4,3 s, 1.955 → 29,0 s). Die Anzahl der Denk-Token streut von Anfrage zu Anfrage stark, bei gleichem Kontext. Der Ausreißer aus 3.3 (77 s, 5.271 Ausgabe-Token) passt in dieses Bild.
2. **Nicht weiter beeinflussbar:** `ai_gateway` nutzt schon die niedrigste Stufe (`effort: low`). Abschalten lehnt der Anbieter ab. Eine Obergrenze für Denk-Token wirkt **gegenteilig** – das Modell denkt länger (bis 12.000 Token), zwei von sechs Läufen hätten die 90-s-Grenze gerissen. Ausführender Anbieter war in allen Läufen xAI; `sort: latency` bringt keinen anderen Anbieter und keinen Vorteil.
3. **grok-4.6** denkt deutlich kürzer (Median 306 Token) und liegt in 5 von 6 Läufen unter 10 s; einmal 11,4 s, weil das Denken erst nach 6,6 s begann (Wartezeit beim Anbieter).
4. **90-s-Grenze in `ai_gateway`:** reicht für die Betriebseinstellung (höchstens 29 s hier, 77 s in 3.3); bei der Obergrenzen-Variante wäre sie oft überschritten.
5. **Nicht geprüft:** Einfluss der Tageszeit – alle Läufe in einem Zeitfenster am frühen Abend (MESZ).
