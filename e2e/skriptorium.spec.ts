import { crc32, deflateSync } from "node:zlib";
import { expect, test, type Page } from "@playwright/test";
import type { ModelList } from "../ui/src/api";
import { E2E_PASSWORD } from "./global-setup";

async function login(page: Page, password = E2E_PASSWORD) {
  await page.goto("/");
  await page.getByLabel("Passwort").fill(password);
  await page.getByRole("button", { name: "Anmelden" }).click();
}

/** A button in the bar of symbols on the left (step 5.11). */
function bar(page: Page, name: string) {
  return page
    .getByRole("navigation", { name: "Bereiche" })
    .getByRole("button", { name, exact: true });
}

/** An area of the open world: Geschichten, Kanon, Import, Welt. */
function area(page: Page, name: string) {
  return page
    .getByRole("navigation", { name: "Bereiche der Welt" })
    .getByRole("link", { name, exact: true });
}

/** A world, story or chapter in the list on the left. */
function inList(page: Page, name: string) {
  return page
    .getByRole("navigation", { name: "Geschichten" })
    .getByRole("link", { name, exact: true });
}

/** Add a chapter to the open novel in the list on the left. */
async function addChapter(page: Page, title: string) {
  await page.getByRole("button", { name: "+ Kapitel" }).click();
  await page.getByLabel("Titel des neuen Kapitels").fill(title);
  await page.getByRole("button", { name: "Kapitel anlegen" }).click();
  await expect(page.getByLabel("Kapiteltitel")).toHaveValue(title);
}

/** Open the settings of the story in the bar on the right. */
async function storySettings(page: Page) {
  await page.getByRole("button", { name: "Kanon & Geschichte" }).click();
  await page.getByRole("button", { name: "Geschichte", exact: true }).click();
}

/** Create a world on the start page and open it. */
async function createWorld(page: Page, name: string) {
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "Welt anlegen" }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
}

/** Add an entry in the open canon (category by its identifier, e.g. "ort"; default "figur"). */
async function addEntry(
  page: Page,
  entry: { name: string; text: string; category?: string },
) {
  await page.getByRole("button", { name: "Neuer Eintrag" }).click();
  if (entry.category !== undefined) {
    await page
      .getByRole("combobox", { name: /^Kategorie/ })
      .selectOption(entry.category);
  }
  await page.getByLabel("Name").fill(entry.name);
  await page.getByLabel("Text").fill(entry.text);
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByRole("button", { name: entry.name })).toBeVisible();
}

/** A valid PNG of one colour, built with the standard library (no image package needed). */
function solidPng(
  width: number,
  height: number,
  [red, green, blue]: readonly [number, number, number],
): Buffer {
  const chunk = (type: string, data: Buffer): Buffer => {
    const name = Buffer.from(type, "ascii");
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const check = Buffer.alloc(4);
    check.writeUInt32BE(crc32(Buffer.concat([name, data])));
    return Buffer.concat([length, name, data, check]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.writeUInt8(8, 8); // bits per channel
  header.writeUInt8(2, 9); // truecolour
  const row = Buffer.from([
    0,
    ...Array<number[]>(width).fill([red, green, blue]).flat(),
  ]);
  const rows = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(rows)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * Offer one model that reads images; the list of the models comes from OpenRouter, which a test
 * run must not depend on ("Von der KI beschreiben lassen" needs such a model). Typed, so the
 * stand-in follows the interface's type of the answer.
 */
async function withImageModel(page: Page) {
  await page.route("**/api/models", async (route) => {
    const json: ModelList = {
      models: ["x-ai/grok-4.6"],
      default: "x-ai/grok-4.6",
      favorites: ["x-ai/grok-4.6"],
      catalog: [
        {
          id: "x-ai/grok-4.6",
          name: "Grok 4.6",
          provider: "x-ai",
          input_price: 2,
          output_price: 6,
          estimated_cost: 0.063,
          context_length: 500_000,
          moderated: false,
          thinking: null,
          checked: true,
          reads_images: true,
        },
      ],
      catalog_available: true,
    };
    await route.fulfill({ json });
  });
}

/** An answer of the provider as the server streams it: start, the text in one piece, done. */
function answerStream(text: string): string {
  const event = (name: string, data: unknown) =>
    `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`;
  return [
    event("start", {
      model: "x-ai/grok-4.6",
      estimated_tokens: 300,
      web_search: false,
    }),
    event("text", { text }),
    event("done", {
      input_tokens: 300,
      output_tokens: 40,
      cost_usd: null,
      finish_reason: "stop",
    }),
  ].join("");
}

test("refuses a wrong password", async ({ page }) => {
  await login(page, "das ist falsch und lang");
  await expect(page.getByRole("alert")).toHaveText("Passwort falsch");
});

test("session cookie and content security policy", async ({
  page,
  context,
}) => {
  await login(page);
  await expect(page.getByRole("heading", { name: "Welten" })).toBeVisible();
  const [cookie] = await context.cookies();
  expect(cookie).toMatchObject({
    name: "__Host-sitzung",
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
  });
  // CSP script-src 'self': an injected inline script does not run and is reported.
  const probe = await page.evaluate(async () => {
    const violation = new Promise<string>((resolve) => {
      document.addEventListener("securitypolicyviolation", (event) => {
        resolve(event.effectiveDirective);
      });
    });
    const script = document.createElement("script");
    script.textContent = "document.body.dataset.probe = 'lief'";
    document.head.appendChild(script);
    return {
      ran: document.body.dataset.probe ?? "nicht",
      blocked: await violation,
    };
  });
  expect(probe).toEqual({ ran: "nicht", blocked: "script-src-elem" });
  expect(await page.evaluate(() => document.cookie)).not.toContain("sitzung");
});

test("world, canon, import, story and manuscript survive a reload", async ({
  page,
}) => {
  await login(page);
  await page.getByLabel("Name").fill("Die Salzmark");
  await page.getByRole("button", { name: "Welt anlegen" }).click();
  await expect(
    page.getByRole("heading", { name: "Die Salzmark" }),
  ).toBeVisible();

  await area(page, "Kanon").click();
  await page.getByRole("button", { name: "Neuer Eintrag" }).click();
  await page.getByLabel("Name").fill("Kael");
  await page.getByLabel("Text").fill("Fährmann über den Salzsee.");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByRole("button", { name: "Kael" })).toBeVisible();

  await area(page, "Import").click();
  await page
    .getByLabel("oder Text einfügen")
    .fill("# Orte\n\n## Salzsee\nWeit und weiß.\n");
  await page.getByRole("button", { name: "Vorschau" }).click();
  await page.getByRole("button", { name: "Übernehmen" }).click();
  await expect(page.getByText(/1 neu, 0 überschrieben/)).toBeVisible();

  await area(page, "Geschichten").click();
  await page.getByLabel("Titel").fill("Die Überfahrt");
  await page.getByRole("button", { name: "Geschichte anlegen" }).click();
  await addChapter(page, "Aufbruch");
  const editor = page.getByLabel("Manuskript");
  await editor.click();
  await page.keyboard.type("Kael stieß das Boot ab. <script>alert(1)</script>");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByText("Gespeichert.")).toBeVisible();

  // The address keeps the chapter open across a reload (step 5.11).
  await page.reload();
  await expect(page).toHaveURL(
    /#\/welt\/die-salzmark\/geschichte\/die-ueberfahrt\/kapitel\/1$/,
  );
  await expect(page.getByLabel("Manuskript")).toHaveText(
    "Kael stieß das Boot ab. <script>alert(1)</script>",
  );
  await page.goBack();
  await expect(inList(page, "Die Überfahrt")).toBeVisible();

  await bar(page, "Abmelden").click();
  await expect(page.getByRole("button", { name: "Anmelden" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Anmelden" })).toBeVisible();
});

test("password change form reaches the server", async ({ page }) => {
  await login(page);
  await bar(page, "Konto").click();
  await page
    .getByLabel("Bisheriges Passwort")
    .fill("nicht das richtige Passwort");
  await page
    .getByLabel("Neues Passwort", { exact: true })
    .fill("ein ganz neues Passwort 1");
  await page
    .getByLabel("Neues Passwort wiederholen")
    .fill("ein ganz neues Passwort 1");
  await page.getByRole("button", { name: "Passwort ändern" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Bisheriges Passwort falsch",
  );
  await expect(page.getByText("(diese Sitzung)")).toBeVisible();
});

test("@ menu names an entry; taken-over AI text is appended and saved", async ({
  page,
}) => {
  // The provider stream is replaced in the browser; the server stays real (saving, reload).
  let sent: unknown = null;
  await page.route("**/chapters/1/write", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: [
        'event: start\ndata: {"model": "x-ai/grok-4.6", "estimated_tokens": 300}\n\n',
        'event: text\ndata: {"text": "Nebel lag über dem Wasser."}\n\n',
        'event: done\ndata: {"input_tokens": 300, "output_tokens": 8, "cost_usd": null, "finish_reason": "stop"}\n\n',
      ].join(""),
    });
  });
  await login(page);
  await page.getByLabel("Name").fill("Die Nebelküste");
  await page.getByRole("button", { name: "Welt anlegen" }).click();
  await area(page, "Kanon").click();
  await page.getByRole("button", { name: "Neuer Eintrag" }).click();
  await page.getByLabel("Name").fill("Mira");
  await page.getByLabel("Text").fill("Zöllnerin mit einer Narbe am Kinn.");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByRole("button", { name: "Mira" })).toBeVisible();
  await area(page, "Geschichten").click();
  await page.getByLabel("Titel").fill("Am Ufer");
  await page.getByRole("button", { name: "Geschichte anlegen" }).click();
  await addChapter(page, "Ankunft");
  await page.getByLabel("Manuskript").click();
  await page.keyboard.type("Das Boot lief auf Grund.");

  await page.getByLabel(/Anweisung an die KI/).click();
  await page.keyboard.type("@Mi");
  await expect(page.getByRole("option", { name: /Mira/ })).toBeVisible();
  await waitForCompletionInteraction(page);
  await page.keyboard.press("Enter");
  // The space behind the name comes with the choice (step 5.17).
  await page.keyboard.type("kommt.");
  await expect(page.getByText("Herangezogen: Mira")).toBeVisible();
  // The recognised name stands out in the instruction field (step 5.18).
  await expect(page.locator(".editor.instruction .cm-mention")).toHaveText(
    "@Mira",
  );

  await page.getByRole("button", { name: "Weiterschreiben" }).click();
  await expect(page.getByLabel("Vorschlag der KI")).toHaveValue(
    "Nebel lag über dem Wasser.",
  );
  await page.getByRole("button", { name: "Übernehmen" }).click();
  await expect(page.getByLabel("Vorschlag der KI")).toBeHidden();
  expect(sent).toEqual({
    instruction: "@Mira kommt.",
    references: ["mira"],
    model: "x-ai/grok-4.6",
    length: "mittel",
    scene: null,
  });

  await page.reload();
  await expect(page.getByLabel("Manuskript")).toHaveText(
    "Das Boot lief auf Grund.Nebel lag über dem Wasser.",
  );
});

test("a guest from another world is bound in and named with @", async ({
  page,
}) => {
  // Step 3.7 (FR-017): the provider stream is replaced; binding and menu run for real.
  let sent: unknown = null;
  await page.route("**/chapters/1/write", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: 'event: text\ndata: {"text": "Reif lag auf dem Steg."}\n\n',
    });
  });
  await login(page);
  await page.getByLabel("Name").fill("Das Frostreich");
  await page.getByRole("button", { name: "Welt anlegen" }).click();
  await area(page, "Kanon").click();
  await page.getByRole("button", { name: "Neuer Eintrag" }).click();
  await page.getByLabel("Name").fill("Eiskönigin");
  await page.getByLabel("Text").fill("Herrscht über den Frost, trägt Reif.");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByRole("button", { name: "Eiskönigin" })).toBeVisible();

  await bar(page, "Welten").click();
  await page.getByLabel("Name").fill("Die Salzbucht");
  await page.getByRole("button", { name: "Welt anlegen" }).click();
  await area(page, "Geschichten").click();
  await page.getByLabel("Titel").fill("Gastspiel");
  await page.getByRole("button", { name: "Geschichte anlegen" }).click();
  await storySettings(page);
  await page.getByText(/Gäste aus anderen Welten/).click();
  await page.getByLabel("Welt des Gastes").selectOption("das-frostreich");
  await page.getByLabel("Gast-Eintrag").selectOption("eiskoenigin");
  await page.getByRole("button", { name: "Als Gast einbinden" }).click();
  await expect(page.getByText("Eiskönigin aus Das Frostreich")).toBeVisible();
  await addChapter(page, "Ankunft");

  await page.getByLabel(/Anweisung an die KI/).click();
  await page.keyboard.type("@Eis");
  await expect(
    page.getByRole("option", { name: /Eiskönigin.*Gast/ }),
  ).toBeVisible();
  await waitForCompletionInteraction(page);
  await page.keyboard.press("Enter");
  await expect(page.getByText("Herangezogen: Eiskönigin (Gast)")).toBeVisible();
  await page.getByRole("button", { name: "Weiterschreiben" }).click();
  await expect(page.getByLabel("Vorschlag der KI")).toHaveValue(
    "Reif lag auf dem Steg.",
  );
  expect(sent).toMatchObject({ references: ["eiskoenigin"] });
});

test("a marked passage goes into the canon or into this story only", async ({
  page,
}) => {
  // Step 3.8 (FR-015, FR-024): mark, suggest, choose the target, save – all real.
  await login(page);
  await page.getByLabel("Name").fill("Das Aschenland");
  await page.getByRole("button", { name: "Welt anlegen" }).click();
  await area(page, "Kanon").click();
  await page.getByRole("button", { name: "Neuer Eintrag" }).click();
  await page.getByLabel("Name").fill("Aschenfürst");
  await page.getByLabel("Text").fill("Herrscht über die Glut.");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByRole("button", { name: "Aschenfürst" })).toBeVisible();

  await bar(page, "Welten").click();
  await page.getByLabel("Name").fill("Die Kreideküste");
  await page.getByRole("button", { name: "Welt anlegen" }).click();
  await area(page, "Kanon").click();
  await page.getByRole("button", { name: "Neuer Eintrag" }).click();
  await page.getByLabel("Name").fill("Tamsin");
  await page.getByLabel("Text").fill("Lotsin an der Kreideküste.");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByRole("button", { name: "Tamsin" })).toBeVisible();
  await area(page, "Geschichten").click();
  await page.getByLabel("Titel").fill("Kreidefelsen");
  await page.getByRole("button", { name: "Geschichte anlegen" }).click();
  await storySettings(page);
  await page.getByText(/Gäste aus anderen Welten/).click();
  await page.getByLabel("Welt des Gastes").selectOption("das-aschenland");
  await page.getByLabel("Gast-Eintrag").selectOption("aschenfuerst");
  await page.getByRole("button", { name: "Als Gast einbinden" }).click();
  await expect(page.getByText("Aschenfürst aus Das Aschenland")).toBeVisible();
  await addChapter(page, "Brandung");
  await page.getByLabel("Manuskript").click();
  await page.keyboard.type("Tamsin fürchtet tiefes Wasser.");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Der Aschenfürst lacht nie.");

  // Into the canon of the world: mark the first line, two clicks.
  await page.keyboard.press("ControlOrMeta+Home");
  await page.keyboard.press("Shift+End");
  let started = Date.now();
  await page.getByRole("button", { name: "In den Kanon" }).click();
  await expect(
    page.getByRole("combobox", { name: "Eintrag", exact: true }),
  ).toHaveValue("tamsin");
  await page.getByRole("button", { name: "Eintragen" }).click();
  await expect(page.getByText("Kanon-Eintrag „Tamsin“ ergänzt.")).toBeVisible();
  expect(Date.now() - started).toBeLessThan(10_000);

  // A fact about the guest: the story only is preset.
  await page.getByLabel("Manuskript").click();
  await page.keyboard.press("ControlOrMeta+End");
  await page.keyboard.press("Shift+Home");
  started = Date.now();
  await page.getByRole("button", { name: "In den Kanon" }).click();
  await expect(page.getByLabel("Nur diese Geschichte")).toBeChecked();
  await page.getByRole("button", { name: "Eintragen" }).click();
  await expect(
    page.getByText("Fakt zu „Aschenfürst“ gilt nur in dieser Geschichte."),
  ).toBeVisible();
  expect(Date.now() - started).toBeLessThan(10_000);
  await page.getByText("Fakten dieser Geschichte (1)").click();
  await expect(
    page.getByText("Aschenfürst: Der Aschenfürst lacht nie."),
  ).toBeVisible();

  await page.reload();
  await inList(page, "Die Kreideküste").click();
  await area(page, "Kanon").click();
  await page.getByRole("button", { name: "Tamsin" }).click();
  // The entry has its own address and stays open after a reload (step 5.11 part 3).
  await expect(page).toHaveURL(/#\/welt\/die-kreidekueste\/kanon\/tamsin$/);
  await page.reload();
  await expect(page.getByRole("article")).toContainText(
    "Tamsin fürchtet tiefes Wasser.",
  );
  await page.getByRole("button", { name: "Bearbeiten" }).click();
  await expect(page.getByLabel("Text")).toHaveValue(
    "Lotsin an der Kreideküste.\n\nTamsin fürchtet tiefes Wasser.",
  );
  await inList(page, "Das Aschenland").click();
  await area(page, "Kanon").click();
  await page.getByRole("button", { name: "Aschenfürst" }).click();
  await expect(page.getByRole("article")).toContainText(
    "Herrscht über die Glut.",
  );
  await expect(page.getByRole("article")).not.toContainText("lacht nie");
});

test("the model of a story survives a reload; costs of the month are shown", async ({
  page,
}) => {
  // Step 3.9 (FR-018, ADR-023): no provider in this run, so the month has no requests.
  await login(page);
  await page.getByLabel("Name").fill("Die Moorlande");
  await page.getByRole("button", { name: "Welt anlegen" }).click();
  await area(page, "Geschichten").click();
  await page.getByLabel("Titel").fill("Nebelpfad");
  await page.getByRole("button", { name: "Geschichte anlegen" }).click();
  await addChapter(page, "Aufbruch");
  const model = page.getByRole("combobox", { name: "Modell", exact: true });
  // Preset since step 5.7 (ADR-044); qwen3.8-max is the second start favorite (ADR-055).
  await expect(model).toHaveValue("x-ai/grok-4.6");
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === "PATCH" &&
      response.url().endsWith("/stories/nebelpfad"),
  );
  await model.selectOption("qwen/qwen3.8-max-0902");
  expect((await saved).status()).toBe(200);

  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Modell", exact: true }),
  ).toHaveValue("qwen/qwen3.8-max-0902");

  // Step 5.12 (ADR-055): the catalog opens from the selection field, with or without network.
  await page
    .getByRole("combobox", { name: "Modell", exact: true })
    .selectOption("Modelle verwalten …");
  const manager = page.getByRole("dialog", { name: "Modelle verwalten" });
  await expect(manager.getByText(/OpenRouter/).first()).toBeVisible();
  await manager.getByRole("button", { name: "Fertig" }).click();
  await expect(manager).toBeHidden();
  await expect(
    page.getByRole("combobox", { name: "Modell", exact: true }),
  ).toHaveValue("qwen/qwen3.8-max-0902");

  await bar(page, "Konto").click();
  await expect(page.getByText(/ für \d+ Anfrage/)).toBeVisible();
});

test("a default style is set for the story; a new chapter takes it over", async ({
  page,
}) => {
  // Step 5.6 (ADR-053): the default is copied into chapters created afterwards.
  await login(page);
  await page.getByLabel("Name").fill("Die Nachtmark");
  await page.getByRole("button", { name: "Welt anlegen" }).click();
  await area(page, "Geschichten").click();
  await page.getByLabel("Titel").fill("Schattenspiel");
  await page.getByRole("button", { name: "Geschichte anlegen" }).click();
  await addChapter(page, "Eins");
  await expect(page.getByText("Schreibweise Kapitel 1:")).toBeVisible();
  await expect(page.getByText("keine", { exact: true })).toBeVisible();

  await storySettings(page);
  const story = page.getByRole("region", {
    name: "Genre und Schreibweise der Geschichte",
  });
  await story.getByRole("button", { name: "Thriller", exact: true }).click();
  await story.getByRole("button", { name: "düster", exact: true }).click();
  await story.getByRole("button", { name: "atemlos", exact: true }).click();
  await story.getByRole("button", { name: "Speichern" }).click();
  await expect(story.getByText("Gespeichert.")).toBeVisible();

  await addChapter(page, "Zwei");
  await expect(page.getByText("Schreibweise Kapitel 2:")).toBeVisible();
  await expect(page.getByText("düster · atemlos")).toBeVisible();
  const chapter = page.getByRole("region", {
    name: "Schreibweise dieses Kapitels (Kapitel 2)",
  });
  // The bar stays open when a chapter is added; open it only if it was closed.
  if (!(await chapter.isVisible())) {
    await storySettings(page);
  }
  await expect(
    chapter.getByRole("button", { name: "düster", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");

  await page.reload();
  await expect(page.getByText("düster · atemlos")).toBeVisible();
});

/**
 * The `@` menu ignores Enter for 75 ms after it opens (`interactionDelay` of
 * @codemirror/autocomplete, against accidental choices); an Enter within that time
 * is a line break. Wait past it before choosing, as a person would.
 */
async function waitForCompletionInteraction(page: Page): Promise<void> {
  await page.waitForTimeout(150);
}

test("a long chapter opens at its end with the writing area close by", async ({
  page,
}) => {
  // Steps 5.9, 5.11 (FR-022): the chapter scrolls like a chat and opens at the end of the text.
  await login(page);
  await page.getByLabel("Name").fill("Die Lange Nacht");
  await page.getByRole("button", { name: "Welt anlegen" }).click();
  await area(page, "Geschichten").click();
  await page.getByLabel("Titel").fill("Endlos");
  await page.getByRole("button", { name: "Geschichte anlegen" }).click();
  await addChapter(page, "Lang");
  await expect(page.getByLabel("Manuskript")).toBeVisible();
  const text = Array.from(
    { length: 300 },
    (_, index) => `Absatz ${String(index + 1)}: Die Nacht wollte nicht enden.`,
  ).join("\n\n");
  const status = await page.evaluate(async (body) => {
    const response = await fetch(
      "/api/worlds/die-lange-nacht/stories/endlos/chapters/1",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Lang", text: body }),
      },
    );
    return response.status;
  }, text);
  expect(status).toBe(200);

  await page.reload();
  const last = page.getByText("Absatz 300: Die Nacht wollte nicht enden.");
  await expect(last).toBeInViewport();
  await expect(
    page.getByText("Absatz 1: Die Nacht", { exact: false }),
  ).not.toBeInViewport();
  await expect(
    page.getByRole("button", { name: "In den Kanon" }),
  ).toBeInViewport();
  await expect(page.getByLabel(/Anweisung an die KI/)).toBeInViewport();
});

test("without a connection the installed app shows a notice and keeps no texts", async ({
  page,
  context,
}) => {
  // Steps 5.21 (FR-032) and ADR-048: manifest, a service worker that keeps one static page.
  await login(page);
  // The login must be through before the reload below (scrypt takes a while on CI runners).
  await expect(page.getByRole("heading", { name: "Welten" })).toBeVisible();
  const manifest = await page.request.get("/manifest.webmanifest");
  expect(manifest.headers()["content-type"]).toContain(
    "application/manifest+json",
  );
  expect(await manifest.json()).toMatchObject({
    display: "standalone",
    start_url: "/",
  });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // After a reload the worker controls the page; pages still come from the network.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Welten" })).toBeVisible();
  expect(
    await page.evaluate(() => navigator.serviceWorker.controller !== null),
  ).toBe(true);

  // Open a chapter with text, so answers of the interface pass by the worker.
  await page.getByLabel("Name").fill(`Funkstille ${String(Date.now())}`);
  await page.getByRole("button", { name: "Welt anlegen" }).click();
  await page.getByLabel("Titel").fill("Ohne Netz");
  await page.getByRole("button", { name: "Geschichte anlegen" }).click();
  await addChapter(page, "Stille");
  await page.getByLabel("Manuskript").click();
  await page.keyboard.type("Kein Wort davon gehört ins Gerät.");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByText("Gespeichert.")).toBeVisible();

  await context.setOffline(true);
  const answer = await page.evaluate(async () => {
    try {
      const response = await fetch("/api/worlds");
      return `Antwort ${String(response.status)}`;
    } catch {
      return "kein Netz";
    }
  });
  expect(answer).toBe("kein Netz");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Keine Verbindung" }),
  ).toBeVisible();
  const stored = await page.evaluate(async () => {
    const urls: string[] = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        urls.push(new URL(request.url).pathname);
      }
    }
    return urls;
  });
  expect(stored).toEqual(["/offline.html"]);

  // Back online: the notice has no script and leads to the start; the text is on the server.
  await context.setOffline(false);
  await page.getByRole("link", { name: "Erneut versuchen" }).click();
  await expect(page.getByRole("heading", { name: "Welten" })).toBeVisible();
  await page.goBack();
  await page.reload();
  await expect(page.getByLabel("Manuskript")).toHaveText(
    "Kein Wort davon gehört ins Gerät.",
  );
});

test("the world builder keeps its conversation; proposals are taken over through the preview", async ({
  page,
}) => {
  // Step 8.8 (FR-029, ADR-064, ADR-087): the provider stream is replaced in the browser;
  // preview, import and saving run against the real server.
  const proposal = (text: string) =>
    `${text}\n\n\`\`\`kanon\n# Figuren\n\n## Brin Tolliver\nAliasse: Der Leuchtwart\n\n${text}\n\`\`\`\n`;
  const answers = [
    proposal("Wärter des Leuchtturms, wacht über die Hafeneinfahrt."),
    proposal("Greiser Wärter des Leuchtturms, trägt stets eine Laterne."),
  ];
  const sent: unknown[] = [];
  await page.route("**/worlds/*/worldbuilder", async (route) => {
    const answer = answers[sent.length];
    sent.push(route.request().postDataJSON());
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: answerStream(answer ?? ""),
    });
  });
  await login(page);
  await createWorld(page, "Der Mondhafen");
  await area(page, "Kanon").click();
  await page.getByRole("button", { name: /Weltenbauer/ }).click();
  const builder = page.getByRole("region", { name: "Weltenbauer" });
  const field = builder.getByLabel("Nachricht an den Weltenbauer");

  // First message: the answer carries a proposal that is taken over as a new entry.
  await field.click();
  await page.keyboard.type("Entwirf einen Leuchtturmwärter.");
  await builder.getByRole("button", { name: "Senden" }).click();
  await expect(builder.getByText("wacht über die Hafeneinfahrt")).toBeVisible();
  expect(sent[0]).toEqual({
    messages: [{ role: "user", content: "Entwirf einen Leuchtturmwärter." }],
    references: [],
    model: "x-ai/grok-4.6",
    web_search: false,
  });
  await builder.getByRole("button", { name: "Als Kanon übernehmen" }).click();
  const preview = page.getByRole("dialog", { name: "Als Kanon übernehmen" });
  await expect(preview.getByText("Vorschau: 1 Einträge")).toBeVisible();
  await expect(preview.getByLabel("Kategorie für Brin Tolliver")).toHaveValue(
    "figur",
  );
  await preview.getByRole("button", { name: "Übernehmen" }).click();
  await expect(
    preview.getByText("Übernommen: 1 neu, 0 überschrieben, 0 übersprungen."),
  ).toBeVisible();
  await preview.getByRole("button", { name: "Zurück zum Weltenbauer" }).click();
  await expect(preview).toBeHidden();

  // The conversation stays: also when an entry is opened and the world builder opened again.
  await expect(
    builder.getByText("Entwirf einen Leuchtturmwärter."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Brin Tolliver" }).click();
  await expect(builder).toBeHidden();
  await expect(page.getByRole("article")).toContainText(
    "wacht über die Hafeneinfahrt",
  );
  await page.getByRole("button", { name: /Weltenbauer/ }).click();
  await expect(
    builder.getByText("Entwirf einen Leuchtturmwärter."),
  ).toBeVisible();

  // Second message in the same conversation: the earlier turns go along; the revised entry
  // meets the existing one and replaces it only after the author agrees.
  await field.click();
  await page.keyboard.type("Mach ihn älter.");
  await builder.getByRole("button", { name: "Senden" }).click();
  await expect(builder.getByText("trägt stets eine Laterne")).toBeVisible();
  expect(sent[1]).toEqual({
    messages: [
      { role: "user", content: "Entwirf einen Leuchtturmwärter." },
      { role: "assistant", content: answers[0] },
      { role: "user", content: "Mach ihn älter." },
    ],
    references: [],
    model: "x-ai/grok-4.6",
    web_search: false,
  });
  await builder
    .getByRole("button", { name: "Als Kanon übernehmen" })
    .last()
    .click();
  await preview.getByLabel(/existiert schon – überschreiben/).check();
  await preview.getByRole("button", { name: "Übernehmen" }).click();
  await expect(
    preview.getByText("Übernommen: 0 neu, 1 überschrieben, 0 übersprungen."),
  ).toBeVisible();
  await preview.getByRole("button", { name: "Zurück zum Weltenbauer" }).click();

  // Both steps are on the server; the conversation itself is not (it is lost on a reload).
  await page.reload();
  await page.getByRole("button", { name: "Brin Tolliver" }).click();
  await expect(page.getByRole("article")).toContainText(
    "Greiser Wärter des Leuchtturms, trägt stets eine Laterne.",
  );
  await expect(page.getByRole("article")).not.toContainText(
    "wacht über die Hafeneinfahrt",
  );
  await expect(page.getByRole("article")).toContainText("Auch: Der Leuchtwart");
  expect(sent).toHaveLength(2);
});

test("an uploaded image is described by the AI; the looks replace the old section", async ({
  page,
}) => {
  // Steps 7.6, 7.13, 8.4 (ADR-072, ADR-074, ADR-083): upload, storing and showing the image run
  // for real; the description stream and the model list (OpenRouter) are replaced.
  let sent: unknown = null;
  await withImageModel(page);
  await page.route("**/entries/*/images/*/describe", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: answerStream("Schmal gebaut, rotes Haar, Sommersprossen."),
    });
  });
  await login(page);
  await createWorld(page, "Die Fährstadt");
  await area(page, "Kanon").click();
  await addEntry(page, {
    name: "Ysolde",
    text: "Ysolde führt die Fähre.\n\n## Aussehen\n\nAlt und grau.\n\n## Herkunft\n\nSie stammt vom Salzsee.",
  });
  await page.getByRole("button", { name: "Ysolde" }).click();

  // Upload: the browser shrinks the file, the server checks and stores it.
  const [chooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page
      .getByRole("button", { name: "Bild hinzufügen" })
      .click()
      .then(() =>
        page.getByRole("menuitem", { name: "Bild hochladen" }).click(),
      ),
  ]);
  await chooser.setFiles({
    name: "ysolde.png",
    mimeType: "image/png",
    buffer: solidPng(48, 32, [180, 90, 40]),
  });
  const main = page.getByRole("img", { name: "Ysolde, Hauptbild" });
  await expect(
    page.getByText("1 Bild · Tipp auf ein Bild zeigt es groß"),
  ).toBeVisible();
  await expect
    .poll(() => main.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBe(48);

  // Describe the image; the proposal replaces the section that already has text.
  await main.click();
  const viewer = page.getByRole("dialog", { name: "Ysolde, Bild 1 von 1" });
  await viewer
    .getByRole("button", { name: "✨ Von der KI beschreiben lassen" })
    .click();
  await viewer
    .getByRole("button", { name: "Beschreiben lassen", exact: true })
    .click();
  await expect(viewer.getByLabel("Beschreibung")).toHaveValue(
    "Schmal gebaut, rotes Haar, Sommersprossen.",
  );
  expect(sent).toEqual({ model: "x-ai/grok-4.6" });
  await viewer
    .getByRole("button", { name: "Übernehmen als „Aussehen“" })
    .click();
  const ask = page.getByRole("dialog", { name: "„Aussehen“ hat schon Text" });
  await expect(ask.getByText("Alt und grau.")).toBeVisible();
  await ask.getByRole("button", { name: "Ersetzen" }).click();
  await expect(ask).toBeHidden();
  await expect(viewer.getByLabel("Beschreibung")).toBeHidden();
  await viewer.getByRole("button", { name: "Schließen" }).click();
  await expect(page.getByRole("article")).toContainText(
    "Schmal gebaut, rotes Haar",
  );
  await expect(page.getByRole("article")).not.toContainText("Alt und grau.");

  // After a reload: new text in the section, the rest of the entry untouched, image still there.
  await page.reload();
  await expect(page.getByRole("article")).toContainText(
    "Schmal gebaut, rotes Haar",
  );
  await expect(page.getByRole("article")).not.toContainText("Alt und grau.");
  await expect
    .poll(() =>
      page
        .getByRole("img", { name: "Ysolde, Hauptbild" })
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBe(48);
  await page.getByRole("button", { name: "Bearbeiten" }).click();
  await expect(page.getByLabel("Text")).toHaveValue(
    "Ysolde führt die Fähre.\n\n## Aussehen\n\nSchmal gebaut, rotes Haar, Sommersprossen.\n\n## Herkunft\n\nSie stammt vom Salzsee.",
  );
});

test("a map is uploaded and marked; the point leads to its canon entry", async ({
  page,
}) => {
  // Steps 7.10, 7.14 (ADR-073, ADR-079): upload, storing and markers run against the real server.
  await login(page);
  await createWorld(page, "Das Nordmeer");
  await area(page, "Kanon").click();
  await addEntry(page, {
    name: "Sturmhafen",
    text: "Hafenstadt am Rand der Welt.",
    category: "ort",
  });

  await area(page, "Karten").click();
  await page.getByRole("button", { name: "＋ Karte hinzufügen" }).click();
  await page.getByLabel("Datei").setInputFiles({
    name: "seekarte.png",
    mimeType: "image/png",
    buffer: solidPng(300, 200, [40, 90, 160]),
  });
  // The name is taken from the file's name until the author writes one.
  await expect(page.getByLabel("Name")).toHaveValue("seekarte");
  await page.getByLabel("Name").fill("Seekarte des Nordens");
  await page.getByRole("button", { name: "Speichern" }).click();
  await page.getByRole("button", { name: "Seekarte des Nordens" }).click();

  const viewer = page.getByRole("dialog", {
    name: "Karte Seekarte des Nordens",
  });
  const image = viewer.getByRole("img", { name: "Seekarte des Nordens" });
  await expect
    .poll(() =>
      image.evaluate((element: HTMLImageElement) => element.naturalWidth),
    )
    .toBe(300);
  // The box of the map takes the shape of the image once it has loaded; only then points sit right.
  const content = viewer.getByTestId("map-content");
  await expect
    .poll(async () => {
      const box = await content.boundingBox();
      return box === null
        ? 0
        : Math.round((box.width / box.height) * 100) / 100;
    })
    .toBe(1.5);

  // Mark: a tap at a quarter of the width and half of the height, then choose the entry.
  await viewer.getByRole("button", { name: "Markieren" }).click();
  const box = await content.boundingBox();
  if (box === null) {
    throw new Error("map without a box");
  }
  await content.click({
    position: { x: box.width * 0.25, y: box.height * 0.5 },
  });
  await viewer.getByLabel("Welcher Eintrag liegt hier?").fill("sturm");
  await viewer.getByRole("button", { name: /Sturmhafen/ }).click();
  await viewer.getByRole("button", { name: "Setzen" }).click();
  await expect(
    viewer.getByRole("button", { name: "Sturmhafen", exact: true }),
  ).toBeVisible();
  await viewer.getByRole("button", { name: "Fertig" }).click();
  await viewer.getByRole("button", { name: "Schließen" }).click();

  // The map and its point are on the server.
  await page.reload();
  const maps = await page.evaluate(async () => {
    const response = await fetch("/api/worlds");
    const worlds = (await response.json()) as {
      id: string;
      maps: {
        name: string;
        markers: { entry: string; x: number; y: number }[];
      }[];
    }[];
    return worlds.find((world) => world.id === "das-nordmeer")?.maps;
  });
  expect(maps).toHaveLength(1);
  expect(maps?.[0]?.name).toBe("Seekarte des Nordens");
  expect(maps?.[0]?.markers).toHaveLength(1);
  expect(maps?.[0]?.markers[0]?.entry).toBe("sturmhafen");
  expect(maps?.[0]?.markers[0]?.x).toBeCloseTo(0.25, 1);
  expect(maps?.[0]?.markers[0]?.y).toBeCloseTo(0.5, 1);

  // A tap on the point shows the name; a tap on the name opens the entry.
  await page.getByRole("button", { name: "Seekarte des Nordens" }).click();
  await viewer.getByRole("button", { name: "Sturmhafen", exact: true }).click();
  await viewer.getByRole("button", { name: /Sturmhafen ›/ }).click();
  await expect(page).toHaveURL(/#\/welt\/das-nordmeer\/kanon\/sturmhafen$/);
  await expect(page.getByRole("article")).toContainText(
    "Hafenstadt am Rand der Welt.",
  );
});

test("the AI describes a map; its text is added below the section the description already has", async ({
  page,
}) => {
  // Steps 7.13, 8.4 (ADR-074, ADR-083): "Abbrechen" changes nothing, "Darunter ergänzen" keeps
  // the old text and everything around it; the description stream and the model list are replaced.
  let sent: unknown = null;
  await withImageModel(page);
  await page.route("**/maps/*/describe", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: answerStream("Zwei Buchten im Süden."),
    });
  });
  await login(page);
  await createWorld(page, "Die Salzküste");
  await area(page, "Welt").click();
  const description = page.getByLabel("Beschreibung und Grundregeln");
  const before =
    "Ein Küstenland.\n\n## Geografie – Kartenblatt\n\nSteile Klippen im Norden.\n\n## Klima\n\nRau und windig.";
  await description.fill(before);
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByText("Gespeichert.")).toBeVisible();

  await area(page, "Karten").click();
  await page.getByRole("button", { name: "＋ Karte hinzufügen" }).click();
  await page.getByLabel("Datei").setInputFiles({
    name: "kartenblatt.png",
    mimeType: "image/png",
    buffer: solidPng(300, 200, [120, 160, 90]),
  });
  await page.getByLabel("Name").fill("Kartenblatt");
  await page.getByRole("button", { name: "Speichern" }).click();
  await page.getByRole("button", { name: "Kartenblatt" }).click();
  const viewer = page.getByRole("dialog", { name: "Karte Kartenblatt" });
  await viewer
    .getByRole("button", { name: "✨ Von der KI beschreiben lassen" })
    .click();
  await viewer
    .getByRole("button", { name: "Beschreiben lassen", exact: true })
    .click();
  await expect(viewer.getByLabel("Beschreibung")).toHaveValue(
    "Zwei Buchten im Süden.",
  );
  expect(sent).toEqual({ model: "x-ai/grok-4.6" });

  // The section "Geografie – Kartenblatt" has text: the question comes up; cancelling leaves it.
  const take = viewer.getByRole("button", {
    name: "In die Weltbeschreibung übernehmen",
  });
  await take.click();
  const ask = page.getByRole("dialog", {
    name: "„Geografie – Kartenblatt“ hat schon Text",
  });
  await expect(ask.getByText("Steile Klippen im Norden.")).toBeVisible();
  await ask.getByRole("button", { name: "Abbrechen" }).click();
  await expect(ask).toBeHidden();
  await expect(viewer.getByLabel("Beschreibung")).toHaveValue(
    "Zwei Buchten im Süden.",
  );
  await take.click();
  await ask.getByRole("button", { name: "Darunter ergänzen" }).click();
  await expect(ask).toBeHidden();
  await expect(viewer.getByLabel("Beschreibung")).toBeHidden();
  await viewer.getByRole("button", { name: "Schließen" }).click();

  // On the server: the old text stays, the new one stands below it, the other sections are untouched.
  await page.reload();
  await area(page, "Welt").click();
  await expect(page.getByLabel("Beschreibung und Grundregeln")).toHaveValue(
    "Ein Küstenland.\n\n## Geografie – Kartenblatt\n\nSteile Klippen im Norden.\n\nZwei Buchten im Süden.\n\n## Klima\n\nRau und windig.",
  );
});
