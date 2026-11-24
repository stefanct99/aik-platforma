import { describe, expect, it } from "vitest";
import {
  isValidDinarskiRacun,
  isValidIban,
  isValidMb,
  isValidPib,
  isValidSwift,
  isValidZip,
  jePibFormatIspravan,
  normalizujDinarskiRacun,
  sanitizeDigits,
} from "./identifiers";

// Isti testovi kao referenca/prototip/js/rules/identifiers.test.js, prilagođeni za Vitest, plus
// isValidZip (poštanski broj), koji u prototipu nije bio izdvojen u js/rules/.
//
// Tri PIB-a ispod su stvarni, zvanično proverени brojevi iz javnog registra Agencije za privredne
// registre (pretraga.apr.gov.rs, 23.11.2026), korišćeni da se potvrdi kontrolna cifra (ISO 7064 MODUL
// (11,10), videti napomenu u identifiers.ts): Agencija za privredne registre, Telekom Srbija a.d. i
// Kompanija Dunav osiguranje a.d.o.

describe("sanitizeDigits", () => {
  it("uklanja sve osim cifara (razmaci, tačke, crtice iz nalepljenog teksta)", () => {
    expect(sanitizeDigits("112 233 445")).toBe("112233445");
    expect(sanitizeDigits("112-233-445")).toBe("112233445");
    expect(sanitizeDigits("PIB: 112233445")).toBe("112233445");
  });

  it("prazno/null/undefined daje prazan string", () => {
    expect(sanitizeDigits("")).toBe("");
    expect(sanitizeDigits(null)).toBe("");
    expect(sanitizeDigits(undefined)).toBe("");
  });

  it("maxLen seče na tačnu dužinu, i kad je nalepljeno više cifara nego treba", () => {
    expect(sanitizeDigits("1122334455555", 9)).toBe("112233445");
    expect(sanitizeDigits("123", 9)).toBe("123");
  });

  it("bez maxLen ne seče", () => {
    expect(sanitizeDigits("123456789012")).toBe("123456789012");
  });
});

describe("jePibFormatIspravan", () => {
  it("tačno 9 cifara (spec 3.1), bez obzira na kontrolnu cifru", () => {
    expect(jePibFormatIspravan("112233445")).toBe(true);
    expect(jePibFormatIspravan("11223344")).toBe(false);
    expect(jePibFormatIspravan("1122334455")).toBe(false);
    expect(jePibFormatIspravan("11223344a")).toBe(false);
    expect(jePibFormatIspravan("")).toBe(false);
    expect(jePibFormatIspravan(null)).toBe(false);
  });
});

describe("isValidPib", () => {
  it("prihvata stvarne PIB-ove iz zvaničnog registra APR (format i kontrolna cifra)", () => {
    expect(isValidPib("103445385")).toBe(true); // Agencija za privredne registre
    expect(isValidPib("100002887")).toBe(true); // Telekom Srbija a.d.
    expect(isValidPib("100001958")).toBe(true); // Kompanija Dunav osiguranje a.d.o.
  });

  it("odbija ispravan format sa namerno pogrešnom kontrolnom cifrom", () => {
    expect(isValidPib("103445380")).toBe(false);
    expect(isValidPib("100002880")).toBe(false);
  });

  it("odbija pogrešan format", () => {
    expect(isValidPib("11223344")).toBe(false);
    expect(isValidPib("1122334455")).toBe(false);
    expect(isValidPib("11223344a")).toBe(false);
    expect(isValidPib("")).toBe(false);
    expect(isValidPib(null)).toBe(false);
  });
});

describe("isValidMb", () => {
  it("tačno 8 cifara (spec 3.1)", () => {
    expect(isValidMb("66554433")).toBe(true);
    expect(isValidMb("6655443")).toBe(false);
    expect(isValidMb("665544330")).toBe(false);
    expect(isValidMb("")).toBe(false);
    expect(isValidMb(null)).toBe(false);
  });
});

describe("isValidZip", () => {
  it("tačno 5 cifara (spec 3.1, prototip js/onboarding.js Step2)", () => {
    expect(isValidZip("11000")).toBe(true);
    expect(isValidZip("1100")).toBe(false);
    expect(isValidZip("110000")).toBe(false);
    expect(isValidZip("")).toBe(false);
    expect(isValidZip(null)).toBe(false);
  });
});

// Kontrolni broj potvrđen iz zvaničnog izvora ("Sl. glasnik RS" br. 55/2015, tačka 6: ISO 7064 MODUL
// 97 nad 16 cifara banka+račun, x100, mod 97, oduzeto od 98). Test broj "160-0000123456-54" je sam
// izračunat tom formulom (nije iz spoljašnjeg izvora), ne iz frejma - frejmov primer "160-0000123456-78"
// NIJE kontrolno ispravan (frejm je ilustracija, ne stvaran broj računa), videti izveštaj Koraka 7.
describe("isValidDinarskiRacun", () => {
  it("prihvata ispravan broj računa (3-13-2, sopstveno izračunat kontrolni broj)", () => {
    expect(isValidDinarskiRacun("160-0000123456-54")).toBe(true);
  });

  it("odbija pogrešan kontrolni broj", () => {
    expect(isValidDinarskiRacun("160-0000123456-55")).toBe(false);
  });

  it("prihvata i bez vodećih nula u srednjem delu (spec: mogu da se izostave)", () => {
    expect(isValidDinarskiRacun("160-123456-54")).toBe(true);
  });

  it("odbija pogrešan format", () => {
    expect(isValidDinarskiRacun("160-123456")).toBe(false);
    expect(isValidDinarskiRacun("")).toBe(false);
    expect(isValidDinarskiRacun(null)).toBe(false);
  });

  it("normalizujDinarskiRacun dopunjava srednji deo nulama do 18 cifara", () => {
    expect(normalizujDinarskiRacun("160-123456-54")).toBe("160" + "0000000123456" + "54");
  });
});

// Testne IBAN vrednosti su opšte poznati, javno objavljeni primeri (nemačka i britanska banka), ne
// stvarni računi korisnika - standardna praksa za proveru ISO 13616 MOD 97 implementacije.
describe("isValidIban", () => {
  it("prihvata poznate ispravne IBAN primere", () => {
    expect(isValidIban("DE89370400440532013000")).toBe(true);
    expect(isValidIban("GB82WEST12345698765432")).toBe(true);
  });

  it("prihvata i sa razmacima, nezavisno od velikih/malih slova", () => {
    expect(isValidIban("de89 3704 0044 0532 0130 00")).toBe(true);
  });

  it("odbija izmenjenu cifru (kontrolni zbir se ne poklapa)", () => {
    expect(isValidIban("DE89370400440532013001")).toBe(false);
  });

  it("odbija pogrešan format", () => {
    expect(isValidIban("123")).toBe(false);
    expect(isValidIban("")).toBe(false);
    expect(isValidIban(null)).toBe(false);
  });
});

describe("isValidSwift", () => {
  it("prihvata 8 i 11 znakova (ISO 9362)", () => {
    expect(isValidSwift("BANKRSBG")).toBe(true);
    expect(isValidSwift("DEUTDEFF500")).toBe(true);
  });

  it("odbija pogrešnu dužinu ili format", () => {
    expect(isValidSwift("BANK1")).toBe(false);
    expect(isValidSwift("")).toBe(false);
    expect(isValidSwift(null)).toBe(false);
  });
});
