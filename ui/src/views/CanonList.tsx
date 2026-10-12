import { useState } from "react";
import { CATEGORIES, type CanonEntry, type Category } from "../api";
import { WorldTimeline } from "./WorldTimeline";

/**
 * The left side of the canon page: search field, category chips and the entries grouped by
 * category. `loaded` tells the empty-result note apart from a list still loading. With the
 * filter on timelines the entries show as one time line, or as the list (step 7.2).
 */
export function CanonList({
  world,
  entries,
  shown,
  loaded,
  selected,
  query,
  onQuery,
  filter,
  onFilter,
  onChoose,
  editable,
  onCreated,
}: {
  world: string;
  entries: readonly CanonEntry[];
  /** The entries that pass search and filter. */
  shown: readonly CanonEntry[];
  loaded: boolean;
  selected: string | null;
  query: string;
  onQuery: (query: string) => void;
  filter: Category | null;
  onFilter: (filter: Category | null) => void;
  onChoose: (entry: string) => void;
  /** "+ Ereignis" on the time line (not in the compact bar). */
  editable: boolean;
  /** Called with an entry created on the time line. */
  onCreated: (entry: CanonEntry) => void;
}) {
  const guest = (entry: CanonEntry) => entry.world !== world;
  const [asList, setAsList] = useState(false);
  const timeline = filter === "zeitlinie";
  return (
    <div className="canon-list">
      <input
        type="search"
        aria-label="Kanon durchsuchen"
        placeholder="Suchen: Name oder Alias"
        value={query}
        onChange={(event) => {
          onQuery(event.target.value);
        }}
      />
      <div className="chips" role="group" aria-label="Nach Kategorie filtern">
        <button
          type="button"
          className="chip"
          aria-pressed={filter === null}
          onClick={() => {
            onFilter(null);
          }}
        >
          Alle {entries.length}
        </button>
        {CATEGORIES.map(({ id, plural }) => {
          const count = entries.filter((e) => e.category === id).length;
          return count === 0 ? null : (
            <button
              key={id}
              type="button"
              className="chip"
              aria-pressed={filter === id}
              onClick={() => {
                onFilter(filter === id ? null : id);
              }}
            >
              {plural} {count}
            </button>
          );
        })}
      </div>
      <p className="note">
        {shown.length === 0 && loaded
          ? "Kein Eintrag passt."
          : `${String(shown.length)} von ${String(entries.length)} Einträgen`}
      </p>
      {timeline && (
        <p className="note timeline-switch">
          <button
            type="button"
            className="link"
            aria-pressed={!asList}
            onClick={() => {
              setAsList(false);
            }}
          >
            Zeitstrahl
          </button>
          {" · "}
          <button
            type="button"
            className="link"
            aria-pressed={asList}
            onClick={() => {
              setAsList(true);
            }}
          >
            Liste
          </button>
        </p>
      )}
      {timeline && !asList ? (
        <WorldTimeline
          world={world}
          entries={shown.filter((entry) => !guest(entry))}
          selected={selected}
          editable={editable}
          onChoose={onChoose}
          onCreated={onCreated}
        />
      ) : null}
      {(!timeline || asList) &&
        CATEGORIES.map(({ id, plural }) => {
          const group = shown.filter((entry) => entry.category === id);
          if (group.length === 0) {
            return null;
          }
          return (
            <div key={id}>
              <h3 className="canon-group">{plural}</h3>
              <ul className="canon-items">
                {group.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className="canon-item"
                      aria-current={entry.id === selected ? "true" : undefined}
                      onClick={() => {
                        onChoose(entry.id);
                      }}
                    >
                      {entry.name}
                      {entry.aliases.length > 0 && (
                        // Space and dot as separate text, as before step 7.1, so the list renders identically.
                        <small>
                          {" "}
                          {"· "}
                          {entry.aliases.slice(0, 2).join(", ")}
                        </small>
                      )}
                      {entry.status !== null && (
                        <small> ({entry.status})</small>
                      )}
                      {guest(entry) && <small> · Gast</small>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
    </div>
  );
}
