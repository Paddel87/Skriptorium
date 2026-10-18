# Archiv – Fahrplan Phase 8

<!-- Quelle: docs/fahrplan.md, Abschnitt „Aktuelle Phasen". Ausgelagert am 2026-10-18 (CLAUDE.md Abschnitt 14:
     Phase vollständig erledigt). Abgedeckter Zeitraum: 2026-10-13 bis 2026-10-18. -->

## Aktuelle Phasen

### Phase 8: Fundament, Datentrennung, Weltenbauer und Kanon-Verknüpfung – Typ: UMSETZUNG – ABGESCHLOSSEN (2026-10-18)

**Ziel:** Das Fundament dort festigen, wo die nächsten Schritte ansetzen (Pflichtfrage, ADR-080), die Befunde der Datentrennung (D.18) beheben und den Kanon besser verknüpfen: Weltenbauer im Alltag, genauere Zeitlinie, Verweise zwischen Einträgen und eine Erkundung zu wandernden Figuren.

**Abschlusskriterium:** Schritte 8.1–8.13 `[ERLEDIGT]`, `[VERWORFEN]` mit ADR oder `[VERSCHOBEN]` mit Ziel-Schritt.

**Reifegrad-Erwartung am Phasenende:** unverändert `[BELASTBAR]`; Änderungen an der Kontext-Zusammenstellung (8.6, 8.7, 8.9, 8.11) und Datenmodell-Konventionen (8.4, 8.10, 8.11) werden per ADR entschieden, bevor gebaut wird; 8.12 kann eine größere Datenmodell-Entscheidung vorbereiten.

**Ursprünglicher Schrittplan:** 13 Schritte, festgehalten am 2026-10-13 (ADR-080, ADR-081). Wucherungs-Schwelle: Default aus `docs/project-context.md` Abschnitt 6 (Faktor 2 und mindestens 5 zusätzliche Schritte, also mehr als 26); neue Wünsche während der Phase werden V-Schritte mit Landeplatz 8.13.

**Reihenfolge (Eigentümer, 2026-10-13; ADR-081):** Umbau 8.1–8.3, Datentrennung 8.4–8.7, Weltenbauer 8.8–8.9, Zeitlinie 8.10, Verweise 8.11, Erkundung wandernde Figuren 8.12; zuletzt 8.13.

**Pflichtfrage am Phasenende:** ADR „Weiterbauen, umbauen oder neu aufsetzen" – Nummer wird beim Phasenabschluss vergeben

#### 8.1: Umbau: Kanon-Dienst nach Verantwortung gliedern

- **Status:** ✅ ERLEDIGT (2026-10-13) – `CanonService` als Fassade (349 Zeilen, vorher 878) über `worlds`, `entries`, `maps`, `images`, `imports` mit `models`, `layout`, `headers`, `validation` (alle unter 150 Zeilen); keine privaten Importe über Dateigrenzen, keine Zyklen; Verhalten unverändert: pytest 734 grün ohne Änderung der Tests, Abdeckung 99 % (`canon` 95–100 % je Datei, offen nur die Rücknahme-Zweige wie vorher), ruff, mypy (73 Dateien), bandit ohne Befund. Befund 6: Fehlertypen waren schon Vertrag (Abschnitt 4); Bildprüfung und Größengrenzen per ADR-082 (`[REAKTIV]`) in der Karte festgehalten. Reifegrad-Tabelle auf Stand nach ADR-082. Umbau durch Unteragenten (Routine-Klasse), geprüft und verantwortet von der bauenden KI
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein – Umbau innerhalb von `canon` mit unveränderter Fassade (ADR-080); wenn Befund 6 nur mit Schnittstellenänderung lösbar ist: Vorlage (Kategorie 1)
- **Empfohlene Klasse:** Routine – durchspezifizierter Umbau ohne Verhaltensänderung, durch Tests gesichert; Entscheidung, falls Befund 6 eine Architekturfrage wird.
- **Eingangskriterien:** alle berührten Bestandteile `[BELASTBAR]`
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Befund 1 der Bewertung: `CanonService` (`canon/service.py`, 878 Zeilen) in Teile nach Verantwortung gliedern – Welten, Karten und Markierungen, Einträge, Bilder, Import/Export – mit unveränderter Fassade, wie `ManuscriptService` in 7.3. Befund 6: Fehlertypen und `inspect_image` nicht mehr direkt aus `storage` in `api` holen, sondern über `canon`/`manuscript`. Befund 7: Reifegrad-Tabelle in `docs/architecture.md` Abschnitt 9 auf den Stand nach ADR-079 bringen.
- **Akzeptanzkriterien:** Verhalten unverändert (alle Tests grün ohne Änderung der Erwartungen); `api` importiert `storage` nur noch für `system/`; Reifegrad-Tabelle aktuell; `canon/service.py` deutlich unter 500 Zeilen.
- **Betroffene Module:** canon, api
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Logbuch-Eintrag
- **Notizen:** Aus ADR-080, Bewertung `docs/research/bewertung-phase-7.md` (i), (v). Vor 8.11 und 8.12.

#### 8.2: Umbau: Kartenansicht in Hooks und Teilkomponenten

- **Status:** ✅ ERLEDIGT (2026-10-13) – `WorldMaps.tsx` 716 → 86 Zeilen; `MapViewer` (141 Zeilen, vorher ca. 450 mit 18 Hooks) verdrahtet die Hooks `useMapZoom`, `useMapMarking`, `useMapChange` und die Teile `MapStage`, `MapToolbar`, `MarkingBar`, `AddMap`; größte Datei `useMapMarking.ts` 162 Zeilen. DOM, Texte, Klassen und ARIA-Namen unverändert; einzige Verschiebung: der Name beim Umbenennen liegt in `MapToolbar` und wird beim Wechsel in „Markieren“ zurückgesetzt – ohne sichtbare Folge, weil „Markieren“ beim Umbenennen nicht angeboten wird (am alten Code geprüft). 16 neue Tests (`MapViewer.test.tsx`); vitest 289 grün, gesamt 95,29 % / Zweige 91,95 %; `WorldMaps.tsx` 100 % Zweige (vorher 64,9 %), Kartenteile 86–100 %; tsc, eslint, prettier, Build grün; Playwright 11/11 (Lauf des Unteragenten). Umbau durch Unteragenten (Routine-Klasse), geprüft von der bauenden KI
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein – Umbau innerhalb von `ui` ohne sichtbare Änderung (ADR-080)
- **Empfohlene Klasse:** Routine – durchspezifizierter Umbau ohne Verhaltensänderung.
- **Eingangskriterien:** alle berührten Bestandteile `[BELASTBAR]`
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Befund 2: `MapViewer` in `ui/src/views/WorldMaps.tsx` (ca. 450 Zeilen, 18 Hooks) in eigene Hooks (Zoom, Markieren) und Teilkomponenten zerlegen, nach dem Muster `useWriteFlow`; dabei die offenen Zweige der Kartenansicht testen.
- **Akzeptanzkriterien:** Verhalten unverändert (Komponenten- und End-to-End-Tests grün); keine Komponente der Kartenansicht über ca. 200 Zeilen; Zweigabdeckung `WorldMaps` über 85 %.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Aus ADR-080, Bewertung (ii). Vor 8.4 und 8.5.

#### 8.3: Fehlende Tests nachholen, Mindestwerte der Abdeckung anheben

- **Status:** ✅ ERLEDIGT (2026-10-13) – Python: +31 Tests (765), 98,88 → 99,89 % (alle Dateien der Liste 100 %; offen 6 Zweige in Schleifen-Enden außerhalb der Liste); Oberfläche: +56 Tests (345), Zeilen 95,49 → 98,71 %, Zweige 91,95 → 95,0–95,1 % (`files.ts` 28 → 100 %, `StoryCover` 70 → 100 %, `AppearanceExtract` 75 → 100 %); Mindestwerte angehoben: `fail_under = 99`, vitest Zeilen/Anweisungen 98, Funktionen 97, Zweige 94; Ratsche in `docs/project-context.md` Abschnitt 7. Tests durch zwei Unteragenten (Routine-Klasse), Stichprobe und alle Prüfungen durch die bauende KI
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 8.1, 8.2
- **Freigabepflichtig:** ja – Werkzeug-Konfiguration der CI (Kategorie 7), freigegeben mit ADR-080
- **Empfohlene Klasse:** Routine – Test-Erstellung und Testwartung.
- **Eingangskriterien:** 8.1 und 8.2 erledigt
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Befund 3: Tests für `ai_gateway/images.py`, `storage/images.py`, `ui/src/files.ts`, `StoryCover.tsx`, `AppearanceExtract.tsx`, `ImageGenerate.tsx`, `ImageDescription.tsx`; danach `fail_under` (`pyproject.toml`) und die vitest-Schwellen (`vite.config.ts`) auf den erreichten Stand abgerundet anheben; Regel in `docs/project-context.md` Abschnitt 7 festhalten: Schwellen werden nur angehoben.
- **Akzeptanzkriterien:** Python wieder mindestens 99 %, Oberfläche Zeilen mindestens 97 % und Zweige mindestens 93 %; Schwellen angehoben; CI grün.
- **Betroffene Module:** ai_gateway, storage, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Tests, Konfiguration, Logbuch-Eintrag
- **Notizen:** Aus ADR-080, Bewertung (iii).

#### 8.4: Übernahme ersetzt Abschnitte statt sie zu verdoppeln; Vorlage „Aussehen“ (V.29)

- **Status:** ✅ ERLEDIGT (2026-10-13) – entschieden mit Mockup (ADR-083). Umgesetzt: `ui/src/sections.ts` (Abschnitt lesen, ersetzen, ergänzen, entfernen, umbenennen; Abschnitt bis zur nächsten Überschrift gleicher oder höherer Ebene; übriger Text byte-gleich); Rückfrage „Ersetzen / Darunter ergänzen / Abbrechen“ (`SectionConflict`, `useSectionChoice`) an allen drei Übernahme-Stellen; Karte entfernen fragt nach der Geografie, Umbenennen zieht die Überschrift mit; `appearanceOf` überspringt leere Abschnitte; Vorlage neuer Figuren „Aussehen“ + „Wesen und Geschichte“; Server lehnt „Aussehen herauslösen“ für Nicht-Figuren ab (422). Tests aus D.18: Weltenbauer ohne fremde Welten, Markierungen in keiner Anfrage, Vorlagen bei leerem/doppeltem/unterteiltem Abschnitt. pytest 769 (99,89 %), vitest 380 (98,78 % Zeilen, 94,93 % Zweige), Playwright 11/11 (Lauf des Unteragenten), ruff, mypy, bandit, tsc, eslint, prettier, Build grün. Sichtprobe am lokalen Testserver (KI-Antwort im Browser ersetzt): Rückfrage erscheint mit bisherigem Text, „Ersetzen“ ergibt genau einen Abschnitt, Datei byte-genau geprüft; neue Figur mit neuer Vorlage. Vom Eigentümer freigegeben; Einspielen auf Wunsch später. Umsetzung durch Unteragenten (Sonnet), geprüft von der bauenden KI
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** 8.1, 8.2
- **Freigabepflichtig:** ja – verändert vorhandenen Text des Autors beim Übernehmen; Vorlage für neue Figuren ist Datenmodell-Konvention aus ADR-078 (Kategorie 4)
- **Empfohlene Klasse:** Entscheidung – Datenmodell-Konvention (Eskalations-Auslöser 1).
- **Eingangskriterien:** 8.1, 8.2 erledigt; Zählung auf dem Server erledigt (2026-10-13: 0 doppelte Abschnitte)
- **Anforderungen (ab Klasse M):** FR-035, FR-029
- **Zu tun:** wie V.29 (D.18 B1–B3, B6): „Übernehmen als ‚Aussehen‘“ und „In die Weltbeschreibung übernehmen“ ersetzen einen vorhandenen Abschnitt gleichen Namens bzw. füllen einen leeren (Rückfrage, wenn dort schon Text steht); Geografie einer gelöschten Karte auf Nachfrage mit entfernen; `appearanceOf` überspringt leere Abschnitte und endet erst an einer Überschrift gleicher oder höherer Ebene; Vorlage neuer Figuren so, dass freier Text nicht unter „Aussehen“ fällt; Server verlangt für „Aussehen herauslösen“ die Kategorie `figur`; Tests laut Bericht `docs/research/datentrennung-ki-bereiche.md`.
- **Akzeptanzkriterien:** Vorlage bzw. ADR; Tests; nach erneutem Beschreiben genau ein Abschnitt; Eigentümer bestätigt.
- **Betroffene Module:** ui, canon, api
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ggf. ADR
- **Notizen:** Aus V.29 (ADR-081).

#### 8.5: Bildvorlagen aus „Aussehen“ bzw. der Geografie dieser Karte (V.31)

- **Status:** ✅ ERLEDIGT (2026-10-13) – entschieden mit Mockup (ADR-084): Orte und Gegenstände aus „Aussehen“, sonst Textanfang; Karten nur aus „Geografie – Name der Karte“, sonst Titel; Titelbild aus Titel, Genres und Atmosphäre (Wahl des Eigentümers abweichend von der Empfehlung). Umgesetzt in `ui/src/imagePrompts.ts` mit Tests für leeren Abschnitt, fremde Karten-Geografie, Titelbild ohne Handlung; vitest 382 grün (98,78 % / 95,01 %), tsc, eslint, prettier grün
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** 8.4
- **Freigabepflichtig:** ja – ändert die Vorbelegung aus ADR-077
- **Empfohlene Klasse:** Entscheidung – Änderung einer per ADR festgelegten Vorbelegung (Eskalations-Auslöser 1).
- **Eingangskriterien:** 8.4 erledigt
- **Anforderungen (ab Klasse M):** FR-035
- **Zu tun:** wie V.31 (D.18 B5): Orte und Gegenstände: Abschnitt „Aussehen“, wenn vorhanden; Karte: Abschnitt „Geografie – Name dieser Karte“, wenn vorhanden, sonst nur der Titel; Titelbild: unverändert oder nur Titel und Genre (Wahl des Eigentümers).
- **Akzeptanzkriterien:** Vorlage; Tests für leeren, doppelten und unterteilten Abschnitt; Eigentümer bestätigt.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ggf. ADR
- **Notizen:** Aus V.31 (ADR-081).

#### 8.6: Kapitel-Kurzfassung nur mit dem Stand vor dem Kapitel (V.30)

- **Status:** ✅ ERLEDIGT (2026-10-13) – entschieden (ADR-085, Option A): Kurzfassungen der Kapitel davor statt der Gesamtzusammenfassung; Kapiteltext hat Vorrang, die ältesten Kurzfassungen fallen bei Platzmangel zuerst weg; Längengrenze unabhängig von der übrigen Geschichte. `context/summaries.py`; drei Tests geändert (gewolltes neues Verhalten), drei neue (nur frühere Kapitel, älteste zuerst weg, Grenze unabhängig); pytest 771 grün, 99,89 %; ruff, mypy grün. Anfrage beim Weiterschreiben nicht betroffen
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** 8.1
- **Freigabepflichtig:** ja – Kontext-Zusammenstellung (Kategorie 1)
- **Empfohlene Klasse:** Entscheidung – Kontext-Zusammenstellung (Eskalations-Auslöser 1).
- **Eingangskriterien:** 8.1 erledigt
- **Anforderungen (ab Klasse M):** FR-010
- **Zu tun:** wie V.30 (D.18 B4): Beim Neu-Erzeugen der Kurzfassung eines früheren Kapitels nicht die Gesamtzusammenfassung unter „Handlungsstand vor diesem Kapitel“ mitgeben (`context/summaries.py`), sondern die Kurzfassungen der Kapitel davor – oder ehrliche Überschrift (Vorlage). Test: weder Kanon noch andere Geschichten in den beiden Zusammenfassungs-Anfragen.
- **Akzeptanzkriterien:** Vorlage; Tests; Probe nach Regel-002, falls die Anfrage beim Schreiben betroffen ist.
- **Betroffene Module:** context, api
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ggf. ADR
- **Notizen:** Aus V.30 (ADR-081).

#### 8.7: Regeln und Zeitlinie im Wortlaut an den Weltenbauer? (V.32)

- **Status:** ✅ ERLEDIGT (2026-10-13) – gemessen an den fünf Welten des Eigentümers (nur Dateigrößen): 400–2.100 Token, höchstens ca. 0,4 Cent je Antwort; entschieden A (ADR-086): Regeln und Zeitlinie immer im Wortlaut, `@`-Einträge nicht doppelt. `context/worldbuilder.py`, neuer Test; pytest 772 grün, 99,89 %
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** 8.1
- **Freigabepflichtig:** ja – Kontext-Zusammenstellung (Kategorie 1)
- **Empfohlene Klasse:** Entscheidung – Kontext-Zusammenstellung mit Kostenwirkung (Eskalations-Auslöser 1).
- **Eingangskriterien:** 8.1 erledigt
- **Anforderungen (ab Klasse M):** FR-029
- **Zu tun:** wie V.32: Der Weltenbauer bekommt Regeln und Zeitlinie nur als Namen (`context/worldbuilder.py`). Kosten je Anfrage mit und ohne Wortlaut messen und als Vorlage vorlegen; Test „Weltenbauer ohne fremde Welten“ (D.18).
- **Akzeptanzkriterien:** Vorlage mit gemessenen Kosten; Entscheidung umgesetzt; Tests.
- **Betroffene Module:** context
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ggf. ADR
- **Notizen:** Aus V.32 (ADR-081).

#### 8.8: Weltenbauer behält das Gespräch nach „Als Kanon übernehmen“ (V.27)

- **Status:** ✅ ERLEDIGT (2026-10-13) – Mockup freigegeben (Variante A, ohne ADR – Bedienung): „Als Kanon übernehmen“ öffnet die Import-Vorschau als Fenster über dem Weltenbauer (`ImportDialog`), die Vorschau ist als `ImportReview` mit dem Reiter „Import“ geteilt; nach dem Übernehmen „Zurück zum Weltenbauer“, die Liste lädt neu ohne Neuaufbau der Kanon-Seite. Sprung in den Reiter „Import“ (`state.importText`, `initialText`) entfernt. vitest 384 grün (98,78 % / 94,92 %), tsc, eslint, prettier, Build, Playwright 11/11 (Lauf des Unteragenten). Sichtprobe am lokalen Testserver mit 375 px und dunkler Darstellung (Antwort des Weltenbauers im Browser ersetzt): Fenster passt, Übernehmen legt „Fährmann Tom“ an, Gespräch bleibt, Adresse bleibt `/kanon`. Vom Eigentümer freigegeben. Umsetzung durch Unteragenten (Sonnet), geprüft von der bauenden KI
- **Phasentyp-Kontext:** UMSETZUNG (mit Mockup zu Beginn)
- **Abhängigkeiten:** 8.1
- **Freigabepflichtig:** nein bei Variante A/B (Bedienung); Mockup vorher/nachher
- **Empfohlene Klasse:** Routine – Bedienung ohne Architekturwirkung; Entscheidung nur, falls Variante C wieder aufkäme.
- **Eingangskriterien:** 8.1 erledigt
- **Anforderungen (ab Klasse M):** FR-029
- **Zu tun:** wie V.27: Vorschlag A – Import-Vorschau als Fenster auf der Kanon-Seite, danach „Zurück zum Weltenbauer“ im selben Gespräch; Alternative B – Gespräch auf Weltebene halten. Verworfen C (Gespräch im Browser speichern, gegen ADR-048).
- **Akzeptanzkriterien:** Mockup freigegeben; mehrere Einträge hintereinander im selben Gespräch; Tests; Eigentümer bestätigt.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests
- **Notizen:** Aus V.27 (ADR-081).

#### 8.9: Weltenbauer aus dem Manuskript – Kanon-Eintrag aus vorhandenen Textstellen (V.22)

- **Status:** ✅ ERLEDIGT (2026-10-18) – echte Probe an einer Geschichte des Eigentümers durch ihn selbst, Rückmeldung 2026-10-18: „8.9 habe ich schon getestet, das hat funktioniert“ (Wortlaut sinngemäß, Spracheingabe). Vorher: entschieden mit Mockup (ADR-087). Umgesetzt (Unteragent, geprüft von der bauenden KI): `context/manuscript_hits.py` (Absätze mit Name/Aliassen als ganzes Wort, auch Genitiv – von der bauenden KI ergänzt; je Kapitel die Kurzfassung; erste/letzte/verteilte Stellen bis 12.000 Token), Teil `fundstellen` im Weltenbauer, `POST …/worldbuilder` optional `manuscript`, neu `POST …/worldbuilder/hits` (nur Zahlen); Bereich „📖 Aus dem Manuskript“ mit Anzahl, Token und Kosten je Antwort, „✕“. pytest 792 (99,84 %), vitest 389 (98,8 % / 94,93 %), ruff, mypy, bandit, tsc, eslint, prettier, Build, Playwright 11/11 (Lauf des Unteragenten). Sichtprobe am lokalen Testserver (ohne echte KI-Antwort). Vom Eigentümer freigegeben („Passt, nur mergen“). Eingespielt 2026-10-13 (`19a5e48`)
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** 8.7, 8.8
- **Freigabepflichtig:** ja – neuer Ablauf (Kategorie 1), ggf. Erweiterung der Anfrage-Zusammenstellung
- **Empfohlene Klasse:** Entscheidung – neuer Ablauf und Kontext-Zusammenstellung (Eskalations-Auslöser 1).
- **Eingangskriterien:** 8.7 und 8.8 erledigt
- **Anforderungen (ab Klasse M):** FR-029
- **Zu tun:** wie V.22: Fundstellen über Namen und Aliasse aus allen Kapiteln suchen, mit Kurzfassungen an die KI geben, Übernahme über die Import-Vorschau wie beim Weltenbauer; Auswahl, wenn die Fundstellen das Budget übersteigen (erste Auftritte und Wendepunkte, mehrere Durchgänge).
- **Akzeptanzkriterien:** Vorlage und ADR; Tests; echte Probe an einer Geschichte des Eigentümers; Eigentümer bestätigt.
- **Betroffene Module:** context, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR
- **Notizen:** Aus V.22 (ADR-081).

#### 8.10: Zeitlinie mit Jahr, Datum und Uhrzeit (V.28)

- **Status:** ✅ ERLEDIGT (2026-10-13) – Formen der echten Zeitlinien auf dem Server anonym geprüft (14 Einträge: „Jahr – Titel“, zwei „Uhrzeit – Titel“, keine Monate). Mit Mockup entschieden: erkennen statt vorschreiben (nur Ansicht, kein ADR – ADR-069 bleibt), Gruppe „Ohne Jahr“, Ansicht nach Jahren mit Marken für Datum und Uhrzeit. Umgesetzt in `ui/src/timeline.ts` (Uhrzeit `HH:MM`/`HH Uhr`, Datum `T.M.`/`T.M.J`/`T. Monatsname`, übrige Zahl als Jahr; Sortierung Jahr–Monat–Tag–Uhrzeit, stabil), `TimelineGroups.tsx`; Namen werden nur an „ – “ geteilt (vorher zerschnitt der Doppelpunkt „14:30 Uhr – …“). vitest 395 grün (98,84 % / 95,1 %), tsc, eslint, prettier, Build, Playwright 11/11 (Lauf des Unteragenten). Sichtprobe am lokalen Testserver (Desktop dunkel, Handy hell); Platzhalter auf Wunsch des Eigentümers auf „Zeit“ gekürzt. Vom Eigentümer freigegeben. Umsetzung durch Unteragenten (Sonnet), geprüft von der bauenden KI
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage und Mockup zu Beginn)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja, falls die Form der Zeitangaben im Kanon festgelegt wird (Datenmodell, Kategorie 4); Darstellung allein nicht
- **Empfohlene Klasse:** Entscheidung – mögliche Datenmodell-Konvention (Eskalations-Auslöser 1).
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-023
- **Zu tun:** wie V.28: zwischen Jahreszahl, Datum und Uhrzeit unterscheiden; auch nur Uhrzeit oder nur Datum; im Verlauf sichtbar machen, wo die Zeitstempel sind. Stand heute (ADR-069): sortiert nach der ersten Zahl.
- **Akzeptanzkriterien:** Vorlage bzw. ADR; Mockup freigegeben; Tests; Eigentümer bestätigt.
- **Betroffene Module:** ui, ggf. canon
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ggf. ADR
- **Notizen:** Aus V.28 (ADR-081).

#### 8.11: Verweise zwischen Kanon-Einträgen; ortsgebundene Regeln (V.25)

- **Status:** ✅ ERLEDIGT (2026-10-18) – vom Eigentümer bestätigt am 2026-10-18 nach Zusammenfassung der Probe; dabei Satz im Probebericht richtiggestellt (vier Mittelwerte außerhalb der Vorher-Spannweite, je nur in einer Geschichte – Ergebnis nach Regel-002 unverändert, `spikes/regel-002/README.md`). Vorher: entschieden (ADR-088) und umgesetzt (Unteragent, geprüft von der bauenden KI): `find_references` und `reference_candidates` in `context/writing.py` (`@Name`/Alias derselben Welt, längster Treffer, Genitiv wie in der Oberfläche – von der bauenden KI angeglichen), Verweise vorn in beiden Auffüllungsläufen, eine Stufe tief; Rahmensatz „Eine Regel mit der Zeile „Gilt nur in: …“ gilt nur an diesem Ort.“; Weltenbauer verteilt und verknüpft mit `@Name`; `@Name` als Link in der Kanon-Ansicht. pytest 805 (99,84 %), vitest 398 (98,84 % / 95,12 %), ruff, mypy, bandit, tsc, eslint, prettier, Build, Playwright 11/11 (Lauf des Unteragenten). Probe nach Regel-002 gelaufen (2026-10-13, Cloud-Session, `spikes/regel-002/README.md`): Verweise wirken wie vorgesehen; Regel außerhalb des Orts nicht angewendet (auch vorher nicht); „wörtlich %“ nach 3 Läufen über der Vorher-Spannweite, nach 6 Läufen je Seite innerhalb – keine Verschlechterung (Regel-002). Nicht erfolgt: vollständige Handbewertung der Widersprüche durch eine getrennte Instanz (nur Stichprobe) – dem Eigentümer vor der Bestätigung genannt
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** 8.1, 8.7
- **Freigabepflichtig:** ja – Anfrage-Zusammenstellung (Kategorie 1), ggf. Datenmodell (Kategorie 4)
- **Empfohlene Klasse:** Entscheidung – Kontext-Zusammenstellung und Datenmodell (Eskalations-Auslöser 1).
- **Eingangskriterien:** 8.1 und 8.7 erledigt
- **Anforderungen (ab Klasse M):** FR-011, FR-013
- **Zu tun:** wie V.25: Kanon-Einträge verweisen auf andere; kommt ein Eintrag in den Kontext, kommen seine verwiesenen mit (Vorschlag A: `@Name` im Text eines Eintrags, eine Stufe tief, im Rahmen des Budgets); optional ortsgebundene Regeln; der Weltenbauer verknüpft verteilte Einträge.
- **Akzeptanzkriterien:** Vorlage und ADR; Tests; Probe nach Regel-002; Eigentümer bestätigt.
- **Betroffene Module:** context, canon, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, ADR
- **Notizen:** Aus V.25 (ADR-081). Gemeinsam mit 8.12 denken (V.26 nennt V.25 als Partner). **Prüfauftrag für die Cloud-Session (Regel-002, `spikes/regel-002/README.md`):** (1) `VARIANTE=vorher` auf dem Stand vor 8.11 (`9acc5bf`), `VARIANTE=nachher` auf `main` mit 8.11, je `LAEUFE=3`, beide Testgeschichten, grok-4.6 – Kennzahlen dürfen nicht außerhalb der Spannweite schlechter werden (der neue Rahmensatz wirkt in jeder Anfrage). (2) Wirkung der Verweise: in der Testwelt Salzmark zwei bis drei Einträgen `@Name`-Verweise und einer Regel „Gilt nur in: @Ort“ geben (nur im Spike-Verzeichnis), eine Anweisung nennt einen davon mit `@`; vorher/nachher je 3 Läufe – Erwartung: die verwiesenen Einträge stehen unter „Herangezogen“, keine neuen Widersprüche; die ortsgebundene Regel wird außerhalb des Orts nicht angewendet. Kosten ca. 0,2–0,4 $ je Kette, insgesamt ca. 5–8 $. Ergebnis in `spikes/regel-002/README.md` und Logbuch; danach 8.11 abschließen.

#### 8.12: Wandernde Figuren – Erkundung (V.26)

- **Status:** ✅ ERLEDIGT (2026-10-13) – Bericht `docs/research/wandernde-figuren.md`: drei Optionen (A Gast-Verbindung ausbauen, B Kopie mit Herkunft, C Figurenbibliothek über den Welten) mit Kosten, Umkehrbarkeit und Vision-Grenze; Befund auf dem Server: 23 Figuren, 0 in mehreren Welten, 0 Gast-Verbindungen. Konfidenz für C niedrig bei teurer Umkehrbarkeit – kein Rateschluss (`CLAUDE.md` Abschnitt 8, Kriterium 8). Eigentümer: „Erst ausprobieren, dann A“ → V.34 (Landeplatz 8.13), B verworfen, C nicht weiter verfolgt
- **Phasentyp-Kontext:** ERKUNDUNG innerhalb der UMSETZUNG-Phase (wie Spike 6.13)
- **Schritt-Art (nur ERKUNDUNG):** Vergleichsstudie
- **Zeitbox (nur ERKUNDUNG):** eine Session, dann Zwischenstand
- **Abhängigkeiten:** 8.1, 8.11
- **Freigabepflichtig:** nein für die Erkundung; jede Umsetzung ist Datenmodell und Architektur (Kategorien 1 und 4)
- **Empfohlene Klasse:** Entscheidung – kann eine Architektur- und Datenmodellentscheidung vorbereiten; Fehlschluss teuer.
- **Eingangskriterien:** 8.1 und 8.11 erledigt
- **Anforderungen (ab Klasse M):** FR-016, FR-017
- **Zu tun:** Fragen aus V.26 klären: weltneutraler Kern einer Figur; Weltbezug je Welt (Herkunft, Beziehungen, Besitz, Erlebtes); Einpassen in eine neue Welt; Erlebnisse wandern mit. Wie trägt das Datenmodell das (jede Ablage hängt an `world_id`)? Verhältnis zu Gast-Verbindungen (3.7) und Verweisen (8.11). Mindestens zwei Optionen mit Kosten und Umkehrbarkeit; Vision-Abgrenzung „keine Multiversums-Ebene“ beachten.
- **Akzeptanzkriterien:** Erkenntnisdokument `docs/research/wandernde-figuren.md` mit Optionen; Vorlage an den Eigentümer; Umsetzung als eigener Schritt mit Landeplatz 8.13.
- **Betroffene Module:** keine (nur lesen)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Erkenntnisdokument, Logbuch-Eintrag
- **Notizen:** Aus V.26 (ADR-081). Eigentümer: „Schweres Thema“ – zuerst verstehen, nicht bauen.

#### 8.13: Planung der nächsten Ausbaustufe

- **Status:** ✅ ERLEDIGT (2026-10-18) – Bestätigungen des Eigentümers (8.9, 8.11); Vision-Abgleich bestanden (keine verwaisten Elemente; Drift in `docs/architecture.md` Abschnitte 3, 6, 9 und `docs/requirements.md` behoben; Beförderung der Kontexttreue → 9.14); Onboarding-Pfad auf frischem Worktree grün; V.35 mit dem Eigentümer durchgegangen; Pflichtfrage mit getrennter Instanz: gezielt umbauen (ADR-089, `docs/research/bewertung-phase-8.md`); Phase 9 geplant (ADR-090): V.35 → 9.3–9.9 und 9.12, V.36 → 9.10, V.37 → 9.11, V.34 → 9.13; V.20, V.21, V.23, V.24, V.33 weiter → 9.15
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 8.1–8.12
- **Freigabepflichtig:** ja – neue Phasen sind Replanning
- **Empfohlene Klasse:** Entscheidung – inhaltliche Neuplanung mit Vision-Abgleich.
- **Eingangskriterien:** Vision-Abgleich an der Phasengrenze nach Phase 8
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** V.20, V.21, V.23, V.24, V.33, V.34 (Umsetzung aus 8.12), V.35 (Befunde des Eigentümers, zuerst mit ihm durchgehen), V.36 (Cache-Treffer festhalten), V.37 (Verbrauchsstatistik je Welt und Geschichte) (und neue V-Schritte) in eine neue Phase überführen oder per ADR verwerfen. Dazu (Befund des Vision-Abgleichs 2026-10-18): Beförderung der NFR Kontexttreue von `[VORLÄUFIG]` auf `[BELASTBAR]` entscheiden – die Bedingung aus ADR-062 (Abnahme durch den Eigentümer) ist seit 2026-10-11 erfüllt, ein Schritt dafür fehlte.
- **Akzeptanzkriterien:** Jeder verschobene Schritt hat einen neuen Schritt mit ID oder `[VERWORFEN]` mit ADR.
- **Betroffene Module:** keine (Planung)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-13 (ADR-081).
