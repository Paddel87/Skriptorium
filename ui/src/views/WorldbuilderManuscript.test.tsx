import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  catalogModel,
  ENTRY,
  fail,
  fakeApi,
  modelList,
  ok,
  sseFeed,
  STORY,
  WORLD,
} from "../../fake-api";
import { renderShell } from "../../render-shell";

const BUILDER = "POST /api/worlds/salzmark/worldbuilder";
const HITS = "POST /api/worlds/salzmark/worldbuilder/hits";
const FOUND = {
  total: 23,
  stories: 2,
  chapters: 9,
  included: 14,
  tokens: 9800,
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

type Feed = ReturnType<typeof sseFeed>;

function routes(extra: Record<string, unknown>, priced = true) {
  const catalog = priced ? [catalogModel("x-ai/grok-4.6")] : [];
  return {
    "GET /api/worlds": ok([WORLD]),
    "GET /api/worlds/salzmark/stories": ok([
      STORY,
      { ...STORY, id: "ende", title: "Das Ende" },
    ]),
    "GET /api/worlds/salzmark/entries": ok([ENTRY]),
    "GET /api/models": ok(modelList(["x-ai/grok-4.6"], catalog)),
    [BUILDER]: () => ({ status: 200, stream: sseFeed().stream }),
    ...(extra as Record<string, never>),
  };
}

async function open(user: UserEvent) {
  renderShell("/welt/salzmark/kanon");
  await user.click(await screen.findByRole("button", { name: /Weltenbauer/ }));
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Senden" })).toBeDefined();
  });
}

async function say(user: UserEvent, text: string) {
  const content = await screen.findByLabelText("Nachricht an den Weltenbauer");
  const view = EditorView.findFromDOM(content);
  if (view === null) {
    throw new Error("message field without editor");
  }
  const end = view.state.doc.length;
  view.dispatch({
    changes: { from: end, insert: text },
    selection: { anchor: end + text.length },
    userEvent: "input.type",
  });
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Senden" })).toHaveProperty(
      "disabled",
      false,
    );
  });
  await user.click(screen.getByRole("button", { name: "Senden" }));
}

function finish(feed: Feed, text: string) {
  feed.send("start", {
    model: "x-ai/grok-4.6",
    estimated_tokens: 1,
    web_search: false,
  });
  feed.send("text", { text });
  feed.send("done", {
    input_tokens: 1,
    output_tokens: 1,
    cost_usd: 0.01,
    finish_reason: "stop",
  });
  feed.close();
}

/** Open the area "Aus dem Manuskript" and fetch the passages for `name`. */
async function fetchHits(user: UserEvent, name: string, story?: string) {
  await user.click(screen.getByRole("button", { name: /Aus dem Manuskript/ }));
  await user.type(screen.getByLabelText("Name"), name);
  if (story !== undefined) {
    await user.selectOptions(screen.getByLabelText("in"), story);
  }
  await user.click(screen.getByRole("button", { name: "Fundstellen holen" }));
}

describe("world builder from the manuscript (step 8.9)", () => {
  it("fetches the passages, shows numbers and cost, sends them with every request until taken out", async () => {
    const feeds = [sseFeed(), sseFeed(), sseFeed()];
    let next = 0;
    const { calls } = fakeApi(
      routes({
        [HITS]: ok(FOUND),
        [BUILDER]: () => ({ status: 200, stream: feeds[next++]?.stream }),
      }),
    );
    const user = userEvent.setup();
    await open(user);
    expect(screen.queryByLabelText("Name")).toBeNull();

    await fetchHits(user, "Kael");
    expect(
      await screen.findByText(
        /„Kael“: 23 Stellen in 2 Geschichten, 9 Kapiteln · mitgegeben: 14 · ca\. 9\.800 Token, ca\. 2,0 ct je Antwort/,
      ),
    ).toBeDefined();
    expect(
      calls.find((c) => c.path.endsWith("/worldbuilder/hits"))?.body,
    ).toEqual({ name: "Kael", story: null });
    // The fields give way to the result.
    expect(screen.queryByLabelText("Name")).toBeNull();

    await say(user, "Erste Frage.");
    finish(feeds[0] as Feed, "Eins.");
    await screen.findByText("Eins.");
    await say(user, "Zweite Frage.");
    finish(feeds[1] as Feed, "Zwei.");
    await screen.findByText("Zwei.");

    await user.click(
      screen.getByRole("button", { name: "Fundstellen herausnehmen" }),
    );
    expect(screen.queryByText(/Stellen in/)).toBeNull();
    expect(screen.getByLabelText("Name")).toBeDefined();
    await say(user, "Dritte Frage.");
    finish(feeds[2] as Feed, "Drei.");
    await screen.findByText("Drei.");

    const bodies = calls
      .filter((c) => c.path === "/api/worlds/salzmark/worldbuilder")
      .map((c) => c.body as Record<string, unknown>);
    expect(bodies).toHaveLength(3);
    expect(bodies[0]?.manuscript).toEqual({ name: "Kael", story: null });
    expect(bodies[1]?.manuscript).toEqual({ name: "Kael", story: null });
    expect("manuscript" in (bodies[2] ?? {})).toBe(false);
    // The conversation stays as it was.
    expect((bodies[1]?.messages as unknown[]).length).toBe(3);
  });

  it("limits the search to a story of the world", async () => {
    const { calls } = fakeApi(
      routes({
        [HITS]: ok({
          total: 1,
          stories: 1,
          chapters: 1,
          included: 1,
          tokens: 120,
        }),
      }),
    );
    const user = userEvent.setup();
    await open(user);
    await user.click(
      screen.getByRole("button", { name: /Aus dem Manuskript/ }),
    );
    expect(
      await screen.findByRole("option", { name: "Das Ende" }),
    ).toBeDefined();
    expect(
      screen.getByRole("option", { name: "allen Geschichten der Welt" }),
    ).toBeDefined();
    await user.type(screen.getByLabelText("Name"), " Mira {Enter}");

    expect(
      await screen.findByText(
        /„Mira“: 1 Stelle in 1 Geschichte, 1 Kapitel · mitgegeben: 1 · ca\. 120 Token, unter 0,1 ct je Antwort/,
      ),
    ).toBeDefined();
    expect(
      calls.find((c) => c.path.endsWith("/worldbuilder/hits"))?.body,
    ).toEqual({ name: "Mira", story: null });

    await user.click(
      screen.getByRole("button", { name: "Fundstellen herausnehmen" }),
    );
    await user.selectOptions(screen.getByLabelText("in"), "ende");
    await user.click(screen.getByRole("button", { name: "Fundstellen holen" }));
    await screen.findByText(/„Mira“/);
    expect(
      calls.filter((c) => c.path.endsWith("/worldbuilder/hits"))[1]?.body,
    ).toEqual({ name: "Mira", story: "ende" });
  });

  it("shows only tokens without a price", async () => {
    fakeApi(routes({ [HITS]: ok(FOUND) }, false));
    const user = userEvent.setup();
    await open(user);
    await fetchHits(user, "Kael");

    const line = await screen.findByText(/„Kael“: 23 Stellen/);
    expect(line.textContent).toMatch(/ca\. 9\.800 Token$/);
  });

  it("needs a name and says when nothing was found", async () => {
    const feed = sseFeed();
    const { calls } = fakeApi(
      routes({
        [HITS]: ok({
          total: 0,
          stories: 0,
          chapters: 0,
          included: 0,
          tokens: 0,
        }),
        [BUILDER]: () => ({ status: 200, stream: feed.stream }),
      }),
    );
    const user = userEvent.setup();
    await open(user);
    await user.click(
      screen.getByRole("button", { name: /Aus dem Manuskript/ }),
    );
    expect(
      screen.getByRole("button", { name: "Fundstellen holen" }),
    ).toHaveProperty("disabled", true);
    await user.type(screen.getByLabelText("Name"), "Niemand");
    await user.click(screen.getByRole("button", { name: "Fundstellen holen" }));

    expect(await screen.findByText("Keine Stellen gefunden")).toBeDefined();
    await say(user, "Frage.");
    finish(feed, "Antwort.");
    await screen.findByText("Antwort.");
    const body = calls.find(
      (c) => c.path === "/api/worlds/salzmark/worldbuilder",
    )?.body as Record<string, unknown>;
    expect("manuscript" in body).toBe(false);

    // Closing the area hides the fields again.
    await user.click(
      screen.getByRole("button", { name: /Aus dem Manuskript/ }),
    );
    expect(screen.queryByLabelText("Name")).toBeNull();
  });

  it("shows an error and sends no passages", async () => {
    const feed = sseFeed();
    const { calls } = fakeApi(
      routes({
        [HITS]: fail(404, "Nicht gefunden"),
        [BUILDER]: () => ({ status: 200, stream: feed.stream }),
      }),
    );
    const user = userEvent.setup();
    await open(user);
    await fetchHits(user, "Kael");

    expect(await screen.findByText("Nicht gefunden")).toBeDefined();
    await say(user, "Frage.");
    finish(feed, "Antwort.");
    await screen.findByText("Antwort.");
    const body = calls.find(
      (c) => c.path === "/api/worlds/salzmark/worldbuilder",
    )?.body as Record<string, unknown>;
    expect("manuscript" in body).toBe(false);
  });
});
