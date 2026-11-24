import { describe, expect, it } from "vitest";
import { createZip } from "./zip";

describe("createZip", () => {
  it("počinje potpisom lokalnog zaglavlja i sadrži imena i sadržaj fajlova", () => {
    const zip = createZip([
      { ime: "profil.json", sadrzaj: Buffer.from('{"naziv":"Test Firma"}') },
      { ime: "racuni.json", sadrzaj: Buffer.from("[]") },
    ]);

    expect(zip.readUInt32LE(0)).toBe(0x04034b50);
    expect(zip.includes("profil.json")).toBe(true);
    expect(zip.includes("racuni.json")).toBe(true);
    expect(zip.includes('{"naziv":"Test Firma"}')).toBe(true);
  });

  it("završava se potpisom kraja centralnog direktorijuma, sa tačnim brojem fajlova", () => {
    const ulazi = [
      { ime: "a.json", sadrzaj: Buffer.from("1") },
      { ime: "b.json", sadrzaj: Buffer.from("2") },
      { ime: "c.json", sadrzaj: Buffer.from("3") },
    ];
    const zip = createZip(ulazi);

    const krajPotpisa = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    expect(krajPotpisa).toBeGreaterThan(0);
    expect(zip.readUInt16LE(krajPotpisa + 8)).toBe(ulazi.length);
    expect(zip.readUInt16LE(krajPotpisa + 10)).toBe(ulazi.length);
  });

  it("prazna lista fajlova pravi ispravan (prazan) arhiv", () => {
    const zip = createZip([]);
    expect(zip.length).toBe(22);
    expect(zip.readUInt32LE(0)).toBe(0x06054b50);
  });
});
