import { Fragment, type ReactNode } from "react";
import type { CanonEntry } from "../api";
import { mentionRanges } from "../references";

/** Where `@Name` in the text leads: the entries of the world and what opening one does. */
export interface EntryLinks {
  entries: readonly CanonEntry[];
  onOpen: (entry: string) => void;
}

/**
 * The text of a canon entry for reading (step 5.11 part 3): headings, lists, paragraphs and
 * **bold** from the Markdown of the entry, built as React elements - no HTML from the text is
 * inserted. A first heading that repeats the entry's name is left out; the page shows the name.
 * Everything else stays as written. With `links`, an `@Name` that names an entry of the world
 * (name or alias, step 8.11, ADR-088) is a link to that entry; other `@` words stay text.
 */
export function EntryText({
  text,
  name,
  links,
}: {
  text: string;
  name: string;
  links?: EntryLinks;
}) {
  const blocks: ReactNode[] = [];
  // Open list and paragraph; in an object, so the helpers below may change them.
  const open: {
    items: { ordered: boolean; lines: string[] } | null;
    paragraph: string[];
  } = { items: null, paragraph: [] };

  function flushParagraph() {
    if (open.paragraph.length > 0) {
      blocks.push(
        <p key={blocks.length}>{inline(open.paragraph.join(" "), links)}</p>,
      );
      open.paragraph = [];
    }
  }
  function flushItems() {
    const items = open.items;
    if (items !== null) {
      const children = items.lines.map((line, index) => (
        <li key={index}>{inline(line, links)}</li>
      ));
      blocks.push(
        items.ordered ? (
          <ol key={blocks.length}>{children}</ol>
        ) : (
          <ul key={blocks.length}>{children}</ul>
        ),
      );
      open.items = null;
    }
  }

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (heading !== null) {
      flushParagraph();
      flushItems();
      const title = heading[2] ?? "";
      if (blocks.length === 0 && title === name) {
        continue;
      }
      blocks.push(<h3 key={blocks.length}>{inline(title, links)}</h3>);
    } else if (bullet !== null || numbered !== null) {
      flushParagraph();
      const ordered = numbered !== null;
      if (open.items !== null && open.items.ordered !== ordered) {
        flushItems();
      }
      open.items ??= { ordered, lines: [] };
      open.items.lines.push((bullet ?? numbered)?.[1] ?? "");
    } else if (line === "") {
      flushParagraph();
      flushItems();
    } else {
      flushItems();
      open.paragraph.push(line);
    }
  }
  flushParagraph();
  flushItems();
  return <div className="entry-read">{blocks}</div>;
}

/** `**bold**` within a line, `@Name` as links; unmatched stars stay as they are. */
function inline(text: string, links: EntryLinks | undefined): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .filter((part) => part !== "")
    .map((part, index) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
        <strong key={index}>{linked(part.slice(2, -2), links)}</strong>
      ) : (
        <Fragment key={index}>{linked(part, links)}</Fragment>
      ),
    );
}

/** The text with every `@Name` of an entry of the world as a button that opens the entry. */
function linked(text: string, links: EntryLinks | undefined): ReactNode[] {
  if (links === undefined) {
    return [text];
  }
  const nodes: ReactNode[] = [];
  let at = 0;
  for (const mention of mentionRanges(text, links.entries)) {
    nodes.push(text.slice(at, mention.from));
    nodes.push(
      <button
        key={mention.from}
        type="button"
        className="link"
        onClick={() => {
          links.onOpen(mention.entry.id);
        }}
      >
        {text.slice(mention.from, mention.to)}
      </button>,
    );
    at = mention.to;
  }
  nodes.push(text.slice(at));
  return nodes;
}
