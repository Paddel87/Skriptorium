import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  openStorySettings,
  CHAPTER,
  created,
  ENTRY,
  fail,
  fakeApi,
  ok,
  STORY,
  WORLD,
} from "../../fake-api";
import type { Story } from "../api";
import { CanonFact } from "./CanonFact";
import { StoryPage } from "./StoryPage";

const BASE = "/api/worlds/salzmark/stories/ueberfahrt";
const KING = {
  world: "nebelreich",
  id: "nebelkoenig",
  category: "figur" as const,
  name: "Nebelkönig",
  aliases: ["König"],
  status: null,
  body: "Trägt eine Krone aus Reif.",
};
const LINK = { world: "nebelreich", entry: "nebelkoenig" };
const WITH_GUEST = { ...STORY, guest_links: [LINK] };
const TEXT = "Kael fürchtet tiefes Wasser. Der König lacht.";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

function routes() {
  return {
    "GET /api/models": ok({
      models: ["x-ai/grok-4.7"],
      default: "x-ai/grok-4.7",
    }),
    "GET /api/worlds": ok([WORLD]),
    "GET /api/worlds/salzmark/entries": ok([ENTRY]),
    "GET /api/worlds/salzmark/entries/kael": ok(ENTRY),
    "GET /api/worlds/nebelreich/entries/nebelkoenig": ok(KING),
    [`GET ${BASE}/chapters`]: ok([{ ...CHAPTER, text: TEXT }]),
  };
}

/** Mark `from`–`to` in the manuscript editor, as the author does with the mouse. */
async function mark(from: number, to: number) {
  const content = await screen.findByLabelText("Manuskript");
  const view = EditorView.findFromDOM(content);
  view?.dispatch({ selection: { anchor: from, head: to } });
}

function renderForm(
  story: Story = STORY,
  marked = "Kael fürchtet tiefes Wasser.",
) {
  const onStory = vi.fn();
  const onDone = vi.fn();
  const onCancel = vi.fn();
  render(
    <CanonFact
      story={story}
      marked={marked}
      onStory={onStory}
      onDone={onDone}
      onCancel={onCancel}
    />,
  );
  return { onStory, onDone, onCancel };
}

describe("taking a marked passage into the canon (step 3.8)", () => {
  it("supplements the suggested entry in two clicks", async () => {
    const { calls } = fakeApi({
      ...routes(),
      "PATCH /api/worlds/salzmark/entries/kael": ok(ENTRY),
    });
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    const button = await screen.findByRole("button", { name: "In den Kanon" });
    expect(button).toHaveProperty("disabled", true);

    await mark(0, 28);
    await user.click(button);
    const form = await screen.findByRole("region", { name: "In den Kanon" });
    expect(
      within(form).getByText("Kael fürchtet tiefes Wasser."),
    ).toBeDefined();
    expect(within(form).getByLabelText("Eintrag")).toHaveProperty(
      "value",
      "kael",
    );
    expect(within(form).getByLabelText(/Kanon der Welt/)).toHaveProperty(
      "checked",
      true,
    );
    await user.click(within(form).getByRole("button", { name: "Eintragen" }));

    expect(
      await screen.findByText("Kanon-Eintrag „Kael“ ergänzt."),
    ).toBeDefined();
    expect(calls.find((c) => c.method === "PATCH")?.body).toEqual({
      body: "Fährt über den See.\n\nKael fürchtet tiefes Wasser.",
    });
    expect(screen.queryByRole("region", { name: "In den Kanon" })).toBeNull();
  });

  it("keeps a fact about an entry of the world in this story only", async () => {
    const withFact = {
      ...STORY,
      facts: [{ entry: "kael", fact: "Kael fürchtet tiefes Wasser." }],
    };
    const { calls } = fakeApi({
      ...routes(),
      [`POST ${BASE}/facts`]: created(withFact),
    });
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    await mark(0, 28);
    await user.click(
      await screen.findByRole("button", { name: "In den Kanon" }),
    );
    await user.click(await screen.findByLabelText("Nur diese Geschichte"));
    await user.click(screen.getByRole("button", { name: "Eintragen" }));

    expect(
      await screen.findByText("Fakt zu „Kael“ gilt nur in dieser Geschichte."),
    ).toBeDefined();
    expect(calls.find((c) => c.method === "POST")?.body).toEqual({
      entry: "kael",
      fact: "Kael fürchtet tiefes Wasser.",
    });
    await openStorySettings(user);
    expect(screen.getByText("Fakten dieser Geschichte (1)")).toBeDefined();
  });

  it("offers a guest with the story as preset target (FR-024)", async () => {
    const { calls } = fakeApi({
      ...routes(),
      [`POST ${BASE}/facts`]: created(WITH_GUEST),
    });
    const user = userEvent.setup();
    const { onStory, onDone } = renderForm(WITH_GUEST, "Der König lacht.");
    await screen.findByLabelText("Eintrag");
    const form = screen.getByRole("region", { name: "In den Kanon" });
    expect(within(form).getByLabelText("Eintrag")).toHaveProperty(
      "value",
      "nebelkoenig",
    );
    expect(within(form).getByText("Nebelkönig (Gast)")).toBeDefined();
    expect(within(form).getByLabelText("Nur diese Geschichte")).toHaveProperty(
      "checked",
      true,
    );
    expect(within(form).getByLabelText(/Kanon der Figur/)).toBeDefined();
    await user.click(within(form).getByRole("button", { name: "Eintragen" }));

    await waitFor(() => {
      expect(onDone).toHaveBeenCalledWith(
        "Fakt zu „Nebelkönig“ gilt nur in dieser Geschichte.",
      );
    });
    expect(onStory).toHaveBeenCalledWith(WITH_GUEST);
    expect(calls.find((c) => c.method === "POST")?.body).toEqual({
      entry: "nebelkoenig",
      fact: "Der König lacht.",
    });
  });

  it("writes into the canon of the guest's home world when chosen", async () => {
    // The entry is read again right before writing, so a change made meanwhile stays.
    let current = KING;
    const { calls } = fakeApi({
      ...routes(),
      "GET /api/worlds/nebelreich/entries/nebelkoenig": () => ({
        status: 200,
        body: current,
      }),
      "PATCH /api/worlds/nebelreich/entries/nebelkoenig": ok(KING),
    });
    const user = userEvent.setup();
    const { onDone } = renderForm(WITH_GUEST, "Der König lacht.");
    await user.click(await screen.findByLabelText(/Kanon der Figur/));
    current = { ...KING, body: "Neu gelesen." };
    await user.click(screen.getByRole("button", { name: "Eintragen" }));

    await waitFor(() => {
      expect(onDone).toHaveBeenCalledWith(
        "Kanon-Eintrag „Nebelkönig“ ergänzt.",
      );
    });
    expect(calls.find((c) => c.method === "PATCH")?.body).toEqual({
      body: "Neu gelesen.\n\nDer König lacht.",
    });
  });

  it("creates a new entry and remembers the category", async () => {
    const { calls } = fakeApi({
      ...routes(),
      "POST /api/worlds/salzmark/entries": created({
        ...ENTRY,
        id: "salzturm",
        name: "Salzturm",
        category: "ort",
      }),
    });
    const user = userEvent.setup();
    const first = renderForm(STORY, "Salzturm.");
    const name = await screen.findByLabelText("Name des Eintrags");
    expect(name).toHaveProperty("value", "Salzturm");
    const category = screen.getByLabelText("Kategorie");
    expect(category).toHaveProperty("value", "figur");
    await user.selectOptions(category, "ort");
    await user.click(screen.getByRole("button", { name: "Eintragen" }));
    await waitFor(() => {
      expect(first.onDone).toHaveBeenCalledWith(
        "Neuer Kanon-Eintrag „Salzturm“ angelegt.",
      );
    });
    expect(calls.find((c) => c.method === "POST")?.body).toEqual({
      category: "ort",
      name: "Salzturm",
      aliases: [],
      status: null,
      body: "",
    });
    expect(window.localStorage.getItem("skriptorium.letzte-kategorie")).toBe(
      "ort",
    );
  });

  it("takes a long passage as the text of a new entry", async () => {
    const { calls } = fakeApi({
      ...routes(),
      "POST /api/worlds/salzmark/entries": created(ENTRY),
    });
    const user = userEvent.setup();
    renderForm(STORY, "Im Norden liegt ein Hafen aus Salz.");
    await user.click(await screen.findByLabelText("Neuer Eintrag"));
    const save = screen.getByRole("button", { name: "Eintragen" });
    expect(save).toHaveProperty("disabled", true);
    await user.type(screen.getByLabelText("Name des Eintrags"), "Salzhafen");
    await user.click(save);
    await waitFor(() => {
      expect(calls.find((c) => c.method === "POST")?.body).toMatchObject({
        name: "Salzhafen",
        body: "Im Norden liegt ein Hafen aus Salz.",
      });
    });
  });

  it("switches between entries and back to supplementing", async () => {
    fakeApi({
      ...routes(),
      "GET /api/worlds/salzmark/entries": ok([
        ENTRY,
        { ...ENTRY, id: "ivra", name: "Ivra", category: "ort", aliases: [] },
      ]),
    });
    const user = userEvent.setup();
    renderForm(STORY, "Nichts Bekanntes hier drin.");
    expect(await screen.findByLabelText("Neuer Eintrag")).toHaveProperty(
      "checked",
      true,
    );
    await user.click(screen.getByLabelText("Bestehenden Eintrag ergänzen"));
    const entry = screen.getByLabelText("Eintrag");
    expect(entry).toHaveProperty("value", "kael");
    await user.click(screen.getByLabelText("Nur diese Geschichte"));
    await user.selectOptions(entry, "ivra");
    // A new entry resets the target to its preset.
    expect(screen.getByLabelText(/Kanon der Welt/)).toHaveProperty(
      "checked",
      true,
    );
  });

  it("offers only a new entry in a world without entries", async () => {
    fakeApi({ ...routes(), "GET /api/worlds/salzmark/entries": ok([]) });
    renderForm(STORY, "Kael");
    expect(
      await screen.findByLabelText("Bestehenden Eintrag ergänzen"),
    ).toHaveProperty("disabled", true);
  });

  it("shows errors of loading and saving and can be cancelled", async () => {
    fakeApi({
      ...routes(),
      "GET /api/worlds/salzmark/entries": fail(500, "kaputt"),
    });
    const user = userEvent.setup();
    const { onCancel } = renderForm();
    expect(screen.getByText("Kanon lädt …")).toBeDefined();
    expect(await screen.findByText("kaputt")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Abbrechen" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("reports a refused save and stays open", async () => {
    fakeApi({
      ...routes(),
      [`POST ${BASE}/facts`]: fail(409, "gibt es schon"),
    });
    const user = userEvent.setup();
    const { onDone, onCancel } = renderForm();
    await user.click(await screen.findByLabelText("Nur diese Geschichte"));
    await user.click(screen.getByRole("button", { name: "Eintragen" }));
    expect(await screen.findByText("gibt es schon")).toBeDefined();
    expect(onDone).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Abbrechen" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("brings the form into view and cancels from the story page (step 5.2)", async () => {
    fakeApi(routes());
    const shown = vi.spyOn(HTMLElement.prototype, "scrollIntoView");
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    await mark(0, 4);
    await user.click(
      await screen.findByRole("button", { name: "In den Kanon" }),
    );
    expect(shown).toHaveBeenCalledWith({ block: "start" });
    expect(
      (shown.mock.contexts[0] as HTMLElement).querySelector(
        '[aria-label="In den Kanon"]',
      ),
    ).not.toBeNull();
    await user.click(await screen.findByRole("button", { name: "Abbrechen" }));
    expect(screen.queryByRole("region", { name: "In den Kanon" })).toBeNull();
  });
});

describe("facts of this story (step 3.8)", () => {
  it("lists the facts with the entry names and removes one", async () => {
    const fact = { entry: "nebelkoenig", fact: "Lacht nie." };
    const { calls } = fakeApi({
      ...routes(),
      [`DELETE ${BASE}/facts`]: ok(WITH_GUEST),
    });
    const user = userEvent.setup();
    render(<StoryPage story={{ ...WITH_GUEST, facts: [fact] }} />);
    await openStorySettings(user);
    await user.click(await screen.findByText("Fakten dieser Geschichte (1)"));
    const list = screen.getByRole("list", { name: "Fakten" });
    expect(
      await within(list).findByText("Nebelkönig: Lacht nie."),
    ).toBeDefined();
    await user.click(
      within(list).getByRole("button", { name: "Fakt 1 entfernen" }),
    );
    expect(
      await screen.findByText("Fakten dieser Geschichte (0)"),
    ).toBeDefined();
    expect(calls.find((c) => c.method === "DELETE")?.body).toEqual(fact);
  });

  it("reports a failed removal", async () => {
    fakeApi({
      ...routes(),
      [`DELETE ${BASE}/facts`]: fail(404, "Fakt nicht gefunden"),
    });
    const user = userEvent.setup();
    render(
      <StoryPage
        story={{ ...STORY, facts: [{ entry: "weg", fact: "Alt." }] }}
      />,
    );
    await openStorySettings(user);
    await user.click(await screen.findByText("Fakten dieser Geschichte (1)"));
    expect(await screen.findByText("weg: Alt.")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Fakt 1 entfernen" }));
    expect(await screen.findByText("Fakt nicht gefunden")).toBeDefined();
  });
});
