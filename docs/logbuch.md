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

Das Logbuch beginnt mit der ersten regulären Session nach dem Initialisierungs-Commit (Modus 2, abgeschlossen 2026-09-26). Verlauf und Begründungen der Initialisierung stehen in `docs/decisions.md` (ADR-001 bis ADR-009). Phasen 1 und 2 sind verdichtet; Details in `docs/archiv/logbuch-phase-1.md` und `docs/archiv/logbuch-phase-2.md`.

---

<!-- ANCHOR:eintraege -->
## Einträge (neueste oben)

### 2026-09-26 21:30 – [ADR-ANGELEGT] ADR-021 – Beginn 3.1

- Eigentümer (Frage-System): Option A – Log-Zeile je KI-Anfrage `[BELASTBAR]`, Verbrauchsspeicherung in 3.9. Observability/Logging befördert, Metriken bleiben `[VORLÄUFIG]` (Landeplatz 3.9). `[OPERATIV]`, geplant laut Notiz an 3.1; Reaktiv-Quote 1/10.
- 3.1 `[IN ARBEIT]`. Anfrageform aus dem Spike `spikes/modell-eignungstest/lauf.py`: `reasoning: {"effort": "low"}` für grok-4.7, grok-4.6, qwen3.8-max (Reasoning Pflicht), `usage: {"include": true}`; Anbieter-Ausschluss (StreamLake) nur für deepseek-Modelle nötig – Konfiguration vorgesehen, für die drei Modelle leer.
- In dieser Umgebung ist kein OpenRouter-Schlüssel gesetzt (nur Vorhandensein geprüft): Adapter wird mit simulierten Antworten (`httpx.MockTransport`) getestet, ein echter Aufruf folgt mit 3.3.

### 2026-09-26 21:27 – [SESSIONSTART] Fortsetzung mit 3.1 auf Anweisung „3.1 hier“

- **Abweichung:** Sessiongröße 239.206 Token über der Grenze 200.000; der Eigentümer hat ausdrücklich „3.1 hier“ angeordnet (`CLAUDE.md` Abschnitt 0, Ausnahme „weiter hier“).
- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 21:27) → Entscheidungs-Klasse; 3.1 empfiehlt Routine – Hinweis an den Eigentümer gegeben (Wochenkontingent `allowed_warning`); keine Abgabe ohne Probelauf. Beförderung der Observability (Auslöser 4) verlangte ohnehin die Entscheidungs-Klasse.
- PR #8 gemergt (`25df654`); Branch `scp/affectionate-euler-piciei` auf `main` vorgespult.

### 2026-09-26 21:06 – [SESSIONENDE] Phase 2 abgeschlossen

- **Dauer:** 20:57–21:06 UTC.
- **Bearbeitet:** Phasenabschluss 2 – Bewertung durch getrennte Instanz, Stellungnahme, `ENTSCHEIDUNG ERFORDERLICH`, ADR-020 (weiterbauen); Vision-Re-Derivations-Pass; Onboarding-Re-Validation; Archivierung Fahrplan Phase 2 und Logbuch-Verdichtung; `data/index.sqlite` aus dem Git-Index genommen; Pflichtnotiz `api.flows` an 3.3.
- **Vision-Abgleich (Befund):** Jedes Vision-Element (Kernidee, Zielbild mit fünf Szenarien, sechs Erfolgskriterien, Abgrenzungen, harte Randbedingungen, weiche Präferenzen) hat eine Schritt-ID oder eine Descope-ADR; jede Muss-Anforderung hat einen existierenden Schritt (Phase 3, 4.8, D.4) oder ist erledigt (FR-002, 005, 007, 016) bzw. verworfen (FR-006, ADR-009). Keine `[VERSCHOBEN]`-Zeile mit erreichtem Ziel (V.1–V.5 → 5.5). Keine verwaisten Elemente, keine `TODO` im Code.
- **Erreichter Stand:** Phase 3 „Schreiben mit KI“ bereit; kein aktiver Schritt.
- **Offen:** Pull Request für diesen Branch (Merge nach grüner CI und Zustimmung des Eigentümers).
- **Nächster Schritt:** neue Session – 3.1 `ai_gateway` (Anbieter-Schnittstelle, OpenRouter-Adapter).
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 21:05). Schritte oberhalb der Empfehlung: 0 (Phasenabschluss verlangt Entscheidung). Abgegebene Teilarbeiten: Bewertung an Unteragenten mit Sonnet 5 (getrennte Instanz, keine Routine-Abgabe).
- **Kontextgröße:** 190.131 Token laut Sitzungsabfrage – knapp unter der Grenze 200.000; kein neuer Schritt in dieser Session. Sitzungskosten laut Abfrage ca. 3,70 $. Wochenlimit `allowed_warning`, Zurücksetzung 2026-09-27 10:00 MESZ.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Nächste Schritte); project-context Status auf Phase 3. Drift-Prüfung: ADR-020 → 3.3 vorhanden, ADR-015 bis 019 → 2.1–2.7 im Archiv; Modul-Liste unverändert; Reifegrade unverändert und passend zu ADR-020 (keine Reifegrad-Wirkung); Reaktiv-Quote 1/10 über ADR-011..020; Phase 3 unverändert 9 Schritte; Blocker 0; Anforderungen unverändert. Ablaufdaten-Register: kein fälliger Vorlauf (Guthaben-Vorlauf ab 2026-10-22). Archivierung: Fahrplan Phase 2 → `docs/archiv/fahrplan-phase-2.md`, Logbuch Phase 2 → `docs/archiv/logbuch-phase-2.md` (Phase-1-Sessionende ins Phase-1-Archiv). project-context 338 Zeilen.

### 2026-09-26 21:05 – [PHASEN-WECHSEL] Reflexion Phase 2 (UMSETZUNG) → Phase 3 (UMSETZUNG)

- **Gelernt:** Die Grobverträge aus 1.4 trugen – `storage`, `canon`, `manuscript`, `api`, `ui` ohne Umbau umgesetzt; Modulgrenzen an den Imports eingehalten (getrennte Instanz, ADR-020).
- **Gelernt:** Sicherheit nach ASVS mit Kapitelnummer je Maßnahme machte die Prüfungen durch getrennte Instanzen schnell und die Obergrenze (ADR-006) handhabbar; optionale Härtungen wurden dem Eigentümer vorgelegt statt still umgesetzt.
- **Gelernt:** Browser-Proben brauchen echte Wege: `page.evaluate` umgeht die CSP; nur ein eingeschleustes Inline-Skript belegt sie.
- **Kippende Annahmen:** `api` braucht Zugangsdaten in `storage` und Pwned Passwords (ADR-018, reaktiv); Editor-Bündel zu groß ohne Nachladen; Umfang von 2.6 wuchs um Einrichtung, Passwortwechsel und Sitzungsübersicht (ADR-017).
- **Reifegrad:** `storage`, `canon`, `manuscript`, `api`, `ui` und HTTP/JSON durch Umsetzung validiert; `context`, `ai_gateway`, SSE nur durch Spikes – Validierung in Phase 3.
- **ADRs der Phase:** 015–020; reaktiv 1 (018); Quote 1/10.
- **Neue Erkundungsbedarfe:** keine vor 3.1; beobachten: Wachstum von `api` in 3.3 (`api.flows`, ADR-020), Tempo von `storage` bei großen Geschichten (D.4), Sitzungen im Speicher bei langem Streaming.
- **Methodik-Lehren:** Sessions liefen dreimal weit über die Kontextgrenze (bis ca. 500.000 Token) auf ausdrückliche Anweisung; Phasenabschluss deshalb in eigener Session. Hygiene-Lücke: `data/index.sqlite` rutschte trotz `.gitignore` in den Git-Index – beim Stagen Dateilisten prüfen. Worktree-Validierung biegt den Pre-Commit-Hook um (zweimal) – Runbook ergänzt.
- **Details:** [`docs/archiv/logbuch-phase-2.md`](archiv/logbuch-phase-2.md)

### 2026-09-26 21:04 – [ADR-ANGELEGT] ADR-020

- Pflichtfrage Phasenende 2: Eigentümer wählt Empfehlung A – weiterbauen, `data/index.sqlite` aus dem Git-Index nehmen, Pflichtnotiz „Abläufe in `api.flows`“ an 3.3. `[STRATEGISCH]`; Bewertung der getrennten Instanz und Stellungnahme im ADR nebeneinander. Die in ADR-018 angekündigte Prüfung „Gott-Modul“ ist damit erfolgt.

### 2026-09-26 21:01 – [PROBLEM-GELÖST] Pre-Commit-Hook nach Worktree-Validierung

- Erster Commit der Session scheiterte: `` `pre-commit` not found ``. Ursache: `pre-commit install` (Quick Start) und `scripts/session-start.sh` im Worktree haben `.git/hooks/pre-commit` auf die venv des Worktrees gesetzt; der Worktree war schon entfernt. Lösung: im Haupt-Checkout `uv run pre-commit install`. Zweites Auftreten nach 2.1 → Runbook-Eintrag um die Pflicht nach jeder Worktree-Validierung ergänzt.

### 2026-09-26 21:00 – [ONBOARDING-VALIDATION] Phasenabschluss 2 (Trigger 3)

- **Form (Klasse M):** frischer Worktree von `646ddfe` im Scratchpad, eigenes Datenverzeichnis; README-Quick-Start exakt wie dokumentiert: `uv python install 3.14.7`, `uv sync --frozen`, `npm ci` (0 Schwachstellen), `pre-commit install`, `skriptorium-einrichtung` (Exit 0; Ausgabe mit dem Einrichtungscode nicht angezeigt), `npx vite build`, uvicorn.
- **Ergebnis:** `/api/health` → `{"status":"ok"}`; `/` → 200 (Oberfläche); `/api/worlds` ohne Sitzung → 401; Server-Log ohne Warnung. `pytest --cov`: 224 bestanden, 99,94 %; `vitest --coverage`: 32 bestanden, 99,02 % Zeilen. Smoke-Test `scripts/session-start.sh` im Worktree: Exit 0.
- **Befund:** keiner im Onboarding-Pfad. End-to-End-Tests nicht im Worktree wiederholt (laufen im CI-Job End-to-End). Nebenbefund: `data/index.sqlite` liegt im Git-Index, obwohl `/data/` ignoriert ist (leerer Index, seit `53071f0`) – Behandlung nach der Bewertung der getrennten Instanz.

### 2026-09-26 20:57 – [SESSIONSTART] Phasenabschluss 2

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 20:57) → Entscheidungs-Klasse. Der Phasenabschluss enthält einen `ENTSCHEIDUNG ERFORDERLICH`-Block (Eskalations-Auslöser 1) – Klasse passt, kein Stopp.
- **Kontextgröße:** 0 Token laut Sitzungsabfrage (neue Session). Wochenlimit `allowed_warning`, Zurücksetzung 2026-09-27 10:00 MESZ.
- PR #7 gemergt (`646ddfe`); Branch `scp/affectionate-euler-piciei` steht auf `main`.
- **Vorhaben:** Pflichtfrage „Weiterbauen, umbauen oder neu aufsetzen“ mit getrennter Instanz; Vision-Re-Derivations-Pass gegen `docs/vision.md` und `docs/requirements.md`; Onboarding-Re-Validation (Trigger 3); nach der Entscheidung ADR, Archivierung von Phase 2, Logbuch-Verdichtung.

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
