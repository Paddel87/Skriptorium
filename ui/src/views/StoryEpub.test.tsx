import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fail, fakeApi, ok, STORY } from "../../fake-api";
import { StoryEpub } from "./StoryEpub";

const EXPORT = `POST /api/worlds/${STORY.world}/stories/${STORY.id}/export/epub`;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("story as e-book (step 7.4)", () => {
  it("sends author and choice and downloads the file", async () => {
    const created = vi.fn(() => "blob:buch");
    const revoked = vi.fn();
    Object.assign(URL, { createObjectURL: created, revokeObjectURL: revoked });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    const { calls } = fakeApi({ [EXPORT]: ok("EPUB") });
    const user = userEvent.setup();
    render(<StoryEpub story={STORY} />);
    await user.click(
      screen.getByRole("button", { name: "⇩ EPUB herunterladen" }),
    );
    await waitFor(() => {
      expect(click).toHaveBeenCalled();
    });
    expect(calls.at(-1)?.body).toEqual({ author: null, only_completed: false });
    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toBe(`${STORY.id}.epub`);
    expect(revoked).toHaveBeenCalledWith("blob:buch");

    await user.type(screen.getByLabelText("Autor (optional)"), "  Autorin ");
    await user.click(screen.getByLabelText("nur abgeschlossene Kapitel"));
    await user.click(
      screen.getByRole("button", { name: "⇩ EPUB herunterladen" }),
    );
    await waitFor(() => {
      expect(calls.at(-1)?.body).toEqual({
        author: "Autorin",
        only_completed: true,
      });
    });
  });

  it("shows why there is no book", async () => {
    fakeApi({ [EXPORT]: fail(422, "Kein abgeschlossenes Kapitel") });
    const user = userEvent.setup();
    render(<StoryEpub story={STORY} />);
    await user.click(
      screen.getByRole("button", { name: "⇩ EPUB herunterladen" }),
    );
    expect(
      await screen.findByText("Kein abgeschlossenes Kapitel"),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "⇩ EPUB herunterladen" }),
    ).toHaveProperty("disabled", false);
  });
});
