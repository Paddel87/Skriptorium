/**
 * Web-search references in the world builder's answers (step 6.7, ADR-064). With web search the
 * model marks sources inline as Markdown links like `[[1]](https://…)`; the interface shows no
 * Markdown, so these marks would stand raw in the text. The pages themselves come separately as
 * sources and are listed below the answer.
 */
import type { Source } from "./api";

// `[[1]](https://…)` as delivered, also the single-bracket form `[1](https://…)`.
const MARK = /\[\[?(\d{1,3})\]?\]\(https?:\/\/[^\s)]+\)/g;

/** The answer for display: each mark becomes `[1]`, matching the numbered sources below. */
export function withoutLinks(answer: string): string {
  return answer.replace(MARK, "[$1]");
}

/** Text for the canon (the proposal block): marks removed, they mean nothing there. */
export function withoutMarks(text: string): string {
  return text.replace(/ ?\[\[?\d{1,3}\]?\]\(https?:\/\/[^\s)]+\)/g, "");
}

/**
 * Label of a source below the answer. Its title if it has one; if the provider names only the
 * number of the mark (as observed with grok-4.6, 2026-10-11), that number and the host of the
 * address, e.g. "[1] mittelalter-lexikon.de", so it matches `[1]` in the text.
 */
export function sourceLabel(source: Source): string {
  const title = source.title.trim();
  const number = /^\[?(\d+)\]?$/.exec(title);
  if (title !== "" && number === null) {
    return title;
  }
  let host = source.url;
  try {
    host = new URL(source.url).hostname.replace(/^www\./, "");
  } catch {
    // keep the address as it is
  }
  return number === null ? host : `[${number[1] ?? ""}] ${host}`;
}
