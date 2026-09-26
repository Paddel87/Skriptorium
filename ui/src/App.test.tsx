import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App, appTitle } from "./App";

describe("App", () => {
  it("names the application", () => {
    expect(appTitle()).toBe("Skriptorium");
  });

  it("renders the title as heading", () => {
    expect(renderToStaticMarkup(<App />)).toBe("<h1>Skriptorium</h1>");
  });
});
