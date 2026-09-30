# Onboarding-Runbook – Skriptorium

> **Stand 2026-09-30 (Schritt 4.4):** Entwicklung und Quick Start befüllt und gegen einen frischen Worktree geprüft (2.1). Abschnitt „Notfall“ befüllt und vom Eigentümer ohne KI geübt (Anhalten, Starten).

<!-- Vollständige, getestete End-to-End-Anleitung vom Repo-Klon bis zum lauffähigen System.
     Ergänzt die README:
       - README: Statusbild – knapp, status-orientiert, ohne Plattform-Tiefe.
       - Runbook: Bedienungs-Anleitung – ausführlich, plattform-differenziert,
         mit Troubleshooting und ggf. Rollen-Aufteilung.

     Pflicht ab Klasse M. Optional Klasse K. In Klasse G/V nach Rolle aufteilbar.
     Pflege-Trigger: CLAUDE.md Abschnitt 17 und Abschnitt 3.

     Inhalte stammen aus echter Klon-/Worktree-frischer Durchführung,
     nicht aus dem Gedächtnis. Drift zwischen Runbook und tatsächlichem
     Setup-Pfad ist ein Bug. -->

## 1. Zweck und Geltungsbereich

Dieses Runbook führt vom frischen Klon bis zum laufenden Server mit Gesundheitsprüfung und zu grünen Prüfungen (Tests, Linter, Typprüfung). Es ersetzt nicht die README (Statusbild) und nicht `docs/architecture.md`.

**Adressat:** der Coding-Agent in einer Cloud-Session und jede Person, die den Code prüfen oder übernehmen will.

**Voraussetzung an den Leser:** Grundkenntnisse in Bash; Lese-Zugriff auf das Repository.

**Geprüft am:** 2026-09-27, Linux x86_64 (Cloud-Session des Coding-Agents), frischer `git worktree` von Commit `c0325f4` (Phasenabschluss 3); 2026-09-28, macOS arm64, frischer `git clone` von Commit `f75be2d` (Schritt 4.9) – Werkzeug-Caches unter `~/.cache/skriptorium-tools/` und `~/Library/Caches/ms-playwright/` waren schon vorhanden.

## 2. Voraussetzungen pro Plattform

Unterstützt sind Linux und macOS arm64 (`docs/project-context.md` Abschnitt 3, Plattform-Matrix); Windows nicht. Versionen: Python 3.14.7, uv 0.12.19, Node.js 24.21.0 mit npm 11.19.0, git, curl.

### Linux (Cloud-Session des Coding-Agents)

Nichts von Hand: Der SessionStart-Hook (`.claude/settings.json` → `scripts/session-start.sh`) installiert uv 0.12.19 in eine eigene venv unter `~/.cache/skriptorium-tools/`, lädt Node.js 24.21.0 von nodejs.org (SHA-256 geprüft), installiert Python 3.14.7 über uv, führt `uv sync` und `npm install` aus und aktiviert den Pre-Commit-Hook. Er ist aktiv in der Cloud-Session (Linux x86_64 mit `CLAUDE_CODE_REMOTE=true`) und auf macOS arm64 (ADR-026); sonst ohne Wirkung.

### Linux (andere Rechner)

```bash
# uv 0.12.19 (z. B. in eine eigene venv)
python3 -m venv ~/.cache/skriptorium-tools/uv-0.12.19
~/.cache/skriptorium-tools/uv-0.12.19/bin/pip install "uv==0.12.19"
# Node.js 24.21.0: Archiv von https://nodejs.org/dist/v24.21.0/ laden und SHA-256 gegen SHASUMS256.txt prüfen
export PATH="$HOME/.cache/skriptorium-tools/uv-0.12.19/bin:<pfad-zu-node>/bin:$PATH"
```

Oder ohne eigenes Zutun: `CLAUDE_CODE_REMOTE=true CLAUDE_PROJECT_DIR=$PWD scripts/session-start.sh` (setzt PATH nur im Skript; danach PATH wie oben setzen).

### macOS, Windows

Windows: für die Entwicklung nicht unterstützt; zum lokalen Nutzen den Container aus dem `Dockerfile` über Docker Desktop starten (Abschnitt 5, „Windows“). macOS (arm64): Entwicklungsumgebung des Coding-Agents ab 2026-09-27 (ADR-025). Der SessionStart-Hook richtet dieselben Versionen ein wie in der Cloud-Session (ADR-026), ohne Administratorrechte und neben einem vorhandenen System-Node oder Homebrew-uv; läuft mit dem bash 3.2 von macOS. Danach einmalig `npx playwright install chromium` und vor den End-to-End-Tests `npx vite build`. Erprobt 2026-09-27 im Haupt-Checkout und 2026-09-28 im frischen Klon (Schritt 4.9, alle Prüfungen grün); Hinweise in Abschnitt 5.

## 3. Setup (End-to-End)

Geschätzte Gesamtdauer: unter 2 Minuten bei vorhandenen Werkzeugen (SessionStart-Hook im Wiederholungsfall ca. 12 Sekunden).

### Schritt 1: Repository klonen

```bash
git clone https://github.com/Paddel87/Skriptorium.git
cd Skriptorium
```

### Schritt 2: Tooling installieren

```bash
uv python install 3.14.7
uv sync --frozen --python 3.14.7
npm ci
uv run pre-commit install
```

### Schritt 3: Konfiguration

Variablen, siehe `.env.example`: `SKRIPTORIUM_DATA_DIR` (Datenverzeichnis, Standard `./data`) und `OPENROUTER_API_KEY` (Schlüssel für OpenRouter, seit Schritt 3.1; gebraucht erst für KI-Anfragen ab Schritt 3.3 – Server und Tests laufen ohne). Den Schlüssel nur in der Umgebung setzen, beim Anbieter eine Ausgabengrenze einrichten.

Passwort einrichten (ADR-017): Der Befehl erzeugt einen Einrichtungscode, der 24 Stunden und nur einmal gilt; gespeichert wird nur sein Hash in `system/zugang.md`. Mit dem Code wird das Passwort festgelegt (mindestens 15 Zeichen; geprüft gegen Pwned Passwords von Have I Been Pwned, Daten unter CC BY 4.0). Derselbe Weg hilft bei vergessenem Passwort.

```bash
uv run skriptorium-einrichtung        # zeigt den Code einmal an
```

### Schritt 4: Server starten

```bash
npx vite build                                  # Oberfläche nach dist/ui bauen
uv run uvicorn skriptorium.api:create_app --factory --no-access-log
```

Oberfläche unter `http://localhost:8000` (ohne TLS nur über `localhost`, weil das Sitzungs-Cookie `Secure` verlangt). Für die Entwicklung der Oberfläche alternativ `npx vite` (Port 5173, leitet `/api` an Port 8000 weiter; ohne Content-Security-Policy).

Start in unter einer Sekunde; Meldung `Uvicorn running on http://127.0.0.1:8000`. `--no-access-log` schaltet das Zugriffsprotokoll von uvicorn ab, das volle Pfade mit Namen von Welten und Einträgen schreiben würde; das Skriptorium protokolliert selbst nur Methode, Routenmuster, Status und Dauer. Betrieb mit genau einem Prozess (kein `--workers`): Sitzungen und die Sperre nach Fehlversuchen liegen im Speicher. Hinter einem Reverse Proxy muss dieser auf demselben Host laufen, `X-Forwarded-For` setzen und den `Host`-Kopf unverändert weiterreichen; uvicorn wertet Proxy-Kopfzeilen dann standardmäßig nur von `127.0.0.1` aus – `--forwarded-allow-ips` nicht ausweiten (Schritt 4.2).

### Schritt 5: Verifikation

```bash
curl http://127.0.0.1:8000/api/health        # → {"status":"ok"}
curl http://127.0.0.1:8000/api/worlds        # → 401: alles außer Gesundheitsprüfung verlangt Anmeldung
uv run pytest --cov                            # Python-Tests mit Coverage (Mindestwert 80 %)
npx vitest run --coverage                      # Oberflächen-Tests (80 % Zeilen, 70 % Zweige)
uv run pre-commit run --all-files              # alle Hooks: Markdown, ruff, mypy, bandit, eslint, prettier, tsc
npx vite build                                 # Oberfläche nach dist/ui bauen
npx playwright test                            # End-to-End in Chromium (nach dem Build; startet eigenen Server)
```

## 4. Troubleshooting

### Symptom: `warning: The UV_NATIVE_TLS environment variable is deprecated`

- **Ursache:** Die Cloud-Umgebung setzt `UV_NATIVE_TLS`; uv 0.12 kündigt die Variable ab.
- **Lösung:** `unset UV_NATIVE_TLS; export UV_SYSTEM_CERTS=1` – der SessionStart-Hook schreibt das in die Sitzungsumgebung.
- **Auftreten:** 2026-09-26 (Schritte 1.3 und 2.1).

### Symptom: `StarletteDeprecationWarning: Using httpx with starlette.testclient is deprecated`

- **Ursache:** Starlette 1.7 empfiehlt httpx2; httpx2 ist erst ab 2026-11-12 mindestreif.
- **Lösung:** keine nötig – benannte Ausnahme in `pyproject.toml` (`filterwarnings`), Wechsel in Schritt D.5 (ADR-015).
- **Auftreten:** 2026-09-26 (Schritt 2.1).

### Symptom: `[ERROR] Your pre-commit configuration is unstaged.`

- **Ursache:** `.pre-commit-config.yaml` wurde geändert, aber nicht gestaged.
- **Lösung:** `git add .pre-commit-config.yaml` vor dem Commit.
- **Auftreten:** 2026-09-26 (Schritt 2.1).

### Symptom: `` `pre-commit` not found.  Did you forget to activate your virtualenv? ``

- **Ursache:** `pre-commit install` wurde in einem zusätzlichen `git worktree` ausgeführt. Worktrees teilen `.git/hooks`; der Hook zeigt danach auf die venv des Worktrees und bricht, sobald der Worktree entfernt ist.
- **Lösung:** im Haupt-Checkout erneut `uv run pre-commit install` – bei jeder Onboarding-Validierung im Worktree direkt nach dem Entfernen des Worktrees.
- **Auftreten:** 2026-09-26 (Onboarding-Validierung in 2.1 und beim Phasenabschluss 2).

### Symptom: `browserType.launch: Executable doesn't exist` bei `npx playwright test`

- **Ursache:** Playwright 1.62 erwartet Chromium-Revision 1234; die Cloud-Session hat ein älteres Chromium unter `/opt/pw-browsers` vorinstalliert, und Downloads sind dort gesperrt.
- **Lösung:** `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium npx playwright test`. Auf anderen Rechnern und in der CI: `npx playwright install chromium`.

### Symptom: `StorageError: system/zugang.md: [Errno 13] Permission denied: 'data\\system'` unter Windows

- **Ursache:** `_write_atomically` in `src/skriptorium/storage/store.py` öffnet nach dem Schreiben das Verzeichnis mit `os.open(..., O_RDONLY)` für `fsync`; Windows verweigert das. Die Datei selbst ist geschrieben, der Befehl bricht aber ab – `skriptorium-einrichtung` gibt keinen Code aus, und jeder weitere Schreibvorgang scheitert ebenso.
- **Lösung:** Windows ist für den direkten Start nicht unterstützt (`docs/project-context.md` Abschnitt 3); stattdessen Docker Desktop (Abschnitt 5, „Windows“).
- **Auftreten:** 2026-09-30 (Windows 11, Python 3.14.2, uv 0.11.32).

## 5. Plattform-spezifische Hinweise

### Linux

- Der Pre-Commit-Hook ruft die Werkzeuge über `uv run --frozen` bzw. `npx --no-install` auf; ohne vorheriges `uv sync` und `npm ci` schlagen die Hooks fehl.
- Das vorinstallierte uv (0.8.x) der Cloud-Umgebung kennt Python 3.14.7 nicht; deshalb installiert der SessionStart-Hook uv 0.12.19 getrennt.

### macOS (arm64)

- Der SessionStart-Hook setzt PATH nur für die Session des Coding-Agents. Wer außerhalb davon im Terminal arbeitet, nimmt die `bin`-Verzeichnisse von uv und Node unter `~/.cache/skriptorium-tools/` selbst in PATH auf (wie unter Linux in Abschnitt 2).
- Der Hook führt `npm install` aus, der Quick Start `npm ci`; bei unveränderter `package-lock.json` ist das Ergebnis gleich.
- `npm ci` und `npm install` melden, dass die Install-Skripte von `fsevents` (2.3.2, 2.3.3) nicht über `allowScripts` erlaubt sind. Harmlos: `fsevents` ist eine optionale Abhängigkeit der Datei-Überwachung; alle Prüfungen laufen grün (2026-09-28).
- Vor dem ersten End-to-End-Lauf einmalig `npx playwright install chromium`.

### Windows

Nur zum Nutzen, nicht zum Entwickeln: Der direkte Start scheitert beim ersten Schreibvorgang (Abschnitt 4). Mit Docker Desktop (WSL2-Backend) läuft dasselbe Image wie auf dem VPS, Daten im benannten Volume `skriptorium-daten`, erreichbar nur vom eigenen Rechner:

```bash
docker build -t skriptorium:lokal .
docker run -d --name skriptorium -p 127.0.0.1:8000:8000 -v skriptorium-daten:/data skriptorium:lokal
docker exec skriptorium skriptorium-einrichtung    # Einrichtungscode, dann http://localhost:8000
```

- Ohne `-e OPENROUTER_API_KEY` (Wert aus der Shell übernehmen) laufen keine KI-Anfragen.
- Das Sitzungs-Cookie ist `Secure`; Browser nehmen es unter `http://localhost` trotzdem an.
- Stoppen und wieder starten: `docker stop skriptorium`, `docker start skriptorium`.
- Meldet Docker Desktop beim Start `initializing Ingest server … sailor-ingest.sock … Das System kann auf die Datei nicht zugreifen`, betrifft das einen internen Dienst, nicht die Engine; Bauen und Starten gingen trotzdem (2026-09-30).
- Erprobt 2026-09-30 auf Windows 11 mit Docker 29.7.2: Health-Check, Einrichtungscode, Passwort festlegen und Anmelden.

## 6. Rollen-spezifische Varianten

Entfällt (Klasse M, ein Beitragender); Operations folgt mit Phase 4.

## 7. Notfall

Für den Eigentümer **ohne KI**. Alles läuft im Programm „Terminal“ auf dem Mac und im Browser. Wegen des öffentlichen Repos stehen hier Platzhalter; die echten Werte stehen in der lokalen Notiz `~/Developer/skriptorium-betrieb-lokal/notfall-lokal.md` auf dem Mac (keine Secrets): `<vps>` = Name des Servers für `ssh`, `<duplicati-adresse>` = Weboberfläche der Sicherung.

- **Zugang (Ort, nicht Wert):**
  - Server: SSH-Schlüssel auf dem Mac des Eigentümers (`~/.ssh/`), Anmeldung mit `ssh <vps>`; Notweg ohne Mac: Kundenbereich des Hosters (netcup) mit Konsole und Neustart.
  - Sicherung: MEGA-Konto des Eigentümers (Bucket, Schlüssel); Duplicati-Passphrase und S4-Schlüssel: noch nur im Duplicati-Auftrag auf dem VPS („Exportieren → Als Befehlszeile“); Ablage außerhalb des Servers folgt mit D.11 (ADR-038) – bis dahin ist die Sicherung nach Verlust des Servers nicht lesbar.
  - KI-Schlüssel: Konto des Eigentümers bei OpenRouter (openrouter.ai → „Keys“); auf dem Server in `/opt/docker/skriptorium/.env` (nur root lesbar).
  - Anmeldepasswort des Skriptoriums: nur beim Eigentümer; vergessen → neuer Einrichtungscode: `ssh <vps> 'docker exec skriptorium skriptorium-einrichtung'`.
- **System anhalten:** `ssh <vps> 'cd /opt/docker/skriptorium && docker compose stop'` – danach ist das Skriptorium aus und bleibt es auch nach einem Neustart des Servers; die Daten bleiben unberührt. **Wieder starten:** `ssh <vps> 'cd /opt/docker/skriptorium && docker compose start'`; Erfolg nach etwa einer Minute: `ssh <vps> 'docker ps --filter name=skriptorium'` zeigt `(healthy)` – erprobt am 2026-09-30 (KI und Eigentümer ohne KI)
- **KI-Schlüssel widerrufen** (Verdacht auf Missbrauch oder unerwartete Kosten): bei OpenRouter unter „Keys“ den Schlüssel des Skriptoriums löschen – wirkt sofort; das Skriptorium läuft weiter, nur KI-Anfragen schlagen fehl. Neuen Schlüssel dort anlegen (Ausgabengrenze 50 $ setzen) und eintragen, Eingabe bleibt unsichtbar: `ssh -t <vps> 'read -rsp "Neuer Schluessel: " K && printf "# Secrets des Skriptoriums. Nur root lesbar.\nOPENROUTER_API_KEY=%s\n" "$K" > /opt/docker/skriptorium/.env && chmod 600 /opt/docker/skriptorium/.env && cd /opt/docker/skriptorium && docker compose up -d'` – nicht erprobt (Verzicht des Eigentümers, ADR-037)
- **Sicherung ziehen:** Läuft täglich 05:00 von selbst (Duplicati auf dem VPS, Auftrag „Skriptorium“, Ziel MEGA S4, ADR-036). Von Hand: Duplicati-Weboberfläche (Adresse lokal beim Eigentümer) → Auftrag „Skriptorium“ → „Jetzt ausführen“; Erfolg: oberster Eintrag unter „Protokoll anzeigen“ ohne Fehler. Gesichert wird nur `/source/skriptorium/data/` ohne `index.sqlite` – erprobt am 2026-09-30
- **Wiederherstellen** (auch ohne Server, z. B. auf einem Mac mit Docker Desktop) – erprobt am 2026-09-30, Dauer ca. 15 Minuten, davon das meiste Eintippen:
  1. Benötigt (Ablage außerhalb des Servers folgt mit D.11; bis dahin nur im Duplicati-Auftrag auf dem VPS unter „Exportieren → Als Befehlszeile“): S4-Endpunkt, Bucket-Name, Access ID und geheimer Schlüssel des Sicherungs-Benutzers, Duplicati-Passphrase. Ohne die Passphrase ist die Sicherung nicht lesbar.
  2. Duplicati starten (auf dem Mac als Wegwerf-Container, nur lokal erreichbar): `docker run -d --name duplicati-restore -p 127.0.0.1:8210:8200 -e PUID=0 -e PGID=0 -e SETTINGS_ENCRYPTION_KEY=<beliebig> -e DUPLICATI__WEBSERVICE_PASSWORD=<beliebig> -v "$PWD/restore:/restore" lscr.io/linuxserver/duplicati`; im Browser `http://127.0.0.1:8210` öffnen.
  3. „Wiederherstellen“ → „Direkt aus Sicherungsdateien wiederherstellen“ → Speichertyp „S3 Compatible“, SSL an, Server „Custom server url“ mit dem Endpunkt **ohne** Bucket-Namen davor, Bucket-Name, Ordnerpfad `skriptorium`, beide Schlüssel → „Verbindung testen“ → Passphrase → neueste Version, alles anhaken → „An einem anderen Ort“ `/restore/`, Rechte nicht wiederherstellen → „Wiederherstellen“.
  4. Die wiederhergestellten Ordner sind schreibgeschützt: `chmod -R u+w restore`. Auf dem Server den Inhalt nach `/opt/docker/skriptorium/data/` legen und `chown -R 10001:10001 /opt/docker/skriptorium/data`.
  5. Skriptorium starten und den Suchindex neu aufbauen (er ist nicht in der Sicherung): `docker exec skriptorium python -c "from pathlib import Path; from skriptorium.storage.store import DocumentStore; DocumentStore(Path('/data')).rebuild_index()"`.
  6. Erfolg: Anmeldung mit dem bisherigen Passwort klappt (Zugangsdaten liegen in `system/` und sind mitgesichert), Welten und Einträge sind da.
- **Wen benachrichtigen:** niemanden – einziger Nutzer ist der Eigentümer, eine Vertretung gibt es nicht (ADR-008), Daten Dritter werden nicht verarbeitet (Schutzbedarf normal, ADR-007). Bei Verdacht auf Einbruch in den Server zusätzlich: KI-Schlüssel widerrufen (oben), Anmeldepasswort des Skriptoriums und die S4-Schlüssel der Sicherung erneuern.

## 8. Pflegehinweise

- **Validierungs-Pflicht:** Vor jedem Phasen-Abschluss wird dieses Runbook gegen einen frischen Worktree validiert (CLAUDE.md Abschnitt 17, Trigger 3 in Abschnitt 16).
- **Drift-Verbot:** Wenn das Runbook nicht mehr zur Realität passt (Skript umbenannt, ENV-Variable neu, Plattform-Sonderfall geändert), ist das ein Bug und wird im selben Commit gefixt.
- **„Geprüft am"-Datum** (Abschnitt 1) wird bei jeder Validierung aktualisiert.
- **Troubleshooting-Sektion wächst mit:** Bei jeder Mehrfach-Reibung wird ein Eintrag ergänzt. Einträge, die seit 12 Monaten nicht mehr aufgetreten sind, dürfen ins Archiv (`docs/archiv/onboarding-troubleshooting-YYYY.md`).
- **Plattform-spezifische Hinweise** müssen mit der Plattform-Matrix in `docs/project-context.md` Abschnitt 3 konsistent bleiben (siehe Inter-Pflicht-Drift-Prüfung in CLAUDE.md Abschnitt 16).

---

**Initialisierungshinweis (erste Session nach Projektanlage):**

- **Klasse K (Klein):** Runbook optional. Wenn vorhanden, reduzierte Form – Abschnitte 5 (Plattform-spezifisch) und 6 (Rollen-Varianten) entfallen meist. Ohne Runbook steht der Notfall-Abschnitt (7) in `docs/notfall-handbuch.md`.
- **Klasse M (Mittel):** Runbook Pflicht. Volle Form, Abschnitt 6 (Rollen-Varianten) optional.
- **Klasse G (Groß):** Runbook Pflicht. Volle Form, Abschnitt 6 mit mindestens Dev- und Reviewer-Variante.
- **Klasse V (Verteilt-Groß):** Runbook Pflicht, ggf. in mehrere Dateien aufgeteilt:
  - `docs/onboarding-runbook-dev.md`
  - `docs/onboarding-runbook-reviewer.md`
  - `docs/onboarding-runbook-operations.md`
  - `docs/onboarding-runbook.md` als Index mit Verweisen.
- **Erstbefüllung erfolgt NICHT aus dem Gedächtnis**, sondern aus einer echten Klon-/Worktree-frischen Durchführung. Schritte, die nicht praktisch durchgeführt wurden, werden mit `TBD` markiert und im Fahrplan als Stabilisierungs-Schritt geführt.
- **Erster realer Eintrag in „Geprüft am"** erfolgt mit der ersten erfolgreichen End-to-End-Durchführung nach der Erstbefüllung.
