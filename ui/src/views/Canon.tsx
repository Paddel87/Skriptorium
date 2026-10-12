import { useCallback, useState } from "react";
import { api, type GuestLink } from "../api";
import { loadStoryEntries } from "../storyEntries";
import { useLoad } from "../useLoad";
import { CanonList } from "./CanonList";
import { ErrorText } from "./Common";
import { EntryArticle } from "./EntryArticle";
import { EntryForm } from "./EntryForm";
import { WorldBuilder } from "./WorldBuilder";
import { useCanonSearch } from "./useCanonSearch";

/** Marks a new entry in the editing state; entry identifiers never contain a space. */
const NEW = " new";

/**
 * Canon entries of a world (step 5.11 part 3): search over name and aliases, categories as
 * filter, the list on the left, the chosen entry on the right to read and change. The chosen
 * entry has its own address (`selected`, `onSelect`); on narrow screens the entry takes the whole
 * width, with a way back to the list.
 *
 * The same view serves the bar on the right of a story (finding of 2026-10-10 on step 5.11):
 * `compact` always shows list or entry, `guests` adds the story's guests from other worlds,
 * which can be read here but are changed in their own world.
 *
 * Given `onTakeOver` (not in the compact bar), the AI world builder (step 6.7) opens where the
 * entry is shown; its proposals go to `onTakeOver` as Markdown for the import preview.
 *
 * Outside the compact bar the world downloads as a SillyTavern lorebook and a figure as a
 * character card (step 6.9).
 */
export function Canon({
  world,
  selected = null,
  onSelect = () => undefined,
  guests,
  compact = false,
  onChanged,
  onTakeOver,
}: {
  world: string;
  /** Identifier of the entry shown on the right, or none. */
  selected?: string | null;
  onSelect?: (entry: string | null) => void;
  /** Guests of a story; given, they are listed and marked as guests. */
  guests?: readonly GuestLink[];
  /** List or entry, never both side by side (the narrow bar of a story). */
  compact?: boolean;
  /** Called after an entry was created, changed or deleted. */
  onChanged?: () => void;
  /** Opens the world builder's button; takes over a proposal (Markdown in the import format). */
  onTakeOver?: (markdown: string) => void;
}) {
  const load = useCallback(
    () =>
      guests === undefined
        ? api.entries(world)
        : loadStoryEntries(world, guests),
    [world, guests],
  );
  const { data, error, reload } = useLoad(load);
  // The entry being changed, or `NEW` for a new one.
  const [editing, setEditing] = useState<string | null>(null);
  // The world builder is open; once opened it stays, so closing and choosing an entry to read
  // keep the conversation.
  const [building, setBuilding] = useState(false);
  const [builderUsed, setBuilderUsed] = useState(false);
  const takeOver = compact ? undefined : onTakeOver;

  const entries = data ?? [];
  const { query, setQuery, filter, setFilter, shown } = useCanonSearch(entries);
  const current = entries.find((entry) => entry.id === selected);
  const formFor =
    editing === NEW ? null : editing === selected ? current : undefined;
  const detail = editing === NEW || selected !== null || building;

  function choose(entry: string | null) {
    setEditing(null);
    setBuilding(false);
    onSelect(entry);
  }

  return (
    <section className={compact ? "card canon-panel" : "card"}>
      <div className="row">
        <h2>Kanon</h2>
        <button
          type="button"
          onClick={() => {
            setBuilding(false);
            setEditing(NEW);
          }}
        >
          Neuer Eintrag
        </button>
        {takeOver !== undefined && (
          <button
            type="button"
            className="primary"
            aria-expanded={building}
            onClick={() => {
              setEditing(null);
              setBuilding(true);
              setBuilderUsed(true);
            }}
          >
            ✨ Weltenbauer
          </button>
        )}
        {!compact && (
          <a
            className="button"
            href={api.lorebookPath(world)}
            download={`${world}.lorebook.json`}
          >
            ⇩ Lorebook für SillyTavern
          </a>
        )}
      </div>
      <ErrorText message={error} />
      {data?.length === 0 && editing !== NEW && !building ? (
        <p>Noch keine Kanon-Einträge.</p>
      ) : (
        <div
          className={[
            "canon",
            compact ? "compact" : "",
            detail ? "has-detail" : "",
          ]
            .filter((name) => name !== "")
            .join(" ")}
        >
          <CanonList
            world={world}
            entries={entries}
            shown={shown}
            loaded={data !== undefined}
            selected={selected}
            query={query}
            onQuery={setQuery}
            filter={filter}
            onFilter={setFilter}
            onChoose={choose}
          />
          <div className="canon-detail">
            {takeOver !== undefined && builderUsed && (
              <div hidden={!building}>
                <WorldBuilder
                  world={world}
                  entries={entries}
                  onTakeOver={takeOver}
                  onClose={() => {
                    setBuilding(false);
                  }}
                />
              </div>
            )}
            {!building && detail && (
              <button
                type="button"
                className="link canon-back"
                onClick={() => {
                  choose(null);
                }}
              >
                ← Liste
              </button>
            )}
            {building ? null : formFor !== undefined ? (
              <EntryForm
                key={formFor?.id ?? "new"}
                world={world}
                entry={formFor}
                onClose={(saved) => {
                  setEditing(null);
                  reload();
                  if (saved !== undefined) {
                    onChanged?.();
                    onSelect(saved);
                  }
                }}
              />
            ) : current !== undefined ? (
              <EntryArticle
                world={world}
                current={current}
                compact={compact}
                onEdit={() => {
                  setEditing(current.id);
                }}
                onSaved={() => {
                  reload();
                  onChanged?.();
                }}
              />
            ) : selected !== null && data !== undefined ? (
              <p>Eintrag nicht gefunden.</p>
            ) : (
              <p className="note">Einen Eintrag links wählen.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
