/**
 * Timelines as a time line (step 7.2, ADR-069). Two forms, both left as written: a list of
 * events `- **Date:** What happened` inside one entry, or one timeline entry per event named
 * `Date – Title` (the owner's form). The view sorts by the first whole number in the date
 * ("395–398" → 395, "412, Spätherbst" → 412, "-40" → -40); files keep their order, and the AI
 * reads them as before.
 */

/** One list line of the entry; `date` is null for a list line without a leading date. */
export interface TimelineEvent {
  date: string | null;
  text: string;
  /** Sort key from the date; null when the date has no number or there is no date. */
  key: number | null;
}

// "- **412, Spätherbst:** text" or "- **412**: text"; the date holds no stars.
const EVENT = /^\s*[-*]\s+\*\*([^*]+?)(?::\*\*|\*\*:)\s*(.*)$/;
const ITEM = /^\s*[-*]\s+(.*)$/;
// A whole number not glued to a preceding digit; "−" (minus sign) counts like "-".
const NUMBER = /(?:^|[^\d])([-−]?\d+)/;

/** The sort key of a date, or null if it holds no number. */
export function sortKey(date: string): number | null {
  const found = NUMBER.exec(date);
  return found === null ? null : Number(found[1]?.replace("−", "-"));
}

/** The list lines of `body` as events, in the order of the file. */
export function timelineEvents(body: string): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  for (const line of body.split("\n")) {
    const event = EVENT.exec(line);
    if (event !== null) {
      const date = (event[1] ?? "").trim();
      events.push({ date, text: event[2] ?? "", key: sortKey(date) });
    } else {
      const item = ITEM.exec(line);
      if (item !== null) {
        events.push({ date: null, text: item[1] ?? "", key: null });
      }
    }
  }
  return events;
}

/** `body` without its list lines: headings and paragraphs around the time line. */
export function withoutEvents(body: string): string {
  return body
    .split("\n")
    .filter((line) => !ITEM.test(line))
    .join("\n");
}

/**
 * Events with a number first, by number; equal numbers keep the order of the file. Events
 * without a number follow in the order of the file.
 */
export function sortedEvents(
  events: readonly TimelineEvent[],
): TimelineEvent[] {
  const dated = events.filter((event) => event.key !== null);
  const loose = events.filter((event) => event.key === null);
  return [...dated.sort((a, b) => (a.key ?? 0) - (b.key ?? 0)), ...loose];
}

/**
 * `body` with a new event line: before the first event of the file with a later date, else
 * after the last event; at the end if there is no event yet. Line breaks in the input become
 * spaces, stars in the date are dropped, so the line stays one event.
 */
export function withEvent(body: string, date: string, text: string): string {
  const cleanDate = date.replace(/\*/g, "").replace(/\s+/g, " ").trim();
  const cleanText = text.replace(/\s+/g, " ").trim();
  const line = `- **${cleanDate}:** ${cleanText}`;
  const key = sortKey(cleanDate);
  const lines = body.replace(/\n+$/, "").split("\n");
  const eventAt = lines.flatMap((current, index) =>
    EVENT.test(current) ? [index] : [],
  );
  const last = eventAt.at(-1);
  if (last === undefined) {
    const kept = lines.join("\n");
    return `${kept}${kept === "" ? "" : "\n\n"}${line}\n`;
  }
  const later =
    key === null
      ? undefined
      : eventAt.find((index) => {
          const other = sortKey(
            (EVENT.exec(lines[index] ?? "") ?? [])[1] ?? "",
          );
          return other !== null && other > key;
        });
  lines.splice(later ?? last + 1, 0, line);
  return `${lines.join("\n")}\n`;
}

/** One timeline entry of the world as an event (the form `Date – Title`). */
export interface WorldEvent {
  id: string;
  date: string | null;
  title: string;
  text: string;
  key: number | null;
}

// "1999 – Titel", "1999 - Titel" or "1999: Titel"; the date part must hold a number.
const NAME_PARTS = /^\s*([^–—:]+?)\s*(?:[–—:]|\s-\s)\s*(.+)$/;

/** Date, title and text of a timeline entry; without a date in the name it is loose. */
export function entryEvent(entry: {
  id: string;
  name: string;
  body: string;
}): WorldEvent {
  const parts = NAME_PARTS.exec(entry.name);
  const date = parts?.[1]?.trim() ?? "";
  const key = parts === null ? null : sortKey(date);
  return {
    id: entry.id,
    date: key === null ? null : date,
    title: key === null ? entry.name : (parts?.[2] ?? "").trim(),
    text: eventText(entry.body),
    key,
  };
}

/** Longest text shown under an event of the world's time line. */
const TEXT_LIMIT = 200;

/**
 * The text under an event: for an entry holding a list of events, how many; else its words
 * without Markdown marks, cut after about 200 characters.
 */
function eventText(body: string): string {
  const listed = timelineEvents(body).filter((event) => event.date !== null);
  if (listed.length > 0) {
    return `${String(listed.length)} Ereignisse als Liste`;
  }
  const plain = body
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*|__|[*_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > TEXT_LIMIT
    ? `${plain.slice(0, TEXT_LIMIT).trimEnd()} …`
    : plain;
}

/** The world's timeline entries as events, sorted like the events of one entry. */
export function worldEvents(
  entries: readonly { id: string; name: string; body: string }[],
): WorldEvent[] {
  const events = entries.map(entryEvent);
  const dated = events.filter((event) => event.key !== null);
  const loose = events.filter((event) => event.key === null);
  return [...dated.sort((a, b) => (a.key ?? 0) - (b.key ?? 0)), ...loose];
}

/** The name of a new timeline entry in the owner's form. */
export function eventEntryName(date: string, title: string): string {
  const clean = (text: string) => text.replace(/\s+/g, " ").trim();
  return `${clean(date)} – ${clean(title)}`;
}
