import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompletionContext } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CHAPTER,
  created,
  ENTRY,
  fail,
  fakeApi,
  ok,
  sseFeed,
  STORY,
  WORLD,
} from "../../fake-api";
import { loadStoryEntries } from "../storyEntries";
import { mentions } from "./InstructionEditor";
import { StoryPage } from "./StoryPage";
import { WritingPanel } from "./WritingPanel";

const BASE = "/api/worlds/salzmark/stories/ueberfahrt";
const NEBEL = { id: "nebelreich", name: "Nebelreich", description: "Nebel" };
const KING = {
  world: "nebelreich",
  id: "nebelkoenig",
  category: "figur" as const,
  name: "Nebelkönig",
  aliases: ["König"],
  status: null,
  body: "Trägt eine Krone aus Reif.",
};
const PALACE = {
  ...KING,
  id: "reifpalast",
  category: "ort" as const,
  name: "Reifpalast",
  aliases: [],
};
const LINK = { world: "nebelreich", entry: "nebelkoenig" };
const WITH_GUEST = { ...STORY, guest_links: [LINK] };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function storyRoutes() {
  return {
    "GET /api/models": ok({
      models: ["x-ai/grok-4.7"],
      default: "x-ai/grok-4.7",
    }),
    "GET /api/worlds": ok([WORLD, NEBEL]),
    "GET /api/worlds/salzmark/entries": ok([ENTRY]),
    "GET /api/worlds/nebelreich/entries": ok([KING, PALACE]),
    "GET /api/worlds/nebelreich/entries/nebelkoenig": ok(KING),
    "GET /api/worlds/nebelreich/entries/reifpalast": ok(PALACE),
    [`GET ${BASE}/chapters`]: ok([CHAPTER]),
  };
}

describe("guests from other worlds on the story page (step 3.7)", () => {
  it("binds in an entry of another world and lists it with its world", async () => {
    const { calls } = fakeApi({
      ...storyRoutes(),
      [`POST ${BASE}/guests`]: created(WITH_GUEST),
    });
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    await user.click(await screen.findByText("Gäste aus anderen Welten (0)"));

    const world = screen.getByLabelText("Welt des Gastes");
    await waitFor(() => {
      expect(within(world).queryByText("Nebelreich")).not.toBeNull();
    });
    expect(within(world).queryByText("Die Salzmark")).toBeNull();
    await user.selectOptions(world, "nebelreich");
    const entry = screen.getByLabelText("Gast-Eintrag");
    await within(entry).findByText("Nebelkönig");
    await user.selectOptions(entry, "nebelkoenig");
    await user.click(
      screen.getByRole("button", { name: "Als Gast einbinden" }),
    );

    expect(calls.find((c) => c.method === "POST")?.body).toEqual(LINK);
    const list = await screen.findByRole("list", { name: "Gäste" });
    expect(
      await within(list).findByText("Nebelkönig aus Nebelreich"),
    ).toBeDefined();
    expect(screen.getByText("Gäste aus anderen Welten (1)")).toBeDefined();
    // Already bound, so no longer offered.
    await waitFor(() => {
      expect(within(entry).queryByText("Nebelkönig")).toBeNull();
    });
  });

  it("removes a guest, but not one the author leads", async () => {
    const { calls } = fakeApi({
      ...storyRoutes(),
      [`DELETE ${BASE}/guests/nebelreich/nebelkoenig`]: ok(STORY),
    });
    const user = userEvent.setup();
    const { unmount } = render(
      <StoryPage
        story={{ ...WITH_GUEST, controlled_characters: ["nebelkoenig"] }}
      />,
    );
    await user.click(await screen.findByText("Gäste aus anderen Welten (1)"));
    await user.click(
      await screen.findByRole("button", { name: "Nebelkönig entfernen" }),
    );
    expect(
      await screen.findByText(
        "Nebelkönig führst du selbst – erst in der Figuren-Schreibweise abwählen.",
      ),
    ).toBeDefined();
    expect(calls.some((c) => c.method === "DELETE")).toBe(false);
    unmount();

    render(<StoryPage story={WITH_GUEST} />);
    await user.click(await screen.findByText("Gäste aus anderen Welten (1)"));
    await user.click(
      await screen.findByRole("button", { name: "Nebelkönig entfernen" }),
    );
    expect(
      await screen.findByText("Gäste aus anderen Welten (0)"),
    ).toBeDefined();
    expect(calls.some((c) => c.method === "DELETE")).toBe(true);
  });

  it("marks a guest whose entry is gone and shows refusals", async () => {
    fakeApi({
      ...storyRoutes(),
      "GET /api/worlds/nebelreich/entries/nebelkoenig": fail(404, "fehlt"),
      [`POST ${BASE}/guests`]: fail(422, "Unbekannter Kanon-Eintrag"),
    });
    const user = userEvent.setup();
    render(<StoryPage story={WITH_GUEST} />);
    await user.click(await screen.findByText("Gäste aus anderen Welten (1)"));

    expect(
      await screen.findByText(
        "nebelkoenig aus Nebelreich – Eintrag fehlt in seiner Welt",
      ),
    ).toBeDefined();
    await user.selectOptions(
      screen.getByLabelText("Welt des Gastes"),
      "nebelreich",
    );
    const entry = screen.getByLabelText("Gast-Eintrag");
    await within(entry).findByText("Reifpalast");
    await user.selectOptions(entry, "reifpalast");
    await user.click(
      screen.getByRole("button", { name: "Als Gast einbinden" }),
    );
    expect(await screen.findByText("Unbekannter Kanon-Eintrag")).toBeDefined();
  });

  it("offers guest characters in the writing mode", async () => {
    const { calls } = fakeApi({
      ...storyRoutes(),
      [`PATCH ${BASE}`]: (body) => ({
        status: 200,
        body: { ...WITH_GUEST, ...(body as object) },
      }),
    });
    const user = userEvent.setup();
    render(<StoryPage story={WITH_GUEST} />);
    await user.click(await screen.findByText("Figuren-Schreibweise"));
    const group = await screen.findByRole("group", {
      name: "Figuren, die du selbst führst",
    });
    await user.click(await within(group).findByLabelText("Nebelkönig (Gast)"));
    await user.click(
      screen.getByRole("button", { name: "Schreibweise speichern" }),
    );

    await waitFor(() => {
      expect(calls.find((c) => c.method === "PATCH")?.body).toEqual({
        perspective: "ich",
        controlled_characters: ["nebelkoenig"],
      });
    });
  });
});

describe("guests in the writing panel (step 3.7)", () => {
  it("sends a guest named with @ and offers guests for a new scene", async () => {
    const feed = sseFeed();
    const { calls } = fakeApi({
      ...storyRoutes(),
      [`POST ${BASE}/chapters/1/write`]: () => ({
        status: 200,
        stream: feed.stream,
      }),
    });
    const user = userEvent.setup();
    render(
      <WritingPanel
        world="salzmark"
        story="ueberfahrt"
        chapter={1}
        guests={[LINK, { world: "nebelreich", entry: "reifpalast" }]}
        prepare={() => Promise.resolve(true)}
        onAccept={() => Promise.resolve()}
      />,
    );
    const content = await screen.findByLabelText(/Anweisung an die KI/);
    const view = EditorView.findFromDOM(content);
    view?.dispatch({ changes: { from: 0, insert: "@König tritt ein." } });

    expect(
      await screen.findByText("Herangezogen: Nebelkönig (Gast)"),
    ).toBeDefined();
    await user.click(screen.getByLabelText("Neue Szene"));
    expect(
      screen.getByRole("option", { name: "Reifpalast (Gast)" }),
    ).toBeDefined();
    const figures = screen.getByRole("group", { name: "Figuren" });
    expect(within(figures).getByLabelText("Nebelkönig (Gast)")).toBeDefined();
    expect(within(figures).getByLabelText("Kael")).toBeDefined();
    await user.click(screen.getByLabelText("Neue Szene"));
    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));

    await waitFor(() => {
      expect(calls.find((c) => c.method === "POST")?.body).toMatchObject({
        references: ["nebelkoenig"],
      });
    });
    feed.close();
  });
});

describe("mentions and story entries with guests", () => {
  it("marks guests in the @ menu", () => {
    const state = EditorState.create({ doc: "@" });
    const result = mentions(
      new CompletionContext(state, 1, false),
      [ENTRY, KING],
      "salzmark",
    );
    expect(result?.options).toMatchObject([
      { label: "Kael", detail: "Figur" },
      { label: "Nebelkönig", detail: "Figur · Gast" },
    ]);
  });

  it("puts guests over entries of the world with the same identifier", async () => {
    const own = { ...ENTRY, id: "nebelkoenig", name: "Salz-König" };
    fakeApi({
      "GET /api/worlds/salzmark/entries": ok([ENTRY, own]),
      "GET /api/worlds/nebelreich/entries/nebelkoenig": ok(KING),
      "GET /api/worlds/nebelreich/entries/fehlt": fail(404, "fehlt"),
    });

    const entries = await loadStoryEntries("salzmark", [
      LINK,
      { world: "nebelreich", entry: "fehlt" },
    ]);

    expect(entries.map((e) => `${e.world}/${e.name}`)).toEqual([
      "salzmark/Kael",
      "nebelreich/Nebelkönig",
    ]);
  });

  it("passes other errors on", async () => {
    fakeApi({
      "GET /api/worlds/salzmark/entries": ok([]),
      "GET /api/worlds/nebelreich/entries/nebelkoenig": fail(500, "kaputt"),
    });

    await expect(loadStoryEntries("salzmark", [LINK])).rejects.toThrow();
  });
});
