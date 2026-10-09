import type { CanonEntry } from "./api";

const WORD_CHARACTER = /[\p{L}\p{N}]/u;

/**
 * Canon entries named with `@` in an instruction (FR-013): `@` followed by the name or an alias
 * of an entry, case-insensitive, not inside a word and not followed by a letter or digit – except
 * a genitive „s“ (`@Kaels`, step 5.23). The longest name wins, so `@Kael der Alte` names that
 * entry and not `Kael`. Order of first mention, each entry once.
 */
export function referencedEntries(
  text: string,
  entries: readonly CanonEntry[],
): CanonEntry[] {
  const found = new Map<string, CanonEntry>();
  for (const mention of mentionRanges(text, entries)) {
    if (!found.has(mention.entry.id)) {
      found.set(mention.entry.id, mention.entry);
    }
  }
  return [...found.values()];
}

/** One recognised mention: from the `@` to the end of the name, and the entry it names. */
export interface Mention {
  from: number;
  to: number;
  entry: CanonEntry;
}

/**
 * Every recognised mention in the text, in order, by the rules of `referencedEntries` – the
 * places the instruction field highlights (step 5.18).
 */
export function mentionRanges(
  text: string,
  entries: readonly CanonEntry[],
): Mention[] {
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
  const found: Mention[] = [];
  for (let at = text.indexOf("@"); at !== -1; at = text.indexOf("@", at + 1)) {
    if (at > 0 && WORD_CHARACTER.test(text.charAt(at - 1))) {
      continue;
    }
    const rest = text.slice(at + 1);
    let length = 0;
    const hit = labels.find((item) => {
      if (
        rest.slice(0, item.label.length).toLocaleLowerCase("de") !== item.lower
      ) {
        return false;
      }
      length = labelEnd(rest, item.label.length);
      return length > 0;
    });
    if (hit !== undefined) {
      found.push({ from: at, to: at + 1 + length, entry: hit.entry });
    }
  }
  return found;
}

/**
 * Length of the mention when a name or alias of `length` characters starts `rest`: the name
 * itself if no letter or digit follows, the name with a genitive „s“ (`@Kaels Hammer`, owner,
 * step 5.23) if only that follows, otherwise 0 – the name is part of a longer word.
 */
function labelEnd(rest: string, length: number): number {
  if (!WORD_CHARACTER.test(rest.charAt(length))) {
    return length;
  }
  if (
    rest.charAt(length) === "s" &&
    !WORD_CHARACTER.test(rest.charAt(length + 1))
  ) {
    return length + 1;
  }
  return 0;
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
