import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import {
  type CanonEntry,
  type GuestLink,
  type WriteLength,
  type WriteOrder,
} from "../api";
import { referencedEntries, suggestions } from "../references";
import { loadStoryEntries } from "../storyEntries";
import { useLoad } from "../useLoad";
import { ComposerControls } from "./ComposerControls";
import { ErrorText } from "./Common";
import { ModelManager } from "./ModelManager";
import { ProposalBlock } from "./ProposalBlock";
import { ReferenceNotes } from "./ReferenceNotes";
import { SceneForm } from "./SceneForm";
import { useChatScroll } from "./useChatScroll";
import { useModelChoice } from "./useModelChoice";
import { useWriteFlow } from "./useWriteFlow";

export { offeredModels } from "./useModelChoice";
export { describeUsage } from "./useWriteFlow";

// CodeMirror is large; the instruction field is loaded with the chapter like the editor.
const InstructionEditor = lazy(() =>
  import("./InstructionEditor").then((module) => ({
    default: module.InstructionEditor,
  })),
);

const NO_GUESTS: readonly GuestLink[] = [];

/**
 * Grey example in the empty instruction field (step 4.15); not tied to any world. Since the
 * owner's finding after step 7.5 it explains the field instead of giving a story's example.
 */
const EXAMPLE_INSTRUCTION =
  "Was soll als Nächstes geschehen? Leer lassen = einfach weiterschreiben. Mit @ holst du Figuren, Orte und mehr aus dem Kanon dazu.";

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
  onLookUp,
  onNoted,
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
  /** Show a referenced entry over the page (step 5.16); given, the names under "Herangezogen" are links. */
  onLookUp?: (entry: CanonEntry) => void;
  /** Called after the instruction of a taken-over proposal went into the history (step 5.13). */
  onNoted?: () => void;
}) {
  const choice = useModelChoice(storyModel, "schreiben", onModelChange);
  const { modelList, chosenModel } = choice;
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

  const [length, setLength] = useState<WriteLength>("mittel");
  const [instruction, setInstruction] = useState("");
  const [sceneOpen, setSceneOpen] = useState(false);
  const [place, setPlace] = useState("");
  const [characters, setCharacters] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const instructionLabel = useId();

  const flow = useWriteFlow({
    world,
    story,
    chapter,
    prepare,
    onAccept,
    onNoted,
    onTaken: () => {
      setInstruction("");
      setSceneOpen(false);
      setPlace("");
      setCharacters([]);
      setGoal("");
    },
  });
  const { phase, busy } = flow;
  const { scroller, composer } = useChatScroll(endSignal, phase, flow.proposal);

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

  const storyEntries = entries.data ?? [];
  const places = storyEntries.filter((e) => e.category === "ort");
  const figures = storyEntries.filter((e) => e.category === "figur");
  const referenced = referencedEntries(instruction, storyEntries);
  const suggested = suggestions(instruction, storyEntries);
  const shown = (entry: CanonEntry) =>
    entry.world === world ? entry.name : `${entry.name} (Gast)`;

  return (
    <section className="chat" aria-label="Schreiben mit der KI">
      <div className="chat-scroll" ref={scroller}>
        <div className="chat-sheet">
          {children}
          {flow.note !== null && phase !== "idle" && (
            <p className="note" role="note">
              Hinweis der KI (wird nicht übernommen): {flow.note}
            </p>
          )}
          <ProposalBlock
            flow={flow}
            chosenModel={chosenModel}
            length={length}
          />
        </div>
      </div>
      <div className="composer" ref={composer}>
        <div className="composer-sheet">
          <ErrorText
            message={
              choice.loadError ??
              entries.error ??
              choice.modelError ??
              flow.historyError
            }
          />
          {choice.managing && modelList !== undefined && (
            <ModelManager
              list={modelList}
              onChange={choice.setSavedList}
              onClose={() => {
                choice.setManaging(false);
              }}
            />
          )}
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
          <ReferenceNotes
            busy={busy}
            suggested={suggested}
            referenced={referenced}
            instruction={instruction}
            storyEntries={storyEntries}
            shown={shown}
            onInstruction={setInstruction}
            onLookUp={onLookUp}
          />
          <ComposerControls
            offered={choice.offered}
            modelList={modelList}
            chosenModel={chosenModel}
            onChooseModel={choice.choose}
            onManageModels={() => {
              choice.setManaging(true);
            }}
            length={length}
            onLength={setLength}
            sceneOpen={sceneOpen}
            onSceneOpen={setSceneOpen}
            tools={tools}
            phase={phase}
            seconds={flow.seconds}
            busy={busy}
            onStop={flow.stop}
            onSend={() => void flow.send(newOrder())}
          />
        </div>
      </div>
    </section>
  );
}
