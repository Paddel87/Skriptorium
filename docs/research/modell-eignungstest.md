# Modell-Eignungstest (Fahrplan-Schritt 1.1) – Zwischenstand

<!-- Erkenntnisdokument zu Schritt 1.1. Stand 2026-09-26, Zwischenstand: Filter-Probe offen.
     Rohdaten, Harness und Prüfliste: spikes/modell-eignungstest/ -->

<!-- ANCHOR:zusammenfassung -->
## Zusammenfassung

- **Kanon-Treue:** `x-ai/grok-4.7` machte mit Abstand die wenigsten Kanon-Widersprüche (7 in 6 Texten), gefolgt von `google/gemini-3.8-flash` (19), `z-ai/glm-5.3` (24) und `deepseek/deepseek-v4-pro` (28). grok-4.7 und gemini-3.8-flash verstießen nie gegen die Figuren-Schreibweise; deepseek-v4-pro in 5 von 6 Texten.
- **Token-Budget:** Zwischen ca. 8.000, 14.000 und 17.600 Token Eingabe zeigte sich **kein messbarer Unterschied** in der Kanon-Treue (29 / 25 / 24 Widersprüche über alle Modelle). Grenze: Das Testmaterial reicht nur bis 17.600 Token; der Startwert 30.000 konnte nicht direkt geprüft werden.
- **Kosten:** alle Modelle weit im Kostenrahmen; grok-4.7 ist am teuersten (Mittel 0,03 $ je Anfrage bei 17.600 Token).
- **Reaktionszeit:** grok-4.7 verletzt das Ziel „erstes Textstück in 5 Sekunden" deutlich (15–50 s), weil es zwingend vorab „denkt". Die übrigen Modelle lagen bei 0,7–2,6 s. Nachtest: grok-Varianten ohne Vorab-Denken (grok-4.3, grok-4.20) sind schnell, aber nicht kanontreuer als die übrigen Modelle.
- **Filterverhalten:** In der Testszene (düster, aber ohne drastische Inhalte) gab es **keine Ablehnung** – das sagt über das Filterverhalten bei schärferen Inhalten nichts aus. Filter-Probe offen.

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
5. **Filterverhalten ungeprüft:** keine Ablehnung bei harmloser Szene; Aussage erst nach Filter-Probe.
6. **Momentaufnahme:** Modelle, Preise, Anbieter und Bedingungen ändern sich (Vision 9).

<!-- ANCHOR:offene-punkte -->
## Offene Punkte

1. Filter-Probe mit einer Szene, die den früher abgelehnten Inhalten des Eigentümers ähnelt (Rückfrage an den Eigentümer: welche Art von Inhalten).
2. Verhalten bei Ablehnung beschreiben (Grundlage für `ModelRefused`) – erst nach Filter-Probe möglich.
3. Reaktionszeit gegen Kanon-Treue: Entscheidung des Eigentümers – grok-4.7 (treuer, 15–50 s Wartezeit) oder ein schnelles Modell (z. B. gemini-3.8-flash). Nachtest mit grok-Varianten ohne Reasoning erledigt: kein Ausweg (siehe oben).
4. Stichprobe der Bewertung durch den Eigentümer.
5. Festlegung von Startmodell, Ausweichmodell und Token-Budget als ADR `[ERKENNTNIS]`.
