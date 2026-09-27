import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CHAPTER,
  created,
  ENTRY,
  fail,
  fakeApi,
  noContent,
  ok,
  STORY,
  WORLD,
} from "../../fake-api";
import { Account } from "./Account";
import { Canon } from "./Canon";
import { Import } from "./Import";
import { ManuscriptEditor } from "./ManuscriptEditor";
import { Stories } from "./Stories";
import { StoryPage } from "./StoryPage";
import { WorldPage } from "./WorldPage";
import { Worlds } from "./Worlds";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Worlds", () => {
  it("lists, creates and opens worlds", async () => {
    const { calls } = fakeApi({
      "GET /api/worlds": ok([]),
      "POST /api/worlds": created(WORLD),
    });
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(<Worlds onOpen={onOpen} />);
    expect(await screen.findByText("Noch keine Welt angelegt.")).toBeDefined();
    await user.type(screen.getByLabelText("Name"), "Die Salzmark");
    await user.type(
      screen.getByLabelText("Beschreibung und Grundregeln"),
      "Salz",
    );
    await user.click(screen.getByRole("button", { name: "Welt anlegen" }));
    await waitFor(() => {
      expect(onOpen).toHaveBeenCalledWith(WORLD);
    });
    expect(calls.at(-1)?.body).toEqual({
      name: "Die Salzmark",
      description: "Salz",
    });
  });

  it("shows errors of loading and creating", async () => {
    fakeApi({
      "GET /api/worlds": fail(500, "kaputt"),
      "POST /api/worlds": fail(409, "Existiert bereits"),
    });
    const user = userEvent.setup();
    render(<Worlds onOpen={vi.fn()} />);
    expect((await screen.findByRole("alert")).textContent).toBe("kaputt");
    await user.type(screen.getByLabelText("Name"), "X");
    await user.click(screen.getByRole("button", { name: "Welt anlegen" }));
    expect(await screen.findByText("Existiert bereits")).toBeDefined();
  });
});

describe("Canon", () => {
  it("lists entries by category and creates one", async () => {
    const { calls } = fakeApi({
      "GET /api/worlds/salzmark/entries": ok([
        ENTRY,
        { ...ENTRY, id: "tod", name: "Tod", status: "tot" },
      ]),
      "POST /api/worlds/salzmark/entries": created(ENTRY),
    });
    const user = userEvent.setup();
    render(<Canon world="salzmark" />);
    expect(await screen.findByRole("heading", { name: "Figur" })).toBeDefined();
    expect(screen.getByText("(tot)")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Neuer Eintrag" }));
    await user.selectOptions(screen.getByLabelText("Kategorie"), "zeitlinie");
    expect(screen.getByText(/Reihenfolge untereinander/)).toBeDefined();
    expect(screen.getByText(/Kommentare im Dateikopf/)).toBeDefined();
    await user.type(screen.getByLabelText("Name"), "Chronik");
    await user.type(
      screen.getByLabelText("Aliasse (durch Komma getrennt)"),
      "Annalen, , Jahre",
    );
    await user.type(screen.getByLabelText("Text"), "1. Gründung");
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    await screen.findByRole("button", { name: "Neuer Eintrag" });
    expect(calls.find((c) => c.method === "POST")?.body).toEqual({
      category: "zeitlinie",
      name: "Chronik",
      aliases: ["Annalen", "Jahre"],
      status: null,
      body: "1. Gründung",
    });
  });

  it("changes and deletes an entry", async () => {
    const { calls } = fakeApi({
      "GET /api/worlds/salzmark/entries": ok([ENTRY]),
      "PATCH /api/worlds/salzmark/entries/kael": ok(ENTRY),
      "DELETE /api/worlds/salzmark/entries/kael": noContent(),
    });
    const confirm = vi.spyOn(window, "confirm");
    const user = userEvent.setup();
    render(<Canon world="salzmark" />);
    await user.click(await screen.findByRole("button", { name: "Kael" }));
    expect(
      screen.getByLabelText("Aliasse (durch Komma getrennt)"),
    ).toHaveProperty("value", "der Fährmann");
    await user.type(
      screen.getByLabelText("Status (z. B. tot, verschollen)"),
      "tot",
    );
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    await user.click(await screen.findByRole("button", { name: "Kael" }));
    confirm.mockReturnValueOnce(false);
    await user.click(screen.getByRole("button", { name: "Löschen" }));
    expect(calls.some((c) => c.method === "DELETE")).toBe(false);
    confirm.mockReturnValueOnce(true);
    await user.click(screen.getByRole("button", { name: "Löschen" }));
    await screen.findByRole("button", { name: "Neuer Eintrag" });
    expect(calls.find((c) => c.method === "PATCH")?.body).toMatchObject({
      status: "tot",
    });
    expect(calls.some((c) => c.method === "DELETE")).toBe(true);
  });

  it("shows errors and cancels", async () => {
    fakeApi({
      "GET /api/worlds/salzmark/entries": ok([ENTRY]),
      "PATCH /api/worlds/salzmark/entries/kael": fail(422, "Name fehlt"),
      "DELETE /api/worlds/salzmark/entries/kael": fail(404, "weg"),
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<Canon world="salzmark" />);
    await user.click(await screen.findByRole("button", { name: "Kael" }));
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    expect(await screen.findByText("Name fehlt")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Löschen" }));
    expect(await screen.findByText("weg")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Abbrechen" }));
    expect(
      await screen.findByRole("button", { name: "Neuer Eintrag" }),
    ).toBeDefined();
  });

  it("says when there are no entries", async () => {
    fakeApi({ "GET /api/worlds/salzmark/entries": ok([]) });
    render(<Canon world="salzmark" />);
    expect(await screen.findByText("Noch keine Kanon-Einträge.")).toBeDefined();
  });
});

describe("Import", () => {
  const preview = {
    world: "salzmark",
    introduction: "Einleitung",
    items: [
      {
        id: "kael",
        name: "Kael",
        category: "figur",
        aliases: [],
        body: "",
        conflict: "vorhanden",
      },
      {
        id: "mira",
        name: "Mira",
        category: null,
        aliases: [],
        body: "",
        conflict: null,
      },
    ],
    not_taken_over: [],
  };

  it("previews, adjusts and takes over material", async () => {
    const { calls } = fakeApi({
      "POST /api/worlds/salzmark/import/preview": ok(preview),
      "POST /api/worlds/salzmark/import": ok({
        created: ["mira"],
        overwritten: ["kael"],
        skipped: [],
      }),
    });
    const onImported = vi.fn();
    const user = userEvent.setup();
    render(<Import world="salzmark" onImported={onImported} />);
    const file = new File(["# Figuren\n\n## Kael\n"], "welt.md", {
      type: "text/markdown",
    });
    await user.upload(screen.getByLabelText("Markdown-Datei"), file);
    await waitFor(() => {
      expect(screen.getByLabelText("oder Text einfügen")).toHaveProperty(
        "value",
        "# Figuren\n\n## Kael\n",
      );
    });
    await user.click(screen.getByRole("button", { name: "Vorschau" }));
    expect(await screen.findByText("Vorschau: 2 Einträge")).toBeDefined();
    expect(screen.getByText(/Einleitung wird/)).toBeDefined();
    await user.selectOptions(
      screen.getByLabelText("Kategorie für Mira"),
      "kultur",
    );
    const conflict = screen.getByRole("checkbox");
    await user.click(conflict);
    await user.click(conflict);
    await user.click(conflict);
    await user.click(screen.getByRole("button", { name: "Übernehmen" }));
    expect(
      await screen.findByText(/1 neu, 1 überschrieben, 0 übersprungen/),
    ).toBeDefined();
    expect(onImported).toHaveBeenCalled();
    expect(calls.at(-1)?.body).toEqual({
      markdown: "# Figuren\n\n## Kael\n",
      categories: { mira: "kultur" },
      overwrite: ["kael"],
    });
  });

  it("shows errors of preview and apply", async () => {
    fakeApi({
      "POST /api/worlds/salzmark/import/preview": fail(404, "Welt fehlt"),
    });
    const user = userEvent.setup();
    render(<Import world="salzmark" onImported={vi.fn()} />);
    await user.type(screen.getByLabelText("oder Text einfügen"), "# A");
    await user.click(screen.getByRole("button", { name: "Vorschau" }));
    expect(await screen.findByText("Welt fehlt")).toBeDefined();
  });

  it("shows an error when taking over fails", async () => {
    fakeApi({
      "POST /api/worlds/salzmark/import/preview": ok({
        ...preview,
        introduction: "",
      }),
      "POST /api/worlds/salzmark/import": fail(
        422,
        "Eintrag 'Mira' hat keine Kategorie",
      ),
    });
    const user = userEvent.setup();
    render(<Import world="salzmark" onImported={vi.fn()} />);
    await user.type(screen.getByLabelText("oder Text einfügen"), "# A");
    await user.click(screen.getByRole("button", { name: "Vorschau" }));
    await user.click(await screen.findByRole("button", { name: "Übernehmen" }));
    expect(await screen.findByText(/keine Kategorie/)).toBeDefined();
  });
});

describe("Stories and chapters", () => {
  it("lists and creates stories", async () => {
    const { calls } = fakeApi({
      "GET /api/worlds/salzmark/stories": ok([STORY]),
      "POST /api/worlds/salzmark/stories": created(STORY),
    });
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(<Stories world="salzmark" onOpen={onOpen} />);
    expect(await screen.findByText("(Roman)")).toBeDefined();
    await user.type(screen.getByLabelText("Titel"), "Neu");
    await user.selectOptions(screen.getByLabelText("Form"), "fragment");
    await user.click(
      screen.getByRole("button", { name: "Geschichte anlegen" }),
    );
    await waitFor(() => {
      expect(onOpen).toHaveBeenCalledWith(STORY);
    });
    expect(calls.at(-1)?.body).toEqual({
      title: "Neu",
      form: "fragment",
      perspective: null,
    });
    await user.type(
      screen.getByLabelText("Erzählperspektive (optional)"),
      " ich ",
    );
    await user.click(
      screen.getByRole("button", { name: "Geschichte anlegen" }),
    );
    await waitFor(() => {
      expect(calls.at(-1)?.body).toMatchObject({ perspective: "ich" });
    });
  });

  it("shows errors when creating a story", async () => {
    fakeApi({
      "GET /api/worlds/salzmark/stories": ok([]),
      "POST /api/worlds/salzmark/stories": fail(409, "Existiert bereits"),
    });
    const user = userEvent.setup();
    render(<Stories world="salzmark" onOpen={vi.fn()} />);
    expect(await screen.findByText("Noch keine Geschichte.")).toBeDefined();
    await user.type(screen.getByLabelText("Titel"), "X");
    await user.click(
      screen.getByRole("button", { name: "Geschichte anlegen" }),
    );
    expect(await screen.findByText("Existiert bereits")).toBeDefined();
  });

  it("adds, switches, saves and completes chapters", async () => {
    let chapters = [CHAPTER];
    const { calls } = fakeApi({
      "GET /api/worlds/salzmark/stories/ueberfahrt/chapters": () => ({
        status: 200,
        body: chapters,
      }),
      "PUT /api/worlds/salzmark/stories/ueberfahrt/chapters/2": (body) => {
        const added = {
          ...CHAPTER,
          number: 2,
          title: (body as { title: string }).title,
          text: "",
        };
        chapters = [...chapters, added];
        return { status: 200, body: added };
      },
      "PUT /api/worlds/salzmark/stories/ueberfahrt/chapters/1": ok(CHAPTER),
      "POST /api/worlds/salzmark/stories/ueberfahrt/chapters/1/complete":
        () => {
          chapters = [
            { ...CHAPTER, status: "abgeschlossen" as const },
            ...chapters.slice(1),
          ];
          return { status: 200, body: chapters[0] };
        },
      "POST /api/worlds/salzmark/stories/ueberfahrt/chapters/1/summarize":
        () => ({
          status: 200,
          body: { chapter: chapters[0], story: STORY, failure: null },
        }),
    });
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    expect(await screen.findByText("Perspektive: ich")).toBeDefined();
    await user.type(screen.getByLabelText("Titel des neuen Kapitels"), "Sturm");
    await user.click(screen.getByRole("button", { name: "Kapitel anlegen" }));
    expect(
      await screen.findByRole("button", { name: "2. Sturm" }),
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "1. Aufbruch" }));
    const title = await screen.findByLabelText("Kapiteltitel");
    await waitFor(() => {
      expect(title).toHaveProperty("value", "Aufbruch");
    });
    expect(screen.getByRole("button", { name: "Speichern" })).toHaveProperty(
      "disabled",
      true,
    );
    await user.type(title, "!");
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    expect(await screen.findByText("Gespeichert.")).toBeDefined();
    expect(
      calls.find((c) => c.method === "PUT" && c.path.endsWith("/1"))?.body,
    ).toEqual({
      title: "Aufbruch!",
      text: "Es war kalt.",
    });
    await user.click(
      screen.getByRole("button", { name: "Kapitel abschließen" }),
    );
    expect(await screen.findByText("Kapitel abgeschlossen")).toBeDefined();
  });

  it("shows chapter errors; short stories have no new chapters", async () => {
    fakeApi({
      "GET /api/worlds/salzmark/stories/ueberfahrt/chapters": ok([CHAPTER]),
      "PUT /api/worlds/salzmark/stories/ueberfahrt/chapters/1": fail(
        500,
        "Speichern fehlgeschlagen",
      ),
      "POST /api/worlds/salzmark/stories/ueberfahrt/chapters/1/complete": fail(
        404,
        "weg",
      ),
      "PUT /api/worlds/salzmark/stories/ueberfahrt/chapters/2": fail(
        422,
        "Titel fehlt",
      ),
    });
    const user = userEvent.setup();
    const { rerender } = render(<StoryPage story={STORY} />);
    await user.type(
      await screen.findByLabelText("Titel des neuen Kapitels"),
      "x",
    );
    await user.click(screen.getByRole("button", { name: "Kapitel anlegen" }));
    expect(await screen.findByText("Titel fehlt")).toBeDefined();
    await user.type(await screen.findByLabelText("Kapiteltitel"), "!");
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    expect(await screen.findByText("Speichern fehlgeschlagen")).toBeDefined();
    // Unsaved own text is saved first; if that fails, the chapter is not completed.
    await user.click(
      screen.getByRole("button", { name: "Kapitel abschließen" }),
    );
    await waitFor(() => {
      expect(screen.getAllByText("Speichern fehlgeschlagen")).toHaveLength(1);
    });
    rerender(
      <StoryPage
        story={{ ...STORY, form: "kurzgeschichte", perspective: null }}
      />,
    );
    expect(screen.queryByLabelText("Titel des neuen Kapitels")).toBeNull();
  });
});

describe("ManuscriptEditor", () => {
  it("shows the text, reports edits and follows new values", async () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <ManuscriptEditor
        label="Manuskript"
        value="Es war kalt."
        onChange={onChange}
      />,
    );
    const content = await screen.findByLabelText("Manuskript");
    expect(content.textContent).toBe("Es war kalt.");
    rerender(
      <ManuscriptEditor
        label="Manuskript"
        value="Neu <b>kein HTML</b>"
        onChange={onChange}
      />,
    );
    expect(content.textContent).toBe("Neu <b>kein HTML</b>");
    expect(container.querySelector("b")).toBeNull();
    const view = (await import("@codemirror/view")).EditorView.findFromDOM(
      content,
    );
    view?.dispatch({ changes: { from: 0, insert: "A" } });
    expect(onChange).toHaveBeenCalledWith("ANeu <b>kein HTML</b>");
  });
});

describe("Account", () => {
  it("changes the password", async () => {
    const { calls } = fakeApi({
      "GET /api/auth/sessions": ok([]),
      "POST /api/auth/password": noContent(),
    });
    const user = userEvent.setup();
    render(<Account />);
    await user.type(
      screen.getByLabelText("Bisheriges Passwort"),
      "alt alt alt alt alt",
    );
    await user.type(
      screen.getByLabelText("Neues Passwort"),
      "neu neu neu neu neu",
    );
    await user.type(
      screen.getByLabelText("Neues Passwort wiederholen"),
      "anders",
    );
    await user.click(screen.getByRole("button", { name: "Passwort ändern" }));
    expect(await screen.findByText(/stimmen nicht/)).toBeDefined();
    await user.clear(screen.getByLabelText("Neues Passwort wiederholen"));
    await user.type(
      screen.getByLabelText("Neues Passwort wiederholen"),
      "neu neu neu neu neu",
    );
    await user.click(screen.getByLabelText("Alle anderen Sitzungen beenden"));
    await user.click(screen.getByRole("button", { name: "Passwort ändern" }));
    expect(await screen.findByText("Passwort geändert.")).toBeDefined();
    expect(calls.find((c) => c.path === "/api/auth/password")?.body).toEqual({
      current_password: "alt alt alt alt alt",
      new_password: "neu neu neu neu neu",
      end_other_sessions: false,
    });
  });

  it("reports a wrong current password", async () => {
    fakeApi({
      "GET /api/auth/sessions": ok([]),
      "POST /api/auth/password": fail(403, "Bisheriges Passwort falsch"),
    });
    const user = userEvent.setup();
    render(<Account />);
    await user.type(screen.getByLabelText("Bisheriges Passwort"), "x");
    await user.type(screen.getByLabelText("Neues Passwort"), "y");
    await user.type(screen.getByLabelText("Neues Passwort wiederholen"), "y");
    await user.click(screen.getByRole("button", { name: "Passwort ändern" }));
    expect(await screen.findByText("Bisheriges Passwort falsch")).toBeDefined();
  });

  it("lists and ends sessions", async () => {
    const sessions = [
      {
        id: "a",
        created: "2026-09-26T10:00:00Z",
        last_seen: "2026-09-26T11:00:00Z",
        client: "Handy",
        current: false,
      },
      {
        id: "b",
        created: "2026-09-26T09:00:00Z",
        last_seen: "2026-09-26T12:00:00Z",
        client: "",
        current: true,
      },
    ];
    const { calls } = fakeApi({
      "GET /api/auth/sessions": ok(sessions),
      "DELETE /api/auth/sessions/a": noContent(),
      "DELETE /api/auth/sessions": fail(500, "kaputt"),
    });
    const user = userEvent.setup();
    render(<Account />);
    const list = (await screen.findByText("Handy")).closest("ul");
    expect(list).not.toBeNull();
    expect(
      within(list as HTMLElement).getByText(
        /Unbekanntes Gerät \(diese Sitzung\)/,
      ),
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Beenden" }));
    await user.click(
      screen.getByRole("button", { name: "Alle anderen Sitzungen beenden" }),
    );
    expect(await screen.findByText("kaputt")).toBeDefined();
    expect(
      calls.filter((c) => c.method === "DELETE").map((c) => c.path),
    ).toEqual(["/api/auth/sessions/a", "/api/auth/sessions"]);
  });
});

describe("WorldPage", () => {
  it("switches tabs and changes the world", async () => {
    const { calls } = fakeApi({
      "GET /api/worlds/salzmark/stories": ok([]),
      "GET /api/worlds/salzmark/entries": ok([]),
      "PATCH /api/worlds/salzmark": ok({ ...WORLD, name: "Neue Mark" }),
    });
    const user = userEvent.setup();
    render(<WorldPage world={WORLD} onOpenStory={vi.fn()} />);
    expect(await screen.findByText("Noch keine Geschichte.")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Kanon" }));
    expect(await screen.findByText("Noch keine Kanon-Einträge.")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Import" }));
    expect(
      screen.getByRole("heading", { name: "Welt-Material importieren" }),
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Welt" }));
    const name = screen.getByLabelText("Name");
    await user.clear(name);
    await user.type(name, "Neue Mark");
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    expect(await screen.findByText("Gespeichert.")).toBeDefined();
    expect(calls.at(-1)?.body).toEqual({
      name: "Neue Mark",
      description: "Salz",
    });
  });

  it("shows errors when saving the world", async () => {
    fakeApi({
      "GET /api/worlds/salzmark/stories": ok([]),
      "PATCH /api/worlds/salzmark": fail(422, "Name fehlt"),
    });
    const user = userEvent.setup();
    render(<WorldPage world={WORLD} onOpenStory={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Welt" }));
    await user.type(screen.getByLabelText("Beschreibung und Grundregeln"), "!");
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    expect(await screen.findByText("Name fehlt")).toBeDefined();
  });
});
