# Onboarding-Runbook – Skriptorium

> **Stand 2026-09-26 (Schritt 2.1):** Entwicklung und Quick Start befüllt und gegen einen frischen Worktree geprüft. Abschnitt „Notfall" folgt mit Schritt 4.4.

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

**Geprüft am:** 2026-09-26, Linux x86_64 (Cloud-Session des Coding-Agents), frischer `git worktree` von Commit `f94bbb5`.

## 2. Voraussetzungen pro Plattform

Unterstützt ist nur Linux (`docs/project-context.md` Abschnitt 3, Plattform-Matrix). Versionen: Python 3.14.7, uv 0.12.19, Node.js 24.21.0 mit npm 11.19.0, git, curl.

### Linux (Cloud-Session des Coding-Agents)

Nichts von Hand: Der SessionStart-Hook (`.claude/settings.json` → `scripts/session-start.sh`) installiert uv 0.12.19 in eine eigene venv unter `~/.cache/skriptorium-tools/`, lädt Node.js 24.21.0 von nodejs.org (SHA-256 geprüft), installiert Python 3.14.7 über uv, führt `uv sync` und `npm install` aus und aktiviert den Pre-Commit-Hook. Er ist nur aktiv, wenn `CLAUDE_CODE_REMOTE=true` gesetzt ist.

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

Nicht unterstützt – der Eigentümer entwickelt nicht lokal (`docs/project-context.md` Abschnitt 3).

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

Einzige Variable bis Phase 3: `SKRIPTORIUM_DATA_DIR` (Datenverzeichnis, Standard `./data`), siehe `.env.example`. Der OpenRouter-Schlüssel kommt in Phase 3 dazu.

Passwort einrichten (ADR-017): Der Befehl erzeugt einen Einrichtungscode, der 24 Stunden und nur einmal gilt; gespeichert wird nur sein Hash in `system/zugang.md`. Mit dem Code wird das Passwort festgelegt (mindestens 15 Zeichen; geprüft gegen Pwned Passwords von Have I Been Pwned, Daten unter CC BY 4.0). Derselbe Weg hilft bei vergessenem Passwort.

```bash
uv run skriptorium-einrichtung        # zeigt den Code einmal an
```

### Schritt 4: Server starten

```bash
uv run uvicorn skriptorium.api:create_app --factory --no-access-log
```

Start in unter einer Sekunde; Meldung `Uvicorn running on http://127.0.0.1:8000`. `--no-access-log` schaltet das Zugriffsprotokoll von uvicorn ab, das volle Pfade mit Namen von Welten und Einträgen schreiben würde; das Skriptorium protokolliert selbst nur Methode, Routenmuster, Status und Dauer. Hinter einem Reverse Proxy zusätzlich `--proxy-headers`, damit die Sperre nach Fehlversuchen die echte Absender-Adresse sieht (Schritt 4.2).

### Schritt 5: Verifikation

```bash
curl http://127.0.0.1:8000/api/health        # → {"status":"ok"}
curl http://127.0.0.1:8000/api/worlds        # → 401: alles außer Gesundheitsprüfung verlangt Anmeldung
uv run pytest --cov                            # Python-Tests mit Coverage (Mindestwert 80 %)
npx vitest run --coverage                      # Oberflächen-Tests (80 % Zeilen, 70 % Zweige)
uv run pre-commit run --all-files              # alle Hooks: Markdown, ruff, mypy, bandit, eslint, prettier, tsc
npx vite build                                 # Oberfläche nach dist/ui bauen
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
- **Lösung:** im Haupt-Checkout erneut `uv run pre-commit install`.
- **Auftreten:** 2026-09-26 (Onboarding-Validierung in 2.1).

## 5. Plattform-spezifische Hinweise

### Linux

- Der Pre-Commit-Hook ruft die Werkzeuge über `uv run --frozen` bzw. `npx --no-install` auf; ohne vorheriges `uv sync` und `npm ci` schlagen die Hooks fehl.
- Das vorinstallierte uv (0.8.x) der Cloud-Umgebung kennt Python 3.14.7 nicht; deshalb installiert der SessionStart-Hook uv 0.12.19 getrennt.

## 6. Rollen-spezifische Varianten

Entfällt (Klasse M, ein Beitragender); Operations folgt mit Phase 4.

## 7. Notfall

[Pflicht ab dem ersten öffentlichen Deployment (CLAUDE.md Abschnitt 12, Prüfpunkt 7). Geschrieben für einen Menschen **ohne KI** und ohne Vorwissen über das Projekt. Jeder Ablauf ist mindestens einmal praktisch durchgespielt; Datum am Ablauf.]

- **Zugang:** [wo liegen die Zugangsdaten für Server, Domain, Backups – Ort, nicht Wert]
- **System anhalten:** [konkrete Befehle oder Klickpfad] – erprobt am [YYYY-MM-DD]
- **Sicherung ziehen:** [konkrete Befehle] – erprobt am [YYYY-MM-DD]
- **Wiederherstellen:** [konkrete Befehle, erwartete Dauer, woran man den Erfolg erkennt] – erprobt am [YYYY-MM-DD]
- **Wen benachrichtigen:** [Nutzer, Vertretung, ggf. Datenschutz-Meldepflicht mit Frist]

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
