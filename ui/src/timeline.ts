/**
 * Timeline entries as a time line (step 7.2, ADR-069). The entry stays Markdown text: a list
 * of events `- **Date:** What happened`, the date in the world's own reckoning. The view sorts
 * by the first whole number in the date ("395–398" → 395, "412, Spätherbst" → 412, "-40" → -40);
 * the file keeps its order, and the AI reads it as before.
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
