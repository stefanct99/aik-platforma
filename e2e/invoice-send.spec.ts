// Slanje fakture, zamrzavanje izgleda SAMO pri prvom slanju, "Pošalji ponovo" ne prepisuje snapshot, PDF
// ruta (zadatak tačka 4). Snapshot je unutrašnje polje koje UI ne prikazuje - e2eDb() (e2e/db.ts) čita/
// piše bazu direktno preko posebnog procesa (razlog: videti komentar u scripts/e2e-db.ts).
import { test, expect } from "@playwright/test";
import { e2eDb } from "./db";

async function posaljiNovuFakturu(page: import("@playwright/test").Page, opis: string) {
  await page.goto("/fakture/nova");
  await page.getByRole("button", { name: "Izaberi klijenta" }).click();
  await page.getByRole("button", { name: /Acme Inc\. \(E2E\)/ }).click();
  await page.getByPlaceholder("Opis stavke").fill(opis);
  await page.getByPlaceholder("Upiši iznos").fill("200");
  await page.getByRole("button", { name: "Pregledaj i pošalji" }).first().click();
  await page.getByRole("button", { name: "Pošalji fakturu" }).click();
  await expect(page.getByText(/je poslata/)).toBeVisible({ timeout: 10_000 });
  const broj = (await page.getByText(/Faktura .+ je poslata/).textContent())!.match(/Faktura (.+) je poslata/)![1];
  return broj;
}

test("slanje nove fakture: potvrda na ekranu, status 'poslata', zamrznut snapshot u bazi", async ({ page }) => {
  const broj = await posaljiNovuFakturu(page, "E2E slanje");

  const faktura = e2eDb("invoice-by-number", { number: broj });
  expect(faktura.status).toBe("poslata");
  expect(faktura.templateSnapshot).not.toBeNull();
});

test("'Preuzmi PDF' otvara ispravan PDF", async ({ page, context }) => {
  await posaljiNovuFakturu(page, "E2E PDF");

  // Ruta vraća Content-Disposition: attachment - window.open(...) odmah postaje preuzimanje (download),
  // ne navigabilna stranica, zato context.waitForEvent("download") a ne "page"/"response".
  const [preuzimanje] = await Promise.all([
    context.waitForEvent("download"),
    page.getByRole("button", { name: "Preuzmi PDF" }).click(),
  ]);
  expect(preuzimanje.suggestedFilename()).toMatch(/\.pdf$/);

  const putanja = await preuzimanje.path();
  const { readFileSync } = await import("node:fs");
  const telo = readFileSync(putanja!);
  // %PDF- je potpis PDF formata na početku svakog validnog fajla.
  expect(telo.subarray(0, 5).toString("latin1")).toBe("%PDF-");
});

test("'Pošalji ponovo' menja istoriju ali NE prepisuje zamrznut izgled", async ({ page }) => {
  const broj = await posaljiNovuFakturu(page, "E2E posalji ponovo");

  const pre = e2eDb("invoice-by-number", { number: broj });
  const snimakPre = pre.templateSnapshot;

  // Namerno izmeni šablon firme IZMEĐU prvog i drugog slanja - ako bi "Pošalji ponovo" ponovo čitao
  // trenutni šablon umesto da koristi zamrznutu kopiju, ova promena bi "procurila" u već poslatu fakturu.
  e2eDb("set-default-template-accent", { accentColor: "#B4281E" });

  await page.goto(`/fakture/posalji-ponovo/${pre.id}`);
  await page.getByRole("button", { name: "Pošalji fakturu" }).click();
  await expect(page.getByText("ponovo poslata")).toBeVisible({ timeout: 10_000 });

  const posle = e2eDb("invoice-by-number", { number: broj });
  expect(posle.templateSnapshot).toEqual(snimakPre);

  // Vrati akcenat boju (drugi testovi/pokretanja se oslanjaju na podrazumevan izgled firme).
  e2eDb("set-default-template-accent", { accentColor: "#0F2A22" });
});
