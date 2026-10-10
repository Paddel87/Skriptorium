"""Wirkungsprobe zu 5.6: wirkt eine atmosphärische Schreibweise, ohne die Kanon-Treue zu senken?

Dieselben Ketten wie in ``spikes/regel-002/lauf.py`` (beide Testgeschichten, sieben Anweisungen,
mehrere Wiederholungen), aber mit einem Block „Schreibweise“ direkt hinter der
Figuren-Schreibweise – dort, wo er nach dem Vorschlag für 5.6 stehen soll. Der Produktcode
bleibt unverändert: Der Block wird für die Probe an ``_writing_mode`` angehängt.

Varianten (Listenwerte vom Eigentümer übernommen, 2026-10-10):

- ``A``: Dark Romance; sinnlich, melancholisch; intim, schwül; langsam; poetisch, bildhaft;
  angedeutet.
- ``B``: Thriller; kalt, nüchtern; angespannt, gefährlich; atemlos; knapp, dialogreich;
  angedeutet.

Ohne Schreibweise dient die Ausgangsmessung aus 5.24 (``ausgang-mittel``) als Vergleich.

Aufruf (Cloud-Session mit gültigem ``OPENROUTER_API_KEY``):
    SCHREIBWEISE=A VARIANTE=schreibweise-a LAENGE=mittel LAEUFE=3 \\
        uv run python spikes/schreibweise-5.6/lauf.py
Ergebnisse unter ``spikes/regel-002/ergebnisse/<VARIANTE>/``; Auswertung mit
``spikes/regel-002/auswertung.py`` und ``spikes/schreibweise-5.6/stil.py``.
"""

import asyncio
import importlib.util
import os
import sys
from pathlib import Path

import skriptorium.context.builder as builder

SPIKES = Path(__file__).parent.parent

SCHREIBWEISEN = {
    "A": {
        "Genre": "Dark Romance",
        "Tonalität": "sinnlich, melancholisch",
        "Atmosphäre": "intim, schwül",
        "Tempo": "langsam",
        "Stil": "poetisch, bildhaft",
        "Deutlichkeit": "angedeutet",
    },
    "B": {
        "Genre": "Thriller",
        "Tonalität": "kalt, nüchtern",
        "Atmosphäre": "angespannt, gefährlich",
        "Tempo": "atemlos",
        "Stil": "knapp, dialogreich",
        "Deutlichkeit": "angedeutet",
    },
}


def block(values: dict[str, str]) -> str:
    """Der Block, wie er nach dem Vorschlag für 5.6 in der Anfrage stünde."""
    lines = "\n".join(f"- {key}: {value}" for key, value in values.items())
    return (
        "## Schreibweise\n\n"
        f"{lines}\n\n"
        "Halte diese Schreibweise in Wortwahl, Satzbau und Tempo ein. Sie tritt hinter den Kanon "
        "und die Figuren-Schreibweise zurück: Widerspricht sie einem Kanon-Eintrag oder der "
        "Führung einer Figur, gelten Kanon und Figuren-Schreibweise."
    )


def main() -> None:
    values = SCHREIBWEISEN[os.environ["SCHREIBWEISE"]]
    original = builder._writing_mode

    def with_style(story, by_id):  # type: ignore[no-untyped-def]
        return f"{original(story, by_id)}\n\n{block(values)}"

    builder._writing_mode = with_style  # type: ignore[assignment]
    spec = importlib.util.spec_from_file_location("lauf", SPIKES / "regel-002" / "lauf.py")
    assert spec is not None and spec.loader is not None
    lauf = importlib.util.module_from_spec(spec)
    sys.modules["lauf"] = lauf
    spec.loader.exec_module(lauf)
    asyncio.run(lauf.main())


if __name__ == "__main__":
    main()
