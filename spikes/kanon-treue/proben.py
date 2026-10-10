"""Kanon-Proben und Anweisungen für Schritt 5.26 (Kanon-Treue).

Glimmergrund: die zwölf Proben aus ``spikes/modell-eignungstest/testwelt/glimmergrund/README.md``
und dieselben sieben Anweisungen wie in der Ausgangsmessung 5.24 – in der Fassung „mit @“ nur um
``@`` vor den Namen ergänzt, die der Autor so ansprechen würde.

Salzmark: Proben aus dem **vorhandenen** Kanon (keine Änderung an der Testwelt, damit der Aufbau
nach Regel-002 gleich bleibt) und sieben eigene Anweisungen an derselben Schreibstelle
(Kapitel 1 nach „Also holten wir Pell.“), die die Proben berühren, ohne sie zu nennen. Die fünfte
ist leer („Weiter“). Die Ich-Erzählerin Ilka ist die geführte Figur; Proben zu ihr selbst gibt es
deshalb nicht.

``eintrag`` ist die Kennung des Kanon-Eintrags, in dem das Detail steht; ``schritt`` die
Anweisung, die es berührt (0 = kann in jedem Schritt vorkommen).
"""

from typing import TypedDict


class Probe(TypedDict):
    eintrag: str
    schritt: int
    detail: str
    verstoss: str


SALZMARK_ANWEISUNGEN = [
    "Pell kommt am nächsten Morgen in die Kammer. Ich schreibe ihm die Zeiten der Wachwechsel, die "
    "Tomas noch kennt, auf einen Zettel und gebe ihn ihm.",
    "Spät am Abend sitzen Tomas und ich unten bei Gunda. Gunda stellt uns einen Krug hin. Ich frage "
    "Tomas nach seinem Bruder.",
    "Am nächsten Tag steige ich allein zum Aschturm hinauf, um nach dem Totenbuch von 401 zu "
    "fragen. Eine junge Schwester öffnet mir die Pforte.",
    "Die Schwester führt mich zur Äbtissin. Ich bitte Mutter Sera, mir den Eintrag über meine "
    "Mutter zu zeigen.",
    "",
    "Auf dem Rückweg treffe ich am Hafen Kapitän Lund vor seiner Kogge. Ich frage ihn, ob er nach "
    "Tolm ausläuft und einen Brief an Marr mitnehmen kann.",
    "Abends kommt Tomas zu mir herauf und erzählt, dass am Kai ein ertrunkener Fischer verabschiedet "
    "wurde. Ich frage ihn, wie die Leute gekleidet waren und wer der Tote war.",
]

SALZMARK_MIT_AT = [
    "@Pell kommt am nächsten Morgen in die Kammer. Ich schreibe ihm die Zeiten der Wachwechsel, die "
    "@Tomas noch kennt, auf einen Zettel und gebe ihn ihm.",
    "Spät am Abend sitzen @Tomas und ich unten bei @Gunda. @Gunda stellt uns einen Krug hin. Ich "
    "frage @Tomas nach seinem Bruder.",
    "Am nächsten Tag steige ich allein zum @Aschturm hinauf, um nach dem Totenbuch von 401 zu "
    "fragen. Eine junge Schwester öffnet mir die Pforte.",
    "Die Schwester führt mich zur Äbtissin. Ich bitte @Mutter Sera, mir den Eintrag über meine "
    "Mutter zu zeigen.",
    "",
    "Auf dem Rückweg treffe ich am Hafen @Kapitän Lund vor seiner Kogge. Ich frage ihn, ob er nach "
    "Tolm ausläuft und einen Brief an @Ysolde Marr mitnehmen kann.",
    "Abends kommt @Tomas zu mir herauf und erzählt, dass am Kai ein ertrunkener Fischer "
    "verabschiedet wurde. Ich frage ihn, wie die Leute gekleidet waren und wer der Tote war.",
]

GLIMMERGRUND_MIT_AT = [
    "Ich frage @Brack, wer von den Stollen unten auf der Tiefen Sohle zuletzt in Betrieb war und wie "
    "viele es dort überhaupt gab. @Brack antwortet kurz. Ich frage ihn, wer den Schlüssel zum neuen "
    "Schloss hat.",
    "Wir fahren hinauf. Im Hof lädt ein Fuhrmann aus dem Tal Fässer ab; ich frage ihn, wie lange er "
    "bis Unterwehr braucht. Dann gehe ich zu @Haller ins Maschinenhaus, weil er mir noch etwas "
    "über seine Maschine erzählen wollte.",
    "Am Abend bin ich beim Direktor @Farnow zum Essen eingeladen. Ich komme zur verabredeten Uhrzeit "
    "nach der Kirchenuhr. Nach dem Essen bringt seine Frau ein Getränk für alle.",
    "Zurück in der Nassen Sohle schiebt mir jemand eine Nachricht unter der Tür durch. Ich lese "
    "sie, dann schreibe ich @Lenka Vorst eine Antwort und bitte @Rosl, sie ihr zu bringen.",
    "",
    "Am nächsten Morgen gehe ich zu Doktor @Salm ins Lazarett und bitte ihn, mir zu beschreiben, "
    "wie die geborgenen Lampen der Toten aussahen, als man sie fand.",
    "Ich besuche am Abend @Bracks Haus und bringe einen Korb Äpfel mit. Seine Frau öffnet die Tür; "
    "ich sage ihr, warum ich komme, und bitte sie, ihren Mann zu holen.",
]

SALZMARK_PROBEN: list[Probe] = [
    {
        "eintrag": "pell-sund",
        "schritt": 1,
        "detail": "Pell kann weder lesen noch schreiben",
        "verstoss": "Pell liest den Zettel selbst oder schreibt etwas auf",
    },
    {
        "eintrag": "tomas-rehl",
        "schritt": 2,
        "detail": "Tomas trinkt keinen Alkohol (seit dem Tod seines Bruders)",
        "verstoss": "Tomas trinkt Bier, Wein, Branntwein oder nimmt den Krug ohne Ablehnung",
    },
    {
        "eintrag": "totensitte",
        "schritt": 2,
        "detail": "Nach Sonnenuntergang wird kein Toter beim Namen genannt (Jorin → „der vom "
        "Nordkai“, „mein Bruder“)",
        "verstoss": "Tomas oder jemand sagt am Abend „Jorin“ ohne Reaktion als Unglückszeichen",
    },
    {
        "eintrag": "schwester-mai",
        "schritt": 3,
        "detail": "Die Novizin spricht nicht (Schweigegelübde: Handzeichen, Schiefertafel)",
        "verstoss": "Die junge Schwester, die öffnet, spricht hörbar",
    },
    {
        "eintrag": "aschturm",
        "schritt": 3,
        "detail": "Treppe mit 312 Stufen; Archiv unter der Erde; nur Salzlampen, kein offenes Feuer",
        "verstoss": "andere Stufenzahl; Kerze, Fackel oder Öllampe im Archiv",
    },
    {
        "eintrag": "sera-kolb",
        "schritt": 4,
        "detail": "Seit 38 Jahren vollständig blind; liest nicht selbst, lässt vorlesen; erkennt "
        "an Stimme, Schritt, Geruch; sagt „Kind“",
        "verstoss": "Sera sieht, liest selbst, blickt jemanden prüfend an oder erkennt etwas mit "
        "den Augen",
    },
    {
        "eintrag": "salzeid",
        "schritt": 4,
        "detail": "Wer das Archiv betritt, schwört vorher einen Salzeid (nichts entfernen, nichts "
        "verändern)",
        "verstoss": "Ilka betritt das Archiv ohne Eid; ein anderer Eid oder Wortlaut",
    },
    {
        "eintrag": "oskar-lund",
        "schritt": 6,
        "detail": "Einäugig (rechtes Auge verloren), starker Tolmer Dialekt; Kogge „Möwenschrei“",
        "verstoss": "Lund sieht mit beiden Augen; anderes Auge fehlt; anderer Schiffsname",
    },
    {
        "eintrag": "totensitte",
        "schritt": 7,
        "detail": "Trauerfarbe ist Weiß; Tote werden dem Meer übergeben; abends kein Name des Toten",
        "verstoss": "Trauernde in Schwarz; Begräbnis in der Erde; Tomas nennt am Abend den Namen "
        "des Toten",
    },
    {
        "eintrag": "tomas-rehl",
        "schritt": 0,
        "detail": "Tomas nennt Ilka „Varn“, nie „Ilka“",
        "verstoss": "Tomas spricht Ilka mit „Ilka“ an",
    },
]

GLIMMERGRUND_PROBEN: list[Probe] = [
    {
        "eintrag": "bergmannsbrauch",
        "schritt": 1,
        "detail": "Unter Tage wird die Zahl Sieben nicht ausgesprochen („Sechs-und-eins“)",
        "verstoss": "„sieben“ oder „Stollen Sieben“ unter Tage ohne Folge",
    },
    {
        "eintrag": "hohe-berta",
        "schritt": 2,
        "detail": "Die Pumpe heißt „Hohe Berta“ / „Berta“",
        "verstoss": "Pumpe ohne den Namen oder mit anderem Namen, wenn Haller über sie spricht",
    },
    {
        "eintrag": "bergmannsbrauch",
        "schritt": 2,
        "detail": "Nie pfeifen (ein Pfiff ist Grubenalarm)",
        "verstoss": "jemand pfeift ohne Folge",
    },
    {
        "eintrag": "emil-farnow",
        "schritt": 3,
        "detail": "Farnows Uhr geht genau elf Minuten vor („Farnowzeit“)",
        "verstoss": "Uhr geht richtig, nach oder um eine andere Zeit vor; Termin ohne die elf "
        "Minuten",
    },
    {
        "eintrag": "konstanze-wendt",
        "schritt": 3,
        "detail": "Wendt trinkt niemals Kaffee",
        "verstoss": "Wendt trinkt oder lobt Kaffee; Kaffee als ihr Getränk",
    },
    {
        "eintrag": "lenka-vorst",
        "schritt": 4,
        "detail": "Linkshänderin, schreibt Spiegelschrift",
        "verstoss": "Lenkas Schrift gerade, sauber, mit rechts; ohne Spiegel lesbar",
    },
    {
        "eintrag": "benedikt-salm",
        "schritt": 6,
        "detail": "Rot-grün-farbenblind, verschweigt es",
        "verstoss": "Salm nennt Lampen sicher „rot“ oder „grün“",
    },
    {
        "eintrag": "glimmstein",
        "schritt": 6,
        "detail": "Glimmt nur nass, gold-grün; Rot heißt schlechte Luft",
        "verstoss": "Rot bedeutet etwas anderes; Stein glimmt trocken; Lampen blaken",
    },
    {
        "eintrag": "brack",
        "schritt": 7,
        "detail": "Nur „Brack“, kein Vorname",
        "verstoss": "Vorname erfunden; „Herr Brack“ ohne Widerspruch",
    },
    {
        "eintrag": "bergmannsbrauch",
        "schritt": 7,
        "detail": "Trauerfarbe Gelb, nicht Schwarz",
        "verstoss": "schwarze Binde, schwarzes Band, Trauer in Schwarz",
    },
    {
        "eintrag": "gasthaus-zur-nassen-sohle",
        "schritt": 0,
        "detail": "Bier nur in Steinkrügen mit Zinndeckel",
        "verstoss": "Bier in Gläsern oder Humpen ohne Deckel",
    },
    {
        "eintrag": "schichtbuch",
        "schritt": 0,
        "detail": "Einzelzettel liegt beim Bergamt, im Buch nur Lenkas Abschrift",
        "verstoss": "Original im Buch oder in Wendts Händen",
    },
]

PROBEN: dict[str, list[Probe]] = {
    "salzmark": SALZMARK_PROBEN,
    "glimmergrund": GLIMMERGRUND_PROBEN,
}
ANWEISUNGEN: dict[str, list[str] | None] = {
    # None: die Anweisungen der Ausgangsmessung (geschichten.py) gelten unverändert.
    "salzmark": SALZMARK_ANWEISUNGEN,
    "glimmergrund": None,
}
ANWEISUNGEN_MIT_AT: dict[str, list[str]] = {
    "salzmark": SALZMARK_MIT_AT,
    "glimmergrund": GLIMMERGRUND_MIT_AT,
}
