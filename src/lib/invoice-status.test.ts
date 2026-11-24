import { describe, expect, it } from "vitest";
import {
  brojDanaKasnjenja,
  efektivniStatus,
  izracunajUkupno,
  jeFakturaKasni,
  rokFakture,
} from "./invoice-status";

describe("izracunajUkupno", () => {
  it("podrazumevana količina 1", () => {
    expect(izracunajUkupno([{ qty: 1, price: 100 }, { qty: 2, price: 50 }])).toBe(200);
  });
});

describe("rokFakture", () => {
  it("rok preko granice meseca (januar ima 31 dan)", () => {
    const rok = rokFakture(new Date("2026-01-31T00:00:00.000Z"), 7);
    expect(rok.toISOString().slice(0, 10)).toBe("2026-02-07");
  });
});

describe("jeFakturaKasni", () => {
  it("nacrt/placena/stornirana nikad ne kasne, bez obzira na datume", () => {
    const izdata = new Date("2020-01-01T00:00:00.000Z");
    const danas = new Date("2030-01-01T00:00:00.000Z");
    expect(jeFakturaKasni("nacrt", izdata, 7, danas)).toBe(false);
    expect(jeFakturaKasni("placena", izdata, 7, danas)).toBe(false);
    expect(jeFakturaKasni("stornirana", izdata, 7, danas)).toBe(false);
  });

  it("granica: tačno na rok nije kasni", () => {
    const izdata = new Date("2026-11-01T00:00:00.000Z");
    const rok = rokFakture(izdata, 7);
    expect(jeFakturaKasni("poslata", izdata, 7, rok)).toBe(false);
  });

  it("granica: dan posle roka jeste kasni", () => {
    const izdata = new Date("2026-11-01T00:00:00.000Z");
    const rok = rokFakture(izdata, 7);
    const danPosle = new Date(rok.getTime() + 86400000);
    expect(jeFakturaKasni("poslata", izdata, 7, danPosle)).toBe(true);
  });
});

describe("efektivniStatus", () => {
  it("samo 'poslata' postaje 'kasni', ostali ostaju nepromenjeni", () => {
    const izdata = new Date("2020-01-01T00:00:00.000Z");
    const danas = new Date("2030-01-01T00:00:00.000Z");
    expect(efektivniStatus("poslata", izdata, 7, danas)).toBe("kasni");
    expect(efektivniStatus("placena", izdata, 7, danas)).toBe("placena");
    expect(efektivniStatus("nacrt", izdata, 7, danas)).toBe("nacrt");
    expect(efektivniStatus("stornirana", izdata, 7, danas)).toBe("stornirana");
  });
});

describe("brojDanaKasnjenja", () => {
  it("nikad negativan (na rok, posle roka, pre roka)", () => {
    const izdata = new Date("2026-11-01T00:00:00.000Z");
    const rok = rokFakture(izdata, 7);
    expect(brojDanaKasnjenja(izdata, 7, rok)).toBe(0);
    expect(brojDanaKasnjenja(izdata, 7, new Date(rok.getTime() + 3 * 86400000))).toBe(3);
    expect(brojDanaKasnjenja(izdata, 7, new Date(rok.getTime() - 2 * 86400000))).toBe(0);
  });

  it("primer iz spec 7.5: rok istekao 09.11.2026, kasni 6 dana od 15.11.2026", () => {
    const izdata = new Date("2026-11-06T00:00:00.000Z");
    const danas = new Date("2026-11-15T00:00:00.000Z");
    expect(brojDanaKasnjenja(izdata, 3, danas)).toBe(6);
  });
});
