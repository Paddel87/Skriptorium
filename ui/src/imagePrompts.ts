/**
 * Starting texts for "Bild erzeugen" from the canon (step 7.12, ADR-077): the author changes
 * them before generating. Markdown marks are left out; long texts are cut at a sentence.
 */
import type { CanonEntry, Story, World } from "./api";

const LIMIT = 700;

/**
 * A figure by its section "## Aussehen" or its line "**Aussehen:** …", any other entry by the
 * start of its text.
 */
export function entryPrompt(entry: CanonEntry): string {
  const looks =
    section(entry.body, "Aussehen") ?? labelled(entry.body, "Aussehen");
  const text = looks ?? entry.body;
  return joined(entry.name, text);
}

/** A map of the world, drawn from the world's description. */
export function mapPrompt(world: World, name: string): string {
  const title =
    name.trim() === "" ? world.name : `${name.trim()} (${world.name})`;
  return joined(
    `Landkarte von ${title}, gezeichnet im Stil einer Fantasy-Karte`,
    world.description,
  );
}

/** A cover from the title and the overall summary. */
export function coverPrompt(story: Story): string {
  return joined(
    `Buchumschlag zu „${story.title}“, ohne Schrift`,
    story.summary,
  );
}

function joined(head: string, text: string): string {
  const plain = plainText(text);
  return plain === "" ? head : `${head}: ${cut(plain)}`;
}

/** The text of a `## heading` section, or `null` without one. */
function section(markdown: string, heading: string): string | null {
  const lines = markdown.split("\n");
  const start = lines.findIndex(
    (line) =>
      line
        .replace(/^#+\s*/, "")
        .trim()
        .toLowerCase() === heading.toLowerCase() && line.startsWith("#"),
  );
  if (start < 0) {
    return null;
  }
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => /^#{1,6}\s/.test(line));
  const text = (end < 0 ? rest : rest.slice(0, end)).join("\n").trim();
  return text === "" ? null : text;
}

/** The text after a list label such as `- **Aussehen:** …`, or `null` without one. */
function labelled(markdown: string, label: string): string | null {
  for (const line of markdown.split("\n")) {
    const plain = line
      .replace(/^\s*[-*]\s+/, "")
      .replace(/\*\*/g, "")
      .trim();
    if (plain.toLowerCase().startsWith(`${label.toLowerCase()}:`)) {
      const text = plain.slice(label.length + 1).trim();
      return text === "" ? null : text;
    }
  }
  return null;
}

function plainText(markdown: string): string {
  return markdown
    .split("\n")
    .filter((line) => !/^#{1,6}\s/.test(line))
    .map((line) =>
      line
        .replace(/^\s*[-*]\s+/, "")
        .replace(/[*_`>]/g, "")
        .trim(),
    )
    .filter((line) => line !== "")
    .join(" ");
}

function cut(text: string): string {
  if (text.length <= LIMIT) {
    return text;
  }
  const piece = text.slice(0, LIMIT);
  const end = piece.lastIndexOf(". ");
  return end > LIMIT / 2 ? piece.slice(0, end + 1) : `${piece.trimEnd()} …`;
}
