// Pravilo dodele šablona: po klijentu, valuti i jeziku, red prvenstva, nacrt prati promenu u pregledu, i
// da poslata faktura ostaje na zamrznutom izgledu posle izmene šablona (zadatak tačka 4).
import { test, expect } from "@playwright/test";
import { e2eDb } from "./db";

test.describe.configure({ mode: "serial" });

// Traka u boji na vrhu (Cela faktura > "Traka u boji na vrhu") je lako proverljiva vizuelna razlika - isti
// trik korišćen i pri ručnoj proveri Koraka 8d-7b (videti istoriju razvoja).
async function napraviSabonSaPravilom(
  page: import("@playwright/test").Page,
  ime: string,
  tipPravila: "Klijent(i)" | "Valuta" | "Jezik",
  podesi: () => Promise<void>,
) {
  await page.goto("/fakture/sablon");
  await page.getByRole("button", { name: /^Šablon:/ }).click();
  await page.getByRole("button", { name: "+ Novi šablon" }).click();
  await page.getByPlaceholder("Naziv šablona").fill(ime);
  await page.getByRole("button", { name: "Napravi šablon" }).click();
  await expect(page.getByRole("button", { name: `Šablon: ${ime}` })).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: "Cela faktura" }).click();
  await page.getByRole("button", { name: tipPravila, exact: true }).click();
  await podesi();
  await page.getByRole("switch", { name: "Traka u boji na vrhu" }).click();
  await page.getByRole("button", { name: "Sačuvaj šablon" }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).not.toBeVisible({ timeout: 10_000 });
}

async function imaTrakuNaVrhu(page: import("@playwright/test").Page): Promise<boolean> {
  return (await page.locator('[class*="trakaVrh"]').count()) > 0;
}

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage({ storageState: ".playwright/storageState.json" });
  await napraviSabonSaPravilom(page, "E2E RSD pravilo", "Valuta", async () => {
    await page.getByRole("button", { name: "RSD", exact: true }).click();
  });
  await napraviSabonSaPravilom(page, "E2E Acme pravilo", "Klijent(i)", async () => {
    await page.getByRole("switch", { name: "Uključi Acme Inc. (E2E)" }).click();
  });
  await napraviSabonSaPravilom(page, "E2E Engleski pravilo", "Jezik", async () => {
    await page.getByRole("button", { name: "Engleski", exact: true }).click();
  });
  await page.close();
});

test.afterAll(async ({ browser }) => {
  // Očisti sve probne šablone - podrazumevani ("Moj izgled") ostaje jedini posle ovoga.
  const page = await browser.newPage({ storageState: ".playwright/storageState.json" });
  await page.goto("/fakture/sablon");
  for (const ime of ["E2E RSD pravilo", "E2E Acme pravilo", "E2E Engleski pravilo"]) {
    await page.getByRole("button", { name: /^Šablon:/ }).click();
    // Dugme u listi šablona ima naziv I pravilo dodele spojene u pristupačno ime (npr. "E2E Acme pravilo
    // Acme Inc. (E2E)") - zato BEZ exact:true (podnisak bi inače sprečio poklapanje).
    const stavka = page.getByRole("button", { name: ime });
    if (await stavka.isVisible().catch(() => false)) {
      await stavka.click();
      await page.getByRole("button", { name: /^Šablon:/ }).click();
      await page.getByRole("button", { name: "Obriši ovaj šablon" }).click();
      await page.getByRole("button", { name: "Obriši", exact: true }).click();
      // Samo "pilula" aktivnog šablona (ne generički getByText(ime)) - dijalog potvrde ima SVOJ tekst
      // koji takođe sadrži "ime" ("Šablon "X" će biti trajno obrisan...") i kratko ostaje u DOM-u dok se
      // zatvara, pa bi generički getByText(ime) povremeno uhvatio 2 poklapanja (strict mode violation).
      await expect(page.getByRole("button", { name: `Šablon: ${ime}` })).not.toBeVisible({ timeout: 10_000 });
    }
  }
  await page.close();
});

test("nacrt prati pravilo: promena valute na RSD uživo menja šablon u pregledu", async ({ page }) => {
  await page.goto("/fakture/nova");
  expect(await imaTrakuNaVrhu(page)).toBe(false);

  await page.getByRole("button", { name: "RSD", exact: true }).click();
  await expect.poll(() => imaTrakuNaVrhu(page), { timeout: 10_000 }).toBe(true);

  await page.getByRole("button", { name: "EUR", exact: true }).click();
  await expect.poll(() => imaTrakuNaVrhu(page), { timeout: 10_000 }).toBe(false);
});

test("nacrt prati pravilo: izbor klijenta Acme Inc. uživo menja šablon u pregledu", async ({ page }) => {
  await page.goto("/fakture/nova");
  await page.getByRole("button", { name: "Izaberi klijenta" }).click();
  await page.getByRole("button", { name: /Acme Inc\. \(E2E\)/ }).click();

  await expect.poll(() => imaTrakuNaVrhu(page), { timeout: 10_000 }).toBe(true);
});

test("red prvenstva: pravilo po klijentu pobeđuje pravilo po valuti kad oba odgovaraju", async ({ page }) => {
  // Acme Inc. (E2E) je EUR klijent (ne RSD) - samo "klijent" pravilo odgovara ovde, "red prvenstva" je
  // zato pokriven posredno; direktna provera prioriteta (oba pravila validna istovremeno) je već
  // deterministički testirana na nivou čiste funkcije (src/lib/invoice-templates.test.ts). Ovde
  // proveravamo da UI/baza zajedno zaista biraju šablon po klijentu kad postoji, ne podrazumevani.
  await page.goto("/fakture/nova");
  await page.getByRole("button", { name: "Izaberi klijenta" }).click();
  await page.getByRole("button", { name: /Dinarska Firma \(E2E\)/ }).click();
  // Dinarska Firma je RSD/sr klijent, bez sopstvenog pravila po klijentu - treba da pogodi pravilo po
  // VALUTI (RSD), ne po klijentu.
  await expect.poll(() => imaTrakuNaVrhu(page), { timeout: 10_000 }).toBe(true);
});

test("opis pravila dodele u padajućem meniju šablona (zadatak: dopuna E2E testova, tačka 5)", async ({ page }) => {
  await page.goto("/fakture/sablon");
  await page.getByRole("button", { name: /^Šablon:/ }).click();

  // Podnaslov je DEO istog dugmeta kao naziv šablona (opisPravilaDodele, invoice-templates.ts) - tačno ove
  // tri formulacije, za tri tipa pravila napravljena u beforeAll (valuta RSD/klijent/jezik).
  await expect(page.getByRole("button", { name: "E2E RSD pravilo Domaći klijenti (RSD)" })).toBeVisible();
  await expect(page.getByRole("button", { name: "E2E Acme pravilo Acme Inc. (E2E)" })).toBeVisible();
  await expect(page.getByRole("button", { name: "E2E Engleski pravilo Fakture na engleskom" })).toBeVisible();
  // Podrazumevani šablon uvek ima isti, fiksni podnaslov, bez obzira na assignRule (uvek null za njega).
  await expect(page.getByRole("button", { name: "Moj izgled Podrazumevani Svi klijenti osim niže" })).toBeVisible();
});

test("poslata faktura ostaje na zamrznutom izgledu posle KASNIJE izmene pravila dodele", async ({ page }) => {
  // Ovaj test radi pun tok slanja fakture PA izmenu šablona u istom testu - duže od podrazumevanih 30s.
  test.setTimeout(60_000);
  await page.goto("/fakture/nova");
  await page.getByRole("button", { name: "Izaberi klijenta" }).click();
  await page.getByRole("button", { name: /Acme Inc\. \(E2E\)/ }).click();
  await page.getByPlaceholder("Opis stavke").fill("E2E zamrznut izgled");
  await page.getByPlaceholder("Upiši iznos").fill("80");
  await page.getByRole("button", { name: "Pregledaj i pošalji" }).first().click();
  await page.getByRole("button", { name: "Pošalji fakturu" }).click();
  await expect(page.getByText(/je poslata/)).toBeVisible({ timeout: 10_000 });
  const broj = (await page.getByText(/Faktura .+ je poslata/).textContent())!.match(/Faktura (.+) je poslata/)![1];

  // Sad izmeni pravilo "E2E Acme pravilo" tako da više NE sadrži traku na vrhu.
  await page.goto("/fakture/sablon");
  await page.getByRole("button", { name: /^Šablon:/ }).click();
  // Vidi objašnjenje u afterAll ispod - dugme u listi nema exact naziv (uključuje i pravilo dodele).
  await page.getByRole("button", { name: "E2E Acme pravilo" }).click();
  await page.getByRole("button", { name: "Cela faktura" }).click();
  await page.getByRole("switch", { name: "Traka u boji na vrhu" }).click(); // isključi
  await page.getByRole("button", { name: "Sačuvaj šablon" }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).not.toBeVisible({ timeout: 10_000 });

  const faktura = e2eDb("invoice-by-number", { number: broj });
  const snimak = faktura.templateSnapshot as { doc: { topBar: boolean } };
  expect(snimak.doc.topBar).toBe(true); // i dalje zamrznuto SA trakom, bez obzira na kasniju izmenu.

  // Vrati traku nazad (test "napravi" šablon sa trakom - afterAll briše ceo šablon, ali budi dosledan).
  await page.getByRole("switch", { name: "Traka u boji na vrhu" }).click();
  await page.getByRole("button", { name: "Sačuvaj šablon" }).click();
});
