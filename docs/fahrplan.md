# Fahrplan

<!-- Zentrales Arbeitsdokument. Wird vor jeder Änderung gelesen (CLAUDE.md Abschnitt 2)
     und nach jedem Arbeitsschritt sowie zu Sessionende aktualisiert (Abschnitt 12).
     Phasen sind nach Typ klassifiziert (Erkundung / Umsetzung / Stabilisierung),
     weil iterative Entwicklung unterschiedliche Erfolgskriterien pro Phasentyp braucht. -->

<!-- ANCHOR:aktueller-stand -->
## Aktueller Stand

- **Stand vom:** 2026-10-08 (Neuplanung nach ADR-042; 5.7 umgesetzt; 5.8 und 5.15 umgesetzt auf Branch `feat/5.15-nur-das-verlangte`)
- **Laufende Phase:** Phase 5 „Alltagstauglichkeit und Soll-Anforderungen" (Phase 4 abgeschlossen 2026-10-08, ADR-042: gezielt umbauen; v0.1.0 Vorabversion, ADR-043)
- **Phasentyp:** UMSETZUNG
- **Aktiver Schritt:** 5.7 Startmodell grok-4.6 – umgesetzt (ADR-044), gemergt mit PR #55; wartet auf Deployment vom Mac (ADR-039, auf Anweisung) und Abnahme-Szene des Eigentümers. 5.8 und 5.15 in Arbeit: Versuch 1 von 5.8 ist mit PR #56/#57 in `main`; Vorgaben aus 5.15 samt Länge je Anfrage auf Branch `feat/5.15-nur-das-verlangte` (gepusht, kein Pull Request), Probeschreiben mit der Kette: eigene Figur gelöst, Wiederholungen und Längen deutlich besser, Vorgriff verringert, nicht beseitigt (`spikes/vorgriff-zeitlinie/README.md`, zweiter Lauf). Wartet auf Pull Request/Merge auf Anweisung, Deployment vom Mac und Bestätigung des Eigentümers in einer echten Welt. Neuer OpenRouter-Schlüssel der Cloud-Umgebung gültig (2026-10-08, bis 2027-10-08)
- **Nächster Schritt:** Eigentümer: Pull Request für `feat/5.15-nur-das-verlangte` ja/nein; Session auf dem Mac: Deployment → 5.7, 5.8, 5.15 in einer echten Welt abnehmen; danach 5.9, 5.10, 5.11, 5.6, 5.12, 5.13, 5.2, 5.1, 5.3, 5.4, 5.14, 5.5. Querschnitt: D.11 bis 2026-10-31 (Eigentümer); D.13 vor 5.11 oder parallel. Datiert: D.1 frühestens 2026-11-05; D.5 ab 2026-11-12; D.9 2026-12-28. Knappe Ressource: Wochenkontingent Max 5x (Zurücksetzung sonntags 10:00 MESZ)
- **Offene STOPP-Situationen:** keine – STOPP Phasen-Wucherung (Phase 4, 16 Schritte) aufgelöst am 2026-10-08 durch Neuplanung, Vision-Abgleich und Pflichtfrage (ADR-042; Bewertung `docs/research/bewertung-phase-4.md`). Die Befunde (a)–(h) und die Modell-Sperren haben ihren Landeplatz in 5.7–5.13, D.13, V.6–V.9.

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

**Abschlusskriterium:** Schritte 5.1–5.14 `[ERLEDIGT]` oder `[VERWORFEN]` mit ADR.

**Reifegrad-Erwartung am Phasenende:** unverändert `[BELASTBAR]`. Der Umbau betrifft nur `ui` (Seitenaufbau, 5.11) und Randstellen in `ai_gateway`/`api` (Modell-Katalog, 5.12); neue gespeicherte Daten (5.6, 5.13) werden per ADR festgelegt.

**Ursprünglicher Schrittplan:** 13 Schritte, festgehalten am 2026-10-08 durch die Neuplanung nach ADR-042 (vorher 5 Schritte vom 2026-09-26, +5.6) – wird nicht still hochgesetzt (CLAUDE.md Abschnitt 8, Kriterium 9). Wucherungs-Schwelle: mehr als 26 Schritte und mindestens +5. Stand 2026-10-08: 15 Schritte (+5.14, ADR-043; +5.15 Befund des Eigentümers).

**Reihenfolge (ADR-042):** zuerst die kleinen Abhilfen 5.7, 5.8, 5.9, dann 5.10, der Umbau der Oberfläche 5.11, danach 5.6, 5.12, 5.13; anschließend 5.2 (Smartphone, auf dem neuen Aufbau), 5.1, 5.3, 5.4, dann 5.14 (Go-Live-Prüfung) und 5.5.

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
- **Zu tun:** Die verschobenen Schritte V.1 bis V.9 in konkrete Schritte einer neuen Phase überführen oder per ADR verwerfen (V.4 und V.5 ergänzt beim Phasenabschluss 3: ihr Landeplatz ist 5.5; V.6 bis V.9 ergänzt 2026-10-08, Wünsche des Eigentümers).
- **Akzeptanzkriterien:** Jeder Schritt V.1–V.9 hat einen neuen `[OFFEN]`-Schritt mit ID oder einen `[VERWORFEN]`-Status mit ADR.
- **Betroffene Module:** keine (Planung)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Fahrplan, ggf. ADRs
- **Notizen:** –

#### 5.6: Atmosphärische Schreibweise je Geschichte

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 4.8, 5.11 (Platz in der neuen Oberfläche; ADR-042)
- **Freigabepflichtig:** ja – neue Felder je Kapitel (ggf. auch je Geschichte) sind eine Datenmodelländerung (Kategorie 4); Form vor Beginn klären
- **Empfohlene Klasse:** Entscheidung – Klärung der Form und Datenmodell-Vorschlag (Eskalations-Auslöser 1); die Umsetzung danach ist Routine.
- **Eingangskriterien:** Form mit dem Eigentümer geklärt
- **Anforderungen (ab Klasse M):** FR-026
- **Zu tun:** Wunsch des Eigentümers beim Funktionstest 2026-10-08: neben der Erzählperspektive eine atmosphärische Schreibweise vorgeben. Offene Fragen vor Beginn: freier Text oder Auswahl von Bausteinen (Ton, Tempo, Satzbau) oder beides; eine Textprobe als Vorbild; je Geschichte, je Welt als Vorgabe oder je Anfrage; wo im Prompt und mit welchem Gewicht gegenüber Kanon und Figuren-Schreibweise. Antworten des Eigentümers 2026-10-08 (Logbuch 10:20 UTC): **je Kapitel** Tonalität und Atmosphäre festlegen; **Auswahllisten**, mehrere kombinierbar, weil er sich die Angaben schlecht merken kann; **freier Text bleibt zusätzlich**. Bedarf vom Eigentümer bekräftigt („auf jeden Fall“). Genres, in denen er schreibt (Grundlage für die Listen): Dark Romance, Thriller, düstere Geschichten, Dark Erotic, CNC. Entschieden 2026-10-08 (Auswahl-Fragen, Logbuch 12:10 UTC): Genre als eigene Auswahl je Geschichte, mehrfach wählbar; Tonalität und Atmosphäre als Vorgabe je Geschichte, die jedes neue Kapitel übernimmt und im Kapitel änderbar ist. Noch offen: konkrete Werte der Listen; Textprobe als Vorbild; Platz und Gewicht im Prompt; Priorität (Soll oder Muss).
- **Akzeptanzkriterien:** nach FR-026; Schreibweise in der Oberfläche einstellbar und änderbar; Tests grün; Kanon-Treue im Probeschreiben nicht schlechter als vorher.
- **Betroffene Module:** manuscript, context, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ggf. ADR, Logbuch-Eintrag mit Probeschreiben
- **Notizen:** Angelegt 2026-10-08. Phase 5 jetzt 6 Schritte (ursprünglich 5) – Wucherungs-Schwelle nicht berührt.

#### 5.7: Startmodell grok-4.6

- **Status:** IN ARBEIT – Code, Tests und ADR-044 fertig (2026-10-08, Branch `feat/5.7-startmodell-grok-4.6`); offen: Merge, Deployment (nur vom Mac, auf Anweisung, ADR-039) und Szene des Eigentümers in einer echten Welt ohne Sperre
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

- **Status:** IN ARBEIT (seit 2026-10-08) – Versuch 2 gemeinsam mit 5.15 umgesetzt (Branch `feat/5.15-nur-das-verlangte`, 2026-10-08): Vorgabe „Wiederhole keine Sätze, Bilder, Gesten und Wendungen aus den letzten Manuskript-Seiten“ und Schlusssatz-Verbot im neuen Abschnitt „Vorgaben“ nach der Anweisung; Kette mit 7 übernommenen Vorschlägen je Modell, verblindet bewertet: gleiche 6-Wort-Folgen über die Kette 18–49 → 0, Wiederholungen stark → mittel, Einleitungen 18 → 9, Schlusssätze 9 → 10 (vor allem Warte- und Gestenschlüsse bei der Übergabe an die geführte Figur), Kanon eindeutig 1 → 0, fraglich 4 → 4. Offen für `[ERLEDIGT]`: Merge, Deployment, Bestätigung des Eigentümers. Bisher: Versuch 1 umgesetzt auf Branch `scp/nice-lamport-as724t` (mit PR #56/#57 in `main`, Berichtigung 2026-10-08): Satz im Rahmen und Abschnitt „Anschluss“ mit den letzten 30 Wörtern vor der Anweisung; Tests grün. Probeschreiben (`spikes/nahtloser-anschluss/README.md`, 24 Texte, verblindet bewertet): Wirkung **nicht belegt** – die Testwelt zeigt Einleitung und Schlusssatz schon vorher nur in 4 von 12 Läufen (fast nur an einer Dialogpause), nachher 3 bzw. 5; Kanon eindeutig 3 → 5 (Rauschen, überwiegend qwen). Wartet auf den Eigentümer: echtes Beispiel (Kapitelende und Fortsetzung mit Einleitung/Schlusssatz) oder Entscheidung, Versuch 1 trotzdem zu übernehmen und im Alltag zu prüfen. Parallel zu 5.7 (wartet auf Deployment und Abnahme)
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

- **Status:** OFFEN
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

- **Status:** OFFEN
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

- **Status:** OFFEN
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

#### 5.12: Modell-Auswahl aktuell vom Anbieter

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.11
- **Freigabepflichtig:** ja – Schnittstelle `GET /api/models` (Kategorie 5) und ggf. gespeicherte Favoriten (Kategorie 4); Form vorab mit dem Eigentümer klären
- **Empfohlene Klasse:** Entscheidung – Schnittstellen- und ggf. Datenmodell-Vorschlag (Eskalations-Auslöser 1); die Umsetzung danach ist Routine.
- **Eingangskriterien:** Form geklärt: ganze Liste mit Suche und Filtern, Favoritenliste oder beides
- **Anforderungen (ab Klasse M):** FR-028, FR-018; Vision 6, 7
- **Zu tun:** Wunsch 2026-10-08: Modell-Auswahl nicht fest im Code (`DEFAULT_MODELS`, drei Modelle), sondern aktuell von OpenRouter mit Kontextgröße und Preis. Katalog in `ai_gateway` mit Zwischenspeicher; Reasoning je Modell aus den Angaben des Anbieters richtig setzen; geprüfte Modell-Reihenfolge bleibt Voreinstellung; Preis vor der Wahl sichtbar.
- **Akzeptanzkriterien:** nach FR-028; Tests grün (auch: Anbieter nicht erreichbar → bisherige Liste); echte Anfrage mit einem nicht voreingestellten Modell (z. B. grok-4.5) gelingt.
- **Betroffene Module:** ai_gateway, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR, Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-08 (Neuplanung, ADR-042). Ermöglicht die Prüfung von grok-4.5.

#### 5.13: Verlauf der Anweisungen als umschaltbare Ansicht

- **Status:** OFFEN
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

- **Status:** OFFEN
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

- **Status:** IN ARBEIT (seit 2026-10-08) – umgesetzt auf Branch `feat/5.15-nur-das-verlangte`: Abschnitt „Vorgaben für deinen Text“ nach der Anweisung (nur das Verlangte, Länge, Zukunft nach der Schreibstelle weder erzählen noch andeuten, keine Wiederholung, kein Schlusssatz), Satz zur Zukunft im Rahmen, Regel „genau ausschreiben“ für die geführte Figur in Schreibweise und Erinnerung, „Weiter“ nur der nächste Moment, Länge kurz/mittel/lang (etwa 60–120, 150–300, 400–600 Wörter, Voreinstellung mittel) als additives Feld `length` und Auswahl im Schreib-Bereich. Tests: `pytest` 427 bestanden, 99 % (`context/builder.py` 100 %), `vitest` 103 bestanden, Playwright 8 bestanden. Probeschreiben (zweiter Lauf, verblindet): Anweisung 2 zur eigenen Figur bei allen drei Modellen umgesetzt (vorher bei keinem), qwen ohne Zeitsprung bei „Weiter“ und 164–246 statt bis 815 Wörter; Vorgriffe 6 → 4, aber nicht null (qwen verknüpft in Schritt 7 Buch und Grotte) – Akzeptanzkriterium „kein Vorschlag erzählt Ereignisse nach der Schreibstelle“ damit **nicht ganz erfüllt**. Offen: Merge, Deployment, Bestätigung des Eigentümers in einer echten Welt; ob der Rest-Vorgriff hingenommen wird oder ein weiterer Versuch folgt (z. B. Zusammenfassung an der Schreibstelle kürzen – dann Kategorie 4 prüfen)
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
- **Notizen:** Zusatz 2026-09-26 (ADR-015): vitest 5 mitprüfen – mindestreif erst ab 2027-03-03; ist das bei D.2 noch nicht erreicht, eigenes Nachprüf-Datum im Register setzen. Kompatibilität typescript-eslint mit TypeScript 7 prüfen (8.70.1 verlangt `typescript <6.1.0`). Zusatz 2026-09-26 (ADR-019): jsdom 30 ab 2027-01-27 mindestreif – mit prüfen.

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
- **Zu tun:** Erfolgskriterien „kein Kontextverlust" und „günstiger pro Anfrage" (Vision 4) an dieser Geschichte prüfen; Kosten je Anfrage mit der Referenz (125.000–140.000 Token) vergleichen. Zusatz 2026-09-27 (aus 3.6): Länge der erzeugten Kurzfassungen (Vorgabe 150 bis höchstens 250 Wörter) und der Gesamtzusammenfassung (höchstens ca. 600) an Kapiteln echter Länge messen; in 3.6 bei kurzen Testkapiteln 290/336 bzw. 623 Wörter. Passt der Handlungsstand aller Kapitel ins Budget?
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

#### D.6: Reaktionszeit bis zum ersten Textstück erkunden

- **Status:** ERLEDIGT (2026-09-28) – 28 Läufe im Container auf dem VPS (0,71 $, `spikes/reaktionszeit/README.md`): Wartezeit wächst mit der Länge des Vorab-Denkens (ca. 16 ms je Denk-Token), die bei gleichem Kontext stark streut; `effort: low` ist schon die niedrigste Stufe, Abschalten lehnt der Anbieter ab, eine Denk-Obergrenze verlängert das Denken (54–149 s), ausführender Anbieter immer xAI. grok-4.7 4–29 s (Median 16), grok-4.6 5–11 s (Median 6); 90-s-Grenze reicht. Eigentümer wählt A: Zielwerte angepasst, Einstellungen bleiben (ADR-035); NFR Reaktionszeit → `[BELASTBAR]`. Tageszeit nicht geprüft
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

- **Status:** ERLEDIGT (2026-09-28) – Proxy läuft in 2.11.42; Sicherheitsunterstützung der Linie 2.11 endete am 2026-09-07, unterstützt ist nur noch 3.7 (Hersteller: doc.traefik.io/traefik/deprecation/releases/, abgerufen 2026-09-28). Register-Eintrag angelegt; Update als Schritt 4.12 zur Entscheidung vorgelegt
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

- **Status:** VERWORFEN (2026-10-07, ADR-040) – Eigentümer: Passwort ist stark; Rotation entfällt, Restrisiko im ADR
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

- **Status:** OFFEN
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

- **Status:** ERLEDIGT (2026-09-28) – Kopie des Repos mit 5 eingebauten Abweichungen, Soll-Werte per Skript; je vier frische Unteragenten mit wörtlich gleichen Aufträgen. Routine (Sonnet 5): 5/5 gefunden, keine falschen Befunde, Logbuch-Entwurf korrekt → bestanden. Mechanik (Haiku 4.5): 2 von 3 Aufgaben richtig, beim Zählen Zeilen statt Vorkommen → nicht bestanden. Referenz Opus 5.5 fehlerfrei; fand zusätzlich zwei echte Kleinigkeiten im Repo (Überschrift der Reifegrad-Übersicht, Typname `[GELÖST]` in der Typen-Tabelle des Logbuchs) – behoben
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

- **Status:** OFFEN
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

- **Status:** ERLEDIGT (2026-10-07) – `source-map-js` 1.2.1 → 1.2.2 (nur `package-lock.json`, per `npm audit fix`); `npm audit` ohne Befund, vitest 96/96 (98,65 % Zeilen, 96,43 % Zweige), Build grün
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

- **Status:** OFFEN
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

#### V.6: Import aus SillyTavern (Character Cards und Lorebooks)

- **Status:** VERSCHOBEN
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

- **Status:** VERSCHOBEN
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

- **Status:** VERSCHOBEN
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

- **Status:** VERSCHOBEN
- **Landeplatz (nur VERSCHOBEN):** 5.5 (ADR-042: nach dem Umbau, nicht in Phase 5)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.11, 5.12
- **Freigabepflichtig:** ja – neuer Ablauf und ggf. neue Verantwortung (Kategorien 1/2); Wissen aus dem Internet ist eine neue externe Abhängigkeit mit Kosten (Kategorie 3)
- **Empfohlene Klasse:** Entscheidung – Architektur- und Abhängigkeitsentscheidung (Eskalations-Auslöser 1).
- **Eingangskriterien:** 5.5
- **Anforderungen (ab Klasse M):** FR-029
- **Zu tun:** Wunsch 2026-10-08: Figuren, Welten, Regeln, Gegenstände mit Verwendung und Auswirkung im Gespräch mit der KI entwerfen; bei alltagsbekannten Gegenständen tatsächliche Anwendung und Handhabung aus dem Internet einbeziehen. Übernahme in den Kanon erst nach Bestätigung (wie Import-Vorschau). Import bleibt bestehen.
- **Akzeptanzkriterien:** nach FR-029
- **Betroffene Module:** canon, api, ui, ai_gateway (offen)
- **Reifegrad-Wirkung:** offen
- **Artefakte:** ADR, Code, Tests
- **Notizen:** Mindert Vision-Risiko 9 „Manuelle Kanon-Pflege“.

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
