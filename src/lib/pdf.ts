// PDF fakture (Korak 8a, tačka 6): generiše se na serveru tako što headless Chrome otvori STVARNU
// stranicu aplikacije (/fakture/<id>/dokument, bez ljuske aplikacije) koja crta ISTU <InvoiceDoc>
// komponentu kao pregled uživo - "mora da izgleda isto" je zato zagarantovano (isti kod, ne dva odvojena
// prikaza), ne poseban PDF-generator sa svojim rasporedom.
//
// Tehnička odluka (spec 10.1, Claude Code sme da predloži uz obrazloženje): puppeteer-core (bez
// sopstvenog preuzetog Chromium-a, mnogo lakša instalacija) + Stefanov već instaliran Google Chrome na
// ovoj razvojnoj mašini. Ovo NIJE spremno za produkciju (server u produkciji neće imati Google Chrome.app
// na ovoj tačnoj putanji) - do tada treba ili pravi Chromium instaliran na serveru (npr.
// @sparticuz/chromium za serverless, ili obična instalacija u Docker slici), putanja se već može
// prebaciti preko CHROME_PATH env promenljive. Navedeno u izveštaju Koraka 8a.
import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";

const MOGUCE_PUTANJE = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter((p): p is string => !!p);

function pronadjiChrome(): string {
  const putanja = MOGUCE_PUTANJE.find((p) => existsSync(p));
  if (!putanja) {
    throw new Error(
      "Chrome/Chromium nije pronađen ni na jednoj poznatoj putanji. Postavi CHROME_PATH u .env.local.",
    );
  }
  return putanja;
}

export async function renderujFakturuUPdf(url: string, kolacic: string): Promise<Buffer> {
  const browser = await puppeteer.launch({ executablePath: pronadjiChrome(), headless: true });
  try {
    const page = await browser.newPage();
    const adresa = new URL(url);
    if (kolacic) {
      const parovi = kolacic.split(";").map((deo) => deo.trim());
      for (const par of parovi) {
        const indeks = par.indexOf("=");
        if (indeks < 0) continue;
        await page.setCookie({
          name: par.slice(0, indeks),
          value: par.slice(indeks + 1),
          domain: adresa.hostname,
          path: "/",
        });
      }
    }
    await page.goto(url, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      width: "480px",
      height: "680px",
      printBackground: true,
      pageRanges: "1",
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

// Izvoz Knjige prihoda (Korak 9g-2) - BEZ navigacije na stvarnu stranicu aplikacije (nema frejm/izgled
// koji bi React komponenta crtala, zadatak ga opisuje tekstualno) - page.setContent(html) direktno, isti
// Chrome/puppeteer-core kao fakture, ali POTPUNO odvojena funkcija: faktura je fiksne veličine i JEDNA
// strana (pageRanges:"1"), Knjiga prihoda je A4 pejzaž sa promenljivim brojem redova/strana - zato
// renderujFakturuUPdf ostaje netaknuta, ne sme da se ponovo iskoristi za ovo (zadatak).
export async function renderujIzvozUPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({ executablePath: pronadjiChrome(), headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: { top: "14mm", bottom: "16mm", left: "12mm", right: "12mm" },
      // "Strana X od Y" (zadatak) - Puppeteer-ov ugrađeni footerTemplate mehanizam (pageNumber/
      // totalPages su posebne klase koje Puppeteer sam popunjava, ne obična promenljiva). headerTemplate
      // mora biti neprazan string - prazan div ovde SAMO gasi Puppeteer-ov PODRAZUMEVANI header (naslov
      // stranice + datum), koji ne želimo; stvarno zaglavlje dokumenta (firma/period/datum izrade) je deo
      // HTML sadržaja (napraviIzvozHtml), prikazuje se SAMO na prvoj strani (zadatak), ne na svakoj.
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `<div style="width:100%;font-size:9px;text-align:center;color:#4a524c;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Strana <span class="pageNumber"></span> od <span class="totalPages"></span></div>`,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
