import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CHAPTER,
  ENTRY,
  fail,
  fakeApi,
  ok,
  openStorySettings,
  STORY,
  WORLD,
} from "../../fake-api";
import type { Chapter, Story, WritingStyle } from "../api";
import { StoryPage } from "./StoryPage";
import { styleParts } from "./WritingStyle";

const BASE = "/api/worlds/salzmark/stories/ueberfahrt";
const OWN: WritingStyle = {
  tone: ["düster", "bedrückend"],
  atmosphere: ["beklemmend", "unheimlich"],
  style: ["knapp"],
  tempo: "langsam",
  explicitness: "angedeutet",
  free: "",
};
const DEFAULT: WritingStyle = {
  tone: ["kalt"],
  atmosphere: [],
  style: [],
  tempo: "atemlos",
  explicitness: null,
  free: "Trocken bleiben.",
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function routes(story: Story = STORY, chapter: Chapter = CHAPTER) {
  return {
    "GET /api/models": ok({ models: ["m"], default: "m" }),
    "GET /api/worlds": ok([WORLD]),
    "GET /api/worlds/salzmark/entries": ok([ENTRY]),
    [`GET ${BASE}/chapters`]: ok([chapter]),
    [`PATCH ${BASE}`]: (body: unknown) => ({
      status: 200,
      body: { ...story, ...(body as object) },
    }),
    [`PUT ${BASE}/chapters/1`]: (body: unknown) => ({
      status: 200,
      body: { ...chapter, ...(body as object) },
    }),
  };
}

function section(name: string) {
  return screen.getByRole("region", { name });
}

describe("styleParts", () => {
  it("lists the groups in the order of the form and leaves empty ones out", () => {
    expect(styleParts(OWN)).toEqual([
      "düster, bedrückend",
      "beklemmend, unheimlich",
      "langsam",
      "knapp",
      "angedeutet",
    ]);
    expect(styleParts({ ...DEFAULT, tone: [] })).toEqual([
      "atemlos",
      "weitere Angaben",
    ]);
    expect(
      styleParts({ ...OWN, tone: [], atmosphere: [], style: [], tempo: null }),
    ).toEqual(["angedeutet"]);
  });
});

describe("short line of the chapter's style (step 5.6)", () => {
  it("shows 'keine' when nothing is set", async () => {
    fakeApi(routes());
    render(<StoryPage story={STORY} />);

    expect(await screen.findByText("Schreibweise Kapitel 1:")).toBeDefined();
    expect(screen.getByText("keine")).toBeDefined();
  });

  it("shows the style of the chapter, else the default of the story", async () => {
    fakeApi(routes({ ...STORY, writing_style: DEFAULT }));
    const first = render(
      <StoryPage story={{ ...STORY, writing_style: DEFAULT }} />,
    );
    expect(
      await screen.findByText("kalt · atemlos · weitere Angaben"),
    ).toBeDefined();
    first.unmount();

    fakeApi(routes(STORY, { ...CHAPTER, writing_style: OWN }));
    render(<StoryPage story={{ ...STORY, writing_style: DEFAULT }} />);
    expect(
      await screen.findByText(
        "düster, bedrückend · beklemmend, unheimlich · langsam · knapp · angedeutet",
      ),
    ).toBeDefined();
  });

  it("opens the bar at the editor of the chapter", async () => {
    fakeApi(routes());
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);

    await user.click(
      await screen.findByRole("button", {
        name: "Schreibweise Kapitel 1 ändern",
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Schreibweise dieses Kapitels (Kapitel 1)",
      }),
    ).toBeDefined();
    expect(
      screen.getByRole("heading", {
        name: "Genre und Schreibweise der Geschichte",
      }),
    ).toBeDefined();
  });
});

describe("genre and style of the story (step 5.6)", () => {
  it("chooses values, lets go of a single value and saves", async () => {
    const { calls } = fakeApi(routes());
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    await openStorySettings(user);
    const story = section("Genre und Schreibweise der Geschichte");
    const save = within(story).getByRole("button", { name: "Speichern" });
    expect(save).toHaveProperty("disabled", true);
    expect(
      within(story).getByText(
        "Vorgabe für neue Kapitel; schon angelegte Kapitel behalten ihre eigene Schreibweise.",
      ),
    ).toBeDefined();

    const chip = (group: string, name: string) =>
      within(within(story).getByRole("group", { name: group })).getByRole(
        "button",
        { name },
      );
    await user.click(chip("Genre", "Thriller"));
    await user.click(chip("Genre", "Horror"));
    await user.click(chip("Genre", "Thriller"));
    await user.click(chip("Tonalität", "kalt"));
    await user.click(chip("Tonalität", "sinnlich"));
    await user.click(chip("Tempo (ein Wert)", "zügig"));
    await user.click(chip("Tempo (ein Wert)", "atemlos"));
    await user.click(chip("Tempo (ein Wert)", "atemlos"));
    await user.click(chip("Deutlichkeit (ein Wert)", "sinnlich"));
    await user.click(chip("Deutlichkeit (ein Wert)", "explizit"));
    await user.type(
      within(story).getByLabelText("Weitere Angaben (frei)"),
      "Trocken.",
    );
    expect(within(story).getAllByText("(ein Wert)")).toHaveLength(2);
    await user.click(save);

    expect(await within(story).findByText("Gespeichert.")).toBeDefined();
    expect(calls.find((c) => c.method === "PATCH")?.body).toEqual({
      genres: ["Horror"],
      writing_style: {
        tone: ["kalt", "sinnlich"],
        atmosphere: [],
        style: [],
        tempo: null,
        explicitness: "explizit",
        free: "Trocken.",
      },
    });
    expect(save).toHaveProperty("disabled", true);
  });

  it("marks chosen values as pressed and shows save errors", async () => {
    fakeApi({
      ...routes(),
      [`PATCH ${BASE}`]: fail(422, "Unbekannter Wert für Genre: 'X'"),
    });
    const user = userEvent.setup();
    render(
      <StoryPage
        story={{ ...STORY, genres: ["Krimi"], writing_style: DEFAULT }}
      />,
    );
    await openStorySettings(user);
    const story = section("Genre und Schreibweise der Geschichte");

    expect(
      within(story)
        .getByRole("button", { name: "Krimi" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      within(story)
        .getByRole("button", { name: "Horror" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    expect(
      within(story)
        .getByRole("button", { name: "atemlos" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    await user.click(within(story).getByRole("button", { name: "Horror" }));
    await user.click(within(story).getByRole("button", { name: "Speichern" }));

    expect(
      await screen.findByText("Unbekannter Wert für Genre: 'X'"),
    ).toBeDefined();
  });
});

describe("style of one chapter (step 5.6)", () => {
  it("shows the default for a chapter without style and saves its own", async () => {
    const { calls } = fakeApi(routes({ ...STORY, writing_style: DEFAULT }));
    const user = userEvent.setup();
    render(<StoryPage story={{ ...STORY, writing_style: DEFAULT }} />);
    await openStorySettings(user);
    const chapter = section("Schreibweise dieses Kapitels (Kapitel 1)");

    expect(
      within(chapter).getByText(
        "Beim Anlegen aus der Vorgabe der Geschichte übernommen; hier nur für dieses Kapitel geändert.",
      ),
    ).toBeDefined();
    expect(
      within(chapter).getByText(/keine eigene Schreibweise/),
    ).toBeDefined();
    expect(
      within(chapter)
        .getByRole("button", { name: "kalt" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(within(chapter).queryByText("Genre")).toBeNull();
    expect(
      within(chapter).getByRole("button", {
        name: "Vorgabe der Geschichte übernehmen",
      }),
    ).toHaveProperty("disabled", true);

    await user.click(within(chapter).getByRole("button", { name: "zärtlich" }));
    await user.click(
      within(chapter).getByRole("button", { name: "Speichern" }),
    );

    expect(await within(chapter).findByText("Gespeichert.")).toBeDefined();
    expect(calls.find((c) => c.method === "PUT")?.body).toEqual({
      writing_style: { ...DEFAULT, tone: ["kalt", "zärtlich"] },
    });
  });

  it("takes the default of the story back", async () => {
    const { calls } = fakeApi(
      routes(
        { ...STORY, writing_style: DEFAULT },
        { ...CHAPTER, writing_style: OWN },
      ),
    );
    const user = userEvent.setup();
    render(<StoryPage story={{ ...STORY, writing_style: DEFAULT }} />);
    await openStorySettings(user);
    const chapter = section("Schreibweise dieses Kapitels (Kapitel 1)");
    expect(within(chapter).queryByText(/keine eigene Schreibweise/)).toBeNull();
    expect(
      within(chapter)
        .getByRole("button", { name: "düster" })
        .getAttribute("aria-pressed"),
    ).toBe("true");

    await user.click(
      within(chapter).getByRole("button", {
        name: "Vorgabe der Geschichte übernehmen",
      }),
    );

    expect(await within(chapter).findByText("Übernommen.")).toBeDefined();
    expect(calls.find((c) => c.method === "PUT")?.body).toEqual({
      writing_style: null,
    });
  });

  it("shows errors of saving", async () => {
    fakeApi({
      ...routes(),
      [`PUT ${BASE}/chapters/1`]: fail(422, "Unbekannter Wert für Tempo: 'x'"),
    });
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    await openStorySettings(user);
    const chapter = section("Schreibweise dieses Kapitels (Kapitel 1)");

    await user.click(within(chapter).getByRole("button", { name: "langsam" }));
    await user.click(
      within(chapter).getByRole("button", { name: "Speichern" }),
    );

    await waitFor(() => {
      expect(
        within(chapter).getByText("Unbekannter Wert für Tempo: 'x'"),
      ).toBeDefined();
    });
  });
});
