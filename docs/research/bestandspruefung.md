# Bestandsprüfung vorhandener Werkzeuge – Skriptorium

**Zweck:** Grundlage für die Stack-Optionen und die offene Frage „Eigenbau vs. Anpassung" (`docs/vision.md` Abschnitt 9; `docs/requirements.md` FR-021). Dieses Dokument enthält **keine Entscheidung und keinen Stack-Vorschlag**, sondern belegte Fakten und eine Einordnung je Werkzeug.

**Stand:** 2026-09-26 (alle Quellen an diesem Tag abgerufen).

<!-- ANCHOR:methode -->
## Methode

- **Open-Source-Werkzeuge:** Flacher Klon (`git clone --depth 1`) des öffentlichen Repositorys am 2026-09-26, danach Vertiefung der Historie auf zwölf Monate (`--shallow-since=2025-09-26`). Daraus ermittelt: Lizenzdatei (Kopfzeilen gelesen), letzter Commit auf dem Standard-Branch, Zahl der Commits und Autoren der letzten zwölf Monate, neuestes Tag samt Datum (`git ls-remote --tags`, `git fetch … tag`). Funktionsaussagen stammen aus README, Doku-Ordnern und gezielter Code-Suche (Dateipfade jeweils genannt). Die GitHub-REST-API war in dieser Umgebung nicht nutzbar; Sterne und „Release"-Objekte sind deshalb nicht erfasst.
- **Proprietäre Werkzeuge:** Offizielle Hilfe-, Preis- und Doku-Seiten per Abruf; wo nur Drittquellen verfügbar waren, ist das vermerkt.
- **OpenRouter:** Öffentliche Modellliste `https://openrouter.ai/api/v1/models` am 2026-09-26 abgerufen und ausgewertet.
- **Bewertung je Muss-Anforderung:** `ja` / `teilweise` / `nein` / `unbekannt`. „ja" heißt: Funktion ist in Doku oder Code belegt – **nicht**, dass sie die Akzeptanz aus `docs/requirements.md` im Praxistest erfüllt. Keines der Werkzeuge wurde installiert oder mit echten Daten betrieben. Ergebnis-Anforderungen (FR-011 „kein Kanon-Widerspruch", FR-022 „30 Minuten") sind ohne Praxistest durchgehend `unbekannt`.
- **Muss-Anforderungen (18):** FR-001, 002, 003, 004, 005, 007, 008, 009, 010, 011, 012, 013, 015, 016, 017, 018, 022, 024. **Soll:** FR-014, 019, 020, 021.
- **Kennzeichnung:** *Fakt* = belegt mit Quelle. *Einordnung* = Bewertung gegen Vision und Anforderungen; sie ist Urteil, kein Beleg.

<!-- ANCHOR:uebersicht -->
## Übersicht

Muss-Abdeckung als Zählung über die 18 Muss-Anforderungen (J = ja, T = teilweise, N = nein, U = unbekannt). Die Zahlen sind grob; die Begründung steht im jeweiligen Abschnitt.

| Werkzeug | Lizenz | Selbst-Hosting | Pflege (letzter Commit / neuestes Tag) | Muss-Abdeckung grob | Quellen |
|---|---|---|---|---|---|
| SillyTavern | AGPL-3.0 | ja | 2026-09-14 / 1.19.0 (2026-09-14) | J2 T10 N4 U2 | [Repo](https://github.com/SillyTavern/SillyTavern), [World Info](https://docs.sillytavern.app/usage/core-concepts/worldinfo/) |
| KoboldAI Lite / KoboldCpp | AGPL-3.0 (beide) | ja | Lite 2026-09-21; KoboldCpp 2026-09-15 / v1.121 | J1 T10 N3 U4 | [Lite](https://github.com/LostRuins/lite.koboldai.net), [KoboldCpp](https://github.com/LostRuins/koboldcpp) |
| NovelCrafter | proprietär (Abo) | nein (nicht belegt) | SaaS, nicht feststellbar | J5 T9 N1 U3 | [Preise](https://www.novelcrafter.com/pricing), [Hilfe](https://www.novelcrafter.com/help) |
| Sudowrite | proprietär (Abo) | nein (nicht belegt) | SaaS, nicht feststellbar | J3 T5 N2 U8 | [Preise](https://sudowrite.com/pricing), [Doku](https://docs.sudowrite.com) |
| NovelAI | proprietär (Abo) | nein (nicht belegt) | SaaS, nicht feststellbar | J0 T8 N3 U7 | [Lorebook](https://docs.novelai.net/en/text/lorebook/), [Start](https://novelai.net/) |
| Story Labyrinth | AGPL-3.0 | ja | 2026-09-08 / 821 Commits in 12 Mon. | J5 T10 N1 U2 | [Repo](https://github.com/bloodgrv/story-labyrinth) |
| The Story Nexus (Web, JonSilver) | AGPL-3.0 | ja | 2026-01-23 / 498 Commits in 12 Mon. | J5 T8 N2 U3 | [Repo](https://github.com/JonSilver/TheStoryNexus) |
| The Story Nexus (Tauri, Original) | AGPL-3.0 | ja (Desktop) | 2026-09-26 / 68 Commits in 12 Mon. | wie Web-Fassung, nicht einzeln bewertet | [Repo](https://github.com/vijayk1989/TheStoryNexusTauriApp) |
| Writingway 2 | **keine Lizenzdatei** (Drittquelle nennt MIT) | ja (lokal) | 2026-05-16 / 170 Commits in 12 Mon. | J4 T6 N2 U6 | [Repo](https://github.com/aomukai/Writingway2) |
| Obsidian + KI-Plugins | Obsidian proprietär (kostenlos); Copilot AGPL-3.0; Text Generator MIT; Smart Connections eigene Lizenz | Obsidian lokal | Copilot 2026-09-25; Text Generator 2026-08-06; Smart Connections 2026-09-24 | J1 T10 N1 U6 (mit Copilot) | [Obsidian-Lizenz](https://obsidian.md/license), Repos s. Abschnitt |
| Open WebUI | Open WebUI License (BSD-3-basiert + Branding-Klausel) | ja | 2026-09-21 / v0.11.4 | J1 T5 N7 U5 | [Repo](https://github.com/open-webui/open-webui) |
| LibreChat | MIT | ja | 2026-09-25 / v0.8.8-rc4 (2026-09-22) | J1 T4 N7 U6 | [Repo](https://github.com/danny-avila/LibreChat) |
| TypingMind (Ist-Werkzeug) | proprietär („NOT an open-source software") | kostenpflichtige Self-Host-Variante, kompilierter Code | SaaS, nicht feststellbar | J1 T4 N8 U5 | [Lizenz](https://github.com/TypingMind/typingmind/blob/main/LICENSE.md), [Doku](https://docs.typingmind.com) |
| OpenWrite | AGPL-3.0 | ja (Cloudflare Workers + D1) | 2026-08-18 / 35 Commits in 12 Mon. | J2 T5 N6 U5 | [Repo](https://github.com/ilrein/openwrite) |
| Plot Bunni | MIT | ja (Browser, IndexedDB) | 2026-04-19 / 6 Commits in 12 Mon. | J1 T6 N7 U4 | [Repo](https://github.com/MangoLion/plotbunni) |
| Novel Engine | MIT | ja | 2026-09-16 / 499 Commits in 12 Mon. | nur grob geprüft, s. Abschnitt | [Repo](https://github.com/Jackela/Novel-Engine) |
| LoreWeave | AGPL-3.0 | ja | 2026-09-13 / 9.648 Commits in 12 Mon. | nur grob geprüft, s. Abschnitt | [Repo](https://github.com/letuhao/lore-weave) |
| Manuskript | GPL-3.0 | lokal (Desktop) | 2026-09-02 / 0.17.0 (2025-06-30) | J0 T4 N11 U3 | [Repo](https://github.com/olivierkes/manuskript) |
| bibisco (Community Edition) | GPL-3.0 | lokal (Desktop) | 2024-09-27 / v2.4.0 (2022-06-14) | J0 T3 N12 U3 | [Repo](https://github.com/andreafeccomandi/bibisco) |
| Kanka | Commons Clause, `composer.json`: „proprietary" | Code öffentlich, Lizenz schränkt ein | 2026-09-23 / 3.15 (2026-09-07) | J0 T5 N10 U3 | [Repo](https://github.com/owlchester/kanka), [Preise](https://kanka.io/pricing) |
| Lore Codex | GPL-3.0 | lokal (Windows-Desktop) | 2026-09-17 / 666 Commits in 12 Mon. | keine KI-Funktion, s. Abschnitt | [Repo](https://github.com/KantikPotatoe/Lore-Codex) |

<!-- ANCHOR:werkzeuge-im-einzelnen -->
## Werkzeuge im Einzelnen

### SillyTavern

**Fakten:**

- Lizenz: GNU AGPL-3.0 (`LICENSE`, Kopfzeile). Selbst-Hosting: ja, Node.js-Server (`package.json`: `"engines": {"node": ">= 20"}`), Docker-Datei im Repo.
- Pflege: Standard-Branch `release`, letzter Commit 2026-09-14; neuestes Tag `1.19.0` vom 2026-09-14; 797 Commits von 145 Autoren in den letzten zwölf Monaten (nur Branch `release`).
- Technologie: JavaScript (Node.js/Express-Backend unter `src/endpoints/`, Browser-Frontend unter `public/`).
- World Info: Einträge werden per Schlüsselwort (auch Regex), dauerhaft („constant") oder per Vektor-Ähnlichkeit aktiviert. Geltungsbereiche: global, an eine Figur gebunden, an eine Persona gebunden, an einen einzelnen Chat gebunden („Entries from a chat-bound lorebook are only active in that specific conversation"). Rekursion und Inclusion Groups vorhanden. Manuelle Platzierung über „Outlets" und das Makro `{{outlet::Name}}` ([Doku](https://docs.sillytavern.app/usage/core-concepts/worldinfo/)).
- Slash-Befehle `/createentry`, `/setentryfield`, `/getchatbook` in `public/scripts/world-info.js` (Zeilen 1642, 1824, 1860).
- Zusammenfassung: Erweiterung „Summarize" (`public/scripts/extensions/memory/`). Vektorspeicher für Chat-Nachrichten, Dateien und World Info (`public/scripts/extensions/vectors/index.js`: `enabled_chats`, `enabled_files`, `enabled_world_info`, standardmäßig aus).
- Modelle: eigener OpenRouter-Endpunkt (`src/endpoints/openrouter.js`).
- Speicherformat: Chats als JSONL (`src/endpoints/chats.js`), Lorebooks als JSON-Dateien (`src/endpoints/worldinfo.js`).
- Mobil: Betrieb auf Android über Termux dokumentiert ([Doku](https://docs.sillytavern.app/installation/android-(termux)/)). Fernzugriff ist per `config.yaml` möglich (`listen: false`, `whitelistMode: true` als Voreinstellung).

**Muss-Anforderungen:**

| FR | Bewertung | Begründung |
|---|---|---|
| FR-001 | teilweise | Mehrere Lorebooks möglich; kein Begriff „Welt", Trennung nur über Zuordnung zu Figur/Chat |
| FR-002 | teilweise | Einträge sind frei (Schlüssel + Inhalt); keine festen Kategorien |
| FR-003 | teilweise | Zweck/Verwendung/Wirkung nur als Freitext abbildbar |
| FR-004 | nein | Kein Zeitlinien-Konzept in der World-Info-Doku gefunden |
| FR-005 | nein | Kein Import aus Notion oder TypingMind gefunden |
| FR-007 | nein | Arbeitseinheit ist der Chat, keine Roman/Kapitel-Struktur |
| FR-008 | teilweise | Über Prompt/Nachricht möglich, keine Szenen-Vorgabe als Funktion |
| FR-009 | teilweise | Nachrichten editierbar, „Continue"; Ergebnis bleibt Chatverlauf |
| FR-010 | teilweise | Summarize-Erweiterung und Chat-Vektorisierung vorhanden |
| FR-011 | unbekannt | Nur im Praxistest prüfbar |
| FR-012 | teilweise | Persona (Autor) + Figuren inkl. Gruppenchat; Ergebnis ist Chat, nicht Manuskript |
| FR-013 | teilweise | Aktivierung automatisch per Schlüsselwort; kein `@`-Auswahlmenü; Outlet-Makro manuell |
| FR-015 | teilweise | `/createentry` per Slash-Befehl; Markieren-und-Eintragen-Oberfläche nicht belegt |
| FR-016 | ja | Figurengebundene Lorebooks gelten über alle Chats der Figur |
| FR-017 | teilweise | Chatgebundene Lorebooks gelten nur in einem Chat |
| FR-018 | ja | OpenRouter und weitere Anbieter |
| FR-022 | unbekannt | Nur im Praxistest prüfbar |
| FR-024 | nein | Keine Wahl „Kanon der Figur vs. nur diese Geschichte" beim Eintragen gefunden |

**Soll:** FR-014 nein (Automatik statt Vorschlag). FR-019 teilweise (Termux bzw. Fernzugriff nach Konfiguration). FR-020 teilweise (JSON/JSONL-Dateien, lesbar, kein Markdown).

**Widerspruch zur Vision:** hoch. Die Vision (Abschnitt 8) nennt SillyTavern ausdrücklich als Vorbild für World Info, lehnt aber Chat-/Rollenspiel-Fokus und überladene Oberfläche ab. Der Chat ist die Grundeinheit des Werkzeugs.

**Lizenzfolge bei Anpassung:** AGPL-3.0 – abgeleitete Werke müssen unter AGPL-3.0 stehen; bei Betrieb als Netzdienst ist der Quelltext den Nutzern anzubieten.

### KoboldAI Lite und KoboldCpp

**Fakten:**

- Lizenz: beide AGPL-3.0 (`LICENSE.md`). KoboldCpp enthält zusätzlich `MIT_LICENSE_GGML_SDCPP_LLAMACPP_ONLY.md` für eingebettete Fremdteile.
- Pflege: Lite letzter Commit 2026-09-21, 385 Commits/14 Autoren in zwölf Monaten. KoboldCpp letzter Commit 2026-09-15, Tag `v1.121` vom 2026-09-15 (die Autorenzahl ist durch eingemischte llama.cpp-Historie nicht aussagekräftig).
- Technologie: Lite ist eine einzelne HTML-Datei (`index.html`, ca. 1,7 MB, JavaScript). KoboldCpp ist ein C++/Python-Server für **lokale** Modelle – nach Vision Abschnitt 6 nicht einsetzbar; relevant ist nur Lite.
- Lite-Funktionen laut Code (`index.html`): Modi „Story Mode", „Adventure Mode", „Chat Mode", „Instruct Mode"; World Info; Memory; „autosummary"; „TextDB"; OpenRouter-Anbindung (50 Fundstellen).

**Muss-Anforderungen:** FR-001 teilweise (World Info je Speicherstand, Export/Import), FR-002 teilweise (freie Einträge), FR-003 teilweise (Freitext), FR-004 unbekannt, FR-005 nein, FR-007 nein (ein Text je Speicherstand), FR-008 teilweise, FR-009 teilweise (Story Mode als fortlaufender Text), FR-010 teilweise (autosummary, TextDB), FR-011 unbekannt, FR-012 teilweise (Chat-/Adventure-Modus, kein Manuskript), FR-013 teilweise (Schlüsselwort-Automatik), FR-015 unbekannt, FR-016 teilweise (Export/Import), FR-017 teilweise, FR-018 ja (OpenRouter im Code), FR-022 unbekannt, FR-024 nein.

**Soll:** FR-014 nein, FR-019 unbekannt (Web-Seite, mobil nicht geprüft), FR-020 teilweise (JSON-Speicherstände).

**Widerspruch zur Vision:** mittel bis hoch – Fokus auf Einzelsitzung mit einem Text, Adventure- und Chat-Modi, sehr viele Einstellungen.

**Lizenzfolge:** AGPL-3.0, wie SillyTavern.

### NovelCrafter

**Fakten:**

- Lizenz: proprietär, Abo „Scribe" 4 $/Monat bis „Specialist" 20 $/Monat; BYOK ab „Hobbyist" (8 $/Monat); 21 Tage Test ([Preise](https://www.novelcrafter.com/pricing)). Selbst-Hosting: auf Preis- und Hilfeseiten nicht erwähnt.
- Codex: Einträge u. a. Figur, Ort, Gegenstand, Lore, Nebenhandlung mit Tags und eigenen Feldern ([Anatomie](https://www.novelcrafter.com/help/docs/codex/anatomy-codex-entry)). KI-Einbindung je Eintrag: „Include when detected" (Name/Alias im Text erkannt, Standard), „Always include", „Never include", „Don't include when detected"; Einträge können auch manuell als Szenenkontext ergänzt werden ([Tracking](https://www.novelcrafter.com/help/docs/codex/codex-tracking)).
- Series Codex: Einträge gelten für alle Bücher einer Serie; Einträge lassen sich zwischen Buch und Serie verschieben ([Series Codex](https://www.novelcrafter.com/help/docs/codex/series-codex)).
- Eintrag aus Text: Markieren und „+ Codex Entry"; ein markierter Satz landet in der Beschreibung ([Kurs](https://www.novelcrafter.com/courses/ultimate-beginners-guide/setting-up-the-codex)). „Extract" wandelt Überschriften-Blöcke eines Snippets oder Chats in mehrere Codex-Einträge um.
- Handlungsstand: Szenen-Zusammenfassungen früherer Szenen gehen als Kontext in den Prompt; POV je Roman oder Szene mit Codex-Figur ([Suche Hilfe-Seiten Prompts/POV](https://www.novelcrafter.com/help/reference/prompts/prompt-functions)).
- Modelle: OpenRouter, OpenAI, Groq, Ollama, LM Studio, OpenAI-kompatible Dienste ([OpenRouter-Hilfe](https://www.novelcrafter.com/help/docs/ai-connections/openrouter)).
- Export: Codex als ZIP, je Eintrag eine Datei ([FAQ](https://www.novelcrafter.com/help/faq/codex/codex-export)); Roman als .docx oder Markdown (Suchergebnis zur [Export-Hilfe](https://www.novelcrafter.com/help/docs/export/novel)). Nach Kündigung Lesezugriff und Export.

**Muss-Anforderungen:**

| FR | Bewertung | Begründung |
|---|---|---|
| FR-001 | ja | Serie als Welt abbildbar; Series Codex gilt nur innerhalb der Serie |
| FR-002 | teilweise | Typen und eigene Felder; Zeitlinie/Regel/Kultur als eigene Typen nicht belegt |
| FR-003 | teilweise | Über eigene Felder abbildbar, kein vorgegebenes Schema |
| FR-004 | unbekannt | Zeitlinien-Funktion nicht geprüft |
| FR-005 | teilweise | „Extract" aus eingefügtem Text; kein direkter Notion-/TypingMind-Import belegt |
| FR-007 | teilweise | Roman mit Akten/Kapiteln/Szenen; Kurzgeschichte/Fragment als Form nicht belegt |
| FR-008 | ja | Prosa-Generierung aus Szenen-Beats (in Hilfe erwähnt) |
| FR-009 | ja | Manuskript-Editor mit KI-Funktionen |
| FR-010 | teilweise | Szenen-Zusammenfassungen als Kontext; Tragfähigkeit bei Referenzumfang ungeprüft |
| FR-011 | unbekannt | Praxistest |
| FR-012 | teilweise | POV je Szene; keine Sperre „KI schreibt die Autor-Figur nicht" belegt |
| FR-013 | teilweise | Automatische Namens-/Alias-Erkennung plus manuelle Kontext-Auswahl; kein `@` |
| FR-015 | teilweise | Markieren → neuer Eintrag; Ergänzen eines bestehenden Eintrags nicht belegt |
| FR-016 | ja | Codex bzw. Series Codex bleibt erhalten |
| FR-017 | teilweise | Buch-eigene Einträge möglich, aber keine Verknüpfung zu einer anderen Serie |
| FR-018 | ja | BYOK inkl. OpenRouter |
| FR-022 | unbekannt | Praxistest |
| FR-024 | nein | Nicht gefunden |

**Soll:** FR-014 nein (automatische Einbindung statt Vorschlag; per Einstellung „Don't include when detected" abschaltbar). FR-019 teilweise (Hilfeseite erwähnt Anpassung für kleine Bildschirme). FR-020 teilweise (Export Markdown/ZIP, Daten beim Anbieter).

**Widerspruch zur Vision:** gering bei Ausrichtung (Manuskript statt Chat), aber Automatik bei der Kanon-Einbindung widerspricht dem `@`-Hauptweg. Kein Open Source (Vision 6, 7).

**Lizenzfolge:** keine Code-Übernahme möglich; nur Konzeptvorbild.

### Sudowrite

**Fakten:**

- Lizenz: proprietär, 10–44 $/Monat mit Credit-Kontingent ([Preise](https://sudowrite.com/pricing)). Modelle: eigene Modelle „Muse" und „Ballad", Claude, OpenAI und weitere laut Preisseite. Eigener API-Schlüssel (BYOK): nur als offene Funktionsanfrage gefunden ([Feedback](https://feedback.sudowrite.com/p/byok-bring-your-own-key-version-of-sudo-write)).
- Story Bible: Braindump, Genre, Style, Synopsis, Characters, Worldbuilding, Outline, Scenes; „Scene and Prose Generation will only look at explicitly mentioned Characters and Worldbuilding elements" ([Doku](https://docs.sudowrite.com/using-sudowrite/1ow1qkGqof9rtcyGnrWUBS/what-is-the-story-bible/jmWepHcQdJetNrE991fjJC)).
- Series Folder: Characters und Worldbuilding werden über alle Projekte einer Serie geteilt ([Series Support](https://docs.sudowrite.com/using-sudowrite/1ow1qkGqof9rtcyGnrWUBS/series-support/3vfbZPCB1ANLm75FXmJf28)). Eine Mobile-App ist dokumentiert ([Mobile App](https://docs.sudowrite.com/using-sudowrite/1ow1qkGqof9rtcyGnrWUBS/mobile-app-overview/4MxYzYduLSPQ3VpoP6dyxo)).

**Muss-Anforderungen:** FR-001 teilweise (Serien getrennt), FR-002 teilweise (Characters, Worldbuilding), FR-003 teilweise, FR-004 unbekannt, FR-005 unbekannt, FR-007 unbekannt, FR-008 ja (Scenes/Draft), FR-009 ja (Write/Rewrite/Expand), FR-010 teilweise (Drittquelle: „Chapter Continuity", nicht offiziell geprüft), FR-011 unbekannt, FR-012 unbekannt, FR-013 teilweise (nur explizit erwähnte Elemente; kein `@` belegt), FR-015 unbekannt, FR-016 ja (Series Folder), FR-017 unbekannt, FR-018 **nein** (kein BYOK, Modellauswahl durch Anbieter), FR-022 unbekannt, FR-024 nein.

**Soll:** FR-014 unbekannt, FR-019 ja (Mobile-App), FR-020 unbekannt.

**Widerspruch zur Vision:** gering beim Fokus, aber harte Randbedingung „Modelle ohne restriktive Inhaltsfilter, Modellwechsel möglich" (Vision 6) ist ohne BYOK nicht belegbar.

**Lizenzfolge:** keine Code-Übernahme möglich.

### NovelAI

**Fakten:**

- Lizenz: proprietär, Abo ab 10 $/Monat; Textmodell auf der Startseite „GLM 4.6"; keine Nutzung externer Modelle erwähnt ([Startseite](https://novelai.net/)).
- Lorebook: Aktivierung per Schlüssel (auch Regex, `&`-Verknüpfung), „Always On", Kategorien mit Standard-Platzierung, Token-Budget je Eintrag; Import/Export als `.json`, `.lorebook` oder PNG mit eingebettetem Lorebook ([Doku](https://docs.novelai.net/en/text/lorebook/)).

**Muss-Anforderungen:** FR-001 teilweise (Lorebook je Story, übertragbar), FR-002 teilweise (frei definierbare Kategorien), FR-003 teilweise, FR-004 unbekannt, FR-005 nein (nur eigene Formate), FR-007 unbekannt, FR-008 teilweise, FR-009 teilweise (fortlaufender Story-Text), FR-010 unbekannt, FR-011 unbekannt, FR-012 unbekannt, FR-013 teilweise (Schlüssel-Automatik), FR-015 unbekannt, FR-016 teilweise (Lorebook-Export/Import), FR-017 teilweise, FR-018 **nein** (nur eigene Modelle), FR-022 unbekannt, FR-024 nein.

**Soll:** FR-014 nein, FR-019 unbekannt, FR-020 teilweise (JSON-Export).

**Widerspruch zur Vision:** mittel; Kernkonflikt ist die Bindung an die Modelle des Anbieters (Vision 6, 7).

**Lizenzfolge:** keine Code-Übernahme möglich.

### Story Labyrinth

**Fakten:**

- Lizenz: AGPL-3.0 (`LICENSE`). Fork von The Story Nexus (README). Selbst-Hosting: Express + SQLite, Docker-Images (amd64/arm64/armv7), Tailscale-Anleitung.
- Pflege: letzter Commit 2026-09-08; 821 Commits von 5 Autoren in zwölf Monaten; 8 Tags.
- Technologie: TypeScript; Express 5, SQLite (`better-sqlite3`), Drizzle ORM, `sqlite-vec` (FTS5 + Vektor-RAG); React 19, Vite, Tailwind, Lexical-Editor (README).
- Datenmodell (`server/db/schema.ts`): Tabellen `series`, `stories` (mit `seriesId`), `chapters` (mit `summary`, `povCharacter`, `povType`), `lorebookEntries` mit `level` = `global` | `series` | `story` und `scopeId`, Kategorien `character`, `location`, `item`, `event`, `note`, `synopsis`, `starting scenario`, `timeline`; `codexState` (Kleidung, Aussehen, Wunden, Gegenstände, eigene Felder); `codexSnapshots`, `codexPendingChanges`; `storyTimelines`; `ragChunks`; `users`, `sessions`.
- Funktionen (README): Codex-Änderungen nur über „propose → approve"; Continuity-Scanner gegen den Codex; Import von Charakter-Bibeln aus PDF/DOCX mit Extraktion von Lorebook-Einträgen; Export EPUB/PDF/HTML/Markdown; Datenbank-Export als JSON; Rollen Owner/Editor/Viewer; sechs Chat-„Desks", TTS, Karten, Namensgenerator, MCP-Anbindung.
- Modelle: OpenAI, OpenRouter, xAI, Gemini, lokale OpenAI-kompatible Endpunkte, Überschreibung je Funktion.

**Muss-Anforderungen:**

| FR | Bewertung | Begründung |
|---|---|---|
| FR-001 | ja | Lorebook-Ebene `series` mit `scopeId`; Serie als Welt abbildbar |
| FR-002 | teilweise | Kategorien vorhanden; „Regel" und „Kultur" fehlen als eigene Kategorie |
| FR-003 | teilweise | Lore Sheet (Markdown) + `codexState`; kein Schema Zweck/Verwendung/Wirkung |
| FR-004 | teilweise | Story Timeline je Geschichte, nicht je Welt |
| FR-005 | teilweise | Import aus PDF/DOCX mit Extraktion; Notion-Markdown nicht geprüft |
| FR-007 | teilweise | Geschichten mit Kapiteln; Formen nicht unterschieden |
| FR-008 | ja | Szenen-Beats (`scene_beat` im Prompt-Typ) |
| FR-009 | ja | Editor mit KI-Fortsetzung und Kapitelversionen |
| FR-010 | teilweise | Kapitel-Zusammenfassungen + RAG-Index; Referenzumfang ungeprüft |
| FR-011 | unbekannt | Scanner unterstützt, Wirkung nur im Praxistest prüfbar |
| FR-012 | teilweise | `povCharacter`/`povType` je Kapitel; keine Sperre für die Autor-Figur belegt |
| FR-013 | teilweise | Tag-Erkennung (`LorebookTagPlugin`) + manuelle Kontextauswahl; kein `@`-Menü belegt |
| FR-015 | teilweise | Vorschlag/Freigabe-Fluss für Codex-Änderungen; Markieren-und-Eintragen nicht belegt |
| FR-016 | ja | Einträge auf Ebene `series`/`global` |
| FR-017 | teilweise | Einträge auf Ebene `story`; Verknüpfung zu Eintrag einer anderen Serie nicht belegt |
| FR-018 | ja | OpenRouter u. a. |
| FR-022 | unbekannt | Praxistest |
| FR-024 | nein | Nicht gefunden |

**Soll:** FR-014 nein (Automatik), FR-019 teilweise (Browserzugriff von jedem Gerät im Netz; mobile Oberfläche nicht geprüft), FR-020 teilweise (SQLite; Markdown-Export).

**Widerspruch zur Vision:** mittel bis hoch – sehr großer Funktionsumfang (Desks, TTS, Karten, Humanizer, MCP, Mehrbenutzer-Rollen). Das kollidiert mit „keine überladene Oberfläche" und „keine Mehrnutzerfähigkeit" (Vision 5, 8). Fachlich am nächsten an Kanon-Rückfluss (propose → approve).

**Lizenzfolge:** AGPL-3.0 – Übernahme zwingt das Skriptorium unter AGPL-3.0.

### The Story Nexus

**Fakten:**

- Zwei Linien: Original als Tauri-Desktop-App (vijayk1989, AGPL-3.0, letzter Commit 2026-09-26, 68 Commits/2 Autoren in zwölf Monaten, Speicherung in IndexedDB via Dexie) und Web-Neufassung (JonSilver, AGPL-3.0, letzter Commit 2026-01-23, 498 Commits/4 Autoren in zwölf Monaten, Express + SQLite + Drizzle, Docker).
- Technologie (Web): TypeScript, Express, SQLite, React, Vite, Tailwind, Lexical.
- Datenmodell (`server/db/schema.ts`, JonSilver): `series`; Lorebook-Ebenen `global` | `series` | `story` (`src/types/story.ts`); Kategorien wie Story Labyrinth; `povCharacter`/`povType` an Kapiteln und Szenen-Beats.
- Prompt-Variablen (`src/features/prompts/`): u. a. `summaries`, `previous_words`, `matched_entries_chapter`, `lorebook_scenebeat_matched_entries`, `all_characters`, `pov`, `selected_text`.
- Szenen-Beats per `Alt+S` im Editor; manuelle Kontextauswahl (`selectedItems`/`customContextEntries` in `SceneBeatComponent.tsx`).
- Modelle: OpenAI, Gemini, OpenRouter, lokale Modelle (README).
- Tauri-Fassung: „Copy lorebook as Markdown"; mobiles Layout mit Seitenleisten-Sheet (README).

**Muss-Anforderungen (Web-Fassung):** FR-001 ja (Ebene `series`), FR-002 teilweise, FR-003 teilweise, FR-004 teilweise (Kategorie `timeline`), FR-005 nein (nur Migration aus eigener Vorversion), FR-007 teilweise, FR-008 ja (Szenen-Beats), FR-009 ja, FR-010 teilweise (`summaries`), FR-011 unbekannt, FR-012 teilweise (POV je Kapitel/Beat), FR-013 teilweise (Tag-Automatik + manuelle Auswahl), FR-015 unbekannt, FR-016 ja, FR-017 teilweise, FR-018 ja, FR-022 unbekannt, FR-024 nein.

**Soll:** FR-014 nein, FR-019 teilweise (Web-App im Netz; Tauri-Fassung mit mobilem Layout), FR-020 teilweise (SQLite bzw. IndexedDB; Markdown-Kopie).

**Widerspruch zur Vision:** gering bis mittel – schreibfokussiert, deutlich schlanker als Story Labyrinth.

**Lizenzfolge:** AGPL-3.0.

### Writingway 2

**Fakten:**

- Lizenz: **Im Repository ist keine Lizenzdatei vorhanden**, `package.json` nennt keine Lizenz, die GitHub-Seite zeigt keine. Eine Suchmaschinen-Zusammenfassung nennt MIT; das ließ sich an der Quelle nicht bestätigen. Ohne Lizenzdatei gilt rechtlich Urheberrecht ohne Nutzungsrecht.
- Pflege: letzter Commit 2026-05-16; 170 Commits in zwölf Monaten.
- Technologie: JavaScript/HTML mit Alpine.js (`main.html`), Daten in IndexedDB, Speichern als Projektdatei; optionaler lokaler Server (`start.sh`).
- Kompendium mit Kategorien `characters`, `places`, `items`, `lore`, `notes` (`src/state/app-state.js`).
- `@`-Verweise: `src/modules/beat-mentions.js` – „Handles @compendium and #scene mention detection, search, selection, and resolution" in der Beat-Eingabe.
- Prompt-Aufbau (`src/modules/generation.js`): Optionen `povCharacter`, `pov`, `tense`, `compendiumEntries`, `sceneSummaries`.
- Export als ZIP mit Szenen als `.txt`-Dateien (`src/modules/project-manager.js`); Backup per GitHub Gist.
- Modelle: OpenRouter, Anthropic, OpenAI, Google, NanoGPT, LM Studio, OpenAI-kompatibel, lokales GGUF (README).

**Muss-Anforderungen:** FR-001 teilweise (Projekte getrennt, keine Welt über mehrere Geschichten belegt), FR-002 teilweise, FR-003 teilweise, FR-004 unbekannt, FR-005 nein (nur Import aus Writingway 1), FR-007 teilweise (Kapitel/Szenen), FR-008 ja (Beat → Prosa), FR-009 ja, FR-010 teilweise (`sceneSummaries`), FR-011 unbekannt, FR-012 teilweise (POV-Figur, Perspektive, Tempus), FR-013 **ja** (`@`-Verweis auf Kompendium in der Beat-Eingabe), FR-015 unbekannt, FR-016 unbekannt, FR-017 unbekannt, FR-018 ja, FR-022 unbekannt, FR-024 nein.

**Soll:** FR-014 unbekannt, FR-019 unbekannt, FR-020 teilweise (ZIP mit Textdateien).

**Widerspruch zur Vision:** gering – schreibfokussiert, `@`-Mechanik entspricht dem Hauptweg der Vision.

**Lizenzfolge:** ungeklärt; ohne Lizenzdatei keine Übernahme von Code zulässig.

### Obsidian mit KI-Plugins

**Fakten:**

- Obsidian: „free for all purposes, including personal, commercial, and non-profit use" ([Lizenz](https://obsidian.md/license)); nicht Open Source (Quellcode nicht veröffentlicht – auf der Lizenzseite nicht erwähnt). Daten liegen als Markdown-Dateien im Vault.
- **Copilot for Obsidian:** AGPL-3.0; letzter Commit 2026-09-25, Tag `4.0.11` (2026-09-23), 564 Commits/16 Autoren in zwölf Monaten; TypeScript. BYOK zu Anbietern, kompatiblen Gateways und lokalen Modellen (`docs/llm-providers.md`); OpenRouter erwähnt (`docs/copilot-plus-and-self-host.md`). Notizen per `[[Note Title]]` im Chat referenzierbar (`docs/chat-interface.md`). Mobil: „Quick Chat" als Hauptansicht, „Agent Chat" nur Desktop (`manifest.json`: `"isDesktopOnly": false`). Kostenpflichtige „Plus"-Funktionen neben dem freien Kern.
- **Text Generator:** MIT; letzter Commit 2026-08-06, Tag `0.8.10-beta` (2026-05-16); Vorlagen-Engine, konfigurierbarer Kontext (README).
- **Smart Connections:** eigene „Smart Plugins License Agreement" (MIT-ähnlich, aber mit Wettbewerbsverbot für allgemeine Produkte rund um Notiz-Apps); letzter Commit 2026-09-24; semantische Suche mit lokalen Embeddings; einige Funktionen „Pro".

**Muss-Anforderungen (Obsidian + Copilot):** FR-001 teilweise (Vault oder Ordner je Welt), FR-002 teilweise (Notizen/Ordner, keine Kanon-Kategorien), FR-003 teilweise, FR-004 unbekannt, FR-005 teilweise (Notion-Markdown-Export ist als Dateien ablegbar), FR-007 teilweise (Notizen/Ordner), FR-008 teilweise (Chat/Befehle), FR-009 unbekannt, FR-010 teilweise (Vault-Suche/Indexierung), FR-011 unbekannt, FR-012 unbekannt, FR-013 teilweise (`[[Notiz]]` im Chat, nicht im Manuskript), FR-015 unbekannt, FR-016 teilweise (Notizen wiederverwendbar), FR-017 teilweise (manuell), FR-018 ja, FR-022 unbekannt, FR-024 nein.

**Soll:** FR-014 unbekannt, FR-019 teilweise (Obsidian mobil, Copilot eingeschränkt), FR-020 ja (Markdown-Vault).

**Widerspruch zur Vision:** mittel – allgemeines Notizwerkzeug mit Chat-Seitenleiste; die Schreiblogik (Kanon, Figuren-Schreibweise) müsste vollständig ergänzt werden.

**Lizenzfolge:** Copilot-Code AGPL-3.0; Smart-Connections-Code mit Nutzungsbeschränkung; Text Generator MIT. Obsidian selbst ist nicht anpassbar, nur per Plugin erweiterbar.

### Open WebUI

**Fakten:** Eigene „Open WebUI License": BSD-3-Clause-artig, zusätzlich Verbot, das „Open WebUI"-Branding zu entfernen, außer bei höchstens 50 Endnutzern in 30 Tagen, schriftlicher Erlaubnis oder Enterprise-Lizenz; ältere Teile unter früheren Lizenzen (`LICENSE`, `LICENSE_HISTORY`); CLA für Beiträge. Letzter Commit 2026-09-21, Tag `v0.11.4`; 5.212 Commits/216 Autoren in zwölf Monaten. Technologie: Python-Backend, SvelteKit/Svelte 5-Frontend. OpenRouter und beliebige OpenAI-kompatible APIs; „Knowledge Bases", Agenten; Anbindung u. a. Notion über das Zusatzprojekt `oikb` (README).

**Muss-Anforderungen:** FR-001 teilweise (getrennte Knowledge Bases/Agenten), FR-002 nein, FR-003 nein, FR-004 nein, FR-005 teilweise (Notion-Anbindung über `oikb`, als Wissensquelle), FR-007 nein, FR-008 teilweise (Prompt), FR-009 nein (Chat), FR-010 teilweise (RAG), FR-011 unbekannt, FR-012 nein (Chat statt Manuskript), FR-013 unbekannt, FR-015 unbekannt, FR-016 teilweise, FR-017 unbekannt, FR-018 ja, FR-022 unbekannt, FR-024 nein.

**Soll:** FR-019 unbekannt, FR-020 unbekannt.

**Widerspruch zur Vision:** hoch – allgemeine Chat-Plattform für Teams.

**Lizenzfolge:** Branding-Klausel gilt bei Anpassung; Einzelnutzer unter 50 Nutzern wäre ausgenommen. Keine OSI-anerkannte Lizenz (Einordnung).

### LibreChat

**Fakten:** MIT (`LICENSE`). Letzter Commit 2026-09-25, Tag `v0.8.8-rc4` (2026-09-22); 2.587 Commits/186 Autoren in zwölf Monaten. Technologie: Node.js/Express 5, MongoDB (Mongoose), React 18. OpenRouter u. a. als Endpunkt; Agenten, Sub-Agenten, Marketplace, Rechte je Nutzer/Gruppe (README).

**Muss-Anforderungen:** FR-001 teilweise (getrennte Agenten), FR-002 nein, FR-003 nein, FR-004 nein, FR-005 unbekannt, FR-007 nein, FR-008 teilweise, FR-009 nein, FR-010 teilweise (Datei-Suche/RAG laut Doku-Verweis, nicht vertieft), FR-011 unbekannt, FR-012 nein, FR-013 unbekannt, FR-015 unbekannt, FR-016 teilweise, FR-017 unbekannt, FR-018 ja, FR-022 unbekannt, FR-024 nein.

**Widerspruch zur Vision:** hoch – Mehrnutzer-Chatplattform.

**Lizenzfolge:** MIT – keine Bindung der eigenen Lizenz, nur Hinweis-Pflicht.

### TypingMind (Ist-Werkzeug, Vergleich)

**Fakten:** Proprietär; Lizenzdatei: „NOTE: This is NOT an open-source software" ([Lizenz](https://github.com/TypingMind/typingmind/blob/main/LICENSE.md)). Kostenpflichtige Self-Host-Variante mit kompiliertem Code, ohne Recht zur Änderung ([Self-Host](https://custom.typingmind.com/self-host)). OpenRouter unterstützt ([Doku](https://docs.typingmind.com/manage-and-connect-ai-models/openrouter)). Agenten bestehen aus Systemanweisung, Modell, Wissen (Dateien/Knowledge Base), Plugins, Few-Shot-Beispielen ([Agenten](https://docs.typingmind.com/ai-agents/ai-agents-overview.md)). Knowledge Base mit RAG für lizenzierte Nutzer ([RAG](https://docs.typingmind.com/rag-knowledge-base.md)).

**Muss-Anforderungen:** FR-001 teilweise (Agent je Welt – so heute genutzt), FR-002 nein, FR-003 nein, FR-004 nein, FR-005 entfällt (Quelle), FR-007 nein, FR-008 teilweise, FR-009 nein (Chat), FR-010 teilweise (Knowledge Base/RAG; der Chatverlauf selbst wird laut Vision vollständig mitgeschickt), FR-011 unbekannt, FR-012 teilweise (heutige Arbeitsweise im Chat, kein Manuskript), FR-013 unbekannt, FR-015 nein (Vision Abschnitt 2: Fakten fließen nicht zurück), FR-016 nein (Vision Abschnitt 2), FR-017 unbekannt, FR-018 ja, FR-022 unbekannt, FR-024 nein. Zählung mit FR-005 als `unbekannt`.

**Widerspruch zur Vision:** es ist das Werkzeug, dessen Grenzen die Vision beschreibt.

### OpenWrite

**Fakten:** AGPL-3.0 (`LICENSE.md`). Letzter Commit 2026-08-18; 35 Commits/2 Autoren in zwölf Monaten; keine Tags. Technologie: TypeScript, React 19, TanStack Router, Hono auf Cloudflare Workers, D1 (SQLite), Drizzle, Better Auth, Bun. Funktionen laut README: Story-Map-Generierung, Tiptap-Editor, Kapitel, KI-Assistent mit eigenem Schlüssel (OpenRouter, OpenAI, Anthropic, Groq, Gemini, Cohere, Ollama), Codex (Figuren, Orte, Lore, Plotpunkte je Projekt), Markdown-Export, Konten mit E-Mail/Passwort. Streaming und Figuren-Verknüpfung „planned".

**Muss-Anforderungen:** FR-001 teilweise (Codex je Projekt), FR-002 teilweise, FR-003 nein, FR-004 nein, FR-005 nein, FR-007 teilweise (Projektarten inkl. Serie/Kurzgeschichten-Sammlung), FR-008 teilweise, FR-009 ja (Assistent fügt in Manuskript ein), FR-010 unbekannt, FR-011 unbekannt, FR-012 nein, FR-013 unbekannt, FR-015 unbekannt, FR-016 teilweise, FR-017 nein, FR-018 ja, FR-022 unbekannt, FR-024 nein.

**Soll:** FR-020 teilweise (Markdown-Export).

**Widerspruch zur Vision:** gering beim Fokus; Konten-/Workspace-Modell ist Mehrnutzer-Ballast. Reifegrad gering.

**Lizenzfolge:** AGPL-3.0.

### Plot Bunni

**Fakten:** MIT. Letzter Commit 2026-04-19; 6 Commits/1 Autor in zwölf Monaten. Technologie: JavaScript/React (`.jsx`), IndexedDB. Mehrere Romane, Akte/Kapitel/Szenen, „Concepts" (Konzept-Cache) mit Verknüpfung zu Szenen, Export Markdown/Text, Projekt als JSON, KI-Endpunkt-Profile, AI Horde; responsives Layout mit eigenen Mobil-Tabs (README).

**Muss-Anforderungen:** FR-001 teilweise (Roman-getrennt), FR-002 teilweise (Concepts ohne feste Kategorien), FR-003 nein, FR-004 nein, FR-005 nein, FR-007 teilweise, FR-008 teilweise, FR-009 teilweise, FR-010 unbekannt, FR-011 unbekannt, FR-012 nein, FR-013 teilweise (Konzept-Verknüpfung je Szene), FR-015 unbekannt, FR-016 nein, FR-017 nein, FR-018 ja (konfigurierbare Endpunkte; OpenRouter nicht namentlich geprüft), FR-022 unbekannt, FR-024 nein.

**Soll:** FR-019 ja (Mobil-Layout laut README), FR-020 teilweise.

**Widerspruch zur Vision:** gering. Pflege schwach.

**Lizenzfolge:** MIT.

### Novel Engine

**Fakten:** MIT. Letzter Commit 2026-09-16; 499 Commits/2 Autoren in zwölf Monaten; 9 Tags; Version 0.8.0. „Self-hosted single-author novel writing IDE", SQLite als Datenquelle, Markdown als Dokument-Syntax, Node.js 24, pnpm (README). Anbieter: DashScope und OpenAI-kompatible Endpunkte (`openwiki/guides/provider-setup.md`); Lorebook-Assistent mit Aliasen als Auslöser (`openwiki/guides/writing-guide.md`, Zeile 126); UI Chinesisch/Englisch.

**Muss-Abdeckung:** nicht einzeln bewertet; Stichproben: FR-018 teilweise (OpenAI-kompatibel, OpenRouter nicht namentlich belegt), FR-013 teilweise (Alias-Auslöser), FR-020 teilweise (Markdown-Syntax, Speicherung SQLite).

**Widerspruch zur Vision:** gering (Einzelautor, Schreib-IDE). Kaum Nutzerbasis erkennbar (2 Autoren).

**Lizenzfolge:** MIT.

### LoreWeave

**Fakten:** AGPL-3.0. Letzter Commit 2026-09-13; 9.648 Commits/6 Autoren in zwölf Monaten (seit 2026-03-21). Technologie: Go, Python, NestJS, React; Infrastruktur mit Postgres, MinIO, Redis; laut README 47 Dienste. Automatische Extraktion von Figuren/Orten/Ereignissen in einen Wissensgraphen, Übersetzungs-Pipeline, öffentlicher Katalog, geplante „LLM MMO RPG"-Erweiterung („Living Worlds").

**Muss-Abdeckung:** nicht einzeln bewertet. Stichprobe: FR-015 widerspricht dem Ansatz (automatische statt vom Autor gesteuerte Übernahme, vgl. `docs/requirements.md` Abschnitt 3 „bewusst ausgeschlossen").

**Widerspruch zur Vision:** sehr hoch – Multiversum/MMO-Rollenspiel, Mehrnutzer-Plattform, 47 Dienste.

**Lizenzfolge:** AGPL-3.0.

### Manuskript

**Fakten:** GPL-3.0 (`COPYING`). Letzter Commit 2026-09-02 (Branch `develop`), Tag `0.17.0` vom 2025-06-30; 28 Commits/12 Autoren in zwölf Monaten. Python 3 / PyQt5; offenes Klartext-Dateiformat (README); Modelle für Figuren, POV, Welt, Plot, Outline (`manuskript/models/`); Export u. a. über Pandoc. KI-Funktionen: keine gefunden.

**Muss-Anforderungen:** FR-001 teilweise (Projekt je Welt), FR-002 teilweise (Figuren, Welt-Baum), FR-003 teilweise (Freitext), FR-007 teilweise (Outline), FR-004 unbekannt, FR-016 unbekannt, FR-022 unbekannt; FR-005, 008, 009, 010, 011 (keine KI), 012, 013, 015, 017, 018, 024: nein.

**Soll:** FR-019 nein (Desktop), FR-020 ja (Klartext).

**Widerspruch zur Vision:** gering im Geist, aber ohne KI.

**Lizenzfolge:** GPL-3.0 – abgeleitete Werke unter GPL-3.0.

### bibisco (Community Edition)

**Fakten:** GPL-3.0; Repository ist nur die Community Edition, daneben kostenpflichtige „Supporters Edition" (README). Letzter Commit 2024-09-27, neuestes Tag `v2.4.0` vom 2022-06-14; 0 Commits in zwölf Monaten. Electron + AngularJS (`bibisco/app/package.json`). Laut Drittquelle (Suchergebnis) aktuelle Supporters Edition 5.0.1 – nicht an offizieller Quelle bestätigt (Seite lieferte keinen Inhalt). KI-Funktionen: keine gefunden.

**Muss-Anforderungen:** FR-001, 002, 003 teilweise (Figuren/Orte/Objekte als Projektteile – nur aus Produktbeschreibung, Code nicht vertieft); FR-004, 016, 022 unbekannt; übrige 12 nein (keine KI, kein Import, keine Modellwahl).

**Widerspruch zur Vision:** gering im Geist, aber ohne KI und öffentliches Repo ungepflegt.

**Lizenzfolge:** GPL-3.0.

### Kanka

**Fakten:** `LICENSE` enthält nur die „Commons Clause" (Verbot, die Software zu „verkaufen", auch als Hosting-Dienst); `composer.json`: `"license": "proprietary"`. Letzter Commit 2026-09-23, Tag `3.15` vom 2026-09-07; 2.646 Commits/6 Autoren in zwölf Monaten. PHP 8.4, Laravel 13. Entitätstypen u. a. Character, Location, Item, Timeline, Calendar, Race, Family, Organisation, Event, Journal, Note, Quest, Creature, Ability, Map (`app/Models/`). OpenAI-Anbindung „Bragi" (`app/Services/Bragi/OpenAiService.php`). Selbstbeschreibung: „collaborative worldbuilding and TTRPG campaign management"; Abo-Stufen, API, Webhooks ([Preise](https://kanka.io/pricing)).

**Muss-Anforderungen:** FR-001 teilweise (Kampagnen getrennt), FR-002 teilweise (umfangreiche Entitätstypen, u. a. Zeitlinie; „Regel/Kultur" nicht als Typ), FR-003 teilweise, FR-004 teilweise (Timeline, Calendar), FR-016 teilweise; FR-005, 011, 022 unbekannt; FR-007, 008, 009, 010, 012, 013, 015, 017, 018, 024 nein (kein Manuskript-Schreiben; KI nur OpenAI).

**Widerspruch zur Vision:** hoch – Rollenspiel-Kampagnenverwaltung, Mehrnutzer.

**Lizenzfolge:** Commons Clause/proprietär – keine Open-Source-Lizenz; Anpassung für ein eigenes Open-Source-Projekt ungeeignet.

### Lore Codex

**Fakten:** GPL-3.0 (`LICENSE.md`). Letzter Commit 2026-09-17; 666 Commits/3 Autoren seit 2026-06-13; 87 Tags. Windows-Desktop (WebView2). Jede Welt eigene lokale Datenbank, gespiegelt als `.lore`-Datei; Wiki-Links `[[Seite]]`, Autolinker, Seitentypen, Zeitlinie (README). **Keine KI-Funktion** in der README gefunden.

**Einordnung:** Kein Schreib-KI-Werkzeug; nur als Vorbild für Welt-Trennung und Verweis-Syntax relevant.

**Lizenzfolge:** GPL-3.0.

<!-- ANCHOR:import-wege -->
## Import-Wege

### TypingMind

- **Gesamt-Export:** Einstellungen → „App data & storage" → Export/Import; wählbar „chats, prompts, plugins, folders, AI Agents, model settings, and more"; Ausgabe als **eine JSON-Datei** ([Doku](https://docs.typingmind.com/cloud-sync-and-backup/export-import-data)).
- **Einzelner Agent:** Export als JSON über das Teilen-Symbol, Import über „Import from JSON" ([Changelog](https://docs.typingmind.com/changelog/typingmind/import-export-ai-agents-via-json)). **Ob Wissensdateien bzw. Knowledge-Base-Inhalte des Agenten im JSON enthalten sind, ist in der Doku nicht angegeben.**
- **Einzelne Chats:** Export als JSON (auch mehrere auf einmal, [Changelog](https://docs.typingmind.com/changelog/typingmind/export-a-single-chat-or-multiple-chats-as-json)); Teilen/Export laut Doku als Link, PDF, Markdown, JSON, HTML ([Share/Export](https://docs.typingmind.com/chat-management/shareexport-chats.md)).
- Für FR-005 relevant ist vor allem die **Systemanweisung der Agenten** (dort liegt das Welt-Material). Das genaue JSON-Schema ist nicht öffentlich dokumentiert gefunden; es muss an einem echten Export geprüft werden.

### Notion

- Export-Formate für Seiten und Datenbanken: **PDF**, **HTML** (optional mit Unterseiten und Kommentaren), **Markdown & CSV** – „Any non-database Notion page can be exported as a Markdown file. Full page databases will be exports as a CSV file, with Markdown files for each subpage." ([Hilfe](https://www.notion.com/help/export-your-content)).
- Ganzer Workspace als HTML, Markdown oder CSV, nur Desktop/Web; Verarbeitung bis zu 30 Stunden, Download-Link 7 Tage gültig.
- Planbeschränkung: Die Option „Include subpages" ist laut Hilfe an Business/Enterprise gebunden – im Text ausdrücklich beim **PDF**-Export genannt; für Markdown/HTML wurde keine Einschränkung gefunden.
- Zusätzlich existiert die Notion-API (hier nicht vertieft).

<!-- ANCHOR:modell-verfuegbarkeit -->
## Modell-Verfügbarkeit

**Fakten (OpenRouter, `https://openrouter.ai/api/v1/models`, abgerufen 2026-09-26):**

- 458 Modelle gelistet.
- Feld `top_provider.is_moderated`: laut Doku „Whether content moderation is applied" – OpenRouter führt dann vor der Weitergabe eine eigene Moderationsprüfung durch; das Modell selbst kann zusätzlich eigene Filter haben ([Doku Modelle](https://openrouter.ai/docs/guides/overview/models)).
- `is_moderated = true`: 134 Modelle, ausschließlich der Anbieter-Präfixe `amazon`, `anthropic`, `cohere`, `meta`, `openai`, `writer`, `~anthropic`, `~openai`.
- `is_moderated = false`: 324 Modelle, u. a. `qwen` (54), `google` (41), `mistralai` (25), `z-ai` (18), `deepseek` (16), `openai` (14, offene Gewichte), `x-ai` (8), `moonshotai` (8), `minimax` (8), `meta-llama` (8), `nousresearch` (3), `thedrummer` (3), `sao10k` (3).
- Darunter gelistete Feinabstimmungen, die von ihren Herstellern für Rollenspiel/Fiktion beworben werden (Einordnung der Hersteller, nicht geprüft): `thedrummer/cydonia-24b-v4.1`, `thedrummer/skyfall-36b-v2`, `thedrummer/unslopnemo-12b`, `sao10k/l3.3-euryale-70b`, `sao10k/l3.1-euryale-70b`, `anthracite-org/magnum-v4-72b`, `nousresearch/hermes-4-405b`, `nousresearch/hermes-3-llama-3.1-70b`, `nousresearch/hermes-3-llama-3.1-405b`, `cognitivecomputations/dolphin-mistral-24b-venice-edition`, `gryphe/mythomax-l2-13b`.

**Nachtrag 2026-10-11 – Suche nach „uncensored“-Bezeichnungen** (gleiche Quelle, 458 Modelle; Suche über `id`, `name`, `description`, `hugging_face_id`):

- Ausdrücklich „uncensored“: `cognitivecomputations/dolphin-mistral-24b-venice-edition` (Anzeigename „Venice: Uncensored“, 0,20 $ / 0,90 $ je 1 Mio. Token, 128k) und `thedrummer/cydonia-24b-v4.1` („Uncensored and creative writing model“, 0,30 $ / 0,50 $, 131k). Keine Bezeichnungen wie „abliterated“, „unfiltered“, „NSFW“ im Katalog.
- Als Rollenspiel/Fiktion beworben, ohne „uncensored“: `aion-labs/aion-2.0`, `aion-3.0`, `aion-3.0-mini`, `aion-3.5`, `aion-3.5-mini`, `aion-rp-llama-3.1-8b`; `minimax/minimax-m2-her`; `thedrummer/skyfall-36b-v2`, `thedrummer/unslopnemo-12b`; `sao10k/l3.3-euryale-70b`, `l3.1-euryale-70b`, `l3-lunaris-8b`; `anthracite-org/magnum-v4-72b`; `nousresearch/hermes-4-405b`, `hermes-3-llama-3.1-70b`, `hermes-3-llama-3.1-405b`; `gryphe/mythomax-l2-13b`; `undi95/remm-slerp-l2-13b`; `mancer/weaver`.
- Alle genannten `is_moderated = false`. Zählung jetzt 141 true / 317 false (2026-09-26: 134 / 324).
- Alles Selbstbeschreibungen der Hersteller; Verhalten bei fiktionalen Inhalten und Nutzungsbedingungen der ausführenden Anbieter nicht geprüft (unverändert Punkt 5 unten).

**Grenzen der Aussage:** `is_moderated = false` belegt nur, dass OpenRouter selbst nicht moderiert – nicht, dass das Modell oder der ausführende Anbieter fiktionale Inhalte ungefiltert erzeugt. Nutzungsbedingungen der Anbieter wurden nicht geprüft. Die Liste ist eine Momentaufnahme (Vision 9: Filterpolitik und Preise können sich ändern).

<!-- ANCHOR:einordnung -->
## Einordnung

*Urteil auf Basis der Fakten oben; keine Entscheidung.*

### (a) Als Basis zur Anpassung denkbar

- **The Story Nexus (Web-Fassung, AGPL-3.0):** Datenmodell trägt bereits Serien-Ebene für Lorebook-Einträge (≈ Welt), Kategorien inkl. Zeitlinie, POV je Kapitel, Zusammenfassungs-Variablen, manuelle Kontextauswahl, OpenRouter; vergleichsweise schlank und schreibfokussiert. Einschränkungen: letzter Commit 2026-01-23, AGPL-Bindung, kein `@`-Menü, keine Gast-Figuren-Logik (FR-017/024).
- **Story Labyrinth (AGPL-3.0):** gleicher Kern wie Story Nexus, aktiv gepflegt, zusätzlich Vorschlag/Freigabe-Fluss für Kanon-Änderungen, Dokument-Import, RAG und Continuity-Scanner – fachlich nah an FR-005, FR-010, FR-011, FR-015. Einschränkung: großer Funktionsumfang und Mehrbenutzer-Rollen widersprechen „keine überladene Oberfläche"/„keine Mehrnutzerfähigkeit"; Rückbau wäre nötig.
- **SillyTavern (AGPL-3.0):** größte Nutzerbasis und reifstes Kanon-Einblenden (World Info mit chatgebundenen Lorebooks ≈ Gast-Figur je Geschichte, Zusammenfassung, Vektoren, OpenRouter). Nur als Basis denkbar, wenn der Chat-Kern in Richtung Manuskript umgebaut würde – das ist genau der Teil, den die Vision ablehnt. Als Basis daher fraglich, aufgeführt wegen der Vision-Nennung.

### (b) Als Vorbild für einzelne Konzepte nützlich

- **Writingway 2:** `@`-Verweis auf Kompendium-Einträge in der Beat-Eingabe (FR-013), Beat-Prompt mit POV/Tempus/Szenen-Zusammenfassungen. Wegen fehlender Lizenzdatei nur als Konzept, nicht als Code.
- **NovelCrafter:** Tracking-Optionen je Eintrag (automatisch/immer/nie), Series Codex, Markieren → Codex-Eintrag (FR-015), POV-Figur mit Szenen-Zusammenfassungen, Codex-Export je Eintrag als Datei.
- **Sudowrite:** Series Folder, „nur explizit erwähnte Elemente" als Kontextregel.
- **NovelAI:** Kategorien mit Standard-Platzierung, Token-Budget je Eintrag, Lorebook-Austauschformat.
- **SillyTavern:** chatgebundene Lorebooks als Muster für FR-017; Outlet-Makro als manueller Einblendungsweg; Summarize-Erweiterung.
- **Obsidian (+ Copilot):** Markdown-Vault als offenes Format (FR-020), `[[Notiz]]`-Verweis.
- **Lore Codex, Kanka:** Welt als isolierte Einheit mit eigener Datei; Entitätstypen inkl. Zeitlinie/Kalender (FR-004, FR-023).
- **Manuskript:** offenes Klartext-Projektformat.

### (c) Ungeeignet

- **NovelAI, Sudowrite:** Modellbindung an den Anbieter (kein OpenRouter/BYOK belegt) verletzt die harte Randbedingung aus Vision 6.
- **TypingMind:** Ist-Werkzeug, proprietär, Chat-Grundeinheit; Grenzen in der Vision beschrieben.
- **Open WebUI, LibreChat:** allgemeine Mehrnutzer-Chatplattformen ohne Kanon-/Manuskript-Modell; Open WebUI zusätzlich mit Branding-Klausel.
- **KoboldAI Lite / KoboldCpp:** Einzeltext je Speicherstand, Rollenspiel-/Adventure-Ausrichtung; KoboldCpp zielt auf lokale Modelle (Vision 6).
- **LoreWeave:** Multiversum-/MMO-Ausrichtung, 47 Dienste, automatische Kanon-Übernahme – widerspricht Vision 5 direkt.
- **Kanka:** Commons Clause/proprietär, Rollenspiel-Kampagnen, kein Manuskript.
- **bibisco (Community):** öffentlich seit 2024 ungepflegt, keine KI.
- **Manuskript, Lore Codex:** keine KI; nur Konzept-Vorbild (siehe b).
- **OpenWrite, Plot Bunni, Novel Engine:** geringe Reife bzw. Pflege (OpenWrite 35 Commits, Plot Bunni 6 Commits in zwölf Monaten, Novel Engine 2 Autoren) und kein Welt-/Serien-Kanon belegt; als Basis nicht tragfähig, einzelne Ideen bei Bedarf.

<!-- ANCHOR:offene-punkte -->
## Offene Punkte

1. **Praxistest fehlt:** Kein Werkzeug wurde installiert. FR-011 (Kanon-Treue), FR-010 (Referenzumfang), FR-022 (30 Minuten) und die Kosten pro Anfrage sind nur im Test prüfbar – für Kandidaten der Gruppe (a) wäre das ein ERKUNDUNG-Schritt.
2. **Writingway 2 – Lizenz:** Keine Lizenzdatei; Klärung beim Autor nötig, bevor Code in Betracht kommt.
3. **TypingMind-Export:** Enthält das Agenten-JSON die Wissensdateien bzw. Knowledge-Base-Inhalte? JSON-Schema an einem echten Export des Eigentümers prüfen.
4. **Notion-Export:** Verhalten von Unterseiten beim Markdown-Export im Plan des Eigentümers prüfen.
5. **OpenRouter-Filter:** `is_moderated = false` sagt nichts über Filter der Modelle/Anbieter; Stichprobe mit fiktionalen Inhalten und Prüfung der Anbieter-Nutzungsbedingungen offen.
6. **Nicht geprüfte Einzelheiten:** NovelCrafter-Zeitlinie und eigene Codex-Typen; Sudowrite-Export und Import; NovelAI-Kapitelstruktur und mobile Nutzung; `@`-/`#`-Verweise in Open WebUI; Mobil-Tauglichkeit von Story Nexus/Story Labyrinth/Writingway 2 auf einem Smartphone.
7. **Aktivitätszahlen:** Ohne GitHub-API keine Sterne, Issues, Release-Objekte; Commit-Zählungen hängen vom Standard-Branch ab (SillyTavern: `release`, nicht `staging`).
8. **Gast-Figur-Logik (FR-017, FR-024):** Bei keinem Werkzeug belegt; wäre in jedem Fall Eigenentwicklung.
9. **Lizenzfrage:** Alle drei Kandidaten der Gruppe (a) stehen unter AGPL-3.0; eine Anpassung legte die Projektlizenz auf AGPL-3.0 fest (Vision 9). MIT-lizenzierte Kandidaten mit Kanon-Modell wurden nicht in tragfähiger Reife gefunden.
