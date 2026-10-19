import { api, CATEGORIES, type CanonEntry } from "../api";
import { useState } from "react";
import { appearanceOf } from "../imagePrompts";
import { AppearanceExtract } from "./AppearanceExtract";
import { EntryImages } from "./EntryImages";
import { EntryText } from "./EntryText";
import { IncomingLinks } from "./IncomingLinks";
import { timelineEvents } from "../timeline";
import { TimelineView } from "./TimelineView";

/**
 * A canon entry to read. Guests (entries of another world) cannot be changed here; the
 * character card download is offered outside the compact bar (step 6.9). A timeline entry
 * holding a list of dated events reads as a time line, with "+ Ereignis" outside the compact
 * bar (step 7.2); a timeline entry for a single event reads as text. The entry's images stand
 * above the text; they are changed outside the compact bar (step 7.6). Below the text stand the
 * entries of the world that refer to this one (step 9.4, ADR-093).
 */
export function EntryArticle({
  world,
  current,
  compact,
  entries,
  onOpen,
  onEdit,
  onSaved,
}: {
  world: string;
  current: CanonEntry;
  compact: boolean;
  /** The entries shown with the world; an `@Name` of the text that names one is a link. */
  entries?: readonly CanonEntry[];
  /** Opens the entry a link names (step 8.11, ADR-088). */
  onOpen?: (entry: string) => void;
  onEdit: () => void;
  /** Called after the entry was changed here (an event added to a timeline, an image). */
  onSaved: () => void;
}) {
  const guest = current.world !== world;
  const links =
    guest || entries === undefined || onOpen === undefined
      ? undefined
      : { entries: entries.filter((entry) => entry.world === world), onOpen };
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
      <EntryImages
        entry={current}
        editable={!compact && !guest}
        onChanged={() => {
          onSaved();
        }}
      />
      {!compact && !guest && current.category === "figur" && (
        <AppearanceButton
          entry={current}
          onChanged={() => {
            onSaved();
          }}
        />
      )}
      {current.category === "zeitlinie" &&
      timelineEvents(current.body).some((event) => event.date !== null) ? (
        <TimelineView
          entry={current}
          editable={!compact && !guest}
          onSaved={onSaved}
        />
      ) : (
        <EntryText text={current.body} name={current.name} links={links} />
      )}
      {links !== undefined && <IncomingLinks current={current} links={links} />}
    </article>
  );
}

/**
 * "✨ Aussehen herauslösen" for a figure without a section "Aussehen" (step 7.16, ADR-078);
 * hidden once the entry names its looks.
 */
function AppearanceButton({
  entry,
  onChanged,
}: {
  entry: CanonEntry;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  if (!open && appearanceOf(entry.body) !== null) {
    return null;
  }
  return open ? (
    <AppearanceExtract
      entry={entry}
      onChanged={onChanged}
      onClose={() => {
        setOpen(false);
      }}
    />
  ) : (
    <p className="row appearance-hint">
      <button
        type="button"
        className="ghost"
        onClick={() => {
          setOpen(true);
        }}
      >
        ✨ Aussehen herauslösen
      </button>
      <span className="note">– noch kein Abschnitt „Aussehen“</span>
    </p>
  );
}
