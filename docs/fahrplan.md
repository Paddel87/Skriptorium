# Fahrplan

<!-- Zentrales Arbeitsdokument. Wird vor jeder Änderung gelesen (CLAUDE.md Abschnitt 2)
     und nach jedem Arbeitsschritt sowie zu Sessionende aktualisiert (Abschnitt 12).
     Phasen sind nach Typ klassifiziert (Erkundung / Umsetzung / Stabilisierung),
     weil iterative Entwicklung unterschiedliche Erfolgskriterien pro Phasentyp braucht. -->

<!-- ANCHOR:aktueller-stand -->
## Aktueller Stand

- **Stand vom:** 2026-09-26
- **Laufende Phase:** Phase 2 „Grundgerüst" – 2.1 bis 2.5 erledigt (2026-09-26), offen 2.6 und 2.7
- **Phasentyp:** UMSETZUNG
- **Aktiver Schritt:** 2.6 `[IN ARBEIT]` (ADR-017, ADR-018)
- **Nächster Schritt:** 2.6 (api – HTTP-Schnittstelle mit Anmeldung) – beginnt mit `ENTSCHEIDUNG ERFORDERLICH` (Authentifizierung, Kategorie 6)
- **Offene STOPP-Situationen:** keine

<!-- ANCHOR:phasen-typen -->
## Phasen-Typen

Jede Phase ist genau einem Typ zugeordnet. Der Typ bestimmt das Akzeptanzformat der Schritte.

### ERKUNDUNG

**Zweck:** Erkenntnis gewinnen. Klärung architektonischer Unsicherheiten, Validierung von Annahmen, Reduktion von Risiken vor Umsetzung.

**Charakteristika:**

- Akzeptanzkriterien sind **wissensbasiert**: „Wir verstehen X", „Wir können Y entscheiden", „Annahme Z ist validiert oder widerlegt".
- Output ist primär Erkenntnis, sekundär Code. Code in Erkundungsphasen ist explizit „Wegwerf-Code" oder Spike, sofern nicht anders gekennzeichnet.
- Architektur-Bestandteile werden während der Phase oft von `[OFFEN]` auf `[VORLÄUFIG]` befördert.
- Definition of Done ist reduziert: kein Coverage-Mindestwert, keine vollständige Testpyramide. Aber: Erkenntnisse müssen dokumentiert sein (in `decisions.md` oder `architecture.md`).
- Spike-Code, der weiterverwendet werden soll, durchläuft eine Stabilisierungsphase, bevor er als Produktivcode gilt.

**Typische Schritt-Arten:**

- **Spike** – zeitbegrenzte Untersuchung („maximal 4h, dann Erkenntnisse zusammenfassen")
- **Prototyp** – funktionsfähige Skizze einer Lösung, nicht produktiv
- **Vergleichsstudie** – mehrere Optionen gegeneinander prüfen
- **Lasttest / Messung** – NFR-Annahmen validieren

### UMSETZUNG

**Zweck:** Geplante Funktionalität auf Basis belastbarer Architektur produktiv bauen.

**Charakteristika:**

- Akzeptanzkriterien sind **funktionsbasiert**: konkrete Eingabe → erwartete Ausgabe, Tests grün, Coverage erfüllt.
- Architektur-Bestandteile, die der Schritt berührt, müssen vor Schrittbeginn `[BELASTBAR]` sein – sonst Stopp.
- Volle Definition of Done (CLAUDE.md Abschnitt 9) gilt.
- Enthält die Phase das **erste öffentliche Deployment**, steht davor ein eigener Gate-Schritt mit der ersten Sicherheits-Review (CLAUDE.md Abschnitt 12, „Gate vor dem ersten öffentlichen Deployment").
- Wenn während der Umsetzung Architektur-Lücken auftauchen: Schritt **stoppen**, Lücke als `[OFFEN]` in `architecture.md` markieren, neuen ERKUNDUNG-Schritt anlegen, dann zurück.

### STABILISIERUNG

**Zweck:** Härten, was in vorherigen Phasen entstanden ist – inklusive Spike-Code, der produktiv weiterverwendet werden soll.

**Charakteristika:**

- Akzeptanzkriterien sind **qualitätsbasiert**: Coverage angehoben, Edge Cases abgedeckt, Lasttest bestanden, Sicherheits-Review nachgeprüft (die erste Review liegt vor dem ersten öffentlichen Deployment, CLAUDE.md Abschnitt 12), Refactoring-Schulden abgebaut.
- Output ist meist kein neues Feature, sondern höhere Robustheit der bestehenden.
- Volle Definition of Done gilt; zusätzlich projektspezifische Stabilisierungs-Kriterien aus `project-context.md`.
- Eine Stabilisierungsphase nach jeder Erkundungsphase, deren Ergebnisse weiterverwendet werden, ist Pflicht.

<!-- ANCHOR:schritt-format -->
## Schritt-Format

Jeder Schritt folgt diesem Schema. Abweichungen nur nach Freigabe.

```text
### [Phase].[Nummer]: Kurztitel

- **Status:** [OFFEN | VERSCHOBEN | IN ARBEIT | WARTET-AUF-FREIGABE | BLOCKIERT | ERLEDIGT | VERWORFEN]
- **Landeplatz (nur VERSCHOBEN):** [Ziel-Schritt-ID, z. B. „6.4" – ein Phasen-Verweis ohne Schritt-ID ist unzulässig, siehe CLAUDE.md Abschnitt 6]
- **Phasentyp-Kontext:** [ERKUNDUNG | UMSETZUNG | STABILISIERUNG] – ergibt sich aus der Phase
- **Schritt-Art (nur ERKUNDUNG):** [Spike | Prototyp | Vergleichsstudie | Lasttest | sonstiges]
- **Zeitbox (nur ERKUNDUNG):** [z. B. „maximal 4h Arbeit, dann Zwischenstand"]
- **Abhängigkeiten:** [Schritt-IDs, die vorher abgeschlossen sein müssen, oder "keine"]
- **Frist (Pflicht bei Abkündigungen, Ablaufdaten, Secret-Rotation):** [YYYY-MM-DD]
- **Freigabepflichtig:** [ja/nein – siehe CLAUDE.md Abschnitt 4]
- **Empfohlene Klasse:** [Mechanik | Routine | Entscheidung | Ausnahme] – [ein Satz Begründung aus CLAUDE.md Abschnitt 0]
- **Eingangskriterien:** [was muss gegeben sein, bevor der Schritt begonnen werden kann; bei UMSETZUNG: alle berührten Architektur-Bestandteile auf [BELASTBAR]]
- **Anforderungen (ab Klasse M):** [FR-IDs aus `docs/requirements.md`, die dieser Schritt umsetzt, oder „keine"]
- **Zu tun:** [konkrete Arbeitsanweisung; bei UMSETZUNG implementierungsnah, bei ERKUNDUNG: zu klärende Fragen]
- **Akzeptanzkriterien:** [phasentypabhängig – wissensbasiert / funktionsbasiert / qualitätsbasiert]
- **Betroffene Module:** [Modulnamen – wenn >1, ggf. aufsplitten]
- **Reifegrad-Wirkung:** [welche Architektur-Bestandteile werden durch diesen Schritt befördert oder zurückgestuft]
- **Artefakte:** [erwartete Dateien/Änderungen; bei ERKUNDUNG: ADRs, Architektur-Updates, Erkenntnisdokumente]
- **Notizen:** [optional: Hinweise, bekannte Fallstricke]
```

<!-- ANCHOR:aktuelle-phasen -->
## Aktuelle Phasen

Festgehalten am 2026-09-26 in Modus 2 Schritt 6 (Klasse M, ADR-001: fünf Phasen). Phase 1 ist im vollen Format ausgearbeitet; die Phasen 2–5 sind gröber und werden zu Phasenbeginn verfeinert (Verfeinerung ändert den ursprünglichen Schrittplan nicht). Jede Muss-Anforderung aus `docs/requirements.md` ist genau einem Schritt zugeordnet – dem Schritt, der sie abschließt; frühere Schritte schaffen die Grundlage und nennen sie unter „Notizen". Datierte, ausgelöste und verschobene Schritte stehen unter „Querschnitt" am Ende dieses Abschnitts.

### Phase 1: Erkundung – Modelle, Import, Laufzeit – Typ: ERKUNDUNG – ABGESCHLOSSEN (2026-09-26)

**Phasen-Bilanz:** 5 Schritte (ursprünglich 4; 1.5 Genre-Test auf Wunsch des Eigentümers ergänzt, Wucherungs-Schwelle nicht berührt), alle `[ERLEDIGT]` am 2026-09-26. Ergebnisse: Startmodell grok-4.7, Zweitmodell grok-4.6, Notfall-Reserve qwen3.8-max, Token-Budget 30.000 als Obergrenze (ADR-010, ADR-011); Import zunächst Markdown (ADR-012); httpx 0.28.1 auf Python 3.14.7 validiert; Architektur vor Phase 2 auf `[BELASTBAR]` befördert, neues Reaktionszeit-Ziel (ADR-013); Pflichtfrage am Phasenende: weiterbauen (ADR-014). Reaktiv-Quote 0/10. Kosten OpenRouter gesamt 1,66 $ (laut Schlüssel-Abfrage; Ausgabengrenze 5 $, Rest 3,34 $). Detail-Schritte: [`docs/archiv/fahrplan-phase-1.md`](archiv/fahrplan-phase-1.md).

### Phase 2: Grundgerüst – Typ: UMSETZUNG

**Ziel:** Ein lauffähiges, angemeldetes Skriptorium ohne KI: Welten, Kanon und Geschichten lassen sich über die Oberfläche anlegen und pflegen; bestehendes Welt-Material ist importierbar; alle CI-Gates sind aktiv.

**Abschlusskriterium:** Schritte 2.1–2.7 `[ERLEDIGT]` mit voller Definition of Done; FR-002, FR-005, FR-007, FR-016 umgesetzt.

**Reifegrad-Erwartung am Phasenende:** `storage`, `canon`, `manuscript`, `api`, `ui` durch Umsetzung validiert `[BELASTBAR]`; Kommunikations-Grundmodus (HTTP/JSON) `[BELASTBAR]`.

**Ursprünglicher Schrittplan:** 7 Schritte, festgehalten am 2026-09-26 – wird nicht still hochgesetzt (CLAUDE.md Abschnitt 8, Kriterium 9)

**Pflichtfrage am Phasenende:** ADR „Weiterbauen, umbauen oder neu aufsetzen" – Nummer wird beim Phasenabschluss vergeben

#### 2.1: Projektgerüst und volle CI-Gates

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

#### 2.2: storage – Dateiablage und Suchindex

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

#### 2.3: canon – Welten und Kanon-Einträge

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

#### 2.4: canon – Import von Welt-Material

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

#### 2.5: manuscript – Geschichten und Kapitel

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

#### 2.6: api – HTTP-Schnittstelle mit Anmeldung

- **Status:** IN ARBEIT (seit 2026-09-26; freigegeben mit ADR-017 und ADR-018)
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

#### 2.7: ui – Editor und Kanon-Pflege

- **Status:** OFFEN
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

### Phase 3: Schreiben mit KI – Typ: UMSETZUNG

**Ziel:** Der Autor schreibt im Wechsel mit der KI in seinen Welten: Weiterschreiben mit Streaming, Szenen-Einstieg, Figuren-Schreibweise, `@`-Verweise, Kapitel-Kurzfassungen, Gast-Figuren, Fakt → Kanon und Modellwechsel.

**Abschlusskriterium:** Schritte 3.1–3.9 `[ERLEDIGT]`; die übrigen Muss-Anforderungen außer FR-022 umgesetzt.

**Reifegrad-Erwartung am Phasenende:** `context` und `ai_gateway` durch Umsetzung validiert `[BELASTBAR]`; Kommunikations-Grundmodus inkl. SSE `[BELASTBAR]`; NFR Kanon-Treue erstmals im Schreibbetrieb gemessen.

**Ursprünglicher Schrittplan:** 9 Schritte, festgehalten am 2026-09-26 – wird nicht still hochgesetzt (CLAUDE.md Abschnitt 8, Kriterium 9)

**Pflichtfrage am Phasenende:** ADR „Weiterbauen, umbauen oder neu aufsetzen" – Nummer wird beim Phasenabschluss vergeben

#### 3.1: ai_gateway – Anbieter-Schnittstelle und OpenRouter-Adapter

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 1.3, 2.1
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Umsetzung des spezifizierten Vertrags `ModelProvider` ohne Eskalations-Auslöser.
- **Eingangskriterien:** `ai_gateway`, `ModelProvider` `[BELASTBAR]`
- **Anforderungen (ab Klasse M):** FR-025
- **Zu tun:** Protokoll `ModelProvider` mit Streaming, Fehlerarten (`ProviderUnavailable`, `ModelRefused`, `RateLimited`, `InvalidRequest`), Timeouts und Retry-Regel; OpenRouter als erster Adapter über httpx; Erfassung von Token und Kosten je Anfrage; Schlüssel nur aus Umgebungsvariablen.
- **Akzeptanzkriterien:** Ein zweiter (Test-)Adapter lässt sich ergänzen, ohne Code des OpenRouter-Adapters oder der Schreib-Funktionen zu ändern (FR-025); Fehlerarten per Test belegt; kein Schlüssel in Logs.
- **Betroffene Module:** ai_gateway
- **Reifegrad-Wirkung:** `ai_gateway` → `[BELASTBAR]` durch Umsetzung
- **Artefakte:** Code, Tests
- **Notizen:** Konkrete weitere Anbieter sind Schritt V.3. Zusatz 2026-09-26 (ADR-013): Observability (Logging, Metriken, `docs/architecture.md` Abschnitt 6) ist noch `[VORLÄUFIG]` und vor Beginn von 3.1 zu befördern; Modell-Konfiguration je Modell (Reasoning, Anbieter-Ausschlüsse) und Timeouts bis zum ersten Textstück nach Abschnitt 4 (ModelProvider).

#### 3.2: context – Kontext-Zusammenstellung unter Token-Budget

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 1.1, 2.3, 2.5
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Umsetzung des in ADR-003 und 1.1 festgelegten Verfahrens ohne Eskalations-Auslöser.
- **Eingangskriterien:** `context`, `ContextBuilder`, Token-Budget `[BELASTBAR]`
- **Anforderungen (ab Klasse M):** FR-001, FR-003, FR-004
- **Zu tun:** `ContextBuilder` mit Vorrangfolge nach ADR-003 und dem Budget aus 1.1; Protokoll der enthaltenen Bausteine; Gegenstands-Felder und Zeitlinie werden in den Kontext übernommen; strikte Trennung der Welten.
- **Akzeptanzkriterien:** Ein Eintrag aus Welt A erscheint nie im Kontext einer Geschichte in Welt B ohne Verbindung (FR-001); nach `@Runenklinge` enthält der KI-Text keine Verwendung, die Zweck oder Wirkung widerspricht (FR-003, Szenario 5); die KI setzt keine Handlung vor ein laut Zeitlinie späteres Ereignis (FR-004); Budget wird nie überschritten; Coverage ≥ 90 % Lines.
- **Betroffene Module:** context
- **Reifegrad-Wirkung:** `context` → `[BELASTBAR]` durch Umsetzung
- **Artefakte:** Code, Tests
- **Notizen:** Prüft zugleich die KI-Wirksamkeit von Kanon-Änderungen aus FR-002 (2.3).

#### 3.3: Weiterschreiben mit Streaming und Szenen-Einstieg

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 2.7, 3.1, 3.2
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Zusammenschalten spezifizierter Module im Ablauf „Weiterschreiben im Wechsel".
- **Eingangskriterien:** Abläufe in `docs/architecture.md` Abschnitt 5 `[BELASTBAR]`
- **Anforderungen (ab Klasse M):** FR-008, FR-009, FR-011
- **Zu tun:** Ablauf „Weiterschreiben im Wechsel" in `api` (SSE) und `ui`: Anweisung senden, Text fortlaufend anzeigen, übernehmen, ändern oder verwerfen; Einstieg mit neuer Szene (Ort, Figuren, Ziel); Fehlerpfad bei Abbruch oder Ablehnung.
- **Akzeptanzkriterien:** Szenario 1 der Vision: erster Absatz widerspricht keinem Kanon-Eintrag der beteiligten Figuren und des Orts (FR-008); übernommener, geänderter oder verworfener Text ist Grundlage der nächsten Fortsetzung (FR-009); Kanon-Treue im Probeschreiben höchstens ein Widerspruch pro Kapitel (FR-011); Anzeige „denkt nach …" innerhalb 1 s, erstes Textstück beim Startmodell innerhalb 60 s, beim Zweitmodell grok-4.6 innerhalb 10 s, Abbruch und Modellwechsel jederzeit (ADR-013); bei Abbruch bleibt der Manuskript-Stand unverändert.
- **Betroffene Module:** api, ui
- **Reifegrad-Wirkung:** Kommunikations-Grundmodus inkl. SSE → `[BELASTBAR]`; NFR Kanon-Treue erhält erste Messung
- **Artefakte:** Code, Tests
- **Notizen:** –

#### 3.4: Figuren-Schreibweise

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 3.3
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – spezifizierte Erweiterung von Kontext-Regeln und Oberfläche.
- **Eingangskriterien:** wie 3.3
- **Anforderungen (ab Klasse M):** FR-012
- **Zu tun:** Je Geschichte festlegen, welche Figur(en) der Autor führt und welche Erzählperspektive gilt; Regel in der Schreibanweisung des Kontexts; Einstellung in der Oberfläche.
- **Akzeptanzkriterien:** In einer Geschichte mit Ich-Figur schreibt die KI ohne Anweisung keine Handlung, Rede oder Gedanken der Ich-Figur; der Wechsel liegt als fortlaufender Manuskript-Text vor (FR-012).
- **Betroffene Module:** context, manuscript, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests
- **Notizen:** –

#### 3.5: `@`-Menü

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 3.3
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – spezifizierte Funktion mit CodeMirror-Autocomplete und Index-Suche.
- **Eingangskriterien:** wie 3.3
- **Anforderungen (ab Klasse M):** FR-013
- **Zu tun:** Eingabe von `@` bietet Einträge der Welt (und ausdrücklich verbundene Einträge) zur Auswahl; gewählte Einträge werden in den Kontext aufgenommen.
- **Akzeptanzkriterien:** `@Kael` in einer Anweisung → der KI-Text nutzt Wissen, das nur im Eintrag „Kael" steht (FR-013); Einträge anderer Welten erscheinen nicht.
- **Betroffene Module:** ui, api, context
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests
- **Notizen:** Vorschläge ohne `@` sind Schritt 5.1.

#### 3.6: Kapitel-Kurzfassungen und Gesamtzusammenfassung

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 3.3
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Umsetzung des Ablaufs „Kapitel abschließen" nach `docs/architecture.md` Abschnitt 5.
- **Eingangskriterien:** wie 3.3
- **Anforderungen (ab Klasse M):** FR-010
- **Zu tun:** Kapitel abschließen → Kurzfassung erzeugen, Gesamtzusammenfassung fortschreiben, speichern; Ansehen und Ändern durch den Autor; Ersatz bei fehlender Kurzfassung.
- **Akzeptanzkriterien:** Beim Weiterschreiben in Kapitel N kennt die KI den Handlungsstand der Kapitel 1 bis N−1 (Test mit einer mehrkapitligen Probegeschichte); scheitert die Erzeugung, bleibt das Kapitel abgeschlossen und die Kurzfassung als „fehlt" markiert. Die Prüfung beim Referenzumfang erfolgt in D.4.
- **Betroffene Module:** api, context, manuscript
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests
- **Notizen:** –

#### 3.7: Gast-Figuren aus anderen Welten

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 3.2
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Umsetzung der Gast-Verbindung aus dem Datenmodell.
- **Eingangskriterien:** Datenmodell `GuestLink` `[BELASTBAR]`
- **Anforderungen (ab Klasse M):** FR-017
- **Zu tun:** Eine Geschichte bindet einen Eintrag einer anderen Welt ein; die Verbindung gilt nur für diese Geschichte.
- **Akzeptanzkriterien:** Szenario 4 der Vision: übrige Geschichten beider Welten zeigen den Gast-Eintrag weder in Vorschlägen noch im KI-Kontext (FR-017).
- **Betroffene Module:** manuscript, context, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests
- **Notizen:** –

#### 3.8: Fakt aus dem Text in den Kanon (inkl. Ziel bei Gast-Figuren)

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 3.7
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Umsetzung des Ablaufs „Fakt aus dem Text in den Kanon".
- **Eingangskriterien:** wie 3.3
- **Anforderungen (ab Klasse M):** FR-015, FR-024
- **Zu tun:** Textstelle markieren → neuer Eintrag oder Ergänzung, mit Vorschlag von Eintrag und Kategorie; bei Gast-Figuren Wahl „Kanon der Figur" oder „nur diese Geschichte".
- **Akzeptanzkriterien:** Vom Markieren bis zum gespeicherten Eintrag unter 10 Sekunden (FR-015), auch mit Zielwahl; beide Ziele wirken wie gewählt (FR-024).
- **Betroffene Module:** ui, api, canon, manuscript
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests
- **Notizen:** –

#### 3.9: Modell- und Anbieterwahl, Modellwechsel

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 3.3
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – spezifizierte Einstellung über die vorhandene Anbieter-Schnittstelle.
- **Eingangskriterien:** wie 3.3
- **Anforderungen (ab Klasse M):** FR-018
- **Zu tun:** Anbieter und Modell je Geschichte bzw. Anfrage wählen; bei Ablehnung Wiederholen mit anderem Modell anbieten; Anzeige von Token und Kosten.
- **Akzeptanzkriterien:** Wechsel auf ein anderes Modell ohne Datenverlust; Weiterschreiben mit dem neuen Modell in derselben Geschichte (FR-018).
- **Betroffene Module:** ui, api, ai_gateway
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests
- **Notizen:** –

### Phase 4: Stabilisierung und erstes öffentliches Deployment – Typ: STABILISIERUNG

**Ziel:** Das Skriptorium ist gehärtet, das Gate vor dem ersten öffentlichen Deployment (CLAUDE.md Abschnitt 12) ist mit Belegen erfüllt, das System läuft öffentlich mit Passwortschutz auf einem VPS, und der 30-Minuten-Test ist bestanden.

**Abschlusskriterium:** Schritte 4.1–4.8 `[ERLEDIGT]`; alle acht Gate-Prüfpunkte belegt; FR-022 bestanden.

**Reifegrad-Erwartung am Phasenende:** Host, Netz, Secrets im Betrieb, Backups und Bedrohungsmodell `[BELASTBAR]` (Backups erst nach erprobter Wiederherstellung).

**Ursprünglicher Schrittplan:** 8 Schritte, festgehalten am 2026-09-26 – wird nicht still hochgesetzt (CLAUDE.md Abschnitt 8, Kriterium 9)

**Pflichtfrage am Phasenende:** ADR „Weiterbauen, umbauen oder neu aufsetzen" – Nummer wird beim Phasenabschluss vergeben

**Hinweis:** Architekturentscheidungen (Kategorien 1, 2, 4, 5) in dieser Phase sind `[REAKTIV]` (CLAUDE.md Abschnitt 6). Die geplanten Entscheidungen zu Hosting und Deployment gehören zu den Kategorien 3, 6 und 7.

#### 4.1: Qualitäts-Härtung der Phasen 2 und 3

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 3.9
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Testerstellung und Testwartung ohne Architekturwirkung.
- **Eingangskriterien:** Phase 3 abgeschlossen
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Coverage-Ziele nachweisen (80 % / 90 % für `canon` und `context`), Randfälle (Abbruch, Ablehnung, leerer Kanon, sehr lange Kapitel), Tempo von `storage` bei großen Geschichten messen.
- **Akzeptanzkriterien:** Coverage-Werte erreicht und dokumentiert; Randfall-Tests grün; Messwerte zu `storage` im Logbuch.
- **Betroffene Module:** canon, manuscript, context, ai_gateway, storage, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Tests, Messprotokoll
- **Notizen:** –

#### 4.2: Host bereitstellen und härten

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.1
- **Freigabepflichtig:** ja – Anbieterwahl und Deployment-Ziel (Kategorien 3 und 7), SSH-Zugang (Kategorie 6)
- **Empfohlene Klasse:** Entscheidung – Anbieter- und Betriebsentscheidungen mit `ENTSCHEIDUNG ERFORDERLICH` (Eskalations-Auslöser 1).
- **Eingangskriterien:** Kostenrahmen (BDR-001) und Kostenregister aus 1.1 aktuell
- **Anforderungen (ab Klasse M):** keine (Gate-Prüfpunkt 3)
- **Zu tun:** VPS-Anbieter vorschlagen und freigeben lassen; Firewall, SSH nur mit Schlüssel, automatische Sicherheitsupdates; von außen nur HTTPS (443) und Umleitung von HTTP (80); TLS mit automatischer Erneuerung; Erreichbarkeits-Prüfung von außen.
- **Akzeptanzkriterien:** Prüfung von außen belegt: nur die vorgesehenen Ports offen, Passwort-Anmeldung per SSH abgelehnt; Erreichbarkeits-Prüfung meldet einen absichtlich herbeigeführten Ausfall.
- **Betroffene Module:** keine (Betrieb)
- **Reifegrad-Wirkung:** Host und Netz → `[BELASTBAR]`
- **Artefakte:** ADR zu Anbieter und Betrieb; `docs/architecture.md` Abschnitt 6; `docs/project-context.md` Abschnitt 8
- **Notizen:** –

#### 4.3: Backups mit erprobter Wiederherstellung

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.2
- **Freigabepflichtig:** ja – Sicherungsziel außerhalb des Servers (Kategorien 3 und 7)
- **Empfohlene Klasse:** Entscheidung – Wahl des Sicherungsziels ist freigabepflichtig (Eskalations-Auslöser 1).
- **Eingangskriterien:** Host aus 4.2
- **Anforderungen (ab Klasse M):** keine (Gate-Prüfpunkt 5)
- **Zu tun:** Datenverzeichnis täglich außerhalb des Servers sichern; Index nicht sichern, sondern neu aufbauen; Wiederherstellung aus einem echten Backup auf einem leeren System durchspielen.
- **Akzeptanzkriterien:** Eine vollständige Wiederherstellung aus einem echten Backup ist durchgelaufen (Datum und Ergebnis am Bestandteil vermerkt, CLAUDE.md Abschnitt 6).
- **Betroffene Module:** storage
- **Reifegrad-Wirkung:** Backups und Wiederherstellung → `[BELASTBAR]`
- **Artefakte:** Sicherungs-Konfiguration, Protokoll des Wiederherstellungs-Laufs
- **Notizen:** –

#### 4.4: Notfall-Handbuch

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.3
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Dokumentationspflege auf Grundlage von 4.2 und 4.3.
- **Eingangskriterien:** Host und Backups eingerichtet
- **Anforderungen (ab Klasse M):** keine (Gate-Prüfpunkt 7, ADR-008)
- **Zu tun:** Abschnitt „Notfall" in `docs/onboarding-runbook.md`: System anhalten, Sicherung ziehen, wiederherstellen, API-Schlüssel widerrufen – ausführbar vom Eigentümer ohne KI.
- **Akzeptanzkriterien:** Der Eigentümer hat die Schritte einmal ohne KI nachvollzogen; Ergebnis im Logbuch.
- **Betroffene Module:** keine (Betrieb)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** `docs/onboarding-runbook.md`
- **Notizen:** –

#### 4.5: Unabhängige Sicherheitsprüfung

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.2
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Entscheidung – Prüfung sicherheitsrelevanter Teile durch eine getrennte Instanz, möglichst mit anderem Modell (CLAUDE.md Abschnitt 12).
- **Eingangskriterien:** Code und Bedrohungsmodell auf aktuellem Stand
- **Anforderungen (ab Klasse M):** keine (Gate-Prüfpunkt 6)
- **Zu tun:** Getrennte Session prüft Authentifizierung, Autorisierung, Umgang mit Secrets und personenbezogene Datenflüsse anhand von Diff und Bedrohungsmodell.
- **Akzeptanzkriterien:** Befunde behoben oder als Fahrplan-Schritt mit Frist geführt; Ergebnis und Datum im Logbuch.
- **Betroffene Module:** api, ai_gateway, ui
- **Reifegrad-Wirkung:** Bedrohungsmodell → `[BELASTBAR]`
- **Artefakte:** Prüfbericht, Logbuch-Eintrag
- **Notizen:** –

#### 4.6: Gate vor dem ersten öffentlichen Deployment

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.2, 4.3, 4.4, 4.5
- **Freigabepflichtig:** ja – Verzicht auf einen Prüfpunkt nur per ADR (Kategorie 6)
- **Empfohlene Klasse:** Entscheidung – blockierendes Gate mit Beförderung von Schutzmechanismen (Eskalations-Auslöser 4).
- **Eingangskriterien:** Schritte 4.2–4.5 erledigt
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Checkliste der acht Prüfpunkte (CLAUDE.md Abschnitt 12) mit Belegen:
  - [ ] 1. Bedrohungsmodell für das Gesamtsystem, mindestens `[VORLÄUFIG]` – `docs/architecture.md` Abschnitt 6
  - [ ] 2. Sicherheitsniveau per ADR – ADR-006
  - [ ] 3. Grundhärtung des Host, belegt durch Prüfung von außen – Schritt 4.2
  - [ ] 4. Secrets im Betrieb (Ablageort, Rotationsweg) und Zugriff der KI auf die Produktion in `docs/project-context.md` Abschnitt 8; Ausgabengrenze am OpenRouter-Schlüssel belegt
  - [ ] 5. Backup mit erprobter Wiederherstellung – Schritt 4.3
  - [ ] 6. Unabhängige Prüfung – Schritt 4.5
  - [ ] 7. Vertretung: Verzicht per ADR-008; Notfall-Handbuch – Schritt 4.4
  - [ ] 8. KI im Betrieb: Konto, Kontingent mit Zurücksetz-Zeitpunkt, Rückfallweg ohne KI in `docs/project-context.md` Abschnitt 8; Kontingent für den Deployment-Termin eingeplant
- **Akzeptanzkriterien:** Alle acht Punkte mit Beleg abgehakt oder per ADR verzichtet.
- **Betroffene Module:** keine (Betrieb)
- **Reifegrad-Wirkung:** Secrets im Betrieb → `[BELASTBAR]`
- **Artefakte:** ausgefüllte Checkliste in diesem Schritt; `docs/project-context.md` Abschnitt 8
- **Notizen:** Deployment-Schritt 4.7 kann nicht beginnen, solange ein Punkt offen ist.

#### 4.7: Erstes öffentliches Deployment

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.6
- **Freigabepflichtig:** ja – Deployment-Workflow (Kategorie 7)
- **Empfohlene Klasse:** Entscheidung – Änderung an Build- und Deploy-Pipeline (Eskalations-Auslöser 1).
- **Eingangskriterien:** Gate 4.6 vollständig
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Deployment-Weg einrichten und ausführen; Gesundheitsprüfung und Anmeldung von außen prüfen.
- **Akzeptanzkriterien:** Das System ist unter HTTPS erreichbar; ohne Anmeldung ist außer Gesundheitsprüfung und Anmeldung nichts zugänglich; Version und Status in `docs/project-context.md` und README nachgezogen.
- **Betroffene Module:** api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Deployment-Konfiguration, ADR, CHANGELOG
- **Notizen:** Kontingent-intensive Vorbereitung ins vorige Kontingent-Fenster legen oder Kontingent für den Termin zurückhalten (Gate-Prüfpunkt 8).

#### 4.8: 30-Minuten-Test

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.7
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Durchführung durch den Eigentümer, die KI dokumentiert das Ergebnis.
- **Eingangskriterien:** öffentliches System läuft
- **Anforderungen (ab Klasse M):** FR-022
- **Zu tun:** Der Eigentümer öffnet das Skriptorium zum ersten Mal, importiert eine bestehende Welt und schreibt eine erste Szene – ohne Anleitung, mit Stoppuhr.
- **Akzeptanzkriterien:** höchstens 30 Minuten einschließlich einmaliger Einrichtung (FR-022); bei Überschreitung: Hindernisse als Schritte angelegt.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Logbuch-Eintrag mit Messung
- **Notizen:** –

### Phase 5: Soll-Anforderungen – Typ: UMSETZUNG

**Ziel:** Die Soll-Anforderungen und die Kann-Anforderung sind umgesetzt oder begründet zurückgestellt; die nächste Ausbaustufe ist geplant.

**Abschlusskriterium:** Schritte 5.1–5.5 `[ERLEDIGT]` oder `[VERWORFEN]` mit ADR.

**Reifegrad-Erwartung am Phasenende:** unverändert `[BELASTBAR]`; keine neuen Architektur-Bestandteile erwartet.

**Ursprünglicher Schrittplan:** 5 Schritte, festgehalten am 2026-09-26 – wird nicht still hochgesetzt (CLAUDE.md Abschnitt 8, Kriterium 9)

**Pflichtfrage am Phasenende:** ADR „Weiterbauen, umbauen oder neu aufsetzen" – Nummer wird beim Phasenabschluss vergeben

#### 5.1: Kanon-Vorschläge ohne `@`

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 3.5
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Namenserkennung über den vorhandenen Index, spezifiziert in `context`.
- **Eingangskriterien:** wie Phase 3
- **Anforderungen (ab Klasse M):** FR-014
- **Zu tun:** Kanon-Namen ohne `@` erkennen und nur als Vorschlag anbieten („Meintest du @Kael?").
- **Akzeptanzkriterien:** Nicht angenommene Vorschläge beeinflussen den KI-Kontext nicht (FR-014).
- **Betroffene Module:** context, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests
- **Notizen:** –

#### 5.2: Bedienung am Smartphone

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 4.7
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Anpassung der Oberfläche ohne Architekturwirkung.
- **Eingangskriterien:** öffentliches System läuft
- **Anforderungen (ab Klasse M):** FR-019
- **Zu tun:** Oberfläche für Smartphone-Bildschirme anpassen; Test auf einem Smartphone-Browser.
- **Akzeptanzkriterien:** UC-003, UC-004, UC-008 auf einem Smartphone-Browser durchführbar (FR-019).
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests
- **Notizen:** –

#### 5.3: Lesbare Dateien – Nachweis

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 2.5
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Nachweis an vorhandenen Daten.
- **Eingangskriterien:** Datenverzeichnis mit mindestens einer Welt samt Geschichte
- **Anforderungen (ab Klasse M):** FR-020
- **Zu tun:** Voraussichtlich schon durch die Speicherform aus ADR-003 erfüllt (Markdown-Dateien als Quelle der Wahrheit); hier nur Nachweis und ggf. Lücken schließen.
- **Akzeptanzkriterien:** Eine Welt samt Geschichten ist ohne das Skriptorium in einem Texteditor lesbar (FR-020).
- **Betroffene Module:** storage
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Logbuch-Eintrag mit Nachweis
- **Notizen:** Kann vorgezogen werden, sobald 2.5 erledigt ist.

#### 5.4: Zeitlinie mit Datumsangaben im Kalender der Welt (Kann)

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 2.3
- **Freigabepflichtig:** ja, falls das Datenmodell erweitert wird (Kategorie 4)
- **Empfohlene Klasse:** Entscheidung – eine Datenmodell-Erweiterung ist freigabepflichtig (Eskalations-Auslöser 1).
- **Eingangskriterien:** Entscheidung des Eigentümers, ob die Kann-Anforderung umgesetzt wird
- **Anforderungen (ab Klasse M):** FR-023
- **Zu tun:** Zeitlinien-Einträge optional mit Datumsangaben im Kalender der Welt.
- **Akzeptanzkriterien:** Umgesetzt mit Tests oder `[VERWORFEN]` mit ADR.
- **Betroffene Module:** canon, ui
- **Reifegrad-Wirkung:** ggf. Datenmodell
- **Artefakte:** Code, Tests oder ADR
- **Notizen:** –

#### 5.5: Planung der nächsten Ausbaustufe

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.1, 5.2, 5.3, 5.4
- **Freigabepflichtig:** ja – neue Phasen sind Replanning (Fahrplan, Replanning-Historie)
- **Empfohlene Klasse:** Entscheidung – inhaltliche Neuplanung mit Vision-Abgleich, nicht bloß Status-Update.
- **Eingangskriterien:** Vision-Abgleich an der Phasengrenze nach Phase 5
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Die verschobenen Schritte V.1, V.2, V.3 in konkrete Schritte einer neuen Phase überführen oder per ADR verwerfen.
- **Akzeptanzkriterien:** Jeder Schritt V.1–V.3 hat einen neuen `[OFFEN]`-Schritt mit ID oder einen `[VERWORFEN]`-Status mit ADR.
- **Betroffene Module:** keine (Planung)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Fahrplan, ggf. ADRs
- **Notizen:** –

### Querschnitt: datierte, ausgelöste und verschobene Schritte

Diese Schritte gehören zu keiner Phase; sie werden fällig durch ein Datum, einen Auslöser oder die Planung in 5.5. Sie zählen nicht zum Schrittplan einer Phase.

#### D.1: Wechsel Node.js 24 → Node.js 26 LTS

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 2.1
- **Frist:** frühestens 2026-11-05 (Mindestreife), spätestens vor 2028-04-30 (Lebensende Node 24); Vorlauf 6 Monate laut Ablaufdaten-Register
- **Freigabepflichtig:** ja – Major-Wechsel einer Laufzeitumgebung (Kategorie 3, Versionsregel ADR-002)
- **Empfohlene Klasse:** Entscheidung – Major-Update mit erneuter Versions-Verifikation und ADR (Eskalations-Auslöser 1).
- **Eingangskriterien:** Node 26 ist LTS und erfüllt die Mindestreife; Vite und Plugin unterstützen sie nachweislich
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Versions-Verifikation für Node 26 und npm; Build und Tests auf Node 26; Pins und Ablaufdaten-Register nachziehen.
- **Akzeptanzkriterien:** Build und CI auf Node 26 grün; `docs/project-context.md` Abschnitte 3 und 8 aktualisiert.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR, Konfiguration
- **Notizen:** –

#### D.2: Nachprüfung TypeScript 7

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 2.1
- **Frist:** fällig ab 2027-01-08 (Nachprüf-Datum aus dem Ablaufdaten-Register)
- **Freigabepflichtig:** ja, falls gewechselt wird (Major-Update, Kategorie 3)
- **Empfohlene Klasse:** Entscheidung – mögliche Major-Entscheidung mit ADR (Eskalations-Auslöser 1).
- **Eingangskriterien:** TypeScript 7 hat Mindestreife und ein Patch-Release
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Reife von TypeScript 7 und Unterstützung durch die Werkzeuge prüfen; Pflegestand von TypeScript 6 prüfen; Wechsel vorschlagen oder neues Nachprüf-Datum setzen.
- **Akzeptanzkriterien:** Entscheidung dokumentiert; Ablaufdaten-Register aktualisiert.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR oder Register-Eintrag
- **Notizen:** Zusatz 2026-09-26 (ADR-015): vitest 5 mitprüfen – mindestreif erst ab 2027-03-03; ist das bei D.2 noch nicht erreicht, eigenes Nachprüf-Datum im Register setzen. Kompatibilität typescript-eslint mit TypeScript 7 prüfen (8.70.1 verlangt `typescript <6.1.0`).

#### D.3: Nachprüfung httpx

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 1.3
- **Frist:** 2027-03-26
- **Freigabepflichtig:** ja, falls eine Ersatz-Bibliothek nötig wird (Kategorie 3)
- **Empfohlene Klasse:** Routine – Prüfung von Pflegestand und Kompatibilität; bei Ersatzbedarf Eskalation auf die Entscheidungs-Klasse.
- **Eingangskriterien:** Frist erreicht
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Pflegestand von httpx und Deklaration von Python 3.14 prüfen; bei schwacher Pflege Alternative vorlegen.
- **Akzeptanzkriterien:** Ergebnis dokumentiert; Ablaufdaten-Register mit neuem Datum oder Ersatzentscheidung.
- **Betroffene Module:** ai_gateway
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Register-Eintrag, ggf. ADR
- **Notizen:** –

#### D.4: Prüfung „kein Kontextverlust" beim Referenzumfang

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 3.6
- **Frist:** kein Datum – Auslöser: eine Geschichte erreicht ≥ 500.000 Token (Entscheidung des Eigentümers, ADR-009)
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Entscheidung – der Nachweis kann die NFR Kontexttreue auf `[BELASTBAR]` befördern (Eskalations-Auslöser 4).
- **Eingangskriterien:** Auslöser erreicht (Umfang anhand der Token-Zählung aus 1.1 festgestellt)
- **Anforderungen (ab Klasse M):** keine (Nachweis der Akzeptanz von FR-010, umgesetzt in 3.6)
- **Zu tun:** Erfolgskriterien „kein Kontextverlust" und „günstiger pro Anfrage" (Vision 4) an dieser Geschichte prüfen; Kosten je Anfrage mit der Referenz (125.000–140.000 Token) vergleichen.
- **Akzeptanzkriterien:** Beide Kriterien belegt oder widerlegt; bei Widerlegung neuer ERKUNDUNG-Schritt.
- **Betroffene Module:** context
- **Reifegrad-Wirkung:** NFR Kontexttreue Referenzumfang `[OFFEN]` → `[BELASTBAR]` oder begründeter Erkundungsbedarf
- **Artefakte:** Messprotokoll, ADR `[ERKENNTNIS]`
- **Notizen:** Bis dahin gilt das Kriterium als unbelegt.

#### D.5: Wechsel auf httpx2 und Nachprüfung mypy 2

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 2.1
- **Frist:** 2026-11-12 (Mindestreife httpx2; mypy 2 ab 2026-11-06)
- **Freigabepflichtig:** ja – httpx2 ist eine neue externe Abhängigkeit (Kategorie 3)
- **Empfohlene Klasse:** Entscheidung – Freigabe einer neuen Abhängigkeit (Eskalations-Auslöser 1).
- **Eingangskriterien:** Frist erreicht
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** httpx2 nach Regel-001 prüfen und zur Freigabe vorlegen; Tests (Starlette-TestClient) und `ai_gateway` auf httpx2 umstellen; benannte Ausnahme aus dem Warnungs-Bestand entfernen; Streaming, Timeout und Abbruch wie in 1.3 erneut prüfen. Mit erledigen: mypy 2 nach Regel-001 prüfen und ggf. wechseln.
- **Akzeptanzkriterien:** Tests ohne Warnungs-Ausnahme grün; Warnungs-Bestand leer; Ablaufdaten-Register aktualisiert; D.3 angepasst oder aufgelöst.
- **Betroffene Module:** ai_gateway
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR, Register-Eintrag
- **Notizen:** Herkunft ADR-015 (Befund aus 2.1). Vitest 5 wird mit D.2 (2027-01-08) bzw. ab Mindestreife 2027-03-03 nachgeprüft.

#### M.1: Branch-Konvention festlegen

- **Status:** ERLEDIGT (2026-09-26)
- **Phasentyp-Kontext:** querschnittlich (Methodik)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein (Dokumentation der Repository-Regeln, `docs/project-context.md` Abschnitt 10; keine Umbenennung des Hauptbranches)
- **Empfohlene Klasse:** Routine – Dokumentationspflege ohne Architekturwirkung.
- **Eingangskriterien:** Auftrag des Eigentümers vom 2026-09-26 („vernünftige Branch-Konvention: Feature, Bugfix usw.")
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Branch-Typen, Namensform, Umgang mit werkzeugvergebenen `claude/`-Branches, Lebensdauer und Merge-Art festhalten.
- **Akzeptanzkriterien:** Konvention steht in `docs/project-context.md` Abschnitt 10 und ist mit `CLAUDE.md` Abschnitt 11 vereinbar.
- **Betroffene Module:** keine
- **Reifegrad-Wirkung:** keine
- **Artefakte:** `docs/project-context.md` Abschnitt 10
- **Notizen:** –

#### V.1: Publizieren (Satz, Export, Veröffentlichung)

- **Status:** VERSCHOBEN
- **Landeplatz (nur VERSCHOBEN):** 5.5
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.5
- **Freigabepflichtig:** ja, bei Umsetzung (neue Funktion, ggf. neue Abhängigkeiten)
- **Empfohlene Klasse:** Entscheidung – Planung einer neuen Funktion mit möglichen Architektur- und Abhängigkeitsfragen.
- **Eingangskriterien:** Planung in 5.5
- **Anforderungen (ab Klasse M):** keine (Vision 5: nicht in der ersten Version, nicht ausgeschlossen)
- **Zu tun:** in 5.5 in konkrete Schritte überführen oder verwerfen
- **Akzeptanzkriterien:** siehe 5.5
- **Betroffene Module:** noch offen
- **Reifegrad-Wirkung:** keine
- **Artefakte:** –
- **Notizen:** –

#### V.2: Bilder und Karten

- **Status:** VERSCHOBEN
- **Landeplatz (nur VERSCHOBEN):** 5.5
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.5
- **Freigabepflichtig:** ja, bei Umsetzung (neue Funktion, ggf. Datenmodell)
- **Empfohlene Klasse:** Entscheidung – Planung einer neuen Funktion mit möglichen Datenmodell-Fragen.
- **Eingangskriterien:** Planung in 5.5
- **Anforderungen (ab Klasse M):** keine (Vision 5: nicht in der ersten Version, nicht ausgeschlossen)
- **Zu tun:** in 5.5 in konkrete Schritte überführen oder verwerfen
- **Akzeptanzkriterien:** siehe 5.5
- **Betroffene Module:** noch offen
- **Reifegrad-Wirkung:** keine
- **Artefakte:** –
- **Notizen:** –

#### V.3: Weitere KI-Anbieter neben OpenRouter

- **Status:** VERSCHOBEN
- **Landeplatz (nur VERSCHOBEN):** 5.5
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 3.1, 5.5
- **Freigabepflichtig:** ja – jeder Anbieter ist ein neuer externer Dienst (Kategorie 3)
- **Empfohlene Klasse:** Entscheidung – neue externe Abhängigkeit (Eskalations-Auslöser 1).
- **Eingangskriterien:** Erweiterungspunkt aus 3.1 (FR-025) umgesetzt
- **Anforderungen (ab Klasse M):** keine (FR-025 selbst ist in 3.1 umgesetzt)
- **Zu tun:** konkrete Anbieter auswählen und je einen Adapter ergänzen
- **Akzeptanzkriterien:** siehe 5.5
- **Betroffene Module:** ai_gateway
- **Reifegrad-Wirkung:** keine
- **Artefakte:** –
- **Notizen:** –

#### V.4: Import aus TypingMind (Agenten-JSON)

- **Status:** VERSCHOBEN
- **Landeplatz (nur VERSCHOBEN):** 5.5 – vorgezogen, falls der 30-Minuten-Test (4.8) am Import scheitert (ADR-012)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 2.4
- **Freigabepflichtig:** ja – Eingangsformat ist Teil des Datenmodells (Kategorie 4)
- **Empfohlene Klasse:** Entscheidung – Datenmodell-Festlegung (Eskalations-Auslöser 1).
- **Eingangskriterien:** ein TypingMind-Agenten-Export liegt vor (z. B. Test-Agent mit erfundenem Inhalt)
- **Anforderungen (ab Klasse M):** keine (FR-005 in 2.4 erfüllt)
- **Zu tun:** Schema des Exports klären (Systemanweisung, Wissensdateien), Importer in `canon.importers` ergänzen.
- **Akzeptanzkriterien:** Ein Agenten-Export wird ohne Handarbeit als Welt-Material übernommen.
- **Betroffene Module:** canon
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR zum Format, Code, Tests
- **Notizen:** –

#### V.5: Import aus Notion (Markdown-Export mit Unterseiten)

- **Status:** VERSCHOBEN
- **Landeplatz (nur VERSCHOBEN):** 5.5 – vorgezogen, falls der 30-Minuten-Test (4.8) am Import scheitert (ADR-012)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 2.4
- **Freigabepflichtig:** ja – Eingangsformat ist Teil des Datenmodells (Kategorie 4)
- **Empfohlene Klasse:** Entscheidung – Datenmodell-Festlegung (Eskalations-Auslöser 1).
- **Eingangskriterien:** ein Notion-Markdown-Export mit Unterseiten liegt vor (z. B. Testseite mit erfundenem Inhalt)
- **Anforderungen (ab Klasse M):** keine (FR-005 in 2.4 erfüllt)
- **Zu tun:** Verhalten von Unterseiten und Dateistruktur des Exports klären, Importer auf dem Markdown-Importer aus 2.4 aufbauen.
- **Akzeptanzkriterien:** Ein Notion-Export mit Unterseiten wird ohne Handarbeit als Welt-Material übernommen.
- **Betroffene Module:** canon
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR zum Format, Code, Tests
- **Notizen:** –

---

<!-- ANCHOR:iterations-reflexion -->
## Iterations-Reflexion

Nach Abschluss jeder Phase wird hier ein kurzer Eintrag ergänzt. Noch keine Phase abgeschlossen (Stand 2026-09-26).

---

<!-- ANCHOR:parallelisierbarkeit -->
## Parallelisierbarkeit

- Schritte **ohne Abhängigkeiten zueinander**: 1.1, 1.2, 1.3; 2.3 und 2.5 (nach 2.2); 3.4, 3.5, 3.6, 3.9 (nach 3.3); 5.1, 5.3, 5.4
- Schritte **mit gemeinsamen Modulen** (Konfliktgefahr): 2.3 und 2.4 (`canon`); 3.4, 3.5, 3.6 und 3.7 (`context`); 3.8 (`canon`, `manuscript`, `ui`) mit 3.4 und 3.7

<!-- ANCHOR:replanning-historie -->
## Replanning-Historie

- 2026-09-26 – Erstplanung in Modus 2 Schritt 6 (fünf Phasen, Querschnitt D.1–D.4 und V.1–V.3); kein Replanning.

<!-- ANCHOR:archiv-abgeschlossene-phasen -->
## Archiv / abgeschlossene Phasen

Noch keine abgeschlossenen Phasen.
