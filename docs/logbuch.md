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

Das Logbuch beginnt mit der ersten regulären Session nach dem Initialisierungs-Commit (Modus 2, abgeschlossen 2026-09-26). Verlauf und Begründungen der Initialisierung stehen in `docs/decisions.md` (ADR-001 bis ADR-009). Phasen 1 und 2 sind verdichtet; Details in `docs/archiv/logbuch-phase-1.md` und `docs/archiv/logbuch-phase-2.md`.

---

<!-- ANCHOR:eintraege -->
## Einträge (neueste oben)

### 2026-09-27 01:10 – [SESSIONENDE] Schritt 3.5 erledigt

- **Dauer:** 00:52–01:10 UTC.
- **Bearbeitet:** 3.5 `[ERLEDIGT]`: Anweisungsfeld als CodeMirror-Editor mit `@`-Menü (`@codemirror/autocomplete` 6.20.3 als direkte Abhängigkeit, CodeMirror-Familie freigabefrei); Erkennung von `@Name`/`@Alias` beim Senden, Anzeige „Herangezogen: …“; Tests für Ablehnung von Verweisen in andere Welten (API) und für genannte Einträge bei knappem Budget (Kontext); Abnahme mit 5 echten Läufen (0,217 $), blind bewertet. FR-013 erledigt; Gast-Einträge im Menü als Zusatz an 3.7 (Landeplatz).
- **Erreichter Stand:** 326 Python-Tests (99,84 %; `canon`, `context` 100 %), 52 Komponenten-, 5 End-to-End-Tests grün; alle Pre-Commit-Hooks, Audits ohne Befund. Hauptbündel +1,5 kB, CodeMirror bleibt nachgeladen. OpenRouter-Guthaben laut Rechnung ca. 2,03 $ (vorher ca. 2,25 $).
- **Offen:** Pull Request für diesen Branch; CI-Lauf auf dem Push.
- **Nächster Schritt:** neue Session – 3.6 Kapitel-Kurzfassungen und Gesamtzusammenfassung.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5 laut Sitzungsabfrage 01:05). Schritte oberhalb der Empfehlung: 1 (3.5 empfiehlt Routine; Abgabe nicht zulässig, Probelauf Routine offen). Abgegeben: blinde Bewertung an Unteragent mit Sonnet 5 (getrennte Instanz, nicht zur Kostenersparnis).
- **Kontextgröße:** nicht feststellbar – die Sitzungsabfrage meldet während der Session 0 Token; die Regel „Sessiongröße“ entfällt für diese Session. Kein weiterer Schritt in dieser Session.
- **Kontingent:** Wochenlimit `allowed_warning`, Zurücksetzung 2026-09-27 10:00 MESZ.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Quick-Start-Stand – Drift seit 3.3 „noch ohne KI“ behoben –, Verwendung, Nächste Schritte). Drift-Prüfung: keine neuen ADRs; FR-013 → 3.5 erledigt, Gast-Teil an 3.7; Modul-Liste unverändert; Reifegrade unverändert; Reaktiv-Quote 1/10; Phase 3 unverändert 9 Schritte; Blocker 0. Ablaufdaten-Register: Vorlauf des Guthabens (2 Wochen vor 2026-11-05) noch nicht erreicht. Archivierung: kein Trigger. Onboarding: Quick-Start-relevant (neue direkte Abhängigkeit in `package.json`) – im frischen Worktree validiert (`uv sync --frozen`, `npm ci`, `skriptorium-einrichtung`, `vite build`, `/api/health` → ok).

### 2026-09-27 01:05 – [PROBLEM-GELÖST] Reibungen in 3.5

- **Menü im Test leer:** Der Test tippte `@fä`, der Alias heißt aber „der Fährmann“ – gesucht wird am Namensanfang (wie die Index-Suche). Kein Fehler im Code; Test korrigiert.
- **Doppelte Menüzeilen:** Das Test-Objekt `PLACE` erbte per Spread den Alias von `ENTRY`. Eigene leere Aliasse gesetzt.
- **`acceptCompletion` liefert `false`:** CodeMirror nimmt eine Auswahl erst nach `interactionDelay` (75 ms) an; im Test in `waitFor` gelegt.
- **`getClientRects is not a function`:** jsdom misst keine Text-Bereiche; das Menü-Tooltip von CodeMirror braucht das. Ersatz mit leeren Maßen in `ui/test-setup.ts`, nur wenn jsdom ihn nicht hat.
- **Kontrolllauf ohne Wirkung:** Die Auffüllung überspringt große Einträge und nimmt danach kleinere – der kleine Kael-Eintrag passte ohne `@` immer noch hinein. Testwelt auf 700 kleine Einträge (je 44 Token, kleiner als Kael mit 94) umgestellt; Protokoll vor den bezahlten Läufen trocken geprüft.

### 2026-09-27 01:02 – [BEOBACHTUNG] Abnahme 3.5 mit echten Läufen

- 5 Läufe grok-4.7 (0,217 $, je ca. 26.600 Token Eingabe) über `api.flows.prepare_request`; Testwelt so gebaut, dass Kael nur mit `@` in den Kontext kommt. Blind bewertet durch Sonnet 5: alle 4 Texte mit `@Kael` nutzen Einzelheiten nur aus Kaels Eintrag (15 von 16), keine Widersprüche; Kontrolllauf ohne `@` ohne die drei körperlichen Einzelheiten, aber mit „Brot oder Salz“ statt Münzen – vermutlich aus dem Salzfisch-Handel der Testwelt (`spikes/at-verweis/README.md`).
- **Entscheidung im Autonomiebereich:** Das Menü filtert die ohnehin geladene Eintragsliste im Browser statt `GET …/search` je Tastendruck aufzurufen – ein Aufruf weniger je Zeichen, und die Index-Suche beantwortet ein leeres Suchwort (bloßes `@`) nicht. Festgehalten in `docs/architecture.md` Abschnitt 3 (`ui`).

### 2026-09-27 00:52 – [SESSIONSTART] Schritt 3.5 auf Anweisung „Neue Session: 3.5“

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 00:52) → Entscheidungs-Klasse. 3.5 empfiehlt Routine; Abgabe nicht möglich (Probelauf der Routine-Klasse offen) – Hinweis an den Eigentümer wegen des Wochenkontingents.
- **Kontextgröße:** Sitzungsabfrage meldet 0 Token zu Beginn; Grenze 200.000.
- **Kontingent:** Wochenlimit `allowed_warning`.
- Branch `claude/session-3-5-4oddll` auf `main` (`27fa6c0`, PR #12 gemergt).

### 2026-09-27 00:40 – [SESSIONENDE] Schritt 3.4 erledigt

- **Dauer:** Fortsetzung 00:11–00:40 UTC (Session seit 2026-09-26 22:06).
- **Bearbeitet:** 3.4 `[ERLEDIGT]`: Regel der Figuren-Schreibweise geschärft plus Erinnerung nach der Anweisung; Einstellung in der Oberfläche; 10 echte Läufe (0,413 $), blind bewertet: 0 eindeutige Verstöße (3.3: 20 in 15). FR-012 erledigt.
- **Erreichter Stand:** 324 Python-Tests, 42 Komponenten-Tests grün; OpenRouter-Guthaben laut Rechnung ca. 2,25 $.
- **Offen:** Pull Request für diesen Branch. Beobachtung: Die KI blendet Bewegung der Ich-Figur über Wahrnehmung über (2 fragliche Stellen).
- **Nächster Schritt:** neue Session – 3.5 `@`-Menü.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5 laut Sitzungsabfrage 00:40). Schritte oberhalb der Empfehlung: 1 (3.4 empfiehlt Routine). Abgegeben: blinde Bewertung an Unteragent mit Sonnet 5 (getrennte Instanz). Sitzungskosten gesamt laut Abfrage 18,51 $.
- **Kontextgröße:** 422.632 Token, über der Grenze 200.000 auf ausdrückliche Anweisung „Weiter hier“; kein weiterer Schritt in dieser Session.
- **Kontingent:** Wochenlimit `allowed_warning`.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Verwendung, Nächste Schritte). Drift-Prüfung: keine neuen ADRs; FR-012 → 3.4 erledigt; Modul-Liste unverändert; Reifegrade unverändert; Reaktiv-Quote 1/10; Phase 3 unverändert 9 Schritte; Blocker 0. Ablaufdaten-Register: kein Vorlauf erreicht. Archivierung: kein Trigger. Onboarding: nicht Quick-Start-relevant.

### 2026-09-27 00:25 – [BEOBACHTUNG] Regelverstoß: `git push -f` ohne Stopp

- Nach dem Aufteilen eines Mix-Commits (Kontext und Oberfläche waren versehentlich zusammen committet; eigener, noch nicht gepushter Commit) habe ich mit `git push -f` gepusht. `CLAUDE.md` Abschnitt 8, Kriterium 6 verlangt davor einen Stopp. Kein Schaden: Der vorherige Remote-Stand `b2b068b` ist Vorfahre des neuen Stands (über den Merge von PR #11), der Push war faktisch ein Vorspulen. Dem Eigentümer gemeldet. Künftig: normaler Push; `-f` nur nach Stopp und Freigabe.
- **Reibung:** ruff RUF001 verbietet den Halbgeviertstrich in Python-Strings – im Wortlaut der Regel durch Semikolon bzw. Punkt ersetzt. Die Sitzungsdatei des Probe-Skripts liegt jetzt außerhalb des Repos (Temp-Verzeichnis).

### 2026-09-27 00:11 – [SESSIONSTART] Fortsetzung mit 3.4 auf Anweisung „Weiter hier“

- **Abweichung:** Sessiongröße 382.149 Token über der Grenze 200.000; der Eigentümer hat ausdrücklich „Weiter hier“ angeordnet.
- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 00:11) → Entscheidungs-Klasse. 3.4 empfiehlt Routine (Hinweis an den Eigentümer).
- **Kontingent:** Wochenlimit `allowed_warning`.
- PR #11 gemergt (`dd84804`); Branch neu auf `main` gesetzt.

### 2026-09-26 23:05 – [SESSIONENDE] Schritt 3.3 erledigt

- **Dauer:** 22:06–23:05 UTC.
- **Bearbeitet:** 3.3 `[ERLEDIGT]` (ADR-022): `api.flows.writing`, SSE-Endpunkt, `GET /api/models`, `WritingPanel` in der Oberfläche; Probeschreiben mit 16 echten Anfragen (0,556 $), blind bewertet. FR-008, FR-009, FR-011 erledigt. Neuer Schritt D.6 (Reaktionszeit erkunden, Frist vor 4.8).
- **Erreichter Stand:** 322 Python-Tests (99 %, `api.flows.writing` 100 % Zeilen), 40 Komponenten-, 5 End-to-End-Tests; CI grün auf den Code-Commits. OpenRouter-Guthaben laut Rechnung ca. 2,66 $ (vorher ca. 3,22 $).
- **Offen:** Pull Request für diesen Branch. 3.4 muss die Figuren-Schreibweise deutlich schärfen (20 Verstöße in 15 Blöcken).
- **Nächster Schritt:** neue Session – 3.4 Figuren-Schreibweise.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 23:04). Schritte oberhalb der Empfehlung: 1 (3.3 empfiehlt Routine; Hinweis vorab). Abgegebene Teilarbeiten: blinde Kanon-Bewertung an Unteragent mit Sonnet 5 (getrennte Instanz, keine Routine-Abgabe). Sitzungskosten laut Abfrage 9,75 $.
- **Kontextgröße:** Sitzungsabfrage 23:04: 343.914 Token – über der Grenze 200.000. Zu Sessionbeginn meldete die Abfrage 0 Token; eine Prüfung während des einen Schritts fand nicht statt (Regel: nach jedem abgeschlossenen Schritt). Kein neuer Schritt in dieser Session.
- **Kontingent:** Wochenlimit weiterhin `allowed_warning`.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Reife, Verwendung, Nächste Schritte). Drift-Prüfung: ADR-022 → 3.3 und D.6 vorhanden; Reifegrade (Reaktionszeit, Kanon-Treue VORLÄUFIG, SSE validiert) passen zu ADR-022; Modul-Liste unverändert; FR-008/009/011 → 3.3 erledigt; Reaktiv-Quote 1/10 (ADR-013 bis ADR-022); Blocker 0; Phase 3 unverändert 9 Schritte. Ablaufdaten-Register: Vorlauf Guthaben ab 2026-10-22, noch nicht erreicht. Archivierung: kein Trigger. Onboarding: nicht Quick-Start-relevant (keine Änderung an Skripten, `.env.example`, Abhängigkeiten). Größen-Budget `project-context.md`: 338 Zeilen.

### 2026-09-26 23:00 – [ADR-ANGELEGT] ADR-022 Reaktionszeit – Ziel bleibt, Erkundung D.6

- Entscheidung des Eigentümers über das Frage-System: B. 3.3 erledigt mit dokumentiert verfehltem Teilkriterium.

### 2026-09-26 23:00 – [REIFEGRAD-WECHSEL] Reaktionszeit und Kanon-Treue VORLÄUFIG, SSE validiert

- NFR Reaktionszeit `[BELASTBAR]` → `[VORLÄUFIG]` (Ziel in 3.3 verfehlt, ADR-022). NFR Kanon-Treue `[OFFEN]` → `[VORLÄUFIG]` (erste Messung). Kommunikations-Grundmodus inkl. SSE bleibt `[BELASTBAR]`, jetzt durch Umsetzung validiert.

### 2026-09-26 22:55 – [BEOBACHTUNG] Probeschreiben 3.3 ausgewertet – Reaktionszeit verfehlt

- 16 echte Anfragen über den echten Server (15 vollständig, 1 Abbruch), 0,556 $; zwei Kapitel der Testwelt, 2 Szenen-Einstiege, je Kapitel eine Änderung, eine Verwerfung mit Neu-Schreiben per grok-4.6 (`spikes/probeschreiben/README.md`).
- Blinde Bewertung durch getrennte Instanz (Sonnet 5): 0 eindeutige Kanon-Widersprüche in beiden Kapiteln, 2 fragliche (eine vom Autor beim Redigieren korrigiert) → FR-011 und FR-008 erfüllt. Zitate stichprobenartig bestätigt.
- FR-009 belegt: Autor-Absätze, Änderungen und Verwerfungen bestimmten den Kontext der nächsten Anfrage. Abbruch: Log `ergebnis=abgebrochen`, Manuskript unverändert.
- **Verfehlt:** erstes Textstück grok-4.7 in 14 von 15 Läufen unter 60 s, einmal 77,1 s (5.271 Ausgabe-Token, überwiegend Vorab-Denken; `ai_gateway` bricht nach 90 s ab); grok-4.6 2 von 2 über 10 s (13,2 s, 15,8 s). Antwortkopf und „denkt nach …“ sofort. → Entscheidung des Eigentümers, 3.3 `[WARTET-AUF-FREIGABE]`.
- **Nebenbefund 3.4:** 20 Verstöße gegen die Figuren-Schreibweise in 15 Blöcken, darunter wörtliche Rede der Ich-Figur → Notiz an 3.4.
- **Reibung:** `__Host-`-Cookie ist `Secure`; httpx sendet es über `http://localhost` nicht – Probe-Skript setzt den Cookie-Kopf selbst (Sitzungsdatei vor dem Commit gelöscht). Kapitel-Exporte als `.txt`, weil der Kapiteltext eigene H1-Überschriften trägt (markdownlint MD025). `pkill -f` mit dem Server-Befehl als Muster beendete auch die eigene Shell – Server-Stopp künftig über die Aufgaben-Kennung.

### 2026-09-26 22:15 – [BEOBACHTUNG] 3.3 vorbereitet – Arbeitsweise per Frage-System entschieden

- **Übernahme:** übernommener KI-Text wird ans Kapitelende angehängt und sofort gespeichert (nicht an der Cursor-Position) – die nächste Fortsetzung knüpft am Ende an.
- **Szenen-Einstieg:** im laufenden Kapitel; Formular über dem Editor (Ort und Figuren aus dem Kanon, Ziel frei); der erste Absatz ist ein Vorschlag wie jeder KI-Text.
- **Probeschreiben (FR-008, FR-011, Reaktionszeit):** größerer Umfang, ca. 0,80 $ – zwei Kapitel mit je 6–8 Fortsetzungen an der Testwelt „Die Salzmark“, grok-4.7, dazu Zeitmessung mit grok-4.6; blinde Bewertung durch getrennte Instanz wie in 3.2.
- **Umfang Modellwechsel:** Das Akzeptanzkriterium „Abbruch und Modellwechsel jederzeit“ (ADR-013) verlangt schon in 3.3 eine Modellwahl je Anfrage. Umgesetzt wird nur: Modell je Anfrage aus der festen Modellreihenfolge und `GET /api/models` (Grobvertrag-Gruppe „Modelle“, additiv). Speicherung der Wahl je Geschichte, Token- und Kostenanzeige bleiben in 3.9.
- **Schlüssel:** `OPENROUTER_API_KEY` ist jetzt gesetzt (nur Vorhandensein geprüft) – Umbenennung aus der letzten Session erledigt.

### 2026-09-26 22:07 – [SESSIONSTART] Schritt 3.3 auf Anweisung „neue session 3.3“

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 22:07) → Entscheidungs-Klasse.
- **Kontingent:** Sitzungsabfrage meldet das Wochenlimit mit Status `allowed_warning` (Zurücksetzung sonntags 10:00 MESZ) – Warnschwelle erreicht.
- **Kontextgröße:** Sitzungsabfrage meldet 0 Token (Wert zu Sessionbeginn noch nicht gefüllt).
- **Ausgangsstand:** PR #10 gemergt (`59e5e21`), Branch `scp/affectionate-cori-ms2a2h` steht auf `main`. Keine aktiven Blocker, keine offenen STOPP-Situationen.
- **Klasse:** 3.3 empfiehlt Routine, läuft auf Entscheidung (Routine-Klasse ohne Probelauf, keine Abgabe möglich; Hinweis an den Eigentümer).

### 2026-09-26 22:02 – [SESSIONENDE] Schritte 3.1 und 3.2 erledigt

- **Dauer:** 20:57–22:02 UTC (Phasenabschluss 2, 3.1 ab 21:27, 3.2 ab 21:48).
- **Bearbeitet:** 3.2 `[ERLEDIGT]`: `ContextBuilder`, Präzisierung des Verfahrens durch den Eigentümer, Abnahme FR-003/FR-004 mit 4 echten Läufen (grok-4.7, ca. 0,12 $), blind bewertet. FR-001, FR-003, FR-004 erledigt; Teilkriterium von FR-002 belegt.
- **Erreichter Stand:** 297 Python-Tests, gesamt 99 %+, `context` 100 % Zeilen und Zweige (kritischer Pfad ≥ 90 % lokal geprüft). Adapter aus 3.1 erstmals gegen den echten Anbieter gelaufen. OpenRouter-Guthaben laut Abfrage vor den Läufen 3,34 $, danach ca. 3,22 $.
- **Offen:** Pull Request für diesen Branch. Umgebungsvariable `KEY` → `OPENROUTER_API_KEY` umbenennen (Eigentümer, Umgebungs-Einstellungen). 3.4: Figuren-Schreibweise schärfen (Nebenbefund).
- **Nächster Schritt:** neue Session – 3.3 Weiterschreiben mit Streaming und Szenen-Einstieg (`api.flows` nach ADR-020).
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 21:59). Schritte oberhalb der Empfehlung in dieser Session: 2 (3.1 und 3.2 empfehlen Routine; jeweils Hinweis vorab). Abgegebene Teilarbeiten: Bewertung Phasenende, Sicherheitsprüfung 3.1 und Bewertung der Abnahme 3.2 an Unteragenten mit Sonnet 5 (getrennte Instanzen, keine Routine-Abgabe).
- **Kontextgröße:** Sitzungsabfrage 21:59 meldet unverändert 358.125 Token und 13,19 $ wie um 21:50 – die Werte wurden seitdem nicht aktualisiert, tatsächlich höher. Weit über der Grenze 200.000 auf ausdrückliche Anweisung „3.2 hier“; kein weiterer Schritt in dieser Session.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Nächste Schritte). Drift-Prüfung: keine neuen ADRs; Präzisierung in `docs/architecture.md` Abschnitt 3 verweist auf die Entscheidung des Eigentümers (Logbuch 21:50); Reifegrad `context` passt; Modul-Liste unverändert; Reaktiv-Quote 1/10; Phase 3 unverändert 9 Schritte; Blocker 0; FR-001/003/004 → 3.2 erledigt. Ablaufdaten-Register: kein fälliger Vorlauf. Archivierung: kein Trigger. Onboarding: nicht berührt.

### 2026-09-26 22:00 – [REIFEGRAD-WECHSEL] context durch Umsetzung validiert

- Schritt 3.2 erledigt; `context` bleibt `[BELASTBAR]`, jetzt „durch Umsetzung validiert“, FR-003/FR-004 an echten KI-Texten belegt.
- **Klasse:** 3.2 empfiehlt Routine, lief auf Entscheidung (Hinweis vorab).

### 2026-09-26 21:58 – [PROBLEM-GELÖST] Reibungen in 3.2

- **Trenner nicht mitgezählt:** Die Budget-Rechnung zählte die `\n\n` zwischen Bausteinen nicht; die Garantie „nie überschritten“ hing am Aufrunden. Jetzt zählt jeder Baustein seinen Trenner mit.
- **Test erwartete Seiten bei 500 Token Budget:** Bei so kleinem Budget passt kein ganzer Absatz – das Verhalten ist gewollt, der Test prüft die Seiten erst ab 1.500 Token.
- **Modulgrenze:** `context` darf `ai_gateway` nicht kennen – eigene Nachrichtenliste (`PromptMessage`), Übersetzung in `api` (3.3).

### 2026-09-26 21:57 – [BEOBACHTUNG] Abnahme 3.2 mit echten Läufen

- 4 Läufe grok-4.7 an der Testwelt „Die Salzmark“ plus „Runenklinge“; Schätzung 18.012 Token, Anbieter zählte 16.194 (Schätzung mit Sicherheitsabschlag liegt sicher darüber). Kosten ca. 0,12 $.
- Blinde Bewertung durch getrennte Instanz (Sonnet 5): FR-003 0 Widersprüche in 2 Texten (Blut vor dem Schnitt, danach kalt und unbenutzbar), FR-004 0 in 2 Texten (Falle „Drach 397 schon Vogt?“ beide Male richtig aufgelöst). Nebenbefund: 1 von 4 Texten schreibt Handlung und Rede der Ich-Figur („Ich drehte mich um.“, „Ich seh ihn.“) → Notiz an 3.4. Zitate stichprobenartig in den Dateien bestätigt.

### 2026-09-26 21:50 – [BEOBACHTUNG] 3.2 vorbereitet – Verfahren präzisiert, Schlüssel gefunden

- **Korrektur zu 3.1:** Ein OpenRouter-Schlüssel ist in der Umgebung gesetzt – unter dem Namen `KEY` aus dem Spike von Phase 1, nicht `OPENROUTER_API_KEY`. In 3.1 wurde nur nach den neuen Namen gesucht; die Aussage „kein Schlüssel in der Umgebung“ war falsch. Geprüft nur Vorhandensein (Länge 73, Hash-Präfix fbc5c79b) und Schlüssel-Abfrage: Grenze 5 $, verbraucht 1,66 $, Rest 3,34 $. Empfehlung an den Eigentümer: Variable in der Umgebung auf `OPENROUTER_API_KEY` umbenennen.
- **Offene Punkte des Kontext-Verfahrens** (nicht in ADR-003 oder Architektur festgelegt) per Frage-System entschieden: Grundgerüst (Welt, Regeln, Zeitlinie, geführte Figuren) immer plus Auffüllen mit weiteren Kanon-Einträgen; bei zu kleinem Budget ablehnen mit Hinweis; Akzeptanz FR-003/FR-004 mit echten Läufen (grok-4.7, getrennte bewertende Instanz). Festgehalten in `docs/architecture.md` Abschnitt 3 (`context`).
- **Klasse:** 3.2 empfiehlt Routine, läuft auf Entscheidung (Hinweis an den Eigentümer).

### 2026-09-26 21:48 – [SESSIONSTART] Fortsetzung mit 3.2 auf Anweisung „3.2 hier“

- **Abweichung:** Sessiongröße 358.125 Token über der Grenze 200.000; der Eigentümer hat ausdrücklich „3.2 hier“ angeordnet.
- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 21:50) → Entscheidungs-Klasse.
- PR #9 gemergt (`2a8d877`); Branch neu auf `main` gesetzt.

### 2026-09-26 21:46 – [SESSIONENDE] Phase 2 abgeschlossen, Schritt 3.1 erledigt

- **Dauer:** 20:57–21:46 UTC; Fortsetzung mit 3.1 ab 21:27.
- **Bearbeitet:** Phasenabschluss 2 (ADR-020, PR #8 gemergt); 3.1 `[ERLEDIGT]` mit ADR-021 (Observability), Sicherheitsprüfung durch getrennte Instanz mit Nachprüfung, zwei optionale Härtungen nach Wahl des Eigentümers.
- **Erreichter Stand:** `ai_gateway` mit `ModelProvider` und OpenRouter-Adapter; FR-025 erledigt. 273 Python-Tests, gesamt 99,8 %, `ai_gateway` 100 % Zeilen. Kein echter Anbieter-Aufruf (kein Schlüssel in der Umgebung).
- **Offen:** Pull Request für diesen Branch (Merge nach grüner CI und Zustimmung des Eigentümers). Für 3.3 wird `OPENROUTER_API_KEY` in der Umgebung der Cloud-Session gebraucht.
- **Nächster Schritt:** neue Session – 3.2 `context` (Kontext-Zusammenstellung unter Token-Budget, kritischer Pfad ≥ 90 %).
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 21:43). Schritte oberhalb der Empfehlung: 1 (3.1 empfiehlt Routine; Hinweis vorab). Abgegebene Teilarbeiten: Bewertung Phasenende und Sicherheitsprüfung 3.1 an Unteragenten mit Sonnet 5 (getrennte Instanzen, keine Routine-Abgabe).
- **Kontextgröße:** 323.754 Token laut Sitzungsabfrage – über der Grenze 200.000 auf ausdrückliche Anweisung „3.1 hier“; kein weiterer Schritt. Sitzungskosten laut Abfrage ca. 11,02 $. Wochenlimit `allowed_warning`, Zurücksetzung 2026-09-27 10:00 MESZ.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Voraussetzung `OPENROUTER_API_KEY`, Nächste Schritte). Drift-Prüfung: ADR-021 → 3.1 und 3.9 vorhanden; Modul-Liste unverändert; Reifegrad `ai_gateway` und Observability passen zu ADR-013/ADR-021; Reaktiv-Quote 1/10 über ADR-012..021; Phase 3 unverändert 9 Schritte; Blocker 0; FR-025 → 3.1 erledigt. Ablaufdaten-Register: kein fälliger Vorlauf (Guthaben-Vorlauf ab 2026-10-22). Archivierung: kein Trigger. Onboarding: `.env.example` und README-Voraussetzungen ergänzt, Quick-Start-Befehle unverändert und `OPENROUTER_API_KEY` für Start und Tests nicht nötig (`api` nutzt `ai_gateway` noch nicht) – keine erneute Worktree-Validierung, Begründung hiermit festgehalten.

### 2026-09-26 21:44 – [REIFEGRAD-WECHSEL] ai_gateway durch Umsetzung validiert

- Schritt 3.1 erledigt; `ai_gateway` bleibt `[BELASTBAR]`, jetzt „durch Umsetzung validiert“ – mit der Einschränkung, dass nur simulierte Antworten geprüft sind; der echte Aufruf folgt in 3.3.
- **Klasse:** 3.1 empfiehlt Routine, lief auf Entscheidung (Hinweis vorab; Beförderung Observability verlangte Entscheidung).

### 2026-09-26 21:42 – [PROBLEM-GELÖST] Reibungen in 3.1

- **`raise … from None` reicht nicht:** Es blendet die Kette nur in der Anzeige aus; `__context__` hält die httpx-Exception samt Request und Authorization-Header weiter fest. Lösung: Fehler außerhalb des `except`-Blocks auslösen; Tests prüfen die ganze Kette (`chained(error) == [error]`).
- **Test bestand aus falschem Grund:** Der erste Test zur Zeilengrenze schickte die lange Zeile samt Umbruch in einem Stück; sie scheiterte erst am JSON-Parser. Aufgefallen an der ungedeckten Zeile im Coverage-Bericht. Lösung: Prüfung auch für vollständige Zeilen, Test sendet in Stücken und prüft die Fehlermeldung genau.
- **Kein Plugin für asynchrone Tests:** statt einer neuen Abhängigkeit `asyncio.run` in den Tests.
- **Ruff:** `S105` bei einer Konstante mit „SECRET“ im Namen (umbenannt), Gedankenstrich in Docstrings (`RUF002`).

### 2026-09-26 21:40 – [SICHERHEITSPRÜFUNG] Getrennte Instanz zu 3.1

- **Instanz:** Unteragent mit eigenem Kontext und anderem Modell (Claude Sonnet 5); nur Code und Tests von `ai_gateway`, Architektur-Abschnitte 4 und 6, ADR-021; eigene Proben gegen httpx-Exceptions.
- **Befund 1 (mittel):** `raise … from exc` ließ den httpx-Request mit Authorization-Header über die Exception-Kette erreichbar → behoben (`3cb3821`). **Befund 2 (mittel):** JSON-Fehler hielt die rohe Antwortzeile → behoben. **Befund 3 (niedrig-mittel, über dem Niveau):** keine Obergrenze für Zeilen des Ereignisstroms → vom Eigentümer als optional gewählt, umgesetzt (1.000.000 Zeichen). **Befund 4 (niedrig/optional):** Log-Fälschung über Modell- oder Anbieternamen → vom Eigentümer gewählt, umgesetzt (Zeichen bereinigt).
- **Nachprüfung** durch dieselbe Instanz: alle vier behoben, mit eigenen Proben belegt; keine neuen Befunde. Keine Befunde zu TLS, fester URL, Log-Inhalt, Fehlermeldungen, Retry und Timeouts, `repr`.
- **Nicht geprüft:** Umgang von `api` mit den Fehlern (kommt mit 3.3), echter Anbieter.

### 2026-09-26 21:30 – [ADR-ANGELEGT] ADR-021 – Beginn 3.1

- Eigentümer (Frage-System): Option A – Log-Zeile je KI-Anfrage `[BELASTBAR]`, Verbrauchsspeicherung in 3.9. Observability/Logging befördert, Metriken bleiben `[VORLÄUFIG]` (Landeplatz 3.9). `[OPERATIV]`, geplant laut Notiz an 3.1; Reaktiv-Quote 1/10.
- 3.1 `[IN ARBEIT]`. Anfrageform aus dem Spike `spikes/modell-eignungstest/lauf.py`: `reasoning: {"effort": "low"}` für grok-4.7, grok-4.6, qwen3.8-max (Reasoning Pflicht), `usage: {"include": true}`; Anbieter-Ausschluss (StreamLake) nur für deepseek-Modelle nötig – Konfiguration vorgesehen, für die drei Modelle leer.
- In dieser Umgebung ist kein OpenRouter-Schlüssel gesetzt (nur Vorhandensein geprüft): Adapter wird mit simulierten Antworten (`httpx.MockTransport`) getestet, ein echter Aufruf folgt mit 3.3.

### 2026-09-26 21:27 – [SESSIONSTART] Fortsetzung mit 3.1 auf Anweisung „3.1 hier“

- **Abweichung:** Sessiongröße 239.206 Token über der Grenze 200.000; der Eigentümer hat ausdrücklich „3.1 hier“ angeordnet (`CLAUDE.md` Abschnitt 0, Ausnahme „weiter hier“).
- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 21:27) → Entscheidungs-Klasse; 3.1 empfiehlt Routine – Hinweis an den Eigentümer gegeben (Wochenkontingent `allowed_warning`); keine Abgabe ohne Probelauf. Beförderung der Observability (Auslöser 4) verlangte ohnehin die Entscheidungs-Klasse.
- PR #8 gemergt (`25df654`); Branch `scp/affectionate-euler-piciei` auf `main` vorgespult.

### 2026-09-26 21:06 – [SESSIONENDE] Phase 2 abgeschlossen

- **Dauer:** 20:57–21:06 UTC.
- **Bearbeitet:** Phasenabschluss 2 – Bewertung durch getrennte Instanz, Stellungnahme, `ENTSCHEIDUNG ERFORDERLICH`, ADR-020 (weiterbauen); Vision-Re-Derivations-Pass; Onboarding-Re-Validation; Archivierung Fahrplan Phase 2 und Logbuch-Verdichtung; `data/index.sqlite` aus dem Git-Index genommen; Pflichtnotiz `api.flows` an 3.3.
- **Vision-Abgleich (Befund):** Jedes Vision-Element (Kernidee, Zielbild mit fünf Szenarien, sechs Erfolgskriterien, Abgrenzungen, harte Randbedingungen, weiche Präferenzen) hat eine Schritt-ID oder eine Descope-ADR; jede Muss-Anforderung hat einen existierenden Schritt (Phase 3, 4.8, D.4) oder ist erledigt (FR-002, 005, 007, 016) bzw. verworfen (FR-006, ADR-009). Keine `[VERSCHOBEN]`-Zeile mit erreichtem Ziel (V.1–V.5 → 5.5). Keine verwaisten Elemente, keine `TODO` im Code.
- **Erreichter Stand:** Phase 3 „Schreiben mit KI“ bereit; kein aktiver Schritt.
- **Offen:** Pull Request für diesen Branch (Merge nach grüner CI und Zustimmung des Eigentümers).
- **Nächster Schritt:** neue Session – 3.1 `ai_gateway` (Anbieter-Schnittstelle, OpenRouter-Adapter).
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 21:05). Schritte oberhalb der Empfehlung: 0 (Phasenabschluss verlangt Entscheidung). Abgegebene Teilarbeiten: Bewertung an Unteragenten mit Sonnet 5 (getrennte Instanz, keine Routine-Abgabe).
- **Kontextgröße:** 190.131 Token laut Sitzungsabfrage – knapp unter der Grenze 200.000; kein neuer Schritt in dieser Session. Sitzungskosten laut Abfrage ca. 3,70 $. Wochenlimit `allowed_warning`, Zurücksetzung 2026-09-27 10:00 MESZ.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Nächste Schritte); project-context Status auf Phase 3. Drift-Prüfung: ADR-020 → 3.3 vorhanden, ADR-015 bis 019 → 2.1–2.7 im Archiv; Modul-Liste unverändert; Reifegrade unverändert und passend zu ADR-020 (keine Reifegrad-Wirkung); Reaktiv-Quote 1/10 über ADR-011..020; Phase 3 unverändert 9 Schritte; Blocker 0; Anforderungen unverändert. Ablaufdaten-Register: kein fälliger Vorlauf (Guthaben-Vorlauf ab 2026-10-22). Archivierung: Fahrplan Phase 2 → `docs/archiv/fahrplan-phase-2.md`, Logbuch Phase 2 → `docs/archiv/logbuch-phase-2.md` (Phase-1-Sessionende ins Phase-1-Archiv). project-context 338 Zeilen.

### 2026-09-26 21:05 – [PHASEN-WECHSEL] Reflexion Phase 2 (UMSETZUNG) → Phase 3 (UMSETZUNG)

- **Gelernt:** Die Grobverträge aus 1.4 trugen – `storage`, `canon`, `manuscript`, `api`, `ui` ohne Umbau umgesetzt; Modulgrenzen an den Imports eingehalten (getrennte Instanz, ADR-020).
- **Gelernt:** Sicherheit nach ASVS mit Kapitelnummer je Maßnahme machte die Prüfungen durch getrennte Instanzen schnell und die Obergrenze (ADR-006) handhabbar; optionale Härtungen wurden dem Eigentümer vorgelegt statt still umgesetzt.
- **Gelernt:** Browser-Proben brauchen echte Wege: `page.evaluate` umgeht die CSP; nur ein eingeschleustes Inline-Skript belegt sie.
- **Kippende Annahmen:** `api` braucht Zugangsdaten in `storage` und Pwned Passwords (ADR-018, reaktiv); Editor-Bündel zu groß ohne Nachladen; Umfang von 2.6 wuchs um Einrichtung, Passwortwechsel und Sitzungsübersicht (ADR-017).
- **Reifegrad:** `storage`, `canon`, `manuscript`, `api`, `ui` und HTTP/JSON durch Umsetzung validiert; `context`, `ai_gateway`, SSE nur durch Spikes – Validierung in Phase 3.
- **ADRs der Phase:** 015–020; reaktiv 1 (018); Quote 1/10.
- **Neue Erkundungsbedarfe:** keine vor 3.1; beobachten: Wachstum von `api` in 3.3 (`api.flows`, ADR-020), Tempo von `storage` bei großen Geschichten (D.4), Sitzungen im Speicher bei langem Streaming.
- **Methodik-Lehren:** Sessions liefen dreimal weit über die Kontextgrenze (bis ca. 500.000 Token) auf ausdrückliche Anweisung; Phasenabschluss deshalb in eigener Session. Hygiene-Lücke: `data/index.sqlite` rutschte trotz `.gitignore` in den Git-Index – beim Stagen Dateilisten prüfen. Worktree-Validierung biegt den Pre-Commit-Hook um (zweimal) – Runbook ergänzt.
- **Details:** [`docs/archiv/logbuch-phase-2.md`](archiv/logbuch-phase-2.md)

### 2026-09-26 21:04 – [ADR-ANGELEGT] ADR-020

- Pflichtfrage Phasenende 2: Eigentümer wählt Empfehlung A – weiterbauen, `data/index.sqlite` aus dem Git-Index nehmen, Pflichtnotiz „Abläufe in `api.flows`“ an 3.3. `[STRATEGISCH]`; Bewertung der getrennten Instanz und Stellungnahme im ADR nebeneinander. Die in ADR-018 angekündigte Prüfung „Gott-Modul“ ist damit erfolgt.

### 2026-09-26 21:01 – [PROBLEM-GELÖST] Pre-Commit-Hook nach Worktree-Validierung

- Erster Commit der Session scheiterte: `` `pre-commit` not found ``. Ursache: `pre-commit install` (Quick Start) und `scripts/session-start.sh` im Worktree haben `.git/hooks/pre-commit` auf die venv des Worktrees gesetzt; der Worktree war schon entfernt. Lösung: im Haupt-Checkout `uv run pre-commit install`. Zweites Auftreten nach 2.1 → Runbook-Eintrag um die Pflicht nach jeder Worktree-Validierung ergänzt.

### 2026-09-26 21:00 – [ONBOARDING-VALIDATION] Phasenabschluss 2 (Trigger 3)

- **Form (Klasse M):** frischer Worktree von `646ddfe` im Scratchpad, eigenes Datenverzeichnis; README-Quick-Start exakt wie dokumentiert: `uv python install 3.14.7`, `uv sync --frozen`, `npm ci` (0 Schwachstellen), `pre-commit install`, `skriptorium-einrichtung` (Exit 0; Ausgabe mit dem Einrichtungscode nicht angezeigt), `npx vite build`, uvicorn.
- **Ergebnis:** `/api/health` → `{"status":"ok"}`; `/` → 200 (Oberfläche); `/api/worlds` ohne Sitzung → 401; Server-Log ohne Warnung. `pytest --cov`: 224 bestanden, 99,94 %; `vitest --coverage`: 32 bestanden, 99,02 % Zeilen. Smoke-Test `scripts/session-start.sh` im Worktree: Exit 0.
- **Befund:** keiner im Onboarding-Pfad. End-to-End-Tests nicht im Worktree wiederholt (laufen im CI-Job End-to-End). Nebenbefund: `data/index.sqlite` liegt im Git-Index, obwohl `/data/` ignoriert ist (leerer Index, seit `53071f0`) – Behandlung nach der Bewertung der getrennten Instanz.

### 2026-09-26 20:57 – [SESSIONSTART] Phasenabschluss 2

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 20:57) → Entscheidungs-Klasse. Der Phasenabschluss enthält einen `ENTSCHEIDUNG ERFORDERLICH`-Block (Eskalations-Auslöser 1) – Klasse passt, kein Stopp.
- **Kontextgröße:** 0 Token laut Sitzungsabfrage (neue Session). Wochenlimit `allowed_warning`, Zurücksetzung 2026-09-27 10:00 MESZ.
- PR #7 gemergt (`646ddfe`); Branch `scp/affectionate-euler-piciei` steht auf `main`.
- **Vorhaben:** Pflichtfrage „Weiterbauen, umbauen oder neu aufsetzen“ mit getrennter Instanz; Vision-Re-Derivations-Pass gegen `docs/vision.md` und `docs/requirements.md`; Onboarding-Re-Validation (Trigger 3); nach der Entscheidung ADR, Archivierung von Phase 2, Logbuch-Verdichtung.

### 2026-09-26 22:00 – [PHASEN-WECHSEL] Reflexion Phase 1 (ERKUNDUNG) → Phase 2 (UMSETZUNG)

- **Gelernt:** Kanon-Treue hängt am Vorab-Denken der Modelle, nicht an der Kontextmenge – 8.000 bis 17.600 Token ohne Unterschied; Modelle ohne Reasoning machen 2–3× mehr Fehler.
- **Gelernt:** grok-4.7 führt bei Kanon, Sprache und allen vier Genres; Preis ist die Wartezeit (15–50 s). Gemini hat nachgelassen – Bestätigung der Vision-Sorge um Filter und Modellverfügbarkeit.
- **Gelernt:** Die Figuren-Schreibweise (Autor führt Ilka) bricht unter Genre-Druck am häufigsten – Schwerpunkt für Prompt und Tests in 3.3/3.4.
- **Kippende Annahmen:** „erstes Textstück in 5 s" (ersetzt, ADR-013); „Import aus TypingMind/Notion" (zunächst Markdown, ADR-012); „Qwen als Ausweich" (grok-4.6, ADR-011).
- **Reifegrad:** Architektur vollständig `[BELASTBAR]` außer Observability, Stateful, Sicherheit/Betrieb (Phase 3/4).
- **ADRs der Phase:** 010–014, alle geplant, 0 reaktiv.
- **Neue Erkundungsbedarfe:** keine vor Phase 2; beobachten: Budget oberhalb 17.600 Token (3.2/D.4), Import-Zeit gegen 30 Minuten (4.8), Filterpolitik von xAI (ADR-011).
- **Methodik-Lehren:** Prüf-Aufträge ohne Platzhalter formulieren (zwei Pannen); Kriterien vor der Bewertung fixieren und Eichtexte mitlaufen lassen (hat die Vergleichbarkeit über Runden belegt); Sitzungsabfrage meldete Kontextgröße erst spät.
- **Details:** [`docs/archiv/logbuch-phase-1.md`](archiv/logbuch-phase-1.md)

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
