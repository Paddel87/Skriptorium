import { useEffect, useRef, useState } from "react";
import {
  api,
  describeError,
  describeWriteError,
  streamWorldbuilder,
  type CanonEntry,
  type ManuscriptSearch,
  type Source,
} from "../api";
import { referencedEntries } from "../references";

/** One turn of the conversation as the panel shows it. */
export interface Turn {
  role: "user" | "assistant";
  content: string;
  /** Answers: the model that was asked, and whether the web search was on. */
  model?: string;
  webSearch: boolean;
  sources: Source[];
  /** Answers: cut off by the author, or ended by an error (text for the author). */
  aborted: boolean;
  failure: string | null;
}

export type WorldbuilderFlow = ReturnType<typeof useWorldbuilder>;

/**
 * The conversation with the world builder (step 6.7): held in this state only, lost on reload.
 * `send` returns whether the message stays in the conversation – an answer without any text
 * (refusal, error, abort at once) takes the message back, so the turns keep alternating and the
 * author can edit and resend it.
 */
export function useWorldbuilder({
  world,
  entries,
  model,
}: {
  world: string;
  entries: readonly CanonEntry[];
  /** Model asked (the send button needs one). */
  model: string;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [thinking, setThinking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [],
  );

  async function send(
    text: string,
    webSearch: boolean,
    manuscript: ManuscriptSearch | null = null,
  ): Promise<boolean> {
    const abort = new AbortController();
    controller.current = abort;
    const user: Turn = {
      role: "user",
      content: text,
      webSearch,
      sources: [],
      aborted: false,
      failure: null,
    };
    const answer: Turn = { ...user, role: "assistant", content: "" };
    const messages = [...turns, user].map(({ role, content }) => ({
      role,
      content,
    }));
    const references = referencedEntries(text, entries).map(({ id }) => id);
    let received = "";
    // What went wrong: an error event of the stream, or a refusal / broken connection.
    const problem: { text: string | null } = { text: null };
    setTurns([...turns, user, answer]);
    setError(null);
    setBusy(true);
    setThinking(true);
    const patch = (change: Partial<Turn>) => {
      setTurns((all) =>
        all.map((turn, at) =>
          at === all.length - 1 ? { ...turn, ...change } : turn,
        ),
      );
    };
    try {
      await streamWorldbuilder(
        api.worldbuilderPath(world),
        {
          messages,
          references,
          model,
          web_search: webSearch,
          ...(manuscript !== null && { manuscript }),
        },
        (event) => {
          if (event.type === "start") {
            patch({ model: event.model });
          } else if (event.type === "text") {
            received += event.text;
            setThinking(false);
            patch({ content: received });
          } else if (event.type === "quellen") {
            patch({ sources: event.sources });
          } else if (event.type === "error") {
            problem.text = describeWriteError(event.kind);
          }
        },
        abort.signal,
      );
    } catch (reason: unknown) {
      if (!abort.signal.aborted) {
        problem.text = describeError(reason);
      }
    }
    const aborted = abort.signal.aborted;
    controller.current = null;
    setBusy(false);
    setThinking(false);
    if (received === "") {
      // Nothing to keep: the message goes back to the author.
      setTurns(turns);
      setError(problem.text);
      return false;
    }
    patch({ aborted, failure: problem.text });
    return true;
  }

  function stop() {
    controller.current?.abort();
  }

  return { turns, thinking, busy, error, send, stop };
}
