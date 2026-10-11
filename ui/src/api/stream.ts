/** Server-Sent Events reader shared by the proposal stream and the world builder stream. */

import { errorFrom, isRecord, notifyUnauthorized } from "./core";

/** A web page the AI's answer is based on (web search of the world builder). */
export interface Source {
  url: string;
  title: string;
}

export const WRITE_EVENTS = ["start", "text", "hinweis", "done", "error"];

/**
 * POST a JSON body and read the answer as Server-Sent Events: each event with a name in `names`
 * goes to `onEvent`, a stream that ends without `done` or `error` ends with `lost`.
 */
export async function streamEvents<E extends { type: string }>(
  path: string,
  body: unknown,
  names: readonly string[],
  lost: E,
  onEvent: (event: E) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok || response.body === null) {
    const data: unknown = await response.json().catch(() => null);
    if (response.status === 401) {
      notifyUnauthorized();
    }
    throw errorFrom(response.status, data);
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let ended = false;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += value;
    let end = buffer.indexOf("\n\n");
    while (end >= 0) {
      const event = parseEvent(buffer.slice(0, end), names);
      buffer = buffer.slice(end + 2);
      if (event !== null) {
        ended ||= event.type === "done" || event.type === "error";
        onEvent(event as E);
      }
      end = buffer.indexOf("\n\n");
    }
  }
  if (!ended) {
    onEvent(lost);
  }
}

function parseEvent(
  block: string,
  names: readonly string[],
): { type: string } | null {
  let name = "";
  let data = "";
  for (const line of block.split("\n")) {
    if (line.startsWith("event: ")) {
      name = line.slice("event: ".length);
    } else if (line.startsWith("data: ")) {
      data += line.slice("data: ".length);
    }
  }
  if (!names.includes(name)) {
    return null;
  }
  const parsed: unknown = JSON.parse(data);
  const event: Record<string, unknown> = {
    ...(isRecord(parsed) ? parsed : {}),
    type: name,
  };
  if (name === "quellen") {
    event["sources"] = webSources(event["sources"]);
  }
  return { ...event, type: name };
}

/** The sources worth showing: a title and a link to a web page (http or https) only. */
function webSources(value: unknown): Source[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const found: Source[] = [];
  for (const item of value as unknown[]) {
    if (
      isRecord(item) &&
      typeof item["url"] === "string" &&
      /^https?:\/\//i.test(item["url"]) &&
      typeof item["title"] === "string"
    ) {
      found.push({ url: item["url"], title: item["title"] });
    }
  }
  return found;
}
