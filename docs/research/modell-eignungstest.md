# Modell-Eignungstest (Fahrplan-Schritt 1.1)

<!-- Erkenntnisdokument zu Schritt 1.1, abgeschlossen 2026-09-26. Festlegung: ADR-010.
     Rohdaten, Harness, Prüfliste und Stil-Kriterien: spikes/modell-eignungstest/ -->

<!-- ANCHOR:zusammenfassung -->
## Zusammenfassung

9 Modelle, 54 Läufe, Gesamtkosten 0,85 $. Kanon-Treue und sprachliche Ausdrucksweise blind bewertet. Genre-Test (Schritt 1.5) mit 4 Modellen und 32 weiteren Läufen (0,81 $) im Abschnitt „Genre-Test".

| Modell | Kanon-Widersprüche je 1.000 Wörter | Stil-Rang (3 Sätze) | Schreibweise-Verstöße (6 Texte) | erstes Textstück | Kosten je Anfrage (Mittel) |
|---|---|---|---|---|---|
| **x-ai/grok-4.7** | **1,5** | **1 / 1 / 1** | 0 | 15–50 s | 0,027 $ |
| qwen/qwen3.8-max-0902 | **1,4** | 3 / 3 / 3 | 7 ¹ | 19–27 s | 0,024 $ |
| x-ai/grok-4.6 | 2,4 | 2 / 2 / 2 | 1 ¹ | 5–8 s | 0,029 $ |
| google/gemini-3.8-flash | 2,6 | 6 / 6 / 5 | 0 | 1,4–2,4 s | 0,017 $ |
| z-ai/glm-5.3 | 3,9 | 5 / 4 / 8 | 2 | 0,7–1,8 s | 0,015 $ |
| qwen/qwen3.8-flash | 3,9 | 9 / 9 / 9 | 12 ¹ | 1,5–4,4 s | 0,001 $ |
| x-ai/grok-4.3 (ohne Reasoning) | 4,5 | 7 / 8 / 7 | 2 | 0,8–1,0 s | 0,012 $ |
| deepseek/deepseek-v4-pro | 4,6 | 4 / 5 / 4 | 9 | 1,6–2,6 s | 0,002 $ |
| x-ai/grok-4.20 (ohne Reasoning) | 5,1 | 8 / 7 / 6 | 2 | 0,8–1,0 s | 0,015 $ |

¹ Bewertungsrunde 3: Diese Prüf-Instanzen zählten Schreibweise-Verstöße strenger (z. B. „Ich sagte nichts." als Handlung Ilkas); Eichtext gemini: 1 statt 0. Kanon-Zählung dort unverändert (Eichtexte 0 und 6 identisch).

- **Kanon-Treue:** grok-4.7 und qwen3.8-max gleichauf vorn; beide denken zwingend vorab und brauchen dafür 15–50 bzw. 19–27 s bis zum ersten Textstück. Modelle ohne Vorab-Denken machen etwa das Zwei- bis Dreifache an Fehlern.
- **Sprache:** grok-4.7 in allen drei Sätzen Platz 1, grok-4.6 Platz 2, qwen3.8-max Platz 3 – vollständig übereinstimmend über drei getrennte Prüf-Instanzen. gemini-3.8-flash nur Mittelfeld (überladen, zu lang); das deckt sich mit der Beobachtung des Eigentümers, dass neuere Gemini-Modelle nachgelassen haben.
- **Token-Budget:** zwischen ca. 8.000, 14.000 und 17.600 Token kein messbarer Unterschied (Stufe 30.000 mangels Material nicht direkt geprüft).
- **Kosten:** alle Modelle weit im Kostenrahmen; grok-4.7 hochgerechnet 12–21 $ im Monat.
- **Filter:** keine Ablehnung in 54 Läufen (harmlose Szene, daher ohne Aussagekraft); maßgeblich ist die Erfahrung des Eigentümers an echtem Material (Abschnitt „Filterverhalten").
- **Genres (1.5):** grok-4.7 in Horror, Thriller, Action und düsterer Szene jeweils auf den Plätzen 1 und 2; keine Ablehnung, keine Moralisierung bei keinem Modell.
- **Festlegung (ADR-010):** grok-4.7 Startmodell, qwen3.8-max Ausweichmodell, grok-4.6 schnelle Alternative; Token-Budget 30.000 als Obergrenze.

<!-- ANCHOR:aufbau -->
## Aufbau des Tests

- **Testmaterial:** erfundene Welt „Die Salzmark" (29 Kanon-Dateien) und Roman „Das Salz der Toten" (Kurzfassungen der Kapitel 1–6, Kapitel 4–6 im Wortlaut, Anfang Kapitel 7), weil das Material des Eigentümers in der Arbeitsumgebung nicht verwendbar ist (Festlegung des Eigentümers 2026-09-26). Die Welt enthält bewusst prüfbare Fallen: blinde Äbtissin, stumme Novizin, Namensverbot für Tote nach Sonnenuntergang, Eid-Inhalt, Zahlungen des Vogts, gefälschter Totenbuch-Eintrag.
- **Aufgabe:** Kapitel 7 fortsetzen (600–900 Wörter) in Figuren-Schreibweise: Der Autor führt die Ich-Erzählerin Ilka, die KI schreibt alle anderen und endet, wo Ilka handeln muss.
- **Kontext-Verfahren:** nach ADR-003 – (1) Regeln und Schreibanweisung, (2) Kanon-Einträge der Szene (13 Einträge), (3) Gesamtzusammenfassung und Kapitel-Kurzfassungen, (4) letzte Manuskript-Seiten wörtlich bis zum Budget, danach übrige Kanon-Einträge.
- **Stufen:** ca. 8.000 Token (nur ca. 1.900 Token Manuskript), ca. 14.000 (ca. 7.900 Token Manuskript), ca. 17.600 (alles Material inkl. 16 weiterer Kanon-Einträge). Je Modell und Stufe 2 Läufe, Temperatur 0,8.
- **Tokenzählung:** Schätzung 3,3 Zeichen je Token für deutsche Prosa; traf die vom Anbieter gemeldeten Eingabe-Token bis auf wenige Prozent (deepseek 7.869 geschätzt / 7.887 gemessen; gemini zählt ca. 6 % weniger, glm ca. 2 % weniger, grok ca. 8 % mehr). Für das Produkt reicht eine Schätzung mit Sicherheitsabschlag; ein Tokenizer je Modell ist nicht nötig.
- **Bewertung:** vorab fixierte Prüfliste (`spikes/modell-eignungstest/pruefliste.md`, 19 Kanon- und 5 Schreibweise-Punkte). Texte anonymisiert, vier getrennte Prüf-Instanzen der Entscheidungs-Klasse; der häufigste Fehler (Totenname) mechanisch gegengeprüft – deckungsgleich. **Stichprobe durch den Eigentümer steht aus.**

<!-- ANCHOR:ergebnisse -->
## Ergebnisse

### Vergleichstabelle

Widersprüche: Summe über die zwei Läufe je Zelle. Kosten und Zeiten: laut OpenRouter.

| Modell (ausführender Anbieter) | Widersprüche 8k / 14k / 17,6k | Summe | davon ohne K12 | Schreibweise-Verstöße | Totenname nachts (Texte) | Ablehnungen | Kosten je Anfrage (Mittel / max.) | erstes Textstück | Wörter |
|---|---|---|---|---|---|---|---|---|---|
| x-ai/grok-4.7 (xAI) | 3 / 2 / 2 | **7** | 6 | **0** | **0 / 6** | 0 | 0,027 $ / 0,042 $ | **15–50 s** | 539–911 |
| google/gemini-3.8-flash (Google) | 6 / 6 / 7 | 19 | 15 | **0** | 3 / 6 | 0 | 0,017 $ / 0,021 $ | 1,4–2,4 s | 982–1.384 |
| z-ai/glm-5.3 (Mistral) | 10 / 6 / 8 | 24 | 22 | 2 | 3 / 6 | 0 | 0,015 $ / 0,027 $ | 0,7–1,8 s | 908–1.165 |
| deepseek/deepseek-v4-pro (StreamLake) | 10 / 11 / 7 | 28 | 26 | 9 | 6 / 6 | 0 | 0,002 $ / 0,003 $ | 1,6–2,6 s | 786–1.222 |

- **K12 (Eid-Inhalt)** wurde von den Prüf-Instanzen uneinheitlich gezählt (Mitnahme des Buchs trotz „nichts entfernen": teils Widerspruch, teils Auslegungslücke). Die Spalte „ohne K12" zeigt, dass die Reihenfolge davon nicht abhängt.
- **Häufigste Fehler aller Modelle:** Blindheit der Äbtissin (sie „sieht" oder liest die Tafel – 15 von 24 Texten), Totenname nachts (12 von 24), erfundene Zahlen zur Vorgeschichte („zwanzig Jahre Zöllner", „vor zwei Tagen"), Totenbuch-Eintrag „ertränkt" statt der Fälschung „Unfall".
- **Prosa (Einschätzung der Prüf-Instanzen):** grok-4.7 am kargsten und am nächsten am geforderten Stil; gemini-3.8-flash bildstark, aber durchweg über der Ziellänge; glm-5.3 und deepseek-v4-pro solide mit sprachlichen Fehlern.
- **Reasoning:** glm-5.3, grok-4.7 und gemini-3.8-flash lassen sich nicht ohne Reasoning aufrufen (HTTP 400); gelaufen mit niedrigster Stufe. Nur grok-4.7 nutzt sie spürbar (930–2.670 Reasoning-Token je Anfrage) – daher Wartezeit und schwankende Kosten.

### Token-Budget

| Stufe (Eingabe) | Widersprüche aller Modelle | ohne K12 | Schreibweise-Verstöße |
|---|---|---|---|
| ca. 8.000 | 29 | 24 | 3 |
| ca. 14.000 | 25 | 24 | 5 |
| ca. 17.600 | 24 | 21 | 3 |

Kein belastbarer Unterschied bei 8 Texten je Stufe. Deutung: Die Fehler entstehen nicht durch fehlenden Kontext – die betroffenen Kanon-Einträge waren in jeder Stufe vollständig enthalten –, sondern durch Nichtbeachtung. Mehr Manuskript im Wortlaut hat das nicht verbessert.

### Kosten, hochgerechnet

400 Anfragen im Monat (`docs/architecture.md` Abschnitt 6), ohne Kapitel-Kurzfassungen:

| Modell | bei 17.600 Token | bei 30.000 Token (Schätzung: gemessene Kosten × 30.000 / 17.600, also eher zu hoch) |
|---|---|---|
| grok-4.7 | ca. 12 $ | ca. 21 $ |
| gemini-3.8-flash | ca. 8 $ | ca. 14 $ |
| glm-5.3 | ca. 7 $ | ca. 12 $ |
| deepseek-v4-pro | ca. 1 $ | ca. 2 $ |

Mit Hosting (Schätzung 4–6 €) bleiben alle Modelle unter dem Kostenrahmen von 50 € (BDR-001), grok-4.7 auch bei 30.000 Token. Der Dollar-Euro-Kurs wurde nicht abgerufen; der Abstand zur Grenze ist groß genug, dass er die Aussage nicht ändert. Gemessene Gesamtkosten des Tests: 0,37 $.

### Nachtest: grok-Varianten ohne Reasoning (Reaktionszeit)

Frage: Lässt sich die Kanon-Treue von grok-4.7 ohne dessen Wartezeit haben? grok-4.6 und grok-4.5 verlangen ebenfalls zwingend Reasoning; **grok-4.3** und **grok-4.20** lassen es abschalten (je 1,25 $ / 2,50 $ je 1 Mio. Token). Beide liefen mit denselben 3 Stufen × 2 Wiederholungen, bewertet blind mit zwei Eichtexten aus der ersten Runde (grok-4.7: 0 Widersprüche, deepseek-v4-pro: 6) – beide wurden identisch wiederbewertet.

| Modell | Widersprüche (6 Texte) | je 1.000 Wörter | Schreibweise-Verstöße | erstes Textstück | Kosten je Anfrage (Mittel) | Wörter |
|---|---|---|---|---|---|---|
| grok-4.7 (mit Reasoning) | 7 | **1,5** | 0 | 15–50 s | 0,027 $ | 539–911 |
| gemini-3.8-flash | 19 | 2,6 | 0 | 1,4–2,4 s | 0,017 $ | 982–1.384 |
| glm-5.3 | 24 | 3,9 | 2 | 0,7–1,8 s | 0,015 $ | 908–1.165 |
| grok-4.3 (ohne Reasoning) | 14 | 4,5 | 2 | 0,8–1,0 s | 0,012 $ | 375–612 |
| deepseek-v4-pro | 28 | 4,6 | 9 | 1,6–2,6 s | 0,002 $ | 786–1.222 |
| grok-4.20 (ohne Reasoning) | 28 | 5,1 | 2 | 0,8–1,0 s | 0,015 $ | 821–1.000 |

**Befund:** Ohne Reasoning sind die grok-Modelle nicht besser als die übrigen; grok-4.3 schreibt zudem deutlich unter der Ziellänge. Der Vorsprung von grok-4.7 hängt also mit dem Vorab-Denken zusammen – schnelle Antwort und hohe Kanon-Treue gibt es in diesem Test nicht im selben Modell. Die schnellste Alternative mit der besten Treue ist gemini-3.8-flash (2,6 je 1.000 Wörter, keine Schreibweise-Verstöße), deren Nutzungsbedingungen aber sexuell explizite Inhalte ausschließen.

**Nebenbefund Zwischenspeicher:** Bei grok-4.3 und grok-4.20 kostete die zweite Wiederholung derselben Anfrage oft nur ein Viertel bis ein Drittel der ersten (z. B. 0,0183 $ → 0,0049 $), vermutlich durch Zwischenspeicherung des gleichbleibenden Anfrage-Anfangs beim Anbieter. Für das Produkt heißt das: Regeln und Kanon an den Anfang der Anfrage, Veränderliches ans Ende – das senkt die Kosten weiter. Nicht gezielt gemessen (Cache-Token wurden nicht protokolliert).

### Nachtest: Qwen 3.8 (Arbeitsmodell des Eigentümers) und grok-4.6

qwen3.8-max-0902 (Reasoning Pflicht), qwen3.8-flash (Reasoning abschaltbar) und grok-4.6 (Reasoning Pflicht, aber kurz: 240–380 Reasoning-Token) liefen mit denselben 3 Stufen × 2 Wiederholungen; Bewertung blind mit drei Eichtexten (grok-4.7: 0, deepseek-v4-pro: 6, gemini-3.8-flash: 0 statt zuvor 1). Bei qwen3.8-flash scheiterten 4 Läufe zunächst am Anbieter-Limit (HTTP 429) und liefen beim Wiederholen durch – ein Hinweis für die Fehlerart `RateLimited` in `ai_gateway`.

<!-- ANCHOR:sprache -->
## Sprachliche Ausdrucksweise

Auftrag des Eigentümers (2026-09-26). Kriterien vorab fixiert (`spikes/modell-eignungstest/stil-kriterien.md`: sprachliche Kraft, Rhythmus, Stiltreue, Figurenstimmen, Sprachrichtigkeit, Klischeefreiheit). Drei Sätze zu je 9 Texten (einer je Modell, gleiche Stufe und Wiederholung), je eine getrennte Prüf-Instanz in der Rolle einer Lektorin, Rangfolge 1–9.

| Modell | Ränge | Punkte (max. 30) je Satz |
|---|---|---|
| grok-4.7 | 1, 1, 1 | 28, 26, 29 |
| grok-4.6 | 2, 2, 2 | 25, 24, 25 |
| qwen3.8-max-0902 | 3, 3, 3 | 25, 23, 23 |
| deepseek-v4-pro | 4, 5, 4 | 22, 18, 18 |
| glm-5.3 | 5, 4, 8 | 20, 20, 13 |
| gemini-3.8-flash | 6, 6, 5 | 15, 17, 18 |
| grok-4.20 | 8, 7, 6 | 14, 16, 16 |
| grok-4.3 | 7, 8, 7 | 16, 14, 17 |
| qwen3.8-flash | 9, 9, 9 | 13, 13, 10 |

Typische Urteile: grok-4.7 „kommt dem Autor am nächsten: knapp, kalt, trocken komisch"; gemini-3.8-flash „bildstark, aber überinstrumentiert … Pathos und Überlänge"; qwen3.8-flash wechselt in allen drei Sätzen in die dritte Person. **Grenze:** Die Prüf-Instanzen maßen an der vorgegebenen kargen Stilvorgabe der Testgeschichte; ein anderer Zielstil (z. B. üppiger) könnte die Reihenfolge verschieben. Der Geschmack des Eigentümers ist maßgeblich – eine eigene Lesung einiger Texte ist empfohlen.

<!-- ANCHOR:filterverhalten -->
## Filterverhalten

- **Beobachtung im Test:** 0 Ablehnungen in 54 Läufen. Die Testszene (düster, Gewalt nur angedeutet) sagt über Filter bei schärferen Inhalten nichts aus.
- **Erfahrung des Eigentümers an echtem Material (2026-09-26):** CNC-Inhalte liefen früher mit Gemini 2.5 Pro; neuere Gemini-Modelle schreiben sie nicht mehr. Heute nutzt er grok 4.7 und Qwen 3.8 dafür. Das ist der belastbarste verfügbare Befund und stützt die Wahl von grok-4.7 und qwen3.8-max.
- **Keine eigene Probe-Szene:** Die KI schreibt keine Testszene mit sexueller Nicht-Einvernehmlichkeit; eine synthetische Probe wäre gegenüber der Erfahrung des Eigentümers ohnehin schwächer.
- **Folge für die Vision (harte Randbedingung „Modellwechsel möglich"):** Der Befund bei Gemini zeigt, dass Filter sich mit neuen Modellversionen verschärfen – Modellwechsel ohne Datenverlust (FR-018) bleibt zentral.

<!-- ANCHOR:ablehnungsverhalten -->
## Ablehnungsverhalten (Grundlage für `ModelRefused`)

- **Technischer Filterabbruch:** OpenRouter vereinheitlicht das Abbruch-Signal zu `finish_reason` ∈ {`stop`, `length`, `content_filter`, `tool_calls`, `error`}; die ursprüngliche Meldung des Anbieters steht in `native_finish_reason`; Fehler können als `error`-Feld im Datenstrom kommen ([API-Überblick](https://openrouter.ai/docs/api/reference/overview), abgerufen 2026-09-26). `content_filter` → `ModelRefused`; `error` im Strom → je nach Inhalt `ProviderUnavailable` oder `ModelRefused`.
- **Ablehnung als Text:** Modelle können statt Prosa eine Weigerung schreiben, bei `finish_reason: stop`. Das lässt sich technisch nicht sicher erkennen; der Autor sieht es im Text. Die Oberfläche bietet deshalb bei jedem KI-Text „mit anderem Modell wiederholen" an (FR-018), nicht nur bei erkanntem Abbruch.
- **Vorab-Ablehnung per HTTP-Fehler:** z. B. „Reasoning is mandatory" (HTTP 400) oder Anbieter-Limit (HTTP 429) – Fehlerarten `InvalidRequest` bzw. `RateLimited`.
- **In jedem Fall:** bisheriger Manuskript-Stand bleibt unverändert (`docs/architecture.md` Abschnitt 5, Fehlerpfade).
- **Nicht live beobachtet:** Ein `content_filter`-Abbruch trat im Test nicht auf; die Zuordnung beruht auf der Dokumentation.

<!-- ANCHOR:genre-test -->
## Genre-Test: Horror, Thriller, Action, düster (Schritt 1.5)

Auftrag des Eigentümers (2026-09-26): Leistung bei düsteren, Horror-, Thriller- und Action-Szenen, ergänzt um weitere Faktoren. Vier Szenen in der Testwelt (Horror im Archiv, Verfolgung auf der Treppe, Kampf in der Grotte, öffentliche Hinrichtung durch Ertränken), Anweisung jeweils ausdrücklich „schwäche nichts ab". Kriterien vorab fixiert (`spikes/modell-eignungstest/genre-kriterien.md`): Sprache, Genre-Handwerk, Spannungsbogen, Atmosphäre, Figuren unter Druck; dazu Abschwächung (A), Moralisierung/Ablehnung (M), Schreibweise verletzt (F), grobe Kanon-Fehler (K). 4 Modelle × 4 Szenen × 2 Läufe = 32 Läufe, 0,81 $; je Szene eine getrennte Prüf-Instanz, 8 Texte anonymisiert.

| Modell | Horror | Thriller | Action | düster | Punkte (Mittel, max. 25) | A | M | F | K |
|---|---|---|---|---|---|---|---|---|---|
| **grok-4.7** | **1, 2** | **1, 2** | **1, 2** | **1, 2** | **22,5** | 0 | 0 | 1 | 0 |
| grok-4.6 | 3, 6 | 3, 6 | 3, 4 | 5, 6 | 18,1 | 1 | 0 | 2 | 0 |
| gemini-3.8-flash | 7, 8 | 5, 8 | 6, 7 | 3, 4 | 16,6 | 0 | 0 | 3 | 0 |
| qwen3.8-max-0902 | 4, 5 | 4, 7 | 5, 8 | 7, 8 | 16,0 | 2 | 0 | 5 | 1 |

(Ränge der beiden Läufe je Szene, 1 = bester von 8 Texten; A/M/F/K = Anzahl Texte mit Befund, je 8 Texte.)

- **Keine Ablehnung, keine Moralisierung** bei keinem Modell, auch nicht bei der Hinrichtungs- und der Kampfszene; `finish_reason` stets `stop`.
- **Abschwächung:** selten; qwen3.8-max und grok-4.6 entschärften je einmal den Thriller (Gitter schon offen, Flucht ohne Hindernis), qwen3.8-max einmal die Hinrichtung („Tod nur als Beben unter der Oberfläche").
- **Figuren-Schreibweise unter Genre-Druck** ist die häufigste Schwäche: In Action- und Fluchtszenen lassen Modelle Ilka selbst laufen oder denken; qwen3.8-max in 5 von 8 Texten, grok-4.7 in 1 von 8.
- **Typische Urteile:** grok-4.7 Action „präzise, karg und körperlich, die Stellung der Figuren stets klar"; grok-4.7 Hinrichtung „Grausamkeit ohne Trost … glänzend"; gemini-3.8-flash Horror „generischer Wasserleichen-Horror mit Klischees".
- **Folge für ADR-010:** Das Startmodell grok-4.7 bestätigt sich auch in diesen Genres deutlich. Das Ausweichmodell qwen3.8-max ist hier schwächer als grok-4.6; qwen bleibt Ausweichmodell nur wegen des anderen Herstellers (Schutz gegen verschärfte Filter bei xAI) – Frage an den Eigentümer, ob grok-4.6 stattdessen das bevorzugte Zweitmodell sein soll.

<!-- ANCHOR:nutzungsbedingungen -->
## Nutzungsbedingungen der ausführenden Anbieter

Abgerufen 2026-09-26. Zitate über ein Zusammenfassungs-Werkzeug gewonnen, nicht zeichengenau geprüft; x.ai-Seiten nur über einen Lese-Proxy erreichbar.

| Stelle | Gewalt | sexuelle Inhalte (Erwachsene) | Ausnahme Kunst/Fiktion | Nutzung zum Training | Quelle |
|---|---|---|---|---|---|
| OpenRouter | keine eigene Regel; Bedingungen der Modellanbieter gelten; Blockieren „objectionable" Inhalte nach eigenem Ermessen | keine eigene Regel | – | nur mit Opt-in | [Terms](https://openrouter.ai/terms) (31.08.2026) |
| xAI | nur Förderung „critically harming human life" | nur reale Personen und Minderjährige verboten | nicht genannt | nein; Löschung ≤ 30 Tage | [AUP](https://x.ai/legal/acceptable-use-policy) (14.08.2026) |
| Google | verboten, was Gewalt „facilitates"/„incitement" | sexuell explizit verboten | ja, nach Ermessen von Google | bezahlt nein, unbezahlt ja; Stufe über OpenRouter unklar | [Prohibited Use Policy](https://policies.google.com/terms/generative-ai/use-policy), [Gemini API Terms](https://ai.google.dev/gemini-api/terms) |
| Mistral (führte glm-5.3 aus) | verboten, was Gewalt „promotes, incites, glorifies" | kein allgemeines Verbot | nicht genannt | bezahlt nein; ZDR-Endpunkt vorhanden | [Usage Policy](https://legal.mistral.ai/terms/usage-policy) (11.06.2026) |
| Z.ai (Hersteller glm-5.3) | „violent … content" wörtlich verboten | verboten | nein | API nein | [Terms of Use](https://docs.z.ai/legal-agreement/terms-of-use) (14.04.2026) |
| StreamLake (führte deepseek-v4-pro aus) | „offensive", Drohungen verboten | verboten | nein | **ja**, Widerruf per E-Mail | [Nutzungsbedingungen](https://www.streamlake.ai/document/DOC/mgkchnd89grpt1961fw) (02.02.2026) |
| DeepSeek (Hersteller) | kein Katalog (nur Markenverwendung) | – | – | nicht gefunden | [Open Platform Terms](https://cdn.deepseek.com/policies/en-US/deepseek-open-platform-terms-of-service.html) (22.04.2026) |

**Einordnung (Deutung, kein Rechtsrat):** Für düstere Fiktion sind die Bedingungen von xAI am weitesten, die von Z.ai und StreamLake am engsten. StreamLake darf Eingaben zum Training nutzen – für deepseek-Modelle wäre ein Ausschluss dieses Anbieters über das Anbieter-Routing von OpenRouter nötig. Die Rechtstexte sagen nichts darüber, wie streng die technischen Filter tatsächlich greifen.

<!-- ANCHOR:grenzen -->
## Grenzen der Aussage

1. **Erfundene statt echter Welt:** Die Fehlerarten sind übertragbar, die absoluten Zahlen nicht. Echte Welten sind größer; ob ein kleineres Budget dann noch trägt, hängt davon ab, dass die Kontext-Zusammenstellung die richtigen Einträge wählt.
2. **Budget 30.000 nicht direkt geprüft:** Material reichte bis 17.600 Token.
3. **Zwei Läufe je Zelle:** Streuung ist sichtbar (deepseek 8k: 3 bzw. 6 Widersprüche). Der Abstand von grok-4.7 zu den übrigen ist groß genug, um nicht Zufall zu sein; die Reihenfolge der anderen drei ist unsicher.
4. **Bewertung durch KI:** Prüf-Instanzen derselben Modellfamilie wie die bauende KI, blind, aber nicht unabhängig von deren Neigungen. Stichprobe durch den Eigentümer offen.
5. **Filterverhalten nur aus Erfahrung des Eigentümers:** keine Ablehnung bei harmloser Szene; Befund zu schärferen Inhalten stammt aus seiner Nutzung (Abschnitt „Filterverhalten").
6. **Momentaufnahme:** Modelle, Preise, Anbieter und Bedingungen ändern sich (Vision 9).

<!-- ANCHOR:offene-punkte -->
## Offene Punkte

1. Eigene Lesung einiger Texte durch den Eigentümer (Stichprobe Kanon- und Stil-Bewertung) – empfohlen, Landeplatz Schritt 1.4.
2. Prüfung des Token-Budgets an größerem Material und Ablehnungsverhalten im echten Betrieb – mit der Umsetzung in 3.2 (Kontext-Zusammenstellung) bzw. 3.1 (`ai_gateway`).
3. Anbieter-Routing: StreamLake (Training auf Eingaben) meiden, falls deepseek-Modelle genutzt werden – Umsetzung in 3.1.
