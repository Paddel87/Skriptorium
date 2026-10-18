/**
 * Starting texts for "Bild erzeugen" from the canon (step 7.12, ADR-077): the author changes
 * them before generating. Markdown marks are left out; long texts are cut at a sentence.
 */
import type { CanonEntry, Story, World } from "./api";
import { APPEARANCE, readPart, readSection } from "./sections";

const LIMIT = 700;

/**
 * A figure only by its looks (section "Aussehen" – the first one with text, up to the next
 * heading of the same or a higher level – or line "**Aussehen:** …", step 7.16) – without them
 * just the name; any other entry by its looks too, else by the start of its text (step 8.5,
 * ADR-084).
 */
export function entryPrompt(entry: CanonEntry): string {
  const looks = appearanceOf(entry.body);
  if (entry.category === "figur") {
    return joined(entry.name, looks ?? "");
  }
  return joined(entry.name, looks ?? entry.body);
}

/** The looks written in an entry (section or labelled line), or `null` (step 7.16). */
export function appearanceOf(body: string): string | null {
  return readPart(body, APPEARANCE);
}

/**
 * A map of the world, drawn from the section "Geografie – <name>" of the world's description;
 * without it just the title (step 8.5, ADR-084) – never the rest of the description, which may
 * hold the geography of another map.
 */
export function mapPrompt(world: World, name: string): string {
  const title =
    name.trim() === "" ? world.name : `${name.trim()} (${world.name})`;
  const geography =
    name.trim() === ""
      ? null
      : readSection(world.description, `Geografie – ${name.trim()}`);
  return joined(
    `Landkarte von ${title}, gezeichnet im Stil einer Fantasy-Karte`,
    geography ?? "",
  );
}

/**
 * A cover from the title, the genres and the atmosphere of the story's writing style – without
 * the plot (step 8.5, ADR-084).
 */
export function coverPrompt(story: Story): string {
  const parts = [
    story.genres.length > 0 ? `Genre: ${story.genres.join(", ")}.` : "",
    story.writing_style.atmosphere.length > 0
      ? `Atmosphäre: ${story.writing_style.atmosphere.join(", ")}.`
      : "",
  ].filter((part) => part !== "");
  return joined(
    `Buchumschlag zu „${story.title}“, ohne Schrift`,
    parts.join(" "),
  );
}

function joined(head: string, text: string): string {
  const plain = plainText(text);
  return plain === "" ? head : `${head}: ${cut(plain)}`;
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
