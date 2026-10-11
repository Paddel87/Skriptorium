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

Das Logbuch beginnt mit der ersten regulären Session nach dem Initialisierungs-Commit (Modus 2, abgeschlossen 2026-09-26). Verlauf und Begründungen der Initialisierung stehen in `docs/decisions.md` (ADR-001 bis ADR-009). Phasen 1 bis 4 sind verdichtet; Details in `docs/archiv/logbuch-phase-1.md` bis `docs/archiv/logbuch-phase-4.md`.

---

<!-- ANCHOR:eintraege -->
## Einträge (neueste oben)

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
