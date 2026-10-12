import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ENTRY, fakeApi, modelList, ok, sseFeed } from "../../fake-api";
import type { CanonEntry } from "../api";
import { EntryArticle } from "./EntryArticle";

const STREAM = "POST /api/worlds/salzmark/entries/kael/appearance";
const FIGURE: CanonEntry = {
  ...ENTRY,
  body: "- **Wesen:** schweigsam\n- **Bart:** grau",
};

afterEach(() => {
  vi.restoreAllMocks();
});

function article(entry: CanonEntry, onSaved = vi.fn()) {
  render(
    <EntryArticle
      world="salzmark"
      current={entry}
      compact={false}
      onEdit={vi.fn()}
      onSaved={onSaved}
    />,
  );
}

describe("taking out the looks of a figure (step 7.16)", () => {
  it("is offered only to figures without a section Aussehen", () => {
    article({ ...FIGURE, body: "## Aussehen\n\nHager." });
    expect(
      screen.queryByRole("button", { name: "✨ Aussehen herauslösen" }),
    ).toBeNull();
  });

  it("streams a proposal and takes it over as a section, the rest stays", async () => {
    const feed = sseFeed();
    const { calls } = fakeApi({
      "GET /api/models": ok(modelList(["x-ai/grok-4.6"])),
      [STREAM]: () => ({ status: 200, stream: feed.stream }),
      "GET /api/worlds/salzmark/entries/kael": ok(FIGURE),
      "PATCH /api/worlds/salzmark/entries/kael": ok({ ...FIGURE, body: "neu" }),
    });
    const saved = vi.fn();
    const user = userEvent.setup();
    article(FIGURE, saved);
    await user.click(
      screen.getByRole("button", { name: "✨ Aussehen herauslösen" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Herauslösen" }),
    );
    expect(calls.find((c) => c.method === "POST")?.body).toEqual({
      model: "x-ai/grok-4.6",
    });
    feed.send("text", { text: "Ein Mann mit grauem Bart." });
    feed.send("done", {
      input_tokens: 300,
      output_tokens: 12,
      cost_usd: 0.001,
      finish_reason: "stop",
    });
    feed.close();
    await user.click(
      await screen.findByRole("button", { name: "Übernehmen als „Aussehen“" }),
    );
    await waitFor(() => {
      expect(saved).toHaveBeenCalled();
    });
    expect(calls.at(-1)?.body).toEqual({
      body: "- **Wesen:** schweigsam\n- **Bart:** grau\n\n## Aussehen\n\nEin Mann mit grauem Bart.\n",
    });
  });

  it("says so when the entry names no looks", async () => {
    const feed = sseFeed();
    fakeApi({
      "GET /api/models": ok(modelList(["x-ai/grok-4.6"])),
      [STREAM]: () => ({ status: 200, stream: feed.stream }),
    });
    const user = userEvent.setup();
    article(FIGURE);
    await user.click(
      screen.getByRole("button", { name: "✨ Aussehen herauslösen" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Herauslösen" }),
    );
    feed.send("text", { text: "KEIN AUSSEHEN" });
    feed.send("done", {
      input_tokens: 1,
      output_tokens: 1,
      cost_usd: null,
      finish_reason: "stop",
    });
    feed.close();
    expect(
      await screen.findByText(/Im Eintrag steht nichts über das Aussehen/),
    ).toBeDefined();
    expect(
      screen.queryByRole("button", { name: "Übernehmen als „Aussehen“" }),
    ).toBeNull();
  });
});
