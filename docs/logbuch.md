# Logbuch – Skriptorium

<!-- Chronologischer Flugschreiber des Projekts. Ereignisbasierte Einträge, neueste oben.
     Zweck:
       1. Nahtlose Fortsetzung in neuer Session: was war zuletzt los, womit ging es zu Ende?
       2. Wiederfindbarkeit kleiner Lösungen: was war das nochmal mit dem Migrations-Bug?
       3. Selbst-Beobachtung des Projekts: was hat länger gedauert, was war überraschend?

     Abgrenzung zu anderen Dokumenten:
       - fahrplan.md: Was tun wir? (Plan)
       - decisions.md: Warum so? (Begründung)
       - architecture.md: Wie ist es gebaut? (Zustand)
       - blockers.md: Was hindert uns aktuell? (offene Probleme)
       - CHANGELOG.md: Was hat sich für Nutzer geändert? (extern, versionsorientiert)
       - logbuch.md: Was ist während der Arbeit passiert? (intern, chronologisch)

     Das Logbuch ist die einzige chronologisch durchlaufende Erzählung.
     Es darf detailreich sein und kleine Reibungen festhalten – das ist sein Wert. -->

<!-- ANCHOR:aktueller-stand -->
## Aktueller Stand

Die letzten Einträge geben den aktuellen Stand wieder. Bei Sessionbeginn liest die KI mindestens den letzten `[SESSIONENDE]`-Eintrag und alle Einträge danach, um den Faden aufzunehmen.

Das Logbuch beginnt mit der ersten regulären Session nach dem Initialisierungs-Commit (Modus 2, abgeschlossen 2026-09-26). Verlauf und Begründungen der Initialisierung stehen in `docs/decisions.md` (ADR-001 bis ADR-009).

---

<!-- ANCHOR:eintraege -->
## Einträge (neueste oben)

### 2026-09-26 15:10 – [PROBLEM-GELÖST] OpenRouter-Schlüssel gefunden

- Eigentümer: Der Schlüssel liegt in der Umgebungsvariable `KEY`, nicht in `OPENROUTER_API_KEY`.
- Geprüft ohne Wertausgabe: gesetzt, Länge 73, OpenRouter-Präfix vorhanden. Abfrage `/api/v1/key`: Ausgabengrenze 5 $, verbraucht 0 $, keine Zurücksetzung der Grenze, kein Gratis-Kontingent.
- Beobachtung: Der Name `KEY` ist unspezifisch. Für den Wegwerf-Code aus 1.1 wird er so gelesen; welcher Variablenname im Produkt gilt, entscheidet Schritt 3.1 (`.env.example`).
- Eingangskriterium 1 von 1.1 erfüllt; die Testszene fehlt weiter, STOPP bleibt bestehen.

### 2026-09-26 15:00 – [BEOBACHTUNG] Eingangskriterien 1.1 nicht erfüllt – STOPP (Informationslücke)

- Geprüft: Umgebungsvariable `OPENROUTER_API_KEY` ist in der Cloud-Umgebung **nicht gesetzt** (nur Vorhandensein geprüft, kein Wert ausgegeben). Keine andere Variable mit Bezug zu OpenRouter vorhanden.
- Testszene (Ort, Figuren, Ziel) mit Kanon-Auszug liegt nicht vor.
- Bereitstellungsweg für den Schlüssel ist im Fahrplan als `[TBD]` offen. Vorschlag an den Eigentümer: Umgebungsvariable `OPENROUTER_API_KEY` in den Einstellungen der Cloud-Umgebung; wirkt erst in einer neuen Session.
- Folge: 1.1 bleibt `[OFFEN]`, STOPP nach CLAUDE.md Abschnitt 8, Kriterium 1; STOPP-Block im Fahrplan „Aktueller Stand" hinterlegt. 1.2 braucht ebenfalls Material des Eigentümers (Exporte); 1.3 ist ohne Zutun beginnbar.

### 2026-09-26 14:56 – [SESSIONSTART] Auftrag: Schritt 1.1

- **Modell:** eingestellt `claude-opus-5-5`, bedient `claude-opus-5-5` → Entscheidungs-Klasse (Quelle: Sitzungsabfrage `get_session`). Empfohlene Klasse für 1.1: Entscheidung – keine Abweichung.
- **Kontextgröße:** Sitzungsabfrage meldet `used_tokens: 0` bei `max_tokens: 1.000.000` – Wert offensichtlich nicht aktuell; Größenregel wird mit Vorbehalt angewendet.
- **Kontingent:** Wochenlimit Status `allowed_warning` (Zurücksetzung So 2026-09-27 10:00 MESZ) – Hinweis an den Eigentümer.
- **Einstieg:** erster regulärer Sessionstart nach Modus 2; kein vorheriger `[SESSIONENDE]`-Eintrag. Mindest-Lektüre vollständig durchlaufen.

<!-- ANCHOR:eintragstypen -->
## Eintragstypen (Übersicht)

Verbindliche Typen, andere nur in Ausnahmefällen:

| Typ | Wann | Pflicht? |
|---|---|---|
| `[SESSIONSTART]` | Zu Beginn jeder Session | Ja |
| `[SESSIONENDE]` | Vor Sessionabschluss | Ja |
| `[PROBLEM-GELÖST]` | Nach Behebung eines Problems, das Reibung war | Empfohlen, alle Mini-Probleme erfassen |
| `[PROBLEM-OFFEN → BLOCKER]` | Wenn ein Problem zum Blocker eskaliert | Ja, mit Verweis auf `blockers.md` |
| `[BLOCKER-AUFGELÖST]` | Wenn ein Blocker gelöst wurde | Ja, mit Verweis auf den ursprünglichen Logbuch- und Blocker-Eintrag |
| `[REIFEGRAD-WECHSEL]` | Bei jeder Reifegrad-Änderung in `architecture.md` | Ja |
| `[ADR-ANGELEGT]` | Bei Anlage eines neuen ADR | Ja |
| `[BEOBACHTUNG]` | Wenn etwas auffällt, das später nützlich sein könnte | Optional, KI proaktiv |

<!-- ANCHOR:hinweise-zur-pflege -->
## Hinweise zur Pflege

- **Neueste Einträge oben.** Lesefluss bei Sessionbeginn ist „von oben nach unten bis zum letzten gelesenen Stand".
- **Zeitstempel ist Pflicht.** Format: `YYYY-MM-DD HH:MM` (24h, lokale Zeitzone). Bei Unsicherheit: das Datum ist Pflicht, die Uhrzeit kann grob sein.
- **Detailtiefe lieber zu hoch als zu niedrig.** Das Logbuch lebt davon, dass auch kleine Reibungen festgehalten werden – sie sind im Moment des Auftretens unscheinbar, aber später Goldwert. Wenn unsicher, ob etwas eingetragen werden soll: eintragen.
- **Verweise sind willkommen.** Wenn ein Logbuch-Eintrag mit einem ADR, einem Blocker oder einem Fahrplan-Schritt zusammenhängt: verweisen, statt zu duplizieren.
- **Keine sensiblen Daten.** Auch im Logbuch keine Secrets, keine echten PII, keine internen URLs aus Produktion. Platzhalter verwenden.

<!-- ANCHOR:archivierung -->
## Archivierung

Wenn das Logbuch unübersichtlich wird (Richtwert: >800 Zeilen, schneller wachsend als andere Dokumente):

- Alte Einträge nach `docs/archiv/logbuch-YYYY-MM.md` auslagern.
- Im aktiven Logbuch bleibt: die letzten 4–8 Wochen, plus alle Einträge, die mit aktuell offenen `blockers.md`-Einträgen verbunden sind.
- Auslagerung ist Sessionende-Aktion, keine freigabepflichtige Entscheidung.
