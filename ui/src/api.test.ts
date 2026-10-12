import { afterEach, describe, expect, it, vi } from "vitest";
import { fail, fakeApi, noContent, ok, sseFeed } from "../fake-api";
import {
  api,
  ApiError,
  describeError,
  request,
  setUnauthorizedHandler,
  streamWorldbuilder,
} from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("request", () => {
  it("sends JSON bodies with same-origin credentials", async () => {
    const { calls, fetchMock } = fakeApi({
      "POST /api/worlds": ok({ id: "x" }),
    });
    await expect(api.createWorld("X", "")).resolves.toEqual({ id: "x" });
    expect(calls[0]?.body).toEqual({ name: "X", description: "" });
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.credentials).toBe("same-origin");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
  });

  it("returns undefined for 204 and sends no body without data", async () => {
    const { fetchMock } = fakeApi({ "POST /api/auth/logout": noContent() });
    await expect(api.logout()).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBeUndefined();
  });

  it("turns error answers into ApiError", async () => {
    fakeApi({
      "GET /a": fail(404, "Nicht gefunden: x"),
      "GET /b": fail(422, { reason: "too_short" }),
      "GET /c": fail(422, [{ msg: "x" }]),
      "GET /d": () => ({ status: 500, body: "kaputt" }),
    });
    await expect(request("GET", "/a")).rejects.toMatchObject({
      status: 404,
      message: "Nicht gefunden: x",
    });
    await expect(request("GET", "/b")).rejects.toMatchObject({
      status: 422,
      reason: "too_short",
    });
    await expect(request("GET", "/c")).rejects.toMatchObject({
      message: "Eingabe ungültig",
    });
    await expect(request("GET", "/d")).rejects.toMatchObject({
      message: "Fehler 500",
    });
  });

  it("encodes path parts", async () => {
    const { calls } = fakeApi({
      "DELETE /api/worlds/*/entries/*": noContent(),
    });
    await api.deleteEntry("a b", "c/d");
    expect(calls[0]?.path).toBe("/api/worlds/a%20b/entries/c%2Fd");
  });
});

describe("describeError", () => {
  it("explains password reasons and status codes in German", () => {
    expect(describeError(new ApiError(422, "too_short", "too_short"))).toMatch(
      /15 Zeichen/,
    );
    expect(describeError(new ApiError(422, "too_long", "too_long"))).toMatch(
      /128/,
    );
    expect(
      describeError(new ApiError(422, "context_word", "context_word")),
    ).toMatch(/Weltnamen/);
    expect(describeError(new ApiError(422, "breached", "breached"))).toMatch(
      /Datenlecks/,
    );
    expect(describeError(new ApiError(422, "x", "unbekannt"))).toBe("x");
    expect(describeError(new ApiError(429, "x"))).toMatch(/15 Minuten/);
    expect(describeError(new ApiError(503, "x"))).toMatch(/nicht erreichbar/);
    expect(
      describeError(new ApiError(503, "KI-Anbieter nicht eingerichtet")),
    ).toBe(
      "Kein KI-Anbieter eingerichtet (OPENROUTER_API_KEY fehlt auf dem Server).",
    );
    expect(describeError(new ApiError(409, "Existiert bereits"))).toBe(
      "Existiert bereits",
    );
    expect(describeError(new TypeError("fetch failed"))).toMatch(
      /Keine Verbindung/,
    );
  });
});

describe("unauthorized handler", () => {
  it("is called for an ended session but not for login or the session check", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    fakeApi({
      "GET /api/worlds": fail(401, "Anmeldung erforderlich"),
      "POST /api/auth/login": fail(401, "Passwort falsch"),
      "GET /api/auth/session": fail(401, "Anmeldung erforderlich"),
    });
    await expect(api.login("x")).rejects.toBeInstanceOf(ApiError);
    await expect(api.session()).rejects.toBeInstanceOf(ApiError);
    expect(handler).not.toHaveBeenCalled();
    await expect(api.worlds()).rejects.toMatchObject({ status: 401 });
    expect(handler).toHaveBeenCalledTimes(1);
    setUnauthorizedHandler(null);
    await expect(api.worlds()).rejects.toMatchObject({ status: 401 });
  });

  it("downloads a file and reports a lost session there too (step 7.4)", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    const path = "POST /api/worlds/w/stories/s/export/epub";
    fakeApi({ [path]: ok("EPUB") });
    const book = await api.exportEpub("w", "s", {
      author: null,
      only_completed: false,
    });
    expect(await book.text()).toBe('"EPUB"');
    fakeApi({ [path]: fail(401, "Anmeldung erforderlich") });
    await expect(
      api.exportEpub("w", "s", { author: null, only_completed: false }),
    ).rejects.toMatchObject({ status: 401, message: "Anmeldung erforderlich" });
    expect(handler).toHaveBeenCalledTimes(1);
    setUnauthorizedHandler(null);
  });
});

describe("streamWorldbuilder (step 6.7)", () => {
  const order = {
    messages: [{ role: "user" as const, content: "Hallo" }],
    references: [],
    model: null,
    web_search: false,
  };

  it("passes known events on, ignores others and cleans up sources", async () => {
    const feed = sseFeed();
    fakeApi({
      "POST /api/worlds/w/worldbuilder": () => ({
        status: 200,
        stream: feed.stream,
      }),
    });
    const events: unknown[] = [];
    const done = streamWorldbuilder(api.worldbuilderPath("w"), order, (event) =>
      events.push(event),
    );
    feed.send("ping", {});
    feed.send("quellen", { sources: "kaputt" });
    feed.send("quellen", {
      sources: [{ url: "HTTP://a.example", title: "A" }, null, "x"],
    });
    feed.send("done", {
      input_tokens: 1,
      output_tokens: 2,
      cost_usd: 0,
      finish_reason: null,
    });
    feed.close();
    await done;
    expect(events).toEqual([
      { type: "quellen", sources: [] },
      { type: "quellen", sources: [{ url: "HTTP://a.example", title: "A" }] },
      {
        type: "done",
        input_tokens: 1,
        output_tokens: 2,
        cost_usd: 0,
        finish_reason: null,
      },
    ]);
  });

  it("reports a lost connection and refusals, and signals a lost session", async () => {
    const feed = sseFeed();
    fakeApi({
      "POST /api/worlds/w/worldbuilder": () => ({
        status: 200,
        stream: feed.stream,
      }),
      "POST /api/worlds/x/worldbuilder": fail(401, "Anmeldung erforderlich"),
    });
    const events: unknown[] = [];
    feed.close();
    await streamWorldbuilder("/api/worlds/w/worldbuilder", order, (event) =>
      events.push(event),
    );
    expect(events).toEqual([{ type: "error", kind: "verbindung" }]);

    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    await expect(
      streamWorldbuilder("/api/worlds/x/worldbuilder", order, vi.fn()),
    ).rejects.toMatchObject({ status: 401 });
    expect(handler).toHaveBeenCalledOnce();
    setUnauthorizedHandler(null);
  });
});
