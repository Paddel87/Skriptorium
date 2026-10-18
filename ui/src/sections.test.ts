import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  APPEARANCE,
  appendSection,
  putSection,
  readLabelled,
  readPart,
  readSection,
  removeSection,
  renameSection,
  type SectionMode,
} from "./sections";

interface Case {
  about?: string;
  text: string;
  expected: string | null;
}

/** The cases the interface shares with the server (step 9.1, ADR-091, rule 003). */
const shared = JSON.parse(
  readFileSync("tests/shared/sections.json", "utf8"),
) as {
  categories: Record<string, string[]>;
  read: (Case & { heading: string })[];
  labelled: (Case & { label: string })[];
  part: (Case & { name: string })[];
  append: (Case & { heading: string; section: string; expected: string })[];
  put: (Case & {
    heading: string;
    section: string;
    mode: SectionMode;
    expected: string;
  })[];
};

describe("the rule shared with the server (step 9.1)", () => {
  it.each(shared.read)("reads: $about", ({ text, heading, expected }) => {
    expect(readSection(text, heading)).toBe(expected);
  });

  it.each(shared.labelled)(
    "reads a labelled line: $about",
    ({ text, label, expected }) => {
      expect(readLabelled(text, label)).toBe(expected);
    },
  );

  it.each(shared.part)("reads a part: $about", ({ text, name, expected }) => {
    expect(readPart(text, name)).toBe(expected);
  });

  it.each(shared.append)(
    "appends to $text",
    ({ text, heading, section, expected }) => {
      expect(appendSection(text, heading, section)).toBe(expected);
    },
  );

  it.each(shared.put)(
    "puts ($mode): $about",
    ({ text, heading, section, mode, expected }) => {
      expect(putSection(text, heading, section, mode)).toBe(expected);
    },
  );

  it("names the looks as the server does", () => {
    expect(shared.categories.figur).toContain(APPEARANCE);
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

  it("leaves headings in fenced code and closing hashes alone (step 9.1)", () => {
    expect(
      removeSection("## Geo ##\nx\n```\n## Geo\n```\n## Rest\n", "Geo"),
    ).toBe("## Rest\n");
    expect(renameSection("```\n## Alt\n```\n## Alt\n", "Alt", "Neu")).toBe(
      "```\n## Alt\n```\n## Neu\n",
    );
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
