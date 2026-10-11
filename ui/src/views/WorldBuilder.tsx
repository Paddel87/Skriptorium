import { useEffect, useRef, useState } from "react";
import type { CanonEntry } from "../api";
import { sourceLabel, withoutLinks, withoutMarks } from "../citations";
import { lastKanonBlock } from "../kanonBlock";
import { formatCents, shortName, webSearchSurcharge } from "../models";
import { ErrorText } from "./Common";
import { ModelManager } from "./ModelManager";
import { ModelSelect } from "./ModelSelect";
import { useModelChoice } from "./useModelChoice";
import { useWorldbuilder, type Turn } from "./useWorldbuilder";

/** The follow-up the author sends with "Andere Variante". */
const VARIANT = "Bitte eine andere Variante.";

/**
 * The AI world builder (step 6.7, ADR-064): a conversation to draft new canon entries or revise
 * existing ones. Nothing is saved here – "Als Kanon übernehmen" hands the proposal of an answer
 * (its ```kanon block) to `onTakeOver`, which opens the import preview where the author confirms.
 */
export function WorldBuilder({
  world,
  entries,
  onTakeOver,
  onClose,
}: {
  world: string;
  /** The canon of the world, for the entries named with `@`. */
  entries: readonly CanonEntry[];
  /** Markdown in the import format. */
  onTakeOver: (markdown: string) => void;
  onClose: () => void;
}) {
  const choice = useModelChoice(null);
  const flow = useWorldbuilder({
    world,
    entries,
    model: choice.chosenModel,
  });
  const [draft, setDraft] = useState("");
  const [webSearch, setWebSearch] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  // Whether the author is at the end of the conversation; only then does the view follow it.
  const atEnd = useRef(true);
  const catalog = choice.modelList?.catalog ?? [];
  const surcharge = formatCents(
    webSearchSurcharge(
      catalog.find((model) => model.id === choice.chosenModel),
    ),
  );

  useEffect(() => {
    const area = log.current;
    if (area !== null && atEnd.current) {
      area.scrollTop = area.scrollHeight;
    }
  }, [flow.turns]);

  /** Send a message; if it was taken back (no answer), `draft` is put back into the field. */
  async function send(text: string, draft?: string) {
    atEnd.current = true;
    const keep = await flow.send(text, webSearch);
    if (!keep && draft !== undefined) {
      setDraft(draft);
    }
  }

  function submit() {
    const text = draft;
    setDraft("");
    void send(text.trim(), text);
  }

  const last = flow.turns.length - 1;
  return (
    <section className="wb" aria-label="Weltenbauer">
      <div className="row wb-head">
        <h3>Weltenbauer</h3>
        <button type="button" className="link" onClick={onClose}>
          schließen
        </button>
      </div>
      <p className="note">
        Entwirf neue Einträge oder überarbeite vorhandene im Gespräch. In den
        Kanon kommt nur, was du in der Vorschau bestätigst.
      </p>
      <div
        className="wb-log"
        ref={log}
        onScroll={(event) => {
          const area = event.currentTarget;
          atEnd.current =
            area.scrollHeight - area.scrollTop - area.clientHeight < 48;
        }}
      >
        {flow.turns.map((turn, at) => (
          <Bubble
            key={at}
            turn={turn}
            modelName={shortName(
              catalog.find((model) => model.id === turn.model),
              turn.model ?? "",
            )}
            thinking={flow.thinking && at === last}
            canTakeOver={!flow.busy || at !== last}
            onTakeOver={onTakeOver}
            onVariant={() => void send(VARIANT)}
            busy={flow.busy}
          />
        ))}
      </div>
      <ErrorText
        message={choice.loadError ?? choice.modelError ?? flow.error}
      />
      {choice.managing && choice.modelList !== undefined && (
        <ModelManager
          list={choice.modelList}
          onChange={choice.setSavedList}
          onClose={() => {
            choice.setManaging(false);
          }}
        />
      )}
      <div className="wb-composer">
        <textarea
          rows={3}
          aria-label="Nachricht an den Weltenbauer"
          placeholder="Was soll entstehen oder besser werden? Mit @ einen Eintrag nennen."
          value={draft}
          disabled={flow.busy}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
        />
        <div className="controls">
          <ModelSelect
            offered={choice.offered}
            modelList={choice.modelList}
            chosenModel={choice.chosenModel}
            onChoose={choice.choose}
            onManage={() => {
              choice.setManaging(true);
            }}
          />
          <label className="check">
            <input
              type="checkbox"
              checked={webSearch}
              disabled={flow.busy}
              onChange={(event) => {
                setWebSearch(event.target.checked);
              }}
            />
            {surcharge === null
              ? "mit Websuche (teurer, Preis unbekannt)"
              : `mit Websuche (ca. +${surcharge})`}
          </label>
          <span className="spacer" />
          {flow.busy && (
            <button type="button" onClick={flow.stop}>
              Abbrechen
            </button>
          )}
          <button
            type="button"
            className="primary"
            disabled={
              flow.busy || draft.trim() === "" || choice.chosenModel === ""
            }
            onClick={submit}
          >
            Senden
          </button>
        </div>
      </div>
    </section>
  );
}

/** One turn: the author's message on the right, the AI's answer on the left. */
function Bubble({
  turn,
  modelName,
  thinking,
  canTakeOver,
  busy,
  onTakeOver,
  onVariant,
}: {
  turn: Turn;
  modelName: string;
  thinking: boolean;
  canTakeOver: boolean;
  busy: boolean;
  onTakeOver: (markdown: string) => void;
  onVariant: () => void;
}) {
  if (turn.role === "user") {
    return (
      <div className="wb-bubble user">
        {turn.content}
        {turn.webSearch && <span className="note"> · mit Websuche</span>}
      </div>
    );
  }
  const block = canTakeOver ? lastKanonBlock(turn.content) : null;
  const proposal = block === null ? null : withoutMarks(block);
  return (
    <div className="wb-bubble ai">
      <div className="note">
        Vorschlag der KI{modelName !== "" && ` · ${modelName}`}
        {turn.webSearch && " · mit Websuche"}
      </div>
      {thinking && (
        <p className="note" role="status">
          denkt nach …
        </p>
      )}
      {turn.content !== "" && (
        <div className="wb-text">{withoutLinks(turn.content)}</div>
      )}
      {turn.sources.length > 0 && (
        <p className="note">
          Fundstellen:{" "}
          {turn.sources.map((source, at) => (
            <span key={source.url}>
              {at > 0 && " · "}
              <a href={source.url} target="_blank" rel="noreferrer noopener">
                {sourceLabel(source)}
              </a>
            </span>
          ))}
        </p>
      )}
      {turn.aborted && <p className="note">Abgebrochen.</p>}
      {turn.failure !== null && <ErrorText message={turn.failure} />}
      {proposal !== null && (
        <div className="row">
          <button
            type="button"
            className="primary"
            onClick={() => {
              onTakeOver(proposal);
            }}
          >
            Als Kanon übernehmen
          </button>
          <button type="button" disabled={busy} onClick={onVariant}>
            Andere Variante
          </button>
        </div>
      )}
    </div>
  );
}
