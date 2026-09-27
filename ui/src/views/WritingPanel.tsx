import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  api,
  describeError,
  describeWriteError,
  streamWrite,
  type CanonEntry,
  type WriteErrorKind,
  type WriteOrder,
} from "../api";
import { referencedEntries } from "../references";
import { useLoad } from "../useLoad";
import { ErrorText, Field } from "./Common";

// CodeMirror is large; the instruction field is loaded with the chapter like the editor.
const InstructionEditor = lazy(() =>
  import("./InstructionEditor").then((module) => ({
    default: module.InstructionEditor,
  })),
);

type Phase = "idle" | "thinking" | "writing" | "review";

/**
 * Writing in turns with the AI (step 3.3, FR-008, FR-009): send an instruction or start a new
 * scene, watch the proposal arrive, then take it over, change it or discard it. Taken-over text
 * goes to the end of the chapter through `onAccept`; the server saves nothing on its own.
 * Entries named with `@` in the instruction are sent as references (step 3.5, FR-013).
 */
export function WritingPanel({
  world,
  story,
  chapter,
  prepare,
  onAccept,
}: {
  world: string;
  story: string;
  chapter: number;
  /** Save the author's own unsaved text first; false if that failed. */
  prepare: () => Promise<boolean>;
  /** Append the proposal to the end of the chapter and save it. */
  onAccept: (text: string) => Promise<void>;
}) {
  const loadModels = useCallback(() => api.models(), []);
  const models = useLoad(loadModels);
  const loadEntries = useCallback(() => api.entries(world), [world]);
  const entries = useLoad(loadEntries);

  const [model, setModel] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [sceneOpen, setSceneOpen] = useState(false);
  const [place, setPlace] = useState("");
  const [characters, setCharacters] = useState<string[]>([]);
  const [goal, setGoal] = useState("");

  const [phase, setPhase] = useState<Phase>("idle");
  const [proposal, setProposal] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [failure, setFailure] = useState<WriteErrorKind | null>(null);
  const [aborted, setAborted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<WriteOrder | null>(null);
  const controller = useRef<AbortController | null>(null);
  const instructionLabel = useId();

  const chosenModel = model ?? models.data?.default ?? "";
  const busy = phase === "thinking" || phase === "writing";

  useEffect(() => {
    if (phase !== "thinking") {
      return;
    }
    const started = Date.now();
    const timer = setInterval(() => {
      setSeconds(Math.floor((Date.now() - started) / 1000));
    }, 250);
    return () => {
      clearInterval(timer);
    };
  }, [phase]);

  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [],
  );

  async function send(order: WriteOrder) {
    setPhase("thinking");
    setSeconds(0);
    setProposal("");
    setFailure(null);
    setAborted(false);
    setError(null);
    setLastOrder(order);
    if (!(await prepare())) {
      setPhase("idle");
      return;
    }
    const abort = new AbortController();
    controller.current = abort;
    try {
      await streamWrite(
        api.writePath(world, story, chapter),
        order,
        (event) => {
          if (event.type === "text") {
            setPhase("writing");
            setProposal((text) => text + event.text);
          } else if (event.type === "error") {
            setFailure(event.kind);
          }
        },
        abort.signal,
      );
    } catch (reason: unknown) {
      if (!abort.signal.aborted) {
        setError(describeError(reason));
      }
    } finally {
      controller.current = null;
      setPhase("review");
    }
  }

  function newOrder(): WriteOrder {
    return {
      instruction,
      references: referenced.map((entry) => entry.id),
      model: chosenModel,
      scene: sceneOpen
        ? { place: place === "" ? null : place, characters, goal }
        : null,
    };
  }

  function stop() {
    setAborted(true);
    controller.current?.abort();
  }

  function discard() {
    setPhase("idle");
    setProposal("");
    setFailure(null);
    setAborted(false);
    setError(null);
  }

  async function accept() {
    setError(null);
    try {
      await onAccept(proposal);
      setInstruction("");
      setSceneOpen(false);
      setPlace("");
      setCharacters([]);
      setGoal("");
      discard();
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  const worldEntries = entries.data ?? [];
  const places = worldEntries.filter((e) => e.category === "ort");
  const figures = worldEntries.filter((e) => e.category === "figur");
  const referenced = referencedEntries(instruction, worldEntries);

  return (
    <section className="card" aria-label="Schreiben mit der KI">
      <ErrorText message={models.error ?? entries.error} />
      <div className="row">
        <Field label="Modell">
          <select
            value={chosenModel}
            onChange={(event) => {
              setModel(event.target.value);
            }}
          >
            {(models.data?.models ?? []).map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </Field>
        <label className="check">
          <input
            type="checkbox"
            checked={sceneOpen}
            disabled={busy}
            onChange={(event) => {
              setSceneOpen(event.target.checked);
            }}
          />
          Neue Szene
        </label>
      </div>
      {sceneOpen && (
        <SceneForm
          places={places}
          figures={figures}
          place={place}
          characters={characters}
          goal={goal}
          onPlace={setPlace}
          onCharacters={setCharacters}
          onGoal={setGoal}
        />
      )}
      <div className="field">
        <span id={instructionLabel}>
          Anweisung an die KI (leer: einfach weiterschreiben; @ für Kanon)
        </span>
        <Suspense fallback={<p>Eingabe lädt …</p>}>
          <InstructionEditor
            value={instruction}
            onChange={setInstruction}
            entries={worldEntries}
            labelledBy={instructionLabel}
            disabled={busy}
          />
        </Suspense>
      </div>
      {referenced.length > 0 && (
        <p className="note">
          Herangezogen: {referenced.map((entry) => entry.name).join(", ")}
        </p>
      )}
      <div className="row">
        <button
          type="button"
          disabled={busy || chosenModel === ""}
          onClick={() => void send(newOrder())}
        >
          {sceneOpen ? "Szene beginnen" : "Weiterschreiben"}
        </button>
        {busy && (
          <button type="button" onClick={stop}>
            Abbrechen
          </button>
        )}
        {phase === "thinking" && (
          <span className="note" role="status">
            denkt nach … {seconds} s
          </span>
        )}
        {phase === "writing" && (
          <span className="note" role="status">
            schreibt …
          </span>
        )}
      </div>
      {(phase === "writing" || phase === "review") && (
        <Field label="Vorschlag der KI">
          <textarea
            rows={8}
            value={proposal}
            readOnly={phase !== "review"}
            onChange={(event) => {
              setProposal(event.target.value);
            }}
          />
        </Field>
      )}
      {phase === "review" && (
        <>
          {aborted && <p className="note">Abgebrochen.</p>}
          {failure !== null && (
            <p className="error" role="alert">
              {describeWriteError(failure)}
            </p>
          )}
          <ErrorText message={error} />
          <div className="row">
            {proposal.trim() !== "" && (
              <button type="button" onClick={() => void accept()}>
                Übernehmen
              </button>
            )}
            <button type="button" onClick={discard}>
              Verwerfen
            </button>
            {lastOrder !== null && (
              <button
                type="button"
                onClick={() => void send({ ...lastOrder, model: chosenModel })}
              >
                Neu schreiben mit {chosenModel}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function SceneForm({
  places,
  figures,
  place,
  characters,
  goal,
  onPlace,
  onCharacters,
  onGoal,
}: {
  places: CanonEntry[];
  figures: CanonEntry[];
  place: string;
  characters: string[];
  goal: string;
  onPlace: (id: string) => void;
  onCharacters: (ids: string[]) => void;
  onGoal: (text: string) => void;
}) {
  return (
    <fieldset className="stack">
      <legend>Neue Szene</legend>
      <Field label="Ort">
        <select
          value={place}
          onChange={(event) => {
            onPlace(event.target.value);
          }}
        >
          <option value="">– kein Ort –</option>
          {places.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="row" role="group" aria-label="Figuren">
        {figures.map((entry) => (
          <label className="check" key={entry.id}>
            <input
              type="checkbox"
              checked={characters.includes(entry.id)}
              onChange={(event) => {
                onCharacters(
                  event.target.checked
                    ? [...characters, entry.id]
                    : characters.filter((id) => id !== entry.id),
                );
              }}
            />
            {entry.name}
          </label>
        ))}
      </div>
      <Field label="Ziel der Szene">
        <input
          value={goal}
          onChange={(event) => {
            onGoal(event.target.value);
          }}
        />
      </Field>
    </fieldset>
  );
}
