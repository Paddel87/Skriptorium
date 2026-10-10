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

Stand 2026-10-10 (ADR-001 bis ADR-009 aus Modus 2 Schritt 5, ADR-010 aus Schritt 1.1, ADR-011 aus Schritt 1.5, ADR-012 aus Schritt 1.2, ADR-013 und ADR-014 aus Schritt 1.4, ADR-015 aus Schritt 2.1, ADR-016 aus Schritt 2.2, ADR-017 und ADR-018 aus Schritt 2.6, ADR-019 aus Schritt 2.7, ADR-020 aus dem Phasenabschluss 2, ADR-021 vor Schritt 3.1, ADR-022 aus der Abnahme von 3.3, ADR-023 aus Schritt 3.9, ADR-024 aus dem Phasenabschluss 3, ADR-025 aus Schritt 4.2, ADR-026 aus Schritt 4.9, ADR-027 aus Schritt 4.10, ADR-028 aus Schritt 4.11, ADR-029 bis ADR-032 aus Schritt 4.2, ADR-033 aus Schritt 4.12, ADR-034 aus Schritt 4.2, ADR-035 aus D.6, ADR-036 aus Schritt 4.3, ADR-037 und ADR-038 aus Schritt 4.6, ADR-039 aus Schritt 4.7, ADR-040 aus D.8, ADR-041 aus Schritt 4.13, ADR-042 aus der Neuplanung von Phase 4, ADR-043 aus Schritt 4.8, ADR-044 aus Schritt 5.7, ADR-045 aus D.14, ADR-046 aus Schritt 5.11, ADR-047 aus Schritt 5.22, ADR-048 aus Schritt 5.21, ADR-049 aus Schritt 5.1, ADR-050 und ADR-051 aus Schritt 5.26, ADR-052 aus D.16, ADR-053 aus Schritt 5.6). Sortiert nach Nummer; Mindest-Lektüre bei Sessionstart.

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
| 010 | 2026-09-26 | Aktiv (Zweitmodell ersetzt durch ADR-011, Startmodell durch ADR-044) | ERKENNTNIS | PERFORMANCE | – (Ergebnis Schritt 1.1) | Startmodell grok-4.7, Ausweichmodell qwen3.8-max, Token-Budget 30.000 |
| 011 | 2026-09-26 | Aktiv | ERKENNTNIS | PERFORMANCE | – (Ergebnis Schritt 1.5) | grok-4.6 Zweitmodell, qwen3.8-max nur Notfall-Reserve |
| 012 | 2026-09-26 | Aktiv | ERKENNTNIS | DATENMODELL | Datenmodell | Import von Welt-Material zunächst nur als Markdown |
| 013 | 2026-09-26 | Aktiv | ERKENNTNIS | MODUL, SCHNITTSTELLE, DATENMODELL, PERFORMANCE | Architektur | Reifegrad-Beförderung vor Phase 2, neues Reaktionszeit-Ziel |
| 014 | 2026-09-26 | Aktiv | STRATEGISCH | METHODIK | Pflichtfrage Phasenende | Phasenende 1 – weiterbauen |
| 015 | 2026-09-26 | Aktiv | OPERATIV | STACK, METHODIK | Externe Abh., Build-Pipeline, Lizenz | Entwicklungswerkzeuge, Linien ohne Patch-Versionen, Werkzeug-Lizenzen, Starlette-Abkündigung |
| 016 | 2026-09-26 | Aktiv | OPERATIV | STACK, DATENMODELL | Externe Abh. | YAML-Parser für den Dateikopf – PyYAML |
| 017 | 2026-09-26 | Aktiv | OPERATIV | SECURITY, SCHNITTSTELLE, DATENMODELL | Sicherheit, Datenmodell, API, Externe Abh., Lizenz | Anmeldung und Sitzung – selbst gewähltes Passwort ohne zweiten Faktor |
| 018 | 2026-09-26 | Aktiv | REAKTIV | MODUL, SECURITY | Architektur | Beziehungen api → storage (Zugangsdaten) und api → Pwned Passwords |
| 019 | 2026-09-26 | Aktiv | OPERATIV | STACK, METHODIK | Externe Abh., Build-Pipeline | Test-Werkzeuge der Oberfläche – Testing Library, jsdom, Playwright |
| 020 | 2026-09-26 | Aktiv | STRATEGISCH | METHODIK | Pflichtfrage Phasenende | Phasenende 2 – weiterbauen, Abläufe in 3.3 aus den Routen heraushalten |
| 021 | 2026-09-26 | Aktiv | OPERATIV | MODUL, DATENMODELL | Architektur (Reifegrad) | Observability: Log-Zeile je KI-Anfrage belastbar, Verbrauchsspeicherung in 3.9 |
| 022 | 2026-09-26 | Aktiv | ERKENNTNIS | PERFORMANCE | Architektur (NFR) | Reaktionszeit verfehlt – Ziel bleibt, Ursache wird in D.6 erkundet |
| 023 | 2026-09-27 | Aktiv | OPERATIV | DATENMODELL, MODUL | Datenmodell, Architektur | Verbrauchsdaten in Monatsdateien, Modell je Geschichte |
| 024 | 2026-09-27 | Aktiv | STRATEGISCH | METHODIK | Pflichtfrage Phasenende | Phasenende 3 – weiterbauen, Geschichtenseite in 4.1 aufteilen, Kanon-Treue in 4.8 messen |
| 025 | 2026-09-27 | Aktiv | OPERATIV | DEPLOYMENT, SECURITY, METHODIK | Externe Abh., Sicherheit, Deploy | Bestehender netcup-VPS, Entwicklung auf macOS, SSH-Zugang der KI |
| 026 | 2026-09-27 | Aktiv | OPERATIV | STACK, METHODIK | Build-Pipeline, Externe Abh. | Einrichtungsskript auch für macOS |
| 027 | 2026-09-27 | Aktiv | OPERATIV | DEPLOYMENT, SECURITY, STACK | Externe Abh., Sicherheit, Deploy | Skriptorium als Container hinter dem vorhandenen Reverse Proxy |
| 028 | 2026-09-28 | Aktiv | OPERATIV | METHODIK | Build-Pipeline | Branch-Schutz für `main` |
| 029 | 2026-09-28 | Aktiv | OPERATIV | STACK, DEPLOYMENT | Externe Abh. | Container-Image aus offiziellen Images mit fester Version |
| 030 | 2026-09-28 | Aktiv | OPERATIV | SECURITY, DEPLOYMENT | Sicherheit | Eigenes Netz zwischen Proxy und Skriptorium |
| 031 | 2026-09-28 | Aktiv | OPERATIV | SECURITY | Datenschutz | Kurznamen im Zugriffsprotokoll des Proxys zulässig |
| 032 | 2026-09-28 | Aktiv | OPERATIV | SECURITY, DEPLOYMENT | Sicherheit | Einrichtung auf dem VPS mit dem vorhandenen Administrator-Zugang |
| 033 | 2026-09-28 | Aktiv | OPERATIV | SECURITY, DEPLOYMENT | Externe Abh., Deploy | Reverse Proxy auf die unterstützte Linie 3.7 |
| 034 | 2026-09-28 | Aktiv | OPERATIV | DEPLOYMENT | Deploy | Keine eigene Erreichbarkeits-Überwachung |
| 035 | 2026-09-28 | Aktiv | ERKENNTNIS | PERFORMANCE | Architektur (NFR) | Reaktionszeit: Zielwerte an die Messung angepasst |
| 036 | 2026-09-30 | Aktiv | OPERATIV | DEPLOYMENT, SECURITY | Externe Abh., Sicherheit, Deploy | Sicherungsziel: Duplicati nach MEGA S4 mit beschränktem Benutzer |
| 037 | 2026-09-30 | Aktiv | OPERATIV | SECURITY | Sicherheit | Zugriff der KI auf die Produktion unverändert; Schlüsseltausch nicht erprobt |
| 038 | 2026-09-30 | Aktiv | OPERATIV | SECURITY, DEPLOYMENT | Sicherheit | Gate 4.6: Ablage der Sicherungs-Zugangsdaten nicht vor dem Deployment, nachgeholt in D.11 |
| 039 | 2026-09-30 | Aktiv | OPERATIV | DEPLOYMENT | Deploy | Deployment von Hand durch die KI auf Anweisung; Adresse des Skriptoriums |
| 040 | 2026-10-07 | Aktiv | OPERATIV | SECURITY | Sicherheit | D.8 verworfen: Passwort der Proxy-Verwaltung wird trotz offengelegtem Hash nicht rotiert |
| 041 | 2026-10-07 | Aktiv | OPERATIV | SECURITY | Sicherheit | Kürzerer, lesbarer Einrichtungscode (12 Zeichen), Ablage mit scrypt |
| 042 | 2026-10-08 | Aktiv | STRATEGISCH | METHODIK | Pflichtfrage Phasenende | Phasenende 4 / Wucherung – gezielt umbauen, Befunde in neue Phase 5 |
| 043 | 2026-10-08 | Aktiv | OPERATIV | METHODIK | Release (Vision-Checkpoint) | v0.1.0 als Vorabversion – Go-Live vor v1.0.0 |
| 044 | 2026-10-08 | Aktiv | ERKENNTNIS | PERFORMANCE | – (Ergebnis Schritt 5.7) | grok-4.6 als Voreinstellung, grok-4.7 bleibt wählbar |
| 045 | 2026-10-08 | Aktiv | OPERATIV | METHODIK | Build-Pipeline | Zeitlimit 20 Minuten für den End-to-End-Job |
| 046 | 2026-10-08 | Aktiv | OPERATIV | STACK | Externe Abh. | React Router 7.18, Wechsel auf Linie 8 ab 2026-12-17 |
| 047 | 2026-10-09 | Aktiv | OPERATIV | METHODIK | – (Prüfverfahren) | Festes Verfahren für Probeschreiben: wiederholte Läufe, zwei Testgeschichten |
| 048 | 2026-10-09 | Aktiv | OPERATIV | SECURITY | Sicherheit und Datenschutz | Service Worker nur für eine Hinweisseite ohne Netz (PWA) |
| 049 | 2026-10-09 | Aktiv | REAKTIV | MODUL | Architektur | Kanon-Vorschläge ohne `@` im Browser statt in `context` |
| 050 | 2026-10-10 | Aktiv | ERKENNTNIS | PERFORMANCE | Architektur (vorgelegt, keine Änderung) | Nicht genannte Kanon-Einträge – Abhilfe zurückgestellt (V.10) |
| 051 | 2026-10-10 | Aktiv | ERKENNTNIS | PERFORMANCE | Architektur (NFR) | grok-4.7 über der Wartezeit – Ursache zuerst erkunden (D.16) |
| 052 | 2026-10-10 | Aktiv | ERKENNTNIS | PERFORMANCE | Architektur (NFR) | grok-4.7 aus der Voreinstellung, Reaktionszeit-Ziel grok-4.6 meist < 30 s / max. 45 s |
| 053 | 2026-10-10 | Aktiv | OPERATIV | DATENMODELL | Datenmodell | Atmosphärische Schreibweise: Genre je Geschichte, Vorgabe wird ins neue Kapitel kopiert |

### Reaktiv-Quote

Anzahl `[REAKTIV]`-ADRs / Gesamtzahl der letzten 10 ADRs (Bezugsgröße nach `docs/project-context.md` Abschnitt 6).

- **Aktueller Wert:** 1 / 10 (10 %) über ADR-044 bis ADR-053 – ADR-053 in 5.6 (Datenmodell, Kategorie 4, in der Phasenplanung von 5.6 vorgesehen – nicht reaktiv); ADR-043 nicht mehr im Fenster; ADR-052 aus der Erkundung D.16 (Erkenntnis aus geplanter Messung, wie ADR-035 – nicht reaktiv); ADR-042 nicht mehr im Fenster; ADR-050 und ADR-051 aus 5.26 (Ergebnis eines Prüfschritts, der bei Befund eine Entscheidungsvorlage vorsah; ADR-050 setzt keine Architekturänderung um, ADR-051 ist eine Erkenntnis zur NFR wie ADR-035 – beide nicht reaktiv); ADR-040 und ADR-041 nicht mehr im Fenster; ADR-049 in 5.1 (Verantwortung für Vorschläge ohne `@` von `context` nach `ui`, Kategorie 1, in der Phasenplanung nicht vorgesehen – reaktiv); ADR-039 nicht mehr im Fenster; ADR-048 in 5.21 (Service Worker, Kategorie 6 – in 5.21 als mögliche Vorlage vorgesehen, keine Architekturentscheidung der Kategorien 1, 2, 4, 5, nicht reaktiv); ADR-038 nicht mehr im Fenster; ADR-047 in 5.22 (Prüfverfahren, Methodik – keine Architekturentscheidung, nicht reaktiv); ADR-037 nicht mehr im Fenster; ADR-046 in 5.11 (React Router, Kategorie 3 – in 5.11 als Vorlage vorgesehen, keine Architekturentscheidung der Kategorien 1, 2, 4, 5, nicht reaktiv); ADR-036 nicht mehr im Fenster; ADR-045 aus D.14 (Zeitlimit der CI, Kategorie 7 – keine Architekturentscheidung, nicht reaktiv); ADR-035 nicht mehr im Fenster; ADR-044 in 5.7 (Modellwahl ist Konfiguration, Erkenntnis aus der Nutzung, in 5.7 vorgesehen – nicht reaktiv); ADR-034 nicht mehr im Fenster; ADR-043 in 4.8 (Release-Entscheidung, keine Architekturentscheidung – nicht reaktiv); ADR-033 nicht mehr im Fenster; ADR-042 Pflichtfrage nach Phasen-Wucherung (Methodik, keine Architekturentscheidung der Kategorien 1, 2, 4, 5 – nicht reaktiv; die Umbau-Entscheidungen fallen in den Schritten 5.11–5.13 als geplante ADRs der UMSETZUNG-Phase 5); ADR-032 nicht mehr im Fenster; ADR-041 in 4.13 (Einrichtungscode, Kategorie 6 – keine Architekturentscheidung, nicht reaktiv); ADR-040 aus D.8 (Verzicht auf Rotation, Kategorie 6 – keine Architekturentscheidung, nicht reaktiv); ADR-039 in 4.7 (Deployment-Weg, Kategorie 7 – nicht reaktiv, in 4.7 vorgesehen); ADR-038 in 4.6 (Verzicht auf Gate-Punkt 4a, Kategorie 6 – nicht reaktiv); ADR-037 in 4.6 (Zugriff der KI, Kategorie 6 – nicht reaktiv, laut ADR-032 dort vorgesehen); ADR-036 in 4.3 (Sicherungsziel, Kategorien 3, 6, 7 – nicht reaktiv, in 4.3 vorgesehen); ADR-035 aus der Erkundung D.6 (Erkenntnis aus geplanter Messung, wie ADR-022 – nicht reaktiv); ADR-034 in 4.2 (Überwachung, Kategorie 7 – nicht reaktiv); ADR-033 in 4.12 (Kategorien 3 und 7 – nicht reaktiv); ADR-029 bis ADR-032 in 4.2 (Kategorien 3 und 6 – nicht reaktiv; ADR-029 bis ADR-031 nicht mehr im Fenster); ADR-028 in 4.11 (Branch-Schutz, Kategorie 7 – nicht reaktiv, nicht mehr im Fenster); ADR-027 in 4.10 (Einpassung in den VPS, Kategorien 3, 6, 7 – nicht reaktiv, nicht mehr im Fenster); ADR-026 in 4.9 (Werkzeuge, Kategorien 3, 7 – nicht reaktiv, nicht mehr im Fenster); ADR-025 in 4.2 (geplante Anbieterwahl, nicht mehr im Fenster); ADR-019 aus Phase 2 (operativ, geplant in 2.2, 2.6, 2.7), ADR-020 Pflichtfrage am Phasenende 2, ADR-021 vor 3.1 (geplant laut Notiz an 3.1), ADR-022 Abnahme 3.3 (Erkenntnis aus geplanter Messung, keine Architekturentscheidung der Kategorien 1, 2, 4, 5), ADR-023 in 3.9 (laut ADR-021 dort geplant), ADR-024 Pflichtfrage am Phasenende 3 (nicht mehr im Fenster). ADR-018 (reaktiv, neue Beziehungen von `api`, in 2.6 ungeplant) liegt nicht mehr im Fenster. Korrektur 2026-09-28: Der Wert zum Stand ADR-027 hätte 1 / 10 lauten müssen, weil ADR-018 noch im Fenster lag.
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
- **Status:** Aktiv – Festlegung des Ausweichmodells ersetzt durch ADR-011 (grok-4.6 Zweitmodell, qwen3.8-max Notfall-Reserve); Startmodell ersetzt durch ADR-044 (grok-4.6 voreingestellt, 2026-10-08)
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
- **Status:** Aktiv – Reihenfolge grok-4.7 vor grok-4.6 ersetzt durch ADR-044 (2026-10-08)
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
  - `api` hat damit Abhängigkeiten zu fünf Modulen; der Smell „Gott-Modul" (Heuristik 1.4) wird beim Phasenende 2 mitgeprüft (geprüft: ADR-020).
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

#### ADR-020: Phasenende 2 – weiterbauen, Abläufe in 3.3 aus den Routen heraushalten

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[METHODIK]`
- **Phasentyp-Kontext:** UMSETZUNG (Phasenende)
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Pflichtfrage am Phasenende (`CLAUDE.md` Abschnitt 12, „Weiterbauen, umbauen oder neu aufsetzen")
- **Kontext:** Abschluss von Phase 2 (UMSETZUNG, Schritte 2.1–2.7). Bewertung durch eine getrennte Prüf-Instanz (Unteragent mit Claude Sonnet 5, anderes Modell als die bauende KI, ohne Gesprächsverlauf und ohne Logbuch; erhielt Code, Tests, Konfiguration, Architektur, ADRs, Fahrplan Phase 2/3 und Querschnitt, Vision, Anforderungen; führte Tests und Linter selbst aus), 2026-09-26. Vision-Re-Derivations-Pass und Onboarding-Re-Validation im selben Arbeitsgang ohne Befund (Logbuch 2026-09-26 21:00 und Sessionende).
- **Bewertung der Prüf-Instanz (zusammengefasst, unverändert in der Aussage):** Weiterbauen, Konfidenz hoch. Belege: Modulgrenzen an den tatsächlichen Imports eingehalten; 224/224 Python-Tests (99,94 %), 32/32 Komponenten-Tests; ruff, mypy, eslint, tsc fehlerfrei; keine TODO-Marker, sieben begründete `noqa`; Datenmodell trägt Phase 3 (Gast-Verbindungen, geschichtenbezogene Fakten, Kurzfassungen); Reaktiv-Quote 1/10. Befunde: (1) `data/index.sqlite` im Git-Index trotz `.gitignore` – niedrig; (2) `spikes/` mit ca. 1,4 MB Rohdaten – niedrig; (3) `context` und `ai_gateway` noch ohne Code, Kernrisiko liegt in Phase 3 – mittel; (4) die in ADR-018 angekündigte Prüfung „Gott-Modul" für `api` (1.418 Zeilen) nicht dokumentiert, Phase 3 bringt weitere Ablauf-Steuerung – mittel; (5) Kontexttreue bei Referenzumfang und Tempo von `storage` ungeprüft, korrekt als `[OFFEN]` mit D.4 geführt – mittel; (6) Sitzungen im Speicher, Neustart während des Schreibens – niedrig. Umbau: kein Fachcode betroffen, nur (1) beheben und (4) nachholen. Neu aufsetzen: kein Beleg.
- **Stellungnahme der bauenden KI:** Zu (1) Zustimmung; Index geprüft, alle Tabellen leer, seit `53071f0` im Git-Index – wird aus dem Git-Index genommen (Datei bleibt lokal). Zu (2) Widerspruch: Die Rohdaten sind der Beleg für ADR-010 und ADR-011 und werden aus `docs/research/` verlinkt; sie bleiben. Zu (4) Prüfung nach Heuristik 1.4 nachgeholt: `api` kennt alle Fachmodule nach Entwurf (Ablauf-Steuerung liegt laut `docs/architecture.md` Abschnitt 2 in `api`, damit zwischen Fachmodulen keine Zyklen entstehen); die Routen sind dünn (`canon_routes.py` und `manuscript_routes.py` zusammen 8 Verzweigungen, Fachlogik in `canon`/`manuscript`) – heute kein Gott-Modul. Das Risiko entsteht, wenn Streaming, Kurzfassung nach Kapitelabschluss und Fakt → Kanon direkt in den Routen landen. Gegenmittel: Pflichtnotiz an 3.3, Abläufe in ein Untermodul `api.flows` zu legen (Umbau innerhalb eines Moduls). Ergänzung: `pre-commit install` in einem Worktree biegt den Hook des Haupt-Repositorys auf die Umgebung des Worktrees um – Runbook-Hinweis.
- **Optionen:** A weiterbauen mit zwei Aufräumarbeiten / B `api` vorab in Routen und Ablauf-Steuerung aufteilen / C neu aufsetzen.
- **Entscheidung:** A – weiterbauen; `data/index.sqlite` aus dem Git-Index nehmen; Notiz „Abläufe in `api.flows`, nicht in die Routen" an 3.3.
- **Vision-Frage, die entschied:** „Soll es jetzt direkt mit dem Schreiben mit KI weitergehen, oder vorher eine Session für vorsorglichen Umbau?" → Antwort des Eigentümers: Empfehlung A.
- **Konfidenz zum Zeitpunkt:** hoch für „nicht neu aufsetzen" (Prüf-Instanz und bauende KI übereinstimmend); mittel für „Aufteilung von `api` erst in 3.3 reicht" (Wachstum erst an echten Abläufen messbar). Umkehrbarkeit billig (Umbau innerhalb eines Moduls).
- **Konsequenzen:** Phase 3 beginnt mit Schritt 3.1; keine Umbau- oder Neuaufbau-Schritte. 3.3 trägt die Pflichtnotiz; beim Phasenende 3 wird `api` erneut auf Heuristik 1.4 geprüft.
- **Abgeleitete Regel:** keine

---

#### ADR-021: Observability – Log-Zeile je KI-Anfrage belastbar, Verbrauchsspeicherung in 3.9

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[MODUL]` `[DATENMODELL]`
- **Phasentyp-Kontext:** UMSETZUNG (vor Schritt 3.1)
- **Reifegrad-Wirkung:** Observability/Logging `[VORLÄUFIG]` → `[BELASTBAR]`; Observability/Metriken bleibt `[VORLÄUFIG]` bis 3.9
- **Kategorie:** Architektur (Beförderung eines Bestandteils, Notiz an 3.1 aus ADR-013); Datenmodell (Verbrauchsspeicherung) bewusst nicht jetzt
- **Kontext:** `ai_gateway` erfasst ab 3.1 Token und Kosten je Anfrage. Offen war, was davon ins Server-Log geht und ob der Verbrauch schon jetzt dauerhaft gespeichert wird (Monatssumme in der Oberfläche, `docs/architecture.md` Abschnitt 6).
- **Optionen:** A Logging jetzt festlegen, Speicherung der Verbrauchsdaten in 3.9 entscheiden / B zusätzlich jetzt eine Verbrauchsdatei unter `system/`.
- **Entscheidung:** A. Je KI-Anfrage schreibt `ai_gateway` genau eine Log-Zeile (Logger `skriptorium.ai_gateway`, Stufe INFO) mit Anbieter, Modell, Ergebnis bzw. Fehlerart, Eingabe- und Ausgabe-Token, Kosten, Gesamtdauer und Zeit bis zum ersten Textstück – nie Nachrichtentext, nie Schlüssel, nie Antworttext des Anbieters. Die Verbrauchsdaten gibt `ai_gateway` an den Aufrufer zurück; wo sie für die Monatssumme gespeichert werden, entscheidet 3.9.
- **Vision-Frage, die entschied:** „Reicht es, die Kosten bis 3.9 im OpenRouter-Konto und im Server-Log zu sehen, oder soll das Skriptorium jede Anfrage von Anfang an mitzählen?" → Antwort des Eigentümers (Frage-System): A.
- **Konfidenz zum Zeitpunkt:** hoch – Inhalt folgt aus der Regel „Logs nur mit Metadaten" (`docs/project-context.md` Abschnitt 6); Heuristik 1.1: Speicherung gehört zur Anzeige. Umkehrbarkeit billig (A → B nachrüstbar).
- **Konsequenzen:** 3.1 ohne Datenmodelländerung; `ai_gateway` bleibt ohne Dateizugriff. Anfragen aus 3.3–3.8 fehlen in der späteren Monatssumme (Testanfragen); 3.9 trägt die Entscheidung zur Speicherung.
- **Abgeleitete Regel:** keine

---

#### ADR-022: Reaktionszeit verfehlt – Ziel bleibt, Ursache wird in D.6 erkundet

- **Datum:** 2026-09-26
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[ERKENNTNIS]` `[PERFORMANCE]`
- **Phasentyp-Kontext:** UMSETZUNG (Abnahme von Schritt 3.3)
- **Reifegrad-Wirkung:** NFR Reaktionszeit `[BELASTBAR]` → `[VORLÄUFIG]` bis D.6 (Zielwerte unverändert, Erreichbarkeit unbelegt)
- **Kategorie:** Architektur – nicht-funktionale Anforderung (ADR-013)
- **Kontext:** Das Probeschreiben in 3.3 (`spikes/probeschreiben/README.md`, 16 echte Anfragen) erfüllte FR-008, FR-009 und FR-011, verfehlte aber die Reaktionszeit aus ADR-013: grok-4.7 in 14 von 15 Läufen unter 60 s, einmal 77,1 s bis zum ersten Textstück (5.271 Ausgabe-Token, überwiegend Vorab-Denken); grok-4.6 in 2 von 2 Läufen über 10 s (13,2 s, 15,8 s; in 1.5 gemessen 5–8 s). Die Anzeige „denkt nach …“, Abbruch und Modellwechsel wirken sofort. `ai_gateway` bricht nach 90 s ohne erstes Textstück ab.
- **Optionen:** A Ziel an die Messung anpassen (grok-4.7 meist unter 60 s, höchstens 90 s; grok-4.6 unter 20 s) / B Ziel bleibt, 3.3 wird erledigt, Erkundungsschritt D.6 untersucht Reasoning-Einstellung, Anbieter-Führung und die 90-s-Grenze / C 3.3 bleibt offen bis zur Klärung.
- **Entscheidung:** B.
- **Vision-Frage, die entschied:** „Ist eine gelegentliche Wartezeit von über einer Minute bis zum ersten Satz beim Schreiben hinnehmbar, oder stört sie den Schreibfluss so, dass es sich lohnt, das zu untersuchen?“ → Antwort des Eigentümers (Frage-System): untersuchen (B).
- **Konfidenz zum Zeitpunkt:** mittel – 17 Messungen sind eine Stichprobe mit großer Streuung (7–77 s); die Ursache (Vorab-Denken, Auslastung beim Anbieter) ist vermutet, nicht belegt. Umkehrbarkeit billig (nur Zielwerte und ein Fahrplan-Schritt).
- **Konsequenzen:** 3.3 `[ERLEDIGT]` mit dokumentiert verfehltem Teilkriterium; neuer Schritt D.6 (Frist: vor 4.8, Stoppuhr-Test); das Zielwert-Kriterium wird dort erneut gemessen oder per neuem ADR angepasst.
- **Abgeleitete Regel:** keine

---

#### ADR-023: Verbrauchsdaten in Monatsdateien, Modell je Geschichte

- **Datum:** 2026-09-27
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[DATENMODELL]` `[MODUL]`
- **Phasentyp-Kontext:** UMSETZUNG (Schritt 3.9; Entscheidung laut ADR-021 für 3.9 geplant, daher nicht reaktiv)
- **Reifegrad-Wirkung:** Observability/Metriken bleibt `[VORLÄUFIG]` bis zur Umsetzung in 3.9, danach `[BELASTBAR]`; Datenmodell um zwei Bestandteile erweitert
- **Kategorie:** Datenmodell (4); Architektur (1): Beziehung `api` → `storage` umfasst unter `system/` neben den Zugangsdaten jetzt die Verbrauchsdaten (Erweiterung von ADR-018)
- **Kontext:** `ai_gateway` liefert seit 3.1 Token und Kosten je Anfrage zurück (ADR-021); die Monatssumme in der Oberfläche (`docs/project-context.md` Abschnitt 8, `docs/architecture.md` Abschnitt 6) brauchte einen Speicherort. Der Grobvertrag „Modell je Geschichte wählen“ brauchte ein Kopffeld der Geschichte.
- **Optionen:** A Monatsdatei `system/verbrauch/JJJJ-MM.md` mit einer Zeile je KI-Anfrage (Zeit, Art, Modell, Token ein/aus, Kosten, Ergebnis), Monatssumme unter „Konto“, Kosten je Anfrage unter dem Vorschlag; Kopffeld `modell` in `story.md` / B nichts speichern, Monatssumme nur im OpenRouter-Konto, Modellwahl im Browser / C wie A mit Welt und Geschichte je Zeile.
- **Entscheidung:** A.
- **Vision-Frage, die entschied:** „Willst du die Monatskosten im Skriptorium selbst sehen, oder reicht dir der Blick ins OpenRouter-Konto?“ → Antwort des Eigentümers: A (im Skriptorium sehen).
- **Konfidenz zum Zeitpunkt:** hoch – bestehendes Muster (Markdown mit YAML-Kopf über `storage`, wie `system/zugang.md`), Verbrauchsdaten seit 3.1 belegt; Heuristik 1.1 (Speicherung gehört zur Anzeige). Umkehrbarkeit billig.
- **Konsequenzen:** Je KI-Anfrage (Schreiben, Kurzfassung, Gesamtzusammenfassung) eine Zeile ohne Text, Welt oder Geschichte. Abgebrochene Anfragen und Fehler werden mit Ergebnis und ohne Kosten gezählt; die Summe kann deshalb unter der Abrechnung des Anbieters liegen. Die Monatsdateien liegen im Datenverzeichnis und gehen mit in die Sicherung (4.3). Anfragen vor 3.9 fehlen (ADR-021). Die Modellwahl der Oberfläche wird je Geschichte gespeichert; neuer Endpunkt `GET /api/usage`, `PATCH …/stories/{id}` nimmt `model` an (rein additiv).
- **Abgeleitete Regel:** keine

---

#### ADR-024: Phasenende 3 – weiterbauen, Geschichtenseite in 4.1 aufteilen, Kanon-Treue in 4.8 messen

- **Datum:** 2026-09-27
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[METHODIK]`
- **Phasentyp-Kontext:** UMSETZUNG (Phasenende)
- **Reifegrad-Wirkung:** keine; NFR Kanon-Treue bleibt `[VORLÄUFIG]`, Landeplatz für die Beförderung ist jetzt 4.8
- **Kategorie:** Pflichtfrage am Phasenende (`CLAUDE.md` Abschnitt 12, „Weiterbauen, umbauen oder neu aufsetzen")
- **Kontext:** Abschluss von Phase 3 (UMSETZUNG, Schritte 3.1–3.9, alle erledigt). Bewertung durch eine getrennte Prüf-Instanz (Unteragent mit Claude Sonnet 5, anderes Modell als die bauende KI, ohne Gesprächsverlauf und ohne Logbuch; erhielt Code, Tests, Konfiguration, Architektur, ADRs, Fahrplan Phasen 3–5 und Querschnitt, Vision, Anforderungen, Heuristiken; führte Tests und Linter selbst aus), 2026-09-27. Onboarding-Re-Validation ohne Befund; Vision-Re-Derivations-Pass mit zwei Befunden (Logbuch 2026-09-27 12:21 und 12:24).
- **Bewertung der Prüf-Instanz (zusammengefasst, unverändert in der Aussage):** Weiterbauen, Konfidenz hoch. Messwerte: 377 Python-Tests (99,78 %, `canon` und `context` 100 %), 96 Komponenten-Tests (98,17 % Zeilen, 96,01 % Zweige); ruff, mypy, eslint, tsc ohne Befund; 12 begründete `noqa` (N818), kein `TODO`. Befunde: (1) kein Gott-Modul in `api` – Routen 133–223 Zeilen mit 0–4 Verzweigungen, Abläufe in `api.flows.writing` (225) und `api.flows.summary` (157), `api.usage` (118) – niedrig; (2) Modulgrenzen an den Imports eingehalten – niedrig; (3) `ui/src/views/StoryPage.tsx` mit 757 Zeilen und 7 Komponenten, beginnendes Gott-Objekt auf Dateiebene, wächst in Phase 5 weiter – mittel; (4) Reaktiv-Quote 1/10 – als mittel eingestuft; (5) Reaktionszeit (ADR-022) und Länge der Kurzfassungen (3.6) verfehlt, mit Landeplatz D.6 und D.4, können in 4.8 durchschlagen – mittel; (6) Kontexttreue beim Referenzumfang unbelegt (D.4) – niedrig; (7) `spikes/` ca. 2 MB, wachsend – niedrig; (8) Datenmodell und Schnittstellen additiv gewachsen, tragen Phase 4 und 5 – niedrig. Umbau: `StoryPage.tsx` in Einzeldateien aufteilen, D.6 vor 4.1 ziehen; Kosten klein. Neu aufsetzen: kein Beleg.
- **Stellungnahme der bauenden KI:** Zu (3) Zustimmung, geprüft (757 Zeilen, 7 Funktionen); zusätzlich hat `WritingPanel.tsx` 441 Zeilen. Korrektur: eigene Testdateien gibt es nur für einzelne Teile (`Guests`, `CanonFact`), nicht für alle. Umbau innerhalb des Moduls `ui`, kein ADR nötig. Zu (4) Widerspruch in der Einstufung: 1/10 ist ein gutes Zeichen, kein Risiko. Zu (5) teilweiser Widerspruch: D.6 vor 4.1 zu ziehen bringt nichts; entscheidend ist D.6 vor 4.8, so geplant. Zu (7) wie bei ADR-020: Rohdaten sind Beleg der ADRs und bleiben. Ergänzung aus dem Vision-Abgleich: Das Erfolgskriterium „höchstens ein Kanon-Widerspruch pro Kapitel, der beim Redigieren auffällt“ (Vision 4) ist nur im Probeschreiben der KI gemessen (3.3); die Beförderung von NFR Kanon-Treue hatte keinen Schritt. Zweite Drift behoben: 5.5 führte V.4 und V.5 nicht.
- **Optionen:** A weiterbauen, Aufteilung der Geschichtenseite in 4.1 / B vorab eigene Umbau-Session für die Oberfläche / C neu aufsetzen. Zusatzfrage Kanon-Treue: in 4.8 mit erstem echten Kapitel des Eigentümers / eigener Schritt in Phase 5.
- **Entscheidung:** A; Kanon-Treue in 4.8.
- **Vision-Frage, die entschied:** „Soll es direkt mit Phase 4 weitergehen?“ → „Empfehlung A“; „Wo wird die Kanon-Treue beim echten Schreiben gemessen?“ → „In 4.8“ (Frage-System).
- **Konfidenz zum Zeitpunkt:** hoch – Prüf-Instanz und bauende KI übereinstimmend, alle Messwerte grün. Umkehrbarkeit billig.
- **Konsequenzen:** Phase 4 beginnt mit 4.1; 4.1 teilt `StoryPage.tsx` (und bei Bedarf `WritingPanel.tsx`) in Einzeldateien je Komponente auf; 4.8 misst zusätzlich Kanon-Widersprüche in einem ersten echten Kapitel des Eigentümers und befördert NFR Kanon-Treue bei Erfolg. Keine Umbau- oder Neuaufbau-Schritte, Schrittzahl der Phase 4 unverändert (8).
- **Abgeleitete Regel:** keine

---

#### ADR-025: Bestehender netcup-VPS, Entwicklung auf macOS, SSH-Zugang der KI

- **Datum:** 2026-09-27
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[DEPLOYMENT]` `[SECURITY]` `[METHODIK]`
- **Phasentyp-Kontext:** STABILISIERUNG (Schritt 4.2)
- **Reifegrad-Wirkung:** keine; Host und Netz bleiben `[OFFEN]` bzw. `[VORLÄUFIG]` bis zur Prüfung von außen in 4.2
- **Kategorie:** Externe Abhängigkeit, Deployment-Ziel, Sicherheit (`CLAUDE.md` Abschnitt 4, Kategorien 3, 6 und 7)
- **Kontext:** Vorlage `ENTSCHEIDUNG ERFORDERLICH` zum VPS-Anbieter (Recherche `docs/research/hosting-anbieter.md`; Hetzner günstige Tarife ausverkauft). Aus der Cloud-Session ist ausgehendes SSH gesperrt, die KI kann dort keinen Server erreichen.
- **Optionen:** A netcup VPS nano (Empfehlung der KI) / B OVHcloud VPS-1 / C IONOS VPS S+ / D Hetzner CPX12.
- **Entscheidung:** Der Eigentümer hat bereits einen VPS bei netcup; dieser wird genutzt (keine Neubestellung). Die Entwicklungsumgebung wechselt von der Cloud-Session auf macOS (lokaler Rechner des Eigentümers); von dort greift die KI per SSH auf den VPS zu.
- **Vision-Frage, die entschied:** „Niedrigster Preis mit kurzer Bindung oder Vorauszahlung mit mehr Reserve?“ → vorhandenen netcup-VPS nutzen, Entwicklung auf macOS mit SSH-Zugang.
- **Konfidenz zum Zeitpunkt:** mittel – Tarif, Ausstattung und Betriebssystem des vorhandenen VPS noch nicht erfasst. Umkehrbarkeit billig (Daten als Markdown-Dateien, Umzug in Stunden).
- **Konsequenzen:**
  - Neuer Schritt 4.9 „Entwicklungsumgebung macOS einrichten“ vor der Fortsetzung von 4.2; Plattform-Matrix in `docs/project-context.md` Abschnitt 3 und Runbook folgen dort nach der Validierung.
  - Tarif, Ausstattung, Betriebssystem und Laufzeit des VPS werden in 4.2 erfasst und im Kostenregister nachgetragen.
  - Die KI erhält SSH-Zugriff auf die Produktion. Umfang (eigenes Benutzerkonto, erlaubte Befehle, kein Lesen von Secrets) ist Teil von 4.2 und Gate-Prüfpunkt 4 in 4.6; bis dahin gilt „Zugriff auf das für die Einrichtung Nötige“, kein unbeaufsichtigtes Handeln.
- **Abgeleitete Regel:** keine

#### ADR-026: Einrichtungsskript auch für macOS

- **Datum:** 2026-09-27
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[STACK]` `[METHODIK]`
- **Phasentyp-Kontext:** STABILISIERUNG (Schritt 4.9)
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Build- und Entwicklungswerkzeuge, Werkzeuge auf dem Rechner des Eigentümers (`CLAUDE.md` Abschnitt 4, Kategorien 7 und 3)
- **Kontext:** Erste Session auf dem Mac (macOS 27.0, arm64). Vorhanden: uv 0.11.7 (Homebrew), Node 24.15.0 und npm 11.12.1 (Installer von nodejs.org, `/usr/local`, gehört root), Python nur 3.9.6, bash 3.2. Das Projekt verlangt uv 0.12.19, Python 3.14.7, Node 24.21.0 (`package.json`: `>=24.21.0`). `scripts/session-start.sh` holt genau diese Versionen, läuft aber nur in der Cloud-Session (Linux x86_64, `CLAUDE_CODE_REMOTE=true`).
- **Optionen:** A `scripts/session-start.sh` auf macOS arm64 erweitern – Werkzeuge in `~/.cache/skriptorium-tools`, ohne Administratorrechte, bei jedem Sessionstart (Empfehlung der KI) / B `brew upgrade uv` und Node-Installer mit Passwort des Eigentümers (uv dann nicht exakt gepinnt) / C einmalig von Hand in `~/.cache`, im Runbook beschrieben, Pfad je Session neu setzen.
- **Entscheidung:** A.
- **Vision-Frage, die entschied:** „Dürfen Projekt-Werkzeuge bei jedem Sessionstart automatisch in deinem Benutzerordner landen, oder willst du Installationen auf deinem Mac selbst in der Hand behalten?“ → automatisch im Benutzerordner.
- **Konfidenz zum Zeitpunkt:** mittel – nicht geprüft, ob die Desktop-App `CLAUDE_ENV_FILE` für den SessionStart-Hook genauso setzt wie die Cloud-Session; bash 3.2 von macOS muss das Skript tragen oder es braucht bash aus Homebrew. Umkehrbarkeit billig.
- **Konsequenzen:**
  - Skript-Header (Plattformen, Voraussetzungen, Idempotenz) und Runbook im selben Commit nachziehen (`CLAUDE.md` Abschnitt 5); Plattform-Matrix nach der Validierung in 4.9.
  - System-Node unter `/usr/local` und Homebrew-uv bleiben unverändert.
- **Abgeleitete Regel:** keine

#### ADR-027: Skriptorium als Container hinter dem vorhandenen Reverse Proxy

- **Datum:** 2026-09-27
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[DEPLOYMENT]` `[SECURITY]` `[STACK]`
- **Phasentyp-Kontext:** STABILISIERUNG (Schritt 4.10)
- **Reifegrad-Wirkung:** keine; Host bleibt `[OFFEN]`, Netz `[VORLÄUFIG]` bis zur Prüfung von außen in 4.2
- **Kategorie:** Externe Abhängigkeit (Docker), Sicherheit (Proxy-Vertrauen), Deployment-Ziel (`CLAUDE.md` Abschnitt 4, Kategorien 3, 6 und 7)
- **Kontext:** Erkundung 4.10 (`docs/research/vps-bestand.md`): Auf dem VPS laufen alle Anwendungen als Docker-Compose-Projekte hinter einem Reverse Proxy im Container mit automatischen Zertifikaten; Firewall, SSH-Härtung, Updates, Überwachung und Sicherung des Anwendungsverzeichnisses sind vorhanden. Geplant war ein uvicorn-Prozess mit Proxy auf `127.0.0.1` (ADR-017).
- **Optionen:** A Container im Anwendungsverzeichnis, angebunden per Label an den vorhandenen Proxy, ohne veröffentlichten Port (Empfehlung der KI) / B uvicorn als Systemdienst auf dem Host, Proxy per Datei-Regel.
- **Entscheidung:** A.
- **Vision-Frage, die entschied:** „Soll sich das Skriptorium auf deinem Server genauso verhalten wie deine anderen Anwendungen?“ → ja.
- **Konfidenz zum Zeitpunkt:** hoch – Muster an zwei vorhandenen eigenen Anwendungen des Eigentümers gesehen. Umkehrbarkeit billig.
- **Konsequenzen:**
  - Neu im Projekt: Dockerfile und Compose-Datei (in 4.2); Docker ist Werkzeug des Betriebs, nicht der Entwicklung.
  - ADR-017 bleibt; nur die Proxy-Adresse ändert sich: `--forwarded-allow-ips` genau für die Adresse des Proxy-Containers, nicht für das ganze Proxy-Netz. Wirkung von außen prüfen wie in der Notiz an 4.2.
  - Zugriffsprotokoll des Proxys für das Skriptorium abschalten (Log-Regel, project-context Abschnitt 6); `frame-ancestors` als Middleware.
  - Daten im Anwendungsverzeichnis, damit die vorhandene Sicherung sie erfasst; Ziel und Wiederherstellung prüft 4.3.
  - Server-Details (Namen, Ports, Adressen, Benutzer) stehen wegen des öffentlichen Repos nur lokal beim Eigentümer.
- **Abgeleitete Regel:** keine

---

#### ADR-028: Branch-Schutz für `main`

- **Datum:** 2026-09-28
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[METHODIK]`
- **Phasentyp-Kontext:** STABILISIERUNG (Schritt 4.11)
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Build- und Deploy-Pipeline (`CLAUDE.md` Abschnitt 4, Kategorie 7)
- **Kontext:** Befund 2026-09-28: `main` hatte auf GitHub keinen Branch-Schutz, obwohl `docs/project-context.md` Abschnitt 7 und 10 Force-Push-Sperre und Merge nur bei grüner CI nennen.
- **Optionen:** A Force-Push und Löschen gesperrt, Merge nur per Pull Request mit grünen Pflicht-Gates, Admins ausgenommen (Empfehlung der KI) / B wie A, auch für Admins verbindlich / C nur Force-Push und Löschen gesperrt.
- **Entscheidung:** A.
- **Vision-Frage, die entschied:** „Willst du dir selbst erlauben, im Notfall an den Prüfungen vorbei zu mergen?“ → ja.
- **Konfidenz zum Zeitpunkt:** hoch – Standardfunktion von GitHub, Zustand per API prüfbar. Umkehrbarkeit billig.
- **Konsequenzen:**
  - Klassischer Branch-Schutz auf `main`: Pflicht-Checks „Pre-Commit (alle Hooks)“, „Python – …“, „TypeScript – …“, „End-to-End – …“ (Namen der CI-Jobs; bei Umbenennung eines Jobs muss der Schutz mitgezogen werden, sonst blockiert er jeden Merge); Pull Request ohne Pflicht-Freigabe (0 Reviews, ein Beitragender); `strict` aus; Force-Push und Löschen gesperrt; `enforce_admins` aus.
  - Beleg durch erzwungenen Fehler (2026-09-28) an einem Wegwerf-Branch mit identischer Einstellung, nicht an `main` selbst – ein Force-Push-Versuch auf `main` wäre bei Versagen des Schutzes ein destruktiver Eingriff (`CLAUDE.md` Abschnitt 8, Kriterium 6): Force-Push abgelehnt (GH006 „Cannot force-push to this branch“), Löschen abgelehnt, direkter Push ohne Pull Request als Admin durchgelassen mit „Bypassed rule violations“ (so gewollt). Einstellung an `main` danach per API ausgelesen und gleich.
  - Die Admin-Ausnahme gilt auch für den Coding-Agent, weil er mit dem Konto des Eigentümers pusht. Er umgeht sie nie: Push-Regel „nie direkt auf `main`“ bleibt (project-context Abschnitt 10).
- **Abgeleitete Regel:** keine

---

#### ADR-029: Container-Image aus offiziellen Images mit fester Version

- **Datum:** 2026-09-28
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Phasentyp-Kontext:** STABILISIERUNG (Schritt 4.2)
- **Tags:** `[OPERATIV]` `[STACK]` `[DEPLOYMENT]`
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Externe Abhängigkeiten (`CLAUDE.md` Abschnitt 4, Kategorie 3)
- **Kontext:** ADR-027 verlangt ein Container-Image für den Betrieb auf dem VPS.
- **Optionen:** A offizielle Images mit den fixierten Versionen – `python:3.14.7-slim` zur Laufzeit, `node:24.21.0-slim` und uv 0.12.19 nur in der Bau-Stufe (Empfehlung der KI) / B fertiges Allzweck-Image eines Drittanbieters.
- **Entscheidung:** A.
- **Vision-Frage, die entschied:** „Soll im Container genau das laufen, was auch getestet wird?“ → ja.
- **Konfidenz zum Zeitpunkt:** hoch – Versionen bereits verifiziert (project-context Abschnitt 3). Umkehrbarkeit billig.
- **Konsequenzen:**
  - `Dockerfile` und `.dockerignore` im Repo; mehrstufiger Bau: Oberfläche mit Node, Python-Abhängigkeiten mit uv (`uv sync --frozen --no-dev`), Laufzeit ohne Node und uv; Prozess ohne root-Rechte.
  - Images werden mit Versions-Tag bezogen; Nachprüfung zusammen mit den Linien im Ablaufdaten-Register.
- **Abgeleitete Regel:** keine

---

#### ADR-030: Eigenes Netz zwischen Proxy und Skriptorium

- **Datum:** 2026-09-28
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Phasentyp-Kontext:** STABILISIERUNG (Schritt 4.2)
- **Tags:** `[OPERATIV]` `[SECURITY]` `[DEPLOYMENT]`
- **Reifegrad-Wirkung:** keine (Netz bleibt `[VORLÄUFIG]` bis zur Prüfung von außen)
- **Kategorie:** Sicherheit (`CLAUDE.md` Abschnitt 4, Kategorie 6)
- **Kontext:** Die Sperre nach Fehlversuchen richtet sich nach der Adresse des Besuchers (ADR-017); uvicorn darf `X-Forwarded-For` nur vom Proxy annehmen. Befund 2026-09-28: Die Adresse des Proxy-Containers ist nicht fest, im gemeinsamen Proxy-Netz hängen weitere Anwendungen (`docs/research/vps-bestand.md`, Befund 1).
- **Optionen:** A eigenes kleines Netz nur für Proxy und Skriptorium, uvicorn vertraut nur diesem Netz; dafür eine Ergänzung der Proxy-Konfiguration (Empfehlung der KI) / B feste Adresse des Proxys im vorhandenen Netz / C Adresse beim Start nachschlagen – nach einem Neustart des Proxys teilen sich alle Besucher eine Sperre.
- **Entscheidung:** A.
- **Vision-Frage, die entschied:** „Darf die Proxy-Konfiguration um das Netz ergänzt werden, obwohl der Proxy auch andere Dienste trägt?“ → ja (mit Sicherungskopie vorher).
- **Konfidenz zum Zeitpunkt:** hoch – uvicorn 0.52 akzeptiert Netzbereiche in `--forwarded-allow-ips` (im Code geprüft). Umkehrbarkeit billig.
- **Konsequenzen:** `--forwarded-allow-ips` enthält genau den Bereich dieses Netzes; das Skriptorium hängt nur an diesem Netz. Wirkung von außen prüfen wie in der Notiz an 4.2.
- **Abgeleitete Regel:** keine

---

#### ADR-031: Kurznamen im Zugriffsprotokoll des Proxys zulässig

- **Datum:** 2026-09-28
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Phasentyp-Kontext:** STABILISIERUNG (Schritt 4.2)
- **Tags:** `[OPERATIV]` `[SECURITY]`
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Datenschutz (`CLAUDE.md` Abschnitt 4, Kategorie 6)
- **Kontext:** Das Zugriffsprotokoll des Proxys schreibt für alle Anwendungen die Pfade mit, darin die Kurznamen von Welten und Geschichten; die Proxy-Version kann das Protokoll nicht je Anwendung abschalten (`docs/research/vps-bestand.md`, Befund 2).
- **Optionen:** A Log-Regel auslegen: Kurznamen im Protokoll des Proxys zulässig, Inhalte bleiben verboten (Empfehlung der KI) / B Pfade für alle Anwendungen aus dem Protokoll entfernen / C Proxy auf eine neue Major-Version heben.
- **Entscheidung:** A.
- **Vision-Frage, die entschied:** „Stört es dich, wenn Titel deiner Welten und Geschichten in einem Protokoll auf deinem eigenen Server stehen?“ → nein.
- **Konfidenz zum Zeitpunkt:** mittel – die fehlende Abschaltung je Anwendung stammt aus der Dokumentation des Proxys, nicht aus einem Versuch. Umkehrbarkeit billig.
- **Konsequenzen:** Die Log-Regel (project-context Abschnitt 6) gilt für die Protokolle des Skriptoriums unverändert; im Protokoll des Proxys sind Pfade mit Kurznamen zulässig. Texte aus Welten und Manuskripten stehen nie in Pfaden.
- **Abgeleitete Regel:** keine

---

#### ADR-032: Einrichtung auf dem VPS mit dem vorhandenen Administrator-Zugang

- **Datum:** 2026-09-28
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Phasentyp-Kontext:** STABILISIERUNG (Schritt 4.2)
- **Tags:** `[OPERATIV]` `[SECURITY]` `[DEPLOYMENT]`
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Sicherheit (`CLAUDE.md` Abschnitt 4, Kategorie 6)
- **Kontext:** Die KI meldet sich am VPS als Administrator an (`docs/research/vps-bestand.md`, Befund 6). Vorgelegt: A eingeschränktes Konto nach der Einrichtung / B Konto in der Docker-Gruppe / C Administrator behalten mit Restrisiko.
- **Entscheidung:** Die Einrichtung in 4.2 erfolgt mit dem vorhandenen Administrator-Zugang (Anweisung des Eigentümers). Server-Details stehen nicht im Repo (ADR-025, ADR-027). Das Skriptorium bleibt bis zum Gate (4.6) von außen nicht erreichbar.
- **Vision-Frage, die entschied:** „Soll das Skriptorium schon vor dem Gate aus dem Internet erreichbar sein?“ → nein.
- **Konfidenz zum Zeitpunkt:** hoch. Umkehrbarkeit billig.
- **Konsequenzen:** Die Beschränkung des Zugriffs der KI nach der Einrichtung (Gate-Punkt 4) ist nicht entschieden und wird in Gate-Schritt 4.6 vorgelegt; bis dahin gilt der Zugriff als offen.
- **Abgeleitete Regel:** keine

---

#### ADR-033: Reverse Proxy auf die unterstützte Linie 3.7

- **Datum:** 2026-09-28
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[SECURITY]` `[DEPLOYMENT]`
- **Phasentyp-Kontext:** STABILISIERUNG (Schritt 4.12)
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Externe Abhängigkeiten, Deploy (`CLAUDE.md` Abschnitt 4, Kategorien 3 und 7)
- **Kontext:** D.7: Sicherheitsunterstützung der Proxy-Linie 2.11 endete 2026-09-07; unterstützt ist nur 3.7. Der Proxy ist der einzige Eingang für alle Dienste des Eigentümers.
- **Optionen:** A Update auf 3.7 mit fester Patch-Version, Sicherungskopie, Prüfung aller Dienste von außen vorher und nachher, Rückweg über das alte Image (Empfehlung der KI) / B bei 2.11 bleiben, Restrisiko per ADR.
- **Entscheidung:** A, sofort.
- **Vision-Frage, die entschied:** „Darf ich deine Dienste für ein paar Minuten unterbrechen, um den Proxy zu aktualisieren?“ → ja, jetzt.
- **Konfidenz zum Zeitpunkt:** mittel – Routing-Regeln geprüft, Grundkonfiguration erst beim Umsetzen. Umkehrbarkeit billig.
- **Konsequenzen:** Proxy auf `v3.7.13`; Ablaufdaten-Register nachziehen. Mit v3 wird die Abschaltung des Zugriffsprotokolls je Anwendung möglich – ADR-031 kann in 4.7 überprüft werden.
- **Abgeleitete Regel:** keine

---

#### ADR-034: Keine eigene Erreichbarkeits-Überwachung

- **Datum:** 2026-09-28
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[DEPLOYMENT]`
- **Phasentyp-Kontext:** STABILISIERUNG (Schritt 4.2)
- **Reifegrad-Wirkung:** keine unmittelbare; ermöglicht den Abschluss von 4.2 (Host → `[BELASTBAR]`)
- **Kategorie:** Deploy (`CLAUDE.md` Abschnitt 4, Kategorie 7)
- **Kontext:** Akzeptanzkriterium von 4.2: „Erreichbarkeits-Prüfung meldet einen absichtlich herbeigeführten Ausfall“. Die vorhandene Überwachung auf dem VPS (Uptime Kuma) erreicht das Skriptorium nicht (nur am Proxy-Netz, ADR-030) und hat laut Eigentümer eine andere Aufgabe. Keine ASVS-L1-Anforderung und kein Gate-Punkt verlangt eine Erreichbarkeits-Überwachung; ADR-008 lässt Stillstand zu.
- **Optionen:** A keine eigene Überwachung, Restrisiko per ADR (Empfehlung der KI, Regel „Schutzbedarf ist Obergrenze“) / B geplanter GitHub-Actions-Lauf ruft ab 4.7 die öffentliche Gesundheitsprüfung auf, Fehler-Mail von GitHub. Vorher verworfen: Kuma an das Netz des Skriptoriums (weicht ADR-030 auf), Push-Job auf dem Server, Kuma nach 4.7 – alle drei, weil Kuma nicht dafür vorgesehen ist.
- **Entscheidung:** A.
- **Vision-Frage, die entschied:** „Willst du über einen Ausfall informiert werden, bevor du selbst schreiben willst, oder reicht es, ihn dann zu bemerken?“ → bemerken reicht.
- **Konfidenz zum Zeitpunkt:** hoch – Netz und Mounts der Überwachung auf dem Server geprüft; Anforderungslage aus ADR-006, ADR-007, ADR-008. Umkehrbarkeit billig (B jederzeit nachrüstbar).
- **Restrisiko:** Ein Ausfall fällt erst auf, wenn der Eigentümer schreiben will. Texte sind nicht betroffen (Dateien auf dem Server, Sicherungen aus 4.3). Ein stiller Ausfall der Sicherung ist davon nicht abgedeckt – das bleibt Aufgabe von 4.3.
- **Konsequenzen:** Das Überwachungs-Kriterium entfällt aus 4.2; `docs/project-context.md` Abschnitt 8 „Monitoring“ nachgezogen. Neu vorlegen, falls ein zweiter Nutzer oder feste Schreibtermine hinzukommen.
- **Abgeleitete Regel:** keine

---

#### ADR-035: Reaktionszeit – Zielwerte an die Messung angepasst

- **Datum:** 2026-09-28
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[ERKENNTNIS]` `[PERFORMANCE]`
- **Phasentyp-Kontext:** ERKUNDUNG (Schritt D.6, Querschnitt während Phase 4)
- **Reifegrad-Wirkung:** NFR Reaktionszeit `[VORLÄUFIG]` → `[BELASTBAR]`
- **Kategorie:** Architektur – nicht-funktionale Anforderung (ADR-013, ADR-022)
- **Kontext:** D.6 (`spikes/reaktionszeit/README.md`, 28 Läufe vom VPS): Die Zeit bis zum ersten Textstück hängt fast linear an der Länge des Vorab-Denkens (ca. 16 ms je Denk-Token), die bei gleichem Kontext stark streut. `ai_gateway` nutzt schon `effort: low`; Abschalten lehnt der Anbieter ab; eine Obergrenze für Denk-Token verlängert das Denken (54–149 s); einziger Anbieter xAI. grok-4.7 4–29 s (Median 16 s), grok-4.6 5–11 s (Median 6 s); in 3.3 einmal 77 s.
- **Optionen:** A Zielwerte anpassen, Einstellungen bleiben (Empfehlung der KI) / B grok-4.6 als Startmodell / C Ziel bleibt, weitere Modelle erkunden.
- **Entscheidung:** A – grok-4.7: erstes Textstück meist unter 30 s, höchstens 90 s (Abbruchgrenze in `ai_gateway` mit Meldung); grok-4.6: meist unter 10 s, höchstens 20 s. Anzeige innerhalb 1 s, Abbruch und Modellwechsel jederzeit bleiben.
- **Vision-Frage, die entschied:** „Stört dich eine typische Wartezeit von etwa 15–30 Sekunden bis zum ersten Satz, oder ist das hinnehmbar, wenn du bei Bedarf auf das schnellere Modell wechseln kannst?“ → hinnehmbar (A).
- **Konfidenz zum Zeitpunkt:** hoch – klare Beziehung Denk-Token ↔ Wartezeit, alle Stellschrauben ausprobiert; Tageszeit nicht geprüft. Umkehrbarkeit billig.
- **Konsequenzen:** Keine Code-Änderung; 90-s-Grenze bleibt. Die Beobachtung im 30-Minuten-Test 4.8 zeigt, ob die Wartezeit im echten Schreiben stört.
- **Abgeleitete Regel:** keine

---

#### ADR-036: Sicherungsziel – Duplicati nach MEGA S4 mit eigenem, auf einen Bucket beschränkten Benutzer

- **Datum:** 2026-09-30
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[DEPLOYMENT]` `[SECURITY]`
- **Phasentyp-Kontext:** STABILISIERUNG (Schritt 4.3)
- **Reifegrad-Wirkung:** keine unmittelbare; Backups und Wiederherstellung → `[BELASTBAR]` erst nach erprobter Wiederherstellung (4.3)
- **Kategorie:** Externe Abhängigkeiten, Sicherheit, Deploy (`CLAUDE.md` Abschnitt 4, Kategorien 3, 6 und 7)
- **Kontext:** Gate-Punkt 5 verlangt eine Sicherung außerhalb des Servers. Die vorhandene Duplicati-Sicherung auf dem VPS hat kein externes Ziel (4.3, 2026-09-28). Vorgelegt am 2026-09-28: A Mac holt täglich per SSH, B Mietspeicher mit restic, C Duplicati mit externem Ziel. Am 2026-09-30 fragte der Eigentümer nach Duplicati-Zielen und wählte Mega.nz. Befunde: Das Mega-Ziel von Duplicati ist laut Hersteller nicht mehr empfohlen (Bibliothek MegaApiClient ungepflegt) und braucht Benutzername und Passwort des ganzen Kontos auf dem Server, Zwei-Faktor für Automatik ungeeignet (docs.duplicati.com, Mega.nz Destination, abgerufen 2026-09-30). Der Tarif des Eigentümers enthält MEGA S4 (S3-kompatibel). S4 verweigert standardmäßig alles; Bucket-Richtlinien erlauben einem einzelnen IAM-Benutzer Aktionen auf genau einem Bucket; Rollen gibt es nicht, die verwalteten Richtlinien gelten stets für alle Buckets (help.mega.io „Bucket-Richtlinien“ und „Policies hierarchy“, Stand 2026-05-04; github.com/meganz/s4-specs Abschnitt 3.2). Object Lock und Versionierung unterstützt S4 nicht (s4-specs).
- **Optionen:** A Mac holt per SSH (Empfehlung der KI vom 2026-09-28) / B Mietspeicher mit restic / C1 Duplicati mit Mega-Ziel (Kontopasswort auf dem Server, vom Hersteller abgeraten) / C2 Duplicati über „S3-kompatibel“ nach MEGA S4 mit eigenem IAM-Benutzer ohne verwaltete Richtlinie und einer Bucket-Richtlinie nur für den Sicherungs-Bucket (Empfehlung der KI nach der Wahl von Mega).
- **Entscheidung:** C2. Bucket und IAM-Benutzer hat der Eigentümer am 2026-09-30 angelegt; die Bucket-Richtlinie erlaubt dem Benutzer `s3:ListBucket` auf dem Bucket und `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` auf dessen Objekten, sonst nichts. Zugangsschlüssel für diesen Benutzer (nicht „Root user“) angelegt; Werte nur beim Eigentümer. ARN, Kontonummer und Endpunkt stehen wegen des öffentlichen Repos nur lokal.
- **Vision-Frage, die entschied:** „Wohin sollen die täglichen Sicherungen gehen?“ → Mega; nach den Befunden: über S4 mit beschränktem Schlüssel.
- **Konfidenz zum Zeitpunkt:** mittel – Beschränkung nur aus Megas Dokumentation belegt, noch nicht am Konto; Duplicati-Anbindung an S4 nicht erprobt. Umkehrbarkeit billig (Ziel in Duplicati austauschbar, keine Daten gebunden).
- **Restrisiko:** Wer den VPS übernimmt, kann mit dem Schlüssel die Sicherungen im Bucket löschen (Duplicati braucht Löschen für das Aufräumen alter Stände; kein Löschschutz in S4), aber nicht lesen (Duplicati verschlüsselt vor dem Hochladen) und nichts sonst im Mega-Konto erreichen. Abhilfe bei Bedarf: gelegentliche zweite Kopie des Buckets auf den Mac (optional, vom Schutzbedarf normal nicht verlangt, ADR-007).
- **Konsequenzen:** 4.3 in der Mac-Session (SSH nur von dort, ADR-025): Duplicati-Auftrag für das Datenverzeichnis ohne Index, Ziel S4, eigene Verschlüsselungs-Passphrase, die der Eigentümer zusätzlich außerhalb des Servers verwahrt (ohne sie keine Wiederherstellung nach Verlust des Servers). Beleg der Beschränkung durch erzwungenen Fehler: derselbe Schlüssel scheitert an einem anderen Bucket (CLAUDE.md Abschnitt 6). Zwei neue Secrets (S4-Schlüssel, Passphrase) mit Ablageort und Rotationsweg für Gate-Punkt 4. Keine zusätzlichen Projektkosten (vorhandener Mega-Tarif des Eigentümers).
- **Abgeleitete Regel:** keine

---

#### ADR-037: Zugriff der KI auf die Produktion bleibt unverändert; Schlüsseltausch nicht erprobt

- **Datum:** 2026-09-30
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[SECURITY]`
- **Phasentyp-Kontext:** STABILISIERUNG (Gate-Schritt 4.6, Prüfpunkt 4)
- **Reifegrad-Wirkung:** keine unmittelbare; „Secrets im Betrieb“ → `[BELASTBAR]` erst mit Abschluss von 4.6
- **Kategorie:** Sicherheit (`CLAUDE.md` Abschnitt 4, Kategorie 6)
- **Kontext:** ADR-032 ließ offen, wie der Zugriff der KI nach der Einrichtung beschränkt wird. Das Gate verlangt, dass der Zugriff festgelegt und auf das Nötige beschränkt ist, und einen Rotationsweg je Secret. Vorgelegt am 2026-09-30: A eigenes eingeschränktes Konto / B Administrator-Zugang mit zusätzlichen festen Regeln (Empfehlung der KI) / C kein Serverzugriff der KI nach dem Deployment; dazu die Frage, ob der Tausch des OpenRouter-Schlüssels (Runbook Abschnitt 7) einmal erprobt wird.
- **Optionen:** A / B / C wie oben; Schlüsseltausch erproben oder verzichten.
- **Entscheidung:** „Es bleibt so, wie es jetzt gerade ist.“ Die KI arbeitet weiter mit dem vorhandenen Administrator-Zugang (SSH-Schlüssel auf dem Mac des Eigentümers, ADR-025, ADR-032), ohne technisches Sonderkonto und ohne zusätzliche Regeln. Es gelten die bestehenden Regeln aus `CLAUDE.md`: keine Secret-Werte in der Ausgabe (Abschnitt 6), Stopp vor destruktiven Eingriffen (Abschnitt 8), Freigabe für die Kategorien aus Abschnitt 4; kein unbeaufsichtigtes Handeln (`docs/project-context.md` Abschnitt 8). Der OpenRouter-Schlüssel wird nicht getauscht; der Rotationsweg bleibt beschrieben, aber unerprobt.
- **Vision-Frage, die entschied:** „Soll die KI auf deinem Server weiter alles tun können, was du kannst, oder willst du sie technisch aussperren?“ → es bleibt, wie es ist.
- **Konfidenz zum Zeitpunkt:** mittel bis hoch (Schwäche von A belegt: Docker-Zugriff ist root-gleich, der Administrator-Schlüssel liegt auf demselben Mac). Umkehrbarkeit billig.
- **Restrisiko:** Der Zugriff der KI ist technisch nicht beschränkt – ein Fehler der KI oder eine Übernahme des Macs trifft den ganzen Server samt der anderen Dienste des Eigentümers; Schutz nur durch Regeln und Aufsicht. Der Schlüsseltausch ist nie geübt: im Ernstfall kann der Befehl aus dem Runbook scheitern; Widerruf bei OpenRouter wirkt davon unabhängig sofort, das Skriptorium liefe dann bis zur Klärung ohne KI.
- **Konsequenzen:** Gate-Punkt 4 zum Zugriff der KI und Punkt 4b sind damit entschieden (Verzicht mit benanntem Restrisiko). Offen bleibt 4a (Ablage der Sicherungs-Zugangsdaten außerhalb des Servers).
- **Abgeleitete Regel:** keine

---

#### ADR-038: Gate 4.6 – Verzicht auf die Ablage der Sicherungs-Zugangsdaten außerhalb des Servers vor dem Deployment

- **Datum:** 2026-09-30
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[SECURITY]` `[DEPLOYMENT]`
- **Phasentyp-Kontext:** STABILISIERUNG (Gate-Schritt 4.6, Prüfpunkt 4a)
- **Reifegrad-Wirkung:** „Secrets im Betrieb“ → `[VORLÄUFIG]` statt `[BELASTBAR]`; Beförderung mit D.11
- **Kategorie:** Sicherheit (`CLAUDE.md` Abschnitt 4, Kategorie 6; Verzicht auf einen Gate-Prüfpunkt nach Abschnitt 12)
- **Kontext:** Im Gate waren alle Prüfpunkte belegt oder entschieden (ADR-037) außer 4a: Duplicati-Passphrase und S4-Schlüssel liegen nur im Duplicati-Auftrag auf dem VPS (Schlüssel zusätzlich bei Mega). Der Eigentümer hat keinen Passwort-Manager in Betrieb und hat die Wahl vertagt. Die KI hat mehrfach auf die Folge hingewiesen. Am 2026-09-28 hatte der Eigentümer festgelegt, dass kein Gate-Punkt übersprungen wird.
- **Optionen:** A Gate offen lassen, bis 4a erledigt ist (Stand der KI) / B 4a aus dem Gate nehmen und mit Frist nachholen.
- **Entscheidung:** B – Anweisung des Eigentümers: „4.6 überspringen.“ Das Gate wird mit den belegten Punkten geschlossen; 4a wird als D.11 mit Frist geführt. Die Festlegung vom 2026-09-28 ist für diesen einen Punkt aufgehoben.
- **Vision-Frage, die entschied:** „Soll das Deployment warten, bis die Zugangsdaten der Sicherung außerhalb des Servers liegen?“ → nein.
- **Konfidenz zum Zeitpunkt:** hoch, was die Folge angeht; die Abwägung ist Sache des Eigentümers. Umkehrbarkeit billig, solange der VPS läuft (Werte jederzeit aus dem Duplicati-Auftrag exportierbar); nach Verlust des VPS nicht mehr.
- **Restrisiko:** Geht der VPS verloren, bevor D.11 erledigt ist, ist die Sicherung in MEGA S4 nicht lesbar – alle bis dahin geschriebenen Welten und Texte wären verloren. Bis zum ersten echten Inhalt (30-Minuten-Test 4.8) ist das Datenverzeichnis leer, der Schaden träte also erst danach ein.
- **Konsequenzen:** 4.6 `[ERLEDIGT]`, 4.7 kann beginnen. D.11 mit Frist „vor dem ersten echten Kapitel in 4.8, spätestens 2026-10-31“. Runbook Abschnitt 7 nennt den Ablageort weiter als offen.
- **Abgeleitete Regel:** keine

---

#### ADR-039: Deployment von Hand durch die KI auf Anweisung; Adresse des Skriptoriums

- **Datum:** 2026-09-30
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[DEPLOYMENT]`
- **Phasentyp-Kontext:** STABILISIERUNG (Schritt 4.7)
- **Reifegrad-Wirkung:** keine unmittelbare; Netz → `[BELASTBAR]` nach den Prüfungen von außen in 4.7
- **Kategorie:** Build- und Deploy-Pipeline (`CLAUDE.md` Abschnitt 4, Kategorie 7)
- **Kontext:** Der Stand auf dem VPS wurde in 4.2 von Hand eingespielt (Dateikopie mit `REVISION`, Image-Bau auf dem Server). Für den Betrieb braucht es einen festgelegten Weg. Auf dem VPS existiert ein selbst gehosteter GitHub-Actions-Runner für andere Anwendungen des Eigentümers.
- **Optionen:** A von Hand durch die KI per SSH, nur auf ausdrückliche Anweisung des Eigentümers (Empfehlung der KI) / B automatisch über den vorhandenen Runner bei jedem Merge auf `main` / C Image-Bau bei GitHub, der VPS holt das Image ab.
- **Entscheidung:** A. Ablauf: Stand von `main` (nach grüner CI) als Archiv auf den VPS übertragen, Anwendungsverzeichnis ersetzen, `REVISION` schreiben, `docker compose build`, `docker compose up -d`, Gesundheitsprüfung; Rückweg über das vorherige Image. Adresse: eine Subdomain der Domain des Eigentümers (Wert nur lokal, öffentliches Repo); Zertifikat über den vorhandenen Resolver des Proxys.
- **Vision-Frage, die entschied:** „Sollen neue Versionen nur dann auf den Server kommen, wenn du es ausdrücklich sagst – oder automatisch nach jeder Änderung?“ → nur auf Anweisung.
- **Konfidenz zum Zeitpunkt:** hoch – derselbe Weg hat in 4.2 funktioniert. Umkehrbarkeit billig.
- **Konsequenzen:** Kein Deployment-Workflow in `.github/workflows/`; `docs/project-context.md` Abschnitt 8 nennt den Weg; Ablauf im Runbook Abschnitt 7 („Neue Version einspielen“). Kein unbeaufsichtigtes Handeln der KI auf der Produktion (unverändert).
- **Abgeleitete Regel:** keine

---

#### ADR-040: D.8 verworfen – Passwort der Proxy-Verwaltung wird nicht rotiert

- **Datum:** 2026-10-07
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[SECURITY]`
- **Phasentyp-Kontext:** STABILISIERUNG (Querschnitt-Schritt D.8)
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Sicherheit (`CLAUDE.md` Abschnitt 4, Kategorie 6; Verzicht auf die Rotation eines als kompromittiert geltenden Secrets nach Abschnitt 6)
- **Kontext:** Am 2026-09-28 gelangte beim Lesen der Proxy-Konfiguration (4.12) der bcrypt-Hash des Passworts der Proxy-Verwaltung ins Gesprächsprotokoll der KI. Nach `CLAUDE.md` Abschnitt 6 gilt das Secret damit als kompromittiert; D.8 sollte es bis 2026-10-05 rotieren. Ein Versuch am 2026-09-28 wurde vor der Eingabe abgebrochen; die Frist ist verstrichen.
- **Optionen:** A D.8 verwerfen, Restrisiko per ADR / B D.8 mit neuer Frist behalten (Empfehlung der KI: ca. 5 Minuten Aufwand, Weg mit verdeckter Eingabe vorbereitet) / C Proxy-Verwaltung abschalten statt rotieren.
- **Entscheidung:** A – Anweisung des Eigentümers: „D8 streichen“, Begründung: „Passwort stark“.
- **Vision-Frage, die entschied:** „Ist das Passwort lang, zufällig und nirgends sonst verwendet?“ → stark (Angabe des Eigentümers, von der KI nicht prüfbar).
- **Konfidenz zum Zeitpunkt:** mittel – offengelegt ist nur der Hash, nicht das Passwort; bcrypt macht das Erraten eines starken Passworts praktisch aussichtslos. Ob das Passwort stark und einmalig ist und ob die Verwaltung von außen erreichbar ist, kann die KI nicht prüfen. Umkehrbarkeit billig (Rotation jederzeit nachholbar).
- **Restrisiko:** Wer das Gesprächsprotokoll erhält, kann offline versuchen, das Passwort aus dem Hash zu erraten. Gelingt das (schwaches oder anderswo verwendetes Passwort), hat er Zugriff auf die Proxy-Verwaltung, sofern sie für ihn erreichbar ist – betroffen wären alle Dienste hinter dem Proxy, nicht nur das Skriptorium. Bei einem starken, einmaligen Passwort ist das Risiko gering.
- **Konsequenzen:** D.8 `[VERWORFEN]`; README „Nächste Schritte“ ohne D.8. Bei einem Verdacht auf Zugriff oder einer Änderung an der Proxy-Verwaltung wird die Rotation neu vorgelegt.
- **Abgeleitete Regel:** keine

---

#### ADR-041: Kürzerer, lesbarer Einrichtungscode

- **Datum:** 2026-10-07
- **Entscheider:** Eigentümer
- **Status:** Aktiv (ändert den Einrichtungscode aus ADR-017)
- **Tags:** `[OPERATIV]` `[SECURITY]`
- **Phasentyp-Kontext:** STABILISIERUNG (Schritt 4.13, vor 4.8)
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Sicherheit (`CLAUDE.md` Abschnitt 4, Kategorie 6)
- **Kontext:** Vor dem 30-Minuten-Test (4.8): Der Einrichtungscode aus ADR-017 (128 Bit, `token_urlsafe`, 22 Zeichen, Groß-/Kleinschreibung, `-` und `_`) ist dem Eigentümer zum Abtippen zu lang. Schutz vor Raten online: 10 Fehlversuche je Adresse in 15 Minuten, keine Gesamtsperre; Code gilt 24 Stunden und einmal.
- **Optionen:** A 12 Zeichen in Dreiergruppen aus 31 Zeichen ohne Verwechsler (Großbuchstaben und Ziffern ohne 0, O, 1, I, L), Eingabe ohne Rücksicht auf Groß-/Kleinschreibung, Bindestriche und Leerzeichen ignoriert (Empfehlung der KI) / B unverändert, Code kopieren / C 6 Ziffern (nicht empfohlen: bei Sperre nur je Adresse mit vielen Adressen in 24 Stunden erratbar).
- **Entscheidung:** A – Eigentümer: „A, mach das“.
- **Vision-Frage, die entschied:** „Willst du den Code auch am Handy eintippen können?“
- **Konfidenz zum Zeitpunkt:** hoch – 31^12 ≈ 7,9 · 10^17 (≈ 59 Bit); selbst 100.000 Adressen schaffen bei der Fehlversuchsgrenze ca. 10^8 Versuche am Tag. Umkehrbarkeit billig.
- **Folge für die Ablage:** Bei 59 Bit reicht ein schneller Hash nicht mehr gegen Raten aus einer abgeflossenen `system/zugang.md` (z. B. über eine Sicherung): Der Code wird deshalb wie das Passwort mit scrypt gespeichert (ASVS 11.4.2), nicht mehr mit SHA-256. Ein noch mit SHA-256 gespeicherter Code gilt nicht mehr; ein neuer Code ist jederzeit erzeugbar.
- **Restrisiko:** geringerer Sicherheitsabstand als mit 128 Bit; weiterhin weit über einer realistischen Bedrohung für ein System mit einem Nutzer.
- **Konsequenzen:** Schritt 4.13; unabhängige Prüfung durch getrennte Instanz (Definition of Done, Kategorie 6); Deployment nach ADR-039.
- **Abgeleitete Regel:** keine

---

#### ADR-042: Phasenende 4 / Phasen-Wucherung – gezielt umbauen, Befunde in neue Phase 5

- **Datum:** 2026-10-08
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[STRATEGISCH]` `[METHODIK]`
- **Phasentyp-Kontext:** STABILISIERUNG (STOPP Phasen-Wucherung in Phase 4; gilt zugleich als Pflichtfrage am Phasenende 4, solange Phase 4 bis zum Abschluss von 4.8 keine weiteren Schritte bekommt)
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Pflichtfrage „Weiterbauen, umbauen oder neu aufsetzen“ (`CLAUDE.md` Abschnitt 8 Kriterium 9 und Abschnitt 12)
- **Kontext:** Phase 4 erreichte 16 Schritte (ursprünglich 8); der Befund Modell-Sperren wäre der 17. gewesen (STOPP 2026-10-08). Am selben Tag lieferte der Eigentümer weitere Befunde und Wünsche aus der Nutzung (Logbuch 2026-10-08 08:35–11:25 UTC): Scrollen beim Wiedereinstieg, Einleitungs- und Schlusssätze der KI, Anweisungs-Verlauf, fehlende Kosten, unübersichtliche Oberfläche (Ziel intuitiv, Gestaltung später), Weltenbauer, Austausch mit SillyTavern, aktuelle Modell-Auswahl; grok-4.7 sperrt stark, grok-4.6 gut machbar.
- **Bewertung der getrennten Instanz:** Unteragent mit Sonnet 5 (anderes Modell als die bauende KI), ohne Gesprächsverlauf, nur lesend; unverändert in `docs/research/bewertung-phase-4.md`. Kern: Bestand solide (410 Python-Tests, 99,79 %, Kern-Module 100 %, Reaktiv-Quote 0/10, keine Platzhalter, saubere Modulgrenzen); Schwächen in der Oberfläche (`StoryPage.tsx` stapelt alles, `App.tsx` ohne Navigation) und fest verdrahtete Modell-Liste. Empfehlung: gezielt umbauen (Oberfläche, Modell-Katalog), Kern behalten, Phase 4 schlank abschließen, Befunde in eigene Phase. Konfidenz mittel bis hoch.
- **Stellungnahme der bauenden KI:** Zustimmung; Ergänzungen: drei kleine Abhilfen vorziehen (Startmodell, Rahmen, Sprung ans Textende); Erkennung von Sperren im Text ist bei den Genres des Eigentümers nicht „klein“ (auch Figuren weigern sich) und wird erst erkundet; Router erst im Umbau-Schritt entscheiden. Logbuch 2026-10-08 11:50 UTC.
- **Vision-Abgleich (Re-Derivation gegen `docs/vision.md`):** Jedes Vision-Element hat einen Schritt oder ist erledigt: Kanon-Kategorien, Gegenstände, `@`, Trennung der Welten, Gäste, Wechsel im Manuskript, Fakten aus dem Text (FR-001–FR-005, FR-007–FR-009, FR-011–FR-013, FR-015–FR-017 erledigt); Vorschläge ohne `@` 5.1; kein Kontextverlust D.4; Mobil 5.2; offene Formate 5.3; Publizieren und Bilder V.1/V.2. Neu: Vision 6 („Modellwechsel muss möglich bleiben“) und 7 („freie Modellwahl“) stützen 5.7 und 5.12; Vision 8 („überladene Oberfläche“ nicht übernehmen) stützt 5.11; Vision-Risiko 9 „manuelle Kanon-Pflege“ wird durch V.9 (Weltenbauer) adressiert. Kein verwaistes Element. FR-022 erfüllt ohne Messung (Abweichung bleibt für den Go-Live-Abgleich in 4.8 genannt).
- **Optionen:** A weiterbauen / B gezielt umbauen (Oberfläche und Modell-Katalog, Kern unverändert, vorab drei kleine Abhilfen) / C neu aufsetzen.
- **Entscheidung:** B – Eigentümer: „B“.
- **Vision-Frage, die entschied:** „Bleibt das Manuskript die Hauptansicht, und der Verlauf deiner Anweisungen ist nur ein Nachschlage-Verlauf zum Umschalten?“ → „Manuskript“ (Frage-System, 2026-10-08).
- **Konfidenz zum Zeitpunkt:** mittel bis hoch für „Kern behalten“; mittel für den Umfang des Umbaus der Oberfläche. Umkehrbarkeit: B billig.
- **Konsequenzen:** Phase 4 bekommt keine weiteren Schritte, offen bleibt 4.8 (v0.1.0, Vision-Abgleich vor Go-Live). Phase 5 heißt „Alltagstauglichkeit und Soll-Anforderungen“, neuer ursprünglicher Schrittplan 13: 5.7 Startmodell grok-4.6, 5.8 nahtloser Anschluss, 5.9 Kapitel öffnet am Textende, 5.10 Kosten je Vorschlag, 5.11 Seitenaufbau neu, 5.12 Modell-Katalog, 5.13 Anweisungs-Verlauf; Reihenfolge im Fahrplan. Querschnitt: D.13 Erkundung Sperren im Text; V.6/V.7 SillyTavern, V.8 Gestaltung, V.9 Weltenbauer (Landeplatz 5.5). Neue Anforderungen FR-027–FR-030 (Priorität vorläufig). Die Wahl der Werte für 5.6 (Genre je Geschichte; Tonalität/Atmosphäre als Vorgabe je Geschichte, im Kapitel änderbar) ist in 5.6 und FR-026 vermerkt.
- **Abgeleitete Regel:** keine

---

#### ADR-043: v0.1.0 als Vorabversion – Go-Live vor v1.0.0

- **Datum:** 2026-10-08
- **Entscheider:** Eigentümer
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[METHODIK]`
- **Phasentyp-Kontext:** STABILISIERUNG (Schritt 4.8, Phasenende 4)
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Release mit offenen Vision-Elementen (`CLAUDE.md` Abschnitt 12, Vision-Checkpoint vor Go-Live)
- **Kontext:** 4.8 vergibt die erste Version. Vor dem ersten produktiven Release muss jedes Vision-Element erledigt oder verworfen sein, sonst wird der Release vorgelegt; dazu ein externer Blick auf Authentifizierung und Datenschutz oder ein ADR mit Restrisiko. Offen sind: kein Kontextverlust beim Referenzumfang (D.4; FR-010, Muss, teilweise), Vorschläge ohne `@` (5.1), Smartphone (5.2), Nachweis lesbarer Dateien (5.3); Publizieren und Bilder (V.1, V.2) laut Vision nicht in der ersten Version. Ein externer Blick fand noch nicht statt. FR-022 gilt ohne Stoppuhr als erfüllt (Entscheidung des Eigentümers 2026-10-08).
- **Optionen:** A v0.1.0 als Vorabversion, Go-Live-Prüfungen vor v1.0.0 in einem eigenen Schritt (Empfehlung der KI) / B v0.1.0 als Go-Live mit bewusst offenen Vision-Elementen und jetzt externer Prüfung oder Restrisiko-ADR.
- **Entscheidung:** A – Eigentümer: „A: Vorabversion“ (Frage-System).
- **Vision-Frage, die entschied:** „Ist der heutige Stand für dich schon das fertige Skriptorium oder ein Zwischenstand auf dem Weg dorthin?“ → Zwischenstand.
- **Konfidenz zum Zeitpunkt:** hoch – offene Punkte im Fahrplan belegt; SemVer 0.x steht für den Entwicklungsstand. Umkehrbarkeit billig.
- **Konsequenzen:** v0.1.0 in `pyproject.toml`, `package.json`, Sperrdateien, CHANGELOG, README-Badge, project-context. Schritt 5.14 „Go-Live-Prüfung vor v1.0.0“ (Vision-Checkpoint, externer Blick oder Restrisiko-ADR) am Ende von Phase 5. Der Betrieb bleibt unverändert öffentlich mit Passwortschutz (Gate 4.6 erfüllt).
- **Abgeleitete Regel:** keine

#### ADR-044: grok-4.6 als Voreinstellung, grok-4.7 bleibt wählbar

- **Datum:** 2026-10-08
- **Entscheider:** Eigentümer (Befund aus der Nutzung, Stellung von grok-4.7); Umsetzung durch die KI
- **Status:** Aktiv
- **Tags:** `[ERKENNTNIS]` `[PERFORMANCE]`
- **Phasentyp-Kontext:** UMSETZUNG (Schritt 5.7)
- **Reifegrad-Wirkung:** keine
- **Kategorie:** keine aus `CLAUDE.md` Abschnitt 4 (Modellwahl ist Konfiguration, wie ADR-010/011); ändert die Reihenfolge aus ADR-010 und ADR-011
- **Kontext:** ADR-010 wählte grok-4.7 als Startmodell wegen der besten Kanon-Treue an einer erfundenen Testwelt. In der echten Nutzung (Befund 2026-10-08) sperrt grok-4.7 die Inhalte des Eigentümers stark; grok-4.6 ist laut Eigentümer „gut machbar“. Gemessen wurde die Kanon-Treue am echten Kapitel deshalb mit qwen3.8-max (4.8). Der Eigentümer will die Modelle künftig „live abrufen“ (5.12) statt die feste Liste umzusortieren und lässt die Reihenfolge der Schritte unverändert (Logbuch 2026-10-08, Eintrag „5.7: grok-4.7 bleibt wählbar“).
- **Optionen:** A grok-4.6 voreingestellt, grok-4.7 bleibt in der Liste / B grok-4.7 ganz aus der Liste nehmen / C Liste unverändert, nur 5.12 vorziehen.
- **Entscheidung:** A. Reihenfolge `DEFAULT_MODELS` in `ai_gateway/models.py`: grok-4.6 → grok-4.7 → qwen3.8-max-0902 (Notfall-Reserve); Reasoning unverändert niedrigste Stufe.
- **Vision-Frage, die entschied:** „grok-4.7 nach hinten oder ganz heraus?“ → Modelle sollen live abrufbar werden; bis dahin bleibt grok-4.7 wählbar, Reihenfolge der Schritte bleibt.
- **Konfidenz zum Zeitpunkt:** hoch für die Voreinstellung (Erfahrung des Eigentümers mit echten Texten, Genre-Test 1.5 mit grok-4.6 Rang 1 vor qwen); Kanon-Treue von grok-4.6 an echten Texten noch nicht gemessen (Testwelt 1.1: 2,4 Widersprüche je 1.000 Wörter gegenüber 1,5 bei grok-4.7). Umkehrbarkeit billig (Einstellung).
- **Konsequenzen:**
  - Neue Geschichten und Geschichten ohne gespeichertes Modell schreiben mit grok-4.6; eine Geschichte mit gespeichertem Modell behält es (ADR-023). Auch Kurzfassungen und Gesamtzusammenfassung (3.6) laufen mit der Voreinstellung, also grok-4.6.
  - Reaktionszeit: Für die Voreinstellung gilt das Ziel von grok-4.6 (meist unter 10 s, höchstens 20 s; ADR-035) – kürzere Wartezeit als bisher.
  - Restrisiko aus ADR-011 bleibt: beide grok-Modelle von xAI; Notfall-Reserve qwen3.8-max, freie Modellwahl mit 5.12.
  - Prüfung: Nach dem Deployment schreibt der Eigentümer eine Szene in einer echten Welt; Ergebnis im Logbuch (Abnahme 5.7).
- **Abgeleitete Regel:** keine

#### ADR-045: Zeitlimit 20 Minuten für den End-to-End-Job

- **Datum:** 2026-10-08
- **Entscheider:** Eigentümer („a“, Chat); Umsetzung durch die KI
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[METHODIK]`
- **Phasentyp-Kontext:** UMSETZUNG (Phase 5, Querschnitt D.14)
- **Reifegrad-Wirkung:** keine
- **Kategorie:** Build- und Deploy-Pipeline (`CLAUDE.md` Abschnitt 4, Kategorie 7)
- **Kontext:** Der End-to-End-Job des Push-Laufs zu `bb6cc03` hing am 2026-10-08 über 4 Stunden im Schritt „Chromium für Playwright installieren“ (von 16:33 UTC bis zum Abbruch durch die KI um 20:50 UTC); ohne `timeout-minutes` gilt die Vorgabe von GitHub (360 Minuten). Normale Läufe dauern 1–2 Minuten, der langsamste bisher ca. 10 Minuten (Download mit 64,6 kB/s, Vormittag 2026-10-08). Ein Zwischenspeicher für Chromium wurde am selben Tag abgelehnt (Logbuch 13:40 UTC).
- **Optionen:** A Zeitlimit 20 Minuten für den Job (Empfehlung der KI) / B nichts ändern.
- **Entscheidung:** A – `timeout-minutes: 20` am Job `e2e` in `.github/workflows/ci.yml`.
- **Vision-Frage, die entschied:** „Soll ein hängender CI-Lauf nach 20 Minuten abbrechen?“ → ja.
- **Konfidenz zum Zeitpunkt:** hoch – gemessene Laufzeiten vom selben Tag. Umkehrbarkeit billig (eine Zeile).
- **Konsequenzen:** Ein hängender Download wird nach 20 Minuten rot statt bis zu 6 Stunden gelb; danach Lauf neu starten. Ein sehr langsamer, aber laufender Download über 20 Minuten wird ebenfalls abgebrochen. Die übrigen Jobs bleiben ohne eigenes Zeitlimit (kein Befund).
- **Abgeleitete Regel:** keine

---

#### ADR-046: React Router 7.18 für Adressen der Ansichten, Wechsel auf Linie 8 ab 2026-12-17

- **Datum:** 2026-10-08
- **Entscheider:** Eigentümer (Auswahlfrage „Ja, mit React Router“, danach „a“ auf `ENTSCHEIDUNG ERFORDERLICH`); Umsetzung durch die KI
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[STACK]`
- **Phasentyp-Kontext:** UMSETZUNG (Phase 5, Schritt 5.11 – Router war in 5.11 als Vorlage vorgesehen)
- **Reifegrad-Wirkung:** keine (Modul `ui` bleibt `[BELASTBAR]`; Beziehungen der Module unverändert)
- **Kategorie:** Externe Abhängigkeit (`CLAUDE.md` Abschnitt 4, Kategorie 3)
- **Kontext:** Beim Umbau der Oberfläche (5.11) soll jede Ansicht eine eigene Adresse bekommen, damit Zurück-Knopf, Neuladen und Lesezeichen an der Stelle bleiben. Versionsprüfung 2026-10-08 (npm-Register, `npm view react-router`): Linie 8 (8.4.0) erschien 2026-06-17 und ist erst ab 2026-12-17 mindestreif; Linie 7: neueste Unterversion mit Fehlerkorrektur 7.18.4 (2026-09-15), MIT, Abhängigkeiten `cookie` 1.x und `set-cookie-parser` 2.x (beide MIT), React ≥ 18. v7 bekommt nach v8 noch Sicherheitskorrekturen (7.18.0); ein Ende ist nicht angekündigt, v6 endete mit dem Erscheinen von v8, v9 ist für etwa Mai 2027 geplant (remix.run/blog/react-router-v8; infoq.com/news/2026/08/react-route-v8). Unterstützungsfenster reicht damit nicht über die Projektdauer – nach `CLAUDE.md` Abschnitt 15 mit Nachprüf-Schritt zulässig.
- **Optionen:** A React Router 7.18.4, Wechsel auf Linie 8 als datierter Schritt / B eigene Umsetzung ohne Bibliothek (Empfehlung der KI: vier Arten von Ansichten, keine Versionswechsel) / C keine Adressen.
- **Entscheidung:** A – `react-router` 7.18.4, gepinnt `>=7.18.4 <7.19`; Wechsel auf Linie 8 frühestens 2026-12-17 in D.15.
- **Vision-Frage, die entschied:** „Ist dir ein verbreiteter Standard wichtiger als möglichst wenige fremde Teile, die regelmäßig gewechselt werden müssen?“ → Standard.
- **Konfidenz zum Zeitpunkt:** hoch – kleine, bekannte Zahl von Ansichten. Umkehrbarkeit billig (nur `ui`).
- **Konsequenzen:** Neue Laufzeit-Abhängigkeit der Oberfläche; Lizenzen erlaubt (MIT). Ablaufdaten-Register: Wechsel auf Linie 8 ab 2026-12-17 (D.15). Danach jährlicher Versionswechsel zu erwarten.
- **Abgeleitete Regel:** keine

---

#### ADR-047: Festes Verfahren für Probeschreiben – wiederholte Läufe, zwei Testgeschichten

- **Datum:** 2026-10-09
- **Entscheider:** Eigentümer („Ja, als festes Verfahren einführen“); Vorschlag der KI
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[METHODIK]`
- **Phasentyp-Kontext:** UMSETZUNG (Phase 5, nach der Prüfung von 5.22)
- **Reifegrad-Wirkung:** keine
- **Kategorie:** keine aus `CLAUDE.md` Abschnitt 4 (Arbeitsweise der KI)
- **Kontext:** Änderungen an den Vorgaben für die KI (5.8, 5.15, 5.22) wurden mit Probeschreiben geprüft. Der Aufbau war vergleichbar: dieselbe Testgeschichte, dieselbe Schreibstelle, dieselben Anweisungen. Es lief aber nur eine Kette je Variante, und das immer an der Salzmark. Die KI schreibt mit Zufallsanteil, kleine Unterschiede (z. B. 1,7 % → 0,9 %) liegen im Rauschen, und Vorgaben könnten nur zu einer Welt passen. Frage des Eigentümers: „Testest du immer mit der gleichen Geschichte?“
- **Optionen:** A wie bisher eine Kette an einer Geschichte / B jede Variante mehrfach und an zwei Testgeschichten / C nur noch Bestätigung im Alltag.
- **Entscheidung:** B, als Regel-002.
- **Vision-Frage, die entschied:** „Soll eine Verbesserung erst als belegt gelten, wenn sie sich wiederholt und an einer zweiten Geschichte zeigt?“ → ja.
- **Konfidenz zum Zeitpunkt:** hoch. Umkehrbarkeit billig.
- **Konsequenzen:** Ein Probeschreiben kostet etwa das Sechsfache: 3 Läufe × 2 Geschichten, bei grok-4.6 ca. 0,20–0,30 $ je Kette. Die zweite Testgeschichte fehlt noch → Schritt 5.24. Die Prüfung von 5.22 lief vor dieser Regel (eine Kette je Länge) und wird nicht wiederholt; ihre Zahlen gelten als Einzelbeleg, die Bestätigung im Alltag steht aus.
- **Abgeleitete Regel:** Regel-002

---

#### ADR-048: Service Worker nur für eine Hinweisseite ohne Netz (PWA)

- **Datum:** 2026-10-09
- **Entscheider:** Eigentümer („B“ auf `ENTSCHEIDUNG ERFORDERLICH`); Vorschlag der KI war A
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[SECURITY]`
- **Phasentyp-Kontext:** UMSETZUNG (Phase 5, Schritt 5.21 – ein Service Worker war dort als mögliche Vorlage der Kategorie 6 vorgesehen)
- **Reifegrad-Wirkung:** keine (Modul `ui` bleibt `[BELASTBAR]`; keine neue Beziehung zwischen Modulen, der Server bleibt unverändert)
- **Kategorie:** Sicherheit und Datenschutz (`CLAUDE.md` Abschnitt 4, Kategorie 6) – Speicher im Gerät
- **Kontext:** Das Skriptorium wird als App installierbar (FR-032: nur online, keine Texte im Gerät). Öffnet der Eigentümer die installierte App ganz ohne Netz, kann die Seite ohne Hilfe im Gerät nichts anzeigen; es erscheint die Fehlerseite des Browsers. Eine eigene Hinweisseite braucht einen Service Worker.
- **Optionen:** A kein Service Worker – nichts im Gerät, beim Start ohne Netz die Fehlerseite des Browsers, bei offener App der Hinweis aus `ConnectionNote` / B Service Worker, der nur eine statische Hinweisseite speichert.
- **Entscheidung:** B, eng begrenzt: Der Service Worker (`/sw.js`, Bereich `/`) legt beim Installieren genau eine Datei in den Zwischenspeicher, `/offline.html` – statisch, ohne Daten, ohne Skript. Er beantwortet nur Seitenaufrufe (`mode: navigate`): zuerst immer über das Netz, nur wenn das scheitert, mit der Hinweisseite. Alle anderen Anfragen (Oberfläche, Schnittstelle `/api`, Symbole) fasst er nicht an – keine Antworten der Schnittstelle, keine Texte, keine Oberflächen-Dateien im Gerät, daher auch keine veraltete Oberfläche nach einem Deployment. Beim Aktivieren löscht er Zwischenspeicher früherer Fassungen. Registriert wird er nur im gebauten Stand.
- **Vision-Frage, die entschied:** „Reicht dir beim Öffnen ohne Netz die Fehlerseite des Browsers, oder willst du dort eine eigene Skriptorium-Seite?“ → eigene Seite.
- **Konfidenz zum Zeitpunkt:** mittel – das Verhalten installierter Apps ohne Netz unterscheidet sich zwischen iPhone und Android; Beleg erst auf dem Gerät des Eigentümers. Umkehrbarkeit billig: Ein `sw.js`, der sich selbst abmeldet und den Zwischenspeicher löscht, entfernt ihn bei allen Geräten beim nächsten Öffnen mit Netz.
- **Sicherheitsniveau (Obergrenze, `CLAUDE.md` Abschnitt 6):** Keine Maßnahme über ASVS 5.0.0 Stufe 1 hinaus; die Begrenzung auf eine statische Datei erfüllt die Anforderung, keine sensiblen Daten im Gerät zu halten (ASVS Kapitel V14, Datenschutz auf dem Client), und die Vorgabe „keine Texte im Gerät“ aus FR-032. Die Hinweisseite trägt eine eigene Content-Security-Policy ohne Skripte.
- **Konsequenzen:** Prüfung durch eine getrennte Instanz vor dem Merge (Definition of Done, Kategorie 6). End-to-End-Test: Neuladen ohne Netz zeigt die Hinweisseite, und es liegt nichts außer ihr im Zwischenspeicher. Abweichung vom Fahrplan-Text von 5.21 („ohne Service Worker“) mit diesem ADR aufgelöst.
- **Abgeleitete Regel:** keine

---

#### ADR-049: Kanon-Vorschläge ohne `@` im Browser statt in `context`

- **Datum:** 2026-10-09
- **Entscheider:** Eigentümer („A“ auf `ENTSCHEIDUNG ERFORDERLICH`); Empfehlung der KI
- **Status:** Aktiv
- **Tags:** `[REAKTIV]` `[MODUL]`
- **Phasentyp-Kontext:** UMSETZUNG (Phase 5, Schritt 5.1 – vorgezogen; die Zuordnung zu `context` stammt aus der Architektur von Modus 2 und war in der Phasenplanung nicht neu bewertet)
- **Reifegrad-Wirkung:** keine (Module `context` und `ui` bleiben `[BELASTBAR]`; keine neue Beziehung, keine neue Schnittstelle)
- **Kategorie:** Architekturänderung (`CLAUDE.md` Abschnitt 4, Kategorie 1) – Verantwortung zwischen Modulen verschoben
- **Kontext:** `docs/architecture.md` wies `context` die Erkennung von Kanon-Namen ohne `@` zu (FR-014). Der Eigentümer wählte für 5.1 (Auswahlfragen 2026-10-09): Erkennung nur in der Anweisung, Vorschläge als Zeile darunter („Meintest du: @Kael“), ein Tipp macht den Namen zum `@`-Verweis. Die `@`-Erkennung selbst läuft seit 3.5 im Browser (`references.ts`) über die ohnehin geladenen Einträge der Geschichte.
- **Optionen:** A Erkennung im Browser (`ui`), wie die `@`-Erkennung / B Erkennung in `context` auf dem Server mit neuem Endpunkt.
- **Entscheidung:** A. Die Erkennung (Namen und Aliasse der Einträge der Geschichte samt Gästen, ganzes Wort, ohne vorangestelltes `@`) liegt in `ui`; an den Server gehen weiter nur die per `@` herangezogenen Einträge als `references`. Ein nicht angenommener Vorschlag erreicht die KI dadurch nicht (FR-014). `context` erkennt keine Namen ohne `@`; die Verantwortung wird in `docs/architecture.md` (Modul `context` und `ui`) umgeschrieben.
- **Vision-Frage, die entschied:** „Sollen die Vorschläge sofort beim Tippen erscheinen, oder ist dir eine Erkennung an zentraler Stelle auf dem Server wichtiger?“ → sofort beim Tippen.
- **Konfidenz zum Zeitpunkt:** hoch – dieselbe Erkennung läuft für `@` bereits im Browser. Umkehrbarkeit billig.
- **Konsequenzen:** Keine neue Schnittstelle, keine Änderung an dem, was an die KI geht. Reaktiv-Quote 1/10 (Schwelle 30 %).
- **Abgeleitete Regel:** keine

---

#### ADR-050: Nicht genannte Kanon-Einträge – Abhilfe zurückgestellt auf die nächste Ausbaustufe

- **Datum:** 2026-10-10
- **Entscheider:** Eigentümer („D“ auf die Vorlage E1, Auswahlfrage); Empfehlung der KI war A
- **Status:** Aktiv
- **Tags:** `[ERKENNTNIS]` `[PERFORMANCE]`
- **Phasentyp-Kontext:** UMSETZUNG (Phase 5, Schritt 5.26 – Prüfschritt, der bei Befund eine Entscheidungsvorlage vorsah; nicht reaktiv, keine Architekturänderung umgesetzt)
- **Reifegrad-Wirkung:** keine (NFR Kanon-Treue bleibt `[BELASTBAR]`)
- **Kategorie:** Architekturänderung (`CLAUDE.md` Abschnitt 4, Kategorie 1) – Reihenfolge der Kontext-Zusammenstellung (ADR-003) zur Entscheidung vorgelegt; Ergebnis: jetzt keine Änderung
- **Kontext:** 5.26 (a) (`docs/research/kanon-treue-grok.md`): Kanon-Einträge, die nicht per `@` genannt und weder Regel noch Zeitlinie sind, gehen erst nach den letzten Manuskript-Seiten mit Restbudget in die Anfrage. In Glimmergrund (23 Einträge) fehlen ab ca. 2.800 Wörtern Kapitel 1–3 Einträge (Bergmannsbrauch – Kultur, Schichtbuch – Gegenstand); größere echte Welten verlieren mehr. Ob das zu Widersprüchen führt, ist nicht gemessen: Die einzige betroffene Probe stand auch im Kapiteltext.
- **Optionen:** A Kultur-Einträge immer mitgeben wie Regeln und Zeitlinie (Empfehlung der KI) / B Verfahren unverändert, in 5.16 zusätzlich zeigen, welche Einträge nicht mitgingen / C erst an einer echten Welt messen, mit einer Probe, die nur im Kanon steht / D zurückstellen auf die nächste Ausbaustufe.
- **Entscheidung:** D. Die Kontext-Zusammenstellung bleibt unverändert. Neuer Schritt V.10 `[VERSCHOBEN]` mit Landeplatz 5.5; dort wird zwischen A, B und C gewählt.
- **Vision-Frage, die entschied:** „Wenn in einer Szene ein Brauch deiner Welt gilt, den du nicht nennst – soll die KI ihn trotzdem kennen, auch wenn dafür etwas weniger vom bisherigen Kapitel wörtlich mitgeht?“ → nicht jetzt; auf die nächste Ausbaustufe.
- **Konfidenz zum Zeitpunkt:** mittel – Lücke technisch belegt, Wirkung auf Widersprüche nicht gemessen, Umfang der Kultur-Einträge in den echten Welten unbekannt. Umkehrbarkeit billig.
- **Konsequenzen:**
  - Restrisiko bis V.10: Bei langen Kapiteln erreichen nicht genannte Einträge (besonders Kultur: Bräuche, Tabus) die KI still nicht. Abhilfe im Alltag: Einträge per `@` nennen (Vorschläge ohne `@` aus 5.1 helfen dabei); welche Einträge mitgingen, zeigt „Herangezogen“.
  - Kein neuer Schritt in Phase 5, kein Stopp Phasen-Wucherung; Phase 5 bleibt bei 26 Schritten.
- **Abgeleitete Regel:** keine

---

#### ADR-051: grok-4.7 über der Wartezeit – Ursache zuerst erkunden (D.16)

- **Datum:** 2026-10-10
- **Entscheider:** Eigentümer („A“ auf die Vorlage E2, Auswahlfrage); Empfehlung der KI
- **Status:** Aktiv
- **Tags:** `[ERKENNTNIS]` `[PERFORMANCE]`
- **Phasentyp-Kontext:** UMSETZUNG (Phase 5, Schritt 5.26 – Befund einer geplanten Messung, wie ADR-022 und ADR-035; nicht reaktiv)
- **Reifegrad-Wirkung:** NFR Reaktionszeit `[BELASTBAR]` → `[VORLÄUFIG]` – die Messung 5.26 widerspricht dem Ziel für grok-4.7, für grok-4.6 ist es nicht geprüft; Wiederbeförderung mit D.16 per ADR
- **Kategorie:** Architektur – nicht-funktionale Anforderung (wie ADR-035); die Modellwahl selbst ist Konfiguration (ADR-044)
- **Kontext:** 5.26: grok-4.7 braucht an echten Schreib-Anfragen im Mittel 113–131 s je Vorschlag, bis 370 s vor dem ersten Textstück; 20 von 42 Vorschlägen über 90 s, der Abbruchgrenze in `ai_gateway`. D.6 (2026-09-28) maß höchstens 29 s; Gegenprobe mit einfacher Anfrage heute 4 s. Ursache offen: Anbieter verändert, oder die längeren Vorgaben des Rahmens (5.8, 5.15, 5.22) lösen mehr Vorab-Denken aus. grok-4.6 (Voreinstellung) brauchte im Median 26–29 s je Vorschlag, höchstens 59 s, 52 von 63 über 20 s, kein Abbruch; die Zeit bis zum ersten Textstück wurde nicht erfasst – ob das Ziel von höchstens 20 s gilt, ist offen.
- **Optionen:** A Ursache erkunden als Querschnitt-Schritt D.16 nach dem Muster von D.6, grok-4.7 bleibt wählbar (Empfehlung der KI) / B grok-4.7 sofort aus der Liste nehmen / C Wartezeit für grok-4.7 auf ca. 400 s anheben, Ziel neu festlegen / D nichts ändern, in 5.12 lösen.
- **Entscheidung:** A. D.16 misst die Zeit bis zum ersten Textstück für grok-4.6 und grok-4.7 mit heutigem Rahmen und ohne die Vorgaben aus 5.8–5.22. Bis dahin keine Code-Änderung: 90-s-Grenze und Modell-Liste bleiben.
- **Vision-Frage, die entschied:** „Willst du wissen, ob deine Schreib-Vorgaben die KI bremsen, bevor wir an der Wartezeit drehen – oder soll das langsame Modell einfach verschwinden?“ → erst wissen.
- **Konfidenz zum Zeitpunkt:** mittel – Befund an 42 Vorschlägen klar gemessen, Ursache nicht. Umkehrbarkeit billig.
- **Konsequenzen:**
  - grok-4.7 scheitert bis zur Abhilfe etwa bei jedem zweiten Vorschlag mit Meldung nach 90 s; die Voreinstellung grok-4.6 bricht nicht ab.
  - D.16 ist ein Querschnitt-Schritt wie D.6 und D.13 und zählt nicht zum Schrittplan von Phase 5 – kein Stopp Phasen-Wucherung. Offen benannt, weil B und C als Schritte in Phase 5 den Stopp ausgelöst hätten.
  - D.16 vor 5.12: Die Modell-Auswahl soll auf belastbaren Reaktionszeiten aufbauen.
- **Abgeleitete Regel:** keine

---

---

#### ADR-052: grok-4.7 aus der Voreinstellung, neues Reaktionszeit-Ziel für grok-4.6 (D.16)

- **Datum:** 2026-10-10
- **Entscheider:** Eigentümer („A“ auf die Vorlage zu grok-4.7 und „Meist < 30 s, max. 45 s“ auf die Frage zum Ziel, je Auswahlfrage); Empfehlung der KI in beiden Fällen
- **Status:** Aktiv
- **Tags:** `[ERKENNTNIS]` `[PERFORMANCE]`
- **Phasentyp-Kontext:** ERKUNDUNG (Querschnitt D.16, auf ADR-051 geplant; Erkenntnis aus geplanter Messung wie ADR-035 – nicht reaktiv)
- **Reifegrad-Wirkung:** NFR Reaktionszeit `[VORLÄUFIG]` → `[BELASTBAR]` mit neuem Ziel
- **Kategorie:** Architektur – nicht-funktionale Anforderung (wie ADR-035); Modell-Auswahl ist Konfiguration (ADR-044)
- **Kontext:** D.16 (`docs/research/reaktionszeit-d16.md`, 30 Anfragen, 1,27 $): grok-4.7 an echten Schreib-Anfragen 44–157 s bis zum ersten Textstück (5.26: bis 370 s); Denken abschalten lehnt der Anbieter ab, ein Deckel von 1.024 Denk-Token verlängert auf 162–244 s; ohne die Vorgaben aus 5.8–5.22 ca. 30–40 % schneller, aber bis 88 s und nach Regel-002 kein belegter Effekt. Ursache: die Schreibaufgabe mit ihren Vorgaben plus starke Schwankung beim Anbieter, über die Einstellungen nicht zuverlässig unter 90 s. grok-4.6: 12–28 s, über dem Ziel aus ADR-035 (max. 20 s), das an der kürzeren Anfrage aus D.6 gemessen wurde.
- **Optionen (grok-4.7):** A in 5.12 aus der Voreinstellung nehmen, über die Modell-Liste des Anbieters mit Hinweis „denkt lange“ wählbar (Empfehlung) / B Wartezeit für grok-4.7 auf 300 s mit Anzeige „denkt nach …“ / C Vorgaben für grok-4.7 kürzen / D nichts ändern. **Ziel grok-4.6:** meist < 30 s, max. 45 s (Empfehlung) / altes Ziel behalten / meist < 20 s, max. 30 s.
- **Entscheidung:** A; Ziel für grok-4.6 (Voreinstellung): erstes Textstück meist unter 30 s, höchstens 45 s. Anzeige des Schreibstarts weiter binnen 1 s; die Abbruchgrenze von 90 s in `ai_gateway` bleibt. Für grok-4.7 gilt kein Ziel mehr; bis 5.12 bleibt es unverändert wählbar.
- **Vision-Frage, die entschied:** „Willst du grok-4.7 beim Schreiben überhaupt nutzen, wenn ein Vorschlag 1–4 Minuten dauert?“ → nein, nicht als Voreinstellung.
- **Konfidenz zum Zeitpunkt:** mittel – 3 Anfragen je Variante und Geschichte, der Anbieter schwankt stark. Umkehrbarkeit billig.
- **Konsequenzen:**
  - 5.12 nimmt grok-4.7 aus der voreingestellten Modell-Liste und zeigt bei Modellen mit langem Vorab-Denken einen Hinweis; kein neuer Schritt, kein Stopp Phasen-Wucherung.
  - Bis 5.12 bricht grok-4.7 weiter oft nach 90 s mit Meldung ab.
  - Verworfen: Deckel der Denk-Token (verschlimmert), Denken abschalten (vom Anbieter abgelehnt) – `docs/architecture.md` Abschnitt 8.
- **Abgeleitete Regel:** keine

---

#### ADR-053: Datenmodell der atmosphärischen Schreibweise (5.6)

- **Datum:** 2026-10-10
- **Entscheider:** Eigentümer (Auswahlfragen: „ich nehme deine Empfehlung, möchte aber für später optional B im Hinterkopf behalten“; Tempo und Deutlichkeit je ein Wert; Genre nur je Geschichte); Empfehlung der KI in allen drei Fragen
- **Status:** Aktiv
- **Tags:** `[OPERATIV]` `[DATENMODELL]`
- **Phasentyp-Kontext:** UMSETZUNG (Phase 5, Schritt 5.6 – in der Phasenplanung vorgesehen: „neue Felder je Kapitel … sind eine Datenmodelländerung“; nicht reaktiv)
- **Reifegrad-Wirkung:** keine (Datenmodell bleibt `[BELASTBAR]`, rein ergänzende Felder)
- **Kategorie:** Datenmodell (Kategorie 4); API rein ergänzend (Kategorie 5 nicht berührt)
- **Kontext:** Wirkungsprobe 5.6 (`spikes/schreibweise-5.6/README.md`): verblindet 18 von 18 Ketten richtig zugeordnet, Kanon-Treue unverändert. Entschieden 2026-10-08: Genre je Geschichte, mehrfach; Tonalität und Atmosphäre als Vorgabe je Geschichte, die jedes neue Kapitel übernimmt und im Kapitel änderbar ist; Auswahllisten, freier Text zusätzlich. Listenwerte entschieden 2026-10-10 (Fahrplan 5.6).
- **Optionen:** A Geschichte speichert Genre und Vorgabe, ein neues Kapitel bekommt beim Anlegen eine eigene Kopie (Empfehlung) / B Kapitel speichert nur Abweichungen, nicht geänderte Kapitel folgen der Vorgabe sofort.
- **Entscheidung:** A.
  - `story.md`: `genre` (Liste) und `schreibweise` mit `tonalitaet`, `atmosphaere`, `stil` (je Liste), `tempo`, `deutlichkeit` (je ein Wert oder leer) und `frei` (Text).
  - Kapitelkopf: `schreibweise` mit denselben Feldern ohne Genre; beim Anlegen eines Kapitels aus der Vorgabe der Geschichte kopiert und dort änderbar.
  - Kapitel ohne `schreibweise` (alle bisherigen) nutzen die Vorgabe der Geschichte – keine Umschreibung vorhandener Dateien.
  - Werte nur aus den festgelegten Listen; leere Schreibweise erzeugt keinen Block in der Anfrage.
  - In der Anfrage steht der Block direkt hinter der Figuren-Schreibweise und tritt hinter Kanon und geführte Figuren zurück (so in der Wirkungsprobe).
- **Vision-Frage, die entschied:** „Wenn du die Vorgabe einer Geschichte änderst – sollen die schon geschriebenen Kapitel mitziehen oder so bleiben?“ → so bleiben; B für später vormerken (V.14).
- **Konfidenz zum Zeitpunkt:** hoch – kleine, ergänzende Felder nach dem Muster von `modell` je Geschichte (ADR-023). Umkehrbarkeit billig.
- **Konsequenzen:**
  - Eine Änderung der Vorgabe wirkt nur auf neue Kapitel; bestehende Kapitel ändert man einzeln.
  - Option B hat ihren Landeplatz in V.14 (nächste Ausbaustufe, 5.5).
  - Betroffen: `manuscript` (Felder, Kopie beim Anlegen), `context` (Block), `api` (Felder in Geschichte und Kapitel), `ui` (Auswahl; Mockup vor der Umsetzung).
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

#### Regel-002: Probeschreiben mit wiederholten Läufen an zwei Testgeschichten

- **Herkunft:** ADR-047
- **Gilt für:** jede Prüfung einer Änderung an Rahmen, Vorgaben oder Kontext-Zusammenstellung der KI (`context`) und jeden Vergleich von Modellen oder Einstellungen (Länge, Modell-Voreinstellung) per Probeschreiben.
- **Regel:** Vorher und nachher laufen im **gleichen Aufbau**: gleiche Testgeschichte, gleiche Schreibstelle, gleiche Anweisungen, gleiches Modell. Jede Variante läuft **mindestens dreimal** an **beiden Testgeschichten**: der Salzmark (`spikes/vorgriff-zeitlinie/`) und der zweiten Testgeschichte aus 5.24. Berichtet wird je Kennzahl der Mittelwert mit Spannweite (kleinster und größter Wert); als Wirkung gilt nur, was sich in beiden Geschichten zeigt und außerhalb der Spannweite des Vorher-Zustands liegt. Die Bestätigung des Eigentümers im Alltag bleibt Teil der Abnahme.
- **Ausnahmen:** Bis 5.24 erledigt ist, läuft das Verfahren nur an der Salzmark, mit Vermerk im Ergebnis.
- **Gegenbeispiel:** Eine einzelne Kette vorher und nachher vergleichen und 1,7 % → 0,9 % als Verbesserung melden.

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
