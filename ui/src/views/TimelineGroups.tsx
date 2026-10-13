import type { ReactNode } from "react";
import { groupByTime, type TimeParts } from "../timeline";

/** "Jahr 412"; negative years with a minus sign: "Jahr −40". */
function yearHeading(year: number): string {
  return `Jahr ${year < 0 ? "−" : ""}${String(Math.abs(year))}`;
}

/** The small marks before an event: date, time of day, and what else the statement said. */
function Marks({ time }: { time: TimeParts }) {
  const marks = [time.dateMark, time.timeMark, time.rest].filter(
    (mark): mark is string => mark !== null,
  );
  return marks.length === 0 ? null : (
    <span className="timeline-marks">
      {marks.map((mark) => (
        <span key={mark} className="timeline-mark">
          {mark}
        </span>
      ))}
    </span>
  );
}

/**
 * Events as a time line grouped by year (step 8.10): a heading "Jahr 412" per year, then the
 * group "Ohne Jahr" (with a hint how to place its events), then the events without any time
 * statement. Each event shows marks for date and time of day; `render` gives its content.
 */
export function TimelineGroups<T extends { time: TimeParts }>({
  label,
  events,
  render,
  isChosen,
}: {
  label: string;
  events: readonly T[];
  render: (event: T) => ReactNode;
  isChosen?: (event: T) => boolean;
}) {
  const groups = groupByTime(events);
  const list = (name: string, items: readonly T[], loose: boolean) => (
    <ol className="timeline-events" aria-label={name}>
      {items.map((event, index) => {
        const chosen = isChosen?.(event) === true;
        return (
          <li
            key={index}
            className={[loose ? "loose" : "", chosen ? "chosen" : ""]
              .filter((name) => name !== "")
              .join(" ")}
          >
            {loose ? (
              <span className="timeline-marks">
                <span className="timeline-mark loose">
                  {event.time.rest ?? "ohne Zeitangabe"}
                </span>
              </span>
            ) : (
              <Marks time={event.time} />
            )}
            <span className="timeline-content">{render(event)}</span>
          </li>
        );
      })}
    </ol>
  );
  return (
    <div className="timeline-groups" role="group" aria-label={label}>
      {groups.years.map((group) => (
        <section key={group.year}>
          <h4 className="timeline-year">{yearHeading(group.year)}</h4>
          {list(yearHeading(group.year), group.events, false)}
        </section>
      ))}
      {groups.noYear.length > 0 && (
        <section>
          <h4 className="timeline-year">Ohne Jahr</h4>
          <p className="note">
            Mit einem Jahr davor (z. B. „412, 14:30 Uhr“) ordnet sich ein
            Ereignis ins Jahr ein.
          </p>
          {list("Ohne Jahr", groups.noYear, false)}
        </section>
      )}
      {groups.undated.length > 0 &&
        list("Ohne Zeitangabe", groups.undated, true)}
    </div>
  );
}
