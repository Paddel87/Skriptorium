# Archiv – Fahrplan Phase 3

<!-- Quelle: docs/fahrplan.md, Abschnitt „Aktuelle Phasen". Ausgelagert am 2026-09-27 (CLAUDE.md Abschnitt 14:
     Phase vollständig erledigt). Abgedeckter Zeitraum: 2026-09-26 bis 2026-09-27. -->

## Phase 3: Schreiben mit KI – Typ: UMSETZUNG – ABGESCHLOSSEN (2026-09-27)

**Ziel:** Der Autor schreibt im Wechsel mit der KI in seinen Welten: Weiterschreiben mit Streaming, Szenen-Einstieg, Figuren-Schreibweise, `@`-Verweise, Kapitel-Kurzfassungen, Gast-Figuren, Fakt → Kanon und Modellwechsel.

**Abschlusskriterium:** Schritte 3.1–3.9 `[ERLEDIGT]`; die übrigen Muss-Anforderungen außer FR-022 umgesetzt.

**Reifegrad-Erwartung am Phasenende:** `context` und `ai_gateway` durch Umsetzung validiert `[BELASTBAR]`; Kommunikations-Grundmodus inkl. SSE `[BELASTBAR]`; NFR Kanon-Treue erstmals im Schreibbetrieb gemessen.

**Ursprünglicher Schrittplan:** 9 Schritte, festgehalten am 2026-09-26 – wird nicht still hochgesetzt (CLAUDE.md Abschnitt 8, Kriterium 9)

**Pflichtfrage am Phasenende:** ADR-024 – weiterbauen

### 3.1: ai_gateway – Anbieter-Schnittstelle und OpenRouter-Adapter

- **Status:** ERLEDIGT (2026-09-26; ADR-021) – `ModelProvider` mit vier Fehlerarten, Timeouts 10/90/30 s, einem Retry bei HTTP 429 und Modell-Konfiguration; OpenRouter-Adapter über httpx; zweiter Test-Adapter ohne Änderung am OpenRouter-Code (FR-025, `tests/ai_gateway/test_second_adapter.py`); jede Fehlerart per Test; Log-Zeile nur mit Metadaten, kein Schlüssel und kein Text in Logs oder Fehlerketten (Tests); 49 Tests, Coverage `ai_gateway` 100 % Zeilen, 65/66 Zweige; Sicherheitsprüfung durch getrennte Instanz mit Nachprüfung (Logbuch 21:40); nur mit simulierten Antworten geprüft – kein Schlüssel in der Umgebung, echter Aufruf mit 3.3
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

### 3.2: context – Kontext-Zusammenstellung unter Token-Budget

- **Status:** ERLEDIGT (2026-09-26) – `ContextBuilder` mit Vorrangfolge, Auffüllen und Ablehnung bei zu kleinem Budget (Präzisierung durch den Eigentümer, `docs/architecture.md` Abschnitt 3); Welten strikt getrennt, Budget nie überschritten, Änderung eines Eintrags in der nächsten Anfrage wirksam (24 Tests, Coverage `context` 100 % Zeilen und Zweige); FR-003 und FR-004 mit 4 echten Läufen (grok-4.7) ohne Widerspruch, blind bewertet (`spikes/kontext-abnahme/README.md`); Nebenbefund Figuren-Schreibweise → 3.4
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

### 3.3: Weiterschreiben mit Streaming und Szenen-Einstieg

- **Status:** ERLEDIGT (2026-09-26; ADR-022) – `api.flows.writing` mit SSE-Endpunkt und `GET /api/models`, Schreib-Bereich in der Oberfläche (Szenen-Einstieg, Übernehmen ans Kapitelende, Ändern, Verwerfen, Abbruch, Neu schreiben mit anderem Modell); 322 Python-Tests (`api.flows.writing` 100 % Zeilen), 40 Komponenten- und 5 End-to-End-Tests; Probeschreiben mit 16 echten Anfragen (0,556 $, `spikes/probeschreiben/README.md`): FR-008, FR-009, FR-011 erfüllt (0 eindeutige Kanon-Widersprüche je Kapitel, blind bewertet), Abbruch lässt das Manuskript unverändert. **Teilkriterium Reaktionszeit verfehlt** (grok-4.7 einmal 77 s statt ≤ 60 s, grok-4.6 13,2 s und 15,8 s statt ≤ 10 s) – Ziel bleibt, Erkundung in D.6 (Entscheidung des Eigentümers, ADR-022)
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
- **Notizen:** Pflicht aus ADR-020: Abläufe (Weiterschreiben mit Streaming, später Kurzfassung nach Kapitelabschluss, Fakt → Kanon) in ein Untermodul `api.flows` legen, nicht in die Routen; die Routen bleiben dünn. Beim Phasenende 3 wird `api` erneut auf Heuristik 1.4 („Gott-Modul") geprüft.

### 3.4: Figuren-Schreibweise

- **Status:** ERLEDIGT (2026-09-27) – Regel im Kontext geschärft (Verbotenes, Erlaubtes, Endpunkt) plus Erinnerung nach der Anweisung; Einstellung von Erzählperspektive und geführten Figuren auf der Geschichtenseite; 26 Kontext-Tests (`context` 100 %), 42 Komponenten-Tests; 10 echte Läufe grok-4.7 (0,413 $), blind bewertet: 0 eindeutige Verstöße, 2 fragliche, alle Texte enden an der Stelle des Autors (`spikes/figuren-schreibweise/README.md`; 3.3: 20 Verstöße in 15 Texten)
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
- **Notizen:** – Zusatz 2026-09-26 (Abnahme 3.2): grok-4.7 schrieb in 1 von 4 Texten Handlung und Rede der vom Autor geführten Ich-Figur trotz Hinweis im Kontext (`spikes/kontext-abnahme/README.md`) – Wortlaut der Figuren-Schreibweise hier schärfen und messen. Zusatz 2026-09-26 (Probeschreiben 3.3): 20 Verstöße in 15 KI-Blöcken, darunter wörtliche Rede der Ich-Figur in einem Szenen-Einstieg; Szenen-Einstieg und Kapitelschluss besonders anfällig (`spikes/probeschreiben/README.md`).

### 3.5: `@`-Menü

- **Status:** ERLEDIGT (2026-09-27) – Anweisungsfeld als kleiner CodeMirror-Editor mit `@`-Menü (`@codemirror/autocomplete` 6.20.3, jetzt direkte Abhängigkeit, CodeMirror-Familie freigabefrei): `@` bietet Namen und Aliasse der Einträge der Welt der Geschichte an; `@Name` bzw. `@Alias` in der Anweisung wird beim Senden als Verweis erkannt (Groß-/Kleinschreibung egal, längster Name gewinnt) und unter dem Feld als „Herangezogen: …“ angezeigt; Server lehnt Verweise auf Einträge anderer Welten mit 422 ab (Test). 52 Komponenten- und 5 End-to-End-Tests (Menü im echten Chromium unter der CSP), 326 Python-Tests; Abnahme mit 5 echten Läufen grok-4.7 (0,217 $, blind bewertet): alle 4 Texte mit `@Kael` nutzen Einzelheiten nur aus Kaels Eintrag (15 von 16), der Kontrolllauf ohne `@` keine der körperlichen (`spikes/at-verweis/README.md`). Gast-Einträge im Menü mit 3.7
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

### 3.6: Kapitel-Kurzfassungen und Gesamtzusammenfassung

- **Status:** ERLEDIGT (2026-09-27) – `context` baut die Anfragen „Kurzfassung“ (150 bis höchstens 250 Wörter) und „Gesamtzusammenfassung fortschreiben“ (höchstens ca. 600 Wörter) und setzt für frühere Kapitel ohne Kurzfassung den Anfang wörtlich ein (ganze Absätze bis ca. 300 Wörter) – Werte vom Eigentümer; Ablauf `api.flows.summary` mit neuem Endpunkt `POST …/chapters/{n}/summarize` (rein additiv, Fehler je Stufe ohne HTTP-Fehler, Gespeichertes bleibt); Oberfläche: Abschließen erstellt die Kurzfassung, Kurzfassung und Gesamtzusammenfassung ansehen und ändern (Speichern = geprüft), nachholen oder neu erstellen. 342 Python-Tests (`context` 100 %, `api.flows.summary` 98 %), 57 Komponenten-, 5 End-to-End-Tests. Abnahme mit echten Läufen (grok-4.7, ca. 0,4 $, blind bewertet): mit Kurzfassungen 3 von 3 Fortsetzungen mit richtigem Handlungsstand aus Kapitel 1 und 2, ohne 0 von 3 und zwei erfundene Widersprüche (`spikes/kurzfassungen/README.md`). **Länge verfehlt:** 290 und 336 statt höchstens 250 Wörter bei kurzen Testkapiteln – Prüfung an echter Kapitellänge in D.4. Nebenbei behoben: 503 „KI-Anbieter nicht eingerichtet“ wurde in der Oberfläche als Passwortprüfung gemeldet (seit 3.3)
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

### 3.7: Gast-Figuren aus anderen Welten

- **Status:** ERLEDIGT (2026-09-27) – `context` nimmt Gäste der Geschichte auf: genannt (`@`, Szene) oder geführt in Vorrang 2, sonst nur als Auffüllung nach den Einträgen der Welt; gekennzeichnet mit der Heimatwelt, deren Regeln nicht mitgehen (Entscheidungen des Eigentümers per Frage-System); Schreib-Ablauf nimmt Gäste in Verweisen und Szene an (rein additiv); Oberfläche: Abschnitt „Gäste aus anderen Welten“ (einbinden, entfernen), Gäste im `@`-Menü, in der Szene und in der Figuren-Schreibweise. Szenario 4 durch Tests belegt: andere Geschichte der Welt und Geschichte der Heimatwelt ohne Gast (`tests/context/test_guests.py`), Verweis ohne Verbindung → 422 (`tests/api/test_writing.py`), Menü nur mit den Gästen der Geschichte (`ui/src/views/Guests.test.tsx`, End-to-End-Test). 356 Python-Tests (`context` 100 %, `api.flows.writing` 99 %), 65 Komponenten- (98,2 % Zeilen, 94,6 % Zweige), 6 End-to-End-Tests. Abnahme mit 3 echten Läufen grok-4.7 (0,014 $, blind bewertet): 12 von 12 Einzelheiten des Gastes, Regel der Heimatwelt in keinem Text, 0 eindeutige Widersprüche (`spikes/gast-figuren/README.md`). Nebenbei: zeitabhängiger End-to-End-Test beim `@`-Menü behoben (Logbuch)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 3.2
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Umsetzung der Gast-Verbindung aus dem Datenmodell.
- **Eingangskriterien:** Datenmodell `GuestLink` `[BELASTBAR]`
- **Anforderungen (ab Klasse M):** FR-017
- **Zu tun:** Eine Geschichte bindet einen Eintrag einer anderen Welt ein; die Verbindung gilt nur für diese Geschichte. Zusatz 2026-09-27 (aus 3.5, FR-013 „ausdrücklich verbundene Einträge“): Gast-Einträge der Geschichte erscheinen im `@`-Menü und lassen sich per `@` als Verweis senden; der Schreib-Ablauf nimmt sie an (heute nur Einträge der eigenen Welt).
- **Akzeptanzkriterien:** Szenario 4 der Vision: übrige Geschichten beider Welten zeigen den Gast-Eintrag weder in Vorschlägen noch im KI-Kontext (FR-017).
- **Betroffene Module:** manuscript, context, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests
- **Notizen:** Tatsächlich berührt (2026-09-27): context, api (`api.flows.writing`), ui; `manuscript` unverändert – Gast-Verbindungen bestehen seit 2.5.

### 3.8: Fakt aus dem Text in den Kanon (inkl. Ziel bei Gast-Figuren)

- **Status:** ERLEDIGT (2026-09-27) – „In den Kanon“ unter dem Kapitel-Editor: markierte Stelle als neuer Eintrag der Welt oder als Ergänzung (Absatz am Ende) eines Eintrags der Geschichte; Vorschlag von Eintrag, Name und Kategorie ohne KI (genannter Name oder Alias; kurze Stelle wird Name; zuletzt gewählte Kategorie); Zielwahl „Kanon“ oder „nur diese Geschichte“ bei allen Einträgen, beim Gast „Kanon der Figur“ in seiner Heimatwelt, vorbelegt „nur diese Geschichte“; Abschnitt „Fakten dieser Geschichte“ mit Entfernen (Entscheidungen des Eigentümers per Frage-System). Nur `ui` geändert, bestehende Endpunkte. FR-024 durch Tests belegt (`tests/api/test_canon_fact.py`: beide Ziele wirken wie gewählt bis in den KI-Kontext); FR-015: nach dem Markieren zwei Klicks, End-to-End-Test je Vorgang unter 10 s. 361 Python-Tests (99,85 %), 88 Komponenten-Tests (98,1 % Zeilen, 95,6 % Zweige), 7 End-to-End-Tests (3 von 3 Gesamtläufen grün). Keine echten KI-Läufe nötig (kein neuer Kontext-Baustein)
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
- **Notizen:** Tatsächlich berührt (2026-09-27): nur ui (plus Tests über api); `api`, `canon` und `manuscript` boten die Operationen seit 2.3/2.5/2.6.

### 3.9: Modell- und Anbieterwahl, Modellwechsel

- **Status:** ERLEDIGT (2026-09-27; ADR-023) – Modell je Geschichte (Kopffeld `modell`, im Schreib-Bereich vorgewählt und bei Änderung sofort gespeichert); Schreiben ohne Modellangabe nutzt das Modell der Geschichte; Token und Kosten unter jedem Vorschlag, Hinweis auf anderes Modell bei Ablehnung, Anbieter angezeigt (nur OpenRouter, weitere V.3); jede KI-Anfrage in `system/verbrauch/JJJJ-MM.md` gezählt (`api.usage`), Monatskosten unter „Konto“, `GET /api/usage`. 377 Python-Tests (99,78 %, `api.usage` 100 %), 96 Komponenten-Tests (98,2 % Zeilen, 96,0 % Zweige), 8 End-to-End-Tests (3 von 3 Gesamtläufen grün). Abnahme mit 2 echten Läufen (0,0048 $): Wechsel grok-4.7 → grok-4.6 wirkt, Text aus Lauf 1 bleibt Grundlage, beide Anfragen gezählt (`spikes/modellwahl/README.md`)
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
- **Notizen:** Zusatz 2026-09-26 (ADR-021): Speicherung der Verbrauchsdaten je Anfrage für die Monatssumme hier entscheiden (Datenmodell, Kategorie 4); `ai_gateway` liefert sie seit 3.1 zurück. Entschieden 2026-09-27: ADR-023 (Option A). Tatsächlich berührt: ui, api, manuscript (Kopffeld `modell`); `ai_gateway` unverändert.
