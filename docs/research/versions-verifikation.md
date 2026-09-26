# Versions-Verifikation – Skriptorium

**Zweck:** Belegte Grundlage für die Versionswahl des Stacks nach CLAUDE.md Abschnitt 15 („Versionswahl"). Die KI belegt, der Mensch bestätigt die Tabelle. Trainingswissen diente nur als Ausgangsvermutung; jede Angabe unten stammt aus einer der genannten Quellen oder ist als „ungeprüft" markiert.

**Stand:** 2026-09-26 (alle Quellen an diesem Tag abgerufen).

<!-- ANCHOR:vorgaben -->
## Vorgaben

Regel „ausgereifte Linie": Gewählt wird die neueste Linie, die alle drei Bedingungen erfüllt, sonst die Linie davor.

1. **Mindestreife:** Erstrelease der Linie mindestens 6 Monate alt (also am oder vor 2026-03-26) **und** Patch-Releases erhalten.
2. **Tragende Abhängigkeiten** unterstützen die Linie nachweislich.
3. **Unterstützungsfenster** reicht über die Projektdauer von 3 Jahren hinaus, also mindestens bis 2029-09. Bei Bibliotheken ohne formales Lebensende: aktive Pflege belegt, „kein formales EOL" vermerkt.

Auslegung „Linie" (zur Bestätigung, siehe Offene Punkte):

- Sprachen und Laufzeiten: Minor-Linie (Python 3.x) bzw. Major-Linie (Node.js).
- Bibliotheken mit SemVer ab 1.0 (Pydantic, TypeScript, React, Vite, Plugin, CodeMirror): Major-Linie; vorgeschlagen wird die neueste Version dieser Linie.
- Bibliotheken und Werkzeuge in `0.x` ohne Rückportierung auf ältere Minors (FastAPI, uvicorn, httpx, uv): Die Reife wird an der Serie als Ganzes gemessen; vorgeschlagen wird die aktuelle Version, gepinnt auf ihren Minor. Eine Anwendung der 6-Monats-Regel auf einzelne Minors würde eine Version wählen, die keine Korrekturen mehr erhält, und damit Bedingung 3 verletzen.

<!-- ANCHOR:ergebnis-tabelle -->
## Ergebnis-Tabelle

| Komponente | Vorschlag (Linie + aktuelle Patch-Version) | Neueste Linie | Erstrelease der vorgeschlagenen Linie | Lebensende / Support bis | Tragende Abh. unterstützen? (mit Beleg) | Lizenz | Quellen (URLs) |
|---|---|---|---|---|---|---|---|
| Python | 3.14 – 3.14.7 (2026-08-05) | 3.15 (erst Vorabversion 3.15.0rc2; Final geplant 2026-10-01) | 2025-10-07 (3.14.0) | 2030-10 (Status „bugfix") | Ja: FastAPI 0.141.1, Pydantic 2.13.5, pydantic-core 2.49.0, uvicorn 0.54.0 deklarieren 3.14 in den PyPI-Classifiers. **Einschränkung:** httpx 0.28.1 und httpcore 1.0.9 deklarieren nur bis 3.12 (siehe Offene Punkte) | PSF-2.0 (Python Software Foundation License Version 2) | <https://www.python.org/downloads/>, <https://peps.python.org/api/release-cycle.json>, <https://peps.python.org/pep-0745/>, <https://docs.python.org/3.14/license.html> |
| FastAPI | Serie 0.x – 0.141.1 (2026-07-29), Pin `>=0.141.1,<0.142` | 0.141 | Serie seit 2018-12-08; Minor 0.141 seit 2026-07-29 | kein formales EOL; Pflege aktiv (Commits bis 2026-09-25) | Ja: `requires_python >=3.10`, Classifier 3.14; benötigt `pydantic>=2.9.0`, `starlette>=0.46.0` | MIT | <https://pypi.org/project/fastapi/>, <https://fastapi.tiangolo.com/deployment/versions/>, <https://github.com/fastapi/fastapi/commits/master> |
| Pydantic | v2 – 2.13.5 (2026-08-28) | v2 (2.13) | 2023-06-30 (2.0) | kein formales EOL; v2 erhält laufend Fehler- und Sicherheitskorrekturen; keine absichtlichen Breaking Changes in v2-Minors | Ja: Classifier 3.9–3.14; erfüllt FastAPI-Anforderung `>=2.9.0` | MIT | <https://pypi.org/project/pydantic/>, <https://pydantic.dev/docs/validation/latest/get-started/version-policy/> |
| uvicorn | Serie 0.x – 0.54.0 (2026-09-25), Pin `>=0.54.0,<0.55` | 0.54 | Serie seit 2017-06-05; Minor 0.54 seit 2026-09-25 | kein formales EOL; Pflege aktiv (5 Minors seit 2026-06) | Ja: `requires_python >=3.10`, Classifier 3.14 | BSD-3-Clause | <https://pypi.org/project/uvicorn/>, <https://uvicorn.dev/release-notes> |
| httpx | Serie 0.x – 0.28.1 (2024-12-06), Pin `>=0.28.1,<0.29` | 0.28 | Serie seit 2019-07-19; Minor 0.28 seit 2024-11-28 | kein formales EOL; **Pflege schwach**: letzte Version 2024-12-06, letzter Commit 2026-02-23 | Teilweise: `requires_python >=3.8`, aber Classifier nur bis 3.12; 3.14 nicht deklariert (ungeprüft, ob lauffähig) | BSD-3-Clause | <https://pypi.org/project/httpx/>, <https://github.com/encode/httpx/commits/master>, <https://github.com/encode/httpx/blob/master/CHANGELOG.md> |
| uv | Serie 0.x – 0.12.19 (2026-09-25), Pin auf Minor 0.12 | 0.12 | Serie seit 2024-02-15; Minor 0.12 seit 2026-07-28 | kein formales EOL (Versioning-Policy nennt keins); Pflege sehr aktiv (20 Patches in 0.12) | Ja: Classifier bis 3.15; Werkzeug, keine Laufzeit-Abhängigkeit | MIT OR Apache-2.0 | <https://pypi.org/project/uv/>, <https://docs.astral.sh/uv/reference/policies/versioning/>, <https://github.com/astral-sh/uv/releases> |
| Node.js | 24 LTS „Krypton" – 24.21.0 (2026-09-07) | 26 (Current, LTS ab 2026-10-28) | 2025-05-06 (24.0.0) | 2028-04-30 (Maintenance-LTS ab 2026-10-20) – **erfüllt Bedingung 3 nicht** | Ja: Vite 8.3.1 und @vitejs/plugin-react 6.1.1 verlangen `node ^20.19.0 \|\| >=22.12.0` | MIT (zzgl. Lizenzen gebündelter Drittkomponenten laut LICENSE) | <https://nodejs.org/dist/index.json>, <https://github.com/nodejs/Release/blob/main/schedule.json>, <https://github.com/nodejs/node/blob/main/LICENSE> |
| npm | 11 – 11.19.0 (gebündelt mit Node 24.21.0) | 12 (12.1.0, seit 2026-07-08) | 2024-12-16 (11.0.0) | an Node 24 gebunden (bis 2028-04-30); kein eigenes formales EOL | Ja: mit Node 24.21.0 ausgeliefert (`npm`-Feld in `index.json`) | Artistic-2.0 | <https://nodejs.org/dist/index.json>, <https://www.npmjs.com/package/npm> |
| TypeScript | 6 – 6.0.3 (2026-04-16) | 7 (7.0.2, seit 2026-07-08) | 2026-03-23 (6.0.2, erste stabile) | kein formales EOL; letzte 6.x-Version 2026-04-16 – Pflege der Linie nicht belegt | Ja: `engines node >=14.17`; Vite transpiliert TypeScript selbst, `tsc` dient nur der Typprüfung | Apache-2.0 | <https://www.npmjs.com/package/typescript>, <https://devblogs.microsoft.com/typescript/> |
| React / react-dom | 19 – 19.3.0 (2026-09-09) | 19 | 2024-12-05 (19.0.0) | kein formales EOL; Korrekturen werden auf 19.0/19.1/19.2 zurückportiert (z. B. 19.2.8, 19.1.9, 19.0.8 am 2026-07-21) | Ja: react-dom 19.3.0 verlangt `react ^19.3.0`; @vitejs/plugin-react 6.1.1 hat keine React-Peer-Einschränkung; CodeMirror-Pakete haben keine React-Peer-Abhängigkeit | MIT | <https://www.npmjs.com/package/react>, <https://www.npmjs.com/package/react-dom>, <https://react.dev/versions> |
| Vite | 8 – 8.3.1 (2026-09-24) | 8 | 2026-03-12 (8.0.0) | kein formales EOL; offizielle Policy: reguläre Patches für `vite@8.3`, Sicherheits-Rückportierung auf Vormajors | Ja: `engines node ^20.19.0 \|\| >=22.12.0` → Node 24 unterstützt | MIT | <https://www.npmjs.com/package/vite>, <https://vite.dev/releases> |
| @vitejs/plugin-react | 6 – 6.1.1 (2026-08-28) | 6 | 2026-03-12 (6.0.0) | kein formales EOL; folgt Vite-Major | Ja: Peer `vite ^8.0.0`; `engines node ^20.19.0 \|\| >=22.12.0` | MIT | <https://www.npmjs.com/package/@vitejs/plugin-react> |
| CodeMirror 6 | 6 – @codemirror/state 6.7.6, @codemirror/view 6.43.13, @codemirror/autocomplete 6.20.3, @codemirror/lang-markdown 6.5.2 | 6 | 2022-06-08 (6.0.0) | kein formales EOL; Pflege aktiv (state/view 2026-09-22) | Ja: keine `engines`- und keine Peer-Einschränkungen; framework-unabhängig, Einbindung in React über eigene Hülle | MIT (alle vier Pakete) | <https://www.npmjs.com/package/@codemirror/state>, <https://www.npmjs.com/package/@codemirror/view>, <https://www.npmjs.com/package/@codemirror/autocomplete>, <https://www.npmjs.com/package/@codemirror/lang-markdown> |

<!-- ANCHOR:begruendungen-fuer-abweichungen-von-der-neuesten-linie -->
## Begründungen für Abweichungen von der neuesten Linie

- **Python 3.14 statt 3.15:** 3.15 ist noch nicht final erschienen (3.15.0rc2 vom 2026-09-01, Final geplant 2026-10-01) und verletzt damit Bedingung 1; 3.14 erfüllt alle drei Bedingungen (Lebensende 2030-10).
- **Node.js 24 statt 26:** Node 26 erschien am 2026-05-05 (unter 6 Monaten) und ist erst ab 2026-10-28 LTS; Bedingung 1 ist verletzt. Node 24 erfüllt Bedingung 3 **nicht** (Ende 2028-04-30) – das trifft aber auf jede heute verfügbare Linie zu, auch Node 26 endet 2029-04-30. Wahl daher als Linie davor mit geplantem Wechsel (siehe Offene Punkte).
- **npm 11 statt 12:** npm folgt der gewählten Node-Linie; Node 24.21.0 bündelt npm 11.19.0. npm 12 erschien 2026-07-08 (unter 6 Monaten).
- **TypeScript 6 statt 7:** TypeScript 7.0 erschien am 2026-07-08 (unter 6 Monaten) und hat noch kein Patch-Release (nur 7.0.2 als erste stabile). TypeScript 6.0 erschien am 2026-03-23 (am Stichtag gerade innerhalb) und hat mit 6.0.3 ein Patch-Release.

<!-- ANCHOR:offene-punkte-ungeprueft -->
## Offene Punkte / ungeprüft

1. **Auslegung „Linie" bei `0.x`-Paketen (FastAPI, uvicorn, httpx, uv):** zur Bestätigung durch den Menschen. Streng auf Minor-Ebene angewendet, wären z. B. FastAPI 0.135.x oder uvicorn 0.52.4 gewählt worden – Minors, die keine Korrekturen mehr erhalten. uvicorn 0.54.0 ist einen Tag alt und hat noch kein Patch-Release; Alternative bei strenger Auslegung: 0.52.4 (2026-08-19).
2. **httpx – Pflege und Python 3.14:** Letzte Version 0.28.1 vom 2024-12-06, letzter Commit 2026-02-23; weder httpx noch httpcore 1.0.9 deklarieren Python 3.13/3.14 in den Classifiers. Lauffähigkeit unter 3.14 ist **ungeprüft** (nur per Test nachweisbar). Bedingung 3 ist nicht belegt. Eine Alternative wäre eine neue externe Abhängigkeit und damit Entscheidung nach CLAUDE.md Abschnitt 4 Kategorie 3.
3. **Node.js – Unterstützungsfenster:** Keine Linie reicht bis 2029-09. Node dient nur Build und Entwicklung der Oberfläche; vorgeschlagen ist ein Wechsel auf Node 26 LTS, sobald sie die Mindestreife erreicht (frühestens 2026-11-05, dann LTS seit 2026-10-28), spätestens vor 2028-04-30. Eintrag im Ablaufdaten-Register nötig.
4. **TypeScript 6 – Pflege der Linie:** Seit 6.0.3 (2026-04-16) keine weitere 6.x-Version; Microsoft nennt 6.0 die letzte Version auf der bisherigen JavaScript-Codebasis. Eine formale Support-Aussage für 6.x wurde nicht gefunden (ungeprüft). Nachprüfung, sobald TypeScript 7 die Mindestreife erreicht (frühestens 2027-01-08 plus Patch-Release).
5. **React 19.3.0 und Vite 8.3.1** sind neue Minors (2026-09-09 bzw. 2026-09-24). Innerhalb der Major-Linie sind sie die aktuelle Version; konservative Alternativen mit längerer Laufzeit wären React 19.2.8 bzw. Vite 8.2.2 (Sicherheits- und wichtige Korrekturen laut Vite-Policy).
6. **Pydantic 2.13** als Minor ist erst seit 2026-04-13 verfügbar; da Pydantic keine absichtlichen Breaking Changes in v2-Minors zusagt, gilt die v2-Linie (seit 2023-06-30) als Maßstab.
7. **Nicht geprüft:** Kompatibilität von Werkzeugen außerhalb dieser Liste (z. B. Linter, Typprüfer-Plugins, Test-Runner) mit TypeScript 6 und Python 3.14; Lizenzen transitiver Abhängigkeiten (starlette BSD-3-Clause und pydantic-core wurden nur stichprobenhaft gesehen).
8. **Ablaufdaten-Register:** Nach Bestätigung sind Python 3.14 (2030-10), Node 24 (2028-04-30) und die Nachprüfungen zu httpx, TypeScript 7 und Node 26 in `docs/project-context.md` Abschnitt 8 einzutragen.

<!-- ANCHOR:entwicklungswerkzeuge-schritt-2-1 -->
## Entwicklungswerkzeuge (Schritt 2.1)

**Stand:** 2026-09-26, Quellen am selben Tag abgerufen: PyPI-JSON-API (`https://pypi.org/pypi/<paket>/json`), npm-Registry (`https://registry.npmjs.org/<paket>`), Git-Tags der Action-Repositories (`git ls-remote`, Datum aus dem Tag-Commit; die GitHub-API ist aus der Arbeitsumgebung gesperrt). Stichtag Mindestreife: Linie erschienen am oder vor 2026-03-26.

**Probeaufbau:** Alle Werkzeuge der Spalte „Vorschlag" wurden im Scratchpad gemeinsam auf Python 3.14.7 (uv 0.12.19) und Node 24.21.0 (npm 11.19.0) installiert; Lint, Format-Check, Typprüfung, bandit, pip-audit, pytest mit Coverage, ESLint, Prettier, tsc, Vitest mit Coverage, `npm audit` und `vite build` liefen durch. Einziger Befund: die Starlette-Abkündigung unten.

### Python (Entwicklungsgruppe in `pyproject.toml`)

| Werkzeug | Vorschlag | Neueste | Linie seit | Begründung | Python 3.14 deklariert | Lizenz |
|---|---|---|---|---|---|---|
| ruff | 0.16.9, Pin `<0.17` | 0.16.9 | Serie 0.x | neueste Minor mit Patch (0.16.1–0.16.9) | ja | MIT |
| mypy | 1.20.2, Pin `<1.21` | 2.3.1 | Linie 2: 2026-05-06 | **Linie 2 unter 6 Monaten** → Linie 1, neueste Minor 1.20 mit Patch | ja | MIT |
| bandit | 1.9.4, Pin `<2` | 1.9.4 | Linie 1: 2018 | neueste Minor mit Patch | ja | Apache-2.0 |
| pip-audit | 2.10.1, Pin `<3` | 2.10.1 | Linie 2: 2022 | neueste Minor mit Patch | ja | Apache-2.0 |
| pytest | 9.1.1, Pin `<10` | 9.1.1 | Linie 9: 2025-11-08 | neueste Minor mit Patch | ja | MIT |
| pytest-cov | 7.1.0, Pin `<8` | 7.1.0 | Linie 7: 2025-09-09 | **Linie 7 hat keine Patch-Version** (nur 7.0.0, 7.1.0) – siehe Offener Punkt 9 | ja | MIT |
| pre-commit | 4.6.2, Pin `<5` | 4.6.2 | Linie 4: 2024 | neueste Minor mit Patch | (keine Classifier; `requires_python >=3.10`) | MIT |
| httpx (nur Tests, Laufzeit folgt mit `ai_gateway`) | 0.28.1, Pin `<0.29` | 0.28.1 | bereits fixiert (Abschnitt 3) | – | nein (validiert in 1.3) | BSD-3-Clause |

Transitive Lizenzen (64 Pakete im Lock): MIT, BSD-2/3-Clause, Apache-2.0, MPL-2.0 (certifi, pathspec), PSF-2.0 – alle erlaubt.

### TypeScript (`package.json`, exakt gepinnt)

| Werkzeug | Vorschlag | Neueste | Linie seit | Begründung | Kompatibilität | Lizenz |
|---|---|---|---|---|---|---|
| eslint | 10.9.1 | 10.11.0 | Linie 10: 2026-02-06 | neueste Minor mit Patch | `engines node >=24` | MIT |
| @eslint/js | 10.0.1 | 10.0.1 | Linie 10: 2026-02-06 | einzige Minor, hat Patch | Peer `eslint ^10` | MIT |
| typescript-eslint | 8.70.1 | 8.70.1 | Linie 8: 2024-07-31 | neueste Minor mit Patch | Peer `typescript <6.1.0`, `eslint ^10` | MIT |
| eslint-plugin-react-hooks | 7.1.1 | 7.1.1 | Linie 7: 2025-10-08 | neueste Minor mit Patch | Peer `eslint ^10` | MIT |
| prettier | 3.9.9 | 3.9.9 | Linie 3: 2023-07-05 | neueste Minor mit Patch | – | MIT |
| vitest | 4.1.11 | 5.0.2 | Linie 5: 2026-09-03 | **Linie 5 unter 6 Monaten** → Linie 4, neueste Minor mit Patch | Peer `vite ^8`, Node 24 | MIT |
| @vitest/coverage-v8 | 4.1.11 | 5.0.2 | wie vitest | folgt vitest | Peer `vitest 4.1.11` | MIT |
| @types/react | 19.2.18 | 19.3.0 | Linie 19 | passend zu React 19.2.8; 19.3 ohne Patch | – | MIT |
| @types/react-dom | 19.2.7 | 19.3.0 | Linie 19 | wie oben | – | MIT |

Nicht in 2.1: CodeMirror (fixiert, kommt mit 2.7), Testbibliotheken für Komponenten-Tests im DOM (z. B. jsdom, Testing Library – eigene Freigabe in 2.7), `globals` (nicht nötig: TypeScript-Dateien prüft typescript-eslint ohne `no-undef`).

Transitive Lizenzen (213 Pakete): MIT, Apache-2.0, ISC, MPL-2.0 (lightningcss), BSD-2/3-Clause – erlaubt; **außerhalb der Liste:** `CC-BY-4.0` (caniuse-lite, Browser-Daten für den Build) und `BlueOak-1.0.0` (minimatch, freizügig) – beide nur Build/Entwicklung, siehe Offener Punkt 10.

### CI und Pre-Commit

| Baustein | Vorschlag | Neueste | Linie seit | Begründung |
|---|---|---|---|---|
| actions/checkout | v6.0.3 | v7.0.1 | v7: 2026-06-17; v6: 2025-11-20 | **v7 unter 6 Monaten** → v6, neueste Minor mit Patch (6.0) |
| actions/setup-python | v6.3.0 | v7.0.0 | v7: 2026-07-19; v6: 2025-09-03 | v7 zu jung → v6; **v6 ohne Patch-Version** (Offener Punkt 9) |
| actions/setup-node | v6.5.0 | v7.0.0 | v7: 2026-07-13; v6: 2025-10-13 | wie setup-python |
| pre-commit/pre-commit-hooks | v6.0.0 | v6.0.0 | v6: 2025-08-09 | einzige Version der Linie (Offener Punkt 9) |
| markdownlint-cli2 | v0.23.3 | v0.23.3 | Serie 0.x | neueste Minor mit Patch (bisher v0.23.2) |
| pre-commit/action | entfällt | v3.0.1 | – | CI ruft `uv run pre-commit run --all-files` direkt auf – eine Action weniger |

Die bisher in `ci.yml` eingetragenen v7-Actions erfüllen die Mindestreife nicht; der Vorschlag geht auf v6 zurück.

### Befund: Starlette kündigt httpx im TestClient ab

Starlette 1.7.0 (transitiv über FastAPI 0.141.1) meldet beim Import von `fastapi.testclient`: „Using `httpx` with `starlette.testclient` is deprecated; install `httpx2` instead." (`StarletteDeprecationWarning`). Mit `filterwarnings = error` bricht jeder Test ab. `httpx2` ist die von Pydantic übernommene Fortführung von httpx (<https://github.com/pydantic/httpx2>, BSD-3-Clause); Linie 2 erschien am 2026-05-12 und erreicht die Mindestreife erst am 2026-11-12. Vorschlag: benannte Ausnahme im Warnungs-Bestand bis zum Wechsel; Wechsel von Tests und `ai_gateway` auf httpx2 als datierter Schritt (Offener Punkt 11).

### Offene Punkte (Fortsetzung)

9. **Linien ohne Patch-Versionen** (pytest-cov 7, setup-python v6, setup-node v6, pre-commit-hooks v6): Diese Hersteller liefern Korrekturen als Minor- statt als Patch-Versionen. Streng nach Mindestreife und Regel-001 fielen sie auf ältere Linien zurück (pytest-cov 6.2.1 ohne deklariertes Python 3.13/3.14; setup-python v5.1.1 und setup-node v4 aus 2024). Zur Entscheidung.
10. **Lizenzen CC-BY-4.0 und BlueOak-1.0.0** transitiv im Build-Werkzeug; nicht Teil der ausgelieferten Oberfläche außer als Build-Hilfsdaten. Zur Entscheidung (Erweiterung der Lizenzliste nur für Werkzeuge, analog Artistic-2.0).
11. **httpx → httpx2:** Wechsel frühestens 2026-11-12 (Mindestreife); betrifft Tests und das Modul `ai_gateway` (Schritt 1.3 validierte httpx 0.28.1).
