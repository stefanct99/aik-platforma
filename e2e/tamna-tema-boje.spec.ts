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
  test(`${tema}: traka napretka, podtabovi i link 'Otvori' imaju boje iz frejma (Kp1/Kp3/Kp4)`, async ({
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

    // Podtab "Devizni prihodi" je aktivan po podrazumevanom stanju - NAMERNO ista (skoro crna) boja u
    // obe teme (potvrđeno frejmom Kp1). "Dinarski prihodi" je neaktivan - pozadina/tekst su već iz tokena
    // teme (ispravni), samo ivica u tamnoj temi nije važila (ista greška kao .traka/.otvoriLink).
    const aktivan = page.getByRole("button", { name: /^Devizni prihodi/ });
    await expect(aktivan).toHaveCSS("background-color", "rgb(22, 26, 23)");
    await expect(aktivan).toHaveCSS("color", "rgb(255, 255, 255)");

    const neaktivan = page.getByRole("button", { name: /^Dinarski prihodi/ });
    await expect(neaktivan).toHaveCSS(
      "background-color",
      tema === "dark" ? "rgb(23, 27, 24)" : "rgb(255, 255, 255)",
    );
    await expect(neaktivan).toHaveCSS(
      "color",
      tema === "dark" ? "rgb(196, 202, 197)" : "rgb(74, 82, 76)",
    );
    // Pregledač zaokružuje alfa kanal computed-style vrednosti (0.148 -> 0.15) - potvrđeno uživo.
    await expect(neaktivan).toHaveCSS(
      "border-color",
      tema === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(22, 26, 23, 0.12)",
    );

    await neaktivan.click();
    await page.locator("tbody tr", { hasText: "Acme" }).first().click();
    const link = page.getByRole("link", { name: "Otvori", exact: true });
    await expect(link).toHaveCSS(
      "color",
      tema === "dark" ? "rgb(241, 243, 239)" : "rgb(15, 42, 34)",
    );
  });
}
