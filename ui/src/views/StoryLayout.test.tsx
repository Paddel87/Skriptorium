import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CHAPTER, ENTRY, fakeApi, ok, STORY } from "../../fake-api";
import { CanonLookup, matching } from "./CanonLookup";
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

describe("matching", () => {
  it("finds names and aliases containing the query, sorted by name", () => {
    expect(matching([MIRA, ENTRY], "").map((e) => e.id)).toEqual([
      "kael",
      "mira",
    ]);
    expect(matching([MIRA, ENTRY], "FÄHR").map((e) => e.id)).toEqual(["kael"]);
    expect(matching([MIRA, ENTRY], "  ir ").map((e) => e.id)).toEqual(["mira"]);
  });
});

describe("CanonLookup", () => {
  it("searches, opens an entry with guests marked and goes back (step 5.11)", async () => {
    fakeApi({
      "GET /api/worlds/salzmark/entries": ok([ENTRY, MIRA]),
      "GET /api/worlds/nebelreich/entries/nebelkoenig": ok(KING),
    });
    const user = userEvent.setup();
    render(
      <CanonLookup
        world="salzmark"
        guests={[{ world: "nebelreich", entry: "nebelkoenig" }]}
      />,
    );
    expect(
      await screen.findByRole("button", { name: "Nebelkönig" }),
    ).toBeDefined();
    expect(screen.getByText("Figur · Gast")).toBeDefined();
    await user.type(screen.getByLabelText("Kanon durchsuchen"), "zz");
    expect(screen.getByText("Nichts gefunden.")).toBeDefined();
    await user.clear(screen.getByLabelText("Kanon durchsuchen"));
    await user.type(screen.getByLabelText("Kanon durchsuchen"), "mi");
    await user.click(screen.getByRole("button", { name: "Mira" }));
    const article = screen.getByRole("article", { name: "Kanon: Mira" });
    expect(within(article).getByText("Ort / Geografie")).toBeDefined();
    expect(within(article).getByText(/Zollstation am Ufer\./).textContent).toBe(
      "Zollstation am Ufer.\nZweite Zeile.",
    );
    await user.click(screen.getByRole("button", { name: "← Zur Liste" }));
    expect(screen.getByLabelText("Kanon durchsuchen")).toHaveProperty(
      "value",
      "mi",
    );
  });

  it("says when the world has no entries yet", async () => {
    fakeApi({ "GET /api/worlds/salzmark/entries": ok([]) });
    render(<CanonLookup world="salzmark" guests={[]} />);
    expect(await screen.findByText("Noch keine Kanon-Einträge.")).toBeDefined();
  });

  it("shows aliases, status and the guest mark of an open entry", async () => {
    fakeApi({
      "GET /api/worlds/salzmark/entries": ok([
        { ...ENTRY, status: "verschollen" },
      ]),
      "GET /api/worlds/nebelreich/entries/nebelkoenig": ok(KING),
    });
    const user = userEvent.setup();
    render(
      <CanonLookup
        world="salzmark"
        guests={[{ world: "nebelreich", entry: "nebelkoenig" }]}
      />,
    );
    await user.click(await screen.findByRole("button", { name: "Kael" }));
    expect(
      screen.getByText("Figur · der Fährmann · verschollen"),
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "← Zur Liste" }));
    await user.click(screen.getByRole("button", { name: "Nebelkönig" }));
    expect(screen.getByText("Figur · Gast")).toBeDefined();
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
