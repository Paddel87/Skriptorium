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
