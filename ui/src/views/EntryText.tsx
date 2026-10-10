import type { ReactNode } from "react";

/**
 * The text of a canon entry for reading (step 5.11 part 3): headings, lists, paragraphs and
 * **bold** from the Markdown of the entry, built as React elements - no HTML from the text is
 * inserted. A first heading that repeats the entry's name is left out; the page shows the name.
 * Everything else stays as written.
 */
export function EntryText({ text, name }: { text: string; name: string }) {
  const blocks: ReactNode[] = [];
  // Open list and paragraph; in an object, so the helpers below may change them.
  const open: {
    items: { ordered: boolean; lines: string[] } | null;
    paragraph: string[];
  } = { items: null, paragraph: [] };

  function flushParagraph() {
    if (open.paragraph.length > 0) {
      blocks.push(
        <p key={blocks.length}>{inline(open.paragraph.join(" "))}</p>,
      );
      open.paragraph = [];
    }
  }
  function flushItems() {
    const items = open.items;
    if (items !== null) {
      const children = items.lines.map((line, index) => (
        <li key={index}>{inline(line)}</li>
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
      blocks.push(<h3 key={blocks.length}>{inline(title)}</h3>);
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

/** `**bold**` within a line; unmatched stars stay as they are. */
function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .filter((part) => part !== "")
    .map((part, index) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : (
        part
      ),
    );
}
