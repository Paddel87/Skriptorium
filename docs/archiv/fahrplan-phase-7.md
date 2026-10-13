# Archiv – Fahrplan Phase 7

<!-- Quelle: docs/fahrplan.md, Abschnitt „Aktuelle Phasen". Ausgelagert am 2026-10-13 (CLAUDE.md Abschnitt 14:
     Phase vollständig erledigt; 7.15 verschoben → V.33). Abgedeckter Zeitraum: 2026-10-12 bis 2026-10-13. -->

## Aktuelle Phasen

### Phase 7: Zeitlinie, Publizieren, Gestaltung und Bilder – Typ: UMSETZUNG – ABGESCHLOSSEN (2026-10-13)

**Ziel:** Auf einem aufgeräumten Fundament (Pflichtfrage, ADR-067) wird das Skriptorium vom Schreibwerkzeug zur Werkstatt bis zum fertigen Werk: Zeitlinie mit Kalenderdaten, eine Schreibweise, der die Kapitel folgen, Ausgabe als fertiges Dokument, ein einheitliches Aussehen sowie Bilder und Karten zu Figuren, Orten und Welt.

**Abschlusskriterium:** Schritte 7.1–7.8 `[ERLEDIGT]`, `[VERWORFEN]` mit ADR oder `[VERSCHOBEN]` mit Ziel-Schritt.

**Reifegrad-Erwartung am Phasenende:** unverändert `[BELASTBAR]`; Datenmodell-Erweiterungen (7.2, 7.3, 7.6) und neue Abhängigkeiten (7.4, 7.5) werden per ADR entschieden, bevor gebaut wird; 7.6 (Ablage von Bilddateien) kann die Architektur von `storage` erweitern und braucht dann eine Erkundung vor dem Bau.

**Ursprünglicher Schrittplan:** 8 Schritte, festgehalten am 2026-10-12 (ADR-067, ADR-068). Stand 2026-10-12: 9 Schritte (+7.9 Befund aus dem Alltag); 13 Schritte (+7.10–7.13 aus dem Zuschnitt von 7.6, ADR-072); 14 Schritte (+7.14 aus der Vorlage zu 7.10, ADR-073); 15 Schritte (+7.15 aus der Vorlage zu 7.13, ADR-074); 16 Schritte (+7.16 auf ausdrücklichen Wunsch des Eigentümers, ADR-078) – Wucherungs-Schwelle erreicht, aber nicht überschritten. Wucherungs-Schwelle: Default aus `docs/project-context.md` Abschnitt 6 (Faktor 2 und mindestens 5 zusätzliche Schritte, also mehr als 16); neue Wünsche während der Phase werden V-Schritte mit Landeplatz 7.8 – Ausnahmen nur auf ausdrücklichen Wunsch des Eigentümers (wie 6.14).

**Reihenfolge (Eigentümer, 2026-10-12; ADR-068, ADR-072):** 7.1 Umbau (mit 7.7), dann 7.2 Zeitlinie, 7.3 Schreibweise, 7.4 Publizieren, 7.5 Gestaltung, 7.6 Bilder an Kanon-Einträgen, 7.10 Karten, 7.11 Bilder in Geschichten, 7.12 KI-Bilder, 7.13 KI kennt Bilder; zuletzt 7.8.

**Pflichtfrage am Phasenende:** ADR „Weiterbauen, umbauen oder neu aufsetzen" – Nummer wird beim Phasenabschluss vergeben

#### 7.1: Umbau vor den neuen Funktionen (Befunde 1, 2, 4, 5 der Bewertung)

- **Status:** ✅ ERLEDIGT (2026-10-12) – Ausgangsstand festgehalten: 42 KI-Anfragen der Testgeschichten (bytegleich bei Wiederholung), 15 Bildschirmfotos (14 pixelgleich bei Wiederholung); Umbau an zwei Unteragenten der Routine-Klasse abgegeben und geprüft. Ergebnis: `context/builder.py` 866 → 237 Zeilen (neu `parts.py`, `writing.py`, `summaries.py`; keine privaten Importe, kein Import zur Laufzeit); `Canon.tsx` 468 → 197, `ChapterEditor.tsx` 363 → 221 (Hooks und Teilkomponenten); `api.ts` 741 Zeilen → `ui/src/api/` mit 11 Dateien. 42 Anfragen bytegleich; 13 von 15 Bildschirmfotos pixelgleich, die zwei übrigen (Weltenbauer) nur in 6 bzw. 10 Pixeln am Rand der Scrollleiste (Zeitzufall, auch beim Ausgangsstand); pytest 560 (99,85 %, `context` 100 %), vitest 217 (98,18 %), Playwright 11 grün; keine Testdatei geändert. CI grün (PR #132). Kein Einspielen nötig für die Abnahme (keine sichtbare Änderung); geht mit dem nächsten Einspielen auf den Server
- **Phasentyp-Kontext:** UMSETZUNG (Umbau ohne sichtbare Änderung, wie 6.11/6.12)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein – Umbau innerhalb der Module, öffentliche Schnittstellen unverändert (`CLAUDE.md` Abschnitt 5)
- **Empfohlene Klasse:** Routine – mechanischer Umbau, durch Tests abgesichert; Abgabe an einen Unteragenten der Routine-Klasse möglich (wie 6.11).
- **Eingangskriterien:** ADR-067
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** (1) gemeinsame Hilfen der Anfrage-Zusammenstellung (Budget, Teile, Darstellung) in ein internes Untermodul von `context`; `worldbuilder.py` ohne private Importe, `ContextBuilder` ohne Laden zur Laufzeit; `builder.py` nach Anfrageart aufteilen. (2) `ui/src/views/Canon.tsx` und `ChapterEditor.tsx` in eigene Hooks und Teilkomponenten schneiden. (3) `ui/src/api.ts` nach Bereichen aufteilen (Server-Routen gespiegelt). Verhalten unverändert.
- **Akzeptanzkriterien:** Tests unverändert grün (pytest, vitest, Playwright); Abdeckung nicht gesunken; Bildschirmfotos vorher/nachher gleich; Anfragen der Testgeschichten byte-gleich (Regel-002).
- **Betroffene Module:** context, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-12 aus der Pflichtfrage (ADR-067). Befund 3 (`ManuscriptService` gliedern) gehört zu 7.3.

#### 7.2: Zeitlinie mit Kalenderdaten

- **Status:** ✅ ERLEDIGT (2026-10-12) – entschieden (ADR-069): A, Zeitstrahl aus dem Text, nur die Ansicht sortiert; Mockup freigegeben. Umgesetzt: `ui/src/timeline.ts`, `TimelineView.tsx`, Anzeige in `EntryArticle`; vitest 226 (98,24 %), Playwright 11 grün; Sichtprobe Desktop (hell) und Handy (schwarz) an der Testwelt, „+ Ereignis“ 403 an der richtigen Stelle in der Datei. Eingespielt 2026-10-12 (`2d3a4f0`). Eigentümer fand die Funktion nicht – seine Zeitlinie ist eine Folge von Einträgen „Jahr – Ereignis“ (lesend gezählt, nur Zahlen). Nachgesteuert (ADR-069, Mockup freigegeben): Zeitstrahl über alle Zeitlinien-Einträge der Welt beim Filter „Zeitlinie“, „+ Ereignis“ legt Eintrag an; `WorldTimeline.tsx`, `entryEvent`/`worldEvents` in `timeline.ts`; vitest 233, Playwright 11 grün. Eingespielt 2026-10-12 (`0fbc61b`). Vom Eigentümer bestätigt 2026-10-12 („Alles da“).
- **Phasentyp-Kontext:** UMSETZUNG (mit Entscheidungsvorlage zu Beginn)
- **Abhängigkeiten:** 7.1
- **Freigabepflichtig:** ja – Datenmodell (Kategorie 4): optionales Datum an Zeitlinien-Einträgen
- **Empfohlene Klasse:** Entscheidung – Datenmodellentscheidung (Eskalations-Auslöser 1); die Umsetzung danach ist Routine.
- **Eingangskriterien:** Form des Datums im Kalender der Welt per ADR; Mockup
- **Anforderungen (ab Klasse M):** FR-023
- **Zu tun:** Zeitlinien-Einträge optional mit Datumsangaben im Kalender der Welt; Übersicht und Sortierung für den Autor; die KI liest die Ereignisse weiterhin als Text.
- **Akzeptanzkriterien:** ADR; Tests; Mockup freigegeben; Eigentümer bestätigt.
- **Betroffene Module:** canon, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-12 (ADR-068), übernommen aus V.16.

#### 7.3: Schreibweise der Geschichte wirkt auf bestehende Kapitel

- **Status:** ✅ ERLEDIGT (2026-10-12) – `ManuscriptService` gegliedert (868 → 311 Zeilen Fassade plus sieben Dateien; Unteragent der Routine-Klasse, geprüft: Anfragen bytegleich, 100 % Abdeckung). Entschieden (ADR-070): A ganz oder gar nicht; Mockup der Hinweistexte freigegeben. Umgesetzt: neue Kapitel ohne Kopie, unveränderte Kopien folgen beim Ändern der Vorgabe; pytest 561 (100 % `manuscript`), vitest 226, Playwright 11 grün. Eingespielt 2026-10-12 (`2d3a4f0`). Vom Eigentümer bestätigt 2026-10-12 („Das scheint bisher alles zu passen“).
- **Phasentyp-Kontext:** UMSETZUNG (mit Entscheidungsvorlage zu Beginn)
- **Abhängigkeiten:** 7.1
- **Freigabepflichtig:** ja – Datenmodell (Kategorie 4): Kapitel speichern nur Abweichungen; Übergang für Kapitel mit eigener Kopie
- **Empfohlene Klasse:** Entscheidung – Datenmodell mit Übergang (Eskalations-Auslöser 1).
- **Eingangskriterien:** Übergang per ADR (Option B aus ADR-053)
- **Anforderungen (ab Klasse M):** keine (Ergänzung zu FR-026)
- **Zu tun:** Zuerst `ManuscriptService` nach Verantwortung gliedern, Schnittstelle als Fassade erhalten (Befund 3 der Bewertung, ADR-067). Dann: Kapitel speichern nur Abweichungen von der Vorgabe der Geschichte; nicht einzeln geänderte Kapitel folgen einer geänderten Vorgabe sofort.
- **Akzeptanzkriterien:** ADR; Tests inkl. Übergang vorhandener Kapitel; Eigentümer bestätigt.
- **Betroffene Module:** manuscript, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-12 (ADR-068), übernommen aus V.14.

#### 7.4: Publizieren (Satz, Export, Veröffentlichung)

- **Status:** ✅ ERLEDIGT (2026-10-12) – entschieden (ADR-071): EPUB, alle Kapitel mit Wahl „nur abgeschlossene“, Veröffentlichung → V.21; Mockup freigegeben. Umgesetzt: `manuscript/epub.py` (EPUB 3 plus `toc.ncx`, Standardbibliothek, alles maskiert), `POST …/stories/{story}/export/epub`, Abschnitt „Als E-Book ausgeben“; pytest 565 (`epub.py` 100 %), vitest 229, Playwright 11 grün; im Browser mit der CSP des Servers heruntergeladen, Aufbau geprüft (mimetype zuerst und ungepackt, XML wohlgeformt). Kein `epubcheck` (kein Java). Eingespielt 2026-10-12 (`2d3a4f0`). Eigentümer fand den Abschnitt zuerst nicht (ganz unten im Reiter „Geschichte“), dann „gefunden, alles ok“ – Auffindbarkeit als Punkt für 7.5 vermerkt.
- **Phasentyp-Kontext:** UMSETZUNG (mit Entscheidungsvorlage zu Beginn)
- **Abhängigkeiten:** 7.3
- **Freigabepflichtig:** ja – Ausgabeformat (Kategorie 5), ggf. neue Abhängigkeit für den Satz (Kategorie 3)
- **Empfohlene Klasse:** Entscheidung – Format und ggf. Abhängigkeit (Eskalations-Auslöser 1).
- **Eingangskriterien:** Format (z. B. EPUB, PDF, DOCX) und Umfang per ADR; Mockup
- **Anforderungen (ab Klasse M):** FR-034
- **Zu tun:** Eine Geschichte als fertiges Dokument ausgeben (Vision 5: „nicht in der ersten Version, aber nicht ausgeschlossen“).
- **Akzeptanzkriterien:** ADR; Tests; Ausgabe öffnet sich in einem gängigen Leseprogramm; Eigentümer bestätigt.
- **Betroffene Module:** manuscript, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-12 (ADR-068), übernommen aus V.1.

#### 7.5: Gestaltung der Oberfläche

- **Status:** ✅ ERLEDIGT (2026-10-12) – Mockup mit drei Richtungen (A Feinschliff, B Material-nah, C Buch); Eigentümer wählte zuerst A, stoppte den Bau und entschied sich für C „Buch – ruhig, wenig Rahmen“ mit Buchschrift. Keine Bibliothek (Kategorie 3 nicht berührt, keine ADR). Umgesetzt: Papierfläche, Manuskript als Seite in Buchschrift auf Lesebreite, Anweisung als Schreiblinie, Linien-Symbole statt Emojis (`Icons.tsx`; Beschriftung am Desktop nur für Screenreader und als Hinweis), zurückgenommene Knöpfe mit einer dunklen Hauptschaltfläche, Reiter als unterstrichener Text; Hell/Dunkel/Schwarz über dieselben Variablen. vitest 233, Playwright 11 grün; Sichtprobe Desktop (hell, dunkel, schwarz) und Handy. Eingespielt 2026-10-12 (`07ff5f8`, Cursor-Befund `592deb0`). Vom Eigentümer bestätigt 2026-10-12 („Sieht gut aus“; „Der Cursor ist richtig ausgerichtet und der Text passt auch“).
- **Phasentyp-Kontext:** UMSETZUNG (mit Entscheidungsvorlage und Mockups zu Beginn)
- **Abhängigkeiten:** 7.1
- **Freigabepflichtig:** ja, falls eine Komponenten-Bibliothek (Kategorie 3); eigenes CSS nach Richtlinien ohne Freigabe
- **Empfohlene Klasse:** Entscheidung – Gestaltungsrichtung und ggf. Abhängigkeit (Eskalations-Auslöser 1).
- **Eingangskriterien:** Richtung per Mockups und ggf. ADR
- **Anforderungen (ab Klasse M):** keine (Ergänzung zu FR-019)
- **Zu tun:** Einheitliches, moderneres Aussehen, möglicherweise nach Material Design; alle vier Darstellungen (Hell, Dunkel, Schwarz, Automatisch) bleiben.
- **Akzeptanzkriterien:** Mockups freigegeben; Tests; Sichtprobe Desktop und Handy; Eigentümer bestätigt.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ggf. ADR
- **Notizen:** Angelegt 2026-10-12 (ADR-068), übernommen aus V.8. Befund des Eigentümers nach dem Einspielen von „Buch“ (2026-10-12): Cursor im leeren Anweisungsfeld über und links neben dem Beispieltext; Beispieltext zu speziell. Behoben: `drawSelection` im Anweisungsfeld (gemessen: Cursor 0,6 px vor dem Beispieltext, mittig auf der Zeile), Beispieltext „Was soll als Nächstes geschehen? Leer lassen = einfach weiterschreiben. Mit @ holst du Figuren, Orte und mehr aus dem Kanon dazu.“ (Wahl des Eigentümers). Vor 7.6, damit die Bild-Ansichten gleich im neuen Aussehen entstehen. Mitnehmen aus 7.4: Abschnitte am Ende langer Leisten werden übersehen (E-Book-Export ganz unten im Reiter „Geschichte“).

#### 7.6: Bildablage, Hochladen und Bilder an Kanon-Einträgen

- **Status:** ✅ ERLEDIGT (2026-10-13, vom Eigentümer bestätigt; begonnen 2026-10-12) – Erkundung `docs/research/bilder-erkundung.md`; entschieden (ADR-072): Ablage im Datenverzeichnis, fünf Teilschritte (7.6, 7.10–7.13). Mockup: Galerie je Eintrag (Wahl des Eigentümers, Nachtrag ADR-072). Umgesetzt und getrennt geprüft (2026-10-12, keine Befunde hoch/mittel), gemergt (PR #142). Eingespielt, vom Eigentümer am 2026-10-13 bestätigt.
- **Phasentyp-Kontext:** UMSETZUNG (mit Erkundung und Entscheidungsvorlage zu Beginn)
- **Abhängigkeiten:** 7.5
- **Freigabepflichtig:** ja – Ablage von Bilddateien (Kategorie 4, ggf. Architektur Kategorie 1), Hochladen fremder Dateien (Kategorie 6, Prüfung durch getrennte Instanz), ggf. Bilderzeugung (Kategorie 3)
- **Empfohlene Klasse:** Entscheidung – Datenmodell, Sicherheit und ggf. Architektur (Eskalations-Auslöser 1).
- **Eingangskriterien:** Erkundung der Ablage (Markdown-Dateien plus Bilder, Sicherung, Größen) und ADR
- **Anforderungen (ab Klasse M):** FR-035
- **Zu tun:** Bilder zu Figuren und Orten, Karten der Welt (Vision 5: „nicht in der ersten Version, aber nicht ausgeschlossen“).
- **Akzeptanzkriterien:** ADR; Tests; Prüfung durch eine getrennte Instanz; Sicherung erfasst die Bilder; Eigentümer bestätigt.
- **Betroffene Module:** storage, canon, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-12 (ADR-068), übernommen aus V.2.

#### 7.7: Pflege: Warnung von `npm ci` zu `fsevents` klären

- **Status:** ✅ ERLEDIGT (2026-10-12) – umgesetzt: `allowScripts: {"fsevents": false}` in `package.json` (geprüft und abgelehnt; laut npm-Doku zu `approve-scripts` gewinnen `false`-Einträge); auf frischem Worktree: `npm ci` ohne Warnung, `fsevents` lädt mit mitgelieferter Binärdatei, Build und vitest 217 grün. CI grün (PR #132)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** zu prüfen – Ausführen von Installationsskripten fremder Pakete erlauben wäre Kategorie 6; ausdrücklich nicht erlauben nicht
- **Empfohlene Klasse:** Routine – Konfiguration mit bekanntem Ergebnis; im Zweifel als Vorlage.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Seit npm 11 meldet `npm ci`: „2 packages have install scripts not yet covered by allowScripts: fsevents@2.3.3, fsevents@2.3.2“ (Fund aus der Onboarding-Prüfung in 6.10). `fsevents` bringt fertige Binärdateien mit; Bauen und Tests laufen ohne das Skript. Warnung beseitigen, ohne fremde Skripte unnötig zu erlauben.
- **Akzeptanzkriterien:** `npm ci` ohne Warnung; Onboarding-Pfad auf frischem Worktree grün (`package.json` ist Quick-Start-relevant).
- **Betroffene Module:** Build (package.json)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Konfiguration, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-12 in 6.10; zusammen mit 7.1.

#### 7.8: Planung der nächsten Ausbaustufe

- **Status:** ✅ ERLEDIGT (2026-10-13) – Bestätigungen des Eigentümers (7.6, 7.10–7.14, 7.16); 7.15 → V.33; Vision-Abgleich bestanden (FR-035 erledigt, keine verwaisten Elemente); Onboarding-Pfad auf frischem Worktree grün; Pflichtfrage mit getrennter Instanz: gezielt umbauen (ADR-080, `docs/research/bewertung-phase-7.md`); Phase 8 geplant (ADR-081): V.29 → 8.4, V.31 → 8.5, V.30 → 8.6, V.32 → 8.7, V.27 → 8.8, V.22 → 8.9, V.28 → 8.10, V.25 → 8.11, V.26 → 8.12 (Erkundung); V.20, V.21, V.23, V.24, V.33 weiter → 8.13
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 7.1–7.7
- **Freigabepflichtig:** ja – neue Phasen sind Replanning
- **Empfohlene Klasse:** Entscheidung – inhaltliche Neuplanung mit Vision-Abgleich.
- **Eingangskriterien:** Vision-Abgleich an der Phasengrenze nach Phase 7
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Die weiter verschobenen V-Schritte (V.20 und neue) und 7.15 in eine neue Phase überführen oder per ADR verwerfen.
- **Akzeptanzkriterien:** Jeder verschobene Schritt hat einen neuen Schritt mit ID oder `[VERWORFEN]` mit ADR.
- **Betroffene Module:** keine (Planung)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-12 (ADR-068); Landeplatz von V.20, V.21 und V.22.

#### 7.9: Befund: Gegenstands-Abschnitte aus dem Weltenbauer

- **Status:** ✅ ERLEDIGT (2026-10-12) – umgesetzt: Regel 5 im Markdown-Import (Zweck/Verwendung/Auswirkung auf der Ebene des Eintrags davor werden dessen Abschnitte, Unterabschnitte eingerückt), Beispiel im Format des Weltenbauers; Test mit der Form aus dem Bildschirmfoto; ein Test aus 4.16 an die neue Regel angepasst („Zweck“ unter einer Figur gehört jetzt zur Figur). pytest 566 grün. Eingespielt 2026-10-12 (`2d3a4f0`). Vom Eigentümer bestätigt 2026-10-12 („Der Weltenbauer funktioniert jetzt hundertprozentig“).
- **Phasentyp-Kontext:** UMSETZUNG (Fehlerbehebung)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein – Fehlerbehebung innerhalb von `canon` und `context`, keine Schnittstelle berührt
- **Empfohlene Klasse:** Routine – klar beschriebener Fehler mit bekannter Abhilfe.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-003, FR-029
- **Zu tun:** Befund des Eigentümers (2026-10-12, Bildschirmfoto): Der Weltenbauer schrieb einen Gegenstand mit `## Zweck`, `## Verwendung`, `## Auswirkung` auf derselben Ebene wie `## Name`; der Import machte daraus vier Einträge. 6.7 hatte nur den umgekehrten Fall (eine Ebene zu tief) abgefangen. Abhilfe: Überschriften „Zweck“, „Verwendung“, „Auswirkung“ beginnen nie einen eigenen Eintrag, sondern gehören zum Eintrag davor (Markdown-Import); Anweisung an die KI im Weltenbauer schärfen.
- **Akzeptanzkriterien:** Test mit genau dieser Form; Eigentümer bestätigt im Weltenbauer.
- **Betroffene Module:** canon, context
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-12; Eigentümer: „Erst 7.4, dann beheben“. Vorgeschlagene Sofort-Hilfe `###` statt `##` half beim Eigentümer nicht („auch 3 Rautezeichen bringen nichts“); Gegenprobe mit dem Parser: mit `###` vor allen drei Abschnitten ein Eintrag, bleibt einer auf `##`, entstehen wieder zusätzliche – Nachgestellt 2026-10-12 im Browser mit dem Stand ohne Korrektur: alle drei auf `###` → ein Eintrag; nur „Zweck“ auf `###` → drei Einträge. Wahrscheinliche Ursache: Das Import-Feld zeigt nur die ersten Zeilen, „Verwendung“ und „Auswirkung“ standen außer Sicht. Zweite Ergänzung des Eigentümers: Rautezeichen vor den drei Abschnitten ganz entfernt (nur die Überschrift des Gegenstands bleibt) führt zum gewünschten Ergebnis. Die Abhilfe soll unabhängig von der Ebene greifen; beim Beheben die echte Ausgabe des Weltenbauers nachstellen und klären, warum `###` beim Eigentümer nicht half.

#### 7.10: Karten der Welt

- **Status:** ✅ ERLEDIGT (2026-10-13, vom Eigentümer bestätigt; begonnen 2026-10-12) – entschieden (ADR-073): eigener Reiter „Karten“, bis 6.000 Pixel und 12 MB, Zoom mit `@panzoom/panzoom` 4.6.2, Karten im Kopf der Welt; Markierungen → 7.14. Mockup freigegeben („Passt, umbauen“); umgesetzt 2026-10-12. Getrennt geprüft (keine Befunde hoch/mittel, einer behoben); Pixelgrenze für iPhone vom Eigentümer bestätigt. Eingespielt, vom Eigentümer am 2026-10-13 bestätigt.
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage bzw. Mockup zu Beginn)
- **Abhängigkeiten:** 7.6
- **Freigabepflichtig:** ja – Datenmodell (Karten je Welt, Kategorie 4), neue Abhängigkeit (Kategorie 3), höhere Größengrenze (Kategorie 6, Prüfung durch getrennte Instanz); Mockup
- **Empfohlene Klasse:** Routine – baut auf der Ablage aus 7.6 auf; Vorlage nur, falls neue Fragen.
- **Eingangskriterien:** 7.6 erledigt
- **Anforderungen (ab Klasse M):** FR-035
- **Zu tun:** Eine oder mehrere Karten je Welt hochladen, groß ansehen und zoomen (auch am Handy).
- **Akzeptanzkriterien:** ADR-073; Tests; Mockup freigegeben; Prüfung durch eine getrennte Instanz; Eigentümer bestätigt.
- **Betroffene Module:** canon, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ggf. ADR
- **Notizen:** Angelegt 2026-10-12 aus dem Zuschnitt von 7.6 (ADR-072).

#### 7.11: Bilder in Geschichten

- **Status:** ✅ ERLEDIGT (2026-10-13, vom Eigentümer bestätigt; begonnen 2026-10-12) – entschieden (ADR-075): Titelbild im Ordner der Geschichte, JPEG, Umschlag im E-Book, Anzeige im Reiter „Geschichte“; Bilder im Manuskript → V.23. Mockup freigegeben; umgesetzt 2026-10-12. Getrennt geprüft (keine Befunde hoch/mittel, einer behoben). Eingespielt, vom Eigentümer am 2026-10-13 bestätigt.
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage bzw. Mockup zu Beginn)
- **Abhängigkeiten:** 7.6
- **Freigabepflichtig:** ja – Datenmodell (Titelbild je Geschichte, Kategorie 4); Mockup
- **Empfohlene Klasse:** Routine – baut auf 7.6 und 7.4 auf.
- **Eingangskriterien:** 7.6 erledigt
- **Anforderungen (ab Klasse M):** FR-035
- **Zu tun:** Titelbild je Geschichte, auch im E-Book (7.4). (Bilder im Manuskript: nicht hier, V.23.)
- **Akzeptanzkriterien:** ADR-075; Tests; E-Book mit Titelbild öffnet sich im Reader; Prüfung durch getrennte Instanz; Eigentümer bestätigt.
- **Betroffene Module:** manuscript, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ggf. ADR
- **Notizen:** Angelegt 2026-10-12 aus dem Zuschnitt von 7.6 (ADR-072).

#### 7.12: Bilder von der KI erzeugen

- **Status:** ✅ ERLEDIGT (2026-10-13, vom Eigentümer bestätigt; begonnen 2026-10-12) – entschieden (ADR-076, ADR-077): OpenRouter, „✨ Erzeugen“ neben „Hochladen“, Vorschau mit Kosten, Übernahme über den Upload-Weg, Filter fest im Code (FLUX Stufe 5, GPT Image „low“), Standard FLUX.2 Pro, Vorlage aus dem Kanon. Mockup freigegeben; umgesetzt 2026-10-12. Getrennt geprüft (keine Befunde hoch/mittel, vier kleine behoben). Eingespielt, vom Eigentümer am 2026-10-13 bestätigt.
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage bzw. Mockup zu Beginn)
- **Abhängigkeiten:** 7.6
- **Freigabepflichtig:** ja – Bildmodelle über OpenRouter (Kategorie 3), neuer Endpunkt (Kategorie 5); SVG nicht übernehmen
- **Empfohlene Klasse:** Entscheidung – neue externe Fähigkeit mit Kosten und Filtern (Eskalations-Auslöser 1).
- **Eingangskriterien:** 7.6 erledigt
- **Anforderungen (ab Klasse M):** FR-035
- **Zu tun:** Bild zu einem Eintrag, einer Karte oder einem Titelbild von einem Bildmodell erzeugen lassen; Modellwahl, Kosten vorher sichtbar, Übernahme erst nach Bestätigung.
- **Akzeptanzkriterien:** ADR; Tests; echte Probe in einer Cloud-Session; Eigentümer bestätigt.
- **Betroffene Module:** ai_gateway, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ggf. ADR
- **Notizen:** Angelegt 2026-10-12 aus dem Zuschnitt von 7.6 (ADR-072). Vorgabe des Eigentümers: pornografische Inhalte sind nicht geplant.

#### 7.13: Die KI kennt Bilder (zuschaltbar)

- **Status:** ✅ ERLEDIGT (2026-10-13, vom Eigentümer bestätigt; begonnen 2026-10-12) – entschieden (ADR-074): Bild nur auf Knopfdruck einmal an ein Modell mit Bildlesen, Ablauf wie Weltenbauer; Einträge → Abschnitt „Aussehen“, Karten → „Geografie – Name der Karte“ in der Weltbeschreibung; Mitschicken beim Schreiben → 7.15. Mockup freigegeben; umgesetzt 2026-10-12. Getrennt geprüft (keine Befunde hoch/mittel, einer behoben). Eingespielt, vom Eigentümer am 2026-10-13 bestätigt.
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage bzw. Mockup zu Beginn)
- **Abhängigkeiten:** 7.6, 7.10
- **Freigabepflichtig:** ja – Anfrage-Zusammenstellung und KI-Anbindung (Kategorie 1)
- **Empfohlene Klasse:** Entscheidung – Architektur der Anfrage (Eskalations-Auslöser 1).
- **Eingangskriterien:** 7.6 erledigt
- **Anforderungen (ab Klasse M):** FR-035
- **Zu tun:** Hauptweg (Wahl des Eigentümers 2026-10-12, „Einmal beschreiben“): „Von der KI beschreiben lassen“ an einem Bild oder einer Karte – die KI sieht das Bild genau einmal, schreibt eine Beschreibung (bei Karten: Lage, Entfernungen, Nachbarschaften), der Eigentümer prüft und übernimmt sie wie beim Weltenbauer als Kanon-Text; danach kennt die KI das Bild bei jeder Anfrage nur über diesen Text. Anwendungsfälle (Eigentümer): Karten → Geografie als Text; Figuren → äußere Erscheinung aus dem Bild als Vorschlag für einen Abschnitt „Aussehen“ im Figuren-Eintrag (bestehender Text bleibt, Übernahme nur nach Prüfung; Filter der Bildmodelle bei echten Proben prüfen). Ausnahme: je Anfrage zuschaltbar gehen Bilder der per `@` genannten Einträge als Bildteile an Modelle, die Bilder lesen; Kosten vorher sichtbar. Nie automatisch bei jeder Anfrage.
- **Akzeptanzkriterien:** ADR; Tests; echte Probe mit gemessenen Token je Bild; Eigentümer bestätigt.
- **Betroffene Module:** context, ai_gateway, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ggf. ADR
- **Notizen:** Angelegt 2026-10-12 aus dem Zuschnitt von 7.6 (ADR-072). Anlass der Wahl: Bilder bei jeder Eingabe mitzuschicken treibt die Kosten (Schätzung 1.000–3.000 Token je Bild bei rund 17.000 Token je Anfrage; in 7.13 messen); die Karte soll der Stimmigkeit dienen, nicht jede Anfrage verteuern.

#### 7.14: Markierungen auf Karten mit Verweis auf Kanon-Einträge

- **Status:** ✅ ERLEDIGT (2026-10-13, vom Eigentümer bestätigt; begonnen 2026-10-13) – entschieden (ADR-079): Markierungen an der Karte im Kopf von `world.md` (`marken`: Eintrag, x, y als Anteil), Setzen im Modus „Markieren“, nur Punkte (erster Tipp Name, zweiter öffnet den Eintrag), Löschen eines Eintrags entfernt seine Markierungen. Mockup (Vorher, Ansicht, Modus „Markieren“, Handy) freigegeben. Umgesetzt (2026-10-13): `MapMarker` und `set_map_markers` in `canon`, `delete_entry` entfernt Markierungen, `PUT …/maps/{datei}/markers`; Oberfläche `MapMarkers.tsx` und große Ansicht in `WorldMaps.tsx` (Kartenfläche in der Form des Bildes, misst bei Größenänderung neu; Punkte gleich groß bei jedem Zoom; Name am Rand zur Mitte hin). pytest 734, vitest 273, Playwright 11 grün; Sichtprobe Desktop und Handy an einem lokalen Testserver (Setzen, Ziehen, Entfernen, Tipp auf den Namen öffnet den Eintrag, Zoom). Keine Änderung der Kategorie 6 (keine Anmeldung, keine Dateien, keine Secrets) – keine getrennte Prüfung. Gemergt nach grüner CI (PR #151, `d54938b`). Eingespielt 2026-10-13 (Stand `27506c2`, vom Mac). Eingespielt, vom Eigentümer am 2026-10-13 bestätigt.
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage und Mockup zu Beginn)
- **Abhängigkeiten:** 7.10
- **Freigabepflichtig:** ja – Datenmodell (Markierungen je Karte, Kategorie 4); Mockup
- **Empfohlene Klasse:** Entscheidung – Datenmodell (Eskalations-Auslöser 1).
- **Eingangskriterien:** 7.10 erledigt
- **Anforderungen (ab Klasse M):** FR-035
- **Zu tun:** Auf einer Karte Punkte setzen, die zu einem Kanon-Eintrag führen (z. B. Punkt auf einem Ort → dessen Eintrag); setzen, verschieben, entfernen; ein Tipp öffnet den Eintrag.
- **Akzeptanzkriterien:** ADR; Tests; Mockup freigegeben; Eigentümer bestätigt.
- **Betroffene Module:** canon, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-12 aus der Vorlage zu 7.10 (Wahl des Eigentümers „Später als eigener Schritt“, ADR-073).

#### 7.15: Bilder beim Schreiben auf Knopfdruck mitschicken

- **Status:** ⏸️ VERSCHOBEN → V.33 (Eigentümer, 2026-10-13: in die nächste Ausbaustufe; Landeplatz 8.13)
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage zu Beginn)
- **Abhängigkeiten:** 7.13
- **Freigabepflichtig:** ja – Anfrage-Zusammenstellung (Kategorie 1)
- **Empfohlene Klasse:** Entscheidung – Architektur der Anfrage (Eskalations-Auslöser 1).
- **Eingangskriterien:** 7.13 erledigt; Eigentümer entscheidet nach den ersten Erfahrungen mit „einmal beschreiben“, ob er das Mitschicken noch braucht (sonst VERWORFEN mit ADR)
- **Anforderungen (ab Klasse M):** FR-035
- **Zu tun:** Je Anfrage zuschaltbar: Bilder der per `@` genannten Einträge gehen als Bildteile mit (nur bei Modellen mit Bildlesen), Kosten vorher sichtbar; nie automatisch.
- **Akzeptanzkriterien:** ADR; Tests; echte Probe mit gemessenen Token je Bild; Eigentümer bestätigt.
- **Betroffene Module:** context, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-12 aus der Vorlage zu 7.13 (ADR-074, Wahl des Eigentümers „Eigener Schritt 7.15“).

#### 7.16: Fester Abschnitt „Aussehen“ bei Figuren; Aussehen herauslösen

- **Status:** ✅ ERLEDIGT (2026-10-13, vom Eigentümer bestätigt; begonnen 2026-10-12) – entschieden (ADR-078); Mockup freigegeben; umgesetzt 2026-10-12. Eingespielt, vom Eigentümer am 2026-10-13 bestätigt.
- **Phasentyp-Kontext:** UMSETZUNG (mit Vorlage und Mockup)
- **Abhängigkeiten:** 7.12
- **Freigabepflichtig:** ja – Datenmodell-Konvention (Kategorie 4), neuer Ablauf und geänderte Anweisung des Weltenbauers (Kategorie 1)
- **Empfohlene Klasse:** Entscheidung – Datenmodell (Eskalations-Auslöser 1).
- **Eingangskriterien:** ADR-078
- **Anforderungen (ab Klasse M):** FR-035, FR-029
- **Zu tun:** Vorlage „## Aussehen“ für neue Figuren; Weltenbauer schreibt `### Aussehen`; Import hängt „Aussehen“ neben einer Figur an diese an; „✨ Aussehen herauslösen“ (Textmodell, Vorschlag prüfen und übernehmen); Bilderzeugung bei Figuren nur aus „Aussehen“.
- **Akzeptanzkriterien:** ADR-078; Tests; Mockup freigegeben; Anfragen beim Schreiben unverändert; Eigentümer bestätigt.
- **Betroffene Module:** canon, context, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-12 auf Wunsch des Eigentümers nach dem Einspielen von 7.12 (Bildbeschreibung enthielt Verhalten und Charakter). Ausdrücklich in Phase 7 übernommen („Jetzt, als neuer Schritt 7.16“).
