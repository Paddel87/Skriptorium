import { CATEGORIES, type CanonEntry } from "../api";
import { incomingOf } from "../relations";
import type { EntryLinks } from "./EntryText";

/**
 * „Verweise hierher“ below a canon entry (step 9.4, ADR-093): the relations other entries of
 * the world hold to it, with their kind, and the entries that name it with `@` elsewhere in
 * their text. Computed from the entries on display; nothing is stored. Without any, nothing
 * is shown.
 */
export function IncomingLinks({
  current,
  links,
}: {
  current: CanonEntry;
  links: EntryLinks;
}) {
  const { relations, mentions } = incomingOf(current, links.entries);
  if (relations.length === 0 && mentions.length === 0) {
    return null;
  }
  function open(entry: CanonEntry) {
    return (
      <button
        type="button"
        className="link"
        onClick={() => {
          links.onOpen(entry.id);
        }}
      >
        {entry.name}
      </button>
    );
  }
  return (
    <section className="incoming" aria-label="Verweise hierher">
      <h3>Verweise hierher</h3>
      {relations.length > 0 && (
        <>
          <p className="note">Beziehungen</p>
          <ul>
            {relations.map((relation, index) => (
              <li key={index}>
                {open(relation.from)}
                {relation.kind !== "" && ` – ${relation.kind}`}
              </li>
            ))}
          </ul>
        </>
      )}
      {mentions.length > 0 && (
        <>
          <p className="note">Erwähnt in</p>
          <ul>
            {mentions.map((entry) => (
              <li key={entry.id}>
                {open(entry)}{" "}
                <span className="note">
                  ({CATEGORIES.find((c) => c.id === entry.category)?.label})
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
