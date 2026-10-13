import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  catalogModel,
  ENTRY,
  fakeApi,
  modelList,
  ok,
  sseFeed,
  WORLD,
} from "../../fake-api";
import type { CanonEntry, World } from "../api";
import { AppearanceExtract } from "./AppearanceExtract";
import { EntryImages } from "./EntryImages";
import { WorldMaps } from "./WorldMaps";

const ENTRY_URL = "/api/worlds/salzmark/entries/kael";
const DESCRIBE = `POST ${ENTRY_URL}/images/kael-a.webp/describe`;
const MAP_FILE = "karte-aaaaaaaaaaaa.webp";
const MAP_BASE = `/api/worlds/salzmark/maps/${MAP_FILE}`;
const TITLE = "„Aussehen“ hat schon Text";

afterEach(() => {
  vi.restoreAllMocks();
});

function finish(feed: ReturnType<typeof sseFeed>, text: string) {
  feed.send("text", { text });
  feed.send("done", {
    input_tokens: 1,
    output_tokens: 1,
    cost_usd: null,
    finish_reason: "stop",
  });
  feed.close();
}

/** Describes the image of a figure and presses "Übernehmen als „Aussehen“". */
async function takeOverLooks(body: string, text = "Neu und grau.") {
  const entry: CanonEntry = { ...ENTRY, images: ["kael-a.webp"] };
  const feed = sseFeed();
  const { calls } = fakeApi({
    "GET /api/models": ok(
      modelList(
        ["x-ai/grok-4.6"],
        [catalogModel("x-ai/grok-4.6", { reads_images: true })],
      ),
    ),
    [DESCRIBE]: () => ({ status: 200, stream: feed.stream }),
    [`GET ${ENTRY_URL}`]: ok({ ...entry, body }),
    [`PATCH ${ENTRY_URL}`]: ok({ ...entry, body: "gespeichert" }),
  });
  const changed = vi.fn();
  const user = userEvent.setup();
  render(<EntryImages entry={entry} editable onChanged={changed} />);
  await user.click(screen.getByRole("button", { name: "Bild 1 groß zeigen" }));
  await user.click(
    screen.getByRole("button", { name: "✨ Von der KI beschreiben lassen" }),
  );
  await user.click(
    await screen.findByRole("button", { name: "Beschreiben lassen" }),
  );
  finish(feed, text);
  await user.click(
    await screen.findByRole("button", { name: "Übernehmen als „Aussehen“" }),
  );
  return { user, calls, changed };
}

function patches(calls: { method: string; body: unknown }[]) {
  return calls.filter((call) => call.method === "PATCH");
}

describe("taking over a text into a section that has text (step 8.4, ADR-083)", () => {
  it("appends a missing section without asking", async () => {
    const { calls, changed } = await takeOverLooks("Kael.\n");
    await waitFor(() => {
      expect(changed).toHaveBeenCalled();
    });
    expect(screen.queryByRole("dialog", { name: TITLE })).toBeNull();
    expect(patches(calls)[0]?.body).toEqual({
      body: "Kael.\n\n## Aussehen\n\nNeu und grau.\n",
    });
  });

  it("fills the empty section of the template without asking", async () => {
    const { calls, changed } = await takeOverLooks(
      "## Aussehen\n\n## Wesen und Geschichte\n",
    );
    await waitFor(() => {
      expect(changed).toHaveBeenCalled();
    });
    expect(screen.queryByRole("dialog", { name: TITLE })).toBeNull();
    expect(patches(calls)[0]?.body).toEqual({
      body: "## Aussehen\n\nNeu und grau.\n\n## Wesen und Geschichte\n",
    });
  });

  it("shows the old text and replaces it on request", async () => {
    const { user, calls, changed } = await takeOverLooks(
      "## Aussehen\n\nAlt und braun.\n\n## Wesen\nTreu.\n",
    );
    const dialog = await screen.findByRole("dialog", { name: TITLE });
    expect(within(dialog).getByText("Alt und braun.")).toBeDefined();
    expect(patches(calls)).toHaveLength(0);
    await user.click(within(dialog).getByRole("button", { name: "Ersetzen" }));
    await waitFor(() => {
      expect(changed).toHaveBeenCalled();
    });
    expect(patches(calls)[0]?.body).toEqual({
      body: "## Aussehen\n\nNeu und grau.\n\n## Wesen\nTreu.\n",
    });
    expect(screen.queryByText("Aussehen von Kael")).toBeNull();
  });

  it("adds below the old text on request", async () => {
    const { user, calls } = await takeOverLooks("## Aussehen\nAlt.\n");
    const dialog = await screen.findByRole("dialog", { name: TITLE });
    await user.click(
      within(dialog).getByRole("button", { name: "Darunter ergänzen" }),
    );
    await waitFor(() => {
      expect(patches(calls)).toHaveLength(1);
    });
    expect(patches(calls)[0]?.body).toEqual({
      body: "## Aussehen\nAlt.\n\nNeu und grau.\n",
    });
  });

  it("changes nothing on Abbrechen and keeps the description open", async () => {
    const { user, calls, changed } = await takeOverLooks(
      `## Aussehen\n\n${"Sehr lang. ".repeat(60)}`,
    );
    const dialog = await screen.findByRole("dialog", { name: TITLE });
    const shown = within(dialog).getByText(/Sehr lang\./).textContent;
    expect(shown.length).toBeLessThan(310);
    expect(shown.endsWith(" …")).toBe(true);
    await user.click(within(dialog).getByRole("button", { name: "Abbrechen" }));
    expect(screen.queryByRole("dialog", { name: TITLE })).toBeNull();
    expect(patches(calls)).toHaveLength(0);
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByText("Aussehen von Kael")).toBeDefined();
    expect(screen.getByLabelText("Beschreibung")).toHaveProperty(
      "value",
      "Neu und grau.",
    );
  });

  it("cancels on Escape without closing the image underneath", async () => {
    const { user, calls } = await takeOverLooks("## Aussehen\nAlt.\n");
    const dialog = await screen.findByRole("dialog", { name: TITLE });
    expect(document.activeElement).toBe(
      within(dialog).getByRole("button", { name: "Abbrechen" }),
    );
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: TITLE })).toBeNull();
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(patches(calls)).toHaveLength(0);
  });
});

describe("taking out the looks into a section that has text (step 8.4)", () => {
  async function extract(body: string) {
    const figure: CanonEntry = { ...ENTRY, body };
    const feed = sseFeed();
    const { calls } = fakeApi({
      "GET /api/models": ok(modelList(["x-ai/grok-4.6"])),
      [`POST ${ENTRY_URL}/appearance`]: () => ({
        status: 200,
        stream: feed.stream,
      }),
      [`GET ${ENTRY_URL}`]: ok(figure),
      [`PATCH ${ENTRY_URL}`]: ok({ ...figure, body: "gespeichert" }),
    });
    const onChanged = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <AppearanceExtract
        entry={figure}
        onChanged={onChanged}
        onClose={onClose}
      />,
    );
    await user.click(
      await screen.findByRole("button", { name: "Herauslösen" }),
    );
    finish(feed, "Groß.");
    await user.click(
      await screen.findByRole("button", { name: "Übernehmen als „Aussehen“" }),
    );
    return { user, calls, onChanged, onClose };
  }

  it("replaces the old text on request", async () => {
    const { user, calls, onClose } = await extract(
      "## Aussehen\n\nKael ist Schmied.\n",
    );
    const dialog = await screen.findByRole("dialog", { name: TITLE });
    await user.click(within(dialog).getByRole("button", { name: "Ersetzen" }));
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
    expect(patches(calls)[0]?.body).toEqual({ body: "## Aussehen\n\nGroß.\n" });
  });

  it("keeps everything on Abbrechen and allows trying again", async () => {
    const { user, calls, onChanged, onClose } = await extract(
      "## Aussehen\n\nKael ist Schmied.\n",
    );
    const dialog = await screen.findByRole("dialog", { name: TITLE });
    await user.click(within(dialog).getByRole("button", { name: "Abbrechen" }));
    expect(patches(calls)).toHaveLength(0);
    expect(onChanged).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Übernehmen als „Aussehen“" }),
    ).toHaveProperty("disabled", false);
  });
});

const SEA = `Geografie – Seekarte`;
function worldOf(description: string): World {
  return {
    ...WORLD,
    description,
    maps: [{ name: "Seekarte", file: MAP_FILE, markers: [] }],
  };
}

describe("the geography of a map in the world description (step 8.4)", () => {
  it("replaces the section of the map after the question", async () => {
    const world = worldOf(`Salz.\n\n## ${SEA}\n\nAlt.\n`);
    const feed = sseFeed();
    const { calls } = fakeApi({
      "GET /api/models": ok(
        modelList(
          ["x-ai/grok-4.6"],
          [catalogModel("x-ai/grok-4.6", { reads_images: true })],
        ),
      ),
      [`POST ${MAP_BASE}/describe`]: () => ({
        status: 200,
        stream: feed.stream,
      }),
      "GET /api/worlds": ok([world]),
      "PATCH /api/worlds/salzmark": ok(world),
    });
    const user = userEvent.setup();
    render(
      <WorldMaps world={world} onChanged={vi.fn()} onOpenEntry={vi.fn()} />,
    );
    await user.click(screen.getByRole("button", { name: "Seekarte" }));
    await user.click(
      screen.getByRole("button", { name: "✨ Von der KI beschreiben lassen" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Beschreiben lassen" }),
    );
    finish(feed, "Neu im Süden.");
    await user.click(
      await screen.findByRole("button", {
        name: "In die Weltbeschreibung übernehmen",
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: `„${SEA}“ hat schon Text`,
    });
    await user.click(within(dialog).getByRole("button", { name: "Abbrechen" }));
    expect(patches(calls)).toHaveLength(0);
    await user.click(
      screen.getByRole("button", {
        name: "In die Weltbeschreibung übernehmen",
      }),
    );
    await user.click(
      within(
        await screen.findByRole("dialog", { name: `„${SEA}“ hat schon Text` }),
      ).getByRole("button", { name: "Ersetzen" }),
    );
    await waitFor(() => {
      expect(patches(calls)).toHaveLength(1);
    });
    expect(patches(calls)[0]?.body).toEqual({
      description: `Salz.\n\n## ${SEA}\n\nNeu im Süden.\n`,
    });
  });

  async function openMap(world: World) {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    render(
      <WorldMaps world={world} onChanged={onChanged} onOpenEntry={vi.fn()} />,
    );
    await user.click(screen.getByRole("button", { name: "Seekarte" }));
    return { user, onChanged };
  }

  it("asks whether the section goes too when the map is removed", async () => {
    const world = worldOf(`Salz.\n\n## ${SEA}\n\nSüden.\n`);
    const { calls } = fakeApi({
      [`DELETE ${MAP_BASE}`]: ok({ ...world, maps: [] }),
      "PATCH /api/worlds/salzmark": ok(world),
    });
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const { user } = await openMap(world);
    await user.click(screen.getByRole("button", { name: "Entfernen" }));
    await waitFor(() => {
      expect(patches(calls)).toHaveLength(1);
    });
    expect(confirm).toHaveBeenLastCalledWith(
      `Abschnitt „${SEA}“ auch aus der Weltbeschreibung entfernen?`,
    );
    expect(patches(calls)[0]?.body).toEqual({ description: "Salz.\n" });
  });

  it("keeps the section when the author says no", async () => {
    const world = worldOf(`Salz.\n\n## ${SEA}\n\nSüden.\n`);
    const { calls } = fakeApi({
      [`DELETE ${MAP_BASE}`]: ok({ ...world, maps: [] }),
    });
    const confirm = vi
      .spyOn(window, "confirm")
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const { user } = await openMap(world);
    await user.click(screen.getByRole("button", { name: "Entfernen" }));
    await waitFor(() => {
      expect(confirm).toHaveBeenCalledTimes(2);
    });
    expect(patches(calls)).toHaveLength(0);
  });

  it("asks nothing more when the section of the map is empty", async () => {
    const world = worldOf(`Salz.\n\n## ${SEA}\n\n`);
    const { calls } = fakeApi({
      [`DELETE ${MAP_BASE}`]: ok({ ...world, maps: [] }),
    });
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const { user, onChanged } = await openMap(world);
    await user.click(screen.getByRole("button", { name: "Entfernen" }));
    await waitFor(() => {
      expect(onChanged).toHaveBeenCalled();
    });
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(patches(calls)).toHaveLength(0);
  });

  it("renames the heading of the section with the map", async () => {
    const world = worldOf(`Salz.\n\n## ${SEA}\n\nSüden.\n`);
    const { calls } = fakeApi({
      [`PATCH ${MAP_BASE}`]: ok(world),
      "PATCH /api/worlds/salzmark": ok(world),
    });
    const { user } = await openMap(world);
    await user.click(screen.getByRole("button", { name: "Umbenennen" }));
    const field = screen.getByLabelText("Name der Karte");
    await user.clear(field);
    await user.type(field, "Meerkarte");
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    await waitFor(() => {
      expect(patches(calls)).toHaveLength(2);
    });
    expect(patches(calls)[1]?.body).toEqual({
      description: "Salz.\n\n## Geografie – Meerkarte\n\nSüden.\n",
    });
    await waitFor(() => {
      expect(screen.queryByLabelText("Name der Karte")).toBeNull();
    });
  });

  it("renames without a second call when the description has no such section", async () => {
    const world = worldOf("Salz.");
    const { calls } = fakeApi({ [`PATCH ${MAP_BASE}`]: ok(world) });
    const { user } = await openMap(world);
    await user.click(screen.getByRole("button", { name: "Umbenennen" }));
    const field = screen.getByLabelText("Name der Karte");
    await user.clear(field);
    await user.type(field, "Meerkarte");
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    await waitFor(() => {
      expect(screen.queryByLabelText("Name der Karte")).toBeNull();
    });
    expect(patches(calls)).toHaveLength(1);
  });
});
