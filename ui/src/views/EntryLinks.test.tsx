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

describe("„Verweise hierher“ below an entry (step 9.4, ADR-093)", () => {
  function shown(
    entries: CanonEntry[],
    current: CanonEntry,
    world = "salzmark",
  ) {
    const open = vi.fn();
    render(
      <EntryArticle
        world={world}
        current={current}
        compact={false}
        entries={entries}
        onOpen={open}
        onEdit={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    return open;
  }

  it("shows relations with their kind and mentions, each a link", async () => {
    const gunda = {
      ...GUNDA,
      body: "## Beziehungen\n- verheiratet mit @Kael",
    };
    const turm = { ...TURM, category: "ort" as const, body: "Kael? @Kael." };
    const open = shown([ENTRY, gunda, turm, ELSEWHERE], ENTRY);
    const user = userEvent.setup();

    const block = screen.getByRole("region", { name: "Verweise hierher" });
    expect(block.textContent).toContain("Gunda Hollt – verheiratet mit");
    expect(block.textContent).toContain("Aschturm (Ort / Geografie)");
    await user.click(screen.getByRole("button", { name: "Gunda Hollt" }));
    expect(open).toHaveBeenLastCalledWith("gunda-hollt");
    await user.click(screen.getByRole("button", { name: "Aschturm" }));
    expect(open).toHaveBeenLastCalledWith("aschturm");
  });

  it("is missing without references and for guests", () => {
    shown([ENTRY, GUNDA, TURM], ENTRY);
    expect(
      screen.queryByRole("region", { name: "Verweise hierher" }),
    ).toBeNull();

    const nebel = { ...ELSEWHERE, body: "" };
    const visitor = { ...ENTRY, body: "- verheiratet mit @Nebelkönig" };
    shown([visitor, nebel], nebel);
    expect(
      screen.queryByRole("region", { name: "Verweise hierher" }),
    ).toBeNull();
  });
});
