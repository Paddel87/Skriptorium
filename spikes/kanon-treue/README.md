# Kanon-Treue prüfen (Schritt 5.26)

Werkzeug und Rohdaten zum Bericht `docs/research/kanon-treue-grok.md`. Nutzt die Testgeschichten aus `spikes/regel-002/geschichten.py` (Regel-002, ADR-047).

| Datei | Zweck |
|---|---|
| `proben.py` | Kanon-Proben je Geschichte, Anweisungen mit und ohne `@` |
| `technik.py` | ohne Anbieter: welche Kanon-Einträge auf welchem Weg und wie vollständig in der Anfrage stehen → `technik.md` |
| `lauf.py` | Ketten mit den Proben-Anweisungen (`VARIANTE`, `FASSUNG=mit-at\|ohne-at`, `MODELL`, `LAENGE`, `LAEUFE`, `GESCHICHTEN`, `NACHEINANDER`, `WARTEZEIT`) |
| `uebersicht.py` | Kosten, Antwortzeiten, Länge je Variante → `ergebnisse/uebersicht.md` |
| `bewertung/` | Aufträge an die verblindeten Bewerter, ihre Bewertungen, Zuordnung K1–K9 → Variante (`mapping.json`), Skript zum Verblinden |
| `ergebnisse/` | Ketten: `g46-ohne-at` (nur Salzmark), `g46-mit-at`, `g47-mit-at` (Wartezeit 600 s); Glimmergrund ohne `@` ist `spikes/regel-002/ergebnisse/ausgang-mittel` |

```bash
uv run python spikes/kanon-treue/technik.py > spikes/kanon-treue/technik.md
VARIANTE=g46-mit-at FASSUNG=mit-at uv run python spikes/kanon-treue/lauf.py
VARIANTE=g47-mit-at FASSUNG=mit-at MODELL=x-ai/grok-4.7 WARTEZEIT=600 uv run python spikes/kanon-treue/lauf.py
```

Hinweis: grok-4.7 braucht an diesen Anfragen oft mehr als die 90 s, die das Produkt auf das erste Textstück wartet. Der verworfene Lauf mit 90 s liegt in `ergebnisse/g47-parallel-verworfen/` (mit Log), der Versuch nacheinander nur als Log.
