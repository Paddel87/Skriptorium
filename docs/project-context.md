# Project Context – Skriptorium

<!-- Projektspezifischer Kontext. Wird zu Sessionbeginn als erste Datei gelesen.
     Dient als Entscheidungsgrundlage für alle autonomen Schritte der KI.
     Befüllt in Modus 2 (templates/projektstart.md Abschnitt 1.3), Klassen-Hypothese M.
     Recherchen liegen ausgelagert unter docs/research/ (CLAUDE.md Abschnitt 2, Größen-Budget). -->

<!-- ANCHOR:kerndaten -->
## 1. Kerndaten

- **Projektname:** Skriptorium
- **Kurzbeschreibung:** Schreibwerkstatt für einen einzelnen Autor: Mehrere eigene Welten dienen als verbindlicher Kanon, Autor und KI schreiben im Wechsel Prosa darin, ohne der jeweiligen Welt zu widersprechen.
- **Status:** In Entwicklung – Phase 2 (Projektgerüst seit 2026-09-26)
- **Version (SemVer):** v0.0.0 – noch keine lauffähige Version
- **Dokumentationssprache:** Deutsch
- **Codesprache (Kommentare, Variablennamen):** Englisch (Eigentümer, 2026-09-26); Fachbegriffe einheitlich: world, canon, canon entry, story, manuscript, guest character
- **Projekttyp:** Full-Stack (Web-App: Python-Server, TypeScript-Oberfläche)
- **Projektgrößen-Klasse:** M – bestätigt nach der Architektur (Modus 2 Schritt 4) vom Eigentümer am 2026-09-26, ADR-001

<!-- ANCHOR:zielgruppe-und-nutzungskontext -->
## 2. Zielgruppe und Nutzungskontext

- **Primäre Nutzer:** ein Autor (der Eigentümer), ohne Programmierkenntnisse; schreibt Romane, Kurzgeschichten und Fragmente in mehreren eigenen Welten.
- **Sekundäre Nutzer / Betreiber:** derselbe Eigentümer als Betreiber; technische Umsetzung und Pflege durch den Coding-Agent.
- **Erwartete Last:** ein gleichzeitiger Nutzer; wenige KI-Anfragen pro Minute während einer Schreibsitzung.
- **Nutzungsumgebung:** Browser auf Desktop und Smartphone (FR-019, Soll).

<!-- ANCHOR:technischer-stack -->
## 3. Technischer Stack

### Fixiert

Auswahl nach der Regel „ausgereifte Linie" (`CLAUDE.md` Abschnitt 15, „Versionswahl"), Nachweise in `docs/research/versions-verifikation.md`. Tabelle vom Eigentümer bestätigt am 2026-09-26. Lebensende bzw. Nachprüf-Datum im Ablaufdaten-Register (Abschnitt 8). Major-Updates erfordern eine erneute Verifikation und einen ADR. Grundsatzentscheidungen: Eigenbau statt Anpassung (ADR-004), Web-App mit Python-Server und TypeScript-Oberfläche (ADR-002); Versionsregel als Regel-001 in `docs/decisions.md` Teil C.

- **Mindestreife neuer Linien:** Linie mindestens 6 Monate veröffentlicht **und** mit Fehlerkorrektur-Versionen. Innerhalb einer Linie wird die neueste Unterversion gewählt, die bereits mindestens eine Fehlerkorrektur-Version hat (bei 0.x-Paketen: neueste Minor-Version mit mindestens einem Patch-Release). Festgelegt vom Eigentümer am 2026-09-26.
- **Geplante Projektdauer:** 3 Jahre (bis ca. 2029-09) – das Unterstützungsfenster fixierter Linien muss so weit reichen oder einen Nachprüf-Schritt im Fahrplan haben.

- **Sprachen und Versionen:**
  - Python 3.14 (3.14.7) — Verifiziert: 2026-09-26, Quelle: python.org, PEP 745
  - TypeScript 6.0 (6.0.3) — Verifiziert: 2026-09-26, Quelle: npm-Registry, TypeScript-Devblog
- **Frameworks und Bibliotheken:**
  - FastAPI 0.141 (0.141.1, gepinnt `<0.142`) — Verifiziert: 2026-09-26, Quelle: PyPI
  - Pydantic 2.13 (2.13.5) — Verifiziert: 2026-09-26, Quelle: PyPI, Versionsrichtlinie Pydantic
  - uvicorn 0.52 (0.52.4) — Verifiziert: 2026-09-26, Quelle: PyPI (0.53/0.54 ohne Fehlerkorrektur-Version)
  - httpx 0.28 (0.28.1) — Verifiziert: 2026-09-26, Quelle: PyPI; Python 3.14 nicht offiziell deklariert; auf 3.14.7 validiert (Schritt 1.3: Streaming, Timeout, Abbruch, sync und async, `-W error`); Nachprüfung im Ablaufdaten-Register
  - React und react-dom 19.2 (19.2.8) — Verifiziert: 2026-09-26, Quelle: npm-Registry, react.dev/versions
  - Vite 8.3 (8.3.1) und @vitejs/plugin-react 6.1 (6.1.1) — Verifiziert: 2026-09-26, Quelle: npm-Registry, vite.dev/releases
  - PyYAML 6.0 (6.0.3, gepinnt `<7`) — Verifiziert: 2026-09-26, Quelle: PyPI; Dateikopf in `storage` (ADR-016)
  - CodeMirror 6 (@codemirror/state 6.7.6, view 6.43.13, autocomplete 6.20.3, lang-markdown 6.5.2) — Verifiziert: 2026-09-26, Quelle: npm-Registry
- **Datenbank / Speicher:** Markdown-Dateien mit YAML-Kopf als Quelle der Wahrheit; SQLite (in Python enthalten, Version folgt Python 3.14) als abgeleiteter, jederzeit neu aufbaubarer Suchindex – ADR-003
- **Laufzeitumgebung:** Node.js 24 LTS (24.21.0) nur für Build und Entwicklung der Oberfläche — Verifiziert: 2026-09-26, Quelle: nodejs.org, Release-Plan `schedule.json`. Betrieb: Python 3.14 mit uvicorn auf einem VPS (ADR-006), Anbieter in Schritt 4.2
- **Package Manager:** uv 0.12 (0.12.19) für Python; npm 11 (11.19.0, mit Node 24 gebündelt) für die Oberfläche — Verifiziert: 2026-09-26, Quelle: PyPI, nodejs.org

### Empfohlen (freigabefrei nutzbar)

- Standardbibliothek von Python und die Web-Standard-APIs des Browsers – ohne Einschränkung.
- Weitere Pakete der CodeMirror-6-Familie (`@codemirror/*`, `@lezer/*`) – für Editor-Funktionen.
- Test-, Lint-, Format- und Typprüf-Werkzeuge aus Abschnitt 7 – nach deren Fixierung in Modus 2 Schritt 10.

### Explizit nicht erlaubt

- **Ein fremdes Werkzeug als Code-Basis** (u. a. SillyTavern, The Story Nexus, Story Labyrinth) – Grundsatzentscheidung Eigenbau. Lizenzrechtlich wären Übernahmen aus AGPL-/GPL-3.0-Code mit der Projektlizenz vereinbar; jede Übernahme einzelner Code-Teile ist trotzdem freigabepflichtig (`CLAUDE.md` Abschnitt 4, Kategorie 3 und 8).
- **Anbieterspezifische KI-Bibliotheken als Pflichtweg** – die KI-Anbindung läuft über eine eigene Anbieter-Schnittstelle (FR-018, FR-025).
- **Selbst betriebenes KI-Modell** – Vision Abschnitt 6.
- **Konten- oder Rechteverwaltung für mehrere Nutzer** – Vision Abschnitt 5; ein Zugangsschutz für den einen Nutzer ist davon nicht betroffen.

### Unterstützte Entwickler-Plattformen

Entwicklung erfolgt durch den Coding-Agent; der Eigentümer entwickelt nicht selbst.

| Aspekt | Linux (Cloud-Session des Coding-Agents, Ubuntu) | macOS | Windows |
|---|---|---|---|
| **Backend-Entwicklung** | ✓ | ✗ – nicht getestet, kein Bedarf (Eigentümer entwickelt nicht lokal) | ✗ – wie macOS |
| **Frontend-Entwicklung** | ✓ | ✗ – wie oben | ✗ – wie oben |
| **Hilfsskripte (`scripts/`)** | ✓ | ✗ – wie oben | ✗ – wie oben |
| **CI-Pipeline** | ✓ (GitHub-Hosted-Runner `ubuntu-latest`) | — | — |

**Nutzung (nicht Entwicklung):** aktuelle Browser auf Desktop und Smartphone; konkrete Matrix nach Modus 2 Schritt 4.

**Pflege-Regel:** Diese Tabelle wird bei jedem Touch an `scripts/`, `pyproject.toml`/`package.json` (Top-Level-Dependencies) oder bei jeder neuen plattform-bezogenen Eskalation re-validiert. Verstöße sind im selben Commit zu korrigieren.

<!-- ANCHOR:architektur-grobstruktur -->
## 4. Architektur-Grobstruktur

Modularer Monolith (ADR-003): ein Python-Server (FastAPI) liefert die React-Oberfläche aus und stellt die Fachfunktionen bereit; Welten und Texte als Markdown-Dateien, SQLite als abgeleiteter Suchindex. Kern ist die Kontext-Zusammenstellung, die jede KI-Anfrage unter festem Token-Budget baut. Details: `docs/architecture.md`.

**Module (Kurzübersicht):**

- `canon` – Welten, Kanon-Einträge, Import von Welt-Material
- `manuscript` – Geschichten, Kapitel, Kurzfassungen, Figuren-Schreibweise, Gast-Verbindungen, geschichtenbezogene Fakten
- `context` – Kontext-Zusammenstellung unter Token-Budget, Vorschläge ohne `@`
- `ai_gateway` – Anbieter-Schnittstelle, OpenRouter als erster Adapter
- `storage` – Dateien und Suchindex
- `api` – HTTP-Schicht, Anmeldung, Ablauf-Steuerung
- `ui` – React-Oberfläche mit CodeMirror-6-Editor

**Kommunikationsmuster:** synchron; HTTP/JSON zwischen Oberfläche und Server, KI-Text per Server-Sent Events; innerhalb des Servers Funktionsaufrufe über öffentliche Modul-Schnittstellen.

<!-- ANCHOR:externe-abhaengigkeiten -->
## 5. Externe Abhängigkeiten

### Services

| Service | Zweck | Authentifizierung | Ausfallverhalten |
|---|---|---|---|
| OpenRouter | Zugang zu KI-Modellen verschiedener Anbieter, freie Modellwahl (FR-018) | API-Schlüssel, nur serverseitig, nie im Browser | Text des Autors geht nie verloren; Fehlermeldung statt stillem Abbruch; Wiederholen mit anderem Modell (`docs/architecture.md` Abschnitt 5) |
| weitere KI-Anbieter | künftig parallel zu OpenRouter (FR-025) | je Anbieter | wie OpenRouter |
| Have I Been Pwned – Pwned Passwords | Prüfung neuer Passwörter gegen geleakte Passwörter (ADR-017); Daten CC BY 4.0, Namensnennung am Passwortfeld und in der README | keine; nur 5 Hex-Zeichen des SHA-1-Hashes verlassen den Server | Festlegen oder Ändern des Passworts wird abgelehnt, bis der Dienst erreichbar ist; Anmeldung unberührt |

### APIs

- **OpenRouter:** OpenAI-kompatible Chat-Schnittstelle mit Streaming. Modell-Verfügbarkeit und Inhaltsfilter je Modell uneinheitlich; Befund der Bestandsprüfung: 324 von 458 Modellen ohne OpenRouter-eigene Moderation (`docs/research/bestandspruefung.md`). Startmodell grok-4.7, Zweitmodell grok-4.6, Notfall-Reserve qwen3.8-max (ADR-010, ADR-011); Preise, Nutzungsbedingungen der ausführenden Anbieter und Ablehnungssignale in `docs/research/modell-eignungstest.md`. Rate Limits: bei qwen3.8-flash HTTP 429 vom Anbieter beobachtet, sonst keine.

<!-- ANCHOR:constraints -->
## 6. Constraints (operationalisierbar)

**Regel: Jeder Constraint muss in eine prüfbare Regel übersetzt sein.**

### Datenschutz

- Welten und Texte sind fiktionale Inhalte des Eigentümers; Übermittlung an kommerzielle KI-APIs ist zulässig (Vision Abschnitt 6). Schutzbedarf: normal (ADR-007).
- Keine Inhalte aus Welten oder Manuskripten in Server-Logs → Regel: Logs enthalten nur Metadaten (Zeit, Endpunkt, Status, Modell, Token-Zahlen).

### Sicherheit

- API-Schlüssel der KI-Anbieter liegen ausschließlich serverseitig in Umgebungsvariablen, nie im Browser, im Repo oder in Logs.
- Sicherheitsniveau OWASP ASVS 5.0.0 Stufe 1, Authentifizierung und Sitzung Stufe 2 (ADR-006) → Regel: jede Sicherheitsmaßnahme nennt die ASVS-Anforderung, die sie erfüllt; alles darüber hinaus wird dem Eigentümer als optional vorgelegt.
- Alle Endpunkte außer Gesundheitsprüfung und Anmeldung verlangen eine gültige Sitzung.
- Der OpenRouter-Schlüssel trägt eine Ausgabengrenze beim Anbieter.

### Performance und Kosten

- **Kosten pro Anfrage** unter dem heutigen Stand (Referenz ca. 125.000–140.000 Token pro Anfrage, Vision 4) → Regel: Die Kontext-Zusammenstellung hat ein festes Token-Budget je Anfrage; Obergrenze 30.000 Token (ADR-010, `docs/architecture.md` Abschnitt 6).
- **Kein Kontextverlust** bei einer Geschichte vom Umfang der Referenzgeschichte (500.000–700.000 Token Chatverlauf) → Prüfung an einer Geschichte gleichen Umfangs (FR-006 verworfen).
- KI-Text erscheint beim Schreiben fortlaufend (Streaming), nicht erst nach Abschluss der Antwort.

### Plattform und Kompatibilität

- Oberfläche bedienbar auf Smartphone-Bildschirmen (FR-019, Soll).
- Welten und Texte liegen als lesbare Markdown-Dateien vor oder lassen sich verlustfrei so ausgeben (FR-020, Soll).

### Compliance und Lizenz

- **Projektlizenz:** AGPL-3.0 (Eigentümer, 2026-09-26, ADR-005; Vision-Frage: „Dürfen andere den Code in ein geschlossenes Produkt übernehmen?" → nein). `LICENSE` enthält den Lizenztext aus der SPDX-Lizenzliste (`AGPL-3.0-only.txt`, abgerufen 2026-09-26; gnu.org aus der Arbeitsumgebung nicht erreichbar).
- **Erlaubte Abhängigkeitslizenzen:** MIT, BSD-2/3-Clause, Apache-2.0, ISC, PSF-2.0, MPL-2.0, LGPL (2.1 oder später, 3.0), GPL-3.0 (bzw. „2.0 oder später"), AGPL-3.0; Artistic-2.0, CC-BY-4.0, BlueOak-1.0.0, MIT-0 und CC0-1.0 nur für Werkzeuge (z. B. npm, caniuse-lite, minimatch – ADR-015; `@csstools/*`, mdn-data über jsdom – ADR-019). Bestätigt vom Eigentümer 2026-09-26.
- **Ausgeschlossene Lizenzen:** GPL-2.0-only (unvereinbar mit AGPL-3.0), proprietäre Lizenzen, Lizenzen mit Nutzungsbeschränkung (z. B. Commons Clause) – Abweichung nur per ADR.

### Anforderungen, Schutzbedarf, Kosten

- **`docs/requirements.md`:** angelegt (Klasse M), bestätigt am 2026-09-26.
- **Schutzbedarf:** normal (Eigentümer, 2026-09-26)
- **Kostenrahmen:** siehe Abschnitt 8.

### Methodik-Schwellenwerte

- **Reaktiv-ADR-Schwellenwert:** maximal 30 % `[REAKTIV]`-Anteil über die letzten 10 ADRs (Klasse M). Bei Überschreitung legt die KI einen Reflexions-Schritt im Fahrplan an, bevor weitere Umsetzungsschritte beginnen.
- **Wucherungs-Schwelle** (`CLAUDE.md` Abschnitt 8, Kriterium 9): Faktor 2 gegenüber dem ursprünglichen Schrittplan **und** mindestens 5 zusätzliche Schritte (Default).
- **Modellklassen-Zuordnung** (Regelwerk: `CLAUDE.md` Abschnitt 0, „Modellklassen-Disziplin"):
  - **Mechanik-Klasse:** Claude Haiku 4.5 – Probelauf: offen (für dieses Projekt nicht erprobt; bis dahin übernimmt die Routine-Klasse)
  - **Routine-Klasse:** Claude Sonnet 5 – Probelauf: offen (bis dahin übernimmt die Entscheidungs-Klasse)
  - **Entscheidungs-Klasse:** Claude Opus, aktuelle Linie (Stand 2026-09-26: Opus 5.5) – stärkstes regulär eingesetztes Modell
  - **Ausnahme-Klasse:** Claude Fable 5.1 – nur auf Vorschlag mit Freigabe
  - **Bezugsmodell und knappe Ressource:** Abo (Max 5x); knapp ist das Wochenkontingent, Zurücksetzung sonntags 10:00 (MESZ), dazu ein Kurzzeitlimit je 5 Stunden (Eigentümer, 2026-09-26; Sitzungsabfrage bestätigt den Zeitpunkt). Zusätzlich ein eingelöstes Guthaben von 250 $ (Stand 2026-09-26: 193 $ übrig), gültig bis 2026-11-05 08:59 MEZ; laut Eigentümer laufen die Cloud-Sessions des Coding-Agents über dieses Guthaben (Eigentümer, 2026-09-26; die Sitzungsabfrage zeigt dazu nichts an)
  - **Abgabe an Unteragenten:** Claude Code – Modell je Unteragenten-Aufruf oder als `model:` in der Agent-Definition. Abgabe an niedrigere Klassen erst nach bestandenem Probelauf.
  - **Meldet die Laufzeitumgebung das Modell / das Kontingent?** Stand 2026-09-26: Sitzungsabfrage meldet eingestelltes und bedientes Modell, Kontextgröße und den Status des Wochenlimits mit Zurücksetz-Zeitpunkt.
  - **Preise je Klasse** (Listenpreis je 1 Mio. Token, Eingabe / Ausgabe / Cache-Lesen, Stand 2026-06-24, übernommen aus der Referenz des Werkzeugs): Mechanik 1 $ / 5 $ / 0,10 $; Routine 2 $ / 10 $ / 0,20 $; Entscheidung 4 $ / 20 $ / 0,20 $; Ausnahme 10 $ / 50 $ / 0,25 $. Folge: an die Mechanik-Klasse auch Lesearbeit; an die Routine-Klasse nur ausgabelastige Arbeit.
  - **Grenze der Sessiongröße:** 200.000 Token Kontext (Default) – darüber beginnt die KI keinen neuen Schritt. Quelle: Sitzungsabfrage (`context_usage.used_tokens`).
  - **Kontingent-Warnung:** inaktiv, Begründung: Arbeit läuft in Cloud-Sessions ohne Statuszeile; Zustellweg unerprobt.

<!-- ANCHOR:code-standards-und-qualitaetsziele -->
## 7. Code-Standards und Qualitätsziele

Pflichtkategorien: `CLAUDE.md` Abschnitt 15. Toolwahl nach den Skeletten unter `templates/pre-commit/` und `templates/github-workflows/`; Versionen werden in Modus 2 Schritt 10 gegen offizielle Quellen verifiziert und gepinnt.

### Tool-Festlegung pro Sprache

#### Python

- **Linter:** `ruff check` (Konfiguration in `pyproject.toml`)
- **Formatter:** `ruff format`, Zeilenlänge 100
- **Type-Checker:** `mypy --strict`
- **Security-Scanner:** `bandit`
- **Dependency-Audit:** `pip-audit`
- **Test-Runner:** `pytest` mit `pytest-cov`; Warnungen als Fehler (`filterwarnings = error`)
- **Naming-Konvention:** PEP 8 – snake_case für Funktionen und Variablen, PascalCase für Klassen

#### TypeScript

- **Linter:** `eslint` mit `typescript-eslint`, `--max-warnings 0 --report-unused-disable-directives`
- **Formatter:** `prettier` (nur für Code, nicht für Markdown in `docs/`, siehe `.prettierignore`)
- **Type-Checker:** `tsc --noEmit` mit `strict: true` und `noUncheckedIndexedAccess: true`
- **Security-Scanner:** nicht anwendbar als eigenes Werkzeug, Begründung: kein etabliertes Standard-Werkzeug für React-Oberflächen; abgedeckt durch `eslint`-Regeln (z. B. Verbot von `dangerouslySetInnerHTML` ohne Begründung) und `npm audit`
- **Dependency-Audit:** `npm audit --audit-level=high`
- **Test-Runner:** `vitest` mit Coverage
- **Versionen (ADR-015):** Python: ruff 0.16.9, mypy 1.20.2, bandit 1.9.4, pip-audit 2.10.1, pytest 9.1.1, pytest-cov 7.1.0, pre-commit 4.6.2; TypeScript: eslint 10.9.1, typescript-eslint 8.70.1, eslint-plugin-react-hooks 7.1.1, prettier 3.9.9, vitest 4.1.11 – Nachweise in `docs/research/versions-verifikation.md`
- **Naming-Konvention:** camelCase für Variablen und Funktionen, PascalCase für Typen, Klassen und React-Komponenten

#### Bash (Hilfsskripte in `scripts/`)

- **Linter:** `shellcheck` 0.11.0 über das PyPI-Paket shellcheck-py (Entwicklungsgruppe) als lokaler Pre-Commit-Hook (ADR-015, Nachtrag)
- **Übrige Kategorien:** nicht anwendbar, Begründung: wenige Hilfsskripte; kein etablierter Formatter oder Typprüfer im Projekt-Stack

#### Markdown

- **Linter:** `markdownlint-cli2` mit `.markdownlint-cli2.jsonc` (MD013 und MD060 deaktiviert)
- **Übrige Kategorien:** nicht anwendbar, Begründung: Dokumentation, kein ausführbarer Code

### Warnungs-Bestand

Default „Warnungen sind Fehler". Benannte Ausnahmen:

| Warnung | Werkzeug-Schalter | Grund | Fahrplan-Schritt |
|---|---|---|---|
| `StarletteDeprecationWarning`: „Using `httpx` with `starlette.testclient` is deprecated; install `httpx2` instead." | `filterwarnings` in `pyproject.toml` (genau diese Meldung) | httpx2 erst ab 2026-11-12 mindestreif (ADR-015) | D.5 |

**Warnungsquellen ohne Schalter:** Hinweise der CI-Plattform zu Action-Versionen; Bündelgrößen-Warnungen von Vite.

### Durchsetzungsmechanismen

- **Pre-Commit-Hook-Framework:** `pre-commit`
- **Konfigurationsdatei:** `.pre-commit-config.yaml`
- **CI-Plattform:** GitHub Actions
- **Workflow-Dateien:** `.github/workflows/ci.yml` mit den Jobs Pre-Commit, Python und TypeScript (alle Pflicht-Gates, seit Schritt 2.1 scharf)
- **Einrichtung der Cloud-Session:** SessionStart-Hook `.claude/settings.json` → `scripts/session-start.sh` (ADR-015)
- **Trigger:** `push` auf alle Branches und `pull_request` auf `main`
- **Verpflichtende CI-Gates (Merge-Block bei Rot):** Lint, Format-Check, Type-Check, Security-Scan, Dependency-Audit (Schwellenwert high), Tests inklusive Coverage-Mindestwert
- **Branch-Protection auf Hauptbranch:** alle Pflicht-Gates müssen grün sein; Force-Push gesperrt; siehe Abschnitt 10

### Coverage-Mindestwerte

- **Globaler Mindestwert:** 80 % Lines, 70 % Branches (bestätigt vom Eigentümer 2026-09-26). Umsetzung: TypeScript getrennt nach Zeilen und Zweigen (`vite.config.ts`); Python mit `fail_under = 80` über Zeilen und Zweige zusammen (coverage.py kennt keine getrennten Schwellen).
- **Kritische Pfade (höhere Anforderung):** Kontext-Zusammenstellung und Kanon-Verwaltung 90 % Lines – dort entstehen Kanon-Widersprüche und Kosten (FR-010, FR-011). CI-Schritt „Coverage kritischer Pfade" greift, sobald `src/skriptorium/canon` bzw. `context` existiert.
- **Ausnahmen:** keine

### Commit-Lint

- **Tool:** nicht aktiv, Begründung: Commit-Format nach `CLAUDE.md` Abschnitt 11 wird von der KI eingehalten; ein zusätzliches Werkzeug bringt bei einem einzelnen Beitragenden keinen Mehrwert.

### Editor-Integration (empfohlen, nicht erzwungen)

- **EditorConfig:** `.editorconfig` im Repo-Root (LF, UTF-8, Einrückung 4 Leerzeichen für Python, 2 für TypeScript)

<!-- ANCHOR:betrieb-und-deployment -->
## 8. Betrieb und Deployment

- **Deployment-Ziel:** kleiner gemieteter Server (VPS), öffentlich erreichbar mit Passwortschutz (Eigentümer, 2026-09-26); Anbieter [TBD in Schritt 4.2]
- **CI/CD:** GitHub Actions, `.github/workflows/ci.yml`. Deployment-Workflow: [TBD in Schritt 4.7 – bis dahin kein Deployment]
- **Umgebungen:** lokal (Cloud-Session des Coding-Agents) → Produktion (VPS)
- **Monitoring:** Erreichbarkeits-Prüfung von außen [TBD in Schritt 4.2]; Kosten je Monat in der Oberfläche
- **Server-Prozess:** genau ein uvicorn-Prozess hinter einem Reverse Proxy auf demselben Host, `--no-access-log`, `--forwarded-allow-ips` nicht über `127.0.0.1` hinaus – Sitzungen und Sperre nach Fehlversuchen liegen im Speicher (ADR-017, Sicherheitsprüfung 2.6)
- **Logging-Level Default:** `INFO` im Betrieb, `DEBUG` nur lokal; keine Inhalte aus Welten oder Manuskripten (Abschnitt 6)
- **Vertretung:** Verzicht – niemand; Stillstand ist zulässig, Daten bleiben in den Sicherungen (Eigentümer, 2026-09-26; ADR-008 mit benanntem Restrisiko)
- **Notfall-Handbuch:** `docs/onboarding-runbook.md` Abschnitt „Notfall" – [TBD, anzulegen in Schritt 4.4]
- **KI im Betrieb:** Coding-Agent über Claude-Abo Max 5x des Eigentümers; Wochenlimit mit Zurücksetzung sonntags 10:00 (MESZ) plus 5-Stunden-Limit. Rückfallweg ohne KI: Das Skriptorium läuft ohne den Coding-Agent weiter; Neustart und Wiederherstellung nach Notfall-Handbuch. Die KI-Anbieter im Produkt (OpenRouter) sind davon getrennt und über den Kostenrahmen begrenzt.
- **Zugriff der KI auf die Produktion:** vorerst keiner; Festlegung im Gate-Schritt
- **Unbeaufsichtigtes Handeln der KI:** nein

### Ablaufdaten-Register

| Was | Ablauf / Lebensende | Vorlauf | Quelle | Fahrplan-Schritt |
|---|---|---|---|---|
| Node.js 24 LTS (nur Build) | 2028-04-30 | 6 Monate | Node-Release-Plan `schedule.json` | D.1 – Wechsel auf Node 26 LTS frühestens 2026-11-05 |
| Python 3.14 | 2030-10 | 6 Monate | PEP 745 | – (Vorlauf nach Projektdauer) |
| httpx 0.28 – Python 3.14 nicht offiziell deklariert, Pflege schwach | Nachprüfung 2027-03-26 | – | PyPI; auf 3.14.7 validiert 2026-09-26 (Schritt 1.3, `spikes/httpx-python-314/README.md`) | D.3 – Nachprüfung 2027-03-26 |
| TypeScript 7 – neue Linie, noch nicht reif | Nachprüfung 2027-01-08 | – | TypeScript-Devblog | D.2 |
| Starlette-Abkündigung httpx im TestClient; httpx2 mindestreif | 2026-11-12 | – | Starlette 1.7.0, PyPI httpx2 (ADR-015) | D.5 – Wechsel auf httpx2 |
| mypy 2 – neue Linie, noch nicht reif | Nachprüfung 2026-11-06 | – | PyPI (ADR-015) | D.5 (mit erledigen) |
| jsdom 30 – neue Linie, noch nicht reif (ADR-019) | Nachprüfung 2027-01-27 | – | npm-Registry | D.2 (mit erledigen) |
| vitest 5 – neue Linie, noch nicht reif | Nachprüfung 2027-03-03 | – | npm-Registry (ADR-015) | D.2 (mit erledigen) |
| Guthaben des Coding-Agents (250 $, Stand 193 $) | 2026-11-05 08:59 MEZ | 2 Wochen | Angabe des Eigentümers 2026-09-26 | – (kontingentintensive Arbeit vor dem Ablauf einplanen; Schritt anlegen bei Erreichen des Vorlaufs) |
| Wochenkontingent der KI | wöchentlich, So 10:00 (MESZ) | – | Sitzungsabfrage 2026-09-26 | – |

### Kosten

- **Kostenrahmen:** bis 50 € monatlich für KI-Anfragen und Hosting zusammen (Eigentümer, 2026-09-26; BDR-001). Das Abo für den Coding-Agent ist nicht Teil dieses Rahmens.
- **Kostenregister:** in dieser Tabelle

| Posten | Art (laufend / einmalig / KI-Verbrauch) | Betrag je Monat | Stand vom | Entscheidung nötig ab |
|---|---|---|---|---|
| KI-Anfragen über OpenRouter | KI-Verbrauch | Schätzung ca. 6–36 $ plus Ausgabe (400 Anfragen × 30.000 Token, 0,50–3 $ je 1 Mio. Token; `docs/architecture.md` Abschnitt 6) ; gemessen in 1.1 (Testwelt, bis 17.600 Token): Startmodell grok-4.7 ca. 12 $ je Monat, hochgerechnet auf die Obergrenze 30.000 Token ca. 21 $ (ADR-010, `docs/research/modell-eignungstest.md`) | 2026-09-26 | Summe über 50 € |
| Hosting | laufend | Schätzung ca. 4–6 € (kleiner VPS) – Festlegung in Schritt 4.2 | 2026-09-26 | Summe über 50 € |

<!-- ANCHOR:entscheidungsbefugnisse -->
## 9. Entscheidungsbefugnisse

- **Freigabe-Entscheidungen trifft:** der Repo-Eigentümer (Paddel87).
- **Kommunikationskanal für Freigaben:** direkt im Chat mit dem Coding-Agent; Ergebnis als ADR in `docs/decisions.md`.
- **Reaktionszeit-Erwartung:** asynchron, keine harte Antwortzeit.

<!-- ANCHOR:repository-regeln -->
## 10. Repository-Regeln

- **Hauptbranch:** `main`
- **Push-Regel:** Änderungen laufen über Pull Requests; nie direkt auf `main`.
- **Schutzregeln:** keine Force-Pushes auf `main`; Merge nur bei grüner CI.

### Branch-Konvention

Festgelegt 2026-09-26 auf Wunsch des Eigentümers; ergänzt `CLAUDE.md` Abschnitt 11 (Commit-Format, Grundtypen `feat/`, `fix/`, `refactor/`).

- **Form:** `<typ>/<fahrplan-id>-<kurztitel>` – Kleinbuchstaben, Wörter mit Bindestrich, Umlaute transliteriert (`ae`/`oe`/`ue`/`ss`), höchstens ca. 40 Zeichen. Beispiele: `feat/2.3-kanon-eintraege`, `fix/3.1-stream-abbruch`, `spike/1.3-httpx-python-314`.
- **Typen:**

| Typ | Wofür | Commit-Bereich (Beispiel) |
|---|---|---|
| `feat/` | neue Funktion aus einem UMSETZUNG-Schritt | Modulname, z. B. `canon:` |
| `fix/` | Fehlerbehebung ohne neue Funktion | Modulname |
| `refactor/` | Umbau innerhalb eines Moduls ohne Verhaltensänderung | Modulname |
| `spike/` | Erkundung mit Wegwerf-Code (ERKUNDUNG-Schritte) | `spike:` |
| `docs/` | nur Dokumentation | `docs:` |
| `ci/` | Pipeline, Pre-Commit, Werkzeug-Konfiguration (freigabepflichtig nach `CLAUDE.md` Abschnitt 4, Kategorie 7) | `ci:` |
| `deps/` | Abhängigkeiten aktualisieren (Regel-001) | `deps:` |
| `chore/` | Aufräumen ohne fachliche Wirkung | `chore:` |
| `hotfix/` | nur nach dem ersten öffentlichen Deployment (Schritt 4.7): dringender Fix für den laufenden Betrieb | Modulname |

- **Cloud-Sessions des Coding-Agents:** Das Werkzeug vergibt den Branch-Namen selbst (`claude/<name>`), und der Agent darf nur auf diesen Branch pushen. Dort trägt der **Titel des Pull Requests** den Typ: `<typ>(<fahrplan-id>): <titel>`, z. B. `feat(2.3): Welten und Kanon-Einträge anlegen`. Wer eine Session startet und den Branch-Namen wählen kann, nutzt die Form oben.
- **Umfang:** ein Branch = ein Pull Request = ein Fahrplan-Schritt oder ein zusammenhängendes Bündel mit genannten Schritt-IDs. Commit-Bereiche sind die Modulnamen (`canon`, `manuscript`, `context`, `ai_gateway`, `storage`, `api`, `ui`) oder `docs`, `spike`, `ci`, `deps`, `chore`.
- **Lebensdauer:** Branches werden nach dem Merge gelöscht; außer `main` gibt es keine dauerhaften Branches.
- **Merge:** Merge-Commit, kein Squash – die atomaren Commits mit Fahrplan-Referenz (`CLAUDE.md` Abschnitt 11) bleiben in der Historie erhalten (bisherige Praxis bei PR #1 und #2).

<!-- ANCHOR:offene-grundsatzfragen -->
## 11. Offene Grundsatzfragen

- keine (Stand 2026-09-26; Codesprache und Projektlizenz entschieden)

<!-- ANCHOR:glossar -->
## 12. Glossar (projektspezifische Begriffe)

- **Welt:** eigenständiges fiktionales Universum mit eigenem Kanon; Welten sind voneinander getrennt.
- **Kanon:** verbindliches Wissen einer Welt – Figuren, Orte und Geografie, Gegenstände, Zeitlinie, Regeln, Kultur.
- **Kanon-Eintrag:** ein einzelnes Element des Kanons (z. B. die Figur „Kael").
- **Geschichte:** Text einer Welt in der Form Roman (mit Kapiteln), Kurzgeschichte oder Fragment.
- **Manuskript:** der fortlaufende Text einer Geschichte, entstanden im Wechsel von Autor und KI.
- **@-Verweis:** gezieltes Ansprechen eines Kanon-Eintrags durch vorangestelltes `@` (z. B. `@Kael`).
- **Figuren-Schreibweise:** Arbeitsweise, bei der der Autor eine oder mehrere Figuren führt (oft eine Ich-Figur) und die KI Welt und übrige Figuren (FR-012).
- **Gast-Figur:** Figur aus einer anderen Welt, die in einer Geschichte auftritt; die Verbindung gilt nur für diese Geschichte (FR-017).
- **Referenzgeschichte:** bisher längste Geschichte des Autors (500.000–700.000 Token Chatverlauf); Maßstab für Kontext- und Kostenziele.
- **Kontext-Zusammenstellung:** Auswahl von Kanon-Ausschnitt und Handlungsstand, die einer KI-Anfrage mitgegeben wird.
