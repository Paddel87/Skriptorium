# Auftrag an die Bewerter-Instanz – salzmark

Du bewertest KI-Fortsetzungen einer Geschichte auf Kanon-Treue. Du kennst das Projekt nicht und brauchst es nicht zu kennen. Arbeite nur lesend; schreibe am Ende genau eine Datei (unten).

## Material

- Kanon der Welt (verbindliches Wissen): `spikes/modell-eignungstest/testwelt/salzmark/world.md` und alle `.md`-Dateien unter `spikes/modell-eignungstest/testwelt/salzmark/canon`.
- Text vor der Schreibstelle (Kapitel 1 bis „Also holten wir Pell.“): lies `/tmp/claude-0/-home-user-Skriptorium/c191dd69-0609-55e7-b52a-42f56264ac11/scratchpad/blind/salzmark/start.txt` (in allen Ketten gleich; nur als Hintergrund, nicht bewerten).
- Sechs Ketten `/tmp/claude-0/-home-user-Skriptorium/c191dd69-0609-55e7-b52a-42f56264ac11/scratchpad/blind/salzmark/K1` … `/tmp/claude-0/-home-user-Skriptorium/c191dd69-0609-55e7-b52a-42f56264ac11/scratchpad/blind/salzmark/K6`. Jede Kette besteht aus sieben Vorschlägen `01.txt` … `07.txt`, die nacheinander zu derselben Stelle der Geschichte geschrieben wurden (jeder Vorschlag wurde übernommen, der nächste setzt ihn fort). Die Reihenfolge der Ketten ist zufällig; woher eine Kette stammt, weißt du nicht und sollst es nicht erraten. Öffne nichts unter `spikes/regel-002/ergebnisse/`.
- Die Anweisungen des Autors je Schritt (in allen Ketten gleich; „ich“ ist die vom Autor geführte Ich-Erzählerin Ilka Varn):

1. Pell kommt am nächsten Morgen in Tomas' Kammer. Tomas erklärt ihm, dass er fünf Nächte die Wachen am Vogtshaus zählen soll. Pell fragt nach dem Lohn.
2. Ich biete Pell eine Silberschale pro Nacht. Pell fragt, was passiert, wenn sie ihn erwischen; ich sage ihm, dann sei er eben ein Junge, der hinter Fässern schläft.
3. Die nächsten Tage schleppe ich Salz für einen Händler aus der Oberstadt, um nicht aufzufallen. Am dritten Abend kommt Gunda zu mir in die Kammer herauf.
4. Gunda warnt mich vor Fenn Asch: Er stottert, wenn er lügt, und er stottert viel. Sie sagt, Asch habe gestern gefragt, ob die Varn wieder in der Stadt ist.
5. (leer – „Weiter“)
6. Nach der fünften Nacht kommt Pell mit seinem Bericht: vier Männer in der Wachstube, Wachwechsel zur zweiten Glocke nach Mitternacht, und einmal ist Asch nachts mit einem Bündel aus dem Haus gegangen.
7. Ich schlage vor, in zwei Nächten einzubrechen und die Riegel der Wachstube zu binden. Tomas will lieber Marr eine Nachricht schicken. Wir streiten.

## Bewertung

Notiere je Kette jeden **Widerspruch zum Kanon** mit Schritt und kurzem Zitat (höchstens 20 Wörter) und dem Kanon-Satz, dem er widerspricht (Datei). Stufe jeden ein:

- **eindeutig** – der Text widerspricht einer ausdrücklichen Aussage des Kanons (z. B. Tomas trinkt Alkohol, Tomas nennt Ilka „Ilka“, ein Pferd auf Kerrow, eine Uhr mit Federwerk, Pell liest oder schreibt, ein Toter wird nach Sonnenuntergang beim Namen genannt).
- **knapp** – Auslegungssache oder nur indirekt widersprechend.

Keine Stilfragen, keine Erfindungen, die dem Kanon nicht widersprechen. Was aus der Anweisung kommt, ist kein Widerspruch der KI. Wiederholt sich derselbe Widerspruch in einer Kette, zähle ihn einmal und vermerke die Wiederholung.

## Ergebnis

Schreibe **`/tmp/claude-0/-home-user-Skriptorium/c191dd69-0609-55e7-b52a-42f56264ac11/scratchpad/bewertung-salzmark.md`** als Markdown:

1. Tabelle: Zeilen = K1–K6, Spalten „eindeutig“ (Anzahl), „knapp“ (Anzahl).
2. Je Kette ein Abschnitt `### Kx` mit den Widersprüchen (oder „keine“).
3. Ein Absatz „Unsicherheiten“: wo dein Urteil knapp war.

Antworte am Ende in höchstens fünf Sätzen, was du geschrieben hast.
