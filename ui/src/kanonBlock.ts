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
  return block === "" ? null : withImportLevels(block);
}

/** Group headings of the import format (level 1), as the world builder is told to use them. */
const GROUPS = /^## (Figuren|Orte|Gegenstände|Zeitlinie|Regeln|Kultur)\s*$/;

/**
 * The import format puts groups at `#`, entries at `##` and their sections at `###`. Models
 * sometimes start one level deeper (`## Gegenstände`, `### Name`, `#### Zweck`; seen with
 * grok-4.6 on 2026-10-11) – the import would then take each section for an entry of its own.
 * Without any `#` heading but with a group at `##`, every heading moves up one level.
 */
function withImportLevels(block: string): string {
  const lines = block.split("\n");
  if (
    lines.some((line) => /^# /.test(line)) ||
    !lines.some((line) => GROUPS.test(line))
  ) {
    return block;
  }
  return lines
    .map((line) => (/^#{2,6} /.test(line) ? line.slice(1) : line))
    .join("\n");
}
