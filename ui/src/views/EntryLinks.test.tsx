import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ENTRY } from "../../fake-api";
import type { CanonEntry } from "../api";
import { EntryArticle } from "./EntryArticle";

const GUNDA: CanonEntry = {
  ...ENTRY,
  id: "gunda-hollt",
  name: "Gunda Hollt",
  aliases: ["Gunda"],
};
const TURM: CanonEntry = { ...ENTRY, id: "aschturm", name: "Aschturm" };
const ELSEWHERE: CanonEntry = {
  ...ENTRY,
  world: "nebel",
  id: "nebelkoenig",
  name: "Nebelkönig",
};

function article(body: string, world = "salzmark", open = vi.fn()) {
  const current: CanonEntry = { ...ENTRY, world, body };
  render(
    <EntryArticle
      world="salzmark"
      current={current}
      compact={false}
      entries={[ENTRY, GUNDA, TURM, ELSEWHERE]}
      onOpen={open}
      onEdit={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
  return open;
}

describe("@Name in the text of an entry (step 8.11, ADR-088)", () => {
  it("is a link to the entry, the longest name wins", async () => {
    const open = article(
      "Kennt @Gunda Hollt, trifft @gunda im **@Aschturm**.\n\n- Liste: @Aschturm",
    );
    const user = userEvent.setup();

    expect(screen.getAllByRole("button", { name: "@Aschturm" })).toHaveLength(
      2,
    );
    await user.click(screen.getByRole("button", { name: "@Gunda Hollt" }));
    expect(open).toHaveBeenLastCalledWith("gunda-hollt");
    await user.click(screen.getByRole("button", { name: "@gunda" }));
    expect(open).toHaveBeenLastCalledWith("gunda-hollt");
    const [first] = screen.getAllByRole("button", { name: "@Aschturm" });
    await user.click(first as HTMLElement);
    expect(open).toHaveBeenLastCalledWith("aschturm");
  });

  it("leaves unknown words and entries of other worlds as text", () => {
    article("Siehe @Unbekannt und @Nebelkönig.");

    expect(screen.queryByRole("button", { name: /@/ })).toBeNull();
    expect(screen.getByText(/Siehe @Unbekannt und @Nebelkönig\./)).toBeTruthy();
  });

  it("is plain text in the entry of a guest", () => {
    article("Kennt @Gunda.", "nebel");

    expect(screen.queryByRole("button", { name: "@Gunda" })).toBeNull();
  });
});
