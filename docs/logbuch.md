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

### 2026-09-26 21:05 – [ONBOARDING-VALIDATION] Phasenabschluss 2 (Trigger 3)

- **Form (Klasse M):** frischer Worktree von `646ddfe` im Scratchpad, eigenes Datenverzeichnis; README-Quick-Start exakt wie dokumentiert: `uv python install 3.14.7`, `uv sync --frozen`, `npm ci` (0 Schwachstellen), `pre-commit install`, `skriptorium-einrichtung` (Exit 0; Ausgabe mit dem Einrichtungscode nicht angezeigt), `npx vite build`, uvicorn.
- **Ergebnis:** `/api/health` → `{"status":"ok"}`; `/` → 200 (Oberfläche); `/api/worlds` ohne Sitzung → 401; Server-Log ohne Warnung. `pytest --cov`: 224 bestanden, 99,94 %; `vitest --coverage`: 32 bestanden, 99,02 % Zeilen. Smoke-Test `scripts/session-start.sh` im Worktree: Exit 0.
- **Befund:** keiner im Onboarding-Pfad. End-to-End-Tests nicht im Worktree wiederholt (laufen im CI-Job End-to-End). Nebenbefund: `data/index.sqlite` liegt im Git-Index, obwohl `/data/` ignoriert ist (leerer Index, seit `53071f0`) – Behandlung nach der Bewertung der getrennten Instanz.

### 2026-09-26 20:57 – [SESSIONSTART] Phasenabschluss 2

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 20:57) → Entscheidungs-Klasse. Der Phasenabschluss enthält einen `ENTSCHEIDUNG ERFORDERLICH`-Block (Eskalations-Auslöser 1) – Klasse passt, kein Stopp.
- **Kontextgröße:** 0 Token laut Sitzungsabfrage (neue Session). Wochenlimit `allowed_warning`, Zurücksetzung 2026-09-27 10:00 MESZ.
- PR #7 gemergt (`646ddfe`); Branch `scp/affectionate-euler-piciei` steht auf `main`.
- **Vorhaben:** Pflichtfrage „Weiterbauen, umbauen oder neu aufsetzen“ mit getrennter Instanz; Vision-Re-Derivations-Pass gegen `docs/vision.md` und `docs/requirements.md`; Onboarding-Re-Validation (Trigger 3); nach der Entscheidung ADR, Archivierung von Phase 2, Logbuch-Verdichtung.

### 2026-09-26 20:52 – [SESSIONENDE] Schritt 2.7 erledigt, Phasenabschluss 2 offen

- **Dauer:** Fortsetzung 20:10–20:52 UTC (Gesamtsession ab 19:20).
- **Bearbeitet:** 2.7 `[ERLEDIGT]` mit ADR-019 (Test-Werkzeuge; Nachträge MIT-0/CC0-1.0 nur für Werkzeuge, `@types/node`); Sicherheitsprüfung durch getrennte Instanz, Befund 1 behoben, optionale Härtungen nach Wahl des Eigentümers umgesetzt.
- **Erreichter Stand:** Alle Schritte von Phase 2 erledigt. 224 Python-Tests, 32 Komponenten-Tests, 4 End-to-End-Tests; Onboarding gegen frischen Worktree validiert (vor den letzten Härtungen; Quick Start seitdem unverändert).
- **Offen:** Pull Request für 2.7 – Merge nach grüner CI (inkl. neuem Job End-to-End) und Zustimmung des Eigentümers. Phasenabschluss 2.
- **Nächster Schritt:** neue Session – Phasenabschluss 2: getrennte Instanz bewertet „weiterbauen / gezielt umbauen / neu aufsetzen“, Stellungnahme, `ENTSCHEIDUNG ERFORDERLICH`, ADR; Vision-Re-Derivations-Pass gegen `docs/vision.md` und `docs/requirements.md`; Onboarding-Re-Validation (Trigger 3); danach Archivierung von Phase 2 und Logbuch-Verdichtung. Der Archivierungs-Trigger „Phase vollständig erledigt“ wird damit bewusst bis zum formalen Phasenabschluss verschoben – Landeplatz: dieser nächste Schritt.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 20:51). Schritte oberhalb der Empfehlung: 1 (2.7 empfiehlt Routine; Hinweis vorab). Abgegebene Teilarbeiten: Sicherheitsprüfung an Unteragenten mit Sonnet 5 (getrennte Instanz, keine Routine-Abgabe).
- **Kontextgröße:** 499.835 Token laut Sitzungsabfrage – über der Grenze 200.000 auf ausdrückliche Anweisung „weiter 2.7“. Sitzungskosten laut Abfrage ca. 23,11 $ (Gesamtsession). Wochenlimit `allowed_warning`, Zurücksetzung 2026-09-27 10:00 MESZ.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Quick Start, Verwendung, Nächste Schritte); Drift-Prüfung: ADR-019 → 2.7 vorhanden; Modul-Liste unverändert; Reifegrad `ui` passt zu ADR-019 und Umsetzung; Reaktiv-Quote 1/10 über ADR-010..019; Phase 2 weiterhin 7 Schritte; Blocker 0; Anforderungen FR-002/005/007/016 unverändert erledigt. Ablaufdaten-Register: jsdom 30 ergänzt, kein fälliger Vorlauf (Guthaben-Vorlauf ab 2026-10-22). Archivierung: Logbuch unter 800 Zeilen; Phasen-Archiv siehe „Nächster Schritt“. project-context unter 600 Zeilen.

### 2026-09-26 20:48 – [SICHERHEITSPRÜFUNG] Getrennte Instanz zu 2.7

- **Instanz:** Unteragent mit eigenem Kontext und anderem Modell (Claude Sonnet 5); nur Diff (Oberfläche, Tests, Konfiguration, CI), Bedrohungsmodell, ADR-017, ASVS-Originalkapitel. Führte Komponenten-, Build- und End-to-End-Tests selbst aus.
- **Befund 1 (niedrig):** Endet die Sitzung während der Arbeit, schlug Speichern nur mit einer Fehlzeile fehl → behoben in `aad8728` (Anmeldung über der offenen Ansicht, ungespeicherter Text bleibt; Test).
- **Hinweise 2–6:** 2 (erneute Anmeldung vor Sitzungsübersicht, ASVS 7.5.2) – Auslegungsfrage, ADR-017 behandelt die bestehende Sitzung als Faktor; keine Änderung. 3–5 über dem Niveau, vom Eigentümer als optional gewählt und umgesetzt: `base-uri 'none'`; ESLint-Regel auch für `innerHTML`, `outerHTML`, `insertAdjacentHTML` (mit Probedatei belegt, 2 Treffer); E2E-Testpasswort über die Umgebung. `frame-ancestors` nur per HTTP-Kopf → Notiz in 4.2. 6 (Chromium-Download im CI-Job) – zur Kenntnis, offizielle Quelle, keine neuen Rechte.
- Keine Befunde zu XSS, Passwortfeldern (6.2.6, 6.2.7), Speicherung von Zugangsdaten im Browser, Cookie-Zugriff aus JavaScript, Abmelden auf jeder Seite (7.4.4), fremden Anfragen.

### 2026-09-26 20:50 – [REIFEGRAD-WECHSEL] ui durch Umsetzung validiert

- Schritt 2.7 erledigt; `ui` bleibt `[BELASTBAR]`, jetzt „durch Umsetzung validiert“. Kommunikation HTTP/JSON zwischen `ui` und `api` durch End-to-End-Tests belegt.
- Alle Schritte von Phase 2 erledigt; der Phasenabschluss (Vision-Abgleich, Pflichtfrage mit getrennter Instanz, ADR, Archivierung, Logbuch-Verdichtung) folgt in einer neuen Session – bewusst nicht hier, weil die Session weit über der Kontextgrenze liegt und die Bewertung eine eigene Instanz verlangt.
- **Klasse:** 2.7 empfiehlt Routine, lief auf Entscheidung (Hinweis an den Eigentümer vorab).

### 2026-09-26 20:42 – [PROBLEM-GELÖST] Reibungen in 2.7

- **Bündelgröße:** Das erste Bündel war 706 kB (Vite-Warnung, Quelle ohne Schalter). Ursache: `@codemirror/lang-markdown` bringt HTML-, CSS- und JavaScript-Hervorhebung mit. Lösung: Editor per `lazy()` nachladen – Hauptbündel 213 kB, Editor 493 kB, keine Warnung.
- **CSP-Probe mit `eval`:** `page.evaluate` läuft über die DevTools-Schnittstelle, für die das eval-Verbot nicht greift; die Probe meldete fälschlich „erlaubt“. Ersetzt durch ein eingeschleustes Inline-Skript: läuft nicht, der Browser meldet `script-src-elem`.
- **ESLint `react-hooks/set-state-in-effect`** auch für eine async-Funktion mit `setState` nach `await` → Sitzungsprüfung als Promise mit Callbacks.
- **`FormEvent` ist in @types/react 19.2 abgekündigt** → `SyntheticEvent`.
- **Playwright 1.62 und vorinstalliertes Chromium (Revision 1194 statt 1234):** lokal über `PLAYWRIGHT_CHROMIUM_EXECUTABLE`; Runbook-Troubleshooting ergänzt.
- **Nachträge mit Freigabe:** Lizenzen MIT-0 und CC0-1.0 nur für Werkzeuge; `@types/node` 24.19.0 für die Typprüfung der E2E-Dateien (beide ADR-019).

### 2026-09-26 20:20 – [ADR-ANGELEGT] ADR-019

- Test-Werkzeuge der Oberfläche: jsdom 29.1.1, Testing Library, Playwright 1.62.1; neuer CI-Job End-to-End. Freigabe des Eigentümers per Antwortsystem (Option A). `[OPERATIV]`; Reaktiv-Quote 1/10.

### 2026-09-26 20:10 – [SESSIONSTART] Fortsetzung mit 2.7 auf Anweisung „weiter 2.7“

- **Abweichung:** Sessiongröße 379.453 Token über der Grenze 200.000; der Eigentümer hat ausdrücklich „weiter 2.7“ angeordnet (`CLAUDE.md` Abschnitt 0, Ausnahme „weiter hier“).
- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 20:04) → Entscheidungs-Klasse; 2.7 empfiehlt Routine – Hinweis an den Eigentümer vorab (Wochenkontingent im Warnbereich); keine Abgabe ohne Probelauf.
- PR #6 gemergt (`a5e1f8f`); Branch `claude/neue-session-2-6-tt13wa` neu von `main` aufgesetzt.

### 2026-09-26 20:05 – [SESSIONENDE] Schritt 2.6 erledigt

- **Dauer:** 19:20–20:05 UTC.
- **Bearbeitet:** 2.6 `[ERLEDIGT]` mit ADR-017 (`[OPERATIV]`) und ADR-018 (`[REAKTIV]`); Freigaben des Eigentümers: nur Passwort, selbst gewählt mit Pwned Passwords, Sitzungen 7/30 Tage, Anmelde-Protokoll; Befund 4 (Anfragegröße) nicht nötig.
- **Erreichter Stand:** angemeldete HTTP-Schnittstelle über `canon` und `manuscript`; Sicherheitsprüfung durch getrennte Instanz mit zwei Nachprüfungen ohne offenen Befund; 224 Tests, Coverage 99 %; CI-Lauf 68 grün, weitere Läufe auf dem PR.
- **Offen:** Merge von PR #6 nach grüner CI (vom Eigentümer so gewählt: erst nach der Prüfung).
- **Nächster Schritt:** neue Session – 2.7 (ui) inklusive Anmeldung, Einrichtung, Passwortwechsel mit Namensnennung Have I Been Pwned, Sitzungsübersicht und CSP.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 20:04). Schritte oberhalb der Empfehlung: 0. Abgegebene Teilarbeiten: Sicherheitsprüfung an einen Unteragenten mit Sonnet 5 (Zweck: getrennte Instanz, keine Routine-Abgabe; Ergebnis vor Übernahme geprüft).
- **Kontextgröße:** 379.453 Token laut Sitzungsabfrage – Grenze 200.000 überschritten während 2.6; kein neuer Schritt begonnen, der laufende Schritt wurde nach der Regel zu Ende geführt. Sitzungskosten laut Abfrage ca. 14,61 $. Wochenlimit `allowed_warning`, Zurücksetzung 2026-09-27 10:00 MESZ.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Quick Start, Nächste Schritte); Drift-Prüfung: ADR-017/018 → 2.6 (und 2.7-Notiz) vorhanden; Modul-Liste unverändert (`api.access` ist Untermodul); Reifegrad `api` passt zu ADR-017/018; Reaktiv-Quote 1/10 = Anzahl `[REAKTIV]` in ADR-009..018; Phase 2 weiterhin 7 Schritte; Blocker 0; Anforderungen: 2.6 ohne FR. Ablaufdaten-Register: kein fälliger Vorlauf (Guthaben-Vorlauf ab 2026-10-22). Archivierung: kein Trigger (Logbuch unter 800 Zeilen). project-context 337 Zeilen.

### 2026-09-26 20:03 – [REIFEGRAD-WECHSEL] api durch Umsetzung validiert

- Schritt 2.6 erledigt. Zweite Nachprüfung der getrennten Instanz: Befunde 1, 2, 9 belegt behoben (u. a. 15 parallele korrekte Anmeldungen → 15 × 204; 25 parallele Fehlversuche → 10 × 401, 15 × 429; Lock-Tabelle bleibt bei 500 Adressen leer), keine neuen Befunde. Hinweis der Instanz: Die Serialisierung je Adresse ist nur so gut wie die Adressermittlung (Befund 3, Vorgabe in 4.2).
- `api` bleibt `[BELASTBAR]`, jetzt „durch Umsetzung validiert"; 224 Tests gesamt (74 in `tests/api`), Coverage 99 %.
- **Klasse:** 2.6 empfiehlt Entscheidung, lief auf Entscheidung.

### 2026-09-26 19:58 – [SICHERHEITSPRÜFUNG] Getrennte Instanz zu 2.6

- **Instanz:** Unteragent mit eigenem Kontext und anderem Modell (Claude Sonnet 5); erhielt nur Diff, Bedrohungsmodell, ADR-017/018 und die ASVS-Originalkapitel, nicht den Gesprächsverlauf. Prüfte mit eigenen Probeskripten gegen den echten Code.
- **Befund 1 (hoch, belegt):** Sperre nach Fehlversuchen per Parallelität umgehbar (25 parallele Fehlversuche, keiner gesperrt) → behoben in `28783bd`, endgültig in `6b7044f`.
- **Befund 2 (mittel, belegt):** Einrichtungscode bei gleichzeitiger Nutzung zweimal wirksam → behoben in `28783bd` (Sperre um Lesen-Ändern-Schreiben).
- **Befund 3 (hoch, Konfiguration):** Proxy-Kopfzeilen. uvicorn 0.52 wertet sie standardmäßig nur von `127.0.0.1` aus; als Betriebsvorgabe festgehalten (project-context Abschnitt 8, Runbook, Notiz in 4.2).
- **Befund 4 (niedrig, über dem Niveau):** keine Größengrenze für Anfragen – dem Eigentümer als optional vorgelegt; Entscheidung: nicht nötig (Verfügbarkeit nachrangig laut Bedrohungsmodell).
- **Befunde 5, 7 (Hinweise):** genau ein Prozess; `Host`-Kopf unverändert durch den Proxy – festgehalten wie Befund 3. **Befund 6, 8:** kein Handlungsbedarf (8: `except A, B:` ist gültige Syntax ab Python 3.14, PEP 758).
- **Nachprüfung 1:** Befunde 1 und 2 behoben (Probeskripte: 10 × 401, 15 × 429; ein Code wirkt einmal). Neuer **Befund 9 (mittel, belegt):** mehr als 10 gleichzeitige korrekte Anmeldungen eines Absenders bekamen 429 – Folge der Reservierung vor der Prüfung. Behoben in `6b7044f`: Versuche je Adresse laufen nacheinander, nur echte Fehlversuche zählen. Hinweis 10 (Zeitstempel als Kennung) entfällt damit.
- **Reibung:** `ss` fehlt in der Umgebung; die Meldung „server beendet" im Probelauf 19:39 war deshalb falsch – zwei Testserver liefen weiter und wurden um 19:50 per `kill` beendet.

### 2026-09-26 19:45 – [PROBLEM-GELÖST] Reibungen in 2.6

- **FastAPI 0.141 hält eingebundene Router als `_IncludedRouter`:** `app.routes` enthält nur noch die direkt angelegten Routen. Das Routenmuster für das Protokoll kommt deshalb aus `scope["route"]` nach der Verarbeitung; der Test „jeder Endpunkt verlangt eine Sitzung" zählt die Routen über `app.openapi()` (die Beschreibung wird trotzdem nicht veröffentlicht).
- **INFO-Zeilen fehlten unter uvicorn:** uvicorn richtet nur die eigenen Logger ein, erfolgreiche Anmeldungen und das Anfrage-Protokoll gingen verloren (Probelauf gegen echten Server). Lösung: `create_app` gibt dem Logger `skriptorium` einmalig einen Handler mit Stufe INFO.
- **uvicorn-Zugriffsprotokoll schreibt volle Pfade** (mit Namen von Welten und Einträgen) → Startbefehl mit `--no-access-log`; das eigene Protokoll nennt nur das Routenmuster.
- **Kontextwörter:** Der Weltname „Die Salzmark" hätte als ganze Zeichenkette ein Passwort mit „Salzmark" durchgelassen – Namen werden jetzt zusätzlich in Wörter ab 4 Zeichen zerlegt (vom ersten Testlauf gefunden).
- **Beobachtung ohne Änderung:** Der Docstring von `ManuscriptService.save_chapter` nennt `InvalidInput` für eine Nummer, die weder existiert noch die nächste ist; tatsächlich kommt `NotFound` (404). Außerhalb des Schritts 2.6 nicht geändert; Test auf 404.
- **`# noqa: S105`** für die zwei Test-Passwörter in `tests/api` je Zeile mit Begründung statt einer Datei-Ausnahme.

### 2026-09-26 19:30 – [ADR-ANGELEGT] ADR-017 und ADR-018

- ADR-017 `[OPERATIV]`: Anmeldung und Sitzung – nur Passwort (begründete Abweichung von ASVS 6.3.3), selbst gewählt mit Pwned-Passwords-Prüfung (Empfehlung der KI war: vom Server erzeugt), Sitzungen 7/30 Tage, Anmelde-Protokoll. Freigabe des Eigentümers per Antwortsystem.
- ADR-018 `[REAKTIV]`: Beziehungen `api → storage` (nur `system/`) und `api → Pwned Passwords`. Reaktiv-Quote 1/10 (Schwelle 30 %).

### 2026-09-26 19:25 – [BEOBACHTUNG] 2.6 vorbereitet – ASVS 5.0.0 im Original geprüft

- Quelle: OWASP/ASVS, Tag `v5.0.0`, Kapitel V6, V7, V11, V3, V16 und Anhang C (raw.githubusercontent.com, abgerufen 2026-09-26).
- **Befund:** ASVS 6.3.3 (Stufe 2) verlangt Mehr-Faktor-Anmeldung oder eine vollständig begründete Abweichung mit ausgleichenden Maßnahmen. Fahrplan 2.6 und ADR-006 sahen nur „Passwort und Sitzungs-Cookie" vor – die Lücke war bisher nicht benannt.
- **Befund:** Stufe 1 verlangt, dass der Nutzer sein Passwort ändern kann (6.2.2, 6.2.3); ein Passwort-Hash in einer Umgebungsvariablen (Architektur Abschnitt 6, project-context Abschnitt 6) lässt das aus der Oberfläche nicht zu. Ein Ablageort im Datenverzeichnis braucht eine Beziehung `api → storage`, die die Modul-Karte nicht enthält.
- **Befund:** Stufe 2 verlangt Sitzungsübersicht mit Beenden (7.5.2), dokumentierte Inaktivitäts- und Höchstdauer (7.1.1, 7.3.1, 7.3.2) und eine Regel für parallele Sitzungen (7.1.2) – neue Endpunkt-Gruppen über den Grobvertrag der HTTP-API hinaus.
- **Befund:** scrypt aus der Python-Standardbibliothek (N = 2^17, r = 8, p = 1) ist nach Anhang C zulässig – keine neue Abhängigkeit für das Passwort-Hashing nötig. OpenSSL 3.5.8 in der Laufzeit.

### 2026-09-26 19:20 – [SESSIONSTART] Schritt 2.6

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage `get_session`, 19:20 UTC) → Entscheidungs-Klasse; entspricht der Empfehlung für 2.6.
- **Kontingent:** Wochenlimit Status `allowed_warning`, Zurücksetzung 2026-09-27 10:00 MESZ laut Sitzungsabfrage. Kontextgröße laut Abfrage 0 (Wert zu Sessionbeginn noch nicht befüllt).
- **Mindest-Lektüre:** project-context vollständig; Logbuch ab letztem `[SESSIONENDE]`; Fahrplan „Aktueller Stand" und Phase 2; Architektur 1, 2, 9; Decisions Teil A und C; Blocker aktiv (keine). Branch `claude/neue-session-2-6-tt13wa` von `main` (`70627fa`, PR #5 gemergt).
- **Plan:** 2.6 mit `ENTSCHEIDUNG ERFORDERLICH` (Authentifizierung und Sitzung, Kategorie 6; Passwort-Hashing ggf. Kategorie 3) beginnen.

### 2026-09-26 20:15 – [SESSIONENDE] Schritte 2.2 bis 2.5 erledigt

- **Dauer:** Fortsetzung 18:30–20:15 UTC (Gesamtsession ab 17:00).
- **Bearbeitet:** 2.2 (ADR-016, PyYAML), 2.3, 2.4 (Aufteilungsregeln vom Eigentümer bestätigt), 2.5 – alle `[ERLEDIGT]`. FR-002 (bis auf Teilkriterium KI-Anfrage → 3.2), FR-005, FR-007, FR-016 erledigt.
- **Erreichter Stand:** `storage`, `canon` (mit Import) und `manuscript` durch Umsetzung validiert; 150 Tests, Coverage 100 % (Zeilen und Zweige). CI zu 2.2, 2.3, 2.4 grün (Läufe 61–63).
- **Offen:** nichts aus 2.2–2.5. Pull Request für 2.2–2.5 auf Wunsch des Eigentümers am Sessionende angelegt und gemergt, sobald die CI grün ist.
- **Nächster Schritt:** neue Session – 2.6 (api mit Anmeldung) mit `ENTSCHEIDUNG ERFORDERLICH` beginnen (Kategorie 6; danach Prüfung durch eine getrennte Instanz).
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 20:14). Schritte oberhalb der Empfehlung: 3 (2.3, 2.4, 2.5 empfehlen Routine; Hinweis an den Eigentümer jeweils vorab). Abgegebene Teilarbeiten: keine (ohne Probelauf nicht zulässig).
- **Kontextgröße:** 476.937 Token laut Sitzungsabfrage – Grenze 200.000 überschritten mit ausdrücklicher Anweisung des Eigentümers („hier weiter“, „weiter“). Sitzungskosten laut Abfrage ca. 17,38 $ für die Gesamtsession. Wochenlimit `allowed_warning`, Zurücksetzung 2026-09-27 10:00 MESZ.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Nächste Schritte); Drift-Prüfung: ADR-016 → 2.2 und 2.7 (Notiz) vorhanden; Modulnamen unverändert; Reifegrade in Abschnitt 9 passen zu ADR-013/015/016 und den Umsetzungs-Vermerken; Anforderungen FR-002/005/007/016 mit Schritt und Status; Reaktiv-Quote 0/10; Phase 2 weiterhin 7 Schritte; Blocker 0. Ablaufdaten-Register ohne fälligen Vorlauf (Guthaben-Vorlauf ab 2026-10-22). Archivierung: kein Trigger (Logbuch 185 Zeilen). project-context unter 600 Zeilen.

### 2026-09-26 20:05 – [REIFEGRAD-WECHSEL] manuscript durch Umsetzung validiert

- Schritt 2.5 erledigt: `ManuscriptService` mit Geschichten (Roman, Kurzgeschichte, Fragment), Kapiteln, Kurzfassungen, Gesamtzusammenfassung, Figuren-Schreibweise (Perspektive, geführte Figuren), Gast-Verbindungen und geschichtenbezogenen Fakten. FR-007 erledigt; FR-012, FR-017, FR-024 haben ihre Felder, Funktion folgt in Phase 3.
- **Auslegung im Datenmodell:** Kurzgeschichte und Fragment haben genau ein Kapitel (beim Anlegen erzeugt), weil das Datenmodell keine eigene Manuskript-Datei kennt. Verweise auf Kanon-Einträge und die Existenz der Welt prüft `api` (keine Abhängigkeit `manuscript` → `canon` in der Modul-Karte).
- **Verschiebung zwischen Modulen:** `slugify`/`checked_identifier` von `canon` nach `storage` (additive Erweiterung der `storage`-Exporte; `canon` nutzt sie von dort, Verhalten unverändert, alle Tests grün). Grund: `manuscript` braucht dieselbe Kennungsregel und darf `canon` nicht importieren.
- **Reibung:** Indexfehler beim Erkennen von Kapiteldateien (Pfad hat 6, nicht 7 Teile) – vom ersten Testlauf gefunden.
- **Klasse:** 2.5 empfiehlt Routine, lief auf Entscheidung.

### 2026-09-26 19:40 – [REIFEGRAD-WECHSEL] canon.importers durch Umsetzung validiert

- Schritt 2.4 erledigt: Markdown-Import mit Vorschau und bestätigter Übernahme. Aufteilungsregeln dem Eigentümer gezeigt und bestätigt (Antwortsystem): Überschriften → Einträge, Kategorie aus Gruppen-Überschrift oder Zeile `Kategorie:`, Aliasse aus `Aliasse:`/`Auch genannt:`; doppelte Namen überspringen und anzeigen (je Eintrag überschreibbar); Einleitung an die Weltbeschreibung anhängen.
- `canon.importers` (in ADR-012 `[VORLÄUFIG]`, mit ADR-013 im Modul `canon` `[BELASTBAR]`) jetzt durch Umsetzung validiert. Kategorie-Wörter in `canon.categories` ausgelagert (Refactoring innerhalb des Moduls).
- **Messung FR-005/FR-022:** 20 Seiten erfundenes Material (über 10.000 Wörter, 100 Einträge) übernimmt das Programm in 0,3 s. Das Risiko aus ADR-012 liegt damit allein bei der Zuordnung durch den Autor; gemessen in 4.8.
- **Klasse:** 2.4 empfiehlt Routine, lief auf Entscheidung.

### 2026-09-26 19:15 – [REIFEGRAD-WECHSEL] canon durch Umsetzung validiert

- Schritt 2.3 erledigt: `CanonService` (Welten, Kanon-Einträge aller sechs Kategorien, Suche per Namens-/Alias-Präfix). `canon` bleibt `[BELASTBAR]`, jetzt „durch Umsetzung validiert“; Signaturen in `docs/architecture.md` Abschnitt 4 ausformuliert. FR-002 (bis auf Teilkriterium KI-Anfrage → 3.2) und FR-016 erledigt.
- **Auslegung ohne Datenmodelländerung:** Die Zeitlinie wird wie in der Testwelt aus 1.1 als Eintrag der Kategorie `zeitlinie` geführt, dessen Text die Ereignisse in Reihenfolge auflistet – kein neues Kopffeld für eine Reihenfolge.
- **Festlegung im Rahmen des Grobvertrags:** Eintrags-Kennungen sind je Welt über alle Kategorien eindeutig (aus dem Namen gebildet); Kategoriewechsel verschiebt die Datei; unbekannte Kopffelder bleiben beim Ändern erhalten.
- **Klasse:** 2.3 empfiehlt Routine, lief auf Entscheidung (Hinweis an den Eigentümer vorab; keine Abgabe möglich ohne Probelauf).

### 2026-09-26 19:00 – [SESSIONSTART] Fortsetzung mit 2.3 auf Anweisung „weiter“

- Eigentümer hat nach 2.2 „weiter“ angeordnet; Sessiongröße weiter über der Grenze (Ausnahme „weiter hier“ gilt fort).

### 2026-09-26 18:55 – [REIFEGRAD-WECHSEL] storage durch Umsetzung validiert

- `storage` bleibt `[BELASTBAR]`, jetzt „durch Umsetzung validiert“ (Schritt 2.2); `DocumentStore`-Signaturen in `docs/architecture.md` Abschnitt 4 ausformuliert, ohne Operationen hinzuzufügen oder wegzulassen (`list` heißt `list_paths`, weil `list` als Methodenname den eingebauten Typ in Annotationen verdeckt – mypy-Fehler).

### 2026-09-26 18:50 – [PROBLEM-GELÖST] Reibungen in 2.2

- **bandit B506** meldet `yaml.load` auch mit einer Unterklasse von `SafeLoader`. Lösung ohne Unterdrückung: Lader direkt instanziieren (`get_single_data`, `dispose`) – gleiche Wirkung wie `yaml.load`.
- **Strenger Lader nachgeschärft:** Der sichere Lader von PyYAML macht aus `2026-09-26` ein Datum und kennt `!!binary`/`!!set`; Datumsangaben bleiben jetzt Text, andere Nicht-Grundwerte ergeben `InvalidInput`. `y`/`n` sind bei PyYAML keine Wahrheitswerte (Test angepasst).
- **Namensregel ruff N818** verlangt `…Error`-Suffix; die Fehlernamen sind im Schnittstellenvertrag festgelegt → Unterdrückung je Klasse mit Begründung.

### 2026-09-26 18:40 – [ADR-ANGELEGT] ADR-016

- YAML-Parser PyYAML 6.0.3 (Option A), Freigabe des Eigentümers per Antwortsystem. `[OPERATIV]`; Reaktiv-Quote 0/10.

### 2026-09-26 18:35 – [BEOBACHTUNG] 2.2 vorbereitet – YAML-Parser im Probelauf

- PyYAML 6.0.3 (`safe_load`) liest handgeschriebene Werte nach YAML 1.1: Alias `No` → `False`, `On` → `True`, `status: off` → `False`, `012` → `10`. ruamel.yaml 0.19.1 (YAML 1.2) liest sie als Text bzw. `12`, schreibt `No` aber ungequotet – ein YAML-1.1-Leser macht daraus wieder `False`. PyYAML `safe_dump` setzt mehrdeutige Werte in Anführungszeichen.
- ruamel.yaml erhält beim Zurückschreiben Kommentare und Reihenfolge; PyYAML verwirft Kommentare.
- Pflegestand: PyYAML letzte Version 2025-09-25, Linie 6 seit 2021; ruamel.yaml letzte Version 2026-01-02, ein Hauptentwickler, Quellen auf SourceForge. Typen: ruamel.yaml bringt eigene mit; PyYAML braucht `types-PyYAML` (Apache-2.0).

### 2026-09-26 18:30 – [SESSIONSTART] Fortsetzung auf Anweisung „hier weiter“

- **Abweichung:** Sessiongröße 227.497 Token über der Grenze 200.000; der Eigentümer hat ausdrücklich „hier weiter“ angeordnet (`CLAUDE.md` Abschnitt 0, Ausnahme).
- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 18:15) → Entscheidungs-Klasse; 2.2 empfiehlt Entscheidung.
- PR #4 gemergt; Branch `claude/neue-session-2-1-uupwbh` neu von `main` (`353aa61`) aufgesetzt.

### 2026-09-26 18:20 – [SESSIONENDE] Schritt 2.1 erledigt

- **Dauer:** 17:00–18:20 UTC.
- **Bearbeitet:** 2.1 `[ERLEDIGT]` (ADR-015 mit Nachtrag ShellCheck); neuer Querschnitt-Schritt D.5 (httpx2, mypy 2; Frist 2026-11-12); Zusatz in D.2 (vitest 5, typescript-eslint).
- **Erreichter Stand:** Projektgerüst mit `/api/health`, Oberflächen-Gerüst, alle Pflicht-Gates in Pre-Commit und CI scharf; CI-Lauf 56 grün (Pre-Commit, Python, TypeScript), Protokolle ohne Warnungen. Nebenbefund behoben: ruff 0.16 formatierte auch Python-Blöcke in Markdown – Markdown vom Formatter ausgenommen (wie `.prettierignore`).
- **Offen:** nichts aus 2.1. Branch `claude/neue-session-2-1-uupwbh` gepusht; Pull Request #4 danach vom Eigentümer angelegt und gemergt (Korrektur 18:35).
- **Nächster Schritt:** neue Session – 2.2 mit `ENTSCHEIDUNG ERFORDERLICH` zum YAML-Parser beginnen. Der SessionStart-Hook wirkt erst, wenn er auf `main` liegt.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 17:00 und 18:15). Schritte oberhalb der Empfehlung: 0 (2.1 empfiehlt Entscheidung). Abgegebene Teilarbeiten: keine (Routine-Klasse ohne Probelauf).
- **Kontextgröße:** 227.497 Token laut Sitzungsabfrage – Grenze 200.000 überschritten, daher kein neuer Schritt. Sitzungskosten laut Abfrage ca. 3,33 $. Wochenlimit weiter `allowed_warning`, Zurücksetzung 2026-09-27 10:00 MESZ.
- **Sessionende-Prüfungen:** README synchronisiert (Status, Quick Start, Nächste Schritte, Status-Badge); Drift-Prüfung: ADR-015 → 2.1, D.2, D.5 vorhanden; Modulnamen unverändert; Reifegrade unverändert (2.1 ohne Reifegrad-Wirkung); Reaktiv-Quote 0/10; Phase 2 weiterhin 7 Schritte (D.5 ist Querschnitt); Blocker 0. Ablaufdaten-Register: drei neue Einträge; Guthaben-Vorlauf ab 2026-10-22 noch nicht erreicht. Archivierung: kein Trigger (Logbuch unter 800 Zeilen). project-context unter 600 Zeilen.

### 2026-09-26 18:10 – [ONBOARDING-VALIDATION] Schritt 2.1

- Frischer `git worktree` von `f94bbb5`, Quick-Start-Befehle exakt nach README: `uv python install`, `uv sync --frozen`, `npm ci`, `pre-commit install`, Serverstart → `/api/health` antwortet `{"status":"ok"}`; pytest (1 Test, 100 %), Vitest (2 Tests, 100 %), `vite build`, pip-audit und `npm audit` ohne Befund.
- Einziger Befund: MD029 in `docs/research/versions-verifikation.md` (im Pflege-Checkout schon behoben, noch nicht committet) – Ursache: der erste Commit der Session lief ohne installierten Pre-Commit-Hook; genau diese Lücke schließt der SessionStart-Hook. Der CI-Lauf 54 auf diesem Commit war deshalb rot.
- SessionStart-Hook zweimal ausgeführt (Wiederholungslauf ca. 12 s), schreibt PATH und `UV_SYSTEM_CERTS` in die Sitzungsumgebung.

### 2026-09-26 18:05 – [PROBLEM-GELÖST] Reibungen bei der Umsetzung von 2.1

- **Hooks über Spikes und Vorlagen:** Der erste Lauf von `pre-commit run --all-files` formatierte Spike-Rohdaten (Modell-Ausgaben) und Vorlagen um; ruff ignoriert `extend-exclude` bei explizit übergebenen Dateien. Lösung: globales `exclude: ^(templates|spikes)/` in der Hook-Konfiguration und `force-exclude = true` für ruff; Änderungen zurückgesetzt.
- **Reihenfolge der Commits:** pre-commit verweigert Commits, solange `.pre-commit-config.yaml` ungestaged ist – Konfiguration zuerst committet.
- **shellcheck-py aus dem Git-Repository** ließ sich nicht bauen (lädt ShellCheck von GitHub, in der Umgebung gesperrt). Lösung: PyPI-Paket (Rad enthält das Programm) in der Entwicklungsgruppe, lokaler Hook. Wirkung durch absichtlich fehlerhaftes Probe-Skript belegt (SC2086 gemeldet).
- **Worktree überschreibt Hook:** `pre-commit install` im Validierungs-Worktree setzte den gemeinsamen Git-Hook auf dessen venv; nach Entfernen des Worktrees schlug der Commit fehl. Lösung: im Haupt-Checkout neu installieren; Eintrag im Runbook-Troubleshooting.

### 2026-09-26 17:50 – [ADR-ANGELEGT] ADR-015

- Freigabe des Eigentümers per Antwortsystem (alle Empfehlungen): Werkzeug-Versionen, Zusatz zu Regel-001 (Linien ohne Fehlerkorrektur-Version → neueste Version), CC-BY-4.0 und BlueOak-1.0.0 nur für Werkzeuge, benannte Warnungs-Ausnahme Starlette mit neuem Schritt D.5 (Frist 2026-11-12). Nachtrag: ShellCheck (Pflicht G) auf Rückfrage freigegeben. Klassifikation `[OPERATIV]`; Reaktiv-Quote 0/10.

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
