# Logbuch – Skriptorium

<!-- Chronologischer Flugschreiber des Projekts. Ereignisbasierte Einträge, neueste oben.
     Zweck:
       1. Nahtlose Fortsetzung in neuer Session: was war zuletzt los, womit ging es zu Ende?
       2. Wiederfindbarkeit kleiner Lösungen: was war das nochmal mit dem Migrations-Bug?
       3. Selbst-Beobachtung des Projekts: was hat länger gedauert, was war überraschend?

     Abgrenzung zu anderen Dokumenten:
       - fahrplan.md: Was tun wir? (Plan)
       - decisions.md: Warum so? (Begründung)
       - architecture.md: Wie ist es gebaut? (Zustand)
       - blockers.md: Was hindert uns aktuell? (offene Probleme)
       - CHANGELOG.md: Was hat sich für Nutzer geändert? (extern, versionsorientiert)
       - logbuch.md: Was ist während der Arbeit passiert? (intern, chronologisch)

     Das Logbuch ist die einzige chronologisch durchlaufende Erzählung.
     Es darf detailreich sein und kleine Reibungen festhalten – das ist sein Wert. -->

<!-- ANCHOR:aktueller-stand -->
## Aktueller Stand

Die letzten Einträge geben den aktuellen Stand wieder. Bei Sessionbeginn liest die KI mindestens den letzten `[SESSIONENDE]`-Eintrag und alle Einträge danach, um den Faden aufzunehmen.

Das Logbuch beginnt mit der ersten regulären Session nach dem Initialisierungs-Commit (Modus 2, abgeschlossen 2026-09-26). Verlauf und Begründungen der Initialisierung stehen in `docs/decisions.md` (ADR-001 bis ADR-009). Phasen 1 bis 3 sind verdichtet; Details in `docs/archiv/logbuch-phase-1.md`, `docs/archiv/logbuch-phase-2.md` und `docs/archiv/logbuch-phase-3.md`.

---

<!-- ANCHOR:eintraege -->
## Einträge (neueste oben)

### 2026-09-28 18:15 – [ERLEDIGT] D.10 Probelauf Routine- und Mechanik-Klasse

- Auf Wunsch des Eigentümers nach dem Sessionende weitergearbeitet. Aufbau: Worktree von `main` mit 5 eingebauten Abweichungen (README Blocker-Zähler 1, D.6 noch unter „Nächste Schritte“, Host `[VORLÄUFIG]`, Reaktiv-Quote 2/10, ADR-036 in D.6), dort committet, damit kein Diff sie verrät; Soll-Werte für Zählen und Suchen per Skript. Vier frische Unteragenten, wörtlich gleiche Aufträge: Routine-Aufgaben an Sonnet 5 und Opus 5.5, Mechanik-Aufgaben an Haiku 4.5 und Opus 5.5.
- **Routine (Sonnet 5):** 5/5 gefunden, keine falschen Befunde, Zeilenangaben stichprobenartig bestätigt; Logbuch-Entwurf ohne erfundene Fakten, Typ `[PROBLEM-GELÖST]` nach der Typen-Tabelle (begründet). Dauer 3,5 min. → bestanden.
- **Mechanik (Haiku 4.5):** ADR-Zählung und Liste der offenen Schritte richtig; „Pwned Passwords“ in `decisions.md` 8 statt 9 – Zeilen statt Vorkommen gezählt (`grep -c`-Falle). → nicht bestanden, Klasse bleibt inaktiv.
- **Referenz (Opus 5.5):** alles richtig; fand zusätzlich zwei echte Kleinigkeiten: Überschrift der Reifegrad-Übersicht nannte nur 4.2, Typen-Tabelle des Logbuchs nannte `[PROBLEM-GELÖST]`, die Praxis seit Phase 3 `[GELÖST]`. Beide behoben.
- Kontext der Session bei ca. 270.000 Token (Grenze 200.000) – Dauerwunsch des Eigentümers.

### 2026-09-28 17:40 – [SESSIONENDE] 4.2, 4.5, D.6 erledigt; 4.3 zurückgestellt

- **Dauer:** 16:04–17:40 UTC.
- **Bearbeitet:** 4.2 → `[ERLEDIGT]` (ADR-034, Host → `[BELASTBAR]`); 4.3 zurückgestellt (Sicherungsziel offen); 4.5 → `[ERLEDIGT]` (getrennte Instanz, keine Befunde; Bedrohungsmodell → `[BELASTBAR]`); optionale Kopfzeilen nach 4.7; D.6 → `[ERLEDIGT]` (ADR-035, NFR Reaktionszeit → `[BELASTBAR]`). PR #26 gemergt, PR #27 (D.6 und dieser Eintrag).
- **Offen:** 4.3 (Entscheidung Sicherungsziel), danach 4.4, 4.6, 4.7, 4.8; D.8 Rotation (Eigentümer, bis 2026-10-05).
- **Nächster Schritt:** Sicherungsziel für 4.3 entscheiden (Vorschlag A: Mac holt täglich per SSH).
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session`); oberhalb der Empfehlung: D.6 (Routine, Hinweis zu Beginn). Abgegeben: Sicherheitsprüfung 4.5 an Unteragenten mit Sonnet 5 (getrennte Instanz, keine Routine-Abgabe).
- **Kontextgröße:** 254.086 Token nach D.6 (Grenze 200.000) – nach dem Dauerwunsch des Eigentümers weitergearbeitet (Logbuch 2026-09-28 01:00).
- **Kontingent:** Wochenlimit 17 %, 5-Stunden-Limit 15 %.
- **Sessionende-Prüfungen:** README synchron (Phase, Architektur-Reife, Nächste Schritte); Drift: ADR-034 ↔ 4.2, ADR-035 ↔ D.6 vorhanden; Reaktiv-Quote 0/10 (ADR-026..035); Phase 4 mit 12 Schritten unter der Wucherungs-Schwelle 16; Modul-Liste unverändert; Reifegrade ↔ ADRs stimmig (Host, Bedrohungsmodell, Reaktionszeit); keine aktiven Blocker. Logbuch ca. 430 Zeilen, project-context 339 Zeilen – kein Trigger. Ablaufdaten: Vorlauf Guthaben ab 2026-10-22 noch nicht erreicht. Keine Server-Details im Repo (Suche nach Host und Adresse ohne Treffer).

### 2026-09-28 17:30 – [ERLEDIGT] D.6 Reaktionszeit (ADR-035)

- Messung zuerst lokal geplant (Schlüssel verdeckt eingeben); Eigentümer fragte, warum nicht per SSH im Container. Zwei Versuche (Prüfbefehl im Container, Paket bauen) von der Freigabe-Automatik der Sitzung blockiert („Production Reads“, „Remote Shell Writes“); nach ausdrücklicher Anweisung des Eigentümers („bau das Paket, du führst es aus“) lief die Ausführung: Skript samt Kontext per Standardeingabe in `docker exec -i skriptorium python -`, nichts im Container geschrieben, Schlüssel nicht gesehen.
- 28 Läufe, 0,71 $. Ursache: Länge des Vorab-Denkens (ca. 16 ms je Denk-Token), stark streuend; `effort: low` minimal, Abschalten verweigert (HTTP 400), Denk-Obergrenze kontraproduktiv (54–149 s), nur Anbieter xAI. grok-4.7 Median 16 s (4–29), grok-4.6 Median 6 s (5–11).
- Eigentümer wählt A: Zielwerte angepasst (ADR-035), NFR Reaktionszeit → `[BELASTBAR]` (Eskalations-Auslöser 4, Entscheidungs-Klasse). D.6 empfahl Routine – oberhalb der Empfehlung, Hinweis zu Beginn gegeben.

### 2026-09-28 17:05 – [ERLEDIGT] Schritt 4.5 Unabhängige Sicherheitsprüfung

- **Getrennte Instanz:** Unteragent mit Claude Sonnet 5, ohne Gesprächsverlauf; Auftrag: Gesamtsystem auf `main` gegen Bedrohungsmodell (`docs/architecture.md` Abschnitt 6) und ASVS 5.0.0 L1 / Auth und Sitzung L2; nur lesend, ohne `.env` und `data/`. Dauer ca. 4 Minuten, 61 Werkzeugaufrufe.
- **Ergebnis:** keine Befunde hoch oder mittel. Ein niedriger Befund (fehlendes `X-Content-Type-Options: nosniff`, von der Instanz selbst als „unsicher“ markiert): am ASVS-5.0.0-Originaltext (GitHub OWASP/ASVS, Tag v5.0.0) geprüft – 3.4.4 ist Stufe 2, also über dem Niveau → optional. Ebenso optional: `Referrer-Policy` (3.4.5, Stufe 2), `Permissions-Policy`.
- **Ohne Befund geprüft:** Anmeldung, Einrichtungscode, Sperre, Pwned Passwords, Sitzung, Schutz aller Routen, Herkunftsprüfung (auch Streaming), Schlüssel in Code/Image, Pfadsicherheit, SQL, XSS, Logging, Container.
- Bedrohungsmodell vorher auf Stand gebracht (Host und Netz aus 4.2).
- Eigentümer wählt alle drei optionalen Kopfzeilen; umgesetzt in 4.7 (Zusatz dort).

### 2026-09-28 17:05 – [REIFEGRAD-WECHSEL] Bedrohungsmodell → BELASTBAR

- Grundlage: Prüfung 4.5 ohne Befunde. Netz-Teil bleibt `[VORLÄUFIG]` bis 4.7. Eskalations-Auslöser 4 – auf der Entscheidungs-Klasse.

### 2026-09-28 16:35 – [BEOBACHTUNG] 4.3 zurückgestellt

- Eigentümer: Duplicati auf dem VPS hat kein externes Sicherungsziel – auch die übrigen Dienste des Eigentümers sind damit nicht außerhalb des Servers gesichert (Hinweis gegeben). Vorschlag zum Sicherungsziel (A Mac holt per SSH, B gemieteter Speicher mit restic, C Duplicati extern) vorgelegt; Eigentümer: „auf später verlegen“. 4.3 bleibt `[OFFEN]` mit Notiz; Gate 4.6 wartet darauf. Wiederherstellungs-Test auf dem Mac freigegeben.

### 2026-09-28 16:25 – [ERLEDIGT] Schritt 4.2 Host bereitstellen und härten (ADR-034)

- Überwachung auf dem VPS nur lesend geprüft: Uptime Kuma 2.4.0 hängt nur am Proxy-Netz, ohne Docker-Socket – erreicht das Skriptorium nicht (so gewollt, ADR-030). Erster Vorschlag (Kuma bei 4.7 / internes Netz / Push-Job) vom Eigentümer verworfen: „Kuma hat eine andere Aufgabe“. Zweiter Vorschlag: Verzicht per ADR oder GitHub-Actions-Prüfung ab 4.7 → Eigentümer wählt Verzicht (ADR-034, Restrisiko: Ausfall fällt erst beim Öffnen auf).
- Nachgeholter Beleg: automatische Sicherheitsupdates aktiv (Dienst aktiv, Periodic-Einstellungen 1/1, letzter Lauf heute 06:31), Firewall aktiv.
- Abnahme gegen die (geänderten) Akzeptanzkriterien: Ports von außen und SSH-Passwort-Ablehnung aus der vorigen Session belegt.

### 2026-09-28 16:25 – [REIFEGRAD-WECHSEL] Host → BELASTBAR

- Grundlage: Prüfung von außen mit erzwungenem Fehlerfall (Passwort-Anmeldung abgelehnt, geschlossene Ports), Firewall und Updates aktiv, Proxy auf unterstützter Linie (ADR-033). Netz bleibt `[VORLÄUFIG]`, Beförderung in 4.7 nach den Prüfungen durch den Proxy; Secrets und Backups bleiben `[OFFEN]` (4.3, 4.6). Eskalations-Auslöser 4 – auf der Entscheidungs-Klasse.

### 2026-09-28 16:05 – [SESSIONSTART] Schritt 4.2 fortsetzen

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage `get_session`) → Entscheidungs-Klasse; entspricht der Empfehlung für 4.2.
- **Kontingent:** Wochenlimit 15 % (Zurücksetzung So 04.10. 10:00 MESZ), 5-Stunden-Limit 1 % (`get_usage`).
- **Kontext nach der Mindest-Lektüre:** 148.251 Token (Grenze 200.000).
- **Wiedereinstieg:** letztes `[SESSIONENDE]` 2026-09-28 01:45, danach Beobachtung OpenRouter-Schlüssel; PR #25 gemergt (`bacac6d`), Arbeitsbaum sauber. Keine aktiven Blocker, keine offenen STOPP-Situationen.
- **Vorhaben:** 4.2 abschließen – Eintrag in der vorhandenen Überwachung mit absichtlich herbeigeführtem Ausfall; offen D.8 (Rotation, Frist 2026-10-05).

### 2026-09-28 01:55 – [BEOBACHTUNG] OpenRouter-Schlüssel auf dem VPS (4.2, nach dem Sessionende)

- Eigentümer trug den Schlüssel über ein Skript mit verdeckter Eingabe ein (Übertragung per SSH-Standardeingabe, vorher an einer Kopie erprobt). Ergebnis ohne Werte: im Container gesetzt, von OpenRouter erkannt, Ausgabengrenze am Schlüssel 50 $ (Kostenrahmen 50 € je Monat, Hosting ohne Betrag). `.env` mit Rechten 600, Eigentümer root; Container danach `healthy`. Hilfsskripte gelöscht. Beleg für Gate-Punkt 4 (Ausgabengrenze).

### 2026-09-28 01:45 – [SESSIONENDE] Schritt 4.2 (Installation), D.7, 4.12

- **Dauer:** 00:27–01:45 UTC.
- **Bearbeitet:** 4.2 → `[IN ARBEIT]` (Container installiert, ADR-029 bis ADR-032, PR #24 gemergt); D.7 → `[ERLEDIGT]`; 4.12 → `[ERLEDIGT]` (Proxy 3.7.13, ADR-033); D.8 (Rotation) und D.9 (Nachprüfung) angelegt. PR #25 offen.
- **Offen:** 4.2: Überwachung mit erzwungenem Ausfall, OpenRouter-Schlüssel (Eigentümer); D.8 Rotation bis 2026-10-05; Merge von PR #25. Eigentümer fragte nach Freischaltung im Proxy – entschieden: nichts überspringen, erst nach Gate 4.6.
- **Nächster Schritt:** 4.2 abschließen, dann 4.3 und 4.5.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session`); oberhalb der Empfehlung: D.7 (Routine). Abgegeben: nichts.
- **Kontextgröße:** 242.067 Token am Ende (Grenze 200.000) – auf ausdrücklichen Wunsch des Eigentümers weitergearbeitet („verschone mich mit den Session Limits“).
- **Sessionende-Prüfungen:** README synchron (Phase, Nächste Schritte); Drift: ADR-029..032 ↔ 4.2, ADR-033 ↔ 4.12 vorhanden; Reaktiv-Quote 0/10 (ADR-024..033); Phase 4 mit 12 Schritten unter der Wucherungs-Schwelle 16; Modul-Liste und Reifegrade unverändert (Host `[OFFEN]` bis 4.2 abgeschlossen); keine aktiven Blocker. Logbuch ca. 375 Zeilen, kein Archiv-Trigger. Ablaufdaten: Proxy-Linie im Register (D.9); Vorlauf Guthaben ab 2026-10-22 noch nicht erreicht. Keine Server-Details im Repo (Suche nach Host, Adresse, Hash ohne Treffer).

### 2026-09-28 01:35 – [BEOBACHTUNG] Rotation D.8 abgebrochen

- Eigentümer meinte zunächst, das alte Passwort nicht mehr zu kennen (später korrigiert: bekannt); gewählt: eigenes Passwort über ein Skript mit verdeckter Eingabe (bcrypt-Hash direkt auf den Server, KI sieht weder Passwort noch Hash), gegen eine Kopie der Konfiguration erprobt. Eigentümer brach vor der Eingabe ab. Konfiguration unverändert (Prüfsummen-Präfix gleich), Hilfsskripte entfernt. D.8 bleibt offen, Frist 2026-10-05.

### 2026-09-28 01:20 – [ERLEDIGT] Schritt 4.12 Proxy-Update (ADR-033)

- Eigentümer gibt nach dem STOPP frei („ja“). Sicherungskopie (16 MB, mit Zertifikaten); dabei brach `tar` zuerst ab, weil sich das laufende Zugriffsprotokoll beim Lesen änderte – wiederholt mit Duldung genau dieser Warnung.
- Umstellung 2.11.42 → 3.7.13 per Image-Tag, Unterbrechung ca. 15 s. 9 Hostnamen vorher/nachher identisch; von außen drei Hosts mit gültigem Zertifikat, Umleitung HTTP→HTTPS wirkt. Keine Fehler im Protokoll nach dem Start.
- 3.7 meldet zwei neue Hinweise: `aliasHeadersStrategy` nicht gesetzt (Kopfzeilen wie `X_Auth_User` werden durchgereicht – relevant für PHP-Dienste) und Voreinstellungen für kodierte Zeichen im Pfad. Nicht Teil der Anforderungen des Skriptoriums (Obergrenze Schutzbedarf) – dem Eigentümer als optional vorgelegt.

### 2026-09-28 01:10 – [STOPP] Passwort-Hash der Proxy-Verwaltung in der Ausgabe (4.12)

- Beim Lesen der dynamischen Proxy-Konfiguration wurden Hostnamen ausgeblendet, der Hash des Passworts für die Proxy-Verwaltung aber nicht. Gilt als kompromittiert (`CLAUDE.md` Abschnitt 6). Eigentümer sofort informiert; Rotation als D.8 mit Frist angelegt. Update 4.12 angehalten bis zur Antwort.
- **Lehre:** Beim Lesen fremder Konfigurationen nicht nur Hostnamen, sondern alle Zeilen mit `users`, `password`, `key`, `secret`, `token` ausfiltern.

### 2026-09-28 01:00 – [ERLEDIGT] D.7 Unterstützungsstand des Proxys

- Proxy 2.11.42; Sicherheitsunterstützung der Linie 2.11 endete 2026-09-07, nur 3.7 wird noch unterstützt (Hersteller-Tabelle). Register-Eintrag und Schritt 4.12 (Update, freigabepflichtig) angelegt.
- Alle Routing-Regeln der angebundenen Dienste nutzen nur `Host`, `PathPrefix`, `&&`, `||` – in v3 unverändert gültig (nur lesend geprüft, Details lokal).
- „Weiter hier“ vom Eigentümer als Dauerwunsch („verschone mich mit den Session Limits“); Kontext über der Grenze von 200.000 Token – Abweichung nach `CLAUDE.md` Abschnitt 0 vermerkt.

### 2026-09-28 00:45 – [BEOBACHTUNG] Prüfung von außen (4.2)

- Alle 65.535 TCP-Ports von außen geprüft: offen SSH, HTTP, HTTPS und zwei Ports eines anderen Dienstes des Eigentümers – einer davon liefert eine Anwendung ohne TLS am Proxy vorbei aus (in der Firewall ausdrücklich freigegeben). Nicht Sache des Skriptoriums; Eigentümer im Chat informiert, Details nur dort. Für Gate-Punkt 3 relevant, weil der Host geteilt ist.
- SSH mit Passwort: abgelehnt, angeboten wird nur `publickey`.
- Proxy läuft in der Major-Linie 2; Unterstützungsstand ungeprüft → D.7.

### 2026-09-28 00:40 – [BEOBACHTUNG] Skriptorium auf dem VPS installiert (4.2)

- Image lokal (arm64) zur Probe gebaut, 236 MB; dann auf dem VPS aus dem Quellstand `f79e8af` gebaut (wie eine vorhandene Anwendung des Eigentümers). Compose-Projekt mit eigenem Netz, ohne Port, ohne Proxy-Router; Dateisystem schreibgeschützt, alle Capabilities entzogen, `no-new-privileges`, Speichergrenze 1 GB.
- Auf dem Server: Gesundheitsprüfung ok, `/api/worlds` 401, Oberfläche 200, Pwned Passwords aus dem Container erreichbar, Container nach 60 s `healthy`. Von außen Port 8000 nicht erreichbar.
- `.env` nur für root lesbar, ohne OpenRouter-Schlüssel – den trägt der Eigentümer selbst ein (die KI fasst keine Secrets an).
- Compose-Datei und Einrichtung stehen nur auf dem Server (Eigentümer: keine Server-Details im Repo).

### 2026-09-28 00:30 – [ADR] ADR-029 bis ADR-032

- Eigentümer: Einrichtung mit root-Zugang, keine Server-Details im Repo, erst nach dem Gate öffentlich, sonst alle Empfehlungen (offizielle Images, eigenes Netz, Kurznamen im Proxy-Protokoll zulässig). Beschränkung des KI-Zugangs danach bleibt offen bis 4.6.

### 2026-09-28 00:27 – [SESSIONSTART] Schritt 4.2

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage `get_session`) → Entscheidungs-Klasse; entspricht der Empfehlung für 4.2.
- **Kontingent:** Wochenlimit 6 % (Zurücksetzung So 04.10. 10:00 MESZ), 5-Stunden-Limit 26 % (`get_usage`).
- **Kontext nach der Mindest-Lektüre:** 142.380 Token (Grenze 200.000).
- **Wiedereinstieg:** letztes `[SESSIONENDE]` 2026-09-28 00:20; PR #23 gemergt (`8338a59`), Arbeitsbaum sauber. Keine aktiven Blocker, keine offenen STOPP-Situationen.
- **Vorhaben:** 4.2 nach ADR-027 – Entscheidungen zu Container-Image und KI-Konto vorlegen.

### 2026-09-28 00:20 – [SESSIONENDE] Schritte 4.9 und 4.11

- **Dauer:** 00:05–00:20 UTC.
- **Bearbeitet:** 4.9 → `[ERLEDIGT]` (Validierung im frischen Klon); 4.11 → `[ERLEDIGT]` mit ADR-028. PR #23 (4.9 und 4.11 als Bündel).
- **Offen:** Merge von PR #23 durch den Eigentümer.
- **Nächster Schritt:** neue Session – 4.2 nach ADR-027 (Dockerfile und Compose, Entscheidungen zu Container-Image und KI-Konto vorlegen).
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5, `get_session`); oberhalb der Empfehlung: 4.9 (Routine). Abgegeben: Klon-Validierung an einen Unteragenten gleicher Klasse – nicht aus Kostengründen, sondern um den Kontext dieser Session klein zu halten.
- **Kontextgröße:** 178.530 Token am Ende (Grenze 200.000); 136.494 schon nach der Mindest-Lektüre.
- **Sessionende-Prüfungen:** README synchron (Status, Nächste Schritte); Drift: ADR-028 ↔ 4.11 vorhanden; Reaktiv-Quote korrigiert (s. u.), jetzt 0/10 über ADR-019..028; Phase 4 mit 11 Schritten unter der Wucherungs-Schwelle 16; Modul-Liste und Reifegrade unverändert; keine aktiven Blocker. Archiv-Trigger nicht erreicht (Logbuch ca. 310 Zeilen). Ablaufdaten: Vorlauf des Guthabens (2026-11-05) beginnt 2026-10-22, noch nicht erreicht. Keine Server-Details im Repo.

### 2026-09-28 00:19 – [GELÖST] Reaktiv-Quote falsch gezählt

- **Symptom:** Teil A nannte 0/10 über ADR-018..027, obwohl ADR-018 `[REAKTIV]` ist – richtig wäre 1/10 gewesen (unter der Schwelle 30 %, also ohne Folgen).
- **Lösung:** Mit ADR-028 fällt ADR-018 aus dem Fenster; Wert 0/10 über ADR-019..028, Korrektur in Teil A vermerkt.

### 2026-09-28 00:18 – [ERLEDIGT] Schritt 4.11 Branch-Schutz (ADR-028)

- Eigentümer wählt A. Schutz an `main`: vier Pflicht-Checks (Namen der CI-Jobs), Pull Request ohne Pflicht-Review, Force-Push und Löschen gesperrt, Admins ausgenommen.
- **Erzwungener Fehler** an Wegwerf-Branch `test/4.11-schutzprobe` mit gleicher Einstellung: Force-Push abgelehnt (GH006), Löschen abgelehnt, direkter Push als Admin „Bypassed“. Probe-Branch danach entfernt. Nicht an `main` erprobt – wäre bei Versagen destruktiv (Stopp-Kriterium 6); Akzeptanzkriterium entsprechend erfüllt über identische, per API ausgelesene Einstellung.
- **Beobachtung:** Admin-Ausnahme gilt auch für den Coding-Agent (pusht mit dem Konto des Eigentümers). Umbenennung eines CI-Jobs würde jeden Merge blockieren, bis der Pflicht-Check nachgezogen ist.

### 2026-09-28 00:15 – [ERLEDIGT] Schritt 4.9 Entwicklungsumgebung macOS

- Plattform-Matrix macOS arm64 auf ✓; Runbook Abschnitt 1, 2 und 5 nachgezogen; README Status und Nächste Schritte.

### 2026-09-28 00:12 – [ONBOARDING-VALIDATION] macOS arm64, frischer Klon (4.9)

- **Durchführung:** Unteragent (Opus 5.5, abgegeben wegen Kontextgröße, nicht wegen Klasse), `git clone` des lokalen Repos von `f75be2d` ins Scratch-Verzeichnis; SessionStart-Hook, dann Quick Start aus der README exakt wie dokumentiert. Dauer ca. 2 Minuten.
- **Ergebnis:** ohne Bruch. pytest 381/381 (Zeilen 100 %, Zweige 98,8 %, gesamt 99,78 %); vitest 96/96 (98,65 % Zeilen, 96,22 % Zweige); Playwright 8/8; Pre-Commit 17/17 Hooks; Server: `/api/health` ok, `/api/worlds` 401, `/` 200. Versionen uv 0.12.19, Python 3.14.7, Node 24.21.0, npm 11.19.0.
- **Einschränkung:** nicht völlig frisch – Werkzeug-Cache `~/.cache/skriptorium-tools/`, Pre-Commit-Cache und Chromium waren vorhanden; die Download-Pfade des Hooks liefen nicht erneut. Geklont aus dem lokalen Repo statt von GitHub.
- **Befunde (Doku, nichts blockierend):** Runbook nannte nur Linux als unterstützt und die Validierung als offen; kein macOS-Abschnitt in Runbook 5 (PATH außerhalb der Session, `fsevents`-Hinweis von npm zu `allowScripts`, `npm install` im Hook statt `npm ci`). Behoben im selben Commit.

### 2026-09-28 00:05 – [SESSIONSTART] Schritt 4.9 abschließen

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage `get_session`) → Entscheidungs-Klasse. 4.9 ist Routine: läuft oberhalb der Empfehlung, weil kein Probelauf für die Routine-Klasse vorliegt (knappe Ressource: Wochenkontingent, Stand 6 %, Zurücksetzung So 10:00 MESZ).
- **Kontext nach der Mindest-Lektüre:** 136.494 Token (Grenze 200.000); Grundlast bereits über der Hälfte der Grenze.
- **Wiedereinstieg:** letztes `[SESSIONENDE]` 2026-09-28 00:00; PR #22 gemergt (`f75be2d`). Nachtrag aus der vorigen Session: Nach PR #22 wurden alle gemergten Remote-Branches gelöscht (13 alte Cloud-Session-Branches und die Branches aus 4.9/4.10) sowie der ungemergte, überholte Branch `claude/was-haben-wir-hier-nagbzp` (Löschung vom Eigentümer freigegeben). Auf GitHub existiert nur `main`.
- **Vorhaben:** 4.9 abschließen – Validierung des Onboarding-Pfads im frischen Klon auf macOS, Plattform-Matrix auf ✓.

### 2026-09-28 00:10 – [BEOBACHTUNG] Kein Force-Push; `main` ohne Branch-Schutz

- Eigentümer fragte nach Force-Push, um den Host-Namen aus der Historie zu entfernen. Vorher geprüft: Die betroffenen Commits (`2f2fe82`, `a392057`) bleiben über PR #21 auf GitHub sichtbar; entfernen kann nur der GitHub-Support. Die Subdomains sind ohnehin über Certificate Transparency öffentlich. Eigentümer entschied: kein Force-Push.
- Dabei gefunden: `main` hat keinen Branch-Schutz – Widerspruch zu `docs/project-context.md` Abschnitt 7 und 10. Schritt 4.11 angelegt.

### 2026-09-28 00:00 – [SESSIONENDE] Erkundung VPS (4.10) nach „weiter hier“

- **Dauer:** 23:35–00:00 UTC (Fortsetzung nach dem Sessionende um 22:58).
- **Bearbeitet:** 4.10 → `[ERLEDIGT]` mit ADR-027; Kostenregister und 4.9 nach Vorgabe des Eigentümers angepasst.
- **Offen:** 4.9 Validierung im frischen Klon; Pull Request für diesen Branch.
- **Nächster Schritt:** neue Session – 4.9 abschließen, dann 4.2 nach ADR-027.
- **Modell-Bilanz:** Entscheidungs-Klasse (Opus 5.5); oberhalb der Empfehlung: 4.9 (Routine). Abgegeben: nichts.
- **Kontextgröße:** über 200.000 Token auf ausdrückliche Anweisung („weiter hier“).
- **Sessionende-Prüfungen:** Drift: ADR-027 ↔ 4.10/4.2 vorhanden; Reaktiv-Quote 0/10 (ADR-018..027); Phase 4 10 Schritte (Schwelle 16); Modul-Liste und Reifegrade unverändert; README unverändert gültig (Nächste Schritte 4.9/4.2). Keine Server-Details im Repo (Suche nach Host-, Proxy- und Pfadnamen ohne Treffer).

### 2026-09-27 23:55 – [ADR] ADR-027 Container hinter dem vorhandenen Reverse Proxy

- Eigentümer wählt A: Das Skriptorium läuft wie die übrigen Anwendungen auf dem VPS als Container hinter dem vorhandenen Proxy. Konfidenz hoch, Umkehrbarkeit billig. 4.2 entsprechend ergänzt; 4.10 erledigt.

### 2026-09-27 23:50 – [GELÖST] Server-Details beinahe im öffentlichen Repo

- **Symptom:** Die erste Fassung der Erkundungs-Notiz enthielt Dienste, Ports, Subdomains und Benutzer des Servers; das Commit wurde vom Werkzeug blockiert. Das Repo ist öffentlich.
- **Lösung:** Eigentümer entscheidet: Details nur lokal außerhalb des Repos; im Repo eine allgemeine Fassung. Der Host-Name aus früheren Commits wurde in den aktuellen Dateien ersetzt, bleibt aber in der Git-Historie.
- **Lehre:** Vor jeder Notiz über Betriebsumgebungen prüfen, ob das Repo öffentlich ist.

### 2026-09-27 23:45 – [BEOBACHTUNG] Bestand auf dem VPS erhoben (4.10)

- Container-Muster mit Reverse Proxy, Überwachung, Sicherung und Runner vorhanden; Firewall, SSH-Härtung und Updates aktiv. Sechs Befunde für das Skriptorium, u. a. Proxy-Adresse im Docker-Netz statt `127.0.0.1` (ADR-017) und Zugriffsprotokoll des Proxys: `docs/research/vps-bestand.md`.

### 2026-09-27 23:35 – [BEOBACHTUNG] „Weiter hier“ über der Kontextgrenze

- Kontext 185.449 Token (Grenze 200.000). Eigentümer sagt ausdrücklich „weiter hier“ und beauftragt die Erkundung des VPS (Schritt 4.10). Abweichung nach `CLAUDE.md` Abschnitt 0 vermerkt.
- Eigentümer: Tarif und Preis des VPS sind nicht Sache des Projekts – Kostenregister und Akzeptanzkriterium von 4.9 angepasst. PR #21 gemergt (`d8bc2bf`).

### 2026-09-27 22:58 – [SESSIONENDE] Schritt 4.9 teilweise

- **Dauer:** 22:28–22:58 UTC.
- **Bearbeitet:** 4.9 – Bestandsaufnahme Mac, ADR-026, Einrichtungsskript für macOS arm64, alle Prüfungen im Haupt-Checkout, Test-Fix E2E, SSH-Abfrage VPS.
- **Erreichter Stand:** 4.9 `[IN ARBEIT]`; Commit `2f2fe82` plus Sessionende-Commit auf `chore/4.9-entwicklung-macos`.
- **Offen:** Validierung im frischen Klon; Plattform-Matrix `docs/project-context.md` Abschnitt 3 auf ✓ (erst danach); Tarif und Preis des VPS vom Eigentümer; Pull Request für diesen Branch.
- **Nächster Schritt:** neue Session – 4.9 abschließen (frischer Klon, Matrix, Kostenregister), dann 4.2.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5 laut `get_session`). Schritte oberhalb der Empfehlung: 1 (4.9, Routine; mangels Probelauf ohne Warnung). Abgegeben: nichts.
- **Kontextgröße:** ca. 185.000 Token (`get_usage` 173.395 vor den letzten Schritten) – Grenze 200.000 fast erreicht, deshalb Abschluss vor Ende des Schritts.
- **Sessionende-Prüfungen:** README (Voraussetzungen) im Skript-Commit nachgezogen; Phase und Nächste Schritte unverändert gültig. Drift: ADR-026 ↔ 4.9 vorhanden; Modul-Liste und Reifegrade unverändert; Reaktiv-Quote 1/10 (ADR-017..026); Phase 4 9 Schritte; Blocker 0. Ablaufdaten-Register: Guthaben-Vorlauf ab 2026-10-22, noch nicht erreicht (lokale Sessions laufen über das Abo). Archivierung: kein Trigger. Onboarding-Pfad: `scripts/` berührt – Validierung im frischen Klon steht aus (offen in 4.9, s. o.).

### 2026-09-27 22:56 – [BEOBACHTUNG] VPS ist bereits in Benutzung; Grundlast des Kontexts

- SSH per Schlüssel (`id_ed25519_ebvps`) als `root`: Ubuntu 24.04.5 LTS, Kernel 6.8, x86_64, 4 Kerne, 7,8 GB RAM (2,4 GB belegt), 251 GB Platte (39 GB belegt), seit 3 Wochen in Betrieb. Nur lesende Befehle. Folgen für 4.2: vorhandene Dienste vor jeder Firewall-Änderung erfassen; eigenes Benutzerkonto für die KI statt `root` (Gate-Punkt 4).
- Lokale Desktop-Session: Werkzeuge, Speicherdateien und Skills belegen schon ca. 85.000 Token vor der ersten Nachricht, die Pflichtlektüre weitere ca. 58.000. Bei der Grenze 200.000 bleiben für die Arbeit nur ca. 57.000 Token – zu wenig für einen mittelgroßen Schritt. Kandidat für eine Anpassung der Grenze (Vorschlag an den Eigentümer).
- `npm install` meldet auf macOS `fsevents` mit Installationsskripten (nicht freigegeben, optionale macOS-Abhängigkeit); ohne Wirkung auf die Tests. Warnungsquelle ohne Schalter.

### 2026-09-27 22:50 – [GELÖST] End-to-End-Test „marked passage“ scheitert auf macOS

- **Symptom:** Schaltfläche „In den Kanon“ bleibt gesperrt, Zeitüberschreitung. Zuvor alle 8 Tests mit „Not Found“ – nur weil die Oberfläche nicht gebaut war (`npx vite build` fehlte, im Runbook jetzt genannt).
- **Ursache:** `Control+Home`/`Control+End` sind auf macOS in CodeMirror nicht Dokument-Anfang/-Ende (dort `Cmd`); es wird nichts markiert.
- **Lösung:** `ControlOrMeta+Home`/`+End` in `e2e/skriptorium.spec.ts`; unter Linux unverändert `Control`. 8/8 in zwei Läufen grün.

### 2026-09-27 22:40 – [ADR] ADR-026 Einrichtungsskript auch für macOS

- Bestandsaufnahme Mac: macOS 27.0 arm64, Homebrew 7.0.4, uv 0.11.7 (Homebrew), Node 24.15.0 / npm 11.12.1 (nodejs.org-Installer, root), Python 3.9.6, bash 3.2 – alles unter den Projektversionen. Eigentümer wählt Option A: `scripts/session-start.sh` auch für macOS arm64, Werkzeuge in `~/.cache/skriptorium-tools`. Konfidenz mittel (Hook-Umgebung der Desktop-App, bash 3.2), Umkehrbarkeit billig.
- VPS für das Skriptorium ist laut Eigentümer ein bestimmter Host-Eintrag in seiner `~/.ssh/config` (Name nur lokal, Repo öffentlich).

### 2026-09-27 22:28 – [SESSIONSTART] Schritt 4.9 – erste Session auf dem Mac

- **Modell:** eingestellt `claude-opus-5-5` (Sitzungsabfrage `get_session` 22:28) → Entscheidungs-Klasse. Empfohlene Klasse für 4.9 ist Routine; deren Probelauf ist offen, deshalb übernimmt die Entscheidungs-Klasse – keine Warnung nötig, keine Abgabe möglich.
- **Umgebung:** erste lokale Session in der Claude-Desktop-App auf dem Mac des Eigentümers (macOS, Darwin 27.0.0), nicht mehr Cloud-Session (ADR-025).
- **Kontextgröße:** 142.965 Token nach der Pflichtlektüre laut Sitzungsabfrage (`get_usage`; Kontextfenster 1.000.000). Grenze 200.000 – Spielraum für diese Session ca. 57.000 Token. Erstmals zu Beginn ein echter Wert (in der Cloud-Session stand dort 0). Kurzzeitlimit 21 %, Wochenlimit 6 % (Zurücksetzung 2026-10-04 08:00 UTC).
- PR #20 gemergt (`9cc0bd3`); Branch `chore/4.9-entwicklung-macos` von `main` angelegt (Namensform nach `docs/project-context.md` Abschnitt 10 – erstmals frei wählbar).
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2 (project-context, Logbuch ab letztem Sessionende, Fahrplan Stand und Phase 4, Architektur 1/2/9, Decisions A/C, aktive Blocker: keine).
- **Vorhaben:** Schritt 4.9 Entwicklungsumgebung macOS einrichten.

### 2026-09-27 22:22 – [SESSIONENDE] Anbieter für 4.2 entschieden, Wechsel auf macOS

- **Dauer:** 22:15–22:22 UTC.
- **Bearbeitet:** 4.2 – `ENTSCHEIDUNG ERFORDERLICH` zum VPS-Anbieter vorgelegt (Recherche `docs/research/hosting-anbieter.md`); Eigentümer entschied: vorhandener netcup-VPS, Entwicklung wechselt auf macOS, von dort SSH-Zugriff der KI (ADR-025). Neuer Schritt 4.9 „Entwicklungsumgebung macOS einrichten“ angelegt; 4.2 hängt davon ab.
- **Erreichter Stand:** 4.2 `[OFFEN]` mit entschiedenem Anbieter; Phase 4 jetzt 9 Schritte (Wucherungs-Schwelle nicht berührt).
- **Offen:** Tarif, Ausstattung, Betriebssystem und Laufzeit des netcup-VPS unbekannt (Erfassung in 4.9); Umfang des SSH-Zugriffs der KI (in 4.2, belegt in 4.6); Pull Request für diesen Branch.
- **Nächster Schritt:** 4.9 in der ersten Session auf dem Mac – Onboarding-Pfad auf macOS validieren, SSH zum VPS herstellen, VPS-Daten erfassen.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 22:21). Schritte oberhalb der Empfehlung: 0. Abgegeben: nichts.
- **Kontextgröße:** 176.519 Token laut Sitzungsabfrage – unter der Grenze 200.000. Kurzzeitlimit `allowed`. Kosten der Session laut Abfrage 2,28 $ (Guthaben).
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Nächste Schritte). Drift-Prüfung: ADR-025 ↔ 4.2/4.9 vorhanden; Modul-Liste unverändert; Reifegrade unverändert (Host `[OFFEN]`, Netz `[VORLÄUFIG]`), Host-Zeile in Architektur Abschnitt 6 nachgezogen; Reaktiv-Quote 1/10 (ADR-016 bis ADR-025, ADR-025 nicht reaktiv: Kategorien 3, 6, 7); Plattform-Matrix und Runbook konsistent (macOS vorgesehen, nicht validiert); Blocker 0; Anforderungen unverändert. Ablaufdaten-Register: kein Vorlauf erreicht. Archivierung: kein Trigger. project-context 338 Zeilen. Onboarding-Pfad: nicht berührt (nur Dokumentation).

### 2026-09-27 22:21 – [ADR] ADR-025 netcup-VPS, macOS, SSH-Zugang der KI

- Eigentümer hat bereits einen netcup-VPS; kein Neukauf. Da die Cloud-Session kein SSH nach außen erlaubt, wechselt die Entwicklung auf seinen Mac. Konfidenz mittel (VPS-Daten unbekannt), Umkehrbarkeit billig.

### 2026-09-27 22:18 – [BEOBACHTUNG] Anbieterlage und SSH aus der Cloud-Session

- **SSH gesperrt:** Aus der Cloud-Session sind ausgehende Verbindungen auf Port 22 nicht möglich (Test gegen github.com:22). Die KI kann einen Server also nicht selbst per SSH einrichten; Einrichtung über Browser-Konsole des Anbieters, Cloud-Init oder GitHub Actions.
- **Hetzner ausverkauft:** Alle günstigen Cloud-Tarife (CX, CAX) seit 2026-09-07 nicht bestellbar, Preise 2026 zweimal erhöht; verfügbar nur teurere Tarife ab ca. 14 € brutto. Übersicht aller geprüften Anbieter: `docs/research/hosting-anbieter.md`.

### 2026-09-27 22:15 – [SESSIONSTART] Schritt 4.2

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 22:15) → Entscheidungs-Klasse. Empfohlene Klasse für 4.2 ist Entscheidung (Eskalations-Auslöser 1) – passt, kein Stopp, keine Warnung.
- **Kontextgröße:** 0 Token laut Sitzungsabfrage (Wert zu Beginn nicht aktualisiert, wie in den Vorsessions). Kurzzeitlimit (5 Stunden) `allowed`.
- PR #19 gemergt (`a528047`); Branch `scp/sharp-wright-4ofnvz` steht auf `main`.
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2 (project-context, Logbuch ab letztem Sessionende, Fahrplan Stand und Phase 4, Architektur 1/2/9, Decisions A/C, aktive Blocker: keine).
- **Vorhaben:** Schritt 4.2 Host bereitstellen und härten – zuerst `ENTSCHEIDUNG ERFORDERLICH` zum VPS-Anbieter (Kategorien 3, 6, 7).

### 2026-09-27 13:10 – [SESSIONENDE] Schritt 4.1

- **Dauer:** 12:48–13:10 UTC.
- **Bearbeitet:** 4.1 Qualitäts-Härtung → `[ERLEDIGT]`.
- **Erreichter Stand:** Coverage nachgewiesen (Python 99,78 %, `canon`/`context` 100 %; Oberfläche 98,65 % Zeilen, 96,43 % Zweige); Fehler in der Seitenauswahl von `context` behoben; Tempo `storage` im Referenzumfang gemessen; Geschichtenseite aufgeteilt.
- **Offen:** Pull Request für diesen Branch (Merge nach grüner CI und Zustimmung des Eigentümers).
- **Nächster Schritt:** 4.2 Host bereitstellen und härten – `ENTSCHEIDUNG ERFORDERLICH` zum VPS-Anbieter (Kategorien 3, 6, 7), Entscheidungs-Klasse.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 12:59). Schritte oberhalb der Empfehlung: 1 (4.1, Routine) – ohne Warnung, weil die Routine-Klasse mangels Probelauf inaktiv ist und ihre Arbeit eine Klasse höher läuft. Abgegeben: nichts.
- **Kontextgröße:** nicht feststellbar – die Sitzungsabfrage meldet während der Session 0 Token; Regel „Sessiongröße“ entfällt für diese Session. Kurzzeitlimit `allowed`.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Nächste Schritte); project-context Status nachgezogen. Drift-Prüfung: 4.1 ↔ ADR-024 vorhanden; Modul-Liste unverändert (nur Dateien innerhalb von `ui`); Reifegrad `storage` um die Messung ergänzt, kein Wechsel; keine neuen ADRs, Reaktiv-Quote 1/10 unverändert; Phase 4 unverändert 8 Schritte; Blocker 0; Anforderungen unverändert. Ablaufdaten-Register: kein Vorlauf erreicht (Guthaben ab 2026-10-22). Archivierung: kein Trigger (Logbuch unter 1.600 Zeilen, Phase 4 offen). project-context 338 Zeilen. Onboarding-Pfad: nicht berührt (keine Änderung an README-Quick-Start, `scripts/`, `.env.example`, Abhängigkeiten).

### 2026-09-27 13:05 – [ERLEDIGT] Schritt 4.1 Qualitäts-Härtung

- **Coverage:** Python 381 Tests, 99,78 % (Zeilen und Zweige); `canon` 100 %, `context` 100 % (kritische Pfade ≥ 90 %). Oberfläche 96 Komponenten-Tests, 98,65 % Zeilen, 96,43 % Zweige; 8 End-to-End-Tests grün. Verbleibende Teilzweige in `ai_gateway`, `api` (6) sind Absicherungen ohne erreichbaren Normalfall (z. B. Anbieter ohne `aclose`) – bewusst nicht gezielt getestet.
- **Randfälle:** Abbruch, Ablehnung, zu großer Kontext und zu großes Kapitel für die Kurzfassung waren schon abgedeckt; neu: Weiterschreiben mit leerem Kanon und leerem Kapitel, sehr langes Kapitel (siehe `[GELÖST]`).
- **Aufteilung (ADR-024):** `StoryPage.tsx` 757 Zeilen → `StoryPage` 104, `Guests` 144, `WritingMode` 103, `Facts` 67, `StorySummary` 56, `ChapterSummary` 80, `ChapterEditor` 226; `SceneForm` (73) aus `WritingPanel.tsx` (jetzt 372) gelöst. Tests unverändert grün, Coverage gleich; danach Lücke „Figur abwählen“ in `SceneForm` (50 % Zweige) und `WritingMode` mit Tests geschlossen.
- DoD: ruff, mypy, bandit, eslint, prettier, tsc grün; pip-audit und `npm audit` ohne Befund; Pre-Commit bei jedem Commit aktiv.

### 2026-09-27 13:00 – [BEOBACHTUNG] Tempo von `storage` im Referenzumfang

- 60 Kapitel × 40.000 Zeichen (ca. 727.000 Token) plus 500 Kanon-Einträge: Kapitel speichern 48 ms, alle Kapitel lesen 50 ms, Kontext bauen 161 ms, Volltextsuche 1,7 ms, Index neu aufbauen 257 ms (Median aus 7 Läufen). Alles weit unter dem Anzeige-Ziel 1 s; kein Handlungsbedarf. Protokoll: `spikes/storage-tempo/README.md`; auf dem VPS aus 4.2 wiederholbar.

### 2026-09-27 12:58 – [GELÖST] Langes Kapitel ohne Leerzeilen – KI bekam kein Manuskript

- **Symptom:** Probe mit 3.000 Zeilen (518.000 Zeichen), nur durch einfache Zeilenumbrüche getrennt: die Anfrage enthielt keine einzige Manuskriptseite, ohne Meldung. Mit Leerzeilen dazwischen gingen ca. 26.000 Token mit.
- **Ursache:** `_last_pages` nimmt ganze Absätze von hinten (Trennung `\n\n`) und bricht ab, sobald einer nicht passt – ist schon der letzte Absatz zu groß, bleibt nichts.
- **Lösung:** Passt schon der letzte Absatz nicht, geht sein Ende ab einer Wortgrenze mit vorangestelltem „…“ ein (Muster wie `_opening`); Zeilenumbrüche bleiben erhalten; ganze Absätze bleiben der Normalfall. Tests scheitern ohne die Korrektur (geprüft). Architektur Abschnitt 3 (`context`) ergänzt; keine Schnittstellenänderung.

### 2026-09-27 12:57 – [BEOBACHTUNG] Playwright ohne passenden Browser (bekannt)

- End-to-End-Tests zuerst rot („Executable doesn't exist … chromium_headless_shell-1234“); mit `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium` grün. Steht im Runbook (Troubleshooting); dritte Session in Folge – Kandidat für `scripts/session-start.sh`, aber das wäre eine neue ENV-Voraussetzung im Skript und damit nicht im Autonomiebereich. Nur beobachtet.

### 2026-09-27 12:48 – [SESSIONSTART] Schritt 4.1

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 12:48) → Entscheidungs-Klasse. Empfohlene Klasse für 4.1 ist Routine; deren Probelauf ist offen, deshalb übernimmt die Entscheidungs-Klasse (`docs/project-context.md` Abschnitt 6) – keine Warnung nötig, keine Abgabe möglich.
- **Kontextgröße:** 0 Token laut Sitzungsabfrage (neue Session; Wert zu Beginn nicht aktualisiert). Kurzzeitlimit (5 Stunden) `allowed`.
- PR #18 gemergt (`fdd9822`); Branch `claude/neue-session-4-1-vydo3a` steht auf `main`.
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2 (project-context, Logbuch ab letztem Sessionende, Fahrplan Stand und Phase 4, Architektur 1/2/9, Decisions A/C, aktive Blocker: keine).
- **Verfeinerung Phase 4:** Schritte 4.1–4.8 sind mit Eingabe, Zu tun und Akzeptanzkriterien ausgearbeitet; keine Änderung am Schrittplan nötig.
- **Vorhaben:** Schritt 4.1 Qualitäts-Härtung – Coverage-Nachweis, Randfall-Tests, Tempo-Messung `storage`, Aufteilung `StoryPage.tsx`.

### 2026-09-27 12:42 – [SESSIONENDE] Phase 3 abgeschlossen

- **Dauer:** 12:18–12:42 UTC.
- **Bearbeitet:** Phasenabschluss 3 – Bewertung durch getrennte Instanz (Sonnet 5), Stellungnahme, `ENTSCHEIDUNG ERFORDERLICH`, ADR-024 (weiterbauen; Aufteilung `StoryPage.tsx` in 4.1; Kanon-Treue in 4.8); Vision-Re-Derivations-Pass; Onboarding-Re-Validation; Archivierung Fahrplan Phase 3 und Logbuch-Verdichtung (Phasenabschluss-2-Einträge ins Phase-2-Archiv nachgetragen).
- **Vision-Abgleich (Befund):** Jedes Vision-Element hat eine Schritt-ID oder Descope-ADR; zwei Befunde behoben: 5.5 um V.4/V.5 ergänzt; Kanon-Treue beim Schreiben des Eigentümers mit Landeplatz 4.8 (ADR-024). Muss-Anforderungen: offen nur FR-022 (4.8) und FR-010 Referenzumfang (D.4).
- **Erreichter Stand:** Phase 4 „Stabilisierung und erstes öffentliches Deployment“ bereit; kein aktiver Schritt.
- **Offen:** Pull Request für diesen Branch (Merge nach grüner CI und Zustimmung des Eigentümers).
- **Nächster Schritt:** neue Session – Phase 4 verfeinern, dann 4.1 Qualitäts-Härtung.
- **Modell-Bilanz:** aktive Klasse Entscheidung (Opus 5.5, eingestellt und bedient laut Sitzungsabfrage 12:40). Schritte oberhalb der Empfehlung: 0 (Phasenabschluss verlangt Entscheidung). Abgegeben: Bewertung an Unteragenten mit Sonnet 5 (getrennte Instanz, keine Routine-Abgabe).
- **Kontextgröße:** 203.795 Token laut Sitzungsabfrage 12:40 – knapp über der Grenze 200.000 nach dem Phasenabschluss; kein neuer Schritt in dieser Session. Sitzungskosten laut Abfrage ca. 4,23 $. Kurzzeitlimit `allowed`.
- **Sessionende-Prüfungen:** README synchronisiert (Phase, Architektur-Reife, Nächste Schritte); project-context Status auf Phase 4; Runbook „Geprüft am“ aktualisiert. Drift-Prüfung: Schritt-Referenzen der ADRs existieren (1.x–3.x im Archiv, 4.6, D.4); ADR-024 → 4.1, 4.8 vorhanden; Modul-Liste unverändert; Reifegrad Kanon-Treue ↔ ADR-024 passt; Reaktiv-Quote 1/10 über ADR-015..024; Phase 4 unverändert 8 Schritte; Blocker 0; Anforderungen unverändert. Ablaufdaten-Register: kein Vorlauf erreicht (Guthaben-Vorlauf ab 2026-10-22). Archivierung: Fahrplan Phase 3 → `docs/archiv/fahrplan-phase-3.md`, Logbuch Phase 3 → `docs/archiv/logbuch-phase-3.md`; Abschnitte „Iterations-Reflexion“ und „Archiv“ im Fahrplan nachgezogen (standen noch auf Phase 1). project-context 338 Zeilen.

### 2026-09-27 12:39 – [PHASEN-WECHSEL] Reflexion Phase 3 (UMSETZUNG) → Phase 4 (STABILISIERUNG)

- **Gelernt:** Abnahme je Schritt mit echten Läufen und blinder Bewertung trägt – billig (unter 2 $ für die ganze Phase) und findet, was Tests nicht zeigen (Figuren-Schreibweise, Kurzfassungen, Gäste).
- **Gelernt:** Die Figuren-Schreibweise war die größte Schwäche: 20 Verstöße in 15 Texten (3.3) → 0 eindeutige nach geschärfter Regel plus Erinnerung nach der Anweisung (3.4).
- **Gelernt:** Kapitel-Kurzfassungen tragen den Handlungsstand: 3 von 3 Fortsetzungen richtig mit, 0 von 3 ohne (3.6).
- **Gelernt:** Lücken vor Beginn eines Schritts per Frage-System vom Eigentümer entscheiden lassen – keine Rate-Implementierung in der Phase.
- **Kippende Annahmen:** Reaktionszeit verfehlt (grok-4.7 einmal 77 s, grok-4.6 13–16 s; ADR-022, D.6); Kurzfassungen länger als vorgegeben (D.4); 3.7 und 3.8 berührten weniger Module als geplant (`manuscript` unverändert).
- **Reifegrad:** `context`, `ai_gateway`, SSE durch Umsetzung validiert; Metriken `[BELASTBAR]` (ADR-023); Reaktionszeit zurück auf `[VORLÄUFIG]` (ADR-022); Kanon-Treue `[VORLÄUFIG]` bis 4.8 (ADR-024).
- **ADRs der Phase:** 021–024; reaktiv 0; Quote 1/10 (ADR-015..024).
- **Neue Erkundungsbedarfe:** D.6 vor 4.8; D.4 (Referenzumfang, Kurzfassungslänge). Beobachten: Größe der Oberflächen-Dateien (Aufteilung in 4.1, ADR-024), Wachstum von `spikes/`.
- **Methodik-Lehren:** Sessions liefen wieder weit über die Kontextgrenze (bis ca. 360.000 Token) auf ausdrückliche Anweisung; Phasenabschluss erneut in eigener Session. Regelverstoß `git push -f` ohne Stopp (3.4, kein Schaden) – künftig nur nach Freigabe. Playwright: Auswahlfelder über ihre Rolle ansprechen. ruff RUF001/RUF002: kein Gedankenstrich in Python-Strings und Docstrings.
- **Details:** [`docs/archiv/logbuch-phase-3.md`](archiv/logbuch-phase-3.md)

### 2026-09-27 12:38 – [ADR-ANGELEGT] ADR-024

- Pflichtfrage Phasenende 3: Eigentümer wählt Empfehlung A – weiterbauen; `StoryPage.tsx` (und bei Bedarf `WritingPanel.tsx`) in 4.1 aufteilen; Kanon-Treue beim echten Schreiben des Eigentümers in 4.8 messen (Frage-System). `[STRATEGISCH]`; Bewertung der getrennten Instanz (Sonnet 5) und Stellungnahme im ADR nebeneinander. Die in ADR-020 verlangte erneute Prüfung von `api` auf Heuristik 1.4 ist erfolgt: kein Gott-Modul.
- Befund 2 des Vision-Abgleichs damit aufgelöst: 4.8 ist Landeplatz für die Beförderung von NFR Kanon-Treue.

### 2026-09-27 12:24 – [BEOBACHTUNG] Vision-Re-Derivations-Pass Phasenende 3

- **Quelle:** `docs/vision.md` vollständig, `docs/requirements.md` Abschnitte 3 und 5, Fahrplan Phasen 4, 5 und Querschnitt.
- **Ergebnis:** Kernidee, fünf Szenarien, sechs Erfolgskriterien, Abgrenzungen, harte Randbedingungen und weiche Präferenzen haben je eine Schritt-ID oder eine Descope-ADR. Muss-Anforderungen: 15 erledigt, FR-010 teilweise (Referenzumfang D.4), FR-022 offen (4.8), FR-006 verworfen (ADR-009). Soll/Kann: FR-014 → 5.1, FR-019 → 5.2, FR-020 → 5.3, FR-023 → 5.4, FR-021 erledigt. Anwendungsfälle UC-001 bis UC-014 alle enthalten; Ausschlüsse unverändert. Keine `[VERSCHOBEN]`-Zeile mit Ziel in Phase 3. Keine `TODO`/`FIXME` in `src/`, `ui/src/`, `tests/`.
- **Befund 1 (Drift):** V.4 und V.5 nennen 5.5 als Landeplatz, 5.5 führt unter „Zu tun“ und „Akzeptanzkriterien“ aber nur V.1–V.3 → 5.5 um V.4 und V.5 ergänzen.
- **Befund 2 (Landeplatz fehlt):** Erfolgskriterium „höchstens ein Kanon-Widerspruch pro Kapitel, der beim Redigieren auffällt“ (Vision 4) ist nur im Probeschreiben der KI gemessen (3.3, blind bewertet); die Reifegrad-Übersicht führt NFR Kanon-Treue `[VORLÄUFIG]` mit „wartet auf Schreibbetrieb des Eigentümers“ – ohne Schritt-ID. Vorschlag an den Eigentümer mit der Pflichtfrage.

### 2026-09-27 12:21 – [ONBOARDING-VALIDATION] Phasenabschluss 3 (Trigger 3)

- **Form (Klasse M):** frischer Worktree von `c0325f4` im Scratchpad, eigenes Datenverzeichnis; README-Quick-Start exakt wie dokumentiert: `uv python install 3.14.7`, `uv sync --frozen --python 3.14.7`, `npm ci` (0 Schwachstellen), `uv run pre-commit install`, `uv run skriptorium-einrichtung` (Exit 0; Ausgabe mit dem Einrichtungscode nicht angezeigt), `npx vite build`, uvicorn.
- **Ergebnis:** `/api/health` → `{"status":"ok"}`; `/` → 200; `/api/worlds` und `/api/usage` ohne Sitzung → 401; Server-Log nur mit Metadaten, ohne Warnung. `pytest --cov`: 377 bestanden, 99,78 %; `vitest --coverage`: 96 bestanden, 98,17 % Zeilen, 96,01 % Zweige. Smoke-Test `scripts/session-start.sh` im Worktree: Exit 0.
- **Befund:** keiner im Onboarding-Pfad. Pre-Commit-Hook nach dem Entfernen des Worktrees im Haupt-Checkout neu installiert (Runbook-Pflicht). End-to-End-Tests nicht im Worktree wiederholt (CI-Job End-to-End).

### 2026-09-27 12:20 – [SESSIONSTART] Phasenabschluss 3

- **Modell:** eingestellt und bedient `claude-opus-5-5` (Sitzungsabfrage 12:20) → Entscheidungs-Klasse. Der Phasenabschluss enthält einen `ENTSCHEIDUNG ERFORDERLICH`-Block (Eskalations-Auslöser 1) – Klasse passt, kein Stopp.
- **Kontextgröße:** 0 Token laut Sitzungsabfrage (neue Session; Wert bei Sessionbeginn nicht aktualisiert). Kurzzeitlimit (5 Stunden) `allowed`.
- PR #17 gemergt (`c0325f4`); Branch `claude/phasenabschluss-3-mi6vna` steht auf `main`.
- **Pflichtlektüre:** vollständig nach `CLAUDE.md` Abschnitt 2 (project-context, Logbuch ab letztem Sessionende, Fahrplan Stand und Phase 3, Architektur 1/2/9, Decisions A/C, aktive Blocker: keine).
- **Vorhaben:** Pflichtfrage „Weiterbauen, umbauen oder neu aufsetzen“ mit getrennter Instanz (inkl. erneuter Prüfung `api` auf Heuristik 1.4, ADR-020); Vision-Re-Derivations-Pass gegen `docs/vision.md` und `docs/requirements.md`; Onboarding-Re-Validation (Trigger 3); nach der Entscheidung ADR, Archivierung von Phase 3, Logbuch-Verdichtung.

### 2026-09-26 21:05 – [PHASEN-WECHSEL] Reflexion Phase 2 (UMSETZUNG) → Phase 3 (UMSETZUNG)

- **Gelernt:** Die Grobverträge aus 1.4 trugen – `storage`, `canon`, `manuscript`, `api`, `ui` ohne Umbau umgesetzt; Modulgrenzen an den Imports eingehalten (getrennte Instanz, ADR-020).
- **Gelernt:** Sicherheit nach ASVS mit Kapitelnummer je Maßnahme machte die Prüfungen durch getrennte Instanzen schnell und die Obergrenze (ADR-006) handhabbar; optionale Härtungen wurden dem Eigentümer vorgelegt statt still umgesetzt.
- **Gelernt:** Browser-Proben brauchen echte Wege: `page.evaluate` umgeht die CSP; nur ein eingeschleustes Inline-Skript belegt sie.
- **Kippende Annahmen:** `api` braucht Zugangsdaten in `storage` und Pwned Passwords (ADR-018, reaktiv); Editor-Bündel zu groß ohne Nachladen; Umfang von 2.6 wuchs um Einrichtung, Passwortwechsel und Sitzungsübersicht (ADR-017).
- **Reifegrad:** `storage`, `canon`, `manuscript`, `api`, `ui` und HTTP/JSON durch Umsetzung validiert; `context`, `ai_gateway`, SSE nur durch Spikes – Validierung in Phase 3.
- **ADRs der Phase:** 015–020; reaktiv 1 (018); Quote 1/10.
- **Neue Erkundungsbedarfe:** keine vor 3.1; beobachten: Wachstum von `api` in 3.3 (`api.flows`, ADR-020), Tempo von `storage` bei großen Geschichten (D.4), Sitzungen im Speicher bei langem Streaming.
- **Methodik-Lehren:** Sessions liefen dreimal weit über die Kontextgrenze (bis ca. 500.000 Token) auf ausdrückliche Anweisung; Phasenabschluss deshalb in eigener Session. Hygiene-Lücke: `data/index.sqlite` rutschte trotz `.gitignore` in den Git-Index – beim Stagen Dateilisten prüfen. Worktree-Validierung biegt den Pre-Commit-Hook um (zweimal) – Runbook ergänzt.
- **Details:** [`docs/archiv/logbuch-phase-2.md`](archiv/logbuch-phase-2.md)

### 2026-09-26 22:00 – [PHASEN-WECHSEL] Reflexion Phase 1 (ERKUNDUNG) → Phase 2 (UMSETZUNG)

- **Gelernt:** Kanon-Treue hängt am Vorab-Denken der Modelle, nicht an der Kontextmenge – 8.000 bis 17.600 Token ohne Unterschied; Modelle ohne Reasoning machen 2–3× mehr Fehler.
- **Gelernt:** grok-4.7 führt bei Kanon, Sprache und allen vier Genres; Preis ist die Wartezeit (15–50 s). Gemini hat nachgelassen – Bestätigung der Vision-Sorge um Filter und Modellverfügbarkeit.
- **Gelernt:** Die Figuren-Schreibweise (Autor führt Ilka) bricht unter Genre-Druck am häufigsten – Schwerpunkt für Prompt und Tests in 3.3/3.4.
- **Kippende Annahmen:** „erstes Textstück in 5 s" (ersetzt, ADR-013); „Import aus TypingMind/Notion" (zunächst Markdown, ADR-012); „Qwen als Ausweich" (grok-4.6, ADR-011).
- **Reifegrad:** Architektur vollständig `[BELASTBAR]` außer Observability, Stateful, Sicherheit/Betrieb (Phase 3/4).
- **ADRs der Phase:** 010–014, alle geplant, 0 reaktiv.
- **Neue Erkundungsbedarfe:** keine vor Phase 2; beobachten: Budget oberhalb 17.600 Token (3.2/D.4), Import-Zeit gegen 30 Minuten (4.8), Filterpolitik von xAI (ADR-011).
- **Methodik-Lehren:** Prüf-Aufträge ohne Platzhalter formulieren (zwei Pannen); Kriterien vor der Bewertung fixieren und Eichtexte mitlaufen lassen (hat die Vergleichbarkeit über Runden belegt); Sitzungsabfrage meldete Kontextgröße erst spät.
- **Details:** [`docs/archiv/logbuch-phase-1.md`](archiv/logbuch-phase-1.md)

<!-- ANCHOR:eintragstypen -->
## Eintragstypen (Übersicht)

Verbindliche Typen, andere nur in Ausnahmefällen:

| Typ | Wann | Pflicht? |
|---|---|---|
| `[SESSIONSTART]` | Zu Beginn jeder Session | Ja |
| `[SESSIONENDE]` | Vor Sessionabschluss | Ja |
| `[GELÖST]` (bis Phase 2: `[PROBLEM-GELÖST]`) | Nach Behebung eines Problems, das Reibung war | Empfohlen, alle Mini-Probleme erfassen |
| `[PROBLEM-OFFEN → BLOCKER]` | Wenn ein Problem zum Blocker eskaliert | Ja, mit Verweis auf `blockers.md` |
| `[BLOCKER-AUFGELÖST]` | Wenn ein Blocker gelöst wurde | Ja, mit Verweis auf den ursprünglichen Logbuch- und Blocker-Eintrag |
| `[REIFEGRAD-WECHSEL]` | Bei jeder Reifegrad-Änderung in `architecture.md` | Ja |
| `[ADR-ANGELEGT]` | Bei Anlage eines neuen ADR | Ja |
| `[BEOBACHTUNG]` | Wenn etwas auffällt, das später nützlich sein könnte | Optional, KI proaktiv |

<!-- ANCHOR:hinweise-zur-pflege -->
## Hinweise zur Pflege

- **Neueste Einträge oben.** Lesefluss bei Sessionbeginn ist „von oben nach unten bis zum letzten gelesenen Stand".
- **Zeitstempel ist Pflicht.** Format: `YYYY-MM-DD HH:MM` (24h, lokale Zeitzone). Bei Unsicherheit: das Datum ist Pflicht, die Uhrzeit kann grob sein.
- **Detailtiefe lieber zu hoch als zu niedrig.** Das Logbuch lebt davon, dass auch kleine Reibungen festgehalten werden – sie sind im Moment des Auftretens unscheinbar, aber später Goldwert. Wenn unsicher, ob etwas eingetragen werden soll: eintragen.
- **Verweise sind willkommen.** Wenn ein Logbuch-Eintrag mit einem ADR, einem Blocker oder einem Fahrplan-Schritt zusammenhängt: verweisen, statt zu duplizieren.
- **Keine sensiblen Daten.** Auch im Logbuch keine Secrets, keine echten PII, keine internen URLs aus Produktion. Platzhalter verwenden.

<!-- ANCHOR:archivierung -->
## Archivierung

Wenn das Logbuch unübersichtlich wird (Richtwert: >800 Zeilen, schneller wachsend als andere Dokumente):

- Alte Einträge nach `docs/archiv/logbuch-YYYY-MM.md` auslagern.
- Im aktiven Logbuch bleibt: die letzten 4–8 Wochen, plus alle Einträge, die mit aktuell offenen `blockers.md`-Einträgen verbunden sind.
- Auslagerung ist Sessionende-Aktion, keine freigabepflichtige Entscheidung.
