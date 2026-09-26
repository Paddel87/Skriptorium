# Blockers – Skriptorium

<!-- Ungelöste Probleme und gescheiterte Ansätze.
     Wird befüllt, wenn ein Arbeitsschritt nach drei Versuchen nicht gelöst werden konnte
     (CLAUDE.md Abschnitt 10). Gelöste Einträge wandern in den Archiv-Abschnitt. -->

<!-- ANCHOR:blocker-erkennung -->
## Blocker-Erkennung (vor dem Dreifach-Versuch)

Ein Problem ist **sofort** als Blocker zu behandeln, ohne drei Versuche abzuwarten, wenn eines dieser Muster zutrifft:

1. **Informationslücke:** Eine für die Lösung nötige Angabe fehlt in allen Pflicht-Dokumenten.
2. **Widerspruch:** Zwei Dokumente geben unvereinbare Vorgaben und kein ADR löst den Konflikt auf.
3. **Fremde Modulgrenze:** Die Lösung würde Änderungen in einem Modul erfordern, das nicht Teil des aktuellen Fahrplan-Schritts ist.
4. **Freigabebedarf:** Die Lösung fällt in eine Kategorie aus CLAUDE.md Abschnitt 4.
5. **Nicht-deterministisches Verhalten:** Das Problem tritt nicht reproduzierbar auf. Nicht-Reproduzierbarkeit ist selbst ein Blocker, keine akzeptierte Eigenschaft.

In diesen Fällen: direkt Eintrag hier anlegen, ohne Dreifach-Versuch.

Für alle anderen Fälle gilt die Dreifach-Regel aus CLAUDE.md Abschnitt 10.

---

<!-- ANCHOR:aktive-blocker -->
## Aktive Blocker

Keine aktiven Blocker (Stand 2026-09-26). Die Härtung in Modus 2 Schritt 3 fand drei Befunde; alle wurden in Modus 2 aufgelöst und haben Fahrplan-Schritte als Landeplatz (siehe `docs/decisions.md` und `docs/fahrplan.md`).

<!-- ANCHOR:geloeste-blocker -->
## Gelöste Blocker

Nach Auflösung hierher verschieben. Ergänzungen: „Lösungsdatum", „Lösung", „ADR-Referenz falls zutreffend". Bei hoher Anzahl: nach `docs/archiv/blockers-YYYY.md` auslagern.

Keine.
