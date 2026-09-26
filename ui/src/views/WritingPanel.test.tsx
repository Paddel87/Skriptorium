import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CHAPTER,
  ENTRY,
  fail,
  fakeApi,
  ok,
  sseFeed,
  STORY,
} from "../../fake-api";
import { StoryPage } from "./StoryPage";
import { WritingPanel } from "./WritingPanel";

const WRITE = "POST /api/worlds/salzmark/stories/ueberfahrt/chapters/1/write";
const MODELS = {
  models: ["x-ai/grok-4.7", "x-ai/grok-4.6"],
  default: "x-ai/grok-4.7",
};
const PLACE = {
  ...ENTRY,
  id: "grauwasser",
  category: "ort" as const,
  name: "Grauwasser",
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function routes(feed: ReturnType<typeof sseFeed>) {
  return {
    "GET /api/models": ok(MODELS),
    "GET /api/worlds/salzmark/entries": ok([ENTRY, PLACE]),
    [WRITE]: () => ({ status: 200, stream: feed.stream }),
  };
}

function panel(
  prepare = vi.fn(() => Promise.resolve(true)),
  onAccept = vi.fn(() => Promise.resolve()),
) {
  render(
    <WritingPanel
      world="salzmark"
      story="ueberfahrt"
      chapter={1}
      prepare={prepare}
      onAccept={onAccept}
    />,
  );
  return { prepare, onAccept };
}

async function ready() {
  const select = await screen.findByLabelText("Modell");
  await waitFor(() => {
    expect(select).toHaveProperty("value", "x-ai/grok-4.7");
  });
}

describe("WritingPanel", () => {
  it("shows thinking at once, streams the proposal, takes over the changed text", async () => {
    const feed = sseFeed();
    const { calls } = fakeApi(routes(feed));
    const { prepare, onAccept } = panel();
    const user = userEvent.setup();
    await ready();

    await user.type(
      screen.getByLabelText(/Anweisung an die KI/),
      "Mira kommt.",
    );
    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));

    expect(screen.getByRole("status").textContent).toBe("denkt nach … 0 s");
    expect(prepare).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(calls.some((c) => c.method === "POST")).toBe(true);
    });
    expect(calls.find((c) => c.method === "POST")?.body).toEqual({
      instruction: "Mira kommt.",
      model: "x-ai/grok-4.7",
      scene: null,
    });
    feed.send("start", { model: "x-ai/grok-4.7", estimated_tokens: 900 });
    feed.send("text", { text: "Der Nebel " });
    feed.send("text", { text: "hob sich." });
    const proposal = await screen.findByLabelText("Vorschlag der KI");
    await waitFor(() => {
      expect(proposal).toHaveProperty("value", "Der Nebel hob sich.");
    });
    expect(screen.getByRole("status").textContent).toBe("schreibt …");
    feed.send("done", {
      input_tokens: 900,
      output_tokens: 5,
      cost_usd: 0.001,
      finish_reason: "stop",
    });
    feed.close();

    await screen.findByRole("button", { name: "Übernehmen" });
    await user.clear(proposal);
    await user.type(proposal, "Der Nebel blieb.");
    await user.click(screen.getByRole("button", { name: "Übernehmen" }));

    expect(onAccept).toHaveBeenLastCalledWith("Der Nebel blieb.");
    await waitFor(() => {
      expect(screen.queryByLabelText("Vorschlag der KI")).toBeNull();
    });
    expect(screen.getByLabelText(/Anweisung an die KI/)).toHaveProperty(
      "value",
      "",
    );
  });

  it("starts a new scene with place, characters and goal", async () => {
    const feed = sseFeed();
    const { calls } = fakeApi(routes(feed));
    panel();
    const user = userEvent.setup();
    await ready();

    await user.click(screen.getByLabelText("Neue Szene"));
    await user.selectOptions(await screen.findByLabelText("Ort"), "grauwasser");
    await user.click(
      within(screen.getByRole("group", { name: "Figuren" })).getByLabelText(
        "Kael",
      ),
    );
    await user.type(screen.getByLabelText("Ziel der Szene"), "Zoll verlangen");
    await user.click(screen.getByRole("button", { name: "Szene beginnen" }));

    await waitFor(() => {
      expect(calls.find((c) => c.method === "POST")?.body).toEqual({
        instruction: "",
        model: "x-ai/grok-4.7",
        scene: {
          place: "grauwasser",
          characters: ["kael"],
          goal: "Zoll verlangen",
        },
      });
    });
    feed.close();
  });

  it("aborts; the manuscript is untouched and the partial text can be discarded", async () => {
    const feed = sseFeed();
    fakeApi(routes(feed));
    const { onAccept } = panel();
    const user = userEvent.setup();
    await ready();

    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));
    feed.send("text", { text: "Halb" });
    await screen.findByText("schreibt …");
    await user.click(screen.getByRole("button", { name: "Abbrechen" }));

    expect(await screen.findByText("Abgebrochen.")).toBeDefined();
    expect(screen.queryByRole("alert")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Verwerfen" }));
    expect(screen.queryByLabelText("Vorschlag der KI")).toBeNull();
    expect(onAccept).not.toHaveBeenCalled();
  });

  it("names a refusal and repeats the request with another model", async () => {
    let feed = sseFeed();
    const { calls } = fakeApi({
      ...routes(feed),
      [WRITE]: () => ({ status: 200, stream: feed.stream }),
    });
    panel();
    const user = userEvent.setup();
    await ready();

    await user.type(screen.getByLabelText(/Anweisung an die KI/), "Kampf.");
    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));
    feed.send("error", { kind: "abgelehnt" });
    feed.close();
    expect((await screen.findByRole("alert")).textContent).toBe(
      "Das Modell hat die Anfrage abgelehnt.",
    );
    expect(screen.queryByRole("button", { name: "Übernehmen" })).toBeNull();

    feed = sseFeed();
    await user.selectOptions(screen.getByLabelText("Modell"), "x-ai/grok-4.6");
    await user.click(
      screen.getByRole("button", { name: "Neu schreiben mit x-ai/grok-4.6" }),
    );

    await waitFor(() => {
      expect(calls.filter((c) => c.method === "POST")).toHaveLength(2);
    });
    expect(calls.filter((c) => c.method === "POST")[1]?.body).toEqual({
      instruction: "Kampf.",
      model: "x-ai/grok-4.6",
      scene: null,
    });
    feed.close();
  });

  it("reports a broken connection and refusals before streaming", async () => {
    const feed = sseFeed();
    let refuse = false;
    fakeApi({
      ...routes(feed),
      [WRITE]: () =>
        refuse
          ? fail(422, "Der Kontext braucht ca. 40000 Token")()
          : { status: 200, stream: feed.stream },
    });
    panel();
    const user = userEvent.setup();
    await ready();

    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));
    feed.send("text", { text: "Anfang" });
    feed.close();
    expect((await screen.findByRole("alert")).textContent).toBe(
      "Die Verbindung ist abgebrochen.",
    );
    expect(screen.getByRole("button", { name: "Übernehmen" })).toBeDefined();

    refuse = true;
    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));
    expect(
      await screen.findByText("Der Kontext braucht ca. 40000 Token"),
    ).toBeDefined();
  });

  it("does not ask the AI when saving the own text failed", async () => {
    const feed = sseFeed();
    const { calls } = fakeApi(routes(feed));
    panel(vi.fn(() => Promise.resolve(false)));
    const user = userEvent.setup();
    await ready();

    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));

    await waitFor(() => {
      expect(screen.queryByRole("status")).toBeNull();
    });
    expect(calls.some((c) => c.method === "POST")).toBe(false);
  });

  it("shows load errors of models and entries", async () => {
    fakeApi({ "GET /api/models": fail(500, "kaputt") });
    panel();
    expect(await screen.findByText("kaputt")).toBeDefined();
  });
});

describe("StoryPage with writing", () => {
  it("saves own text first and appends taken-over text to the chapter end", async () => {
    const feed = sseFeed();
    let saved = CHAPTER;
    const { calls } = fakeApi({
      ...routes(feed),
      "GET /api/worlds/salzmark/stories/ueberfahrt/chapters": () => ({
        status: 200,
        body: [saved],
      }),
      "PUT /api/worlds/salzmark/stories/ueberfahrt/chapters/1": (body) => {
        saved = { ...saved, ...(body as object) };
        return { status: 200, body: saved };
      },
    });
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    const title = await screen.findByLabelText("Kapiteltitel");
    await waitFor(() => {
      expect(title).toHaveProperty("value", "Aufbruch");
    });
    await ready();
    await user.type(title, "!");

    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));
    await waitFor(() => {
      expect(calls.some((c) => c.method === "POST")).toBe(true);
    });
    const puts = () => calls.filter((c) => c.method === "PUT");
    expect(puts()[0]?.body).toEqual({
      title: "Aufbruch!",
      text: "Es war kalt.",
    });
    feed.send("text", { text: "  Der Wind drehte.\n" });
    feed.send("done", {
      input_tokens: 1,
      output_tokens: 1,
      cost_usd: null,
      finish_reason: "stop",
    });
    feed.close();
    await user.click(await screen.findByRole("button", { name: "Übernehmen" }));

    await waitFor(() => {
      expect(puts()).toHaveLength(2);
    });
    expect(puts()[1]?.body).toEqual({
      title: "Aufbruch!",
      text: "Es war kalt.\n\nDer Wind drehte.",
    });
    expect((await screen.findByLabelText("Manuskript")).textContent).toContain(
      "Der Wind drehte.",
    );
  });
});
