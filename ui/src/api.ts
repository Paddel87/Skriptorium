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

export const CATEGORIES: readonly { id: Category; label: string }[] = [
  { id: "figur", label: "Figur" },
  { id: "ort", label: "Ort / Geografie" },
  { id: "gegenstand", label: "Gegenstand" },
  { id: "zeitlinie", label: "Zeitlinie" },
  { id: "regel", label: "Regel" },
  { id: "kultur", label: "Kultur" },
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

export interface Story {
  world: string;
  id: string;
  title: string;
  form: Form;
  perspective: string | null;
  controlled_characters: string[];
  guest_links: { world: string; entry: string }[];
  facts: { entry: string; fact: string }[];
  summary: string;
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
  if (error.status === 503) {
    return "Die Passwortprüfung ist gerade nicht erreichbar. Bitte später erneut versuchen.";
  }
  return error.message;
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
  chapters: (world: string, story: string) =>
    request("GET", `${storyPath(world, story)}/chapters`) as Promise<Chapter[]>,
  saveChapter: (
    world: string,
    story: string,
    number: number,
    change: { title?: string; text?: string },
  ) =>
    request(
      "PUT",
      `${storyPath(world, story)}/chapters/${String(number)}`,
      change,
    ) as Promise<Chapter>,
  completeChapter: (world: string, story: string, number: number) =>
    request(
      "POST",
      `${storyPath(world, story)}/chapters/${String(number)}/complete`,
    ) as Promise<Chapter>,
};
