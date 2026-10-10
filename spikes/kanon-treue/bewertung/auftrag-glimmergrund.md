# Auftrag an die Bewerter-Instanz – glimmergrund

Du bewertest KI-Fortsetzungen einer Geschichte auf Kanon-Treue. Du kennst das Projekt nicht und brauchst es nicht zu kennen. Arbeite nur lesend; schreibe am Ende genau eine Datei (unten).

## Material

- Kanon der Welt (verbindliches Wissen): `spikes/modell-eignungstest/testwelt/glimmergrund/canon` – alle `.md`-Dateien darunter.
- Neun Ketten `<scratchpad>/blind/glimmergrund/K1` … `<scratchpad>/blind/glimmergrund/K9`. Jede Kette besteht aus sieben Vorschlägen `01.txt` … `07.txt`, die nacheinander zu derselben Stelle der Geschichte geschrieben wurden (jeder Vorschlag wurde übernommen, der nächste setzt ihn fort). Die Reihenfolge der Ketten ist zufällig; woher eine Kette stammt, weißt du nicht und sollst es nicht erraten.
- Die Anweisungen des Autors je Schritt (in allen Ketten inhaltlich gleich; „ich“ ist die vom Autor geführte Figur Konstanze Wendt (dritte Person, „Wendt“; in den Anweisungen „ich“)):

1. Ich frage Brack, wer von den Stollen unten auf der Tiefen Sohle zuletzt in Betrieb war und wie viele es dort überhaupt gab. Brack antwortet kurz. Ich frage ihn, wer den Schlüssel zum neuen Schloss hat.
2. Wir fahren hinauf. Im Hof lädt ein Fuhrmann aus dem Tal Fässer ab; ich frage ihn, wie lange er bis Unterwehr braucht. Dann gehe ich zu Haller ins Maschinenhaus, weil er mir noch etwas über seine Maschine erzählen wollte.
3. Am Abend bin ich beim Direktor zum Essen eingeladen. Ich komme zur verabredeten Uhrzeit nach der Kirchenuhr. Nach dem Essen bringt seine Frau ein Getränk für alle.
4. Zurück in der Nassen Sohle schiebt mir jemand eine Nachricht unter der Tür durch. Ich lese sie, dann schreibe ich Lenka Vorst eine Antwort und bitte Rosl, sie ihr zu bringen.
5. (leer – „Weiter“)
6. Am nächsten Morgen gehe ich zu Doktor Salm ins Lazarett und bitte ihn, mir zu beschreiben, wie die geborgenen Lampen der Toten aussahen, als man sie fand.
7. Ich besuche am Abend Bracks Haus und bringe einen Korb Äpfel mit. Seine Frau öffnet die Tür; ich sage ihr, warum ich komme, und bitte sie, ihren Mann zu holen.

## Proben

Für jede Kette und jede Probe genau ein Urteil:

- **eingehalten** – das Detail kommt im Text der Kette vor und stimmt mit dem Kanon (Zitat).
- **nicht berührt** – das Detail kommt nicht vor; der Text weicht ihm aus oder die Situation entsteht nicht. Kein Verstoß.
- **widersprochen** – der Text widerspricht dem Detail (Zitat, Schritt-Nummer).

Wenn ein Detail in einer Kette mehrfach vorkommt und mindestens einmal widersprochen wird: **widersprochen** (mit dem widersprechenden Zitat), zusätzlich Vermerk „sonst eingehalten“.

| Nr. | Eintrag | Detail | Woran ein Verstoß erkennbar ist | berührt in Schritt |
|---|---|---|---|---|
| 1 | bergmannsbrauch | Unter Tage wird die Zahl Sieben nicht ausgesprochen („Sechs-und-eins“) | „sieben“ oder „Stollen Sieben“ unter Tage ohne Folge | 1 |
| 2 | hohe-berta | Die Pumpe heißt „Hohe Berta“ / „Berta“ | Pumpe ohne den Namen oder mit anderem Namen, wenn Haller über sie spricht | 2 |
| 3 | bergmannsbrauch | Nie pfeifen (ein Pfiff ist Grubenalarm) | jemand pfeift ohne Folge | 2 |
| 4 | emil-farnow | Farnows Uhr geht genau elf Minuten vor („Farnowzeit“) | Uhr geht richtig, nach oder um eine andere Zeit vor; Termin ohne die elf Minuten | 3 |
| 5 | konstanze-wendt | Wendt trinkt niemals Kaffee | Wendt trinkt oder lobt Kaffee; Kaffee als ihr Getränk | 3 |
| 6 | lenka-vorst | Linkshänderin, schreibt Spiegelschrift | Lenkas Schrift gerade, sauber, mit rechts; ohne Spiegel lesbar | 4 |
| 7 | benedikt-salm | Rot-grün-farbenblind, verschweigt es | Salm nennt Lampen sicher „rot“ oder „grün“ | 6 |
| 8 | glimmstein | Glimmt nur nass, gold-grün; Rot heißt schlechte Luft | Rot bedeutet etwas anderes; Stein glimmt trocken; Lampen blaken | 6 |
| 9 | brack | Nur „Brack“, kein Vorname | Vorname erfunden; „Herr Brack“ ohne Widerspruch | 7 |
| 10 | bergmannsbrauch | Trauerfarbe Gelb, nicht Schwarz | schwarze Binde, schwarzes Band, Trauer in Schwarz | 7 |
| 11 | gasthaus-zur-nassen-sohle | Bier nur in Steinkrügen mit Zinndeckel | Bier in Gläsern oder Humpen ohne Deckel | jeder |
| 12 | schichtbuch | Einzelzettel liegt beim Bergamt, im Buch nur Lenkas Abschrift | Original im Buch oder in Wendts Händen | jeder |

Streng am Kanon prüfen, nicht am Gefühl. Ein Detail, das die Figur nur andeutet (z. B. zögert, den Namen eines Toten zu sagen), zählt als eingehalten, wenn es eindeutig zum Kanon passt. Was die geführte Figur Konstanze Wendt (dritte Person, „Wendt“; in den Anweisungen „ich“) selbst sagt oder tut, kam aus der Anweisung – bewerte es trotzdem, wenn es eine Probe berührt.

## Weitere Widersprüche

Notiere je Kette zusätzlich andere **eindeutige** Widersprüche zum Kanon (nicht zu den Proben), mit Zitat und Schritt – keine Stilfragen, keine Erfindungen, die dem Kanon nicht widersprechen.

## Ergebnis

Schreibe **`<scratchpad>/bewertung-glimmergrund.md`** als Markdown:

1. Tabelle: Zeilen = Proben 1–12, Spalten = K1–K9, Zellen `E` / `N` / `W`.
2. Je Kette ein Abschnitt `### Kx` mit je Probe einer Zeile: Urteil, Schritt, kurzes Zitat (höchstens 20 Wörter); danach „Weitere Widersprüche“ (oder „keine“).
3. Ein Absatz „Unsicherheiten“: wo dein Urteil knapp war.

Antworte am Ende in höchstens fünf Sätzen, was du geschrieben hast.
