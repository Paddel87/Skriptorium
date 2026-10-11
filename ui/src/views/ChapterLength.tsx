import { useCallback } from "react";
import { api } from "../api";
import { useLoad } from "../useLoad";

/** From this share of the room on, the line advises to complete the chapter soon. */
const WARN_SHARE = 0.85;

/** A number that changes with `text`, to load the limit again after the summary changed. */
function fingerprint(text: string): number {
  let hash = text.length;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) | 0;
  }
  return hash;
}

/** Words of `text`, separated by whitespace. */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word !== "").length;
}

/** "12.000": the word limit, rounded to 500, from the room in characters (step 6.1). */
export function wordLimit(text: string, maxChars: number): string {
  const words = countWords(text);
  const perWord = text.trim().length / words;
  return (Math.round(maxChars / perWord / 500) * 500).toLocaleString("de-DE");
}

/**
 * Size of the chapter below the manuscript (step 6.1, FR-033): the word count while typing and,
 * near the limit of the short summary, a hint to complete the chapter. The limit comes from the
 * server, since it depends on the overall summary of the story so far.
 */
export function ChapterLength({
  world,
  story,
  chapter,
  text,
  summary,
}: {
  world: string;
  story: string;
  chapter: number;
  text: string;
  /** The overall summary of the story; the limit loads again when it changes. */
  summary: string;
}) {
  const load = useCallback(
    () => api.summaryRoom(world, story, chapter),
    [world, story, chapter],
  );
  const room = useLoad(load, fingerprint(summary));
  const words = countWords(text);
  const count = `${words.toLocaleString("de-DE")} ${words === 1 ? "Wort" : "Wörter"}`;
  const maxChars = room.data?.max_chars;
  const length = text.trim().length;
  let level: "normal" | "warn" | "over" = "normal";
  if (maxChars !== undefined && words > 0) {
    if (length > maxChars) {
      level = "over";
    } else if (length >= maxChars * WARN_SHARE) {
      level = "warn";
    }
  }
  return (
    <p className={`chapter-length ${level}`} aria-live="polite">
      <span>
        {count}
        {level === "warn" &&
          maxChars !== undefined &&
          ` · Kurzfassung passt bis ca. ${wordLimit(text, maxChars)} – bald abschließen`}
        {level === "over" &&
          " · zu lang für die Kurzfassung – Kapitel abschließen oder teilen"}
      </span>
    </p>
  );
}
