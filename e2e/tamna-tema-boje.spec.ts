// Regresija: ".appShell[data-theme=...]" BEZ :global() ne radi u CSS modulima (nađeno uživo u Koraku 9f)
// - CSS moduli skaliraju i samu "appShell" klasu u lokalno ime ovog fajla, pa se nikad ne poklopi sa
// stvarnom, globalnom "appShell" klasom iz AppShell komponente, i tamna varijanta tiho ostaje
// neprimenjena (svetle boje čak i kad je tema tamna). Ovaj test proverava STVARNE izračunate boje
// (computed style), ne samo da li tekst/element postoji - greška u selektoru ne menja DOM, samo boju.
import { test, expect } from "@playwright/test";
import { e2eDb } from "./db";

test.describe.configure({ mode: "serial" });

let fakturaId = "";

test.beforeAll(() => {
  const { id } = e2eDb("create-paid-invoice", {
    klijent: "Acme",
    valuta: "RSD",
    iznos: 100000,
    datum: "2026-11-01",
  });
  fakturaId = id;
});

test.afterAll(() => {
  if (fakturaId) e2eDb("delete-invoice", { id: fakturaId });
});

for (const tema of ["light", "dark"] as const) {
  test(`${tema}: traka napretka i link 'Otvori' imaju boje iz frejma (Kp1/Kp4)`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: tema });
    await page.goto("/knjiga-prihoda");

    const traka = page
      .locator('[class*="glavnaKartica"]')
      .locator('[class*="traka"]:not([class*="trakaFoot"]):not([class*="trakaIspuna"])');
    await expect(traka).toHaveCSS(
      "background-color",
      tema === "dark" ? "rgb(38, 44, 40)" : "rgb(237, 234, 230)",
    );

    await page.getByRole("button", { name: /^Dinarski prihodi/ }).click();
    await page.locator("tbody tr", { hasText: "Acme" }).first().click();
    const link = page.getByRole("link", { name: "Otvori", exact: true });
    await expect(link).toHaveCSS(
      "color",
      tema === "dark" ? "rgb(241, 243, 239)" : "rgb(15, 42, 34)",
    );
  });
}
