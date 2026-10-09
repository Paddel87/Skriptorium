import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

// jsdom does not lay out text; CodeMirror measures ranges for tooltips such as the `@` menu.
// Empty measurements are enough for tests that do not check positions.
if (!("getClientRects" in Range.prototype)) {
  Object.assign(Range.prototype, {
    getClientRects: () => document.createElement("div").getClientRects(),
    getBoundingClientRect: () => new DOMRect(),
  });
}

// jsdom has no layout and no `scrollIntoView`; a no-op lets components call it (step 5.2).
HTMLElement.prototype.scrollIntoView = function scrollIntoView() {
  // nothing to scroll without layout
};
