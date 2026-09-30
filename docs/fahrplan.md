# Fahrplan

<!-- Zentrales Arbeitsdokument. Wird vor jeder Änderung gelesen (CLAUDE.md Abschnitt 2)
     und nach jedem Arbeitsschritt sowie zu Sessionende aktualisiert (Abschnitt 12).
     Phasen sind nach Typ klassifiziert (Erkundung / Umsetzung / Stabilisierung),
     weil iterative Entwicklung unterschiedliche Erfolgskriterien pro Phasentyp braucht. -->

<!-- ANCHOR:aktueller-stand -->
## Aktueller Stand

- **Stand vom:** 2026-09-30
- **Laufende Phase:** Phase 4 „Stabilisierung und erstes öffentliches Deployment" (Phase 3 abgeschlossen 2026-09-27, ADR-024: weiterbauen)
- **Phasentyp:** STABILISIERUNG
- **Aktiver Schritt:** 4.4 Notfall-Handbuch `[IN ARBEIT]` – geschrieben; wartet auf die Übung des Eigentümers ohne KI und die Ablage der Sicherungs-Zugangsdaten außerhalb des Servers
- **Nächster Schritt:** 4.4 abschließen (Eigentümer: Übung nach lokaler Notiz, Passwort-Manager); danach Gate 4.6, 4.7/4.8. Eigentümer 2026-09-28: kein Gate-Punkt wird übersprungen. In 4.7 zusätzlich die optionalen Kopfzeilen aus 4.5. Datiert: D.8 Rotation bis 2026-10-05 (Eigentümer); D.5 ab 2026-11-12; D.9 2026-12-28
- **Offene STOPP-Situationen:** keine

<!-- ANCHOR:phasen-typen -->
## Phasen-Typen

Jede Phase ist genau einem Typ zugeordnet. Der Typ bestimmt das Akzeptanzformat der Schritte.

### ERKUNDUNG

**Zweck:** Erkenntnis gewinnen. Klärung architektonischer Unsicherheiten, Validierung von Annahmen, Reduktion von Risiken vor Umsetzung.

**Charakteristika:**

- Akzeptanzkriterien sind **wissensbasiert**: „Wir verstehen X", „Wir können Y entscheiden", „Annahme Z ist validiert oder widerlegt".
- Output ist primär Erkenntnis, sekundär Code. Code in Erkundungsphasen ist explizit „Wegwerf-Code" oder Spike, sofern nicht anders gekennzeichnet.
- Architektur-Bestandteile werden während der Phase oft von `[OFFEN]` auf `[VORLÄUFIG]` befördert.
- Definition of Done ist reduziert: kein Coverage-Mindestwert, keine vollständige Testpyramide. Aber: Erkenntnisse müssen dokumentiert sein (in `decisions.md` oder `architecture.md`).
- Spike-Code, der weiterverwendet werden soll, durchläuft eine Stabilisierungsphase, bevor er als Produktivcode gilt.

**Typische Schritt-Arten:**

- **Spike** – zeitbegrenzte Untersuchung („maximal 4h, dann Erkenntnisse zusammenfassen")
- **Prototyp** – funktionsfähige Skizze einer Lösung, nicht produktiv
- **Vergleichsstudie** – mehrere Optionen gegeneinander prüfen
- **Lasttest / Messung** – NFR-Annahmen validieren

### UMSETZUNG

**Zweck:** Geplante Funktionalität auf Basis belastbarer Architektur produktiv bauen.

**Charakteristika:**

- Akzeptanzkriterien sind **funktionsbasiert**: konkrete Eingabe → erwartete Ausgabe, Tests grün, Coverage erfüllt.
- Architektur-Bestandteile, die der Schritt berührt, müssen vor Schrittbeginn `[BELASTBAR]` sein – sonst Stopp.
- Volle Definition of Done (CLAUDE.md Abschnitt 9) gilt.
- Enthält die Phase das **erste öffentliche Deployment**, steht davor ein eigener Gate-Schritt mit der ersten Sicherheits-Review (CLAUDE.md Abschnitt 12, „Gate vor dem ersten öffentlichen Deployment").
- Wenn während der Umsetzung Architektur-Lücken auftauchen: Schritt **stoppen**, Lücke als `[OFFEN]` in `architecture.md` markieren, neuen ERKUNDUNG-Schritt anlegen, dann zurück.

### STABILISIERUNG

**Zweck:** Härten, was in vorherigen Phasen entstanden ist – inklusive Spike-Code, der produktiv weiterverwendet werden soll.

**Charakteristika:**

- Akzeptanzkriterien sind **qualitätsbasiert**: Coverage angehoben, Edge Cases abgedeckt, Lasttest bestanden, Sicherheits-Review nachgeprüft (die erste Review liegt vor dem ersten öffentlichen Deployment, CLAUDE.md Abschnitt 12), Refactoring-Schulden abgebaut.
- Output ist meist kein neues Feature, sondern höhere Robustheit der bestehenden.
- Volle Definition of Done gilt; zusätzlich projektspezifische Stabilisierungs-Kriterien aus `project-context.md`.
- Eine Stabilisierungsphase nach jeder Erkundungsphase, deren Ergebnisse weiterverwendet werden, ist Pflicht.

<!-- ANCHOR:schritt-format -->
## Schritt-Format

Jeder Schritt folgt diesem Schema. Abweichungen nur nach Freigabe.

```text
### [Phase].[Nummer]: Kurztitel

- **Status:** [OFFEN | VERSCHOBEN | IN ARBEIT | WARTET-AUF-FREIGABE | BLOCKIERT | ERLEDIGT | VERWORFEN]
- **Landeplatz (nur VERSCHOBEN):** [Ziel-Schritt-ID, z. B. „6.4" – ein Phasen-Verweis ohne Schritt-ID ist unzulässig, siehe CLAUDE.md Abschnitt 6]
- **Phasentyp-Kontext:** [ERKUNDUNG | UMSETZUNG | STABILISIERUNG] – ergibt sich aus der Phase
- **Schritt-Art (nur ERKUNDUNG):** [Spike | Prototyp | Vergleichsstudie | Lasttest | sonstiges]
- **Zeitbox (nur ERKUNDUNG):** [z. B. „maximal 4h Arbeit, dann Zwischenstand"]
- **Abhängigkeiten:** [Schritt-IDs, die vorher abgeschlossen sein müssen, oder "keine"]
- **Frist (Pflicht bei Abkündigungen, Ablaufdaten, Secret-Rotation):** [YYYY-MM-DD]
- **Freigabepflichtig:** [ja/nein – siehe CLAUDE.md Abschnitt 4]
- **Empfohlene Klasse:** [Mechanik | Routine | Entscheidung | Ausnahme] – [ein Satz Begründung aus CLAUDE.md Abschnitt 0]
- **Eingangskriterien:** [was muss gegeben sein, bevor der Schritt begonnen werden kann; bei UMSETZUNG: alle berührten Architektur-Bestandteile auf [BELASTBAR]]
- **Anforderungen (ab Klasse M):** [FR-IDs aus `docs/requirements.md`, die dieser Schritt umsetzt, oder „keine"]
- **Zu tun:** [konkrete Arbeitsanweisung; bei UMSETZUNG implementierungsnah, bei ERKUNDUNG: zu klärende Fragen]
- **Akzeptanzkriterien:** [phasentypabhängig – wissensbasiert / funktionsbasiert / qualitätsbasiert]
- **Betroffene Module:** [Modulnamen – wenn >1, ggf. aufsplitten]
- **Reifegrad-Wirkung:** [welche Architektur-Bestandteile werden durch diesen Schritt befördert oder zurückgestuft]
- **Artefakte:** [erwartete Dateien/Änderungen; bei ERKUNDUNG: ADRs, Architektur-Updates, Erkenntnisdokumente]
- **Notizen:** [optional: Hinweise, bekannte Fallstricke]
```

<!-- ANCHOR:aktuelle-phasen -->
## Aktuelle Phasen

Festgehalten am 2026-09-26 in Modus 2 Schritt 6 (Klasse M, ADR-001: fünf Phasen). Phase 1 ist im vollen Format ausgearbeitet; die Phasen 2–5 sind gröber und werden zu Phasenbeginn verfeinert (Verfeinerung ändert den ursprünglichen Schrittplan nicht). Jede Muss-Anforderung aus `docs/requirements.md` ist genau einem Schritt zugeordnet – dem Schritt, der sie abschließt; frühere Schritte schaffen die Grundlage und nennen sie unter „Notizen". Datierte, ausgelöste und verschobene Schritte stehen unter „Querschnitt" am Ende dieses Abschnitts.

### Phase 1: Erkundung – Modelle, Import, Laufzeit – Typ: ERKUNDUNG – ABGESCHLOSSEN (2026-09-26)

**Phasen-Bilanz:** 5 Schritte (ursprünglich 4; 1.5 Genre-Test auf Wunsch des Eigentümers ergänzt, Wucherungs-Schwelle nicht berührt), alle `[ERLEDIGT]` am 2026-09-26. Ergebnisse: Startmodell grok-4.7, Zweitmodell grok-4.6, Notfall-Reserve qwen3.8-max, Token-Budget 30.000 als Obergrenze (ADR-010, ADR-011); Import zunächst Markdown (ADR-012); httpx 0.28.1 auf Python 3.14.7 validiert; Architektur vor Phase 2 auf `[BELASTBAR]` befördert, neues Reaktionszeit-Ziel (ADR-013); Pflichtfrage am Phasenende: weiterbauen (ADR-014). Reaktiv-Quote 0/10. Kosten OpenRouter gesamt 1,66 $ (laut Schlüssel-Abfrage; Ausgabengrenze 5 $, Rest 3,34 $). Detail-Schritte: [`docs/archiv/fahrplan-phase-1.md`](archiv/fahrplan-phase-1.md).

### Phase 2: Grundgerüst – Typ: UMSETZUNG – ABGESCHLOSSEN (2026-09-26)

**Phasen-Bilanz:** 7 Schritte (ursprünglich 7, Wucherungs-Schwelle nicht berührt), alle `[ERLEDIGT]` am 2026-09-26. Ergebnisse: Projektgerüst mit allen CI-Gates (ADR-015); `storage` mit atomarem Schreiben und neu aufbaubarem SQLite-Index, PyYAML für den Dateikopf (ADR-016); `canon` mit sechs Kategorien und Markdown-Import; `manuscript` mit Roman, Kurzgeschichte, Fragment; `api` mit Anmeldung nach ASVS L2 (ADR-017, ADR-018 reaktiv); `ui` mit CodeMirror-Editor, CSP und End-to-End-Tests (ADR-019). FR-002, FR-005, FR-007, FR-016 erledigt. 224 Python-Tests (99,94 %), 32 Komponenten-Tests (99 %), 4 End-to-End-Tests; zwei Sicherheitsprüfungen durch getrennte Instanz. Reaktiv-Quote 1/10. Pflichtfrage am Phasenende: weiterbauen (ADR-020). Detail-Schritte: [`docs/archiv/fahrplan-phase-2.md`](archiv/fahrplan-phase-2.md).

### Phase 3: Schreiben mit KI – Typ: UMSETZUNG – ABGESCHLOSSEN (2026-09-27)

**Phasen-Bilanz:** 9 Schritte (ursprünglich 9, Wucherungs-Schwelle nicht berührt), alle `[ERLEDIGT]` am 2026-09-26/27. Ergebnisse: `ai_gateway` mit Anbieter-Schnittstelle und OpenRouter-Adapter (ADR-021); `context` mit Token-Budget, Figuren-Schreibweise, `@`-Verweisen, Kurzfassungen und Gast-Figuren; Weiterschreiben mit Streaming und Szenen-Einstieg in `api.flows`; Fakt → Kanon; Modell je Geschichte und Verbrauch je Monat (ADR-023). FR-001, 003, 004, 008, 009, 011, 012, 013, 015, 017, 018, 024, 025 erledigt; FR-010 teilweise (Referenzumfang D.4). Reaktionszeit verfehlt (ADR-022, Erkundung D.6 vor 4.8). 377 Python-Tests (99,78 %), 96 Komponenten-Tests (98,2 %), 8 End-to-End-Tests; jede Abnahme mit echten Läufen und blinder Bewertung. Reaktiv-Quote 1/10. Pflichtfrage am Phasenende: weiterbauen, Geschichtenseite in 4.1 aufteilen, Kanon-Treue in 4.8 messen (ADR-024). Detail-Schritte: [`docs/archiv/fahrplan-phase-3.md`](archiv/fahrplan-phase-3.md).

### Phase 4: Stabilisierung und erstes öffentliches Deployment – Typ: STABILISIERUNG

**Ziel:** Das Skriptorium ist gehärtet, das Gate vor dem ersten öffentlichen Deployment (CLAUDE.md Abschnitt 12) ist mit Belegen erfüllt, das System läuft öffentlich mit Passwortschutz auf einem VPS, und der 30-Minuten-Test ist bestanden.

**Abschlusskriterium:** Schritte 4.1–4.8 `[ERLEDIGT]`; alle acht Gate-Prüfpunkte belegt; FR-022 bestanden.

**Reifegrad-Erwartung am Phasenende:** Host, Netz, Secrets im Betrieb, Backups und Bedrohungsmodell `[BELASTBAR]` (Backups erst nach erprobter Wiederherstellung).

**Ursprünglicher Schrittplan:** 8 Schritte, festgehalten am 2026-09-26 – wird nicht still hochgesetzt (CLAUDE.md Abschnitt 8, Kriterium 9). Stand 2026-09-28: 12 Schritte (+4.9, ADR-025; +4.10, Auftrag des Eigentümers; +4.11, Befund Branch-Schutz; +4.12, Befund D.7), Wucherungs-Schwelle (16 und mindestens +5) nicht berührt

**Pflichtfrage am Phasenende:** ADR „Weiterbauen, umbauen oder neu aufsetzen" – Nummer wird beim Phasenabschluss vergeben

**Hinweis:** Architekturentscheidungen (Kategorien 1, 2, 4, 5) in dieser Phase sind `[REAKTIV]` (CLAUDE.md Abschnitt 6). Die geplanten Entscheidungen zu Hosting und Deployment gehören zu den Kategorien 3, 6 und 7.

#### 4.1: Qualitäts-Härtung der Phasen 2 und 3

- **Status:** ERLEDIGT (2026-09-27) – Coverage Python 99,78 % (Zeilen und Zweige), `canon` und `context` je 100 %; Oberfläche 98,65 % Zeilen, 96,43 % Zweige. Randfälle: Abbruch, Ablehnung und zu großer Kontext waren abgedeckt; neu leerer Kanon mit leerem Kapitel und sehr langes Kapitel – dabei Fehler gefunden und behoben (langes Kapitel ohne Leerzeilen → KI bekam kein Manuskript). Tempo `storage` im Referenzumfang: alles unter 1 s (`spikes/storage-tempo/README.md`). `StoryPage.tsx` in sieben Dateien aufgeteilt, `SceneForm` aus `WritingPanel.tsx` gelöst; 96 Komponenten- und 8 End-to-End-Tests unverändert grün
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 3.9
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Testerstellung und Testwartung ohne Architekturwirkung.
- **Eingangskriterien:** Phase 3 abgeschlossen
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Coverage-Ziele nachweisen (80 % / 90 % für `canon` und `context`), Randfälle (Abbruch, Ablehnung, leerer Kanon, sehr lange Kapitel), Tempo von `storage` bei großen Geschichten messen. Zusatz 2026-09-27 (ADR-024): `ui/src/views/StoryPage.tsx` (757 Zeilen, 7 Komponenten) in Einzeldateien je Komponente aufteilen, bei Bedarf auch `WritingPanel.tsx` (441 Zeilen) – Umbau innerhalb von `ui` ohne Verhaltensänderung.
- **Akzeptanzkriterien:** Coverage-Werte erreicht und dokumentiert; Randfall-Tests grün; Messwerte zu `storage` im Logbuch; keine Datei unter `ui/src/views` enthält mehr als eine der Komponenten der Geschichtenseite, alle Komponenten- und End-to-End-Tests unverändert grün.
- **Betroffene Module:** canon, manuscript, context, ai_gateway, storage, api, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Tests, Messprotokoll
- **Notizen:** Neue Tests: `tests/context/test_builder.py` (3), `tests/api/test_writing.py` (1), Abwählen von Figuren in `WritingPanel.test.tsx`. Die Aufteilung von `WritingPanel.tsx` (jetzt 372 Zeilen, nur noch eine Komponente) war darüber hinaus nicht nötig.

#### 4.2: Host bereitstellen und härten

- **Status:** ERLEDIGT (2026-09-28) – ADR-029 bis ADR-032 und ADR-034 entschieden. Erledigt: Container-Image (`Dockerfile`, ADR-029), auf dem VPS als Compose-Projekt im Anwendungsverzeichnis gebaut und gestartet, Datenverzeichnis dort (Korrektur 2026-09-30: war entgegen der Annahme von keiner Sicherung erfasst – Duplicati hatte keinen Auftrag; gesichert seit 4.3), eigenes Netz mit `FORWARDED_ALLOW_IPS` genau für dessen Bereich (ADR-030), kein veröffentlichter Port, Proxy noch nicht angebunden (ADR-032: nicht erreichbar bis Gate 4.6); Prozess ohne root, Dateisystem schreibgeschützt außer `/data`; auf dem Server: Gesundheitsprüfung ok, `/api/worlds` 401, Oberfläche 200, Pwned Passwords erreichbar, Container `healthy`. Prüfung von außen (alle TCP-Ports): offen nur SSH, HTTP, HTTPS und zwei Ports eines anderen Dienstes des Eigentümers (Eigentümer informiert); SSH lehnt Passwort-Anmeldung ab (nur `publickey`). OpenRouter-Schlüssel vom Eigentümer eingetragen (2026-09-28, verdeckte Eingabe, `.env` nur root lesbar; OpenRouter erkennt ihn, Ausgabengrenze am Schlüssel 50 $). Automatische Sicherheitsupdates aktiv (letzter Lauf 2026-09-28 06:31), Firewall aktiv. Überwachung entfällt (ADR-034: Kuma hat eine andere Aufgabe, keine Anforderung des Schutzniveaus verlangt sie; Restrisiko benannt). Host → `[BELASTBAR]`; Netz bleibt `[VORLÄUFIG]` bis zu den Prüfungen von außen in 4.7. Anbindung an den Proxy, `frame-ancestors` und die Prüfungen zu `X-Forwarded-For` von außen verschoben nach 4.7 (erst bei Freischaltung sinnvoll)
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.1, 4.9
- **Freigabepflichtig:** ja – Anbieterwahl und Deployment-Ziel (Kategorien 3 und 7), SSH-Zugang (Kategorie 6)
- **Empfohlene Klasse:** Entscheidung – Anbieter- und Betriebsentscheidungen mit `ENTSCHEIDUNG ERFORDERLICH` (Eskalations-Auslöser 1).
- **Eingangskriterien:** Kostenrahmen (BDR-001) und Kostenregister aus 1.1 aktuell
- **Anforderungen (ab Klasse M):** keine (Gate-Prüfpunkt 3)
- **Zu tun:** Zusatz 2026-09-27 (ADR-027): Firewall, SSH nur mit Schlüssel, automatische Updates, HTTPS-Umleitung und Zertifikate sind auf dem VPS schon vorhanden und werden von außen belegt, nicht neu gebaut; neu sind: Dockerfile und Compose-Projekt des Skriptoriums hinter dem vorhandenen Reverse Proxy (ohne veröffentlichten Port), `--forwarded-allow-ips` nur für die Adresse des Proxy-Containers, Zugriffsprotokoll des Proxys für das Skriptorium aus, Middleware für `frame-ancestors`, eingeschränktes Konto für die KI, Eintrag in der vorhandenen Überwachung (Befunde `docs/research/vps-bestand.md`). Ursprünglich: VPS-Anbieter vorschlagen und freigeben lassen; Firewall, SSH nur mit Schlüssel, automatische Sicherheitsupdates; von außen nur HTTPS (443) und Umleitung von HTTP (80); TLS mit automatischer Erneuerung; Erreichbarkeits-Prüfung von außen.
- **Akzeptanzkriterien:** Prüfung von außen belegt: nur die vorgesehenen Ports offen, Passwort-Anmeldung per SSH abgelehnt; ~~Erreichbarkeits-Prüfung meldet einen absichtlich herbeigeführten Ausfall~~ – entfallen per ADR-034 (2026-09-28).
- **Betroffene Module:** keine (Betrieb)
- **Reifegrad-Wirkung:** Host → `[BELASTBAR]`; Netz erst mit den Prüfungen von außen in 4.7 (Zusatz 2026-09-28: Anbindung an den Proxy dorthin verschoben)
- **Artefakte:** ADR zu Anbieter und Betrieb; `docs/architecture.md` Abschnitt 6; `docs/project-context.md` Abschnitt 8
- **Notizen:** Zusatz 2026-09-26 (Sicherheitsprüfung 2.6, Befunde 3, 5, 7): Reverse Proxy auf demselben Host, der `X-Forwarded-For` setzt und den `Host`-Kopf unverändert weiterreicht; uvicorn mit genau einem Prozess (kein `--workers`, kein `--reload`), `--no-access-log` und ohne Ausweitung von `--forwarded-allow-ips` über `127.0.0.1` hinaus – sonst teilen sich alle Besucher eine Fehlversuchs-Sperre oder können sie mit erfundenen Adressen umgehen. Wirkung von außen prüfen: Fehlversuche von einer Adresse sperren eine zweite nicht; ein mitgeschicktes `X-Forwarded-For` ändert die gesehene Adresse nicht. Zusatz 2026-09-26 (Sicherheitsprüfung 2.7, optional vom Eigentümer gewählt): Reverse Proxy setzt `Content-Security-Policy: frame-ancestors 'none'` als HTTP-Kopf (per Meta-Tag nicht möglich); von außen prüfen, dass die Seite sich nicht in einen fremden Rahmen einbetten lässt.

#### 4.3: Backups mit erprobter Wiederherstellung

- **Status:** ERLEDIGT (2026-09-30) – Duplicati-Auftrag „Skriptorium“ auf dem VPS (vom Eigentümer in der Weboberfläche angelegt, Schlüssel und Passphrase nur bei ihm): Quelle nur `/source/skriptorium/data/`, Filter `index.sqlite`, Ziel MEGA S4 (ADR-036), AES-256 mit eigener Passphrase, täglich 04:15, intelligente Aufbewahrung. Beschränkung belegt durch erzwungenen Fehler: derselbe Schlüssel gegen einen zweiten Bucket → „Request not allowed by policy“, zweiter Bucket blieb leer. Wiederherstellung: Probewelt (3 Dateien, Freigabe des Eigentümers) auf dem VPS angelegt, gesichert (02:16), auf dem Mac in einem Wegwerf-Container mit demselben Duplicati-Image (Digest wie VPS) nur mit S4-Zugang und Passphrase wiederhergestellt (Werte aus dem Export des VPS-Auftrags kopiert – der Eigentümer hat noch keinen Passwort-Manager; Ablage außerhalb des Servers folgt in 4.4); Prüfsummen gleich; Server auf den Daten gestartet (Gesundheitsprüfung, 401 ohne Anmeldung, Einrichtung, Anmeldung, Welt sichtbar); Index neu aufgebaut (Suche vorher leer, danach Treffer). Probewelt danach vom VPS gelöscht, Testdaten auf dem Mac entfernt. Verfahren in `docs/onboarding-runbook.md` Abschnitt 7
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.2
- **Freigabepflichtig:** ja – Sicherungsziel außerhalb des Servers (Kategorien 3 und 7)
- **Empfohlene Klasse:** Entscheidung – Wahl des Sicherungsziels ist freigabepflichtig (Eskalations-Auslöser 1).
- **Eingangskriterien:** Host aus 4.2
- **Anforderungen (ab Klasse M):** keine (Gate-Prüfpunkt 5)
- **Zu tun:** Datenverzeichnis täglich außerhalb des Servers sichern; Index nicht sichern, sondern neu aufbauen; Wiederherstellung aus einem echten Backup auf einem leeren System durchspielen.
- **Akzeptanzkriterien:** Eine vollständige Wiederherstellung aus einem echten Backup ist durchgelaufen (Datum und Ergebnis am Bestandteil vermerkt, CLAUDE.md Abschnitt 6).
- **Betroffene Module:** storage
- **Reifegrad-Wirkung:** Backups und Wiederherstellung → `[BELASTBAR]`
- **Artefakte:** Sicherungs-Konfiguration, Protokoll des Wiederherstellungs-Laufs
- **Notizen:** 2026-09-28: Die vorhandene Sicherung auf dem VPS (Duplicati) hat kein Ziel außerhalb des Servers (Eigentümer). Vorgelegt: A Mac holt täglich per SSH (Empfehlung), B gemieteter Speicher mit restic, C Duplicati mit externem Ziel. Eigentümer stellt das Thema zurück – keine Entscheidung. Folge: Gate 4.6 und damit 4.7 warten auf 4.3 (kein Gate-Punkt wird übersprungen). Wiederherstellungs-Test auf dem Mac ist freigegeben. 2026-09-30: Eigentümer neigt zu C mit Ziel Mega.nz. Laut Duplicati-Doku (abgerufen 2026-09-30) ist das Mega-Ziel nicht mehr empfohlen (MegaApiClient ungepflegt) und braucht Benutzername und Passwort des Kontos auf dem Server, 2FA für Automatik ungeeignet. Offen: Eigentümer prüft, ob sein Tarif MEGA S4 (S3-kompatibel, eigene Schlüssel) enthält – dann Duplicati über „S3-kompatibel“; sonst normales Mega-Ziel mit eigenem Sicherungskonto oder anderes Ziel. Entscheidung und ADR stehen noch aus. 2026-09-30 später: Tarif enthält S4; Beschränkung auf einen Bucket per Bucket-Richtlinie laut Mega-Hilfe möglich → ADR-036 (C über S4). 2026-09-30 (Umsetzung): Duplicati hatte entgegen der Annahme aus 4.2 nie einen Auftrag – der Skriptorium-Auftrag ist der erste (Duplicati-Datenbank); das Datenverzeichnis war bis dahin gar nicht gesichert. Reibungen: Server-URL mit Bucket-Namen davor („Root element is missing“), versteckter zweiter Filter `*` schloss alles aus (erste Sicherungen leer), wiederhergestellte Ordner schreibgeschützt; alle im Runbook berücksichtigt.

#### 4.4: Notfall-Handbuch

- **Status:** IN ARBEIT (seit 2026-09-30) – Abschnitt „Notfall“ im Runbook geschrieben (Zugang, Anhalten/Starten, KI-Schlüssel widerrufen, Sicherung, Wiederherstellen, Benachrichtigen); Anhalten und Starten von der KI auf dem VPS erprobt; konkrete Werte in lokaler Notiz beim Eigentümer. Offen (Eigentümer): Übung ohne KI (Anhalten, Starten, Sicherung von Hand); Ablage von Passphrase und S4-Schlüsseln außerhalb des Servers; Tausch des KI-Schlüssels ist geschrieben, aber nicht erprobt
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.3
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Dokumentationspflege auf Grundlage von 4.2 und 4.3.
- **Eingangskriterien:** Host und Backups eingerichtet
- **Anforderungen (ab Klasse M):** keine (Gate-Prüfpunkt 7, ADR-008)
- **Zu tun:** Abschnitt „Notfall" in `docs/onboarding-runbook.md`: System anhalten, Sicherung ziehen, wiederherstellen, API-Schlüssel widerrufen – ausführbar vom Eigentümer ohne KI. Zusatz 2026-09-30 (aus 4.3): Der Eigentümer legt Duplicati-Passphrase, S4-Schlüssel, Endpunkt und Bucket außerhalb des Servers ab (Passwort-Manager, Passphrase zusätzlich auf Papier) – ohne das ist die Sicherung nach Verlust des Servers nicht lesbar; Ort (nicht Wert) im Runbook unter „Zugang“.
- **Akzeptanzkriterien:** Der Eigentümer hat die Schritte einmal ohne KI nachvollzogen; Ergebnis im Logbuch.
- **Betroffene Module:** keine (Betrieb)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** `docs/onboarding-runbook.md`
- **Notizen:** 2026-09-30: Wiederherstellen hat der Eigentümer in 4.3 schon selbst durchgeführt (unter Anleitung). Der Tausch des OpenRouter-Schlüssels wird mit dem Rotationsweg für Gate-Punkt 4 in 4.6 erprobt oder dort als Restrisiko benannt.

#### 4.5: Unabhängige Sicherheitsprüfung

- **Status:** ERLEDIGT (2026-09-28) – getrennte Instanz (Unteragent Claude Sonnet 5 ohne Gesprächsverlauf, nur Repo, Bedrohungsmodell und ADRs) prüfte das Gesamtsystem auf `main`: Authentifizierung, Sitzung, Autorisierung aller Routen, Herkunftsprüfung inkl. Streaming, Secrets (Code, `.dockerignore`, `Dockerfile`), Pfadsicherheit, SQL, XSS, Logging, Container. Keine Befunde hoch/mittel. Einziger Befund (fehlendes `X-Content-Type-Options: nosniff`) ist laut ASVS-5.0.0-Originaltext 3.4.4 Stufe 2 → über dem Niveau, als optional vorgelegt, ebenso `Referrer-Policy` (3.4.5, Stufe 2) und `Permissions-Policy`. Nicht geprüft (ohne Serverzugriff): Proxy-Vertrauen auf dem VPS – dafür 4.7
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.2
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Entscheidung – Prüfung sicherheitsrelevanter Teile durch eine getrennte Instanz, möglichst mit anderem Modell (CLAUDE.md Abschnitt 12).
- **Eingangskriterien:** Code und Bedrohungsmodell auf aktuellem Stand
- **Anforderungen (ab Klasse M):** keine (Gate-Prüfpunkt 6)
- **Zu tun:** Getrennte Session prüft Authentifizierung, Autorisierung, Umgang mit Secrets und personenbezogene Datenflüsse anhand von Diff und Bedrohungsmodell.
- **Akzeptanzkriterien:** Befunde behoben oder als Fahrplan-Schritt mit Frist geführt; Ergebnis und Datum im Logbuch.
- **Betroffene Module:** api, ai_gateway, ui
- **Reifegrad-Wirkung:** Bedrohungsmodell → `[BELASTBAR]`
- **Artefakte:** Prüfbericht, Logbuch-Eintrag
- **Notizen:** –

#### 4.6: Gate vor dem ersten öffentlichen Deployment

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.2, 4.3, 4.4, 4.5
- **Freigabepflichtig:** ja – Verzicht auf einen Prüfpunkt nur per ADR (Kategorie 6)
- **Empfohlene Klasse:** Entscheidung – blockierendes Gate mit Beförderung von Schutzmechanismen (Eskalations-Auslöser 4).
- **Eingangskriterien:** Schritte 4.2–4.5 erledigt
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Checkliste der acht Prüfpunkte (CLAUDE.md Abschnitt 12) mit Belegen:
  - [ ] 1. Bedrohungsmodell für das Gesamtsystem, mindestens `[VORLÄUFIG]` – `docs/architecture.md` Abschnitt 6
  - [ ] 2. Sicherheitsniveau per ADR – ADR-006
  - [ ] 3. Grundhärtung des Host, belegt durch Prüfung von außen – Schritt 4.2
  - [ ] 4. Secrets im Betrieb (Ablageort, Rotationsweg) und Zugriff der KI auf die Produktion in `docs/project-context.md` Abschnitt 8; Ausgabengrenze am OpenRouter-Schlüssel belegt
  - [ ] 5. Backup mit erprobter Wiederherstellung – Schritt 4.3
  - [ ] 6. Unabhängige Prüfung – Schritt 4.5
  - [ ] 7. Vertretung: Verzicht per ADR-008; Notfall-Handbuch – Schritt 4.4
  - [ ] 8. KI im Betrieb: Konto, Kontingent mit Zurücksetz-Zeitpunkt, Rückfallweg ohne KI in `docs/project-context.md` Abschnitt 8; Kontingent für den Deployment-Termin eingeplant
- **Akzeptanzkriterien:** Alle acht Punkte mit Beleg abgehakt oder per ADR verzichtet.
- **Betroffene Module:** keine (Betrieb)
- **Reifegrad-Wirkung:** Secrets im Betrieb → `[BELASTBAR]`
- **Artefakte:** ausgefüllte Checkliste in diesem Schritt; `docs/project-context.md` Abschnitt 8
- **Notizen:** Deployment-Schritt 4.7 kann nicht beginnen, solange ein Punkt offen ist.

#### 4.7: Erstes öffentliches Deployment

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.6
- **Freigabepflichtig:** ja – Deployment-Workflow (Kategorie 7)
- **Empfohlene Klasse:** Entscheidung – Änderung an Build- und Deploy-Pipeline (Eskalations-Auslöser 1).
- **Eingangskriterien:** Gate 4.6 vollständig
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Deployment-Weg einrichten und ausführen; Gesundheitsprüfung und Anmeldung von außen prüfen. Zusatz 2026-09-28 (aus 4.2, ADR-030, ADR-032): Proxy an das Netz `skriptorium-proxy` anbinden (Sicherungskopie der Proxy-Konfiguration vorher), Router mit HTTPS und Middleware `frame-ancestors 'none'`; von außen prüfen: Einbettung in fremden Rahmen verweigert, mitgeschicktes `X-Forwarded-For` ändert die gesehene Adresse nicht, Fehlversuche von einer Adresse sperren eine zweite nicht. Zusatz 2026-09-28 (4.5, optional vom Eigentümer gewählt, jeweils über dem Niveau): in `api` (`_security_headers`) zusätzlich `X-Content-Type-Options: nosniff` (ASVS 3.4.4, Stufe 2), `Referrer-Policy: no-referrer` (3.4.5, Stufe 2) und `Permissions-Policy` mit gesperrter Kamera, Mikrofon und Standort setzen, mit Tests.
- **Akzeptanzkriterien:** Das System ist unter HTTPS erreichbar; ohne Anmeldung ist außer Gesundheitsprüfung und Anmeldung nichts zugänglich; Version und Status in `docs/project-context.md` und README nachgezogen.
- **Betroffene Module:** api, ui
- **Reifegrad-Wirkung:** Netz (nur HTTPS von außen) → `[BELASTBAR]` nach den Prüfungen von außen (Zusatz 2026-09-28 aus 4.2)
- **Artefakte:** Deployment-Konfiguration, ADR, CHANGELOG
- **Notizen:** Kontingent-intensive Vorbereitung ins vorige Kontingent-Fenster legen oder Kontingent für den Termin zurückhalten (Gate-Prüfpunkt 8).

#### 4.8: 30-Minuten-Test

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.7
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Entscheidung – Durchführung durch den Eigentümer, die KI dokumentiert; die Beförderung von NFR Kanon-Treue ist Eskalations-Auslöser 4 (ADR-024).
- **Eingangskriterien:** öffentliches System läuft
- **Anforderungen (ab Klasse M):** FR-022
- **Zu tun:** Der Eigentümer öffnet das Skriptorium zum ersten Mal, importiert eine bestehende Welt und schreibt eine erste Szene – ohne Anleitung, mit Stoppuhr. Zusatz 2026-09-27 (ADR-024): Danach schreibt der Eigentümer ein erstes echtes Kapitel im Wechsel mit der KI, redigiert es und zählt die Kanon-Widersprüche (Vision 4).
- **Akzeptanzkriterien:** höchstens 30 Minuten einschließlich einmaliger Einrichtung (FR-022); bei Überschreitung: Hindernisse als Schritte angelegt. Kanon-Treue: höchstens ein beim Redigieren gefundener Widerspruch im Kapitel (FR-011, Vision 4); bei mehr: Befund als Schritt angelegt.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** NFR Kanon-Treue → `[BELASTBAR]` bei erfülltem Kriterium (ADR-024)
- **Artefakte:** Logbuch-Eintrag mit Messung
- **Notizen:** –

#### 4.9: Entwicklungsumgebung macOS einrichten

- **Status:** ERLEDIGT (2026-09-28) – Einrichtungsskript auch für macOS (ADR-026); SSH per Schlüssel zum VPS belegt, Ausstattung in `docs/project-context.md` Abschnitt 8 (Preis entfällt, Eigentümer 2026-09-27). Frischer Klon von `f75be2d` auf macOS arm64: Hook und Quick Start ohne Bruch; pytest 381/381 (Coverage 99,78 %), vitest 96/96 (98,65 % Zeilen, 96,22 % Zweige), E2E 8/8, Pre-Commit 17/17 Hooks; Server: `/api/health` ok, `/api/worlds` 401. Einschränkung: Werkzeug- und Browser-Caches waren schon vorhanden (kein erneuter Download). Plattform-Matrix auf ✓, Runbook Abschnitt 1, 2 und 5 nachgezogen
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.1
- **Freigabepflichtig:** nein – Plattformwechsel entschieden in ADR-025; neue Werkzeuge auf dem Mac (z. B. Homebrew) wären Kategorie 3 und werden vorgelegt
- **Empfohlene Klasse:** Routine – Einrichtung nach Runbook ohne Architekturwirkung; läuft mangels Probelauf auf der Entscheidungs-Klasse.
- **Eingangskriterien:** Claude Code auf dem Mac des Eigentümers, Repo geklont
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Voraussetzungen auf macOS installieren (Python 3.14.7 über uv 0.12.19, Node.js 24.21.0 mit npm 11.19.0, Playwright-Browser); Quick Start und alle Prüfungen (Pre-Commit, pytest, vitest, End-to-End) im frischen Klon ausführen; `scripts/session-start.sh` auf macOS prüfen (Header nennt nur Linux); SSH-Verbindung zum netcup-VPS herstellen und Tarif, Ausstattung, Betriebssystem und Laufzeit erfassen; Plattform-Matrix (`docs/project-context.md` Abschnitt 3) und Runbook (Abschnitt 2 und 5) nachziehen.
- **Akzeptanzkriterien:** Onboarding-Pfad auf macOS im frischen Klon validiert (`[ONBOARDING-VALIDATION]` im Logbuch); alle Tests grün; Plattform-Matrix zeigt macOS ✓; SSH-Anmeldung am VPS per Schlüssel belegt; Ausstattung des VPS in `docs/project-context.md` Abschnitt 8 (Preis entfällt, Eigentümer 2026-09-27).
- **Betroffene Module:** keine (Werkzeuge und Betrieb)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** `docs/project-context.md` Abschnitt 3 und 8, `docs/onboarding-runbook.md`, Logbuch
- **Notizen:** Angelegt 2026-09-27 (ADR-025). Nummer 4.9 aus Stabilität der bestehenden IDs; läuft vor der Fortsetzung von 4.2.

#### 4.10: VPS-Bestand erkunden und Einpassung vorschlagen

- **Status:** ERLEDIGT (2026-09-27) – Bestand erhoben (allgemeine Fassung `docs/research/vps-bestand.md`, Details nur lokal beim Eigentümer); Eigentümer entschied Einpassung als Container (ADR-027)
- **Phasentyp-Kontext:** STABILISIERUNG (Erkundung; Host ist `[OFFEN]`, CLAUDE.md Abschnitt 6)
- **Abhängigkeiten:** 4.9 (SSH-Zugang)
- **Freigabepflichtig:** Erhebung nein (nur lesend); Einpassung ja (Kategorien 3, 6, 7) – ADR-027
- **Empfohlene Klasse:** Entscheidung – mündet in `ENTSCHEIDUNG ERFORDERLICH` (Eskalations-Auslöser 1).
- **Eingangskriterien:** SSH per Schlüssel zum VPS
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Nur lesend erheben, wie die vorhandenen Anwendungen installiert sind; Konflikte mit den Vorgaben des Skriptoriums benennen; Einpassung als Entscheidung vorlegen.
- **Akzeptanzkriterien:** Bestand und Befunde dokumentiert; Entscheidung als ADR; 4.2 an die Entscheidung angepasst.
- **Betroffene Module:** keine (Betrieb)
- **Reifegrad-Wirkung:** keine (Host bleibt `[OFFEN]` bis 4.2)
- **Artefakte:** `docs/research/vps-bestand.md`, ADR-027
- **Notizen:** Angelegt 2026-09-27 auf Auftrag des Eigentümers. Keine Änderung am VPS. Das Repo ist öffentlich – Server-Details bleiben außerhalb (Eigentümer, 2026-09-27).

#### 4.11: Branch-Schutz für `main` einrichten

- **Status:** ERLEDIGT (2026-09-28) – Option A (ADR-028): Force-Push und Löschen gesperrt, Merge nur per Pull Request mit den vier grünen Pflicht-Checks, Admins ausgenommen. Beleg durch erzwungenen Fehler an einem Wegwerf-Branch mit identischer Einstellung (Force-Push und Löschen abgelehnt), nicht an `main` selbst (destruktiver Eingriff bei Versagen, CLAUDE.md Abschnitt 8, Kriterium 6); Einstellung an `main` per API gleich. project-context Abschnitt 7 und 10 nachgezogen
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** ja – Repository- und Pipeline-Regeln (Kategorie 7)
- **Empfohlene Klasse:** Entscheidung – `ENTSCHEIDUNG ERFORDERLICH` (Eskalations-Auslöser 1).
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Befund 2026-09-28: `main` hat auf GitHub keinen Branch-Schutz (API: „Branch not protected“), `docs/project-context.md` Abschnitt 7 und 10 behaupten Force-Push-Sperre und Merge nur bei grüner CI. Vorschlag vorlegen: Force-Push und Löschen sperren, Merge nur über Pull Request mit grünen Pflicht-Gates (Pre-Commit, Python, TypeScript, End-to-End).
- **Akzeptanzkriterien:** Schutz aktiv und durch einen absichtlich abgewiesenen Versuch belegt (Force-Push auf `main` wird abgelehnt; CLAUDE.md Abschnitt 6); project-context stimmt mit dem Zustand überein.
- **Betroffene Module:** keine (Repository)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR, `docs/project-context.md` Abschnitt 10
- **Notizen:** Angelegt 2026-09-28 auf Wunsch des Eigentümers. Anlass: Frage nach Force-Push zum Entfernen des Host-Namens aus der Historie – verworfen, weil die Commits über PR #21 auf GitHub sichtbar bleiben.

#### 4.12: Reverse Proxy auf eine unterstützte Linie heben

- **Status:** ERLEDIGT (2026-09-28) – ADR-033: Proxy von 2.11.42 auf 3.7.13; Sicherungskopie des Proxy-Verzeichnisses samt Zertifikaten vorher (nur root lesbar); alle 9 angebundenen Hostnamen vorher und nachher mit identischer Antwort (lokal gegen den Proxy), drei davon zusätzlich von außen samt Zertifikat geprüft, HTTP→HTTPS-Umleitung wirkt. Ohne Übergangsschalter – alle Regeln waren schon v3-gültig. Rückweg: altes Image und Sicherungskopie (Details nur lokal). Neue Hinweise von 3.7 (Kopfzeilen-Aliase, kodierte Zeichen) dem Eigentümer als optional vorgelegt
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** D.7
- **Frist:** vor 4.6 (Gate-Punkt 3: Host erhält Sicherheitsupdates)
- **Freigabepflichtig:** ja – Major-Update einer Abhängigkeit, die alle Dienste des Eigentümers trägt (Kategorien 3 und 7)
- **Empfohlene Klasse:** Entscheidung – `ENTSCHEIDUNG ERFORDERLICH` (Eskalations-Auslöser 1).
- **Eingangskriterien:** Sicherungskopie der Proxy-Konfiguration
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Befund D.7: Linie 2.11 ohne Sicherheitsupdates seit 2026-09-07. Update auf die unterstützte Linie mit Übergangsschalter für die bisherige Regel-Syntax; Konfiguration und Labels aller angebundenen Dienste vorher gegen die Migrationshinweise des Herstellers prüfen; Rückweg über das bisherige Image-Tag.
- **Akzeptanzkriterien:** Proxy läuft in einer Linie mit Sicherheitsunterstützung; alle vorher erreichbaren Dienste von außen wieder erreichbar (Liste vorher erhoben); Rückweg dokumentiert (nur lokal beim Eigentümer).
- **Betroffene Module:** keine (Betrieb)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR
- **Notizen:** Angelegt 2026-09-28 aus D.7. Server-Details nur lokal.

### Phase 5: Soll-Anforderungen – Typ: UMSETZUNG

**Ziel:** Die Soll-Anforderungen und die Kann-Anforderung sind umgesetzt oder begründet zurückgestellt; die nächste Ausbaustufe ist geplant.

**Abschlusskriterium:** Schritte 5.1–5.5 `[ERLEDIGT]` oder `[VERWORFEN]` mit ADR.

**Reifegrad-Erwartung am Phasenende:** unverändert `[BELASTBAR]`; keine neuen Architektur-Bestandteile erwartet.

**Ursprünglicher Schrittplan:** 5 Schritte, festgehalten am 2026-09-26 – wird nicht still hochgesetzt (CLAUDE.md Abschnitt 8, Kriterium 9)

**Pflichtfrage am Phasenende:** ADR „Weiterbauen, umbauen oder neu aufsetzen" – Nummer wird beim Phasenabschluss vergeben

#### 5.1: Kanon-Vorschläge ohne `@`

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 3.5
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Namenserkennung über den vorhandenen Index, spezifiziert in `context`.
- **Eingangskriterien:** wie Phase 3
- **Anforderungen (ab Klasse M):** FR-014
- **Zu tun:** Kanon-Namen ohne `@` erkennen und nur als Vorschlag anbieten („Meintest du @Kael?").
- **Akzeptanzkriterien:** Nicht angenommene Vorschläge beeinflussen den KI-Kontext nicht (FR-014).
- **Betroffene Module:** context, ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests
- **Notizen:** –

#### 5.2: Bedienung am Smartphone

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 4.7
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Anpassung der Oberfläche ohne Architekturwirkung.
- **Eingangskriterien:** öffentliches System läuft
- **Anforderungen (ab Klasse M):** FR-019
- **Zu tun:** Oberfläche für Smartphone-Bildschirme anpassen; Test auf einem Smartphone-Browser.
- **Akzeptanzkriterien:** UC-003, UC-004, UC-008 auf einem Smartphone-Browser durchführbar (FR-019).
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Code, Tests
- **Notizen:** –

#### 5.3: Lesbare Dateien – Nachweis

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 2.5
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Routine – Nachweis an vorhandenen Daten.
- **Eingangskriterien:** Datenverzeichnis mit mindestens einer Welt samt Geschichte
- **Anforderungen (ab Klasse M):** FR-020
- **Zu tun:** Voraussichtlich schon durch die Speicherform aus ADR-003 erfüllt (Markdown-Dateien als Quelle der Wahrheit); hier nur Nachweis und ggf. Lücken schließen.
- **Akzeptanzkriterien:** Eine Welt samt Geschichten ist ohne das Skriptorium in einem Texteditor lesbar (FR-020).
- **Betroffene Module:** storage
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Logbuch-Eintrag mit Nachweis
- **Notizen:** Kann vorgezogen werden, sobald 2.5 erledigt ist.

#### 5.4: Zeitlinie mit Datumsangaben im Kalender der Welt (Kann)

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 2.3
- **Freigabepflichtig:** ja, falls das Datenmodell erweitert wird (Kategorie 4)
- **Empfohlene Klasse:** Entscheidung – eine Datenmodell-Erweiterung ist freigabepflichtig (Eskalations-Auslöser 1).
- **Eingangskriterien:** Entscheidung des Eigentümers, ob die Kann-Anforderung umgesetzt wird
- **Anforderungen (ab Klasse M):** FR-023
- **Zu tun:** Zeitlinien-Einträge optional mit Datumsangaben im Kalender der Welt.
- **Akzeptanzkriterien:** Umgesetzt mit Tests oder `[VERWORFEN]` mit ADR.
- **Betroffene Module:** canon, ui
- **Reifegrad-Wirkung:** ggf. Datenmodell
- **Artefakte:** Code, Tests oder ADR
- **Notizen:** –

#### 5.5: Planung der nächsten Ausbaustufe

- **Status:** OFFEN
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.1, 5.2, 5.3, 5.4
- **Freigabepflichtig:** ja – neue Phasen sind Replanning (Fahrplan, Replanning-Historie)
- **Empfohlene Klasse:** Entscheidung – inhaltliche Neuplanung mit Vision-Abgleich, nicht bloß Status-Update.
- **Eingangskriterien:** Vision-Abgleich an der Phasengrenze nach Phase 5
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Die verschobenen Schritte V.1 bis V.5 in konkrete Schritte einer neuen Phase überführen oder per ADR verwerfen (V.4 und V.5 ergänzt beim Phasenabschluss 3: ihr Landeplatz ist 5.5).
- **Akzeptanzkriterien:** Jeder Schritt V.1–V.5 hat einen neuen `[OFFEN]`-Schritt mit ID oder einen `[VERWORFEN]`-Status mit ADR.
- **Betroffene Module:** keine (Planung)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Fahrplan, ggf. ADRs
- **Notizen:** –

### Querschnitt: datierte, ausgelöste und verschobene Schritte

Diese Schritte gehören zu keiner Phase; sie werden fällig durch ein Datum, einen Auslöser oder die Planung in 5.5. Sie zählen nicht zum Schrittplan einer Phase.

#### D.1: Wechsel Node.js 24 → Node.js 26 LTS

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 2.1
- **Frist:** frühestens 2026-11-05 (Mindestreife), spätestens vor 2028-04-30 (Lebensende Node 24); Vorlauf 6 Monate laut Ablaufdaten-Register
- **Freigabepflichtig:** ja – Major-Wechsel einer Laufzeitumgebung (Kategorie 3, Versionsregel ADR-002)
- **Empfohlene Klasse:** Entscheidung – Major-Update mit erneuter Versions-Verifikation und ADR (Eskalations-Auslöser 1).
- **Eingangskriterien:** Node 26 ist LTS und erfüllt die Mindestreife; Vite und Plugin unterstützen sie nachweislich
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Versions-Verifikation für Node 26 und npm; Build und Tests auf Node 26; Pins und Ablaufdaten-Register nachziehen.
- **Akzeptanzkriterien:** Build und CI auf Node 26 grün; `docs/project-context.md` Abschnitte 3 und 8 aktualisiert.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR, Konfiguration
- **Notizen:** –

#### D.2: Nachprüfung TypeScript 7

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 2.1
- **Frist:** fällig ab 2027-01-08 (Nachprüf-Datum aus dem Ablaufdaten-Register)
- **Freigabepflichtig:** ja, falls gewechselt wird (Major-Update, Kategorie 3)
- **Empfohlene Klasse:** Entscheidung – mögliche Major-Entscheidung mit ADR (Eskalations-Auslöser 1).
- **Eingangskriterien:** TypeScript 7 hat Mindestreife und ein Patch-Release
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Reife von TypeScript 7 und Unterstützung durch die Werkzeuge prüfen; Pflegestand von TypeScript 6 prüfen; Wechsel vorschlagen oder neues Nachprüf-Datum setzen.
- **Akzeptanzkriterien:** Entscheidung dokumentiert; Ablaufdaten-Register aktualisiert.
- **Betroffene Module:** ui
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR oder Register-Eintrag
- **Notizen:** Zusatz 2026-09-26 (ADR-015): vitest 5 mitprüfen – mindestreif erst ab 2027-03-03; ist das bei D.2 noch nicht erreicht, eigenes Nachprüf-Datum im Register setzen. Kompatibilität typescript-eslint mit TypeScript 7 prüfen (8.70.1 verlangt `typescript <6.1.0`). Zusatz 2026-09-26 (ADR-019): jsdom 30 ab 2027-01-27 mindestreif – mit prüfen.

#### D.3: Nachprüfung httpx

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 1.3
- **Frist:** 2027-03-26
- **Freigabepflichtig:** ja, falls eine Ersatz-Bibliothek nötig wird (Kategorie 3)
- **Empfohlene Klasse:** Routine – Prüfung von Pflegestand und Kompatibilität; bei Ersatzbedarf Eskalation auf die Entscheidungs-Klasse.
- **Eingangskriterien:** Frist erreicht
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Pflegestand von httpx und Deklaration von Python 3.14 prüfen; bei schwacher Pflege Alternative vorlegen.
- **Akzeptanzkriterien:** Ergebnis dokumentiert; Ablaufdaten-Register mit neuem Datum oder Ersatzentscheidung.
- **Betroffene Module:** ai_gateway
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Register-Eintrag, ggf. ADR
- **Notizen:** –

#### D.4: Prüfung „kein Kontextverlust" beim Referenzumfang

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 3.6
- **Frist:** kein Datum – Auslöser: eine Geschichte erreicht ≥ 500.000 Token (Entscheidung des Eigentümers, ADR-009)
- **Freigabepflichtig:** nein
- **Empfohlene Klasse:** Entscheidung – der Nachweis kann die NFR Kontexttreue auf `[BELASTBAR]` befördern (Eskalations-Auslöser 4).
- **Eingangskriterien:** Auslöser erreicht (Umfang anhand der Token-Zählung aus 1.1 festgestellt)
- **Anforderungen (ab Klasse M):** keine (Nachweis der Akzeptanz von FR-010, umgesetzt in 3.6)
- **Zu tun:** Erfolgskriterien „kein Kontextverlust" und „günstiger pro Anfrage" (Vision 4) an dieser Geschichte prüfen; Kosten je Anfrage mit der Referenz (125.000–140.000 Token) vergleichen. Zusatz 2026-09-27 (aus 3.6): Länge der erzeugten Kurzfassungen (Vorgabe 150 bis höchstens 250 Wörter) und der Gesamtzusammenfassung (höchstens ca. 600) an Kapiteln echter Länge messen; in 3.6 bei kurzen Testkapiteln 290/336 bzw. 623 Wörter. Passt der Handlungsstand aller Kapitel ins Budget?
- **Akzeptanzkriterien:** Beide Kriterien belegt oder widerlegt; bei Widerlegung neuer ERKUNDUNG-Schritt.
- **Betroffene Module:** context
- **Reifegrad-Wirkung:** NFR Kontexttreue Referenzumfang `[OFFEN]` → `[BELASTBAR]` oder begründeter Erkundungsbedarf
- **Artefakte:** Messprotokoll, ADR `[ERKENNTNIS]`
- **Notizen:** Bis dahin gilt das Kriterium als unbelegt.

#### D.5: Wechsel auf httpx2 und Nachprüfung mypy 2

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 2.1
- **Frist:** 2026-11-12 (Mindestreife httpx2; mypy 2 ab 2026-11-06)
- **Freigabepflichtig:** ja – httpx2 ist eine neue externe Abhängigkeit (Kategorie 3)
- **Empfohlene Klasse:** Entscheidung – Freigabe einer neuen Abhängigkeit (Eskalations-Auslöser 1).
- **Eingangskriterien:** Frist erreicht
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** httpx2 nach Regel-001 prüfen und zur Freigabe vorlegen; Tests (Starlette-TestClient) und `ai_gateway` auf httpx2 umstellen; benannte Ausnahme aus dem Warnungs-Bestand entfernen; Streaming, Timeout und Abbruch wie in 1.3 erneut prüfen. Mit erledigen: mypy 2 nach Regel-001 prüfen und ggf. wechseln.
- **Akzeptanzkriterien:** Tests ohne Warnungs-Ausnahme grün; Warnungs-Bestand leer; Ablaufdaten-Register aktualisiert; D.3 angepasst oder aufgelöst.
- **Betroffene Module:** ai_gateway
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR, Register-Eintrag
- **Notizen:** Herkunft ADR-015 (Befund aus 2.1). Vitest 5 wird mit D.2 (2027-01-08) bzw. ab Mindestreife 2027-03-03 nachgeprüft.

#### D.6: Reaktionszeit bis zum ersten Textstück erkunden

- **Status:** ERLEDIGT (2026-09-28) – 28 Läufe im Container auf dem VPS (0,71 $, `spikes/reaktionszeit/README.md`): Wartezeit wächst mit der Länge des Vorab-Denkens (ca. 16 ms je Denk-Token), die bei gleichem Kontext stark streut; `effort: low` ist schon die niedrigste Stufe, Abschalten lehnt der Anbieter ab, eine Denk-Obergrenze verlängert das Denken (54–149 s), ausführender Anbieter immer xAI. grok-4.7 4–29 s (Median 16), grok-4.6 5–11 s (Median 6); 90-s-Grenze reicht. Eigentümer wählt A: Zielwerte angepasst, Einstellungen bleiben (ADR-035); NFR Reaktionszeit → `[BELASTBAR]`. Tageszeit nicht geprüft
- **Phasentyp-Kontext:** ERKUNDUNG
- **Abhängigkeiten:** 3.3
- **Frist:** vor 4.8 (Stoppuhr-Test FR-022)
- **Freigabepflichtig:** nein (Erkundung); eine Änderung an Timeouts oder Modell-Konfiguration aus dem Ergebnis ist eine Schnittstellenänderung und freigabepflichtig
- **Empfohlene Klasse:** Routine – Messreihe mit festgelegtem Aufbau; Entscheidung erst im Anschluss.
- **Eingangskriterien:** `spikes/probeschreiben/probe.py` lauffähig; OpenRouter-Guthaben für ca. 0,30–0,50 $
- **Anforderungen (ab Klasse M):** keine (NFR Reaktionszeit, ADR-013)
- **Zu tun:** Erstes Textstück bei grok-4.7 und grok-4.6 je ca. 10 Anfragen messen; Einfluss der Reasoning-Einstellung (Stufe, Obergrenze für Denk-Token, sofern der Anbieter sie anbietet), des ausführenden Anbieters und der Tageszeit prüfen; Anteil der Denk-Token an den Ausgabe-Token erfassen; prüfen, ob die 90-s-Grenze in `ai_gateway` reicht.
- **Akzeptanzkriterien:** Wissensbasiert: Ursache der Ausreißer belegt oder als nicht beeinflussbar belegt; Vorschlag an den Eigentümer (Einstellung ändern oder Zielwerte per ADR anpassen); NFR Reaktionszeit wieder `[BELASTBAR]`.
- **Betroffene Module:** ai_gateway
- **Reifegrad-Wirkung:** NFR Reaktionszeit `[VORLÄUFIG]` → `[BELASTBAR]`
- **Artefakte:** Spike-Bericht, ADR
- **Notizen:** Herkunft ADR-022 (Abnahme 3.3).

#### D.7: Unterstützungsstand des Reverse Proxys prüfen

- **Status:** ERLEDIGT (2026-09-28) – Proxy läuft in 2.11.42; Sicherheitsunterstützung der Linie 2.11 endete am 2026-09-07, unterstützt ist nur noch 3.7 (Hersteller: doc.traefik.io/traefik/deprecation/releases/, abgerufen 2026-09-28). Register-Eintrag angelegt; Update als Schritt 4.12 zur Entscheidung vorgelegt
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.2
- **Frist:** vor 4.6 (Gate-Punkt 3)
- **Freigabepflichtig:** Prüfung nein; ein Update des Proxys ja (Kategorie 3 und 7, betrifft alle Dienste des Eigentümers)
- **Empfohlene Klasse:** Routine – Recherche gegen Hersteller-Quellen; ein Update-Vorschlag wäre Entscheidung.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Befund 2026-09-28: Der Proxy läuft in der Major-Linie 2. Prüfen, ob sie noch Sicherheitsupdates erhält (Hersteller-Quelle); bei Lebensende Eintrag ins Ablaufdaten-Register und Update als Entscheidung vorlegen.
- **Akzeptanzkriterien:** Wissensbasiert: Unterstützungsende mit Quelle belegt; Register und ggf. Schritt angelegt.
- **Betroffene Module:** keine (Betrieb)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Eintrag im Ablaufdaten-Register
- **Notizen:** Herkunft 4.2.

#### D.8: Zugangsdaten der Proxy-Verwaltung rotieren

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** keine
- **Frist:** 2026-10-05 (spätestens vor 4.6)
- **Freigabepflichtig:** nein (Rotation bestehender Zugangsdaten); das neue Passwort wählt und setzt der Eigentümer selbst
- **Empfohlene Klasse:** Routine – festgelegter Ablauf ohne Architekturwirkung.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Befund 2026-09-28: Beim Lesen der Proxy-Konfiguration (4.12) gelangte der Hash des Passworts der Proxy-Verwaltung ins Gesprächsprotokoll der KI (`CLAUDE.md` Abschnitt 6: gilt als kompromittiert). Neues Passwort durch den Eigentümer, neuer Hash in der Proxy-Konfiguration, altes Passwort nirgends weiterverwenden.
- **Akzeptanzkriterien:** Anmeldung mit dem alten Passwort abgelehnt, mit dem neuen möglich (von außen geprüft); Ergebnis im Logbuch ohne Werte.
- **Betroffene Module:** keine (Betrieb)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Logbuch-Eintrag
- **Notizen:** Server-Details nur lokal.

#### D.9: Nachprüfung Unterstützung des Reverse Proxys

- **Status:** OFFEN
- **Phasentyp-Kontext:** STABILISIERUNG
- **Abhängigkeiten:** 4.12
- **Frist:** 2026-12-28
- **Freigabepflichtig:** Prüfung nein; ein Update ja (Kategorien 3 und 7)
- **Empfohlene Klasse:** Routine – Abgleich mit der Hersteller-Tabelle.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Hersteller-Tabelle prüfen: Wird 3.7 noch mit Sicherheitsupdates versorgt? Neue Patch-Version einspielen oder Update der Minor-Linie vorlegen; nächste Nachprüfung anlegen.
- **Akzeptanzkriterien:** Stand mit Quelle im Ablaufdaten-Register; ggf. Folgeschritt angelegt.
- **Betroffene Module:** keine (Betrieb)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** Ablaufdaten-Register
- **Notizen:** Herkunft 4.12. Vorgänger 3.6 verlor die Sicherheitsunterstützung gut drei Monate nach Erscheinen von 3.7.

#### D.10: Probelauf Routine- und Mechanik-Klasse

- **Status:** ERLEDIGT (2026-09-28) – Kopie des Repos mit 5 eingebauten Abweichungen, Soll-Werte per Skript; je vier frische Unteragenten mit wörtlich gleichen Aufträgen. Routine (Sonnet 5): 5/5 gefunden, keine falschen Befunde, Logbuch-Entwurf korrekt → bestanden. Mechanik (Haiku 4.5): 2 von 3 Aufgaben richtig, beim Zählen Zeilen statt Vorkommen → nicht bestanden. Referenz Opus 5.5 fehlerfrei; fand zusätzlich zwei echte Kleinigkeiten im Repo (Überschrift der Reifegrad-Übersicht, Typname `[GELÖST]` in der Typen-Tabelle des Logbuchs) – behoben
- **Phasentyp-Kontext:** STABILISIERUNG (Methodik)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein – Dokumentationspflege; die Aktivierung einer Klasse folgt aus dem Ergebnis nach `CLAUDE.md` Abschnitt 0, „Probelauf"
- **Empfohlene Klasse:** Entscheidung – die Bewertung der Abweichungen verlangt die höhere Klasse als Maßstab.
- **Eingangskriterien:** keine
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Typische Aufgaben je Klasse (Routine: Drift-Prüfung mit README-Synchronisation, Logbuch-Eintrag; Mechanik: Zählen und Suchen) in einer Kopie des Repos mit absichtlich eingebauten Abweichungen und per Skript ermittelten Soll-Werten; dieselben Aufträge wörtlich an die Probe-Klasse und an die Entscheidungs-Klasse als frische Unteragenten; Abweichungen bewerten.
- **Akzeptanzkriterien:** Ergebnis mit Datum je Klasse in `docs/project-context.md` Abschnitt 6 (bestanden oder nicht, mit Begründung); bei bestanden: für welche Aufgabenarten die Abgabe gilt.
- **Betroffene Module:** keine (Methodik)
- **Reifegrad-Wirkung:** keine
- **Artefakte:** `docs/project-context.md` Abschnitt 6, Logbuch
- **Notizen:** Angelegt 2026-09-28 auf Wunsch des Eigentümers.

#### M.1: Branch-Konvention festlegen

- **Status:** ERLEDIGT (2026-09-26)
- **Phasentyp-Kontext:** querschnittlich (Methodik)
- **Abhängigkeiten:** keine
- **Freigabepflichtig:** nein (Dokumentation der Repository-Regeln, `docs/project-context.md` Abschnitt 10; keine Umbenennung des Hauptbranches)
- **Empfohlene Klasse:** Routine – Dokumentationspflege ohne Architekturwirkung.
- **Eingangskriterien:** Auftrag des Eigentümers vom 2026-09-26 („vernünftige Branch-Konvention: Feature, Bugfix usw.")
- **Anforderungen (ab Klasse M):** keine
- **Zu tun:** Branch-Typen, Namensform, Umgang mit werkzeugvergebenen `claude/`-Branches, Lebensdauer und Merge-Art festhalten.
- **Akzeptanzkriterien:** Konvention steht in `docs/project-context.md` Abschnitt 10 und ist mit `CLAUDE.md` Abschnitt 11 vereinbar.
- **Betroffene Module:** keine
- **Reifegrad-Wirkung:** keine
- **Artefakte:** `docs/project-context.md` Abschnitt 10
- **Notizen:** –

#### V.1: Publizieren (Satz, Export, Veröffentlichung)

- **Status:** VERSCHOBEN
- **Landeplatz (nur VERSCHOBEN):** 5.5
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.5
- **Freigabepflichtig:** ja, bei Umsetzung (neue Funktion, ggf. neue Abhängigkeiten)
- **Empfohlene Klasse:** Entscheidung – Planung einer neuen Funktion mit möglichen Architektur- und Abhängigkeitsfragen.
- **Eingangskriterien:** Planung in 5.5
- **Anforderungen (ab Klasse M):** keine (Vision 5: nicht in der ersten Version, nicht ausgeschlossen)
- **Zu tun:** in 5.5 in konkrete Schritte überführen oder verwerfen
- **Akzeptanzkriterien:** siehe 5.5
- **Betroffene Module:** noch offen
- **Reifegrad-Wirkung:** keine
- **Artefakte:** –
- **Notizen:** –

#### V.2: Bilder und Karten

- **Status:** VERSCHOBEN
- **Landeplatz (nur VERSCHOBEN):** 5.5
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 5.5
- **Freigabepflichtig:** ja, bei Umsetzung (neue Funktion, ggf. Datenmodell)
- **Empfohlene Klasse:** Entscheidung – Planung einer neuen Funktion mit möglichen Datenmodell-Fragen.
- **Eingangskriterien:** Planung in 5.5
- **Anforderungen (ab Klasse M):** keine (Vision 5: nicht in der ersten Version, nicht ausgeschlossen)
- **Zu tun:** in 5.5 in konkrete Schritte überführen oder verwerfen
- **Akzeptanzkriterien:** siehe 5.5
- **Betroffene Module:** noch offen
- **Reifegrad-Wirkung:** keine
- **Artefakte:** –
- **Notizen:** –

#### V.3: Weitere KI-Anbieter neben OpenRouter

- **Status:** VERSCHOBEN
- **Landeplatz (nur VERSCHOBEN):** 5.5
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 3.1, 5.5
- **Freigabepflichtig:** ja – jeder Anbieter ist ein neuer externer Dienst (Kategorie 3)
- **Empfohlene Klasse:** Entscheidung – neue externe Abhängigkeit (Eskalations-Auslöser 1).
- **Eingangskriterien:** Erweiterungspunkt aus 3.1 (FR-025) umgesetzt
- **Anforderungen (ab Klasse M):** keine (FR-025 selbst ist in 3.1 umgesetzt)
- **Zu tun:** konkrete Anbieter auswählen und je einen Adapter ergänzen
- **Akzeptanzkriterien:** siehe 5.5
- **Betroffene Module:** ai_gateway
- **Reifegrad-Wirkung:** keine
- **Artefakte:** –
- **Notizen:** –

#### V.4: Import aus TypingMind (Agenten-JSON)

- **Status:** VERSCHOBEN
- **Landeplatz (nur VERSCHOBEN):** 5.5 – vorgezogen, falls der 30-Minuten-Test (4.8) am Import scheitert (ADR-012)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 2.4
- **Freigabepflichtig:** ja – Eingangsformat ist Teil des Datenmodells (Kategorie 4)
- **Empfohlene Klasse:** Entscheidung – Datenmodell-Festlegung (Eskalations-Auslöser 1).
- **Eingangskriterien:** ein TypingMind-Agenten-Export liegt vor (z. B. Test-Agent mit erfundenem Inhalt)
- **Anforderungen (ab Klasse M):** keine (FR-005 in 2.4 erfüllt)
- **Zu tun:** Schema des Exports klären (Systemanweisung, Wissensdateien), Importer in `canon.importers` ergänzen.
- **Akzeptanzkriterien:** Ein Agenten-Export wird ohne Handarbeit als Welt-Material übernommen.
- **Betroffene Module:** canon
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR zum Format, Code, Tests
- **Notizen:** –

#### V.5: Import aus Notion (Markdown-Export mit Unterseiten)

- **Status:** VERSCHOBEN
- **Landeplatz (nur VERSCHOBEN):** 5.5 – vorgezogen, falls der 30-Minuten-Test (4.8) am Import scheitert (ADR-012)
- **Phasentyp-Kontext:** UMSETZUNG
- **Abhängigkeiten:** 2.4
- **Freigabepflichtig:** ja – Eingangsformat ist Teil des Datenmodells (Kategorie 4)
- **Empfohlene Klasse:** Entscheidung – Datenmodell-Festlegung (Eskalations-Auslöser 1).
- **Eingangskriterien:** ein Notion-Markdown-Export mit Unterseiten liegt vor (z. B. Testseite mit erfundenem Inhalt)
- **Anforderungen (ab Klasse M):** keine (FR-005 in 2.4 erfüllt)
- **Zu tun:** Verhalten von Unterseiten und Dateistruktur des Exports klären, Importer auf dem Markdown-Importer aus 2.4 aufbauen.
- **Akzeptanzkriterien:** Ein Notion-Export mit Unterseiten wird ohne Handarbeit als Welt-Material übernommen.
- **Betroffene Module:** canon
- **Reifegrad-Wirkung:** keine
- **Artefakte:** ADR zum Format, Code, Tests
- **Notizen:** –

---

<!-- ANCHOR:iterations-reflexion -->
## Iterations-Reflexion

Nach Abschluss jeder Phase wird ein Reflexions-Eintrag `[PHASEN-WECHSEL]` im Logbuch angelegt (Verdichtung nach `CLAUDE.md` Abschnitt 14); die Phasen-Bilanzen stehen bei den Phasen oben. Bisher: Phase 1 (2026-09-26), Phase 2 (2026-09-26), Phase 3 (2026-09-27).

---

<!-- ANCHOR:parallelisierbarkeit -->
## Parallelisierbarkeit

- Schritte **ohne Abhängigkeiten zueinander**: 1.1, 1.2, 1.3; 2.3 und 2.5 (nach 2.2); 3.4, 3.5, 3.6, 3.9 (nach 3.3); 5.1, 5.3, 5.4
- Schritte **mit gemeinsamen Modulen** (Konfliktgefahr): 2.3 und 2.4 (`canon`); 3.4, 3.5, 3.6 und 3.7 (`context`); 3.8 (`canon`, `manuscript`, `ui`) mit 3.4 und 3.7

<!-- ANCHOR:replanning-historie -->
## Replanning-Historie

- 2026-09-26 – Erstplanung in Modus 2 Schritt 6 (fünf Phasen, Querschnitt D.1–D.4 und V.1–V.3); kein Replanning.

<!-- ANCHOR:archiv-abgeschlossene-phasen -->
## Archiv / abgeschlossene Phasen

- Phase 1: [`docs/archiv/fahrplan-phase-1.md`](archiv/fahrplan-phase-1.md) – abgeschlossen 2026-09-26
- Phase 2: [`docs/archiv/fahrplan-phase-2.md`](archiv/fahrplan-phase-2.md) – abgeschlossen 2026-09-26
- Phase 3: [`docs/archiv/fahrplan-phase-3.md`](archiv/fahrplan-phase-3.md) – abgeschlossen 2026-09-27
