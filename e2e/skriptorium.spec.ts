import { expect, test, type Page } from "@playwright/test";
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
  await expect(page.getByLabel("Text")).toHaveValue(
    "Lotsin an der Kreideküste.\n\nTamsin fürchtet tiefes Wasser.",
  );
  await inList(page, "Das Aschenland").click();
  await area(page, "Kanon").click();
  await page.getByRole("button", { name: "Aschenfürst" }).click();
  await expect(page.getByLabel("Text")).toHaveValue("Herrscht über die Glut.");
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
  // Preset since step 5.7 (ADR-044); grok-4.7 stays selectable.
  await expect(model).toHaveValue("x-ai/grok-4.6");
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === "PATCH" &&
      response.url().endsWith("/stories/nebelpfad"),
  );
  await model.selectOption("x-ai/grok-4.7");
  expect((await saved).status()).toBe(200);

  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Modell", exact: true }),
  ).toHaveValue("x-ai/grok-4.7");

  await bar(page, "Konto").click();
  await expect(page.getByText(/ für \d+ Anfrage/)).toBeVisible();
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
  await page.getByLabel("Name").fill("Die Funkstille");
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
