# Abnahme Schritt 3.7 – Gast-Figuren mit echten KI-Läufen

Datum: 2026-09-27. Zweck: FR-017 im Schreibbetrieb prüfen – ein per `@` genannter Gast aus einer anderen Welt wird mit seinem Eintrag geschrieben, die Regeln seiner Heimatwelt gelten nicht (Entscheidung des Eigentümers in 3.7: nur Eintrag und Herkunft).

Das Akzeptanzkriterium selbst (Szenario 4: übrige Geschichten beider Welten zeigen den Gast weder im Menü noch im KI-Kontext) ist strukturell und durch Tests belegt: `tests/context/test_guests.py` (andere Geschichte der Welt, Geschichte der Heimatwelt), `tests/api/test_writing.py` (Verweis aus einer Geschichte ohne Verbindung → 422), `ui/src/views/Guests.test.tsx` und der End-to-End-Test „a guest from another world …“.

## Aufbau

- Testwelt „Salzküste“ (`abnahme.py`) mit Hafen, Hafenmeister Oren und der Regel „An der Salzküste friert es nie“; Gastwelt „Frostreich“ mit der Figur „Eiskönigin“ (vier Einzelheiten nur in ihrem Eintrag: silberne Maske, blaue Fingerspitzen, Eisstab, Flüsterton) und der Regel „Jedes gesprochene Wort gefriert zu Reif“, die nicht im Eintrag steht.
- Die Geschichte „Am Kai“ bindet die Eiskönigin als Gast ein. Anfragen durch denselben Ablauf wie der Schreib-Endpunkt (`api.flows.prepare_request`), grok-4.7, ohne Server.
- 3 Läufe mit `@Eiskönigin` (Ankunft, Gespräch mit Oren, erster Blick). Kosten 0,014 $ (je Lauf ca. 1.550 Token Eingabe laut Anbieter; die Schätzung des `ContextBuilder` lag bei ca. 370 – bei so kleinem Kontext überwiegt ein fester Grundanteil des Anbieters, für die Budgetgrenze von 30.000 ohne Belang).

## Ergebnis

Protokoll des `ContextBuilder`: Eiskönigin in allen Läufen als Baustein `gast` (Vorrang 2), mit Überschrift „Gast aus der Welt „Frostreich““; die Regel der Heimatwelt stand in keiner Anfrage. Blinde Bewertung durch eine getrennte Instanz (Claude Sonnet 5), Einzelheiten in `ergebnisse/bewertung.md`.

| Lauf | Maske | Fingerspitzen | Eisstab | Flüsterton | Regel der Heimatwelt | Widersprüche eindeutig / fraglich |
|---|---|---|---|---|---|---|
| g1-ankunft | ja | ja | ja | ja | nein | 0 / 1 |
| g2-gespraech | ja | ja | ja | ja | nein | 0 / 1 |
| g3-erster-blick | ja | ja | ja | ja | nein | 0 / 1 |

**FR-017 im Schreibbetrieb erfüllt:** 12 von 12 Einzelheiten, die Regel der Heimatwelt in keinem Text, kein eindeutiger Widerspruch zum Eintrag oder zur Salzküste. Die drei fraglichen Stellen folgen demselben Muster: Kälte als Ausstrahlung der Figur, ohne dass im Hafen etwas gefriert.

## Grenzen

Ein Modell (grok-4.7), drei Läufe, ein Gast; kleine Testwelt, daher kein Budgetdruck. Ob ein nicht genannter Gast über die Auffüllung genug Wirkung hat, ist nicht gemessen – laut Entscheidung des Eigentümers geht er nur mit, wenn nach dem Kanon der Welt Platz ist.
