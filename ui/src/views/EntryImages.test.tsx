import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  catalogModel,
  created,
  ENTRY,
  fakeApi,
  fail,
  modelList,
  ok,
  sseFeed,
} from "../../fake-api";
import type { CanonEntry } from "../api";
import { EntryImages } from "./EntryImages";

vi.mock("../files", () => ({
  shrinkImage: vi.fn(() => Promise.resolve(new Blob(["klein"]))),
  base64: vi.fn(() => Promise.resolve("a2xlaW4=")),
}));

const BASE = `/api/worlds/${ENTRY.world}/entries/${ENTRY.id}/images`;
const WITH_THREE: CanonEntry = {
  ...ENTRY,
  images: ["kael-a.webp", "kael-b.jpg", "kael-c.png"],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("images of a canon entry (step 7.6)", () => {
  it("shows nothing for an entry without images that cannot be changed", () => {
    const { container } = render(
      <EntryImages entry={ENTRY} editable={false} onChanged={vi.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("shows the main image and previews; adds an image after shrinking it", async () => {
    const after = {
      ...WITH_THREE,
      images: [...WITH_THREE.images, "kael-d.webp"],
    };
    const { calls } = fakeApi({ [`POST ${BASE}`]: created(after) });
    const changed = vi.fn();
    const user = userEvent.setup();
    render(<EntryImages entry={WITH_THREE} editable onChanged={changed} />);
    expect(screen.getByAltText("Kael, Hauptbild").getAttribute("src")).toBe(
      `${BASE}/kael-a.webp`,
    );
    expect(screen.getAllByRole("button", { name: /groß zeigen/ })).toHaveLength(
      3,
    );
    expect(
      screen.getByText("3 Bilder · Tipp auf ein Bild zeigt es groß"),
    ).toBeDefined();
    const input =
      document.querySelector<HTMLInputElement>('input[type="file"]');
    if (input === null) {
      throw new Error("kein Dateifeld");
    }
    await user.upload(
      input,
      new File(["foto"], "foto.jpg", { type: "image/jpeg" }),
    );
    await waitFor(() => {
      expect(changed).toHaveBeenCalledWith(after);
    });
    expect(calls.at(-1)).toEqual({
      method: "POST",
      path: BASE,
      body: { content: "a2xlaW4=" },
    });
  });

  it("invites to add the first image", () => {
    render(<EntryImages entry={ENTRY} editable onChanged={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Bild hinzufügen" }),
    ).toBeDefined();
    expect(
      screen.getByText("Noch kein Bild – „＋“ fügt eins hinzu"),
    ).toBeDefined();
  });

  it("shows an image large, browses, makes it the main image and removes one", async () => {
    const { calls } = fakeApi({
      [`POST ${BASE}/kael-b.jpg/main`]: ok({
        ...WITH_THREE,
        images: ["kael-b.jpg", "kael-a.webp", "kael-c.png"],
      }),
      [`DELETE ${BASE}/kael-c.png`]: ok({
        ...WITH_THREE,
        images: ["kael-a.webp", "kael-b.jpg"],
      }),
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const changed = vi.fn();
    const user = userEvent.setup();
    render(<EntryImages entry={WITH_THREE} editable onChanged={changed} />);
    await user.click(
      screen.getByRole("button", { name: "Bild 2 groß zeigen" }),
    );
    expect(
      screen.getByRole("dialog", { name: "Kael, Bild 2 von 3" }),
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "nächstes ›" }));
    expect(
      screen.getByRole("dialog", { name: "Kael, Bild 3 von 3" }),
    ).toBeDefined();
    await user.keyboard("{ArrowLeft}");
    expect(
      screen.getByRole("dialog", { name: "Kael, Bild 2 von 3" }),
    ).toBeDefined();
    await user.click(
      screen.getByRole("button", { name: "Zum Hauptbild machen" }),
    );
    await waitFor(() => {
      expect(calls.at(-1)?.path).toBe(`${BASE}/kael-b.jpg/main`);
    });
    expect(changed).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "nächstes ›" }));
    await user.click(screen.getByRole("button", { name: "nächstes ›" }));
    await user.click(screen.getByRole("button", { name: "Entfernen" }));
    await waitFor(() => {
      expect(calls.at(-1)).toMatchObject({
        method: "DELETE",
        path: `${BASE}/kael-c.png`,
      });
    });
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("only shows images of a guest or in the compact bar", async () => {
    const user = userEvent.setup();
    render(
      <EntryImages entry={WITH_THREE} editable={false} onChanged={vi.fn()} />,
    );
    expect(
      screen.queryByRole("button", { name: "Bild hinzufügen" }),
    ).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "Bild 2 groß zeigen" }),
    );
    expect(screen.queryByRole("button", { name: "Entfernen" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Zum Hauptbild machen" }),
    ).toBeNull();
    await user.click(screen.getByRole("button", { name: "Schließen" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows why an image was refused", async () => {
    fakeApi({
      [`POST ${BASE}`]: fail(422, "Nur Bilder im Format PNG, JPEG oder WebP"),
    });
    const user = userEvent.setup();
    render(<EntryImages entry={ENTRY} editable onChanged={vi.fn()} />);
    const input =
      document.querySelector<HTMLInputElement>('input[type="file"]');
    if (input === null) {
      throw new Error("kein Dateifeld");
    }
    await user.upload(input, new File(["x"], "x.png", { type: "image/png" }));
    expect(
      await screen.findByText("Nur Bilder im Format PNG, JPEG oder WebP"),
    ).toBeDefined();
  });

  it("opens the file dialog from the menu and toggles the menu", async () => {
    const click = vi
      .spyOn(HTMLInputElement.prototype, "click")
      .mockImplementation(() => {
        // no dialog in jsdom
      });
    const user = userEvent.setup();
    render(<EntryImages entry={ENTRY} editable onChanged={vi.fn()} />);
    const add = screen.getByRole("button", { name: "Bild hinzufügen" });
    await user.click(add);
    expect(screen.getByRole("menu")).toBeDefined();
    await user.click(add);
    expect(screen.queryByRole("menu")).toBeNull();
    await user.click(add);
    await user.click(screen.getByRole("menuitem", { name: "Bild hochladen" }));
    expect(click).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("does nothing when the file dialog is closed without a file", () => {
    const { calls } = fakeApi({});
    const changed = vi.fn();
    render(<EntryImages entry={ENTRY} editable onChanged={changed} />);
    const input =
      document.querySelector<HTMLInputElement>('input[type="file"]');
    if (input === null) {
      throw new Error("kein Dateifeld");
    }
    fireEvent.change(input, { target: { files: [] } });
    expect(calls).toEqual([]);
    expect(changed).not.toHaveBeenCalled();
  });

  it("offers no more images once the limit of twelve is reached", () => {
    const full: CanonEntry = {
      ...ENTRY,
      images: Array.from({ length: 12 }, (_, at) => `kael-${String(at)}.webp`),
    };
    render(<EntryImages entry={full} editable onChanged={vi.fn()} />);
    expect(
      screen.queryByRole("button", { name: "Bild hinzufügen" }),
    ).toBeNull();
    expect(screen.getAllByRole("button", { name: /groß zeigen/ })).toHaveLength(
      12,
    );
    expect(
      screen.getByText("12 Bilder · Tipp auf ein Bild zeigt es groß"),
    ).toBeDefined();
  });

  it("says Bild for a single image", () => {
    render(
      <EntryImages
        entry={{ ...ENTRY, images: ["kael-a.webp"] }}
        editable={false}
        onChanged={vi.fn()}
      />,
    );
    expect(
      screen.getByText("1 Bild · Tipp auf ein Bild zeigt es groß"),
    ).toBeDefined();
    expect(screen.queryByRole("button", { name: /groß zeigen/ })).toBeNull();
  });

  it("browses around with the arrow keys, but not in a field or with one image", async () => {
    const user = userEvent.setup();
    render(
      <EntryImages entry={WITH_THREE} editable={false} onChanged={vi.fn()} />,
    );
    await user.click(
      screen.getByRole("button", { name: "Bild 1 groß zeigen" }),
    );
    await user.keyboard("{ArrowLeft}");
    expect(
      screen.getByRole("dialog", { name: "Kael, Bild 3 von 3" }),
    ).toBeDefined();
    await user.keyboard("{ArrowRight}");
    expect(
      screen.getByRole("dialog", { name: "Kael, Bild 1 von 3" }),
    ).toBeDefined();
    await user.keyboard("{ArrowRight}");
    expect(
      screen.getByRole("dialog", { name: "Kael, Bild 2 von 3" }),
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "‹ voriges" }));
    expect(
      screen.getByRole("dialog", { name: "Kael, Bild 1 von 3" }),
    ).toBeDefined();
    // Keys typed into a field stay there.
    const field = document.createElement("textarea");
    document.body.append(field);
    field.focus();
    await user.keyboard("{ArrowRight}{Escape}");
    field.remove();
    expect(
      screen.getByRole("dialog", { name: "Kael, Bild 1 von 3" }),
    ).toBeDefined();
  });

  it("ignores arrow keys with a single image and closes on the backdrop", async () => {
    const user = userEvent.setup();
    render(
      <EntryImages
        entry={{ ...ENTRY, images: ["kael-a.webp"] }}
        editable={false}
        onChanged={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Kael, Hauptbild" }));
    await user.keyboard("{ArrowRight}{ArrowLeft}");
    expect(
      screen.getByRole("dialog", { name: "Kael, Bild 1 von 1" }),
    ).toBeDefined();
    expect(screen.queryByRole("button", { name: "nächstes ›" })).toBeNull();
    // A click inside the dialog keeps it open, one on the veil closes it.
    await user.click(screen.getByRole("dialog"));
    expect(screen.getByRole("dialog")).toBeDefined();
    const veil = document.querySelector<HTMLElement>(".image-viewer-veil");
    if (veil === null) {
      throw new Error("kein Hintergrund");
    }
    await user.click(veil);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps an image when removing is not confirmed", async () => {
    const { calls } = fakeApi({});
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    render(<EntryImages entry={WITH_THREE} editable onChanged={vi.fn()} />);
    await user.click(
      screen.getByRole("button", { name: "Bild 2 groß zeigen" }),
    );
    await user.click(screen.getByRole("button", { name: "Entfernen" }));
    expect(calls).toEqual([]);
    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("goes to the previous image after removing a later one, and closes after the last", async () => {
    const { calls } = fakeApi({
      [`DELETE ${BASE}/kael-b.jpg`]: ok({
        ...ENTRY,
        images: ["kael-a.webp", "kael-c.png"],
      }),
      [`DELETE ${BASE}/kael-a.webp`]: ok({ ...ENTRY, images: [] }),
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<EntryImages entry={WITH_THREE} editable onChanged={vi.fn()} />);
    await user.click(
      screen.getByRole("button", { name: "Bild 2 groß zeigen" }),
    );
    await user.click(screen.getByRole("button", { name: "Entfernen" }));
    await waitFor(() => {
      expect(
        screen.getByRole("dialog", { name: "Kael, Bild 1 von 3" }),
      ).toBeDefined();
    });
    expect(calls.at(-1)?.path).toBe(`${BASE}/kael-b.jpg`);
  });

  it("closes the viewer after removing the only image", async () => {
    const only: CanonEntry = { ...ENTRY, images: ["kael-a.webp"] };
    fakeApi({ [`DELETE ${BASE}/kael-a.webp`]: ok(ENTRY) });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<EntryImages entry={only} editable onChanged={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Kael, Hauptbild" }));
    await user.click(screen.getByRole("button", { name: "Entfernen" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("stays on the image and shows why when making it the main image fails", async () => {
    fakeApi({
      [`POST ${BASE}/kael-b.jpg/main`]: fail(500, "Tausch gescheitert"),
    });
    const changed = vi.fn();
    const user = userEvent.setup();
    render(<EntryImages entry={WITH_THREE} editable onChanged={changed} />);
    await user.click(
      screen.getByRole("button", { name: "Bild 2 groß zeigen" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Zum Hauptbild machen" }),
    );
    expect(await screen.findByText("Tausch gescheitert")).toBeDefined();
    expect(changed).not.toHaveBeenCalled();
    expect(
      screen.getByRole("dialog", { name: "Kael, Bild 2 von 3" }),
    ).toBeDefined();
  });

  it("shows the hint for a figure without looks and a landscape format for places", async () => {
    const models = {
      "GET /api/images/models": ok({
        default: "x/y",
        models: [{ id: "x/y", name: "Y" }],
        available: true,
        ready: true,
      }),
      "GET /api/images/price": ok({ cost_usd: 0.04, unit: "image" }),
    };
    fakeApi(models);
    const user = userEvent.setup();
    const { unmount } = render(
      <EntryImages entry={ENTRY} editable onChanged={vi.fn()} />,
    );
    await user.click(screen.getByRole("button", { name: "Bild hinzufügen" }));
    await user.click(
      screen.getByRole("menuitem", { name: "✨ Bild erzeugen" }),
    );
    expect(
      screen.getByText(/Diese Figur hat noch kein „Aussehen“/),
    ).toBeDefined();
    expect(
      screen
        .getByRole("radio", { name: "Hochformat" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    await user.click(screen.getByRole("button", { name: "Abbrechen" }));
    expect(screen.queryByRole("group")).toBeNull();
    unmount();

    render(
      <EntryImages
        entry={{ ...ENTRY, category: "ort", name: "Grauhang" }}
        editable
        onChanged={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Bild hinzufügen" }));
    await user.click(
      screen.getByRole("menuitem", { name: "✨ Bild erzeugen" }),
    );
    expect(screen.queryByText(/kein „Aussehen“/)).toBeNull();
    expect(
      screen.getByRole("radio", { name: "Quer" }).getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("shows why a generated image could not be stored and keeps the dialog", async () => {
    fakeApi({
      "GET /api/images/models": ok({
        default: "x/y",
        models: [{ id: "x/y", name: "Y" }],
        available: true,
        ready: true,
      }),
      "GET /api/images/price": ok({ cost_usd: 0.04, unit: "image" }),
      "POST /api/images/generate": ok({
        content: "iVBORw0KGgo=",
        media_type: "image/png",
        cost_usd: 0.04,
        model: "x/y",
      }),
      [`POST ${BASE}`]: fail(422, "Bild zu groß"),
    });
    const changed = vi.fn();
    const user = userEvent.setup();
    render(<EntryImages entry={ENTRY} editable onChanged={changed} />);
    await user.click(screen.getByRole("button", { name: "Bild hinzufügen" }));
    await user.click(
      screen.getByRole("menuitem", { name: "✨ Bild erzeugen" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "✨ Erzeugen" }),
    );
    await user.click(await screen.findByRole("button", { name: "Übernehmen" }));
    expect(await screen.findByText("Bild zu groß")).toBeDefined();
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByRole("group")).toBeDefined();
  });

  it("closes the description when browsing to another image or closing the viewer", async () => {
    const entry: CanonEntry = {
      ...ENTRY,
      images: ["kael-a.webp", "kael-b.jpg"],
    };
    fakeApi({
      "GET /api/models": ok(
        modelList(
          ["x-ai/grok-4.6"],
          [catalogModel("x-ai/grok-4.6", { reads_images: true })],
        ),
      ),
      [`POST ${BASE}/kael-a.webp/describe`]: () => ({
        status: 200,
        stream: sseFeed().stream,
      }),
    });
    const user = userEvent.setup();
    render(<EntryImages entry={entry} editable onChanged={vi.fn()} />);
    await user.click(
      screen.getByRole("button", { name: "Bild 1 groß zeigen" }),
    );
    await user.click(
      screen.getByRole("button", { name: "✨ Von der KI beschreiben lassen" }),
    );
    expect(await screen.findByText("Aussehen von Kael")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "nächstes ›" }));
    expect(screen.queryByText("Aussehen von Kael")).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "✨ Von der KI beschreiben lassen" }),
    );
    expect(await screen.findByText("Aussehen von Kael")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Verwerfen" }));
    expect(screen.queryByText("Aussehen von Kael")).toBeNull();
    expect(screen.getByRole("dialog")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Schließen" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
