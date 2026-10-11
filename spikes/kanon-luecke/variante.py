"""Variante des Spikes 6.13: die Auffüllung mit nicht genannten Kanon-Einträgen abschalten.

Bei langen Kapiteln füllen die letzten Seiten das Budget, und die Auffüllung (Kanon-Einträge,
die weder Regel, Zeitlinie, ``@``-Verweis noch geführte Figur sind) bleibt leer (5.26, D.4,
ADR-057). Dieselbe Lage stellt der Spike bei gleichem Text her, indem er die Auffüllung
leer lässt – der Produktcode bleibt unverändert, ersetzt wird nur die Funktion im Modul.
"""

import os

import skriptorium.context.builder as builder


def apply() -> str:
    """Setzt die Variante aus ``AUFFUELLUNG`` (``mit`` oder ``ohne``) und gibt sie zurück."""
    variant = os.environ.get("AUFFUELLUNG", "mit")
    if variant == "ohne":
        builder._filler_parts = lambda request, remaining: []  # type: ignore[assignment]
    elif variant != "mit":
        raise SystemExit(f"AUFFUELLUNG muss mit oder ohne sein, nicht {variant!r}")
    return variant
