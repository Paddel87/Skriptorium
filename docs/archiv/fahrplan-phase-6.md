# Archiv – Fahrplan Phase 6

<!-- Quelle: docs/fahrplan.md, Abschnitt „Aktuelle Phasen". Ausgelagert am 2026-10-12 (CLAUDE.md Abschnitt 14:
     Phase vollständig erledigt). Abgedeckter Zeitraum: 2026-10-11 bis 2026-10-12. -->

## Aktuelle Phasen

### Phase 6: Schreiballtag, Schutz und Kanon-Werkzeuge – Typ: UMSETZUNG

**Ziel:** Nach v1.0.0 wird das Schreiben im Alltag bequemer (Umfang sichtbar, Kurzfassung eindeutig, Kanon auch bei langen Kapiteln), der Schutz der Texte rundet sich ab (Browser-Speicher, Datenschutz beim Anbieter, Kopfzeilen), und der Kanon lässt sich mit KI entwerfen sowie mit SillyTavern austauschen.

**Abschlusskriterium:** Schritte 6.1–6.10 `[ERLEDIGT]`, `[VERWORFEN]` mit ADR oder `[VERSCHOBEN]` mit Ziel-Schritt.

**Reifegrad-Erwartung am Phasenende:** unverändert `[BELASTBAR]`; 6.3 (Kontext-Reihenfolge) und 6.7 (Weltenbauer) werden per ADR entschieden, bevor gebaut wird.

**Ursprünglicher Schrittplan:** 12 Schritte, festgehalten am 2026-10-11 (10 aus 5.5, ADR-059; +6.11, +6.12 aus der Pflichtfrage vor Phasenbeginn, ADR-060). Stand 2026-10-11: 13 Schritte (+6.13 Spike, ADR-061). Stand 2026-10-12: 14 Schritte (+6.14 AMOLED, Ausnahme auf Wunsch des Eigentümers). Wucherungs-Schwelle für Phase 6: mehr als 15 Schritte (ADR-060, enger als der Default aus `docs/project-context.md` Abschnitt 6); neue Wünsche während der Phase werden V-Schritte mit Landeplatz 6.10.

**Reihenfolge (Eigentümer, 2026-10-11; ADR-060):** 6.11 (Umbau Schreibbereich), dann die kleinen Hilfen 6.1 und 6.2; 6.12 (Umbau Anfrage-Zusammenstellung), dann 6.3; die Schutz-Schritte 6.4–6.6 gebündelt mit einer gemeinsamen Prüfung durch eine getrennte Instanz; dann 6.7, 6.8, 6.9; zuletzt 6.10.

**Pflichtfrage am Phasenende:** ADR-067 – gezielt umbauen (7.1), dann weiterbauen

#### 6.1: Umfang des Kapitels im Manuskript anzeigen

- **Status:** ✅ ERLEDIGT (2026-10-11) – Mockup freigegeben („Passt, umbauen“); umgesetzt: `ContextBuilder.chapter_summary_room` (Platz für den Kapiteltext in der Kurzfassungs-Anfrage, exakt an der Grenze getestet), `GET …/chapters/{n}/summary-room` → `{max_chars}`, Anzeige `ChapterLength` unter dem Manuskript (Wortzahl; gelb ab 85 % des Platzes mit „passt bis ca. N“, rot darüber). pytest 492, vitest 180, Playwright 11 grün. Eingespielt 2026-10-11 (`5f1fa10`). Vom Eigentümer bestätigt 2026-10-11.
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.11
- **Freigabepflichtig:** nein (nur Anzeige in `ui`); Mockup vorher/nachher
- **Empfohlene Klasse:** Routine – klar spezifizierte Anzeige mit Test.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-033
- **Zu tun:** Wörter des Kapitels laufend anzeigen (z. B. „9.786 Wörter“); ab etwa 10.000 Wörtern Hinweis „Kurzfassung passt bis ca. 12.000 – bald abschließen“, darüber deutlich markiert. Grenze aus dem Budget der Kurzfassung ableiten (`build_chapter_summary`, 30.000 Token), nicht fest raten.
- **Akzeptanzkriterien:** Zahl stimmt mit der Wortzählung überein (Test), Hinweis an der Schwelle (Test), Mockup freigegeben, Eigentümer bestätigt.
- **Betroffene Module:** ui (ggf. api für die Grenze)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-11 in 5.5 (ADR-059), übernommen aus V.17 und V.12 (Wünsche 2026-10-10 und 2026-10-11, zusammengelegt).

#### 6.2: Kurzfassung des Kapitels nicht mit der Anweisung verwechselbar

- **Status:** ✅ ERLEDIGT (2026-10-11) – Variante A gewählt (Mockup mit Varianten A „eigener Reiter“ und C „Karte“): Reiter „Kurzfassung“ neben „Manuskript“ und „Verlauf“, sobald das Kapitel abgeschlossen ist oder eine Kurzfassung hat; Punkt am Reiter, solange sie nicht geprüft ist; Karte mit Hinweis „Sie ist keine Anweisung“; nach „Kapitel abschließen“ öffnet der Reiter; Knopf heißt „Als geprüft markieren“. vitest 183, Playwright 11 grün. Eingespielt 2026-10-11 (`5f1fa10`). Vom Eigentümer bestätigt 2026-10-11.
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.11
- **Freigabepflichtig:** nein – Umbau innerhalb von `ui`; Mockup vorher/nachher
- **Empfohlene Klasse:** Routine – Umbau in `ui` nach freigegebenem Mockup.
- **Eingangskriterien:** Form mit dem Eigentümer geklärt (Mockup)
- **Anforderungen (ab Klasse M):** FR-010, FR-019
- **Zu tun:** Befund am Smartphone (2026-10-10): Feld „Kurzfassung des Kapitels“ wird mit der Eingabe für die KI verwechselt. Kurzfassung räumlich und optisch klar von der Anweisung trennen (z. B. eigener Bereich in „Kanon & Geschichte“ oder hinter „Kapitel abschließen“).
- **Akzeptanzkriterien:** Mockup freigegeben; Tests; Eigentümer bestätigt am Smartphone.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-11 in 5.5 (ADR-059), übernommen aus V.15.

#### 6.3: Kanon-Einträge bei langen Kapiteln

- **Status:** ✅ ERLEDIGT (2026-10-11) – nach Spike 6.13 entschieden: C, Kanon vor den Seiten bis 30 % der Kapazität (ADR-062); umgesetzt in `ContextBuilder.build()` (`CANON_SHARE`), drei neue Tests, pytest 495, `builder.py` 100 %. Anfragen der Testgeschichten unverändert (byte-gleich). Eingespielt 2026-10-11 (`5f1fa10`); Eigentümer bestätigt 2026-10-11. Technik-Prüfung an der Geschichte des Eigentümers 2026-10-11 (lesend, mit seiner Freigabe): in den 6 langen Kapiteln gingen vorher 0–28 von 34 nicht genannten Einträgen mit, jetzt alle 34; Anfrage gleich groß (ca. 29.800 Token), die Seiten treten ca. 5.000 Token ab (Logbuch)
- **Phasentyp-Kontext:** UMSETZUNG (mit Entscheidungsvorlage zu Beginn)
- **Abhängigkeiten:** 6.12, 6.13
- **Freigabepflichtig:** ja – Reihenfolge der Kontext-Zusammenstellung (ADR-003), Kategorie 1
- **Empfohlene Klasse:** Entscheidung – Architektur-Vorschlag (Eskalations-Auslöser 1); die Umsetzung danach ist Routine.
- **Eingangskriterien:** Entscheidung des Eigentümers über die Option
- **Anforderungen (ab Klasse M):** FR-011
- **Zu tun:** Befund 5.26 (a) und D.4 (ADR-057): Nicht per `@` genannte Figuren-, Orts- und Gegenstands-Einträge gehen bei langen Kapiteln nicht mit. Optionen aus V.10: (A) Kultur-Einträge immer mitgeben, (B) anzeigen, welche Einträge nicht mitgingen, (C) an einer echten Welt messen; weitere Option: Seiten-Budget begrenzen, damit Kanon Platz behält. Vorlage nach `CLAUDE.md` Abschnitt 4, Messung nach Regel-002.
- **Akzeptanzkriterien:** ADR; Messung vorher/nachher an beiden Testgeschichten (Regel-002); Tests grün.
- **Betroffene Module:** context (ggf. ui)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-11 in 5.5 (ADR-059), übernommen aus V.10 (ADR-050).

#### 6.4: Antworten des Servers nicht im Browser-Speicher

- **Status:** ✅ ERLEDIGT (2026-10-11) – umgesetzt (ADR-063): `Cache-Control: no-store` für `/api/`, auch 500; Tests, unabhängig geprüft. Eingespielt 2026-10-11 (`5f1fa10`); von außen geprüft: `cache-control: no-store` an `/api/health`
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – Kategorie 6; optionale Maßnahme über ASVS Stufe 1 (ADR-006), vom Eigentümer gewünscht
- **Empfohlene Klasse:** Entscheidung – Sicherheits- und Datenschutzentscheidung (Eskalations-Auslöser 1).
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-032
- **Zu tun:** `Cache-Control: no-store` für alle Antworten unter `/api` (Befund 4 zu ADR-048, Befund 3 der Prüfung in 5.14).
- **Akzeptanzkriterien:** Test der Kopfzeile; Prüfung durch eine getrennte Instanz (gemeinsam mit 6.5 und 6.6 möglich).
- **Betroffene Module:** api
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-11 in 5.5 (ADR-059), übernommen aus V.13 (aus 5.25).

#### 6.5: Datenschutz-Einstellung an OpenRouter

- **Status:** ✅ ERLEDIGT (2026-10-11) – Eigentümer wählte C (ADR-063): kein Code, Einstellung im OpenRouter-Konto (Settings → Privacy). Eigentümer hat die Einstellung gesetzt und bestätigt (2026-10-11).
- **Phasentyp-Kontext:** UMSETZUNG (mit Entscheidungsvorlage zu Beginn)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – Kategorie 6 (Umgang mit Texten beim Anbieter); kann die wählbaren Modelle einschränken
- **Empfohlene Klasse:** Entscheidung – Datenschutz-Vorschlag (Eskalations-Auslöser 1); die Umsetzung danach ist Routine.
- **Eingangskriterien:** Entscheidung des Eigentümers
- **Anforderungen (ab Klasse M):** keine (Befund 6 der Prüfung in 5.14)
- **Zu tun:** Mit jeder Anfrage `provider: {"data_collection": "deny"}` senden oder die Einstellung im OpenRouter-Konto prüfen; vorher zeigen, welche Modelle dann wegfallen.
- **Akzeptanzkriterien:** ADR; bei Umsetzung Test der Nutzlast und echte Anfrage.
- **Betroffene Module:** ai_gateway
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-11 in 5.5 (ADR-059), übernommen aus V.18 (ADR-058).

#### 6.6: Kopfzeilen und Fehlermeldungen härten (CSP, Einbettschutz, 422)

- **Status:** 🟠 IN ARBEIT (seit 2026-10-11) – umgesetzt (ADR-063): Content-Security-Policy, Validierungsfehler ohne Werte; Tests, Browser-Prüfung ohne CSP-Meldung, unabhängig geprüft (Befunde behoben). Eingespielt 2026-10-11 (`5f1fa10`). Von außen kam zuerst nur `frame-ancestors 'none'` an: ein Traefik-Label in der Server-Konfiguration überschrieb die Regel der App; Label auf Freigabe des Eigentümers entfernt (Kategorie 7, Auswahlfrage). Danach volle Regel von außen bestätigt, Anmeldeseite in Chromium ohne CSP-Meldung, 422 ohne eingegebene Werte
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – Kategorie 6; Stufe 2 und damit über der Obergrenze aus ADR-006 – vom Eigentümer gewünscht
- **Empfohlene Klasse:** Entscheidung – Sicherheitsmaßnahme über dem festgelegten Niveau (Eskalations-Auslöser 1).
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** keine (Befunde 1, 2, 4 der Prüfung in 5.14; ASVS 3.4.3, 3.4.6)
- **Zu tun:** Content-Security-Policy (Stile für CodeMirror prüfen); `frame-ancestors 'none'` auch in `_SECURITY_HEADERS`; Handler für Validierungsfehler ohne zurückgespiegelte Eingaben.
- **Akzeptanzkriterien:** Tests der Kopfzeilen; Oberfläche funktioniert mit CSP (End-to-End); Prüfung durch eine getrennte Instanz.
- **Betroffene Module:** api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-11 in 5.5 (ADR-059), übernommen aus V.19 (ADR-058).

#### 6.7: KI-gestützter Weltenbauer

- **Status:** ✅ ERLEDIGT (2026-10-11) – Form entschieden (ADR-064): A, Gespräch auf der Kanon-Seite, Übernahme über die Import-Vorschau, Websuche zuschaltbar. Mockup freigegeben 2026-10-11; umgesetzt 2026-10-11 (Server `POST /api/worlds/{w}/worldbuilder`, Oberfläche „✨ Weltenbauer“ auf der Kanon-Seite, „Als Kanon übernehmen“ öffnet die Import-Vorschau). Echte Probe 2026-10-11 in der Cloud-Session: ```kanon-Block eingehalten, Übernahme über die Import-Vorschau klappt, Fundstellen kommen als ein Ereignis nach dem Text; Befunde: Websuche kostet ca. 6 ct statt „ca. 1 ct“, Fundstellen nur als „1 · 2 · 3“, Verweise roh im Text (Logbuch). Eigentümer: alle drei Befunde in 6.7 beheben (Auswahlfrage 2026-10-11) – behoben 2026-10-11, dazu ein vierter aus der Nachprobe (Überschriften eine Ebene zu tief). Eingespielt 2026-10-11 (`5f1fa10`). Vom Eigentümer bestätigt 2026-10-11 (nach Behebung des `@`-Menüs, `5141d53`).
- **Phasentyp-Kontext:** UMSETZUNG (mit Entscheidungsvorlage und Mockup zu Beginn)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – neuer Ablauf und ggf. neue Verantwortung (Kategorien 1/2); Wissen aus dem Internet wäre eine neue externe Abhängigkeit (Kategorie 3)
- **Empfohlene Klasse:** Entscheidung – Architektur-Vorschlag (Eskalations-Auslöser 1); die Umsetzung danach ist Routine.
- **Eingangskriterien:** Form und Architektur per ADR entschieden; Mockup freigegeben
- **Anforderungen (ab Klasse M):** FR-029
- **Zu tun:** Figuren, Orte, Regeln, Kultur und Gegenstände (mit Zweck, Verwendung, Auswirkung) im Gespräch mit der KI entwerfen; vorhandene Einträge mit KI-Unterstützung besser ausformulieren; Übernahme in den Kanon erst nach Bestätigung (wie Import-Vorschau). Vorbild: die TypingMind-Agenten-Vorlage des Eigentümers (2026-10-11). Internet-Wissen nur nach eigener Entscheidung.
- **Akzeptanzkriterien:** ADR; Tests; echte Probe; Eigentümer bestätigt.
- **Betroffene Module:** canon, context, api, ui (Zuschnitt per ADR)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-11 in 5.5 (ADR-059), übernommen aus V.9.

#### 6.8: Import aus SillyTavern (Character Cards und Lorebooks)

- **Status:** ✅ ERLEDIGT (2026-10-12) – entschieden (ADR-065): Server übersetzt in Import-Markdown; Figurenkarte: Beschreibung und Persönlichkeit; Schlüsselwörter als Aliasse; `{{char}}` ersetzen, `{{user}}` melden. Mockup freigegeben 2026-10-11 („Passt, umbauen“). Umgesetzt 2026-10-11: `canon.importers.sillytavern`, `POST /api/worlds/{id}/import/sillytavern`, ein Dateifeld der Import-Seite für Markdown und SillyTavern; Formate am Quelltext von SillyTavern geprüft (`charaFormatData`, `convertWorldInfoToCharacterBook`, `character-card-parser.write`: Bild mit `chara` und `ccv3`). Prüfung durch getrennte Instanz 2026-10-11 (Unteragent mit Sonnet, ohne Gesprächsverlauf): „freigeben nach Behebung“, 4 Befunde (2× mittel, 2× niedrig) behoben, Nachprüfung fand eine Umgehung (niedrig), ebenfalls behoben (Logbuch). Eingespielt 2026-10-12 (`ef9a3fe`). Probe des Eigentümers 2026-10-12: echte Figurenkarte (V2) importiert – „Charakter importieren geht gut … hat geklappt“.
- **Phasentyp-Kontext:** UMSETZUNG (mit Entscheidungsvorlage zu Beginn)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – Eingangsformat (Kategorie 4); Einlesen fremder Dateien, PNG mit eingebettetem JSON (Kategorie 6, Prüfung durch getrennte Instanz)
- **Empfohlene Klasse:** Entscheidung – Datenmodell- und Sicherheitsentscheidung (Eskalations-Auslöser 1).
- **Eingangskriterien:** Zuordnung der Felder per ADR
- **Anforderungen (ab Klasse M):** FR-030
- **Zu tun:** Character Cards (Figur, ggf. eingebettetes Lorebook) und Lorebooks als weiteres Eingangsformat in `canon.importers`, mit Vorschau wie beim Markdown-Import; Felder für Chat-Rollenspiel bewusst weglassen.
- **Akzeptanzkriterien:** ADR; Tests mit echten Beispieldateien; Prüfung durch eine getrennte Instanz.
- **Betroffene Module:** canon, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-11 in 5.5 (ADR-059), übernommen aus V.6.

#### 6.9: Export in SillyTavern-Formate

- **Status:** ✅ ERLEDIGT (2026-10-12) – entschieden (ADR-066): Welt als Lorebook (Format von SillyTavern, Kategorie in `extensions`), Figur als Karte V2 (JSON, ohne eingebettetes Lorebook). Eingangskriterium „6.8 erledigt“ formal offen (Probe des Eigentümers), Zuordnung steht. Mockup freigegeben 2026-10-11. Umgesetzt 2026-10-11: `lorebook_for`, `card_for`, zwei GET-Endpunkte, Knöpfe auf der Kanon-Seite; Import verschiebt Überschriften nur so weit wie nötig (ADR-066). Rückimport-Test grün (gleicher Kanon bis auf Ebene-2-Abschnitte → Ebene 3); im Browser: Lorebook und Karte heruntergeladen und wieder eingelesen, 30 von 30 Einträgen erkannt. Kurzprüfung der Import-Änderung durch die getrennte Instanz 2026-10-11: „freigeben“, kein Befund (u. a. 175.000 Zufallsläufe ohne Ausbruch aus dem Eintrag). Eingespielt 2026-10-12 (`ef9a3fe`). Eigentümer in SillyTavern bestätigt 2026-10-12 („6.9 funktioniert“).
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 6.8
- **Freigabepflichtig:** ja – Ausgabeformat als Schnittstelle (Kategorie 5)
- **Empfohlene Klasse:** Entscheidung – Schnittstellenentscheidung (Eskalations-Auslöser 1); die Umsetzung danach ist Routine.
- **Eingangskriterien:** 6.8 erledigt (Zuordnung der Felder steht)
- **Anforderungen (ab Klasse M):** FR-030
- **Zu tun:** Figuren als Character Card, Welten als Lorebook ausgeben, sodass SillyTavern sie einlesen kann.
- **Akzeptanzkriterien:** ADR; Test: Rückimport mit 6.8 ergibt denselben Kanon; Eigentümer prüft in SillyTavern.
- **Betroffene Module:** canon, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-11 in 5.5 (ADR-059), übernommen aus V.7.

#### 6.10: Planung der nächsten Ausbaustufe

- **Status:** ✅ ERLEDIGT (2026-10-12) – Vision-Abgleich bestanden (alle Muss-Anforderungen erledigt, jedes Vision-Element mit Schritt oder Landeplatz); Onboarding-Pfad auf frischem Worktree grün (Quick Start, `scripts/session-start.sh`; Warnung `npm ci` zu `fsevents` → 7.7); Pflichtfrage mit getrennter Instanz: gezielt umbauen (ADR-067, `docs/research/bewertung-phase-6.md`); Phase 7 geplant (ADR-068): V.16 → 7.2, V.14 → 7.3, V.1 → 7.4, V.8 → 7.5, V.2 → 7.6, V.20 weiter → 7.8
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 6.1–6.9
- **Freigabepflichtig:** ja – neue Phasen sind Replanning
- **Empfohlene Klasse:** Entscheidung – inhaltliche Neuplanung mit Vision-Abgleich.
- **Eingangskriterien:** Vision-Abgleich an der Phasengrenze nach Phase 6
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Die weiter verschobenen Schritte V.1, V.2, V.8, V.14, V.16 (und neue V-Schritte) in eine neue Phase überführen oder per ADR verwerfen.
- **Akzeptanzkriterien:** Jeder verschobene Schritt hat einen neuen Schritt mit ID oder `[VERWORFEN]` mit ADR.
- **Betroffene Module:** keine (Planung)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag, ADR
- **Notizen:** Angelegt 2026-10-11 in 5.5 (ADR-059), übernommen aus 5.5 (Landeplatz der weiter verschobenen V-Schritte).

#### 6.14: Darstellung „Schwarz“ für AMOLED-Bildschirme

- **Status:** ✅ ERLEDIGT (2026-10-12) – Wunsch des Eigentümers („kurzfristig einen AMOLED-tauglichen Dark Mode“); Mockup mit drei Schriftfarben, gewählt: C „gedämpft warm“, als zusätzliche Stufe (Auswahlfragen 2026-10-12). Umgesetzt 2026-10-12: Stufe „Schwarz“ in `theme.ts` und `styles.css` (`data-theme="black"`), `theme-color` Schwarz für die Leiste der installierten App; vitest 217, Playwright 11 grün; Sichtprobe Desktop und Handy (Kanon, Kapitel). Eingespielt 2026-10-12 (`ef9a3fe`). Vom Eigentümer am Gerät bestätigt 2026-10-12 („Schwarz sieht gut aus“).
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein – nur Oberfläche, keine Kategorie aus `CLAUDE.md` Abschnitt 4
- **Empfohlene Klasse:** Routine – klar spezifizierte Oberflächen-Änderung ohne Eskalations-Auslöser.
- **Eingangskriterien:** Mockup freigegeben
- **Anforderungen (ab Klasse M):** – (Darstellung, kein eigener Anwendungsfall; ergänzt 5.19)
- **Zu tun:** Vierte Stufe „Schwarz“ in der Darstellungswahl (Auto → Hell → Dunkel → Schwarz): Seite, Karten und Leiste echtes Schwarz, Schrift gedämpft warm, Linien und Knöpfe leicht abgesetzt; Statusleiste der installierten App schwarz.
- **Akzeptanzkriterien:** Tests; Sichtprobe Desktop und Handy; Eigentümer bestätigt am Gerät.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-12 auf Wunsch des Eigentümers als **bewusste Ausnahme** von der Regel aus ADR-060 („neue Wünsche während der Phase werden V-Schritte mit Landeplatz 6.10“) – Auswahlfrage 2026-10-12: „Jetzt als 6.14“. Phase 6 damit 14 Schritte (Wucherungs-Schwelle > 15 nicht erreicht).

#### 6.11: Umbau des Schreibbereichs (`WritingPanel.tsx`)

- **Status:** ✅ ERLEDIGT (2026-10-11) – `WritingPanel.tsx` 765 → 271 Zeilen; neu `useWriteFlow.ts` (204), `useModelChoice.ts` (68), `useChatScroll.ts` (121), `ProposalBlock.tsx` (109), `ComposerControls.tsx` (144), `ModelSelect.tsx` (54), `ReferenceNotes.tsx` (78). Tests unverändert: vitest 173, Playwright 11 grün; Abdeckung 97,82 / 95,54 / 96,79 / 98,14 (vorher 97,8 / 95,32 / 96,73 / 98,11); Bildschirmfotos vorher/nachher pixelgleich (Rechner, Smartphone, mit „Neue Szene“). Umbau an einen Unteragenten der Routine-Klasse abgegeben und geprüft. Kein Einspielen nötig für die Abnahme (keine sichtbare Änderung), geht mit 6.1 auf den Server
- **Phasentyp-Kontext:** UMSETZUNG (Umbau ohne sichtbare Änderung)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein – Refactoring innerhalb von `ui`, Schnittstellen unverändert (`CLAUDE.md` Abschnitt 5); entschieden in ADR-060
- **Empfohlene Klasse:** Routine – klar spezifizierter Umbau mit bestehendem Testnetz.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** `ui/src/views/WritingPanel.tsx` (765 Zeilen, eine Komponente mit 23 Zuständen) in Hooks und Unterkomponenten zerlegen: Anweisung und Vorschläge ohne `@`, Szene, Modell und Länge, Vorschlagsanzeige. Verhalten unverändert; vor 6.1 und 6.2.
- **Akzeptanzkriterien:** alle bestehenden Tests unverändert grün (vitest, Playwright); Abdeckung nicht unter dem Stand; keine Datei über ca. 300 Zeilen; Bildschirmfotos vorher/nachher gleich.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-11 aus der Pflichtfrage (ADR-060).

#### 6.12: Umbau der Anfrage-Zusammenstellung (`ContextBuilder.build()`)

- **Status:** ✅ ERLEDIGT (2026-10-11) – `build()` von ca. 110 auf 10 Zeilen Rumpf: `_Request` (gelesene Daten, `included`, `missing`), Quellen `_FIXED_SOURCES` (Rahmen, Welt, Schreibweise, Regeln und Zeitlinie, `@`-Verweise, geführte Figuren, Fakten), dann `_story_state`, `_closing_parts`, `_remaining_room`, `_last_pages`, `_filler_parts`, `_assemble`. Vorher/nachher 864 Anfragen aus fünf Testdatensätzen (alle Bausteinarten, Gäste, Fakten, Schreibweise, fehlende Figuren, zu große Anfragen) byte-gleich; pytest 492, `builder.py` 100 %. Umbau an einen Unteragenten der Routine-Klasse abgegeben und geprüft
- **Phasentyp-Kontext:** UMSETZUNG (Umbau ohne Verhaltensänderung)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein – Refactoring innerhalb von `context`, Reihenfolge und Schnittstellen unverändert (`CLAUDE.md` Abschnitt 5); eine Änderung der Reihenfolge selbst ist 6.3 (freigabepflichtig)
- **Empfohlene Klasse:** Routine – klar spezifizierter Umbau mit 100 %-Testnetz.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** `ContextBuilder.build()` (ca. 110 Zeilen, `context/builder.py`) in eine geordnete Liste austauschbarer Quellen zerlegen (Rahmen, Welt, Schreibweise, Regeln und Zeitlinie, `@`-Verweise, geführte Figuren, Fakten, Handlungsstand, Seiten, Auffüllung). Vor 6.3, damit dessen Optionen vergleichbar und messbar werden.
- **Akzeptanzkriterien:** alle bestehenden Tests unverändert grün, `context` weiter 100 %; für die Testgeschichten erzeugte Anfragen vorher und nachher byte-gleich.
- **Betroffene Module:** context
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-11 aus der Pflichtfrage (ADR-060).

#### 6.13: Spike – schaden fehlende Kanon-Einträge bei langen Kapiteln?

- **Status:** ✅ ERLEDIGT (2026-10-11) – Bericht `docs/research/kanon-luecke.md`: Fehlen schadet in beiden Geschichten (Widersprüche je Kette 0 → 4,0 und 0,7 → 3,3); Empfehlung für 6.3: C
- **Phasentyp-Kontext:** ERKUNDUNG (Spike; Ergebnis als Bericht, keine Funktion)
- **Abhängigkeiten:** 6.12
- **Freigabepflichtig:** nein – Prüfwerkzeug unter `spikes/`; die Folgeentscheidung ist 6.3
- **Empfohlene Klasse:** Entscheidung – Bewertung, die eine Architekturentscheidung vorbereitet; die Läufe selbst sind Routine.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** FR-011
- **Zu tun:** An beiden Testgeschichten (Regel-002, je mindestens drei Läufe) bei langem Kapitel messen, wie oft Kanon-Details, die nur in nicht genannten Einträgen stehen, eingehalten oder verletzt werden: heutige Reihenfolge gegen „Kanon vor den Seiten mit Obergrenze“ (als Probe im Spike, Produktcode unverändert). Proben und Anweisungen ohne `@` aus 5.26 (`spikes/kanon-treue/proben.py`); vorher ohne KI zeigen, welche Einträge in beiden Varianten mitgehen.
- **Akzeptanzkriterien:** Bericht unter `docs/research/` mit Technik-Befund (welche Einträge gehen mit) und verblindeter Bewertung (Quote eingehaltener Details, Verstöße) je Variante und Geschichte, Mittel und Spannweite; Empfehlung für 6.3.
- **Betroffene Module:** keine (nur `spikes/`; Lesen von `context`)
- **Reifegrad-Wirkung:** möglicherweise – Beförderung der NFR Kontexttreue hängt an 6.3
- **Artefakte:** Spike-Skripte, Bericht, Logbuch-Eintrag
- **Notizen:** Angelegt 2026-10-11 (ADR-061). KI-Läufe in einer Cloud-Session (gültiger Schlüssel). Gemessen wurde Auffüllung an/aus bei gleichem Text statt „Kanon vor den Seiten“ (Begründung im Bericht); Kosten 2,67 $.
