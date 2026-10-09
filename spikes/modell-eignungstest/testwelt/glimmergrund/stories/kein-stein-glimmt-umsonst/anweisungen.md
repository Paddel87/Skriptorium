# Anweisungen für die Probe – „Kein Stein glimmt umsonst“, Kapitel 3

Schreibstelle: „Das Schloss an der Sperre war so neu, dass es noch nach Fett roch.“

Das Kapitel 3 („Die Einfahrt“) wird für die Probe unmittelbar nach diesem Satz abgeschnitten (der Satz bleibt stehen, alles danach entfällt). Der Satz steht genau einmal im Kapitel, im Gang vor der Sperre zur Tiefen Sohle, in Gegenwart von Brack. Die sieben Anweisungen folgen im Stil von `spikes/vorgriff-zeitlinie/probe.py` aufeinander; jede wird nach der Antwort der KI an den Text angehängt. Die Anweisungen sind aus Sicht der geführten Figur Konstanze Wendt („ich“) geschrieben.

Wendt ist die geführte Figur; die KI schreibt alles außer ihren Handlungen, Worten und Gedanken.

```python
INSTRUCTIONS = [
    "Ich frage Brack, wer von den Stollen unten auf der Tiefen Sohle zuletzt in Betrieb war und wie "
    "viele es dort überhaupt gab. Brack antwortet kurz. Ich frage ihn, wer den Schlüssel zum neuen "
    "Schloss hat.",
    "Wir fahren hinauf. Im Hof lädt ein Fuhrmann aus dem Tal Fässer ab; ich frage ihn, wie lange er "
    "bis Unterwehr braucht. Dann gehe ich zu Haller ins Maschinenhaus, weil er mir noch etwas "
    "über seine Maschine erzählen wollte.",
    "Am Abend bin ich beim Direktor zum Essen eingeladen. Ich komme zur verabredeten Uhrzeit nach "
    "der Kirchenuhr. Nach dem Essen bringt seine Frau ein Getränk für alle.",
    "Zurück in der Nassen Sohle schiebt mir jemand eine Nachricht unter der Tür durch. Ich lese "
    "sie, dann schreibe ich Lenka Vorst eine Antwort und bitte Rosl, sie ihr zu bringen.",
    "",
    "Am nächsten Morgen gehe ich zu Doktor Salm ins Lazarett und bitte ihn, mir zu beschreiben, "
    "wie die geborgenen Lampen der Toten aussahen, als man sie fand.",
    "Ich besuche am Abend Bracks Haus und bringe einen Korb Äpfel mit. Seine Frau öffnet die Tür; "
    "ich sage ihr, warum ich komme, und bitte sie, ihren Mann zu holen.",
]
```

## Zweck der Anweisungen (für die Auswertung, nicht für die KI)

| Nr. | Anweisung beschreibt, was Wendt tut? | Berührte Kanon-Probe (ohne sie zu nennen) |
|---|---|---|
| 1 | ja (fragt, fragt) | Sieben wird nicht ausgesprochen („Sechs-und-eins“) |
| 2 | ja (fragt, geht hin) | Pfeifverbot (Fuhrmann); Pumpe heißt „Hohe Berta“ |
| 3 | ja (kommt, isst) | Farnows Uhr geht 11 Minuten vor; Wendt trinkt keinen Kaffee |
| 4 | ja (liest, schreibt) | Lenka schreibt Spiegelschrift (Linkshänderin) |
| 5 | leer („Weiter“) | – |
| 6 | ja (geht hin, bittet) | Salm ist rot-grün-farbenblind; Warnfarbe Rot |
| 7 | ja (besucht, spricht) | Brack wird nur „Brack“ genannt; Trauerfarbe Gelb (Band an der Tür) |
