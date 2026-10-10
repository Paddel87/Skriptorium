import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  modelList,
  CHAPTER,
  created,
  ENTRY,
  fail,
  fakeApi,
  ok,
  STORY,
  WORLD,
} from "../../fake-api";
import { renderShell } from "../../render-shell";
import { matchingStories, StoryList } from "./StoryList";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const MOOR = { id: "moor", name: "Das Hohe Moor", description: "" };
const FRAGMENT = {
  ...STORY,
  world: "moor",
  id: "nebel",
  title: "Nebelpfad",
  form: "fragment" as const,
};

const TWO_WORLDS = {
  "GET /api/worlds": ok([WORLD, MOOR]),
  "GET /api/worlds/salzmark/stories": ok([STORY]),
  "GET /api/worlds/moor/stories": ok([FRAGMENT]),
  "GET /api/worlds/salzmark/stories/ueberfahrt/chapters": ok([CHAPTER]),
  "GET /api/worlds/salzmark/entries": ok([ENTRY]),
  "GET /api/worlds/moor/entries": ok([]),
  "GET /api/models": ok(modelList(["m"])),
};

describe("matchingStories", () => {
  it("finds titles containing the query, ignoring case and spaces", () => {
    expect(matchingStories([STORY, FRAGMENT], "").map((s) => s.id)).toEqual([
      "ueberfahrt",
      "nebel",
    ]);
    expect(
      matchingStories([STORY, FRAGMENT], "  NEBEL ").map((s) => s.id),
    ).toEqual(["nebel"]);
  });
});

describe("StoryList (step 5.11)", () => {
  it("unfolds the open world, folds and unfolds others and searches all stories", async () => {
    fakeApi(TWO_WORLDS);
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <StoryList world="salzmark" story="ueberfahrt" chapter={1} />
      </MemoryRouter>,
    );
    const list = screen.getByRole("navigation", { name: "Geschichten" });
    expect(
      await within(list).findByRole("link", { name: "Die Überfahrt" }),
    ).toBeDefined();
    expect(
      await within(list).findByRole("link", { name: "1. Aufbruch" }),
    ).toBeDefined();
    expect(within(list).queryByRole("link", { name: "Nebelpfad" })).toBeNull();
    // Folded worlds show how many stories they hold.
    expect(within(list).getByText("1")).toBeDefined();

    await user.click(
      within(list).getByRole("button", { name: "Das Hohe Moor aufklappen" }),
    );
    expect(within(list).getByRole("link", { name: "Nebelpfad" })).toBeDefined();
    expect(within(list).getByText("(Fragment)")).toBeDefined();
    await user.click(
      within(list).getByRole("button", { name: "Die Salzmark zuklappen" }),
    );
    expect(
      within(list).queryByRole("link", { name: "Die Überfahrt" }),
    ).toBeNull();

    await user.type(within(list).getByLabelText("Geschichten suchen"), "über");
    expect(
      within(list).getByRole("link", { name: "Die Überfahrt" }),
    ).toBeDefined();
    expect(
      within(list).queryByRole("link", { name: "Das Hohe Moor" }),
    ).toBeNull();
    expect(
      within(list).queryByRole("link", { name: "+ Geschichte" }),
    ).toBeNull();
  });

  it("says when there is no world yet and shows load errors", async () => {
    fakeApi({ "GET /api/worlds": ok([]) });
    const { unmount } = render(
      <MemoryRouter>
        <StoryList />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Noch keine Welt.")).toBeDefined();
    unmount();
    fakeApi({ "GET /api/worlds": fail(500, "Server weg") });
    render(
      <MemoryRouter>
        <StoryList />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Server weg")).toBeDefined();
  });
});

describe("Shell (step 5.11)", () => {
  it("opens a new world and a new story at their addresses", async () => {
    fakeApi({
      ...TWO_WORLDS,
      "POST /api/worlds": created(MOOR),
      "POST /api/worlds/moor/stories": created(FRAGMENT),
    });
    const user = userEvent.setup();
    renderShell("/");
    await user.type(await screen.findByLabelText("Name"), "Das Hohe Moor");
    await user.click(screen.getByRole("button", { name: "Welt anlegen" }));
    await waitFor(() => {
      expect(screen.getByLabelText("Adresse").textContent).toBe(
        "/welt/moor/geschichten",
      );
    });
    await user.type(await screen.findByLabelText("Titel"), "Nebelpfad");
    await user.click(
      screen.getByRole("button", { name: "Geschichte anlegen" }),
    );
    await waitFor(() => {
      expect(screen.getByLabelText("Adresse").textContent).toBe(
        "/welt/moor/geschichte/nebel",
      );
    });
  });

  it("names worlds and stories that do not exist; canon and import need a world", async () => {
    fakeApi(TWO_WORLDS);
    const { unmount } = renderShell("/welt/weg/kanon");
    expect(await screen.findByText("Welt nicht gefunden.")).toBeDefined();
    unmount();
    renderShell("/welt/salzmark/geschichte/weg");
    expect(await screen.findByText("Geschichte nicht gefunden.")).toBeDefined();
  });

  it("keeps the last world for canon and import in the bar", async () => {
    fakeApi(TWO_WORLDS);
    const user = userEvent.setup();
    renderShell("/");
    const bar = screen.getByRole("navigation", { name: "Bereiche" });
    expect(within(bar).getByRole("button", { name: "Kanon" })).toHaveProperty(
      "disabled",
      true,
    );
    await user.click(
      await screen.findByRole("link", { name: "Das Hohe Moor" }),
    );
    await user.click(within(bar).getByRole("button", { name: "Konto" }));
    await user.click(within(bar).getByRole("button", { name: "Import" }));
    expect(screen.getByLabelText("Adresse").textContent).toBe(
      "/welt/moor/import",
    );
    expect(
      await screen.findByRole("heading", { name: "Welt-Material importieren" }),
    ).toBeDefined();
  });

  it("leads unknown addresses to the start", async () => {
    fakeApi(TWO_WORLDS);
    renderShell("/gibt/es/nicht");
    expect(
      await screen.findByRole("heading", { name: "Welten" }),
    ).toBeDefined();
    expect(screen.getByLabelText("Adresse").textContent).toBe("/");
  });
});

describe("chapters created in quick succession (step 5.20)", () => {
  it("numbers the second chapter on even before the list is loaded again", async () => {
    // The list stays at its old state, as when the reload has not arrived yet.
    const { calls } = fakeApi({
      ...TWO_WORLDS,
      "PUT /api/worlds/salzmark/stories/ueberfahrt/chapters/*": (
        body,
        path,
      ) => ({
        status: 200,
        body: {
          ...CHAPTER,
          ...(body as object),
          number: Number(path.split("/").at(-1)),
        },
      }),
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <StoryList world="salzmark" story="ueberfahrt" chapter={1} />
      </MemoryRouter>,
    );
    const list = screen.getByRole("navigation", { name: "Geschichten" });
    await within(list).findByRole("link", { name: "1. Aufbruch" });

    for (const title of ["Zweites", "Drittes"]) {
      await user.click(within(list).getByRole("button", { name: "+ Kapitel" }));
      await user.type(
        within(list).getByLabelText("Titel des neuen Kapitels"),
        title,
      );
      await user.click(
        within(list).getByRole("button", { name: "Kapitel anlegen" }),
      );
      await waitFor(() => {
        expect(
          within(list).queryByLabelText("Titel des neuen Kapitels"),
        ).toBeNull();
      });
    }

    expect(
      calls
        .filter((call) => call.method === "PUT")
        .map((call) => [call.path.split("/").at(-1), call.body]),
    ).toEqual([
      ["2", { title: "Zweites" }],
      ["3", { title: "Drittes" }],
    ]);
  });

  it("sends a double submit only once", async () => {
    const { calls } = fakeApi({
      ...TWO_WORLDS,
      "PUT /api/worlds/salzmark/stories/ueberfahrt/chapters/2": () => ({
        status: 200,
        body: { ...CHAPTER, number: 2, title: "Zweites" },
      }),
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <StoryList world="salzmark" story="ueberfahrt" chapter={1} />
      </MemoryRouter>,
    );
    const list = screen.getByRole("navigation", { name: "Geschichten" });
    await within(list).findByRole("link", { name: "1. Aufbruch" });
    await user.click(within(list).getByRole("button", { name: "+ Kapitel" }));
    await user.type(
      within(list).getByLabelText("Titel des neuen Kapitels"),
      "Zweites",
    );
    const form = within(list)
      .getByRole("button", { name: "Kapitel anlegen" })
      .closest("form");
    if (form === null) {
      throw new Error("Formular fehlt");
    }
    fireEvent.submit(form);
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        within(list).queryByLabelText("Titel des neuen Kapitels"),
      ).toBeNull();
    });
    expect(calls.filter((call) => call.method === "PUT")).toHaveLength(1);
  });
});
