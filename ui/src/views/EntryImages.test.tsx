import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { created, ENTRY, fakeApi, fail, ok } from "../../fake-api";
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
});
