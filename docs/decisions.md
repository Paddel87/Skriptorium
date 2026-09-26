# Decisions

<!-- Begründete Entscheidungen und daraus abgeleitete Regeln.
     Vier Teile, in dieser Reihenfolge:
       Teil A: ADR-Übersicht (kompakte Tabelle, Reaktiv-Quote) – Pflichtlektüre bei Sessionstart
       Teil B: Architecture Decision Records (ADRs) – chronologisch, mit Tags – Detailteil
       Teil C: Entscheidungsregeln – wiederkehrende Muster, die aus ADRs hervorgehen
       Teil D: Geschäftsentscheidungen (BDR) – optional ab Klasse M, aktiv ab G, Pflicht bei V
     Einträge werden nicht gelöscht oder verändert. Überholte ADRs werden durch
     neue ADRs ersetzt, die den alten Eintrag referenzieren.

     HINWEIS: Teil A steht bewusst zuerst. Bei Sessionstart liest Claude Teil A
     und Teil C (Entscheidungsregeln – dauerhaft geltende Betriebsregeln).
     Teil B (einzelne ADRs) wird nur bei konkretem Bedarf nachgelesen. -->

<!-- ANCHOR:teil-a-adr-uebersicht -->
## Teil A: ADR-Übersicht

Stand 2026-09-26 (ADR-001 bis ADR-009 aus Modus 2 Schritt 5, ADR-010 aus Schritt 1.1, ADR-011 aus Schritt 1.5, ADR-012 aus Schritt 1.2, ADR-013 und ADR-014 aus Schritt 1.4, ADR-015 aus Schritt 2.1, ADR-016 aus Schritt 2.2, ADR-017 und ADR-018 aus Schritt 2.6, ADR-019 aus Schritt 2.7). Sortiert nach Nummer; Mindest-Lektüre bei Sessionstart.

| ADR | Datum | Status | Klassifikation | Themen | Kategorie | Kurztitel |
|---|---|---|---|---|---|---|
| 001 | 2026-09-26 | Aktiv | STRATEGISCH | METHODIK | Methodik | Klasse M und Zuschnitt des Vorlagen-Sets |
| 002 | 2026-09-26 | Aktiv | STRATEGISCH | STACK | Externe Abh. | Stack: Web-App mit Python-Server und TypeScript-Oberfläche |
| 003 | 2026-09-26 | Aktiv | STRATEGISCH | MODUL, DATENMODELL, PERFORMANCE | Architektur, Datenmodell | Modularer Monolith, Dateien plus Index, Kontext-Verfahren |
| 004 | 2026-09-26 | Aktiv | STRATEGISCH | STACK | Architektur, Externe Abh. | Schlanker Eigenbau statt Anpassung eines Werkzeugs |
| 005 | 2026-09-26 | Aktiv | STRATEGISCH | – | Lizenz | Projektlizenz AGPL-3.0 |
| 006 | 2026-09-26 | Aktiv | STRATEGISCH | SECURITY, DEPLOYMENT | Sicherheit, Deploy | Öffentlicher Betrieb mit Passwort, ASVS 5.0.0 L1 / Auth L2 |
| 007 | 2026-09-26 | Aktiv | STRATEGISCH | SECURITY | Sicherheit und Datenschutz | Schutzbedarf normal |
| 008 | 2026-09-26 | Aktiv | STRATEGISCH | SECURITY, DEPLOYMENT | Sicherheit und Datenschutz | Verzicht auf Vertretung (Gate-Punkt 7) |
| 009 | 2026-09-26 | Aktiv | STRATEGISCH | METHODIK | Methodik (Descope) | FR-006 verworfen: keine Übernahme bestehender Geschichten |
| 010 | 2026-09-26 | Aktiv (Zweitmodell ersetzt durch ADR-011) | ERKENNTNIS | PERFORMANCE | – (Ergebnis Schritt 1.1) | Startmodell grok-4.7, Ausweichmodell qwen3.8-max, Token-Budget 30.000 |
| 011 | 2026-09-26 | Aktiv | ERKENNTNIS | PERFORMANCE | – (Ergebnis Schritt 1.5) | grok-4.6 Zweitmodell, qwen3.8-max nur Notfall-Reserve |
| 012 | 2026-09-26 | Aktiv | ERKENNTNIS | DATENMODELL | Datenmodell | Import von Welt-Material zunächst nur als Markdown |
| 013 | 2026-09-26 | Aktiv | ERKENNTNIS | MODUL, SCHNITTSTELLE, DATENMODELL, PERFORMANCE | Architektur | Reifegrad-Beförderung vor Phase 2, neues Reaktionszeit-Ziel |
| 014 | 2026-09-26 | Aktiv | STRATEGISCH | METHODIK | Pflichtfrage Phasenende | Phasenende 1 – weiterbauen |
| 015 | 2026-09-26 | Aktiv | OPERATIV | STACK, METHODIK | Externe Abh., Build-Pipeline, Lizenz | Entwicklungswerkzeuge, Linien ohne Patch-Versionen, Werkzeug-Lizenzen, Starlette-Abkündigung |
| 016 | 2026-09-26 | Aktiv | OPERATIV | STACK, DATENMODELL | Externe Abh. | YAML-Parser für den Dateikopf – PyYAML |
| 017 | 2026-09-26 | Aktiv | OPERATIV | SECURITY, SCHNITTSTELLE, DATENMODELL | Sicherheit, Datenmodell, API, Externe Abh., Lizenz | Anmeldung und Sitzung – selbst gewähltes Passwort ohne zweiten Faktor |
| 018 | 2026-09-26 | Aktiv | REAKTIV | MODUL, SECURITY | Architektur | Beziehungen api → storage (Zugangsdaten) und api → Pwned Passwords |
| 019 | 2026-09-26 | Aktiv | OPERATIV | STACK, METHODIK | Externe Abh., Build-Pipeline | Test-Werkzeuge der Oberfläche – Testing Library, jsdom, Playwright |

### Reaktiv-Quote

Anzahl `[REAKTIV]`-ADRs / Gesamtzahl der letzten 10 ADRs (Bezugsgröße nach `docs/project-context.md` Abschnitt 6).

- **Aktueller Wert:** 1 / 10 (10 %) über ADR-010 bis ADR-019 – ADR-010 bis ADR-014 aus Phase 1 (Erkundung), ADR-015 bis ADR-017 und ADR-019 aus Phase 2 (operativ, geplant in 2.1, 2.2, 2.6, 2.7); reaktiv: ADR-018 (neue Beziehungen von `api`, in 2.6 ungeplant).
- **Schwellenwert (in `project-context.md` festgelegt):** 30 % `[REAKTIV]`-Anteil über die letzten 10 ADRs (Klasse M).
- **Bei Überschreitung:** STOPP, Reflexion in `fahrplan.md` ergänzen, prüfen ob Architektur-Refactoring nötig ist.

---

<!-- ANCHOR:teil-b-architecture-decision-records -->
## Teil B: Architecture Decision Records

<!-- Detailteil. Einzelne ADRs werden nur bei konkretem Bedarf gelesen –
     z. B. wenn ein Schritt einen referenzierten ADR berührt. -->

### Format

Jeder ADR folgt diesem Schema. Keine Abweichung.

```text
### ADR-NNN: [Kurztitel]

- **Datum:** YYYY-MM-DD
- **Status:** Aktiv | Überholt durch ADR-M | Verworfen
- **Tags:** [aus Tag-Liste unten]
- **Phasentyp-Kontext:** [ERKUNDUNG | UMSETZUNG | STABILISIERUNG | INITIALISIERUNG]
- **Reifegrad-Wirkung:** [welche Architektur-Bestandteile gehen durch diesen ADR auf welchen Reifegrad – falls zutreffend]
- **Kategorie:** [aus CLAUDE.md Abschnitt 4 oder "Methodik"]
- **Kontext:**
  [Problem, Rahmenbedingungen, was stand an, 2–5 Sätze]
- **Optionen:**
  - **A:** [Beschreibung] – Konsequenzen: [...]
  - **B:** [Beschreibung] – Konsequenzen: [...]
  - **C:** [falls relevant]
- **Entscheidung:** [Welche Option, warum]
- **Vision-Frage, die entschied:** [bei Architektur-Entscheidungen Pflicht, sonst „n/a": die fachliche/Vision-Frage aus dem `ENTSCHEIDUNG ERFORDERLICH`-Block (CLAUDE.md Abschnitt 4), die der Mensch beantwortet hat, plus seine Antwort. Macht nachvollziehbar, *worauf* die Wahl beruhte, nicht nur *dass* sie getroffen wurde.]
- **Konfidenz zum Zeitpunkt:** [bei Architektur-Entscheidungen Pflicht, sonst „n/a": hoch/mittel/niedrig + Umkehrbarkeit billig/teuer, aus der Selbstprüfung in `templates/architektur-heuristiken.md` Teil 3. Bei niedriger Konfidenz auf belastbarer Architektur: Verweis auf den ERKUNDUNG-Schritt, der die Annahme später validiert.]
- **Konsequenzen:**
  - [Welche Regeln folgen daraus]
  - [Welche Einschränkungen entstehen]
  - [Welche weiteren Entscheidungen werden dadurch nötig]
- **Abgeleitete Regel:** [Falls aus diesem ADR eine Regel für wiederkehrende Fälle entsteht, hier benennen und in Teil C aufnehmen]
```

### Tags

Jeder ADR trägt mindestens **einen Klassifikations-Tag** und beliebig viele Themen-Tags.

#### Klassifikations-Tags (genau einer pflichtig)

- `[STRATEGISCH]` – in der Konzeptphase oder Initialisierung getroffene Grundsatzentscheidung. Stack-Wahl, Architektur-Pattern, Modul-Schnitt.
- `[OPERATIV]` – während der Umsetzung getroffene Entscheidung im Rahmen geplanter Architektur. Bibliothekswahl innerhalb des Stacks, konkrete Schnittstellen-Spezifikation, Datenmodell-Detail.
- `[REAKTIV]` – Entscheidung, die nötig wurde, weil bei der Umsetzung etwas Unerwartetes auftrat. Workaround, Pivot, nachträgliche Architekturänderung. **Reaktive ADRs sind ein Indikator** – ihre Häufung in einem Modul deutet darauf hin, dass die Architektur dort nicht trägt. **Pflicht:** Jede Architekturentscheidung (Kategorien 1, 2, 4, 5 aus CLAUDE.md Abschnitt 4), die während einer STABILISIERUNG-Phase fällt, wird `[REAKTIV]` klassifiziert (CLAUDE.md Abschnitt 6, „Reaktiv-ADR-Disziplin").
- `[ERKENNTNIS]` – Entscheidung als Resultat einer Erkundungsphase oder eines Spikes. Validiert oder widerlegt eine vorherige Annahme.

#### Themen-Tags (optional, mehrere möglich)

- `[STACK]`, `[MODUL]`, `[SCHNITTSTELLE]`, `[DATENMODELL]`, `[SECURITY]`, `[PERFORMANCE]`, `[DEPLOYMENT]`, `[OBSERVABILITY]`, `[METHODIK]`

### Nummerierung

Durchgehend, keine Lücken. Auch verworfene oder überholte Einträge behalten ihre Nummer.

### Einträge

Alle Einträge ADR-001 bis ADR-009 entstanden in Modus 2 (Projektinitialisierung) am 2026-09-26. Entscheider ist in allen Fällen der Eigentümer; die KI hat Optionen und Empfehlungen vorgelegt. Wo der Eigentümer anders entschied als empfohlen, steht das neutral im Feld „Entscheidung". Quelle der Angaben: Dialog der Modus-2-Session, festgehalten in der Übergabe-Datei `docs/modus-2-stand.md` (im Initialisierungs-Commit entfernt, in der Git-Historie erhalten), sowie die zum selben Datum befüllten Pflicht-Dokumente.

#### ADR-001: Projektgrößen-Klasse M und Zuschnitt des Vorlagen-Sets

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[METHODIK]`
- **Phasentyp-Kontext:** INITIALISIERUNG
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Methodik
- **Kontext:** Modus 2 verlangt eine zweistufige Klassifikation (`templates/projektstart.md` Abschnitt 2). Stufe 1 (Vision) ergab die Hypothese M: ein Nutzer, eine Betriebseinheit, wenige externe Dienste (OpenRouter), ein fachlich dichter Kern (Kanon, Manuskript, Kontext). Risiko Richtung G war ein möglicher zweiter Speicher für die Kontext-Zusammenstellung langer Geschichten. Stufe 2 (Architektur, Schritt 4) zählte 7 Module (4 fachliche plus `ui`, 2 technische Schichten) und mehr als 5 externe Bibliotheken – zwei G-Indikatoren auf dem Papier.
- **Optionen:**
  - **A:** Klasse M – Konsequenzen: alle Pflicht-Dokumente in voller Form, `docs/requirements.md` verkürzt aus der Vision abgeleitet, Fahrplan mit 3–5 Phasen, CI mit vollem Gate-Satz je Sprache.
  - **B:** Klasse G – Konsequenzen: eigener Anforderungsdialog, Tests je Muss-Anforderung, strengerer Reaktiv-Schwellenwert, Aufteilung von Architektur und ADRs in Unterdokumente; mehr Dokumentationsaufwand ohne erkennbaren Nutzen bei einem Nutzer.
- **Entscheidung:** A – Klasse M. Die Stufe-2-Indikatoren (eine Betriebseinheit, synchrone Kommunikation, eine Quelle der Wahrheit in Dateien mit abgeleitetem Index, ein Nutzer) sprechen für M; die Modulzahl ergibt sich aus der fachlichen Trennung, nicht aus Verteilung. Hypothese vom Eigentümer nach Schritt 1 nicht beanstandet und im Sicherheitsgrundriss (Schritt 4a) ausdrücklich bestätigt.
- **Vision-Frage, die entschied:** n/a (Methodik-Entscheidung)
- **Konfidenz zum Zeitpunkt:** n/a (Methodik-Entscheidung)
- **Konsequenzen:**
  - Struktur: `docs/decisions.md` als Einzeldatei mit Teil A–C, Teil D optional (genutzt für den Kostenrahmen, BDR-001); `docs/architecture.md` als ein Dokument; `docs/fahrplan.md` mit fünf Phasen plus datierten, ausgelösten und verschobenen Schritten; `docs/requirements.md` und `docs/onboarding-runbook.md` angelegt.
  - Reaktiv-Schwellenwert 30 % über die letzten 10 ADRs (`docs/project-context.md` Abschnitt 6).
  - Reklassifikation nach `templates/projektstart.md` Abschnitt 2.4, falls sich ein zweiter Speicher oder weitere Betriebseinheiten als nötig erweisen.
  - Die temporäre Übergabe-Datei `docs/modus-2-stand.md` entfällt mit dem Initialisierungs-Commit (Modus 2 Schritt 12).
- **Abgeleitete Regel:** keine (Einzelfall-Entscheidung)

#### ADR-002: Stack – Web-App mit Python-Server und TypeScript-Oberfläche

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[STACK]`
- **Phasentyp-Kontext:** INITIALISIERUNG
- **Reifegrad-Wirkung:** keine unmittelbare; die Bausteine sind Grundlage der `[VORLÄUFIG]`-Module in `docs/architecture.md`
- **Kategorie:** Externe Abhängigkeiten (`CLAUDE.md` Abschnitt 4, Kategorie 3)
- **Kontext:** Die Vision lässt die Technologie offen (Vision 6), verlangt aber Cloud-KI mit freier Modellwahl, Nutzung am Smartphone und offene Formate (Vision 7). Nach der Bestandsprüfung (`docs/research/bestandspruefung.md`) und der Grundsatzentscheidung für einen Eigenbau (ADR-004) standen Plattform, Bausteine und Versionen an.
- **Optionen:**
  - **A:** Web-App durchgehend in TypeScript – Konsequenzen: eine Sprache für Server und Oberfläche; schwächeres Ökosystem für KI-Werkzeuge (Kontext, Zusammenfassung, Suche).
  - **B:** Eigene Web-App, Server in Python, Oberfläche in TypeScript – Konsequenzen: zwei Sprachen und zwei Werkzeugketten; stärkstes Ökosystem für KI-Werkzeuge; Server, Zugangsschutz, Backups und das Gate vor dem ersten öffentlichen Deployment (`CLAUDE.md` Abschnitt 12) werden Pflicht.
  - **C:** Obsidian-Plugin – Konsequenzen: kein eigener Server, kein Zugangsschutz, kein Sicherheits-Gate; Obsidian ist kostenlos für jeden Zweck (obsidian.md/license, Stand 2025-02-20), Plugins laufen mobil ohne Node/Electron (docs.obsidian.md, Mobile development); Bindung an die Plugin-Schnittstelle von Obsidian.
- **Entscheidung:** B. **Empfehlung der KI war C** (Konfidenz mittel), begründet mit dem Wegfall von Server, Zugangsschutz und Sicherheits-Gate. **Der Eigentümer entschied sich für B.** Grund des Eigentümers: Python ist bei KI-Werkzeugen (Kontext, Zusammenfassung, Suche) am stärksten verbreitet – das wiegt für ihn schwerer als eine einzige Sprache. Bausteine (Eigentümer, 2026-09-26): Server FastAPI; Oberfläche React; Editor CodeMirror 6 mit sichtbarem Markdown; KI-Anbindung an OpenRouter direkt über httpx, erweiterbar für weitere Anbieter parallel (FR-025); Werkzeuge uv (Python) und npm (Oberfläche). Die KI hatte für die Oberfläche zunächst Svelte empfohlen und die Empfehlung selbst zugunsten React revidiert (größerer Bestand an Beispielen; Svelte 5 hat 2024 die Schreibweise umgestellt, das erhöht das Fehlerrisiko bei KI-geschriebenem Code; Konfidenz mittel). Versionen nach Versions-Verifikation, vom Eigentümer bestätigt am 2026-09-26 (`docs/research/versions-verifikation.md`, übernommen in `docs/project-context.md` Abschnitt 3): Python 3.14.7, TypeScript 6.0.3, FastAPI 0.141.1 (`<0.142`), Pydantic 2.13.5, uvicorn 0.52.4, httpx 0.28.1, React/react-dom 19.2.8, Vite 8.3.1, @vitejs/plugin-react 6.1.1, CodeMirror 6 (@codemirror/state 6.7.6, view 6.43.13, autocomplete 6.20.3, lang-markdown 6.5.2), Node.js 24.21.0 (nur Build), uv 0.12.19, npm 11.19.0.
- **Vision-Frage, die entschied:** „Möchtest du in einer vorhandenen Schreib-App schreiben, die das Skriptorium erweitert – oder in einer eigenen Webseite, die komplett nach dir gebaut ist und dafür Server und Pflege braucht?" → eigene Webseite. Zwischen A und B ausschlaggebend die Abwägung des Eigentümers „starkes KI-Ökosystem vor einer einzigen Sprache"; der Verzicht auf Obsidian nimmt Server, Zugangsschutz und Sicherheits-Gate bewusst in Kauf.
- **Konfidenz zum Zeitpunkt:** Empfehlung C: mittel. Svelte→React-Revision: mittel. Umkehrbarkeit: teuer (Plattform- und Sprachwahl trägt den gesamten Code).
- **Konsequenzen:**
  - Stack-Fixierung in `docs/project-context.md` Abschnitt 3; Major-Updates brauchen erneute Verifikation und einen ADR.
  - Verworfene Alternativen (Obsidian-Plugin, TypeScript-only, Svelte, TipTap) stehen in `docs/architecture.md` Abschnitt 8.
  - Nachprüfungen und Wechsel im Ablaufdaten-Register (`docs/project-context.md` Abschnitt 8) mit Fahrplan-Schritten: httpx auf Python 3.14.7 (1.3) und Nachprüfung (D.3), TypeScript 7 (D.2), Node 24 → 26 LTS (D.1).
  - Entwicklungswerkzeuge (Linter, Typprüfer, Test-Runner) werden im Projektgerüst (Schritt 2.1) gepinnt; ein YAML-Parser ist eine neue, freigabepflichtige Abhängigkeit (Schritt 2.2).
  - Server, Zugangsschutz und Gate sind Pflicht (siehe ADR-006).
- **Abgeleitete Regel:** Regel-001 (Versionswahl innerhalb einer Linie)

#### ADR-003: Architektur – modularer Monolith, Markdown-Dateien plus SQLite-Index, Kontext-Verfahren

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[MODUL]` `[DATENMODELL]` `[PERFORMANCE]`
- **Phasentyp-Kontext:** INITIALISIERUNG
- **Reifegrad-Wirkung:** Architektur-Pattern „Modularer Monolith" → `[BELASTBAR]`. Module, Schnittstellen, Datenmodell und Kontext-Verfahren bleiben `[VORLÄUFIG]`; Token-Budget `[VORLÄUFIG]` bis Schritt 1.1.
- **Kategorie:** Architekturänderungen und Datenmodell (`CLAUDE.md` Abschnitt 4, Kategorien 1 und 4)
- **Kontext:** Ein Nutzer, ein Betriebsziel, fachlich dichter Kern. Anlass des Projekts sind Kosten und Kontextgrenzen, weil heute bei jeder Anfrage der gesamte Verlauf mitgeschickt wird (Vision 2, 4). Zu entscheiden waren Bauweise, Speicherform und das Verfahren, mit dem eine KI-Anfrage zusammengestellt wird.
- **Optionen:**
  - **Bauweise A:** modularer Monolith – eine Betriebseinheit mit fachlich getrennten Modulen (`canon`, `manuscript`, `context`, `ai_gateway`, `storage`, `api`, `ui`).
  - **Bauweise B:** mehrere getrennt betriebene Dienste – kein Nutzen bei einem Nutzer, mehr Betriebsaufwand.
  - **Speicher A:** nur Markdown-Dateien, kein zweiter Speicher.
  - **Speicher B:** Markdown-Dateien mit YAML-Kopf als Quelle der Wahrheit plus SQLite-Suchindex, der jederzeit vollständig aus den Dateien neu aufgebaut werden kann.
  - **Speicher C:** nur Datenbank – widerspricht offenen, lesbaren Formaten (Vision 7, FR-020).
  - **Kontext-Verfahren:** feste Vorrangfolge unter Token-Budget – (1) Regeln und Schreibanweisung inkl. Figuren-Schreibweise, (2) per `@` genannte Einträge und Einträge der Figuren der Szene, (3) Gesamtzusammenfassung und Kapitel-Kurzfassungen, (4) letzte Manuskript-Seiten wörtlich; Alternative „ganzen Verlauf mitschicken" (Ist-Zustand TypingMind).
- **Entscheidung:** Bauweise A (Empfehlung der KI über Heuristik 1.3: ein Nutzer, ein Betriebsziel, fachliche Komplexität; Konfidenz hoch). **Speicher: Empfehlung der KI war A („nur Dateien"); der Eigentümer entschied sich für B.** Einen eigenen Grund hat der Eigentümer nicht genannt; Option B war ihm als „wie A, dazu schnellere Suche bei sehr großen Beständen; zweiter Speicher, mehr Fehlerquellen, heute kein belegter Bedarf" vorgelegt. Begründung der KI-Empfehlung A: Default-Bias aus `templates/architektur-heuristiken.md` Teil 1 (einfachste Option, bis Bedarf belegt ist); der Index sollte ein späterer Ausbau per ADR bleiben. Umsetzung von B: Die Markdown-Dateien bleiben Quelle der Wahrheit, der SQLite-Index ist jederzeit aus ihnen neu aufbaubar. Kontext-Verfahren wie oben mit Startbudget 30.000 Token Eingabe, ausdrücklich `[VORLÄUFIG]`; Festlegung von Startmodell und Budget im Erkundungsschritt 1.1.
- **Vision-Fragen, die entschieden:** Bauweise: „Soll das Skriptorium irgendwann viele Nutzer gleichzeitig bedienen?" → nein (Vision 5). Speicher: „Ist es dir wichtig, deine Welten und Texte jederzeit direkt als Dateien öffnen und sichern zu können?" → Dateien bleiben Quelle der Wahrheit, zusätzlich Index. Kontext-Verfahren: „Bist du bereit, Kapitel-Zusammenfassungen bei Bedarf kurz zu prüfen, damit der Handlungsstand stimmt?" → Verfahren nach Erklärung bestätigt.
- **Konfidenz zum Zeitpunkt:** Bauweise hoch; Speicherform mittel (Tempo bei Geschichten von 500.000 Token nicht gemessen); Kontext-Verfahren mittel (verbreitetes Verfahren, für diesen Kanon nicht erprobt) – bewusst `[VORLÄUFIG]`, geprüft in Schritt 1.1, Beförderung in Schritt 1.4. Umkehrbarkeit: Bauweise mittel, Speicherform mittel, Kontext-Verfahren billig (Budget und Bausteine sind Einstellungen).
- **Konsequenzen:**
  - Nur die Beziehungen der Modul-Karte (`docs/architecture.md` Abschnitt 2) sind erlaubt; `storage` ist die einzige Stelle, die Dateien und Index berührt; `context` liest nur; `ai_gateway` kennt keine Fachbegriffe.
  - Der Index enthält nichts, was nicht aus den Dateien wiederherstellbar ist; gesichert werden nur die Dateien.
  - Ein YAML-Parser für den Dateikopf ist eine neue externe Abhängigkeit – Freigabe in Schritt 2.2.
  - Die Prüfung „kein Kontextverlust" beim Referenzumfang ist erst möglich, sobald eine Geschichte ≥ 500.000 Token erreicht (Schritt D.4; FR-006 verworfen, ADR-009).
- **Abgeleitete Regel:** keine (Leitregeln stehen in `docs/architecture.md` Abschnitt 2)

#### ADR-004: Schlanker Eigenbau statt Anpassung eines vorhandenen Werkzeugs

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[STACK]`
- **Phasentyp-Kontext:** INITIALISIERUNG
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Architektur und externe Abhängigkeiten (`CLAUDE.md` Abschnitt 4, Kategorien 1 und 3)
- **Kontext:** Vision 7 bevorzugt die Wiederverwendung bestehender Open-Source-Bausteine (FR-021); Vision 9 ließ „Eigenbau vs. Anpassung" bewusst offen bis nach einer Bestandsprüfung. Die Bestandsprüfung (`docs/research/bestandspruefung.md`) ordnete The Story Nexus, Story Labyrinth und SillyTavern (alle AGPL-3.0) als Basis zur Anpassung denkbar ein, weitere Werkzeuge nur als Vorbild für Konzepte. Die unterscheidenden Funktionen (`@`-Menü, Gast-Figuren-Logik FR-017/FR-024) sind bei keinem Werkzeug belegt.
- **Optionen:**
  - **A:** Anpassung von The Story Nexus oder Story Labyrinth – Konsequenzen: schneller Start; fremde Form, Rückbau nötig (u. a. Mehrbenutzer-Rollen, großer Funktionsumfang), Differenzierungsmerkmale ohnehin neu zu bauen; AGPL-3.0 würde die Projektlizenz festlegen.
  - **B:** Schlanker Eigenbau, Konzepte aus der Bestandsprüfung übernehmen, kein fremder Code – Konsequenzen: später nutzbar, dafür genau in der Arbeitsweise des Eigentümers; Projektlizenz frei wählbar.
  - **C:** Praxistest der Kandidaten vorab – Konsequenzen: Erkenntnis aus Erprobung statt aus Code und Doku, Verzögerung vor jeder Umsetzung.
- **Entscheidung:** B (Empfehlung der KI über Heuristik 1.3 – weniger Abhängigkeiten – und Default-Bias; vom Eigentümer gewählt).
- **Vision-Frage, die entschied:** „Schnell mit einem fremden Werkzeug in dessen Form – oder etwas später genau in deiner Arbeitsweise?" → Antwort des Eigentümers: eigene Arbeitsweise.
- **Konfidenz zum Zeitpunkt:** mittel (belegt aus Code und Dokumentation, nicht erprobt); Umkehrbarkeit: teuer.
- **Konsequenzen:**
  - Kein fremdes Werkzeug als Code-Basis (`docs/project-context.md` Abschnitt 3, „Explizit nicht erlaubt"); jede Übernahme einzelner Code-Teile ist freigabepflichtig (Kategorien 3 und 8).
  - Übernommene Konzepte als Vorbild: u. a. `@`-Verweis (Writingway 2), Markieren → Kanon-Eintrag (NovelCrafter), chatgebundene Lorebooks als Muster für Gast-Verbindungen (SillyTavern), Markdown-Vault als offenes Format (Obsidian).
  - FR-021 (Bestandsprüfung vor der Stack-Entscheidung) ist damit erfüllt.
  - Mit der späteren Lizenzwahl AGPL-3.0 (ADR-005) entfällt der Lizenz-Nachteil von Option A; der Eigenbau bleibt aus den übrigen Gründen bestehen (Hinweis an den Eigentümer gegeben).
- **Abgeleitete Regel:** keine (Einzelfall-Entscheidung)

#### ADR-005: Projektlizenz AGPL-3.0

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]`
- **Phasentyp-Kontext:** INITIALISIERUNG
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Lizenz und Compliance (`CLAUDE.md` Abschnitt 4, Kategorie 8)
- **Kontext:** Vision 6 sieht Open Source vor und ließ die Lizenz bis nach der Bestandsprüfung offen. Nach ADR-004 (kein fremder Code) war die Wahl frei.
- **Optionen:**
  - **A:** freizügige Lizenz (z. B. MIT) – andere dürfen den Code auch in ein geschlossenes Produkt übernehmen.
  - **B:** Copyleft mit Netzwerk-Klausel (AGPL-3.0) – auch wer den Code als Online-Dienst betreibt, muss den Quelltext offenlegen; geschlossene Weiterverwertung ist ausgeschlossen.
- **Entscheidung:** B – AGPL-3.0. `LICENSE` enthält den Lizenztext aus der SPDX-Lizenzliste (`AGPL-3.0-only.txt`, abgerufen 2026-09-26; gnu.org aus der Arbeitsumgebung nicht erreichbar).
- **Vision-Frage, die entschied:** „Dürfen andere den Code in ein geschlossenes Produkt übernehmen?" → Antwort des Eigentümers: nein.
- **Konfidenz zum Zeitpunkt:** n/a (keine Architekturentscheidung)
- **Konsequenzen:**
  - Erlaubte Abhängigkeitslizenzen: MIT, BSD-2/3-Clause, Apache-2.0, ISC, PSF-2.0, MPL-2.0, LGPL (2.1 oder später, 3.0), GPL-3.0 (bzw. „2.0 oder später"), AGPL-3.0; Artistic-2.0 nur für Werkzeuge. Ausgeschlossen: GPL-2.0-only, proprietäre Lizenzen, Lizenzen mit Nutzungsbeschränkung – Abweichung nur per ADR (`docs/project-context.md` Abschnitt 6).
  - Jede neue Abhängigkeit wird vor der Freigabe gegen diese Liste geprüft.
- **Abgeleitete Regel:** keine (die Lizenzliste steht in `docs/project-context.md` Abschnitt 6)

#### ADR-006: Öffentlicher Betrieb mit Passwortschutz und Sicherheitsniveau ASVS 5.0.0

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[SECURITY]` `[DEPLOYMENT]`
- **Phasentyp-Kontext:** INITIALISIERUNG
- **Reifegrad-Wirkung:** Sicherheitsniveau ASVS 5.0.0 L1 / Auth L2 → `[BELASTBAR]`. Bedrohungsmodell bleibt `[VORLÄUFIG]`; Host, Secrets im Betrieb und Backups bleiben `[OFFEN]` bis zu den Schritten 4.2–4.6.
- **Kategorie:** Sicherheit und Datenschutz sowie Build- und Deploy-Pipeline (`CLAUDE.md` Abschnitt 4, Kategorien 6 und 7)
- **Kontext:** Der Eigentümer will am Desktop und am Smartphone schreiben (Vision 7); Cloud-Hosting ist erlaubt (Vision 6). Im Sicherheitsgrundriss (Modus 2 Schritt 4a) standen die Erreichbarkeit und das Sicherheitsniveau an. Wichtigstes Gut laut Bedrohungsmodell ist der API-Schlüssel der KI-Anbieter, weil Missbrauch direkt Geld kostet.
- **Optionen:**
  - **Erreichbarkeit A:** nur im privaten Netz erreichbar – kleinere Angriffsfläche.
  - **Erreichbarkeit B:** öffentlich im Internet auf einem gemieteten Server (VPS), geschützt durch Passwort – volles Gate vor dem ersten öffentlichen Deployment (`CLAUDE.md` Abschnitt 12) mit eigenem Fahrplan-Schritt davor.
  - **Sicherheitsniveau:** OWASP ASVS 5.0.0 Stufe 1 für die gesamte Anwendung, Stufe 2 für Authentifizierung und Sitzungsverwaltung.
- **Entscheidung:** **Empfehlung der KI war Erreichbarkeit A (nur privates Netz); der Eigentümer entschied sich für B (öffentlich mit Passwort auf VPS).** Einen eigenen Grund hat der Eigentümer nicht genannt. Sicherheitsniveau: ASVS 5.0.0 L1, Authentifizierung und Sitzung L2 – vom Eigentümer freigegeben.
- **Vision-Frage, die entschied:** „Ist eine einmal eingerichtete VPN-App auf deinen Geräten für dich in Ordnung – oder muss das Skriptorium von jedem beliebigen Gerät ohne Vorbereitung erreichbar sein?" → Erreichbarkeit ohne Vorbereitung (Option B). Sicherheitsniveau: Obergrenze aus Schutzbedarf normal, Anmeldung als einzige Barriere strenger.
- **Konfidenz zum Zeitpunkt:** Empfehlung A mittel (verbreitetes Muster; Bedingungen des VPN-Dienstes nicht geprüft). Umkehrbarkeit: billig (später privat machen oder öffentlich lassen ist eine Betriebsfrage).
- **Konsequenzen:**
  - Das Gate vor dem ersten öffentlichen Deployment gilt vollständig; es steht als eigener Schritt 4.6 vor dem Deployment-Schritt 4.7.
  - Das Sicherheitsniveau ist Obergrenze für den Sicherheitsaufwand (`CLAUDE.md` Abschnitt 6): jede Maßnahme nennt die ASVS-Anforderung, die sie erfüllt; alles darüber hinaus wird als optional vorgelegt.
  - Alle Endpunkte außer Gesundheitsprüfung und Anmeldung verlangen eine gültige Sitzung (Schritt 2.6); der OpenRouter-Schlüssel trägt eine Ausgabengrenze beim Anbieter.
  - Jede Änderung der Kategorie 6 braucht eine Prüfung durch eine getrennte Instanz (Definition of Done).
- **Abgeleitete Regel:** keine (die Obergrenzen-Regel steht bereits in `CLAUDE.md` Abschnitt 6)

#### ADR-007: Schutzbedarf normal

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[SECURITY]`
- **Phasentyp-Kontext:** INITIALISIERUNG
- **Reifegrad-Wirkung:** Schutzbedarf normal → `[BELASTBAR]`
- **Kategorie:** Sicherheit und Datenschutz (`CLAUDE.md` Abschnitt 4, Kategorie 6)
- **Kontext:** Das System verarbeitet fiktionale Welten und Manuskripte des Eigentümers; personenbezogen sind nur die Zugangsdaten des einen Nutzers, Daten Dritter gibt es nicht. Die Übermittlung an kommerzielle KI-APIs ist laut Vision 6 zulässig.
- **Optionen:**
  - **A:** normal – Obergrenze für Datenschutz-Maßnahmen auf Grundschutz-Niveau.
  - **B:** hoch – zusätzliche Maßnahmen (z. B. Verschlüsselung ruhender Daten), mehr Aufwand.
- **Entscheidung:** A – normal.
- **Vision-Frage, die entschied:** „Wie schlimm wäre es, wenn diese Daten nach außen gelangen?" → Antwort des Eigentümers: „unangenehm, kein Schaden".
- **Konfidenz zum Zeitpunkt:** n/a (keine Architekturentscheidung)
- **Konsequenzen:**
  - Der Schutzbedarf ist Obergrenze für alle Datenschutz-Maßnahmen (`CLAUDE.md` Abschnitt 6).
  - Keine Inhalte aus Welten oder Manuskripten in Server-Logs; Logs enthalten nur Metadaten (`docs/project-context.md` Abschnitt 6).
- **Abgeleitete Regel:** keine

#### ADR-008: Verzicht auf eine Vertretung (Gate-Prüfpunkt 7)

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[SECURITY]` `[DEPLOYMENT]`
- **Phasentyp-Kontext:** INITIALISIERUNG
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Sicherheit und Datenschutz (`CLAUDE.md` Abschnitt 4, Kategorie 6 – Verzicht auf einen Gate-Prüfpunkt ist nur per ADR zulässig, `CLAUDE.md` Abschnitt 12)
- **Kontext:** Gate-Prüfpunkt 7 verlangt eine zweite Person, die im Notfall eingreifen kann, oder den Verzicht per ADR mit benanntem Restrisiko. Das Skriptorium hat genau einen Nutzer und Betreiber.
- **Optionen:**
  - **A:** eine zweite Person benennen und einweisen.
  - **B:** Verzicht – niemand greift ein; Stillstand ist zulässig, Daten bleiben in den Sicherungen.
- **Entscheidung:** B – Verzicht (Eigentümer, 2026-09-26).
- **Vision-Frage, die entschied:** „Wer kann eingreifen, wenn du nicht erreichbar bist – und darf das Projekt laufen, wenn es niemanden gibt?" → Antwort des Eigentümers: niemand; Stillstand ist zulässig.
- **Konfidenz zum Zeitpunkt:** n/a (keine Architekturentscheidung)
- **Konsequenzen:**
  - **Restrisiko (benannt):** Ist der Eigentümer nicht erreichbar, bleibt ein Ausfall, ein Fehlverhalten oder ein Einbruch in den öffentlich erreichbaren Server bis zu seiner Rückkehr unbehandelt; das System kann in dieser Zeit stillstehen oder kompromittiert weiterlaufen.
  - **Restrisiko:** Missbrauch des API-Schlüssels verursacht bis zum Eingreifen Kosten; begrenzt wird der Schaden nur durch die Ausgabengrenze am Schlüssel bei OpenRouter.
  - **Restrisiko:** Datenverlust ist nur so weit begrenzt, wie die Sicherungen reichen; ohne Eingreifen wird keine Wiederherstellung ausgelöst.
  - Das Notfall-Handbuch bleibt Pflicht (Gate-Prüfpunkt 7, zweiter Teil): Abschnitt „Notfall" in `docs/onboarding-runbook.md`, Schritt 4.4 – es erlaubt dem Eigentümer ohne KI, das System anzuhalten, eine Sicherung zu ziehen und wiederherzustellen.
  - Die Ausgabengrenze am OpenRouter-Schlüssel ist Pflicht (ADR-006) und wird im Gate-Schritt 4.6 belegt.
  - `docs/project-context.md` Abschnitt 8, „Vertretung", verweist auf diesen ADR.
- **Abgeleitete Regel:** keine

#### ADR-009: Descope FR-006 – keine Übernahme bestehender Geschichten

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[METHODIK]`
- **Phasentyp-Kontext:** INITIALISIERUNG
- **Reifegrad-Wirkung:** NFR „Kontexttreue Referenzumfang" bleibt `[OFFEN]` bis Schritt D.4
- **Kategorie:** Methodik (Descope einer Anforderung, `CLAUDE.md` Abschnitt 6, „Keine Verschiebung ohne Landeplatz")
- **Kontext:** Bei der Ableitung der Anforderungen (Modus 2 Schritt 1a) war offen, ob bestehender Bestand übernommen wird: Welt-Material (in TypingMind-Agenten und Notion) und bestehende Geschichten, insbesondere die Referenzgeschichte mit 500.000–700.000 Token Chatverlauf (Klärungsfrage 1 in `docs/requirements.md` Abschnitt 7).
- **Optionen:**
  - **A:** Welt-Material und Geschichten übernehmen – die Referenzgeschichte stünde als Prüfmaßstab sofort bereit; zusätzlicher Import- und Aufbereitungsaufwand für Chatverläufe.
  - **B:** nur Welt-Material übernehmen (FR-005, Muss), Geschichten beginnen neu (FR-006 verworfen).
- **Entscheidung:** B – FR-006 wird verworfen (Entscheidung des Eigentümers, 2026-09-26).
- **Vision-Frage, die entschied:** „Übernahme von Bestand – Welt-Material, Geschichten oder beides?" (Klärungsfrage 1) → Antwort des Eigentümers: nur Welt-Material; Geschichten beginnen neu.
- **Konfidenz zum Zeitpunkt:** n/a (keine Architekturentscheidung)
- **Konsequenzen:**
  - FR-006 steht in `docs/requirements.md` auf „VERWORFEN (ADR-009)".
  - Die Erfolgskriterien „kein Kontextverlust" und „günstiger pro Anfrage" (Vision 4) werden an einer neuen Geschichte gleichen Umfangs geprüft, nicht an der Referenzgeschichte. Landeplatz: Schritt D.4 mit Auslöser „Geschichte ≥ 500.000 Token"; bis dahin gilt das Kriterium als unbelegt.
  - Der Vision-Abgleich an Phasengrenzen führt FR-006 als bewusst ausgeschlossen.
- **Abgeleitete Regel:** keine

---

#### ADR-010: Startmodell, Ausweichmodell und Token-Budget

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer (Wertung Wartezeit gegen Kanon-Treue); Festlegung der Werte durch die KI auf Grundlage des Tests
- **Status:** Aktiv – Festlegung des Ausweichmodells ersetzt durch ADR-011 (grok-4.6 Zweitmodell, qwen3.8-max Notfall-Reserve)
- **Tags:** `[ERKENNTNIS]` `[PERFORMANCE]`
- **Phasentyp-Kontext:** ERKUNDUNG
- **Reifegrad-Wirkung:** NFR Token-Budget: Wert festgelegt, bleibt `[VORLÄUFIG]` bis zur Beförderung in Schritt 1.4; NFR Reaktionszeit: Ziel 5 s für das Startmodell nicht erreichbar, Anpassung in 1.4 vorzulegen; NFR Kanon-Treue bleibt `[OFFEN]` (Vorprüfung erfolgt)
- **Kategorie:** keine aus `CLAUDE.md` Abschnitt 4 (Modellwahl ist Konfiguration über den bestehenden Dienst OpenRouter); Ergebnis des Erkundungsschritts 1.1
- **Kontext:** Schritt 1.1 sollte Startmodell und Token-Budget begründet festlegen. Test mit erfundener Welt (Material des Eigentümers in der Arbeitsumgebung nicht verwendbar): 9 Modelle, 3 Budget-Stufen (ca. 8.000 / 14.000 / 17.600 Token), 54 Läufe, 0,85 $; Kanon-Treue und sprachliche Ausdrucksweise blind bewertet. Ergebnisse: `docs/research/modell-eignungstest.md`.
- **Optionen:**
  - **A:** grok-4.7 – beste Kanon-Treue (1,5 Widersprüche je 1.000 Wörter) und beste Sprache (Rang 1 in allen drei Sätzen), 15–50 s bis zum ersten Textstück, ca. 0,03 $ je Anfrage.
  - **B:** gemini-3.8-flash – schnell (ca. 2 s), knapp doppelt so viele Kanon-Fehler, Sprache nur Mittelfeld; Nutzungsbedingungen schließen sexuell explizite Inhalte aus; nach Erfahrung des Eigentümers schreiben neuere Gemini-Modelle seine Inhalte nicht mehr.
  - **C:** grok-4.6 – Mittelweg: 5–8 s, 2,4 Widersprüche je 1.000 Wörter, Sprache Rang 2.
  - **D:** qwen3.8-max – Kanon-Treue gleichauf mit grok-4.7 (1,4), Sprache Rang 3, 19–27 s, mehr Verstöße gegen die Figuren-Schreibweise.
- **Entscheidung:**
  - **Startmodell:** `x-ai/grok-4.7` mit niedrigster Reasoning-Stufe.
  - **Ausweichmodell:** `qwen/qwen3.8-max-0902` (FR-018) – gleiche Kanon-Treue, anderer Hersteller, vom Eigentümer für seine Inhalte bereits genutzt.
  - **Schnelle Alternative:** `x-ai/grok-4.6` für Momente, in denen Tempo wichtiger ist.
  - **Token-Budget:** 30.000 Token Eingabe als **Obergrenze** je Schreib-Anfrage (Startwert aus ADR-003 bestätigt). Zwischen 8.000 und 17.600 Token zeigte sich kein Unterschied; die Obergrenze bleibt, weil echte Welten größer sind als die Testwelt und die Kosten auch bei 30.000 Token im Rahmen bleiben (grok-4.7 hochgerechnet ca. 21 $ im Monat).
- **Vision-Frage, die entschied:** „Stört es dich beim Schreiben mehr, eine halbe Minute zu warten, oder beim Überarbeiten öfter Kanon-Fehler korrigieren zu müssen?" → Antwort des Eigentümers: „Kanon-Fehler stören mehr."
- **Konfidenz zum Zeitpunkt:** mittel – Abstand grok-4.7 zu Modellen ohne Vorab-Denken deutlich und über drei Bewertungsrunden stabil (Eichtexte identisch bewertet); aber erfundene Welt, 6 Texte je Modell, Bewertung durch KI. Umkehrbarkeit: billig (Modell und Budget sind Einstellungen).
- **Konsequenzen:**
  - Das Reaktionszeit-Ziel „erstes Textstück in 5 s" (`docs/architecture.md` Abschnitt 6) gilt für das Startmodell nicht; Anpassung des Ziels und eine Warteanzeige in der Oberfläche („denkt nach …") sind in Schritt 1.4 bzw. 3.3 vorzusehen.
  - `ai_gateway` (3.1): Reasoning je Modell einstellbar (manche Modelle verlangen es zwingend, HTTP 400 sonst); `finish_reason: content_filter` → `ModelRefused`; HTTP 429 → `RateLimited`; Anbieter-Routing, damit Anbieter mit Training auf Eingaben (StreamLake) gemieden werden.
  - `context` (3.2): Feste Teile (Regeln, Kanon) an den Anfang der Anfrage – Zwischenspeicher der Anbieter senkten im Test die Kosten der Folgeanfrage deutlich.
  - Oberfläche (3.3, 3.9): „mit anderem Modell wiederholen" bei jedem KI-Text, weil textliche Weigerungen technisch nicht erkennbar sind.
  - Filterverhalten gegenüber den Inhalten des Eigentümers ist nur durch seine Erfahrung belegt; neuere Modellversionen können strenger werden (Befund Gemini) – Modellwechsel bleibt zentral.
- **Abgeleitete Regel:** keine

---

#### ADR-011: grok-4.6 als Zweitmodell, qwen3.8-max nur als Notfall-Reserve

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[ERKENNTNIS]` `[PERFORMANCE]`
- **Phasentyp-Kontext:** ERKUNDUNG
- **Reifegrad-Wirkung:** keine
- **Kategorie:** keine aus `CLAUDE.md` Abschnitt 4 (Modellwahl ist Konfiguration); Ergebnis des Erkundungsschritts 1.5, ändert die Zweitmodell-Festlegung aus ADR-010
- **Kontext:** ADR-010 legte qwen3.8-max als Ausweichmodell fest, vor allem wegen des anderen Herstellers. Der Genre-Test (Schritt 1.5, `docs/research/modell-eignungstest.md` Abschnitt „Genre-Test") zeigte qwen3.8-max in Horror, Thriller, Action und düsterer Szene schwächer als grok-4.6 (Punkte 16,0 zu 18,1 von 25; Schreibweise-Verstöße 5 zu 2 von 8 Texten).
- **Optionen:**
  - **A:** qwen3.8-max bleibt Ausweichmodell – Schutz durch zweiten Hersteller, schwächer in Genre-Szenen.
  - **B:** grok-4.6 wird bevorzugtes Zweitmodell, qwen3.8-max bleibt Notfall-Reserve – bessere Texte, beide Hauptmodelle vom selben Hersteller.
- **Entscheidung:** B.
- **Vision-Frage, die entschied:** „qwen als Ausweichmodell wegen des zweiten Herstellers – oder grok-4.6, das in deinen Genres besser schreibt?" → Antwort des Eigentümers: grok-4.6 ist auch in seiner Nutzung gut bei Charakter-Konsistenz und Figuren-Simulation, grok-4.7 zudem sehr gut bei CNC-Inhalten; „Qwen ist wirklich nur eine Notfalllösung."
- **Konfidenz zum Zeitpunkt:** hoch für die Rangfolge (Test und Erfahrung des Eigentümers stimmen überein); Umkehrbarkeit billig (Einstellung).
- **Konsequenzen:**
  - Reihenfolge der Modelle: grok-4.7 (Start) → grok-4.6 (Zweitmodell, auch schnelle Alternative, 5–8 s) → qwen3.8-max (Notfall-Reserve).
  - **Restrisiko:** Start- und Zweitmodell stammen von xAI. Verschärft xAI Filter oder Bedingungen, fallen beide zugleich aus; dann bleibt qwen3.8-max mit schwächerer Genre-Leistung. Deshalb bleibt der Modellwechsel über die Anbieter-Schnittstelle (FR-018, FR-025) Pflicht, und die Beobachtung von Filteränderungen (`docs/requirements.md`, Beteiligter KI-Anbieter) gilt besonders für xAI.
- **Abgeleitete Regel:** keine

---

#### ADR-012: Import von Welt-Material zunächst nur als Markdown

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[ERKENNTNIS]` `[DATENMODELL]`
- **Phasentyp-Kontext:** ERKUNDUNG
- **Reifegrad-Wirkung:** offene Frage im Modul `canon` (Inhalt des TypingMind-Exports) für die erste Ausbaustufe gegenstandslos; Untermodul `canon.importers` mit einem Markdown-Importer `[VORLÄUFIG]`
- **Kategorie:** Datenmodelländerungen (`CLAUDE.md` Abschnitt 4, Kategorie 4) – Eingangsformat des Imports
- **Kontext:** Schritt 1.2 sollte das Importformat an echten Exporten aus TypingMind (Agenten-JSON) und Notion (Markdown-Export) festlegen. Das Material des Eigentümers kann in der Arbeitsumgebung nicht verwendet werden (Angabe des Eigentümers, 2026-09-26); das Schema des TypingMind-Exports ist nicht öffentlich dokumentiert (`docs/research/bestandspruefung.md`).
- **Optionen:**
  - **A:** Dummy-Exporte mit erfundenem Inhalt anlegen und daran beide Importer festlegen.
  - **B:** Zunächst nur Markdown-Import; der Autor kopiert sein Welt-Material als Text/Markdown ins Skriptorium und ordnet Kanon-Einträge dort zu. TypingMind- und Notion-Importer später.
  - **C:** Notion nach öffentlicher Doku bauen, TypingMind später.
- **Entscheidung:** B (Empfehlung der KI war A).
- **Vision-Frage, die entschied:** „Deine echten Exporte kann ich nicht nutzen. Wie sollen wir den Import von Welt-Material klären?" → Antwort des Eigentümers: „Wir beginnen erst mal mit Markdown-Import und nehmen TypingMind und Notion später dazu."
- **Konfidenz zum Zeitpunkt:** hoch, dass Markdown als Eingang trägt (offenes, dokumentiertes Format; Notion exportiert ohnehin Markdown); Umkehrbarkeit billig (weitere Importer sind Ergänzungen in `canon.importers`).
- **Konsequenzen:**
  - Schritt 2.4 baut einen Markdown-Importer; Einzelheiten der Zuordnung (z. B. Überschriften als Einträge, Kategorie-Wahl durch den Autor) werden in 2.4 festgelegt und dem Eigentümer gezeigt.
  - TypingMind-Import → Schritt V.4, Notion-Import → Schritt V.5 (beide `[VERSCHOBEN]`, Landeplatz 5.5).
  - **Risiko FR-005/FR-022:** Welt-Material mit zweistelliger Seitenzahl von Hand zu kopieren und zuzuordnen kann den 30-Minuten-Rahmen der Einrichtung sprengen. Gemessen wird das im 30-Minuten-Test (4.8); reicht die Zeit nicht, werden V.4/V.5 vorgezogen.
- **Abgeleitete Regel:** keine

---

#### ADR-013: Reifegrad-Beförderung vor Phase 2 und neues Reaktionszeit-Ziel

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[ERKENNTNIS]` `[MODUL]` `[SCHNITTSTELLE]` `[DATENMODELL]` `[PERFORMANCE]`
- **Phasentyp-Kontext:** ERKUNDUNG
- **Reifegrad-Wirkung:** `[VORLÄUFIG]` → `[BELASTBAR]`: Kommunikations-Grundmodus; Module canon, manuscript, context, ai_gateway, storage, api, ui; alle Schnittstellen (Grobverträge, `docs/architecture.md` Abschnitt 4); Datenflüsse (Abschnitt 5); Datenmodell mit Kopffeldern (Abschnitt 7); NFR Token-Budget; NFR Reaktionszeit (neu gefasst). Unverändert `[VORLÄUFIG]`: Stateful-Aussage, Observability (Logging, Metriken), Bedrohungsmodell, Netz; `[OFFEN]`: Kanon-Treue, Kontexttreue Referenzumfang, Host, Secrets im Betrieb, Backups.
- **Kategorie:** Architekturänderungen (`CLAUDE.md` Abschnitt 4, Kategorie 1; Eskalations-Auslöser 4)
- **Kontext:** Phase 2 darf erst beginnen, wenn die berührten Bestandteile `[BELASTBAR]` sind (`CLAUDE.md` Abschnitt 6). Die Erkundung 1.1–1.5 klärte Budget, Tokenzählung, Ablehnungssignale, Modellwahl, Laufzeit (httpx) und Importformat; in 1.4 wurden die offenen Fragen geschlossen und Grobverträge für CanonService, ManuscriptService, DocumentStore und die HTTP-API sowie die Kopffelder des Datenmodells ergänzt. Das bisherige Reaktionszeit-Ziel (erstes Textstück in 5 s) ist mit dem Startmodell nicht erreichbar (ADR-010).
- **Optionen:**
  - **A:** alle genannten Bestandteile freigeben – Phase 2 kann starten.
  - **B:** nur die in Phase 1 erprobten Teile (context, ai_gateway, Token-Budget) freigeben, für die übrigen je einen Test-Schritt anlegen – mehr Gewissheit, Phase 2 verzögert sich.
  - Reaktionszeit: (a) sofortige Anzeige, erstes Textstück 60 s / 10 s; (b) nur Abbruch nach 90 s; (c) 10 s Pflicht mit grok-4.6 als Standard.
- **Entscheidung:** A; Reaktionszeit (a): Innerhalb 1 s zeigt die Oberfläche „denkt nach …" mit laufender Zeit; erstes Textstück beim Startmodell grok-4.7 innerhalb 60 s, beim Zweitmodell grok-4.6 innerhalb 10 s; Abbruch und Wechsel jederzeit (Empfehlungen der KI, vom Eigentümer gewählt).
- **Vision-Frage, die entschied:** „Reicht dir die geprüfte Planung für die Standard-Bausteine, oder willst du vorher kleine Tests sehen?" → Planung reicht. Zur Wartezeit: sofortige Anzeige statt schnellerem Standardmodell (folgt aus „Kanon-Fehler stören mehr", ADR-010).
- **Konfidenz zum Zeitpunkt:** mittel-hoch – context und ai_gateway an 86 Läufen erprobt, Laufzeit in 1.3 geprüft; storage, api, ui und manuscript folgen verbreiteten Mustern, sind aber nicht erprobt (Heuristik 1.3 und Smell-Prüfung 1.4 aus `templates/architektur-heuristiken.md`; von einer getrennten Prüf-Instanz bestätigt, ADR-014). Umkehrbarkeit: mittel – vor dem ersten Code billig, danach je Modul teurer.
- **Konsequenzen:**
  - Phase 2 kann beginnen; Änderungen an Modulgrenzen, Grobverträgen oder Datenmodell sind ab jetzt freigabepflichtig und in einer UMSETZUNG-Phase reaktiv zu kennzeichnen, wenn ungeplant.
  - Schritt 3.3: Akzeptanzkriterium zur Reaktionszeit an das neue Ziel angepasst.
  - Observability (Logging, Metriken) wird in 3.1 berührt und ist vorher zu befördern – Vermerk in Schritt 3.1.
  - YAML-Parser (freigabepflichtige Abhängigkeit) wird vor 2.2 vorgelegt.
- **Abgeleitete Regel:** keine

---

#### ADR-014: Phasenende 1 – weiterbauen

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[METHODIK]`
- **Phasentyp-Kontext:** ERKUNDUNG (Phasenende)
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Pflichtfrage am Phasenende (`CLAUDE.md` Abschnitt 12, „Weiterbauen, umbauen oder neu aufsetzen")
- **Kontext:** Abschluss von Phase 1 (ERKUNDUNG, Schritte 1.1–1.5). Bewertung durch eine getrennte Prüf-Instanz (anderes Modell als die bauende KI, ohne Kenntnis des Gesprächsverlaufs; erhielt Vision, Architektur, ADRs, Fahrplan und Spike-Code), 2026-09-26.
- **Bewertung der Prüf-Instanz (zusammengefasst, unverändert in der Aussage):** Weiterbauen – Architektur und Plan tragen; keine Zyklen, kein Gott-Modul, keine reaktiven ADRs (0/10), kein Produktivcode, Spikes sauber getrennt; gemessene Lücken (Token-Budget nur bis 17.600 geprüft) korrekt als vorläufig gekennzeichnet. Umbau: kein struktureller Bedarf, nur Abschluss von 1.4. Neu aufsetzen: kein Beleg. Befunde vor Phase 2: (1) 1.4 abschließen, (2) Reaktionszeit-Ziel in Architektur und Schritt 3.3 angleichen, (3) YAML-Parser vor 2.2 vorlegen, (4) Erkenntnisdokument zur Lesung des Eigentümers nachziehen.
- **Stellungnahme der bauenden KI:** Zustimmung; Befunde (1), (2) und (4) mit ADR-013 bzw. im selben Arbeitsgang behoben, (3) steht als Freigabe in 2.2. Ergänzung: Die Grobverträge für die Dienst- und HTTP-Schnittstellen wurden erst in 1.4 geschrieben; ihre Tragfähigkeit zeigt sich in 2.2–2.6.
- **Optionen:** weiterbauen / gezielt umbauen / neu aufsetzen.
- **Entscheidung:** weiterbauen.
- **Vision-Frage, die entschied:** „Weiterbauen, gezielt umbauen oder neu aufsetzen?" → Antwort des Eigentümers: weiterbauen.
- **Konfidenz zum Zeitpunkt:** hoch (übereinstimmend: Prüf-Instanz, bauende KI, Eigentümer); Umkehrbarkeit billig (noch kein Produktivcode).
- **Konsequenzen:** Phase 2 beginnt mit Schritt 2.1; keine Umbau- oder Neuaufbau-Schritte.
- **Abgeleitete Regel:** keine

---

#### ADR-015: Entwicklungswerkzeuge, Linien ohne Fehlerkorrektur-Versionen, Werkzeug-Lizenzen, Starlette-Abkündigung

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[STACK]` `[METHODIK]`
- **Phasentyp-Kontext:** UMSETZUNG (Schritt 2.1)
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Externe Abhängigkeiten (3), Build-Pipeline (7), Lizenz (8)
- **Kontext:** Schritt 2.1 pinnt die Entwicklungswerkzeuge aus `docs/project-context.md` Abschnitt 7 und schaltet CI und Pre-Commit scharf. Versionen gegen PyPI, npm-Registry und Git-Tags geprüft, alle Werkzeuge im Probeaufbau gemeinsam auf Python 3.14.7 und Node 24.21.0 grün (`docs/research/versions-verifikation.md`, „Entwicklungswerkzeuge"). Dabei vier offene Fragen: (1) einige Linien haben gar keine Fehlerkorrektur-Version; (2) zwei transitive Werkzeug-Lizenzen außerhalb der Liste; (3) Starlette 1.7.0 kündigt httpx im TestClient zugunsten von httpx2 an, httpx2 ist erst ab 2026-11-12 mindestreif; (4) Aufbau von Repo, Hooks und CI.
- **Optionen:**
  - **Linien ohne Fehlerkorrektur-Version – A:** Regel-001 ergänzen: neueste Version einer mindestens 6 Monate alten Linie – Konsequenzen: pytest-cov 7.1.0, setup-python v6.3.0, setup-node v6.5.0, pre-commit-hooks v6.0.0. **B:** streng anwenden – Konsequenzen: pytest-cov 6.2.1 (Python 3.14 nicht deklariert), setup-python v5, setup-node v4 aus 2024.
  - **Lizenzen – A:** CC-BY-4.0 (caniuse-lite) und BlueOak-1.0.0 (minimatch) nur für Werkzeuge erlauben, wie Artistic-2.0. **B:** ablehnen – Vite und ESLint nicht nutzbar.
  - **Starlette – A:** benannte Ausnahme im Warnungs-Bestand, Wechsel auf httpx2 als Schritt D.5 mit Frist 2026-11-12. **B:** httpx2 sofort per Ausnahme von der Mindestreife.
- **Entscheidung:** jeweils A; Werkzeug-Versionen und Aufbau wie vorgeschlagen:
  - Python (Entwicklungsgruppe): ruff 0.16.9, mypy 1.20.2, bandit 1.9.4, pip-audit 2.10.1, pytest 9.1.1, pytest-cov 7.1.0, pre-commit 4.6.2, httpx 0.28.1.
  - TypeScript: eslint 10.9.1, @eslint/js 10.0.1, typescript-eslint 8.70.1, eslint-plugin-react-hooks 7.1.1, prettier 3.9.9, vitest 4.1.11, @vitest/coverage-v8 4.1.11, @types/react 19.2.18, @types/react-dom 19.2.7.
  - CI und Hooks: actions/checkout v6.0.3, actions/setup-python v6.3.0, actions/setup-node v6.5.0, pre-commit-hooks v6.0.0, markdownlint-cli2 v0.23.3; `pre-commit/action` entfällt.
  - Aufbau: Python-Paket unter `src/skriptorium/<modul>/`, Oberfläche unter `ui/`, `pyproject.toml` und `package.json` im Wurzelverzeichnis; Pre-Commit-Hooks rufen die Werkzeuge über `uv run` bzw. `npx` auf (Versionen nur in den Lock-Dateien); CI ruft `pre-commit` direkt auf; Abdeckungsprüfung 90 % für `canon` und `context`, sobald die Ordner existieren; SessionStart-Hook richtet Cloud-Sessions ein (uv 0.12.19, Python 3.14.7, Node 24.21.0 mit SHA-256-Prüfung, Abhängigkeiten, `pre-commit install`, `UV_SYSTEM_CERTS` statt `UV_NATIVE_TLS`). DOM-Testbibliotheken folgen zur Freigabe in 2.7.
- **Vision-Frage, die entschied:** „Sollen Entwicklungswerkzeuge, die nicht im fertigen Skriptorium laufen, nach derselben strengen Reife-Regel ausgewählt werden wie die Programmteile – auch wenn das veraltete Werkzeuge bedeutet?" → Antwort des Eigentümers: Regel ergänzen (Option A); alle Empfehlungen freigegeben.
- **Konfidenz zum Zeitpunkt:** hoch – Probeaufbau mit allen Gates grün; Umkehrbarkeit billig (Versionswechsel sind Einzeiler).
- **Konsequenzen:**
  - Regel-001 erhält einen Zusatz für Linien ohne Fehlerkorrektur-Version.
  - Erlaubte Lizenzen: CC-BY-4.0 und BlueOak-1.0.0 nur für Werkzeuge (`docs/project-context.md` Abschnitt 6).
  - Warnungs-Bestand: eine benannte Ausnahme (Starlette-TestClient); Schritt D.5 und Eintrag im Ablaufdaten-Register.
  - Nachprüfung mypy 2 und vitest 5 bei Mindestreife (2026-11-06 bzw. 2027-03-03) über das Ablaufdaten-Register.
- **Abgeleitete Regel:** Zusatz zu Regel-001 (Teil C)
- **Nachtrag 2026-09-26 (Eigentümer):** ShellCheck als lokaler Pre-Commit-Hook über das PyPI-Paket shellcheck-py 0.11.0.1 in der Entwicklungsgruppe (ShellCheck 0.11.0, MIT, erschienen 2025-08-09) aufgenommen – der Hook aus dem Git-Repository von shellcheck-py scheiterte, weil sein Bau das Programm von GitHub lädt, was die Arbeitsumgebung sperrt – Pflicht G aus `CLAUDE.md` Abschnitt 15 für `scripts/session-start.sh` (über der Komplexitätsschwelle). Versionswahl nach dem Zusatz zu Regel-001: ShellCheck liefert Korrekturen als Unterversionen (0.9, 0.10, 0.11 ohne Fehlerkorrektur-Version), daher die neueste Version.

---

#### ADR-016: YAML-Parser für den Dateikopf – PyYAML

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[STACK]` `[DATENMODELL]`
- **Phasentyp-Kontext:** UMSETZUNG (Schritt 2.2)
- **Reifegrad-Wirkung:** keine (storage bleibt `[BELASTBAR]`; Beförderung durch Umsetzung in 2.2)
- **Kategorie:** Externe Abhängigkeiten (3)
- **Kontext:** `storage` liest und schreibt den YAML-Kopf der Markdown-Dateien (`docs/architecture.md` Abschnitt 7); die Standardbibliothek hat keinen YAML-Parser. Probelauf auf Python 3.14.7 (Logbuch 18:35): PyYAML 6.0.3 liest nach YAML 1.1 (`No` → `False`, `012` → `10`), schreibt mehrdeutige Werte aber gequotet; ruamel.yaml 0.19.1 liest nach YAML 1.2 und erhält Kommentare, schreibt `No` aber ungequotet.
- **Optionen:**
  - **A:** PyYAML 6.0.3 (MIT) mit `types-PyYAML` 6.0.12.20260906 (Apache-2.0, nur Typprüfung); Lesen mit einem strengen sicheren Lader, der mehrdeutige Werte (YAML-1.1-Wahrheitswörter außer `true`/`false`, Zahlen mit führender Null, Unterstrich, Sexagesimal-, Oktal-, Hex- oder Binärschreibweise) mit `InvalidInput` ablehnt – Konsequenzen: eindeutige Dateien für jeden Leser; handgeschriebene Kommentare im Kopf gehen beim Speichern verloren.
  - **B:** ruamel.yaml 0.19.1 (MIT, YAML 1.2) – Konsequenzen: Kommentare und Reihenfolge bleiben erhalten; YAML-1.1-Leser können geschriebene Werte anders deuten; ein Hauptentwickler.
- **Entscheidung:** A.
- **Vision-Frage, die entschied:** „Wirst du die Welt- und Kapiteldateien außerhalb des Skriptoriums von Hand bearbeiten und dabei Kommentare in den Dateikopf schreiben?" → Antwort des Eigentümers: Option A (PyYAML) gewählt.
- **Konfidenz zum Zeitpunkt:** mittel-hoch – beide im Probelauf geprüft; Umkehrbarkeit billig (Parser steckt allein hinter `DocumentStore`, Dateien bleiben gewöhnliches YAML).
- **Konsequenzen:**
  - Laufzeit-Abhängigkeit `pyyaml>=6.0.3,<7`, Entwicklungs-Abhängigkeit `types-pyyaml` (Datumsversion von typeshed, Regel-001: neueste).
  - Kommentare im Dateikopf werden beim Zurückschreiben nicht erhalten; im Onboarding bzw. Nutzerhinweis vermerken, sobald die Oberfläche das Bearbeiten erlaubt (2.7).
- **Abgeleitete Regel:** keine

---

#### ADR-017: Anmeldung und Sitzung – selbst gewähltes Passwort ohne zweiten Faktor

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[SECURITY]` `[SCHNITTSTELLE]` `[DATENMODELL]`
- **Phasentyp-Kontext:** UMSETZUNG (Schritt 2.6, im Fahrplan als „ADR zu Passwort-Hashing und Sitzung" vorgesehen)
- **Reifegrad-Wirkung:** keine (`api` bleibt `[BELASTBAR]`; Beförderung durch Umsetzung in 2.6)
- **Kategorie:** Sicherheit und Datenschutz (6), Datenmodell (4), API-Vertrag (5), Externe Abhängigkeiten (3), Lizenz (8)
- **Kontext:** ADR-006 legt für Anmeldung und Sitzung ASVS 5.0.0 Stufe 2 fest. Die Prüfung am Original (OWASP/ASVS, Tag `v5.0.0`, Logbuch 19:45) ergab Anforderungen, die der Plan („Passwort und Sitzungs-Cookie", Hash in einer Umgebungsvariablen) nicht abdeckte: Mehr-Faktor-Anmeldung oder begründete Abweichung (6.3.3), Passwort ändern (6.2.2, 6.2.3), Sitzungsübersicht mit Beenden (7.5.2), dokumentierte Sitzungsdauer (7.1.1, 7.3.1, 7.3.2) und parallele Sitzungen (7.1.2).
- **Optionen und Entscheidung** (Vorschlag der KI, Antworten des Eigentümers per Antwortsystem):
  - **Zweiter Faktor:** A nur Passwort mit begründeter Abweichung / B zusätzlich TOTP-Code mit Notfall-Codes → **A** (Empfehlung der KI).
  - **Passwort:** A vom Server erzeugt / B selbst gewählt mit Prüfung gegen häufige und geleakte Passwörter / C Hash in Umgebungsvariable, Ändern per Server-Befehl → **B** (Empfehlung der KI war A).
  - **Prüfung gegen geleakte Passwörter bei B:** A Have I Been Pwned „Pwned Passwords" / B Offline-Liste im Repo / C Offline-Liste plus Verzicht auf 6.2.12 → **A** (Empfehlung der KI).
  - **Sitzungsdauer:** A 7 Tage Inaktivität, 30 Tage höchstens / B 30 Minuten, 12 Stunden → **A** (Empfehlung der KI).
  - **Optional (über Stufe 1 hinaus, ASVS 16.3.1):** Anmeldeversuche protokollieren → **ja** (Empfehlung der KI).
- **Festlegungen:**
  - **Abweichung von 6.3.3 (kein zweiter Faktor), Begründung:** ein Nutzer, Schutzbedarf normal (ADR-007); das wertvollste Gut, der API-Schlüssel, ist über die Anmeldung nicht erreichbar, Missbrauch der KI-Funktionen ist durch die Ausgabengrenze am Schlüssel gedeckelt. **Ausgleichende Maßnahmen:** Passwort mindestens 15 Zeichen und geprüft gegen rund eine Milliarde geleakter Passwörter; Sperre je Absender nach Fehlversuchen; nur über TLS; Sicherungen (4.3). **Restrisiko:** Wer das Passwort erbeutet (z. B. über eine gefälschte Seite), kann Welten und Manuskripte lesen und ändern. Nachrüsten eines zweiten Faktors ist ohne Datenumbau möglich.
  - **Passwort (V6):** selbst gewählt, 15 bis 128 Zeichen, jede Zeichenart, keine Zeichenregeln, unverändert geprüft (6.2.1, 6.2.5, 6.2.8, 6.2.9); keine erzwungene Rotation (6.2.10); Ändern nur mit dem bisherigen Passwort (6.2.3, 7.5.1), danach wahlweise alle anderen Sitzungen beenden (7.4.3). Abgelehnt werden Passwörter, die in Pwned Passwords vorkommen (6.2.4, 6.2.12), und solche, die ein Kontextwort enthalten: „skriptorium", „passwort", „password" und die Namen der eigenen Welten (6.1.2, 6.2.11). Ist Pwned Passwords nicht erreichbar, wird das Festlegen abgelehnt. Kein Benutzername, kein Standardkonto (6.3.2).
  - **Pwned Passwords:** Abfrage `https://api.pwnedpasswords.com/range/<5 Zeichen>` mit `Add-Padding: true`; nur die ersten 5 Hex-Zeichen des SHA-1-Hashes verlassen den Server (k-Anonymität); nur beim Festlegen oder Ändern. Daten unter CC BY 4.0 – Namensnennung am Passwortfeld (2.7) und in der README. Kostenlos, ohne Schlüssel (Nutzungsbedingungen auf haveibeenpwned.com/API/v3, abgerufen 2026-09-26). HTTP-Client httpx 0.28 (bereits fixiert, wandert in die Laufzeit-Abhängigkeiten).
  - **Erstes Passwort und Zurücksetzen (6.4.1, 6.4.3):** Ein Befehl auf dem Server (`skriptorium-einrichtung`) erzeugt einen Einrichtungscode (128 Bit Zufall), speichert nur dessen Hash und zeigt ihn einmal an; der Code gilt 24 Stunden und nur einmal. Mit ihm wird in der Oberfläche das Passwort festgelegt; dabei enden alle Sitzungen. Derselbe Weg dient bei vergessenem Passwort – wer den Befehl ausführen kann, hat ohnehin Zugriff auf den Server.
  - **Ablage (Datenmodell):** `system/zugang.md` im Datenverzeichnis mit den Kopffeldern `passwort_hash`, `passwort_geaendert`, `einrichtungscode_hash`, `einrichtungscode_gueltig_bis`; wird mitgesichert, nicht indexiert. Hash-Verfahren scrypt aus der Standardbibliothek mit N = 2^17, r = 8, p = 1, 16 Byte Salz (11.4.2, ASVS Anhang C). Höchstens zwei Hash-Berechnungen gleichzeitig (Speicher 128 MiB je Berechnung).
  - **Sitzung (V7):** Referenz-Token mit 256 Bit Zufall aus `secrets` (7.2.3, 11.5.1), neu bei jeder Anmeldung (7.2.4), nur im Server geprüft (7.2.1); im Speicher des Servers gehalten – ein Neustart meldet ab. Abmelden oder Ablauf entfernt die Sitzung am Server (7.4.1). Inaktivität 7 Tage, Höchstdauer 30 Tage (7.3.1, 7.3.2) – **Begründung der Abweichung von NIST SP 800-63B AAL2** (7.1.1): ein Faktor entspricht AAL1, deren Höchstdauer 30 Tage ist; Schreibsitzungen auf mehreren Geräten. Höchstens 5 parallele Sitzungen, bei der sechsten endet die älteste (7.1.2). Übersicht der Sitzungen mit Beenden einzelner oder aller anderen (7.5.2, 7.4.5); Abmelden auf jeder Seite der Oberfläche (7.4.4, Schritt 2.7). Neue Sitzung nur durch ausdrückliche Anmeldung (7.6.2). Keine föderierte Anmeldung (7.1.3, 7.6.1 entfallen).
  - **Cookie (V3, Stufe 1 bzw. 2):** Name `__Host-sitzung`, `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/`, ohne `Domain` (3.3.1–3.3.4).
  - **Fremdaufrufe (3.5.1–3.5.3):** Ändernde Anfragen (POST, PUT, PATCH, DELETE) brauchen einen `Origin`-Kopf, der zum eigenen Host passt, und – mit Inhalt – `Content-Type: application/json`; lesende Anfragen ändern nichts. Keine CORS-Kopfzeilen (3.4.2). HSTS mit einem Jahr und Subdomains (3.4.1).
  - **Schutz vor Raten (6.1.1, 6.3.1):** je Absender-Adresse höchstens 10 Fehlversuche in 15 Minuten, danach Antwort 429 bis zum Ende des Fensters; keine Gesamtsperre, damit ein Fremder den Eigentümer nicht aussperren kann. Gilt für Anmeldung, Passwortänderung und Einrichtungscode. Hinter dem Reverse Proxy (4.2) liefert uvicorn die echte Adresse (`--proxy-headers`).
  - **Protokoll:** Jede Anmeldung, jeder Passwortwechsel und jede Einrichtung wird mit Zeit, Absender-Adresse, Vorgang und Ergebnis protokolliert, nie mit Passwort, Code oder Token (16.3.1, optional freigegeben).
  - **HTTP-API:** zusätzliche Endpunkte über den Grobvertrag hinaus – ohne Sitzung: Einrichtung mit Code; mit Sitzung: eigene Sitzung lesen, Passwort ändern, Sitzungen auflisten und beenden. Pfade in `docs/architecture.md` Abschnitt 4.
- **Vision-Frage, die entschied:** „Wie schlimm wäre es für dich, wenn jemand mit deinem gestohlenen Passwort deine Welten und Manuskripte liest oder ändert – so schlimm, dass du bei jeder Neuanmeldung die Handy-App nutzen willst?" → kein zweiter Faktor. „Ist es in Ordnung, dass beim Passwortwechsel ein Bruchstück des Passwort-Fingerabdrucks an Have I Been Pwned geht?" → ja.
- **Konfidenz zum Zeitpunkt:** mittel – Anforderungen am Original geprüft; „Abweichung statt zweitem Faktor" ist ein Risikourteil. Umkehrbarkeit: billig.
- **Konsequenzen:**
  - Neue Umgebungsvariable `SKRIPTORIUM_DATA_DIR` (Datenverzeichnis), `.env.example` und README im selben Commit.
  - Architektur: neue Beziehungen `api → storage` (nur `system/`) und `api → Pwned Passwords` – ADR-018.
  - Oberfläche (2.7): Einrichtung, Anmeldung, Passwort ändern, Sitzungsübersicht, Abmelden auf jeder Seite, Namensnennung am Passwortfeld.
  - Die Architektur-Angabe „Passwort-Hash als Umgebungsvariable" (Abschnitt 6, project-context Abschnitt 6) ist ersetzt.
- **Abgeleitete Regel:** keine

---

#### ADR-018: Beziehungen api → storage (Zugangsdaten) und api → Pwned Passwords

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer (mit ADR-017 freigegeben)
- **Status:** Aktiv
- **Tags:** `[REAKTIV]` `[MODUL]` `[SECURITY]`
- **Phasentyp-Kontext:** UMSETZUNG (Schritt 2.6) – nicht in der Phasenplanung vorgesehen, daher `[REAKTIV]`
- **Reifegrad-Wirkung:** Modul-Karte bleibt `[BELASTBAR]`; die neuen Beziehungen sind durch ADR-017 und die Umsetzung in 2.6 belegt
- **Kategorie:** Architekturänderung (1)
- **Kontext:** Mit selbst gewähltem, in der Oberfläche änderbarem Passwort (ADR-017) muss `api` den Passwort-Hash dauerhaft ablegen und neue Passwörter bei Pwned Passwords prüfen. Die Modul-Karte kennt weder `api → storage` noch einen Fremddienst außer über `ai_gateway`.
- **Optionen:**
  - **A:** `api` nutzt `DocumentStore` direkt, beschränkt auf Pfade unter `system/`; die Pwned-Passwords-Abfrage liegt in `api` (Untermodul für den Zugangsschutz). Keine neue Modulgrenze.
  - **B:** eigenes Modul `access` für Zugangsdaten und Passwortprüfung (Kategorie 2) – mehr Struktur für wenige Funktionen.
  - **C:** Abfrage über `ai_gateway` – widerspricht dessen Leitregel (kennt nur Nachrichten, Modelle, Token).
- **Entscheidung:** A (Empfehlung der KI, Heuristik 1.3: einfachere Option; Zugangsschutz ist laut Modul-Karte Aufgabe von `api`).
- **Vision-Frage, die entschied:** siehe ADR-017 (Passwort selbst wählen, Prüfung über Pwned Passwords).
- **Konfidenz zum Zeitpunkt:** hoch – kleine, klar abgegrenzte Beziehung; Umkehrbarkeit billig (Auslagerung in ein eigenes Modul jederzeit möglich).
- **Konsequenzen:**
  - Modul-Karte: `API -.->|nur system/| STORE` und `API -.->|HTTPS| HIBP`. Leitregel ergänzt: `storage` bleibt die einzige Stelle, die Dateien berührt; `api` schreibt dort nur unter `system/`.
  - `api` hat damit Abhängigkeiten zu fünf Modulen; der Smell „Gott-Modul" (Heuristik 1.4) wird beim Phasenende 2 mitgeprüft.
- **Abgeleitete Regel:** keine

---

#### ADR-019: Test-Werkzeuge der Oberfläche – Testing Library, jsdom, Playwright

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[STACK]` `[METHODIK]`
- **Phasentyp-Kontext:** UMSETZUNG (Schritt 2.7, Abnahme verlangt Komponenten- und End-to-End-Tests)
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Externe Abhängigkeiten (3, nur Entwicklung), Build-Pipeline (7)
- **Kontext:** Vitest prüfte bisher nur statisches HTML. Für 2.7 werden Klicks und Eingaben in Komponenten sowie der Ablauf im echten Browser (Cookie `__Host-sitzung`, Content-Security-Policy) gebraucht. Linien nach Regel-001 gegen die npm-Registry geprüft (2026-09-26): jsdom 30 erst 60 Tage alt → Linie 29.
- **Optionen:**
  - **A:** Komponenten-Tests mit jsdom 29.1.1, @testing-library/react 16.3.3, @testing-library/dom 10.4.2, @testing-library/user-event 14.6.7 (alle MIT) **und** End-to-End mit @playwright/test 1.62.1 (Apache-2.0) gegen echten Server mit gebauter Oberfläche in Chromium; eigener CI-Job.
  - **B:** nur Komponenten-Tests gegen eine nachgebildete API; Abnahmekriterium „End-to-End“ per ADR abschwächen.
- **Entscheidung:** A (Empfehlung der KI).
- **Vision-Frage, die entschied:** „Reicht dir, dass die Einzelteile geprüft sind – oder soll vor jedem Merge automatisch einmal ‚wie du‘ im Browser angemeldet und geschrieben werden?“ → im Browser.
- **Konfidenz zum Zeitpunkt:** hoch. Umkehrbarkeit: billig (nur Entwicklungswerkzeuge).
- **Konsequenzen:**
  - Neuer CI-Job „End-to-End“ installiert Chromium über Playwright und fährt die Abläufe gegen `uvicorn` mit gebauter Oberfläche.
  - In der Cloud-Session ist ein älteres Chromium vorinstalliert (`/opt/pw-browsers`); lokal kann der Pfad über `PLAYWRIGHT_CHROMIUM_EXECUTABLE` gesetzt werden.
  - Das Passwort für End-to-End-Tests wird ohne Pwned-Passwords-Abfrage direkt über `CredentialStore` gesetzt; die Einrichtungs-Maske ist über Komponenten-Tests abgedeckt – der Server erhält dafür keinen Testmodus.
  - Nachprüf-Einträge im Ablaufdaten-Register: jsdom 30 (mindestreif ab 2027-01-27).
  - Nachtrag nach Freigabe des Eigentümers: @types/node 24.19.0 (MIT, nur Typen, Linie Node 24) für die Typprüfung der E2E-Dateien und der Playwright-Konfiguration.
  - Lizenzen (Kategorie 8, Nachtrag nach Freigabe des Eigentümers): MIT-0 (`@csstools/color-helpers`, `@csstools/css-syntax-patches-for-csstree`) und CC0-1.0 (`mdn-data`) kommen transitiv über jsdom; erlaubt nur für Werkzeuge.
- **Abgeleitete Regel:** keine

---

<!-- ANCHOR:teil-c-entscheidungsregeln -->
## Teil C: Entscheidungsregeln

<!-- Regeln für wiederkehrende Fälle, damit die KI in ähnlichen Situationen
     konsistent und ohne Rückfrage handeln kann.
     Jede Regel verweist auf den ADR, aus dem sie entstanden ist.
     ACHTUNG: Teil C gehört zur Mindest-Lektüre nach CLAUDE.md Abschnitt 2 –
     anders als die ADR-Volltexte in Teil B. Wer hier eine Regel einträgt,
     macht sie damit ab der nächsten Session verbindlich wirksam. -->

### Format (Regel)

```text
### Regel-NNN: [Kurztitel]

- **Herkunft:** ADR-[Nr.]
- **Gilt für:** [wann ist diese Regel anzuwenden]
- **Regel:** [was ist zu tun]
- **Ausnahmen:** [wann gilt die Regel nicht; leer lassen, wenn keine]
- **Gegenbeispiel:** [was wäre falsch]
```

### Regeln

#### Regel-001: Versionswahl innerhalb einer Linie

- **Herkunft:** ADR-002
- **Gilt für:** jede Fixierung oder Aktualisierung einer Version von Sprache, Framework, Bibliothek, Laufzeitumgebung oder Werkzeug, nachdem die Linie nach `CLAUDE.md` Abschnitt 15 („Versionswahl") gewählt ist.
- **Regel:** Innerhalb der gewählten Linie wird die neueste Unterversion gewählt, die bereits mindestens eine Fehlerkorrektur-Version hat; bei `0.x`-Paketen die neueste Minor-Version mit mindestens einem Patch-Release. Gepinnt wird auf diese Unterversion (z. B. `>=0.141.1,<0.142`).
- **Zusatz (ADR-015):** Hat eine Linie, die die 6 Monate der Mindestreife erfüllt, keine einzige Fehlerkorrektur-Version (der Hersteller liefert Korrekturen als Unterversionen), gilt ihre neueste Version – z. B. pytest-cov 7.1.0, actions/setup-python v6.3.0.
- **Ausnahmen:** keine
- **Gegenbeispiel:** uvicorn 0.54.0 wählen, weil sie die neueste ist, obwohl sie noch keine Fehlerkorrektur-Version hat (gewählt wurde 0.52.4).

<!-- ANCHOR:teil-d-geschaeftsentscheidungen -->
## Teil D: Geschäftsentscheidungen (BDR)

Entscheidungen, die nicht die Technik betreffen, sondern das Vorhaben. Bei Klasse M optional (ADR-001); geführt für den Kostenrahmen. Nicht Teil der Mindest-Lektüre; gelesen, wenn eine Geschäftsentscheidung ansteht (`CLAUDE.md` Abschnitt 2).

### BDR-001: Kostenrahmen 50 € je Monat

- **Datum:** 2026-09-26
- **Entschieden von:** Eigentümer
- **Frage:** Was darf das Projekt monatlich kosten? (Vision-Frage aus `templates/projektstart.md` Abschnitt 1.3, Schritt 2)
- **Optionen:** keine Optionen vorgelegt; der Eigentümer nannte einen Betrag.
- **Entscheidung:** bis 50 € monatlich für KI-Anfragen und Hosting zusammen. Das Abo für den Coding-Agent ist nicht Teil dieses Rahmens.
- **Folgen für Anforderungen und Fahrplan:** Kostenregister in `docs/project-context.md` Abschnitt 8; Kosten-NFR in `docs/architecture.md` Abschnitt 6; Kosten je Anfrage sind Vergleichsgröße im Modell-Eignungstest (Schritt 1.1); Hosting-Kosten fließen in die Anbieterwahl (Schritt 4.2). Eine Überschreitung der Summe ist eine neue Geschäftsentscheidung.
