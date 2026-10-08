# Bewertung „Weiterbauen, umbauen oder neu aufsetzen?“ – Phase 4

- **Anlass:** STOPP Phasen-Wucherung in Phase 4 und Befunde aus der Nutzung (`docs/fahrplan.md`, STOPP-Block; Logbuch 2026-10-08).
- **Getrennte Instanz:** Unteragent ohne Gesprächsverlauf, Modell Sonnet 5 (anderes Modell als die bauende KI, Opus 5.5), nur lesend; Eingaben: `docs/vision.md`, `docs/architecture.md`, `docs/decisions.md`, `docs/fahrplan.md`, Code und Tests. Datum: 2026-10-08.
- **Unverändert wiedergegeben** (`CLAUDE.md` Abschnitt 12); einzige Anpassung: zwei fette Zwischenzeilen als Überschriften gesetzt (Markdown-Linter). Die Stellungnahme der bauenden KI steht im Logbuch-Eintrag vom 2026-10-08 und im ADR zur Entscheidung, nicht hier.

---

## Befund zum Bestand (Stärken und Schwächen mit Belegen)

Die Bewertung stammt aus eigener Lektüre. Die Pytest-Suite habe ich ausgeführt, die UI-Tests nicht. Beim Fahrplan habe ich Phase 4, Phase 5 und die Schritte V.1–V.8 gelesen. Von den ADRs kenne ich Teil A und ADR-024.

### Stärken

- **Struktur und Tests.** Der Bestand umfasst rund 16.700 Zeilen in Python-Server, UI und Tests. Meine Läufe: 410 Python-Tests grün, Coverage 99,79 %; `context/builder.py` (601 Zeilen), `canon/service.py` und `manuscript/service.py` je 100 %. Die UI-Tests sind zahlreich, ihre Coverage habe ich nicht erneut gemessen. Im Code gibt es kein `TODO(fahrplan-ref …)`, also keine versteckten Platzhalter.
- **Reaktiv-Quote.** Sie steht bei 0/10 (Teil A). Es gibt nur ein reaktives ADR (ADR-018). Die Architektur trägt die Features bisher additiv: ADR-023 (Modell je Geschichte) und Hinweis 4.14 (`NoteSplitter` in `api/flows/writing.py`) kamen ohne Umbau aus.
- **Kern.** `context/builder.py` ist ein reiner Lese-Aufbau mit Vorrangfolge und Budgetprüfung. Die Anfrage ist in `_frame()` (Zeile 401), `build()` (Zeile 162) und `_story_state()` gekapselt. Dateien als Quelle der Wahrheit mit abgeleitetem Index passen zur Vision (offene Formate). Die Modulgrenzen sind sauber, und `api/flows` hält die Routen dünn.
- **Aufteilung.** `StoryPage.tsx` wurde aufgeteilt (ADR-024) und hat jetzt 104 Zeilen. Die Befunde der Prüf-Instanz aus Phase 3 sind damit erledigt.

### Schwächen (die neuen Befunde treffen vor allem die Oberfläche und zwei harte Stellen im Code)

- **Oberfläche.** `App.tsx` (181 Zeilen) ist ein reiner Zustandsautomat über vier Bildschirme (`Screen`) ohne Router. Eine Geschichte ist eine einzige lange Seite: `StoryPage.tsx` stapelt Gäste, Schreibweise, Fakten, Zusammenfassung, Kapitelknöpfe und Kapitel-Editor in einem `.card`. Darunter folgt `ChapterEditor.tsx` (227 Zeilen) mit dem `WritingPanel` (396 Zeilen). Befund (a) ist damit belegt: `styles.css:150-155` setzt nur `min-height: 20rem` für den Editor, es gibt keine Höhenbegrenzung. Die Befunde (a) und (e) sind Layout- und Ablaufprobleme. Datenmodell und Backend sind davon nicht betroffen.
- **Modell-Liste fest verdrahtet.** `ai_gateway/models.py:28-33` enthält `DEFAULT_MODELS` mit drei Einträgen. `DEFAULT_MODEL` wird in `api/flows/writing.py:50` als erstes Element abgeleitet. Die Liste wird an mehreren Stellen direkt benutzt: `writing_routes.py:73`, `manuscript_routes.py:108` (Validierung), `writing.py:95` und `summary.py:73` (Standardparameter), `openrouter.py:75`. Der Parameter `models: Mapping[str, ModelConfig]` ist bereits eine Einspeisestelle, aber das Konzept „Modell-Katalog“ gibt es noch nicht. Befund (h) ist deshalb eine Änderung quer durch ai_gateway, api und ui (Kategorie 5).
- **Keine Erkennung von Weigerungen im Text.** Der Strom kennt nur `ModelRefused` über `finish_reason` (`openrouter.py`). Eine Weigerung als Text wird als `ok` gezählt (`stream_events`, `outcome = "ok"`). `NoteSplitter` zeigt aber, wie eine Erkennung im Text-Strom aussehen kann.
- **Kosten nicht sichtbar (Befund d).** `openrouter.py:217` fordert `usage: include` an, `_usage()` (Zeile 294) liest `cost`. Wenn das Feld fehlt, bleibt der Wert `None`. Die Ursache habe ich nicht verifiziert; das ist eine Vermutung zum Anbieterverhalten (ggf. nur beim Stromende oder modellabhängig).
- **Rahmen der KI-Anfrage (Befund b).** `_frame()` enthält keine Anweisung zum nahtlosen Anschluss, ohne Einleitung und ohne Schlusssatz. Das lässt sich im Rahmen beheben. Ob es wirkt, ist laut Fahrplan Vermutung und braucht ein Probeschreiben.
- **Keine Ablage für Anweisungen oder Tonalität.** `Story` (`manuscript/service.py:74-87`) kennt Perspektive, Gäste, Fakten, Modell und Summary. Gespeicherte Anweisungen (c) und Tonalität je Kapitel (FR-026, Fahrplan 5.6) sind neue Felder oder neue Dateien, also Datenmodell (Kategorie 4).
- **Fahrplan.** Phase 4 hat 16 statt 8 Schritte, und die Befunde (a)–(h) sind noch nicht eingeplant. 5.6 hängt an 4.8. Außerdem ist `docs/architecture.md` Abschnitt 9 nicht auf dem aktuellen Stand, weil der Stand „nach Schritt 4.7“ ist, obwohl 4.8 bis 4.16 schon liefen. Das ist Doku-Drift, aber kein Code-Mangel.
- **Zusammenhang mit der Vision.** Vision Abschnitt 5/8 (SillyTavern: „überladene Oberfläche“ vermeiden) und das Erfolgskriterium „erste Szene in 30 Minuten“ sind mit der jetzigen Seitenfülle gefährdet. Der Wunsch (c) „Chat-Ansicht“ liegt nahe am Chat-Fokus, den die Vision nicht übernehmen will. Er muss bewusst entschieden werden.

## Option 1: Weiterbauen – Kosten, Risiken, Belege

- **Aufwand:** niedrig bis mittel für die Backend-Wünsche. Das sind Rahmentext (b), Textweigerung (a/Sperren), Katalog (h), Anweisungs-Speicher (c) und Tonalität (5.6); sie sind additiv wie ADR-023 und 4.14.
- **Risiko:** Die Oberfläche wird weiter über `StoryPage` gestapelt, und jeder neue Block (Chat-Ansicht, Weltenbauer, Import/Export) verschlechtert Befund (e). Das Risiko ist die Überladung. Die Phasen-Wucherung (16 statt 8) würde sich fortsetzen, wenn alles in Phase 4 landet.
- **Beleg:** Es gibt keine Blocker (`docs/blockers.md`) und keine reaktive Häufung. Aber der Befund (e) ist im Code sichtbar (`StoryPage.tsx` stapelt alles; `App.tsx` ohne Navigation über Welt/Geschichte/Kapitel hinaus).

## Option 2: Gezielt umbauen – welche Teile, Kosten, Risiken, Belege

Der Umbau betrifft nur die `ui` und zwei Randstellen in `ai_gateway`/`api`; der Kern bleibt.

1. **UI-Seitenaufbau und Abläufe neu ordnen** (Befunde a, e, c-Ansicht). Aufwand mittel: `App.tsx`, `StoryPage.tsx`, `ChapterEditor.tsx`, `WritingPanel.tsx`. Der Editor bekommt eine feste Höhe mit Sprung ans Ende (a). Das Schreiben rückt in den Vordergrund, Einstellungen (Gäste, Schreibweise, Fakten, Summary) wandern in einen eigenen Bereich. Ob es dafür einen Router braucht, ist eine Entscheidung, und die Bibliothek wäre Kategorie 3. Die bestehenden UI-Tests (`views.test.tsx` 580 Zeilen, `WritingPanel.test.tsx` 541, `App.test.tsx` 230) müssen mitgezogen werden; das ist der eigentliche Aufwandsposten. V.8 (Gestaltung/Material Design) danach, wie vom Eigentümer entschieden.
2. **Modell-Katalog** (h). Aufwand mittel: `ai_gateway/models.py` bekommt einen von OpenRouter geladenen Katalog (Kontextgröße, Preis) mit zwischengespeicherten Einträgen. `writing_routes.py:73`, `manuscript_routes.py:108`, `flows` benutzen ihn statt `DEFAULT_MODELS`. Die Reasoning-Konfiguration je Modell bleibt ein Mapping mit Standard. Das ist eine Schnittstellenänderung (Kategorie 5, ggf. 4 für Favoriten) und braucht Freigabe.
3. **Textweigerung erkennen** und Modellreihenfolge (Sperren). Aufwand klein: Erkennung im Stream analog `NoteSplitter`; die Reihenfolge ist ein ADR zu ADR-010/011.

- **Risiko:** Der Umbau der UI ist der größte Einzelposten; Gefahr ist ein Regressionsfehler beim Editor-Wiedereinstieg und bei den E2E-Tests (`e2e/`).
- **Belege:** Die Backend-Module bleiben unberührt (100 % Coverage); die Aufteilung der Geschichtenseite wurde schon einmal ohne Probleme gemacht (ADR-024 → `StoryPage` von 757 auf 104 Zeilen).

## Option 3: Neu aufsetzen – Kosten, Risiken, Belege

- **Aufwand:** hoch (mehrere Wochen Arbeit für ca. 16.700 Zeilen mit 410 Python-Tests und umfangreichen UI-Tests), und dabei gehen die in Phase 1 bis 4 erprobten Entscheidungen (ADR-010, 011, 013, 017, 023) und das belegte Deployment (Gate 4.6, Backup-Wiederherstellung 4.3) verloren oder müssen erneut belegt werden.
- **Risiko:** hoch, ohne erkennbaren Gewinn. Kein Beleg im Bestand spricht dafür: keine Blocker, keine reaktive Häufung, keine Modulgrenzen-Verletzung, keine Platzhalter.
- **Teilweise Neuaufstellung:** nur sinnvoll für die Schicht „Seitenaufbau“ in der UI. Das ist in Option 2 enthalten.

## Empfehlung der getrennten Instanz – mit Konfidenz und der einen Frage

**Empfehlung: Option 2, gezielt umbauen, begrenzt auf die `ui` (Seitenaufbau/Abläufe) und einen Modell-Katalog.** Dazu kommt das übrige Backend per Weiterbauen: Textweigerung, Rahmen (b), Tonalität (5.6), gespeicherte Anweisungen (c). Der Kern (`storage`, `canon`, `manuscript`, `context`, `api`) bleibt unverändert. Neu aufsetzen ist nicht begründet. Reines Weiterbauen würde die Überladung (e) verstärken und passt nicht zum Ziel „intuitive Bedienung“. Die Neuplanung sollte Phase 4 abschließen (v0.1.0 nach 4.8, D.11) und die neuen Wünsche in eine Phase mit eigener Schrittzahl legen, statt Phase 4 weiter aufzublähen. Weltenbauer (f) und SillyTavern-Export/-Import (g, V.6/V.7) gehören in die Phase danach, nicht in den Umbau.

**Konfidenz: mittel bis hoch** für „Kern behalten“ (Belege: Coverage, Reaktiv-Quote, Modulgrenzen). **Mittel** für den Umfang des UI-Umbaus, denn ob Router und Komponenten-Bibliothek nötig sind, habe ich nicht geprüft (Vermutung). Die Ursache von Befund (d) und die Wirkung des Rahmens (b) sind ebenfalls ungeprüft.

**Die Frage, die nur der Eigentümer beantworten kann:** Soll das Skriptorium primär eine ruhige Schreibansicht für ein Kapitel sein, in der die Anweisungen nur ein Hilfsverlauf sind, oder soll das Gespräch mit der KI (Chat-Ansicht, Weltenbauer) die Hauptform werden? Davon hängt ab, ob der UI-Umbau das Manuskript in den Mittelpunkt stellt oder einen Chat.
