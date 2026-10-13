# Wandernde Figuren – Erkundung (Schritt 8.12)

Erkundung zu V.26 (ADR-081), 2026-10-13, Entscheidungs-Klasse. Nur gelesen, nichts gebaut. Grundlage: Code (`canon`, `manuscript`, `context`), `docs/architecture.md` Abschnitte 2 und 7, `docs/vision.md` Abschnitte 3–5, FR-016, FR-017, FR-024, ADR-078, ADR-088; dazu eine anonyme Zählung auf dem Server (nur Anzahlen, keine Inhalte).

## Wunsch des Eigentümers (V.26, 2026-10-13)

1. Figuren ohne Bezug auf eine bestimmte Welt beschreiben, damit sie in mehreren Welten einsetzbar sind.
2. Je Welt ein eigener Bezug: Herkunft, Beziehungen, Besitz, Erlebtes.
3. Beim Wechsel in eine neue Welt realistisch eingepasst werden (z. B. Vorschlag des Weltenbauers).
4. Erlebnisse in einer anderen Welt schreiben den Kern der Figur fort und wandern in die Ursprungswelt mit.

## Was es heute gibt

- **Gast-Verbindung (3.7, FR-017):** Eine Geschichte in Welt B bindet einen Eintrag aus Welt A ein; die Verbindung gilt nur für diese Geschichte. Die Schreib-Anfrage zeigt den Gast mit „Gast aus der Welt …“ (`context/writing.py`, `context/builder.py::_guests`).
- **Fakten über Gäste (FR-024):** Beim Eintragen aus dem Text wählt der Autor je Fakt „Kanon der Figur“ (Eintrag in Welt A, gilt überall) oder „nur diese Geschichte“ (`facts.md`). Damit ist Wunsch 4 im Kern schon möglich – Erlebnisse in Welt B lassen sich in den Eintrag in Welt A schreiben.
- **Abschnitt „Aussehen“ (7.16, ADR-078)** und **Verweise per `@Name` (8.11, ADR-088):** Bausteine, um einen Eintrag in Teile zu gliedern bzw. Teile zu verknüpfen – aber nur innerhalb einer Welt.
- **Bindung an die Welt:** Jede Ablage und jede Funktion von `canon` hängt an `world_id` (`worlds/<welt>/canon/<kategorie>/<eintrag>.md`); Suche, Index, Verweise, Bilder und Markierungen ebenso.

## Befund auf dem Server (2026-10-13, anonym)

| Zahl | Wert |
|---|---|
| Figuren in allen Welten | 23 |
| Figurennamen, die in mehr als einer Welt vorkommen | 0 |
| Gast-Verbindungen in Geschichten | 0 |
| Geschichten mit geschichtenbezogenen Fakten | 0 (von 9) |

Folge: Weder Figuren-Kopien noch die vorhandene Gast-Verbindung werden bisher genutzt. Der Bedarf ist ein Vorhaben, kein Schmerz im Alltag – wie oft und mit wie vielen Figuren gewandert wird, ist unbekannt.

## Abgrenzung der Vision

Vision Abschnitt 5: „Keine übergeordnete Multiversums-Ebene: keine weltübergreifende Kosmologie oder Zeitlinie; Verbindungen entstehen nur durch konkrete Geschichten.“ Ein weltneutraler Figurenkern ist keine Kosmologie, aber eine Ablage **über** den Welten. Option C unten berührt diese Grenze und bräuchte einen ADR, der sie ausdrücklich verschiebt (Vision-Pivot nach `docs/requirements.md` Abschnitt 3).

## Optionen

### A – Gast-Verbindung ausbauen (kein neues Datenmodell)

- Kern bleibt der Eintrag in der Heimatwelt. Konvention: weltneutrale Teile oben, Weltbezug der Heimatwelt in einem Abschnitt „In ‹Welt›“.
- **Weltbezug je Gastwelt:** In der Geschichte (Welt B) bekommt die Gast-Verbindung einen eigenen Text „In ‹Welt B›“ (Herkunft, Beziehungen, Besitz dort) – gespeichert bei der Gast-Verbindung bzw. als geschichtenbezogener Fakt-Block, nicht im Kern.
- **Einpassen:** Der Weltenbauer bekommt beim Anlegen der Gast-Verbindung den Kern der Figur und die Welt B und schlägt den Weltbezug vor (Übernahme wie 8.8).
- **Erlebnisse:** wie heute über FR-024 („Kanon der Figur“).
- Erfüllt: 2, 3, 4 vollständig, 1 als Konvention. Kosten: mittel (Erweiterung `manuscript` um den Weltbezug je Gast, Anfrage zeigt Kern + Weltbezug; eine Weltenbauer-Variante). Umkehrbarkeit: billig. Vision: innerhalb der Grenze (Verbindung entsteht durch die Geschichte).
- Schwäche: Der Weltbezug gilt je Geschichte, nicht je Welt – schreibt der Autor mehrere Geschichten in Welt B mit derselben Figur, muss er ihn je Geschichte anlegen (oder kopieren).

### B – Kopie mit Herkunft (Figur zieht um)

- „In eine andere Welt übernehmen“ legt in Welt B einen eigenen Eintrag an, mit Kopffeld `herkunft: <welt>/<eintrag>`; der Weltenbauer passt ihn beim Kopieren an Welt B an.
- Erlebnisse: beim Eintragen eines Fakts die Wahl „auch in der Herkunft eintragen“ (wie FR-024).
- Erfüllt: 2, 3 vollständig, 4 auf Wunsch je Fakt, 1 nur durch Disziplin. Kosten: mittel. Umkehrbarkeit: billig (ein Kopffeld). Vision: innerhalb.
- Schwäche: Zwei Einträge laufen auseinander, sobald einer geändert wird; der Kern ist doppelt.

### C – Figurenbibliothek über den Welten (Kern + Weltteil)

- Neue Ablage `figuren/<eintrag>.md` (Kern: Aussehen, Wesen, Geschichte) außerhalb der Welten; je Welt ein Eintrag mit `kern: <eintrag>` und nur dem Weltteil. Die Anfrage setzt Kern + Weltteil zusammen; Erlebnisse aus jeder Welt können in den Kern.
- Erfüllt: 1–4 vollständig. Kosten: hoch – neues Datenmodell (Kategorie 4), neuer Bereich in `storage`/`canon`, Suche und Index über Welten, Import/Export (SillyTavern, Markdown), Bilder, Verweise (8.11) und Weltenbauer müssen beide Ebenen kennen. Umkehrbarkeit: teuer (Umzug aller betroffenen Einträge). Vision: berührt Abschnitt 5 (Ebene über den Welten) – Vision-Pivot per ADR nötig.

## Bewertung

| | A Gast ausbauen | B Kopie mit Herkunft | C Bibliothek |
|---|---|---|---|
| Wunsch 1 (weltneutral) | Konvention | Disziplin | ja |
| Wunsch 2 (Bezug je Welt) | je Geschichte | ja | ja |
| Wunsch 3 (einpassen) | ja (Weltenbauer) | ja (Weltenbauer) | ja |
| Wunsch 4 (Erlebnisse wandern) | ja (FR-024) | je Fakt | ja |
| Kosten | mittel | mittel | hoch |
| Umkehrbarkeit | billig | billig | teuer |
| Vision Abschnitt 5 | innerhalb | innerhalb | Pivot nötig |

Konfidenz für C: **niedrig** (Nutzung unbekannt, 0 Gast-Verbindungen) bei **teurer** Umkehrbarkeit – nach `CLAUDE.md` Abschnitt 8, Kriterium 8, kein Rateschluss.

## Empfehlung

1. **Zuerst ausprobieren, was es gibt:** eine Figur per Gast-Verbindung (3.7) in einer Geschichte einer anderen Welt einsetzen und Erlebnisse per „Kanon der Figur“ (FR-024) zurückschreiben. Das kostet keinen Bau und zeigt, was wirklich fehlt.
2. **Danach A** als Umsetzungsschritt (Weltbezug je Gast und Einpassen durch den Weltenbauer) – billig, umkehrbar, innerhalb der Vision.
3. **C nur**, wenn sich zeigt, dass viele Figuren dauerhaft in mehreren Welten leben; dann mit eigenem ADR zur Vision-Grenze.
4. B nicht weiter verfolgen: Doppelte Kerne sind genau die Drift, die der Kanon vermeiden soll.

Landeplatz: Umsetzung als neuer V-Schritt mit Landeplatz 8.13 (Planung der nächsten Ausbaustufe), nach der Probe aus Empfehlung 1.

## Entscheidung des Eigentümers (2026-10-13)

„Erst ausprobieren, dann A“: Der Eigentümer setzt eine Figur per Gast-Verbindung (3.7) in einer Geschichte einer anderen Welt ein und schreibt Erlebnisse per „Kanon der Figur“ (FR-024) zurück; danach wird Option A als V.34 in 8.13 eingeplant. B verworfen, C nicht weiter verfolgt.
