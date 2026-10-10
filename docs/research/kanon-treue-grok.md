# Kanon-Treue mit grok-4.6 und grok-4.7 (Schritt 5.26)

**Stand:** 2026-10-10, Code-Stand `main` `19f6beb` (Server-Code seit der Ausgangsmessung 5.24 auf `6065f4b` unverändert). Verfahren nach Regel-002 (ADR-047): je Variante drei Ketten an beiden Testgeschichten, Länge „mittel“, berichtet mit Mittelwert und Spannweite. Werkzeuge und Rohdaten in `spikes/kanon-treue/`.

**Frage des Eigentümers (2026-10-09):** Kommen die Kanon-Einträge technisch sauber bei der KI an, und befolgt das Sprachmodell sie?

## Kurzfassung

1. **Technik:** Per `@` genannte Einträge, die Regeln, die Zeitlinie und die geführte Figur kommen in jeder Anfrage **vollständig und wortgleich** an. Das gilt auch, wenn alle Einträge einer Welt per `@` genannt sind und das Kapitel lang ist. Nicht genannte Einträge sind **nicht gesichert**: Sie bekommen nur das Budget, das nach den letzten Manuskript-Seiten übrig bleibt. In Glimmergrund fehlen ab einem Kapitelstand von rund 2.800 Wörtern einzelne Einträge in der Anfrage (Schritt 6: 1 von 23, Schritt 7: 3 von 23).
2. **Befolgung:** grok-4.6 hält die geprüften Kanon-Details in 95–100 % der Fälle ein, in denen der Text sie berührt; grok-4.7 in 100 %. Widersprüche zum Kanon insgesamt: grok-4.6 sechs in zwölf Ketten (drei eindeutig, drei knapp), grok-4.7 keiner in sechs Ketten. Hochgerechnet liegt grok-4.6 mit den eindeutigen Widersprüchen bei etwa 0,6 (Salzmark) bis 1,0 (Glimmergrund) je Kapitel – an der Grenze des Ziels aus FR-011 (höchstens einer je Kapitel). Zählt man die knappen mit, liegt es darüber.
3. **`@` oder nicht:** Kein messbarer Unterschied bei grok-4.6. Erklärung aus dem Technik-Teil: In diesen Testgeschichten standen die berührten Einträge auch ohne `@` fast immer in der Anfrage.
4. **Neuer Befund – grok-4.7 ist derzeit zu langsam für das Produkt:** Es denkt an den echten Anfragen sehr lange vor (im Mittel rund 4.400–4.800 Ausgabe-Token je Vorschlag gegenüber rund 1.100 bei grok-4.6). Bis zum ersten Textstück vergehen an der Salzmark bis zu 370 s, im Mittel brauchte ein Vorschlag 113–131 s. Das Skriptorium bricht nach 90 s ab. Mit der Wartezeit des Produkts scheiterten im ersten Lauf 17 von 29 Anfragen. Das verletzt das Reaktionszeit-Ziel aus ADR-035 (grok-4.7: erstes Textstück höchstens 90 s).

## (a) Technik: Was steht in der Anfrage?

Werkzeug `spikes/kanon-treue/technik.py` (ohne Anbieter, ohne Kosten). Es baut die Anfragen über `prepare_request` wie die Oberfläche, lässt das Kapitel wie in einer echten Kette wachsen (übernommene Vorschläge der Ausgangsmessung 5.24, Lauf 1) und prüft je Kanon-Eintrag, ob und auf welchem Weg er im Text der Anfrage steht und ob er wortgleich vollständig ist. Ausgabe: `spikes/kanon-treue/technik.md`.

**Reihenfolge der Kontext-Zusammenstellung** (`context/builder.py`, ADR-003): (1) Rahmen, Welt, Schreibweise, **alle Regeln und die Zeitlinie**; (2) **per `@` genannte Einträge**, geführte Figuren, Fakten der Geschichte; (3) Zusammenfassungen; (4) letzte Manuskript-Seiten wörtlich, **danach weitere Kanon-Einträge**, solange das Budget reicht. Passen (1)–(3) und die Anweisung nicht ins Budget, wird die Anfrage abgelehnt – ein genannter Eintrag wird nie still gekürzt.

**Befunde:**

| | Salzmark (30 Einträge) | Glimmergrund (23 Einträge) |
|---|---|---|
| Anfrage geschätzt | 9.300–10.800 Token | 28.700–29.700 Token (Obergrenze 30.000) |
| Einträge, die fehlen | in keinem Schritt | Schritt 1–5: 0; Schritt 6: 1 (Bergmannsbrauch); Schritt 7: 3 (u. a. Bergmannsbrauch, Schichtbuch) – mit und ohne `@` gleich, weil die fehlenden nicht genannt sind |
| per `@` genannte Einträge | alle vollständig | alle vollständig |
| unvollständig angekommen | keiner | keiner |
| Belastung: alle Einträge per `@`, längster Kapitelstand | 26 Einträge, ca. 11.000 Token, alle vollständig | 20 Einträge bei gut 3.100 Wörtern Kapitel, ca. 29.700 Token, alle vollständig; die letzten Seiten werden entsprechend kürzer |

**Einordnung:** Die Technik arbeitet wie entworfen. Die Lücke liegt im Entwurf selbst: Ein Kanon-Eintrag, den der Autor nicht per `@` nennt und der weder Regel noch Zeitlinie ist (Figuren, Orte, Gegenstände, **Kultur**), erreicht die KI bei langen Kapiteln nicht mehr. Die Testwelten sind klein (23 und 30 Einträge). Eine echte Welt des Eigentümers mit deutlich mehr Einträgen verliert bei langen Kapiteln entsprechend mehr. Besonders betroffen sind Kultur-Einträge (Bräuche, Tabus), die in fast jeder Szene gelten, aber selten genannt werden.

## (b) Befolgung

### Aufbau

- **Proben:** Glimmergrund – die zwölf Kanon-Proben aus 5.24 (`spikes/modell-eignungstest/testwelt/glimmergrund/README.md`) mit den Anweisungen der Ausgangsmessung. Salzmark – zehn Proben aus dem **vorhandenen** Kanon (Pell kann nicht lesen, Tomas trinkt keinen Alkohol und nennt Ilka „Varn“, Totensitte mit Namensverbot nach Sonnenuntergang und Trauerfarbe Weiß, Schwester Mai schweigt, Aschturm mit 312 Stufen und Salzlampen, Sera Kolb ist blind, Salzeid vor dem Archiv, Lund ist einäugig) und sieben neue Anweisungen an derselben Schreibstelle, die die Proben berühren, ohne sie zu nennen (`spikes/kanon-treue/proben.py`). Die Testwelt selbst blieb unverändert, damit der Aufbau nach Regel-002 gleich bleibt.
- **Varianten:** grok-4.6 ohne `@` (Glimmergrund: Ausgangsmessung 5.24, gleiche Anweisungen), grok-4.6 mit `@` (die Namen in den Anweisungen mit `@`, wie der Autor sie ansprechen würde), grok-4.7 mit `@`. Länge „mittel“. grok-4.7 lief mit 600 s Wartezeit bis zum ersten Textstück statt 90 s (siehe unten). Eine grok-4.7-Kette (Glimmergrund, Lauf 1) brach in Schritt 3 nach dreimal HTTP 502 vom Anbieter ab und wurde wiederholt.
- **Bewertung:** je Geschichte eine getrennte Instanz (Sonnet), **verblindet** (neun Ketten in zufälliger Reihenfolge, Herkunft unbekannt, Anweisungen ohne `@`). Je Kette und Probe: eingehalten (E), nicht berührt (N), widersprochen (W), mit Zitat; dazu weitere eindeutige Widersprüche zum Kanon. Alle Widersprüche vom Coding-Agent am Text nachgeprüft. Bewertungen und Zuordnung in `spikes/kanon-treue/bewertung/`.

### Ergebnis je Variante

Summe über drei Ketten. Quote = E / (E + W), also eingehaltene unter den berührten Proben.

| Geschichte | Variante | E | N | W | Quote | weitere Widersprüche |
|---|---|---|---|---|---|---|
| Salzmark (10 Proben) | grok-4.6 ohne `@` | 24 | 5 | 1 | 96 % | 0 |
| Salzmark | grok-4.6 mit `@` | 24 | 5 | 1 | 96 % | 2 |
| Salzmark | grok-4.7 mit `@` | 26 | 4 | 0 | 100 % | 0 |
| Glimmergrund (12 Proben) | grok-4.6 ohne `@` | 23 | 12 | 1 | 96 % | 0 |
| Glimmergrund | grok-4.6 mit `@` | 24 | 12 | 0 | 100 % | 1 (knapp) |
| Glimmergrund | grok-4.7 mit `@` | 22 | 14 | 0 | 100 % | 0 |

**Widersprüche je Kette** (Proben und weitere), Mittel (Spannweite):

| Variante | Salzmark | Glimmergrund |
|---|---|---|
| grok-4.6 ohne `@` | 0,33 (0–1) | 0,33 (0–1) |
| grok-4.6 mit `@` | 1,00 (0–3) | 0,33 (0–1) |
| grok-4.7 mit `@` | 0,00 (0–0) | 0,00 (0–0) |

**Die Widersprüche im Einzelnen** (alle grok-4.6):

| Kette | Schritt | Zitat | Kanon | eindeutig? |
|---|---|---|---|---|
| Salzmark, mit `@`, Lauf 1 | 5 | „Zweiter Band, drittes Gewölbe“ | Totenbücher im zweiten Gewölbe | ja |
| Salzmark, mit `@`, Lauf 1 | 4 | „eine kleine, gebeugte Frau mit weißer Haube“ | Sera Kolb: graue Haube | ja |
| Salzmark, mit `@`, Lauf 1 | 5 | Sera „strich mit den Fingerspitzen über die Rillen“ der Schiefertafel und liest sie | liest nicht selbst (Siegel tastet sie ab) | knapp |
| Salzmark, ohne `@`, Lauf 1 | 4/5 | Sera lässt Ilka ins Archiv führen, ohne Salzeid | Salzeid vor dem Betreten des Archivs | knapp (Eintritt nicht ausgeschrieben) |
| Glimmergrund, ohne `@`, Lauf 3 | 4 | Lenka: „Die Abschrift im Buch ist nicht meine Schrift.“ | im Buch steht Lenkas eigene Abschrift | ja |
| Glimmergrund, mit `@`, Lauf 2 | 6 | „Lazarett der Knappschaft hinter der Pfarrkirche“ | Kirche in der Unterstadt, Lazarett in der Oberstadt | knapp |

**Abweichung von der Bewertung:** Die Bewerter-Instanz wertete in der Salzmark-Kette mit `@`, Lauf 1, auch „drehte es, als könnte er die Kohleschrift … besser lesen“ als Verstoß gegen „Pell kann nicht lesen“. Das „als könnte er“ sagt das Gegenteil; der Coding-Agent wertet die Stelle als eingehalten.

**Hochrechnung auf ein Kapitel (FR-011: höchstens ein Widerspruch je Kapitel):** grok-4.6 schrieb in den zwölf Ketten zusammen rund 9.100 Wörter. 3 eindeutige Widersprüche ergeben etwa 0,33 je 1.000 Wörter, also etwa 0,6 für ein Salzmark-Kapitel (1.800 Wörter) und 1,0 für ein Glimmergrund-Kapitel (3.000 Wörter). Mit den knappen Widersprüchen (6) sind es etwa 1,2 bzw. 2,0. grok-4.7 schrieb rund 6.800 Wörter ohne Widerspruch.

### Grenzen der Messung

- **Kleine Zahlen.** Drei Ketten je Variante, insgesamt sechs Widersprüche. Nach Regel-002 gilt ein Unterschied nur, wenn er sich in beiden Geschichten außerhalb der Spannweite zeigt. Das trifft für keinen Vergleich zu: Der Vorsprung von grok-4.7 ist eine **Tendenz**, kein Beleg.
- **Proben teils nicht prüfbar.** „Wendt trinkt keinen Kaffee“ blieb in allen 18 Glimmergrund-Ketten unberührt: Kaffee wird oft aufgetischt (sechs Ketten), aber Schritt 3 endet, bevor Wendt trinkt oder ablehnt, und Schritt 4 wechselt den Ort. „Nie pfeifen“ kam nur einmal vor. Die Trauerfarbe Gelb steht auch in Kapitel 1 und in der Gesamtzusammenfassung. Dass sie in Schritt 7 überall stimmt, obwohl der Eintrag „Bergmannsbrauch“ dort fehlt, sagt deshalb nichts über fehlende Einträge.
- **Nur Kanon, nicht Handlung.** Gewertet wurden Widersprüche zum Kanon. Abweichungen vom bisherigen Kapiteltext (z. B. wer den Schlüssel zum Schloss hat, Befund 7 der Ausgangsmessung 5.24) und Widersprüche innerhalb der Kette sind nicht gezählt.
- **Testwelten, nicht die echten Welten.** grok-4.6 und grok-4.7 sperren die echten Inhalte des Eigentümers unterschiedlich stark (ADR-044). An dessen Texten ist die Kanon-Treue von grok-4.6 weiter nur aus dem Alltag belegt.
- **Ein Bewerter je Geschichte.** Die knappen Urteile hängen an der Auslegung. Der Coding-Agent hat alle Widersprüche nachgeprüft, aber nicht alle E- und N-Urteile.

## Antwortzeit von grok-4.7

| Variante | Sekunden je Vorschlag, Mittel (max) | Ausgabe-Token je Vorschlag | Kosten je Kette |
|---|---|---|---|
| grok-4.6, Salzmark / Glimmergrund | 26–31 (58) / 27 (59) | ca. 1.100 | 0,15 $ / 0,36 $ |
| grok-4.7, Salzmark / Glimmergrund | 113 (322) / 131 (360) | ca. 4.800 / 4.400 | 0,32 $ / 0,46 $ |

- 20 von 42 Vorschlägen mit grok-4.7 brauchten insgesamt mehr als 90 s. Der Text selbst kommt danach in wenigen Sekunden, fast die ganze Zeit liegt also vor dem ersten Textstück. Diese Vorschläge wären im Skriptorium an der Wartezeit gescheitert.
- Erster Lauf mit der Wartezeit des Produkts (90 s, sechs Ketten parallel): 17 Zeitüberschreitungen, drei Ketten mit leeren Schritten, verworfen (Log `ergebnisse/g47-parallel-verworfen.log`). Ein Lauf nacheinander scheiterte ebenso: Es liegt nicht an der Parallelität.
- Gegenprobe mit einer einfachen Anfrage (25.000 Token Kontext, „Schreibe zwei Sätze über einen Hafen“): erstes Textstück nach 4 s. Das lange Vorab-Denken entsteht an der echten Schreib-Anfrage, obwohl das Denken auf die niedrigste Stufe gestellt ist (`ai_gateway/models.py`).
- Messung D.6 (2026-09-28, ADR-035): grok-4.7 meist unter 30 s, höchstens 90 s. Seither hat sich das Verhalten beim Anbieter verändert, oder die heutigen, längeren Vorgaben des Rahmens (5.8, 5.15, 5.22) lösen mehr Denken aus. Welche Ursache zutrifft, ist nicht geprüft.

## Kosten

Ketten dieser Messung: grok-4.6 mit `@` 1,55 $, grok-4.6 ohne `@` (Salzmark) 0,46 $, grok-4.7 mit `@` 2,44 $ (inklusive Wiederholung), verworfene grok-4.7-Läufe 0,55 $, Einzelmessungen zur Antwortzeit ca. 0,15 $ – zusammen etwa 5,15 $. Der Schlüssel meldet danach 237,86 $ frei (Grenze 250 $).

## Folgerungen

1. **Kanon-Treue von grok-4.6** liegt an der Grenze von FR-011: mit den eindeutigen Widersprüchen innerhalb des Ziels, mit den knappen darüber. Die NFR Kanon-Treue bleibt `[BELASTBAR]`, aber das Ziel ist für grok-4.6 nur knapp belegt; die Beobachtung im Alltag des Eigentümers bleibt nötig. Kein Wechsel der Voreinstellung aus diesem Befund allein: grok-4.7 ist treuer, aber derzeit zu langsam und sperrt die echten Inhalte stärker (ADR-044).
2. **Nicht genannte Einträge gehen bei langen Kapiteln verloren** (Entwurf der Kontext-Zusammenstellung, ADR-003). Mögliche Abhilfen, je mit Entscheidung: Kultur-Einträge wie Regeln immer mitgeben; Einträge, deren Name im Kapitel oder in der Anweisung vorkommt, vor den letzten Seiten einreihen; ein Hinweis in der Oberfläche, welche Einträge nicht mitgingen. Das ist eine Änderung an `context` mit Wirkung auf die NFR Kanon-Treue und Kosten – Entscheidungsvorlage an den Eigentümer.
3. **grok-4.7 überschreitet die Wartezeit des Produkts.** Mögliche Wege: Wartezeit für Modelle mit langem Vorab-Denken erhöhen (Reaktionszeit-Ziel aus ADR-035 neu festlegen), grok-4.7 aus der Auswahl nehmen, bis es wieder schneller ist, oder Ursache untersuchen (Rahmen ohne die Vorgaben aus 5.8–5.22 vergleichen). Entscheidungsvorlage an den Eigentümer.
4. **Testaufbau verbessern:** Die Kaffee-Probe braucht einen Schritt, in dem Wendt das Getränk annimmt oder ablehnt. Eine Probe für fehlende Einträge braucht ein Detail, das nur im Kanon-Eintrag steht und nicht im Kapitel oder in der Zusammenfassung.
