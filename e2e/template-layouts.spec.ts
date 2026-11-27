// Editor šablona fakture - dijalog "Raspored": primena Klasičan/Minimalan/Kompaktan STVARNO menja platno
// (zadatak: dopuna E2E testova, tačka 4; "Moderan" je već pokriven u template-editor.spec.ts).
// Klasičan i Minimalan su NAMERNO pikselski identični (invoice-templates.ts, primeniRaspored: "Minimalan
// nema frejm-osnovu za drugačiji raspored od Klasičnog pa ostaje identičan, iskreno, ne izmišljeno") - zato
// test prvo primeni Kompaktan (traka na vrhu postaje vidljiva), pa tek onda Minimalan/Klasičan, da "menja
// platno" bude nešto STVARNO vidljivo (traka nestaje), ne samo upis vrednosti bez ijednog promenjenog piksela.
import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  await page.goto("/fakture/sablon");
});

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage({ storageState: ".playwright/storageState.json" });
  await page.goto("/fakture/sablon");
  await page.getByRole("button", { name: "Vrati na podrazumevano" }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).not.toBeVisible({ timeout: 10_000 });
  await page.close();
});

function trakaNaVrhu(page: import("@playwright/test").Page) {
  return page.locator('[class*="InvoiceDoc"][class*="trakaVrh"]');
}

async function otvoriRaspored(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Raspored", exact: true }).click();
}

async function aktivnaKartica(page: import("@playwright/test").Page, naziv: string) {
  return page.locator('[class*="rasporedKartica"]', { hasText: naziv }).locator('[class*="rasporedOkvirIzabran"]');
}

test("primena 'Kompaktan' iz dijaloga prikazuje traku na vrhu - ostaje posle reload-a", async ({ page }) => {
  await expect(trakaNaVrhu(page)).toHaveCount(0); // "klasican", podrazumevano - bez trake

  await otvoriRaspored(page);
  await expect(await aktivnaKartica(page, "Klasičan")).toHaveCount(1);
  await page.getByRole("button", { name: "Kompaktan, traka na vrhu", exact: true }).click();
  await page.getByRole("button", { name: "Primeni raspored" }).click();
  await expect(trakaNaVrhu(page)).toHaveCount(1);

  await page.getByRole("button", { name: "Sačuvaj šablon" }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).not.toBeVisible({ timeout: 10_000 });

  await page.reload();
  await expect(trakaNaVrhu(page)).toHaveCount(1);
  await otvoriRaspored(page);
  await expect(await aktivnaKartica(page, "Kompaktan, traka na vrhu")).toHaveCount(1);
  await page.getByRole("button", { name: "Odustani", exact: true }).click();
});

test("primena 'Minimalan' pa 'Klasičan' vraća platno bez trake (nastavak prethodnog, raspored je 'Kompaktan')", async ({
  page,
}) => {
  await expect(trakaNaVrhu(page)).toHaveCount(1); // nasleđeno iz prethodnog testa (serial mode)

  await otvoriRaspored(page);
  await page.getByRole("button", { name: "Minimalan", exact: true }).click();
  await page.getByRole("button", { name: "Primeni raspored" }).click();
  await expect(trakaNaVrhu(page)).toHaveCount(0); // vidljiva promena u odnosu na Kompaktan

  await page.getByRole("button", { name: "Sačuvaj šablon" }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).not.toBeVisible({ timeout: 10_000 });
  await page.reload();
  await expect(trakaNaVrhu(page)).toHaveCount(0);
  await otvoriRaspored(page);
  await expect(await aktivnaKartica(page, "Minimalan")).toHaveCount(1);

  // Klasičan je pikselski identičan Minimalnom (vidi napomenu na vrhu fajla) - platno (traka) ostaje isto,
  // ali sam IZBOR rasporeda (layout polje, prikazan kao aktivna kartica u dijalogu) treba da se primeni i
  // ostane sačuvan.
  await page.getByRole("button", { name: "Klasičan", exact: true }).click();
  await page.getByRole("button", { name: "Primeni raspored" }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).toBeVisible();
  await expect(trakaNaVrhu(page)).toHaveCount(0);

  await page.getByRole("button", { name: "Sačuvaj šablon" }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).not.toBeVisible({ timeout: 10_000 });
  await page.reload();
  await otvoriRaspored(page);
  await expect(await aktivnaKartica(page, "Klasičan")).toHaveCount(1);
});
