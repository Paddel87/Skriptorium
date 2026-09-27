import type { CanonEntry } from "./api";

const WORD_CHARACTER = /[\p{L}\p{N}]/u;

/** A marked passage of at most this many words is taken as the name of a new entry. */
export const NAME_WORDS = 4;

/** What the "in den Kanon" form offers first for a marked passage (step 3.8, FR-015). */
export interface FactSuggestion {
  /** The entry named in the passage, to be supplemented; `null` suggests a new entry. */
  entry: CanonEntry | null;
  /** Name of a new entry: the passage itself if it is short, otherwise empty. */
  name: string;
  /** Text of a new entry: the passage, unless it became the name. */
  body: string;
}

/**
 * Suggest a target for a marked passage without asking the AI: an entry whose name or alias
 * appears in it (see {@link mentionedEntry}); otherwise a new entry, named after the passage
 * if it is at most {@link NAME_WORDS} words on one line.
 */
export function suggestFact(
  marked: string,
  entries: readonly CanonEntry[],
): FactSuggestion {
  const text = marked.trim();
  const entry = mentionedEntry(text, entries);
  const short = stripPunctuation(text);
  if (
    !text.includes("\n") &&
    short !== "" &&
    short.split(/\s+/u).length <= NAME_WORDS
  ) {
    return { entry, name: short, body: "" };
  }
  return { entry, name: "", body: text };
}

/**
 * The entry mentioned first in `text` by its name or an alias, case-insensitive and as a whole
 * word; at the same position the longest name wins (as with `@` references). `null` if none.
 */
export function mentionedEntry(
  text: string,
  entries: readonly CanonEntry[],
): CanonEntry | null {
  const lower = text.toLocaleLowerCase("de");
  let best: { at: number; length: number; entry: CanonEntry } | null = null;
  for (const entry of entries) {
    for (const label of [entry.name, ...entry.aliases]) {
      const at = wholeWordIndex(lower, label.toLocaleLowerCase("de"));
      if (
        at !== -1 &&
        (best === null ||
          at < best.at ||
          (at === best.at && label.length > best.length))
      ) {
        best = { at, length: label.length, entry };
      }
    }
  }
  return best?.entry ?? null;
}

/** The body of a canon entry with `addition` as a new paragraph at its end. */
export function appendParagraph(body: string, addition: string): string {
  const own = body.trimEnd();
  const added = addition.trim();
  return own === "" ? added : `${own}\n\n${added}`;
}

/** A story fact is one line in the AI context (`- Name: fact`), so line breaks become spaces. */
export function oneLine(text: string): string {
  return text.trim().replace(/\s+/gu, " ");
}

function wholeWordIndex(text: string, label: string): number {
  if (label === "") {
    return -1;
  }
  for (
    let at = text.indexOf(label);
    at !== -1;
    at = text.indexOf(label, at + 1)
  ) {
    const before = at === 0 ? "" : text.charAt(at - 1);
    const after = text.charAt(at + label.length);
    if (!WORD_CHARACTER.test(before) && !WORD_CHARACTER.test(after)) {
      return at;
    }
  }
  return -1;
}

function stripPunctuation(text: string): string {
  return text.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}
