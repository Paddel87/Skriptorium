# Requirements – Skriptorium

<!-- Klasse M (Hypothese, ADR-001 im Entwurf): in Modus 2 aus docs/vision.md abgeleitet
     (templates/projektstart.md Schritt 1a, verkürzte Form). Abschnitte 1, 3, 5, 6 Pflicht;
     2 und 4 optional. Vertiefung auf Anforderung, nicht Mindest-Lektüre (CLAUDE.md Abschnitt 2). -->

<!-- ANCHOR:uebersicht -->
## 1. Übersicht (Stand vom 2026-09-26)

**Status:** bestätigt vom Eigentümer am 2026-09-26 (Modus 2 Schritt 1a abgeschlossen). Nachtrag FR-025 am selben Tag (Schritt 2, Quelle: Eigentümer).

| Kennzahl | Wert |
|---|---|
| Anforderungen gesamt | 25 |
| davon Muss / Soll / Kann | 19 / 4 / 1 |
| Muss-Anforderungen ohne Fahrplan-Schritt | 19 – Fahrplan entsteht in Modus 2 Schritt 6 |
| Muss-Anforderungen ohne Test (Pflicht ab Klasse G) | nicht anwendbar (Klasse M) |
| Verworfen (mit ADR) | 1 (FR-006, ADR folgt in Schritt 5) |

**Offene Punkte:** siehe Abschnitt 7 („Klärungsfragen aus der Ableitung").

<!-- ANCHOR:beteiligte -->
## 2. Beteiligte

| Rolle / Gruppe | Interesse am System | Einfluss auf Entscheidungen | Betroffenheit | Wie wird sie gehört? |
|---|---|---|---|---|
| Autor (Eigentümer) | Prosa in eigenen Welten schreiben, ohne dass die KI den Kanon bricht; Kosten pro Anfrage senken | allein entscheidend | einziger Nutzer | direkt im Chat mit dem Coding-Agent |
| KI-Anbieter (Cloud) | – (externe Partei) | indirekt: Filterpolitik und Preise | Abhängigkeit des Systems | Beobachtung von Preis- und Filteränderungen (Vision Abschnitt 9) |

<!-- ANCHOR:anwendungsfaelle -->
## 3. Anwendungsfälle

### Enthalten

| ID | Wer | Was | Quelle |
|---|---|---|---|
| UC-001 | Autor | Eine Welt anlegen oder bestehendes Welt-Material einmalig übernehmen und darin loslegen | Vision 2, 4 (30-Minuten-Kriterium) |
| UC-002 | Autor | Den Kanon einer Welt pflegen: Figuren, Orte und Geografie, Gegenstände, Zeitlinie, Regeln, Kultur | Vision 3 |
| UC-003 | Autor | Mit einer neuen Szene einsteigen (Ort, Figuren, Ziel); die KI formuliert einen ersten Absatz | Vision 3, Szenario 1 |
| UC-004 | Autor | Am laufenden Manuskript im Wechsel mit der KI weiterschreiben, mit Kenntnis aller vorherigen Kapitel | Vision 3, Szenario 2 |
| UC-005 | Autor | Im Wechsel mit der KI als eine Figur schreiben (häufig die neu eingeführte Ich-Figur), während die KI Welt und übrige Figuren führt; der Wechsel ergibt das Manuskript | Vision 3 („im Gespräch mit Figuren und Welt"), präzisiert durch den Eigentümer 2026-09-26 |
| UC-006 | Autor | Einen Kanon-Eintrag per `@` gezielt ansprechen | Vision 3, Szenario 5 |
| UC-007 | Autor | Vorschläge für Kanon-Bezüge ohne `@` erhalten und annehmen oder ablehnen | Vision 3, 9 |
| UC-008 | Autor | Einen neuen Fakt aus dem Text heraus in den Kanon eintragen | Vision 3, Szenario 3 |
| UC-009 | Autor | Eine Figur aus Welt A in einer Geschichte in Welt B auftreten lassen – nur für diese Geschichte | Vision 3, Szenario 4 |
| UC-010 | Autor | Eine Figur in einer anderen Geschichte derselben Welt weiterverwenden | Vision 2, 4 |
| UC-011 | Autor | Romane, Kurzgeschichten und Fragmente nebeneinander führen | Vision 3 |
| UC-012 | Autor | KI-Anbieter und Modell wechseln | Vision 6, 7 |
| UC-013 | Autor | Am Smartphone schreiben und den Kanon pflegen | Vision 7 |
| UC-014 | Autor | Welten und Texte als lesbare Dateien besitzen, ohne Lock-in | Vision 7 |

### Bewusst ausgeschlossen

| Anwendungsfall | Begründung | Entschieden am | Wieder aufgreifen, wenn … |
|---|---|---|---|
| Spielbetrieb (Rollenspielrunden, Würfel, Regelmechanik, Spielleitung) | Vision Abschnitt 5 | 2026-09-26 (Vision) | Vision-Pivot per ADR |
| Mehrere Nutzer (Konten, Rechte, gemeinsames Schreiben) | Vision Abschnitt 5 | 2026-09-26 (Vision) | Vision-Pivot per ADR |
| Übergeordnete Multiversums-Ebene (weltübergreifende Kosmologie oder Zeitlinie) | Vision Abschnitt 5 – Verbindungen entstehen nur durch Geschichten | 2026-09-26 (Vision) | Vision-Pivot per ADR |
| Automatisches Übernehmen von Kanon-Bezügen oder neuen Fakten ohne Zutun des Autors | Vision Abschnitt 3 – nur Vorschlag; Autor trägt selbst ein | 2026-09-26 (Vision) | Vision-Pivot per ADR |
| Selbst betriebenes KI-Modell | Vision Abschnitt 6 – technisch nicht umsetzbar | 2026-09-26 (Vision) | Rahmenbedingung ändert sich |
| Publizieren (Satz, Export, Veröffentlichung) | Vision Abschnitt 5 – nicht in der ersten Version, nicht ausgeschlossen | 2026-09-26 (Vision) | Landeplatz als `[VERSCHOBEN]`-Schritt im Fahrplan (Modus 2 Schritt 6) |
| Bilder und Karten | Vision Abschnitt 5 – nicht in der ersten Version, nicht ausgeschlossen | 2026-09-26 (Vision) | Landeplatz als `[VERSCHOBEN]`-Schritt im Fahrplan (Modus 2 Schritt 6) |

<!-- ANCHOR:kernprozesse -->
## 4. Kernprozesse

### Prozess: Szene schreiben mit Kanon-Rückfluss

- **Ist:** 1. Welt samt Figuren als Agent in TypingMind öffnen. 2. Geschichte fortlaufend im Chat schreiben; jede Anfrage schickt den gesamten Verlauf mit. 3. Neue Fakten bleiben im Chatverlauf und fließen nicht in den Agenten-Kanon zurück. 4. Ab ca. 125.000–140.000 Tokens pro Anfrage wird es wirtschaftlich untragbar.
- **Soll:** 1. Welt wählen, Einstieg wählen (Szene, Manuskript, Gespräch). 2. Kanon-Einträge per `@` ansprechen; Vorschläge ohne `@` annehmen oder ablehnen. 3. Im Wechsel mit der KI schreiben; die KI bekommt den relevanten Kanon-Ausschnitt und den Handlungsstand, nicht den gesamten Verlauf. 4. Neue Fakten mit einem Handgriff aus dem Text in den Kanon eintragen.
- **Betroffene Anwendungsfälle:** UC-003, UC-004, UC-006, UC-007, UC-008

<!-- ANCHOR:funktionale-anforderungen -->
## 5. Funktionale Anforderungen

| ID | Anforderung | Anwendungsfall | Priorität | Prüfbare Akzeptanz | Fahrplan-Schritt | Test (ab Klasse G) | Status |
|---|---|---|---|---|---|---|---|
| FR-001 | Mehrere Welten führen; Kanon und Geschichten jeder Welt sind voneinander getrennt | UC-001 | Muss | Ein Eintrag aus Welt A erscheint weder in Vorschlägen noch im KI-Kontext einer Geschichte in Welt B, solange diese Geschichte keine Verbindung herstellt | TBD (Modus 2 Schritt 6) | – | OFFEN |
| FR-002 | Kanon-Einträge der Kategorien Figur, Ort/Geografie, Gegenstand, Zeitlinie, Regel, Kultur anlegen, ändern, löschen | UC-002 | Muss | Je Kategorie ein Eintrag anlegbar, änderbar, löschbar; Änderung ist in der nächsten KI-Anfrage wirksam | TBD | – | OFFEN |
| FR-003 | Gegenstands-Einträge tragen Zweck, Verwendung und Auswirkung auf Welt und Figuren; die KI berücksichtigt sie im weiteren Text | UC-002, UC-006 | Muss | Szenario 5 der Vision: Nach `@Runenklinge` enthält der KI-Text keine Verwendung, die Zweck oder Wirkung widerspricht | TBD | – | OFFEN |
| FR-004 | Die Zeitlinie ordnet Ereignisse einer Welt in einer Abfolge | UC-002 | Muss | Ereignisse sind in zeitlicher Reihenfolge einsehbar; die KI setzt keine Handlung vor ein Ereignis, das laut Zeitlinie später liegt, ohne dass der Autor es verlangt | TBD | – | OFFEN |
| FR-005 | Bestehendes Welt-Material (mehrere Dokumente, zweistellige Seitenzahl) einmalig in den Kanon übernehmen | UC-001 | Muss (bestätigt 2026-09-26) | Eine bestehende Welt ist innerhalb des 30-Minuten-Rahmens (FR-022) als Kanon nutzbar | TBD | – | OFFEN |
| FR-006 | Bestehende Geschichten (insbesondere die Referenzgeschichte) übernehmen und fortschreiben | UC-004 | – | – | – | – | VERWORFEN 2026-09-26 (Entscheidung des Eigentümers; ADR folgt in Modus 2 Schritt 5) |
| FR-007 | Geschichten je Welt in den Formen Roman (mit Kapiteln), Kurzgeschichte und Fragment führen | UC-011 | Muss | Je Form eine Geschichte anlegbar; Romane in Kapitel gliederbar | TBD | – | OFFEN |
| FR-008 | Neue Szene aus Vorgabe (Ort, Figuren, Ziel): die KI formuliert einen ersten Absatz unter Kenntnis von Vorgeschichte, Beziehung und Ort | UC-003 | Muss | Szenario 1 der Vision; Absatz widerspricht keinem Kanon-Eintrag der beteiligten Figuren und des Orts | TBD | – | OFFEN |
| FR-009 | Im Wechsel schreiben: die KI setzt fort, der Autor schreibt und ändert selbst, beides im selben Manuskript | UC-004 | Muss | Autor kann KI-Text übernehmen, ändern oder verwerfen; der Manuskript-Stand ist danach die Grundlage der nächsten Fortsetzung | TBD | – | OFFEN |
| FR-010 | Beim Weiterschreiben kennt die KI den Handlungsstand aller vorherigen Kapitel, auch bei Umfang der Referenzgeschichte | UC-004 | Muss | Erfolgskriterium „kein Kontextverlust" (Vision 4) an der Referenzgeschichte geprüft; Kostengrenze siehe Abschnitt 6 | TBD | – | OFFEN |
| FR-011 | Die KI widerspricht dem Kanon der Welt nicht | UC-003, UC-004 | Muss | Höchstens ein beim Redigieren gefundener Kanon-Widerspruch pro Kapitel (Vision 4) | TBD | – | OFFEN |
| FR-012 | Figuren-Schreibweise: Je Geschichte legt der Autor fest, welche Figur(en) er selbst führt (häufig eine Ich-Figur); die KI führt Welt und übrige Figuren und schreibt die vom Autor geführte Figur nur auf ausdrückliche Anweisung. Erzählperspektive und Aufteilung sind je Geschichte wählbar. Der Wechsel ist das Manuskript, kein getrennter Chat | UC-005, UC-004 | Muss (Hauptarbeitsweise des Eigentümers, 2026-09-26) | In einer Geschichte mit Ich-Figur schreibt die KI ohne Anweisung keine Handlung, Rede oder Gedanken der Ich-Figur; der gesamte Wechsel liegt als fortlaufender Manuskript-Text vor | TBD | – | OFFEN |
| FR-013 | `@`-Verweis: Eingabe von `@` bietet Einträge der Welt der Geschichte (und ausdrücklich verbundener Einträge) zur Auswahl; der Eintrag wird für die KI herangezogen | UC-006 | Muss | `@Kael` in einer Anweisung → der KI-Text nutzt Wissen, das nur im Eintrag „Kael" steht | TBD | – | OFFEN |
| FR-014 | Kanon-Bezüge ohne `@` erkennen und nur als Vorschlag anbieten („Meintest du @Kael?"), nie selbstständig heranziehen | UC-007 | Soll (bestätigt 2026-09-26) | Nicht angenommene Vorschläge beeinflussen den KI-Kontext nicht | TBD | – | OFFEN |
| FR-015 | Textstelle markieren und als neuen Kanon-Eintrag oder als Ergänzung eines bestehenden eintragen | UC-008 | Muss | Vom Markieren bis zum gespeicherten Eintrag unter 10 Sekunden (Vision 4) | TBD | – | OFFEN |
| FR-016 | Eine Figur in weiteren Geschichten derselben Welt verwenden, ohne dass ihr Kanon verloren geht | UC-010 | Muss | In Geschichte 2 sind alle in Geschichte 1 eingetragenen Fakten der Figur verfügbar | TBD | – | OFFEN |
| FR-017 | Eine Geschichte kann eine Figur (oder einen anderen Eintrag) aus einer anderen Welt einbinden; die Verbindung gilt nur für diese Geschichte | UC-009 | Muss | Szenario 4 der Vision: Übrige Geschichten beider Welten zeigen den Gast-Eintrag weder in Vorschlägen noch im KI-Kontext | TBD | – | OFFEN |
| FR-018 | KI-Anbieter und Modell wählen und wechseln, ohne Welten oder Texte zu verlieren; nutzbar mit Modellen ohne restriktive Inhaltsfilter für Fiktion | UC-012 | Muss | Wechsel auf ein anderes Modell ohne Datenverlust; Weiterschreiben mit dem neuen Modell in derselben Geschichte | TBD | – | OFFEN |
| FR-019 | Schreiben und Kanon-Pflege am Smartphone | UC-013 | Soll | UC-003, UC-004, UC-008 auf einem Smartphone-Browser oder -Gerät durchführbar | TBD | – | OFFEN |
| FR-020 | Welten und Texte liegen als lesbare Dateien vor (z. B. Markdown) oder lassen sich verlustfrei so ausgeben | UC-014 | Soll | Eine Welt samt Geschichten ist ohne das Skriptorium in einem Texteditor lesbar | TBD | – | OFFEN |
| FR-021 | Wiederverwendung bestehender Open-Source-Bausteine vor Eigenentwicklung | – | Soll | Bestandsprüfung vor der Stack-Entscheidung dokumentiert (ADR-002) | TBD | – | OFFEN |
| FR-022 | Vom ersten Öffnen bis zur ersten geschriebenen Szene in einer bestehenden Welt höchstens 30 Minuten ohne Anleitung, einschließlich einmaliger Einrichtung | UC-001 | Muss | Stoppuhr-Test durch den Autor (Vision 4) | TBD | – | OFFEN |
| FR-024 | Beim Eintragen eines neuen Fakts über eine Gast-Figur aus einer anderen Welt wählt der Autor je Fakt: Kanon der Figur (gilt überall, wo sie auftritt) oder nur die verbindende Geschichte | UC-008, UC-009 | Muss (bestätigt 2026-09-26) | Beide Wege wirken wie gewählt; auch mit der Wahl bleibt das Eintragen unter 10 Sekunden (FR-015) | TBD | – | OFFEN |
| FR-025 | Die KI-Anbindung ist erweiterbar: Weitere API-Anbieter lassen sich künftig parallel zu OpenRouter hinzufügen, ohne die bestehende Anbindung zu ändern; je Geschichte bzw. Anfrage ist der Anbieter wählbar | UC-012 | Muss (Eigentümer, 2026-09-26) | Ein zweiter Anbieter lässt sich über eine neue Anbindung ergänzen, ohne Code der OpenRouter-Anbindung oder der Schreib-Funktionen zu ändern | TBD | – | OFFEN |
| FR-023 | Zeitlinien-Einträge optional mit Datumsangaben im Kalender der Welt | UC-002 | Kann | – | TBD | – | OFFEN |

**Regeln:**

- IDs werden nie wiederverwendet, auch nicht nach Streichung.
- Eine Muss-Anforderung ohne Fahrplan-Schritt ist ein Bug (Drift-Prüfung, CLAUDE.md Abschnitt 16).
- Eine Muss-Anforderung zu streichen oder herabzustufen ist ein Descope: Status `VERWORFEN` mit ADR (CLAUDE.md Abschnitt 6, „Keine Verschiebung ohne Landeplatz").
- Neue Anforderungen während des Projekts bekommen Datum und Quelle (z. B. „Live-Test 2026-06-20").

<!-- ANCHOR:nicht-funktionale-anforderungen -->
## 6. Nicht-funktionale Anforderungen

Einzige Quelle für Werte ist `docs/architecture.md` Abschnitt 6 (Befüllung in Modus 2 Schritt 4). Besonders betroffen:

- **Kosten pro Anfrage** unter dem heutigen Stand (Referenz ca. 125.000–140.000 Tokens pro Anfrage, Vision 4): UC-003, UC-004, UC-005.
- **Kein Kontextverlust** bei einer Geschichte vom Umfang der Referenzgeschichte (500.000–700.000 Tokens Chatverlauf, Vision 4): UC-004.
- **Austauschbarkeit des KI-Anbieters** (Vision 6): UC-012 und alle Schreib-Anwendungsfälle.

<!-- ANCHOR:klaerungsfragen-aus-der-ableitung -->
## 7. Klärungsfragen aus der Ableitung

1. ~~**Übernahme von Bestand**~~ – entschieden 2026-09-26: nur Welt-Material (FR-005 Muss), Geschichten beginnen neu (FR-006 verworfen). Folge: Die Erfolgskriterien „kein Kontextverlust" und „günstiger pro Anfrage" (Vision 4) werden an einer Geschichte gleichen Umfangs geprüft, nicht an der übernommenen Referenzgeschichte. Das Welt-Material liegt in TypingMind-Agenten und in Notion vor (Angabe des Eigentümers, 2026-09-26).
2. ~~**Gesprächs-Einstieg**~~ – geklärt 2026-09-26: gemeint ist keine Nebenunterhaltung, sondern die Hauptarbeitsweise – der Autor führt eine Figur (oft eine neu eingeführte Ich-Figur), die KI Welt und übrige Figuren, Perspektive je Geschichte wechselnd; der Wechsel ist das Manuskript (FR-012, Muss). Abgleich mit Vision 5 und 8: kein Spielbetrieb (keine Würfel, Regeln, Spielleitung) und kein Chat getrennt vom Manuskript – die Abgrenzung bleibt gewahrt.
3. ~~**Neue Fakten über Gast-Figuren**~~ – entschieden 2026-09-26: Der Autor wählt beim Eintragen je Fakt (FR-024).
4. ~~**Prioritäten insgesamt**~~ – Liste mit allen Prioritäten bestätigt 2026-09-26.
