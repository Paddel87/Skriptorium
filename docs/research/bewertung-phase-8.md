# Bewertung am Ende von Phase 8 (getrennte Instanz)

Pflichtfrage „Weiterbauen, umbauen oder neu aufsetzen?“ (`CLAUDE.md` Abschnitt 12) in Schritt 8.13, 2026-10-18. Bewertet von einem Unteragenten mit Sonnet ohne Gesprächsverlauf, nur lesend. Der Text bis zur Stellungnahme ist die Bewertung unverändert (nur in Markdown-Form gebracht); die Stellungnahme der bauenden KI steht getrennt am Ende.

**Tatsächlich gelesen:**

- Code: vermessen per AST und grep (`src/` 74 Dateien, `ui/src/` 104 Quell- und 37 Testdateien, `tests/`, `e2e/`). Gezielt gelesen:
  - Python: `canon/{models,entries,headers,service}.py`, `storage/{frontmatter,store}.py`, `api/{usage,context,app,image_routes,canon_routes}.py`, `context/{parts,writing,worldbuilder,summaries}.py`, `manuscript/{models,epub}.py`, `ai_gateway/images.py`.
  - UI und Konfiguration: `ui/src/{sections,imagePrompts,references}.ts`, `ui/src/views/EntryForm.tsx`, `ui/fake-api.ts`, `.github/workflows/ci.yml`, `pyproject.toml`, `vite.config.ts`.
- Dokumente:
  - `architecture.md` ganz.
  - `decisions.md` Teil A, ADR-080 bis 088, dazu ADR-003, ADR-023, ADR-078.
  - `fahrplan.md`: Kopf, Übersicht, Phase 8 (8.1–8.13), V.20–V.24, V.33–V.37.
  - `vision.md` ganz, `requirements.md` nur die Anforderungstabelle.
  - `bewertung-phase-7.md` ganz, `wandernde-figuren.md` ganz, `datentrennung-ki-bereiche.md` bis B4.
  - `project-context.md` und `blockers.md` nur gezielt.
- Nicht gelesen: `logbuch.md`, `onboarding-runbook.md`, `spikes/`, übrige ADRs und `research/`-Berichte.

**Tatsächlich ausgeführt:**

- `uv run pytest -q --cov`, `uv run ruff check`, `uv run mypy src tests`, `npx vitest run --coverage` (zweimal), `npx tsc --noEmit`.
- Zusätzlich zur Liste: `ruff format --check`, `eslint . --max-warnings 0 --report-unused-disable-directives`.
- Hilfsskripte im Scratchpad, nicht im Repo: AST-Auswertungen und ein Zeitmesser für `UsageLog` in einem Temp-Verzeichnis.
- Nicht ausgeführt: Playwright, bandit, pip-audit, npm audit, prettier, Build. Kein Netz, kein Server.
- Berichtsdateien: nur ignorierte (`.coverage`, `.mypy_cache`, `.ruff_cache`). `git status --short` war danach leer.

**Stand:** Branch `docs/8.13-phasenabschluss`. Beginn war `ad05dce`. Während der Bewertung kamen `28e98b4` und `1cc2ad9` dazu. Sie ändern nur `architecture.md`, `fahrplan.md`, `logbuch.md` und `requirements.md` (`git diff ad05dce --stat`). Die neue Sicht des Eigentümers zu V.35 (2026-10-18) ist berücksichtigt.

**Vergleichbarkeit:** Hook-Dichte und UI-Funktionslängen sind Regex-Heuristiken. Ihre Methode weicht von der Vorbewertung ab, die Werte sind daher nicht 1:1 vergleichbar.

## (a) Messwerte

- **Umfang** (Phase 7 in Klammern):
  - Python `src` 10.703 Zeilen in 74 Dateien (10.002, +7 %); `tests` 9.828 in 57 Dateien (8.885, +10,6 %).
  - UI ohne Tests 13.022 Zeilen (11.555, +12,7 %), davon `ui/src` 12.765 in 104 Dateien; `styles.css` zusätzlich 2.328. UI-Tests 10.611 in 37 Dateien (7.466, +42 %).
  - e2e 603 Zeilen, 11 Tests, unverändert; die letzte Änderung war am 2026-10-10 (`6b6b2af`).
  - 767 Commits (723, +44); 88 ADRs (79). Zusammen etwa 44.800 Zeilen ohne CSS.
- **Testverhältnis:** Python 0,92 (0,89), UI 0,81 (0,65). Behauptungsdichte: 1.583 `assert` und 162 `pytest.raises` bei 583 Testfunktionen; 1.283 `expect(` bei 398 UI-Tests. Rein formal fehlt nur einer Testfunktion jede Behauptung (grobe Prüfung).
- **pytest:** 805 bestanden in 23,4 s (734). Coverage 99,84 % (98,88 %): 4.574 Statements, 0 verfehlt, 1.090 Zweige, 9 teilweise offen. Unter 100 % sind 5 von 74 Dateien, alle nur wegen Zweigen:
  - `ai_gateway/openrouter.py` 99 % (160->exit)
  - `api/auth_routes.py` 99 % (132->134)
  - `api/flows/summary.py` 97 % (151->148, 155->157)
  - `api/flows/writing.py` 99 % (237->239, 239->exit)
  - `context/manuscript_hits.py` 98 % (179->184, 193->exit, 195->193)
- **ruff check** sauber; **ruff format --check** 131 Dateien formatiert; **mypy** (strict laut `pyproject.toml`) 131 Dateien (`src` und `tests`) ohne Befund; **eslint** 0 Meldungen; **tsc** 0 Fehler.
- **vitest:** 37 Dateien, 398 Tests grün in 8,3 s (32 / 273).
  - Statements 98,65 % (2.928/2.968), Zweige 95,07 % (1.794/1.887), Funktionen 97,86 % (1.008/1.030), Zeilen 98,84 %. In Phase 7 waren es 94,29 / 89,79 / 93,59 / 94,45. 54 von 104 Dateien sind in allen vier Maßen bei 100 %.
  - Schwächste Dateien nach Statements: `Menu.tsx` 75 % (Funktionen 50 %), `MapStage.tsx` 85,7 %, `WorldPage.tsx` 90,3 % (Funktionen 76,9 %), `ConnectionNote.tsx` 90,9 %, `ChapterSummary.tsx` 91,7 %, `StoryPage.tsx` 92,3 %.
  - Schwächste Dateien nach Zweigen: `useChapterDraft.ts` 50 %, `ThemeChoice.tsx` 66,7 %, `ImportDialog.tsx` 80 %.
  - Die Problemdateien aus Phase 7 (`files.ts`, `StoryCover`, `AppearanceExtract`) sind jetzt vollständig oder fast vollständig abgedeckt.
- **Schwellen gegen Ist:**
  - pytest `fail_under = 99` (`pyproject.toml:73`) gegen 99,84, Puffer 0,84.
  - vitest Zeilen 98 / Anweisungen 98 / Funktionen 97 / Zweige 94 (`vite.config.ts:64`) gegen 98,84 / 98,65 / 97,86 / 95,07, Puffer 0,84 / 0,65 / 0,86 / 1,07.
  - Die CI-Schrittnamen nennen noch „80 %“ und „80 % Lines, 70 % Branches“ (`ci.yml:65`, `ci.yml:96`).
- **Suppressions:** 24, unverändert. 12 in `src` (alle `noqa: N818`, begründet). 12 in `tests` (8× `type: ignore`, 2× S314, 2× S105, alle mit Begründung). UI: `eslint-disable`, `@ts-ignore`, `@ts-expect-error` und `any` je 0.
- **TODO:** 0× `TODO(fahrplan-ref`, 0 unmarkierte TODO/FIXME/HACK, kein `NotImplemented` oder Stub.
- **Modulgrenzen** (AST, 244 Importkanten zwischen 74 Dateien):
  - Importstellen je Kante: `api`→`ai_gateway` 11, `canon` 5, `context` 8, `manuscript` 6, `storage` 13; `canon`→`storage` 11; `context`→`canon` 8, `manuscript` 4; `manuscript`→`storage` 8.
  - Jede Kante steht in der Karte (`architecture.md:37-51`). Es gibt keine Kante `canon`↔`manuscript`; `ai_gateway` und `storage` importieren kein Fachmodul; `context` importiert weder `ai_gateway` noch `storage` noch `api`.
  - Zyklen: keine fachlichen. Zwei formale Paket-Zyklen entstehen durch Import über das eigene Paket (`storage/store.py:19`, `api/app.py:29`).
  - Private Importe über Dateigrenzen in `src`: 0. In `tests`: `tests/context/test_builder.py:329,768` (`_tail`, `_opening`); fünf Dateien in `tests/api/` holen Hilfen aus `test_writing.py`.
  - `api`→`storage`: 13 Importstellen, 8 davon außerhalb von `system/`: 5 Flows nur wegen Fehlertypen; `canon_routes.py:23`, `manuscript_routes.py:25`, `image_routes.py:24` wegen Größengrenzen und `inspect_image` (ADR-082).
  - Die UI ruft die Anwendungsschnittstelle nur über `ui/src/api/` auf.
- **Größte Python-Dateien** (Phase 7): `context/writing.py` 490 (441), `canon/importers/sillytavern.py` 445 (445), `ai_gateway/openrouter.py` 440, `storage/store.py` 378, `manuscript/service.py` 375, `api/manuscript_routes.py` 374, `api/writing_routes.py` 366 (333), `canon/service.py` **349 (878)**. Größte `canon`-Teile: `entries.py` 149, `maps.py` 132, `imports.py` 121, `images.py` 82. Klassen mit mindestens 15 Methoden: `CanonService` 25, `ManuscriptService` 21, `DocumentStore` 15.
- **Längste Python-Funktionen** (573 Funktionen, 3 über 50 Zeilen, vorher 4):
  - `api/app.py: create_app` 83.
  - `context/worldbuilder.py: build_worldbuilder` 78 (vorher 61); 12 Verzweigungen nach If/For/While/IfExp, 24 mit Bool-Operatoren und Comprehensions.
  - `manuscript/epub.py: epub_for` 51.
  - Knapp darunter: `stream_answer` 50, `apply_import` 49 (vorher 61), `stream_events` 48.
- **Größte UI-Dateien:** `WritingStyle.tsx` 415, `EntryImages.tsx` 410, `timeline.ts` 361 (165), `ImageGenerate.tsx` 323, `Shell.tsx` 306, `ModelManager.tsx` 299, `StoryList.tsx` 298, `CanonFact.tsx` 286, `WritingPanel.tsx` 274. **`WorldMaps.tsx` 716 → 86.**
- **Längste UI-Funktionen** (Heuristik, einschließlich JSX): `ImageGenerate` 275, `EntryImages` 232, `WritingPanel` 214, `ModelManager` 207. 35 von 226 Funktionen sind länger als 100 Zeilen.
- **Hook-Dichte:** Eingebaute React-Hooks je Datei: `InstructionEditor` 14, `ModelManager` 10, `Shell` 9 (19 mit eigenen Hooks, mehrere Komponenten, seit 7.10 unverändert), `ImageGenerate` 9, `WritingStyle` 8, `StoryList` 8. Die Kartenansicht liegt bei `WorldMaps` 1, `MapViewer` 6 (Phase 7: 29 und 18); 12 `use*.ts` in `views/`.
- **Reaktiv-Quote:** 1/10 (ADR-079 bis 088; nur ADR-082), Schwelle 30 %. Gesamt 3 von 88 ADRs reaktiv (23 strategisch, 51 operativ, 11 Erkenntnis). Ich habe ADR-083 bis 088 gegen die Fahrplan-Schritte geprüft: alle hatten dort eine Vorlage vorgesehen, ich hätte keinen umetikettiert.
- **Phasenumfang:** Phase 8 geplant mit 13 Schritten (ADR-081), jetzt 13 (Faktor 1,0; Schwelle: mehr als 26 und mindestens 5 mehr). 12 sind erledigt, 8.13 ist in Arbeit. Neue Wünsche kamen als V.33–V.37. Offen für die Planung sind 8 V-Schritte (V.20, V.21, V.23, V.24, V.33, V.34, V.36, V.37) und V.35 mit 13 Befunden, also 21 Posten.
- **Weitere Messwerte:**
  - `spikes/` im Git: 1.957 Dateien, 3,93 MB (Phase 7: 1.480, 3,26 MB), davon `regel-002` 869 Dateien.
  - `decisions.md` 2.145 Zeilen, 266 kB; die Reaktiv-Quote-Zeile in Teil A hat 8.505 Zeichen. `architecture.md` Zeile 123 hat 7.326 Zeichen.
  - Ruff-Regelsatz ohne Komplexitäts- oder Längenregeln (`pyproject.toml:46`).
  - `Config`: keine Versions- oder Migrationsmarke im Dateiformat (`grep migrat` in `src`: 0).

## (b) Befunde

Keiner der Befunde hat die Schwere hoch.

1. **[mittel] Die Abschnitts-Konvention des Kanons wird nur in der UI gelesen und geschrieben; der Server behandelt `body` als undurchsichtigen Text.**
   - Belege: `ui/src/sections.ts` (223 Zeilen), `ui/src/imagePrompts.ts:17-21` (`appearanceOf`) und `ui/src/timeline.ts` (165 → 361 Zeilen) verstehen „Aussehen“, „Geografie – Name“ und Zeitangaben. Der Server rendert den Text unverändert (`context/parts.py:153`, `context/appearance.py:42`). Der Markdown-Import hat eine eigene Liste (`canon/importers/markdown.py:32`), der Weltenbauer-Prompt verlangt `### Aussehen` (`context/worldbuilder.py:154`).
   - Der Eigentümer nennt für G1/G2 am 2026-10-18 „Verlässlichkeit“: Programm und KI sollen Teile wie „Aussehen“ sicher finden.
   - Umfang der Dateien, die die Konvention nennen: 8 Python-Dateien (1.111 Zeilen), 11 UI-Dateien (1.776), dazu 5 Python- und 7 UI-Testdateien (822 bzw. 2.362 Zeilen). Das ist eine Obergrenze auf Dateiebene.
   - Dieselbe Ursache hat D.18 B1–B3 erzeugt. Auf der Konvention bauen V.34 („In ‹Welt›“), V.35 B2, B3, B4, G1/G2 und G4.
2. **[mittel] Der Verbrauchsspeicher skaliert nicht für V.36/V.37.**
   - `UsageLog.record` liest, ergänzt und schreibt bei jeder Anfrage die ganze Monatsdatei neu (`api/usage.py:58-76`, Sperre `:55`).
   - Gemessen (Temp-Verzeichnis, vorgefüllt, eine Anfrage): 100 Einträge 21 ms, 400 Einträge 83 ms, 1.000 Einträge 223 ms, 2.000 Einträge 431 ms; `month()` 13 bis 268 ms; Datei 144 kB bei 1.000 Einträgen. `architecture.md:233` rechnet mit etwa 400 Anfragen im Monat, das wären 83 ms.
   - V.37 will größere Zeilen (Welt, Geschichte, nach V.36 Cache-Token) und Auswertungen über mehrere Monate.
   - `record` wird synchron am Strom-Ende aufgerufen (`api/flows/writing.py:239-240`). Deutung: Das blockiert dann kurz die Ereignisschleife.
   - Heute kein Problem. Es ist der Punkt, den die Vorlage zu ADR-023 (Option C) mitentscheiden muss.
3. **[mittel] Der Vertrag zwischen Server und UI hat keine Absicherung durch Werkzeuge, und die e2e-Tests sind seit Phase 5 nicht gewachsen.**
   - 11 e2e-Tests, letzte Änderung 2026-10-10; Phase 6 bis 8 (14 + 16 + 13 = 43 Schritte, überwiegend UI) haben 0 hinzugefügt.
   - UI-Tests laufen gegen handgeschriebene Fakes (`ui/fake-api.ts`, 215 Zeilen). Die TypeScript-Typen (`ui/src/api/*.ts`, 1.098 Zeilen) werden von Hand gepflegt, `openapi_url=None` (`app.py:136`). Ich habe keinen Test gefunden, der Pydantic-Antworten gegen die UI-Typen prüft.
   - V.34, V.35 und V.37 ändern Server und UI gleichzeitig.
4. **[mittel] Rückstau für Phase 9.** 21 offene Posten, 11 der V.35-Befunde sind laut Eigentümer „wichtig, bald“ (B1–B7, G3, G4, H1, V1). Würde Phase 9 sie alle aufnehmen, läge sie nahe der Wucherungs-Schwelle von 26. Das ist eine Planungsfrage, kein Codebefund.
5. **[niedrig] `architecture.md` liegt hinter dem Code.**
   - Abschnitt 9 trägt „Stand 2026-10-13, nach ADR-082“ (`:345`). ADR-084, 085, 086 und 088 kommen im Dokument nicht vor (0 Treffer); ADR-083 und ADR-087 stehen je einmal.
   - Zeile 88 beschreibt `build_chapter_summary` noch mit „bisherige Gesamtzusammenfassung“, der Code nutzt nach ADR-085 die Kurzfassungen davor (`context/summaries.py:166`). Zeile 114 sagt „`storage` nur für `system/`“, Zeile 53 und ADR-082 sagen mehr.
   - Der Vision-Abgleich in `28e98b4` hat Abschnitt 6 und die Anforderungs-Übersicht korrigiert, Abschnitt 9 und 3 nicht.
6. **[niedrig] Befund 6 der Vorbewertung ist durch eine Regeländerung erledigt, nicht im Code.** Das Akzeptanzkriterium von 8.1 („`api` importiert `storage` nur noch für `system/`“, `fahrplan.md:197`) ist nicht erfüllt. ADR-082 hat die Karte angepasst, und der Schritt nennt das offen. Die Importstellen sind wie vorher 13.
7. **[niedrig] Namenserkennung ist mehrfach implementiert, mit leicht verschiedenen Regeln.**
   - Vier Matcher: `ui/src/references.ts` (207 Zeilen), `context/writing.py:45-72` (`find_references`), `context/manuscript_hits.py:150-153` und `ui/src/canonFact.ts`.
   - Nur `manuscript_hits` kennt den Apostroph-Genitiv. Die einzige Kopplung ist der Kommentar „as in the interface“.
8. **[niedrig] Wachstumspunkte ohne Gate.**
   - `context/writing.py` ist von 441 auf 490 Zeilen gewachsen, `build_worldbuilder` von 61 auf 78. Jeder Weltenbauer-Schritt (8.7, 8.9, 8.11) hat Teile angehängt. V.33, V.34 und V.35 greifen in beide Bereiche ein.
   - Dazu große UI-Komponenten (`ImageGenerate` 275 Zeilen).
   - Weder `pyproject.toml:46` noch die CI kennen Größen- oder Komplexitätsgrenzen. Der Puffer der Abdeckungs-Schwellen beträgt 0,65 bis 1,07 Punkte.
9. **[niedrig] Der Volltextindex hat keinen Produktivnutzer.** `GET /api/worlds/{id}/search` wird von keinem UI-Code aufgerufen; `find_entries` nutzt nur den Namens- und Alias-Index (`canon/entries.py:127`). Der Modus `fulltext` ist nur durch 9 Tests belegt und indexiert ohnehin nur `name` und `body` (`storage/store.py:276-292`), nicht den Dateikopf. Er ist im Weg nur, wenn Felder in den Kopf wandern (V.35 G1/G2, Variante β).
10. **[niedrig] Kein Versions- oder Migrationsmechanismus für Dateien.** Alle Änderungen waren bisher additiv und tolerant (ADR-083: „Bestehende Figuren bleiben unverändert“; ADR-023: „Anfragen vor 3.9 fehlen“). V.37 (Altzeilen) und V.35 β wären die ersten Fälle, die Altbestand umschreiben müssen.
11. **[niedrig] Offene Belege.** Die Probe zu 8.11 (Regel-002, 3 + 6 Läufe) fand vier Mittelwerte außerhalb der Vorher-Spannweite (je nur in einer Geschichte); die vollständige Handbewertung durch eine getrennte Instanz fehlt (`fahrplan.md` 8.11). NFR Kontexttreue steht seit 2026-10-11 auf `[VORLÄUFIG]`, die Beförderung ist offen (8.13).
12. **[niedrig] Unverändert aus Phase 7:**
    - `sillytavern.py` mit 445 Zeilen (Importer und zwei Exporter).
    - Fünf ähnlich gebaute Streaming-Flows (`stream_events` 48, `stream_answer` 50 Zeilen), ohne gemeinsamen Hilfsbau.
    - `spikes/` wächst im Index (siehe (a)).
    - Test-zu-Test-Importe aus `tests/api/test_writing.py`.

## (c) Vergleich mit der Bewertung nach Phase 7

| Nr. | Befund Phase 7 | Stand | Beleg |
|---|---|---|---|
| 1 | `CanonService` 878 Zeilen als Wachstumspunkt | behoben | `canon/service.py` 349 Zeilen als Fassade (25 Methoden); Teile `worlds`, `entries`, `maps`, `images`, `imports` je höchstens 149 Zeilen; Verhalten laut Fahrplan 8.1 mit unveränderten Tests |
| 2 | `WorldMaps.tsx` 716 Zeilen, 29 Hooks | behoben | 86 Zeilen; `MapViewer` 146 Zeilen mit 6 Hook-Aufrufen; `useMapMarking` 162, `useMapZoom` 78; Zweige `MapViewer` 95 % |
| 3 | Abdeckung gesunken, Schwellen 80/70 greifen nicht | behoben | Python 98,88 → 99,84 %; vitest Statements 94,29 → 98,65 %, Zweige 89,79 → 95,07 %; Schwellen 99 und 98/98/97/94; Puffer klein (Befund 8) |
| 4 | Kanon-Regeln in der UI; D.18 B1–B3 ausgeliefert | teilweise behoben | B1–B3 und B6 behoben (8.4: `sections.ts`, `SectionConflict`, Server-Ablehnung `context/appearance.py:41`); die Konvention steht weiter nur in der UI, jetzt als Befund 1 |
| 5 | Kurzfassung und Weltenbauer: Lücken der Datentrennung (B4, Regeln und Zeitlinie nur als Namen) | behoben | `context/summaries.py:166` nutzt Kurzfassungen davor (ADR-085); Regeln und Zeitlinie im Wortlaut (ADR-086); Tests `test_chapter_summary_sees_only_earlier_chapters`, `test_other_worlds_never_appear_in_the_request`, `test_markers_and_file_names_of_maps_go_into_no_request` |
| 6 | `api` nutzt `storage` außerhalb `system/` ohne ADR | teilweise | ADR-082 hält es in der Karte fest; Code unverändert (13 Importstellen, 8 außerhalb `system/`); Architektur-Abschnitt 3 nicht nachgezogen (Befund 6) |
| 7 | Reifegrad-Tabelle veraltet | besteht, erneut aufgelaufen | in 8.1 bis ADR-082 nachgezogen; ADR-084/085/086/088 fehlen seitdem (Befund 5) |
| 8 | Phasen-Wucherung am Grenzwert | behoben | Phase 8: 13 von 13 geplanten Schritten |
| 9 | `sillytavern.py` 445 Zeilen | besteht | 445 Zeilen |
| 10 | `spikes/` im Git | verschärft | 1.480 → 1.957 Dateien, 3,26 → 3,93 MB |
| 11 | Ähnlicher Streaming-Aufbau in den Flows | besteht | `stream_events` 48, `stream_answer` 50 Zeilen; kein gemeinsamer Hilfsbau |

Von 11 Befunden: 5 behoben, 2 teilweise, 2 bestehen, 2 verschärft bzw. erneut aufgelaufen. Die Vorbewertung empfahl die Umbauteile (i) bis (v):

- (i) `CanonService` gliedern, (ii) Kartenansicht zerlegen, (iii) Tests und Schwellen: erledigt.
- (iv) D.18-Fehler und Tests: erledigt in 8.4–8.7.
- (v) Dokumentation: nur zum Teil.

## (d) Die drei Optionen

**1. Weiterbauen wie bisher.**

- Kosten: kein Vorlauf.
- Risiko: mittel. Die ersten V.35-Schritte (B2, B3, G1/G2, G4) und V.34 würden auf einer Konvention aufsetzen, die nur die UI liest (Befund 1). Die Fehler B1–B3 aus D.18 entstanden aus demselben Muster. V.37 würde auf einem Speicher aufsetzen, der bei 400 Anfragen 83 ms und bei 2.000 Anfragen 431 ms je Eintrag braucht (Befund 2). Der Server-UI-Vertrag wäre weiter ohne neue e2e-Tests (Befund 3).
- Dagegen: kein Befund hoch, alle Gates grün (805 und 398 Tests).

**2. Gezielt umbauen** (innerhalb der Module, Schnittstellen nach außen höchstens additiv)

- (i) **Abschnitts-Schicht im Server** (`canon`): Lesen, Ersetzen und Ergänzen von Abschnitten nach der Regel aus `sections.ts` (223 Zeilen), genutzt von `render` (`context/parts.py:153`), Import (`markdown.py:32`) und Aussehen (`context/appearance.py`). Die UI behält ihre Bearbeitungslogik und teilt sich Testvektoren mit dem Server. Ziel ist, dass Server und UI nicht auseinanderlaufen.
  - Betroffen sind etwa 1.100 Zeilen Produktivcode in 8 Python-Dateien und ein Teil von 11 UI-Dateien. Das ist eine Schätzung auf Dateiebene.
  - Erfüllt die Priorität „Verlässlichkeit“, ohne ADR-003, ADR-078, ADR-083 und ADR-088 aufzuheben (ADR-078 würde ergänzt: der Server liest den Abschnitt).
  - Entscheidungs-Klasse, weil es die Weiche für G1/G2 berührt.
- (ii) **Vertragsabsicherung:** e2e-Pfade für Weltenbauer mit Übernahme-Fenster, „Abschnitt ersetzen“ und Karte oder Bild; dazu ein Test, der die Antwortformen des Servers gegen die UI-Typen prüft. Ein neuer CI-Job wäre Kategorie 7, ein Test nicht.
- (iii) **Dokumentation:** `architecture.md` Abschnitte 3, 4 und 9 auf den Stand nach ADR-088 bringen.
- (iv) **Verbrauchsspeicher:** kein eigener Umbau. Das Speicherlayout gehört in die Vorlage zu V.37, mit den gemessenen Werten.
- (v) Optional und klein: Namenserkennung auf eine Quelle bringen, Abdeckungs-Schwellen nachziehen, CI-Schrittnamen berichtigen.
- Kosten (Schätzung): 2 bis 3 Schritte, etwa zwei Sessions wie 8.1–8.3. Risiko: gering. Gefahr ist Wucherung durch Umbau ohne Ende, daher auf höchstens 3 Schritte mit eigener ID begrenzen.

**3. Neu aufsetzen.**

- Kosten: etwa 44.800 Zeilen, 767 Commits, 88 ADRs und der laufende Betrieb mit den Daten des Eigentümers (am 2026-10-13: 133 Einträge, 5 Welten, 23 Figuren).
- Risiko: hoch, nichts spricht dafür. Keine fachlichen Zyklen, 0 Platzhalter und 0 TODO, 0 hohe Befunde, Reaktiv-Quote 10 %, Suppressions nur begründet, ruff, mypy, eslint und tsc sauber.

**Tragen Datenmodell und Schnittstellen die verschobenen Schritte ohne Neuaufbau? Ja, alle. Bei V.35 hängt der Aufwand an der Weiche G1/G2, bei V.37 am Speicherlayout.**

| Schritt | Trägt es? | Beleg |
|---|---|---|
| V.20 Figurenkarten im Netz finden | ja | Datenmodell nicht berührt. Websuche über das OpenRouter-Plugin (ADR-064) und SillyTavern-Import (`canon/importers/sillytavern.py`) sind vorhanden. Ein neuer Dienst wäre Kategorie 3. |
| V.21 Veröffentlichung | ja, additiv, aber sicherheitskritisch | Das Muster `auth_routes.public`/`protected` und Fach-Router mit `dependencies=[Depends(current_session)]` (`canon_routes.py:25`) erlaubt einen öffentlichen Lese-Router. `epub_for` ist eine reine Funktion mit eigenem Markdown-Minimalwandler. Es bricht aber die Annahme „alle Endpunkte außer Gesundheitsprüfung und Anmeldung hinter Sitzung“ (`architecture.md:176`): Kategorie 6, Bedrohungsmodell erweitern, getrennte Prüfung. |
| V.23 Bilder im Manuskript | ja | Bildablage und -prüfung vorhanden (`storage/images.py`, Titelbild-Muster `manuscript/stories.py:152-200`). Zu ergänzen: Kapitel-Kopffeld oder Markdown-Syntax, `epub.py` (kennt heute nur Absätze, Überschriften, kursiv/fett, Szenenwechsel), Bildzeilen in `last_pages` und Fundstellen, Editor zeigt nur Quelltext. Additiv. |
| V.24 weiterer Bildanbieter | ja, mehr als „ein Adapter“ | `ImageProvider` (`ai_gateway/images.py:73`) ist ein Protokoll. Aber `Services.images` ist ein einzelner Slot (`api/context.py:47`), `ImageCatalog` und `DEFAULT_IMAGE_MODEL` sind OpenRouter-spezifisch, die Routen fragen diesen einen Katalog (`image_routes.py`). Nötig: Zuordnung Modell → Anbieter in `ai_gateway`, Verdrahtung in `create_app`, Schlüssel im Betrieb (Kategorien 3 und 6). |
| V.33 Bilder beim Schreiben mitschicken | ja | `Message.images` und `ModelCatalog.reads_images` existieren (7.13). `context` kennt `ai_gateway` nicht, `api` hängt die Bilder an (Muster `api/flows/describe.py`). Die Token-Schätzung (`context/parts.py`) zählt nur Text; das Budgetmodell braucht einen Bildanteil. Probe nach Regel-002 nötig. |
| V.34 Gast-Verbindung ausbauen | ja | `GuestLink(world, entry)` (`manuscript/models.py`) bekommt ein Feld für den Weltbezug; der Kopf von `story.md` kennt verschachtelte Listen, Altdaten bleiben lesbar. Anpassen: `context/builder.py:163-173` (`_guests`), `render(entry, home)`, `POST …/guests` (additiv), `Guests.tsx` (144 Zeilen), eine Weltenbauer-Variante. Die Konvention „weltneutral oben, ‚In ‹Welt›‘“ hängt an Befund 1. Eingangskriterium (Probe des Eigentümers) offen. |
| V.35 B1 Herkunft von Bildern | ja | `bilder` ist eine Liste von Dateinamen (`canon/headers.py:images_of`); ein zusätzliches Kopffeld ist additiv. |
| V.35 B4, B6, B7, G3, G4, H1, V1 | ja | B4 nur UI (`imagePrompts.ts`). B6 und G3: `Favorites`-Muster unter `system/`. B7: `ImageOrder` ohne Bildeingabe, additiv in `ai_gateway`. H1 und V1: neuer Dienst (Kategorie 3), kein Datenmodell. |
| V.35 B5 Löschen oder Archivieren | ja, destruktiv | Kein Weg vorhanden (keine Route). `storage` hat `delete`, `delete_image` und `list_paths`, die Kaskade (Bilder, Karten, Verlauf, Gast-Verbindungen, Markierungen, Verbrauchszeilen) fehlt. Vorlage nötig (Stopp-Kriterium 6). |
| V.35 B2, B3, G1/G2 gegliederte Einträge | ja | Siehe unten. Variante α (Schicht im Server) trägt es ohne Neuaufbau, β (Felder im Kopf) ebenfalls, kostet aber mehr. |
| V.36 Cache-Treffer festhalten | ja | `ai_gateway/openrouter.py:352-362` liest nur `prompt_tokens`, `completion_tokens` und `cost`; Erweiterung von `Usage` und der `ki_anfrage`-Zeile (`:424-433`) ist additiv. |
| V.37 Verbrauchsstatistik je Welt und Geschichte | ja, mit einer Entscheidung zum Layout | Die Zeile ist ein Wörterbuch, neue Schlüssel sind additiv, alte Zeilen bleiben gültig. Der Recorder wird an 7 Stellen in Routen (`writing_routes.py:213,237,277,297,319`, `image_routes.py:120,122`) und in 3 Flows aufgerufen; Welt und Geschichte lassen sich auf Routen-Ebene binden. `POST /api/images/generate` kennt keine Welt (`GenerateIn`), ein optionales Feld wäre nötig. Das ist Option C aus ADR-023. Das Layout der Monatsdatei skaliert nicht (Befund 2). |

**V.35 G1/G2 im Einzelnen.** Der Eintrag besteht aus `body` (ein Text) plus Kopf (`name`, `aliasse`, `kategorie`, `status`, `bilder`). `body` wird in `src` an etwa 6 Stellen gelesen (`context/parts.py:153`, `context/appearance.py:42`, `context/writing.py:87`, `canon/entries.py:102`, `canon/imports.py`, `sillytavern.py`) und in der UI an etwa 8 Stellen. Der Prompt-Aufbau läuft über genau eine Funktion (`render`).

- **α, Abschnitts-Schema im Server (Markdown bleibt):** Der Server kennt feste Abschnitte je Kategorie und stellt sie getrennt bereit; `render`, Import und Aussehen lesen sie einheitlich. ADR-003 gilt unverändert. ADR-078 wird ergänzt, nicht umgekehrt. ADR-083 (Ersetzen, Vorlage) und ADR-088 (`@Name` im Text) bleiben gültig. Das passt zur Sicht „Verlässlichkeit, nicht Felder statt Rauten“. Dass α ausreicht, ist meine Deutung der Sicht vom 2026-10-18.
- **β, Felder im YAML-Kopf:** `HeaderValue` kann verschachtelte Strukturen und mehrzeilige Texte tragen, unbekannte Kopffelder bleiben beim Ändern erhalten (`canon/headers.py:56-63`). Nötig wären aber:
  - Änderungen an `CanonEntry`, `entry_from`, `entry_header`, `render` und den API-Modellen (`EntryCreate`/`EntryChange` kennen nur `body`).
  - Importer und SillyTavern-Abbildung (`sillytavern.py:386-388`).
  - Formulare und Auslese der UI.
  - Eine Migration des Altbestands ohne Werkzeug (Befund 10).
  - Volltext-Index nur für `body` (Befund 9, ohne Folge heute).
  - ADR-078 würde umgekehrt, ADR-083 entfiele für Felder; ADR-088 müsste Felder mit durchsuchen (`find_references` liest nur `body`).
  - Ein Neuaufbau wäre es auch hier nicht, aber der größte Posten der Liste. Er sollte nur gewählt werden, wenn der Eigentümer die Bedienung ausdrücklich will.

## (e) Empfehlung

**Gezielt umbauen, danach weiterbauen. Konfidenz: mittel.**

Der Umbau besteht aus (i) bis (iii), also 2 bis 3 Schritten zu Beginn von Phase 9 vor den V.35-Schritten B2, B3 und G1/G2, V.34 und V.37. Teil (iv) gehört in die Vorlage zu V.37.

Begründung in Zahlen:

- Die Grundlage ist gesund. 5 von 11 Befunden aus Phase 7 sind behoben. `canon/service.py` fiel von 878 auf 349 Zeilen, `WorldMaps.tsx` von 716 auf 86. Abdeckung: Python 99,84 %, UI-Statements 98,65 %, UI-Zweige 95,07 %. 805 und 398 Tests grün. 0 Platzhalter und 0 TODO. Keine fachlichen Zyklen. 0 reaktive ADRs seit ADR-082. Das spricht klar gegen einen Neuaufbau (Konfidenz hoch).
- Das einzige Muster, das D.18 B1–B3 erzeugt hat und das weiterbesteht, ist die UI-eigene Abschnitts-Konvention. Sie ist Grundlage für mindestens 6 der 21 offenen Posten (V.34, V.35 B2, B3, B4, G1/G2, G4). Die Kosten sind klein (etwa 1.100 Zeilen Produktivcode betroffen), die Folgekosten eines erneuten B1–B3 hoch.
- V.37 trifft einen gemessenen Engpass: 83 ms je Anfrage bei 400 Einträgen, 431 ms bei 2.000.
- Der Server-UI-Vertrag ist ohne e2e seit Phase 5 für drei Phasen UI-Arbeit ungeprüft (0 neue e2e-Tests bei 43 Schritten).

Warum nur „mittel“: „Weiterbauen“ mit (i) als erstem Schritt von V.35 unterscheidet sich vom „gezielten Umbau“ vor allem im Etikett. Ob (i) groß oder klein ausfällt, entscheidet der Eigentümer mit G1/G2 (α oder β) in der Planung von Phase 9. Wählt er β, wäre der Umbau größer als hier geschätzt.

Phase 9 sollte nicht alle 21 Posten aufnehmen. Alle V.35-Befunde stehen auf „wichtig, bald“, die Reihenfolge muss die Planung festlegen. Sinnvoll ist: zuerst die Umbauteile, dann V.36 und V.37 mit der Layout-Entscheidung, dann die V.35-Gruppe, V.34 nach der Probe des Eigentümers, V.20/V.21/V.23/V.24/V.33 später.

## Stellungnahme der bauenden KI (2026-10-18)

Stichproben selbst geprüft – stimmen: `UsageLog.record` liest und schreibt die ganze Monatsdatei je Anfrage (`api/usage.py:55-76`); letzte Änderung an `e2e/` ist `6b6b2af` vom 2026-10-10; `GET /api/worlds/{id}/search` (`canon_routes.py:241`) hat keinen Aufruf in `ui/src`; `architecture.md` beschrieb `build_chapter_summary` mit der Gesamtzusammenfassung und `api` → `storage` mit „nur für `system/`“; die CI-Schrittnamen nennen 80 % bzw. 80/70 (`ci.yml:65`, `:96`).

- **Zustimmung zur Empfehlung** „gezielt umbauen, danach weiterbauen“ und zu Befund 1 als Kern: Die Abschnitts-Konvention ist dieselbe Ursache wie D.18 B1–B3 und trägt die Hälfte der „wichtig, bald“-Befunde.
- **Zu (iii) – bereits erledigt:** Befund 5 ist Doku-Drift und damit ein Bug, kein Umbau. In 8.13 nachgezogen: `architecture.md` Abschnitt 3 (Kurzfassung nach ADR-085, `api` → `storage` nach ADR-082) und Abschnitt 9 (Stand nach ADR-088, Phase 8 bei `canon` und `context`). Abschnitt 4 nennt die Verträge der Phase-8-Endpunkte bereits (8.9 `…/worldbuilder/hits`). Der Umbau schrumpft damit auf (i) und (ii).
- **Zu (i), Weiche G1/G2:** Die Sicht des Eigentümers vom selben Tag – „Verlässlichkeit“, ausdrücklich nicht „Bedienung mit Feldern“ – spricht für α. Die Wahl zwischen α und β ist trotzdem eine Datenmodell-Entscheidung (Kategorie 4) und gehört als eigene Vorlage in den ersten Umbau-Schritt, nicht in diese Pflichtfrage. Wichtig für α: Der Server sollte dieselbe Abschnittsregel wie `ui/src/sections.ts` benutzen (gemeinsame Testfälle), sonst entsteht ein fünfter Leser der Konvention.
- **Zu (ii), Vertragsabsicherung:** e2e-Pfade für die Abläufe aus Phase 6–8 – ja. Ein Test „Pydantic-Antworten gegen UI-Typen“ ist ohne neues Werkzeug nur als handgepflegte Liste möglich; ein Generator (z. B. aus OpenAPI) wäre eine neue Abhängigkeit (Kategorie 3) und kommt nur als eigene Vorlage in Frage.
- **Zu Befund 2:** einverstanden, kein eigener Umbau. Für die Vorlage zu V.37 fehlt noch die echte Zahl der Anfragen je Monat auf dem Server (nur Anzahl, lesend) – sie entscheidet, ob 83 ms überhaupt erreicht werden.
- **Zu Befund 6:** Das Akzeptanzkriterium von 8.1 wurde durch ADR-082 (`[REAKTIV]`) ersetzt, nicht im Code erfüllt; der Schritt nennt das selbst. Kein neuer Schritt.
- **Zu Befund 8 und (v):** Größen- oder Komplexitätsgrenzen und das Umbenennen der CI-Schritte ändern die CI (Kategorie 7) und gehen nur mit Freigabe; die Schrittnamen sind ein kleiner Punkt für die Planung, Grenzen optional. Die Namenserkennung auf eine Quelle zu bringen gehört zu (i), weil dieselben Dateien berührt werden.
- **Zu Befund 11:** Die Beförderung der NFR Kontexttreue steht als offener Punkt in 8.13 (Vision-Abgleich). Die fehlende Handbewertung zu 8.11 hat der Eigentümer vor seiner Bestätigung erfahren; kein neuer Schritt.
- **Zu Befund 4 und zur Reihenfolge:** einverstanden, dass Phase 9 nicht alle 21 Posten aufnimmt. Die Reihenfolge ist eine Frage an den Eigentümer in der Planung (eigener ADR nach der Pflichtfrage).
- **Zu Befund 12 (`spikes/`):** wie nach Phase 7 – behindert die Arbeit nicht; kein Schritt.
