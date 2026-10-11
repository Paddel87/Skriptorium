import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { currentCompletions, startCompletion } from "@codemirror/autocomplete";
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
  CHAPTER,
} from "../../fake-api";
import { renderShell } from "../../render-shell";
import { Canon } from "./Canon";
import { Import } from "./Import";
import { StoryPage } from "./StoryPage";

const BUILDER = "POST /api/worlds/salzmark/worldbuilder";
const PREVIEW = "POST /api/worlds/salzmark/import/preview";
const BLOCK = "```kanon\n# Figuren\n\n## Kael Brann\nAliasse: Brann\n```";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

type Feed = ReturnType<typeof sseFeed>;

/** The routes of the canon page; each request to the world builder takes the next feed. */
function routes(feeds: Feed[], extra: Record<string, unknown> = {}) {
  let next = 0;
  return {
    "GET /api/worlds": ok([WORLD]),
    "GET /api/worlds/salzmark/stories": ok([STORY]),
    "GET /api/worlds/salzmark/entries": ok([ENTRY]),
    "GET /api/models": ok(modelList(["x-ai/grok-4.6", "x-ai/grok-4.7"])),
    [BUILDER]: () => ({ status: 200, stream: feeds[next++]?.stream }),
    ...(extra as Record<string, never>),
  };
}

/** Open the world builder on the canon page. */
async function open(user: UserEvent) {
  renderShell("/welt/salzmark/kanon");
  await user.click(await screen.findByRole("button", { name: /Weltenbauer/ }));
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Senden" })).toBeDefined();
  });
}

/** The CodeMirror view of the message field, once it is loaded. */
async function messageView(): Promise<EditorView> {
  const content = await screen.findByLabelText("Nachricht an den Weltenbauer");
  const view = EditorView.findFromDOM(content);
  if (view === null) {
    throw new Error("message field without editor");
  }
  return view;
}

/** What the message field holds. */
async function message(): Promise<string> {
  return (await messageView()).state.doc.toString();
}

async function say(user: UserEvent, text: string) {
  const view = await messageView();
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

function answer(feed: Feed, text: string, extra = true) {
  feed.send("start", {
    model: "x-ai/grok-4.6",
    estimated_tokens: 100,
    web_search: false,
  });
  feed.send("text", { text });
  if (extra) {
    feed.send("done", {
      input_tokens: 1,
      output_tokens: 1,
      cost_usd: 0.01,
      finish_reason: "stop",
    });
    feed.close();
  }
}

describe("world builder (step 6.7)", () => {
  it("streams the answer and sends turns, references, model and web search", async () => {
    const [first, second] = [sseFeed(), sseFeed()];
    const { calls } = fakeApi(routes([first, second]));
    const user = userEvent.setup();
    await open(user);
    expect(screen.getByText(/In den Kanon kommt nur, was du/)).toBeDefined();

    await say(user, "Ein Fährmann, der @Kaels Boot kennt.");
    first.send("start", {
      model: "x-ai/grok-4.6",
      estimated_tokens: 5,
      web_search: false,
    });
    expect(await screen.findByText("denkt nach …")).toBeDefined();
    first.send("text", { text: "<b>Kael</b> " });
    first.send("text", { text: "fährt." });
    expect(await screen.findByText("<b>Kael</b> fährt.")).toBeDefined();
    expect(screen.queryByText("denkt nach …")).toBeNull();
    first.send("done", {
      input_tokens: 1,
      output_tokens: 2,
      cost_usd: 0.01,
      finish_reason: "stop",
    });
    first.close();
    expect(
      await screen.findByText(/Vorschlag der KI · x-ai\/grok-4\.6/),
    ).toBeDefined();
    expect(screen.queryByRole("button", { name: "Als Kanon übernehmen" })).toBe(
      null,
    );

    await user.selectOptions(screen.getByLabelText("Modell"), "x-ai/grok-4.7");
    await user.click(screen.getByLabelText(/mit Websuche/));
    await say(user, "Mach ihn älter.");
    answer(second, "Älter.");
    await screen.findByText("Älter.");
    expect(screen.getByText(/Vorschlag der KI.*mit Websuche/)).toBeDefined();

    const bodies = calls.filter(
      (c) => c.method === "POST" && c.path.endsWith("worldbuilder"),
    );
    expect(bodies[0]?.body).toEqual({
      messages: [
        { role: "user", content: "Ein Fährmann, der @Kaels Boot kennt." },
      ],
      references: ["kael"],
      model: "x-ai/grok-4.6",
      web_search: false,
    });
    expect(bodies[1]?.body).toEqual({
      messages: [
        { role: "user", content: "Ein Fährmann, der @Kaels Boot kennt." },
        { role: "assistant", content: "<b>Kael</b> fährt." },
        { role: "user", content: "Mach ihn älter." },
      ],
      references: [],
      model: "x-ai/grok-4.7",
      web_search: true,
    });
  });

  it("shows sources as links and drops anything but web pages", async () => {
    const feed = sseFeed();
    fakeApi(routes([feed]));
    const user = userEvent.setup();
    await open(user);
    await say(user, "Salz lagern?");
    answer(feed, "Trocken lagern.", false);
    feed.send("quellen", {
      sources: [
        { url: "https://example.org/salz", title: "Salz richtig lagern" },
        { url: "http://example.org/fass", title: "Fasslagerung" },
        { url: "javascript:alert(1)", title: "Böse" },
        { url: "https://example.org/x", title: 5 },
        { title: "ohne Link" },
      ],
    });
    feed.send("done", {
      input_tokens: null,
      output_tokens: null,
      cost_usd: null,
      finish_reason: null,
    });
    feed.close();
    const link = await screen.findByRole("link", {
      name: "Salz richtig lagern",
    });
    expect(link.getAttribute("href")).toBe("https://example.org/salz");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noreferrer noopener");
    expect(screen.queryByRole("link", { name: "Böse" })).toBeNull();
    expect(screen.queryByText("ohne Link")).toBeNull();
    expect(screen.getByText(/Fundstellen:/)).toBeDefined();
  });

  it("shows web marks as numbers, numbered sources by host, the surcharge, and takes over without marks", async () => {
    const feed = sseFeed();
    const { calls } = fakeApi(
      routes([feed], {
        "GET /api/models": ok(
          modelList(["x-ai/grok-4.6"], [catalogModel("x-ai/grok-4.6")]),
        ),
        [PREVIEW]: ok({ world: "salzmark", introduction: "", items: [] }),
      }),
    );
    const user = userEvent.setup();
    await open(user);
    // grok-4.6 in the catalog at 2 $ per million input tokens: 22,000 tokens and 1 ct fee.
    expect(screen.getByLabelText("mit Websuche (ca. +5,4 ct)")).toBeDefined();
    await say(user, "Siedepfanne?");
    answer(
      feed,
      "Gesotten in Pfannen.[[1]](https://www.salz.example/a)\n```kanon\n# Gegenstände\n\n## Siedepfanne\nAus Eisen.[[1]](https://www.salz.example/a)\n```",
      false,
    );
    feed.send("quellen", {
      sources: [{ url: "https://www.salz.example/a", title: "1" }],
    });
    feed.send("done", {
      input_tokens: null,
      output_tokens: null,
      cost_usd: null,
      finish_reason: null,
    });
    feed.close();
    expect(await screen.findByText(/Gesotten in Pfannen\.\[1\]/)).toBeDefined();
    expect(screen.queryByText(/salz\.example\/a\)/)).toBeNull();
    expect(
      screen
        .getByRole("link", { name: "[1] salz.example" })
        .getAttribute("href"),
    ).toBe("https://www.salz.example/a");
    await user.click(
      screen.getByRole("button", { name: "Als Kanon übernehmen" }),
    );
    await waitFor(() => {
      expect(
        calls.some(
          (c) => c.method === "POST" && c.path.endsWith("import/preview"),
        ),
      ).toBe(true);
    });
    const preview = calls.find((c) => c.path.endsWith("import/preview"));
    expect(preview?.body).toEqual({
      markdown: "# Gegenstände\n\n## Siedepfanne\nAus Eisen.",
    });
  });

  it("offers taking over only for a kanon block and leads to the prefilled preview", async () => {
    const feed = sseFeed();
    const { calls } = fakeApi(
      routes([feed], {
        [PREVIEW]: ok({ world: "salzmark", introduction: "", items: [] }),
      }),
    );
    const user = userEvent.setup();
    await open(user);
    await say(user, "Ein Fährmann.");
    answer(feed, `Hier mein Vorschlag.\n${BLOCK}`, false);
    await screen.findByText(/Hier mein Vorschlag/);
    // Still streaming: nothing to take over yet.
    expect(screen.queryByRole("button", { name: "Als Kanon übernehmen" })).toBe(
      null,
    );
    feed.send("done", {
      input_tokens: 1,
      output_tokens: 1,
      cost_usd: 0,
      finish_reason: "stop",
    });
    feed.close();
    await user.click(
      await screen.findByRole("button", { name: "Als Kanon übernehmen" }),
    );
    expect(screen.getByLabelText("Adresse").textContent).toBe(
      "/welt/salzmark/import",
    );
    const field = screen.getByLabelText("oder Text einfügen");
    expect((field as HTMLTextAreaElement).value).toBe(
      "# Figuren\n\n## Kael Brann\nAliasse: Brann",
    );
    expect(await screen.findByText("Vorschau: 0 Einträge")).toBeDefined();
    expect(
      calls.filter((c) => c.path.endsWith("/import/preview")),
    ).toHaveLength(1);
    expect(calls.find((c) => c.path.endsWith("/import/preview"))?.body).toEqual(
      { markdown: "# Figuren\n\n## Kael Brann\nAliasse: Brann" },
    );
  });

  it("shows an error of the automatic preview", async () => {
    const feed = sseFeed();
    fakeApi(routes([feed], { [PREVIEW]: fail(422, "Kein Eintrag erkannt") }));
    const user = userEvent.setup();
    await open(user);
    await say(user, "Ein Fährmann.");
    answer(feed, BLOCK);
    await user.click(
      await screen.findByRole("button", { name: "Als Kanon übernehmen" }),
    );
    expect(await screen.findByText("Kein Eintrag erkannt")).toBeDefined();
  });

  it("asks for another variant with a follow-up message", async () => {
    const [first, second] = [sseFeed(), sseFeed()];
    const { calls } = fakeApi(routes([first, second]));
    const user = userEvent.setup();
    await open(user);
    await say(user, "Ein Fährmann.");
    answer(first, BLOCK);
    await user.click(
      await screen.findByRole("button", { name: "Andere Variante" }),
    );
    answer(second, "Anders.");
    await screen.findByText("Anders.");
    const last = calls.filter((c) => c.path.endsWith("worldbuilder"))[1];
    expect(last?.body).toMatchObject({
      messages: [
        { role: "user", content: "Ein Fährmann." },
        { role: "assistant", content: BLOCK },
        { role: "user", content: "Bitte eine andere Variante." },
      ],
    });
  });

  it("aborts, keeps the partial answer and takes back an empty one", async () => {
    const [first, second] = [sseFeed(), sseFeed()];
    fakeApi(routes([first, second]));
    const user = userEvent.setup();
    await open(user);
    await say(user, "Erste Frage.");
    answer(first, "Halber Satz", false);
    await screen.findByText("Halber Satz");
    await user.click(screen.getByRole("button", { name: "Abbrechen" }));
    expect(await screen.findByText("Abgebrochen.")).toBeDefined();
    expect(screen.getByText("Halber Satz")).toBeDefined();
    expect(screen.queryByRole("alert")).toBeNull();

    await say(user, "Zweite Frage.");
    await user.click(await screen.findByRole("button", { name: "Abbrechen" }));
    await waitFor(async () => {
      expect(await message()).toBe("Zweite Frage.");
    });
    expect(
      screen.queryByText("Zweite Frage.", { selector: ".wb-bubble" }),
    ).toBeNull();
  });

  it("shows an error event after partial text and without any text", async () => {
    const [first, second, third] = [sseFeed(), sseFeed(), sseFeed()];
    fakeApi(routes([first, second, third]));
    const user = userEvent.setup();
    await open(user);
    await say(user, "Eins.");
    answer(first, "Anfang", false);
    first.send("error", { kind: "zu_viele_anfragen" });
    first.close();
    expect(
      await screen.findByText(/Der Anbieter meldet zu viele Anfragen/),
    ).toBeDefined();
    expect(screen.getByText("Anfang")).toBeDefined();

    await say(user, "Zwei.");
    second.send("error", { kind: "abgelehnt" });
    second.close();
    expect(
      await screen.findByText("Das Modell hat die Anfrage abgelehnt."),
    ).toBeDefined();
    expect(await message()).toBe("Zwei.");

    await user.click(screen.getByRole("button", { name: "Senden" }));
    third.close();
    expect(
      await screen.findByText("Die Verbindung ist abgebrochen."),
    ).toBeDefined();
  });

  it("shows a refusal before the stream and keeps the message", async () => {
    fakeApi({
      ...routes([]),
      [BUILDER]: fail(422, "Der Kontext ist zu groß."),
    });
    const user = userEvent.setup();
    await open(user);
    await say(user, "Viel.");
    expect(await screen.findByText("Der Kontext ist zu groß.")).toBeDefined();
    expect(await message()).toBe("Viel.");
    expect(screen.queryByText("Viel.", { selector: ".wb-bubble" })).toBeNull();
  });

  it("closes without losing the conversation and gives way to an entry", async () => {
    const feed = sseFeed();
    fakeApi(routes([feed]));
    const user = userEvent.setup();
    await open(user);
    await say(user, "Hallo.");
    answer(feed, "Antwort.");
    await screen.findByText("Antwort.");
    await user.click(screen.getByRole("button", { name: "schließen" }));
    expect(screen.queryByRole("button", { name: "Senden" })).toBeNull();
    await user.click(screen.getByRole("button", { name: /Kael/ }));
    expect(await screen.findByRole("article")).toBeDefined();
    await user.click(screen.getByRole("button", { name: /Weltenbauer/ }));
    expect(screen.getByText("Antwort.")).toBeDefined();
    expect(screen.queryByRole("article")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Neuer Eintrag" }));
    expect(screen.queryByRole("button", { name: "Senden" })).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Neuer Kanon-Eintrag" }),
    ).toBeDefined();
  });

  it("names the model by its short name, opens the model management and follows the end", async () => {
    const feed = sseFeed();
    fakeApi(
      routes([feed], {
        "GET /api/models": ok(
          modelList(
            ["x-ai/grok-4.6"],
            [catalogModel("x-ai/grok-4.6", { name: "SpaceXAI: Grok 4.6" })],
          ),
        ),
      }),
    );
    const user = userEvent.setup();
    await open(user);
    await say(user, "Hallo.");
    answer(feed, "Antwort.");
    expect(
      await screen.findByText(/Vorschlag der KI · Grok 4.6$/),
    ).toBeDefined();
    const log = document.querySelector(".wb-log");
    if (log === null) {
      throw new Error("conversation missing");
    }
    fireEvent.scroll(log);
    await user.selectOptions(
      screen.getByLabelText("Modell"),
      "Modelle verwalten …",
    );
    expect(
      await screen.findByRole("dialog", { name: "Modelle verwalten" }),
    ).toBeDefined();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("offers the entries of the world after @ and marks a named one", async () => {
    fakeApi(routes([]));
    const user = userEvent.setup();
    await open(user);
    const view = await messageView();
    view.dispatch({
      changes: { from: 0, insert: "@Ka" },
      selection: { anchor: 3 },
      userEvent: "input.type",
    });
    startCompletion(view);
    await waitFor(() => {
      expect(currentCompletions(view.state).map((o) => o.label)).toContain(
        "Kael",
      );
    });
    view.dispatch({
      changes: { from: 0, to: 3, insert: "@Kael fährt" },
      userEvent: "input.type",
    });
    await waitFor(() => {
      expect(document.querySelector(".cm-mention")?.textContent).toBe("@Kael");
    });
  });

  it("is available in an empty world", async () => {
    fakeApi(routes([], { "GET /api/worlds/salzmark/entries": ok([]) }));
    const user = userEvent.setup();
    await open(user);
    expect(
      await screen.findByLabelText("Nachricht an den Weltenbauer"),
    ).toBeDefined();
  });

  it("is missing in the compact canon and in the bar of a story", async () => {
    fakeApi({
      "GET /api/worlds/salzmark/stories/ueberfahrt/chapters": ok([CHAPTER]),
      "GET /api/worlds/salzmark/entries": ok([ENTRY]),
      "GET /api/models": ok(modelList(["x-ai/grok-4.6"])),
    });
    const user = userEvent.setup();
    const compact = render(
      <Canon world="salzmark" compact onTakeOver={vi.fn()} />,
    );
    await screen.findByRole("button", { name: /Kael/ });
    expect(screen.queryByRole("button", { name: /Weltenbauer/ })).toBeNull();
    compact.unmount();

    render(<StoryPage story={STORY} />);
    await screen.findByDisplayValue("Aufbruch");
    await user.click(
      screen.getByRole("button", { name: "Kanon & Geschichte" }),
    );
    const side = screen.getByRole("complementary", {
      name: "Kanon und Geschichte",
    });
    await within(side).findByRole("button", { name: /Kael/ });
    expect(screen.queryByRole("button", { name: /Weltenbauer/ })).toBeNull();
  });
});

describe("import with a proposal of the world builder", () => {
  it("ignores the answer of a preview after leaving the page", async () => {
    const { calls } = fakeApi({
      [PREVIEW]: ok({ world: "salzmark", introduction: "", items: [] }),
    });
    const view = render(
      <Import world="salzmark" onImported={vi.fn()} initialText="# Figuren" />,
    );
    view.unmount();
    await waitFor(() => {
      expect(calls).toHaveLength(1);
    });
  });

  it("does not preview without text and reports a failed preview", async () => {
    const { calls } = fakeApi({ [PREVIEW]: fail(422, "Kein Eintrag erkannt") });
    const { unmount } = render(
      <Import world="salzmark" onImported={vi.fn()} />,
    );
    expect(calls).toHaveLength(0);
    unmount();
    render(
      <Import world="salzmark" onImported={vi.fn()} initialText="# Figuren" />,
    );
    expect(await screen.findByText("Kein Eintrag erkannt")).toBeDefined();
  });
});
