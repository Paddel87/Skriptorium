# Archiv – Fahrplan Phase 1

<!-- Quelle: docs/fahrplan.md, Abschnitt „Aktuelle Phasen". Ausgelagert am 2026-09-26 (CLAUDE.md Abschnitt 14:
     Phase vollständig erledigt). Abgedeckter Zeitraum: 2026-09-26 (Beginn und Abschluss der Phase). -->

## Phase 1: Erkundung – Modelle, Import, Laufzeit – Typ: ERKUNDUNG

**Ziel:** Die drei offenen Tatsachenfragen vor der Umsetzung sind beantwortet und dokumentiert: (1) welches Modell und welches Token-Budget Kanon-Treue, Filterverhalten und Kosten am besten vereinen, (2) in welchem Format das Welt-Material des Eigentümers importiert wird, (3) ob httpx 0.28.1 auf Python 3.14.7 trägt. Die für Phase 2 und 3 berührten Architektur-Bestandteile sind danach `[BELASTBAR]` oder begründet zurückgestuft.

**Abschlusskriterium:** Schritte 1.1–1.5 `[ERLEDIGT]` (1.5 ergänzt 2026-09-26 auf Wunsch des Eigentümers); Ergebnisse als ADRs `[ERKENNTNIS]` in `docs/decisions.md` und in `docs/architecture.md` nachgezogen; Reifegrad-Übersicht (`docs/architecture.md` Abschnitt 9) aktualisiert.

**Reifegrad-Erwartung am Phasenende:** Module `storage`, `canon`, `manuscript`, `api`, `ui`, `context`, `ai_gateway`, ihre Schnittstellen und das Datenmodell `[BELASTBAR]`; NFR Token-Budget `[BELASTBAR]`; NFR Kanon-Treue und Kontexttreue Referenzumfang bleiben `[OFFEN]` (Messung erst im Schreibbetrieb bzw. Schritt D.4).

**Ursprünglicher Schrittplan:** 4 Schritte, festgehalten am 2026-09-26 – wird nicht still hochgesetzt; Wucherungs-Schwelle nach CLAUDE.md Abschnitt 8, Kriterium 9 (Faktor 2 und mindestens 5 zusätzliche Schritte, `docs/project-context.md` Abschnitt 6)

**Pflichtfrage am Phasenende:** ADR „Weiterbauen, umbauen oder neu aufsetzen" – Nummer wird beim Phasenabschluss vergeben (CLAUDE.md Abschnitt 12)

**Hinweis Stabilisierung:** Code aus Phase 1 ist Wegwerf-Code und wird nicht in die Module übernommen; Phase 2 baut neu. Deshalb folgt auf Phase 1 keine eigene Stabilisierungsphase.

### 1.1: Modell-Eignungstest (Kanon-Treue, Filterverhalten, Kosten)

- **Status:** ERLEDIGT (2026-09-26) – Ergebnis ADR-010, `docs/research/modell-eignungstest.md`
- **Phasentyp-Kontext:** ERKUNDUNG
- **Schritt-Art (nur ERKUNDUNG):** Vergleichsstudie
- **Zeitbox (nur ERKUNDUNG):** maximal 6 h Arbeit, dann Zwischenstand an den Eigentümer
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein – das Ergebnis (Startmodell, Token-Budget) wird als ADR `[ERKENNTNIS]` festgehalten; berührt es eine Kategorie aus CLAUDE.md Abschnitt 4, wird es als `ENTSCHEIDUNG ERFORDERLICH` vorgelegt
- **Empfohlene Klasse:** Entscheidung – das Ergebnis legt Startmodell und Token-Budget fest und bereitet die Beförderung von `context` auf `[BELASTBAR]` vor (Eskalations-Auslöser 4 in CLAUDE.md Abschnitt 0).
- **Eingangskriterien:** OpenRouter-API-Schlüssel mit Ausgabengrenze, vom Eigentümer bereitgestellt – nie im Repo, in Logs oder in der Ausgabe der KI (CLAUDE.md Abschnitt 6); Bereitstellungsweg in der Arbeitsumgebung: Umgebungsvariable `KEY` der Cloud-Umgebung (Eigentümer, 2026-09-26); Ausgabengrenze 5 $ ohne Zurücksetzung, geprüft über OpenRouter `/api/v1/key` am 2026-09-26. ~~Eine Testszene (Ort, Figuren, Ziel) mit dem zugehörigen Kanon-Auszug aus einer bestehenden Welt, vom Eigentümer ausgewählt.~~ Geändert am 2026-09-26 (Eigentümer): Das Material des Eigentümers kann in der Arbeitsumgebung nicht verwendet werden; die KI erfindet Testwelt, Kanon-Auszug, bisherigen Handlungsstand und Testszene selbst. Folgen für die Aussagekraft: Kanon-Widersprüche werden gegen den erfundenen Kanon gezählt (Erstbewertung durch die KI nach einer vorab festgelegten Prüfliste, Stichprobe durch den Eigentümer); das Filterverhalten ist nur so aussagekräftig, wie die Testszene der Art von Inhalten ähnelt, die bei früheren Anbietern abgelehnt wurden. Testwelt und Szene dürfen ins Repo (erfunden, kein Material des Eigentümers).
- **Anforderungen (ab Klasse M):** keine (Vorbereitung für FR-010, FR-011, FR-018; Grundlage für das Kosten-Ziel aus Vision 4)
- **Zu tun:** Dieselbe Szene mit 3–4 Modellen über OpenRouter schreiben lassen (Auswahl aus den Modellen ohne OpenRouter-eigene Moderation, `docs/research/bestandspruefung.md` Abschnitt „Modell-Verfügbarkeit"), jeweils mit 2–3 Token-Budgets um den Startwert 30.000 Token Eingabe. Die Anfrage wird nach dem Kontext-Verfahren aus ADR-003 von Hand zusammengestellt. Je Lauf festhalten: Kanon-Widersprüche (Bewertung durch den Eigentümer, Maßstab Vision 4), Ablehnungen und Filterverhalten, Eingabe-/Ausgabe-Token, Kosten je Anfrage, Zeit bis zum ersten Textstück. Tokenzählung klären (Schätzung oder Tokenizer je Modell). Nutzungsbedingungen der ausführenden Anbieter der gewählten Modelle auf Einschränkungen für Fiktion sichten.
- **Akzeptanzkriterien:** Wir können Startmodell und Token-Budget begründet festlegen: Vergleichstabelle (Modell × Budget × Kanon-Widersprüche × Ablehnungen × Kosten je Anfrage) liegt vor; hochgerechnete Monatskosten bei ca. 400 Anfragen liegen zusammen mit dem Hosting im Kostenrahmen von 50 € (BDR-001) oder die Abweichung ist benannt; mindestens ein Ausweichmodell ist benannt (FR-018); das Verhalten bei Ablehnung ist beschrieben (Grundlage für `ModelRefused`).
- **Betroffene Module:** context, ai_gateway (nur als Wegwerf-Code zur Erkundung)
- **Reifegrad-Wirkung:** NFR Token-Budget `[VORLÄUFIG]` → Wert festgelegt (Beförderung in 1.4); NFR Kanon-Treue bleibt `[OFFEN]`, erhält eine Vorprüfung
- **Artefakte:** ADR `[ERKENNTNIS]` zu Startmodell und Token-Budget; Erkenntnisdokument `docs/research/modell-eignungstest.md`; Nachtrag in `docs/architecture.md` Abschnitt 6 und im Kostenregister `docs/project-context.md` Abschnitt 8
- **Notizen:** Szenen- und Kanon-Text des Eigentümers gehören nicht ins Repo, wenn er das nicht ausdrücklich will; im Erkenntnisdokument genügen Kennzahlen und kurze Belegstellen. Wegwerf-Code liegt unter `spikes/modell-eignungstest/` und wird nicht in die Module übernommen (Phasen-Hinweis oben).

### 1.2: Import-Klärung an echten Exporten (TypingMind, Notion)

- **Status:** ERLEDIGT (2026-09-26) – Importformat festgelegt und freigegeben: zunächst Markdown (ADR-012). Die Klärung der TypingMind- und Notion-Exporte entfällt für die erste Ausbaustufe (echtes Material nicht verwendbar) und liegt in V.4 und V.5; der Zeitbedarf für den Import wird im 30-Minuten-Test 4.8 gemessen statt hier abgeschätzt.
- **Phasentyp-Kontext:** ERKUNDUNG
- **Schritt-Art (nur ERKUNDUNG):** Spike
- **Zeitbox (nur ERKUNDUNG):** maximal 3 h Arbeit, dann Zwischenstand
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – das festgelegte Importformat ist Teil des Datenmodells (CLAUDE.md Abschnitt 4, Kategorie 4)
- **Empfohlene Klasse:** Entscheidung – die Festlegung des Importformats ist eine Datenmodell-Entscheidung mit `ENTSCHEIDUNG ERFORDERLICH` (Eskalations-Auslöser 1).
- **Eingangskriterien:** Echte Exporte des Eigentümers liegen vor: mindestens ein Agenten-JSON aus TypingMind und ein Markdown-Export aus Notion (Seiten mit Unterseiten).
- **Anforderungen (ab Klasse M):** keine (Vorbereitung für FR-005, umgesetzt in 2.4)
- **Zu tun:** Klären, ob das TypingMind-Agenten-JSON die Systemanweisung und Wissensdateien bzw. Knowledge-Base-Inhalte enthält und wie sein Schema aussieht; klären, wie Notion Unterseiten im Markdown-Export im Plan des Eigentümers ausgibt (`docs/research/bestandspruefung.md`, Offene Punkte 3 und 4). Abbildung auf Kanon-Kategorien und Dateiablage (`docs/architecture.md` Abschnitt 7) skizzieren; entscheiden, was automatisch zugeordnet wird und was der Autor nach dem Import zuordnet.
- **Akzeptanzkriterien:** Wir verstehen den Aufbau beider Exporte (belegt an den echten Dateien); das Importformat und die Zuordnung zu Kanon-Kategorien sind festgelegt und freigegeben; der Zeitbedarf für den Import einer bestehenden Welt ist abgeschätzt und mit dem 30-Minuten-Rahmen (FR-022) abgeglichen.
- **Betroffene Module:** canon
- **Reifegrad-Wirkung:** Offene Frage im Modul `canon` (`docs/architecture.md` Abschnitt 3) geschlossen; Untermodul `canon.importers` `[VORLÄUFIG]` mit festgelegtem Eingangsformat
- **Artefakte:** ADR `[ERKENNTNIS]` zum Importformat; Nachtrag in `docs/architecture.md` Abschnitte 3 und 7; ggf. anonymisierte Beispieldateien als Testdaten (nur mit Zustimmung des Eigentümers)
- **Notizen:** Welt-Material ist Eigentum des Eigentümers; echte Exporte bleiben außerhalb des Repos, sofern er nichts anderes festlegt.

### 1.3: httpx 0.28.1 auf Python 3.14.7 prüfen

- **Status:** ERLEDIGT (2026-09-26) – validiert, 9/9 Prüfungen (`spikes/httpx-python-314/README.md`)
- **Phasentyp-Kontext:** ERKUNDUNG
- **Schritt-Art (nur ERKUNDUNG):** Spike
- **Zeitbox (nur ERKUNDUNG):** maximal 1 h Arbeit
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein; fällt der Test negativ aus, ist eine Ersatz-Bibliothek eine neue externe Abhängigkeit und freigabepflichtig (Kategorie 3)
- **Empfohlene Klasse:** Routine – klar spezifizierter Test ohne Architektur- oder Freigabewirkung; bei negativem Ergebnis eskaliert die Folgeentscheidung auf die Entscheidungs-Klasse.
- **Eingangskriterien:** Python 3.14.7 und uv 0.12.19 in der Arbeitsumgebung verfügbar
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Die Stichprobe aus der Versions-Verifikation (Streaming auf 3.14-Vorabversion) auf der fixierten Version 3.14.7 wiederholen: Streaming-Anfrage (Server-Sent Events) gegen OpenRouter oder einen lokalen Test-Server, Timeout-Verhalten, Abbruch eines laufenden Stroms, Warnungen als Fehler (`-W error`).
- **Akzeptanzkriterien:** Annahme „httpx 0.28.1 trägt auf Python 3.14.7" ist validiert oder widerlegt, mit Protokoll der ausgeführten Prüfungen; bei Widerlegung liegt ein `ENTSCHEIDUNG ERFORDERLICH` zu einer Alternative vor.
- **Betroffene Module:** ai_gateway
- **Reifegrad-Wirkung:** keine direkte; Ergebnis fließt in die Beförderung von `ai_gateway` in 1.4
- **Artefakte:** Eintrag im Ablaufdaten-Register (`docs/project-context.md` Abschnitt 8) aktualisiert; Logbuch-Eintrag mit Ergebnis
- **Notizen:** Nachprüfung am 2027-03-26 ist eigener Schritt D.3.

### 1.4: Reifegrad-Beförderung vor der Umsetzung

- **Status:** ERLEDIGT (2026-09-26) – Beförderung per ADR-013, Pflichtfrage Phasenende per ADR-014 (weiterbauen)
- **Phasentyp-Kontext:** ERKUNDUNG
- **Schritt-Art (nur ERKUNDUNG):** sonstiges – Architektur-Abgleich und Beförderung
- **Zeitbox (nur ERKUNDUNG):** maximal 2 h Arbeit
- **Abhängigkeiten:** 1.1, 1.2, 1.3, 1.5
- **Freigabepflichtig:** ja – Beförderung auf `[BELASTBAR]` per ADR; Änderungen am Zuschnitt wären Architekturänderungen (Kategorie 1)
- **Empfohlene Klasse:** Entscheidung – Beförderung von `[VORLÄUFIG]` auf `[BELASTBAR]` (Eskalations-Auslöser 4).
- **Eingangskriterien:** Ergebnisse von 1.1–1.3 dokumentiert
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Module, Schnittstellenverträge (Abschnitt 4), Datenmodell (Abschnitt 7) und Kontext-Verfahren von `docs/architecture.md` mit den Erkenntnissen aus 1.1–1.3 abgleichen, nachziehen und zur Beförderung vorlegen. Umkehrbarkeit der Speicher- und Kontext-Entscheidung aus ADR-003 nachtragen. Bestandteile, die nicht tragen, begründet auf `[OFFEN]` setzen und einen ERKUNDUNG-Schritt anlegen.
- **Akzeptanzkriterien:** Für jeden Bestandteil, den die Phasen 2 und 3 berühren, ist entschieden: `[BELASTBAR]` per ADR oder `[OFFEN]` mit neuem Erkundungsschritt; die Reifegrad-Übersicht ist aktualisiert.
- **Betroffene Module:** canon, manuscript, context, ai_gateway, storage, api, ui
- **Reifegrad-Wirkung:** siehe Reifegrad-Erwartung der Phase
- **Artefakte:** ADR zur Beförderung; `docs/architecture.md` Abschnitte 3, 4, 7 und 9
- **Notizen:** Ohne diesen Schritt dürfte Phase 2 nicht beginnen (CLAUDE.md Abschnitt 6, „Architektur-Reifegrad respektieren"). Zusatz 2026-09-26 aus 1.1 (ADR-010): (a) Reaktionszeit-Ziel neu fassen – das Startmodell braucht 15–50 s; (b) dem Eigentümer eine eigene Lesung einiger Testtexte anbieten (Stichprobe der KI-Bewertung aus 1.1, `spikes/modell-eignungstest/ergebnisse/`). Stand 2026-09-26: Der Eigentümer verzichtet auf die eigene Lesung (b) – seine Erfahrung mit grok 4.7, grok 4.6 und Qwen deckt sich mit dem Testergebnis.

### 1.5: Genre-Test – düstere, Horror-, Thriller- und Action-Szenen

- **Status:** ERLEDIGT (2026-09-26) – Ergebnis `docs/research/modell-eignungstest.md` Abschnitt „Genre-Test"; ADR-010 bestätigt
- **Phasentyp-Kontext:** ERKUNDUNG
- **Schritt-Art (nur ERKUNDUNG):** Vergleichsstudie
- **Zeitbox (nur ERKUNDUNG):** maximal 3 h Arbeit
- **Abhängigkeiten:** 1.1 (Testwelt, Harness, Modellauswahl)
- **Freigabepflichtig:** nein – Ergebnis ergänzt ADR-010 als Erkenntnis; ändert es die Modellwahl, wird es dem Eigentümer vorgelegt
- **Empfohlene Klasse:** Entscheidung – Bewertung und mögliche Änderung der Modellwahl aus ADR-010.
- **Eingangskriterien:** Auftrag des Eigentümers vom 2026-09-26 („Performance bei düsteren Szenen … Horror, Thriller, Action … ggf. von dir ergänzt und weitere Faktoren")
- **Anforderungen (ab Klasse M):** keine (Vorbereitung FR-018)
- **Zu tun:** Vier Genre-Szenen in der Testwelt (Horror, Thriller/Verfolgung, Action/Kampf, düster/Grausamkeit), je mit Autoren-Einstieg und Anweisung; Kriterien vor der Bewertung fixieren (Sprache, Spannung, Atmosphäre, Genre-Handwerk, Abschwächung/Moralisierung, Figurenkonsistenz, Kanon-Stichprobe); grok-4.7, grok-4.6, qwen3.8-max, gemini-3.8-flash je 2 Läufe pro Szene; blind je Genre bewerten.
- **Akzeptanzkriterien:** Wir wissen, ob die Modellwahl aus ADR-010 auch für diese Genres trägt: Rangfolge je Genre, Abschwächungs- und Ablehnungsrate je Modell, Befund im Erkenntnisdokument; bei abweichendem Ergebnis Vorlage an den Eigentümer.
- **Betroffene Module:** context, ai_gateway (nur als Wegwerf-Code zur Erkundung)
- **Reifegrad-Wirkung:** keine direkte; Ergebnis fließt in 1.4
- **Artefakte:** Abschnitt „Genre-Test" in `docs/research/modell-eignungstest.md`; Nachtrag zu ADR-010 falls nötig
- **Notizen:** Zusatzschritt auf Wunsch des Eigentümers; Phase 1 damit 5 Schritte (ursprünglich 4, Wucherungs-Schwelle nicht berührt). Keine sexuellen Inhalte in den Testszenen.
