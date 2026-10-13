import { useState, type SyntheticEvent } from "react";
import { api, describeError, type CanonEntry } from "../api";
import { eventEntryName, worldEvents } from "../timeline";
import { ErrorText } from "./Common";
import { TimelineGroups } from "./TimelineGroups";

/**
 * The world's timeline entries as one time line (step 7.2, ADR-069; the owner's form: one entry
 * per event, named `Date – Title`). A tap on an event opens its entry. With `editable`,
 * "+ Ereignis" creates a new timeline entry in that form.
 */
export function WorldTimeline({
  world,
  entries,
  selected,
  editable,
  onChoose,
  onCreated,
}: {
  world: string;
  /** The timeline entries shown (search and filter applied). */
  entries: readonly CanonEntry[];
  selected: string | null;
  editable: boolean;
  onChoose: (entry: string) => void;
  onCreated: (entry: CanonEntry) => void;
}) {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const events = worldEvents(entries);

  async function add(event: SyntheticEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const entry = await api.createEntry(world, {
        category: "zeitlinie",
        name: eventEntryName(date, title),
        aliases: [],
        status: null,
        body: text.trim() === "" ? "" : `${text.trim()}\n`,
      });
      setDate("");
      setTitle("");
      setText("");
      onCreated(entry);
    } catch (reason: unknown) {
      setError(describeError(reason));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="timeline">
      <TimelineGroups
        label="Zeitstrahl der Welt"
        events={events}
        isChosen={(item) => item.id === selected}
        render={(item) => (
          <>
            <button
              type="button"
              className="link timeline-title"
              aria-current={item.id === selected ? "true" : undefined}
              onClick={() => {
                onChoose(item.id);
              }}
            >
              {item.title}
            </button>
            {item.text !== "" && (
              <span className="timeline-text">{item.text}</span>
            )}
          </>
        )}
      />
      {editable && (
        <form
          className="timeline-add timeline-add-entry"
          onSubmit={(event) => void add(event)}
        >
          <input
            aria-label="Jahr"
            placeholder="Zeit"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
            }}
          />
          <input
            aria-label="Titel"
            placeholder="Titel des Ereignisses"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
          />
          <textarea
            aria-label="Was geschah?"
            placeholder="Was geschah? (ein, zwei Sätze)"
            rows={2}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
            }}
          />
          <button
            type="submit"
            disabled={saving || date.trim() === "" || title.trim() === ""}
          >
            + Ereignis
          </button>
        </form>
      )}
      <ErrorText message={error} />
    </div>
  );
}
