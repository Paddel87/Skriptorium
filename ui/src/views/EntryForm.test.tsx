import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { created, ENTRY, fakeApi } from "../../fake-api";
import { templateFor } from "../sections";
import { EntryForm } from "./EntryForm";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const HINT = /^Die Abschnitte gehören zur Art „/;

function open(entry: typeof ENTRY | null = null) {
  const onClose = vi.fn();
  render(<EntryForm world="salzmark" entry={entry} onClose={onClose} />);
  return { onClose, user: userEvent.setup() };
}

function text(): HTMLTextAreaElement {
  const field = screen.getByLabelText("Text");
  if (!(field instanceof HTMLTextAreaElement)) {
    throw new Error("the text field is no textarea");
  }
  return field;
}

describe("the sections of a new entry (step 9.3, ADR-092)", () => {
  it("starts with the sections of a figure and says whose they are", () => {
    open();
    expect(text().value).toBe(
      "## Aussehen\n\n## Wesen\n\n## Fähigkeiten\n\n## Geschichte\n\n## Beziehungen\n",
    );
    expect(text().rows).toBe(12);
    expect(
      screen.getByText(
        "Die Abschnitte gehören zur Art „Figur“. Leere Abschnitte dürfen bleiben, eigene Abschnitte kannst du ergänzen.",
      ),
    ).toBeDefined();
  });

  it("changes the sections with the category as long as the text is untouched", async () => {
    const { user } = open();
    const category = screen.getByLabelText("Kategorie");

    await user.selectOptions(category, "ort");
    expect(text().value).toBe(templateFor("ort"));
    expect(
      screen.getByText(/^Die Abschnitte gehören zur Art „Ort \/ Geografie“\./),
    ).toBeDefined();

    await user.selectOptions(category, "gegenstand");
    expect(text().value).toBe(
      "## Aussehen\n\n## Zweck\n\n## Verwendung\n\n## Auswirkung\n",
    );
    await user.selectOptions(category, "kultur");
    expect(text().value).toBe(templateFor("kultur"));
    expect(screen.getByText(/„Kultur“/)).toBeDefined();
  });

  it("leaves rules and timeline without sections and without that hint", async () => {
    const { user } = open();
    const category = screen.getByLabelText("Kategorie");

    await user.selectOptions(category, "regel");
    expect(text().value).toBe("");
    expect(screen.queryByText(HINT)).toBeNull();

    await user.selectOptions(category, "zeitlinie");
    expect(text().value).toBe("");
    expect(screen.queryByText(HINT)).toBeNull();
    expect(screen.getByText(/Reihenfolge untereinander/)).toBeDefined();

    // Empty text takes the sections of the next category again.
    await user.selectOptions(category, "figur");
    expect(text().value).toBe(templateFor("figur"));
    expect(screen.queryByText(/Reihenfolge untereinander/)).toBeNull();
  });

  it("keeps what the author wrote when the category changes", async () => {
    const { user } = open();
    await user.type(text(), "Wirt am Kai.");
    const written = text().value;
    expect(written).toBe(`${templateFor("figur")}Wirt am Kai.`);

    await user.selectOptions(screen.getByLabelText("Kategorie"), "ort");
    expect(text().value).toBe(written);
    // The hint follows the category, not the text.
    expect(screen.getByText(/„Ort \/ Geografie“/)).toBeDefined();
  });

  it("takes the sections of the new category when the author emptied the field", async () => {
    const { user } = open();
    await user.clear(text());
    await user.type(text(), "  ");
    await user.selectOptions(screen.getByLabelText("Kategorie"), "ort");
    expect(text().value).toBe(templateFor("ort"));
  });

  it("sends the sections with the entry when saving", async () => {
    const { calls } = fakeApi({
      "POST /api/worlds/salzmark/entries": created({
        ...ENTRY,
        id: "neu",
        name: "Neu",
      }),
    });
    const { user, onClose } = open();
    await user.selectOptions(screen.getByLabelText("Kategorie"), "ort");
    await user.type(screen.getByLabelText("Name"), "Neu");
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledWith("neu");
    });
    expect(calls.find((c) => c.method === "POST")?.body).toEqual({
      category: "ort",
      name: "Neu",
      aliases: [],
      status: null,
      body: templateFor("ort"),
    });
  });
});

describe("changing an entry has no sections of its own (step 9.3)", () => {
  it("shows the text of the entry and keeps it when the category changes", async () => {
    const { user } = open(ENTRY);
    expect(text().value).toBe("Fährt über den See.");
    expect(screen.queryByText(HINT)).toBeNull();

    await user.selectOptions(screen.getByLabelText("Kategorie"), "ort");
    expect(text().value).toBe("Fährt über den See.");
    expect(screen.queryByText(HINT)).toBeNull();

    await user.selectOptions(screen.getByLabelText("Kategorie"), "zeitlinie");
    expect(text().value).toBe("Fährt über den See.");
    expect(screen.getByText(/Reihenfolge untereinander/)).toBeDefined();
  });

  it("does not fill an emptied text with sections", async () => {
    const { user } = open({ ...ENTRY, body: "" });
    expect(text().value).toBe("");
    await user.selectOptions(screen.getByLabelText("Kategorie"), "gegenstand");
    expect(text().value).toBe("");
  });
});
