# Spike: httpx 0.28.1 auf Python 3.14.7 (Fahrplan-Schritt 1.3)

**Wegwerf-Code der Erkundungsphase**, wird nicht in die Module übernommen.

## Umgebung (2026-09-26)

- Python 3.14.7 (python-build-standalone über uv 0.12.19), Linux x86_64 (Cloud-Session)
- httpx 0.28.1 mit den aufgelösten Abhängigkeiten httpcore 1.0.9, anyio 4.15.1, h11 0.16.0, certifi 2026.7.22, idna 3.20
- Aufruf: `python -X dev -W error pruefung.py --openrouter` (Entwicklungsmodus, alle Warnungen als Fehler)

## Protokoll

| Prüfung | sync | async | Ergebnis |
|---|---|---|---|
| Streaming von Server-Sent Events (lokaler Testserver, 20 Ereignisse im Abstand von 0,05 s) | bestanden | bestanden | Ereignisse kommen gestaffelt an (Spanne 0,96 s), nicht gesammelt am Ende |
| Zeitüberschreitung beim Lesen (Server antwortet nach 3 s, Lese-Timeout 1 s) | bestanden | bestanden | `httpx.ReadTimeout` nach 1 s |
| Abbruch eines laufenden Stroms (sync: `break` nach 3 Ereignissen; async: Task-Abbruch nach 0,2 s) | bestanden | bestanden | Antwort geschlossen, keine Warnung, Client danach weiter nutzbar |
| Echte Streaming-Anfrage an OpenRouter (grok-4.6) | – | bestanden | 39 Textstücke, erstes nach 2,5–2,7 s, `finish_reason: stop` |

- 9/9 Prüfungen bestanden; lokale Prüfungen dreimal wiederholt, jeweils 8/8.
- Keine `DeprecationWarning`, `ResourceWarning` oder sonstige Warnung (mit `-W error` wäre jede ein Abbruch).
- **Beobachtung:** Im ersten Lauf meldete der asyncio-Entwicklungsmodus einmal eine Blockade der Ereignisschleife von 0,21 s; in drei weiteren Läufen nicht mehr. Vermutliche Ursache: einmaliges Laden der Zertifikate beim Anlegen des Clients. Folge für `ai_gateway` (3.1): `httpx.AsyncClient` einmal beim Start anlegen und wiederverwenden, nicht je Anfrage.
- Die „Broken pipe"-Meldungen im ersten Lauf kamen aus dem eigenen Testserver (Schreiben nach absichtlichem Abbruch durch den Client) und sind abgefangen.

## Ergebnis

Annahme „httpx 0.28.1 trägt auf Python 3.14.7" **validiert**. Nachprüfung bleibt Schritt D.3 (2027-03-26), weil httpx 0.28 Python 3.14 nicht offiziell deklariert.
