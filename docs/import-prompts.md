# Prompts für den Import von Welt-Material

Zwei Prompts, mit denen eine fremde KI (Claude, ChatGPT, Grok o. ä.) vorhandenes Welt-Wissen in das Import-Format des Skriptoriums bringt (Markdown-Import, Schritt 2.4, ADR-012). Entstanden im Funktionstest am 2026-10-08; Prompt B dort vom Eigentümer erfolgreich erprobt.

**Warum die Regeln so streng sind:** Der Import erkennt Gruppen und Einträge an den Überschriften (`src/skriptorium/canon/importers/markdown.py`). Eine `##`-Überschrift ohne eigenen Text, auf die direkt `###` folgt, gilt als Gruppe – ihre Unterabschnitte werden dann zu eigenen Einträgen (Befund 2026-10-08, Behebung im Code vorgeschlagen als 4.16). Ein Eintrag, der wie eine Kategorie heißt („Magie“, „Religion“), gilt ebenfalls als Gruppe. Abschnitte außerhalb der sechs Gruppen werden zu Einträgen ohne Kategorie und lassen den Import abbrechen – deshalb stehen Notizen für den Autor nie im Import-Block.

## Prompt A: aus vorhandenem Welt-Material

Für Dokumente, Notizen oder eine Agentenanweisung (z. B. aus den Agenten-Einstellungen in TypingMind kopiert). Das Material wird am Ende eingefügt.

```text
Wandle das Welt-Material unten in ein Markdown-Dokument für den Import in mein Schreibprogramm um. Gib genau ZWEI Codeblöcke aus, sonst nichts.

=== BLOCK 1: IMPORT (Markdown) ===

1. ERSTER ABSCHNITT, OHNE ÜBERSCHRIFT: Beschreibung der Welt in 3–8 Sätzen (Lage, Grundstimmung, Technik- bzw. Magiestand, was sie besonders macht). Davor steht nichts.

2. GRUPPEN als Überschrift erster Ebene (#), genau mit diesen Namen, nur wenn es Material gibt:
   # Figuren
   # Orte
   # Gegenstände
   # Zeitlinie
   # Regeln
   # Kultur
   Keine anderen Überschriften erster Ebene.

3. JEDER EINTRAG ist eine Überschrift zweiter Ebene (##) unter seiner Gruppe, genau der Name, ohne Zusätze. Jeder Name nur einmal in der ganzen Welt.

4. KEIN EINTRAG darf genau so heißen wie eines dieser Wörter: Figur, Figuren, Person, Personen, Charakter, Charaktere, Ort, Orte, Geografie, Schauplatz, Land, Länder, Region, Regionen, Gegenstand, Gegenstände, Artefakt, Artefakte, Objekt, Objekte, Zeitlinie, Chronik, Zeittafel, Regel, Regeln, Magie, Magiesystem, Gesetz, Gesetze, Kultur, Kulturen, Volk, Völker, Religion, Religionen. Mach solche Namen genauer, z. B. „Magie der Glasbrenner“ statt „Magie“.

5. PFLICHT: Unter JEDER ##-Überschrift steht zuerst mindestens ein Satz Fließtext. Erst danach dürfen ###-Unterüberschriften folgen. Eine ##-Überschrift, auf die direkt eine ###-Überschrift folgt, ist verboten.

6. Direkt unter der ##-Überschrift, falls es andere Namen, Spitznamen oder Titel gibt, eine Zeile:
   Aliasse: Name1, Name2
   Danach trotzdem der Pflicht-Satz aus Punkt 5.

7. Danach Fließtext. ###-Unterüberschriften innerhalb eines Eintrags sind erlaubt (nach dem Pflicht-Satz). Keine Tabellen, Bilder, Links.

8. JE GRUPPE:
   - Figuren: ein bis zwei Sätze, wer die Figur ist; dann Aussehen, Wesen, Herkunft, Fähigkeiten, Beziehungen, was sie nie tun würde.
   - Orte: Lage, Aussehen, Atmosphäre, wer dort lebt oder herrscht, was dort geschehen ist.
   - Gegenstände: zuerst ein bis zwei Sätze Fließtext, was der Gegenstand ist; ERST DANACH die drei Unterüberschriften ### Zweck, ### Verwendung, ### Auswirkung (auf Welt und Figuren).
   - Zeitlinie: jedes Ereignis ein eigener Eintrag. Name beginnt mit dreistelliger laufender Nummer in zeitlicher Reihenfolge, Gedankenstrich, Titel: „## 001 – Gründung von Vell“. Im Text: wann, was, welche Folgen.
   - Regeln: jede Regel der Welt ein eigener Eintrag (Magie, Naturgesetze, Gesetze, Tabus, Technikstand) als verbindliche Aussage: was geht, was nicht, was es kostet.
   - Kultur: Völker, Religionen, Bräuche, Sprache, Gesellschaftsordnung.

9. UMFANG: Regeln und Zeitlinie zusammen höchstens etwa 3.000 Wörter, lieber weniger. Die übrigen Gruppen dürfen ausführlicher sein.

10. TREUE: Nur übernehmen, was im Material steht. Nichts dazuerfinden. Widersprüche nicht still auflösen, sondern in Block 2 aufführen.

11. NICHT in Block 1: Erzählperspektive, Schreibstil, Rolle der KI, Formatierung – das gehört in Block 2.

12. PRÜFE VOR DER AUSGABE: Steht unter jeder ##-Überschrift zuerst ein Satz Text? Heißt kein Eintrag wie ein Wort aus Punkt 4? Gibt es keinen Namen doppelt?

=== BLOCK 2: FÜR MICH (nicht importieren) ===

Einfacher Text: Vorgaben zu Erzählperspektive, Schreibweise und Atmosphäre aus dem Material; offene Punkte (Widersprüche, unklare Zuordnungen, fehlende Angaben).

Keine Erklärungen vor oder nach den zwei Blöcken.

Hier ist mein Welt-Material:

[HIER DEIN MATERIAL EINFÜGEN]
```

## Prompt B: am Ende eines bestehenden Chats

Wird am Ende eines laufenden Chats eingefügt; die KI wertet den Verlauf aus, den sie sieht. Fragt bewusst nicht nach der System- oder Agentenanweisung – Grok verweigerte das (Schutzregel des Modells); die Agentenanweisung wird stattdessen aus den Einstellungen kopiert und mit Prompt A umgewandelt.

```text
Unterbrich die Geschichte und schreibe sie nicht weiter. Ich brauche jetzt eine Zusammenfassung des Wissens über diese Welt und diese Geschichte – aus dem gesamten bisherigen Gespräch und allem, was du über die Welt weißt.

Gib genau ZWEI Codeblöcke aus, sonst nichts.

=== BLOCK 1: IMPORT (Markdown) ===

Das gesamte Wissen über die Welt, exakt in diesem Format:

1. ERSTER ABSCHNITT, OHNE ÜBERSCHRIFT: Beschreibung der Welt in 3–8 Sätzen (Lage, Grundstimmung, Technik- bzw. Magiestand, was sie besonders macht). Davor steht nichts.

2. GRUPPEN als Überschrift erster Ebene (#), genau mit diesen Namen, nur wenn es Material gibt:
   # Figuren
   # Orte
   # Gegenstände
   # Zeitlinie
   # Regeln
   # Kultur
   Keine anderen Überschriften erster Ebene.

3. JEDER EINTRAG ist eine Überschrift zweiter Ebene (##) unter seiner Gruppe, genau der Name, ohne Zusätze. Jeder Name nur einmal in der ganzen Welt.

4. KEIN EINTRAG darf genau so heißen wie eines dieser Wörter: Figur, Figuren, Person, Personen, Charakter, Charaktere, Ort, Orte, Geografie, Schauplatz, Land, Länder, Region, Regionen, Gegenstand, Gegenstände, Artefakt, Artefakte, Objekt, Objekte, Zeitlinie, Chronik, Zeittafel, Regel, Regeln, Magie, Magiesystem, Gesetz, Gesetze, Kultur, Kulturen, Volk, Völker, Religion, Religionen. Mach solche Namen genauer, z. B. „Magie der Glasbrenner“ statt „Magie“.

5. PFLICHT: Unter JEDER ##-Überschrift steht zuerst mindestens ein Satz Fließtext. Erst danach dürfen ###-Unterüberschriften folgen. Eine ##-Überschrift, auf die direkt eine ###-Überschrift folgt, ist verboten.

6. Direkt unter der ##-Überschrift, falls es andere Namen, Spitznamen oder Titel gibt, eine Zeile:
   Aliasse: Name1, Name2
   Danach trotzdem der Pflicht-Satz aus Punkt 5.

7. Danach Fließtext. ###-Unterüberschriften innerhalb eines Eintrags sind erlaubt (nach dem Pflicht-Satz). Keine Tabellen, Bilder, Links.

8. JE GRUPPE:
   - Figuren: ein bis zwei Sätze, wer die Figur ist; dann Aussehen, Wesen, Herkunft, Fähigkeiten, Beziehungen, was sie nie tun würde. Zusätzlich ### Stand am Ende des Gesprächs: Wissen, Besitz, Verletzungen, Beziehungen, Aufenthaltsort.
   - Orte: Lage, Aussehen, Atmosphäre, wer dort lebt oder herrscht, was dort geschehen ist.
   - Gegenstände: zuerst ein bis zwei Sätze Fließtext, was der Gegenstand ist; ERST DANACH die drei Unterüberschriften ### Zweck, ### Verwendung, ### Auswirkung (auf Welt und Figuren).
   - Zeitlinie: jedes wichtige Ereignis – aus der Vorgeschichte UND aus der Handlung im Gespräch – ein eigener Eintrag. Name beginnt mit dreistelliger laufender Nummer in zeitlicher Reihenfolge, Gedankenstrich, Titel: „## 001 – Gründung von Vell“. Im Text: wann, was, welche Folgen.
   - Regeln: jede Regel der Welt ein eigener Eintrag (Magie, Naturgesetze, Gesetze, Tabus, Technikstand) als verbindliche Aussage: was geht, was nicht, was es kostet.
   - Kultur: Völker, Religionen, Bräuche, Sprache, Gesellschaftsordnung.

9. UMFANG: Regeln und Zeitlinie zusammen höchstens etwa 3.000 Wörter, lieber weniger; kleine Ereignisse zusammenfassen. Die übrigen Gruppen dürfen ausführlicher sein.

10. TREUE: Nur übernehmen, was in der Welt und im Gespräch festgelegt ist. Nichts dazuerfinden. Widersprüche nicht still auflösen, sondern in Block 2 aufführen.

11. NICHT in Block 1: Erzählperspektive, Schreibstil, Formatierung – das gehört in Block 2.

12. PRÜFE VOR DER AUSGABE: Steht unter jeder ##-Überschrift zuerst ein Satz Text? Heißt kein Eintrag wie ein Wort aus Punkt 4? Gibt es keinen Namen doppelt?

=== BLOCK 2: FÜR MICH (nicht importieren) ===

Einfacher Text mit diesen Abschnitten:
- Erzählperspektive und Zeitform der Geschichte
- Figuren, die ich selbst geführt habe
- Schreibweise und Atmosphäre der Geschichte (Ton, Tempo, Satzbau)
- Kurzfassung der Handlung (höchstens 15 Sätze, wo die Geschichte jetzt steht)
- Offene Punkte: Widersprüche, unklare Zuordnungen, fehlende Angaben
- Vollständigkeit: Kannst du das gesamte Gespräch von Anfang an sehen, oder fehlt dir der Anfang? Nenne die früheste Szene, an die du dich erinnerst.

Keine Erklärungen vor oder nach den zwei Blöcken.
```

## Was wohin gehört

| Ergebnis | Ziel im Skriptorium |
|---|---|
| Block 1 | Welt anlegen (Name von Hand) → Import → Vorschau prüfen → übernehmen |
| Erzählperspektive, Zeitform | Geschichte → Figuren-Schreibweise → Erzählperspektive |
| Selbst geführte Figuren | ebenda → geführte Figuren (erst nach dem Import auswählbar) |
| Schreibweise, Atmosphäre | vorerst mit ins Feld Erzählperspektive; eigenes Feld mit 5.6 (FR-026) |
| Kurzfassung der Handlung | Geschichte → Gesamtzusammenfassung |
| Offene Punkte | eigene Notizen; Geklärtes in den passenden Kanon-Eintrag |

## Grenzen

- Bei langen Chats sieht die KI oft nur die letzten Nachrichten (Kontextgrenze des Chat-Programms); der Abschnitt „Vollständigkeit“ in Prompt B macht das sichtbar.
- Die Geschichte selbst wird nicht übernommen, nur das Weltwissen (ADR-009).
- Ein direkter Import der Agenten-Datei aus TypingMind ist als V.4 vorgesehen (Landeplatz 5.5).
