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
