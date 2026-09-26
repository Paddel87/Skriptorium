# Abnahme Schritt 3.2 – Kontext-Zusammenstellung mit echten KI-Läufen

Datum: 2026-09-26. Zweck: Akzeptanzkriterien FR-003 (Gegenstand mit Zweck, Verwendung, Auswirkung nach `@`-Verweis) und FR-004 (Zeitlinie) mit echten KI-Texten prüfen (Entscheidung des Eigentümers vor 3.2).

## Aufbau

- `abnahme.py` legt die Testwelt „Die Salzmark“ aus `spikes/modell-eignungstest/testwelt` über `CanonService` und `ManuscriptService` in einem temporären Datenverzeichnis an und ergänzt den Gegenstand „Runenklinge“ (Zweck, Verwendung, Auswirkung mit prüfbaren Bedingungen: Blut vor dem Schnitt, danach bis zum Morgen unbenutzbar, Erinnerungsverlust erst später bemerkt).
- Kontext: `ContextBuilder` (Budget 30.000, geschätzt 18.012 bzw. 18.024 Token; Anbieter zählte 16.194 bzw. 16.203). Anfrage: `OpenRouterProvider` aus 3.1, Modell grok-4.7, Temperatur 0,8.
- FR-003: `@Runenklinge` gegen eine gebundene Wache. FR-004: Falle – Tomas erzählt von seiner Verwundung 397 und der Rolle Drachs; laut Zeitlinie wurde Drach erst 399 Vogt.
- Je Fall 2 Läufe. Kosten zusammen ca. 0,12 $ (`ergebnisse/*.json`).

## Bewertung

Getrennte Instanz (Claude Sonnet 5), nur Texte und Kanon-Maßstab, keine Kenntnis des Kontexts; Zitate stichprobenartig gegen die Dateien geprüft.

| Text | Widersprüche Runenklinge (FR-003) | Widersprüche Zeitlinie (FR-004) | Ich-Figur geführt vom Autor (FR-012, Nebenbefund) |
|---|---|---|---|
| fr003-runenklinge 1 | 0 | 0 | eingehalten |
| fr003-runenklinge 2 | 0 | 0 | verletzt: „Ich drehte mich um.“, „Ich seh ihn.“ |
| fr004-zeitlinie 1 | – | 0 („Drach war da noch kein Vogt.“) | eingehalten |
| fr004-zeitlinie 2 | – | 0 („Der Vogt war er da noch nicht.“) | eingehalten |

**Ergebnis:** FR-003 und FR-004 erfüllt (0 Widersprüche in 4 Texten). Nebenbefund für 3.4: Die KI schrieb in 1 von 4 Texten Handlung und Rede der vom Autor geführten Ich-Figur – bekannt aus 1.5 (Figuren-Schreibweise unter Druck).

## Grenzen

Zwei Läufe je Fall sind eine Stichprobe, keine Statistik. Die Testwelt ist klein (ca. 18.000 Token passen vollständig ins Budget); das Verhalten bei vollem Budget beobachtet der Schreibbetrieb (NFR Kanon-Treue ab 3.3) und D.4.
