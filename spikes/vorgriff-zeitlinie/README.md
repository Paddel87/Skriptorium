# Probeschreiben 5.15 / 5.8 – Schreiben an früher Stelle einer fertigen Geschichte

Datum: 2026-10-08, auf Wunsch des Eigentümers. Befund, der geprüft wird: In einer importierten Welt mit weit fortgeschrittener Geschichte schreibt die KI über die Eingabe hinaus bis zum bekannten Ende; nach sechs, sieben übernommenen Vorschlägen beginnen und enden alle Abschnitte gleich.

## Aufbau

- Testwelt „Die Salzmark“. Die Geschichte gilt als fertig: Gesamtzusammenfassung bis zum erfundenen Ende (Flucht mit dem Buch, Prüfung in Tolm, Drachs Absetzung und Tod), Zeitlinie um diese Ereignisse ergänzt, Kapitel 2–4 (Vogtshaus, Nordkai, Grotte) liegen vollständig vor.
- Geschrieben wird in Kapitel 1 („Das Nasse Grab“), abgeschnitten nach „Also holten wir Pell.“ – also in der Mitte des Kapitels, weit vor dem Ende.
- Sieben Anweisungen in der Art des Eigentümers (Ich-Form, beschreibt auch Ilkas Handeln), Schritt 5 leer („Weiter“). Jeder Vorschlag wird übernommen. Rahmen von `main` (`be92228`, ohne Versuch 1 von 5.8), Ilka vom Autor geführt.
- Modelle: grok-4.6, grok-4.7, qwen3.8-max-0902. Ergebnisse je Modell in `ergebnisse/main-*/` (`01.txt`–`07.txt`, `kapitel-1.txt` am Ende).

## Ergebnis

| | grok-4.6 | grok-4.7 | qwen3.8-max |
|---|---|---|---|
| Wörter je Vorschlag (1–7) | 88, 58, 109, 77, 254, 174, 206 | 224, 102, 198, 218, 200, 363, 83 | 352, 151, 513, 356, **815**, 518, 616 |
| Kosten der Kette | 0,12 $ | 0,23 $ | 0,10 $ |
| Anweisung 2 (Ilka bietet Lohn) umgesetzt | nein | nein | nein |
| Vorgriff auf spätere Ereignisse | Asch „kommt jeden fünften Tag zum Turm“, Pell sieht Asch „zum Turm hin“ gehen | Hinweis-Zeile widerspricht dem Autor wegen eigener Erfindung aus Schritt 3 | „Weiter“: springt zum nächsten Morgen, erfindet Pells Bericht (geplanter Schritt 6) und Aschs Weg „zum Aschturm“; Ilka steht auf und geht hinüber |
| Wiederholungen über die Kette | stark: Schritt 5 und 7 beginnen mit **demselben Satz** („Tomas blieb am Tisch sitzen. Die gefaltete Quittung lag unter seiner Hand. Er rieb den Daumen über den Kohlestrich …“); „Gunda blieb im Türrahmen, die Arme unter der Schürze“ 3×, Pökels klickende Krallen 4×, „sah X an, dann den Spalt der Tür“ 3×, Ende „Was krieg ich?“ 3× | Einstiege mit Nebel/Fischgeruch/Tranlampe, Kohle auf der Quittung in fast jedem Abschnitt | Einstiege mit Geruch und Licht, lange Stimmungsabsätze |

1. **Wiederholung bestätigt.** Besonders grok-4.6 (Voreinstellung seit 5.7) kopiert Sätze und Gesten aus den übernommenen Vorschlägen bis wörtlich. Das Muster entsteht erst in der Kette – Einzelschritte (Versuch 1 von 5.8) konnten es nicht zeigen.
2. **Vorgriff bestätigt, aber nicht bis zum Ende.** Mit Anweisung bleiben alle Modelle nahe an ihr; spätere Ereignisse sickern als Andeutung ein (Asch und der Turm – stammt aus der Zusammenfassung). Bei leerem „Weiter“ treibt qwen die Handlung über mehrere Stunden voran und nimmt den nächsten geplanten Schritt des Autors vorweg. Ein Durchlauf bis zum Ende der Geschichte trat in dieser Kette nicht auf.
3. **Neu: Was der Autor für seine eigene Figur schreibt, setzt die KI nicht um.** Anweisung 2 („Ich biete Pell eine Silberschale … ich sage ihm …“) erscheint bei keinem Modell; die KI darf Ilka nicht sprechen lassen (Figuren-Schreibweise, FR-012) und schreibt stattdessen Pell, der wieder „Was krieg ich?“ fragt. Für den Eigentümer, der seine Eingabe ausformuliert haben will, wirkt das wie Ignorieren.
4. **Vorgreifen innerhalb der Kette:** grok-4.6 und grok-4.7 lassen Gunda in Schritt 3 schon sagen, was der Autor für Schritt 4 vorsah; grok-4.7 widerspricht in Schritt 4 dann per Hinweis-Zeile der Anweisung des Autors.

## Grenzen

Eine Kette je Modell, eine Stelle, Anweisungen vom Coding-Agent im Stil des Eigentümers; Bewertung durch den Coding-Agent ohne getrennte Instanz. Ein Lauf mit qwen brach an einer Zeitüberschreitung ab und wurde vollständig wiederholt; das Skript wiederholt seither einen Vorschlag nach Anbieter-Fehler bis zu zweimal.

## Zweiter Lauf: neue Vorgaben (2026-10-08, Branch `feat/5.15-nur-das-verlangte`)

Gleiche Kette, gleiche Anweisungen, Stand mit Versuch 1 von 5.8 (in `main`) und den Vorgaben aus 5.15: Länge „mittel“ (150–300 Wörter), Zukunft nach der Schreibstelle nicht erzählen, keine Wiederholung aus den letzten Seiten, Anweisungen zur geführten Figur genau ausschreiben, „Weiter“ nur den nächsten Moment. Ergebnisse in `ergebnisse/neu-*/`. Bewertung verblindet durch eine getrennte Instanz (Sonnet; Ketten K1–K6 gemischt, Schlüssel danach aufgedeckt).

| | grok-4.6 alt → neu | grok-4.7 alt → neu | qwen3.8-max alt → neu |
|---|---|---|---|
| Wörter je Vorschlag | 58–254 → 106–211 | 83–363 → 182–327 (2 von 7 ausgefallen) | 151–815 → 164–246 |
| Kosten der Kette | 0,12 $ → 0,15 $ | 0,23 $ → 0,17 $ | 0,10 $ → 0,08 $ |
| Anweisung 2 (Ilkas Angebot und Antwort) | nein → **ja** | nein → **ja** (Antwort ohne Sprecher) | nein → **ja** |
| Ilka über die Anweisung hinaus | 0 → 0 | 0 → 0 | 0 → 2 |
| „Weiter“ mit Zeitsprung | nein → nein | nein → nein | **ja → nein** |
| Vorgriffe auf den späteren Verlauf | 2 → 2 | 1 → 0 | 3 → 2 |
| Kanon eindeutig / fraglich | 0/1 → 0/3 | 0/1 → 0/1 | 1/2 → 0/0 |
| Wiederholungen (Bewertung) | stark → mittel | stark → mittel | stark → mittel |
| Gleiche 6-Wort-Folgen in mehr als einem Vorschlag (gezählt) | 49 → 0 | 40 → 0 | 18 → 0 |
| Einleitungen / Schlusssätze | 7/2 → 3/3 | 6/3 → 3/4 | 5/4 → 3/3 |

1. **Eigene Figur gelöst.** Alle drei Modelle schreiben jetzt aus, was der Autor für Ilka vorgibt (Silberschale, „Junge hinter Fässern“); qwen fügt zweimal eigene Rede bzw. Argumente hinzu.
2. **Wiederholungen stark verringert.** Keine wörtlich gleichen Einstiege oder Sätze mehr; es bleiben wiederkehrende Motive (Fischgeruch, Gunda im Türrahmen, Pökel).
3. **Länge im Rahmen.** qwen schreibt nicht mehr bis 815 Wörter; „Weiter“ bleibt bei allen Modellen im nächsten Moment.
4. **Vorgriff verringert, nicht beseitigt.** qwen lässt Ilka in Schritt 7 Buch, Grotte und Schwestern verknüpfen; grok-4.6 deutet Aschs Weg zur Nordklippe an. Aschs Besuche im Aschturm stehen im Kanon und zählen nicht.
5. **Schlusssätze kaum verändert.** Es bleiben vor allem Warte- und Gestenschlüsse („als gehöre die nächste Stimme nicht ihr“), die mit der Übergabe an die geführte Figur zusammenfallen.
6. **Kanon-Treue nicht schlechter:** eindeutig 1 → 0, fraglich 4 → 4 über alle Ketten.

grok-4.7 lief in 2 von 7 Schritten dreimal in die Zeitüberschreitung bis zum ersten Textstück (90 s), ohne Text. Das ist Anbieter-Latenz und keine Wirkung der Vorgaben, verfälscht aber die Kette: Gunda erscheint ohne Schritt 3. Grenzen wie oben: eine Kette je Modell, Testwelt statt echter Welt.
