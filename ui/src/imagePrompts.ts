/**
 * Starting texts for "Bild erzeugen" from the canon (step 7.12, ADR-077): the author changes
 * them before generating. Markdown marks are left out; long texts are cut at a sentence.
 */
import type { CanonEntry, Story, World } from "./api";
import {
  APPEARANCE,
  LOCATION,
  PURPOSE,
  readPart,
  readSection,
} from "./sections";

const LIMIT = 700;
/** A map names many places; it gets more room than a single entry (step 9.5, ADR-094). */
const MAP_LIMIT = 1500;
/** How much of one place's "Lage" goes into a map. */
const PLACE_LIMIT = 200;

/**
 * What an image needs, by kind (step 9.5, ADR-094): a figure only its looks (section "Aussehen"
 * – the first one with text, up to the next heading of the same or a higher level – or line
 * "**Aussehen:** …", step 7.16), without them just the name; a place its looks with its "Lage";
 * an item without looks only the first sentence of "Zweck" (else of its text); any other entry
 * its looks, else the start of its text (step 8.5, ADR-084).
 */
export function entryPrompt(entry: CanonEntry): string {
  const looks = appearanceOf(entry.body);
  if (entry.category === "figur") {
    return joined(entry.name, looks ?? "");
  }
  if (looks === null && entry.category === "gegenstand") {
    return joined(
      entry.name,
      firstSentence(plainText(readSection(entry.body, PURPOSE) ?? entry.body)),
    );
  }
  if (looks !== null && entry.category === "ort") {
    const location = readSection(entry.body, LOCATION);
    return joined(
      entry.name,
      location === null ? looks : `${looks}\n\nLage: ${location}`,
    );
  }
  return joined(entry.name, looks ?? entry.body);
}

/**
 * Whether an image of `entry` lacks the looks it needs – a figure, a place or an item without
 * "Aussehen" (step 9.5, ADR-094); the window then says so.
 */
export function lacksAppearance(entry: CanonEntry): boolean {
  return (
    (entry.category === "figur" ||
      entry.category === "ort" ||
      entry.category === "gegenstand") &&
    appearanceOf(entry.body) === null
  );
}

/** The looks written in an entry (section or labelled line), or `null` (step 7.16). */
export function appearanceOf(body: string): string | null {
  return readPart(body, APPEARANCE);
}

/**
 * A map of the world, drawn from the section "Geografie – <name>" of the world's description
 * (step 8.5, ADR-084) – never the rest of the description, which may hold the geography of
 * another map – and from the chosen `places`, each with its "Lage", else its first sentence
 * (step 9.5, ADR-094). Without either just the title.
 */
export function mapPrompt(
  world: World,
  name: string,
  places: readonly CanonEntry[] = [],
): string {
  const title =
    name.trim() === "" ? world.name : `${name.trim()} (${world.name})`;
  const geography =
    name.trim() === ""
      ? null
      : readSection(world.description, `Geografie – ${name.trim()}`);
  const named = places.map((place) => {
    const location = readSection(place.body, LOCATION);
    const text =
      location === null
        ? firstSentence(plainText(place.body))
        : cut(plainText(location), PLACE_LIMIT);
    return text === "" ? place.name : `${place.name}: ${text}`;
  });
  const parts = [
    plainText(geography ?? ""),
    named.length === 0 ? "" : `Orte – ${named.join(" ")}`,
  ].filter((part) => part !== "");
  return joined(
    `Landkarte von ${title}, gezeichnet im Stil einer Fantasy-Karte`,
    parts.join(" "),
    MAP_LIMIT,
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

function joined(head: string, text: string, limit = LIMIT): string {
  const plain = plainText(text);
  return plain === "" ? head : `${head}: ${cut(plain, limit)}`;
}

/** The first sentence of a plain text, or all of it without a sentence end. */
function firstSentence(text: string): string {
  const end = /[.!?…](\s|$)/.exec(text);
  return end === null ? text : text.slice(0, end.index + 1);
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

function cut(text: string, limit = LIMIT): string {
  if (text.length <= limit) {
    return text;
  }
  const piece = text.slice(0, limit);
  const end = piece.lastIndexOf(". ");
  return end > limit / 2 ? piece.slice(0, end + 1) : `${piece.trimEnd()} …`;
}
