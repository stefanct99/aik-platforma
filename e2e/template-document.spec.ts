// Editor šablona fakture - podešavanja NA NIVOU CELE FAKTURE (zadatak: dopuna E2E testova, tačka 3):
// margine, tekst u podnožju, veličina loga, oblik loga. Isti obrazac kao ostali novi template-*.spec.ts
// fajlovi: serial mode, JEDNO čišćenje na kraju (afterAll, "Vrati na podrazumevano").
import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  await page.goto("/fakture/sablon");
  await page.getByRole("button", { name: "Cela faktura" }).click();
});

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage({ storageState: ".playwright/storageState.json" });
  await page.goto("/fakture/sablon");
  await page.getByRole("button", { name: "Vrati na podrazumevano" }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).not.toBeVisible({ timeout: 10_000 });
  await page.close();
});

function platno(page: import("@playwright/test").Page) {
  return page.locator('[class*="InvoiceDoc"][class*="papir"]');
}

async function sacuvajIProveriPosleReload(page: import("@playwright/test").Page, provera: () => Promise<void>) {
  await page.getByRole("button", { name: "Sačuvaj šablon" }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).not.toBeVisible({ timeout: 10_000 });
  await page.reload();
  await page.getByRole("button", { name: "Cela faktura" }).click();
  await provera();
}

test("margine menjaju platno (padding papira) - ostaje posle reload-a", async ({ page }) => {
  await expect(platno(page)).toHaveCSS("padding-top", "32px"); // "srednje", podrazumevano

  await page.getByRole("button", { name: "Uske", exact: true }).click();
  await expect(platno(page)).toHaveCSS("padding-top", "16px");

  await sacuvajIProveriPosleReload(page, async () => {
    await expect(page.getByRole("button", { name: "Uske", exact: true })).toHaveClass(/segmentAktivan/);
    await expect(platno(page)).toHaveCSS("padding-top", "16px");
  });
});

test("tekst u podnožju se pojavljuje na platnu - ostaje posle reload-a", async ({ page }) => {
  const tekst = `E2E podnožje ${Date.now()}`;
  await expect(platno(page).getByText(tekst)).toHaveCount(0);

  await page.getByPlaceholder("Npr. Hvala na saradnji").fill(tekst);
  await expect(platno(page).getByText(tekst)).toBeVisible();

  await sacuvajIProveriPosleReload(page, async () => {
    await expect(page.getByPlaceholder("Npr. Hvala na saradnji")).toHaveValue(tekst);
    await expect(platno(page).getByText(tekst)).toBeVisible();
  });
});

test("veličina i oblik loga menjaju platno - ostaje posle reload-a", async ({ page }) => {
  const logo = platno(page).locator('[class*="InvoiceDoc"][class*="logo"]');
  await expect(logo).toHaveCSS("width", "44px"); // "srednji", podrazumevano
  await expect(logo).toHaveCSS("border-radius", "8px"); // "kvadrat", podrazumevano

  await page.getByRole("button", { name: "Veliki", exact: true }).click();
  await expect(logo).toHaveCSS("width", "56px");

  await page.getByRole("button", { name: "Krug", exact: true }).click();
  await expect(logo).toHaveCSS("border-radius", "50%");

  await sacuvajIProveriPosleReload(page, async () => {
    await expect(page.getByRole("button", { name: "Veliki", exact: true })).toHaveClass(/segmentAktivan/);
    await expect(page.getByRole("button", { name: "Krug", exact: true })).toHaveClass(/segmentAktivan/);
    await expect(logo).toHaveCSS("width", "56px");
    await expect(logo).toHaveCSS("border-radius", "50%");
  });
});
