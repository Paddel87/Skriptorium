import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fail, fakeApi, ok, STORY } from "../../fake-api";
import type { Story } from "../api";
import { shrinkImage } from "../files";
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
});
