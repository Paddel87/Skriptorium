# Fahrplan

<!-- Zentrales Arbeitsdokument. Wird vor jeder Änderung gelesen (CLAUDE.md Abschnitt 2)
     und nach jedem Arbeitsschritt sowie zu Sessionende aktualisiert (Abschnitt 12).
     Phasen sind nach Typ klassifiziert (Erkundung / Umsetzung / Stabilisierung),
     weil iterative Entwicklung unterschiedliche Erfolgskriterien pro Phasentyp braucht. -->

<!-- ANCHOR:aktueller-stand -->
## Aktueller Stand

- **Stand vom:** 2026-10-19 (Proben zu 9.3 im dritten Versuch gelaufen – Regel-002 und Weltenbauer; zuvor zweiter Versuch ohne Schlüssel, Werkzeug für die Weltenbauer-Probe vorbereitet); 2026-10-18 (9.2 erledigt – vier End-to-End-Tests, Vertragstest Server ↔ Oberfläche, CI-Schrittnamen; PR #175; 9.1 erledigt – ADR-091, PR #173; D.19 angelegt; zuvor Phase 8 abgeschlossen: 8.13 erledigt – Pflichtfrage ADR-089, Planung ADR-090); am selben Tag V.36 und V.37 angelegt, 8.9 und 8.11 bestätigt; 2026-10-16 V.35 angelegt
- **Laufende Phase:** Phase 9 „Verlässlicher Kanon, Bilder und Verwaltung“ (Phase 8 abgeschlossen 2026-10-18)
- **Phasentyp:** UMSETZUNG
- **Aktiver Schritt:** 9.3 Gegliederte Einträge je Art (seit 2026-10-18) – entschieden (ADR-092) und lokal umgesetzt, PR #177 offen; Proben mit echter KI gelaufen (2026-10-19, Branch `spike/9.3-proben-ki`): Regel-002 mit Nachlauf (je 6 Ketten) ohne Wirkung und ohne Verschlechterung, der Befund bei den Widersprüchen aus drei Läufen war Streuung; Weltenbauer gliedert in allen vier Arten; vom Eigentümer bestätigt (2026-10-19); offen: Zusammenführen durch die lokale Session (Proben-Branch `spike/9.3-proben-ki`, PR #177), dann `[ERLEDIGT]`
- **Nächster Schritt:** Proben-Branch `spike/9.3-proben-ki` übernehmen (lokale Session) und PR #177 zusammenführen, 9.3 auf `[ERLEDIGT]`; dann 9.4; D.19 ab dem ersten CI-Lauf nach dem 2026-10-19. Offen bei dir: Probe mit einer Gast-Figur (Eingangskriterium 9.13). Querschnitt: D.11 bis 2026-10-31 (Eigentümer). Datiert: D.1 frühestens 2026-11-05; D.5 ab 2026-11-12; D.15 ab 2026-12-17; D.9 2026-12-28. Knappe Ressource: Wochenkontingent Max 5x (Zurücksetzung sonntags 10:00 MESZ)
- **Offene STOPP-Situationen:** keine – STOPP Phasen-Wucherung (Phase 4, 16 Schritte) aufgelöst am 2026-10-08 durch Neuplanung, Vision-Abgleich und Pflichtfrage (ADR-042; Bewertung `docs/research/bewertung-phase-4.md`). Die Befunde (a)–(h) und die Modell-Sperren haben ihren Landeplatz in 5.7–5.13, D.13, V.6–V.9.

---

<!-- ANCHOR:uebersicht -->
## Übersicht

Ampel (eingeführt 2026-10-08 auf Wunsch des Eigentümers; Rot nur für Blockiertes, damit ein echtes Problem auffällt): ✅ erledigt · 🟠 in Arbeit · ⚪ offen · 🔴 blockiert · 🔵 wartet auf Freigabe · ⏸️ verschoben · ❌ verworfen. „Nächster Zug“ sagt, wer als Nächstes etwas tun muss – „du“ ist der Eigentümer. Abgeleitet aus den Status-Zeilen der Schritte unten; Quelle bleibt der Schritt selbst. Wird bei jeder Statusänderung und zu Sessionende mit nachgezogen (Drift-Prüfung `CLAUDE.md` Abschnitt 16, wie „Aktueller Stand“).

Phase 8 abgeschlossen 2026-10-18 (13 von 13 erledigt) – Details im Archiv [`docs/archiv/fahrplan-phase-8.md`](archiv/fahrplan-phase-8.md).

**Phase 9: 1 von 15 erledigt.**

| | Schritt | Titel | Status | Nächster Zug |
|---|---|---|---|---|
| ✅ | 9.1 | Gliederung im Server verlässlich – Abschnitte und Namen | erledigt 2026-10-18 (ADR-091) | – |
| ✅ | 9.2 | End-to-End-Tests für die Abläufe der Phasen 6–8 | erledigt 2026-10-18 | – |
| 🟠 | 9.3 | Gegliederte Einträge je Art (B2, G1/G2) | umgesetzt (ADR-092), Proben offen | KI: Proben in der Cloud; du: bestätigen |
| ⚪ | 9.4 | Beziehungen mit Art und Rückverweis (B3) | offen | KI: nach 9.3 Vorlage |
| ⚪ | 9.5 | Bilder vom Bedarf her; Karte aus den Orten (G4, B4) | offen | KI: nach 9.3 Vorlage |
| ⚪ | 9.6 | Herkunft von Bildern (B1) | offen | KI: Vorlage |
| ⚪ | 9.7 | Einstellungsseite – Modell je Aufgabe (G3, B6) | offen | KI: Mockup und Vorlage |
| ⚪ | 9.8 | Bild zu Bild (B7) | offen | KI: nach 9.6 Vorlage |
| ⚪ | 9.9 | Löschen oder Archivieren (B5) | offen | KI: Vorlage mit Mockup |
| ⚪ | 9.10 | Cache-Treffer festhalten (V.36) | offen | KI |
| ⚪ | 9.11 | Verbrauchsstatistik je Welt und Geschichte (V.37) | offen | KI: nach 9.10 Vorlage |
| ⚪ | 9.12 | Quellen und Recherche – Erkundung (H1, V1) | offen | KI |
| ⚪ | 9.13 | Gast-Figuren ausbauen (V.34) | offen | du: Gast-Figur ausprobieren |
| ⚪ | 9.14 | Kontexttreue erneut prüfen | offen | KI: nach 9.4 |
| ⚪ | 9.15 | Planung der nächsten Ausbaustufe | offen | KI |

**Querschnitt (offen):**

| | Schritt | Titel | Status | Nächster Zug |
|---|---|---|---|---|
| ⚪ | D.1 | Wechsel Node.js 24 → Node.js 26 LTS | offen | KI – ab 2026-11-05 |
| ⚪ | D.2 | Nachprüfung TypeScript 7 | offen | KI – am 2027-01-08 |
| ⚪ | D.3 | Nachprüfung httpx | offen | KI – am 2027-03-26 |
| ✅ | D.4 | Prüfung „kein Kontextverlust" beim Referenzumfang | erledigt 2026-10-11 (ADR-057, an „Geschichte des Eigentümers“) | – |
| ⚪ | D.5 | Wechsel auf httpx2 und Nachprüfung mypy 2 | offen | KI – ab 2026-11-12 |
| ⚪ | D.9 | Nachprüfung Unterstützung des Reverse Proxys | offen | KI – am 2026-12-28 |
| ⚪ | D.11 | Sicherungs-Zugangsdaten außerhalb des Servers ablegen | offen | du – bis 2026-10-31 |
| ⚪ | D.13 | Weigerungen der KI im Text erkennen – Erkundung | offen | du: Beispiele echter Sperren |
| ⚪ | D.15 | Wechsel React Router 7 → Linie 8 | offen | KI – ab 2026-12-17 |
| ✅ | D.17 | CI nur für `main` und fertige Pull Requests | erledigt 2026-10-10 | – |
| ✅ | D.18 | Prüfauftrag Datenmodell: Trennung der Daten je KI-Bereich | erledigt 2026-10-13 (V.29–V.32 → 8.4–8.7) | – |
| ⚪ | D.19 | CI-Runner `ubuntu-latest` wechselt auf Ubuntu 26 | offen | KI – ab 2026-10-19, bis 2026-11-02 |
| ✅ | D.16 | Reaktionszeit erneut erkunden – grok-4.7 über 90 s | erledigt 2026-10-10 (ADR-052) | – |

Verschoben auf die übernächste Ausbaustufe (Landeplatz 9.15): V.20, V.21, V.23, V.24, V.33 (weiter verschoben 2026-10-18, ADR-090), V.38 (Befund in 9.3, 2026-10-18). In Phase 9 übernommen (2026-10-18, ADR-090): V.35 → 9.3–9.9 und 9.12, V.36 → 9.10, V.37 → 9.11, V.34 → 9.13. In Phase 8 übernommen (2026-10-13, ADR-081): V.29 → 8.4, V.31 → 8.5, V.30 → 8.6, V.32 → 8.7, V.27 → 8.8, V.22 → 8.9, V.28 → 8.10, V.25 → 8.11, V.26 → 8.12 (Erkundung). In Phase 7 übernommen (2026-10-12, ADR-068): V.16 → 7.2, V.14 → 7.3, V.1 → 7.4, V.8 → 7.5, V.2 → 7.6. Früher: in Phase 6 übernommen (2026-10-11, ADR-059): V.6 → 6.8, V.7 → 6.9, V.9 → 6.7, V.10 → 6.3, V.12 und V.17 → 6.1, V.13 → 6.4, V.15 → 6.2, V.18 → 6.5, V.19 → 6.6. Verworfen (ADR-059): V.3, V.4, V.5, V.11.

---

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

### Phase 2: Grundgerüst – Typ: UMSETZUNG – ABGESCHLOSSEN (2026-09-26)

**Phasen-Bilanz:** 7 Schritte (ursprünglich 7, Wucherungs-Schwelle nicht berührt), alle `[ERLEDIGT]` am 2026-09-26. Ergebnisse: Projektgerüst mit allen CI-Gates (ADR-015); `storage` mit atomarem Schreiben und neu aufbaubarem SQLite-Index, PyYAML für den Dateikopf (ADR-016); `canon` mit sechs Kategorien und Markdown-Import; `manuscript` mit Roman, Kurzgeschichte, Fragment; `api` mit Anmeldung nach ASVS L2 (ADR-017, ADR-018 reaktiv); `ui` mit CodeMirror-Editor, CSP und End-to-End-Tests (ADR-019). FR-002, FR-005, FR-007, FR-016 erledigt. 224 Python-Tests (99,94 %), 32 Komponenten-Tests (99 %), 4 End-to-End-Tests; zwei Sicherheitsprüfungen durch getrennte Instanz. Reaktiv-Quote 1/10. Pflichtfrage am Phasenende: weiterbauen (ADR-020). Detail-Schritte: [`docs/archiv/fahrplan-phase-2.md`](archiv/fahrplan-phase-2.md).

### Phase 3: Schreiben mit KI – Typ: UMSETZUNG – ABGESCHLOSSEN (2026-09-27)

**Phasen-Bilanz:** 9 Schritte (ursprünglich 9, Wucherungs-Schwelle nicht berührt), alle `[ERLEDIGT]` am 2026-09-26/27. Ergebnisse: `ai_gateway` mit Anbieter-Schnittstelle und OpenRouter-Adapter (ADR-021); `context` mit Token-Budget, Figuren-Schreibweise, `@`-Verweisen, Kurzfassungen und Gast-Figuren; Weiterschreiben mit Streaming und Szenen-Einstieg in `api.flows`; Fakt → Kanon; Modell je Geschichte und Verbrauch je Monat (ADR-023). FR-001, 003, 004, 008, 009, 011, 012, 013, 015, 017, 018, 024, 025 erledigt; FR-010 teilweise (Referenzumfang D.4). Reaktionszeit verfehlt (ADR-022, Erkundung D.6 vor 4.8). 377 Python-Tests (99,78 %), 96 Komponenten-Tests (98,2 %), 8 End-to-End-Tests; jede Abnahme mit echten Läufen und blinder Bewertung. Reaktiv-Quote 1/10. Pflichtfrage am Phasenende: weiterbauen, Geschichtenseite in 4.1 aufteilen, Kanon-Treue in 4.8 messen (ADR-024). Detail-Schritte: [`docs/archiv/fahrplan-phase-3.md`](archiv/fahrplan-phase-3.md).

### Phase 4: Stabilisierung und erstes öffentliches Deployment – Typ: STABILISIERUNG – ABGESCHLOSSEN (2026-10-08)

**Phasen-Bilanz:** 16 Schritte (ursprünglich 8; Wucherungs-Schwelle erreicht, STOPP und Neuplanung 2026-10-08, ADR-042), alle `[ERLEDIGT]` zwischen 2026-09-27 und 2026-10-08. Ergebnisse: Qualitäts-Härtung (4.1), Host gehärtet und von außen geprüft (4.2), Sicherung mit erprobter Wiederherstellung (4.3, ADR-036), Notfall-Handbuch (4.4), unabhängige Sicherheitsprüfung (4.5), Gate mit acht Prüfpunkten (4.6; Ablage der Sicherungs-Zugangsdaten nachgeholt in D.11, ADR-038), öffentlich seit 2026-09-30 (4.7, ADR-039), Funktionstest und erstes echtes Kapitel ohne Kanon-Widerspruch (4.8; NFR Kanon-Treue `[BELASTBAR]`), Entwicklung auf macOS (4.9), Einpassung in den VPS (4.10), Branch-Schutz (4.11), Proxy auf unterstützter Linie (4.12), kürzerer Einrichtungscode (4.13, ADR-041), Befunde des Funktionstests behoben (4.14–4.16). v0.1.0 als Vorabversion (ADR-043). Reaktiv-Quote 0/10. Pflichtfrage: gezielt umbauen (ADR-042). 410 Python-Tests (99,79 %), 102 Komponenten-Tests (98,67 % Zeilen, 96,53 % Zweige), 8 End-to-End-Tests. Detail-Schritte: [`docs/archiv/fahrplan-phase-4.md`](archiv/fahrplan-phase-4.md).

### Phase 5: Alltagstauglichkeit und Soll-Anforderungen – Typ: UMSETZUNG – ABGESCHLOSSEN (2026-10-11)

**Phasen-Bilanz:** 26 Schritte (ursprünglich 13; Wucherungs-Schwelle erreicht, nicht überschritten), 24 `[ERLEDIGT]` zwischen 2026-10-08 und 2026-10-11, 2 `[VERSCHOBEN]` (5.4 → V.16, 5.25 → V.13 → 6.4). Ergebnisse: grok-4.6 als Startmodell (5.7), Chat-Aufbau der Schreibseite (5.11), Modell-Katalog mit Favoriten (5.12), Verlauf der Anweisungen (5.13), atmosphärische Schreibweise je Geschichte (5.6), Bedienung am Smartphone und App-Installation (5.2, 5.21), Kanon-Vorschläge ohne `@` (5.1), Nachweis D.4 an der Geschichte des Eigentümers (ADR-057), v1.0.0 freigegeben (5.14, ADR-058), Planung von Phase 6 (5.5, ADR-059). Reaktiv-Quote am Ende 0/10. Pflichtfrage: weiterbauen mit Umbau (ADR-060). Detail-Schritte: [`docs/archiv/fahrplan-phase-5.md`](archiv/fahrplan-phase-5.md).

### Phase 6: Schreiballtag, Schutz und Kanon-Werkzeuge – Typ: UMSETZUNG – ABGESCHLOSSEN (2026-10-12)

**Phasen-Bilanz:** 14 Schritte (ursprünglich 12; +6.13 Spike, +6.14 auf Wunsch des Eigentümers als Ausnahme; Wucherungs-Schwelle > 15 nicht erreicht), alle `[ERLEDIGT]` zwischen 2026-10-11 und 2026-10-12. Ergebnisse: Umbau von Schreibbereich und Anfrage-Zusammenstellung (6.11, 6.12), Umfang des Kapitels (6.1), Kurzfassung im eigenen Reiter (6.2), Kanon vor den letzten Seiten nach Spike (6.13, 6.3, ADR-062), Schutz der Server-Antworten und CSP (6.4, 6.6, ADR-063; Proxy-Label entfernt), Datenschutz im OpenRouter-Konto (6.5), KI-Weltenbauer mit Websuche (6.7, ADR-064), Austausch mit SillyTavern in beide Richtungen (6.8, 6.9, ADR-065, ADR-066; FR-030), Darstellung „Schwarz“ (6.14). Reaktiv-Quote am Ende 0/10. Pflichtfrage: gezielt umbauen (ADR-067). 560 Python-Tests (99,85 %), 217 Komponenten-Tests (98,16 % Statements), 11 End-to-End-Tests. Detail-Schritte: [`docs/archiv/fahrplan-phase-6.md`](archiv/fahrplan-phase-6.md).

### Phase 7: Zeitlinie, Publizieren, Gestaltung und Bilder – Typ: UMSETZUNG – ABGESCHLOSSEN (2026-10-13)

**Phasen-Bilanz:** 16 Schritte (ursprünglich 8; +7.9 Befund, +7.10–7.13 aus dem Zuschnitt von 7.6, +7.14, +7.15 aus Vorlagen, +7.16 auf Wunsch des Eigentümers; Wucherungs-Schwelle > 16 erreicht, nicht überschritten), 15 `[ERLEDIGT]` zwischen 2026-10-12 und 2026-10-13, 7.15 verschoben → V.33. Ergebnisse: Umbau (7.1), Zeitstrahl mit Kalenderdaten (7.2, ADR-069), Schreibweise wirkt auf bestehende Kapitel (7.3, ADR-070), E-Book (7.4, ADR-071), Aussehen „Buch“ (7.5), Bilder an Kanon-Einträgen (7.6, ADR-072), Karten mit Zoom und Markierungen (7.10, 7.14, ADR-073, ADR-079), Titelbild (7.11, ADR-075), Bilder erzeugen und beschreiben (7.12, 7.13, ADR-074, ADR-076, ADR-077), Abschnitt „Aussehen“ (7.16, ADR-078); Querschnitt D.18 (Datentrennung). Reaktiv-Quote am Ende 0/10. Pflichtfrage: gezielt umbauen (ADR-080). 734 Python-Tests (98,88 %), 273 Komponenten-Tests (94,45 % Zeilen), 11 End-to-End-Tests. Detail-Schritte: [`docs/archiv/fahrplan-phase-7.md`](archiv/fahrplan-phase-7.md).

### Phase 8: Fundament, Datentrennung, Weltenbauer und Kanon-Verknüpfung – Typ: UMSETZUNG – ABGESCHLOSSEN (2026-10-18)

**Phasen-Bilanz:** 13 Schritte (ursprünglich 13, Wucherungs-Schwelle nicht berührt), alle `[ERLEDIGT]` zwischen 2026-10-13 und 2026-10-18. Ergebnisse: Umbau von Kanon-Dienst und Kartenansicht, fehlende Tests und angehobene Mindestwerte mit Ratsche (8.1–8.3, ADR-080, ADR-082); Befunde der Datentrennung behoben – Übernehmen ersetzt Abschnitte, Bildvorlagen aus „Aussehen“ und Geografie, Kurzfassung nur mit dem Stand davor, Weltenbauer mit Regeln und Zeitlinie im Wortlaut (8.4–8.7, ADR-083 bis ADR-086); Weltenbauer behält das Gespräch und arbeitet aus dem Manuskript (8.8, 8.9, ADR-087); Zeitlinie mit Jahr, Datum und Uhrzeit (8.10); Verweise zwischen Kanon-Einträgen mit Probe nach Regel-002 (8.11, ADR-088); Erkundung wandernde Figuren (8.12 → V.34); Planung mit Vision-Abgleich und Pflichtfrage: gezielt umbauen (ADR-089), Phase 9 (ADR-090). Reifegrade unverändert; NFR Kontexttreue bleibt `[VORLÄUFIG]` bis 9.14. 805 Python-Tests (99,84 %), 398 Komponenten-Tests (98,84 % Zeilen), 11 End-to-End-Tests. Detail-Schritte: [`docs/archiv/fahrplan-phase-8.md`](archiv/fahrplan-phase-8.md).

### Phase 9: Verlässlicher Kanon, Bilder und Verwaltung – Typ: UMSETZUNG

**Ziel:** Die Gliederung der Kanon-Einträge verlässlich machen (Pflichtfrage, ADR-089) und darauf die Befunde des Eigentümers umsetzen: gegliederte Einträge und Beziehungen, Bilder vom Bedarf her mit Herkunft und festem Modell, Löschen oder Archivieren, Verbrauch je Welt und Geschichte; dazu eine Erkundung zu Quellen und Recherche, der Ausbau der Gast-Figuren und eine erneute Prüfung der Kontexttreue.

**Abschlusskriterium:** Schritte 9.1–9.15 `[ERLEDIGT]`, `[VERWORFEN]` mit ADR oder `[VERSCHOBEN]` mit Ziel-Schritt.

**Reifegrad-Erwartung am Phasenende:** unverändert `[BELASTBAR]`; Datenmodell- und Ablauf-Entscheidungen (9.1, 9.3, 9.4, 9.6–9.9, 9.11, 9.13) werden per ADR entschieden, bevor gebaut wird; NFR Kontexttreue nach 9.14 `[BELASTBAR]` oder begründet `[VORLÄUFIG]`.

**Ursprünglicher Schrittplan:** 15 Schritte, festgehalten am 2026-10-18 (ADR-089, ADR-090). Wucherungs-Schwelle: Default aus `docs/project-context.md` Abschnitt 6 (Faktor 2 und mindestens 5 zusätzliche Schritte, also mehr als 30); neue Wünsche während der Phase werden V-Schritte mit Landeplatz 9.15.

**Reihenfolge (Eigentümer, 2026-10-18; ADR-090):** Fundament 9.1–9.2, Kanon 9.3–9.4, Bilder 9.5–9.8, Verwaltung 9.9–9.11, Erkundung 9.12, Gäste 9.13 (nach der Probe des Eigentümers), Kontexttreue 9.14; zuletzt 9.15.

**Pflichtfrage am Phasenende:** ADR „Weiterbauen, umbauen oder neu aufsetzen" – Nummer wird beim Phasenabschluss vergeben

#### 9.1: Gliederung im Server verlässlich – Abschnitte und Namenserkennung

- **Status:** ✅ ERLEDIGT (2026-10-18) – Vorlage α/β vorgelegt (Empfehlung α, Konfidenz hoch); Eigentümer per Auswahlfrage: „A – Text mit Überschriften (Empfohlen)“ → ADR-091, Regel-003. PR #173: CI grün (4 von 4 Pflicht-Checks), auf Anweisung des Eigentümers zusammengeführt (`f479509`)
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – zu Beginn Vorlage α (Abschnitte bleiben in Markdown, der Server kennt sie je Kategorie) gegen β (Felder im Dateikopf): Datenmodell (Kategorie 4). Der Umbau selbst bleibt innerhalb der Module, Schnittstellen höchstens additiv (ADR-089)
- **Empfohlene Klasse:** Entscheidung – Datenmodell-Weiche für V.35 G1/G2 (Eskalations-Auslöser 1).
- **Eingangskriterien:** alle berührten Bestandteile `[BELASTBAR]`
- **Anforderungen (ab Klasse M):** FR-002, FR-003
- **Zu tun:** Befunde 1 und 7 der Bewertung (`docs/research/bewertung-phase-8.md`). (1) Eine Regel für Abschnitte im Server (`canon`): Lesen, Ersetzen und Ergänzen nach der Regel aus `ui/src/sections.ts`; `render` (`context/parts.py`), Markdown-Import (`canon/importers/markdown.py`) und Aussehen (`context/appearance.py`) nutzen sie; gemeinsame Testfälle für Server und Oberfläche. (2) Namenserkennung (`ui/src/references.ts`, `context/writing.py`, `context/manuscript_hits.py`, `ui/src/canonFact.ts`) auf eine Regel bringen, Genitiv einheitlich. (3) Vorlage α/β mit der Sicht des Eigentümers („Verlässlichkeit“, V.35) und Vision 7 (lesbare Dateien, FR-020).
- **Akzeptanzkriterien:** Vorlage und ADR; dieselben Testfälle grün in Server und Oberfläche; „Aussehen“ wird an allen Stellen gleich gefunden – auch leer, doppelt, unterteilt; übriges Verhalten unverändert (Tests ohne geänderte Erwartungen); Anfrage beim Schreiben byte-gleich, sonst Probe nach Regel-002.
- **Betroffene Module:** canon, context, ui
- **Reifegrad-Wirkung:** keine (Datenmodell bleibt `[BELASTBAR]` nach ADR)
- **Artefakte:** Code, Tests, ADR
- **Notizen:** Aus ADR-089. Trägt 9.3–9.5 und 9.13. Umsetzung (ADR-091): `canon/sections.py`, `canon/names.py`, gemeinsame Testfälle `tests/shared/sections.json` (47 Fälle) und `tests/shared/names.json` (27 Fälle) in Server und Oberfläche; Vorlage und Import nehmen die Abschnittsnamen aus `SECTIONS` (Import erkennt jetzt „Wesen und Geschichte“); Namenserkennung an vier Stellen auf eine Regel. Lokal: pytest 886 grün, Abdeckung 99,85 % (`canon/sections.py` und `canon/names.py` je 100 %); vitest 459 grün, 98,66 / 95,35 / 97,87 / 98,85 % (Anweisungen / Zweige / Funktionen / Zeilen); Playwright 11 grün; ruff, mypy, bandit, eslint, prettier, tsc, Pre-Commit grün; bestehende Tests ohne geänderte Erwartungen (die Fälle aus `ui/src/sections.test.ts` liegen unverändert in der gemeinsamen Datei). Anfrage beim Schreiben unverändert: `find_references` alt und neu an 274 Kombinationen, 0 Unterschiede.

#### 9.2: End-to-End-Tests für die Abläufe der Phasen 6–8

- **Status:** ✅ ERLEDIGT (2026-10-18) – PR #175: CI grün (4 von 4 Pflicht-Checks; im Protokoll nur der bekannte Hinweis zu Ubuntu 26 → D.19, keine Bündelgrößen-Warnung), auf Anweisung des Eigentümers zusammengeführt (`65a0f13`)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein für die Tests; ja für das Umbenennen der CI-Schritte (Kategorie 7) – freigegeben mit ADR-090
- **Empfohlene Klasse:** Routine – Test-Erstellung und Testwartung.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-029, FR-035
- **Zu tun:** Befund 3 der Bewertung: Playwright-Pfade für den Weltenbauer mit Übernahme-Fenster (8.8), „Abschnitt ersetzen“ (8.4) sowie Karte oder Bild (7.6, 7.10); Antwortformen des Servers gegen die Typen in `ui/src/api/` prüfen, soweit es ohne neues Werkzeug geht (ein Generator nur mit Vorlage, Kategorie 3). CI-Schrittnamen auf die geltenden Schwellen berichtigen (`.github/workflows/ci.yml` Zeilen 65 und 96).
- **Akzeptanzkriterien:** mindestens drei neue End-to-End-Tests grün in der CI; Schrittnamen nennen dieselben Schwellen wie `pyproject.toml` und `vite.config.ts`.
- **Betroffene Module:** ui, api (nur Tests)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Tests, CI-Konfiguration
- **Notizen:** Aus ADR-089. Umsetzung (Tests von Unteragenten der Routine-Klasse geschrieben, von der bauenden KI geprüft): vier neue Playwright-Tests in `e2e/skriptorium.spec.ts` gegen den echten Server, KI-Ströme im Browser ersetzt – Weltenbauer mit Übernahme-Fenster, Gespräch bleibt, zweite Fassung überschreibt (8.8); Bild hochladen, beschreiben lassen, „Aussehen“ ersetzen (7.6, 7.13, 8.4); Karte hochladen und markieren, Punkt führt zum Eintrag (7.10, 7.14); Karte beschreiben, Rückfrage abbrechen und „Darunter ergänzen“ (7.13, 8.4). Die Modellliste von OpenRouter ist in zwei Tests durch eine an `ModelList` typisierte Liste ersetzt (sonst hinge der Lauf am Netz). Antwortformen: `tests/api/test_ui_contract.py` zeichnet 73 echte Antworten und Strom-Ereignisse auf (`tests/shared/api-responses.json`), `ui/src/api/contract.test.ts` prüft sie mit der Compiler-API des vorhandenen `typescript` gegen die Typen in `ui/src/api/` – überzählige, fehlende und falsch getypte Felder, Werte außerhalb von Literal-Unionen; Gegenprobe mit fünf absichtlich beschädigten Antworten im selben Test. Kein neues Werkzeug. Gefunden: Das `start`-Ereignis von „Bild/Karte beschreiben“ und „Aussehen herauslösen“ trägt `web_search` (der Server nutzt den Strom des Weltenbauers), `DescribeEvent` kannte das Feld nicht – Typ auf den Weltenbauer-Strom umgestellt (nur Typ, keine Laufzeitwirkung, Server unverändert). CI-Schrittnamen: Python „global 99 %“, TypeScript „98 % Lines und Statements, 97 % Functions, 94 % Branches“ (ADR-090). Lokal: Playwright 15/15 (25,6 s; Unteragent drei Läufe je 15/15), pytest 887 (99,85 %; canon 100 %, context 99 %), vitest 467 (98,66 / 95,3 / 97,87 / 98,85 % Anweisungen / Zweige / Funktionen / Zeilen), ruff, mypy, bandit, pip-audit, eslint, prettier, tsc, npm audit grün.

#### 9.3: Gegliederte Einträge je Art (V.35 B2, G1/G2)

- **Status:** 🟠 IN ARBEIT (seit 2026-10-18, Branch `feat/9.3-gegliederte-eintraege`) – entschieden mit Mockup (ADR-092) und lokal umgesetzt; Proben mit echter KI gelaufen (2026-10-19, mit Nachlauf; Notiz unten): keine Verschlechterung; vom Eigentümer bestätigt (2026-10-19, im Chat: „9.3 bestätigt“); offen: Zusammenführen und grüne CI (lokale Session)
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage und Mockup zu Beginn)
- **Abhängigkeiten:** 9.1
- **Freigabepflichtig:** ja – Gliederung je Kategorie ist Datenmodell-Konvention (Kategorie 4); Anfrage des Weltenbauers (Kategorie 1)
- **Empfohlene Klasse:** Entscheidung – Datenmodell-Konvention (Eskalations-Auslöser 1).
- **Eingangskriterien:** 9.1 erledigt
- **Anforderungen (ab Klasse M):** FR-002, FR-029
- **Zu tun:** Für jede Kategorie eine feste Gliederung (z. B. Figur: Aussehen, Wesen, Geschichte, Beziehungen; eigene für Ort, Gegenstand, Regel, Kultur, Zeitlinie) – beim Anlegen von Hand (Vorlage, ADR-083) und durch den Weltenbauer (`context/worldbuilder.py`); der Import erkennt die Abschnitte (Fallstrick aus V.35: ein unbekannter Abschnitt auf Namensebene wird ein eigener Eintrag); Bestand bleibt lesbar.
- **Akzeptanzkriterien:** Vorlage mit Mockup und ADR; Tests je Kategorie; der Weltenbauer liefert gegliederte Einträge (Probe mit echter KI-Antwort); Eigentümer bestätigt.
- **Betroffene Module:** canon, context, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR, Mockup
- **Notizen:** Aus V.35 (ADR-090). Entschieden 2026-10-18 mit Mockup vorher/nachher (Formular, Figur Anselm Drach, Ort Aschturm; Testwelt Salzmark) → ADR-092. Umsetzung (Unteragent der Routine-Klasse, geprüft und nachgebessert von der bauenden KI): `canon/sections.py` – `SECTIONS` je Art, frühere Namen (`FORMER_SECTIONS`: „Wesen und Geschichte“), `is_section_name` je Art, `drop_empty_sections`, `nest_headings`; gemeinsame Liste und Vorlagen-Fälle in `tests/shared/sections.json`, Spiegel und `templateFor` in `ui/src/sections.ts`; Import erkennt die Namen nur in Einträgen der passenden Art (Gruppe oder `Kategorie:`-Zeile), bei bekannter Art reicht ein fester Abschnitt, damit eine Überschrift ohne Text ein Eintrag bleibt (eigener Abschnitt wie „Herkunft“ zerfällt nicht – Nachbesserung der bauenden KI); Formular mit Vorlage, Wechsel der Art, Hinweis, 12 Zeilen; Weltenbauer-Rahmen aus `SECTIONS`; `render` rückt die Überschriften eines Eintrags unter den Namen (Ebene 3) und lässt leere Abschnitte weg. Messung an den Testwelten: alle 52 Einträge ändern sich in der Anfrage (ihr Text beginnt mit `# Name`, wird `### Name`), +104 Zeichen gesamt, keine leeren Abschnitte. Lokal: pytest 931 (99,85 %; canon 100 %, context 99 %), vitest 485 (98,67 / 95,29 / 97,88 / 98,86 %), Playwright 15/15, ruff, mypy, bandit, eslint, prettier, tsc grün; Bildschirmfotos des echten Formulars (Desktop, Smartphone) entsprechen dem Mockup. Befund SillyTavern-Export → V.38.
  - **Offene Proben (Cloud-Session, Branch `feat/9.3-gegliederte-eintraege`):** (1) Regel-002 mit `spikes/regel-002/lauf.py`: `VARIANTE=vorher` auf `main`, `VARIANTE=nachher` auf dem Branch, je 3 Läufe an Salzmark und Glimmergrund, Modell grok-4.6, Länge mittel; Auswertung mit `auswertung.py` – Wirkung nur, was in beiden Geschichten außerhalb der Vorher-Spannweite liegt; erwartet: keine Verschlechterung. (2) Weltenbauer mit echter Antwort in der Salzmark: je eine neue Figur, ein Ort, ein Gegenstand, eine Kultur; geprüft wird, dass die Abschnitte der Art in der Reihenfolge stehen, leere fehlen, nichts erfunden ist und die Import-Vorschau jeden Eintrag ganz lässt.
  - **Zweiter Versuch (2026-10-19, Cloud-Session):** nicht gelaufen – die Session lief in der Umgebung „Flight_Research“, `OPENROUTER_API_KEY` nicht gesetzt (Logbuch); keine Kosten. Vorbereitet ohne KI: `spikes/weltenbauer-9.3/probe.py` mit README (Aufträge mit `@Kerrow`, `@Tomas Rehl`, `@Totensitte`, damit Texte vorhandener Einträge mitgehen und Widersprüche prüfbar sind; Prüfung (a), (b), (d) maschinell, Trockenlauf und Selbsttest der Prüflogik grün). Vorher-Stand geprüft: ein Worktree auf `2ac204b` nutzt seinen eigenen Code; die erste Anfrage der Kette ändert sich wie erwartet (Salzmark 38 → 9 Überschriften der Ebene 1, +61 Zeichen; Glimmergrund 36 → 13, +46 Zeichen).
  - **Dritter Versuch (2026-10-19, Cloud-Session in der Umgebung „OPENROUTER_API_KEY“, Branch `spike/9.3-proben-ki`):** beide Proben gelaufen, Kosten zusammen ca. 2,99 $. (1) Regel-002 (vorher `2ac204b`, nachher `40a02eb` = `src/` von `1371264`, 12 Ketten, 84 Vorschläge, alle `stop`): gezählt keine Wirkung – einzig „wörtlich %“ liegt in beiden Geschichten außerhalb der Vorher-Spannweite, aber gegenläufig (Salzmark 0,40 gegen 0,44–0,76; Glimmergrund 0,71 gegen 0,00–0,39). Widersprüche zum Kanon (verblindet, getrennte Instanz): nachher je Geschichte 1 eindeutiger in 3 Ketten (Salzmark: Totenname am Abend; Glimmergrund: „mein Teuerster“ zu Wendt), vorher 0 – nach dem Wortlaut von Regel-002 ein Befund; die Rate entspricht der von grok-4.6 aus 5.26, beide Einzelheiten stehen in beiden Ständen im Wortlaut in der Anfrage (Deutung: Streuung; klären nur weitere Läufe). Einzelheiten `spikes/regel-002/README.md`. (2) Weltenbauer: alle vier Aufträge gegliedert je Art in Reihenfolge, Ebene 3, kein Füllwerk, Import ganz; zwei knappe Abweichungen vom Kanon (Siegelring am Haken im Zollhaus – Text des Rings war nicht in der Anfrage; Fischerin „meidet den Südhafen“, obwohl der Nordkai dazugehört); `spikes/weltenbauer-9.3/README.md`. Nachlauf auf Wahl des Eigentümers („3 weitere Läufe je Seite“, 2,90 $): über je 6 Ketten liegt keine Kennzahl – gezählt oder von Hand – nachher in beiden Geschichten außerhalb der Vorher-Spannweite; eindeutige Widersprüche vorher 1, nachher 2 in je 12 Ketten (Glimmergrund vorher jetzt ebenfalls 1) – der Befund war Streuung, nach Regel-002 keine Wirkung und keine Verschlechterung. Gesamtkosten der Proben 5,88 $. Eigentümer bestätigt 9.3 am 2026-10-19.

#### 9.4: Beziehungen mit Art und Rückverweis (V.35 B3)

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** 9.1, 9.3
- **Freigabepflichtig:** ja – Datenmodell-Konvention (Kategorie 4), ggf. Anfrage-Zusammenstellung (Kategorie 1); ADR-088 hatte ein Feld „Verbunden mit“ verworfen
- **Empfohlene Klasse:** Entscheidung – Datenmodell und Kontext-Zusammenstellung (Eskalations-Auslöser 1).
- **Eingangskriterien:** 9.3 erledigt
- **Anforderungen (ab Klasse M):** FR-002, FR-013
- **Zu tun:** Beziehungen zwischen Figuren sichtbar und gegliedert festhalten (z. B. Abschnitt „Beziehungen“ mit Art: „verheiratet mit @Kael“), auch wenn der Weltenbauer mehrere Figuren in einem Auftrag anlegt; anzeigen, wer auf einen Eintrag verweist; Wirkung auf die Auffüllung nach ADR-088 prüfen.
- **Akzeptanzkriterien:** Vorlage und ADR; Tests; Probe nach Regel-002, falls die Anfrage beim Schreiben betroffen ist; Eigentümer bestätigt.
- **Betroffene Module:** canon, context, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR
- **Notizen:** Aus V.35 (ADR-090).

#### 9.5: Bilder vom Bedarf her; Karte aus den Orten (V.35 G4, B4)

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** 9.3
- **Freigabepflichtig:** ja – ändert die Vorbelegung aus ADR-084
- **Empfohlene Klasse:** Entscheidung – Änderung einer per ADR festgelegten Vorbelegung (Eskalations-Auslöser 1).
- **Eingangskriterien:** 9.3 erledigt
- **Anforderungen (ab Klasse M):** FR-035
- **Zu tun:** Je Bildart (Figur, Gegenstand, Ort, Karte, Sonstiges) festlegen, welche Angaben das Bild braucht, und prüfen, ob sie nach 9.3 verlässlich vorliegen (G4); „Karte erzeugen“ mit den Orten der Welt vorbelegen statt nur mit „Geografie – Name der Karte“ (B4, `ui/src/imagePrompts.ts`).
- **Akzeptanzkriterien:** Vorlage mit Tabelle je Bildart und ADR; Tests; Eigentümer bestätigt.
- **Betroffene Module:** ui, ggf. canon
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR
- **Notizen:** Aus V.35 (ADR-090).

#### 9.6: Herkunft von Bildern – Modell und Anweisung speichern (V.35 B1)

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – neue Angaben im Dateikopf (Kategorie 4)
- **Empfohlene Klasse:** Entscheidung – Datenmodell (Eskalations-Auslöser 1).
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-035
- **Zu tun:** Beim Übernehmen eines erzeugten Bildes Modell und Anweisung mit dem Bild ablegen (Kopffeld `bilder`, `canon/images.py`), ebenso bei Titelbildern und Karten; in der Oberfläche anzeigen. Nebenfrage aus V.35 mit vorlegen: auch für KI-Text die vollständige Anfrage festhalten?
- **Akzeptanzkriterien:** Vorlage und ADR; Tests; Bilder ohne Angaben bleiben gültig; Eigentümer bestätigt.
- **Betroffene Module:** canon, manuscript, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR
- **Notizen:** Aus V.35 (ADR-090).

#### 9.7: Einstellungsseite – Modell je Aufgabe (V.35 G3, B6)

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** UMSETZUNG (mit Mockup und Vorlage zu Beginn)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – neue Ablage unter `system/` und neue Endpunkte (Kategorien 4 und 5, additiv)
- **Empfohlene Klasse:** Entscheidung – Datenmodell und API-Vertrag (Eskalations-Auslöser 1).
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-018, FR-028
- **Zu tun:** Eine Seite, auf der der Eigentümer je Aufgabe ein Modell festlegt – Schreiben (Voreinstellung), Weltenbauer, Kapitel-Kurzfassung, Gesamtzusammenfassung, Bild beschreiben, Aussehen herauslösen, Bilder erzeugen – nach dem Muster der Favoriten (ADR-055); das Bildmodell wird gespeichert (B6). Das Modell je Geschichte (ADR-023) bleibt.
- **Akzeptanzkriterien:** Mockup und ADR; Tests; Eigentümer bestätigt.
- **Betroffene Module:** api, ai_gateway, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR, Mockup
- **Notizen:** Aus V.35 (ADR-090).

#### 9.8: Bild zu Bild (V.35 B7)

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** 9.6
- **Freigabepflichtig:** ja – Bild geht an den Anbieter (Kategorie 6 prüfen), neue Eingabe der Schnittstelle (Kategorie 5)
- **Empfohlene Klasse:** Entscheidung – neuer Ablauf mit Datenfluss nach außen (Eskalations-Auslöser 1).
- **Eingangskriterien:** 9.6 erledigt (Herkunft auch für abgeleitete Bilder)
- **Anforderungen (ab Klasse M):** FR-035
- **Zu tun:** Ein vorhandenes Bild als Grundlage einer Bilderzeugung nutzen (`ai_gateway/images.py`, `ImageOrder`); welche Modelle über OpenRouter das können und was es kostet, gehört in die Vorlage; getrennte Prüfung, falls Kategorie 6 berührt ist.
- **Akzeptanzkriterien:** Vorlage mit unterstützten Modellen und Kosten, ADR; Tests; Probe mit echtem Bild; Eigentümer bestätigt.
- **Betroffene Module:** ai_gateway, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR
- **Notizen:** Aus V.35 (ADR-090). V.33 (Bilder beim Schreiben mitschicken) ist etwas anderes und bleibt bei 9.15.

#### 9.9: Geschichten, Welten und Kapitel löschen oder archivieren (V.35 B5)

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage und Mockup zu Beginn)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – Löschen ist destruktiv (`CLAUDE.md` Abschnitt 8, Kriterium 6), Datenmodell und API (Kategorien 4 und 5)
- **Empfohlene Klasse:** Entscheidung – destruktiver Ablauf und Datenmodell (Eskalations-Auslöser 1).
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** neue Anforderung, in der Vorlage anzulegen
- **Zu tun:** Für Geschichten, Welten und Kapitel klären, ob gelöscht, archiviert oder beides; die Kaskade festlegen (Bilder, Karten, Verlauf, Gast-Verbindungen, Markierungen, Verbrauchszeilen); Rückweg über die Sicherung (ADR-036) benennen.
- **Akzeptanzkriterien:** Vorlage mit Mockup und ADR; Tests der Kaskade; Eigentümer bestätigt.
- **Betroffene Module:** canon, manuscript, storage, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR, Mockup
- **Notizen:** Aus V.35 (ADR-090).

#### 9.10: Cache-Treffer der KI-Anbieter festhalten (V.36)

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** wie V.36 – nein für die Protokollzeile; ja, falls Verbrauchsdateien oder `/api/usage` ein neues Feld bekommen (Kategorien 4 bzw. 5, additiv)
- **Empfohlene Klasse:** Routine – klar umrissene Erweiterung des Adapters mit Tests; Entscheidung, falls Verbrauchsdateien oder `/api/usage` erweitert werden.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** keine (Kostenziel Vision 4)
- **Zu tun:** wie V.36.
- **Akzeptanzkriterien:** wie V.36.
- **Betroffene Module:** ai_gateway, ggf. api und ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ggf. ADR
- **Notizen:** Aus V.36 (ADR-090).

#### 9.11: Verbrauchsstatistik je Welt und je Geschichte (V.37)

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage und Mockup zu Beginn)
- **Abhängigkeiten:** 9.10
- **Freigabepflichtig:** ja – wie V.37: Datenmodell (Option C aus ADR-023, Kategorie 4), neuer Endpunkt (Kategorie 5, additiv)
- **Empfohlene Klasse:** Entscheidung – Datenmodelländerung gegen eine bestehende Entscheidung (Eskalations-Auslöser 1).
- **Eingangskriterien:** 9.10 erledigt
- **Anforderungen (ab Klasse M):** neue Anforderung, in der Vorlage anzulegen
- **Zu tun:** wie V.37; dazu das Speicherlayout der Verbrauchsdateien entscheiden – Befund 2 der Bewertung (je Anfrage wird die ganze Monatsdatei neu geschrieben: 83 ms bei 400, 431 ms bei 2.000 Einträgen) mit der echten Zahl der Anfragen je Monat auf dem Server (nur Anzahl, lesend).
- **Akzeptanzkriterien:** wie V.37.
- **Betroffene Module:** api, ui; ggf. canon und manuscript
- **Reifegrad-Wirkung:** keine (Datenmodell bleibt `[BELASTBAR]` nach ADR)
- **Artefakte:** Code, Tests, ADR, Mockup
- **Notizen:** Aus V.37 (ADR-090).

#### 9.12: Quellen für Worldbuilding und Namen; eigener Recherche-Baustein – Erkundung (V.35 H1, V1)

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** ERKUNDUNG innerhalb der UMSETZUNG-Phase (wie 8.12)
- **Schritt-Art (nur ERKUNDUNG):** Vergleichsstudie
- **Zeitbox (nur ERKUNDUNG):** eine Session, dann Zwischenstand
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein für die Erkundung; jede Anbindung ist eine neue externe Abhängigkeit (Kategorie 3)
- **Empfohlene Klasse:** Entscheidung – bereitet eine Abhängigkeits- und Kostenentscheidung vor.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-029
- **Zu tun:** H1: Anleitungen zum Worldbuilding und Seiten zur Namensbildung sichten – Verlässlichkeit, Nutzungsbedingungen, Einbindung in den Weltenbauer. V1: eigener Recherche-Baustein gegen die Websuche über OpenRouter (ADR-064) – Kosten je Anfrage, Abhängigkeit, Datenschutz.
- **Akzeptanzkriterien:** Erkenntnisdokument `docs/research/quellen-und-recherche.md` mit Optionen und Kosten; Vorlage an den Eigentümer; Umsetzung als eigener Schritt mit Landeplatz 9.15.
- **Betroffene Module:** keine (nur lesen)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Erkenntnisdokument, Logbuch-Eintrag
- **Notizen:** Aus V.35 (ADR-090).

#### 9.13: Gast-Figuren ausbauen – Weltbezug je Gast (V.34)

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** 9.1
- **Freigabepflichtig:** ja – wie V.34: Datenmodell und Kontext-Zusammenstellung (Kategorien 1 und 4)
- **Empfohlene Klasse:** Entscheidung – Datenmodell und Kontext-Zusammenstellung (Eskalations-Auslöser 1).
- **Eingangskriterien:** Probe des Eigentümers mit einer Gast-Figur (Eingangskriterium aus V.34); 9.1 erledigt
- **Anforderungen (ab Klasse M):** FR-016, FR-017
- **Zu tun:** wie V.34 (Option A aus `docs/research/wandernde-figuren.md`).
- **Akzeptanzkriterien:** wie V.34.
- **Betroffene Module:** manuscript, context, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR
- **Notizen:** Aus V.34 (ADR-090). Eigentümer 2026-10-18: Probe „später“.

#### 9.14: Kontexttreue beim Referenzumfang erneut prüfen

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** ERKUNDUNG innerhalb der UMSETZUNG-Phase
- **Schritt-Art (nur ERKUNDUNG):** Messung
- **Zeitbox (nur ERKUNDUNG):** eine Session
- **Abhängigkeiten:** 9.4 (9.1–9.4 können die Anfrage ändern)
- **Freigabepflichtig:** nein für die Messung; die Beförderung per ADR
- **Empfohlene Klasse:** Entscheidung – kann die NFR Kontexttreue auf `[BELASTBAR]` befördern (Eskalations-Auslöser 4).
- **Eingangskriterien:** 9.4 erledigt
- **Anforderungen (ab Klasse M):** FR-010
- **Zu tun:** An der dann längsten Geschichte des Eigentümers messen, ob Handlungsstand und genannte Kanon-Einträge vollständig in der Anfrage stehen und die Anfrage unter 30.000 Token bleibt – Verfahren wie D.4 (ADR-057), lesend und mit Freigabe des Eigentümers.
- **Akzeptanzkriterien:** Messung im Logbuch; ADR mit Beförderung auf `[BELASTBAR]` oder begründetem Erkundungsbedarf.
- **Betroffene Module:** keine (nur lesen)
- **Reifegrad-Wirkung:** NFR Kontexttreue Referenzumfang `[VORLÄUFIG]` → `[BELASTBAR]` oder bleibt mit Begründung
- **Artefakte:** Logbuch-Eintrag, ADR
- **Notizen:** Befund des Vision-Abgleichs in 8.13: Die Bedingung aus ADR-062 (Abnahme durch den Eigentümer) ist seit 2026-10-11 erfüllt; Eigentümer 2026-10-18: „Erst später messen“ (ADR-090).

#### 9.15: Planung der nächsten Ausbaustufe

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 9.1–9.14
- **Freigabepflichtig:** ja – neue Phasen sind Replanning
- **Empfohlene Klasse:** Entscheidung – inhaltliche Neuplanung mit Vision-Abgleich.
- **Eingangskriterien:** Vision-Abgleich an der Phasengrenze nach Phase 9
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** V.20, V.21, V.23, V.24, V.33, V.38 (und neue V-Schritte, auch aus 9.12) in eine neue Phase überführen oder per ADR verwerfen.
- **Akzeptanzkriterien:** Jeder verschobene Schritt hat einen neuen Schritt mit ID oder `[VERWORFEN]` mit ADR.
- **Betroffene Module:** keine (Planung)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-18 (ADR-090).

### Querschnitt: datierte, ausgelöste und verschobene Schritte

Diese Schritte gehören zu keiner Phase; sie werden fällig durch ein Datum, einen Auslöser oder die Planung in 5.5. Sie zählen nicht zum Schrittplan einer Phase.

#### D.1: Wechsel Node.js 24 → Node.js 26 LTS

- **Status:** ⚪ OFFEN
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

- **Status:** ⚪ OFFEN
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
- **Notizen:** Zusatz 2026-09-26 (ADR-015): vitest 5 mitprüfen – mindestreif erst ab 2027-03-03; ist das bei D.2 noch nicht erreicht, eigenes Nachprüf-Datum im Register setzen. Kompatibilität typescript-eslint mit TypeScript 7 prüfen (8.70.1 verlangt `typescript <6.1.0`). Zusatz 2026-09-26 (ADR-019): jsdom 30 ab 2027-01-27 mindestreif – mit prüfen. Zusatz 2026-10-18 (9.2): `ui/src/api/contract.test.ts` nutzt die Compiler-API von TypeScript 6 (`createProgram`, `createCompilerHost`, `getPreEmitDiagnostics`) – bei TypeScript 7 prüfen, ob es sie noch gibt, sonst den Test umbauen.

#### D.3: Nachprüfung httpx

- **Status:** ⚪ OFFEN
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

- **Status:** ✅ ERLEDIGT (2026-10-11) – Nachweis an „Geschichte des Eigentümers“ mit Hochrechnung (ADR-057): Handlungsstand vollständig (Gesamtzusammenfassung 481 Wörter, Kurzfassungen 164/162/177), Anfrage ≤ 30.000 Token, im Betrieb ca. 23.000 Token und ca. 0,05 $ statt 125.000–140.000 Token; Einschränkung: Figuren-, Orts- und Gegenstands-Einträge gehen bei langen Kapiteln nur per `@` mit (V.10)
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 3.6
- **Frist:** kein Datum – Auslöser: eine Geschichte erreicht ≥ 500.000 Token (Entscheidung des Eigentümers, ADR-009)
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Entscheidung – der Nachweis kann die NFR Kontexttreue auf `[BELASTBAR]` befördern (Eskalations-Auslöser 4).
- **Eingangskriterien:** Auslöser erreicht (Umfang anhand der Token-Zählung aus 1.1 festgestellt)
- **Anforderungen (ab Klasse M):** keine (Nachweis der Akzeptanz von FR-010, umgesetzt in 3.6)
- **Zu tun:** Erfolgskriterien „kein Kontextverlust" und „günstiger pro Anfrage" (Vision 4) an dieser Geschichte prüfen; Kosten je Anfrage mit der Referenz (125.000–140.000 Token) vergleichen. Zusatz 2026-09-27 (aus 3.6): Länge der erzeugten Kurzfassungen (Vorgabe 150 bis höchstens 250 Wörter) und der Gesamtzusammenfassung (höchstens ca. 600) an Kapiteln echter Länge messen; in 3.6 bei kurzen Testkapiteln 290/336 bzw. 623 Wörter. Passt der Handlungsstand aller Kapitel ins Budget?
- **Akzeptanzkriterien:** Beide Kriterien belegt oder widerlegt; bei Widerlegung neuer ERKUNDUNG-Schritt.
- **Betroffene Module:** context
- **Reifegrad-Wirkung:** NFR Kontexttreue Referenzumfang `[OFFEN]` → `[BELASTBAR]` oder begründeter Erkundungsbedarf
- **Artefakte:** Messprotokoll, ADR `[ERKENNTNIS]`
- **Notizen:** Bis dahin gilt das Kriterium als unbelegt. **Entscheidung 2026-10-11** (Eigentümer, Auswahlfrage vor 5.14): Nachweis an „Geschichte des Eigentümers“ (39.051 Wörter in 4 Kapiteln, etwa halber Referenzumfang) nach den Kurzfassungen von Kapitel 1–3, Hochrechnung auf die Referenz; Ergebnis per ADR als ausreichend festhalten.

#### D.5: Wechsel auf httpx2 und Nachprüfung mypy 2

- **Status:** ⚪ OFFEN
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

#### D.6: Reaktionszeit bis zum ersten Textstück erkunden

- **Status:** ✅ ERLEDIGT (2026-09-28) – 28 Läufe im Container auf dem VPS (0,71 $, `spikes/reaktionszeit/README.md`): Wartezeit wächst mit der Länge des Vorab-Denkens (ca. 16 ms je Denk-Token), die bei gleichem Kontext stark streut; `effort: low` ist schon die niedrigste Stufe, Abschalten lehnt der Anbieter ab, eine Denk-Obergrenze verlängert das Denken (54–149 s), ausführender Anbieter immer xAI. grok-4.7 4–29 s (Median 16), grok-4.6 5–11 s (Median 6); 90-s-Grenze reicht. Eigentümer wählt A: Zielwerte angepasst, Einstellungen bleiben (ADR-035); NFR Reaktionszeit → `[BELASTBAR]`. Tageszeit nicht geprüft
- **Phasentyp-Kontext:** ERKUNDUNG
- **Abhängigkeiten:** 3.3
- **Frist:** vor 4.8 (Stoppuhr-Test FR-022)
- **Freigabepflichtig:** nein (Erkundung); eine Änderung an Timeouts oder Modell-Konfiguration aus dem Ergebnis ist eine Schnittstellenänderung und freigabepflichtig
- **Empfohlene Klasse:** Routine – Messreihe mit festgelegtem Aufbau; Entscheidung erst im Anschluss.
- **Eingangskriterien:** `spikes/probeschreiben/probe.py` lauffähig; OpenRouter-Guthaben für ca. 0,30–0,50 $
- **Anforderungen (ab Klasse M):** keine (NFR Reaktionszeit, ADR-013)
- **Zu tun:** Erstes Textstück bei grok-4.7 und grok-4.6 je ca. 10 Anfragen messen; Einfluss der Reasoning-Einstellung (Stufe, Obergrenze für Denk-Token, sofern der Anbieter sie anbietet), des ausführenden Anbieters und der Tageszeit prüfen; Anteil der Denk-Token an den Ausgabe-Token erfassen; prüfen, ob die 90-s-Grenze in `ai_gateway` reicht.
- **Akzeptanzkriterien:** Wissensbasiert: Ursache der Ausreißer belegt oder als nicht beeinflussbar belegt; Vorschlag an den Eigentümer (Einstellung ändern oder Zielwerte per ADR anpassen); NFR Reaktionszeit wieder `[BELASTBAR]`.
- **Betroffene Module:** ai_gateway
- **Reifegrad-Wirkung:** NFR Reaktionszeit `[VORLÄUFIG]` → `[BELASTBAR]`
- **Artefakte:** Spike-Bericht, ADR
- **Notizen:** Herkunft ADR-022 (Abnahme 3.3).

#### D.7: Unterstützungsstand des Reverse Proxys prüfen

- **Status:** ✅ ERLEDIGT (2026-09-28) – Proxy läuft in 2.11.42; Sicherheitsunterstützung der Linie 2.11 endete am 2026-09-07, unterstützt ist nur noch 3.7 (Hersteller: doc.traefik.io/traefik/deprecation/releases/, abgerufen 2026-09-28). Register-Eintrag angelegt; Update als Schritt 4.12 zur Entscheidung vorgelegt
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.2
- **Frist:** vor 4.6 (Gate-Punkt 3)
- **Freigabepflichtig:** Prüfung nein; ein Update des Proxys ja (Kategorie 3 und 7, betrifft alle Dienste des Eigentümers)
- **Empfohlene Klasse:** Routine – Recherche gegen Hersteller-Quellen; ein Update-Vorschlag wäre Entscheidung.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Befund 2026-09-28: Der Proxy läuft in der Major-Linie 2. Prüfen, ob sie noch Sicherheitsupdates erhält (Hersteller-Quelle); bei Lebensende Eintrag ins Ablaufdaten-Register und Update als Entscheidung vorlegen.
- **Akzeptanzkriterien:** Wissensbasiert: Unterstützungsende mit Quelle belegt; Register und ggf. Schritt angelegt.
- **Betroffene Module:** keine (Betrieb)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Eintrag im Ablaufdaten-Register
- **Notizen:** Herkunft 4.2.

#### D.8: Zugangsdaten der Proxy-Verwaltung rotieren

- **Status:** ❌ VERWORFEN (2026-10-07, ADR-040) – Eigentümer: Passwort ist stark; Rotation entfällt, Restrisiko im ADR
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** keine
- **Frist:** 2026-10-05 (ursprünglich „spätestens vor 4.6“; 4.6 wurde am 2026-09-30 vor der Rotation geschlossen – das Datum gilt weiter)
- **Freigabepflichtig:** nein (Rotation bestehender Zugangsdaten); das neue Passwort wählt und setzt der Eigentümer selbst
- **Empfohlene Klasse:** Routine – festgelegter Ablauf ohne Architekturwirkung.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Befund 2026-09-28: Beim Lesen der Proxy-Konfiguration (4.12) gelangte der Hash des Passworts der Proxy-Verwaltung ins Gesprächsprotokoll der KI (`CLAUDE.md` Abschnitt 6: gilt als kompromittiert). Neues Passwort durch den Eigentümer, neuer Hash in der Proxy-Konfiguration, altes Passwort nirgends weiterverwenden.
- **Akzeptanzkriterien:** Anmeldung mit dem alten Passwort abgelehnt, mit dem neuen möglich (von außen geprüft); Ergebnis im Logbuch ohne Werte.
- **Betroffene Module:** keine (Betrieb)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Logbuch-Eintrag
- **Notizen:** Server-Details nur lokal.

#### D.9: Nachprüfung Unterstützung des Reverse Proxys

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.12
- **Frist:** 2026-12-28
- **Freigabepflichtig:** Prüfung nein; ein Update ja (Kategorien 3 und 7)
- **Empfohlene Klasse:** Routine – Abgleich mit der Hersteller-Tabelle.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Hersteller-Tabelle prüfen: Wird 3.7 noch mit Sicherheitsupdates versorgt? Neue Patch-Version einspielen oder Update der Minor-Linie vorlegen; nächste Nachprüfung anlegen.
- **Akzeptanzkriterien:** Stand mit Quelle im Ablaufdaten-Register; ggf. Folgeschritt angelegt.
- **Betroffene Module:** keine (Betrieb)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Ablaufdaten-Register
- **Notizen:** Herkunft 4.12. Vorgänger 3.6 verlor die Sicherheitsunterstützung gut drei Monate nach Erscheinen von 3.7.

#### D.10: Probelauf Routine- und Mechanik-Klasse

- **Status:** ✅ ERLEDIGT (2026-09-28) – Kopie des Repos mit 5 eingebauten Abweichungen, Soll-Werte per Skript; je vier frische Unteragenten mit wörtlich gleichen Aufträgen. Routine (Sonnet 5): 5/5 gefunden, keine falschen Befunde, Logbuch-Entwurf korrekt → bestanden. Mechanik (Haiku 4.5): 2 von 3 Aufgaben richtig, beim Zählen Zeilen statt Vorkommen → nicht bestanden. Referenz Opus 5.5 fehlerfrei; fand zusätzlich zwei echte Kleinigkeiten im Repo (Überschrift der Reifegrad-Übersicht, Typname `[GELÖST]` in der Typen-Tabelle des Logbuchs) – behoben
- **Phasentyp-Kontext:** STABILISIERUNG (Methodik)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein – Dokumentationspflege; die Aktivierung einer Klasse folgt aus dem Ergebnis nach `CLAUDE.md` Abschnitt 0, „Probelauf"
- **Empfohlene Klasse:** Entscheidung – die Bewertung der Abweichungen verlangt die höhere Klasse als Maßstab.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Typische Aufgaben je Klasse (Routine: Drift-Prüfung mit README-Synchronisation, Logbuch-Eintrag; Mechanik: Zählen und Suchen) in einer Kopie des Repos mit absichtlich eingebauten Abweichungen und per Skript ermittelten Soll-Werten; dieselben Aufträge wörtlich an die Probe-Klasse und an die Entscheidungs-Klasse als frische Unteragenten; Abweichungen bewerten.
- **Akzeptanzkriterien:** Ergebnis mit Datum je Klasse in `docs/project-context.md` Abschnitt 6 (bestanden oder nicht, mit Begründung); bei bestanden: für welche Aufgabenarten die Abgabe gilt.
- **Betroffene Module:** keine (Methodik)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** `docs/project-context.md` Abschnitt 6, Logbuch
- **Notizen:** Angelegt 2026-09-28 auf Wunsch des Eigentümers.

#### D.11: Sicherungs-Zugangsdaten außerhalb des Servers ablegen

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** keine
- **Frist:** spätestens 2026-10-31 (ursprünglich zusätzlich „vor dem ersten echten Kapitel in 4.8“ – das Kapitel entstand am 2026-10-08 vorher; der Eigentümer schob D.11 am selben Tag auf, Frist unverändert)
- **Freigabepflichtig:** nein – die Wahl des Passwort-Managers ist Sache des Eigentümers
- **Empfohlene Klasse:** Entscheidung – Beförderung von „Secrets im Betrieb“ auf `[BELASTBAR]` (Eskalations-Auslöser 4); die Eintragung selbst ist Routine.
- **Eingangskriterien:** Eigentümer hat einen Passwort-Manager gewählt
- **Anforderungen (ab Klasse M):** keine (Gate-Prüfpunkte 4 und 5, ADR-038)
- **Zu tun:** Der Eigentümer legt Duplicati-Passphrase, Access ID und geheimen Schlüssel des Sicherungs-Benutzers samt Endpunkt und Bucket in einem Passwort-Manager ab (Werte aus dem Duplicati-Auftrag, „Exportieren → Als Befehlszeile“), die Passphrase zusätzlich auf Papier. Die KI trägt den Ort (nicht die Werte) in Runbook Abschnitt 7 und `docs/project-context.md` Abschnitt 8 ein.
- **Akzeptanzkriterien:** Der Eigentümer bestätigt die Ablage; eine Wiederherstellung (oder mindestens „Verbindung testen“ plus Entschlüsseln der Versionsliste) gelingt nur mit den Werten aus dem Passwort-Manager, ohne Zugriff auf den VPS; Ergebnis im Logbuch ohne Werte.
- **Betroffene Module:** keine (Betrieb)
- **Reifegrad-Wirkung:** Secrets im Betrieb → `[BELASTBAR]`
- **Artefakte:** Runbook Abschnitt 7, `docs/project-context.md` Abschnitt 8, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-09-30 aus Gate 4.6 (ADR-038). Bis dahin ist die Sicherung nach einem Verlust des VPS nicht lesbar.

#### D.12: Sicherheitslücke in `source-map-js` beheben

- **Status:** ✅ ERLEDIGT (2026-10-07) – `source-map-js` 1.2.1 → 1.2.2 (nur `package-lock.json`, per `npm audit fix`); `npm audit` ohne Befund, vitest 96/96 (98,65 % Zeilen, 96,43 % Zweige), Build grün
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** keine
- **Frist:** sofort (CI-Gate „Dependency-Audit“ rot)
- **Freigabepflichtig:** nein – Patch-Update einer bestehenden, transitiven Abhängigkeit (`CLAUDE.md` Abschnitt 4, Kategorie 3)
- **Empfohlene Klasse:** Routine – festgelegter Ablauf ohne Architekturwirkung.
- **Eingangskriterien:** `npm audit --audit-level=high` meldet GHSA-68fv-2mgg-jv7q (hoch, Denial of Service über Source-Map-Offsets) in `source-map-js` 1.0.0–1.2.1
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Lockfile auf die behobene Version heben; Tests und Build prüfen.
- **Akzeptanzkriterien:** `npm audit --audit-level=high` ohne Befund; CI grün.
- **Betroffene Module:** ui (nur Entwicklungs- und Bauwerkzeuge: vite/postcss, jsdom, vitest-Coverage)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** `package-lock.json`, Logbuch-Eintrag
- **Notizen:** Aufgefallen an PR #35 (D.8, reine Dokumentation); `main` war zuletzt am 2026-09-30 grün, die Meldung ist neuer. Die Abhängigkeit läuft nur beim Bauen und Testen, nicht im ausgelieferten Server.

#### D.13: Weigerungen der KI im Text erkennen – Erkundung

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** ERKUNDUNG
- **Abhängigkeiten:** 5.7
- **Freigabepflichtig:** nein (Erkundung); eine spätere Umsetzung wird als eigener Schritt angelegt
- **Empfohlene Klasse:** Entscheidung – Fehlschluss teuer: Bei den Genres des Eigentümers weigern sich auch Figuren in der Handlung; falsche Treffer würden echten Text verwerfen.
- **Eingangskriterien:** Beispiele echter Sperren (Text des Vorschlags) und echter Weigerungen von Figuren, vom Eigentümer bereitgestellt oder aus Probeschreiben
- **Anforderungen (ab Klasse M):** FR-018; Vision 6
- **Zu tun:** Befund 2026-10-08: grok-4.7/4.6 lieferten Sperren als Text im Vorschlag; das Skriptorium zählt sie als `ok` und bietet keinen Modellwechsel an; „Übernehmen“ würde die Sperre ins Kapitel schreiben. Klären, ob sich Sperren zuverlässig von Handlung unterscheiden lassen (z. B. Kennung im Rahmen wie bei 4.14, Muster der Anbieter) und was die Oberfläche dann anbietet.
- **Akzeptanzkriterien:** Bericht mit Trefferquote und Fehlalarmen an echten Beispielen; Empfehlung: umsetzen (neuer Schritt) oder verwerfen (ADR).
- **Betroffene Module:** api, context (Erkundung)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** `spikes/`-Bericht, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-08 (Neuplanung, ADR-042). Entlastung zuerst über das Startmodell (5.7).

#### D.14: Zeitlimit für den End-to-End-Job

- **Status:** ✅ ERLEDIGT 2026-10-08 – PR #60 gemergt (`2fe666d`), CI 8/8 grün mit dem Zeitlimit (End-to-End ca. 1 Minute) (ADR-045)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – Kategorie 7, freigegeben vom Eigentümer 2026-10-08 („a“, ADR-045)
- **Empfohlene Klasse:** Routine – eine Zeile Konfiguration nach getroffener Entscheidung.
- **Eingangskriterien:** Entscheidung des Eigentümers
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Befund 2026-10-08: End-to-End-Job hing über 4 Stunden beim Herunterladen von Chromium. `timeout-minutes: 20` am Job `e2e`.
- **Akzeptanzkriterien:** CI grün mit dem Zeitlimit; ADR-045.
- **Betroffene Module:** keine (CI)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** `.github/workflows/ci.yml`, ADR, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-08 auf Befund des Eigentümers. Querschnitt, nicht Teil des Schrittplans von Phase 5.

#### D.15: Wechsel React Router 7 → Linie 8

- **Status:** ⚪ OFFEN – frühestens 2026-12-17
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.11
- **Freigabepflichtig:** ja – Major-Update einer Abhängigkeit (Kategorie 3), Versionsprüfung nach `CLAUDE.md` Abschnitt 15
- **Empfohlene Klasse:** Routine – Versionswechsel nach Anleitung des Herstellers mit Tests; die Vorlage der Version ist einfache Wahl.
- **Eingangskriterien:** 2026-12-17 erreicht (Linie 8 sechs Monate veröffentlicht)
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Linie 8 gegen die Regel „ausgereifte Linie“ prüfen (Unterversion mit Fehlerkorrektur, React-Unterstützung), Wechsel vorlegen, umstellen, Tests.
- **Akzeptanzkriterien:** `react-router` auf Linie 8; alle Tests grün; Ablaufdaten-Register nachgezogen.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR, Code, Tests
- **Notizen:** Angelegt 2026-10-08 mit ADR-046. Querschnitt, nicht Teil des Schrittplans von Phase 5.

#### D.16: Reaktionszeit erneut erkunden – grok-4.7 über 90 s

- **Status:** ✅ ERLEDIGT (2026-10-10) – Bericht `docs/research/reaktionszeit-d16.md`, Messreihe `spikes/reaktionszeit/d16.py` (30 Anfragen, 1,27 $). Ursache beides: die Schreibaufgabe mit den Vorgaben 5.8–5.22 (ohne sie ca. 30–40 % schneller, kein belegter Effekt nach Regel-002) und starke Schwankung beim Anbieter; Denken abschalten abgelehnt, Deckel 1.024 Token verschlimmert (162–244 s). grok-4.6 12–28 s. Entscheidung ADR-052: grok-4.7 in 5.12 aus der Voreinstellung; Ziel grok-4.6 meist < 30 s / max. 45 s; NFR Reaktionszeit wieder `[BELASTBAR]`
- **Phasentyp-Kontext:** ERKUNDUNG
- **Abhängigkeiten:** 5.26
- **Frist:** vor 5.12 (Modell-Auswahl soll auf belastbaren Reaktionszeiten aufbauen)
- **Freigabepflichtig:** nein (Erkundung); eine Abhilfe aus dem Ergebnis (Vorgaben des Rahmens, Wartezeit, Modell-Liste, Zielwerte) ist eine eigene Entscheidung mit ADR
- **Empfohlene Klasse:** Entscheidung – am Ende steht eine Vorlage zur Abhilfe (Eskalations-Auslöser 1); die Messreihe selbst ist Routine wie D.6.
- **Eingangskriterien:** `OPENROUTER_API_KEY` gesetzt; Guthaben für ca. 1–2 $
- **Anforderungen (ab Klasse M):** keine (NFR Reaktionszeit, ADR-035, ADR-051)
- **Zu tun:** Befund 5.26: grok-4.7 an echten Schreib-Anfragen im Mittel 113–131 s je Vorschlag, bis 370 s vor dem ersten Textstück (D.6: höchstens 29 s); grok-4.6 Median 26–29 s je Vorschlag, Zeit bis zum ersten Textstück nicht erfasst. Messen: Zeit bis zum ersten Textstück und Ausgabe-Token je Vorschlag für grok-4.6 und grok-4.7, nacheinander, an beiden Testgeschichten (Regel-002) – (1) heutiger Rahmen, (2) Rahmen ohne die Vorgaben aus 5.8, 5.15 und 5.22; dazu die einfache Gegenprobe aus 5.26. Das Werkzeug `spikes/kanon-treue/lauf.py` erfasst die Zeit bis zum ersten Textstück noch nicht.
- **Akzeptanzkriterien:** Wissensbasiert: Ursache belegt (Vorgaben des Rahmens, Anbieter oder beides) oder als nicht beeinflussbar belegt; Bericht mit Mittelwert und Spannweite je Modell und Variante; Vorlage an den Eigentümer; NFR Reaktionszeit wieder `[BELASTBAR]` per ADR.
- **Betroffene Module:** ai_gateway, context (nur Erkundung)
- **Reifegrad-Wirkung:** NFR Reaktionszeit `[VORLÄUFIG]` → `[BELASTBAR]`
- **Artefakte:** Spike-Bericht, ADR, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-10 auf die Vorlage E2 aus 5.26 (ADR-051, Eigentümer: „erst wissen“). Querschnitt wie D.6, nicht Teil des Schrittplans von Phase 5.

#### D.17: CI nur für `main` und fertige Pull Requests

- **Status:** ✅ ERLEDIGT (2026-10-10) – #103: Push auf den Branch startete keinen Lauf, der Pull Request genau einen mit allen vier Pflicht-Checks (grün); gemergt auf Anweisung des Eigentümers (ADR-054)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – Kategorie 7, freigegeben vom Eigentümer 2026-10-10 („A“, ADR-054)
- **Empfohlene Klasse:** Routine – wenige Zeilen Konfiguration nach getroffener Entscheidung.
- **Eingangskriterien:** Entscheidung des Eigentümers
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Befund 2026-10-10: Jeder Push lief die CI doppelt (Push und Pull Request), auch bei Entwürfen. Auslöser auf Push nach `main` und Pull Requests (ohne Entwürfe) beschränken.
- **Akzeptanzkriterien:** Pull Request startet genau einen CI-Lauf mit allen vier Pflicht-Checks; Push auf den Branch allein startet keinen; nach dem Merge läuft die CI auf `main`; ADR-054.
- **Betroffene Module:** keine (CI)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** `.github/workflows/ci.yml`, ADR, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-10 auf Wunsch des Eigentümers. Querschnitt, nicht Teil des Schrittplans von Phase 5.

#### D.18: Prüfauftrag Datenmodell – Trennung der Daten je KI-Bereich

- **Status:** ✅ ERLEDIGT (2026-10-13) – Bericht `docs/research/datentrennung-ki-bereiche.md`: Trennung zwischen Welten, Geschichten und Gästen sichergestellt und getestet; Mischung innerhalb von Einträgen und Weltbeschreibung (doppelte Abschnitte „Aussehen“/„Geografie“, Bildvorlagen aus dem ganzen Text), Risiko bei der Kapitel-Kurzfassung. Abhilfen V.29–V.32 (Landeplatz 7.8); NFR Kanon-Treue ohne Rückstufung
- **Phasentyp-Kontext:** ERKUNDUNG (nur lesen, nichts ändern)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein für die Prüfung; jede Abhilfe aus den Befunden ist eine eigene Vorlage (Kategorie 1 oder 4)
- **Empfohlene Klasse:** Entscheidung – Befunde zur Kontext-Zusammenstellung können eine Architektur- oder Datenmodellentscheidung nach sich ziehen; ein Fehlschluss ist teuer.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-010, FR-011 (Kanon-Treue, Kontext-Zusammenstellung)
- **Zu tun:** Auftrag des Eigentümers: „Alle Bereiche, mit denen die KI Inhalte erstellt, brauchen ganz spezifische Daten. Diese Daten dürfen nicht mit anderen Daten vermischt sein. Prüfe, ob das sichergestellt ist.“ Für jeden Bereich – Weiterschreiben, Szenen-Einstieg, Kapitel-Kurzfassungen und Gesamtzusammenfassung, Weltenbauer, Bilder beschreiben, Aussehen herauslösen, Bilder erzeugen (Vorbelegung) – feststellen: (1) welche Daten in die Anfrage an die KI fließen, belegt an `context/` und `api/flows/`; (2) woher sie stammen (Dateien, Kopffelder, `docs/architecture.md` Abschnitt 7); (3) wo fremde Daten hineingeraten können, z. B. andere Welten oder Geschichten, Gast-Figuren, Regeln, ganzer Eintragstext statt „Aussehen“, Markierungen, Bild- oder Kartenbeschreibungen in der Weltbeschreibung; (4) ob die Trennung durch Tests abgesichert ist.
- **Akzeptanzkriterien:** Tabelle je Bereich mit Befund (sauber / Risiko / Mischung) und Beleg (Datei, Zeile); Vorschläge je Befund; Ergebnis in `docs/research/datentrennung-ki-bereiche.md`, Logbuch-Eintrag; Abhilfen als V-Schritte mit Landeplatz 7.8 oder als Vorlage an den Eigentümer.
- **Betroffene Module:** context, api (nur lesen)
- **Reifegrad-Wirkung:** keine (Befunde können eine Rückstufung von NFR Kanon-Treue vorschlagen)
- **Artefakte:** Bericht, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-13 am Ende einer Session über der Kontextgrenze, damit die nächste Session den Auftrag aus dem Fahrplan erhält. Querschnitt, nicht Teil des Schrittplans von Phase 7 (Wucherungs-Schwelle).

#### D.19: CI-Runner `ubuntu-latest` wechselt auf Ubuntu 26

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** UMSETZUNG (Querschnitt)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein für die Beobachtung; ja für jede Änderung an `.github/workflows/ci.yml` (Kategorie 7), etwa ein festes `ubuntu-24.04`
- **Empfohlene Klasse:** Routine – CI-Läufe lesen und Befund festhalten; Entscheidung nur, falls die CI geändert werden muss.
- **Eingangskriterien:** erster CI-Lauf ab 2026-10-19
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Hinweis der CI-Plattform im Lauf zu PR #173 (2026-10-18, alle vier Jobs): „The ubuntu-latest label will migrate to Ubuntu 26 beginning October 19, 2026“ (actions/runner-images#14748). Die vier Pflicht-Jobs laufen auf `ubuntu-latest`. Ab dem ersten Lauf nach dem 2026-10-19 prüfen, auf welchem Abbild er lief und ob Python 3.14 (`actions/setup-python`), Node 24, `playwright install --with-deps chromium` und die übrigen Werkzeuge unverändert grün sind; bei Brüchen beheben oder dem Eigentümer ein festes Abbild vorlegen.
- **Akzeptanzkriterien:** ein grüner Lauf aller vier Jobs auf Ubuntu 26 im Logbuch, oder ein festes Abbild per ADR; Eintrag im Ablaufdaten-Register erledigt.
- **Betroffene Module:** keine (CI)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Logbuch-Eintrag, ggf. `.github/workflows/ci.yml` und ADR
- **Notizen:** Angelegt 2026-10-18 nach `CLAUDE.md` Abschnitt 15 („Warnungsquellen ohne Schalter“, „Jede Abkündigung wird ein Fahrplan-Schritt mit Frist“). Frist 2026-11-02: Die Umstellung läuft schrittweise; spätestens dann soll ein Lauf auf dem neuen Abbild geprüft sein.

#### M.1: Branch-Konvention festlegen

- **Status:** ✅ ERLEDIGT (2026-09-26)
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

- **Status:** ⏸️ VERSCHOBEN → 7.4 (in Phase 7 übernommen 2026-10-12, ADR-068)
- **Landeplatz (nur VERSCHOBEN):** 5.5 – weiter verschoben 2026-10-11 auf 6.10 (ADR-059)
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

- **Status:** ⏸️ VERSCHOBEN → 7.6 (in Phase 7 übernommen 2026-10-12, ADR-068)
- **Landeplatz (nur VERSCHOBEN):** 5.5 – weiter verschoben 2026-10-11 auf 6.10 (ADR-059)
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

- **Status:** ❌ VERWORFEN (2026-10-11, ADR-059)
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

- **Status:** ❌ VERWORFEN (2026-10-11, ADR-059)
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

- **Status:** ❌ VERWORFEN (2026-10-11, ADR-059)
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

#### V.6: Import aus SillyTavern (Character Cards und Lorebooks)

- **Status:** ⏸️ VERSCHOBEN → 6.8 (in Phase 6 übernommen 2026-10-11, ADR-059)
- **Landeplatz (nur VERSCHOBEN):** 5.5 – Reihenfolge und Phase legt die Neuplanung fest (Wünsche aus der Nutzung, Logbuch 2026-10-08 09:35 UTC)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 2.4
- **Freigabepflichtig:** ja – Eingangsformat ist Teil des Datenmodells (Kategorie 4); Einlesen fremder Dateien (PNG mit eingebettetem JSON) ist sicherheitsrelevant (Kategorie 6, Prüfung durch getrennte Instanz)
- **Empfohlene Klasse:** Entscheidung – Datenmodell-Festlegung (Eskalations-Auslöser 1).
- **Eingangskriterien:** Spezifikation der Character Card (V2/V3) und des Lorebook-Formats gegen offizielle Quellen geprüft; Beispieldateien mit erfundenem Inhalt liegen vor
- **Anforderungen (ab Klasse M):** FR-030 (Wunsch des Eigentümers 2026-10-08); FR-005 in 2.4 erfüllt
- **Zu tun:** Character Cards (Figur, ggf. eingebettetes Lorebook) und Lorebooks (Welt-Material) als weiteres Eingangsformat in `canon.importers`, mit Vorschau wie beim Markdown-Import. Zuordnung der Felder zu Kanon-Kategorien klären; Felder für Chat-Rollenspiel (erste Nachricht, Beispieldialoge) gehen nicht in den Kanon. Entscheidung des Eigentümers 2026-10-08: nur Import (Export in V.7), **kein** Umbau des eigenen Datenmodells auf das SillyTavern-Format.
- **Akzeptanzkriterien:** Eine Character Card und ein Lorebook werden ohne Handarbeit als Welt-Material übernommen; fehlerhafte oder bösartige Dateien werden abgelehnt, ohne den Server zu gefährden (Tests).
- **Betroffene Module:** canon, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR zum Format, Code, Tests, Prüfbericht der getrennten Instanz
- **Notizen:** –

#### V.7: Export in SillyTavern-Formate

- **Status:** ⏸️ VERSCHOBEN → 6.9 (in Phase 6 übernommen 2026-10-11, ADR-059)
- **Landeplatz (nur VERSCHOBEN):** 5.5 – nach V.6 (Eigentümer 2026-10-08: „Exportfunktion später“)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** V.6
- **Freigabepflichtig:** ja – Ausgabeformat als Schnittstelle (Kategorie 5)
- **Empfohlene Klasse:** Entscheidung – Schnittstellen-Festlegung (Eskalations-Auslöser 1).
- **Eingangskriterien:** V.6 erledigt
- **Anforderungen (ab Klasse M):** FR-030 (Wunsch des Eigentümers 2026-10-08)
- **Zu tun:** Figuren als Character Card und Welten als Lorebook ausgeben, sodass SillyTavern sie einlesen kann. Abgrenzung: V.1 (Publizieren) betrifft Manuskripte, nicht den Kanon.
- **Akzeptanzkriterien:** Eine exportierte Figur und Welt lassen sich in SillyTavern öffnen; erneuter Import über V.6 ergibt denselben Kanon (Tests).
- **Betroffene Module:** canon, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR zum Format, Code, Tests
- **Notizen:** –

#### V.8: Gestaltung der Oberfläche (z. B. Material Design)

- **Status:** ⏸️ VERSCHOBEN → 7.5 (in Phase 7 übernommen 2026-10-12, ADR-068)
- **Landeplatz (nur VERSCHOBEN):** 5.5 – nach der Neuordnung von Seitenaufbau und Abläufen (5.11) (Eigentümer 2026-10-08: „Erstmal Aufbau neu, UI später“) – weiter verschoben 2026-10-11 auf 6.10 (ADR-059)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.11
- **Freigabepflichtig:** ja, falls eine Komponenten-Bibliothek eingebunden wird (Kategorie 3, Lizenz Kategorie 8); sonst nein
- **Empfohlene Klasse:** Entscheidung – Wahl zwischen Bibliothek und eigenem CSS (Eskalations-Auslöser 1 bei Bibliothek).
- **Eingangskriterien:** neuer Seitenaufbau umgesetzt
- **Anforderungen (ab Klasse M):** FR-019, FR-022 – Wunsch des Eigentümers 2026-10-08
- **Zu tun:** Einheitliche Gestaltung, möglicherweise nach Material Design – über eine Komponenten-Bibliothek (Version und Lizenz nach Regel-001 und `CLAUDE.md` Abschnitt 15 prüfen) oder mit eigenem CSS nach den Material-Richtlinien.
- **Akzeptanzkriterien:** Gestaltung auf allen Seiten einheitlich; Desktop und Smartphone bedienbar; Komponenten- und End-to-End-Tests grün.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ggf. ADR zur Bibliothek, Code, Tests
- **Notizen:** –

#### V.9: KI-gestützter Weltenbauer

- **Status:** ⏸️ VERSCHOBEN → 6.7 (in Phase 6 übernommen 2026-10-11, ADR-059)
- **Landeplatz (nur VERSCHOBEN):** 5.5 (ADR-042: nach dem Umbau, nicht in Phase 5)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.11, 5.12
- **Freigabepflichtig:** ja – neuer Ablauf und ggf. neue Verantwortung (Kategorien 1/2); Wissen aus dem Internet ist eine neue externe Abhängigkeit mit Kosten (Kategorie 3)
- **Empfohlene Klasse:** Entscheidung – Architektur- und Abhängigkeitsentscheidung (Eskalations-Auslöser 1).
- **Eingangskriterien:** 5.5
- **Anforderungen (ab Klasse M):** FR-029
- **Zu tun:** Wunsch 2026-10-08: Figuren, Welten, Regeln, Gegenstände mit Verwendung und Auswirkung im Gespräch mit der KI entwerfen; vorhandene Kanon-Einträge mit KI-Unterstützung besser ausformulieren (Befund des Eigentümers 2026-10-08, ausdrücklich hier statt als eigener Schritt in Phase 5); bei alltagsbekannten Gegenständen tatsächliche Anwendung und Handhabung aus dem Internet einbeziehen. Übernahme in den Kanon erst nach Bestätigung (wie Import-Vorschau). Import bleibt bestehen.
- **Akzeptanzkriterien:** nach FR-029
- **Betroffene Module:** canon, api, ui, ai_gateway (offen)
- **Reifegrad-Wirkung:** offen
- **Artefakte:** ADR, Code, Tests
- **Notizen:** Mindert Vision-Risiko 9 „Manuelle Kanon-Pflege“.

#### V.10: Nicht genannte Kanon-Einträge bei langen Kapiteln

- **Status:** ⏸️ VERSCHOBEN → 6.3 (in Phase 6 übernommen 2026-10-11, ADR-059)
- **Landeplatz (nur VERSCHOBEN):** 5.5 (ADR-050)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.26
- **Freigabepflichtig:** ja – Reihenfolge der Kontext-Zusammenstellung (ADR-003), Kategorie 1
- **Empfohlene Klasse:** Entscheidung – Architekturänderung (Eskalations-Auslöser 1).
- **Eingangskriterien:** 5.5
- **Anforderungen (ab Klasse M):** FR-011
- **Zu tun:** Befund 5.26 (a): Einträge, die nicht per `@` genannt und weder Regel noch Zeitlinie sind, gehen nur mit Restbudget nach den letzten Seiten in die Anfrage; bei langen Kapiteln fehlen sie (Glimmergrund ab ca. 2.800 Wörtern 1–3 von 23). Optionen der Vorlage E1: (A) Kultur-Einträge immer mitgeben wie Regeln und Zeitlinie, (B) in der Oberfläche zeigen, welche Einträge nicht mitgingen, (C) erst an einer echten Welt messen, mit einer Probe, die nur im Kanon-Eintrag steht. Wahl bei 5.5.
- **Akzeptanzkriterien:** nach FR-011; je nach Wahl: Nachweis an einer Probe, die nur im Kanon-Eintrag steht, bei langem Kapitel (Regel-002).
- **Betroffene Module:** context (bei B: ui)
- **Reifegrad-Wirkung:** keine erwartet
- **Artefakte:** ADR, Code, Tests
- **Notizen:** Angelegt 2026-10-10; der Eigentümer stellte die Vorlage E1 zurück (ADR-050). Restrisiko bis dahin: nicht genannte Einträge gehen bei langen Kapiteln still verloren; Abhilfe im Alltag per `@`.

#### V.11: Kurzfassungen langer Kapitel

- **Status:** ❌ VERWORFEN (2026-10-11, ADR-059)
- **Landeplatz (nur VERSCHOBEN):** 5.5 (Eigentümer, 2026-10-10: „in einer neuen Phase behandeln“)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – Token-Budget je Anfrage (ADR-010), Kategorie 1
- **Empfohlene Klasse:** Entscheidung – Änderung an einer NFR (Eskalations-Auslöser 1).
- **Eingangskriterien:** 5.5
- **Anforderungen (ab Klasse M):** FR-010
- **Zu tun:** Befund des Eigentümers 2026-10-10: Meldung „Kurzfassung nicht erstellt, der Text ist zu lang für eine Anfrage“ – die KI nutzt dann nur den Kapitelanfang (ca. 300 Wörter). Grund: `build_chapter_summary` hat dasselbe Budget wie eine Schreib-Anfrage (30.000 Token, ADR-010, 10 % Sicherheitsabstand, 3,3 Zeichen je Token) – Kapitel bis ca. 85.000 Zeichen (ca. 12.000–13.000 Wörter). Kapitel des Eigentümers sind oft länger. Optionen der Vorlage: (A) eigene, höhere Grenze nur für Kurzfassungen (z. B. 120.000 Token, ca. 0,05–0,30 $ je Kurzfassung; Empfehlung der KI), (B) lange Kapitel abschnittsweise zusammenfassen und zusammenführen, (C) nichts ändern, Kapitel teilen. Wahl bei 5.5.
- **Akzeptanzkriterien:** Kurzfassung eines Kapitels von mindestens 30.000 Wörtern gelingt; Kosten je Kurzfassung im Bericht; ADR.
- **Betroffene Module:** context (bei B: api)
- **Reifegrad-Wirkung:** NFR Token-Budget per ADR neu belegt
- **Artefakte:** ADR, Code, Tests
- **Notizen:** Angelegt 2026-10-10 auf Wunsch des Eigentümers (Auswahlfrage, Antwort „in einer neuen Phase behandeln“; Kapitel „oft“ über 10.000 Wörter). Restrisiko bis dahin: bei langen Kapiteln fehlt der KI der Handlungsstand nach dem Kapitelanfang; Abhilfe im Alltag: Kapitel teilen oder die Kurzfassung von Hand schreiben.

#### V.12: Wörter im Manuskriptfeld zählen

- **Status:** ⏸️ VERSCHOBEN → 6.1 (in Phase 6 übernommen 2026-10-11, ADR-059)
- **Landeplatz (nur VERSCHOBEN):** 5.5 (Eigentümer, 2026-10-10, Auswahlfrage: „Nächste Ausbaustufe“)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – kleine, klar spezifizierte Änderung in `ui`.
- **Eingangskriterien:** 5.5
- **Anforderungen (ab Klasse M):** – (neu, bei 5.5 als Anforderung aufnehmen)
- **Zu tun:** Wunsch des Eigentümers 2026-10-10: im Manuskriptfeld die vorhandenen Wörter zählen (z. B. Zeile „1.834 Wörter“ am Editor, laufend aktualisiert). Hilft auch bei V.11 (Grenze der Kurzfassung ca. 12.000–13.000 Wörter).
- **Akzeptanzkriterien:** Zahl stimmt mit einer Zählung nach Leerraum überein; Komponenten-Test; am Smartphone sichtbar ohne Platz für den Text zu nehmen.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests
- **Notizen:** Angelegt 2026-10-10. In Phase 5 hätte der Schritt den Stopp Phasen-Wucherung ausgelöst (26 Schritte); der Eigentümer wählte die nächste Ausbaustufe.

#### V.13: Antworten des Servers nicht im Browser-Speicher

- **Status:** ⏸️ VERSCHOBEN → 6.4 (in Phase 6 übernommen 2026-10-11, ADR-059)
- **Landeplatz (nur VERSCHOBEN):** 5.5 (Eigentümer, 2026-10-10: aus Phase 5 übertragen, damit der Schritt den Phasenabschluss nicht behindert; vorher 5.25)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine (5.21 erledigt)
- **Freigabepflichtig:** ja – Kategorie 6; optionale Maßnahme über ASVS Stufe 1 (Befund 4 der Prüfung zu ADR-048); Umsetzung mit ADR und Prüfung durch getrennte Instanz
- **Empfohlene Klasse:** Entscheidung – Kategorie 6 mit ADR und unabhängiger Prüfung.
- **Eingangskriterien:** 5.5
- **Anforderungen (ab Klasse M):** FR-032 („keine Texte im Gerät“; FR-032 selbst erledigt 2026-10-10)
- **Zu tun:** Der Server setzt bisher kein `Cache-Control` (außer `no-store` am Schreib-Strom); der HTTP-Speicher des Browsers darf Antworten mit Texten daher nach eigenem Ermessen behalten. `Cache-Control: no-store` für alle Antworten unter `/api`, `no-cache` für `index.html` und `sw.js`; Oberflächen-Dateien mit Fingerabdruck im Namen dürfen gespeichert bleiben.
- **Akzeptanzkriterien:** pytest prüft die Kopfzeilen für `/api`, `/`, `/sw.js` und eine Oberflächen-Datei; nach dem Deployment Prüfung von außen (`curl -I`); Prüfung durch getrennte Instanz ohne offene Befunde; ADR angelegt.
- **Betroffene Module:** api
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-10 als Landeplatz für 5.25 (Inhalt übernommen).

#### V.14: Schreibweise der Geschichte wirkt auf bestehende Kapitel

- **Status:** ⏸️ VERSCHOBEN → 7.3 (in Phase 7 übernommen 2026-10-12, ADR-068)
- **Landeplatz (nur VERSCHOBEN):** 5.5 (ADR-053, Eigentümer: „optional B im Hinterkopf behalten“) – weiter verschoben 2026-10-11 auf 6.10 (ADR-059)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.6
- **Freigabepflichtig:** ja – Datenmodell (Kategorie 4)
- **Empfohlene Klasse:** Entscheidung – Änderung am Datenmodell.
- **Eingangskriterien:** 5.5
- **Anforderungen (ab Klasse M):** FR-026
- **Zu tun:** Option B aus ADR-053: Kapitel speichern nur Abweichungen von der Vorgabe der Geschichte; nicht einzeln geänderte Kapitel folgen einer geänderten Vorgabe sofort. Prüfen, ob das nach der Nutzung von A gebraucht wird; Übergang für Kapitel mit eigener Kopie festlegen.
- **Akzeptanzkriterien:** Entscheidung mit ADR; bei Umsetzung: Tests für Vorgabe, Abweichung und Übergang.
- **Betroffene Module:** manuscript, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR, ggf. Code und Tests
- **Notizen:** Angelegt 2026-10-10 mit ADR-053.

#### V.15: Kurzfassung des Kapitels nicht mit der Anweisung verwechselbar

- **Status:** ⏸️ VERSCHOBEN → 6.2 (in Phase 6 übernommen 2026-10-11, ADR-059)
- **Landeplatz (nur VERSCHOBEN):** 5.5 (Eigentümer, 2026-10-10: „nur als Hinweis“)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein – Umbau innerhalb von `ui`; Entwurf mit Mockup vorher/nachher
- **Empfohlene Klasse:** Entscheidung für den Entwurf (Aufbau der Schreibseite), Routine für die Umsetzung.
- **Eingangskriterien:** 5.5
- **Anforderungen (ab Klasse M):** FR-010, FR-019
- **Zu tun:** Befund des Eigentümers beim Schreiben am Smartphone (2026-10-10): Das Feld „Kurzfassung des Kapitels“ (`ChapterSummary.tsx`) verwechselt er gerne mit der Eingabe für die KI – „das muss ganz anders gemacht werden“. Kurzfassung räumlich und optisch klar von der Anweisung trennen (z. B. eigener Bereich in „Kanon & Geschichte“ oder hinter „Kapitel abschließen“ statt unter dem Text); Form mit dem Eigentümer klären.
- **Akzeptanzkriterien:** Eigentümer verwechselt die Felder am Smartphone nicht mehr; Komponenten- und End-to-End-Tests angepasst.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Mockup, Code, Tests
- **Notizen:** Angelegt 2026-10-10. In Phase 5 hätte der Schritt den Stopp Phasen-Wucherung ausgelöst; der Eigentümer gab den Befund „nur als Hinweis“.

#### V.16: Zeitlinie mit Datumsangaben im Kalender der Welt (Kann)

- **Status:** ⏸️ VERSCHOBEN → 7.2 (in Phase 7 übernommen 2026-10-12, ADR-068)
- **Landeplatz (nur VERSCHOBEN):** 5.5 (Eigentümer, 2026-10-10: aus 5.4 „in die nächste Ausbaustufe“) – weiter verschoben 2026-10-11 auf 6.10 (ADR-059)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 2.3
- **Freigabepflichtig:** ja, falls das Datenmodell erweitert wird (Kategorie 4)
- **Empfohlene Klasse:** Entscheidung – eine Datenmodell-Erweiterung ist freigabepflichtig (Eskalations-Auslöser 1).
- **Eingangskriterien:** 5.5; Zeitrechnung der Welt vom Eigentümer geklärt (eigene Monatsnamen oder nur Jahreszahlen)
- **Anforderungen (ab Klasse M):** FR-023
- **Zu tun:** Zeitlinien-Einträge optional mit Datumsangaben im Kalender der Welt (übernommen aus 5.4). Heute stehen Ereignisse als Text im Eintrag der Kategorie „Zeitlinie“; die KI liest sie ohnehin so. Nutzen vor allem Übersicht und Sortierung für den Autor.
- **Akzeptanzkriterien:** Umgesetzt mit Tests oder `[VERWORFEN]` mit ADR.
- **Betroffene Module:** canon, ui
- **Reifegrad-Wirkung:** ggf. Datenmodell
- **Artefakte:** Code, Tests oder ADR
- **Notizen:** Angelegt 2026-10-10 beim Verschieben von 5.4; Phase 5 steht an der Wucherungs-Schwelle.

#### V.17: Umfang des Kapitels im Manuskript anzeigen

- **Status:** ⏸️ VERSCHOBEN → 6.1 (in Phase 6 übernommen 2026-10-11, ADR-059)
- **Landeplatz (nur VERSCHOBEN):** 5.5 (Eigentümer, 2026-10-11: „Nächste Ausbaustufe“)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.11
- **Freigabepflichtig:** nein (nur Anzeige in `ui`); Mockup vorher/nachher vor dem Bau
- **Empfohlene Klasse:** Routine – klar spezifizierte Anzeige mit Test.
- **Eingangskriterien:** 5.5
- **Anforderungen (ab Klasse M):** neu anzulegen in 5.5 (Wunsch 2026-10-11)
- **Zu tun:** Wunsch des Eigentümers: Im Manuskript anzeigen, wie viel Text ein Kapitel hat, damit er weiß, wann er es abschließen sollte. Form gewählt (Auswahlfrage): Wörter plus Grenze – z. B. „9.786 Wörter“, ab etwa 10.000 Wörtern Hinweis „Kurzfassung passt bis ca. 12.000 – bald abschließen“, darüber deutlich markiert. Grenze aus dem Budget der Kurzfassung (30.000 Token, `build_chapter_summary`) ableiten, nicht fest raten; Anlass: Kapitel mit 38.000 Wörtern, Kurzfassung abgelehnt (Logbuch 2026-10-11).
- **Akzeptanzkriterien:** Zahl stimmt mit der Wortzählung überein (Test), Hinweis erscheint an der Schwelle (Test), Mockup freigegeben, Eigentümer bestätigt.
- **Betroffene Module:** ui (ggf. api für die Grenze)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-11; Phase 5 steht an der Wucherungs-Schwelle, daher nicht als Phasenschritt.

#### V.18: Datenschutz-Einstellung an OpenRouter senden

- **Status:** ⏸️ VERSCHOBEN → 6.5 (in Phase 6 übernommen 2026-10-11, ADR-059)
- **Landeplatz (nur VERSCHOBEN):** 5.5 (Eigentümer, 2026-10-11: „Keine – so freigeben“, freiwillige Maßnahme aus der Prüfung in 5.14)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – Kategorie 6 (Umgang mit Texten beim Anbieter); kann die wählbaren Modelle einschränken
- **Empfohlene Klasse:** Entscheidung – Datenschutz-Vorschlag (Eskalations-Auslöser 1); die Umsetzung danach ist Routine.
- **Eingangskriterien:** 5.5; Entscheidung des Eigentümers
- **Anforderungen (ab Klasse M):** keine (Befund 6 der unabhängigen Prüfung 2026-10-11)
- **Zu tun:** Mit jeder Anfrage `provider: {"data_collection": "deny"}` senden (nur Anbieter, die Texte nicht speichern oder zum Training nutzen) oder die Einstellung im OpenRouter-Konto prüfen; Wirkung auf den Katalog (wegfallende Modelle) zeigen.
- **Akzeptanzkriterien:** Entscheidung mit ADR; bei Umsetzung Test der Nutzlast und echte Anfrage.
- **Betroffene Module:** ai_gateway
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR, ggf. Code und Tests
- **Notizen:** Angelegt 2026-10-11 (ADR-058).

#### V.19: Kopfzeilen und Fehlermeldungen härten (CSP, Einbettschutz, 422)

- **Status:** ⏸️ VERSCHOBEN → 6.6 (in Phase 6 übernommen 2026-10-11, ADR-059)
- **Landeplatz (nur VERSCHOBEN):** 5.5 (Eigentümer, 2026-10-11: „Keine – so freigeben“, freiwillige Maßnahmen aus der Prüfung in 5.14)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – Kategorie 6; nach Obergrenze (ADR-006) Stufe 2 und damit optional
- **Empfohlene Klasse:** Entscheidung – Sicherheitsmaßnahme über dem festgelegten Niveau (Eskalations-Auslöser 1).
- **Eingangskriterien:** 5.5; Entscheidung des Eigentümers
- **Anforderungen (ab Klasse M):** keine (Befunde 1, 2, 4 der unabhängigen Prüfung 2026-10-11; ASVS 3.4.3, 3.4.6)
- **Zu tun:** Content-Security-Policy (z. B. `default-src 'self'`, Stile mit `'unsafe-inline'` für CodeMirror prüfen); `frame-ancestors 'none'` auch in `_SECURITY_HEADERS` statt nur am Proxy; eigener Handler für Validierungsfehler ohne zurückgespiegelte Eingaben.
- **Akzeptanzkriterien:** Entscheidung; bei Umsetzung Tests der Kopfzeilen, Oberfläche funktioniert mit CSP (End-to-End), Prüfung durch eine getrennte Instanz.
- **Betroffene Module:** api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ggf. ADR
- **Notizen:** Angelegt 2026-10-11 (ADR-058).

#### V.22: Weltenbauer aus dem Manuskript – Kanon-Eintrag aus vorhandenen Textstellen

- **Status:** ⏸️ VERSCHOBEN → 8.9 (in Phase 8 übernommen 2026-10-13, ADR-081)
- **Landeplatz (nur VERSCHOBEN):** 7.8 (Eigentümer 2026-10-12: „Vielleicht mal für später“) – weiter 2026-10-13: 8.9 (ADR-081)
- **Phasentyp-Kontext:** offen (vermutlich zuerst ERKUNDUNG: Auswahl der Fundstellen bei vielen Auftritten)
- **Abhängigkeiten:** 6.7
- **Freigabepflichtig:** ja – neuer Ablauf (Kategorie 1), ggf. Erweiterung der Anfrage-Zusammenstellung
- **Empfohlene Klasse:** Entscheidung – Architektur der Anfrage (Eskalations-Auslöser 1).
- **Eingangskriterien:** Bedarf und Form mit dem Eigentümer klären
- **Anforderungen (ab Klasse M):** – (Ergänzung zu FR-029)
- **Zu tun:** Aus einem Manuskript, in dem sich eine Figur oder ein Gegenstand über viele Seiten aufgebaut hat, nachträglich einen Kanon-Eintrag entwerfen lassen. Idee: Fundstellen über Namen und Aliasse aus allen Kapiteln suchen, mit Kurzfassungen an die KI geben, Übernahme über die Import-Vorschau wie beim Weltenbauer. Offen: Auswahl, wenn die Fundstellen das Budget übersteigen (erste Auftritte und Wendepunkte, mehrere Durchgänge).
- **Akzeptanzkriterien:** in 7.8 festzulegen
- **Betroffene Module:** context, api, ui (voraussichtlich)
- **Reifegrad-Wirkung:** keine (voraussichtlich)
- **Artefakte:** ADR, ggf. Spike
- **Notizen:** Angelegt 2026-10-12 auf Wunsch des Eigentümers; erste Einschätzung: mittlerer Aufwand, baut auf dem Weltenbauer auf.

#### V.23: Bilder im Manuskript

- **Status:** ⏸️ VERSCHOBEN → 9.15 (Planung der nächsten Ausbaustufe) – weiter verschoben 2026-10-18 (ADR-090)
- **Landeplatz (nur VERSCHOBEN):** 7.8 (aus dem Zuschnitt von 7.11, Wahl des Eigentümers „Nur Titelbild“, 2026-10-12, ADR-075) – weiter 2026-10-13: 8.13 (ADR-081) – weiter 2026-10-18: 9.15 (ADR-090)
- **Phasentyp-Kontext:** offen
- **Abhängigkeiten:** 7.11
- **Freigabepflichtig:** ja – Datenmodell (Bildverweise im Kapiteltext, Kategorie 4), Editor
- **Empfohlene Klasse:** Entscheidung – Datenmodell (Eskalations-Auslöser 1).
- **Eingangskriterien:** Bedarf mit dem Eigentümer klären
- **Anforderungen (ab Klasse M):** FR-035
- **Zu tun:** Bilder zwischen Absätzen im Manuskript, auch im E-Book.
- **Akzeptanzkriterien:** in 7.8 festzulegen
- **Betroffene Module:** manuscript, api, ui (voraussichtlich)
- **Reifegrad-Wirkung:** keine (voraussichtlich)
- **Artefakte:** ADR
- **Notizen:** Angelegt 2026-10-12, war in 7.11 als „ggf.“ vorgesehen.

#### V.24: Weitere Bildanbieter (Runware, Replicate, fal.ai)

- **Status:** ⏸️ VERSCHOBEN → 9.15 (Planung der nächsten Ausbaustufe) – weiter verschoben 2026-10-18 (ADR-090)
- **Landeplatz (nur VERSCHOBEN):** 7.8 (Eigentümer 2026-10-12: „weitere Anbieter in einer späteren Phase … später mehr Diversität“, ADR-076) – weiter 2026-10-13: 8.13 (ADR-081) – weiter 2026-10-18: 9.15 (ADR-090)
- **Phasentyp-Kontext:** offen
- **Abhängigkeiten:** 7.12
- **Freigabepflichtig:** ja – neuer externer Dienst (Kategorie 3), Schlüssel im Betrieb (Kategorie 6)
- **Empfohlene Klasse:** Entscheidung – neuer Dienst (Eskalations-Auslöser 1).
- **Eingangskriterien:** Erfahrungen mit 7.12 über OpenRouter; Probe des Eigentümers beim gewählten Anbieter
- **Anforderungen (ab Klasse M):** FR-035, FR-025
- **Zu tun:** Einen zweiten Bildanbieter als Adapter anbinden; Kandidaten und Befunde in `docs/research/bildanbieter.md` (Runware vorne, dann Replicate, fal.ai).
- **Akzeptanzkriterien:** in 7.8 festzulegen
- **Betroffene Module:** ai_gateway, api, ui (voraussichtlich)
- **Reifegrad-Wirkung:** keine (voraussichtlich)
- **Artefakte:** ADR
- **Notizen:** Angelegt 2026-10-12 aus der Erkundung zu 7.12.

#### V.25: Verweise zwischen Kanon-Einträgen; ortsgebundene Regeln

- **Status:** ⏸️ VERSCHOBEN → 8.11 (in Phase 8 übernommen 2026-10-13, ADR-081)
- **Landeplatz (nur VERSCHOBEN):** 7.8 (Eigentümer 2026-10-12: „Als V-Schritt vormerken“; Phase 7 an der Wucherungs-Schwelle) – weiter 2026-10-13: 8.11 (ADR-081)
- **Phasentyp-Kontext:** vermutlich zuerst ERKUNDUNG (Probe: Wirkung auf Budget und Kanon-Treue)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – Anfrage-Zusammenstellung (Kategorie 1), ggf. Datenmodell (Kategorie 4)
- **Empfohlene Klasse:** Entscheidung – Architektur der Anfrage (Eskalations-Auslöser 1).
- **Eingangskriterien:** Bedarf und Form in 7.8 klären
- **Anforderungen (ab Klasse M):** – (Ergänzung zu den Anforderungen der Kontext-Zusammenstellung)
- **Zu tun:** Idee des Eigentümers: Kanon-Einträge verweisen auf andere (z. B. eine Regel, die nur an einem Ort gilt); kommt ein Eintrag in den Kontext, kommen seine verwiesenen Einträge mit; der Weltenbauer verteilt einen Sachverhalt auf mehrere Einträge und verknüpft sie. Vorschlag (A): `@Name` im Text eines Eintrags, eine Stufe tief, im Rahmen des Budgets; optional ortsgebundene Regeln (nur im Kontext, wenn der verwiesene Ort es ist) statt „alle Regeln immer“. Verworfene Varianten zur Prüfung: Feld „Verbunden mit“ (B), automatische Namenserkennung (C).
- **Akzeptanzkriterien:** in 7.8 festzulegen
- **Betroffene Module:** context, canon, ui (voraussichtlich)
- **Reifegrad-Wirkung:** keine (voraussichtlich)
- **Artefakte:** ADR, Spike
- **Notizen:** Angelegt 2026-10-12. Stand heute: alle Regeln und Zeitlinien gehen immer mit (Vorrang 1), `@`-Einträge vollständig (Vorrang 2), übrige Einträge füllen auf (ADR-062); der Weltenbauer kann schon mehrere Einträge verschiedener Kategorien in einem Vorschlag anlegen, verknüpft sie aber nicht.

#### V.26: Wandernde Figuren – weltneutraler Kern, Weltbezug je Welt, Erlebnisse wandern mit

- **Status:** ⏸️ VERSCHOBEN → 8.12 (in Phase 8 übernommen 2026-10-13, ADR-081)
- **Landeplatz (nur VERSCHOBEN):** 7.8 (Eigentümer 2026-10-13: „In Zukunft sollten wir nochmal das gesamte Kanonsystem überdenken und überlegen, wie wir Figuren transportabel machen“; „Ja, als V.26 festhalten“) – weiter 2026-10-13: 8.12 (ADR-081)
- **Phasentyp-Kontext:** ERKUNDUNG (Probe an echten Figuren des Eigentümers), danach Entscheidung
- **Abhängigkeiten:** 7.16; gemeinsam mit V.25 planen
- **Freigabepflichtig:** ja – Datenmodell (Kategorie 4), Architektur des Kanons und der Anfrage-Zusammenstellung (Kategorie 1)
- **Empfohlene Klasse:** Entscheidung – Datenmodell und Architektur (Eskalations-Auslöser 1, voraussichtlich `[STRATEGISCH]`).
- **Eingangskriterien:** Erkundung und Vorlage in 7.8
- **Anforderungen (ab Klasse M):** – (berührt FR-002, FR-016 und die Gäste aus 3.7)
- **Zu tun:** Gedanken des Eigentümers, noch nichts entschieden: (1) Figuren ohne Bezug auf eine bestimmte Welt beschreiben, damit sie in mehreren Welten einsetzbar sind; (2) je Welt ein eigener Bezug (Herkunft, Beziehungen, Besitz, Erlebtes); (3) realistisch eingepasst, wenn eine Figur in eine neue Welt kommt (z. B. Vorschlag des Weltenbauers); (4) Erlebnisse in einer anderen Welt schreiben den Kern der Figur fort und wandern in die Ursprungswelt mit. Mögliche Richtungen: Kern und Weltteil trennen; Figurenbibliothek außerhalb der Welten; Anpassung beim Einsetzen. Erster Baustein vorhanden: Abschnitt „Aussehen“ (7.16).
- **Akzeptanzkriterien:** in 7.8 festzulegen
- **Betroffene Module:** canon, manuscript, context, api, ui (voraussichtlich)
- **Reifegrad-Wirkung:** voraussichtlich ja (Datenmodell des Kanons)
- **Artefakte:** Erkundung, Spike, ADR
- **Notizen:** Angelegt 2026-10-13 nach dem Einspielen von 7.16; Eigentümer: „Schweres Thema“, „ich verzettel mich“ – bewusst nur festgehalten, nicht entschieden.

#### V.27: Weltenbauer behält das Gespräch nach „Als Kanon übernehmen“

- **Status:** ⏸️ VERSCHOBEN → 8.8 (in Phase 8 übernommen 2026-10-13, ADR-081)
- **Landeplatz (nur VERSCHOBEN):** 7.8 (Befund des Eigentümers 2026-10-13; Wahl „Als V.27 vormerken“, Phase 7 an der Wucherungs-Schwelle) – weiter 2026-10-13: 8.8 (ADR-081)
- **Phasentyp-Kontext:** UMSETZUNG (mit Mockup)
- **Abhängigkeiten:** 6.7
- **Freigabepflichtig:** nein bei Variante A/B (Bedienung); Variante C wäre Kategorie 6 (Texte im Gerät, gegen ADR-048)
- **Empfohlene Klasse:** Routine – Bedienung ohne Architekturwirkung.
- **Eingangskriterien:** Mockup freigegeben
- **Anforderungen (ab Klasse M):** FR-029
- **Zu tun:** Befund: „Als Kanon übernehmen“ wechselt in den Reiter „Import“, die Kanon-Seite mit dem Weltenbauer wird geschlossen, das Gespräch ist weg – der Eigentümer möchte mehrere Einträge hintereinander bauen. Vorschlag A: Import-Vorschau als Fenster auf der Kanon-Seite, danach „Zurück zum Weltenbauer“ im selben Gespräch. Alternative B: Gespräch auf Weltebene halten. Verworfen C: Gespräch im Browser speichern (ADR-048).
- **Akzeptanzkriterien:** Mockup freigegeben; nach dem Übernehmen geht das Gespräch weiter; Tests; Eigentümer bestätigt.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-13.

#### V.28: Zeitlinie mit Jahr, Datum und Uhrzeit

- **Status:** ⏸️ VERSCHOBEN → 8.10 (in Phase 8 übernommen 2026-10-13, ADR-081)
- **Landeplatz (nur VERSCHOBEN):** 7.8 (Befund des Eigentümers 2026-10-13: „Ist was für die spätere Phase. Für später.“) – weiter 2026-10-13: 8.10 (ADR-081)
- **Phasentyp-Kontext:** offen (vermutlich mit Vorlage zur Schreibweise von Zeitangaben)
- **Abhängigkeiten:** 7.2
- **Freigabepflichtig:** ja, falls die Form der Zeitangaben im Kanon festgelegt wird (Datenmodell, Kategorie 4); Darstellung allein nicht
- **Empfohlene Klasse:** Entscheidung, falls Datenmodell; sonst Routine.
- **Eingangskriterien:** Bedarf und Form in 7.8 klären
- **Anforderungen (ab Klasse M):** – (Ergänzung zu FR-034)
- **Zu tun:** Befund des Eigentümers: zwischen Jahreszahl, Datum und Uhrzeit unterscheiden; auch nur Uhrzeiten oder nur ein Datum angeben können; im Verlauf sichtbar machen, wo die Zeitstempel sind; „kann man noch besser ausbauen“. Stand heute (7.2, ADR-069): sortiert wird nach der ersten Zahl am Anfang (Jahr), Datum und Uhrzeit werden nicht unterschieden.
- **Akzeptanzkriterien:** in 7.8 festzulegen
- **Betroffene Module:** ui, ggf. canon (voraussichtlich)
- **Reifegrad-Wirkung:** keine (voraussichtlich)
- **Artefakte:** ggf. ADR
- **Notizen:** Angelegt 2026-10-13.

#### V.29: Übernahme ersetzt Abschnitte statt sie zu verdoppeln; Vorlage „Aussehen“ (D.18, B1–B3, B6)

- **Status:** ⏸️ VERSCHOBEN → 8.4 (in Phase 8 übernommen 2026-10-13, ADR-081)
- **Landeplatz (nur VERSCHOBEN):** 7.8 (Befunde B1–B3, B6 aus D.18, 2026-10-13); Vorziehen nur auf ausdrücklichen Wunsch des Eigentümers – weiter 2026-10-13: 8.4 (ADR-081)
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** 7.13, 7.16
- **Freigabepflichtig:** ja – verändert vorhandenen Text des Autors beim Übernehmen; Vorlage für neue Figuren ist Datenmodell-Konvention aus ADR-078 (Kategorie 4)
- **Empfohlene Klasse:** Entscheidung – Datenmodell-Konvention (Eskalations-Auslöser 1).
- **Eingangskriterien:** Zählung auf dem Server (vom Mac): Einträge mit mehr als einem Abschnitt „Aussehen“, Welten mit mehr als einem Abschnitt „Geografie“ je Karte – erledigt 2026-10-13: 0 von 133 Einträgen, 0 von 5 Welten; Eigentümer: nicht vorziehen
- **Anforderungen (ab Klasse M):** FR-035, FR-029
- **Zu tun:** „Übernehmen als ‚Aussehen‘“ und „In die Weltbeschreibung übernehmen“ ersetzen einen vorhandenen Abschnitt gleichen Namens bzw. füllen einen leeren (Rückfrage, wenn dort schon Text steht); Geografie einer gelöschten Karte auf Nachfrage mit entfernen; `appearanceOf` überspringt leere Abschnitte und endet erst an einer Überschrift gleicher oder höherer Ebene; Vorlage neuer Figuren so, dass freier Text nicht unter „Aussehen“ fällt; Server verlangt für „Aussehen herauslösen“ die Kategorie `figur`; Tests: Weltenbauer ohne fremde Welten, Markierungen in keiner Anfrage, Vorlagen bei leerem, doppeltem und unterteiltem Abschnitt. Bericht: `docs/research/datentrennung-ki-bereiche.md`.
- **Akzeptanzkriterien:** Vorlage bzw. ADR; Tests; nach erneutem Beschreiben genau ein Abschnitt; Eigentümer bestätigt.
- **Betroffene Module:** ui, canon, api
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ggf. ADR
- **Notizen:** Angelegt 2026-10-13 aus D.18.

#### V.30: Kapitel-Kurzfassung nur mit dem Stand vor dem Kapitel (D.18, B4)

- **Status:** ⏸️ VERSCHOBEN → 8.6 (in Phase 8 übernommen 2026-10-13, ADR-081)
- **Landeplatz (nur VERSCHOBEN):** 7.8 (Befund B4 aus D.18, 2026-10-13) – weiter 2026-10-13: 8.6 (ADR-081)
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage und Messung nach Regel-002)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – Kontext-Zusammenstellung (Kategorie 1)
- **Empfohlene Klasse:** Entscheidung – Kontext-Zusammenstellung (Eskalations-Auslöser 1).
- **Eingangskriterien:** Vorlage an den Eigentümer
- **Anforderungen (ab Klasse M):** FR-010
- **Zu tun:** Beim Neu-Erzeugen der Kurzfassung eines früheren Kapitels enthält die mitgegebene Gesamtzusammenfassung dieses und spätere Kapitel, steht aber unter „Handlungsstand vor diesem Kapitel“ (`context/summaries.py:115-121`). Optionen: Kurzfassungen der Kapitel davor statt der Gesamtzusammenfassung; oder ehrliche Überschrift. Test: weder Kanon noch andere Geschichten in den beiden Zusammenfassungs-Anfragen.
- **Akzeptanzkriterien:** ADR; Tests; Messung nach Regel-002; Eigentümer bestätigt.
- **Betroffene Module:** context
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR
- **Notizen:** Angelegt 2026-10-13 aus D.18.

#### V.31: Bildvorlagen aus „Aussehen“ bzw. der Geografie dieser Karte (D.18, B5)

- **Status:** ⏸️ VERSCHOBEN → 8.5 (in Phase 8 übernommen 2026-10-13, ADR-081)
- **Landeplatz (nur VERSCHOBEN):** 7.8 (Befund B5 aus D.18, 2026-10-13) – weiter 2026-10-13: 8.5 (ADR-081)
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage)
- **Abhängigkeiten:** V.29
- **Freigabepflichtig:** ja – ändert die Vorbelegung aus ADR-077
- **Empfohlene Klasse:** Routine – Oberfläche nach klarer Vorgabe; Vorlage nur zur Wahl beim Titelbild.
- **Eingangskriterien:** Wahl des Eigentümers zum Titelbild
- **Anforderungen (ab Klasse M):** FR-035
- **Zu tun:** Orte und Gegenstände: Abschnitt „Aussehen“, wenn vorhanden; Karte: Abschnitt „Geografie – Name dieser Karte“, wenn vorhanden, sonst nur der Titel; Titelbild: unverändert oder nur Titel und Genre.
- **Akzeptanzkriterien:** Tests; Eigentümer bestätigt.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests
- **Notizen:** Angelegt 2026-10-13 aus D.18.

#### V.32: Regeln und Zeitlinie im Wortlaut an den Weltenbauer? (D.18, Nebenbefund)

- **Status:** ⏸️ VERSCHOBEN → 8.7 (in Phase 8 übernommen 2026-10-13, ADR-081)
- **Landeplatz (nur VERSCHOBEN):** 7.8 (Nebenbefund aus D.18, 2026-10-13) – weiter 2026-10-13: 8.7 (ADR-081)
- **Phasentyp-Kontext:** offen
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – Kontext-Zusammenstellung (Kategorie 1)
- **Empfohlene Klasse:** Entscheidung – Kontext-Zusammenstellung (Eskalations-Auslöser 1).
- **Eingangskriterien:** Bedarf in 7.8 klären
- **Anforderungen (ab Klasse M):** FR-029
- **Zu tun:** Der Weltenbauer soll „nie dem vorhandenen Kanon widersprechen“, bekommt Regeln und Zeitlinie aber nur als Namen (`context/worldbuilder.py:64-70`). Klären, ob sie im Wortlaut mitgehen sollen (Kosten je Anfrage).
- **Akzeptanzkriterien:** in 7.8 festzulegen
- **Betroffene Module:** context (voraussichtlich)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ggf. ADR
- **Notizen:** Angelegt 2026-10-13 aus D.18.

#### V.33: Bilder beim Schreiben auf Knopfdruck mitschicken (aus 7.15)

- **Status:** ⏸️ VERSCHOBEN → 9.15 (Planung der nächsten Ausbaustufe) – weiter verschoben 2026-10-18 (ADR-090)
- **Landeplatz (nur VERSCHOBEN):** 8.13 (Eigentümer, 2026-10-13: 7.15 „in die nächste Ausbaustufe“; ADR-081) – weiter 2026-10-18: 9.15 (ADR-090)
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** 7.13
- **Freigabepflichtig:** ja – Anfrage-Zusammenstellung (Kategorie 1)
- **Empfohlene Klasse:** Entscheidung – Kontext-Zusammenstellung (Eskalations-Auslöser 1).
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-035
- **Zu tun:** Je Anfrage zuschaltbar: Bilder der per `@` genannten Einträge gehen als Bildteile mit (nur bei Modellen mit Bildlesen), Kosten vorher sichtbar; nie automatisch.
- **Akzeptanzkriterien:** Vorlage bzw. ADR; Tests; Eigentümer bestätigt.
- **Betroffene Module:** context, ai_gateway, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR
- **Notizen:** Angelegt 2026-10-13 aus 7.15 (ADR-074, Archiv `docs/archiv/fahrplan-phase-7.md`).

#### V.34: Wandernde Figuren – Weltbezug je Gast und Einpassen (Option A aus 8.12)

- **Status:** ⏸️ VERSCHOBEN → 9.13 (in Phase 9 übernommen 2026-10-18, ADR-090)
- **Landeplatz (nur VERSCHOBEN):** 8.13 (Eigentümer, 2026-10-13: „Erst ausprobieren, dann A“) – weiter 2026-10-18: 9.13 (ADR-090)
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** 8.12
- **Freigabepflichtig:** ja – Datenmodell (Weltbezug je Gast-Verbindung, Kategorie 4), Kontext-Zusammenstellung (Kategorie 1)
- **Empfohlene Klasse:** Entscheidung – Datenmodell und Kontext-Zusammenstellung (Eskalations-Auslöser 1).
- **Eingangskriterien:** Probe des Eigentümers: eine Figur per Gast-Verbindung (3.7) in einer Geschichte einer anderen Welt eingesetzt, Erlebnisse per „Kanon der Figur“ (FR-024) zurückgeschrieben; Befund, was fehlt
- **Anforderungen (ab Klasse M):** FR-016, FR-017, FR-024
- **Zu tun:** Option A aus `docs/research/wandernde-figuren.md`: Weltbezug („In ‹Welt›“) je Gast-Verbindung, in der Anfrage Kern + Weltbezug; Weltenbauer schlägt den Weltbezug beim Einsetzen vor (Übernahme wie 8.8); Konvention „weltneutral oben, Heimatwelt in ‚In ‹Welt›‘“.
- **Akzeptanzkriterien:** Vorlage bzw. ADR; Tests; Probe nach Regel-002, falls die Schreib-Anfrage sich ändert; Eigentümer bestätigt.
- **Betroffene Module:** manuscript, context, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR
- **Notizen:** Angelegt 2026-10-13 aus 8.12. Option C (Bibliothek über den Welten) nur mit eigenem ADR zur Vision-Grenze, falls sich viele dauerhaft wandernde Figuren zeigen.

#### V.35: Befunde des Eigentümers vom 2026-10-15/16 durchgehen (Sammlung)

- **Status:** ⏸️ VERSCHOBEN → 9.3–9.9, 9.12 (in Phase 9 übernommen 2026-10-18, ADR-090: B1 → 9.6, B2/G1/G2 → 9.3, B3 → 9.4, B4/G4 → 9.5, B5 → 9.9, B6/G3 → 9.7, B7 → 9.8, H1/V1 → 9.12)
- **Landeplatz (nur VERSCHOBEN):** 8.13 (Eigentümer, 2026-10-16: „erstmal nur sammeln“; er will zu jedem Befund noch Grundsätzliches sagen) – weiter 2026-10-18: 9.3–9.9, 9.12 (ADR-090)
- **Phasentyp-Kontext:** offen (Sammlung; je Befund UMSETZUNG oder zuerst ERKUNDUNG)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** das Durchgehen nein; die Folgen je Befund absehbar ja – Datenmodell (B1, B5, B6, G3; Kategorie 4), Architektur und Kontext-Zusammenstellung (B2, B3, G1/G2; Kategorie 1), neue Abhängigkeit (V1; Kategorie 3)
- **Empfohlene Klasse:** Entscheidung – mündet in `ENTSCHEIDUNG ERFORDERLICH` zu Datenmodell und Architektur (Eskalations-Auslöser 1).
- **Eingangskriterien:** Eigentümer hat Zeit, zu jedem Befund seine grundsätzliche Sicht zu sagen
- **Anforderungen (ab Klasse M):** noch keine – entstehen beim Durchgehen
- **Zu tun:** Befunde einzeln mit dem Eigentümer durchgehen, dann je Befund einen Landeplatz festlegen: eigener V-Schritt bzw. Schritt der nächsten Phase oder `[VERWORFEN]` per ADR. Wortlaut der Befunde nach dem Eigentümer; Stand im Skriptorium geprüft am 2026-10-16 auf `main` `b20d48a` (nur gelesen).
  - **B1 – Herkunft von Bildern:** Bei Bildern zu Figuren und Kanon ist nicht nachvollziehbar, mit welchem Modell und welchem Prompt sie erzeugt wurden. Stand: Bei der Übernahme wird nur die Bilddatei gespeichert (Kopffeld `bilder` = Dateinamen, `canon/images.py`); Modell und Prompt gehen verloren, nur die Verbrauchszeile `bilderzeugung` nennt Modell und Kosten ohne Bezug zum Bild. Beim Schreiben hält der Verlauf Anweisung, KI-Text und Modell fest (ADR-056); der Weltenbauer speichert nichts (ADR-064). Offene Nebenfrage: auch für KI-Text die vollständige Anfrage festhalten?
  - **B2 – Figuren gegliedert anlegen:** Legt die KI eine Figur an, entsteht ein zusammenhängender Text; gewünscht ist eine Trennung von vornherein (Name, Erscheinungsbild, Persönlichkeit …), damit z. B. das Aussehen gezielt abrufbar ist. Bei Orten entstehen feste Blöcke, Gegenstände ungeprüft. Stand: Vorlage für Figuren „Aussehen“ + „Wesen und Geschichte“ nur beim Anlegen von Hand (ADR-083); der Weltenbauer verlangt bei Figuren nur `### Aussehen`, „Wesen, Geschichte und Beziehungen stehen außerhalb davon“ (`context/worldbuilder.py`); für Orte, Zeitlinie, Regeln, Kultur keine Vorlage – die Blöcke bei Orten macht das Modell von sich aus. Fallstrick: Der Import erkennt als Unterabschnitte nur Zweck, Verwendung, Auswirkung, Aussehen (`canon/importers/markdown.py`); ein anderer Abschnitt auf Namensebene würde zu einem eigenen Eintrag.
  - **B3 – Verbindungen zwischen Figuren:** Verbindungen (z. B. ein Paar) sollen sichtbar und gegliedert im Text stehen, auch wenn die KI mehrere Figuren in einem Auftrag anlegt. Stand: Mehrere Einträge je Auftrag gehen (8.8); `@Name` verweist einseitig (8.11, ADR-088, wartet auf Bestätigung), ohne Art der Beziehung, ohne Abschnitt „Beziehungen“, ohne Rückverweise; ein Feld „Verbunden mit“ wurde verworfen (ADR-088).
  - **B4 – Karte erzeugen ohne Vorbelegung:** Bei „Karte erzeugen“ ist nichts vorausgefüllt, obwohl die Welt Orte hat. Stand: Vorbelegung nur aus „Geografie – ‹Kartenname›“ der Weltbeschreibung, sonst nur der Titel (ADR-084, `ui/src/imagePrompts.ts`); Orts-Einträge werden nicht gelesen; bei einer neuen Karte gibt es den Abschnitt noch nie, er entsteht erst über „Karte beschreiben“ (ADR-074).
  - **B5 – Geschichten löschen oder archivieren (Wunsch):** Stand: weder für Geschichten noch für Welten oder Kapitel möglich – keine Route, kein Knopf.
  - **B6 – Standardmodell für Bilder:** Das Bildmodell lässt sich nicht festlegen und muss jedes Mal neu gewählt werden. Stand: Voreinstellung fest im Code (`ai_gateway/images.py`, FLUX.2 Pro, ADR-077), Wahl wird nicht gespeichert; keine Favoriten für Bildmodelle (für Textmodelle ADR-055).
  - **B7 – Bild zu Bild:** Vorhandene Bilder sollen als Grundlage dienen können, nicht nur Text zu Bild. Stand: fehlt; die Anfrage kennt nur Modell, Prompt, Seitenverhältnis und Anzahl. Bilder an die KI gehen nur zum Beschreiben (ADR-074); V.33 ist etwas anderes.
  - **G1/G2 – Gegliederte Kanon-Einträge statt Textblöcke:** Kanon-Einträge sollen gegliedert sein, für Figuren evtl. mit festen Feldern; alle Kategorien prüfen, ob strukturiert abgelegt oder als Textblock mit `##`-Überschriften – die Trennung über Rautezeichen hält der Eigentümer nicht für zielführend. Stand: Markdown-Dateien mit YAML-Kopf (`name`, `aliasse`, `kategorie`, `status`, `bilder`) als Quelle der Wahrheit (ADR-003), Inhalt als Abschnitte nach Konvention; eigene Felder für Aussehen und Verweise bewusst verworfen (ADR-078, ADR-083, ADR-088). Der Befund stellt diese Entscheidungen in Frage.
  - **G3 – Einstellungsseite für Modelle je Aufgabe:** Stand: keine; Schreiben je Geschichte gespeichert (ADR-023), Weltenbauer und Bilder ohne Speicherung, Kurzfassungen fest im Code (`api/flows/summary.py`), Beschreiben und Aussehen herauslösen nach Voreinstellung oder erstem Favoriten.
  - **G4 – Vom Bedarf her denken:** Für jeden Bereich mit KI-Bildern (Figur, Gegenstand, Ort, Karte, Sonstiges) vorab festlegen, welche Daten das Bild braucht, und prüfen, ob sie zuverlässig abrufbar vorliegen. Stand: nur die Vorbelegung in `ui/src/imagePrompts.ts` (ADR-084, Bericht D.18); keine fachliche Vorgabe je Bereich.
  - **H1 – Worldbuilding- und Namensquellen:** Es gibt zahlreiche Anleitungen zum Worldbuilding und Seiten zur Namensbildung (z. B. erfundene, kanadisch klingende Städtenamen); in die Erkundung einbeziehen, Verlässlichkeit und Nutzungsbedingungen prüfen. Stand: keine Namenshilfen; V.20 betrifft Figurenkarten, nicht Namen.
  - **V1 – Recherche-Baustein:** Recherche in der Software, um Kosten zu sparen und nicht alles über OpenRouter laufen zu lassen. Stand: Websuche im Weltenbauer über das OpenRouter-Plugin `web` (ADR-064) – läuft selbst über OpenRouter.
  - **Sicht des Eigentümers (2026-10-18, in 8.13 per Auswahlfragen durchgegangen):** B1, B2, B3, B4, B5, B6, B7, G3, G4, H1 und V1 je „wichtig, bald“ (Antworten: bald / später / brauche ich nicht). G1/G2: Es geht ihm um **Verlässlichkeit** – Programm und KI sollen Teile wie „Aussehen“ sicher finden und getrennt nutzen; „Bedienung (Felder statt Rauten)“ und „eigene Gliederung je Art“ nicht angekreuzt (Letzteres ist als B2 schon „wichtig, bald“). B5: Löschen oder Archivieren wird per Vorlage geklärt. Landeplätze folgen in der Planung von Phase 9 (8.13); weil alles „bald“ ist, legt die Planung die Reihenfolge fest.
- **Akzeptanzkriterien:** Jeder Befund (B1–B7, G1–G4, H1, V1) hat einen Landeplatz mit Schritt-ID oder ist per ADR verworfen; die grundsätzliche Sicht des Eigentümers je Befund ist festgehalten.
- **Betroffene Module:** offen (absehbar canon, manuscript, context, ai_gateway, api, ui)
- **Reifegrad-Wirkung:** offen (G1/G2 können das Datenmodell berühren)
- **Artefakte:** Folgeschritte, ggf. ADRs, Logbuch
- **Notizen:** Angelegt 2026-10-16. Ein erster Entwurf (PR #167, geschlossen) war auf einem veralteten lokalen Stand vom 2026-09-30 entstanden und ist ersetzt.

#### V.36: Cache-Treffer der KI-Anbieter festhalten

- **Status:** ⏸️ VERSCHOBEN → 9.10 (in Phase 9 übernommen 2026-10-18, ADR-090)
- **Landeplatz (nur VERSCHOBEN):** 8.13 (Eigentümer, 2026-10-18: „Ja, leg den Schritt an“; neuer Wunsch während Phase 8) – weiter 2026-10-18: 9.10 (ADR-090)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein für die Protokollzeile (nur Token-Zahlen, wie ADR-021 und `docs/project-context.md` Abschnitt 6 erlauben); ja, falls die Verbrauchsdateien (ADR-023) oder die Antwort von `/api/usage` ein neues Feld bekommen (Kategorie 4 bzw. 5, rein additiv)
- **Empfohlene Klasse:** Routine – klar umrissene Erweiterung des Adapters mit Tests; Entscheidung, falls Verbrauchsdateien oder `/api/usage` erweitert werden (Eskalations-Auslöser 1).
- **Eingangskriterien:** keine; berührte Bestandteile (`ai_gateway`, Observability Logging und Metriken) sind `[BELASTBAR]`
- **Anforderungen (ab Klasse M):** keine (Kostenziel Vision 4, `docs/project-context.md` Abschnitt 6)
- **Zu tun:** OpenRouter liefert mit jeder Antwort (Anfrage mit `usage: {include: true}`) `usage.prompt_tokens_details.cached_tokens` (aus dem Zwischenspeicher gelesen) und `cache_write_tokens` (neu hineingeschrieben); `ai_gateway/openrouter.py` liest bisher nur `prompt_tokens`, `completion_tokens` und `cost`. (1) `Usage` um gelesene und geschriebene Cache-Token erweitern, fehlende oder fehlerhafte Werte wie bisher dulden; (2) beide Zahlen in der Protokollzeile `ki_anfrage`; (3) nach Wahl des Eigentümers auch in Verbrauchsdatei und Verbrauchsübersicht; (4) an wiederholten echten Anfragen je Ablauf (Schreiben, Weltenbauer, Kurzfassung) messen, welcher Anteil der Eingabe aus dem Zwischenspeicher kommt – belegt oder widerlegt den Nebenbefund in `docs/research/modell-eignungstest.md` („Nicht gezielt gemessen“).
- **Akzeptanzkriterien:** Tests mit Feld, ohne Feld und mit fehlerhaften Werten; Protokollzeile nennt die Cache-Token; zwei gleiche echte Anfragen hintereinander zeigen beim zweiten Mal einen Wert über 0 oder der Befund „kein Treffer“ ist mit Modell und ausführendem Anbieter festgehalten; Messung (4) im Logbuch; Eigentümer bestätigt.
- **Betroffene Module:** ai_gateway, ggf. api und ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ggf. ADR
- **Notizen:** Angelegt 2026-10-18 nach der Frage des Eigentümers, ob sich die Cache-Nutzung bei Anbietern prüfen lässt. Ergebnis der Recherche: Kein Anbieter meldet vor der Anfrage, ob der Zwischenspeicher gefüllt ist; sichtbar ist es erst in der Antwort. OpenRouter zeigt es zusätzlich auf der Activity-Seite und über `/api/v1/generation` (`cache_discount`); aufeinanderfolgende Anfragen an dasselbe Modell gehen an denselben ausführenden Anbieter, solange dort das Lesen aus dem Zwischenspeicher günstiger ist. xAI direkt: `usage.prompt_tokens_details.cached_tokens`, Treffer nur bei unverändertem Anfang der Anfrage. Bildanfragen (`ai_gateway/openrouter_images.py`) nicht betroffen.

#### V.37: Verbrauchsstatistik je Welt und je Geschichte

- **Status:** ⏸️ VERSCHOBEN → 9.11 (in Phase 9 übernommen 2026-10-18, ADR-090)
- **Landeplatz (nur VERSCHOBEN):** 8.13 (Eigentümer, 2026-10-18: „Beide vormerken, ein PR“; neuer Wunsch während Phase 8) – weiter 2026-10-18: 9.11 (ADR-090)
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** keine; mit V.36 zusammen denken (Cache-Token als weitere Kennzahl)
- **Freigabepflichtig:** ja – Datenmodell (Kategorie 4): Die Verbrauchszeile bekommt Welt und Geschichte; das ist Option C aus ADR-023, die damals bewusst nicht gewählt wurde. Neuer Endpunkt für die Auswertung (Kategorie 5, additiv)
- **Empfohlene Klasse:** Entscheidung – Datenmodelländerung gegen eine bestehende Entscheidung (Eskalations-Auslöser 1).
- **Eingangskriterien:** berührte Bestandteile (`api`, `ui`, Datenmodell, Observability Metriken) sind `[BELASTBAR]`; Vorlage zur Zuordnung freigegeben
- **Anforderungen (ab Klasse M):** keine (Kostenziel Vision 4); neue Anforderung beim Durchgehen in 8.13 anlegen
- **Zu tun:** Wunsch des Eigentümers: „ein umfangreiches Statistik-System“. (1) Jede Verbrauchszeile (`api/usage.py`, `system/verbrauch/JJJJ-MM.md`) trägt künftig Welt und, wo es eine gibt, Geschichte – nur Kennungen, kein Text (ADR-021 bleibt). (2) Übersicht **je Welt**: Anzahl der Anfragen, Token ein, Token aus, Token gesamt, Kosten gesamt, Anfragen ohne Kostenangabe, Aufteilung nach Art (Schreiben, Kurzfassung, Gesamtzusammenfassung, Weltenbauer, Bildbeschreibung, Bilderzeugung, Aussehen); dazu die Summe ihrer Geschichten. (3) Dieselbe Übersicht **je Geschichte** (Roman, Kurzgeschichte, Fragment). (4) **Modell-Verlauf** je Welt und je Geschichte: alle verwendeten Modelle mit Anzahl der Anfragen, Token und Kosten, sortierbar nach Häufigkeit oder nach Token-Menge (Eigentümer, 2026-10-18: „Menge“, nicht Tempo). (5) Ort in der Oberfläche als Mockup vorlegen.
- **Akzeptanzkriterien:** Vorlage mit Mockup und ADR (Änderung zu ADR-023); Tests für Zuordnung, Summen, Sortierung und alte Zeilen ohne Welt; Summen je Welt plus Anfragen ohne Welt ergeben die Monatssumme; Eigentümer bestätigt.
- **Betroffene Module:** api, ui; ggf. canon und manuscript (Namen der Welten und Geschichten)
- **Reifegrad-Wirkung:** keine (Datenmodell bleibt `[BELASTBAR]` nach ADR)
- **Artefakte:** Code, Tests, ADR, Mockup
- **Notizen:** Angelegt 2026-10-18. **Alte Anfragen lassen sich nicht nachträglich zuordnen** – die Zeilen enthalten bewusst weder Welt noch Geschichte (ADR-023); rückblickend wären nur die Modelle übernommener Vorschläge je Kapitel aus dem Verlauf (ADR-056) zu holen, ohne Token und Kosten. Die Statistik beginnt also mit dem Umbau; die Monatssummen bleiben vollständig. Offen für die Vorlage: Zuordnung von Weltenbauer aus dem Manuskript (8.9: Welt und Geschichte?), Bildern an Kanon-Einträgen (Welt) und Titelbildern (Geschichte); Verhalten bei Gast-Figuren (Anfrage zählt zur Geschichte, nicht zur Heimatwelt der Figur); was beim Löschen einer Welt oder Geschichte mit ihren Zeilen geschieht (B5 in V.35). Tempo (Token je Sekunde) bewusst nicht gewünscht – dafür müsste die Dauer je Anfrage gespeichert werden.

#### V.38: SillyTavern-Export liest „Wesen“ über die Abschnittsregel

- **Status:** ⏸️ VERSCHOBEN → 9.15 (Planung der nächsten Ausbaustufe)
- **Landeplatz (nur VERSCHOBEN):** 9.15 (Befund in 9.3, 2026-10-18; neue Punkte während Phase 9 → Landeplatz 9.15, ADR-090)
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** 9.3
- **Freigabepflichtig:** ja – Ausgabe der Figurenkarte ändert sich (Kategorie 5, ADR-066)
- **Empfohlene Klasse:** Entscheidung – Änderung eines per ADR festgelegten Ausgabeformats (Eskalations-Auslöser 1).
- **Eingangskriterien:** 9.3 erledigt
- **Anforderungen (ab Klasse M):** FR-030
- **Zu tun:** `card_for` in `canon/importers/sillytavern.py` trennt `personality` an der wörtlichen Zeile `### Wesen` und nimmt alles danach; Abweichung von Regel-003. Seit ADR-092 legt die Vorlage `## Wesen` an (Ebene 2) – solche Figuren gehen ganz in `description`, `personality` bleibt leer; bei `### Wesen` gehen Fähigkeiten, Geschichte und Beziehungen mit in `personality`. Vorlage: `personality` = nur der Abschnitt „Wesen“ (über `canon/sections.py`), Rest in `description`; Folgen für den Rückimport (Reihenfolge der Abschnitte) prüfen.
- **Akzeptanzkriterien:** Vorlage und ADR (Änderung zu ADR-066); Tests für beide Ebenen und den Rückimport.
- **Betroffene Module:** canon
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR
- **Notizen:** Angelegt 2026-10-18 in 9.3 (Bericht des Unteragenten, geprüft von der bauenden KI). Bisher kein Schaden gemeldet; betrifft nur den Export als Figurenkarte.

#### V.21: Veröffentlichung (öffentlicher Link zum Lesen)

- **Status:** ⏸️ VERSCHOBEN → 9.15 (Planung der nächsten Ausbaustufe) – weiter verschoben 2026-10-18 (ADR-090)
- **Landeplatz (nur VERSCHOBEN):** 7.8 (Eigentümer 2026-10-12 in 7.4: „Als V-Schritt vormerken“, ADR-071) – weiter 2026-10-13: 8.13 (ADR-081) – weiter 2026-10-18: 9.15 (ADR-090)
- **Phasentyp-Kontext:** offen
- **Abhängigkeiten:** 7.4
- **Freigabepflichtig:** ja – öffentlicher Zugang ohne Anmeldung (Kategorie 6), Architektur (Kategorie 1)
- **Empfohlene Klasse:** Entscheidung – Sicherheits- und Architekturentscheidung (Eskalations-Auslöser 1).
- **Eingangskriterien:** Bedarf des Eigentümers geklärt
- **Anforderungen (ab Klasse M):** – (Teil von Vision 5 „Veröffentlichung“)
- **Zu tun:** Eine Geschichte für andere lesbar machen, z. B. über einen geheimen Link; Schutz der übrigen Daten, Widerruf, Bedrohungsmodell ergänzen.
- **Akzeptanzkriterien:** in 7.8 festzulegen
- **Betroffene Module:** offen
- **Reifegrad-Wirkung:** offen
- **Artefakte:** ADR
- **Notizen:** Angelegt 2026-10-12 in 7.4 (ADR-071).

#### V.20: Figurenkarten im Netz finden, ohne auf Bezahlseiten zu landen

- **Status:** ⏸️ VERSCHOBEN → 9.15 (Planung der nächsten Ausbaustufe) – weiter verschoben 2026-10-18 (ADR-090)
- **Landeplatz (nur VERSCHOBEN):** 7.8 (Eigentümer 2026-10-12: zuerst „später aufgreifen“, in 6.10 „weiter zurückstellen“) – weiter 2026-10-13: 8.13 (ADR-081) – weiter 2026-10-18: 9.15 (ADR-090)
- **Phasentyp-Kontext:** offen (zuerst ERKUNDUNG: was genau fehlt)
- **Abhängigkeiten:** 6.8
- **Freigabepflichtig:** offen – je nach Form ggf. externe Abhängigkeit (Kategorie 3), z. B. Anbindung einer Kartensammlung oder Websuche
- **Empfohlene Klasse:** Entscheidung – Form noch offen (Eskalations-Auslöser 1, sobald ein Vorschlag ansteht).
- **Eingangskriterien:** Klärung mit dem Eigentümer, was er sucht und wo er landet
- **Anforderungen (ab Klasse M):** – (Ergänzung zu FR-030)
- **Zu tun:** Beobachtung des Eigentümers nach der Probe von 6.8: Bei der Suche nach Figurenkarten im Internet landet man auf Bezahlseiten. Bedarf und mögliche Hilfen klären (z. B. Hinweise auf freie Sammlungen, Weltenbauer als Alternative zum Suchen).
- **Akzeptanzkriterien:** in 6.10 festzulegen
- **Betroffene Module:** offen
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Notiz, ggf. ADR
- **Notizen:** Angelegt 2026-10-12 nach der Probe von 6.8.

---

<!-- ANCHOR:iterations-reflexion -->
## Iterations-Reflexion

Nach Abschluss jeder Phase wird ein Reflexions-Eintrag `[PHASEN-WECHSEL]` im Logbuch angelegt (Verdichtung nach `CLAUDE.md` Abschnitt 14); die Phasen-Bilanzen stehen bei den Phasen oben. Bisher: Phase 1 (2026-09-26), Phase 2 (2026-09-26), Phase 3 (2026-09-27), Phase 4 (2026-10-08).

---

<!-- ANCHOR:parallelisierbarkeit -->
## Parallelisierbarkeit

- Schritte **ohne Abhängigkeiten zueinander**: 1.1, 1.2, 1.3; 2.3 und 2.5 (nach 2.2); 3.4, 3.5, 3.6, 3.9 (nach 3.3); 5.1, 5.3, 5.4
- Schritte **mit gemeinsamen Modulen** (Konfliktgefahr): 2.3 und 2.4 (`canon`); 3.4, 3.5, 3.6 und 3.7 (`context`); 3.8 (`canon`, `manuscript`, `ui`) mit 3.4 und 3.7

<!-- ANCHOR:replanning-historie -->
## Replanning-Historie

- 2026-09-26 – Erstplanung in Modus 2 Schritt 6 (fünf Phasen, Querschnitt D.1–D.4 und V.1–V.3); kein Replanning.
- 2026-10-08 – Neuplanung nach STOPP Phasen-Wucherung in Phase 4 (16 Schritte, 17. ausgelöst durch Modell-Sperren) und Befunden aus der Nutzung; Pflichtfrage mit getrennter Instanz, Entscheidung B „gezielt umbauen“ (ADR-042). Phase 4 ohne weitere Schritte (offen: 4.8). Phase 5 umbenannt in „Alltagstauglichkeit und Soll-Anforderungen“, neuer ursprünglicher Schrittplan 13 (5.7–5.13 neu). Querschnitt: D.13 (Erkundung Sperren im Text), V.6–V.9.

<!-- ANCHOR:archiv-abgeschlossene-phasen -->
## Archiv / abgeschlossene Phasen

- Phase 1: [`docs/archiv/fahrplan-phase-1.md`](archiv/fahrplan-phase-1.md) – abgeschlossen 2026-09-26
- Phase 2: [`docs/archiv/fahrplan-phase-2.md`](archiv/fahrplan-phase-2.md) – abgeschlossen 2026-09-26
- Phase 3: [`docs/archiv/fahrplan-phase-3.md`](archiv/fahrplan-phase-3.md) – abgeschlossen 2026-09-27
- Phase 4: [`docs/archiv/fahrplan-phase-4.md`](archiv/fahrplan-phase-4.md) – abgeschlossen 2026-10-08
- Phase 5: [`docs/archiv/fahrplan-phase-5.md`](archiv/fahrplan-phase-5.md) – abgeschlossen 2026-10-11
- Phase 6: [`docs/archiv/fahrplan-phase-6.md`](archiv/fahrplan-phase-6.md) – abgeschlossen 2026-10-12
