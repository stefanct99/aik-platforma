// Šablon izgleda fakture (Korak 8d-1, spec 7.6). Oblik podataka je prepisan DIREKTNO iz prototipa
// (referenca/prototip/js/store.js, window.AIK.DEFAULT_TEMPLATE) - isti ključevi i vrednosti, da bi
// kasniji korak (8d-2, crtanje fakture iz šablona) mogao da prepiše prototipovu logiku umesto da je
// ponovo smišlja. Ovaj fajl NE crta ništa i ne menja izgled fakture - samo priprema podatke za bazu.
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "./prisma";

export type BlokKljuc =
  | "logo"
  | "datum"
  | "broj"
  | "klijent"
  | "firma"
  | "banka"
  | "stavke"
  | "ukupno"
  | "rok"
  | "napomena"
  | "potpis";

export type SvojstvaBloka = {
  x: number;
  y: number;
  w: number;
  h: number;
  align: "left" | "center" | "right";
  size: "manji" | "normal" | "veci";
  color: string;
  font: string;
  bg: boolean;
  border: boolean;
};

export type KolonaTabele = "opis" | "kolicina" | "jm" | "cena" | "popust" | "iznos";

export type PodesavanjaTabele = {
  cols: KolonaTabele[];
  lines: "okvir" | "horizontalne" | "bez";
  density: "gusto" | "normalno" | "prostrano";
  zebra: boolean;
  headerColor: string;
};

export type PodesavanjaDokumenta = {
  titleFont: string;
  textFont: string;
  margins: "uske" | "srednje" | "siroke";
  topBar: boolean;
  sideBar: boolean;
  watermark: string;
  footerText: string;
  logoSize: "mali" | "srednji" | "veliki";
  logoShape: "kvadrat" | "krug";
};

export type PraviloDodele = { domestic: boolean } | { currency: string } | { lang: "sr" | "en" } | null;

export type PodaciSablona = {
  name: string;
  isDefault: boolean;
  layout: "klasican" | "moderan" | "minimalan" | "kompaktan";
  accentColor: string;
  blocks: BlokKljuc[];
  blocksOff: BlokKljuc[];
  blockProps: Record<BlokKljuc, SvojstvaBloka>;
  table: PodesavanjaTabele;
  doc: PodesavanjaDokumenta;
  assignRule: PraviloDodele;
};

// Vrednosti blockProps su iz prototipa (store.js, DEFAULT_TEMPLATE), OSIM "firma.w" (212 -> 210): trenutni
// InvoiceDoc.module.css (.desno) ima width:210px, ne 212px kao u prototipu - 210 je ovde ispravljeno da
// podrazumevani šablon tačno odgovara DANAŠNJEM izgledu fakture (zahtev ovog koraka), ne prototipu.
//
// "potpis" (Potpis i pečat) je u prototipu UKLJUČEN po podrazumevanom šablonu, ali današnji InvoiceDoc
// ne crta nikakav red za potpis - zato je ovde stavljen u blocksOff (isključen), da podrazumevani šablon
// ne uvede novi, do sada nepostojeći red na fakturi. Ovo ostavljeno otvoreno u izveštaju - ako treba da
// bude uključen od početka, lako se promeni kad 8d-2 stvarno počne da crta iz ovih podataka.
export function napraviPodrazumevaniSablonPodatke(): PodaciSablona {
  return {
    name: "Moj izgled",
    isDefault: true,
    layout: "klasican",
    accentColor: "#0F2A22",
    blocks: ["logo", "datum", "broj", "klijent", "firma", "banka", "stavke", "ukupno", "rok", "napomena", "potpis"],
    blocksOff: ["potpis"],
    blockProps: {
      logo: { x: 32, y: 32, w: 44, h: 44, align: "left", size: "normal", color: "#161A17", font: "Arial", bg: false, border: false },
      datum: { x: 300, y: 44, w: 116, h: 20, align: "right", size: "normal", color: "#161A17", font: "Arial", bg: false, border: false },
      broj: { x: 32, y: 96, w: 190, h: 24, align: "left", size: "normal", color: "#161A17", font: "Arial", bg: false, border: false },
      klijent: { x: 32, y: 128, w: 190, h: 150, align: "left", size: "normal", color: "#161A17", font: "Arial", bg: false, border: false },
      firma: { x: 238, y: 96, w: 210, h: 232, align: "right", size: "normal", color: "#161A17", font: "Arial", bg: false, border: false },
      banka: { x: 32, y: 348, w: 416, h: 80, align: "left", size: "normal", color: "#161A17", font: "Arial", bg: false, border: false },
      stavke: { x: 32, y: 448, w: 416, h: 110, align: "left", size: "normal", color: "#161A17", font: "Arial", bg: false, border: false },
      ukupno: { x: 32, y: 578, w: 416, h: 42, align: "left", size: "normal", color: "#161A17", font: "Arial", bg: false, border: false },
      rok: { x: 32, y: 628, w: 300, h: 18, align: "left", size: "normal", color: "#161A17", font: "Arial", bg: false, border: false },
      napomena: { x: 32, y: 648, w: 300, h: 16, align: "left", size: "normal", color: "#161A17", font: "Arial", bg: false, border: false },
      potpis: { x: 332, y: 658, w: 84, h: 18, align: "right", size: "manji", color: "#161A17", font: "Arial", bg: false, border: false },
    },
    table: { cols: ["opis", "iznos"], lines: "horizontalne", density: "normalno", zebra: false, headerColor: "#ffffff" },
    doc: {
      titleFont: "Inter",
      textFont: "Arial",
      margins: "srednje",
      topBar: false,
      sideBar: false,
      watermark: "bez",
      footerText: "",
      logoSize: "srednji",
      logoShape: "kvadrat",
    },
    assignRule: null,
  };
}

// Idempotentno: ako firma već ima podrazumevani šablon, vraća njega (ne pravi drugi). Ovim se - isto kao
// kod BankAccount.isDefault (vidi komentar u schema.prisma) - na nivou aplikacije obezbeđuje da firma
// nikad ne dobije dva podrazumevana šablona, bez posebnog ograničenja u bazi.
export async function osigurajPodrazumevaniSablon(businessId: string) {
  const postojeci = await prisma.invoiceTemplate.findFirst({ where: { businessId, isDefault: true } });
  if (postojeci) return postojeci;

  const podaci = napraviPodrazumevaniSablonPodatke();
  return prisma.invoiceTemplate.create({
    data: { businessId, ...podaci, assignRule: podaci.assignRule ?? Prisma.JsonNull },
  });
}
