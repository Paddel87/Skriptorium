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

  it("moves headings up one level when the block starts at ##", () => {
    const answer = [
      "```kanon",
      "## Gegenstände",
      "",
      "### Pfannhaus-Glocke",
      "Aliasse: Siedeglocke",
      "",
      "#### Zweck",
      "Signal.",
      "```",
    ].join("\n");
    expect(lastKanonBlock(answer)).toBe(
      "# Gegenstände\n\n## Pfannhaus-Glocke\nAliasse: Siedeglocke\n\n### Zweck\nSignal.",
    );
  });

  it("keeps the levels when a group heading is there", () => {
    const answer =
      "```kanon\n# Gegenstände\n\n## Siedepfanne\n### Zweck\nSieden.\n```";
    expect(lastKanonBlock(answer)).toBe(
      "# Gegenstände\n\n## Siedepfanne\n### Zweck\nSieden.",
    );
  });

  it("keeps the levels of entries without a group heading", () => {
    const answer = "```kanon\n## Kael\nText.\n\n### Zweck\nX.\n```";
    expect(lastKanonBlock(answer)).toBe("## Kael\nText.\n\n### Zweck\nX.");
  });
});
