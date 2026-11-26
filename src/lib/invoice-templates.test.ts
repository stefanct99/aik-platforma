import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import { saveOnboardingStep1 } from "./business";
import {
  napraviPodrazumevaniSablonPodatke,
  vidljiviBlokovi,
  poredakUGrupi,
  stilBloka,
  marginePapira,
  velicinaLoga,
  oblikLoga,
  bojaZaglavljaTabele,
  razmakRedovaTabele,
  imaOkvirTabele,
  imaLinijeRedovaTabele,
  definicijeKolonaTabele,
  type PodaciSablona,
} from "./invoice-templates";
import { osigurajPodrazumevaniSablon, ucitajSablonZaFakturu } from "./invoice-templates-db";

// Integracioni testovi (aik_test), isti obrazac kao src/lib/invoices.test.ts: svaki test pravi sopstvenog
// korisnika/firmu sa nasumičnim podacima, sve se briše na kraju (Business ima onDelete:Cascade na
// InvoiceTemplate, pa brisanje firme obriše i njene šablone).

const napravljeniKorisnici: string[] = [];

function nasumicniPib() {
  return String(Math.floor(100000000 + Math.random() * 899999999));
}

async function napraviKorisnikaSaFirmom() {
  const korisnik = await prisma.user.create({
    data: { id: randomUUID(), name: "Test korisnik", email: `test-${randomUUID()}@primer.rs` },
  });
  napravljeniKorisnici.push(korisnik.id);
  await saveOnboardingStep1(korisnik.id, {
    ownerName: "Test",
    name: "Test Firma",
    pib: nasumicniPib(),
    mb: "11112222",
    delatnostCode: "6201",
    delatnostName: "Računarsko programiranje",
    regDate: new Date("2024-01-01"),
  });
  const biznis = await prisma.business.findFirstOrThrow({ where: { ownerId: korisnik.id } });
  return { korisnik, biznis };
}

afterAll(async () => {
  await prisma.business.deleteMany({ where: { ownerId: { in: napravljeniKorisnici } } });
  await prisma.user.deleteMany({ where: { id: { in: napravljeniKorisnici } } });
});

describe("napraviPodrazumevaniSablonPodatke - čista funkcija", () => {
  it("vraća podrazumevani šablon sa svih 11 blokova, u redosledu iz prototipa", () => {
    const podaci = napraviPodrazumevaniSablonPodatke();
    expect(podaci.name).toBe("Moj izgled");
    expect(podaci.isDefault).toBe(true);
    expect(podaci.layout).toBe("klasican");
    expect(podaci.blocks).toEqual([
      "logo",
      "datum",
      "broj",
      "klijent",
      "firma",
      "banka",
      "stavke",
      "ukupno",
      "rok",
      "napomena",
      "potpis",
    ]);
    expect(Object.keys(podaci.blockProps)).toHaveLength(11);
  });

  it("isključuje 'potpis' po podrazumevanom (današnji InvoiceDoc nema red za potpis)", () => {
    const podaci = napraviPodrazumevaniSablonPodatke();
    expect(podaci.blocksOff).toEqual(["potpis"]);
  });

  it("nema pravilo dodele (podrazumevani šablon važi za sve klijente)", () => {
    expect(napraviPodrazumevaniSablonPodatke().assignRule).toBeNull();
  });

  it("dve odvojene pozive vraćaju nove, nezavisne objekte (bez deljenog stanja)", () => {
    const a = napraviPodrazumevaniSablonPodatke();
    const b = napraviPodrazumevaniSablonPodatke();
    a.blockProps.logo.x = 999;
    expect(b.blockProps.logo.x).toBe(32);
  });
});

describe("osigurajPodrazumevaniSablon", () => {
  it("nova firma (saveOnboardingStep1) automatski dobija tačno jedan podrazumevani šablon", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const sabloni = await prisma.invoiceTemplate.findMany({ where: { businessId: biznis.id } });
    expect(sabloni).toHaveLength(1);
    expect(sabloni[0].isDefault).toBe(true);
    expect(sabloni[0].name).toBe("Moj izgled");
  });

  it("ponovljen poziv ne pravi drugi podrazumevani šablon (firma ne može imati dva)", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const prvi = await osigurajPodrazumevaniSablon(biznis.id);
    const drugi = await osigurajPodrazumevaniSablon(biznis.id);
    expect(drugi.id).toBe(prvi.id);
    const sabloni = await prisma.invoiceTemplate.findMany({ where: { businessId: biznis.id, isDefault: true } });
    expect(sabloni).toHaveLength(1);
  });

  it("firma bez šablona (stanje pre migracije) dobija šablon identičan čistoj funkciji", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    // Simulira firmu napravljenu PRE Koraka 8d-1 (backfill skripta nailazi na ovakvo stanje).
    await prisma.invoiceTemplate.deleteMany({ where: { businessId: biznis.id } });

    const sablon = await osigurajPodrazumevaniSablon(biznis.id);
    const ocekivano = napraviPodrazumevaniSablonPodatke();
    expect(sablon.name).toBe(ocekivano.name);
    expect(sablon.isDefault).toBe(true);
    expect(sablon.blocks).toEqual(ocekivano.blocks);
    expect(sablon.blocksOff).toEqual(ocekivano.blocksOff);
    expect(sablon.blockProps).toEqual(ocekivano.blockProps);
    expect(sablon.table).toEqual(ocekivano.table);
    expect(sablon.doc).toEqual(ocekivano.doc);
    expect(sablon.assignRule).toBeNull();
  });
});

describe("ucitajSablonZaFakturu", () => {
  it("vraća templateSnapshot kad postoji, bez dodirivanja baze", async () => {
    const snimak = napraviPodrazumevaniSablonPodatke();
    snimak.accentColor = "#B4281E"; // bilo šta prepoznatljivo, da se vidi da JESTE snimak, ne podrazumevani
    const rezultat = await ucitajSablonZaFakturu({ businessId: "ne-postoji-nije-ni-bitno", templateSnapshot: snimak });
    expect(rezultat).toEqual(snimak);
  });

  it("vraća podrazumevani šablon firme kad nema templateSnapshot-a", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const rezultat = await ucitajSablonZaFakturu({ businessId: biznis.id, templateSnapshot: null });
    expect(rezultat).toEqual(napraviPodrazumevaniSablonPodatke());
  });
});

describe("vidljiviBlokovi i poredakUGrupi - čiste funkcije (Korak 8d-2)", () => {
  it("izbacuje isključene blokove, čuva redosled iz šablona", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    sablon.blocksOff = ["datum", "potpis"];
    expect(vidljiviBlokovi(sablon)).toEqual([
      "logo",
      "broj",
      "klijent",
      "firma",
      "banka",
      "stavke",
      "ukupno",
      "rok",
      "napomena",
    ]);
  });

  it("podrazumevano: 'potpis' je jedini isključen blok", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    expect(vidljiviBlokovi(sablon)).not.toContain("potpis");
    expect(vidljiviBlokovi(sablon)).toHaveLength(10);
  });

  it("poredakUGrupi poštuje ručno promenjen redosled unutar šablona", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    // Korisnik je u editoru prevukao "klijent" iznad "broj".
    sablon.blocks = ["logo", "datum", "klijent", "broj", "firma", "banka", "stavke", "ukupno", "rok", "napomena", "potpis"];
    expect(poredakUGrupi(sablon, ["broj", "klijent"])).toEqual(["klijent", "broj"]);
  });

  it("poredakUGrupi izbacuje isključeni blok iz grupe", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    sablon.blocksOff = ["banka"];
    expect(poredakUGrupi(sablon, ["firma", "banka"])).toEqual(["firma"]);
  });
});

describe("stilBloka - čista funkcija (Korak 8d-2)", () => {
  it("podrazumevani stil 'broj' bloka odgovara današnjem .brojFakture (0.875rem)", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    expect(stilBloka(sablon, "broj")).toEqual({
      color: "#111",
      fontSize: "0.875rem",
      fontFamily: "Arial, Inter, sans-serif",
      textAlign: "left",
    });
  });

  it("podrazumevani stil ostalih blokova odgovara danas (0.75rem, #111, levo)", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    for (const blok of ["klijent", "firma", "banka", "rok", "napomena"] as const) {
      expect(stilBloka(sablon, blok)).toEqual({
        color: "#111",
        fontSize: "0.75rem",
        fontFamily: "Arial, Inter, sans-serif",
        textAlign: "left",
      });
    }
  });

  it("uključena pozadina/okvir dodaju background/border i padding", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    sablon.blockProps.klijent.bg = true;
    sablon.blockProps.klijent.border = true;
    const stil = stilBloka(sablon, "klijent");
    expect(stil.background).toBeTruthy();
    expect(stil.border).toBeTruthy();
    expect(stil.padding).toBe("4px 6px");
  });
});

describe("marginePapira, velicinaLoga, oblikLoga - podrazumevano = današnji izgled", () => {
  it("podrazumevane vrednosti (srednje/srednji/kvadrat) daju tačno današnje brojeve", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    expect(marginePapira(sablon)).toBe(32);
    expect(velicinaLoga(sablon)).toBe(44);
    expect(oblikLoga(sablon)).toBe("8px");
  });

  it("druge vrednosti menjaju brojeve razumno", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    sablon.doc.margins = "uske";
    sablon.doc.logoSize = "veliki";
    sablon.doc.logoShape = "krug";
    expect(marginePapira(sablon)).toBe(16);
    expect(velicinaLoga(sablon)).toBe(56);
    expect(oblikLoga(sablon)).toBe("50%");
  });
});

describe("tabela stavki - čiste funkcije (Korak 8d-2)", () => {
  it("podrazumevano: bela boja zaglavlja se tretira kao 'bez pozadine'", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    expect(bojaZaglavljaTabele(sablon)).toBeUndefined();
  });

  it("druga boja zaglavlja se vraća kao stvarna pozadina", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    sablon.table.headerColor = "#EEF8D2";
    expect(bojaZaglavljaTabele(sablon)).toBe("#EEF8D2");
  });

  it("podrazumevani razmak redova odgovara današnjem (8px 10px)", () => {
    expect(razmakRedovaTabele(napraviPodrazumevaniSablonPodatke())).toBe("8px 10px");
  });

  it("podrazumevano ima i spoljašnji okvir i linije između redova (kao danas)", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    expect(imaOkvirTabele(sablon)).toBe(true);
    expect(imaLinijeRedovaTabele(sablon)).toBe(true);
  });

  it("'bez' linija uklanja i okvir i linije redova", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    sablon.table.lines = "bez";
    expect(imaOkvirTabele(sablon)).toBe(false);
    expect(imaLinijeRedovaTabele(sablon)).toBe(false);
  });

  it("definicijeKolonaTabele vraća srpske nazive i tačan iznos", () => {
    const def = definicijeKolonaTabele("sr", "EUR");
    expect(def.opis.label).toBe("OPIS");
    expect(def.iznos.label).toBe("IZNOS EUR");
    expect(def.iznos.get({ desc: "x", qty: 2, price: 50000 })).toBe("1.000,00 €");
  });

  it("definicijeKolonaTabele vraća engleske nazive", () => {
    const def = definicijeKolonaTabele("en", "USD");
    expect(def.opis.label).toBe("DESCRIPTION");
    expect(def.iznos.label).toBe("AMOUNT USD");
  });
});

describe("napraviPodrazumevaniSablonPodatke - pikselska vernost (Korak 8d-2)", () => {
  it("'firma' blok je levo poravnat, širine 210 (ne 'right'/212 iz prototipa)", () => {
    const sablon: PodaciSablona = napraviPodrazumevaniSablonPodatke();
    expect(sablon.blockProps.firma.align).toBe("left");
    expect(sablon.blockProps.firma.w).toBe(210);
  });

  it("'broj' blok je 'veci' (0.875rem), ne 'normal'", () => {
    expect(napraviPodrazumevaniSablonPodatke().blockProps.broj.size).toBe("veci");
  });

  it("boja je #111 svuda (ne #161A17 iz prototipa)", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    for (const blok of Object.keys(sablon.blockProps) as (keyof typeof sablon.blockProps)[]) {
      expect(sablon.blockProps[blok].color).toBe("#111");
    }
  });
});
