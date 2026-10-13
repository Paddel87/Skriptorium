import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  catalogModel,
  ENTRY,
  fail,
  fakeApi,
  modelList,
  ok,
  sseFeed,
} from "../../fake-api";
import type { CanonEntry } from "../api";
import { AppearanceExtract } from "./AppearanceExtract";
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

const ENTRY_PATH = "GET /api/worlds/salzmark/entries/kael";
const PATCH = "PATCH /api/worlds/salzmark/entries/kael";

function extract(
  onChanged = vi.fn(),
  onClose = vi.fn(),
): { onChanged: typeof onChanged; onClose: typeof onClose } {
  render(
    <AppearanceExtract
      entry={FIGURE}
      onChanged={onChanged}
      onClose={onClose}
    />,
  );
  return { onChanged, onClose };
}

function finish(feed: ReturnType<typeof sseFeed>, text: string) {
  feed.send("text", { text });
  feed.send("done", {
    input_tokens: 5,
    output_tokens: 5,
    cost_usd: null,
    finish_reason: "stop",
  });
  feed.close();
}

describe("taking out the looks: edge cases (step 7.16)", () => {
  it("offers the favorites by name and sends the chosen one", async () => {
    const { calls } = fakeApi({
      "GET /api/models": ok(
        modelList(
          ["a/eins", "b/zwei"],
          [catalogModel("a/eins", { name: "Eins" })],
        ),
      ),
      [STREAM]: () => ({ status: 200, stream: sseFeed().stream }),
    });
    const user = userEvent.setup();
    extract();
    const select = await screen.findByLabelText(
      "Modell (liest nur diesen Eintrag)",
    );
    expect(
      [...(select as HTMLSelectElement).options].map((o) => o.text),
    ).toEqual(["Eins", "b/zwei"]);
    await user.selectOptions(select, "b/zwei");
    await user.click(screen.getByRole("button", { name: "Herauslösen" }));
    expect(calls.at(-1)?.body).toEqual({ model: "b/zwei" });
    expect(select).toHaveProperty("disabled", true);
    expect(screen.getByText("Die KI liest den Eintrag …")).toBeDefined();
    expect(screen.getByLabelText("Aussehen")).toHaveProperty("readOnly", true);
  });

  it("falls back to the first favorite when the default is not one", async () => {
    fakeApi({
      "GET /api/models": ok({
        ...modelList(["a/eins", "b/zwei"]),
        default: "c/drei",
      }),
    });
    extract();
    const select = await screen.findByLabelText(
      "Modell (liest nur diesen Eintrag)",
    );
    expect(select).toHaveProperty("value", "a/eins");
  });

  it("shows why the model list could not be loaded and cannot start", async () => {
    fakeApi({ "GET /api/models": fail(500, "Modelle nicht erreichbar") });
    extract();
    expect(await screen.findByText("Modelle nicht erreichbar")).toBeDefined();
    expect(screen.getByRole("button", { name: "Herauslösen" })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("shows a refusal of the model and offers no take-over", async () => {
    const feed = sseFeed();
    fakeApi({
      "GET /api/models": ok(modelList(["x-ai/grok-4.6"])),
      [STREAM]: () => ({ status: 200, stream: feed.stream }),
    });
    const user = userEvent.setup();
    extract();
    await user.click(
      await screen.findByRole("button", { name: "Herauslösen" }),
    );
    feed.send("error", { kind: "abgelehnt" });
    feed.close();
    expect(
      await screen.findByText("Das Modell hat die Anfrage abgelehnt."),
    ).toBeDefined();
    expect(
      screen.queryByRole("button", { name: "Übernehmen als „Aussehen“" }),
    ).toBeNull();
    expect(screen.getByRole("button", { name: "Herauslösen" })).toHaveProperty(
      "disabled",
      false,
    );
  });

  it("shows a failed request", async () => {
    fakeApi({
      "GET /api/models": ok(modelList(["x-ai/grok-4.6"])),
      [STREAM]: fail(502, "Anbieter nicht erreichbar"),
    });
    const user = userEvent.setup();
    extract();
    await user.click(
      await screen.findByRole("button", { name: "Herauslösen" }),
    );
    expect(await screen.findByText("Anbieter nicht erreichbar")).toBeDefined();
  });

  it("keeps the proposal and shows the error when saving fails", async () => {
    const feed = sseFeed();
    fakeApi({
      "GET /api/models": ok(modelList(["x-ai/grok-4.6"])),
      [STREAM]: () => ({ status: 200, stream: feed.stream }),
      [ENTRY_PATH]: ok(FIGURE),
      [PATCH]: fail(422, "Eintrag zu lang"),
    });
    const user = userEvent.setup();
    const { onChanged, onClose } = extract();
    await user.click(
      await screen.findByRole("button", { name: "Herauslösen" }),
    );
    finish(feed, "Grauer Bart.");
    await user.click(
      await screen.findByRole("button", { name: "Übernehmen als „Aussehen“" }),
    );
    expect(await screen.findByText("Eintrag zu lang")).toBeDefined();
    expect(onChanged).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Aussehen")).toHaveProperty(
      "value",
      "Grauer Bart.",
    );
    expect(
      screen.getByRole("button", { name: "Übernehmen als „Aussehen“" }),
    ).toHaveProperty("disabled", false);
  });

  it("lets the author edit the proposal and extract anew", async () => {
    const first = sseFeed();
    const second = sseFeed();
    const feeds = [first, second];
    const { calls } = fakeApi({
      "GET /api/models": ok(modelList(["x-ai/grok-4.6"])),
      [STREAM]: () => ({
        status: 200,
        stream: (feeds.shift() ?? second).stream,
      }),
      [ENTRY_PATH]: ok(FIGURE),
      [PATCH]: ok({ ...FIGURE, body: "neu" }),
    });
    const user = userEvent.setup();
    const { onChanged, onClose } = extract();
    await user.click(
      await screen.findByRole("button", { name: "Herauslösen" }),
    );
    finish(first, "Erster Versuch.");
    await user.click(
      await screen.findByRole("button", { name: "Neu herauslösen" }),
    );
    finish(second, "Zweiter Versuch");
    const field = await screen.findByLabelText("Aussehen");
    await waitFor(() => {
      expect(field).toHaveProperty("value", "Zweiter Versuch");
    });
    await user.type(field, "!");
    await user.click(
      await screen.findByRole("button", { name: "Übernehmen als „Aussehen“" }),
    );
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
    expect(onChanged).toHaveBeenCalledOnce();
    expect(calls.at(-1)?.body).toEqual({
      body: "- **Wesen:** schweigsam\n- **Bart:** grau\n\n## Aussehen\n\nZweiter Versuch!\n",
    });
  });

  it("cancels a running extraction quietly", async () => {
    const feed = sseFeed();
    fakeApi({
      "GET /api/models": ok(modelList(["x-ai/grok-4.6"])),
      [STREAM]: () => ({ status: 200, stream: feed.stream }),
    });
    const user = userEvent.setup();
    const { onClose } = extract();
    await user.click(
      await screen.findByRole("button", { name: "Herauslösen" }),
    );
    feed.send("text", { text: "Ein Mann" });
    await user.click(await screen.findByRole("button", { name: "Abbrechen" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("discards a finished proposal", async () => {
    const feed = sseFeed();
    fakeApi({
      "GET /api/models": ok(modelList(["x-ai/grok-4.6"])),
      [STREAM]: () => ({ status: 200, stream: feed.stream }),
    });
    const user = userEvent.setup();
    const { onClose } = extract();
    await user.click(
      await screen.findByRole("button", { name: "Herauslösen" }),
    );
    finish(feed, "Fertig.");
    await user.click(await screen.findByRole("button", { name: "Verwerfen" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ignores the model list when closed before it arrives", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {
      // nothing to print
    });
    fakeApi({ "GET /api/models": ok(modelList(["x-ai/grok-4.6"])) });
    render(
      <AppearanceExtract
        entry={FIGURE}
        onChanged={vi.fn()}
        onClose={vi.fn()}
      />,
    ).unmount();
    expect(errors).not.toHaveBeenCalled();
  });
});
