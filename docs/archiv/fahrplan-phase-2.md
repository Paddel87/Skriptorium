# Archiv – Fahrplan Phase 2

<!-- Quelle: docs/fahrplan.md, Abschnitt „Aktuelle Phasen". Ausgelagert am 2026-09-26 (CLAUDE.md Abschnitt 14:
     Phase vollständig erledigt). Abgedeckter Zeitraum: 2026-09-26 (Beginn und Abschluss der Phase). -->

## Phase 2: Grundgerüst – Typ: UMSETZUNG

**Ziel:** Ein lauffähiges, angemeldetes Skriptorium ohne KI: Welten, Kanon und Geschichten lassen sich über die Oberfläche anlegen und pflegen; bestehendes Welt-Material ist importierbar; alle CI-Gates sind aktiv.

**Abschlusskriterium:** Schritte 2.1–2.7 `[ERLEDIGT]` mit voller Definition of Done; FR-002, FR-005, FR-007, FR-016 umgesetzt.

**Reifegrad-Erwartung am Phasenende:** `storage`, `canon`, `manuscript`, `api`, `ui` durch Umsetzung validiert `[BELASTBAR]`; Kommunikations-Grundmodus (HTTP/JSON) `[BELASTBAR]`.

**Ursprünglicher Schrittplan:** 7 Schritte, festgehalten am 2026-09-26 – wird nicht still hochgesetzt (CLAUDE.md Abschnitt 8, Kriterium 9)

**Pflichtfrage am Phasenende:** ADR-020 – weiterbauen (2026-09-26)

### 2.1: Projektgerüst und volle CI-Gates

- **Status:** ERLEDIGT (2026-09-26; ADR-015) – Pre-Commit und CI-Lauf 56 mit allen Gates grün, Coverage Python 100 % (1 Test), Oberfläche 100 % (2 Tests), Onboarding gegen frischen Worktree validiert (Logbuch 18:10)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 1.4
- **Freigabepflichtig:** ja – Pin der Entwicklungswerkzeuge (Kategorie 3) und Aktivierung der CI-Gates (Kategorie 7)
- **Empfohlene Klasse:** Entscheidung – Entwicklungswerkzeuge und Pipeline-Änderungen brauchen `ENTSCHEIDUNG ERFORDERLICH` (Eskalations-Auslöser 1).
- **Eingangskriterien:** Architektur-Bestandteile nach 1.4 `[BELASTBAR]`; CI- und Hook-Skelett aus Modus 2 Schritt 10 vorhanden
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** `pyproject.toml` (uv) und `package.json` (npm) mit den fixierten Versionen aus `docs/project-context.md` Abschnitt 3 anlegen; Entwicklungswerkzeuge aus Abschnitt 7 gegen offizielle Quellen verifizieren und pinnen (Regel-001); alle Pflicht-Gates in `.github/workflows/ci.yml` und `.pre-commit-config.yaml` für Python und TypeScript scharf schalten; Gesundheitsprüfung als erster Endpunkt.
- **Akzeptanzkriterien:** Frischer Klon → Installationsbefehle aus der README → Gesundheitsprüfung antwortet; Pre-Commit und CI laufen mit allen Gates grün; keine Warnung über dem Warnungs-Bestand.
- **Betroffene Module:** keine Fachmodule (Projektgerüst, CI)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** `pyproject.toml`, `package.json`, Lock-Dateien, CI- und Hook-Konfiguration, README-Quick-Start, `docs/onboarding-runbook.md`
- **Notizen:** Quick-Start-relevant – Onboarding-Pfad gegen frischen Worktree validieren (CLAUDE.md Abschnitt 17). Zusatz 2026-09-26 (Befund aus 1.1): In der Cloud-Session ist der `pre-commit`-Hook nicht installiert; 2.1 sorgt dafür, dass er zu Sessionbeginn installiert wird (z. B. SessionStart-Hook), sonst greift „Pre-Commit-Hook war aktiv" der Definition of Done nicht. Zusatz 2026-09-26 (Befund aus 1.3): Die Cloud-Umgebung setzt `UV_NATIVE_TLS`, das uv 0.12 als abgekündigt meldet (Ersatz `UV_SYSTEM_CERTS`); bei der Einrichtung der Projekt-Werkzeuge prüfen, ob die Warnung in CI oder Pre-Commit auftaucht, und dann Umgebung bzw. Warnungs-Bestand anpassen.

### 2.2: storage – Dateiablage und Suchindex

- **Status:** ERLEDIGT (2026-09-26; ADR-016) – Abnahme durch Tests belegt: atomares Schreiben (Abbruch bei `os.replace` und `fsync`), Neuaufbau ergibt denselben Suchstand, Index ohne Inhalt außerhalb der Dateien; 59 Tests, Coverage `storage` 100 % (Zeilen und Zweige)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 2.1
- **Freigabepflichtig:** ja – YAML-Parser für den Dateikopf ist eine neue externe Abhängigkeit (Kategorie 3)
- **Empfohlene Klasse:** Entscheidung – Freigabe des YAML-Parsers (Eskalations-Auslöser 1); die übrige Umsetzung ist Routine-Arbeit.
- **Eingangskriterien:** `storage`, `DocumentStore` und Datenmodell `[BELASTBAR]`
- **Anforderungen (ab Klasse M):** keine (Grundlage für FR-001 und FR-020)
- **Zu tun:** `DocumentStore` umsetzen: Lesen und atomares Schreiben von Markdown-Dateien mit YAML-Kopf im Datenverzeichnis, SQLite-Index (Namen, Aliasse, Volltext), vollständiger Neuaufbau des Index aus den Dateien.
- **Akzeptanzkriterien:** Tests belegen atomares Schreiben (kein halb geschriebener Stand nach Abbruch), Neuaufbau des Index aus den Dateien ergibt denselben Suchstand, Index enthält nichts, was nicht aus den Dateien kommt; Coverage ≥ 80 % Lines.
- **Betroffene Module:** storage
- **Reifegrad-Wirkung:** `storage` → `[BELASTBAR]` durch Umsetzung
- **Artefakte:** Code, Tests, ADR zum YAML-Parser
- **Notizen:** –

### 2.3: canon – Welten und Kanon-Einträge

- **Status:** ERLEDIGT (2026-09-26) – je Kategorie anlegen, ändern, löschen (FR-002), Figur mit allen Fakten in weiterer Geschichte (FR-016), Welten getrennt; 38 Tests, Coverage `canon` 100 % (kritischer Pfad ≥ 90 %)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 2.2
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – klar spezifizierte Umsetzung auf belastbarer Architektur ohne Eskalations-Auslöser.
- **Eingangskriterien:** `canon`, `CanonService` `[BELASTBAR]`
- **Anforderungen (ab Klasse M):** FR-002, FR-016
- **Zu tun:** `CanonService`: Welten anlegen und trennen; Kanon-Einträge der Kategorien Figur, Ort/Geografie, Gegenstand (mit Zweck, Verwendung, Auswirkung), Zeitlinie (geordnete Ereignisse), Regel, Kultur anlegen, ändern, löschen, finden; Aliasse.
- **Akzeptanzkriterien:** Je Kategorie ein Eintrag anlegbar, änderbar, löschbar (FR-002); eine Figur ist in einer zweiten Geschichte derselben Welt mit allen Fakten verfügbar (FR-016); Einträge verschiedener Welten sind in Abfragen getrennt; Coverage ≥ 90 % Lines (kritischer Pfad).
- **Betroffene Module:** canon
- **Reifegrad-Wirkung:** `canon` → `[BELASTBAR]` durch Umsetzung
- **Artefakte:** Code, Tests
- **Notizen:** Grundlage für FR-001, FR-003 und FR-004, die in 3.2 abgeschlossen werden (Wirkung auf den KI-Kontext). „Änderung ist in der nächsten KI-Anfrage wirksam" (FR-002) wird in 3.2 mitgeprüft.

### 2.4: canon – Import von Welt-Material

- **Status:** ERLEDIGT (2026-09-26) – Aufteilungsregeln vom Eigentümer bestätigt; importierte Welt als Kanon nutzbar (Test); Importzeit für 20 Seiten (über 10.000 Wörter, 100 Einträge) 0,3 s – der 30-Minuten-Rahmen hängt damit an der Zuordnung durch den Autor (4.8); 23 Tests, Coverage `canon` 100 %
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 1.2, 2.3
- **Freigabepflichtig:** nein (Format in 1.2 freigegeben)
- **Empfohlene Klasse:** Routine – Umsetzung eines in 1.2 festgelegten Formats.
- **Eingangskriterien:** Importformat per ADR aus 1.2 festgelegt (ADR-012: Markdown)
- **Anforderungen (ab Klasse M):** FR-005
- **Zu tun:** `canon.importers` mit einem Markdown-Importer (ADR-012): Welt-Material als Markdown-Datei oder eingefügter Text; Aufteilung in Kanon-Einträge und Zuordnung zu Kategorien festlegen, dem Eigentümer zeigen, umsetzen. TypingMind- und Notion-Importer folgen in V.4 und V.5.
- **Akzeptanzkriterien:** Eine Welt aus Markdown ist nach dem Import als Kanon nutzbar; Importzeit für Welt-Material mit zweistelliger Seitenzahl gemessen und gegen den 30-Minuten-Rahmen (FR-022) gestellt; Tests mit erfundenen Beispieldaten (z. B. Testwelt „Die Salzmark").
- **Betroffene Module:** canon
- **Reifegrad-Wirkung:** `canon.importers` → `[BELASTBAR]`
- **Artefakte:** Code, Tests
- **Notizen:** –

### 2.5: manuscript – Geschichten und Kapitel

- **Status:** ERLEDIGT (2026-09-26) – je Form eine Geschichte anlegbar, Romane in Kapitel gegliedert (FR-007); Felder für Figuren-Schreibweise, Kurzfassungen, Gast-Verbindungen und geschichtenbezogene Fakten angelegt; 30 Tests, Coverage `manuscript` 100 %
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 2.2
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – klar spezifizierte Umsetzung ohne Eskalations-Auslöser.
- **Eingangskriterien:** `manuscript`, `ManuscriptService` `[BELASTBAR]`
- **Anforderungen (ab Klasse M):** FR-007
- **Zu tun:** `ManuscriptService`: Geschichten je Welt in den Formen Roman (mit Kapiteln), Kurzgeschichte, Fragment; Manuskript-Text speichern; Felder für Figuren-Schreibweise, Kurzfassungen, Gast-Verbindungen und geschichtenbezogene Fakten gemäß Datenmodell anlegen (Funktion folgt in Phase 3).
- **Akzeptanzkriterien:** Je Form eine Geschichte anlegbar, Romane in Kapitel gliederbar (FR-007); Coverage ≥ 80 % Lines.
- **Betroffene Module:** manuscript
- **Reifegrad-Wirkung:** `manuscript` → `[BELASTBAR]` durch Umsetzung
- **Artefakte:** Code, Tests
- **Notizen:** –

### 2.6: api – HTTP-Schnittstelle mit Anmeldung

- **Status:** ERLEDIGT (2026-09-26; ADR-017, ADR-018) – alle 32 geschützten Endpunkte lehnen ohne Sitzung ab (Test je Endpunkt), jede Maßnahme nennt ihre ASVS-Anforderung (ADR-017, Code-Kommentare); Prüfung durch getrennte Instanz mit zwei Nachprüfungen, Befunde behoben oder entschieden (Logbuch 19:58); 224 Tests, Coverage `api` 99 %, gesamt 99 %; Onboarding gegen frischen Worktree validiert
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 2.3, 2.5
- **Freigabepflichtig:** ja – Authentifizierung und Sitzung (Kategorie 6); ggf. Bibliothek für Passwort-Hashing (Kategorie 3)
- **Empfohlene Klasse:** Entscheidung – Authentifizierungslogik ist freigabepflichtig (Eskalations-Auslöser 1).
- **Eingangskriterien:** `api` und HTTP-API `[BELASTBAR]`; Sicherheitsniveau per ADR-006
- **Anforderungen (ab Klasse M):** keine (Sicherheitsanforderungen aus ADR-006)
- **Zu tun:** FastAPI-Schicht über `canon` und `manuscript`; Anmeldung mit Passwort und Sitzungs-Cookie (`HttpOnly`, `Secure`, `SameSite=Strict`) nach ASVS 5.0.0 L2 für Authentifizierung und Sitzung; Sperre bzw. Verzögerung nach Fehlversuchen; Herkunftsprüfung bei ändernden Anfragen; Logs nur mit Metadaten; Auslieferung der gebauten Oberfläche.
- **Akzeptanzkriterien:** Alle Endpunkte außer Gesundheitsprüfung und Anmeldung lehnen Anfragen ohne gültige Sitzung ab (Test je Endpunkt); jede Maßnahme nennt ihre ASVS-Anforderung; Prüfung durch eine getrennte Instanz erfolgt (Definition of Done, Kategorie 6).
- **Betroffene Module:** api
- **Reifegrad-Wirkung:** `api` → `[BELASTBAR]` durch Umsetzung
- **Artefakte:** Code, Tests, ADR zu Passwort-Hashing und Sitzung (ADR-017, ADR-018)
- **Notizen:** Zusatz 2026-09-26 (ADR-017): Umfang erweitert um Einrichtung per Code, Passwort ändern mit Prüfung gegen Pwned Passwords und Kontextwörter, Sitzungsübersicht mit Beenden, Anmelde-Protokoll; die Oberfläche dazu folgt in 2.7.

### 2.7: ui – Editor und Kanon-Pflege

- **Status:** ERLEDIGT (2026-09-26; ADR-019) – Abläufe aus 2.3–2.5 über die Oberfläche durchführbar: 32 Komponenten-Tests (Coverage 99 % Zeilen, 96 % Zweige) und 4 End-to-End-Tests in Chromium gegen den echten Server; ESLint ohne Warnungen; Darstellung ohne ungefiltertes HTML (ESLint-Regel), CSP im gebauten `index.html` (per Browser-Probe wirksam); Sicherheitsprüfung durch getrennte Instanz (Logbuch 20:48); Onboarding gegen frischen Worktree validiert
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 2.6
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Umsetzung mit fixierten Bausteinen (React, CodeMirror 6) ohne Eskalations-Auslöser.
- **Eingangskriterien:** `ui` `[BELASTBAR]`
- **Anforderungen (ab Klasse M):** keine (Oberfläche für FR-002, FR-005, FR-007)
- **Zu tun:** Anmeldung, Welt wählen, Kanon-Einträge pflegen (inkl. Zeitlinie in Reihenfolge), Import anstoßen, Geschichten und Kapitel anlegen, Markdown-Editor (CodeMirror 6) für das Manuskript; Darstellung ohne ungefiltertes HTML, Content-Security-Policy.
- **Akzeptanzkriterien:** Die Abläufe aus 2.3–2.5 sind über die Oberfläche durchführbar (Komponenten- und End-to-End-Tests); ESLint ohne Warnungen; Coverage ≥ 80 % Lines.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** `ui` → `[BELASTBAR]` durch Umsetzung
- **Artefakte:** Code, Tests
- **Notizen:** Zusatz 2026-09-26 (ADR-017): Einrichtung mit Code, Anmeldung, Passwort ändern (mit Hinweis „Prüfung durch Have I Been Pwned" als Namensnennung nach CC BY 4.0, Eingabefeld `type=password`, Einfügen und Passwort-Manager erlaubt – ASVS 6.2.6, 6.2.7), Sitzungsübersicht mit Beenden und Abmelden auf jeder Seite (7.4.4, 7.5.2). Zusatz 2026-09-26 (ADR-016): Beim Bearbeiten in der Oberfläche darauf hinweisen, dass Kommentare im Dateikopf beim Speichern nicht erhalten bleiben (PyYAML).
