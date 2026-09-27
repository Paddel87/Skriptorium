# Abnahme 3.9 – Modellwechsel und Verbrauch (FR-018, ADR-023)

Stand: 2026-09-27. Skript: `abnahme.py`, Ergebnis: `ergebnisse/abnahme.json`.

## Aufbau

Eine Kurzgeschichte „Nebelpfad“ in der Welt „Moorlande“ schreibt zuerst mit dem Startmodell grok-4.7 weiter; der Vorschlag wird ans Kapitel gehängt. Danach wird das Modell der Geschichte auf grok-4.6 gestellt und ohne Modellangabe weitergeschrieben, wie die Oberfläche es nach einem Wechsel tut. Beide Anfragen laufen durch `prepare_request` und `stream_events` mit `UsageLog.record`.

## Ergebnis

| Prüfung | Ergebnis |
|---|---|
| Zweite Anfrage mit dem Modell der Geschichte (grok-4.6) | ja |
| Text aus Lauf 1 in der zweiten Anfrage (kein Datenverlust) | ja |
| Text aus Lauf 1 im Kapitel | ja |
| Anfragen in der Monatsdatei | 2, beide `ok` |
| Kosten laut Monatsdatei | 0,0048 $ (grok-4.7: 1.408 Token ein, 225 aus, 0,0019 $; grok-4.6: 441 ein, 368 aus, 0,0029 $) |

Beide Fortsetzungen schließen an den Text an (Ilka auf dem Steg im Nebel); grok-4.6 setzt den Text aus Lauf 1 fort, nicht nur die Eröffnung.

**Nebenbefund:** grok-4.7 meldet für fast denselben Kontext rund 1.000 Eingabe-Token mehr als grok-4.6 – passt zum festen Grundanteil von ca. 1.200 Token, der in 3.7 bei kleinem Kontext auffiel (Logbuch 2026-09-27 03:35). Für die Budgetgrenze ohne Belang.

## Nicht mit echten Läufen geprüft

Abgebrochene und gescheiterte Anfragen (Zählung ohne Kosten) sowie die Anzeige in der Oberfläche sind durch Tests belegt (`tests/api/test_usage.py`, `ui/src/views/ModelChoice.test.tsx`, End-to-End-Test „the model of a story survives a reload …“).
