import { CompletionContext } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ENTRY } from "../../fake-api";
import { InstructionEditor, mentions } from "./InstructionEditor";

function menu(doc: string, entries = [ENTRY]) {
  const state = EditorState.create({ doc });
  return mentions(new CompletionContext(state, doc.length, false), entries);
}

describe("mentions", () => {
  it("offers names with their category and aliases with their entry", () => {
    expect(menu("Dann @")).toMatchObject({
      from: 6,
      options: [{ label: "Kael", detail: "Figur" }],
    });
    expect(menu("@der F")?.options).toEqual([
      { label: "der Fährmann", detail: "→ Kael" },
    ]);
  });

  it("stays closed without @, inside a word and when writing on after a space", () => {
    expect(menu("Kael")).toBeNull();
    expect(menu("mail@K")).toBeNull();
    expect(menu("@Kael ging zum Hafen")).toBeNull();
    expect(menu("@Mira kam", [])).toBeNull();
  });

  it("says why nothing is offered: no match or no canon at all", () => {
    expect(menu("@Mira")).toMatchObject({
      from: 1,
      options: [{ label: "Kein Eintrag beginnt mit „Mira“.", type: "text" }],
    });
    expect(menu("Dann @", [])?.options[0]?.label).toBe(
      "Diese Welt hat noch keine Kanon-Einträge – lege sie in der Welt an oder importiere sie.",
    );
    const hint = menu("@Mira")?.options[0];
    expect(typeof hint?.apply).toBe("function");
    const dispatch = vi.fn();
    if (typeof hint?.apply === "function") {
      hint.apply({ dispatch } as never, hint, 0, 0);
    }
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe("InstructionEditor", () => {
  it("follows new values and locks input while disabled", () => {
    const props = {
      onChange: vi.fn(),
      entries: [ENTRY],
      labelledBy: "anweisung",
    };
    const { container, rerender } = render(
      <InstructionEditor {...props} value="@Kael" disabled={false} />,
    );
    const content = container.querySelector(".cm-content");
    expect(content?.getAttribute("contenteditable")).toBe("true");
    expect(content?.getAttribute("aria-labelledby")).toBe("anweisung");
    rerender(<InstructionEditor {...props} value="" disabled />);
    expect(content?.textContent).toBe("");
    expect(content?.getAttribute("contenteditable")).toBe("false");
    const view = EditorView.findFromDOM(content as HTMLElement);
    view?.dispatch({ changes: { from: 0, insert: "@" } });
    expect(props.onChange).toHaveBeenCalledWith("@");
  });

  it("shows a grey example while the field is empty", () => {
    const { container } = render(
      <InstructionEditor
        value=""
        onChange={vi.fn()}
        entries={[]}
        labelledBy="anweisung"
        disabled={false}
        example="z. B. Eine Fremde kommt."
      />,
    );
    expect(container.querySelector(".cm-placeholder")?.textContent).toBe(
      "z. B. Eine Fremde kommt.",
    );
  });
});
