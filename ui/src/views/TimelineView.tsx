import { useState, type SyntheticEvent } from "react";
import { api, describeError, type CanonEntry } from "../api";
import {
  sortedEvents,
  timelineEvents,
  withEvent,
  withoutEvents,
} from "../timeline";
import { ErrorText } from "./Common";
import { EntryText } from "./EntryText";
import { TimelineGroups } from "./TimelineGroups";

/**
 * A timeline entry as a time line (step 7.2, ADR-069): its list of events grouped by year (step 8.10),
 * headings and paragraphs above as written; "als Text" shows the entry as before. With
 * `editable`, "+ Ereignis" writes a new event into the entry at the fitting place and saves it.
 */
export function TimelineView({
  entry,
  editable,
  onSaved,
}: {
  entry: CanonEntry;
  editable: boolean;
  onSaved: () => void;
}) {
  const [asText, setAsText] = useState(false);
  const [date, setDate] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const events = sortedEvents(timelineEvents(entry.body));

  async function add(event: SyntheticEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.updateEntry(entry.world, entry.id, {
        body: withEvent(entry.body, date, text),
      });
      setDate("");
      setText("");
      onSaved();
    } catch (reason: unknown) {
      setError(describeError(reason));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="timeline">
      <p className="note timeline-switch">
        <button
          type="button"
          className="link"
          aria-pressed={!asText}
          onClick={() => {
            setAsText(false);
          }}
        >
          Zeitstrahl
        </button>
        {" · "}
        <button
          type="button"
          className="link"
          aria-pressed={asText}
          onClick={() => {
            setAsText(true);
          }}
        >
          als Text
        </button>
      </p>
      {asText ? (
        <EntryText text={entry.body} name={entry.name} />
      ) : (
        <>
          <EntryText text={withoutEvents(entry.body)} name={entry.name} />
          {events.length > 0 && (
            <TimelineGroups
              label="Zeitstrahl"
              events={events}
              render={(item) => <span>{item.text}</span>}
            />
          )}
        </>
      )}
      {editable && (
        <form className="timeline-add" onSubmit={(event) => void add(event)}>
          <input
            aria-label="Datum"
            placeholder="Zeit, z. B. 412 oder 14:30 Uhr"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
            }}
          />
          <input
            aria-label="Ereignis"
            placeholder="Was geschah?"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
            }}
          />
          <button
            type="submit"
            disabled={saving || date.trim() === "" || text.trim() === ""}
          >
            + Ereignis
          </button>
        </form>
      )}
      <ErrorText message={error} />
    </div>
  );
}
