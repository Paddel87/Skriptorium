import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  acceptCompletion,
  currentCompletions,
  startCompletion,
} from "@codemirror/autocomplete";
import { EditorView } from "@codemirror/view";
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
  aliases: [],
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

/** The CodeMirror view of the instruction field, once it is loaded. */
async function instructionView(): Promise<EditorView> {
  const content = await screen.findByLabelText(/Anweisung an die KI/);
  const view = EditorView.findFromDOM(content);
  if (view === null) {
    throw new Error("instruction field without editor");
  }
  return view;
}

/** Type at the end of the instruction field. */
async function typeInstruction(text: string): Promise<EditorView> {
  const view = await instructionView();
  const end = view.state.doc.length;
  view.dispatch({
    changes: { from: end, insert: text },
    selection: { anchor: end + text.length },
    userEvent: "input.type",
  });
  return view;
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

    await typeInstruction("Mira kommt.");
    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));

    expect(screen.getByRole("status").textContent).toBe("denkt nach … 0 s");
    expect(prepare).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(calls.some((c) => c.method === "POST")).toBe(true);
    });
    expect(calls.find((c) => c.method === "POST")?.body).toEqual({
      instruction: "Mira kommt.",
      references: [],
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
    expect((await instructionView()).state.doc.toString()).toBe("");
  });

  it("starts a new scene with place, characters and goal", async () => {
    const feed = sseFeed();
    const { calls } = fakeApi(routes(feed));
    panel();
    const user = userEvent.setup();
    await ready();

    await user.click(screen.getByLabelText("Neue Szene"));
    await user.selectOptions(await screen.findByLabelText("Ort"), "grauwasser");
    const kael = within(
      screen.getByRole("group", { name: "Figuren" }),
    ).getByLabelText("Kael");
    await user.click(kael);
    await user.click(kael);
    expect(kael).toHaveProperty("checked", false);
    await user.click(kael);
    await user.type(screen.getByLabelText("Ziel der Szene"), "Zoll verlangen");
    await user.click(screen.getByRole("button", { name: "Szene beginnen" }));

    await waitFor(() => {
      expect(calls.find((c) => c.method === "POST")?.body).toEqual({
        instruction: "",
        references: [],
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

    await typeInstruction("Kampf.");
    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));
    feed.send("error", { kind: "abgelehnt" });
    feed.close();
    expect((await screen.findByRole("alert")).textContent).toBe(
      "Das Modell hat die Anfrage abgelehnt. Wähle oben ein anderes Modell und schreibe neu.",
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
      references: [],
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

  it("offers the world's entries after @ and sends the chosen ones as references", async () => {
    const feed = sseFeed();
    const { calls } = fakeApi(routes(feed));
    panel();
    const user = userEvent.setup();
    await ready();

    const view = await typeInstruction("Mit @kael, dann @DER f");
    expect(await screen.findByText("Herangezogen: Kael")).toBeDefined();
    startCompletion(view);
    await waitFor(() => {
      expect(currentCompletions(view.state).map((c) => c.label)).toEqual([
        "der Fährmann",
      ]);
    });

    const at = view.state.doc.toString().lastIndexOf("@") + 1;
    view.dispatch({
      changes: { from: at, to: view.state.doc.length },
      selection: { anchor: at },
    });
    startCompletion(view);
    await waitFor(() => {
      expect(currentCompletions(view.state).map((c) => c.label)).toEqual([
        "Grauwasser",
        "Kael",
      ]);
    });
    // The menu takes choices only after a short delay (interactionDelay).
    await waitFor(() => {
      expect(acceptCompletion(view)).toBe(true);
    });
    expect(view.state.doc.toString()).toBe("Mit @kael, dann @Grauwasser");
    expect(
      await screen.findByText("Herangezogen: Kael, Grauwasser"),
    ).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));
    await waitFor(() => {
      expect(calls.find((c) => c.method === "POST")?.body).toEqual({
        instruction: "Mit @kael, dann @Grauwasser",
        references: ["kael", "grauwasser"],
        model: "x-ai/grok-4.7",
        scene: null,
      });
    });
    feed.close();
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

describe("StoryPage writing mode", () => {
  it("saves perspective and the characters the author leads", async () => {
    const feed = sseFeed();
    const { calls } = fakeApi({
      ...routes(feed),
      "GET /api/worlds/salzmark/stories/ueberfahrt/chapters": ok([CHAPTER]),
      "PATCH /api/worlds/salzmark/stories/ueberfahrt": (body) => ({
        status: 200,
        body: { ...STORY, ...(body as object) },
      }),
    });
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    await user.click(await screen.findByText("Figuren-Schreibweise"));
    const group = await screen.findByRole("group", {
      name: "Figuren, die du selbst führst",
    });
    const kael = await within(group).findByLabelText("Kael");
    await user.click(kael);
    await user.click(kael);
    expect(kael).toHaveProperty("checked", false);
    await user.click(kael);
    const perspective = screen.getByLabelText("Erzählperspektive");
    await user.clear(perspective);
    await user.type(perspective, "Ich-Erzähler, Präteritum");
    await user.click(
      screen.getByRole("button", { name: "Schreibweise speichern" }),
    );

    expect(
      await screen.findByText("Perspektive: Ich-Erzähler, Präteritum"),
    ).toBeDefined();
    expect(calls.find((c) => c.method === "PATCH")?.body).toEqual({
      perspective: "Ich-Erzähler, Präteritum",
      controlled_characters: ["kael"],
    });
    expect(
      screen.getByRole("button", { name: "Schreibweise speichern" }),
    ).toHaveProperty("disabled", true);
  });

  it("clears the perspective and shows save errors", async () => {
    const feed = sseFeed();
    const { calls } = fakeApi({
      ...routes(feed),
      "GET /api/worlds/salzmark/stories/ueberfahrt/chapters": ok([CHAPTER]),
      "PATCH /api/worlds/salzmark/stories/ueberfahrt": fail(
        422,
        "Unbekannter Kanon-Eintrag kael",
      ),
    });
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    await user.click(await screen.findByText("Figuren-Schreibweise"));
    await user.clear(screen.getByLabelText("Erzählperspektive"));
    await user.click(
      screen.getByRole("button", { name: "Schreibweise speichern" }),
    );

    expect(
      await screen.findByText("Unbekannter Kanon-Eintrag kael"),
    ).toBeDefined();
    expect(calls.find((c) => c.method === "PATCH")?.body).toEqual({
      perspective: null,
      controlled_characters: [],
    });
  });
});
