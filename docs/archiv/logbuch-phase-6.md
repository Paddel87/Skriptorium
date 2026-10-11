# Archiv – Logbuch Phase 6

<!-- Quelle: docs/logbuch.md. Ausgelagert am 2026-10-12 beim Phasen-Wechsel 6 → 7 (CLAUDE.md Abschnitt 14,
     Logbuch-Verdichtung). Abgedeckter Zeitraum: 2026-10-11 bis 2026-10-12. Neueste Einträge oben. -->

## Einträge (neueste oben)

### 2026-10-12 – [ERLEDIGT] 6.9 Export nach SillyTavern

- Eigentümer nach Probe in SillyTavern: „6.9 funktioniert.“ FR-030 damit erledigt. Phase 6: 13 von 14, offen nur 6.10.

### 2026-10-12 – [ERLEDIGT] 6.8 Import aus SillyTavern

- Probe des Eigentümers auf der Produktion: echte Figurenkarte (V2) importiert – „Charakter importieren geht gut. Anscheinend gibt es eine sogenannte V2-Version. Hat geklappt.“ Damit alle Akzeptanzkriterien erfüllt (ADR, Tests mit Beispieldateien nach dem Export-Code von SillyTavern, Prüfung durch getrennte Instanz, Probe).
- Eigentümer merkt an: Figuren im Internet zu suchen ist schwierig, man landet auf Bezahlseiten; „das Thema können wir nochmal später aufgreifen“ → V.20 mit Landeplatz 6.10.

### 2026-10-12 – [ERLEDIGT] 6.14 Darstellung „Schwarz“

- Eigentümer am Gerät: „6.14 passt, Schwarz sieht gut aus.“ Alle Punkte der Definition of Done erfüllt (Tests, Sichtprobe, Einspielen, Bestätigung).

### 2026-10-12 – [BEOBACHTUNG] Eingespielt: 6.8, 6.9, 6.14 (`ef9a3fe`)

- Auf Anweisung („Hochladen, mergen, einspielen“, dann „130 auch mergen“) PR #130 nach grüner CI gemergt und `ef9a3fe` eingespielt. CI auf `main` lief noch nicht; Baum identisch mit dem grün geprüften PR-Stand (`git diff` leer).
- Gewartet nur über HTTPS (Gesundheitsprüfung 200), ausgeliefertes Bündel und Stil mit den neuen Teilen geprüft, danach eine einzelne SSH-Abfrage: `(healthy)`, `REVISION` `ef9a3fe` – keine SSH-Sperre diesmal. Neue Endpunkte antworten ohne Anmeldung mit 401.
- Offen: Proben des Eigentümers – 6.8 (Datei aus SillyTavern importieren), 6.9 (Lorebook/Karte in SillyTavern importieren), 6.14 (Schwarz am Gerät).

### 2026-10-12 – [BEOBACHTUNG] 6.14 Darstellung „Schwarz“ (AMOLED) umgesetzt; PR #129 gemergt

- Wunsch des Eigentümers („kurzfristig einen AMOLED-tauglichen Dark Mode“). Mockup zuerst mit „Dunkel“ neben „Schwarz“; Eigentümer: „Schriftfarbe ebenfalls anpassen“ → zweites Mockup mit drei Schriftfarben, gewählt C „gedämpft warm“ (#b8b2a6) als zusätzliche Stufe.
- Regel aus ADR-060 („neue Wünsche während der Phase werden V-Schritte mit Landeplatz 6.10“) erst beim Eintragen bemerkt – Mockups waren da schon gezeigt. Dem Eigentümer vorgelegt: „Jetzt als 6.14“ als bewusste Ausnahme. Lehre: die Phasenregeln vor dem ersten Mockup prüfen, nicht erst beim Fahrplan-Eintrag.
- Umgesetzt: `theme.ts` (Stufe `schwarz` → `data-theme="black"`, eigenes `theme-color`-Meta mit Vorrang, beim Wechsel entfernt), Farbvariablen in `styles.css`; keine fest eingetragenen Farben außerhalb der Variablen. vitest 217, Playwright 11 grün; Sichtprobe Desktop/Handy: Hintergrund `rgb(0, 0, 0)`.
- PR #129 (6.9) auf Wunsch des Eigentümers gemergt (CI grün); 6.14 setzt auf diesem Stand auf.

### 2026-10-11 – [BEOBACHTUNG] 6.9 Export nach SillyTavern umgesetzt

- ADR-066 nach Auswahlfragen (Welt als Lorebook + Figur als Karte; Karte ohne eingebettetes Lorebook; JSON). Eingangskriterium „6.8 erledigt“ formal offen (Probe des Eigentümers), Zuordnung steht – im ADR vermerkt.
- Beim Bau gefunden: Gegenstände aus der Oberfläche haben „## Zweck“ (Ebene 2); der pauschale Versatz um zwei Ebenen im Import aus 6.8 hätte beim Rückimport „#### Zweck“ ergeben. Umgestellt auf „nur so weit wie nötig“ (oberste Überschrift auf Ebene 3); Export gibt den Text unverändert aus. ADR-066 entsprechend ergänzt.
- Rückimport-Test über den echten Service mit allen sechs Kategorien, Aliassen, Code-Block und Gegenstand ohne Text: gleicher Kanon bis auf die bewusste Angleichung Ebene 2 → 3. Im Browser (Prüfserver mit Kopie der Testdaten): Lorebook (30 Einträge) und Karte heruntergeladen und über die Import-Seite wieder eingelesen, alle als „existiert schon“ erkannt.
- Prüfungen: pytest 560 (99 %, SillyTavern-Modul 100 %), ruff, mypy, bandit grün; vitest 216, Playwright 11 grün.
- Reibung: zwei Testerwartungen falsch (Reihenfolge nach Namen, abschließender Zeilenumbruch je nach Anlage) – Tests angepasst, Code unverändert.
- Getrennte Instanz (dieselbe Sonnet-Prüfinstanz wie 6.8, nur Diff) zur geänderten Überschriften-Verschiebung und zur Kategorie-Erweiterung: „freigeben“, kein Befund; ca. 175.000 Zufallsläufe ohne Ausbruch aus dem Eintrag, Dateiname im Download-Kopf nur aus geprüften Kennungen.

### 2026-10-11 – [GELÖST] CI rot bei PR #128: tief verschachteltes JSON je nach Plattform

- Test mit 100.000 verschachtelten Klammern erwartete „kein lesbares JSON“; auf Linux (CI, Python 3.14.7) liest `json` die Liste vollständig ein, die Datei wird dann als „Keine Figurenkarte“ abgelehnt. Abgelehnt ohne Inhalt in beiden Fällen; Test lässt beide Meldungen zu (Commit `c446b52`). Das Kurzprotokoll der CI (`--log-failed`) brach genau am Fehler ab; erst das vollständige Protokoll über die API zeigte die Meldung.

### 2026-10-11 – [BEOBACHTUNG] 6.8 Import aus SillyTavern umgesetzt und unabhängig geprüft

- ADR-065 nach Auswahlfragen (Weg A, Beschreibung und Persönlichkeit, Schlüsselwörter als Aliasse, `{{char}}` ersetzen / `{{user}}` melden); Mockup freigegeben.
- Formate zuerst aus Spezifikation V2/V3 und dem Lorebook-Quelltext von SillyTavern; auf Hinweis des Eigentümers („aus erster Hand“) zusätzlich der Export-Code der Karten gelesen (`charaFormatData`, `convertWorldInfoToCharacterBook`, `character-card-parser.write`): Lorebook einer Karte mit `comment`/`enabled`, Bild mit `chara` **und** `ccv3`. Testdateien folgen diesem Aufbau. Lehre: bei Fremdformaten den schreibenden Code des Herstellers lesen, nicht nur die Spezifikation.
- Umgesetzt: `canon.importers.sillytavern` (nur Standardbibliothek), `POST /api/worlds/{id}/import/sillytavern`, ein Dateifeld der Import-Seite; Sichtprobe Desktop/Handy mit einer Karte als PNG auf einer Kopie der Testdaten: 3 Einträge angelegt.
- **Getrennte Instanz** (Unteragent mit Sonnet, nur Diff und Bedrohungsmodell): „freigeben nach Behebung“. (1) mittel: Überschriften-Muster im Markdown-Import mit kubischem Zurückgehen (1.000 Tabs ≈ 1 s, 2.000 ≈ 8 s) – bestand schon vorher, über Dateien leichter erreichbar; ersetzt durch Anfang-Muster plus `rstrip`, 200.000 Zufallszeilen ohne Abweichung, 50.000 Leerzeichen in Millisekunden. (2) mittel/niedrig: Name ohne Buchstaben (z. B. japanische Schrift) ließ die Vorschau mit dem Namen in der Meldung scheitern – jetzt „Eintrag N“ mit Hinweis. (3) niedrig: Feldzeilen in Code-Blöcken – jetzt geschützt. (4) niedrig: Einträge wurden zur Gruppe (Text beginnt mit Überschrift, Figur „Orte“) – unsichtbare erste Zeile, Namenszusatz. Nachprüfung: alles behoben bis auf eine Umgehung mit führenden Leerzeilen – behoben. Optional, nicht umgesetzt (über dem Niveau): Größenprüfung schon im Browser; Name in der Meldung „hat keine Kategorie“ beim Übernehmen kürzen.
- Prüfungen: pytest 553 grün (99 %, beide Importer 100 %), ruff, mypy, bandit ohne Befund; vitest 215 grün (98,14 %), Playwright 11 grün.
- Reibung: Commit scheiterte einmal an prettier, weil die neuen JSON-Testdateien mitgeprüft werden; formatiert.

### 2026-10-11 – [ERLEDIGT] 6.3 Technik-Prüfung an der Geschichte des Eigentümers

- Auf Freigabe des Eigentümers („Prüfung erlauben“) ein lesendes Skript per `docker exec` auf der Produktion: Anfrage je Kapitel ab 1.500 Wörtern mit der Anweisung „Weiter.“ ohne `@`, einmal mit `CANON_SHARE` 0,3, einmal mit 0 (Verhalten vor 6.3). Ausgabe nur Zahlen; Skript vorher auf Testdaten erprobt, nicht im Repo.
- Geschichte des Eigentümers (6 Kapitel mit je 8.500–9.800 Wörtern): In den Kapiteln 1–6 gingen vorher 28, 6, 2, 0, 0, 1 der 34 nicht genannten Einträge mit; jetzt jeweils alle 34 (5.564 Token). Die Anfrage bleibt gleich groß (29.650–29.850 Token); die letzten Seiten treten 670–5.700 Token ab (z. B. Kapitel 4: 22.893 → 17.338).
- Andere Geschichten mit langen Kapiteln (drei, je ein Kapitel): unverändert, der Kanon passte schon vorher ganz hinein.
- 6.3 erledigt (Bestätigung des Eigentümers im Alltag plus diese Prüfung).

### 2026-10-11 – [BEOBACHTUNG] Abnahme nach dem Einspielen: 6.1, 6.2, 6.5, 6.7 erledigt

- Checkliste für den Eigentümer erstellt (je Schritt: wo klicken, woran erkennbar). Eigentümer: „6.1 kann abgehakt werden. Der Rest auch.“ → 6.1, 6.2, 6.7 bestätigt, 6.5 (Datenschutz im OpenRouter-Konto) gesetzt und bestätigt; 6.3 im Alltag bestätigt.
- 6.3 Technik-Prüfung (Anfrage je langem Kapitel mit `CANON_SHARE` 0,3 gegen 0, nur Zahlen) per `docker exec` auf der Produktion vom Freigabe-Klassifikator der Laufzeitumgebung blockiert („Production Reads“). Dem Eigentümer zur Entscheidung vorgelegt.

### 2026-10-11 – [GELÖST] Eingespielt: `@`-Menü im Weltenbauer (`5141d53`); SSH-Sperre durch eigene Warteschleife

- Auf Anweisung („Hochladen, mergen, einspielen“, dann „merge“) PR #126 nach grüner CI gemergt und `5141d53` eingespielt. CI auf `main` lief noch; Baum identisch mit dem grün geprüften PR-Stand (`git diff` leer) – deshalb nicht abgewartet.
- Reibung: Meine Warteschleife fragte den Zustand alle 5 s per SSH ab; der Server wies ab dem zweiten Versuch alle Verbindungen ab („Connection refused“, vermutlich Begrenzung der Firewall). Stand stattdessen über HTTPS geprüft (Gesundheitsprüfung 200, CSP voll, ausgeliefertes Bündel mit neuem Feld), danach eine einzelne SSH-Prüfung: `(healthy)`, `REVISION` `5141d53`.
- Lehre (stand schon im Runbook-Ablauf, nicht befolgt): auf `healthy` über HTTPS warten, nur **eine** SSH-Prüfung danach.

### 2026-10-11 – [GELÖST] 6.7 Weltenbauer ohne `@`-Menü

- Eigentümer nach dem Einspielen: Beim Weltenbauer werden nach `@` keine Einträge vorgeschlagen. Ursache: Das Eingabefeld war ein einfaches Textfeld; der Platzhalter versprach „Mit @ einen Eintrag nennen“, die Erkennung der `@`-Namen beim Senden lief, aber ohne Menü. Weder meine Sichtprobe noch die echte Probe tippten `@` selbst ein (die Prüfskripte füllten den Text am Stück).
- Behoben: Der Weltenbauer nutzt jetzt `InstructionEditor` wie das Kapitel (Menü mit Namen und Aliassen, Markierung erkannter Namen). Neuer Test „offers the entries of the world after @“; Sichtprobe in Chromium (Desktop, Handy): „@Gu“ bietet Gunda, Gunda Hollt, Gundas Schänke an, Enter setzt `@Gunda`, markiert.
- Prüfungen: eslint, prettier, tsc grün; vitest 212 (98,18 / 96,06 / 97,09 / 98,46 %, `WorldBuilder.tsx` 100 % Zeilen); Playwright 11 grün.
- Lehre: In Sichtproben Eingaben mit Sonderfunktion (`@`) Zeichen für Zeichen tippen, nicht einfügen.

### 2026-10-11 – [GELÖST] Eingespielt: 6.1–6.4, 6.6, 6.7; Traefik überschrieb die CSP

- Auf Anweisung des Eigentümers („Einspielen“) Stand `main` `5f1fa10` nach grüner CI eingespielt (Runbook Abschnitt 7): `skriptorium:vorher` getaggt, `app.vorher` angelegt, Build, `(healthy)` nach ca. einer Minute, `/api/health` 200.
- Prüfung von außen: `cache-control: no-store` an `/api/` (6.4) ✓; 422 nennt nur `loc` und `msg`, keinen eingegebenen Wert (6.6) ✓. **Befund:** Die Content-Security-Policy kam draußen nur als `frame-ancestors 'none'` an, im Container voll – ein Traefik-Label (`skriptorium-headers`) in `/opt/docker/skriptorium/compose.yml` (nicht im Repo) überschrieb sie. Eigentümer per Auswahlfrage (Kategorie 7): Label entfernen. Beide Zeilen (Middleware und Verweis des Routers) entfernt, Kopie `compose.yml.vor-csp` auf dem Server, `docker compose up -d`. Danach volle Regel von außen bestätigt; Anmeldeseite in Chromium ohne CSP-Meldung (einzige Konsolenmeldung: erwartete 401 vor der Anmeldung).
- Nebenbefund ohne Handlungsbedarf: `HEAD /api/health` liefert 404 (FastAPI beantwortet nur GET); die Überwachung nutzt GET.
- Lehre: Kopfzeilen aus der App immer auch von außen prüfen – der Proxy kann sie ersetzen. Die unabhängige Prüfung von 6.6 sah nur den Code.
- Offen: 6.3 Technik-Prüfung an der Geschichte des Eigentümers; Prüfung von 6.1, 6.2, 6.3, 6.7 durch den Eigentümer; 6.5 im OpenRouter-Konto.

### 2026-10-11 – [SESSIONENDE] 6.7 echte Probe und Behebung der Befunde

- **Bearbeitet:** 6.7 – echte Probe in der Cloud-Session (#123), vier Befunde behoben (#124), beide gemergt nach grüner CI (`main` `654edd4`).
- **Offen:** 6.7 Einspielen (nur vom Mac aus, ADR-025) und Bestätigung des Eigentümers; 6.1 und 6.2 Prüfung durch den Eigentümer; D.11 bis 2026-10-31.
- **Modell-Bilanz:** Entscheidungs-Klasse (`claude-opus-5-5`, Sitzungsabfrage); 6.7 empfiehlt Entscheidung, die Behebung war Routine-Niveau – 1 Schritt oberhalb der Empfehlung, nicht abgegeben (kleine Änderung im bereits geladenen Kontext); keine Warnung zu Beginn gegeben.
- **Kontextgröße:** ca. 420.000 Token am Ende, mehr als das Doppelte der Grenze 200.000; jeweils auf ausdrückliche Anweisung des Eigentümers („hier“, „Weiter hier“).
- **Sessionende-Prüfungen:** README ohne Drift (Phase und Status unverändert; 6.7 noch nicht erledigt); keine neuen ADRs, Reifegrade oder Blocker; Ablaufdaten-Register ohne erreichten Vorlauf (nächstes D.1 ab 2026-11-05).

### 2026-10-11 – [GELÖST] Befunde aus der echten Probe von 6.7 behoben

- Nur Oberfläche, keine Schnittstelle geändert: (1) Kästchen „mit Websuche“ nennt den Aufschlag aus dem Eingabepreis des gewählten Modells (22.000 Token mehr Eingabe plus 1 ct, `ui/src/models.ts`; bei Grok 4.6 „ca. +5,4 ct“; ohne Preis „teurer, Preis unbekannt“) statt fest „ca. 1 ct“. (2) Fundstellen ohne echten Titel als „[1] host“ (`ui/src/citations.ts`). (3) Verweise `[[1]](…)` im Text als „[1]“, im übernommenen Vorschlag entfernt.
- **Vierter Befund bei der Nachprobe:** grok-4.6 setzte einmal den Vorschlag eine Ebene zu tief (`## Gegenstände`, `### Pfannhaus-Glocke`, `### Zweck`) – der Import machte daraus zwei Einträge („Zweck“ als eigener Gegenstand). Behoben in `ui/src/kanonBlock.ts`: ohne Überschrift der Ebene 1, aber mit einer Gruppe auf Ebene 2 wird jede Überschrift eine Ebene angehoben; Einträge ohne Gruppe bleiben unverändert.
- Nachprobe mit echtem Schlüssel und Websuche (7,0 ct, 24.058 Token ein): Text ohne rohe Verweise, Fundstellen „[1] en.wikipedia.org · [2] de.wikipedia.org · [3] mittelalter-lexikon.de“, Übernahme ohne Verweise. Messwerte der Websuche jetzt 17.100–22.400 Token mehr Eingabe (drei Antworten). Beim ersten Öffnen direkt nach dem Serverstart war der Katalog noch nicht geladen – das Kästchen zeigte dann „Preis unbekannt“, Sekunden später den Aufschlag.
- Prüfungen: tsc, eslint, prettier grün; vitest 211 (gesamt 98,17 / 96,06 / 97,09 / 98,46 %, neue Datei `citations.ts` 100 % Zeilen); Playwright 11 grün. Python unverändert.

### 2026-10-11 – [BEOBACHTUNG] 6.7 echte Probe in der Cloud-Session

- Auf Anweisung des Eigentümers („6.7 testest du hier einmal in der Cloud-Umgebung“). Fortgesetzte Session weit über der Kontextgrenze (dem Eigentümer zuvor gesagt). Aufbau: Stand `38e2bba`, Oberfläche gebaut, lokaler Server mit Kopie der Salzmark (`spikes/regel-002/geschichten.py`), echter OpenRouter-Schlüssel, Chromium per Playwright (Prüfskript nur im Arbeitsbaum, danach gelöscht), grok-4.6.
- **Ohne Websuche** („Schmugglerin, mit @Tomas Rehl verfeindet“): drei Varianten, dann genau ein ```kanon-Block (Figur mit Aliassen); passt zum Kanon (Tomas hinkt, ehemaliger Zöllner). „Als Kanon übernehmen“ → Import-Vorschau mit 1 Eintrag, Kategorie richtig; auf einer Kopie der Daten übernommen: Eintrag `liska-dorn` mit Aliassen angelegt. 1.951 Token ein, ca. 1.000 aus, ca. 0,7–1 ct, erstes Textstück 9–10 s, gesamt ca. 28 s.
- **Mit Websuche** (Salzsiederei im Mittelalter, Gegenstand „Siedepfanne“): Sachteil mit Quellen, dann ```kanon-Block mit Zweck/Verwendung/Auswirkung → Vorschau 1 Eintrag, Kategorie Gegenstand. Rohstrom: `start`, 542 `text`, ein `quellen`-Ereignis mit 3 URLs nach dem Text, `done`.
- **Befunde:** (1) Websuche kostet 5,9–6,5 ct je Antwort statt „ca. 1 ct“ wie am Kästchen: 18.645–21.035 Token ein statt geschätzt ca. 1.500 – die Suchergebnisse werden als Eingabe berechnet. (2) Die Fundstellen haben als Titel nur „1“, „2“, „3“ (so liefert sie der Anbieter); die Links unter der Antwort heißen deshalb nur 1 · 2 · 3. (3) Im Antworttext stehen die Verweise roh als `[[1]](https://…)`. (4) Erstes Textstück mit Websuche 18–22 s, gesamt ca. 34 s.
- Reibung: Prüfskript zuerst mit Adresse ohne `#/` (Oberfläche nutzt HashRouter) und mit Lesen des Antwortkörpers (bei Streams nicht möglich) – Fehlversuche mit drei echten Anfragen, zusammen ca. 2 ct; Gesamtkosten der Probe ca. 15 ct. `pkill` mit einem Muster, das auch im eigenen Befehl stand, beendete die eigene Shell – künftig Prozessnummer merken.
- Eigentümer per Auswahlfrage: alle drei Befunde in 6.7 beheben (in einer neuen Session), danach einspielen.

### 2026-10-11 – [BEOBACHTUNG] 6.7 KI-Weltenbauer umgesetzt, echte Probe offen

- Server (Commit 4fd80a3): Websuche als Plugin `web` (max. 5 Treffer), Fundstellen aus `annotations` (nur http(s), höchstens 20, Länge begrenzt), Anfrage aus `context/worldbuilder.py`, Ablauf `api/flows/worldbuilder.py`, Route `POST /api/worlds/{w}/worldbuilder`, Verbrauchsart `weltenbau`. pytest 526 grün, neue Dateien 100 %.
- Oberfläche (Unteragent der Routine-Klasse, von mir geprüft): `WorldBuilder.tsx`, `useWorldbuilder.ts`, `kanonBlock.ts`; Kanon-Seite mit Knopf „✨ Weltenbauer“, Import nimmt den übernommenen Text entgegen und zeigt die Vorschau sofort. tsc, eslint, prettier grün; vitest 201 grün, Abdeckung 98,15/96,08/97,04/98,43 %; Playwright 11 grün.
- Eigene Sichtprobe mit nachgebildetem Anbieter (lokal kein gültiger Schlüssel): Desktop 1280 und Handy 390 – Gespräch, Fundstelle als Link, „Als Kanon übernehmen“ → Import-Vorschau mit 1 Eintrag, Kategorie Figur. Keine Konsolenfehler außer dem erwarteten 401 der Sitzungsprüfung vor der Anmeldung.
- Reibung: Der erste Lauf des Prüfservers hing an der Anmeldung, weil er aus dem Scratch-Verzeichnis gestartet war und die gebaute Oberfläche nicht fand; im Projektordner gestartet lief er.
- Offen: echte Probe in einer Cloud-Session (hält das Modell den ```kanon-Block ein, wie kommen Fundstellen im Strom), Einspielen, Bestätigung des Eigentümers.

### 2026-10-11 – [ADR-ANGELEGT] ADR-064 KI-Weltenbauer (6.7)

- Vorlage A (Gespräch + Import), B (gespeichert), C (nur ausformulieren); Eigentümer bat um Erklärung von A, danach „A mit Websuche“. Internet: „Gleich mit“ (Kategorie 3). Grundlage: `preview_import`/`apply_import` kennen Konflikt „vorhanden“ und Überschreiben auf Wunsch.
- OpenRouter-Doku zur Websuche gelesen (2026-10-11): Plugin `web` bzw. Endung `:online`; Exa ca. 0,007 $ je Anfrage, eigene Suche der Anbieter nach Umfang; Fundstellen als `annotations`/`url_citation`, Streaming-Format nicht dokumentiert. Meine erste Schätzung im Gespräch (ca. 2 Cent) war zu hoch – dem Eigentümer korrigiert.

### 2026-10-11 – [ADR-ANGELEGT] ADR-063 Schutz-Schritte 6.4–6.6

- 6.5 vorab mit Fakten: OpenRouter kennt `data_collection: deny` und Zero Data Retention; öffentliche Liste `/api/v1/endpoints/zdr`: etwa 255 von 442 Textmodellen mit ZDR-Anbieter; Favoriten grok-4.6, grok-4.5, Venice-Edition ja, qwen3.8-max nein; für `deny` keine öffentliche Liste. Eigentümer: 6.5 „C: Im OpenRouter-Konto“ (kein Code), 6.4 und 6.6 „Ja, beide“.
- Umgesetzt in `api/app.py`: `no-store` für `/api/` (auch 500), CSP auf jeder Antwort, Handler für Validierungsfehler ohne Werte. Browser-Prüfung am lokalen Server: keine CSP-Meldung, Editor, `@`-Menü, Service Worker, Offline-Seite in Ordnung; Playwright 11 grün.
- Unabhängige Prüfung (getrennte Instanz, Sonnet): „freigeben“; behoben: Schlüssel in `loc` (jetzt nur Ort und oberstes Feld), `no-store` an der 500-Antwort, Doku-Drift (Bedrohungsmodell und 2.7-Zeile nannten keine bzw. eine Meta-CSP), mehr Testfälle (json_invalid, verschachtelte Schlüssel, HEAD, 500). pytest danach 503.

### 2026-10-11 – [ADR-ANGELEGT] ADR-062 Kanon vor den letzten Seiten (6.3 umgesetzt)

- Nach Pull von `main`: Spike 6.13 von einer Cloud-Session ausgeführt (#119, Bericht `docs/research/kanon-luecke.md`): ohne Auffüllung 4,0 bzw. 3,3 Widersprüche je Kette statt 0 bzw. 0,7; Details nur im Kanon 1 statt 10 von 15 eingehalten; Kontrollen 100 %. Bericht gelesen, Empfehlung C übernommen.
- Vorlage 6.3 erneut mit Messwerten; Eigentümer: „C: Kanon vor den Seiten, 30 %“. Umgesetzt: `CANON_SHARE = 0.3`, `_filler_parts` zuerst bis zum Anteil vor den Seiten, danach wie bisher nach den Seiten; genommene Einträge zählen als enthalten (kein Doppel). Zwei bestehende Tests zu den Seiten bei Budget 1.400/1.600 auf `CANON_SHARE = 0` gesetzt (prüfen die Seitenlogik; bei so kleinem Budget nimmt der Anteil die Seiten weg – im Betrieb mit 30.000 Token nicht relevant); drei neue Tests (langes Kapitel, Obergrenze, Rest nach kurzen Seiten).
- Prüfung vor einer Cloud-Messung: Für beide Testgeschichten sind alle sieben Anfragen mit neuer und alter Regel byte-gleich – Regel-002-Messung an ihnen sinnlos. Eigentümer: Abnahme „An deiner Geschichte“ (Technik-Prüfung auf dem Server nach dem Einspielen, dann sein Urteil). Abweichung von Regel-002 in ADR-062 begründet.
- Reibung: Die Cloud-Session hatte den Status von 6.3 im Fahrplan umformuliert; mein Ersetzen schlug fehl und wurde mit dem neuen Text wiederholt (Architektur und ADR waren schon geschrieben).

### 2026-10-11 – [SESSIONENDE] Spike 6.13 erledigt

- **Bearbeitet:** 6.13 (ERKUNDUNG) – Läufe, verblindete Bewertung, Bericht; README-Drift behoben (Status-Block stand noch auf Phase 5 und „In Entwicklung“, älter als diese Session).
- **Nächster Schritt:** 6.3 Entscheidungsvorlage (Empfehlung C); offen beim Eigentümer: Prüfung 6.1 und 6.2, D.11 bis 2026-10-31.
- **Modell-Bilanz:** Entscheidungs-Klasse (`claude-opus-5-5`, Sitzungsabfrage); 6.13 empfiehlt Entscheidung – 0 Schritte oberhalb der Empfehlung. Abgegeben: zwei Bewertungen an getrennte Instanzen der Routine-Klasse (Sonnet, verlangt durch das Verfahren).
- **Kontextgröße:** zu Beginn ca. 222.000 Token, über der Grenze; „Weiter hier“ des Eigentümers.
- **Prüfungen:** markdownlint sauber; kein Produktcode geändert, daher keine Tests nötig; keine neuen ADRs, Reifegrade unverändert (NFR Kontexttreue bleibt `[VORLÄUFIG]` bis 6.3); Ablaufdaten-Register ohne erreichten Vorlauf.

### 2026-10-11 – [ERLEDIGT] 6.13 Spike Kanon-Lücke

- Läufe mit grok-4.6, je Variante 42 Anfragen ohne Abbruch: `mit` 1,45 $, `ohne` 1,22 $. Bewertung verblindet durch je eine getrennte Sonnet-Instanz je Geschichte; alle Widersprüche vom Coding-Agent am Text und Kanon nachgeprüft, kein Urteil geändert.
- Ergebnis: Widersprüche je Kette Salzmark 0 → 4,0 (2–5), Glimmergrund 0,7 (0–1) → 3,3 (2–4); Salzmark „nur im Kanon“ Quote 100 % → 17 % (0–33 %), meist ausgewichen (9 N); Glimmergrund „auch im Text“ 96 % → 85 %; Kontrollen 100 % in beiden. Wirkung in beiden Geschichten außerhalb der Spannweite (Regel-002). Bericht `docs/research/kanon-luecke.md`, Empfehlung für 6.3: C (Kanon vor den Seiten mit Obergrenze); A reicht nicht, weil die meisten Widersprüche Figuren und Orte betreffen.
- Beobachtungen: Die Zufallsreihenfolge legte in Salzmark alle `ohne`-Ketten auf K1–K3 (im Bericht als Grenze genannt). Die Bewertungen hatten Markdown-Formfehler (Leerzeilen, eine Überschriftenebene), mit `markdownlint --fix` bzw. einer Zwischenüberschrift behoben – Inhalt unverändert. Schritt-Text von 6.13 nannte noch den ersten Aufbau („Kanon vor den Seiten“); Abweichung im Bericht und in den Notizen festgehalten.

### 2026-10-11 12:47 UTC – [SESSIONSTART] Spike 6.13 ausführen (Läufe, verblindete Bewertung, Bericht)

- Fortgesetzte Cloud-Session nach `git pull` (Stand `01ed910`). Modell laut Sitzungsabfrage: eingestellt und bedient `claude-opus-5-5` → Entscheidungs-Klasse; 6.13 empfiehlt Entscheidung (Läufe Routine).
- Kontextgröße zu Beginn ca. 222.000 Token, über der Grenze 200.000; dem Eigentümer vorgelegt, Antwort „Weiter hier“ (Abweichung nach `CLAUDE.md` Abschnitt 0).
- Pflichtlektüre in Auszügen neu: Fahrplan (Aktueller Stand, 6.13), ADR-061, Logbuch seit Phasenwechsel 5 → 6, aktive Blocker (keine). Schlüssel `OPENROUTER_API_KEY` vorhanden (nur Vorhandensein geprüft).

### 2026-10-11 – [ADR-ANGELEGT] ADR-061 und Spike 6.13 vorbereitet

- 6.3 vorgelegt (A Kultur immer mit, B nur anzeigen, C Kanon vor den Seiten mit Obergrenze – Empfehlung, D erst messen). Eigentümer wählte zuerst C, korrigierte dann: „wir machen erstmal D, den Spike“. ADR-061, neuer Schritt 6.13 (ERKUNDUNG); Phase 6 jetzt 13 Schritte (Schwelle > 15).
- Spike-Aufbau geändert gegenüber dem ersten Gedanken („langes Kapitel“): Die Kapitel der Testgeschichten sind kurz (Salzmark-Schreibkapitel 539 Wörter), der Kanon geht heute fast vollständig mit; ein verlängertes Kapitel bräuchte erfundenen Text. Stattdessen gleicher Text, Auffüllung an/aus (`spikes/kanon-luecke/variante.py` ersetzt nur `_filler_parts`, möglich durch 6.12).
- Befund ohne KI (`technik.md`): ohne Auffüllung fehlen alle Proben-Einträge außer Kontrollen (geführte Figur, Regel). Stichwortsuche: Salzmark – fünf Details nur im Kanon; Glimmergrund – alle zwölf auch im bisherigen Text (die Testgeschichte wurde mit diesen Details geschrieben). Damit misst der Spike beide Fälle.
- Probelauf mit nachgebildetem Anbieter: Werkzeug läuft durch (7 Schritte, Ergebnisdateien), danach gelöscht. KI-Läufe brauchen eine Cloud-Session (lokaler Schlüssel ungültig).

### 2026-10-11 – [ERLEDIGT] 6.12 Umbau der Anfrage-Zusammenstellung

- Eigentümer wollte zunächst 6.3; nach der ersten Messung „Stopp, mein Fehler. Wir beginnen erstmal mit 6.12“ (Reihenfolge aus ADR-060). Messwerte für 6.3 aufbewahrt (nur Zahlen): Welt des Eigentümers 54 Einträge, ca. 6.360 Token Kanon gesamt (Figuren 12 / 2.295, Gegenstände 13 / 2.604, Orte 6 / 481, Kultur 3 / 167, Regeln 8 / 358, Zeitlinie 12 / 454); Anfrage für Kapitel 6: 29.780 Token, davon letzte Seiten 22.116, Kurzfassungen 5 / 1.788, Handlungsstand 1.126, Auffüllung nur 1 Eintrag (88 Token).
- Vorher-Stand vor dem Umbau festgehalten: Skript im Scratch-Verzeichnis erzeugt alle Schreib-Anfragen (4 Budgets, 3 Verweis-Varianten, 3 Längen) für fünf Testdatensätze, darunter eigens angelegte mit Gästen, Fakten, Schreibweise und einer gelöschten geführten Gast-Figur – 864 Anfragen inkl. 180 `ContextTooLarge` mit Meldung. Umbau an einen Unteragenten der Routine-Klasse abgegeben; nachher selbst geprüft: byte-gleich (`cmp`), ruff/mypy sauber, pytest 492, `builder.py` 100 %. Kommentar an `_FIXED_SOURCES` ergänzt.

### 2026-10-11 – [BEOBACHTUNG] 6.2 Kurzfassung im eigenen Reiter umgesetzt; zwei wacklige Tests stabilisiert

- Routine-Schritt auf der Entscheidungs-Klasse (genannt), nicht abgegeben (klein, viel Abstimmung). Mockup mit zwei Varianten direkt in der echten Seite nachgebaut (DOM-Änderung per Playwright, Kopie der Testdaten); Eigentümer: „A: Eigener Reiter“. Ergänzt gegenüber dem Mockup: nach „Kapitel abschließen“ öffnet der Reiter von selbst (die neue Kurzfassung ist zu prüfen).
- Reibung beim Mockup: Variante C zuerst ohne Neuladen der Seite aufgenommen – Bild enthielt noch Variante A; wiederholt.
- **Wacklige Tests** (nicht deterministisch, Blocker nach `CLAUDE.md` Abschnitt 6) bei Läufen der ganzen Suite gefunden: (1) `ModelChoice.test.tsx` – die Hilfsfunktion `modelSelect` wartete nur auf den Wert; das Modell der Geschichte steht vor der Modell-Liste im Feld, ein Wechsel fand dann keine Option (dieselbe Ursache, die eine andere Session am 2026-10-10 in einem einzelnen Test behoben hatte) – jetzt wartet die Hilfsfunktion auf die ganze Liste. (2) `WritingPanel.test.tsx` „follows the growing proposal …“ las die Scroll-Position, bevor das Mitlaufen im nächsten Bildaufbau lief – jetzt mit `waitFor`. Ob (2) schon vor 6.11 auftrat, ist offen (geänderte Reihenfolge der Effekte). Gegenprobe: 30 Läufe der ganzen Suite ohne Fehlschlag.
- Prüfungen: vitest 183 (gesamt 97,86 / 95,64 / 96,84 / 98,17), Playwright 11; Bildschirmfotos am lokalen Server (Rechner und Smartphone, Reiter zu und offen).

### 2026-10-11 – [BEOBACHTUNG] 6.1 Umfang des Kapitels umgesetzt, Prüfung offen

- Mockup (Vorher-Bildschirmfoto und drei Zustände, Rechner und Smartphone) freigegeben. Grenze nicht geraten: `ContextBuilder.chapter_summary_room` rechnet mit derselben Formel wie `_fitted` (Kapazität `budget / 1,1` minus übrige Bausteine, 3,3 Zeichen je Token, Trenner); Test zeigt für drei Budgets: genau `max_chars` passt, ein Zeichen mehr wird abgelehnt. Die Oberfläche rechnet Zeichen über die Zeichen je Wort des eigenen Textes in Wörter um (gerundet auf 500) und lädt die Grenze neu, wenn sich die Gesamtzusammenfassung ändert.
- Reibung: erst eine Linter-Ausnahme (`react-hooks/exhaustive-deps`) für das Neuladen gesetzt; durch eine Kennzahl der Gesamtzusammenfassung als `round` von `useLoad` ersetzt – keine Ausnahme im Code. Am Smartphone brach der rote Hinweis im Mockup ab; die Anzeige darf umbrechen.
- Prüfungen: pytest 492 (`builder.py`, `manuscript_routes.py` 100 %), vitest 180 (gesamt 97,86 / 95,61 / 96,83 / 98,16, `ChapterLength.tsx` vollständig), Playwright 11; Bildschirmfotos an langen Testkapiteln (Kopie der Testdaten): 1.810 Wörter normal, 13.981 gelb („passt bis ca. 15.500“), 17.095 rot. Neue Farbwerte `--warn*` für hell und dunkel.

### 2026-10-11 – [ERLEDIGT] 6.11 Umbau des Schreibbereichs

- Routine-Schritt auf der Entscheidungs-Klasse begonnen (zu Beginn genannt); der Umbau selbst an einen Unteragenten der Routine-Klasse (Sonnet) abgegeben – überwiegend Ausgabe, daher Ersparnis. Ergebnis von der aktiven Klasse geprüft: tsc, eslint, prettier sauber; vitest 173 unverändert grün, Abdeckung gesamt nicht gesunken (97,82 / 95,54 / 96,79 / 98,14); Playwright 11 grün; Bildschirmfotos vorher/nachher am lokalen Server pixelgleich verglichen (4 Ansichten); Hook `useWriteFlow` durchgesehen.
- `WritingPanel.tsx` 765 → 271 Zeilen; sieben neue Dateien, keine über 204 Zeilen. Offene Zweige in `useChatScroll.ts` (Zeilen 23, 42, 115) und `useWriteFlow.ts` (62, 147–148, 151) waren schon vorher ungetestet (Abbruch beim Verlassen, Rückfall-Scrollen) – kein neuer Bestand.

### 2026-10-11 – [BEOBACHTUNG] Kapitel 4 der Geschichte des Eigentümers in 3 Kapitel geteilt

- Eigentümer: Kapitel 4 „zu lang geworden“ (25.570 Wörter). Auswahlfrage „Ja, in 3 Teile“. Letztes Speichern 11:07, Geschichte laut Vorgabe gespeichert und geschlossen. Sicherung des Ordners nach `/opt/docker/skriptorium/sicherungen/` (Ordner „…-vor-teilung-k4-2026-10-11“).
- Teilung im Container wie am Vormittag (Absatzgrenzen nächst den Dritteln, Prüfung auf exakt denselben Text): Kapitel 4/5/6 mit 8.526 / 8.489 / 8.555 Wörtern, Summe 25.570; 4 und 5 abgeschlossen, 6 in Arbeit. Kein Text ausgegeben.
- Beobachtung: Die Wortanzeige (6.1) ist genau für diesen Fall gedacht – das Kapitel wuchs innerhalb eines Tages auf mehr als das Doppelte der Grenze.
