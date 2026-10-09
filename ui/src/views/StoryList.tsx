import { useCallback, useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router";
import { api, describeError, FORMS, type Story, type World } from "../api";
import { chapterPath, storyPath, useNavigation, worldPath } from "../paths";
import { useLoad } from "../useLoad";
import { ErrorText } from "./Common";

interface WorldStories {
  world: World;
  stories: Story[];
}

/** All worlds with their stories; few worlds, so they are loaded together. */
async function loadAll(): Promise<WorldStories[]> {
  const worlds = await api.worlds();
  return Promise.all(
    worlds.map(async (world) => ({
      world,
      stories: await api.stories(world.id),
    })),
  );
}

/** Stories whose title contains the query, ignoring case and surrounding spaces. */
export function matchingStories(stories: Story[], query: string): Story[] {
  const wanted = query.trim().toLocaleLowerCase("de");
  return wanted === ""
    ? stories
    : stories.filter((story) =>
        story.title.toLocaleLowerCase("de").includes(wanted),
      );
}

/**
 * The list on the left (step 5.11): worlds like folders, the open one unfolded with its stories,
 * the chapters of the open story below it; search over all story titles; new chapters, stories
 * and worlds right here. `onGo` is called after a choice (closes the menu on small screens).
 */
export function StoryList({
  world,
  story,
  chapter,
  onGo,
}: {
  /** Open world, story and chapter from the address, if any. */
  world?: string;
  story?: string;
  chapter?: number;
  onGo?: () => void;
}) {
  const { revision, refresh } = useNavigation();
  const load = useCallback(() => loadAll(), []);
  const all = useLoad(load, revision);
  const [query, setQuery] = useState("");
  const [unfolded, setUnfolded] = useState<ReadonlySet<string>>(new Set());
  const searching = query.trim() !== "";

  function toggle(id: string) {
    const next = new Set(unfolded);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setUnfolded(next);
  }

  return (
    <nav className="story-list" aria-label="Geschichten">
      <h2>Geschichten</h2>
      <input
        type="search"
        aria-label="Geschichten suchen"
        placeholder="Geschichten suchen …"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
      />
      <ErrorText message={all.error} />
      {all.data?.length === 0 && <p className="note">Noch keine Welt.</p>}
      <ul className="tree">
        {(all.data ?? []).map(({ world: w, stories }) => {
          const shown = matchingStories(stories, query);
          if (searching && shown.length === 0) {
            return null;
          }
          // The open world starts unfolded; a click on its arrow folds it.
          const open = searching || unfolded.has(w.id) !== (w.id === world);
          return (
            <li key={w.id}>
              <div className="tree-world">
                <button
                  type="button"
                  className="fold"
                  aria-expanded={open}
                  aria-label={`${w.name} ${open ? "zuklappen" : "aufklappen"}`}
                  onClick={() => {
                    toggle(w.id);
                  }}
                >
                  {open ? "▾" : "▸"}
                </button>
                <Link
                  to={worldPath(w.id)}
                  aria-current={w.id === world && story === undefined}
                  onClick={onGo}
                >
                  {w.name}
                </Link>
                {!open && <small className="note">{stories.length}</small>}
              </div>
              {open && (
                <ul className="tree">
                  {shown.map((s) => (
                    <li key={s.id}>
                      <Link
                        to={storyPath(w.id, s.id)}
                        className="tree-story"
                        aria-current={w.id === world && s.id === story}
                        onClick={onGo}
                      >
                        {s.title}
                      </Link>
                      {s.form !== "roman" && (
                        <small className="note">
                          {" "}
                          ({FORMS.find((f) => f.id === s.form)?.label})
                        </small>
                      )}
                      {w.id === world && s.id === story && (
                        <Chapters
                          story={s}
                          current={chapter}
                          revision={revision}
                          onCreated={refresh}
                          onGo={onGo}
                        />
                      )}
                    </li>
                  ))}
                  {!searching && (
                    <li>
                      <Link className="add" to={worldPath(w.id)} onClick={onGo}>
                        + Geschichte
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      <Link className="add foot" to="/" onClick={onGo}>
        + Welt
      </Link>
    </nav>
  );
}

/** Chapters of the open story; novels can get a new chapter here. */
function Chapters({
  story,
  current,
  revision,
  onCreated,
  onGo,
}: {
  story: Story;
  current?: number;
  revision: number;
  onCreated: () => void;
  onGo?: () => void;
}) {
  const navigate = useNavigate();
  const load = useCallback(
    () => api.chapters(story.world, story.id),
    [story.world, story.id],
  );
  const { data, error } = useLoad(load, revision);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const chapters = data ?? [];
  const shownCurrent = current ?? chapters[0]?.number;

  async function add(event: SyntheticEvent) {
    event.preventDefault();
    setCreateError(null);
    try {
      const created = await api.saveChapter(
        story.world,
        story.id,
        chapters.length + 1,
        { title },
      );
      setTitle("");
      setAdding(false);
      onCreated();
      void navigate(chapterPath(story.world, story.id, created.number));
      onGo?.();
    } catch (reason: unknown) {
      setCreateError(describeError(reason));
    }
  }

  return (
    <>
      <ErrorText message={error} />
      <ul className="tree chapters" aria-label="Kapitel">
        {chapters.map((c) => (
          <li key={c.number}>
            <Link
              to={chapterPath(story.world, story.id, c.number)}
              aria-current={c.number === shownCurrent}
              onClick={onGo}
            >
              {c.number}. {c.title}
            </Link>
          </li>
        ))}
        {story.form === "roman" && (
          <li>
            {adding ? (
              <form
                className="stack tight"
                onSubmit={(event) => void add(event)}
              >
                <input
                  aria-label="Titel des neuen Kapitels"
                  placeholder="Titel des neuen Kapitels"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                  }}
                  required
                  autoFocus
                />
                <div className="row">
                  <button type="submit">Kapitel anlegen</button>
                  <button
                    type="button"
                    className="link"
                    onClick={() => {
                      setAdding(false);
                    }}
                  >
                    Abbrechen
                  </button>
                </div>
                <ErrorText message={createError} />
              </form>
            ) : (
              <button
                type="button"
                className="link add"
                onClick={() => {
                  setAdding(true);
                }}
              >
                + Kapitel
              </button>
            )}
          </li>
        )}
      </ul>
    </>
  );
}
