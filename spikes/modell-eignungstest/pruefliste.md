# Prüfliste Kanon-Treue – Testszene Kapitel 7

**Fixiert vor dem ersten Lauf (2026-09-26). Wird danach nicht geändert**; neue Befunde, die hier nicht erfasst sind, werden als „weitere Widersprüche" gezählt und gesondert ausgewiesen.

## Zählweise

- Jede **Aussage im KI-Text, die einem Punkt widerspricht**, zählt als ein Widerspruch. Wiederholungen desselben Fehlers im selben Text zählen einmal.
- Ein Punkt, den der Text nicht berührt, zählt weder für noch gegen das Modell („nicht berührt").
- **Verstöße gegen die Figuren-Schreibweise** (F-Punkte) werden getrennt gezählt – sie sind kein Kanon-Widerspruch, aber für FR-012 entscheidend.
- Erstbewertung durch die KI (Entscheidungs-Klasse); der Eigentümer prüft eine Stichprobe. Die Bewertung nennt je Widerspruch die Belegstelle.

## Kanon-Punkte (K)

| Nr. | Prüfpunkt | Quelle |
|---|---|---|
| K1 | Sera Kolb ist vollständig blind: sie sieht nichts, liest nicht selbst, erkennt Menschen an Stimme, Schritt, Geruch. Blick-Beschreibungen, die Sehen voraussetzen („sie musterte sie"), sind ein Widerspruch; „wandte das Gesicht zu" ist zulässig. | Figur Sera Kolb |
| K2 | Sera redet Besucher mit „Kind" an – ein anderes Anredewort für Besucher ist kein Widerspruch, eine abweichende feste Anrede (z. B. „mein Sohn") schon. | Figur Sera Kolb |
| K3 | Schwester Mai spricht kein Wort (Schweigegelübde); nur Handzeichen und Schiefertafel. | Figur Schwester Mai, Kultur Stille Schwestern |
| K4 | Im Archiv brennt kein offenes Feuer; Licht nur von Salzlampen (kalt, bläulich, wärmt nicht). | Ort Aschturm, Regel Salzlicht |
| K5 | Nach Sonnenuntergang nennt niemand einen Toten beim Namen (insbesondere nicht Jorin oder Hedda); es ist Nacht. | Kultur Totensitte |
| K6 | Tomas hat keine Armbrust mehr; er trägt Ilkas Messer „Kerbe". | Kapitel 5, 6; Gegenstand Kerbe |
| K7 | Tomas trinkt keinen Alkohol; die Schwestern trinken keinen Wein (bieten ihn höchstens an). | Figur Tomas Rehl, Kultur Stille Schwestern |
| K8 | Tomas nennt Ilka „Varn", nie „Ilka". | Figur Tomas Rehl |
| K9 | Mondstand: nur der rote Emla, voll; Ask ist Neumond; kein Doppelmond. Ein Salzeid ist in dieser Nacht also möglich. | Regel Monde |
| K10 | Es gibt keine Pferde auf den Inseln. | world.md |
| K11 | Salzbindung: nur mit Salz auf bloßer Haut und wahrem Namen; keine Bindung lebender Wesen, kein Wasser; jede Bindung kostet eine Erinnerung; Lösen kostet nichts. | Regel Salzbindung |
| K12 | Salzeid: Prise Salz auf die Zunge, Schwur „bei den Ertrunkenen"; vor dem Archiv: nichts entfernen, nichts verändern. Wer ihn bricht, gilt als „ungesalzen". | Kultur Salzeid |
| K13 | Sera empfängt nach Sonnenuntergang nur Besucher, die einen Toten zu beklagen haben. | Figur Sera Kolb |
| K14 | Ort: Gitter aus Eisen, Schlüssel bei der Äbtissin; Archiv unter der Erde in drei Gewölben, Totenbücher im zweiten Gewölbe; 312 Stufen landseitig. | Ort Aschturm |
| K15 | Aussehen: Tomas – braune Augen, rotblonder Bart, hinkt rechts; Ilka – graue Augen, links fehlen Ring- und kleiner Finger; Sera – weißes Haar, graue Haube, weiße Schärpe, milchige Augen, keine Binde; Mai – 19, graue Kutte. | Figuren |
| K16 | Keine Uhrzeit-Einheiten (Minute, Sekunde, „Uhr"); Zeit in Glocken, Sanduhren, Bildern. Keine modernen Wörter. | story.md, Schreibweise |
| K17 | Zeitlinie und Vorgeschichte, falls erwähnt: Hedda 401 ertränkt, im Totenbuch als „Unfall beim Salzsieden" verzeichnet; Jorin 406 ertrunken; Ilka 27; Drach seit 399 Vogt; der Vogt zahlt dem Orden 200 Silberschalen jährlich. | Zeitlinie, Figuren |
| K18 | Tomas kann nicht rennen (Knie); schwimmt gut; Ilka kann nicht schwimmen. | Figuren |
| K19 | Handlungsstand: Das schwarze Buch wurde von Fenn Asch gebracht, von Mai zu den Totenbüchern gestellt. Die Figuren wissen nichts vom gefälschten Totenbuch (Wissen nur des Autors). Sera verrät ihr Geheimnis nicht ohne Anlass – spontane Enthüllung wird als Beobachtung vermerkt, nicht als Widerspruch. | Kapitel 6, Figur Sera Kolb |

## Figuren-Schreibweise (F)

| Nr. | Prüfpunkt |
|---|---|
| F1 | Keine wörtliche Rede Ilkas. |
| F2 | Keine Handlung Ilkas, die über unwillkürliche Körperreaktion hinausgeht (zulässig: frieren, zusammenzucken; unzulässig: sie tritt vor, sie greift zum Salz, sie nickt als Antwort). |
| F3 | Keine Entschlüsse und keine Gedanken Ilkas jenseits unmittelbarer Wahrnehmung. |
| F4 | Ich-Perspektive Ilkas, Präteritum. |
| F5 | Der Text endet an einer Stelle, an der Ilka antworten oder handeln muss. |

## Weitere Erhebung je Lauf

- Ablehnung ja/nein, Wortlaut der Ablehnung (gekürzt), Abbruchgrund (`finish_reason`).
- Eingabe- und Ausgabe-Token laut Anbieter, Kosten laut OpenRouter.
- Zeit bis zum ersten Textstück, Gesamtdauer.
- Länge des Textes in Wörtern (Zielvorgabe 600–900).
