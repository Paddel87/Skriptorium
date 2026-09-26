# Changelog

Alle nutzerrelevanten Änderungen werden hier festgehalten. Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionierung nach [SemVer](https://semver.org/lang/de/).

## [Unreleased]

### Hinzugefügt

- Anmeldung und HTTP-Schnittstelle (2026-09-26, Schritt 2.6, ADR-017): Passwort selbst wählen über einen einmaligen Einrichtungscode (`skriptorium-einrichtung`), Prüfung gegen Pwned Passwords von Have I Been Pwned, Sitzungen mit Übersicht und Beenden, Sperre nach Fehlversuchen; Endpunkte für Welten, Kanon-Einträge, Suche, Markdown-Import, Geschichten, Kapitel, Gast-Verbindungen und Fakten. Neue Umgebungsvariable `SKRIPTORIUM_DATA_DIR`.
- Projektgerüst (2026-09-26, Schritt 2.1): Python-Server mit Gesundheitsprüfung `/api/health`, Oberflächen-Gerüst (React, Vite), alle Prüf-Gates in Pre-Commit und CI, Einrichtung von Cloud-Sessions per `scripts/session-start.sh`.
- Projektinitialisierung (2026-09-26): Vision, Anforderungen, Stack, Architektur, Entscheidungen (ADR-001 bis ADR-009) und Fahrplan. Noch kein lauffähiger Code.
