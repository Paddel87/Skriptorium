"""Requests of the world builder (roadmap step 6.7, ADR-064, FR-029).

The author talks with the AI about one world to draft new canon entries or improve existing
ones. The system message holds the frame (role, the import format for proposals), the world
description, the names of all entries, the rules and the timeline in full (step 8.7, ADR-086,
as when writing) and the entries named with ``@`` in full. The
conversation follows as messages; the latest one always goes along, older ones only as long as
they fit the budget, newest first. Nothing is stored: proposals reach the canon only through
the import preview in the interface.
"""

import math
from collections.abc import Sequence
from typing import Final

from skriptorium.canon import (
    APPEARANCE,
    RELATIONS,
    SECTIONS,
    CanonEntry,
    CanonService,
    Category,
    InvalidInput,
    NotFound,
)
from skriptorium.context.manuscript_hits import ManuscriptHits
from skriptorium.context.parts import (
    CATEGORY_LABELS,
    ENTRY_BODY_LEVEL,
    MAX_BUDGET,
    SAFETY_MARGIN,
    BuiltContext,
    ContextTooLarge,
    Part,
    PromptMessage,
    Role,
    check_budget,
    in_category_order,
    render,
)

# Fence the interface looks for to hand a proposal to the import preview (step 6.7).
PROPOSAL_FENCE: Final = "kanon"
# Group headings of the import format, in the order of the categories.
_GROUP_NAMES: Final[dict[Category, str]] = {
    "figur": "Figuren",
    "ort": "Orte",
    "gegenstand": "Gegenstände",
    "zeitlinie": "Zeitlinie",
    "regel": "Regeln",
    "kultur": "Kultur",
}
_GROUPS: Final = ", ".join(_GROUP_NAMES.values())


def build_worldbuilder(
    canon: CanonService,
    world_id: str,
    conversation: Sequence[tuple[Role, str]],
    references: Sequence[str] = (),
    budget: int = MAX_BUDGET,
    hits: ManuscriptHits | None = None,
) -> BuiltContext:
    """Build the request for the next answer of the world builder.

    ``conversation`` holds the turns so far, oldest first, as ``("user" | "assistant", text)``;
    the last turn is the author's. ``references`` are identifiers of entries of the world named
    with ``@``. ``hits`` are passages of the manuscript about one name (step 8.9, ADR-087);
    without any passage nothing is added.

    Raises:
        InvalidInput: Budget outside 1-30,000, no turn, or the last turn is not the author's.
        NotFound: World or a referenced entry does not exist.
        ContextTooLarge: Frame, world, entries and the latest turn do not fit the budget.
    """
    check_budget(budget)
    if not conversation or conversation[-1][0] != "user" or not conversation[-1][1].strip():
        raise InvalidInput("Die letzte Nachricht muss vom Autor sein")
    world = canon.get_world(world_id)
    entries = canon.list_entries(world_id)
    by_id = {entry.id: entry for entry in entries}
    named = []
    for reference in references:
        if reference not in by_id:
            raise NotFound(reference)
        if by_id[reference] not in named:
            named.append(by_id[reference])
    # Rules and timeline always go along in full, as when writing (step 8.7, ADR-086); an
    # entry named with "@" that is one of them is not repeated.
    laws: list[Part] = []
    in_laws: list[CanonEntry] = []
    for kind in ("regel", "zeitlinie"):
        for entry in in_category_order(entries):
            if entry.category == kind:
                laws.append(Part(kind, entry.name, render(entry)))
                in_laws.append(entry)
    system = [
        Part("rahmen", "Rahmen", _frame(world.name)),
        Part("welt", world.name, f"# Welt: {world.name}\n\n{world.description}".strip()),
        Part("eintraege", "Einträge der Welt", _index(entries)),
        *laws,
        *(
            [Part("fundstellen", f"Fundstellen zu {hits.name}", hits.text)]
            if hits is not None and hits.passages
            else []
        ),
        *(Part("verweis", entry.name, render(entry)) for entry in named if entry not in in_laws),
    ]
    turns = [Part("gespraech", role, text.strip()) for role, text in conversation]
    capacity = math.floor(budget / SAFETY_MARGIN)
    needed = sum(part.block.tokens for part in [*system, turns[-1]])
    if needed > capacity:
        largest = sorted((part.block for part in [*system, turns[-1]]), key=lambda b: -b.tokens)
        raise ContextTooLarge(budget, math.ceil(needed * SAFETY_MARGIN), largest[:3])
    remaining = capacity - needed
    kept = [turns[-1]]
    for part in reversed(turns[:-1]):
        if part.block.tokens > remaining:
            break
        kept.insert(0, part)
        remaining -= part.block.tokens
    # A conversation sent to the model starts with the author.
    while kept and kept[0].label != "user":
        kept.pop(0)
    messages = [PromptMessage("system", "\n\n".join(part.text for part in system))]
    messages += [PromptMessage(_role(part.label), part.text) for part in kept]
    blocks = tuple(part.block for part in [*system, *kept])
    return BuiltContext(
        messages=tuple(messages),
        blocks=blocks,
        estimated_tokens=math.ceil(sum(block.tokens for block in blocks) * SAFETY_MARGIN),
        missing_characters=(),
    )


def _role(label: str) -> Role:
    return "assistant" if label == "assistant" else "user"


def _index(entries: Sequence[CanonEntry]) -> str:
    """Names, categories and aliases of all entries, so the AI invents nothing twice."""
    if not entries:
        return "# Einträge der Welt\n\nNoch keine."
    lines = []
    for entry in in_category_order(entries):
        aliases = f"; auch: {', '.join(entry.aliases)}" if entry.aliases else ""
        lines.append(f"- {entry.name} ({CATEGORY_LABELS[entry.category]}{aliases})")
    return "# Einträge der Welt (nur Namen)\n\n" + "\n".join(lines)


def _section_rules() -> str:
    """The sections of each category as the frame asks for them, from ``SECTIONS`` (ADR-092).

    Relations stand on both sides, one line with one ``@Name`` each (ADR-093).
    """
    level = "#" * ENTRY_BODY_LEVEL
    per_group = "".join(
        f"  - {_GROUP_NAMES[category]}: " + ", ".join(f"`{level} {name}`" for name in names) + "\n"
        for category, names in SECTIONS.items()
    )
    example = "".join(f"  {level} {name}\n  …\n" for name in SECTIONS["figur"])
    return (
        "- Jeder Eintrag gliedert sich in die Abschnitte seiner Art, als Unterüberschriften der "
        f"Ebene {ENTRY_BODY_LEVEL} (eine Ebene tiefer als der Name). Ein kurzer freier Text "
        "direkt unter dem Namen ist erlaubt. Lass einen Abschnitt weg, wenn dazu nichts bekannt "
        "ist; erfinde nichts, um ihn zu füllen. Regeln und die Zeitlinie haben keine "
        f"Abschnitte. Die Abschnitte in dieser Reihenfolge:\n{per_group}"
        f"- Der Abschnitt `{level} {APPEARANCE}` enthält nur das Äußere (Gesicht, Haare, Statur, "
        "Kleidung, Haltung, sichtbare Merkmale); alles andere gehört in die übrigen Abschnitte.\n"
        f"- Im Abschnitt `{level} {RELATIONS}` steht je Beziehung eine Listenzeile mit genau einem "
        "`@Name` (Name oder Alias), die Art der Beziehung davor, z. B. `- verheiratet mit @Kael`. "
        "Schreibe jede Beziehung auf beiden Seiten: Legst du mehrere Figuren an oder überarbeitest "
        "sie, steht die Gegenseite im Eintrag der anderen Figur. Ist die andere Figur schon im "
        "Kanon, überarbeite sie nur, wenn ihr vollständiger Text oben steht; sonst nenne die "
        "Gegenseite im Gespräch, damit der Autor sie ergänzt.\n"
        "- Beispiel einer Figur:\n\n"
        f"  # Figuren\n  ## Name der Figur\n  Aliasse: Zweitname\n{example}\n"
    )


def _frame(world_name: str) -> str:
    """Role of the AI and the format of proposals to take over (step 6.7, ADR-064)."""
    return (
        f"# Rahmen\n\nDu bist Weltenbauer für die fiktive Welt „{world_name}“ des Autors. Du "
        "hilfst ihm, Kanon-Einträge zu entwerfen und vorhandene besser auszuformulieren. Der "
        "Autor entscheidet, was gilt: Frage nach, wenn etwas offen ist, und biete bei neuen Ideen "
        "zwei oder drei Varianten an. Widersprich nie dem vorhandenen Kanon; fällt dir ein "
        "Widerspruch auf, nenne ihn. Erfinde über vorhandene Einträge nichts hinzu, ohne es als "
        "Vorschlag kenntlich zu machen. Hast du Suchergebnisse aus dem Netz, übernimm nur, was "
        "zur Welt passt, und sag, was du übernommen hast.\n\n"
        "# Vorschläge zur Übernahme\n\n"
        "Schlägst du Einträge vor, die der Autor in den Kanon übernehmen kann (neu oder "
        "überarbeitet), setze sie ans Ende deiner Antwort in genau einen Block, der mit "
        f"```{PROPOSAL_FENCE} beginnt und mit ``` endet. Im Block gilt:\n\n"
        f"- Gruppen-Überschriften der Ebene 1, nur diese Wörter: {_GROUPS}.\n"
        "- Jeder Eintrag ist eine Überschrift der Ebene 2 mit seinem Namen; bei einer "
        "Überarbeitung genau der vorhandene Name.\n"
        "- Gibt es andere Namen, folgt direkt darunter eine Zeile `Aliasse: Name2, Name3`.\n"
        f"{_section_rules()}"
        "- Sachlich, im Präsens, etwa 80 bis 250 Wörter je Eintrag; bei einer Überarbeitung der "
        "vollständige neue Text, nicht nur die Änderung.\n"
        "- Keine Tabellen, kein HTML.\n"
        "- Betrifft ein Sachverhalt mehrere Einträge, verteile ihn auf die passenden Einträge "
        "und verweise mit `@Name` (Name oder Alias) von einem auf den anderen. Eine Regel, die "
        "nur an einem Ort gilt, bekommt im Text die Zeile `Gilt nur in: @Ort`.\n\n"
        "Außerhalb des Blocks antwortest du ganz normal im Gespräch. Ohne Vorschlag zur "
        "Übernahme gibt es keinen Block."
    )
