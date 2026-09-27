import type { CanonEntry } from "./api";

const WORD_CHARACTER = /[\p{L}\p{N}]/u;

/**
 * Canon entries named with `@` in an instruction (FR-013): `@` followed by the name or an alias
 * of an entry, case-insensitive, not inside a word and not followed by a letter or digit. The
 * longest name wins, so `@Kael der Alte` names that entry and not `Kael`. Order of first
 * mention, each entry once.
 */
export function referencedEntries(
  text: string,
  entries: readonly CanonEntry[],
): CanonEntry[] {
  const labels = entries
    .flatMap((entry) =>
      [entry.name, ...entry.aliases].map((label) => ({
        label,
        lower: label.toLocaleLowerCase("de"),
        entry,
      })),
    )
    .filter((item) => item.label !== "")
    .sort((a, b) => b.label.length - a.label.length);
  const found = new Map<string, CanonEntry>();
  for (let at = text.indexOf("@"); at !== -1; at = text.indexOf("@", at + 1)) {
    if (at > 0 && WORD_CHARACTER.test(text.charAt(at - 1))) {
      continue;
    }
    const rest = text.slice(at + 1);
    const hit = labels.find(
      (item) =>
        rest.slice(0, item.label.length).toLocaleLowerCase("de") ===
          item.lower && !WORD_CHARACTER.test(rest.charAt(item.label.length)),
    );
    if (hit !== undefined && !found.has(hit.entry.id)) {
      found.set(hit.entry.id, hit.entry);
    }
  }
  return [...found.values()];
}

/** One line of the `@` menu: a name or alias and the entry it belongs to. */
export interface MenuItem {
  label: string;
  entry: CanonEntry;
}

/**
 * Menu lines for the text typed after `@`: names and aliases starting with it,
 * case-insensitive, sorted alphabetically. Empty text offers every entry by name.
 */
export function menuItems(
  typed: string,
  entries: readonly CanonEntry[],
): MenuItem[] {
  const prefix = typed.toLocaleLowerCase("de");
  const items =
    prefix === ""
      ? entries.map((entry) => ({ label: entry.name, entry }))
      : entries.flatMap((entry) =>
          [entry.name, ...entry.aliases]
            .filter((label) => label.toLocaleLowerCase("de").startsWith(prefix))
            .map((label) => ({ label, entry })),
        );
  return items.sort((a, b) => a.label.localeCompare(b.label, "de"));
}
