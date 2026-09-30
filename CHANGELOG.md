# Changelog

Alle nutzerrelevanten Änderungen werden hier festgehalten. Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionierung nach [SemVer](https://semver.org/lang/de/).

## [Unreleased]

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
