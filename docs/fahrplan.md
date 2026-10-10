# Fahrplan

<!-- Zentrales Arbeitsdokument. Wird vor jeder Änderung gelesen (CLAUDE.md Abschnitt 2)
     und nach jedem Arbeitsschritt sowie zu Sessionende aktualisiert (Abschnitt 12).
     Phasen sind nach Typ klassifiziert (Erkundung / Umsetzung / Stabilisierung),
     weil iterative Entwicklung unterschiedliche Erfolgskriterien pro Phasentyp braucht. -->

<!-- ANCHOR:aktueller-stand -->
## Aktueller Stand

- **Stand vom:** 2026-10-10, nach dem Deployment `628f559` (5.6 Genre und Schreibweise, 5.11 Kanon in der Leiste der Geschichte eingespielt; Anweisung des Eigentümers „einspielen“)
- **Laufende Phase:** Phase 5 „Alltagstauglichkeit und Soll-Anforderungen" (Phase 4 abgeschlossen 2026-10-08, ADR-042: gezielt umbauen; v0.1.0 Vorabversion, ADR-043)
- **Phasentyp:** UMSETZUNG
- **Aktiver Schritt:** keiner. Am 2026-10-11 erledigt: 5.14 (v1.0.0, ADR-058), D.4 (ADR-057), 5.20, 5.13, 5.16. Am 2026-10-10 erledigt: 5.12, 5.26, 5.1, 5.2, 5.21, 5.11, 5.6, 5.3
- **Nächster Schritt:** 5.5 Planung der nächsten Ausbaustufe (V.1–V.19) – letzter Schritt von Phase 5, danach Phasengrenze mit Vision-Abgleich und Pflichtfrage. Phase 5 steht mit 26 Schritten an der Wucherungs-Schwelle – ein neuer Schritt löst den Stopp mit Neuplanung aus. Querschnitt: D.11 bis 2026-10-31 (Eigentümer). Datiert: D.1 frühestens 2026-11-05; D.5 ab 2026-11-12; D.15 ab 2026-12-17; D.9 2026-12-28. Knappe Ressource: Wochenkontingent Max 5x (Zurücksetzung sonntags 10:00 MESZ)
- **Offene STOPP-Situationen:** keine – STOPP Phasen-Wucherung (Phase 4, 16 Schritte) aufgelöst am 2026-10-08 durch Neuplanung, Vision-Abgleich und Pflichtfrage (ADR-042; Bewertung `docs/research/bewertung-phase-4.md`). Die Befunde (a)–(h) und die Modell-Sperren haben ihren Landeplatz in 5.7–5.13, D.13, V.6–V.9.

---

<!-- ANCHOR:uebersicht -->
## Übersicht

Ampel (eingeführt 2026-10-08 auf Wunsch des Eigentümers; Rot nur für Blockiertes, damit ein echtes Problem auffällt): ✅ erledigt · 🟠 in Arbeit · ⚪ offen · 🔴 blockiert · 🔵 wartet auf Freigabe · ⏸️ verschoben · ❌ verworfen. „Nächster Zug“ sagt, wer als Nächstes etwas tun muss – „du“ ist der Eigentümer. Abgeleitet aus den Status-Zeilen der Schritte unten; Quelle bleibt der Schritt selbst. Wird bei jeder Statusänderung und zu Sessionende mit nachgezogen (Drift-Prüfung `CLAUDE.md` Abschnitt 16, wie „Aktueller Stand“).

**Phase 5: 23 von 26 erledigt, 0 in Arbeit, 1 offen, 2 verschoben (5.25 → V.13, 5.4 → V.16).**

| | Schritt | Titel | Status | Nächster Zug |
|---|---|---|---|---|
| ✅ | 5.1 | Kanon-Vorschläge ohne `@` | erledigt 2026-10-10 | – |
| ✅ | 5.2 | Bedienung am Smartphone | erledigt 2026-10-10 | – |
| ✅ | 5.3 | Lesbare Dateien – Nachweis | erledigt 2026-10-10 | – |
| ⏸️ | 5.4 | Zeitlinie mit Datumsangaben im Kalender der Welt (Kann) | verschoben → V.16 | – |
| ⚪ | 5.5 | Planung der nächsten Ausbaustufe | offen | KI – zuletzt |
| ✅ | 5.6 | Atmosphärische Schreibweise je Geschichte | erledigt 2026-10-10 | – |
| ✅ | 5.7 | Startmodell grok-4.6 | erledigt | – |
| ✅ | 5.8 | Nahtloser Anschluss ohne Einleitung und Schlusssatz | erledigt | – |
| ✅ | 5.9 | Kapitel öffnet am Textende | erledigt | – |
| ✅ | 5.10 | Kosten je Vorschlag sichtbar | erledigt | – |
| ✅ | 5.11 | Seitenaufbau und Abläufe der Oberfläche neu ordnen | erledigt 2026-10-10 | – |
| ✅ | 5.12 | Modell-Auswahl aktuell vom Anbieter | erledigt 2026-10-10 (ADR-055) | – |
| ✅ | 5.13 | Verlauf der Anweisungen als umschaltbare Ansicht | erledigt 2026-10-11 (ADR-056) | – |
| ✅ | 5.14 | Go-Live-Prüfung vor v1.0.0 | erledigt 2026-10-11 – v1.0.0 (ADR-058) | – |
| ✅ | 5.15 | KI schreibt nur das Verlangte, nicht bis zum bekannten Ende | erledigt | – |
| ✅ | 5.16 | Herangezogene Kanon-Einträge anklickbar | erledigt 2026-10-11 | – |
| ✅ | 5.17 | Leerzeichen nach der Auswahl im `@`-Menü | erledigt | – |
| ✅ | 5.18 | Herangezogene Begriffe im Anweisungsfeld hervorheben | erledigt | – |
| ✅ | 5.19 | Dunkelmodus | erledigt 2026-10-09 | – |
| ✅ | 5.20 | Schnell nacheinander angelegte Kapitel | erledigt 2026-10-11 | – |
| ✅ | 5.21 | Als App installierbar (PWA) | erledigt 2026-10-10 | – |
| ✅ | 5.22 | Wiederkehrende Atmosphäre und Schlussgeste bei „lang“ | erledigt 2026-10-09 | – |
| ✅ | 5.23 | `@`-Verweis mit Genitiv-s | erledigt und eingespielt 2026-10-09 | – |
| ✅ | 5.24 | Zweite Testgeschichte und wiederholte Läufe (Regel-002) | erledigt 2026-10-09 | – |
| ⏸️ | 5.25 | Antworten des Servers nicht im Browser-Speicher | verschoben → V.13 | – |
| ✅ | 5.26 | Kanon-Treue mit grok-4.6 prüfen | erledigt 2026-10-10 | – |

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
| ✅ | D.16 | Reaktionszeit erneut erkunden – grok-4.7 über 90 s | erledigt 2026-10-10 (ADR-052) | – |

Verschoben auf die nächste Ausbaustufe (Landeplatz 5.5): V.1–V.19.

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

### Phase 5: Alltagstauglichkeit und Soll-Anforderungen – Typ: UMSETZUNG

**Ziel:** Das Skriptorium ist für das tägliche Schreiben des Eigentümers alltagstauglich – Modelle sperren seine Texte nicht, die KI schreibt nahtlos weiter, die Oberfläche ist übersichtlich und intuitiv (gezielter Umbau nach ADR-042) –, die Soll-Anforderungen und die Kann-Anforderung sind umgesetzt oder begründet zurückgestellt, und die nächste Ausbaustufe ist geplant.

**Abschlusskriterium:** Schritte 5.1–5.26 `[ERLEDIGT]`, `[VERWORFEN]` mit ADR oder `[VERSCHOBEN]` mit Ziel-Schritt in der nächsten Ausbaustufe (5.25 → V.13, 5.4 → V.16, Eigentümer 2026-10-10).

**Reifegrad-Erwartung am Phasenende:** unverändert `[BELASTBAR]`. Der Umbau betrifft nur `ui` (Seitenaufbau, 5.11) und Randstellen in `ai_gateway`/`api` (Modell-Katalog, 5.12); neue gespeicherte Daten (5.6, 5.13) werden per ADR festgelegt.

**Ursprünglicher Schrittplan:** 13 Schritte, festgehalten am 2026-10-08 durch die Neuplanung nach ADR-042 (vorher 5 Schritte vom 2026-09-26, +5.6) – wird nicht still hochgesetzt (CLAUDE.md Abschnitt 8, Kriterium 9). Wucherungs-Schwelle: mehr als 26 Schritte und mindestens +5. Stand 2026-10-09: 26 Schritte (+5.14, ADR-043; +5.15 bis +5.23 Befunde und Wünsche des Eigentümers; +5.24 ADR-047; +5.25 und +5.26 Wünsche des Eigentümers) – an der Wucherungs-Schwelle.

**Reihenfolge (ADR-042; 5.1 am 2026-10-09 vor 5.11 Teil 3 gezogen):** zuerst die kleinen Abhilfen 5.7, 5.8, 5.9, dann 5.10, der Umbau der Oberfläche 5.11, danach 5.16, 5.6, 5.12, 5.13; anschließend 5.2 (Smartphone, auf dem neuen Aufbau), 5.1, 5.3, 5.4, dann 5.14 (Go-Live-Prüfung) und 5.5.

**Pflichtfrage am Phasenende:** ADR „Weiterbauen, umbauen oder neu aufsetzen" – Nummer wird beim Phasenabschluss vergeben

#### 5.1: Kanon-Vorschläge ohne `@`

- **Status:** ✅ ERLEDIGT (2026-10-10) – eingespielt mit `e61ccd3`, vom Eigentümer bestätigt („die Canonerkennung ohne @ funktioniert“); Schreibvarianten eines Namens (z. B. „Sibylle“/„Sybille“) werden über Aliasse abgedeckt, nicht unscharf erkannt. Vorher: 🟠 IN ARBEIT (seit 2026-10-09) – Form vom Eigentümer gewählt (Auswahlfragen): Erkennung nur in der Anweisung, Vorschläge als Zeile darunter, ein Tipp macht den Namen zum `@`-Verweis; Erkennung im Browser (ADR-049). Mockup vorher/nachher freigegeben („Ja“); umgesetzt auf `feat/5.1-vorschlaege-ohne-at`: `suggestions` und `acceptSuggestion` in `references.ts`, Zeile „Meintest du:“ im Schreibfeld. Tests: `vitest` 144 bestanden, `references.ts` 100 %, gesamt 98,03 % Zeilen / 95,46 % Zweige; Playwright 10 bestanden; Test belegt: nicht angenommener Vorschlag geht nicht an die KI. Offen: Merge, Einspielen (derzeit keine Arbeiten am VPS), Bestätigung des Eigentümers
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 3.5
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Namenserkennung über den vorhandenen Index, spezifiziert in `context`.
- **Eingangskriterien:** wie Phase 3
- **Anforderungen (ab Klasse M):** FR-014
- **Zu tun:** Kanon-Namen ohne `@` erkennen und nur als Vorschlag anbieten („Meintest du @Kael?").
- **Akzeptanzkriterien:** Nicht angenommene Vorschläge beeinflussen den KI-Kontext nicht (FR-014).
- **Betroffene Module:** ui (ADR-049; vorher context, ui)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR-049
- **Notizen:** Vorgezogen auf Wunsch des Eigentümers (2026-10-09, nach der Frage, ob Wörter ohne `@` erkannt werden): direkt nach 5.2/5.21, vor 5.11 Teil 3.

#### 5.2: Bedienung am Smartphone

- **Status:** ✅ ERLEDIGT (2026-10-10) – vom Eigentümer am iPhone in der installierten App geprüft („passt alles“, 2026-10-10: neue Szene, Weiterschreiben, „In den Kanon“ mit Markieren per Finger). Verlauf: 🟠 IN ARBEIT (seit 2026-10-09) – Prüfung am Smartphone-Format (Playwright, 390 × 844 und 360 × 740, Abläufe UC-003, UC-004, UC-008 und Kanon-Pflege, kein seitliches Scrollen): drei Befunde; behoben auf Branch `feat/5.2-smartphone-und-pwa` nach Vorher-/Nachher-Vergleich: Formular „In den Kanon“ rückt ins Bild (auch Desktop), Knöpfe hinter „⋯“ klappen nach der Wahl zu, auf 360 px eine Zeile für Modell, Länge, „⋯“, „Weiter“; Szenen-Formular bleibt (eng, aber bedienbar). Tests: `vitest` 137 bestanden, 98,11 % Zeilen / 95,67 % Zweige; Playwright 10 bestanden. Gemergt (#81, `a71cdff`) und eingespielt 2026-10-09. Offen: Prüfung auf dem Smartphone des Eigentümers (Markieren mit dem Finger)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 4.7, 5.11 (neuer Seitenaufbau; ADR-042)
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Anpassung der Oberfläche ohne Architekturwirkung.
- **Eingangskriterien:** öffentliches System läuft
- **Anforderungen (ab Klasse M):** FR-019
- **Zu tun:** Oberfläche für Smartphone-Bildschirme anpassen; Test auf einem Smartphone-Browser.
- **Akzeptanzkriterien:** UC-003, UC-004, UC-008 auf einem Smartphone-Browser durchführbar (FR-019).
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests
- **Notizen:** Wunsch des Eigentümers 2026-10-08: prüfen, wie weit die Seite überhaupt für mobile Bedienung taugt; kommt nach 5.11 Teil 2 (Chat-Aufbau), zusammen mit 5.21 (PWA), vor 5.11 Teil 3.

#### 5.3: Lesbare Dateien – Nachweis

- **Status:** ✅ ERLEDIGT (2026-10-10) – Nachweis an einer über die Schnittstelle angelegten Welt (Kanon mit Alias, Gast aus zweiter Welt, Geschichte mit Genre, Schreibweise, Fakten, Gesamtzusammenfassung, Kapitel mit Kurzfassung): alles liegt unter `worlds/<welt>/` als Markdown mit YAML-Kopf (`world.md`, `canon/<kategorie>/<eintrag>.md`, `stories/<geschichte>/story.md`, `facts.md`, `chapters/01-<titel>.md`), UTF-8, deutsche Schlüssel; `index.sqlite` ist nur der abgeleitete Suchindex, keine Datei einer Welt liegt anderswo. Keine Lücke gefunden. Dauerhaft abgesichert durch `tests/api/test_readable_files.py`; Belegauszug im Logbuch
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

- **Status:** ⏸️ VERSCHOBEN → V.16 (Eigentümer, 2026-10-10, Auswahlfrage: „In die nächste Ausbaustufe“)
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

- **Status:** ⚪ OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.1, 5.2, 5.3, 5.4
- **Freigabepflichtig:** ja – neue Phasen sind Replanning (Fahrplan, Replanning-Historie)
- **Empfohlene Klasse:** Entscheidung – inhaltliche Neuplanung mit Vision-Abgleich, nicht bloß Status-Update.
- **Eingangskriterien:** Vision-Abgleich an der Phasengrenze nach Phase 5
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Die verschobenen Schritte V.1 bis V.16 in konkrete Schritte einer neuen Phase überführen oder per ADR verwerfen (V.4 und V.5 ergänzt beim Phasenabschluss 3: ihr Landeplatz ist 5.5; V.6 bis V.9 ergänzt 2026-10-08, Wünsche des Eigentümers; V.10 ergänzt 2026-10-10, ADR-050).
- **Akzeptanzkriterien:** Jeder Schritt V.1–V.16 hat einen neuen `[OFFEN]`-Schritt mit ID oder einen `[VERWORFEN]`-Status mit ADR.
- **Betroffene Module:** keine (Planung)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Fahrplan, ggf. ADRs
- **Notizen:** –

#### 5.6: Atmosphärische Schreibweise je Geschichte

- **Status:** ✅ ERLEDIGT (2026-10-10) – eingespielt (`628f559`), vom Eigentümer bestätigt („die Funktionen sind auch vorhanden“); Wirkungsprobe: Schreibweise wirkt, Kanon-Treue unverändert (ADR-053). Verlauf: 🟠 IN ARBEIT (seit 2026-10-10) – Erkundung der Form innerhalb des Schritts (Eigentümer: „5.6 Erkundung“, Reihenfolge bestätigt). Listenwerte übernommen (siehe „Entschieden 2026-10-10“). Wirkungsprobe gelaufen 2026-10-10 (`spikes/schreibweise-5.6/README.md`, 12 Ketten, 2,91 $): verblindet 18 von 18 Ketten richtig zugeordnet, B kürzt die Sätze in beiden Geschichten, 0 Kanon-Verstöße mit und ohne Schreibweise, keine Sperren – Platz hinter der Figuren-Schreibweise bestätigt. Datenmodell entschieden (ADR-053: Vorgabe je Geschichte, Kopie ins neue Kapitel; Tempo und Deutlichkeit je ein Wert; Genre nur je Geschichte; Option B als V.14). Mockup vorher/nachher freigegeben („Passt so“). **Umgesetzt** auf Branch `feat/5.6-schreibweise` (Umsetzung an einen Unteragenten der Routine-Klasse abgegeben, geprüft): `manuscript` (`WritingStyle`, Felder an Geschichte und Kapitel, Kopie beim Anlegen), `context` (Block hinter der Figuren-Schreibweise), `api` (Felder rein ergänzend), `ui` (`WritingStyle.tsx`, Zeile „Schreibweise Kapitel N“). Tests: pytest 460, Python 99,8 %, `context` 100 %; `vitest` 156, 98,08 % Zeilen / 95,5 % Zweige; Playwright 11. Offen: Merge, Einspielen, Bestätigung des Eigentümers. Bisher: Datenmodell als `ENTSCHEIDUNG ERFORDERLICH` (Kategorie 4) mit Mockup
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 4.8, 5.11 (Platz in der neuen Oberfläche; ADR-042)
- **Freigabepflichtig:** ja – neue Felder je Kapitel (ggf. auch je Geschichte) sind eine Datenmodelländerung (Kategorie 4); Form vor Beginn klären
- **Empfohlene Klasse:** Entscheidung – Klärung der Form und Datenmodell-Vorschlag (Eskalations-Auslöser 1); die Umsetzung danach ist Routine.
- **Eingangskriterien:** Form mit dem Eigentümer geklärt
- **Anforderungen (ab Klasse M):** FR-026
- **Zu tun:** Wunsch des Eigentümers beim Funktionstest 2026-10-08: neben der Erzählperspektive eine atmosphärische Schreibweise vorgeben. Offene Fragen vor Beginn: freier Text oder Auswahl von Bausteinen (Ton, Tempo, Satzbau) oder beides; eine Textprobe als Vorbild; je Geschichte, je Welt als Vorgabe oder je Anfrage; wo im Prompt und mit welchem Gewicht gegenüber Kanon und Figuren-Schreibweise. Antworten des Eigentümers 2026-10-08 (Logbuch 10:20 UTC): **je Kapitel** Tonalität und Atmosphäre festlegen; **Auswahllisten**, mehrere kombinierbar, weil er sich die Angaben schlecht merken kann; **freier Text bleibt zusätzlich**. Bedarf vom Eigentümer bekräftigt („auf jeden Fall“). Genres, in denen er schreibt (Grundlage für die Listen): Dark Romance, Thriller, düstere Geschichten, Dark Erotic, CNC. Entschieden 2026-10-08 (Auswahl-Fragen, Logbuch 12:10 UTC): Genre als eigene Auswahl je Geschichte, mehrfach wählbar; Tonalität und Atmosphäre als Vorgabe je Geschichte, die jedes neue Kapitel übernimmt und im Kapitel änderbar ist. Noch offen: Textprobe als Vorbild; Priorität (Soll oder Muss).
- **Entschieden 2026-10-10 (Eigentümer: „Listen so übernehmen“, „Reihenfolge passt“):** Listen – **Genre:** Dark Romance, Dark Erotic, CNC, Thriller, Psychothriller, düstere Geschichte, Horror, Dark Fantasy, Krimi; **Tonalität:** düster, bedrückend, kalt, roh, sinnlich, zärtlich, leidenschaftlich, melancholisch, bedrohlich, nüchtern, ironisch; **Atmosphäre:** beklemmend, angespannt, unheimlich, gefährlich, schwül, intim, eisig, hoffnungslos, still, fiebrig; **Tempo:** langsam, gemessen, zügig, atemlos; **Stil:** knapp, schlicht, bildhaft, poetisch, ausführlich, dialogreich; **Deutlichkeit:** angedeutet, sinnlich, explizit. Reihenfolge der Erkundung: (1) Listenwerte, (2) Wirkungsprobe nach Regel-002 vor dem Bau, (3) Platz im Prompt direkt hinter der Figuren-Schreibweise, mit Vorrang für Kanon und geführte Figuren (Vorschlag, in der Probe so aufgebaut), (4) Datenmodell als Entscheidung mit Mockup.
- **Akzeptanzkriterien:** nach FR-026; Schreibweise in der Oberfläche einstellbar und änderbar; Tests grün; Kanon-Treue im Probeschreiben nicht schlechter als vorher.
- **Betroffene Module:** manuscript, context, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ggf. ADR, Logbuch-Eintrag mit Probeschreiben
- **Notizen:** Angelegt 2026-10-08. Phase 5 jetzt 6 Schritte (ursprünglich 5) – Wucherungs-Schwelle nicht berührt.

#### 5.7: Startmodell grok-4.6

- **Status:** ✅ ERLEDIGT 2026-10-08 – ADR-044, gemergt mit PR #55; eingespielt mit `18ee07d` (2026-10-08, ADR-039); Eigentümer schrieb in einer echten Welt ohne Sperre und bestätigte („passt alles“)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 4.8 (Phasenbeginn)
- **Freigabepflichtig:** nein für den Wechsel des Startmodells (Teil von Option B, ADR-042). Stellung von grok-4.7 geklärt 2026-10-08: Eigentümer will die Modelle „live abrufen, wie bei OpenRouter geplant“ (5.12) statt die feste Liste umzusortieren; Reihenfolge der Schritte bleibt (5.12 nach 5.11). Bis dahin bleibt grok-4.7 wählbar, nur die Voreinstellung wechselt auf grok-4.6. Ergebnis als ADR `[ERKENNTNIS]` zu ADR-010/011
- **Empfohlene Klasse:** Routine – kleine Konfigurationsänderung mit Tests; die Abfrage zu grok-4.7 ist eine einfache Wahl.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-018 (Modelle ohne restriktive Inhaltsfilter), Vision 6
- **Zu tun:** Befund 2026-10-08: grok-4.7 sperrt die echten Inhalte des Eigentümers stark, grok-4.6 ist „gut machbar“. Modell-Reihenfolge in `ai_gateway/models.py` auf grok-4.6 zuerst umstellen; grok-4.7 bleibt in der Liste (danach grok-4.7, dann qwen3.8-max als Notfall-Reserve). Vorhandene Geschichten mit gespeichertem Modell bleiben unberührt (ADR-023).
- **Akzeptanzkriterien:** neue Geschichten starten mit grok-4.6 (Test); ADR mit der neuen Reihenfolge; nach dem Deployment schreibt der Eigentümer eine Szene in einer echten Welt ohne Sperre.
- **Betroffene Module:** ai_gateway, api
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR, Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-08 (Neuplanung, ADR-042).

#### 5.8: Nahtloser Anschluss ohne Einleitung und Schlusssatz

- **Status:** ✅ ERLEDIGT 2026-10-08 – Versuch 1 (PR #56/#57) und Versuch 2 gemeinsam mit 5.15 (PR #58): Vorgaben gegen Wiederholung und Schlusssatz nach der Anweisung, Zitat der letzten bis zu 30 Wörter; Kette verblindet bewertet (gleiche 6-Wort-Folgen 18–49 → 0, Einleitungen 18 → 9, Kanon eindeutig 1 → 0; `spikes/vorgriff-zeitlinie/README.md`, zweiter Lauf). Eingespielt mit `18ee07d`; Eigentümer bestätigte in einer echten Welt (2026-10-08, „passt alles“)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.7
- **Freigabepflichtig:** nein – Änderung des Rahmens innerhalb von `context`, Schnittstelle unverändert
- **Empfohlene Klasse:** Entscheidung – die Wirkung auf Kanon-Treue und Figuren-Schreibweise ist im Probeschreiben zu bewerten (Fehlschluss teuer: NFR Kanon-Treue ist `[BELASTBAR]`).
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-009 (Weiterschreiben), FR-011
- **Zu tun:** Befund 2026-10-08: Jede Fortschreibung beginnt mit einer kleinen Einleitung (Ort, Lage) und endet mit einem ähnlichen Schlusssatz – bei qwen und grok. `_frame` in `context/builder.py` um die Vorgabe ergänzen, unmittelbar an den letzten Satz der „Letzten Manuskript-Seiten“ anzuschließen, Ort, Lage und Figuren nicht neu einzuführen und ohne abschließenden oder zusammenfassenden Satz zu enden; ggf. Hinweis direkt vor der Anweisung.
- **Akzeptanzkriterien:** Tests des Rahmens grün; Probeschreiben mit grok-4.6 und qwen3.8-max an mindestens drei Stellen eines laufenden Kapitels: keine Einleitung, kein Schlusssatz in der Mehrzahl der Läufe; Kanon-Treue und Figuren-Schreibweise nicht schlechter als vorher.
- **Betroffene Module:** context
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag mit Probeschreiben
- **Notizen:** Angelegt 2026-10-08 (Neuplanung, ADR-042). Ursache vermutet, nicht belegt. Ergänzender Befund des Eigentümers (2026-10-08, nach Versuch 1): Das Muster verstärkt sich – nach sechs, sieben übernommenen Vorschlägen beginnt jeder Abschnitt mit derselben Einleitung und endet mit derselben Atmosphäre. Folgerung: Die übernommenen KI-Texte in den „Letzten Manuskript-Seiten“ wirken als Vorbild, das die KI nachahmt; das Probeschreiben aus Versuch 1 (ein vom Coding-Agent redigiertes Kapitel, ein Schritt je Stelle) konnte das nicht zeigen. Bestätigt im Probeschreiben `spikes/vorgriff-zeitlinie/` (grok-4.6 beginnt Schritt 5 und 7 mit demselben Satz). Versuch 2 muss eine Kette von 6–8 übernommenen Vorschlägen prüfen und Wiederholungen über die Kette zählen; Abhilfe ggf. „wiederhole keine Bilder und Wendungen der letzten Seiten“.

#### 5.9: Kapitel öffnet am Textende

- **Status:** ✅ ERLEDIGT 2026-10-08 – umgesetzt auf Branch `feat/5.9-kapitel-am-textende`: Manuskript-Editor mit eigenem Scrollbereich (höchstens 55 % der Fensterhöhe), öffnet mit Cursor und Ansicht am Textende und kehrt nach übernommenem Vorschlag dorthin zurück; liegen die Knöpfe unter dem Kapitel beim Öffnen außerhalb des Fensters, rückt die Seite an den Kapitelanfang. Tests: `vitest` 104 bestanden, 98,59 % Zeilen; Playwright 9 bestanden (neu: langes Kapitel mit 300 Absätzen zeigt Absatz 300, „In den Kanon“ und das Anweisungsfeld im Fenster 1280 × 720). Gemergt mit PR #63 (`32c027d`, CI 8/8 grün); Eingespielt mit `6e563e8` (2026-10-08). Eigentümer bestätigte nach dem Deployment (2026-10-08, „passt alles“; Gerät nicht genannt) – Smartphone prüft 5.2 auf dem neuen Aufbau.
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 4.8 (Phasenbeginn)
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – kleine Änderung in `ui` mit Komponenten-Test.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-022, FR-019
- **Zu tun:** Befund 2026-10-08: Beim Öffnen eines langen Kapitels muss durch den ganzen Text gescrollt werden, bis man weiterschreiben kann. Sofort-Abhilfe vor dem Umbau (5.11): Editor in der Höhe begrenzen (eigener Scrollbereich) und beim Öffnen ans Textende springen, sodass Anweisungsfeld und „In den Kanon“ ohne Scrollen der Seite erreichbar sind.
- **Akzeptanzkriterien:** Komponenten- oder End-to-End-Test: geöffnetes langes Kapitel zeigt das Textende, Schreib-Bereich sichtbar; Eigentümer bestätigt auf Desktop und Smartphone.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-08 (Neuplanung, ADR-042). Wird in 5.11 ggf. neu gebaut.

#### 5.10: Kosten je Vorschlag sichtbar

- **Status:** ✅ ERLEDIGT 2026-10-08 – ohne Code-Änderung. Ursache belegt an den Verbrauchsdaten der Produktion (nur Metadaten, `data/system/verbrauch/2026-10.md`): 77 von 82 Anfragen im Oktober mit Kosten; die 5 ohne Kosten sind 2 abgebrochene und 3 gescheiterte (`nicht_erreichbar`) – dort meldet der Anbieter keine Kosten, die Oberfläche zeigt ausdrücklich „Kosten nicht gemeldet“. Log-Zeilen seit dem Deployment `18ee07d`: alle mit `kosten_usd`. Eigentümer bestätigt (Auswahlfrage 2026-10-08): unter einem fertigen Vorschlag steht ein Betrag. Der Befund vom 2026-10-08 stammte vermutlich von einem abgebrochenen oder gescheiterten Vorschlag
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 4.8 (Phasenbeginn)
- **Freigabepflichtig:** nein (Fehlerbehebung)
- **Empfohlene Klasse:** Routine – Ursachensuche und kleine Behebung.
- **Eingangskriterien:** Angabe des Eigentümers, ob die Zeile „Kosten nicht gemeldet“ zeigt oder die Kosten ganz fehlen
- **Anforderungen (ab Klasse M):** FR-018; Vision 4 (Kosten je Anfrage)
- **Zu tun:** Befund 2026-10-08: Unter dem Vorschlag sieht der Eigentümer Token, aber keine Kosten. Angefragt sind sie (`"usage": {"include": True}`, `ai_gateway/openrouter.py`), angezeigt werden sie, wenn gemeldet (`describeUsage`). Ursache auf der Produktion klären (Verbrauchsdaten, nur Metadaten) und beheben – z. B. Kosten nachträglich beim Anbieter abfragen oder aus Preis und Token berechnen.
- **Akzeptanzkriterien:** Ursache belegt; nach jedem Vorschlag Kosten in $ sichtbar oder ausdrücklich als nicht verfügbar gekennzeichnet; Tests grün.
- **Betroffene Module:** ai_gateway, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-08 (Neuplanung, ADR-042).

#### 5.11: Seitenaufbau und Abläufe der Oberfläche neu ordnen

- **Status:** ✅ ERLEDIGT (2026-10-10) – Kanon in der Leiste eingespielt (`628f559`) und vom Eigentümer in der mobilen App bestätigt. Verlauf des Befunds (wieder geöffnet 2026-10-10): In der Geschichte zeigte die Leiste „Kanon & Geschichte“ noch die alte Nachschlage-Liste statt der neuen Kanon-Seite. Entscheidung (Auswahlfragen): als Befund zu 5.11, Leiste wie die Kanon-Seite mit Bearbeiten; Vorher-/Nachher-Vergleich freigegeben („passt so“); umgesetzt auf `fix/5.11-kanon-in-der-leiste` (`Canon` mit `guests` und `compact`, `CanonLookup` entfernt; `vitest` 147, Playwright 10 bestanden). Offen: Merge, Einspielen, Bestätigung. Vorher: alle drei Teile eingespielt (`e61ccd3`) und vom Eigentümer geprüft: Teile 1 und 2 (2026-10-09), Mitlaufen beim Schreiben der KI und Teil 3 Kanon-Seite (2026-10-10: „sehr zufriedenstellend“, Gliederung nach Kategorie „sehr gut“). Verlauf: Entwurf vom Eigentümer bestätigt (Auswahlfragen 2026-10-08); Umsetzung in drei Teilen, jeder einzeln eingespielt und geprüft. **Teil 1 Schreibseite** umgesetzt auf Branch `feat/5.11-oberflaeche`: Leiste rechts (Kapitel, Kanon nachschlagen mit Suche, Geschichte mit Gästen, Fakten, Gesamtzusammenfassung), schließbar, unter 56rem Breite als Menü über der Seite; Figuren-Schreibweise mit Kurzzeile direkt über dem Schreib-Bereich; Editorhöhe folgt dem Fenster, die Seite rückt beim Öffnen zum Kapitel, wenn es unter den Fensterrand reicht. Tests: `vitest` 115 bestanden, 98,65 % Zeilen / 96,29 % Zweige; Playwright 9 bestanden. Teil 1 gemergt (#69, `aedf68f`) und eingespielt 2026-10-08. **Teil 2 Chat-Aufbau** (2026-10-09) nach Mockup mit Vorher-/Nachher-Vergleich, vom Eigentümer freigegeben („Passt so“), umgesetzt auf Branch `feat/5.11-chat-aufbau`: Symbolleiste und Liste links (`Shell`, `StoryList`), Adressen je Ansicht mit React Router 7.18.4 hinter „#“, Schreibseite als Chat mit Vorschlag am Textende und Eingabe fest unten, rechte Leiste „Kanon & Geschichte“ bei Bedarf, „/“ ins Anweisungsfeld; ersetzt die Kapitel-Liste der rechten Leiste aus Teil 1. Tests: `vitest` 134 bestanden, 98,17 % Zeilen / 95,62 % Zweige; Playwright 9 bestanden; Onboarding im frischen Worktree geprüft. Gemergt (#79, `71f8d95`) und eingespielt 2026-10-09; Teile 1 und 2 vom Eigentümer geprüft („alles funktioniert“, 2026-10-09). **Teil 3 Kanon-Seite** (2026-10-10) nach Mockup vorher/nachher, vom Eigentümer freigegeben („Passt so“; Auswahlfragen: Bearbeiten rechts an Ort und Stelle, Lesetext mit Fett und Listen ohne neue Bibliothek, eigene Adresse je Eintrag), umgesetzt auf Branch `feat/5.11-kanon-seite`: `Canon.tsx` mit Suche, Filtern, Liste und Leseansicht, `EntryText.tsx`, Route `#/welt/<welt>/kanon/<eintrag>`. Tests: `vitest` 148 bestanden, 98,21 % Zeilen / 95,29 % Zweige; Playwright 10 bestanden. Offen: Merge, Einspielen (derzeit keine Arbeiten am VPS), Prüfung durch den Eigentümer. Befund 2026-10-09: Während die KI schreibt, sprang die Ansicht bei jedem neuen Wort ans Ende – behoben auf `fix/5.11-mitlaufen` (Ansicht folgt nur am Textende, Entscheidung des Eigentümers per Auswahlfrage). Offen: Teil 3 Kanon-Seite (nach 5.1)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.9
- **Freigabepflichtig:** teilweise – der Umbau innerhalb von `ui` nicht; eine neue Bibliothek (z. B. Router) ist Kategorie 3 und wird vorab vorgelegt
- **Empfohlene Klasse:** Entscheidung – Entwurf des neuen Aufbaus mit dem Eigentümer und Abwägung Router ja/nein; die Umsetzung danach ist Routine.
- **Eingangskriterien:** Angaben des Eigentümers, an welchen Stellen er den Überblick verliert; Entwurf des neuen Aufbaus vom Eigentümer bestätigt
- **Anforderungen (ab Klasse M):** FR-022, FR-019; Vision 8 (keine überladene Oberfläche)
- **Zu tun:** Befunde 2026-10-08: Oberfläche schon mit wenigen Welten schwer zu überblicken; Ziel „intuitiv“; Kernfunktion „In den Kanon“ (3.8) wird nicht gefunden. Laut Bewertung (`docs/research/bewertung-phase-4.md`) stapelt `StoryPage.tsx` Gäste, Schreibweise, Fakten, Zusammenfassung, Kapitel und Editor auf einer Seite; `App.tsx` hat keine Navigation über Welt/Geschichte/Kapitel hinaus. Schreiben in den Vordergrund (Manuskript ist Hauptansicht, ADR-042), Einstellungen in eigene Bereiche, klare Navigation, wichtige Funktionen sichtbar. Platz für Schreibweise (5.6) und Anweisungs-Verlauf (5.13) vorsehen. Gestaltung erst danach (V.8).
- **Akzeptanzkriterien:** Komponenten- und End-to-End-Tests auf den neuen Aufbau umgestellt und grün; Eigentümer findet Schreiben, `@`, „In den Kanon“ und Kapitelwechsel ohne Hilfe; Coverage-Mindestwerte gehalten.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Entwurf (Skizze), Code, Tests, Logbuch-Eintrag; ggf. ADR zur Bibliothek
- **Notizen:** Angelegt 2026-10-08 (Neuplanung, ADR-042). Größter Posten der Phase.
- **Entwurf (Eigentümer, 2026-10-08, Auswahlfragen):** Überblick fehlt auf der Geschichtenseite, beim Finden von Welten und Geschichten, auf der Kanon-Seite und beim Wechsel Kanon ↔ Schreiben. Ständig griffbereit: Modell und Länge, Figuren-Schreibweise. **Teil 1 Schreibseite:** Mitte Kapitel, Editor, Knöpfe, darunter Schreibweise kurz („Ich-Perspektive · du führst … · ändern“), Anweisung, Modell, Länge; rechts eine einklappbare Leiste mit Kapiteln, Kanon zum Nachschlagen (Ziel des Klicks aus 5.16) und Geschichte (Gäste, Fakten, Zusammenfassung); am Smartphone als Menü. **Teil 2 Navigation:** Leiste links mit allen Welten, die geöffnete aufgeklappt mit ihren Geschichten und Kanon, „+ Geschichte“, „+ Welt“; eigene Adressen je Ansicht mit React Router (ADR-046), Zurück, Neuladen und Lesezeichen behalten die Stelle. **Teil 3 Kanon-Seite:** Suchfeld über Name und Alias, Kategorien als Filter, Liste links, Eintrag rechts zum Lesen und Bearbeiten.
- **Entscheidungen zu Teil 2 (Eigentümer, 2026-10-09, Auswahlfragen):** Adressen mit „#“ statt ohne – kein Eingriff in den Server, der Schritt bleibt in `ui`; Taste „/“ springt ins Anweisungsfeld, solange man nicht in einem Feld schreibt. Mockup vorher/nachher (Bildschirmfotos vom Stand `8372308` neben dem Entwurf, Desktop und Smartphone) vor der Umsetzung vorgelegt und freigegeben.
- **Entwurf geändert (Eigentümer, 2026-10-08, Auswahlfragen nach Teil 1):** Aufbau wie ein Chat (TypingMind/ChatGPT): Anweisungsfeld mit Modell und Länge fest am unteren Bildschirmrand, das Manuskript scrollt darüber; links eine einklappbare Leiste mit Welten, Geschichten und Kapiteln (ersetzt die Kapitel-Liste der rechten Leiste und die Navigation aus Teil 2); rechts bei Bedarf Kanon und Einstellungen der Geschichte; am Smartphone volle Breite für den Text, Leisten als Menüs. Wird in **Teil 2** eingearbeitet (baut Teil 1 um); danach 5.2 und 5.21, dann Teil 3 Kanon-Seite. Vorbild TypingMind angesehen und Übertragung samt Entscheidungen festgehalten in `docs/research/inspiration-typingmind.md` (2026-10-09): schmale Symbolleiste links dauerhaft, daneben ausklappbare Liste; Manuskript bleibt direkt editierbar; Vorschlag der KI am Textende wie eine Chat-Antwort.

#### 5.12: Modell-Auswahl aktuell vom Anbieter

- **Status:** ✅ ERLEDIGT (2026-10-10) – eingespielt (`7b89102`), vom Eigentümer bestätigt („alles funktioniert“: Auswahlfeld, „Modelle verwalten …“, Favoriten auf mehreren Geräten). Verlauf: 🟠 IN ARBEIT (seit 2026-10-10) – Form geklärt (Auswahlfragen): eigene Favoriten auf dem Server (Start: grok-4.6, qwen3.8-max), Angaben Preis je 1 Mio. Token, geschätzte Kosten je Vorschlag, Kontextgröße, „denkt lange“; Filter Anbieter, Preis, ohne OpenRouter-Moderation, Mindest-Kontext; ADR-055. Mockup freigegeben, umgesetzt und lokal geprüft (pytest 482, vitest 165, Playwright 11 grün); eingespielt als `7b89102`; echte Anfrage mit grok-4.5 über den Katalog gelungen (2026-10-10). Offen: Abnahme durch den Eigentümer
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.11
- **Freigabepflichtig:** ja – Schnittstelle `GET /api/models` (Kategorie 5) und ggf. gespeicherte Favoriten (Kategorie 4); Form vorab mit dem Eigentümer klären
- **Empfohlene Klasse:** Entscheidung – Schnittstellen- und ggf. Datenmodell-Vorschlag (Eskalations-Auslöser 1); die Umsetzung danach ist Routine.
- **Eingangskriterien:** Form geklärt: ganze Liste mit Suche und Filtern, Favoritenliste oder beides
- **Anforderungen (ab Klasse M):** FR-028, FR-018; Vision 6, 7
- **Zu tun:** Wunsch 2026-10-08: Modell-Auswahl nicht fest im Code (`DEFAULT_MODELS`, drei Modelle), sondern aktuell von OpenRouter mit Kontextgröße und Preis. Katalog in `ai_gateway` mit Zwischenspeicher; Reasoning je Modell aus den Angaben des Anbieters richtig setzen; geprüfte Modell-Reihenfolge bleibt Voreinstellung; Preis vor der Wahl sichtbar. Nach ADR-052 (D.16): grok-4.7 nicht mehr in der voreingestellten Liste, über die Liste des Anbieters wählbar mit Hinweis „denkt lange“ bei Modellen mit langem Vorab-Denken.
- **Akzeptanzkriterien:** nach FR-028; Tests grün (auch: Anbieter nicht erreichbar → bisherige Liste); echte Anfrage mit einem nicht voreingestellten Modell (z. B. grok-4.5) gelingt.
- **Betroffene Module:** ai_gateway, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR, Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-08 (Neuplanung, ADR-042). Ermöglicht die Prüfung von grok-4.5.

#### 5.13: Verlauf der Anweisungen als umschaltbare Ansicht

- **Status:** ✅ ERLEDIGT (2026-10-11) – eingespielt (`1dd8bdb`), vom Eigentümer bestätigt („positiv“). Verlauf: 🟠 IN ARBEIT (seit 2026-10-10) – Datenmodell entschieden (ADR-056, Eigentümer: eigene Datei je Kapitel, nur übernommene Vorschläge, Reiter über dem Text; nach dem ersten Bildschirmstand erweitert: je Eintrag Anweisung und Text der KI wie übernommen, „Weiter“ als Eingabe, Darstellung wie im Chat). Umgesetzt: `manuscript` (`verlauf/NN.md`, `list_instructions`, `add_instruction`), `api` (`GET|POST …/chapters/{n}/instructions`), `ui` (Reiter „Manuskript | Verlauf“, haftet oben im Textbereich; Eingabe rechts, Text der KI links; Vermerk beim Übernehmen). Test: Anfrage an die KI enthält keinen Verlauf (`test_history_of_instructions_never_reaches_the_ai`); Umschalten, „Weiter“, Fehlerfall in `WritingPanel.test.tsx`. `pytest` 487, `vitest` 173, Playwright 11 grün. Offen: Merge, Einspielen, Bestätigung des Eigentümers
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.11
- **Freigabepflichtig:** ja – neue gespeicherte Daten (Anweisungen je Kapitel, Kategorie 4)
- **Empfohlene Klasse:** Entscheidung – Datenmodell-Vorschlag (Eskalations-Auslöser 1); die Umsetzung danach ist Routine.
- **Eingangskriterien:** Datenmodell per ADR entschieden
- **Anforderungen (ab Klasse M):** FR-027
- **Zu tun:** Wunsch 2026-10-08 (Vision-Frage in ADR-042 bestätigt): Das Manuskript bleibt Hauptansicht; der Verlauf der eigenen Anweisungen ist eine Nachschlage-Ansicht zum Umschalten, nie im Manuskript, nie erneut an die KI. Anweisungen heute nirgends gespeichert (nur durchgereicht in `api/flows/writing.py`).
- **Akzeptanzkriterien:** nach FR-027; Test: die Anfrage an die KI enthält keine früheren Anweisungen; Umschalten in der Oberfläche getestet.
- **Betroffene Module:** manuscript, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR, Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-08 (Neuplanung, ADR-042).

#### 5.14: Go-Live-Prüfung vor v1.0.0

- **Status:** ✅ ERLEDIGT (2026-10-11) – v1.0.0 freigegeben (ADR-058): Vision-Checkpoint erfüllt, Verzicht auf den menschlichen Blick mit Restrisiko, unabhängige KI-Prüfung „freigeben“; freiwillige Maßnahmen als V.18, V.19. Verlauf: 🟠 IN ARBEIT (seit 2026-10-11) – Vision-Abgleich: alle Elemente erledigt oder bewusst ausgeklammert, nach D.4 (ADR-057). Stoppuhr FR-022: laut Eigentümer „problemlos zu unterbieten“, keine Messung. Externer Blick: Eigentümer wählte „Du mit Sub-agent“ – Verzicht auf den menschlichen Blick mit Restrisiko, stattdessen erneute unabhängige Prüfung durch eine getrennte KI-Instanz (anderes Modell) läuft. Offen: Befunde, ADR zum Verzicht und zur Freigabe v1.0.0, CHANGELOG
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.1–5.13 (außer 5.5), D.4
- **Freigabepflichtig:** ja – Release-Entscheidung nach `CLAUDE.md` Abschnitt 12 (Vision-Checkpoint vor Go-Live); Verzicht auf den externen Blick nur per ADR mit Restrisiko
- **Empfohlene Klasse:** Entscheidung – `ENTSCHEIDUNG ERFORDERLICH` (Eskalations-Auslöser 1).
- **Eingangskriterien:** umgebauter Stand aus Phase 5 eingespielt
- **Anforderungen (ab Klasse M):** alle Muss-Anforderungen; FR-010 (Nachweis D.4)
- **Zu tun:** Festgelegt in ADR-043: Vor v1.0.0 jedes Vision-Element `[ERLEDIGT]` oder `[VERWORFEN]` mit Descope-ADR, sonst Release vorlegen; externer Blick eines Menschen außerhalb des Projekts auf Authentifizierung und Datenschutz oder Restrisiko-ADR; FR-022 ggf. mit Stoppuhr nachmessen (Abweichung aus 4.8).
- **Akzeptanzkriterien:** Vision-Checkpoint im Logbuch; Befunde des externen Blicks behoben oder als Schritt mit Frist; ADR zur Freigabe von v1.0.0.
- **Betroffene Module:** keine (Prüfung)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR, Logbuch-Eintrag, CHANGELOG v1.0.0
- **Notizen:** Angelegt 2026-10-08 (ADR-043). Phase 5 damit 14 Schritte (ursprünglich 13), Wucherungs-Schwelle nicht berührt.

#### 5.15: KI schreibt nur das Verlangte, nicht bis zum bekannten Ende

- **Status:** ✅ ERLEDIGT 2026-10-08 – Abschnitt „Vorgaben für deinen Text“, Zukunft nach der Schreibstelle weder erzählen noch andeuten, geführte Figur „genau ausschreiben“, „Weiter“ nur nächster Moment, Länge kurz/mittel/lang (60–120 / 150–300 / 400–600 Wörter, Feld `length`); `pytest` 427, 99 % (`context/builder.py` 100 %), `vitest` 103, Playwright 8; gemergt mit PR #58 (`38f0d34`). Probeschreiben: Vorgriffe 6 → 4 – Rest-Vorgriff nach Entscheidung des Eigentümers im Alltag zu prüfen, weiterer Versuch nur bei Störung. Eingespielt mit `18ee07d`; Eigentümer bestätigte in einer echten Welt (2026-10-08, „passt alles“) – damit gilt das Akzeptanzkriterium als erfüllt
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.8 (gleicher Rahmen; gemeinsam am echten Material prüfen)
- **Freigabepflichtig:** offen – nein, solange nur Wortlaut und Auswahl in `context` geändert werden; ja (Kategorie 4, Datenmodell), falls die Geschichte einen „Stand in der Zeitlinie“ als neues Feld bekommt
- **Empfohlene Klasse:** Entscheidung – Eingriff in die Kontext-Zusammenstellung mit Wirkung auf Kanon-Treue (NFR `[BELASTBAR]`), Ursache vermutet, nicht belegt.
- **Eingangskriterien:** Angaben des Eigentümers: Enthielt die importierte Welt eine Gesamtzusammenfassung oder Zeitlinie mit Ereignissen nach der Schreibstelle? Wie lang soll ein Vorschlag höchstens sein?
- **Anforderungen (ab Klasse M):** FR-009, FR-011, FR-012
- **Zu tun:** Befund des Eigentümers 2026-10-08: Er schrieb in einer importierten Welt an einer Stelle, die in der Zeitlinie weit vor dem bekannten Ende liegt. Die KI formulierte nicht nur seine Eingabe aus, sondern führte die Geschichte stark verkürzt bis zum bereits bekannten Ende weiter. Vermutete Ursachen (Code-Lesung 2026-10-08): (1) Der Handlungsstand enthält immer die ganze Gesamtzusammenfassung (`_story_state`), die Zeitlinie wird vollständig mitgegeben – die KI sieht, wohin die Geschichte läuft; (2) der Rahmen nennt keine Länge und keine Grenze („nur bis zum nächsten Moment, in dem der Autor übernimmt“), Ausgabe bis 8.000 Token erlaubt. Abhilfe prüfen: Vorgabe „schreibe nur aus, was die Anweisung verlangt, und nimm keine späteren Ereignisse vorweg“; spätere Ereignisse der Zusammenfassung und Zeitlinie als „liegt noch in der Zukunft, nicht erzählen“ kennzeichnen oder weglassen; Längenvorgabe.
- **Akzeptanzkriterien:** Probeschreiben an einer Stelle mit bekanntem späterem Verlauf: kein Vorschlag erzählt Ereignisse nach der Schreibstelle; Länge im vereinbarten Rahmen; Kanon-Treue nicht schlechter; Eigentümer bestätigt an einer echten Welt.
- **Betroffene Module:** context (ggf. manuscript, api, ui bei neuem Feld)
- **Reifegrad-Wirkung:** keine (bei neuem Feld: ADR und Datenmodell)
- **Artefakte:** Code, Tests, Probeschreiben, Logbuch-Eintrag
- **Entscheidungen des Eigentümers (2026-10-08, Auswahlfragen):** (1) **Eigene Figur:** Beschreibt die Anweisung Handlung oder Rede der vom Autor geführten Figur, formuliert die KI **genau das** aus – nichts darüber hinaus; danach führt sie Welt und übrige Figuren (Änderung an FR-012 → `docs/requirements.md` und Rahmen/Erinnerung in `context` anpassen). (2) **Länge je Anfrage wählbar** (kurz/mittel/lang im Schreib-Bereich) – additives optionales Feld im Schreib-Endpunkt, Oberfläche; Werte der Stufen beim Umsetzen vorschlagen. (3) **„Weiter“ ohne Anweisung:** nur der unmittelbar nächste Moment, Ende sobald die eigene Figur dran ist. (4) **Spätere Ereignisse als Zukunft kennzeichnen:** im Kontext lassen, mit Vorgabe „Schreibstelle ist das Ende der letzten Manuskript-Seiten; was Zusammenfassung oder Zeitlinie danach nennen, liegt in der Zukunft – nicht erzählen, nicht andeuten“; kein neues Datenfeld. Eingangskriterien damit erfüllt.
- **Notizen:** Probeschreiben 2026-10-08 (`spikes/vorgriff-zeitlinie/README.md`, Ketten zu 7 Vorschlägen mit grok-4.6, grok-4.7, qwen3.8-max auf Stand `main`): Vorgriff als Andeutung bestätigt (Asch und der Aschturm aus der Zusammenfassung), bei leerem „Weiter“ treibt qwen die Handlung weit voran (815 Wörter, nimmt den nächsten Schritt des Autors vorweg); kein Durchlauf bis zum Ende. Neuer Befund: Anweisungen zur eigenen Figur des Autors („Ich biete …, ich sage …“) setzt keines der Modelle um – Konflikt mit FR-012, Entscheidung des Eigentümers nötig. Angelegt 2026-10-08 auf Befund des Eigentümers. Wucherungs-Prüfung: Phase 5 jetzt 15 Schritte (ursprünglich 13, Schwelle 26) – keine Wucherung.

#### 5.16: Herangezogene Kanon-Einträge anklickbar

- **Status:** ✅ ERLEDIGT (2026-10-11) – eingespielt (`1dd8bdb`), vom Eigentümer bestätigt („positiv“). Verlauf: 🟠 IN ARBEIT (seit 2026-10-10) – umgesetzt: Die Namen unter „Herangezogen“ sind Links; ein Klick öffnet die Leiste „Kanon & Geschichte“ rechts beim Reiter Kanon mit diesem Eintrag (am Smartphone über der Seite), Gast-Einträge ebenso (nur lesbar). Das Kapitel bleibt offen; Manuskript, Anweisung und Vorschlag bleiben unverändert (Test). Ohne Leiste (z. B. im Einzeltest) bleiben die Namen reiner Text. `vitest` 170, Playwright 11 grün. Offen: Merge, Einspielen, Bestätigung des Eigentümers
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.11 (neuer Seitenaufbau; Platz für die Einblendung)
- **Freigabepflichtig:** nein – nur `ui`, liest Einträge über die vorhandene Schnittstelle
- **Empfohlene Klasse:** Routine – Oberflächen-Änderung ohne Architekturwirkung mit Komponenten- und End-to-End-Test.
- **Eingangskriterien:** 5.11 erledigt
- **Anforderungen (ab Klasse M):** FR-031, FR-013
- **Zu tun:** Befund des Eigentümers 2026-10-08: Die unter „Herangezogen“ (`WritingPanel.tsx`) genannten Kanon-Einträge sollen anklickbar sein, damit er sich gleich im Kanon zurechtfindet. Entschieden (Auswahlfrage): Der Eintrag wird **über der Schreibseite eingeblendet** (Fenster oder Seitenleiste), das Kapitel bleibt offen – kein Wechsel auf die Kanon-Seite. Gast-Einträge aus anderen Welten ebenso.
- **Akzeptanzkriterien:** nach FR-031; Test: Klick zeigt Name und Text des Eintrags, nach dem Schließen sind Manuskript, Anweisung und Vorschlag unverändert.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-08 auf Befund des Eigentümers. Wucherungs-Prüfung: Phase 5 jetzt 16 Schritte (ursprünglich 13, Schwelle 26) – keine Wucherung.

#### 5.17: Leerzeichen nach der Auswahl im `@`-Menü

- **Status:** ✅ ERLEDIGT 2026-10-08 – umgesetzt auf Branch `fix/5.17-leerzeichen-nach-at`: Die Auswahl schreibt `@Name` und ein Leerzeichen dahinter, außer es folgt schon ein Leerzeichen oder ein Satzzeichen (`withSpace` in `InstructionEditor.tsx`). Tests: `vitest` 106 bestanden, 98,59 % Zeilen; Playwright 9 bestanden (Test „@ menu …“ tippt jetzt direkt nach der Auswahl weiter). Gemergt (#66 `ed4bdb6`, #67 `6e563e8`), eingespielt mit `6e563e8` (2026-10-08). Eigentümer bestätigte nach dem Deployment (2026-10-08, „passt alles“).
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 3.5
- **Freigabepflichtig:** nein (Fehlerbehebung in `ui`)
- **Empfohlene Klasse:** Routine – kleine Fehlerbehebung mit Tests.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-013
- **Zu tun:** Befund des Eigentümers 2026-10-08: Wählt er einen Kanon-Begriff im `@`-Menü und schreibt sofort weiter, hängt das nächste Wort direkt am Namen (`@Kaelging`), und der Eintrag gilt nicht mehr als genannt. Nach der Auswahl automatisch ein Leerzeichen setzen.
- **Akzeptanzkriterien:** Test: Auswahl und sofortiges Weiterschreiben ergibt `@Name wort`, der Eintrag wird herangezogen; kein doppeltes Leerzeichen, keins vor Satzzeichen.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-08 auf Befund des Eigentümers. Wucherungs-Prüfung: Phase 5 jetzt 17 Schritte (ursprünglich 13, Schwelle 26) – keine Wucherung.

#### 5.18: Herangezogene Begriffe im Anweisungsfeld hervorheben

- **Status:** ✅ ERLEDIGT 2026-10-08 – umgesetzt auf Branch `feat/5.18-begriffe-hervorheben` (auf 5.17): Jede erkannte `@`-Nennung im Feld „Anweisung an die KI“ ist hinterlegt und fett (`mentionMarks` in `InstructionEditor.tsx`, Stellen aus `mentionRanges` in `references.ts` nach denselben Regeln wie „Herangezogen“); neue Einträge färben nach, Änderung am Namen hebt die Markierung auf. Tests: `vitest` 108 bestanden, 98,61 % Zeilen; Playwright 9 bestanden. Gemergt (#66 `ed4bdb6`, #67 `6e563e8`), eingespielt mit `6e563e8` (2026-10-08). Eigentümer bestätigte nach dem Deployment (2026-10-08, „passt alles“).
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.17
- **Freigabepflichtig:** nein – nur `ui`, keine neue Abhängigkeit (CodeMirror-Dekoration)
- **Empfohlene Klasse:** Routine – kleine Oberflächen-Änderung mit Tests.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-013
- **Zu tun:** Befund des Eigentümers 2026-10-08: Die ausgewählten Kanon-Begriffe sollen im Feld „Anweisung an die KI“ (nur dort, nicht im Manuskript) optisch hervorgehoben werden, damit er im Fließtext sieht, wo sie stehen. Hervorgehoben wird nur, was das Skriptorium als Nennung erkennt – die Markierung zeigt damit zugleich, ob ein Begriff zählt.
- **Akzeptanzkriterien:** Test: erkannte Nennungen markiert, nicht erkannte (z. B. `@Kaelging`, unbekannter Name) nicht; Markierung folgt Text- und Kanon-Änderungen; Eigentümer bestätigt die Lesbarkeit.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-08 auf Befund des Eigentümers. Wucherungs-Prüfung: Phase 5 jetzt 18 Schritte (ursprünglich 13, Schwelle 26) – keine Wucherung.

#### 5.19: Dunkelmodus

- **Status:** ✅ ERLEDIGT (2026-10-09) – vom Eigentümer bestätigt („alles funktioniert“, 2026-10-09, mit dem Darstellungs-Knopf in der Symbolleiste seit 5.11 Teil 2); umgesetzt auf Branch `feat/5.19-dunkelmodus`: alle Farben als Farbwerte an einer Stelle (`styles.css`), dunkle Farbgebung bei dunkel eingestelltem Gerät oder auf Wahl; Schalter „Darstellung“ (Automatisch/Hell/Dunkel) in der Kopfzeile, im Browser gemerkt (`theme.ts`, `ThemeChoice.tsx`), vor dem ersten Zeichnen gesetzt; Editor, Cursor, Auswahl und `@`-Menü in den Seitenfarben. Tests: `vitest` 119 bestanden, 98,68 % Zeilen / 96,52 % Zweige; Playwright 9 bestanden; Bildschirm-Probelauf hell und dunkel. Gemergt (#70, `ebc7bc5`) und eingespielt 2026-10-08. Offen: Prüfung durch den Eigentümer
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.11 Teil 1
- **Freigabepflichtig:** nein – nur `ui`, keine neue Abhängigkeit; die Wahl liegt nur im Browser (`localStorage`), nicht auf dem Server
- **Empfohlene Klasse:** Routine – Oberflächen-Änderung ohne Architekturwirkung.
- **Eingangskriterien:** Form vom Eigentümer gewählt (2026-10-08: folgt dem Gerät, plus Schalter)
- **Anforderungen (ab Klasse M):** FR-022
- **Zu tun:** Wunsch des Eigentümers 2026-10-08: Dunkelmodus. Entschieden (Auswahlfragen): folgt dem Gerät, dazu ein Schalter Automatisch/Hell/Dunkel, den sich der Browser merkt; jetzt, direkt nach 5.11 Teil 1.
- **Akzeptanzkriterien:** Test: Wahl setzt die Darstellung und bleibt nach Neuladen; ohne Wahl folgt die Seite dem Gerät; alle Ansichten und der Editor lesbar in beiden Modi (Bildschirm-Probelauf); Eigentümer bestätigt.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-08 auf Wunsch des Eigentümers.

#### 5.20: Schnell nacheinander angelegte Kapitel

- **Status:** ✅ ERLEDIGT (2026-10-11) – eingespielt (`1dd8bdb`), vom Eigentümer bestätigt („beide Kapitel wurden angelegt“; Kapitel 5 und 6 in „Geschichte des Eigentümers“, Kapitel 1–4 unverändert). Verlauf: 🟠 IN ARBEIT (seit 2026-10-10) – Ursache belegt: `StoryList.tsx` (seit 5.11, vorher `StoryPage.tsx`) nahm die Nummer aus der noch nicht neu geladenen Liste; das zweite Anlegen schickte die Nummer eines vorhandenen Kapitels, der Server benannte dieses um (Titel überschrieben, Text blieb – `save_chapter` behält ihn bei vorhandener Nummer); ein doppeltes Absenden schickte zweimal dieselbe Nummer. Zwei Tests schlugen vorher fehl. Behoben: nächste Nummer aus Liste oder letzter Antwort (je Geschichte), zweites Absenden gesperrt, Knopf während des Anlegens aus. `vitest` 167, Playwright 11 grün. Gemergt (#106) und eingespielt (`bd48bed`, 2026-10-10). Offen: Bestätigung des Eigentümers
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.11 Teil 1
- **Freigabepflichtig:** nein (Fehlerbehebung)
- **Empfohlene Klasse:** Routine – Ursachenbeleg und kleine Behebung mit Test.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-007
- **Zu tun:** Nebenbefund im Bildschirm-Probelauf 2026-10-08: Zwei sehr schnell nacheinander angelegte Kapitel ergaben nur eines. Vermutete Ursache: `addChapter` in `StoryPage.tsx` nimmt `chapters.length + 1` aus der noch nicht neu geladenen Liste, das zweite Anlegen schreibt also wieder Kapitel 1. Ursache belegen, Folgen prüfen (wird Text überschrieben?), beheben (z. B. Knopf während des Anlegens sperren und Nummer aus der Antwort fortschreiben).
- **Akzeptanzkriterien:** Test, der zwei Kapitel direkt nacheinander anlegt und beide findet; kein Kapitel wird überschrieben.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-08 auf Wunsch des Eigentümers. Wucherungs-Prüfung: Phase 5 jetzt 20 Schritte (ursprünglich 13, Schwelle 26) – keine Wucherung.

#### 5.21: Als App installierbar (PWA)

- **Status:** ✅ ERLEDIGT (2026-10-10) – vom Eigentümer am iPhone und am Mac geprüft („passt alles“, 2026-10-10: Installation, ohne Browserleiste, Anmeldung bleibt, ohne Netz „Keine Verbindung“). Verlauf: 🟠 IN ARBEIT (seit 2026-10-09) – umgesetzt auf Branch `feat/5.2-smartphone-und-pwa`: Manifest (`standalone`), Symbole (Feder; 192, 512, maskierbar, iPhone), Meta-Angaben, Abstand zu Kerbe und Home-Leiste, Hinweis oben ohne Verbindung (`ConnectionNote`); Service Worker nach ADR-048 nur mit `/offline.html`. Chrome meldet installierbar, Manifest fehlerfrei. Prüfung durch getrennte Instanz (Sonnet, 2026-10-09): Vorgabe eingehalten, drei niedrige Befunde behoben, zwei optionale dem Eigentümer vorgelegt. Gemergt (#81, `a71cdff`) und eingespielt 2026-10-09; von außen geprüft: installierbar, Service Worker aktiv, Hinweisseite ohne Netz. Offen: Installation und Anmeldung auf dem Smartphone und am Mac des Eigentümers, Start ohne Netz auf dem Gerät
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.11 Teil 2, 5.2
- **Freigabepflichtig:** ja – Service Worker freigegeben mit ADR-048 (Kategorie 6, Eigentümer 2026-10-09: „B“); ursprünglicher Text: ohne Service Worker nein (nur Manifest, Symbole, Kopfzeilen der Seite in `ui`; ggf. `manifest-src` in der Content-Security-Policy, `api`); falls ein Browser für die Installation einen Service Worker verlangt: Vorlage als Kategorie 6 (Zwischenspeicher im Gerät), mit der Vorgabe „nichts aus Welten und Texten zwischenspeichern“
- **Empfohlene Klasse:** Routine – Manifest und Symbole nach Standard; die Prüfung der Installierbarkeit ist Handarbeit am Gerät.
- **Eingangskriterien:** 5.11 Teil 2 eingespielt
- **Anforderungen (ab Klasse M):** FR-032, FR-019
- **Zu tun:** Wunsch des Eigentümers 2026-10-08: das Skriptorium als App auf dem Startbildschirm, die die ganze Bildschirmgröße nutzt. Entschieden (Auswahlfrage): **installierbar, volle Bildschirmgröße, nur online** – ohne Netz nur ein Hinweis, keine Texte im Zwischenspeicher des Geräts. Web-App-Manifest (`display: standalone`, Name, Farben passend zu Hell/Dunkel, Symbole), Meta-Angaben für iOS; Anmeldung und Sitzungs-Cookie in der installierten App prüfen.
- **Akzeptanzkriterien:** nach FR-032; auf dem Smartphone des Eigentümers und am Mac als App installierbar, öffnet ohne Browserleiste; Anmeldung bleibt erhalten; ohne Netz Hinweis statt leerer Seite oder alter Texte; Tests grün.
- **Betroffene Module:** ui, api (nur falls die Content-Security-Policy ergänzt werden muss)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-08 auf Wunsch des Eigentümers. Wucherungs-Prüfung: Phase 5 jetzt 21 Schritte (ursprünglich 13, Schwelle 26) – keine Wucherung.

#### 5.22: Wiederkehrende Atmosphäre und gleiche Schlussgeste bei langen Vorschlägen

- **Status:** ✅ ERLEDIGT (2026-10-09) – umgesetzt 2026-10-09 (Vorgaben in `context`), Probeschreiben erfüllt alle drei Kriterien; eingespielt 2026-10-09 mit `8372308`; Eigentümer bestätigt im Alltag: keine Wiederholungen aus der Atmosphäre bei „lang“ („funktioniert definitiv“, 2026-10-09)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.15
- **Freigabepflichtig:** nein – Wortlaut der Vorgaben in `context`; ein Wechsel des voreingestellten Modells wäre ein ADR wie ADR-044
- **Empfohlene Klasse:** Entscheidung – Eingriff in die Kontext-Zusammenstellung, Wirkung nur im Probeschreiben bewertbar.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-009, FR-012
- **Zu tun:** Befund des Eigentümers 2026-10-09: Mit der Länge „lang“ wiederholt die KI wieder die Atmosphäre des Ortes. Probeschreiben 2026-10-09 (`spikes/vorgriff-zeitlinie/README.md`, Nachtrag): wörtliche Wiederholung bleibt gering (4-Wort-Folgen aus dem Manuskript im Mittel 1,7 % gegenüber 8,3 % vor 5.15), aber grok-4.6 kehrt **umschrieben** zu denselben Motiven zurück (Dunst durch die Ritze, dampfende Schüssel, Tran) und beendet 5 von 7 langen Vorschlägen mit derselben Geste („sah mich an … und wartete“); grok-4.7 lang 1 von 7, grok-4.6 mittel 2 von 7. Ursachen vermutet: die Vorgabe gegen Wiederholung greift nur wörtlich; die Länge 400–600 Wörter ist bei kleinen Anweisungen mehr, als Handlung da ist, und wird mit Atmosphäre gefüllt; „Ende, sobald die geführte Figur handeln müsste“ wird als Warte-Geste ausgeschrieben. Abhilfe prüfen: Vorgabe „Ort und Stimmung sind bekannt – beschreibe sie nur, wenn sich etwas ändert“; Ende mit der letzten Handlung oder dem letzten Satz einer anderen Figur statt mit Warten oder Blick; „lang“ als Obergrenze statt Ziel formulieren; Vergleich der Modelle in der Kette.
- **Akzeptanzkriterien:** Kette aus 7 Vorschlägen mit „lang“ und grok-4.6: höchstens 2 Enden mit Warte- oder Blickgeste; Motive des Ortes nicht in mehr als 2 aufeinanderfolgenden Vorschlägen; wörtliche Wiederholung nicht höher als heute; Eigentümer bestätigt im Alltag.
- **Betroffene Module:** context
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Probeschreiben, Logbuch-Eintrag
- **Notizen:** Umsetzung 2026-10-09: Vorgaben „Länge ist Obergrenze, kürzer statt auffüllen“, „Ort, Licht, Geräusche, Gerüche und Stimmung sind bekannt: nur bei Änderung beschreiben, auch nicht umschrieben“, Ende mit Handlung oder Rede statt Warten, Schweigen, Blick oder Stimmung; Erinnerung zur Figuren-Schreibweise ohne Warte-Schluss. Probeschreiben (`spikes/vorgriff-zeitlinie/README.md`, Nachtrag 5.22): grok-4.6 lang – Warte- oder Blick-Enden 0 von 7 (vorher 5), längste Folge eines Ortsmotivs 2 (vorher 3, Geruch 7), wörtliche Wiederholung 0,9 % (vorher 1,7 %); mittel ebenso 0 von 7. Eine Kette je Länge – Bestätigung im Alltag steht aus. Angelegt 2026-10-09 auf Befund des Eigentümers. Wucherungs-Prüfung: Phase 5 jetzt 23 Schritte (ursprünglich 13, Schwelle mehr als 26) – keine Wucherung, Abstand 3.

#### 5.23: `@`-Verweis auch in gebeugter Form erkennen

- **Status:** ✅ ERLEDIGT (2026-10-09) – `ui/src/references.ts` erkennt `@Name` mit angehängtem Genitiv-s; 4 neue Komponenten-Tests, `references.ts` 100 % Zeilen und Zweige; Lint, Typen, Format grün; CI im Pull Request; eingespielt 2026-10-09 mit `8372308`
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.18
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Erweiterung der Erkennung in `ui/src/references.ts` mit Komponenten-Tests.
- **Eingangskriterien:** erfüllt – Eigentümer 2026-10-09: nur Genitiv-s
- **Anforderungen (ab Klasse M):** FR-013
- **Zu tun:** Frage des Eigentümers 2026-10-09: Werden bei `@` nur Namen oder auch Aliasse erkannt? Prüfung 2026-10-09 (Probe gegen `referencedEntries`): Name und jeder Alias werden erkannt, ohne Rücksicht auf Groß-/Kleinschreibung, auch mehrwortig („@der Schmied“) und vor Satzzeichen; der KI geht dann der ganze Eintrag samt Aliassen zu („Auch: …“). **Nicht erkannt** wird eine gebeugte Form: „@Kaels Hammer“, „@Aschturms Tor“ – der Eintrag geht dann nicht an die KI, ohne Hinweis. Abhilfe (Eigentümer 2026-10-09: nur Genitiv-s): ein angehängtes „s“ nach einem Namen oder Alias zulassen; die Hervorhebung (5.18) zeigt den Treffer.
- **Akzeptanzkriterien:** Komponenten-Tests für Name, Alias und Genitiv-s („@Kaels“, „@Aschturms“); kein Treffer mitten in einem längeren Wort; ein Name, der selbst auf „s“ endet, wird weiter erkannt.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests
- **Notizen:** Angelegt 2026-10-09 auf Frage des Eigentümers. Umgesetzt 2026-10-09: Ein „s“ direkt nach Name oder Alias zählt mit, wenn danach kein Buchstabe oder keine Ziffer folgt; ein Eintrag, dessen Name selbst auf „s“ endet („Kaels“), geht vor; die Hervorhebung schließt das „s“ ein. Andere Endungen („@Kaela“, „@Kaelen“) und großes „S“ werden weiter nicht erkannt.

#### 5.24: Zweite Testgeschichte und wiederholte Läufe für Probeschreiben

- **Status:** ✅ ERLEDIGT (2026-10-09) – zweite Testwelt „Glimmergrund“ angelegt (`spikes/modell-eignungstest/testwelt/glimmergrund`, 23 Einträge, 12 Kanon-Proben, Geschichte „Kein Stein glimmt umsonst“ Kapitel 1–4, Schreibstelle Kapitel 3, sieben Anweisungen); Werkzeug `spikes/regel-002/` (Laden beider Geschichten, Ketten mit Wiederholungen, Auswertung mit Mittelwert und Spannweite). **Ausgangsmessung** am 2026-10-09 in der Cloud-Session (gültiger Schlüssel): grok-4.6, mittel und lang, je 3 Ketten je Geschichte, 12 Ketten ohne Fehler, 3,06 $; Kennzahlen und Handbewertung (getrennte Instanzen) in `spikes/regel-002/README.md` Abschnitt „Ausgangsmessung“. Wichtigste Befunde: Länge schwankt innerhalb der Kette stark, „Weiter“ erzählt bei „lang“ zu viel, Vorgriffe an festen Stellen, wörtliche Wiederholung gering. Die Ausnahme in Regel-002 (nur Salzmark) entfällt damit
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein (Prüfwerkzeug unter `spikes/`, Regel-002 schon entschieden, ADR-047)
- **Empfohlene Klasse:** Routine – ausgabelastige Arbeit (Testwelt und Kapitel schreiben) nach festgelegtem Verfahren.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** – (Prüfverfahren für FR-009, FR-011, FR-012)
- **Zu tun:** Zweite Testwelt mit einer weit fortgeschrittenen Geschichte anlegen, die sich deutlich von der Salzmark unterscheidet: anderer Ort, anderer Ton, längere Kapitel. Dazu Kanon, Zeitlinie bis zum Ende, Gesamtzusammenfassung, eine Schreibstelle in der Mitte und sieben Anweisungen im Stil des Eigentümers, Schritt 5 als leeres „Weiter“. Das Skript `spikes/vorgriff-zeitlinie/probe.py` nimmt Geschichte und Zahl der Wiederholungen an; die Auswertung (wörtliche Wiederholung, Warte- und Blick-Enden, Ortsmotive, Vorgriff, Umsetzung der Anweisungen zur eigenen Figur) wird ein Skript mit Mittelwert und Spannweite.
- **Akzeptanzkriterien:** Zweite Testgeschichte im Repo; ein Aufruf erzeugt 3 Ketten je Geschichte; die Auswertung gibt Mittelwert und Spannweite aus; Ausgangsmessung des aktuellen Stands (grok-4.6, mittel und lang) liegt vor.
- **Betroffene Module:** keine (nur `spikes/`)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Testwelt, Skripte, Ausgangsmessung, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-09 (ADR-047, Regel-002). Wucherungs-Prüfung: Phase 5 jetzt 24 Schritte (ursprünglich 13, Schwelle mehr als 26) – keine Wucherung, Abstand 2.

#### 5.25: Antworten des Servers nicht im Browser-Speicher

- **Status:** ⏸️ VERSCHOBEN → V.13 (Eigentümer, 2026-10-10: „Schritt in eine andere Phase übertragen, dieser soll den Phasenabschluss nicht behindern“)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.21
- **Freigabepflichtig:** ja – Kategorie 6; Einplanung vom Eigentümer gewünscht (2026-10-09: „Browser-Speicher auch einplanen“) als optionale Maßnahme über ASVS Stufe 1 (Befund 4 der Prüfung zu ADR-048); Umsetzung mit ADR und Prüfung durch getrennte Instanz
- **Empfohlene Klasse:** Entscheidung – Kategorie 6 mit ADR und unabhängiger Prüfung.
- **Eingangskriterien:** 5.21 eingespielt
- **Anforderungen (ab Klasse M):** FR-032 („keine Texte im Gerät“)
- **Zu tun:** Der Server setzt bisher kein `Cache-Control` (außer `no-store` am Schreib-Strom); der HTTP-Speicher des Browsers darf Antworten mit Texten daher nach eigenem Ermessen behalten. `Cache-Control: no-store` für alle Antworten unter `/api`, `no-cache` für `index.html` und `sw.js` (aktuelle Oberfläche nach einem Deployment); Oberflächen-Dateien mit Fingerabdruck im Namen dürfen gespeichert bleiben.
- **Akzeptanzkriterien:** pytest prüft die Kopfzeilen für `/api`, `/`, `/sw.js` und eine Oberflächen-Datei; nach dem Deployment Prüfung von außen (`curl -I`); Prüfung durch getrennte Instanz ohne offene Befunde; ADR angelegt.
- **Betroffene Module:** api
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-09 auf Wunsch des Eigentümers. Wucherungs-Prüfung: Phase 5 jetzt 25 Schritte (ursprünglich 13, Schwelle mehr als 26) – keine Wucherung.

#### 5.26: Kanon-Treue mit grok-4.6 prüfen

- **Status:** ✅ ERLEDIGT (2026-10-10) – Bericht `docs/research/kanon-treue-grok.md`, Werkzeug `spikes/kanon-treue/`. (a) Per `@` genannte Einträge, Regeln, Zeitlinie und geführte Figur kommen vollständig an, auch alle Einträge per `@` am längsten Kapitel; nicht genannte Einträge nur bei Restbudget nach den letzten Seiten – in Glimmergrund fehlen ab ca. 2.800 Wörtern Kapitel 1–3 von 23 Einträgen. (b) Verblindet bewertet, je 3 Ketten an beiden Geschichten: grok-4.6 hält 95–100 % der berührten Proben ein, 6 Widersprüche in 12 Ketten (3 eindeutig, ca. 0,6–1,0 je Kapitel – an der Grenze von FR-011); grok-4.7 100 %, 0 Widersprüche in 6 Ketten (Tendenz, nach Regel-002 kein Beleg); `@` ohne messbaren Unterschied. Neuer Befund: grok-4.7 braucht an echten Anfragen im Mittel 113–131 s, bis 370 s bis zum ersten Textstück – über der Wartezeit des Produkts (90 s, ADR-035). Kosten ca. 5,15 $. Entscheidungen des Eigentümers 2026-10-10 (Auswahlfragen): E1 nicht genannte Einträge zurückgestellt auf V.10 (ADR-050); E2 grok-4.7 – Ursache zuerst erkunden in D.16 (ADR-051); NFR Reaktionszeit `[VORLÄUFIG]` bis D.16. Kein neuer Schritt in Phase 5
- **Phasentyp-Kontext:** UMSETZUNG (Prüfschritt; Ergebnis als Bericht, keine Funktion)
- **Abhängigkeiten:** 5.24 (zweite Testgeschichte, Regel-002)
- **Freigabepflichtig:** nein – Prüfwerkzeug unter `spikes/`; ein Wechsel der Voreinstellung als Folge wäre eine eigene Entscheidung (ADR)
- **Empfohlene Klasse:** Entscheidung – Bewertung der Kanon-Treue und mögliche Folgen für die Modellwahl; das Schreiben der Testdetails ist Routine.
- **Eingangskriterien:** 5.24 erledigt
- **Anforderungen (ab Klasse M):** FR-011, FR-013 (Prüfung der Befehlstreue am aktuellen Modell)
- **Zu tun:** Wunsch des Eigentümers 2026-10-09: prüfen, ob die Kanon-Einträge technisch sauber ankommen und ob das Sprachmodell sie befolgt. (a) Technik: an echten Anfragen zeigen, dass per `@` genannte Einträge vollständig in der Anfrage stehen und nicht vom Token-Budget beschnitten werden – auch mit vielen Einträgen und langem Kapitel. (b) Befolgung: in beiden Testgeschichten Kanon-Details anlegen, die vom Üblichen abweichen (z. B. Linkshänderin, ungewöhnliche Ortsregel, Name eines Gegenstands), Anweisungen schreiben, die sie berühren, ohne sie zu wiederholen; je Variante drei Läufe nach Regel-002, grok-4.6 und zum Vergleich grok-4.7; zählen, wie oft ein Detail eingehalten, übergangen oder widersprochen wird.
- **Akzeptanzkriterien:** Bericht unter `docs/research/` mit Technik-Befund und Quote eingehaltener Details je Modell (Mittelwert und Spannweite); bei Quote unter dem Ziel aus FR-011 ein Folgeschritt oder eine Entscheidungsvorlage; Kosten im Bericht.
- **Betroffene Module:** keine (nur `spikes/`; Lesen von `context` für den Technik-Teil)
- **Reifegrad-Wirkung:** möglicherweise – NFR Kanon-Treue wird mit dem Ergebnis neu belegt oder auf `[VORLÄUFIG]` gesetzt (ADR)
- **Artefakte:** Prüfskript, Bericht, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-09 auf Wunsch des Eigentümers. Bisherige Belege der Kanon-Treue: grok-4.7 an Testtexten, qwen3.8-max am ersten echten Kapitel (4.8), je ein Lauf; grok-4.6 nie gezielt an echten Texten gemessen. Wucherungs-Prüfung: Phase 5 jetzt 26 Schritte (ursprünglich 13, Schwelle mehr als 26) – an der Grenze; der nächste neue Schritt löst den Stopp nach `CLAUDE.md` Abschnitt 8, Kriterium 9 aus.

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
- **Notizen:** Zusatz 2026-09-26 (ADR-015): vitest 5 mitprüfen – mindestreif erst ab 2027-03-03; ist das bei D.2 noch nicht erreicht, eigenes Nachprüf-Datum im Register setzen. Kompatibilität typescript-eslint mit TypeScript 7 prüfen (8.70.1 verlangt `typescript <6.1.0`). Zusatz 2026-09-26 (ADR-019): jsdom 30 ab 2027-01-27 mindestreif – mit prüfen.

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

- **Status:** ⏸️ VERSCHOBEN
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

- **Status:** ⏸️ VERSCHOBEN
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

- **Status:** ⏸️ VERSCHOBEN
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

- **Status:** ⏸️ VERSCHOBEN
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

- **Status:** ⏸️ VERSCHOBEN
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

- **Status:** ⏸️ VERSCHOBEN
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

- **Status:** ⏸️ VERSCHOBEN
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

- **Status:** ⏸️ VERSCHOBEN
- **Landeplatz (nur VERSCHOBEN):** 5.5 – nach der Neuordnung von Seitenaufbau und Abläufen (5.11) (Eigentümer 2026-10-08: „Erstmal Aufbau neu, UI später“)
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

- **Status:** ⏸️ VERSCHOBEN
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

- **Status:** ⏸️ VERSCHOBEN
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

- **Status:** ⏸️ VERSCHOBEN
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

- **Status:** ⏸️ VERSCHOBEN
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

- **Status:** ⏸️ VERSCHOBEN
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

- **Status:** ⏸️ VERSCHOBEN
- **Landeplatz (nur VERSCHOBEN):** 5.5 (ADR-053, Eigentümer: „optional B im Hinterkopf behalten“)
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

- **Status:** ⏸️ VERSCHOBEN
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

- **Status:** ⏸️ VERSCHOBEN
- **Landeplatz (nur VERSCHOBEN):** 5.5 (Eigentümer, 2026-10-10: aus 5.4 „in die nächste Ausbaustufe“)
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

- **Status:** ⏸️ VERSCHOBEN
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

- **Status:** ⏸️ VERSCHOBEN
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

- **Status:** ⏸️ VERSCHOBEN
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
