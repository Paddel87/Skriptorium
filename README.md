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

- **Projektphase:** Phase 3 – Schreiben mit KI (Umsetzung); 3.1 (Anbieter-Schnittstelle mit OpenRouter), 3.2 (Kontext-Zusammenstellung), 3.3 (Weiterschreiben mit KI), 3.4 (Figuren-Schreibweise), 3.5 (`@`-Menü), 3.6 (Kapitel-Kurzfassungen), 3.7 (Gast-Figuren), 3.8 (Fakt in den Kanon) und 3.9 (Modellwahl, Kosten) umgesetzt, nächster Schritt Phasenabschluss 3; Phase 2 – Grundgerüst abgeschlossen am 2026-09-26 (ADR-020: weiterbauen)
- **Version:** v0.0.0 – noch keine veröffentlichte Version
- **Status:** In Entwicklung
- **Letzte Änderung:** 2026-09-27
- **Architektur-Reife:** Module, Schnittstellen, Datenmodell und Token-Budget BELASTBAR (ADR-013); Reaktionszeit VORLÄUFIG (in 3.3 verfehlt, Erkundung D.6, ADR-022); Kanon-Treue VORLÄUFIG (erste Messung in 3.3); Sicherheitsniveau und Schutzbedarf BELASTBAR (ADR-006, ADR-007); Observability BELASTBAR (Log-Zeile und Monatskosten, ADR-021, ADR-023); Bedrohungsmodell VORLÄUFIG; Host, Secrets im Betrieb und Backups OFFEN bis Phase 4
- **Aktive Blocker:** 0

## Quick Start

Stand nach Schritt 3.9: Server mit Anmeldung und Oberfläche für Welten, Kanon, Import und Geschichten; Schreiben mit KI (Figuren-Schreibweise, `@`-Menü, Kapitel-Kurzfassungen, Gast-Figuren aus anderen Welten) mit `OPENROUTER_API_KEY`; markierte Textstellen in den Kanon übernehmen; Modell je Geschichte, Kosten je Anfrage und Monat.

### Voraussetzungen

- Python 3.14.7 mit uv 0.12.19
- Node.js 24.21.0 LTS mit npm 11.19.0 (nur zum Bauen und Prüfen der Oberfläche)
- git; für Cloud-Sessions des Coding-Agents richtet `scripts/session-start.sh` alles ein (SessionStart-Hook)
- Internetzugang zu `api.pwnedpasswords.com` beim Festlegen oder Ändern des Passworts
- ein OpenRouter-API-Schlüssel in `OPENROUTER_API_KEY` (siehe `.env.example`) – für KI-Anfragen ab Schritt 3.3; Tests laufen ohne Schlüssel

### Einrichten und starten

```bash
uv python install 3.14.7
uv sync --frozen --python 3.14.7
npm ci
uv run pre-commit install
uv run skriptorium-einrichtung          # Einrichtungscode für das erste Passwort (einmal, 24 h)
npx vite build                          # Oberfläche nach dist/ui bauen
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

Oberfläche bauen (`npx vite build`) und Server starten; dann `http://localhost:8000` im Browser öffnen (ohne TLS nur über `localhost`, weil das Sitzungs-Cookie `Secure` verlangt). Mit dem Einrichtungscode ein Passwort festlegen, anmelden, Welt anlegen. Verfügbar: Kanon-Einträge je Kategorie, Markdown-Import mit Vorschau, Geschichten und Kapitel mit Markdown-Editor, Passwort ändern und Sitzungen beenden unter „Konto“. Schreiben mit KI (mit `OPENROUTER_API_KEY`): unter dem Kapitel-Editor eine Anweisung geben oder eine neue Szene mit Ort, Figuren und Ziel beginnen; der Vorschlag erscheint fortlaufend und lässt sich übernehmen (ans Kapitelende), ändern, verwerfen, abbrechen oder mit einem anderen Modell neu schreiben. Unter „Figuren-Schreibweise“ je Geschichte Erzählperspektive und die selbst geführten Figuren festlegen; für sie schreibt die KI nur Wahrnehmung und hört auf, wo du weiterschreibst. In der Anweisung öffnet `@` eine Auswahl der Kanon-Einträge der Welt; per `@Name` genannte Einträge gibt das Skriptorium der KI vollständig mit. „Kapitel abschließen“ lässt die KI eine Kurzfassung erstellen und die Gesamtzusammenfassung fortschreiben; beide lassen sich ansehen und ändern. Unter „Gäste aus anderen Welten“ bindet eine Geschichte Einträge anderer Welten ein – nur für diese Geschichte; Gäste stehen im `@`-Menü, in der neuen Szene und in der Figuren-Schreibweise zur Wahl. Die KI kennt einen Gast mit seinem Eintrag und seiner Herkunft, wenn er genannt oder selbst geführt wird, sonst nur, wenn nach dem Kanon der Welt Platz ist; die Regeln seiner Heimatwelt gelten nicht. Eine im Manuskript markierte Stelle übernimmt „In den Kanon“ als neuen Eintrag oder als Ergänzung eines Eintrags – in den Kanon oder nur für diese Geschichte (Liste unter „Fakten dieser Geschichte“). Das Modell wählst du im Schreib-Bereich; die Geschichte merkt es sich. Unter jedem Vorschlag stehen Token und Kosten, unter „Konto“ die KI-Kosten des laufenden Monats.

## Nächste Schritte

- **Phasenabschluss 3:** Bewertung „weiterbauen, umbauen oder neu aufsetzen“ durch eine getrennte Instanz, Abgleich mit der Vision.
- **D.6:** Wartezeit bis zum ersten KI-Satz erkunden (vor 4.8).

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
