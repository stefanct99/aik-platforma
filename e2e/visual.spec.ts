// Vizuelne provere (zadatak tačka 5) - prave slike i PRIJAVLJUJU razlike (overlap, horizontalni skrol,
// prelomljen tekst u tabelama), ali NIKAD ne obaraju testove: nijedan "expect" ovde ne sme da baci grešku
// - nalazi se samo PRIKAČUJU uz test (testInfo.attach) i ispisuju u konzoli, test uvek završava "passed".
// Tema se menja preko page.emulateMedia (prefers-color-scheme), NE preko klika na pravi prekidač teme -
// to bi upisalo "tamni"/"svetli" u bazu za probni nalog (trajna promena, umesto čisto vizuelne provere za
// ovaj jedan screenshot). Pretpostavlja da probni nalog ima temu "sistem" (seed je ne menja).
import { test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { e2eDb } from "./db";

const SIRINE = [1280, 1440, 1920, 2560];
const TEME: ("light" | "dark")[] = ["light", "dark"];
const FOLDER = "test-results/screenshots";

type Nalaz = { stranica: string; sirina: number; tema: string; problemi: string[] };

async function proveriRaspored(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const problemi: string[] = [];
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) {
      problemi.push(
        `Horizontalni skrol: scrollWidth=${document.documentElement.scrollWidth} > clientWidth=${document.documentElement.clientWidth}`,
      );
    }
    // Prelomljen tekst u tabelama: ćelija čiji scrollWidth premašuje clientWidth (tekst se ne vidi ceo).
    // NAMERNO skraćen tekst (white-space:nowrap + overflow:hidden + text-overflow:ellipsis) SA naslovom
    // (title na ćeliji ili unutra, pun tekst na hover) nije greška - to je upravo traženo ponašanje
    // (zadatak: "skrati sa elipsom, ceo tekst na hover") i uvek ima scrollWidth > clientWidth po definiciji
    // elipse - zato se takva ćelija ne prijavljuje.
    document.querySelectorAll("table td, table th").forEach((cel) => {
      if (cel.scrollWidth <= cel.clientWidth + 2) return;
      const stil = getComputedStyle(cel);
      const imaElipsu = stil.textOverflow === "ellipsis" && stil.overflow === "hidden" && stil.whiteSpace === "nowrap";
      const imaNaslov = cel.hasAttribute("title") || cel.querySelector("[title]") !== null;
      if (imaElipsu && imaNaslov) return;
      problemi.push(`Tabela: tekst ne staje u ćeliju "${cel.textContent?.trim().slice(0, 40)}"`);
    });
    // Preklapanje glavnih blokova: bočni meni (već ima aria-label u aplikaciji, bez izmene koda) i glavni
    // sadržaj (semantički <main>, već postoji u AppShell-u) ne smeju geometrijski da se seku. Stranice bez
    // ljuske aplikacije (editor fakture/šablona - pun ekran, namerno bez menija) nemaju ova dva elementa
    // istovremeno, pa se provera za njih tiho preskače.
    const meni = document.querySelector<HTMLElement>('nav[aria-label="Glavni meni"]');
    const sadrzaj = document.querySelector<HTMLElement>("main");
    if (meni && sadrzaj) {
      const a = meni.getBoundingClientRect();
      const b = sadrzaj.getBoundingClientRect();
      const preklapanje = !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
      if (preklapanje) problemi.push("Preklapanje: bočni meni i glavni sadržaj (<main>) se geometrijski seku.");
    }
    return problemi;
  });
}

const STRANICE: { naziv: string; putanja: string; blokovi?: string }[] = [
  { naziv: "fakture-lista", putanja: "/fakture" },
  { naziv: "nova-faktura", putanja: "/fakture/nova" },
  { naziv: "klijenti", putanja: "/fakture/klijenti" },
  { naziv: "ponavljajuce", putanja: "/fakture/ponavljajuce" },
  { naziv: "editor-sablona", putanja: "/fakture/sablon" },
  // "knjiga-prihoda" (ova provera) se oslanja na to da e2e-run.ts pokreće CEO paket u jednom probnom
  // nalogu, bez resetovanja baze između fajlova - knjiga-prihoda.spec.ts (abecedno pre ovog fajla, pa se
  // izvršava pre njega) ostavi za sobom redove sa STVARNIM kursom/dinarskom protivvrednošću (Korak 9b) i
  // namerno dug broj fakture (Korak 6), pa generička provera ispod (scrollWidth > clientWidth, bez
  // elipse+title) automatski pokriva i te kolone/vrednosti - ne samo prazno/"–" stanje.
  { naziv: "knjiga-prihoda", putanja: "/knjiga-prihoda" },
];

test.describe.configure({ mode: "serial" });

let detaljPutanja = "";

test.beforeAll(async () => {
  mkdirSync(FOLDER, { recursive: true });
  const { id } = e2eDb("create-draft-invoice");
  detaljPutanja = `/fakture/${id}`;
});

test.afterAll(async () => {
  if (detaljPutanja) {
    const id = detaljPutanja.split("/").pop()!;
    e2eDb("delete-invoice", { id });
  }
});

for (const tema of TEME) {
  for (const sirina of SIRINE) {
    test(`${tema}/${sirina}px: ključne stranice`, async ({ page }, testInfo) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.setViewportSize({ width: sirina, height: 900 });

      const sveStranice = [...STRANICE, { naziv: "detalj-fakture", putanja: detaljPutanja }];
      const naliziUkupno: Nalaz[] = [];

      for (const { naziv, putanja } of sveStranice) {
        await page.goto(putanja);
        await page.waitForLoadState("networkidle").catch(() => {});
        const problemi = await proveriRaspored(page);
        if (problemi.length > 0) naliziUkupno.push({ stranica: naziv, sirina, tema, problemi });

        const fajl = `${FOLDER}/${naziv}_${tema}_${sirina}.png`;
        await page.screenshot({ path: fajl, fullPage: true }).catch(() => {});
      }

      if (naliziUkupno.length > 0) {
        const tekst = naliziUkupno
          .map((n) => `${n.stranica} (${n.tema}, ${n.sirina}px):\n  - ${n.problemi.join("\n  - ")}`)
          .join("\n\n");
        console.log(`\n[vizuelna provera - nalazi, NE obaraju test]\n${tekst}\n`);
        await testInfo.attach(`nalazi-${tema}-${sirina}`, { body: tekst, contentType: "text/plain" });
      }
      // Namerno NEMA expect() ovde - zadatak tačka 5: ovaj test nikad ne sme da padne.
    });
  }
}
