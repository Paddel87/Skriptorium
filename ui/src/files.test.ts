import { describe, expect, it } from "vitest";
import { base64, scaledSize } from "./files";

describe("files for upload (step 7.6)", () => {
  it("shrinks the longest side to the limit and keeps the proportions", () => {
    expect(scaledSize(4000, 3000)).toEqual({ width: 2000, height: 1500 });
    expect(scaledSize(1000, 5000)).toEqual({ width: 400, height: 2000 });
    expect(scaledSize(800, 600)).toEqual({ width: 800, height: 600 });
    expect(scaledSize(9000, 2)).toEqual({ width: 2000, height: 1 });
  });

  it("encodes bytes as base64", async () => {
    expect(await base64(new Blob(["Salz"]))).toBe("U2Fseg==");
  });
});
