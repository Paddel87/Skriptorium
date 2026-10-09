# Inspiration TypingMind für den Chat-Aufbau (5.11 Teil 2)

- **Anlass:** Wunsch des Eigentümers 2026-10-08: Aufbau „wie TypingMind oder ChatGPT“, Menüs bei Bedarf ausklappbar; TypingMind als Inspiration ansehen (`docs/fahrplan.md` 5.11, Entwurf geändert).
- **Quelle:** typingmind.com im eingebauten Browser, nur angesehen, ohne Anmeldung und ohne Konto, 2026-10-09; Desktop (1280 × 800) und Smartphone (375 × 812). Benennungen der Bedienelemente aus der Seite selbst (`aria-label`, Tooltips). Keine Bilder und kein Code übernommen.
- **Grenze:** Ohne Konto blendet TypingMind bei Klicks ins Menü ein Werbefenster ein; die ausgeklappte Chat-Liste am Smartphone und ein Chat mit Verlauf waren deshalb nicht zu sehen. Was dazu unten steht, stammt aus den Namen der Bedienelemente, nicht aus der Ansicht.

## Was TypingMind zeigt

1. **Schmale Symbolleiste ganz links** (Desktop): Neuer Chat, Chats, Agents, Prompts, Plugins, Models, Wissensbasis, Memory, Teams, Settings; unten das Profil. Jeder Bereich ist ein Symbol, der Text erscheint als Tooltip.
2. **Ausklappbare Liste daneben:** Suche in den Chats, Filtern und Sortieren, Ordner anlegen, Mehrfachauswahl, „Close sidebar“. Die Liste ist der einzige Ort für Navigation.
3. **Mitte:** Chat-Titel oben, Verlauf scrollt, sonst leer und ruhig; dunkles Thema, wenig Linien.
4. **Eingabe fest unten:** über dem Feld die Modell-Wahl als kleines Auswahlfeld; im Feld unten eine Reihe Symbol-Knöpfe (Kurzbefehle, Anhang, Sprache, Wissensbasis, Denkmodus, Hintergrundmodus). Taste „/“ springt ins Eingabefeld.
5. **Smartphone:** oben nur zwei Symbole (Menü links, Neuer Chat rechts), dazwischen nichts; Eingabe über die volle Breite am unteren Rand, Modell-Wahl darüber; der Inhalt hat die ganze übrige Fläche.

## Übertragung auf das Skriptorium (Vorschlag für Teil 2)

| TypingMind | Skriptorium |
|---|---|
| Symbolleiste links (Chats, Agents, Prompts, Settings …) | Welten, Kanon, Import, Konto, Darstellung – als Symbole mit Beschriftung im Tooltip; am Smartphone im Menü |
| Chat-Liste mit Suche und Ordnern | Geschichten mit Suche, gruppiert nach Welt (Welt = Ordner), darunter die Kapitel der offenen Geschichte; einklappbar |
| Chat-Verlauf | das Manuskript des Kapitels, scrollt, öffnet am Textende (5.9) |
| letzte Antwort mit Aktionen | der Vorschlag der KI am Textende, abgesetzt, mit Übernehmen, Ändern, Verwerfen, Neu schreiben |
| Eingabe unten mit Symbol-Knöpfen | Anweisung unten; Modell und Länge darüber als kleine Auswahl; Neue Szene, „In den Kanon“ und Kapitel abschließen als Knöpfe in der Leiste der Eingabe |
| „/“ springt in die Eingabe | Tastenkürzel ins Anweisungsfeld (Vorschlag, mit dem Eigentümer klären) |
| rechte Seite (bei TypingMind Chat-Einstellungen) | Kanon nachschlagen, Figuren-Schreibweise, Gäste, Fakten, Zusammenfassung – bei Bedarf ausklappbar |
| Smartphone: Menü, Inhalt, Eingabe unten | gleich: Menü links, Manuskript, Anweisung unten; rechte Leiste als zweites Menü |

## Entscheidungen des Eigentümers (2026-10-09, Auswahlfragen)

1. **Links:** schmale Symbolleiste dauerhaft sichtbar, daneben die ausklappbare Liste der Geschichten und Kapitel; am Smartphone beides im Menü.
2. **Manuskript:** bleibt direkt editierbar wie heute; nur die Anweisung sitzt unten wie beim Chat.
3. **Vorschlag der KI:** am Textende wie eine Chat-Antwort, abgesetzt, mit Übernehmen, Ändern, Verwerfen, Neu schreiben; übernommen wird er Teil des Manuskripts.
