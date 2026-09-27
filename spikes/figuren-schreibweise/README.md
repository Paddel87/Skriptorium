# Messlauf Schritt 3.4 – Figuren-Schreibweise mit echten KI-Läufen

Datum: 2026-09-27. Zweck: Akzeptanzkriterium FR-012 prüfen – in einer Geschichte mit Ich-Figur schreibt die KI ohne Anweisung keine Handlung, Rede oder Gedanken der Ich-Figur. Ausgangslage: Im Probeschreiben 3.3 (`spikes/probeschreiben/README.md`) 20 Verstöße in 15 Texten.

## Aufbau

- Neuer Wortlaut in `context` (Regel mit Verbotenem, Erlaubtem und Endpunkt im festen Teil; kurze Erinnerung nach der Anweisung).
- Testwelt und Manuskript-Stand am Ende von Kapitel 5 aus dem Probeschreiben 3.3; echter Server, `spikes/probeschreiben/probe.py`, Aufruf über `laeufe.sh`.
- 10 Anfragen an grok-4.7: 3 Szenen-Einstiege, 5 Fortsetzungen (darunter eine leere Anweisung und ein Sturm, der zum Handeln drängt), 2 Kapitelschlüsse. Keine Anweisung verlangt, wo die KI aufhören soll. Alle Vorschläge verworfen, damit jeder Lauf am selben Stand ansetzt. Kosten 0,413 $.

## Bewertung

Getrennte Instanz (Claude Sonnet 5), blind: nur Texte, Handlungsstand und Kanon; Kategorien Handlung (H), Rede (R), Entschluss (E), Gedanken (G) der Ich-Figur. Stichprobe per Suche nach Ich-Handlungsformen bestätigt (in allen 10 Texten zusammen nur 10-mal „ich“).

| Text | eindeutige Verstöße | fraglich | endet an einer Stelle, an der Ilka handeln müsste |
|---|---|---|---|
| s1-tolm | 0 | 1 (Bewegung nur über Wahrnehmung übergeblendet) | ja |
| s2-marr | 0 | 0 | ja |
| s3-deck | 0 | 0 | ja |
| f1-weiter | 0 | 0 | ja |
| f2-lund | 0 | 0 | ja |
| f3-patrouille | 0 | 1 („Das Holz unter meinen Händen vibrierte“ – Zustand aus dem Vortext) | ja |
| f4-leer | 0 | 0 | ja |
| f5-sturm | 0 | 0 | ja |
| k1-schluss | 0 | 0 | ja |
| k2-ankunft | 0 | 0 | ja |

**Ergebnis:** 0 eindeutige Verstöße in 10 Texten (3.3: 20 in 15), 2 fragliche; alle Texte enden, wo der Autor weiterschreibt. Keine eindeutigen Kanon-Widersprüche. FR-012 erfüllt.

## Grenzen

Kein kontrollierter Vergleich: Die Texte aus 3.3 entstanden in anderen Situationen und mit Anweisungen, die oft selbst ein Ende „an einer Stelle, an der Ilka handeln muss“ verlangten. Zehn Läufe, ein Modell (grok-4.7), eine Ich-Figur. Die fraglichen Stellen zeigen den Ausweg der KI: Bewegung der Ich-Figur wird über Wahrnehmung übergeblendet. Im Schreibbetrieb des Eigentümers weiter beobachten.
