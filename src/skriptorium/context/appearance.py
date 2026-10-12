"""Request that takes the looks of a figure out of its canon entry (step 7.16, ADR-078).

The model reads the entry once and writes only what can be seen: face, hair, build, clothing,
bearing, visible marks. Character, history and relations stay out. It invents nothing; without
any statement about looks it answers with the fixed marker :data:`NO_APPEARANCE`. Nothing is
stored; the author takes the text over as the section "Aussehen".
"""

from typing import Final

from skriptorium.canon import CanonService
from skriptorium.context.parts import MAX_BUDGET, BuiltContext, Part, check_budget, fitted

NO_APPEARANCE: Final = "KEIN AUSSEHEN"

_FRAME: Final = (
    "Du liest den Kanon-Eintrag einer Figur aus einer erzählten Welt und schreibst nur ihr "
    "äußeres Erscheinungsbild heraus: Gesicht, Haare, Augen, Statur, Größe, sichtbares Alter, "
    "Kleidung, typische Haltung und sichtbare Merkmale wie Narben, Tätowierungen oder Schmuck. "
    "Lass Wesen, Gedanken, Gewohnheiten, Fähigkeiten, Vorgeschichte und Beziehungen weg. "
    "Übernimm nur, was im Eintrag steht, und erfinde nichts dazu. Schreibe auf Deutsch in "
    "ganzen Sätzen, als Fließtext ohne Überschrift, ohne Einleitung, höchstens etwa 120 Wörter. "
    f"Steht im Eintrag nichts über das Äußere, antworte genau: {NO_APPEARANCE}"
)


def build_appearance(
    canon: CanonService, world_id: str, entry_id: str, budget: int = MAX_BUDGET
) -> BuiltContext:
    """Request to write out the looks of a figure from its entry.

    Raises:
        NotFound: The world or the entry does not exist.
        InvalidInput: Budget outside 1-30,000.
        ContextTooLarge: The entry does not fit the budget.
    """
    check_budget(budget)
    entry = canon.get_entry(world_id, entry_id)
    text = f"# {entry.name}\n\n{entry.body.strip()}".strip()
    return fitted(
        [Part("rahmen", "Rahmen", _FRAME)],
        [Part("eintraege", "Eintrag", text)],
        budget,
    )
