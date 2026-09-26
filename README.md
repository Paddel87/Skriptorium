# Skriptorium

![Status](https://img.shields.io/badge/status-Konzeption-lightgrey)
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

- **Projektphase:** Phase 1 – Erkundung (seit 2026-09-26); Schritt 1.1 Modell-Eignungstest in Arbeit
- **Version:** v0.0.0 – noch keine lauffähige Version
- **Status:** Konzeption
- **Letzte Änderung:** 2026-09-26
- **Architektur-Reife:** Architektur-Pattern, Sicherheitsniveau und Schutzbedarf BELASTBAR (ADR-003, ADR-006, ADR-007); alle Module VORLÄUFIG, Beförderung nach Phase 1 (Schritt 1.4); Host, Secrets im Betrieb und Backups OFFEN bis Phase 4
- **Aktive Blocker:** 0

## Quick Start

Noch nicht verfügbar – es gibt noch keinen lauffähigen Code. Der Quick Start entsteht mit Fahrplan-Schritt 2.1 (Projektgerüst).

### Voraussetzungen (geplant)

- Python 3.14 mit uv 0.12
- Node.js 24 LTS mit npm 11 (nur zum Bauen der Oberfläche)
- ein OpenRouter-API-Schlüssel

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

- **1.1 Modell-Eignungstest:** Vergleich von 4 Modellen und 3 Budgets liegt vor ([Zwischenstand](docs/research/modell-eignungstest.md)); offen sind Filter-Probe und Festlegung von Startmodell und Budget.
- **1.2 Import-Klärung:** echte Exporte aus TypingMind und Notion sichten und das Importformat festlegen.
- **1.3 Laufzeit-Prüfung:** httpx auf Python 3.14.7 testen.

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
