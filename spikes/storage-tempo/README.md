# Messung 4.1 – Tempo von `storage` bei großen Geschichten

Stand: 2026-09-27. Skript: `messung.py` (`uv run python spikes/storage-tempo/messung.py`), Cloud-Session des Coding-Agents (Linux, Python 3.14.7), Median aus 7 Läufen.

## Aufbau

Eine Welt mit 500 Kanon-Einträgen (Kategorie Ort, je ca. 760 Zeichen) und ein Roman im Referenzumfang: 60 Kapitel zu je 40.000 Zeichen, zusammen 2,4 Mio. Zeichen, bei 3,3 Zeichen je Token ca. 727.000 Token (Referenzgeschichte: 500.000–700.000 Token). Jedes Kapitel hat eine Kurzfassung. Datenverzeichnis 6,5 MB, 562 Markdown-Dateien.

## Ergebnis

| Vorgang | Dauer |
|---|---|
| Kapitel speichern (letztes Kapitel, 40.000 Zeichen) | 48 ms |
| Kapitel lesen | 3 ms |
| Alle Kapitel lesen | 50 ms |
| Alle Kanon-Einträge lesen (500) | 119 ms |
| Kontext bauen (Weiterschreiben im letzten Kapitel) | 161 ms |
| Namenssuche | 0,3 ms |
| Volltextsuche | 1,7 ms |
| Index neu aufbauen | 257 ms |
| Befüllen (60 Kapitel mit Kurzfassung, einmalig) | ca. 2,0 s |

## Bewertung

Jeder Vorgang einer Schreibsitzung bleibt weit unter dem Anzeige-Ziel von 1 s (NFR Reaktionszeit, `docs/architecture.md` Abschnitt 6). Der Kontextbau liest bei jeder Anfrage alle Kapitel und alle Kanon-Einträge von der Platte; bei diesem Umfang kostet das 161 ms und ist im Vergleich zur Antwortzeit des Modells (13–77 s bis zum ersten Textstück, ADR-022) ohne Belang. Kein Handlungsbedarf; ein Zwischenspeicher wäre erst bei einem Vielfachen dieses Umfangs zu erwägen.

Der VPS aus 4.2 ist voraussichtlich langsamer als die Cloud-Session; die Messung lässt sich dort mit demselben Skript wiederholen.
