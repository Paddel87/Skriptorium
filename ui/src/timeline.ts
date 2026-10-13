/**
 * Timelines as a time line (step 7.2, ADR-069; time details step 8.10). Two forms, both left as
 * written: a list of events `- **Date:** What happened` inside one entry, or one timeline entry
 * per event named `Date – Title` (the owner's form). The view recognises what a time statement
 * holds (year, date, time of day, in any order) and sorts by it; files keep their order, and the
 * AI reads them as before.
 */

/** What was recognised in the time statement of an event. */
export interface TimeParts {
  year: number | null;
  month: number | null;
  day: number | null;
  /** Minutes since midnight. */
  minutes: number | null;
  /** The recognised date as written without the year ("3.5.", "3. Mai"). */
  dateMark: string | null;
  /** The recognised time of day as written ("14:30 Uhr"). */
  timeMark: string | null;
  /** What is left of the statement ("Spätherbst", "bis 398"); the whole text if nothing matched. */
  rest: string | null;
}

/** One list line of the entry; `date` is null for a list line without a leading date. */
export interface TimelineEvent {
  date: string | null;
  text: string;
  time: TimeParts;
}

// "- **412, Spätherbst:** text" or "- **412**: text"; the date holds no stars.
const EVENT = /^\s*[-*]\s+\*\*([^*]+?)(?::\*\*|\*\*:)\s*(.*)$/;
const ITEM = /^\s*[-*]\s+(.*)$/;

const MONTHS: readonly (readonly [string, number])[] = [
  ["jan", 1],
  ["jän", 1],
  ["feb", 2],
  ["mär", 3],
  ["apr", 4],
  ["mai", 5],
  ["jun", 6],
  ["jul", 7],
  ["aug", 8],
  ["sep", 9],
  ["okt", 10],
  ["nov", 11],
  ["dez", 12],
];
const MONTH_NAME =
  "Januar|Jänner|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|Jan|Jän|Feb|Mär|Apr|Jun|Jul|Aug|Sept|Sep|Okt|Nov|Dez";

const CLOCK =
  /(?<![\d:.])([01]?\d|2[0-3]):([0-5]\d)(?![\d:])(?:\s*Uhr(?!\p{L}))?/u;
const HOUR = /(?<![\d:.])([01]?\d|2[0-3])\s*Uhr(?!\p{L})/u;
const DOTTED = /(?<![\d.:])(\d{1,2})\.(\d{1,2})\.(?:([-−]?\d+)(?!\d))?/;
const NAMED = new RegExp(
  `(?<![\\d.:])(\\d{1,2})\\.\\s*(${MONTH_NAME})(?!\\p{L})\\.?`,
  "iu",
);
// A whole number, not glued to a time or to a dotted date, not an hour ("25 Uhr").
const YEAR = /(?<![\d:]|\d\.)([-−]?\d+)(?!\d|:|\.\d|\s*Uhr)/;
const SPAN = /^\s*[–—-]\s*(\d+)(?!\d)/;

const NONE: TimeParts = {
  year: null,
  month: null,
  day: null,
  minutes: null,
  dateMark: null,
  timeMark: null,
  rest: null,
};

/** The year, month, day and time of day a time statement holds; see the step 8.10 rules. */
export function parseTime(statement: string): TimeParts {
  let work = statement;
  const cut = (found: RegExpExecArray): string => {
    work = `${work.slice(0, found.index)} ${work.slice(found.index + found[0].length)}`;
    return found[0].trim();
  };
  let minutes: number | null = null;
  let timeMark: string | null = null;
  const clock = CLOCK.exec(work);
  if (clock !== null) {
    minutes = Number(clock[1]) * 60 + Number(clock[2]);
    timeMark = cut(clock);
  } else {
    const hour = HOUR.exec(work);
    if (hour !== null) {
      minutes = Number(hour[1]) * 60;
      timeMark = cut(hour);
    }
  }

  let year: number | null = null;
  let month: number | null = null;
  let day: number | null = null;
  let dateMark: string | null = null;
  const dotted = DOTTED.exec(work);
  const named = dotted === null ? NAMED.exec(work) : null;
  if (dotted !== null) {
    const d = Number(dotted[1]);
    const m = Number(dotted[2]);
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
      day = d;
      month = m;
      dateMark = `${String(d)}.${String(m)}.`;
      if (dotted[3] !== undefined) {
        year = Number(dotted[3].replace("−", "-"));
      }
      cut(dotted);
    }
  } else if (named !== null) {
    const d = Number(named[1]);
    const prefix = (named[2] ?? "").slice(0, 3).toLowerCase();
    const m = MONTHS.find(([name]) => name === prefix)?.[1] ?? null;
    if (d >= 1 && d <= 31 && m !== null) {
      day = d;
      month = m;
      dateMark = cut(named).replace(/\.$/, "");
    }
  }

  const extra: string[] = [];
  if (year === null) {
    const found = YEAR.exec(work);
    if (found !== null) {
      year = Number((found[1] ?? "").replace("−", "-"));
      const after = work.slice(found.index + found[0].length);
      const span = SPAN.exec(after);
      work = `${work.slice(0, found.index)} ${span === null ? after : after.slice(span[0].length)}`;
      if (span !== null) {
        extra.push(`bis ${span[1] ?? ""}`);
      }
    }
  }
  const rest = [
    ...work.split(/\s+/).filter((token) => !/^[,;:–—-]*$/.test(token)),
    ...extra,
  ]
    .join(" ")
    .replace(/^[,;:.]+|[,;:]+$/g, "")
    .trim();
  return {
    year,
    month,
    day,
    minutes,
    dateMark,
    timeMark,
    rest: rest === "" ? null : rest,
  };
}

/** True if any time information was recognised. */
export function isTimed(time: TimeParts): boolean {
  return (
    time.year !== null ||
    time.month !== null ||
    time.day !== null ||
    time.minutes !== null
  );
}

/** The sort key of a date (its year), or null if it holds none. */
export function sortKey(date: string): number | null {
  return parseTime(date).year;
}

/** 0: with a year, 1: without a year but with date or time, 2: no time statement. */
function rank(time: TimeParts): number {
  if (time.year !== null) {
    return 0;
  }
  return isTimed(time) ? 1 : 2;
}

/** Order of time statements; missing parts come before present ones, equal ones are equal. */
export function compareTime(a: TimeParts, b: TimeParts): number {
  const ranks = Math.sign(rank(a) - rank(b));
  if (ranks !== 0 || rank(a) === 2) {
    return ranks;
  }
  const value = (n: number | null) => n ?? Number.NEGATIVE_INFINITY;
  for (const part of ["year", "month", "day", "minutes"] as const) {
    if (value(a[part]) !== value(b[part])) {
      return value(a[part]) < value(b[part]) ? -1 : 1;
    }
  }
  return 0;
}

/** `events` ordered by time statement; equal ones and the undated ones keep their order. */
export function sortByTime<T extends { time: TimeParts }>(
  events: readonly T[],
): T[] {
  return [...events].sort((a, b) => compareTime(a.time, b.time));
}

/** Events grouped for display: by year, then those without a year, then without any time. */
export interface TimelineGroups<T> {
  years: { year: number; events: T[] }[];
  noYear: T[];
  undated: T[];
}

export function groupByTime<T extends { time: TimeParts }>(
  events: readonly T[],
): TimelineGroups<T> {
  const groups: TimelineGroups<T> = { years: [], noYear: [], undated: [] };
  for (const event of sortByTime(events)) {
    const year = event.time.year;
    if (year !== null) {
      const last = groups.years.at(-1);
      if (last?.year === year) {
        last.events.push(event);
      } else {
        groups.years.push({ year, events: [event] });
      }
    } else if (isTimed(event.time)) {
      groups.noYear.push(event);
    } else {
      groups.undated.push(event);
    }
  }
  return groups;
}

/** The list lines of `body` as events, in the order of the file. */
export function timelineEvents(body: string): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  for (const line of body.split("\n")) {
    const event = EVENT.exec(line);
    if (event !== null) {
      const date = (event[1] ?? "").trim();
      events.push({ date, text: event[2] ?? "", time: parseTime(date) });
    } else {
      const item = ITEM.exec(line);
      if (item !== null) {
        events.push({ date: null, text: item[1] ?? "", time: NONE });
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

/** Events in the order of the time line: by year, those without a year, those without time. */
export function sortedEvents(
  events: readonly TimelineEvent[],
): TimelineEvent[] {
  return sortByTime(events);
}

/**
 * `body` with a new event line: before the first event of the file with a later date, else
 * after the last event (an event without a time statement always); at the end if there is no event yet. Line breaks in the input become
 * spaces, stars in the date are dropped, so the line stays one event.
 */
export function withEvent(body: string, date: string, text: string): string {
  const cleanDate = date.replace(/\*/g, "").replace(/\s+/g, " ").trim();
  const cleanText = text.replace(/\s+/g, " ").trim();
  const line = `- **${cleanDate}:** ${cleanText}`;
  const time = parseTime(cleanDate);
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
    rank(time) === 2
      ? undefined
      : eventAt.find((index) => {
          const other = parseTime(
            (EVENT.exec(lines[index] ?? "") ?? [])[1] ?? "",
          );
          return rank(other) < 2 && compareTime(other, time) > 0;
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
  time: TimeParts;
}

// "1999 – Titel", "1999 - Titel" (spaced dash) or "1999: Titel"; the date part must hold a
// time statement. "14:30 Uhr – Titel" keeps its colon: only a colon before a space splits.
const NAME_DASH = /^\s*(.+?)\s+(?:[–—]|-)\s+(.+)$/;
const NAME_COLON = /^\s*(.+?):\s+(.+)$/;

/** Date, title and text of a timeline entry; without a date in the name it is loose. */
export function entryEvent(entry: {
  id: string;
  name: string;
  body: string;
}): WorldEvent {
  const parts = NAME_DASH.exec(entry.name) ?? NAME_COLON.exec(entry.name);
  const date = parts?.[1]?.trim() ?? "";
  const time = parts === null ? NONE : parseTime(date);
  const timed = isTimed(time);
  return {
    id: entry.id,
    date: timed ? date : null,
    title: timed ? (parts?.[2] ?? "").trim() : entry.name,
    text: eventText(entry.body),
    time: timed ? time : NONE,
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
  return sortByTime(entries.map(entryEvent));
}

/** The name of a new timeline entry in the owner's form. */
export function eventEntryName(date: string, title: string): string {
  const clean = (text: string) => text.replace(/\s+/g, " ").trim();
  return `${clean(date)} – ${clean(title)}`;
}
