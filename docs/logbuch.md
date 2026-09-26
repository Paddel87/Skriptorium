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

Das Logbuch beginnt mit der ersten regulären Session nach dem Initialisierungs-Commit (Modus 2, abgeschlossen 2026-09-26). Verlauf und Begründungen der Initialisierung stehen in `docs/decisions.md` (ADR-001 bis ADR-009). Phase 1 ist verdichtet; Details in `docs/archiv/logbuch-phase-1.md`.

---

<!-- ANCHOR:eintraege -->
## Einträge (neueste oben)

### 2026-09-26 17:35 – [BEOBACHTUNG] 2.1 vorbereitet – Probeaufbau und Abkündigung in Starlette

- Werkzeug-Versionen gegen PyPI, npm-Registry und Git-Tags geprüft; Tabelle in `docs/research/versions-verifikation.md` („Entwicklungswerkzeuge").
- Probeaufbau im Scratchpad (Python 3.14.7 über uv 0.12.19, Node 24.21.0 als Tarball von nodejs.org mit geprüfter SHA-256): alle Gates liefen.
- **Befund:** Starlette 1.7.0 kündigt httpx im TestClient zugunsten von `httpx2` an; mit `filterwarnings = error` bricht jeder Test ab. httpx2 (Pydantic-Fortführung) ist erst ab 2026-11-12 mindestreif. Ein erster Filter mit Kategorie `DeprecationWarning` griff nicht – die Warnung ist eine eigene Klasse `starlette.exceptions.StarletteDeprecationWarning`; erst der volle Klassenpfad wirkte.
- **Befund:** Die v7-Actions in `ci.yml` sind jünger als 6 Monate; mypy 2, vitest 5 ebenfalls. pytest-cov 7 und setup-python/setup-node v6 haben gar keine Patch-Versionen – Regel-001 greift dort nicht sauber (zur Entscheidung).
- **Befund:** `UV_NATIVE_TLS`-Warnung verschwindet mit `UV_SYSTEM_CERTS=1` und entferntem `UV_NATIVE_TLS`; in CI ist die Variable nicht gesetzt.
- **Reibung:** GitHub-API aus der Umgebung gesperrt (403); Action-Daten über `git ls-remote` und flache Tag-Abrufe ermittelt.
- Zwei transitive Lizenzen außerhalb der Liste (CC-BY-4.0, BlueOak-1.0.0) im Build-Werkzeug.

### 2026-09-26 17:00 – [SESSIONSTART] Schritt 2.1

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage `get_session`, 17:00 UTC) → Entscheidungs-Klasse; entspricht der Empfehlung für 2.1.
- **Kontingent:** Wochenlimit Status `allowed_warning` (Warnschwelle erreicht), Zurücksetzung 2026-09-27 10:00 MESZ laut Sitzungsabfrage. Kontextgröße zu Beginn laut Abfrage 0 (Wert offenbar noch nicht befüllt).
- **Mindest-Lektüre:** project-context vollständig; Logbuch ab letztem `[SESSIONENDE]`; Fahrplan „Aktueller Stand" und Phase 2; Architektur 1, 2, 9; Decisions Teil A und C; Blocker aktiv (keine).
- **Plan:** 2.1 mit `ENTSCHEIDUNG ERFORDERLICH` (Werkzeug-Pins Kategorie 3, CI-Gates Kategorie 7) beginnen.
- **Beobachtung:** Der letzte `[SESSIONENDE]`-Eintrag trägt „22:00 UTC", die Systemuhr zeigt jetzt 17:00 UTC desselben Tages – die Zeitangaben der Vorsession waren vermutlich nicht UTC. Ab hier Zeiten in UTC laut Systemuhr.

### 2026-09-26 22:00 – [SESSIONENDE] Phase 1 abgeschlossen

- **Dauer:** ca. 14:56–22:00 UTC (eine Session, fortgesetzt nach überschrittener Sessiongröße auf Anweisung des Eigentümers, 17:40).
- **Bearbeitet:** 1.1, 1.2, 1.3, 1.4, 1.5 und M.1 – alle `[ERLEDIGT]`; ADR-010 bis ADR-014.
- **Erreichter Stand:** Phase 1 abgeschlossen, Architektur `[BELASTBAR]`, Phase 2 bereit.
- **Offen:** nichts aus Phase 1. Nächster Schritt 2.1 ist freigabepflichtig (Werkzeug-Pins, CI-Gates).
- **Nächster Schritt:** neue Session – 2.1 mit `ENTSCHEIDUNG ERFORDERLICH` beginnen.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage, zuletzt 21:55). Schritte oberhalb der Empfehlung: 2 (1.3 Routine, M.1 Routine; Hinweis an den Eigentümer vorab gegeben). Abgegebene Teilarbeiten: 16 Bewertungs- bzw. Prüf-Instanzen auf gleicher Klasse (Opus) und 1 getrennte Prüf-Instanz auf Sonnet (Pflichtfrage Phasenende, als unabhängige Prüfung, nicht als Routine-Abgabe); keine Routine-Abgabe, da ohne Probelauf.
- **Kontextgröße:** 562.311 Token laut Sitzungsabfrage (Grenze 200.000, überschritten mit ausdrücklicher Ausnahme des Eigentümers „weiter hier"). Sitzungskosten laut Abfrage ca. 38 $; OpenRouter-Verbrauch 1,66 $ (Rest 3,34 $).
- **Sessionende-Prüfungen:** README synchronisiert; Drift-Prüfung (ADR → Schritt: 1.1–1.5 im Archiv `docs/archiv/fahrplan-phase-1.md`, übrige im Fahrplan; Reifegrad ↔ ADR-013; Modulnamen unverändert; Reaktiv-Quote 0/10; Phase 1 5 Schritte, Schwelle nicht berührt); Ablaufdaten-Register ohne fälligen Vorlauf (Guthaben-Vorlauf ab 2026-10-22); Archivierung: Fahrplan Phase 1 und Logbuch Phase 1 ausgelagert.

### 2026-09-26 22:00 – [PHASEN-WECHSEL] Reflexion Phase 1 (ERKUNDUNG) → Phase 2 (UMSETZUNG)

- **Gelernt:** Kanon-Treue hängt am Vorab-Denken der Modelle, nicht an der Kontextmenge – 8.000 bis 17.600 Token ohne Unterschied; Modelle ohne Reasoning machen 2–3× mehr Fehler.
- **Gelernt:** grok-4.7 führt bei Kanon, Sprache und allen vier Genres; Preis ist die Wartezeit (15–50 s). Gemini hat nachgelassen – Bestätigung der Vision-Sorge um Filter und Modellverfügbarkeit.
- **Gelernt:** Die Figuren-Schreibweise (Autor führt Ilka) bricht unter Genre-Druck am häufigsten – Schwerpunkt für Prompt und Tests in 3.3/3.4.
- **Kippende Annahmen:** „erstes Textstück in 5 s" (ersetzt, ADR-013); „Import aus TypingMind/Notion" (zunächst Markdown, ADR-012); „Qwen als Ausweich" (grok-4.6, ADR-011).
- **Reifegrad:** Architektur vollständig `[BELASTBAR]` außer Observability, Stateful, Sicherheit/Betrieb (Phase 3/4).
- **ADRs der Phase:** 010–014, alle geplant, 0 reaktiv.
- **Neue Erkundungsbedarfe:** keine vor Phase 2; beobachten: Budget oberhalb 17.600 Token (3.2/D.4), Import-Zeit gegen 30 Minuten (4.8), Filterpolitik von xAI (ADR-011).
- **Methodik-Lehren:** Prüf-Aufträge ohne Platzhalter formulieren (zwei Pannen); Kriterien vor der Bewertung fixieren und Eichtexte mitlaufen lassen (hat die Vergleichbarkeit über Runden belegt); Sitzungsabfrage meldete Kontextgröße erst spät.
- **Details:** [`docs/archiv/logbuch-phase-1.md`](archiv/logbuch-phase-1.md)

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
