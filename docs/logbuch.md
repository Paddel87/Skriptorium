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

Das Logbuch beginnt mit der ersten regulären Session nach dem Initialisierungs-Commit (Modus 2, abgeschlossen 2026-09-26). Verlauf und Begründungen der Initialisierung stehen in `docs/decisions.md` (ADR-001 bis ADR-009). Phasen 1 bis 3 sind verdichtet; Details in `docs/archiv/logbuch-phase-1.md`, `docs/archiv/logbuch-phase-2.md` und `docs/archiv/logbuch-phase-3.md`.

---

<!-- ANCHOR:eintraege -->
## Einträge (neueste oben)

### 2026-09-27 22:40 – [BEOBACHTUNG] Anbieterlage und SSH aus der Cloud-Session

- **SSH gesperrt:** Aus der Cloud-Session sind ausgehende Verbindungen auf Port 22 nicht möglich (Test gegen github.com:22). Die KI kann einen Server also nicht selbst per SSH einrichten; Einrichtung über Browser-Konsole des Anbieters, Cloud-Init oder GitHub Actions.
- **Hetzner ausverkauft:** Alle günstigen Cloud-Tarife (CX, CAX) seit 2026-09-07 nicht bestellbar, Preise 2026 zweimal erhöht; verfügbar nur teurere Tarife ab ca. 14 € brutto. Übersicht aller geprüften Anbieter: `docs/research/hosting-anbieter.md`.

### 2026-09-27 22:15 – [SESSIONSTART] Schritt 4.2

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 22:15) → Entscheidungs-Klasse. Empfohlene Klasse für 4.2 ist Entscheidung (Eskalations-Auslöser 1) – passt, kein Stopp, keine Warnung.
- **Kontextgröße:** 0 Token laut Sitzungsabfrage (Wert zu Beginn nicht aktualisiert, wie in den Vorsessions). Kurzzeitlimit (5 Stunden) `allowed`.
- PR #19 gemergt (`a528047`); Branch `scp/sharp-wright-4ofnvz` steht auf `main`.
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2 (project-context, Logbuch ab letztem Sessionende, Fahrplan Stand und Phase 4, Architektur 1/2/9, Decisions A/C, aktive Blocker: keine).
- **Vorhaben:** Schritt 4.2 Host bereitstellen und härten – zuerst `ENTSCHEIDUNG ERFORDERLICH` zum VPS-Anbieter (Kategorien 3, 6, 7).

### 2026-09-27 13:10 – [SESSIONENDE] Schritt 4.1

- **Dauer:** 12:48–13:10 UTC.
- **Bearbeitet:** 4.1 Qualitäts-Härtung → `[ERLEDIGT]`.
- **Erreichter Stand:** Coverage nachgewiesen (Python 99,78 %, `canon`/`context` 100 %; Oberfläche 98,65 % Zeilen, 96,43 % Zweige); Fehler in der Seitenauswahl von `context` behoben; Tempo `storage` im Referenzumfang gemessen; Geschichtenseite aufgeteilt.
- **Offen:** Pull Request für diesen Branch (Merge nach grüner CI und Zustimmung des Eigentümers).
- **Nächster Schritt:** 4.2 Host bereitstellen und härten – `ENTSCHEIDUNG ERFORDERLICH` zum VPS-Anbieter (Kategorien 3, 6, 7), Entscheidungs-Klasse.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 12:59). Schritte oberhalb der Empfehlung: 1 (4.1, Routine) – ohne Warnung, weil die Routine-Klasse mangels Probelauf inaktiv ist und ihre Arbeit eine Klasse höher läuft. Abgegeben: nichts.
- **Kontextgröße:** nicht feststellbar – die Sitzungsabfrage meldet während der Session 0 Token; Regel „Sessiongröße“ entfällt für diese Session. Kurzzeitlimit `allowed`.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Nächste Schritte); project-context Status nachgezogen. Drift-Prüfung: 4.1 ↔ ADR-024 vorhanden; Modul-Liste unverändert (nur Dateien innerhalb von `ui`); Reifegrad `storage` um die Messung ergänzt, kein Wechsel; keine neuen ADRs, Reaktiv-Quote 1/10 unverändert; Phase 4 unverändert 8 Schritte; Blocker 0; Anforderungen unverändert. Ablaufdaten-Register: kein Vorlauf erreicht (Guthaben ab 2026-10-22). Archivierung: kein Trigger (Logbuch unter 1.600 Zeilen, Phase 4 offen). project-context 338 Zeilen. Onboarding-Pfad: nicht berührt (keine Änderung an README-Quick-Start, `scripts/`, `.env.example`, Abhängigkeiten).

### 2026-09-27 13:05 – [ERLEDIGT] Schritt 4.1 Qualitäts-Härtung

- **Coverage:** Python 381 Tests, 99,78 % (Zeilen und Zweige); `canon` 100 %, `context` 100 % (kritische Pfade ≥ 90 %). Oberfläche 96 Komponenten-Tests, 98,65 % Zeilen, 96,43 % Zweige; 8 End-to-End-Tests grün. Verbleibende Teilzweige in `ai_gateway`, `api` (6) sind Absicherungen ohne erreichbaren Normalfall (z. B. Anbieter ohne `aclose`) – bewusst nicht gezielt getestet.
- **Randfälle:** Abbruch, Ablehnung, zu großer Kontext und zu großes Kapitel für die Kurzfassung waren schon abgedeckt; neu: Weiterschreiben mit leerem Kanon und leerem Kapitel, sehr langes Kapitel (siehe `[GELÖST]`).
- **Aufteilung (ADR-024):** `StoryPage.tsx` 757 Zeilen → `StoryPage` 104, `Guests` 144, `WritingMode` 103, `Facts` 67, `StorySummary` 56, `ChapterSummary` 80, `ChapterEditor` 226; `SceneForm` (73) aus `WritingPanel.tsx` (jetzt 372) gelöst. Tests unverändert grün, Coverage gleich; danach Lücke „Figur abwählen“ in `SceneForm` (50 % Zweige) und `WritingMode` mit Tests geschlossen.
- DoD: ruff, mypy, bandit, eslint, prettier, tsc grün; pip-audit und `npm audit` ohne Befund; Pre-Commit bei jedem Commit aktiv.

### 2026-09-27 13:00 – [BEOBACHTUNG] Tempo von `storage` im Referenzumfang

- 60 Kapitel × 40.000 Zeichen (ca. 727.000 Token) plus 500 Kanon-Einträge: Kapitel speichern 48 ms, alle Kapitel lesen 50 ms, Kontext bauen 161 ms, Volltextsuche 1,7 ms, Index neu aufbauen 257 ms (Median aus 7 Läufen). Alles weit unter dem Anzeige-Ziel 1 s; kein Handlungsbedarf. Protokoll: `spikes/storage-tempo/README.md`; auf dem VPS aus 4.2 wiederholbar.

### 2026-09-27 12:58 – [GELÖST] Langes Kapitel ohne Leerzeilen – KI bekam kein Manuskript

- **Symptom:** Probe mit 3.000 Zeilen (518.000 Zeichen), nur durch einfache Zeilenumbrüche getrennt: die Anfrage enthielt keine einzige Manuskriptseite, ohne Meldung. Mit Leerzeilen dazwischen gingen ca. 26.000 Token mit.
- **Ursache:** `_last_pages` nimmt ganze Absätze von hinten (Trennung `\n\n`) und bricht ab, sobald einer nicht passt – ist schon der letzte Absatz zu groß, bleibt nichts.
- **Lösung:** Passt schon der letzte Absatz nicht, geht sein Ende ab einer Wortgrenze mit vorangestelltem „…“ ein (Muster wie `_opening`); Zeilenumbrüche bleiben erhalten; ganze Absätze bleiben der Normalfall. Tests scheitern ohne die Korrektur (geprüft). Architektur Abschnitt 3 (`context`) ergänzt; keine Schnittstellenänderung.

### 2026-09-27 12:57 – [BEOBACHTUNG] Playwright ohne passenden Browser (bekannt)

- End-to-End-Tests zuerst rot („Executable doesn't exist … chromium_headless_shell-1234“); mit `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium` grün. Steht im Runbook (Troubleshooting); dritte Session in Folge – Kandidat für `scripts/session-start.sh`, aber das wäre eine neue ENV-Voraussetzung im Skript und damit nicht im Autonomiebereich. Nur beobachtet.

### 2026-09-27 12:48 – [SESSIONSTART] Schritt 4.1

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 12:48) → Entscheidungs-Klasse. Empfohlene Klasse für 4.1 ist Routine; deren Probelauf ist offen, deshalb übernimmt die Entscheidungs-Klasse (`docs/project-context.md` Abschnitt 6) – keine Warnung nötig, keine Abgabe möglich.
- **Kontextgröße:** 0 Token laut Sitzungsabfrage (neue Session; Wert zu Beginn nicht aktualisiert). Kurzzeitlimit (5 Stunden) `allowed`.
- PR #18 gemergt (`fdd9822`); Branch `claude/neue-session-4-1-vydo3a` steht auf `main`.
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2 (project-context, Logbuch ab letztem Sessionende, Fahrplan Stand und Phase 4, Architektur 1/2/9, Decisions A/C, aktive Blocker: keine).
- **Verfeinerung Phase 4:** Schritte 4.1–4.8 sind mit Eingabe, Zu tun und Akzeptanzkriterien ausgearbeitet; keine Änderung am Schrittplan nötig.
- **Vorhaben:** Schritt 4.1 Qualitäts-Härtung – Coverage-Nachweis, Randfall-Tests, Tempo-Messung `storage`, Aufteilung `StoryPage.tsx`.

### 2026-09-27 12:42 – [SESSIONENDE] Phase 3 abgeschlossen

- **Dauer:** 12:18–12:42 UTC.
- **Bearbeitet:** Phasenabschluss 3 – Bewertung durch getrennte Instanz (Sonnet 5), Stellungnahme, `ENTSCHEIDUNG ERFORDERLICH`, ADR-024 (weiterbauen; Aufteilung `StoryPage.tsx` in 4.1; Kanon-Treue in 4.8); Vision-Re-Derivations-Pass; Onboarding-Re-Validation; Archivierung Fahrplan Phase 3 und Logbuch-Verdichtung (Phasenabschluss-2-Einträge ins Phase-2-Archiv nachgetragen).
- **Vision-Abgleich (Befund):** Jedes Vision-Element hat eine Schritt-ID oder Descope-ADR; zwei Befunde behoben: 5.5 um V.4/V.5 ergänzt; Kanon-Treue beim Schreiben des Eigentümers mit Landeplatz 4.8 (ADR-024). Muss-Anforderungen: offen nur FR-022 (4.8) und FR-010 Referenzumfang (D.4).
- **Erreichter Stand:** Phase 4 „Stabilisierung und erstes öffentliches Deployment“ bereit; kein aktiver Schritt.
- **Offen:** Pull Request für diesen Branch (Merge nach grüner CI und Zustimmung des Eigentümers).
- **Nächster Schritt:** neue Session – Phase 4 verfeinern, dann 4.1 Qualitäts-Härtung.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 12:40). Schritte oberhalb der Empfehlung: 0 (Phasenabschluss verlangt Entscheidung). Abgegeben: Bewertung an Unteragenten mit Sonnet 5 (getrennte Instanz, keine Routine-Abgabe).
- **Kontextgröße:** 203.795 Token laut Sitzungsabfrage 12:40 – knapp über der Grenze 200.000 nach dem Phasenabschluss; kein neuer Schritt in dieser Session. Sitzungskosten laut Abfrage ca. 4,23 $. Kurzzeitlimit `allowed`.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Architektur-Reife, Nächste Schritte); project-context Status auf Phase 4; Runbook „Geprüft am“ aktualisiert. Drift-Prüfung: Schritt-Referenzen der ADRs existieren (1.x–3.x im Archiv, 4.6, D.4); ADR-024 → 4.1, 4.8 vorhanden; Modul-Liste unverändert; Reifegrad Kanon-Treue ↔ ADR-024 passt; Reaktiv-Quote 1/10 über ADR-015..024; Phase 4 unverändert 8 Schritte; Blocker 0; Anforderungen unverändert. Ablaufdaten-Register: kein Vorlauf erreicht (Guthaben-Vorlauf ab 2026-10-22). Archivierung: Fahrplan Phase 3 → `docs/archiv/fahrplan-phase-3.md`, Logbuch Phase 3 → `docs/archiv/logbuch-phase-3.md`; Abschnitte „Iterations-Reflexion“ und „Archiv“ im Fahrplan nachgezogen (standen noch auf Phase 1). project-context 338 Zeilen.

### 2026-09-27 12:39 – [PHASEN-WECHSEL] Reflexion Phase 3 (UMSETZUNG) → Phase 4 (STABILISIERUNG)

- **Gelernt:** Abnahme je Schritt mit echten Läufen und blinder Bewertung trägt – billig (unter 2 $ für die ganze Phase) und findet, was Tests nicht zeigen (Figuren-Schreibweise, Kurzfassungen, Gäste).
- **Gelernt:** Die Figuren-Schreibweise war die größte Schwäche: 20 Verstöße in 15 Texten (3.3) → 0 eindeutige nach geschärfter Regel plus Erinnerung nach der Anweisung (3.4).
- **Gelernt:** Kapitel-Kurzfassungen tragen den Handlungsstand: 3 von 3 Fortsetzungen richtig mit, 0 von 3 ohne (3.6).
- **Gelernt:** Lücken vor Beginn eines Schritts per Frage-System vom Eigentümer entscheiden lassen – keine Rate-Implementierung in der Phase.
- **Kippende Annahmen:** Reaktionszeit verfehlt (grok-4.7 einmal 77 s, grok-4.6 13–16 s; ADR-022, D.6); Kurzfassungen länger als vorgegeben (D.4); 3.7 und 3.8 berührten weniger Module als geplant (`manuscript` unverändert).
- **Reifegrad:** `context`, `ai_gateway`, SSE durch Umsetzung validiert; Metriken `[BELASTBAR]` (ADR-023); Reaktionszeit zurück auf `[VORLÄUFIG]` (ADR-022); Kanon-Treue `[VORLÄUFIG]` bis 4.8 (ADR-024).
- **ADRs der Phase:** 021–024; reaktiv 0; Quote 1/10 (ADR-015..024).
- **Neue Erkundungsbedarfe:** D.6 vor 4.8; D.4 (Referenzumfang, Kurzfassungslänge). Beobachten: Größe der Oberflächen-Dateien (Aufteilung in 4.1, ADR-024), Wachstum von `spikes/`.
- **Methodik-Lehren:** Sessions liefen wieder weit über die Kontextgrenze (bis ca. 360.000 Token) auf ausdrückliche Anweisung; Phasenabschluss erneut in eigener Session. Regelverstoß `git push -f` ohne Stopp (3.4, kein Schaden) – künftig nur nach Freigabe. Playwright: Auswahlfelder über ihre Rolle ansprechen. ruff RUF001/RUF002: kein Gedankenstrich in Python-Strings und Docstrings.
- **Details:** [`docs/archiv/logbuch-phase-3.md`](archiv/logbuch-phase-3.md)

### 2026-09-27 12:38 – [ADR-ANGELEGT] ADR-024

- Pflichtfrage Phasenende 3: Eigentümer wählt Empfehlung A – weiterbauen; `StoryPage.tsx` (und bei Bedarf `WritingPanel.tsx`) in 4.1 aufteilen; Kanon-Treue beim echten Schreiben des Eigentümers in 4.8 messen (Frage-System). `[STRATEGISCH]`; Bewertung der getrennten Instanz (Sonnet 5) und Stellungnahme im ADR nebeneinander. Die in ADR-020 verlangte erneute Prüfung von `api` auf Heuristik 1.4 ist erfolgt: kein Gott-Modul.
- Befund 2 des Vision-Abgleichs damit aufgelöst: 4.8 ist Landeplatz für die Beförderung von NFR Kanon-Treue.

### 2026-09-27 12:24 – [BEOBACHTUNG] Vision-Re-Derivations-Pass Phasenende 3

- **Quelle:** `docs/vision.md` vollständig, `docs/requirements.md` Abschnitte 3 und 5, Fahrplan Phasen 4, 5 und Querschnitt.
- **Ergebnis:** Kernidee, fünf Szenarien, sechs Erfolgskriterien, Abgrenzungen, harte Randbedingungen und weiche Präferenzen haben je eine Schritt-ID oder eine Descope-ADR. Muss-Anforderungen: 15 erledigt, FR-010 teilweise (Referenzumfang D.4), FR-022 offen (4.8), FR-006 verworfen (ADR-009). Soll/Kann: FR-014 → 5.1, FR-019 → 5.2, FR-020 → 5.3, FR-023 → 5.4, FR-021 erledigt. Anwendungsfälle UC-001 bis UC-014 alle enthalten; Ausschlüsse unverändert. Keine `[VERSCHOBEN]`-Zeile mit Ziel in Phase 3. Keine `TODO`/`FIXME` in `src/`, `ui/src/`, `tests/`.
- **Befund 1 (Drift):** V.4 und V.5 nennen 5.5 als Landeplatz, 5.5 führt unter „Zu tun“ und „Akzeptanzkriterien“ aber nur V.1–V.3 → 5.5 um V.4 und V.5 ergänzen.
- **Befund 2 (Landeplatz fehlt):** Erfolgskriterium „höchstens ein Kanon-Widerspruch pro Kapitel, der beim Redigieren auffällt“ (Vision 4) ist nur im Probeschreiben der KI gemessen (3.3, blind bewertet); die Reifegrad-Übersicht führt NFR Kanon-Treue `[VORLÄUFIG]` mit „wartet auf Schreibbetrieb des Eigentümers“ – ohne Schritt-ID. Vorschlag an den Eigentümer mit der Pflichtfrage.

### 2026-09-27 12:21 – [ONBOARDING-VALIDATION] Phasenabschluss 3 (Trigger 3)

- **Form (Klasse M):** frischer Worktree von `c0325f4` im Scratchpad, eigenes Datenverzeichnis; README-Quick-Start exakt wie dokumentiert: `uv python install 3.14.7`, `uv sync --frozen --python 3.14.7`, `npm ci` (0 Schwachstellen), `uv run pre-commit install`, `uv run skriptorium-einrichtung` (Exit 0; Ausgabe mit dem Einrichtungscode nicht angezeigt), `npx vite build`, uvicorn.
- **Ergebnis:** `/api/health` → `{"status":"ok"}`; `/` → 200; `/api/worlds` und `/api/usage` ohne Sitzung → 401; Server-Log nur mit Metadaten, ohne Warnung. `pytest --cov`: 377 bestanden, 99,78 %; `vitest --coverage`: 96 bestanden, 98,17 % Zeilen, 96,01 % Zweige. Smoke-Test `scripts/session-start.sh` im Worktree: Exit 0.
- **Befund:** keiner im Onboarding-Pfad. Pre-Commit-Hook nach dem Entfernen des Worktrees im Haupt-Checkout neu installiert (Runbook-Pflicht). End-to-End-Tests nicht im Worktree wiederholt (CI-Job End-to-End).

### 2026-09-27 12:20 – [SESSIONSTART] Phasenabschluss 3

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 12:20) → Entscheidungs-Klasse. Der Phasenabschluss enthält einen `ENTSCHEIDUNG ERFORDERLICH`-Block (Eskalations-Auslöser 1) – Klasse passt, kein Stopp.
- **Kontextgröße:** 0 Token laut Sitzungsabfrage (neue Session; Wert bei Sessionbeginn nicht aktualisiert). Kurzzeitlimit (5 Stunden) `allowed`.
- PR #17 gemergt (`c0325f4`); Branch `claude/phasenabschluss-3-mi6vna` steht auf `main`.
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2 (project-context, Logbuch ab letztem Sessionende, Fahrplan Stand und Phase 3, Architektur 1/2/9, Decisions A/C, aktive Blocker: keine).
- **Vorhaben:** Pflichtfrage „Weiterbauen, umbauen oder neu aufsetzen“ mit getrennter Instanz (inkl. erneuter Prüfung `api` auf Heuristik 1.4, ADR-020); Vision-Re-Derivations-Pass gegen `docs/vision.md` und `docs/requirements.md`; Onboarding-Re-Validation (Trigger 3); nach der Entscheidung ADR, Archivierung von Phase 3, Logbuch-Verdichtung.

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
