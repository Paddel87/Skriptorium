# Archiv – Logbuch Phase 8

<!-- Quelle: docs/logbuch.md. Ausgelagert am 2026-10-18 beim Phasen-Wechsel 8 → 9 (CLAUDE.md Abschnitt 14,
     Logbuch-Verdichtung). Abgedeckter Zeitraum: 2026-10-13 bis 2026-10-18. Neueste Einträge oben. -->

## Einträge (neueste oben)

### 2026-10-18 – [BEOBACHTUNG] V.35 mit dem Eigentümer durchgegangen

- Während die getrennte Instanz bewertete, auf Wahl des Eigentümers („Ja, jetzt“). Je Befund eine Kurzfassung mit heutigem Stand, dann Auswahlfrage „wichtig, bald / gern, später / brauche ich nicht“ (bei G1/G2: was stört – Bedienung, Verlässlichkeit, Gliederung je Art; Mehrfachwahl).
- Ergebnis: alle zwölf Befunde mit Priorität (B1–B7, G3, G4, H1, V1) „wichtig, bald“; G1/G2 nur „Verlässlichkeit“. Festgehalten in V.35.
- **Für die Planung wichtig:** Zusammen mit V.20, V.21, V.23, V.24, V.33, V.34, V.36, V.37 ist die Menge für eine Phase zu groß (Wucherungs-Schwelle: Faktor 2 des Schrittplans). Die Planung braucht eine Reihenfolge, die der Eigentümer festlegt. Bei G1/G2 zielt die Frage damit auf verlässliches Finden von Teilen eines Eintrags – das lässt auch Lösungen ohne Abkehr von Markdown-Dateien zu (Vision 7, FR-020); Entscheidung mit `ENTSCHEIDUNG ERFORDERLICH`.

### 2026-10-18 – [ONBOARDING-VALIDATION] Phasengrenze Phase 8 (8.13)

- Frischer Worktree von `main` (`ad05dce`) im Scratchpad: Quick Start der README genau wie dokumentiert (`uv python install 3.14.7`, `uv sync --frozen --python 3.14.7`, `npm ci`, `uv run pre-commit install`, `uv run skriptorium-einrichtung`, `npx vite build`, `uvicorn`) – alle Schritte Exit 0, `/api/health` → `{"status":"ok"}` nach 1 s; `scripts/session-start.sh` Exit 0. `npm ci` und Build ohne Warnung. Keine Befunde; Worktree entfernt, Hook im Haupt-Checkout danach mit `uv run pre-commit install` neu eingerichtet (Lehre aus 7.8).

### 2026-10-18 – [BEOBACHTUNG] 8.13 begonnen: Vision-Abgleich an der Phasengrenze

- Fortsetzung nach dem `[SESSIONENDE]` auf „Weiter“ des Eigentümers. PR #171 nach ausdrücklicher Freigabe gemergt (`ad05dce`); der erste Versuch auf das bloße „Weiter“ wurde von der Rechteprüfung abgelehnt („Merge Without Review“) – danach auch harmlose Befehle, bis der Eigentümer per Auswahlfrage freigab.
- **Getrennte Instanz** für die Pflichtfrage gestartet: Unteragent mit Sonnet, ohne Gesprächsverlauf, nur lesend; Auftrag wie in 7.8, zusätzlich die Frage, ob Datenmodell und Schnittstellen V.20, V.21, V.23, V.24, V.33–V.37 tragen (besonders V.35 G1/G2 und V.37).
- **Vision-Abgleich** gegen `docs/vision.md` und `docs/requirements.md`: Zielbild, Szenarien 1–5 und Erfolgskriterien haben je eine erledigte Anforderung (FR-001–FR-035; alle 19 Muss erledigt, FR-006 verworfen mit ADR-009). Vision 5: Satz und Export erledigt (FR-034), Veröffentlichung → V.21, Bilder im Manuskript → V.23, weitere Bildanbieter → V.24, Kartensuche → V.20 – alle mit Landeplatz 8.13. Vision 9 „manuelle Kanon-Pflege“: mit 8.9 (Weltenbauer aus dem Manuskript) angegangen. Alle `[VERSCHOBEN]`-Schritte zeigen auf erledigte Schritte oder auf 8.13 (V.20, V.21, V.23, V.24, V.33–V.37). **Keine verwaisten Elemente.**
- **Befunde des Abgleichs:** (1) NFR Kontexttreue steht seit 2026-10-11 auf `[VORLÄUFIG]`; ADR-062 knüpfte die Beförderung an die Abnahme durch den Eigentümer, die am 2026-10-11 erfolgte – seitdem ohne Schritt und ohne ADR. Landeplatz jetzt 8.13 (Entscheidung mit der Planung). (2) Drift behoben: `docs/architecture.md` Abschnitt 6 nannte Kontexttreue noch `[OFFEN]` mit Auslöser D.4 und Reaktionszeit noch `[VORLÄUFIG]` mit alten Zielen – jetzt wie die Reifegrad-Tabelle (ADR-057, ADR-052). (3) Drift behoben: `docs/requirements.md` Übersicht zählte 25 Anforderungen (19/4/1) – jetzt 35 (19/10/5, FR-006 verworfen); FR-018 verwies auf V.3 (verworfen, ADR-059), FR-032 nannte V.13 als „künftig“ (erledigt in 6.4). (4) Für V.35 G1/G2 gilt Vision 7 „offene Formate“ (FR-020): Felder statt Abschnitten dürfen die Lesbarkeit als Datei nicht aufgeben.

### 2026-10-18 15:51 MESZ – [SESSIONENDE] 8.9 und 8.11 abgeschlossen

- **Dauer:** 2026-10-18 00:48 bis 15:51 (MESZ), mit langer Pause des Eigentümers; reine Arbeitszeit kurz.
- **Bearbeitet:** kein Code. 8.11 nach Zusammenfassung der Probe bestätigt, Ergebnissatz im Probebericht richtiggestellt; 8.9 nach Probe des Eigentümers abgeschlossen. Phase 8: 12 von 13 – offen nur 8.13.
- **Nächster Schritt:** 8.13 mit Phasenabschluss wie 7.8: Vision-Abgleich gegen `docs/vision.md`, Onboarding-Pfad auf frischem Worktree, Pflichtfrage mit getrennter Instanz, Planung von Phase 9 per ADR. Dafür vom Eigentümer: Probe mit einer Gast-Figur (V.34) und gemeinsames Durchgehen von V.35 (G1/G2 auf der Entscheidungs-Klasse); in die Planung gehen außerdem V.36 und V.37 aus der parallelen Cloud-Session (V.37 mit Datenmodell-Vorlage gegen ADR-023). Vorschlag beim Start: KI bereitet vor, Eigentümer probiert parallel V.34.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session` am Ende erneut abgefragt). 0 Schritte oberhalb der Empfehlung (8.9 und 8.11 empfehlen Entscheidung); Routine-Teilarbeiten (Logbuch, README, Fahrplan-Status) klein und im geladenen Kontext, daher nicht abgegeben.
- **Kontextgröße:** über die Sitzungsabfrage nicht feststellbar; Regel „Sessiongröße“ entfiel.
- **Sessionende-Prüfungen:** README synchron (12 von 13, 8.9/8.11 erledigt, 8.13 als Nächstes); Drift behoben: `docs/project-context.md` Abschnitt 1 nannte noch „offen: 5.5“ (erledigt seit 2026-10-11) → „offen: 8.13 (Phasenabschluss), D.11“. Kein neuer ADR, Reifegrade unverändert, Reaktiv-Quote 1 / 10, keine aktiven Blocker, kein `[BLOCKIERT]`-Schritt; Phase 8 bei 13 Schritten (Schwelle 26). Ablaufdaten-Register: kein Vorlauf erreicht (nächste: D.1 ab 2026-11-05, mypy 2 am 2026-11-06). Logbuch ca. 350 Zeilen, project-context 348 Zeilen – kein Trigger. Vision-Abgleich erst an der Phasengrenze (8.13).
- **Abweichung:** Erste Antwort der Session auf Englisch; Eigentümer wünscht Deutsch (Erinnerung angelegt).
- **Reibung – parallele Session:** Während der Pause lief eine Cloud-Session (ca. 06:26–06:45 MESZ, V.36/V.37, PR #169 und #170) auf `ea7543b`; sie kannte die lokalen, nicht hochgeladenen Commits zu 8.11 nicht und vermerkte 8.11 noch als offen. Erst vor dem Hochladen per `git fetch` bemerkt (5 Commits Abstand). Branch auf `5cde988` neu aufgesetzt; Konflikte in Fahrplan, README und Logbuch von Hand zusammengeführt, Logbuch zeitlich geordnet (Cloud-Einträge in UTC, diese Session in MESZ). Lehre: Nach einer langen Pause innerhalb einer Session vor dem nächsten Schritt `origin/main` prüfen – nicht nur zum Sessionstart.

### 2026-10-18 – [ERLEDIGT] 8.9 Weltenbauer aus dem Manuskript

- Eigentümer: „8.9 habe ich schon getestet, das hat … funktioniert“ (Spracheingabe; ein Wort unklar, „der Vorrat“ – vermutlich „hervorragend“, Aussage eindeutig positiv). Damit ist das letzte Akzeptanzkriterium erfüllt (echte Probe an einer Geschichte des Eigentümers, Bestätigung) → 8.9 `[ERLEDIGT]`, Phase 8: 12 von 13. Keine Einzelheiten zur Probe erfragt (Geschichtentitel bleiben ohnehin draußen); Auffälligkeiten aus der Probe kämen als V-Schritt mit Landeplatz 8.13.
- `docs/requirements.md` FR-029 um 8.9 ergänzt; README und Fahrplan nachgezogen. Es bleibt nur 8.13 mit dem Phasenabschluss.

### 2026-10-18 04:45 – [SESSIONENDE] V.36 und V.37 vorgemerkt

- **Dauer:** 2026-10-18 04:26 bis ca. 04:45 UTC.
- **Bearbeitet:** kein Code. Frage des Eigentümers zur Cache-Nutzung bei KI-Anbietern beantwortet (Doku OpenRouter und xAI); daraus V.36 „Cache-Treffer der KI-Anbieter festhalten“. Neuer Wunsch „umfangreiches Statistik-System“ → V.37 „Verbrauchsstatistik je Welt und je Geschichte“ (Sortierung der Modelle nach Häufigkeit oder Token-Menge, nicht Tempo). Beide mit Landeplatz 8.13, gemeinsam in PR #169, nach grüner CI gemerged (`f9dec02`, auf Anweisung des Eigentümers).
- **Wichtig für 8.13:** V.37 ändert ADR-023 (Option C: Welt und Geschichte je Verbrauchszeile) – Vorlage mit `ENTSCHEIDUNG ERFORDERLICH`; alte Anfragen sind nicht zuzuordnen.
- **Nächster Schritt:** unverändert 8.9 (Probe des Eigentümers), 8.11 (Bestätigung), dann 8.13 mit V.35–V.37.
- **Modell-Bilanz:** Entscheidungs-Klasse (`claude-opus-5-5`, eingestellt und bedient laut `get_session` 04:41); 2 Schritte oberhalb der Empfehlung (Anlegen von V.36 und V.37 ist Fahrplan-Pflege, Routine) – Hinweis nach V.36 gegeben; nichts abgegeben (Doku-Arbeit im geladenen Kontext, Abgabe hätte ihn neu laden müssen).
- **Kontextgröße:** 251.573 Token (`get_session` 04:41) – **über der Grenze von 200.000**. Abweichung: Die Sitzungsabfrage meldete bis zum Anlegen von V.36 unverändert 121.144 Token; nach V.37 wurde nicht erneut geprüft. Ab dem Merge kein neuer Schritt mehr, nur dieser Abschluss.
- **Sessionende-Prüfungen:** Fahrplan „Aktueller Stand“ und Übersicht nachgezogen, README „Nächste Schritte“ synchron; kein neuer ADR, Reifegrade unverändert, keine aktiven Blocker; V.36/V.37 als V-Schritte ohne Wirkung auf den Schrittplan von Phase 8 (13); Ablaufdaten-Register: kein Vorlauf ohne Schritt (nächste: D.1 ab 2026-11-05, mypy 2 am 2026-11-06 in D.5); Logbuch ca. 350 Zeilen, project-context 348 Zeilen – kein Trigger.

### 2026-10-18 – [BEOBACHTUNG] V.37 angelegt: Verbrauchsstatistik je Welt und Geschichte

- Wunsch des Eigentümers: Übersicht je Welt und je Geschichte mit Token ein/aus, Kosten und dem Verlauf der Modelle, sortiert nach Häufigkeit oder Token-Menge („Menge“, nicht Tempo – Auswahlfrage).
- Befund: `api/usage.py` speichert je Anfrage Zeit, Art, Modell, Ergebnis, Token und Kosten, aber bewusst weder Welt noch Geschichte (ADR-023, Option C damals nicht gewählt). Folge: Datenmodelländerung mit Freigabe; alte Anfragen nicht zuzuordnen, die Statistik beginnt mit dem Umbau.
- V.37 mit Landeplatz 8.13; V.36 und V.37 auf Wunsch des Eigentümers in einem Pull Request.

### 2026-10-18 – [BEOBACHTUNG] V.36 angelegt: Cache-Treffer festhalten

- Recherche (Doku OpenRouter und xAI, 2026-10-18): Kein Anbieter meldet vor einer Anfrage, ob der Zwischenspeicher gefüllt ist; jede Antwort nennt die gelesenen Cache-Token (`usage.prompt_tokens_details.cached_tokens`), OpenRouter zusätzlich `cache_write_tokens`, `cache_discount` und die Activity-Seite.
- Befund im Code: `ai_gateway/openrouter.py` fordert die Verbrauchsdaten schon an, wertet aber nur `prompt_tokens`, `completion_tokens` und `cost` aus – die Cache-Zahl kommt an und geht verloren. Deshalb blieb der Nebenbefund in `docs/research/modell-eignungstest.md` ungemessen.
- V.36 mit Landeplatz 8.13 (Regel der Phase 8 für neue Wünsche); Freigabepflicht nur, falls Verbrauchsdateien oder `/api/usage` erweitert werden.

### 2026-10-18 04:40 – [SESSIONSTART] Cache-Treffer der KI-Anbieter

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage `get_session`), Entscheidungs-Klasse; Aufwand „high“.
- **Umgebung:** Cloud-Session (Linux), kein SSH zum VPS (ADR-025); Stand `main` `ea7543b`, gleich `origin/main` (vor der Mindest-Lektüre per `git fetch` geprüft – Lehre vom 2026-10-16).
- **Auftrag:** Frage des Eigentümers, ob sich bei Anbietern wie OpenRouter oder Grok prüfen lässt, ob der Zwischenspeicher (Cache) genutzt wird; danach „leg den Schritt an“.
- **Kontextgröße:** über die Sitzungsabfrage feststellbar (`context_usage.used_tokens`).

### 2026-10-18 – [ERLEDIGT] 8.11 Verweise zwischen Kanon-Einträgen

- Eigentümer wollte zuerst Deutsch im Gespräch (Erinnerung angelegt) und den nächsten Fahrplanschritt wissen; Wahl „8.11 bestätigen“. Nach einer Zusammenfassung der Probe vom 2026-10-13 bestätigt → 8.11 `[ERLEDIGT]`, Phase 8: 11 von 13. Offen vor 8.13 nur noch 8.9 (Probe des Eigentümers).
- **Korrektur im Probebericht:** Die Tabellen über 6 Ketten je Seite mit `auswertung.py` nachgerechnet (Läufe beider Ordner in einen gemeinsamen Ordner je Seite im Scratchpad kopiert) – Zahlen stimmen. Falsch war der Satz „Alle Mittelwerte von nachher liegen in der Spannweite von vorher“ (auch im `[GELÖST]`-Eintrag vom 2026-10-13): vier Mittelwerte liegen außerhalb, je nur in einer Geschichte (Salzmark Motivfolge 2,17; Glimmergrund 6er doppelt 0,17, Warte-Enden 0,17, Wörter 124). Nach Regel-002 keine Wirkung, Ergebnis unverändert. Das eine Warte-Ende ist ein Treffer der Wortliste in wörtlicher Rede („Berta schweigt, …“). Satz in `spikes/regel-002/README.md` richtiggestellt, mit Vermerk.
- **Reibung:** In der ersten Zusammenfassung an den Eigentümer stand, alle vier Werte lägen innerhalb der Ausgangsmessung 5.24 – für die Warte-Enden in Glimmergrund falsch (dort ebenfalls 0–0). Erst beim Schreiben des Berichts bemerkt; dem Eigentümer nachträglich gemeldet. Lehre: Vergleichswerte vor dem Vorlegen Zeile für Zeile gegen die Quelle prüfen, nicht aus dem Gedächtnis der Tabelle.
- Dem Eigentümer vor der Bestätigung genannt: keine vollständige Handbewertung der Widersprüche durch eine getrennte Instanz (nur Stichprobe zu Pell).
- `docs/requirements.md`: FR-011 (ortsgebundene Regeln) und FR-013 (Verweise zwischen Einträgen) um 8.11 ergänzt. CHANGELOG enthielt 8.11 schon (2026-10-13).

### 2026-10-18 00:48 MESZ – [SESSIONSTART] Auftrag noch offen

- **Modell:** Opus 5.5 (`claude-opus-5-5`, laut `get_session`), Entscheidungs-Klasse; Aufwand „xhigh“.
- **Umgebung:** Mac des Eigentümers (macOS arm64) – SSH zum VPS möglich (ADR-025); Pre-Commit-Hook über den SessionStart-Hook eingerichtet.
- **Stand:** Zuerst `main` per Fast-Forward von `5c6a14f` auf `ea7543b` nachgezogen (PR #166 Probe 8.11, PR #168 V.35), danach die Mindest-Lektüre – Reihenfolge nach der Lehre vom 2026-10-16.
- **Wiedereinstieg:** aktiv 8.9 (wartet auf die Probe des Eigentümers) und 8.11 (wartet auf seine Bestätigung); danach 8.13 mit V.34 und V.35. Querschnitt: D.11 bis 2026-10-31 (Eigentümer); nächste datierte Schritte D.1 ab 2026-11-05, D.5 ab 2026-11-12. Keine aktiven Blocker, keine offenen STOPP-Situationen, Reaktiv-Quote 1 / 10.
- **Kontextgröße:** über die Sitzungsabfrage nicht feststellbar (kein Wert in `get_session`) – Regel „Sessiongröße“ entfällt (`CLAUDE.md` Abschnitt 0).
- **Auftrag:** beim Start noch offen; danach nächster Fahrplanschritt erfragt → 8.11 bestätigt (Eintrag oben).

### 2026-10-16 – [SESSIONENDE] Befunde gesammelt (V.35)

- **Dauer:** 2026-10-15 21:51 UTC bis 2026-10-16 (Ende nicht genau feststellbar).
- **Bearbeitet:** kein Code. Befunde des Eigentümers (B1–B7, G1–G4, H1, V1) gesammelt und gegen `main` `b20d48a` abgeglichen (Abgleich durch einen Such-Agenten, Stichproben selbst geprüft) → V.35 `[VERSCHOBEN]` → 8.13, auf Wunsch des Eigentümers ohne Einordnung. Doku-Drift behoben: `docs/architecture.md` Abschnitt 7 nannte für neue Figuren nur „## Aussehen“ (seit ADR-083 auch „## Wesen und Geschichte“). README „Nächste Schritte“ um V.35 ergänzt.
- **Wichtig für das Durchgehen:** G1/G2 stellt ADR-003, ADR-078, ADR-083 und ADR-088 in Frage (Inhalt als Markdown-Abschnitte statt Felder) – auf der Entscheidungs-Klasse mit `ENTSCHEIDUNG ERFORDERLICH`. B2 hat einen konkreten Ansatzpunkt: Der Weltenbauer verlangt bei Figuren nur `### Aussehen`, bei Orten nichts.
- **Nächster Schritt:** unverändert 8.9 (Probe), 8.11 (Bestätigung), dann 8.13 mit V.35.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session`); Sammeln und Doku-Pflege sind Routine (1 Schritt oberhalb der Empfehlung); Abgleich als Lesearbeit an einen Such-Agenten abgegeben (gleicher Cache-Lesepreis, aber der Hauptkontext blieb klein).
- **Kontextgröße:** nicht über die Sitzungsabfrage feststellbar; unter der Grenze.
- **Sessionende-Prüfungen:** README nachgezogen; kein neuer ADR, Reifegrade unverändert, keine aktiven Blocker; V.35 als V-Schritt ohne Wirkung auf den Schrittplan von Phase 8 (13); Ablaufdaten-Register: kein Vorlauf erreicht (nächste: mypy 2 am 2026-11-06, D.1 ab 2026-11-05); Logbuch ca. 315 Zeilen, project-context 348 Zeilen – kein Trigger.

### 2026-10-16 – [GELÖST] Veralteter lokaler Stand: Befunde zuerst gegen `main` vom 30.09. abgeglichen

- **Anlass:** Session auf dem Windows-Rechner; der lokale `main` stand auf `b3681eb` (2026-09-30), 554 Commits hinter `origin/main`. Die Mindest-Lektüre und der erste Abgleich der Befunde liefen auf diesem Stand – u. a. „keine Bildfunktion“, „keine Verweise“, eine Frage nach D.8 (längst verworfen, ADR-040). Der erste Pull Request (#167) legte die Sammlung als „D.11“ an, das auf `main` schon belegt ist; GitHub meldete einen Konflikt.
- **Lösung:** PR #167 geschlossen (Kommentar mit Grund), `main` per Fast-Forward nachgezogen, Mindest-Lektüre wiederholt, jeder Befund neu abgeglichen, Sammlung als V.35.
- **Lehre:** Bestätigt die Lehre aus Phase 5 („vor Beginn eines Schritts Stand von `origin/main` prüfen“) – sie gilt schon vor der Mindest-Lektüre, besonders auf einem selten genutzten Rechner: zuerst `git fetch` und Abstand zu `origin/main` prüfen.
- **Abweichung:** Rückfragen gingen zunächst als Text statt als Auswahlfragen (`docs/project-context.md` Abschnitt 9) – die Regel stand im veralteten Stand noch nicht.

### 2026-10-15 21:55 – [SESSIONSTART] Befunde sammeln

- **Modell:** Opus 5.5 (`claude-opus-5-5`, laut `get_session`), Entscheidungs-Klasse; Aufwand „high“.
- **Umgebung:** Windows-Rechner des Eigentümers, nicht der Mac – kein SSH zum VPS (ADR-025); Pre-Commit-Hook hier nicht eingerichtet.
- **Auftrag:** Befunde des Eigentümers sammeln.
- **Mindest-Lektüre:** zuerst auf veraltetem Stand (siehe [GELÖST] oben), am 2026-10-16 auf `b20d48a` wiederholt.

### 2026-10-13 – [GELÖST] 8.11 Befund „wörtlich %“ war Streuung

- Wahl des Eigentümers „3 weitere Läufe je Seite“ (2,91 $). Über 6 Ketten je Seite liegen alle Mittelwerte von nachher in der Spannweite von vorher (Salzmark wörtlich 0,70 in 0,08–0,91; Glimmergrund 0,20 in 0,00–0,23) – keine Wirkung nach Regel-002. Probe 8.11 insgesamt 6,82 $; offen nur die Bestätigung des Eigentümers.
- Reibung: Die Warteschleife mit `pgrep -f "regel-002/lauf.py"` fand sich selbst (ihr eigener Befehl enthält das Muster) – Ende der Läufe stattdessen an „Kosten gesamt“ in den Protokollen erkannt.

### 2026-10-13 – [BEOBACHTUNG] 8.11 Probe nach Regel-002 in der Cloud-Session

- Auftrag des Eigentümers „Beide Teile jetzt“. Vorher-Stand `9acc5bf` in einem Worktree (`PYTHONPATH` auf dessen `src`), nachher `main` `5c6a14f`; grok-4.6, „mittel“, je 3 Ketten. Kosten 3,91 $. Ergebnisse und Tabellen: `spikes/regel-002/README.md`, Abschnitt „Probe zu 8.11“.
- Teil 1: „wörtlich %“ nachher in beiden Geschichten im Mittel über der Vorher-Spannweite (Salzmark 0,71 gegen ≤ 0,50; Glimmergrund 0,41 gegen ≤ 0,08) – nach dem Wortlaut von Regel-002 ein Befund; Werte unter 1 % und innerhalb der Ausgangsmessung 5.24, Vorher-Lauf ungewöhnlich niedrig. Übrige Kennzahlen überschneiden sich.
- Teil 2 (neues Skript `spikes/regel-002/verweise.py`): verwiesene Einträge stehen nachher vorn in der Auffüllung; bei Budget 6.000 ist „Zum Nassen Grab“ nur nachher dabei. Ortsgebundene Regel (Tolm) in keinem der 42 Vorschläge außerhalb angewendet – auch vorher nicht. Keine vollständige Handbewertung der Widersprüche durch eine getrennte Instanz.
- Reibung: `auswertung.py` erwartet Unterordner je Geschichte; für Teil 2 nicht verwendbar – Auswertung per Suche in den Texten und den mitgeschriebenen Bausteinen.

### 2026-10-13 – [BEOBACHTUNG] Eingespielt: Phase 8 bis 8.12 (`19a5e48`)

- Auf Anweisung des Eigentümers nach grüner CI auf `main` eingespielt (Runbook Abschnitt 7); Rückweg-Image `skriptorium:vorher` = `27506c2`. `/api/health` 200 nach ca. 60 s (nur HTTPS abgefragt), danach eine SSH-Prüfung: `healthy`, `REVISION` `19a5e48`.
- Enthalten: 8.1–8.8, 8.10, 8.12 erledigt; 8.9 (wartet auf Probe des Eigentümers) und 8.11 (wartet auf Probe nach Regel-002 in einer Cloud-Session).

### 2026-10-13 – [ERLEDIGT] 8.12 Erkundung „wandernde Figuren“

- Nur gelesen; Bericht `docs/research/wandernde-figuren.md` (Optionen A/B/C, Vision-Grenze Abschnitt 5). Zählung auf dem Server mit einer SSH-Abfrage, nur Anzahlen: 23 Figuren, 0 Namen in mehreren Welten, 0 Gast-Verbindungen, 0 Geschichten mit eigenen Fakten – der Wunsch ist ein Vorhaben, kein Alltagsschmerz. Kein Rateschluss bei C (Konfidenz niedrig, Umkehrbarkeit teuer).
- Eigentümer: „Erst ausprobieren, dann A“ → V.34 (Landeplatz 8.13) mit der Probe als Eingangskriterium.
- Der Bericht entstand während die CI von PR #163 lief, zunächst im Scratchpad, und kam nach dem Merge auf einen eigenen Branch (keine Konflikte im Fahrplan).

### 2026-10-13 – [BEOBACHTUNG] 8.11 Verweise umgesetzt, Probe offen (ADR-088)

- Vorlage mit vier Fragen; Eigentümer wählte alle Empfehlungen. Umsetzung durch Unteragenten (Sonnet). Selbst angeglichen: die Mitnahme erkannte `@Kaels` nicht, die Links in der Oberfläche (`ui/src/references.ts`, Schritt 5.23) schon – jetzt beide mit Genitiv; ein Bestandstest prüfte genau das alte Verhalten und wurde umgestellt. Ein weiterer Bestandstest (`test_budget_is_never_exceeded`) brauchte eine höhere Budget-Schwelle, weil der Rahmen einen Satz länger ist.
- Die Testwelten haben keine `@`-Verweise; die Probe nach Regel-002 prüft ohne Zusatz nur, dass der neue Rahmensatz nichts verschlechtert. Prüfauftrag mit beiden Teilen in den Notizen von 8.11; läuft nur in einer Cloud-Session (lokaler Schlüssel ungültig).

### 2026-10-13 – [ERLEDIGT] 8.10 Zeitlinie mit Jahr, Datum und Uhrzeit

- Vor der Vorlage die Formen der echten Zeitlinien auf dem Server geprüft – anonymisiert (Buchstaben → „a“, Ziffern → „9“), kein Inhalt gelesen: 14 Einträge der Form „999 – Titel“, zwei „99:99 a“, keine Monate. Daraus der Vorschlag „erkennen statt vorschreiben“; Eigentümer wählte alle Empfehlungen.
- Umsetzung durch Unteragenten (Sonnet), der die Ansicht nicht im Browser sah; Sichtprobe hier nachgeholt (Desktop dunkel, Handy hell) – Gruppen, Marken und Hinweis wie im Mockup. Fund: Platzhalter „Jahr oder Uhrzeit“ im schmalen Feld abgeschnitten → „Zeit“. Nebenbefund des Unteragenten: Namen wurden bisher auch am Doppelpunkt geteilt, sodass „14:30 Uhr – …“ zerschnitten wurde; jetzt nur an „ – “.

### 2026-10-13 – [BEOBACHTUNG] 8.9 Weltenbauer aus dem Manuskript umgesetzt (ADR-087)

- Mockup und vier Auswahlfragen; Eigentümer wählte alle Empfehlungen. Umsetzung durch Unteragenten (Sonnet). Selbst geprüft und nachgebessert: Die Suche nahm nur ganze Wörter und übersah damit den deutschen Genitiv („Kaels Hände“) – jetzt mit optionalem `s` bzw. Apostroph (auch typografisch, als `\u2019` wegen ruff RUF001); „Kaelchen“/„Klausur“ bleiben draußen. Kostenanzeige „ca. 0,0 ct“ bei wenig Text → „unter 0,1 ct“.
- Sichtprobe am lokalen Testserver mit Testgeschichte: 3 Stellen (inkl. Genitiv), Anzeige und „✕“ wie im Mockup; eine echte Antwort war lokal nicht möglich (Schlüssel ungültig).
- Eigentümer: „Passt, nur mergen“ – Einspielen und echte Probe stehen aus; 8.9 bleibt bis dahin in Arbeit.

### 2026-10-13 – [ERLEDIGT] 8.8 Weltenbauer behält das Gespräch

- Mockup mit drei Spalten (vorher, A, B); Eigentümer wählte A. Warnung zu Beginn: Schritt empfiehlt Routine, aktiv ist Entscheidung – Bau an Unteragenten (Sonnet) abgegeben.
- Selbst geprüft: `Canon` erscheint mit Weltenbauer nur auf der Kanon-Seite (Schreibseite nutzt `compact`), wie vorher; CSS-Variablen `--surface`/`--text` vorhanden. Sichtprobe, die der Unteragent nicht machen konnte: 375 px, dunkel, Weltenbauer-Antwort im Browser ersetzt. Reibung: erster Ersatz scheiterte an verschachtelten Escapes der Backticks (`String.fromCharCode(96)` half); ein Klick nach Koordinaten traf in der verkleinerten Handy-Ansicht nicht – Element-Referenzen statt Koordinaten.

### 2026-10-13 – [ERLEDIGT] 8.7 Weltenbauer mit Regeln und Zeitlinie (ADR-086)

- Messung auf dem Server mit einer SSH-Abfrage (nur Größen je Welt, anonym nummeriert; kein Inhalt gelesen): Regeln und Zeitlinie 1,3–7,1 KB je Welt, ca. 400–2.100 Token. Preis grok-4.6 laut OpenRouter-Katalog 2 $ / 6 $ je 1 Mio. Token. Eigentümer wählte A.
- Umsetzung selbst: Teile `regel`/`zeitlinie` im Weltenbauer wie beim Schreiben; mypy verlangte eine Schleife über feste Literale statt `entry.category` als Bausteinart. Test: Wortlaut einmal, fremde Welt nicht, Reihenfolge der Bausteine.

### 2026-10-13 – [ERLEDIGT] 8.6 Kurzfassung nur mit dem Stand davor (ADR-085)

- Eigentümer wählte A. Selbst umgesetzt in `context/summaries.py`: Teil „handlungsstand“ aus den Kurzfassungen der Kapitel davor, gefüllt nach Kapiteltext, Rahmen und Anweisung; älteste fallen zuerst weg. Drei bestehende Tests prüften das alte Verhalten und wurden umgestellt (u. a. `test_summary.py`: Gesamtzusammenfassung jetzt ausdrücklich nicht in der Kapitel-Anfrage), drei neue.
- Reibung: ruff RUF002 an einem Gedankenstrich im Docstring; ein neuer Test setzte das Budget so klein, dass schon die Anfrage ohne Vorgeschichte nicht passte (200 → 320 Token).

### 2026-10-13 – [ERLEDIGT] 8.5 Bildvorlagen (ADR-084)

- Mockup vorher/nachher; Eigentümer wählte für Orte/Gegenstände und Karten die Empfehlung, beim Titelbild „Titel + Genre + Atmosphäre“ statt der empfohlenen Zusammenfassung. Hinweis gegeben: Genres wie „Dark Erotic“/„CNC“ stehen dann wörtlich in der Vorbelegung; Filter bleibt fest (ADR-077), Text wird vor dem Erzeugen gezeigt.
- Kleine Änderung selbst umgesetzt (kein Unteragent – weniger Aufwand als ein Auftrag): `entryPrompt`, `mapPrompt`, `coverPrompt` in `ui/src/imagePrompts.ts`; drei neue Tests. vitest 382 grün.

### 2026-10-13 – [ERLEDIGT] 8.4 Übernehmen ersetzt Abschnitte (ADR-083)

- Vorlage mit Mockup (vorher/nachher); Eigentümer wählte alle Empfehlungen: Rückfrage, Vorlage „Aussehen“ + „Wesen und Geschichte“, Geografie beim Entfernen nachfragen, beim Umbenennen mitziehen.
- Umsetzung durch Unteragenten (Sonnet) nach Auftrag; selbst geprüft: `sections.ts` gelesen, alle Prüfungen erneut (pytest 769, vitest 380). Abweichungen des Unteragenten: Kategorieprüfung in `context/appearance.py` statt im Flow (dort ist der Eintrag geladen); `onTakeOver` liefert jetzt `Promise<boolean>` (Abbrechen lässt den Dialog offen).
- Sichtprobe am lokalen Testserver mit Testdaten im Scratchpad; ohne gültigen lokalen Schlüssel die KI-Antwort im Browser per `fetch`-Ersatz gestellt. Reibung: erster Ersatz mit falschen Feldern im Abschluss-Ereignis (`token_in` statt `input_tokens`) – die Oberfläche brach mit `toLocaleString` ab; beim zweiten Versuch richtig. Hinweis: Die Oberfläche fängt fehlende Felder im Abschluss-Ereignis nicht ab – vom eigenen Server kommen sie immer, kein Schritt nötig.
- Offen, klein: Bei Figuren mit der alten Vorlage (leeres „## Aussehen“) zeigt die Bildvorlage weiter „noch kein Abschnitt ‚Aussehen‘“ – sprachlich schief, inhaltlich richtig.
- Eigentümer: „Passt, noch nicht einspielen“ – Server bleibt auf `27506c2`.

### 2026-10-13 – [ERLEDIGT] 8.3 Tests nachgeholt, Mindestwerte angehoben

- Zwei Unteragenten mit Sonnet parallel (Python unter `tests/`, Oberfläche unter `ui/src/`, getrennte Dateien). Python 734 → 765 Tests, 99,89 %; Oberfläche 289 → 345 Tests, Zeilen 98,71 %, Zweige 95,0–95,1 %. Selbst geprüft: ruff, mypy (128 Dateien), tsc, eslint, prettier, beide Testläufe; Stichprobe `test_without_provider.py` und `files.test.ts` – echtes Verhalten, keine reinen Zeilen-Berührungen.
- Beobachtung: Die Zweigabdeckung der Oberfläche schwankt zwischen Läufen um ca. 0,06 Punkte (95,01 / 95,07 %), vermutlich durch Fake-Timer-Tests; Tests selbst stabil grün. Schwelle deshalb mit Abstand (94 %).
- Mindestwerte angehoben (Kategorie 7, freigegeben mit ADR-080): `fail_under` 80 → 99; vitest 80/70 → Zeilen 98, Anweisungen 98, Funktionen 97, Zweige 94. Ratsche in `docs/project-context.md` Abschnitt 7. Der CI-Schritt „Coverage kritischer Pfade“ (90 % für `canon`, `context`) bleibt unverändert – liegt jetzt unter dem globalen Wert.

### 2026-10-13 – [ERLEDIGT] 8.2 Umbau der Kartenansicht

- Wieder an einen Unteragenten mit Sonnet abgegeben (Routine-Klasse). Ergebnis: `WorldMaps.tsx` 716 → 86 Zeilen; `MapViewer` 141 Zeilen mit drei eigenen Hooks (`useMapZoom`, `useMapMarking`, `useMapChange`) und vier Teilkomponenten; 16 neue Tests, `WorldMaps.tsx` Zweige 64,9 → 100 %.
- Selbst geprüft: tsc, eslint, prettier grün; vitest 289 grün (95,29 % / 91,95 %). Hinweis des Unteragenten zum Zurücksetzen des Namens beim Umbenennen am alten Code nachgeprüft – ohne sichtbare Folge. Playwright nur im Lauf des Unteragenten (11/11); die CI wiederholt es.

### 2026-10-13 – [ERLEDIGT] 8.1 Umbau des Kanon-Dienstes; ADR-082

- Warnung zu Beginn: 8.1 empfiehlt die Routine-Klasse, aktiv ist die Entscheidungs-Klasse (Wochenkontingent). Die Gliederung (ausgabelastig) ging an einen Unteragenten mit Sonnet (Routine-Klasse, Probelauf bestanden); Befund 6 und Doku blieben hier.
- Ergebnis: `canon/service.py` 878 → 349 Zeilen als Fassade; Teile `worlds`, `entries`, `maps`, `images`, `imports`, dazu `models`, `layout`, `headers`, `validation`. Selbst geprüft: Diff der Fassade, Reihenfolge in `delete_entry` (Datei, Bilder, Markierungen) wie vorher; pytest 734 grün ohne Änderung der Tests, 99 %; ruff, mypy, bandit ohne Befund. Abweichung des Unteragenten: `_Keep` heißt jetzt `Keep` (öffentlich in `models`, wie in `manuscript`) – nirgends von außen genutzt.
- Befund 6 enger als in der Bewertung: die Fehlertypen von `storage` sind seit 2.2 gemeinsamer Vertrag (`docs/architecture.md` Abschnitt 4). Ohne Vorlage entstanden waren nur Größengrenzen (7.6) und `inspect_image` (7.12) → ADR-082 `[REAKTIV]`, Option A (Karte), Reaktiv-Quote 1/10.

### 2026-10-13 – [ADR-ANGELEGT] ADR-080 Pflichtfrage nach Phase 7, ADR-081 Planung Phase 8

- ADR-080: gezielt umbauen (8.1–8.3), Bewertung der getrennten Instanz unverändert in `docs/research/bewertung-phase-7.md`, Stellungnahme daneben. ADR-081: Phase 8 mit 13 Schritten; 7.15 → V.33; V.20, V.21, V.23, V.24, V.33 → 8.13. Beide `[STRATEGISCH]`, auf der Entscheidungs-Klasse vorgelegt; Reaktiv-Quote 0/10.
