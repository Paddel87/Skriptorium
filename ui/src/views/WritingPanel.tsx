import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
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
  type WriteLength,
  type WriteOrder,
} from "../api";
import { referencedEntries } from "../references";
import { loadStoryEntries } from "../storyEntries";
import { useLoad } from "../useLoad";
import { ErrorText } from "./Common";
import { SceneForm } from "./SceneForm";

// CodeMirror is large; the instruction field is loaded with the chapter like the editor.
const InstructionEditor = lazy(() =>
  import("./InstructionEditor").then((module) => ({
    default: module.InstructionEditor,
  })),
);

type Phase = "idle" | "thinking" | "writing" | "review";

const NO_GUESTS: readonly GuestLink[] = [];

/** Lengths of a proposal as the server names them (step 5.15). */
const LENGTHS: readonly WriteLength[] = ["kurz", "mittel", "lang"];

/** Grey example in the empty instruction field (step 4.15); not tied to any world. */
const EXAMPLE_INSTRUCTION =
  "z. B. Eine Fremde betritt am Abend die Schänke und fragt nach dem Fährmann.";

/**
 * Writing in turns with the AI (step 3.3, FR-008, FR-009): send an instruction or start a new
 * scene, watch the proposal arrive, then take it over, change it or discard it. Taken-over text
 * goes to the end of the chapter through `onAccept`; the server saves nothing on its own.
 * Entries named with `@` in the instruction are sent as references (step 3.5, FR-013); guests
 * of the story from other worlds can be named and put into a new scene like entries of the
 * world (step 3.7, FR-017). The length of a proposal is chosen per request (step 5.15).
 *
 * Laid out like a chat (step 5.11): `children` (the manuscript) and the proposal below it scroll
 * together, the proposal stands at the end of the text like an answer; the instruction with
 * model, length and the buttons stays at the bottom. "/" outside a field jumps into the
 * instruction.
 */
export function WritingPanel({
  world,
  story,
  chapter,
  chapterEmpty = false,
  guests = NO_GUESTS,
  canonRevision = 0,
  storyModel = null,
  onModelChange,
  prepare,
  onAccept,
  children,
  mode,
  tools,
  endSignal = 0,
}: {
  world: string;
  story: string;
  chapter: number;
  /** The chapter has no text yet: the panel explains how to start (step 4.15). */
  chapterEmpty?: boolean;
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
  /** The manuscript and what belongs to it; scrolls above the instruction. */
  children?: ReactNode;
  /** Short line of the Figuren-Schreibweise above the instruction. */
  mode?: ReactNode;
  /** More buttons in the line of the instruction (e.g. "In den Kanon"). */
  tools?: ReactNode;
  /** Changes when the end of the text should come into view (chapter opened, text taken over). */
  endSignal?: number;
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
  const [length, setLength] = useState<WriteLength>("mittel");
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
  const [editing, setEditing] = useState(false);
  const [more, setMore] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLDivElement>(null);
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

  // Whether the author is at the end of the text; only then does the view follow the proposal
  // as it grows (steps 5.11, 5.21: scrolled up to read, the view stays where it is).
  const atEnd = useRef(true);

  const showEnd = useCallback(() => {
    const area = scroller.current;
    if (area === null) {
      return () => undefined;
    }
    atEnd.current = true;
    area.scrollTop = area.scrollHeight;
    // The editor measures its lines after the first paint; follow once more then.
    const frame = requestAnimationFrame(() => {
      area.scrollTop = area.scrollHeight;
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const area = scroller.current;
    if (area === null) {
      return;
    }
    const remember = () => {
      atEnd.current =
        area.scrollHeight - area.scrollTop - area.clientHeight < 48;
    };
    area.addEventListener("scroll", remember);
    // When the width changes (bar on the right, turning the phone), the end stays in view if it
    // was in view before.
    const sheet = area.firstElementChild;
    const observer =
      sheet !== null && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (atEnd.current) {
              area.scrollTop = area.scrollHeight;
            }
          })
        : null;
    if (sheet !== null) {
      observer?.observe(sheet);
    }
    observer?.observe(area);
    return () => {
      area.removeEventListener("scroll", remember);
      observer?.disconnect();
    };
  }, []);

  // Chapter opened, text taken over, or a new request sent: to the end of the text.
  useEffect(() => showEnd(), [endSignal, showEnd]);
  useEffect(() => {
    if (phase === "thinking") {
      return showEnd();
    }
  }, [phase, showEnd]);

  // The proposal growing at the end: follow only while the author is at the end.
  useEffect(() => {
    if (atEnd.current && phase !== "idle") {
      return showEnd();
    }
  }, [proposal, phase, showEnd]);

  useEffect(() => {
    function jump(event: KeyboardEvent) {
      if (
        event.key !== "/" ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        writable(event.target)
      ) {
        return;
      }
      const field =
        composer.current?.querySelector<HTMLElement>(".cm-content") ?? null;
      if (field !== null) {
        event.preventDefault();
        field.focus();
      }
    }
    document.addEventListener("keydown", jump);
    return () => {
      document.removeEventListener("keydown", jump);
    };
  }, []);

  async function send(order: WriteOrder) {
    setEditing(false);
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
      length,
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
    setEditing(false);
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

  const proposalBlock = (phase === "writing" || phase === "review") && (
    <article className="proposal" aria-label="Vorschlag">
      <p className="who">
        Vorschlag der KI · {lastOrder?.model ?? chosenModel} über OpenRouter ·{" "}
        {lastOrder?.length ?? length}
      </p>
      <textarea
        aria-label="Vorschlag der KI"
        className={editing ? "proposal-text editing" : "proposal-text"}
        rows={rowsFor(proposal)}
        value={proposal}
        readOnly={phase !== "review" || !editing}
        onChange={(event) => {
          setProposal(event.target.value);
        }}
      />
      {phase === "review" && (
        <>
          {aborted && <p className="note">Abgebrochen.</p>}
          {failure !== null && (
            <p className="error" role="alert">
              {describeWriteError(failure)}
              {failure === "abgelehnt" &&
                " Wähle unten ein anderes Modell und schreibe neu."}
            </p>
          )}
          <ErrorText message={error} />
          <div className="row">
            {proposal.trim() !== "" && (
              <button
                type="button"
                className="primary"
                onClick={() => void accept()}
              >
                Übernehmen
              </button>
            )}
            {proposal.trim() !== "" && !editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                }}
              >
                Ändern
              </button>
            )}
            <button type="button" onClick={discard}>
              Verwerfen
            </button>
            {lastOrder !== null && (
              <button
                type="button"
                onClick={() =>
                  void send({ ...lastOrder, model: chosenModel, length })
                }
              >
                Neu schreiben mit {chosenModel}
              </button>
            )}
            {usage !== null && (
              <span className="note cost">{describeUsage(usage)}</span>
            )}
          </div>
        </>
      )}
    </article>
  );

  return (
    <section className="chat" aria-label="Schreiben mit der KI">
      <div className="chat-scroll" ref={scroller}>
        <div className="chat-sheet">
          {children}
          {note !== null && phase !== "idle" && (
            <p className="note" role="note">
              Hinweis der KI (wird nicht übernommen): {note}
            </p>
          )}
          {proposalBlock}
        </div>
      </div>
      <div className="composer" ref={composer}>
        <div className="composer-sheet">
          <ErrorText message={models.error ?? entries.error ?? modelError} />
          {chapterEmpty && phase === "idle" && (
            <p className="note">
              So fängst du an: Schreib unten, was passieren soll, und klick auf
              „Weiterschreiben“ – oder schreib selbst oben im Kapitel.
            </p>
          )}
          {mode}
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
            <span id={instructionLabel} className="sr-only">
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
                example={EXAMPLE_INSTRUCTION}
              />
            </Suspense>
          </div>
          {referenced.length > 0 && (
            <p className="note">
              Herangezogen: {referenced.map(shown).join(", ")}
            </p>
          )}
          <div className={more ? "controls more" : "controls"}>
            <label className="compact" title="Anbieter: OpenRouter">
              <span className="sr-only">Anbieter: OpenRouter</span>
              <select
                aria-label="Modell"
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
            </label>
            <label className="compact">
              <span className="sr-only">Länge</span>
              <select
                aria-label="Länge"
                value={length}
                disabled={busy}
                onChange={(event) => {
                  setLength(event.target.value as WriteLength);
                }}
              >
                {LENGTHS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="more-toggle"
              aria-expanded={more}
              aria-label="Weitere Knöpfe"
              onClick={() => {
                setMore(!more);
              }}
            >
              ⋯
            </button>
            {/* After a choice behind "⋯" the extra buttons fold away again (step 5.2). */}
            <span
              className="extra"
              onClick={(event) => {
                if (
                  event.target instanceof Element &&
                  event.target.closest("button") !== null
                ) {
                  setMore(false);
                }
              }}
            >
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
              {tools}
            </span>
            <span className="spacer" />
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
            {busy && (
              <button type="button" onClick={stop}>
                Abbrechen
              </button>
            )}
            <button
              type="button"
              className="primary"
              aria-label={sceneOpen ? "Szene beginnen" : "Weiterschreiben"}
              disabled={busy || chosenModel === ""}
              onClick={() => void send(newOrder())}
            >
              {sceneOpen ? (
                "Szene beginnen"
              ) : (
                <>
                  <span className="wide-only">Weiterschreiben</span>
                  <span className="narrow-only">Weiter</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Rough height of the proposal, where the browser cannot size the field to its text. */
function rowsFor(text: string): number {
  const lines = text
    .split("\n")
    .reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / 75)), 0);
  return Math.max(2, lines);
}

/** Whether a key press goes into a field the author is writing in. */
function writable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
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
