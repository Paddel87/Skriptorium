/**
 * Sections of a Markdown text (step 8.4, ADR-083). A section starts at a heading of any level
 * (`#` to `######`) and reaches up to the next heading of the same or a higher level, so
 * subsections (`### Kleidung` under `## Aussehen`) belong to it. A closing run of `#` after a
 * space is not part of the heading text; headings inside fenced code blocks do not count (step
 * 9.1). All functions are pure and leave everything outside the section as it was, byte for byte
 * (line endings, blank lines).
 *
 * The same rule as `canon/sections.py` in the server (step 9.1, ADR-091, rule 003); both sides are
 * checked against the shared cases in `tests/shared/sections.json`.
 */

import type { Category } from "./api/canon";

/** The looks of a figure, a place or an item (ADR-078, ADR-092); a fixed section of those. */
export const APPEARANCE = "Aussehen";

/**
 * The fixed sections of an entry by category, in order (ADR-092): the list of `SECTIONS` in
 * `canon/sections.py`, a test couples both to `tests/shared/sections.json` (rule 003). Rules and
 * the timeline have none.
 */
export const SECTIONS: Readonly<Partial<Record<Category, readonly string[]>>> =
  {
    figur: [APPEARANCE, "Wesen", "Fähigkeiten", "Geschichte", "Beziehungen"],
    ort: ["Lage", APPEARANCE, "Bewohner", "Geschichte"],
    gegenstand: [APPEARANCE, "Zweck", "Verwendung", "Auswirkung"],
    kultur: ["Gesellschaft", "Glaube und Bräuche", "Geschichte"],
  };

/** The empty sections of a new entry of `category`, or `""` if it has none (as the server's). */
export function templateFor(category: Category): string {
  const names = SECTIONS[category] ?? [];
  return names.length === 0
    ? ""
    : `${names.map((name) => `## ${name}`).join("\n\n")}\n`;
}

// Only the start is a pattern; the rest is cut with string operations, because a pattern for the
// closing hashes backtracks on long runs of spaces (as in the server, review of step 6.8).
const HEADING_START = /^(#{1,6})[ \t]+/;
const FENCE = /^[ \t]*(?:```|~~~)/;
const LINE_BREAK = /[\r\u2028\u2029]/;

/** What to do with a section that already has text. */
export type SectionMode = "replace" | "append";

interface Found {
  /** Index of the heading line. */
  start: number;
  /** Index after the last line of the section. */
  end: number;
  /** Heading level, 1 to 6. */
  level: number;
}

/** The lines of a text, each with its line ending. */
function linesOf(markdown: string): string[] {
  return markdown.match(/[^\n]*\n|[^\n]+$/g) ?? [];
}

function headingOf(line: string): { level: number; text: string } | null {
  const bare = line.replace(/\r?\n$/, "");
  const start = HEADING_START.exec(bare);
  if (start === null) {
    return null;
  }
  const rest = bare.slice(start[0].length);
  if (LINE_BREAK.test(rest)) {
    return null;
  }
  const level = (start[1] ?? "").length;
  const text = trimTabsAndSpaces(rest);
  const open = trimHashes(text);
  if (open === "") {
    return { level, text: "" };
  }
  return open !== text && /[ \t]$/.test(open)
    ? { level, text: trimTabsAndSpaces(open) }
    : { level, text };
}

/** Level and text of each line that is a heading, outside fenced code blocks. */
function headingsOf(
  lines: readonly string[],
): ({ level: number; text: string } | null)[] {
  let inFence = false;
  return lines.map((line) => {
    if (FENCE.test(line)) {
      inFence = !inFence;
      return null;
    }
    return inFence ? null : headingOf(line);
  });
}

function trimTabsAndSpaces(text: string): string {
  let end = text.length;
  while (end > 0 && (text[end - 1] === " " || text[end - 1] === "\t")) {
    end -= 1;
  }
  return text.slice(0, end);
}

function trimHashes(text: string): string {
  let end = text.length;
  while (end > 0 && text[end - 1] === "#") {
    end -= 1;
  }
  return text.slice(0, end);
}

function isBlank(line: string): boolean {
  return line.trim() === "";
}

function same(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** All sections called `heading` (any case, any level), in order. */
function sectionsNamed(lines: readonly string[], heading: string): Found[] {
  const headings = headingsOf(lines);
  const found: Found[] = [];
  headings.forEach((head, start) => {
    if (head === null || !same(head.text, heading)) {
      return;
    }
    let end = start + 1;
    while (end < lines.length) {
      const next = headings[end] ?? null;
      if (next !== null && next.level <= head.level) {
        break;
      }
      end += 1;
    }
    found.push({ start, end, level: head.level });
  });
  return found;
}

function bodyOf(lines: readonly string[], section: Found): string {
  return lines
    .slice(section.start + 1, section.end)
    .join("")
    .trim();
}

function endingOf(markdown: string): string {
  return markdown.includes("\r\n") ? "\r\n" : "\n";
}

/** The first section called `heading` that has text, or `null` (leading and trailing blanks cut). */
export function readSection(markdown: string, heading: string): string | null {
  const lines = linesOf(markdown);
  for (const section of sectionsNamed(lines, heading)) {
    const text = bodyOf(lines, section);
    if (text !== "") {
      return text;
    }
  }
  return null;
}

/** The text after a list label such as `- **Aussehen:** …`, or `null` without one (7.16). */
export function readLabelled(markdown: string, label: string): string | null {
  for (const line of markdown.split("\n")) {
    const plain = line
      .replace(/^\s*[-*]\s+/, "")
      .replace(/\*\*/g, "")
      .trim();
    if (plain.toLowerCase().startsWith(`${label.toLowerCase()}:`)) {
      const text = plain.slice(label.length + 1).trim();
      return text === "" ? null : text;
    }
  }
  return null;
}

/** A part of an entry: the section `name`, else the labelled line, else `null` (step 9.1). */
export function readPart(markdown: string, name: string): string | null {
  return readSection(markdown, name) ?? readLabelled(markdown, name);
}

/** `markdown` with a new `## heading` section at its end, separated by a blank line. */
export function appendSection(
  markdown: string,
  heading: string,
  text: string,
): string {
  const eol = endingOf(markdown);
  const before = markdown.trimEnd();
  const section = `## ${heading}${eol}${eol}${text.trim()}${eol}`;
  return before === "" ? section : `${before}${eol}${eol}${section}`;
}

/**
 * Puts `text` into the section `heading`: the first one with text (else the first one) takes it,
 * replacing what was there or below it (`mode`); empty duplicates are removed, so afterwards only
 * one is left. Without such a section, one is appended.
 */
export function putSection(
  markdown: string,
  heading: string,
  text: string,
  mode: SectionMode,
): string {
  const lines = linesOf(markdown);
  const found = sectionsNamed(lines, heading);
  const target = found.find((one) => bodyOf(lines, one) !== "") ?? found[0];
  if (target === undefined) {
    return appendSection(markdown, heading, text);
  }
  const gone = outermost(found).filter(
    (one) =>
      one !== target &&
      bodyOf(lines, one) === "" &&
      !(one.start > target.start && one.start < target.end),
  );
  const eol = endingOf(markdown);
  const head = lines[target.start] ?? "";
  const body = lines.slice(target.start + 1, target.end);
  let last = body.length;
  while (last > 0 && isBlank(body[last - 1] ?? "")) {
    last -= 1;
  }
  const kept = mode === "append" ? body.slice(0, last) : [];
  const gap = body.slice(last);
  const followed = lines.some(
    (_, at) =>
      at >= target.end && !gone.some((one) => at >= one.start && at < one.end),
  );
  if (gap.length === 0 && followed) {
    gap.push(eol);
  }
  const block = [
    head.endsWith("\n") ? head : `${head}${eol}`,
    ...(mode === "append"
      ? [...kept.slice(0, -1), terminated(kept.at(-1) ?? "", eol), eol]
      : [eol]),
    `${text.trim()}${eol}`,
    ...gap,
  ];
  return rebuild(lines, [
    { from: target.start, to: target.end, block },
    ...gone.map((one) => ({ from: one.start, to: one.end, block: [] })),
  ]);
}

/** `markdown` without the sections called `heading` (all of them). */
export function removeSection(markdown: string, heading: string): string {
  const lines = linesOf(markdown);
  const found = sectionsNamed(lines, heading);
  if (found.length === 0) {
    return markdown;
  }
  const result = rebuild(
    lines,
    outermost(found).map((one) => ({
      from: one.start,
      to: one.end,
      block: [],
    })),
  );
  const cutAtEnd = found.some((one) => one.end === lines.length);
  const trimmed = result.trimEnd();
  return cutAtEnd && trimmed !== ""
    ? `${trimmed}${endingOf(markdown)}`
    : result;
}

/** The sections called `from` get the heading text `to`; their level stays. */
export function renameSection(
  markdown: string,
  from: string,
  to: string,
): string {
  const lines = linesOf(markdown);
  const found = sectionsNamed(lines, from);
  if (found.length === 0) {
    return markdown;
  }
  const renamed = [...lines];
  for (const section of found) {
    const line = lines[section.start] ?? "";
    const ending = /\r?\n$/.exec(line)?.[0] ?? "";
    renamed[section.start] = `${"#".repeat(section.level)} ${to}${ending}`;
  }
  return renamed.join("");
}

/** Without the sections that lie inside another one of the list. */
function outermost(found: readonly Found[]): Found[] {
  return found.filter(
    (one) =>
      !found.some(
        (other) =>
          other !== one && other.start < one.start && one.start < other.end,
      ),
  );
}

function terminated(line: string, eol: string): string {
  return line === "" || line.endsWith("\n") ? line : `${line}${eol}`;
}

/** The lines with the given ranges replaced; ranges must not overlap. */
function rebuild(
  lines: readonly string[],
  edits: readonly { from: number; to: number; block: readonly string[] }[],
): string {
  const ordered = [...edits].sort((a, b) => a.from - b.from);
  const out: string[] = [];
  let at = 0;
  for (const edit of ordered) {
    out.push(...lines.slice(at, edit.from), ...edit.block);
    at = edit.to;
  }
  out.push(...lines.slice(at));
  return out.join("");
}
