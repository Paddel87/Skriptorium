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

### 2026-10-08 16:02 UTC – [SESSIONENDE] 5.8 und 5.15 umgesetzt – Merge und Abnahme offen

- **Dauer:** 15:23 – 16:02 UTC.
- **Bearbeitet:** 5.15 mit 5.8 (Versuch 2) umgesetzt auf Branch `feat/5.15-nur-das-verlangte` (gepusht, kein Pull Request – nicht verlangt). Probeschreiben mit der Kette, verblindet bewertet. FR-012, Schnittstelle `…/write` (rein additiv `length`), CHANGELOG, README nachgezogen; Drift zu Versuch 1 im Fahrplan berichtigt.
- **Stand:** 5.7, 5.8, 5.15 `[IN ARBEIT]` – mehr als ein Eintrag gleichzeitig, Abweichung von `CLAUDE.md` Abschnitt 7: alle drei warten nur noch auf Merge, Deployment vom Mac und Abnahme des Eigentümers.
- **Offen / Fragen an den Eigentümer:** (1) Pull Request für `feat/5.15-nur-das-verlangte` öffnen und mergen? (2) Rest-Vorgriff (qwen verknüpft in Schritt 7 Buch und Grotte) hinnehmen oder weiterer Versuch? (3) Längenstufen 60–120 / 150–300 / 400–600 Wörter passend? Weiter offen: Kosten-Zeile (5.10), unübersichtliche Stellen (5.11), Werte der Listen (5.6); D.11 bis 2026-10-31.
- **Nächster Schritt:** nach Antwort: Pull Request und Merge; Session auf dem Mac: Deployment → Abnahme 5.7, 5.8, 5.15 in einer echten Welt; danach 5.9.
- **Modell-Bilanz:** Entscheidungs-Klasse (`claude-opus-5-5`, eingestellt und bedient, `get_session` 16:01). Schritte oberhalb der Empfehlung: 0 (5.8 und 5.15 empfohlen Entscheidung). Abgegeben: verblindete Bewertung der sechs Ketten an Sonnet – als getrennte Instanz, nicht aus Kostengründen. Sessionende-Einträge selbst geschrieben (kleiner Umfang, Kontext geladen).
- **Kontextgröße:** 288.070 Token (`get_session` 16:01), Grenze 200.000 – überschritten während der Auswertung (268.216 um 15:56); laufender Schritt zu Ende geführt, kein neuer begonnen. Neue Session nötig.
- **Kosten KI-Anbieter:** 0,41 $ (Ketten: grok-4.6 0,15 $, grok-4.7 0,17 $, qwen 0,08 $).
- **Sessionende-Prüfungen:** README „Nächste Schritte“ nachgezogen; Status-Block unverändert gültig (Phase 5, v0.1.0, Blocker 0). Drift: kein neuer ADR; Reaktiv-Quote 0/10; Modul-Liste und Reifegrade unverändert (keine Reifegrad-Wirkung); Blocker 0, kein `[BLOCKIERT]`; Phase 5 15 Schritte (Schwelle 26). Anforderung FR-012 nennt jetzt 3.4 und 5.15. Ablaufdaten: kein Vorlauf erreicht (nächste Nachprüfung mypy 2 am 2026-11-06). Logbuch ca. 320 Zeilen – keine Auslagerung. Nicht Quick-Start-relevant (keine neue Abhängigkeit, kein Skript). Alles committet und gepusht.

### 2026-10-08 16:00 UTC – [BEOBACHTUNG] 5.15/5.8: Kette mit neuen Vorgaben, verblindet bewertet

- **Umgesetzt:** Abschnitt „Vorgaben für deinen Text“ nach der Anweisung; Zukunfts-Satz im Rahmen; Regel „genau ausschreiben“ für die geführte Figur; „Weiter“ nur nächster Moment; Länge kurz/mittel/lang (`length`, Auswahl „Länge“). Läufe: `pytest` 427 bestanden, 99 % (`builder.py` 100 %); `vitest` 103, 98,68 % Zeilen; Playwright 8 (Chromium 1194 über `PLAYWRIGHT_CHROMIUM_EXECUTABLE`); pre-commit grün.
- **Ergebnis** (`spikes/vorgriff-zeitlinie/README.md`, zweiter Lauf): Anweisung zur eigenen Figur bei allen drei Modellen umgesetzt (vorher keines); gleiche 6-Wort-Folgen über die Kette 18–49 → 0; qwen 164–246 statt bis 815 Wörter, kein Zeitsprung bei „Weiter“; Vorgriffe 6 → 4; Kanon eindeutig 1 → 0, fraglich 4 → 4; Schlusssätze 9 → 10 (Warte- und Gestenschlüsse).
- **Reibungen:** Kleinstes Budget im Budget-Test von 1000 auf 1300 angehoben (Vorgaben ca. 200 Token). ruff RUF001 verbot Gedankenstriche im Prompt-Text – durch Kommas ersetzt statt Suppression. grok-4.7 lief in 2 von 7 Schritten dreimal in die Zeitüberschreitung (90 s bis zum ersten Textstück); Kette dadurch lückenhaft.

### 2026-10-08 15:23 UTC – [SESSIONSTART] Schritte 5.8 und 5.15 gemeinsam

- **Modell:** eingestellt und bedient `claude-opus-5-5` (`get_session`: `configured_model`, `session_context.model`, `last_served_model`) → Entscheidungs-Klasse.
- **Umgebung:** Cloud-Session (Ursprung iOS), kein SSH zum VPS – kein Deployment aus dieser Session (ADR-025, ADR-039). `OPENROUTER_API_KEY` gesetzt (73 Zeichen, Wert nicht angezeigt). Branch `feat/5.15-nur-das-verlangte` von `main` `f1cd6e5`.
- **Kontextgröße:** `get_session` meldet `used_tokens` 0 (beim Start nicht gefüllt); Fenster 1.000.000, Grenze 200.000.
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2. Keine aktiven Blocker; `[IN ARBEIT]`: 5.7 (Deployment vom Mac, Abnahme-Szene), 5.8 (Versuch 1).
- **Drift gefunden:** Fahrplan und Logbuch nennen Versuch 1 von 5.8 „nicht gemergt“; tatsächlich ist der Branch `scp/nice-lamport-as724t` mit PR #56/#57 vollständig in `main` (`builder.py`: Abschnitt „Anschluss“). Wird im Fahrplan berichtigt.
- **Vorhaben:** 5.8 und 5.15 gemeinsam (empfohlen Entscheidung – passt zur aktiven Klasse); Prüfung mit der Kette aus `spikes/vorgriff-zeitlinie/`.

### 2026-10-08 15:17 UTC – [SESSIONENDE] Nachtrag: Probeschreiben zu 5.15 und Entscheidungen des Eigentümers

- **Dauer:** 13:15 – 15:17 UTC (nach dem ersten Sessionende um 13:45 UTC auf ausdrückliche Bitte des Eigentümers weitergearbeitet – Abweichung von „Sessiongröße“, vermerkt).
- **Bearbeitet nach 13:45:** Schritt 5.15 angelegt (Befund des Eigentümers), Probeschreiben `spikes/vorgriff-zeitlinie/` (3 Ketten à 7 Vorschläge, 0,45 $), Entscheidungen des Eigentümers zu 5.15 per Auswahlfragen eingetragen. Kein Produktionscode geändert.
- **Stand:** 5.7 `[IN ARBEIT]` (Deployment vom Mac, Abnahme-Szene); 5.8 `[IN ARBEIT]` (Versuch 1 auf Branch `scp/nice-lamport-as724t`, nicht gemergt, kein Pull Request); 5.15 `[OFFEN]`, Eingangskriterien erfüllt.
- **Nächster Schritt:** neue Session: 5.8 und 5.15 gemeinsam umsetzen (Branch `scp/nice-lamport-as724t` als Grundlage), Prüfung mit derselben Kette, Vergleich mit `spikes/vorgriff-zeitlinie/ergebnisse/main-*`; Session auf dem Mac: Deployment → 5.7 abnehmen.
- **Modell-Bilanz:** Entscheidungs-Klasse (`claude-opus-5-5`, eingestellt und bedient, `get_session` 15:17). Schritte oberhalb der Empfehlung: 0. Abgegeben: verblindete Bewertung (Sonnet) als getrennte Instanz.
- **Kontextgröße:** 305.122 Token (`get_session` 15:17), Grenze 200.000 – überschritten auf Anweisung des Eigentümers.
- **Kosten KI-Anbieter gesamt:** ca. 1,13 $ (5.8: 0,68 $; 5.15: 0,45 $).
- **Sessionende-Prüfungen:** README „Nächste Schritte“ um 5.15 ergänzt, Status-Block unverändert gültig (Phase 5, v0.1.0, Blocker 0). Drift: kein neuer ADR; Reaktiv-Quote 0/10; Modul-Liste und Reifegrade unverändert; Blocker 0, kein `[BLOCKIERT]`; Phase 5 15 Schritte (Schwelle 26). Ablaufdaten: kein Vorlauf erreicht. Logbuch ca. 290 Zeilen – keine Auslagerung. Alles committet und gepusht.

### 2026-10-08 14:30 UTC – [BEOBACHTUNG] Entscheidungen des Eigentümers zu 5.15

- Per Auswahlfragen: eigene Figur – genau die Anweisung ausformulieren (Änderung an FR-012); Länge je Anfrage wählbar; „Weiter“ – kleiner Schritt, dann Übergabe; spätere Ereignisse als Zukunft kennzeichnen statt weglassen (kein neues Datenfeld). Eingetragen in 5.15; Umsetzung in neuer Session (Kontextgrenze).

### 2026-10-08 14:20 UTC – [BEOBACHTUNG] Probeschreiben an früher Stelle einer fertigen Geschichte (5.15, 5.8)

- **Anlass:** Eigentümer bat ausdrücklich, den Test in dieser Session selbst durchzuführen – Arbeit über der Kontextgrenze (Sessionende 13:45 UTC bei 226.445 Token) auf seine Anweisung, als Abweichung nach `CLAUDE.md` Abschnitt 0 („Sessiongröße“) vermerkt. Kein Produktionscode geändert.
- **Aufbau und Ergebnis:** `spikes/vorgriff-zeitlinie/README.md` – Testgeschichte mit erfundenem Ende in Zusammenfassung und Zeitlinie, Schreiben in der Mitte von Kapitel 1, Ketten zu 7 übernommenen Vorschlägen auf Stand `main` mit grok-4.6, grok-4.7, qwen3.8-max (Kosten 0,45 $).
- **Befunde:** (1) Wiederholung über die Kette bestätigt, am stärksten bei grok-4.6 (wörtlich gleicher Einstiegssatz in Schritt 5 und 7, Gesten 3–4×). (2) Vorgriff als Andeutung aus der Zusammenfassung bei allen Modellen; bei leerem „Weiter“ treibt qwen die Handlung weit voran; kein Durchlauf bis zum Ende. (3) Neu: Anweisungen zu Ilkas eigenem Handeln und Sprechen setzt kein Modell um (Figuren-Schreibweise) – Entscheidung des Eigentümers nötig. (4) Modelle nehmen den nächsten geplanten Schritt des Autors vorweg; grok-4.7 widerspricht danach per Hinweis-Zeile der Anweisung.
- **Reibung:** qwen-Kette brach an einer Zeitüberschreitung ab und wurde neu gestartet; Skript wiederholt Vorschläge nach Anbieter-Fehler jetzt bis zu zweimal.

### 2026-10-08 13:55 UTC – [BEOBACHTUNG] Befund des Eigentümers: KI läuft bis zum bekannten Ende, Einleitung und Atmosphäre schaukeln sich auf

- Eigentümer schrieb in einer importierten Welt an einer Stelle weit vor dem bekannten Ende. Die KI formulierte nicht nur seine Eingabe aus, sondern erzählte stark verkürzt bis zum bekannten Ende weiter. Vermutete Ursachen (Code-Lesung): ganze Gesamtzusammenfassung und ganze Zeitlinie im Kontext, keine Längen- oder Grenzvorgabe → neuer Schritt 5.15.
- Zweiter Befund: Nach sechs, sieben übernommenen Vorschlägen beginnt jeder Abschnitt mit derselben Einleitung und endet mit derselben Atmosphäre. Erklärt, warum Versuch 1 von 5.8 in der Testwelt kaum etwas zeigte (Einzelschritte statt Kette); Versuch 2 prüft eine Kette, in 5.8 notiert.
- Kein Code geändert: Kontextgrenze der Session überschritten (Sessionende 13:45 UTC); nur Fahrplan und Logbuch nachgetragen. Phase 5 jetzt 15 Schritte (Schwelle 26).

### 2026-10-08 13:45 UTC – [SESSIONENDE] 5.8 Versuch 1 – Wirkung nicht belegt, Kontextgrenze erreicht

- **Dauer:** 13:15 – 13:45 UTC.
- **Bearbeitet:** neuer OpenRouter-Schlüssel geprüft (gültig); 5.8 Versuch 1 umgesetzt (Rahmen, Abschnitt „Anschluss“, 6 neue Testfälle), Probeschreiben vorher/nachher mit 24 Texten, verblindete Bewertung durch getrennte Instanz.
- **Stand:** 5.8 `[IN ARBEIT]`, Branch `scp/nice-lamport-as724t` gepusht, **kein Pull Request** (nicht verlangt; Wirkung nicht belegt). 5.7 `[IN ARBEIT]` unverändert (Deployment vom Mac, Abnahme-Szene). Zwei Schritte gleichzeitig `[IN ARBEIT]` – Abweichung von `CLAUDE.md` Abschnitt 7, weil 5.7 nur noch auf den Eigentümer wartet.
- **Offen / Fragen an den Eigentümer:** (1) Ein echtes Beispiel für 5.8 – Ende eines Kapitels und eine Fortsetzung mit Einleitung/Schlusssatz (darf hier nicht ins öffentliche Repo, nur als Beschreibung oder lokal) – oder Entscheidung, Versuch 1 zu übernehmen und im Alltag zu prüfen. (2) Gilt ein Ende wie „Die Äbtissin wartete.“ (Übergabe an die geführte Figur) als unerwünschter Schlusssatz? Die Erinnerung zur Figuren-Schreibweise verlangt genau solche Enden. Weiter offen aus der Vorsession: Kosten-Zeile (5.10), unübersichtliche Stellen (5.11), Werte der Listen (5.6), Fehlerart bei abgelaufenem Schlüssel, MD024; D.11 bis 2026-10-31.
- **Nächster Schritt:** nach Antwort des Eigentümers 5.8 abschließen (übernehmen oder Versuch 2 an echtem Material); Session auf dem Mac: Deployment von `main` → 5.7 abnehmen; danach 5.9.
- **Modell-Bilanz:** Entscheidungs-Klasse (`claude-opus-5-5`, eingestellt und bedient, `get_session` 13:43). Schritte oberhalb der Empfehlung: 0 (5.8 empfohlen Entscheidung). Abgegeben: Bewertung der 24 Texte an eine getrennte Instanz (Sonnet) – als unabhängige Prüfung, nicht aus Kostengründen.
- **Kontextgröße:** 226.445 Token (`get_session` 13:43) – über der Grenze 200.000; überschritten während der Auswertung von 5.8, kein neuer Schritt und kein Versuch 2 begonnen.
- **Kosten der Probeläufe:** 0,68 $ (24 Läufe) plus Schlüssel-Abfrage.
- **Sessionende-Prüfungen:** README „Nächste Schritte“ um den Stand von 5.8 ergänzt; Status-Block unverändert (Phase 5, v0.1.0, Blocker 0). Drift: kein neuer ADR; Reaktiv-Quote 0/10 unverändert; Modul-Liste und Reifegrade unverändert (5.8 ohne Reifegrad-Wirkung); Blocker 0, kein `[BLOCKIERT]`; Phase 5 14 Schritte (Schwelle 26). Ablaufdaten: kein Vorlauf erreicht (nächste Nachprüfung mypy 2 am 2026-11-06). Logbuch ca. 260 Zeilen, project-context 343 Zeilen – keine Auslagerung. Alles committet und gepusht.

### 2026-10-08 13:44 UTC – [BEOBACHTUNG] 5.8 Probeschreiben: Wirkung des neuen Rahmens nicht belegt

- **Aufbau:** `spikes/nahtloser-anschluss/` – Testwelt Salzmark, Kapitel „Die Grotte“ an drei Stellen abgeschnitten, leere Anweisung, grok-4.6 und qwen3.8-max je 2 Läufe, alter und neuer Rahmen; Bewertung verblindet (T01–T24) durch Sonnet-Unteragent.
- **Zahlen (vorher → nachher, je 12):** Einleitung 4 → 3, Schlusssatz 4 → 5, Kanon eindeutig 3 → 5 / fraglich 8 → 9, Figuren-Schreibweise 5 → 1. Einleitungen fast nur an Stelle a (Dialogpause ohne neues Ereignis): 4/4 → 3/4.
- **Deutung:** Die Testwelt reproduziert den Befund des Eigentümers kaum; die Unterschiede liegen bei n = 12 im Rauschen. Akzeptanzkriterium „Mehrzahl ohne Einleitung und Schlusssatz“ war schon vorher erfüllt und taugt so nicht als Nachweis. „Kanon-Treue nicht schlechter“ ist nicht belegt (überwiegend qwen-Fehler, u. a. falsche Namen in beiden Varianten).
- **Reibungen:** Anbieter-Fehler 502 mitten im Strom brach den ersten Nachher-Lauf ab – Skript überspringt seither fertige Läufe und meldet Fehler, statt abzubrechen; eine Zeitüberschreitung (90 s bis zum ersten Textstück) bei qwen, Wiederholung lief. Ein Testfall mit Absatz ohne Leerzeichen (60.730 Token Zitat) zeigte, dass das Zitat zusätzlich auf 300 Zeichen begrenzt werden muss – behoben vor dem Probeschreiben. Kleinstes Budget im Budget-Test von 900 auf 1000 angehoben (fester Teil ca. 170 Token größer).
- **Läufe:** `pytest --cov` 416 bestanden, 99,79 %, `context/builder.py` 100 %; pre-commit grün.

### 2026-10-08 13:16 UTC – [SESSIONSTART] Neuer OpenRouter-Schlüssel, Schritt 5.8

- **Modell:** eingestellt und bedient `claude-opus-5-5` (`get_session`: `configured_model`, `session_context.model`, `last_served_model`) → Entscheidungs-Klasse.
- **Umgebung:** Cloud-Session (Ursprung Desktop-App), kein SSH zum VPS – kein Deployment aus dieser Session (ADR-025, ADR-039). Branch `scp/nice-lamport-as724t` auf Stand `main` `be92228`.
- **Kontextgröße:** `get_session` meldet `used_tokens` 0 (beim Start wieder nicht gefüllt); Fenster 1.000.000, Grenze 200.000.
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2. Keine aktiven Blocker; `[IN ARBEIT]`: 5.7 (wartet auf Deployment vom Mac und Abnahme-Szene).
- **Schlüssel:** Eigentümer meldet „openrouter key ist neu“. `OPENROUTER_API_KEY` gesetzt (73 Zeichen, SHA-256-Präfix `6d51b4c5`, Wert nicht angezeigt); `GET /api/v1/key` → HTTP 200, Ausgabengrenze 250 $, Verbrauch 0, gültig bis 2027-10-08.
- **Vorhaben:** 5.8 Nahtloser Anschluss (empfohlen Entscheidung – passt zur aktiven Klasse). 5.7 bleibt `[IN ARBEIT]`, bis vom Mac deployt und abgenommen ist; 5.8 hängt laut Fahrplan an 5.7, der Code von 5.7 ist aber gemergt, und das Probeschreiben läuft lokal mit der neuen Voreinstellung – Abhängigkeit für die Umsetzung erfüllt, nur die Abnahme beim Eigentümer steht aus.

### 2026-10-08 10:35 UTC – [SESSIONENDE] 5.7 umgesetzt und gemergt – Abnahme offen

- **Dauer:** 10:22 – 10:35 UTC (Container-Uhr; die Einträge 10:35 und 10:50 UTC oben tragen geschätzte Zeiten und liegen tatsächlich zwischen 10:25 und 10:32 UTC).
- **Bearbeitet:** 5.7 umgesetzt (ADR-044, PR #55, CI 8/8 grün); Merge auf Anweisung des Eigentümers („Merge, Session Ende“). Probe-Anfrage mit dem Schlüssel der Cloud-Umgebung: Voreinstellung grok-4.6 greift, Schlüssel abgelaufen (HTTP 401).
- **Stand:** 5.7 `[IN ARBEIT]` – fehlt Deployment vom Mac und die Szene des Eigentümers in einer echten Welt ohne Sperre. Kein Deployment in dieser Session (kein SSH aus der Cloud).
- **Offen:** neuer OpenRouter-Schlüssel für die Cloud-Umgebung (Eigentümer beschafft ihn); Fragen an den Eigentümer: Kosten-Zeile (5.10), unübersichtliche Stellen (5.11), Werte der Listen (5.6); Fehlerart bei abgelaufenem Schlüssel unterscheiden ja/nein (Nebenbefund); MD024 im Markdown-Linter auf Geschwister-Überschriften begrenzen ja/nein (Kategorie 7, sonst „Geändert (nach v0.1.0)“ im CHANGELOG). D.11 bis 2026-10-31.
- **Nächster Schritt:** Session auf dem Mac: `main` deployen (Runbook Abschnitt 7), Eigentümer schreibt Probe-Szene → 5.7 `[ERLEDIGT]`; danach 5.8 (Probeschreiben mit neuem Schlüssel), 5.9.
- **Modell-Bilanz:** Entscheidungs-Klasse (`claude-opus-5-5`, eingestellt und bedient, `get_session` 10:32). Schritte oberhalb der Empfehlung: 1 (5.7, empfohlen Routine; zu Beginn genannt). Abgegeben: nichts (kleiner Schritt mit geladenem Kontext; Abgabe hätte nicht gespart).
- **Kontextgröße:** 233.739 Token (`get_session` 10:32) – über der Grenze 200.000; überschritten erst während des Sessionendes, kein neuer Schritt begonnen.
- **Sessionende-Prüfungen:** README (Nächste Schritte, Erkundungs-Hinweis) nachgezogen, Status-Block unverändert gültig (Phase 5, v0.1.0, Blocker 0). Drift: ADR-044 → 5.7 vorhanden; Reaktiv-Quote 0/10 (ADR-035..044) stimmt mit Teil B; Modul-Liste und Reifegrade unverändert; Blocker 0, kein `[BLOCKIERT]`; Phase 5 14 Schritte (Schwelle 26). Ablaufdaten: kein Vorlauf erreicht (nächste Nachprüfung mypy 2 am 2026-11-06). Logbuch 230 Zeilen, project-context 343 Zeilen – keine Auslagerung. Keine uncommitteten Änderungen.

### 2026-10-08 10:50 UTC – [BEOBACHTUNG] OpenRouter-Schlüssel der Cloud-Umgebung abgelaufen

- Auf Hinweis des Eigentümers („Keys als Umgebungsvariable“): `OPENROUTER_API_KEY` ist gesetzt (73 Zeichen, Wert nicht angezeigt); ein SSH-Zugang zum VPS ist nicht dabei.
- Probe-Anfrage über den Standardweg (`prepare_request` → `stream_events`, Testwelt, Skript im Scratchpad): `start` meldet `x-ai/grok-4.6` (Voreinstellung aus 5.7 greift), danach `error` `nicht_erreichbar`. Einzelanfrage direkt an OpenRouter: HTTP 401 „API key expired“. OpenRouter selbst ist erreichbar (curl 200), Proxy und Zertifikate in Ordnung.
- Folge: Kein Probeschreiben aus der Cloud-Session möglich, bis ein gültiger Schlüssel in der Umgebung liegt (5.8 braucht Probeschreiben; 5.10 die Prüfung, ob Kosten gemeldet werden). Der Schlüssel des Produktivsystems ist davon getrennt und nicht geprüft.
- Nebenbefund: Die Oberfläche zeigt bei 401/402 dieselbe Fehlerart `nicht_erreichbar` wie bei einem Ausfall; die genaue Ursache steht nur in der Ausnahme-Meldung. Kein Schritt angelegt – dem Eigentümer genannt.

### 2026-10-08 10:35 UTC – [ADR-ANGELEGT] ADR-044 grok-4.6 als Voreinstellung

- `[ERKENNTNIS]`, keine Kategorie aus Abschnitt 4 (Modellwahl ist Konfiguration). Ersetzt das Startmodell aus ADR-010 und die Reihenfolge aus ADR-011; Status beider ergänzt. Reaktiv-Quote 0/10 über ADR-035 bis ADR-044.

### 2026-10-08 10:35 UTC – [BEOBACHTUNG] 5.7 umgesetzt – Abnahme offen

- **Code:** `ai_gateway/models.py` – `DEFAULT_MODELS` in der Reihenfolge grok-4.6 → grok-4.7 → qwen3.8-max-0902; `DEFAULT_MODEL` folgt daraus (`api/flows/writing.py`, nur Kommentar geändert).
- **Nebenwirkung, bewusst:** Auch die Kurzfassungen (3.6) laufen mit der Voreinstellung, also künftig grok-4.6; Geschichten ohne gespeichertes Modell wechseln mit. In ADR-044 und CHANGELOG genannt.
- **Tests:** `test_model_list` erwartet die neue Reihenfolge; Verbrauchs-Tests nutzen `DEFAULT_MODEL` statt fest grok-4.7; `test_story_keeps_its_model_and_writing_uses_it` speichert jetzt grok-4.7 an der Geschichte und prüft nach dem Zurücksetzen grok-4.6. End-to-End: Voreinstellung im Modell-Feld grok-4.6, Wechsel auf grok-4.7 übersteht das Neuladen.
- **Läufe:** `pytest --cov` 410 bestanden, 99,79 % (models.py 100 %); `vitest` 102 bestanden (unverändert); Playwright 8 bestanden (Chromium 1194 der Cloud-Session); `pre-commit run --all-files` grün.
- **Offen für `[ERLEDIGT]`:** CI grün, Merge, Deployment vom Mac (ADR-039, nur auf Anweisung) und Szene des Eigentümers in einer echten Welt ohne Sperre.

### 2026-10-08 10:24 UTC – [BEOBACHTUNG] Uhrzeiten der Vorsession zu spät

- Die Einträge der Vorsession tragen Zeiten bis 13:50 UTC, der Sessionende-Commit `b608e5e` ist aber auf 10:19:09 UTC datiert und diese Session startete laut `get_session` um 10:22 UTC. Die dortigen Uhrzeiten sind also um gut 3,5 Stunden zu spät (geschätzt, nicht gemessen); Reihenfolge und Inhalt bleiben gültig. Nicht nachträglich geändert. Ab hier stammen die Zeiten aus `date -u` im Container.

### 2026-10-08 10:24 UTC – [SESSIONSTART] Schritt 5.7

- **Modell:** eingestellt und bedient `claude-opus-5-5` (`get_session`: `configured_model`, `session_context.model`, `last_served_model`) → Entscheidungs-Klasse.
- **Umgebung:** Cloud-Session (Ursprung iOS), nicht der Mac des Eigentümers – kein SSH zum VPS, also kein Deployment aus dieser Session (ADR-025, ADR-039).
- **Kontextgröße:** `get_session` meldet `used_tokens` 0 (Wert beim Start offenbar nicht gefüllt); Fenster 1.000.000, Grenze laut project-context 200.000.
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2. Keine aktiven Blocker, kein `[IN ARBEIT]`.
- **Vorhaben:** 5.7 Startmodell grok-4.6 (empfohlen Routine; läuft auf Entscheidung, Abgabe lohnt nicht bei kleinem Schritt mit geladenem Kontext).

### 2026-10-08 13:50 UTC – [SESSIONENDE] Session 2026-10-08 abgeschlossen – Wiedereinstieg bei 5.7

- **Dauer:** 08:23 – 13:50 UTC. Ersetzt als Wiedereinstiegspunkt das Sessionende 13:20 UTC; dazwischen nur die Einträge 13:35 und 13:40 UTC.
- **Bearbeitet (Überblick):** Befunde aus der Nutzung aufgenommen; Pflichtfrage nach Phasen-Wucherung mit getrennter Instanz → B „gezielt umbauen“ (ADR-042); Neuplanung (Phase 5 mit 5.7–5.14, D.13, V.6–V.9, FR-027–FR-030); 4.8 erledigt, v0.1.0 als Vorabversion (ADR-043); Phase 4 abgeschlossen und archiviert; Antworten zu grok-4.7 (bleibt wählbar, Live-Liste in 5.12) und CI-Zwischenspeicher (nein). PRs #49–#53 gemergt. Kein Produktiv-Deployment in dieser Session (Server weiter auf `edc24ad`).
- **Wiedereinstieg:** Pflichtlektüre nach `CLAUDE.md` Abschnitt 2; dann **5.7 Startmodell grok-4.6** (`ai_gateway/models.py`: grok-4.6 zuerst, grok-4.7 danach, qwen3.8-max als Notfall-Reserve; Tests; ADR `[ERKENNTNIS]` zu ADR-010/011; Deployment nur auf Anweisung, ADR-039). Danach 5.8, 5.9, 5.10, 5.11.
- **Offene Fragen an den Eigentümer:** Kosten-Zeile (5.10), unübersichtliche Stellen (5.11), Knopf „In den Kanon“ nie gesehen oder unklar, Werte der Listen (5.6). Frist: D.11 bis 2026-10-31.
- **Modell-Bilanz:** Entscheidungs-Klasse (`claude-opus-5-5`, eingestellt und bedient, `get_session` 13:45). Schritte oberhalb der Empfehlung: 1 (Doku-Pflege zu Beginn). Abgegeben: Bewertung Phase 4 und Auswertung der CI-Logs an Sonnet 5.
- **Kontextgröße:** 464.445 Token (`get_session`), weit über der Grenze 200.000 – Abweichung auf ausdrückliche Anweisung („Hier weiter“, „Weiter“). Nächste Session neu beginnen.
- **Sessionende-Prüfungen:** README, Fahrplan und project-context stehen auf Phase 5 und v0.1.0; Drift seit 13:20 UTC nur in 5.7 (Text nachgezogen, kein neuer Schritt). Ablaufdaten: kein Vorlauf erreicht. Logbuch 180 Zeilen. Keine uncommitteten Änderungen.

### 2026-10-08 13:40 UTC – [BEOBACHTUNG] CI: kein Zwischenspeicher für Chromium

- Auf das Angebot, Chromium und die Systempakete in der CI zwischenzuspeichern oder einen Playwright-Container zu nutzen (Ausreißer 2026-10-08: 32,5 MB in 8 min 23 s statt 3 s): Eigentümer „Kein Zwischenspeicher“. Pipeline bleibt unverändert; einzelne langsame Läufe werden hingenommen. Kein Schritt angelegt.

### 2026-10-08 13:35 UTC – [BEOBACHTUNG] 5.7: grok-4.7 bleibt wählbar, Modelle später live

- Auf die Frage „grok-4.7 nach hinten oder ganz heraus?“: Eigentümer will die Modelle „live abrufen, wie bei OpenRouter geplant“. Nachfrage per Frage-System, ob 5.12 vor den Umbau rückt: „Reihenfolge lassen“. Folge für 5.7: nur die Voreinstellung wechselt auf grok-4.6, grok-4.7 bleibt in der festen Liste wählbar, bis 5.12 die Live-Liste bringt. In 5.7 eingetragen.
- PR #52 gemergt (`2451d6d`) auf „Ja mergen“ nach grüner CI (8/8).

### 2026-10-08 13:20 UTC – [SESSIONENDE] Phase 4 abgeschlossen, v0.1.0

- **Dauer:** 08:23 – 13:20 UTC (Sessionende 12:40 UTC war ein Zwischenstand; auf „Weiter“ des Eigentümers fortgesetzt, Kontext über der Grenze nach „Hier weiter“).
- **Bearbeitet:** 4.8 `[ERLEDIGT]`: Entscheidung A „Vorabversion“ (ADR-043), v0.1.0 in `pyproject.toml`, `package.json`, `uv.lock`, `package-lock.json`, CHANGELOG, README-Badge, project-context (`fb912f4`). 5.14 Go-Live-Prüfung angelegt (Phase 5: 14 Schritte). Phase 4 archiviert (`docs/archiv/fahrplan-phase-4.md`), Logbuch verdichtet (`docs/archiv/logbuch-phase-4.md`). Onboarding-Validierung ohne Befund. PR #51 gemergt (Guthaben gestrichen). CI-Dauer erklärt: einmaliger Ausreißer beim Download von Chromium-Paketen (64,6 kB/s statt 9,4 MB/s); Abhilfe (Zwischenspeicher oder Playwright-Container) dem Eigentümer angeboten, Antwort offen (Kategorie 7).
- **Offen:** D.11 bis 2026-10-31; Fragen an den Eigentümer: Stellung von grok-4.7 (5.7), Kosten-Zeile (5.10), unübersichtliche Stellen (5.11), Werte der Listen (5.6), CI-Zwischenspeicher ja/nein.
- **Nächster Schritt:** neue Session, 5.7.
- **Modell-Bilanz:** Entscheidungs-Klasse (`claude-opus-5-5`). Schritte oberhalb der Empfehlung: 0 (4.8 und Phasenabschluss Entscheidung). Abgegeben: Auswertung der CI-Logs an Sonnet 5 (Lesearbeit, Ergebnis stichprobenartig geprüft: „Fetched 32.5 MB in 8min 23s“).
- **Kontextgröße:** über 300.000 Token (`get_session` 12:30: 309.609) – Abweichung nach „Hier weiter“/„Weiter“.
- **Sessionende-Prüfungen:** README (Phase, Version, Nächste Schritte) nachgezogen. Drift: ADR-043 → 4.8, 5.14 vorhanden; Reaktiv-Quote 0/10 über ADR-034..043; Modul-Liste und Reifegrade unverändert; Blocker 0; Phase 5 14 von 13 (Schwelle 26 und +5). Ablaufdaten: kein Vorlauf erreicht. Archivierung: Phase 4 vollständig erledigt → Fahrplan und Logbuch ausgelagert.

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
