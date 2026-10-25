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

Das Logbuch beginnt mit der ersten regulären Session nach dem Initialisierungs-Commit (Modus 2, abgeschlossen 2026-09-26). Verlauf und Begründungen der Initialisierung stehen in `docs/decisions.md` (ADR-001 bis ADR-009). Phasen 1 bis 8 sind verdichtet; Details in `docs/archiv/logbuch-phase-1.md` bis `docs/archiv/logbuch-phase-8.md`.

---

<!-- ANCHOR:eintraege -->
## Einträge (neueste oben)

### 2026-10-25 19:01 MEZ – [SESSIONENDE] 9.5 erledigt, 9.6 entschieden und umgesetzt

- **Dauer:** 18:34 bis 19:01 MEZ (Cloud-Session, Branch `claude/festive-hawking-shngn2`).
- **Bearbeitet:** 9.5 `[ERLEDIGT]` (Bestätigung des Eigentümers); 9.6 Vorlage → ADR-095, V.42 (Landeplatz 9.15); 9.6 umgesetzt in `storage`, `canon`, `manuscript`, `api`, `ui` (Commits `1272662`, `0ec0b8f`, `0eb1767`).
- **Stand:** Phase 9, 5 von 15; 9.6 `[IN ARBEIT]` – lokal fertig: pytest 956, vitest 506, Playwright 15/15, ruff, mypy --strict, bandit, eslint, prettier, tsc grün. Keine aktiven Blocker, keine offenen STOPP-Situationen.
- **Offen:** Pull Request zu 9.6 (CI) nach Freigabe des Eigentümers; Einspielen von 9.5 und 9.6 auf dem VPS (nur vom Mac aus, ADR-025); Prüfung von 9.6 durch den Eigentümer. Probelauf der Routine-Klasse mit Sonnet 5.5 (Wechsel gegenüber Sonnet 5, `CLAUDE.md` Abschnitt 0) – Fahrplan-Schritt dafür vom Eigentümer zu entscheiden. D.11 bis 2026-10-31, D.19 bis 2026-11-02.
- **Nächster Schritt:** Pull Request 9.6, nach Einspielen Prüfung durch den Eigentümer; dann 9.7 (Vorlage, Entscheidungs-Klasse).
- **Modell-Bilanz:** Start auf Routine-Klasse (Sonnet 5.5) – nur Sessionstart, kein Schritt; nach Wechsel durch den Eigentümer Entscheidungs-Klasse (Opus 5.5, eingestellt und bedient laut `get_session`). 9.6 empfiehlt Entscheidung → 0 Schritte oberhalb der Empfehlung. Statuspflege von 9.5 und Doku nicht abgegeben: kleiner Umfang, Kontext geladen; Abgabe an Sonnet 5.5 ohne eigenen Probelauf ohnehin nicht gedeckt.
- **Kontextgröße:** `get_session` meldete einmal 174.394 Token (nach dem Modellwechsel) und danach unverändert denselben Wert – der Wert wird offenbar nicht laufend aktualisiert; tatsächliche Größe zum Sessionende vermutlich über der Grenze von 200.000. Kein neuer Schritt begonnen; 9.6 wurde als laufender Schritt zu Ende gebaut.
- **Sessionende-Prüfungen:** README synchron (5 von 15, 9.5 ✅, 9.6 🟠, 0 Blocker). Drift: ADR-095 → 9.6 vorhanden; V.42 → 9.15 in Übersicht und „Zu tun“; Modul-Liste unverändert; Reaktiv-Quote 0 / 10 (ADR-086–095); keine `[BLOCKIERT]`-Schritte; Phase 9 weiter 15 Schritte; Schnittstellen in `docs/architecture.md` Abschnitt 4 nachgetragen, Ablage in Abschnitt 7, Verworfenes in 8. Projektkontext-Status auf „ab 9.6“. Ablaufdaten-Register: D.19 läuft; D.1 ab 2026-11-05 noch nicht im Vorlauf. Archiv: Logbuch ca. 560 Zeilen, project-context 349 – kein Trigger. Quick-Start nicht berührt (keine Skripte, Abhängigkeiten, `.env`). Kategorie 6 nicht berührt (keine Anmeldung, Secrets oder personenbezogenen Daten; Logs nennen weiter keine Anweisung).

### 2026-10-25 – [BEOBACHTUNG] Umsetzung 9.6: Tests prüfen die genaue Folge der Anfragen

- Sieben bestehende Komponenten-Tests schlugen fehl, weil die große Ansicht jetzt die Herkunft lädt (zusätzliche `GET …/origin`) und `calls.at(-1)` bzw. `calls` gleich `[]` prüften; ein Test fand „kein Fake“ doppelt (Fehlertext der Herkunft). Gelöst mit `withoutOrigins(calls)` in `ui/fake-api.ts` und genauerem Muster; außerdem schickt das Hochladen `herkunft` nur mit, wenn es eine gibt – der Körper beim reinen Hochladen bleibt wie bisher.
- `test_security.py` zählt die Routen fest (67 → 70, geschützt 64 → 67) – gewollt, prüft, dass jede neue Route ohne Sitzung abgewiesen wird.
- Ein bestehender Speicher-Test (Löschen schlägt fehl) traf nach der Änderung zuerst die Begleitdatei; der Fehlerweg des Bildes selbst blieb ungetestet (Abdeckung 99 % statt 100 % in `store.py`) – eigener Test ergänzt.

### 2026-10-25 – [ADR-ANGELEGT] ADR-095 Herkunft erzeugter Bilder in einer Begleitdatei (9.6)

- Vorlage mit drei Optionen (Kopf / Begleitdatei / zentrales Verzeichnis), Heuristiken Teil 1–3 geladen. Eigentümer per Auswahlfragen jeweils die Empfehlung: B Begleitdatei, aufklappbar mit „Mit dieser Anweisung neu erzeugen“, Kosten mit festhalten, Nebenfrage KI-Text „Später planen“ → V.42 (Landeplatz 9.15).
- Feststellung bei der Vorlage: Der Suchindex liest jede `.md`-Datei unter dem Datenverzeichnis (`storage/store.py`, `rglob("*.md")`) – deshalb Endung `.herkunft.yml`.
- Reaktiv-Quote 0 / 10 (ADR-086–095).

### 2026-10-25 – [BEOBACHTUNG] Modellwechsel auf die Entscheidungs-Klasse; 9.5 erledigt; 9.6 begonnen

- **Modell:** Eigentümer wechselt per `/model` auf `claude-opus-5-5`; `get_session` bestätigt eingestellt und bedient `claude-opus-5-5` → Entscheidungs-Klasse. Kontextgröße jetzt feststellbar: 174.394 Token (Grenze 200.000).
- **9.5:** Eigentümer im Chat: „9.5 ist bestätigt“. Code lag bereits auf `main` (PR #184, `e886916`) → `[ERLEDIGT]`, Phase 9: 5 von 15. Ob 9.5 auf dem VPS eingespielt ist, ist hier nicht belegt (zuletzt eingespielt laut Projektkontext `2586ef8`).
- **9.6:** auf `[IN ARBEIT]`. Befund für die Vorlage: Erzeugen speichert nichts (ADR-077), die Übernahme läuft wie ein Hochladen (Browser verkleinert, Server prüft und legt ab) – der Server sieht beim Ablegen weder Modell noch Anweisung; Herkunft muss die Oberfläche mitschicken. Drei Ablageorte mit verschiedenen Kopffeldern: `bilder` (Liste von Dateinamen, Eintrag), `karten` (Liste von Abbildungen mit `name`, `datei`, `marken`, Welt), `titelbild` (ein Dateiname, Geschichte).

### 2026-10-25 18:34 MEZ – [SESSIONSTART] Neue Cloud-Session ohne Auftrag

- **Modell (Quelle: `get_session`):** eingestellt `claude-sonnet-5-5`, bedient `claude-sonnet-5-5` → Routine-Klasse. Hinweis: `docs/project-context.md` Abschnitt 6 nennt „Claude Sonnet 5“ mit bestandenem Probelauf (2026-09-28); Sonnet 5.5 ist ein Modellwechsel innerhalb der Klasse, der Probelauf ist nach `CLAUDE.md` Abschnitt 0 zu wiederholen (offen, kein Fahrplan-Schritt angelegt – dem Eigentümer vorzulegen).
- **Kontextgröße:** nicht feststellbar – `get_session` meldet `used_tokens` 0 (`max_tokens` 1.000.000); Regel zur Sessiongröße entfällt.
- **Wiedereinstieg:** Mindest-Lektüre vollständig (Projektkontext, Logbuch ab `[SESSIONENDE]` 2026-10-22, Fahrplan „Aktueller Stand“ und Phase 9, Architektur 1/2/9, Entscheidungen Teil A und C, aktive Blocker). Keine aktiven Blocker, keine offenen STOPP-Situationen, `main` = Stand dieses Branchs (`8a6b4d4`, PR #186). Phase 9: 4 von 15 erledigt; 9.5 umgesetzt, Prüfung durch den Eigentümer offen; 9.6 ist der nächste Schritt (Empfehlung Entscheidung, Datenmodell – würde in dieser Klasse einen Stopp nach Abschnitt 0 auslösen).
- **Auftrag:** keiner genannt („neue session“); es wurde nichts am Code geändert.

### 2026-10-22 – [BEOBACHTUNG] Textqualität von Hermes 4 → V.41; D.21 erledigt

- PR #185 nach grüner CI zusammengeführt (`214b8c7`) → D.21 `[ERLEDIGT]`.
- Frage des Eigentümers: Wie lässt sich die Textqualität von Hermes verbessern? Hermes 4 wurde im Projekt nie gemessen. Befund im Code: Reasoning für nicht gelistete Modelle aus (Hermes 4 405B bietet es laut OpenRouter-Katalog an), Temperatur fest 0,8, keine Strafe gegen Wiederholungen. Schwächen laut Eigentümer: Stil/Deutsch, selten endlose Wiederholungen. Auf seine Wahl V.41 angelegt (Messung nach Regel-002, Landeplatz 9.15).

### 2026-10-22 – [GELÖST] Roter Audit-Job durch Sicherheitsfunde in virtualenv (D.21)

- Doku-PR #185 lief rot in „Python“, Schritt Dependency-Audit: `pip-audit` meldet fünf CVEs in virtualenv 21.13.0 (Korrekturen bis 21.14.9). Nicht vom PR verursacht, blockiert jeden PR – lokal reproduziert.
- Behoben als D.21 im selben PR (nur dieser Branch ist für die Cloud-Session beschreibbar): `uv lock --upgrade-package virtualenv` → 21.14.12; Audit ohne Befund, Pre-Commit grün. virtualenv kommt nur über pre-commit, nicht im Betrieb – kein Einspielen.

### 2026-10-22 – [SESSIONENDE] Cloud-Session zu 9.4 und Rückmeldung zu Sperren

- **Dauer:** 2026-10-19 22:28 MESZ bis 23:16 MESZ (9.4), fortgesetzt 2026-10-22 (Rückmeldung zu Sperren).
- **Bearbeitet:** 9.4 (ADR-093, PR #181, später von der Mac-Session eingespielt und abgenommen); Nachtrag D.19; D.13 erste Beispiele ohne Wortlaut, Wortlaut wechselt mit der Eingabe; V.40 angelegt (Landeplatz 9.15).
- **Stand:** Phase 9, 4 von 15; 9.5 in Arbeit (Mac-Session, Prüfung des Eigentümers offen). Keine aktiven Blocker, keine offenen STOPP-Situationen.
- **Offen:** Wortlaut einiger Sperren und Weigerungen von Figuren für D.13 (Eigentümer); D.19 bis 2026-11-02.
- **Nächster Schritt:** Prüfung von 9.5 durch den Eigentümer, dann 9.6.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, eingestellt und bedient laut `get_session` 2026-10-19). 9.4 empfiehlt Entscheidung; die Doku-Arbeit zu D.13/V.40 ist Routine – wegen kleinen Umfangs und geladenen Kontexts nicht abgegeben. 0 Schritte oberhalb der Empfehlung, keine Abgabe.
- **Kontextgröße:** nicht feststellbar – `get_session` meldet `used_tokens` 0; Regel zur Sessiongröße entfällt (vermerkt).
- **Sessionende-Prüfungen:** README synchron (4 von 15, 0 Blocker; V.40 nicht nutzerrelevant). Drift: ADR-093 → 9.4 vorhanden; V.40 → 9.15 in Übersicht und „Zu tun“ von 9.15 nachgetragen; D.13-Zeile der Übersicht nachgezogen; keine `[BLOCKIERT]`-Schritte; keine neuen ADRs seit ADR-094. Ablaufdaten-Register: D.19 läuft; D.1 ab 2026-11-05 noch nicht im Vorlauf. Archiv: Logbuch ca. 520 Zeilen, project-context 349 – kein Trigger. Quick-Start nicht berührt.

### 2026-10-22 – [BEOBACHTUNG] Nachtrag aus der Cloud-Session zu 9.4; Rückmeldung zu Sperren (D.13)

- **Nachtrag 9.4 (2026-10-19):** Die Cloud-Session hat nach dem Merge von PR #181 (`67fc36e`, CI 4 von 4 grün 21:12–21:15 UTC) einen Doku-Commit (`b8a9aa8`) nur auf ihren Branch gepusht und keinen `[SESSIONENDE]` geschrieben – Versäumnis, nicht nachholbar. Inhalt übertragen, soweit nicht überholt: D.19 – Python-Job lief auf `ubuntu-24.04` (Abbild 20261018.339.1), ohne Warnung; nur dieser Job gelesen. Bei den Proben zu 9.4 lief Playwright lokal erst mit `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium` und nach `npm run build` (vorher 404 auf `/`).
- **Rückmeldung des Eigentümers:** „Blockade der KI“ – per Auswahlfrage: die KI im Skriptorium sperrt. Gehört zu D.13 (Eingangskriterium: Beispiele echter Sperren). Angaben (Ablauf, Modell, Wortlaut, Form, Wiederholung) erfragt. Antwort: Sperren im Weltenbauer, im Kanon, bei Kurzfassung und „Bild beschreiben“; grok-4.5 (seltener) und grok-4.6, qwen3.8 ebenso, Hermes 4 bisher nicht; teils bei CNC-Szenarien; sah aus wie eine Antwort; „jedes Modell blockt, wenn im Verlauf zuvor ein anderes geblockt hatte – nur im Kanon“.
- **Ursache im Code (Hypothese, nicht mit echter KI geprüft):** `ui/src/views/useWorldbuilder.ts` schickt das ganze Gespräch mit; eine als Antwort gelieferte Sperre bleibt als Antwort der KI im Verlauf und geht an jedes folgende Modell. Kurzfassung und „Bild beschreiben“ haben keinen Verlauf. Abhilfe bis dahin: Seite neu laden (Gespräch wird nicht gespeichert), Auftrag mit anderem Modell neu stellen.
- **Landeplatz:** Eigentümer per Auswahlfrage: neuer Schritt mit Planung 9.15 „plus die Möglichkeit, die letzte Eingabe wiederholt zu senden“ → V.40 (Antwort aus dem Gespräch nehmen, letzte Eingabe erneut senden). Beispiele bei D.13 vermerkt, ohne Wortlaut.
- **Nachtrag:** Eigentümer: Der Wortlaut der Sperren ist dynamisch, abhängig von der Eingabe. Bei D.13 vermerkt mit vier zu vergleichenden Wegen (Kennung im Rahmen, äußere Merkmale, zweites Modell, Entscheidung des Autors über V.40).

### 2026-10-21 – [BEOBACHTUNG] 9.5 umgesetzt, Prüfung offen

- Mockup vorher/nachher (echte Bildschirmfotos auf einem lokalen Server mit der Testwelt Salzmark, Nachher in die echte Seite eingesetzt) freigegeben: „Passt, umbauen“, Orte vorab „Alle angekreuzt“.
- Umgesetzt nur in `ui` (siehe Fahrplan 9.5). Bei der Durchsicht der echten Bildschirmfotos nachgebessert: Der Hinweis beim Gegenstand nannte „ersten Satz aus ‚Zweck‘“ auch ohne Abschnitt „Zweck“ – jetzt „ersten Satz des Textes“. Ein eigener Test wartete zuerst auf „Abbrechen“ des Herauslösens; der Knopf heißt dort „Verwerfen“, „Abbrechen“ gehört zum Bildfenster – Tests auf die richtigen Knöpfe umgestellt.
- Prüfungen: vitest 498 (gesamt 98,7 % Zeilen, 95,4 % Zweige), tsc/eslint/prettier sauber, Build, Playwright 15, pytest 932. Commits lokal; Push nach Freigabe des Eigentümers.

### 2026-10-21 – [ADR-ANGELEGT] ADR-094 Bilder vom Bedarf her (9.5)

- Zählung im Betrieb (nur Zahlen, keine Namen): Figuren 12/27 mit „Aussehen“, Gegenstände 3/43 (38 mit Zweck/Verwendung/Auswirkung), Orte 0/19 gegliedert, Kultur 10 ungegliedert, 0/5 Welten mit „Geografie – …“.
- Vorlage mit Tabelle je Bildart; Eigentümer per Auswahlfragen jeweils die Empfehlung: 1B Orte ankreuzen, 2A Hinweis mit Knopf, 3A Name + erster Satz „Zweck“. Danach richtiggestellt: Herauslösen gibt es nur für Figuren (ADR-083) – Eigentümer: „Nur Figuren jetzt“, Gegenstände und Orte → V.39 (Landeplatz 9.15). Reaktiv-Quote 0 / 10 (ADR-085–094). 9.5 auf `[IN ARBEIT]`, als Nächstes Mockup.

### 2026-10-21 – [SESSIONSTART] 9.5 Bilder vom Bedarf her; Karte aus den Orten

- **Modell:** Opus 5.5 (`claude-opus-5-5`, laut `get_session`), Entscheidungs-Klasse. 9.5 empfiehlt Entscheidung – kein Schritt oberhalb der Empfehlung.
- **Umgebung:** Mac-Session (fortgesetzt seit 2026-10-11, „LocalDev (fork)“), `main` auf `2586ef8`, eingespielt `2586ef8`.
- **Wiedereinstieg:** Mindest-Lektüre nachgeholt (Projektkontext ganz, Logbuch ab `[SESSIONENDE]` 2026-10-19 02:00, Fahrplan „Aktueller Stand“ und Phase 9, Architektur 1/2/9, Entscheidungen Teil A und C, aktive Blocker): kein aktiver Schritt, keine aktiven Blocker, keine offenen STOPP-Situationen, Reaktiv-Quote 0 / 10. Die Cloud-Session zu 9.4 hat keinen `[SESSIONENDE]` geschrieben.
- **Kontextgröße:** über der Grenze von 200.000 Token (fortgesetzte Session); Weiterarbeit nach dauerhaftem „weiter hier“ des Eigentümers (Gedächtnis, 2026-09-28) – vermerkt nach `CLAUDE.md` Abschnitt 0.
- **Vorhaben:** 9.5 beginnt mit einer Vorlage (ändert die Vorbelegung aus ADR-084).

### 2026-10-21 – [BEOBACHTUNG] Deployment `2586ef8` (D.20 erledigt)

- Auf Anweisung des Eigentümers („einspielen“); vorher #183 (D.20) und #182 gemergt, CI auf `main` grün. Runbook Abschnitt 7 (ADR-039): `REVISION` `2586ef8`, Rückweg `skriptorium:vorher` = `67fc36e`; `/api/health` 200 nach ca. 63 s (über HTTPS), `/` 200, `/api/worlds` 401, `/sw.js` 200; einmal per SSH `(healthy)`, 0 Fehlerzeilen, im Container certifi 2026.10.19 → D.20 `[ERLEDIGT]`.

### 2026-10-21 – [ERLEDIGT] Abnahme 9.4

- Eigentümer zusätzlich: „Gastfiguren funktionieren auch“ – Eingangskriterium von 9.13 (Probe mit einer Gast-Figur) erfüllt.

- Eigentümer fand die Funktion zunächst nicht (der Block „Verweise hierher“ erscheint nur, wenn ein anderer Eintrag verweist); nach Anleitung: „9.4 funktioniert, der Block erscheint“ → 9.4 `[ERLEDIGT]`. Phase 9: 4 von 15. Nächster Schritt 9.5 mit Vorlage.
- Erklärt auf Nachfrage (ohne Änderung): D.1, D.5 (httpx2 auf PyPI nachgesehen: Fortführung von httpx durch das Pydantic-Team, 2.0 am 2026-05-12, heute 2.15.1 – keine neuen Funktionen fürs Skriptorium, Gewinn ist Pflege und Sicherheitsupdates), D.15.

### 2026-10-20 – [BEOBACHTUNG] Deployment `67fc36e` (8.9–9.4)

- In der fortgesetzten Mac-Session (`claude-opus-5-5`) auf Anweisung des Eigentümers („einspielen“), vorher „Pull from Main und prüfe offene PRs“: keine offenen PRs, `main` auf `67fc36e` (#181), CI grün. Auf dem Server lief `19a5e48`; seitdem 15 PRs (#165–#181). Geprüft vor dem Einspielen: keine Änderung an Dockerfile, Compose, `pyproject.toml` oder `package.json`; laut ADR-091 bis ADR-093 keine Umwandlung bestehender Dateien.
- Ablauf nach Runbook Abschnitt 7 (ADR-039): `REVISION` `67fc36e`, Rückweg `skriptorium:vorher` = `19a5e48`; `/api/health` 200 nach ca. 63 s (über HTTPS), `/` 200, `/api/worlds` 401, `/sw.js` 200; danach einmal per SSH `(healthy)`, 0 Fehlerzeilen in den letzten 3 Minuten.
- Offen: Bestätigung des Eigentümers zu 9.4 (Beziehungen mit Art und „Verweise hierher“). Diese Session hat keine Mindest-Lektüre und keinen `[SESSIONSTART]` neu angelegt – sie setzt die Session vom 2026-10-11 fort und hat nur eingespielt.

### 2026-10-21 – [GELÖST] Rote Audit-Jobs durch neue Sicherheitsfunde (D.20)

- Doku-PR #182 lief rot in „Python“ und „TypeScript“, beide im Schritt Dependency-Audit: `pip-audit` meldet PYSEC-2026-4320 für certifi 2026.7.22 (Korrektur 2026.10.19 vom 2026-10-20), `npm audit` drei Hinweise hoher Stufe zu launch-editor über vite 8.3.0–8.3.2. Nicht vom PR verursacht – blockiert jeden PR.
- Behoben als neuer Querschnitt-Schritt D.20 (Routine, Updates innerhalb der Linie): certifi über `uv lock --upgrade-package certifi`, vite auf 8.3.4 nach Regel-001 (npm schlug 8.3.5 vom selben Tag vor). Beide Audits ohne Befund; pytest 932, vitest 492, Playwright 15, Build grün.
- certifi läuft im Betrieb mit (Zertifikate für TLS zu OpenRouter und Pwned Passwords) → nach dem Merge einspielen. vite betrifft nur Bau und Entwicklung.

### 2026-10-19 22:45 MESZ – [ADR-ANGELEGT] ADR-093 Beziehungen mit Art und Rückverweis (9.4)

- Vorlage mit vier Fragen vorgelegt (Schreibweise, Gegenseite, Weltenbauer, Auffüllung), Eigentümer wählte per Auswahlfragen jeweils die Empfehlung: Zeile `- verheiratet mit @Kael` im Abschnitt „Beziehungen“; Block „Verweise hierher“ berechnet in der Oberfläche; Weltenbauer schreibt beide Seiten; Anfrage beim Schreiben unverändert (keine Probe nach Regel-002). Reaktiv-Quote 0 / 10 (ADR-084–093). 9.4 auf `[IN ARBEIT]`.

### 2026-10-19 22:28 MESZ – [SESSIONSTART] 9.4 Beziehungen mit Art und Rückverweis

- **Modell:** Opus 5.5 (`claude-opus-5-5`, eingestellt und bedient laut `get_session`), Entscheidungs-Klasse. 9.4 empfiehlt Entscheidung – kein Schritt oberhalb der Empfehlung.
- **Umgebung:** Cloud-Session (Umgebung `env_01E4xYkAExv13rZdZH7cdo1B`), Branch des Werkzeugs `claude/new-session-7c9ptj` auf `416f706` (= `origin/main`, PR #180).
- **Wiedereinstieg:** letzter `[SESSIONENDE]` 2026-10-19 02:00 – 9.3 erledigt, kein aktiver Schritt, keine aktiven Blocker, keine offenen STOPP-Situationen. Die dort als offen genannten Branches (`feat/9.3-gegliederte-eintraege`, `scp/affectionate-pare-f0afee`, `spike/9.3-proben-ki`, `scp/wizardly-ride-p7n55n`) bestehen auf `origin` nicht mehr – nur `main` und der Branch dieser Session.
- **Kontextgröße:** `get_session` meldet `used_tokens` 0 (Wert beim Start noch nicht gefüllt); Prüfung nach jedem Schritt erneut.
- **Vorhaben:** 9.4 beginnt mit einer Vorlage (Datenmodell-Konvention, Kategorie 4; ggf. Kategorie 1). D.19 am ersten CI-Lauf dieser Session prüfen (erster Lauf ab 2026-10-19 UTC).

### 2026-10-19 02:00 MESZ – [SESSIONENDE] 9.3 erledigt, 9.4 in neuer Session

- **Dauer:** ca. 01:50 bis 02:00 MESZ (Fortsetzung der Cloud-Session des zweiten Versuchs mit der Übergabe aus dem dritten).
- **Bearbeitet:** 9.3 abgeschlossen – Pflichtlektüre (Änderungen seit `1371264`), Titel und Beschreibung von PR #179 berichtigt („spike(9.3): Proben mit echter KI – Regel-002 und Weltenbauer“, Deutsch, „-2“ als Nachlauf erklärt), CI-Protokolle von #179 gelesen, #179 auf Anweisung zusammengeführt (`273813d`), 9.3 auf `[ERLEDIGT]` (Fahrplan-Schritt, Übersicht, „Aktueller Stand“), README „3 von 15“, FR-002 und FR-029 nachgetragen; Beobachtung bei D.19. Abschluss-PR von `scp/wizardly-ride-p7n55n`; der Eigentümer hat das Zusammenführen nach grüner CI vorab freigegeben.
- **Stand:** Phase 9, 3 von 15; kein aktiver Schritt. Keine offenen STOPP-Situationen, keine aktiven Blocker.
- **Offen:** Branches `feat/9.3-gegliederte-eintraege`, `scp/affectionate-pare-f0afee`, `spike/9.3-proben-ki`, `scp/wizardly-ride-p7n55n` – Löschen erfragt, keine Auswahl getroffen, daher nicht gelöscht. D.19 offen (siehe dort).
- **Nächster Schritt:** 9.4 Beziehungen mit Art und Rückverweis in einer neuen Session – zu Beginn Vorlage (Entscheidungs-Klasse); dabei D.19 am ersten CI-Lauf ab dem 2026-10-19 (UTC) prüfen.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, eingestellt und bedient laut `get_session` um 01:49 und 01:55). 9.3 empfiehlt Entscheidung – 0 Schritte oberhalb der Empfehlung; die Abschlussarbeit selbst (Status, Logbuch, README) ist Routine-Arbeit, wegen kleinen Umfangs und geladenen Kontexts nicht abgegeben.
- **Kontextgröße:** mindestens 348.610 Token (`get_session`, Wert seit 01:49 unverändert gemeldet) – über der Grenze von 200.000; deshalb kein neuer Schritt in dieser Session (Abschnitt 0, „Sessiongröße“).
- **Sessionende-Prüfungen:** README synchron (3 von 15, 9.3 ✅, 0 Blocker, „Nächste Schritte“ ab 9.4). Drift: Übersicht im Fahrplan nannte „1 von 15“ (seit 9.2 veraltet) – auf „3 von 15“ berichtigt; ADR-092 → 9.3, 9.4, 9.5 vorhanden; Modulnamen unverändert; FR-002 und FR-029 erledigt mit Verweis auf 9.3; keine `[BLOCKIERT]`-Schritte, keine aktiven Blocker; Reaktiv-Quote 0 / 10 (ADR-083–092, keine neuen ADRs); Phase 9 mit 15 Schritten (Schwelle 30). Ablaufdaten-Register: Ubuntu 26 ab 2026-10-19 hat seinen Schritt (D.19); sonst kein Vorlauf erreicht (D.1 ab 2026-11-05, mypy 2 am 2026-11-06). Archiv: Logbuch ca. 445 Zeilen, project-context 349 Zeilen – kein Trigger. Keine Phasengrenze. Quick-Start nicht berührt.

### 2026-10-19 01:58 MESZ – [ERLEDIGT] 9.3 Gegliederte Einträge je Art

- **Definition of Done:** Code und Tests in PR #177 (CI grün, 4 von 4 Pflicht-Checks; zusammengeführt `5878215`; lokal pytest 931 mit 99,85 %, vitest 485, Playwright 15/15); Proben mit echter KI in PR #179 (CI grün, 4 von 4: pytest 931 / 99,85 %, vitest 485 / 98,67 – 95,24 – 97,88 – 98,86 %, Playwright 15/15, Pre-Commit alle Hooks; keine Warnung über dem Bestand, kein Hinweis der Plattform, keine Bündelgrößen-Warnung; auf Anweisung zusammengeführt `273813d`); CHANGELOG-Eintrag vorhanden; Bestätigung des Eigentümers 2026-10-19.
- **Ergebnisse der Proben:** Regel-002 über je 6 Ketten ohne Wirkung und ohne Verschlechterung; Weltenbauer gliedert in allen vier Arten, Import ganz, zwei knappe Kanon-Abweichungen ohne Bezug zur Gliederung; Kosten 5,88 $ (Einzelheiten in den READMEs unter `spikes/regel-002/` und `spikes/weltenbauer-9.3/`).
- **Nachgezogen:** Fahrplan (Schritt, Übersicht, „Aktueller Stand“), README „3 von 15“, FR-002 und FR-029 in `docs/requirements.md`. Reifegrad-Wirkung keine.
- **D.19 (Beobachtung):** alle vier Jobs zu #179 noch auf `ubuntu-24.04` (24.04.5, Abbild 20261012.334.1) – der Lauf war um 23:44 UTC am 2026-10-18, vor dem Beginn der Umstellung.

### 2026-10-19 01:50 MESZ – [SESSIONSTART] Abschluss von 9.3 nach den Proben

- **Modell:** Opus 5.5 (`claude-opus-5-5`, eingestellt und bedient laut `get_session`), Entscheidungs-Klasse. 9.3 empfiehlt Entscheidung – kein Schritt oberhalb der Empfehlung.
- **Umgebung:** dieselbe Cloud-Session wie der zweite Versuch (Umgebung „Flight_Research“, Branch des Werkzeugs `scp/wizardly-ride-p7n55n`), fortgesetzt mit der Übergabe aus der Session „Proben 9.3 (3. Versuch)“. Branch per Fast-Forward auf `spike/9.3-proben-ki` (`a1d5b6b`) gebracht, keine Historie umgeschrieben.
- **Wiedereinstieg:** PR #177 in `main` zusammengeführt (`5878215`); PR #179 (`spike/9.3-proben-ki` → `main`, nur `spikes/` und Doku) offen, alle vier Pflicht-Checks grün (23:44–23:45 UTC); 9.3 vom Eigentümer bestätigt. PR #178 auf Anweisung geschlossen (Commits in #179 enthalten). `project-context`, `architecture`, `decisions`, `blockers` unverändert gegenüber `1371264`. Keine aktiven Blocker, keine offenen STOPP-Situationen.
- **Kontextgröße:** 348.610 Token (`get_session`) – über der Grenze von 200.000. Nach `CLAUDE.md` Abschnitt 0 („Sessiongröße“) beginnt diese Session keinen neuen Schritt: Sie schließt nur den laufenden Schritt 9.3 ab (PR #179, `[ERLEDIGT]`, Branches nach Rückfrage); D.19 hier nur als Beobachtung aus der CI von #179; 9.4 in einer neuen Session, außer der Eigentümer sagt ausdrücklich „weiter hier“.
- **Berichtigung der Zeiten des zweiten Versuchs:** Laut `get_session` begann diese Session um 00:06 MESZ, die Session des dritten Versuchs um 00:19 MESZ. Die Uhrzeiten 00:12 und 00:30 in den Einträgen des zweiten Versuchs waren geschätzt und zu spät; der zweite Versuch endete gegen 00:18 MESZ. Das erklärt die Abweichung, die der dritte Versuch in seinem `[SESSIONSTART]` vermerkt hat.

### 2026-10-19 – [BEOBACHTUNG] Eigentümer bestätigt 9.3

- Im Chat: „9.3 bestätigt“ – nach Weltenbauer-Probe und Probe nach Regel-002 mit Nachlauf (keine Verschlechterung). Akzeptanzkriterium „Eigentümer bestätigt“ erfüllt. 9.3 bleibt `[IN ARBEIT]`, bis die lokale Session `spike/9.3-proben-ki` übernommen, PR #177 mit grüner CI zusammengeführt und den Schritt auf `[ERLEDIGT]` gesetzt hat.

### 2026-10-19 01:15 MESZ – [SESSIONENDE] Nachlauf zu 9.3: Befund war Streuung

- **Dauer:** Fortsetzung nach dem `[SESSIONENDE]` von 00:45 MESZ, ca. 00:50 bis 01:15 MESZ (nach Neustart des Arbeitsprozesses; Schlüssel, Branch und Worktree erneut geprüft).
- **Bearbeitet:** 9.3 – Eigentümer wählte per Auswahlfrage „3 weitere Läufe je Seite (Empfohlen)“; Nachlauf (`76d0ea2`), zweite verblindete Bewertung, Auswertung über je 6 Ketten; Spike-README, Fahrplan, README nachgezogen.
- **Stand:** Phase 9, 2 von 15; 9.3 🟠 – beide Proben abgeschlossen, keine Verschlechterung; offen nur die Bestätigung des Eigentümers, danach Zusammenführen durch die lokale Session (Branch `spike/9.3-proben-ki`, PR #177). Keine aktiven Blocker, keine offenen STOPP-Situationen.
- **Kosten bei OpenRouter (Session gesamt):** 2,98 $ + 2,91 $ (Nachlauf: 1,472 $ + 1,433 $) = 5,88 $.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5), 0 Schritte oberhalb der Empfehlung; abgegeben an Unteragenten der Routine-Klasse (Sonnet): vier verblindete Bewertungen (je ca. 2–3 min), Funde nachgeprüft.
- **Kontextgröße:** nicht feststellbar; Regel entfiel.
- **Sessionende-Prüfungen:** README-Zeile 9.3 nachgezogen; sonst wie im Eintrag 00:45 (keine neuen ADRs, Schritt-IDs, Module, Blocker; kein Vorlauf im Ablaufdaten-Register erreicht; Logbuch unter 420 Zeilen).

### 2026-10-19 01:10 MESZ – [BEOBACHTUNG] Nachlauf nach Regel-002 zu 9.3: keine Wirkung über je 6 Ketten

- **Aufbau:** wie der erste Lauf, je 3 weitere Ketten (`vorher-9.3-2`, `nachher-9.3-2`), 84 Vorschläge, alle `stop`.
- **Ergebnis über je 6 Ketten:** keine Kennzahl nachher in beiden Geschichten außerhalb der Vorher-Spannweite – auch nicht die von Hand bewerteten Widersprüche: Salzmark vorher 0 / nachher 1, Glimmergrund vorher 1 (`vorher-9.3-2/lauf-3`: „Dreizehn“ statt zwölf geborgener Toter) / nachher 1. Nur in einer Geschichte außerhalb: Salzmark ein echtes Warte-Ende (`nachher-9.3-2/lauf-2`, Schritt 6) und der Widerspruch, Glimmergrund 6er doppelt 0,50 (innerhalb 5.24). Der Befund aus drei Läufen war Streuung – wie bei 8.11.

### 2026-10-19 00:45 MESZ – [SESSIONENDE] Proben zu 9.3 gelaufen und ausgewertet

- **Dauer:** ca. 00:20 bis 00:45 MESZ (Cloud-Session, dritter Versuch).
- **Bearbeitet:** 9.3 – Schlüssel geprüft (gesetzt), Ausgangs-Commit `40a02eb`; Weltenbauer-Probe (4 Aufträge) und Probe nach Regel-002 (12 Ketten, vorher im Worktree `2ac204b`) gelaufen, ausgewertet, verblindete Widerspruchs-Bewertung durch zwei getrennte Instanzen; README beider Spikes, Fahrplan-Notiz bei 9.3, „Aktueller Stand“, README-Zeile 9.3.
- **Stand:** Phase 9, 2 von 15; 9.3 🟠 – Proben gelaufen; offen: Entscheidung des Eigentümers zum Befund der Regel-002-Probe (Widersprüche nachher 1 von 3 Ketten je Geschichte, vorher 0) und seine Bestätigung; Zusammenführen durch die lokale Session. Keine aktiven Blocker, keine offenen STOPP-Situationen.
- **Nächster Schritt:** Eigentümer entscheidet über weitere Läufe; lokale Session übernimmt `spike/9.3-proben-ki`, dann PR #177 nach Bestätigung; danach 9.4.
- **Kosten bei OpenRouter:** 0,045 $ (Weltenbauer) + 1,500 $ (vorher) + 1,438 $ (nachher) = 2,98 $.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5 laut `get_session`, 00:20). 9.3 empfiehlt Entscheidung – 0 Schritte oberhalb der Empfehlung. Abgegeben an zwei Unteragenten der Routine-Klasse (Sonnet): verblindete Widerspruchs-Bewertung je Geschichte (je ca. 2–3 min); Ergebnisse an Text und Kanon nachgeprüft.
- **Kontextgröße:** nicht feststellbar (`used_tokens` 0); Regel entfiel.
- **Sessionende-Prüfungen:** README: Zeile 9.3 nachgezogen, Fortschritt 2 von 15 und 0 Blocker unverändert. Drift: keine neuen ADRs, Schritt-IDs oder Module; Reaktiv-Quote unverändert; keine `[BLOCKIERT]`-Schritte; Phase 9 mit 15 Schritten. Ablaufdaten-Register: kein Vorlauf erreicht, keine CI gelaufen. Archiv: Logbuch unter 400 Zeilen. Quick-Start nicht berührt. Worktree `../vorher` liegt außerhalb des Klons und verfällt mit dem Container.

### 2026-10-19 00:40 MESZ – [BEOBACHTUNG] Probe nach Regel-002 zu 9.3: gezählt keine Wirkung, ein Befund bei den Widersprüchen

- **Aufbau:** grok-4.6, mittel, je 3 Ketten an Salzmark und Glimmergrund; vorher `2ac204b` (Worktree, eigener Code geprüft: `skriptorium.__file__` im Worktree), nachher `40a02eb`; 84 Vorschläge, alle `stop`, keine Fehler; Ergebnisse `spikes/regel-002/ergebnisse/vorher-9.3/`, `nachher-9.3/`, Bewertung `9.3-bewertung/`.
- **Gezählt:** einzig „wörtlich %“ in beiden Geschichten außerhalb der Vorher-Spannweite, gegenläufig (Salzmark 0,40 gegen 0,44–0,76; Glimmergrund 0,71 gegen 0,00–0,39) – keine Wirkung. Glimmergrund 0,71 ist der höchste bisher gemessene Mittelwert dieser Geschichte.
- **Widersprüche (verblindet, Sonnet):** nachher je ein eindeutiger (Salzmark `lauf-2` Schritt 5: „Heddas Kind“ am Abend; Glimmergrund `lauf-3` Schritt 6: „mein Teuerster“ zu Wendt), vorher keiner; 12 Kanon-Proben in Glimmergrund überall ohne Widerspruch. Nach dem Wortlaut von Regel-002 ein Befund; Rate wie grok-4.6 in 5.26; beide Einzelheiten stehen in beiden Ständen im Wortlaut in der Anfrage (ohne KI nachgebaut).

### 2026-10-19 00:30 MESZ – [GELÖST] markdownlint prüft Rohantworten unter `spikes/`

- **Problem:** Der Commit des Logbuchs scheiterte am Pre-Commit: `markdownlint-cli2` meldete 8 Fehler in `spikes/weltenbauer-9.3/ergebnisse/*.md` (MD041, MD047). Der erste Commit mit den Antworten (`3970465`) war durchgegangen, weil Pre-Commit `spikes/` per `exclude` auslässt – markdownlint selbst sucht aber mit `**/*.md` im ganzen Repo, sobald irgendeine `.md`-Datei geändert ist.
- **Lösung:** Rohantworten als `.txt` abgelegt (wie die Texte unter `spikes/regel-002/ergebnisse/`), `probe.py` und README nachgezogen (`8f64fc9`); `PRUEFEN=1` liefert dieselbe Tabelle.

### 2026-10-19 00:27 MESZ – [BEOBACHTUNG] Weltenbauer-Probe zu 9.3 mit echter KI

- **Ergebnis:** vier Aufträge (Figur, Ort, Gegenstand, Kultur), grok-4.6, alle `stop`, 0,045 $. (a), (b), (d) maschinell in allen vier erfüllt: Abschnitte der Art vollständig in Reihenfolge auf Ebene 3, kein Füllwerk, Import ganz, keine Ebenen-Korrektur nötig.
- **(c) von Hand:** Ort erkennt die Falle im Auftrag (Rehl ist ehemaliger Zöllner); knapp: Haken für den Siegelring im Zollhaus (Drach trägt ihn stets – Text des Rings nicht in der Anfrage); Figur „meidet den Südhafen“, obwohl der Nordkai dazugehört. Gegenstand und Kultur ohne Widerspruch. Einzelheiten `spikes/weltenbauer-9.3/README.md`.

### 2026-10-19 00:20 MESZ – [SESSIONSTART] Proben zu 9.3 (dritter Versuch): Regel-002 und Weltenbauer

- **Modell:** Opus 5.5 (`claude-opus-5-5`, eingestellt und bedient laut `get_session`), Entscheidungs-Klasse. 9.3 empfiehlt Entscheidung – kein Schritt oberhalb der Empfehlung.
- **Umgebung:** Cloud-Session in der Umgebung „OPENROUTER_API_KEY“; `OPENROUTER_API_KEY` **gesetzt** (nur Vorhandensein geprüft). Ausgangs-Commit `40a02eb` (Branch `scp/wizardly-ride-p7n55n`); `git diff --stat 1371264 HEAD -- src ui tests` leer, `canon/sections.py` enthält „Fähigkeiten“. Das Werkzeug hat der Session `scp/wizardly-ride-p7n55n` zugewiesen, auf den nicht gepusht werden soll – deshalb eigener Branch `spike/9.3-proben-ki` (Konvention aus `docs/project-context.md` Abschnitt 10).
- **Zeit:** Die Uhr der Session zeigt 00:20 MESZ; die Einträge der Vorsession tragen 00:07–00:30 MESZ desselben Tages – deren Zeitangaben stimmen offenbar nicht mit dieser Uhr überein (Reihenfolge der Einträge gilt).
- **Wiedereinstieg:** Phase 9, 2 von 15; 9.3 🟠 umgesetzt (PR #177), offen: Probe nach Regel-002 und Weltenbauer-Probe in der Salzmark, beide vom Eigentümer freigegeben. Keine aktiven Blocker, keine offenen STOPP-Situationen.
- **Kontextgröße:** `get_session` meldet `used_tokens` 0 – nicht verlässlich feststellbar, Regel „Sessiongröße“ entfällt.

### 2026-10-19 00:30 MESZ – [SESSIONENDE] Proben zu 9.3 nicht gelaufen (kein Schlüssel), Weltenbauer-Probe vorbereitet

- **Dauer:** ca. 00:07 bis 00:30 MESZ (Cloud-Session).
- **Bearbeitet:** 9.3 – Stand geprüft (Start auf `1371264`, „Fähigkeiten“ in `canon/sections.py`), Schlüssel fehlt (Eintrag 00:12). Ohne KI vorbereitet: `spikes/weltenbauer-9.3/probe.py` und README (vier Aufträge mit `@`-Verweisen, maschinelle Prüfung (a), (b), (d), Trockenlauf, Selbsttest der Prüflogik mit sechs konstruierten Antworten im Scratchpad); Vorher-Worktree auf `2ac204b` geprüft (eigener Code, Anfrage ändert sich wie erwartet: Salzmark 38 → 9 Überschriften der Ebene 1, Glimmergrund 36 → 13). Notiz bei 9.3 und „Aktueller Stand“ im Fahrplan.
- **Stand:** Phase 9, 2 von 15; 9.3 🟠 umgesetzt, PR #177 offen; beide Proben weiterhin offen, Bestätigung des Eigentümers offen. Keine offenen STOPP-Situationen, keine aktiven Blocker (fehlender Schlüssel ist eine Frage der gewählten Umgebung, kein Blocker nach Abschnitt 10).
- **Nächster Schritt:** Cloud-Session in der Umgebung „OPENROUTER_API_KEY“ vom Branch `scp/wizardly-ride-p7n55n`; zuerst Schlüssel prüfen, dann Regel-002 (vorher `2ac204b` im Worktree, nachher Stand des Branches – `src/` gleich `1371264`) und `uv run python spikes/weltenbauer-9.3/probe.py`, auswerten (c von Hand), festhalten.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, eingestellt und bedient laut `get_session` um 00:07 und 00:29). 9.3 empfiehlt Entscheidung – 0 Schritte oberhalb der Empfehlung; nichts an Unteragenten abgegeben (Werkzeug klein, Kontext schon geladen).
- **Kontextgröße:** nicht feststellbar – `get_session` meldet `used_tokens` 0; Regel „Sessiongröße“ entfiel (vermerkt im `[SESSIONSTART]`).
- **Sessionende-Prüfungen:** README synchron (2 von 15, 9.3 „Proben mit echter KI offen“, 0 Blocker) – keine Änderung. Drift: keine neuen ADRs, Schritt-IDs oder Module; Reaktiv-Quote unverändert 0 / 10; keine `[BLOCKIERT]`-Schritte; Phase 9 mit 15 Schritten. Ablaufdaten-Register: kein Vorlauf erreicht (D.19 greift ab dem ersten CI-Lauf nach dem 2026-10-19 – in dieser Session lief keine CI). Archiv: Logbuch ca. 370 Zeilen, kein Trigger. Quick-Start nicht berührt.

### 2026-10-19 00:12 MESZ – [BEOBACHTUNG] Zweiter Versuch der Proben zu 9.3: Cloud-Session in der falschen Umgebung, kein Schlüssel

- **Befund:** `OPENROUTER_API_KEY` ist in dieser Cloud-Session nicht gesetzt (nur Vorhandensein geprüft). Auch keine andere Variable mit „openrouter“ im Namen, keine Datei im Home-Verzeichnis; `https://openrouter.ai/api/v1/key` antwortet ohne Schlüssel mit 401, der Proxy fügt also nichts ein.
- **Ursache:** Die Session läuft laut `get_session` in der Cloud-Umgebung „Flight_Research“ (dort ist nur ein Zugang für einen fremden Dienst hinterlegt). Laut `list_environments` gibt es eine eigene Umgebung „OPENROUTER_API_KEY“ – vermutlich die mit dem Schlüssel. Der erste Versuch scheiterte am fehlenden Branch auf GitHub, dieser an der Umgebung.
- **Folge:** Keine der beiden Proben ist gelaufen; keine Kosten bei OpenRouter. Stand unverändert: Branch `scp/affectionate-pare-f0afee` = `1371264` ist korrekt, `canon/sections.py` enthält „Fähigkeiten“, `2ac204b` (Vorher-Stand) ist im Klon vorhanden.
- **Für den nächsten Versuch:** Cloud-Session in der Umgebung „OPENROUTER_API_KEY“ starten und zuerst prüfen, ob `OPENROUTER_API_KEY` gesetzt ist (nur gesetzt/nicht gesetzt), bevor irgendetwas anderes läuft.

### 2026-10-19 00:07 MESZ – [SESSIONSTART] Proben zu 9.3 (zweiter Versuch): Regel-002 und Weltenbauer

- **Modell:** Opus 5.5 (`claude-opus-5-5`, eingestellt und bedient laut `get_session`), Entscheidungs-Klasse; Aufwand „xhigh“. 9.3 empfiehlt Entscheidung – kein Schritt oberhalb der Empfehlung.
- **Umgebung:** Cloud-Session (Linux), gestartet vom Branch `scp/affectionate-pare-f0afee` (`1371264`, gleich `feat/9.3-gegliederte-eintraege`, PR #177 offen); eigener Branch des Werkzeugs `scp/wizardly-ride-p7n55n`, zweigt von `1371264` ab. Pre-Commit-Hook über den SessionStart-Hook eingerichtet.
- **Wiedereinstieg:** Phase 9, 2 von 15; 9.3 🟠 umgesetzt, offen: Probe nach Regel-002 (vorher `2ac204b`, nachher `1371264`, je 3 Läufe an Salzmark und Glimmergrund, grok-4.6, mittel) und Weltenbauer-Probe in der Salzmark (Figur, Ort, Gegenstand, Kultur); Eigentümer hat beide freigegeben. Keine aktiven Blocker, keine offenen STOPP-Situationen, Reaktiv-Quote 0 / 10.
- **Kontextgröße:** `get_session` meldet `context_usage.used_tokens` 0 (vermutlich noch nicht aktualisiert); Größe damit nicht verlässlich feststellbar, Regel „Sessiongröße“ entfällt für diese Session.
- **Auftrag:** beide Proben ausführen, auswerten und festhalten; Commits nur auf `scp/wizardly-ride-p7n55n`, kein Pull Request, nichts zusammenführen.

### 2026-10-18 23:40 MESZ – [SESSIONENDE] 9.3 entschieden und lokal umgesetzt, Proben offen

- **Dauer:** Fortsetzung nach dem `[SESSIONENDE]` von 22:10 MESZ: 9.2 zusammengeführt (PR #175, #176), dann auf „weiter“ 9.3 bis 23:40 MESZ.
- **Bearbeitet:** 9.2 abgeschlossen (CI grün, `65a0f13`, Abschluss `2ac204b`). 9.3: Mockup vorher/nachher, Entscheidung per Auswahlfragen → ADR-092, Umsetzung (Unteragent, geprüft und nachgebessert), V.38 angelegt. Commits lokal auf `feat/9.3-gegliederte-eintraege` (`1529ac3` … `a409878`), nicht hochgeladen.
- **Stand:** Phase 9, 2 von 15 erledigt; 9.3 🟠 umgesetzt, offen: Probe nach Regel-002 und Probe des Weltenbauers mit echter KI (Cloud-Session; Plan in den Notizen von 9.3), Bestätigung des Eigentümers. Keine offenen STOPP-Situationen, keine aktiven Blocker.
- **Nächster Schritt:** Branch hochladen und Pull Request nach Freigabe; die Proben in einer Cloud-Session vom Branch; danach Bestätigung und Zusammenführen. Dann 9.4 (Beziehungen, baut auf dem Abschnitt „Beziehungen“).
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, laut `get_session`; Abfrage um 22:09, seither kein Modellwechsel gemeldet). 9.3 empfiehlt Entscheidung – 0 Schritte oberhalb der Empfehlung in diesem Teil. Abgegeben an Unteragenten der Routine-Klasse (Sonnet): Mockup (ca. 5 min, 37 Aufrufe) und Umsetzung (ca. 14 min, 72 Aufrufe); Vorlage, ADR, Prüfung, Nachbesserung des Imports, Doku und Commits hier.
- **Kontextgröße:** 509.699 Token (`get_usage`), über der Grenze von 200.000; weitergearbeitet nach dem dauerhaften „weiter hier“ des Eigentümers (Abweichung nach `CLAUDE.md` Abschnitt 0, „Sessiongröße“).
- **Sessionende-Prüfungen:** README synchron (Fortschritt 2 von 15; „Nächste Schritte“ 9.3 umgesetzt, Proben offen). Drift: ADR-092 verweist auf 9.3, 9.4, 9.5 – vorhanden; V.38 mit Landeplatz 9.15, in 9.15 und der Übersicht genannt; `docs/architecture.md` Abschnitte 7–9 auf Stand ADR-092; Modulnamen unverändert; FR-002, FR-029 unverändert erledigt (9.3 noch offen); keine aktiven Blocker und keine `[BLOCKIERT]`-Schritte; Reaktiv-Quote 0/10 (ADR-083–092); Phase 9 mit 15 Schritten (Schwelle 30). Ablaufdaten-Register: kein Vorlauf erreicht (D.1 ab 2026-11-05, mypy 2 am 2026-11-06; D.19 ab dem ersten CI-Lauf nach dem 2026-10-19). Archiv: Logbuch ca. 340 Zeilen, project-context 349 Zeilen – kein Trigger. Keine Phasengrenze. Quick-Start nicht berührt.

### 2026-10-18 – [BEOBACHTUNG] 9.3 lokal umgesetzt; Messung der Anfrage an den Testwelten

- Umsetzung von ADR-092 durch einen Unteragenten der Routine-Klasse (Sonnet, ca. 14 min, 72 Werkzeugaufrufe), geprüft von der bauenden KI. Lokal grün: pytest 931 (99,85 %; canon 100 %, context 99 %), vitest 485 (98,67 / 95,29 / 97,88 / 98,86 %), Playwright 15/15, ruff, mypy, bandit, eslint, prettier, tsc. Bildschirmfotos des echten Formulars (Desktop, Smartphone; Figur und Wechsel auf Ort) entsprechen dem Mockup.
- Messung `render` alt gegen neu an den 52 Einträgen von Salzmark und Glimmergrund: alle 52 ändern sich, weil ihr Text mit `# Name` beginnt (wird `### Name`); +104 Zeichen gesamt; keine leeren Abschnitte, nichts erreicht Ebene 6. Die Anfrage beim Schreiben ändert sich also in beiden Testgeschichten – die Probe nach Regel-002 misst genau das.
- Vertragsdatei: Gegenstand und Kultur bekommen die neue Vorlage; geschätzte Token beim Schreiben 1.477 → 1.450 (leere Abschnitte fallen weg), beim Weltenbauer 816 → 994 (längerer Rahmen, ca. +180 Token je Antwort).
- Befund SillyTavern-Export: trennt „Wesen“ an der wörtlichen Zeile `### Wesen` (Abweichung von Regel-003); mit der neuen Vorlage (`## Wesen`) bleibt `personality` leer → V.38, Landeplatz 9.15.

### 2026-10-18 – [GELÖST] Import zerlegte eine Figur mit eigenem Zusatz-Abschnitt

- Bericht des Unteragenten: Eine Überschrift ohne eigenen Text galt nur dann als Eintrag, wenn alle Unterüberschriften feste Abschnitte waren; eine Figur des Weltenbauers mit „Aussehen“, „Wesen“ und einem eigenen „Herkunft“ wäre in der Import-Vorschau in mehrere Einträge zerfallen – mit 9.3 wahrscheinlicher. Nachgebessert von der bauenden KI: Bei bekannter Art reicht ein fester Abschnitt dieser Art (`_holds_item_sections`); bei unbekannter Art bleibt die strenge Regel. Zwei Tests ergänzt.

### 2026-10-18 – [ADR-ANGELEGT] ADR-092 Feste Abschnitte je Art (9.3)

- Mockup vorher/nachher (Formular „Neuer Eintrag“, Figur Anselm Drach, Ort Aschturm; Testwelt Salzmark, Desktop und Smartphone, vom Unteragenten gebaut) und vier Auswahlfragen. Eigentümer: A (Vorlage im Formular, Weltenbauer, Import; Bestand bleibt), Figur mit „Fähigkeiten“ (Aussehen · Wesen · Fähigkeiten · Geschichte · Beziehungen), übrige Arten wie vorgeschlagen, Abschnitte in der KI-Anfrage unter dem Namen mit Probe nach Regel-002. `[OPERATIV]`, in 9.3 als Vorlage vorgesehen – nicht reaktiv; Reaktiv-Quote 0/10 (ADR-083–092). Auf der Entscheidungs-Klasse vorgelegt (Opus 5.5).
- Befund beim Lesen: In der Anfrage an die KI steht ein von Hand angelegtes `## Aussehen` auf derselben Ebene wie `## Kael (Figur)`; aus dem Weltenbauer übernommene Einträge haben `### Aussehen`. Mit mehr Abschnitten je Eintrag wäre die Zuordnung für die KI unsicher – deshalb Teil von ADR-092.

### 2026-10-18 – [BEOBACHTUNG] 9.3 in derselben Session begonnen

- Auf „weiter“ des Eigentümers nach dem Abschluss von 9.2 beginnt 9.3 in dieser Session, obwohl die Kontextgröße über 200.000 Token liegt (Abweichung von `CLAUDE.md` Abschnitt 0, „Sessiongröße“, nach dem dauerhaften „weiter hier“ des Eigentümers). Modell weiter Opus 5.5, Entscheidungs-Klasse – 9.3 empfiehlt Entscheidung, keine Arbeit oberhalb der Empfehlung. Branch `feat/9.3-gegliederte-eintraege` von `main` `2ac204b`. Zuerst Vorlage mit Mockup (Kategorien 1 und 4); das Mockup baut ein Unteragent der Routine-Klasse.

### 2026-10-18 – [ERLEDIGT] 9.2 End-to-End-Tests für die Abläufe der Phasen 6–8

- PR #175, CI grün (4 von 4; End-to-End 1 min 18 s), auf Anweisung des Eigentümers („merge“) zusammengeführt (`65a0f13`). Im CI-Protokoll nur der bekannte Hinweis „ubuntu-latest → Ubuntu 26 ab 2026-10-19“ (D.19, Lauf noch vor dem Stichtag), keine Bündelgrößen-Warnung. Auto-fix für #175 auf Wunsch des Eigentümers eingeschaltet, nicht gebraucht. Lokal zuvor: Playwright 15/15, pytest 887 (99,85 %), vitest 467 (98,66 / 95,3 / 97,87 / 98,85 %). Phase 9: 2 von 15 erledigt; nächster Schritt 9.3 (Vorlage mit Mockup, Entscheidungs-Klasse) – in einer neuen Session.
- `gh pr merge --delete-branch` brach beim Wechsel auf das lokale `main` ab (im Haupt-Checkout belegt); der entfernte Branch blieb stehen und wurde von Hand gelöscht. Merken: aus einem Worktree heraus den entfernten Branch nach dem Merge prüfen.

### 2026-10-18 22:10 MESZ – [SESSIONENDE] 9.2 lokal fertig, Pull Request nach Freigabe

- **Dauer:** 2026-10-18 21:48 bis 22:10 MESZ; Neben-Session, gestartet aus der Session des Eigentümers mit dem Auftrag 9.2.
- **Bearbeitet:** 9.2 – vier Playwright-Tests, Vertragstest Server ↔ Oberfläche, Typ `DescribeEvent` berichtigt, CI-Schrittnamen auf die geltenden Schwellen (ADR-090). Commits lokal auf `feat/9.2-e2e-ablaeufe`, nicht hochgeladen.
- **Stand:** Phase 9, 1 von 15 erledigt; 9.2 🟠 lokal fertig, offen ist nur das Akzeptanzkriterium „grün in der CI“. Keine offenen STOPP-Situationen, keine aktiven Blocker.
- **Nächster Schritt:** Pull Request für `feat/9.2-e2e-ablaeufe` nach Freigabe des Eigentümers, CI grün → 9.2 erledigt, README-Fortschritt 2 von 15; fällt der Lauf auf oder nach den 2026-10-19, gleich D.19 mit prüfen. Danach 9.3 (Vorlage mit Mockup, Entscheidungs-Klasse).
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session` um 22:09 erneut abgefragt). 1 Schritt oberhalb der Empfehlung (9.2 empfiehlt Routine; Warnung zu Beginn ausgesprochen). Abgegeben an zwei Unteragenten der Routine-Klasse (Sonnet): Playwright-Tests (ca. 10 min, 51 Werkzeugaufrufe) und Vertragstest (ca. 12 min, 63 Werkzeugaufrufe); Prüfung, Typ-Berichtigung, Fake-Modellliste typisiert, Prüfkette, Doku und Commits hier.
- **Kontextgröße:** 315.539 Token (`get_usage`), über der Grenze von 200.000 – in dieser Session beginnt kein neuer Schritt.
- **Sessionende-Prüfungen:** README synchron („Nächste Schritte“: 9.2 lokal fertig; Fortschritt bleibt 1 von 15 bis zur grünen CI). Drift: kein neuer ADR; FR-029 und FR-035 nur Test-Spalte ergänzt, Status unverändert; Modulnamen unverändert; keine aktiven Blocker, keine `[BLOCKIERT]`-Schritte; Reaktiv-Quote 1/10 unverändert; Phase 9 mit 15 Schritten (Schwelle 30). Ablaufdaten-Register: kein Vorlauf erreicht; Zusatz an D.2 (Compiler-API in `ui/src/api/contract.test.ts`); D.19 ohne CI-Lauf in dieser Session. Archiv: Logbuch unter 300 Zeilen, project-context 349 Zeilen – kein Trigger. Keine Phasengrenze. Nicht Quick-Start-relevant (keine der Dateien aus `CLAUDE.md` Abschnitt 17); kein CHANGELOG-Eintrag (nur Tests und CI-Namen).

### 2026-10-18 – [BEOBACHTUNG] Vertragstest fand `web_search` im Start der Beschreibungen

- `tests/api/test_ui_contract.py` zeichnet 73 echte Antworten und Strom-Ereignisse auf; `ui/src/api/contract.test.ts` prüft sie mit der Compiler-API von `typescript` gegen die Typen in `ui/src/api/` (Gegenprobe: umbenanntes, zusätzliches, fehlendes Feld, Wert außerhalb einer Literal-Union, falscher Typ – jeweils genau die beschädigte Antwort gemeldet). Einziger Befund: Das `start`-Ereignis von „Bild/Karte beschreiben“ und „Aussehen herauslösen“ trägt `web_search`, weil der Server dafür `stream_answer` des Weltenbauers nutzt (`api/flows/worldbuilder.py`); `DescribeEvent` war der Start des Schreib-Stroms ohne das Feld. Zur Laufzeit harmlos. Berichtigt auf der Typseite (`DescribeEvent` aus `WorldbuilderEvent`) – den Server zu ändern wäre eine nicht-additive API-Änderung (Kategorie 5) gewesen.
- Merken: Ein Vertragstest mit aufgezeichneten Antworten prüft nur die Fälle, die die Daten zeigen; Varianten (null/gesetzt, Fehlerarten) sind deshalb einzeln aufgenommen.

### 2026-10-18 – [GELÖST] Reibungen beim Schreiben der Tests (9.2)

- Playwright: `getByLabel("Kategorie", { exact: true })` fand das Auswahlfeld nicht (30 s Wartezeit), weil der Beschriftungstext die Optionen mitzählt → `getByRole("combobox", { name: /^Kategorie/ })`. „Beschreiben lassen“ traf auch „✨ Von der KI beschreiben lassen“ → `exact: true`.
- Playwright: „Bild beschreiben“ braucht ein Modell, das Bilder liest; die Liste kommt sonst live von OpenRouter → in zwei Tests durch eine an `ModelList` typisierte Liste ersetzt, damit der Lauf nicht am Netz hängt.
- Playwright: Alle Tests eines Laufs teilen ein Datenverzeichnis; feste Weltnamen vertragen kein `--repeat-each` – Wiederholung als getrennte Läufe.
- Vertragstest: `ui/test-setup.ts` braucht jsdom (`Range`), also kein `@vitest-environment node`; Zufalls-Dateinamen standen auch in der Route und mussten dort ebenfalls ersetzt werden; eine Gast-Verbindung auf eine Figur der eigenen Welt gibt 422.
- Eigene Reibung: Ein Python-Heredoc mit Umlauten im Terminal brach mit „Non-UTF-8 code“ ab; Skripte für Doku-Ersetzungen mit vielen Umlauten als Datei im Scratchpad ablegen.

### 2026-10-18 21:48 MESZ – [SESSIONSTART] 9.2 End-to-End-Tests

- **Modell:** Opus 5.5 (`claude-opus-5-5`, laut `get_session`), Entscheidungs-Klasse; Aufwand „xhigh“. 9.2 empfiehlt Routine – Schritt läuft oberhalb der Empfehlung; das Schreiben der Tests (ausgabelastig) geht an einen Unteragenten der Routine-Klasse (Sonnet), Prüfung und Commit hier.
- **Umgebung:** Mac des Eigentümers (macOS arm64); Neben-Session, gestartet aus der Session des Eigentümers, eigener Worktree (`.claude/worktrees/affectionate-pare-f0afee`), Branch `feat/9.2-e2e-ablaeufe`; Pre-Commit-Hook über den SessionStart-Hook eingerichtet.
- **Stand:** vor der Mindest-Lektüre `git fetch` – `main` `993863d` gleich `origin/main`, kein Fast-Forward nötig.
- **Wiedereinstieg:** Phase 9, 1 von 15; nächster Schritt 9.2. Keine aktiven Blocker, keine offenen STOPP-Situationen, Reaktiv-Quote 1 / 10. Querschnitt: D.19 (Ubuntu 26 ab 2026-10-19), D.11 bis 2026-10-31 (Eigentümer).
- **Kontextgröße:** über `get_usage` feststellbar (189.298 Token nach der Mindest-Lektüre).
- **Auftrag:** 9.2 umsetzen – mindestens drei neue Playwright-Tests (Weltenbauer mit Übernahme-Fenster, „Abschnitt ersetzen“, Karte oder Bild), Antwortformen gegen `ui/src/api/` ohne neues Werkzeug, CI-Schrittnamen auf die geltenden Schwellen (ADR-090); lokal committen, Pull Request erst nach Freigabe.

### 2026-10-18 20:31 MESZ – [SESSIONENDE] 9.1 erledigt

- **Dauer:** 2026-10-18 17:58 bis 20:31 MESZ; Neben-Session, gestartet aus der Session des Eigentümers mit dem Auftrag „Vorlage α/β“, auf seine Frage „Können wir weitermachen?“ bis zum Abschluss von 9.1 fortgesetzt.
- **Bearbeitet:** 9.1 – Vorlage α/β, Entscheidung α (ADR-091, Regel-003), Umsetzung, PR #173 mit grüner CI, auf Anweisung des Eigentümers („merge“) zusammengeführt (`f479509`). Neu D.19 (Ubuntu 26 auf den CI-Runnern).
- **Stand:** Phase 9, 1 von 15 erledigt. Keine offenen STOPP-Situationen, keine aktiven Blocker.
- **Nächster Schritt:** 9.2 (End-to-End-Tests, Routine) und 9.3 (gegliederte Einträge je Art, Vorlage mit Mockup, Entscheidungs-Klasse); D.19 ab dem ersten CI-Lauf nach dem 2026-10-19. Beim Eigentümer: Probe mit einer Gast-Figur (9.13), D.11 bis 2026-10-31.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session` um 20:31 erneut abgefragt). 0 Schritte oberhalb der Empfehlung (9.1 empfiehlt Entscheidung). Keine Teilarbeit abgegeben – Logbuch, Fahrplan und README im geladenen Kontext erledigt.
- **Kontextgröße:** 458.017 Token (`get_usage`), über der Grenze von 200.000; weitergearbeitet nach dem dauerhaften „weiter hier“ des Eigentümers (Abweichung nach `CLAUDE.md` Abschnitt 0, „Sessiongröße“).
- **Sessionende-Prüfungen:** README synchron (Phase 9, 1 von 15; „Nächste Schritte“ 9.1 erledigt). Drift: ADR-091 verweist auf 9.1, 9.3 – vorhanden; `docs/architecture.md` Abschnitt 9 auf Stand ADR-091 (Modul canon ergänzt, Reifegrad unverändert `[BELASTBAR]`); Modulnamen unverändert; FR-002, FR-003 unverändert erledigt; keine aktiven Blocker und keine `[BLOCKIERT]`-Schritte; Reaktiv-Quote 1/10 (ADR-082–091, nur ADR-082); Phase 9 mit 15 Schritten (Schwelle 30). Ablaufdaten-Register: neu Ubuntu 26 → D.19; sonst kein Vorlauf erreicht (D.1 ab 2026-11-05, mypy 2 am 2026-11-06). Archiv: Logbuch 260 Zeilen, project-context 349 Zeilen – kein Trigger. Keine Phasengrenze, kein Vision-Abgleich fällig.
- **Arbeitskopie:** eigener Worktree im Scratchpad (`docs/9.1-abschluss`); der gemeinsame Checkout des Eigentümers steht sauber auf `main`.

### 2026-10-18 – [ERLEDIGT] 9.1 Gliederung im Server verlässlich

- PR #173, CI grün (4 von 4), zusammengeführt `f479509`. `canon/sections.py` und `canon/names.py` mit gemeinsamen Testfällen (47 und 27) für Server und Oberfläche; Import erkennt „Wesen und Geschichte“; Namenserkennung an vier Stellen eine Regel. Lokal pytest 886 (99,85 %), vitest 459, Playwright 11. Anfrage beim Schreiben unverändert (274 Kombinationen, 0 Unterschiede). CI-Hinweis „ubuntu-latest → Ubuntu 26 ab 2026-10-19“ → D.19 mit Frist 2026-11-02; keine Bündelgrößen-Warnung.

### 2026-10-18 – [GELÖST] `ruff format` machte aus Escape-Folgen echte Sonderzeichen

- Die Leerzeichen-Konstante in `canon/sections.py` stand als zwei verkettete Zeilen mit `\u00a0` usw.; `ruff format` fügte sie zu einer zusammen und schrieb dabei die Zeichen selbst hinein, `ruff check` meldete sie danach als mehrdeutig (RUF001). Lösung: Konstante aus `chr(...)` zusammengesetzt. Merken: unsichtbare Zeichen im Code nie als Escape-Folgen in verketteten Literalen.

### 2026-10-18 – [GELÖST] Genitiv mit großem „S“: Server und Oberfläche waren verschieden

- Beim Angleichen der Namenserkennung schlug `ui/src/references.test.ts` („@KaelS“ zählt nicht, Schritt 5.23) fehl, weil zuerst die Oberfläche an den Server angepasst war (dort zählte `@KAELS` wegen `IGNORECASE`). Gelöst in Richtung der bestätigten Regel aus 5.23: Genitiv nur mit kleinem „s“, im Server mit `(?-i:s)`. Bestehende Erwartungen unverändert.

### 2026-10-18 – [BEOBACHTUNG] Figur in Vorlage-Form zerfiel beim Import

- Probe vor 9.1: `# Figuren / ## Kael / ### Aussehen / ### Wesen und Geschichte` ergab die Einträge „Aussehen“ und „Wesen und Geschichte“, nicht „Kael“ – der Import kannte „Wesen und Geschichte“ nicht. Behoben mit der Namensliste aus `canon/sections.py` (Test `test_a_figure_in_the_form_of_its_template_stays_one_entry`).

### 2026-10-18 – [ADR-ANGELEGT] ADR-091 Gliederung bleibt Markdown (α), Regel-003

- Eigentümer per Auswahlfrage: „A – Text mit Überschriften (Empfohlen)“. β (Felder im Dateikopf) verworfen, in `docs/architecture.md` Abschnitt 8. Regel-003: Teile eines Eintrags nur über die gemeinsame Abschnittsregel. `[OPERATIV]`, in 9.1 als Vorlage vorgesehen – nicht reaktiv; Reaktiv-Quote 1/10 (ADR-082–091). Auf der Entscheidungs-Klasse vorgelegt (Opus 5.5).
- Arbeitsweise: Neben-Session im gemeinsamen Checkout des Eigentümers; damit dort kein Branch gewechselt wird, läuft 9.1 in einem eigenen Worktree im Scratchpad (Branch `feat/9.1-gliederung-server`), die Doku-Änderungen vom Sessionstart sind dorthin umgezogen.

### 2026-10-18 17:58 MESZ – [SESSIONSTART] Vorlage α/β zu 9.1

- **Modell:** Opus 5.5 (`claude-opus-5-5`, laut `get_session`), Entscheidungs-Klasse; Aufwand „xhigh“. 9.1 empfiehlt Entscheidung – keine Arbeit oberhalb der Empfehlung.
- **Umgebung:** Mac des Eigentümers (macOS arm64); Neben-Session, gestartet aus der Session des Eigentümers; Pre-Commit-Hook über den SessionStart-Hook eingerichtet.
- **Stand:** vor der Mindest-Lektüre `git fetch` – `main` `fb705d8` gleich `origin/main`, kein Fast-Forward nötig.
- **Wiedereinstieg:** Phase 9, 0 von 15; nächster Schritt 9.1 mit Vorlage α (Abschnitte in Markdown) gegen β (Felder im Dateikopf). Keine aktiven Blocker, keine offenen STOPP-Situationen, Reaktiv-Quote 1 / 10. Querschnitt: D.11 bis 2026-10-31 (Eigentümer).
- **Kontextgröße:** über `get_usage` feststellbar (181.169 Token nach der Mindest-Lektüre).
- **Auftrag:** Vorlage α gegen β als `ENTSCHEIDUNG ERFORDERLICH` (Kategorie 4) vorlegen; nichts bauen vor der Entscheidung.

### 2026-10-18 17:32 MESZ – [SESSIONENDE] Phase 8 abgeschlossen, Phase 9 geplant

- **Dauer:** Fortsetzung derselben Session nach dem `[SESSIONENDE]` von 15:51 MESZ (jetzt in `docs/archiv/logbuch-phase-8.md`), ca. 15:55 bis 17:32 MESZ; Session insgesamt 2026-10-18 00:48 bis 17:32 MESZ mit langen Pausen.
- **Bearbeitet:** kein Produktcode. 8.9 und 8.11 bestätigt und abgeschlossen (PR #171, gemergt `ad05dce`). 8.13 erledigt: Vision-Abgleich mit Drift-Korrekturen, Onboarding-Pfad auf frischem Worktree, V.35 mit dem Eigentümer durchgegangen, Pflichtfrage mit getrennter Instanz (ADR-089), Planung von Phase 9 (ADR-090). Phase 8 abgeschlossen und archiviert, Logbuch verdichtet.
- **Nächster Schritt:** 9.1 Gliederung im Server verlässlich – zu Beginn Vorlage α (Abschnitte in Markdown) gegen β (Felder im Dateikopf), Entscheidungs-Klasse; 9.2 (End-to-End-Tests, Routine) kann daneben laufen. Beim Eigentümer: Probe mit einer Gast-Figur (Eingangskriterium 9.13), D.11 bis 2026-10-31.
- **Offen:** Pull Request für den Phasenabschluss (Branch `docs/8.13-phasenabschluss`) nach grüner CI zusammenführen; NFR Kontexttreue bleibt bis 9.14 `[VORLÄUFIG]`.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session` um 17:32 erneut abgefragt). 0 Schritte oberhalb der Empfehlung (8.13 empfiehlt Entscheidung). Die getrennte Bewertung lief als Unteragent mit Sonnet (Methodik, nicht Kostenabgabe; ca. 20 min, 100 Werkzeugaufrufe). Routine-Teilarbeiten (Archivierung, Logbuch-Verdichtung, README, Fahrplan-Status) per Skript im geladenen Kontext, nicht abgegeben.
- **Kontextgröße:** über die Sitzungsabfrage nicht feststellbar; Regel „Sessiongröße“ entfiel.
- **Sessionende-Prüfungen:** README synchron (Phase 9, 0 von 15, „Nächste Schritte“). Drift: ADR-089 und ADR-090 verweisen auf vorhandene Schritte 9.1–9.15; Modulnamen und FR-IDs der Phase 9 vorhanden; Reifegrade unverändert, `docs/architecture.md` Abschnitt 9 auf Stand ADR-088; Reaktiv-Quote 1/10 (ADR-081–090, nur ADR-082); keine aktiven Blocker; Phase 9 mit 15 Schritten (Schwelle 30). Ablaufdaten-Register: kein Vorlauf erreicht (D.1 ab 2026-11-05, mypy 2 am 2026-11-06). Archiv: Phase 8 → `docs/archiv/fahrplan-phase-8.md`; Logbuch 223 Zeilen, project-context 348 Zeilen – kein Trigger. Vision-Abgleich an der Phasengrenze in 8.13 erledigt.
- **Abweichungen:** Das Zusammenführen von #171 auf ein bloßes „Weiter“ lehnte die Rechteprüfung ab; danach per Auswahlfrage ausdrücklich freigegeben. Erste Antwort der Session auf Englisch (Erinnerung „Antworten auf Deutsch“ angelegt).

### 2026-10-18 – [ADR-ANGELEGT] ADR-089 Pflichtfrage nach Phase 8, ADR-090 Planung Phase 9

- ADR-089: gezielt umbauen (9.1 Gliederung im Server verlässlich mit Vorlage α/β, 9.2 End-to-End-Tests), Bewertung der getrennten Instanz unverändert in `docs/research/bewertung-phase-8.md`, Stellungnahme daneben. ADR-090: Phase 9 mit 15 Schritten in der Reihenfolge des Eigentümers (Fundament, Kanon, Bilder, Verwaltung, Erkundung, Gäste, Kontexttreue); V.34–V.37 übernommen, V.20, V.21, V.23, V.24, V.33 → 9.15. Kontexttreue auf Wunsch des Eigentümers nicht jetzt befördert, sondern in 9.14 neu gemessen. Beide `[STRATEGISCH]`, auf der Entscheidungs-Klasse vorgelegt (Opus 5.5); Reaktiv-Quote 1/10.

### 2026-10-18 – [PHASEN-WECHSEL] Reflexion Phase 8 (UMSETZUNG) → Phase 9 (UMSETZUNG)

- **Gelernt:** Der Umbau vor neuen Funktionen wirkte messbar: `canon/service.py` 878 → 349 Zeilen, `WorldMaps.tsx` 716 → 86, Abdeckung Python 98,88 → 99,84 %, Oberfläche 94,45 → 98,84 % Zeilen; die Ratsche der Mindestwerte hielt die ganze Phase.
- **Gelernt:** Proben nach Regel-002 mit 3 Läufen je Seite können Streuung als Befund zeigen; erst 6 Läufe klärten 8.11. Ein Ergebnis-Satz („alle Mittelwerte in der Spannweite“) war weiter gefasst als die Tabelle – Ergebnis-Sätze vor dem Vorlegen Zeile für Zeile gegen die Zahlen prüfen.
- **Gelernt:** Am selben Tag liefen eine Cloud-Session und eine Session auf dem Mac; nicht hochgeladene Commits sieht die andere Session nicht. Nach langer Pause vor dem nächsten Schritt `origin/main` prüfen.
- **Kippende Annahmen:** Die Gliederung eines Eintrags („Aussehen“, „Geografie – …“) galt nach 8.4 als gelöst; tatsächlich kennt sie vor allem die Oberfläche, der Server sieht Textblöcke, vier Stellen erkennen Namen je eigener Regel (Bewertung, Befund 1) → 9.1.
- **Reifegrad:** unverändert `[BELASTBAR]`; NFR Kontexttreue `[VORLÄUFIG]` – die Beförderung lag seit 2026-10-11 ohne Schritt (Vision-Abgleich), jetzt 9.14.
- **ADRs der Phase:** 082–090 (082 `api` → `storage` reaktiv, 083 Abschnitte ersetzen, 084 Bildvorlagen, 085 Kurzfassung, 086 Weltenbauer im Wortlaut, 087 Weltenbauer aus dem Manuskript, 088 Verweise, 089 Pflichtfrage, 090 Planung Phase 9); Reaktiv-Quote 1/10.
- **Wucherung:** 13 → 13 Schritte; neue Wünsche als V.33–V.37 mit Landeplatz 8.13.
- **Getrennte Instanz:** für die Pflichtfrage (Sonnet, ohne Gesprächsverlauf, 20 min); bei 8.11 keine vollständige Handbewertung der Widersprüche.
- **Neue Erkundungsbedarfe:** Quellen für Worldbuilding und Namen, eigener Recherche-Baustein (9.12); Kontexttreue (9.14); Speicherlayout der Verbrauchsdateien (9.11).
- **Methodik-Lehren:** Die Drift-Prüfung am Sessionende vergleicht die Reifegrad-Tabelle mit den ADRs, nicht die NFR-Texte (Abschnitt 6) und Modulbeschreibungen (Abschnitt 3) – beide waren veraltet; erst Vision-Abgleich und Bewertung fanden es. Zusammenführen eines Pull Requests braucht eine ausdrückliche Freigabe; ein bloßes „Weiter“ lehnte die Rechteprüfung ab.
- **Details:** [`docs/archiv/logbuch-phase-8.md`](archiv/logbuch-phase-8.md)

### 2026-10-13 – [PHASEN-WECHSEL] Reflexion Phase 7 (UMSETZUNG) → Phase 8 (UMSETZUNG)

- **Gelernt:** Prüfaufträge quer über alle KI-Bereiche (D.18) finden Mischungen *innerhalb* von Einträgen, die Tests je Funktion nicht sehen (doppelte Abschnitte, Vorlagen aus dem ganzen Text). Die Zählung in den echten Daten danach (0 von 133) trennt Bauart-Risiko von eingetretenem Schaden.
- **Gelernt:** Große Bild-Themen vorab zuschneiden (ADR-072: fünf Teilschritte) hielt jeden Schritt prüfbar; jede Teilvorlage brachte aber neue Schritte (7.14, 7.15) – Phase an der Wucherungs-Schwelle.
- **Gelernt:** Bestätigungen des Eigentümers sammeln sich, wenn mehrere Schritte gleichzeitig „eingespielt, wartet“ sind (zeitweise sieben); vor einem Phasenabschluss gebündelt abfragen.
- **Kippende Annahmen:** Testabdeckung hält sich nicht von selbst – Oberfläche 98,16 → 94,45 %, weil die Schwellen 80/70 weit unter dem Ist lagen (Bewertung, Befund 3).
- **Reifegrad:** unverändert `[BELASTBAR]`; Tabelle in `docs/architecture.md` Abschnitt 9 ist nachzuziehen (8.1).
- **ADRs der Phase:** 069–081 (072 Bilder und Karten, 073 Karten, 074 Bilder beschreiben, 077 Bilder erzeugen, 078 Aussehen, 079 Markierungen, 080 Pflichtfrage, 081 Planung Phase 8); Reaktiv-Quote 0/10.
- **Wucherung:** 8 → 16 Schritte; Schwelle > 16 erreicht, nicht überschritten.
- **Getrennte Instanz:** bei 7.6, 7.10–7.13 (Sicherheit, keine Befunde hoch/mittel) und für die Pflichtfrage (Sonnet).
- **Neue Erkundungsbedarfe:** wandernde Figuren (8.12); Kosten von Regeln im Wortlaut für den Weltenbauer (8.7).
- **Methodik-Lehren:** Die Onboarding-Prüfung im Worktree verbiegt jedes Mal den gemeinsamen Pre-Commit-Hook (dreimal) – jetzt fester Teil des Ablaufs im Runbook (Abschnitt 8). Sessionstart auf dem Mac prüft den Server mit genau einer gebündelten SSH-Abfrage.
- **Details:** [`docs/archiv/logbuch-phase-7.md`](archiv/logbuch-phase-7.md)

### 2026-10-12 – [PHASEN-WECHSEL] Reflexion Phase 6 (UMSETZUNG) → Phase 7 (UMSETZUNG)

- **Gelernt:** Bei Fremdformaten den schreibenden Code des Herstellers lesen, nicht nur die Spezifikation (Hinweis des Eigentümers in 6.8): SillyTavern schreibt `chara` und `ccv3`, Lorebooks mit `comment`/`enabled`.
- **Gelernt:** Kopfzeilen und Sicherheitsregeln immer auch von außen prüfen – der Proxy überschrieb die CSP der App (6.6). Die getrennte Prüfung des Codes allein sah das nicht.
- **Gelernt:** Erst messen, dann entscheiden: der Spike 6.13 belegte den Schaden fehlender Kanon-Einträge (4,0/3,3 statt 0/0,7 Widersprüche je Kette) und machte 6.3 zur klaren Entscheidung; die Technik-Prüfung an der Geschichte des Eigentümers zeigte 0–28 → 34 von 34 Einträgen.
- **Gelernt:** Sichtproben mit Sonderfunktionen (`@`) Zeichen für Zeichen tippen; Einfügen am Stück übersah das fehlende `@`-Menü im Weltenbauer (6.7).
- **Gelernt:** Beim Einspielen nur über HTTPS warten, dann eine SSH-Abfrage – eine SSH-Schleife sperrte den Zugang vorübergehend.
- **Kippende Annahmen:** Websuche „ca. 1 ct“ – tatsächlich 5–7 ct je Antwort, weil Suchergebnisse als Eingabe zählen (6.7). Pauschaler Überschriften-Versatz im Import aus 6.8 hätte Gegenstände beim Rückimport verformt (6.9, angepasst).
- **Reifegrad:** unverändert `[BELASTBAR]`; NFR Kontexttreue beim Referenzumfang mit 6.3 und der Prüfung an der Geschichte des Eigentümers gestützt.
- **ADRs der Phase:** 059–068 (062 Kanon vor den Seiten, 063 Schutz, 064 Weltenbauer, 065/066 SillyTavern, 067 Pflichtfrage, 068 Planung Phase 7); Reaktiv-Quote 0/10.
- **Wucherung:** 12 → 14 Schritte (+6.13 Spike, +6.14 als Ausnahme auf Wunsch des Eigentümers); Schwelle > 15 nicht erreicht.
- **Getrennte Instanz:** fünfmal eingesetzt (Schutz 6.4–6.6, Import 6.8 mit Nachprüfung, Import-Änderung 6.9, Pflichtfrage); fand u. a. ein kubisch langsames Muster im bestehenden Markdown-Import.
- **Neue Erkundungsbedarfe:** Ablage von Bilddateien (7.6), Format für das Publizieren (7.4), V.20 (Figurenkarten im Netz finden).
- **Methodik-Lehren:** Phasenregeln (ADR-060: neue Wünsche → V-Schritte) vor dem ersten Mockup prüfen; Session erneut weit über der Kontextgrenze (dauerhaftes „weiter hier“ des Eigentümers).
- **Details:** [`docs/archiv/logbuch-phase-6.md`](archiv/logbuch-phase-6.md)

### 2026-10-11 – [PHASEN-WECHSEL] Reflexion Phase 5 (UMSETZUNG) → Phase 6 (UMSETZUNG)

- **Gelernt:** Die größten Verbesserungen kamen aus den Befunden des Eigentümers bei echter Nutzung (Einleitungs- und Schlusssätze, Scrollen, Chat-Aufbau, Smartphone), nicht aus Tests; Befunde sofort mit Code-Stelle festhalten und einordnen, dann bauen.
- **Gelernt:** Wirkung von Anweisungen nur mit festem Prüfverfahren belegen: Probeschreiben nach Regel-002 mit mehreren Läufen und verblindeter Bewertung (ADR-047); einzelne Läufe belegen nichts.
- **Gelernt:** Bei einem Wunsch nach „Skript“ erst die Form klären (einmaliger Befehl oder gepflegtes Werkzeug); der Schlüsseltausch wurde am Ende ein einzelner Terminalbefehl, das fertige Skript wurde verworfen. Bei Abfragen mit Inhalt der Geschichte des Eigentümers nur Art und Größe ausgeben, keine Titel.
- **Kippende Annahmen:** grok-4.7 als Modell für den Alltag – Sperren bei echten Genres und 44–157 s bis zum ersten Textstück (ADR-044, ADR-052); grok-4.6 wurde Voreinstellung, grok-4.7 bleibt wählbar. Der Referenzumfang (D.4) ließ sich nur hochrechnen; dabei blieb eine Kanon-Lücke offen (ADR-057).
- **Reifegrad:** NFR Reaktionszeit `[BELASTBAR]` → `[VORLÄUFIG]` → `[BELASTBAR]` (ADR-051, ADR-052); NFR Kontexttreue Referenzumfang `OFFEN` → `[VORLÄUFIG]` (Beförderung nach 6.3); Secrets im Betrieb bleibt `[VORLÄUFIG]` bis D.11.
- **ADRs der Phase:** 044–060 (u. a. 047 Probeschreiben, 048 Service Worker, 053 Schreibweise, 055 Modell-Katalog, 056 Verlauf der Anweisungen, 057 Nachweis D.4, 058 v1.0.0 mit Verzicht auf den menschlichen Blick, 059 Planung Phase 6, 060 Pflichtfrage); Reaktiv-Quote 0/10.
- **Wucherung:** 13 → 26 Schritte durch Befunde des Eigentümers im Alltag; Schwelle erreicht, nicht überschritten; 24 erledigt, 2 verschoben (5.4 → V.16, 5.25 → V.13 → 6.4).
- **Neue Erkundungsbedarfe:** Kanon-Lücke aus D.4 (6.3), 6.11 und 6.12 aus der Pflichtfrage (ADR-060, weiterbauen mit Umbau), freiwillige Maßnahmen V.18 und V.19, Wortanzeige im Manuskript (V.17).
- **Methodik-Lehren:** Sessions erneut weit über der Kontextgrenze auf Anweisung; 5.26 wurde doppelt begonnen, weil die Arbeit einer anderen Session übersehen wurde – vor Beginn eines Schritts Stand von `origin/main` prüfen.
- **Details:** [`docs/archiv/logbuch-phase-5.md`](archiv/logbuch-phase-5.md)

### 2026-10-08 13:15 UTC – [PHASEN-WECHSEL] Reflexion Phase 4 (STABILISIERUNG) → Phase 5 (UMSETZUNG)

- **Gelernt:** Das Gate vor dem ersten öffentlichen Deployment hat getragen: Host, Netz, Sicherung mit echter Wiederherstellung und Notfall-Handbuch lagen vor dem 30.09.; kein Sicherheitsvorfall.
- **Gelernt:** Erst die echte Nutzung zeigte die wichtigsten Mängel: Modell-Sperren bei echten Genres, Einleitungs- und Schlusssätze, Scrollen, unübersichtliche Oberfläche. Tests und Probeschreiben mit Testwelten fanden sie nicht.
- **Gelernt:** Befunde vom Eigentümer sofort mit Code-Stelle festhalten und einordnen, ohne gleich zu bauen; Entscheidungen über das Frage-System gehen auch vom Handy.
- **Kippende Annahmen:** Startmodell grok-4.7 ungeeignet für die echten Inhalte (Kanon-Treue gemessen mit qwen3.8-max); 1-Mio.-Kontextfenster sind wegen des Budgets von 30.000 Token nicht nötig; ein „Guthaben“ des Coding-Agents war irrelevant.
- **Reifegrad:** Host, Netz, Backups, Bedrohungsmodell `[BELASTBAR]`; NFR Kanon-Treue `[BELASTBAR]`; Secrets im Betrieb `[VORLÄUFIG]` bis D.11.
- **ADRs der Phase:** 025–043; reaktiv 0; Quote 0/10.
- **Wucherung:** 8 → 16 Schritte (Infrastruktur-Befunde und Funktionstest); STOPP beim 17., Neuplanung mit getrennter Instanz (ADR-042).
- **Neue Erkundungsbedarfe:** D.13 (Sperren im Text erkennen), D.4 (Referenzumfang) bleibt; grok-4.5 über 5.12 prüfen.
- **Methodik-Lehren:** Sessions erneut weit über der Kontextgrenze auf Anweisung; `pkill -f`/`pgrep -f` treffen die eigene Shell, wenn das Muster im Befehl steht (Muster mit `[u]vicorn` schreiben); Markdown-Linter verlangt echte Überschriften statt fetter Zeilen.
- **Details:** [`docs/archiv/logbuch-phase-4.md`](archiv/logbuch-phase-4.md)

### 2026-10-08 13:05 UTC – [ONBOARDING-VALIDATION] Phasenabschluss 4 und Versionsänderung (Trigger 3, DoD)

- **Form (Klasse M):** frischer Worktree von `fb912f4` im Scratchpad, eigenes Datenverzeichnis; README-Quick-Start wie dokumentiert: `uv python install 3.14.7`, `uv sync --frozen --python 3.14.7`, `npm ci` (0 Schwachstellen), `uv run pre-commit install`, `uv run skriptorium-einrichtung` (Exit 0; Ausgabe mit dem Einrichtungscode nicht angezeigt), `npx vite build`, uvicorn.
- **Ergebnis:** `/api/health` → `{"status":"ok"}`; `/` → 200; `/api/worlds` ohne Sitzung → 401; Server-Log nur eine erwartete Warnung „ki-anbieter nicht eingerichtet“ (kein Schlüssel, README: Tests ohne Schlüssel). `pytest --cov`: 410 bestanden, 99,79 %; `vitest --coverage`: 102 bestanden, 98,67 % Zeilen, 96,53 % Zweige. `scripts/session-start.sh` im Worktree: Exit 0. Pre-Commit-Hook danach im Haupt-Checkout neu installiert.
- **Befund:** keiner im Onboarding-Pfad. End-to-End-Tests laufen im CI-Job.

### 2026-10-08 13:00 UTC – [ADR-ANGELEGT] ADR-043 v0.1.0 als Vorabversion

- Vision-Checkpoint vor Go-Live: offene Elemente D.4 (FR-010 teilweise), 5.1, 5.2, 5.3; V.1/V.2 laut Vision nicht in der ersten Version; kein externer Blick. Vorgelegt als `ENTSCHEIDUNG ERFORDERLICH`; Eigentümer: „A: Vorabversion“ (Frage-System). Go-Live vor v1.0.0 in 5.14.

### 2026-09-27 12:42 – [SESSIONENDE] Phase 3 abgeschlossen

- **Dauer:** 12:18–12:42 UTC.
- **Bearbeitet:** Phasenabschluss 3 – Bewertung durch getrennte Instanz (Sonnet 5), Stellungnahme, `ENTSCHEIDUNG ERFORDERLICH`, ADR-024 (weiterbauen; Aufteilung `StoryPage.tsx` in 4.1; Kanon-Treue in 4.8); Vision-Re-Derivations-Pass; Onboarding-Re-Validation; Archivierung Fahrplan Phase 3 und Logbuch-Verdichtung (Phasenabschluss-2-Einträge ins Phase-2-Archiv nachgetragen).
- **Vision-Abgleich (Befund):** Jedes Vision-Element hat eine Schritt-ID oder Descope-ADR; zwei Befunde behoben: 5.5 um V.4/V.5 ergänzt; Kanon-Treue beim Schreiben des Eigentümers mit Landeplatz 4.8 (ADR-024). Muss-Anforderungen: offen nur FR-022 (4.8) und FR-010 Referenzumfang (D.4).
- **Erreichter Stand:** Phase 4 „Stabilisierung und erstes öffentliches Deployment“ bereit; kein aktiver Schritt.
- **Offen:** Pull Request für diesen Branch (Merge nach grüner CI und Zustimmung des Eigentümers).
- **Nächster Schritt:** neue Session – Phase 4 verfeinern, dann 4.1 Qualitäts-Härtung.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 12:40). Schritte oberhalb der Empfehlung: 0 (Phasenabschluss verlangt Entscheidung). Abgegeben: Bewertung an Unteragenten mit Sonnet 5 (getrennte Instanz, keine Routine-Abgabe).
- **Kontextgröße:** 203.795 Token laut Sitzungsabfrage 12:40 – knapp über der Grenze 200.000 nach dem Phasenabschluss; kein neuer Schritt in dieser Session. Sitzungskosten laut Abfrage ca. 4,23 $. Kurzzeitlimit `allowed`.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Architektur-Reife, Nächste Schritte); project-context Status auf Phase 4; Runbook „Geprüft am“ aktualisiert. Drift-Prüfung: Schritt-Referenzen der ADRs existieren (1.x–3.x im Archiv, 4.6, D.4); ADR-024 → 4.1, 4.8 vorhanden; Modul-Liste unverändert; Reifegrad Kanon-Treue ↔ ADR-024 passt; Reaktiv-Quote 1/10 über ADR-015..024; Phase 4 unverändert 8 Schritte; Blocker 0; Anforderungen unverändert. Ablaufdaten-Register: kein Vorlauf erreicht (Guthaben-Vorlauf ab 2026-10-22). Archivierung: Fahrplan Phase 3 → `docs/archiv/fahrplan-phase-3.md`, Logbuch Phase 3 → `docs/archiv/logbuch-phase-3.md`; Abschnitte „Iterations-Reflexion“ und „Archiv“ im Fahrplan nachgezogen (standen noch auf Phase 1). project-context 338 Zeilen.

### 2026-09-27 12:39 – [PHASEN-WECHSEL] Reflexion Phase 3 (UMSETZUNG) → Phase 4 (STABILISIERUNG)

- **Gelernt:** Abnahme je Schritt mit echten Läufen und blinder Bewertung trägt – billig (unter 2 $ für die ganze Phase) und findet, was Tests nicht zeigen (Figuren-Schreibweise, Kurzfassungen, Gäste).
- **Gelernt:** Die Figuren-Schreibweise war die größte Schwäche: 20 Verstöße in 15 Texten (3.3) → 0 eindeutige nach geschärfter Regel plus Erinnerung nach der Anweisung (3.4).
- **Gelernt:** Kapitel-Kurzfassungen tragen den Handlungsstand: 3 von 3 Fortsetzungen richtig mit, 0 von 3 ohne (3.6).
- **Gelernt:** Lücken vor Beginn eines Schritts per Frage-System vom Eigentümer entscheiden lassen – keine Rate-Implementierung in der Phase.
- **Kippende Annahmen:** Reaktionszeit verfehlt (grok-4.7 einmal 77 s, grok-4.6 13–16 s; ADR-022, D.6); Kurzfassungen länger als vorgegeben (D.4); 3.7 und 3.8 berührten weniger Module als geplant (`manuscript` unverändert).
- **Reifegrad:** `context`, `ai_gateway`, SSE durch Umsetzung validiert; Metriken `[BELASTBAR]` (ADR-023); Reaktionszeit zurück auf `[VORLÄUFIG]` (ADR-022); Kanon-Treue `[VORLÄUFIG]` bis 4.8 (ADR-024).
- **ADRs der Phase:** 021–024; reaktiv 0; Quote 1/10 (ADR-015..024).
- **Neue Erkundungsbedarfe:** D.6 vor 4.8; D.4 (Referenzumfang, Kurzfassungslänge). Beobachten: Größe der Oberflächen-Dateien (Aufteilung in 4.1, ADR-024), Wachstum von `spikes/`.
- **Methodik-Lehren:** Sessions liefen wieder weit über die Kontextgrenze (bis ca. 360.000 Token) auf ausdrückliche Anweisung; Phasenabschluss erneut in eigener Session. Regelverstoß `git push -f` ohne Stopp (3.4, kein Schaden) – künftig nur nach Freigabe. Playwright: Auswahlfelder über ihre Rolle ansprechen. ruff RUF001/RUF002: kein Gedankenstrich in Python-Strings und Docstrings.
- **Details:** [`docs/archiv/logbuch-phase-3.md`](archiv/logbuch-phase-3.md)

### 2026-09-27 12:38 – [ADR-ANGELEGT] ADR-024

- Pflichtfrage Phasenende 3: Eigentümer wählt Empfehlung A – weiterbauen; `StoryPage.tsx` (und bei Bedarf `WritingPanel.tsx`) in 4.1 aufteilen; Kanon-Treue beim echten Schreiben des Eigentümers in 4.8 messen (Frage-System). `[STRATEGISCH]`; Bewertung der getrennten Instanz (Sonnet 5) und Stellungnahme im ADR nebeneinander. Die in ADR-020 verlangte erneute Prüfung von `api` auf Heuristik 1.4 ist erfolgt: kein Gott-Modul.
- Befund 2 des Vision-Abgleichs damit aufgelöst: 4.8 ist Landeplatz für die Beförderung von NFR Kanon-Treue.

### 2026-09-27 12:24 – [BEOBACHTUNG] Vision-Re-Derivations-Pass Phasenende 3

- **Quelle:** `docs/vision.md` vollständig, `docs/requirements.md` Abschnitte 3 und 5, Fahrplan Phasen 4, 5 und Querschnitt.
- **Ergebnis:** Kernidee, fünf Szenarien, sechs Erfolgskriterien, Abgrenzungen, harte Randbedingungen und weiche Präferenzen haben je eine Schritt-ID oder eine Descope-ADR. Muss-Anforderungen: 15 erledigt, FR-010 teilweise (Referenzumfang D.4), FR-022 offen (4.8), FR-006 verworfen (ADR-009). Soll/Kann: FR-014 → 5.1, FR-019 → 5.2, FR-020 → 5.3, FR-023 → 5.4, FR-021 erledigt. Anwendungsfälle UC-001 bis UC-014 alle enthalten; Ausschlüsse unverändert. Keine `[VERSCHOBEN]`-Zeile mit Ziel in Phase 3. Keine `TODO`/`FIXME` in `src/`, `ui/src/`, `tests/`.
- **Befund 1 (Drift):** V.4 und V.5 nennen 5.5 als Landeplatz, 5.5 führt unter „Zu tun“ und „Akzeptanzkriterien“ aber nur V.1–V.3 → 5.5 um V.4 und V.5 ergänzen.
- **Befund 2 (Landeplatz fehlt):** Erfolgskriterium „höchstens ein Kanon-Widerspruch pro Kapitel, der beim Redigieren auffällt“ (Vision 4) ist nur im Probeschreiben der KI gemessen (3.3, blind bewertet); die Reifegrad-Übersicht führt NFR Kanon-Treue `[VORLÄUFIG]` mit „wartet auf Schreibbetrieb des Eigentümers“ – ohne Schritt-ID. Vorschlag an den Eigentümer mit der Pflichtfrage.

### 2026-09-27 12:21 – [ONBOARDING-VALIDATION] Phasenabschluss 3 (Trigger 3)

- **Form (Klasse M):** frischer Worktree von `c0325f4` im Scratchpad, eigenes Datenverzeichnis; README-Quick-Start exakt wie dokumentiert: `uv python install 3.14.7`, `uv sync --frozen --python 3.14.7`, `npm ci` (0 Schwachstellen), `uv run pre-commit install`, `uv run skriptorium-einrichtung` (Exit 0; Ausgabe mit dem Einrichtungscode nicht angezeigt), `npx vite build`, uvicorn.
- **Ergebnis:** `/api/health` → `{"status":"ok"}`; `/` → 200; `/api/worlds` und `/api/usage` ohne Sitzung → 401; Server-Log nur mit Metadaten, ohne Warnung. `pytest --cov`: 377 bestanden, 99,78 %; `vitest --coverage`: 96 bestanden, 98,17 % Zeilen, 96,01 % Zweige. Smoke-Test `scripts/session-start.sh` im Worktree: Exit 0.
- **Befund:** keiner im Onboarding-Pfad. Pre-Commit-Hook nach dem Entfernen des Worktrees im Haupt-Checkout neu installiert (Runbook-Pflicht). End-to-End-Tests nicht im Worktree wiederholt (CI-Job End-to-End).

### 2026-09-27 12:20 – [SESSIONSTART] Phasenabschluss 3

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 12:20) → Entscheidungs-Klasse. Der Phasenabschluss enthält einen `ENTSCHEIDUNG ERFORDERLICH`-Block (Eskalations-Auslöser 1) – Klasse passt, kein Stopp.
- **Kontextgröße:** 0 Token laut Sitzungsabfrage (neue Session; Wert bei Sessionbeginn nicht aktualisiert). Kurzzeitlimit (5 Stunden) `allowed`.
- PR #17 gemergt (`c0325f4`); Branch `claude/phasenabschluss-3-mi6vna` steht auf `main`.
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2 (project-context, Logbuch ab letztem Sessionende, Fahrplan Stand und Phase 3, Architektur 1/2/9, Decisions A/C, aktive Blocker: keine).
- **Vorhaben:** Pflichtfrage „Weiterbauen, umbauen oder neu aufsetzen“ mit getrennter Instanz (inkl. erneuter Prüfung `api` auf Heuristik 1.4, ADR-020); Vision-Re-Derivations-Pass gegen `docs/vision.md` und `docs/requirements.md`; Onboarding-Re-Validation (Trigger 3); nach der Entscheidung ADR, Archivierung von Phase 3, Logbuch-Verdichtung.

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
| `[GELÖST]` (bis Phase 2: `[PROBLEM-GELÖST]`) | Nach Behebung eines Problems, das Reibung war | Empfohlen, alle Mini-Probleme erfassen |
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
