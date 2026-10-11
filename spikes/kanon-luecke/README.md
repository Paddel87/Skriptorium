# Spike 6.13 – Schaden fehlende Kanon-Einträge bei langen Kapiteln?

Fragestellung aus ADR-061: Bei langen Kapiteln füllen die letzten Seiten das Budget, und die
Auffüllung (nicht genannte Figuren-, Orts-, Gegenstands- und Kultur-Einträge) bleibt leer
(5.26, D.4/ADR-057). Führt das zu Verstößen gegen Kanon-Details?

## Aufbau

- Testgeschichten, Schreibstelle und Anweisungen **ohne `@`** wie in 5.26
  (`spikes/regel-002/geschichten.py`, `spikes/kanon-treue/proben.py`), Regel-002 (ADR-047).
- Zwei Varianten bei **gleichem Text**: `mit` (Auffüllung wie heute bei kurzen Kapiteln) und
  `ohne` (Auffüllung leer, wie bei langen Kapiteln) – `variante.py` ersetzt dafür nur
  `_filler_parts` im Modul, der Produktcode bleibt unverändert. Ein künstlich verlängertes
  Kapitel wurde verworfen: Es bräuchte erfundenen oder wiederholten Text.
- Ob weniger wörtlicher Vortext (Option C in ADR-061) den Anschluss verschlechtert, misst dieser
  Spike nicht; das gehört zu 6.3, falls C gewählt wird.

## Befund ohne KI (`technik.py` → `technik.md`)

Ohne Auffüllung fehlen alle Proben-Einträge außer der geführten Figur (Wendt) und der Regel
(Glimmstein) in Glimmergrund – beide gehen immer mit und dienen als Kontrolle.

Die Testgeschichten decken zwei Fälle ab (Stichwortsuche im Text bis zur Schreibstelle, mit
Kurzfassungen und Gesamtzusammenfassung; grob, Einzelfälle prüft die Bewertung):

- **Salzmark:** Pell (lesen), Tomas (Alkohol), Totensitte (Namen nach Sonnenuntergang),
  Schwester Mai (Schweigegelübde) und Oskar Lund (einäugig) stehen **nur im Kanon** – fehlt
  der Eintrag, weiß die KI es nicht. Die übrigen fünf haben Stichworttreffer im Text.
- **Glimmergrund:** Alle zwölf Details stehen **auch im bisherigen Text** – hier zeigt sich, ob
  die KI sie ohne Eintrag aus dem Text übernimmt.

## Läufe (Cloud-Session mit gültigem `OPENROUTER_API_KEY`)

```bash
AUFFUELLUNG=mit uv run python spikes/kanon-luecke/lauf.py
AUFFUELLUNG=ohne uv run python spikes/kanon-luecke/lauf.py
```

Je Variante 2 Geschichten × 3 Läufe × 7 Schritte = 42 Anfragen mit grok-4.6; geschätzt
zusammen 3–5 $. Ergebnisse unter `ergebnisse/<mit|ohne>/<geschichte>/lauf-<n>/`.

## Bewertung

Verblindet wie in 5.26 (`spikes/kanon-treue/bewertung/`): je Geschichte die sechs Ketten
gemischt und umbenannt, eine getrennte Instanz urteilt je Probe „eingehalten“, „nicht berührt“
oder „widersprochen“. Berichtet wird je Variante und Geschichte Mittel und Spannweite der
Quoten, getrennt nach „nur im Kanon“ und „auch im Text“. Bericht: `docs/research/kanon-luecke.md`.
