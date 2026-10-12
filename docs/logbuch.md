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

### 2026-10-12 – [PHASEN-WECHSEL] Reflexion Phase 6 (UMSETZUNG) → Phase 7 (UMSETZUNG)

- **Gelernt:** Bei Fremdformaten den schreibenden Code des Herstellers lesen, nicht nur die Spezifikation (Hinweis des Eigentümers in 6.8): SillyTavern schreibt `chara` und `ccv3`, Lorebooks mit `comment`/`enabled`.
- **Gelernt:** Kopfzeilen und Sicherheitsregeln immer auch von außen prüfen – der Proxy überschrieb die CSP der App (6.6). Die getrennte Prüfung des Codes allein sah das nicht.
- **Gelernt:** Erst messen, dann entscheiden: der Spike 6.13 belegte den Schaden fehlender Kanon-Einträge (4,0/3,3 statt 0/0,7 Widersprüche je Kette) und machte 6.3 zur klaren Entscheidung; die Technik-Prüfung an der Geschichte des Eigentümers zeigte 0–28 → 34 von 34 Einträgen.
- **Gelernt:** Sichtproben mit Sonderfunktionen (`@`) Zeichen für Zeichen tippen; Einfügen am Stück übersah das fehlende `@`-Menü im Weltenbauer (6.7).
- **Gelernt:** Beim Einspielen nur über HTTPS warten, dann eine SSH-Abfrage – eine SSH-Schleife sperrte den Zugang vorübergehend.
- **Kippende Annahmen:** Websuche „ca. 1 ct“ – tatsächlich 5–7 ct je Antwort, weil Suchergebnisse als Eingabe zählen (6.7). Pauschaler Überschriften-Versatz im Import aus 6.8 hätte Gegenstände beim Rückimport verformt (6.9, angepasst).
- **Reifegrad:** unverändert `[BELASTBAR]`; NFR Kontexttreue beim Referenzumfang mit 6.3 und der Prüfung an der Geschichte des Eigentümers gestützt.
- **ADRs der Phase:** 059–068 (062 Kanon vor den Seiten, 063 Schutz, 064 Weltenbauer, 065/066 SillyTavern, 067 Pflichtfrage, 068 Planung Phase 7); Reaktiv-Quote 0/10.
- **Wucherung:** 12 → 14 Schritte (+6.13 Spike, +6.14 als Ausnahme auf Wunsch des Eigentümers); Schwelle > 15 nicht erreicht.
- **Getrennte Instanz:** fünfmal eingesetzt (Schutz 6.4–6.6, Import 6.8 mit Nachprüfung, Import-Änderung 6.9, Pflichtfrage); fand u. a. ein kubisch langsames Muster im bestehenden Markdown-Import.
- **Neue Erkundungsbedarfe:** Ablage von Bilddateien (7.6), Format für das Publizieren (7.4), V.20 (Figurenkarten im Netz finden).
- **Methodik-Lehren:** Phasenregeln (ADR-060: neue Wünsche → V-Schritte) vor dem ersten Mockup prüfen; Session erneut weit über der Kontextgrenze (dauerhaftes „weiter hier“ des Eigentümers).
- **Details:** [`docs/archiv/logbuch-phase-6.md`](archiv/logbuch-phase-6.md)

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
