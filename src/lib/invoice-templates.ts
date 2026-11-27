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

// Pravilo dodele (Korak 8d-7b, zadatak tačka 1) - PREPISUJE raniji oblik ({domestic}|{currency}|{lang},
// preuzet iz prototipa store.js) jer zadatak sada eksplicitno traži i uslov po KONKRETNIM klijentima
// (prototip ovo nema - prototipov selectors.js samo proverava client.domestic/invoice.currency/invoice.lang,
// nikad listu id-jeva klijenata - izveštaj). Bezbedno je promeniti oblik bez migracije: assignRule se do
// sada nigde stvarno nije upisivalo (uvek Prisma.JsonNull), ni jedan red u bazi ga nema postavljenog.
// "domestic" iz prototipa NIJE zadržan kao poseban uslov - zadatak (tačka 2) ga izričito svodi na PREČICU
// za "valuta: RSD" (naš Client model nema sopstveno polje domestic, ima samo currency po fakturi/klijentu).
export type PraviloDodele =
  | { tip: "klijenti"; klijentId: string[] }
  | { tip: "valuta"; valuta: string }
  | { tip: "jezik"; jezik: "sr" | "en" }
  | null;

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
//
// table.lines: "okvir" (Korak 8d-4b, ISPRAVLJENO sa "horizontalne" iz Koraka 8d-1/8d-2) - "okvir" i
// "horizontalne" su u 8d-2 greškom crtali IDENTIČNO (oba = spoljašnji okvir + linije), pa promena ovde NE
// menja izgled (potvrđeno pikselskim poređenjem) - sad "okvir" ispravno znači i jedno i drugo (današnja
// slika), "horizontalne" samo linije bez spoljašnjeg okvira, "bez" ništa. Frejm Fak25 i pokazuje "Okvir"
// kao izabran za "Moj izgled" - ovo je ujedno i usklađivanje sa frejmom.
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
    table: { cols: ["opis", "iznos"], lines: "okvir", density: "normalno", zebra: false, headerColor: "#ffffff" },
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

// Nazivi blokova za levu listu u editoru (Korak 8d-4, frejm Fak18) - tačno isti tekst i redosled kao
// BLOCK_LABELS u prototipu.
export const NAZIVI_BLOKOVA: Record<BlokKljuc, string> = {
  logo: "Logo",
  datum: "Datum",
  broj: "Broj fakture",
  klijent: "Podaci o klijentu",
  firma: "Podaci o tvojoj firmi",
  banka: "Bankovni podaci",
  stavke: "Tabela stavki",
  ukupno: "Ukupno",
  rok: "Rok plaćanja",
  napomena: "Napomena",
  potpis: "Potpis i pečat",
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

// Spoljašnji okvir tabele - SAMO "okvir" ga ima (Korak 8d-4b: "okvir" i "horizontalne" su ispravljeni da
// budu stvarno različiti, umesto oba isto kao u Koraku 8d-2 - "okvir" sad znači i spoljašnji okvir I
// linije između redova, tačna današnja slika; "horizontalne" samo linije, bez spoljašnjeg okvira).
export function imaOkvirTabele(sablon: PodaciSablona): boolean {
  return sablon.table.lines === "okvir";
}

// Linija između redova - "okvir" i "horizontalne" je imaju, "bez" nema ni to ni spoljašnji okvir.
export function imaLinijeRedovaTabele(sablon: PodaciSablona): boolean {
  return sablon.table.lines === "okvir" || sablon.table.lines === "horizontalne";
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
    // "Jedinica mere" i "Popust" (Korak 8d-4b, tačka 5): InvoiceItem u bazi NEMA ova dva polja (samo
    // desc/qty/price) - NE izmišlja se vrednost (npr. uvek "kom" ili uvek "0%"), kolona ostaje izborljiva
    // (kao u okviru) ali prikazuje "–" dok stvarno polje ne postoji u bazi. Videti izveštaj.
    jm: { label: jezik === "sr" ? "JM" : "UNIT", get: () => "–", poravnanje: "right" },
    cena: {
      label: jezik === "sr" ? "CENA" : "PRICE",
      get: (st) => formatNovacPuno(st.price || 0, valuta),
      poravnanje: "right",
    },
    popust: { label: jezik === "sr" ? "POPUST" : "DISCOUNT", get: () => "–", poravnanje: "right" },
    iznos: {
      label: (jezik === "sr" ? "IZNOS " : "AMOUNT ") + valuta,
      get: (st) => formatNovacPuno((st.qty || 1) * (st.price || 0), valuta),
      poravnanje: "right",
    },
  };
}

// ===================== Uređivanje šablona (Korak 8d-4) =====================
// Čiste funkcije koje iz TRENUTNIH podataka šablona i jedne izmene računaju NOVE podatke - ni jedna ne
// dotiče bazu (to radi src/lib/invoice-templates-db.ts, koji ih poziva pre upisa).

// Uključi/isključi blok (prekidač u levoj listi, Korak 8d-4 tačka 3) - redosled u "blocks" se NE menja
// (prevlačenje mišem za promenu redosleda dolazi u kasnijem koraku).
export function prebaciUkljucenostBloka(sablon: PodaciSablona, blok: BlokKljuc): PodaciSablona {
  const isključen = sablon.blocksOff.includes(blok);
  return {
    ...sablon,
    blocksOff: isključen ? sablon.blocksOff.filter((b) => b !== blok) : [...sablon.blocksOff, blok],
  };
}

export type IzmenaSvojstavaBloka = Partial<SvojstvaBloka>;

// Primeni izmenu na JEDAN blok (desni panel, Korak 8d-4 tačka 5) - ne proverava ispravnost, to radi
// validirajSvojstvaBloka (poziva se pre ovoga, i ponovo na serveru pre upisa).
export function azurirajSvojstvaBloka(
  sablon: PodaciSablona,
  blok: BlokKljuc,
  izmena: IzmenaSvojstavaBloka,
): PodaciSablona {
  return {
    ...sablon,
    blockProps: { ...sablon.blockProps, [blok]: { ...sablon.blockProps[blok], ...izmena } },
  };
}

export type GreskaSvojstavaBloka = Partial<Record<"x" | "y" | "w" | "h", string>>;

// Validacija brojčanih polja (Pozicija X/Y, Širina/Visina) - Pozicija sme da bude bilo koji ceo broj
// (blok sme da ide i van papira, isto kao u prototipu), Širina/Visina moraju biti veće od 0.
export function validirajSvojstvaBloka(izmena: IzmenaSvojstavaBloka): GreskaSvojstavaBloka {
  const greske: GreskaSvojstavaBloka = {};
  for (const polje of ["x", "y"] as const) {
    const v = izmena[polje];
    if (v !== undefined && !Number.isFinite(v)) greske[polje] = "Mora biti ceo broj.";
  }
  for (const polje of ["w", "h"] as const) {
    const v = izmena[polje];
    if (v !== undefined && (!Number.isFinite(v) || v <= 0)) greske[polje] = "Mora biti broj veći od 0.";
  }
  return greske;
}

// ===================== Uređivanje šablona - Tabela i Cela faktura (Korak 8d-4b) =====================

// Nazivi kolona za "Kolone" listu u editoru (Fak25) - isti redosled kao u okviru.
export const NAZIVI_KOLONA_TABELE: Record<KolonaTabele, string> = {
  opis: "Opis",
  kolicina: "Količina",
  jm: "Jedinica mere",
  cena: "Cena",
  popust: "Popust",
  iznos: "Iznos",
};

// Redosled SVIH kolona za prikaz u "Kolone" listi (Fak25: Opis/Količina/Jedinica mere/Cena/Popust/Iznos) -
// fiksan, za razliku od blokova kolone se ne prevlače (ni u okviru ni u prototipu nema te opcije).
export const SVE_KOLONE_TABELE: KolonaTabele[] = ["opis", "kolicina", "jm", "cena", "popust", "iznos"];

// Uključi/isključi jednu kolonu tabele stavki (Fak25 "Kolone").
// Nove kolone se uvek ubacuju na SVOJE mesto u redosledu Opis/Količina/JM/Cena/Popust/Iznos (ne na kraj
// liste, po redosledu klika) - inače bi npr. ponovno uključivanje "Opis" posle "Iznos" prikazalo opis
// POSLE iznosa na fakturi, što izgleda pokvareno.
export function prebaciKolonuTabele(sablon: PodaciSablona, kolona: KolonaTabele): PodaciSablona {
  const ukljucena = sablon.table.cols.includes(kolona);
  return {
    ...sablon,
    table: {
      ...sablon.table,
      cols: ukljucena
        ? sablon.table.cols.filter((c) => c !== kolona)
        : SVE_KOLONE_TABELE.filter((k) => sablon.table.cols.includes(k) || k === kolona),
    },
  };
}

// Izmena ostalih podešavanja tabele stavki (Linije, Razmak redova, Naizmenična boja, Boja zaglavlja).
export function azurirajTabelu(sablon: PodaciSablona, izmena: Partial<PodesavanjaTabele>): PodaciSablona {
  return { ...sablon, table: { ...sablon.table, ...izmena } };
}

// Izmena podešavanja cele fakture (Fak26: fontovi, margine, traka, žig, podnožje, logo).
export function azurirajDokument(sablon: PodaciSablona, izmena: Partial<PodesavanjaDokumenta>): PodaciSablona {
  return { ...sablon, doc: { ...sablon.doc, ...izmena } };
}

// "Boja akcenta" (Fak26) - jedino polje nivoa "Cela faktura" koje NIJE unutar sablon.doc (živi direktno
// na PodaciSablona, isto kao u prototipu).
export function azurirajAkcentBoju(sablon: PodaciSablona, boja: string): PodaciSablona {
  return { ...sablon, accentColor: boja };
}

// ===================== Pravilo dodele šablona (Korak 8d-7b) =====================
// Nijedan frejm ne pokazuje KONTROLE za podešavanje pravila (ni Fak27 ni Fak26 ne sadrže reč "pravilo" ni
// "uslov" nigde) - samo gotove podnaslove u padajućem meniju šablona. Kontrole u panelu "Cela faktura" su
// zato napravljene od postojećih obrazaca iz OVOG istog editora (segmentovano dugme kao "Margine"/
// "Veličina teksta", prekidači kao lista "Blokovi" za više klijenata) - izveštaj.

export const NAZIVI_TIPA_PRAVILA: Record<NonNullable<PraviloDodele>["tip"], string> = {
  klijenti: "Klijent(i)",
  valuta: "Valuta",
  jezik: "Jezik",
};

// Postavlja/menja pravilo dodele TRENUTNO otvorenog šablona - deo istog "Sačuvaj šablon" toka kao
// margine/traka/font (zadatak ne kaže drugačije, a ovo polje živi u istom panelu "Cela faktura"), ne
// menja se odmah kao preimenovanje/postavljanje podrazumevanog (to su radnje u meniju, ne u panelu).
export function azurirajPraviloDodele(sablon: PodaciSablona, pravilo: PraviloDodele): PodaciSablona {
  return { ...sablon, assignRule: pravilo };
}

// Validacija pre čuvanja (zadatak tačka 1: "klijent (jedan ili više)") - prazna lista klijenata ili prazna
// valuta ne znače "bez pravila", nego grešku (korisnik je izabrao tip pravila ali nije dovršio unos).
export function validirajPraviloDodele(pravilo: PraviloDodele): string | null {
  if (!pravilo) return null;
  if (pravilo.tip === "klijenti" && pravilo.klijentId.length === 0) {
    return "Izaberi bar jednog klijenta.";
  }
  if (pravilo.tip === "valuta" && !pravilo.valuta.trim()) {
    return "Izaberi ili upiši valutu.";
  }
  return null;
}

// Podnaslov ispod imena šablona u padajućem meniju (Fak27: "Svi klijenti osim niže" za podrazumevani,
// "Domaći klijenti (RSD)", ime klijenta, "EUR" i slično - zadatak tačka 4). "Domaći klijenti (RSD)" je
// PREČICA (zadatak tačka 2: domaći = valuta RSD), ne poseban tip pravila - ista valuta:"RSD" vrednost,
// samo drugačiji tekst. Za jezik frejm ne pokazuje primer podnaslova - "Fakture na srpskom/engleskom" je
// izveden po istom obrascu kao "Klijenti u <valuta>" (izveštaj). Imena klijenata se razrešavaju iz mape
// (id -> ime) koju poziv prosledi - ovaj fajl ne sme da zna za bazu (videti komentar na vrhu fajla).
export function opisPravilaDodele(
  sablon: { isDefault: boolean; assignRule: PraviloDodele },
  imenaKlijenata: Record<string, string>,
): string | null {
  if (sablon.isDefault) return "Svi klijenti osim niže";
  const pravilo = sablon.assignRule;
  if (!pravilo) return null;
  if (pravilo.tip === "valuta") {
    return pravilo.valuta === "RSD" ? "Domaći klijenti (RSD)" : `Klijenti u ${pravilo.valuta}`;
  }
  if (pravilo.tip === "jezik") {
    return pravilo.jezik === "sr" ? "Fakture na srpskom" : "Fakture na engleskom";
  }
  const imena = pravilo.klijentId.map((id) => imenaKlijenata[id] ?? "(obrisan klijent)");
  return imena.join(", ");
}

export type KriterijumiFakture = { clientId: string | null; currency: string; jezik: "sr" | "en" };

function odgovaraPraviluDodele(pravilo: NonNullable<PraviloDodele>, kriterijumi: KriterijumiFakture): boolean {
  if (pravilo.tip === "klijenti") return !!kriterijumi.clientId && pravilo.klijentId.includes(kriterijumi.clientId);
  if (pravilo.tip === "valuta") return pravilo.valuta === kriterijumi.currency;
  return pravilo.jezik === kriterijumi.jezik;
}

// Bira šablon za fakturu po pravilima dodele (zadatak tačka 3) - JEDINO mesto gde se ova logika računa
// (server za nacrte/PDF/zamrzavanje pri slanju, klijent za uživo pregled u editoru nove fakture dok se
// menja klijent/valuta - zadatak tačka 6 - oba pozivaju OVU istu funkciju, nikad svoju kopiju logike).
// Red prvenstva kad više šablona odgovara (frejm ovo ne precizira - odluka, izveštaj): klijent je
// najprecizniji uslov (imenuje tačne klijente), pa valuta, pa jezik (najširi uslov) - isti redosled kao
// prototipov selectors.js (domestic/client pre currency pre lang). Unutar istog nivoa preciznosti pobeđuje
// RANIJE napravljen šablon (niz "sabloni" mora biti po redosledu kreiranja - videti listaSablonaZaDodelu
// u invoice-templates-db.ts). Ako nijedan ne odgovara, vraća se podrazumevani (uvek postoji tačno jedan).
export function izaberiSablonPoPravilu(sabloni: PodaciSablona[], kriterijumi: KriterijumiFakture): PodaciSablona {
  const saPravilom = sabloni.filter((s) => !s.isDefault && s.assignRule);
  for (const tip of ["klijenti", "valuta", "jezik"] as const) {
    const nadjen = saPravilom.find((s) => s.assignRule?.tip === tip && odgovaraPraviluDodele(s.assignRule!, kriterijumi));
    if (nadjen) return nadjen;
  }
  return sabloni.find((s) => s.isDefault) ?? sabloni[0];
}

// ===================== Dijalog "Raspored" (Korak 8d-6, frejm Fak24) =====================

export type Raspored = PodaciSablona["layout"];

export const NAZIVI_RASPOREDA: Record<Raspored, string> = {
  klasican: "Klasičan",
  moderan: "Moderan, traka sa strane",
  minimalan: "Minimalan",
  kompaktan: "Kompaktan, traka na vrhu",
};

export const SVI_RASPOREDI: Raspored[] = ["klasican", "moderan", "minimalan", "kompaktan"];

// Osnovne pozicije/veličine blokova ("danas", isto što i blockProps u napraviPodrazumevaniSablonPodatke) -
// IZVEDENO iz te funkcije (ne prepisano ručno) da nikad ne mogu da se raziđu. "Primeni raspored" svaki
// put kreće OD OVIH pozicija (ne od trenutnih, možda ručno pomerenih) - to je i traženo ponašanje
// ("blokove koje si ručno pomerio vraćam na njihova mesta", napomena u dijalogu).
const OSNOVNE_POZICIJE_BLOKOVA: Record<BlokKljuc, { x: number; y: number; w: number; h: number }> = (() => {
  const osnovni = napraviPodrazumevaniSablonPodatke().blockProps;
  const pozicije = {} as Record<BlokKljuc, { x: number; y: number; w: number; h: number }>;
  for (const blok of Object.keys(osnovni) as BlokKljuc[]) {
    const p = osnovni[blok];
    pozicije[blok] = { x: p.x, y: p.y, w: p.w, h: p.h };
  }
  return pozicije;
})();

// Presети rasporeda - DIREKTNO iz prototipa (referenca/prototip/js/store.js, window.AIK.TEMPLATE_LAYOUTS):
// Moderan samo pomera sve blokove +14px udesno (da traka sa strane, 10px, ne preklopi sadržaj) i uključuje
// sideBar; Kompaktan ništa ne pomera, samo uključuje topBar; Minimalan ima IDENTIČNE pozicije kao Klasičan
// (prototip ovo priznaje otvoreno - "Minimalan nema frejm-osnovu za drugačiji raspored od Klasičnog pa
// ostaje identičan, iskreno, ne izmišljeno"). Mali pregledi u dijalogu (Fak24) pokazuju razrađeniju
// zamišljenu šemu za Minimalan/Kompaktan, ali to su SAMO ilustrativne sličice opcije u dijalogu, ne stvarni
// raspored koji se primenjuje na fakturu - zadatak izričito traži da se "Primeni raspored" ponašanje
// zasniva na definicijama u prototipu, ne na sličicama (izveštaj).
const PRESETI_RASPOREDA: Record<Raspored, { topBar: boolean; sideBar: boolean; dx: number; dy: number }> = {
  klasican: { topBar: false, sideBar: false, dx: 0, dy: 0 },
  moderan: { topBar: false, sideBar: true, dx: 14, dy: 0 },
  minimalan: { topBar: false, sideBar: false, dx: 0, dy: 0 },
  kompaktan: { topBar: true, sideBar: false, dx: 0, dy: 0 },
};

// Primenjuje raspored: menja SAMO pozicije/veličine blokova (x/y/w/h) i traku sa strane/na vrhu (doc.topBar/
// sideBar) i samo polje "layout". Boje, poravnanje, veličina teksta, font, pozadina/okvir po bloku,
// uključenost blokova, tabela stavki i ostala podešavanja cele fakture ostaju netaknuti ("Tvoji podaci i
// boje ostaju", napomena u dijalogu).
export function primeniRaspored(sablon: PodaciSablona, raspored: Raspored): PodaciSablona {
  const preset = PRESETI_RASPOREDA[raspored];
  const noveBlockProps = { ...sablon.blockProps };
  for (const blok of Object.keys(noveBlockProps) as BlokKljuc[]) {
    const baza = OSNOVNE_POZICIJE_BLOKOVA[blok];
    noveBlockProps[blok] = {
      ...noveBlockProps[blok],
      x: baza.x + preset.dx,
      y: baza.y + preset.dy,
      w: baza.w,
      h: baza.h,
    };
  }
  return {
    ...sablon,
    layout: raspored,
    blockProps: noveBlockProps,
    doc: { ...sablon.doc, topBar: preset.topBar, sideBar: preset.sideBar },
  };
}
