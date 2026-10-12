import { api, CATEGORIES, type CanonEntry } from "../api";
import { EntryText } from "./EntryText";
import { TimelineView } from "./TimelineView";

/**
 * A canon entry to read. Guests (entries of another world) cannot be changed here; the
 * character card download is offered outside the compact bar (step 6.9). A timeline entry
 * reads as a time line, with "+ Ereignis" outside the compact bar (step 7.2).
 */
export function EntryArticle({
  world,
  current,
  compact,
  onEdit,
  onSaved,
}: {
  world: string;
  current: CanonEntry;
  compact: boolean;
  onEdit: () => void;
  /** Called after the entry was changed here (an event added to a timeline). */
  onSaved: () => void;
}) {
  const guest = current.world !== world;
  return (
    <article>
      <div className="row">
        <h2>{current.name}</h2>
        {!guest && (
          <button
            type="button"
            onClick={() => {
              onEdit();
            }}
          >
            Bearbeiten
          </button>
        )}
        {!compact && !guest && current.category === "figur" && (
          <a
            className="button"
            href={api.cardPath(world, current.id)}
            download={`${current.id}.card.json`}
          >
            ⇩ Figurenkarte
          </a>
        )}
      </div>
      {guest && (
        <p className="note">
          Gast aus einer anderen Welt – nur in deren Kanon zu ändern.
        </p>
      )}
      <p className="note">
        {CATEGORIES.find((c) => c.id === current.category)?.label}
        {current.aliases.length > 0 && ` · Auch: ${current.aliases.join(", ")}`}
        {current.status !== null && ` · ${current.status}`}
      </p>
      {current.category === "zeitlinie" ? (
        <TimelineView
          entry={current}
          editable={!compact && !guest}
          onSaved={onSaved}
        />
      ) : (
        <EntryText text={current.body} name={current.name} />
      )}
    </article>
  );
}
