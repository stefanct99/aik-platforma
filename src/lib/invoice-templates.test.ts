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
  prebaciUkljucenostBloka,
  azurirajSvojstvaBloka,
  validirajSvojstvaBloka,
  prebaciKolonuTabele,
  azurirajTabelu,
  azurirajDokument,
  azurirajAkcentBoju,
  primeniRaspored,
  SVI_RASPOREDI,
  type PodaciSablona,
} from "./invoice-templates";
import {
  osigurajPodrazumevaniSablon,
  ucitajPodrazumevaniSablon,
  ucitajSablonZaFakturu,
  sacuvajSablon,
  vratiSablonNaPodrazumevano,
  listaSablona,
  ucitajSablonPoId,
  kreirajSablon,
  duplirajSablon,
  preimenujSablon,
  postaviKaoPodrazumevani,
  obrisiSablon,
  type IzmenaSablona,
} from "./invoice-templates-db";

// Pretvara PUNE podatke šablona (PodaciSablona) u ono što sacuvajSablon očekuje (IzmenaSablona) - koristi
// se u testovima da ne ponavljaju sva polja na svakom pozivu.
function celaIzmena(podaci: PodaciSablona): IzmenaSablona {
  return {
    blocks: podaci.blocks,
    blocksOff: podaci.blocksOff,
    blockProps: podaci.blockProps,
    table: podaci.table,
    doc: podaci.doc,
    accentColor: podaci.accentColor,
    layout: podaci.layout,
  };
}

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

  // Ispravka poravnanja kolona: InvoiceDoc crta stavke kao pravu <table> (ne fleks-redove), pa širinu i
  // poravnanje kolone u zaglavlju/svim redovima garantuje sâm raspoređivač tabela u pregledaču (ista
  // širina kolone svuda) - nema posebne čiste funkcije koja RAČUNA širine. Ono što OVDE jeste čista
  // funkcija i što se da testirati je poravnanje po koloni: Opis mora biti levo, sve brojčane kolone
  // (Količina/JM/Cena/Popust/Iznos) moraju biti desno - isto u zaglavlju i u svim redovima, jer InvoiceDoc
  // za oba koristi IST u "poravnanje" vrednost iz ovog objekta.
  it("poravnanje po koloni je tačno (Opis levo, sve brojčane kolone desno) - isto za zaglavlje i redove", () => {
    const def = definicijeKolonaTabele("sr", "EUR");
    expect(def.opis.poravnanje).toBe("left");
    expect(def.kolicina.poravnanje).toBe("right");
    expect(def.jm.poravnanje).toBe("right");
    expect(def.cena.poravnanje).toBe("right");
    expect(def.popust.poravnanje).toBe("right");
    expect(def.iznos.poravnanje).toBe("right");
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

describe("prebaciUkljucenostBloka - čista funkcija (Korak 8d-4)", () => {
  it("isključuje blok koji je bio uključen", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    const novi = prebaciUkljucenostBloka(sablon, "napomena");
    expect(novi.blocksOff).toContain("napomena");
    expect(sablon.blocksOff).not.toContain("napomena"); // originalni objekat nepromenjen
  });

  it("uključuje blok koji je bio isključen ('potpis' je isključen po podrazumevanom)", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    const novi = prebaciUkljucenostBloka(sablon, "potpis");
    expect(novi.blocksOff).not.toContain("potpis");
  });

  it("ne menja redosled u 'blocks'", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    const novi = prebaciUkljucenostBloka(sablon, "banka");
    expect(novi.blocks).toEqual(sablon.blocks);
  });
});

describe("azurirajSvojstvaBloka - čista funkcija (Korak 8d-4)", () => {
  it("menja SAMO navedena polja jednog bloka, ostale blokove ostavlja netaknute", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    const novi = azurirajSvojstvaBloka(sablon, "firma", { color: "#B4281E", align: "center" });
    expect(novi.blockProps.firma.color).toBe("#B4281E");
    expect(novi.blockProps.firma.align).toBe("center");
    expect(novi.blockProps.firma.x).toBe(sablon.blockProps.firma.x); // ostala polja nepromenjena
    expect(novi.blockProps.banka).toEqual(sablon.blockProps.banka); // drugi blok netaknut
    expect(sablon.blockProps.firma.color).toBe("#111"); // originalni objekat nepromenjen
  });
});

describe("validirajSvojstvaBloka - čista funkcija (Korak 8d-4)", () => {
  it("prihvata ispravnu izmenu bez grešaka", () => {
    expect(validirajSvojstvaBloka({ x: 10, y: -5, w: 100, h: 20 })).toEqual({});
  });

  it("Širina/Visina moraju biti veće od 0", () => {
    const greske = validirajSvojstvaBloka({ w: 0, h: -10 });
    expect(greske.w).toBeTruthy();
    expect(greske.h).toBeTruthy();
  });

  it("Pozicija X/Y sme da bude i negativna (blok sme van papira, kao u prototipu)", () => {
    expect(validirajSvojstvaBloka({ x: -50, y: -20 })).toEqual({});
  });

  it("ne javlja grešku za polja koja nisu deo izmene", () => {
    expect(validirajSvojstvaBloka({ color: "#000" })).toEqual({});
  });
});

describe("imaOkvirTabele / imaLinijeRedovaTabele - 3 odvojena stanja (Korak 8d-4b)", () => {
  it("'okvir' ima i spoljašnji okvir i linije između redova (podrazumevano, tačna današnja slika)", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    expect(sablon.table.lines).toBe("okvir");
    expect(imaOkvirTabele(sablon)).toBe(true);
    expect(imaLinijeRedovaTabele(sablon)).toBe(true);
  });

  it("'horizontalne' ima SAMO linije između redova, bez spoljašnjeg okvira", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    sablon.table.lines = "horizontalne";
    expect(imaOkvirTabele(sablon)).toBe(false);
    expect(imaLinijeRedovaTabele(sablon)).toBe(true);
  });

  it("'bez' nema ni okvir ni linije", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    sablon.table.lines = "bez";
    expect(imaOkvirTabele(sablon)).toBe(false);
    expect(imaLinijeRedovaTabele(sablon)).toBe(false);
  });
});

describe("definicijeKolonaTabele - Jedinica mere i Popust (Korak 8d-4b, podaci ne postoje u bazi)", () => {
  it("JM i Popust prikazuju crticu '–', ne izmišljenu vrednost (nema unit/discount na InvoiceItem)", () => {
    const def = definicijeKolonaTabele("sr", "EUR");
    expect(def.jm.get({ desc: "x", qty: 2, price: 50000 })).toBe("–");
    expect(def.popust.get({ desc: "x", qty: 2, price: 50000 })).toBe("–");
  });
});

describe("prebaciKolonuTabele - čista funkcija (Korak 8d-4b)", () => {
  it("isključuje kolonu koja je bila uključena", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    const novi = prebaciKolonuTabele(sablon, "opis");
    expect(novi.table.cols).not.toContain("opis");
    expect(sablon.table.cols).toContain("opis"); // originalni objekat nepromenjen
  });

  it("uključuje kolonu koja je bila isključena ('kolicina' je isključena po podrazumevanom)", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    const novi = prebaciKolonuTabele(sablon, "kolicina");
    expect(novi.table.cols).toContain("kolicina");
  });

  it("nova kolona ide na SVOJE mesto u redosledu Opis/Količina/JM/Cena/Popust/Iznos, ne na kraj liste", () => {
    let sablon = napraviPodrazumevaniSablonPodatke(); // cols: [opis, iznos]
    sablon = prebaciKolonuTabele(sablon, "cena"); // uključi Cena (ide IZMEĐU jm i popust, posle opis/iznos ostaju ista 2)
    expect(sablon.table.cols).toEqual(["opis", "cena", "iznos"]);
    sablon = prebaciKolonuTabele(sablon, "kolicina"); // uključi Količina (ide ISPRED cene)
    expect(sablon.table.cols).toEqual(["opis", "kolicina", "cena", "iznos"]);
  });
});

describe("azurirajTabelu - čista funkcija (Korak 8d-4b)", () => {
  it("menja samo navedena polja, ostatak šablona netaknut", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    const novi = azurirajTabelu(sablon, { lines: "bez", zebra: true });
    expect(novi.table.lines).toBe("bez");
    expect(novi.table.zebra).toBe(true);
    expect(novi.table.density).toBe(sablon.table.density);
    expect(novi.doc).toEqual(sablon.doc);
    expect(sablon.table.lines).toBe("okvir"); // originalni objekat nepromenjen
  });
});

describe("azurirajDokument - čista funkcija (Korak 8d-4b)", () => {
  it("menja samo navedena polja, ostatak šablona netaknut", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    const novi = azurirajDokument(sablon, { topBar: true, footerText: "Hvala" });
    expect(novi.doc.topBar).toBe(true);
    expect(novi.doc.footerText).toBe("Hvala");
    expect(novi.doc.margins).toBe(sablon.doc.margins);
    expect(novi.table).toEqual(sablon.table);
    expect(sablon.doc.topBar).toBe(false); // originalni objekat nepromenjen
  });
});

describe("azurirajAkcentBoju - čista funkcija (Korak 8d-4b)", () => {
  it("menja accentColor, ostatak šablona netaknut", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    const novi = azurirajAkcentBoju(sablon, "#1F4FBF");
    expect(novi.accentColor).toBe("#1F4FBF");
    expect(novi.table).toEqual(sablon.table);
    expect(sablon.accentColor).toBe("#0F2A22"); // originalni objekat nepromenjen
  });
});

describe("primeniRaspored - čista funkcija (Korak 8d-6)", () => {
  it("Klasičan je jednak podrazumevanom rasporedu (pozicije, topBar, sideBar)", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    const novi = primeniRaspored(sablon, "klasican");
    expect(novi.layout).toBe("klasican");
    expect(novi.blockProps).toEqual(sablon.blockProps);
    expect(novi.doc.topBar).toBe(false);
    expect(novi.doc.sideBar).toBe(false);
  });

  it("Moderan pomera SVE blokove +14px udesno (x), ne menja y/širinu/visinu, uključuje traku sa strane", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    const novi = primeniRaspored(sablon, "moderan");
    expect(novi.layout).toBe("moderan");
    for (const blok of Object.keys(novi.blockProps) as (keyof typeof novi.blockProps)[]) {
      expect(novi.blockProps[blok].x).toBe(sablon.blockProps[blok].x + 14);
      expect(novi.blockProps[blok].y).toBe(sablon.blockProps[blok].y);
      expect(novi.blockProps[blok].w).toBe(sablon.blockProps[blok].w);
      expect(novi.blockProps[blok].h).toBe(sablon.blockProps[blok].h);
    }
    expect(novi.doc.sideBar).toBe(true);
    expect(novi.doc.topBar).toBe(false);
  });

  it("Minimalan ima IDENTIČNE pozicije kao Klasičan (prototip nema osnovu za drugačiji raspored)", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    const novi = primeniRaspored(sablon, "minimalan");
    expect(novi.layout).toBe("minimalan");
    expect(novi.blockProps).toEqual(sablon.blockProps);
    expect(novi.doc.topBar).toBe(false);
    expect(novi.doc.sideBar).toBe(false);
  });

  it("Kompaktan ne pomera pozicije, samo uključuje traku na vrhu", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    const novi = primeniRaspored(sablon, "kompaktan");
    expect(novi.layout).toBe("kompaktan");
    expect(novi.blockProps).toEqual(sablon.blockProps);
    expect(novi.doc.topBar).toBe(true);
    expect(novi.doc.sideBar).toBe(false);
  });

  it("čuva boje, poravnanje, uključenost blokova i podešavanja tabele/cele fakture - menja SAMO pozicije i topBar/sideBar", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    sablon.blockProps.firma.color = "#1F4FBF";
    sablon.blockProps.firma.align = "center";
    sablon.blockProps.firma.x = 999; // ručno pomeren blok
    sablon.blocksOff = ["rok"];
    sablon.table.zebra = true;
    sablon.doc.footerText = "Hvala";
    sablon.accentColor = "#B4281E";

    const novi = primeniRaspored(sablon, "moderan");

    expect(novi.blockProps.firma.color).toBe("#1F4FBF"); // boja ostaje
    expect(novi.blockProps.firma.align).toBe("center"); // poravnanje ostaje
    expect(novi.blockProps.firma.x).not.toBe(999); // ručno pomerena pozicija se VRAĆA na mesto rasporeda
    expect(novi.blocksOff).toEqual(["rok"]); // uključenost bloka ostaje
    expect(novi.table.zebra).toBe(true); // podešavanje tabele ostaje
    expect(novi.doc.footerText).toBe("Hvala"); // podešavanje cele fakture ostaje
    expect(novi.accentColor).toBe("#B4281E"); // boja akcenta ostaje
  });

  it("ne menja originalni objekat prosleđenog šablona (da 'Odustani' sigurno ništa ne menja ako se ne pozove primeniRaspored)", () => {
    const sablon = napraviPodrazumevaniSablonPodatke();
    const kopija = JSON.parse(JSON.stringify(sablon));
    primeniRaspored(sablon, "kompaktan");
    expect(sablon).toEqual(kopija);
  });

  it("SVI_RASPOREDI ima tačno 4 rasporeda, svaki daje validan rezultat", () => {
    expect(SVI_RASPOREDI).toHaveLength(4);
    const sablon = napraviPodrazumevaniSablonPodatke();
    for (const r of SVI_RASPOREDI) {
      expect(primeniRaspored(sablon, r).layout).toBe(r);
    }
  });
});

describe("Ispravka posle testa editora: sačuvana izmena se odmah vidi (tačka 1)", () => {
  it("izmena poravnanja/veličine/boje bloka je odmah vidljiva kroz NOV, nezavisan poziv za učitavanje (kao nova stranica)", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const { id: templateId } = await osigurajPodrazumevaniSablon(biznis.id);
    const podaci = napraviPodrazumevaniSablonPodatke();
    podaci.blockProps.napomena.color = "#B4281E";
    podaci.blockProps.rok.align = "center";
    podaci.blockProps.rok.size = "veci";

    const rezultat = await sacuvajSablon(biznis.id, templateId, celaIzmena(podaci));
    expect(rezultat.ok).toBe(true);

    // Simulira NOVU, nezavisnu posetu stranici (Nova faktura, pregled nacrta, Pošalji ponovo, PDF) - nov
    // poziv ucitajPodrazumevaniSablon, ne ponovna upotreba objekta iz sacuvajSablon.
    const svezeUcitan = await ucitajPodrazumevaniSablon(biznis.id);
    expect(svezeUcitan.blockProps.napomena.color).toBe("#B4281E");
    expect(svezeUcitan.blockProps.rok.align).toBe("center");
    expect(svezeUcitan.blockProps.rok.size).toBe("veci");
  });

  it("isključivanje/uključivanje bloka je odmah vidljivo kroz nov poziv za učitavanje", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const { id: templateId } = await osigurajPodrazumevaniSablon(biznis.id);
    const podaci = napraviPodrazumevaniSablonPodatke();
    const noviBlocksOff = [...podaci.blocksOff, "rok" as const];

    await sacuvajSablon(biznis.id, templateId, { ...celaIzmena(podaci), blocksOff: noviBlocksOff });

    const svezeUcitan = await ucitajPodrazumevaniSablon(biznis.id);
    expect(svezeUcitan.blocksOff).toContain("rok");
  });
});

describe("sacuvajSablon / vratiSablonNaPodrazumevano (Korak 8d-4, server akcija)", () => {
  it("upisuje izmenu bloka u bazu i vraća ažurirane podatke", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const { id: templateId } = await osigurajPodrazumevaniSablon(biznis.id);
    const podaci = napraviPodrazumevaniSablonPodatke();
    podaci.blockProps.napomena.color = "#1F4FBF";

    const rezultat = await sacuvajSablon(biznis.id, templateId, celaIzmena(podaci));
    expect(rezultat.ok).toBe(true);
    if (!rezultat.ok) return;
    expect(rezultat.sablon.blockProps.napomena.color).toBe("#1F4FBF");

    const ucitan = await ucitajSablonZaFakturu({ businessId: biznis.id, templateSnapshot: null });
    expect(ucitan.blockProps.napomena.color).toBe("#1F4FBF");
  });

  it("odbija upis sa neispravnom vrednošću (Širina 0)", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const { id: templateId } = await osigurajPodrazumevaniSablon(biznis.id);
    const podaci = napraviPodrazumevaniSablonPodatke();
    podaci.blockProps.firma.w = 0;

    const rezultat = await sacuvajSablon(biznis.id, templateId, celaIzmena(podaci));
    expect(rezultat.ok).toBe(false);

    // Baza ostaje nepromenjena (ništa nije upisano) kad validacija ne prođe.
    const ucitan = await ucitajSablonZaFakturu({ businessId: biznis.id, templateSnapshot: null });
    expect(ucitan.blockProps.firma.w).toBe(210);
  });

  it("'Vrati na podrazumevano' vraća sve vrednosti na fabrička podešavanja", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const { id: templateId } = await osigurajPodrazumevaniSablon(biznis.id);
    const podaci = napraviPodrazumevaniSablonPodatke();
    podaci.blockProps.napomena.color = "#1F4FBF";
    await sacuvajSablon(biznis.id, templateId, celaIzmena(podaci));

    const vraceno = await vratiSablonNaPodrazumevano(biznis.id, templateId);
    expect(vraceno).toEqual(napraviPodrazumevaniSablonPodatke());

    const ucitan = await ucitajSablonZaFakturu({ businessId: biznis.id, templateSnapshot: null });
    expect(ucitan.blockProps.napomena.color).toBe("#111");
  });

  it("već poslata faktura (sa zamrznutom kopijom) ostaje nepromenjena nakon čuvanja novog šablona", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const klijent = await prisma.client.create({
      data: { businessId: biznis.id, name: "Test klijent", billingEmail: "klijent@primer.rs", address: "Adresa 1" },
    });
    const zamrznutSablon = napraviPodrazumevaniSablonPodatke();
    zamrznutSablon.blockProps.napomena.color = "#8A5A00";
    const faktura = await prisma.invoice.create({
      data: {
        businessId: biznis.id,
        clientId: klijent.id,
        number: "1/26-1",
        currency: "EUR",
        lang: "sr",
        issueDate: new Date("2026-01-01T00:00:00.000Z"),
        dueDays: 7,
        status: "poslata",
        sentAt: new Date("2026-01-01T00:00:00.000Z"),
        templateSnapshot: zamrznutSablon,
      },
    });

    // Sačuvaj SASVIM drugačiji šablon za firmu (simulira korisnika koji menja izgled posle slanja).
    const { id: templateId } = await osigurajPodrazumevaniSablon(biznis.id);
    const noviPodaci = napraviPodrazumevaniSablonPodatke();
    noviPodaci.blockProps.napomena.color = "#1F4FBF";
    await sacuvajSablon(biznis.id, templateId, celaIzmena(noviPodaci));

    const ucitanZaFakturu = await ucitajSablonZaFakturu(faktura);
    expect(ucitanZaFakturu.blockProps.napomena.color).toBe("#8A5A00"); // i dalje zamrznuta boja, ne nova
  });
});

describe("sacuvajSablon - nivoi Tabela i Cela faktura (Korak 8d-4b)", () => {
  it("upisuje izmene tabele i cele fakture, odmah vidljive kroz nov poziv za učitavanje", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const { id: templateId } = await osigurajPodrazumevaniSablon(biznis.id);
    const podaci = napraviPodrazumevaniSablonPodatke();
    podaci.table.cols = ["opis", "kolicina", "iznos"];
    podaci.table.zebra = true;
    podaci.doc.topBar = true;
    podaci.accentColor = "#1F4FBF";

    const rezultat = await sacuvajSablon(biznis.id, templateId, celaIzmena(podaci));
    expect(rezultat.ok).toBe(true);

    const svezeUcitan = await ucitajPodrazumevaniSablon(biznis.id);
    expect(svezeUcitan.table.cols).toEqual(["opis", "kolicina", "iznos"]);
    expect(svezeUcitan.table.zebra).toBe(true);
    expect(svezeUcitan.doc.topBar).toBe(true);
    expect(svezeUcitan.accentColor).toBe("#1F4FBF");
  });

  it("'Vrati na podrazumevano' vraća tabelu, celu fakturu i akcent boju na fabrička podešavanja", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const { id: templateId } = await osigurajPodrazumevaniSablon(biznis.id);
    const podaci = napraviPodrazumevaniSablonPodatke();
    podaci.table.zebra = true;
    podaci.doc.topBar = true;
    podaci.accentColor = "#1F4FBF";
    await sacuvajSablon(biznis.id, templateId, celaIzmena(podaci));

    const vraceno = await vratiSablonNaPodrazumevano(biznis.id, templateId);
    expect(vraceno).toEqual(napraviPodrazumevaniSablonPodatke());
  });

  it("već poslata faktura ostaje nepromenjena nakon izmene tabele/cele fakture", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const klijent = await prisma.client.create({
      data: { businessId: biznis.id, name: "Test klijent", billingEmail: "klijent@primer.rs", address: "Adresa 1" },
    });
    const zamrznutSablon = napraviPodrazumevaniSablonPodatke();
    const faktura = await prisma.invoice.create({
      data: {
        businessId: biznis.id,
        clientId: klijent.id,
        number: "1/26-2",
        currency: "EUR",
        lang: "sr",
        issueDate: new Date("2026-01-01T00:00:00.000Z"),
        dueDays: 7,
        status: "poslata",
        sentAt: new Date("2026-01-01T00:00:00.000Z"),
        templateSnapshot: zamrznutSablon,
      },
    });

    const { id: templateId } = await osigurajPodrazumevaniSablon(biznis.id);
    const noviPodaci = napraviPodrazumevaniSablonPodatke();
    noviPodaci.table.zebra = true;
    noviPodaci.accentColor = "#1F4FBF";
    await sacuvajSablon(biznis.id, templateId, celaIzmena(noviPodaci));

    const ucitanZaFakturu = await ucitajSablonZaFakturu(faktura);
    expect(ucitanZaFakturu.table.zebra).toBe(false);
    expect(ucitanZaFakturu.accentColor).toBe("#0F2A22");
  });
});

describe("sacuvajSablon - raspored (Korak 8d-6)", () => {
  it("upisuje primenjen raspored (layout i pozicije blokova), odmah vidljivo kroz nov poziv za učitavanje", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const { id: templateId } = await osigurajPodrazumevaniSablon(biznis.id);
    const podaci = primeniRaspored(napraviPodrazumevaniSablonPodatke(), "moderan");

    const rezultat = await sacuvajSablon(biznis.id, templateId, celaIzmena(podaci));
    expect(rezultat.ok).toBe(true);

    const svezeUcitan = await ucitajPodrazumevaniSablon(biznis.id);
    expect(svezeUcitan.layout).toBe("moderan");
    expect(svezeUcitan.doc.sideBar).toBe(true);
    expect(svezeUcitan.blockProps.firma.x).toBe(napraviPodrazumevaniSablonPodatke().blockProps.firma.x + 14);
  });

  it("'Vrati na podrazumevano' vraća raspored na Klasičan", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const { id: templateId } = await osigurajPodrazumevaniSablon(biznis.id);
    const podaci = primeniRaspored(napraviPodrazumevaniSablonPodatke(), "kompaktan");
    await sacuvajSablon(biznis.id, templateId, celaIzmena(podaci));

    const vraceno = await vratiSablonNaPodrazumevano(biznis.id, templateId);
    expect(vraceno?.layout).toBe("klasican");
    expect(vraceno?.doc.topBar).toBe(false);
  });

  it("već poslata faktura ostaje nepromenjena nakon promene rasporeda", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const klijent = await prisma.client.create({
      data: { businessId: biznis.id, name: "Test klijent", billingEmail: "klijent@primer.rs", address: "Adresa 1" },
    });
    const zamrznutSablon = napraviPodrazumevaniSablonPodatke();
    const faktura = await prisma.invoice.create({
      data: {
        businessId: biznis.id,
        clientId: klijent.id,
        number: "1/26-3",
        currency: "EUR",
        lang: "sr",
        issueDate: new Date("2026-01-01T00:00:00.000Z"),
        dueDays: 7,
        status: "poslata",
        sentAt: new Date("2026-01-01T00:00:00.000Z"),
        templateSnapshot: zamrznutSablon,
      },
    });

    const { id: templateId } = await osigurajPodrazumevaniSablon(biznis.id);
    const noviPodaci = primeniRaspored(napraviPodrazumevaniSablonPodatke(), "kompaktan");
    await sacuvajSablon(biznis.id, templateId, celaIzmena(noviPodaci));

    const ucitanZaFakturu = await ucitajSablonZaFakturu(faktura);
    expect(ucitanZaFakturu.layout).toBe("klasican");
    expect(ucitanZaFakturu.doc.topBar).toBe(false);
  });
});

describe("Više šablona (Korak 8d-7a, padajući meni 'Šablon: <ime>')", () => {
  it("listaSablona vraća podrazumevani prvi, pa ostale po redosledu pravljenja", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const podrazumevani = await osigurajPodrazumevaniSablon(biznis.id);
    const prvi = await kreirajSablon(biznis.id, "Srpski, dinarske fakture");
    const drugi = await kreirajSablon(biznis.id, "Minimalan, engleski");

    const lista = await listaSablona(biznis.id);
    expect(lista.map((s) => s.id)).toEqual([podrazumevani.id, prvi.id, drugi.id]);
    expect(lista[0]).toEqual({ id: podrazumevani.id, name: "Moj izgled", isDefault: true });
    expect(lista[1].isDefault).toBe(false);
    expect(lista[2].isDefault).toBe(false);
  });

  it("kreirajSablon pravi šablon sa Klasičan izgledom, datim imenom, nikad podrazumevan", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const { sablon } = await kreirajSablon(biznis.id, "Drugi šablon");

    expect(sablon).toEqual({ ...napraviPodrazumevaniSablonPodatke(), name: "Drugi šablon", isDefault: false });
  });

  it("ucitajSablonPoId učitava tačan šablon, i odbija id druge firme (provera vlasništva)", async () => {
    const { biznis: biznisA } = await napraviKorisnikaSaFirmom();
    const { biznis: biznisB } = await napraviKorisnikaSaFirmom();
    const { id } = await kreirajSablon(biznisA.id, "Šablon firme A");

    const ucitanIsteFirme = await ucitajSablonPoId(biznisA.id, id);
    expect(ucitanIsteFirme?.sablon.name).toBe("Šablon firme A");

    const ucitanDrugeFirme = await ucitajSablonPoId(biznisB.id, id);
    expect(ucitanDrugeFirme).toBeNull();
  });

  it("duplirajSablon kopira sve podatke, ime '<ime> (kopija)', nikad podrazumevan (čak ni original)", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const podrazumevani = await osigurajPodrazumevaniSablon(biznis.id);
    const izmena = napraviPodrazumevaniSablonPodatke();
    izmena.accentColor = "#1F4FBF";
    izmena.table.zebra = true;
    await sacuvajSablon(biznis.id, podrazumevani.id, celaIzmena(izmena));

    const kopija = await duplirajSablon(biznis.id, podrazumevani.id);
    expect(kopija?.sablon.name).toBe("Moj izgled (kopija)");
    expect(kopija?.sablon.isDefault).toBe(false);
    expect(kopija?.sablon.accentColor).toBe("#1F4FBF");
    expect(kopija?.sablon.table.zebra).toBe(true);

    const drugaFirma = await napraviKorisnikaSaFirmom();
    expect(await duplirajSablon(drugaFirma.biznis.id, podrazumevani.id)).toBeNull();
  });

  it("preimenujSablon menja samo ime, ostala polja i podrazumevani status ostaju", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const { id } = await osigurajPodrazumevaniSablon(biznis.id);

    const rezultat = await preimenujSablon(biznis.id, id, "Novo ime");
    expect(rezultat?.sablon).toEqual({ ...napraviPodrazumevaniSablonPodatke(), name: "Novo ime" });

    const drugaFirma = await napraviKorisnikaSaFirmom();
    expect(await preimenujSablon(drugaFirma.biznis.id, id, "Tuđe ime")).toBeNull();
  });

  it("postaviKaoPodrazumevani: tačno jedan podrazumevani po firmi, uvek (prebacuje ga sa starog na novi)", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const stari = await osigurajPodrazumevaniSablon(biznis.id);
    const { id: noviId } = await kreirajSablon(biznis.id, "Novi podrazumevani");

    const rezultat = await postaviKaoPodrazumevani(biznis.id, noviId);
    expect(rezultat?.sablon.isDefault).toBe(true);

    const lista = await listaSablona(biznis.id);
    expect(lista.filter((s) => s.isDefault)).toEqual([{ id: noviId, name: "Novi podrazumevani", isDefault: true }]);
    const stariUcitan = await ucitajSablonPoId(biznis.id, stari.id);
    expect(stariUcitan?.sablon.isDefault).toBe(false);
  });

  it("sacuvajSablon i vratiSablonNaPodrazumevano rade na NE-podrazumevanom šablonu, nezavisno od podrazumevanog", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    await osigurajPodrazumevaniSablon(biznis.id); // podrazumevani postoji, ali se ne dira
    const { id: drugiId } = await kreirajSablon(biznis.id, "Drugi šablon");

    const izmena = napraviPodrazumevaniSablonPodatke();
    izmena.accentColor = "#B4281E";
    const sacuvan = await sacuvajSablon(biznis.id, drugiId, celaIzmena(izmena));
    expect(sacuvan.ok).toBe(true);

    // Podrazumevani šablon firme ostaje netaknut (0F2A22, ne B4281E).
    const podrazumevani = await ucitajPodrazumevaniSablon(biznis.id);
    expect(podrazumevani.accentColor).toBe("#0F2A22");

    // "Vrati na podrazumevano" na DRUGOM šablonu vraća njegov izgled, ali čuva NJEGOVO ime i
    // isDefault:false (zadatak 8d-7a tačka 5: "ime i status podrazumevanog ostaju").
    const vraceno = await vratiSablonNaPodrazumevano(biznis.id, drugiId);
    expect(vraceno).toEqual({ ...napraviPodrazumevaniSablonPodatke(), name: "Drugi šablon", isDefault: false });
  });
});

describe("obrisiSablon (Korak 8d-7a dopuna, brisanje šablona)", () => {
  it("briše NE-podrazumevani šablon", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const { id } = await kreirajSablon(biznis.id, "Za brisanje");

    const rezultat = await obrisiSablon(biznis.id, id);
    expect(rezultat).toEqual({ ok: true });

    expect(await ucitajSablonPoId(biznis.id, id)).toBeNull();
    const lista = await listaSablona(biznis.id);
    expect(lista.find((s) => s.id === id)).toBeUndefined();
  });

  it("odbija brisanje PODRAZUMEVANOG šablona, čak i ako je to jedini šablon firme", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const { id } = await osigurajPodrazumevaniSablon(biznis.id);

    const rezultat = await obrisiSablon(biznis.id, id);
    expect(rezultat.ok).toBe(false);
    if (rezultat.ok) throw new Error("ne treba da se desi");
    expect(rezultat.razlog).toBe(
      "Podrazumevani šablon se ne može obrisati. Prvo postavi drugi šablon kao podrazumevani.",
    );

    // Ništa nije obrisano - šablon i dalje postoji, i dalje podrazumevani.
    const ucitan = await ucitajSablonPoId(biznis.id, id);
    expect(ucitan?.sablon.isDefault).toBe(true);
  });

  it("odbija brisanje šablona koji je POSTAO podrazumevani preko postaviKaoPodrazumevani", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const { id: noviId } = await kreirajSablon(biznis.id, "Budući podrazumevani");
    await postaviKaoPodrazumevani(biznis.id, noviId);

    const rezultat = await obrisiSablon(biznis.id, noviId);
    expect(rezultat.ok).toBe(false);
  });

  it("odbija brisanje tuđeg šablona (provera vlasništva) i ne diraju druge firme", async () => {
    const { biznis: biznisA } = await napraviKorisnikaSaFirmom();
    const { biznis: biznisB } = await napraviKorisnikaSaFirmom();
    const { id } = await kreirajSablon(biznisA.id, "Šablon firme A");

    const rezultat = await obrisiSablon(biznisB.id, id);
    expect(rezultat.ok).toBe(false);

    // Nije obrisan - i dalje ga vidi prava firma.
    expect(await ucitajSablonPoId(biznisA.id, id)).not.toBeNull();
  });

  it("brisanje ne dira šablon druge firme ni njen podrazumevani", async () => {
    const { biznis: biznisA } = await napraviKorisnikaSaFirmom();
    const { biznis: biznisB } = await napraviKorisnikaSaFirmom();
    const podrazumevaniB = await osigurajPodrazumevaniSablon(biznisB.id);
    const { id: zaBrisanjeA } = await kreirajSablon(biznisA.id, "Za brisanje A");

    await obrisiSablon(biznisA.id, zaBrisanjeA);

    const ucitanB = await ucitajSablonPoId(biznisB.id, podrazumevaniB.id);
    expect(ucitanB?.sablon.isDefault).toBe(true);
  });

  it("poslata faktura (zamrznuta kopija) ostaje nepromenjena posle brisanja šablona koji je koristila", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const klijent = await prisma.client.create({
      data: { businessId: biznis.id, name: "Test klijent", billingEmail: "klijent@primer.rs", address: "Adresa 1" },
    });
    const { id: obrisivId, sablon: podaciObrisivog } = await kreirajSablon(biznis.id, "Biće obrisan");
    const zamrznutSablon = { ...podaciObrisivog, accentColor: "#8A5A00" };
    const faktura = await prisma.invoice.create({
      data: {
        businessId: biznis.id,
        clientId: klijent.id,
        number: "1/26-4",
        currency: "EUR",
        lang: "sr",
        issueDate: new Date("2026-01-01T00:00:00.000Z"),
        dueDays: 7,
        status: "poslata",
        sentAt: new Date("2026-01-01T00:00:00.000Z"),
        templateSnapshot: zamrznutSablon,
      },
    });

    const rezultat = await obrisiSablon(biznis.id, obrisivId);
    expect(rezultat).toEqual({ ok: true });

    const ucitanZaFakturu = await ucitajSablonZaFakturu(faktura);
    expect(ucitanZaFakturu.accentColor).toBe("#8A5A00"); // i dalje zamrznuta boja, šablon je obrisan ali svejedno ne utiče
  });

  it("nacrt (bez zamrznute kopije) i dalje prati podrazumevani šablon posle brisanja drugog šablona", async () => {
    const { biznis } = await napraviKorisnikaSaFirmom();
    const podrazumevani = await osigurajPodrazumevaniSablon(biznis.id);
    const { id: drugiId } = await kreirajSablon(biznis.id, "Drugi šablon");

    await obrisiSablon(biznis.id, drugiId);

    // Nacrt nema templateSnapshot - ucitajSablonZaFakturu vraća podrazumevani šablon firme, kao i pre
    // brisanja (nacrti ne upućuju na konkretan id šablona, videti komentar u invoice-templates-db.ts).
    const ucitanZaNacrt = await ucitajSablonZaFakturu({ businessId: biznis.id, templateSnapshot: null });
    expect(ucitanZaNacrt.name).toBe("Moj izgled");
    expect(ucitanZaNacrt.isDefault).toBe(true);
    expect(podrazumevani.id).not.toBe(drugiId);
  });
});
