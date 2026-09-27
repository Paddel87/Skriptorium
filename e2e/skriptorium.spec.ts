import { expect, test, type Page } from "@playwright/test";
import { E2E_PASSWORD } from "./global-setup";

async function login(page: Page, password = E2E_PASSWORD) {
  await page.goto("/");
  await page.getByLabel("Passwort").fill(password);
  await page.getByRole("button", { name: "Anmelden" }).click();
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
  await expect(page.getByText("› Die Salzmark")).toBeVisible();

  await page.getByRole("button", { name: "Kanon", exact: true }).click();
  await page.getByRole("button", { name: "Neuer Eintrag" }).click();
  await page.getByLabel("Name").fill("Kael");
  await page.getByLabel("Text").fill("Fährmann über den Salzsee.");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByRole("button", { name: "Kael" })).toBeVisible();

  await page.getByRole("button", { name: "Import" }).click();
  await page
    .getByLabel("oder Text einfügen")
    .fill("# Orte\n\n## Salzsee\nWeit und weiß.\n");
  await page.getByRole("button", { name: "Vorschau" }).click();
  await page.getByRole("button", { name: "Übernehmen" }).click();
  await expect(page.getByText(/1 neu, 0 überschrieben/)).toBeVisible();

  await page.getByRole("button", { name: "Geschichten" }).click();
  await page.getByLabel("Titel").fill("Die Überfahrt");
  await page.getByRole("button", { name: "Geschichte anlegen" }).click();
  await page.getByLabel("Titel des neuen Kapitels").fill("Aufbruch");
  await page.getByRole("button", { name: "Kapitel anlegen" }).click();
  const editor = page.getByLabel("Manuskript");
  await editor.click();
  await page.keyboard.type("Kael stieß das Boot ab. <script>alert(1)</script>");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByText("Gespeichert.")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Welten" })).toBeVisible();
  await page.getByRole("button", { name: "Die Salzmark" }).click();
  await page.getByRole("button", { name: "Die Überfahrt" }).click();
  await expect(page.getByLabel("Manuskript")).toHaveText(
    "Kael stieß das Boot ab. <script>alert(1)</script>",
  );

  await page.getByRole("button", { name: "Abmelden" }).click();
  await expect(page.getByRole("button", { name: "Anmelden" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Anmelden" })).toBeVisible();
});

test("password change form reaches the server", async ({ page }) => {
  await login(page);
  await page.getByRole("button", { name: "Konto" }).click();
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
        'event: start\ndata: {"model": "x-ai/grok-4.7", "estimated_tokens": 300}\n\n',
        'event: text\ndata: {"text": "Nebel lag über dem Wasser."}\n\n',
        'event: done\ndata: {"input_tokens": 300, "output_tokens": 8, "cost_usd": null, "finish_reason": "stop"}\n\n',
      ].join(""),
    });
  });
  await login(page);
  await page.getByLabel("Name").fill("Die Nebelküste");
  await page.getByRole("button", { name: "Welt anlegen" }).click();
  await page.getByRole("button", { name: "Kanon", exact: true }).click();
  await page.getByRole("button", { name: "Neuer Eintrag" }).click();
  await page.getByLabel("Name").fill("Mira");
  await page.getByLabel("Text").fill("Zöllnerin mit einer Narbe am Kinn.");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByRole("button", { name: "Mira" })).toBeVisible();
  await page.getByRole("button", { name: "Geschichten" }).click();
  await page.getByLabel("Titel").fill("Am Ufer");
  await page.getByRole("button", { name: "Geschichte anlegen" }).click();
  await page.getByLabel("Titel des neuen Kapitels").fill("Ankunft");
  await page.getByRole("button", { name: "Kapitel anlegen" }).click();
  await page.getByLabel("Manuskript").click();
  await page.keyboard.type("Das Boot lief auf Grund.");

  await page.getByLabel(/Anweisung an die KI/).click();
  await page.keyboard.type("@Mi");
  await expect(page.getByRole("option", { name: /Mira/ })).toBeVisible();
  await waitForCompletionInteraction(page);
  await page.keyboard.press("Enter");
  await page.keyboard.type(" kommt.");
  await expect(page.getByText("Herangezogen: Mira")).toBeVisible();

  await page.getByRole("button", { name: "Weiterschreiben" }).click();
  await expect(page.getByLabel("Vorschlag der KI")).toHaveValue(
    "Nebel lag über dem Wasser.",
  );
  await page.getByRole("button", { name: "Übernehmen" }).click();
  await expect(page.getByLabel("Vorschlag der KI")).toBeHidden();
  expect(sent).toEqual({
    instruction: "@Mira kommt.",
    references: ["mira"],
    model: "x-ai/grok-4.7",
    scene: null,
  });

  await page.reload();
  await page.getByRole("button", { name: "Die Nebelküste" }).click();
  await page.getByRole("button", { name: "Am Ufer" }).click();
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
  await page.getByRole("button", { name: "Kanon", exact: true }).click();
  await page.getByRole("button", { name: "Neuer Eintrag" }).click();
  await page.getByLabel("Name").fill("Eiskönigin");
  await page.getByLabel("Text").fill("Herrscht über den Frost, trägt Reif.");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByRole("button", { name: "Eiskönigin" })).toBeVisible();

  await page.locator("button.brand").click();
  await page.getByLabel("Name").fill("Die Salzbucht");
  await page.getByRole("button", { name: "Welt anlegen" }).click();
  await page.getByRole("button", { name: "Geschichten" }).click();
  await page.getByLabel("Titel").fill("Gastspiel");
  await page.getByRole("button", { name: "Geschichte anlegen" }).click();
  await page.getByText(/Gäste aus anderen Welten/).click();
  await page.getByLabel("Welt des Gastes").selectOption("das-frostreich");
  await page.getByLabel("Gast-Eintrag").selectOption("eiskoenigin");
  await page.getByRole("button", { name: "Als Gast einbinden" }).click();
  await expect(page.getByText("Eiskönigin aus Das Frostreich")).toBeVisible();
  await page.getByLabel("Titel des neuen Kapitels").fill("Ankunft");
  await page.getByRole("button", { name: "Kapitel anlegen" }).click();

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
  await page.getByRole("button", { name: "Kanon", exact: true }).click();
  await page.getByRole("button", { name: "Neuer Eintrag" }).click();
  await page.getByLabel("Name").fill("Aschenfürst");
  await page.getByLabel("Text").fill("Herrscht über die Glut.");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByRole("button", { name: "Aschenfürst" })).toBeVisible();

  await page.locator("button.brand").click();
  await page.getByLabel("Name").fill("Die Kreideküste");
  await page.getByRole("button", { name: "Welt anlegen" }).click();
  await page.getByRole("button", { name: "Kanon", exact: true }).click();
  await page.getByRole("button", { name: "Neuer Eintrag" }).click();
  await page.getByLabel("Name").fill("Tamsin");
  await page.getByLabel("Text").fill("Lotsin an der Kreideküste.");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByRole("button", { name: "Tamsin" })).toBeVisible();
  await page.getByRole("button", { name: "Geschichten" }).click();
  await page.getByLabel("Titel").fill("Kreidefelsen");
  await page.getByRole("button", { name: "Geschichte anlegen" }).click();
  await page.getByText(/Gäste aus anderen Welten/).click();
  await page.getByLabel("Welt des Gastes").selectOption("das-aschenland");
  await page.getByLabel("Gast-Eintrag").selectOption("aschenfuerst");
  await page.getByRole("button", { name: "Als Gast einbinden" }).click();
  await expect(page.getByText("Aschenfürst aus Das Aschenland")).toBeVisible();
  await page.getByLabel("Titel des neuen Kapitels").fill("Brandung");
  await page.getByRole("button", { name: "Kapitel anlegen" }).click();
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
  await page.getByRole("button", { name: "Die Kreideküste" }).click();
  await page.getByRole("button", { name: "Kanon", exact: true }).click();
  await page.getByRole("button", { name: "Tamsin" }).click();
  await expect(page.getByLabel("Text")).toHaveValue(
    "Lotsin an der Kreideküste.\n\nTamsin fürchtet tiefes Wasser.",
  );
  await page.locator("button.brand").click();
  await page.getByRole("button", { name: "Das Aschenland" }).click();
  await page.getByRole("button", { name: "Kanon", exact: true }).click();
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
  await page.getByRole("button", { name: "Geschichten" }).click();
  await page.getByLabel("Titel").fill("Nebelpfad");
  await page.getByRole("button", { name: "Geschichte anlegen" }).click();
  await page.getByLabel("Titel des neuen Kapitels").fill("Aufbruch");
  await page.getByRole("button", { name: "Kapitel anlegen" }).click();
  const model = page.getByRole("combobox", { name: "Modell", exact: true });
  await expect(model).toHaveValue("x-ai/grok-4.7");
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === "PATCH" &&
      response.url().endsWith("/stories/nebelpfad"),
  );
  await model.selectOption("x-ai/grok-4.6");
  expect((await saved).status()).toBe(200);

  await page.reload();
  await page.getByRole("button", { name: "Die Moorlande" }).click();
  await page.getByRole("button", { name: "Nebelpfad" }).click();
  await expect(
    page.getByRole("combobox", { name: "Modell", exact: true }),
  ).toHaveValue("x-ai/grok-4.6");

  await page.getByRole("button", { name: "Konto" }).click();
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
