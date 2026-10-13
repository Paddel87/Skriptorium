# Bewertung am Ende von Phase 7 (getrennte Instanz)

Pflichtfrage „Weiterbauen, umbauen oder neu aufsetzen?“ (`CLAUDE.md` Abschnitt 12) in Schritt 7.8, 2026-10-13. Bewertet von einem Unteragenten mit Sonnet (anderes Modell als die bauende KI), ohne Gesprächsverlauf, nur lesend. Es wurden nur Tests und Linter lokal ausgeführt, nichts geändert, kein Serverzugriff. Grundlage: Code unter `src/`, `ui/src/` und `tests/`; `docs/architecture.md`; `docs/decisions.md` (Teil A, ADR-067 bis ADR-079); der Fahrplan von Phase 7 samt V.20–V.32; `docs/vision.md`; `docs/requirements.md`; die Bewertung nach Phase 6 und die Prüfung D.18. Der Text bis zur Stellungnahme ist die Bewertung unverändert (nur in Markdown-Form gebracht); die Stellungnahme der bauenden KI steht getrennt am Ende.

## (a) Messwerte

- **Umfang:** Python `src` 10.002 Zeilen (Phase 6: 7.280, +37 %); `tests` 8.885 (6.958). UI ohne Tests 11.555 (7.782, +48 %); UI-Tests 7.466 (5.850). e2e 603 Zeilen. 723 Commits (613). 79 ADRs (66).
- **Testverhältnis** (Test- zu Quellzeilen): Python 0,89 (vorher 0,96), UI 0,65 (vorher 0,75).
- **pytest:** 734 bestanden (vorher 560), 21,8 s. Coverage 98,88 % (vorher 99,85 %): 4.263 Statements, 35 verfehlt, 24 Zweige teilweise offen. Unter 100 %:
  - `ai_gateway/images.py` 89 % (10 verfehlt, 8 Zweige)
  - `storage/images.py` 91 % (6)
  - `canon/service.py` 99 % (6, Zeilen 248-250 und 478-480)
  - `storage/store.py` 98 %
  - `manuscript/stories.py` 97 % (161-163)
  - `api/image_routes.py` 95 %
  - `api/writing_routes.py` 97 %
  - `api/flows/appearance.py` und `describe.py` je 95 %
- **ruff:** sauber. **mypy --strict:** 64 Quelldateien ohne Befund (vorher 45). **tsc --noEmit:** 0 Fehler.
- **vitest:** 32 Dateien, 273 Tests grün (vorher 21 Dateien, 217 Tests). Statements 94,29 % (vorher 98,16 %), Zweige 89,79 % (96,1 %), Funktionen 93,59 %, Zeilen 94,45 %. Schwächste Dateien:
  - `files.ts` 30,6 % Statements
  - `StoryCover.tsx` 66,7 %
  - `AppearanceExtract.tsx` 74,2 %
  - `WorldMaps.tsx` 86,0 % Statements, aber nur 64,9 % Zweige
  - `ImageGenerate.tsx` 85,9 %, Zweige 76,6 %
  - `ImageDescription.tsx` 83,6 %
- **Coverage-Schwellen im Werkzeug:** `fail_under = 80` (pyproject.toml:73), vitest `lines: 80, branches: 70` (vite.config.ts:63). Sie liegen 15 bis 19 Punkte unter dem Ist-Wert und fangen den Rückgang nicht ab.
- **Suppressions:** 24 Treffer gesamt. 12 in `src` (alle `noqa: N818`, begründet, Namen per Vertrag fixiert). 12 in `tests` (7× `type: ignore[arg-type|attr-defined]` mit „unknown on purpose“, 2× `S314`, 2× `S105`, jeweils begründet). Kein `eslint-disable`, kein `@ts-ignore`, kein `any` im UI-Produktivcode. `TODO(fahrplan-ref`: 0 Treffer in `src`, `ui/src`, `tests`, `e2e`.
- **Modulgrenzen** (Imports per AST geprüft):
  - `ai_gateway` importiert kein Fachmodul.
  - `canon` → `storage`; `manuscript` → `storage`; `context` → `canon`, `manuscript` (nur lesend, keine Schreibaufrufe gefunden).
  - `api` → `canon`, `manuscript`, `context`, `ai_gateway`, `storage`.
  - Keine Zyklen. Private Importe über Dateigrenzen: 0 (Phase 6: 5).
  - Abweichung von der Karte: `api` nutzt `storage` an 13 Stellen. Laut `architecture.md` Abschnitt 2 nur für Zugangsdaten und Verbrauchsdaten. Dazu zählt `api/image_routes.py:24` mit der Funktion `inspect_image` und `api/canon_routes.py:23` / `manuscript_routes.py:25` mit Konstanten und Fehlertypen. `inspect_image` kommt in `architecture.md` und `decisions.md` nicht vor.
  - Die UI ruft die Anwendungsschnittstelle nur über `ui/src/api/` auf.
- **Größte Python-Dateien (Zeilen):** `canon/service.py` 878 (vorher 523, +68 %), `canon/importers/sillytavern.py` 445 (445), `context/writing.py` 441, `ai_gateway/openrouter.py` 440 (425), `storage/store.py` 378, `manuscript/service.py` 375 (vorher 868), `api/manuscript_routes.py` 374 (318), `api/writing_routes.py` 333, `api/flows/writing.py` 303 (303), `api/app.py` 302, `context/builder.py` 266 (vorher 866).
- **Größte UI-Dateien (Zeilen):** `WorldMaps.tsx` 716 (neu), `WritingStyle.tsx` 415 (413), `EntryImages.tsx` 403 (neu), `ImageGenerate.tsx` 323 (neu), `Shell.tsx` 306, `ModelManager.tsx` 299, `StoryList.tsx` 298, `CanonFact.tsx` 286. `Canon.tsx` 468 → 211, `ChapterEditor.tsx` 363 → 223, `WritingPanel.tsx` 274, `StoryPage.tsx` 223. `ui/src/api.ts` 741 → Ordner `ui/src/api/` mit 13 Dateien, größte 232 Zeilen.
- **Längste Funktionen (Python, 525 insgesamt, 4 über 50 Zeilen):** `api/app.py: create_app` 83 (Verdrahtung, vorher 72), `context/worldbuilder.py: build_worldbuilder` 61 Zeilen mit 19 Verzweigungen (unverändert), `canon/service.py: apply_import` 61, `manuscript/epub.py: epub_for` 51, `api/flows/worldbuilder.py: stream_answer` 50.
- **Längste Funktionen (UI):** `Shell` 159 Zeilen. In `WorldMaps.tsx` ist `MapViewer` (Zeilen 221–670) eine einzelne Komponente von rund 450 Zeilen mit 18 Hooks (10 useState, 4 useEffect, 4 useRef). Die Datei hat insgesamt 29 Hooks.
- **Hook-Dichte pro Datei:** `WorldMaps` 29, `InstructionEditor` 18 (CodeMirror), `ModelManager` 17, `ImageGenerate` 16, `WritingStyle` 14, `EntryImages` 13, `Shell` 13, `StoryList` 13, `ImageDescription` 13. In Phase 6 hatte `ChapterEditor` mit 18 den Höchstwert; er liegt jetzt unter 12.
- **ADRs:** Reaktiv-Quote ADR-070..079 0/10. In Phase 7 entstanden ADR-067..079 (13), davon 0 `[REAKTIV]`. Alle neuen Datenmodell-Entscheidungen (ADR-070, 072, 073, 075, 078, 079) liefen vorab als Vorlage.
- **Phasen-Wucherung:** Phase 7 wuchs von 8 auf 16 Schritte (Faktor 2,0, +8). Die Schwelle (`project-context.md:162`: mehr als Faktor 2 und mindestens 5 Schritte) ist erreicht, aber nicht überschritten. Der Fahrplan benennt das selbst.
- **Ablage im Arbeitsverzeichnis:** `spikes/` 7,5 MB auf der Platte. Davon sind 1.480 Dateien mit 3,26 MB im Git-Index. `dist/` (984 KB) ist ignoriert. 17 `mockup-*.html` (bis 1,5 MB) sind lokal über `.git/info/exclude` ausgeschlossen.

## (b) Befunde

1. **[mittel] `CanonService` ist der neue Wachstumspunkt.** `canon/service.py` hat 878 Zeilen (vorher 523) und 32 Methoden. Er mischt Welten (173-228), Karten und Markierungen (228-327), Einträge (328-446), Bilder (460-532), Suche, SillyTavern-Aus- und Eingabe (548-566) und Import (575-672) in einer Klasse. Phase 7 hat Karten (7.10, 7.14) und Bilder (7.6) dort angehängt, genau das Muster, das Phase 6 an `ManuscriptService` bemängelt hat. V.25 (Verweise zwischen Einträgen) und V.26 (wandernde Figuren) greifen als Nächstes diese Klasse an. Zusammen mit `storage` kennen nur sie die Pfade.
2. **[mittel] `WorldMaps.tsx`: 716 Zeilen, 29 Hooks.** `MapViewer` ist eine Komponente von rund 450 Zeilen mit 18 Hooks (Zeilen 221-670), dazu `MarkingBar` (671) und `AddMap` (107). Zweigabdeckung 64,9 %. Das ist dasselbe Muster, das in Phase 5 und 6 an WritingPanel, Canon und ChapterEditor bereinigt wurde (Hooks `useWriteFlow` usw.). `ui/src/views/` hat nur acht `use*`-Hooks, keiner für Karten.
3. **[mittel] Testabdeckung der Phase-7-Funktionen ist schwächer als der Bestand.** UI-Statements 94,29 % (vorher 98,16 %), Zweige 89,79 % (96,1 %), Python 98,88 % (99,85 %). Die Lücken liegen konzentriert in den Bildfunktionen: `ai_gateway/images.py` 89 %, `storage/images.py` 91 %, `files.ts` 30,6 %, `StoryCover.tsx` 66,7 %, `AppearanceExtract.tsx` 74 %. Die Schwellen 80/70 (pyproject.toml:73, vite.config.ts:63) greifen nicht. Der Rückgang ist damit durch kein Gate abgesichert, obwohl Phase 5 und 6 die Quote bei 98–99 % gehalten hatten.
4. **[mittel] Regeln des Kanons stehen in der Oberfläche; D.18 B1–B3 sind ausgelieferte Fehler.** `withSection` hängt immer einen Abschnitt an (`ui/src/views/ImageDescription.tsx:221-230`); der Test prüft genau das (`ImageDescription.test.tsx:132-139`). `appearanceOf` nimmt den ersten Abschnitt „Aussehen“ und endet an jeder Überschriftsebene (`ui/src/imagePrompts.ts:21-23, 49-65`). Die Vorlage neuer Figuren `## Aussehen` (`canon/service.py:65`, `383-384`) erzeugt damit doppelte oder falsch gefüllte Abschnitte. Der Server prüft die Konvention nicht (B6: `api/flows/appearance.py:37-40` akzeptiert jede Kategorie). Die Konvention „Abschnitt Aussehen“ wird an zwei Orten gelesen (`imagePrompts.ts` in der UI, `context/appearance.py` im Server). Landeplatz V.29–V.31 ist vorhanden, die Mängel sind aber nicht behoben.
5. **[mittel] Kapitel-Kurzfassung und Weltenbauer: Lücken der Trennung der Daten.** B4: `context/summaries.py:115-121` gibt beim Neu-Erzeugen die aktuelle Gesamtzusammenfassung unter „Handlungsstand vor diesem Kapitel“ mit. Nebenbefund: Regeln und Zeitlinie gehen nur als Namen an den Weltenbauer (`context/worldbuilder.py:64-70`). Vier fehlende Tests (D.18) sind offen. Beides ist in V.30 und V.32 landebahnfähig eingeplant.
6. **[niedrig] `api` nutzt `storage` außerhalb von `system/`.** `image_routes.py:24` (`inspect_image`), `canon_routes.py:23`, `manuscript_routes.py:25`, fünf Flow-Dateien (Fehlertypen). Die Karte erlaubt `api` → `storage` nur für Zugangsdaten und Verbrauch; die Abweichung ist nicht per ADR belegt. Nur Fehlertypen und eine reine Prüffunktion, kein Schreibzugriff, daher keine Architekturgefahr, aber Dokumentationsdrift.
7. **[niedrig] Reifegrad-Tabelle veraltet.** `architecture.md` Abschnitt 9 trägt den Stand 2026-10-10, nach ADR-052. Bildablage, Bild-Gateway, EPUB, Karten und Markierungen (ADR-070..079) sind dort als Validierung der Module nicht nachgezogen (Zeile für `storage` nennt die Messung aus 4.1).
8. **[niedrig] Phasen-Wucherung am Grenzwert.** 16 Schritte gegen Plan 8. Das Abschlusskriterium nennt nur 7.1–7.8 (`fahrplan.md:176`). Nicht überschritten, aber vier der acht Zusatzschritte kamen aus Beobachtungen des Eigentümers oder aus Zuschnitten (7.9, 7.10–7.13, 7.14, 7.15, 7.16). Dazu 13 geparkte Schritte V.20–V.32 für die nächste Stufe.
9. **[niedrig] `sillytavern.py` 445 Zeilen unverändert**, ein Importer und zwei Exporter in einer Datei (`canon/importers/sillytavern.py`, `_lorebook` 43 Zeilen mit 21 Verzweigungen). Keine neue Verschlechterung.
10. **[niedrig] `spikes/` im Git.** 1.480 Dateien, 3,26 MB (Phase 6 hatte angegeben, sie lägen nicht im Index; das stimmte nicht). Wachstum durch Messrohdaten (`modell-eignungstest/ergebnisse`: 177 Dateien). Kein Funktionsproblem, aber Klon und Diffs werden schwerer.
11. **[niedrig] Aufteilung der API-Flows.** Fünf Flows (`writing` 303, `summary` 157, `worldbuilder` 154, `describe` 68, `appearance` 47); `stream_events` 48 und `stream_answer` 50 Zeilen sind ähnlich aufgebaut. Der SSE-Helfer ist noch nicht herausgezogen; Menge unverändert klein.

## (c) Vergleich mit der Bewertung nach Phase 6

| Nr. | Befund Phase 6 | Stand jetzt | Beleg |
|---|---|---|---|
| 1 | Private Importe, Laden zur Laufzeit zwischen `builder.py` und `worldbuilder.py` | **behoben** | 0 private Importe über Dateigrenzen; gemeinsame Teile in `context/parts.py` (165 Zeilen); `worldbuilder.py` 143 Zeilen |
| 2 | `builder.py` 866 Zeilen als Wachstumspunkt | **behoben** | `builder.py` 266, daneben `writing.py` 441, `summaries.py` 170, `describe.py` 87, `appearance.py`. `writing.py` ist jetzt die größte Datei von `context`, aber unter 450 |
| 3 | `ManuscriptService` 868 Zeilen, 45 Funktionen | **behoben** | `service.py` 375 (22 Methoden), Fassade bleibt; Teile in `stories.py` 205, `chapters.py` 158, `extras.py` 105, `headers.py` 265 |
| 4 | `Canon.tsx` / `ChapterEditor.tsx` zu groß, viele Hooks | **behoben**, aber das Muster ist an anderer Stelle neu entstanden | 468 → 211 und 363 → 223; neu `WorldMaps.tsx` 716 / 29 Hooks (Befund 2) |
| 5 | `api.ts` 741 Zeilen, 40 Exporte | **behoben** | `ui/src/api/` 13 Dateien, größte 232 |
| 6 | `sillytavern.py` 445 Zeilen | **besteht** | unverändert 445 |
| 7 | Ähnlicher Streaming-Aufbau in drei Flows | **besteht** (leicht verschärft: 5 Flows) | `stream_events` 48, `stream_answer` 50 |
| 8 | Aufräumen: `spikes/`, `dist/`, Mockups | **besteht / teilweise verschärft** | `spikes/` 7,5 MB (3,26 MB im Git, entgegen Phase 6), 17 Mockups lokal |
| 9 | Datenmodell trägt V.14/V.1/V.2/V.16 ohne Neuaufbau | **bestätigt** | alle vier in Phase 7 umgesetzt (7.2–7.6) ohne reaktives ADR; Bildablage als Erweiterung von `storage` per ADR-072 |
| 10 | Testverhältnis gesund | **verschärft** | Verhältnis und Abdeckung gesunken (siehe (a) und Befund 3); absolute Zahl Tests +174 / +56 |
| 11 | Phase-5-Befunde (StoryPage, WritingPanel, `build()`) behoben | **gehalten** | `StoryPage` 223, `WritingPanel` 274 |

Von fünf vorgezogenen Umbau-Befunden (1–5) sind alle fünf behoben. Neu aufgetreten sind dafür Befund 1 (`CanonService`) und 2 (`WorldMaps`) in der vorliegenden Bewertung.

## (d) Die drei Optionen

**1. Weiterbauen wie bisher.**

- Kosten: kein Vorlauf.
- Risiko: mittel. Die nächsten Schritte V.25 (Verweise) und V.26 (wandernde Figuren) setzen genau an `canon/service.py` (878 Zeilen) an; V.23, V.29 und V.31 an `WorldMaps.tsx`, `EntryImages.tsx`, `imagePrompts.ts`. Die D.18-Fehler B1–B3 sind im Alltag auslösbar (Karte erneut beschreiben, Aussehen herauslösen) und verdoppeln Kanon-Text in jeder Schreib-Anfrage. Ohne Anhebung der Coverage-Schwellen kann der Rückgang weiterlaufen. Keine Fehler in den Tests: 734 und 273 Tests grün.

**2. Gezielt umbauen (empfohlen).** Folgende Teile, jeweils innerhalb der Module, ohne Schnittstellenänderung nach außen:

- (i) `CanonService` in Teilklassen nach Verantwortung (Einträge, Karten/Markierungen, Bilder, Import/Export) mit unveränderter Fassade, wie bei `ManuscriptService` in 7.3. Vor V.25/V.26.
- (ii) `MapViewer` / `WorldMaps.tsx` in Hooks und Teilkomponenten (Zoom, Markieren, Verweise), vor V.23 und V.29.
- (iii) Coverage nachziehen und die Schwellen anheben: Tests für `ai_gateway/images.py`, `storage/images.py`, `files.ts`, `StoryCover.tsx`, `AppearanceExtract.tsx`; danach `fail_under` und die vitest-Schwellen auf den erreichten Stand setzen (Ratsche wie beim Warnungs-Bestand).
- (iv) Die D.18-Fehler B1–B6 und die vier Tests als erste Schritte der nächsten Stufe (V.29–V.31 ohnehin eingeplant), bevor weitere Bildfunktionen hinzukommen.
- (v) Dokumentation: Reifegrad-Tabelle (`architecture.md` Abschnitt 9) auf Stand bringen, `api` → `storage` (Fehlertypen, `inspect_image`) in der Karte festhalten oder per ADR begründen; `spikes/` aus dem Index nehmen oder auslagern (Entscheidung des Eigentümers).
- Kosten: grob 1 bis 2 Arbeitstage KI-Zeit, mechanisch, durch Tests gesichert. Risiko: gering; die Gefahr ist Wucherung durch Umbau ohne Ende (Phase 7 steht schon bei 16 Schritten). Daher der Umbau als wenige, klar begrenzte Schritte mit eigener ID.

**3. Neu aufsetzen.**

- Kosten: sehr hoch (rund 21.500 Zeilen Produktivcode, 16.400 Zeilen Tests, 723 Commits, 79 ADRs, laufende Nutzung durch den Eigentümer).
- Risiko: hoch, nichts spricht dafür. Modulgrenzen halten (Abweichung nur bei Fehlertypen und einer Prüffunktion), keine Zyklen, keine Platzhalter, 0 reaktive ADRs seit ADR-070, Suppressions nur begründet, Linter und Typprüfung sauber. Die Datenhaltung ist durch Markdown mit Kopf, wiederherstellbarem Index und Bildablage über `storage` additiv gewachsen.

**Tragen Datenmodell und Schnittstellen V.20–V.32 ohne Neuaufbau? Ja, mit einem Vorbehalt bei V.26.**

- V.20 (Kartensuche): außerhalb des Datenmodells, externe Anbindung (Kategorie 3).
- V.21 (öffentlicher Link): additiv. Neuer Lesepfad ohne Sitzung, Kopffeld in `story.md`, `manuscript/epub.py` als Leser vorhanden; Kategorie 6 und Bedrohungsmodell nötig.
- V.22 (Weltenbauer aus dem Manuskript): neuer Ablauf nach dem Muster der fünf Flows in `api/flows/`, `context` liest `manuscript` und `canon` bereits.
- V.23 (Bilder im Manuskript): Bildablage und Prüfung bestehen (`storage/images.py`); Datenmodell (Bildverweise im Kapiteltext) und `epub.py` sind additive Erweiterungen.
- V.24 (weiterer Bildanbieter): `ImageProvider`-Protokoll in `ai_gateway/images.py:73` ist vorhanden; ein zweiter Adapter neben `openrouter_images.py` genügt.
- V.25 (Verweise): `@`-Verweise gibt es in `context/writing.py`; eine Stufe tief ist additiv. Berührt `CanonService`, daher nach Umbau (i).
- V.26 (wandernde Figuren): größte Frage. Jede Kanon-Funktion und jeder Pfad hängt an `world_id` (`canon/service.py`, `_entry_path(world_id, …)`). Ein weltneutraler Kern braucht eine neue Ablage neben den Welten oder eine neue Eintragsart; Gast-Figuren (3.7) sind ein Vorbild für den Lesepfad. Das ist eine Architektur- und Datenmodellentscheidung (Kategorien 1 und 4) mit ADR, aber kein Neuaufbau. Erst nach Umbau (i) und mit Erkundung.
- V.27–V.28, V.29–V.32: Bedienung, Zeitlinie (`timeline.ts`) und Kontext-Zusammenstellung; V.29–V.32 sind Fehlerbehebungen und Anfrage-Änderungen.

## (e) Empfehlung

**Gezielt umbauen, danach weiterbauen.** Konfidenz hoch. Der Umbau besteht aus den Teilen (i)–(v) der Option 2. Er wird als ein bis drei Schritte vor V.25 und V.26 angelegt, am besten gekoppelt an den ersten Schritt der nächsten Stufe. Begründung in Zahlen:

- Alle fünf in Phase 6 vorgezogenen Umbau-Befunde sind behoben (`builder.py` 866 → 266, `manuscript/service.py` 868 → 375, `Canon.tsx` 468 → 211, `api.ts` → 13 Dateien). Das Vorgehen funktioniert.
- Die zwei neuen Hotspots (`canon/service.py` 878 Zeilen, `MapViewer` ca. 450 Zeilen) liegen genau an den Stellen, die die nächsten Schritte berühren.
- Der Rückgang der Abdeckung (UI 98,16 → 94,29 %, Zweige 96,1 → 89,79 %) ist behebbar und sollte durch angehobene Schwellen gesichert werden.
- D.18 B1–B3 sind bereits im Code und sollten vor weiteren Bildfunktionen (V.23, V.24) behoben werden, damit der Kanon nicht widersprüchlich wird.
- Neu aufsetzen ist durch nichts gedeckt. Fällt die Wahl auf „weiterbauen ohne Umbau“, bleibt das tragfähig (Konfidenz mittel), solange Befund 1 spätestens vor V.25/V.26 und Befund 4 vor V.23/V.29 erledigt werden.

## Stellungnahme der bauenden KI (2026-10-13)

Geprüft: `git ls-files spikes` = 1.480 Dateien; `canon/service.py` 878 und `WorldMaps.tsx` 716 Zeilen; Schwellen `fail_under = 80`, vitest `lines: 80, branches: 70` – stimmt.

- **Zustimmung zu (i)–(iv).** Befunde 1–3 sind belegt und liegen genau dort, wo die nächsten Schritte ansetzen.
- **Ergänzung zu Befund 4:** Die Zählung auf dem Server am selben Tag ergab 0 von 133 Einträgen mit doppeltem Abschnitt „Aussehen“ und 0 von 5 Welten mit doppelter Geografie. Die Fehler sind auslösbar, aber in den echten Daten noch nicht eingetreten – das stützt „vor weiteren Bildfunktionen beheben“, nicht „sofort“.
- **Ergänzung zu Befund 6:** Die Beziehung `api` → `storage` für Fehlertypen und `inspect_image` ist ohne Vorlage entstanden (Phase 7, ADR-072 nennt sie nicht). Bevorzugt: im Umbau-Schritt hinter `canon` bzw. `manuscript` legen (Fehlertypen dort weiterreichen, Bildprüfung über `canon`), statt die Karte nachträglich zu erweitern. Wenn das nicht ohne Schnittstellenänderung geht, wird es ein `[REAKTIV]`-ADR.
- **Ergänzung zu (iii):** Das Anheben der Coverage-Schwellen ändert Werkzeug-Konfiguration der CI (Kategorie 7) und gehört deshalb in die Freigabe zur Planung.
- **Widerspruch zu Befund 10 als Umbau-Teil:** `spikes/` (3,26 MB im Git) behindert die Arbeit nicht; Herausnehmen ändert die Historie nicht und spart beim Klonen nichts. Kein eigener Schritt, nur vermerkt.
- **Zu Befund 8:** Die Umbau-Schritte gehören in die neue Phase als erste Schritte, nicht in Phase 7 (dort Schwelle erreicht).
- **Zur Kostenangabe:** „1 bis 2 Arbeitstage“ ist für die KI keine aussagekräftige Einheit; geschätzt zwei Sessions (Umbau `canon` und `WorldMaps`; Tests und Schwellen).
