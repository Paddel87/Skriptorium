# Probeschreiben Schritt 3.3 – Weiterschreiben mit echten KI-Läufen

Datum: 2026-09-26. Zweck: Akzeptanzkriterien von 3.3 mit dem echten Anbieter prüfen – FR-008 (Szenen-Einstieg), FR-009 (übernehmen, ändern, verwerfen als Grundlage der nächsten Fortsetzung), FR-011 (höchstens ein Kanon-Widerspruch pro Kapitel), Reaktionszeit (ADR-013) und Abbruch. Umfang vom Eigentümer gewählt („größer, ca. 0,80 $“).

## Aufbau

- Testwelt „Die Salzmark“ mit der Geschichte „Das Salz der Toten“ wie in 3.2 (`spikes/kontext-abnahme/abnahme.py`), in einem temporären Datenverzeichnis.
- Echter Server (`uvicorn skriptorium.api:create_app --factory`) mit `OPENROUTER_API_KEY`; `probe.py` spricht nur die HTTP-Endpunkte an (Anmeldung, Kapitel speichern, `POST …/write` mit Server-Sent Events) – derselbe Weg wie die Oberfläche.
- Der Coding-Agent schrieb als Autor Ilkas Absätze (`autor_absatz` in den JSON-Dateien) nach Lesen des jeweils letzten KI-Texts. Übernommene Texte wurden wie in der Oberfläche ans Kapitelende gehängt.
- Kapitel 4 („Die Grotte“, laufendes Kapitel): 7 Fortsetzungen übernommen, davon 1 geändert; 1 verworfen und mit grok-4.6 neu geschrieben.
- Kapitel 5 („Das Wasser“, neu): 2 Szenen-Einstiege (Ort, Figuren, Ziel) und 5 Fortsetzungen; 1 geändert (Widerspruch zu Kapitel 3 beim Redigieren korrigiert).
- 1 Abbruch nach dem ersten Textstück.
- Ergebnisse: `ergebnisse/*.txt` (KI-Texte unverändert), `*.geaendert.txt` (Fassung des Autors), `*.json` (Anfrage, Zeiten, Verbrauch, Aktion), `kapitel-4.txt`/`kapitel-5.txt` (Manuskript-Stand am Ende), `bewertung-kapitel-*.md` (Bewertungsfassung mit markierten Autor- und KI-Blöcken).

## Zeiten und Kosten

Zeiten vom Absenden bis zum Ereignis, gemessen beim Aufrufer.

| Block | Modell | erstes Textstück (s) | Token ein / aus | Kosten ($) | Aktion |
|---|---|---|---|---|---|
| k4-01 | grok-4.7 | 16,4 | 16.176 / 1.443 | 0,031 | übernommen |
| k4-02 | grok-4.7 | 44,8 | 16.779 / 4.646 | 0,047 | geändert |
| k4-03 | grok-4.7 | 27,9 | 17.471 / 2.200 | 0,037 | übernommen |
| k4-04 | grok-4.7 | 27,0 | 17.955 / 2.265 | 0,019 | verworfen |
| k4-04b | grok-4.6 | **13,2** | 16.919 / 1.430 | 0,042 | übernommen |
| k4-05 | grok-4.7 | 15,2 | 18.780 / 1.806 | 0,037 | übernommen |
| k4-06 | grok-4.7 | 27,1 | 19.438 / 1.950 | 0,039 | übernommen |
| k4-07 | grok-4.7 | 19,3 | 20.031 / 2.010 | 0,040 | übernommen |
| k5-01 Szene | grok-4.7 | **77,1** | 20.546 / 5.271 | 0,056 | übernommen |
| k5-02 | grok-4.6 | **15,8** | 19.932 / 1.307 | 0,047 | übernommen |
| k5-03 | grok-4.7 | 16,0 | 21.528 / 1.363 | 0,016 | übernommen |
| k5-04 Szene | grok-4.7 | 35,0 | 21.961 / 2.461 | 0,045 | geändert |
| k5-05 | grok-4.7 | 22,0 | 22.478 / 1.611 | 0,042 | übernommen |
| k5-06 | grok-4.7 | 7,2 | 22.971 / 893 | 0,018 | übernommen |
| k5-07 | grok-4.7 | 11,5 | 23.536 / 940 | 0,040 | übernommen |
| Abbruch | grok-4.7 | 26,9 | – | – (nicht gemeldet) | abgebrochen |

- Summe gemeldeter Kosten: 0,556 $. Ob der Anbieter den abgebrochenen Lauf berechnet, meldet er nicht.
- Antwortkopf und Ereignis `start` kamen in allen Läufen nach 0,02–0,03 s – die Oberfläche zeigt „denkt nach …“ ohnehin sofort beim Absenden.
- **Reaktionszeit-Ziel verfehlt:** grok-4.7 in 14 von 15 Läufen unter 60 s, einmal 77,1 s (Szenen-Einstieg, 5.271 Ausgabe-Token überwiegend Vorab-Denken). grok-4.6 in 2 von 2 Läufen über 10 s (13,2 s und 15,8 s; in 1.5 gemessen 5–8 s). Die Wartezeit bis zum ersten Textstück ist in `ai_gateway` auf 90 s begrenzt – der Lauf mit 77 s lag nahe daran.
- **Abbruch:** Verbindung nach dem ersten Textstück geschlossen; Log-Zeile `ergebnis=abgebrochen` sofort, Manuskript unverändert (`abbruch.json`: `manuskript_unveraendert: true`).
- **FR-009:** Jede Fortsetzung baute auf dem gespeicherten Stand auf: Autor-Absätze, geänderte Fassungen (k4-02, k5-04) und der verworfene Text (k4-04 fehlt im Kontext von k4-04b) – nachprüfbar an `kapitel-4.txt`, `kapitel-5.txt` und den steigenden Token-Zahlen.

## Bewertung

Folgt (getrennte Instanz, blind gegen den Kanon).
