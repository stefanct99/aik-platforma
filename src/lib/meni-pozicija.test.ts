import { describe, expect, it } from "vitest";
import { izracunajPozicijuMenija, type Pravougaonik } from "./meni-pozicija";

function dugme(partial: Partial<Pravougaonik>): Pravougaonik {
  return { top: 100, left: 100, right: 132, bottom: 132, ...partial };
}

const PROZOR = { width: 1440, height: 900 };
const MENI = { width: 260, height: 180 };

describe("izracunajPozicijuMenija", () => {
  it("dovoljno mesta ispod dugmeta - otvara se dole, desno poravnato sa dugmetom", () => {
    const poz = izracunajPozicijuMenija(dugme({ top: 100, right: 400, bottom: 132 }), MENI, PROZOR);
    expect(poz.otvorenNagore).toBe(false);
    expect(poz.top).toBe(140); // bottom(132) + razmak(8)
    expect(poz.left).toBe(400 - 260);
  });

  it("nema mesta ispod (poslednji red pri dnu ekrana), ima mesta iznad - otvara se gore", () => {
    const poz = izracunajPozicijuMenija(dugme({ top: 700, right: 400, bottom: 732 }), MENI, PROZOR);
    expect(poz.otvorenNagore).toBe(true);
    expect(poz.top).toBe(700 - 180 - 8);
  });

  it("dugme blizu leve ivice - meni se klampuje na minimalnu udaljenost od leve ivice", () => {
    const poz = izracunajPozicijuMenija(dugme({ top: 100, right: 50, bottom: 132 }), MENI, PROZOR);
    expect(poz.left).toBe(8);
  });

  it("dugme blizu desne ivice - meni ne izlazi van ekrana desno", () => {
    const poz = izracunajPozicijuMenija(dugme({ top: 100, right: 1438, bottom: 132 }), MENI, PROZOR);
    expect(poz.left).toBe(PROZOR.width - MENI.width - 8);
  });

  it("telefon (uska širina) - meni ostaje unutar ekrana i levo i desno", () => {
    const uzakProzor = { width: 390, height: 812 };
    const poz = izracunajPozicijuMenija(dugme({ top: 100, right: 380, bottom: 132 }), MENI, uzakProzor);
    expect(poz.left).toBeGreaterThanOrEqual(8);
    expect(poz.left + MENI.width).toBeLessThanOrEqual(uzakProzor.width - 8 + 0.001);
  });

  it("ni gore ni dole nema dovoljno mesta (meni viši od celog prozora) - ostaje dole, top se ne lomi ispod gornje ivice", () => {
    const nizakProzor = { width: 1440, height: 150 };
    const poz = izracunajPozicijuMenija(dugme({ top: 60, right: 400, bottom: 92 }), MENI, nizakProzor);
    expect(poz.otvorenNagore).toBe(false);
    expect(poz.top).toBeGreaterThanOrEqual(8);
  });

  it("tačno na granici (dole ima TAČNO dovoljno mesta) - ostaje dole, ne prelazi na gore nepotrebno", () => {
    // prostorDole = 900 - 712 = 188, meni.height + razmak = 188 -> nije STROGO manje, pa ostaje dole
    const poz = izracunajPozicijuMenija(dugme({ top: 680, right: 400, bottom: 712 }), MENI, PROZOR);
    expect(poz.otvorenNagore).toBe(false);
  });
});
