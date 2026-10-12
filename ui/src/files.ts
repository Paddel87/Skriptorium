/**
 * Files chosen by the author, prepared for the JSON body: base64 (step 6.8) and images shrunk
 * in the browser before upload (step 7.6, ADR-072).
 */

/** Longest side of an uploaded image in pixels; the server accepts up to 4096. */
export const IMAGE_SIDE = 2000;

/** Longest side of an uploaded map in pixels (step 7.10, ADR-073); the server's limit. */
export const MAP_SIDE = 6000;

/**
 * Most pixels a canvas may hold: Safari on iPhone and iPad draws nothing on larger ones
 * (4096 × 4096). Large maps are shrunk a little further to stay below.
 */
const CANVAS_PIXELS = 16_000_000;

/** The bytes of a file as base64, for the JSON body. */
export async function base64(file: Blob): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let at = 0; at < bytes.length; at += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(at, at + 0x8000));
  }
  return btoa(binary);
}

/**
 * Size of an image whose longest side is at most `limit` and whose area fits a canvas,
 * keeping the proportions.
 */
export function scaledSize(
  width: number,
  height: number,
  limit: number = IMAGE_SIDE,
): { width: number; height: number } {
  const factor = Math.min(
    1,
    limit / Math.max(width, height),
    Math.sqrt(CANVAS_PIXELS / (width * height)),
  );
  return {
    // Rounded down (a hair of tolerance against binary fractions) so neither the longest side
    // nor the area ends above its limit.
    width: Math.max(1, Math.floor(width * factor + 1e-6)),
    height: Math.max(1, Math.floor(height * factor + 1e-6)),
  };
}

/**
 * The image drawn anew at most `limit` pixels wide or high, as WebP (JPEG where the
 * browser cannot write WebP, or always with `asJpeg`, e.g. for covers every e-book reader shows). Drawing anew drops everything but the pixels: location, camera
 * and other metadata of photos never leave the device.
 */
export async function shrinkImage(
  file: Blob,
  limit: number = IMAGE_SIDE,
  asJpeg = false,
): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Dieses Bild kann der Browser nicht lesen.");
  }
  try {
    const size = scaledSize(bitmap.width, bitmap.height, limit);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    if (context === null) {
      throw new Error("Bild konnte nicht verkleinert werden.");
    }
    context.drawImage(bitmap, 0, 0, size.width, size.height);
    const webp = asJpeg ? null : await encoded(canvas, "image/webp", 0.85);
    if (webp?.type === "image/webp") {
      return webp;
    }
    // JPEG has no transparency: transparent parts become white instead of black.
    context.globalCompositeOperation = "destination-over";
    context.fillStyle = "#fff";
    context.fillRect(0, 0, size.width, size.height);
    const jpeg = await encoded(canvas, "image/jpeg", 0.88);
    if (jpeg === null) {
      throw new Error("Bild konnte nicht verkleinert werden.");
    }
    return jpeg;
  } finally {
    bitmap.close();
  }
}

function encoded(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}
