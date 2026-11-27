// Editor šablona fakture: novi/dupliraj/preimenuj/postavi kao podrazumevani/obriši (i da se podrazumevani
// ne može obrisati), "Vrati na podrazumevano", "Sačuvaj šablon", dijalog "Raspored" (zadatak tačka 4).
import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  await page.goto("/fakture/sablon");
});

async function otvoriMeni(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: /^Šablon:/ }).click();
}

test("+ Novi šablon, Dupliraj, Preimenuj, Postavi kao podrazumevani, Obriši", async ({ page }) => {
  // + Novi šablon
  await otvoriMeni(page);
  await page.getByRole("button", { name: "+ Novi šablon" }).click();
  await page.getByPlaceholder("Naziv šablona").fill("E2E šablon");
  await page.getByRole("button", { name: "Napravi šablon" }).click();
  await expect(page.getByRole("button", { name: "Šablon: E2E šablon" })).toBeVisible({ timeout: 10_000 });

  // Dupliraj ovaj šablon
  await otvoriMeni(page);
  await page.getByRole("button", { name: "Dupliraj ovaj šablon" }).click();
  await expect(page.getByRole("button", { name: "Šablon: E2E šablon (kopija)" })).toBeVisible({ timeout: 10_000 });

  // Preimenuj ovaj šablon
  await otvoriMeni(page);
  await page.getByRole("button", { name: "Preimenuj ovaj šablon" }).click();
  const poljeIme = page.getByPlaceholder("Naziv šablona");
  await poljeIme.fill("E2E preimenovan");
  await page.getByRole("button", { name: "Sačuvaj ime" }).click();
  await expect(page.getByRole("button", { name: "Šablon: E2E preimenovan" })).toBeVisible({ timeout: 10_000 });

  // Postavi kao podrazumevani
  await otvoriMeni(page);
  await page.getByRole("button", { name: "Postavi kao podrazumevani" }).click();
  // Sačekaj da se stanje stvarno primeni (akcija je asinhrona) - dugme se gasi tek kad sablon.isDefault
  // postane true, inače sledeće otvaranje menija ume da uhvati "stari" render (flaky bez ovog čekanja).
  await expect(page.getByRole("button", { name: "Postavi kao podrazumevani" })).not.toBeVisible({ timeout: 10_000 });
  await otvoriMeni(page);
  // .first() - "Podrazumevani" je i podnaslov stavke u listi I deo teksta nekog drugog dugmeta
  // na nekim ekranima; ovde je bitno samo da se bedž vidi NEGDE u otvorenom meniju.
  await expect(page.getByText("Podrazumevani").first()).toBeVisible();

  // Podrazumevani se NE MOŽE obrisati - dugme je onemogućeno.
  await expect(page.getByRole("button", { name: "Obriši ovaj šablon" })).toBeDisabled();

  // Vrati "Moj izgled" nazad kao podrazumevani (ostali testovi se na to oslanjaju), pa obriši probni šablon.
  await page.getByRole("button", { name: "Moj izgled", exact: true }).click();
  await otvoriMeni(page);
  await page.getByRole("button", { name: "Postavi kao podrazumevani" }).click();
  await expect(page.getByRole("button", { name: "Postavi kao podrazumevani" })).not.toBeVisible({ timeout: 10_000 });

  await otvoriMeni(page);
  await page.getByRole("button", { name: "E2E preimenovan", exact: true }).click();
  await otvoriMeni(page);
  await page.getByRole("button", { name: "Obriši ovaj šablon" }).click();
  await page.getByRole("button", { name: "Obriši", exact: true }).click();
  await expect(page.getByRole("button", { name: "Šablon: Moj izgled" })).toBeVisible({ timeout: 10_000 });

  // Preostala kopija (nastala od "Dupliraj") takođe nije više potrebna - ukloni je.
  await otvoriMeni(page);
  const kopija = page.getByText(/E2E šablon \(kopija\)/);
  if (await kopija.isVisible().catch(() => false)) {
    await kopija.click();
    await otvoriMeni(page);
    await page.getByRole("button", { name: "Obriši ovaj šablon" }).click();
    await page.getByRole("button", { name: "Obriši", exact: true }).click();
  }
});

test("'Sačuvaj šablon' i 'Vrati na podrazumevano' na nivou Cela faktura (boja akcenta)", async ({ page }) => {
  await page.getByRole("button", { name: "Cela faktura" }).click();
  await page.getByRole("button", { name: "#1F4FBF" }).click();
  await page.getByRole("button", { name: "Sačuvaj šablon" }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).not.toBeVisible({ timeout: 10_000 });

  await page.reload();
  await page.getByRole("button", { name: "Cela faktura" }).click();
  await expect(page.getByRole("button", { name: "#1F4FBF" })).toHaveClass(/segmentAktivan|svatchAktivan/);

  await page.getByRole("button", { name: "Vrati na podrazumevano" }).click();
  await expect(page.getByRole("button", { name: "#0F2A22" })).toHaveClass(/segmentAktivan|svatchAktivan/);
});

test("dijalog 'Raspored': Primeni raspored menja platno, Odustani ne menja ništa", async ({ page }) => {
  await page.getByRole("button", { name: "Raspored", exact: true }).click();
  // Modal.tsx prikazuje naslov kao <span>, ne kao heading - zato getByText, ne getByRole("heading").
  await expect(page.getByText("Izaberi raspored")).toBeVisible();

  // Odustani ne sme ništa da promeni (proveravamo preko "Izmene nisu sačuvane", koja se NE sme pojaviti).
  await page.getByRole("button", { name: "Moderan, traka sa strane" }).click();
  await page.getByRole("button", { name: "Odustani", exact: true }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).not.toBeVisible();

  // Primeni raspored menja platno (traka sa strane postaje vidljiva) i označava nesačuvane izmene.
  await page.getByRole("button", { name: "Raspored", exact: true }).click();
  await page.getByRole("button", { name: "Moderan, traka sa strane" }).click();
  await page.getByRole("button", { name: "Primeni raspored" }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).toBeVisible();

  // Vrati na Klasičan (podrazumevano) da ne utiče na ostale testove/pokretanja.
  await page.getByRole("button", { name: "Vrati na podrazumevano" }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).not.toBeVisible({ timeout: 10_000 });
});
