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
  formatCost,
  streamWrite,
  type CanonEntry,
  type GuestLink,
  type WriteErrorKind,
  type WriteEvent,
  type WriteOrder,
} from "../api";
import { referencedEntries } from "../references";
import { loadStoryEntries } from "../storyEntries";
import { useLoad } from "../useLoad";
import { ErrorText, Field } from "./Common";
import { SceneForm } from "./SceneForm";

// CodeMirror is large; the instruction field is loaded with the chapter like the editor.
const InstructionEditor = lazy(() =>
  import("./InstructionEditor").then((module) => ({
    default: module.InstructionEditor,
  })),
);

type Phase = "idle" | "thinking" | "writing" | "review";

const NO_GUESTS: readonly GuestLink[] = [];

/**
 * Writing in turns with the AI (step 3.3, FR-008, FR-009): send an instruction or start a new
 * scene, watch the proposal arrive, then take it over, change it or discard it. Taken-over text
 * goes to the end of the chapter through `onAccept`; the server saves nothing on its own.
 * Entries named with `@` in the instruction are sent as references (step 3.5, FR-013); guests
 * of the story from other worlds can be named and put into a new scene like entries of the
 * world (step 3.7, FR-017).
 */
export function WritingPanel({
  world,
  story,
  chapter,
  guests = NO_GUESTS,
  canonRevision = 0,
  storyModel = null,
  onModelChange,
  prepare,
  onAccept,
}: {
  world: string;
  story: string;
  chapter: number;
  /** Guest links of the story; keep the same array while they do not change. */
  guests?: readonly GuestLink[];
  /** Changes when the canon changed on the page, so the `@` menu offers the new state. */
  canonRevision?: number;
  /** Model chosen for the story; preselected while it is one of the offered models. */
  storyModel?: string | null;
  /** Keep a newly chosen model for the story (step 3.9). */
  onModelChange?: (model: string) => Promise<void>;
  /** Save the author's own unsaved text first; false if that failed. */
  prepare: () => Promise<boolean>;
  /** Append the proposal to the end of the chapter and save it. */
  onAccept: (text: string) => Promise<void>;
}) {
  const loadModels = useCallback(() => api.models(), []);
  const models = useLoad(loadModels);
  const loadEntries = useCallback(
    () => loadStoryEntries(world, guests),
    [world, guests],
  );
  const entries = useLoad(loadEntries);
  const reloadEntries = entries.reload;
  useEffect(() => {
    if (canonRevision > 0) {
      reloadEntries();
    }
  }, [canonRevision, reloadEntries]);

  const [model, setModel] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [sceneOpen, setSceneOpen] = useState(false);
  const [place, setPlace] = useState("");
  const [characters, setCharacters] = useState<string[]>([]);
  const [goal, setGoal] = useState("");

  const [phase, setPhase] = useState<Phase>("idle");
  const [proposal, setProposal] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [failure, setFailure] = useState<WriteErrorKind | null>(null);
  const [aborted, setAborted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<WriteOrder | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const instructionLabel = useId();

  const offered = models.data?.models ?? [];
  const preset =
    storyModel !== null && offered.includes(storyModel)
      ? storyModel
      : models.data?.default;
  const chosenModel = model ?? preset ?? "";
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
    setNote(null);
    setFailure(null);
    setAborted(false);
    setError(null);
    setUsage(null);
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
          } else if (event.type === "hinweis") {
            setNote(event.text);
          } else if (event.type === "error") {
            setFailure(event.kind);
          } else if (event.type === "done") {
            setUsage(event);
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
    setNote(null);
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

  const storyEntries = entries.data ?? [];
  const places = storyEntries.filter((e) => e.category === "ort");
  const figures = storyEntries.filter((e) => e.category === "figur");
  const referenced = referencedEntries(instruction, storyEntries);
  const shown = (entry: CanonEntry) =>
    entry.world === world ? entry.name : `${entry.name} (Gast)`;

  return (
    <section className="card" aria-label="Schreiben mit der KI">
      <ErrorText message={models.error ?? entries.error ?? modelError} />
      <div className="row">
        <Field label="Modell">
          <select
            value={chosenModel}
            onChange={(event) => {
              const next = event.target.value;
              setModel(next);
              setModelError(null);
              onModelChange?.(next).catch((reason: unknown) => {
                setModelError(describeError(reason));
              });
            }}
          >
            {offered.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </Field>
        <span className="note">Anbieter: OpenRouter</span>
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
          shown={shown}
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
            entries={storyEntries}
            world={world}
            labelledBy={instructionLabel}
            disabled={busy}
          />
        </Suspense>
      </div>
      {referenced.length > 0 && (
        <p className="note">Herangezogen: {referenced.map(shown).join(", ")}</p>
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
      {note !== null && phase !== "idle" && (
        <p className="note" role="note">
          Hinweis der KI (wird nicht übernommen): {note}
        </p>
      )}
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
              {failure === "abgelehnt" &&
                " Wähle oben ein anderes Modell und schreibe neu."}
            </p>
          )}
          {usage !== null && <p className="note">{describeUsage(usage)}</p>}
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

type Usage = Extract<WriteEvent, { type: "done" }>;

/** Tokens and cost of one proposal (step 3.9); the provider may leave out the cost. */
export function describeUsage(usage: Usage): string {
  const tokens = (count: number | null) =>
    count === null ? "?" : count.toLocaleString("de-DE");
  const cost =
    usage.cost_usd === null
      ? "Kosten nicht gemeldet"
      : `Kosten ${formatCost(usage.cost_usd)}`;
  return `Verbrauch: ${tokens(usage.input_tokens)} Token ein, ${tokens(usage.output_tokens)} aus · ${cost}`;
}
