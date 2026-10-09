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
      length: "mittel",
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
    expect(proposal).toHaveProperty("readOnly", true);
    await user.click(screen.getByRole("button", { name: "Ändern" }));
    await user.clear(proposal);
    await user.type(proposal, "Der Nebel blieb.");
    await user.click(screen.getByRole("button", { name: "Übernehmen" }));

    expect(onAccept).toHaveBeenLastCalledWith("Der Nebel blieb.");
    await waitFor(() => {
      expect(screen.queryByLabelText("Vorschlag der KI")).toBeNull();
    });
    expect((await instructionView()).state.doc.toString()).toBe("");
  });

  it("shows the AI's note on a canon conflict apart from the proposal", async () => {
    const feed = sseFeed();
    fakeApi(routes(feed));
    const { onAccept } = panel();
    const user = userEvent.setup();
    await ready();

    await typeInstruction("Ein Toter spricht.");
    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));
    feed.send("start", { model: "x-ai/grok-4.7", estimated_tokens: 900 });
    feed.send("hinweis", { text: "Die Toten bleiben tot." });
    const note = await screen.findByRole("note");
    expect(note.textContent).toBe(
      "Hinweis der KI (wird nicht übernommen): Die Toten bleiben tot.",
    );
    feed.send("text", { text: "Niemand sprach." });
    feed.send("done", {
      input_tokens: 900,
      output_tokens: 5,
      cost_usd: 0.001,
      finish_reason: "stop",
    });
    feed.close();

    await user.click(await screen.findByRole("button", { name: "Übernehmen" }));
    expect(onAccept).toHaveBeenLastCalledWith("Niemand sprach.");
    await waitFor(() => {
      expect(screen.queryByRole("note")).toBeNull();
    });
  });

  it("forgets the note when the proposal is written anew", async () => {
    const first = sseFeed();
    const second = sseFeed();
    const feeds = [first, second];
    fakeApi({
      ...routes(first),
      [WRITE]: () => ({ status: 200, stream: feeds.shift()?.stream }),
    });
    panel();
    const user = userEvent.setup();
    await ready();

    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));
    first.send("hinweis", { text: "Die Toten bleiben tot." });
    first.send("text", { text: "Niemand sprach." });
    first.close();
    await screen.findByRole("note");
    await user.click(
      await screen.findByRole("button", { name: /Neu schreiben mit/ }),
    );
    expect(screen.queryByRole("note")).toBeNull();
    second.send("text", { text: "Der Nebel." });
    second.close();
    await screen.findByRole("button", { name: "Übernehmen" });
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("explains how to start in an empty chapter and hides it while writing", async () => {
    const feed = sseFeed();
    fakeApi(routes(feed));
    render(
      <WritingPanel
        world="salzmark"
        story="ueberfahrt"
        chapter={1}
        chapterEmpty
        prepare={vi.fn(() => Promise.resolve(true))}
        onAccept={vi.fn(() => Promise.resolve())}
      />,
    );
    const user = userEvent.setup();
    await ready();
    expect(screen.getByText(/So fängst du an/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));
    expect(screen.queryByText(/So fängst du an/)).toBeNull();
  });

  it("shows no start hint once the chapter has text", async () => {
    fakeApi(routes(sseFeed()));
    panel();
    await ready();
    expect(screen.queryByText(/So fängst du an/)).toBeNull();
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
        length: "mittel",
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

  it("sends the chosen length and repeats with a newly chosen one", async () => {
    let feed = sseFeed();
    const { calls } = fakeApi({
      ...routes(feed),
      [WRITE]: () => ({ status: 200, stream: feed.stream }),
    });
    panel();
    const user = userEvent.setup();
    await ready();
    const length = screen.getByLabelText("Länge");
    expect(length).toHaveProperty("value", "mittel");

    await user.selectOptions(length, "kurz");
    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));
    await waitFor(() => {
      expect(calls.find((c) => c.method === "POST")?.body).toMatchObject({
        length: "kurz",
      });
    });
    expect(length).toHaveProperty("disabled", true);
    feed.send("text", { text: "Kurz." });
    feed.close();
    await screen.findByRole("button", { name: "Verwerfen" });

    feed = sseFeed();
    await user.selectOptions(screen.getByLabelText("Länge"), "lang");
    await user.click(
      screen.getByRole("button", { name: "Neu schreiben mit x-ai/grok-4.7" }),
    );
    await waitFor(() => {
      expect(calls.filter((c) => c.method === "POST")).toHaveLength(2);
    });
    expect(calls.filter((c) => c.method === "POST")[1]?.body).toMatchObject({
      length: "lang",
    });
    feed.close();
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
      "Das Modell hat die Anfrage abgelehnt. Wähle unten ein anderes Modell und schreibe neu.",
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
      length: "mittel",
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
    expect(view.state.doc.toString()).toBe("Mit @kael, dann @Grauwasser ");
    expect(
      await screen.findByText("Herangezogen: Kael, Grauwasser"),
    ).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));
    await waitFor(() => {
      expect(calls.find((c) => c.method === "POST")?.body).toEqual({
        instruction: "Mit @kael, dann @Grauwasser ",
        references: ["kael", "grauwasser"],
        model: "x-ai/grok-4.7",
        length: "mittel",
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

describe("suggestions without @ (step 5.1, FR-014)", () => {
  it("offers names written without @ and sends only accepted ones", async () => {
    const feed = sseFeed();
    const { calls } = fakeApi(routes(feed));
    const user = userEvent.setup();
    panel();
    await ready();
    await typeInstruction("Kael rudert nach grauwasser.");
    const kael = await screen.findByRole("button", {
      name: "@Kael heranziehen",
    });
    expect(
      screen.getByRole("button", { name: "@grauwasser heranziehen" }),
    ).toBeDefined();
    expect(screen.queryByText(/^Herangezogen/)).toBeNull();

    await user.click(kael);
    expect((await instructionView()).state.doc.toString()).toBe(
      "@Kael rudert nach grauwasser.",
    );
    expect(screen.getByText("Herangezogen: Kael")).toBeDefined();
    expect(
      screen.queryByRole("button", { name: "@Kael heranziehen" }),
    ).toBeNull();

    // The suggestion not taken stays a suggestion: it does not reach the AI.
    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));
    expect(screen.queryByText("Meintest du:")).toBeNull();
    await waitFor(() => {
      expect(calls.some((c) => c.method === "POST")).toBe(true);
    });
    expect(calls.find((c) => c.method === "POST")?.body).toMatchObject({
      instruction: "@Kael rudert nach grauwasser.",
      references: ["kael"],
    });
    feed.close();
  });

  it("shows the entry behind an alias", async () => {
    fakeApi(routes(sseFeed()));
    panel();
    await ready();
    await typeInstruction("Der Fährmann schweigt.");
    const button = await screen.findByRole("button", {
      name: "@Der Fährmann heranziehen",
    });
    expect(button.textContent).toBe("@Der Fährmann → Kael");
  });
});

describe("WritingPanel as a chat (step 5.11)", () => {
  it('jumps into the instruction with "/" outside a field, not inside one', async () => {
    fakeApi(routes(sseFeed()));
    const user = userEvent.setup();
    panel();
    await ready();
    const content = await screen.findByLabelText(/Anweisung an die KI/);
    await user.keyboard("/");
    expect(document.activeElement).toBe(content);
    expect((await instructionView()).state.doc.toString()).toBe("");
    const select = screen.getByLabelText("Modell");
    select.focus();
    await user.keyboard("/");
    expect(document.activeElement).toBe(select);
    content.blur();
    await user.keyboard("{Control>}/{/Control}");
    expect(document.activeElement).not.toBe(content);
  });

  it("folds the more buttons on small screens and again after a choice (step 5.2)", async () => {
    fakeApi(routes(sseFeed()));
    const user = userEvent.setup();
    const tool = vi.fn();
    render(
      <WritingPanel
        world="salzmark"
        story="ueberfahrt"
        chapter={1}
        prepare={vi.fn(() => Promise.resolve(true))}
        onAccept={vi.fn(() => Promise.resolve())}
        tools={
          <button type="button" onClick={tool}>
            Werkzeug
          </button>
        }
      />,
    );
    await ready();
    const more = screen.getByRole("button", { name: "Weitere Knöpfe" });
    expect(more.getAttribute("aria-expanded")).toBe("false");
    await user.click(more);
    expect(more.getAttribute("aria-expanded")).toBe("true");
    await user.click(screen.getByLabelText("Neue Szene"));
    expect(more.getAttribute("aria-expanded")).toBe("true");
    await user.click(screen.getByRole("button", { name: "Werkzeug" }));
    expect(tool).toHaveBeenCalledOnce();
    expect(more.getAttribute("aria-expanded")).toBe("false");
  });

  it("follows the growing proposal only while the author is at the end", async () => {
    const feed = sseFeed();
    fakeApi(routes(feed));
    const user = userEvent.setup();
    panel();
    await ready();
    const area = document.querySelector(".chat-scroll");
    if (!(area instanceof HTMLElement)) {
      throw new Error("no chat area");
    }
    let height = 800;
    Object.defineProperty(area, "scrollHeight", { get: () => height });

    await typeInstruction("Mira kommt.");
    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));
    // Sending brings the end into view.
    expect(area.scrollTop).toBe(800);

    // Scrolled up to read: new words do not pull the view down, nor does the second step
    // after the first paint that sending started.
    area.scrollTop = 100;
    area.dispatchEvent(new Event("scroll"));
    height = 1000;
    await new Promise((done) => requestAnimationFrame(done));
    expect(area.scrollTop).toBe(100);
    feed.send("text", { text: "Der Nebel " });
    const proposal = await screen.findByLabelText("Vorschlag der KI");
    await waitFor(() => {
      expect(proposal).toHaveProperty("value", "Der Nebel ");
    });
    expect(area.scrollTop).toBe(100);

    // Back at the end: the view follows again.
    area.scrollTop = 1000;
    area.dispatchEvent(new Event("scroll"));
    height = 1200;
    feed.send("text", { text: "hob sich." });
    await waitFor(() => {
      expect(proposal).toHaveProperty("value", "Der Nebel hob sich.");
    });
    expect(area.scrollTop).toBe(1200);
    feed.close();
  });

  it("keeps the end of the text in view when the width changes", async () => {
    const observed: Element[] = [];
    let changed: () => void = () => undefined;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          changed = callback;
        }
        observe(element: Element) {
          observed.push(element);
        }
        disconnect() {
          observed.length = 0;
        }
      },
    );
    fakeApi(routes(sseFeed()));
    panel();
    await ready();
    const area = document.querySelector(".chat-scroll");
    expect(observed).toContain(area);
    if (!(area instanceof HTMLElement)) {
      throw new Error("no chat area");
    }
    Object.defineProperty(area, "scrollHeight", { value: 800 });
    changed();
    expect(area.scrollTop).toBe(800);
    // Scrolled up to read: a change of width leaves the place alone.
    area.scrollTop = 100;
    area.dispatchEvent(new Event("scroll"));
    changed();
    expect(area.scrollTop).toBe(100);
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
    // "ändern" in the short line opens the form in the bar on the right (step 5.11).
    await user.click(await screen.findByRole("button", { name: "ändern" }));
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

    // In the short line above the instruction and in the form's summary line.
    expect(
      await screen.findAllByText("Perspektive: Ich-Erzähler, Präteritum"),
    ).toHaveLength(2);
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
    // "ändern" in the short line opens the form in the bar on the right (step 5.11).
    await user.click(await screen.findByRole("button", { name: "ändern" }));
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
