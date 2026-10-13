# Archiv – Logbuch Phase 7

<!-- Quelle: docs/logbuch.md. Ausgelagert am 2026-10-13 beim Phasen-Wechsel 7 → 8 (CLAUDE.md Abschnitt 14,
     Logbuch-Verdichtung). Abgedeckter Zeitraum: 2026-10-12 bis 2026-10-13. Neueste Einträge oben. -->

## Einträge (neueste oben)

### 2026-10-13 – [ONBOARDING-VALIDATION] Phasengrenze Phase 7 (7.8)

- Frischer Worktree von `main` (`f96aa16`) im Scratchpad: Quick Start der README genau wie dokumentiert (`uv python install`, `uv sync --frozen`, `npm ci`, `skriptorium-einrichtung`, `npx vite build`, `uvicorn`) → `/api/health` `{"status":"ok"}`; `scripts/session-start.sh` ohne Fehler. `npm ci` ohne Warnung. Keine Befunde; Worktree danach entfernt.
- Reibung: `session-start.sh` im Prüf-Worktree ruft `pre-commit install` auf und schreibt damit den **gemeinsamen** Hook `.git/hooks/pre-commit` auf die `.venv` des Worktrees um. Nach dem Entfernen des Worktrees scheiterte der nächste Commit („`pre-commit` not found“). Abhilfe: `uv run pre-commit install` im Haupt-Checkout. Für künftige Prüfungen: danach den Hook im Haupt-Checkout neu einrichten.

### 2026-10-13 – [BEOBACHTUNG] 7.8 begonnen; Bestätigungen; Vision-Abgleich

- Eigentümer bestätigt 7.6, 7.10, 7.11, 7.12, 7.13, 7.14, 7.16 als ausprobiert und funktionierend → erledigt. Antwort „Something else“ ohne Text mit angekreuzt – nachgefragt, als Bestätigung aller gewertet.
- 7.15 auf Wahl des Eigentümers verschoben → 7.8 (nächste Ausbaustufe). Phase 7: 14 von 16 erledigt, 7.8 in Arbeit.
- **Vision-Abgleich an der Phasengrenze** (gegen `docs/vision.md` und `docs/requirements.md`): alle Muss-Anforderungen erledigt (FR-006 verworfen, ADR-009); FR-035 von „teilweise“ auf erledigt (7.6, 7.10, 7.11, 7.14). Vision Abschnitt 5 „Publizieren, Bilder und Karten“: Satz und Export erledigt (7.4), Veröffentlichung → V.21, Bilder im Manuskript → V.23; Risiko „manuelle Kanon-Pflege“ (Vision 9) → V.22; alle `[VERSCHOBEN]`-Schritte (7.15, V.20–V.32) zeigen auf 7.8 und werden dort aufgelöst. Keine verwaisten Elemente.

### 2026-10-13 12:05 UTC – [BEOBACHTUNG] Eingespielt: Markierungen auf Karten (`27506c2`)

- Auf Anweisung des Eigentümers: Stand `main` `27506c2` (CI grün) nach Runbook Abschnitt 7 übertragen, gebaut, gestartet; Rückweg-Image `skriptorium:vorher` = `8296931`. `/api/health` 200 nach ca. 60 s (nur HTTPS abgefragt), danach eine SSH-Prüfung: `healthy`, `REVISION` `27506c2`.
- Entscheidungen des Eigentümers: Neustart des Servers „nicht nötig“ (2 Sicherheitsupdates und Neustart bleiben offen, kein Fahrplan-Schritt); V.29 nicht vorziehen, bleibt bei 7.8.

### 2026-10-13 11:58 UTC – [BEOBACHTUNG] Lage auf dem Server; Zählung für V.29

- **Erreichbarkeit:** `/api/health` 200 in 0,13 s, Startseite 200 (HTTPS). Eine gebündelte SSH-Abfrage, nur lesend.
- **Eingespielt:** `8296931` (Rückweg-Image `eb44949`), Container seit 13 Stunden `healthy`. `main` (`27506c2`, CI grün) ist weiter: 7.14 Markierungen auf Karten (PR #151) plus Doku – 7.14 ist noch nicht eingespielt.
- **Zählung (Eingangskriterium V.29):** 5 Welten, 133 Kanon-Einträge; Einträge mit mehr als einem Abschnitt „Aussehen“: 0; Welten mit doppelter Geografie einer Karte: 0 (bisher kein Abschnitt „Geografie“). Die Befunde B1–B3 aus D.18 sind damit Bauart-Risiken, in den echten Daten noch nicht eingetreten.
- **Host:** 36 Tage ohne Neustart, Platte 19 %, Speicher 2,1 von 7,8 GB belegt; **Neustart ausstehend** (`/var/run/reboot-required`), 2 Sicherheitsupdates noch nicht eingespielt. Proxy 3.7.13 und Duplicati laufen. Ein Neustart betrifft alle Dienste auf dem VPS – nur auf Entscheidung des Eigentümers.

### 2026-10-13 11:54 UTC – [SESSIONSTART] Bezug PR #154, Lage auf dem Server (Mac)

- **Modell:** eingestellt `claude-opus-5-5` (Sitzungsabfrage 11:54) → Entscheidungs-Klasse. Kurzzeitlimit 26 %, Wochenkontingent 43 % (Zurücksetzung 2026-10-18 10:00 MESZ).
- **Kontextgröße:** 167.091 Token laut Sitzungsabfrage nach der Pflichtlektüre (Grenze 200.000; Hinweise darauf nicht gewünscht).
- **Stand:** `main` auf `27506c2` (PR #154), Arbeitsverzeichnis sauber; Branch `docs/serverpruefung-2026-10-13`.
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2 (project-context; Logbuch ab dem `[SESSIONENDE]` 12:30; Fahrplan Stand, Übersicht, Phase 7 mit 7.14, D.18, V.29; Architektur 1/2/9; Decisions A/C; aktive Blocker: keine).
- **Vorhaben:** Lage auf dem Server nur lesend prüfen – eingespielter Stand gegenüber `main`, Container, Zählung doppelter Abschnitte (Eingangskriterium V.29 aus D.18). Kein Einspielen ohne Anweisung.

### 2026-10-13 12:30 UTC – [SESSIONENDE] D.18 erledigt

- **Dauer:** 11:45–12:30 UTC.
- **Bearbeitet:** D.18 – Prüfung der Datentrennung je KI-Bereich, Bericht, V.29–V.32; PR #154 (Wahl des Eigentümers „PR anlegen und mergen“), Merge nach grüner CI.
- **Erreichter Stand:** D.18 erledigt. Phase 7 unverändert: 7 von 16 erledigt; 7.6, 7.10–7.14, 7.16 warten auf Einspielen bzw. Bestätigung.
- **Offen:** Zählung doppelter Abschnitte auf dem Server (vom Mac, Eingangskriterium V.29); Einspielen von 7.14 (vom Mac); D.11 bis 2026-10-31.
- **Nächster Schritt:** Session auf dem Mac – „einspielen“ und Zählung; danach 7.15 (nur auf Wunsch) und 7.8 (mit V.29–V.32).
- **Modell-Bilanz:** aktive Klasse Entscheidung (`claude-opus-5-5`, eingestellt und bedient laut Sitzungsabfrage 11:47). Schritte oberhalb der Empfehlung: 0 (D.18 empfiehlt Entscheidung). Abgegeben: nichts – reine Lesearbeit, an die Routine-Klasse bei gleichem Cache-Lesepreis ohne Ersparnis.
- **Kontextgröße:** Sitzungsabfrage meldete 102.877 Token und wurde danach nicht mehr aktualisiert; geschätzt ca. 170.000 Token am Ende (unter der Grenze 200.000). Kurzzeitlimit `allowed`.
- **Sessionende-Prüfungen:** README synchronisiert (D.18 erledigt). Drift: keine neuen ADRs (Reaktiv-Quote unverändert 0/10); V.29–V.32 verweisen auf 7.8 (vorhanden); Modul-Liste und Reifegrade unverändert; Blocker 0; Phase 7 unverändert 16 Schritte (D.18 und V-Schritte außerhalb des Schrittplans). Ablaufdaten-Register: kein Vorlauf erreicht. Archiv-Trigger: Logbuch unter 800 Zeilen; Phase 7 nicht abgeschlossen. project-context 347 Zeilen, unverändert.

### 2026-10-13 12:20 UTC – [ERLEDIGT] D.18 Prüfung der Datentrennung je KI-Bereich

- Nur gelesen, kein Code geändert. Bericht `docs/research/datentrennung-ki-bereiche.md`: acht Bereiche mit Beleg (Datei, Zeile) und Testlage.
- **Sauber und getestet:** Trennung zwischen Welten, Geschichten und Gästen (Weiterschreiben, Szene); Bilder beschreiben schickt nur Bild, Name und Kategorie; Markierungen liegen im Kopf von `world.md` und gehen in keine Anfrage (nur durch Bauart); Weltenbauer-Gespräch je Welt neu (`WorldPage` mit `key`).
- **Mischung:** `withSection` hängt beim Übernehmen immer einen neuen Abschnitt an – zweimal beschriebene Karte → zwei „Geografie“-Abschnitte in jeder Anfrage; „Aussehen herauslösen“ an einer Figur mit Vorlage `## Aussehen` → zwei Abschnitte „Aussehen“. Probe mit einer Kopie von `imagePrompts.ts` (Node 24): Vorbelegung „Bild erzeugen“ wird dann nur „Kael“ bzw. „Kael: Kael ist Schmied … hasst seinen Bruder …“ – Wesen im Bildauftrag, was 7.16 verhindern sollte. Vorlagen für Orte, Gegenstände und Karten nehmen den Anfang des ganzen Texts.
- **Risiko:** Kurzfassung eines früheren Kapitels beim Neu-Erzeugen bekommt die ganze Gesamtzusammenfassung unter „Handlungsstand vor diesem Kapitel“; „Aussehen herauslösen“ prüft die Kategorie nur in der Oberfläche.
- **Nicht geprüft:** echte Daten auf dem Server (Cloud-Session ohne SSH, ADR-025) – ob doppelte Abschnitte dort schon vorkommen, ist offen; Zählung ist Eingangskriterium von V.29.
- Abhilfen als V.29–V.32 mit Landeplatz 7.8 (Phase 7 an der Wucherungs-Schwelle); NFR Kanon-Treue ohne Rückstufung, begründet im Bericht.
- Reibung: `cat -n` über mehrere Dateien zählt die Zeilen durchgehend – erste Zeilenangaben im Bericht waren für die zweite Datei jeder Ausgabe falsch; vor dem Commit per `grep -n` nachgezogen.

### 2026-10-13 11:45 UTC – [SESSIONSTART] D.18 Prüfauftrag Datentrennung (Cloud)

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 11:40) → Entscheidungs-Klasse; D.18 empfiehlt Entscheidung. Kurzzeitlimit (5 Stunden) `allowed`.
- **Kontextgröße:** 102.877 Token laut Sitzungsabfrage während der Pflichtlektüre (Grenze 200.000).
- **Stand:** `main` auf `9e8ea3a` (PR #153), Arbeitsverzeichnis sauber; Branch `docs/d.18-datentrennung`.
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2 (project-context; Logbuch ab dem `[SESSIONENDE]` 11:08; Fahrplan Stand, Übersicht, Phase 7, D.18; Architektur 1/2/9; Decisions A/C; aktive Blocker: keine).
- **Vorhaben:** D.18 – nur lesen, Bericht `docs/research/datentrennung-ki-bereiche.md`.

### 2026-10-13 11:35 UTC – [BEOBACHTUNG] Prüfauftrag D.18 angelegt

- Eigentümer nach dem Sessionende: Prüfauftrag zur Trennung der Daten je KI-Bereich. Kontext bei 406.222 Token – nach Rückfrage „Neue Session“. Auf die Frage, wie die neue Session davon erfährt: als Querschnitt-Schritt D.18 im Fahrplan und als nächster Schritt unter „Aktueller Stand“ (Pflichtlektüre); nicht in Phase 7 (Wucherungs-Schwelle).

### 2026-10-13 11:08 UTC – [SESSIONENDE] 7.14 umgesetzt und gemergt

- **Dauer:** 10:22–11:08 UTC.
- **Bearbeitet:** 7.14 – Vorlage (ADR-079), Mockup, Bau, Sichtprobe, PR #151 nach grüner CI gemergt (`d54938b`, Wahl des Eigentümers „PR anlegen und mergen“).
- **Erreichter Stand:** 7.14 auf `main`, nicht eingespielt. Phase 7: 7 von 16 erledigt; 7.6, 7.10–7.14, 7.16 warten auf Einspielen bzw. Bestätigung.
- **Offen:** Einspielen von 7.14 – nur vom Mac aus (diese Cloud-Session hat keinen SSH-Zugang, ADR-025); Bestätigung des Eigentümers für 7.6, 7.10–7.14, 7.16; D.11 bis 2026-10-31.
- **Nächster Schritt:** neue Session auf dem Mac – „einspielen“, dann Proben des Eigentümers; danach 7.15 (nur auf Wunsch) und 7.8.
- **Modell-Bilanz:** aktive Klasse Entscheidung (`claude-opus-5-5`, eingestellt und bedient laut Sitzungsabfrage 11:01). Schritte oberhalb der Empfehlung: 0 (7.14 empfiehlt Entscheidung). Abgegeben: nichts – Bau und Dokumente mit dem geladenen Kontext, eine Abgabe hätte ihn neu laden müssen.
- **Kontextgröße:** 204.266 Token laut Sitzungsabfrage 11:01 – über der Grenze 200.000 nach dem Bau; der laufende Schritt (PR, Mergen) wurde zu Ende geführt, kein neuer begonnen. Sitzungskosten der gesamten Cloud-Sitzung laut Abfrage ca. 132 $ (seit 2026-10-09). Kurzzeitlimit `allowed`.
- **Sessionende-Prüfungen:** README synchronisiert (Stand, Funktionen, Nächste Schritte). Drift: ADR-079 → 7.14 vorhanden; Teil A der Entscheidungen wieder vollständig (073–079); Reaktiv-Quote 0/10 über ADR-070..079; Modul-Liste unverändert; Reifegrade unverändert; Blocker 0; FR-035 nennt 7.14; Phase 7 unverändert 16 Schritte (Schwelle nicht überschritten). Ablaufdaten-Register: kein Vorlauf erreicht (D.1 ab 2026-11-05, D.5 ab 2026-11-12). Archiv-Trigger: Logbuch unter 800 Zeilen; Phase 7 nicht abgeschlossen. project-context 347 Zeilen, unverändert.

### 2026-10-13 11:00 UTC – [BEOBACHTUNG] 7.14 Markierungen auf Karten umgesetzt

- Mockup freigegeben („Passt, bauen“). Umgesetzt: `MapMarker(entry, x, y)` an `WorldMap`, `marken` im Kopf von `world.md` (4 Nachkommastellen), `set_map_markers` ersetzt die Liste (Eintrag muss existieren, je Karte einmal, höchstens 200, Lage 0–1, NaN/Unendlich/Wahrheitswerte abgelehnt); `delete_entry` entfernt die Punkte des Eintrags auf allen Karten; Umbenennen und Entfernen anderer Karten behalten die Punkte. Route `PUT …/maps/{datei}/markers`. Oberfläche: `MapMarkers.tsx` (Punkte, Namensschild, Suchliste) und `WorldMaps.tsx` (Modus „Markieren“, Leiste mit „Punkt entfernen“, „Anderer Eintrag“, „Fertig“); `WorldPage` öffnet den Eintrag über seine Adresse.
- Reibung: Panzoom hält das Herunterdrücken des Zeigers auf der Karte an (`stopPropagation`), React sah es nicht – Tipp-Erkennung im Capture-Teil (`onPointerDownCapture`). jsdom kennt `setPointerCapture` nicht – im Test ersetzt.
- Befund der Sichtprobe (lokaler Testserver, Chromium mit `executablePath`): Erscheinen Hinweis oder Suchliste, schrumpft die Kartenfläche, die Karte behielt aber ihre gemessene Größe und wurde abgeschnitten – neu gemessen über `ResizeObserver`. Am Handy ragte das Namensschild eines Punkts am linken Rand aus dem Bild – öffnet sich am Rand zur Mitte hin. Danach Desktop und Handy: Setzen (Lage genau 0,44/0,1 wie getippt), Ziehen, Tipp auf den Namen öffnet `#/welt/festland/kanon/karst`, Zoom mit gleich großen Punkten, keine Fehler in der Konsole.
- KI-Anfragen unverändert: `context` liest Karten nur für die Bildbeschreibung (Name und Datei), Punkte gehen nirgends mit.
- Prüfungen: pytest 734 (98,85 %; `canon/service.py` 98 %, neue Zeilen vollständig), vitest 273 (94,29 % Zeilen; `MapMarkers.tsx` 95 %, `WorldMaps.tsx` 86 % – Messen der Fläche braucht echtes Layout, im Browser geprüft), Playwright 11, ruff, mypy, bandit, eslint, tsc, prettier grün; `npm audit` 0. Sicherheitstest um die neue Route ergänzt (66 Routen, 63 geschützt). Keine Kategorie-6-Änderung – keine getrennte Prüfung.

### 2026-10-13 10:35 UTC – [ADR-ANGELEGT] ADR-079 Markierungen auf Karten (7.14)

- Auftrag „weiter mit 7.14“. Vorlage mit Auswahlfragen: „An der Karte“, „Knopf ‚Markieren‘“ (beide Empfehlung), „Nur Punkt“ (statt Punkt mit Namen). 7.14 auf IN ARBEIT; Mockup (Vorher, Ansicht, Modus „Markieren“, Handy) zur Freigabe vorgelegt.
- Drift beim Sessionstart behoben: Fahrplan-Übersicht führte 7.12 und 7.16 noch als „PR freigeben“, obwohl gemergt und eingespielt; Teil A in `docs/decisions.md` endete bei ADR-072 – Zeilen 073–078 nachgetragen.
- Reibung: Playwright fand den vorinstallierten Browser nicht (erwartet `chromium_headless_shell-1234`, vorhanden 1194) – für das Mockup-Foto `executablePath: /opt/pw-browsers/chromium`.

### 2026-10-13 10:22 UTC – [SESSIONSTART] Neue Session (Cloud)

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 10:22) → Entscheidungs-Klasse. Kurzzeitlimit (5 Stunden) `allowed`.
- **Kontextgröße:** 115.672 Token laut Sitzungsabfrage nach der Pflichtlektüre (Grenze 200.000).
- **Stand:** `main` auf `0c309ec` (PR #150) gezogen, Arbeitsverzeichnis sauber.
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2 (project-context; Logbuch ab dem letzten `[SESSIONENDE]` vom 2026-09-27 – danach nur Phasen-Reflexionen und Ereignis-Einträge, kein weiteres Sessionende; Fahrplan Stand, Übersicht und Phase 7; Architektur 1/2/9; Decisions A/C; aktive Blocker: keine).
- **Offen laut Fahrplan:** Bestätigung des Eigentümers für 7.6, 7.10–7.13 und 7.16 (eingespielt); 7.14, 7.15 (nur auf Wunsch), 7.8 Planung; Phase 7 mit 16 Schritten an der Wucherungs-Schwelle – neue Wünsche als V-Schritte. Querschnitt: D.11 bis 2026-10-31.
- **Vorhaben:** noch keins – Auftrag des Eigentümers abwarten.

### 2026-10-13 – [BEOBACHTUNG] Befund Zeitlinie: Jahr, Datum, Uhrzeit (V.28)

- Eigentümer: Zeitlinie soll Jahr, Datum und Uhrzeit unterscheiden, auch nur Uhrzeit oder Datum erlauben und im Verlauf zeigen, wo die Zeitstempel sind – „für später“. Als V.28 mit Landeplatz 7.8 festgehalten.

### 2026-10-13 – [BEOBACHTUNG] Befund Weltenbauer: Gespräch weg nach „Als Kanon übernehmen“ (V.27)

- Ursache: Übernahme navigiert in den Reiter „Import“, die Kanon-Seite samt Weltenbauer wird geschlossen, das Gespräch lag nur im Zustand der Komponente. Neuer Schritt 7.17 hätte die Wucherungs-Schwelle von Phase 7 überschritten (Neuplanung nötig); Eigentümer wählt „Als V.27 vormerken“ – in 7.8 als einer der ersten Schritte der nächsten Ausbaustufe vorschlagen.

### 2026-10-13 – [BEOBACHTUNG] Eindruck des Eigentümers; Idee „wandernde Figuren“ (V.26)

- Eigentümer: Die neuen Funktionen „funktionieren alle auch relativ gut“. Abhaken von 7.6–7.16 bewusst erst nach seinen Proben (Wahl „Noch nicht“).
- Grundsatzgedanke: Figuren sollen ohne Bezug auf eine Welt beschrieben sein, in andere Welten wandern können, dort realistisch eingepasst werden, und ihre Erlebnisse sollen in den Kern zurückwandern. Als V.26 festgehalten, nicht entschieden; Planung in 7.8 zusammen mit V.25.

### 2026-10-13 – [BEOBACHTUNG] Eingespielt: Abschnitt „Aussehen“ (`8296931`)

- PR #149 (V.25) auf „merge“ nach grüner CI gemergt (zwei Anläufe, Prüfungen liefen noch; automatisches Mergen bewusst nicht eingeschaltet, da nicht ausdrücklich verlangt).
- Auf Anweisung („einspielen“) `main` mit 7.16 eingespielt (Rückweg wie im Runbook). HTTPS `/api/health` 200 nach 60 s, neue Route ohne Anmeldung 401; eine SSH-Abfrage: `(healthy)`, `REVISION` `8296931`, keine Fehler im Protokoll. Offen: Probe des Eigentümers an einer echten Figur.

### 2026-10-12 – [BEOBACHTUNG] PR #148 gemergt; Idee „Verweise zwischen Kanon-Einträgen“ (V.25)

- PR #148 (7.16) auf „merge“ nach grüner CI gemergt, noch nicht eingespielt.
- Zwischenfrage des Eigentümers: Einträge, die auf andere verweisen (Regel nur an einem Ort; Weltenbauer verteilt Sachverhalte). Erklärt: alle Regeln gehen heute ohnehin immer mit (Vorrang 1), verknüpft wird nichts. Vorschlag `@`-Verweise im Kanon, eine Stufe tief, optional ortsgebundene Regeln. Eigentümer: „Als V-Schritt vormerken“ → V.25, Landeplatz 7.8.

### 2026-10-12 – [BEOBACHTUNG] 7.16 Abschnitt „Aussehen“ umgesetzt

- Mockup freigegeben. Umgesetzt: Vorlage „## Aussehen“ für neue Figuren; Weltenbauer-Regel `### Aussehen`; Import hängt „Aussehen“ an die Figur (auch als einzige Unterüberschrift); `context/appearance.py`, Ablauf und Route „Aussehen herauslösen“ (Temperatur 0,2, Antwort „KEIN AUSSEHEN“ ohne Angaben); `AppearanceExtract.tsx` mit Knopf nur bei Figuren ohne Aussehen; Bilderzeugung bei Figuren nur aus dem Aussehen, sonst Name plus Hinweis.
- KI-Anfragen: nur die des Weltenbauers geändert (gewollt), Schreiben und übrige byte-gleich zum Stand vor 7.6.
- Sichtprobe im Browser nicht möglich (Öffnen der lokalen Seite im Browser-Fenster abgelehnt); Abdeckung über Tests (vitest 267, pytest 706, Playwright 11). Keine Kategorie-6-Änderung (Eintragstext geht beim Schreiben ohnehin an den Anbieter) – keine getrennte Prüfung nötig.

### 2026-10-12 – [ADR-ANGELEGT] ADR-078 Abschnitt „Aussehen“ bei Figuren (7.16)

- Befund des Eigentümers nach dem Einspielen: Bildbeschreibung für Figuren enthielt Verhalten und Charakter. Ursache: Vorbelegung nimmt ohne Abschnitt/Zeile „Aussehen“ den Anfang des ganzen Eintrags. Eigentümer schlug selbst eine Trennung der äußeren Merkmale vor; gewählt: Abschnitt „Aussehen“, Knopf „Aussehen herauslösen“, sofort als 7.16. Phase 7 jetzt 16 Schritte (Schwelle erreicht). Import-Probe: `### Aussehen` unter dem Namen landet im Eintrag, `## Aussehen` daneben würde ein eigener Eintrag – wird mit angehängt.

### 2026-10-12 – [BEOBACHTUNG] Eingespielt: Bilder, Karten, Titelbild, Bilder erzeugen und beschreiben (`eb44949`)

- Auf Anweisung („einspielen“) `main` mit 7.6, 7.10, 7.11, 7.12, 7.13 eingespielt (Weg nach Runbook: `app.vorher` und `skriptorium:vorher` als Rückweg). HTTPS `/api/health` 200 nach 60 s, neues Bündel ausgeliefert, `/api/images/models` ohne Anmeldung 401; eine SSH-Abfrage: `(healthy)`, `REVISION` `eb44949`, keine Fehler im Protokoll der ersten Minuten.
- Offen: Ausprobieren durch den Eigentümer; echte Proben (Kosten je erzeugtem Bild und je Beschreibung, Filter bei den Figuren des Eigentümers, Umschlag im E-Book-Reader); Beleg, dass die nächtliche Sicherung `bilder/`, `karten/` und Titelbilder erfasst (nach dem ersten Bild und dem nächsten Sicherungslauf, Protokoll lesen mit Erlaubnis des Eigentümers).

### 2026-10-12 – [BEOBACHTUNG] 7.12 Bilder erzeugen umgesetzt

- Mockup freigegeben. Umgesetzt: `ai_gateway/images.py` (Bildanbieter-Schnittstelle, Katalog ohne Vektor-Modelle, Preise und durchreichbare Parameter je Anbieter, eine Stunde gemerkt), `openrouter_images.py` (Filter fest: FLUX 5, FLUX.3 4, GPT Image „low“; 502 = nicht fertig erzeugt, kostet nichts), `api/image_routes.py` (Modelle, Preis, Erzeugen; Prüfung des gelieferten Bildes am Dateikopf, Medientyp aus den Bytes), Oberfläche `ImageGenerate.tsx`, Vorbelegung `imagePrompts.ts`, Auswahl „Bild hochladen / ✨ Bild erzeugen“ in Galerie und Titelbild, „✨ Karte erzeugen“ im Karten-Formular.
- Reibung: Vorbelegung nahm bei den Figuren des Eigentümers den ganzen Eintrag, weil das Aussehen als Zeile „**Aussehen:** …“ steht, nicht als Abschnitt – Zeilen mit dieser Kennzeichnung werden jetzt erkannt. Zwei React-Regeln (setState im Effekt) mit gemerktem Preis je Modell und Startzeit gelöst. Mein Schein-Bildanbieter für die Sichtprobe hatte selbst einen Fehler („Interner Fehler“ im Test) – im Testskript behoben, nicht im Skriptorium.
- Sichtprobe mit Schein-Anbieter: Vorbelegung aus „Aussehen“, Preis „ca. 0,03 $ je Bild (1 Megapixel)“, Wartezeit, Vorschau mit Kosten, Übernahme in die Galerie (als WebP verkleinert). KI-Anfragen beim Schreiben byte-gleich.
- Prüfungen: pytest 698, vitest 264, Playwright 11, alle Werkzeuge grün. Echte Probe (Filter, Kosten) erst nach dem Einspielen oder in einer Cloud-Sitzung.
- Getrennte Instanz (Sonnet): keine Befunde hoch/mittel; behoben: Kosten NaN/Infinity verworfen, Modellkennungen nach Muster, leere Bildbeschreibung abgelehnt, FLUX.3-Erkennung (pytest 699). Rest in ADR-077.

### 2026-10-12 – [ADR-ANGELEGT] ADR-077 Bilder erzeugen (7.12)

- PR #146 (Erkundung) nach grüner CI gemergt. OpenRouter-Bildschnittstelle geprüft: `POST /api/v1/images`, 59 Modelle, Preise je Endpunkt, durchreichbare Filterparameter (`safety_tolerance` bei FLUX, `moderation` bei GPT Image). Eigentümer unterbrach die Vorlage mit der Frage „Filterkonfiguration oder hardcoded?“ – nach Erklärung „Fest im Code“; danach Vorlage freigegeben: FLUX.2 Pro Standard, Filter Stufe 5, Vorlage aus dem Kanon.

### 2026-10-12 – [ADR-ANGELEGT] ADR-076 Bilder vorerst über OpenRouter (7.12)

- Eigentümer nach der Erkundung (fal.ai, Replicate, Runware): „wir bleiben vorerst bei OpenRouter, weitere Anbieter in einer späteren Phase“. ADR-076; weitere Anbieter als V.24 mit Landeplatz 7.8; Erkundung umbenannt zu „Bildanbieter für 7.12“. Zweig umbenannt zu `docs/7.12-bildanbieter-erkundung` (Wunsch des Eigentümers, Namen nachziehen).
- Aufgeräumt (Freigabe des Eigentümers): 28 lokale und 72 entfernte Zweige gelöscht, alle per `merge-base --is-ancestor` als vollständig in `main` enthalten geprüft; darunter der lokale Zweig mit einem Geschichtentitel im Namen. Auf GitHub bleibt nur `main`. Erkundungsdatei umbenannt zu `docs/research/bildanbieter.md`.

### 2026-10-12 – [BEOBACHTUNG] 7.12: Erkundung fal.ai

- PR #145 (7.11) auf „merge“ nach grüner CI gemergt. Eigentümer zu 7.12: „vielleicht lässt sich fal.ai einbinden“; nach Vergleich mit OpenRouter Auftrag, erst Modelle und Filter-Schalter zu prüfen. Ergebnis in `docs/research/bildanbieter.md`: 203 aktive Text-zu-Bild-Modelle per API; 165 mit Schalter `enable_safety_checker` (meist an), 18 mit Stufe `safety_tolerance`, 7 standardmäßig aus, 20 ohne Schalter. Preise je Modell nur mit Schlüssel abrufbar. Entscheidung des Eigentümers steht aus.
- Nachträge: Abschalten der Prüfung bei fal meist nur mit Freischaltung des Kontos (Feldbeschreibung bei 138 Modellen); Pony V7; Anbieter-Überblick; Replicate im Detail. Eigentümer: „pornographische Inhalte sind nicht geplant“ – Filterfrage betrifft Fehlalarme bei düsteren Motiven; Replicate verbietet laut Bedingungen Folter- und Verstümmelungsmotive.
- Runware einbezogen (Wunsch des Eigentümers): britische Firma, Rechenzentren u. a. in Deutschland, keine Langzeitspeicherung der Ausgaben, kein Gore-Verbot für Erwachsene, Guthaben ohne Verfall, ca. 1.000 Bilder kostenlos zur Probe; Doku uneinheitlich (`checkContent`/`checkNSFW`), keine feste Preisliste.

### 2026-10-12 – [BEOBACHTUNG] 7.11 Titelbild umgesetzt

- Mockup (vorher/nachher, Titelbild oben im Reiter „Geschichte“ – Lehre aus 7.4) freigegeben. Umgesetzt: `Story.cover`, Ablage im Ordner der Geschichte, ein neues ersetzt das alte; drei Routen; `StoryCover.tsx`; `shrinkImage(…, asJpeg)` für Titelbilder; E-Book mit `cover-image`, `meta name="cover"`, Umschlagseite vor der Titelseite, Bild unkomprimiert im ZIP; ohne Titelbild unverändert (Test).
- Reibung: Parametername `jpeg` kollidierte mit einer Variablen gleichen Namens in `shrinkImage` (tsc) – umbenannt in `asJpeg`.
- Sichtprobe: 1.600×2.560-PNG → JPEG im Ordner der Geschichte, Anzeige im Reiter (dunkle Darstellung). Ein E-Book-Reader stand lokal nicht zur Prüfung bereit – Öffnen im Reader prüft der Eigentümer nach dem Einspielen; alle XML-Teile sind wohlgeformt (Test).
- Prüfungen: pytest 671, vitest 257, Playwright 11, alle Werkzeuge grün.
- Getrennte Instanz (Sonnet): keine Befunde hoch/mittel; behoben: fehlende Titelbild-Datei bricht den E-Book-Export nicht mehr ab (pytest 672).

### 2026-10-12 – [ADR-ANGELEGT] ADR-075 Titelbild der Geschichte (7.11)

- PR #144 (7.13) auf „merge“ nach grüner CI gemergt. 7.11: Eigentümer wählt „Nur Titelbild“, „Hochladen“, „In der Geschichte“; Vorlage freigegeben (JPEG wegen älterer Reader, Umschlag im E-Book). Bilder im Manuskript als V.23 mit Landeplatz 7.8 (Regel „Keine Verschiebung ohne Landeplatz“).

### 2026-10-12 – [BEOBACHTUNG] 7.13 Bilder einmal beschreiben umgesetzt

- Mockup (vorher/nachher) freigegeben. Umgesetzt: `ImagePart` an `Message`, Bildteil im OpenRouter-Adapter; `reads_images` im Katalog; Anweisungen in `context/describe.py` (Figur: Aussehen; andere Einträge: Erscheinung; Karte: Geografie mit Himmelsrichtungen, Beschriftungen genau übernehmen; „nur Sichtbares, nichts erfinden“; der Text des Eintrags geht bewusst nicht mit); Ablauf `flows/describe.py` (Temperatur 0,3, bis 1.500 Token aus); `stream_answer` aus dem Weltenbauer verallgemeinert; Oberfläche `ImageDescription.tsx` in den großen Ansichten von Bild und Karte.
- Sichtprobe mit Test-Anbieter: Grok 4.6 vorgewählt, rund 300 Modelle lesen Bilder → Auswahl gruppiert („Deine Favoriten“ zuerst); Bild wird kleiner, solange die Beschreibung offen ist.
- Reibung: die Stilregel `.entry-images button` aus 7.6 machte den Knopf „Übernehmen“ in der Galerie durchsichtig – auf die Bildknöpfe selbst eingegrenzt. Pfeiltasten im Beschreibungsfeld hätten Bilder umgeblättert, Escape die Ansicht geschlossen – Tasten in Feldern bleiben jetzt im Feld.
- KI-Anfragen beim Schreiben byte-gleich. Prüfungen: pytest 657, vitest 254, Playwright 11, alle Werkzeuge grün.
- Echte Probe (Kosten je Bild, Filter) steht aus: lokaler Schlüssel ungültig – nach dem Einspielen oder in einer Cloud-Sitzung.
- Getrennte Instanz (Sonnet, vorsorglich): keine Befunde hoch/mittel. Behoben: Übernahme lädt den aktuellen Stand vorher neu. Rest in ADR-074.

### 2026-10-12 – [ADR-ANGELEGT] ADR-074 Bilder einmal beschreiben lassen (7.13)

- PR #143 (7.10) nach grüner CI gemergt (Wahl „Nur hochladen und mergen“). Eigentümer wählt 7.13 als Nächstes (vor 7.11/7.12). Vorlage: Bildteile in `Message`, Ablauf wie Weltenbauer, nur Modelle mit Bildlesen – freigegeben; Karten-Text in die Weltbeschreibung; Mitschicken beim Schreiben als neuer Schritt 7.15. Phase 7 jetzt 15 Schritte. Echte Probe nur in Cloud-Sitzung oder nach dem Einspielen (lokaler Schlüssel ungültig).

### 2026-10-12 – [BEOBACHTUNG] 7.10 Karten der Welt umgesetzt

- Mockup (vorher/nachher, Reiter „Karten“) freigegeben. Umgesetzt: `karten` im Kopf von `world.md`, Ordner `karten/` (beim Bau statt `bilder/` gewählt, damit ein Eintrag „karte“ nie eine Karte als Bild führen kann – in ADR-073 vermerkt), vier Routen, `WorldMaps.tsx` mit Kacheln, Hinzufügen (Name aus dem Dateinamen vorbelegt), großer Ansicht mit `@panzoom/panzoom` (＋/−/⤢, Mausrad, zwei Finger), Umbenennen, Entfernen; höchstens 20 Karten je Welt.
- Befund: Safari auf iPhone/iPad zeichnet nichts auf Zeichenflächen über 16,7 Mio. Pixel. `scaledSize` hält Karten deshalb zusätzlich unter 16 Mio. Pixeln; Probe: 7.000×5.000-PNG → 4.732×3.380 WebP (54 KB). Folge: eine Karte 6.000×4.000 wird ca. 4.898×3.265 – dem Eigentümer zu sagen.
- Reibung: `@panzoom/panzoom` meldet `"type": "module"`, sein `main` ist eine UMD-Datei ohne Export unter Node – in vitest „default is not a function“. Build (nutzt `module`) unberührt; Test-Umleitung in `vite.config.ts`.
- Reibung: am Handy (375 px) rutschte der fünfte Reiter in eine zweite Zeile; Abstand der Reiter unter 30rem auf 0,75rem.
- Sichtprobe: Zoom bis Faktor 9, Verschieben, Ortsnamen gestochen scharf, Handy-Format. KI-Anfragen byte-gleich zum Stand vor 7.6.
- Prüfungen: pytest 643, vitest 248, Playwright 11, ruff, mypy, bandit, eslint, tsc, prettier grün; `npm audit` 0.
- Getrennte Instanz (Sonnet, nur Diff und Bedrohungsmodell): keine Befunde hoch/mittel. Behoben: Steuer- und Richtungszeichen im Kartennamen abgelehnt (pytest 646). Hingenommen bzw. optional: siehe ADR-073. Eigene Testläufe diesmal erst nach Ende der Prüfung (Lehre aus 7.6).
- Eigentümer zur Pixelgrenze: „So passt es, auf jedem Gerät.“

### 2026-10-12 – [ADR-ANGELEGT] ADR-073 Karten der Welt (7.10)

- Auswahlfragen: eigener Reiter „Karten“, bis 6.000 Pixel, Markierungen später (neu 7.14), fertige Bibliothek. Kandidaten aus der npm-Registry geprüft und auf Nachfrage in Alltagssprache erklärt; Wahl `@panzoom/panzoom` 4.6.2. Karten im Kopf von `world.md`, Grenze 12 MB. Phase 7 jetzt 14 Schritte. 7.6 steht zugleich noch auf IN ARBEIT, weil nur das Einspielen aussteht.

### 2026-10-12 – [BEOBACHTUNG] 7.6 gemergt; Richtung für 7.13 gewählt

- PR #142 nach grüner CI gemergt (Wahl „Nur hochladen und mergen“), noch nicht eingespielt. Korrektur: In einer Antwort davor stand fälschlich, 7.6 sei schon gemergt – dem Eigentümer richtiggestellt.
- Erklärt, wie Bilder abgelegt und Einträgen zugeordnet werden; Sicherung laut Runbook (ganzes `data/` ohne Index) – Beleg im Protokoll nach dem Einspielen und dem ersten echten Bild.
- 7.10 erklärt (Karten auf Weltebene, Zoom; offene Fragen: Ort in der Oberfläche, höhere Pixelgrenze für Karten, Markierungen als eigener Schritt).
- Eigentümer zu 7.13: Die KI soll Karten kennen, aber Bilder nicht bei jeder Eingabe mitschicken (Kosten). Gewählt: „Einmal beschreiben“ – KI beschreibt ein Bild einmal, Übernahme als Kanon-Text; direktes Mitschicken nur als Ausnahme auf Knopfdruck. In 7.13 eingetragen; ADR folgt beim Bau.
- Eigentümer ergänzt: Für Figuren soll die Beschreibung aus dem Bild das Aussehen liefern (Abschnitt „Aussehen“) – in 7.13 eingetragen.

### 2026-10-12 – [BEOBACHTUNG] 7.6 Bilder an Kanon-Einträgen umgesetzt; getrennte Prüfung

- Mockup erst mit einem Bild je Eintrag; Eigentümer: „Mehrere Bilder je Eintrag“. Zweites Mockup mit Galerie (Hauptbild, Vorschaubilder, große Ansicht mit Blättern, „Zum Hauptbild machen“, „Entfernen“) – „Passt, umbauen“. Nachtrag in ADR-072.
- Umgesetzt: Bildablage in `storage` (`images.py`: PNG/JPEG/WebP am Dateikopf, kein SVG, 5 MB, 4096 px; `write_image`/`read_image`/`delete_image`, atomar, nie überschreibend); Kopffeld `bilder` am Eintrag (höchstens 12, Namen an die Kennung gebunden); vier Routen; Galerie `EntryImages.tsx`; Verkleinern im Browser (`files.ts`, 2.000 px, WebP, sonst JPEG mit weißem Grund).
- Sichtprobe lokal mit Testdaten: 3.000×4.000-JPEG, 4.000×2.500-PNG (7,3 MB) und 1.200×1.200 hochgeladen → 1.500×2.000, 2.000×1.250, 1.200×1.200 als WebP (10–16 KB); Hauptbild-Wechsel, Escape schließt. Hintergrund der großen Ansicht danach dunkler (92 %), weil der Seitentext durchschien.
- KI-Anfragen unverändert: Vergleichsskript vor/nach (42 Anfragen) byte-gleich – Bilder gehen erst mit 7.13 an die KI.
- Getrennte Instanz (Sonnet, nur Diff und Bedrohungsmodell, 2026-10-12): keine Befunde hoch/mittel; Fuzz-Lauf 300.000 Köpfe ohne Absturz. Behoben: Namen an den Eintrag gebunden (Befund 3), Löschen trotz kaputter Liste (Befund 2). Hingenommen: verwaiste Datei bei gleichzeitigem Hochladen aus zwei Tabs (Befund 1). Optional, nicht umgesetzt: Größengrenze am Proxy, JSON-Prüfung ohne `Content-Length`.
- Reibung: Ein Testlauf mit Abdeckungsmessung zeigte 3 bzw. 12 Fehler (u. a. `TooManyRedirects` bei `/api/health`), während die Prüfinstanz gleichzeitig Tests im selben Repo ausführte; danach drei Läufe in Folge grün (621, dann 623). Kein Fehler im Code gefunden – Ursache vermutlich gleichzeitige Läufe; künftig Prüfinstanz und eigene Testläufe nicht überlappen lassen.
- Prüfungen: pytest 623, Abdeckung `storage/images.py` 90 %, `store.py` 98 %, `canon/service.py` 99 %, `canon_routes.py` 100 %; vitest 241 (`EntryImages.tsx` 87 %, `files.ts` 26 % – Canvas fehlt in jsdom, im Browser geprüft); Playwright 11; ruff, mypy, bandit, eslint, tsc, prettier grün.

### 2026-10-12 – [ERLEDIGT] 7.5 Aussehen „Buch“

- Eigentümer: „Sieht gut aus“ und nach der Korrektur „Der Cursor ist richtig ausgerichtet und der Text passt auch.“ Phase 7: 7 von 9 (offen 7.6, 7.8).

### 2026-10-12 – [BEOBACHTUNG] Eingespielt: Cursor und Beispieltext (`592deb0`)

- Auf Anweisung („einspielen“) PR #141 nach grüner CI gemergt; Baum identisch mit dem PR-Stand. HTTPS 200, Bündel mit neuem Beispieltext, eine SSH-Abfrage: `(healthy)`, `REVISION` `592deb0`. Offen: Bestätigung von 7.5 durch den Eigentümer.

### 2026-10-12 – [GELÖST] Cursor im Anweisungsfeld; Beispieltext

- Befund des Eigentümers nach dem Einspielen von „Buch“: Cursor im leeren Anweisungsfeld oberhalb und leicht außerhalb, Beispieltext zu speziell.
- Ursache: Das Feld nutzte den Cursor des Browsers; in einer leeren Zeile mit dem Beispieltext (Platzhalter von CodeMirror) setzt der Browser ihn an den Rand dieses Blocks. Weder Headless- noch sichtbares Chromium zeichnen den blinkenden Cursor ins Foto – deshalb über die Geometrie geprüft. Behoben mit `drawSelection()`: Cursor jetzt 0,6 px vor dem Beispieltext, mittig auf der Zeile, auch am Handy in Schwarz.
- Beispieltext nach Auswahl des Eigentümers: erklärt leer lassen und `@`.

### 2026-10-12 – [BEOBACHTUNG] Eingespielt: Aussehen „Buch“ (`07ff5f8`)

- Auf Anweisung („weiter“) PR #140 nach grüner CI gemergt; Baum identisch mit dem PR-Stand. HTTPS 200, Stil mit den neuen Regeln ausgeliefert, eine SSH-Abfrage: `(healthy)`, `REVISION` `07ff5f8`. Offen: Eindruck des Eigentümers im Alltag.

### 2026-10-12 – [BEOBACHTUNG] 7.5 Aussehen „Buch“ umgesetzt

- Ausgangsstand fotografiert; Befunde: Manuskript in Schreibmaschinenschrift (Vorgabe von CodeMirror), Knöpfe kaum unterscheidbar, Emojis als Symbole. Mockup mit drei Richtungen; Eigentümer wählte A, Buchschrift.
- Während des Baus von A: „Stopp“ – ein abgelehnter Werkzeugaufruf hatte seine Dateiänderungen schon geschrieben (Textknöpfe im Kapitel, A-Regeln); offen gemeldet, A-Regeln durch C ersetzt. Eigentümer: C „Buch – ruhig, wenig Rahmen“, Buchschrift.
- Umgesetzt mit eigenem CSS (keine Bibliothek): Papierfläche, Manuskript als Seite (Lesebreite ca. 35rem), Anweisung als Linie, Linien-Symbole (`Icons.tsx`), Beschriftung der Leiste am Desktop nur für Screenreader und als `title`, zurückgenommene Knöpfe, dunkle Hauptschaltfläche (auch „Anmelden“), Reiter unterstrichen.
- Reibung: neue Hover-Regel für Knöpfe überdeckte die Markierung des gewählten Kanon-Eintrags unter der Maus – mit `:where()` ohne eigene Gewichtung behoben.
- Prüfungen: vitest 233, Playwright 11, eslint, tsc, prettier grün; Sichtprobe Desktop hell/dunkel/schwarz, Handy, Anmeldung.

### 2026-10-12 – [ERLEDIGT] 7.4 E-Book

- Eigentümer: „gefunden, alles ok“. FR-034 erledigt. Ort des Abschnitts bleibt; Auffindbarkeit als Punkt für 7.5 vermerkt. Phase 7: 6 von 9 (offen 7.5, 7.6, 7.8).

### 2026-10-12 – [ERLEDIGT] 7.3 Schreibweise; Befund EPUB nicht auffindbar

- Eigentümer: „Das scheint bisher alles zu passen.“ 7.3 erledigt. Phase 7: 5 von 9.
- „Aber EPUB finde ich nicht“: Abschnitt steht ganz unten im Reiter „Geschichte“ der Leiste, unter einer langen Gesamtzusammenfassung – schlechte Platzwahl. Ort mit dem Eigentümer klären.

### 2026-10-12 – [ERLEDIGT] 7.2 Zeitstrahl

- Eigentümer nach dem Einspielen von `0fbc61b`: „Alles da“. FR-023 erledigt. Phase 7: 4 von 9.

### 2026-10-12 – [BEOBACHTUNG] Eingespielt: Zeitstrahl der Welt (`0fbc61b`); Verbrauch im Alltag

- Auf Anweisung („Einspielen“); CI auf `main` grün. HTTPS 200, Bündel mit „Zeitstrahl der Welt“, eine SSH-Abfrage: `(healthy)`, `REVISION` `0fbc61b`.
- Eigentümer meldet den Verbrauch des Monats: 16,03 $ für 457 Anfragen, 7.777.403 Token ein, 473.527 aus – im Mittel rund 17.000 Token Eingabe und 3,5 Cent je Anfrage. Gegen 125.000–140.000 Token je Anfrage mit TypingMind (Vision 2) etwa ein Siebtel bis Achtel; grob hochgerechnet ca. 120 $ bei gleichem Modell. Erfolgskriterium „günstiger pro Anfrage“ (Vision 4) im Alltag bestätigt.

### 2026-10-12 – [GELÖST] 7.2 Zeitstrahl passte nicht zur Form des Eigentümers

- Eigentümer: „Ich finde die Funktion nicht.“ Mit seiner Erlaubnis lesend auf der Produktion gezählt (nur Zahlen und Formen): vier Welten ohne Zeitlinie, eine Welt mit 12 Einträgen der Kategorie Zeitlinie, alle Namen „Zahl – Wörter“, Texte 6–15 Wörter, keine Listen; in einer Welt ein Regel-Eintrag mit Ereigniszeilen.
- Ursache: Vorlage und Umsetzung nur an der Testwelt (eine Liste in einem Eintrag) abgeleitet. Lehre: Bei Darstellungen bestehender Daten vor der Vorlage die echte Form zählen (mit Erlaubnis, nur Zahlen).
- Nachgesteuert (ADR-069, Mockup freigegeben): Zeitstrahl über alle Zeitlinien-Einträge der Welt; „+ Ereignis“ legt Einträge in seiner Form an; Listen-Einträge erscheinen dort als „N Ereignisse als Liste“. Sichtprobe Desktop/Handy (schwarz) an einer Kopie der Testwelt.

### 2026-10-12 – [ERLEDIGT] 7.9 Gegenstands-Abschnitte

- Eigentümer: „Der Weltenbauer funktioniert jetzt hundertprozentig und er ist einfach nur genial.“ Phase 7: 3 von 9.

### 2026-10-12 – [BEOBACHTUNG] Eingespielt: 7.1–7.4, 7.7, 7.9 (`2d3a4f0`)

- Auf Anweisung („einspielen“). CI auf `main` lief noch; Baum identisch mit dem grün geprüften PR-Stand #136 (`git diff` leer). Gewartet über HTTPS (200), Bündel mit neuen Teilen, EPUB-Endpunkt ohne Anmeldung 401, eine SSH-Abfrage: `(healthy)`, `REVISION` `2d3a4f0`.
- Offen: Proben des Eigentümers – 7.2 Zeitstrahl, 7.3 Schreibweise, 7.4 EPUB im Reader, 7.9 Gegenstand im Weltenbauer.

### 2026-10-12 – [GELÖST] 7.9 Gegenstands-Abschnitte aus dem Weltenbauer

- Ursache: Die Anweisung verlangte schon `### Zweck` usw.; grok-4.6 schrieb trotzdem `## Zweck` (Ebene des Eintrags). 6.7 hatte nur die zu tiefe Form abgefangen (`kanonBlock.ts`).
- Abhilfe im Import selbst (Regel 5 in `canon/importers/markdown.py`): Abschnitte Zweck/Verwendung/Auswirkung neben einem Eintrag werden dessen Abschnitte – gilt für Weltenbauer und Import von Hand. Dazu ein Beispiel im Format der Weltenbauer-Anweisung.
- Ein Test aus 4.16 erwartete „Zweck“ unter „Hauptfiguren“ als eigenen Eintrag; jetzt gehört er zur Figur davor – bewusste Änderung.
- Auf Bitte des Eigentümers („prüfen“) nachgestellt: Weltenbauer mit nachgebildeter fehlerhafter Antwort, Stand `main` ohne Korrektur, Ablauf über die Oberfläche. Übernommen → 4 Einträge; alle drei auf `###` → 1 Eintrag; nur „Zweck“ auf `###` → 3 Einträge. Wahrscheinliche Ursache: das Import-Feld zeigt nur die ersten Zeilen, „Verwendung“ und „Auswirkung“ lagen außer Sicht. Lehre: Sofort-Hilfen so formulieren, dass sie auch bei verdecktem Text greifen (z. B. „jede Zeile, die mit `## Zweck`, `## Verwendung` oder `## Auswirkung` beginnt“). Prüf-Worktree ohne `pre-commit install`.

### 2026-10-12 – [BEOBACHTUNG] 7.4 E-Book umgesetzt; Befund 7.9 aufgenommen

- Eigentümer: EPUB (nicht Word/PDF), alle Kapitel mit Wahl „nur abgeschlossene“, Veröffentlichung → V.21 (ADR-071); Mockup freigegeben.
- Während 7.4 meldete der Eigentümer einen Fehler im Weltenbauer: Gegenstand mit `## Zweck` usw. → vier Einträge. Als 7.9 angelegt („Erst 7.4, dann beheben“). Seine Ergänzungen: `###` half bei ihm nicht, ganz ohne Rautezeichen schon; Gegenprobe am Parser: mit `###` vor allen drei Abschnitten ein Eintrag – Ursache bei ihm offen, wird in 7.9 an echter Weltenbauer-Ausgabe geklärt.
- Umgesetzt: `manuscript/epub.py` (EPUB 3 plus `toc.ncx`, nur Standardbibliothek; Markdown → maskiertes XHTML; Steuerzeichen außerhalb XML entfernt), Endpunkt mit Autor im Inhalt statt in der Adresse, Abschnitt in der Leiste. Kein `epubcheck` (kein Java; neue Abhängigkeit vermieden) – Tests prüfen Aufbau, Abnahme im echten Reader. Test-EPUB der Testwelt an den Eigentümer geschickt.
- Reibung: ruff S314 für `xml.etree` in Tests – eine Hilfsfunktion mit begründeter Ausnahme statt fünf Unterdrückungen.
- Prüfungen: pytest 565 (99,85 %), vitest 229 (98,22 %), Playwright 11, ruff, mypy, bandit, eslint, tsc, prettier grün.

### 2026-10-12 – [BEOBACHTUNG] 7.3 Schreibweise folgt der Geschichte umgesetzt

- Befund vor der Vorlage: Kapitel ohne eigene Schreibweise folgten schon der Vorgabe (ADR-053); nur die Kopie beim Anlegen verhinderte das Mitziehen.
- `ManuscriptService` gegliedert (Befund 3, ADR-067) durch einen Unteragenten der Routine-Klasse; selbst geprüft: Anfragen bytegleich, keine privaten Importe zwischen den Teilen, 100 % Abdeckung.
- Eigentümer: A ganz oder gar nicht (ADR-070); Mockup der Hinweistexte freigegeben. Neue Kapitel ohne Kopie; Kapitel mit genau der alten Vorgabe folgen beim Ändern der Vorgabe – vorhandene Kopien auf dem Server lösen sich so ohne Skript auf.
- Reibung: neuer Test mit Tempo „schnell“ – nicht in der Liste (`langsam`, `gemessen`, `zügig`, `atemlos`); korrigiert.
- Prüfungen: pytest 561 (99,85 %, `manuscript` 100 %), vitest 226, Playwright 11, ruff, mypy, bandit, eslint, tsc, prettier grün.

### 2026-10-12 – [BEOBACHTUNG] 7.2 Zeitstrahl umgesetzt

- Vorlage nach Blick in die echte Testwelt: Zeitlinie ist ein Eintrag mit Liste „**Datum:** Ereignis“. Eigentümer: A (Zeitstrahl aus dem Text), nur Ansicht sortiert (ADR-069) – kein Datenmodell, keine Änderung der KI-Anfrage.
- Umgesetzt in `ui/src/timeline.ts` (Erkennen, Sortieren nach erster ganzer Zahl, Einfügen vor dem ersten späteren Ereignis) und `TimelineView.tsx`. Sichtprobe: Punkte zuerst links abgeschnitten, Platzhalter zu breit – Linie eingerückt, Datumsspalte verbreitert.
- Prüfungen: vitest 226 (98,24 / 95,67 / 97,26 / 98,51 %; `timeline.ts` Zeilen 100 %, Zweige 76 % durch Rückfälle für Regex-Gruppen), Playwright 11, eslint, tsc, prettier grün.

### 2026-10-12 – [ERLEDIGT] 7.1 Umbau und 7.7 Pflege

- PR #132 nach grüner CI gemergt (Eigentümer: „132 mergen“). Definition of Done erfüllt; kein Einspielen für die Abnahme nötig (keine sichtbare Änderung). Phase 7: 2 von 8.

### 2026-10-12 – [BEOBACHTUNG] 7.1 Umbau und 7.7 Pflege umgesetzt

- Zu Beginn gewarnt: 7.1 ist Routine, aktiv die Entscheidungs-Klasse; Umbau an zwei Unteragenten der Routine-Klasse (Sonnet) abgegeben, parallel an getrennten Dateien (`context` bzw. `ui`), ohne Commit-Recht. Ergebnisse selbst geprüft.
- Ausgangsstand vorher festgehalten: 42 KI-Anfragen der Testgeschichten (Skript im Scratch, inkl. Fehlerfälle wie zu kleines Budget), 15 Bildschirmfotos.
- Befund beim Pixelvergleich: die Kanon-Liste wich in 0,02 % der Pixel ab – der Unteragent hatte „{" "}· Aliasse“ zu einem Textstück zusammengezogen; Prettier tut das bei kürzeren Zeilen selbst. Wiederhergestellt mit getrennten Textstücken und Kommentar. Restabweichung nur am Rand der Scrollleiste im Weltenbauer (Zeitzufall).
- Monkeypatch-Verträglichkeit: Tests und Spikes ändern `CANON_SHARE` und `_filler_parts` in `builder.py`; beide bleiben dort, dazu Aliasse für fünf private Hilfen, die Tests und Spikes importieren.
- 7.7: `allowScripts` mit `fsevents: false` (npm-Doku `approve-scripts`/`install-scripts`, v11); im eigenen Worktree geprüft, ohne `pre-commit install` dort (Lehre aus 6.10).
- Prüfungen: pytest 560 (99,85 %), vitest 217 (98,18 / 96,10 / 97,17 / 98,46 %), Playwright 11, ruff, mypy, bandit, eslint, tsc, prettier grün.

### 2026-10-12 – [GELÖST] Pre-Commit-Hook nach der Onboarding-Prüfung verwaist

- Die Onboarding-Prüfung in 6.10 führt den Quick Start in einem frischen Worktree aus, darunter `uv run pre-commit install`. Worktrees teilen `.git/hooks`; der Hook zeigte danach auf die Python-Umgebung des Prüf-Worktrees. Nach dessen Entfernen scheiterte jeder Commit mit „`pre-commit` not found“ – zuerst unbemerkt, weil die Ausgabe nach „fail“ gefiltert war.
- Behoben mit `uv run pre-commit install` im Hauptverzeichnis. Lehre: nach jeder Onboarding-Prüfung im Worktree den Hook im Hauptverzeichnis neu installieren und den Commit an `git log` prüfen, nicht an gefilterter Ausgabe.
