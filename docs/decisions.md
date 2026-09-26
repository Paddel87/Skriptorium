# Decisions – Dev-Templates

<!-- Arbeitsdokument von Dev-Templates selbst (Selbstanwendung, ADR-001).
     Die Vorlage für Ziel-Projekte liegt unter templates/docs/decisions.md.
     Klasse K: Teil C bleibt leer, bis sich Muster herauskristallisieren. -->

<!-- ANCHOR:teil-a-adr-uebersicht -->
## Teil A: ADR-Übersicht

| ADR | Datum | Status | Klassifikation | Themen | Kategorie | Kurztitel |
|---|---|---|---|---|---|---|
| 001 | 2026-08-13 | Aktiv | STRATEGISCH | METHODIK | Methodik | Selbstanwendung und Klasse-K-Einstufung |
| 002 | 2026-08-13 | Aktiv | OPERATIV | STACK, METHODIK | Externe Abh. | Markdown-Linter: markdownlint-cli2 über pre-commit |
| 003 | 2026-08-13 | Aktiv | OPERATIV | STACK, DEPLOYMENT, METHODIK | Build-/Deploy-Pipeline | CI: pre-commit/action, Drift-Checks abgespalten |
| 004 | 2026-08-13 | Aktiv | OPERATIV | METHODIK | Lizenz | CC0 1.0 Universal |
| 005 | 2026-08-13 | Aktiv | REAKTIV | METHODIK | Methodik | Modellwechsel-Eskalation wird echter Stopp |
| 006 | 2026-08-28 | Aktiv | STRATEGISCH | METHODIK | Methodik | Vision-Verlust-Lücke geschlossen (Landeplatz-Pflicht, `[VERSCHOBEN]`, Vision-Checkpoints) |
| 007 | 2026-08-28 | Aktiv | OPERATIV | METHODIK | Methodik | Teil C gehört zur Mindest-Lektüre |
| 008 | 2026-09-24 | Aktiv | STRATEGISCH | METHODIK, SECURITY | Methodik | Secrets nicht in der eigenen Ausgabe; Schutzmechanismen durch erzwungenen Fehler belegen (Paket 1, Stufe 1 aus #34) |
| 009 | 2026-09-24 | Aktiv | STRATEGISCH | METHODIK, SECURITY, DEPLOYMENT | Sicherheit / Methodik | Gate vor dem ersten öffentlichen Deployment, Sicherheitsgrundriss in Modus 2 (Paket 1, Stufe 2 aus #34) |
| 010 | 2026-09-24 | Aktiv | STRATEGISCH | METHODIK, STACK | Methodik / Build-Pipeline | Warnungen als Fehler mit schrumpfendem Bestand, Ablaufdaten-Register, Versionswahl „ausgereifte Linie" (Paket 2, Stufe 1 aus #34) |
| 011 | 2026-09-24 | Aktiv | STRATEGISCH | METHODIK | Methodik | Vier Modellklassen, empfohlene Klasse je Schritt, Abgabe an Unteragenten nach Probelauf (Paket 2, Stufe 2 aus #34) |
| 012 | 2026-09-24 | Aktiv | STRATEGISCH | METHODIK | Methodik | Stopp bei Phasen-Wucherung, Pflichtfrage „Weiterbauen, umbauen oder neu aufsetzen?" durch getrennte Instanz, Reaktiv-Klassifikation in der STABILISIERUNG (Paket 3 aus #34) |
| 013 | 2026-09-24 | Aktiv | STRATEGISCH | METHODIK | Methodik | Anforderungsschicht: `requirements.md` ab Klasse M, Modus 1.5 für G/V, Schutzbedarf als Obergrenze, Kostenrahmen, Geschäftsentscheidungen (Paket 4 aus #34, #20 Option D) |
| 014 | 2026-09-24 | Aktiv | STRATEGISCH | METHODIK | Methodik | Abgabe nur, wo sie spart; Grenze der Sessiongröße; Kontingent-Warnung nach Probelauf (Folgerungen aus S-19) |

### Reaktiv-Quote

- **Aktueller Wert:** 1 / 14
- **Schwellenwert (`project-context.md` Abschnitt 6):** 30 %
- **Bei Überschreitung:** STOPP, Reflexion im Fahrplan ergänzen, prüfen ob ein Methodik-Refactoring nötig ist.

---

<!-- ANCHOR:teil-b-architecture-decision-records -->
## Teil B: Architecture Decision Records

### ADR-001: Selbstanwendung der Methodik und Klasse-K-Einstufung

- **Datum:** 2026-08-13
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[METHODIK]`
- **Phasentyp-Kontext:** INITIALISIERUNG
- **Reifegrad-Wirkung:** legt die initialen Reifegrade in `docs/architecture.md` Abschnitt 9 fest
- **Kategorie:** Methodik
- **Kontext:**
  Bis zu dieser Entscheidung lagen die unbefüllten Pflicht-Dokument-Vorlagen unter `docs/`. Damit hatte Dev-Templates keinen Ort, an dem es seine eigenen Betriebsparameter erklären konnte – jede Eintragung in `docs/` hätte die Vorlagen beschädigt und konkrete Werte an alle abgeleiteten Projekte ausgeliefert. Der konkrete Anlass war die Frage, wo die Modellklassen-Zuordnung aus `CLAUDE.md` Abschnitt 0 für dieses Repo hingehört.
- **Optionen:**
  - **A:** Vorlagen bleiben in `docs/`, Dev-Templates deklariert seine Parameter in einer separaten Datei im Repo-Wurzelverzeichnis – Konsequenzen: kleinster Eingriff, aber zwei konkurrierende Orte für Projektkontext und ein Sonderweg, den die Methodik selbst nicht kennt.
  - **B:** Vorlagen wandern nach `templates/docs/`, `docs/` wird zum echten Arbeitsdokumenten-Satz von Dev-Templates – Konsequenzen: größerer Umbau mit Pfad-Änderungen, dafür gilt `CLAUDE.md` danach wortgleich für dieses Repo und für Ziel-Projekte.
  - **C:** Nur die Beispielwerte in den Platzhaltern schärfen, keine Selbstanwendung – Konsequenzen: minimal, aber die Ausgangsfrage bleibt unbeantwortet.
- **Entscheidung:** Option B. Die Methodik verlangt von jedem Projekt einen ausgefüllten Pflicht-Dokument-Satz; ein Vorlagen-Repo, das sich davon ausnimmt, kann seine eigene Praxistauglichkeit nicht prüfen. Nach dem Umbau ist `docs/` in beiden Kontexten dasselbe: der Ort der ausgefüllten Arbeitsdokumente.
- **Vision-Frage, die entschied:** Soll Dev-Templates die eigene Methodik auf sich selbst anwenden, oder bleibt es ein reiner Vorlagen-Lieferant? Antwort des Eigentümers: Selbstanwendung.
- **Konfidenz zum Zeitpunkt:** hoch – Umkehrbarkeit billig. Der Umbau ist ein Verschieben von Dateien mit zwei Referenz-Korrekturen; ein Rückbau wäre symmetrisch und ohne Datenverlust möglich.
- **Klassifikation Klasse K:** ein Bestandteil mit Produktcharakter (das Vorlagen-Set), keine externen Abhängigkeiten, keine Programmiersprache, kein Persistenzlayer, kein Deployment. Damit sind alle Klasse-K-Indikatoren aus `templates/projektstart.md` Abschnitt 2 erfüllt und keiner der Klasse-M-Indikatoren.
- **Konsequenzen:**
  - `templates/docs/` ist ab sofort der Quellort der Vorlagen; `docs/` enthält ausschließlich ausgefüllte Dokumente dieses Repos.
  - `templates/projektstart.md` erhält eine Vorbereitungs-Anweisung: Vorlagen werden vor Schritt 1 nach `docs/` kopiert, statt an Ort und Stelle befüllt zu werden.
  - Die Dokumentstruktur folgt den Klasse-K-Defaults: flache Schrittliste im Fahrplan statt Phasenstruktur, reduzierte Architektur ohne Modul-Karte, `onboarding-runbook.md` entfällt.
  - Verweise in `CLAUDE.md`, `AGENTS.md` und `templates/architektur-heuristiken.md` auf `docs/*.md` bleiben unverändert gültig: Sie meinen den Zielort im jeweiligen Projekt, und der heißt weiterhin `docs/`.
- **Abgeleitete Regel:** keine – Einzelfall-Entscheidung zur Repo-Struktur.

### ADR-002: Markdown-Linter – markdownlint-cli2 über pre-commit

- **Datum:** 2026-08-13
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[STACK]` `[METHODIK]`
- **Phasentyp-Kontext:** STABILISIERUNG
- **Reifegrad-Wirkung:** keine – kein Architektur-Bestandteil betroffen
- **Kategorie:** Externe Abhängigkeiten
- **Kontext:**
  `docs/project-context.md` Abschnitt 5 dokumentierte bis zu diesem ADR „keine externen Abhängigkeiten". S-4 (Markdown-Linter einrichten) durchbricht das erstmals. Zu entscheiden war nicht nur das Werkzeug, sondern auch der Durchsetzungs-Mechanismus, da das Repo weder pre-commit noch CI eingerichtet hatte.
- **Optionen:**
  - **A:** `markdownlint-cli2` (v0.23.2, gegen npm-Registry und den offiziellen `.pre-commit-hooks.yaml` verifiziert) über das pre-commit-Framework, analog zu `templates/pre-commit/*.yaml` – Konsequenzen: Mitwirkende brauchen nur `pre-commit` (Python) installiert, die Node-Laufzeit für den Linter zieht pre-commit sich selbst isoliert. Konsistent mit dem Muster, das dieses Repo bereits für Ziel-Projekte empfiehlt.
  - **B:** `markdownlint-cli2` direkt per npm-Abhängigkeit (`package.json`, `npm install`) – Konsequenzen: konventioneller Weg, aber Node.js wird zur harten lokalen Voraussetzung für jeden, der auch nur Markdown anfasst, in einem Repo ohne jeden anderen Code.
  - **C:** `rumdl` (Rust, statisches Binary, markdownlint-kompatibles Regelwerk) – Konsequenzen: keine Sprach-Laufzeit-Abhängigkeit überhaupt, aber die Reife des Tools war zum Entscheidungszeitpunkt nicht verlässlich einschätzbar (ein einzelner Suchtreffer, nicht selbst geprüft).
- **Entscheidung:** Option A. Bestätigt durch einen Testlauf gegen den realen Repo-Bestand: 915 Treffer im Standard-Regelsatz, davon 891 reine Stil-Fragen (MD013 Zeilenlänge, MD060 Tabellen-Ausrichtung) und 24 echte strukturelle Lücken (fehlende Sprachangabe an Codeblöcken, fehlende Leerzeilen um Listen/Codeblöcke, drei kollidierende Überschriften). Die 24 echten Treffer wurden behoben, die zwei Stil-Regeln dokumentiert deaktiviert (siehe `.markdownlint-cli2.jsonc`).
- **Vision-Frage, die entschied:** n/a – keine Architektur-Entscheidung.
- **Konfidenz zum Zeitpunkt:** n/a – keine Architektur-Entscheidung. Informell: hoch (Heuristik `templates/architektur-heuristiken.md` Teil 1.3 „Eigene Lösung vs. Fremd-Service: weniger Abhängigkeiten gewinnt" direkt anwendbar, offizieller pre-commit-Hook des Projekts belegt das Muster, Umkehrbarkeit billig).
- **Konsequenzen:**
  - `.markdownlint-cli2.jsonc` und `.pre-commit-config.yaml` sind die neuen Konfigurationsdateien dieses Repos.
  - `docs/project-context.md` Abschnitt 7 führt den Linter jetzt als eingerichtet statt als offenen Punkt.
  - S-5 (CI-Pipeline) kann auf demselben pre-commit-Setup aufbauen.
- **Abgeleitete Regel:** keine – Einzelfall-Entscheidung zur Werkzeugwahl.

### ADR-003: CI – pre-commit/action, Drift-Checks von S-5 abgespalten

- **Datum:** 2026-08-13
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[STACK]` `[DEPLOYMENT]` `[METHODIK]`
- **Phasentyp-Kontext:** STABILISIERUNG
- **Reifegrad-Wirkung:** keine – kein Architektur-Bestandteil betroffen
- **Kategorie:** Build- und Deploy-Pipeline
- **Kontext:**
  S-4 (ADR-002) richtete den pre-commit-Hook lokal ein, aber ohne CI ist er nicht erzwungen. S-5s ursprüngliche „Zu tun"-Formulierung nannte zusätzlich die Automatisierung der Inter-Pflicht-Drift-Checks aus `CLAUDE.md` Abschnitt 16 – eine Lücke gegenüber den „Akzeptanzkriterien" desselben Schritts, die das nie forderten. Diese Diskrepanz wurde im `ENTSCHEIDUNG ERFORDERLICH`-Block offengelegt, nicht stillschweigend in eine Richtung aufgelöst.
- **Optionen:**
  - **A:** CI führt nur den bestehenden pre-commit-Hook aus (`pre-commit/action`), Drift-Checks bleiben Sessionende-Disziplin – Konsequenzen: kleiner, sofort abgeschlossener Schritt; Drift-Prüfung bleibt manuell.
  - **B:** Zusätzlich ein neues Hilfsskript, das die fünf Drift-Anker automatisch prüft, plus CI-Job dafür – Konsequenzen: größerer Schritt, eigene Pflichtkategorien A–H aus `CLAUDE.md` Abschnitt 15, eigener Tooling-Inventar-Eintrag.
  - **C:** `pre-commit.ci` (gehostetes SaaS) statt eigenem GitHub-Actions-Job – Konsequenzen: weniger eigener Workflow-Code, aber eine zusätzliche Drittanbieter-Abhängigkeit mit GitHub-App-Berechtigung für ein reines Doku-Repo ohne Bedarf an SaaS-Killerfeatures.
- **Entscheidung:** Option A jetzt, Option B als eigener Fahrplan-Schritt (S-7) statt Anhängsel an S-5. Mechanismus: `pre-commit/action@v3.0.1` mit `actions/checkout@v7.0.1` und `actions/setup-python@v7.0.0`, alle drei Versionen live gegen die jeweiligen GitHub-Releases verifiziert, nicht aus dem Trainingsstand übernommen.
- **Vision-Frage, die entschied:** n/a – keine Architektur-Entscheidung.
- **Konfidenz zum Zeitpunkt:** n/a – keine Architektur-Entscheidung. Informell: hoch für den Mechanismus (lokal simuliert – frisches venv, `pre-commit run --all-files` lief grün auf sauberem Bestand und rot bei absichtlich eingebautem Fehler, Exit-Codes 0 bzw. 1 wie erwartet), mittel für den Scope-Schnitt zwischen A und B, da das eher eine Priorisierungs- als eine Fachfrage war.
- **Konsequenzen:**
  - `.github/workflows/ci.yml` ist der erste CI-Workflow dieses Repos.
  - `docs/project-context.md` Abschnitt 7 führt die CI-Pipeline jetzt als eingerichtet statt als offenen Punkt (mit dem Vorbehalt: nur Linter-Gate, Drift-Checks folgen in S-7).
  - Nebenbefund beim Versions-Check dokumentiert und nicht mitgefixt: `templates/github-workflows/ci-minimal.yml` pinnt ein veraltetes `actions/checkout@v4` – eigener Schritt S-8, da er nur `templates/` betrifft.
- **Abgeleitete Regel:** keine – Einzelfall-Entscheidung zur Werkzeugwahl.

### ADR-004: Lizenz – CC0 1.0 Universal

- **Datum:** 2026-08-13
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[METHODIK]`
- **Phasentyp-Kontext:** STABILISIERUNG
- **Reifegrad-Wirkung:** keine – kein Architektur-Bestandteil betroffen
- **Kategorie:** Lizenz- und Compliance-relevante Änderungen
- **Kontext:**
  `README.md` verwies von Anfang an auf eine `LICENSE`-Datei, die nie existierte. Bei der Aufarbeitung stellte sich heraus, dass das Repo derzeit **privat** ist – keine akute Nutzungsunsicherheit für Dritte, da keine Dritten Zugriff haben. Die frühere Formulierung in `docs/fahrplan.md` S-6 („größte Außenwirkung unter den offenen Schritten") war dadurch überzogen und wurde korrigiert. Die Lücke blieb dennoch real: eine Inkonsistenz zwischen README-Versprechen und Repo-Zustand, die vor einer möglichen Veröffentlichung geschlossen sein sollte.
- **Optionen:**
  - **A:** MIT – Konsequenzen: De-facto-Standard, maximal permissiv, verlangt aber Erhalt von Copyright-Vermerk und Lizenztext bei „Kopien oder wesentlichen Teilen". Für ein Repo, dessen Kernprodukt das Kopieren von Vorlagen in fremde Projekte ist, eine reale Grauzone – müsste streng genommen jedes abgeleitete Projekt einen MIT-Vermerk mitführen? In der Praxis bei Vorlagen-Repos meist ignoriert, aber nicht sauber gelöst.
  - **B:** CC0 1.0 Universal (Public-Domain-Widmung) – Konsequenzen: keinerlei Attributionspflicht, niemand muss beim Kopieren der Vorlagen irgendetwas mitführen. Löst die MIT-Grauzone aus Option A vollständig auf. Nachteil: keine Kontrolle mehr über Weiterverwendung; in manchen Rechtsordnungen (u. a. Deutschland, Urheberpersönlichkeitsrecht) nicht vollständig durchsetzbar – wird dort faktisch wie eine sehr weitgehende Lizenz behandelt, nicht wie echte Rechteaufgabe.
  - **C:** Apache-2.0 – Konsequenzen: permissiv wie MIT, zusätzlich expliziter Patentverzicht/-gewährung und NOTICE-Datei-Pflicht. Der Patent-Teil ist für ein reines Dokumentations-/Methodik-Repo ohne patentfähige Technik gegenstandslos.
- **Entscheidung:** Option B (CC0 1.0 Universal). `LICENSE` live von `creativecommons.org/publicdomain/zero/1.0/legalcode.txt` bezogen (121 Zeilen, vollständiger Rechtstext), nicht aus dem Trainingsstand rekonstruiert.
- **Vision-Frage, die entschied:** n/a – keine Architektur-Entscheidung. Informell die entscheidende Frage: Ist Namensnennung bei Übernahme der Methodik wichtiger, oder reibungslose Weiterverwendung ohne Lizenzpflichten? Antwort des Eigentümers: Letzteres.
- **Konfidenz zum Zeitpunkt:** n/a – keine Architektur-Entscheidung. Informell: mittel. Die rechtliche Einordnung von MIT bei kopierten Vorlagen-Inhalten (Option A) ist eine Grauzone ohne eindeutige Rechtsprechung, die CC0-Durchsetzbarkeits-Einschränkung in einzelnen Rechtsordnungen ist real, aber praktisch folgenlos, da CC0-Lizenzgeber ohnehin keine Rechte geltend machen wollen. Dies ist keine Rechtsberatung – bei echtem Rechtsrisiko (z. B. Repo wird öffentlich, kommerziell genutzt) ist anwaltliche Prüfung angeraten.
- **Konsequenzen:**
  - `LICENSE` im Repo-Root, `README.md` Abschnitt „Lizenz" verweist darauf.
  - `docs/project-context.md` Abschnitt 6 führt die Projektlizenz jetzt als geklärt.
  - Abhängigkeiten (`markdownlint-cli2`, `pre-commit`, beide MIT – live gegen deren `package.json`/`setup.cfg` verifiziert) sind mit CC0 kompatibel, keine Lizenzkonflikte.
- **Abgeleitete Regel:** keine – Einzelfall-Entscheidung zur Lizenzwahl.

### ADR-005: Modellwechsel-Eskalation wird echter Stopp

- **Datum:** 2026-08-13
- **Status:** Aktiv
- **Tags:** `[REAKTIV]` `[METHODIK]`
- **Phasentyp-Kontext:** STABILISIERUNG
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Methodik
- **Kontext:**
  ADR-001 führte mit S-1 die Modellklassen-Disziplin ein. In der Praxis feuerte der `MODELLWECHSEL EMPFOHLEN`-Block dreimal (S-4, S-5, S-6) – und blieb jedes Mal wirkungslos, weil die vorgeschriebene Zeile `Ohne Wechsel` die KI unmittelbar weiterarbeiten ließ. Der Eigentümer benannte das Problem direkt: Um den Hinweis zu nutzen, hätte er die laufende Antwort unterbrechen, `/model` ausführen und die Aufgabe neu anstoßen müssen – in dem Zeitfenster, bevor die Arbeit ohnehin erledigt war. Damit war die Regel Protokoll ohne Wirkung. Ein `[REAKTIV]`-ADR, weil der Auslöser ein Fehlschlag im Betrieb war, nicht geplante Weiterentwicklung.
- **Optionen:**
  - **A:** Eskalations-Stopp nur noch bei Stopp-Kriterium 8 (Konfidenz niedrig **und** Umkehrbarkeit teuer), die übrigen fünf Auslöser nur noch nachträglich protokollieren – Konsequenzen: weniger Reibung, aber die meisten Freigabe-Entscheidungen fielen weiterhin auf der Routine-Klasse.
  - **B:** Live-Hinweis ganz streichen, Modellklasse nur noch rückblickend in ADRs und Logbuch vermerken – Konsequenzen: minimale Reibung, aber die Regel verlöre ihren einzigen Zweck.
  - **C:** Eskalation wird ein echter, blockierender Stopp: keine Ersatzhandlung, Warten auf Antwort, Bestätigung der aktiven Klasse beim Wiederanlauf – Konsequenzen: die Regel wirkt tatsächlich, kostet aber eine Unterbrechung pro Auslöser. Setzt voraus, dass die KI einen Modellwechsel verlässlich bemerkt.
- **Entscheidung:** Option C, auf ausdrücklichen Wunsch des Eigentümers. Die technische Voraussetzung wurde vorher geprüft, nicht angenommen: Ein Modellwechsel per Werkzeug-Befehl erzeugt eine Mitteilung im Systemkontext, die die KI liest. In einem Test mit zwei aufeinanderfolgenden Wechseln (Entscheidungs-Klasse → Routine-Klasse → Entscheidungs-Klasse) wurden beide korrekt erkannt und benannt.
- **Vision-Frage, die entschied:** n/a – keine Architektur-Entscheidung. Die entscheidende Frage war: Soll ein Entscheidungspunkt, den der Mensch praktisch nicht wahrnehmen kann, überhaupt existieren? Antwort: nein – entweder echter Stopp oder keine Regel.
- **Konfidenz zum Zeitpunkt:** n/a – keine Architektur-Entscheidung. Informell: hoch für den Mechanismus (Erkennung im Test zweifach bestätigt), mittel für die Reibungs-Abwägung – ob ein Stopp bei allen sechs Auslösern verhältnismäßig ist, wird sich erst über mehrere Sessions zeigen. Die Escape-Zeile („sag es ausdrücklich") verhindert immerhin einen Deadlock.
- **Konsequenzen:**
  - Der Block heißt jetzt `STOPP – MODELLWECHSEL ERFORDERLICH` und trägt keine `Ohne Wechsel`-Zeile mehr.
  - Beim Wiederanlauf benennt die KI zuerst die aktive Klasse, bevor sie weiterarbeitet.
  - Die Rückstufung bleibt bewusst ein nicht-blockierender Hinweis – sie betrifft Wirtschaftlichkeit, nicht Korrektheit.
  - `CLAUDE.md` Abschnitt 0 dokumentiert neu, **woher** die KI ihre Modellklasse kennt, und benennt die zwei Grenzen dieser Erkennung offen (stiller Tausch ohne Mitteilung; widersprüchliche Angaben).
- **Abgeleitete Regel:** Ein Entscheidungspunkt, den der Mensch im tatsächlichen Arbeitsablauf nicht wahrnehmen kann, ist kein Entscheidungspunkt. Regeln dieser Art entweder blockierend bauen oder weglassen – siehe Regel-001 in Teil C.

### ADR-006: Vision-Verlust-Lücke geschlossen – Landeplatz-Pflicht, `[VERSCHOBEN]`, Vision-Checkpoints

- **Datum:** 2026-08-28
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[METHODIK]`
- **Phasentyp-Kontext:** STABILISIERUNG
- **Reifegrad-Wirkung:** keine Änderung der Reifegrade; ergänzt die Validierungs-Belege des Bestandteils „Regelwerk" um den Pilot-Einsatz von A1
- **Kategorie:** Methodik
- **Kontext:**
  Im Pilotprojekt EB-Digital (Klasse G) ergab ein Vision-Gap-Audit am 2026-06-25, kurz vor dem ersten Roll-out: von 68 nachverfolgbaren Vision-Features waren 6 nie gebaut worden. Sie waren nicht gestreut, sondern konzentriert – vier bildeten einen Cluster um eine nie gebaute Live-Pipeline, zwei standen einzeln. Der schwerste Einzelfall war eine Kern-Kommunikationsfunktion, die **dreifach** in `vision.md` verankert war; ihr Transport-Topic war seit einer frühen Phase reserviert, aber ohne Produzent, ohne Endpunkt, ohne Oberfläche – und in keiner Phase als Schritt geplant. Ohne das Audit wäre der Pilot ohne diese Funktion gestartet.
  Die Wurzel ist in einem Satz fassbar: **die Verschiebung zeigte auf einen Phasen-Namen statt auf eine Schritt-ID.** Eine Phase ist ein Container ohne Inhaltsgarantie. Verstärkt wurde der Verlust dadurch, dass ein abgeleitetes Statusdokument fälschlich behauptete, ein nie gebautes Feature sei „in Schritt 4.3 erledigt" – ein Spiegel-Dokument hatte einen falschen Fertig-Zustand zementiert.
  Die methodische Lücke: Es gab keinen erzwungenen Re-Abgleich gegen die **Quelle**. `vision.md` wird nach Abschnitt 2 einmalig gelesen; danach prüfte nichts mehr, ob jedes Vision-Element noch einem Landeplatz zugeordnet ist. Die Verschiebungs-Disziplin verließ sich auf informelle Sorgfalt – und die fällt über mehrere Phasen hinweg zuverlässig durch.
- **Optionen:**
  - **A:** Nichts ändern, auf Sorgfalt vertrauen – Konsequenzen: null Aufwand, aber der Pilot hat belegt, dass genau das nicht trägt. Der Fehler ist zudem still: Er zeigt sich erst am Release-Termin.
  - **B:** Ein dauerhaftes Vision-Matrix-Dokument einführen, das den Abdeckungsstand spiegelt – Konsequenzen: gut auffindbar, aber es driftet. Genau dieses Muster (abgeleitetes Dokument behauptet einen Fertig-Zustand) hat den Verlust im Piloten verschleiert.
  - **C:** Drei minimale Eingriffe an bestehenden Hook-Punkten: harte Regel in Abschnitt 6, Status-Marker in Abschnitt 7, Re-Derivations-Pass gegen die Quelle in Abschnitt 12 – Konsequenzen: kein neuer Apparat, keine neue Pflege-Schuld; dafür kostet der Pass an jeder Phasengrenze eine vollständige Vision-Lektüre.
- **Entscheidung:** Option C, im Wortlaut der im Piloten produktiven Fassung. Drei Bausteine: (1) Abschnitt 6 „Keine Verschiebung ohne Landeplatz" samt Diagnose-Heuristik, (2) Abschnitt 7 Marker `[VERSCHOBEN]` mit Pflicht zur Ziel-Schritt-ID, (3) Abschnitt 12 zwei Pflicht-Checkpoints – Re-Derivation an jeder Phasengrenze und ein Go-Live-Gate.
  Zwei Detail-Festlegungen tragen die Entscheidung: **gegen die Quelle statt gegen einen Spiegel** (adressiert den Drift-Verstärker) und **an Phasengrenzen statt pro Session** (sonst verliert `vision.md` ihren „einmalig gelesen"-Status, das Pflichtlektüre-Budget wächst, und der Abgleich wird zum Gummistempel).
- **Bewusst nicht übernommen:** Ein Vision-Anker in der Drift-Tabelle aus Abschnitt 16 – sie prüft Pflicht-Dokumente gegeneinander, ein Vision-Eintrag dort wäre wieder ein Spiegel. Die projektspezifische Traceability-Tabelle (A1.4 des Postmortems) wird in Abschnitt 12 nur als zulässiges abgeleitetes Werkzeug erwähnt, nicht als Vorlagen-Pflicht; als Pflicht-Artefakt würde sie zur autoritativen Quelle und damit zum nächsten driftenden Spiegel. Eine Descope-ADR-Pflicht für jede Vision-Abgrenzung wurde ebenfalls verworfen: Eine bewusste Abgrenzung ist kein Verlust und braucht keinen ADR-Apparat.
- **Vision-Frage, die entschied:** Soll die Vorlage garantieren, dass kein zugesagtes Vision-Element ungeplant liegen bleibt – auch um den Preis einer vollständigen Vision-Lektüre an jeder Phasengrenze? Antwort des Eigentümers: ja, umsetzen.
- **Konfidenz zum Zeitpunkt:** hoch – die Regeln sind seit 2026-06-25 im Piloten produktiv und mussten dort nicht nachgebessert werden; nach dem Reifegrad-System in `docs/architecture.md` Abschnitt 0 ist das Bewährung im Einsatz. Umkehrbarkeit billig: drei textliche Ergänzungen ohne Datenwirkung.
- **Konsequenzen:** Jede Phasengrenze kostet zusätzlich eine vollständige `vision.md`-Lektüre. Projekte der Klasse K ohne Phasenstruktur wenden den Pass beim Abschluss eines zusammenhängenden Schritt-Bündels an. Bestehende Projekte müssen einmalig prüfen, ob es bereits verwaiste Vision-Elemente gibt – die Regel wirkt ab jetzt, heilt aber nichts rückwirkend.
- **Herkunft:** Sammel-Issue [#19](https://github.com/Paddel87/Dev-Templates/issues/19) Teil A1, Postmortem `docs/methodik-feedback/vision-gap-postmortem.md` im Pilot-Repo. Der Befund lag seit 2026-07-16 vor und blieb liegen, weil er mit den bereits erledigten Patches P1–P8 in einem Issue gebündelt war – das Issue sah dadurch weitgehend abgearbeitet aus. Weiterhin offen aus demselben Issue: A2 (WIP-Branch-Sichtbarkeit), gemeinsam mit Issue [#14](https://github.com/Paddel87/Dev-Templates/issues/14) zu behandeln.

### ADR-007: Teil C von `decisions.md` gehört zur Mindest-Lektüre

- **Datum:** 2026-08-28
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[METHODIK]`
- **Phasentyp-Kontext:** STABILISIERUNG
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Methodik
- **Kontext:**
  Abschnitt 2 Punkt 5 lautete: „nur **Teil A (ADR-Übersicht und Reaktiv-Quote)**. Einzelne ADR-Einträge in Teil B werden nicht gelesen." Teil C (Entscheidungsregeln) kam in dem Satz **gar nicht vor** – weder als zu lesen noch als ausgeschlossen. Er fiel damit strukturell durch: Die Aufzählung wirkt abschließend, also liest ihn niemand.
  Das ist kein theoretischer Mangel. Teil C führt dauerhaft geltende Betriebsregeln, die aus ADRs hervorgegangen sind und im Alltag laufend angewendet werden. Im Pilotprojekt EB-Digital waren 36 solcher Regeln betroffen; dort wurde die Lücke durch einen projektlokalen Zusatz zur Mindest-Lektüre notdürftig geflickt. In diesem Repo betrifft es seit ADR-005 `Regel-001` – die Regel, nach der jede neue Regel mit Entscheidungspunkt blockierend gebaut oder weggelassen werden muss. Sie wäre in der Pflichtlektüre dieser Session nach altem Wortlaut nicht enthalten gewesen, obwohl in dieser Session zwei neue Regeln entstanden sind.
- **Optionen:**
  - **A:** Teil C zur Vertiefung auf Anforderung erklären – Konsequenzen: billig, aber falsch. Eine Vertiefung braucht einen konkreten Auslöser; eine Betriebsregel wirkt gerade dann, wenn niemand nach ihr sucht.
  - **B:** Teil C in die Mindest-Lektüre aufnehmen – Konsequenzen: Pflichtlektüre wächst um die Länge des Regel-Registers; dafür sind verbindliche Regeln ab der nächsten Session tatsächlich wirksam.
  - **C:** Regeln aus Teil C nach `project-context.md` verschieben, das ohnehin vollständig gelesen wird – Konsequenzen: löst das Leseproblem, zerreißt aber den Zusammenhang zwischen einer Regel und dem ADR, aus dem sie stammt.
- **Entscheidung:** Option B. Der Wortlaut nennt Teil C jetzt ausdrücklich, grenzt ihn gegen Teil B ab und begründet die Einordnung. Für den Fall, dass Teil C über das Lesbare hinauswächst, verweist der Satz auf die Archivierung nach Abschnitt 14 – ausdrücklich als Auslagerungs-Fall, nicht als Erlaubnis zum Überspringen. Die Vorlage `templates/docs/decisions.md` trägt den Hinweis an der Teil-C-Überschrift, damit die Lesepflicht dort sichtbar ist, wo Regeln eingetragen werden.
- **Vision-Frage, die entschied:** Sollen Betriebsregeln, die die KI ohne Rückfrage anwenden soll, garantiert gelesen werden – auch wenn das die Pflichtlektüre wachsen lässt? Antwort des Eigentümers: ja, umsetzen.
- **Konfidenz zum Zeitpunkt:** hoch – der Defekt ist am Wortlaut selbst nachweisbar, nicht interpretationsabhängig. Umkehrbarkeit billig: ein Satz.
- **Konsequenzen:** Die Mindest-Lektüre wächst um Teil C. Bei Klasse K ist das derzeit ein Eintrag. Projekte, die Teil C bereits gefüllt haben, ohne ihn zu lesen, sollten ihn einmalig durchgehen – möglicherweise gelten dort Regeln, die faktisch nie angewendet wurden.
- **Herkunft:** Beobachtet im Pilotprojekt EB-Digital, dort dokumentiert als Lektüre-Ergänzung in dessen `project-context.md` Abschnitt 0. Nicht Bestandteil von Issue [#19](https://github.com/Paddel87/Dev-Templates/issues/19).

### ADR-008: Secrets nicht in der eigenen Ausgabe; Schutzmechanismen durch erzwungenen Fehler belegen

- **Datum:** 2026-09-24
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[METHODIK]` `[SECURITY]`
- **Phasentyp-Kontext:** STABILISIERUNG
- **Reifegrad-Wirkung:** keine am Regelwerk selbst; für Ziel-Projekte verschärft sich die Beförderungsregel für Schutzmechanismen.
- **Kategorie:** Methodik (berührt `CLAUDE.md` §4 Nr. 6 Sicherheit)
- **Kontext:**
  Issue [#34](https://github.com/Paddel87/Dev-Templates/issues/34) sammelt 15 im Pilotprojekt EB-Digital belegte Methodik-Lücken. Die Triage des Eigentümers (2026-09-24) legt „Sicherheit und Betrieb" als erstes Paket fest (Punkte 9, 13, 5, 8, 11). Dieser ADR setzt dessen erste Stufe um, die Punkte 9 und 13. Belege:
  - **Punkt 9:** Am 2026-09-22 gab die KI beim Auslesen einer Konfiguration das SMTP-Passwort im Klartext aus. Am 2026-09-24, neun Tage vor dem Pilot, stehen dort drei Passwortwechsel offen. Die bestehende Regel „Secrets niemals im Code oder Log" dachte an Code und Logdateien, nicht an die Ausgabe des Agenten selbst.
  - **Punkt 13:** Der Alarmweg des Pilotprojekts war monatelang tot – Mails wurden angenommen und still verworfen –, während alle Prüfungen grün waren. Erst ein erzwungener Ausfall hat es gezeigt. Am selben Tag lief eine neue Deploy-Prüfung bei ihrem eigenen Release nicht mit. Schutzmechanismen prüfen Zustände, die im Normalbetrieb nicht eintreten; ihr grünes Ergebnis belegt nichts über den Fehlerfall.
- **Optionen (Vorlage an den Eigentümer, Paket 1 als Ganzes):**
  - **A:** Das ganze Paket in einem Schritt (zwei Regeln in §6 plus Gate vor dem ersten öffentlichen Deployment in §12 plus Vorlagen) – Konsequenzen: in einem Zug fertig, aber als großer Wurf schwer gegenzulesen.
  - **B:** Zwei Stufen: zuerst die zwei Regeln in §6 (Punkte 9 und 13), danach das Gate mit den Vorlagen (Punkte 5, 8, 11) – Konsequenzen: schneller Schutz auch für laufende Projekte, kleinere Prüfeinheiten; zwei ADRs und zwei PRs.
  - **C:** Nur das Gate als Checkliste in den Vorlagen, ohne Regeln in `CLAUDE.md` – Konsequenzen: geringster Eingriff, aber eine Lese-Pflicht, die im Pilotprojekt nicht getragen hat; Punkt 9 gar nicht abgedeckt.
- **Entscheidung:** Option B, freigegeben durch den Eigentümer am 2026-09-24. Dieser ADR ist Stufe 1:
  - `CLAUDE.md` §6 neue harte Regel **„Secrets auch nicht in der eigenen Ausgabe"**: nur Vorhandensein prüfen, nie den Wert; Befehle so bauen, dass sie keine Werte anzeigen; ein trotzdem ausgegebenes Secret gilt als kompromittiert → STOPP, Meldung, Rotations-Schritt mit Frist.
  - `CLAUDE.md` §6 neue harte Regel **„Schutzmechanismen durch erzwungenen Fehler belegen"**: Beförderung auf `[BELASTBAR]` erst nach einem vollständig durchlaufenen, absichtlich herbeigeführten Fehlerfall; ein ADR allein genügt hier nicht; Wiederholung nach jeder Änderung.
  - `templates/docs/architecture.md` Beförderungsregel: Ausnahme für Schutzmechanismen mit Verweis auf §6.
  - Stufe 2 (Gate, Punkte 5, 8, 11) ist als eigener Fahrplan-Schritt **S-14** angelegt.
- **Vision-Frage, die entschied:** Soll die Vorlage einen Nicht-Programmierer vor dem ersten öffentlichen Deployment verbindlich anhalten – auch wenn das den ersten Go-Live um Tage verzögert? Der Eigentümer wählte die gestufte Umsetzung, die die sofort wirksamen Regeln vorzieht.
- **Konfidenz zum Zeitpunkt:** hoch für die beiden Regeln (am Pilotprojekt belegt, reiner Regeltext, keine Technik vorausgesetzt); mittel für das Gate aus Stufe 2 (Formulierung noch an keinem zweiten Projekt erprobt). Umkehrbarkeit billig: Text.
- **Konsequenzen:**
  - Beide Regeln folgen `Regel-001`: Die Secret-Regel baut den Entscheidungspunkt als echten STOPP; die Fehlerfall-Regel hat keinen Entscheidungspunkt für den Menschen.
  - Projekte, die die Vorlage übernehmen, müssen bereits als `[BELASTBAR]` geführte Schutzmechanismen einmal durch einen erzwungenen Fehlerfall prüfen oder zurückstufen. Im Pilotprojekt betrifft das u. a. Alarmweg und Schwellenüberwachung.
  - Die Secret-Regel verlangt keine Werkzeuge; sie bleibt werkzeug- und modellneutral.
- **Herkunft:** Pilotprojekt EB-Digital, Issue #34 Punkte 9 und 13, Triage vom 2026-09-24.

---

### ADR-009: Gate vor dem ersten öffentlichen Deployment, Sicherheitsgrundriss in Modus 2

- **Datum:** 2026-09-24
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[METHODIK]` `[SECURITY]` `[DEPLOYMENT]`
- **Phasentyp-Kontext:** STABILISIERUNG
- **Reifegrad-Wirkung:** keine am Regelwerk selbst; Ziel-Projekte bekommen neue Architektur-Rubriken (Host, Netz, Secrets im Betrieb, Backups, Sicherheitsniveau) mit eigenem Reifegrad.
- **Kategorie:** Sicherheit und Datenschutz (`CLAUDE.md` §4 Nr. 6), Methodik
- **Kontext:**
  Stufe 2 von Paket 1 aus Issue [#34](https://github.com/Paddel87/Dev-Templates/issues/34) (Punkte 5, 8, 11 samt Ergänzung zum Kontingent-Fenster), angelegt als S-14 durch ADR-008. Belege aus dem Pilotprojekt EB-Digital:
  - **Punkt 5:** erstes Deployment am 25.06., Bedrohungsmodell für das Gesamtsystem erst am 09.09., Sicherheitsniveau erst am 20.09.; Host-Firewall, Secrets-Härtung und verschlüsselte Backups Wochen nach dem ersten Deployment. Die Vorlage führte die Sicherheits-Review als Akzeptanzkriterium der STABILISIERUNG, also nach dem Bau, und kannte keine Rubriken für Host, Netz, Secrets im Betrieb und Backups.
  - **Punkt 8:** Alle Reviews machte dieselbe KI, die den Code schrieb; die geplante externe Review wurde durch eine KI-interne ersetzt.
  - **Punkt 11 samt Ergänzung:** Der Eigentümer ist am Pilottag dienstlich gebunden; die Betriebs-KI läuft über denselben Account wie die Entwicklung, deren Vorbereitung dasselbe Wochenkontingent verbraucht.
  - **Punkt 9, dritter Vorschlag** („Produktionszugriff des Agenten beschränken und festhalten"): in ADR-008 nicht umgesetzt und ohne Landeplatz geblieben; hier als Prüfpunkt 4 aufgenommen.
- **Optionen:**
  - **A:** Ein einheitliches, blockierendes Gate mit acht Prüfpunkten für jedes öffentlich erreichbare Deployment, klassenunabhängig; Verzicht auf einen Punkt nur per ADR mit benanntem Restrisiko.
  - **B:** Gestuft – Kern für alle, unabhängige und externe Prüfung nur bei personenbezogenen Daten oder Anmeldung. Verworfen: Die Bedingung trifft bei der Zielgruppe fast immer zu (jedes Nutzerkonto ist ein personenbezogenes Datum) und legt eine Ermessensfrage zurück zur KI.
  - **C:** Gate erst vor Go-Live. Verworfen: lässt genau die im Pilot belegte Lücke zwischen erstem Deployment und Härtung offen.
  - Eine unverbindliche Checkliste scheidet nach `Regel-001` aus.
- **Entscheidung:** Option A, freigegeben durch den Eigentümer am 2026-09-24. Nebenfragen mit den vorgeschlagenen Voreinstellungen übernommen: unabhängige Prüfung auch dauerhaft als DoD-Zeile, ein PR. Umsetzung:
  - `CLAUDE.md` §12 neuer Unterabschnitt **„Gate vor dem ersten öffentlichen Deployment"** mit acht Prüfpunkten, Definition der getrennten Instanz, Verzicht nur per ADR, externer Blick vor Go-Live, Nachholpflicht für bereits öffentliche Projekte.
  - `CLAUDE.md` §9 neue DoD-Zeile: Prüfung durch eine getrennte Instanz bei Änderungen der Kategorie §4 Nr. 6.
  - `CLAUDE.md` §3: Runbook-Zeile nennt den Notfall-Abschnitt.
  - `templates/projektstart.md` Modus 2 neuer Schritt **4a „Sicherheitsgrundriss"**, ADR zum Sicherheitsniveau in Schritt 5, Gate-Schritt im Fahrplan in Schritt 6.
  - `templates/docs/architecture.md` §6 Security: Sicherheitsniveau, Host, Netz, Secrets im Betrieb, Backups und Wiederherstellung, je mit Reifegrad.
  - `templates/docs/fahrplan.md`: erste Sicherheits-Review als Gate-Schritt vor dem ersten öffentlichen Deployment; STABILISIERUNG prüft nur noch nach.
  - `templates/docs/project-context.md` §8: Vertretung, Notfall-Handbuch, KI im Betrieb, Zugriff der KI, unbeaufsichtigtes Handeln.
  - `templates/docs/onboarding-runbook.md` neuer Abschnitt 7 „Notfall" (Pflegehinweise jetzt Abschnitt 8); Klasse K ohne Runbook: `docs/notfall-handbuch.md`.
- **Vision-Frage, die entschied:** Soll ein Projekt überhaupt aus dem Internet erreichbar sein dürfen, bevor klar ist, wer eingreift, wenn der Eigentümer nicht da ist, und bevor einmal ausprobiert wurde, ob sich die Daten wiederherstellen lassen? Antwort des Eigentümers: nein (Option A).
- **Konfidenz zum Zeitpunkt:** mittel – jeder Prüfpunkt ist am Pilotprojekt belegt, das Gate als Ganzes aber an keinem zweiten Projekt erprobt; offen ist vor allem der Aufwand für kleine Projekte. Umkehrbarkeit billig: Regel- und Vorlagentext, Lockerung per ADR.
- **Konsequenzen:**
  - Der erste öffentliche Live-Gang eines Projekts verzögert sich um die Arbeit für Härtung, Wiederherstellungs-Probe und Notfall-Handbuch (Schätzung: ein bis mehrere Arbeitstage, nicht gemessen).
  - Jede sicherheits- oder datenschutzrelevante Änderung kostet eine zusätzliche Prüf-Session und damit Kontingent.
  - Das Gate verweist für Backup, Probelauf und Notfall-Abläufe auf die Regel aus ADR-008 („Schutzmechanismen durch erzwungenen Fehler belegen").
  - Schutzbedarf (Punkt 6 aus #34) bleibt bewusst außen vor und folgt mit Paket 4; das Gate verlangt nur das Sicherheitsniveau.
  - EB-Digital ist nicht betroffen, solange der Eigentümer diese Fassung dort nicht übernimmt; bei Übernahme greift die Nachholpflicht.
- **Herkunft:** Pilotprojekt EB-Digital, Issue #34 Punkte 5, 8, 9 (dritter Vorschlag), 11 samt Ergänzung; Triage und Freigabe vom 2026-09-24.

### ADR-010: Warnungen als Fehler, Ablaufdaten-Register, Versionswahl „ausgereifte Linie"

- **Datum:** 2026-09-24
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[METHODIK]` `[STACK]`
- **Phasentyp-Kontext:** STABILISIERUNG
- **Reifegrad-Wirkung:** keine am Regelwerk selbst.
- **Kategorie:** Methodik; berührt die Build-Pipeline-Vorlagen (`CLAUDE.md` §4 Nr. 7) für Ziel-Projekte. Die eigene CI von Dev-Templates bleibt unverändert.
- **Kontext:**
  Paket 2 („Stille Fehler") aus Issue [#34](https://github.com/Paddel87/Dev-Templates/issues/34). Belege aus dem Pilotprojekt EB-Digital:
  - **Punkt 7:** In jedem grünen CI-Lauf standen 98 Warnungen, darunter 17 Abkündigungen eines Frameworks und später eine Sicherheitswarnung. Niemand las sie, bis der Eigentümer es am 2026-09-21 ausdrücklich verlangte. `CLAUDE.md` §9 definierte „fertig" über „CI grün"; eine Warnung färbt keinen Lauf rot.
  - **Punkt 10:** Registrierungs-Token des CI-Runners, DNS-Zugang, Zertifikate, Actions-Kontingent und Lebensenden der Laufzeitumgebungen verfallen, ohne an einer Stelle mit Frist zu stehen.
  - **Punkt 14:** Beim Stack-Aufbau schlug das Modell eine veraltete Python-Version vor (Trainingsstand). Schritt 2a fing das ab, legte die Prüfung aber beim Menschen ab; tatsächlich recherchierte ein KI-Agent. Eine Regel gegen die allerneueste, noch nicht getragene Linie fehlte, und `Verifiziert`-Stempel alterten still (u. a. „Active LTS bis 2026-10").
- **Optionen (Vorlage an den Eigentümer, Paket 2 als Ganzes):**
  - **A:** ganzes Paket in einem Schritt.
  - **B:** zwei Stufen – zuerst 7, 10, 14 (mechanisch, hohe Konfidenz), danach 15 mit Probelauf.
  - **C:** zwei Stufen in umgekehrter Reihenfolge.
- **Entscheidung:** Option B, freigegeben durch den Eigentümer am 2026-09-24. Dieser ADR ist Stufe 1:
  - `CLAUDE.md` §15 neuer Unterabschnitt **„Warnungen und Abkündigungen"**: Warnungen sind Fehler, wo das Werkzeug es erlaubt; sonst Bestand mit Obergrenze, die nur sinken darf, über eingebaute Mittel der Werkzeuge und nur mit benannten Ausnahmen samt Fahrplan-Schritt; Warnungsquellen ohne Schalter werden gelistet und bei jeder Beurteilung eines CI-Laufs gelesen; jede Abkündigung wird ein Schritt mit Frist.
  - `CLAUDE.md` §9: „CI grün" heißt grün ohne Warnung über dem Bestand.
  - `CLAUDE.md` §15 neuer Unterabschnitt **„Versionswahl"**: die KI belegt mit Quellen, der Mensch bestätigt die Tabelle; Regel „ausgereifte Linie" (Mindestreife, Unterstützung durch tragende Abhängigkeiten, Unterstützungsfenster über die Projektdauer); Nachprüfung über das Register.
  - `CLAUDE.md` §12 neuer Punkt 8: Ablaufdaten-Register beim Sessionende prüfen.
  - Vorlagen: `templates/projektstart.md` Schritt 2a umgedreht; `templates/docs/project-context.md` mit Mindestreife und Projektdauer (§3), Warnungs-Bestand (§7) und Ablaufdaten-Register (§8); `templates/docs/fahrplan.md` Feld „Frist"; CI- und Pre-Commit-Vorlagen setzen Warnungen als Fehler (ESLint mit Obergrenze 0 und Meldung ungenutzter Suppressions; pytest über `filterwarnings = ["error", …]`).
  - Selbstanwendung: Dev-Templates führt ein eigenes Ablaufdaten-Register und einen eigenen Warnungs-Bestand.
  - Punkt 15 ist als eigener Fahrplan-Schritt **S-16** angelegt.
- **Vision-Frage, die entschied:** Was drückt im Alltag mehr – dass Warnungen und Fristen unbemerkt durchrutschen, oder dass das Wochenkontingent zu früh aufgebraucht ist? Der Eigentümer wählte, die stillen Fehler zuerst abzusichern.
- **Konfidenz zum Zeitpunkt:** hoch für Punkt 7 und 10 (mechanisch, am Pilot belegt); mittel für Punkt 14 (die Mindestreife ist eine Setzung, die das Projekt als Zahl festlegt). Schwächster Teil: die „Warnungsquellen ohne Schalter" bleiben eine Lese-Pflicht der KI – an einen objektiven Auslöser gebunden (jede Beurteilung eines CI-Laufs), aber nicht mechanisch. Umkehrbarkeit billig: Regel-, Vorlagen- und Konfigurationstext.
- **Konsequenzen:**
  - Ziel-Projekte mit Altbestand an Warnungen müssen ihn bei Übernahme als Bestand mit Obergrenze festhalten, bevor die Vorlagen-Schalter greifen – sonst wird die CI sofort rot. Im Pilotprojekt betrifft das u. a. die 98 Warnungen aus Punkt 7.
  - Test-Warnungen aus Fremdbibliotheken werden als benannte Ausnahmen sichtbar statt still.
  - Kein neues Werkzeug, kein Zählskript: Die Obergrenzen nutzen `--max-warnings` bzw. `filterwarnings`.
  - Bei dieser Umsetzung wurde der CI-Nachlauf für die ohne grüne CI gemergten PRs als S-17 angelegt; er stand vorher ohne Schritt-ID nur im Logbuch.
- **Herkunft:** Pilotprojekt EB-Digital, Issue #34 Punkte 7, 10, 14; Triage und Freigabe vom 2026-09-24.

### ADR-011: Vier Modellklassen, empfohlene Klasse je Schritt, Abgabe an Unteragenten

- **Datum:** 2026-09-24
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[METHODIK]`
- **Phasentyp-Kontext:** STABILISIERUNG
- **Reifegrad-Wirkung:** keine am Regelwerk selbst.
- **Kategorie:** Methodik (`CLAUDE.md` §0)
- **Kontext:**
  Punkt 15 aus Issue [#34](https://github.com/Paddel87/Dev-Templates/issues/34) samt Ergänzung „Modell erkennen und vor Fehlnutzung warnen", Stufe 2 von Paket 2 (S-16, angelegt durch ADR-010). Belege: Im Pilotprojekt EB-Digital liefen laut Kostenregister 165 PRs auf Opus bzw. Fable und keiner auf Sonnet oder Haiku, obwohl Logbuch-, README- und Fahrplanpflege dort als Routine galten; der Eigentümer erreichte mit seinem Max-5x-Abo das Wochenlimit. Der einmalige Rückstufungs-Hinweis aus ADR-005 hat nie zu einem Wechsel geführt. Auch die Session, in der dieser ADR entstand, lief vollständig auf der Entscheidungs-Klasse, einschließlich reiner Pflegearbeit.
- **Optionen (für Arbeit oberhalb der empfohlenen Klasse):**
  - **A:** echter Stopp wie bei der Eskalation. Verworfen: Unterbrechung bei fast jedem Routineschritt; widerspricht der Wirtschaftlichkeits-Ausnahme in `Regel-001`.
  - **B:** Warnung mit Zahl und Bilanz am Sessionende, kein Stopp. Verworfen als alleiniges Mittel: hängt wieder an der Reaktion des Menschen, die im Pilot ausblieb.
  - **C:** Abgabe der Routine- und Mechanik-Arbeit an einen Unteragenten mit fest eingestelltem günstigerem Modell, für den Rest B.
- **Entscheidung:** Option C, freigegeben durch den Eigentümer am 2026-09-24; Probelauf als Teil von S-16. Umsetzung:
  - `CLAUDE.md` §0: vier Klassen (Mechanik, Routine, Entscheidung, Ausnahme) ohne Modellnamen, objektive Auslöser je Klasse, Ausnahme-Klasse nur bei Dreifach-Fehlschlag auf der Entscheidungs-Klasse oder auf ausdrücklichen Wunsch; neuer Unterabschnitt „Arbeit oberhalb der empfohlenen Klasse" (Abgabe, Warnung, Bilanz); Probelauf-Pflicht vor der Abgabe; Pflicht zur Modell-Abfrage beim Sessionstart; Stopp-Block um Mechanik und Ausnahme erweitert.
  - `CLAUDE.md` §2 und §12: Modell im `[SESSIONSTART]`, Modell-Bilanz im `[SESSIONENDE]`.
  - Vorlagen: `templates/docs/project-context.md` §6 (vier Klassen mit Probelauf-Status, Bezugsmodell, Unteragenten-Einstellung, was die Laufzeitumgebung meldet); `templates/docs/fahrplan.md` Feld „Empfohlene Klasse"; `templates/docs/logbuch.md` Felder „Modell" und „Modell-Bilanz".
  - `docs/decisions.md` Regel-001: Beispiel der Wirtschaftlichkeits-Ausnahme angepasst.
  - Selbstanwendung: aktuelle Modellzuordnung in `docs/project-context.md` §6 (ersetzt Opus 4.7 / Sonnet 4.6), Probelauf-Ergebnisse, offene Messung als **S-19**.
- **Probelauf (2026-09-24):** Kopie des Repos mit zwei absichtlich eingebauten Drift-Fehlern. Routine-Klasse (Sonnet 5, Drift-Prüfung): beide Fehler mit Datei, Zeile und Soll-Wert gefunden, die drei übrigen Anker korrekt grün, zusätzlich ein echter Nebenbefund. Mechanik-Klasse (Haiku 4.5, Zählen und Abgleichen): beide Fehler gefunden, alle Zählwerte korrekt. Schreibprobe der Routine-Klasse (README-Eintrag zu #38 aus Diff, ADR und Schritt): jede Aussage belegt, aber zwei Kernpunkte ausgelassen – bestätigt, dass die abgebende Klasse vor dem Commit prüfen muss.
- **Vision-Frage, die entschied:** Wenn die KI merkt, dass sie für eine Aufgabe zu teuer arbeitet – jedes Mal fragen, oder Routinearbeit selbständig abgeben und am Ende berichten? Der Eigentümer wählte die selbständige Abgabe.
- **Konfidenz zum Zeitpunkt:** mittel. Erkennung belegt (Sitzungsabfrage), Qualität für Prüf- und Zählaufgaben belegt, für Schreibaufgaben eingeschränkt belegt, für Logbuch-Einträge nicht erprobt. **Nicht belegt ist die Ersparnis selbst:** Die Probe-Unteragenten verarbeiteten je 115.000–170.000 Token, weil sie ihren Kontext neu laden; ob das gegenüber der Arbeit im geladenen Kontext der Entscheidungs-Klasse Kontingent spart, klärt S-19. Umkehrbarkeit billig: Regel- und Vorlagentext.
- **Konsequenzen:**
  - Kleine Teilarbeiten bleiben bei der aktiven Klasse; abgegeben wird vor allem Arbeit mit großem Lese- oder Schreibumfang (in §0 festgehalten, als Folge der Token-Zahlen aus dem Probelauf).
  - Ohne Werkzeug mit Unteragenten fällt die Regel auf Warnung und Bilanz zurück.
  - Ein Wochenlimit meldet die Laufzeitumgebung nach heutigem Stand nicht; die Regel verlangt deshalb keine Kontingent-Warnung.
  - Projekte, die die Fassung übernehmen, müssen ihren eigenen Probelauf machen, bevor sie abgeben.
- **Herkunft:** Pilotprojekt EB-Digital, Issue #34 Punkt 15 samt Ergänzung; Freigabe vom 2026-09-24.

### ADR-012: Stopp bei Phasen-Wucherung, Pflichtfrage „Weiterbauen, umbauen oder neu aufsetzen?", Reaktiv-Klassifikation in der STABILISIERUNG

- **Datum:** 2026-09-24
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[METHODIK]`
- **Phasentyp-Kontext:** STABILISIERUNG
- **Reifegrad-Wirkung:** keine am Regelwerk selbst.
- **Kategorie:** Methodik
- **Kontext:**
  Paket 3 („Roter Faden") aus Issue [#34](https://github.com/Paddel87/Dev-Templates/issues/34), Punkte 1 und 4. Belege aus dem Pilotprojekt EB-Digital:
  - **Punkt 1:** Phase 7 (STABILISIERUNG) war mit 8 Schritten geplant und wuchs auf 308 eindeutige Schritte (Stichtage: 9 am 15.06., 53 am 30.06., 136 am 15.07., 199 am 31.08., 368 Nummern am 18.09.). Der erste Sprung fiel in die Woche des ersten Live-Tests. Keine Regel begrenzte, wie weit eine Phase über ihren Plan hinauswachsen darf.
  - **Punkt 4:** Der einzige Ursprungsschritt, der nach einem Umbau fragte (7.6), wurde nie ausgeführt. Die Reaktiv-Quote stand bei 1/10, obwohl mehrere große Architekturentscheidungen während der STABILISIERUNG fielen (u. a. ADR-037, -041, -049, -077) – sie waren als `[STRATEGISCH]` etikettiert. Der Eigentümer bestätigte, Umbau und Neubeginn bewusst ausgeblendet zu haben.
- **Optionen:**
  - **A:** beide Punkte wie in #34; die Umbau-Frage bereitet die bauende KI vor. Verworfen: dieselbe Befangenheit, die die Reaktiv-Quote wirkungslos machte.
  - **B:** wie A, aber die Umbau-Frage bewertet eine getrennte Instanz (Definition aus ADR-009); die bauende KI nimmt Stellung, der Mensch entscheidet.
  - **C:** Umbau-Frage nur beim Wucherungs-Auslöser. Verworfen: ein Projekt, das langsam in die falsche Richtung wächst, würde nie gefragt.
- **Entscheidung:** Option B, freigegeben durch den Eigentümer am 2026-09-24; Nebenfragen mit Voreinstellung. Umsetzung:
  - `CLAUDE.md` §8 neues Stopp-Kriterium 9 **„Phasen-Wucherung"**: Schrittzahl über Faktor 2 **und** mindestens 5 Schritte über dem ursprünglichen Plan; geprüft beim Anlegen jedes Schritts; Neuplanung, Vision-Abgleich und Pflichtfrage vor dem nächsten Schritt; kein stilles Hochsetzen des Plans.
  - `CLAUDE.md` §12 neuer Unterabschnitt **„Weiterbauen, umbauen oder neu aufsetzen – Pflichtfrage"**: an jeder Phasengrenze und bei Kriterium 9; Bewertung durch eine getrennte Instanz mit Belegen, Stellungnahme der bauenden KI, Vorlage an den Menschen, ADR; nicht verschiebbar.
  - `CLAUDE.md` §6 „Reaktiv-ADR-Disziplin": Jede Architekturentscheidung (Kategorien 1, 2, 4, 5) in einer STABILISIERUNG wird `[REAKTIV]` klassifiziert.
  - `CLAUDE.md` §16: Drift-Prüfung um „Phasenumfang" ergänzt, Reaktiv-Zeile um die neue Klassifikation.
  - Vorlagen: Phasenkopf in `templates/docs/fahrplan.md` mit „Ursprünglicher Schrittplan" und „Pflichtfrage am Phasenende"; `[REAKTIV]`-Definition in `templates/docs/decisions.md`; Wucherungs-Schwelle in `templates/docs/project-context.md`.
  - Selbstanwendung: Schwelle in `docs/project-context.md`; das laufende Schritt-Bündel (Issue #34) mit ursprünglichem Plan im Fahrplan.
- **Vision-Frage, die entschied:** Wenn das Projekt eigentlich umgebaut werden müsste – von wem soll der Eigentümer das hören: von der KI, die es gebaut hat, oder von einer zweiten, die es nur begutachtet? Antwort: von einer zweiten.
- **Konfidenz zum Zeitpunkt:** mittel – beide Punkte am Pilot belegt; Faktor und Mindestzuwachs sind Setzungen; ob eine getrennte Instanz ohne Gesprächsverlauf Umbaukosten ausreichend belegen kann, ist unerprobt. Umkehrbarkeit billig: Regel- und Vorlagentext.
- **Konsequenzen:**
  - Für Ziel-Projekte, die übernehmen, kann die neue Reaktiv-Klassifikation die Quote rückwirkend über den Schwellenwert heben (im Pilot wahrscheinlich) und damit einen Reflexions-Schritt auslösen – gewollt.
  - Methodik-ADRs dieses Repos sind keine Architekturentscheidungen im Sinne der Kategorien 1, 2, 4, 5 und bleiben unberührt (Reaktiv-Quote 1/12).
  - Jede Phasengrenze kostet eine zusätzliche Prüf-Session.
  - Erste Anwendung hier: Das Bündel „Umsetzung von Issue #34" (Plan: 5 Einheiten) steht bei 8 Schritten; Schwelle bei mehr als 10. Beim Abschluss des Bündels ist die Pflichtfrage fällig.
- **Herkunft:** Pilotprojekt EB-Digital, Issue #34 Punkte 1 und 4; Freigabe vom 2026-09-24.

### ADR-013: Anforderungsschicht zwischen Vision und Architektur, Schutzbedarf als Obergrenze, Kostenrahmen

- **Datum:** 2026-09-24
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[METHODIK]`
- **Phasentyp-Kontext:** STABILISIERUNG
- **Reifegrad-Wirkung:** keine am Regelwerk selbst.
- **Kategorie:** Methodik (Projektstart, Pflichtlektüre)
- **Kontext:**
  Issue [#20](https://github.com/Paddel87/Dev-Templates/issues/20) (Selbstprüfung vom 2026-07-24: Anforderungen nur verstreut, Business-Analyse nur in Ansätzen, Projektstart springt von der Vision direkt zu Stack und Architektur) und Paket 4 aus Issue [#34](https://github.com/Paddel87/Dev-Templates/issues/34):
  - **Punkt 3:** Im Pilotprojekt EB-Digital (Klasse G) fielen große Architekturentscheidungen erst in der STABILISIERUNG (manuelle Auftragserfassung, eigene Karten, Warenwirtschaft, viertes Frontend, verbandsspezifische Lagerplätze). Modus 1 lief außerhalb des Repos; welche Anwendungsfälle bewusst weggelassen wurden, ist nicht mehr nachvollziehbar.
  - **Punkt 6:** Ohne festgelegten Schutzbedarf wurde Datenschutz sehr weitgehend umgesetzt (u. a. sofortiges Leeren abgeschlossener Aufträge, Anonymisierungs-Jobs); jede Maßnahme hatte ein Argument dafür und keines dagegen.
  - **Punkt 12:** Kostenfragen wurden im Pilot mehrfach per ADR entschieden; die Vorlage kannte weder Kostenrahmen noch Kostenregister.
- **Optionen:**
  - **A:** in vorhandene Dokumente einweben. Verworfen: Anforderungen blieben ohne Adresse und Status.
  - **B:** eigene Vorlagen, gestaffelt nach Klasse.
  - **C:** eigener Zwischenschritt „Modus 1.5" für alle Klassen. Verworfen: zu viel Aufwand für kleine Projekte.
  - **D:** B für alle Klassen ab M, zusätzlich Modus 1.5 für G und V.
- **Entscheidung:** Option D, gewählt durch den Eigentümer am 2026-09-24; Nebenfragen mit Voreinstellung. Umsetzung:
  - Neue Vorlage `templates/docs/requirements.md` (Übersicht, Beteiligte, Anwendungsfälle mit „bewusst ausgeschlossen", Kernprozesse, funktionale Anforderungen mit ID, Priorität Muss/Soll/Kann, prüfbarer Akzeptanz, Schritt und Test, Verweis auf die NFRs in `architecture.md`).
  - `templates/projektstart.md`: Modus 1 hält ausgeschlossene Anwendungsfälle in `vision.md` Abschnitt 5 fest; Modus 2 Schritt **1a „Anforderungsklärung (Modus 1.5)"** – eigener Dialog bei G/V mit ausdrücklicher Bestätigung vor dem Stack, abgeleitet bei M, entfällt bei K; Kostenrahmen-Frage in Schritt 2; Schutzbedarf in Schritt 4a mit eigenem ADR; Fahrplan-Schritte nennen ihre Anforderungs-IDs; Klassen-Staffelung in §2.2.
  - `CLAUDE.md` §2: `requirements.md` nur ab Klasse G und nur „Übersicht" in der Mindest-Lektüre; Vertiefungs-Auslöser für Anforderungen und Geschäftsentscheidungen. §3: neue Dokumentzeile. §6: neue harte Regel **„Schutzbedarf ist Obergrenze"**. §12: Vision-Abgleich ab Klasse M auch über die Anforderungen. §16: Drift-Anker „Anforderung → Schritt".
  - Weitere Vorlagen: `vision.md` (bewusst ausgeschlossen), `architecture.md` (Schutzbedarf), `project-context.md` (Kosten), `decisions.md` Teil D (Geschäftsentscheidungen, gestaffelt), `fahrplan.md` (Feld „Anforderungen").
  - Selbstanwendung: Dev-Templates (Klasse K) vermerkt Anforderungen, Schutzbedarf und Kosten als nicht anwendbar mit Begründung.
- **Vision-Frage, die entschied:** Wie lange darf der Projektstart dauern, bevor die erste Zeile Code entsteht? Antwort: kleine und mittlere Projekte zügig mit klaren Anforderungen, große Projekte erst gründlich klären.
- **Konfidenz zum Zeitpunkt:** mittel – der Befund ist am Pilot gut belegt; ob Modus 1.5 späte Architekturentscheidungen verhindert oder nur verschiebt, ist unerprobt, und echte Nutzung bringt immer neue Anforderungen. Umkehrbarkeit billig für die Vorlage.
- **Konsequenzen:**
  - Projekte der Klasse G/V brauchen länger bis zur ersten Zeile Code.
  - Ab Klasse M ein Dokument mehr zu pflegen; die Pflichtlektüre für K und M bleibt unverändert, für G wächst sie um eine Übersicht.
  - Bestehende Projekte (EB-Digital) sind nicht betroffen, weil ihr Start hinter ihnen liegt. Nachträglich sinnvoll wäre dort nur ein Schutzbedarfs-ADR als Obergrenze – eigener Auftrag.
  - Anforderungs-Änderungen sind keine neue Freigabe-Kategorie; das Streichen einer Muss-Anforderung fällt unter die bestehende Landeplatz-Regel (Descope mit ADR).
- **Herkunft:** Issue #20, Issue #34 Punkte 3, 6, 12; Wahl vom 2026-09-24.

### ADR-014: Abgabe nur, wo sie spart; Grenze der Sessiongröße; Kontingent-Warnung nach Probelauf

- **Datum:** 2026-09-24
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[METHODIK]`
- **Phasentyp-Kontext:** STABILISIERUNG
- **Reifegrad-Wirkung:** keine am Regelwerk selbst.
- **Kategorie:** Methodik (`CLAUDE.md` §0, §12); ändert ADR-011 in einem Punkt (Abgabe-Kriterium)
- **Kontext:**
  Die Erkundung S-19 hat ergeben: (1) Lesen aus dem Cache kostet bei der Entscheidungs-Klasse (Opus 5.5) und der Routine-Klasse (Sonnet 5) gleich viel; die Abgabe von Lesearbeit an die Routine-Klasse spart deshalb kaum, die gemessene Drift-Prüfung als Unteragent war gerechnet eher teurer. (2) Größter Hebel ist die Kontextgröße der Hauptsitzung, weil jeder Aufruf den ganzen Kontext liest (bei rund 510.000 Token etwa 0,10 $ je Aufruf). (3) Die Statuszeile des Werkzeugs meldet bei Pro/Max das 7-Tage-Kontingent; Hooks erhalten es nicht, können aber Text ins Gespräch einspielen.
- **Optionen:**
  - **A:** alle drei Folgerungen in einem Schritt, die Warnung mit Probelauf innerhalb des Schritts.
  - **B:** Regeln jetzt, die Warnung als eigener Erkundungsschritt. Verworfen: hätte bei Bündel #34 (10 Schritte) Stopp-Kriterium 9 ausgelöst, ohne inhaltlichen Gewinn.
  - **C:** nur die Sessiongröße. Verworfen: ließe die als unwirksam erkannte Abgabe-Regel stehen.
- **Entscheidung:** Option A, freigegeben durch den Eigentümer am 2026-09-24; Nebenfragen mit Voreinstellung. Umsetzung:
  - `CLAUDE.md` §0 „Arbeit oberhalb der empfohlenen Klasse": Abgabe nur an eine Klasse mit niedrigerem Cache-Lesepreis oder bei ausgabelastiger Arbeit; Preise je Klasse in `project-context.md`.
  - `CLAUDE.md` §0 neuer Unterabschnitt **„Sessiongröße"**: Prüfung nach jedem Schritt; über der Grenze kein neuer Schritt, Sessionende und Bitte um eine neue Session; Ausnahme „weiter hier" mit Logbuch-Vermerk; Kontingent-Warnung erst nach Probelauf aktiv.
  - `CLAUDE.md` §12 Punkt 4: Kontextgröße im `[SESSIONENDE]`.
  - Vorlagen: `templates/docs/project-context.md` §6 (Preise je Klasse, Grenze, Stand der Warnung); neu `templates/werkzeuge/claude-code/` (Skript und Anleitung für Statuszeile und Hook).
  - Selbstanwendung: Preise, Grenze 200.000 Token, Warnung inaktiv.
- **Probelauf der Warnung (2026-09-24):** Skript mit Schwelle 0 % erzeugt die Warnung (erzwungener Fall); sieben Gegenproben wie erwartet. Der Zustellweg über Statuszeile und Hook ist in Cloud-Sessions nicht vorhanden und daher nicht erprobt; die Warnung bleibt inaktiv, bis ein lokaler Probelauf nach der Anleitung in `templates/werkzeuge/claude-code/README.md` besteht.
- **Vision-Frage, die entschied:** Darf die KI den Eigentümer bitten, eine neue Session zu beginnen, wenn die aktuelle zu groß wird – auch mitten in einem Themenblock, nur nicht mitten in einem Schritt? Antwort: ja.
- **Konfidenz zum Zeitpunkt:** hoch für Abgabe-Kriterium und Sessiongröße (Preise belegt, Rechnung aus Kontextgröße und Preis); niedrig für den Zustellweg der Warnung (unerprobt). Wie ein Abo die Modelle im Kontingent gewichtet, ist nicht veröffentlicht – Listenpreise sind Ersatzmaß. Umkehrbarkeit billig.
- **Konsequenzen:**
  - Die Session, in der dieser ADR entstand (rund 580.000 Token), liegt weit über der Grenze; nach dem Abschluss von S-22 beginnt die KI dort keinen neuen Schritt mehr.
  - Das Skript fängt jeden eigenen Fehler ab und endet immer mit Exit-Code 0 – eine bewusste Abweichung von „Abbruch bei Fehler", damit ein Hilfsskript nie eine Eingabe blockiert (im Skript-Kopf begründet).
  - Neue Werkzeug-Voraussetzung nur für Projekte, die die Warnung einrichten: Python 3.8+.
- **Herkunft:** Erkundung S-19; Issue #34 Punkt 15 samt Ergänzungen; Freigabe vom 2026-09-24.

---

<!-- ANCHOR:teil-c-entscheidungsregeln -->
## Teil C: Entscheidungsregeln

### Regel-001: Regeln entweder blockierend bauen oder weglassen

- **Herkunft:** ADR-005
- **Gilt für:** jede neue Regel in `CLAUDE.md`, die dem Menschen einen Entscheidungspunkt anbietet – Freigaben, Hinweise, Warnungen, Bestätigungen.
- **Regel:** Vor dem Formulieren prüfen, ob der Mensch den Entscheidungspunkt im **tatsächlichen** Arbeitsablauf überhaupt wahrnehmen und nutzen kann. Wenn die Regel nur wirkt, sofern er eine laufende Antwort unterbricht oder in einem engen Zeitfenster reagiert, ist sie wirkungslos. Dann: entweder als echten Stopp bauen (KI hält an und wartet) oder ganz weglassen und stattdessen nachträglich protokollieren.
- **Ausnahmen:** Hinweise, die reine Wirtschaftlichkeit betreffen und deren Ignorieren folgenlos bleibt (z. B. die Warnung bei Arbeit oberhalb der empfohlenen Klasse aus Abschnitt 0; ihre Wirkung sichert dort ein Mechanismus – die Abgabe an Unteragenten –, nicht der Hinweis selbst, ADR-011). Dort ist ein nicht-blockierender Hinweis angemessen, weil ein Stopp unverhältnismäßig wäre.
- **Gegenbeispiel:** Ein Block, der eine Empfehlung ausspricht und in derselben Antwort eine „falls du nicht willst"-Ersatzhandlung ausführt. Der Mensch sieht die Empfehlung erst, wenn die Arbeit bereits getan ist – das erzeugt Protokoll-Einträge statt Wirkung.
