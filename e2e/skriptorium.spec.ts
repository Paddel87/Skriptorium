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

test("taken-over AI text is appended to the chapter and saved", async ({
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
  await page.getByRole("button", { name: "Geschichten" }).click();
  await page.getByLabel("Titel").fill("Am Ufer");
  await page.getByRole("button", { name: "Geschichte anlegen" }).click();
  await page.getByLabel("Titel des neuen Kapitels").fill("Ankunft");
  await page.getByRole("button", { name: "Kapitel anlegen" }).click();
  await page.getByLabel("Manuskript").click();
  await page.keyboard.type("Das Boot lief auf Grund.");

  await page.getByRole("button", { name: "Weiterschreiben" }).click();
  await expect(page.getByLabel("Vorschlag der KI")).toHaveValue(
    "Nebel lag über dem Wasser.",
  );
  await page.getByRole("button", { name: "Übernehmen" }).click();
  await expect(page.getByLabel("Vorschlag der KI")).toBeHidden();
  expect(sent).toEqual({
    instruction: "",
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
