// Editor šablona fakture - podešavanja NA NIVOU TABELE STAVKI (zadatak: dopuna E2E testova, tačka 2):
// uključivanje/isključivanje kolona, linije (okvir/horizontalne/bez), razmak redova, naizmenična boja
// redova, boja zaglavlja. Platno editora UVEK crta na engleskom (TemplateEditorClient.tsx, "Primer
// podataka": <InvoiceDoc jezik="en" .../>), zato su zaglavlja kolona ispod na engleskom (QTY/UNIT/PRICE/...).
// Isti obrazac kao template-blocks.spec.ts: serial mode, JEDNO čišćenje na kraju (afterAll).
import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  await page.goto("/fakture/sablon");
  await page.getByRole("button", { name: "Tabela" }).click();
});

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage({ storageState: ".playwright/storageState.json" });
  await page.goto("/fakture/sablon");
  await page.getByRole("button", { name: "Vrati na podrazumevano" }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).not.toBeVisible({ timeout: 10_000 });
  await page.close();
});

function tabelaStavki(page: import("@playwright/test").Page) {
  return page.locator('[class*="InvoiceDoc"][class*="tabelaItemi"]');
}

async function sacuvajIProveriPosleReload(page: import("@playwright/test").Page, provera: () => Promise<void>) {
  await page.getByRole("button", { name: "Sačuvaj šablon" }).click();
  await expect(page.getByText("Izmene nisu sačuvane")).not.toBeVisible({ timeout: 10_000 });
  await page.reload();
  await page.getByRole("button", { name: "Tabela" }).click();
  await provera();
}

test("kolone tabele: uključivanje 'Količina' i 'Cena' dodaje kolone na platnu - ostaje posle reload-a", async ({
  page,
}) => {
  // "Opis"/"Iznos" su jedine uključene po podrazumevanom (napraviPodrazumevaniSablonPodatke, table.cols).
  await expect(tabelaStavki(page).getByText("QTY", { exact: true })).toHaveCount(0);
  await expect(tabelaStavki(page).getByText("PRICE", { exact: true })).toHaveCount(0);

  await page.getByRole("switch", { name: "Uključi kolonu Količina" }).click();
  await page.getByRole("switch", { name: "Uključi kolonu Cena" }).click();
  await expect(tabelaStavki(page).getByText("QTY", { exact: true })).toBeVisible();
  await expect(tabelaStavki(page).getByText("PRICE", { exact: true })).toBeVisible();

  await sacuvajIProveriPosleReload(page, async () => {
    await expect(page.getByRole("switch", { name: "Uključi kolonu Količina" })).toHaveAttribute("aria-checked", "true");
    await expect(tabelaStavki(page).getByText("QTY", { exact: true })).toBeVisible();
    await expect(tabelaStavki(page).getByText("PRICE", { exact: true })).toBeVisible();
  });
});

test("linije: 'Bez' uklanja okvir i linije reda, 'Horizontalne' vraća samo linije reda - ostaje posle reload-a", async ({
  page,
}) => {
  // <table class="tabelaItemi"> je unutar div.stavke (klasaKlika/stilBloka), koji je unutar
  // div.tabela/.tabelaOkvir (InvoiceDoc.tsx) - zato dva nivoa gore, ne jedan.
  const omotTabele = tabelaStavki(page).locator("xpath=../..");
  const prviRed = tabelaStavki(page).locator("tbody tr").first();

  await expect(omotTabele).toHaveClass(/tabelaOkvir/); // "okvir", podrazumevano
  await expect(prviRed).toHaveClass(/linijaReda/);

  await page.getByRole("button", { name: "Bez", exact: true }).click();
  await expect(omotTabele).not.toHaveClass(/tabelaOkvir/);
  await expect(prviRed).not.toHaveClass(/linijaReda/);

  await page.getByRole("button", { name: "Horizontalne", exact: true }).click();
  await expect(omotTabele).not.toHaveClass(/tabelaOkvir/);
  await expect(prviRed).toHaveClass(/linijaReda/);

  await sacuvajIProveriPosleReload(page, async () => {
    await expect(page.getByRole("button", { name: "Horizontalne", exact: true })).toHaveClass(/segmentAktivan/);
    await expect(omotTabele).not.toHaveClass(/tabelaOkvir/);
    await expect(prviRed).toHaveClass(/linijaReda/);
  });
});

test("razmak redova i naizmenična boja redova menjaju platno - ostaje posle reload-a", async ({ page }) => {
  const prvoZaglavlje = tabelaStavki(page).locator("thead th").first();
  await expect(prvoZaglavlje).toHaveCSS("padding-top", "8px"); // "normalno", podrazumevano (8px 10px)

  await page.getByRole("button", { name: "Prostrano", exact: true }).click();
  await expect(prvoZaglavlje).toHaveCSS("padding-top", "12px"); // "prostrano" (12px 14px)

  // Naizmenična boja redova - samo DRUGI (neparni, i===1) red dobija klasu "zebra" (InvoiceDoc.tsx).
  const drugaFaktura = tabelaStavki(page).locator("tbody tr").nth(1);
  await expect(drugaFaktura).not.toHaveClass(/zebra/);
  await page.getByRole("switch", { name: "Naizmenična boja redova" }).click();
  await expect(drugaFaktura).toHaveClass(/zebra/);

  await sacuvajIProveriPosleReload(page, async () => {
    await expect(page.getByRole("button", { name: "Prostrano", exact: true })).toHaveClass(/segmentAktivan/);
    await expect(page.getByRole("switch", { name: "Naizmenična boja redova" })).toHaveAttribute("aria-checked", "true");
    const zaglavlje = tabelaStavki(page).locator("thead th").first();
    await expect(zaglavlje).toHaveCSS("padding-top", "12px");
    await expect(tabelaStavki(page).locator("tbody tr").nth(1)).toHaveClass(/zebra/);
  });
});

test("boja zaglavlja tabele menja platno - ostaje posle reload-a", async ({ page }) => {
  const redZaglavlja = tabelaStavki(page).locator("thead tr");
  await expect(redZaglavlja).toHaveCSS("background-color", "rgba(0, 0, 0, 0)"); // "#ffffff" = bez pozadine (bojaZaglavljaTabele)

  await page.getByRole("button", { name: "#1F4FBF" }).click();
  await expect(redZaglavlja).toHaveCSS("background-color", "rgb(31, 79, 191)");

  await sacuvajIProveriPosleReload(page, async () => {
    await expect(page.getByRole("button", { name: "#1F4FBF" })).toHaveClass(/svatchAktivan/);
    await expect(tabelaStavki(page).locator("thead tr")).toHaveCSS("background-color", "rgb(31, 79, 191)");
  });
});
