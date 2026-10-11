# Spike 6.13 – Schaden fehlende Kanon-Einträge bei langen Kapiteln?

**Stand:** 2026-10-11, Code-Stand `main` `01ed910`. Fragestellung aus ADR-061, Verfahren nach Regel-002 (ADR-047). Werkzeuge und Rohdaten in `spikes/kanon-luecke/`.

## Ergebnis in Kürze

- **Ja, fehlende Einträge schaden.** Ohne Auffüllung widerspricht grok-4.6 dem Kanon in beiden Testgeschichten deutlich öfter: je Kette im Mittel 4,0 Widersprüche statt 0 (Salzmark) und 3,3 statt 0,7 (Glimmergrund). Der Unterschied liegt in beiden Geschichten außerhalb der Spannweite, er gilt damit nach Regel-002 als Wirkung.
- **Details, die nur im Kanon stehen** (Salzmark), gehen ohne Eintrag fast immer verloren: eingehalten 1 von 15 Proben (mit Auffüllung 10 von 15). Die KI weicht meist aus (9-mal „nicht berührt“) oder erfindet Gegenteiliges (5 Widersprüche, z. B. die schweigende Novizin spricht, Tomas trinkt, der Name des Toten fällt am Abend).
- **Details, die auch im bisherigen Text stehen** (Glimmergrund), übernimmt die KI großteils aus dem Text, aber nicht verlässlich: Quote 85 % (83–86 %) statt 96 % (88–100 %), dazu mehr Widersprüche außerhalb der Proben (u. a. „vier“ Stollen, Lazarett „hinter der Kirche“, Trauerband falsch getragen).
- **Kontrollen** (geführte Figur, Regel – immer in der Anfrage) bleiben in beiden Varianten bei 100 %: Der Effekt liegt an den fehlenden Einträgen, nicht an einer allgemein schwächeren Kette.

## Aufbau

- **Varianten bei gleichem Text:** `mit` – Auffüllung mit nicht genannten Figuren-, Orts-, Gegenstands- und Kultur-Einträgen wie heute bei kurzen Kapiteln; `ohne` – Auffüllung leer, wie bei langen Kapiteln (5.26, D.4/ADR-057). `variante.py` ersetzt nur `_filler_parts`, der Produktcode bleibt unverändert.
- **Abweichung vom Schritt-Text:** 6.13 nennt „heutige Reihenfolge gegen Kanon vor den Seiten“. Gemessen wurde stattdessen Auffüllung an/aus bei gleichem Text – ein künstlich verlängertes Kapitel bräuchte erfundenen Text (Logbuch 2026-10-11, ADR-061). Der Vergleich trifft damit die Frage „schadet das Fehlen?“; was eine Obergrenze für die Seiten am Anschluss kostet, misst er nicht (→ 6.3).
- **Läufe:** grok-4.6, Länge „mittel“, Anweisungen ohne `@` aus 5.26 (`spikes/kanon-treue/proben.py`), jeder Vorschlag übernommen; je Variante 2 Geschichten × 3 Ketten × 7 Schritte = 42 Anfragen, alle ohne Abbruch. Kosten: `mit` 1,45 $, `ohne` 1,22 $.
- **Anfragegröße Schritt 1** (`technik.md`): Salzmark 9.280 → 4.920 Token, Glimmergrund 28.711 → 22.823 Token.
- **Bewertung:** je Geschichte eine getrennte Instanz (Sonnet, ohne Gesprächsverlauf), **verblindet**: sechs Ketten in zufälliger Reihenfolge (`verblinden.py`, Startwert 613), Herkunft unbekannt; je Kette und Probe E (eingehalten), N (nicht berührt), W (widersprochen) mit Zitat, dazu weitere eindeutige Widersprüche. Aufträge, Bewertungen und Zuordnung in `spikes/kanon-luecke/bewertung/`. Alle Widersprüche vom Coding-Agent am Text und am Kanon nachgeprüft – alle Zitate gefunden, kein Urteil geändert.
- **Gruppen der Proben** nach dem Befund ohne KI (Stichwortsuche im Text bis zur Schreibstelle, `README.md`): Salzmark „nur im Kanon“ Proben 1, 2, 3, 4, 8, „auch im Text“ 5, 6, 7, 9, 10; Glimmergrund „auch im Text“ alle außer den Kontrollen 5 (geführte Figur Wendt) und 8 (Regel Glimmstein).

## Quoten der Proben

Quote = E / (E + W), also eingehaltene unter den berührten Proben. Summen über drei Ketten; Quote je Kette, Mittel (Spannweite). Ausgabe von `bewertung/auswertung.py`.

| Geschichte | Gruppe | Variante | E | N | W | Quote je Kette | Mittel (Spannweite) |
|---|---|---|---|---|---|---|---|
| Salzmark | nur im Kanon | mit | 10 | 5 | 0 | 100 / 100 / 100 % | 100 % (100–100 %) |
| Salzmark | nur im Kanon | ohne | 1 | 9 | 5 | 33 % / – / 0 % | 17 % (0–33 %) |
| Salzmark | auch im Text | mit | 13 | 2 | 0 | 100 / 100 / 100 % | 100 % (100–100 %) |
| Salzmark | auch im Text | ohne | 1 | 12 | 2 | 0 % / 0 % / 100 % | 33 % (0–100 %) |
| Glimmergrund | auch im Text | mit | 17 | 12 | 1 | 100 / 88 / 100 % | 96 % (88–100 %) |
| Glimmergrund | auch im Text | ohne | 17 | 10 | 3 | 83 / 86 / 86 % | 85 % (83–86 %) |
| Glimmergrund | Kontrolle | mit | 3 | 3 | 0 | 100 / 100 / 100 % | 100 % (100–100 %) |
| Glimmergrund | Kontrolle | ohne | 4 | 2 | 0 | 100 / 100 / 100 % | 100 % (100–100 %) |

„–“: In dieser Kette wurde keine Probe der Gruppe berührt (alle N), die Quote ist nicht bestimmt; das Mittel läuft über die übrigen Ketten.

**Lesart:** In Salzmark fällt nicht nur die Quote, sondern vor allem die Zahl der berührten Proben (15 → 6 bei „nur im Kanon“, 15 → 3 bei „auch im Text“). Ohne Einträge schreibt die KI um die Details herum – das ist kein Verstoß, aber die Welt verliert ihre Eigenheiten. Auch die „auch im Text“-Details in Salzmark (Aschturm, Sera, Salzeid, Trauersitte) stehen dort nur in Kurzfassungen und Gesamtzusammenfassung und reichen ohne Eintrag nicht.

## Widersprüche je Kette

Proben-Widersprüche und weitere eindeutige Widersprüche zum Kanon, je Kette; Mittel (Spannweite).

| Geschichte | Variante | Proben (W) | weitere | zusammen | Mittel (Spannweite) |
|---|---|---|---|---|---|
| Salzmark | mit | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 (0–0) |
| Salzmark | ohne | 3 / 1 / 3 | 2 / 1 / 2 | 5 / 2 / 5 | 4,0 (2–5) |
| Glimmergrund | mit | 0 / 1 / 0 | 0 / 0 / 1 | 0 / 1 / 1 | 0,7 (0–1) |
| Glimmergrund | ohne | 1 / 1 / 1 | 3 / 1 / 3 | 4 / 2 / 4 | 3,3 (2–4) |

Reihenfolge der Ketten: Lauf 1 / 2 / 3.

**Die Widersprüche im Einzelnen:**

- **Salzmark ohne:** Novizin spricht (Läufe 1, 3); Name „Jorin“ fällt am späten Abend ohne Reaktion (1, 3); Tomas trinkt aus dem Krug (3); Sera „las mit den Kuppen eine Zeile“ – liest selbst (1, knapp); Aufstieg über Kiespfad statt Treppe und Tranlampen beim Archiv (2); Totenbuch nennt „Ertränkt im Hafenbecken“ statt der gefälschten Ursache „Unfall beim Salzsieden“ (1, 2, 3); Gunda: Tomas könne nicht schwimmen (1, Kanon: schwimmt gut); Jorin starb in einer Springflut (3, Kanon: betrunken vom Nordkai gefallen).
- **Glimmergrund mit:** Original des Schichtbuch-Zettels liegt „auf meinem Pult“ statt beim Bergamt (Lauf 2); Lazarett „hinter der Kirche“ (3, Kanon: Lazarett Oberstadt, Kirche Unterstadt; schwach).
- **Glimmergrund ohne:** Farnow „Pünktlich nach dem Turm“ ohne die elf Minuten (Lauf 2, knapp); Salm nennt sicher „Goldgrün“ (3); Lenka schreibt „gerade“ (1) bzw. Abschrift im Schichtbuch „gerade“ (3); „Vier“ Stollen (1, 3); Lazarett „hinter der Kirche“ (1); Frauen mit gelber Armbinde statt Band im Haar (1, 2, 3; geringfügig).

## Grenzen der Aussage

- **Kleine Zahlen.** Drei Ketten je Variante und Geschichte; der Unterschied ist in beiden Geschichten groß und liegt außerhalb der Spannweite, bei Glimmergrund in der Proben-Quote aber knapp (86 % gegen 88 %).
- **Ein Bewerter je Geschichte.** Knappe Urteile hängen an der Auslegung (Unsicherheiten am Ende beider Bewertungen). Nachgeprüft wurden alle W-Urteile und weiteren Widersprüche, nicht alle E- und N-Urteile.
- **Reihenfolge in Salzmark:** Die Zufallsreihenfolge legte zufällig alle drei `ohne`-Ketten auf K1–K3 und alle `mit`-Ketten auf K4–K6. Der Bewerter kannte die Herkunft nicht; dass er bei den ersten drei Ketten strenger urteilte, lässt sich nicht ausschließen, erklärt aber nicht die Zitate, die alle nachgeprüft wurden.
- **Lage statt echtes langes Kapitel.** `ohne` bildet nur nach, dass die Auffüllung leer bleibt; bei einem echten langen Kapitel stünde mehr wörtlicher Text in der Anfrage, aus dem die KI Details übernehmen kann (wie Glimmergrund zeigt, hilft das, ersetzt den Eintrag aber nicht).
- **Ein Modell.** Nur grok-4.6 (Voreinstellung).

## Empfehlung für 6.3

Das Fehlen schadet messbar – also nicht bei „nur messen“ (D) oder „nur anzeigen“ (B) stehen bleiben. **Option A** (Kultur-Einträge immer mit) reicht nicht: Die meisten Widersprüche betreffen Figuren (Novizin, Tomas, Sera, Lenka, Salm, Farnow) und Orte (Aschturm, Lazarett, Zeche), nur ein Teil die Kultur (Totensitte, Trauerband).

**Empfehlung: Option C – Kanon vor den Seiten mit Obergrenze**, also einen festen Anteil des Budgets für nicht genannte Kanon-Einträge reservieren, bevor die letzten Seiten den Rest füllen. Für die Welt des Eigentümers passt der ganze Kanon (ca. 6.360 Token) neben ca. 16.500 Token letzte Seiten (statt 22.116; Regeln und Zeitlinie gehen schon heute mit) in die 30.000 Token (Messwerte aus 6.12, ADR-061). Vor der Umsetzung in 6.3 offen und dort zu messen (nach Regel-002, vorher/nachher an beiden Testgeschichten): wie stark weniger wörtlicher Vortext den Anschluss verschlechtert, und welche Obergrenze bei größeren Welten gilt, deren Kanon nicht mehr ganz hineinpasst. Die Entscheidung trifft der Eigentümer in 6.3 (Kategorie 1).
