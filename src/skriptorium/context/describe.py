"""Requests that let the AI describe one image once (roadmap step 7.13, ADR-074, FR-035).

The image itself is not part of the text: ``api`` attaches it to the user message. This module
only words the task by kind (a figure's looks, another entry's appearance, a map's geography)
and insists on describing only what can be seen. Nothing is stored; the author takes the text
over into the canon after checking it.
"""

from typing import Final

from skriptorium.canon import CanonService, NotFound
from skriptorium.context.parts import (
    CATEGORY_LABELS,
    MAX_BUDGET,
    BuiltContext,
    Part,
    check_budget,
    fitted,
)

_FRAME: Final = (
    "Du beschreibst ein Bild für den Kanon einer erzählten Welt. Beschreibe nur, was im Bild zu "
    "sehen ist. Erfinde keine Namen, Vorgeschichten, Gedanken oder Eigenschaften, die man nicht "
    "sieht. Wo etwas unsicher ist, etwa Alter oder Herkunft, schreibe vorsichtig "
    "(„wirkt wie …“). Schreibe auf Deutsch in ganzen Sätzen, als Fließtext ohne Überschrift, "
    "ohne Einleitung und ohne Schlussbemerkung."
)
_ASK: Final = "Beschreibe das Bild."


def build_entry_image_description(
    canon: CanonService, world_id: str, entry_id: str, image: str, budget: int = MAX_BUDGET
) -> BuiltContext:
    """Request to describe an image of a canon entry: looks of a figure, else its appearance.

    Raises:
        NotFound: World, entry or image (at this entry) does not exist.
        InvalidInput: Budget outside 1-30,000.
    """
    check_budget(budget)
    entry = canon.get_entry(world_id, entry_id)
    if image not in entry.images:
        raise NotFound(f"{world_id}/{entry_id}/bilder")
    if entry.category == "figur":
        task = (
            f"Das Bild zeigt die Figur „{entry.name}“. Beschreibe ihr Aussehen: Gesicht, Haare, "
            "Statur, Kleidung, Haltung und Auftreten. Höchstens etwa 200 Wörter."
        )
    else:
        task = (
            f"Das Bild gehört zum Eintrag „{entry.name}“ ({CATEGORY_LABELS[entry.category]}). "
            "Beschreibe, wie es aussieht: Form, Farben, Material, Zustand, Umgebung und "
            "Stimmung. Höchstens etwa 200 Wörter."
        )
    return _request(task, budget)


def build_map_description(
    canon: CanonService, world_id: str, file: str, budget: int = MAX_BUDGET
) -> BuiltContext:
    """Request to describe a map of a world as geography in words.

    Raises:
        NotFound: The world or the map does not exist.
        InvalidInput: Budget outside 1-30,000.
    """
    check_budget(budget)
    world = canon.get_world(world_id)
    found = next((m for m in world.maps if m.file == file), None)
    if found is None:
        raise NotFound(f"{world_id}/karten")
    task = (
        f"Das Bild ist die Karte „{found.name}“ der Welt „{world.name}“. Beschreibe die "
        "Geografie so, dass jemand ohne die Karte die Lage versteht: Landmassen, Küsten, "
        "Gewässer, Gebirge, Wälder, Orte und Wege, ihre Lage zueinander nach Himmelsrichtungen "
        "und, wenn ein Maßstab zu sehen ist, ungefähre Entfernungen. Übernimm Beschriftungen "
        "genau so, wie sie auf der Karte stehen. Höchstens etwa 400 Wörter."
    )
    return _request(task, budget)


def _request(task: str, budget: int) -> BuiltContext:
    return fitted(
        [Part("rahmen", "Rahmen", _FRAME), Part("anweisung", "Aufgabe", task)],
        [Part("anweisung", "Anweisung", _ASK)],
        budget,
    )
