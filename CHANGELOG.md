# Changelog

Alle nutzerrelevanten Änderungen werden hier festgehalten. Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionierung nach [SemVer](https://semver.org/lang/de/).

## [Unreleased]

### Hinzugefügt (nach v0.1.0)

- Länge je Vorschlag wählbar (2026-10-08, Schritt 5.15): Auswahl „Länge“ im Schreib-Bereich mit kurz (etwa 60–120 Wörter), mittel (150–300, voreingestellt) und lang (400–600). Neues optionales Feld `length` im Schreib-Endpunkt.

### Geändert (nach v0.1.0)

- Leerzeichen nach der Auswahl im `@`-Menü (2026-10-08, Schritt 5.17): Wer einen Kanon-Eintrag wählt und sofort weiterschreibt, hängt das nächste Wort nicht mehr an den Namen; der Eintrag bleibt herangezogen.
- Kapitel öffnet am Textende (2026-10-08, Schritt 5.9): Der Manuskript-Editor hat einen eigenen Scrollbereich (höchstens 55 % der Fensterhöhe) und zeigt beim Öffnen und nach einem übernommenen Vorschlag das Ende des Textes; liegen die Knöpfe darunter außerhalb des Fensters, rückt die Seite zum Kapitel. „In den Kanon“ und das Anweisungsfeld sind so ohne langes Scrollen erreichbar.
- Voreingestelltes Modell grok-4.6 statt grok-4.7 (2026-10-08, Schritt 5.7, ADR-044): grok-4.7 sperrte die echten Texte des Eigentümers häufig. Neue Geschichten und Geschichten ohne gewähltes Modell schreiben jetzt mit grok-4.6, ebenso die Kurzfassungen; eine Geschichte mit gewähltem Modell behält es. grok-4.7 bleibt wählbar, qwen3.8-max ist Notfall-Reserve. `GET /api/models` liefert die Reihenfolge grok-4.6, grok-4.7, qwen3.8-max.
- Nahtloser Anschluss beim Weiterschreiben (2026-10-08, Schritt 5.8): Die KI bekommt das Ende des laufenden Kapitels (die letzten bis zu 30 Wörter) zitiert und die Vorgabe, unmittelbar danach in derselben Szene weiterzuschreiben – ohne Einleitung, die Ort, Lage und Figuren neu einführt, und ohne abschließenden oder zusammenfassenden Satz. Bei einem leeren Kapitel entfällt das Zitat.
- Die KI schreibt nur, was verlangt ist (2026-10-08, Schritte 5.15 und 5.8): Nach der Anweisung stehen feste Vorgaben – nur ausschreiben, was die Anweisung verlangt, und nicht vorgreifen; was Gesamtzusammenfassung, Kurzfassungen oder Zeitlinie über spätere Ereignisse sagen, gilt als Zukunft und wird weder erzählt noch angedeutet; keine Sätze, Bilder und Gesten aus den letzten Seiten wiederholen; kein Schlusssatz. Beschreibt die Anweisung, was die selbst geführte Figur tut oder sagt, schreibt die KI genau das aus. „Weiterschreiben“ ohne Anweisung verlangt nur den nächsten Moment der Szene.

## [0.1.0] – 2026-10-08

Erste vergebene Version, als Vorabversion (ADR-043): Das Skriptorium läuft seit 2026-09-30 öffentlich mit Passwortschutz und wird vom Eigentümer für echte Texte genutzt. Go-Live erst vor v1.0.0.

### Geändert

- Markdown-Import (2026-10-08, Schritt 4.16): Ein Gegenstand, unter dessen Namen direkt die Abschnitte Zweck, Verwendung und Auswirkung folgen, wird als ein Eintrag erkannt, statt in drei Einträge „Zweck“, „Verwendung“, „Auswirkung“ zu zerfallen.
- Bedienhinweise beim Schreiben (2026-10-08, Schritt 4.15): Bei leerem Kapitel erklärt ein Satz über dem Schreib-Bereich den Einstieg, das leere Anweisungsfeld zeigt ein graues Beispiel. Das `@`-Menü sagt, wenn kein Eintrag passt oder die Welt noch keinen Kanon hat, statt stumm zu bleiben.
- Hinweis der KI getrennt vom Text (2026-10-08, Schritt 4.14): Verlangt eine Anweisung etwas, das dem Kanon widerspricht, schreibt die KI kanontreu und erklärt die Abwandlung in einem Hinweis über dem Vorschlag; „Übernehmen“ übernimmt nur den Text. Neues Ereignis `hinweis` im Schreib-Stream.
- Kürzerer Einrichtungscode (2026-10-07, Schritt 4.13, ADR-041): `skriptorium-einrichtung` zeigt 12 Zeichen in Dreiergruppen (z. B. `K7Q-M3X-RAP-H9D`) aus Großbuchstaben und Ziffern ohne Verwechsler; bei der Eingabe spielen Groß-/Kleinschreibung, Bindestriche und Leerzeichen keine Rolle. Der Code wird wie das Passwort mit scrypt gespeichert; ein vor dem Update erzeugter Code gilt nicht mehr.

### Hinzugefügt

- Öffentlicher Betrieb (2026-09-30, Schritt 4.7, ADR-039): Das Skriptorium läuft auf dem Server des Eigentümers unter HTTPS mit Passwortschutz. Zusätzliche Sicherheits-Kopfzeilen auf jeder Antwort: `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` ohne Kamera, Mikrofon und Standort; der Proxy verbietet das Einbetten in fremde Seiten.
- Tägliche verschlüsselte Sicherung des Datenverzeichnisses außerhalb des Servers mit erprobter Wiederherstellung (2026-09-30, Schritt 4.3, ADR-036); Notfall-Anleitung im Runbook (Schritt 4.4).
- Modellwahl je Geschichte und KI-Kosten (2026-09-27, Schritt 3.9, ADR-023): Die Geschichte merkt sich das im Schreib-Bereich gewählte Modell. Unter jedem Vorschlag stehen Token und Kosten, bei einer Ablehnung der Hinweis, ein anderes Modell zu wählen; der Anbieter wird angezeigt. Jede KI-Anfrage (Schreiben, Kurzfassungen) wird ohne Text in `system/verbrauch/JJJJ-MM.md` gezählt; „Konto“ zeigt die Kosten des laufenden Monats. Neuer Endpunkt `GET /api/usage`; `PATCH …/stories/{id}` nimmt `model` an.
- Fakt aus dem Text in den Kanon (2026-09-27, Schritt 3.8): Eine im Manuskript markierte Stelle wird mit „In den Kanon“ zu einem neuen Eintrag der Welt oder ergänzt einen bestehenden Eintrag als Absatz am Ende. Vorgeschlagen werden der in der Stelle genannte Eintrag bzw. für einen neuen Eintrag die Stelle als Name und die zuletzt gewählte Kategorie. Beim Ergänzen wählt der Autor „Kanon“ (bei einem Gast: der Kanon der Figur in ihrer Heimatwelt) oder „nur diese Geschichte“; bei Gästen ist „nur diese Geschichte“ vorbelegt. Neuer Abschnitt „Fakten dieser Geschichte“ zeigt die nur hier geltenden Fakten und entfernt sie.
- Gast-Figuren aus anderen Welten (2026-09-27, Schritt 3.7): Eine Geschichte bindet Einträge anderer Welten ein, die nur in ihr gelten. Gäste stehen im `@`-Menü (als „Gast“ markiert), in der neuen Szene und in der Figuren-Schreibweise zur Wahl. Die KI erhält einen genannten oder selbst geführten Gast vollständig und mit seiner Herkunftswelt, einen nicht genannten nur, wenn nach dem Kanon der Welt noch Platz ist; die Regeln seiner Heimatwelt gehen nicht mit. Der Schreib-Endpunkt nimmt Gäste in `references` und in der Szene an.
- Kapitel-Kurzfassungen (2026-09-27, Schritt 3.6): Beim Abschließen eines Kapitels erstellt die KI eine Kurzfassung und schreibt die Gesamtzusammenfassung der Geschichte fort; beides lässt sich ansehen und ändern, eine fehlende Kurzfassung nachholen. Beim Weiterschreiben kennt die KI so den Handlungsstand früherer Kapitel; fehlt eine Kurzfassung, nutzt sie den Kapitelanfang. Neuer Endpunkt `POST …/chapters/{n}/summarize`.

- `@`-Menü (2026-09-27, Schritt 3.5): Im Anweisungsfeld bietet `@` die Kanon-Einträge der Welt (Namen und Aliasse) zur Auswahl an; jeder per `@` genannte Eintrag wird der KI vollständig mitgegeben, auch wenn die Welt sonst nicht ins Budget passt. Unter dem Feld steht, welche Einträge herangezogen werden.
- Figuren-Schreibweise (2026-09-27, Schritt 3.4): Erzählperspektive und selbst geführte Figuren je Geschichte einstellen; die KI schreibt für diese Figuren keine Handlung, Rede oder Gedanken mehr und endet dort, wo der Autor weiterschreibt.
- Schreiben mit KI (2026-09-26, Schritt 3.3): Schreib-Bereich unter dem Kapitel-Editor – Anweisung oder neue Szene (Ort, Figuren, Ziel) senden, Vorschlag erscheint fortlaufend („denkt nach …“ mit laufender Zeit), übernehmen ans Kapitelende, ändern, verwerfen, abbrechen, mit anderem Modell neu schreiben. Endpunkte `POST …/chapters/{n}/write` (Server-Sent Events) und `GET /api/models`. Ohne `OPENROUTER_API_KEY` läuft der Server weiter, Schreiben antwortet 503.
- Oberfläche (2026-09-26, Schritt 2.7): Anmeldung, Einrichtung, Passwortwechsel und Sitzungsübersicht; Welten, Kanon-Pflege, Markdown-Import mit Vorschau, Geschichten und Kapitel mit Markdown-Editor (CodeMirror 6); Content-Security-Policy.
- Anmeldung und HTTP-Schnittstelle (2026-09-26, Schritt 2.6, ADR-017): Passwort selbst wählen über einen einmaligen Einrichtungscode (`skriptorium-einrichtung`), Prüfung gegen Pwned Passwords von Have I Been Pwned, Sitzungen mit Übersicht und Beenden, Sperre nach Fehlversuchen; Endpunkte für Welten, Kanon-Einträge, Suche, Markdown-Import, Geschichten, Kapitel, Gast-Verbindungen und Fakten. Neue Umgebungsvariable `SKRIPTORIUM_DATA_DIR`.
- Projektgerüst (2026-09-26, Schritt 2.1): Python-Server mit Gesundheitsprüfung `/api/health`, Oberflächen-Gerüst (React, Vite), alle Prüf-Gates in Pre-Commit und CI, Einrichtung von Cloud-Sessions per `scripts/session-start.sh`.
- Projektinitialisierung (2026-09-26): Vision, Anforderungen, Stack, Architektur, Entscheidungen (ADR-001 bis ADR-009) und Fahrplan. Noch kein lauffähiger Code.

### Behoben

- Bei einem unerwarteten Serverfehler fehlten die Sicherheits-Kopfzeilen (auch HSTS); die Antwort ist jetzt `{"detail": "Interner Fehler"}` mit allen Kopfzeilen (2026-09-30, Schritt 4.7).
- Ohne eingerichteten KI-Anbieter meldete die Oberfläche fälschlich „Die Passwortprüfung ist gerade nicht erreichbar“; jetzt „Kein KI-Anbieter eingerichtet“ (2026-09-27, Schritt 3.6).
- Bei einem sehr langen Kapitel ohne Leerzeilen zwischen den Absätzen bekam die KI beim Weiterschreiben keinen Manuskripttext mit; jetzt geht das Ende des Kapitels ein (2026-09-27, Schritt 4.1).
