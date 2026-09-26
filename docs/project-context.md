# Project Context – Skriptorium

<!-- Projektspezifischer Kontext. Wird zu Sessionbeginn als erste Datei gelesen.
     Dient als Entscheidungsgrundlage für alle autonomen Schritte der KI.
     Befüllt in Modus 2 (templates/projektstart.md Abschnitt 1.3), Klassen-Hypothese M.
     Recherchen liegen ausgelagert unter docs/research/ (CLAUDE.md Abschnitt 2, Größen-Budget). -->

<!-- ANCHOR:kerndaten -->
## 1. Kerndaten

- **Projektname:** Skriptorium
- **Kurzbeschreibung:** Schreibwerkstatt für einen einzelnen Autor: Mehrere eigene Welten dienen als verbindlicher Kanon, Autor und KI schreiben im Wechsel Prosa darin, ohne der jeweiligen Welt zu widersprechen.
- **Status:** Konzeption (Modus 2 läuft)
- **Version (SemVer):** v0.0.0 – noch keine lauffähige Version
- **Dokumentationssprache:** Deutsch
- **Codesprache (Kommentare, Variablennamen):** [offen – Frage an den Eigentümer, Modus 2 Schritt 2]
- **Projekttyp:** Full-Stack (Web-App: Python-Server, TypeScript-Oberfläche)
- **Projektgrößen-Klasse:** M (Hypothese aus Modus 2 Schritt 1, Bestätigung nach Schritt 4, ADR-001)

<!-- ANCHOR:zielgruppe-und-nutzungskontext -->
## 2. Zielgruppe und Nutzungskontext

- **Primäre Nutzer:** ein Autor (der Eigentümer), ohne Programmierkenntnisse; schreibt Romane, Kurzgeschichten und Fragmente in mehreren eigenen Welten.
- **Sekundäre Nutzer / Betreiber:** derselbe Eigentümer als Betreiber; technische Umsetzung und Pflege durch den Coding-Agent.
- **Erwartete Last:** ein gleichzeitiger Nutzer; wenige KI-Anfragen pro Minute während einer Schreibsitzung.
- **Nutzungsumgebung:** Browser auf Desktop und Smartphone (FR-019, Soll).

<!-- ANCHOR:technischer-stack -->
## 3. Technischer Stack

### Fixiert

Auswahl nach der Regel „ausgereifte Linie" (`CLAUDE.md` Abschnitt 15, „Versionswahl"), Nachweise in `docs/research/versions-verifikation.md`. Tabelle vom Eigentümer bestätigt am 2026-09-26. Lebensende bzw. Nachprüf-Datum im Ablaufdaten-Register (Abschnitt 8). Major-Updates erfordern eine erneute Verifikation und einen ADR. Grundsatzentscheidungen: Eigenbau statt Anpassung, Web-App mit Python-Server und TypeScript-Oberfläche (ADR folgen in Modus 2 Schritt 5).

- **Mindestreife neuer Linien:** Linie mindestens 6 Monate veröffentlicht **und** mit Fehlerkorrektur-Versionen. Innerhalb einer Linie wird die neueste Unterversion gewählt, die bereits mindestens eine Fehlerkorrektur-Version hat (bei 0.x-Paketen: neueste Minor-Version mit mindestens einem Patch-Release). Festgelegt vom Eigentümer am 2026-09-26.
- **Geplante Projektdauer:** 3 Jahre (bis ca. 2029-09) – das Unterstützungsfenster fixierter Linien muss so weit reichen oder einen Nachprüf-Schritt im Fahrplan haben.

- **Sprachen und Versionen:**
  - Python 3.14 (3.14.7) — Verifiziert: 2026-09-26, Quelle: python.org, PEP 745
  - TypeScript 6.0 (6.0.3) — Verifiziert: 2026-09-26, Quelle: npm-Registry, TypeScript-Devblog
- **Frameworks und Bibliotheken:**
  - FastAPI 0.141 (0.141.1, gepinnt `<0.142`) — Verifiziert: 2026-09-26, Quelle: PyPI
  - Pydantic 2.13 (2.13.5) — Verifiziert: 2026-09-26, Quelle: PyPI, Versionsrichtlinie Pydantic
  - uvicorn 0.52 (0.52.4) — Verifiziert: 2026-09-26, Quelle: PyPI (0.53/0.54 ohne Fehlerkorrektur-Version)
  - httpx 0.28 (0.28.1) — Verifiziert: 2026-09-26, Quelle: PyPI; Python 3.14 nicht offiziell deklariert, Streaming-Stichprobe auf 3.14 (Vorabversion) erfolgreich; Nachprüfung im Ablaufdaten-Register
  - React und react-dom 19.2 (19.2.8) — Verifiziert: 2026-09-26, Quelle: npm-Registry, react.dev/versions
  - Vite 8.3 (8.3.1) und @vitejs/plugin-react 6.1 (6.1.1) — Verifiziert: 2026-09-26, Quelle: npm-Registry, vite.dev/releases
  - CodeMirror 6 (@codemirror/state 6.7.6, view 6.43.13, autocomplete 6.20.3, lang-markdown 6.5.2) — Verifiziert: 2026-09-26, Quelle: npm-Registry
- **Datenbank / Speicher:** [TBD nach Modus 2 Schritt 4 – Speicherform (Markdown-Dateien, ggf. Index) wird in der Architektur entschieden]
- **Laufzeitumgebung:** Node.js 24 LTS (24.21.0) nur für Build und Entwicklung der Oberfläche — Verifiziert: 2026-09-26, Quelle: nodejs.org, Release-Plan `schedule.json`. Betrieb: [TBD nach Modus 2 Schritt 4a – Hosting]
- **Package Manager:** uv 0.12 (0.12.19) für Python; npm 11 (11.19.0, mit Node 24 gebündelt) für die Oberfläche — Verifiziert: 2026-09-26, Quelle: PyPI, nodejs.org

### Empfohlen (freigabefrei nutzbar)

- Standardbibliothek von Python und die Web-Standard-APIs des Browsers – ohne Einschränkung.
- Weitere Pakete der CodeMirror-6-Familie (`@codemirror/*`, `@lezer/*`) – für Editor-Funktionen.
- Test-, Lint-, Format- und Typprüf-Werkzeuge aus Abschnitt 7 – nach deren Fixierung in Modus 2 Schritt 10.

### Explizit nicht erlaubt

- **Übernahme von Code aus AGPL- oder GPL-lizenzierten Werkzeugen** (u. a. SillyTavern, The Story Nexus, Story Labyrinth) – Grundsatzentscheidung Eigenbau; nur Konzepte werden übernommen.
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

[TBD nach Modus 2 Schritt 4 – Architektur-Grobschnitt. Feststehend: eine Web-App (Python-Server mit FastAPI, React-Oberfläche mit CodeMirror-6-Editor), KI-Zugriff über eine eigene Anbieter-Schnittstelle mit OpenRouter als erstem Anbieter.]

<!-- ANCHOR:externe-abhaengigkeiten -->
## 5. Externe Abhängigkeiten

### Services

| Service | Zweck | Authentifizierung | Ausfallverhalten |
|---|---|---|---|
| OpenRouter | Zugang zu KI-Modellen verschiedener Anbieter, freie Modellwahl (FR-018) | API-Schlüssel, nur serverseitig, nie im Browser | [TBD nach Modus 2 Schritt 4 – mindestens: Text des Autors geht nie verloren, Fehlermeldung statt stiller Abbruch] |
| weitere KI-Anbieter | künftig parallel zu OpenRouter (FR-025) | je Anbieter | wie OpenRouter |

### APIs

- **OpenRouter:** OpenAI-kompatible Chat-Schnittstelle mit Streaming. Modell-Verfügbarkeit und Inhaltsfilter je Modell uneinheitlich; Befund der Bestandsprüfung: 324 von 458 Modellen ohne OpenRouter-eigene Moderation, Filter der ausführenden Anbieter ungeprüft (`docs/research/bestandspruefung.md`). Rate Limits und Preise je Modell: [TBD nach Modus 2 Schritt 4].

<!-- ANCHOR:constraints -->
## 6. Constraints (operationalisierbar)

**Regel: Jeder Constraint muss in eine prüfbare Regel übersetzt sein.**

### Datenschutz

- Welten und Texte sind fiktionale Inhalte des Eigentümers; Übermittlung an kommerzielle KI-APIs ist zulässig (Vision Abschnitt 6). Schutzbedarf: [TBD nach Modus 2 Schritt 4a].
- Keine Inhalte aus Welten oder Manuskripten in Server-Logs → Regel: Logs enthalten nur Metadaten (Zeit, Endpunkt, Status, Modell, Token-Zahlen).

### Sicherheit

- API-Schlüssel der KI-Anbieter liegen ausschließlich serverseitig in Umgebungsvariablen, nie im Browser, im Repo oder in Logs.
- Weitere Regeln (Zugangsschutz, Sicherheitsniveau): [TBD nach Modus 2 Schritt 4a].

### Performance und Kosten

- **Kosten pro Anfrage** unter dem heutigen Stand (Referenz ca. 125.000–140.000 Token pro Anfrage, Vision 4) → Regel: Die Kontext-Zusammenstellung hat ein festes Token-Budget je Anfrage; Wert [TBD nach Modus 2 Schritt 4, `docs/architecture.md` Abschnitt 6].
- **Kein Kontextverlust** bei einer Geschichte vom Umfang der Referenzgeschichte (500.000–700.000 Token Chatverlauf) → Prüfung an einer Geschichte gleichen Umfangs (FR-006 verworfen).
- KI-Text erscheint beim Schreiben fortlaufend (Streaming), nicht erst nach Abschluss der Antwort.

### Plattform und Kompatibilität

- Oberfläche bedienbar auf Smartphone-Bildschirmen (FR-019, Soll).
- Welten und Texte liegen als lesbare Markdown-Dateien vor oder lassen sich verlustfrei so ausgeben (FR-020, Soll).

### Compliance und Lizenz

- **Projektlizenz:** [offen – Frage an den Eigentümer, Modus 2 Schritt 2; Vision 6: Open Source beabsichtigt, Festlegung nach der Bestandsprüfung]
- **Erlaubte Abhängigkeitslizenzen:** MIT, BSD-2/3-Clause, Apache-2.0, ISC, PSF-2.0, Artistic-2.0 (nur Werkzeuge, z. B. npm), MPL-2.0 (nur unverändert genutzt).
- **Ausgeschlossene Lizenzen:** GPL und AGPL für eingebundenen Code; Lizenzen mit Nutzungsbeschränkung (z. B. Commons Clause) – Abweichung nur per ADR.

### Anforderungen, Schutzbedarf, Kosten

- **`docs/requirements.md`:** angelegt (Klasse M), bestätigt am 2026-09-26.
- **Schutzbedarf:** [TBD nach Modus 2 Schritt 4a]
- **Kostenrahmen:** siehe Abschnitt 8.

### Methodik-Schwellenwerte

- **Reaktiv-ADR-Schwellenwert:** maximal 30 % `[REAKTIV]`-Anteil über die letzten 10 ADRs (Klasse M). Bei Überschreitung legt die KI einen Reflexions-Schritt im Fahrplan an, bevor weitere Umsetzungsschritte beginnen.
- **Wucherungs-Schwelle** (`CLAUDE.md` Abschnitt 8, Kriterium 9): Faktor 2 gegenüber dem ursprünglichen Schrittplan **und** mindestens 5 zusätzliche Schritte (Default).
- **Modellklassen-Zuordnung** (Regelwerk: `CLAUDE.md` Abschnitt 0, „Modellklassen-Disziplin"):
  - **Mechanik-Klasse:** Claude Haiku 4.5 – Probelauf: offen (für dieses Projekt nicht erprobt; bis dahin übernimmt die Routine-Klasse)
  - **Routine-Klasse:** Claude Sonnet 5 – Probelauf: offen (bis dahin übernimmt die Entscheidungs-Klasse)
  - **Entscheidungs-Klasse:** Claude Opus, aktuelle Linie (Stand 2026-09-26: Opus 5.5) – stärkstes regulär eingesetztes Modell
  - **Ausnahme-Klasse:** Claude Fable 5.1 – nur auf Vorschlag mit Freigabe
  - **Bezugsmodell und knappe Ressource:** [TBD nach Modus 2 Schritt 4a – Frage „Über welches Konto arbeitet die KI, und wann setzt sich ihr Nutzungskontingent zurück?"; Sitzungsabfrage vom 2026-09-26 meldet ein Wochenlimit mit Zurücksetzung So 10:00 (MESZ)]
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
- **Naming-Konvention:** camelCase für Variablen und Funktionen, PascalCase für Typen, Klassen und React-Komponenten

#### Markdown

- **Linter:** `markdownlint-cli2` mit `.markdownlint-cli2.jsonc` (MD013 und MD060 deaktiviert)
- **Übrige Kategorien:** nicht anwendbar, Begründung: Dokumentation, kein ausführbarer Code

### Warnungs-Bestand

Kein Bestand – Default „Warnungen sind Fehler".

**Warnungsquellen ohne Schalter:** Hinweise der CI-Plattform zu Action-Versionen; Bündelgrößen-Warnungen von Vite.

### Durchsetzungsmechanismen

- **Pre-Commit-Hook-Framework:** `pre-commit`
- **Konfigurationsdatei:** `.pre-commit-config.yaml`
- **CI-Plattform:** GitHub Actions
- **Workflow-Dateien:** `.github/workflows/ci.yml` mit allen Pflicht-Gates für Python und TypeScript (Klasse M)
- **Trigger:** `push` auf alle Branches und `pull_request` auf `main`
- **Verpflichtende CI-Gates (Merge-Block bei Rot):** Lint, Format-Check, Type-Check, Security-Scan, Dependency-Audit (Schwellenwert high), Tests inklusive Coverage-Mindestwert
- **Branch-Protection auf Hauptbranch:** alle Pflicht-Gates müssen grün sein; Force-Push gesperrt; siehe Abschnitt 10

### Coverage-Mindestwerte

- **Globaler Mindestwert:** 80 % Lines, 70 % Branches (Default der Vorlage)
- **Kritische Pfade (höhere Anforderung):** Kontext-Zusammenstellung und Kanon-Verwaltung 90 % Lines – dort entstehen Kanon-Widersprüche und Kosten (FR-010, FR-011)
- **Ausnahmen:** keine

### Commit-Lint

- **Tool:** nicht aktiv, Begründung: Commit-Format nach `CLAUDE.md` Abschnitt 11 wird von der KI eingehalten; ein zusätzliches Werkzeug bringt bei einem einzelnen Beitragenden keinen Mehrwert.

### Editor-Integration (empfohlen, nicht erzwungen)

- **EditorConfig:** `.editorconfig` im Repo-Root (LF, UTF-8, Einrückung 4 Leerzeichen für Python, 2 für TypeScript)

<!-- ANCHOR:betrieb-und-deployment -->
## 8. Betrieb und Deployment

- **Deployment-Ziel:** [TBD nach Modus 2 Schritt 4a]
- **CI/CD:** GitHub Actions, `.github/workflows/ci.yml`. Deployment-Workflow: [TBD nach Modus 2 Schritt 4a]
- **Umgebungen:** lokal (Cloud-Session des Coding-Agents) → [TBD nach Modus 2 Schritt 4a]
- **Monitoring:** [TBD nach Modus 2 Schritt 4a]
- **Logging-Level Default:** `INFO` im Betrieb, `DEBUG` nur lokal; keine Inhalte aus Welten oder Manuskripten (Abschnitt 6)
- **Vertretung:** [TBD nach Modus 2 Schritt 4a]
- **Notfall-Handbuch:** `docs/onboarding-runbook.md` Abschnitt „Notfall" – [TBD, anzulegen vor dem ersten öffentlichen Deployment]
- **KI im Betrieb:** [TBD nach Modus 2 Schritt 4a]
- **Zugriff der KI auf die Produktion:** [TBD nach Modus 2 Schritt 4a]
- **Unbeaufsichtigtes Handeln der KI:** nein

### Ablaufdaten-Register

| Was | Ablauf / Lebensende | Vorlauf | Quelle | Fahrplan-Schritt |
|---|---|---|---|---|
| Node.js 24 LTS (nur Build) | 2028-04-30 | 6 Monate | Node-Release-Plan `schedule.json` | [TBD in Modus 2 Schritt 6 – Wechsel auf Node 26 LTS frühestens 2026-11-05] |
| Python 3.14 | 2030-10 | 6 Monate | PEP 745 | – (Vorlauf nach Projektdauer) |
| httpx 0.28 – Python 3.14 nicht offiziell deklariert, Pflege schwach | Nachprüfung 2027-03-26 | – | PyPI, Stichprobe 2026-09-26 | [TBD in Modus 2 Schritt 6 – Test auf 3.14.7 im ersten Umsetzungsschritt] |
| TypeScript 7 – neue Linie, noch nicht reif | Nachprüfung 2027-01-08 | – | TypeScript-Devblog | [TBD in Modus 2 Schritt 6] |
| Wochenkontingent der KI | wöchentlich, So 10:00 (MESZ) | – | Sitzungsabfrage 2026-09-26 | – |

### Kosten

- **Kostenrahmen:** bis 50 € monatlich für KI-Anfragen und Hosting zusammen (Eigentümer, 2026-09-26). Das Abo für den Coding-Agent ist nicht Teil dieses Rahmens.
- **Kostenregister:** in dieser Tabelle

| Posten | Art (laufend / einmalig / KI-Verbrauch) | Betrag je Monat | Stand vom | Entscheidung nötig ab |
|---|---|---|---|---|
| KI-Anfragen über OpenRouter | KI-Verbrauch | [TBD nach Modus 2 Schritt 4 – Schätzung aus Token-Budget und Modellpreis] | 2026-09-26 | Summe über 50 € |
| Hosting | laufend | [TBD nach Modus 2 Schritt 4a] | 2026-09-26 | Summe über 50 € |

<!-- ANCHOR:entscheidungsbefugnisse -->
## 9. Entscheidungsbefugnisse

- **Freigabe-Entscheidungen trifft:** der Repo-Eigentümer (Paddel87).
- **Kommunikationskanal für Freigaben:** direkt im Chat mit dem Coding-Agent; Ergebnis als ADR in `docs/decisions.md`.
- **Reaktionszeit-Erwartung:** asynchron, keine harte Antwortzeit.

<!-- ANCHOR:repository-regeln -->
## 10. Repository-Regeln

- **Hauptbranch:** `main`
- **Push-Regel:** Änderungen laufen über Pull Requests; Agent-Sessions arbeiten auf `claude/<thema>`-Branches.
- **Schutzregeln:** keine Force-Pushes auf `main`; Merge nur bei grüner CI.

<!-- ANCHOR:offene-grundsatzfragen -->
## 11. Offene Grundsatzfragen

- **Codesprache und Projektlizenz** – offen bis Modus 2 Schritt 2 (Frage an den Eigentümer).

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
