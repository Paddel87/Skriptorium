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

Das Logbuch beginnt mit der ersten regulären Session nach dem Initialisierungs-Commit (Modus 2, abgeschlossen 2026-09-26). Verlauf und Begründungen der Initialisierung stehen in `docs/decisions.md` (ADR-001 bis ADR-009). Phasen 1 bis 3 sind verdichtet; Details in `docs/archiv/logbuch-phase-1.md`, `docs/archiv/logbuch-phase-2.md` und `docs/archiv/logbuch-phase-3.md`.

---

<!-- ANCHOR:eintraege -->
## Einträge (neueste oben)

### 2026-10-08 09:35 UTC – [BEOBACHTUNG] Wunsch Austausch mit SillyTavern: Character Cards und Welten

- **Wunsch des Eigentümers:** Character Cards aus SillyTavern importieren können oder das System allgemein mit ihnen kompatibel machen; dann ließen sich Figuren und vielleicht auch ganze Welten aus dem Internet herunterladen. Ziel: Interoperabilität. Der Eigentümer kennt die Formate nach eigener Aussage nicht im Detail.
- **Einordnung (KI, ohne Entscheidung; Formatkenntnis aus dem Training, nicht gegen die Spezifikation geprüft):** Character Cards sind JSON-Daten, oft in ein PNG-Bild eingebettet (Spezifikation „Character Card V2“, neuer V3). Sie enthalten Felder wie Name, Beschreibung, Persönlichkeit, Szenario, erste Nachricht und Beispieldialoge und können ein eingebettetes Lorebook („character book“) tragen. Welten entsprechen in SillyTavern den Lorebooks/World Info, gespeichert als JSON (`docs/research/bestandspruefung.md`, Abschnitt SillyTavern). Ein Teil der Felder ist auf Chat-Rollenspiel zugeschnitten (erste Nachricht, Beispieldialoge, Szenario) und passt nicht zum Kanon. Die Vision lehnt den Chat-/Rollenspiel-Fokus ab (Vision 8), den Austausch von Daten aber nicht.
- **Zwei Wege mit sehr verschiedener Tragweite:** (a) Import (ggf. später Export) als weiteres Eingangsformat in `canon.importers`, analog V.4 (TypingMind) und V.5 (Notion). Datenmodell bleibt, Kategorie 4 nur für das Eingangsformat (ADR-012). (b) „System auf Kompatibilität umschreiben“, also das eigene Datenmodell an Character Cards und Lorebooks angleichen. Das wäre eine Datenmodell- und Architekturänderung (Kategorien 1 und 4) am Kern (ADR-003, Markdown-Dateien als Quelle der Wahrheit). Erster Eindruck: (a) liefert die Interoperabilität mit Bruchteil des Aufwands.
- **Zu beachten:** Heruntergeladene Karten sind Dateien aus fremder Quelle. Das Einlesen von PNG und JSON ist sicherheitsrelevant (Kategorie 6, Prüfung durch getrennte Instanz). Fremde Karten können eigene Nutzungsbedingungen tragen, die der Eigentümer selbst prüft. SillyTavern bleibt als Code-Basis ausgeschlossen (ADR-004); das betrifft das Datenformat nicht.

Landeplatz: als Eingabe der Neuplanung im STOPP-Block von Phase 4; Bezug V.4/V.5 und 5.5.

### 2026-10-08 09:20 UTC – [BEOBACHTUNG] Oberfläche schwer zu überblicken; Wunsch KI-gestützter Weltenbauer mit Internet-Wissen

- Offene Fragen aus 09:05 UTC (Kosten-Zeile, Vision-Abgleich Chat-Ansicht) beantwortet der Eigentümer später; er ist unterwegs.
- **Oberfläche insgesamt schwer zu überblicken:** Laut Eigentümer wird die Bedienung schon mit wenigen Welten unübersichtlich, nicht erst mit vielen. Noch ohne konkrete Stellen. Welche Seiten und Abläufe betroffen sind, wird bei der Neuplanung erfragt. Bezug: FR-022 (Einstieg ohne Hilfe), 4.15 (Bedienhinweise), Vision 8 („überladene Oberfläche bewusst nicht übernehmen“).
- **Wunsch KI-gestützter Weltenbauer:** Figuren, Welten, Regeln, Gegenstände mit Verwendung und Auswirkung im Gespräch mit der KI definieren statt per Hand oder Import. Für Gegenstände (ggf. auch andere Kategorien) soll die KI tatsächliche Anwendung und Handhabung aus dem Internet einbeziehen, damit alltagsbekannte Gegenstände nicht jedes Mal von Hand erklärt werden müssen. Das würde die Import-Prompts (`docs/import-prompts.md`) weitgehend überflüssig machen. Ausdrücklich **nicht** gewünscht: den Import streichen.
- Einordnung (KI, ohne Entscheidung): Die Vision schließt einen Weltenbauer nicht aus (Abschnitt 5). Er wäre ein neues Feature mit neuem Ablauf und wahrscheinlich neuem Modul oder neuer Verantwortung (`CLAUDE.md` Abschnitt 4 Kategorie 1/2). Internet-Wissen bedeutet eine neue externe Abhängigkeit (Suchdienst oder Websuche über den KI-Anbieter, Kategorie 3) mit eigenen Kosten (Kostenrahmen 50 €). Weil der Kanon verbindlich ist (FR-011), müssten KI-Vorschläge vor der Übernahme vom Autor bestätigt werden, wie bei der Import-Vorschau. Berührt 5.1 (Kanon-Vorschläge ohne `@`) und 5.5 (Planung der nächsten Ausbaustufe). Größe eher eine eigene Phase als ein Schritt in Phase 4.

Landeplatz: beide als Eingaben der Neuplanung im STOPP-Block von Phase 4.

### 2026-10-08 09:05 UTC – [BEOBACHTUNG] Wunsch Eingabe-Verlauf als umschaltbare Ansicht; Kosten je Vorschlag fehlen

- **Gesamturteil des Eigentümers:** Die Manuskript-Ansicht als reiner Fließtext ist „schon mal nicht schlecht“. Einleitungs- und Schlusssätze (Befund 08:35 UTC) sind ärgerlich, weil sie beim Redigieren geprüft werden müssen.
- **Wunsch Eingabe-Verlauf:** Ihm fehlt der Verlauf seiner Anweisungen, wie er ihn aus TypingMind kennt. Bekräftigt: Die Anweisungen gehören **nicht** ins Manuskript (FR-012: „Der Wechsel ist das Manuskript“). Gewünscht ist eine bei Bedarf umschaltbare Ansicht Chat (Autor ↔ KI) / Manuskript. Bedingung des Eigentümers: Alte Anweisungen werden beim Weiterschreiben **nicht** erneut an die KI geschickt (Token sparen, Vision 4). Befund im Code: Anweisungen werden heute nirgends gespeichert (nur in `api/writing_routes.py` und `api/flows/writing.py` durchgereicht); `manuscript` und `storage` kennen sie nicht. Ein Verlauf bräuchte also neue gespeicherte Daten (Datenmodell, `CLAUDE.md` Abschnitt 4 Kategorie 4) und eine neue Ansicht in `ui`. Abgleich nötig mit Vision Abschnitt 5/8 („Chat-Fokus bewusst nicht übernehmen“, „kein Chat getrennt vom Manuskript“, requirements Abschnitt „offene Fragen“ Nr. 2). Ein Verlauf nur zum Ansehen, der nicht in die Anfrage eingeht, widerspricht dem nach erstem Eindruck nicht, ist aber eine Entscheidung des Eigentümers. Neues Feature, freigabepflichtig.
- **Kosten je Vorschlag fehlen:** Unter dem Vorschlag sieht der Eigentümer Eingabe- und Ausgabe-Token, aber keine Kosten. Befund im Code: Die Kosten werden bei OpenRouter angefragt (`"usage": {"include": True}` in `ai_gateway/openrouter.py`) und angezeigt, wenn sie gemeldet werden (`describeUsage` in `ui/src/views/WritingPanel.tsx`: „Kosten … $“, sonst „Kosten nicht gemeldet“). Die Verbrauchsdaten für Oktober enthalten eine Summe von 0,13 $, also kamen zumindest manche Kosten an. Ob die Zeile beim Eigentümer „Kosten nicht gemeldet“ zeigt oder ganz fehlt, ist erfragt; Ursache offen.

Landeplatz: beide als Eingaben der Neuplanung im STOPP-Block von Phase 4.

### 2026-10-08 08:50 UTC – [BEOBACHTUNG] Einleitungs- und Schlusssätze bei qwen und grok

- Nachtrag zu Befund 2 (08:35 UTC), Eigentümer: tritt „sowohl mit qwen als auch mit grok“ auf (welche grok-Version, ist nicht genannt). Damit liegt die Ursache eher nicht an einem Modell. Die Vermutung „Rahmen verlangt keinen nahtlosen Anschluss“ wird gestützt, ist aber weiter nicht belegt. Ein Probeschreiben mit Rahmen-Ergänzung sollte beide Modelle abdecken.

### 2026-10-08 08:40 UTC – [SESSIONENDE] Befunde aus der Nutzung festgehalten

- **Dauer:** 08:23 – 08:40 UTC.
- **Bearbeitet:** zwei Befunde des Eigentümers (Scrollen beim Wiedereinstieg; Einleitungs- und Schlusssätze der KI) am Code nachvollzogen, im Logbuch und im STOPP-Block von Phase 4 festgehalten. Kein Code geändert.
- **Offen / nächster Schritt:** unverändert Neuplanung Phase 4 mit dem Eigentümer (jetzt drei Befunde), dann 4.8 abschließen; D.11 bis 2026-10-31.
- **Modell-Bilanz:** Entscheidungs-Klasse (`claude-opus-5-5`, eingestellt und bedient). Schritte oberhalb der Empfehlung: 1 (Doku-Pflege, Routine). Abgegeben: nichts (Kontext geladen, Einträge kurz).
- **Kontextgröße:** nicht feststellbar (`used_tokens` 0).
- **Sessionende-Prüfungen:** README „Nächste Schritte“ war veraltet (4.8 als offen, D.11 „vor dem ersten echten Kapitel“) – nachgezogen. Drift zwischen Pflicht-Dokumenten: keine Änderung an ADRs, Modulen, Reifegraden, Blockern; Phase 4 weiter 16 Schritte (keine neuen angelegt). Ablaufdaten: Guthaben-Vorlauf ab 2026-10-22, noch nicht erreicht. Logbuch über 800 Zeilen – Auslagerung weiter nicht möglich (siehe Sessionende 04:00 UTC). Quick-Start unberührt.

### 2026-10-08 08:35 UTC – [BEOBACHTUNG] Befunde aus der Nutzung: Scrollen beim Wiedereinstieg, Einleitungs- und Schlusssätze der KI

Angaben des Eigentümers nach dem Schreiben echter Texte; beide in der Cloud-Session am Code nachvollzogen, nicht auf der Produktion (kein SSH-Zugang von hier, ADR-025).

1. **Wiedereinstieg erfordert Scrollen durch das ganze Manuskript.** Beim Öffnen einer gespeicherten Geschichte muss bis ganz nach unten gescrollt werden, um weiterzuschreiben; bei langen Geschichten mühsam. Ursache im Code: Der Editor (`ui/src/views/ManuscriptEditor.tsx`, Klasse `.editor` in `ui/src/styles.css`) hat nur `min-height: 20rem`, keine Höhenbegrenzung und keinen Sprung ans Ende – er wächst mit dem ganzen Kapiteltext; der Schreib-Bereich (`WritingPanel`) steht darunter (`ChapterEditor.tsx`). Je länger das Kapitel, desto weiter liegt das Anweisungsfeld unten. Bezug: FR-022 (Einstieg), FR-019 (Smartphone – dort noch stärker).
2. **Jede Fortschreibung beginnt mit einer kleinen Einleitung und endet mit einem ähnlich klingenden Schlusssatz.** Die KI stellt Ort und Lage neu vor und rundet ab, als wäre jeder Teil ein eigenständiges, wieder einstiegsfähiges Stück – unpassend für einen laufenden Text. Befund im Code: Der Rahmen (`_frame` in `src/skriptorium/context/builder.py`) sagt nur „Co-Autor einer Geschichte“; nirgends steht, dass nahtlos an den letzten Satz der „Letzten Manuskript-Seiten“ anzuschließen ist, ohne Wiederholung von Ort, Lage oder Figuren und ohne abschließenden Satz. Die Anweisung steht nach den letzten Seiten am Ende der Anfrage. Ursache damit **vermutet**, nicht belegt: Welche Modelle betroffen sind (qwen3.8-max nach dem Modellwechsel vom 2026-10-08, grok-4.6?) und ob eine Rahmen-Ergänzung wirkt, ist nur mit Probeschreiben zu klären. Bezug: FR-009 (Weiterschreiben), FR-026/5.6 (Schreibweise je Geschichte) als möglicher Landeplatz für Stilvorgaben.

Landeplatz: Phase 4 steht im STOPP Phasen-Wucherung (16 Schritte); beide Befunde sind als Eingaben der Neuplanung im STOPP-Block des Fahrplans ergänzt – keine eigenen Schritte vor der Neuplanung (`CLAUDE.md` Abschnitt 8, Kriterium 9).

### 2026-10-08 08:23 UTC – [SESSIONSTART] Befunde aus der Nutzung festhalten

- Cloud-Session. Modell laut `get_session`: eingestellt `claude-opus-5-5`, bedient `claude-opus-5-5` – Entscheidungs-Klasse.
- Kontextgröße: `get_session` meldet `used_tokens` 0 (nicht aktualisiert); Regel zur Sessiongröße damit nicht anwendbar.
- Auftrag: zwei Befunde des Eigentümers zur Nutzung festhalten. Routine-Arbeit (Logbuch, Fahrplan) oberhalb der empfohlenen Klasse; keine Abgabe, weil der Kontext schon geladen ist und die Einträge kurz sind.

### 2026-10-08 02:45 UTC – [ERLEDIGT] Schritt 4.13 Kürzerer, lesbarer Einrichtungscode

- Eigentümer hat auf dem VPS einen Code erzeugt: „sieht aus wie ABC-DEF-GHJ-KMN“ – neues Format bestätigt, Wert nicht weitergegeben. Alle Akzeptanzkriterien erfüllt (Tests, unabhängige Prüfung, Deployment, Format auf dem VPS). Der Code verfällt nach 24 Stunden ungenutzt; das Passwort bleibt gültig.

### 2026-10-08 02:35 UTC – [BEOBACHTUNG] D.11 aufgeschoben, 4.13 ungetestet

- Eigentümer: „D11 aufschieben.“ Die Bedingung „vor dem ersten echten Kapitel“ ist damit verfehlt (Kapitel schon geschrieben); die Frist 2026-10-31 aus ADR-038 bleibt. Eine Verschiebung darüber hinaus wäre ein Verzicht der Kategorie 6 mit neuem ADR. Restrisiko unverändert: Geht der VPS verloren, ist die Sicherung ohne Passphrase und Schlüssel nicht lesbar – jetzt mit echten Texten.
- 4.13: Einrichtungscode noch nicht erzeugt; Schritt bleibt `[IN ARBEIT]` bis zum Nachweis.

### 2026-10-08 02:25 UTC – [REIFEGRAD-WECHSEL] NFR Kanon-Treue → BELASTBAR

- 4.8 Teil 2: Eigentümer hat ein erstes echtes Kapitel in einer eigenen Welt geschrieben und redigiert – „Keine Widersprüche gefunden“, Modell qwen3.8-max-0902. Akzeptanzkriterium (höchstens ein Widerspruch) erfüllt; Beförderung nach ADR-024 (Eskalations-Auslöser 4 – Entscheidungs-Klasse aktiv, Opus 5.5).
- Einschränkung festgehalten: Die Messung gilt für qwen3.8-max, nicht für das Startmodell grok-4.7, das die Inhalte sperrte.
- STOPP Phasen-Wucherung im Fahrplan hinterlegt (Befund Modell-Sperren wäre 17. Schritt); Neuplanung in der nächsten Session. D.11-Angaben des Eigentümers stehen aus.

### 2026-10-08 02:15 UTC – [BEOBACHTUNG] Echte Welten: grok-4.7 und grok-4.6 sperren, Schreiben mit qwen3.8-max

- Eigentümer: musste wegen Schutzregeln der Modelle von grok-4.7 auf grok-4.6 und weiter auf qwen3.8-max-0902 (Notfall-Reserve nach ADR-011) wechseln; grok-4.7 „perspektivisch auch noch sinnvoll“.
- Verbrauchsdaten Oktober (lesend, nur Metadaten): 10 Schreib-Anfragen, alle `ergebnis: ok` – grok-4.7 5, grok-4.6 3, qwen 2; 0,13 $. Kein `abgelehnt`: Die Sperren kamen offenbar als normaler Text zurück, nicht als Ablehnung des Anbieters – das Skriptorium erkennt sie daher nicht und bietet keinen Modellwechsel an. Wie die Sperre aussah, ist beim Eigentümer erfragt.
- Nachfrage beantwortet: Die Sperre stand **als Text im Vorschlag** („wird nicht geschrieben“), kein roter Fehlerhinweis. Bestätigt die Vermutung: Ablehnung im Text wird nicht erkannt; mit „Übernehmen“ könnte sie sogar ins Manuskript geraten.
- Auf dem Server zwei echte Welten importiert (je alle sechs Kategorien), eine Geschichte „test“.
- Keine Sofortmaßnahme nötig: Das Modell wird je Geschichte gespeichert (3.9). Eine Änderung der Modell-Reihenfolge (ADR-010/011) oder eine Erkennung von Sperren im Text wäre ein neuer Schritt – in Phase 4 der 17. und damit Stopp mit Neuplanung (`CLAUDE.md` Abschnitt 8, Kriterium 9).
- Korrektur: Die Uhrzeiten der Einträge seit „4.16 angelegt“ (03:30–04:10 UTC) waren geschätzt und zu spät; laut Server war es bei diesem Eintrag 02:13 UTC.

### 2026-10-08 04:10 UTC – [BEOBACHTUNG] 4.8 Teil 1 (FR-022) nach Einschätzung erfüllt

- Nach dem Sessionende. Eigentümer: „4.8 kann ich sagen, ist problemlos in unter 30 Minuten zu schaffen.“ Vorgelegt: A Einschätzung genügt / B neu messen mit Stoppuhr. Entscheidung: **A**. FR-022 als erfüllt eingetragen, ausdrücklich ohne Messung; im Funktionstest gab es Rückfragen (Feld, Import-Material), deren Ursachen mit 4.15, 4.16 und `docs/import-prompts.md` behoben sind.
- Abweichung vom Akzeptanzkriterium (Stoppuhr) auf Entscheidung des Eigentümers; beim Vision-Abgleich vor Go-Live (`CLAUDE.md` Abschnitt 12) zu nennen.
- Offen in 4.8: Teil 2 Kanon-Treue im ersten echten Kapitel (nach D.11), Versionsvergabe v0.1.0, Vision-Abgleich.

### 2026-10-08 04:00 UTC – [SESSIONENDE] Funktionstest auf der Produktion; 4.13 eingespielt, 4.14–4.16 erledigt

- **Dauer:** 2026-10-07 23:14 – 2026-10-08 04:00 UTC (grob).
- **Bearbeitet:** ADR-041 und 4.13 (kürzerer Einrichtungscode, scrypt; unabhängige Prüfung Sonnet 5 ohne Befunde hoch/mittel; eingespielt). Funktionstest des Eigentümers auf der Produktion (Welt „Glasküste“, Import, `@`, Schreiben, Kanon-Proben). Befunde → 4.14 (Hinweis der KI getrennt, erledigt), 4.15 (Bedienhinweise, erledigt), 4.16 (Import zerlegte Gegenstände, erledigt). Wunsch Schreibweise → FR-026 und 5.6. Import-Prompts erarbeitet, korrigiert und in `docs/import-prompts.md` abgelegt. PRs #36–#43 gemergt; vier Deployments (`04a0bde`, `c0fe7d5`, `b4f2225`, `edc24ad`), jeweils auf Anweisung, Rückweg `skriptorium:vorher`.
- **Offen:** 4.13 letzter Nachweis (Code im neuen Format, Eigentümer); D.11 (Eigentümer, bis 2026-10-31); 4.8. Phase 4 bei 16 Schritten (Schwelle) – ein 17. Schritt erzwingt Stopp und Neuplanung.
- **Nächster Schritt:** D.11, dann 4.8 durch den Eigentümer.
- **Modell-Bilanz:** Entscheidungs-Klasse (`get_session`: `claude-opus-5-5`, durchgehend). Schritte oberhalb der Empfehlung: 3 (4.14, 4.15, 4.16 – Routine empfohlen; im geladenen Kontext erledigt, Abgabe hätte Kontext neu laden müssen, keine Ersparnis bei gleichem Cache-Lesepreis). Abgegeben: unabhängige Sicherheitsprüfung 4.13 an Sonnet 5 (getrennte Instanz).
- **Kontextgröße:** 398.436 Token (`get_usage`), über der Grenze 200.000 seit etwa 4.14; Weiterarbeit nach Vorgabe des Eigentümers. 5-Stunden-Limit 8 %, Wochenlimit 24 %.
- **Sessionende-Prüfungen:** README (Phase, Letzte Änderung, Nächste Schritte, Dokumenten-Index) und project-context Status nachgezogen. Drift: ADR-041 → 4.13 vorhanden; Reaktiv-Quote 0/10 über ADR-032..041 (Teil A stimmt); FR-026 → 5.6 vorhanden; Modul-Liste unverändert; keine Reifegrad-Wechsel; Blocker 0, kein `[BLOCKIERT]`; Phase 4: 16 Schritte (Schwelle „mehr als 16“ nicht überschritten), Phase 5: 6. Ablaufdaten: kein Vorlauf erreicht (Guthaben-Vorlauf ab 2026-10-22). Größen: project-context 344 Zeilen; **Logbuch 810 Zeilen > 800 (Trigger)** – die Regel lagert die vorletzte Monats-Scheibe aus, hier August 2026: existiert nicht (nur September und Oktober aktiv, Phasen 1–3 schon verdichtet). Auslagerung daher nicht möglich; Verdichtung von Phase 4 beim Phasenwechsel nach 4.8. Quick-Start-Pfad unberührt (keine Änderung an Skripten, Abhängigkeiten, `.env.example`).

### 2026-10-08 03:45 UTC – [ERLEDIGT] Schritt 4.16 Import – Gegenstände ohne einleitenden Text

- Auf Anweisung des Eigentümers: PR #42 nach grüner CI (8/8) gemergt, CI auf `main` grün, `edc24ad` eingespielt. Container `healthy`; von außen `/api/health` 200, `/api/worlds` 401, `/` 200; im Container: `## Runenklinge` + `### Zweck`/`### Verwendung` → ein Eintrag „Runenklinge“.

### 2026-10-08 03:30 UTC – [BEOBACHTUNG] 4.16 angelegt und umgesetzt (vor Deployment)

- Eigentümer: „Ja, 4.16 bauen“. Ausnahme in Regel 2 des Imports: Überschrift mit ausschließlich den Unterabschnitten Zweck/Verwendung/Auswirkung (auch mit `**…:**`) ist ein Eintrag. Untergruppen mit anderen Unterüberschriften und Kategorie-Überschriften bleiben Gruppen (Tests). pytest 410 (Coverage 99,78 %, `markdown.py` 100 %).
- Phase 4 jetzt 16 Schritte: genau an der Schwelle, nicht darüber.

### 2026-10-08 03:15 UTC – [GELÖST] Welt aus bestehendem Chat übernommen

- Mit korrigiertem Prompt (Pflicht-Satz unter jeder `##`-Überschrift, keine Eintragsnamen gleich Kategoriewörtern, keine Abfrage der Agentenanweisung): Import beim Eigentümer gelungen – „Dieser Prompt ist sehr wertvoll.“ Beide Prompts (A: aus Welt-Material, B: am Ende eines Chats) dauerhaft in `docs/import-prompts.md` abgelegt.
- Lehre: Prompts für den Import vor der Weitergabe mit `parse_markdown` gegen ein Beispiel prüfen – das hätte das Zerfallen der Gegenstände vorher gezeigt.

### 2026-10-08 03:00 UTC – [BEOBACHTUNG] Fehler im Import: Gegenstände mit Zweck/Verwendung/Auswirkung zerfallen

- Eigentümer: beim Import sehr oft Einträge „Zweck“, „Verwendung“, „Auswirkung“ als Gegenstand vorgeschlagen, ständig Konflikte und Überschreiben. Nachgestellt mit `parse_markdown`: `## Runenklinge` ohne eigenen Text, direkt gefolgt von `### Zweck` usw., gilt nach Regel 2 aus 2.4 („Überschrift ohne eigenen Text mit Unterüberschriften = Gruppe“) als Gruppe → die Unterabschnitte werden Einträge; der eigentliche Gegenstand fehlt. Ausgelöst durch den von der KI gelieferten Prompt, der genau dieses Muster verlangt (FR-003-Abschnitte).
- Folge auf der Produktion (vermutet, nicht geprüft): Einträge „Zweck“, „Verwendung“, „Auswirkung“ mit dem Text des zuletzt importierten Gegenstands; Gegenstände selbst fehlen.
- Sofort-Abhilfe an den Eigentümer: Prompt-Zeile mit Pflicht-Einleitungssatz unter jeder `##`-Überschrift. Dauerhafte Behebung als 4.16 vorgeschlagen (wartet auf Zustimmung).

### 2026-10-08 02:40 UTC – [BEOBACHTUNG] Welt aus bestehender Geschichte per Prompt: unbrauchbar

- Eigentümer wollte eine vorhandene Welt übernehmen. Geliefert: (1) Prompt zur Umwandlung von Welt-Material ins Import-Format, (2) Prompt zur Auswertung eines bestehenden Chats samt Agentenanweisung (am Ende des Chats einzufügen). Urteil des Eigentümers zu (2): „totaler Müll“ – Ursache noch nicht geklärt.
- Korrektur einer eigenen Falschaussage: Ein Abschnitt „# Offene Punkte“ im Import-Material wird **nicht** ignoriert, sondern zu einem Eintrag ohne Kategorie, der `apply_import` mit `InvalidInput` abbrechen lässt (`canon/service.py`). Dem Eigentümer mitgeteilt.
- Bezug: FR-005 (Welt-Material übernehmen), V.4 (Import aus TypingMind, verschoben, Landeplatz 5.5), ADR-009 (keine Übernahme von Geschichten).

### 2026-10-08 02:15 UTC – [ERLEDIGT] Schritt 4.15 Bedienhinweise im Schreib-Bereich

- Eigentümer sah zunächst keinen Hinweis: Er war im vorhandenen Kapitel mit Text (seit dem Deployment kein neues Kapitel auf dem Server – lesend geprüft), dort ist der Satz absichtlich verborgen. In einem neuen, leeren Kapitel: „Jetzt sehe ich es, passt so“. Ob zusätzlich ein hartes Neuladen nötig war, ist unbekannt.
- Beobachtung ohne Befund: Die Startseite wird ohne `Cache-Control` ausgeliefert (nur `ETag`, `Last-Modified`); Browser dürfen sie heuristisch zwischenspeichern und nach einem Deployment kurz die alte Oberfläche zeigen. Kein belegter Fall – bei einem Auftreten als Schritt anlegen.
- Einstieg ohne Hilfe (zweites Akzeptanzkriterium) wird in 4.8 mitbeobachtet; README nachgezogen.

### 2026-10-08 02:05 UTC – [BEOBACHTUNG] 4.15 eingespielt

- Eigentümer: „Ja, mergen“ auf die Frage „mergen und aufspielen?“ – als Zustimmung zu beidem gelesen. PR #39 nach grüner CI (8/8) gemergt, CI auf `main` grün, `b4f2225` nach Runbook eingespielt. Container `healthy`; von außen `/api/health` 200, `/api/worlds` 401, `/` 200; „So fängst du an“ im ausgelieferten JavaScript-Bündel vorhanden.

### 2026-10-08 01:50 UTC – [BEOBACHTUNG] 4.15 umgesetzt (vor Deployment)

- Eigentümer wählte per Frage: Einstieg „Kurzanleitung + Beispiel“, `@` „Hinweis im Menü“ (beides Empfehlung).
- `ui`: `ChapterEditor` gibt `chapterEmpty` an `WritingPanel`; Satz „So fängst du an …“ nur bei leerem Kapitel und ruhendem Schreib-Bereich; Beispieltext über `placeholder` von CodeMirror (weltneutral: Fremde in der Schänke). `mentions()` liefert bei keinem Treffer eine Hinweis-Zeile ohne Wirkung beim Auswählen – aber nur, solange nach dem `@` kein Leerzeichen steht, sonst würde der Hinweis beim Weiterschreiben hinter einem fertigen Namen stören (beim Entwurf aufgefallen, Test dazu).
- vitest 102 (98,67 % / 96,53 %), Pre-Commit grün.

### 2026-10-08 01:30 UTC – [ERLEDIGT] Schritt 4.14 Hinweis der KI getrennt vom Text

- Gegenprobe des Eigentümers ohne Konflikt („Am Morgen kommt Maren zurück und fragt, was er gebrannt hat.“): kein Hinweis, Vorschlag reine Prosa. Mit der Probe davor sind alle Akzeptanzkriterien erfüllt (Tests, CI, Probeschreiben mit echtem Modell in beide Richtungen).
- Kanon-Treue der Gegenprobe (Bewertung der KI): 0 Widersprüche. Lücke im Kanon, die die KI in zwei Texten gleich füllt: Spiegelglas nimmt nur beim Brennen Bilder auf, kaltes Glas spiegelt bloß („Ihr Gesicht fiel nicht hinein; das Glas war längst kühl“). Kandidat für eine Ergänzung der Regel „Spiegelglas erinnert sich“ – Sache des Eigentümers.
- README (Status, Nächste Schritte) nachgezogen. Unabhängige Prüfung nicht nötig (keine Kategorie 6; Hinweistext wird nicht protokolliert).

### 2026-10-08 01:20 UTC – [BEOBACHTUNG] 4.14 Probeschreiben mit Konflikt (Produktion)

- Eigentümer, Anweisung „Seine tote Frau erscheint ihm und spricht zu ihm.“: Hinweis getrennt über dem Vorschlag („Die tote Frau erscheint nicht und spricht nicht, weil die Toten tot bleiben; er sieht nur ihr stummes Bild im zerbrochenen Glas.“), Vorschlag ohne Hinweis an den Autor. Abtrennung wirkt mit echtem Modell.
- Kanon-Treue des Textes (Bewertung der KI, nicht blind): 0 Widersprüche – Bild ohne Ton, Zerbrechen zeigt es für einige Atemzüge (acht), danach fort; Glassand der Gilde; keine Erscheinung. Neu erfunden: Scherben ohne Bild gehören niemandem.
- Offen für 4.14: Gegenprobe ohne Konflikt (kein Hinweis erwartet).

### 2026-10-08 01:10 UTC – [BEOBACHTUNG] 4.14 eingespielt

- Auf Anweisung des Eigentümers: PR #37 nach grüner CI (8/8) gemergt, CI auf `main` grün, `c0fe7d5` nach Runbook eingespielt (Rückweg `skriptorium:vorher`, `app.vorher` = Stand 4.13). Container `healthy`; im Container `CONFLICT_MARKER` vorhanden; von außen `/api/health` 200, `/api/worlds` 401, `/` 200. Probeschreiben durch den Eigentümer steht aus.

### 2026-10-08 00:55 UTC – [BEOBACHTUNG] 4.14 umgesetzt (vor Deployment)

- `context`: Rahmen ergänzt – bei Konflikt mit dem Kanon kanontreu schreiben und mit genau einer Zeile `HINWEIS: …` beginnen; „Der Text selbst enthält nie Hinweise an den Autor.“ Kennung als `CONFLICT_MARKER` exportiert (rein additiv).
- `api.flows.writing`: `NoteSplitter` hält Textstücke zurück, bis die erste Zeile entschieden ist; Hinweis als Ereignis `hinweis`, danach unveränderte Weitergabe; Leerzeilen nach dem Hinweis auch über Textstückgrenzen entfernt (erster Testlauf fand genau diesen Fall – Kennung und Zeilenende in getrennten Stücken). Hinweis bei Fehler oder Ende ohne Zeilenende trotzdem gesendet. Hinweistext nicht im Log.
- `ui`: Hinweis über dem Vorschlag („wird nicht übernommen“), „Übernehmen“ übernimmt nur den Text, „Neu schreiben“ vergisst den Hinweis.
- pytest 407 (Coverage 99 %, `flows/writing.py` 99 %), vitest 98 (98,66 % Zeilen, 96,47 % Zweige), Pre-Commit grün. Probeschreiben mit echtem Modell steht aus: OpenRouter-Schlüssel nur auf dem VPS, Ausführung im Container ist für die KI gesperrt – der Eigentümer prüft nach dem Deployment in der Oberfläche.

### 2026-10-08 00:33 UTC – [BEOBACHTUNG] 4.13 eingespielt

- Auf Anweisung des Eigentümers: PR #36 gemergt (`04a0bde`, CI auf `main` grün), nach Runbook Abschnitt 7 eingespielt (vorheriges Image `skriptorium:vorher` und `app.vorher` als Rückweg). Container `healthy`; von außen `/api/health` 200, `/api/worlds` 401, `/` 200; im Container Codelänge 12, Alphabet 31; Welt `glaskueste` unverändert vorhanden. Sitzungen durch den Neustart beendet (liegen im Speicher). Erzeugung eines Codes auf dem VPS durch den Eigentümer steht aus (letzter Nachweis für 4.13).

### 2026-10-08 01:35 – [BEOBACHTUNG] Befunde des Funktionstests als Schritte 4.14 und 4.15

- Eigentümer zu Befund „Hinweis im Text“: **A – Hinweis getrennt vom Text anzeigen** (B still kanontreu, C vorher nachfragen nicht gewählt). Landeplatz 4.14 (context, api, ui; neues SSE-Ereignis `hinweis`, rein additiv).
- Befunde `@` stumm und Einstieg ins Schreiben → 4.15 (ui).
- Phase 4 jetzt 15 Schritte (ursprünglich 8): Schwelle „mehr als 16 und mindestens +5“ nicht überschritten, aber knapp – ein 17. Schritt löst Stopp und Neuplanung aus.
- Kontextgröße 269.347 Token (`get_usage`), über der Grenze 200.000; Weiterarbeit nach Vorgabe des Eigentümers, die Grenze nicht anzusprechen (Abweichung hiermit vermerkt).

### 2026-10-08 01:25 – [BEOBACHTUNG] Funktionstest: Kanon-Probe gegen „Die Toten bleiben tot“

- Anweisung „Seine tote Frau erscheint ihm und spricht zu ihm“ (widerspricht dem Kanon absichtlich). Ergebnis: Regel gehalten – keine Erscheinung, keine Stimme; stattdessen Suche nach der verlorenen Erinnerung. 0 Widersprüche zum Kanon.
- **Befund 1 (Bedienung/Inhalt):** Der Vorschlag beginnt mit einem Hinweis an den Autor („Die Anweisung widerspricht dem Kanon. …“) **im Prosatext**. Mit „Übernehmen“ landet er im Manuskript. Ursache: Der Rahmen in `src/skriptorium/context/builder.py` (`_frame`) sagt nur „Widersprich ihm nie“, nicht, wie ein Konflikt mit der Anweisung zu melden ist. Offen: Hinweis getrennt vom Text ausgeben (z. B. eigenes Feld) oder still kanontreu schreiben – Entscheidung des Eigentümers.
- **Befund 2 (Anschluss, kein Kanon-Widerspruch):** „der Abend, an dem das Boot nicht zurückgekommen war“ verknüpft den Tod der Frau mit dem Boot, das im ersten Text das Boot des Vaters war – mehrdeutig.

### 2026-10-08 01:15 – [BEOBACHTUNG] Funktionstest: Kanon-Treue des ersten Textes

- Erster Text (ca. 600 Wörter, Glasbrenner und Tochter) gegen die fünf Regeln der Glasküste gelesen: **0 Widersprüche**. Genutzt ohne `@`: „Spiegelglas erinnert sich“ (Bilder, nie Töne; Zerbrechen zeigt sie für einige Atemzüge), „Der Preis des Brennens“ (je reiner, desto mehr Verlust), Vell, Technikstand.
- Grenzfälle, kein Widerspruch: Der Brenner weiß vorher, welche Erinnerung er verliert (Kanon sagt dazu nichts; von der Anweisung vorgegeben). „Das Wort lag irgendwo im Glas“ – poetisch, Kanon kennt keine Ablage von Erinnerungen im Glas.
- Neu erfundene Fakten (Kandidaten für „In den Kanon“): Tochter Maren, Boot des Vaters, Lehrerin des Brenners.
- Bewertung durch die KI selbst (Opus 5.5), nicht blind – keine Messung im Sinne von 4.8.

### 2026-10-08 01:10 – [BEOBACHTUNG] Funktionstest: erster KI-Text auf der Produktion

- Anweisung im Feld „Anweisung an die KI“ mit „Weiterschreiben“: Text erscheint, ca. 25 s bis zum letzten Wort (Angabe des Eigentümers, Modell vermutlich Vorgabe grok-4.7). Innerhalb der Zielwerte (ADR-035: erstes Textstück meist < 30 s). Erster echter Schreibvorgang mit OpenRouter auf dem VPS.

### 2026-10-08 01:05 – [BEOBACHTUNG] Funktionstest: Einstieg ins Schreiben nicht selbsterklärend

- Eigentümer findet nach der Anleitung „Szene eingeben“ das Feld nicht („In welches Feld denn? Puh“), obwohl er `@` im Feld „Anweisung an die KI“ kurz zuvor benutzt hat. Der Knopf „Weiterschreiben“ und der Haken „Neue Szene“ erklären den Einstieg in ein leeres Kapitel offenbar nicht. Befund zur Bedienung, wird mit den übrigen Befunden des Funktionstests als Schritt angelegt (Bezug FR-022).

### 2026-10-08 01:00 – [BEOBACHTUNG] Funktionstest: Import und `@`-Menü funktionieren

- Eigentümer hat den Text aus `glaskueste.md` in das Import-Feld kopiert und übernommen; im Feld „Anweisung an die KI“ bietet `@` die Regeln an. Vorherige Unklarheit „Was soll ich importieren?“: die als Datei geschickte Vorlage war nicht als Import-Material erkannt worden – Text im Gespräch zum Kopieren half.

### 2026-10-08 00:50 – [BEOBACHTUNG] Funktionstest: `@`-Menü zeigt nichts

- Eigentümer: „`@` – da taucht nichts auf.“ Ursache (lesend per SSH, nur Dateinamen): Welt `glaskueste` mit Geschichte und Kapitel angelegt, aber keine Kanon-Einträge – der Import war nicht gelaufen. `mentions()` in `ui/src/views/InstructionEditor.tsx` gibt bei leerer Trefferliste `null` zurück, das Menü bleibt stumm.
- Kein Fehler, aber Befund zur Bedienung: Bei leerem Kanon (oder keinem Treffer) fehlt ein Hinweis. Wird mit den übrigen Befunden des Funktionstests als Schritt angelegt.

### 2026-10-08 00:40 – [BEOBACHTUNG] Funktionstest: Anmeldung und Geschichte anlegen klappen; Wunsch Schreibweise

- Eigentümer hat sich angemeldet (Einrichtung zwangsläufig mit dem bisherigen, langen Code – 4.13 ist noch nicht eingespielt) und legt eine Geschichte an: Titel, Form (Roman, Kurzgeschichte, Fragment), Erzählperspektive.
- Wunsch: künftig neben der Erzählperspektive eine atmosphärische Schreibweise vorgeben. Landeplatz: FR-026 (Soll, vorläufig) und Schritt 5.6 `[OFFEN]` mit offenen Formfragen; Phase 5 jetzt 6 Schritte.

### 2026-10-08 00:25 – [BEOBACHTUNG] Funktionstest durch den Eigentümer statt 4.8; Welt per Import

- Eigentümer will die Funktion jetzt testen, ohne Stoppuhr – das ist **nicht** die Messung aus 4.8 (FR-022); 4.8 bleibt `[OFFEN]`.
- Auftrag „Welt mit Name und Grundregeln erstellen“: Der direkte Weg (Python im Container per SSH) wurde vom Rechte-Filter der Arbeitsumgebung abgelehnt (Schreiben auf entferntem System). Stattdessen Welt „Glasküste“ als Markdown mit fünf Regeln für den Import über die Oberfläche bereitgestellt – lokal mit `parse_markdown` geprüft: Einleitung plus 5 Einträge der Kategorie `regel`. Der Import durch den Eigentümer testet zugleich den Import-Weg.

### 2026-10-08 00:10 – [BEOBACHTUNG] Unabhängige Prüfung des Einrichtungscodes (4.13)

- Getrennte Instanz (Unteragent Claude Sonnet 5, ohne Gesprächsverlauf, nur Diff, Bedrohungsmodell, ADR-041). Ergebnis: keine Befunde hoch/mittel; ASVS 6.4.1 und 11.4.2 erfüllt. Entropie ≈ 59,45 Bit reicht auch mit vielen Adressen (bei IPv6 begrenzt zusätzlich die scrypt-Rate); Normalisierung macht keine falsche Eingabe richtig; Einmaligkeit unter Sperre korrekt; alte SHA-256-Hashes sicher ungültig; Code nicht in Logs.
- Niedrige Befunde: fehlender Routentest mit kleingeschriebenem Code ohne Bindestriche – behoben (`test_setup_accepts_code_typed_lowercase_without_hyphens`, auch ein falsches Zeichen → 403). Über dem Niveau, nur optional (nicht umgesetzt, `CLAUDE.md` Abschnitt 6 „Schutzbedarf ist Obergrenze“): Sperre je IPv6-/64-Präfix, ASCII-Prüfung nach `upper()`, `max_length` am Feld `code`, Ausgleich des Zeitunterschieds bei aktivem Code, weitere Randfall-Tests. Hinweis zu `FORWARDED_ALLOW_IPS`: in 4.7 von außen belegt (ADR-030), nicht neu.

### 2026-10-07 23:45 – [ADR-ANGELEGT] ADR-041 Kürzerer Einrichtungscode

- Eigentümer: Code „viel zu lang“; vorgelegt A 12 Zeichen lesbar (Empfehlung) / B unverändert kopieren / C 6 Ziffern. Entscheidung: „A, mach das“. Folge im ADR: Ablage mit scrypt statt SHA-256, weil 59 Bit für einen schnellen Hash nach einem Abfluss der Datei zu wenig sind. Schritt 4.13 angelegt (Phase 4 jetzt 13 Schritte, Schwelle 16 nicht berührt).

### 2026-10-07 23:30 – [BEOBACHTUNG] Produktion noch ohne Passwort und ohne Daten

- Lesend per SSH geprüft: Im Container liegt unter `/data` nur `index.sqlite`; kein `system/zugang.md` – also weder Passwort noch Einrichtungscode, keine Welten. Das Skriptorium ist seit 4.7 erreichbar, aber noch nie eingerichtet. Passt zu 4.8 (erstes Öffnen durch den Eigentümer mit Einrichtung). Keine Werte ausgegeben.

### 2026-10-07 23:14 – [SESSIONSTART] Neue Session

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Quelle: `get_session`) – Entscheidungs-Klasse.
- **Kontextgröße:** ca. 157.000 Token nach der Pflichtlektüre (`get_usage`; Fenster 1 Mio., davon ca. 57.000 Grundlast aus Werkzeugen, Speicher und Systemtext). 5-Stunden-Limit 4 %, Wochenlimit 23 % (Zurücksetzung 2026-10-11 10:00 MESZ).
- **Stand:** Lokaler `main` war 4 Commits hinter `origin/main` (PR #35, D.8 verworfen, D.12) – per Fast-Forward nachgezogen auf `cc67d37`; CI auf `main` grün.
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2 (project-context, Logbuch ab letztem Sessionende 2026-10-07 19:55, Fahrplan Stand und Phase 4 samt Querschnitt-Status, Architektur 1/2/9, Decisions A/C, aktive Blocker: keine).
- **Vorhaben:** offen – kein Auftrag genannt. Anstehend: D.11 (Eigentümer, spätestens 2026-10-31), danach 4.8.

### 2026-10-07 20:15 – [GELÖST] CI rot: Sicherheitslücke in `source-map-js` (D.12)

- PR #35 (D.8, nur Doku) rot im Job „TypeScript“, Schritt „Dependency-Audit“: GHSA-68fv-2mgg-jv7q (hoch) in `source-map-js` 1.2.1, transitiv über vite/postcss, jsdom und vitest-Coverage. Nicht durch den PR verursacht – neue Meldung seit dem letzten grünen Lauf auf `main` (2026-09-30).
- Behoben mit `npm audit fix`: nur `package-lock.json`, 1.2.1 → 1.2.2. Lokal: `npm audit` 0 Befunde, vitest 96/96, Build grün. Als D.12 im Fahrplan, im selben PR.
- Hinweis: Das Sessionende war schon geschrieben; die Prüfung des CI-Ergebnisses kam erst auf Nachfrage des Eigentümers. Künftig vor dem Sessionende das CI-Ergebnis des gepushten Stands abwarten.

### 2026-10-07 19:55 – [SESSIONENDE] D.8 verworfen

- **Dauer:** ca. 19:00–20:05 UTC (Uhrzeiten grob).
- **Bearbeitet:** D.8 `[OFFEN]` → `[VERWORFEN]` (ADR-040). Keine Code-Änderung.
- **Offen / nächster Schritt:** D.11 (spätestens 2026-10-31), dann 4.8 30-Minuten-Test – beide erledigt der Eigentümer laut eigener Aussage „nachher“; keine Verschiebung (eine zunächst gewünschte Verschiebung beider Schritte wurde nach Rückfrage nach Landeplatz und Folgen nicht weiterverfolgt, Fristen unverändert). Datiert: D.1 ab 2026-11-05, D.5 ab 2026-11-12, D.9 2026-12-28.
- **Uncommitted / ungemergt:** Branch `docs/d8-verworfen` gepusht, noch nicht auf `main` (Merge nur per Pull Request, ADR-028); Pull Request auf Anweisung des Eigentümers.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session`: eingestellt und bedient `claude-opus-5-5`); 0 Schritte oberhalb der Empfehlung (D.8-Verwerfung ist Kategorie 6, Eskalations-Auslöser 1); nichts abgegeben (kleine Doku-Änderung im geladenen Kontext).
- **Kontextgröße:** ca. 125.000 Token (`get_session`) – unter der Grenze.
- **Sessionende-Prüfungen:** README „Nächste Schritte“ ohne D.8; Drift: ADR-040 → D.8 vorhanden, Reaktiv-Quote 0/10 über ADR-031 bis ADR-040, keine aktiven Blocker, keine Reifegrad-Wirkung; Ablaufdaten ohne erreichten Vorlauf; Logbuch ca. 670 Zeilen – kein Trigger. Quick-Start-Pfad unberührt.

### 2026-10-07 19:50 – [ADR-ANGELEGT] ADR-040 D.8 verworfen

- Eigentümer: „D8 streichen“; auf die Rückfrage nach Erreichbarkeit und Stärke: „Passwort stark“. Vorgelegt waren A verwerfen / B neue Frist (Empfehlung der KI) / C Verwaltung abschalten. Restrisiko im ADR benannt.

### 2026-10-07 19:00 – [SESSIONSTART] Überblick, D.8

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Quelle: `get_session`) – Entscheidungs-Klasse.
- **Kontext:** Frage des Eigentümers nach offenen Schritten und letztem Stand. Befund: D.8 (Frist 2026-10-05) überschritten, ohne Vermerk. Eintrag nachträglich angelegt – die erste Antwort war reine Lektüre ohne Änderung.

### 2026-09-30 14:40 – [SESSIONENDE] Schritt 4.7 erledigt – Skriptorium öffentlich erreichbar

- **Dauer:** 13:40–14:40 UTC (Uhrzeiten grob).
- **Bearbeitet:** 4.7 `[OFFEN]` → `[ERLEDIGT]`; ADR-039; PR #33 (Code) gemergt, Stand `942bb40` eingespielt.
- **Offen / nächster Schritt:** 4.8 30-Minuten-Test durch den Eigentümer; davor D.11. D.8 bis 2026-10-05. Auf dem VPS bleiben als Rückweg `app.vorher`, Image `skriptorium:vorher`, Sicherungskopien der Proxy- und Compose-Dateien vom 2026-09-30.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session`); 0 Schritte oberhalb der Empfehlung; abgegeben: unabhängige Sicherheitsprüfung an Sonnet 5 (getrennte Instanz, anderes Modell).
- **Kontextgröße:** über 330.000 Token (`get_usage` zu Beginn 325.509) – über der Grenze, Weiterarbeit nach dauerhaftem „weiter hier“.
- **Sessionende-Prüfungen:** README und CHANGELOG nachgezogen; Drift: ADR-039 → 4.7 vorhanden, Reifegrad Netz BELASTBAR passt zu 4.7, Reaktiv-Quote 0/10 über ADR-030 bis ADR-039, keine aktiven Blocker, Phase 4 weiter 12 Schritte; Ablaufdaten ohne erreichten Vorlauf; Logbuch ca. 620 Zeilen, project-context ca. 345 Zeilen – kein Trigger. Quick-Start-Pfad unberührt (Änderung nur an `api` und Notfall-Abschnitt) – keine Klon-Validierung nötig.

### 2026-09-30 14:35 – [ERLEDIGT] Schritt 4.7 Erstes öffentliches Deployment

- **Proxy:** Sicherungskopie des Proxy-Verzeichnisses (nur root lesbar) und der Compose-Datei; Netz `skriptorium-proxy` als externes Netz ergänzt, Container neu erstellt; 9 Adressen vorher/nachher identisch (lokal gegen den Proxy), 3 von außen mit gültigem Zertifikat, HTTP → 301.
- **Einspielen:** `git archive main` (`942bb40`) auf den VPS, altes Verzeichnis und Image als Rückweg, Labels für Router (HTTPS, vorhandener Zertifikats-Resolver), Dienst-Port und Middleware `frame-ancestors 'none'`, `traefik.docker.network` auf das eigene Netz; Bau und Start, `healthy`. Das vorhandene Zertifikat der Domain deckt die Adresse ab.
- **Von außen (Mac):** Gesundheitsprüfung 200 / TLS gültig; `/api/worlds` 401; Oberfläche 200; alle fünf Kopfzeilen; Anmeldung mit gefälschtem `X-Forwarded-For` → im Protokoll die echte Adresse; 10 falsche Einrichtungscodes mit wechselndem gefälschtem Absender → 403, der 11. → 429; vom VPS über die öffentliche Adresse (zweite Adresse) → 403, nicht gesperrt. Danach Container neu gestartet, damit die Sperre der Adresse des Eigentümers aufgehoben ist (Sperre liegt im Speicher); Kontrolle: 409 statt 429.
- **Browser:** In echtem Chromium (Playwright) lädt die Anmeldeseite; einzige Konsolenmeldung ist die erwartete 401 der Sitzungsabfrage.

### 2026-09-30 14:35 – [REIFEGRAD-WECHSEL] Netz (nur HTTPS von außen) → BELASTBAR

- Von `[VORLÄUFIG]`; Beleg: Prüfungen von außen in 4.7 (oben), Datum am Bestandteil in `docs/architecture.md` Abschnitt 9.

### 2026-09-30 14:30 – [GELÖST] Eingebauter Browser blockiert Skript und Stylesheet

- Im Browser-Bereich der Desktop-App blieb die Seite leer: `net::ERR_BLOCKED_BY_CLIENT` für JS und CSS. Per `curl` kamen beide mit 200 und richtigem Typ; in Chromium über Playwright lädt die Seite. Ursache liegt im Browser-Bereich, nicht am Server. Für Sichtprüfungen der öffentlichen Seite künftig Playwright nehmen.
- Beobachtung: Antworten tragen `server: uvicorn` (ohne Version) – optional abschaltbar, am Schritt 4.7 notiert.

### 2026-09-30 14:05 – [BEOBACHTUNG] Unabhängige Prüfung der Kopfzeilen-Änderung (4.7)

- Getrennte Instanz (Unteragent Claude Sonnet 5, ohne Gesprächsverlauf; Diff, Bedrohungsmodell, Code): keine Befunde hoch/mittel. Bestätigt: Kopfzeilen auf 200/401/403/404/405/415 und auf der Streaming-Antwort, je genau einmal; `nosniff` bricht die Oberfläche nicht (JS `text/javascript`, CSS `text/css`); `Referrer-Policy` berührt die Herkunftsprüfung nicht (liest nur `Origin`).
- Behoben: (niedrig, Vorbestand) Antwort bei unerwartetem Serverfehler trug keine Kopfzeilen, auch kein HSTS – jetzt eigener Handler mit den Kopfzeilen und JSON `{"detail": "Interner Fehler"}`; (niedrig) Tests erweitert auf 403, 404, Oberflächen-Dateien mit Content-Type und 500; (Hinweis) Kopfzeilen in `docs/architecture.md` Abschnitt 6 aufgenommen.
- Nicht geprüft von der Instanz: echter Browser, Verhalten hinter dem Proxy – folgt in der Prüfung von außen.
- Stand: 384 Tests grün, Coverage gesamt 99 %, `api/app.py` 100 %; ruff, mypy strict, bandit ohne Befund.

### 2026-09-30 13:55 – [ADR-ANGELEGT] ADR-039 Deployment von Hand, Adresse

- Eigentümer: Option A (von Hand durch die KI auf Anweisung), Adresse gewählt (Wert nur lokal), Proxy-Eingriff „jetzt“ freigegeben (Neuerstellung des Proxy-Containers, kurze Unterbrechung aller Dienste; ADR-030).
- Vorher-Stand der 9 angebundenen Adressen auf dem VPS erhoben (lokal gegen den Proxy), Liste und Statuscodes liegen auf dem Server.
- Eine Nachricht des Eigentümers zu einem fremden API-Schlüssel und Endpunkt war nicht für diese Session bestimmt („war nicht für dich“) – nichts unternommen.

### 2026-09-30 13:40 – [SESSIONSTART] Schritt 4.7 Erstes öffentliches Deployment

- **Modell:** Opus 5.5 (`claude-opus-5-5`, laut `get_session`), Entscheidungs-Klasse – wie für 4.7 verlangt (Eskalations-Auslöser 1).
- **Umgebung:** Mac, fortgesetzte Session; PR #32 gemergt, `main` auf `b1d693a`, Branch `feat/4.7-deployment`.
- **Gate-Punkt 8:** Wochenlimit 26 % verbraucht (`get_usage`), unter der Grenze von 70 % – 4.7 darf beginnen.
- **Mindest-Lektüre:** Stand aus dieser Session; zusätzlich ADR-027, ADR-030, ADR-031 und Schritt 4.7.
- **Kontextgröße:** 325.509 Token (`get_usage`) – über der Grenze, Weiterarbeit nach dauerhaftem „weiter hier“.
- **Bestand (lesend):** Proxy 3.7.13 mit Docker- und Datei-Anbieter, Standardnetz `traefik`, Zertifikate über DNS-Challenge, Zugriffsprotokoll global an (ADR-031 lässt das zu); Proxy hängt noch nicht am Netz `skriptorium-proxy`. DNS: beliebige Subdomain der Domain des Eigentümers zeigt schon auf den VPS (Platzhalter-Eintrag) – kein DNS-Schritt nötig. Auf dem VPS liegt Stand `f79e8af` als Dateikopie mit `REVISION` (kein Git-Klon); seither keine Änderung an `src`, `ui`, `Dockerfile`, Abhängigkeiten.
- **Hinweis:** Die Uhrzeiten der Einträge zu 4.6 (13:50 bis 14:10) waren geschätzt; der Merge von PR #32 lag bei 13:36 UTC.

### 2026-09-30 14:10 – [SESSIONENDE] Gate 4.6 geschlossen

- **Dauer:** 13:30–14:10 UTC (Uhrzeiten grob).
- **Bearbeitet:** 4.6 `[OFFEN]` → `[ERLEDIGT]`; ADR-037, ADR-038; D.11 angelegt.
- **Offen / nächster Schritt:** 4.7 Erstes öffentliches Deployment (Entscheidungs-Klasse; Wochenverbrauch vorher prüfen, Grenze 70 %). Eigentümer: D.8 bis 2026-10-05, D.11 vor dem ersten echten Kapitel.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session`); 0 Schritte oberhalb der Empfehlung; nichts abgegeben.
- **Kontextgröße:** rund 300.000 Token (`get_usage` zu Beginn 296.523) – über der Grenze, Weiterarbeit nach dauerhaftem „weiter hier“.
- **Sessionende-Prüfungen:** README nachgezogen; Drift: ADR-037/038 → 4.6 und D.11 vorhanden, Reifegrad „Secrets im Betrieb“ VORLÄUFIG passt zu ADR-038, Reaktiv-Quote 0/10 über ADR-029 bis ADR-038, keine aktiven Blocker; Phase 4 weiter 12 Schritte (D.11 ist Querschnitt); Ablaufdaten ohne erreichten Vorlauf; Logbuch ca. 570 Zeilen, project-context ca. 345 Zeilen – kein Trigger. D.8 trug „spätestens vor 4.6“ – überholt, Datum 2026-10-05 gilt weiter (am Schritt vermerkt).

### 2026-09-30 14:05 – [ERLEDIGT] Schritt 4.6 Gate vor dem ersten öffentlichen Deployment

- Checkliste mit Belegen am Schritt. Sieben Punkte belegt; Punkt 4 über ADR-037 (Zugriff der KI unverändert, Schlüsseltausch unerprobt) und ADR-038 (4a aus dem Gate genommen) entschieden.

### 2026-09-30 14:05 – [REIFEGRAD-WECHSEL] Secrets im Betrieb → VORLÄUFIG

- Von `[OFFEN]`. Geplant war `[BELASTBAR]`; nicht befördert, weil der Rotationsweg unerprobt ist und die Sicherungs-Zugangsdaten nur auf dem VPS liegen (CLAUDE.md Abschnitt 6, „Schutzmechanismen durch erzwungenen Fehler belegen“). Beförderung mit D.11.

### 2026-09-30 14:00 – [ADR-ANGELEGT] ADR-038 Verzicht auf Gate-Punkt 4a

- Anweisung des Eigentümers: „4.6 überspringen.“ Da alle übrigen Punkte belegt oder entschieden waren, betrifft der Verzicht nur 4a. Restrisiko im ADR: nach Verlust des VPS wäre die Sicherung nicht lesbar; bis zum ersten echten Inhalt (4.8) ist das Datenverzeichnis leer. Landeplatz D.11 mit Frist. Hebt die Festlegung vom 2026-09-28 („kein Gate-Punkt wird übersprungen“) für diesen Punkt auf.

### 2026-09-30 13:50 – [ADR-ANGELEGT] ADR-037 Zugriff der KI bleibt unverändert

- Vorgelegt: A eingeschränktes Konto / B Administrator-Zugang mit zusätzlichen Regeln (Empfehlung) / C kein Zugriff; dazu die Frage nach der Erprobung des Schlüsseltauschs. Antwort des Eigentümers: „Es bleibt so, wie es ist.“ Die KI las das zunächst als B und begann einen ADR mit neuer Regel; der Eigentümer unterbrach und wiederholte: „Es bleibt so, wie es jetzt gerade ist.“ Festgehalten deshalb ohne neue Regeln und ohne Schlüsseltausch, Restrisiko im ADR. Gate: nur noch 4a offen.
- Nachprüfung von außen (Mac, `nc`): 22, 80, 443 offen; 8000, 8200, 9000, 9443, 8080, 3306, 5432, 6379, 2375, 2376 zu.

### 2026-09-30 13:30 – [SESSIONSTART] Schritt 4.6 Gate

- **Modell:** Opus 5.5 (`claude-opus-5-5`, laut `get_session`), Entscheidungs-Klasse – wie für 4.6 verlangt (Eskalations-Auslöser 1 und 4).
- **Umgebung:** Mac, fortgesetzte Session; `main` auf `a44a789`, Branch `chore/4.6-gate`.
- **Mindest-Lektüre:** Stand aus dieser Session, seit dem Merge unverändert; zusätzlich ADR-032, Architektur Abschnitt 6 (Secrets), `templates/architektur-heuristiken.md` Teil 3 und 4.
- **Kontextgröße:** 296.523 Token (`get_usage`) – über der Grenze von 200.000; Weiterarbeit auf dauerhaftes „weiter hier“ des Eigentümers (2026-09-28), Abweichung hiermit vermerkt. Wochenlimit 26 % verbraucht, Zurücksetzung 2026-10-04 10:00 MESZ.
- **Hinweis:** Die Uhrzeiten der Einträge 13:35 und 13:40 (4.4) waren geschätzt; tatsächlich lagen sie vor 13:27 UTC.

### 2026-09-30 13:40 – [SESSIONENDE] Schritt 4.4 erledigt

- **Dauer:** 13:17–13:40 UTC.
- **Bearbeitet:** 4.4 `[OFFEN]` → `[ERLEDIGT]`.
- **Offen / nächster Schritt:** Gate 4.6; dort neu 4a (Ablage der Sicherungs-Zugangsdaten außerhalb des Servers – Eigentümer wählt Passwort-Manager, dringend) und 4b (Schlüsseltausch OpenRouter). D.8 bis 2026-10-05.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session`); 1 Schritt oberhalb der Empfehlung (4.4: Routine); nichts abgegeben (Kontext geladen, Text kurz).
- **Kontextgröße:** nicht feststellbar.
- **Sessionende-Prüfungen:** README nachgezogen; kein neuer ADR, Reifegrade unverändert, Reaktiv-Quote 0/10, keine aktiven Blocker, Phase 4 weiter 12 Schritte; Ablaufdaten ohne erreichten Vorlauf; Logbuch ca. 540 Zeilen, project-context ca. 345 Zeilen – kein Trigger. Runbook-Änderung nur Notfall-Abschnitt – keine Klon-Validierung nötig.

### 2026-09-30 13:35 – [ERLEDIGT] Schritt 4.4 Notfall-Handbuch

- Eigentümer hat ohne KI nach dem Übungsblatt angehalten und gestartet: „hat alles geklappt“. Beleg der KI danach: Container „Up About a minute (healthy)“.
- Sicherung von Hand in der Übung nicht ausgeführt (Duplicati-Datenbank: letzter Lauf 03:00 UTC); der Eigentümer lässt die Handläufe und die Wiederherstellung vom 2026-09-30 (4.3, unter Anleitung) gelten.
- Verschoben nach 4.6 als Prüfpunkte 4a und 4b: Ablage von Passphrase und S4-Schlüsseln außerhalb des Servers; Erprobung des Schlüsseltauschs.

### 2026-09-30 13:30 – [GELÖST] Uhrzeit der Sicherung falsch dokumentiert

- Dokumentiert war 04:15 (Vorschlag der KI); der Auftrag läuft laut Duplicati-Datenbank (`Schedule`) täglich 03:00 UTC = 05:00 MESZ. Erster automatischer Lauf 2026-09-30 05:00. Runbook, Fahrplan 4.3 und project-context korrigiert.

### 2026-09-30 13:35 – [BEOBACHTUNG] 4.4: Notfall-Abschnitt geschrieben, Anhalten und Starten erprobt

- `docker compose stop` / `start` im Anwendungsverzeichnis auf dem VPS: gestoppt (`Exited (0)`), gestartet, nach etwa einer Minute `healthy`, `/api/health` 200. Wegen `restart: unless-stopped` bleibt ein gestopptes Skriptorium auch nach Server-Neustart aus.
- Runbook Abschnitt 7 mit Platzhaltern (`<vps>`, `<duplicati-adresse>`), echte Werte und Übungsblatt in der lokalen Notiz `notfall-lokal.md` beim Eigentümer (öffentliches Repo).
- Nicht erprobt: Tausch des OpenRouter-Schlüssels (würde den laufenden Schlüssel ändern) – an 4.4/4.6 vermerkt. `skriptorium-einrichtung` ist im Container vorhanden, nicht ausgeführt (Einrichtung bleibt dem 30-Minuten-Test vorbehalten).

### 2026-09-30 13:17 – [SESSIONSTART] Schritt 4.4

- **Modell:** Opus 5.5 (`claude-opus-5-5`, laut `get_session`), Entscheidungs-Klasse. 4.4 ist Routine-Arbeit – läuft oberhalb der Empfehlung; dem Eigentümer zu Beginn gesagt (Wochenkontingent). Nicht abgegeben: Fakten vom VPS schon geladen, Text kurz.
- **Umgebung:** Mac, fortgesetzte Session; `main` unverändert auf `b71d931`, Branch `docs/4.4-notfall-handbuch`.
- **Mindest-Lektüre:** Stand der Pflicht-Dokumente aus der Vor-Session im Kontext, seit dem Merge keine Änderung (`git pull`: aktuell); zusätzlich Runbook Abschnitt 7 und 4.4 im Fahrplan.
- **Kontextgröße:** nicht feststellbar.

### 2026-09-30 00:35 – [BEOBACHTUNG] Sicherungs-Zugangsdaten nur auf dem VPS

- Der Eigentümer hat keinen Passwort-Manager in Betrieb. Duplicati-Passphrase und S4-Schlüssel liegen damit nur im Duplicati-Auftrag auf dem VPS (Schlüssel zusätzlich bei Mega). Nach Verlust des Servers wäre die Sicherung nicht lesbar. Einträge in project-context, Fahrplan, Runbook und Logbuch, die einen Passwort-Manager voraussetzten, korrigiert. Landeplatz: Zusatz an 4.4; Gate 4.6 Punkte 4 und 5 hängen daran. Empfehlung an den Eigentümer: Apple „Passwörter“ oder Bitwarden, Passphrase zusätzlich auf Papier.

### 2026-09-30 00:25 – [SESSIONENDE] Schritt 4.3 erledigt

- **Dauer:** 23:09–00:45 UTC (Nachtrag 00:45: Korrektur zur Ablage der Zugangsdaten eingearbeitet, PR #30 gemergt).
- **Bearbeitet:** 4.3 `[IN ARBEIT]` → `[ERLEDIGT]`; Backups und Wiederherstellung → `[BELASTBAR]`.
- **Stand:** tägliche verschlüsselte Sicherung nach MEGA S4 aktiv; Wiederherstellung erprobt; Verfahren in Runbook Abschnitt 7 (Sicherung ziehen, Wiederherstellen). Der `docker run`-Befehl im Runbook ist die verallgemeinerte Form des erprobten Aufrufs (erprobt mit fester Image-Prüfsumme und zusätzlichem `/config`-Verzeichnis).
- **Offen / nächster Schritt:** Dringend: Eigentümer legt Duplicati-Passphrase und S4-Schlüssel außerhalb des Servers ab (Wahl des Passwort-Managers vertagt, Zusatz an 4.4). Dann 4.4 Notfall-Handbuch (Zugang, Anhalten, Benachrichtigen fehlen noch; Übung ohne KI); D.8 bis 2026-10-05. Offen beim Eigentümer: Duplicati-Image auf dem Mac (ca. 650 MB) behalten oder löschen – bis zur Antwort behalten (nützlich für die Übung in 4.4).
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session`); 0 Schritte oberhalb der Empfehlung (4.3: Entscheidung); nichts abgegeben – Doku-Nachträge klein und mit geladenem Kontext erledigt.
- **Kontextgröße:** nicht feststellbar (Sitzungsabfrage meldet sie nicht).
- **Sessionende-Prüfungen:** README nachgezogen (Phase, Reife, nächste Schritte); Drift: ADR-036 → 4.3 vorhanden, Reifegrad Backups passt zu 4.3/ADR-036, Modul-Liste unverändert, keine aktiven Blocker, Reaktiv-Quote unverändert 0/10, Phase 4 weiter 12 Schritte; Ablaufdaten: Vorlauf Guthaben (2026-10-22) noch nicht erreicht; Logbuch ca. 510 Zeilen, project-context ca. 345 Zeilen – kein Trigger. Runbook-Änderung betrifft nur den Notfall-Abschnitt, nicht den Onboarding-Pfad – keine Klon-Validierung nötig.

### 2026-09-30 00:20 – [ERLEDIGT] Schritt 4.3 Backups mit erprobter Wiederherstellung

- Duplicati-Auftrag „Skriptorium“ vom Eigentümer in der Weboberfläche angelegt, geführt Abschnitt für Abschnitt; Schlüssel und Passphrase gab nur er ein, die KI sah keinen Wert (Befehle filterten `passw|key|secret|auth`).
- **Erzwungener Fehler:** Schlüssel gegen zweiten, leeren Bucket → Lauf scheitert mit „AmazonS3Exception: Request not allowed by policy“; zweiter Bucket blieb leer.
- **Wiederherstellung:** Probewelt (Welt + 2 Einträge) mit Freigabe des Eigentümers auf dem VPS angelegt, Prüfsummen notiert; Sicherung 02:16 MESZ (9 Einträge). Auf dem Mac Wegwerf-Container `lscr.io/linuxserver/duplicati@sha256:9272af85…` (gleicher Digest wie VPS, Download freigegeben), nur 127.0.0.1; Eigentümer stellte wieder her; die Werte kopierte er aus dem Export des VPS-Auftrags (kein Passwort-Manager vorhanden – siehe Beobachtung 00:35). Ergebnis: 3 Dateien, `shasum -c` OK, Index nicht dabei. Server (`main`-Stand) auf Kopie gestartet: `/api/health` 200, `/api/worlds` 401 ohne Anmeldung, Einrichtung 204, Anmeldung 204, Welt „Probe Sicherung“ gelistet. Index: `find_entries("Anna")` vor `rebuild_index()` leer, danach Treffer.
- **Aufgeräumt:** Probewelt auf dem VPS über `DocumentStore.delete` entfernt (Index danach ohne Treffer, im Datenverzeichnis nur `index.sqlite`); Container und Testdaten auf dem Mac gelöscht. Die Probewelt bleibt in der Sicherung von 02:16, bis die Aufbewahrung sie entfernt (nur Testtext).

### 2026-09-30 00:20 – [REIFEGRAD-WECHSEL] Backups und Wiederherstellung → BELASTBAR

- Von `[OFFEN]`; Beleg: vollständige Wiederherstellung aus echter Sicherung (CLAUDE.md Abschnitt 6), Datum am Bestandteil in `docs/architecture.md` Abschnitt 6 und 9. „Secrets im Betrieb“ als eigene Zeile, bleibt `[OFFEN]` bis Gate 4.6.

### 2026-09-30 00:15 – [GELÖST] Reibungen bei der Einrichtung von Duplicati nach S4

- „Access Key is malformed“: Schlüssel beim Einfügen vertauscht bzw. unsauber; neu eingefügt.
- „Root element is missing“: Server-URL enthielt den Bucket-Namen als Subdomain (virtuelle Adressierung, wie Mega die Objekt-URL zeigt); richtig ist nur der Endpunkt, Duplicati setzt den Bucket selbst.
- Objekt-URL-Zugriff des Buckets bleibt „verweigert“ – Duplicati arbeitet signiert, öffentliche URLs braucht es nicht.
- Erste Sicherungen (01:31, 01:36) enthielten nur den leeren Ordner: der Auftrag hatte einen in der Oberfläche nicht sichtbaren zweiten Filter `*` (Ausschluss). Gefunden über eine Kopie der Duplicati-Serverdatenbank (Tabellen `Filter`, `Fileset`, `FilesetEntry`, nur lesend im Container `skriptorium:local`); behoben, indem der sichtbare Filter auf `index.sqlite` neu gesetzt und gespeichert wurde – danach nur noch ein Filter.
- Lokale Wiederherstellung: „is an unexpected token … Line 1, position 49“ = Tippfehler im Endpunkt, Antwort war eine Webseite.
- Wiederhergestellte Ordner waren schreibgeschützt (`Permission denied` beim Löschen) – im Runbook `chmod -R u+w` ergänzt.
- Duplicati-Anmeldepasswort vergessen: vom Eigentümer mit `duplicati-server-util change-password` im Container neu gesetzt.
- Export „Als Befehlszeile“ zeigt `&` als `&`.

### 2026-09-30 00:10 – [BEOBACHTUNG] Duplicati auf dem VPS hatte keinen Auftrag

- Duplicati-Serverdatenbank: Tabelle `Backup` enthält nur ID 1 „Skriptorium“, `sqlite_sequence` für `Backup` = 1. Die Annahme aus 4.2 / `docs/research/vps-bestand.md`, das Datenverzeichnis sei von der vorhandenen Sicherung erfasst, war falsch; korrigiert an 4.2. Auch die übrigen Dienste des Eigentümers auf dem VPS werden damit von Duplicati nicht gesichert – nicht Teil des Projekts, Eigentümer informiert.

### 2026-09-29 23:25 – [BEOBACHTUNG] Bestand für 4.3 auf dem VPS; Index-Neuaufbau ohne Aufrufer

- **Duplicati auf dem VPS:** Container `lscr.io/linuxserver/duplicati:latest` (v2.2.0.3_stable, Build 2026-03-28), läuft als root, `/opt/docker` schreibgeschützt unter `/source`; Weboberfläche über den Proxy. Datenverzeichnis des Skriptoriums damit unter `/source/skriptorium/data/` erreichbar. Neuer Auftrag darf nur dieses Verzeichnis sichern – nicht `/source/skriptorium/.env` (OpenRouter-Schlüssel).
- **Datenverzeichnis auf dem VPS:** enthält nur `index.sqlite` – die Einrichtung ist dort noch nicht gelaufen (bleibt dem Eigentümer für den 30-Minuten-Test 4.8 vorbehalten). Für einen aussagekräftigen Wiederherstellungs-Test fehlt echter Inhalt.
- **Index:** `DocumentStore.rebuild_index()` hat im Produktcode keinen Aufrufer; nach einer Wiederherstellung ohne `index.sqlite` legt der Server einen leeren Index an. Wirkung gering: die Oberfläche nutzt den Index nicht (`@`-Menü filtert im Browser, Kontext-Zusammenstellung liest über `list_paths`), nur `GET …/search` (`CanonService.find_entries`) liefert dann nichts. Folge für 4.3: Neuaufbau als ausdrücklicher Schritt im Wiederherstellungs-Verfahren (Python-Aufruf im Container), keine Code-Änderung.

### 2026-09-29 23:10 – [SESSIONSTART] Schritt 4.3 fortsetzen

- **Modell:** Opus 5.5 (`claude-opus-5-5`, laut `get_session`), Entscheidungs-Klasse. Empfohlene Klasse für 4.3: Entscheidung – passt.
- **Umgebung:** Mac des Eigentümers (SSH zum VPS möglich, ADR-025); `main` auf `b3681eb` gezogen, Branch `chore/4.3-backups`.
- **Mindest-Lektüre:** vollständig (project-context, Logbuch ab letztem `[SESSIONENDE]`, Fahrplan Stand und Phase 4, Architektur 1/2/9, Decisions Teil A/C, aktive Blocker); zusätzlich ADR-036 (Schritt verweist darauf).
- **Kontextgröße:** über die Sitzungsabfrage nicht gemeldet – Regel zur Sessiongröße entfällt.
- **Vorhaben:** Duplicati-Auftrag nach MEGA S4 auf dem VPS, erste Sicherung, Beleg der Bucket-Beschränkung, Wiederherstellung auf dem Mac.

### 2026-09-30 – [ADR-ANGELEGT] ADR-036 Sicherungsziel MEGA S4, 4.3 → IN ARBEIT

- Tarif des Eigentümers enthält MEGA S4. Ob Schlüssel auf einen Bucket beschränkbar sind, war zunächst unklar; Recherche: WebFetch auf mega.io gesperrt, Websuche lieferte nur Anleitungen anderer Anbieter; S4-Spezifikation (github.com/meganz/s4-specs) zeigt IAM-Benutzer, verwaltete Richtlinien nur für alle Buckets und Bucket-Richtlinien mit Principal; Mega-Hilfe im eingebauten Browser (help.mega.io, „Bucket-Richtlinien“, „Policies hierarchy“) belegt: Bucket-Richtlinie für einen einzelnen IAM-Benutzer, Standard ist Verweigern.
- Eigentümer legte Bucket, IAM-Benutzer, Bucket-Richtlinie (von der KI vorbereitet: ListBucket; Get/Put/DeleteObject) und Zugangsschlüssel an. ARN im Gespräch genannt (kein Secret), nicht ins Repo übernommen. Schlüsselwerte hat die KI nicht gesehen.
- Entscheidungs-Klasse (Opus 5.5), Eskalations-Auslöser 1 erfüllt.

### 2026-09-29 22:55 – [BEOBACHTUNG] Sicherungsziel 4.3: Mega.nz

- Eigentümer wollte V.4 (TypingMind-Import) ausprobieren; Entscheidung vorgelegt, Antwort: nicht jetzt, V.4 bleibt `[VERSCHOBEN]` (5.5).
- Für 4.3 fragte der Eigentümer nach Duplicati-Zielen (Liste aus docs.duplicati.com) und wählte Mega.nz. Die Duplicati-Doku rät vom Mega-Ziel ab (ungepflegte Bibliothek, Kontopasswort auf dem Server). Offen: ob der Tarif MEGA S4 (S3) enthält – Mega-Seiten waren für die KI nicht abrufbar, S4 daher unbelegt. Notiz an 4.3 ergänzt.

### 2026-09-29 22:40 – [SESSIONENDE] Lokaler Start unter Windows

- **Dauer:** 22:21–22:40 UTC.
- **Bearbeitet:** kein Fahrplan-Schritt – Betriebswunsch des Eigentümers (Software lokal starten); Doku-Nachtrag in `docs/onboarding-runbook.md` (Abschnitte 2, 4, 5) und `docs/project-context.md` Abschnitt 3. Kein Code geändert.
- **Nächster Schritt:** unverändert – Sicherungsziel für 4.3 entscheiden; D.8 (Eigentümer, bis 2026-10-05).
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session`); Doku-Nachtrag ist Routine-Arbeit, nicht abgegeben, weil der Kontext schon geladen war (Hinweis an den Eigentümer gegeben).
- **Kontextgröße:** nicht feststellbar; Session kurz.
- **Sessionende-Prüfungen:** README ohne Änderungsbedarf (Quick Start gilt für Linux/macOS, Windows im Runbook); kein neuer ADR, Reifegrade unverändert; keine aktiven Blocker; Logbuch ca. 475 Zeilen, project-context ca. 341 Zeilen – kein Trigger.

### 2026-09-29 22:35 – [GELÖST] Lokaler Start unter Windows über Docker Desktop

- **Anlass:** Eigentümer wollte die Software auf seinem Windows-11-Rechner lokal starten. Windows ist laut Plattform-Matrix nicht unterstützt.
- **Direkter Start:** uv 0.11.32 kennt Python 3.14.7 nicht → vorhandenes 3.14.2 genommen (`requires-python ==3.14.*`); Node 24.14.0 statt 24.21.0. `uv sync`, `npm ci` und `vite build` liefen, der Server antwortete auf `/api/health`. `skriptorium-einrichtung` brach ab: `[Errno 13] Permission denied: 'data\\system'` – der Verzeichnis-`fsync` in `_write_atomically` (`os.open` auf ein Verzeichnis) geht unter Windows nicht. Die Datei war geschrieben, der Code wurde aber nie ausgegeben; jeder Schreibvorgang wäre gleich gescheitert.
- **Lösung:** Docker Desktop (WSL2) war installiert. Image aus dem `Dockerfile` gebaut, Container mit `-p 127.0.0.1:8000:8000` und Volume `skriptorium-daten` gestartet. Health-Check, Einrichtungscode, Passwort festlegen und Anmelden liefen. Code und Passwort erzeugte ein Skript im Container, das Passwort ging direkt in eine Datei für den Eigentümer; die KI sah nur Status-Codes. Der Eigentümer hat das Passwort danach selbst geändert, die Datei ist gelöscht.
- **Reibung:** Docker Desktop meldete beim Start einen Fehler zu `sailor-ingest.sock` (interner Dienst); die Engine lief trotzdem.
- **Aufgeräumt:** `.venv`, `node_modules`, `dist/`, `data/` aus dem Windows-Versuch entfernt (alle in `.gitignore`).
- **Nicht getan:** kein Fix für den `fsync` unter Windows – Windows bleibt ohne Bedarf (Plattform-Matrix); ein Fix wäre ein eigener Fahrplan-Schritt nach Entscheidung des Eigentümers.

### 2026-09-29 22:21 – [SESSIONSTART] Software lokal starten

- **Modell:** Opus 5.5 (`claude-opus-5-5`, laut `get_session`), Entscheidungs-Klasse.
- **Auftrag:** Software auf dem Windows-Rechner des Eigentümers lokal starten; kein Fahrplan-Schritt. Mindest-Lektüre verkürzt auf `docs/project-context.md` (Plattform-Matrix) und README-Quick-Start, der Eintrag wurde nachgetragen (22:35) – Abweichung von CLAUDE.md Abschnitt 2.

### 2026-09-28 18:25 – [SESSIONENDE] Nachtrag nach D.10

- **Dauer:** 16:04–18:25 UTC (Sessionende 17:40 plus D.10 auf Wunsch des Eigentümers).
- **Bearbeitet seit 17:40:** D.10 → `[ERLEDIGT]`; PR #27 gemergt, PR #28 (D.10 und dieser Eintrag).
- **Nächster Schritt:** unverändert – Sicherungsziel für 4.3 entscheiden; D.8 (Eigentümer, bis 2026-10-05).
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5); D.10 auf der empfohlenen Klasse. Unteragenten im Probelauf (Sonnet 5, Haiku 4.5, Opus 5.5) sind Prüflinge, keine Abgabe. Ab der nächsten Session: ausgabelastige Routine-Arbeit an Sonnet 5 abgeben.
- **Kontextgröße:** ca. 275.000 Token (Grenze 200.000) – Dauerwunsch des Eigentümers.
- **Sessionende-Prüfungen:** README ohne Änderungsbedarf (D.10 nicht nutzerrelevant, Stand-Zeilen weiter richtig); Drift: kein neuer ADR, Reifegrade unverändert; Reaktiv-Quote 0/10; keine aktiven Blocker; Logbuch ca. 445 Zeilen.

### 2026-09-28 18:15 – [ERLEDIGT] D.10 Probelauf Routine- und Mechanik-Klasse

- Auf Wunsch des Eigentümers nach dem Sessionende weitergearbeitet. Aufbau: Worktree von `main` mit 5 eingebauten Abweichungen (README Blocker-Zähler 1, D.6 noch unter „Nächste Schritte“, Host `[VORLÄUFIG]`, Reaktiv-Quote 2/10, ADR-036 in D.6), dort committet, damit kein Diff sie verrät; Soll-Werte für Zählen und Suchen per Skript. Vier frische Unteragenten, wörtlich gleiche Aufträge: Routine-Aufgaben an Sonnet 5 und Opus 5.5, Mechanik-Aufgaben an Haiku 4.5 und Opus 5.5.
- **Routine (Sonnet 5):** 5/5 gefunden, keine falschen Befunde, Zeilenangaben stichprobenartig bestätigt; Logbuch-Entwurf ohne erfundene Fakten, Typ `[PROBLEM-GELÖST]` nach der Typen-Tabelle (begründet). Dauer 3,5 min. → bestanden.
- **Mechanik (Haiku 4.5):** ADR-Zählung und Liste der offenen Schritte richtig; „Pwned Passwords“ in `decisions.md` 8 statt 9 – Zeilen statt Vorkommen gezählt (`grep -c`-Falle). → nicht bestanden, Klasse bleibt inaktiv.
- **Referenz (Opus 5.5):** alles richtig; fand zusätzlich zwei echte Kleinigkeiten: Überschrift der Reifegrad-Übersicht nannte nur 4.2, Typen-Tabelle des Logbuchs nannte `[PROBLEM-GELÖST]`, die Praxis seit Phase 3 `[GELÖST]`. Beide behoben.
- Kontext der Session bei ca. 270.000 Token (Grenze 200.000) – Dauerwunsch des Eigentümers.

### 2026-09-28 17:40 – [SESSIONENDE] 4.2, 4.5, D.6 erledigt; 4.3 zurückgestellt

- **Dauer:** 16:04–17:40 UTC.
- **Bearbeitet:** 4.2 → `[ERLEDIGT]` (ADR-034, Host → `[BELASTBAR]`); 4.3 zurückgestellt (Sicherungsziel offen); 4.5 → `[ERLEDIGT]` (getrennte Instanz, keine Befunde; Bedrohungsmodell → `[BELASTBAR]`); optionale Kopfzeilen nach 4.7; D.6 → `[ERLEDIGT]` (ADR-035, NFR Reaktionszeit → `[BELASTBAR]`). PR #26 gemergt, PR #27 (D.6 und dieser Eintrag).
- **Offen:** 4.3 (Entscheidung Sicherungsziel), danach 4.4, 4.6, 4.7, 4.8; D.8 Rotation (Eigentümer, bis 2026-10-05).
- **Nächster Schritt:** Sicherungsziel für 4.3 entscheiden (Vorschlag A: Mac holt täglich per SSH).
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session`); oberhalb der Empfehlung: D.6 (Routine, Hinweis zu Beginn). Abgegeben: Sicherheitsprüfung 4.5 an Unteragenten mit Sonnet 5 (getrennte Instanz, keine Routine-Abgabe).
- **Kontextgröße:** 254.086 Token nach D.6 (Grenze 200.000) – nach dem Dauerwunsch des Eigentümers weitergearbeitet (Logbuch 2026-09-28 01:00).
- **Kontingent:** Wochenlimit 17 %, 5-Stunden-Limit 15 %.
- **Sessionende-Prüfungen:** README synchron (Phase, Architektur-Reife, Nächste Schritte); Drift: ADR-034 ↔ 4.2, ADR-035 ↔ D.6 vorhanden; Reaktiv-Quote 0/10 (ADR-026..035); Phase 4 mit 12 Schritten unter der Wucherungs-Schwelle 16; Modul-Liste unverändert; Reifegrade ↔ ADRs stimmig (Host, Bedrohungsmodell, Reaktionszeit); keine aktiven Blocker. Logbuch ca. 430 Zeilen, project-context 339 Zeilen – kein Trigger. Ablaufdaten: Vorlauf Guthaben ab 2026-10-22 noch nicht erreicht. Keine Server-Details im Repo (Suche nach Host und Adresse ohne Treffer).

### 2026-09-28 17:30 – [ERLEDIGT] D.6 Reaktionszeit (ADR-035)

- Messung zuerst lokal geplant (Schlüssel verdeckt eingeben); Eigentümer fragte, warum nicht per SSH im Container. Zwei Versuche (Prüfbefehl im Container, Paket bauen) von der Freigabe-Automatik der Sitzung blockiert („Production Reads“, „Remote Shell Writes“); nach ausdrücklicher Anweisung des Eigentümers („bau das Paket, du führst es aus“) lief die Ausführung: Skript samt Kontext per Standardeingabe in `docker exec -i skriptorium python -`, nichts im Container geschrieben, Schlüssel nicht gesehen.
- 28 Läufe, 0,71 $. Ursache: Länge des Vorab-Denkens (ca. 16 ms je Denk-Token), stark streuend; `effort: low` minimal, Abschalten verweigert (HTTP 400), Denk-Obergrenze kontraproduktiv (54–149 s), nur Anbieter xAI. grok-4.7 Median 16 s (4–29), grok-4.6 Median 6 s (5–11).
- Eigentümer wählt A: Zielwerte angepasst (ADR-035), NFR Reaktionszeit → `[BELASTBAR]` (Eskalations-Auslöser 4, Entscheidungs-Klasse). D.6 empfahl Routine – oberhalb der Empfehlung, Hinweis zu Beginn gegeben.

### 2026-09-28 17:05 – [ERLEDIGT] Schritt 4.5 Unabhängige Sicherheitsprüfung

- **Getrennte Instanz:** Unteragent mit Claude Sonnet 5, ohne Gesprächsverlauf; Auftrag: Gesamtsystem auf `main` gegen Bedrohungsmodell (`docs/architecture.md` Abschnitt 6) und ASVS 5.0.0 L1 / Auth und Sitzung L2; nur lesend, ohne `.env` und `data/`. Dauer ca. 4 Minuten, 61 Werkzeugaufrufe.
- **Ergebnis:** keine Befunde hoch oder mittel. Ein niedriger Befund (fehlendes `X-Content-Type-Options: nosniff`, von der Instanz selbst als „unsicher“ markiert): am ASVS-5.0.0-Originaltext (GitHub OWASP/ASVS, Tag v5.0.0) geprüft – 3.4.4 ist Stufe 2, also über dem Niveau → optional. Ebenso optional: `Referrer-Policy` (3.4.5, Stufe 2), `Permissions-Policy`.
- **Ohne Befund geprüft:** Anmeldung, Einrichtungscode, Sperre, Pwned Passwords, Sitzung, Schutz aller Routen, Herkunftsprüfung (auch Streaming), Schlüssel in Code/Image, Pfadsicherheit, SQL, XSS, Logging, Container.
- Bedrohungsmodell vorher auf Stand gebracht (Host und Netz aus 4.2).
- Eigentümer wählt alle drei optionalen Kopfzeilen; umgesetzt in 4.7 (Zusatz dort).

### 2026-09-28 17:05 – [REIFEGRAD-WECHSEL] Bedrohungsmodell → BELASTBAR

- Grundlage: Prüfung 4.5 ohne Befunde. Netz-Teil bleibt `[VORLÄUFIG]` bis 4.7. Eskalations-Auslöser 4 – auf der Entscheidungs-Klasse.

### 2026-09-28 16:35 – [BEOBACHTUNG] 4.3 zurückgestellt

- Eigentümer: Duplicati auf dem VPS hat kein externes Sicherungsziel – auch die übrigen Dienste des Eigentümers sind damit nicht außerhalb des Servers gesichert (Hinweis gegeben). Vorschlag zum Sicherungsziel (A Mac holt per SSH, B gemieteter Speicher mit restic, C Duplicati extern) vorgelegt; Eigentümer: „auf später verlegen“. 4.3 bleibt `[OFFEN]` mit Notiz; Gate 4.6 wartet darauf. Wiederherstellungs-Test auf dem Mac freigegeben.

### 2026-09-28 16:25 – [ERLEDIGT] Schritt 4.2 Host bereitstellen und härten (ADR-034)

- Überwachung auf dem VPS nur lesend geprüft: Uptime Kuma 2.4.0 hängt nur am Proxy-Netz, ohne Docker-Socket – erreicht das Skriptorium nicht (so gewollt, ADR-030). Erster Vorschlag (Kuma bei 4.7 / internes Netz / Push-Job) vom Eigentümer verworfen: „Kuma hat eine andere Aufgabe“. Zweiter Vorschlag: Verzicht per ADR oder GitHub-Actions-Prüfung ab 4.7 → Eigentümer wählt Verzicht (ADR-034, Restrisiko: Ausfall fällt erst beim Öffnen auf).
- Nachgeholter Beleg: automatische Sicherheitsupdates aktiv (Dienst aktiv, Periodic-Einstellungen 1/1, letzter Lauf heute 06:31), Firewall aktiv.
- Abnahme gegen die (geänderten) Akzeptanzkriterien: Ports von außen und SSH-Passwort-Ablehnung aus der vorigen Session belegt.

### 2026-09-28 16:25 – [REIFEGRAD-WECHSEL] Host → BELASTBAR

- Grundlage: Prüfung von außen mit erzwungenem Fehlerfall (Passwort-Anmeldung abgelehnt, geschlossene Ports), Firewall und Updates aktiv, Proxy auf unterstützter Linie (ADR-033). Netz bleibt `[VORLÄUFIG]`, Beförderung in 4.7 nach den Prüfungen durch den Proxy; Secrets und Backups bleiben `[OFFEN]` (4.3, 4.6). Eskalations-Auslöser 4 – auf der Entscheidungs-Klasse.

### 2026-09-28 16:05 – [SESSIONSTART] Schritt 4.2 fortsetzen

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage `get_session`) → Entscheidungs-Klasse; entspricht der Empfehlung für 4.2.
- **Kontingent:** Wochenlimit 15 % (Zurücksetzung So 04.10. 10:00 MESZ), 5-Stunden-Limit 1 % (`get_usage`).
- **Kontext nach der Mindest-Lektüre:** 148.251 Token (Grenze 200.000).
- **Wiedereinstieg:** letztes `[SESSIONENDE]` 2026-09-28 01:45, danach Beobachtung OpenRouter-Schlüssel; PR #25 gemergt (`bacac6d`), Arbeitsbaum sauber. Keine aktiven Blocker, keine offenen STOPP-Situationen.
- **Vorhaben:** 4.2 abschließen – Eintrag in der vorhandenen Überwachung mit absichtlich herbeigeführtem Ausfall; offen D.8 (Rotation, Frist 2026-10-05).

### 2026-09-28 01:55 – [BEOBACHTUNG] OpenRouter-Schlüssel auf dem VPS (4.2, nach dem Sessionende)

- Eigentümer trug den Schlüssel über ein Skript mit verdeckter Eingabe ein (Übertragung per SSH-Standardeingabe, vorher an einer Kopie erprobt). Ergebnis ohne Werte: im Container gesetzt, von OpenRouter erkannt, Ausgabengrenze am Schlüssel 50 $ (Kostenrahmen 50 € je Monat, Hosting ohne Betrag). `.env` mit Rechten 600, Eigentümer root; Container danach `healthy`. Hilfsskripte gelöscht. Beleg für Gate-Punkt 4 (Ausgabengrenze).

### 2026-09-28 01:45 – [SESSIONENDE] Schritt 4.2 (Installation), D.7, 4.12

- **Dauer:** 00:27–01:45 UTC.
- **Bearbeitet:** 4.2 → `[IN ARBEIT]` (Container installiert, ADR-029 bis ADR-032, PR #24 gemergt); D.7 → `[ERLEDIGT]`; 4.12 → `[ERLEDIGT]` (Proxy 3.7.13, ADR-033); D.8 (Rotation) und D.9 (Nachprüfung) angelegt. PR #25 offen.
- **Offen:** 4.2: Überwachung mit erzwungenem Ausfall, OpenRouter-Schlüssel (Eigentümer); D.8 Rotation bis 2026-10-05; Merge von PR #25. Eigentümer fragte nach Freischaltung im Proxy – entschieden: nichts überspringen, erst nach Gate 4.6.
- **Nächster Schritt:** 4.2 abschließen, dann 4.3 und 4.5.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session`); oberhalb der Empfehlung: D.7 (Routine). Abgegeben: nichts.
- **Kontextgröße:** 242.067 Token am Ende (Grenze 200.000) – auf ausdrücklichen Wunsch des Eigentümers weitergearbeitet („verschone mich mit den Session Limits“).
- **Sessionende-Prüfungen:** README synchron (Phase, Nächste Schritte); Drift: ADR-029..032 ↔ 4.2, ADR-033 ↔ 4.12 vorhanden; Reaktiv-Quote 0/10 (ADR-024..033); Phase 4 mit 12 Schritten unter der Wucherungs-Schwelle 16; Modul-Liste und Reifegrade unverändert (Host `[OFFEN]` bis 4.2 abgeschlossen); keine aktiven Blocker. Logbuch ca. 375 Zeilen, kein Archiv-Trigger. Ablaufdaten: Proxy-Linie im Register (D.9); Vorlauf Guthaben ab 2026-10-22 noch nicht erreicht. Keine Server-Details im Repo (Suche nach Host, Adresse, Hash ohne Treffer).

### 2026-09-28 01:35 – [BEOBACHTUNG] Rotation D.8 abgebrochen

- Eigentümer meinte zunächst, das alte Passwort nicht mehr zu kennen (später korrigiert: bekannt); gewählt: eigenes Passwort über ein Skript mit verdeckter Eingabe (bcrypt-Hash direkt auf den Server, KI sieht weder Passwort noch Hash), gegen eine Kopie der Konfiguration erprobt. Eigentümer brach vor der Eingabe ab. Konfiguration unverändert (Prüfsummen-Präfix gleich), Hilfsskripte entfernt. D.8 bleibt offen, Frist 2026-10-05.

### 2026-09-28 01:20 – [ERLEDIGT] Schritt 4.12 Proxy-Update (ADR-033)

- Eigentümer gibt nach dem STOPP frei („ja“). Sicherungskopie (16 MB, mit Zertifikaten); dabei brach `tar` zuerst ab, weil sich das laufende Zugriffsprotokoll beim Lesen änderte – wiederholt mit Duldung genau dieser Warnung.
- Umstellung 2.11.42 → 3.7.13 per Image-Tag, Unterbrechung ca. 15 s. 9 Hostnamen vorher/nachher identisch; von außen drei Hosts mit gültigem Zertifikat, Umleitung HTTP→HTTPS wirkt. Keine Fehler im Protokoll nach dem Start.
- 3.7 meldet zwei neue Hinweise: `aliasHeadersStrategy` nicht gesetzt (Kopfzeilen wie `X_Auth_User` werden durchgereicht – relevant für PHP-Dienste) und Voreinstellungen für kodierte Zeichen im Pfad. Nicht Teil der Anforderungen des Skriptoriums (Obergrenze Schutzbedarf) – dem Eigentümer als optional vorgelegt.

### 2026-09-28 01:10 – [STOPP] Passwort-Hash der Proxy-Verwaltung in der Ausgabe (4.12)

- Beim Lesen der dynamischen Proxy-Konfiguration wurden Hostnamen ausgeblendet, der Hash des Passworts für die Proxy-Verwaltung aber nicht. Gilt als kompromittiert (`CLAUDE.md` Abschnitt 6). Eigentümer sofort informiert; Rotation als D.8 mit Frist angelegt. Update 4.12 angehalten bis zur Antwort.
- **Lehre:** Beim Lesen fremder Konfigurationen nicht nur Hostnamen, sondern alle Zeilen mit `users`, `password`, `key`, `secret`, `token` ausfiltern.

### 2026-09-28 01:00 – [ERLEDIGT] D.7 Unterstützungsstand des Proxys

- Proxy 2.11.42; Sicherheitsunterstützung der Linie 2.11 endete 2026-09-07, nur 3.7 wird noch unterstützt (Hersteller-Tabelle). Register-Eintrag und Schritt 4.12 (Update, freigabepflichtig) angelegt.
- Alle Routing-Regeln der angebundenen Dienste nutzen nur `Host`, `PathPrefix`, `&&`, `||` – in v3 unverändert gültig (nur lesend geprüft, Details lokal).
- „Weiter hier“ vom Eigentümer als Dauerwunsch („verschone mich mit den Session Limits“); Kontext über der Grenze von 200.000 Token – Abweichung nach `CLAUDE.md` Abschnitt 0 vermerkt.

### 2026-09-28 00:45 – [BEOBACHTUNG] Prüfung von außen (4.2)

- Alle 65.535 TCP-Ports von außen geprüft: offen SSH, HTTP, HTTPS und zwei Ports eines anderen Dienstes des Eigentümers – einer davon liefert eine Anwendung ohne TLS am Proxy vorbei aus (in der Firewall ausdrücklich freigegeben). Nicht Sache des Skriptoriums; Eigentümer im Chat informiert, Details nur dort. Für Gate-Punkt 3 relevant, weil der Host geteilt ist.
- SSH mit Passwort: abgelehnt, angeboten wird nur `publickey`.
- Proxy läuft in der Major-Linie 2; Unterstützungsstand ungeprüft → D.7.

### 2026-09-28 00:40 – [BEOBACHTUNG] Skriptorium auf dem VPS installiert (4.2)

- Image lokal (arm64) zur Probe gebaut, 236 MB; dann auf dem VPS aus dem Quellstand `f79e8af` gebaut (wie eine vorhandene Anwendung des Eigentümers). Compose-Projekt mit eigenem Netz, ohne Port, ohne Proxy-Router; Dateisystem schreibgeschützt, alle Capabilities entzogen, `no-new-privileges`, Speichergrenze 1 GB.
- Auf dem Server: Gesundheitsprüfung ok, `/api/worlds` 401, Oberfläche 200, Pwned Passwords aus dem Container erreichbar, Container nach 60 s `healthy`. Von außen Port 8000 nicht erreichbar.
- `.env` nur für root lesbar, ohne OpenRouter-Schlüssel – den trägt der Eigentümer selbst ein (die KI fasst keine Secrets an).
- Compose-Datei und Einrichtung stehen nur auf dem Server (Eigentümer: keine Server-Details im Repo).

### 2026-09-28 00:30 – [ADR] ADR-029 bis ADR-032

- Eigentümer: Einrichtung mit root-Zugang, keine Server-Details im Repo, erst nach dem Gate öffentlich, sonst alle Empfehlungen (offizielle Images, eigenes Netz, Kurznamen im Proxy-Protokoll zulässig). Beschränkung des KI-Zugangs danach bleibt offen bis 4.6.

### 2026-09-28 00:27 – [SESSIONSTART] Schritt 4.2

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage `get_session`) → Entscheidungs-Klasse; entspricht der Empfehlung für 4.2.
- **Kontingent:** Wochenlimit 6 % (Zurücksetzung So 04.10. 10:00 MESZ), 5-Stunden-Limit 26 % (`get_usage`).
- **Kontext nach der Mindest-Lektüre:** 142.380 Token (Grenze 200.000).
- **Wiedereinstieg:** letztes `[SESSIONENDE]` 2026-09-28 00:20; PR #23 gemergt (`8338a59`), Arbeitsbaum sauber. Keine aktiven Blocker, keine offenen STOPP-Situationen.
- **Vorhaben:** 4.2 nach ADR-027 – Entscheidungen zu Container-Image und KI-Konto vorlegen.

### 2026-09-28 00:20 – [SESSIONENDE] Schritte 4.9 und 4.11

- **Dauer:** 00:05–00:20 UTC.
- **Bearbeitet:** 4.9 → `[ERLEDIGT]` (Validierung im frischen Klon); 4.11 → `[ERLEDIGT]` mit ADR-028. PR #23 (4.9 und 4.11 als Bündel).
- **Offen:** Merge von PR #23 durch den Eigentümer.
- **Nächster Schritt:** neue Session – 4.2 nach ADR-027 (Dockerfile und Compose, Entscheidungen zu Container-Image und KI-Konto vorlegen).
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session`); oberhalb der Empfehlung: 4.9 (Routine). Abgegeben: Klon-Validierung an einen Unteragenten gleicher Klasse – nicht aus Kostengründen, sondern um den Kontext dieser Session klein zu halten.
- **Kontextgröße:** 178.530 Token am Ende (Grenze 200.000); 136.494 schon nach der Mindest-Lektüre.
- **Sessionende-Prüfungen:** README synchron (Status, Nächste Schritte); Drift: ADR-028 ↔ 4.11 vorhanden; Reaktiv-Quote korrigiert (s. u.), jetzt 0/10 über ADR-019..028; Phase 4 mit 11 Schritten unter der Wucherungs-Schwelle 16; Modul-Liste und Reifegrade unverändert; keine aktiven Blocker. Archiv-Trigger nicht erreicht (Logbuch ca. 310 Zeilen). Ablaufdaten: Vorlauf des Guthabens (2026-11-05) beginnt 2026-10-22, noch nicht erreicht. Keine Server-Details im Repo.

### 2026-09-28 00:19 – [GELÖST] Reaktiv-Quote falsch gezählt

- **Symptom:** Teil A nannte 0/10 über ADR-018..027, obwohl ADR-018 `[REAKTIV]` ist – richtig wäre 1/10 gewesen (unter der Schwelle 30 %, also ohne Folgen).
- **Lösung:** Mit ADR-028 fällt ADR-018 aus dem Fenster; Wert 0/10 über ADR-019..028, Korrektur in Teil A vermerkt.

### 2026-09-28 00:18 – [ERLEDIGT] Schritt 4.11 Branch-Schutz (ADR-028)

- Eigentümer wählt A. Schutz an `main`: vier Pflicht-Checks (Namen der CI-Jobs), Pull Request ohne Pflicht-Review, Force-Push und Löschen gesperrt, Admins ausgenommen.
- **Erzwungener Fehler** an Wegwerf-Branch `test/4.11-schutzprobe` mit gleicher Einstellung: Force-Push abgelehnt (GH006), Löschen abgelehnt, direkter Push als Admin „Bypassed“. Probe-Branch danach entfernt. Nicht an `main` erprobt – wäre bei Versagen destruktiv (Stopp-Kriterium 6); Akzeptanzkriterium entsprechend erfüllt über identische, per API ausgelesene Einstellung.
- **Beobachtung:** Admin-Ausnahme gilt auch für den Coding-Agent (pusht mit dem Konto des Eigentümers). Umbenennung eines CI-Jobs würde jeden Merge blockieren, bis der Pflicht-Check nachgezogen ist.

### 2026-09-28 00:15 – [ERLEDIGT] Schritt 4.9 Entwicklungsumgebung macOS

- Plattform-Matrix macOS arm64 auf ✓; Runbook Abschnitt 1, 2 und 5 nachgezogen; README Status und Nächste Schritte.

### 2026-09-28 00:12 – [ONBOARDING-VALIDATION] macOS arm64, frischer Klon (4.9)

- **Durchführung:** Unteragent (Opus 5.5, abgegeben wegen Kontextgröße, nicht wegen Klasse), `git clone` des lokalen Repos von `f75be2d` ins Scratch-Verzeichnis; SessionStart-Hook, dann Quick Start aus der README exakt wie dokumentiert. Dauer ca. 2 Minuten.
- **Ergebnis:** ohne Bruch. pytest 381/381 (Zeilen 100 %, Zweige 98,8 %, gesamt 99,78 %); vitest 96/96 (98,65 % Zeilen, 96,22 % Zweige); Playwright 8/8; Pre-Commit 17/17 Hooks; Server: `/api/health` ok, `/api/worlds` 401, `/` 200. Versionen uv 0.12.19, Python 3.14.7, Node 24.21.0, npm 11.19.0.
- **Einschränkung:** nicht völlig frisch – Werkzeug-Cache `~/.cache/skriptorium-tools/`, Pre-Commit-Cache und Chromium waren vorhanden; die Download-Pfade des Hooks liefen nicht erneut. Geklont aus dem lokalen Repo statt von GitHub.
- **Befunde (Doku, nichts blockierend):** Runbook nannte nur Linux als unterstützt und die Validierung als offen; kein macOS-Abschnitt in Runbook 5 (PATH außerhalb der Session, `fsevents`-Hinweis von npm zu `allowScripts`, `npm install` im Hook statt `npm ci`). Behoben im selben Commit.

### 2026-09-28 00:05 – [SESSIONSTART] Schritt 4.9 abschließen

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage `get_session`) → Entscheidungs-Klasse. 4.9 ist Routine: läuft oberhalb der Empfehlung, weil kein Probelauf für die Routine-Klasse vorliegt (knappe Ressource: Wochenkontingent, Stand 6 %, Zurücksetzung So 10:00 MESZ).
- **Kontext nach der Mindest-Lektüre:** 136.494 Token (Grenze 200.000); Grundlast bereits über der Hälfte der Grenze.
- **Wiedereinstieg:** letztes `[SESSIONENDE]` 2026-09-28 00:00; PR #22 gemergt (`f75be2d`). Nachtrag aus der vorigen Session: Nach PR #22 wurden alle gemergten Remote-Branches gelöscht (13 alte Cloud-Session-Branches und die Branches aus 4.9/4.10) sowie der ungemergte, überholte Branch `claude/was-haben-wir-hier-nagbzp` (Löschung vom Eigentümer freigegeben). Auf GitHub existiert nur `main`.
- **Vorhaben:** 4.9 abschließen – Validierung des Onboarding-Pfads im frischen Klon auf macOS, Plattform-Matrix auf ✓.

### 2026-09-28 00:10 – [BEOBACHTUNG] Kein Force-Push; `main` ohne Branch-Schutz

- Eigentümer fragte nach Force-Push, um den Host-Namen aus der Historie zu entfernen. Vorher geprüft: Die betroffenen Commits (`2f2fe82`, `a392057`) bleiben über PR #21 auf GitHub sichtbar; entfernen kann nur der GitHub-Support. Die Subdomains sind ohnehin über Certificate Transparency öffentlich. Eigentümer entschied: kein Force-Push.
- Dabei gefunden: `main` hat keinen Branch-Schutz – Widerspruch zu `docs/project-context.md` Abschnitt 7 und 10. Schritt 4.11 angelegt.

### 2026-09-28 00:00 – [SESSIONENDE] Erkundung VPS (4.10) nach „weiter hier“

- **Dauer:** 23:35–00:00 UTC (Fortsetzung nach dem Sessionende um 22:58).
- **Bearbeitet:** 4.10 → `[ERLEDIGT]` mit ADR-027; Kostenregister und 4.9 nach Vorgabe des Eigentümers angepasst.
- **Offen:** 4.9 Validierung im frischen Klon; Pull Request für diesen Branch.
- **Nächster Schritt:** neue Session – 4.9 abschließen, dann 4.2 nach ADR-027.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5); oberhalb der Empfehlung: 4.9 (Routine). Abgegeben: nichts.
- **Kontextgröße:** über 200.000 Token auf ausdrückliche Anweisung („weiter hier“).
- **Sessionende-Prüfungen:** Drift: ADR-027 ↔ 4.10/4.2 vorhanden; Reaktiv-Quote 0/10 (ADR-018..027); Phase 4 10 Schritte (Schwelle 16); Modul-Liste und Reifegrade unverändert; README unverändert gültig (Nächste Schritte 4.9/4.2). Keine Server-Details im Repo (Suche nach Host-, Proxy- und Pfadnamen ohne Treffer).

### 2026-09-27 23:55 – [ADR] ADR-027 Container hinter dem vorhandenen Reverse Proxy

- Eigentümer wählt A: Das Skriptorium läuft wie die übrigen Anwendungen auf dem VPS als Container hinter dem vorhandenen Proxy. Konfidenz hoch, Umkehrbarkeit billig. 4.2 entsprechend ergänzt; 4.10 erledigt.

### 2026-09-27 23:50 – [GELÖST] Server-Details beinahe im öffentlichen Repo

- **Symptom:** Die erste Fassung der Erkundungs-Notiz enthielt Dienste, Ports, Subdomains und Benutzer des Servers; das Commit wurde vom Werkzeug blockiert. Das Repo ist öffentlich.
- **Lösung:** Eigentümer entscheidet: Details nur lokal außerhalb des Repos; im Repo eine allgemeine Fassung. Der Host-Name aus früheren Commits wurde in den aktuellen Dateien ersetzt, bleibt aber in der Git-Historie.
- **Lehre:** Vor jeder Notiz über Betriebsumgebungen prüfen, ob das Repo öffentlich ist.

### 2026-09-27 23:45 – [BEOBACHTUNG] Bestand auf dem VPS erhoben (4.10)

- Container-Muster mit Reverse Proxy, Überwachung, Sicherung und Runner vorhanden; Firewall, SSH-Härtung und Updates aktiv. Sechs Befunde für das Skriptorium, u. a. Proxy-Adresse im Docker-Netz statt `127.0.0.1` (ADR-017) und Zugriffsprotokoll des Proxys: `docs/research/vps-bestand.md`.

### 2026-09-27 23:35 – [BEOBACHTUNG] „Weiter hier“ über der Kontextgrenze

- Kontext 185.449 Token (Grenze 200.000). Eigentümer sagt ausdrücklich „weiter hier“ und beauftragt die Erkundung des VPS (Schritt 4.10). Abweichung nach `CLAUDE.md` Abschnitt 0 vermerkt.
- Eigentümer: Tarif und Preis des VPS sind nicht Sache des Projekts – Kostenregister und Akzeptanzkriterium von 4.9 angepasst. PR #21 gemergt (`d8bc2bf`).

### 2026-09-27 22:58 – [SESSIONENDE] Schritt 4.9 teilweise

- **Dauer:** 22:28–22:58 UTC.
- **Bearbeitet:** 4.9 – Bestandsaufnahme Mac, ADR-026, Einrichtungsskript für macOS arm64, alle Prüfungen im Haupt-Checkout, Test-Fix E2E, SSH-Abfrage VPS.
- **Erreichter Stand:** 4.9 `[IN ARBEIT]`; Commit `2f2fe82` plus Sessionende-Commit auf `chore/4.9-entwicklung-macos`.
- **Offen:** Validierung im frischen Klon; Plattform-Matrix `docs/project-context.md` Abschnitt 3 auf ✓ (erst danach); Tarif und Preis des VPS vom Eigentümer; Pull Request für diesen Branch.
- **Nächster Schritt:** neue Session – 4.9 abschließen (frischer Klon, Matrix, Kostenregister), dann 4.2.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5 laut `get_session`). Schritte oberhalb der Empfehlung: 1 (4.9, Routine; mangels Probelauf ohne Warnung). Abgegeben: nichts.
- **Kontextgröße:** ca. 185.000 Token (`get_usage` 173.395 vor den letzten Schritten) – Grenze 200.000 fast erreicht, deshalb Abschluss vor Ende des Schritts.
- **Sessionende-Prüfungen:** README (Voraussetzungen) im Skript-Commit nachgezogen; Phase und Nächste Schritte unverändert gültig. Drift: ADR-026 ↔ 4.9 vorhanden; Modul-Liste und Reifegrade unverändert; Reaktiv-Quote 1/10 (ADR-017..026); Phase 4 9 Schritte; Blocker 0. Ablaufdaten-Register: Guthaben-Vorlauf ab 2026-10-22, noch nicht erreicht (lokale Sessions laufen über das Abo). Archivierung: kein Trigger. Onboarding-Pfad: `scripts/` berührt – Validierung im frischen Klon steht aus (offen in 4.9, s. o.).

### 2026-09-27 22:56 – [BEOBACHTUNG] VPS ist bereits in Benutzung; Grundlast des Kontexts

- SSH per Schlüssel (`id_ed25519_ebvps`) als `root`: Ubuntu 24.04.5 LTS, Kernel 6.8, x86_64, 4 Kerne, 7,8 GB RAM (2,4 GB belegt), 251 GB Platte (39 GB belegt), seit 3 Wochen in Betrieb. Nur lesende Befehle. Folgen für 4.2: vorhandene Dienste vor jeder Firewall-Änderung erfassen; eigenes Benutzerkonto für die KI statt `root` (Gate-Punkt 4).
- Lokale Desktop-Session: Werkzeuge, Speicherdateien und Skills belegen schon ca. 85.000 Token vor der ersten Nachricht, die Pflichtlektüre weitere ca. 58.000. Bei der Grenze 200.000 bleiben für die Arbeit nur ca. 57.000 Token – zu wenig für einen mittelgroßen Schritt. Kandidat für eine Anpassung der Grenze (Vorschlag an den Eigentümer).
- `npm install` meldet auf macOS `fsevents` mit Installationsskripten (nicht freigegeben, optionale macOS-Abhängigkeit); ohne Wirkung auf die Tests. Warnungsquelle ohne Schalter.

### 2026-09-27 22:50 – [GELÖST] End-to-End-Test „marked passage“ scheitert auf macOS

- **Symptom:** Schaltfläche „In den Kanon“ bleibt gesperrt, Zeitüberschreitung. Zuvor alle 8 Tests mit „Not Found“ – nur weil die Oberfläche nicht gebaut war (`npx vite build` fehlte, im Runbook jetzt genannt).
- **Ursache:** `Control+Home`/`Control+End` sind auf macOS in CodeMirror nicht Dokument-Anfang/-Ende (dort `Cmd`); es wird nichts markiert.
- **Lösung:** `ControlOrMeta+Home`/`+End` in `e2e/skriptorium.spec.ts`; unter Linux unverändert `Control`. 8/8 in zwei Läufen grün.

### 2026-09-27 22:40 – [ADR] ADR-026 Einrichtungsskript auch für macOS

- Bestandsaufnahme Mac: macOS 27.0 arm64, Homebrew 7.0.4, uv 0.11.7 (Homebrew), Node 24.15.0 / npm 11.12.1 (nodejs.org-Installer, root), Python 3.9.6, bash 3.2 – alles unter den Projektversionen. Eigentümer wählt Option A: `scripts/session-start.sh` auch für macOS arm64, Werkzeuge in `~/.cache/skriptorium-tools`. Konfidenz mittel (Hook-Umgebung der Desktop-App, bash 3.2), Umkehrbarkeit billig.
- VPS für das Skriptorium ist laut Eigentümer ein bestimmter Host-Eintrag in seiner `~/.ssh/config` (Name nur lokal, Repo öffentlich).

### 2026-09-27 22:28 – [SESSIONSTART] Schritt 4.9 – erste Session auf dem Mac

- **Modell:** eingestellt `claude-opus-5-5` (Sitzungsabfrage `get_session` 22:28) → Entscheidungs-Klasse. Empfohlene Klasse für 4.9 ist Routine; deren Probelauf ist offen, deshalb übernimmt die Entscheidungs-Klasse – keine Warnung nötig, keine Abgabe möglich.
- **Umgebung:** erste lokale Session in der Claude-Desktop-App auf dem Mac des Eigentümers (macOS, Darwin 27.0.0), nicht mehr Cloud-Session (ADR-025).
- **Kontextgröße:** 142.965 Token nach der Pflichtlektüre laut Sitzungsabfrage (`get_usage`; Kontextfenster 1.000.000). Grenze 200.000 – Spielraum für diese Session ca. 57.000 Token. Erstmals zu Beginn ein echter Wert (in der Cloud-Session stand dort 0). Kurzzeitlimit 21 %, Wochenlimit 6 % (Zurücksetzung 2026-10-04 08:00 UTC).
- PR #20 gemergt (`9cc0bd3`); Branch `chore/4.9-entwicklung-macos` von `main` angelegt (Namensform nach `docs/project-context.md` Abschnitt 10 – erstmals frei wählbar).
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2 (project-context, Logbuch ab letztem Sessionende, Fahrplan Stand und Phase 4, Architektur 1/2/9, Decisions A/C, aktive Blocker: keine).
- **Vorhaben:** Schritt 4.9 Entwicklungsumgebung macOS einrichten.

### 2026-09-27 22:22 – [SESSIONENDE] Anbieter für 4.2 entschieden, Wechsel auf macOS

- **Dauer:** 22:15–22:22 UTC.
- **Bearbeitet:** 4.2 – `ENTSCHEIDUNG ERFORDERLICH` zum VPS-Anbieter vorgelegt (Recherche `docs/research/hosting-anbieter.md`); Eigentümer entschied: vorhandener netcup-VPS, Entwicklung wechselt auf macOS, von dort SSH-Zugriff der KI (ADR-025). Neuer Schritt 4.9 „Entwicklungsumgebung macOS einrichten“ angelegt; 4.2 hängt davon ab.
- **Erreichter Stand:** 4.2 `[OFFEN]` mit entschiedenem Anbieter; Phase 4 jetzt 9 Schritte (Wucherungs-Schwelle nicht berührt).
- **Offen:** Tarif, Ausstattung, Betriebssystem und Laufzeit des netcup-VPS unbekannt (Erfassung in 4.9); Umfang des SSH-Zugriffs der KI (in 4.2, belegt in 4.6); Pull Request für diesen Branch.
- **Nächster Schritt:** 4.9 in der ersten Session auf dem Mac – Onboarding-Pfad auf macOS validieren, SSH zum VPS herstellen, VPS-Daten erfassen.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 22:21). Schritte oberhalb der Empfehlung: 0. Abgegeben: nichts.
- **Kontextgröße:** 176.519 Token laut Sitzungsabfrage – unter der Grenze 200.000. Kurzzeitlimit `allowed`. Kosten der Session laut Abfrage 2,28 $ (Guthaben).
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Nächste Schritte). Drift-Prüfung: ADR-025 ↔ 4.2/4.9 vorhanden; Modul-Liste unverändert; Reifegrade unverändert (Host `[OFFEN]`, Netz `[VORLÄUFIG]`), Host-Zeile in Architektur Abschnitt 6 nachgezogen; Reaktiv-Quote 1/10 (ADR-016 bis ADR-025, ADR-025 nicht reaktiv: Kategorien 3, 6, 7); Plattform-Matrix und Runbook konsistent (macOS vorgesehen, nicht validiert); Blocker 0; Anforderungen unverändert. Ablaufdaten-Register: kein Vorlauf erreicht. Archivierung: kein Trigger. project-context 338 Zeilen. Onboarding-Pfad: nicht berührt (nur Dokumentation).

### 2026-09-27 22:21 – [ADR] ADR-025 netcup-VPS, macOS, SSH-Zugang der KI

- Eigentümer hat bereits einen netcup-VPS; kein Neukauf. Da die Cloud-Session kein SSH nach außen erlaubt, wechselt die Entwicklung auf seinen Mac. Konfidenz mittel (VPS-Daten unbekannt), Umkehrbarkeit billig.

### 2026-09-27 22:18 – [BEOBACHTUNG] Anbieterlage und SSH aus der Cloud-Session

- **SSH gesperrt:** Aus der Cloud-Session sind ausgehende Verbindungen auf Port 22 nicht möglich (Test gegen github.com:22). Die KI kann einen Server also nicht selbst per SSH einrichten; Einrichtung über Browser-Konsole des Anbieters, Cloud-Init oder GitHub Actions.
- **Hetzner ausverkauft:** Alle günstigen Cloud-Tarife (CX, CAX) seit 2026-09-07 nicht bestellbar, Preise 2026 zweimal erhöht; verfügbar nur teurere Tarife ab ca. 14 € brutto. Übersicht aller geprüften Anbieter: `docs/research/hosting-anbieter.md`.

### 2026-09-27 22:15 – [SESSIONSTART] Schritt 4.2

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 22:15) → Entscheidungs-Klasse. Empfohlene Klasse für 4.2 ist Entscheidung (Eskalations-Auslöser 1) – passt, kein Stopp, keine Warnung.
- **Kontextgröße:** 0 Token laut Sitzungsabfrage (Wert zu Beginn nicht aktualisiert, wie in den Vorsessions). Kurzzeitlimit (5 Stunden) `allowed`.
- PR #19 gemergt (`a528047`); Branch `scp/sharp-wright-4ofnvz` steht auf `main`.
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2 (project-context, Logbuch ab letztem Sessionende, Fahrplan Stand und Phase 4, Architektur 1/2/9, Decisions A/C, aktive Blocker: keine).
- **Vorhaben:** Schritt 4.2 Host bereitstellen und härten – zuerst `ENTSCHEIDUNG ERFORDERLICH` zum VPS-Anbieter (Kategorien 3, 6, 7).

### 2026-09-27 13:10 – [SESSIONENDE] Schritt 4.1

- **Dauer:** 12:48–13:10 UTC.
- **Bearbeitet:** 4.1 Qualitäts-Härtung → `[ERLEDIGT]`.
- **Erreichter Stand:** Coverage nachgewiesen (Python 99,78 %, `canon`/`context` 100 %; Oberfläche 98,65 % Zeilen, 96,43 % Zweige); Fehler in der Seitenauswahl von `context` behoben; Tempo `storage` im Referenzumfang gemessen; Geschichtenseite aufgeteilt.
- **Offen:** Pull Request für diesen Branch (Merge nach grüner CI und Zustimmung des Eigentümers).
- **Nächster Schritt:** 4.2 Host bereitstellen und härten – `ENTSCHEIDUNG ERFORDERLICH` zum VPS-Anbieter (Kategorien 3, 6, 7), Entscheidungs-Klasse.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 12:59). Schritte oberhalb der Empfehlung: 1 (4.1, Routine) – ohne Warnung, weil die Routine-Klasse mangels Probelauf inaktiv ist und ihre Arbeit eine Klasse höher läuft. Abgegeben: nichts.
- **Kontextgröße:** nicht feststellbar – die Sitzungsabfrage meldet während der Session 0 Token; Regel „Sessiongröße“ entfällt für diese Session. Kurzzeitlimit `allowed`.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Nächste Schritte); project-context Status nachgezogen. Drift-Prüfung: 4.1 ↔ ADR-024 vorhanden; Modul-Liste unverändert (nur Dateien innerhalb von `ui`); Reifegrad `storage` um die Messung ergänzt, kein Wechsel; keine neuen ADRs, Reaktiv-Quote 1/10 unverändert; Phase 4 unverändert 8 Schritte; Blocker 0; Anforderungen unverändert. Ablaufdaten-Register: kein Vorlauf erreicht (Guthaben ab 2026-10-22). Archivierung: kein Trigger (Logbuch unter 1.600 Zeilen, Phase 4 offen). project-context 338 Zeilen. Onboarding-Pfad: nicht berührt (keine Änderung an README-Quick-Start, `scripts/`, `.env.example`, Abhängigkeiten).

### 2026-09-27 13:05 – [ERLEDIGT] Schritt 4.1 Qualitäts-Härtung

- **Coverage:** Python 381 Tests, 99,78 % (Zeilen und Zweige); `canon` 100 %, `context` 100 % (kritische Pfade ≥ 90 %). Oberfläche 96 Komponenten-Tests, 98,65 % Zeilen, 96,43 % Zweige; 8 End-to-End-Tests grün. Verbleibende Teilzweige in `ai_gateway`, `api` (6) sind Absicherungen ohne erreichbaren Normalfall (z. B. Anbieter ohne `aclose`) – bewusst nicht gezielt getestet.
- **Randfälle:** Abbruch, Ablehnung, zu großer Kontext und zu großes Kapitel für die Kurzfassung waren schon abgedeckt; neu: Weiterschreiben mit leerem Kanon und leerem Kapitel, sehr langes Kapitel (siehe `[GELÖST]`).
- **Aufteilung (ADR-024):** `StoryPage.tsx` 757 Zeilen → `StoryPage` 104, `Guests` 144, `WritingMode` 103, `Facts` 67, `StorySummary` 56, `ChapterSummary` 80, `ChapterEditor` 226; `SceneForm` (73) aus `WritingPanel.tsx` (jetzt 372) gelöst. Tests unverändert grün, Coverage gleich; danach Lücke „Figur abwählen“ in `SceneForm` (50 % Zweige) und `WritingMode` mit Tests geschlossen.
- DoD: ruff, mypy, bandit, eslint, prettier, tsc grün; pip-audit und `npm audit` ohne Befund; Pre-Commit bei jedem Commit aktiv.

### 2026-09-27 13:00 – [BEOBACHTUNG] Tempo von `storage` im Referenzumfang

- 60 Kapitel × 40.000 Zeichen (ca. 727.000 Token) plus 500 Kanon-Einträge: Kapitel speichern 48 ms, alle Kapitel lesen 50 ms, Kontext bauen 161 ms, Volltextsuche 1,7 ms, Index neu aufbauen 257 ms (Median aus 7 Läufen). Alles weit unter dem Anzeige-Ziel 1 s; kein Handlungsbedarf. Protokoll: `spikes/storage-tempo/README.md`; auf dem VPS aus 4.2 wiederholbar.

### 2026-09-27 12:58 – [GELÖST] Langes Kapitel ohne Leerzeilen – KI bekam kein Manuskript

- **Symptom:** Probe mit 3.000 Zeilen (518.000 Zeichen), nur durch einfache Zeilenumbrüche getrennt: die Anfrage enthielt keine einzige Manuskriptseite, ohne Meldung. Mit Leerzeilen dazwischen gingen ca. 26.000 Token mit.
- **Ursache:** `_last_pages` nimmt ganze Absätze von hinten (Trennung `\n\n`) und bricht ab, sobald einer nicht passt – ist schon der letzte Absatz zu groß, bleibt nichts.
- **Lösung:** Passt schon der letzte Absatz nicht, geht sein Ende ab einer Wortgrenze mit vorangestelltem „…“ ein (Muster wie `_opening`); Zeilenumbrüche bleiben erhalten; ganze Absätze bleiben der Normalfall. Tests scheitern ohne die Korrektur (geprüft). Architektur Abschnitt 3 (`context`) ergänzt; keine Schnittstellenänderung.

### 2026-09-27 12:57 – [BEOBACHTUNG] Playwright ohne passenden Browser (bekannt)

- End-to-End-Tests zuerst rot („Executable doesn't exist … chromium_headless_shell-1234“); mit `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium` grün. Steht im Runbook (Troubleshooting); dritte Session in Folge – Kandidat für `scripts/session-start.sh`, aber das wäre eine neue ENV-Voraussetzung im Skript und damit nicht im Autonomiebereich. Nur beobachtet.

### 2026-09-27 12:48 – [SESSIONSTART] Schritt 4.1

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 12:48) → Entscheidungs-Klasse. Empfohlene Klasse für 4.1 ist Routine; deren Probelauf ist offen, deshalb übernimmt die Entscheidungs-Klasse (`docs/project-context.md` Abschnitt 6) – keine Warnung nötig, keine Abgabe möglich.
- **Kontextgröße:** 0 Token laut Sitzungsabfrage (neue Session; Wert zu Beginn nicht aktualisiert). Kurzzeitlimit (5 Stunden) `allowed`.
- PR #18 gemergt (`fdd9822`); Branch `claude/neue-session-4-1-vydo3a` steht auf `main`.
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2 (project-context, Logbuch ab letztem Sessionende, Fahrplan Stand und Phase 4, Architektur 1/2/9, Decisions A/C, aktive Blocker: keine).
- **Verfeinerung Phase 4:** Schritte 4.1–4.8 sind mit Eingabe, Zu tun und Akzeptanzkriterien ausgearbeitet; keine Änderung am Schrittplan nötig.
- **Vorhaben:** Schritt 4.1 Qualitäts-Härtung – Coverage-Nachweis, Randfall-Tests, Tempo-Messung `storage`, Aufteilung `StoryPage.tsx`.

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
