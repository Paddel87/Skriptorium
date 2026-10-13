"""Import of world material and the SillyTavern formats (ADR-012, ADR-065, ADR-066)."""

from collections.abc import Mapping, Set

from skriptorium.canon.categories import Category
from skriptorium.canon.entries import EntryStore
from skriptorium.canon.importers import (
    TranslatedMaterial,
    card_for,
    lorebook_for,
    parse_markdown,
    translate_sillytavern,
)
from skriptorium.canon.models import ImportItem, ImportPreview, ImportResult
from skriptorium.canon.validation import checked_category
from skriptorium.canon.worlds import WorldStore
from skriptorium.storage import InvalidInput, slugify


class ImportStore:
    """Previews and applies imports of world material and converts SillyTavern files."""

    def __init__(self, worlds: WorldStore, entries: EntryStore) -> None:
        """Use ``worlds`` and ``entries`` to read and store what the material becomes."""
        self._worlds = worlds
        self._entries = entries

    def translate_sillytavern(self, world_id: str, data: bytes) -> TranslatedMaterial:
        """Import Markdown from a SillyTavern card or lorebook; nothing is stored."""
        self._worlds.get_world(world_id)
        return translate_sillytavern(data)

    def sillytavern_lorebook(self, world_id: str) -> dict[str, object]:
        """All entries of the world as a SillyTavern lorebook."""
        return lorebook_for(self._entries.list_entries(world_id))

    def sillytavern_card(self, world_id: str, entry_id: str) -> dict[str, object]:
        """A figure as a SillyTavern character card."""
        return card_for(self._entries.get_entry(world_id, entry_id))

    def preview_import(self, world_id: str, markdown: str) -> ImportPreview:
        """Split Markdown world material into entries without storing anything."""
        self._worlds.get_world(world_id)
        material = parse_markdown(markdown)
        existing = {entry.id for entry in self._entries.list_entries(world_id)}
        seen: set[str] = set()
        items: list[ImportItem] = []
        for parsed in material.entries:
            entry_id = slugify(parsed.name)
            conflict = None
            if entry_id in seen:
                conflict = "doppelt"
            elif entry_id in existing:
                conflict = "vorhanden"
            seen.add(entry_id)
            items.append(
                ImportItem(
                    id=entry_id,
                    name=parsed.name,
                    category=parsed.category,
                    aliases=parsed.aliases,
                    body=parsed.body,
                    conflict=conflict,
                )
            )
        return ImportPreview(
            world=world_id,
            introduction=material.introduction,
            items=tuple(items),
            not_taken_over=material.not_taken_over,
        )

    def apply_import(
        self,
        world_id: str,
        markdown: str,
        *,
        categories: Mapping[str, Category] | None = None,
        overwrite: Set[str] = frozenset(),
    ) -> ImportResult:
        """Take over the material as previewed by :meth:`preview_import`."""
        chosen = dict(categories or {})
        preview = self.preview_import(world_id, markdown)
        planned: list[tuple[ImportItem, Category]] = []
        skipped: list[str] = []
        for item in preview.items:
            if item.conflict is not None and item.id not in overwrite:
                skipped.append(item.id)
                continue
            category = chosen.get(item.id, item.category)
            if category is None:
                raise InvalidInput(f"Eintrag {item.name!r} hat keine Kategorie")
            planned.append((item, checked_category(category)))

        if preview.introduction:
            world = self._worlds.get_world(world_id)
            joined = "\n\n".join(
                p for p in (world.description.rstrip("\n"), preview.introduction) if p
            )
            self._worlds.update_world(world_id, description=joined)
        created: list[str] = []
        overwritten: list[str] = []
        for item, category in planned:
            if item.conflict is None:
                self._entries.create_entry(
                    world_id, category, item.name, aliases=item.aliases, body=item.body
                )
                created.append(item.id)
            else:
                self._entries.update_entry(
                    world_id,
                    item.id,
                    category=category,
                    name=item.name,
                    aliases=item.aliases,
                    body=item.body,
                )
                overwritten.append(item.id)
        return ImportResult(
            created=tuple(created), overwritten=tuple(overwritten), skipped=tuple(skipped)
        )
