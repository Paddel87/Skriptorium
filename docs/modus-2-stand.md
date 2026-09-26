# Modus-2-Stand (Übergabe zwischen Sessions)

<!-- Temporäre Übergabe-Datei während Modus 2 (templates/projektstart.md Abschnitt 1.3).
     Das Logbuch beginnt erst mit der ersten regulären Session nach dem Initialisierungs-Commit.
     Diese Datei wird im Initialisierungs-Commit (Schritt 12) gelöscht. -->

- **Stand vom:** 2026-09-26
- **Modus 2 gestartet:** 2026-09-26 per Triggerphrase „Modus 2 starten".
- **Vorbereitung:** erledigt – `docs/` enthält frische Kopien aus `templates/docs/` (Klassen-Hypothese M).
- **Schritt 1 (Klassifikation):** Hypothese **Klasse M**, vom Eigentümer nicht beanstandet; endgültige Bestätigung nach Schritt 4. Risiko Richtung G: Kontext-Zusammenstellung für lange Geschichten könnte einen zweiten Speicher (z. B. Suchindex) erfordern. ADR-001 wird in Schritt 5 geschrieben.
- **Schritt 1a (Anforderungen):** abgeschlossen, `docs/requirements.md` vom Eigentümer bestätigt (18 Muss / 4 Soll / 1 Kann / 1 verworfen).
- **Nächster Schritt:** Schritt 2 fortsetzen – Bausteine innerhalb von B (Server-Framework, Oberflächen-Framework, Editor, KI-Anbindung, Paketwerkzeuge) vorlegen; danach 2a Versions-Verifikation; dann `docs/project-context.md` befüllen.
- **Kostenrahmen (Schritt 2):** bis 50 € monatlich für KI-Anfragen und Hosting zusammen (Angabe des Eigentümers, 2026-09-26) → `docs/project-context.md` Abschnitt 8.
- **Bestandsprüfung:** abgeschlossen 2026-09-26, `docs/research/bestandspruefung.md` (Lizenzen der Gruppe-(a)-Kandidaten gegengeprüft).
- **Grundsatzentscheidung Eigenbau vs. Anpassung:** **B – schlanker Eigenbau**, Konzepte aus der Bestandsprüfung übernehmen, kein fremder Code (Eigentümer, 2026-09-26). Verworfen: A – Anpassung von The Story Nexus oder Story Labyrinth (AGPL-3.0, fremde Form, Rückbau nötig, Differenzierungsmerkmale ohnehin neu zu bauen); C – Praxistest vorab. Empfehlung über Heuristik 1.3 (weniger Abhängigkeiten) und Default-Bias; Konfidenz mittel (belegt aus Code und Doku, nicht erprobt); Umkehrbarkeit teuer. Vision-Frage, die entschied: „Schnell mit einem fremden Werkzeug in dessen Form – oder etwas später genau in deiner Arbeitsweise?" → eigene Arbeitsweise. Folge: Projektlizenz bleibt frei wählbar (Vision 6). ADR dazu in Schritt 5 (`[STRATEGISCH]`), verworfene Alternativen nach `docs/architecture.md` Abschnitt 8.
- **Plattform-Entscheidung:** **B – eigene Web-App, Server in Python, Oberfläche in TypeScript** (Eigentümer, 2026-09-26). Grund des Eigentümers: Python ist bei KI-Werkzeugen (Kontext, Zusammenfassung, Suche) am stärksten verbreitet – wichtiger als eine einzige Sprache. Verworfen: A – Web-App durchgehend TypeScript (eine Sprache, aber schwächeres KI-Ökosystem); C – Obsidian-Plugin (Empfehlung der KI: kein Server, kein Zugangsschutz, kein Sicherheits-Gate; verworfen zugunsten einer eigenen Web-App). Konfidenz der KI-Empfehlung C war mittel. Folge: Server, Zugangsschutz, Backups und das Gate vor dem ersten öffentlichen Deployment (CLAUDE.md §12) sind Pflicht. Belege zu C: Obsidian kostenlos für jeden Zweck (obsidian.md/license, Stand 2025-02-20); Plugins laufen mobil ohne Node/Electron (docs.obsidian.md, Mobile development).
- **Vorgaben für 2a:** Mindestreife = Linie mindestens 6 Monate veröffentlicht und mit Fehlerkorrektur-Versionen; geplante Projektdauer = 3 Jahre (bis ca. Ende 2029). → `docs/project-context.md` Abschnitt 3.
- **Merkposten für spätere Schritte:**
  - ADR zum Verwerfen von FR-006 (Geschichten übernehmen) in Schritt 5.
  - Welt-Material liegt in TypingMind-Agenten und Notion – relevant für FR-005 und Schritt 2.
  - Publizieren sowie Bilder und Karten brauchen `[VERSCHOBEN]`-Schritte in Schritt 6.
  - Vision fordert öffentliches Cloud-Hosting bei einem einzigen Nutzer ohne Konten → Zugangsschutz trotzdem nötig (Schritt 4a, Härtung in Schritt 3).
  - Modellklassen-Zuordnung für Skriptorium in `docs/project-context.md` Abschnitt 6 festlegen (bisher übernommen aus Dev-Templates: Opus 5.5 = Entscheidungs-Klasse).
