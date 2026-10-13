import { afterEach, describe, expect, it, vi } from "vitest";
import { base64, scaledSize, shrinkImage } from "./files";

describe("files for upload (step 7.6)", () => {
  it("shrinks the longest side to the limit and keeps the proportions", () => {
    expect(scaledSize(4000, 3000)).toEqual({ width: 2000, height: 1500 });
    expect(scaledSize(1000, 5000)).toEqual({ width: 400, height: 2000 });
    expect(scaledSize(800, 600)).toEqual({ width: 800, height: 600 });
    expect(scaledSize(9000, 2)).toEqual({ width: 2000, height: 1 });
  });

  it("keeps large maps within what a canvas on iPhone can hold (step 7.10)", () => {
    expect(scaledSize(6000, 2000, 6000)).toEqual({ width: 6000, height: 2000 });
    const { width, height } = scaledSize(6000, 4500, 6000);
    expect(width * height).toBeLessThanOrEqual(16_000_000);
    expect(width / height).toBeCloseTo(6000 / 4500, 2);
    expect(scaledSize(12000, 9000, 6000).width).toBeLessThanOrEqual(6000);
  });

  it("encodes bytes as base64", async () => {
    expect(await base64(new Blob(["Salz"]))).toBe("U2Fseg==");
  });
});

interface Fake {
  close: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  canvas: { width: number; height: number };
}

/** Stubs bitmap decoding and the canvas; `types` lists what toBlob yields per call. */
function stubBrowser(options: {
  context?: boolean;
  blobs: (Blob | null)[];
  bitmap?: { width: number; height: number };
  decodeFails?: boolean;
}): Fake {
  const close = vi.fn();
  const drawImage = vi.fn();
  const fillRect = vi.fn();
  const sized = { width: 0, height: 0 };
  const bitmap = options.bitmap ?? { width: 4000, height: 3000 };
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn(() =>
      options.decodeFails === true
        ? Promise.reject(new Error("kaputt"))
        : Promise.resolve({ ...bitmap, close }),
    ),
  );
  const blobs = [...options.blobs];
  const surface = {
    drawImage,
    fillRect,
    globalCompositeOperation: "",
    fillStyle: "",
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    function getContext(this: HTMLCanvasElement) {
      sized.width = this.width;
      sized.height = this.height;
      return options.context === false
        ? null
        : (surface as unknown as CanvasRenderingContext2D);
    } as typeof HTMLCanvasElement.prototype.getContext,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
    (callback: BlobCallback) => {
      callback(blobs.shift() ?? null);
    },
  );
  return { close, drawImage, fillRect, canvas: sized };
}

describe("shrinking images in the browser (step 7.6)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("draws the image anew at the limit and returns WebP", async () => {
    const webp = new Blob(["w"], { type: "image/webp" });
    const fake = stubBrowser({ blobs: [webp] });
    expect(await shrinkImage(new Blob(["x"]))).toBe(webp);
    expect(fake.canvas).toEqual({ width: 2000, height: 1500 });
    expect(fake.drawImage).toHaveBeenCalledWith(
      expect.anything(),
      0,
      0,
      2000,
      1500,
    );
    expect(fake.fillRect).not.toHaveBeenCalled();
    expect(fake.close).toHaveBeenCalledOnce();
  });

  it("falls back to JPEG on white when the browser cannot write WebP", async () => {
    const jpeg = new Blob(["j"], { type: "image/jpeg" });
    // Browsers without WebP hand back PNG for the asked type.
    const fake = stubBrowser({
      blobs: [new Blob(["p"], { type: "image/png" }), jpeg],
    });
    expect(await shrinkImage(new Blob(["x"]), 1000)).toBe(jpeg);
    expect(fake.canvas).toEqual({ width: 1000, height: 750 });
    expect(fake.fillRect).toHaveBeenCalledWith(0, 0, 1000, 750);
    expect(fake.close).toHaveBeenCalledOnce();
  });

  it("goes straight to JPEG when asked, e.g. for covers", async () => {
    const jpeg = new Blob(["j"], { type: "image/jpeg" });
    const fake = stubBrowser({ blobs: [jpeg] });
    expect(await shrinkImage(new Blob(["x"]), 2000, true)).toBe(jpeg);
    expect(fake.fillRect).toHaveBeenCalledOnce();
  });

  it("says so when the browser cannot read the image", async () => {
    const fake = stubBrowser({ blobs: [], decodeFails: true });
    await expect(shrinkImage(new Blob(["x"]))).rejects.toThrow(
      "Dieses Bild kann der Browser nicht lesen.",
    );
    expect(fake.close).not.toHaveBeenCalled();
  });

  it("says so and releases the bitmap when there is no drawing surface", async () => {
    const fake = stubBrowser({ blobs: [], context: false });
    await expect(shrinkImage(new Blob(["x"]))).rejects.toThrow(
      "Bild konnte nicht verkleinert werden.",
    );
    expect(fake.close).toHaveBeenCalledOnce();
  });

  it("says so when no format can be encoded", async () => {
    const fake = stubBrowser({ blobs: [null, null] });
    await expect(shrinkImage(new Blob(["x"]))).rejects.toThrow(
      "Bild konnte nicht verkleinert werden.",
    );
    expect(fake.close).toHaveBeenCalledOnce();
  });
});
