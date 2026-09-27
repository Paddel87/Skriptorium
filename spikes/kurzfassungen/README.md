# Abnahme Schritt 3.6 – Kapitel-Kurzfassungen mit echten KI-Läufen

Datum: 2026-09-27. Zweck: Akzeptanzkriterium FR-010 prüfen – beim Weiterschreiben in Kapitel N kennt die KI den Handlungsstand der Kapitel 1 bis N−1. Der Nachweis beim Umfang der Referenzgeschichte ist Schritt D.4.

## Aufbau

- Roman „Die Salzwächterin" mit drei Kapiteln (`abnahme.py`). Kapitel 1 (ca. 440 Wörter) und 2 (ca. 375 Wörter) enthalten je einen Fakt erst nach den ersten 300 Wörtern, also nicht im Ersatz-Kapitelanfang: F1 Schlüssel unter der dritten Stufe im Leuchtturm, F2 Treffen mit Tomas an der Mühle am Graben bei Neumond, F3 kranke Schwester Marit aus Tolm. Kapitel 3 ist so lang (300 gleiche Sturm-Absätze), dass die wörtlichen letzten Seiten nur aus Kapitel 3 bestehen; das Protokoll des `ContextBuilder` bestätigt je Lauf, welche Bausteine im Kontext standen.
- Kurzfassungen über `api.flows.summarize_chapter` (grok-4.7), dann drei Fortsetzungen in Kapitel 3 über `api.flows.prepare_request` **mit** Kurzfassungen und dieselben drei **ohne** (Status `fehlt`, Gesamtzusammenfassung leer → Kapitelanfang). Die Anweisungen nennen keinen der Fakten („das Versteck, das sie in Kapitel 1 angelegt hat", „die Verabredung", „die Kranke").
- Kosten: sechs Fortsetzungen 0,247 $ im ersten Durchgang, Wiederholung der drei Läufe mit Kurzfassung 0,123 $, dazu die Kurzfassungen (wenige Cent).

## Verlauf

1. Erster Durchgang: Die Kurzfassung von Kapitel 2 scheiterte mit `nicht_erreichbar` (Anbieter). Der Fehlerpfad griff wie vorgesehen: Gesamtzusammenfassung unverändert, Kapitel 2 im Kontext über seinen Anfang. Kapitel 1 bekam 334 Wörter statt 150–250.
2. Wortlaut der Längenvorgabe geschärft („150 bis höchstens 250 Wörter … gilt auch für kurze Kapitel"); Kurzfassungen und die drei Läufe mit Kurzfassung wiederholt (`nur-mit`). Die Läufe ohne Kurzfassung hängen davon nicht ab und stammen aus dem ersten Durchgang.

## Ergebnis

Blinde Bewertung durch eine getrennte Instanz (Claude Sonnet 5), Einzelheiten in `ergebnisse/bewertung.md`.

| Anweisung | mit Kurzfassungen | ohne (Kapitelanfang) |
|---|---|---|
| w1 Versteck (F1) | korrekt: dritte Stufe, Wachstuch | falsch: erfundenes Versteck unter einem Balken |
| w2 Verabredung (F2) | korrekt: Mühle am Graben, Neumond | falsch: Treffpunkt am Leuchtturm |
| w3 Kranke (F3) | korrekt: Marit, Fieber, Tolm, Tante | Kranke ohne Namen |

**FR-010 erfüllt** (für eine Geschichte mit drei Kapiteln): Mit Kurzfassungen nutzen alle drei Fortsetzungen den Handlungsstand früherer Kapitel richtig und ohne Widerspruch; ohne sie trifft keine den gefragten Fakt, zwei erfinden Widersprüche.

**Länge verfehlt:** Kurzfassungen 290 und 336 Wörter (Vorgabe 150–250), Gesamtzusammenfassung 623 Wörter (Vorgabe höchstens ca. 600) – bei Testkapiteln von nur 440 und 375 Wörtern fasst das Modell fast vollständig nach. Prüfung an Kapiteln echter Länge: Zusatz an D.4.

## Grenzen

Ein Modell, drei Kapitel, je ein Lauf je Anweisung; Kapitel 3 künstlich verlängert. Die Anweisungen zielen gezielt auf je einen Fakt.
