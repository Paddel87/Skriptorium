/**
 * Request core of the API client: the error type, the single `fetch` wrapper and the German
 * error texts. Every other module of the client builds on it.
 */

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

export function errorFrom(status: number, data: unknown): ApiError {
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

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Tell the registered handler that the session has ended. */
export function notifyUnauthorized(): void {
  unauthorizedHandler?.();
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
