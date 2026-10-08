import { useCallback, useState } from "react";
import { CATEGORIES, type CanonEntry, type GuestLink } from "../api";
import { loadStoryEntries } from "../storyEntries";
import { useLoad } from "../useLoad";
import { ErrorText } from "./Common";

/**
 * Look up the canon while writing (step 5.11): search the entries of the story's world and its
 * guests by name and alias and read one, without leaving the chapter. Read only; changes are
 * made on the canon page. The text is shown as plain text, never as HTML.
 */
export function CanonLookup({
  world,
  guests,
}: {
  world: string;
  guests: readonly GuestLink[];
}) {
  const load = useCallback(
    () => loadStoryEntries(world, guests),
    [world, guests],
  );
  const { data, error } = useLoad(load);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<CanonEntry | null>(null);

  const entries = matching(data ?? [], query);

  if (open !== null) {
    return (
      <article className="stack lookup" aria-label={`Kanon: ${open.name}`}>
        <div className="row">
          <button
            type="button"
            className="link"
            onClick={() => {
              setOpen(null);
            }}
          >
            ← Zur Liste
          </button>
        </div>
        <h4>{open.name}</h4>
        <p className="note">
          {categoryLabel(open)}
          {open.world !== world && " · Gast"}
          {open.aliases.length > 0 && ` · ${open.aliases.join(", ")}`}
          {open.status !== null && ` · ${open.status}`}
        </p>
        <p className="entry-text">{open.body}</p>
      </article>
    );
  }
  return (
    <div className="stack lookup">
      <input
        type="search"
        aria-label="Kanon durchsuchen"
        placeholder="Name oder Alias"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
      />
      <ErrorText message={error} />
      {data !== undefined && entries.length === 0 && (
        <p className="note">
          {data.length === 0
            ? "Noch keine Kanon-Einträge."
            : "Nichts gefunden."}
        </p>
      )}
      <ul className="list">
        {entries.map((entry) => (
          <li key={`${entry.world}/${entry.id}`}>
            <button
              type="button"
              className="link"
              onClick={() => {
                setOpen(entry);
              }}
            >
              {entry.name}
            </button>
            <small>
              {categoryLabel(entry)}
              {entry.world !== world && " · Gast"}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Entries whose name or an alias contains the query, case-insensitive, sorted by name. */
export function matching(
  entries: readonly CanonEntry[],
  query: string,
): CanonEntry[] {
  const wanted = query.trim().toLocaleLowerCase("de");
  return entries
    .filter(
      (entry) =>
        wanted === "" ||
        [entry.name, ...entry.aliases].some((label) =>
          label.toLocaleLowerCase("de").includes(wanted),
        ),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "de"));
}

function categoryLabel(entry: CanonEntry): string {
  return CATEGORIES.find((c) => c.id === entry.category)?.label ?? "";
}
