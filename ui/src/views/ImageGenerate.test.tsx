import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ENTRY, fail, fakeApi, ok } from "../../fake-api";
import type { CanonEntry } from "../api";
import { EntryImages } from "./EntryImages";
import { describePrice, ImageGenerate } from "./ImageGenerate";

vi.mock("../files", () => ({
  IMAGE_SIDE: 2000,
  MAP_SIDE: 6000,
  shrinkImage: vi.fn(() => Promise.resolve(new Blob(["klein"]))),
  base64: vi.fn(() => Promise.resolve("a2xlaW4=")),
}));

const MODELS = ok({
  default: "black-forest-labs/flux.2-pro",
  models: [
    { id: "black-forest-labs/flux.2-pro", name: "FLUX.2 Pro" },
    { id: "bytedance-seed/seedream-4.5", name: "Seedream 4.5" },
  ],
  available: true,
  ready: true,
});
const PRICE = "GET /api/images/price";
const IMAGE = ok({
  content: "iVBORw0KGgo=",
  media_type: "image/png",
  cost_usd: 0.031,
  model: "black-forest-labs/flux.2-pro",
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("generating an image (step 7.12)", () => {
  it("shows the price, generates a preview and hands the image over", async () => {
    const { calls } = fakeApi({
      "GET /api/images/models": MODELS,
      [PRICE]: ok({ cost_usd: 0.03, unit: "megapixel" }),
      "POST /api/images/generate": IMAGE,
    });
    const taken = vi.fn(() => Promise.resolve());
    const closed = vi.fn();
    const user = userEvent.setup();
    render(
      <ImageGenerate
        title="Bild erzeugen – Gunda"
        initialPrompt="Gunda: kräftig"
        initialFormat="2:3"
        onTakeOver={taken}
        onClose={closed}
      />,
    );
    expect(
      await screen.findByText("ca. 0,03 $ je Bild (1 Megapixel)"),
    ).toBeDefined();
    expect(screen.getByRole("radio", { name: "Hochformat" })).toHaveProperty(
      "ariaChecked",
      "true",
    );
    await user.type(
      screen.getByLabelText("Bildbeschreibung (änderbar)"),
      ", Schürze",
    );
    await user.click(screen.getByRole("radio", { name: "Quadrat" }));
    await user.click(screen.getByRole("button", { name: "✨ Erzeugen" }));
    expect(
      await screen.findByAltText("Vorschau des erzeugten Bildes"),
    ).toBeDefined();
    expect(calls.find((c) => c.method === "POST")?.body).toEqual({
      model: "black-forest-labs/flux.2-pro",
      prompt: "Gunda: kräftig, Schürze",
      aspect_ratio: "1:1",
    });
    expect(screen.getByText("FLUX.2 Pro · Kosten 0,031 $")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Übernehmen" }));
    await waitFor(() => {
      expect(taken).toHaveBeenCalled();
    });
    const blob = (taken.mock.calls[0] as unknown as [Blob])[0];
    expect(blob.type).toBe("image/png");
    expect(closed).toHaveBeenCalled();
  });

  it("shows a refusal and lets the author try again", async () => {
    fakeApi({
      "GET /api/images/models": MODELS,
      [PRICE]: ok({ cost_usd: 0.04, unit: "image" }),
      "POST /api/images/generate": fail(
        422,
        "Das Modell hat das Bild abgelehnt.",
      ),
    });
    const user = userEvent.setup();
    render(
      <ImageGenerate
        title="Bild"
        initialPrompt="x"
        initialFormat="1:1"
        onTakeOver={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    await user.click(
      await screen.findByRole("button", { name: "✨ Erzeugen" }),
    );
    expect(
      await screen.findByText("Das Modell hat das Bild abgelehnt."),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "✨ Erzeugen" })).toHaveProperty(
      "disabled",
      false,
    );
  });

  it("names prices by their unit", () => {
    expect(describePrice(null)).toBe("Preis wird geladen …");
    expect(describePrice({ cost_usd: 0.04, unit: "image" })).toBe(
      "ca. 0,04 $ je Bild",
    );
    expect(describePrice({ cost_usd: 8e-6, unit: "token" })).toMatch(
      /nach Verbrauch/,
    );
    expect(describePrice({ cost_usd: null, unit: null })).toBe(
      "Preis unbekannt",
    );
  });

  it("is offered next to uploading in the gallery and stores the image there", async () => {
    const entry: CanonEntry = { ...ENTRY, body: "## Aussehen\n\nHager." };
    const after = { ...entry, images: ["kael-a.webp"] };
    const { calls } = fakeApi({
      "GET /api/images/models": MODELS,
      [PRICE]: ok({ cost_usd: 0.03, unit: "megapixel" }),
      "POST /api/images/generate": IMAGE,
      "POST /api/worlds/salzmark/entries/kael/images": ok(after),
    });
    const changed = vi.fn();
    const user = userEvent.setup();
    render(<EntryImages entry={entry} editable onChanged={changed} />);
    await user.click(screen.getByRole("button", { name: "Bild hinzufügen" }));
    await user.click(
      screen.getByRole("menuitem", { name: "✨ Bild erzeugen" }),
    );
    expect(screen.getByLabelText("Bildbeschreibung (änderbar)")).toHaveProperty(
      "value",
      "Kael: Hager.",
    );
    await user.click(
      await screen.findByRole("button", { name: "✨ Erzeugen" }),
    );
    await user.click(await screen.findByRole("button", { name: "Übernehmen" }));
    await waitFor(() => {
      expect(changed).toHaveBeenCalledWith(after);
    });
    expect(calls.at(-1)?.body).toEqual({ content: "a2xlaW4=" });
  });
});

function renderGenerate(
  overrides: {
    onTakeOver?: (image: Blob) => Promise<void>;
    onClose?: () => void;
    hint?: string | null;
  } = {},
) {
  return render(
    <ImageGenerate
      title="Bild"
      initialPrompt="Gunda: kräftig"
      initialFormat="2:3"
      hint={overrides.hint ?? null}
      onTakeOver={overrides.onTakeOver ?? vi.fn(() => Promise.resolve())}
      onClose={overrides.onClose ?? vi.fn()}
    />,
  );
}

describe("generating an image: edge cases (step 7.12)", () => {
  it("says so when the provider is not set up and does not allow generating", async () => {
    fakeApi({
      "GET /api/images/models": ok({
        default: "x/y",
        models: [{ id: "x/y", name: "Y" }],
        available: false,
        ready: false,
      }),
      [PRICE]: ok({ cost_usd: 0.04, unit: "image" }),
    });
    renderGenerate();
    expect(await screen.findByText(/nicht eingerichtet/)).toBeDefined();
    await screen.findByText("ca. 0,04 $ je Bild");
    expect(screen.getByRole("button", { name: "✨ Erzeugen" })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("shows a hint above the description", async () => {
    fakeApi({ "GET /api/images/models": MODELS, [PRICE]: ok({}) });
    renderGenerate({ hint: "Diese Figur hat noch kein Aussehen." });
    expect(
      await screen.findByText("Diese Figur hat noch kein Aussehen."),
    ).toBeDefined();
  });

  it("shows why the models could not be loaded instead of the empty note", async () => {
    fakeApi({ "GET /api/images/models": fail(500, "Bildmodelle nicht da") });
    renderGenerate();
    expect(await screen.findByText("Bildmodelle nicht da")).toBeDefined();
    expect(screen.queryByText(/keine Bildmodelle/)).toBeNull();
    expect(screen.getByRole("button", { name: "✨ Erzeugen" })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("says so when there are no image models", async () => {
    fakeApi({
      "GET /api/images/models": ok({
        default: "",
        models: [],
        available: true,
        ready: true,
      }),
    });
    renderGenerate();
    expect(
      await screen.findByText("Gerade sind keine Bildmodelle verfügbar."),
    ).toBeDefined();
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("takes the first model when the default is not offered", async () => {
    fakeApi({
      "GET /api/images/models": ok({
        default: "gibt/es-nicht",
        models: [{ id: "a/eins", name: "Eins" }],
        available: true,
        ready: true,
      }),
      [PRICE]: ok({ cost_usd: 0.04, unit: "image" }),
    });
    renderGenerate();
    expect(await screen.findByLabelText("Modell")).toHaveProperty(
      "value",
      "a/eins",
    );
  });

  it("shows an unknown price when the price cannot be asked, and a new price per model", async () => {
    const asked: string[] = [];
    fakeApi({
      "GET /api/images/models": MODELS,
      [PRICE]: (_body, path) => {
        asked.push(path);
        return path.includes("seedream")
          ? { status: 200, body: { cost_usd: 0.05, unit: "image" } }
          : { status: 500, body: { detail: "kaputt" } };
      },
    });
    const user = userEvent.setup();
    renderGenerate();
    expect(await screen.findByText("Preis unbekannt")).toBeDefined();
    await user.selectOptions(
      screen.getByLabelText("Modell"),
      "bytedance-seed/seedream-4.5",
    );
    expect(await screen.findByText("ca. 0,05 $ je Bild")).toBeDefined();
    expect(asked).toHaveLength(2);
  });

  it("counts the seconds while generating", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    try {
      const { fetchMock } = fakeApi({
        "GET /api/images/models": MODELS,
        [PRICE]: ok({ cost_usd: 0.03, unit: "image" }),
        "POST /api/images/generate": IMAGE,
      });
      const original = fetchMock.getMockImplementation();
      let release: () => void = () => undefined;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      fetchMock.mockImplementation((input, init) =>
        init?.method === "POST"
          ? gate.then(() => original?.(input, init) as Promise<Response>)
          : (original?.(input, init) as Promise<Response>),
      );
      renderGenerate();
      const button = await screen.findByRole("button", { name: "✨ Erzeugen" });
      await waitFor(() => {
        expect(button).toHaveProperty("disabled", false);
      });
      fireEvent.click(button);
      expect(await screen.findByText("Bild wird erzeugt … 0 s")).toBeDefined();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3000);
      });
      expect(screen.getByText("Bild wird erzeugt … 3 s")).toBeDefined();
      expect(screen.getByRole("button", { name: "Abbrechen" })).toHaveProperty(
        "disabled",
        false,
      );
      release();
      expect(
        await screen.findByAltText("Vorschau des erzeugten Bildes"),
      ).toBeDefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it("generates anew, goes back to the description and reports unknown cost", async () => {
    const { calls } = fakeApi({
      "GET /api/images/models": MODELS,
      [PRICE]: ok({ cost_usd: 0.03, unit: "image" }),
      "POST /api/images/generate": ok({
        content: "iVBORw0KGgo=",
        media_type: "image/png",
        cost_usd: null,
        model: "black-forest-labs/flux.2-pro",
      }),
    });
    const user = userEvent.setup();
    renderGenerate();
    await user.click(
      await screen.findByRole("button", { name: "✨ Erzeugen" }),
    );
    expect(
      await screen.findByText("FLUX.2 Pro · Kosten nicht gemeldet"),
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Neu erzeugen" }));
    await screen.findByAltText("Vorschau des erzeugten Bildes");
    expect(calls.filter((c) => c.method === "POST")).toHaveLength(2);
    await user.click(
      screen.getByRole("button", { name: "Beschreibung ändern" }),
    );
    expect(screen.getByLabelText("Bildbeschreibung (änderbar)")).toHaveProperty(
      "value",
      "Gunda: kräftig",
    );
    expect(screen.queryByAltText("Vorschau des erzeugten Bildes")).toBeNull();
  });

  it("keeps the preview and shows the error when taking over fails", async () => {
    fakeApi({
      "GET /api/images/models": MODELS,
      [PRICE]: ok({ cost_usd: 0.03, unit: "image" }),
      "POST /api/images/generate": IMAGE,
    });
    const closed = vi.fn();
    const taken = vi.fn(() =>
      Promise.reject(new Error("Speichern gescheitert")),
    );
    const user = userEvent.setup();
    renderGenerate({ onTakeOver: taken, onClose: closed });
    await user.click(
      await screen.findByRole("button", { name: "✨ Erzeugen" }),
    );
    await user.click(await screen.findByRole("button", { name: "Übernehmen" }));
    expect(
      await screen.findByText("Keine Verbindung zum Server."),
    ).toBeDefined();
    expect(closed).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Übernehmen" })).toHaveProperty(
      "disabled",
      false,
    );
    await user.click(screen.getByRole("button", { name: "Verwerfen" }));
    expect(closed).toHaveBeenCalledOnce();
  });

  it("does not generate from an empty description and closes on cancel", async () => {
    fakeApi({ "GET /api/images/models": MODELS, [PRICE]: ok({}) });
    const closed = vi.fn();
    const user = userEvent.setup();
    renderGenerate({ onClose: closed });
    const field = await screen.findByLabelText("Bildbeschreibung (änderbar)");
    await user.clear(field);
    await user.type(field, "   ");
    expect(screen.getByRole("button", { name: "✨ Erzeugen" })).toHaveProperty(
      "disabled",
      true,
    );
    await user.click(screen.getByRole("button", { name: "Abbrechen" }));
    expect(closed).toHaveBeenCalledOnce();
  });

  it("ignores the answers when closed before they arrive", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {
      // nothing to print
    });
    fakeApi({ "GET /api/images/models": MODELS, [PRICE]: ok({}) });
    renderGenerate().unmount();
    expect(errors).not.toHaveBeenCalled();
  });
});
