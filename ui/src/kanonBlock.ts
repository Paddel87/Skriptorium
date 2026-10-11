/**
 * The proposal the world builder puts at the end of its answer (step 6.7, ADR-064): the last
 * fenced block that starts with ```kanon and ends with ```, as the Markdown inside. Without such a
 * closed block (or with an empty one) there is nothing to take over.
 */
export function lastKanonBlock(answer: string): string | null {
  const lines = answer.split("\n");
  const start = lines.findLastIndex((line) => line.trim() === "```kanon");
  if (start < 0) {
    return null;
  }
  const end = lines.findIndex(
    (line, at) => at > start && line.trim() === "```",
  );
  if (end < 0) {
    return null;
  }
  const block = lines
    .slice(start + 1, end)
    .join("\n")
    .trim();
  return block === "" ? null : block;
}
