import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import { saveOnboardingStep1 } from "./business";
import { napraviPodrazumevaniSablonPodatke, osigurajPodrazumevaniSablon } from "./invoice-templates";

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
