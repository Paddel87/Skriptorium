/**
 * Sections of a Markdown text (step 8.4, ADR-083). A section starts at a heading of any level
 * (`#` to `######`) and reaches up to the next heading of the same or a higher level, so
 * subsections (`### Kleidung` under `## Aussehen`) belong to it. All functions are pure and leave
 * everything outside the section as it was, byte for byte (line endings, blank lines).
 */

const HEADING = /^(#{1,6})[ \t]+(.*?)[ \t]*$/;

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
  const match = HEADING.exec(line.replace(/\r?\n$/, ""));
  if (match === null) {
    return null;
  }
  return { level: (match[1] ?? "").length, text: match[2] ?? "" };
}

function isBlank(line: string): boolean {
  return line.trim() === "";
}

function same(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** All sections called `heading` (any case, any level), in order. */
function sectionsNamed(lines: readonly string[], heading: string): Found[] {
  const found: Found[] = [];
  lines.forEach((line, start) => {
    const head = headingOf(line);
    if (head === null || !same(head.text, heading)) {
      return;
    }
    let end = start + 1;
    while (end < lines.length) {
      const next = headingOf(lines[end] ?? "");
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
