import { useCallback, useState, type SyntheticEvent } from "react";
import { api, describeError, type CanonEntry, type Story } from "../api";
import { loadStoryEntries } from "../storyEntries";
import { useLoad } from "../useLoad";
import { ErrorText, Field } from "./Common";

/**
 * Figuren-Schreibweise (FR-012): perspective and the characters the author leads; the AI
 * writes no action, speech or thought for them. Guest characters of the story can be led too.
 * Closed, the line shows the saved perspective and the led characters; the same short line
 * stands above the instruction while writing ({@link ModeLine}, step 5.11).
 */
export function WritingMode({
  story,
  onSaved,
  startOpen = false,
}: {
  story: Story;
  onSaved: (story: Story) => void;
  /** Open the form at once, e.g. after "ändern" in the short line (step 5.11). */
  startOpen?: boolean;
}) {
  const load = useCallback(
    () => loadStoryEntries(story.world, story.guest_links),
    [story.world, story.guest_links],
  );
  const entries = useLoad(load);
  const [perspective, setPerspective] = useState(story.perspective ?? "");
  const [led, setLed] = useState<string[]>(story.controlled_characters);
  const [state, setState] = useState<"clean" | "dirty" | "saved">("clean");
  const [error, setError] = useState<string | null>(null);

  const figures = (entries.data ?? []).filter(
    (entry: CanonEntry) => entry.category === "figur",
  );

  async function save(event: SyntheticEvent) {
    event.preventDefault();
    setError(null);
    try {
      const clean = perspective.trim();
      onSaved(
        await api.updateStory(story.world, story.id, {
          perspective: clean === "" ? null : clean,
          controlled_characters: led,
        }),
      );
      setState("saved");
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  return (
    <details className="mode" open={startOpen}>
      <summary>
        <span>Figuren-Schreibweise</span>{" "}
        <ModeText story={story} figures={figures} />
      </summary>
      <form className="stack" onSubmit={(event) => void save(event)}>
        <Field label="Erzählperspektive">
          <input
            value={perspective}
            placeholder="z. B. Ich-Erzählerin, Präteritum"
            onChange={(event) => {
              setPerspective(event.target.value);
              setState("dirty");
            }}
          />
        </Field>
        <div
          className="row"
          role="group"
          aria-label="Figuren, die du selbst führst"
        >
          {figures.map((entry) => (
            <label className="check" key={entry.id}>
              <input
                type="checkbox"
                checked={led.includes(entry.id)}
                onChange={(event) => {
                  setLed(
                    event.target.checked
                      ? [...led, entry.id]
                      : led.filter((id) => id !== entry.id),
                  );
                  setState("dirty");
                }}
              />
              {entry.world === story.world
                ? entry.name
                : `${entry.name} (Gast)`}
            </label>
          ))}
        </div>
        <p className="note">
          Für die gewählten Figuren schreibt die KI keine Handlung, Rede oder
          Gedanken, nur was sie wahrnehmen – und hört dort auf, wo du
          weiterschreibst.
        </p>
        <ErrorText message={entries.error ?? error} />
        <div className="row">
          <button type="submit" disabled={state !== "dirty"}>
            Schreibweise speichern
          </button>
          {state === "saved" && <span className="ok">Gespeichert.</span>}
        </div>
      </form>
    </details>
  );
}

/** Saved perspective and led characters in one short line. */
function ModeText({
  story,
  figures,
}: {
  story: Story;
  figures: readonly CanonEntry[];
}) {
  const ledNames = story.controlled_characters
    .map((id) => figures.find((entry) => entry.id === id)?.name ?? id)
    .join(", ");
  return (
    <>
      <span className="note">
        {story.perspective === null
          ? "keine Perspektive festgelegt"
          : `Perspektive: ${story.perspective}`}
      </span>
      {ledNames !== "" && (
        <>
          {" · "}
          <span className="note">du führst: {ledNames}</span>
        </>
      )}
    </>
  );
}

/**
 * The Figuren-Schreibweise as a short line right above the instruction (step 5.11); "ändern"
 * opens the form in the bar on the right.
 */
export function ModeLine({
  story,
  onChange,
}: {
  story: Story;
  onChange: () => void;
}) {
  const load = useCallback(
    () => loadStoryEntries(story.world, story.guest_links),
    [story.world, story.guest_links],
  );
  const entries = useLoad(load);
  const figures = (entries.data ?? []).filter(
    (entry) => entry.category === "figur",
  );
  return (
    <p className="mode-line">
      <span className="note">Figuren-Schreibweise:</span>{" "}
      <ModeText story={story} figures={figures} />
      {" · "}
      <button type="button" className="link" onClick={onChange}>
        ändern
      </button>
    </p>
  );
}
