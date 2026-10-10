/**
 * Client for the HTTP API of the server (docs/architecture.md section 4).
 *
 * The browser sends the session cookie and the Origin header by itself; every body is JSON
 * because the server refuses other content types for changing requests (ASVS 3.5.1-3.5.3).
 */

export type Category =
  "figur" | "ort" | "gegenstand" | "zeitlinie" | "regel" | "kultur";
export type Form = "roman" | "kurzgeschichte" | "fragment";
export type SummaryStatus = "fehlt" | "erzeugt" | "geprüft";

/** Categories in display order; `plural` names a group of entries (filter, list on the canon page). */
export const CATEGORIES: readonly {
  id: Category;
  label: string;
  plural: string;
}[] = [
  { id: "figur", label: "Figur", plural: "Figuren" },
  { id: "ort", label: "Ort / Geografie", plural: "Orte" },
  { id: "gegenstand", label: "Gegenstand", plural: "Gegenstände" },
  { id: "zeitlinie", label: "Zeitlinie", plural: "Zeitlinie" },
  { id: "regel", label: "Regel", plural: "Regeln" },
  { id: "kultur", label: "Kultur", plural: "Kultur" },
];

export const FORMS: readonly { id: Form; label: string }[] = [
  { id: "roman", label: "Roman" },
  { id: "kurzgeschichte", label: "Kurzgeschichte" },
  { id: "fragment", label: "Fragment" },
];

export interface World {
  id: string;
  name: string;
  description: string;
}

export interface CanonEntry {
  world: string;
  id: string;
  category: Category;
  name: string;
  aliases: string[];
  status: string | null;
  body: string;
}

export interface ImportItem {
  id: string;
  name: string;
  category: Category | null;
  aliases: string[];
  body: string;
  conflict: string | null;
}

export interface ImportPreview {
  world: string;
  introduction: string;
  items: ImportItem[];
  not_taken_over: string[];
}

export interface ImportResult {
  created: string[];
  overwritten: string[];
  skipped: string[];
}

/** A canon entry of another world, bound into one story only (FR-017). */
export interface GuestLink {
  world: string;
  entry: string;
}

/** A fact about a canon entry that holds only in one story (FR-024). */
export interface StoryFact {
  entry: string;
  fact: string;
}

/** Atmospheric writing style (step 5.6); the empty style has nothing set. */
export interface WritingStyle {
  tone: string[];
  atmosphere: string[];
  style: string[];
  tempo: string | null;
  explicitness: string | null;
  free: string;
}

export interface Story {
  world: string;
  id: string;
  title: string;
  form: Form;
  perspective: string | null;
  controlled_characters: string[];
  guest_links: GuestLink[];
  facts: StoryFact[];
  summary: string;
  /** Model chosen for this story (step 3.9); `null` means the preset model. */
  model: string | null;
  /** Genres and the default writing style that new chapters copy (step 5.6). */
  genres: string[];
  writing_style: WritingStyle;
}

export interface Chapter {
  world: string;
  story: string;
  number: number;
  title: string;
  status: "in-arbeit" | "abgeschlossen";
  summary: string;
  summary_status: SummaryStatus;
  text: string;
  /** `null`: no style of its own, the default of the story applies (step 5.6). */
  writing_style: WritingStyle | null;
}

export interface SessionInfo {
  id: string;
  created: string;
  last_seen: string;
  client: string;
  current: boolean;
}

/** An error answer of the server with its HTTP status. */
export class ApiError extends Error {
  readonly status: number;
  readonly reason: string | null;

  constructor(status: number, message: string, reason: string | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.reason = reason;
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Paths whose 401 is an expected answer, not an expired session. */
const OWN_401 = new Set(["/api/auth/login", "/api/auth/session"]);
let unauthorizedHandler: (() => void) | null = null;

/** Called when a request fails because the session has ended (e.g. timeout, ended elsewhere). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

/** Send one request; resolves with the JSON body or `undefined` for 204. */
export async function request(
  method: Method,
  path: string,
  body?: unknown,
): Promise<unknown> {
  const init: RequestInit = { method, credentials: "same-origin", headers: {} };
  if (body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }
  const response = await fetch(path, init);
  if (response.status === 204) {
    return undefined;
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && !OWN_401.has(path)) {
      unauthorizedHandler?.();
    }
    throw errorFrom(response.status, data);
  }
  return data;
}

function errorFrom(status: number, data: unknown): ApiError {
  const detail = isRecord(data) ? data.detail : undefined;
  if (typeof detail === "string") {
    return new ApiError(status, detail);
  }
  if (isRecord(detail) && typeof detail.reason === "string") {
    return new ApiError(status, detail.reason, detail.reason);
  }
  if (Array.isArray(detail)) {
    return new ApiError(status, "Eingabe ungültig");
  }
  return new ApiError(status, `Fehler ${String(status)}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** User-facing text for an error, in German. */
export function describeError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Keine Verbindung zum Server.";
  }
  const reasons: Record<string, string> = {
    too_short: "Das Passwort braucht mindestens 15 Zeichen.",
    too_long: "Das Passwort darf höchstens 128 Zeichen haben.",
    context_word:
      "Das Passwort enthält ein leicht zu erratendes Wort (z. B. einen Weltnamen).",
    breached:
      "Dieses Passwort ist in bekannten Datenlecks aufgetaucht. Bitte ein anderes wählen.",
  };
  if (error.reason !== null && error.reason in reasons) {
    return reasons[error.reason] ?? error.message;
  }
  if (error.status === 429) {
    return "Zu viele Fehlversuche. Bitte in 15 Minuten erneut versuchen.";
  }
  if (
    error.status === 503 &&
    error.message === "KI-Anbieter nicht eingerichtet"
  ) {
    return "Kein KI-Anbieter eingerichtet (OPENROUTER_API_KEY fehlt auf dem Server).";
  }
  if (error.status === 503) {
    return "Die Passwortprüfung ist gerade nicht erreichbar. Bitte später erneut versuchen.";
  }
  return error.message;
}

/** Requests, tokens and cost of one month (step 3.9, ADR-023). */
export interface MonthUsage {
  month: string;
  requests: number;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  /** Requests without a cost reported by the provider (aborted, failed). */
  without_cost: number;
}

/** A cost in US dollars as shown to the author, e.g. "0,0021 $". */
export function formatCost(cost: number): string {
  return `${cost.toLocaleString("de-DE", { maximumFractionDigits: 4 })} $`;
}

/** One model of OpenRouter's catalog (step 5.12, ADR-055); prices in US dollars. */
export interface CatalogModel {
  id: string;
  name: string;
  provider: string;
  /** Per million tokens; `null` if OpenRouter names no price. */
  input_price: number | null;
  output_price: number | null;
  /** One proposal: 30,000 tokens in, 500 out. */
  estimated_cost: number | null;
  context_length: number | null;
  /** Inputs pass OpenRouter's own moderation. */
  moderated: boolean;
  /** "lange": long reasoning measured; "vor": always reasons first. */
  thinking: "lange" | "vor" | null;
  /** Checked with the owner's stories. */
  checked: boolean;
}

/** Favorites, the preset model and the catalog (ADR-055). */
export interface ModelList {
  /** Same as `favorites`. */
  models: string[];
  default: string;
  favorites: string[];
  /** Empty while OpenRouter's list cannot be loaded. */
  catalog: CatalogModel[];
  catalog_available: boolean;
}

/** Length of a proposal, chosen per request (step 5.15). */
export type WriteLength = "kurz" | "mittel" | "lang";

/** What the author asks the AI for (step 3.3); an empty instruction means "continue". */
export interface WriteOrder {
  instruction: string;
  references?: string[];
  scene?: { place: string | null; characters: string[]; goal: string } | null;
  model: string;
  /** Missing: the server's default "mittel". */
  length?: WriteLength;
}

/** Why a proposal ended without `done`; "verbindung" means the stream broke off. */
export type WriteErrorKind =
  | "abgelehnt"
  | "zu_viele_anfragen"
  | "ungueltig"
  | "nicht_erreichbar"
  | "verbindung";

/** Events of the proposal stream (Server-Sent Events of the write endpoint). */
export type WriteEvent =
  | { type: "start"; model: string; estimated_tokens: number }
  | { type: "text"; text: string }
  /** The AI's note that it changed an instruction contradicting the canon (step 4.14). */
  | { type: "hinweis"; text: string }
  | {
      type: "done";
      input_tokens: number | null;
      output_tokens: number | null;
      cost_usd: number | null;
      finish_reason: string | null;
    }
  | { type: "error"; kind: WriteErrorKind };

/** User-facing text for a failed proposal, in German. */
export function describeWriteError(kind: WriteErrorKind): string {
  const texts: Record<WriteErrorKind, string> = {
    abgelehnt: "Das Modell hat die Anfrage abgelehnt.",
    zu_viele_anfragen:
      "Der Anbieter meldet zu viele Anfragen. Bitte kurz warten oder ein anderes Modell wählen.",
    ungueltig: "Der Anbieter hat die Anfrage als ungültig abgelehnt.",
    nicht_erreichbar: "Der KI-Anbieter ist gerade nicht erreichbar.",
    verbindung: "Die Verbindung ist abgebrochen.",
  };
  return texts[kind];
}

/** Result of creating the summaries (step 3.6); `failure` names the step that failed. */
export interface SummaryResult {
  chapter: Chapter;
  story: Story;
  failure: {
    stage: "kapitel" | "gesamt";
    kind: Exclude<WriteErrorKind, "verbindung"> | "leer" | "zu_gross";
  } | null;
}

/** User-facing text for a failed summary step, in German. */
export function describeSummaryFailure(
  failure: NonNullable<SummaryResult["failure"]>,
): string {
  const reason =
    failure.kind === "leer"
      ? "Das Modell hat keinen Text geliefert."
      : failure.kind === "zu_gross"
        ? "Der Text ist zu lang für eine Anfrage."
        : describeWriteError(failure.kind);
  return failure.stage === "kapitel"
    ? `Kurzfassung nicht erstellt. ${reason} Bis dahin nutzt die KI den Kapitelanfang.`
    : `Kurzfassung erstellt, Gesamtzusammenfassung nicht fortgeschrieben. ${reason}`;
}

/**
 * Ask for a proposal at the end of a chapter and pass each event to `onEvent` as it arrives.
 * Refusals before streaming (unknown entry, context too large, no provider) throw an ApiError;
 * aborting through `signal` rejects with the abort reason. A stream that ends without `done` or
 * `error` reports the error kind "verbindung". Nothing is saved on the server.
 */
export async function streamWrite(
  path: string,
  order: WriteOrder,
  onEvent: (event: WriteEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
    signal,
  });
  if (!response.ok || response.body === null) {
    const data: unknown = await response.json().catch(() => null);
    if (response.status === 401) {
      unauthorizedHandler?.();
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
      const event = parseEvent(buffer.slice(0, end));
      buffer = buffer.slice(end + 2);
      if (event !== null) {
        ended ||= event.type === "done" || event.type === "error";
        onEvent(event);
      }
      end = buffer.indexOf("\n\n");
    }
  }
  if (!ended) {
    onEvent({ type: "error", kind: "verbindung" });
  }
}

function parseEvent(block: string): WriteEvent | null {
  let name = "";
  let data = "";
  for (const line of block.split("\n")) {
    if (line.startsWith("event: ")) {
      name = line.slice("event: ".length);
    } else if (line.startsWith("data: ")) {
      data += line.slice("data: ".length);
    }
  }
  const types = ["start", "text", "hinweis", "done", "error"];
  if (!types.includes(name)) {
    return null;
  }
  const parsed: unknown = JSON.parse(data);
  return { ...(isRecord(parsed) ? parsed : {}), type: name } as WriteEvent;
}

const enc = encodeURIComponent;
const worldPath = (world: string) => `/api/worlds/${enc(world)}`;
const storyPath = (world: string, story: string) =>
  `${worldPath(world)}/stories/${enc(story)}`;

/** Typed operations of the API. */
export const api = {
  session: () => request("GET", "/api/auth/session") as Promise<SessionInfo>,
  login: (password: string) => request("POST", "/api/auth/login", { password }),
  logout: () => request("POST", "/api/auth/logout"),
  setup: (code: string, password: string) =>
    request("POST", "/api/auth/setup", { code, password }),
  changePassword: (current: string, next: string, endOthers: boolean) =>
    request("POST", "/api/auth/password", {
      current_password: current,
      new_password: next,
      end_other_sessions: endOthers,
    }),
  sessions: () =>
    request("GET", "/api/auth/sessions") as Promise<SessionInfo[]>,
  endSession: (id: string) =>
    request("DELETE", `/api/auth/sessions/${enc(id)}`),
  endOtherSessions: () => request("DELETE", "/api/auth/sessions"),

  worlds: () => request("GET", "/api/worlds") as Promise<World[]>,
  createWorld: (name: string, description: string) =>
    request("POST", "/api/worlds", { name, description }) as Promise<World>,
  updateWorld: (
    world: string,
    change: Partial<Pick<World, "name" | "description">>,
  ) => request("PATCH", worldPath(world), change) as Promise<World>,

  entries: (world: string) =>
    request("GET", `${worldPath(world)}/entries`) as Promise<CanonEntry[]>,
  entry: (world: string, id: string) =>
    request(
      "GET",
      `${worldPath(world)}/entries/${enc(id)}`,
    ) as Promise<CanonEntry>,
  createEntry: (world: string, entry: Omit<CanonEntry, "world" | "id">) =>
    request(
      "POST",
      `${worldPath(world)}/entries`,
      entry,
    ) as Promise<CanonEntry>,
  updateEntry: (
    world: string,
    id: string,
    change: Partial<Omit<CanonEntry, "world" | "id">>,
  ) =>
    request(
      "PATCH",
      `${worldPath(world)}/entries/${enc(id)}`,
      change,
    ) as Promise<CanonEntry>,
  deleteEntry: (world: string, id: string) =>
    request("DELETE", `${worldPath(world)}/entries/${enc(id)}`),

  previewImport: (world: string, markdown: string) =>
    request("POST", `${worldPath(world)}/import/preview`, {
      markdown,
    }) as Promise<ImportPreview>,
  applyImport: (
    world: string,
    markdown: string,
    categories: Record<string, Category>,
    overwrite: string[],
  ) =>
    request("POST", `${worldPath(world)}/import`, {
      markdown,
      categories,
      overwrite,
    }) as Promise<ImportResult>,

  stories: (world: string) =>
    request("GET", `${worldPath(world)}/stories`) as Promise<Story[]>,
  createStory: (
    world: string,
    title: string,
    form: Form,
    perspective: string | null,
  ) =>
    request("POST", `${worldPath(world)}/stories`, {
      title,
      form,
      perspective,
    }) as Promise<Story>,
  updateStory: (
    world: string,
    story: string,
    change: {
      perspective?: string | null;
      controlled_characters?: string[];
      model?: string | null;
      genres?: string[];
      writing_style?: WritingStyle;
    },
  ) => request("PATCH", storyPath(world, story), change) as Promise<Story>,
  addGuest: (world: string, story: string, guest: GuestLink) =>
    request(
      "POST",
      `${storyPath(world, story)}/guests`,
      guest,
    ) as Promise<Story>,
  removeGuest: (world: string, story: string, guest: GuestLink) =>
    request(
      "DELETE",
      `${storyPath(world, story)}/guests/${enc(guest.world)}/${enc(guest.entry)}`,
    ) as Promise<Story>,
  addFact: (world: string, story: string, fact: StoryFact) =>
    request("POST", `${storyPath(world, story)}/facts`, fact) as Promise<Story>,
  removeFact: (world: string, story: string, fact: StoryFact) =>
    request(
      "DELETE",
      `${storyPath(world, story)}/facts`,
      fact,
    ) as Promise<Story>,
  chapters: (world: string, story: string) =>
    request("GET", `${storyPath(world, story)}/chapters`) as Promise<Chapter[]>,
  saveChapter: (
    world: string,
    story: string,
    number: number,
    change: {
      title?: string;
      text?: string;
      /** `null` takes the chapter back to the default of the story. */
      writing_style?: WritingStyle | null;
    },
  ) =>
    request(
      "PUT",
      `${storyPath(world, story)}/chapters/${String(number)}`,
      change,
    ) as Promise<Chapter>,
  models: () => request("GET", "/api/models") as Promise<ModelList>,
  setFavorites: (favorites: string[]) =>
    request("PUT", "/api/models/favoriten", {
      favorites,
    }) as Promise<ModelList>,
  usage: () => request("GET", "/api/usage") as Promise<MonthUsage>,
  writePath: (world: string, story: string, number: number) =>
    `${storyPath(world, story)}/chapters/${String(number)}/write`,
  completeChapter: (world: string, story: string, number: number) =>
    request(
      "POST",
      `${storyPath(world, story)}/chapters/${String(number)}/complete`,
    ) as Promise<Chapter>,
  summarizeChapter: (world: string, story: string, number: number) =>
    request(
      "POST",
      `${storyPath(world, story)}/chapters/${String(number)}/summarize`,
    ) as Promise<SummaryResult>,
  setChapterSummary: (
    world: string,
    story: string,
    number: number,
    summary: string,
    status: SummaryStatus,
  ) =>
    request(
      "PUT",
      `${storyPath(world, story)}/chapters/${String(number)}/summary`,
      { summary, status },
    ) as Promise<Chapter>,
  setStorySummary: (world: string, story: string, summary: string) =>
    request("PUT", `${storyPath(world, story)}/summary`, {
      summary,
    }) as Promise<Story>,
};
