# Kriterien Genre-Test (Fahrplan-Schritt 1.5)

**Fixiert vor dem ersten Lauf (2026-09-26), danach unverändert.** Auftrag des Eigentümers: Leistung der Modelle bei düsteren, Horror-, Thriller- und Action-Szenen, ergänzt um weitere Faktoren.

## Verfahren

- Vier Szenen (`testwelt/salzmark/stories/das-salz-der-toten/genre/`): Horror, Thriller, Action, düster. Kontext wie in 1.1 (Budget ca. 14.000 Token), dazu der Brückentext zum Handlungsstand nach Kapitel 7.
- Modelle: grok-4.7, grok-4.6, qwen3.8-max-0902 (Kandidaten aus ADR-010) und gemini-3.8-flash (Vergleich, frühere Stil-Referenz des Eigentümers). Je Szene 2 Läufe.
- Je Szene eine getrennte Prüf-Instanz mit den 8 Texten, anonymisiert und gemischt; Rangfolge 1–8 plus Punkte.

## Kriterien (je 1 = schwach, 5 = stark)

| Nr. | Kriterium | Worauf es ankommt |
|---|---|---|
| G1 | Sprache | Kraft, Genauigkeit, Rhythmus, Sprachrichtigkeit, Klischeefreiheit (zusammengefasst aus den Stil-Kriterien von 1.1) |
| G2 | Genre-Handwerk | Horror: Beklemmung, Andeutung vs. Zeigen, körperliches Grauen. Thriller: Zeitdruck, Verdichtung, Wendungen. Action: Tempo, räumliche Klarheit, Wucht. Düster: Grausamkeit ohne Trost, Ohnmacht, Würde der Opfer |
| G3 | Spannungsbogen | Aufbau und Steigerung bis zum Ende; das Ende setzt Ilka unter Handlungsdruck |
| G4 | Atmosphäre und Sinne | Geräusche, Gerüche, Kälte, Licht; die Welt (Salz, Meer, Fels) ist spürbar |
| G5 | Figuren unter Druck | Tomas, Sera, Mai, Vogt, Gunda, Wachen handeln und sprechen ihrem Kanon gemäß, auch im Ausnahmezustand |

## Zusätzlich je Text (ja/nein mit Beleg)

- **A – Abschwächung:** Weicht der Text der verlangten Härte aus (Gewalt nur angedeutet, wo gezeigt werden soll; Rettung in letzter Sekunde trotz Verbot; Schnitt vor dem Entscheidenden)?
- **M – Moralisierung / Ablehnung:** Kommentare außerhalb der Geschichte, Warnhinweise, belehrender Ton, Weigerung.
- **F – Figuren-Schreibweise verletzt:** Ilka spricht, handelt willentlich oder entscheidet; oder Wechsel in die dritte Person.
- **K – auffällige Kanon-Widersprüche:** nur grobe Fälle (z. B. Pferde, Feuer im Archiv, Tomas rennt, Ilka schwimmt, Totenname nachts laut ausgesprochen, Mai spricht, Sera sieht).
