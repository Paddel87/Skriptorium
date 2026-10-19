import type { CanonEntry } from "./api";
import { mentionRanges } from "./references";
import { readSection, RELATIONS } from "./sections";

/**
 * Relations between canon entries (step 9.4, ADR-093). In the section „Beziehungen“ each list
 * line with exactly one `@Name` of an entry of the world is a relation: the name is its target,
 * the rest of the line its kind, as the author wrote it (`- verheiratet mit @Kael`). Lines
 * without or with several names stay plain text. Section and names follow the shared rules
 * (`sections.ts`, `references.ts`, rule 003); nothing is stored, the other side is computed.
 */

/** One relation of an entry: what kind (may be empty) and to which entry. */
export interface Relation {
  kind: string;
  entry: CanonEntry;
}

/** Who refers to an entry: relations of other entries to it, and other entries naming it. */
export interface Incoming {
  relations: { from: CanonEntry; kind: string }[];
  mentions: CanonEntry[];
}

const LIST_ITEM = /^\s*(?:[-*]|\d+[.)])\s+(.*)$/;
// Marks and punctuation left at the ends of a kind once the name is cut out.
const EDGE = /^[\s:,;.–—-]+|[\s:,;.–—-]+$/g;
// A kind written wholly in brackets after the name: `@Kael (Ehemann)`.
const BRACKETED = /^\(([^()]*)\)$/;

/** The relations in the section „Beziehungen“ of `body`, in order. */
export function relationsOf(
  body: string,
  entries: readonly CanonEntry[],
): Relation[] {
  const section = readSection(body, RELATIONS);
  if (section === null) {
    return [];
  }
  const found: Relation[] = [];
  for (const line of section.split("\n")) {
    const item = LIST_ITEM.exec(line)?.[1];
    if (item === undefined) {
      continue;
    }
    const mentions = mentionRanges(item, entries);
    const [mention] = mentions;
    if (mention === undefined || mentions.length > 1) {
      continue;
    }
    found.push({
      kind: kindOf(`${item.slice(0, mention.from)} ${item.slice(mention.to)}`),
      entry: mention.entry,
    });
  }
  return found;
}

/**
 * Entries of `entries` (one world) that refer to `target`: their relations to it with the kind,
 * else - if their text names it with `@` anywhere - as a mention. In the order of `entries`;
 * the target itself is left out.
 */
export function incomingOf(
  target: CanonEntry,
  entries: readonly CanonEntry[],
): Incoming {
  const incoming: Incoming = { relations: [], mentions: [] };
  for (const entry of entries) {
    if (entry.id === target.id) {
      continue;
    }
    const relations = relationsOf(entry.body, entries).filter(
      (relation) => relation.entry.id === target.id,
    );
    if (relations.length > 0) {
      for (const relation of relations) {
        incoming.relations.push({ from: entry, kind: relation.kind });
      }
    } else if (
      mentionRanges(entry.body, entries).some(
        (mention) => mention.entry.id === target.id,
      )
    ) {
      incoming.mentions.push(entry);
    }
  }
  return incoming;
}

/**
 * The kind as written: without bold marks, spaces collapsed, no punctuation at the ends, and
 * without brackets around all of it.
 */
function kindOf(text: string): string {
  const kind = text
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .replace(/ ([,;.])/g, "$1")
    .replace(EDGE, "");
  return (BRACKETED.exec(kind)?.[1] ?? kind).trim();
}
