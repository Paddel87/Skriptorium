import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const worker = readFileSync("ui/public/sw.js", "utf8");
const notice = readFileSync("ui/public/offline.html", "utf8");

describe("service worker (step 5.21, ADR-048)", () => {
  it("names the version of the notice page it keeps", () => {
    // A changed offline.html needs a new store name, or devices keep the old page.
    const fingerprint = createHash("sha256")
      .update(notice)
      .digest("hex")
      .slice(0, 12);
    expect(worker).toContain(`offline.html: sha256 ${fingerprint}`);
  });

  it("keeps one static page and answers page loads only", () => {
    expect(worker.match(/cache\.(add|put|addAll)\(/g)).toEqual(["cache.add("]);
    expect(worker).toContain('const OFFLINE = "/offline.html";');
    expect(worker).toContain('if (event.request.mode !== "navigate")');
    expect(notice).not.toMatch(/<script|<form|<img/);
  });
});
