# Skriptorium

![Status](https://img.shields.io/badge/status-In%20Entwicklung-yellow)
![Version](https://img.shields.io/badge/version-v0.1.0-blue)
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

- **Projektphase:** Phase 5 – Alltagstauglichkeit und Soll-Anforderungen (Umsetzung), begonnen 2026-10-08 (ADR-042: gezielt umbauen). Fortschritt: ✅ 7 von 21 Schritten erledigt, 🟠 2 in Arbeit, ⚪ 12 offen – Übersicht mit Ampel im [Fahrplan](docs/fahrplan.md#übersicht). Seit 2026-09-30 öffentlich unter HTTPS mit Passwortschutz auf dem netcup-VPS, tägliche Sicherung mit erprobter Wiederherstellung (Phase 4)
- **Version:** v0.1.0 – Vorabversion (ADR-043); Go-Live erst vor v1.0.0 (Schritt 5.14)
- **Status:** In Entwicklung
- **Letzte Änderung:** 2026-10-08
- **Architektur-Reife:** Module, Schnittstellen, Datenmodell und Token-Budget BELASTBAR (ADR-013); Reaktionszeit BELASTBAR (Zielwerte nach Messung D.6 angepasst, ADR-035); Kanon-Treue BELASTBAR (erstes echtes Kapitel des Eigentümers in 4.8: 0 Widersprüche, mit qwen3.8-max); Sicherheitsniveau und Schutzbedarf BELASTBAR (ADR-006, ADR-007); Observability BELASTBAR (Log-Zeile und Monatskosten, ADR-021, ADR-023); Bedrohungsmodell BELASTBAR (Prüfung 4.5); Host BELASTBAR (4.2); Netz BELASTBAR (Prüfungen von außen, 4.7); Backups BELASTBAR (4.3); Secrets im Betrieb VORLÄUFIG (Gate 4.6, BELASTBAR mit D.11)
- **Aktive Blocker:** 0

## Quick Start

Stand 2026-10-09 (Phase 5): Server mit Anmeldung und Oberfläche für Welten, Kanon, Import und Geschichten; Aufbau wie ein Chat mit Leiste links und eigener Adresse je Ansicht; Schreiben mit KI (Figuren-Schreibweise, `@`-Menü, wählbare Länge, Kapitel-Kurzfassungen, Gast-Figuren aus anderen Welten) mit `OPENROUTER_API_KEY`; markierte Textstellen in den Kanon übernehmen; Modell je Geschichte, Kosten je Anfrage und Monat; Hell- und Dunkelmodus.

### Voraussetzungen

- Python 3.14.7 mit uv 0.12.19
- Node.js 24.21.0 LTS mit npm 11.19.0 (nur zum Bauen und Prüfen der Oberfläche)
- git; für Sessions des Coding-Agents (Cloud-Session unter Linux, lokal auf macOS arm64) richtet `scripts/session-start.sh` alles ein (SessionStart-Hook)
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

Oberfläche bauen (`npx vite build`) und Server starten; dann `http://localhost:8000` im Browser öffnen (ohne TLS nur über `localhost`, weil das Sitzungs-Cookie `Secure` verlangt). Mit dem Einrichtungscode ein Passwort festlegen, anmelden, Welt anlegen.

- **Links:** eine schmale Symbolleiste (Liste, Welten, Kanon, Import, Darstellung, Konto, Abmelden) und daneben die einklappbare Liste mit allen Welten, ihren Geschichten und den Kapiteln der offenen Geschichte, mit Suche und „+ Kapitel“, „+ Geschichte“, „+ Welt“. Am Smartphone öffnet „☰“ beides als Menü. Jede Ansicht hat eine eigene Adresse: Neuladen, Zurück und Lesezeichen bleiben an der Stelle.
- **Welt:** Bereiche für Geschichten, Kanon-Einträge je Kategorie, Markdown-Import mit Vorschau und die Beschreibung der Welt. Passwort ändern und Sitzungen beenden unter „Konto“; „Darstellung“ wechselt zwischen wie das Gerät, hell und dunkel.
- **Schreibseite einer Geschichte:** aufgebaut wie ein Chat – das Manuskript scrollt, ein langes Kapitel öffnet am Textende, die Anweisung steht fest unten („/“ springt hinein). Oben Kapiteltitel und Speichern. „Kanon & Geschichte“ öffnet rechts eine Leiste mit dem Kanon zum Nachschlagen (Suche über Name und Alias) und den Einstellungen der Geschichte: Figuren-Schreibweise, Gäste aus anderen Welten (nur für diese Geschichte), Fakten dieser Geschichte, Gesamtzusammenfassung.
- **Figuren-Schreibweise:** als Kurzzeile über der Anweisung (Perspektive, selbst geführte Figuren, „ändern“). Für die selbst geführten Figuren schreibt die KI keine Handlung, Rede oder Gedanken; beschreibt die Anweisung, was sie tun oder sagen, schreibt die KI genau das aus.
- **Schreiben mit KI** (mit `OPENROUTER_API_KEY`): eine Anweisung geben oder eine neue Szene mit Ort, Figuren und Ziel beginnen; Länge kurz, mittel oder lang. Der Vorschlag erscheint fortlaufend am Textende wie eine Chat-Antwort und lässt sich übernehmen (ans Kapitelende), ändern, verwerfen, abbrechen oder mit einem anderen Modell neu schreiben. Leer „Weiterschreiben“ schreibt nur den nächsten Moment.
- **`@` in der Anweisung:** öffnet eine Auswahl der Kanon-Einträge; die gewählten Einträge sind im Feld hervorgehoben und gehen der KI vollständig mit, nach der Auswahl folgt von selbst ein Leerzeichen.
- **Kapitel abschließen:** Die KI erstellt eine Kurzfassung und schreibt die Gesamtzusammenfassung fort; beide lassen sich ansehen und ändern.
- **In den Kanon:** Eine markierte Stelle wird zum neuen Eintrag oder ergänzt einen Eintrag – im Kanon der Welt oder nur für diese Geschichte.
- **Modell und Kosten:** Das Modell wählst du unten neben der Anweisung (voreingestellt grok-4.6), die Geschichte merkt es sich. Unter jedem Vorschlag stehen Token und Kosten, unter „Konto“ die KI-Kosten des laufenden Monats.

## Nächste Schritte

- 🟠 **5.11, 5.19:** Aufbau wie ein Chat (Teil 2) und Dunkelmodus eingespielt, warten auf Prüfung; danach Kanon-Seite mit Suche (Teil 3).
- ⚪ **5.2, 5.21:** Bedienung am Smartphone prüfen und anpassen; als App installierbar (PWA) mit voller Bildschirmgröße.
- ⚪ **5.20, 5.16:** schnell angelegte Kapitel; herangezogene Kanon-Einträge anklickbar.
- ⚪ **D.11:** Zugangsdaten der Sicherung außerhalb des Servers ablegen (spätestens 2026-10-31).

Ergebnisse der Erkundung: [Modell-Eignungstest](docs/research/modell-eignungstest.md) – damals Startmodell grok-4.7, Zweitmodell grok-4.6; seit 5.7 ist grok-4.6 voreingestellt (ADR-044).

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
| [`docs/import-prompts.md`](docs/import-prompts.md) | Prompts, mit denen eine KI vorhandenes Welt-Material oder einen bestehenden Chat ins Import-Format bringt |
| [`CHANGELOG.md`](CHANGELOG.md) | Versionshistorie |

## Lizenz

GNU Affero General Public License v3.0 (AGPL-3.0) – siehe [`LICENSE`](LICENSE) und ADR-005.
