import { describe, expect, it } from "vitest";
import { prviDatumOdPocetka, proveriPonavljanje, sledeciMesecSaDanom } from "./recurring-status";

function d(godina: number, mesec: number, dan: number): Date {
  return new Date(Date.UTC(godina, mesec - 1, dan));
}

describe("sledeciMesecSaDanom", () => {
  it("isti dan, sledeći mesec", () => {
    expect(sledeciMesecSaDanom(d(2026, 11, 1), 1).getTime()).toBe(d(2026, 12, 1).getTime());
  });

  it("dan koji ne postoji u kraćem mesecu se klampuje (31. jan -> 28. feb, 2026 nije prestupna)", () => {
    expect(sledeciMesecSaDanom(d(2026, 1, 31), 31).getTime()).toBe(d(2026, 2, 28).getTime());
  });

  it("klampuje na 29. feb u prestupnoj godini", () => {
    expect(sledeciMesecSaDanom(d(2028, 1, 31), 31).getTime()).toBe(d(2028, 2, 29).getTime());
  });

  it("prelazak godine (decembar -> januar)", () => {
    expect(sledeciMesecSaDanom(d(2026, 12, 15), 15).getTime()).toBe(d(2027, 1, 15).getTime());
  });
});

describe("prviDatumOdPocetka", () => {
  it("kad je dan u mesecu početka još ispred, koristi isti mesec", () => {
    expect(prviDatumOdPocetka(d(2026, 11, 10), 28).getTime()).toBe(d(2026, 11, 28).getTime());
  });

  it("kad je dan u mesecu početka već prošao, prelazi na sledeći mesec", () => {
    expect(prviDatumOdPocetka(d(2026, 11, 10), 1).getTime()).toBe(d(2026, 12, 1).getTime());
  });

  it("budući početak - dan tačno na datum početka", () => {
    expect(prviDatumOdPocetka(d(2027, 3, 1), 1).getTime()).toBe(d(2027, 3, 1).getTime());
  });
});

describe("proveriPonavljanje", () => {
  it("mesečno na zadati dan - due kad je sledeciDatum danas, pomera za tačno mesec dana", () => {
    const r = proveriPonavljanje(
      { danUMesecu: 1, sledeciDatum: d(2026, 12, 1), krajnjiDatum: null, status: "aktivna" },
      d(2026, 12, 1),
    );
    expect(r.trebaGenerisati).toBe(true);
    if (r.trebaGenerisati) {
      expect(r.datumFakture.getTime()).toBe(d(2026, 12, 1).getTime());
      expect(r.noviSledeciDatum.getTime()).toBe(d(2027, 1, 1).getTime());
    }
  });

  it("nije još red - sledeciDatum je u budućnosti", () => {
    const r = proveriPonavljanje(
      { danUMesecu: 1, sledeciDatum: d(2026, 12, 1), krajnjiDatum: null, status: "aktivna" },
      d(2026, 11, 30),
    );
    expect(r.trebaGenerisati).toBe(false);
  });

  it("dan koji ne postoji u kratkim mesecima - 31. jan generiše, sledeći pomeren na 28. feb", () => {
    const r = proveriPonavljanje(
      { danUMesecu: 31, sledeciDatum: d(2026, 1, 31), krajnjiDatum: null, status: "aktivna" },
      d(2026, 1, 31),
    );
    expect(r.trebaGenerisati).toBe(true);
    if (r.trebaGenerisati) expect(r.noviSledeciDatum.getTime()).toBe(d(2026, 2, 28).getTime());
  });

  it("prelazak godine - decembar u januar", () => {
    const r = proveriPonavljanje(
      { danUMesecu: 31, sledeciDatum: d(2026, 12, 31), krajnjiDatum: null, status: "aktivna" },
      d(2026, 12, 31),
    );
    expect(r.trebaGenerisati).toBe(true);
    if (r.trebaGenerisati) expect(r.noviSledeciDatum.getTime()).toBe(d(2027, 1, 31).getTime());
  });

  it("budući početak - prvi sledeciDatum je ispred danas, nije due", () => {
    const r = proveriPonavljanje(
      { danUMesecu: 1, sledeciDatum: d(2027, 3, 1), krajnjiDatum: null, status: "aktivna" },
      d(2026, 12, 1),
    );
    expect(r.trebaGenerisati).toBe(false);
  });

  it("krajnji datum - ciklus NA krajnjem datumu je i dalje due (inkluzivno)", () => {
    const r = proveriPonavljanje(
      { danUMesecu: 1, sledeciDatum: d(2027, 1, 1), krajnjiDatum: d(2027, 1, 1), status: "aktivna" },
      d(2027, 1, 1),
    );
    expect(r.trebaGenerisati).toBe(true);
  });

  it("krajnji datum - ciklus POSLE krajnjeg datuma trajno prestaje", () => {
    const r = proveriPonavljanje(
      { danUMesecu: 1, sledeciDatum: d(2027, 2, 1), krajnjiDatum: d(2027, 1, 1), status: "aktivna" },
      d(2027, 2, 1),
    );
    expect(r.trebaGenerisati).toBe(false);
  });

  it('"Nikad" (krajnjiDatum: null) - nastavlja bez obzira koliko je daleko u budućnosti', () => {
    const r = proveriPonavljanje(
      { danUMesecu: 1, sledeciDatum: d(2030, 1, 1), krajnjiDatum: null, status: "aktivna" },
      d(2030, 1, 1),
    );
    expect(r.trebaGenerisati).toBe(true);
  });

  it("pauzirana - nikad nije due, i kad je sledeciDatum davno prošao", () => {
    const r = proveriPonavljanje(
      { danUMesecu: 1, sledeciDatum: d(2026, 1, 1), krajnjiDatum: null, status: "pauzirana" },
      d(2026, 12, 1),
    );
    expect(r.trebaGenerisati).toBe(false);
  });

  it("nadoknada propuštenih dana - dva uzastopna poziva ne prave duplikat za isti ciklus", () => {
    const danas = d(2026, 12, 15); // tri meseca kasnije od poslednjeg sledeciDatum-a (propušteno)
    const prvi = proveriPonavljanje(
      { danUMesecu: 1, sledeciDatum: d(2026, 10, 1), krajnjiDatum: null, status: "aktivna" },
      danas,
    );
    expect(prvi.trebaGenerisati).toBe(true);
    if (!prvi.trebaGenerisati) return;
    expect(prvi.datumFakture.getTime()).toBe(d(2026, 10, 1).getTime());
    expect(prvi.noviSledeciDatum.getTime()).toBe(d(2026, 11, 1).getTime());

    // Drugi poziv ISTOG dana, nad VEĆ pomerenim stanjem - hvata SLEDEĆI propušteni ciklus (novembar),
    // ne isti (oktobar) opet, i nikad dva odjednom.
    const drugi = proveriPonavljanje(
      { danUMesecu: 1, sledeciDatum: prvi.noviSledeciDatum, krajnjiDatum: null, status: "aktivna" },
      danas,
    );
    expect(drugi.trebaGenerisati).toBe(true);
    if (!drugi.trebaGenerisati) return;
    expect(drugi.datumFakture.getTime()).toBe(d(2026, 11, 1).getTime());
    expect(drugi.noviSledeciDatum.getTime()).toBe(d(2026, 12, 1).getTime());

    // Treći poziv - decembar je TAČNO danas, i dalje due (inkluzivno), pomera na januar.
    const treci = proveriPonavljanje(
      { danUMesecu: 1, sledeciDatum: drugi.noviSledeciDatum, krajnjiDatum: null, status: "aktivna" },
      danas,
    );
    expect(treci.trebaGenerisati).toBe(true);
    if (!treci.trebaGenerisati) return;
    expect(treci.noviSledeciDatum.getTime()).toBe(d(2027, 1, 1).getTime());

    // Četvrti poziv, isti dan - januar je u budućnosti, nema više šta da se generiše. Bez duplikata.
    const cetvrti = proveriPonavljanje(
      { danUMesecu: 1, sledeciDatum: treci.noviSledeciDatum, krajnjiDatum: null, status: "aktivna" },
      danas,
    );
    expect(cetvrti.trebaGenerisati).toBe(false);
  });

  it("slučaj koji TREBA da bude generisan - kontrolni test uz negativne (nije pogrešno uvek false)", () => {
    const r = proveriPonavljanje(
      { danUMesecu: 28, sledeciDatum: d(2026, 11, 28), krajnjiDatum: null, status: "aktivna" },
      d(2026, 11, 28),
    );
    expect(r.trebaGenerisati).toBe(true);
  });
});
