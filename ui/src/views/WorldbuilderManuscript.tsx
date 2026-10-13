import { useCallback, useState } from "react";
import {
  api,
  describeError,
  type ManuscriptHits,
  type ManuscriptSearch,
  type Story,
} from "../api";
import { formatCents } from "../models";
import { ErrorText } from "./Common";
import { useLoad } from "../useLoad";

/** "1 Stelle", "23 Stellen". */
function count(n: number, one: string, many: string): string {
  return `${n.toLocaleString("de-DE")} ${n === 1 ? one : many}`;
}

/**
 * "📖 Aus dem Manuskript" (step 8.9, ADR-087): the author names a figure or an object, the
 * server counts the passages of the stories that mention it, and while they are active they go
 * along with every request of the conversation (`active` is held by the world builder). Only
 * numbers come back here; the texts stay on the server.
 */
export function WorldbuilderManuscript({
  world,
  inputPrice,
  busy,
  active,
  onChange,
}: {
  world: string;
  /** Dollars per million input tokens of the chosen model, `null` if unknown. */
  inputPrice: number | null;
  busy: boolean;
  active: ManuscriptSearch | null;
  onChange: (search: ManuscriptSearch | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [story, setStory] = useState("");
  const [hits, setHits] = useState<ManuscriptHits | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Stories are only needed once the area is open.
  const loadStories = useCallback(
    () => (open ? api.stories(world) : Promise.resolve<Story[]>([])),
    [open, world],
  );
  const stories = useLoad(loadStories);

  async function fetchHits() {
    const search = { name: name.trim(), story: story === "" ? null : story };
    setLoading(true);
    setError(null);
    try {
      const found = await api.manuscriptHits(world, search);
      setHits(found);
      onChange(found.total > 0 ? search : null);
    } catch (reason: unknown) {
      setHits(null);
      onChange(null);
      setError(describeError(reason));
    } finally {
      setLoading(false);
    }
  }

  function remove() {
    setHits(null);
    onChange(null);
  }

  const dollars =
    hits === null || inputPrice === null
      ? null
      : (hits.tokens * inputPrice) / 1_000_000;
  // Below a tenth of a cent the rounded figure would read "0,0 ct".
  const cost =
    dollars === null
      ? null
      : dollars < 0.0005
        ? "unter 0,1 ct"
        : `ca. ${formatCents(dollars) ?? ""}`;
  return (
    <div className="wb-manuscript">
      <button
        type="button"
        className="link"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
        }}
      >
        📖 Aus dem Manuskript
      </button>
      {open && (
        <>
          {active === null && (
            <form
              className="row"
              onSubmit={(event) => {
                event.preventDefault();
                void fetchHits();
              }}
            >
              <label className="field">
                Name
                <input
                  type="text"
                  value={name}
                  maxLength={200}
                  onChange={(event) => {
                    setName(event.target.value);
                  }}
                />
              </label>
              <label className="field">
                in
                <select
                  value={story}
                  onChange={(event) => {
                    setStory(event.target.value);
                  }}
                >
                  <option value="">allen Geschichten der Welt</option>
                  {(stories.data ?? []).map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.title}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={busy || loading || name.trim() === ""}
              >
                Fundstellen holen
              </button>
            </form>
          )}
          <ErrorText message={stories.error ?? error} />
          {hits !== null && hits.total === 0 && (
            <p className="note" role="status">
              Keine Stellen gefunden
            </p>
          )}
          {hits !== null && hits.total > 0 && active !== null && (
            <p className="note row" role="status">
              <span>
                „{active.name}“: {count(hits.total, "Stelle", "Stellen")} in{" "}
                {count(hits.stories, "Geschichte", "Geschichten")},{" "}
                {count(hits.chapters, "Kapitel", "Kapiteln")} · mitgegeben:{" "}
                {hits.included.toLocaleString("de-DE")} · ca.{" "}
                {hits.tokens.toLocaleString("de-DE")} Token
                {cost !== null && `, ${cost} je Antwort`}
              </span>
              <button
                type="button"
                className="link"
                aria-label="Fundstellen herausnehmen"
                disabled={busy}
                onClick={remove}
              >
                ✕
              </button>
            </p>
          )}
        </>
      )}
    </div>
  );
}
