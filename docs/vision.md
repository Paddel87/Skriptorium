# Vision – Skriptorium

## 1. Kernidee

Eine Schreibwerkstatt, in der mehrere selbst entwickelte Welten als verbindlicher Kanon dienen und Mensch und KI gemeinsam Prosa darin schreiben. Der Mensch lenkt, die KI formuliert mit – ohne der jeweiligen Welt zu widersprechen.

## 2. Problem und Anlass

- **Welches Problem löst das System?** KI-Assistenten halten den Kanon eigener Welten beim gemeinsamen Schreiben nicht zuverlässig ein.
- **Wer hat dieses Problem heute?** Patrick als einzelner Autor mit mehreren eigenen Welten; das bestehende Welt-Material hat mittleren Umfang (mehrere Dokumente, zweistellige Seitenzahl).
- **Wie wird das Problem heute gelöst?** TypingMind mit Agenten: Welten samt Figuren sind als Agenten angelegt, Geschichten werden darin fortlaufend geschrieben.
- **Warum reicht das nicht?**
  - Neue Fakten, die beim Schreiben entstehen, fließen nicht in den Kanon zurück – die Welt wächst nicht mit dem Text mit.
  - Nach mehreren Geschichten in einer Welt lassen sich Figuren nicht sauber in einer anderen Geschichte oder Welt verwenden, und die Welt lässt sich nicht geschichtenübergreifend weiterschreiben.
  - Bei jeder Anfrage wird der gesamte Kontext mitgeschickt. Lange Geschichten stoßen an Kontextgrenzen, die Kosten steigen mit jeder Anfrage.
  - Wirtschaftlich tragbar sind heute ca. 125.000–140.000 Tokens pro Anfrage. Längere Geschichten mit 500.000–700.000 Tokens Chatverlauf waren nur mit Gratis-Guthaben möglich.

## 3. Zielbild

Patrick öffnet das Skriptorium, wählt eine Welt und steigt je nach Tagesform ein: mit einer neuen Szene (Ort, Figuren, Ziel), direkt am laufenden Manuskript oder im Gespräch mit Figuren und Welt. Das Skriptorium kennt den Kanon der gewählten Welt – Figuren, Orte und Geografie, Gegenstände, Zeitlinie, Regeln und Kultur – und stellt den jeweils relevanten Teil bereit. Zu Gegenständen gehört, welchem Zweck sie dienen, wie sie verwendet werden und welche Auswirkungen ihr Einsatz auf Welt und Figuren hat. Beim Schreiben kann Patrick einen Kanon-Eintrag gezielt ansprechen, indem er dem Begriff ein @ voranstellt (z. B. @Kael, @Hafenstadt, @Runenklinge); das Skriptorium weiß dann, dass das Wissen zu genau diesem Eintrag benötigt wird. Der @-Verweis ist der Hauptweg; erkennt das Skriptorium einen Kanon-Bezug ohne @, schlägt es den passenden Eintrag nur vor (z. B. „Meintest du @Kael?“), statt ihn selbstständig heranzuziehen. Jede Welt trägt mehrere Geschichten mit wenigen Hauptfiguren und wechselnden Nebenfiguren. Die Welten sind eigenständig; eine Verbindung zwischen ihnen besteht nur dort, wo eine Geschichte sie ausdrücklich herstellt (z. B. eine Figur wechselt die Welt). Patrick und die KI formulieren die Prosa im Wechsel; die KI schreibt mit, widerspricht der Welt aber nicht. Romane, Kurzgeschichten und Fragmente liegen nebeneinander. Neue Fakten trägt Patrick selbst mit einem Handgriff direkt aus dem Text heraus in den Kanon ein.

**Beispielszenarien:**

- Patrick nennt eine Szene: zwei Figuren treffen sich an einem bestimmten Ort. Das Skriptorium kennt Vorgeschichte, Beziehung und Ort und formuliert einen ersten Absatz, den Patrick weiterschreibt.
- Patrick öffnet ein Kapitel einer laufenden Geschichte. Das Skriptorium kennt den Handlungsstand aller vorherigen Kapitel und schreibt im Wechsel mit ihm weiter.
- In einer Szene entsteht ein neues Detail (z. B. ein Name, ein Ereignis). Patrick markiert es und trägt es in unter 10 Sekunden in den Kanon ein.
- Eine Figur aus Welt A tritt in einer Geschichte in Welt B auf. Nur für diese Geschichte gilt die Verbindung; die übrigen Geschichten beider Welten bleiben unberührt.
- Patrick schreibt, dass eine Figur @Runenklinge zieht. Das Skriptorium kennt Zweck, Verwendung und Wirkung des Gegenstands und berücksichtigt die Folgen für Figur und Welt im weiteren Text.

## 4. Erfolgskriterien

- Höchstens ein Kanon-Widerspruch pro Kapitel, der beim Redigieren auffällt.
- Eintragen eines neuen Kanon-Fakts dauert unter 10 Sekunden, direkt aus dem Text heraus.
- Kein Kontextverlust bei einer Geschichte vom Umfang der bisher längsten (Referenz: Geschichte, deren Chatverlauf heute 500.000–700.000 Tokens erreicht). Der reine Textumfang der Referenzgeschichte wird bei der Prüfung ermittelt.
- Das Fortschreiben einer solchen Geschichte ist pro Anfrage günstiger als heute (Referenz: heutiger Ansatz mit ca. 125.000–140.000 Tokens pro Anfrage).
- Figuren lassen sich in anderen Geschichten derselben Welt und – wo eine Geschichte es herstellt – in anderen Welten verwenden, ohne ihren Kanon zu verlieren.
- Vom ersten Öffnen bis zur ersten geschriebenen Szene in einer bestehenden Welt vergehen ohne Anleitung höchstens 30 Minuten, einschließlich einer einmaligen kurzen Einrichtung.

## 5. Bewusste Abgrenzung

- **Kein Spielbetrieb:** keine Rollenspielrunden, Würfel, Regelmechanik oder Spielleitung.
- **Keine Mehrnutzerfähigkeit:** keine Konten, Rechte oder gemeinsames Schreiben.
- **Keine übergeordnete Multiversums-Ebene:** keine weltübergreifende Kosmologie oder Zeitlinie; Verbindungen entstehen nur durch konkrete Geschichten.
- **Nicht in der ersten Version, aber nicht ausgeschlossen:** Publizieren (Satz, Export, Veröffentlichung) sowie Bilder und Karten.

## 6. Harte Randbedingungen

- **Technologie:** offen, mit einer Einschränkung: Das KI-Modell wird über Cloud-Anbieter (z. B. OpenRouter) genutzt. Ein selbst betriebenes Modell ist technisch nicht umsetzbar.
- **Inhaltsfilter:** Das System muss Modelle nutzen können, die keine restriktiven Inhaltsfilter für fiktionale Inhalte haben. Anbieter, die ihre Filter nachträglich verschärfen, dürfen das Schreiben nicht blockieren – ein Modellwechsel muss möglich bleiben.
- **Hosting:** Cloud erlaubt.
- **Datenschutz/Compliance:** keine besonderen Vorgaben; Übermittlung an kommerzielle KI-APIs ist zulässig.
- **Lizenzmodell:** offen. Open Source ist beabsichtigt; die konkrete Lizenz (z. B. MIT, GPL, AGPL) wird bewusst erst nach der Prüfung vorhandener Werkzeuge festgelegt, damit die Auswahl nicht durch Lizenzkompatibilität vorab eingeschränkt wird.
- **Zeitrahmen:** kein Termin.
- **Budget für externe Dienste:** offen.

## 7. Weiche Präferenzen

- Mobil nutzbar: Schreiben und Kanon-Pflege auch am Smartphone.
- Offene Formate: Welten und Texte als lesbare Dateien (z. B. Markdown), kein Lock-in.
- Wiederverwendung bestehender Open-Source-Bausteine vor Eigenentwicklung.
- Freie Modellwahl: KI-Anbieter austauschbar.

## 8. Inspirationen und Vorbilder

- **SillyTavern:**
  - Übernehmen: World Info als Prinzip, Kanon-Einträge bei Bedarf einzublenden – im Skriptorium allerdings gesteuert über den @-Verweis statt vollautomatisch; freie Wahl von Anbieter und Modell.
  - Bewusst nicht übernehmen: Chat- und Charakter-Rollenspiel-Fokus statt Manuskript-Arbeit; überladene Oberfläche mit vielen Stellschrauben.

## 9. Bekannte Risiken und offene Punkte

- **Manuelle Kanon-Pflege:** Rein manuelle Pflege könnte – wie heute – im Schreibfluss liegen bleiben, trotz 10-Sekunden-Ziel. Das Defizit „Kanon wächst nicht mit“ wäre dann nicht gelöst.
- **Kanon-Erkennung:** Unklar, ob das Skriptorium Kanon-Bezüge ohne @ zuverlässig erkennt und passende Einträge vorschlägt – verschärft durch mehrere Welten und punktuelle Verbindungen zwischen ihnen. Der @-Verweis als Hauptweg begrenzt das Risiko, weil falsche Vorschläge nur angeboten, nicht übernommen werden.
- **Modellverfügbarkeit:** Da kein eigenes Modell betrieben werden kann, hängt das System von Cloud-Anbietern ab. Deren Filterpolitik und Preise können sich ändern (wie bereits bei Gemini geschehen); geeignete Modelle ohne restriktive Inhaltsfilter könnten wegfallen oder teurer werden.
- **Eigenbau vs. Anpassung:** Bewusst nicht entschieden. Vor der Entscheidung werden vorhandene Werkzeuge (u. a. SillyTavern) gezielt geprüft. Die Projektlizenz hängt vom Ergebnis ab: Übernahme oder Anpassung von GPL-/AGPL-Code legt die eigene Lizenz fest.

## 10. Was diese Vision nicht ersetzt

Dieses Dokument ist Eingang in die Konzeptphase, nicht ihr Ergebnis. Es ersetzt **nicht**:

- die Architekturentscheidung (kommt in `architecture.md`)
- die Stack-Entscheidung (kommt in `project-context.md` und `decisions.md`)
- die Roadmap (kommt in `fahrplan.md`)
- die Constraints in operationalisierter Form (kommt in `project-context.md`)

---

**Überführungs-Status:**

- [x] Vision ausgefüllt (Konzeptdialog 2026-09-26)
- [x] Konzeptphase abgeschlossen (Lücken geschlossen, Optionen entschieden)
- [x] Härtungsphase abgeschlossen (Blocker und Inkonsistenzen geprüft)
- [x] Vorlagen-Set initialisiert (project-context.md, architecture.md, fahrplan.md, decisions.md, blockers.md)
- [x] ADR-001 angelegt: Anpassung des Vorlagen-Sets
- [x] Datum der Initialisierungs-Abschluss: 2026-09-26

**Nach abgeschlossener Initialisierung:** Diese Datei wird nicht mehr verändert.
Spätere Vision-Erweiterungen oder Pivots werden in einem ADR dokumentiert, nicht in dieser Datei.
