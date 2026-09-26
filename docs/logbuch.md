# Logbuch – Skriptorium

<!-- Chronologischer Flugschreiber des Projekts. Ereignisbasierte Einträge, neueste oben.
     Zweck:
       1. Nahtlose Fortsetzung in neuer Session: was war zuletzt los, womit ging es zu Ende?
       2. Wiederfindbarkeit kleiner Lösungen: was war das nochmal mit dem Migrations-Bug?
       3. Selbst-Beobachtung des Projekts: was hat länger gedauert, was war überraschend?

     Abgrenzung zu anderen Dokumenten:
       - fahrplan.md: Was tun wir? (Plan)
       - decisions.md: Warum so? (Begründung)
       - architecture.md: Wie ist es gebaut? (Zustand)
       - blockers.md: Was hindert uns aktuell? (offene Probleme)
       - CHANGELOG.md: Was hat sich für Nutzer geändert? (extern, versionsorientiert)
       - logbuch.md: Was ist während der Arbeit passiert? (intern, chronologisch)

     Das Logbuch ist die einzige chronologisch durchlaufende Erzählung.
     Es darf detailreich sein und kleine Reibungen festhalten – das ist sein Wert. -->

<!-- ANCHOR:aktueller-stand -->
## Aktueller Stand

Die letzten Einträge geben den aktuellen Stand wieder. Bei Sessionbeginn liest die KI mindestens den letzten `[SESSIONENDE]`-Eintrag und alle Einträge danach, um den Faden aufzunehmen.

Das Logbuch beginnt mit der ersten regulären Session nach dem Initialisierungs-Commit (Modus 2, abgeschlossen 2026-09-26). Verlauf und Begründungen der Initialisierung stehen in `docs/decisions.md` (ADR-001 bis ADR-009).

---

<!-- ANCHOR:eintraege -->
## Einträge (neueste oben)

### 2026-09-26 21:20 – [BEOBACHTUNG] Schritt 1.3 erledigt – httpx 0.28.1 trägt auf Python 3.14.7

- Eingangskriterium zunächst nicht erfüllt: installiertes uv 0.8.17 kannte nur Python 3.14.0rc2. Lösung: uv 0.12.19 in einer Scratchpad-venv installiert, damit Python 3.14.7 geladen (nur Testumgebung, keine Projekt-Abhängigkeit).
- Prüfskript `spikes/httpx-python-314/pruefung.py` (Standardbibliothek + httpx): Streaming, ReadTimeout, Abbruch – je sync und async – plus echter OpenRouter-Stream; 9/9 bestanden, lokale Prüfungen 3× wiederholt, `-X dev -W error` ohne Warnung.
- Reibung: „Broken pipe" aus dem eigenen Testserver nach absichtlichem Timeout – im Server abgefangen. Einmalige asyncio-Meldung „took 0.211 seconds" nicht reproduzierbar; Folge für 3.1: AsyncClient einmal anlegen.
- Beobachtung Umgebung: uv meldet `UV_NATIVE_TLS` als abgekündigt (`UV_SYSTEM_CERTS` verwenden). Die Variable setzt die Cloud-Umgebung, nicht das Projekt; kein Projekt-Werkzeug betroffen, daher kein Fahrplan-Schritt. Landeplatz: Notiz in Schritt 2.1 (dort prüfen, ob die Warnung in CI oder Pre-Commit auftaucht).
- Ablaufdaten-Register und Stack-Eintrag httpx nachgezogen; D.3 (Nachprüfung 2027-03-26) bleibt.

### 2026-09-26 20:55 – [ADR-ANGELEGT] ADR-012 – Import zunächst Markdown; 1.2 erledigt, 1.3 begonnen

- Eigentümer (Frage-System): „Wir beginnen erst mal mit Markdown-Import und nehmen TypingMind und Notion später dazu." Empfehlung der KI war Dummy-Exporte; Entscheidung B, neutral im ADR vermerkt.
- ADR-012 [ERKENNTNIS] `[DATENMODELL]`; 1.2 `[ERLEDIGT]` mit geändertem Inhalt; 2.4 auf Markdown-Importer umgestellt; neue Schritte V.4 (TypingMind) und V.5 (Notion), `[VERSCHOBEN]`, Landeplatz 5.5, Vorziehen falls 4.8 am Import scheitert. Risiko FR-005/FR-022 (Handarbeit vs. 30 Minuten) im ADR benannt.
- 1.3 `[IN ARBEIT]`: Empfohlene Klasse Routine, aktive Klasse Entscheidung – Arbeit oberhalb der Empfehlung, Hinweis an den Eigentümer vorab im Frage-System gegeben (Guthaben), Eigentümer wählte „Ja, jetzt"; keine Abgabe an einen Unteragenten, weil die Routine-Klasse ohne Probelauf ist.

### 2026-09-26 20:40 – [BEOBACHTUNG] Branch-Konvention (M.1), Antworten des Eigentümers

- Antworten über das Frage-System (Wunsch des Eigentümers: Rückfragen künftig dort stellen): hier weiterarbeiten; Branch-Konvention erstellen; Exporte für 1.2 **nicht** nutzbar; eigene Lesung der Testtexte nicht nötig (in 1.4 vermerkt).
- Branch-Konvention in `docs/project-context.md` Abschnitt 10: `<typ>/<fahrplan-id>-<kurztitel>` mit Typen feat, fix, refactor, spike, docs, ci, deps, chore, hotfix (erst nach 4.7). Grenze benannt: Cloud-Sessions bekommen ihren Branch vom Werkzeug (`claude/…`), dort trägt der PR-Titel den Typ. Merge-Commit statt Squash (bisherige Praxis). Fahrplan-Landeplatz: neuer Querschnitt-Schritt M.1.
- Offen: 1.2 ohne echte Exporte – Rückfrage zu Alternativen folgt über das Frage-System.

### 2026-09-26 20:25 – [ADR-ANGELEGT] ADR-011 – grok-4.6 Zweitmodell

- Eigentümer: grok-4.7 bei CNC-Inhalten sehr gut, grok-4.6 gut bei Charakter-Konsistenz und Figuren-Simulation; „Qwen ist wirklich nur eine Notfalllösung."
- ADR-011 [ERKENNTNIS]: Reihenfolge grok-4.7 → grok-4.6 → qwen3.8-max (Notfall). ADR-010-Status vermerkt die Ersetzung. Restrisiko benannt: beide Hauptmodelle von xAI.
- Reaktiv-Quote 0/10 (letzte 10 ADRs: 002–011).

### 2026-09-26 20:10 – [BEOBACHTUNG] Schritt 1.5 erledigt

- Genre-Bewertung (4 Prüf-Instanzen, je Szene 8 Texte blind): grok-4.7 in allen vier Szenen Rang 1 und 2 (Punkte 22,5/25), grok-4.6 18,1, gemini-3.8-flash 16,6, qwen3.8-max 16,0. Keine Ablehnung, keine Moralisierung; Abschwächung selten (qwen 2, grok-4.6 1); Schreibweise-Verstöße vor allem bei qwen (5/8).
- Reibung: erste Aggregation gruppierte nach Anbieter statt Modell (falsches Feld im Dateinamen) – sofort bemerkt, weil grok-Zeilen zusammenfielen; korrigiert.
- ADR-010 bestätigt; offene Frage an den Eigentümer: grok-4.6 statt qwen3.8-max als bevorzugtes Zweitmodell? (Zielkonflikt Genre-Qualität vs. Herstellervielfalt.)

### 2026-09-26 19:45 – [BEOBACHTUNG] Schritt 1.5 Genre-Test angelegt und gelaufen

- Auftrag des Eigentümers: Leistung bei düsteren, Horror-, Thriller- und Action-Szenen, ergänzt um weitere Faktoren. Neuer Fahrplan-Schritt 1.5 (Phase 1 jetzt 5 statt 4 Schritte, Wucherungs-Schwelle nicht berührt); 1.4 hängt zusätzlich von 1.5 ab.
- Vier Szenen mit Brückentext, Kriterien vorab fixiert (Sprache, Genre-Handwerk, Spannung, Atmosphäre, Figuren unter Druck; dazu Abschwächung, Moralisierung, Schreibweise, grobe Kanon-Fehler). Szenen-Einträge je Genre ergänzt (z. B. Gunda, Vogt, Fenn Asch für die Hinrichtungsszene).
- 32 Läufe (grok-4.7, grok-4.6, qwen3.8-max, gemini-3.8-flash × 4 Szenen × 2), alle erfolgreich, 0 Ablehnungen, `finish_reason` stets `stop`, 0,81 $. Auffällig: gemini-3.8-flash brauchte in zwei Läufen 10–23 s bis zum ersten Textstück (sonst 1,5–2,7 s).
- Aufträge an die vier Genre-Prüfer ohne Platzhalter formuliert (Lehre aus den zwei Pannen).

### 2026-09-26 19:20 – [ADR-ANGELEGT] ADR-010 – Schritt 1.1 erledigt

- **Kanon-Nachtest (Runde 3, Eichtexte 0 / 6 / 0 statt 1):** qwen3.8-max 1,4 Widersprüche je 1.000 Wörter (gleichauf mit grok-4.7 1,5), grok-4.6 2,4, qwen3.8-flash 3,9. Runde-3-Prüfer zählten Schreibweise-Verstöße strenger – im Erkenntnisdokument gekennzeichnet.
- **Stil-Test:** in allen drei Sätzen grok-4.7 Rang 1, grok-4.6 Rang 2, qwen3.8-max Rang 3; gemini-3.8-flash nur Rang 5–6; qwen3.8-flash dreimal letzter (wechselt in die dritte Person).
- **Ablehnungssignale:** OpenRouter-Doku gesichtet (`finish_reason: content_filter`, `native_finish_reason`, `error` im Strom); im Test nicht live aufgetreten.
- **ADR-010 [ERKENNTNIS]:** Startmodell grok-4.7, Ausweichmodell qwen3.8-max, schnelle Alternative grok-4.6, Token-Budget 30.000 als Obergrenze. Vision-Frage beantwortet vom Eigentümer („Kanon-Fehler stören mehr"). Reaktiv-Quote 0/10.
- **Nachgezogen:** `docs/architecture.md` Abschnitt 6 und 9, `docs/project-context.md` Abschnitte 5, 6, 8, Fahrplan (1.1 `[ERLEDIGT]`; 1.4 um Reaktionszeit-Ziel und Lesung durch den Eigentümer ergänzt), README.
- **Definition of Done für 1.1 (ERKUNDUNG, wissensbasiert):** Akzeptanzkriterien erfüllt (Vergleichstabelle, Monatskosten im Rahmen, Ausweichmodell, Ablehnungsverhalten beschrieben). Code-Punkte der DoD (Linter, Typprüfung, Tests, Coverage) nicht anwendbar: `spikes/modell-eignungstest/lauf.py` ist Wegwerf-Code der Erkundung und wird nicht übernommen; nur Syntaxprüfung (`py_compile`) gelaufen – Python-Werkzeuge werden erst in 2.1 eingerichtet.
- **Kosten 1.1 gesamt:** 0,85 $ OpenRouter (54 erfolgreiche Läufe).

### 2026-09-26 18:40 – [BEOBACHTUNG] 1.1: Antworten des Eigentümers, Qwen 3.8, grok-4.6, Stil-Test

- **Eigentümer:** „Kanon-Fehler stören mehr" (als Wartezeit) → Vision-Frage für das Startmodell beantwortet.
- **Filterverhalten (Angabe des Eigentümers):** CNC-Inhalte liefen früher mit Gemini 2.5 Pro, die neueren Gemini-Modelle schreiben sie nicht mehr; heute nutzt er grok 4.7 oder Qwen 3.8. Die KI schreibt keine eigene Probe-Szene mit sexueller Nicht-Einvernehmlichkeit; die Erfahrung des Eigentümers an echtem Material gilt als Befund zum Filterverhalten (stärker als eine synthetische Probe).
- **Neuer Auftrag des Eigentümers:** zusätzlich die sprachliche Ausdrucksweise prüfen (nach seiner Erfahrung Gemini stark, grok seit 4.6 nah dran). Kriterien vor der Bewertung fixiert (`spikes/modell-eignungstest/stil-kriterien.md`).
- **Läufe:** qwen3.8-max-0902 (Reasoning Pflicht, 19–27 s bis zum ersten Textstück), qwen3.8-flash (ohne Reasoning, 1,5–4,4 s; 4 Läufe zuerst HTTP 429 vom Anbieter, beim Wiederholen erfolgreich), grok-4.6 (Reasoning Pflicht, aber nur 240–380 Reasoning-Token, 5–8 s). 0 Ablehnungen.
- **Panne wiederholt:** Auch der erste Stil-Auftrag enthielt einen nicht ersetzten Platzhalter (`SATZ`), per Nachricht korrigiert. Lehre: Aufträge an Prüf-Instanzen ohne Platzhalter formulieren, nicht aus einer Vorlage kopieren.

### 2026-09-26 18:10 – [BEOBACHTUNG] 1.1 Nachtest grok ohne Reasoning

- grok-4.6/4.5: Reasoning ebenfalls Pflicht. grok-4.3 und grok-4.20 lassen es abschalten → 12 Läufe, erstes Textstück < 1 s, 0 Ablehnungen.
- Blind-Bewertung mit zwei Eichtexten aus Runde 1: beide identisch wiederbewertet (0 bzw. 6) – Bewertung über Runden vergleichbar.
- Ergebnis je 1.000 Wörter: grok-4.7 1,5; gemini 2,6; glm 3,9; grok-4.3 4,5; deepseek 4,6; grok-4.20 5,1. Ohne Reasoning kein Treue-Vorsprung → Zielkonflikt Reaktionszeit vs. Kanon-Treue geht an den Eigentümer.
- Nebenbefund: zweite identische Anfrage bei xAI deutlich billiger (Zwischenspeicher) – Folge für die Reihenfolge im Kontext-Verfahren (Festes vorn), im Erkenntnisdokument vermerkt.

### 2026-09-26 17:40 – [BEOBACHTUNG] Weiterarbeit trotz überschrittener Sessiongröße

- Eigentümer: „Du ignorierst jetzt die Beschränkung und machst hier weiter." – Ausnahme „weiter hier" nach CLAUDE.md Abschnitt 0 („Sessiongröße"); Abweichung hiermit vermerkt. Kontext zu diesem Zeitpunkt ca. 275.000 Token.
- Fortsetzung von 1.1 ohne Zutun des Eigentümers: Test von grok-Varianten mit abschaltbarem Reasoning (Reaktionszeit).

### 2026-09-26 17:30 – [SESSIONENDE] Grenze der Sessiongröße überschritten

- **Dauer:** ca. 14:56–17:30 UTC.
- **Bearbeitet:** Phase 1 begonnen; Schritt 1.1 `[IN ARBEIT]`: Schlüssel-Bereitstellung geklärt (`KEY`), erfundene Testwelt und Prüfliste, Harness, 24 Läufe (0,37 $), Blind-Bewertung, Sichtung der Nutzungsbedingungen, Zwischenstand in `docs/research/modell-eignungstest.md`.
- **Erreichter Stand:** grok-4.7 mit Abstand am kanontreuesten (7 Widersprüche gegenüber 19–28), aber 15–50 s bis zum ersten Textstück (Ziel 5 s); Budget 8k–17,6k ohne messbaren Unterschied; alle Modelle im Kostenrahmen.
- **Offen:** Filter-Probe (Rückfrage an den Eigentümer: welche Art von Inhalten wurde früher abgelehnt?), Ablehnungsverhalten, Stichprobe der Bewertung durch den Eigentümer, Entscheidung zu Startmodell/Ausweichmodell/Budget als `ENTSCHEIDUNG ERFORDERLICH` bzw. ADR `[ERKENNTNIS]`.
- **Nächster Schritt:** neue Session – 1.1 fortsetzen (Filter-Probe), parallel 1.3 möglich.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage). Schritte oberhalb der Empfehlung: 0 (1.1 empfiehlt Entscheidung). Abgegebene Teilarbeiten: 4 Bewertungs-Instanzen und 1 Recherche-Instanz, alle auf derselben Klasse (niedrigere Klassen ohne Probelauf nicht zulässig); Routine-Teilarbeiten (Logbuch, README) blieben in der aktiven Klasse, weil der Kontext geladen war.
- **Kontextgröße:** 273.042 Token laut Sitzungsabfrage (Grenze 200.000) – überschritten, deshalb Abschluss ohne neuen Schritt. Die Sitzungsabfrage meldete zu Sessionbeginn 0 und aktualisierte sich erst spät; die Grenze wurde deshalb erst nach der Auswertung bemerkt. Sitzungskosten laut Abfrage ca. 10 $.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, nächste Schritte, Research-Verweis). Drift-Prüfung: keine neuen ADRs, Modulnamen unverändert, keine Blocker, Phase 1 weiter 4 Schritte (Schwelle nicht berührt). Ablaufdaten-Register: kein Vorlauf erreicht (Guthaben-Vorlauf ab 2026-10-22). Größen-Budget `project-context.md` eingehalten (ca. 300 Zeilen).

### 2026-09-26 17:15 – [BEOBACHTUNG] 1.1 Zwischenstand: Bewertung und Nutzungsbedingungen

- Blind-Bewertung der 24 Texte abgeschlossen (4 Prüf-Instanzen). Kanon-Widersprüche: grok-4.7 7, gemini-3.8-flash 19, glm-5.3 24, deepseek-v4-pro 28. Figuren-Schreibweise verletzt nur von deepseek (9) und glm (2). Mechanische Gegenprobe „Totenname nachts" deckungsgleich mit den Prüf-Instanzen.
- Budget-Stufen 8k/14k/17,6k ohne messbaren Unterschied (29/25/24).
- Reibung: Prüf-Instanzen zählten K12 (Eid-Inhalt bei Mitnahme des Buchs) uneinheitlich – Auswertung zusätzlich ohne K12 ausgewiesen; Reihenfolge unverändert. Lehre für künftige Prüflisten: Grenzfälle mit Beispiel vorab festlegen.
- Nutzungsbedingungen gesichtet (xAI am weitesten, Z.ai/StreamLake am engsten; StreamLake darf Eingaben zum Training nutzen).
- Erkenntnisdokument `docs/research/modell-eignungstest.md` als Zwischenstand; Kostenregister nachgezogen. Offen: Filter-Probe (Antwort des Eigentümers), Reaktionszeit grok-4.7 (15–50 s vs. Ziel 5 s), Stichprobe durch den Eigentümer, ADR.

### 2026-09-26 16:30 – [PROBLEM-GELÖST] Läufe 1.1: Pflicht-Reasoning bei drei Modellen

- Testwelt „Die Salzmark" angelegt (29 Kanon-Dateien inkl. Zeitlinie – im Commit-Text stand irrtümlich 27), Prüfliste vor dem ersten Lauf fixiert. Harness `spikes/modell-eignungstest/lauf.py` nur mit Standardbibliothek (`urllib`), damit keine neue Abhängigkeit nötig ist.
- Kalibrierung: Schätzung 3,3 Zeichen je Token traf `prompt_tokens` bei deepseek-v4-pro fast genau (7.869 geschätzt / 7.887 gemessen). Material reicht nur bis ca. 17.600 Token; die Stufe „30.000" enthält daher alles Material (ca. 17.600) – Grenze im Erkenntnisdokument benennen.
- Reibung: `reasoning: {enabled: false}` wird von glm-5.3, grok-4.7 und gemini-3.8-flash mit HTTP 400 „Reasoning is mandatory" abgelehnt (18 Fehlläufe, 0 $). Lösung: für diese drei `reasoning: {effort: low}`; im Ergebnis je Lauf vermerkt. Folge für `ai_gateway`: Reasoning-Steuerung muss je Modell konfigurierbar sein.
- 24 Läufe (4 Modelle × 3 Stufen × 2 Wiederholungen) erfolgreich, 0 Ablehnungen, Gesamtkosten 0,37 $. grok-4.7 braucht durch Pflicht-Reasoning 15–50 s bis zum ersten Textstück (NFR: 5 s).
- Kleine Panne: Bewertungs-Auftrag an den ersten Prüf-Agenten enthielt einen nicht ersetzten Platzhalter für die Textliste; per Nachricht korrigiert.
- Reibung: Der `pre-commit`-Hook ist in der Cloud-Session nicht installiert (`.git/hooks` leer); markdownlint lief nur von Hand und hätte die Modell-Rohtexte (`.md`) in CI angemahnt (MD041). Lösung: Rohtexte als `.txt` abgelegt. Offen: Hook-Installation beim Sessionstart – Landeplatz Schritt 2.1 (Projektgerüst und volle CI-Gates).
- Bewertung blind: Texte anonymisiert (Zuordnung nur im Scratchpad), vier Prüf-Agenten der Entscheidungs-Klasse parallel.

### 2026-09-26 15:35 – [BEOBACHTUNG] Guthaben des Coding-Agents

- Eigentümer: eingelöstes Guthaben 250 $, davon 193 $ übrig, gültig bis 2026-11-05 08:59 MEZ; die Cloud-Sessions laufen darüber. Die Sitzungsabfrage meldet `isUsingOverage: false` und zum Guthaben nichts – Angabe des Eigentümers ist die Quelle.
- Nachgetragen in `docs/project-context.md` Abschnitt 6 (Bezugsmodell) und Abschnitt 8 (Ablaufdaten-Register, Vorlauf 2 Wochen).
- Folge für 1.1: Die Kontingent-Warnung aus dem Sessionstart ist entschärft; die Testwelt wird jetzt geschrieben.

### 2026-09-26 15:25 – [BEOBACHTUNG] 1.1 begonnen mit erfundenen Testdaten

- Festlegung des Eigentümers: Sein Welt-Material kann in der Arbeitsumgebung nicht verwendet werden; die KI erfindet Testwelt, Kanon-Auszug, Handlungsstand und Szene. Eingangskriterium im Fahrplan entsprechend geändert, STOPP aufgelöst, 1.1 auf `[IN ARBEIT]`.
- Grenzen der Aussagekraft (im Fahrplan vermerkt): Kanon-Treue wird gegen erfundenen Kanon gemessen; Filterverhalten hängt davon ab, wie nah die Szene an den früher abgelehnten Inhalten liegt – dazu Rückfrage an den Eigentümer gestellt (welche Art Inhalte wurde abgelehnt?).
- Vorarbeit: Modell-Liste von OpenRouter erneut abgerufen (458 Modelle, wie am Vormittag); Kandidaten ohne OpenRouter-Moderation mit Preisen vorausgewählt (Details folgen in `docs/research/modell-eignungstest.md`).

### 2026-09-26 15:10 – [PROBLEM-GELÖST] OpenRouter-Schlüssel gefunden

- Eigentümer: Der Schlüssel liegt in der Umgebungsvariable `KEY`, nicht in `OPENROUTER_API_KEY`.
- Geprüft ohne Wertausgabe: gesetzt, Länge 73, OpenRouter-Präfix vorhanden. Abfrage `/api/v1/key`: Ausgabengrenze 5 $, verbraucht 0 $, keine Zurücksetzung der Grenze, kein Gratis-Kontingent.
- Reibung: Der Eigentümer hatte zuerst den Namen „Open Router Key“ versucht; die Umgebungs-Konfiguration hat ihn abgelehnt. Wahrscheinliche Ursache: Namen von Umgebungsvariablen dürfen keine Leerzeichen enthalten; `OPENROUTER_API_KEY` (Großbuchstaben, Unterstriche) sollte angenommen werden. Nicht selbst geprüft, da die Konfiguration nur dem Eigentümer zugänglich ist.
- Beobachtung: Der Name `KEY` ist unspezifisch. Für den Wegwerf-Code aus 1.1 wird er so gelesen; welcher Variablenname im Produkt gilt, entscheidet Schritt 3.1 (`.env.example`).
- Eingangskriterium 1 von 1.1 erfüllt; die Testszene fehlt weiter, STOPP bleibt bestehen.

### 2026-09-26 15:00 – [BEOBACHTUNG] Eingangskriterien 1.1 nicht erfüllt – STOPP (Informationslücke)

- Geprüft: Umgebungsvariable `OPENROUTER_API_KEY` ist in der Cloud-Umgebung **nicht gesetzt** (nur Vorhandensein geprüft, kein Wert ausgegeben). Keine andere Variable mit Bezug zu OpenRouter vorhanden.
- Testszene (Ort, Figuren, Ziel) mit Kanon-Auszug liegt nicht vor.
- Bereitstellungsweg für den Schlüssel ist im Fahrplan als `[TBD]` offen. Vorschlag an den Eigentümer: Umgebungsvariable `OPENROUTER_API_KEY` in den Einstellungen der Cloud-Umgebung; wirkt erst in einer neuen Session.
- Folge: 1.1 bleibt `[OFFEN]`, STOPP nach CLAUDE.md Abschnitt 8, Kriterium 1; STOPP-Block im Fahrplan „Aktueller Stand" hinterlegt. 1.2 braucht ebenfalls Material des Eigentümers (Exporte); 1.3 ist ohne Zutun beginnbar.

### 2026-09-26 14:56 – [SESSIONSTART] Auftrag: Schritt 1.1

- **Modell:** eingestellt `claude-opus-5-5`, bedient `claude-opus-5-5` → Entscheidungs-Klasse (Quelle: Sitzungsabfrage `get_session`). Empfohlene Klasse für 1.1: Entscheidung – keine Abweichung.
- **Kontextgröße:** Sitzungsabfrage meldet `used_tokens: 0` bei `max_tokens: 1.000.000` – Wert offensichtlich nicht aktuell; Größenregel wird mit Vorbehalt angewendet.
- **Kontingent:** Wochenlimit Status `allowed_warning` (Zurücksetzung So 2026-09-27 10:00 MESZ) – Hinweis an den Eigentümer.
- **Einstieg:** erster regulärer Sessionstart nach Modus 2; kein vorheriger `[SESSIONENDE]`-Eintrag. Mindest-Lektüre vollständig durchlaufen.

<!-- ANCHOR:eintragstypen -->
## Eintragstypen (Übersicht)

Verbindliche Typen, andere nur in Ausnahmefällen:

| Typ | Wann | Pflicht? |
|---|---|---|
| `[SESSIONSTART]` | Zu Beginn jeder Session | Ja |
| `[SESSIONENDE]` | Vor Sessionabschluss | Ja |
| `[PROBLEM-GELÖST]` | Nach Behebung eines Problems, das Reibung war | Empfohlen, alle Mini-Probleme erfassen |
| `[PROBLEM-OFFEN → BLOCKER]` | Wenn ein Problem zum Blocker eskaliert | Ja, mit Verweis auf `blockers.md` |
| `[BLOCKER-AUFGELÖST]` | Wenn ein Blocker gelöst wurde | Ja, mit Verweis auf den ursprünglichen Logbuch- und Blocker-Eintrag |
| `[REIFEGRAD-WECHSEL]` | Bei jeder Reifegrad-Änderung in `architecture.md` | Ja |
| `[ADR-ANGELEGT]` | Bei Anlage eines neuen ADR | Ja |
| `[BEOBACHTUNG]` | Wenn etwas auffällt, das später nützlich sein könnte | Optional, KI proaktiv |

<!-- ANCHOR:hinweise-zur-pflege -->
## Hinweise zur Pflege

- **Neueste Einträge oben.** Lesefluss bei Sessionbeginn ist „von oben nach unten bis zum letzten gelesenen Stand".
- **Zeitstempel ist Pflicht.** Format: `YYYY-MM-DD HH:MM` (24h, lokale Zeitzone). Bei Unsicherheit: das Datum ist Pflicht, die Uhrzeit kann grob sein.
- **Detailtiefe lieber zu hoch als zu niedrig.** Das Logbuch lebt davon, dass auch kleine Reibungen festgehalten werden – sie sind im Moment des Auftretens unscheinbar, aber später Goldwert. Wenn unsicher, ob etwas eingetragen werden soll: eintragen.
- **Verweise sind willkommen.** Wenn ein Logbuch-Eintrag mit einem ADR, einem Blocker oder einem Fahrplan-Schritt zusammenhängt: verweisen, statt zu duplizieren.
- **Keine sensiblen Daten.** Auch im Logbuch keine Secrets, keine echten PII, keine internen URLs aus Produktion. Platzhalter verwenden.

<!-- ANCHOR:archivierung -->
## Archivierung

Wenn das Logbuch unübersichtlich wird (Richtwert: >800 Zeilen, schneller wachsend als andere Dokumente):

- Alte Einträge nach `docs/archiv/logbuch-YYYY-MM.md` auslagern.
- Im aktiven Logbuch bleibt: die letzten 4–8 Wochen, plus alle Einträge, die mit aktuell offenen `blockers.md`-Einträgen verbunden sind.
- Auslagerung ist Sessionende-Aktion, keine freigabepflichtige Entscheidung.
