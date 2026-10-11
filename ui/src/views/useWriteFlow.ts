import { useEffect, useRef, useState } from "react";
import {
  api,
  describeError,
  formatCost,
  streamWrite,
  type WriteErrorKind,
  type WriteEvent,
  type WriteOrder,
} from "../api";

export type Phase = "idle" | "thinking" | "writing" | "review";

export type Usage = Extract<WriteEvent, { type: "done" }>;

export type WriteFlow = ReturnType<typeof useWriteFlow>;

/**
 * The turn with the AI (steps 3.3, 5.13): send an order and receive the proposal as a stream,
 * then take it over, change it or discard it. Taken-over text goes through `onAccept`;
 * `onTaken` resets the instruction form afterwards, `onNoted` follows once the instruction is in
 * the history.
 */
export function useWriteFlow({
  world,
  story,
  chapter,
  prepare,
  onAccept,
  onTaken,
  onNoted,
}: {
  world: string;
  story: string;
  chapter: number;
  prepare: () => Promise<boolean>;
  onAccept: (text: string) => Promise<void>;
  onTaken: () => void;
  onNoted?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [proposal, setProposal] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [failure, setFailure] = useState<WriteErrorKind | null>(null);
  const [aborted, setAborted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The instruction of a taken-over proposal could not be noted (step 5.13); shown below.
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<WriteOrder | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [editing, setEditing] = useState(false);
  const controller = useRef<AbortController | null>(null);
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
    setHistoryError(null);
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
    // What the proposal came from, for the history (step 5.13); not the field as it is now.
    const order = lastOrder;
    const text = proposal.trim();
    try {
      await onAccept(proposal);
      onTaken();
      discard();
    } catch (reason: unknown) {
      setError(describeError(reason));
      return;
    }
    if (order === null) {
      return;
    }
    const asked = order.instruction.trim();
    try {
      await api.addInstruction(world, story, chapter, {
        instruction:
          asked !== ""
            ? asked
            : (order.scene ?? null) !== null
              ? "Neue Szene"
              : "Weiter",
        text,
        model: order.model,
      });
      onNoted?.();
    } catch (reason: unknown) {
      setHistoryError(
        `Übernommen, aber nicht im Verlauf vermerkt: ${describeError(reason)}`,
      );
    }
  }

  return {
    phase,
    busy,
    proposal,
    setProposal,
    note,
    seconds,
    failure,
    aborted,
    error,
    historyError,
    lastOrder,
    usage,
    editing,
    setEditing,
    send,
    stop,
    discard,
    accept,
  };
}

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
