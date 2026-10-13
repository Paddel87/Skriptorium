# Prüfung: Trennung der Daten je KI-Bereich (D.18)

- **Datum:** 2026-10-13
- **Auftrag des Eigentümers:** „Alle Bereiche, mit denen die KI Inhalte erstellt, brauchen ganz spezifische Daten. Diese Daten dürfen nicht mit anderen Daten vermischt sein. Prüfe, ob das sichergestellt ist.“
- **Art:** ERKUNDUNG, nur gelesen – kein Code geändert. Stand `main` `9e8ea3a`.
- **Grenze der Prüfung:** Code und Tests im Repo. Die echten Daten des Eigentümers auf dem Server waren aus dieser Cloud-Session nicht erreichbar (ADR-025); ob die unten beschriebenen doppelten Abschnitte dort schon vorkommen, ist **nicht** geprüft.

## Ergebnis in einem Satz

Die Trennung zwischen **Welten, Geschichten und Gast-Figuren ist sichergestellt und durch Tests abgesichert**; vermischt werden Daten **innerhalb eines Eintrags bzw. einer Weltbeschreibung**: Neue Bildbeschreibungen und herausgelöstes Aussehen werden als **zweiter** Abschnitt angehängt statt den vorhandenen zu ersetzen, und die Vorlagen für „Bild erzeugen“ greifen bei Orten, Gegenständen und Karten auf den ganzen Text statt auf den passenden Abschnitt.

## Bewertungsmaßstab

- **sauber** – in die Anfrage gelangen nur die Daten, die der Bereich braucht; abweichende Daten sind ausgeschlossen.
- **Risiko** – im Regelfall sauber; unter benannten Umständen gelangen fremde oder veraltete Daten hinein, oder die Trennung ist nur durch Bauart gegeben, nicht durch Tests.
- **Mischung** – fremde, doppelte oder unpassende Daten gelangen im Regelfall hinein; am Code oder per Probe belegt.

## Tabelle je Bereich

| Bereich | Was in die Anfrage fließt (Beleg) | Herkunft | Befund | Absicherung durch Tests |
|---|---|---|---|---|
| **Weiterschreiben** | Rahmen, Weltbeschreibung, Schreibweise, alle Regeln und Zeitlinie der Welt, per `@` genannte Einträge, geführte Figuren, Fakten der Geschichte, Gesamtzusammenfassung, Kurzfassungen der Kapitel davor, letzte Seiten bis Ende des aktuellen Kapitels, weitere Einträge der Welt, dann Gäste (`context/builder.py:110-145`, `context/writing.py:62-136`, `339-441`) | `world.md` (nur Text, nicht der Kopf: `canon/service.py:811`), Einträge der Welt (`list_entries(world_id)`, `builder.py:155`), Gast-Verbindungen der Geschichte (`builder.py:161-171`), `story.md`, Kapitel | **sauber** für Welten und Geschichten; **Mischung** bei doppelten Abschnitten (B1, B2) | ja: `test_other_worlds_never_appear` (`tests/context/test_builder.py:223`), `test_rules_and_other_entries_of_the_home_world_never_come_along`, `test_other_stories_of_the_world_never_see_the_guest`, `test_story_of_the_home_world_gets_no_facts_of_the_linking_story` (`tests/context/test_guests.py:65-145`), `test_reference_to_an_entry_of_another_world_is_refused`, `test_guest_of_another_story_is_refused` (`tests/api/test_writing.py:217`, `278`) |
| **Szenen-Einstieg** | wie Weiterschreiben; Ort und Figuren werden zu `@`-Verweisen, Kategorie geprüft (`api/flows/writing.py:164-183`) | wie oben | **sauber** (wie oben) | ja: `test_scene_with_guest_place_and_character`, `test_guest_of_the_wrong_category_is_refused_in_a_scene` |
| **Kapitel-Kurzfassung** | Rahmen, Gesamtzusammenfassung unter der Überschrift „Handlungsstand **vor** diesem Kapitel“, Text des Kapitels (`context/summaries.py:102-131`) – kein Kanon, keine andere Geschichte | `story.md`, Kapitel | **Risiko** (B4) | teilweise: Aufbau geprüft (`test_chapter_summary_request_holds_state_text_and_instruction`), nicht dass Kanon und andere Geschichten fehlen, nicht der Fall „Kurzfassung neu erzeugen“ |
| **Gesamtzusammenfassung** | Rahmen, bisherige Gesamtzusammenfassung, Kurzfassung des Kapitels (`summaries.py:134-170`) | `story.md`, Kapitel | **sauber** | teilweise: Aufbau geprüft (`test_story_summary_request_continues_the_overall_summary`) |
| **Weltenbauer** | Rahmen, Weltbeschreibung, Namen aller Einträge der Welt, per `@` genannte Einträge der Welt, Gespräch (`context/worldbuilder.py:35-94`); auf Wunsch Websuche des Anbieters (`api/flows/worldbuilder.py:81-83`) | `world.md`, Einträge der Welt; Gespräch nur im Browser, je Welt neu (`WorldPage` mit `key={found.id}`, `ui/src/views/Shell.tsx:272-273`; Zustand in `useWorldbuilder.ts:43`) | **sauber**; Websuche bringt bewusst fremde Inhalte (zuschaltbar, Rahmen: „übernimm nur, was zur Welt passt“) | teilweise: `test_unknown_world_reference_or_budget` (Eintrag fremder Welt abgelehnt); kein Test, dass Einträge anderer Welten fehlen (nur durch Bauart) |
| **Bilder beschreiben** | Rahmen, Aufgabe mit Name und Kategorie des Eintrags bzw. Name von Karte und Welt, das eine Bild (`context/describe.py:31-87`, `api/flows/describe.py:38-68`) – kein Eintragstext | Bild des Eintrags (nur aus `entry.images`, `describe.py:42`) bzw. Karte der Welt (`describe.py:69`) | **sauber** in der Anfrage; **Mischung** bei der Übernahme (B1, B2) | ja: `test_a_figure_is_described_by_its_looks_without_its_text` (`tests/context/test_describe.py:30`) |
| **Aussehen herauslösen** | Rahmen, Name und ganzer Text des Eintrags (`context/appearance.py:27-44`) – nötig, damit das Äußere gefunden wird | Eintrag | **sauber** in der Anfrage; **Mischung** bei der Übernahme (B2); kleines **Risiko** B6 | ja: `test_the_request_asks_only_for_the_visible` |
| **Bilder erzeugen (Vorbelegung)** | Figur: Name und erster Abschnitt „Aussehen“ bzw. Zeile „Aussehen:“; andere Einträge: Name und Anfang des ganzen Texts; Karte: Anfang der ganzen Weltbeschreibung; Titelbild: ganze Gesamtzusammenfassung – je bis 700 Zeichen (`ui/src/imagePrompts.ts:13-41`) | Eintrag, `world.md`, `story.md` (im Browser, Autor kann ändern) | Figur: **Mischung** (B3); Orte, Gegenstände, Karten: **Mischung** (B5); Titelbild: **Risiko** (B5) | teilweise: `ui/src/imagePrompts.test.ts:6` prüft den Normalfall, nicht Vorlage, doppelte oder unterteilte Abschnitte |
| **Markierungen auf Karten** (Querschnitt) | gehen in keine Anfrage: liegen im Kopf von `world.md` (`marken`), `context` liest nur den Text (`canon/service.py:811`) | `world.md` Kopf | **sauber** | nein (nur durch Bauart; Logbuch 7.14) |

## Befunde mit Beleg

### B1 – Neue Kartenbeschreibung wird angehängt, die alte bleibt (Mischung)

- **Beleg:** `withSection` hängt immer einen neuen Abschnitt an (`ui/src/views/ImageDescription.tsx:221-230`); die Kartenbeschreibung geht so als „## Geografie – Name der Karte“ in die Weltbeschreibung (`ui/src/views/WorldMaps.tsx:642-652`). Ein vorhandener Abschnitt gleichen Namens wird weder ersetzt noch erkannt. Der Test prüft genau dieses Anhängen (`ImageDescription.test.tsx:132-139`).
- **Folge:** Wird eine Karte erneut beschrieben, stehen zwei Geografien derselben Karte in der Weltbeschreibung – und damit in **jeder** Anfrage beim Weiterschreiben, im Weltenbauer und in der Kartenvorlage. Weichen sie voneinander ab, widerspricht sich der Kanon selbst. Ebenso bleibt die Geografie einer gelöschten oder umbenannten Karte stehen.
- **Vorschlag:** Beim Übernehmen einen vorhandenen Abschnitt gleichen Namens ersetzen (nach Rückfrage „Ersetzen / zusätzlich anhängen“); beim Löschen einer Karte fragen, ob ihre Geografie mit entfernt wird.

### B2 – Neues Aussehen wird als zweiter Abschnitt „Aussehen“ angehängt (Mischung)

- **Beleg:** gleiche Funktion `withSection` bei „Übernehmen als ‚Aussehen‘“ aus der Bildbeschreibung (`ui/src/views/EntryImages.tsx:232-238`) und aus „Aussehen herauslösen“ (`ui/src/views/AppearanceExtract.tsx:104-105`). Neue Figuren beginnen mit der Vorlage `## Aussehen` (`canon/service.py:65`, `383-384`).
- **Probe** (Kopie von `imagePrompts.ts`, Node 24, Scratchpad):
  - Figur mit unveränderter Vorlage, dann „Aussehen herauslösen“ → Text `## Aussehen\n\n## Aussehen\n\nGroß, graue Augen.` – zwei Überschriften.
  - Figur, bei der der Autor unter die Vorlage geschrieben hat (`## Aussehen` + „Kael ist Schmied in Karst. Er hasst seinen Bruder …“), dann „Aussehen herauslösen“ → zwei Abschnitte „Aussehen“, der erste enthält Wesen und Geschichte.
- **Folge:** Beim Weiterschreiben gehen beide Abschnitte mit (die ganze Figur wird gerendert, `context/parts.py:142-152`); widersprechen sie sich, ist der Kanon in sich uneinheitlich.
- **Vorschlag:** wie B1 – vorhandenen Abschnitt ersetzen bzw. einen leeren Abschnitt füllen.

### B3 – Vorlage für „Bild erzeugen“ nimmt bei Figuren den falschen Abschnitt (Mischung)

- **Beleg:** `appearanceOf` nimmt den **ersten** Abschnitt „Aussehen“; ist er leer, gibt es `null` zurück, ohne einen weiteren zu suchen; der Abschnitt endet an der nächsten Überschrift **jeder** Ebene (`ui/src/imagePrompts.ts:21-23`, `49-65`).
- **Probe** (wie B2): Fall 1 → Vorbelegung nur „Kael“, das herausgelöste Aussehen fehlt. Fall 2 → Vorbelegung „Kael: Kael ist Schmied in Karst. Er hasst seinen Bruder und verlor 812 sein Auge.“ – Wesen und Vorgeschichte im Bildauftrag, genau das, was 7.16 (ADR-078) verhindern sollte. Außerdem: Ein Abschnitt „## Aussehen“ mit Unterabschnitt „### Kleidung“ wird an „### Kleidung“ abgeschnitten.
- **Ursache-Kette:** Vorlage `## Aussehen` als einzige Überschrift neuer Figuren (B2) + Anhängen statt Ersetzen (B2) + erster Abschnitt gewinnt (B3).
- **Vorschlag:** leere Abschnitte überspringen bzw. Abschnitte zusammenführen; Abschnitt erst an einer Überschrift gleicher oder höherer Ebene beenden; die Vorlage für neue Figuren so fassen, dass freier Text nicht unter „Aussehen“ landet (z. B. `## Aussehen` am Ende statt als einzige Überschrift) – Datenmodell-Konvention aus ADR-078, daher Vorlage an den Eigentümer.

### B4 – Kapitel-Kurzfassung bekommt beim Neu-Erzeugen spätere Kapitel mit (Risiko)

- **Beleg:** Die Anfrage nimmt die **aktuelle** Gesamtzusammenfassung und überschreibt sie mit „Handlungsstand vor diesem Kapitel“ (`context/summaries.py:115-121`). Beim ersten Abschluss in Reihenfolge stimmt das. Wird die Kurzfassung eines früheren Kapitels später neu erzeugt („nachholen“, nach Änderungen), enthält die Gesamtzusammenfassung schon dieses Kapitel und alle späteren.
- **Folge:** Die KI kann Ereignisse späterer Kapitel in die Kurzfassung des früheren tragen; die Anweisung „Halte dich strikt an den Text“ mindert das, verhindert es nicht. Diese Kurzfassung geht danach in jede Anfrage beim Weiterschreiben (Rang 3).
- **Vorschlag:** statt der Gesamtzusammenfassung die Kurzfassungen der Kapitel **vor** dem Kapitel mitgeben, oder die Überschrift ehrlich fassen („Gesamtzusammenfassung, reicht ggf. über dieses Kapitel hinaus – nichts davon übernehmen“). Änderung an der Kontext-Zusammenstellung – Regel-002 (Messung vorher/nachher) und Vorlage (Kategorie 1).

### B5 – Vorlagen für Orte, Gegenstände, Karten und Titelbild nehmen den ganzen Text (Mischung bzw. Risiko)

- **Beleg:** `entryPrompt` nimmt für alle Kategorien außer Figur Name und Anfang des **ganzen** Eintrags (`ui/src/imagePrompts.ts:17`); `mapPrompt` den Anfang der **ganzen** Weltbeschreibung (`imagePrompts.ts:26-33`) – bei einer typischen Welt zuerst Geschichte, Magie, Völker, dann ggf. die Geografie **anderer** Karten (B1); `coverPrompt` die ganze Gesamtzusammenfassung (`imagePrompts.ts:36-41`).
- **Folge:** Im Bildauftrag stehen Handlung, Namen und Regeln statt des Sichtbaren; bei Karten unter Umständen die Geografie einer anderen Karte. Der Autor sieht und ändert den Text vor dem Erzeugen (ADR-077) – deshalb kein stiller Fehler, aber nicht „ganz spezifische Daten“. Titelbild: Daten derselben Geschichte, nur nicht aufs Sichtbare beschränkt – Risiko.
- **Vorschlag:** Orte und Gegenstände: Abschnitt „Aussehen“ nehmen, wenn vorhanden (die Bildbeschreibung schreibt ihn schon so, `EntryImages.tsx:236`), sonst wie heute; Karte: Abschnitt „Geografie – Name dieser Karte“, wenn vorhanden, sonst nur der Titel; Titelbild: unverändert, oder nur Titel und Genre – Wahl des Eigentümers.

### B6 – „Aussehen herauslösen“ prüft die Kategorie nur in der Oberfläche (Risiko, klein)

- **Beleg:** Die Oberfläche zeigt den Knopf nur bei Figuren (`ui/src/views/EntryArticle.tsx:73`); der Server nimmt jeden Eintrag an und spricht im Rahmen trotzdem von einer Figur (`api/flows/appearance.py:37-40`, `context/appearance.py:16-24`).
- **Folge:** im Alltag keine – nur über einen direkten Aufruf. Bei einem Ort entstünde ein „Aussehen einer Figur“.
- **Vorschlag:** im Server Kategorie `figur` verlangen (Fehlerbehebung ohne Vertragsänderung für die Oberfläche).

### Gewollt und deshalb kein Befund

- **Gesamtzusammenfassung reicht über die Schreibstelle hinaus**, wenn der Autor in einem früheren Kapitel schreibt – gewollt seit 5.15, durch Rahmen und Vorgaben als „Zukunft“ markiert (`context/writing.py:178-196`, `237-239`; Test `test_frame_marks_what_lies_after_the_writing_point_as_future`).
- **Gast gewinnt über einen Eintrag der Welt mit gleicher Kennung** – gewollt (Schritt 3.7), getestet (`test_guest_wins_over_an_entry_of_the_world_with_the_same_identifier`); der Eintrag der Welt kann dann nur noch als Auffüllung mitgehen, nicht per `@`.
- **Kartenbeschreibungen in der Weltbeschreibung** gehen in jede Schreib-Anfrage – gewollt (ADR-074: die KI kennt die Karte über diesen Text).
- **Verlauf der Anweisungen** (5.13) geht nie an die KI (`ui/src/views/InstructionHistory.tsx:11-16`).

### Nebenbefund außerhalb des Auftrags

- Der **Weltenbauer** bekommt Regeln und Zeitlinie der Welt nur als Namen, nicht im Wortlaut (`context/worldbuilder.py:64-70`), soll aber „nie dem vorhandenen Kanon widersprechen“. Das ist keine Vermischung, sondern eine Lücke in der Vollständigkeit; ob Regeln mitgehen sollen, ist eine eigene Frage (Kategorie 1).

## Fehlende Tests (Absicherung der Trennung)

1. Weltenbauer: Einträge und Beschreibung einer anderen Welt erscheinen nicht in der Anfrage.
2. Kapitel-Kurzfassung und Gesamtzusammenfassung: weder Kanon noch Text einer anderen Geschichte derselben Welt in der Anfrage.
3. Markierungen (`marken`) und Kartendateinamen erscheinen in keiner Anfrage.
4. Vorlagen für „Bild erzeugen“: leerer Vorlagen-Abschnitt, doppelter Abschnitt, Unterabschnitt unter „Aussehen“.

## Reifegrad

**NFR Kanon-Treue** (`docs/architecture.md` Abschnitt 9, BELASTBAR): keine Rückstufung vorgeschlagen. B1 und B2 können widersprüchlichen Kanon in die Anfrage bringen, entstehen aber nur durch erneutes Beschreiben bzw. Herauslösen an bereits beschriebenen Einträgen und sind ein Fehler der Übernahme in der Oberfläche, nicht der Kontext-Zusammenstellung. Werden auf dem Server doppelte Abschnitte gefunden, ist die Frage neu zu stellen.

## Abhilfen und Landeplatz

| Befund | Abhilfe | Art | Landeplatz |
|---|---|---|---|
| B1, B2 | Übernahme ersetzt vorhandenen Abschnitt gleichen Namens bzw. füllt einen leeren (Rückfrage bei vorhandenem Text); Geografie gelöschter Karten auf Nachfrage entfernen | Fehlerbehebung in `ui`, verändert vorhandenen Text des Autors → Vorlage | V.29 |
| B3 | `appearanceOf` überspringt leere Abschnitte, endet erst an gleicher oder höherer Ebene; Vorlage neuer Figuren so, dass freier Text nicht unter „Aussehen“ fällt | Fehlerbehebung `ui` + Datenmodell-Konvention (ADR-078, Kategorie 4) → Vorlage | V.29 |
| B4 | Kurzfassung bekommt nur den Stand vor dem Kapitel | Kontext-Zusammenstellung (Kategorie 1), Regel-002 | V.30 |
| B5 | Vorlagen aus „Aussehen“ bzw. „Geografie – diese Karte“ | Oberfläche, ADR-077 berührt → Vorlage | V.31 |
| B6 | Kategorie `figur` im Server prüfen | Fehlerbehebung ohne Vertragsänderung | V.29 |
| Tests 1–4 | Tests ergänzen | Testerstellung (frei) | V.29 (1, 3, 4), V.30 (2) |
| Nebenbefund | Regeln im Wortlaut an den Weltenbauer? | Kategorie 1 | V.32 |

Vor einer Abhilfe zu B1/B2 lohnt eine Zählung auf dem Server (vom Mac aus): Wie viele Einträge haben mehr als einen Abschnitt „Aussehen“, wie viele Welten mehr als einen „Geografie“-Abschnitt je Karte? Das sagt, ob vorhandene Daten bereinigt werden müssen.
