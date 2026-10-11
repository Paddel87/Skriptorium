import { useState, type ReactNode } from "react";
import type { ModelList, WriteLength } from "../api";
import { ModelSelect } from "./ModelSelect";
import type { Phase } from "./useWriteFlow";

/** Lengths of a proposal as the server names them (step 5.15). */
const LENGTHS: readonly WriteLength[] = ["kurz", "mittel", "lang"];

/**
 * The line below the instruction: model, length, "Neue Szene" and further buttons behind "⋯",
 * the state of the request, and the buttons to stop and to send.
 */
export function ComposerControls({
  offered,
  modelList,
  chosenModel,
  onChooseModel,
  onManageModels,
  length,
  onLength,
  sceneOpen,
  onSceneOpen,
  tools,
  phase,
  seconds,
  busy,
  onStop,
  onSend,
}: {
  offered: readonly string[];
  modelList: ModelList | undefined;
  chosenModel: string;
  onChooseModel: (model: string) => void;
  onManageModels: () => void;
  length: WriteLength;
  onLength: (length: WriteLength) => void;
  sceneOpen: boolean;
  onSceneOpen: (open: boolean) => void;
  /** More buttons in the line (e.g. "In den Kanon"). */
  tools?: ReactNode;
  phase: Phase;
  seconds: number;
  busy: boolean;
  onStop: () => void;
  onSend: () => void;
}) {
  const [more, setMore] = useState(false);
  return (
    <div className={more ? "controls more" : "controls"}>
      <ModelSelect
        offered={offered}
        modelList={modelList}
        chosenModel={chosenModel}
        onChoose={onChooseModel}
        onManage={onManageModels}
      />
      <label className="compact">
        <span className="sr-only">Länge</span>
        <select
          aria-label="Länge"
          value={length}
          disabled={busy}
          onChange={(event) => {
            onLength(event.target.value as WriteLength);
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
              onSceneOpen(event.target.checked);
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
        <button type="button" onClick={onStop}>
          Abbrechen
        </button>
      )}
      <button
        type="button"
        className="primary"
        aria-label={sceneOpen ? "Szene beginnen" : "Weiterschreiben"}
        disabled={busy || chosenModel === ""}
        onClick={onSend}
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
  );
}
