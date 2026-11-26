// Šablon izgleda fakture (Korak 8d-1/8d-2, spec 7.6). Oblik podataka je prepisan DIREKTNO iz prototipa
// (referenca/prototip/js/store.js, window.AIK.DEFAULT_TEMPLATE) - isti ključevi i vrednosti. Ovaj fajl
// drži i SVE čiste funkcije koje iz podataka šablona računaju šta se vidi i kako (InvoiceDoc ih samo
// poziva, ne računa ništa sâm) - lakše se testiraju odvojeno od React-a.
// NAMERNO bez ijednog uvoza iz ./prisma: InvoiceDoc i InvoiceEditor su klijentske komponente i uvoze ovaj
// fajl direktno - uvoz Prisma klijenta ovde bi slomio build (pokušaj da se server-only "pg" paket spakuje
// u browser bandl). Sve što dotiče bazu je u src/lib/invoice-templates-db.ts.
import { formatNovacPuno } from "./money";

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

// Vrednosti blockProps su iz prototipa (store.js, DEFAULT_TEMPLATE), sa ISPRAVKAMA (Korak 8d-2) da bi
// podrazumevani šablon tačno (na pikselu) reprodukovao DANAŠNJI InvoiceDoc, pošto prototip ove vrednosti
// nije tuniralo prema OVOJ aplikaciji nego prema sopstvenom CSS-u:
// - color: "#111" svuda (ne "#161A17" iz prototipa) - InvoiceDoc.module.css (.papir) ima color:#111.
// - broj.size: "veci" (0.875rem), ne "normal" - .brojFakture klasa ima font-size:0.875rem (ne baznih 0.75rem).
// - firma.align: "left" (ne "right" iz prototipa) - .desno kolona nema text-align, tekst je levo poravnat
//   (potvrđeno uživo pre izmene, 26.11.2026).
// - firma.w: 210 (ne 212 iz prototipa) - .desno ima width:210px.
//
// "potpis" (Potpis i pečat) je u prototipu UKLJUČEN po podrazumevanom šablonu, ali današnji InvoiceDoc
// ne crta nikakav red za potpis - zato je ovde stavljen u blocksOff (isključen), da podrazumevani šablon
// ne uvede novi, do sada nepostojeći red na fakturi.
export function napraviPodrazumevaniSablonPodatke(): PodaciSablona {
  return {
    name: "Moj izgled",
    isDefault: true,
    layout: "klasican",
    accentColor: "#0F2A22",
    blocks: ["logo", "datum", "broj", "klijent", "firma", "banka", "stavke", "ukupno", "rok", "napomena", "potpis"],
    blocksOff: ["potpis"],
    blockProps: {
      logo: { x: 32, y: 32, w: 44, h: 44, align: "left", size: "normal", color: "#111", font: "Arial", bg: false, border: false },
      datum: { x: 300, y: 44, w: 116, h: 20, align: "right", size: "normal", color: "#111", font: "Arial", bg: false, border: false },
      broj: { x: 32, y: 96, w: 190, h: 24, align: "left", size: "veci", color: "#111", font: "Arial", bg: false, border: false },
      klijent: { x: 32, y: 128, w: 190, h: 150, align: "left", size: "normal", color: "#111", font: "Arial", bg: false, border: false },
      firma: { x: 238, y: 96, w: 210, h: 232, align: "left", size: "normal", color: "#111", font: "Arial", bg: false, border: false },
      banka: { x: 32, y: 348, w: 416, h: 80, align: "left", size: "normal", color: "#111", font: "Arial", bg: false, border: false },
      stavke: { x: 32, y: 448, w: 416, h: 110, align: "left", size: "normal", color: "#111", font: "Arial", bg: false, border: false },
      ukupno: { x: 32, y: 578, w: 416, h: 42, align: "left", size: "normal", color: "#111", font: "Arial", bg: false, border: false },
      rok: { x: 32, y: 628, w: 300, h: 18, align: "left", size: "normal", color: "#111", font: "Arial", bg: false, border: false },
      napomena: { x: 32, y: 648, w: 300, h: 16, align: "left", size: "normal", color: "#111", font: "Arial", bg: false, border: false },
      potpis: { x: 332, y: 658, w: 84, h: 18, align: "right", size: "manji", color: "#111", font: "Arial", bg: false, border: false },
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

// ===================== Učitavanje šablona (Korak 8d-2) =====================
// Red iz baze (Prisma InvoiceTemplate) u čiste podatke (PodaciSablona) - Json kolone se samo tipski
// prevode, ništa se ne menja.
type InvoiceTemplateRed = {
  name: string;
  isDefault: boolean;
  layout: string;
  accentColor: string;
  blocks: unknown;
  blocksOff: unknown;
  blockProps: unknown;
  table: unknown;
  doc: unknown;
  assignRule: unknown;
};

export function sablonRedUPodatke(red: InvoiceTemplateRed): PodaciSablona {
  return {
    name: red.name,
    isDefault: red.isDefault,
    layout: red.layout as PodaciSablona["layout"],
    accentColor: red.accentColor,
    blocks: red.blocks as BlokKljuc[],
    blocksOff: red.blocksOff as BlokKljuc[],
    blockProps: red.blockProps as Record<BlokKljuc, SvojstvaBloka>,
    table: red.table as PodesavanjaTabele,
    doc: red.doc as PodesavanjaDokumenta,
    assignRule: (red.assignRule ?? null) as PraviloDodele,
  };
}

// ===================== Čiste funkcije za crtanje (Korak 8d-2) =====================
// Sve ispod uzima samo PodaciSablona (plus, gde treba, podatke fakture) i vraća obične vrednosti - bez
// Reacta, bez baze, lako se testira.

// Redosled i uključenost blokova: "blocks" niz je već u ŽELJENOM redosledu (prevuci da promeniš redosled
// u editoru menja baš taj niz), ovde se samo izbacuju isključeni.
export function vidljiviBlokovi(sablon: PodaciSablona): BlokKljuc[] {
  return sablon.blocks.filter((b) => !sablon.blocksOff.includes(b));
}

export function jeBlokVidljiv(sablon: PodaciSablona, blok: BlokKljuc): boolean {
  return vidljiviBlokovi(sablon).includes(blok);
}

// Podskup date grupe blokova (npr. ["broj","klijent"] za levu kolonu), u redosledu iz šablona - tako
// reordering u "Blokovi" listi menja i redosled UNUTAR kolone, ne samo uključenost.
export function poredakUGrupi(sablon: PodaciSablona, grupa: BlokKljuc[]): BlokKljuc[] {
  return vidljiviBlokovi(sablon).filter((b) => grupa.includes(b));
}

const VELICINA_FONTA: Record<SvojstvaBloka["size"], string> = {
  manji: "0.6875rem",
  normal: "0.75rem",
  veci: "0.875rem",
};

export type StilBloka = {
  color: string;
  fontSize: string;
  fontFamily: string;
  textAlign: SvojstvaBloka["align"];
  background?: string;
  border?: string;
  padding?: string;
};

// Stil JEDNOG bloka (boja, veličina, font, poravnanje, pozadina/okvir ako su uključeni) - sadržaj bloka
// (koji tekst, bold, br) ostaje u InvoiceDoc, nepromenjen od pre ovog koraka.
export function stilBloka(sablon: PodaciSablona, blok: BlokKljuc): StilBloka {
  const bp = sablon.blockProps[blok];
  const stil: StilBloka = {
    color: bp.color,
    fontSize: VELICINA_FONTA[bp.size],
    fontFamily: `${bp.font}, Inter, sans-serif`,
    textAlign: bp.align,
  };
  if (bp.bg) {
    stil.background = "rgba(200,241,105,0.14)";
    stil.padding = "4px 6px";
  }
  if (bp.border) {
    stil.border = "1px solid #161A17";
    stil.padding = "4px 6px";
  }
  return stil;
}

const MARGINE_PAPIRA: Record<PodesavanjaDokumenta["margins"], number> = { uske: 16, srednje: 32, siroke: 48 };

// Margina papira (padding oko sadržaja) - "srednje" (podrazumevano) MORA da ostane 32, tačna vrednost iz
// InvoiceDoc.module.css (.papir), da bi podrazumevani šablon bio pikselski identičan današnjem izgledu.
export function marginePapira(sablon: PodaciSablona): number {
  return MARGINE_PAPIRA[sablon.doc.margins];
}

const VELICINA_LOGA: Record<PodesavanjaDokumenta["logoSize"], number> = { mali: 32, srednji: 44, veliki: 56 };

// "srednji" (podrazumevano) MORA da ostane 44, tačna vrednost iz .logo { width:44px; height:44px }.
export function velicinaLoga(sablon: PodaciSablona): number {
  return VELICINA_LOGA[sablon.doc.logoSize];
}

// "kvadrat" (podrazumevano) MORA da ostane 8px, tačna vrednost iz .logo { border-radius:8px }.
export function oblikLoga(sablon: PodaciSablona): string {
  return sablon.doc.logoShape === "krug" ? "50%" : "8px";
}

// Boja zaglavlja tabele: "#ffffff" (podrazumevano) se tretira kao "bez pozadine" (isto kao danas, gde
// zaglavlje nema nikakvu pozadinu), isti uslov kao u prototipu.
export function bojaZaglavljaTabele(sablon: PodaciSablona): string | undefined {
  const c = sablon.table.headerColor;
  return c && c.toLowerCase() !== "#ffffff" ? c : undefined;
}

const RAZMAK_REDOVA: Record<PodesavanjaTabele["density"], string> = {
  gusto: "4px 8px",
  normalno: "8px 10px",
  prostrano: "12px 14px",
};

// "normalno" (podrazumevano) MORA da ostane "8px 10px", tačna vrednost iz .tabelaRed/.tabelaRedZaglavlje.
export function razmakRedovaTabele(sablon: PodaciSablona): string {
  return RAZMAK_REDOVA[sablon.table.density];
}

// Spoljašnji okvir tabele (danas uvek postoji) - samo "bez" ga uklanja.
export function imaOkvirTabele(sablon: PodaciSablona): boolean {
  return sablon.table.lines !== "bez";
}

// Linija između redova (danas uvek postoji, .tabelaRed{border-top}) - "okvir" i "horizontalne" je imaju,
// "bez" nema ni to ni spoljašnji okvir.
export function imaLinijeRedovaTabele(sablon: PodaciSablona): boolean {
  return sablon.table.lines !== "bez";
}

export type DefinicijaKoloneTabele = {
  label: string;
  get: (stavka: { desc: string; qty: number; price: number }) => string;
  poravnanje: "left" | "right";
};

// Definicije SVIH mogućih kolona tabele stavki (opis/količina/jedinica mere/cena/popust/iznos) - koje se
// od njih stvarno prikazuju bira sablon.table.cols (podrazumevano samo opis+iznos, isto kao danas).
export function definicijeKolonaTabele(
  jezik: "sr" | "en",
  valuta: string,
): Record<KolonaTabele, DefinicijaKoloneTabele> {
  return {
    opis: { label: jezik === "sr" ? "OPIS" : "DESCRIPTION", get: (st) => st.desc || "–", poravnanje: "left" },
    kolicina: { label: jezik === "sr" ? "KOL." : "QTY", get: (st) => String(st.qty || 1), poravnanje: "right" },
    jm: { label: "JM", get: () => "kom", poravnanje: "right" },
    cena: {
      label: jezik === "sr" ? "CENA" : "PRICE",
      get: (st) => formatNovacPuno(st.price || 0, valuta),
      poravnanje: "right",
    },
    popust: { label: jezik === "sr" ? "POPUST" : "DISCOUNT", get: () => "0%", poravnanje: "right" },
    iznos: {
      label: (jezik === "sr" ? "IZNOS " : "AMOUNT ") + valuta,
      get: (st) => formatNovacPuno((st.qty || 1) * (st.price || 0), valuta),
      poravnanje: "right",
    },
  };
}
