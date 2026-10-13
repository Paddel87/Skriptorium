import { describe, expect, it } from "vitest";
import {
  appendSection,
  putSection,
  readSection,
  removeSection,
  renameSection,
} from "./sections";

const TEMPLATE = "## Aussehen\n\n## Wesen und Geschichte\n";

describe("reading a section (step 8.4)", () => {
  it("finds a heading of any level, in any case", () => {
    expect(readSection("# aussehen\nGroß.", "Aussehen")).toBe("Groß.");
    expect(readSection("###### AUSSEHEN\nKlein.", "aussehen")).toBe("Klein.");
    expect(readSection("##   Aussehen   \nText", "Aussehen")).toBe("Text");
  });

  it("ends at a heading of the same or a higher level only", () => {
    const body =
      "## Aussehen\nGroß.\n### Kleidung\nMantel.\n## Wesen\nSchweigsam.";
    expect(readSection(body, "Aussehen")).toBe("Groß.\n### Kleidung\nMantel.");
    expect(readSection(body, "Kleidung")).toBe("Mantel.");
    expect(readSection("### Kleidung\nMantel.\n# Oben\nx", "Kleidung")).toBe(
      "Mantel.",
    );
  });

  it("takes the first section with text and skips empty ones", () => {
    const body = "## Aussehen\n\n## Wesen\nx\n## Aussehen\nGroß.\n";
    expect(readSection(body, "Aussehen")).toBe("Groß.");
  });

  it("returns null without a section or without text", () => {
    expect(readSection("", "Aussehen")).toBeNull();
    expect(readSection("Aussehen\nGroß.", "Aussehen")).toBeNull();
    expect(readSection(TEMPLATE, "Aussehen")).toBeNull();
    expect(readSection("##Aussehen\nx", "Aussehen")).toBeNull();
    expect(readSection("####### Aussehen\nx", "Aussehen")).toBeNull();
  });

  it("works with Windows line endings", () => {
    expect(
      readSection("## Aussehen\r\nGroß.\r\n## Wesen\r\n", "Aussehen"),
    ).toBe("Groß.");
  });
});

describe("appending a section (step 8.4)", () => {
  it("starts a text or follows after a blank line", () => {
    expect(appendSection("", "Aussehen", " Groß. ")).toBe(
      "## Aussehen\n\nGroß.\n",
    );
    expect(appendSection("Wirtin.\n\n", "Aussehen", "Groß.")).toBe(
      "Wirtin.\n\n## Aussehen\n\nGroß.\n",
    );
    expect(appendSection("A\r\n", "B", "c")).toBe("A\r\n\r\n## B\r\n\r\nc\r\n");
  });
});

describe("putting text into a section (step 8.4)", () => {
  it("appends the section when it is missing", () => {
    expect(putSection("Kael.\n", "Aussehen", "Groß.", "replace")).toBe(
      "Kael.\n\n## Aussehen\n\nGroß.\n",
    );
    expect(putSection("Kael.\n", "Aussehen", "Groß.", "append")).toBe(
      "Kael.\n\n## Aussehen\n\nGroß.\n",
    );
  });

  it("fills an empty section of the template and keeps the rest", () => {
    expect(putSection(TEMPLATE, "Aussehen", "Groß.", "replace")).toBe(
      "## Aussehen\n\nGroß.\n\n## Wesen und Geschichte\n",
    );
    expect(putSection(TEMPLATE, "Aussehen", "Groß.", "append")).toBe(
      "## Aussehen\n\nGroß.\n\n## Wesen und Geschichte\n",
    );
  });

  it("replaces the text including subsections and keeps what follows", () => {
    const body =
      "Vorn.\n\n## Aussehen\n\nAlt.\n### Kleidung\nMantel.\n\n## Wesen\nTreu.\n";
    expect(putSection(body, "aussehen", "Neu.", "replace")).toBe(
      "Vorn.\n\n## Aussehen\n\nNeu.\n\n## Wesen\nTreu.\n",
    );
  });

  it("adds below the old text, in the same section", () => {
    const body = "## Aussehen\nAlt.\n\n\n## Wesen\nTreu.\n";
    expect(putSection(body, "Aussehen", "Neu.", "append")).toBe(
      "## Aussehen\nAlt.\n\nNeu.\n\n\n## Wesen\nTreu.\n",
    );
  });

  it("works at the end of a text without a final line break", () => {
    expect(putSection("## Aussehen\nAlt.", "Aussehen", "Neu.", "append")).toBe(
      "## Aussehen\nAlt.\n\nNeu.\n",
    );
    expect(putSection("## Aussehen\nAlt.", "Aussehen", "Neu.", "replace")).toBe(
      "## Aussehen\n\nNeu.\n",
    );
    expect(putSection("## Aussehen", "Aussehen", "Neu.", "replace")).toBe(
      "## Aussehen\n\nNeu.\n",
    );
  });

  it("keeps the line endings of the text", () => {
    expect(
      putSection(
        "## Aussehen\r\n\r\n## Wesen\r\n",
        "Aussehen",
        "Groß.",
        "replace",
      ),
    ).toBe("## Aussehen\r\n\r\nGroß.\r\n\r\n## Wesen\r\n");
  });

  it("takes the first section with text and removes empty duplicates", () => {
    const body = "## Aussehen\n\n## Wesen\nx\n## Aussehen\nAlt.\n## Aussehen\n";
    expect(putSection(body, "Aussehen", "Neu.", "replace")).toBe(
      "## Wesen\nx\n## Aussehen\n\nNeu.\n",
    );
  });

  it("fills the first of several empty duplicates", () => {
    const body = "## Aussehen\n## Wesen\n## Aussehen\n";
    expect(putSection(body, "Aussehen", "Neu.", "replace")).toBe(
      "## Aussehen\n\nNeu.\n\n## Wesen\n",
    );
  });

  it("leaves a nested duplicate inside the replaced section alone", () => {
    const body = "## Aussehen\nAlt.\n### Aussehen\n";
    expect(putSection(body, "Aussehen", "Neu.", "replace")).toBe(
      "## Aussehen\n\nNeu.\n",
    );
  });
});

describe("removing and renaming a section (step 8.4)", () => {
  it("removes a section with its subsections", () => {
    const body = "A.\n\n## Geo\nx\n### Sub\ny\n\n## Rest\nz\n";
    expect(removeSection(body, "geo")).toBe("A.\n\n## Rest\nz\n");
  });

  it("removes a section at the end and the blank lines before it", () => {
    expect(removeSection("A.\n\n## Geo\nx\n", "Geo")).toBe("A.\n");
    expect(removeSection("A.\r\n\r\n## Geo\r\nx", "Geo")).toBe("A.\r\n");
    expect(removeSection("## Geo\nx\n", "Geo")).toBe("");
  });

  it("removes every section of that name, nested ones once", () => {
    expect(removeSection("## G\n### G\nx\n## H\n", "G")).toBe("## H\n");
  });

  it("returns the text unchanged without such a section", () => {
    expect(removeSection("A.\n", "Geo")).toBe("A.\n");
    expect(renameSection("A.\n", "Geo", "Neu")).toBe("A.\n");
  });

  it("renames the heading and keeps its level and line ending", () => {
    expect(
      renameSection(
        "## Geografie – Alt\r\nx\r\n### Geografie – alt\ny",
        "Geografie – Alt",
        "Geografie – Neu",
      ),
    ).toBe("## Geografie – Neu\r\nx\r\n### Geografie – Neu\ny");
    expect(renameSection("# Alt", "Alt", "Neu")).toBe("# Neu");
  });
});
