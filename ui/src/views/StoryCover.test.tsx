import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fail, fakeApi, ok, STORY, withoutOrigins } from "../../fake-api";
import type { Story } from "../api";
import { shrinkImage } from "../files";
import { coverPrompt } from "../imagePrompts";
import { StoryCover } from "./StoryCover";

vi.mock("../files", () => ({
  IMAGE_SIDE: 2000,
  shrinkImage: vi.fn(() => Promise.resolve(new Blob(["klein"]))),
  base64: vi.fn(() => Promise.resolve("a2xlaW4=")),
}));

const COVER = `/api/worlds/${STORY.world}/stories/${STORY.id}/cover`;
const WITH_COVER: Story = { ...STORY, cover: "titelbild-aaaaaaaaaaaa.jpg" };

afterEach(() => {
  vi.restoreAllMocks();
});

function picker(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (input === null) {
    throw new Error("kein Dateifeld");
  }
  return input;
}

describe("cover of a story (step 7.11)", () => {
  it("invites to add a cover and stores it as JPEG", async () => {
    const { calls } = fakeApi({ [`POST ${COVER}`]: ok(WITH_COVER) });
    const saved = vi.fn();
    const user = userEvent.setup();
    render(<StoryCover story={STORY} onSaved={saved} />);
    expect(
      screen.getByRole("button", { name: "＋ Titelbild hinzufügen" }),
    ).toBeDefined();
    expect(
      screen.getByText("Am besten Hochformat, z. B. 1.600 × 2.560."),
    ).toBeDefined();
    await user.upload(
      picker(),
      new File(["foto"], "umschlag.png", { type: "image/png" }),
    );
    await waitFor(() => {
      expect(saved).toHaveBeenCalledWith(WITH_COVER);
    });
    expect(vi.mocked(shrinkImage).mock.calls.at(-1)?.slice(1)).toEqual([
      2000,
      true,
    ]);
    expect(calls.at(-1)).toEqual({
      method: "POST",
      path: COVER,
      body: { content: "a2xlaW4=" },
    });
  });

  it("shows the cover, changes the address with a new one and removes it", async () => {
    const { calls } = fakeApi({ [`DELETE ${COVER}`]: ok(STORY) });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const saved = vi.fn();
    const user = userEvent.setup();
    render(<StoryCover story={WITH_COVER} onSaved={saved} />);
    expect(
      screen.getByAltText(`Titelbild von ${STORY.title}`).getAttribute("src"),
    ).toBe(`${COVER}?v=titelbild-aaaaaaaaaaaa.jpg`);
    expect(screen.getByText("Erscheint als Umschlag im E-Book.")).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Titelbild ändern" }),
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Entfernen" }));
    await waitFor(() => {
      expect(saved).toHaveBeenCalledWith(STORY);
    });
    expect(calls.at(-1)?.method).toBe("DELETE");
  });

  it("shows why a cover was refused", async () => {
    fakeApi({
      [`POST ${COVER}`]: fail(422, "Nur Bilder im Format PNG, JPEG oder WebP"),
    });
    const user = userEvent.setup();
    render(<StoryCover story={STORY} onSaved={vi.fn()} />);
    await user.upload(
      picker(),
      new File(["x"], "x.png", { type: "image/png" }),
    );
    expect(
      await screen.findByText("Nur Bilder im Format PNG, JPEG oder WebP"),
    ).toBeDefined();
  });

  it("opens the file dialog from the menu and closes the menu again", async () => {
    const click = vi
      .spyOn(HTMLInputElement.prototype, "click")
      .mockImplementation(() => {
        // no dialog in jsdom
      });
    const user = userEvent.setup();
    render(<StoryCover story={STORY} onSaved={vi.fn()} />);
    const add = screen.getByRole("button", { name: "＋ Titelbild hinzufügen" });
    await user.click(add);
    expect(screen.getByRole("menu")).toBeDefined();
    await user.click(add);
    expect(screen.queryByRole("menu")).toBeNull();
    await user.click(add);
    await user.click(screen.getByRole("menuitem", { name: "Bild hochladen" }));
    expect(click).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("offers to change an existing cover through the same menu", async () => {
    const user = userEvent.setup();
    render(<StoryCover story={WITH_COVER} onSaved={vi.fn()} />);
    const change = screen.getByRole("button", { name: "Titelbild ändern" });
    await user.click(change);
    expect(change.getAttribute("aria-expanded")).toBe("true");
    expect(
      screen.getByRole("menuitem", { name: "✨ Bild erzeugen" }),
    ).toBeDefined();
    await user.click(change);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("does nothing when the file dialog is closed without a file", () => {
    const { calls } = fakeApi({});
    const saved = vi.fn();
    render(<StoryCover story={STORY} onSaved={saved} />);
    fireEvent.change(picker(), { target: { files: [] } });
    expect(calls).toEqual([]);
    expect(saved).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("keeps the cover when removing is not confirmed", async () => {
    const { calls } = fakeApi({});
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const saved = vi.fn();
    const user = userEvent.setup();
    render(<StoryCover story={WITH_COVER} onSaved={saved} />);
    await user.click(screen.getByRole("button", { name: "Entfernen" }));
    expect(withoutOrigins(calls)).toEqual([]);
    expect(saved).not.toHaveBeenCalled();
  });

  it("shows why removing failed and enables the buttons again", async () => {
    fakeApi({ [`DELETE ${COVER}`]: fail(500, "Löschen nicht möglich") });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const saved = vi.fn();
    const user = userEvent.setup();
    render(<StoryCover story={WITH_COVER} onSaved={saved} />);
    await user.click(screen.getByRole("button", { name: "Entfernen" }));
    expect(await screen.findByText("Löschen nicht möglich")).toBeDefined();
    expect(saved).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Entfernen" })).toHaveProperty(
      "disabled",
      false,
    );
  });

  it("blocks the buttons while the cover is being saved", async () => {
    let answer: () => void = () => undefined;
    const pending = new Promise<void>((resolve) => {
      answer = resolve;
    });
    fakeApi({ [`POST ${COVER}`]: ok(WITH_COVER) });
    vi.mocked(shrinkImage).mockImplementationOnce(() =>
      pending.then(() => new Blob(["klein"])),
    );
    const user = userEvent.setup();
    render(<StoryCover story={STORY} onSaved={vi.fn()} />);
    await user.upload(
      picker(),
      new File(["x"], "x.png", { type: "image/png" }),
    );
    expect(
      await screen.findByText("Bild wird verkleinert und gespeichert …"),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "＋ Titelbild hinzufügen" }),
    ).toHaveProperty("disabled", true);
    answer();
    await waitFor(() => {
      expect(
        screen.queryByText("Bild wird verkleinert und gespeichert …"),
      ).toBeNull();
    });
  });

  it("generates a cover as JPEG, hands it over and closes the dialog", async () => {
    const { calls } = fakeApi({
      "GET /api/images/models": ok({
        default: "black-forest-labs/flux.2-pro",
        models: [{ id: "black-forest-labs/flux.2-pro", name: "FLUX.2 Pro" }],
        available: true,
        ready: true,
      }),
      "GET /api/images/price": ok({ cost_usd: 0.04, unit: "image" }),
      "POST /api/images/generate": ok({
        content: "iVBORw0KGgo=",
        media_type: "image/png",
        cost_usd: 0.04,
        model: "black-forest-labs/flux.2-pro",
      }),
      [`POST ${COVER}`]: ok(WITH_COVER),
    });
    const saved = vi.fn();
    const user = userEvent.setup();
    render(<StoryCover story={STORY} onSaved={saved} />);
    await user.click(
      screen.getByRole("button", { name: "＋ Titelbild hinzufügen" }),
    );
    await user.click(
      screen.getByRole("menuitem", { name: "✨ Bild erzeugen" }),
    );
    expect(screen.queryByRole("menu")).toBeNull();
    expect(
      screen.getByRole("group", { name: "Titelbild erzeugen" }),
    ).toBeDefined();
    expect(
      screen
        .getByRole("radio", { name: "Hochformat" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    await user.click(
      await screen.findByRole("button", { name: "✨ Erzeugen" }),
    );
    await user.click(await screen.findByRole("button", { name: "Übernehmen" }));
    await waitFor(() => {
      expect(saved).toHaveBeenCalledWith(WITH_COVER);
    });
    expect(vi.mocked(shrinkImage).mock.calls.at(-1)?.slice(1)).toEqual([
      2000,
      true,
    ]);
    expect(withoutOrigins(calls).at(-1)?.body).toEqual({
      content: "a2xlaW4=",
      herkunft: {
        model: "black-forest-labs/flux.2-pro",
        prompt: coverPrompt(STORY),
        aspect_ratio: "2:3",
        cost_usd: 0.04,
      },
    });
    await waitFor(() => {
      expect(
        screen.queryByRole("group", { name: "Titelbild erzeugen" }),
      ).toBeNull();
    });
  });

  it("closes the generate dialog without saving", async () => {
    fakeApi({
      "GET /api/images/models": ok({
        default: "x/y",
        models: [{ id: "x/y", name: "Y" }],
        available: true,
        ready: true,
      }),
      "GET /api/images/price": ok({ cost_usd: null, unit: null }),
    });
    const saved = vi.fn();
    const user = userEvent.setup();
    render(<StoryCover story={WITH_COVER} onSaved={saved} />);
    await user.click(screen.getByRole("button", { name: "Titelbild ändern" }));
    await user.click(
      screen.getByRole("menuitem", { name: "✨ Bild erzeugen" }),
    );
    await user.click(await screen.findByRole("button", { name: "Abbrechen" }));
    expect(
      screen.queryByRole("group", { name: "Titelbild erzeugen" }),
    ).toBeNull();
    expect(saved).not.toHaveBeenCalled();
  });
});
