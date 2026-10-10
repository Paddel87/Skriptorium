import { render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CHAPTER, ENTRY, fakeApi, ok, STORY } from "../../fake-api";
import { Canon } from "./Canon";
import { StoryPage } from "./StoryPage";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const MIRA = {
  ...ENTRY,
  id: "mira",
  name: "Mira",
  aliases: [],
  category: "ort" as const,
  body: "Zollstation am Ufer.\nZweite Zeile.",
};
const KING = {
  ...ENTRY,
  world: "nebelreich",
  id: "nebelkoenig",
  name: "Nebelkönig",
  aliases: [],
};

/** The canon of the bar with its own selection, as the story page holds it. */
function Bar({ onChanged }: { onChanged?: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <Canon
      world="salzmark"
      guests={[{ world: "nebelreich", entry: "nebelkoenig" }]}
      compact
      selected={selected}
      onSelect={setSelected}
      onChanged={onChanged}
    />
  );
}

describe("canon in the bar of a story (finding 2026-10-10 on step 5.11)", () => {
  it("lists entries and guests by category, opens one and goes back", async () => {
    fakeApi({
      "GET /api/worlds/salzmark/entries": ok([ENTRY, MIRA]),
      "GET /api/worlds/nebelreich/entries/nebelkoenig": ok(KING),
    });
    const user = userEvent.setup();
    const { container } = render(<Bar />);
    const king = await screen.findByRole("button", { name: /Nebelkönig/ });
    expect(king.textContent).toContain("· Gast");
    expect(screen.getByRole("heading", { name: "Figuren" })).toBeDefined();
    expect(screen.getByRole("button", { name: /^Orte/ })).toBeDefined();
    expect(container.querySelector(".canon.compact")).not.toBeNull();

    await user.type(screen.getByLabelText("Kanon durchsuchen"), "mi");
    await user.click(screen.getByRole("button", { name: /^Mira/ }));
    expect(screen.getByRole("heading", { name: "Mira" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Bearbeiten" })).toBeDefined();
    await user.click(screen.getByRole("button", { name: "← Liste" }));
    expect(screen.getByLabelText("Kanon durchsuchen")).toHaveProperty(
      "value",
      "mi",
    );

    await user.clear(screen.getByLabelText("Kanon durchsuchen"));
    await user.click(screen.getByRole("button", { name: /Nebelkönig/ }));
    expect(screen.queryByRole("button", { name: "Bearbeiten" })).toBeNull();
    expect(
      screen.getByText(
        "Gast aus einer anderen Welt – nur in deren Kanon zu ändern.",
      ),
    ).toBeDefined();
  });

  it("changes an entry of the world in the bar and reports it", async () => {
    let entries = [ENTRY];
    fakeApi({
      "GET /api/worlds/salzmark/entries": () => ({
        status: 200,
        body: entries,
      }),
      "GET /api/worlds/nebelreich/entries/nebelkoenig": ok(KING),
      "PATCH /api/worlds/salzmark/entries/kael": (body) => {
        entries = [{ ...ENTRY, ...(body as object) }];
        return { status: 200, body: entries[0] };
      },
    });
    const onChanged = vi.fn();
    const user = userEvent.setup();
    render(<Bar onChanged={onChanged} />);
    await user.click(await screen.findByRole("button", { name: /^Kael/ }));
    await user.click(screen.getByRole("button", { name: "Bearbeiten" }));
    const status = screen.getByLabelText(/^Status/);
    await user.type(status, "verschollen");
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    await waitFor(() => {
      expect(onChanged).toHaveBeenCalledOnce();
    });
  });

  it("says when the world has no entries yet", async () => {
    fakeApi({ "GET /api/worlds/salzmark/entries": ok([]) });
    render(<Canon world="salzmark" guests={[]} compact />);
    expect(await screen.findByText("Noch keine Kanon-Einträge.")).toBeDefined();
  });
});

describe("StoryPage layout", () => {
  function routes(chapters: unknown[]) {
    return fakeApi({
      "GET /api/worlds/salzmark/stories/ueberfahrt/chapters": ok(chapters),
      "GET /api/worlds/salzmark/entries": ok([ENTRY]),
      "GET /api/models": ok({
        models: ["x-ai/grok-4.6"],
        default: "x-ai/grok-4.6",
      }),
    });
  }

  it("opens canon and story in a bar on the right on demand (step 5.11)", async () => {
    routes([CHAPTER]);
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    expect(await screen.findByDisplayValue("Aufbruch")).toBeDefined();
    expect(screen.queryByRole("complementary")).toBeNull();
    const toggle = screen.getByRole("button", { name: "Kanon & Geschichte" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    await user.click(toggle);
    const side = screen.getByRole("complementary", {
      name: "Kanon und Geschichte",
    });
    expect(within(side).getByLabelText("Kanon durchsuchen")).toBeDefined();
    await user.click(within(side).getByRole("button", { name: "Geschichte" }));
    expect(
      within(side).getByText("Gesamtzusammenfassung", { selector: "summary" }),
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Leiste schließen" }));
    expect(screen.queryByRole("complementary")).toBeNull();
  });

  it("opens the chapter from the address, the first one without it", async () => {
    routes([CHAPTER, { ...CHAPTER, number: 2, title: "Sturm" }]);
    const { unmount } = render(<StoryPage story={STORY} chapter={2} />);
    expect(await screen.findByDisplayValue("Sturm")).toBeDefined();
    expect(screen.getByRole("region", { name: "Kapitel 2" })).toBeDefined();
    unmount();
    render(<StoryPage story={STORY} />);
    expect(await screen.findByDisplayValue("Aufbruch")).toBeDefined();
  });

  it("points to the list on the left while the story has no chapter", async () => {
    routes([]);
    render(<StoryPage story={STORY} />);
    expect(
      await screen.findByText(
        "Noch kein Kapitel – lege links in der Liste unter der Geschichte eines an („+ Kapitel“).",
      ),
    ).toBeDefined();
  });
});
