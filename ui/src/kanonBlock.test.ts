import { describe, expect, it } from "vitest";
import { lastKanonBlock } from "./kanonBlock";

describe("lastKanonBlock", () => {
  it("returns the Markdown of the last closed kanon block", () => {
    const answer = [
      "Zwei Vorschläge:",
      "```kanon",
      "# Figuren",
      "## Alt",
      "```",
      "Lieber so:",
      "```kanon",
      "# Figuren",
      "",
      "## Kael Brann",
      "Aliasse: Brann",
      "```",
      "Viel Erfolg!",
    ].join("\n");
    expect(lastKanonBlock(answer)).toBe(
      "# Figuren\n\n## Kael Brann\nAliasse: Brann",
    );
  });

  it("finds nothing without a closed, non-empty kanon block", () => {
    expect(lastKanonBlock("Nur Text.")).toBeNull();
    expect(lastKanonBlock("```markdown\n# Figuren\n```")).toBeNull();
    expect(lastKanonBlock("```kanon\n# Figuren\n## Kael")).toBeNull();
    expect(lastKanonBlock("```kanon\n\n```")).toBeNull();
  });
});
