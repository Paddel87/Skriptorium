import { useCallback, useEffect, useRef } from "react";
import type { Phase } from "./useWriteFlow";

/**
 * Scrolling of the chat layout (steps 5.11, 5.21): the area with the manuscript and the proposal
 * follows the end of the text while the author is at the end, and "/" outside a field jumps into
 * the instruction. Returns the refs for the scrolling area and the composer.
 */
export function useChatScroll(
  endSignal: number,
  phase: Phase,
  proposal: string,
) {
  const scroller = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLDivElement>(null);
  // Whether the author is at the end of the text; only then does the view follow the proposal
  // as it grows (steps 5.11, 5.21: scrolled up to read, the view stays where it is).
  const atEnd = useRef(true);

  const showEnd = useCallback(() => {
    const area = scroller.current;
    if (area === null) {
      return () => undefined;
    }
    atEnd.current = true;
    area.scrollTop = area.scrollHeight;
    // The editor measures its lines after the first paint; follow once more then, unless the
    // author has scrolled up in between.
    const frame = requestAnimationFrame(() => {
      if (atEnd.current) {
        area.scrollTop = area.scrollHeight;
      }
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const area = scroller.current;
    if (area === null) {
      return;
    }
    const remember = () => {
      atEnd.current =
        area.scrollHeight - area.scrollTop - area.clientHeight < 48;
    };
    area.addEventListener("scroll", remember);
    // When the width changes (bar on the right, turning the phone), the end stays in view if it
    // was in view before.
    const sheet = area.firstElementChild;
    const observer =
      sheet !== null && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (atEnd.current) {
              area.scrollTop = area.scrollHeight;
            }
          })
        : null;
    if (sheet !== null) {
      observer?.observe(sheet);
    }
    observer?.observe(area);
    return () => {
      area.removeEventListener("scroll", remember);
      observer?.disconnect();
    };
  }, []);

  // Chapter opened, text taken over, or a new request sent: to the end of the text.
  useEffect(() => showEnd(), [endSignal, showEnd]);
  useEffect(() => {
    if (phase === "thinking") {
      return showEnd();
    }
  }, [phase, showEnd]);

  // The proposal growing at the end: follow only while the author is at the end.
  useEffect(() => {
    if (atEnd.current && phase !== "idle") {
      return showEnd();
    }
  }, [proposal, phase, showEnd]);

  useEffect(() => {
    function jump(event: KeyboardEvent) {
      if (
        event.key !== "/" ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        writable(event.target)
      ) {
        return;
      }
      const field =
        composer.current?.querySelector<HTMLElement>(".cm-content") ?? null;
      if (field !== null) {
        event.preventDefault();
        field.focus();
      }
    }
    document.addEventListener("keydown", jump);
    return () => {
      document.removeEventListener("keydown", jump);
    };
  }, []);

  return { scroller, composer };
}

/** Whether a key press goes into a field the author is writing in. */
function writable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}
