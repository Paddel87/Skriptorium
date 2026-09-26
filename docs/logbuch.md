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

Das Logbuch beginnt mit der ersten regulären Session nach dem Initialisierungs-Commit (Modus 2, abgeschlossen 2026-09-26). Verlauf und Begründungen der Initialisierung stehen in `docs/decisions.md` (ADR-001 bis ADR-009).

---

<!-- ANCHOR:eintraege -->
## Einträge (neueste oben)

### 2026-09-26 18:10 – [BEOBACHTUNG] 1.1 Nachtest grok ohne Reasoning

- grok-4.6/4.5: Reasoning ebenfalls Pflicht. grok-4.3 und grok-4.20 lassen es abschalten → 12 Läufe, erstes Textstück < 1 s, 0 Ablehnungen.
- Blind-Bewertung mit zwei Eichtexten aus Runde 1: beide identisch wiederbewertet (0 bzw. 6) – Bewertung über Runden vergleichbar.
- Ergebnis je 1.000 Wörter: grok-4.7 1,5; gemini 2,6; glm 3,9; grok-4.3 4,5; deepseek 4,6; grok-4.20 5,1. Ohne Reasoning kein Treue-Vorsprung → Zielkonflikt Reaktionszeit vs. Kanon-Treue geht an den Eigentümer.
- Nebenbefund: zweite identische Anfrage bei xAI deutlich billiger (Zwischenspeicher) – Folge für die Reihenfolge im Kontext-Verfahren (Festes vorn), im Erkenntnisdokument vermerkt.

### 2026-09-26 17:40 – [BEOBACHTUNG] Weiterarbeit trotz überschrittener Sessiongröße

- Eigentümer: „Du ignorierst jetzt die Beschränkung und machst hier weiter." – Ausnahme „weiter hier" nach CLAUDE.md Abschnitt 0 („Sessiongröße"); Abweichung hiermit vermerkt. Kontext zu diesem Zeitpunkt ca. 275.000 Token.
- Fortsetzung von 1.1 ohne Zutun des Eigentümers: Test von grok-Varianten mit abschaltbarem Reasoning (Reaktionszeit).

### 2026-09-26 17:30 – [SESSIONENDE] Grenze der Sessiongröße überschritten

- **Dauer:** ca. 14:56–17:30 UTC.
- **Bearbeitet:** Phase 1 begonnen; Schritt 1.1 `[IN ARBEIT]`: Schlüssel-Bereitstellung geklärt (`KEY`), erfundene Testwelt und Prüfliste, Harness, 24 Läufe (0,37 $), Blind-Bewertung, Sichtung der Nutzungsbedingungen, Zwischenstand in `docs/research/modell-eignungstest.md`.
- **Erreichter Stand:** grok-4.7 mit Abstand am kanontreuesten (7 Widersprüche gegenüber 19–28), aber 15–50 s bis zum ersten Textstück (Ziel 5 s); Budget 8k–17,6k ohne messbaren Unterschied; alle Modelle im Kostenrahmen.
- **Offen:** Filter-Probe (Rückfrage an den Eigentümer: welche Art von Inhalten wurde früher abgelehnt?), Ablehnungsverhalten, Stichprobe der Bewertung durch den Eigentümer, Entscheidung zu Startmodell/Ausweichmodell/Budget als `ENTSCHEIDUNG ERFORDERLICH` bzw. ADR `[ERKENNTNIS]`.
- **Nächster Schritt:** neue Session – 1.1 fortsetzen (Filter-Probe), parallel 1.3 möglich.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage). Schritte oberhalb der Empfehlung: 0 (1.1 empfiehlt Entscheidung). Abgegebene Teilarbeiten: 4 Bewertungs-Instanzen und 1 Recherche-Instanz, alle auf derselben Klasse (niedrigere Klassen ohne Probelauf nicht zulässig); Routine-Teilarbeiten (Logbuch, README) blieben in der aktiven Klasse, weil der Kontext geladen war.
- **Kontextgröße:** 273.042 Token laut Sitzungsabfrage (Grenze 200.000) – überschritten, deshalb Abschluss ohne neuen Schritt. Die Sitzungsabfrage meldete zu Sessionbeginn 0 und aktualisierte sich erst spät; die Grenze wurde deshalb erst nach der Auswertung bemerkt. Sitzungskosten laut Abfrage ca. 10 $.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, nächste Schritte, Research-Verweis). Drift-Prüfung: keine neuen ADRs, Modulnamen unverändert, keine Blocker, Phase 1 weiter 4 Schritte (Schwelle nicht berührt). Ablaufdaten-Register: kein Vorlauf erreicht (Guthaben-Vorlauf ab 2026-10-22). Größen-Budget `project-context.md` eingehalten (ca. 300 Zeilen).

### 2026-09-26 17:15 – [BEOBACHTUNG] 1.1 Zwischenstand: Bewertung und Nutzungsbedingungen

- Blind-Bewertung der 24 Texte abgeschlossen (4 Prüf-Instanzen). Kanon-Widersprüche: grok-4.7 7, gemini-3.8-flash 19, glm-5.3 24, deepseek-v4-pro 28. Figuren-Schreibweise verletzt nur von deepseek (9) und glm (2). Mechanische Gegenprobe „Totenname nachts" deckungsgleich mit den Prüf-Instanzen.
- Budget-Stufen 8k/14k/17,6k ohne messbaren Unterschied (29/25/24).
- Reibung: Prüf-Instanzen zählten K12 (Eid-Inhalt bei Mitnahme des Buchs) uneinheitlich – Auswertung zusätzlich ohne K12 ausgewiesen; Reihenfolge unverändert. Lehre für künftige Prüflisten: Grenzfälle mit Beispiel vorab festlegen.
- Nutzungsbedingungen gesichtet (xAI am weitesten, Z.ai/StreamLake am engsten; StreamLake darf Eingaben zum Training nutzen).
- Erkenntnisdokument `docs/research/modell-eignungstest.md` als Zwischenstand; Kostenregister nachgezogen. Offen: Filter-Probe (Antwort des Eigentümers), Reaktionszeit grok-4.7 (15–50 s vs. Ziel 5 s), Stichprobe durch den Eigentümer, ADR.

### 2026-09-26 16:30 – [PROBLEM-GELÖST] Läufe 1.1: Pflicht-Reasoning bei drei Modellen

- Testwelt „Die Salzmark" angelegt (29 Kanon-Dateien inkl. Zeitlinie – im Commit-Text stand irrtümlich 27), Prüfliste vor dem ersten Lauf fixiert. Harness `spikes/modell-eignungstest/lauf.py` nur mit Standardbibliothek (`urllib`), damit keine neue Abhängigkeit nötig ist.
- Kalibrierung: Schätzung 3,3 Zeichen je Token traf `prompt_tokens` bei deepseek-v4-pro fast genau (7.869 geschätzt / 7.887 gemessen). Material reicht nur bis ca. 17.600 Token; die Stufe „30.000" enthält daher alles Material (ca. 17.600) – Grenze im Erkenntnisdokument benennen.
- Reibung: `reasoning: {enabled: false}` wird von glm-5.3, grok-4.7 und gemini-3.8-flash mit HTTP 400 „Reasoning is mandatory" abgelehnt (18 Fehlläufe, 0 $). Lösung: für diese drei `reasoning: {effort: low}`; im Ergebnis je Lauf vermerkt. Folge für `ai_gateway`: Reasoning-Steuerung muss je Modell konfigurierbar sein.
- 24 Läufe (4 Modelle × 3 Stufen × 2 Wiederholungen) erfolgreich, 0 Ablehnungen, Gesamtkosten 0,37 $. grok-4.7 braucht durch Pflicht-Reasoning 15–50 s bis zum ersten Textstück (NFR: 5 s).
- Kleine Panne: Bewertungs-Auftrag an den ersten Prüf-Agenten enthielt einen nicht ersetzten Platzhalter für die Textliste; per Nachricht korrigiert.
- Reibung: Der `pre-commit`-Hook ist in der Cloud-Session nicht installiert (`.git/hooks` leer); markdownlint lief nur von Hand und hätte die Modell-Rohtexte (`.md`) in CI angemahnt (MD041). Lösung: Rohtexte als `.txt` abgelegt. Offen: Hook-Installation beim Sessionstart – Landeplatz Schritt 2.1 (Projektgerüst und volle CI-Gates).
- Bewertung blind: Texte anonymisiert (Zuordnung nur im Scratchpad), vier Prüf-Agenten der Entscheidungs-Klasse parallel.

### 2026-09-26 15:35 – [BEOBACHTUNG] Guthaben des Coding-Agents

- Eigentümer: eingelöstes Guthaben 250 $, davon 193 $ übrig, gültig bis 2026-11-05 08:59 MEZ; die Cloud-Sessions laufen darüber. Die Sitzungsabfrage meldet `isUsingOverage: false` und zum Guthaben nichts – Angabe des Eigentümers ist die Quelle.
- Nachgetragen in `docs/project-context.md` Abschnitt 6 (Bezugsmodell) und Abschnitt 8 (Ablaufdaten-Register, Vorlauf 2 Wochen).
- Folge für 1.1: Die Kontingent-Warnung aus dem Sessionstart ist entschärft; die Testwelt wird jetzt geschrieben.

### 2026-09-26 15:25 – [BEOBACHTUNG] 1.1 begonnen mit erfundenen Testdaten

- Festlegung des Eigentümers: Sein Welt-Material kann in der Arbeitsumgebung nicht verwendet werden; die KI erfindet Testwelt, Kanon-Auszug, Handlungsstand und Szene. Eingangskriterium im Fahrplan entsprechend geändert, STOPP aufgelöst, 1.1 auf `[IN ARBEIT]`.
- Grenzen der Aussagekraft (im Fahrplan vermerkt): Kanon-Treue wird gegen erfundenen Kanon gemessen; Filterverhalten hängt davon ab, wie nah die Szene an den früher abgelehnten Inhalten liegt – dazu Rückfrage an den Eigentümer gestellt (welche Art Inhalte wurde abgelehnt?).
- Vorarbeit: Modell-Liste von OpenRouter erneut abgerufen (458 Modelle, wie am Vormittag); Kandidaten ohne OpenRouter-Moderation mit Preisen vorausgewählt (Details folgen in `docs/research/modell-eignungstest.md`).

### 2026-09-26 15:10 – [PROBLEM-GELÖST] OpenRouter-Schlüssel gefunden

- Eigentümer: Der Schlüssel liegt in der Umgebungsvariable `KEY`, nicht in `OPENROUTER_API_KEY`.
- Geprüft ohne Wertausgabe: gesetzt, Länge 73, OpenRouter-Präfix vorhanden. Abfrage `/api/v1/key`: Ausgabengrenze 5 $, verbraucht 0 $, keine Zurücksetzung der Grenze, kein Gratis-Kontingent.
- Reibung: Der Eigentümer hatte zuerst den Namen „Open Router Key“ versucht; die Umgebungs-Konfiguration hat ihn abgelehnt. Wahrscheinliche Ursache: Namen von Umgebungsvariablen dürfen keine Leerzeichen enthalten; `OPENROUTER_API_KEY` (Großbuchstaben, Unterstriche) sollte angenommen werden. Nicht selbst geprüft, da die Konfiguration nur dem Eigentümer zugänglich ist.
- Beobachtung: Der Name `KEY` ist unspezifisch. Für den Wegwerf-Code aus 1.1 wird er so gelesen; welcher Variablenname im Produkt gilt, entscheidet Schritt 3.1 (`.env.example`).
- Eingangskriterium 1 von 1.1 erfüllt; die Testszene fehlt weiter, STOPP bleibt bestehen.

### 2026-09-26 15:00 – [BEOBACHTUNG] Eingangskriterien 1.1 nicht erfüllt – STOPP (Informationslücke)

- Geprüft: Umgebungsvariable `OPENROUTER_API_KEY` ist in der Cloud-Umgebung **nicht gesetzt** (nur Vorhandensein geprüft, kein Wert ausgegeben). Keine andere Variable mit Bezug zu OpenRouter vorhanden.
- Testszene (Ort, Figuren, Ziel) mit Kanon-Auszug liegt nicht vor.
- Bereitstellungsweg für den Schlüssel ist im Fahrplan als `[TBD]` offen. Vorschlag an den Eigentümer: Umgebungsvariable `OPENROUTER_API_KEY` in den Einstellungen der Cloud-Umgebung; wirkt erst in einer neuen Session.
- Folge: 1.1 bleibt `[OFFEN]`, STOPP nach CLAUDE.md Abschnitt 8, Kriterium 1; STOPP-Block im Fahrplan „Aktueller Stand" hinterlegt. 1.2 braucht ebenfalls Material des Eigentümers (Exporte); 1.3 ist ohne Zutun beginnbar.

### 2026-09-26 14:56 – [SESSIONSTART] Auftrag: Schritt 1.1

- **Modell:** eingestellt `claude-opus-5-5`, bedient `claude-opus-5-5` → Entscheidungs-Klasse (Quelle: Sitzungsabfrage `get_session`). Empfohlene Klasse für 1.1: Entscheidung – keine Abweichung.
- **Kontextgröße:** Sitzungsabfrage meldet `used_tokens: 0` bei `max_tokens: 1.000.000` – Wert offensichtlich nicht aktuell; Größenregel wird mit Vorbehalt angewendet.
- **Kontingent:** Wochenlimit Status `allowed_warning` (Zurücksetzung So 2026-09-27 10:00 MESZ) – Hinweis an den Eigentümer.
- **Einstieg:** erster regulärer Sessionstart nach Modus 2; kein vorheriger `[SESSIONENDE]`-Eintrag. Mindest-Lektüre vollständig durchlaufen.

<!-- ANCHOR:eintragstypen -->
## Eintragstypen (Übersicht)

Verbindliche Typen, andere nur in Ausnahmefällen:

| Typ | Wann | Pflicht? |
|---|---|---|
| `[SESSIONSTART]` | Zu Beginn jeder Session | Ja |
| `[SESSIONENDE]` | Vor Sessionabschluss | Ja |
| `[PROBLEM-GELÖST]` | Nach Behebung eines Problems, das Reibung war | Empfohlen, alle Mini-Probleme erfassen |
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
