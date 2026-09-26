# Skriptorium

![Status](https://img.shields.io/badge/status-In%20Entwicklung-yellow)
![Version](https://img.shields.io/badge/version-v0.0.0-blue)
![Build](https://img.shields.io/github/actions/workflow/status/Paddel87/Skriptorium/ci.yml?branch=main)
![License](https://img.shields.io/badge/license-AGPL--3.0-blue)
![Python](https://img.shields.io/badge/python-3.14-blue)

> Schreibwerkstatt für einen Autor mit mehreren eigenen Welten: Der Kanon jeder Welt ist verbindlich, Autor und KI schreiben im Wechsel Prosa darin – ohne der Welt zu widersprechen.

## Über das Projekt

Das Skriptorium ist eine Web-App, in der ein Autor seine selbst entwickelten Welten als verbindlichen Kanon pflegt – Figuren, Orte, Gegenstände, Zeitlinie, Regeln, Kultur – und darin gemeinsam mit einer KI Romane, Kurzgeschichten und Fragmente schreibt. Kanon-Einträge lassen sich beim Schreiben per `@` gezielt ansprechen (z. B. `@Kael`); neue Fakten wandern mit einem Handgriff aus dem Text zurück in den Kanon.

**Was es löst:** Allgemeine KI-Assistenten halten den Kanon eigener Welten beim gemeinsamen Schreiben nicht zuverlässig ein, neue Fakten fließen nicht in den Kanon zurück, und bei langen Geschichten wird jede Anfrage teuer, weil der gesamte Verlauf mitgeschickt wird. Das Skriptorium stellt für jede KI-Anfrage nur den relevanten Kanon und einen verdichteten Handlungsstand zusammen.

**Für wen:** einen einzelnen Autor mit mehreren eigenen Welten, der ohne Programmierkenntnisse im Browser – auch am Smartphone – schreibt.

**Was es bewusst nicht ist:** kein Rollenspiel-Werkzeug (keine Würfel, Regeln, Spielleitung), keine Mehrnutzer-Plattform, keine weltübergreifende Multiversums-Verwaltung. Publizieren sowie Bilder und Karten sind nicht Teil der ersten Version.

## Aktueller Status

<!-- Synchronisiert mit docs/project-context.md Abschnitt 1, docs/fahrplan.md „Aktueller Stand",
     docs/architecture.md Abschnitt 9, docs/decisions.md Teil A und docs/blockers.md. -->

- **Projektphase:** Phase 2 – Grundgerüst (Umsetzung); Schritte 2.1 (Projektgerüst), 2.2 (Dateiablage und Suchindex), 2.3 (Welten und Kanon-Einträge), 2.4 (Markdown-Import) und 2.5 (Geschichten und Kapitel) umgesetzt und 2.6 (HTTP-Schnittstelle mit Anmeldung) umgesetzt
- **Version:** v0.0.0 – noch keine veröffentlichte Version
- **Status:** In Entwicklung
- **Letzte Änderung:** 2026-09-26
- **Architektur-Reife:** Module, Schnittstellen, Datenmodell, Token-Budget und Reaktionszeit BELASTBAR (ADR-013); Sicherheitsniveau und Schutzbedarf BELASTBAR (ADR-006, ADR-007); Observability und Bedrohungsmodell VORLÄUFIG; Host, Secrets im Betrieb und Backups OFFEN bis Phase 4
- **Aktive Blocker:** 0

## Quick Start

Stand nach Schritt 2.6: Server mit Anmeldung und HTTP-Schnittstelle für Welten, Kanon und Geschichten; noch ohne Oberfläche für diese Funktionen (2.7) und ohne KI.

### Voraussetzungen

- Python 3.14.7 mit uv 0.12.19
- Node.js 24.21.0 LTS mit npm 11.19.0 (nur zum Bauen und Prüfen der Oberfläche)
- git; für Cloud-Sessions des Coding-Agents richtet `scripts/session-start.sh` alles ein (SessionStart-Hook)
- Internetzugang zu `api.pwnedpasswords.com` beim Festlegen oder Ändern des Passworts
- ein OpenRouter-API-Schlüssel – erst ab Phase 3

### Einrichten und starten

```bash
uv python install 3.14.7
uv sync --frozen --python 3.14.7
npm ci
uv run pre-commit install
uv run skriptorium-einrichtung          # Einrichtungscode für das erste Passwort (einmal, 24 h)
uv run uvicorn skriptorium.api:create_app --factory --no-access-log
```

Datenverzeichnis über `SKRIPTORIUM_DATA_DIR` (Standard `./data`, siehe `.env.example`). Passwörter werden beim Festlegen gegen [Pwned Passwords](https://haveibeenpwned.com/Passwords) von Have I Been Pwned geprüft (Daten unter CC BY 4.0); nur die ersten 5 Zeichen des SHA-1-Hashes verlassen den Server.

Prüfen (zweites Terminal): `curl http://127.0.0.1:8000/api/health` → `{"status":"ok"}`. Tests: `uv run pytest --cov` und `npx vitest run --coverage`. Vollständige Anleitung: [`docs/onboarding-runbook.md`](docs/onboarding-runbook.md).

## Architektur (Überblick)

Modularer Monolith: ein Python-Server (FastAPI) liefert die React-Oberfläche aus. Welten und Texte liegen als Markdown-Dateien, SQLite dient als abgeleiteter Suchindex. Jede KI-Anfrage wird unter festem Token-Budget aus Regeln, Kanon-Ausschnitt, Kapitel-Kurzfassungen und den letzten Manuskript-Seiten zusammengestellt.

```text
Browser (ui) ──HTTP/SSE──> api ──> canon ─────┐
                           │ ├──> manuscript ─┼──> storage (Markdown + SQLite-Index)
                           │ ├──> context (liest canon + manuscript)
                           │ └──> ai_gateway ──HTTPS──> OpenRouter (weitere Anbieter später)
```

**Module:**

- **canon:** Welten, Kanon-Einträge, Import von Welt-Material
- **manuscript:** Geschichten, Kapitel, Kurzfassungen, Figuren-Schreibweise, Gast-Figuren
- **context:** Zusammenstellung jeder KI-Anfrage unter Token-Budget
- **ai_gateway:** einheitliche Anbieter-Schnittstelle, OpenRouter als erster Anbieter
- **storage:** Dateien und Suchindex
- **api:** HTTP-Schicht, Anmeldung, Ablauf-Steuerung
- **ui:** React-Oberfläche mit Markdown-Editor (CodeMirror 6)

→ Vollständige Architektur: [`docs/architecture.md`](docs/architecture.md)

## Verwendung

Noch nicht verfügbar. Geplante Hauptansichten: Welt wählen, Einstieg über neue Szene oder laufendes Manuskript, Editor mit `@`-Menü, Kanon-Pflege.

## Nächste Schritte

- **2.7 ui:** Anmeldung, Editor und Kanon-Pflege in der Oberfläche.
- **Phase 3:** Schreiben mit KI.

Ergebnisse der Erkundung: [Modell-Eignungstest](docs/research/modell-eignungstest.md) – Startmodell grok-4.7, Zweitmodell grok-4.6.

→ Vollständiger Fahrplan: [`docs/fahrplan.md`](docs/fahrplan.md)

## Mitwirken

Privates Einzelprojekt; die Umsetzung erfolgt durch einen KI-Coding-Agent nach dem Regelwerk in [`CLAUDE.md`](CLAUDE.md).

- **Branch-Konvention:** Agent-Sessions auf `claude/<thema>`; Merge nach `main` über Pull Request
- **Commit-Format:** `<bereich>: <kurze beschreibung im imperativ>` mit Fahrplan-Referenz (`CLAUDE.md` Abschnitt 11)
- **Code-Standards:** [`docs/project-context.md`](docs/project-context.md) Abschnitt 7

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [`docs/vision.md`](docs/vision.md) | Ursprüngliche Projektvision (eingefroren) |
| [`docs/requirements.md`](docs/requirements.md) | Anwendungsfälle und Anforderungen |
| [`docs/project-context.md`](docs/project-context.md) | Stack, Constraints, Qualitätsziele |
| [`docs/architecture.md`](docs/architecture.md) | Systemarchitektur, Module, Schnittstellen |
| [`docs/fahrplan.md`](docs/fahrplan.md) | Entwicklungsplan und Fortschritt |
| [`docs/decisions.md`](docs/decisions.md) | Entscheidungen (ADRs) |
| [`docs/blockers.md`](docs/blockers.md) | Aktive Blocker und gelöste Probleme |
| [`docs/logbuch.md`](docs/logbuch.md) | Chronologisches Arbeitsprotokoll |
| [`docs/research/`](docs/research/) | Bestandsprüfung, Versions-Verifikation, Modell-Eignungstest |
| [`CHANGELOG.md`](CHANGELOG.md) | Versionshistorie |

## Lizenz

GNU Affero General Public License v3.0 (AGPL-3.0) – siehe [`LICENSE`](LICENSE) und ADR-005.
